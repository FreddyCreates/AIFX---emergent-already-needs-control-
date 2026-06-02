#!/usr/bin/env node
/**
 * 🏛️ organism-governance-bot — Governance Engine
 * ════════════════════════════════════════════════════════════════════════════
 *
 * The Sovereign Organism's governance runtime. Evaluates CPL-L safety laws
 * against bot events, runs the CPL-P governance pipeline, routes escalations,
 * and produces the governance audit trail + report.
 *
 * Implements the full governance cycle:
 *   1. Collect state from all bot reports
 *   2. Enrich event context with fleet state
 *   3. Apply CPL-L laws → decisions (FORBID/REQUIRE/ALLOW/ESCALATE)
 *   4. Record decisions to audit log
 *   5. Route escalations (GitHub Issues)
 *   6. Feed stats to meta engine
 *   7. Generate governance report
 *
 * Also reads atlas entity registry to validate bot identity before evaluation.
 *
 * Flags:
 *   --event <json>   Process a specific bot event (JSON string or @file)
 *   --full-cycle     Run full governance cycle for all bots
 *   --audit          Print current audit log summary
 *   --report         Generate governance report to docs/
 *
 * Bot Event JSON schema:
 * {
 *   entity_id: "atlas://bot/organism-test-bot",
 *   op: "ci_run_completed",
 *   context: {
 *     status: "failed",
 *     matrix: ["node18","node20","node22"],
 *     failures: 3,
 *     risk_score: 0.8,
 *     health_dashboard: "red"
 *   }
 * }
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Universal Atlas SDK (used for event emission + registry) ──────────────────
const AtlasEvent    = require('../sdk/governance/atlas-event.js');
const atlasRegistry = require('../sdk/governance/atlas-registry.js');

const REPO         = path.resolve(__dirname, '..');
const GOVERNANCE   = path.join(REPO, 'governance');
const DOCS         = path.join(REPO, 'docs');
const REGISTRY_DIR = path.join(GOVERNANCE, 'organism', 'registry', 'entities');
const LAWS_FILE    = path.join(GOVERNANCE, 'laws', 'bot-fleet.cpl-l');
const PIPELINE_FILE = path.join(GOVERNANCE, 'pipelines', 'bot-governance.cpl-p');
const FEEDBACK_DIR = path.join(GOVERNANCE, 'feedback');
const AUDIT_DIR    = path.join(REPO, 'dist', 'governance');
const AUDIT_FILE   = path.join(AUDIT_DIR, 'audit-log.jsonl');
const META_FILE    = path.join(AUDIT_DIR, 'meta-stats.json');
const LAST_CYCLE_FILE = path.join(AUDIT_DIR, 'last-cycle.json');

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

const flags = {
  event:     process.argv.includes('--event'),
  fullCycle: process.argv.includes('--full-cycle'),
  audit:     process.argv.includes('--audit'),
  report:    process.argv.includes('--report'),
};

const eventIdx = process.argv.indexOf('--event');
let rawEvent = null;
if (eventIdx !== -1 && process.argv[eventIdx + 1]) {
  const arg = process.argv[eventIdx + 1];
  if (arg.startsWith('@')) {
    rawEvent = fs.readFileSync(arg.slice(1), 'utf8');
  } else {
    rawEvent = arg;
  }
}

if (!Object.values(flags).some(Boolean)) {
  flags.fullCycle = true;
  flags.report    = true;
}

fs.mkdirSync(AUDIT_DIR, { recursive: true });

// ── Tiny YAML-ish parser (handles the governance files) ────────────────────────
// We don't want to require yaml package. Parse the .cpl-l manually.
function parseLaws(yamlText) {
  // Extract subjects array manually using simple line parsing
  const subjects = [];
  let currentSubject = null;
  let currentRule    = null;
  let inSubjects     = false;
  let inThen         = false;

  const lines = yamlText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trim = line.trim();

    // Skip comments and blank lines
    if (trim.startsWith('#') || trim === '') continue;

    // Track when we enter the subjects: section
    if (trim === 'subjects:') {
      inSubjects = true;
      continue;
    }

    if (!inSubjects) continue;

    // New subject
    const subjectMatch = trim.match(/^- id:\s*"(atlas:\/\/bot\/[^"]+)"/);
    if (subjectMatch) {
      if (currentRule && currentSubject) currentSubject.rules.push(currentRule);
      currentRule = null;
      if (currentSubject) subjects.push(currentSubject);
      currentSubject = { id: subjectMatch[1], rules: [] };
      inThen = false;
      continue;
    }

    if (!currentSubject) continue;

    // New rule
    const ruleMatch = trim.match(/^- name:\s*"([^"]+)"/);
    if (ruleMatch) {
      if (currentRule) currentSubject.rules.push(currentRule);
      currentRule = { name: ruleMatch[1], when: null, then: [] };
      inThen = false;
      continue;
    }

    if (!currentRule) continue;

    if (trim.startsWith('when:')) {
      currentRule.when = trim.replace(/^when:\s*'/, '').replace(/'$/, '').trim();
      inThen = false;
      continue;
    }
    if (trim === 'then:') {
      inThen = true;
      continue;
    }
    if (inThen && trim.startsWith('- action:')) {
      const action = trim.replace(/^- action:\s*["']?/, '').replace(/["']$/, '').trim();
      // Look ahead for target and reason on next lines
      let target = '', reason = '';
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const lt = lines[j].trim();
        if (lt.startsWith('- action:') || lt === 'then:' || lt.startsWith('- name:') || lt.startsWith('- id:')) break;
        const tm = lt.match(/^target:\s*["']?([^"'\n]+)["']?/);
        const rm = lt.match(/^reason:\s*["']?(.+?)["']?$/);
        if (tm) target = tm[1].trim();
        if (rm) reason = rm[1].trim();
      }
      currentRule.then.push({ action, target, reason });
    }
  }

  if (currentRule && currentSubject) currentSubject.rules.push(currentRule);
  if (currentSubject) subjects.push(currentSubject);

  return subjects;
}

// ── Bot Registry ───────────────────────────────────────────────────────────────
function loadRegistry() {
  const registry = {};
  if (!fs.existsSync(REGISTRY_DIR)) return registry;

  const files = fs.readdirSync(REGISTRY_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const entity = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, file), 'utf8'));
      registry[entity.id] = entity;
    } catch { /* skip malformed */ }
  }
  return registry;
}

// ── State Collection ────────────────────────────────────────────────────────────
function collectBotState() {
  const botReports = {};

  const BOT_REPORTS = [
    { bot: 'organism-alpha-bot',     file: 'fleet-report.md' },
    { bot: 'organism-cyber-bot',     file: 'cyber-report.md' },
    { bot: 'organism-cloud-bot',     file: 'cloud-report.md' },
    { bot: 'organism-runtime-bot',   file: 'runtime-report.md' },
    { bot: 'organism-learning-bot',  file: 'learning-report.md' },
    { bot: 'organism-economy-bot',   file: 'economy-dashboard.md' },
    { bot: 'organism-crawler-bot',   file: 'crawler-report.md' },
    { bot: 'organism-sentinel-bot',  file: 'security-report.md' },
    { bot: 'organism-docs-bot',      file: 'architecture-map.md' },
    { bot: 'organism-deps-bot',      file: 'dependency-freshness-report.md' },
    { bot: 'organism-test-bot',      file: 'test-health-dashboard.md' },
    { bot: 'organism-visual-bot',    file: 'visual-regression-report.md' },
    { bot: 'organism-sandcastle-bot', file: 'sandcastle-report.md' },
    { bot: 'organism-intel-bot',     file: 'intel-picture.md' },
    { bot: 'organism-cyber-bot',     file: 'cyber-report.md' },
    { bot: 'organism-cloud-bot',     file: 'cloud-report.md' },
  ];

  let totalPass = 0, totalFail = 0, totalWarn = 0;
  const failedBots = [];

  for (const { bot, file } of BOT_REPORTS) {
    const filePath = path.join(DOCS, file);
    if (!fs.existsSync(filePath)) continue;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const pass = (content.match(/✅/g) || []).length;
      const fail = (content.match(/❌/g) || []).length;
      const warn = (content.match(/⚠|⚠️/g) || []).length;

      totalPass += pass;
      totalFail += fail;
      totalWarn += warn;

      if (fail > 0) failedBots.push(bot);

      // Extract defense score if cyber report
      let defenseScore = null;
      const scoreMatch = content.match(/Overall Posture.*?(\d+)\/100/);
      if (scoreMatch) defenseScore = parseInt(scoreMatch[1]);

      botReports[bot] = { pass, fail, warn, score: pass / (pass + fail + 1), defenseScore };
    } catch { /* skip */ }
  }

  // Fleet health
  const totalChecks = totalPass + totalFail;
  const healthRatio = totalChecks > 0 ? totalPass / totalChecks : 1;
  const fleetHealth = healthRatio >= 0.80 ? 'green' : healthRatio >= 0.50 ? 'yellow' : 'red';

  // Phi-weighted risk score
  const failRatio  = totalChecks > 0 ? totalFail / totalChecks : 0;
  const warnRatio  = totalChecks > 0 ? totalWarn / totalChecks : 0;
  const riskScore  = parseFloat(Math.min(1, failRatio * PHI + warnRatio * PHI_INV).toFixed(4));

  return { botReports, fleetHealth, riskScore, failedBots, totalPass, totalFail, totalWarn };
}

// ── Context Evaluator ─────────────────────────────────────────────────────────
function evaluateCondition(conditionExpr, context) {
  if (!conditionExpr) return false;
  try {
    // Safe evaluation with allowed context variables
    const fn = new Function(
      'context',
      `"use strict"; try { return !!(${conditionExpr}); } catch(e) { return false; }`
    );
    return fn(context);
  } catch {
    return false;
  }
}

// ── CPL-L Evaluation ────────────────────────────────────────────────────────────
function applyCplL(entityId, event, context) {
  const lawText = fs.existsSync(LAWS_FILE)
    ? fs.readFileSync(LAWS_FILE, 'utf8')
    : '';
  const subjects = parseLaws(lawText);

  const subject = subjects.find(s => s.id === entityId);
  if (!subject) return { decisions: [], blocked: false, required: [] };

  const decisions = [];
  let blocked  = false;
  const required = [];

  for (const rule of subject.rules) {
    if (!rule.when) continue;

    // Build rich context for condition evaluation
    const evalCtx = {
      ...context,
      findings: context.findings || [],
      health_dashboard: context.health_dashboard || context.fleetHealth || 'green',
      risk_score: context.risk_score || context.riskScore || 0,
      status: context.status || 'success',
      failures: context.failures || 0,
      matrix: context.matrix || [],
      failed_bots: context.failedBots || [],
      failure_rate: context.matrix?.length > 0
        ? (context.failures || 0) / context.matrix.length
        : 0,
      unhealthy_regions: context.unhealthy_regions || 0,
      healthy_regions: context.healthy_regions || 13,
      defense_score: context.defense_score || context.defenseScore || 100,
      max_weight: context.max_weight || 1,
      min_weight: context.min_weight || 0.1,
      test_status: context.test_status || 'success',
      version_bump: context.version_bump || 'patch',
      severity: context.severity || 'low',
      event: event?.op || 'unknown',
    };

    const triggered = evaluateCondition(rule.when, evalCtx);
    if (!triggered) continue;

    for (const action of rule.then) {
      decisions.push({
        rule:   rule.name,
        action: action.action,
        target: action.target,
        reason: action.reason,
        entity: entityId,
        law:    'governance://law/BOT_FLEET_SAFETY',
      });

      if (action.action === 'FORBID')   blocked = true;
      if (action.action === 'REQUIRE')  required.push(action.target);
    }
  }

  return { decisions, blocked, required };
}

// ── Audit Trail ───────────────────────────────────────────────────────────────
function recordToAuditLog(entry) {
  const line = JSON.stringify({ ...entry, at: new Date().toISOString() });
  fs.appendFileSync(AUDIT_FILE, line + '\n');
  return `audit-${Date.now().toString(36)}`;
}

// ── Meta Stats ────────────────────────────────────────────────────────────────
function updateMetaStats(decisions, blocked, entityId, fleetState) {
  let stats = {};
  if (fs.existsSync(META_FILE)) {
    try { stats = JSON.parse(fs.readFileSync(META_FILE, 'utf8')); } catch { /* reset */ }
  }

  if (!stats.bots) stats.bots = {};
  if (!stats.rules) stats.rules = {};
  if (!stats.cycles) stats.cycles = 0;
  stats.cycles++;

  const botKey = entityId.replace('atlas://bot/', '');
  if (!stats.bots[botKey]) stats.bots[botKey] = { blocked: 0, allowed: 0, escalated: 0, rules_triggered: 0 };

  if (blocked) stats.bots[botKey].blocked++;
  else stats.bots[botKey].allowed++;

  for (const d of decisions) {
    if (d.action === 'ESCALATE') stats.bots[botKey].escalated++;
    stats.bots[botKey].rules_triggered++;

    if (!stats.rules[d.rule]) stats.rules[d.rule] = { triggered: 0, entities: [] };
    stats.rules[d.rule].triggered++;
    if (!stats.rules[d.rule].entities.includes(botKey)) {
      stats.rules[d.rule].entities.push(botKey);
    }
  }

  // Fleet health history
  if (!stats.fleet_health) stats.fleet_health = [];
  stats.fleet_health.push({ ts: Date.now(), status: fleetState?.fleetHealth || 'unknown', risk: fleetState?.riskScore || 0 });
  if (stats.fleet_health.length > 100) stats.fleet_health.shift();

  stats.last_cycle_at = new Date().toISOString();
  fs.writeFileSync(META_FILE, JSON.stringify(stats, null, 2));

  return stats;
}

// ── Governance Report ─────────────────────────────────────────────────────────
function generateReport(allResults, fleetState) {
  fs.mkdirSync(DOCS, { recursive: true });

  const allDecisions = allResults.flatMap(r => r.decisions);
  const allBlocked   = allResults.filter(r => r.blocked).map(r => r.entity);
  const allEscalated = allResults.flatMap(r =>
    r.decisions.filter(d => d.action === 'ESCALATE').map(d => ({ entity: r.entity, target: d.target, reason: d.reason }))
  );
  const allRequired  = allResults.flatMap(r => r.required);

  const scoreIcon = fleetState.fleetHealth === 'green' ? '🟢' :
                    fleetState.fleetHealth === 'yellow' ? '🟡' : '🔴';

  const lines = [
    '# 🏛️ Governance Report',
    '',
    `> Generated by organism-governance-bot on ${new Date().toUTCString()}`,
    '',
    '## Fleet Status',
    '',
    `**${scoreIcon} ${fleetState.fleetHealth.toUpperCase()}** — Risk Score: **${fleetState.riskScore}** | Pass: ${fleetState.totalPass} | Fail: ${fleetState.totalFail} | Warn: ${fleetState.totalWarn}`,
    '',
    '## Governance Decisions',
    '',
    '| Bot | Rule | Action | Target |',
    '|-----|------|--------|--------|',
    ...allDecisions.map(d => {
      const icon = d.action === 'FORBID' ? '🚫' : d.action === 'ESCALATE' ? '🔴' : d.action === 'REQUIRE' ? '⚠️' : '✅';
      return `| ${d.entity.replace('atlas://bot/', '')} | ${d.rule} | ${icon} ${d.action} | ${d.target} |`;
    }),
    ...(allDecisions.length === 0 ? ['| — | — | ✅ ALL CLEAR | — |'] : []),
    '',
    '## Blocked Bots',
    '',
    allBlocked.length > 0
      ? allBlocked.map(b => `- 🚫 ${b.replace('atlas://bot/', '')}`).join('\n')
      : '✅ No bots blocked this cycle',
    '',
    '## Escalations',
    '',
    allEscalated.length > 0
      ? allEscalated.map(e => `- 🔴 **${e.entity.replace('atlas://bot/', '')}** → ${e.target}: ${e.reason}`).join('\n')
      : '✅ No escalations this cycle',
    '',
    '## Required Actions',
    '',
    allRequired.length > 0
      ? allRequired.map(r => `- ⚠️ ${r}`).join('\n')
      : '✅ No required actions this cycle',
    '',
    '## Atlas Registry',
    '',
    `Governance engine loaded **${allResults.length}** bot entities from the atlas registry.`,
    '',
    '## Laws Active',
    '- `governance://law/BOT_FLEET_SAFETY` — Applied to all 21 bots',
    '',
    '## Pipeline',
    '- `pipeline://governance/bot_cycle` — collect_state → apply_laws → route_escalations',
    '',
    '---',
    '*Generated by organism-governance-bot (CPL-L v1.0 / CPL-P v1.0)*',
  ];

  fs.writeFileSync(path.join(DOCS, 'governance-report.md'), lines.join('\n'));
  console.log('  📄 Governance report written to docs/governance-report.md');
  return path.join(DOCS, 'governance-report.md');
}

// ── Feedback Reader ───────────────────────────────────────────────────────────
function readFeedback() {
  if (!fs.existsSync(FEEDBACK_DIR)) return [];
  const files = fs.readdirSync(FEEDBACK_DIR)
    .filter(f => f.startsWith('fb-') && f.endsWith('.yaml'));
  // Parse feedback YAML (simple key: value extraction)
  return files.map(f => {
    const content = fs.readFileSync(path.join(FEEDBACK_DIR, f), 'utf8');
    const id       = content.match(/^id:\s*"([^"]+)"/m)?.[1] || f;
    const actor    = content.match(/^actor:\s*"([^"]+)"/m)?.[1] || '';
    const system   = content.match(/system:\s*"?([^"'\n]+)"?/)?.[1]?.trim() || '';
    const human    = content.match(/human:\s*"?([^"'\n]+)"?/)?.[1]?.trim() || '';
    const rationale = content.match(/^rationale:\s*"?(.+)"?/m)?.[1]?.trim() || '';
    return { id, actor, system, human, rationale, file: f };
  });
}

// ── Full Cycle ────────────────────────────────────────────────────────────────
async function runFullCycle() {
  console.log('\n🏛️ Governance Engine — Full Cycle\n═══════════════════════════════════════════\n');

  // 1. Collect state
  console.log('  ⚙️ Step 1 — Collecting bot state...');
  const fleetState = collectBotState();
  console.log(`    ${fleetState.fleetHealth === 'green' ? '🟢' : fleetState.fleetHealth === 'yellow' ? '🟡' : '🔴'} Fleet health: ${fleetState.fleetHealth.toUpperCase()} | Risk: ${fleetState.riskScore} | Failed bots: ${fleetState.failedBots.length}`);

  // 2. Load registry
  console.log('  ⚙️ Step 2 — Loading atlas registry...');
  const registry = loadRegistry();
  const entities = Object.values(registry);
  console.log(`    📦 ${entities.length} bot entities loaded`);

  // 3. Read feedback
  const feedback = readFeedback();
  if (feedback.length > 0) {
    console.log(`  ⚙️ Feedback — ${feedback.length} human override(s) on record`);
  }

  // 4. Apply CPL-L to each entity
  console.log('  ⚙️ Step 3 — Applying CPL-L laws...');
  const allResults = [];

  for (const entity of entities) {
    const context = {
      fleetHealth:    fleetState.fleetHealth,
      riskScore:      fleetState.riskScore,
      failedBots:     fleetState.failedBots,
      findings:       fleetState.failedBots.map(b => `bot_failed:${b}`),
      status:         fleetState.fleetHealth === 'green' ? 'success' : 'partial',
      failures:       fleetState.totalFail,
      health_dashboard: fleetState.fleetHealth,
      risk_score:     fleetState.riskScore,
      defense_score:  fleetState.botReports['organism-cyber-bot']?.defenseScore || 100,
      ...fleetState.botReports[entity.name],
    };

    const { decisions, blocked, required } = applyCplL(entity.id, null, context);
    allResults.push({ entity: entity.id, decisions, blocked, required });

    if (decisions.length > 0) {
      const icons = decisions.map(d => d.action === 'FORBID' ? '🚫' : d.action === 'ESCALATE' ? '🔴' : '⚠️').join('');
      console.log(`    ${icons} ${entity.name}: ${decisions.map(d => d.rule).join(', ')}`);
    }

    // Record to audit
    if (decisions.length > 0) {
      recordToAuditLog({ entity: entity.id, decisions, blocked, fleetHealth: fleetState.fleetHealth });
    }

    // Update meta stats
    updateMetaStats(decisions, blocked, entity.id, fleetState);
  }

  const totalBlocked   = allResults.filter(r => r.blocked).length;
  const totalEscalated = allResults.flatMap(r => r.decisions.filter(d => d.action === 'ESCALATE')).length;
  console.log(`    ✅ CPL-L applied to ${allResults.length} entities | Blocked: ${totalBlocked} | Escalated: ${totalEscalated}`);

  // Persist last evaluated results so `--report` can render from the same cycle.
  try {
    fs.writeFileSync(
      LAST_CYCLE_FILE,
      JSON.stringify({ at: new Date().toISOString(), allResults, fleetState }, null, 2)
    );
  } catch { /* never let persistence failure break the cycle */ }

  // Emit universal governance event for the atlas cycle to ingest
  try {
    const govEvt = AtlasEvent.bot('organism-governance-bot', 'fleet_governance_cycle_completed', {
      status:         fleetState.fleetHealth === 'green' ? 'success' : 'partial',
      health_dashboard: fleetState.fleetHealth,
      risk_score:     fleetState.riskScore,
      total_entities: allResults.length,
      blocked:        totalBlocked,
      escalated:      totalEscalated,
      findings:       allResults.flatMap(r => r.decisions.filter(d => d.action === 'FORBID').map(d => `${d.rule}@${r.entity.replace('atlas://bot/', '')}`)),
    }, ['governance', 'fleet']);
    govEvt.emit();
  } catch { /* never let event emission break the cycle */ }

  return { allResults, fleetState };
}

// ── Process Single Event ──────────────────────────────────────────────────────
function processEvent(eventJson) {
  let event;
  try { event = JSON.parse(eventJson); } catch {
    console.error('  ❌ Invalid event JSON');
    process.exit(1);
  }

  console.log(`\n🏛️ Governance Engine — Event Processing\n  Entity: ${event.entity_id}\n  Op: ${event.op}\n`);

  const fleetState = collectBotState();
  const context = { ...event.context, fleetHealth: fleetState.fleetHealth, riskScore: fleetState.riskScore, failedBots: fleetState.failedBots };
  const { decisions, blocked, required } = applyCplL(event.entity_id, event, context);

  const auditId = recordToAuditLog({ entity: event.entity_id, op: event.op, decisions, blocked });
  updateMetaStats(decisions, blocked, event.entity_id, fleetState);

  console.log(`  Decisions: ${decisions.length} | Blocked: ${blocked} | Required: ${required.length}`);
  for (const d of decisions) {
    const icon = d.action === 'FORBID' ? '🚫' : d.action === 'ESCALATE' ? '🔴' : '⚠️';
    console.log(`  ${icon} [${d.rule}] ${d.action} → ${d.target}: ${d.reason}`);
  }
  if (decisions.length === 0) console.log('  ✅ All clear — no rules triggered');

  return { decisions, blocked, required, auditId };
}

// ── Audit Summary ─────────────────────────────────────────────────────────────
function printAuditSummary() {
  console.log('\n🏛️ Governance Audit Summary\n═══════════════════════════════════════════\n');

  if (!fs.existsSync(AUDIT_FILE)) {
    console.log('  No audit log found');
    return;
  }

  const lines = fs.readFileSync(AUDIT_FILE, 'utf8').trim().split('\n').filter(Boolean);
  console.log(`  Total entries: ${lines.length}`);

  // Recent 5
  const recent = lines.slice(-5).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  for (const entry of recent) {
    const icon = entry.blocked ? '🚫' : '✅';
    console.log(`  ${icon} ${new Date(entry.at).toISOString()} — ${entry.entity?.replace('atlas://bot/', '')} | decisions: ${entry.decisions?.length || 0}`);
  }

  if (fs.existsSync(META_FILE)) {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    console.log(`\n  Meta cycles: ${meta.cycles || 0}`);
    const blocked = Object.entries(meta.bots || {}).filter(([, v]) => v.blocked > 0);
    if (blocked.length > 0) {
      console.log(`  Most blocked bots:`);
      blocked.sort((a, b) => b[1].blocked - a[1].blocked).slice(0, 5).forEach(([bot, v]) => {
        console.log(`    🚫 ${bot}: ${v.blocked}x blocked`);
      });
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (flags.audit) {
    printAuditSummary();
    return;
  }

  let allResults = [], fleetState = null;

  if (flags.event && rawEvent) {
    processEvent(rawEvent);
  } else if (flags.fullCycle) {
    const result = await runFullCycle();
    allResults = result.allResults;
    fleetState = result.fleetState;
  }

  if (flags.report && fleetState) {
    generateReport(allResults, fleetState);
  } else if (flags.report && !fleetState) {
    // Prefer rendering from the last full-cycle snapshot to avoid overwriting
    // the report with "0 entities" when invoked as a separate phase.
    try {
      if (fs.existsSync(LAST_CYCLE_FILE)) {
        const snap = JSON.parse(fs.readFileSync(LAST_CYCLE_FILE, 'utf8'));
        if (snap && Array.isArray(snap.allResults) && snap.fleetState) {
          generateReport(snap.allResults, snap.fleetState);
          console.log('  📦 Rendered report from dist/governance/last-cycle.json');
          console.log('\n  ✅ Governance cycle complete\n');
          return;
        }
      }
    } catch { /* fall back to report-only mode */ }

    // Fallback: collection-only report
    const fs2 = collectBotState();
    generateReport([], fs2);
  }

  console.log('\n  ✅ Governance cycle complete\n');
}

main().catch(err => {
  console.error('  ❌ Governance engine error:', err.message);
  process.exit(1);
});
