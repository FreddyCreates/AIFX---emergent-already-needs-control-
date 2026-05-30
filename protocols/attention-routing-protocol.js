/**
 * PROTO-215: Attention Routing Protocol (ARP)
 * Phi-weighted attention allocation across organism subsystems.
 * 
 * Implements soft attention with query-key-value (QKV) mechanism.
 * Attention weights are phi-modulated and heartbeat-synced.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const ATTENTION_DECAY = 0.95;

class AttentionRoutingProtocol {
  constructor() {
    this.targets = new Map();
    this.attentionWeights = new Map();
    this.attentionHistory = [];
    this.focusStack = [];
    this.totalQueries = 0;
  }

  registerTarget(id, config = {}) {
    this.targets.set(id, {
      id,
      name: config.name || id,
      type: config.type || 'default',
      priority: config.priority ?? 1.0,
      capacity: config.capacity ?? 1.0,
      key: config.key || this.generateKey(id),
    });
    
    this.attentionWeights.set(id, {
      weight: 0,
      lastUpdated: Date.now(),
      queryCount: 0,
    });
    
    return id;
  }

  generateKey(id) {
    // Simple key generation based on id hash
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    }
    return Array.from({ length: 8 }, (_, i) => 
      Math.sin(hash * (i + 1) * PHI) * 0.5 + 0.5
    );
  }

  query(queryVector, temperature = 1.0) {
    this.totalQueries++;
    
    if (this.targets.size === 0) {
      return { weights: {}, focused: null };
    }
    
    // Compute attention scores using dot product
    const scores = new Map();
    let maxScore = -Infinity;
    
    for (const [id, target] of this.targets) {
      const key = target.key;
      let score = 0;
      
      // Dot product attention
      for (let i = 0; i < Math.min(queryVector.length, key.length); i++) {
        score += queryVector[i] * key[i];
      }
      
      // Apply priority and phi modulation
      score *= target.priority * PHI;
      
      scores.set(id, score);
      if (score > maxScore) maxScore = score;
    }
    
    // Softmax with temperature
    let sumExp = 0;
    const expScores = new Map();
    for (const [id, score] of scores) {
      const exp = Math.exp((score - maxScore) / temperature);
      expScores.set(id, exp);
      sumExp += exp;
    }
    
    // Normalize and update weights
    const weights = {};
    let focusedTarget = null;
    let maxWeight = 0;
    
    for (const [id, exp] of expScores) {
      const weight = exp / sumExp;
      weights[id] = weight;
      
      const targetWeight = this.attentionWeights.get(id);
      if (targetWeight) {
        targetWeight.weight = weight;
        targetWeight.lastUpdated = Date.now();
        targetWeight.queryCount++;
      }
      
      if (weight > maxWeight) {
        maxWeight = weight;
        focusedTarget = id;
      }
    }
    
    // Record in history
    this.attentionHistory.push({
      query: queryVector.slice(0, 4),
      weights,
      focused: focusedTarget,
      timestamp: Date.now(),
    });
    if (this.attentionHistory.length > 100) this.attentionHistory.shift();
    
    return { weights, focused: focusedTarget, maxWeight };
  }

  focus(targetId) {
    if (!this.targets.has(targetId)) return false;
    
    // Push current focus to stack
    const currentFocus = this.focusStack[this.focusStack.length - 1];
    if (currentFocus !== targetId) {
      this.focusStack.push(targetId);
      if (this.focusStack.length > 10) this.focusStack.shift();
    }
    
    // Set attention weight to max
    const targetWeight = this.attentionWeights.get(targetId);
    if (targetWeight) {
      targetWeight.weight = 1.0;
      targetWeight.lastUpdated = Date.now();
    }
    
    return true;
  }

  unfocus() {
    return this.focusStack.pop();
  }

  decay() {
    // Apply attention decay to all weights
    for (const [id, weight] of this.attentionWeights) {
      weight.weight *= ATTENTION_DECAY;
    }
  }

  getAttentionMap() {
    const map = {};
    for (const [id, weight] of this.attentionWeights) {
      map[id] = {
        weight: weight.weight,
        queryCount: weight.queryCount,
        lastUpdated: weight.lastUpdated,
      };
    }
    return map;
  }

  getCurrentFocus() {
    return this.focusStack[this.focusStack.length - 1] || null;
  }

  getMetrics() {
    return {
      targetCount: this.targets.size,
      totalQueries: this.totalQueries,
      currentFocus: this.getCurrentFocus(),
      focusStackDepth: this.focusStack.length,
      attentionMap: this.getAttentionMap(),
      recentHistory: this.attentionHistory.slice(-10),
      decayRate: ATTENTION_DECAY,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { AttentionRoutingProtocol, ATTENTION_DECAY };
export default AttentionRoutingProtocol;
