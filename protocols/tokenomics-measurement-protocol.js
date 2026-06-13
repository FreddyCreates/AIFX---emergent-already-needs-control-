/**
 * TOKENOMICS MEASUREMENT PROTOCOL (PROTO-231)
 *
 * A Measurable Runtime Control System for Cognitive Return Per Token in AI Agents.
 *
 * This protocol governs how the organism allocates, measures, and optimizes
 * token spend across all interactions. It integrates with the governance layer
 * to enforce budget compliance and extract reusable intelligence.
 *
 * Core Equations:
 *   TV(t) = wd*D + wa*A + wr*R + wc*C + wm*M − wn*N
 *   CRPT  = (DQ + ACT + RISK + REUSE + LEARN − WASTE) / TotalTokens
 *   S_i   = αU + βR + γM + δT + εN − ζK
 *   CEF   = (MeaningPreserved + ActionClarity + RiskPreserved) / OutputTokens
 *
 * @module protocols/tokenomics-measurement-protocol
 * @version 1.0.0
 * @proto PROTO-231
 * @tier IV — Intelligence & Governance
 */

import {
  TokenomicsEngine,
  TokenGovernor,
  SalienceEngine,
  CognitiveReturnScorer,
  CompressionAuditor,
  WasteDetector,
  ReuseExtractor,
  BenchmarkHarness,
  DEFAULT_BUDGETS,
} from '../sdk/engines/tokenomics-engine.js';

const PHI = 1.618033988749895;

// ─── Protocol Metadata ────────────────────────────────────────────────────────

export const PROTOCOL_ID = 'PROTO-231';
export const PROTOCOL_NAME = 'Tokenomics Measurement Protocol';
export const PROTOCOL_VERSION = '1.0.0';
export const PROTOCOL_TIER = 4;

// ─── Task Classification ──────────────────────────────────────────────────────

const TASK_TYPES = [
  'invoice',
  'estimating',
  'cashflow',
  'research',
  'architecture',
  'redteam',
  'memory',
  'general',
];

// ─── Protocol Class ───────────────────────────────────────────────────────────

export class TokenomicsMeasurementProtocol {
  constructor(config = {}) {
    this.id = PROTOCOL_ID;
    this.name = PROTOCOL_NAME;
    this.version = PROTOCOL_VERSION;
    this.tier = PROTOCOL_TIER;
    this.engine = new TokenomicsEngine(config);
    this.history = [];
    this.active = false;
  }

  /**
   * Activate the protocol.
   */
  activate() {
    this.active = true;
    return { status: 'active', protocol: this.id };
  }

  /**
   * Deactivate the protocol.
   */
  deactivate() {
    this.active = false;
    return { status: 'inactive', protocol: this.id };
  }

  /**
   * Runtime loop entry point.
   *
   * Steps:
   *   1. Classify task
   *   2. Rank salience
   *   3. Set token budget
   *   4. (External: recruit agents & generate)
   *   5. Score cognitive return
   *   6. Audit compression
   *   7. Detect waste
   *   8. Extract reusable artifacts
   *   9. Record to history
   *
   * @param {object} input — See TokenomicsEngine.analyze()
   * @returns {object} Full analysis result with protocol metadata
   */
  measure(input) {
    if (!this.active) {
      return { error: 'Protocol not active. Call activate() first.' };
    }

    const analysis = this.engine.analyze(input);

    const result = {
      protocol: this.id,
      version: this.version,
      timestamp: Date.now(),
      ...analysis,
    };

    this.history.push(result);
    return result;
  }

  /**
   * Get protocol performance over time.
   * @returns {{ avgCrpt: number, totalMeasurements: number, budgetCompliance: number, avgWaste: number }}
   */
  getPerformance() {
    if (this.history.length === 0) return null;

    const avgCrpt = this.history.reduce((s, h) => s + h.cognitiveReturn.crpt, 0) / this.history.length;
    const budgetCompliance = this.history.filter(h => h.budget.withinBudget).length / this.history.length;
    const avgWaste = this.history.reduce((s, h) => s + h.wasteReport.wasteRatio, 0) / this.history.length;

    return {
      avgCrpt,
      totalMeasurements: this.history.length,
      budgetCompliance,
      avgWaste,
    };
  }

  /**
   * Run a benchmark across task types.
   * @param {Array<object>} benchmarks
   * @returns {object}
   */
  runBenchmarks(benchmarks) {
    for (const b of benchmarks) {
      this.engine.benchmark.compare(b);
    }
    return this.engine.benchmark.getSummary();
  }

  /**
   * Get all reusable artifacts extracted so far.
   */
  getExtractedArtifacts() {
    return this.engine.reuse.getAll();
  }

  /**
   * Reset protocol state.
   */
  reset() {
    this.history = [];
    this.engine.reuse.reset();
    this.engine.benchmark.reset();
  }

  /**
   * Get protocol status for governance reporting.
   */
  status() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      tier: this.tier,
      active: this.active,
      measurements: this.history.length,
      performance: this.getPerformance(),
    };
  }
}

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
  DEFAULT_BUDGETS,
  TASK_TYPES,
};

export default TokenomicsMeasurementProtocol;
