#!/usr/bin/env node
/**
 * 🕷️ organism-crawler-bot — Internal Organism Crawler & Mapper
 * ═════════════════════════════════════════════════════════════════
 *
 * Crawls the entire repository structure, mapping every file, tracing
 * every import/require/export, finding orphan files, dead links, unused
 * code, and stale references. Builds a living dependency web.
 *
 * Flags:
 *   --map             Build a complete directory/file map
 *   --orphans         Find files that nothing imports
 *   --dead-links      Detect broken references (imports, HTML links, etc.)
 *   --dependency-web  Build a full dependency graph
 *   --report          Generate the crawler report to docs/
 *
 * Usage:
 *   node scripts/organism-crawler.js --map --orphans --report
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs');

const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', '.github']);
const CODE_EXTS   = new Set(['.js', '.ts', '.mjs', '.cjs', '.jsx', '.tsx']);
const DOC_EXTS    = new Set(['.md', '.html', '.csv', '.json']);

const flags = {
  map:           process.argv.includes('--map'),
  orphans:       process.argv.includes('--orphans'),
  deadLinks:     process.argv.includes('--dead-links'),
  dependencyWeb: process.argv.includes('--dependency-web'),
  report:        process.argv.includes('--report'),
  dashboard:     process.argv.includes('--dashboard'),
};

if (!Object.values(flags).some(Boolean)) {
  Object.keys(flags).forEach(k => flags[k] = true);
}

// ── Walk Directory ───────────────────────────────────────────────────────────
function walkDir(dir, depth = 0, maxDepth = 8) {
  if (depth > maxDepth || !fs.existsSync(dir)) return [];

  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith('.') && depth > 0) continue;

    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(REPO, fullPath);

    if (entry.isDirectory()) {
      results.push({ path: relative, type: 'directory', depth });
      results.push(...walkDir(fullPath, depth + 1, maxDepth));
    } else {
      const ext = path.extname(entry.name);
      try {
        const stat = fs.statSync(fullPath);
        results.push({
          path: relative,
          type: 'file',
          ext,
          size: stat.size,
          depth,
          isCode: CODE_EXTS.has(ext),
          isDoc: DOC_EXTS.has(ext),
        });
      } catch { /* skip */ }
    }
  }

  return results;
}

// ── Phase 1: Map ─────────────────────────────────────────────────────────────
function buildMap() {
  console.log('  🕷️ Phase 1 — Mapping directory structure...');

  const allFiles = walkDir(REPO);
  const files = allFiles.filter(f => f.type === 'file');
  const dirs = allFiles.filter(f => f.type === 'directory');

  // Count by extension
  const extCounts = {};
  for (const f of files) {
    extCounts[f.ext || '(none)'] = (extCounts[f.ext || '(none)'] || 0) + 1;
  }

  // Count by top-level directory
  const topDirs = {};
  for (const f of files) {
    const topDir = f.path.split(path.sep)[0] || '(root)';
    topDirs[topDir] = (topDirs[topDir] || 0) + 1;
  }

  console.log(`    📁 Directories: ${dirs.length}`);
  console.log(`    📄 Files: ${files.length}`);
  console.log(`    💻 Code files: ${files.filter(f => f.isCode).length}`);
  console.log(`    📝 Doc files: ${files.filter(f => f.isDoc).length}`);

  return { files, dirs, extCounts, topDirs };
}

// ── Phase 2: Orphan Detection ────────────────────────────────────────────────
function findOrphans(map) {
  console.log('  🕷️ Phase 2 — Scanning for orphan files...');

  // Build a set of all files that are imported/required by something
  const referenced = new Set();
  const codeFiles = map.files.filter(f => f.isCode);

  for (const file of codeFiles) {
    const filePath = path.join(REPO, file.path);
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Find require() calls
      const requires = content.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || [];
      for (const req of requires) {
        const match = req.match(/['"]([^'"]+)['"]/);
        if (match && match[1].startsWith('.')) {
          const resolved = path.resolve(path.dirname(filePath), match[1]);
          const relative = path.relative(REPO, resolved);
          referenced.add(relative);
          referenced.add(`${relative}.js`);
          referenced.add(`${relative}/index.js`);
        }
      }

      // Find import statements
      const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
      for (const imp of imports) {
        const match = imp.match(/['"]([^'"]+)['"]/);
        if (match && match[1].startsWith('.')) {
          const resolved = path.resolve(path.dirname(filePath), match[1]);
          const relative = path.relative(REPO, resolved);
          referenced.add(relative);
          referenced.add(`${relative}.js`);
          referenced.add(`${relative}/index.js`);
        }
      }
    } catch { /* skip */ }
  }

  // Find orphans — code files that nothing imports
  const orphans = codeFiles.filter(f => {
    // Skip index files, entry points, test files, scripts
    if (f.path.includes('index.js')) return false;
    if (f.path.startsWith('test/')) return false;
    if (f.path.startsWith('scripts/')) return false;
    if (f.path === 'extensions/index.js') return false;

    return !referenced.has(f.path) && !referenced.has(f.path.replace('.js', ''));
  });

  console.log(`    📊 Referenced files: ${referenced.size}`);
  console.log(`    🔍 Potential orphans: ${orphans.length}`);

  return orphans;
}

// ── Phase 3: Dead Link Detection ─────────────────────────────────────────────
function findDeadLinks(map) {
  console.log('  🕷️ Phase 3 — Detecting dead links & stale refs...');

  const deadLinks = [];
  const codeFiles = map.files.filter(f => f.isCode);

  for (const file of codeFiles) {
    const filePath = path.join(REPO, file.path);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check require() with relative paths
        const reqMatch = line.match(/require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/);
        if (reqMatch) {
          const target = reqMatch[1];
          const resolved = path.resolve(path.dirname(filePath), target);
          const exists = fs.existsSync(resolved) ||
                         fs.existsSync(`${resolved}.js`) ||
                         fs.existsSync(path.join(resolved, 'index.js'));
          if (!exists) {
            deadLinks.push({
              file: file.path,
              line: i + 1,
              reference: target,
              type: 'require',
            });
          }
        }

        // Check import from with relative paths
        const impMatch = line.match(/from\s+['"](\.[^'"]+)['"]/);
        if (impMatch) {
          const target = impMatch[1];
          const resolved = path.resolve(path.dirname(filePath), target);
          const exists = fs.existsSync(resolved) ||
                         fs.existsSync(`${resolved}.js`) ||
                         fs.existsSync(path.join(resolved, 'index.js'));
          if (!exists) {
            deadLinks.push({
              file: file.path,
              line: i + 1,
              reference: target,
              type: 'import',
            });
          }
        }
      }
    } catch { /* skip */ }
  }

  // Check HTML files for broken links
  const htmlFiles = map.files.filter(f => f.ext === '.html');
  for (const file of htmlFiles) {
    const filePath = path.join(REPO, file.path);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const srcMatches = content.match(/(?:src|href)=["']([^"']+)["']/g) || [];

      for (const match of srcMatches) {
        const ref = match.match(/["']([^"']+)["']/)[1];
        if (ref.startsWith('http') || ref.startsWith('//') || ref.startsWith('#') || ref.startsWith('data:') || ref.startsWith('chrome-extension:')) continue;

        const resolved = path.resolve(path.dirname(filePath), ref);
        if (!fs.existsSync(resolved)) {
          deadLinks.push({
            file: file.path,
            line: 0,
            reference: ref,
            type: 'html-link',
          });
        }
      }
    } catch { /* skip */ }
  }

  console.log(`    🔗 Dead links found: ${deadLinks.length}`);

  return deadLinks;
}

// ── Phase 4: Dependency Web ──────────────────────────────────────────────────
function buildDependencyWeb(map) {
  console.log('  🕷️ Phase 4 — Building dependency web...');

  const graph = {};  // { file: [dependencies] }
  const codeFiles = map.files.filter(f => f.isCode);

  for (const file of codeFiles) {
    const filePath = path.join(REPO, file.path);
    graph[file.path] = [];

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Find all local dependencies
      const patterns = [
        /require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g,
        /from\s+['"](\.[^'"]+)['"]/g,
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const target = match[1];
          const resolved = path.resolve(path.dirname(filePath), target);
          let relative = path.relative(REPO, resolved);

          // Resolve to actual file
          if (fs.existsSync(`${resolved}.js`)) relative = `${relative}.js`;
          else if (fs.existsSync(path.join(resolved, 'index.js'))) relative = path.join(relative, 'index.js');

          graph[file.path].push(relative);
        }
      }
    } catch { /* skip */ }
  }

  // Compute stats
  const totalEdges = Object.values(graph).reduce((s, deps) => s + deps.length, 0);
  const mostConnected = Object.entries(graph)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);

  // Find most-depended-on files
  const dependedOn = {};
  for (const deps of Object.values(graph)) {
    for (const dep of deps) {
      dependedOn[dep] = (dependedOn[dep] || 0) + 1;
    }
  }
  const mostDepended = Object.entries(dependedOn)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`    📊 Graph nodes: ${Object.keys(graph).length}`);
  console.log(`    📊 Graph edges: ${totalEdges}`);
  console.log(`    📊 Most connected: ${mostConnected[0]?.[0] || 'none'} (${mostConnected[0]?.[1]?.length || 0} deps)`);

  return { graph, totalEdges, mostConnected, mostDepended };
}

// ── Phase 5: Report ──────────────────────────────────────────────────────────
function generateReport(map, orphans, deadLinks, depWeb) {
  console.log('  🕷️ Phase 5 — Generating crawler report...');

  fs.mkdirSync(DOCS, { recursive: true });

  const formatSize = (bytes) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const totalSize = map.files.reduce((s, f) => s + (f.size || 0), 0);

  const lines = [
    '# 🕷️ Organism Crawler Report',
    '',
    `> Auto-generated by organism-crawler-bot on ${new Date().toUTCString()}`,
    '',
    '## Organism Map',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Total Files | ${map.files.length} |`,
    `| Total Directories | ${map.dirs.length} |`,
    `| Code Files | ${map.files.filter(f => f.isCode).length} |`,
    `| Doc Files | ${map.files.filter(f => f.isDoc).length} |`,
    `| Total Size | ${formatSize(totalSize)} |`,
    `| Dependency Graph Edges | ${depWeb?.totalEdges || 0} |`,
    `| Orphan Files | ${orphans?.length || 0} |`,
    `| Dead Links | ${deadLinks?.length || 0} |`,
    '',
    '## 📁 Top-Level Distribution',
    '',
    '| Directory | Files |',
    '|-----------|-------|',
    ...Object.entries(map.topDirs).sort((a, b) => b[1] - a[1]).map(([dir, count]) =>
      `| \`${dir}\` | ${count} |`
    ),
    '',
    '## 📊 File Type Distribution',
    '',
    '| Extension | Count |',
    '|-----------|-------|',
    ...Object.entries(map.extCounts).sort((a, b) => b[1] - a[1]).map(([ext, count]) =>
      `| \`${ext}\` | ${count} |`
    ),
    '',
  ];

  // Orphans
  if (orphans && orphans.length > 0) {
    lines.push('## 🔍 Potential Orphan Files');
    lines.push('');
    lines.push('Files that no other module imports:');
    lines.push('');
    lines.push('| File | Size |');
    lines.push('|------|------|');
    for (const o of orphans.slice(0, 30)) {
      lines.push(`| \`${o.path}\` | ${formatSize(o.size)} |`);
    }
    if (orphans.length > 30) {
      lines.push(`| ... and ${orphans.length - 30} more | |`);
    }
    lines.push('');
  }

  // Dead links
  if (deadLinks && deadLinks.length > 0) {
    lines.push('## 🔗 Dead Links & Broken References');
    lines.push('');
    lines.push('| File | Line | Reference | Type |');
    lines.push('|------|------|-----------|------|');
    for (const d of deadLinks.slice(0, 30)) {
      lines.push(`| \`${d.file}\` | ${d.line} | \`${d.reference}\` | ${d.type} |`);
    }
    if (deadLinks.length > 30) {
      lines.push(`| ... and ${deadLinks.length - 30} more | | | |`);
    }
    lines.push('');
  }

  // Dependency web
  if (depWeb) {
    lines.push('## 🕸️ Dependency Web');
    lines.push('');

    if (depWeb.mostConnected.length > 0) {
      lines.push('### Most Connected (imports the most)');
      lines.push('');
      lines.push('| File | Dependencies |');
      lines.push('|------|-------------|');
      for (const [file, deps] of depWeb.mostConnected) {
        lines.push(`| \`${file}\` | ${deps.length} |`);
      }
      lines.push('');
    }

    if (depWeb.mostDepended.length > 0) {
      lines.push('### Most Depended On (imported by the most)');
      lines.push('');
      lines.push('| File | Depended On By |');
      lines.push('|------|---------------|');
      for (const [file, count] of depWeb.mostDepended) {
        lines.push(`| \`${file}\` | ${count} modules |`);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('*Generated by organism-crawler-bot*');

  fs.writeFileSync(path.join(DOCS, 'crawler-report.md'), lines.join('\n'));
  console.log(`  📄 Report written to docs/crawler-report.md`);
}

// ── Dashboard Generation ──────────────────────────────────────────────────────
function generateDashboard(map, orphans, deadLinks, depWeb) {
  console.log('  🕷️ Generating crawler dashboard...');

  const DIST_DASH = path.join(REPO, 'dist', 'dashboards');
  fs.mkdirSync(DIST_DASH, { recursive: true });

  const state = {
    summary: {
      totalFiles:  (map?.files || []).length,
      totalDirs:   (map?.dirs || []).length,
      codeFiles:   (map?.files || []).filter(f => f.isCode).length,
      docFiles:    (map?.files || []).filter(f => f.isDoc).length,
      orphanCount: (orphans || []).length,
      referenced:  0,  // computed in orphan scanner
      deadLinks:   (deadLinks || []).length,
      filesChecked: (map?.files || []).filter(f => f.isCode || f.ext === '.html').length,
      graphNodes:  depWeb ? Object.keys(depWeb.graph || {}).length : 0,
      graphEdges:  depWeb?.totalEdges || 0,
      topHubScore: depWeb?.mostConnected?.[0]?.[1]?.length || 0,
    },
    orphans: (orphans || []).map(o => o.path).slice(0, 100),
    deadLinks: (deadLinks || []).slice(0, 100),
    topHubs: (depWeb?.mostConnected || []).slice(0, 15).map(([file, deps]) => ({
      file,
      score: ((deps.length * 1.618) + 1).toFixed(3),
      inDegree: depWeb.mostDepended.find(([f]) => f === file)?.[1] || 0,
      outDegree: deps.length,
    })),
    generatedAt: new Date().toISOString(),
  };

  // Read the template dashboard and inject state
  const templatePath = path.join(REPO, 'dist', 'dashboards', 'crawler-dashboard.html');
  if (!fs.existsSync(templatePath)) {
    console.log('    ⚠ Dashboard template not found — skipping');
    return;
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  // Inject the state as a script tag before closing body
  const injection = `\n  <script>\n    window.CRAWLER_STATE = ${JSON.stringify(state, null, 2)};\n  </script>\n`;
  html = html.replace('</body>', `${injection}</body>`);

  fs.writeFileSync(templatePath, html);
  console.log(`  📊 Dashboard state injected into dist/dashboards/crawler-dashboard.html`);
  console.log(`    Files: ${state.summary.totalFiles} | Orphans: ${state.summary.orphanCount} | Dead links: ${state.summary.deadLinks}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('');
  console.log('🕷️ Organism Crawler & Mapper');
  console.log('═══════════════════════════════════════════');
  console.log('');

  let map = null, orphans = null, deadLinks = null, depWeb = null;

  if (flags.map || flags.orphans || flags.deadLinks || flags.dependencyWeb || flags.report || flags.dashboard) {
    map = buildMap();
  }
  if (flags.orphans && map)       orphans = findOrphans(map);
  if (flags.deadLinks && map)     deadLinks = findDeadLinks(map);
  if (flags.dependencyWeb && map) depWeb = buildDependencyWeb(map);
  if (flags.report)               generateReport(map, orphans, deadLinks, depWeb);
  if (flags.dashboard)            generateDashboard(map, orphans, deadLinks, depWeb);

  console.log('');
  console.log('  ✅ Organism crawl complete');
  console.log('');
}

main();
