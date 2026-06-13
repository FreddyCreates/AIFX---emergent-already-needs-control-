/**
 * TOKENOMICS ENGINE — Cognitive Return Per Token Measurement System v1
 *
 * A measurable runtime control system for cognitive return per token in AI agents.
 *
 * Thesis: Token efficiency should not be measured by brevity alone, but by
 * cognitive return per token: the degree to which each token improves decision
 * quality, actionability, risk control, reusable memory, and future system
 * performance.
 *
 * Modules:
 *   1. TokenGovernor       — Controls max token budget by task type
 *   2. SalienceEngine      — Ranks what deserves attention and allocates budget
 *   3. CognitiveReturnScorer — Scores output usefulness after generation
 *   4. CompressionAuditor  — Checks whether shorter output preserved meaning
 *   5. WasteDetector       — Flags redundancy, filler, generic explanation
 *   6. ReuseExtractor      — Pulls out rules/templates/memory from interactions
 *   7. BenchmarkHarness    — Runs tokenomic vs. non-tokenomic comparisons
 *
 * Formula Stack:
 *   TV  = DQ + ACT + RISK + REUSE + LEARN − WASTE
 *   CRPT = TV / Tokens
 *   S   = Urgency + Risk + Mission + Novelty + TimeSensitivity − KnownContext
 *   Budget_i = TotalBudget × (S_i / ΣS)
 *   CE  = (MeaningPreserved + ActionClarity + RiskPreserved) / OutputTokens
 */

const PHI = 1.618033988749895;

// ─── Task Type Budgets ────────────────────────────────────────────────────────

const DEFAULT_BUDGETS = {
  invoice:      { maxTokens: 300,  weights: { wd: 0.3, wa: 0.3, wr: 0.1, wc: 0.1, wm: 0.1, wn: 0.1 } },
  estimating:   { maxTokens: 500,  weights: { wd: 0.25, wa: 0.2, wr: 0.25, wc: 0.1, wm: 0.1, wn: 0.1 } },
  cashflow:     { maxTokens: 400,  weights: { wd: 0.3, wa: 0.2, wr: 0.3, wc: 0.05, wm: 0.05, wn: 0.1 } },
  research:     { maxTokens: 1000, weights: { wd: 0.15, wa: 0.1, wr: 0.1, wc: 0.25, wm: 0.3, wn: 0.1 } },
  architecture: { maxTokens: 800,  weights: { wd: 0.2, wa: 0.15, wr: 0.2, wc: 0.2, wm: 0.15, wn: 0.1 } },
  redteam:      { maxTokens: 600,  weights: { wd: 0.15, wa: 0.1, wr: 0.4, wc: 0.1, wm: 0.1, wn: 0.15 } },
  memory:       { maxTokens: 250,  weights: { wd: 0.1, wa: 0.1, wr: 0.1, wc: 0.2, wm: 0.4, wn: 0.1 } },
  general:      { maxTokens: 600,  weights: { wd: 0.2, wa: 0.2, wr: 0.2, wc: 0.15, wm: 0.15, wn: 0.1 } },
};

// ─── 1. Token Governor ────────────────────────────────────────────────────────

class TokenGovernor {
  constructor(budgets = DEFAULT_BUDGETS) {
    this.budgets = { ...DEFAULT_BUDGETS, ...budgets };
  }

  /**
   * Get the token budget for a task type.
   * @param {string} taskType
   * @returns {{ maxTokens: number, weights: object }}
   */
  getBudget(taskType) {
    return this.budgets[taskType] || this.budgets.general;
  }

  /**
   * Register or override a task type budget.
   * @param {string} taskType
   * @param {number} maxTokens
   * @param {object} weights
   */
  setBudget(taskType, maxTokens, weights) {
    this.budgets[taskType] = { maxTokens, weights };
  }

  /**
   * Check if a token count exceeds budget.
   * @param {string} taskType
   * @param {number} tokenCount
   * @returns {{ withinBudget: boolean, budget: number, overage: number }}
   */
  checkBudget(taskType, tokenCount) {
    const budget = this.getBudget(taskType);
    return {
      withinBudget: tokenCount <= budget.maxTokens,
      budget: budget.maxTokens,
      overage: Math.max(0, tokenCount - budget.maxTokens),
    };
  }
}

// ─── 2. Salience Engine ───────────────────────────────────────────────────────

class SalienceEngine {
  /**
   * Default salience weights (α, β, γ, δ, ε, ζ).
   */
  constructor(weights = {}) {
    this.weights = {
      alpha: weights.alpha ?? 0.2,   // urgency
      beta:  weights.beta  ?? 0.25,  // risk / consequence
      gamma: weights.gamma ?? 0.2,   // mission relevance
      delta: weights.delta ?? 0.15,  // time sensitivity
      epsilon: weights.epsilon ?? 0.15, // novelty / uncertainty
      zeta:  weights.zeta  ?? 0.05,  // known context (subtracted)
    };
  }

  /**
   * Score a single topic's salience.
   * S_i = αU_i + βR_i + γM_i + δT_i + εN_i − ζK_i
   *
   * @param {{ urgency: number, risk: number, mission: number, timeSensitivity: number, novelty: number, knownContext: number }} topic
   * @returns {number} Salience score (can be negative if heavily known)
   */
  scoreTopic(topic) {
    const { alpha, beta, gamma, delta, epsilon, zeta } = this.weights;
    const score =
      alpha   * (topic.urgency ?? 0) +
      beta    * (topic.risk ?? 0) +
      gamma   * (topic.mission ?? 0) +
      delta   * (topic.timeSensitivity ?? 0) +
      epsilon * (topic.novelty ?? 0) -
      zeta    * (topic.knownContext ?? 0);
    return Math.max(0, score);
  }

  /**
   * Rank and allocate budget across topics.
   * Budget_i = TotalBudget × (S_i / ΣS)
   *
   * @param {Array<{ id: string, urgency: number, risk: number, mission: number, timeSensitivity: number, novelty: number, knownContext: number }>} topics
   * @param {number} totalBudget
   * @returns {Array<{ id: string, salience: number, allocatedTokens: number }>}
   */
  allocate(topics, totalBudget) {
    const scored = topics.map(t => ({
      id: t.id,
      salience: this.scoreTopic(t),
    }));

    const totalSalience = scored.reduce((sum, s) => sum + s.salience, 0);

    if (totalSalience === 0) {
      // Equal distribution if no salience signal
      const equal = Math.floor(totalBudget / scored.length);
      return scored.map(s => ({ ...s, allocatedTokens: equal }));
    }

    return scored.map(s => ({
      ...s,
      allocatedTokens: Math.round(totalBudget * (s.salience / totalSalience)),
    }));
  }
}

// ─── 3. Cognitive Return Scorer ───────────────────────────────────────────────

class CognitiveReturnScorer {
  /**
   * Score cognitive return of an output.
   * CR = DQ + ACT + RISK + REUSE + LEARN
   * TV = CR − WASTE
   * CRPT = TV / TotalTokens
   *
   * All metrics scored 0–5.
   *
   * @param {{ decisionQuality: number, actionability: number, riskControl: number, reuseValue: number, learningGain: number, waste: number }} metrics
   * @param {number} totalTokens — prompt tokens + output tokens
   * @returns {{ cognitiveReturn: number, tokenValue: number, crpt: number }}
   */
  score(metrics, totalTokens) {
    const dq    = clamp(metrics.decisionQuality ?? 0, 0, 5);
    const act   = clamp(metrics.actionability ?? 0, 0, 5);
    const risk  = clamp(metrics.riskControl ?? 0, 0, 5);
    const reuse = clamp(metrics.reuseValue ?? 0, 0, 5);
    const learn = clamp(metrics.learningGain ?? 0, 0, 5);
    const waste = clamp(metrics.waste ?? 0, 0, 5);

    const cognitiveReturn = dq + act + risk + reuse + learn;
    const tokenValue = cognitiveReturn - waste;
    const crpt = totalTokens > 0 ? tokenValue / totalTokens : 0;

    return { cognitiveReturn, tokenValue, crpt };
  }

  /**
   * Token Value Function for individual tokens.
   * TV(t) = wd*D + wa*A + wr*R + wc*C + wm*M − wn*N
   *
   * @param {{ decision: number, action: number, riskReduction: number, compression: number, memory: number, noise: number }} dimensions
   * @param {object} weights — { wd, wa, wr, wc, wm, wn }
   * @returns {number}
   */
  tokenValueFunction(dimensions, weights) {
    return (
      (weights.wd ?? 0.2) * (dimensions.decision ?? 0) +
      (weights.wa ?? 0.2) * (dimensions.action ?? 0) +
      (weights.wr ?? 0.2) * (dimensions.riskReduction ?? 0) +
      (weights.wc ?? 0.15) * (dimensions.compression ?? 0) +
      (weights.wm ?? 0.15) * (dimensions.memory ?? 0) -
      (weights.wn ?? 0.1) * (dimensions.noise ?? 0)
    );
  }
}

// ─── 4. Compression Auditor ───────────────────────────────────────────────────

class CompressionAuditor {
  /**
   * Calculate Compression Efficiency Factor.
   * CEF = (MeaningPreserved + ActionClarity + RiskPreserved) / OutputTokens
   *
   * All inputs 0–5. Higher CEF = better compression.
   *
   * @param {{ meaningPreserved: number, actionClarity: number, riskPreserved: number }} quality
   * @param {number} outputTokens
   * @returns {{ cef: number, passed: boolean }}
   */
  audit(quality, outputTokens) {
    const meaning = clamp(quality.meaningPreserved ?? 0, 0, 5);
    const action  = clamp(quality.actionClarity ?? 0, 0, 5);
    const risk    = clamp(quality.riskPreserved ?? 0, 0, 5);

    const numerator = meaning + action + risk;
    const cef = outputTokens > 0 ? numerator / outputTokens : 0;

    // Compression passes if action clarity preserved (can user still act correctly?)
    const passed = action >= 3 && meaning >= 3;

    return { cef, passed, numerator, outputTokens };
  }

  /**
   * Compare two outputs: original vs. compressed.
   * Returns improvement ratio.
   *
   * @param {{ quality: object, tokens: number }} original
   * @param {{ quality: object, tokens: number }} compressed
   * @returns {{ originalCef: number, compressedCef: number, improvement: number, valid: boolean }}
   */
  compare(original, compressed) {
    const orig = this.audit(original.quality, original.tokens);
    const comp = this.audit(compressed.quality, compressed.tokens);

    return {
      originalCef: orig.cef,
      compressedCef: comp.cef,
      improvement: comp.cef > 0 && orig.cef > 0 ? comp.cef / orig.cef : 0,
      valid: comp.passed,
    };
  }
}

// ─── 5. Waste Detector ────────────────────────────────────────────────────────

class WasteDetector {
  constructor() {
    this.wastePatterns = [
      { id: 'restate_context',     label: 'Restates obvious context',              weight: 1.0 },
      { id: 'sounds_smart',        label: 'Sounds smart but does not change action', weight: 0.8 },
      { id: 'structure_no_leverage', label: 'Adds structure without leverage',       weight: 0.7 },
      { id: 'expand_when_execute', label: 'Expands when user needs execution',     weight: 0.9 },
      { id: 'hides_uncertainty',   label: 'Hides uncertainty under clean language', weight: 1.0 },
    ];
  }

  /**
   * Detect waste signals in an output assessment.
   *
   * @param {Array<{ patternId: string, severity: number }>} signals — Each severity 0–5
   * @returns {{ totalWaste: number, signals: Array, wasteRatio: number }}
   */
  detect(signals) {
    let totalWaste = 0;
    const matched = [];

    for (const signal of signals) {
      const pattern = this.wastePatterns.find(p => p.id === signal.patternId);
      if (pattern) {
        const cost = clamp(signal.severity ?? 0, 0, 5) * pattern.weight;
        totalWaste += cost;
        matched.push({ ...pattern, severity: signal.severity, cost });
      }
    }

    // Max possible waste = 5 patterns × severity 5 × max weight 1.0 = 25
    const wasteRatio = totalWaste / 25;

    return { totalWaste, signals: matched, wasteRatio };
  }

  /**
   * Get registered waste patterns.
   */
  getPatterns() {
    return [...this.wastePatterns];
  }

  /**
   * Add a custom waste pattern.
   * @param {string} id
   * @param {string} label
   * @param {number} weight — 0 to 1
   */
  addPattern(id, label, weight = 0.5) {
    this.wastePatterns.push({ id, label, weight: clamp(weight, 0, 1) });
  }
}

// ─── 6. Reuse Extractor ───────────────────────────────────────────────────────

class ReuseExtractor {
  constructor() {
    this.rules = [];
    this.templates = [];
    this.memories = [];
  }

  /**
   * Extract reusable artifacts from an interaction result.
   *
   * @param {{ content: string, taskType: string, score: object }} interaction
   * @returns {{ rules: Array, templates: Array, memories: Array }}
   */
  extract(interaction) {
    const extracted = { rules: [], templates: [], memories: [] };

    // A rule is extracted when reuse value is high
    if (interaction.score && interaction.score.reuseValue >= 4) {
      const rule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content: interaction.content,
        taskType: interaction.taskType,
        createdAt: Date.now(),
        reuseScore: interaction.score.reuseValue,
      };
      extracted.rules.push(rule);
      this.rules.push(rule);
    }

    // A template is extracted when compression + action are both high
    if (interaction.score &&
        interaction.score.reuseValue >= 3 &&
        interaction.score.actionability >= 4) {
      const template = {
        id: `tmpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content: interaction.content,
        taskType: interaction.taskType,
        createdAt: Date.now(),
      };
      extracted.templates.push(template);
      this.templates.push(template);
    }

    // A memory is extracted when learning gain is high
    if (interaction.score && interaction.score.learningGain >= 4) {
      const memory = {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content: interaction.content,
        taskType: interaction.taskType,
        createdAt: Date.now(),
        learningGain: interaction.score.learningGain,
      };
      extracted.memories.push(memory);
      this.memories.push(memory);
    }

    return extracted;
  }

  /**
   * Get all accumulated reusable artifacts.
   */
  getAll() {
    return {
      rules: [...this.rules],
      templates: [...this.templates],
      memories: [...this.memories],
    };
  }

  /**
   * Get rules applicable to a task type.
   */
  getRulesForTask(taskType) {
    return this.rules.filter(r => r.taskType === taskType);
  }

  /**
   * Clear all accumulated artifacts.
   */
  reset() {
    this.rules = [];
    this.templates = [];
    this.memories = [];
  }
}

// ─── 7. Benchmark Harness ─────────────────────────────────────────────────────

class BenchmarkHarness {
  constructor() {
    this.scorer = new CognitiveReturnScorer();
    this.results = [];
  }

  /**
   * Run a benchmark comparison between two systems.
   *
   * Score = DQ + ACT + RISK + REUSE + ACCURACY − WASTE
   * TokenomicGain = (Score_B / Tokens_B) − (Score_A / Tokens_A)
   *
   * @param {{ taskType: string, systemA: { tokens: number, metrics: object }, systemB: { tokens: number, metrics: object } }} benchmark
   * @returns {{ taskType: string, systemA: object, systemB: object, tokenomicGain: number, winner: string }}
   */
  compare(benchmark) {
    const scoreA = this.computeScore(benchmark.systemA.metrics);
    const scoreB = this.computeScore(benchmark.systemB.metrics);

    const efficiencyA = benchmark.systemA.tokens > 0
      ? scoreA / benchmark.systemA.tokens : 0;
    const efficiencyB = benchmark.systemB.tokens > 0
      ? scoreB / benchmark.systemB.tokens : 0;

    const tokenomicGain = efficiencyB - efficiencyA;

    const result = {
      taskType: benchmark.taskType,
      systemA: {
        score: scoreA,
        tokens: benchmark.systemA.tokens,
        efficiency: efficiencyA,
      },
      systemB: {
        score: scoreB,
        tokens: benchmark.systemB.tokens,
        efficiency: efficiencyB,
      },
      tokenomicGain,
      winner: tokenomicGain > 0 ? 'B' : tokenomicGain < 0 ? 'A' : 'tie',
    };

    this.results.push(result);
    return result;
  }

  /**
   * Compute aggregate score for a system output.
   * Score = DQ + ACT + RISK + REUSE + ACCURACY − WASTE
   */
  computeScore(metrics) {
    return (
      clamp(metrics.decisionQuality ?? 0, 0, 5) +
      clamp(metrics.actionability ?? 0, 0, 5) +
      clamp(metrics.riskControl ?? 0, 0, 5) +
      clamp(metrics.reuseValue ?? 0, 0, 5) +
      clamp(metrics.accuracy ?? 0, 0, 5) -
      clamp(metrics.waste ?? 0, 0, 5)
    );
  }

  /**
   * Get summary across all benchmarks run.
   */
  getSummary() {
    if (this.results.length === 0) return null;

    const avgGain = this.results.reduce((s, r) => s + r.tokenomicGain, 0) / this.results.length;
    const wins = { A: 0, B: 0, tie: 0 };
    for (const r of this.results) wins[r.winner]++;

    return {
      totalBenchmarks: this.results.length,
      averageTokenomicGain: avgGain,
      wins,
      tokenomicsWorking: wins.B > wins.A,
    };
  }

  /**
   * Reset benchmark results.
   */
  reset() {
    this.results = [];
  }
}

// ─── Tokenomics Engine (Unified Facade) ───────────────────────────────────────

class TokenomicsEngine {
  constructor(config = {}) {
    this.governor = new TokenGovernor(config.budgets);
    this.salience = new SalienceEngine(config.salienceWeights);
    this.scorer = new CognitiveReturnScorer();
    this.compression = new CompressionAuditor();
    this.waste = new WasteDetector();
    this.reuse = new ReuseExtractor();
    this.benchmark = new BenchmarkHarness();
  }

  /**
   * Full runtime loop for a single task:
   * 1. Classify task → get budget
   * 2. Rank salience across topics
   * 3. Set token budget per topic
   * 4. (Generation happens externally)
   * 5. Score cognitive return
   * 6. Audit compression
   * 7. Detect waste
   * 8. Extract reusable artifacts
   *
   * @param {{ taskType: string, topics: Array, outputTokens: number, promptTokens: number, metrics: object, compressionQuality: object, wasteSignals: Array, content: string }} input
   * @returns {object} Full tokenomics analysis
   */
  analyze(input) {
    const { taskType, topics, outputTokens, promptTokens, metrics, compressionQuality, wasteSignals, content } = input;

    // 1. Budget
    const budget = this.governor.getBudget(taskType);
    const budgetCheck = this.governor.checkBudget(taskType, outputTokens);

    // 2–3. Salience allocation
    const allocation = topics && topics.length > 0
      ? this.salience.allocate(topics, budget.maxTokens)
      : [];

    // 5. Cognitive return
    const totalTokens = (promptTokens ?? 0) + (outputTokens ?? 0);
    const cognitiveReturn = this.scorer.score(metrics, totalTokens);

    // 6. Compression audit
    const compressionAudit = compressionQuality
      ? this.compression.audit(compressionQuality, outputTokens)
      : null;

    // 7. Waste detection
    const wasteReport = wasteSignals && wasteSignals.length > 0
      ? this.waste.detect(wasteSignals)
      : { totalWaste: 0, signals: [], wasteRatio: 0 };

    // 8. Reuse extraction
    const reuseReport = this.reuse.extract({
      content: content ?? '',
      taskType,
      score: metrics,
    });

    return {
      taskType,
      budget: budgetCheck,
      allocation,
      cognitiveReturn,
      compressionAudit,
      wasteReport,
      reuseReport,
      summary: {
        crpt: cognitiveReturn.crpt,
        withinBudget: budgetCheck.withinBudget,
        compressionPassed: compressionAudit ? compressionAudit.passed : null,
        wasteRatio: wasteReport.wasteRatio,
        artifactsExtracted: reuseReport.rules.length + reuseReport.templates.length + reuseReport.memories.length,
      },
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// ─── Singleton ────────────────────────────────────────────────────────────────

const tokenomicsEngine = new TokenomicsEngine();

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
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
};
