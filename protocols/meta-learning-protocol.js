/**
 * PROTO-221: Meta-Learning Protocol (MLP-2)
 * Learning to learn — adapts the organism's own learning hyperparameters.
 *
 * Implements MAML-inspired meta-learning: the organism doesn't just learn
 * from data, it learns *how to learn better*. Tracks which learning rates,
 * decay constants, and strategies produce the fastest convergence, then
 * auto-tunes them.
 *
 * Meta-gradient: ∂L_meta/∂θ = ∂L/∂θ' · ∂θ'/∂θ
 * Where θ' = θ - α·∇L(θ)  (inner loop)
 *
 * @module protocols/meta-learning-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// Default hyperparameter ranges
const HYPER_BOUNDS = {
  learningRate:   { min: 0.0001, max: 0.5, default: 0.01 },
  weightDecay:    { min: 0.0,    max: 0.1, default: 0.001 },
  momentum:       { min: 0.0,    max: 0.99, default: PHI_INV },
  batchSize:      { min: 1,      max: 128, default: 8 },
  discountFactor: { min: 0.5,    max: 0.999, default: PHI_INV },
};

class MetaLearningProtocol {
  constructor(config = {}) {
    // Current hyperparameters
    this.hyperparams = {};
    for (const [key, bounds] of Object.entries(HYPER_BOUNDS)) {
      this.hyperparams[key] = config[key] || bounds.default;
    }

    // Meta-learning state
    this.innerLoop = [];       // Task-level learning episodes
    this.outerLoop = [];       // Meta-level learning history
    this.metaGradients = {};   // Accumulated meta-gradients per hyperparam
    this.taskPerformance = []; // Performance per task for adaptation tracking

    // Meta hyperparameters (learning rate for the learning rate!)
    this.metaLR = config.metaLR || 0.001;
    this.innerSteps = config.innerSteps || 5;
    this.outerSteps = 0;

    // Statistics
    this.stats = {
      tasksCompleted: 0,
      adaptations: 0,
      convergenceImprovement: 0,
      bestPerformance: 0,
    };

    // Initialize meta-gradients
    for (const key of Object.keys(HYPER_BOUNDS)) {
      this.metaGradients[key] = 0;
    }
  }

  // ── Inner Loop: Task-Level Learning ────────────────────────────────────

  /**
   * Begin a new learning task (inner loop)
   * Returns a snapshot of current hyperparams for this task
   */
  beginTask(taskId) {
    const snapshot = { ...this.hyperparams };
    this.innerLoop.push({
      taskId,
      startParams: snapshot,
      steps: [],
      startTime: Date.now(),
    });
    return snapshot;
  }

  /**
   * Record a learning step within the current task
   * @param {object|number} data - Step data object { loss, accuracy } or loss value
   * @param {object} gradients - Gradients w.r.t. parameters (when data is number)
   */
  recordStep(data, gradients = {}) {
    const currentTask = this.innerLoop[this.innerLoop.length - 1];
    if (!currentTask) return;

    if (typeof data === 'object' && data !== null) {
      currentTask.steps.push({
        loss: data.loss,
        accuracy: data.accuracy,
        timestamp: Date.now(),
      });
    } else {
      currentTask.steps.push({
        loss: data,
        gradients,
        timestamp: Date.now(),
      });
    }

    return currentTask.steps.length;
  }

  /**
   * End the current task and compute meta-gradient
   * @param {number} [finalLoss] - Final loss after inner loop (derived from steps if omitted)
   * @returns {object} Task summary with convergence metrics
   */
  endTask(finalLoss) {
    const currentTask = this.innerLoop[this.innerLoop.length - 1];
    if (!currentTask) return null;

    const steps = currentTask.steps;
    const initialLoss = steps[0]?.loss || 1.0;
    const lastStep = steps[steps.length - 1];

    if (finalLoss === undefined) {
      finalLoss = lastStep?.loss ?? initialLoss;
    }

    const finalAccuracy = lastStep?.accuracy ?? 0;
    const convergenceRate = initialLoss > 0 ? (initialLoss - finalLoss) / initialLoss : 0;
    const stepCount = steps.length;
    const duration = Date.now() - currentTask.startTime;

    // Compute effectiveness (how well did current hyperparams work?)
    const effectiveness = convergenceRate * PHI + (stepCount > 0 ? 1 / stepCount : 0);

    const taskResult = {
      taskId: currentTask.taskId,
      initialLoss,
      finalLoss,
      finalAccuracy,
      convergenceRate,
      improvement: initialLoss - finalLoss,
      stepCount,
      duration,
      effectiveness,
      hyperparams: currentTask.startParams,
    };

    this.taskPerformance.push(taskResult);
    this.stats.tasksCompleted++;

    if (effectiveness > this.stats.bestPerformance) {
      this.stats.bestPerformance = effectiveness;
    }

    // Compute meta-gradients (how should we change hyperparams?)
    this._computeMetaGradients(taskResult);

    return taskResult;
  }

  // ── Outer Loop: Meta-Level Adaptation ──────────────────────────────────

  /**
   * Run the outer loop: adapt hyperparameters based on accumulated meta-gradients
   * Call this after completing several tasks
   */
  adapt() {
    if (this.taskPerformance.length < 2) return null;

    const before = { ...this.hyperparams };

    // Apply meta-gradients with meta learning rate
    for (const [key, bounds] of Object.entries(HYPER_BOUNDS)) {
      const gradient = this.metaGradients[key] || 0;
      const update = this.metaLR * gradient;

      this.hyperparams[key] = Math.max(
        bounds.min,
        Math.min(bounds.max, this.hyperparams[key] + update)
      );

      // Reset meta-gradient
      this.metaGradients[key] = 0;
    }

    this.outerSteps++;
    this.stats.adaptations++;

    // Record adaptation
    const recent = this.taskPerformance.slice(-5);
    const avgEffectiveness = recent.reduce((s, t) => s + t.effectiveness, 0) / recent.length;

    this.outerLoop.push({
      step: this.outerSteps,
      before,
      after: { ...this.hyperparams },
      avgEffectiveness,
      timestamp: Date.now(),
    });

    return {
      step: this.outerSteps,
      before,
      after: { ...this.hyperparams },
      avgEffectiveness,
    };
  }

  /**
   * Compute meta-gradients from a task result
   * Uses finite differences to estimate how each hyperparam affects performance
   */
  _computeMetaGradients(taskResult) {
    if (this.taskPerformance.length < 2) return;

    const prev = this.taskPerformance[this.taskPerformance.length - 2];
    const curr = taskResult;

    const deltaPerf = curr.effectiveness - prev.effectiveness;

    for (const key of Object.keys(HYPER_BOUNDS)) {
      const deltaParam = curr.hyperparams[key] - prev.hyperparams[key];

      if (Math.abs(deltaParam) > 1e-10) {
        // Finite difference approximation of meta-gradient
        const metaGrad = deltaPerf / deltaParam;
        // Exponential moving average
        this.metaGradients[key] = PHI_INV * this.metaGradients[key] + (1 - PHI_INV) * metaGrad;
      }
    }
  }

  // ── Exploration: Try New Hyperparameter Configurations ─────────────────

  /**
   * Suggest a new hyperparameter configuration to try
   * Uses Thompson sampling with phi-weighted exploration
   */
  suggest() {
    const suggestion = {};

    for (const [key, bounds] of Object.entries(HYPER_BOUNDS)) {
      const current = this.hyperparams[key];
      const gradient = this.metaGradients[key] || 0;

      // Exploration noise scaled by phi inverse
      const explorationScale = (bounds.max - bounds.min) * PHI_INV * 0.1;
      const noise = (Math.random() - 0.5) * 2 * explorationScale;

      // Suggested value = current + gradient direction + exploration noise
      const suggested = current + Math.sign(gradient) * explorationScale * 0.5 + noise;
      suggestion[key] = Math.max(bounds.min, Math.min(bounds.max, suggested));
    }

    return suggestion;
  }

  // ── Query Interface ────────────────────────────────────────────────────

  /**
   * Get the current optimal hyperparameters
   */
  getHyperparams() {
    return { ...this.hyperparams };
  }

  /**
   * Get learning history for analysis
   */
  getHistory() {
    return {
      tasksCompleted: this.stats.tasksCompleted,
      outerSteps: this.outerSteps,
      taskPerformance: this.taskPerformance.slice(-20),
      outerLoop: this.outerLoop.slice(-10),
      currentHyperparams: { ...this.hyperparams },
      metaGradients: { ...this.metaGradients },
    };
  }

  /**
   * Get convergence report
   */
  getConvergenceReport() {
    if (this.taskPerformance.length === 0) {
      return { converged: false, message: 'No tasks completed yet' };
    }

    const recent = this.taskPerformance.slice(-5);
    const avgRate = recent.reduce((s, t) => s + t.convergenceRate, 0) / recent.length;
    const variance = recent.reduce((s, t) => s + Math.pow(t.convergenceRate - avgRate, 2), 0) / recent.length;

    return {
      converged: variance < 0.01 && avgRate > 0.5,
      avgConvergenceRate: avgRate,
      variance,
      tasksAnalyzed: recent.length,
      bestPerformance: this.stats.bestPerformance,
      totalAdaptations: this.stats.adaptations,
    };
  }

  /**
   * Compute meta-gradient for a specific hyperparameter
   * @param {string} key - Hyperparameter name
   * @returns {number} Estimated gradient
   */
  computeMetaGradient(key) {
    if (this.taskPerformance.length < 2) return 0;

    const prev = this.taskPerformance[this.taskPerformance.length - 2];
    const curr = this.taskPerformance[this.taskPerformance.length - 1];
    const deltaPerf = curr.effectiveness - prev.effectiveness;
    const deltaParam = curr.hyperparams[key] - prev.hyperparams[key];

    if (Math.abs(deltaParam) > 1e-10) {
      return deltaPerf / deltaParam;
    }
    return this.metaGradients[key] || 0;
  }

  /**
   * Set hyperparameters, clamping to bounds
   * @param {object} params - Hyperparameters to update
   */
  setHyperparams(params) {
    for (const [key, value] of Object.entries(params)) {
      if (key in HYPER_BOUNDS) {
        const bounds = HYPER_BOUNDS[key];
        this.hyperparams[key] = Math.max(bounds.min, Math.min(bounds.max, value));
      }
    }
  }

  /**
   * Reset all meta-gradients to zero
   */
  resetMetaGradients() {
    for (const key of Object.keys(this.metaGradients)) {
      this.metaGradients[key] = 0;
    }
  }

  /**
   * Get current stats
   * @returns {object} Copy of stats
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Get a comprehensive meta-learning report
   * @returns {object} Report with hyperparams, stats, and history
   */
  getMetaReport() {
    return {
      hyperparams: { ...this.hyperparams },
      currentParams: { ...this.hyperparams },
      stats: { ...this.stats },
      taskCount: this.taskPerformance.length,
      history: this.taskPerformance.slice(-10),
      outerSteps: this.outerSteps,
      metaGradients: { ...this.metaGradients },
    };
  }

  getState() {
    return {
      hyperparams: { ...this.hyperparams },
      stats: { ...this.stats },
      outerSteps: this.outerSteps,
      taskCount: this.taskPerformance.length,
      synapseCount: Object.keys(this.metaGradients).length,
    };
  }
}

export { MetaLearningProtocol, HYPER_BOUNDS };
export default MetaLearningProtocol;
