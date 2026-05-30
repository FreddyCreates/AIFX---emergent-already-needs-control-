/**
 * PROTO-203: Hebbian Learning Protocol (HLP)
 * "Neurons that fire together wire together" — phi-weighted synaptic plasticity.
 * 
 * dw/dt = η · (pre × post) - λ · w + φ-modulated reinforcement
 * Implements LTP (Long-Term Potentiation) and LTD (Long-Term Depression)
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const ETA = 0.01;  // Learning rate
const LAMBDA = 0.001;  // Weight decay

class HebbianLearningProtocol {
  constructor(config = {}) {
    this.learningRate = config.eta || ETA;
    this.weightDecay = config.lambda || LAMBDA;
    this.synapses = new Map();
    this.neurons = new Map();
    this.totalUpdates = 0;
    this.ltpEvents = 0;
    this.ltdEvents = 0;
  }

  registerNeuron(id, initialActivation = 0) {
    this.neurons.set(id, {
      id,
      activation: initialActivation,
      lastFired: null,
      fireCount: 0,
    });
    return id;
  }

  connect(preId, postId, initialWeight = 0.5) {
    const key = `${preId}->${postId}`;
    if (!this.neurons.has(preId) || !this.neurons.has(postId)) {
      throw new Error(`Neurons must be registered before connecting: ${key}`);
    }
    
    this.synapses.set(key, {
      pre: preId,
      post: postId,
      weight: initialWeight,
      lastUpdate: Date.now(),
      updateCount: 0,
      trace: 0,
    });
    return key;
  }

  fire(neuronId, activation) {
    const neuron = this.neurons.get(neuronId);
    if (!neuron) return;
    
    const oldActivation = neuron.activation;
    neuron.activation = Math.max(0, Math.min(1, activation));
    neuron.lastFired = Date.now();
    neuron.fireCount++;
    
    // Propagate through synapses where this neuron is pre-synaptic
    for (const [key, synapse] of this.synapses) {
      if (synapse.pre === neuronId) {
        const postNeuron = this.neurons.get(synapse.post);
        if (postNeuron) {
          // Eligibility trace with phi decay
          synapse.trace = synapse.trace * Math.pow(PHI - 1, 0.1) + neuron.activation;
        }
      }
    }
    
    return { neuronId, oldActivation, newActivation: neuron.activation };
  }

  update() {
    this.totalUpdates++;
    const updates = [];
    
    for (const [key, synapse] of this.synapses) {
      const pre = this.neurons.get(synapse.pre);
      const post = this.neurons.get(synapse.post);
      if (!pre || !post) continue;
      
      // Hebbian learning rule with phi modulation
      const prePost = pre.activation * post.activation;
      const phiMod = Math.sin(this.totalUpdates / PHI) * 0.1 + 1;
      
      // dw = η * (pre × post) - λ * w
      let dw = this.learningRate * prePost * phiMod - this.weightDecay * synapse.weight;
      
      // Add trace-based reinforcement (STDP-like)
      dw += this.learningRate * synapse.trace * post.activation * (PHI - 1);
      
      const oldWeight = synapse.weight;
      synapse.weight = Math.max(0, Math.min(1, synapse.weight + dw));
      synapse.lastUpdate = Date.now();
      synapse.updateCount++;
      
      // Track LTP/LTD
      if (dw > 0.001) this.ltpEvents++;
      else if (dw < -0.001) this.ltdEvents++;
      
      // Decay trace
      synapse.trace *= (PHI - 1);
      
      updates.push({
        synapse: key,
        oldWeight,
        newWeight: synapse.weight,
        delta: dw,
      });
    }
    
    return updates;
  }

  reinforce(reward) {
    // Global reward signal modulates all active synapses
    for (const [key, synapse] of this.synapses) {
      if (synapse.trace > 0.1) {
        const reinforcement = reward * synapse.trace * this.learningRate * PHI;
        synapse.weight = Math.max(0, Math.min(1, synapse.weight + reinforcement));
      }
    }
  }

  getNetworkState() {
    const neurons = [];
    for (const [id, n] of this.neurons) {
      neurons.push({ id, activation: n.activation, fireCount: n.fireCount });
    }
    
    const synapses = [];
    for (const [key, s] of this.synapses) {
      synapses.push({ key, weight: s.weight, trace: s.trace });
    }
    
    return {
      neurons,
      synapses,
      totalUpdates: this.totalUpdates,
      ltpEvents: this.ltpEvents,
      ltdEvents: this.ltdEvents,
      ltpLtdRatio: this.ltdEvents > 0 ? this.ltpEvents / this.ltdEvents : PHI,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { HebbianLearningProtocol };
export default HebbianLearningProtocol;
