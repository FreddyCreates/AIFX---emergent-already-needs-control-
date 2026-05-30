/**
 * PROTO-210: Mini-Brain Protocol (MBP)
 * Stimulus-response with Hebbian learning for each Worker AI.
 * 
 * Each worker gets a MiniBrain that learns from stimuli and adapts responses.
 * Uses phi-weighted learning and amortized decay.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const LEARNING_RATE = 0.1;
const DECAY_RATE = 0.001;

class MiniBrainProtocol {
  constructor(workerId) {
    this.workerId = workerId;
    this.synapses = new Map();  // stimulus -> response weights
    this.stimulusHistory = [];
    this.responseHistory = [];
    this.learningCycles = 0;
    this.lastDecay = Date.now();
    this.decayInterval = HEARTBEAT * 10;  // Decay every 10 heartbeats
  }

  learn(stimulus, response, reward = 1.0) {
    const key = this.normalizeStimulus(stimulus);
    
    if (!this.synapses.has(key)) {
      this.synapses.set(key, new Map());
    }
    
    const responseWeights = this.synapses.get(key);
    const responseKey = this.normalizeResponse(response);
    
    const currentWeight = responseWeights.get(responseKey) || 0;
    const delta = LEARNING_RATE * reward * PHI;
    const newWeight = Math.min(1, currentWeight + delta);
    
    responseWeights.set(responseKey, newWeight);
    
    this.stimulusHistory.push({
      stimulus: key,
      response: responseKey,
      reward,
      timestamp: Date.now(),
    });
    if (this.stimulusHistory.length > 100) this.stimulusHistory.shift();
    
    this.learningCycles++;
    this.maybeDecay();
    
    return { learned: true, stimulus: key, response: responseKey, weight: newWeight };
  }

  respond(stimulus) {
    const key = this.normalizeStimulus(stimulus);
    const responseWeights = this.synapses.get(key);
    
    if (!responseWeights || responseWeights.size === 0) {
      return { response: null, confidence: 0, novel: true };
    }
    
    // Find best response (highest weight)
    let bestResponse = null;
    let bestWeight = 0;
    
    for (const [resp, weight] of responseWeights) {
      if (weight > bestWeight) {
        bestWeight = weight;
        bestResponse = resp;
      }
    }
    
    this.responseHistory.push({
      stimulus: key,
      response: bestResponse,
      confidence: bestWeight,
      timestamp: Date.now(),
    });
    if (this.responseHistory.length > 100) this.responseHistory.shift();
    
    return { response: bestResponse, confidence: bestWeight, novel: false };
  }

  normalizeStimulus(stimulus) {
    if (typeof stimulus === 'string') return stimulus.toLowerCase().trim();
    return JSON.stringify(stimulus);
  }

  normalizeResponse(response) {
    if (typeof response === 'string') return response;
    return JSON.stringify(response);
  }

  maybeDecay() {
    const now = Date.now();
    if (now - this.lastDecay < this.decayInterval) return;
    
    this.lastDecay = now;
    
    // Apply phi-weighted decay to all synapses
    for (const [stimulus, responses] of this.synapses) {
      for (const [response, weight] of responses) {
        const decayed = weight * (1 - DECAY_RATE * (PHI - 1));
        if (decayed < 0.01) {
          responses.delete(response);
        } else {
          responses.set(response, decayed);
        }
      }
      if (responses.size === 0) {
        this.synapses.delete(stimulus);
      }
    }
  }

  reinforce(stimulus, response, reward) {
    return this.learn(stimulus, response, reward);
  }

  punish(stimulus, response) {
    return this.learn(stimulus, response, -0.5);
  }

  getState() {
    let totalSynapses = 0;
    let totalWeight = 0;
    
    for (const [, responses] of this.synapses) {
      totalSynapses += responses.size;
      for (const weight of responses.values()) {
        totalWeight += weight;
      }
    }
    
    const avgWeight = totalSynapses > 0 ? totalWeight / totalSynapses : 0;
    
    return {
      workerId: this.workerId,
      stimulusPatterns: this.synapses.size,
      totalSynapses,
      avgWeight,
      learningCycles: this.learningCycles,
      recentStimuli: this.stimulusHistory.slice(-10),
      recentResponses: this.responseHistory.slice(-10),
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }

  reset() {
    this.synapses.clear();
    this.stimulusHistory = [];
    this.responseHistory = [];
    this.learningCycles = 0;
  }
}

export { MiniBrainProtocol, LEARNING_RATE, DECAY_RATE };
export default MiniBrainProtocol;
