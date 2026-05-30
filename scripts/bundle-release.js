#!/usr/bin/env node

/**
 * Builds a self-contained release bundle that works without GitHub.
 *
 * Output:  dist/sovereign-organism-v{version}.tar.gz
 *          dist/sovereign-organism-v{version}.zip
 *
 * The bundle contains:
 *   - All 26 extension zips (individual + all-extensions.zip)
 *   - install.sh          (Linux/macOS — no Node.js needed)
 *   - install-organism.bat (Windows batch)
 *   - install-extensions.ps1 (Windows PowerShell)
 *   - download.html       (offline download page)
 *   - organism-cli/       (Node.js CLI)
 *   - extensions/         (raw source for --load-extension)
 *   - README.md
 *
 * Distribute the .tar.gz or .zip anywhere: USB, S3, your own CDN,
 * email, torrent, whatever. No GitHub needed.
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version || '1.0.0';
const bundleName = `sovereign-organism-v${version}`;
const stageDir = path.join(ROOT, 'dist', bundleName);

console.log('');
console.log('  ═══════════════════════════════════════════');
console.log(`  Building release: ${bundleName}`);
console.log('  ═══════════════════════════════════════════');
console.log('');

// Ensure extension zips exist
if (!fs.existsSync(path.join(ROOT, 'dist', 'extensions'))) {
  console.log('  Building extension zips first...');
  execSync('bash build-extensions.sh', { cwd: ROOT, stdio: 'inherit' });
}

// Clean and create staging directory
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true });
}
fs.mkdirSync(stageDir, { recursive: true });
fs.mkdirSync(path.join(stageDir, 'extensions'), { recursive: true });

// Copy extension zips
console.log('  Copying extension zips...');
const extDist = path.join(ROOT, 'dist', 'extensions');
for (const f of fs.readdirSync(extDist)) {
  if (f.endsWith('.zip')) {
    fs.copyFileSync(path.join(extDist, f), path.join(stageDir, 'extensions', f));
  }
}

// Copy installers
console.log('  Copying installers...');
const filesToCopy = [
  'install.sh',
  'install-organism.bat',
  'install-extensions.ps1',
  'README.md',
  'LICENSE',
];
for (const f of filesToCopy) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(stageDir, f));
  }
}

// Copy download page
if (fs.existsSync(path.join(ROOT, 'dist', 'download.html'))) {
  fs.copyFileSync(
    path.join(ROOT, 'dist', 'download.html'),
    path.join(stageDir, 'download.html')
  );
}

// Copy organism-cli (Node.js installer)
console.log('  Copying organism-cli...');
const cliSrc = path.join(ROOT, 'organism-cli');
const cliDst = path.join(stageDir, 'organism-cli');
fs.mkdirSync(cliDst, { recursive: true });
for (const f of fs.readdirSync(cliSrc)) {
  const srcFile = path.join(cliSrc, f);
  if (fs.statSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, path.join(cliDst, f));
  }
}

// Copy raw extension source (for --load-extension direct loading)
console.log('  Copying extension source...');
const extSrc = path.join(ROOT, 'extensions');
const extDstDir = path.join(stageDir, 'extensions-source');
function copyDirSync(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'windows') continue;
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
copyDirSync(extSrc, extDstDir);

// Create tar.gz
console.log('  Creating .tar.gz...');
const tarFile = `${bundleName}.tar.gz`;
execSync(`tar -czf "${tarFile}" "${bundleName}"`, {
  cwd: path.join(ROOT, 'dist'),
  stdio: 'pipe',
});
const tarSize = (fs.statSync(path.join(ROOT, 'dist', tarFile)).size / 1024 / 1024).toFixed(1);

// Create zip
console.log('  Creating .zip...');
const zipFile = `${bundleName}.zip`;
execSync(`zip -r -q "${zipFile}" "${bundleName}"`, {
  cwd: path.join(ROOT, 'dist'),
  stdio: 'pipe',
});
const zipSize = (fs.statSync(path.join(ROOT, 'dist', zipFile)).size / 1024 / 1024).toFixed(1);

// Clean staging dir
fs.rmSync(stageDir, { recursive: true });

console.log('');
console.log('  ═══════════════════════════════════════════');
console.log(`  ✅ Release built`);
console.log(`     dist/${tarFile}  (${tarSize} MB)`);
console.log(`     dist/${zipFile}  (${zipSize} MB)`);
console.log('  ═══════════════════════════════════════════');
console.log('');
console.log('  Distribute these files anywhere:');
console.log('    - Upload to your own server / CDN');
console.log('    - Put on a USB drive');
console.log('    - Email them');
console.log('    - Host on S3, Cloudflare R2, or any file host');
console.log('    - Attach to a GitHub Release (optional)');
console.log('');
console.log('  Users unpack and run:');
console.log('    tar xzf ' + tarFile + ' && cd ' + bundleName);
console.log('    bash install.sh');
console.log('');
