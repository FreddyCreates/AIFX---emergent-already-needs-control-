'use strict';
/**
 * SYNAPSE TRAINER MICROBOT
 * Parent: organism-learning-bot
 *
 * Runs the Hebbian learning rule on co-activation data from the signal
 * gatherer. Modules that succeed together get stronger synaptic connections.
 * dw/dt = η·(pre×post) - λ·w   (phi-weighted)
 */

const { MicrobotBase, PHI, PHI_INV } = require('../microbot-base.js');

const ETA    = 0.01;
const LAMBDA = 0.001;

class SynapseTrainerMicrobot extends MicrobotBase {
  constructor(parentBot, config = {}) {
    super('synapse-trainer', parentBot, config);
    this.synapses = config.synapses || {};
  }

  async _execute({ signals = [] } = {}) {
    const active = signals.filter(s => s.score > 0.5).map(s => s.source);
    let created = 0, updated = 0, decayed = 0;

    // Hebbian update for active pairs
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const key = `${active[i]}→${active[j]}`;
        const pre  = signals.find(s => s.source === active[i])?.score || 0;
        const post = signals.find(s => s.source === active[j])?.score || 0;
        const curr = this.synapses[key] || 0;
        const delta = ETA * (pre * post) - LAMBDA * curr;
        const next  = Math.max(0, Math.min(PHI, curr + delta));
        if (curr === 0) created++; else updated++;
        this.synapses[key] = parseFloat(next.toFixed(6));
        this.tick();
      }
    }

    // Decay inactive
    for (const [key, w] of Object.entries(this.synapses)) {
      const [pre] = key.split('→');
      if (!active.includes(pre)) {
        const next = w * PHI_INV;
        if (next < 0.001) { delete this.synapses[key]; decayed++; }
        else this.synapses[key] = parseFloat(next.toFixed(6));
      }
    }

    return { synapses: this.synapses, created, updated, decayed, total: Object.keys(this.synapses).length };
  }
}

module.exports = SynapseTrainerMicrobot;
