#!/usr/bin/env node
/**
 * ⚙️ organism-runtime-bot — Live Civitas Runtime Monitor & Contract Manager
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Monitors the live Civitas runtime by introspecting all SDK modules,
 * checking agent wiring, validating active intelligence contracts,
 * and maintaining the microbot registry.
 *
 * Flags:
 *   --probe      Probe all runtime modules (agents, engines, protocols)
 *   --contracts  Validate intelligence contracts are properly defined
 *   --microbots  Check microbot registry and parent-bot assignments
 *   --report     Generate runtime state report to docs/
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs');

const flags = {
  probe:     process.argv.includes('--probe'),
  contracts: process.argv.includes('--contracts'),
  microbots: process.argv.includes('--microbots'),
  report:    process.argv.includes('--report'),
};
if (!Object.values(flags).some(Boolean)) Object.keys(flags).forEach(k => flags[k] = true);

// ── Phase 1: Probe Runtime Modules ───────────────────────────────────────────
function probeRuntime() {
  console.log('  ⚙️ Phase 1 — Probing runtime modules...');

  const modules = {
    engines: [],
    agents:  [],
    protocols: [],
    runtime: [],
    microbots: [],
  };

  // Engines
  const engineDir = path.join(REPO, 'sdk', 'engines');
  if (fs.existsSync(engineDir)) {
    modules.engines = fs.readdirSync(engineDir).filter(f => f.endsWith('.js') && f !== 'index.js').map(f => {
      const content = fs.readFileSync(path.join(engineDir, f), 'utf8');
      return {
        name:     f.replace('.js', ''),
        file:     `sdk/engines/${f}`,
        hasClass: /class\s+\w+/.test(content),
        exports:  (content.match(/export\s+/g) || []).length,
        lines:    content.split('\n').length,
      };
    });
  }

  // Agents
  const agentDir = path.join(REPO, 'sdk', 'agents');
  if (fs.existsSync(agentDir)) {
    modules.agents = fs.readdirSync(agentDir).filter(f => f.endsWith('-agent.js')).map(f => {
      const content = fs.readFileSync(path.join(agentDir, f), 'utf8');
      const hasAwaken   = content.includes('awaken(');
      const hasShutdown = content.includes('shutdown(');
      const hasGetState = content.includes('getState(');
      return {
        name:     f.replace('-agent.js', '').toUpperCase(),
        file:     `sdk/agents/${f}`,
        hasAwaken,
        hasShutdown,
        hasGetState,
        wired:    hasAwaken && hasShutdown && hasGetState,
        lines:    content.split('\n').length,
      };
    });
  }

  // Protocols
  const protDir = path.join(REPO, 'protocols');
  if (fs.existsSync(protDir)) {
    const files = fs.readdirSync(protDir).filter(f => f.endsWith('.js') && f !== 'index.js');
    modules.protocols = files.map(f => {
      const content = fs.readFileSync(path.join(protDir, f), 'utf8');
      const isActive = content.includes('activate(') || content.includes('watchCycle(') || content.includes('tick(');
      return {
        name:     f.replace('.js', ''),
        file:     `protocols/${f}`,
        isActive,
        hasClass: /class\s+\w+/.test(content),
        lines:    content.split('\n').length,
      };
    });
  }

  // Runtime modules
  const rtDir = path.join(REPO, 'sdk', 'runtime');
  if (fs.existsSync(rtDir)) {
    modules.runtime = fs.readdirSync(rtDir).filter(f => f.endsWith('.js')).map(f => {
      const content = fs.readFileSync(path.join(rtDir, f), 'utf8');
      return {
        name:  f.replace('.js', ''),
        file:  `sdk/runtime/${f}`,
        lines: content.split('\n').length,
      };
    });
  }

  // Microbots
  const mbDir = path.join(REPO, 'sdk', 'microbots');
  if (fs.existsSync(mbDir)) {
    function walkMb(dir) {
      const results = [];
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) results.push(...walkMb(full));
        else if (e.name.endsWith('-microbot.js')) {
          const content = fs.readFileSync(full, 'utf8');
          results.push({
            name: e.name.replace('-microbot.js', ''),
            file: path.relative(REPO, full),
            hasExecute: content.includes('_execute('),
            parentBot: content.match(/super\('([^']+)'/)?.[1] || 'unknown',
          });
        }
      }
      return results;
    }
    modules.microbots = walkMb(mbDir);
  }

  const stats = {
    engines:   modules.engines.length,
    agents:    modules.agents.length,
    protocols: modules.protocols.length,
    active:    modules.protocols.filter(p => p.isActive).length,
    microbots: modules.microbots.length,
  };

  console.log(`    ⚡ Engines: ${stats.engines}`);
  console.log(`    🧬 Agents: ${stats.agents} (${modules.agents.filter(a => a.wired).length} fully wired)`);
  console.log(`    🔬 Protocols: ${stats.protocols} (${stats.active} active/live)`);
  console.log(`    🤖 Microbots: ${stats.microbots}`);

  return { modules, stats };
}

// ── Phase 2: Validate Contracts ───────────────────────────────────────────────
function validateContracts() {
  console.log('  ⚙️ Phase 2 — Validating intelligence contracts...');

  // Check that the intelligence-contract-protocol exists and is well-formed
  const contractFile = path.join(REPO, 'protocols', 'intelligence-contract-protocol.js');
  const exists = fs.existsSync(contractFile);

  const contracts = [];

  if (exists) {
    const content = fs.readFileSync(contractFile, 'utf8');
    const hasStates    = content.includes('CONTRACT_STATES');
    const hasTypes     = content.includes('CONTRACT_TYPES');
    const hasActivate  = content.includes('.activate(');
    const hasWatch     = content.includes('watchCycle(');
    const hasLoop      = content.includes('startWatchLoop(');

    contracts.push({
      id:      'intelligence-contract-protocol',
      file:    'protocols/intelligence-contract-protocol.js',
      valid:   hasStates && hasTypes && hasActivate && hasWatch,
      features: { hasStates, hasTypes, hasActivate, hasWatch, hasLoop },
    });

    console.log(`    ✅ IntelligenceContractProtocol: ${hasActivate && hasWatch ? 'active' : 'passive'}`);
  }

  // Scan all protocols for active contract patterns
  const protDir = path.join(REPO, 'protocols');
  const files = fs.existsSync(protDir) ? fs.readdirSync(protDir).filter(f => f.endsWith('.js') && f !== 'index.js') : [];
  let activeCount = 0;

  for (const f of files) {
    const content = fs.readFileSync(path.join(protDir, f), 'utf8');
    if (content.includes('activate(') || content.includes('watchCycle(') || content.includes('startWatchLoop(')) {
      activeCount++;
    }
  }

  console.log(`    📊 Active protocols (intelligence contracts): ${activeCount}/${files.length}`);

  return { contracts, activeCount, totalProtocols: files.length };
}

// ── Phase 3: Microbot Registry ────────────────────────────────────────────────
function checkMicrobotRegistry() {
  console.log('  ⚙️ Phase 3 — Checking microbot registry...');

  const mbDir = path.join(REPO, 'sdk', 'microbots');
  const indexFile = path.join(mbDir, 'index.js');
  const baseFile  = path.join(mbDir, 'microbot-base.js');

  const registry = {
    hasBase:  fs.existsSync(baseFile),
    hasIndex: fs.existsSync(indexFile),
    microbots: [],
  };

  if (registry.hasIndex) {
    const content = fs.readFileSync(indexFile, 'utf8');
    const registered = (content.match(/'([a-z-]+)'\s*:/g) || []).map(m => m.replace(/[':\s]/g, ''));
    registry.microbots = registered;
    console.log(`    🤖 Registered microbots: ${registered.join(', ')}`);
  }

  if (registry.hasBase) {
    const baseContent = fs.readFileSync(baseFile, 'utf8');
    registry.baseHasLifecycle = baseContent.includes('spawn()') && baseContent.includes('run(') && baseContent.includes('report()');
    console.log(`    ✅ Base class lifecycle: ${registry.baseHasLifecycle ? 'complete' : 'incomplete'}`);
  }

  return registry;
}

// ── Phase 4: Runtime Report ───────────────────────────────────────────────────
function generateReport(probe, contracts, registry) {
  console.log('  ⚙️ Phase 4 — Generating runtime state report...');

  fs.mkdirSync(DOCS, { recursive: true });

  const { modules, stats } = probe;

  const lines = [
    '# ⚙️ Runtime State Report',
    '',
    `> Auto-generated by organism-runtime-bot on ${new Date().toUTCString()}`,
    '',
    '## Runtime Overview',
    '',
    '| Component | Count | Status |',
    '|-----------|-------|--------|',
    `| Engines | ${stats.engines} | ✅ active |`,
    `| Agents | ${stats.agents} | ${modules.agents.filter(a => a.wired).length}/${stats.agents} wired |`,
    `| Protocols | ${stats.protocols} | ${stats.active} active (intelligence contracts) |`,
    `| Microbots | ${stats.microbots} | ${registry.microbots.length} registered |`,
    `| Runtime Modules | ${modules.runtime.length} | ✅ present |`,
    '',
    '## ⚡ Engines',
    '',
    '| Engine | File | Exports | Lines |',
    '|--------|------|---------|-------|',
    ...modules.engines.map(e => `| ${e.name} | \`${e.file}\` | ${e.exports} | ${e.lines} |`),
    '',
    '## 🧬 Agents',
    '',
    '| Agent | Wired | awaken() | shutdown() | getState() | Lines |',
    '|-------|-------|---------|-----------|-----------|-------|',
    ...modules.agents.map(a =>
      `| ${a.name} | ${a.wired ? '✅' : '❌'} | ${a.hasAwaken ? '✅' : '❌'} | ${a.hasShutdown ? '✅' : '❌'} | ${a.hasGetState ? '✅' : '❌'} | ${a.lines} |`
    ),
    '',
    '## 🔬 Protocols (Active vs Passive)',
    '',
    '| Protocol | Active | Lines |',
    '|----------|--------|-------|',
    ...modules.protocols.map(p =>
      `| ${p.name} | ${p.isActive ? '🟢 active' : '⚪ passive'} | ${p.lines} |`
    ),
    '',
    '## 🤖 Microbot Registry',
    '',
    `Base class: ${registry.hasBase ? '✅' : '❌'} | Index: ${registry.hasIndex ? '✅' : '❌'} | Lifecycle: ${registry.baseHasLifecycle ? '✅ complete' : '❌ incomplete'}`,
    '',
    '| Microbot | Registered |',
    '|----------|-----------|',
    ...registry.microbots.map(m => `| ${m} | ✅ |`),
    '',
    '## 📋 Intelligence Contracts',
    '',
    `Active protocols (intelligence contracts): **${contracts.activeCount}/${contracts.totalProtocols}**`,
    '',
    '---',
    '*Generated by organism-runtime-bot*',
  ];

  fs.writeFileSync(path.join(DOCS, 'runtime-report.md'), lines.join('\n'));
  console.log('  📄 Runtime report written to docs/runtime-report.md');
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('\n⚙️ Runtime Monitor & Contract Manager\n═══════════════════════════════════════════\n');

  let probe = null, contracts = null, registry = null;

  if (flags.probe || flags.report)     probe     = probeRuntime();
  if (flags.contracts || flags.report) contracts = validateContracts();
  if (flags.microbots || flags.report) registry  = checkMicrobotRegistry();
  if (flags.report)                    generateReport(probe || probeRuntime(), contracts || validateContracts(), registry || checkMicrobotRegistry());

  console.log('\n  ✅ Runtime monitoring cycle complete\n');
}

main();
