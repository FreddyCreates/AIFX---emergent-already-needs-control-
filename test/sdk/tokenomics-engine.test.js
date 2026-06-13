import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { TokenGovernor } from '../../sdk/engines/tokenomics/token-governor.js';
import { SalienceEngine } from '../../sdk/engines/tokenomics/salience-engine.js';
import { CognitiveReturnScorer } from '../../sdk/engines/tokenomics/cognitive-return-scorer.js';
import { CompressionAuditor } from '../../sdk/engines/tokenomics/compression-auditor.js';
import { WasteDetector } from '../../sdk/engines/tokenomics/waste-detector.js';
import { ReuseExtractor, ARTIFACT_TYPES } from '../../sdk/engines/tokenomics/reuse-extractor.js';
import { BenchmarkHarness } from '../../sdk/engines/tokenomics/benchmark-harness.js';
import { TokenomicsEngine } from '../../sdk/engines/tokenomics/tokenomics-engine.js';

describe('TokenGovernor', () => {
  it('allocates budget by task type and risk', () => {
    const gov = new TokenGovernor();
    const budget = gov.allocate('invoice', { risk: 'high', complexity: 1.0 });
    assert.ok(budget.budget > 0);
    assert.ok(budget.ceiling > budget.budget || budget.ceiling === budget.budget);
    assert.equal(budget.taskType, 'invoice');
    assert.equal(budget.risk, 'high');
  });

  it('tracks token consumption', () => {
    const gov = new TokenGovernor();
    gov.allocate('general', { risk: 'medium' });
    const result = gov.consume(100);
    assert.equal(result.remaining, 400); // base 500 - 100
    assert.equal(result.overBudget, false);
  });

  it('detects budget overrun', () => {
    const gov = new TokenGovernor();
    gov.allocate('memory', { risk: 'low' }); // base 300 * 0.8 = 240
    gov.consume(240);
    const result = gov.consume(200);
    assert.equal(result.overBudget, true);
  });

  it('halts at ceiling', () => {
    const gov = new TokenGovernor();
    gov.allocate('memory', { risk: 'low' }); // ceiling 600 * 0.8 = 480
    gov.consume(500);
    const halt = gov.shouldHalt();
    assert.equal(halt.halt, true);
  });

  it('records completion history', () => {
    const gov = new TokenGovernor();
    gov.allocate('research', { risk: 'medium' });
    gov.consume(500);
    const record = gov.complete();
    assert.ok(record.utilization > 0);
    assert.equal(gov.getStats().completedTasks, 1);
  });
});

describe('SalienceEngine', () => {
  it('scores items by salience dimensions', () => {
    const salience = new SalienceEngine();
    const score = salience.score({
      urgency: 5,
      risk: 4,
      mission: 3,
      timeSensitivity: 2,
      novelty: 4,
      knownContext: 1,
    });
    assert.ok(score > 0);
  });

  it('ranks multiple items', () => {
    const salience = new SalienceEngine();
    const ranked = salience.rank([
      { id: 'a', urgency: 1, risk: 1, mission: 1, novelty: 1, knownContext: 0 },
      { id: 'b', urgency: 5, risk: 5, mission: 5, novelty: 5, knownContext: 0 },
    ]);
    assert.equal(ranked[0].item.id, 'b');
    assert.ok(ranked[0].score > ranked[1].score);
  });

  it('allocates budget proportionally', () => {
    const salience = new SalienceEngine();
    const allocation = salience.allocate([
      { id: 'high', urgency: 5, risk: 5, mission: 5, novelty: 5, knownContext: 0 },
      { id: 'low', urgency: 1, risk: 1, mission: 1, novelty: 1, knownContext: 0 },
    ], 1000);
    assert.ok(allocation[0].budget > allocation[1].budget);
    assert.ok(Math.abs(allocation[0].budget + allocation[1].budget - 1000) <= 1);
  });

  it('penalizes known context', () => {
    const salience = new SalienceEngine();
    const withKnown = salience.score({ urgency: 3, risk: 3, knownContext: 5 });
    const withoutKnown = salience.score({ urgency: 3, risk: 3, knownContext: 0 });
    assert.ok(withoutKnown > withKnown);
  });
});

describe('CognitiveReturnScorer', () => {
  it('computes CR and CRPT', () => {
    const scorer = new CognitiveReturnScorer();
    const result = scorer.score({ dq: 5, act: 4, risk: 3, reuse: 2, learn: 1 }, 100);
    assert.equal(result.cr, 15);
    assert.equal(result.crpt, 0.15);
    assert.equal(result.maxPossibleCR, 25);
  });

  it('computes token value with waste penalty', () => {
    const scorer = new CognitiveReturnScorer();
    const tv = scorer.tokenValue({ dq: 5, act: 4, risk: 3, reuse: 2, learn: 1, waste: 3 });
    assert.equal(tv, 12); // 15 - 3
  });

  it('compares two outputs', () => {
    const scorer = new CognitiveReturnScorer();
    const result = scorer.compare(
      { scores: { dq: 3, act: 3, risk: 3, reuse: 1, learn: 1 }, totalTokens: 500 },
      { scores: { dq: 4, act: 4, risk: 4, reuse: 3, learn: 2 }, totalTokens: 200 },
    );
    assert.equal(result.winner, 'B');
    assert.ok(result.gain > 0);
  });

  it('clamps scores to max', () => {
    const scorer = new CognitiveReturnScorer();
    const result = scorer.score({ dq: 10, act: 10, risk: 10, reuse: 10, learn: 10 }, 100);
    assert.equal(result.cr, 25); // all clamped to 5
  });
});

describe('CompressionAuditor', () => {
  it('passes valid compression', () => {
    const auditor = new CompressionAuditor();
    const result = auditor.audit({
      informationRetained: 5,
      actionClarity: 5,
      riskPreserved: 4,
      outputTokens: 50,
    });
    assert.equal(result.pass, true);
    assert.equal(result.verdict, 'compression_valid');
    assert.ok(result.cef > 0);
  });

  it('fails when risk is hidden', () => {
    const auditor = new CompressionAuditor();
    const result = auditor.audit({
      informationRetained: 4,
      actionClarity: 4,
      riskPreserved: 1,
      outputTokens: 50,
    });
    assert.equal(result.pass, false);
    assert.ok(result.issues.includes('risk_hidden'));
    assert.equal(result.verdict, 'dangerous_compression');
  });

  it('compares original vs compressed versions', () => {
    const auditor = new CompressionAuditor();
    const result = auditor.compareVersions(
      { meaning: 5, action: 5, risk: 5, tokens: 500 },
      { meaning: 4, action: 5, risk: 4, tokens: 100 },
    );
    assert.equal(result.recommendation, 'use_compressed');
    assert.equal(result.tokenSavings, 400);
  });
});

describe('WasteDetector', () => {
  it('detects clean output', () => {
    const detector = new WasteDetector();
    const result = detector.detect({
      segments: [
        { text: 'Ship the invoice by Friday', tokens: 6 },
      ],
      context: {},
    });
    assert.equal(result.clean, true);
    assert.equal(result.wasteTokens, 0);
  });

  it('detects restated known context', () => {
    const detector = new WasteDetector();
    const result = detector.detect({
      segments: [
        { text: 'The project deadline is Friday and the budget is 5000', tokens: 10 },
      ],
      context: { knownContext: 'The project deadline is Friday and the budget is 5000' },
    });
    assert.equal(result.clean, false);
    assert.ok(result.flags.length > 0);
  });

  it('detects expansion over execution', () => {
    const detector = new WasteDetector();
    const result = detector.detect({
      segments: [
        { text: 'Here is an explanation of the concept...', tokens: 20, type: 'explanation' },
      ],
      context: { userIntent: 'execute' },
    });
    assert.equal(result.clean, false);
    assert.ok(result.flags[0].flags.includes('expansion_over_execution'));
  });
});

describe('ReuseExtractor', () => {
  it('extracts rule from high-DQ interaction', () => {
    const extractor = new ReuseExtractor({ minCR: 12 });
    const artifacts = extractor.extract({
      id: 'test-1',
      taskType: 'cashflow',
      input: { condition: 'payment_pending' },
      output: { decision: 'Do not schedule crew until payment clears' },
      scores: { dq: 5, act: 4, risk: 4, reuse: 3, learn: 2 },
    });
    assert.ok(artifacts.length > 0);
    assert.equal(artifacts[0].type, ARTIFACT_TYPES.RULE);
  });

  it('does not extract from low-CR interactions', () => {
    const extractor = new ReuseExtractor({ minCR: 15 });
    const artifacts = extractor.extract({
      id: 'test-2',
      taskType: 'general',
      input: {},
      output: { text: 'OK' },
      scores: { dq: 1, act: 1, risk: 1, reuse: 1, learn: 1 },
    });
    assert.equal(artifacts.length, 0);
  });

  it('deduplicates identical artifacts', () => {
    const extractor = new ReuseExtractor({ minCR: 12 });
    const interaction = {
      id: 'test-3',
      taskType: 'cashflow',
      input: { condition: 'payment_pending' },
      output: { decision: 'Wait for payment' },
      scores: { dq: 5, act: 4, risk: 4, reuse: 3, learn: 2 },
    };
    extractor.extract(interaction);
    const second = extractor.extract({ ...interaction, id: 'test-4' });
    assert.equal(second.length, 0);
  });
});

describe('BenchmarkHarness', () => {
  it('compares tokenomic vs baseline', () => {
    const harness = new BenchmarkHarness();
    const result = harness.run({
      taskClass: 'invoice',
      systemA: { scores: { dq: 3, act: 3, risk: 2, reuse: 1, accuracy: 4, waste: 2 }, tokens: 500 },
      systemB: { scores: { dq: 4, act: 4, risk: 3, reuse: 3, accuracy: 4, waste: 0 }, tokens: 200 },
    });
    assert.equal(result.winner, 'tokenomic');
    assert.ok(result.tokenomicGain > 0);
  });

  it('generates aggregate report', () => {
    const harness = new BenchmarkHarness();
    harness.run({
      taskClass: 'research',
      systemA: { scores: { dq: 3, act: 2, risk: 2, reuse: 1, accuracy: 3, waste: 1 }, tokens: 800 },
      systemB: { scores: { dq: 4, act: 4, risk: 3, reuse: 4, accuracy: 4, waste: 0 }, tokens: 300 },
    });
    harness.run({
      taskClass: 'estimating',
      systemA: { scores: { dq: 4, act: 3, risk: 3, reuse: 2, accuracy: 4, waste: 0 }, tokens: 400 },
      systemB: { scores: { dq: 4, act: 4, risk: 3, reuse: 3, accuracy: 4, waste: 0 }, tokens: 350 },
    });
    const report = harness.getReport();
    assert.equal(report.count, 2);
    assert.ok(report.avgGain > 0);
  });
});

describe('TokenomicsEngine (orchestrator)', () => {
  it('runs full plan → track → evaluate cycle', () => {
    const engine = new TokenomicsEngine();

    // Plan phase
    const plan = engine.plan({
      type: 'invoice',
      risk: 'medium',
      complexity: 1.0,
      items: [
        { id: 'balance', urgency: 5, risk: 4, mission: 5, novelty: 1, knownContext: 0 },
        { id: 'header', urgency: 1, risk: 0, mission: 1, novelty: 0, knownContext: 4 },
      ],
    });

    assert.ok(plan.budget.budget > 0);
    assert.ok(plan.salienceAllocation.length === 2);
    assert.ok(plan.salienceAllocation[0].budget > plan.salienceAllocation[1].budget);

    // Track phase
    const tracking = engine.track(150);
    assert.ok(tracking.remaining > 0);
    assert.equal(tracking.shouldHalt, false);

    // Evaluate phase
    const cycle = engine.evaluate({
      scores: { dq: 4, act: 5, risk: 3, reuse: 2, learn: 1 },
      promptTokens: 200,
      outputTokens: 150,
      compression: {
        informationRetained: 4,
        actionClarity: 5,
        riskPreserved: 3,
      },
    });

    assert.ok(cycle.cognitiveReturn.crpt > 0);
    assert.ok(cycle.compressionAudit.pass);
    assert.ok(cycle.budgetRecord.utilization > 0);
  });

  it('reports status across all modules', () => {
    const engine = new TokenomicsEngine();
    engine.plan({ type: 'general', risk: 'low' });
    engine.track(50);
    engine.evaluate({
      scores: { dq: 3, act: 3, risk: 3, reuse: 2, learn: 2 },
      promptTokens: 100,
      outputTokens: 50,
    });

    const status = engine.getStatus();
    assert.equal(status.cycles, 1);
    assert.ok(status.governor.completedTasks === 1);
    assert.ok(status.scorer.count === 1);
  });

  it('provides last cycle metrics', () => {
    const engine = new TokenomicsEngine();
    engine.plan({ type: 'research', risk: 'high', complexity: 1.5 });
    engine.track(400);
    engine.evaluate({
      scores: { dq: 5, act: 4, risk: 4, reuse: 3, learn: 3 },
      promptTokens: 300,
      outputTokens: 400,
    });

    const metrics = engine.getLastCycleMetrics();
    assert.ok(metrics.crpt > 0);
    assert.ok(metrics.budgetUtilization > 0);
  });
});
