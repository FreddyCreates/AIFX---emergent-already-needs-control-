const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const EXT_ROOT = path.resolve(__dirname, '..', '..', 'extensions');

const extensionDirs = fs.readdirSync(EXT_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows')
  .map(d => d.name);

describe('Extension manifest validation', () => {
  it('should find at least 26 extensions', () => {
    assert.ok(extensionDirs.length >= 26, `Expected >=26 extensions, found ${extensionDirs.length}`);
  });

  for (const dir of extensionDirs) {
    describe(dir, () => {
      const extPath = path.join(EXT_ROOT, dir);
      const manifestPath = path.join(extPath, 'manifest.json');

      it('should have a manifest.json', () => {
        assert.ok(fs.existsSync(manifestPath), `Missing manifest.json in ${dir}`);
      });

      it('should have valid JSON in manifest.json', () => {
        const raw = fs.readFileSync(manifestPath, 'utf8');
        assert.doesNotThrow(() => JSON.parse(raw), `Invalid JSON in ${dir}/manifest.json`);
      });

      it('should use manifest_version 3', () => {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        assert.equal(manifest.manifest_version, 3);
      });

      it('should have a name', () => {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        assert.ok(manifest.name && manifest.name.length > 0, 'Missing name');
      });

      it('should have a semver version', () => {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        assert.ok(manifest.version, 'Missing version');
        assert.match(manifest.version, /^\d+\.\d+\.\d+$/, `Invalid version: ${manifest.version}`);
      });

      it('should have a description', () => {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        assert.ok(manifest.description && manifest.description.length >= 10, 'Missing or short description');
      });

      it('should reference existing background.js', () => {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest.background && manifest.background.service_worker) {
          const bgPath = path.join(extPath, manifest.background.service_worker);
          assert.ok(fs.existsSync(bgPath), `Missing: ${manifest.background.service_worker}`);
        }
      });

      it('should reference existing content scripts', () => {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest.content_scripts) {
          for (const cs of manifest.content_scripts) {
            for (const jsFile of (cs.js || [])) {
              const filePath = path.join(extPath, jsFile);
              assert.ok(fs.existsSync(filePath), `Missing: ${jsFile}`);
            }
          }
        }
      });

      it('should have icon files', () => {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest.icons) {
          for (const [size, iconPath] of Object.entries(manifest.icons)) {
            const fullPath = path.join(extPath, iconPath);
            assert.ok(fs.existsSync(fullPath), `Missing icon: ${iconPath} (${size}px)`);
          }
        }
      });
    });
  }
});
