const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('AttentionRoutingProtocol', () => {
  let AttentionRoutingProtocol;
  let ATTENTION_DECAY;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/attention-routing-protocol.js');
    AttentionRoutingProtocol = module.AttentionRoutingProtocol;
    ATTENTION_DECAY = module.ATTENTION_DECAY;
    protocol = new AttentionRoutingProtocol();
  });

  describe('constructor', () => {
    it('should initialize empty targets map', () => {
      assert.equal(protocol.targets.size, 0);
    });

    it('should initialize empty attentionWeights map', () => {
      assert.equal(protocol.attentionWeights.size, 0);
    });

    it('should initialize empty attentionHistory', () => {
      assert.deepEqual(protocol.attentionHistory, []);
    });

    it('should initialize empty focusStack', () => {
      assert.deepEqual(protocol.focusStack, []);
    });

    it('should initialize totalQueries to zero', () => {
      assert.equal(protocol.totalQueries, 0);
    });
  });

  describe('registerTarget()', () => {
    it('should add target to targets map', () => {
      protocol.registerTarget('target1');
      assert.ok(protocol.targets.has('target1'));
    });

    it('should return target ID', () => {
      const id = protocol.registerTarget('target1');
      assert.equal(id, 'target1');
    });

    it('should set default name from ID', () => {
      protocol.registerTarget('my-target');
      assert.equal(protocol.targets.get('my-target').name, 'my-target');
    });

    it('should accept custom name', () => {
      protocol.registerTarget('t1', { name: 'Custom Name' });
      assert.equal(protocol.targets.get('t1').name, 'Custom Name');
    });

    it('should set default type to "default"', () => {
      protocol.registerTarget('t1');
      assert.equal(protocol.targets.get('t1').type, 'default');
    });

    it('should accept custom type', () => {
      protocol.registerTarget('t1', { type: 'sensor' });
      assert.equal(protocol.targets.get('t1').type, 'sensor');
    });

    it('should set default priority to 1.0', () => {
      protocol.registerTarget('t1');
      assert.equal(protocol.targets.get('t1').priority, 1.0);
    });

    it('should accept custom priority', () => {
      protocol.registerTarget('t1', { priority: 0.5 });
      assert.equal(protocol.targets.get('t1').priority, 0.5);
    });

    it('should set default capacity to 1.0', () => {
      protocol.registerTarget('t1');
      assert.equal(protocol.targets.get('t1').capacity, 1.0);
    });

    it('should generate key array', () => {
      protocol.registerTarget('t1');
      const target = protocol.targets.get('t1');
      assert.ok(Array.isArray(target.key));
      assert.equal(target.key.length, 8);
    });

    it('should accept custom key', () => {
      const customKey = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
      protocol.registerTarget('t1', { key: customKey });
      assert.deepEqual(protocol.targets.get('t1').key, customKey);
    });

    it('should initialize attention weight', () => {
      protocol.registerTarget('t1');
      assert.ok(protocol.attentionWeights.has('t1'));
      assert.equal(protocol.attentionWeights.get('t1').weight, 0);
    });

    it('should initialize query count to zero', () => {
      protocol.registerTarget('t1');
      assert.equal(protocol.attentionWeights.get('t1').queryCount, 0);
    });
  });

  describe('generateKey()', () => {
    it('should generate array of 8 values', () => {
      const key = protocol.generateKey('test');
      assert.equal(key.length, 8);
    });

    it('should generate values between 0 and 1', () => {
      const key = protocol.generateKey('test');
      for (const v of key) {
        assert.ok(v >= 0 && v <= 1);
      }
    });

    it('should generate consistent keys for same ID', () => {
      const key1 = protocol.generateKey('same-id');
      const key2 = protocol.generateKey('same-id');
      assert.deepEqual(key1, key2);
    });

    it('should generate different keys for different IDs', () => {
      const key1 = protocol.generateKey('id-1');
      const key2 = protocol.generateKey('id-2');
      assert.notDeepEqual(key1, key2);
    });
  });

  describe('query()', () => {
    beforeEach(() => {
      protocol.registerTarget('t1', { priority: 1.0 });
      protocol.registerTarget('t2', { priority: 0.5 });
    });

    it('should increment totalQueries', () => {
      protocol.query([0.5, 0.5, 0.5, 0.5]);
      assert.equal(protocol.totalQueries, 1);
    });

    it('should return weights object', () => {
      const result = protocol.query([0.5, 0.5, 0.5, 0.5]);
      assert.ok('weights' in result);
      assert.ok('t1' in result.weights);
      assert.ok('t2' in result.weights);
    });

    it('should return focused target', () => {
      const result = protocol.query([0.5, 0.5, 0.5, 0.5]);
      assert.ok(result.focused === 't1' || result.focused === 't2');
    });

    it('should return max weight', () => {
      const result = protocol.query([0.5, 0.5, 0.5, 0.5]);
      assert.ok(result.maxWeight > 0);
      assert.ok(result.maxWeight <= 1);
    });

    it('should sum weights to approximately 1 (softmax)', () => {
      const result = protocol.query([0.5, 0.5, 0.5, 0.5]);
      const sum = Object.values(result.weights).reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(sum - 1) < 0.001);
    });

    it('should handle empty targets', () => {
      const emptyProtocol = new AttentionRoutingProtocol();
      const result = emptyProtocol.query([0.5]);
      assert.deepEqual(result.weights, {});
      assert.equal(result.focused, null);
    });

    it('should update attention weights', () => {
      protocol.query([0.5, 0.5, 0.5, 0.5]);
      assert.ok(protocol.attentionWeights.get('t1').weight > 0);
    });

    it('should increment target query count', () => {
      protocol.query([0.5, 0.5, 0.5, 0.5]);
      assert.equal(protocol.attentionWeights.get('t1').queryCount, 1);
      assert.equal(protocol.attentionWeights.get('t2').queryCount, 1);
    });

    it('should record in attention history', () => {
      protocol.query([0.5, 0.5, 0.5, 0.5]);
      assert.equal(protocol.attentionHistory.length, 1);
    });

    it('should limit attention history to 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        protocol.query([0.5, 0.5, 0.5, 0.5]);
      }
      assert.equal(protocol.attentionHistory.length, 100);
    });

    it('should apply temperature to softmax', () => {
      // Higher temperature = more uniform distribution
      const lowTemp = protocol.query([1, 0, 0, 0], 0.1);
      const highTemp = protocol.query([1, 0, 0, 0], 10.0);
      
      // Low temperature should have more extreme weights
      const lowRange = Math.max(...Object.values(lowTemp.weights)) - 
                       Math.min(...Object.values(lowTemp.weights));
      const highRange = Math.max(...Object.values(highTemp.weights)) - 
                        Math.min(...Object.values(highTemp.weights));
      
      assert.ok(lowRange >= highRange);
    });
  });

  describe('focus()', () => {
    it('should return false for unregistered target', () => {
      const result = protocol.focus('unknown');
      assert.equal(result, false);
    });

    it('should return true for registered target', () => {
      protocol.registerTarget('t1');
      const result = protocol.focus('t1');
      assert.equal(result, true);
    });

    it('should add target to focus stack', () => {
      protocol.registerTarget('t1');
      protocol.focus('t1');
      assert.ok(protocol.focusStack.includes('t1'));
    });

    it('should not duplicate target in focus stack', () => {
      protocol.registerTarget('t1');
      protocol.focus('t1');
      protocol.focus('t1');
      const count = protocol.focusStack.filter(id => id === 't1').length;
      assert.equal(count, 1);
    });

    it('should set attention weight to 1.0', () => {
      protocol.registerTarget('t1');
      protocol.focus('t1');
      assert.equal(protocol.attentionWeights.get('t1').weight, 1.0);
    });

    it('should limit focus stack to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        protocol.registerTarget(`t${i}`);
        protocol.focus(`t${i}`);
      }
      assert.equal(protocol.focusStack.length, 10);
    });
  });

  describe('unfocus()', () => {
    it('should return undefined for empty stack', () => {
      const result = protocol.unfocus();
      assert.equal(result, undefined);
    });

    it('should return and remove top of focus stack', () => {
      protocol.registerTarget('t1');
      protocol.registerTarget('t2');
      protocol.focus('t1');
      protocol.focus('t2');
      
      const result = protocol.unfocus();
      assert.equal(result, 't2');
      assert.equal(protocol.focusStack.length, 1);
    });
  });

  describe('decay()', () => {
    it('should reduce attention weights', () => {
      protocol.registerTarget('t1');
      protocol.attentionWeights.get('t1').weight = 1.0;
      
      protocol.decay();
      
      assert.ok(protocol.attentionWeights.get('t1').weight < 1.0);
    });

    it('should apply ATTENTION_DECAY factor', () => {
      protocol.registerTarget('t1');
      protocol.attentionWeights.get('t1').weight = 1.0;
      
      protocol.decay();
      
      assert.equal(protocol.attentionWeights.get('t1').weight, ATTENTION_DECAY);
    });

    it('should decay all targets', () => {
      protocol.registerTarget('t1');
      protocol.registerTarget('t2');
      protocol.attentionWeights.get('t1').weight = 1.0;
      protocol.attentionWeights.get('t2').weight = 0.5;
      
      protocol.decay();
      
      assert.equal(protocol.attentionWeights.get('t1').weight, ATTENTION_DECAY);
      assert.ok(Math.abs(protocol.attentionWeights.get('t2').weight - 0.5 * ATTENTION_DECAY) < 0.001);
    });
  });

  describe('getAttentionMap()', () => {
    it('should return empty object with no targets', () => {
      const map = protocol.getAttentionMap();
      assert.deepEqual(map, {});
    });

    it('should include all targets', () => {
      protocol.registerTarget('t1');
      protocol.registerTarget('t2');
      const map = protocol.getAttentionMap();
      assert.ok('t1' in map);
      assert.ok('t2' in map);
    });

    it('should include weight, queryCount, lastUpdated', () => {
      protocol.registerTarget('t1');
      const map = protocol.getAttentionMap();
      assert.ok('weight' in map.t1);
      assert.ok('queryCount' in map.t1);
      assert.ok('lastUpdated' in map.t1);
    });
  });

  describe('getCurrentFocus()', () => {
    it('should return null for empty focus stack', () => {
      assert.equal(protocol.getCurrentFocus(), null);
    });

    it('should return top of focus stack', () => {
      protocol.registerTarget('t1');
      protocol.registerTarget('t2');
      protocol.focus('t1');
      protocol.focus('t2');
      assert.equal(protocol.getCurrentFocus(), 't2');
    });
  });

  describe('getMetrics()', () => {
    it('should include targetCount', () => {
      protocol.registerTarget('t1');
      protocol.registerTarget('t2');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.targetCount, 2);
    });

    it('should include totalQueries', () => {
      protocol.registerTarget('t1');
      protocol.query([0.5]);
      protocol.query([0.5]);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalQueries, 2);
    });

    it('should include currentFocus', () => {
      protocol.registerTarget('t1');
      protocol.focus('t1');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.currentFocus, 't1');
    });

    it('should include focusStackDepth', () => {
      protocol.registerTarget('t1');
      protocol.registerTarget('t2');
      protocol.focus('t1');
      protocol.focus('t2');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.focusStackDepth, 2);
    });

    it('should include attentionMap', () => {
      protocol.registerTarget('t1');
      const metrics = protocol.getMetrics();
      assert.ok('attentionMap' in metrics);
    });

    it('should include recentHistory', () => {
      const metrics = protocol.getMetrics();
      assert.ok(Array.isArray(metrics.recentHistory));
    });

    it('should include decayRate', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.decayRate, ATTENTION_DECAY);
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

  describe('ATTENTION_DECAY export', () => {
    it('should be 0.95', () => {
      assert.equal(ATTENTION_DECAY, 0.95);
    });
  });
});
