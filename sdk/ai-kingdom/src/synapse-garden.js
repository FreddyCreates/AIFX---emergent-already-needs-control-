/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🌿 SYNAPSE GARDEN — ORGANIC NEURAL PATHWAY GROWTH & PRUNING 🌿                       ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * The Synapse Garden is the Kingdom's living neural architecture.
 * Pathways grow organically based on usage, forming stronger connections
 * while unused paths are pruned — mirroring biological brain plasticity.
 *
 * FEATURES:
 *   - Organic pathway growth (Hebbian-inspired: "fire together, wire together")
 *   - Adaptive pruning (unused pathways decay at φ-rate)
 *   - Neurotransmitter simulation (dopamine, serotonin, cortisol analogs)
 *   - Synaptic plasticity (LTP/LTD mechanisms)
 *   - Garden topology visualization
 *
 * @module sdk/ai-kingdom/synapse-garden
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// NEUROTRANSMITTER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const NEUROTRANSMITTERS = {
  DOPAMINE: { id: 'dopamine', name: 'Dopamine', effect: 'reward', strengthMultiplier: PHI, decayRate: 0.05 },
  SEROTONIN: { id: 'serotonin', name: 'Serotonin', effect: 'stability', strengthMultiplier: 1.0, decayRate: 0.02 },
  CORTISOL: { id: 'cortisol', name: 'Cortisol', effect: 'urgency', strengthMultiplier: PHI * 0.8, decayRate: 0.1 },
  OXYTOCIN: { id: 'oxytocin', name: 'Oxytocin', effect: 'bonding', strengthMultiplier: 1.2, decayRate: 0.03 },
  NOREPINEPHRINE: { id: 'norepinephrine', name: 'Norepinephrine', effect: 'alertness', strengthMultiplier: PHI * 0.6, decayRate: 0.08 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SYNAPSE STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const SYNAPSE_STATES = {
  NASCENT: 'nascent',
  GROWING: 'growing',
  MATURE: 'mature',
  POTENTIATED: 'potentiated',
  DEPRESSED: 'depressed',
  PRUNING: 'pruning',
  DEAD: 'dead'
};

// ═══════════════════════════════════════════════════════════════════════════════
// GARDEN STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const GARDEN_STATES = {
  DORMANT: 'dormant',
  GROWING: 'growing',
  BLOOMING: 'blooming',
  PRUNING: 'pruning',
  CONSOLIDATING: 'consolidating'
};

// ═══════════════════════════════════════════════════════════════════════════════
// SYNAPSE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Synapse — A single connection between neurons
 */
export class Synapse {

  constructor(sourceId, targetId, config = {}) {
    this.id = `syn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.strength = config.initialStrength || 0.1;
    this.state = SYNAPSE_STATES.NASCENT;
    this.firings = 0;
    this.lastFired = null;
    this.neurotransmitter = config.neurotransmitter || NEUROTRANSMITTERS.DOPAMINE;
    this.plasticity = config.plasticity || 0.5; // Learning rate
    this.createdAt = Date.now();
  }

  /**
   * Fire the synapse (strengthen through use)
   */
  fire(signal = 1.0) {
    this.firings++;
    this.lastFired = Date.now();

    // Hebbian strengthening
    const delta = this.plasticity * signal * this.neurotransmitter.strengthMultiplier;
    this.strength = Math.min(1.0, this.strength + delta * (1 / PHI));

    // State transitions
    if (this.strength > 0.8) this.state = SYNAPSE_STATES.POTENTIATED;
    else if (this.strength > 0.3) this.state = SYNAPSE_STATES.MATURE;
    else if (this.strength > 0.1) this.state = SYNAPSE_STATES.GROWING;

    return { strength: this.strength, state: this.state, firings: this.firings };
  }

  /**
   * Decay the synapse (weaken through disuse)
   */
  decay(timeDelta = 1000) {
    const decayAmount = this.neurotransmitter.decayRate * (timeDelta / 1000) * (1 / PHI);
    this.strength = Math.max(0, this.strength - decayAmount);

    if (this.strength < 0.05) {
      this.state = SYNAPSE_STATES.PRUNING;
    } else if (this.strength < 0.2) {
      this.state = SYNAPSE_STATES.DEPRESSED;
    }

    return { strength: this.strength, state: this.state };
  }

  /**
   * Check if synapse should be pruned
   */
  shouldPrune() {
    const age = Date.now() - this.createdAt;
    const timeSinceLastFire = this.lastFired ? Date.now() - this.lastFired : age;
    return this.strength < 0.01 || (timeSinceLastFire > 60000 && this.strength < 0.1);
  }

  getInfo() {
    return {
      id: this.id,
      source: this.sourceId,
      target: this.targetId,
      strength: this.strength,
      state: this.state,
      firings: this.firings,
      neurotransmitter: this.neurotransmitter.id,
      age: Date.now() - this.createdAt
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEURON CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Neuron — A node in the Synapse Garden
 */
export class Neuron {

  constructor(config = {}) {
    this.id = config.id || `neuron-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.name = config.name || 'Neuron';
    this.type = config.type || 'excitatory';
    this.threshold = config.threshold || 0.5;
    this.potential = 0;
    this.fired = false;
    this.totalFirings = 0;
    this.synapses = { incoming: [], outgoing: [] };
    this.createdAt = Date.now();
  }

  /**
   * Receive signal from incoming synapse
   */
  receive(signal, synapse) {
    this.potential += signal * synapse.strength;

    // Check firing threshold
    if (this.potential >= this.threshold) {
      return this.fire();
    }
    return { fired: false, potential: this.potential };
  }

  /**
   * Fire the neuron — propagate to all outgoing synapses
   */
  fire() {
    this.fired = true;
    this.totalFirings++;
    const output = this.potential * PHI; // φ-amplification

    // Reset potential (refractory period)
    this.potential = 0;
    this.fired = false;

    return { fired: true, output, firings: this.totalFirings };
  }

  /**
   * Decay potential over time
   */
  leak(amount = 0.01) {
    this.potential = Math.max(0, this.potential - amount);
    return { potential: this.potential };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNAPSE GARDEN CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SynapseGarden — The living neural network
 */
export class SynapseGarden {

  constructor(config = {}) {
    this.id = config.id || `garden-${Date.now()}`;
    this.name = config.name || 'Synapse Garden';
    this.state = GARDEN_STATES.DORMANT;
    this.neurons = new Map();
    this.synapses = new Map();
    this.pruneThreshold = config.pruneThreshold || 0.01;
    this.maxNeurons = config.maxNeurons || 10000;
    this.maxSynapses = config.maxSynapses || 100000;
    this.growthCycles = 0;
    this.pruningCycles = 0;
    this.stats = { neuronsCreated: 0, synapsesCreated: 0, pruned: 0, totalFirings: 0 };
    this.createdAt = Date.now();
  }

  /**
   * Plant a new neuron in the garden
   */
  plantNeuron(config = {}) {
    if (this.neurons.size >= this.maxNeurons) return { error: 'Garden full' };

    const neuron = new Neuron(config);
    this.neurons.set(neuron.id, neuron);
    this.stats.neuronsCreated++;
    return { neuronId: neuron.id, total: this.neurons.size };
  }

  /**
   * Grow a synapse between two neurons
   */
  growSynapse(sourceId, targetId, config = {}) {
    if (this.synapses.size >= this.maxSynapses) return { error: 'Too many synapses' };

    const source = this.neurons.get(sourceId);
    const target = this.neurons.get(targetId);
    if (!source || !target) return { error: 'Neuron not found' };

    const synapse = new Synapse(sourceId, targetId, config);
    this.synapses.set(synapse.id, synapse);
    source.synapses.outgoing.push(synapse.id);
    target.synapses.incoming.push(synapse.id);
    this.stats.synapsesCreated++;

    return { synapseId: synapse.id, strength: synapse.strength };
  }

  /**
   * Stimulate a neuron — propagate through the network
   */
  stimulate(neuronId, signal = 1.0, depth = 5) {
    const neuron = this.neurons.get(neuronId);
    if (!neuron) return { error: 'Neuron not found' };

    this.state = GARDEN_STATES.GROWING;
    const activations = [];
    const queue = [{ neuronId, signal, currentDepth: 0 }];
    const visited = new Set();

    while (queue.length > 0 && queue.length < 100) {
      const { neuronId: nId, signal: sig, currentDepth } = queue.shift();
      if (visited.has(nId) || currentDepth > depth) continue;
      visited.add(nId);

      const n = this.neurons.get(nId);
      if (!n) continue;

      // Fire outgoing synapses
      for (const synId of n.synapses.outgoing) {
        const syn = this.synapses.get(synId);
        if (!syn) continue;

        syn.fire(sig);
        this.stats.totalFirings++;

        const targetNeuron = this.neurons.get(syn.targetId);
        if (targetNeuron) {
          const result = targetNeuron.receive(sig, syn);
          activations.push({ neuron: syn.targetId, synapse: synId, result });

          if (result.fired) {
            queue.push({ neuronId: syn.targetId, signal: result.output, currentDepth: currentDepth + 1 });
          }
        }
      }
    }

    this.state = GARDEN_STATES.BLOOMING;
    return { stimulated: neuronId, activations: activations.length, depth: Math.min(depth, visited.size) };
  }

  /**
   * Prune dead/weak synapses
   */
  prune() {
    this.state = GARDEN_STATES.PRUNING;
    const pruned = [];

    for (const [id, synapse] of this.synapses) {
      if (synapse.shouldPrune()) {
        this.synapses.delete(id);
        pruned.push(id);

        // Clean references
        const source = this.neurons.get(synapse.sourceId);
        const target = this.neurons.get(synapse.targetId);
        if (source) source.synapses.outgoing = source.synapses.outgoing.filter(s => s !== id);
        if (target) target.synapses.incoming = target.synapses.incoming.filter(s => s !== id);
      }
    }

    this.stats.pruned += pruned.length;
    this.pruningCycles++;
    this.state = GARDEN_STATES.CONSOLIDATING;
    return { pruned: pruned.length, remaining: this.synapses.size };
  }

  /**
   * Run a growth cycle (decay all, then prune)
   */
  growthCycle(timeDelta = 1000) {
    this.growthCycles++;

    // Decay all synapses
    for (const [, synapse] of this.synapses) {
      synapse.decay(timeDelta);
    }

    // Leak all neurons
    for (const [, neuron] of this.neurons) {
      neuron.leak(0.01 * (timeDelta / 1000));
    }

    // Prune
    const pruneResult = this.prune();

    return {
      cycle: this.growthCycles,
      pruned: pruneResult.pruned,
      neurons: this.neurons.size,
      synapses: this.synapses.size,
      phiHealth: (this.synapses.size / (this.neurons.size || 1)) / PHI
    };
  }

  /**
   * Get garden status
   */
  getStatus() {
    return {
      id: this.id,
      state: this.state,
      neurons: this.neurons.size,
      synapses: this.synapses.size,
      growthCycles: this.growthCycles,
      pruningCycles: this.pruningCycles,
      stats: { ...this.stats },
      connectivity: this.neurons.size > 0 ? this.synapses.size / this.neurons.size : 0,
      phiHealth: (this.synapses.size / (this.neurons.size || 1)) / PHI,
      uptime: Date.now() - this.createdAt
    };
  }
}

export default SynapseGarden;
