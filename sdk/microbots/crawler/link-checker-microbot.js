'use strict';
/**
 * LINK CHECKER MICROBOT
 * Parent: organism-crawler-bot
 *
 * Detects broken require/import/href references across the entire
 * organism. Reports file path, line number, and broken target.
 */

const fs   = require('fs');
const path = require('path');
const { MicrobotBase } = require('../microbot-base.js');

const IGNORE = new Set(['.git', 'node_modules', 'dist']);
const CODE_EXTS = new Set(['.js', '.ts', '.mjs', '.html']);

class LinkCheckerMicrobot extends MicrobotBase {
  constructor(parentBot, config = {}) {
    super('link-checker', parentBot, config);
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
    const root = this.repoRoot;
    const files = this._walkFiles(root);
    const deadLinks = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines   = content.split('\n');
        const ext     = path.extname(file);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (ext !== '.html') {
            // Check require/import
            for (const pat of [/require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/, /from\s+['"](\.[^'"]+)['"]/]) {
              const m = line.match(pat);
              if (m) {
                const target   = m[1];
                const resolved = path.resolve(path.dirname(file), target);
                const exists   = fs.existsSync(resolved) || fs.existsSync(`${resolved}.js`) || fs.existsSync(path.join(resolved, 'index.js'));
                if (!exists) {
                  deadLinks.push({ file: path.relative(root, file), line: i + 1, reference: target, type: ext === '.ts' ? 'import' : 'require' });
                }
              }
            }
          } else {
            // Check HTML src/href
            const m = line.match(/(?:src|href)=["']([^"']+)["']/);
            if (m) {
              const ref = m[1];
              if (!ref.startsWith('http') && !ref.startsWith('//') && !ref.startsWith('#') && !ref.startsWith('data:')) {
                const resolved = path.resolve(path.dirname(file), ref);
                if (!fs.existsSync(resolved)) {
                  deadLinks.push({ file: path.relative(root, file), line: i + 1, reference: ref, type: 'html-link' });
                }
              }
            }
          }
        }
        this.tick();
      } catch { /* skip */ }
    }

    return { deadLinks, count: deadLinks.length, filesChecked: files.length };
  }
}

module.exports = LinkCheckerMicrobot;
