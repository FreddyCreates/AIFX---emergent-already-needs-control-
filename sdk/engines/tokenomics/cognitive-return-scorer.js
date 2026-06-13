/**
 * COGNITIVE RETURN SCORER
 *
 * Scores output usefulness after generation.
 * Measures Cognitive Return Per Token (CRPT) across five buckets:
 *   - Decision Quality (DQ)
 *   - Actionability (ACT)
 *   - Risk Control (RISK)
 *   - Reuse Value (REUSE)
 *   - Learning Gain (LEARN)
 *
 * Implements:
 *   CR = DQ + ACT + RISK + REUSE + LEARN
 *   CRPT = CR / TotalTokens
 */

class CognitiveReturnScorer {
  constructor(options = {}) {
    this.maxScore = options.maxScore || 5;
    this.history = [];
  }

  /**
   * Score an output across cognitive return dimensions.
   * @param {object} scores - { dq, act, risk, reuse, learn } each 0–5
   * @param {number} totalTokens - Total tokens (prompt + output)
   * @returns {{ cr, crpt, breakdown, totalTokens }}
   */
  score(scores, totalTokens) {
    const dq = this._clamp(scores.dq || 0);
    const act = this._clamp(scores.act || 0);
    const risk = this._clamp(scores.risk || 0);
    const reuse = this._clamp(scores.reuse || 0);
    const learn = this._clamp(scores.learn || 0);

    const cr = dq + act + risk + reuse + learn;
    const crpt = totalTokens > 0 ? cr / totalTokens : 0;

    const result = {
      cr,
      crpt,
      breakdown: { dq, act, risk, reuse, learn },
      totalTokens,
      maxPossibleCR: this.maxScore * 5,
      crNormalized: cr / (this.maxScore * 5),
      timestamp: Date.now(),
    };

    this.history.push(result);
    return result;
  }

  /**
   * Compute Token Value including waste penalty.
   * TV = DQ + ACT + RISK + REUSE + LEARN − WASTE
   * @param {object} scores - { dq, act, risk, reuse, learn, waste }
   * @returns {number} Token value
   */
  tokenValue(scores) {
    const dq = this._clamp(scores.dq || 0);
    const act = this._clamp(scores.act || 0);
    const risk = this._clamp(scores.risk || 0);
    const reuse = this._clamp(scores.reuse || 0);
    const learn = this._clamp(scores.learn || 0);
    const waste = this._clamp(scores.waste || 0);

    return dq + act + risk + reuse + learn - waste;
  }

  /**
   * Compare two outputs and determine which has better tokenomics.
   * @param {object} outputA - { scores, totalTokens }
   * @param {object} outputB - { scores, totalTokens }
   * @returns {{ gain, winner, scoreA, scoreB }}
   */
  compare(outputA, outputB) {
    const scoreA = this.score(outputA.scores, outputA.totalTokens);
    const scoreB = this.score(outputB.scores, outputB.totalTokens);
    // Remove comparison entries from history
    this.history.pop();
    this.history.pop();

    const gain = scoreB.crpt - scoreA.crpt;

    return {
      gain,
      winner: gain > 0 ? 'B' : gain < 0 ? 'A' : 'tie',
      scoreA,
      scoreB,
    };
  }

  /**
   * Get aggregate stats across all scored outputs.
   */
  getStats() {
    if (this.history.length === 0) {
      return { count: 0, avgCR: 0, avgCRPT: 0, totalTokens: 0 };
    }

    const count = this.history.length;
    const avgCR = this.history.reduce((s, r) => s + r.cr, 0) / count;
    const avgCRPT = this.history.reduce((s, r) => s + r.crpt, 0) / count;
    const totalTokens = this.history.reduce((s, r) => s + r.totalTokens, 0);

    return { count, avgCR, avgCRPT, totalTokens };
  }

  _clamp(val) {
    return Math.min(Math.max(val, 0), this.maxScore);
  }

  reset() {
    this.history = [];
  }
}

export { CognitiveReturnScorer };
export default CognitiveReturnScorer;
