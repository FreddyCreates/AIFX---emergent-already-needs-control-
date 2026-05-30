/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-250: Synapse Garden Protocol                                       ║
 * ║  Organic neural growth, Hebbian plasticity, adaptive pruning              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Governs how neural pathways grow, strengthen, and prune within
 * the Kingdom's living neural architecture.
 *
 * @module protocols/synapse-garden-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ─── Protocol States ─────────────────────────────────────────────────────────
export const GARDEN_PROTOCOL_STATES = {
  DORMANT: 'dormant',
  GROWING: 'growing',
  FIRING: 'firing',
  PRUNING: 'pruning',
  CONSOLIDATING: 'consolidating',
  ERROR: 'error'
};

// ─── Plasticity Rules ────────────────────────────────────────────────────────
export const PLASTICITY_RULES = {
  HEBBIAN: { id: 'hebbian', formula: 'fire-together-wire-together', strengthRate: PHI * 0.1 },
  ANTI_HEBBIAN: { id: 'anti-hebbian', formula: 'decorrelation', strengthRate: -(PHI * 0.05) },
  STDP: { id: 'stdp', formula: 'spike-timing-dependent', strengthRate: PHI * 0.08 },
  HOMEOSTATIC: { id: 'homeostatic', formula: 'maintain-average', strengthRate: 0 }
};

// ─── Configuration ───────────────────────────────────────────────────────────
export const GARDEN_CONFIG = {
  maxNeurons: 10000,
  maxSynapses: 100000,
  pruneThreshold: 0.01,
  growthRate: PHI * 0.01,
  decayRate: 1 / PHI * 0.01,
  heartbeatInterval: HEARTBEAT,
  consolidationInterval: HEARTBEAT * PHI,
  firingThreshold: 0.5,
  refractoryPeriod: 10,
  maxPropagationDepth: 10
};

// ─── Message Types ───────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  NEURON_PLANT: 'garden.neuron.plant',
  NEURON_FIRE: 'garden.neuron.fire',
  SYNAPSE_GROW: 'garden.synapse.grow',
  SYNAPSE_FIRE: 'garden.synapse.fire',
  SYNAPSE_PRUNE: 'garden.synapse.prune',
  STIMULATE: 'garden.stimulate',
  PROPAGATION: 'garden.propagation',
  GROWTH_CYCLE: 'garden.growth.cycle',
  CONSOLIDATE: 'garden.consolidate',
  STATUS: 'garden.status'
};

/**
 * Calculate synaptic strength change (Hebbian LTP/LTD)
 */
export function calculateStrengthDelta(preActivity, postActivity, currentStrength, plasticityRule) {
  const rule = PLASTICITY_RULES[plasticityRule] || PLASTICITY_RULES.HEBBIAN;
  const correlation = preActivity * postActivity;
  return rule.strengthRate * correlation * (1 - currentStrength); // Bounded growth
}

/**
 * Calculate pruning eligibility
 */
export function calculatePruneScore(strength, timeSinceLastFire, firings, age) {
  const disuse = timeSinceLastFire / 60000; // minutes since last fire
  const weakness = 1 - strength;
  const inactivity = 1 / (firings + 1);
  return (disuse * weakness * inactivity) * PHI;
}

/**
 * Calculate garden health (connectivity / golden ratio)
 */
export function calculateGardenHealth(neurons, synapses, activeFirings, prunedCount) {
  const connectivity = neurons > 0 ? synapses / neurons : 0;
  const optimalConnectivity = PHI * 3; // ~4.85 synapses per neuron
  const healthRatio = 1 - Math.abs(connectivity - optimalConnectivity) / optimalConnectivity;
  const activityScore = activeFirings / (neurons || 1);
  return Math.max(0, Math.min(1.0, (healthRatio * PHI + activityScore) / (PHI + 1)));
}

/**
 * Calculate neurotransmitter effect on plasticity
 */
export function calculateTransmitterEffect(transmitterType, baseStrength, signalIntensity) {
  const multipliers = {
    dopamine: PHI,
    serotonin: 1.0,
    cortisol: PHI * 0.8,
    oxytocin: 1.2,
    norepinephrine: PHI * 0.6
  };
  const mult = multipliers[transmitterType] || 1.0;
  return baseStrength * mult * signalIntensity * (1 / PHI);
}

/**
 * SynapseGardenProtocol — Main protocol class
 */
export class SynapseGardenProtocol {
  constructor(config = {}) {
    this.config = { ...GARDEN_CONFIG, ...config };
    this.state = GARDEN_PROTOCOL_STATES.DORMANT;
    this.stats = { neuronsPlanted: 0, synapsesGrown: 0, firings: 0, pruned: 0, cycles: 0, errors: 0 };
  }

  getStatus() {
    return { state: this.state, stats: this.stats, config: this.config };
  }
}
