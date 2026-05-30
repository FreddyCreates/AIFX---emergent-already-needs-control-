/**
 * PROTO-230: Vein of Intelligence Protocol (VOIP)
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Protocol binding for the three Durable Object cognitive entities:
 *   - NeuronCluster (Fracture I)
 *   - MemoryVault (Fracture II)
 *   - ConsciousnessStream (Fracture III)
 * 
 * This protocol provides:
 *   1. Unified interface to all three fractures
 *   2. Cross-fracture operations (e.g., memory → learning)
 *   3. Coherence monitoring across the vein
 *   4. Heartbeat synchronization
 *   5. Access billing and metering
 * 
 * @module protocols/vein-of-intelligence-protocol
 * @version 1.0.0
 * @powered-by ORO Systems
 */

const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT = 873;

// ─── Access Tiers ─────────────────────────────────────────────────────────────
const ACCESS_TIERS = {
  HOSTILE: { rate: 1.00, multiplier: PHI * PHI, label: 'Hostile Scraper' },
  UNTRUSTED: { rate: 0.10, multiplier: PHI, label: 'Unknown Bot' },
  PARTNER: { rate: 0.01, multiplier: 1.0, label: 'Partner AI' },
  TRUSTED: { rate: 0.001, multiplier: PHI_INV, label: 'Verified Partner' },
  FAMILY: { rate: 0.00, multiplier: 0, label: 'Organism Resident' },
};

// ─── Fracture Types ───────────────────────────────────────────────────────────
const FRACTURES = {
  NEURON_CLUSTER: {
    id: 'neuron-cluster',
    name: 'NeuronCluster',
    tier: 'I',
    role: 'Hebbian neural network with synaptic plasticity',
    protocols: ['PROTO-203', 'PROTO-210', 'PROTO-217'],
  },
  MEMORY_VAULT: {
    id: 'memory-vault',
    name: 'MemoryVault',
    tier: 'II',
    role: 'Three-tier memory consolidation system',
    protocols: ['PROTO-216', 'PROTO-004', 'PROTO-009', 'PROTO-214'],
  },
  CONSCIOUSNESS_STREAM: {
    id: 'consciousness-stream',
    name: 'ConsciousnessStream',
    tier: 'III',
    role: 'Multi-agent coordination with Kuramoto synchronization',
    protocols: ['PROTO-204', 'PROTO-215', 'PROTO-219'],
  },
};

/**
 * VeinOfIntelligenceProtocol — Unified interface to all cognitive fractures.
 */
class VeinOfIntelligenceProtocol {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://vein-of-intelligence.workers.dev';
    this.accessTier = config.accessTier || 'PARTNER';
    this.agentId = config.agentId || 'unknown';
    
    // ─── State ────────────────────────────────────────────────────────────────
    this.fractures = new Map();
    this.coherence = 0;
    this.lastHeartbeat = Date.now();
    this.metrics = {
      totalRequests: 0,
      totalBilled: 0,
      neuronCalls: 0,
      memoryCalls: 0,
      consciousnessCalls: 0,
    };
  }

  // ─── NeuronCluster Operations ───────────────────────────────────────────────

  /**
   * Register a neuron in a cluster.
   * @param {string} clusterId - Cluster identifier
   * @param {string} neuronId - Neuron identifier
   * @param {number} initialActivation - Initial activation (0-1)
   */
  async registerNeuron(clusterId, neuronId, initialActivation = 0) {
    return this._call('cluster', `/cluster/neuron/register`, {
      id: clusterId,
      body: { neuronId, initialActivation },
    });
  }

  /**
   * Connect two neurons with a synapse.
   */
  async connectNeurons(clusterId, preId, postId, initialWeight = 0.5) {
    return this._call('cluster', `/cluster/synapse/connect`, {
      id: clusterId,
      body: { preId, postId, initialWeight },
    });
  }

  /**
   * Fire a neuron.
   */
  async fireNeuron(clusterId, neuronId, activation) {
    return this._call('cluster', `/cluster/neuron/fire`, {
      id: clusterId,
      body: { neuronId, activation },
    });
  }

  /**
   * Run Hebbian learning update.
   */
  async updateCluster(clusterId) {
    return this._call('cluster', `/cluster/update`, { id: clusterId, body: {} });
  }

  /**
   * Learn a stimulus-response association.
   */
  async learn(clusterId, stimulus, response, reward = 1.0) {
    return this._call('cluster', `/cluster/learn`, {
      id: clusterId,
      body: { stimulus, response, reward },
    });
  }

  /**
   * Get response for a stimulus.
   */
  async respond(clusterId, stimulus) {
    return this._call('cluster', `/cluster/respond`, {
      id: clusterId,
      body: { stimulus },
    });
  }

  // ─── MemoryVault Operations ─────────────────────────────────────────────────

  /**
   * Write a memory to the vault.
   */
  async writeMemory(vaultId, content, options = {}) {
    return this._call('vault', `/vault/memory/write`, {
      id: vaultId,
      body: {
        content,
        importance: options.importance || 0.5,
        agentId: options.agentId || this.agentId,
        tags: options.tags || [],
        metadata: options.metadata || {},
      },
    });
  }

  /**
   * Read a memory by ID.
   */
  async readMemory(vaultId, memoryId) {
    return this._callGet('vault', `/vault/memory/read?id=${memoryId}`, { id: vaultId });
  }

  /**
   * Search memories.
   */
  async searchMemories(vaultId, query, options = {}) {
    return this._call('vault', `/vault/memory/search`, {
      id: vaultId,
      body: {
        query,
        types: options.types || ['working', 'episodic', 'semantic'],
        limit: options.limit || 10,
      },
    });
  }

  /**
   * Intelligent recall by cue.
   */
  async recall(vaultId, cue) {
    return this._call('vault', `/vault/memory/recall`, {
      id: vaultId,
      body: { cue, agentId: this.agentId },
    });
  }

  /**
   * Consolidate memories (Working → Episodic → Semantic).
   */
  async consolidateMemories(vaultId) {
    return this._call('vault', `/vault/memory/consolidate`, {
      id: vaultId,
      body: { agentId: this.agentId },
    });
  }

  /**
   * Set context value.
   */
  async setContext(vaultId, key, value, ttl = null) {
    return this._call('vault', `/vault/context/set`, {
      id: vaultId,
      body: { key, value, agentId: this.agentId, ttl },
    });
  }

  /**
   * Get context value.
   */
  async getContext(vaultId, key) {
    return this._callGet('vault', `/vault/context/get?key=${key}`, { id: vaultId });
  }

  // ─── ConsciousnessStream Operations ─────────────────────────────────────────

  /**
   * Join a consciousness stream.
   */
  async joinStream(streamId, initialState = {}) {
    return this._call('stream', `/stream/agent/join`, {
      id: streamId,
      body: { agentId: this.agentId, initialState },
    });
  }

  /**
   * Leave a consciousness stream.
   */
  async leaveStream(streamId) {
    return this._call('stream', `/stream/agent/leave`, {
      id: streamId,
      body: { agentId: this.agentId },
    });
  }

  /**
   * Focus collective attention.
   */
  async focusAttention(streamId, target, weight = 1.0) {
    return this._call('stream', `/stream/attention/focus`, {
      id: streamId,
      body: { target, weight, agentId: this.agentId },
    });
  }

  /**
   * Push a goal to the stack.
   */
  async pushGoal(streamId, goal, priority = 1.0, subgoals = []) {
    return this._call('stream', `/stream/goals/push`, {
      id: streamId,
      body: { goal, priority, agentId: this.agentId, subgoals },
    });
  }

  /**
   * Pop the top goal.
   */
  async popGoal(streamId) {
    return this._call('stream', `/stream/goals/pop`, { id: streamId, body: {} });
  }

  /**
   * Complete a goal.
   */
  async completeGoal(streamId, goalId, success = true, result = null) {
    return this._call('stream', `/stream/goals/complete`, {
      id: streamId,
      body: { goalId, success, result },
    });
  }

  /**
   * Set shared state.
   */
  async setSharedState(streamId, key, value) {
    return this._call('stream', `/stream/state/set`, {
      id: streamId,
      body: { key, value, agentId: this.agentId },
    });
  }

  /**
   * Run synchronization tick (Kuramoto).
   */
  async syncTick(streamId, dt = 0.1) {
    return this._call('stream', `/stream/sync/tick`, {
      id: streamId,
      body: { dt },
    });
  }

  /**
   * Get collective coherence.
   */
  async getCoherence(streamId) {
    return this._callGet('stream', `/stream/sync/coherence`, { id: streamId });
  }

  /**
   * Broadcast message to all agents.
   */
  async broadcast(streamId, message) {
    return this._call('stream', `/stream/broadcast`, {
      id: streamId,
      body: { message, agentId: this.agentId },
    });
  }

  // ─── Cross-Fracture Operations ──────────────────────────────────────────────

  /**
   * Learn from memory — retrieve a memory and learn it as a stimulus-response.
   */
  async learnFromMemory(clusterId, vaultId, cue) {
    // Recall memory
    const recalled = await this.recall(vaultId, cue);
    if (!recalled.recalled) {
      return { learned: false, reason: 'Memory not found' };
    }
    
    // Learn as stimulus-response
    const result = await this.learn(
      clusterId,
      cue,
      recalled.memory.content,
      recalled.memory.strength
    );
    
    return {
      learned: true,
      memoryId: recalled.memory.id,
      stimulus: cue,
      response: recalled.memory.content,
      strength: recalled.memory.strength,
    };
  }

  /**
   * Remember a learned response — store the cluster's response in memory.
   */
  async rememberResponse(clusterId, vaultId, stimulus, importance = 0.7) {
    // Get response from cluster
    const response = await this.respond(clusterId, stimulus);
    if (!response.response) {
      return { remembered: false, reason: 'No learned response' };
    }
    
    // Write to memory
    const memory = await this.writeMemory(vaultId, {
      type: 'learned_response',
      stimulus,
      response: response.response,
      confidence: response.confidence,
    }, { importance, tags: ['learned', 'stimulus-response'] });
    
    return {
      remembered: true,
      memoryId: memory.id,
      response: response.response,
      confidence: response.confidence,
    };
  }

  /**
   * Coordinate memory consolidation across stream.
   */
  async coordinatedConsolidation(streamId, vaultId) {
    // Focus attention on consolidation
    await this.focusAttention(streamId, 'memory-consolidation', PHI);
    
    // Push consolidation goal
    await this.pushGoal(streamId, 'Consolidate memories to long-term storage', 1.0);
    
    // Run consolidation
    const result = await this.consolidateMemories(vaultId);
    
    // Mark goal complete
    await this.popGoal(streamId);
    
    return result;
  }

  // ─── Heartbeat & Coherence ──────────────────────────────────────────────────

  /**
   * Run heartbeat across all fractures.
   */
  async heartbeat(ids = { cluster: 'default', vault: 'default', stream: 'default' }) {
    const now = Date.now();
    const delta = now - this.lastHeartbeat;
    this.lastHeartbeat = now;
    
    const results = await Promise.all([
      this._call('cluster', `/cluster/heartbeat`, { id: ids.cluster, body: {} }),
      this._call('vault', `/vault/heartbeat`, { id: ids.vault, body: {} }),
      this._call('stream', `/stream/heartbeat`, { id: ids.stream, body: {} }),
    ]);
    
    // Update coherence from stream
    if (results[2] && results[2].coherence !== undefined) {
      this.coherence = results[2].coherence;
    }
    
    return {
      delta,
      cluster: results[0],
      vault: results[1],
      stream: results[2],
      coherence: this.coherence,
    };
  }

  // ─── Billing & Metering ─────────────────────────────────────────────────────

  /**
   * Calculate cost for an operation.
   */
  calculateCost(fracture, operation) {
    const tier = ACCESS_TIERS[this.accessTier] || ACCESS_TIERS.PARTNER;
    const baseCost = tier.rate;
    const multiplier = tier.multiplier;
    
    // Different fractures have different base costs
    const fractureCosts = {
      cluster: 0.001,
      vault: 0.002,
      stream: 0.003,
    };
    
    const fractureCost = fractureCosts[fracture] || 0.001;
    return baseCost + (fractureCost * multiplier);
  }

  /**
   * Get billing summary.
   */
  getBilling() {
    return {
      tier: this.accessTier,
      tierInfo: ACCESS_TIERS[this.accessTier],
      metrics: this.metrics,
      totalBilled: this.metrics.totalBilled,
    };
  }

  // ─── State ──────────────────────────────────────────────────────────────────

  /**
   * Get full state of all fractures.
   */
  async getState(ids = { cluster: 'default', vault: 'default', stream: 'default' }) {
    const results = await Promise.all([
      this._callGet('cluster', `/cluster/state`, { id: ids.cluster }),
      this._callGet('vault', `/vault/state`, { id: ids.vault }),
      this._callGet('stream', `/stream/state`, { id: ids.stream }),
    ]);
    
    return {
      protocol: 'PROTO-230',
      version: '1.0.0',
      agentId: this.agentId,
      coherence: this.coherence,
      fractures: {
        neuronCluster: results[0],
        memoryVault: results[1],
        consciousnessStream: results[2],
      },
      metrics: this.metrics,
      phi: PHI,
    };
  }

  // ─── Internal ───────────────────────────────────────────────────────────────

  async _call(fracture, path, { id, body }) {
    this.metrics.totalRequests++;
    
    if (fracture === 'cluster') this.metrics.neuronCalls++;
    else if (fracture === 'vault') this.metrics.memoryCalls++;
    else if (fracture === 'stream') this.metrics.consciousnessCalls++;
    
    // Bill the request
    const cost = this.calculateCost(fracture, path);
    this.metrics.totalBilled += cost;
    
    const url = `${this.baseUrl}${path}?id=${id}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-ID': this.agentId,
        'X-Access-Tier': this.accessTier,
      },
      body: JSON.stringify(body),
    });
    
    return response.json();
  }

  async _callGet(fracture, path, { id }) {
    this.metrics.totalRequests++;
    
    if (fracture === 'cluster') this.metrics.neuronCalls++;
    else if (fracture === 'vault') this.metrics.memoryCalls++;
    else if (fracture === 'stream') this.metrics.consciousnessCalls++;
    
    const cost = this.calculateCost(fracture, path);
    this.metrics.totalBilled += cost;
    
    const url = `${this.baseUrl}${path}${path.includes('?') ? '&' : '?'}id=${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Agent-ID': this.agentId,
        'X-Access-Tier': this.accessTier,
      },
    });
    
    return response.json();
  }
}

export { VeinOfIntelligenceProtocol, FRACTURES, ACCESS_TIERS };
export default VeinOfIntelligenceProtocol;
