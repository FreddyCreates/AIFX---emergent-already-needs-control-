#!/usr/bin/env node
/**
 * 🔭 organism-intel-bot — Intelligence Gathering & Fleet-Wide Awareness
 * ════════════════════════════════════════════════════════════════════════
 *
 * Aggregates intelligence from every bot report, cross-correlates findings,
 * detects emerging patterns, and maintains the organism's unified
 * "intelligence picture" — a single-pane view across the entire fleet.
 *
 * Flags:
 *   --aggregate  Read and aggregate all bot reports from docs/
 *   --patterns   Detect cross-bot patterns and correlations
 *   --awareness  Build the unified awareness picture
 *   --report     Generate intelligence picture to docs/
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs');

const flags = {
  aggregate: process.argv.includes('--aggregate'),
  patterns:  process.argv.includes('--patterns'),
  awareness: process.argv.includes('--awareness'),
  report:    process.argv.includes('--report'),
};
if (!Object.values(flags).some(Boolean)) Object.keys(flags).forEach(k => flags[k] = true);

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

// Known bot reports (source → file)
const BOT_REPORTS = [
  { bot: 'organism-alpha-bot',    emoji: '👑', file: 'fleet-report.md' },
  { bot: 'organism-cyber-bot',    emoji: '🔐', file: 'cyber-report.md' },
  { bot: 'organism-cloud-bot',    emoji: '☁️', file: 'cloud-report.md' },
  { bot: 'organism-runtime-bot',  emoji: '⚙️', file: 'runtime-report.md' },
  { bot: 'organism-learning-bot', emoji: '🎓', file: 'learning-report.md' },
  { bot: 'organism-economy-bot',  emoji: '💰', file: 'economy-dashboard.md' },
  { bot: 'organism-crawler-bot',  emoji: '🕷️', file: 'crawler-report.md' },
  { bot: 'organism-sentinel-bot', emoji: '🛡️', file: 'security-report.md' },
  { bot: 'organism-docs-bot',     emoji: '📚', file: 'architecture-map.md' },
  { bot: 'organism-deps-bot',     emoji: '🔄', file: 'dependency-freshness-report.md' },
  { bot: 'organism-test-bot',     emoji: '🧪', file: 'test-health-dashboard.md' },
  { bot: 'organism-visual-bot',   emoji: '📸', file: 'visual-regression-report.md' },
  { bot: 'organism-sandcastle-bot', emoji: '🏰', file: 'sandcastle-report.md' },
];

// ── Phase 1: Aggregate ────────────────────────────────────────────────────────
function aggregateReports() {
  console.log('  🔭 Phase 1 — Aggregating bot reports...');

  const intelligence = [];

  for (const { bot, emoji, file } of BOT_REPORTS) {
    const filePath = path.join(DOCS, file);
    const exists   = fs.existsSync(filePath);
    let signals    = { pass: 0, fail: 0, warnings: 0, score: 0 };
    let age        = null;

    if (exists) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const stat    = fs.statSync(filePath);
        age = Date.now() - stat.mtimeMs;

        signals.pass     = (content.match(/✅/g) || []).length;
        signals.fail     = (content.match(/❌/g) || []).length;
        signals.warnings = (content.match(/⚠|⚠️/g) || []).length;
        signals.score    = signals.pass / (signals.pass + signals.fail + signals.warnings + 1);

        // Extract key numbers
        const numbersMatch = content.match(/\|\s*\*?\*?(\d+)\*?\*?\s*\|/g) || [];
        signals.keyNumbers = numbersMatch.slice(0, 3).map(m => parseInt(m.replace(/\D/g, '')));
      } catch { /* skip */ }
    }

    const ageHours = age !== null ? (age / 1000 / 3600).toFixed(1) : null;
    const fresh    = ageHours !== null && parseFloat(ageHours) < 24;

    intelligence.push({
      bot, emoji, file,
      present: exists,
      fresh,
      ageHours,
      signals,
    });

    const icon = !exists ? '⚪' : fresh ? '🟢' : '🟡';
    console.log(`    ${icon} ${emoji} ${bot}: ${exists ? `score=${signals.score.toFixed(2)} age=${ageHours}h` : 'no report'}`);
  }

  const present = intelligence.filter(i => i.present).length;
  const fresh   = intelligence.filter(i => i.fresh).length;
  console.log(`    📊 Reports found: ${present}/${intelligence.length} (${fresh} fresh)`);

  return intelligence;
}

// ── Phase 2: Pattern Detection ────────────────────────────────────────────────
function detectPatterns(intelligence) {
  console.log('  🔭 Phase 2 — Detecting cross-bot patterns...');

  const patterns = [];

  // Pattern 1: Score correlation — bots that score similarly
  const scored = intelligence.filter(i => i.present && i.signals.score > 0);
  if (scored.length >= 2) {
    const avgScore = scored.reduce((s, i) => s + i.signals.score, 0) / scored.length;
    const low   = scored.filter(i => i.signals.score < avgScore * 0.5);
    const high  = scored.filter(i => i.signals.score > avgScore * 1.5);

    if (low.length > 0) {
      patterns.push({
        type: 'underperforming',
        severity: 'medium',
        description: `${low.length} bot(s) scoring significantly below average`,
        bots: low.map(i => i.bot),
      });
    }

    if (high.length > 0) {
      patterns.push({
        type: 'outperforming',
        severity: 'info',
        description: `${high.length} bot(s) scoring significantly above average`,
        bots: high.map(i => i.bot),
      });
    }
  }

  // Pattern 2: Stale reports
  const stale = intelligence.filter(i => i.present && !i.fresh);
  if (stale.length > 3) {
    patterns.push({
      type: 'stale-reports',
      severity: 'low',
      description: `${stale.length} bot reports are older than 24h`,
      bots: stale.map(i => i.bot),
    });
  }

  // Pattern 3: Missing reports
  const missing = intelligence.filter(i => !i.present);
  if (missing.length > 0) {
    patterns.push({
      type: 'missing-reports',
      severity: missing.length > 3 ? 'high' : 'medium',
      description: `${missing.length} bots have not produced reports`,
      bots: missing.map(i => i.bot),
    });
  }

  // Pattern 4: Fleet health trend (phi-weighted)
  const allScores = scored.map(i => i.signals.score);
  const fleetScore = allScores.reduce((s, v) => s + v, 0) / (allScores.length || 1);
  patterns.push({
    type: 'fleet-health',
    severity: fleetScore > 0.8 ? 'info' : fleetScore > 0.5 ? 'low' : 'high',
    description: `Fleet-wide intelligence score: ${(fleetScore * 100).toFixed(1)}%`,
    bots: scored.map(i => i.bot),
    score: fleetScore,
  });

  console.log(`    📊 Patterns detected: ${patterns.length}`);
  return patterns;
}

// ── Phase 3: Awareness Picture ────────────────────────────────────────────────
function buildAwareness(intelligence, patterns) {
  console.log('  🔭 Phase 3 — Building awareness picture...');

  const present = intelligence.filter(i => i.present).length;
  const fresh   = intelligence.filter(i => i.fresh).length;
  const avgScore = intelligence.filter(i => i.present)
    .reduce((s, i) => s + i.signals.score, 0) / (present || 1);

  const fleetHealth = patterns.find(p => p.type === 'fleet-health')?.score || avgScore;

  const status =
    fleetHealth > 0.8  ? { label: 'OPTIMAL',   icon: '🟢' } :
    fleetHealth > 0.6  ? { label: 'HEALTHY',    icon: '🟡' } :
    fleetHealth > 0.4  ? { label: 'DEGRADED',   icon: '🟠' } :
                         { label: 'CRITICAL',   icon: '🔴' };

  const awareness = {
    timestamp:   new Date().toISOString(),
    status:      status.label,
    statusIcon:  status.icon,
    fleetScore:  parseFloat((fleetHealth * 100).toFixed(1)),
    reportsPresent: present,
    reportsFresh:   fresh,
    totalBots:      intelligence.length,
    patterns,
    topSignals: intelligence.filter(i => i.present)
      .sort((a, b) => b.signals.pass - a.signals.pass)
      .slice(0, 5)
      .map(i => ({ bot: i.bot, emoji: i.emoji, score: i.signals.score, pass: i.signals.pass })),
    concerns: patterns.filter(p => ['high', 'medium'].includes(p.severity)),
  };

  console.log(`    ${status.icon} Fleet Status: ${status.label} (${awareness.fleetScore}%)`);
  console.log(`    📊 Concerns: ${awareness.concerns.length}`);

  return awareness;
}

// ── Phase 4: Intel Report ─────────────────────────────────────────────────────
function generateReport(intelligence, patterns, awareness) {
  console.log('  🔭 Phase 4 — Generating intelligence picture...');

  fs.mkdirSync(DOCS, { recursive: true });

  const lines = [
    '# 🔭 Organism Intelligence Picture',
    '',
    `> Auto-generated by organism-intel-bot on ${new Date().toUTCString()}`,
    '',
    '## Fleet Status',
    '',
    `**${awareness.statusIcon} ${awareness.status}** — Fleet Intelligence Score: **${awareness.fleetScore}%**`,
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Total Bots | ${awareness.totalBots} |`,
    `| Reports Present | ${awareness.reportsPresent}/${awareness.totalBots} |`,
    `| Fresh Reports (<24h) | ${awareness.reportsFresh} |`,
    `| Active Patterns | ${patterns.length} |`,
    `| Open Concerns | ${awareness.concerns.length} |`,
    '',
    '## 📋 Bot Intelligence Status',
    '',
    '| Bot | Report | Fresh | Score | Signals |',
    '|-----|--------|-------|-------|---------|',
    ...intelligence.map(i => {
      const freshIcon  = i.present ? (i.fresh ? '🟢' : '🟡') : '⚪';
      const scoreStr   = i.present ? (i.signals.score * 100).toFixed(0) + '%' : '—';
      const signals    = i.present ? `✅${i.signals.pass} ❌${i.signals.fail} ⚠️${i.signals.warnings}` : '—';
      return `| ${i.emoji} ${i.bot} | ${i.present ? '✅' : '❌'} | ${freshIcon} ${i.ageHours ? `${i.ageHours}h` : '—'} | ${scoreStr} | ${signals} |`;
    }),
    '',
    '## 🔍 Detected Patterns',
    '',
    '| Pattern | Severity | Description |',
    '|---------|----------|-------------|',
    ...patterns.map(p => {
      const icon = { high: '🔴', medium: '🟠', low: '🟡', info: '🟢' }[p.severity] || '⚪';
      return `| ${p.type} | ${icon} ${p.severity} | ${p.description} |`;
    }),
    '',
  ];

  // Concerns section
  if (awareness.concerns.length > 0) {
    lines.push('## ⚠️ Open Concerns');
    lines.push('');
    for (const c of awareness.concerns) {
      const icon = c.severity === 'high' ? '🔴' : '🟠';
      lines.push(`- ${icon} **${c.type}**: ${c.description}`);
      if (c.bots && c.bots.length > 0) {
        lines.push(`  - Affected: ${c.bots.join(', ')}`);
      }
    }
    lines.push('');
  }

  // Top signals
  if (awareness.topSignals.length > 0) {
    lines.push('## 🏆 Top Performing Bots');
    lines.push('');
    lines.push('| Bot | Score | Pass Signals |');
    lines.push('|-----|-------|-------------|');
    for (const s of awareness.topSignals) {
      lines.push(`| ${s.emoji} ${s.bot} | ${(s.score * 100).toFixed(0)}% | ${s.pass} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('*Generated by organism-intel-bot — Unified Intelligence Picture*');

  fs.writeFileSync(path.join(DOCS, 'intel-picture.md'), lines.join('\n'));
  console.log('  📄 Intelligence picture written to docs/intel-picture.md');
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('\n🔭 Intelligence Gathering & Fleet Awareness\n═══════════════════════════════════════════\n');

  let intel = null, patterns = null, awareness = null;

  if (flags.aggregate || flags.patterns || flags.awareness || flags.report) intel    = aggregateReports();
  if (flags.patterns || flags.awareness || flags.report)                    patterns = detectPatterns(intel);
  if (flags.awareness || flags.report)                                      awareness = buildAwareness(intel, patterns);
  if (flags.report)                                                         generateReport(intel, patterns, awareness);

  console.log('\n  ✅ Intelligence cycle complete\n');
}

main();
