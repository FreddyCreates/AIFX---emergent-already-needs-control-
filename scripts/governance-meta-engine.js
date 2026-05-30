#!/usr/bin/env node
/**
 * 🔮 organism-governance-bot — Meta Engine
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Watches law stats and pipeline metrics to detect patterns across the fleet
 * and emit optimization proposals. Reads the meta-stats.json from the
 * governance engine audit and the human feedback files.
 *
 * Detection patterns:
 *   1. Chronically blocked bots — bots blocked too often (laws too strict)
 *   2. Never-triggered rules — rules that never fire (too lax or redundant)
 *   3. Frequent escalations — escalations that repeat (need automation)
 *   4. Override patterns — humans override same rule repeatedly (law needs update)
 *   5. Fleet health trends — deteriorating/improving over time
 *   6. Bot failure correlation — bots that fail together
 *
 * Outputs proposals as JSON to dist/governance/meta-proposals.json
 * Also writes docs/governance-meta-report.md
 *
 * Flags:
 *   --analyze   Run meta analysis on current stats
 *   --proposals Print current proposals
 *   --report    Generate meta report
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO        = path.resolve(__dirname, '..');
const DOCS        = path.join(REPO, 'docs');
const GOVERNANCE  = path.join(REPO, 'governance');
const AUDIT_DIR   = path.join(REPO, 'dist', 'governance');
const META_FILE   = path.join(AUDIT_DIR, 'meta-stats.json');
const FEEDBACK_DIR = path.join(GOVERNANCE, 'feedback');
const PROPOSALS_FILE = path.join(AUDIT_DIR, 'meta-proposals.json');

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

const flags = {
  analyze:   process.argv.includes('--analyze'),
  proposals: process.argv.includes('--proposals'),
  report:    process.argv.includes('--report'),
};
if (!Object.values(flags).some(Boolean)) Object.keys(flags).forEach(k => flags[k] = true);

fs.mkdirSync(AUDIT_DIR, { recursive: true });

// ── Load Data ──────────────────────────────────────────────────────────────────
function loadMetaStats() {
  if (!fs.existsSync(META_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(META_FILE, 'utf8')); } catch { return null; }
}

function loadFeedback() {
  if (!fs.existsSync(FEEDBACK_DIR)) return [];
  const files = fs.readdirSync(FEEDBACK_DIR).filter(f => f.startsWith('fb-') && f.endsWith('.yaml'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(FEEDBACK_DIR, f), 'utf8');
    const id      = content.match(/^id:\s*"([^"]+)"/m)?.[1] || f;
    const rule    = content.match(/rule_name:\s*"([^"]+)"/)?.[1] || '';
    const entity  = content.match(/entity:\s*"([^"]+)"/)?.[1] || '';
    const system  = content.match(/system:\s*"?([A-Z]+)"?/)?.[1] || '';
    const human   = content.match(/human:\s*"?([A-Z]+)"?/)?.[1] || '';
    return { id, rule, entity, system, human, file: f };
  });
}

// ── Pattern Detection ──────────────────────────────────────────────────────────

/**
 * Pattern 1: Chronically blocked bots
 * If a bot is blocked in >60.8% (phi-inv) of its cycles, the law might be too strict.
 */
function detectChronicallyBlocked(stats) {
  const proposals = [];
  const bots = stats.bots || {};

  for (const [bot, data] of Object.entries(bots)) {
    const total = data.blocked + data.allowed;
    if (total < 3) continue; // need enough data
    const blockRate = data.blocked / total;
    if (blockRate > PHI_INV) {
      proposals.push({
        type: 'LAW_TOO_STRICT',
        severity: 'medium',
        target: `atlas://bot/${bot}`,
        description: `"${bot}" is blocked in ${Math.round(blockRate * 100)}% of cycles (>${Math.round(PHI_INV * 100)}% φ⁻¹ threshold) — law conditions may be too broad`,
        suggestion: `Review BLOCK rules for ${bot}. Consider adding context exceptions (e.g., "visual_only failures don't block release").`,
        metric: { blockRate: parseFloat(blockRate.toFixed(3)), total },
      });
    }
  }
  return proposals;
}

/**
 * Pattern 2: Never-triggered rules
 * Laws that never fire in 10+ cycles are potentially redundant or misconfigured.
 */
function detectNeverTriggeredRules(stats) {
  const proposals = [];
  const rules = stats.rules || {};
  const cycles = stats.cycles || 0;

  if (cycles < 10) return proposals;

  // Known rules from CPL-L
  const knownRules = [
    'BLOCK_SECRETS', 'ESCALATE_CRITICAL_THREAT', 'BLOCK_DEPLOY_ON_CRITICAL_CVE',
    'WARN_HIGH_THREAT_SCORE', 'NO_RELEASE_ON_RED', 'NO_RELEASE_ON_FAILING_TESTS',
    'REQUIRE_REVIEW_ON_MAJOR', 'NO_DEPLOY_ON_RED', 'NO_DEPLOY_WITHOUT_TESTS',
    'NO_EDGE_DEPLOY_ON_OFFLINE_REGIONS', 'BLOCK_EDGE_DEPLOY_ON_ALL_OFFLINE',
    'ESCALATE_FULL_MATRIX_FAILURE', 'FLAG_HIGH_FAILURE_RATE',
    'PREVENT_WEIGHT_DIVERGENCE', 'ESCALATE_MULTIPLE_BOT_FAILURES', 'HIGH_RISK_FLEET_LOCKDOWN',
  ];

  for (const rule of knownRules) {
    if (!rules[rule] || rules[rule].triggered === 0) {
      proposals.push({
        type: 'RULE_NEVER_TRIGGERED',
        severity: 'low',
        target: `governance://law/BOT_FLEET_SAFETY#${rule}`,
        description: `Rule "${rule}" has never triggered in ${cycles} cycles — verify condition or consider removing if obsolete`,
        suggestion: `Test rule "${rule}" with a synthetic event. If unreachable, remove or simplify its condition.`,
        metric: { triggered: 0, cycles },
      });
    }
  }
  return proposals;
}

/**
 * Pattern 3: Frequent escalations
 * If a bot escalates in >30% of cycles, automate the response.
 */
function detectFrequentEscalations(stats) {
  const proposals = [];
  const bots = stats.bots || {};

  for (const [bot, data] of Object.entries(bots)) {
    const total = data.blocked + data.allowed;
    if (total < 5) continue;
    const escalateRate = data.escalated / total;
    if (escalateRate > 0.3) {
      proposals.push({
        type: 'FREQUENT_ESCALATION',
        severity: 'high',
        target: `atlas://bot/${bot}`,
        description: `"${bot}" escalates to humans in ${Math.round(escalateRate * 100)}% of cycles — response should be automated`,
        suggestion: `Create a new bot or protocol to handle this escalation class automatically. Consider: "Create organism-risk-bot to pre-screen high-risk PRs from ${bot}."`,
        metric: { escalateRate: parseFloat(escalateRate.toFixed(3)), total },
      });
    }
  }
  return proposals;
}

/**
 * Pattern 4: Human override patterns
 * Repeated overrides of the same rule → law needs updating.
 */
function detectOverridePatterns(feedback) {
  const proposals = [];
  const ruleOverrides = {};

  for (const fb of feedback) {
    if (fb.system === 'FORBID' && fb.human === 'ALLOW') {
      ruleOverrides[fb.rule] = (ruleOverrides[fb.rule] || 0) + 1;
    }
  }

  for (const [rule, count] of Object.entries(ruleOverrides)) {
    if (count >= 2) {
      proposals.push({
        type: 'REPEATED_OVERRIDE',
        severity: 'high',
        target: `governance://law/BOT_FLEET_SAFETY#${rule}`,
        description: `Rule "${rule}" has been overridden by humans ${count} time(s) — the law condition is likely too broad`,
        suggestion: `Review rule "${rule}" and add context exceptions based on override rationales. The human overrides suggest the rule fires in valid scenarios.`,
        metric: { overrideCount: count },
      });
    }
  }
  return proposals;
}

/**
 * Pattern 5: Fleet health trend
 * If fleet health has been red/yellow for 5+ consecutive readings, alert.
 */
function detectHealthTrend(stats) {
  const proposals = [];
  const history = stats.fleet_health || [];
  if (history.length < 5) return proposals;

  const recent = history.slice(-5);
  const redCount    = recent.filter(h => h.status === 'red').length;
  const yellowCount = recent.filter(h => h.status === 'yellow').length;
  const avgRisk     = recent.reduce((s, h) => s + (h.risk || 0), 0) / recent.length;

  if (redCount >= 3) {
    proposals.push({
      type: 'SUSTAINED_RED_HEALTH',
      severity: 'critical',
      target: 'atlas://organism/bot-fleet',
      description: `Fleet health has been RED in ${redCount}/5 recent cycles — organism stability is deteriorating`,
      suggestion: `Immediately review failing bots. Consider triggering organism-sandcastle-bot for isolated diagnostics and organism-sentinel-bot for security sweep.`,
      metric: { redCount, avgRisk: parseFloat(avgRisk.toFixed(3)) },
    });
  } else if (yellowCount >= 4) {
    proposals.push({
      type: 'SUSTAINED_YELLOW_HEALTH',
      severity: 'medium',
      target: 'atlas://organism/bot-fleet',
      description: `Fleet health persistently YELLOW — organism is below optimal performance`,
      suggestion: `Review organism-learning-bot protocol weights and organism-deps-bot for stale dependencies.`,
      metric: { yellowCount, avgRisk: parseFloat(avgRisk.toFixed(3)) },
    });
  }

  // Improving trend
  const improving = history.length >= 3 &&
    history[history.length - 1].risk < history[history.length - 3].risk;
  if (improving) {
    proposals.push({
      type: 'IMPROVING_HEALTH_TREND',
      severity: 'info',
      target: 'atlas://organism/bot-fleet',
      description: `Fleet risk score is trending downward — organism health improving`,
      suggestion: `Consider increasing exploration drive from 0.40 to 0.50 in the OCL charter.`,
      metric: { recentRisk: history[history.length - 1].risk },
    });
  }

  return proposals;
}

/**
 * Pattern 6: New bot proposals
 * Infer from patterns that new specialized bots are needed.
 */
function generateBotProposals(stats, feedback) {
  const proposals = [];

  // If sentinel bot escalates a lot, suggest splitting it
  const sentinel = stats.bots?.['organism-sentinel-bot'] || {};
  if (sentinel.escalated > 5) {
    proposals.push({
      type: 'NEW_BOT_PROPOSAL',
      severity: 'medium',
      target: 'atlas://organism/bot-fleet',
      description: 'High sentinel escalation rate suggests it is overloaded',
      suggestion: `Split organism-sentinel-bot into:\n  • organism-permissions-sentinel (extension permission sprawl)\n  • organism-secrets-sentinel (secrets detection only)`,
      metric: { escalated: sentinel.escalated },
    });
  }

  // If test failure rate high, suggest risk-screening bot
  const testBot = stats.bots?.['organism-test-bot'] || {};
  if (testBot.rules_triggered > 10) {
    proposals.push({
      type: 'NEW_BOT_PROPOSAL',
      severity: 'medium',
      target: 'atlas://organism/bot-fleet',
      description: 'Frequent test rule violations suggest pre-screening would reduce CI load',
      suggestion: `Create organism-risk-bot: pre-screens high-risk PRs before they reach the full CI matrix, reducing wasted test runs.`,
      metric: { rulesTriggered: testBot.rules_triggered },
    });
  }

  return proposals;
}

// ── Run Analysis ──────────────────────────────────────────────────────────────
function runAnalysis() {
  console.log('\n🔮 Meta Engine — Pattern Analysis\n═══════════════════════════════════════════\n');

  const stats    = loadMetaStats();
  const feedback = loadFeedback();

  if (!stats) {
    console.log('  ⚠ No meta-stats.json found — run governance-engine.js first');
    return { proposals: [], stats: null, feedback };
  }

  console.log(`  📊 Cycles analyzed: ${stats.cycles || 0}`);
  console.log(`  🤖 Bots tracked: ${Object.keys(stats.bots || {}).length}`);
  console.log(`  📋 Rules in stats: ${Object.keys(stats.rules || {}).length}`);
  console.log(`  📝 Human feedbacks: ${feedback.length}`);

  const proposals = [
    ...detectChronicallyBlocked(stats),
    ...detectNeverTriggeredRules(stats),
    ...detectFrequentEscalations(stats),
    ...detectOverridePatterns(feedback),
    ...detectHealthTrend(stats),
    ...generateBotProposals(stats, feedback),
  ];

  // Sort by severity: critical > high > medium > low > info
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  proposals.sort((a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5));

  console.log(`  💡 Proposals generated: ${proposals.length}`);
  for (const p of proposals) {
    const icon = { critical: '🚨', high: '🔴', medium: '🟠', low: '🟡', info: '🟢' }[p.severity] || '⚪';
    console.log(`    ${icon} [${p.type}] ${p.description.slice(0, 80)}`);
  }

  // Save proposals
  fs.writeFileSync(PROPOSALS_FILE, JSON.stringify({ proposals, generatedAt: new Date().toISOString() }, null, 2));

  return { proposals, stats, feedback };
}

// ── Generate Meta Report ──────────────────────────────────────────────────────
function generateReport(proposals, stats, feedback) {
  console.log('  🔮 Generating meta report...');
  fs.mkdirSync(DOCS, { recursive: true });

  const lines = [
    '# 🔮 Governance Meta Report',
    '',
    `> Auto-generated by governance meta engine on ${new Date().toUTCString()}`,
    '',
    '## Meta Analysis Overview',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Governance Cycles | ${stats?.cycles || 0} |`,
    `| Bots Tracked | ${Object.keys(stats?.bots || {}).length} |`,
    `| Rules Monitored | ${Object.keys(stats?.rules || {}).length} |`,
    `| Human Feedbacks | ${feedback.length} |`,
    `| Proposals Generated | ${proposals.length} |`,
    '',
    '## 💡 Optimization Proposals',
    '',
    proposals.length === 0 ? '✅ No proposals — governance system operating optimally.' : '',
  ];

  for (const p of proposals) {
    const icon = { critical: '🚨', high: '🔴', medium: '🟠', low: '🟡', info: '🟢' }[p.severity] || '⚪';
    lines.push(`### ${icon} ${p.type}`);
    lines.push('');
    lines.push(`**Target:** \`${p.target}\``);
    lines.push('');
    lines.push(`**Observation:** ${p.description}`);
    lines.push('');
    lines.push(`**Suggestion:** ${p.suggestion}`);
    if (p.metric) {
      lines.push('');
      lines.push(`**Metrics:** \`${JSON.stringify(p.metric)}\``);
    }
    lines.push('');
  }

  // Bot performance table
  if (stats?.bots) {
    lines.push('## 🤖 Bot Governance Performance');
    lines.push('');
    lines.push('| Bot | Cycles | Blocked | Allowed | Escalated | Block Rate |');
    lines.push('|-----|--------|---------|---------|-----------|-----------|');
    for (const [bot, data] of Object.entries(stats.bots)) {
      const total = data.blocked + data.allowed;
      const blockRate = total > 0 ? `${Math.round(data.blocked / total * 100)}%` : '—';
      const icon = data.blocked > 3 ? '🔴' : data.escalated > 2 ? '🟠' : '🟢';
      lines.push(`| ${icon} ${bot} | ${total} | ${data.blocked} | ${data.allowed} | ${data.escalated} | ${blockRate} |`);
    }
    lines.push('');
  }

  // Rule trigger table
  if (stats?.rules && Object.keys(stats.rules).length > 0) {
    lines.push('## 📋 Rule Trigger Stats');
    lines.push('');
    lines.push('| Rule | Times Triggered | Entities |');
    lines.push('|------|----------------|---------|');
    for (const [rule, data] of Object.entries(stats.rules)) {
      lines.push(`| ${rule} | ${data.triggered} | ${data.entities.join(', ')} |`);
    }
    lines.push('');
  }

  // Human feedback section
  if (feedback.length > 0) {
    lines.push('## 📝 Human Override History');
    lines.push('');
    lines.push('| ID | Entity | Rule | System | Human |');
    lines.push('|----|--------|------|--------|-------|');
    for (const fb of feedback) {
      const entityShort = fb.entity.replace('atlas://bot/', '');
      lines.push(`| ${fb.id} | ${entityShort || '—'} | ${fb.rule || '—'} | ${fb.system} | ${fb.human} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('*Generated by organism-governance-bot — Meta Engine*');

  fs.writeFileSync(path.join(DOCS, 'governance-meta-report.md'), lines.join('\n'));
  console.log('  📄 Meta report written to docs/governance-meta-report.md');
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let proposals = [], stats = null, feedback = [];

  if (flags.analyze || flags.report) {
    const result = runAnalysis();
    proposals = result.proposals;
    stats     = result.stats;
    feedback  = result.feedback;
  }

  if (flags.proposals) {
    if (fs.existsSync(PROPOSALS_FILE)) {
      const { proposals: saved } = JSON.parse(fs.readFileSync(PROPOSALS_FILE, 'utf8'));
      console.log('\n🔮 Current Proposals:\n');
      for (const p of saved) {
        const icon = { critical: '🚨', high: '🔴', medium: '🟠', low: '🟡', info: '🟢' }[p.severity] || '⚪';
        console.log(`  ${icon} [${p.type}] ${p.description}`);
        console.log(`     → ${p.suggestion}\n`);
      }
    } else {
      console.log('  No proposals found — run --analyze first');
    }
  }

  if (flags.report) {
    generateReport(proposals, stats || {}, feedback);
  }

  console.log('\n  ✅ Meta engine cycle complete\n');
}

main().catch(err => {
  console.error('  ❌ Meta engine error:', err.message);
  process.exit(1);
});
