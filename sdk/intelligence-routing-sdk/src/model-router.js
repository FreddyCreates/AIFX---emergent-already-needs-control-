import crypto from 'node:crypto';

/**
 * @typedef {Object} ModelConfig
 * @property {number} priority - Routing priority (lower = higher priority)
 * @property {number} latencyBudget - Maximum acceptable latency in ms
 * @property {string} costTier - Cost tier: 'free' | 'standard' | 'premium'
 */

/**
 * @typedef {Object} Task
 * @property {string} type - Task type identifier
 * @property {string[]} requirements - Required capabilities
 * @property {string} priority - Task priority: 'low' | 'medium' | 'high' | 'critical'
 */

const COST_TIER_WEIGHTS = { free: 0, standard: 1, premium: 2 };
const PRIORITY_WEIGHTS = { low: 0, medium: 1, high: 2, critical: 3 };

/**
 * ModelRouter — selects the best model for a given task based on capability
 * match, priority alignment, and cost efficiency. Supports adaptive routing
 * via outcome recording.
 */
export class ModelRouter {
  constructor() {
    /** @type {Map<string, {modelId: string, capabilities: string[], config: ModelConfig, stats: {successes: number, failures: number, totalTasks: number}}>} */
    this._models = new Map();
  }

  /**
   * Registers a model with its capabilities and routing configuration.
   * @param {string} modelId - Unique model identifier
   * @param {string[]} capabilities - Array of capability strings the model supports
   * @param {ModelConfig} config - Routing configuration
   * @returns {{ modelId: string, registered: boolean }}
   */
  registerModel(modelId, capabilities, config) {
    if (!modelId || !Array.isArray(capabilities)) {
      throw new Error('modelId (string) and capabilities (array) are required');
    }

    const entry = {
      modelId,
      capabilities: [...capabilities],
      config: {
        priority: config?.priority ?? 10,
        latencyBudget: config?.latencyBudget ?? 5000,
        costTier: config?.costTier ?? 'standard',
      },
      stats: { successes: 0, failures: 0, totalTasks: 0 },
    };

    this._models.set(modelId, entry);
    return { modelId, registered: true };
  }

  /**
   * Routes a task to the single best matching model.
   * Scoring: capability coverage × priority alignment − cost penalty + success rate bonus.
   * @param {Task} task
   * @returns {{ modelId: string, score: number, capabilities: string[] } | null}
   */
  route(task) {
    const ranked = this._rankModels(task);
    return ranked.length > 0 ? ranked[0] : null;
  }

  /**
   * Returns the top N models for multi-model orchestration.
   * @param {Task} task
   * @param {number} count - Number of models to return
   * @returns {Array<{ modelId: string, score: number, capabilities: string[] }>}
   */
  routeMulti(task, count = 2) {
    const ranked = this._rankModels(task);
    return ranked.slice(0, count);
  }

  /**
   * Returns the full routing table — all registered models and their stats.
   * @returns {Array<{ modelId: string, capabilities: string[], config: ModelConfig, stats: object }>}
   */
  getRoutingTable() {
    return Array.from(this._models.values()).map((m) => ({
      modelId: m.modelId,
      capabilities: [...m.capabilities],
      config: { ...m.config },
      stats: { ...m.stats },
    }));
  }

  /**
   * Records the outcome of a task routed to a model for adaptive scoring.
   * @param {string} modelId
   * @param {string} taskId
   * @param {{ success: boolean, latency?: number }} result
   */
  recordOutcome(modelId, taskId, result) {
    const model = this._models.get(modelId);
    if (!model) throw new Error(`Unknown model: ${modelId}`);

    model.stats.totalTasks += 1;
    if (result.success) {
      model.stats.successes += 1;
    } else {
      model.stats.failures += 1;
    }
  }

  /* ---- internal ---- */

  /**
   * Ranks all models against a task and returns sorted results.
   * @param {Task} task
   * @returns {Array<{ modelId: string, score: number, capabilities: string[] }>}
   * @private
   */
  _rankModels(task) {
    if (!task || !Array.isArray(task.requirements)) {
      throw new Error('task.requirements must be an array');
    }

    const taskPriority = PRIORITY_WEIGHTS[task.priority] ?? 1;
    const results = [];

    for (const model of this._models.values()) {
      const matched = task.requirements.filter((r) =>
        model.capabilities.includes(r),
      );
      if (matched.length === 0) continue;

      const coverage = matched.length / task.requirements.length;
      const costPenalty = COST_TIER_WEIGHTS[model.config.costTier] ?? 1;
      const priorityBonus =
        taskPriority >= 2 ? (model.config.priority <= 3 ? 2 : 0) : 0;

      const successRate =
        model.stats.totalTasks > 0
          ? model.stats.successes / model.stats.totalTasks
          : 0.5;

      const score =
        coverage * 10 + priorityBonus + successRate * 3 - costPenalty;

      results.push({
        modelId: model.modelId,
        score: Math.round(score * 1000) / 1000,
        capabilities: matched,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results;
  }
}

export default ModelRouter;
