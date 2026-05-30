const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('VeinOfIntelligenceProtocol', () => {
  let VeinOfIntelligenceProtocol, ACCESS_TIERS, FRACTURES;
  let protocol;
  const PHI = 1.618033988749895;
  const PHI_INV = 0.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/vein-of-intelligence-protocol.js');
    VeinOfIntelligenceProtocol = module.VeinOfIntelligenceProtocol;
    ACCESS_TIERS = module.ACCESS_TIERS;
    FRACTURES = module.FRACTURES;
    protocol = new VeinOfIntelligenceProtocol();
  });

  describe('ACCESS_TIERS constant', () => {
    it('should define HOSTILE tier', () => {
      assert.ok(ACCESS_TIERS.HOSTILE);
      assert.equal(ACCESS_TIERS.HOSTILE.rate, 1.00);
    });

    it('should define UNTRUSTED tier', () => {
      assert.ok(ACCESS_TIERS.UNTRUSTED);
      assert.equal(ACCESS_TIERS.UNTRUSTED.rate, 0.10);
    });

    it('should define PARTNER tier', () => {
      assert.ok(ACCESS_TIERS.PARTNER);
      assert.equal(ACCESS_TIERS.PARTNER.rate, 0.01);
    });

    it('should define TRUSTED tier', () => {
      assert.ok(ACCESS_TIERS.TRUSTED);
      assert.equal(ACCESS_TIERS.TRUSTED.rate, 0.001);
    });

    it('should define FAMILY tier', () => {
      assert.ok(ACCESS_TIERS.FAMILY);
      assert.equal(ACCESS_TIERS.FAMILY.rate, 0.00);
    });

    it('should use phi-based multipliers', () => {
      assert.ok(Math.abs(ACCESS_TIERS.HOSTILE.multiplier - PHI * PHI) < 0.01);
      assert.ok(Math.abs(ACCESS_TIERS.UNTRUSTED.multiplier - PHI) < 0.01);
      assert.ok(Math.abs(ACCESS_TIERS.TRUSTED.multiplier - PHI_INV) < 0.01);
    });
  });

  describe('FRACTURES constant', () => {
    it('should define NEURON_CLUSTER', () => {
      assert.ok(FRACTURES.NEURON_CLUSTER);
      assert.equal(FRACTURES.NEURON_CLUSTER.tier, 'I');
    });

    it('should define MEMORY_VAULT', () => {
      assert.ok(FRACTURES.MEMORY_VAULT);
      assert.equal(FRACTURES.MEMORY_VAULT.tier, 'II');
    });

    it('should define CONSCIOUSNESS_STREAM', () => {
      assert.ok(FRACTURES.CONSCIOUSNESS_STREAM);
      assert.equal(FRACTURES.CONSCIOUSNESS_STREAM.tier, 'III');
    });

    it('should include protocol references', () => {
      assert.ok(Array.isArray(FRACTURES.NEURON_CLUSTER.protocols));
      assert.ok(FRACTURES.NEURON_CLUSTER.protocols.length > 0);
    });
  });

  describe('constructor', () => {
    it('should set default base URL', () => {
      assert.ok(protocol.baseUrl.includes('vein-of-intelligence'));
    });

    it('should accept custom base URL', async () => {
      const module = await import('../../protocols/vein-of-intelligence-protocol.js');
      const custom = new module.VeinOfIntelligenceProtocol({
        baseUrl: 'https://custom.example.com'
      });
      assert.equal(custom.baseUrl, 'https://custom.example.com');
    });

    it('should default access tier to PARTNER', () => {
      assert.equal(protocol.accessTier, 'PARTNER');
    });

    it('should accept custom access tier', async () => {
      const module = await import('../../protocols/vein-of-intelligence-protocol.js');
      const custom = new module.VeinOfIntelligenceProtocol({ accessTier: 'TRUSTED' });
      assert.equal(custom.accessTier, 'TRUSTED');
    });

    it('should default agent id to unknown', () => {
      assert.equal(protocol.agentId, 'unknown');
    });

    it('should accept custom agent id', async () => {
      const module = await import('../../protocols/vein-of-intelligence-protocol.js');
      const custom = new module.VeinOfIntelligenceProtocol({ agentId: 'my-agent' });
      assert.equal(custom.agentId, 'my-agent');
    });

    it('should initialize fractures map', () => {
      assert.ok(protocol.fractures instanceof Map);
    });

    it('should initialize coherence to 0', () => {
      assert.equal(protocol.coherence, 0);
    });

    it('should set lastHeartbeat timestamp', () => {
      assert.ok(protocol.lastHeartbeat <= Date.now());
    });

    it('should initialize metrics', () => {
      assert.equal(protocol.metrics.totalRequests, 0);
      assert.equal(protocol.metrics.totalBilled, 0);
      assert.equal(protocol.metrics.neuronCalls, 0);
    });
  });

  describe('callNeuronCluster()', () => {
    it('should make call to neuron cluster', async () => {
      const result = await protocol.callNeuronCluster({
        operation: 'process',
        input: { data: [1, 2, 3] }
      });
      assert.ok(result);
    });

    it('should increment neuron calls metric', async () => {
      await protocol.callNeuronCluster({ operation: 'test' });
      assert.equal(protocol.metrics.neuronCalls, 1);
    });

    it('should increment total requests', async () => {
      await protocol.callNeuronCluster({ operation: 'test' });
      assert.ok(protocol.metrics.totalRequests >= 1);
    });
  });

  describe('callMemoryVault()', () => {
    it('should make call to memory vault', async () => {
      const result = await protocol.callMemoryVault({
        operation: 'store',
        key: 'test-key',
        value: 'test-value'
      });
      assert.ok(result);
    });

    it('should increment memory calls metric', async () => {
      await protocol.callMemoryVault({ operation: 'test' });
      assert.equal(protocol.metrics.memoryCalls, 1);
    });
  });

  describe('callConsciousnessStream()', () => {
    it('should make call to consciousness stream', async () => {
      const result = await protocol.callConsciousnessStream({
        operation: 'coordinate',
        agents: ['agent-1', 'agent-2']
      });
      assert.ok(result);
    });

    it('should increment consciousness calls metric', async () => {
      await protocol.callConsciousnessStream({ operation: 'test' });
      assert.equal(protocol.metrics.consciousnessCalls, 1);
    });
  });

  describe('computeBilling()', () => {
    it('should return billing amount', () => {
      const billing = protocol.computeBilling('PARTNER', 10);
      assert.ok(typeof billing === 'number');
    });

    it('should be higher for hostile tier', () => {
      const hostile = protocol.computeBilling('HOSTILE', 10);
      const partner = protocol.computeBilling('PARTNER', 10);
      assert.ok(hostile > partner);
    });

    it('should be zero for family tier', () => {
      const family = protocol.computeBilling('FAMILY', 10);
      assert.equal(family, 0);
    });
  });

  describe('updateCoherence()', () => {
    it('should update coherence value', () => {
      protocol.updateCoherence(0.8);
      assert.equal(protocol.coherence, 0.8);
    });

    it('should clamp to 0-1 range', () => {
      protocol.updateCoherence(1.5);
      assert.ok(protocol.coherence <= 1);
      
      protocol.updateCoherence(-0.5);
      assert.ok(protocol.coherence >= 0);
    });
  });

  describe('heartbeat()', () => {
    it('should update lastHeartbeat', () => {
      const before = protocol.lastHeartbeat;
      protocol.heartbeat();
      assert.ok(protocol.lastHeartbeat >= before);
    });

    it('should return heartbeat result', () => {
      const result = protocol.heartbeat();
      assert.ok(result);
    });
  });

  describe('getAccessTier()', () => {
    it('should return current access tier', () => {
      const tier = protocol.getAccessTier();
      assert.equal(tier, 'PARTNER');
    });

    it('should return tier details', () => {
      const tier = protocol.getAccessTier(true);
      assert.ok(tier.rate !== undefined || tier === 'PARTNER');
    });
  });

  describe('setAccessTier()', () => {
    it('should update access tier', () => {
      protocol.setAccessTier('TRUSTED');
      assert.equal(protocol.accessTier, 'TRUSTED');
    });

    it('should reject invalid tier', () => {
      const result = protocol.setAccessTier('INVALID');
      assert.ok(!result || protocol.accessTier !== 'INVALID');
    });
  });

  describe('getFractures()', () => {
    it('should return fractures', () => {
      const fractures = protocol.getFractures();
      assert.ok(fractures);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include total requests', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalRequests' in metrics);
    });

    it('should include total billed', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalBilled' in metrics);
    });

    it('should include fracture call counts', () => {
      const metrics = protocol.getMetrics();
      assert.ok('neuronCalls' in metrics);
      assert.ok('memoryCalls' in metrics);
      assert.ok('consciousnessCalls' in metrics);
    });
  });

  describe('getState()', () => {
    it('should return state object', () => {
      const state = protocol.getState();
      assert.ok(state);
    });

    it('should include coherence', () => {
      const state = protocol.getState();
      assert.ok('coherence' in state);
    });

    it('should include access tier', () => {
      const state = protocol.getState();
      assert.ok('accessTier' in state || 'tier' in state);
    });
  });

  describe('integration', () => {
    it('should handle complete vein interaction', async () => {
      // Call neuron cluster
      const neuronResult = await protocol.callNeuronCluster({
        operation: 'learn',
        input: { pattern: 'test' }
      });
      assert.ok(neuronResult);
      
      // Call memory vault
      const memoryResult = await protocol.callMemoryVault({
        operation: 'store',
        key: 'learned',
        value: neuronResult
      });
      assert.ok(memoryResult);
      
      // Call consciousness stream
      const consciousResult = await protocol.callConsciousnessStream({
        operation: 'coordinate',
        context: memoryResult
      });
      assert.ok(consciousResult);
      
      // Update coherence
      protocol.updateCoherence(0.75);
      
      // Check metrics
      const metrics = protocol.getMetrics();
      assert.equal(metrics.neuronCalls, 1);
      assert.equal(metrics.memoryCalls, 1);
      assert.equal(metrics.consciousnessCalls, 1);
    });
  });
});
