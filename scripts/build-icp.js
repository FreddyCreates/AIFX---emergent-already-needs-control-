#!/usr/bin/env node
/**
 * build-icp.js — Bundle the ICP frontend into icp-dist/
 *
 * This script copies src/icp/ into icp-dist/ and injects canister
 * environment variables so the frontend can connect to the backend.
 *
 * Usage:
 *   node scripts/build-icp.js              # uses .env for canister IDs
 *   DFX_NETWORK=ic node scripts/build-icp.js  # target mainnet
 *
 * After running, deploy with:
 *   dfx deploy organism_frontend
 */

const fs   = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const SRC_DIR  = path.join(ROOT, 'src', 'icp');
const OUT_DIR  = path.join(ROOT, 'icp-dist');
const ENV_FILE = path.join(ROOT, '.env');

// ── Helpers ─────────────────────────────────────────────────────────────

function log(msg) { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }

function readEnvFile() {
  const env = {};
  if (fs.existsSync(ENV_FILE)) {
    const lines = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────

console.log('\n🏗️  Building ICP frontend → icp-dist/\n');

// 1. Clean & copy
if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
}
copyDirSync(SRC_DIR, OUT_DIR);
log('Copied src/icp/ → icp-dist/');

// 2. Read environment
const env = readEnvFile();
const canisterId = env.CANISTER_ID_ORGANISM_BACKEND
  || process.env.CANISTER_ID_ORGANISM_BACKEND
  || '';
const network = process.env.DFX_NETWORK || env.DFX_NETWORK || 'local';

if (canisterId) {
  log(`Backend canister ID: ${canisterId}`);
} else {
  warn('No CANISTER_ID_ORGANISM_BACKEND found — frontend will run in demo mode');
  warn('Deploy the backend first: dfx deploy organism_backend');
}
log(`Target network: ${network}`);

// 3. Inject canister config into index.html
const indexPath = path.join(OUT_DIR, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

const configScript = `
  <script>
    // Injected by scripts/build-icp.js at build time
    window.__CANISTER_ID_ORGANISM_BACKEND__ = "${canisterId}";
    window.__DFX_NETWORK__ = "${network}";
  </script>`;

html = html.replace(
  '<script type="module" src="./app.js"></script>',
  `${configScript}\n  <script type="module" src="./app.js"></script>`
);

fs.writeFileSync(indexPath, html);
log('Injected canister config into index.html');

// 4. Copy root static assets that the site needs
const staticAssets = ['robots.txt'];
for (const asset of staticAssets) {
  const src = path.join(ROOT, asset);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUT_DIR, asset));
    log(`Copied ${asset}`);
  }
}

// 5. Summary
console.log(`
✅ ICP frontend built → icp-dist/

Next steps:
  1. dfx start --background          # start local replica
  2. dfx deploy organism_backend     # deploy Motoko canister
  3. node scripts/build-icp.js       # rebuild with canister ID
  4. dfx deploy organism_frontend    # deploy frontend assets
  5. Open the URL printed by dfx deploy

For mainnet:
  DFX_NETWORK=ic dfx deploy --network ic
`);
