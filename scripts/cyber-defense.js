#!/usr/bin/env node
/**
 * 🔐 organism-cyber-bot — Cyber Defense & Threat Intelligence Script
 * ════════════════════════════════════════════════════════════════════
 *
 * Scans all code for threat indicators, maps attack surface, computes
 * the defense matrix, and generates a full cyber security report.
 *
 * Uses the CyberDefenseProtocol patterns (PROTO-225) implemented here
 * as a static analysis engine (CommonJS compatible for CI use).
 *
 * Flags:
 *   --scan     Scan all code for threat indicators
 *   --surface  Map the external attack surface
 *   --matrix   Compute defense matrix score
 *   --report   Generate cyber report to docs/
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs');

const flags = {
  scan:    process.argv.includes('--scan'),
  surface: process.argv.includes('--surface'),
  matrix:  process.argv.includes('--matrix'),
  report:  process.argv.includes('--report'),
};
if (!Object.values(flags).some(Boolean)) Object.keys(flags).forEach(k => flags[k] = true);

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

// Threat indicator patterns (PROTO-225 patterns, inlined for CI)
const THREAT_PATTERNS = [
  { name: 'hardcoded-secret',    regex: /(?:password|secret|token|key)\s*=\s*['"][^'"]{8,}['"]/gi, severity: 0.9 },
  { name: 'eval-usage',          regex: /\beval\s*\(/g,                                              severity: 0.7 },
  { name: 'dangerouslySetHTML',  regex: /dangerouslySetInnerHTML/g,                                 severity: 0.6 },
  { name: 'prototype-pollution', regex: /\.__proto__\s*=/g,                                         severity: 0.8 },
  { name: 'command-injection',   regex: /exec\s*\([^)]*\+/g,                                        severity: 0.75 },
  { name: 'weak-crypto',         regex: /(?:md5|sha1)\s*\(/gi,                                      severity: 0.5 },
  { name: 'insecure-random',     regex: /Math\.random\(\)/g,                                        severity: 0.2 },
  { name: 'http-not-https',      regex: /http:\/\/(?!localhost|127\.0\.0\.1)/g,                     severity: 0.35 },
];

const IGNORE = new Set(['.git', 'node_modules', 'dist', '.github']);

function walkFiles(dir, depth = 0) {
  if (depth > 8 || !fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (IGNORE.has(e.name) || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walkFiles(full, depth + 1));
    else if (['.js', '.ts', '.mjs', '.json'].includes(path.extname(e.name))) files.push(full);
  }
  return files;
}

// ── Phase 1: Threat Scan ──────────────────────────────────────────────────────
function runScan() {
  console.log('  🔐 Phase 1 — Threat Scan...');

  const threats = [];
  const files = walkFiles(REPO);
  let filesScanned = 0;

  for (const filePath of files) {
    const relPath = path.relative(REPO, filePath);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines   = content.split('\n');

      for (const { name, regex, severity } of THREAT_PATTERNS) {
        // Reset lastIndex for global regexes
        const pat = new RegExp(regex.source, regex.flags);
        for (let i = 0; i < lines.length; i++) {
          if (pat.test(lines[i])) {
            threats.push({ name, severity, file: relPath, line: i + 1,
              snippet: lines[i].trim().slice(0, 80) });
          }
        }
      }
      filesScanned++;
    } catch { /* skip binary files */ }
  }

  // Filter false positives (e.g. comments, test files)
  const filtered = threats.filter(t => {
    if (t.file.includes('test/') || t.file.includes('.test.')) {
      return t.severity >= 0.7; // Only show high severity in tests
    }
    return true;
  });

  console.log(`    📊 Files scanned: ${filesScanned}`);
  console.log(`    ⚠ Indicators found: ${filtered.length}`);
  console.log(`    🚨 Critical: ${filtered.filter(t => t.severity >= 0.9).length}`);
  console.log(`    🔴 High: ${filtered.filter(t => t.severity >= PHI_INV && t.severity < 0.9).length}`);

  return filtered;
}

// ── Phase 2: Attack Surface Map ───────────────────────────────────────────────
function mapSurface() {
  console.log('  🔐 Phase 2 — Attack Surface Mapping...');

  const surface = [];
  const extDir  = path.join(REPO, 'extensions');
  const sdkDir  = path.join(REPO, 'sdk');

  // Extensions (public-facing)
  if (fs.existsSync(extDir)) {
    const exts = fs.readdirSync(extDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const ext of exts) {
      const manifestPath = path.join(extDir, ext.name, 'manifest.json');
      let permissions = [];
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        permissions = manifest.permissions || [];
      } catch { /* skip */ }

      surface.push({
        id: `ext-${ext.name}`,
        category: 'extension',
        name: ext.name,
        exposed: true,
        permissions,
        riskScore: permissions.length > 5 ? 0.6 : permissions.includes('*') ? 0.9 : 0.3,
      });
    }
  }

  // SDK modules (public API surface)
  if (fs.existsSync(sdkDir)) {
    const mods = fs.readdirSync(sdkDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const mod of mods) {
      surface.push({
        id: `sdk-${mod.name}`,
        category: 'sdk',
        name: mod.name,
        exposed: true,
        permissions: [],
        riskScore: 0.2,
      });
    }
  }

  // Protocols (internal API)
  const protDir = path.join(REPO, 'protocols');
  if (fs.existsSync(protDir)) {
    const prots = fs.readdirSync(protDir).filter(f => f.endsWith('.js') && f !== 'index.js');
    surface.push({
      id: 'protocols',
      category: 'protocol',
      name: `${prots.length} active protocols`,
      exposed: false,
      permissions: [],
      riskScore: 0.1,
    });
  }

  // Deployment targets
  surface.push(
    { id: 'deploy-icp',    category: 'deployment', name: 'ICP Canister', exposed: true, permissions: [], riskScore: 0.25 },
    { id: 'deploy-pages',  category: 'deployment', name: 'GitHub Pages', exposed: true, permissions: [], riskScore: 0.15 },
    { id: 'deploy-edge',   category: 'deployment', name: 'Edge Workers', exposed: true, permissions: [], riskScore: 0.2 },
  );

  console.log(`    📊 Attack surface entries: ${surface.length}`);
  return surface;
}

// ── Phase 3: Defense Matrix ───────────────────────────────────────────────────
function computeMatrix(threats, surface) {
  console.log('  🔐 Phase 3 — Defense Matrix...');

  const unmitigated = threats;
  const avgSev = unmitigated.length > 0
    ? unmitigated.reduce((s, t) => s + t.severity, 0) / unmitigated.length
    : 0;
  const criticals = unmitigated.filter(t => t.severity >= 0.9).length;
  const highCount = unmitigated.filter(t => t.severity >= PHI_INV).length;

  const codeSecurity = Math.max(0, Math.round((1 - avgSev) * 100));
  const surfaceRisk  = surface.length > 0
    ? surface.reduce((s, e) => s + e.riskScore, 0) / surface.length
    : 0;
  const surfaceSecurity = Math.round((1 - surfaceRisk) * 100);
  const threatPosture   = Math.max(0, 100 - criticals * 15 - highCount * 5);
  const overallScore    = Math.round((codeSecurity + surfaceSecurity + threatPosture) / 3);

  const matrix = { codeSecurity, surfaceSecurity, threatPosture, overallScore };

  const statusIcon = overallScore >= 80 ? '✅' : overallScore >= 60 ? '⚠️' : '🚨';
  console.log(`    ${statusIcon} Overall Defense Score: ${overallScore}/100`);
  console.log(`    💻 Code Security: ${codeSecurity}/100`);
  console.log(`    🌐 Surface Security: ${surfaceSecurity}/100`);
  console.log(`    🛡️ Threat Posture: ${threatPosture}/100`);

  return matrix;
}

// ── Phase 4: Report ───────────────────────────────────────────────────────────
function generateReport(threats, surface, matrix) {
  console.log('  🔐 Phase 4 — Generating Cyber Report...');

  fs.mkdirSync(DOCS, { recursive: true });

  const scoreIcon = matrix.overallScore >= 80 ? '✅' : matrix.overallScore >= 60 ? '⚠️' : '🚨';
  const threatsBySeverity = {
    critical: threats.filter(t => t.severity >= 0.9),
    high:     threats.filter(t => t.severity >= PHI_INV && t.severity < 0.9),
    medium:   threats.filter(t => t.severity >= 0.4 && t.severity < PHI_INV),
    low:      threats.filter(t => t.severity < 0.4),
  };

  const lines = [
    '# 🔐 Cyber Defense Report',
    '',
    `> Auto-generated by organism-cyber-bot on ${new Date().toUTCString()}`,
    '',
    '## Defense Matrix',
    '',
    '| Domain | Score | Status |',
    '|--------|-------|--------|',
    `| **Overall Posture** | **${matrix.overallScore}/100** | ${scoreIcon} |`,
    `| Code Security | ${matrix.codeSecurity}/100 | ${matrix.codeSecurity >= 70 ? '✅' : '⚠️'} |`,
    `| Surface Security | ${matrix.surfaceSecurity}/100 | ${matrix.surfaceSecurity >= 70 ? '✅' : '⚠️'} |`,
    `| Threat Posture | ${matrix.threatPosture}/100 | ${matrix.threatPosture >= 70 ? '✅' : '⚠️'} |`,
    '',
    '## Threat Summary',
    '',
    '| Level | Count |',
    '|-------|-------|',
    `| 🚨 Critical | ${threatsBySeverity.critical.length} |`,
    `| 🔴 High | ${threatsBySeverity.high.length} |`,
    `| 🟠 Medium | ${threatsBySeverity.medium.length} |`,
    `| 🟡 Low | ${threatsBySeverity.low.length} |`,
    `| **Total** | **${threats.length}** |`,
    '',
  ];

  // Top threats
  if (threatsBySeverity.critical.length > 0 || threatsBySeverity.high.length > 0) {
    const topThreats = [...threatsBySeverity.critical, ...threatsBySeverity.high].slice(0, 20);
    lines.push('## ⚠️ High-Priority Threats');
    lines.push('');
    lines.push('| Indicator | File | Line | Severity |');
    lines.push('|-----------|------|------|----------|');
    for (const t of topThreats) {
      const icon = t.severity >= 0.9 ? '🚨' : '🔴';
      lines.push(`| ${icon} ${t.name} | \`${t.file}\` | ${t.line} | ${t.severity.toFixed(2)} |`);
    }
    lines.push('');
  }

  // Attack surface
  lines.push('## 🌐 Attack Surface Map');
  lines.push('');
  lines.push('| Entry | Category | Exposed | Risk |');
  lines.push('|-------|----------|---------|------|');
  for (const e of surface) {
    const riskIcon = e.riskScore >= 0.7 ? '🔴' : e.riskScore >= 0.4 ? '🟠' : '🟢';
    lines.push(`| ${e.name} | ${e.category} | ${e.exposed ? 'Yes' : 'No'} | ${riskIcon} ${e.riskScore.toFixed(2)} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('*Generated by organism-cyber-bot (PROTO-225)*');

  fs.writeFileSync(path.join(DOCS, 'cyber-report.md'), lines.join('\n'));
  console.log('  📄 Cyber report written to docs/cyber-report.md');
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('\n🔐 Cyber Defense & Threat Intelligence\n═══════════════════════════════════════════\n');

  let threats = null, surface = null, matrix = null;

  if (flags.scan || flags.report)    threats = runScan();
  if (flags.surface || flags.report) surface = mapSurface();
  if (flags.matrix || flags.report)  matrix  = computeMatrix(threats || runScan(), surface || mapSurface());
  if (flags.report)                  generateReport(threats || runScan(), surface || mapSurface(), matrix || computeMatrix([], []));

  console.log('\n  ✅ Cyber defense cycle complete\n');
}

main();
