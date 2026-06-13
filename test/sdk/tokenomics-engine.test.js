/**
 * Tokenomics Engine — Test Suite
 *
 * Tests all 7 modules:
 *   1. TokenGovernor
 *   2. SalienceEngine
 *   3. CognitiveReturnScorer
 *   4. CompressionAuditor
 *   5. WasteDetector
 *   6. ReuseExtractor
 *   7. BenchmarkHarness
 *   + TokenomicsEngine (unified facade)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  TokenomicsEngine,
  TokenGovernor,
  SalienceEngine,
  CognitiveReturnScorer,
  CompressionAuditor,
  WasteDetector,
  ReuseExtractor,
  BenchmarkHarness,
  tokenomicsEngine,
  DEFAULT_BUDGETS,
  clamp,
} from '../../sdk/engines/tokenomics-engine.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

describe('Tokenomics Engine — Helpers', () => {
  it('clamp restricts values to range', () => {
    assert.equal(clamp(10, 0, 5), 5);
    assert.equal(clamp(-2, 0, 5), 0);
    assert.equal(clamp(3, 0, 5), 3);
  });
});

// ─── 1. TokenGovernor ─────────────────────────────────────────────────────────

describe('TokenGovernor', () => {
  let gov;

  beforeEach(() => {
    gov = new TokenGovernor();
  });

  it('returns default budget for known task types', () => {
    const budget = gov.getBudget('invoice');
    assert.equal(budget.maxTokens, 300);
    assert.ok(budget.weights);
    assert.equal(typeof budget.weights.wd, 'number');
  });

  it('returns general budget for unknown task types', () => {
    const budget = gov.getBudget('unknown_task');
    assert.equal(budget.maxTokens, DEFAULT_BUDGETS.general.maxTokens);
  });

  it('checks budget compliance correctly', () => {
    const within = gov.checkBudget('invoice', 250);
    assert.equal(within.withinBudget, true);
    assert.equal(within.overage, 0);

    const over = gov.checkBudget('invoice', 500);
    assert.equal(over.withinBudget, false);
    assert.equal(over.overage, 200);
  });

  it('allows setting custom budgets', () => {
    gov.setBudget('custom', 999, { wd: 0.5, wa: 0.5, wr: 0, wc: 0, wm: 0, wn: 0 });
    const budget = gov.getBudget('custom');
    assert.equal(budget.maxTokens, 999);
    assert.equal(budget.weights.wd, 0.5);
  });

  it('covers all default task types', () => {
    const expectedTypes = ['invoice', 'estimating', 'cashflow', 'research', 'architecture', 'redteam', 'memory', 'general'];
    for (const type of expectedTypes) {
      const budget = gov.getBudget(type);
      assert.ok(budget.maxTokens > 0, `${type} should have maxTokens > 0`);
    }
  });
});

// ─── 2. SalienceEngine ────────────────────────────────────────────────────────

describe('SalienceEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new SalienceEngine();
  });

  it('scores a topic with all dimensions', () => {
    const score = engine.scoreTopic({
      urgency: 5,
      risk: 4,
      mission: 3,
      timeSensitivity: 2,
      novelty: 4,
      knownContext: 1,
    });
    assert.ok(score > 0);
  });

  it('returns 0 for heavily known context with low other dimensions', () => {
    const score = engine.scoreTopic({
      urgency: 0,
      risk: 0,
      mission: 0,
      timeSensitivity: 0,
      novelty: 0,
      knownContext: 100,
    });
    assert.equal(score, 0); // clamped to 0
  });

  it('allocates budget proportionally to salience', () => {
    const topics = [
      { id: 'critical', urgency: 5, risk: 5, mission: 5, timeSensitivity: 5, novelty: 5, knownContext: 0 },
      { id: 'low', urgency: 1, risk: 1, mission: 1, timeSensitivity: 1, novelty: 1, knownContext: 0 },
    ];
    const allocation = engine.allocate(topics, 1000);

    assert.equal(allocation.length, 2);
    assert.ok(allocation[0].allocatedTokens > allocation[1].allocatedTokens);
    // Total should approximately equal budget
    const total = allocation.reduce((s, a) => s + a.allocatedTokens, 0);
    assert.ok(Math.abs(total - 1000) <= 1); // rounding tolerance
  });

  it('distributes equally when all salience is 0', () => {
    const topics = [
      { id: 'a', urgency: 0, risk: 0, mission: 0, timeSensitivity: 0, novelty: 0, knownContext: 0 },
      { id: 'b', urgency: 0, risk: 0, mission: 0, timeSensitivity: 0, novelty: 0, knownContext: 0 },
    ];
    const allocation = engine.allocate(topics, 1000);
    assert.equal(allocation[0].allocatedTokens, 500);
    assert.equal(allocation[1].allocatedTokens, 500);
  });

  it('supports custom weights', () => {
    const custom = new SalienceEngine({ alpha: 1.0, beta: 0, gamma: 0, delta: 0, epsilon: 0, zeta: 0 });
    const score = custom.scoreTopic({ urgency: 5, risk: 5, mission: 5, timeSensitivity: 5, novelty: 5, knownContext: 5 });
    // Only urgency counts: 1.0 * 5 = 5
    assert.equal(score, 5);
  });
});

// ─── 3. CognitiveReturnScorer ─────────────────────────────────────────────────

describe('CognitiveReturnScorer', () => {
  let scorer;

  beforeEach(() => {
    scorer = new CognitiveReturnScorer();
  });

  it('computes cognitive return correctly', () => {
    const result = scorer.score({
      decisionQuality: 4,
      actionability: 5,
      riskControl: 3,
      reuseValue: 2,
      learningGain: 3,
      waste: 1,
    }, 100);

    assert.equal(result.cognitiveReturn, 4 + 5 + 3 + 2 + 3); // 17
    assert.equal(result.tokenValue, 17 - 1); // 16
    assert.equal(result.crpt, 16 / 100); // 0.16
  });

  it('clamps metrics to 0-5 range', () => {
    const result = scorer.score({
      decisionQuality: 10,
      actionability: -3,
      riskControl: 5,
      reuseValue: 5,
      learningGain: 5,
      waste: 0,
    }, 50);

    assert.equal(result.cognitiveReturn, 5 + 0 + 5 + 5 + 5); // 20
  });

  it('returns 0 CRPT when tokens is 0', () => {
    const result = scorer.score({ decisionQuality: 5 }, 0);
    assert.equal(result.crpt, 0);
  });

  it('computes token value function for individual tokens', () => {
    const tv = scorer.tokenValueFunction(
      { decision: 4, action: 3, riskReduction: 5, compression: 2, memory: 1, noise: 2 },
      { wd: 0.3, wa: 0.2, wr: 0.2, wc: 0.1, wm: 0.1, wn: 0.1 }
    );
    // 0.3*4 + 0.2*3 + 0.2*5 + 0.1*2 + 0.1*1 - 0.1*2
    // 1.2 + 0.6 + 1.0 + 0.2 + 0.1 - 0.2 = 2.9
    assert.ok(Math.abs(tv - 2.9) < 0.001);
  });

  it('handles missing dimensions gracefully', () => {
    const result = scorer.score({}, 100);
    assert.equal(result.cognitiveReturn, 0);
    assert.equal(result.tokenValue, 0);
    assert.equal(result.crpt, 0);
  });
});

// ─── 4. CompressionAuditor ────────────────────────────────────────────────────

describe('CompressionAuditor', () => {
  let auditor;

  beforeEach(() => {
    auditor = new CompressionAuditor();
  });

  it('computes CEF correctly', () => {
    const result = auditor.audit({ meaningPreserved: 5, actionClarity: 4, riskPreserved: 3 }, 100);
    assert.equal(result.cef, 12 / 100);
    assert.equal(result.passed, true); // action 4 >= 3, meaning 5 >= 3
  });

  it('fails when action clarity is low', () => {
    const result = auditor.audit({ meaningPreserved: 5, actionClarity: 2, riskPreserved: 5 }, 50);
    assert.equal(result.passed, false);
  });

  it('fails when meaning is low', () => {
    const result = auditor.audit({ meaningPreserved: 2, actionClarity: 5, riskPreserved: 5 }, 50);
    assert.equal(result.passed, false);
  });

  it('compares original vs compressed', () => {
    const result = auditor.compare(
      { quality: { meaningPreserved: 4, actionClarity: 4, riskPreserved: 4 }, tokens: 500 },
      { quality: { meaningPreserved: 4, actionClarity: 4, riskPreserved: 4 }, tokens: 200 }
    );
    assert.ok(result.compressedCef > result.originalCef);
    assert.ok(result.improvement > 1); // compressed is better
    assert.equal(result.valid, true);
  });

  it('returns 0 CEF for 0 tokens', () => {
    const result = auditor.audit({ meaningPreserved: 5, actionClarity: 5, riskPreserved: 5 }, 0);
    assert.equal(result.cef, 0);
  });
});

// ─── 5. WasteDetector ─────────────────────────────────────────────────────────

describe('WasteDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new WasteDetector();
  });

  it('detects waste signals and computes cost', () => {
    const result = detector.detect([
      { patternId: 'restate_context', severity: 4 },
      { patternId: 'sounds_smart', severity: 3 },
    ]);
    assert.ok(result.totalWaste > 0);
    assert.equal(result.signals.length, 2);
    assert.ok(result.wasteRatio > 0 && result.wasteRatio <= 1);
  });

  it('returns 0 waste for empty signals', () => {
    const result = detector.detect([]);
    assert.equal(result.totalWaste, 0);
    assert.equal(result.wasteRatio, 0);
  });

  it('ignores unknown pattern IDs', () => {
    const result = detector.detect([{ patternId: 'nonexistent', severity: 5 }]);
    assert.equal(result.totalWaste, 0);
  });

  it('lists all default patterns', () => {
    const patterns = detector.getPatterns();
    assert.equal(patterns.length, 5);
    assert.ok(patterns.find(p => p.id === 'restate_context'));
    assert.ok(patterns.find(p => p.id === 'hides_uncertainty'));
  });

  it('allows adding custom patterns', () => {
    detector.addPattern('verbose_apology', 'Starts with unnecessary apology', 0.6);
    const patterns = detector.getPatterns();
    assert.equal(patterns.length, 6);

    const result = detector.detect([{ patternId: 'verbose_apology', severity: 5 }]);
    assert.ok(result.totalWaste > 0);
  });

  it('clamps severity to 0-5', () => {
    const result = detector.detect([{ patternId: 'restate_context', severity: 100 }]);
    // weight 1.0 * clamped severity 5 = 5
    assert.equal(result.signals[0].cost, 5);
  });
});

// ─── 6. ReuseExtractor ────────────────────────────────────────────────────────

describe('ReuseExtractor', () => {
  let extractor;

  beforeEach(() => {
    extractor = new ReuseExtractor();
  });

  it('extracts a rule when reuseValue >= 4', () => {
    const result = extractor.extract({
      content: 'Always validate before commit',
      taskType: 'architecture',
      score: { reuseValue: 4, actionability: 3, learningGain: 2 },
    });
    assert.equal(result.rules.length, 1);
    assert.equal(result.rules[0].taskType, 'architecture');
  });

  it('extracts a template when reuseValue >= 3 and actionability >= 4', () => {
    const result = extractor.extract({
      content: 'Template: invoice → validate → send',
      taskType: 'invoice',
      score: { reuseValue: 3, actionability: 4, learningGain: 2 },
    });
    assert.equal(result.templates.length, 1);
  });

  it('extracts a memory when learningGain >= 4', () => {
    const result = extractor.extract({
      content: 'Learned: batch queries reduce latency 3x',
      taskType: 'research',
      score: { reuseValue: 2, actionability: 3, learningGain: 5 },
    });
    assert.equal(result.memories.length, 1);
  });

  it('extracts nothing when scores are low', () => {
    const result = extractor.extract({
      content: 'Low quality output',
      taskType: 'general',
      score: { reuseValue: 1, actionability: 1, learningGain: 1 },
    });
    assert.equal(result.rules.length, 0);
    assert.equal(result.templates.length, 0);
    assert.equal(result.memories.length, 0);
  });

  it('accumulates across multiple extractions', () => {
    extractor.extract({ content: 'r1', taskType: 'a', score: { reuseValue: 5, actionability: 2, learningGain: 2 } });
    extractor.extract({ content: 'r2', taskType: 'b', score: { reuseValue: 4, actionability: 2, learningGain: 5 } });

    const all = extractor.getAll();
    assert.equal(all.rules.length, 2);
    assert.equal(all.memories.length, 1);
  });

  it('filters rules by task type', () => {
    extractor.extract({ content: 'r1', taskType: 'invoice', score: { reuseValue: 5, actionability: 2, learningGain: 2 } });
    extractor.extract({ content: 'r2', taskType: 'research', score: { reuseValue: 5, actionability: 2, learningGain: 2 } });

    const invoiceRules = extractor.getRulesForTask('invoice');
    assert.equal(invoiceRules.length, 1);
    assert.equal(invoiceRules[0].content, 'r1');
  });

  it('resets correctly', () => {
    extractor.extract({ content: 'r', taskType: 'a', score: { reuseValue: 5, actionability: 5, learningGain: 5 } });
    extractor.reset();
    const all = extractor.getAll();
    assert.equal(all.rules.length, 0);
    assert.equal(all.templates.length, 0);
    assert.equal(all.memories.length, 0);
  });
});

// ─── 7. BenchmarkHarness ──────────────────────────────────────────────────────

describe('BenchmarkHarness', () => {
  let harness;

  beforeEach(() => {
    harness = new BenchmarkHarness();
  });

  it('compares two systems and declares winner', () => {
    const result = harness.compare({
      taskType: 'invoice',
      systemA: {
        tokens: 500,
        metrics: { decisionQuality: 3, actionability: 3, riskControl: 2, reuseValue: 1, accuracy: 3, waste: 2 },
      },
      systemB: {
        tokens: 200,
        metrics: { decisionQuality: 4, actionability: 4, riskControl: 3, reuseValue: 3, accuracy: 4, waste: 1 },
      },
    });

    assert.equal(result.winner, 'B');
    assert.ok(result.tokenomicGain > 0);
    assert.ok(result.systemB.efficiency > result.systemA.efficiency);
  });

  it('declares tie when efficiencies are equal', () => {
    const result = harness.compare({
      taskType: 'general',
      systemA: { tokens: 100, metrics: { decisionQuality: 5, actionability: 5, riskControl: 5, reuseValue: 5, accuracy: 5, waste: 0 } },
      systemB: { tokens: 100, metrics: { decisionQuality: 5, actionability: 5, riskControl: 5, reuseValue: 5, accuracy: 5, waste: 0 } },
    });
    assert.equal(result.winner, 'tie');
    assert.equal(result.tokenomicGain, 0);
  });

  it('computes aggregate score correctly', () => {
    const score = harness.computeScore({
      decisionQuality: 4,
      actionability: 3,
      riskControl: 5,
      reuseValue: 2,
      accuracy: 4,
      waste: 3,
    });
    // 4+3+5+2+4-3 = 15
    assert.equal(score, 15);
  });

  it('provides summary across multiple benchmarks', () => {
    harness.compare({
      taskType: 'invoice',
      systemA: { tokens: 500, metrics: { decisionQuality: 3, actionability: 3, riskControl: 2, reuseValue: 1, accuracy: 3, waste: 2 } },
      systemB: { tokens: 200, metrics: { decisionQuality: 4, actionability: 4, riskControl: 3, reuseValue: 3, accuracy: 4, waste: 1 } },
    });
    harness.compare({
      taskType: 'research',
      systemA: { tokens: 800, metrics: { decisionQuality: 4, actionability: 2, riskControl: 3, reuseValue: 4, accuracy: 4, waste: 1 } },
      systemB: { tokens: 400, metrics: { decisionQuality: 4, actionability: 3, riskControl: 3, reuseValue: 4, accuracy: 4, waste: 0 } },
    });

    const summary = harness.getSummary();
    assert.equal(summary.totalBenchmarks, 2);
    assert.ok(summary.averageTokenomicGain > 0);
    assert.equal(summary.wins.B, 2);
    assert.equal(summary.tokenomicsWorking, true);
  });

  it('returns null summary when no benchmarks run', () => {
    assert.equal(harness.getSummary(), null);
  });
});

// ─── TokenomicsEngine (Unified Facade) ────────────────────────────────────────

describe('TokenomicsEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new TokenomicsEngine();
  });

  it('performs full analysis pipeline', () => {
    const result = engine.analyze({
      taskType: 'architecture',
      topics: [
        { id: 'design', urgency: 4, risk: 3, mission: 5, timeSensitivity: 2, novelty: 4, knownContext: 1 },
        { id: 'testing', urgency: 2, risk: 2, mission: 3, timeSensitivity: 1, novelty: 2, knownContext: 3 },
      ],
      outputTokens: 600,
      promptTokens: 200,
      metrics: {
        decisionQuality: 4,
        actionability: 4,
        riskControl: 3,
        reuseValue: 4,
        learningGain: 3,
        waste: 1,
      },
      compressionQuality: {
        meaningPreserved: 4,
        actionClarity: 4,
        riskPreserved: 3,
      },
      wasteSignals: [
        { patternId: 'restate_context', severity: 2 },
      ],
      content: 'Use event sourcing with CQRS for the module',
    });

    // Verify structure
    assert.ok(result.budget);
    assert.ok(result.allocation);
    assert.ok(result.cognitiveReturn);
    assert.ok(result.compressionAudit);
    assert.ok(result.wasteReport);
    assert.ok(result.reuseReport);
    assert.ok(result.summary);

    // Budget check
    assert.equal(result.budget.budget, 800); // architecture = 800
    assert.equal(result.budget.withinBudget, true);

    // Salience allocation gave more to 'design'
    assert.ok(result.allocation[0].allocatedTokens > result.allocation[1].allocatedTokens);

    // Cognitive return
    assert.ok(result.cognitiveReturn.crpt > 0);

    // Compression passed
    assert.equal(result.compressionAudit.passed, true);

    // Summary
    assert.ok(result.summary.crpt > 0);
    assert.equal(result.summary.withinBudget, true);
    assert.equal(result.summary.compressionPassed, true);
  });

  it('handles minimal input gracefully', () => {
    const result = engine.analyze({
      taskType: 'general',
      topics: [],
      outputTokens: 100,
      promptTokens: 50,
      metrics: { decisionQuality: 3, actionability: 3 },
    });

    assert.ok(result.budget);
    assert.equal(result.allocation.length, 0);
    assert.ok(result.cognitiveReturn.crpt >= 0);
    assert.equal(result.compressionAudit, null);
  });

  it('singleton instance works', () => {
    assert.ok(tokenomicsEngine instanceof TokenomicsEngine);
    const result = tokenomicsEngine.analyze({
      taskType: 'memory',
      topics: [],
      outputTokens: 50,
      promptTokens: 20,
      metrics: { reuseValue: 5, learningGain: 4 },
      content: 'Always validate inputs',
    });
    assert.ok(result.summary.crpt >= 0);
  });
});

// ─── Integration: End-to-End Tokenomics Benchmark ─────────────────────────────

describe('Tokenomics — End-to-End Benchmark', () => {
  it('proves tokenomic system outperforms non-tokenomic across task types', () => {
    const harness = new BenchmarkHarness();

    // Invoice task
    harness.compare({
      taskType: 'invoice',
      systemA: { tokens: 450, metrics: { decisionQuality: 3, actionability: 3, riskControl: 2, reuseValue: 1, accuracy: 3, waste: 2 } },
      systemB: { tokens: 180, metrics: { decisionQuality: 4, actionability: 4, riskControl: 3, reuseValue: 2, accuracy: 4, waste: 0 } },
    });

    // Estimating task
    harness.compare({
      taskType: 'estimating',
      systemA: { tokens: 700, metrics: { decisionQuality: 3, actionability: 2, riskControl: 2, reuseValue: 1, accuracy: 3, waste: 3 } },
      systemB: { tokens: 350, metrics: { decisionQuality: 4, actionability: 3, riskControl: 4, reuseValue: 2, accuracy: 4, waste: 1 } },
    });

    // Architecture task
    harness.compare({
      taskType: 'architecture',
      systemA: { tokens: 1200, metrics: { decisionQuality: 4, actionability: 3, riskControl: 3, reuseValue: 2, accuracy: 4, waste: 2 } },
      systemB: { tokens: 600, metrics: { decisionQuality: 4, actionability: 4, riskControl: 4, reuseValue: 4, accuracy: 4, waste: 1 } },
    });

    // Red-team task
    harness.compare({
      taskType: 'redteam',
      systemA: { tokens: 800, metrics: { decisionQuality: 3, actionability: 2, riskControl: 4, reuseValue: 1, accuracy: 3, waste: 2 } },
      systemB: { tokens: 400, metrics: { decisionQuality: 4, actionability: 3, riskControl: 5, reuseValue: 3, accuracy: 4, waste: 0 } },
    });

    // Memory task
    harness.compare({
      taskType: 'memory',
      systemA: { tokens: 300, metrics: { decisionQuality: 2, actionability: 2, riskControl: 1, reuseValue: 2, accuracy: 2, waste: 3 } },
      systemB: { tokens: 120, metrics: { decisionQuality: 3, actionability: 3, riskControl: 2, reuseValue: 5, accuracy: 3, waste: 0 } },
    });

    const summary = harness.getSummary();
    assert.equal(summary.totalBenchmarks, 5);
    assert.equal(summary.wins.B, 5);
    assert.equal(summary.tokenomicsWorking, true);
    assert.ok(summary.averageTokenomicGain > 0);
  });
});
