#!/usr/bin/env node
/**
 * 🛡️ organism-sentinel-bot — Security Scanner
 * ═════════════════════════════════════════════
 *
 * Comprehensive security scanning across the organism:
 *  --permissions   Audit extension manifest permissions
 *  --csp           Validate Content Security Policies
 *  --secrets       Check for hardcoded secrets/tokens
 *  --protocols     Scan protocol export surfaces
 *  --report        Generate full security report to docs/
 *
 * Usage:
 *   node scripts/sentinel-scan.js --permissions
 *   node scripts/sentinel-scan.js --report
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs');
const EXT_DIR = path.join(REPO, 'extensions');
const PROT_DIR = path.join(REPO, 'protocols');

const flags = {
  permissions: process.argv.includes('--permissions'),
  csp:         process.argv.includes('--csp'),
  secrets:     process.argv.includes('--secrets'),
  protocols:   process.argv.includes('--protocols'),
  report:      process.argv.includes('--report'),
};

if (!Object.values(flags).some(Boolean)) {
  Object.keys(flags).forEach(k => flags[k] = true);
}

const findings = [];

// ── Dangerous permissions to flag ────────────────────────────────────────────
const DANGEROUS_PERMISSIONS = [
  'debugger', 'webRequestBlocking', 'nativeMessaging',
  'management', 'proxy', 'privacy', 'browsingData',
  '<all_urls>', 'http://*/*', 'https://*/*',
];

// ── Secret patterns ──────────────────────────────────────────────────────────
const SECRET_PATTERNS = [
  { name: 'API Key', pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi },
  { name: 'AWS Key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'Private Key', pattern: /-----BEGIN (?:RSA )?PRIVATE KEY-----/g },
  { name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9_\-\.]{20,}/g },
  { name: 'Password', pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/gi },
];

function auditPermissions() {
  console.log('  🔑 Auditing extension permissions...');

  if (!fs.existsSync(EXT_DIR)) return;

  const scanDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(dir, entry.name, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const perms = [...(manifest.permissions || []), ...(manifest.host_permissions || [])];
            const dangerous = perms.filter(p => DANGEROUS_PERMISSIONS.includes(p));

            if (dangerous.length > 0) {
              findings.push({
                severity: 'warning',
                source: `extensions/${entry.name}`,
                message: `Elevated permissions: ${dangerous.join(', ')}`,
              });
              console.log(`    ⚠ ${entry.name}: ${dangerous.join(', ')}`);
            } else {
              console.log(`    ✅ ${entry.name}: permissions OK`);
            }
          } catch {
            // Skip invalid manifests
          }
        }
        // Recurse into subdirectories (e.g., extensions/windows/)
        const subPath = path.join(dir, entry.name);
        const subEntries = fs.readdirSync(subPath, { withFileTypes: true });
        for (const sub of subEntries) {
          if (sub.isDirectory()) {
            const subManifest = path.join(subPath, sub.name, 'manifest.json');
            if (fs.existsSync(subManifest)) {
              try {
                const manifest = JSON.parse(fs.readFileSync(subManifest, 'utf8'));
                const perms = [...(manifest.permissions || []), ...(manifest.host_permissions || [])];
                const dangerous = perms.filter(p => DANGEROUS_PERMISSIONS.includes(p));
                if (dangerous.length > 0) {
                  findings.push({
                    severity: 'warning',
                    source: `extensions/${entry.name}/${sub.name}`,
                    message: `Elevated permissions: ${dangerous.join(', ')}`,
                  });
                }
              } catch { /* skip */ }
            }
          }
        }
      }
    }
  };

  scanDir(EXT_DIR);
}

function checkCSP() {
  console.log('  🔒 Checking Content Security Policies...');

  if (!fs.existsSync(EXT_DIR)) return;

  const dirs = fs.readdirSync(EXT_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const manifestPath = path.join(EXT_DIR, dir.name, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const csp = manifest.content_security_policy;

      if (csp) {
        const policyStr = typeof csp === 'object' ? JSON.stringify(csp) : csp;
        if (policyStr.includes("'unsafe-eval'")) {
          findings.push({
            severity: 'high',
            source: `extensions/${dir.name}`,
            message: 'CSP allows unsafe-eval',
          });
          console.log(`    ⚠ ${dir.name}: unsafe-eval in CSP`);
        } else if (policyStr.includes("'unsafe-inline'")) {
          findings.push({
            severity: 'medium',
            source: `extensions/${dir.name}`,
            message: 'CSP allows unsafe-inline',
          });
        }
      }
    } catch { /* skip */ }
  }

  console.log('    ✅ CSP check complete');
}

function scanSecrets() {
  console.log('  🔍 Scanning for hardcoded secrets...');

  const scanFile = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const { name, pattern } of SECRET_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
          findings.push({
            severity: 'critical',
            source: path.relative(REPO, filePath),
            message: `Potential ${name} found (${matches.length} match${matches.length > 1 ? 'es' : ''})`,
          });
          console.log(`    🚨 ${path.relative(REPO, filePath)}: potential ${name}`);
        }
      }
    } catch { /* skip binary files */ }
  };

  const walkDir = (dir, depth = 0) => {
    if (depth > 5) return;
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;

      if (entry.isDirectory()) {
        walkDir(fullPath, depth + 1);
      } else if (/\.(js|ts|json|yml|yaml|env|sh|bat|ps1)$/i.test(entry.name)) {
        scanFile(fullPath);
      }
    }
  };

  walkDir(REPO);
  console.log('    ✅ Secret scan complete');
}

function scanProtocols() {
  console.log('  🔬 Scanning protocol export surfaces...');

  if (!fs.existsSync(PROT_DIR)) return;

  const files = fs.readdirSync(PROT_DIR).filter(f => f.endsWith('.js'));
  let evalCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(PROT_DIR, file), 'utf8');

    // Check for eval() or Function() usage
    if (/\beval\s*\(/.test(content)) {
      findings.push({
        severity: 'high',
        source: `protocols/${file}`,
        message: 'Uses eval() — potential code injection risk',
      });
      evalCount++;
    }

    if (/new\s+Function\s*\(/.test(content)) {
      findings.push({
        severity: 'high',
        source: `protocols/${file}`,
        message: 'Uses new Function() — potential code injection risk',
      });
      evalCount++;
    }
  }

  if (evalCount === 0) {
    console.log('    ✅ No eval/Function usage found in protocols');
  } else {
    console.log(`    ⚠ ${evalCount} eval/Function usage(s) found`);
  }
}

function generateReport() {
  console.log('');
  console.log('  📄 Generating security report...');
  fs.mkdirSync(DOCS, { recursive: true });

  const critical = findings.filter(f => f.severity === 'critical');
  const high     = findings.filter(f => f.severity === 'high');
  const medium   = findings.filter(f => f.severity === 'medium');
  const warnings = findings.filter(f => f.severity === 'warning');

  const lines = [
    '# 🛡️ Security Scan Report',
    '',
    `> Auto-generated by organism-sentinel-bot on ${new Date().toUTCString()}`,
    '',
    '## Summary',
    '',
    '| Severity | Count |',
    '|----------|-------|',
    `| 🚨 Critical | ${critical.length} |`,
    `| ⚠️ High | ${high.length} |`,
    `| 🔶 Medium | ${medium.length} |`,
    `| 💡 Warning | ${warnings.length} |`,
    `| **Total** | **${findings.length}** |`,
    '',
  ];

  if (findings.length === 0) {
    lines.push('✅ **No security issues found.**');
  } else {
    lines.push('## Findings');
    lines.push('');
    lines.push('| Severity | Source | Finding |');
    lines.push('|----------|--------|---------|');
    for (const f of findings) {
      const icon = { critical: '🚨', high: '⚠️', medium: '🔶', warning: '💡' }[f.severity] || '📋';
      lines.push(`| ${icon} ${f.severity} | \`${f.source}\` | ${f.message} |`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('*Generated by organism-sentinel-bot*');

  fs.writeFileSync(path.join(DOCS, 'security-report.md'), lines.join('\n'));
  console.log(`  📄 Report written to docs/security-report.md`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('');
  console.log('🛡️ Sentinel Security Scanner');
  console.log('═══════════════════════════════════════════');
  console.log('');

  if (flags.permissions) auditPermissions();
  if (flags.csp)         checkCSP();
  if (flags.secrets)     scanSecrets();
  if (flags.protocols)   scanProtocols();
  if (flags.report)      generateReport();

  console.log('');
  if (findings.filter(f => f.severity === 'critical').length > 0) {
    console.log('  🚨 CRITICAL issues found — review security report');
    process.exit(1);
  } else {
    console.log(`  ✅ Security scan complete (${findings.length} findings)`);
  }
  console.log('');
}

main();
