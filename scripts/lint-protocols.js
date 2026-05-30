#!/usr/bin/env node
/**
 * 🔬 organism-protocol-bot — Protocol Linter & Dependency Graph
 * ══════════════════════════════════════════════════════════════
 *
 * Validates all protocols in protocols/:
 *  - Checks each file is valid JavaScript with exports
 *  - Extracts class/function signatures
 *  - Builds dependency graph (require/reference analysis)
 *  - Detects circular dependencies
 *  - Generates a visual dependency graph report
 *
 * Usage:
 *   node scripts/lint-protocols.js           # lint
 *   node scripts/lint-protocols.js --graph   # generate graph to docs/
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO       = path.resolve(__dirname, '..');
const PROTOCOLS  = path.join(REPO, 'protocols');
const DOCS       = path.join(REPO, 'docs');
const GRAPH_FILE = path.join(DOCS, 'protocol-dependency-graph.md');

const doGraph = process.argv.includes('--graph');

// ── Protocol categories (for the report) ─────────────────────────────────────
const CATEGORIES = {
  neural: ['neuro-emergence', 'neurochemistry-ode', 'hebbian-learning', 'kuramoto-oscillator', 'mini-brain', 'predictive-coding'],
  memory: ['memory-consolidation', 'memory-lineage', 'memory-lineage-enhancement', 'sovereign-memory', 'adaptive-knowledge-absorption'],
  routing: ['attention-routing', 'sovereign-routing', 'intelligence-routing', 'edge-mesh-intelligence'],
  lifecycle: ['organism-lifecycle', 'organism-marketplace', 'vitality-homeostasis', 'homeostatic-drive', 'mini-heart'],
  execution: ['kernel-execution', 'native-runtime', 'synapse-binding-engine', 'oro-engine-integration'],
  intelligence: ['multi-model-fusion', 'pattern-synthesis', 'visual-scene-intelligence', 'cross-substrate-resonance', 'phi-resonance-sync'],
  security: ['encrypted-intelligence-transport', 'sovereign-contract-verification', 'sovereign-offline-cognition'],
  io: ['edge-sensor', 'reward-signal', 'goal-stack', 'artifact-generation', 'auto-generate-calls-engine'],
  governance: ['auro-absorption-charter', 'auro-guardian-intelligence'],
};

function categorize(name) {
  for (const [cat, patterns] of Object.entries(CATEGORIES)) {
    if (patterns.some(p => name.includes(p))) return cat;
  }
  return 'other';
}

function main() {
  console.log('');
  console.log('🔬 Protocol Integrity Scanner');
  console.log('═══════════════════════════════════════════');
  console.log('');

  if (!fs.existsSync(PROTOCOLS)) {
    console.log('  ⚠ No protocols/ directory found');
    return;
  }

  const files = fs.readdirSync(PROTOCOLS).filter(f => f.endsWith('.js') && f !== 'index.js');
  let valid = 0, invalid = 0;
  const errors = [];
  const protocolData = {};

  for (const file of files) {
    const name = file.replace('.js', '').replace(/-protocol$/, '');
    const content = fs.readFileSync(path.join(PROTOCOLS, file), 'utf8');

    // Extract structure
    const classes = (content.match(/class\s+(\w+)/g) || []).map(c => c.replace('class ', ''));
    const functions = (content.match(/function\s+(\w+)/g) || []).map(f => f.replace('function ', ''));
    const hasExports = /module\.exports/.test(content) || /exports\./.test(content);
    const lines = content.split('\n').length;

    // Find cross-references
    const refs = [];
    const reqMatches = content.match(/require\(['"]\.\/([\w-]+)['"]\)/g) || [];
    for (const r of reqMatches) {
      const m = r.match(/require\(['"]\.\/([\w-]+)['"]\)/);
      if (m) refs.push(m[1]);
    }

    const category = categorize(name);

    if (classes.length > 0 || functions.length > 0 || hasExports) {
      valid++;
      console.log(`  ✅ ${name} [${category}] — ${classes.length} classes, ${lines} lines`);
    } else {
      invalid++;
      errors.push(`${file}: no classes, functions, or exports`);
      console.log(`  ❌ ${name} — no valid structure`);
    }

    protocolData[name] = { file, classes, functions, hasExports, lines, refs, category };
  }

  console.log('');
  console.log(`  ${valid} valid / ${files.length} total protocols`);

  // Check for circular dependencies
  const circular = [];
  for (const [name, data] of Object.entries(protocolData)) {
    for (const ref of data.refs) {
      const refName = ref.replace(/-protocol$/, '');
      if (protocolData[refName] && protocolData[refName].refs.includes(name)) {
        const pair = [name, refName].sort().join(' ↔ ');
        if (!circular.includes(pair)) circular.push(pair);
      }
    }
  }

  if (circular.length > 0) {
    console.log('');
    console.log('  ⚠ Circular dependencies detected:');
    for (const c of circular) {
      console.log(`    🔄 ${c}`);
    }
  }

  if (errors.length > 0) {
    console.log('');
    console.log('  ⚠ Issues:');
    for (const err of errors) {
      console.log(`    • ${err}`);
    }
  }

  // Generate graph report
  if (doGraph) {
    fs.mkdirSync(DOCS, { recursive: true });

    // Group by category
    const byCategory = {};
    for (const [name, data] of Object.entries(protocolData)) {
      const cat = data.category;
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({ name, ...data });
    }

    const lines = [
      '# 🔬 Protocol Dependency Graph',
      '',
      `> Auto-generated by organism-protocol-bot on ${new Date().toUTCString()}`,
      '',
      `**${files.length} protocols** across **${Object.keys(byCategory).length} categories**`,
      '',
    ];

    for (const [cat, protocols] of Object.entries(byCategory).sort()) {
      const emoji = { neural: '🧠', memory: '💾', routing: '🔀', lifecycle: '♻️', execution: '⚡', intelligence: '🧬', security: '🔒', io: '📡', governance: '⚖️', other: '📋' };
      lines.push(`## ${emoji[cat] || '📋'} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
      lines.push('');
      lines.push('| Protocol | Classes | Functions | Lines | Dependencies |');
      lines.push('|----------|---------|-----------|-------|-------------|');
      for (const p of protocols) {
        lines.push(`| ${p.name} | ${p.classes.join(', ') || '—'} | ${p.functions.length} | ${p.lines} | ${p.refs.join(', ') || '—'} |`);
      }
      lines.push('');
    }

    if (circular.length > 0) {
      lines.push('## ⚠️ Circular Dependencies');
      lines.push('');
      for (const c of circular) lines.push(`- 🔄 ${c}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('*Generated by organism-protocol-bot*');

    fs.writeFileSync(GRAPH_FILE, lines.join('\n'));
    console.log(`  📄 Graph written to ${path.relative(REPO, GRAPH_FILE)}`);
  }

  console.log('');
  console.log('  ✅ Protocol integrity scan complete');
  console.log('');

  if (invalid > 0) process.exit(1);
}

main();
