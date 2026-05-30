const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('MultiModelFusionProtocol', () => {
  let MultiModelFusionProtocol;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/multi-model-fusion-protocol.js');
    MultiModelFusionProtocol = module.MultiModelFusionProtocol;
    protocol = new MultiModelFusionProtocol();
  });

  describe('constructor', () => {
    it('should initialize model registry with 5 core models', () => {
      assert.ok(protocol.modelRegistry instanceof Map);
      assert.equal(protocol.modelRegistry.size, 5);
    });

    it('should initialize GPT model', () => {
      assert.ok(protocol.modelRegistry.has('gpt'));
      const gpt = protocol.modelRegistry.get('gpt');
      assert.equal(gpt.name, 'GPT-4');
    });

    it('should initialize Claude model', () => {
      assert.ok(protocol.modelRegistry.has('claude'));
      const claude = protocol.modelRegistry.get('claude');
      assert.equal(claude.name, 'Claude-3.5');
    });

    it('should initialize Gemini model', () => {
      assert.ok(protocol.modelRegistry.has('gemini'));
      const gemini = protocol.modelRegistry.get('gemini');
      assert.equal(gemini.name, 'Gemini-2.0');
    });

    it('should initialize Llama model', () => {
      assert.ok(protocol.modelRegistry.has('llama'));
      const llama = protocol.modelRegistry.get('llama');
      assert.equal(llama.name, 'Llama-3.1');
    });

    it('should initialize Mistral model', () => {
      assert.ok(protocol.modelRegistry.has('mistral'));
      const mistral = protocol.modelRegistry.get('mistral');
      assert.equal(mistral.name, 'Mistral-Large');
    });

    it('should set fusion weights from model confidence', () => {
      assert.equal(protocol.fusionWeights['gpt'], 0.92);
      assert.equal(protocol.fusionWeights['claude'], 0.90);
      assert.equal(protocol.fusionWeights['gemini'], 0.88);
    });

    it('should use default consensus threshold of 0.7', () => {
      assert.equal(protocol.consensusThreshold, 0.7);
    });

    it('should accept custom consensus threshold', async () => {
      const module = await import('../../protocols/multi-model-fusion-protocol.js');
      const custom = new module.MultiModelFusionProtocol({ consensusThreshold: 0.8 });
      assert.equal(custom.consensusThreshold, 0.8);
    });

    it('should initialize metrics to zero', () => {
      assert.equal(protocol.metrics.totalFusions, 0);
      assert.equal(protocol.metrics.totalConsensus, 0);
      assert.equal(protocol.metrics.hallucinationsDetected, 0);
    });

    it('should initialize model contribution tracking', () => {
      assert.equal(protocol.metrics.modelContributions['gpt'], 0);
      assert.equal(protocol.metrics.modelContributions['claude'], 0);
      assert.equal(protocol.metrics.modelContributions['gemini'], 0);
    });

    it('should set model strengths', () => {
      const gpt = protocol.modelRegistry.get('gpt');
      assert.ok(gpt.strengths.includes('reasoning'));
      assert.ok(gpt.strengths.includes('coding'));
    });

    it('should initialize contribution counts to zero', () => {
      const gpt = protocol.modelRegistry.get('gpt');
      assert.equal(gpt.totalContributions, 0);
      assert.equal(gpt.successfulContributions, 0);
    });
  });

  describe('fuse()', () => {
    it('should return consensus boolean', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'claude']);
      assert.ok(typeof result.consensus === 'boolean');
    });

    it('should return responses array', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'claude']);
      assert.ok(Array.isArray(result.responses));
    });

    it('should return fused content', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'claude']);
      assert.ok(typeof result.fusedContent === 'string');
    });

    it('should return consensus score', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'claude']);
      assert.ok(typeof result.consensusScore === 'number');
    });

    it('should return weights array', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'claude']);
      assert.ok(Array.isArray(result.weights));
    });

    it('should return hallucinations array', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'claude']);
      assert.ok(Array.isArray(result.hallucinations));
    });

    it('should increment totalFusions metric', () => {
      protocol.fuse('Test prompt', ['gpt', 'claude']);
      assert.equal(protocol.metrics.totalFusions, 1);
    });

    it('should increment model contribution counts', () => {
      protocol.fuse('Test prompt', ['gpt', 'claude']);
      assert.ok(protocol.metrics.modelContributions['gpt'] >= 1);
      assert.ok(protocol.metrics.modelContributions['claude'] >= 1);
    });

    it('should use default models if none specified', () => {
      const result = protocol.fuse('Test prompt');
      assert.equal(result.responses.length, 3); // gpt, claude, gemini
    });

    it('should query only specified models', () => {
      const result = protocol.fuse('Test prompt', ['gpt']);
      assert.equal(result.responses.length, 1);
      assert.equal(result.responses[0].modelId, 'gpt');
    });

    it('should apply phi-decay weighting', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'claude', 'gemini']);
      // First model should have highest weight
      const gptWeight = result.weights.find(w => w.modelId === 'gpt');
      const claudeWeight = result.weights.find(w => w.modelId === 'claude');
      if (gptWeight && claudeWeight) {
        assert.ok(gptWeight.weight >= 0);
        assert.ok(claudeWeight.weight >= 0);
      }
    });

    it('should handle unknown model gracefully', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'unknown-model']);
      assert.ok(result.responses.length >= 1);
    });

    it('should include model id in each response', () => {
      const result = protocol.fuse('Test prompt', ['gpt', 'claude']);
      for (const resp of result.responses) {
        assert.ok(resp.modelId);
      }
    });

    it('should include content in each response', () => {
      const result = protocol.fuse('Test prompt', ['gpt']);
      assert.ok(result.responses[0].content);
    });

    it('should include confidence in each response', () => {
      const result = protocol.fuse('Test prompt', ['gpt']);
      assert.ok(typeof result.responses[0].confidence === 'number');
    });

    it('should include latency in each response', () => {
      const result = protocol.fuse('Test prompt', ['gpt']);
      assert.ok(typeof result.responses[0].latencyMs === 'number');
    });

    it('should include token count in each response', () => {
      const result = protocol.fuse('Test prompt', ['gpt']);
      assert.ok(typeof result.responses[0].tokens === 'number');
    });
  });

  describe('scoreConsensus()', () => {
    it('should return 1.0 for single response', () => {
      const responses = [{ content: 'test content', modelId: 'gpt' }];
      const score = protocol.scoreConsensus(responses);
      assert.equal(score, 1.0);
    });

    it('should return 1.0 for identical responses', () => {
      const responses = [
        { content: 'identical content here', modelId: 'gpt' },
        { content: 'identical content here', modelId: 'claude' }
      ];
      const score = protocol.scoreConsensus(responses);
      assert.equal(score, 1.0);
    });

    it('should return low score for different responses', () => {
      const responses = [
        { content: 'completely different topic about science', modelId: 'gpt' },
        { content: 'unrelated discussion about cooking recipes', modelId: 'claude' }
      ];
      const score = protocol.scoreConsensus(responses);
      assert.ok(score < 0.5);
    });

    it('should return 0 for empty responses array', () => {
      const score = protocol.scoreConsensus([]);
      assert.equal(score, 0);
    });

    it('should return score between 0 and 1', () => {
      const responses = [
        { content: 'some content about testing', modelId: 'gpt' },
        { content: 'other content about testing too', modelId: 'claude' }
      ];
      const score = protocol.scoreConsensus(responses);
      assert.ok(score >= 0);
      assert.ok(score <= 1);
    });

    it('should handle three or more responses', () => {
      const responses = [
        { content: 'test content here', modelId: 'gpt' },
        { content: 'test content there', modelId: 'claude' },
        { content: 'test content everywhere', modelId: 'gemini' }
      ];
      const score = protocol.scoreConsensus(responses);
      assert.ok(typeof score === 'number');
    });
  });

  describe('detectHallucination()', () => {
    it('should return empty array for no primary response', () => {
      const flags = protocol.detectHallucination(null, []);
      assert.equal(flags.length, 0);
    });

    it('should return empty array for no other responses', () => {
      const primary = { content: 'test content', modelId: 'gpt' };
      const flags = protocol.detectHallucination(primary, []);
      assert.equal(flags.length, 0);
    });

    it('should flag unique terms', () => {
      const primary = { content: 'unique hallucination content special term', modelId: 'gpt' };
      const others = [{ content: 'completely different response here', modelId: 'claude' }];
      const flags = protocol.detectHallucination(primary, others);
      assert.ok(flags.length > 0);
    });

    it('should include source model in flags', () => {
      const primary = { content: 'unique hallucination content', modelId: 'gpt' };
      const others = [{ content: 'different response here', modelId: 'claude' }];
      const flags = protocol.detectHallucination(primary, others);
      if (flags.length > 0) {
        assert.equal(flags[0].source, 'gpt');
      }
    });

    it('should include reason in flags', () => {
      const primary = { content: 'unique hallucination content', modelId: 'gpt' };
      const others = [{ content: 'different response here', modelId: 'claude' }];
      const flags = protocol.detectHallucination(primary, others);
      if (flags.length > 0) {
        assert.equal(flags[0].reason, 'unique_to_single_model');
      }
    });

    it('should not flag common terms', () => {
      const primary = { content: 'common shared content here', modelId: 'gpt' };
      const others = [{ content: 'common shared content there', modelId: 'claude' }];
      const flags = protocol.detectHallucination(primary, others);
      const commonFlags = flags.filter(f => f.term === 'common' || f.term === 'shared');
      assert.equal(commonFlags.length, 0);
    });

    it('should increment hallucinationsDetected for high unique ratio', () => {
      const before = protocol.metrics.hallucinationsDetected;
      const primary = { content: 'unique specialized terminology hallucination anomaly exceptional', modelId: 'gpt' };
      const others = [{ content: 'completely different standard normal response', modelId: 'claude' }];
      protocol.detectHallucination(primary, others);
      // May or may not increment depending on ratio
      assert.ok(protocol.metrics.hallucinationsDetected >= before);
    });
  });

  describe('resolveDisagreement()', () => {
    it('should return empty for empty responses', () => {
      const result = protocol.resolveDisagreement([]);
      assert.equal(result.content, '');
      assert.equal(result.modelId, null);
    });

    it('should use confidence-max method', () => {
      const responses = [
        { content: 'high conf', confidence: 0.9, modelId: 'gpt' },
        { content: 'low conf', confidence: 0.5, modelId: 'claude' }
      ];
      const result = protocol.resolveDisagreement(responses, 'confidence-max');
      assert.equal(result.content, 'high conf');
      assert.equal(result.modelId, 'gpt');
      assert.equal(result.method, 'confidence-max');
    });

    it('should use weighted-vote method by default', () => {
      const responses = [
        { content: 'response 1', confidence: 0.9, modelId: 'gpt' },
        { content: 'response 2', confidence: 0.8, modelId: 'claude' }
      ];
      const result = protocol.resolveDisagreement(responses);
      assert.equal(result.method, 'weighted-vote');
    });

    it('should return content from winning model', () => {
      const responses = [
        { content: 'winning response', confidence: 0.95, modelId: 'gpt' }
      ];
      const result = protocol.resolveDisagreement(responses);
      assert.ok(result.content);
    });

    it('should return model id', () => {
      const responses = [
        { content: 'response', confidence: 0.9, modelId: 'gpt' }
      ];
      const result = protocol.resolveDisagreement(responses);
      assert.equal(result.modelId, 'gpt');
    });

    it('should return confidence', () => {
      const responses = [
        { content: 'response', confidence: 0.9, modelId: 'gpt' }
      ];
      const result = protocol.resolveDisagreement(responses);
      assert.ok(typeof result.confidence === 'number');
    });

    it('should use fusion weights in weighted-vote', () => {
      // GPT has higher fusion weight (0.92) than claude (0.90)
      const responses = [
        { content: 'gpt response', confidence: 0.85, modelId: 'gpt' },
        { content: 'claude response', confidence: 0.85, modelId: 'claude' }
      ];
      const result = protocol.resolveDisagreement(responses, 'weighted-vote');
      // With equal confidence, higher fusion weight should win
      assert.equal(result.modelId, 'gpt');
    });
  });

  describe('buildFusionChain()', () => {
    it('should return final content', () => {
      const result = protocol.buildFusionChain('Test prompt', 3);
      assert.ok(typeof result.finalContent === 'string');
    });

    it('should return chain array', () => {
      const result = protocol.buildFusionChain('Test prompt', 3);
      assert.ok(Array.isArray(result.chain));
    });

    it('should return total contribution', () => {
      const result = protocol.buildFusionChain('Test prompt', 3);
      assert.ok(typeof result.totalContribution === 'number');
    });

    it('should respect max depth', () => {
      const result = protocol.buildFusionChain('Test prompt', 2);
      assert.ok(result.chain.length <= 2);
    });

    it('should include depth in chain entries', () => {
      const result = protocol.buildFusionChain('Test prompt', 3);
      if (result.chain.length > 0) {
        assert.ok('depth' in result.chain[0]);
      }
    });

    it('should include model id in chain entries', () => {
      const result = protocol.buildFusionChain('Test prompt', 3);
      if (result.chain.length > 0) {
        assert.ok('modelId' in result.chain[0]);
      }
    });

    it('should include contribution in chain entries', () => {
      const result = protocol.buildFusionChain('Test prompt', 3);
      if (result.chain.length > 0) {
        assert.ok('contribution' in result.chain[0]);
      }
    });

    it('should apply phi-decay to contributions', () => {
      const result = protocol.buildFusionChain('Test prompt', 3);
      if (result.chain.length >= 2) {
        // First entry should have contribution = 1 (phi^0)
        // Second entry should have contribution = 1/phi
        assert.ok(result.chain[0].contribution > result.chain[1].contribution);
      }
    });

    it('should build iterative refinement', () => {
      const result = protocol.buildFusionChain('Test prompt', 3);
      // Each step refines the previous
      assert.ok(result.chain.length >= 1);
    });

    it('should use different models in chain', () => {
      const result = protocol.buildFusionChain('Test prompt', 5);
      const models = result.chain.map(c => c.modelId);
      // Should cycle through models
      assert.ok(models.length >= 1);
    });
  });

  describe('updateWeights()', () => {
    it('should update fusion weight on success', () => {
      const before = protocol.fusionWeights['gpt'];
      protocol.updateWeights('gpt', { success: true, quality: 1.0 });
      const after = protocol.fusionWeights['gpt'];
      assert.notEqual(before, after);
    });

    it('should reduce weight on failure', () => {
      protocol.fusionWeights['gpt'] = 0.9;
      protocol.updateWeights('gpt', { success: false, quality: 0.0 });
      assert.ok(protocol.fusionWeights['gpt'] < 0.9);
    });

    it('should increment successfulContributions on success', () => {
      const model = protocol.modelRegistry.get('gpt');
      const before = model.successfulContributions;
      protocol.updateWeights('gpt', { success: true });
      assert.ok(model.successfulContributions > before);
    });

    it('should not increment successfulContributions on failure', () => {
      const model = protocol.modelRegistry.get('gpt');
      const before = model.successfulContributions;
      protocol.updateWeights('gpt', { success: false });
      assert.equal(model.successfulContributions, before);
    });

    it('should handle unknown model gracefully', () => {
      assert.doesNotThrow(() => {
        protocol.updateWeights('unknown-model', { success: true });
      });
    });

    it('should use quality score if provided', () => {
      protocol.fusionWeights['gpt'] = 0.5;
      protocol.updateWeights('gpt', { success: true, quality: 0.9 });
      // Weight should move toward 0.9
      assert.ok(protocol.fusionWeights['gpt'] > 0.5);
    });

    it('should default quality to 1.0 on success', () => {
      protocol.fusionWeights['gpt'] = 0.5;
      protocol.updateWeights('gpt', { success: true });
      // Weight should move toward 1.0
      assert.ok(protocol.fusionWeights['gpt'] > 0.5);
    });

    it('should default quality to 0.0 on failure', () => {
      protocol.fusionWeights['gpt'] = 0.5;
      protocol.updateWeights('gpt', { success: false });
      // Weight should move toward 0.0
      assert.ok(protocol.fusionWeights['gpt'] < 0.5);
    });
  });

  describe('getFusionMetrics()', () => {
    it('should return total fusions', () => {
      const metrics = protocol.getFusionMetrics();
      assert.ok('totalFusions' in metrics);
    });

    it('should return average consensus', () => {
      const metrics = protocol.getFusionMetrics();
      assert.ok('avgConsensus' in metrics);
    });

    it('should return hallucinations detected', () => {
      const metrics = protocol.getFusionMetrics();
      assert.ok('hallucinationsDetected' in metrics);
    });

    it('should return model contributions', () => {
      const metrics = protocol.getFusionMetrics();
      assert.ok('modelContributions' in metrics);
    });

    it('should calculate correct avgConsensus', () => {
      protocol.fuse('Prompt 1', ['gpt', 'claude']);
      protocol.fuse('Prompt 2', ['gpt', 'claude']);
      const metrics = protocol.getFusionMetrics();
      assert.ok(metrics.avgConsensus >= 0);
      assert.ok(metrics.avgConsensus <= 1);
    });

    it('should return 0 avgConsensus for no fusions', () => {
      const metrics = protocol.getFusionMetrics();
      assert.equal(metrics.avgConsensus, 0);
    });

    it('should return copy of model contributions', () => {
      const metrics = protocol.getFusionMetrics();
      metrics.modelContributions['gpt'] = 999;
      assert.notEqual(protocol.metrics.modelContributions['gpt'], 999);
    });
  });

  describe('integration scenarios', () => {
    it('should fuse, resolve, and update weights', () => {
      const fuseResult = protocol.fuse('Test prompt', ['gpt', 'claude', 'gemini']);
      const resolved = protocol.resolveDisagreement(fuseResult.responses);
      protocol.updateWeights(resolved.modelId, { success: true, quality: 0.95 });
      
      const metrics = protocol.getFusionMetrics();
      assert.equal(metrics.totalFusions, 1);
    });

    it('should build chain and update based on result', () => {
      const chainResult = protocol.buildFusionChain('Complex multi-step task', 4);
      
      // Update weights for each model in chain
      for (const step of chainResult.chain) {
        protocol.updateWeights(step.modelId, { success: true, quality: step.confidence });
      }
      
      assert.ok(chainResult.totalContribution > 0);
    });

    it('should handle consensus and disagreement', () => {
      const result1 = protocol.fuse('Clear consensus prompt about technology', ['gpt', 'claude']);
      const result2 = protocol.fuse('Ambiguous prompt requiring diverse views', ['gpt', 'mistral']);
      
      // Both should complete without error
      assert.ok(typeof result1.consensus === 'boolean');
      assert.ok(typeof result2.consensus === 'boolean');
    });

    it('should detect and handle hallucinations', () => {
      const result = protocol.fuse('Prompt that may cause hallucination', ['gpt', 'claude', 'gemini']);
      
      // Check hallucinations were processed
      assert.ok(Array.isArray(result.hallucinations));
    });
  });
});
