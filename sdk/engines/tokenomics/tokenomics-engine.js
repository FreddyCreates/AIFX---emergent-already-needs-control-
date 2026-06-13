/**
 * TOKENOMICS ENGINE
 *
 * The main orchestrator for cognitive resource allocation.
 * Implements the full runtime measurement loop:
 *
 *   1. Classify the task
 *   2. Estimate task risk and complexity
 *   3. Rank salience targets
 *   4. Allocate token budget
 *   5. Recruit only necessary modules
 *   6. Generate the response or artifact
 *   7. Audit compression quality
 *   8. Score cognitive return
 *   9. Detect wasted tokens
 *  10. Extract reusable rules or memory
 *  11. Update future token allocation policy
 *
 * Core thesis:
 *   Reasoning can be deep internally, but expression must be economically governed.
 *   Do not optimize for fewer tokens. Optimize for higher-value tokens.
 */

import { TokenGovernor } from './token-governor.js';
import { SalienceEngine } from './salience-engine.js';
import { CognitiveReturnScorer } from './cognitive-return-scorer.js';
import { CompressionAuditor } from './compression-auditor.js';
import { WasteDetector } from './waste-detector.js';
import { ReuseExtractor } from './reuse-extractor.js';
import { BenchmarkHarness } from './benchmark-harness.js';

class TokenomicsEngine {
  constructor(options = {}) {
    this.governor = options.governor || new TokenGovernor(options.governorOptions || {});
    this.salience = options.salience || new SalienceEngine(options.salienceOptions || {});
    this.scorer = options.scorer || new CognitiveReturnScorer(options.scorerOptions || {});
    this.compression = options.compression || new CompressionAuditor(options.compressionOptions || {});
    this.waste = options.waste || new WasteDetector(options.wasteOptions || {});
    this.reuse = options.reuse || new ReuseExtractor(options.reuseOptions || {});
    this.benchmark = options.benchmark || new BenchmarkHarness(options.benchmarkOptions || {});

    this.cycles = [];
    this.policyAdjustments = [];
  }

  // ── Step 1–4: Pre-Generation Phase ─────────────────────────────────────

  /**
   * Plan a task: classify, rank salience, allocate budget.
   * Call this BEFORE generating output.
   *
   * @param {object} task
   * @param {string} task.type - Task classification (invoice, estimating, etc.)
   * @param {string} task.risk - Risk level (low, medium, high, critical)
   * @param {number} task.complexity - Complexity factor (0.5–2.0)
   * @param {Array<object>} task.items - Information items to rank by salience
   * @returns {{ budget, salienceAllocation, plan }}
   */
  plan(task) {
    // Step 1–2: Classify and estimate
    const budget = this.governor.allocate(task.type, {
      risk: task.risk || 'medium',
      complexity: task.complexity || 1.0,
    });

    // Step 3–4: Rank salience and allocate
    let salienceAllocation = [];
    if (task.items && task.items.length > 0) {
      salienceAllocation = this.salience.allocate(task.items, budget.budget);
    }

    const plan = {
      taskType: task.type,
      risk: task.risk || 'medium',
      budget,
      salienceAllocation,
      plannedAt: Date.now(),
    };

    return plan;
  }

  // ── Step 5–6: Generation Phase (external) ──────────────────────────────

  /**
   * Track token consumption during generation.
   * @param {number} tokens - Tokens consumed so far
   * @returns {{ remaining, overBudget, shouldHalt }}
   */
  track(tokens) {
    const consumption = this.governor.consume(tokens);
    const halt = this.governor.shouldHalt();
    return { ...consumption, shouldHalt: halt.halt, haltReason: halt.reason };
  }

  // ── Step 7–10: Post-Generation Evaluation ──────────────────────────────

  /**
   * Evaluate generated output.
   * Call this AFTER generating output.
   *
   * @param {object} evaluation
   * @param {object} evaluation.scores - { dq, act, risk, reuse, learn, waste }
   * @param {number} evaluation.promptTokens - Tokens in prompt
   * @param {number} evaluation.outputTokens - Tokens in output
   * @param {object} [evaluation.compression] - { informationRetained, actionClarity, riskPreserved }
   * @param {object} [evaluation.segments] - For waste detection
   * @param {object} [evaluation.context] - Task context for waste detection
   * @param {object} [evaluation.interaction] - Full interaction for reuse extraction
   * @returns {{ cognitiveReturn, compressionAudit, wasteAnalysis, extractedArtifacts, cycle }}
   */
  evaluate(evaluation) {
    const totalTokens = (evaluation.promptTokens || 0) + (evaluation.outputTokens || 0);

    // Step 8: Score cognitive return
    const cognitiveReturn = this.scorer.score(evaluation.scores, totalTokens);

    // Step 7: Audit compression
    let compressionAudit = null;
    if (evaluation.compression) {
      compressionAudit = this.compression.audit({
        ...evaluation.compression,
        outputTokens: evaluation.outputTokens,
      });
    }

    // Step 9: Detect waste
    let wasteAnalysis = null;
    if (evaluation.segments) {
      wasteAnalysis = this.waste.detect({
        segments: evaluation.segments,
        context: evaluation.context || {},
      });
    }

    // Step 10: Extract reusable artifacts
    let extractedArtifacts = [];
    if (evaluation.interaction) {
      extractedArtifacts = this.reuse.extract(evaluation.interaction);
    }

    // Complete budget cycle
    const budgetRecord = this.governor.complete();

    // Record full cycle
    const cycle = {
      cognitiveReturn,
      compressionAudit,
      wasteAnalysis,
      extractedArtifacts,
      budgetRecord,
      timestamp: Date.now(),
    };

    this.cycles.push(cycle);

    // Step 11: Update policy
    this._updatePolicy(cycle);

    return cycle;
  }

  // ── Step 11: Policy Updates ────────────────────────────────────────────

  _updatePolicy(cycle) {
    if (!cycle.budgetRecord) return;

    const utilization = cycle.budgetRecord.utilization;
    const crpt = cycle.cognitiveReturn ? cycle.cognitiveReturn.crpt : 0;

    // If utilization is low and CRPT is high, reduce future budgets for this type
    if (utilization < 0.5 && crpt > 0.05) {
      this.policyAdjustments.push({
        type: 'budget_decrease',
        taskType: cycle.budgetRecord.taskType,
        reason: 'high_crpt_low_utilization',
        factor: 0.9,
        timestamp: Date.now(),
      });
    }

    // If utilization hit ceiling and CRPT is low, increase budget
    if (utilization > 1.3 && crpt < 0.01) {
      this.policyAdjustments.push({
        type: 'budget_increase',
        taskType: cycle.budgetRecord.taskType,
        reason: 'low_crpt_over_budget',
        factor: 1.2,
        timestamp: Date.now(),
      });
    }
  }

  // ── Status & Reporting ─────────────────────────────────────────────────

  getStatus() {
    return {
      cycles: this.cycles.length,
      governor: this.governor.getStats(),
      scorer: this.scorer.getStats(),
      compression: this.compression.getStats(),
      waste: this.waste.getStats(),
      reuse: this.reuse.getStats(),
      benchmark: this.benchmark.getReport(),
      policyAdjustments: this.policyAdjustments.length,
    };
  }

  /**
   * Get the practical formula stack values for the last cycle.
   */
  getLastCycleMetrics() {
    if (this.cycles.length === 0) return null;
    const last = this.cycles[this.cycles.length - 1];
    return {
      tokenValue: last.cognitiveReturn
        ? this.scorer.tokenValue({
            ...last.cognitiveReturn.breakdown,
            waste: last.wasteAnalysis ? last.wasteAnalysis.wasteRatio * 5 : 0,
          })
        : null,
      crpt: last.cognitiveReturn ? last.cognitiveReturn.crpt : null,
      compressionEfficiency: last.compressionAudit ? last.compressionAudit.cef : null,
      wasteRatio: last.wasteAnalysis ? last.wasteAnalysis.wasteRatio : null,
      artifactsExtracted: last.extractedArtifacts ? last.extractedArtifacts.length : 0,
      budgetUtilization: last.budgetRecord ? last.budgetRecord.utilization : null,
    };
  }

  reset() {
    this.governor.reset();
    this.salience = new SalienceEngine();
    this.scorer.reset();
    this.compression.reset();
    this.waste.reset();
    this.reuse.reset();
    this.benchmark.reset();
    this.cycles = [];
    this.policyAdjustments = [];
  }
}

const tokenomicsEngine = new TokenomicsEngine();

export {
  TokenomicsEngine,
  tokenomicsEngine,
  TokenGovernor,
  SalienceEngine,
  CognitiveReturnScorer,
  CompressionAuditor,
  WasteDetector,
  ReuseExtractor,
  BenchmarkHarness,
};

export default tokenomicsEngine;
