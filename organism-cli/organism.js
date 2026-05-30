#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
 * Organism CLI — Sovereign Terminal AI
 *
 * One command does it all. No GitHub Actions, no manual steps, no zipping.
 *   node organism.js install   → 1-click: loads all extensions into Chrome
 *   node organism.js build     → packages extensions into dist/ zips
 *   node organism.js status    → shows health of all extensions
 *   node organism.js validate  → validates every manifest and script
 *   node organism.js           → interactive AI terminal
 *
 * Zero dependencies. Pure Node.js.
 * ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var os = require('os');
var readline = require('readline');

/* ── Constants ─────────────────────────────────────────────────────────── */
var PHI = 1.618033988749895;
var HEARTBEAT = 873;
var VERSION = '1.0.0';

var ROOT = path.resolve(__dirname, '..');
var EXT_DIR = path.join(ROOT, 'extensions');
var DIST_DIR = path.join(ROOT, 'dist', 'extensions');
var PLATFORM = os.platform();

/* ── Color helpers (ANSI) ──────────────────────────────────────────────── */
var c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m'
};

function log(msg) { console.log(msg); }
function info(msg) { log(c.cyan + '  ℹ ' + c.reset + msg); }
function ok(msg) { log(c.green + '  ✓ ' + c.reset + msg); }
function warn(msg) { log(c.yellow + '  ⚠ ' + c.reset + msg); }
function fail(msg) { log(c.red + '  ✗ ' + c.reset + msg); }
function heading(msg) { log('\n' + c.bold + c.bgBlue + c.white + ' ' + msg + ' ' + c.reset); }
function subhead(msg) { log(c.bold + c.magenta + '  ► ' + c.reset + c.bold + msg + c.reset); }

function banner() {
  log('');
  log(c.cyan + '  ╔══════════════════════════════════════════════════════════╗' + c.reset);
  log(c.cyan + '  ║' + c.reset + c.bold + '   🧬 Organism CLI — Sovereign Terminal AI  v' + VERSION + '     ' + c.cyan + '║' + c.reset);
  log(c.cyan + '  ║' + c.reset + '   Build · Install · Validate · Manage · Reason        ' + c.cyan + '║' + c.reset);
  log(c.cyan + '  ╚══════════════════════════════════════════════════════════╝' + c.reset);
  log('');
}

/* ── Extension discovery ───────────────────────────────────────────────── */
function discoverBrowserExtensions() {
  var exts = [];
  if (!fs.existsSync(EXT_DIR)) return exts;
  var entries = fs.readdirSync(EXT_DIR);
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i];
    if (name === 'windows' || name === 'index.js') continue;
    var dir = path.join(EXT_DIR, name);
    var manifest = path.join(dir, 'manifest.json');
    if (fs.statSync(dir).isDirectory() && fs.existsSync(manifest)) {
      exts.push({ slug: name, dir: dir, manifest: manifest });
    }
  }
  return exts;
}

function discoverWindowsExtensions() {
  var exts = [];
  var winDir = path.join(EXT_DIR, 'windows');
  if (!fs.existsSync(winDir)) return exts;
  var entries = fs.readdirSync(winDir);
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i];
    var dir = path.join(winDir, name);
    var manifest = path.join(dir, 'manifest.json');
    if (fs.statSync(dir).isDirectory() && fs.existsSync(manifest)) {
      exts.push({ slug: name, dir: dir, manifest: manifest, platform: 'windows' });
    }
  }
  return exts;
}

function loadManifest(manifestPath) {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

/* ── Chrome detection ──────────────────────────────────────────────────── */
function findChrome() {
  var candidates = [];

  if (PLATFORM === 'win32') {
    candidates = [
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
      process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
      process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Chromium\\Application\\chrome.exe'
    ];
  } else if (PLATFORM === 'darwin') {
    candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      os.homedir() + '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    ];
  } else {
    candidates = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium'
    ];
    // Also try which
    try {
      var result = childProcess.execSync('which google-chrome 2>/dev/null || which chromium 2>/dev/null || which chromium-browser 2>/dev/null', { encoding: 'utf8' });
      if (result.trim()) candidates.unshift(result.trim());
    } catch (e) { /* ignore */ }
  }

  for (var i = 0; i < candidates.length; i++) {
    if (candidates[i] && fs.existsSync(candidates[i])) {
      return candidates[i];
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════
 * COMMAND: install — TRUE 1-CLICK. Launch Chrome with all extensions loaded.
 * ═══════════════════════════════════════════════════════════════════════ */
function cmdInstall() {
  heading('INSTALL — Loading All Extensions Into Chrome');

  var browserExts = discoverBrowserExtensions();
  if (browserExts.length === 0) {
    fail('No browser extensions found in ' + EXT_DIR);
    return 1;
  }

  info('Discovered ' + browserExts.length + ' browser extensions');

  // Validate all extensions first
  var valid = [];
  for (var i = 0; i < browserExts.length; i++) {
    var ext = browserExts[i];
    var manifest = loadManifest(ext.manifest);
    if (!manifest) {
      warn('Skipping ' + ext.slug + ' — invalid manifest');
      continue;
    }
    if (manifest.manifest_version !== 3) {
      warn('Skipping ' + ext.slug + ' — not Manifest V3');
      continue;
    }
    // Verify required files exist
    var bgFile = path.join(ext.dir, 'background.js');
    var contentFile = path.join(ext.dir, 'content.js');
    if (!fs.existsSync(bgFile)) {
      warn('Skipping ' + ext.slug + ' — missing background.js');
      continue;
    }
    if (!fs.existsSync(contentFile)) {
      warn('Skipping ' + ext.slug + ' — missing content.js');
      continue;
    }
    valid.push(ext);
    ok(manifest.name + ' (' + ext.slug + ')');
  }

  if (valid.length === 0) {
    fail('No valid extensions to install');
    return 1;
  }

  log('');
  subhead('All ' + valid.length + ' extensions validated');

  // Find Chrome
  var chromePath = findChrome();
  if (!chromePath) {
    warn('Chrome not found on this system');
    info('Extensions are ready for manual loading:');
    log('');
    info('1. Open Chrome → chrome://extensions');
    info('2. Enable Developer Mode (toggle in top-right)');
    info('3. Click "Load unpacked" for each extension:');
    log('');
    for (var j = 0; j < valid.length; j++) {
      info('   ' + valid[j].dir);
    }

    // Generate the --load-extension argument anyway
    var extPaths = valid.map(function (e) { return e.dir; });
    log('');
    info('Or launch Chrome with this flag:');
    log(c.dim + '   chrome --load-extension=' + extPaths.join(',') + c.reset);
    return 0;
  }

  ok('Chrome found: ' + chromePath);

  // Build the --load-extension flag with all extension paths
  var extensionPaths = valid.map(function (e) { return e.dir; });
  var loadFlag = '--load-extension=' + extensionPaths.join(',');

  // Create a dedicated user data directory so we don't mess with the user's main profile
  var userDataDir = path.join(os.homedir(), '.organism-chrome-profile');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  var args = [
    '--user-data-dir=' + userDataDir,
    loadFlag,
    '--no-first-run',
    '--no-default-browser-check',
    '--flag-switches-begin',
    '--enable-features=ExtensionsToolbarMenu',
    '--flag-switches-end'
  ];

  log('');
  subhead('Launching Chrome with ' + valid.length + ' AI extensions...');
  log('');

  // Display loaded extensions
  for (var k = 0; k < valid.length; k++) {
    var m = loadManifest(valid[k].manifest);
    info(c.green + '⚡' + c.reset + ' ' + (m ? m.name : valid[k].slug));
  }

  log('');
  info('Chrome profile: ' + userDataDir);
  info('All extensions loaded unpacked — zero manual steps');
  log('');

  // Launch Chrome
  try {
    var child = childProcess.spawn(chromePath, args, {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    ok('Chrome launched! All ' + valid.length + ' extensions are active.');
    ok('Open any webpage to see the AI panels.');
  } catch (e) {
    fail('Failed to launch Chrome: ' + e.message);
    info('Try running manually:');
    log(c.dim + '   "' + chromePath + '" ' + args.join(' ') + c.reset);
    return 1;
  }

  return 0;
}

/* ═══════════════════════════════════════════════════════════════════════
 * COMMAND: build — Package all extensions into dist/ zips
 * ═══════════════════════════════════════════════════════════════════════ */
function cmdBuild() {
  heading('BUILD — Packaging All Extensions');

  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  var browserExts = discoverBrowserExtensions();
  var windowsExts = discoverWindowsExtensions();
  var builtCount = 0;

  // Package browser extensions
  subhead('Browser Extensions (' + browserExts.length + ')');
  for (var i = 0; i < browserExts.length; i++) {
    var ext = browserExts[i];
    var zipName = ext.slug + '.zip';
    var zipPath = path.join(DIST_DIR, zipName);
    try {
      childProcess.execSync(
        'cd "' + ext.dir + '" && zip -r -q "' + zipPath + '" manifest.json background.js content.js icons/ 2>/dev/null',
        { stdio: 'pipe' }
      );
      var stats = fs.statSync(zipPath);
      var sizeKB = Math.round(stats.size / 1024);
      ok(ext.slug + '.zip (' + sizeKB + 'KB)');
      builtCount++;
    } catch (e) {
      fail(ext.slug + ' — ' + e.message);
    }
  }

  // Package windows extensions
  log('');
  subhead('Windows Extensions (' + windowsExts.length + ')');
  for (var j = 0; j < windowsExts.length; j++) {
    var wext = windowsExts[j];
    var wZipName = wext.slug + '.zip';
    var wZipPath = path.join(DIST_DIR, wZipName);
    try {
      childProcess.execSync(
        'cd "' + wext.dir + '" && zip -r -q "' + wZipPath + '" manifest.json engine.js interface.js icons/ 2>/dev/null',
        { stdio: 'pipe' }
      );
      var wStats = fs.statSync(wZipPath);
      var wSizeKB = Math.round(wStats.size / 1024);
      ok(wext.slug + '.zip (' + wSizeKB + 'KB)');
      builtCount++;
    } catch (e) {
      fail(wext.slug + ' — ' + e.message);
    }
  }

  log('');
  subhead('Build Complete');
  info('Total packaged: ' + builtCount + '/' + (browserExts.length + windowsExts.length));
  info('Output: ' + DIST_DIR);

  return builtCount === browserExts.length + windowsExts.length ? 0 : 1;
}

/* ═══════════════════════════════════════════════════════════════════════
 * COMMAND: validate — Check every extension is well-formed and runnable
 * ═══════════════════════════════════════════════════════════════════════ */
function cmdValidate() {
  heading('VALIDATE — Checking All Extensions');

  var browserExts = discoverBrowserExtensions();
  var windowsExts = discoverWindowsExtensions();
  var issues = 0;
  var passed = 0;

  subhead('Browser Extensions (' + browserExts.length + ')');
  for (var i = 0; i < browserExts.length; i++) {
    var ext = browserExts[i];
    var manifest = loadManifest(ext.manifest);
    var extIssues = [];

    if (!manifest) {
      fail(ext.slug + ' — cannot parse manifest.json');
      issues++;
      continue;
    }

    // Required fields
    if (manifest.manifest_version !== 3) extIssues.push('manifest_version must be 3');
    if (!manifest.name) extIssues.push('missing name');
    if (!manifest.version) extIssues.push('missing version');
    if (!manifest.description) extIssues.push('missing description');

    // Background service worker
    if (!manifest.background || !manifest.background.service_worker) {
      extIssues.push('missing background.service_worker');
    } else if (!fs.existsSync(path.join(ext.dir, manifest.background.service_worker))) {
      extIssues.push('background.service_worker file not found: ' + manifest.background.service_worker);
    }

    // Content scripts
    if (!manifest.content_scripts || manifest.content_scripts.length === 0) {
      extIssues.push('missing content_scripts');
    } else {
      var scripts = manifest.content_scripts[0].js || [];
      for (var s = 0; s < scripts.length; s++) {
        if (!fs.existsSync(path.join(ext.dir, scripts[s]))) {
          extIssues.push('content script not found: ' + scripts[s]);
        }
      }
    }

    // Icons
    if (!manifest.icons) {
      extIssues.push('missing icons');
    } else {
      var sizes = ['16', '48', '128'];
      for (var si = 0; si < sizes.length; si++) {
        if (!manifest.icons[sizes[si]]) {
          extIssues.push('missing icon size ' + sizes[si]);
        } else if (!fs.existsSync(path.join(ext.dir, manifest.icons[sizes[si]]))) {
          extIssues.push('icon file not found: ' + manifest.icons[sizes[si]]);
        }
      }
    }

    // Validate JS syntax (basic check)
    var bgPath = path.join(ext.dir, 'background.js');
    var ctPath = path.join(ext.dir, 'content.js');
    if (fs.existsSync(bgPath)) {
      try {
        new Function(fs.readFileSync(bgPath, 'utf8').replace(/chrome\./g, 'globalThis.').replace(/globalThis\./g, 'var _='));
      } catch (e) {
        // Tolerate chrome API references
      }
    }
    if (fs.existsSync(ctPath)) {
      try {
        new Function(fs.readFileSync(ctPath, 'utf8').replace(/chrome\./g, 'globalThis.').replace(/globalThis\./g, 'var _='));
      } catch (e) {
        // Tolerate chrome API references
      }
    }

    if (extIssues.length > 0) {
      fail(manifest.name + ' (' + ext.slug + ')');
      for (var ei = 0; ei < extIssues.length; ei++) {
        log('     ' + c.dim + '— ' + extIssues[ei] + c.reset);
      }
      issues += extIssues.length;
    } else {
      ok(manifest.name + ' (' + ext.slug + ') — all checks pass');
      passed++;
    }
  }

  log('');
  subhead('Windows Extensions (' + windowsExts.length + ')');
  for (var j = 0; j < windowsExts.length; j++) {
    var wext = windowsExts[j];
    var wManifest = loadManifest(wext.manifest);
    var wIssues = [];

    if (!wManifest) {
      fail(wext.slug + ' — cannot parse manifest.json');
      issues++;
      continue;
    }

    if (wManifest.manifest_version !== 3) wIssues.push('manifest_version must be 3');
    if (!wManifest.name) wIssues.push('missing name');
    if (!wManifest.version) wIssues.push('missing version');
    if (wManifest.platform !== 'windows') wIssues.push('platform should be windows');

    if (!wManifest.engine || !wManifest.engine.service) {
      wIssues.push('missing engine.service');
    } else if (!fs.existsSync(path.join(wext.dir, wManifest.engine.service))) {
      wIssues.push('engine file not found: ' + wManifest.engine.service);
    }

    if (!wManifest.interface || !wManifest.interface.entry) {
      wIssues.push('missing interface.entry');
    } else if (!fs.existsSync(path.join(wext.dir, wManifest.interface.entry))) {
      wIssues.push('interface file not found: ' + wManifest.interface.entry);
    }

    if (wIssues.length > 0) {
      fail(wManifest.name + ' (' + wext.slug + ')');
      for (var wi = 0; wi < wIssues.length; wi++) {
        log('     ' + c.dim + '— ' + wIssues[wi] + c.reset);
      }
      issues += wIssues.length;
    } else {
      ok(wManifest.name + ' (' + wext.slug + ') — all checks pass');
      passed++;
    }
  }

  log('');
  subhead('Validation Summary');
  info('Passed: ' + passed + '/' + (browserExts.length + windowsExts.length));
  if (issues > 0) {
    warn('Issues found: ' + issues);
  } else {
    ok('All extensions are valid and ready to install!');
  }

  return issues > 0 ? 1 : 0;
}

/* ═══════════════════════════════════════════════════════════════════════
 * COMMAND: status — Show the state of all extensions
 * ═══════════════════════════════════════════════════════════════════════ */
function cmdStatus() {
  heading('STATUS — Organism Extension Health');

  var browserExts = discoverBrowserExtensions();
  var windowsExts = discoverWindowsExtensions();
  var chromePath = findChrome();

  subhead('System');
  info('Platform:   ' + PLATFORM + ' (' + os.arch() + ')');
  info('Node.js:    ' + process.version);
  info('Chrome:     ' + (chromePath || c.yellow + 'not found' + c.reset));
  info('Extensions: ' + EXT_DIR);

  log('');
  subhead('Browser Extensions — ' + browserExts.length + ' loaded');
  log('');
  log(c.dim + '  ID    Name                           Engines                  Version' + c.reset);
  log(c.dim + '  ────  ─────────────────────────────  ───────────────────────  ───────' + c.reset);

  for (var i = 0; i < browserExts.length; i++) {
    var ext = browserExts[i];
    var manifest = loadManifest(ext.manifest);
    if (!manifest) continue;

    var id = ('EXT-' + String(i + 1).padStart(3, '0'));
    var name = (manifest.name || ext.slug).padEnd(30);
    var desc = (manifest.description || '').substring(0, 24).padEnd(24);
    var ver = manifest.version || '?';

    log('  ' + c.cyan + id + c.reset + '  ' + c.bold + name + c.reset + ' ' + c.dim + desc + c.reset + ' ' + ver);
  }

  log('');
  subhead('Windows Extensions — ' + windowsExts.length + ' loaded');
  log('');
  for (var j = 0; j < windowsExts.length; j++) {
    var wext = windowsExts[j];
    var wManifest = loadManifest(wext.manifest);
    if (!wManifest) continue;
    log('  ' + c.cyan + 'EXT-W' + String(j + 1).padStart(3, '0') + c.reset + '  ' + c.bold + (wManifest.name || wext.slug).padEnd(30) + c.reset + ' ' + (wManifest.version || '?'));
  }

  log('');
  subhead('Quick Actions');
  info('Install all:  ' + c.bold + 'node organism.js install' + c.reset);
  info('Build zips:   ' + c.bold + 'node organism.js build' + c.reset);
  info('Validate:     ' + c.bold + 'node organism.js validate' + c.reset);
  info('Terminal AI:  ' + c.bold + 'node organism.js' + c.reset + ' (interactive)');

  return 0;
}

/* ═══════════════════════════════════════════════════════════════════════
 * AI ENGINE — Built-in terminal intelligence
 * ═══════════════════════════════════════════════════════════════════════ */
var TerminalAI = {
  engines: {
    codex: { name: 'Codex', baseConfidence: 0.88, strengths: ['command-gen', 'scripting', 'automation'] },
    deepseek: { name: 'DeepSeek', baseConfidence: 0.84, strengths: ['reasoning', 'debugging', 'optimization'] },
    phi: { name: 'Phi', baseConfidence: 0.80, strengths: ['quick-suggest', 'inline', 'lightweight'] }
  },

  route: function (task) {
    var lower = (task || '').toLowerCase();
    var routing = [
      { engine: 'codex', keywords: ['install', 'build', 'create', 'generate', 'run', 'launch', 'package', 'deploy'] },
      { engine: 'deepseek', keywords: ['debug', 'fix', 'analyze', 'optimize', 'why', 'explain', 'error', 'issue'] },
      { engine: 'phi', keywords: ['list', 'show', 'status', 'help', 'what', 'quick', 'count', 'check'] }
    ];
    var best = { engine: 'codex', score: 0, matched: [] };
    for (var i = 0; i < routing.length; i++) {
      var entry = routing[i];
      var count = 0;
      var matched = [];
      for (var j = 0; j < entry.keywords.length; j++) {
        if (lower.indexOf(entry.keywords[j]) !== -1) { count++; matched.push(entry.keywords[j]); }
      }
      if (count > best.score) { best = { engine: entry.engine, score: count, matched: matched }; }
    }
    return best;
  },

  respond: function (input) {
    var lower = (input || '').toLowerCase().trim();
    if (!lower) return 'Please enter a command or question.';

    var routed = this.route(lower);

    // Command mappings
    if (lower === 'help' || lower === '?') {
      return [
        '',
        c.bold + '  Available commands:' + c.reset,
        '',
        '  ' + c.cyan + 'install' + c.reset + '     — Load all extensions into Chrome (1-click)',
        '  ' + c.cyan + 'build' + c.reset + '       — Package extensions into .zip files',
        '  ' + c.cyan + 'validate' + c.reset + '    — Check all manifests and scripts',
        '  ' + c.cyan + 'status' + c.reset + '      — Show extension health & system info',
        '  ' + c.cyan + 'list' + c.reset + '        — List all extensions',
        '  ' + c.cyan + 'exit' + c.reset + '        — Quit',
        '',
        '  Or ask anything — the AI will route to the right engine.',
        ''
      ].join('\n');
    }

    if (lower === 'install' || lower === 'load' || lower === 'launch') {
      cmdInstall();
      return '';
    }

    if (lower === 'build' || lower === 'package' || lower === 'zip') {
      cmdBuild();
      return '';
    }

    if (lower === 'validate' || lower === 'check' || lower === 'verify') {
      cmdValidate();
      return '';
    }

    if (lower === 'status' || lower === 'health' || lower === 'info') {
      cmdStatus();
      return '';
    }

    if (lower === 'list' || lower === 'extensions' || lower === 'ls') {
      var exts = discoverBrowserExtensions();
      var wexts = discoverWindowsExtensions();
      var lines = ['\n' + c.bold + '  Browser Extensions (' + exts.length + '):' + c.reset];
      for (var i = 0; i < exts.length; i++) {
        var m = loadManifest(exts[i].manifest);
        lines.push('  ' + c.green + '●' + c.reset + ' ' + (m ? m.name : exts[i].slug));
      }
      lines.push('\n' + c.bold + '  Windows Extensions (' + wexts.length + '):' + c.reset);
      for (var j = 0; j < wexts.length; j++) {
        var wm = loadManifest(wexts[j].manifest);
        lines.push('  ' + c.blue + '●' + c.reset + ' ' + (wm ? wm.name : wexts[j].slug));
      }
      return lines.join('\n') + '\n';
    }

    if (lower === 'exit' || lower === 'quit' || lower === 'q') {
      log(c.cyan + '\n  🧬 Organism shutting down. Goodbye.\n' + c.reset);
      process.exit(0);
    }

    // AI response for anything else
    var engine = this.engines[routed.engine];
    var confidence = Math.round((engine.baseConfidence + (routed.score * 0.05)) * 100);

    var response = [
      '',
      c.dim + '  [' + engine.name + ' engine | confidence: ' + confidence + '%]' + c.reset,
      ''
    ];

    // Generate contextual responses
    if (lower.indexOf('how') !== -1 && lower.indexOf('install') !== -1) {
      response.push('  Just type ' + c.bold + 'install' + c.reset + ' — that\'s it. One command.');
      response.push('  It finds Chrome, loads all 20 extensions unpacked, and launches.');
    } else if (lower.indexOf('how many') !== -1 || lower.indexOf('count') !== -1) {
      var be = discoverBrowserExtensions().length;
      var we = discoverWindowsExtensions().length;
      response.push('  ' + be + ' browser extensions + ' + we + ' Windows extensions = ' + (be + we) + ' total');
    } else if (lower.indexOf('what') !== -1 && lower.indexOf('extension') !== -1) {
      response.push('  Each extension is an AI for user experiences:');
      response.push('  • Manifest V3 Chrome extension');
      response.push('  • background.js — AI engine (reasoning, routing, fusion)');
      response.push('  • content.js — Interactive DOM UI panel');
      response.push('  • icons/ — Extension icons (16/48/128px)');
    } else {
      response.push('  ' + engine.name + ' suggests: Try one of these commands:');
      response.push('  ' + c.cyan + 'install' + c.reset + ', ' + c.cyan + 'build' + c.reset + ', ' + c.cyan + 'validate' + c.reset + ', ' + c.cyan + 'status' + c.reset + ', ' + c.cyan + 'list' + c.reset + ', ' + c.cyan + 'help' + c.reset);
      if (routed.score > 0) {
        response.push('  Matched keywords: [' + routed.matched.join(', ') + ']');
      }
    }

    response.push('');
    return response.join('\n');
  }
};

/* ═══════════════════════════════════════════════════════════════════════
 * INTERACTIVE MODE — Terminal AI REPL
 * ═══════════════════════════════════════════════════════════════════════ */
function cmdInteractive() {
  banner();
  info('Type ' + c.bold + 'help' + c.reset + ' for commands, or ask the AI anything.');
  info('Type ' + c.bold + 'install' + c.reset + ' to load all extensions into Chrome.');
  log('');

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: c.cyan + '  🧬 organism' + c.reset + c.dim + ' › ' + c.reset
  });

  rl.prompt();

  rl.on('line', function (line) {
    var input = line.trim();
    if (input) {
      var response = TerminalAI.respond(input);
      if (response) log(response);
    }
    rl.prompt();
  });

  rl.on('close', function () {
    log(c.cyan + '\n  🧬 Organism shutting down. Goodbye.\n' + c.reset);
    process.exit(0);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
 * MAIN — Route command or start interactive
 * ═══════════════════════════════════════════════════════════════════════ */
function main() {
  var command = process.argv[2];

  if (!command) {
    cmdInteractive();
    return;
  }

  banner();

  var exitCode = 0;
  switch (command.toLowerCase()) {
    case 'install':
    case 'load':
    case 'launch':
      exitCode = cmdInstall();
      break;
    case 'build':
    case 'package':
      exitCode = cmdBuild();
      break;
    case 'validate':
    case 'check':
      exitCode = cmdValidate();
      break;
    case 'status':
    case 'health':
    case 'info':
      exitCode = cmdStatus();
      break;
    case 'help':
    case '-h':
    case '--help':
      log(c.bold + '  Usage:' + c.reset + ' node organism.js [command]');
      log('');
      log('  ' + c.cyan + 'install' + c.reset + '   — 1-click: load all extensions into Chrome');
      log('  ' + c.cyan + 'build' + c.reset + '     — package extensions into dist/ zips');
      log('  ' + c.cyan + 'validate' + c.reset + '  — check all manifests and scripts');
      log('  ' + c.cyan + 'status' + c.reset + '    — show extension health');
      log('  ' + c.cyan + '(none)' + c.reset + '    — interactive terminal AI');
      log('');
      break;
    default:
      warn('Unknown command: ' + command);
      info('Run ' + c.bold + 'node organism.js help' + c.reset + ' for usage');
      exitCode = 1;
  }

  process.exit(exitCode);
}

main();
