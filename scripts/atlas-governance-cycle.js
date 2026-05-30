#!/usr/bin/env node
/**
 * 🌐 Atlas Universal Governance Cycle
 * ════════════════════════════════════════════════════════════════════════════
 *
 * THE universal governance loop for the entire Atlas universe.
 * Processes every entity class: Bot, Agent, Organism, Engine, Realm, Terminal.
 *
 * Cycle:
 *   0. Initialize — load registry, law engine, memory
 *   1. Ingest    — read all dist/governance/events/*.json
 *   2. Group     — by entity, class, division, domain, tags
 *   3. Apply     — CPL-L laws (all .cpl-l files) per entity
 *   4. Pipeline  — CPL-P per domain (bot, agent, economy, learning, topology)
 *   5. Memory    — update MML, RIL, UEL, audit log
 *   6. Meta      — meta engine reads stats → UEL evolution proposals
 *   7. Organisms — ORACLE narrates, GUARDIAN enforces
 *   8. Feedback  — ingest feedback files from governance/feedback/
 *   9. Report    — write docs/atlas-governance-report.md
 *
 * Flags:
 *   --cycle        Run full universal cycle (default)
 *   --ingest-only  Only ingest events, no law evaluation
 *   --emit-events  Emit synthetic events for all registered entities (testing)
 *   --report       Generate report only from existing stats
 *   --summary      Print current registry + memory summary
 *
 * The governance-engine.js and governance-meta-engine.js still handle
 * bot-specific deep analysis. This script is the universal orchestrator.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs');

// Load the universal SDK
const AtlasEvent    = require('../sdk/governance/atlas-event.js');
const CplLEngine    = require('../sdk/governance/cpl-l-engine.js');
const CplPRunner    = require('../sdk/governance/cpl-p-runner.js');
const atlasMemory   = require('../sdk/governance/atlas-memory.js');
const atlasRegistry = require('../sdk/governance/atlas-registry.js');

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

const flags = {
  cycle:       process.argv.includes('--cycle'),
  ingestOnly:  process.argv.includes('--ingest-only'),
  emitEvents:  process.argv.includes('--emit-events'),
  report:      process.argv.includes('--report'),
  summary:     process.argv.includes('--summary'),
};
if (!Object.values(flags).some(Boolean)) flags.cycle = true;

// Classify atlas URI to pipeline domain
function entityToDomain(entityId = '') {
  if (entityId.startsWith('atlas://bot/')) {
    const name = entityId.replace('atlas://bot/', '');
    if (name.includes('economy'))  return 'economy';
    if (name.includes('learning')) return 'learning';
    return 'bot';
  }
  if (entityId.startsWith('atlas://agent/'))    return 'agent';
  if (entityId.startsWith('atlas://organism/')) return 'topology';
  if (entityId.startsWith('atlas://engine/'))   return 'topology';
  if (entityId.startsWith('atlas://realm/'))    return 'topology';
  return 'default';
}

// ── Step 0 — Initialize ──────────────────────────────────────────────────────

function initialize() {
  console.log('\n🌐 Atlas Universal Governance Cycle\n═══════════════════════════════════════════\n');
  console.log('  ⚙️ Step 0 — Initialize');

  atlasRegistry.load();
  const summary = atlasRegistry.summary();
  console.log(`    📦 Registry: ${summary.total} entities across ${Object.keys(summary.byClass).length} classes`);
  for (const [cls, names] of Object.entries(summary.byClass)) {
    console.log(`       ${cls}: ${names.length}`);
  }

  return { registry: atlasRegistry };
}

// ── Step 1 — Ingest Events ────────────────────────────────────────────────────

function ingestEvents() {
  console.log('  ⚙️ Step 1 — Ingest events');
  const { all, byEntity, byClass, byTag } = AtlasEvent.ingest();
  console.log(`    📡 ${all.length} event(s) found across ${byEntity.size} entities`);

  for (const [cls, evts] of byClass.entries()) {
    if (evts.length > 0) console.log(`       ${cls}: ${evts.length} event(s)`);
  }
  return { events: all, byEntity, byClass, byTag };
}

// ── Step 2 — Group ───────────────────────────────────────────────────────────

function groupEvents(events) {
  console.log('  ⚙️ Step 2 — Group by domain');

  const byDomain = {};
  for (const evt of events) {
    const domain = entityToDomain(evt.entity_id);
    if (!byDomain[domain]) byDomain[domain] = [];
    byDomain[domain].push(evt);
  }

  for (const [domain, evts] of Object.entries(byDomain)) {
    console.log(`    📂 ${domain}: ${evts.length} event(s)`);
  }
  return byDomain;
}

// ── Step 3 — Apply Laws ──────────────────────────────────────────────────────

function applyAllLaws(events) {
  console.log('  ⚙️ Step 3 — Apply CPL-L laws (all domains)');

  const engine = new CplLEngine();  // loads all .cpl-l from governance/laws/

  // Build entity map
  const entityMap = new Map();
  for (const entity of atlasRegistry.all()) {
    entityMap.set(entity.id, entity);
  }

  const allResults = [];
  let totalDecisions = 0, totalBlocked = 0, totalEscalated = 0;

  for (const evt of events) {
    const entity  = entityMap.get(evt.entity_id) || null;
    const context = {
      ...evt.context,
      entity_id: evt.entity_id,
      op:        evt.op,
      tags:      evt.tags || [],
    };

    const result = engine.apply(evt.entity_id, entity, evt, context);
    result.event_id   = evt.id;
    result.entity_id  = evt.entity_id;
    result.op         = evt.op;
    result.domain     = entityToDomain(evt.entity_id);

    allResults.push(result);
    totalDecisions += result.decisions.length;
    if (result.blocked)             totalBlocked++;
    if (result.escalations.length)  totalEscalated++;

    // Audit + memory
    if (result.decisions.length > 0) {
      atlasMemory.appendAudit({
        entity: evt.entity_id, op: evt.op, decisions: result.decisions, blocked: result.blocked,
      });
      atlasMemory.recordLawStats({
        decisions:  result.decisions,
        entityId:   evt.entity_id,
        blocked:    result.blocked,
        domain:     result.domain,
      });

      // Log incidents for FORBID decisions
      for (const d of result.decisions.filter(x => x.action === 'FORBID')) {
        atlasMemory.recordIncident({
          entity_id: evt.entity_id,
          cause:     `${d.law}#${d.rule}`,
          severity:  'medium',
          context:   { target: d.target, reason: d.reason },
        });
      }

      const icons = result.decisions.map(d =>
        d.action === 'FORBID' ? '🚫' : d.action === 'ESCALATE' ? '🔴' : '⚠️'
      ).join('');
      console.log(`    ${icons} ${evt.entity_id.replace('atlas://', '')} [${evt.op}]: ${result.decisions.map(d => d.rule).join(', ')}`);
    }
  }

  console.log(`    ✅ Laws applied to ${events.length} event(s) | Decisions: ${totalDecisions} | Blocked: ${totalBlocked} | Escalated: ${totalEscalated}`);

  return { allResults, totalDecisions, totalBlocked, totalEscalated };
}

// ── Step 4 — Run Pipelines ───────────────────────────────────────────────────

async function runPipelines(byDomain, allResults) {
  console.log('  ⚙️ Step 4 — Run CPL-P domain pipelines');

  const runners = CplPRunner.loadAll();
  const pipelineResults = {};

  for (const [domain, events] of Object.entries(byDomain)) {
    const runner = runners.get(domain) || runners.get('bot') || runners.get('bot-governance');
    if (!runner) { console.log(`    ⚠️ No pipeline for domain: ${domain}`); continue; }

    const meta = runner.metadata();
    const domainResults = allResults.filter(r => r.domain === domain);
    const blocked    = domainResults.some(r => r.blocked);
    const escalated  = domainResults.flatMap(r => r.escalations).length > 0;
    const riskScore  = domainResults.reduce((s, r) => s + (r.decisions.length > 0 ? 0.3 : 0), 0) / Math.max(1, domainResults.length);

    const pipelineCtx = {
      domain, events, blocked, escalated, risk_score: riskScore,
      has_forbid: domainResults.some(r => r.decisions.some(d => d.action === 'FORBID')),
      has_allow:  domainResults.some(r => r.decisions.some(d => d.action === 'ALLOW')),
      decisions:  domainResults.flatMap(r => r.decisions),
    };

    try {
      const result = await runner.run(pipelineCtx);
      pipelineResults[domain] = result;

      atlasMemory.recordPipelineStats({
        pipelineId: meta.id || `pipeline://${domain}`,
        result,
        domain,
      });

      const branches = result.context?.branches_triggered || [];
      const icon = result.context?.errors?.length > 0 ? '⚠️' : '✅';
      console.log(`    ${icon} [${domain}] pipeline: steps=${result.context?.steps_run?.length || 0}, branches=${branches.join(',') || 'none'}`);
    } catch (err) {
      console.log(`    ❌ [${domain}] pipeline error: ${err.message}`);
    }
  }

  return pipelineResults;
}

// ── Step 5-6 — Meta Engine ────────────────────────────────────────────────────

function runMetaAnalysis() {
  console.log('  ⚙️ Step 5-6 — Meta analysis + UEL evolution rules');

  const mml = atlasMemory.mmlSnapshot();
  const incidents = atlasMemory.incidentPatterns();

  const proposals = [];

  // Pattern: entity blocked in > 60% of cycles
  for (const [entityId, data] of Object.entries(mml.entities || {})) {
    const total = data.blocked + data.allowed;
    if (total < 3) continue;
    const blockRate = data.blocked / total;
    if (blockRate > PHI_INV) {
      const proposal = {
        id:          `uel-overblocked-${entityId.replace(/[^a-z0-9-]/gi, '-')}`,
        type:        'LAW_TOO_STRICT',
        description: `"${entityId}" blocked in ${Math.round(blockRate * 100)}% of cycles — law condition may be too broad`,
        suggestion:  `Review FORBID rules for ${entityId} and add context exceptions`,
        source:      'meta_engine',
        metric:      { blockRate, total },
      };
      proposals.push(proposal);
      atlasMemory.addEvolutionRule(proposal);
    }
  }

  // Pattern: domain pipeline escalating frequently
  const ps = atlasMemory.pipelineSnapshot();
  for (const [pipelineId, data] of Object.entries(ps.pipelines || {})) {
    const escRate = data.escalations / Math.max(1, data.runs);
    if (escRate > 0.3 && data.runs >= 3) {
      const proposal = {
        id:          `uel-escalation-${pipelineId.replace(/[^a-z0-9-]/gi, '-')}`,
        type:        'FREQUENT_ESCALATION',
        description: `Pipeline "${pipelineId}" escalates in ${Math.round(escRate * 100)}% of runs`,
        suggestion:  `Consider adding automated pre-screening step before escalation threshold`,
        source:      'meta_engine',
        metric:      { escRate, runs: data.runs },
      };
      proposals.push(proposal);
      atlasMemory.addEvolutionRule(proposal);
    }
  }

  // Pattern: recurring incidents
  const topIncidents = incidents.slice(0, 5);
  for (const inc of topIncidents) {
    if (inc.count >= 3) {
      const proposal = {
        id:          `uel-incident-${inc.cause.replace(/[^a-z0-9-]/gi, '-')}`,
        type:        'RECURRING_INCIDENT',
        description: `Cause "${inc.cause}" has occurred ${inc.count} times across ${inc.entities.length} entities`,
        suggestion:  `Create a new law rule or automated remediation for "${inc.cause}"`,
        source:      'meta_engine',
        metric:      { count: inc.count, entities: inc.entities },
      };
      proposals.push(proposal);
      atlasMemory.addEvolutionRule(proposal);
    }
  }

  console.log(`    💡 ${proposals.length} UEL proposals generated/updated`);
  return proposals;
}

// ── Step 7 — Organism Narration ──────────────────────────────────────────────

function runOrganismNarration(allResults, uelProposals) {
  console.log('  ⚙️ Step 7 — Organism narration (ORACLE / GUARDIAN)');

  const violations = allResults.filter(r => r.blocked || r.escalations.length > 0);
  const guardianSummary = violations.length === 0
    ? '✅ GUARDIAN: No violations detected this cycle. All entities within safety bounds.'
    : `🛡️ GUARDIAN: ${violations.length} violation(s) detected:\n` +
      violations.map(v =>
        `  • ${v.entity_id.replace('atlas://', '')} — ${v.decisions.filter(d => d.action === 'FORBID').map(d => d.rule).join(', ')}`
      ).join('\n');

  const oracleSummary = uelProposals.length === 0
    ? '🔮 ORACLE: Governance operating nominally. No evolution proposals this cycle.'
    : `🔮 ORACLE: ${uelProposals.length} evolution proposal(s):\n` +
      uelProposals.slice(0, 5).map(p => `  • [${p.type}] ${p.description.slice(0, 80)}`).join('\n');

  console.log(`    ${guardianSummary.slice(0, 100)}`);
  console.log(`    ${oracleSummary.slice(0, 100)}`);
  return { guardianSummary, oracleSummary };
}

// ── Step 8 — Ingest Feedback ─────────────────────────────────────────────────

function ingestFeedback() {
  const feedbackDir = path.join(REPO, 'governance', 'feedback');
  if (!fs.existsSync(feedbackDir)) return [];

  const files = fs.readdirSync(feedbackDir).filter(f => f.startsWith('fb-') && f.endsWith('.yaml'));
  if (files.length === 0) return [];

  console.log(`  ⚙️ Step 8 — Ingest ${files.length} human feedback file(s)`);
  return files.map(f => {
    const content = fs.readFileSync(path.join(feedbackDir, f), 'utf8');
    const id      = content.match(/^id:\s*"([^"]+)"/m)?.[1] || f;
    const rule    = content.match(/rule_name:\s*"([^"]+)"/)?.[1] || '';
    const system  = content.match(/system:\s*"?([A-Z]+)"?/)?.[1] || '';
    const human   = content.match(/human:\s*"?([A-Z]+)"?/)?.[1] || '';
    // Record override as evolution signal
    if (system === 'FORBID' && human === 'ALLOW') {
      atlasMemory.addEvolutionRule({
        id:          `uel-feedback-${id}`,
        type:        'HUMAN_OVERRIDE',
        description: `Human overrode ${rule}: FORBID → ALLOW`,
        suggestion:  `Consider relaxing rule "${rule}" — repeated overrides indicate false positives`,
        source:      'human_feedback',
        metric:      { feedback_id: id },
      });
    }
    return { id, rule, system, human, file: f };
  });
}

// ── Step 9 — Universal Report ─────────────────────────────────────────────────

function generateUniversalReport(allResults, byDomain, uelProposals, narration, feedback) {
  console.log('  ⚙️ Step 9 — Generate Atlas governance report');
  fs.mkdirSync(DOCS, { recursive: true });

  const mml    = atlasMemory.mmlSnapshot();
  const ps     = atlasMemory.pipelineSnapshot();
  const uel    = atlasMemory.evolutionRules();
  const incidents = atlasMemory.incidentPatterns().slice(0, 10);

  const domainList = [...new Set(allResults.map(r => r.domain))];
  const allDecisions = allResults.flatMap(r => r.decisions);
  const blocked    = allResults.filter(r => r.blocked).length;
  const escalated  = allResults.flatMap(r => r.escalations).length;

  const lines = [
    '# 🌐 Atlas Universal Governance Report',
    '',
    `> Generated by atlas-governance-cycle.js on ${new Date().toUTCString()}`,
    '',
    '## 📊 Cycle Summary',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Events Processed | ${allResults.length} |`,
    `| Domains Governed | ${domainList.join(', ')} |`,
    `| Total Decisions | ${allDecisions.length} |`,
    `| Entities Blocked | ${blocked} |`,
    `| Escalations | ${escalated} |`,
    `| UEL Proposals | ${uelProposals.length} |`,
    `| Human Feedbacks | ${feedback.length} |`,
    `| Total Registry Entities | ${atlasRegistry.size()} |`,
    '',
    '## 🏛️ Law Decisions',
    '',
    allDecisions.length === 0
      ? '✅ No law violations this cycle.'
      : '| Entity | Law | Rule | Action | Target |\n|--------|-----|------|--------|--------|\n' +
        allDecisions.map(d => {
          const icon = d.action === 'FORBID' ? '🚫' : d.action === 'ESCALATE' ? '🔴' : '⚠️';
          return `| ${d.entity?.replace('atlas://', '')} | ${d.law} | ${d.rule} | ${icon} ${d.action} | ${d.target} |`;
        }).join('\n'),
    '',
    '## 🔄 Pipeline Results',
    '',
    '| Domain | Pipeline | Runs | Escalations |',
    '|--------|----------|------|-------------|',
    ...Object.entries(ps.pipelines || {}).map(([pid, p]) =>
      `| ${p.domain} | ${pid} | ${p.runs} | ${p.escalations} |`
    ),
    ...(Object.keys(ps.pipelines || {}).length === 0 ? ['| — | — | 0 | — |'] : []),
    '',
    '## 🔮 ORACLE / GUARDIAN',
    '',
    narration.oracleSummary,
    '',
    narration.guardianSummary,
    '',
    '## 💡 UEL Evolution Proposals',
    '',
    uel.length === 0
      ? '✅ No evolution proposals.'
      : uel.slice(-10).map(r => `- **[${r.type}]** ${r.description}\n  → ${r.suggestion}`).join('\n\n'),
    '',
    '## 🔴 Incident Patterns (RIL)',
    '',
    incidents.length === 0
      ? '✅ No recurring incidents.'
      : incidents.map(i => `- \`${i.cause}\` — ${i.count}x across ${i.entities.length} entities`).join('\n'),
    '',
    '## 📝 Human Feedback',
    '',
    feedback.length === 0
      ? 'No human feedback this cycle.'
      : feedback.map(f => `- **${f.id}**: rule \`${f.rule}\` — system: ${f.system} → human: ${f.human}`).join('\n'),
    '',
    '## 🗂️ Entity Registry Summary',
    '',
    '| Class | Count |',
    '|-------|-------|',
    ...Object.entries(atlasRegistry.summary().byClass).map(([cls, names]) => `| ${cls} | ${names.length} |`),
    '',
    '---',
    '*Generated by atlas-governance-cycle.js (Universal CPL-L / CPL-P Runtime)*',
  ];

  const reportPath = path.join(DOCS, 'atlas-governance-report.md');
  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log(`    📄 Universal report → docs/atlas-governance-report.md`);
  return reportPath;
}

// ── Synthetic Event Emitter (for testing) ─────────────────────────────────────

function emitSyntheticEvents() {
  console.log('\n🌐 Emitting synthetic events for all registry entities...\n');
  const entities = atlasRegistry.all();
  const ops = {
    Bot: 'ci_run_completed',
    Agent: 'reasoning_cycle_completed',
    Organism: 'judgment_delivered',
    Engine: 'heartbeat_tick',
    Realm: 'realm_cycle_completed',
  };
  for (const entity of entities) {
    const op  = ops[entity.class] || 'cycle_completed';
    const cls = entity.id.match(/^atlas:\/\/([^/]+)\//)?.[1] || 'entity';
    const evt = new AtlasEvent({
      entity_id: entity.id,
      op,
      context: { status: 'success', coherence: 0.85, entropy: 0.2, risk_score: 0.1 },
      tags: [cls, entity.name],
    });
    const p = evt.emit();
    console.log(`  📡 ${entity.id.replace('atlas://', '')} → ${op}`);
  }
  console.log(`\n  ✅ ${entities.length} synthetic events emitted`);
}

// ── Summary Mode ──────────────────────────────────────────────────────────────

function printSummary() {
  console.log('\n🌐 Atlas Governance Summary\n═══════════════════════════════════════════\n');

  const summary = atlasRegistry.summary();
  console.log(`  Registry: ${summary.total} entities`);
  for (const [cls, names] of Object.entries(summary.byClass)) {
    console.log(`    ${cls}: ${names.length}`);
  }

  const mml = atlasMemory.mmlSnapshot();
  console.log(`\n  MML: ${mml.cycles || 0} governance cycle(s), ${Object.keys(mml.entities || {}).length} entities tracked`);

  const uel = atlasMemory.evolutionRules();
  console.log(`  UEL: ${uel.length} evolution rule(s)`);

  const incidents = atlasMemory.incidentPatterns();
  console.log(`  RIL: ${incidents.length} incident pattern(s)`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (flags.summary) { printSummary(); return; }
  if (flags.emitEvents) { initialize(); emitSyntheticEvents(); return; }

  initialize();

  if (flags.report) {
    generateUniversalReport([], {}, [], { oracleSummary: '—', guardianSummary: '—' }, []);
    return;
  }

  // Full cycle
  const { events, byEntity, byClass, byTag } = ingestEvents();

  if (flags.ingestOnly) {
    console.log('\n  ✅ Ingest-only mode complete\n');
    return;
  }

  const byDomain = groupEvents(events);

  let allResults = [], totalDecisions = 0, totalBlocked = 0, totalEscalated = 0;

  if (events.length > 0) {
    ({ allResults, totalDecisions, totalBlocked, totalEscalated } = applyAllLaws(events));
    await runPipelines(byDomain, allResults);
  } else {
    console.log('  ℹ️ No events to process — registry loaded, memory available');
    // Still run meta analysis on accumulated stats
  }

  const uelProposals = runMetaAnalysis();
  const feedback     = ingestFeedback();
  const narration    = runOrganismNarration(allResults, uelProposals);

  generateUniversalReport(allResults, byDomain, uelProposals, narration, feedback);

  console.log(`\n  ✅ Universal governance cycle complete | Decisions: ${totalDecisions} | Blocked: ${totalBlocked} | Escalated: ${totalEscalated}\n`);
}

main().catch(err => {
  console.error(`  ❌ Atlas governance cycle error: ${err.message}`);
  process.exit(1);
});
