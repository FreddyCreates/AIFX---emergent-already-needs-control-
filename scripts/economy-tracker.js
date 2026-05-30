#!/usr/bin/env node
/**
 * 💰 organism-economy-bot — Marketplace Analytics & Economy Tracker
 * ═════════════════════════════════════════════════════════════════════
 *
 * Scans the organism's marketplace assets — SDKs, extensions, protocols,
 * CSV registers — and produces economy dashboards tracking asset size,
 * complexity, coverage, and ecosystem health.
 *
 * Flags:
 *   --scan       Discover and inventory all marketplace assets
 *   --analyze    Compute economy metrics (complexity, coverage, distribution)
 *   --report     Generate economy dashboard to docs/
 *
 * Usage:
 *   node scripts/economy-tracker.js --scan
 *   node scripts/economy-tracker.js --report
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO     = path.resolve(__dirname, '..');
const SDK_DIR  = path.join(REPO, 'sdk');
const EXT_DIR  = path.join(REPO, 'extensions');
const PROT_DIR = path.join(REPO, 'protocols');
const DOCS     = path.join(REPO, 'docs');

const flags = {
  scan:    process.argv.includes('--scan'),
  analyze: process.argv.includes('--analyze'),
  report:  process.argv.includes('--report'),
};

if (!Object.values(flags).some(Boolean)) {
  Object.keys(flags).forEach(k => flags[k] = true);
}

// ── Helper: count lines in a file ────────────────────────────────────────────
function countLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split('\n').length;
  } catch { return 0; }
}

// ── Helper: get directory size ───────────────────────────────────────────────
function dirSize(dir, depth = 0) {
  if (depth > 5 || !fs.existsSync(dir)) return 0;
  let total = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += dirSize(fullPath, depth + 1);
    } else {
      try { total += fs.statSync(fullPath).size; } catch { /* skip */ }
    }
  }
  return total;
}

// ── Scan ─────────────────────────────────────────────────────────────────────
function scanAssets() {
  console.log('  💰 Scanning marketplace assets...');

  const assets = {
    sdks: [],
    extensions: [],
    protocols: [],
    registers: [],
    timestamp: new Date().toISOString(),
  };

  // SDKs
  if (fs.existsSync(SDK_DIR)) {
    const dirs = fs.readdirSync(SDK_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const dir of dirs) {
      const sdkPath = path.join(SDK_DIR, dir.name);
      const pkgPath = path.join(sdkPath, 'package.json');
      let pkg = {};
      try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch { /* skip */ }

      assets.sdks.push({
        name: dir.name,
        packageName: pkg.name || dir.name,
        version: pkg.version || '0.0.0',
        size: dirSize(sdkPath),
        hasIndex: fs.existsSync(path.join(sdkPath, 'index.js')),
        hasPkg: fs.existsSync(pkgPath),
      });
    }
  }

  // Extensions
  if (fs.existsSync(EXT_DIR)) {
    const dirs = fs.readdirSync(EXT_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const dir of dirs) {
      const extPath = path.join(EXT_DIR, dir.name);
      const manifestPath = path.join(extPath, 'manifest.json');
      let manifest = {};
      try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { /* skip */ }

      assets.extensions.push({
        name: dir.name,
        displayName: manifest.name || dir.name,
        version: manifest.version || '0.0.0',
        size: dirSize(extPath),
        hasManifest: fs.existsSync(manifestPath),
        permissionCount: (manifest.permissions || []).length,
      });
    }
  }

  // Protocols
  if (fs.existsSync(PROT_DIR)) {
    const files = fs.readdirSync(PROT_DIR).filter(f => f.endsWith('.js') && f !== 'index.js');
    for (const file of files) {
      const filePath = path.join(PROT_DIR, file);
      const lines = countLines(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const hasClass = /class\s+\w+/.test(content);
      const exportCount = (content.match(/export\s+/g) || []).length;

      assets.protocols.push({
        name: file.replace('.js', ''),
        lines,
        hasClass,
        exportCount,
        size: fs.statSync(filePath).size,
      });
    }
  }

  // CSV Registers
  const csvFiles = fs.readdirSync(REPO).filter(f => f.endsWith('.csv'));
  for (const csv of csvFiles) {
    const filePath = path.join(REPO, csv);
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = content.trim().split('\n');
    const headers = rows[0] ? rows[0].split(',').length : 0;

    assets.registers.push({
      name: csv,
      rows: rows.length - 1,  // Minus header
      columns: headers,
      size: fs.statSync(filePath).size,
    });
  }

  console.log(`    📦 SDKs: ${assets.sdks.length}`);
  console.log(`    🧩 Extensions: ${assets.extensions.length}`);
  console.log(`    🔬 Protocols: ${assets.protocols.length}`);
  console.log(`    📊 Registers: ${assets.registers.length}`);

  return assets;
}

// ── Analyze ──────────────────────────────────────────────────────────────────
function analyzeEconomy(assets) {
  console.log('\n  💰 Analyzing economy metrics...');

  const totalSdkSize = assets.sdks.reduce((s, a) => s + a.size, 0);
  const totalExtSize = assets.extensions.reduce((s, a) => s + a.size, 0);
  const totalProtLines = assets.protocols.reduce((s, a) => s + a.lines, 0);
  const totalRegRows = assets.registers.reduce((s, a) => s + a.rows, 0);

  const avgProtLines = assets.protocols.length > 0 ? Math.round(totalProtLines / assets.protocols.length) : 0;
  const avgSdkSize = assets.sdks.length > 0 ? Math.round(totalSdkSize / assets.sdks.length) : 0;

  // Complexity score (higher = more complex ecosystem)
  const complexityScore = Math.round(
    (assets.sdks.length * 3 + assets.extensions.length * 2 + assets.protocols.length * 4 + assets.registers.length) / 10
  );

  // Coverage score (how well-formed is each asset)
  const sdkCoverage = assets.sdks.length > 0
    ? assets.sdks.filter(s => s.hasIndex && s.hasPkg).length / assets.sdks.length
    : 0;
  const extCoverage = assets.extensions.length > 0
    ? assets.extensions.filter(e => e.hasManifest).length / assets.extensions.length
    : 0;
  const protCoverage = assets.protocols.length > 0
    ? assets.protocols.filter(p => p.hasClass).length / assets.protocols.length
    : 0;

  const metrics = {
    totalAssets: assets.sdks.length + assets.extensions.length + assets.protocols.length + assets.registers.length,
    totalSdkSize,
    totalExtSize,
    totalProtLines,
    totalRegRows,
    avgProtLines,
    avgSdkSize,
    complexityScore,
    sdkCoverage: Math.round(sdkCoverage * 100),
    extCoverage: Math.round(extCoverage * 100),
    protCoverage: Math.round(protCoverage * 100),
    overallCoverage: Math.round(((sdkCoverage + extCoverage + protCoverage) / 3) * 100),
  };

  console.log(`    📊 Complexity Score: ${metrics.complexityScore}`);
  console.log(`    📊 Overall Coverage: ${metrics.overallCoverage}%`);
  console.log(`    📊 Total Assets: ${metrics.totalAssets}`);

  return metrics;
}

// ── Report ───────────────────────────────────────────────────────────────────
function generateReport(assets, metrics) {
  console.log('\n  💰 Generating economy dashboard...');

  fs.mkdirSync(DOCS, { recursive: true });

  const formatSize = (bytes) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const lines = [
    '# 💰 Organism Economy Dashboard',
    '',
    `> Auto-generated by organism-economy-bot on ${new Date().toUTCString()}`,
    '',
    '## Economy Overview',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Total Marketplace Assets | ${metrics.totalAssets} |`,
    `| Ecosystem Complexity Score | ${metrics.complexityScore} |`,
    `| Overall Coverage | ${metrics.overallCoverage}% |`,
    `| Total SDK Footprint | ${formatSize(metrics.totalSdkSize)} |`,
    `| Total Extension Footprint | ${formatSize(metrics.totalExtSize)} |`,
    `| Total Protocol Lines | ${metrics.totalProtLines.toLocaleString()} |`,
    `| Total Register Rows | ${metrics.totalRegRows.toLocaleString()} |`,
    '',
    '## 📦 SDK Economy',
    '',
    `SDK Coverage: **${metrics.sdkCoverage}%** (${assets.sdks.filter(s => s.hasIndex && s.hasPkg).length}/${assets.sdks.length} fully packaged)`,
    '',
    '| SDK | Package | Version | Size | Index | Package.json |',
    '|-----|---------|---------|------|-------|-------------|',
    ...assets.sdks.map(s =>
      `| ${s.name} | ${s.packageName} | ${s.version} | ${formatSize(s.size)} | ${s.hasIndex ? '✅' : '❌'} | ${s.hasPkg ? '✅' : '❌'} |`
    ),
    '',
    '## 🧩 Extension Economy',
    '',
    `Extension Coverage: **${metrics.extCoverage}%** (${assets.extensions.filter(e => e.hasManifest).length}/${assets.extensions.length} with manifests)`,
    '',
    '| Extension | Display Name | Version | Size | Permissions |',
    '|-----------|-------------|---------|------|-------------|',
    ...assets.extensions.map(e =>
      `| ${e.name} | ${e.displayName} | ${e.version} | ${formatSize(e.size)} | ${e.permissionCount} |`
    ),
    '',
    '## 🔬 Protocol Economy',
    '',
    `Protocol Coverage: **${metrics.protCoverage}%** (${assets.protocols.filter(p => p.hasClass).length}/${assets.protocols.length} with class definitions)`,
    '',
    '| Protocol | Lines | Exports | Has Class | Size |',
    '|----------|-------|---------|-----------|------|',
    ...assets.protocols.map(p =>
      `| ${p.name} | ${p.lines} | ${p.exportCount} | ${p.hasClass ? '✅' : '❌'} | ${formatSize(p.size)} |`
    ),
    '',
    '## 📊 Register Economy',
    '',
    '| Register | Rows | Columns | Size |',
    '|----------|------|---------|------|',
    ...assets.registers.map(r =>
      `| ${r.name} | ${r.rows} | ${r.columns} | ${formatSize(r.size)} |`
    ),
    '',
    '---',
    '*Generated by organism-economy-bot*',
  ];

  fs.writeFileSync(path.join(DOCS, 'economy-dashboard.md'), lines.join('\n'));
  console.log(`  📄 Dashboard written to docs/economy-dashboard.md`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('');
  console.log('💰 Economy & Marketplace Analytics');
  console.log('═══════════════════════════════════════════');
  console.log('');

  let assets = null, metrics = null;

  if (flags.scan || flags.report)    assets = scanAssets();
  if (flags.analyze || flags.report) metrics = analyzeEconomy(assets || scanAssets());
  if (flags.report)                  generateReport(assets || scanAssets(), metrics || analyzeEconomy(assets || scanAssets()));

  console.log('');
  console.log('  ✅ Economy scan complete');
  console.log('');
}

main();
