#!/usr/bin/env node
/**
 * 🎓 organism-learning-bot — Continuous Learning & Protocol Evolution
 * ═════════════════════════════════════════════════════════════════════
 *
 * Implements continuous learning across the organism by:
 *   1. Gathering training data from CI outcomes, test results, bot reports
 *   2. Training Hebbian synapses between modules that co-succeed
 *   3. Building reward models from workflow success/failure rates
 *   4. Evolving protocol weights based on accumulated learning
 *
 * Flags:
 *   --gather    Collect training signals from docs/ reports and test results
 *   --train     Run Hebbian learning on module co-activation data
 *   --reward    Update reward model from success/failure patterns
 *   --evolve    Evolve protocol connection weights
 *   --report    Generate learning report to docs/
 *
 * Usage:
 *   node scripts/learning-pipeline.js --gather --train --report
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO      = path.resolve(__dirname, '..');
const DOCS      = path.join(REPO, 'docs');
const DIST      = path.join(REPO, 'dist');
const PROT_DIR  = path.join(REPO, 'protocols');
const SDK_DIR   = path.join(REPO, 'sdk');
const LEARN_DIR = path.join(DIST, 'learning');

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;
const ETA     = 0.01;     // Learning rate
const LAMBDA  = 0.001;    // Weight decay
const GAMMA   = PHI - 1;  // Discount factor

const flags = {
  gather: process.argv.includes('--gather'),
  train:  process.argv.includes('--train'),
  reward: process.argv.includes('--reward'),
  evolve: process.argv.includes('--evolve'),
  report: process.argv.includes('--report'),
};

if (!Object.values(flags).some(Boolean)) {
  Object.keys(flags).forEach(k => flags[k] = true);
}

// ── Learning State ───────────────────────────────────────────────────────────
function loadState() {
  const statePath = path.join(LEARN_DIR, 'learning-state.json');
  if (fs.existsSync(statePath)) {
    try { return JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { /* fall through */ }
  }
  return {
    epoch: 0,
    synapses: {},       // { "moduleA→moduleB": weight }
    rewards: {},        // { "protocol-name": { successes, failures, reward } }
    weights: {},        // { "protocol-name": weight }
    history: [],
    lastUpdated: null,
  };
}

function saveState(state) {
  fs.mkdirSync(LEARN_DIR, { recursive: true });
  state.lastUpdated = new Date().toISOString();
  fs.writeFileSync(path.join(LEARN_DIR, 'learning-state.json'), JSON.stringify(state, null, 2));
}

// ── Phase 1: Gather Training Data ────────────────────────────────────────────
function gatherTrainingData(state) {
  console.log('  🎓 Phase 1 — Gathering training data...');

  const signals = [];

  // Gather from test health dashboard
  const testReport = path.join(DOCS, 'test-health-dashboard.md');
  if (fs.existsSync(testReport)) {
    const content = fs.readFileSync(testReport, 'utf8');
    const passMatches = content.match(/pass/gi) || [];
    const failMatches = content.match(/fail/gi) || [];
    signals.push({
      source: 'test-health-dashboard',
      passSignals: passMatches.length,
      failSignals: failMatches.length,
      score: passMatches.length / (passMatches.length + failMatches.length + 1),
    });
  }

  // Gather from sandcastle report
  const sandReport = path.join(DOCS, 'sandcastle-report.md');
  if (fs.existsSync(sandReport)) {
    const content = fs.readFileSync(sandReport, 'utf8');
    const phases = (content.match(/✅/g) || []).length;
    const warnings = (content.match(/⚠/g) || []).length;
    signals.push({
      source: 'sandcastle-report',
      passSignals: phases,
      failSignals: warnings,
      score: phases / (phases + warnings + 1),
    });
  }

  // Gather from security report
  const secReport = path.join(DOCS, 'security-report.md');
  if (fs.existsSync(secReport)) {
    const content = fs.readFileSync(secReport, 'utf8');
    const clean = (content.match(/✅/g) || []).length;
    const issues = (content.match(/⚠|❌|🚨/g) || []).length;
    signals.push({
      source: 'security-report',
      passSignals: clean,
      failSignals: issues,
      score: clean / (clean + issues + 1),
    });
  }

  // Gather protocol complexity as a signal
  if (fs.existsSync(PROT_DIR)) {
    const files = fs.readdirSync(PROT_DIR).filter(f => f.endsWith('.js') && f !== 'index.js');
    for (const file of files) {
      const content = fs.readFileSync(path.join(PROT_DIR, file), 'utf8');
      const lines = content.split('\n').length;
      const hasClass = /class\s+\w+/.test(content);
      const protName = file.replace('.js', '');

      if (!state.weights[protName]) {
        state.weights[protName] = PHI_INV;  // Initial weight
      }

      signals.push({
        source: `protocol:${protName}`,
        passSignals: hasClass ? 1 : 0,
        failSignals: 0,
        score: Math.min(1.0, lines / 200),  // Normalized by expected size
      });
    }
  }

  console.log(`    📊 Gathered ${signals.length} training signals`);
  return signals;
}

// ── Phase 2: Hebbian Learning ────────────────────────────────────────────────
function trainHebbian(state, signals) {
  console.log('  🎓 Phase 2 — Training Hebbian synapses...');

  // Extract active modules from signals
  const activeModules = signals
    .filter(s => s.score > 0.5)
    .map(s => s.source);

  // Hebbian rule: "modules that succeed together wire together"
  let newSynapses = 0;
  let updatedSynapses = 0;

  for (let i = 0; i < activeModules.length; i++) {
    for (let j = i + 1; j < activeModules.length; j++) {
      const key = `${activeModules[i]}→${activeModules[j]}`;
      const pre = signals.find(s => s.source === activeModules[i])?.score || 0;
      const post = signals.find(s => s.source === activeModules[j])?.score || 0;

      // dw = η · (pre × post) - λ · w
      const currentWeight = state.synapses[key] || 0;
      const delta = ETA * (pre * post) - LAMBDA * currentWeight;
      const newWeight = Math.max(0, Math.min(PHI, currentWeight + delta));

      if (currentWeight === 0) newSynapses++;
      else updatedSynapses++;

      state.synapses[key] = parseFloat(newWeight.toFixed(6));
    }
  }

  // Decay inactive synapses
  let decayed = 0;
  for (const [key, weight] of Object.entries(state.synapses)) {
    const [pre] = key.split('→');
    if (!activeModules.includes(pre)) {
      state.synapses[key] = parseFloat((weight * PHI_INV).toFixed(6));
      if (state.synapses[key] < 0.001) {
        delete state.synapses[key];
        decayed++;
      }
    }
  }

  console.log(`    🧠 New synapses: ${newSynapses}`);
  console.log(`    🔄 Updated: ${updatedSynapses}`);
  console.log(`    📉 Decayed: ${decayed}`);
  console.log(`    📊 Total synapses: ${Object.keys(state.synapses).length}`);
}

// ── Phase 3: Reward Model ────────────────────────────────────────────────────
function updateReward(state, signals) {
  console.log('  🎓 Phase 3 — Updating reward model...');

  for (const signal of signals) {
    if (!signal.source.startsWith('protocol:')) continue;

    const protName = signal.source.replace('protocol:', '');
    if (!state.rewards[protName]) {
      state.rewards[protName] = { successes: 0, failures: 0, reward: 0 };
    }

    const r = state.rewards[protName];
    if (signal.score > 0.5) {
      r.successes++;
      // TD update: R = R + α(reward - R)
      r.reward = parseFloat((r.reward + 0.1 * (signal.score - r.reward)).toFixed(6));
    } else {
      r.failures++;
      r.reward = parseFloat((r.reward + 0.1 * (-signal.score - r.reward)).toFixed(6));
    }
  }

  const totalReward = Object.values(state.rewards).reduce((s, r) => s + r.reward, 0);
  console.log(`    💎 Total accumulated reward: ${totalReward.toFixed(4)}`);
  console.log(`    📊 Tracked protocols: ${Object.keys(state.rewards).length}`);
}

// ── Phase 4: Evolve Protocol Weights ─────────────────────────────────────────
function evolveWeights(state) {
  console.log('  🎓 Phase 4 — Evolving protocol weights...');

  let evolved = 0;

  for (const [protName, reward] of Object.entries(state.rewards)) {
    const currentWeight = state.weights[protName] || PHI_INV;

    // Weight evolution: w_new = w * (1 + γ * reward)
    const newWeight = currentWeight * (1 + GAMMA * reward.reward);
    const clamped = Math.max(0.1, Math.min(PHI * 2, newWeight));

    if (Math.abs(clamped - currentWeight) > 0.001) {
      evolved++;
    }

    state.weights[protName] = parseFloat(clamped.toFixed(6));
  }

  // Normalize weights
  const totalWeight = Object.values(state.weights).reduce((s, w) => s + w, 0);
  if (totalWeight > 0) {
    for (const key of Object.keys(state.weights)) {
      state.weights[key] = parseFloat((state.weights[key] / totalWeight * Object.keys(state.weights).length).toFixed(6));
    }
  }

  state.epoch++;

  console.log(`    🧬 Evolved ${evolved} protocol weights`);
  console.log(`    📊 Epoch: ${state.epoch}`);
}

// ── Phase 5: Report ──────────────────────────────────────────────────────────
function generateReport(state) {
  console.log('  🎓 Phase 5 — Generating learning report...');

  fs.mkdirSync(DOCS, { recursive: true });

  const synapseCount = Object.keys(state.synapses).length;
  const protocolCount = Object.keys(state.weights).length;
  const totalReward = Object.values(state.rewards).reduce((s, r) => s + r.reward, 0);

  // Top synapses by weight
  const topSynapses = Object.entries(state.synapses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Top protocols by weight
  const topProtocols = Object.entries(state.weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const lines = [
    '# 🎓 Learning & Evolution Report',
    '',
    `> Auto-generated by organism-learning-bot on ${new Date().toUTCString()}`,
    '',
    '## Learning State',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Learning Epoch | ${state.epoch} |`,
    `| Total Synapses | ${synapseCount} |`,
    `| Tracked Protocols | ${protocolCount} |`,
    `| Accumulated Reward | ${totalReward.toFixed(4)} |`,
    `| Learning Rate (η) | ${ETA} |`,
    `| Discount Factor (γ) | ${GAMMA.toFixed(6)} |`,
    `| Weight Decay (λ) | ${LAMBDA} |`,
    '',
    '## 🧠 Top Synapses (Strongest Connections)',
    '',
    '| Connection | Weight |',
    '|-----------|--------|',
    ...topSynapses.map(([key, weight]) => `| ${key} | ${weight.toFixed(6)} |`),
    '',
    '## 🏆 Protocol Weight Rankings',
    '',
    '| Protocol | Weight | Successes | Failures | Reward |',
    '|----------|--------|-----------|----------|--------|',
    ...topProtocols.map(([name, weight]) => {
      const r = state.rewards[name] || { successes: 0, failures: 0, reward: 0 };
      return `| ${name} | ${weight.toFixed(4)} | ${r.successes} | ${r.failures} | ${r.reward.toFixed(4)} |`;
    }),
    '',
    '## 📈 Learning Constants',
    '',
    '| Constant | Symbol | Value | Source |',
    '|----------|--------|-------|--------|',
    `| Golden Ratio | φ | ${PHI} | Mathematics |`,
    `| Learning Rate | η | ${ETA} | Hebbian |`,
    `| Weight Decay | λ | ${LAMBDA} | Regularization |`,
    `| Discount Factor | γ | ${GAMMA.toFixed(6)} | φ - 1 |`,
    `| Heartbeat | — | 873ms | Organism |`,
    '',
    '---',
    '*Generated by organism-learning-bot — Continuous Evolution*',
  ];

  fs.writeFileSync(path.join(DOCS, 'learning-report.md'), lines.join('\n'));
  console.log(`  📄 Report written to docs/learning-report.md`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('');
  console.log('🎓 Learning & Evolution Pipeline');
  console.log('═══════════════════════════════════════════');
  console.log('');

  const state = loadState();
  let signals = null;

  if (flags.gather || flags.train || flags.reward) signals = gatherTrainingData(state);
  if (flags.train && signals)                       trainHebbian(state, signals);
  if (flags.reward && signals)                      updateReward(state, signals);
  if (flags.evolve)                                 evolveWeights(state);
  if (flags.report)                                 generateReport(state);

  saveState(state);

  console.log('');
  console.log(`  ✅ Learning cycle complete — epoch ${state.epoch}`);
  console.log('');
}

main();
