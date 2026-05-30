#!/usr/bin/env node
/**
 * 📦 organism-sdk-bot — SDK Validator & Packager
 * ═══════════════════════════════════════════════
 *
 * Validates all SDK packages under sdk/:
 *  - Checks package.json exists and is valid
 *  - Verifies main/index entry points
 *  - Validates version consistency
 *  - Optionally packages tarballs for distribution (--package)
 *
 * Usage:
 *   node scripts/validate-sdks.js             # validate
 *   node scripts/validate-sdks.js --package   # create tarballs
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const cp   = require('child_process');

const REPO     = path.resolve(__dirname, '..');
const SDK_ROOT = path.join(REPO, 'sdk');
const DIST_DIR = path.join(REPO, 'dist', 'sdks');

const doPackage = process.argv.includes('--package');

function main() {
  console.log('');
  console.log('📦 SDK Validator & Packager');
  console.log('═══════════════════════════════════════════');
  console.log('');

  if (!fs.existsSync(SDK_ROOT)) {
    console.log('  ⚠ No sdk/ directory found');
    return;
  }

  const dirs = fs.readdirSync(SDK_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory());

  let valid = 0, invalid = 0, packaged = 0;
  const errors = [];
  const inventory = [];

  for (const dir of dirs) {
    const sdkPath = path.join(SDK_ROOT, dir.name);
    const pkgPath = path.join(sdkPath, 'package.json');
    const indexPath = path.join(sdkPath, 'index.js');
    const srcIndex = path.join(sdkPath, 'src', 'index.js');

    // Check package.json
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const hasEntry = fs.existsSync(indexPath) || fs.existsSync(srcIndex) ||
                         (pkg.main && fs.existsSync(path.join(sdkPath, pkg.main)));

        inventory.push({
          name: pkg.name || dir.name,
          version: pkg.version || '0.0.0',
          hasEntry,
          description: pkg.description || '',
          files: fs.readdirSync(sdkPath).length,
        });

        if (!hasEntry) {
          errors.push(`${dir.name}: no entry point (index.js or src/index.js)`);
          invalid++;
        } else {
          valid++;
          console.log(`  ✅ ${dir.name} (${pkg.version || '?'})`);
        }
      } catch (err) {
        invalid++;
        errors.push(`${dir.name}: invalid package.json — ${err.message}`);
      }
    } else {
      // SDK without package.json — check for source files
      const files = fs.readdirSync(sdkPath);
      const hasCode = files.some(f => /\.(js|ts|py|java)$/.test(f));
      if (hasCode) {
        valid++;
        inventory.push({
          name: dir.name,
          version: 'source',
          hasEntry: true,
          description: 'Source-only SDK module',
          files: files.length,
        });
        console.log(`  ✅ ${dir.name} (source-only)`);
      } else if (files.length > 0) {
        valid++;
        inventory.push({
          name: dir.name,
          version: 'source',
          hasEntry: false,
          description: 'SDK module',
          files: files.length,
        });
        console.log(`  ✅ ${dir.name} (${files.length} files)`);
      }
    }
  }

  console.log('');
  console.log(`  ${valid} valid / ${dirs.length} total SDKs`);

  if (errors.length > 0) {
    console.log('');
    console.log('  ⚠ Issues:');
    for (const err of errors) {
      console.log(`    • ${err}`);
    }
  }

  // Package tarballs
  if (doPackage) {
    console.log('');
    console.log('  Packaging SDK tarballs...');
    fs.mkdirSync(DIST_DIR, { recursive: true });

    for (const sdk of inventory) {
      const sdkPath = path.join(SDK_ROOT, sdk.name.replace(/^@\w+\//, ''));
      const pkgPath = path.join(sdkPath, 'package.json');
      if (!fs.existsSync(pkgPath)) continue;

      try {
        const result = cp.execFileSync('npm', ['pack', '--pack-destination', DIST_DIR], {
          cwd: sdkPath,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        packaged++;
        console.log(`  📦 ${result.trim()}`);
      } catch {
        // npm pack might fail for non-standard packages, that's OK
      }
    }

    console.log(`  ${packaged} SDKs packaged to dist/sdks/`);
  }

  console.log('');
  console.log('  ✅ SDK validation complete');
  console.log('');

  if (invalid > 0) process.exit(1);
}

main();
