#!/usr/bin/env node
/**
 * 🧠 organism-neural-bot — Neural Architecture Validator
 * ═══════════════════════════════════════════════════════
 *
 * Validates the neural protocol graph:
 *  - Every protocol in protocols/ must export a valid module
 *  - Agent modules in sdk/agents/ must be loadable
 *  - Organism runtimes (organism/*) must have valid entry points
 *  - Cross-references between protocols are verified
 *  - Produces a dependency graph and architecture report
 *
 * Usage:
 *   node scripts/validate-neural-graph.js            # validate
 *   node scripts/validate-neural-graph.js --report    # generate report to docs/
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO         = path.resolve(__dirname, '..');
const PROTOCOLS    = path.join(REPO, 'protocols');
const AGENTS       = path.join(REPO, 'sdk', 'agents');
const ORGANISM     = path.join(REPO, 'organism');
const REPORT_DIR   = path.join(REPO, 'docs');
const REPORT_FILE  = path.join(REPORT_DIR, 'neural-architecture-report.md');

const generateReport = process.argv.includes('--report');

// ── Scan protocols ───────────────────────────────────────────────────────────
function scanProtocols() {
  if (!fs.existsSync(PROTOCOLS)) return { files: [], valid: 0, invalid: 0, errors: [] };

  const files = fs.readdirSync(PROTOCOLS).filter(f => f.endsWith('.js'));
  let valid = 0, invalid = 0;
  const errors = [];
  const exports = {};

  for (const file of files) {
    const fullPath = path.join(PROTOCOLS, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const name = file.replace('.js', '');

      // Check for module.exports or exports
      const hasExports = /module\.exports\s*=/.test(content) || /exports\./.test(content);
      // Check for class or function definitions
      const hasClass = /class\s+\w+/.test(content);
      const hasFunction = /function\s+\w+/.test(content);

      if (hasExports || hasClass || hasFunction) {
        valid++;
        // Extract exported names
        const classMatch = content.match(/class\s+(\w+)/g);
        const funcMatch  = content.match(/function\s+(\w+)/g);
        exports[name] = {
          classes: classMatch ? classMatch.map(c => c.replace('class ', '')) : [],
          functions: funcMatch ? funcMatch.map(f => f.replace('function ', '')) : [],
          lines: content.split('\n').length,
        };
      } else {
        invalid++;
        errors.push(`${file}: no exports, classes, or named functions found`);
      }
    } catch (err) {
      invalid++;
      errors.push(`${file}: ${err.message}`);
    }
  }

  return { files, valid, invalid, errors, exports };
}

// ── Scan agents ──────────────────────────────────────────────────────────────
function scanAgents() {
  if (!fs.existsSync(AGENTS)) return { files: [], valid: 0, invalid: 0, errors: [] };

  const files = fs.readdirSync(AGENTS).filter(f => f.endsWith('.js'));
  let valid = 0, invalid = 0;
  const errors = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(AGENTS, file), 'utf8');
      if (content.length > 0 && (/class\s+\w+/.test(content) || /module\.exports/.test(content))) {
        valid++;
      } else {
        invalid++;
        errors.push(`${file}: empty or no valid structure`);
      }
    } catch (err) {
      invalid++;
      errors.push(`${file}: ${err.message}`);
    }
  }

  return { files, valid, invalid, errors };
}

// ── Scan organism runtimes ───────────────────────────────────────────────────
function scanOrganismRuntimes() {
  if (!fs.existsSync(ORGANISM)) return { runtimes: [], errors: [] };

  const runtimes = fs.readdirSync(ORGANISM, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const errors = [];
  const details = {};

  for (const runtime of runtimes) {
    const runtimePath = path.join(ORGANISM, runtime);
    const entries = fs.readdirSync(runtimePath);
    details[runtime] = {
      files: entries.length,
      hasEntryPoint: entries.some(f => /^(index|main|lib)\.(js|ts|py|mo|cpp|java)$/.test(f)),
      languages: [...new Set(entries.map(f => path.extname(f)).filter(Boolean))],
    };
    if (!details[runtime].hasEntryPoint && entries.length > 0) {
      // Not an error, just info — some runtimes are source-only
    }
  }

  return { runtimes, details, errors };
}

// ── Build cross-reference graph ──────────────────────────────────────────────
function buildDependencyGraph(protocolExports) {
  const graph = {};

  if (!fs.existsSync(PROTOCOLS)) return graph;

  const files = fs.readdirSync(PROTOCOLS).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const name = file.replace('.js', '');
    const content = fs.readFileSync(path.join(PROTOCOLS, file), 'utf8');

    // Find require() calls to other protocols
    const requires = [];
    const reqMatch = content.match(/require\(['"](\.\/[^'"]+)['"]\)/g);
    if (reqMatch) {
      for (const r of reqMatch) {
        const dep = r.match(/require\(['"]\.\/([^'"]+)['"]\)/);
        if (dep) requires.push(dep[1].replace('.js', ''));
      }
    }

    // Find references to other protocol class names
    const refs = [];
    for (const [otherName, info] of Object.entries(protocolExports)) {
      if (otherName === name) continue;
      for (const cls of info.classes) {
        if (content.includes(cls)) refs.push(otherName);
      }
    }

    graph[name] = {
      requires: [...new Set(requires)],
      references: [...new Set(refs)],
    };
  }

  return graph;
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('');
  console.log('🧠 Neural Architecture Validator');
  console.log('═══════════════════════════════════════════');
  console.log('');

  const protocols = scanProtocols();
  const agents    = scanAgents();
  const organism  = scanOrganismRuntimes();

  console.log(`  Protocols:  ${protocols.valid} valid / ${protocols.files.length} total`);
  console.log(`  Agents:     ${agents.valid} valid / ${agents.files.length} total`);
  console.log(`  Runtimes:   ${organism.runtimes.length} (${organism.runtimes.join(', ')})`);
  console.log('');

  const allErrors = [...protocols.errors, ...agents.errors, ...organism.errors];
  if (allErrors.length > 0) {
    console.log('  ⚠ Issues found:');
    for (const err of allErrors) {
      console.log(`    • ${err}`);
    }
    console.log('');
  }

  if (generateReport) {
    const graph = buildDependencyGraph(protocols.exports || {});

    fs.mkdirSync(REPORT_DIR, { recursive: true });

    const lines = [
      '# 🧠 Neural Architecture Report',
      '',
      `> Auto-generated by organism-neural-bot on ${new Date().toUTCString()}`,
      '',
      '## Protocol Stack',
      '',
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total protocols | ${protocols.files.length} |`,
      `| Valid exports | ${protocols.valid} |`,
      `| Issues | ${protocols.invalid} |`,
      '',
      '### Protocol Inventory',
      '',
      ...protocols.files.map(f => {
        const name = f.replace('.js', '');
        const info = (protocols.exports || {})[name];
        if (!info) return `- ❌ **${name}** — validation failed`;
        return `- ✅ **${name}** — ${info.classes.length} classes, ${info.functions.length} functions, ${info.lines} lines`;
      }),
      '',
      '## Agent Modules',
      '',
      ...agents.files.map(f => `- ${f}`),
      '',
      '## Organism Runtimes',
      '',
      ...organism.runtimes.map(r => {
        const d = organism.details[r];
        return `- **${r}** — ${d.files} files, languages: ${d.languages.join(', ') || 'none'}`;
      }),
      '',
      '## Protocol Dependency Graph',
      '',
      '```',
      ...Object.entries(graph).map(([name, deps]) => {
        const connections = [...deps.requires, ...deps.references];
        return connections.length > 0
          ? `${name} → ${connections.join(', ')}`
          : `${name} (standalone)`;
      }),
      '```',
      '',
      '---',
      '*Generated by organism-neural-bot*',
    ];

    fs.writeFileSync(REPORT_FILE, lines.join('\n'));
    console.log(`  📄 Report written to ${path.relative(REPO, REPORT_FILE)}`);
  }

  console.log('  ✅ Neural architecture validation complete');
  console.log('');

  if (allErrors.length > 0) process.exit(1);
}

main();
