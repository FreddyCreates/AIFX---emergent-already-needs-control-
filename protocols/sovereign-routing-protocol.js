/**
 * PROTO-001: Sovereign Routing Protocol (SRP)
 * Adaptive Routing Intelligence that learns optimal model selection from outcome feedback.
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

class SovereignRoutingProtocol {
  /**
   * @param {Object} config - Configuration object
   */
  constructor(config = {}) {
    this.routingTable = {};
    this.feedbackHistory = [];
    this.learningRate = 1 / PHI;
    this.metrics = { totalRouted: 0, totalSuccess: 0, totalLatency: 0 };
    
    // Initialize routing table for 40 model families
    const families = [
      'gpt-4o','gpt-4-turbo','gpt-4','gpt-3.5-turbo','o1-preview','o1-mini','o3-mini','o3',
      'claude-3.5-sonnet','claude-3.5-haiku','claude-3-opus','claude-3-sonnet','claude-3-haiku','claude-4',
      'gemini-2.0-flash','gemini-1.5-pro','gemini-1.5-flash','gemini-ultra',
      'llama-3.1-405b','llama-3.1-70b','llama-3.1-8b','llama-3.2-90b','llama-3.2-11b','llama-3.2-3b',
      'mistral-large','mistral-medium','mistral-small','mixtral-8x22b','mixtral-8x7b',
      'command-r-plus','command-r','command-light',
      'deepseek-v3','deepseek-r1','deepseek-coder',
      'qwen-2.5-72b','qwen-2.5-32b',
      'phi-3-medium','phi-3-mini','dbrx'
    ];
    
    for (const family of families) {
      this.routingTable[family] = {
        id: family,
        reputation: 0.8,
        capability: this._initCapability(family),
        totalTasks: 0,
        successCount: 0,
        avgLatency: HEARTBEAT
      };
    }
    
    if (config.models) {
      for (const m of config.models) {
        if (!this.routingTable[m.id]) {
          this.routingTable[m.id] = { id: m.id, reputation: m.reputation || 0.5, capability: m.capability || {}, totalTasks: 0, successCount: 0, avgLatency: HEARTBEAT };
        }
      }
    }
  }

  _initCapability(family) {
    const caps = { reasoning: 0.5, coding: 0.5, creative: 0.5, analysis: 0.5, conversation: 0.5 };
    if (family.startsWith('gpt') || family.startsWith('o1') || family.startsWith('o3')) {
      caps.reasoning = 0.9; caps.coding = 0.85; caps.analysis = 0.88;
    } else if (family.startsWith('claude')) {
      caps.reasoning = 0.88; caps.creative = 0.9; caps.analysis = 0.87;
    } else if (family.startsWith('gemini')) {
      caps.reasoning = 0.85; caps.analysis = 0.9; caps.creative = 0.8;
    } else if (family.startsWith('llama')) {
      caps.coding = 0.8; caps.reasoning = 0.75;
    } else if (family.startsWith('mistral') || family.startsWith('mixtral')) {
      caps.coding = 0.82; caps.reasoning = 0.78;
    } else if (family.startsWith('deepseek')) {
      caps.coding = 0.88; caps.reasoning = 0.82;
    }
    return caps;
  }

  /**
   * Route a task to the best model.
   * Scores each model: S(m) = φ^(4-p) × C(m) × R(m)
   * @param {Object} task - Task with {id, type, priority, requirements}
   * @returns {Object} - {modelId, score, alternatives}
   */
  route(task) {
    const priority = task.priority || 0;
    const taskType = task.type || 'reasoning';
    const scored = [];

    for (const [modelId, model] of Object.entries(this.routingTable)) {
      const capMatch = model.capability[taskType] || 0.5;
      const score = Math.pow(PHI, 4 - priority) * capMatch * model.reputation;
      scored.push({ modelId, score });
    }

    scored.sort((a, b) => b.score - a.score);
    this.metrics.totalRouted++;

    return {
      modelId: scored[0].modelId,
      score: scored[0].score,
      alternatives: scored.slice(1, 4).map(s => s.modelId)
    };
  }

  /**
   * Record outcome of a routed task to update model reputation.
   * Uses exponential moving average with alpha = 1/φ.
   * @param {string} taskId
   * @param {string} modelId
   * @param {boolean} success
   * @param {number} latencyMs
   */
  recordOutcome(taskId, modelId, success, latencyMs) {
    const alpha = 1 / PHI;
    const model = this.routingTable[modelId];
    if (!model) return;

    model.totalTasks++;
    if (success) model.successCount++;
    model.reputation = alpha * (success ? 1 : 0) + (1 - alpha) * model.reputation;
    model.avgLatency = alpha * latencyMs + (1 - alpha) * model.avgLatency;

    this.feedbackHistory.push({ taskId, modelId, success, latencyMs, timestamp: Date.now() });
    if (success) this.metrics.totalSuccess++;
    this.metrics.totalLatency += latencyMs;
  }

  /**
   * Try next model in phi-weighted fallback chain.
   * @param {Object} task
   * @param {string[]} failedModels
   * @returns {Object} - Next model to try
   */
  cascadeFallback(task, failedModels) {
    const failedSet = new Set(failedModels);
    const taskType = task.type || 'reasoning';
    const priority = task.priority || 0;
    const candidates = [];

    for (const [modelId, model] of Object.entries(this.routingTable)) {
      if (failedSet.has(modelId)) continue;
      const capMatch = model.capability[taskType] || 0.5;
      const score = Math.pow(PHI, 4 - priority) * capMatch * model.reputation;
      candidates.push({ modelId, score });
    }

    candidates.sort((a, b) => b.score - a.score);

    // Apply phi-weighted decay to fallback positions
    const weighted = candidates.map((c, i) => ({
      ...c,
      adjustedScore: c.score * Math.pow(PHI, -i)
    }));

    if (weighted.length === 0) return { modelId: null, score: 0, exhausted: true };
    return { modelId: weighted[0].modelId, score: weighted[0].adjustedScore, exhausted: false };
  }

  /**
   * Recompute routing weights across all models using accumulated feedback.
   */
  rebalance() {
    for (const model of Object.values(this.routingTable)) {
      if (model.totalTasks > 0) {
        const empiricalSuccess = model.successCount / model.totalTasks;
        const alpha = 1 / PHI;
        model.reputation = alpha * empiricalSuccess + (1 - alpha) * model.reputation;
      }
    }
  }

  /**
   * Returns current model scores.
   * @returns {Object} - Map of modelId to score data
   */
  getRoutingTable() {
    const table = {};
    for (const [id, model] of Object.entries(this.routingTable)) {
      table[id] = {
        reputation: model.reputation,
        capability: { ...model.capability },
        totalTasks: model.totalTasks,
        successRate: model.totalTasks > 0 ? model.successCount / model.totalTasks : 0,
        avgLatency: model.avgLatency
      };
    }
    return table;
  }

  /**
   * Returns routing metrics.
   * @returns {Object} - {totalRouted, successRate, avgLatency, topModel}
   */
  getMetrics() {
    let topModel = null;
    let topRep = -1;
    for (const [id, model] of Object.entries(this.routingTable)) {
      if (model.reputation > topRep) {
        topRep = model.reputation;
        topModel = id;
      }
    }
    const totalRouted = this.metrics.totalRouted;
    return {
      totalRouted,
      successRate: totalRouted > 0 ? this.metrics.totalSuccess / totalRouted : 0,
      avgLatency: totalRouted > 0 ? this.metrics.totalLatency / totalRouted : 0,
      topModel
    };
  }
}

export { SovereignRoutingProtocol };
export default SovereignRoutingProtocol;
