const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('Sacred Geometry Timers', () => {
  let sacredGeometry;

  beforeEach(async () => {
    sacredGeometry = await import('../../sdk/medina-timers/src/sacred-geometry.js');
  });

  describe('createFibonacciTimer()', () => {
    it('should create timer with stop function', () => {
      const timer = sacredGeometry.createFibonacciTimer(() => {}, { baseMs: 100000 });
      assert.ok(typeof timer.stop === 'function');
      timer.stop();
    });

    it('should create timer with getId function', () => {
      const timer = sacredGeometry.createFibonacciTimer(() => {}, { baseMs: 100000 });
      assert.ok(typeof timer.getId === 'function');
      timer.stop();
    });

    it('should accept baseMs option', () => {
      const timer = sacredGeometry.createFibonacciTimer(() => {}, { baseMs: 500 });
      assert.ok(timer);
      timer.stop();
    });

    it('should accept maxFib option', () => {
      const timer = sacredGeometry.createFibonacciTimer(() => {}, { baseMs: 100000, maxFib: 10 });
      assert.ok(timer);
      timer.stop();
    });
  });

  describe('createFibonacciSpiralTimer()', () => {
    it('should return interval id', () => {
      const timer = sacredGeometry.createFibonacciSpiralTimer(() => {}, { baseMs: 100000 });
      assert.ok(timer);
      clearInterval(timer);
    });

    it('should accept baseMs option', () => {
      const timer = sacredGeometry.createFibonacciSpiralTimer(() => {}, { baseMs: 500 });
      assert.ok(timer);
      clearInterval(timer);
    });
  });

  describe('createPhiOscillator()', () => {
    it('should return interval id', () => {
      const timer = sacredGeometry.createPhiOscillator(() => {}, { baseMs: 100000 });
      assert.ok(timer);
      clearInterval(timer);
    });

    it('should accept baseMs option', () => {
      const timer = sacredGeometry.createPhiOscillator(() => {}, { baseMs: 500 });
      assert.ok(timer);
      clearInterval(timer);
    });
  });

  describe('createDualPhiOscillator()', () => {
    it('should return interval id', () => {
      const timer = sacredGeometry.createDualPhiOscillator(() => {}, { baseMs: 100000 });
      assert.ok(timer);
      clearInterval(timer);
    });
  });

  describe('createGoldenAngleRotator()', () => {
    it('should return interval id', () => {
      const timer = sacredGeometry.createGoldenAngleRotator(() => {}, { baseMs: 100000 });
      assert.ok(timer);
      clearInterval(timer);
    });
  });

  describe('createPhyllotaxisTimer()', () => {
    it('should return interval id', () => {
      const timer = sacredGeometry.createPhyllotaxisTimer(() => {}, { baseMs: 100000 });
      assert.ok(timer);
      clearInterval(timer);
    });
  });

  describe('createMetatronRouter()', () => {
    it('should return interval id', () => {
      const timer = sacredGeometry.createMetatronRouter(() => {}, { baseMs: 100000 });
      assert.ok(timer);
      clearInterval(timer);
    });
  });

  describe('createMultiHeartGenerator()', () => {
    it('should return interval id', () => {
      const timer = sacredGeometry.createMultiHeartGenerator(3, () => {}, { baseMs: 100000 });
      assert.ok(timer);
      assert.ok(typeof timer.stop === 'function');
      timer.stop();
    });
  });

  describe('createSacredGeometrySuite()', () => {
    it('should create suite with all timers', () => {
      const suite = sacredGeometry.createSacredGeometrySuite(() => {}, { baseMs: 100000 });
      assert.ok(suite);
      assert.ok('fibonacci' in suite);
      
      // Stop all timers
      if (suite.fibonacci) suite.fibonacci.stop?.() || clearInterval(suite.fibonacci);
      if (suite.spiral) clearInterval(suite.spiral);
      if (suite.oscillator) clearInterval(suite.oscillator);
      if (suite.rotator) clearInterval(suite.rotator);
      if (suite.phyllotaxis) clearInterval(suite.phyllotaxis);
      if (suite.metatron) clearInterval(suite.metatron);
      if (suite.multiHeart) suite.multiHeart.stop?.();
      if (suite.dualOscillator) clearInterval(suite.dualOscillator);
    });
  });
});
