/**
 * PROTO-217: Reward Signal Protocol (RSP)
 * Dopaminergic reward prediction and temporal difference learning.
 * 
 * Implements TD(λ) learning with phi-weighted eligibility traces.
 * Reward signals propagate through the organism to shape behavior.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const GAMMA = PHI - 1;  // Discount factor = 0.618
const LAMBDA = 0.9;     // Eligibility trace decay
const ALPHA = 0.1;      // Learning rate

class RewardSignalProtocol {
  constructor() {
    this.values = new Map();           // State values V(s)
    this.eligibility = new Map();      // Eligibility traces e(s)
    this.rewardHistory = [];
    this.tdErrors = [];
    this.totalRewards = 0;
    this.episodeCount = 0;
  }

  initializeState(stateId, initialValue = 0) {
    this.values.set(stateId, initialValue);
    this.eligibility.set(stateId, 0);
    return stateId;
  }

  observe(currentState, nextState, reward) {
    // Ensure states exist
    if (!this.values.has(currentState)) this.initializeState(currentState);
    if (!this.values.has(nextState)) this.initializeState(nextState);
    
    const V_current = this.values.get(currentState);
    const V_next = this.values.get(nextState);
    
    // Temporal Difference error: δ = r + γV(s') - V(s)
    const tdError = reward + GAMMA * V_next - V_current;
    
    // Update eligibility trace for current state
    // e(s) = γλe(s) + 1 for visited state
    for (const [state, e] of this.eligibility) {
      this.eligibility.set(state, GAMMA * LAMBDA * e);
    }
    this.eligibility.set(currentState, this.eligibility.get(currentState) + 1);
    
    // Update all state values using eligibility traces
    // V(s) = V(s) + α·δ·e(s)
    for (const [state, e] of this.eligibility) {
      const V = this.values.get(state);
      this.values.set(state, V + ALPHA * tdError * e);
    }
    
    // Record
    this.rewardHistory.push({
      current: currentState,
      next: nextState,
      reward,
      tdError,
      timestamp: Date.now(),
    });
    if (this.rewardHistory.length > 500) this.rewardHistory.shift();
    
    this.tdErrors.push(tdError);
    if (this.tdErrors.length > 100) this.tdErrors.shift();
    
    this.totalRewards += reward;
    
    return {
      tdError,
      V_current: this.values.get(currentState),
      V_next: this.values.get(nextState),
      eligibility: this.eligibility.get(currentState),
    };
  }

  reward(stateId, amount) {
    // Direct reward injection
    if (!this.values.has(stateId)) this.initializeState(stateId);
    
    const current = this.values.get(stateId);
    const phiWeightedReward = amount * PHI;
    this.values.set(stateId, current + phiWeightedReward * ALPHA);
    
    this.totalRewards += amount;
    
    return { state: stateId, rewarded: amount, newValue: this.values.get(stateId) };
  }

  punish(stateId, amount) {
    return this.reward(stateId, -amount);
  }

  endEpisode() {
    this.episodeCount++;
    // Reset eligibility traces
    for (const state of this.eligibility.keys()) {
      this.eligibility.set(state, 0);
    }
    return { episode: this.episodeCount };
  }

  getValue(stateId) {
    return this.values.get(stateId) ?? 0;
  }

  getTopStates(limit = 10) {
    const sorted = [...this.values.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    return sorted.map(([state, value]) => ({ state, value }));
  }

  getAverageTDError() {
    if (this.tdErrors.length === 0) return 0;
    return this.tdErrors.reduce((a, b) => a + b, 0) / this.tdErrors.length;
  }

  getMetrics() {
    return {
      stateCount: this.values.size,
      totalRewards: this.totalRewards,
      episodeCount: this.episodeCount,
      avgTDError: this.getAverageTDError(),
      topStates: this.getTopStates(5),
      recentRewards: this.rewardHistory.slice(-10),
      params: {
        gamma: GAMMA,
        lambda: LAMBDA,
        alpha: ALPHA,
      },
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { RewardSignalProtocol, GAMMA, LAMBDA, ALPHA };
export default RewardSignalProtocol;
