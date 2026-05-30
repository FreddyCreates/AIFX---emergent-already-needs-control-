#!/usr/bin/env node
/**
 * 🔄 organism-deps-bot — Dependency Scanner & Staleness Reporter
 * ════════════════════════════════════════════════════════════════
 *
 * Scans every package.json across the organism (root, SDKs, extensions,
 * desktop, electron) and checks for outdated / vulnerable dependencies.
 * Produces a freshness report and can create GitHub issues for critical updates.
 *
 * Flags:
 *   --scan     Find all package.json files and list deps
 *   --audit    Run npm audit on each package.json location
 *   --report   Generate dependency freshness report to docs/
 *   --issues   Create GitHub issues for critical updates (needs GITHUB_TOKEN)
 *
 * Usage:
 *   node scripts/scan-dependencies.js --scan
 *   node scripts/scan-dependencies.js --report
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const cp   = require('child_process');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs');

const flags = {
  scan:    process.argv.includes('--scan'),
  audit:   process.argv.includes('--audit'),
  report:  process.argv.includes('--report'),
  issues:  process.argv.includes('--issues'),
};

if (!Object.values(flags).some(Boolean)) {
  Object.keys(flags).forEach(k => flags[k] = true);
}

// ── Discover all package.json files ──────────────────────────────────────────
function findPackageJsons() {
  const results = [];

  const walk = (dir, depth = 0) => {
    if (depth > 4) return;
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const pkgPath = path.join(fullPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
          results.push({
            dir: fullPath,
            pkgPath,
            relative: path.relative(REPO, fullPath),
          });
        }
        walk(fullPath, depth + 1);
      }
    }
  };

  // Root package.json
  const rootPkg = path.join(REPO, 'package.json');
  if (fs.existsSync(rootPkg)) {
    results.push({ dir: REPO, pkgPath: rootPkg, relative: '.' });
  }

  walk(REPO);
  return results;
}

// ── Parse dependency info from a package.json ────────────────────────────────
function parseDeps(pkgPath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return {
      name: pkg.name || path.basename(path.dirname(pkgPath)),
      version: pkg.version || '0.0.0',
      deps: Object.entries(pkg.dependencies || {}),
      devDeps: Object.entries(pkg.devDependencies || {}),
      engines: pkg.engines || {},
    };
  } catch {
    return { name: '?', version: '?', deps: [], devDeps: [], engines: {} };
  }
}

// ── Scan for outdated dependencies ───────────────────────────────────────────
function scanOutdated(pkgLocations) {
  console.log('  🔍 Scanning for outdated dependencies...');

  const results = [];

  for (const loc of pkgLocations) {
    const info = parseDeps(loc.pkgPath);
    const allDeps = [...info.deps, ...info.devDeps];

    console.log(`    📦 ${loc.relative} (${info.name}@${info.version}) — ${allDeps.length} deps`);

    // Try npm outdated (only if node_modules exists or package-lock.json exists)
    const lockPath = path.join(loc.dir, 'package-lock.json');
    let outdated = [];

    if (fs.existsSync(lockPath)) {
      try {
        const output = cp.execSync('npm outdated --json 2>/dev/null || true', {
          cwd: loc.dir,
          encoding: 'utf8',
          timeout: 30000,
        });
        if (output.trim()) {
          const parsed = JSON.parse(output);
          outdated = Object.entries(parsed).map(([name, info]) => ({
            name,
            current: info.current || '?',
            wanted: info.wanted || '?',
            latest: info.latest || '?',
          }));
        }
      } catch { /* npm outdated exits non-zero when there are outdated deps */ }
    }

    results.push({
      location: loc.relative,
      name: info.name,
      version: info.version,
      totalDeps: allDeps.length,
      depsCount: info.deps.length,
      devDepsCount: info.devDeps.length,
      outdated,
      engines: info.engines,
    });
  }

  return results;
}

// ── Audit for vulnerabilities ────────────────────────────────────────────────
function auditVulnerabilities(pkgLocations) {
  console.log('  🛡️ Auditing for vulnerabilities...');

  const results = [];

  for (const loc of pkgLocations) {
    const lockPath = path.join(loc.dir, 'package-lock.json');
    if (!fs.existsSync(lockPath)) {
      console.log(`    ⏩ ${loc.relative} — no lock file, skipping audit`);
      continue;
    }

    try {
      const output = cp.execSync('npm audit --json 2>/dev/null || true', {
        cwd: loc.dir,
        encoding: 'utf8',
        timeout: 30000,
      });

      if (output.trim()) {
        const parsed = JSON.parse(output);
        const vulns = parsed.vulnerabilities || {};
        const severity = { critical: 0, high: 0, moderate: 0, low: 0 };

        for (const v of Object.values(vulns)) {
          const sev = v.severity || 'low';
          if (severity[sev] !== undefined) severity[sev]++;
        }

        const total = Object.values(severity).reduce((a, b) => a + b, 0);
        results.push({ location: loc.relative, ...severity, total });

        if (total > 0) {
          console.log(`    ⚠ ${loc.relative}: ${total} vulnerabilities (${severity.critical} critical, ${severity.high} high)`);
        } else {
          console.log(`    ✅ ${loc.relative}: clean`);
        }
      }
    } catch {
      console.log(`    ⏩ ${loc.relative} — audit skipped`);
    }
  }

  return results;
}

// ── Generate report ──────────────────────────────────────────────────────────
function generateReport(scanResults, auditResults) {
  console.log('');
  console.log('  📄 Generating dependency freshness report...');

  fs.mkdirSync(DOCS, { recursive: true });

  const totalDeps = scanResults.reduce((sum, r) => sum + r.totalDeps, 0);
  const totalOutdated = scanResults.reduce((sum, r) => sum + r.outdated.length, 0);
  const totalVulns = auditResults.reduce((sum, r) => sum + r.total, 0);

  const lines = [
    '# 🔄 Dependency Freshness Report',
    '',
    `> Auto-generated by organism-deps-bot on ${new Date().toUTCString()}`,
    '',
    '## Summary',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Package locations scanned | ${scanResults.length} |`,
    `| Total dependencies | ${totalDeps} |`,
    `| Outdated packages | ${totalOutdated} |`,
    `| Known vulnerabilities | ${totalVulns} |`,
    '',
    '## Package Locations',
    '',
    '| Location | Package | Version | Deps | DevDeps | Outdated |',
    '|----------|---------|---------|------|---------|----------|',
    ...scanResults.map(r =>
      `| \`${r.location}\` | ${r.name} | ${r.version} | ${r.depsCount} | ${r.devDepsCount} | ${r.outdated.length} |`
    ),
    '',
  ];

  // Outdated details
  const allOutdated = scanResults.flatMap(r =>
    r.outdated.map(o => ({ ...o, location: r.location }))
  );

  if (allOutdated.length > 0) {
    lines.push('## ⚠️ Outdated Dependencies');
    lines.push('');
    lines.push('| Location | Package | Current | Wanted | Latest |');
    lines.push('|----------|---------|---------|--------|--------|');
    for (const o of allOutdated) {
      lines.push(`| \`${o.location}\` | ${o.name} | ${o.current} | ${o.wanted} | ${o.latest} |`);
    }
    lines.push('');
  }

  // Vulnerability details
  if (auditResults.length > 0) {
    lines.push('## 🛡️ Vulnerability Audit');
    lines.push('');
    lines.push('| Location | Critical | High | Moderate | Low | Total |');
    lines.push('|----------|----------|------|----------|-----|-------|');
    for (const a of auditResults) {
      const icon = a.critical > 0 ? '🚨' : a.high > 0 ? '⚠️' : '✅';
      lines.push(`| ${icon} \`${a.location}\` | ${a.critical} | ${a.high} | ${a.moderate} | ${a.low} | ${a.total} |`);
    }
    lines.push('');
  }

  lines.push('## 🔧 Update Commands');
  lines.push('');
  lines.push('```bash');
  lines.push('# Update all dependencies in a specific location:');
  lines.push('cd <location> && npm update');
  lines.push('');
  lines.push('# Fix vulnerabilities:');
  lines.push('cd <location> && npm audit fix');
  lines.push('');
  lines.push('# Check specific package:');
  lines.push('npm view <package> version');
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('*Generated by organism-deps-bot*');

  fs.writeFileSync(path.join(DOCS, 'dependency-freshness-report.md'), lines.join('\n'));
  console.log(`  📄 Report written to docs/dependency-freshness-report.md`);
}

// ── Create GitHub issues for critical updates ────────────────────────────────
function createIssues(scanResults, auditResults) {
  console.log('  🎫 Checking for critical updates to create issues...');

  const criticalVulns = auditResults.filter(a => a.critical > 0);
  if (criticalVulns.length === 0) {
    console.log('    ✅ No critical vulnerabilities — no issues to create');
    return;
  }

  // In a real implementation, this would use the GitHub API via GITHUB_TOKEN
  // For now, we log what would be created
  for (const v of criticalVulns) {
    console.log(`    📝 Would create issue: "🚨 Critical vulnerability in ${v.location}" (${v.critical} critical, ${v.high} high)`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('');
  console.log('🔄 Dependency Scanner & Staleness Reporter');
  console.log('═══════════════════════════════════════════');
  console.log('');

  const pkgLocations = findPackageJsons();
  console.log(`  📁 Found ${pkgLocations.length} package.json locations`);
  console.log('');

  let scanResults = [];
  let auditResults = [];

  if (flags.scan)   scanResults = scanOutdated(pkgLocations);
  if (flags.audit)  auditResults = auditVulnerabilities(pkgLocations);
  if (flags.report) generateReport(scanResults, auditResults);
  if (flags.issues) createIssues(scanResults, auditResults);

  console.log('');
  console.log('  ✅ Dependency scan complete');
  console.log('');
}

main();
