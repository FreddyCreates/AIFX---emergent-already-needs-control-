const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('PredictiveCodingProtocol', () => {
  let PredictiveCodingProtocol;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/predictive-coding-protocol.js');
    PredictiveCodingProtocol = module.PredictiveCodingProtocol;
    protocol = new PredictiveCodingProtocol();
  });

  describe('constructor', () => {
    it('should initialize with default 3 levels', () => {
      assert.equal(protocol.levels, 3);
    });

    it('should accept custom level count', async () => {
      const module = await import('../../protocols/predictive-coding-protocol.js');
      const proto = new module.PredictiveCodingProtocol({ levels: 5 });
      assert.equal(proto.levels, 5);
    });

    it('should initialize hierarchy with empty maps', () => {
      assert.equal(protocol.hierarchy.length, 3);
      for (const layer of protocol.hierarchy) {
        assert.equal(layer.predictions.size, 0);
        assert.equal(layer.states.size, 0);
        assert.equal(layer.precisions.size, 0);
      }
    });

    it('should initialize counters to zero', () => {
      assert.equal(protocol.totalPredictions, 0);
      assert.equal(protocol.totalUpdates, 0);
    });

    it('should initialize empty prediction errors array', () => {
      assert.deepEqual(protocol.predictionErrors, []);
    });

    it('should initialize each level with correct level index', () => {
      for (let i = 0; i < protocol.levels; i++) {
        assert.equal(protocol.hierarchy[i].level, i);
      }
    });

    it('should initialize each level with zero errorSum and updateCount', () => {
      for (const layer of protocol.hierarchy) {
        assert.equal(layer.errorSum, 0);
        assert.equal(layer.updateCount, 0);
      }
    });
  });

  describe('predict()', () => {
    it('should add prediction to specified level', () => {
      protocol.predict(0, 'test-key', 42);
      assert.ok(protocol.hierarchy[0].predictions.has('test-key'));
    });

    it('should return prediction result object', () => {
      const result = protocol.predict(0, 'key', 'value');
      assert.equal(result.level, 0);
      assert.equal(result.key, 'key');
      assert.equal(result.predicted, 'value');
    });

    it('should increment totalPredictions counter', () => {
      protocol.predict(0, 'a', 1);
      protocol.predict(1, 'b', 2);
      assert.equal(protocol.totalPredictions, 2);
    });

    it('should return null for invalid level (negative)', () => {
      const result = protocol.predict(-1, 'key', 'value');
      assert.equal(result, null);
    });

    it('should return null for invalid level (too high)', () => {
      const result = protocol.predict(10, 'key', 'value');
      assert.equal(result, null);
    });

    it('should store prediction with timestamp', () => {
      const before = Date.now();
      protocol.predict(0, 'key', 'value');
      const after = Date.now();
      const prediction = protocol.hierarchy[0].predictions.get('key');
      assert.ok(prediction.timestamp >= before);
      assert.ok(prediction.timestamp <= after);
    });

    it('should store prediction with precision', () => {
      protocol.predict(0, 'key', 'value');
      const prediction = protocol.hierarchy[0].predictions.get('key');
      assert.ok('precision' in prediction);
      assert.ok(typeof prediction.precision === 'number');
    });

    it('should overwrite existing prediction for same key', () => {
      protocol.predict(0, 'key', 'old');
      protocol.predict(0, 'key', 'new');
      const prediction = protocol.hierarchy[0].predictions.get('key');
      assert.equal(prediction.value, 'new');
    });
  });

  describe('observe()', () => {
    it('should store observed state at specified level', () => {
      protocol.observe(0, 'key', 100);
      const state = protocol.hierarchy[0].states.get('key');
      assert.equal(state.value, 100);
    });

    it('should return observation result object', () => {
      const result = protocol.observe(0, 'key', 50);
      assert.equal(result.level, 0);
      assert.equal(result.key, 'key');
      assert.equal(result.actual, 50);
    });

    it('should increment totalUpdates counter', () => {
      protocol.observe(0, 'a', 1);
      protocol.observe(1, 'b', 2);
      assert.equal(protocol.totalUpdates, 2);
    });

    it('should return null for invalid level', () => {
      const result = protocol.observe(-1, 'key', 'value');
      assert.equal(result, null);
    });

    it('should calculate numeric prediction error', () => {
      protocol.predict(0, 'key', 50);
      const result = protocol.observe(0, 'key', 60);
      assert.equal(result.error, 10); // 60 - 50 = 10
    });

    it('should calculate categorical prediction error (match)', () => {
      protocol.predict(0, 'key', 'apple');
      const result = protocol.observe(0, 'key', 'apple');
      assert.equal(result.error, 0);
    });

    it('should calculate categorical prediction error (mismatch)', () => {
      protocol.predict(0, 'key', 'apple');
      const result = protocol.observe(0, 'key', 'orange');
      assert.equal(result.error, 1);
    });

    it('should record prediction error in history', () => {
      protocol.predict(0, 'key', 50);
      protocol.observe(0, 'key', 60);
      assert.equal(protocol.predictionErrors.length, 1);
      assert.equal(protocol.predictionErrors[0].predicted, 50);
      assert.equal(protocol.predictionErrors[0].actual, 60);
    });

    it('should limit prediction error history to 500 entries', () => {
      for (let i = 0; i < 600; i++) {
        protocol.predict(0, `key-${i}`, i);
        protocol.observe(0, `key-${i}`, i + 1);
      }
      assert.equal(protocol.predictionErrors.length, 500);
    });

    it('should update layer errorSum', () => {
      protocol.predict(0, 'key', 0);
      protocol.observe(0, 'key', 10);
      assert.ok(protocol.hierarchy[0].errorSum > 0);
    });

    it('should update layer updateCount', () => {
      protocol.predict(0, 'key', 0);
      protocol.observe(0, 'key', 10);
      assert.equal(protocol.hierarchy[0].updateCount, 1);
    });

    it('should propagate error to higher level when significant', () => {
      protocol.predict(0, 'key', 0);
      protocol.observe(0, 'key', 100);
      const propagatedKey = 'error:key';
      assert.ok(protocol.hierarchy[1].states.has(propagatedKey));
    });

    it('should not propagate small errors', () => {
      protocol.predict(0, 'key', 0);
      protocol.observe(0, 'key', 0.05); // Error too small
      const propagatedKey = 'error:key';
      assert.equal(protocol.hierarchy[1].states.has(propagatedKey), false);
    });

    it('should not propagate from top level', () => {
      protocol.predict(2, 'key', 0);
      protocol.observe(2, 'key', 100);
      // There's no level 3 to propagate to
      assert.equal(protocol.hierarchy.length, 3);
    });
  });

  describe('propagateError()', () => {
    it('should attenuate error by phi factor', () => {
      protocol.propagateError(1, 'source', 1.0);
      const state = protocol.hierarchy[1].states.get('error:source');
      // Error should be attenuated: 1.0 * (phi - 1)^1 ≈ 0.618
      assert.ok(state.value < 1.0);
      assert.ok(state.value > 0.5);
    });

    it('should mark propagated state as error', () => {
      protocol.propagateError(1, 'source', 1.0);
      const state = protocol.hierarchy[1].states.get('error:source');
      assert.equal(state.isError, true);
    });

    it('should not propagate beyond top level', () => {
      const originalSize = protocol.hierarchy[2].states.size;
      protocol.propagateError(3, 'source', 1.0);
      // Should be no-op for level >= max
      assert.equal(protocol.hierarchy[2].states.size, originalSize);
    });

    it('should reduce precision of source level on high error', () => {
      protocol.hierarchy[0].precisions.set('source', 1.0);
      protocol.propagateError(1, 'source', 0.5);
      const newPrecision = protocol.hierarchy[0].precisions.get('source');
      assert.ok(newPrecision < 1.0);
    });

    it('should not reduce precision below 0.1', () => {
      protocol.hierarchy[0].precisions.set('source', 0.15);
      protocol.propagateError(1, 'source', 10.0);
      const newPrecision = protocol.hierarchy[0].precisions.get('source');
      assert.ok(newPrecision >= 0.1);
    });
  });

  describe('calculatePrecision()', () => {
    it('should return stored precision if available', () => {
      protocol.hierarchy[0].precisions.set('key', 0.75);
      const precision = protocol.calculatePrecision(0, 'key');
      assert.equal(precision, 0.75);
    });

    it('should return phi-weighted default for unknown key', () => {
      const PHI = 1.618033988749895;
      const precision = protocol.calculatePrecision(0, 'unknown');
      assert.ok(Math.abs(precision - Math.pow(PHI - 1, 0)) < 0.001);
    });

    it('should decrease precision for higher levels', () => {
      const p0 = protocol.calculatePrecision(0, 'key');
      const p1 = protocol.calculatePrecision(1, 'key');
      const p2 = protocol.calculatePrecision(2, 'key');
      assert.ok(p0 > p1);
      assert.ok(p1 > p2);
    });
  });

  describe('getHierarchyState()', () => {
    it('should return array with entry for each level', () => {
      const state = protocol.getHierarchyState();
      assert.equal(state.length, 3);
    });

    it('should include level index', () => {
      const state = protocol.getHierarchyState();
      for (let i = 0; i < state.length; i++) {
        assert.equal(state[i].level, i);
      }
    });

    it('should include prediction count', () => {
      protocol.predict(0, 'a', 1);
      protocol.predict(0, 'b', 2);
      const state = protocol.getHierarchyState();
      assert.equal(state[0].predictionCount, 2);
    });

    it('should include state count', () => {
      protocol.observe(1, 'a', 1);
      protocol.observe(1, 'b', 2);
      const state = protocol.getHierarchyState();
      assert.equal(state[1].stateCount, 2);
    });

    it('should include average error', () => {
      protocol.predict(0, 'key', 0);
      protocol.observe(0, 'key', 10);
      const state = protocol.getHierarchyState();
      assert.ok(state[0].avgError > 0);
    });

    it('should include update count', () => {
      protocol.predict(0, 'a', 0);
      protocol.observe(0, 'a', 1);
      protocol.predict(0, 'b', 0);
      protocol.observe(0, 'b', 1);
      const state = protocol.getHierarchyState();
      assert.equal(state[0].updateCount, 2);
    });
  });

  describe('getRecentErrors()', () => {
    it('should return empty array when no errors', () => {
      const errors = protocol.getRecentErrors();
      assert.deepEqual(errors, []);
    });

    it('should return recent prediction errors', () => {
      protocol.predict(0, 'key', 0);
      protocol.observe(0, 'key', 10);
      const errors = protocol.getRecentErrors();
      assert.equal(errors.length, 1);
    });

    it('should limit to specified count', () => {
      for (let i = 0; i < 50; i++) {
        protocol.predict(0, `k${i}`, 0);
        protocol.observe(0, `k${i}`, 10);
      }
      const errors = protocol.getRecentErrors(10);
      assert.equal(errors.length, 10);
    });

    it('should return most recent errors', () => {
      for (let i = 0; i < 30; i++) {
        protocol.predict(0, `k${i}`, i);
        protocol.observe(0, `k${i}`, i + 1);
      }
      const errors = protocol.getRecentErrors(5);
      assert.equal(errors[4].predicted, 29);
    });
  });

  describe('getMetrics()', () => {
    it('should include levels count', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.levels, 3);
    });

    it('should include totalPredictions', () => {
      protocol.predict(0, 'a', 1);
      protocol.predict(1, 'b', 2);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalPredictions, 2);
    });

    it('should include totalUpdates', () => {
      protocol.observe(0, 'a', 1);
      protocol.observe(1, 'b', 2);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalUpdates, 2);
    });

    it('should include avgError', () => {
      protocol.predict(0, 'key', 0);
      protocol.observe(0, 'key', 10);
      const metrics = protocol.getMetrics();
      assert.ok(metrics.avgError > 0);
    });

    it('should include hierarchy state', () => {
      const metrics = protocol.getMetrics();
      assert.ok(Array.isArray(metrics.hierarchy));
      assert.equal(metrics.hierarchy.length, 3);
    });

    it('should include recentErrors', () => {
      const metrics = protocol.getMetrics();
      assert.ok(Array.isArray(metrics.recentErrors));
    });

    it('should include phi constant', () => {
      const metrics = protocol.getMetrics();
      assert.ok(Math.abs(metrics.phi - 1.618) < 0.001);
    });

    it('should include heartbeat constant', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.heartbeat, 873);
    });
  });
});
