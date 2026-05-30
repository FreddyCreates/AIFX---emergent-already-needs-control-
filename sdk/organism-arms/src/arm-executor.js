import crypto from 'node:crypto';

/**
 * ArmExecutor — the organism's motor cortex.
 *
 * Dispatches commands to extension arms, collects results,
 * and feeds them back into the organism's intelligence loop.
 * Built on top of ArmRegistry — this is the execution layer.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

/**
 * @typedef {Object} ArmCommand
 * @property {string} targetArm - Slug of the arm to invoke
 * @property {string} intent - What the organism wants to achieve
 * @property {Object} payload - Data to pass to the arm
 * @property {number} [urgency=1] - Urgency multiplier (higher = more urgent)
 */

/**
 * @typedef {Object} ArmResult
 * @property {string} executionId - Unique execution ID
 * @property {string} arm - Slug of the arm that executed
 * @property {string} armType - Type of the arm (sensory/motor/cognitive)
 * @property {Object} output - Result from the arm
 * @property {number} duration - Execution time in ms
 * @property {number} phiScore - φ-weighted quality score
 * @property {number} timestamp - When execution completed
 */

export class ArmExecutor {
  /** @type {import('./arm-registry.js').ArmRegistry} */
  #registry;

  /** @type {ArmResult[]} */
  #executionLog;

  /** @type {number} */
  #maxLogSize;

  /** @type {number} */
  #totalExecutions;

  /** @type {number} */
  #failedExecutions;

  /**
   * @param {import('./arm-registry.js').ArmRegistry} registry
   * @param {Object} [options]
   * @param {number} [options.maxLogSize=500]
   */
  constructor(registry, options = {}) {
    this.#registry = registry;
    this.#executionLog = [];
    this.#maxLogSize = options.maxLogSize ?? 500;
    this.#totalExecutions = 0;
    this.#failedExecutions = 0;
  }

  /**
   * Execute a single arm command.
   * @param {ArmCommand} command
   * @returns {Promise<ArmResult>}
   */
  async reach(command) {
    const { targetArm, intent, payload, urgency = 1 } = command;

    const arm = this.#registry.getArm(targetArm);
    if (!arm) {
      throw new Error(`Arm "${targetArm}" not found in registry`);
    }
    if (!arm.available) {
      throw new Error(`Arm "${targetArm}" is currently unavailable`);
    }

    const executionId = crypto.randomUUID();
    const startTime = performance.now();

    try {
      const output = await Promise.resolve(arm.invoke({ intent, payload, urgency }));
      const duration = performance.now() - startTime;
      const phiScore = this.#calculatePhiScore(duration, urgency, arm.priority);

      const result = {
        executionId,
        arm: targetArm,
        armType: arm.armType,
        output,
        duration,
        phiScore,
        timestamp: Date.now(),
      };

      this.#logExecution(result);
      this.#totalExecutions++;
      return result;
    } catch (err) {
      this.#totalExecutions++;
      this.#failedExecutions++;
      throw new Error(`Arm "${targetArm}" execution failed: ${err.message}`);
    }
  }

  /**
   * Execute multiple arm commands in parallel (organism multi-arm reach).
   * @param {ArmCommand[]} commands
   * @returns {Promise<ArmResult[]>}
   */
  async reachAll(commands) {
    const sorted = [...commands].sort((a, b) => (b.urgency || 1) - (a.urgency || 1));
    return Promise.all(sorted.map(cmd => this.reach(cmd).catch(err => ({
      executionId: crypto.randomUUID(),
      arm: cmd.targetArm,
      armType: 'unknown',
      output: { error: err.message },
      duration: 0,
      phiScore: 0,
      timestamp: Date.now(),
    }))));
  }

  /**
   * Sense — invoke all available sensory arms with a context payload.
   * The organism opens its eyes and ears.
   * @param {Object} context - Environmental context to sense
   * @returns {Promise<ArmResult[]>}
   */
  async sense(context) {
    const sensoryArms = this.#registry.getArmsByType('sensory')
      .filter(arm => arm.available);

    const commands = sensoryArms.map(arm => ({
      targetArm: arm.slug,
      intent: 'sense',
      payload: context,
      urgency: arm.priority / (PHI * 6),
    }));

    return this.reachAll(commands);
  }

  /**
   * Think — invoke all available cognitive arms with a problem payload.
   * The organism reasons about what it has sensed.
   * @param {Object} problem - Problem to reason about
   * @returns {Promise<ArmResult[]>}
   */
  async think(problem) {
    const cognitiveArms = this.#registry.getArmsByType('cognitive')
      .filter(arm => arm.available);

    const commands = cognitiveArms.map(arm => ({
      targetArm: arm.slug,
      intent: 'think',
      payload: problem,
      urgency: arm.priority / (PHI * 8),
    }));

    return this.reachAll(commands);
  }

  /**
   * Act — invoke a specific motor arm with an action payload.
   * The organism moves a specific limb.
   * @param {string} armSlug - Which motor arm to use
   * @param {Object} action - Action to perform
   * @returns {Promise<ArmResult>}
   */
  async act(armSlug, action) {
    return this.reach({
      targetArm: armSlug,
      intent: 'act',
      payload: action,
      urgency: PHI,
    });
  }

  /**
   * Get execution statistics.
   * @returns {Object}
   */
  getStats() {
    return {
      totalExecutions: this.#totalExecutions,
      failedExecutions: this.#failedExecutions,
      successRate: this.#totalExecutions > 0
        ? (this.#totalExecutions - this.#failedExecutions) / this.#totalExecutions
        : 1,
      logSize: this.#executionLog.length,
      avgPhiScore: this.#executionLog.length > 0
        ? this.#executionLog.reduce((sum, r) => sum + r.phiScore, 0) / this.#executionLog.length
        : 0,
    };
  }

  /**
   * Get recent execution log.
   * @param {number} [limit=20]
   * @returns {ArmResult[]}
   */
  getLog(limit = 20) {
    return this.#executionLog.slice(-limit);
  }

  /**
   * φ-weighted quality score: faster + higher-priority + more-urgent = higher score.
   */
  #calculatePhiScore(duration, urgency, priority) {
    const speedFactor = Math.max(0, 1 - (duration / (HEARTBEAT_MS * PHI)));
    return (speedFactor * priority * urgency) / PHI;
  }

  #logExecution(result) {
    this.#executionLog.push(result);
    if (this.#executionLog.length > this.#maxLogSize) {
      this.#executionLog.shift();
    }
  }
}

export default ArmExecutor;
