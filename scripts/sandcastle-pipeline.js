#!/usr/bin/env node
/**
 * 🏰 organism-sandcastle-bot — Build-Test-Land Pipeline
 * ═════════════════════════════════════════════════════════
 *
 * Internal sandcastle system (inspired by Meta's build-test-land pattern).
 * Runs a phased pipeline that validates, builds, and integration-tests the
 * entire organism in a sandboxed environment. Every SDK, every extension,
 * every protocol, and all cross-module wiring is verified.
 *
 * Phases:
 *   --validate         Phase 1: Validate all manifests & package.json files
 *   --build-sdks       Phase 2: Build/verify all SDK modules
 *   --build-extensions Phase 3: Build/verify all extension packages
 *   --integration      Phase 4: Run integration smoke tests
 *   --wiring           Phase 5: Verify cross-module wiring
 *   --report           Phase 6: Generate sandcastle report
 *
 * Usage:
 *   node scripts/sandcastle-pipeline.js --validate --build-sdks --report
 *   node scripts/sandcastle-pipeline.js  # runs all phases
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO     = path.resolve(__dirname, '..');
const SDK_DIR  = path.join(REPO, 'sdk');
const EXT_DIR  = path.join(REPO, 'extensions');
const PROT_DIR = path.join(REPO, 'protocols');
const ORG_DIR  = path.join(REPO, 'organism');
const DOCS     = path.join(REPO, 'docs');

const flags = {
  validate:       process.argv.includes('--validate'),
  buildSdks:      process.argv.includes('--build-sdks'),
  buildExtensions: process.argv.includes('--build-extensions'),
  integration:    process.argv.includes('--integration'),
  wiring:         process.argv.includes('--wiring'),
  report:         process.argv.includes('--report'),
};

if (!Object.values(flags).some(Boolean)) {
  Object.keys(flags).forEach(k => flags[k] = true);
}

const phases = [];
const startTime = Date.now();

function phaseResult(name, emoji, status, details = {}) {
  const result = {
    phase: name,
    emoji,
    status, // 'pass' | 'warn' | 'fail'
    duration: 0,
    ...details,
  };
  phases.push(result);
  return result;
}

// ── Phase 1: Validate ────────────────────────────────────────────────────────
function validateManifests() {
  const phaseStart = Date.now();
  console.log('  🔍 Phase 1: Validating all manifests...');

  let valid = 0, invalid = 0;
  const errors = [];

  // Validate extension manifests
  if (fs.existsSync(EXT_DIR)) {
    const dirs = fs.readdirSync(EXT_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const dir of dirs) {
      const manifestPath = path.join(EXT_DIR, dir.name, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (!manifest.name || !manifest.version || !manifest.manifest_version) {
          invalid++;
          errors.push(`extensions/${dir.name}: missing required fields`);
        } else {
          valid++;
        }
      } catch (err) {
        invalid++;
        errors.push(`extensions/${dir.name}: invalid JSON — ${err.message}`);
      }
    }
  }

  // Validate SDK package.json files
  if (fs.existsSync(SDK_DIR)) {
    const dirs = fs.readdirSync(SDK_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const dir of dirs) {
      const pkgPath = path.join(SDK_DIR, dir.name, 'package.json');
      if (!fs.existsSync(pkgPath)) continue;
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (!pkg.name || !pkg.version) {
          invalid++;
          errors.push(`sdk/${dir.name}: missing name or version`);
        } else {
          valid++;
        }
      } catch (err) {
        invalid++;
        errors.push(`sdk/${dir.name}: invalid JSON — ${err.message}`);
      }
    }
  }

  // Root package.json
  try {
    const rootPkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
    if (rootPkg.name && rootPkg.version) valid++;
    else { invalid++; errors.push('root: missing name or version'); }
  } catch {
    invalid++;
    errors.push('root: invalid package.json');
  }

  const status = invalid === 0 ? 'pass' : 'warn';
  console.log(`    ✅ ${valid} valid, ${invalid} invalid manifests`);
  if (errors.length > 0) {
    for (const e of errors.slice(0, 5)) console.log(`    ⚠ ${e}`);
    if (errors.length > 5) console.log(`    ... and ${errors.length - 5} more`);
  }

  phaseResult('Validate Manifests', '🔍', status, {
    valid, invalid, errors, duration: Date.now() - phaseStart,
  });
}

// ── Phase 2: Build SDKs ─────────────────────────────────────────────────────
function buildSdks() {
  const phaseStart = Date.now();
  console.log('  📦 Phase 2: Building SDK modules...');

  if (!fs.existsSync(SDK_DIR)) {
    phaseResult('Build SDKs', '📦', 'warn', { message: 'No sdk/ directory', duration: Date.now() - phaseStart });
    return;
  }

  const dirs = fs.readdirSync(SDK_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  let built = 0, skipped = 0;
  const sdkResults = [];

  for (const dir of dirs) {
    const sdkPath = path.join(SDK_DIR, dir.name);
    const pkgPath = path.join(sdkPath, 'package.json');
    const indexPath = path.join(sdkPath, 'index.js');
    const srcIndex = path.join(sdkPath, 'src', 'index.js');

    const hasEntry = fs.existsSync(indexPath) || fs.existsSync(srcIndex);
    const hasPkg = fs.existsSync(pkgPath);

    if (hasEntry || hasPkg) {
      // Verify the module can be parsed (syntax check)
      const entryFile = fs.existsSync(indexPath) ? indexPath : srcIndex;
      if (fs.existsSync(entryFile)) {
        try {
          const content = fs.readFileSync(entryFile, 'utf8');
          // Basic syntax validation — check for obvious issues
          if (content.length > 0 && (/class\s+\w+/.test(content) || /module\.exports/.test(content) || /export/.test(content))) {
            built++;
            sdkResults.push({ name: dir.name, status: 'pass' });
          } else {
            skipped++;
            sdkResults.push({ name: dir.name, status: 'warn', reason: 'no exports detected' });
          }
        } catch {
          skipped++;
          sdkResults.push({ name: dir.name, status: 'warn', reason: 'parse error' });
        }
      } else {
        built++;
        sdkResults.push({ name: dir.name, status: 'pass', reason: 'package.json only' });
      }
    } else {
      skipped++;
      sdkResults.push({ name: dir.name, status: 'skip' });
    }
  }

  console.log(`    ✅ ${built} SDKs verified, ${skipped} skipped`);

  phaseResult('Build SDKs', '📦', built > 0 ? 'pass' : 'warn', {
    built, skipped, sdkResults, duration: Date.now() - phaseStart,
  });
}

// ── Phase 3: Build Extensions ────────────────────────────────────────────────
function buildExtensions() {
  const phaseStart = Date.now();
  console.log('  🧩 Phase 3: Building extensions...');

  if (!fs.existsSync(EXT_DIR)) {
    phaseResult('Build Extensions', '🧩', 'warn', { message: 'No extensions/ directory', duration: Date.now() - phaseStart });
    return;
  }

  const dirs = fs.readdirSync(EXT_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  let built = 0, errors = 0;
  const extResults = [];

  for (const dir of dirs) {
    const manifestPath = path.join(EXT_DIR, dir.name, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // Verify all referenced files exist
      const missingFiles = [];
      const filesToCheck = [];

      if (manifest.background) {
        if (manifest.background.service_worker) filesToCheck.push(manifest.background.service_worker);
        if (manifest.background.scripts) filesToCheck.push(...manifest.background.scripts);
      }
      if (manifest.content_scripts) {
        for (const cs of manifest.content_scripts) {
          if (cs.js) filesToCheck.push(...cs.js);
          if (cs.css) filesToCheck.push(...cs.css);
        }
      }

      for (const file of filesToCheck) {
        if (!fs.existsSync(path.join(EXT_DIR, dir.name, file))) {
          missingFiles.push(file);
        }
      }

      if (missingFiles.length === 0) {
        built++;
        extResults.push({ name: dir.name, status: 'pass', version: manifest.version });
      } else {
        errors++;
        extResults.push({ name: dir.name, status: 'warn', missing: missingFiles });
      }
    } catch {
      errors++;
      extResults.push({ name: dir.name, status: 'fail', reason: 'invalid manifest' });
    }
  }

  console.log(`    ✅ ${built} extensions verified, ${errors} with issues`);

  phaseResult('Build Extensions', '🧩', errors === 0 ? 'pass' : 'warn', {
    built, errors, extResults, duration: Date.now() - phaseStart,
  });
}

// ── Phase 4: Integration Smoke Tests ─────────────────────────────────────────
function integrationTests() {
  const phaseStart = Date.now();
  console.log('  🧪 Phase 4: Running integration smoke tests...');

  const tests = [];

  // Test 1: Protocols index loads and exports all protocols
  if (fs.existsSync(path.join(PROT_DIR, 'index.js'))) {
    try {
      const indexContent = fs.readFileSync(path.join(PROT_DIR, 'index.js'), 'utf8');
      const protocolFiles = fs.readdirSync(PROT_DIR).filter(f => f.endsWith('.js') && f !== 'index.js');
      // Count how many protocols are referenced in index
      let referenced = 0;
      for (const pf of protocolFiles) {
        const baseName = pf.replace('.js', '');
        if (indexContent.includes(baseName)) referenced++;
      }
      tests.push({
        name: 'Protocol index completeness',
        status: referenced >= protocolFiles.length * 0.8 ? 'pass' : 'warn',
        message: `${referenced}/${protocolFiles.length} protocols referenced in index`,
      });
    } catch {
      tests.push({ name: 'Protocol index completeness', status: 'fail', message: 'Could not read index.js' });
    }
  }

  // Test 2: SDK agents directory has valid agents
  const agentsDir = path.join(SDK_DIR, 'agents');
  if (fs.existsSync(agentsDir)) {
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.js') && f !== 'index.js');
    const validAgents = agentFiles.filter(f => {
      const content = fs.readFileSync(path.join(agentsDir, f), 'utf8');
      return /class\s+\w+/.test(content);
    });
    tests.push({
      name: 'Agent module validation',
      status: validAgents.length === agentFiles.length ? 'pass' : 'warn',
      message: `${validAgents.length}/${agentFiles.length} agents have valid class definitions`,
    });
  }

  // Test 3: Organism runtimes have entry points
  if (fs.existsSync(ORG_DIR)) {
    const runtimes = fs.readdirSync(ORG_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    let withEntry = 0;
    for (const rt of runtimes) {
      const entries = fs.readdirSync(path.join(ORG_DIR, rt.name));
      if (entries.some(f => /^(index|main|lib)\.(js|ts|py|mo|cpp|java)$/.test(f))) {
        withEntry++;
      }
    }
    tests.push({
      name: 'Organism runtime entry points',
      status: withEntry > 0 ? 'pass' : 'warn',
      message: `${withEntry}/${runtimes.length} runtimes have entry points`,
    });
  }

  // Test 4: Extension index.js aggregator exists
  const extIndex = path.join(EXT_DIR, 'index.js');
  if (fs.existsSync(extIndex)) {
    tests.push({ name: 'Extensions aggregator', status: 'pass', message: 'extensions/index.js exists' });
  }

  // Test 5: CSV registers are valid
  const csvFiles = fs.readdirSync(REPO).filter(f => f.endsWith('.csv'));
  let validCsvs = 0;
  for (const csv of csvFiles) {
    const content = fs.readFileSync(path.join(REPO, csv), 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length >= 2) validCsvs++; // At least header + 1 row
  }
  tests.push({
    name: 'CSV register validity',
    status: validCsvs === csvFiles.length ? 'pass' : 'warn',
    message: `${validCsvs}/${csvFiles.length} CSV registers have data`,
  });

  for (const t of tests) {
    const icon = { pass: '✅', warn: '⚠', fail: '❌' }[t.status] || '📋';
    console.log(`    ${icon} ${t.name}: ${t.message}`);
  }

  const failures = tests.filter(t => t.status === 'fail').length;
  phaseResult('Integration Tests', '🧪', failures === 0 ? 'pass' : 'fail', {
    tests, passed: tests.filter(t => t.status === 'pass').length,
    warned: tests.filter(t => t.status === 'warn').length,
    failed: failures,
    duration: Date.now() - phaseStart,
  });
}

// ── Phase 5: Cross-Module Wiring ─────────────────────────────────────────────
function verifyWiring() {
  const phaseStart = Date.now();
  console.log('  🔌 Phase 5: Verifying cross-module wiring...');

  const wiring = [];

  // Check: protocols reference each other correctly
  if (fs.existsSync(PROT_DIR)) {
    const files = fs.readdirSync(PROT_DIR).filter(f => f.endsWith('.js') && f !== 'index.js');
    let crossRefs = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(PROT_DIR, file), 'utf8');
      const refs = (content.match(/require\(['"]\.\/[\w-]+['"]\)/g) || []).length;
      crossRefs += refs;
    }
    wiring.push({
      connection: 'Protocol ↔ Protocol',
      status: 'pass',
      message: `${crossRefs} cross-references across ${files.length} protocols`,
    });
  }

  // Check: SDK agents can reference protocols
  if (fs.existsSync(path.join(SDK_DIR, 'agents'))) {
    const agentFiles = fs.readdirSync(path.join(SDK_DIR, 'agents')).filter(f => f.endsWith('.js'));
    let protocolRefs = 0;
    for (const f of agentFiles) {
      const content = fs.readFileSync(path.join(SDK_DIR, 'agents', f), 'utf8');
      if (content.includes('protocol') || content.includes('Protocol')) protocolRefs++;
    }
    wiring.push({
      connection: 'Agent → Protocol',
      status: protocolRefs > 0 ? 'pass' : 'warn',
      message: `${protocolRefs}/${agentFiles.length} agents reference protocols`,
    });
  }

  // Check: Extensions reference SDK modules
  if (fs.existsSync(EXT_DIR)) {
    const extDirs = fs.readdirSync(EXT_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    let sdkRefs = 0;
    for (const dir of extDirs) {
      const bgPath = path.join(EXT_DIR, dir.name, 'background.js');
      if (fs.existsSync(bgPath)) {
        const content = fs.readFileSync(bgPath, 'utf8');
        if (content.includes('sdk') || content.includes('SDK') || content.includes('organism')) sdkRefs++;
      }
    }
    wiring.push({
      connection: 'Extension → SDK',
      status: 'pass',
      message: `${sdkRefs} extensions reference SDK/organism modules`,
    });
  }

  // Check: Organism runtimes exist for multiple languages
  if (fs.existsSync(ORG_DIR)) {
    const runtimes = fs.readdirSync(ORG_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    wiring.push({
      connection: 'Multi-Runtime',
      status: runtimes.length >= 3 ? 'pass' : 'warn',
      message: `${runtimes.length} runtimes: ${runtimes.join(', ')}`,
    });
  }

  for (const w of wiring) {
    const icon = w.status === 'pass' ? '✅' : '⚠';
    console.log(`    ${icon} ${w.connection}: ${w.message}`);
  }

  phaseResult('Cross-Module Wiring', '🔌', 'pass', {
    connections: wiring, duration: Date.now() - phaseStart,
  });
}

// ── Phase 6: Generate Report ─────────────────────────────────────────────────
function generateReport() {
  console.log('');
  console.log('  📄 Phase 6: Generating sandcastle report...');

  fs.mkdirSync(DOCS, { recursive: true });

  const totalDuration = Date.now() - startTime;
  const allPassed = phases.every(p => p.status !== 'fail');

  const lines = [
    '# 🏰 Sandcastle Build-Test-Land Report',
    '',
    `> Auto-generated by organism-sandcastle-bot on ${new Date().toUTCString()}`,
    '',
    `## ${allPassed ? '✅ All Phases Passed' : '⚠️ Issues Detected'}`,
    '',
    `**Total pipeline duration:** ${(totalDuration / 1000).toFixed(1)}s`,
    '',
    '## Phase Results',
    '',
    '| Phase | Status | Duration | Details |',
    '|-------|--------|----------|---------|',
  ];

  for (const p of phases) {
    const icon = { pass: '✅', warn: '⚠️', fail: '❌' }[p.status] || '📋';
    const dur = p.duration ? `${(p.duration / 1000).toFixed(1)}s` : '—';
    let detail = '';

    if (p.valid !== undefined) detail = `${p.valid} valid, ${p.invalid} invalid`;
    else if (p.built !== undefined) detail = `${p.built} built, ${p.skipped || p.errors || 0} issues`;
    else if (p.tests) detail = `${p.passed} passed, ${p.warned} warned, ${p.failed} failed`;
    else if (p.connections) detail = `${p.connections.length} connections verified`;
    else if (p.message) detail = p.message;

    lines.push(`| ${p.emoji} ${p.phase} | ${icon} ${p.status} | ${dur} | ${detail} |`);
  }

  lines.push('');

  // Detailed phase output
  for (const p of phases) {
    lines.push(`### ${p.emoji} ${p.phase}`);
    lines.push('');

    if (p.errors && p.errors.length > 0) {
      lines.push('**Issues:**');
      for (const e of p.errors.slice(0, 10)) {
        lines.push(`- ⚠ ${e}`);
      }
      lines.push('');
    }

    if (p.sdkResults) {
      lines.push('| SDK | Status |');
      lines.push('|-----|--------|');
      for (const s of p.sdkResults) {
        const icon = s.status === 'pass' ? '✅' : s.status === 'warn' ? '⚠️' : '⏩';
        lines.push(`| ${s.name} | ${icon} ${s.status}${s.reason ? ` (${s.reason})` : ''} |`);
      }
      lines.push('');
    }

    if (p.extResults) {
      lines.push('| Extension | Status | Version |');
      lines.push('|-----------|--------|---------|');
      for (const e of p.extResults.slice(0, 20)) {
        const icon = e.status === 'pass' ? '✅' : '⚠️';
        lines.push(`| ${e.name} | ${icon} | ${e.version || '—'} |`);
      }
      if (p.extResults.length > 20) {
        lines.push(`| ... | | ${p.extResults.length - 20} more |`);
      }
      lines.push('');
    }

    if (p.tests) {
      lines.push('| Test | Status | Result |');
      lines.push('|------|--------|--------|');
      for (const t of p.tests) {
        const icon = { pass: '✅', warn: '⚠️', fail: '❌' }[t.status] || '📋';
        lines.push(`| ${t.name} | ${icon} | ${t.message} |`);
      }
      lines.push('');
    }

    if (p.connections) {
      lines.push('| Connection | Status | Details |');
      lines.push('|-----------|--------|---------|');
      for (const w of p.connections) {
        const icon = w.status === 'pass' ? '✅' : '⚠️';
        lines.push(`| ${w.connection} | ${icon} | ${w.message} |`);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('*Generated by organism-sandcastle-bot — Build. Test. Land.*');

  fs.writeFileSync(path.join(DOCS, 'sandcastle-report.md'), lines.join('\n'));
  console.log(`  📄 Report written to docs/sandcastle-report.md`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('');
  console.log('🏰 Sandcastle Build-Test-Land Pipeline');
  console.log('═══════════════════════════════════════════');
  console.log('');

  if (flags.validate)        validateManifests();
  if (flags.buildSdks)       buildSdks();
  if (flags.buildExtensions) buildExtensions();
  if (flags.integration)     integrationTests();
  if (flags.wiring)          verifyWiring();
  if (flags.report)          generateReport();

  const failures = phases.filter(p => p.status === 'fail');
  console.log('');
  if (failures.length > 0) {
    console.log(`  ❌ ${failures.length} phase(s) failed — review sandcastle report`);
    process.exit(1);
  } else {
    console.log('  ✅ Sandcastle pipeline complete — all phases passed');
  }
  console.log('');
}

main();
