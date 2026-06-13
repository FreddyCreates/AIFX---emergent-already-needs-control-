/**
 * BENCHMARK HARNESS
 *
 * Runs tokenomic vs. non-tokenomic comparisons across task classes.
 * Measures TokenomicGain = (Score_B / Tokens_B) − (Score_A / Tokens_A)
 *
 * Task Classes:
 *   invoice, estimating, cashflow, proposal,
 *   research, architecture, redteam, memory
 */

import { CognitiveReturnScorer } from './cognitive-return-scorer.js';

const TASK_CLASSES = [
  'invoice',
  'estimating',
  'cashflow',
  'proposal',
  'research',
  'architecture',
  'redteam',
  'memory',
];

class BenchmarkHarness {
  constructor(options = {}) {
    this.scorer = options.scorer || new CognitiveReturnScorer();
    this.results = [];
  }

  /**
   * Run a single benchmark comparison.
   * @param {object} params
   * @param {string} params.taskClass - Task type being benchmarked
   * @param {object} params.systemA - Non-tokenomic: { scores, tokens }
   * @param {object} params.systemB - Tokenomic: { scores, tokens }
   * @param {object} [params.metadata] - Optional benchmark metadata
   * @returns {{ taskClass, tokenomicGain, winner, systemA, systemB }}
   */
  run(params) {
    const { taskClass, systemA, systemB, metadata } = params;

    const scoreA = this._computeScore(systemA.scores);
    const scoreB = this._computeScore(systemB.scores);

    const efficiencyA = systemA.tokens > 0 ? scoreA / systemA.tokens : 0;
    const efficiencyB = systemB.tokens > 0 ? scoreB / systemB.tokens : 0;

    const tokenomicGain = efficiencyB - efficiencyA;

    const result = {
      taskClass,
      tokenomicGain,
      winner: tokenomicGain > 0 ? 'tokenomic' : tokenomicGain < 0 ? 'baseline' : 'tie',
      systemA: {
        score: scoreA,
        tokens: systemA.tokens,
        efficiency: efficiencyA,
        breakdown: systemA.scores,
      },
      systemB: {
        score: scoreB,
        tokens: systemB.tokens,
        efficiency: efficiencyB,
        breakdown: systemB.scores,
      },
      metadata: metadata || null,
      timestamp: Date.now(),
    };

    this.results.push(result);
    return result;
  }

  /**
   * Run a batch of benchmarks.
   * @param {Array<object>} benchmarks - Array of { taskClass, systemA, systemB }
   * @returns {Array<object>} Results
   */
  runBatch(benchmarks) {
    return benchmarks.map(b => this.run(b));
  }

  /**
   * Score = DQ + ACT + RISK + REUSE + ACCURACY − WASTE
   */
  _computeScore(scores) {
    return (
      (scores.dq || 0) +
      (scores.act || 0) +
      (scores.risk || 0) +
      (scores.reuse || 0) +
      (scores.accuracy || 0) -
      (scores.waste || 0)
    );
  }

  /**
   * Get aggregate benchmark report.
   */
  getReport() {
    if (this.results.length === 0) {
      return { count: 0, avgGain: 0, tokenomicWins: 0, baselineWins: 0, ties: 0, byTaskClass: {} };
    }

    const count = this.results.length;
    const avgGain = this.results.reduce((s, r) => s + r.tokenomicGain, 0) / count;
    const tokenomicWins = this.results.filter(r => r.winner === 'tokenomic').length;
    const baselineWins = this.results.filter(r => r.winner === 'baseline').length;
    const ties = this.results.filter(r => r.winner === 'tie').length;

    const byTaskClass = {};
    for (const tc of TASK_CLASSES) {
      const tcResults = this.results.filter(r => r.taskClass === tc);
      if (tcResults.length > 0) {
        byTaskClass[tc] = {
          count: tcResults.length,
          avgGain: tcResults.reduce((s, r) => s + r.tokenomicGain, 0) / tcResults.length,
          wins: tcResults.filter(r => r.winner === 'tokenomic').length,
        };
      }
    }

    return { count, avgGain, tokenomicWins, baselineWins, ties, byTaskClass };
  }

  reset() {
    this.results = [];
  }
}

export { BenchmarkHarness, TASK_CLASSES };
export default BenchmarkHarness;
