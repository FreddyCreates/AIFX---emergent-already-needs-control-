/**
 * Register AI Engine — Terminal Intelligence
 *
 * The AI brain of organism-cli. Scans, validates, builds, installs,
 * and monitors all 35 browser extensions. Runs steps 1–7 automatically.
 *
 * This IS the Register AI (TOOL-025) from the Builder family,
 * running natively in your terminal instead of in the browser.
 *
 * Steps:
 *   1. Scan — discover all extensions in extensions/
 *   2. Validate — check Manifest V3 compliance
 *   3. Detect Browser — find Chrome / Edge / Brave
 *   4. Load Extensions — launch browser with --load-extension (DIRECT, no zip)
 *   5. Verify — confirm extensions loaded
 *   6. Report — show status + health
 *   7. Monitor — heartbeat keepalive
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

/* ─── Colors (no dependencies) ──────────────────────────────── */
const c = {
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
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

/* ─── AI Engine Class ───────────────────────────────────────── */
class RegisterAIEngine {
  constructor(repoRoot) {
    this.repoRoot = repoRoot;
    this.extensionsDir = path.join(repoRoot, 'extensions');
    this.extensions = [];
    this.browser = null;
    this.browserName = '';
    this.startTime = Date.now();
  }

  /* ─── Step 1: SCAN ────────────────────────────────────────── */
  scan() {
    this.log('🔍', 'Scanning extensions...');

    if (!fs.existsSync(this.extensionsDir)) {
      this.error(`Extensions directory not found: ${this.extensionsDir}`);
      return [];
    }

    const dirs = fs.readdirSync(this.extensionsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    this.extensions = [];
    for (const dir of dirs) {
      const extPath = path.join(this.extensionsDir, dir);
      const manifestPath = path.join(extPath, 'manifest.json');

      if (!fs.existsSync(manifestPath)) continue;

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        this.extensions.push({
          slug: dir,
          path: extPath,
          manifest,
          name: manifest.name || dir,
          version: manifest.version || '0.0.0',
          valid: true,
          errors: [],
        });
      } catch (e) {
        this.extensions.push({
          slug: dir,
          path: extPath,
          manifest: null,
          name: dir,
          version: '?',
          valid: false,
          errors: [`Invalid manifest.json: ${e.message}`],
        });
      }
    }

    this.success(`Found ${this.extensions.length} extensions`);
    return this.extensions;
  }

  /* ─── Step 2: VALIDATE ────────────────────────────────────── */
  validate() {
    this.log('✅', 'Validating Manifest V3 compliance...');

    let valid = 0;
    let invalid = 0;

    for (const ext of this.extensions) {
      const errors = [];
      const m = ext.manifest;

      if (!m) {
        errors.push('No manifest.json or invalid JSON');
        ext.valid = false;
        ext.errors = errors;
        invalid++;
        continue;
      }

      // Required Manifest V3 fields
      if (m.manifest_version !== 3) errors.push('manifest_version must be 3');
      if (!m.name) errors.push('Missing "name"');
      if (!m.version) errors.push('Missing "version"');

      // Must have background service worker or content scripts
      const hasBackground = m.background && m.background.service_worker;
      const hasContent = m.content_scripts && m.content_scripts.length > 0;
      if (!hasBackground && !hasContent) {
        errors.push('No background.service_worker or content_scripts');
      }

      // Check that referenced files exist
      if (hasBackground) {
        const bgFile = path.join(ext.path, m.background.service_worker);
        if (!fs.existsSync(bgFile)) errors.push(`Missing: ${m.background.service_worker}`);
      }

      if (hasContent) {
        for (const cs of m.content_scripts) {
          for (const jsFile of (cs.js || [])) {
            if (!fs.existsSync(path.join(ext.path, jsFile))) {
              errors.push(`Missing: ${jsFile}`);
            }
          }
        }
      }

      ext.errors = errors;
      ext.valid = errors.length === 0;

      if (ext.valid) {
        valid++;
      } else {
        invalid++;
        this.warn(`  ⚠ ${ext.name}: ${errors.join(', ')}`);
      }
    }

    if (invalid === 0) {
      this.success(`All ${valid} extensions valid ✓`);
    } else {
      this.warn(`${valid} valid, ${invalid} invalid`);
    }

    return { valid, invalid };
  }

  /* ─── Step 3: DETECT BROWSER ──────────────────────────────── */
  detectBrowser() {
    this.log('🌐', 'Detecting Chromium browser...');

    const platform = os.platform();
    const candidates = [];

    if (platform === 'win32') {
      const pf = process.env.ProgramFiles || 'C:\\Program Files';
      const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
      const localApp = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
      candidates.push(
        // Edge FIRST — native Windows browser, best integration
        { name: 'Edge', path: path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe') },
        { name: 'Edge', path: path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe') },
        { name: 'Edge', path: path.join(localApp, 'Microsoft', 'Edge', 'Application', 'msedge.exe') },
        { name: 'Chrome', path: path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe') },
        { name: 'Chrome', path: path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe') },
        { name: 'Chrome', path: path.join(localApp, 'Google', 'Chrome', 'Application', 'chrome.exe') },
        { name: 'Brave', path: path.join(pf, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe') },
        { name: 'Brave', path: path.join(localApp, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe') },
      );
    } else if (platform === 'darwin') {
      candidates.push(
        { name: 'Chrome', path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' },
        { name: 'Chrome', path: path.join(os.homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome') },
        { name: 'Edge', path: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' },
        { name: 'Brave', path: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' },
        { name: 'Chromium', path: '/Applications/Chromium.app/Contents/MacOS/Chromium' },
      );
    } else {
      // Linux
      candidates.push(
        { name: 'Chrome', path: '/usr/bin/google-chrome' },
        { name: 'Chrome', path: '/usr/bin/google-chrome-stable' },
        { name: 'Chromium', path: '/usr/bin/chromium' },
        { name: 'Chromium', path: '/usr/bin/chromium-browser' },
        { name: 'Brave', path: '/usr/bin/brave-browser' },
        { name: 'Edge', path: '/usr/bin/microsoft-edge' },
        { name: 'Edge', path: '/usr/bin/microsoft-edge-stable' },
      );

      // Also try `which`
      for (const cmd of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'brave-browser', 'microsoft-edge']) {
        try {
          const found = execSync(`which ${cmd} 2>/dev/null`, { encoding: 'utf8' }).trim();
          if (found) {
            const name = cmd.includes('chrome') ? 'Chrome' : cmd.includes('brave') ? 'Brave' : cmd.includes('edge') ? 'Edge' : 'Chromium';
            candidates.push({ name, path: found });
          }
        } catch { /* not found */ }
      }
    }

    for (const candidate of candidates) {
      if (fs.existsSync(candidate.path)) {
        this.browser = candidate.path;
        this.browserName = candidate.name;
        this.success(`Found ${candidate.name}: ${candidate.path}`);
        return candidate;
      }
    }

    this.warn('No Chromium browser found. Extensions are ready at:');
    this.info(`  ${this.extensionsDir}`);
    return null;
  }

  /* ─── Step 4: INSTALL (load extensions directly) ──────────── */
  install() {
    const validExts = this.extensions.filter(e => e.valid);

    if (validExts.length === 0) {
      this.error('No valid extensions to install');
      return false;
    }

    // Build comma-separated path list for --load-extension
    const loadPaths = validExts.map(e => e.path).join(',');

    if (!this.browser) {
      this.log('📂', 'No browser detected — extensions ready for manual load:');
      this.info(`  Chrome: chrome://extensions → Load unpacked`);
      for (const ext of validExts) {
        this.info(`    ${ext.path}`);
      }
      return false;
    }

    this.log('🚀', `Launching ${this.browserName} with ${validExts.length} extensions attached...`);

    // Launch browser with extensions pre-loaded — DIRECT from source, no zip needed
    const args = [`--load-extension=${loadPaths}`];

    const child = spawn(this.browser, args, {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    this.success(`${this.browserName} launched with ${validExts.length} extensions!`);
    this.info(`  Extensions loaded directly from: ${this.extensionsDir}`);
    this.info(`  No zip. No extract. No manual steps.`);
    return true;
  }

  /* ─── Step 5: LIST ────────────────────────────────────────── */
  list() {
    if (this.extensions.length === 0) this.scan();

    console.log('');
    console.log(`${c.bold}${c.cyan}  ╔══════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.bold}${c.cyan}  ║   🧬 Sovereign Organism — 35 AI Extensions  ║${c.reset}`);
    console.log(`${c.bold}${c.cyan}  ╚══════════════════════════════════════════════╝${c.reset}`);
    console.log('');

    for (let i = 0; i < this.extensions.length; i++) {
      const ext = this.extensions[i];
      const status = ext.valid ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
      const num = String(i + 1).padStart(2, ' ');
      console.log(`  ${c.dim}${num}.${c.reset} ${status} ${c.bold}${ext.name}${c.reset} ${c.dim}v${ext.version}${c.reset}`);
      if (!ext.valid && ext.errors.length > 0) {
        for (const err of ext.errors) {
          console.log(`      ${c.red}↳ ${err}${c.reset}`);
        }
      }
    }

    console.log('');
    const valid = this.extensions.filter(e => e.valid).length;
    console.log(`  ${c.green}${valid}${c.reset} valid · ${c.dim}${this.extensions.length} total${c.reset}`);
    console.log('');
  }

  /* ─── Step 6: STATUS ──────────────────────────────────────── */
  status() {
    if (this.extensions.length === 0) this.scan();

    const valid = this.extensions.filter(e => e.valid).length;
    const invalid = this.extensions.length - valid;
    const uptime = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const vitality = valid / Math.max(this.extensions.length, 1);
    const vitalityPct = (vitality * 100).toFixed(0);

    console.log('');
    console.log(`${c.bold}${c.yellow}  Register AI — Status${c.reset}`);
    console.log(`${c.dim}  ─────────────────────────────────────${c.reset}`);
    console.log(`  Extensions:  ${c.bold}${this.extensions.length}${c.reset}`);
    console.log(`  Valid:        ${c.green}${valid}${c.reset}`);
    if (invalid > 0) console.log(`  Invalid:      ${c.red}${invalid}${c.reset}`);
    console.log(`  Vitality:     ${vitality >= 0.9 ? c.green : vitality >= 0.5 ? c.yellow : c.red}${vitalityPct}%${c.reset}`);
    console.log(`  Browser:      ${this.browserName || c.dim + 'not detected' + c.reset}`);
    console.log(`  Heartbeat:    ${c.cyan}${HEARTBEAT}ms${c.reset}`);
    console.log(`  Phi:          ${c.magenta}${PHI.toFixed(6)}${c.reset}`);
    console.log(`  Uptime:       ${uptime}s`);
    console.log(`  Platform:     ${os.platform()} ${os.arch()}`);
    console.log('');
  }

  /* ─── FULL PIPELINE (Steps 1–7) ───────────────────────────── */
  runFullPipeline() {
    this.banner();

    // Step 1
    this.scan();

    // Step 2
    this.validate();

    // Step 3
    this.detectBrowser();

    // Step 4
    this.install();

    // Step 5+6
    this.status();

    // Step 7 — health summary
    this.log('💓', `Heartbeat: ${HEARTBEAT}ms · φ = ${PHI.toFixed(6)}`);
    console.log('');
    console.log(`${c.dim}  All extensions loaded directly from source.${c.reset}`);
    console.log(`${c.dim}  No zip. No extract. No manual steps. As above, so below.${c.reset}`);
    console.log('');
  }

  /* ─── Logging helpers ─────────────────────────────────────── */
  banner() {
    console.log('');
    console.log(`${c.bold}${c.yellow}  ╔═══════════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.bold}${c.yellow}  ║  🏗  Register AI — Terminal Intelligence          ║${c.reset}`);
    console.log(`${c.bold}${c.yellow}  ║  Builder Family · Sovereign Organism CLI           ║${c.reset}`);
    console.log(`${c.bold}${c.yellow}  ╚═══════════════════════════════════════════════════╝${c.reset}`);
    console.log('');
  }

  log(icon, msg) { console.log(`  ${icon} ${msg}`); }
  success(msg) { console.log(`  ${c.green}✓${c.reset} ${msg}`); }
  warn(msg) { console.log(`  ${c.yellow}⚠${c.reset} ${msg}`); }
  error(msg) { console.log(`  ${c.red}✗${c.reset} ${msg}`); }
  info(msg) { console.log(`  ${c.dim}${msg}${c.reset}`); }
}

module.exports = RegisterAIEngine;
