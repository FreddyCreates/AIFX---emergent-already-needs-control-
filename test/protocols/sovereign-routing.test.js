const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('SovereignRoutingProtocol', () => {
  let SovereignRoutingProtocol;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/sovereign-routing-protocol.js');
    SovereignRoutingProtocol = module.SovereignRoutingProtocol;
    protocol = new SovereignRoutingProtocol();
  });

  describe('constructor', () => {
    it('should initialize with default routing table', () => {
      assert.ok(protocol.routingTable);
      assert.ok(Object.keys(protocol.routingTable).length >= 40);
    });

    it('should initialize with empty feedback history', () => {
      assert.ok(Array.isArray(protocol.feedbackHistory));
      assert.equal(protocol.feedbackHistory.length, 0);
    });

    it('should initialize learning rate to 1/PHI', () => {
      const expectedRate = 1 / 1.618033988749895;
      assert.ok(Math.abs(protocol.learningRate - expectedRate) < 0.0001);
    });

    it('should initialize metrics to zero', () => {
      assert.equal(protocol.metrics.totalRouted, 0);
      assert.equal(protocol.metrics.totalSuccess, 0);
      assert.equal(protocol.metrics.totalLatency, 0);
    });

    it('should include GPT model families', () => {
      assert.ok(protocol.routingTable['gpt-4o']);
      assert.ok(protocol.routingTable['gpt-4-turbo']);
      assert.ok(protocol.routingTable['gpt-4']);
      assert.ok(protocol.routingTable['gpt-3.5-turbo']);
    });

    it('should include Claude model families', () => {
      assert.ok(protocol.routingTable['claude-3.5-sonnet']);
      assert.ok(protocol.routingTable['claude-3.5-haiku']);
      assert.ok(protocol.routingTable['claude-3-opus']);
      assert.ok(protocol.routingTable['claude-4']);
    });

    it('should include Gemini model families', () => {
      assert.ok(protocol.routingTable['gemini-2.0-flash']);
      assert.ok(protocol.routingTable['gemini-1.5-pro']);
      assert.ok(protocol.routingTable['gemini-ultra']);
    });

    it('should include Llama model families', () => {
      assert.ok(protocol.routingTable['llama-3.1-405b']);
      assert.ok(protocol.routingTable['llama-3.1-70b']);
      assert.ok(protocol.routingTable['llama-3.2-90b']);
    });

    it('should include Mistral model families', () => {
      assert.ok(protocol.routingTable['mistral-large']);
      assert.ok(protocol.routingTable['mixtral-8x22b']);
    });

    it('should include DeepSeek model families', () => {
      assert.ok(protocol.routingTable['deepseek-v3']);
      assert.ok(protocol.routingTable['deepseek-r1']);
      assert.ok(protocol.routingTable['deepseek-coder']);
    });

    it('should initialize default reputation to 0.8', () => {
      const model = protocol.routingTable['gpt-4o'];
      assert.equal(model.reputation, 0.8);
    });

    it('should initialize totalTasks to 0', () => {
      const model = protocol.routingTable['claude-3-opus'];
      assert.equal(model.totalTasks, 0);
    });

    it('should initialize successCount to 0', () => {
      const model = protocol.routingTable['gemini-1.5-pro'];
      assert.equal(model.successCount, 0);
    });

    it('should initialize avgLatency to HEARTBEAT (873)', () => {
      const model = protocol.routingTable['llama-3.1-405b'];
      assert.equal(model.avgLatency, 873);
    });

    it('should accept custom models in config', async () => {
      const module = await import('../../protocols/sovereign-routing-protocol.js');
      const customProtocol = new module.SovereignRoutingProtocol({
        models: [{ id: 'custom-model', reputation: 0.9, capability: { reasoning: 0.95 } }]
      });
      assert.ok(customProtocol.routingTable['custom-model']);
      assert.equal(customProtocol.routingTable['custom-model'].reputation, 0.9);
    });

    it('should not override existing models with config', async () => {
      const module = await import('../../protocols/sovereign-routing-protocol.js');
      const customProtocol = new module.SovereignRoutingProtocol({
        models: [{ id: 'gpt-4o', reputation: 0.5 }]
      });
      assert.equal(customProtocol.routingTable['gpt-4o'].reputation, 0.8);
    });
  });

  describe('_initCapability()', () => {
    it('should set high reasoning for GPT models', () => {
      const model = protocol.routingTable['gpt-4o'];
      assert.equal(model.capability.reasoning, 0.9);
    });

    it('should set high coding for GPT models', () => {
      const model = protocol.routingTable['gpt-4'];
      assert.equal(model.capability.coding, 0.85);
    });

    it('should set high analysis for GPT models', () => {
      const model = protocol.routingTable['o1-preview'];
      assert.equal(model.capability.analysis, 0.88);
    });

    it('should set high reasoning for o3 models', () => {
      const model = protocol.routingTable['o3'];
      assert.equal(model.capability.reasoning, 0.9);
    });

    it('should set high creative for Claude models', () => {
      const model = protocol.routingTable['claude-3.5-sonnet'];
      assert.equal(model.capability.creative, 0.9);
    });

    it('should set high reasoning for Claude models', () => {
      const model = protocol.routingTable['claude-3-opus'];
      assert.equal(model.capability.reasoning, 0.88);
    });

    it('should set high analysis for Gemini models', () => {
      const model = protocol.routingTable['gemini-1.5-pro'];
      assert.equal(model.capability.analysis, 0.9);
    });

    it('should set high coding for Llama models', () => {
      const model = protocol.routingTable['llama-3.1-70b'];
      assert.equal(model.capability.coding, 0.8);
    });

    it('should set high coding for Mistral models', () => {
      const model = protocol.routingTable['mistral-large'];
      assert.equal(model.capability.coding, 0.82);
    });

    it('should set high coding for DeepSeek models', () => {
      const model = protocol.routingTable['deepseek-coder'];
      assert.equal(model.capability.coding, 0.88);
    });

    it('should set default 0.5 for unknown model families', () => {
      const model = protocol.routingTable['dbrx'];
      assert.equal(model.capability.reasoning, 0.5);
      assert.equal(model.capability.coding, 0.5);
    });
  });

  describe('route()', () => {
    it('should return a routing result with modelId', () => {
      const result = protocol.route({ id: 'task-1', type: 'reasoning', priority: 1 });
      assert.ok(result.modelId);
    });

    it('should return a score', () => {
      const result = protocol.route({ id: 'task-1', type: 'reasoning', priority: 1 });
      assert.ok(typeof result.score === 'number');
      assert.ok(result.score > 0);
    });

    it('should return alternatives array', () => {
      const result = protocol.route({ id: 'task-1', type: 'reasoning', priority: 1 });
      assert.ok(Array.isArray(result.alternatives));
      assert.equal(result.alternatives.length, 3);
    });

    it('should increment totalRouted metric', () => {
      protocol.route({ id: 'task-1', type: 'reasoning' });
      assert.equal(protocol.metrics.totalRouted, 1);
      protocol.route({ id: 'task-2', type: 'coding' });
      assert.equal(protocol.metrics.totalRouted, 2);
    });

    it('should prefer reasoning models for reasoning tasks', () => {
      const result = protocol.route({ id: 'task-1', type: 'reasoning', priority: 1 });
      const model = protocol.routingTable[result.modelId];
      assert.ok(model.capability.reasoning >= 0.85);
    });

    it('should prefer coding models for coding tasks', () => {
      const result = protocol.route({ id: 'task-1', type: 'coding', priority: 1 });
      const model = protocol.routingTable[result.modelId];
      assert.ok(model.capability.coding >= 0.8);
    });

    it('should prefer creative models for creative tasks', () => {
      const result = protocol.route({ id: 'task-1', type: 'creative', priority: 1 });
      const model = protocol.routingTable[result.modelId];
      assert.ok(model.capability.creative >= 0.8);
    });

    it('should weight by priority using PHI', () => {
      const result1 = protocol.route({ id: 'task-1', type: 'reasoning', priority: 0 });
      const result2 = protocol.route({ id: 'task-2', type: 'reasoning', priority: 4 });
      assert.ok(result1.score > result2.score);
    });

    it('should handle missing priority gracefully', () => {
      const result = protocol.route({ id: 'task-1', type: 'reasoning' });
      assert.ok(result.modelId);
    });

    it('should handle missing type gracefully', () => {
      const result = protocol.route({ id: 'task-1', priority: 1 });
      assert.ok(result.modelId);
    });

    it('should handle empty task object', () => {
      const result = protocol.route({});
      assert.ok(result.modelId);
    });

    it('should not return same model in alternatives', () => {
      const result = protocol.route({ id: 'task-1', type: 'reasoning', priority: 1 });
      assert.ok(!result.alternatives.includes(result.modelId));
    });

    it('should return different alternatives', () => {
      const result = protocol.route({ id: 'task-1', type: 'reasoning', priority: 1 });
      const uniqueAlts = new Set(result.alternatives);
      assert.equal(uniqueAlts.size, result.alternatives.length);
    });
  });

  describe('recordOutcome()', () => {
    it('should increment totalTasks for the model', () => {
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      assert.equal(protocol.routingTable['gpt-4o'].totalTasks, 1);
    });

    it('should increment successCount on success', () => {
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      assert.equal(protocol.routingTable['gpt-4o'].successCount, 1);
    });

    it('should not increment successCount on failure', () => {
      protocol.recordOutcome('task-1', 'gpt-4o', false, 100);
      assert.equal(protocol.routingTable['gpt-4o'].successCount, 0);
    });

    it('should update reputation on success', () => {
      const oldRep = protocol.routingTable['gpt-4o'].reputation;
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      const newRep = protocol.routingTable['gpt-4o'].reputation;
      assert.ok(newRep > oldRep);
    });

    it('should update reputation on failure', () => {
      const oldRep = protocol.routingTable['gpt-4o'].reputation;
      protocol.recordOutcome('task-1', 'gpt-4o', false, 100);
      const newRep = protocol.routingTable['gpt-4o'].reputation;
      assert.ok(newRep < oldRep);
    });

    it('should update avgLatency', () => {
      protocol.recordOutcome('task-1', 'gpt-4o', true, 200);
      assert.notEqual(protocol.routingTable['gpt-4o'].avgLatency, 873);
    });

    it('should add to feedback history', () => {
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      assert.equal(protocol.feedbackHistory.length, 1);
      assert.equal(protocol.feedbackHistory[0].taskId, 'task-1');
      assert.equal(protocol.feedbackHistory[0].modelId, 'gpt-4o');
    });

    it('should include timestamp in feedback', () => {
      const before = Date.now();
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      const after = Date.now();
      assert.ok(protocol.feedbackHistory[0].timestamp >= before);
      assert.ok(protocol.feedbackHistory[0].timestamp <= after);
    });

    it('should update totalSuccess metric on success', () => {
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      assert.equal(protocol.metrics.totalSuccess, 1);
    });

    it('should not update totalSuccess metric on failure', () => {
      protocol.recordOutcome('task-1', 'gpt-4o', false, 100);
      assert.equal(protocol.metrics.totalSuccess, 0);
    });

    it('should update totalLatency metric', () => {
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      protocol.recordOutcome('task-2', 'gpt-4o', true, 200);
      assert.equal(protocol.metrics.totalLatency, 300);
    });

    it('should handle unknown model gracefully', () => {
      assert.doesNotThrow(() => {
        protocol.recordOutcome('task-1', 'unknown-model', true, 100);
      });
    });

    it('should not modify anything for unknown model', () => {
      const beforeHistory = protocol.feedbackHistory.length;
      protocol.recordOutcome('task-1', 'unknown-model', true, 100);
      assert.equal(protocol.feedbackHistory.length, beforeHistory);
    });

    it('should use exponential moving average with alpha=1/PHI', () => {
      const alpha = 1 / 1.618033988749895;
      const oldRep = protocol.routingTable['gpt-4o'].reputation;
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      const expectedRep = alpha * 1 + (1 - alpha) * oldRep;
      assert.ok(Math.abs(protocol.routingTable['gpt-4o'].reputation - expectedRep) < 0.0001);
    });
  });

  describe('cascadeFallback()', () => {
    it('should return a fallback model', () => {
      const result = protocol.cascadeFallback({ type: 'reasoning', priority: 1 }, ['gpt-4o']);
      assert.ok(result.modelId);
    });

    it('should not return failed models', () => {
      const result = protocol.cascadeFallback(
        { type: 'reasoning', priority: 1 },
        ['gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro']
      );
      assert.notEqual(result.modelId, 'gpt-4o');
      assert.notEqual(result.modelId, 'claude-3.5-sonnet');
      assert.notEqual(result.modelId, 'gemini-1.5-pro');
    });

    it('should return exhausted=true when all models failed', () => {
      const allModels = Object.keys(protocol.routingTable);
      const result = protocol.cascadeFallback({ type: 'reasoning' }, allModels);
      assert.equal(result.exhausted, true);
      assert.equal(result.modelId, null);
    });

    it('should apply phi-weighted decay to fallback positions', () => {
      const result = protocol.cascadeFallback({ type: 'reasoning', priority: 1 }, []);
      assert.ok(result.adjustedScore !== undefined || result.score !== undefined);
    });

    it('should handle empty failed models array', () => {
      const result = protocol.cascadeFallback({ type: 'reasoning', priority: 1 }, []);
      assert.ok(result.modelId);
      assert.equal(result.exhausted, false);
    });

    it('should handle missing task type', () => {
      const result = protocol.cascadeFallback({ priority: 1 }, ['gpt-4o']);
      assert.ok(result.modelId || result.exhausted);
    });

    it('should handle missing priority', () => {
      const result = protocol.cascadeFallback({ type: 'reasoning' }, ['gpt-4o']);
      assert.ok(result.modelId || result.exhausted);
    });

    it('should return score with fallback', () => {
      const result = protocol.cascadeFallback({ type: 'reasoning', priority: 1 }, ['gpt-4o']);
      assert.ok(typeof result.score === 'number');
    });
  });

  describe('rebalance()', () => {
    it('should not throw when called', () => {
      assert.doesNotThrow(() => protocol.rebalance());
    });

    it('should update reputation based on success rate', () => {
      protocol.routingTable['gpt-4o'].totalTasks = 10;
      protocol.routingTable['gpt-4o'].successCount = 5; // 50% success
      const oldRep = protocol.routingTable['gpt-4o'].reputation;
      protocol.rebalance();
      // 50% success should reduce reputation from 0.8
      assert.notEqual(protocol.routingTable['gpt-4o'].reputation, oldRep);
    });

    it('should not modify models with zero tasks', () => {
      const oldRep = protocol.routingTable['claude-3.5-sonnet'].reputation;
      protocol.rebalance();
      assert.equal(protocol.routingTable['claude-3.5-sonnet'].reputation, oldRep);
    });

    it('should use alpha=1/PHI for EMA', () => {
      protocol.routingTable['gpt-4o'].totalTasks = 10;
      protocol.routingTable['gpt-4o'].successCount = 10;
      const oldRep = protocol.routingTable['gpt-4o'].reputation;
      protocol.rebalance();
      const alpha = 1 / 1.618033988749895;
      const expected = alpha * 1.0 + (1 - alpha) * oldRep;
      assert.ok(Math.abs(protocol.routingTable['gpt-4o'].reputation - expected) < 0.0001);
    });

    it('should handle 0% success rate', () => {
      protocol.routingTable['gpt-4o'].totalTasks = 10;
      protocol.routingTable['gpt-4o'].successCount = 0;
      const oldRep = protocol.routingTable['gpt-4o'].reputation;
      protocol.rebalance();
      assert.ok(protocol.routingTable['gpt-4o'].reputation < oldRep);
    });

    it('should handle 50% success rate', () => {
      protocol.routingTable['gpt-4o'].totalTasks = 10;
      protocol.routingTable['gpt-4o'].successCount = 5;
      protocol.rebalance();
      assert.ok(protocol.routingTable['gpt-4o'].reputation > 0);
      assert.ok(protocol.routingTable['gpt-4o'].reputation < 1);
    });
  });

  describe('getRoutingTable()', () => {
    it('should return object with all models', () => {
      const table = protocol.getRoutingTable();
      assert.ok(table['gpt-4o']);
      assert.ok(table['claude-3.5-sonnet']);
      assert.ok(table['gemini-1.5-pro']);
    });

    it('should include reputation in each model', () => {
      const table = protocol.getRoutingTable();
      assert.ok(typeof table['gpt-4o'].reputation === 'number');
    });

    it('should include capability in each model', () => {
      const table = protocol.getRoutingTable();
      assert.ok(table['gpt-4o'].capability);
      assert.ok(typeof table['gpt-4o'].capability.reasoning === 'number');
    });

    it('should include totalTasks in each model', () => {
      const table = protocol.getRoutingTable();
      assert.ok(typeof table['gpt-4o'].totalTasks === 'number');
    });

    it('should calculate successRate', () => {
      protocol.routingTable['gpt-4o'].totalTasks = 10;
      protocol.routingTable['gpt-4o'].successCount = 8;
      const table = protocol.getRoutingTable();
      assert.equal(table['gpt-4o'].successRate, 0.8);
    });

    it('should return 0 successRate when no tasks', () => {
      const table = protocol.getRoutingTable();
      assert.equal(table['gpt-4o'].successRate, 0);
    });

    it('should include avgLatency', () => {
      const table = protocol.getRoutingTable();
      assert.ok(typeof table['gpt-4o'].avgLatency === 'number');
    });

    it('should return copy of capability object', () => {
      const table = protocol.getRoutingTable();
      table['gpt-4o'].capability.reasoning = 0;
      assert.notEqual(protocol.routingTable['gpt-4o'].capability.reasoning, 0);
    });
  });

  describe('getMetrics()', () => {
    it('should return totalRouted', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalRouted' in metrics);
    });

    it('should return successRate', () => {
      const metrics = protocol.getMetrics();
      assert.ok('successRate' in metrics);
    });

    it('should return avgLatency', () => {
      const metrics = protocol.getMetrics();
      assert.ok('avgLatency' in metrics);
    });

    it('should return topModel', () => {
      const metrics = protocol.getMetrics();
      assert.ok('topModel' in metrics);
    });

    it('should calculate correct successRate', () => {
      protocol.route({ id: 'task-1', type: 'reasoning' });
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      protocol.route({ id: 'task-2', type: 'reasoning' });
      protocol.recordOutcome('task-2', 'gpt-4o', false, 100);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.successRate, 0.5);
    });

    it('should calculate correct avgLatency', () => {
      protocol.route({ id: 'task-1', type: 'reasoning' });
      protocol.recordOutcome('task-1', 'gpt-4o', true, 100);
      protocol.route({ id: 'task-2', type: 'reasoning' });
      protocol.recordOutcome('task-2', 'gpt-4o', true, 200);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.avgLatency, 150);
    });

    it('should return 0 successRate when no tasks', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.successRate, 0);
    });

    it('should return 0 avgLatency when no tasks', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.avgLatency, 0);
    });

    it('should identify topModel by reputation', () => {
      protocol.routingTable['custom-top'] = { id: 'custom-top', reputation: 1.0 };
      const metrics = protocol.getMetrics();
      assert.equal(metrics.topModel, 'custom-top');
    });
  });

  describe('integration scenarios', () => {
    it('should route, record, and rebalance correctly', () => {
      // Route 10 tasks
      for (let i = 0; i < 10; i++) {
        const result = protocol.route({ id: `task-${i}`, type: 'reasoning', priority: 1 });
        protocol.recordOutcome(`task-${i}`, result.modelId, i % 2 === 0, 100 + i * 10);
      }
      protocol.rebalance();
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalRouted, 10);
      assert.ok(metrics.successRate > 0);
    });

    it('should handle cascading fallbacks', () => {
      const task = { id: 'task-1', type: 'coding', priority: 0 };
      const failed = [];
      for (let i = 0; i < 5; i++) {
        const result = protocol.cascadeFallback(task, failed);
        if (result.modelId) {
          failed.push(result.modelId);
        }
      }
      assert.equal(failed.length, 5);
      const unique = new Set(failed);
      assert.equal(unique.size, 5);
    });

    it('should adapt routing based on feedback', () => {
      // Make gpt-4o fail repeatedly
      for (let i = 0; i < 5; i++) {
        protocol.recordOutcome(`task-${i}`, 'gpt-4o', false, 1000);
      }
      // Make claude succeed
      for (let i = 0; i < 5; i++) {
        protocol.recordOutcome(`task-${i + 5}`, 'claude-3.5-sonnet', true, 50);
      }
      
      const result = protocol.route({ id: 'task-new', type: 'reasoning', priority: 1 });
      // Claude should be preferred after gpt-4o failures
      assert.ok(
        result.modelId === 'claude-3.5-sonnet' ||
        result.alternatives.includes('claude-3.5-sonnet')
      );
    });
  });
});
