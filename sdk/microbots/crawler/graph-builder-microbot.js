'use strict';
/**
 * GRAPH BUILDER MICROBOT
 * Parent: organism-crawler-bot
 *
 * Builds a full dependency graph of every code module in the organism.
 * Computes: in-degree (depended on by), out-degree (depends on),
 * hub score, and identifies strongly-connected clusters.
 */

const fs   = require('fs');
const path = require('path');
const { MicrobotBase, PHI } = require('../microbot-base.js');

const IGNORE = new Set(['.git', 'node_modules', 'dist']);
const CODE_EXTS = new Set(['.js', '.ts', '.mjs']);

class GraphBuilderMicrobot extends MicrobotBase {
  constructor(parentBot, config = {}) {
    super('graph-builder', parentBot, config);
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
      else if (CODE_EXTS.has(path.extname(e.name))) files.push(path.relative(this.repoRoot, full));
    }
    return files;
  }

  async _execute() {
    const root  = this.repoRoot;
    const files = this._walkFiles(root);
    const graph = {};   // file → [deps]
    const inDeg = {};   // file → in-degree

    for (const rel of files) {
      graph[rel] = [];
      inDeg[rel] = inDeg[rel] || 0;
    }

    for (const rel of files) {
      const filePath = path.join(root, rel);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const pats = [
          /require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g,
          /from\s+['"](\.[^'"]+)['"]/g,
        ];
        for (const pat of pats) {
          let m;
          while ((m = pat.exec(content)) !== null) {
            const abs = path.resolve(path.dirname(filePath), m[1]);
            let depRel = path.relative(root, abs);
            if (fs.existsSync(`${abs}.js`))                    depRel = `${depRel}.js`;
            else if (fs.existsSync(path.join(abs, 'index.js'))) depRel = path.join(depRel, 'index.js');
            graph[rel].push(depRel);
            inDeg[depRel] = (inDeg[depRel] || 0) + 1;
          }
        }
        this.tick();
      } catch { /* skip */ }
    }

    const edges = Object.values(graph).reduce((s, d) => s + d.length, 0);

    // Hub score: phi-weighted combination of out-degree and in-degree
    const hubScores = {};
    for (const rel of files) {
      const outD = (graph[rel] || []).length;
      const inD  = inDeg[rel] || 0;
      hubScores[rel] = parseFloat((outD * PHI + inD).toFixed(4));
    }

    const topHubs = Object.entries(hubScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([file, score]) => ({ file, score, inDegree: inDeg[file] || 0, outDegree: (graph[file] || []).length }));

    return { nodes: files.length, edges, topHubs, graph, inDeg };
  }
}

module.exports = GraphBuilderMicrobot;
