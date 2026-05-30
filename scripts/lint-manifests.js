#!/usr/bin/env node

/**
 * Validates every Chrome Manifest V3 extension under extensions/.
 * Exits with code 1 if any extension has validation errors.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const EXT_ROOT = path.resolve(__dirname, '..', 'extensions');
let errors = 0;
let passed = 0;

const dirs = fs.readdirSync(EXT_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows');

for (const dir of dirs) {
  const extPath = path.join(EXT_ROOT, dir.name);
  const manifestPath = path.join(extPath, 'manifest.json');
  const issues = [];

  if (!fs.existsSync(manifestPath)) continue;

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    issues.push(`Invalid JSON: ${e.message}`);
    errors++;
    console.log(`  ✗ ${dir.name}: ${issues.join(', ')}`);
    continue;
  }

  if (manifest.manifest_version !== 3) {
    issues.push('manifest_version must be 3');
  }
  if (!manifest.name || typeof manifest.name !== 'string') {
    issues.push('Missing or invalid "name"');
  }
  if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    issues.push('Missing or invalid "version" (expected semver x.y.z)');
  }
  if (!manifest.description || manifest.description.length < 10) {
    issues.push('Missing or too short "description" (min 10 chars)');
  }

  const hasBg = manifest.background && manifest.background.service_worker;
  const hasCS = manifest.content_scripts && manifest.content_scripts.length > 0;
  if (!hasBg && !hasCS) {
    issues.push('No background.service_worker or content_scripts defined');
  }

  if (hasBg) {
    const bgFile = path.join(extPath, manifest.background.service_worker);
    if (!fs.existsSync(bgFile)) {
      issues.push(`background.service_worker file missing: ${manifest.background.service_worker}`);
    }
  }

  if (hasCS) {
    for (const cs of manifest.content_scripts) {
      for (const jsFile of (cs.js || [])) {
        if (!fs.existsSync(path.join(extPath, jsFile))) {
          issues.push(`content_scripts file missing: ${jsFile}`);
        }
      }
    }
  }

  if (manifest.icons) {
    for (const [size, iconPath] of Object.entries(manifest.icons)) {
      if (!fs.existsSync(path.join(extPath, iconPath))) {
        issues.push(`Icon missing: ${iconPath} (${size}px)`);
      }
    }
  }

  if (issues.length > 0) {
    errors++;
    console.log(`  ✗ ${dir.name}:`);
    for (const issue of issues) {
      console.log(`    ↳ ${issue}`);
    }
  } else {
    passed++;
  }
}

console.log('');
console.log(`  ${passed} passed, ${errors} failed (${passed + errors} total)`);

if (errors > 0) {
  process.exit(1);
}
