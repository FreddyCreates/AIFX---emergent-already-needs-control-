const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const RegisterAIEngine = require('../../organism-cli/ai-engine');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

describe('RegisterAIEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new RegisterAIEngine(REPO_ROOT);
  });

  describe('scan()', () => {
    it('should discover extensions', () => {
      const result = engine.scan();
      assert.ok(Array.isArray(result));
      assert.ok(result.length >= 26, `Expected >=26 extensions, found ${result.length}`);
    });

    it('should populate extension metadata', () => {
      engine.scan();
      for (const ext of engine.extensions) {
        assert.ok(ext.slug, 'Missing slug');
        assert.ok(ext.path, 'Missing path');
        assert.ok(ext.name, 'Missing name');
      }
    });
  });

  describe('validate()', () => {
    it('should validate all scanned extensions', () => {
      engine.scan();
      const result = engine.validate();
      assert.ok(typeof result.valid === 'number');
      assert.ok(typeof result.invalid === 'number');
      assert.ok(result.valid > 0, 'No valid extensions found');
    });

    it('should mark extensions with manifest_version 3 as valid', () => {
      engine.scan();
      engine.validate();
      const validExts = engine.extensions.filter(e => e.valid);
      for (const ext of validExts) {
        assert.equal(ext.manifest.manifest_version, 3);
      }
    });
  });

  describe('detectBrowser()', () => {
    it('should not throw', () => {
      assert.doesNotThrow(() => engine.detectBrowser());
    });

    it('should return browser info or null', () => {
      const result = engine.detectBrowser();
      if (result) {
        assert.ok(result.name);
        assert.ok(result.path);
      }
    });
  });

  describe('status()', () => {
    it('should not throw when called after scan', () => {
      engine.scan();
      engine.validate();
      assert.doesNotThrow(() => engine.status());
    });
  });

  describe('list()', () => {
    it('should not throw when called after scan', () => {
      engine.scan();
      engine.validate();
      assert.doesNotThrow(() => engine.list());
    });
  });
});
