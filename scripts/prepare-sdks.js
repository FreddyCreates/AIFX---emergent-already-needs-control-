#!/usr/bin/env node

/**
 * Normalizes all SDK package.json files for npm publish readiness.
 * Adds missing: files, engines, repository, author, license, publishConfig.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SDK_ROOT = path.resolve(__dirname, '..', 'sdk');
const REPO = 'https://github.com/FreddyCreates/potential-succotash';

const dirs = fs.readdirSync(SDK_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory());

let updated = 0;

for (const dir of dirs) {
  const pkgPath = path.join(SDK_ROOT, dir.name, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let changed = false;

  if (!pkg.files) {
    pkg.files = ['src/'];
    changed = true;
  }

  if (!pkg.engines) {
    pkg.engines = { node: '>=18.0.0' };
    changed = true;
  }

  if (!pkg.repository) {
    pkg.repository = {
      type: 'git',
      url: `git+${REPO}.git`,
      directory: `sdk/${dir.name}`
    };
    changed = true;
  }

  if (!pkg.author) {
    pkg.author = 'Medina';
    changed = true;
  }

  if (!pkg.license || pkg.license === 'UNLICENSED') {
    pkg.license = 'MIT';
    changed = true;
  }

  if (!pkg.publishConfig) {
    pkg.publishConfig = { access: 'public' };
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    updated++;
    console.log(`  ✓ ${dir.name}`);
  }
}

console.log('');
console.log(`  ${updated} SDK packages updated for npm publish`);
