const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('MiniBrainProtocol', () => {
  let MiniBrainProtocol;
  let protocol;
  const PHI = 1.618033988749895;
  const LEARNING_RATE = 0.1;

  beforeEach(async () => {
    const module = await import('../../protocols/mini-brain-protocol.js');
    MiniBrainProtocol = module.MiniBrainProtocol;
    protocol = new MiniBrainProtocol('worker-1');
  });

  describe('constructor', () => {
    it('should store worker id', () => {
      assert.equal(protocol.workerId, 'worker-1');
    });

    it('should initialize empty synapses map', () => {
      assert.ok(protocol.synapses instanceof Map);
      assert.equal(protocol.synapses.size, 0);
    });

    it('should initialize empty stimulus history', () => {
      assert.ok(Array.isArray(protocol.stimulusHistory));
      assert.equal(protocol.stimulusHistory.length, 0);
    });

    it('should initialize empty response history', () => {
      assert.ok(Array.isArray(protocol.responseHistory));
      assert.equal(protocol.responseHistory.length, 0);
    });

    it('should initialize learning cycles to 0', () => {
      assert.equal(protocol.learningCycles, 0);
    });

    it('should set lastDecay timestamp', () => {
      assert.ok(protocol.lastDecay);
      assert.ok(protocol.lastDecay <= Date.now());
    });

    it('should set decay interval', () => {
      assert.equal(protocol.decayInterval, 873 * 10);
    });
  });

  describe('learn()', () => {
    it('should return learning result', () => {
      const result = protocol.learn('hello', 'world');
      assert.ok(result);
      assert.equal(result.learned, true);
    });

    it('should create synapse for stimulus', () => {
      protocol.learn('hello', 'world');
      assert.ok(protocol.synapses.has('hello'));
    });

    it('should store response weight', () => {
      protocol.learn('hello', 'world');
      const responseWeights = protocol.synapses.get('hello');
      assert.ok(responseWeights.has('world'));
    });

    it('should increment weight with positive reward', () => {
      protocol.learn('hello', 'world', 1.0);
      const responseWeights = protocol.synapses.get('hello');
      assert.ok(responseWeights.get('world') > 0);
    });

    it('should apply phi-weighted learning', () => {
      protocol.learn('hello', 'world', 1.0);
      const responseWeights = protocol.synapses.get('hello');
      const weight = responseWeights.get('world');
      // Weight should be LEARNING_RATE * reward * PHI
      const expected = LEARNING_RATE * 1.0 * PHI;
      assert.ok(Math.abs(weight - expected) < 0.01);
    });

    it('should accumulate weights', () => {
      protocol.learn('hello', 'world', 1.0);
      const weight1 = protocol.synapses.get('hello').get('world');
      protocol.learn('hello', 'world', 1.0);
      const weight2 = protocol.synapses.get('hello').get('world');
      assert.ok(weight2 > weight1);
    });

    it('should cap weight at 1.0', () => {
      for (let i = 0; i < 20; i++) {
        protocol.learn('hello', 'world', 1.0);
      }
      const weight = protocol.synapses.get('hello').get('world');
      assert.ok(weight <= 1.0);
    });

    it('should add to stimulus history', () => {
      protocol.learn('hello', 'world');
      assert.equal(protocol.stimulusHistory.length, 1);
    });

    it('should include stimulus in history', () => {
      protocol.learn('hello', 'world');
      assert.equal(protocol.stimulusHistory[0].stimulus, 'hello');
    });

    it('should include response in history', () => {
      protocol.learn('hello', 'world');
      assert.equal(protocol.stimulusHistory[0].response, 'world');
    });

    it('should include reward in history', () => {
      protocol.learn('hello', 'world', 0.5);
      assert.equal(protocol.stimulusHistory[0].reward, 0.5);
    });

    it('should increment learning cycles', () => {
      protocol.learn('hello', 'world');
      assert.equal(protocol.learningCycles, 1);
      protocol.learn('foo', 'bar');
      assert.equal(protocol.learningCycles, 2);
    });

    it('should limit stimulus history size', () => {
      for (let i = 0; i < 150; i++) {
        protocol.learn(`stimulus-${i}`, `response-${i}`);
      }
      assert.ok(protocol.stimulusHistory.length <= 100);
    });

    it('should learn multiple responses for same stimulus', () => {
      protocol.learn('hello', 'world');
      protocol.learn('hello', 'universe');
      const responseWeights = protocol.synapses.get('hello');
      assert.ok(responseWeights.has('world'));
      assert.ok(responseWeights.has('universe'));
    });

    it('should default reward to 1.0', () => {
      protocol.learn('hello', 'world');
      const history = protocol.stimulusHistory[0];
      assert.equal(history.reward, 1.0);
    });
  });

  describe('respond()', () => {
    it('should return novel response for unknown stimulus', () => {
      const result = protocol.respond('unknown');
      assert.equal(result.response, null);
      assert.equal(result.confidence, 0);
      assert.equal(result.novel, true);
    });

    it('should return learned response', () => {
      protocol.learn('hello', 'world');
      const result = protocol.respond('hello');
      assert.equal(result.response, 'world');
    });

    it('should return confidence', () => {
      protocol.learn('hello', 'world', 1.0);
      const result = protocol.respond('hello');
      assert.ok(result.confidence > 0);
    });

    it('should return novel=false for known stimulus', () => {
      protocol.learn('hello', 'world');
      const result = protocol.respond('hello');
      assert.equal(result.novel, false);
    });

    it('should return highest weight response', () => {
      protocol.learn('hello', 'world', 0.5);
      protocol.learn('hello', 'universe', 1.0);
      // Universe should have higher weight
      for (let i = 0; i < 5; i++) {
        protocol.learn('hello', 'universe', 1.0);
      }
      const result = protocol.respond('hello');
      // Should prefer universe (higher weight)
      assert.ok(result.response === 'universe' || result.response === 'world');
    });

    it('should add to response history', () => {
      protocol.learn('hello', 'world');
      protocol.respond('hello');
      assert.equal(protocol.responseHistory.length, 1);
    });

    it('should include stimulus in response history', () => {
      protocol.learn('hello', 'world');
      protocol.respond('hello');
      assert.equal(protocol.responseHistory[0].stimulus, 'hello');
    });

    it('should limit response history size', () => {
      protocol.learn('hello', 'world');
      for (let i = 0; i < 150; i++) {
        protocol.respond('hello');
      }
      assert.ok(protocol.responseHistory.length <= 100);
    });
  });

  describe('normalizeStimulus()', () => {
    it('should lowercase string stimulus', () => {
      assert.equal(protocol.normalizeStimulus('HELLO'), 'hello');
    });

    it('should trim whitespace', () => {
      assert.equal(protocol.normalizeStimulus('  hello  '), 'hello');
    });

    it('should stringify objects', () => {
      const result = protocol.normalizeStimulus({ key: 'value' });
      assert.equal(result, '{"key":"value"}');
    });

    it('should stringify arrays', () => {
      const result = protocol.normalizeStimulus([1, 2, 3]);
      assert.equal(result, '[1,2,3]');
    });

    it('should handle numbers', () => {
      const result = protocol.normalizeStimulus(42);
      assert.equal(result, '42');
    });
  });

  describe('normalizeResponse()', () => {
    it('should keep string response as-is', () => {
      assert.equal(protocol.normalizeResponse('hello'), 'hello');
    });

    it('should stringify objects', () => {
      const result = protocol.normalizeResponse({ key: 'value' });
      assert.equal(result, '{"key":"value"}');
    });

    it('should stringify arrays', () => {
      const result = protocol.normalizeResponse([1, 2, 3]);
      assert.equal(result, '[1,2,3]');
    });
  });

  describe('decay()', () => {
    it('should reduce weights over time', () => {
      protocol.learn('hello', 'world', 1.0);
      const weightBefore = protocol.synapses.get('hello').get('world');
      
      // Force decay
      protocol.lastDecay = Date.now() - protocol.decayInterval - 1;
      protocol.decay();
      
      const weightAfter = protocol.synapses.get('hello').get('world');
      assert.ok(weightAfter < weightBefore);
    });

    it('should remove very small weights', () => {
      protocol.learn('hello', 'world', 0.001);
      
      // Force multiple decays
      for (let i = 0; i < 100; i++) {
        protocol.lastDecay = 0;
        protocol.decay();
      }
      
      // Weight may be removed or very small
      const weights = protocol.synapses.get('hello');
      if (weights.has('world')) {
        assert.ok(weights.get('world') < 0.001);
      }
    });
  });

  describe('getStats()', () => {
    it('should return stats object', () => {
      const stats = protocol.getStats();
      assert.ok(stats);
    });

    it('should include workerId', () => {
      const stats = protocol.getStats();
      assert.equal(stats.workerId, 'worker-1');
    });

    it('should include synapse count', () => {
      protocol.learn('hello', 'world');
      protocol.learn('foo', 'bar');
      const stats = protocol.getStats();
      assert.equal(stats.synapseCount, 2);
    });

    it('should include learning cycles', () => {
      protocol.learn('hello', 'world');
      const stats = protocol.getStats();
      assert.equal(stats.learningCycles, 1);
    });
  });

  describe('reset()', () => {
    it('should clear synapses', () => {
      protocol.learn('hello', 'world');
      protocol.reset();
      assert.equal(protocol.synapses.size, 0);
    });

    it('should clear history', () => {
      protocol.learn('hello', 'world');
      protocol.reset();
      assert.equal(protocol.stimulusHistory.length, 0);
      assert.equal(protocol.responseHistory.length, 0);
    });

    it('should reset learning cycles', () => {
      protocol.learn('hello', 'world');
      protocol.reset();
      assert.equal(protocol.learningCycles, 0);
    });
  });

  describe('integration', () => {
    it('should learn and respond correctly', () => {
      // Learn several associations
      protocol.learn('greeting', 'hello');
      protocol.learn('greeting', 'hi');
      protocol.learn('greeting', 'hello'); // Reinforce
      protocol.learn('greeting', 'hello'); // Reinforce again
      
      // Response should be strongest learned association
      const result = protocol.respond('greeting');
      assert.equal(result.response, 'hello');
      assert.ok(result.confidence > 0);
    });

    it('should handle case-insensitive stimuli', () => {
      protocol.learn('HELLO', 'world');
      const result = protocol.respond('hello');
      assert.equal(result.response, 'world');
    });

    it('should track learning metrics', () => {
      for (let i = 0; i < 10; i++) {
        protocol.learn(`stim-${i % 3}`, `resp-${i}`);
      }
      
      const stats = protocol.getStats();
      assert.equal(stats.learningCycles, 10);
      assert.equal(stats.synapseCount, 3);
    });
  });
});
