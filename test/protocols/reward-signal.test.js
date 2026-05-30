const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('RewardSignalProtocol', () => {
  let RewardSignalProtocol;
  let GAMMA, LAMBDA, ALPHA;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/reward-signal-protocol.js');
    RewardSignalProtocol = module.RewardSignalProtocol;
    GAMMA = module.GAMMA;
    LAMBDA = module.LAMBDA;
    ALPHA = module.ALPHA;
    protocol = new RewardSignalProtocol();
  });

  describe('constructor', () => {
    it('should initialize empty values map', () => {
      assert.equal(protocol.values.size, 0);
    });

    it('should initialize empty eligibility map', () => {
      assert.equal(protocol.eligibility.size, 0);
    });

    it('should initialize empty reward history', () => {
      assert.deepEqual(protocol.rewardHistory, []);
    });

    it('should initialize empty TD errors array', () => {
      assert.deepEqual(protocol.tdErrors, []);
    });

    it('should initialize totalRewards to zero', () => {
      assert.equal(protocol.totalRewards, 0);
    });

    it('should initialize episodeCount to zero', () => {
      assert.equal(protocol.episodeCount, 0);
    });
  });

  describe('initializeState()', () => {
    it('should add state to values map', () => {
      protocol.initializeState('s1');
      assert.ok(protocol.values.has('s1'));
    });

    it('should return state ID', () => {
      const id = protocol.initializeState('s1');
      assert.equal(id, 's1');
    });

    it('should set default value to 0', () => {
      protocol.initializeState('s1');
      assert.equal(protocol.values.get('s1'), 0);
    });

    it('should accept custom initial value', () => {
      protocol.initializeState('s1', 0.5);
      assert.equal(protocol.values.get('s1'), 0.5);
    });

    it('should initialize eligibility trace to 0', () => {
      protocol.initializeState('s1');
      assert.equal(protocol.eligibility.get('s1'), 0);
    });
  });

  describe('observe()', () => {
    it('should auto-initialize unknown states', () => {
      protocol.observe('s1', 's2', 1.0);
      assert.ok(protocol.values.has('s1'));
      assert.ok(protocol.values.has('s2'));
    });

    it('should calculate TD error', () => {
      protocol.initializeState('s1', 0);
      protocol.initializeState('s2', 1);
      const result = protocol.observe('s1', 's2', 0);
      // TD error = r + γV(s') - V(s) = 0 + γ*1 - 0 = γ
      assert.ok(Math.abs(result.tdError - GAMMA) < 0.001);
    });

    it('should return result object', () => {
      const result = protocol.observe('s1', 's2', 1.0);
      assert.ok('tdError' in result);
      assert.ok('V_current' in result);
      assert.ok('V_next' in result);
      assert.ok('eligibility' in result);
    });

    it('should update eligibility trace for current state', () => {
      protocol.initializeState('s1');
      protocol.observe('s1', 's2', 1.0);
      assert.ok(protocol.eligibility.get('s1') > 0);
    });

    it('should decay eligibility traces for other states', () => {
      protocol.initializeState('s0', 0);
      protocol.eligibility.set('s0', 1.0);
      protocol.observe('s1', 's2', 1.0);
      const decayed = protocol.eligibility.get('s0');
      assert.ok(decayed < 1.0);
      assert.ok(Math.abs(decayed - GAMMA * LAMBDA) < 0.001);
    });

    it('should update state values', () => {
      protocol.initializeState('s1', 0);
      protocol.initializeState('s2', 0);
      protocol.observe('s1', 's2', 1.0);
      const newValue = protocol.values.get('s1');
      assert.ok(newValue !== 0); // Value should change
    });

    it('should record observation in reward history', () => {
      protocol.observe('s1', 's2', 1.0);
      assert.equal(protocol.rewardHistory.length, 1);
      assert.equal(protocol.rewardHistory[0].current, 's1');
      assert.equal(protocol.rewardHistory[0].next, 's2');
      assert.equal(protocol.rewardHistory[0].reward, 1.0);
    });

    it('should limit reward history to 500 entries', () => {
      for (let i = 0; i < 600; i++) {
        protocol.observe('s1', 's2', 1.0);
      }
      assert.equal(protocol.rewardHistory.length, 500);
    });

    it('should record TD error in tdErrors array', () => {
      protocol.observe('s1', 's2', 1.0);
      assert.equal(protocol.tdErrors.length, 1);
    });

    it('should limit tdErrors to 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        protocol.observe('s1', 's2', 1.0);
      }
      assert.equal(protocol.tdErrors.length, 100);
    });

    it('should accumulate totalRewards', () => {
      protocol.observe('s1', 's2', 1.0);
      protocol.observe('s2', 's3', 2.0);
      assert.equal(protocol.totalRewards, 3.0);
    });
  });

  describe('reward()', () => {
    it('should auto-initialize unknown state', () => {
      protocol.reward('unknown', 1.0);
      assert.ok(protocol.values.has('unknown'));
    });

    it('should increase state value', () => {
      protocol.initializeState('s1', 0);
      protocol.reward('s1', 1.0);
      assert.ok(protocol.values.get('s1') > 0);
    });

    it('should return result object', () => {
      const result = protocol.reward('s1', 1.0);
      assert.equal(result.state, 's1');
      assert.equal(result.rewarded, 1.0);
      assert.ok('newValue' in result);
    });

    it('should apply phi-weighted reward', () => {
      protocol.initializeState('s1', 0);
      protocol.reward('s1', 1.0);
      const value = protocol.values.get('s1');
      // Value should be 1.0 * PHI * ALPHA
      const PHI = 1.618033988749895;
      assert.ok(Math.abs(value - PHI * ALPHA) < 0.001);
    });

    it('should accumulate totalRewards', () => {
      protocol.reward('s1', 2.0);
      protocol.reward('s2', 3.0);
      assert.equal(protocol.totalRewards, 5.0);
    });
  });

  describe('punish()', () => {
    it('should decrease state value', () => {
      protocol.initializeState('s1', 1.0);
      protocol.punish('s1', 1.0);
      assert.ok(protocol.values.get('s1') < 1.0);
    });

    it('should be equivalent to negative reward', () => {
      protocol.initializeState('s1', 0);
      protocol.initializeState('s2', 0);
      protocol.reward('s1', -1.0);
      protocol.punish('s2', 1.0);
      assert.equal(protocol.values.get('s1'), protocol.values.get('s2'));
    });

    it('should subtract from totalRewards', () => {
      protocol.reward('s1', 5.0);
      protocol.punish('s1', 2.0);
      assert.equal(protocol.totalRewards, 3.0);
    });
  });

  describe('endEpisode()', () => {
    it('should increment episode count', () => {
      protocol.endEpisode();
      protocol.endEpisode();
      assert.equal(protocol.episodeCount, 2);
    });

    it('should return episode number', () => {
      const result = protocol.endEpisode();
      assert.equal(result.episode, 1);
    });

    it('should reset all eligibility traces', () => {
      protocol.initializeState('s1');
      protocol.initializeState('s2');
      protocol.eligibility.set('s1', 0.5);
      protocol.eligibility.set('s2', 0.7);
      protocol.endEpisode();
      assert.equal(protocol.eligibility.get('s1'), 0);
      assert.equal(protocol.eligibility.get('s2'), 0);
    });

    it('should not reset state values', () => {
      protocol.initializeState('s1', 0.5);
      protocol.endEpisode();
      assert.equal(protocol.values.get('s1'), 0.5);
    });
  });

  describe('getValue()', () => {
    it('should return value for known state', () => {
      protocol.initializeState('s1', 0.75);
      assert.equal(protocol.getValue('s1'), 0.75);
    });

    it('should return 0 for unknown state', () => {
      assert.equal(protocol.getValue('unknown'), 0);
    });
  });

  describe('getTopStates()', () => {
    beforeEach(() => {
      protocol.initializeState('low', 0.1);
      protocol.initializeState('medium', 0.5);
      protocol.initializeState('high', 0.9);
    });

    it('should return states sorted by value descending', () => {
      const top = protocol.getTopStates();
      assert.equal(top[0].state, 'high');
      assert.equal(top[1].state, 'medium');
      assert.equal(top[2].state, 'low');
    });

    it('should limit to specified count', () => {
      const top = protocol.getTopStates(2);
      assert.equal(top.length, 2);
    });

    it('should include state and value in results', () => {
      const top = protocol.getTopStates(1);
      assert.equal(top[0].state, 'high');
      assert.equal(top[0].value, 0.9);
    });
  });

  describe('getAverageTDError()', () => {
    it('should return 0 with no errors', () => {
      assert.equal(protocol.getAverageTDError(), 0);
    });

    it('should calculate average of TD errors', () => {
      protocol.tdErrors = [1.0, 2.0, 3.0];
      assert.equal(protocol.getAverageTDError(), 2.0);
    });

    it('should handle negative errors', () => {
      protocol.tdErrors = [-1.0, 1.0];
      assert.equal(protocol.getAverageTDError(), 0);
    });
  });

  describe('getMetrics()', () => {
    it('should include stateCount', () => {
      protocol.initializeState('s1');
      protocol.initializeState('s2');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.stateCount, 2);
    });

    it('should include totalRewards', () => {
      protocol.reward('s1', 5.0);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalRewards, 5.0);
    });

    it('should include episodeCount', () => {
      protocol.endEpisode();
      protocol.endEpisode();
      const metrics = protocol.getMetrics();
      assert.equal(metrics.episodeCount, 2);
    });

    it('should include avgTDError', () => {
      protocol.tdErrors = [1.0, 2.0, 3.0];
      const metrics = protocol.getMetrics();
      assert.equal(metrics.avgTDError, 2.0);
    });

    it('should include topStates', () => {
      protocol.initializeState('s1', 0.5);
      const metrics = protocol.getMetrics();
      assert.ok(Array.isArray(metrics.topStates));
    });

    it('should include recentRewards', () => {
      protocol.observe('s1', 's2', 1.0);
      const metrics = protocol.getMetrics();
      assert.ok(Array.isArray(metrics.recentRewards));
      assert.equal(metrics.recentRewards.length, 1);
    });

    it('should include params (gamma, lambda, alpha)', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.params.gamma, GAMMA);
      assert.equal(metrics.params.lambda, LAMBDA);
      assert.equal(metrics.params.alpha, ALPHA);
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

  describe('exported constants', () => {
    it('GAMMA should be approximately phi - 1', () => {
      const PHI = 1.618033988749895;
      assert.ok(Math.abs(GAMMA - (PHI - 1)) < 0.001);
    });

    it('LAMBDA should be 0.9', () => {
      assert.equal(LAMBDA, 0.9);
    });

    it('ALPHA should be 0.1', () => {
      assert.equal(ALPHA, 0.1);
    });
  });
});
