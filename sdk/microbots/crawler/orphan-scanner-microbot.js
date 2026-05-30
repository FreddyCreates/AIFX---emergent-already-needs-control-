'use strict';
/**
 * ORPHAN SCANNER MICROBOT
 * Parent: organism-crawler-bot
 *
 * Finds code files that nothing imports. Walks all JS/TS files,
 * builds a set of all referenced paths, and reports any file
 * that has no known importer.
 */

const fs   = require('fs');
const path = require('path');
const { MicrobotBase } = require('../microbot-base.js');

const IGNORE = new Set(['.git', 'node_modules', 'dist']);
const CODE_EXTS = new Set(['.js', '.ts', '.mjs']);

class OrphanScannerMicrobot extends MicrobotBase {
  constructor(parentBot, config = {}) {
    super('orphan-scanner', parentBot, config);
    this.repoRoot = config.repoRoot || path.resolve(__dirname, '../../..');
  }

  _walkFiles(dir, depth = 0) {
    if (depth > 8 || !fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const e of entries) {
      if (IGNORE.has(e.name) || e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) files.push(...this._walkFiles(full, depth + 1));
      else if (CODE_EXTS.has(path.extname(e.name))) files.push(full);
    }
    return files;
  }

  async _execute() {
    const root  = this.repoRoot;
    const files = this._walkFiles(root);
    const referenced = new Set();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const patterns = [
          /require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g,
          /from\s+['"](\.[^'"]+)['"]/g,
        ];
        for (const pat of patterns) {
          let m;
          while ((m = pat.exec(content)) !== null) {
            const abs = path.resolve(path.dirname(file), m[1]);
            const rel = path.relative(root, abs);
            referenced.add(rel);
            referenced.add(`${rel}.js`);
            referenced.add(`${rel}/index.js`);
          }
        }
        this.tick();
      } catch { /* skip */ }
    }

    const SKIP = new Set(['scripts', 'test', 'index.js']);
    const orphans = files.filter(f => {
      const rel = path.relative(root, f);
      const topDir = rel.split(path.sep)[0];
      if (SKIP.has(topDir)) return false;
      if (rel.includes('index.js')) return false;
      return !referenced.has(rel) && !referenced.has(rel.replace('.js', ''));
    }).map(f => path.relative(root, f));

    return { orphans, total: files.length, orphanCount: orphans.length, referenced: referenced.size };
  }
}

module.exports = OrphanScannerMicrobot;
