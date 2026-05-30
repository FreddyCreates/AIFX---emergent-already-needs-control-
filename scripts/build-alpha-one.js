#!/usr/bin/env node

/**
 * ALPHA ONE Release Builder
 * ═════════════════════════
 *
 * Packages the ALPHA ONE bot fleet into a distributable bundle.
 *
 * Output:  dist/alpha-one-v{version}/
 *            ├── index.js          (fleet entry point)
 *            ├── package.json      (package manifest)
 *            ├── README.md         (documentation)
 *            ├── sdk/microbots/    (microbot source)
 *            ├── sdk/agents/       (agent source)
 *            └── MANIFEST.json     (build manifest with checksums)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(ROOT, 'releases', 'alpha-one');
const pkg = JSON.parse(fs.readFileSync(path.join(RELEASE_DIR, 'package.json'), 'utf8'));
const version = pkg.version;
const bundleName = `alpha-one-v${version}`;
const stageDir = path.join(ROOT, 'dist', bundleName);

console.log('');
console.log('  ╔═══════════════════════════════════════════════╗');
console.log(`  ║  Building ALPHA ONE Release: ${version}    ║`);
console.log('  ╚═══════════════════════════════════════════════╝');
console.log('');

// Clean and create staging directory
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// ── Copy release files ──────────────────────────────────────────────────
console.log('  Copying release entry point...');
const releaseFiles = ['index.js', 'package.json', 'README.md'];
for (const f of releaseFiles) {
  fs.copyFileSync(path.join(RELEASE_DIR, f), path.join(stageDir, f));
}

// ── Copy SDK microbots ──────────────────────────────────────────────────
console.log('  Copying microbots...');
const microbotsSrc = path.join(ROOT, 'sdk', 'microbots');
const microbotsDst = path.join(stageDir, 'sdk', 'microbots');

function copyDirSync(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
copyDirSync(microbotsSrc, microbotsDst);

// ── Copy SDK agents ─────────────────────────────────────────────────────
console.log('  Copying agents...');
const agentsSrc = path.join(ROOT, 'sdk', 'agents');
const agentsDst = path.join(stageDir, 'sdk', 'agents');
copyDirSync(agentsSrc, agentsDst);

// ── Generate MANIFEST.json ──────────────────────────────────────────────
console.log('  Generating manifest...');

function walkFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walkFiles(stageDir);
const fileEntries = allFiles.map(f => {
  const content = fs.readFileSync(f);
  const sha256 = crypto.createHash('sha256').update(content).digest('hex');
  return {
    path: path.relative(stageDir, f),
    size: content.length,
    sha256,
  };
});

const manifest = {
  name: '@medina/alpha-one',
  version,
  codename: 'ALPHA-ONE',
  builtAt: new Date().toISOString(),
  fileCount: fileEntries.length,
  totalSize: fileEntries.reduce((sum, f) => sum + f.size, 0),
  files: fileEntries,
  bots: {
    agents: ['animus', 'corpus', 'sensus', 'memoria'],
    microbots: ['signal-gatherer', 'synapse-trainer', 'weight-evolver', 'orphan-scanner', 'link-checker', 'graph-builder'],
  },
};

fs.writeFileSync(
  path.join(stageDir, 'MANIFEST.json'),
  JSON.stringify(manifest, null, 2)
);

// ── Summary ─────────────────────────────────────────────────────────────
const totalSizeKB = (manifest.totalSize / 1024).toFixed(1);

console.log('');
console.log('  ═══════════════════════════════════════════════');
console.log(`  ✅ ALPHA ONE built successfully`);
console.log(`     dist/${bundleName}/`);
console.log(`     ${manifest.fileCount} files • ${totalSizeKB} KB`);
console.log('  ═══════════════════════════════════════════════');
console.log('');
console.log('  Bots included:');
console.log(`    Agents:    ${manifest.bots.agents.join(', ')}`);
console.log(`    Microbots: ${manifest.bots.microbots.join(', ')}`);
console.log('');
