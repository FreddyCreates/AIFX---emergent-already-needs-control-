/**
 * SALIENCE ENGINE
 *
 * Ranks what deserves token budget before generation.
 * Allocates attention proportionally based on urgency, risk,
 * mission relevance, novelty, time sensitivity, and known context.
 *
 * Implements:
 *   S_i = α·U_i + β·R_i + γ·M_i + δ·T_i + ε·N_i − ζ·K_i
 *   B_i = B_total · (S_i / ΣS)
 */

const DEFAULT_WEIGHTS = {
  alpha: 1.0,  // urgency
  beta:  1.2,  // risk/consequence
  gamma: 1.0,  // mission relevance
  delta: 0.8,  // time sensitivity
  epsilon: 0.9, // novelty/uncertainty
  zeta:  1.0,  // known context (subtracted)
};

class SalienceEngine {
  constructor(options = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) };
  }

  /**
   * Score a single information item.
   * @param {object} item - { urgency, risk, mission, timeSensitivity, novelty, knownContext }
   *   All values 0–5 scale.
   * @returns {number} Salience score
   */
  score(item) {
    const u = item.urgency || 0;
    const r = item.risk || 0;
    const m = item.mission || 0;
    const t = item.timeSensitivity || 0;
    const n = item.novelty || 0;
    const k = item.knownContext || 0;

    const s = (
      this.weights.alpha * u +
      this.weights.beta * r +
      this.weights.gamma * m +
      this.weights.delta * t +
      this.weights.epsilon * n -
      this.weights.zeta * k
    );

    return Math.max(0, s);
  }

  /**
   * Rank multiple items and return sorted by salience.
   * @param {Array<object>} items - Array of items with salience dimensions + id/label
   * @returns {Array<{ item, score }>} Sorted descending by score
   */
  rank(items) {
    const scored = items.map(item => ({
      item,
      score: this.score(item),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  /**
   * Allocate token budget proportionally across items.
   * @param {Array<object>} items - Items with salience dimensions
   * @param {number} totalBudget - Total available token budget
   * @returns {Array<{ item, score, budget }>}
   */
  allocate(items, totalBudget) {
    const scored = this.rank(items);
    const totalScore = scored.reduce((sum, entry) => sum + entry.score, 0);

    if (totalScore === 0) {
      // Equal distribution if all scores are zero
      const equalBudget = Math.round(totalBudget / scored.length);
      return scored.map(entry => ({
        ...entry,
        budget: equalBudget,
      }));
    }

    return scored.map(entry => ({
      ...entry,
      budget: Math.round(totalBudget * (entry.score / totalScore)),
    }));
  }

  /**
   * Filter items below a salience threshold (prune low-value context).
   * @param {Array<object>} items
   * @param {number} threshold - Minimum salience score to include
   * @returns {Array<{ item, score }>}
   */
  filter(items, threshold = 1.0) {
    return this.rank(items).filter(entry => entry.score >= threshold);
  }

  setWeights(partialWeights = {}) {
    this.weights = { ...this.weights, ...partialWeights };
    return this.weights;
  }

  getWeights() {
    return { ...this.weights };
  }
}

export { SalienceEngine, DEFAULT_WEIGHTS };
export default SalienceEngine;
