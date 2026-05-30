'use strict';
/**
 * WEIGHT EVOLVER MICROBOT
 * Parent: organism-learning-bot
 *
 * Takes reward model data and evolves protocol connection weights.
 * Uses TD(λ) with phi-based discount: w_new = w * (1 + γ·reward)
 * Normalizes weights so the total stays stable.
 */

const { MicrobotBase, PHI, PHI_INV } = require('../microbot-base.js');

const GAMMA = PHI - 1;  // 0.618

class WeightEvolverMicrobot extends MicrobotBase {
  constructor(parentBot, config = {}) {
    super('weight-evolver', parentBot, config);
    this.weights = config.weights || {};
    this.rewards = config.rewards || {};
  }

  async _execute({ rewards = {}, weights = {} } = {}) {
    const w = { ...this.weights, ...weights };
    const r = { ...this.rewards, ...rewards };
    let evolved = 0;

    for (const [name, rewardData] of Object.entries(r)) {
      const reward  = typeof rewardData === 'number' ? rewardData : (rewardData.reward || 0);
      const current = w[name] || PHI_INV;
      const next    = current * (1 + GAMMA * reward);
      const clamped = Math.max(0.1, Math.min(PHI * 2, next));
      if (Math.abs(clamped - current) > 0.001) evolved++;
      w[name] = parseFloat(clamped.toFixed(6));
      this.tick();
    }

    // Normalize
    const total = Object.values(w).reduce((s, v) => s + v, 0);
    if (total > 0) {
      const n = Object.keys(w).length;
      for (const k of Object.keys(w)) w[k] = parseFloat((w[k] / total * n).toFixed(6));
    }

    return { weights: w, evolved, total: Object.keys(w).length };
  }
}

module.exports = WeightEvolverMicrobot;
