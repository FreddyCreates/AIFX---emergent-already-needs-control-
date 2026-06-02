const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const RegisterAIEngine = require('../../organism-cli/ai-engine');

function makeTempRepoRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'aifx-cli-engine-'));
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

describe('RegisterAIEngine (edge cases)', () => {
  let repoRoot;
  let engine;

  beforeEach(() => {
    repoRoot = makeTempRepoRoot();
    engine = new RegisterAIEngine(repoRoot);
  });

  describe('scan()', () => {
    it('should return [] when extensions directory is missing', () => {
      const result = engine.scan();
      assert.deepEqual(result, []);
      assert.deepEqual(engine.extensions, []);
    });

    it('should mark extension invalid when manifest.json is invalid JSON', () => {
      writeFile(path.join(repoRoot, 'extensions', 'bad-ext', 'manifest.json'), '{');
      engine.scan();

      assert.equal(engine.extensions.length, 1);
      const ext = engine.extensions[0];
      assert.equal(ext.slug, 'bad-ext');
      assert.equal(ext.valid, false);
      assert.ok(Array.isArray(ext.errors));
      assert.ok(ext.errors[0].startsWith('Invalid manifest.json:'));
    });
  });

  describe('validate()', () => {
    it('should handle a missing manifest (manifest=null)', () => {
      engine.extensions = [
        {
          slug: 'no-manifest',
          path: path.join(repoRoot, 'extensions', 'no-manifest'),
          manifest: null,
          name: 'no-manifest',
          version: '?',
          valid: true,
          errors: [],
        },
      ];

      const result = engine.validate();
      assert.deepEqual(result, { valid: 0, invalid: 1 });
      assert.equal(engine.extensions[0].valid, false);
      assert.ok(engine.extensions[0].errors.includes('No manifest.json or invalid JSON'));
    });

    it('should require background.service_worker or content_scripts', () => {
      engine.extensions = [
        {
          slug: 'minimal',
          path: path.join(repoRoot, 'extensions', 'minimal'),
          manifest: { manifest_version: 3, name: 'Minimal', version: '1.0.0' },
          name: 'Minimal',
          version: '1.0.0',
          valid: true,
          errors: [],
        },
      ];

      const result = engine.validate();
      assert.deepEqual(result, { valid: 0, invalid: 1 });
      assert.ok(engine.extensions[0].errors.includes('No background.service_worker or content_scripts'));
    });

    it('should report missing referenced background/content script files', () => {
      const extPath = path.join(repoRoot, 'extensions', 'missing-files');
      engine.extensions = [
        {
          slug: 'missing-files',
          path: extPath,
          manifest: {
            manifest_version: 3,
            name: 'MissingFiles',
            version: '1.0.0',
            background: { service_worker: 'bg.js' },
            content_scripts: [{ matches: ['<all_urls>'], js: ['content.js'] }],
          },
          name: 'MissingFiles',
          version: '1.0.0',
          valid: true,
          errors: [],
        },
      ];

      const result = engine.validate();
      assert.deepEqual(result, { valid: 0, invalid: 1 });
      assert.ok(engine.extensions[0].errors.includes('Missing: bg.js'));
      assert.ok(engine.extensions[0].errors.includes('Missing: content.js'));
    });
  });

  describe('detectBrowser()', () => {
    it('should return null if no Chromium browser is found', () => {
      const originalExistsSync = fs.existsSync;
      fs.existsSync = () => false;
      try {
        const found = engine.detectBrowser();
        assert.equal(found, null);
      } finally {
        fs.existsSync = originalExistsSync;
      }
    });
  });

  describe('install()', () => {
    it('should return false when no valid extensions exist', () => {
      engine.extensions = [{ valid: false, errors: ['bad'], path: '/dev/null', name: 'bad', version: '0.0.0' }];
      assert.equal(engine.install(), false);
    });

    it('should return false when no browser is detected', () => {
      const extPath = path.join(repoRoot, 'extensions', 'ok-ext');
      writeFile(path.join(extPath, 'manifest.json'), JSON.stringify({
        manifest_version: 3,
        name: 'OK',
        version: '1.0.0',
        background: { service_worker: 'bg.js' },
      }));
      writeFile(path.join(extPath, 'bg.js'), 'console.log("bg");');

      engine.scan();
      engine.validate();
      engine.browser = null;

      assert.equal(engine.install(), false);
    });

    it('should return true when browser path is set and extensions are valid', () => {
      const extPath = path.join(repoRoot, 'extensions', 'ok-ext');
      writeFile(path.join(extPath, 'manifest.json'), JSON.stringify({
        manifest_version: 3,
        name: 'OK',
        version: '1.0.0',
        background: { service_worker: 'bg.js' },
      }));
      writeFile(path.join(extPath, 'bg.js'), 'console.log("bg");');

      engine.scan();
      engine.validate();

      // Use a harmless binary so we don't accidentally launch a real browser.
      engine.browser = '/usr/bin/true';
      engine.browserName = 'true';

      assert.equal(engine.install(), true);
    });
  });

  describe('list()', () => {
    it('should print errors for invalid extensions', () => {
      engine.extensions = [
        { name: 'Bad', version: '0.0.0', valid: false, errors: ['Missing "name"'] },
      ];
      assert.doesNotThrow(() => engine.list());
    });
  });

  describe('runFullPipeline()', () => {
    it('should not throw when no browser is available', () => {
      const extPath = path.join(repoRoot, 'extensions', 'ok-ext');
      writeFile(path.join(extPath, 'manifest.json'), JSON.stringify({
        manifest_version: 3,
        name: 'OK',
        version: '1.0.0',
        background: { service_worker: 'bg.js' },
      }));
      writeFile(path.join(extPath, 'bg.js'), 'console.log("bg");');

      const originalExistsSync = fs.existsSync;
      fs.existsSync = (p) => {
        // Hide system browser binaries so `detectBrowser()` returns null.
        if (typeof p === 'string' && p.startsWith('/usr/bin/')) return false;
        return originalExistsSync(p);
      };

      try {
        assert.doesNotThrow(() => engine.runFullPipeline());
      } finally {
        fs.existsSync = originalExistsSync;
      }
    });
  });
});

