#!/usr/bin/env node
/**
 * VIGIL AI — Native Workflow Runner
 * ══════════════════════════════════
 *
 * Same architecture as VigilEngine's parseCommand → buildAction → execute* pipeline.
 * Same { action, payload, agent } dispatch protocol.
 * No GitHub Actions. No YAML runner. Straight to the runtime.
 *
 * Usage:
 *   node scripts/workflow-runner.js workflows/build.json
 *   node scripts/workflow-runner.js workflows/deploy-icp.json --network ic
 *   node scripts/workflow-runner.js --list
 *
 * The runner is a Node.js mirror of VigilEngine. Every action maps to an
 * execute*() method exactly like the Chrome extension's background/index.ts.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const cp   = require('child_process');

const REPO = path.resolve(__dirname, '..');
const PHI  = 1.618033988749895;

// ── Colours (same terminal palette used in build-all.sh) ──────────────────────
const C = {
  reset:  '\x1b[0m',  bold:   '\x1b[1m',
  cyan:   '\x1b[36m', green:  '\x1b[32m', red:    '\x1b[31m',
  yellow: '\x1b[33m', purple: '\x1b[35m', dim:    '\x1b[2m',
};
const ok   = m => console.log(`  ${C.green}✓${C.reset} ${m}`);
const fail = m => console.log(`  ${C.red}✗${C.reset} ${m}`);
const info = m => console.log(`  ${C.purple}→${C.reset} ${m}`);
const warn = m => console.log(`  ${C.yellow}⚠${C.reset}  ${m}`);
const banner = (m, w = 56) => {
  const line = '═'.repeat(w);
  console.log(`\n${C.bold}${C.cyan}${line}${C.reset}`);
  console.log(`${C.bold}${C.cyan}  ${m}${C.reset}`);
  console.log(`${C.bold}${C.cyan}${line}${C.reset}`);
};

// ── Step result ────────────────────────────────────────────────────────────────
class StepResult {
  constructor(action, success, message, data = {}) {
    this.action  = action;
    this.success = success;
    this.message = message;
    this.data    = data;
    this.timestamp = Date.now();
  }
}

// ── WorkflowEngine — mirrors VigilEngine's execute* pattern ───────────────────
class WorkflowEngine {
  constructor() {
    this.results    = [];
    this.startTime  = Date.now();
    // NeuroCore-style counters (matches MiniBrain pattern)
    this.stepsFired = 0;
    this.stepsPassed = 0;
    this.stepsFailed = 0;
    this.awareness  = 0;    // grows with PHI as steps fire (mirrors MiniBrain awarenessLevel)
  }

  // Mirrors MiniBrain.stimulus() — each step firing builds awareness
  _stimulus(action) {
    this.stepsFired++;
    this.awareness = Math.min(100, Math.round(Math.log(this.stepsFired + 1) / Math.log(PHI) * 5));
  }

  // Core dispatcher — mirrors VigilEngine.buildAction() → execute*()
  async dispatch(step) {
    this._stimulus(step.action);
    const { action, payload = {}, agent = 'ORCHESTRATOR' } = step;

    info(`[${agent}] ${action}`);

    try {
      let result;
      switch (action) {
        case 'validate:manifests':     result = await this.executeValidateManifests(payload); break;
        case 'run:tests':              result = await this.executeRunTests(payload); break;
        case 'build:extension':        result = await this.executeBuildExtension(payload); break;
        case 'package:zip':            result = await this.executePackageZip(payload); break;
        case 'package:all-extensions': result = await this.executePackageAllExtensions(payload); break;
        case 'generate:download-manifest': result = await this.executeGenerateManifest(payload); break;
        case 'check:dfx':             result = await this.executeCheckDfx(payload); break;
        case 'icp:start-local':        result = await this.executeIcpStartLocal(payload); break;
        case 'icp:deploy-canister':    result = await this.executeIcpDeploy(payload); break;
        case 'icp:get-url':            result = await this.executeIcpGetUrl(payload); break;
        default:
          result = new StepResult(action, false, `Unknown action: ${action}`);
      }

      if (result.success) {
        this.stepsPassed++;
        ok(`${result.message}`);
      } else {
        this.stepsFailed++;
        fail(`${result.message}`);
      }
      this.results.push(result);
      return result;
    } catch (err) {
      this.stepsFailed++;
      const r = new StepResult(action, false, err.message);
      this.results.push(r);
      fail(err.message);
      return r;
    }
  }

  // ── execute*() methods — each mirrors a VigilEngine.execute*() ──────────────

  async executeValidateManifests({ path: extPath = 'extensions' }) {
    const scriptPath = path.join(REPO, 'scripts/lint-manifests.js');
    if (!fs.existsSync(scriptPath)) {
      return new StepResult('validate:manifests', true, 'No lint-manifests.js found — skipping');
    }
    return this._shell('node', [scriptPath], 'Manifests valid', 'Manifest validation failed');
  }

  async executeRunTests({ pattern = 'test/**/*.test.js' }) {
    const testDir = path.join(REPO, 'test');
    if (!fs.existsSync(testDir)) {
      return new StepResult('run:tests', true, 'No test directory — skipping');
    }
    const files = this._glob(path.join(REPO, pattern));
    if (files.length === 0) {
      return new StepResult('run:tests', true, 'No test files found — skipping');
    }
    return this._shell('node', ['--test', ...files], `${files.length} tests passed`, 'Tests failed');
  }

  async executeBuildExtension({ path: extPath = 'extensions/jarvis' }) {
    const fullPath = path.join(REPO, extPath);
    const pkgPath  = path.join(fullPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      return new StepResult('build:extension', false, `No package.json at ${extPath}`);
    }
    // npm install
    const installResult = await this._shell('npm', ['install', '--silent'], 'npm install done', 'npm install failed', fullPath);
    if (!installResult.success) return installResult;
    // npm run build
    return this._shell('npm', ['run', 'build'], 'Extension built', 'Extension build failed', fullPath);
  }

  async executePackageZip({ source, dest, exclude = [] }) {
    const srcPath  = path.join(REPO, source);
    const destPath = path.join(REPO, dest);
    if (!fs.existsSync(srcPath)) {
      return new StepResult('package:zip', false, `Source not found: ${source}`);
    }
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);

    const excludeArgs = exclude.flatMap(e => ['-x', e]);
    const result = await this._shell('zip', ['-r', '-q', destPath, '.', ...excludeArgs], `Zip created: ${path.basename(destPath)}`, 'Zip failed', srcPath);
    if (result.success) {
      const size = this._fileSize(destPath);
      result.message += ` (${size})`;
      result.data.destPath = destPath;
    }
    return result;
  }

  async executePackageAllExtensions({ source = 'extensions', dest, skip = [] }) {
    const extDir  = path.join(REPO, source);
    const destPath = path.join(REPO, dest);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    let count = 0;
    const entries = fs.readdirSync(extDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (skip.includes(entry.name)) continue;
      const mf = path.join(extDir, entry.name, 'manifest.json');
      const pj = path.join(extDir, entry.name, 'package.json');
      if (!fs.existsSync(mf)) continue;
      if (fs.existsSync(pj)) continue;  // Vite-based — handled separately
      const zipOut = path.join(REPO, 'dist/extensions', `${entry.name}.zip`);
      fs.mkdirSync(path.dirname(zipOut), { recursive: true });
      const extPath = path.join(extDir, entry.name);
      const files = ['manifest.json', 'background.js', 'content.js'].filter(f => fs.existsSync(path.join(extPath, f)));
      if (files.length === 0) continue;
      try {
        cp.execSync(`zip -r -q "${zipOut}" ${files.join(' ')} icons/ 2>/dev/null || true`, { cwd: extPath });
        count++;
      } catch { /* skip */ }
    }

    // Bundle all zips into one
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    cp.execSync(`zip -r -q "${destPath}" . -x "${path.basename(destPath)}"`, { cwd: path.join(REPO, 'dist/extensions') });
    const size = this._fileSize(destPath);
    return new StepResult('package:all-extensions', true, `Bundled ${count} extensions → all-extensions.zip (${size})`);
  }

  async executeGenerateManifest({ outputFile = 'VIGIL_DOWNLOADS.md', baseUrl, includeIcpUrl = false }) {
    const branch = this._gitBranch();
    const rawBase = baseUrl ? `${baseUrl}/${branch}` : `https://raw.githubusercontent.com/FreddyCreates/potential-succotash/${branch}`;

    // Find built zips
    const distDir = path.join(REPO, 'dist/extensions');
    const zips = fs.existsSync(distDir)
      ? fs.readdirSync(distDir).filter(f => f.endsWith('.zip'))
      : [];

    const lines = [
      '# Vigil AI — Download Links',
      '',
      `> Auto-generated by Vigil AI Workflow Runner on ${new Date().toUTCString()}`,
      '',
      '## 🔵 Chrome / Edge Extension',
      '',
      '| File | Link |',
      '|------|------|',
      ...zips.map(z => `| ${z} | [Download](${rawBase}/dist/extensions/${z}) |`),
      '',
      '## 🌐 PWA / Landing Page',
      '',
      includeIcpUrl
        ? '- **Internet Computer (ICP):** See canister URL in deploy-icp output'
        : '- **GitHub Pages:** https://freddycreates.github.io/potential-succotash/',
      '',
      '## 📥 One-click Installers',
      '',
      '| Platform | Command |',
      '|----------|---------|',
      '| Windows  | `install-vigil-edge.bat` |',
      '| macOS/Linux | `bash install.sh` |',
      '',
      '## 🔧 Build Locally (native workflow)',
      '',
      '```bash',
      'git clone https://github.com/FreddyCreates/potential-succotash',
      'cd potential-succotash',
      '# Full build:',
      'node scripts/workflow-runner.js workflows/build.json',
      '# Deploy to ICP:',
      'node scripts/workflow-runner.js workflows/deploy-icp.json',
      '```',
      '',
      '---',
      '*Native workflow. Same dispatch protocol as VigilEngine.*',
    ];

    fs.writeFileSync(path.join(REPO, outputFile), lines.join('\n'));
    return new StepResult('generate:download-manifest', true, `${outputFile} updated (${zips.length} zips listed)`);
  }

  async executeCheckDfx({ minVersion = '0.22.0' }) {
    try {
      const out = cp.execSync('dfx --version', { encoding: 'utf8' }).trim();
      return new StepResult('check:dfx', true, `dfx found: ${out}`, { version: out });
    } catch {
      return new StepResult('check:dfx', false,
        'dfx not found. Install: sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"');
    }
  }

  async executeIcpStartLocal({ port = 4943, network = 'local' }) {
    if (network !== 'local') {
      return new StepResult('icp:start-local', true, 'Network is ic — skipping local start');
    }
    try {
      cp.exec(`dfx start --background --port ${port} 2>/dev/null`);
      await new Promise(r => setTimeout(r, 3000));
      return new StepResult('icp:start-local', true, `Local ICP replica started on port ${port}`);
    } catch (e) {
      return new StepResult('icp:start-local', false, `Failed to start local ICP: ${e.message}`);
    }
  }

  async executeIcpDeploy({ canister, network = 'ic', dfxJson = 'dfx.json' }) {
    const dfxPath = path.join(REPO, dfxJson);
    if (!fs.existsSync(dfxPath)) {
      return new StepResult('icp:deploy-canister', false, `dfx.json not found at ${dfxJson}`);
    }
    return this._shell(
      'dfx', ['deploy', '--network', network, canister || '--all'],
      `Canister deployed to ${network}`, `ICP deploy failed`,
      REPO
    );
  }

  async executeIcpGetUrl({ canister, network = 'ic' }) {
    try {
      const out = cp.execSync(`dfx canister --network ${network} id ${canister}`, {
        encoding: 'utf8', cwd: REPO,
      }).trim();
      const url = network === 'ic'
        ? `https://${out}.icp0.io`
        : `http://127.0.0.1:4943/?canisterId=${out}`;
      info(`ICP URL: ${url}`);
      return new StepResult('icp:get-url', true, `Canister live at: ${url}`, { url, canisterId: out });
    } catch (e) {
      return new StepResult('icp:get-url', false, `Could not get canister URL: ${e.message}`);
    }
  }

  // ── Utility ──────────────────────────────────────────────────────────────────

  _shell(cmd, args, successMsg, failMsg, cwd = REPO) {
    return new Promise(resolve => {
      const proc = cp.spawn(cmd, args, { cwd, stdio: 'inherit', shell: false });
      proc.on('close', code => {
        if (code === 0) resolve(new StepResult(cmd, true, successMsg));
        else            resolve(new StepResult(cmd, false, `${failMsg} (exit ${code})`));
      });
      proc.on('error', e => resolve(new StepResult(cmd, false, `${failMsg}: ${e.message}`)));
    });
  }

  _glob(pattern) {
    const dir  = path.dirname(pattern);
    const base = path.basename(pattern);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => base.includes('*') ? f.endsWith(base.replace('*', '')) : f === base)
      .map(f => path.join(dir, f));
  }

  _fileSize(filePath) {
    try {
      const bytes = fs.statSync(filePath).size;
      if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}M`;
      if (bytes > 1024)        return `${(bytes / 1024).toFixed(1)}K`;
      return `${bytes}B`;
    } catch { return '?'; }
  }

  _gitBranch() {
    try { return cp.execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: REPO }).trim(); }
    catch { return 'main'; }
  }

  // Summary — mirrors VigilEngine.getStatus()
  summary() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log('');
    console.log(`${C.bold}${C.cyan}═══ Workflow Complete ═══${C.reset}`);
    console.log(`  Steps fired:   ${this.stepsFired}`);
    console.log(`  Passed:        ${C.green}${this.stepsPassed}${C.reset}`);
    console.log(`  Failed:        ${this.stepsFailed > 0 ? C.red : C.green}${this.stepsFailed}${C.reset}`);
    console.log(`  Awareness:     ${this.awareness}%  ${C.dim}(MiniBrain metric)${C.reset}`);
    console.log(`  Elapsed:       ${elapsed}s`);
    console.log('');
    return this.stepsFailed === 0;
  }
}

// ── CLI entrypoint ─────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list') || args.includes('-l')) {
    const wfDir = path.join(REPO, 'workflows');
    if (!fs.existsSync(wfDir)) { console.log('No workflows/ directory found.'); process.exit(0); }
    console.log(`\n${C.bold}Available Workflows:${C.reset}`);
    for (const f of fs.readdirSync(wfDir).filter(f => f.endsWith('.json'))) {
      const wf = JSON.parse(fs.readFileSync(path.join(wfDir, f), 'utf8'));
      console.log(`  ${C.cyan}${f}${C.reset}  —  ${wf.description || wf.name}`);
    }
    console.log('');
    process.exit(0);
  }

  const wfFile = args[0];
  if (!wfFile) {
    console.error('Usage: node scripts/workflow-runner.js <workflow.json>');
    console.error('       node scripts/workflow-runner.js --list');
    process.exit(1);
  }

  const wfPath = path.isAbsolute(wfFile) ? wfFile : path.resolve(process.cwd(), wfFile);
  if (!fs.existsSync(wfPath)) {
    console.error(`Workflow not found: ${wfPath}`);
    process.exit(1);
  }

  const workflow = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
  const engine   = new WorkflowEngine();

  banner(`${workflow.name}  v${workflow.version || '?'}`);
  console.log(`  ${C.dim}${workflow.description}${C.reset}`);
  console.log(`  Steps: ${workflow.steps.length} | Time: ${new Date().toISOString()}`);

  for (const step of workflow.steps) {
    const result = await engine.dispatch(step);
    if (!result.success && step.failFast) {
      fail(`Step "${step.action}" failed with failFast=true — aborting workflow`);
      engine.summary();
      process.exit(1);
    }
  }

  const passed = engine.summary();
  process.exit(passed ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });
