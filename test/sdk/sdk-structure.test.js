const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const SDK_ROOT = path.resolve(__dirname, '..', '..', 'sdk');

const EXPECTED_SDKS = [
  'agent-workspace-sdk',
  'ai-model-engines',
  'intelligence-routing-sdk',
  'organism-marketplace',
  'organism-runtime-sdk',
  'sovereign-memory-sdk',
  'document-absorption-engine',
  'enterprise-integration-sdk',
  'frontend-intelligence-models',
  'windows-runtime-sdk',
  'windows-desktop-sdk',
  'register-ai',
];

describe('SDK structure validation', () => {
  it('should have all expected SDK directories', () => {
    for (const sdk of EXPECTED_SDKS) {
      const sdkPath = path.join(SDK_ROOT, sdk);
      assert.ok(fs.existsSync(sdkPath), `Missing SDK directory: ${sdk}`);
    }
  });

  for (const sdk of EXPECTED_SDKS) {
    describe(sdk, () => {
      const sdkPath = path.join(SDK_ROOT, sdk);

      it('should have a package.json', () => {
        const pkgPath = path.join(sdkPath, 'package.json');
        assert.ok(fs.existsSync(pkgPath), `Missing package.json in ${sdk}`);
      });

      it('should have valid JSON in package.json', () => {
        const pkgPath = path.join(sdkPath, 'package.json');
        const raw = fs.readFileSync(pkgPath, 'utf8');
        assert.doesNotThrow(() => JSON.parse(raw));
      });

      it('should have a name in package.json', () => {
        const pkgPath = path.join(sdkPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        assert.ok(pkg.name, 'Missing name in package.json');
      });

      it('should have a main entry point', () => {
        const pkgPath = path.join(sdkPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        assert.ok(pkg.main, `Missing "main" in ${sdk}/package.json`);
      });

      it('should have the main entry point file on disk', () => {
        const pkgPath = path.join(sdkPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.main) {
          const mainPath = path.join(sdkPath, pkg.main);
          assert.ok(fs.existsSync(mainPath), `Main entry point missing: ${pkg.main}`);
        }
      });

      it('should have a license', () => {
        const pkgPath = path.join(sdkPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        assert.ok(pkg.license, `Missing license in ${sdk}/package.json`);
      });
    });
  }
});

describe('Extensions index', () => {
  it('should export EXTENSIONS array with 31 entries', async () => {
    const indexPath = path.join(SDK_ROOT, '..', 'extensions', 'index.js');
    assert.ok(fs.existsSync(indexPath));
    const content = fs.readFileSync(indexPath, 'utf8');
    const match = content.match(/id:\s*'EXT-/g);
    assert.ok(match);
    assert.equal(match.length, 31, `Expected 31 extension entries, found ${match.length}`);
  });
});

describe('Protocols index', () => {
  it('should export protocols', () => {
    const indexPath = path.join(SDK_ROOT, '..', 'protocols', 'index.js');
    assert.ok(fs.existsSync(indexPath));
    const content = fs.readFileSync(indexPath, 'utf8');
    const exports = content.match(/export\s*\{/g);
    assert.ok(exports, 'No exports found in protocols/index.js');
  });

  it('should reference all protocol files (currently 43)', () => {
    const indexPath = path.join(SDK_ROOT, '..', 'protocols', 'index.js');
    const content = fs.readFileSync(indexPath, 'utf8');
    const fromMatches = content.match(/from\s+'\.\/[^']+'/g);
    assert.ok(fromMatches);
    // Protocol numbering is non-contiguous (selected protocols from various ranges):
    // - PROTO-001 to PROTO-011: Original core protocols
    // - PROTO-181 to PROTO-185: AURO Charter protocols
    // - PROTO-201 to PROTO-227: Alpha Intelligence protocols
    // Total: 43 unique protocols across these ranges
    assert.ok(fromMatches.length >= 43, `Expected >=43 protocol imports, found ${fromMatches.length}`);
  });
});
