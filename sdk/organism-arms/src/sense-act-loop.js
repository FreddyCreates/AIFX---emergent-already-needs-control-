/**
 * SenseActLoop — the organism's autonomous sense→think→act cycle.
 *
 * Wired into the 873ms heartbeat, each pulse triggers:
 *   1. SENSE — sensory arms absorb environmental state
 *   2. THINK — cognitive arms reason about what was sensed
 *   3. ACT   — motor arms execute decided actions
 *
 * This is the biological loop: perception → cognition → action.
 * The extensions are the arms. The loop is the spinal cord.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

/**
 * @typedef {'idle' | 'sensing' | 'thinking' | 'acting' | 'resting'} LoopPhase
 */

/**
 * @typedef {Object} LoopCycleResult
 * @property {number} cycleNumber
 * @property {Object[]} sensed - Results from sensory arms
 * @property {Object[]} thought - Results from cognitive arms
 * @property {Object[]} acted - Results from motor arms
 * @property {number} totalDuration - Full cycle time in ms
 * @property {LoopPhase} finalPhase
 */

export class SenseActLoop {
  /** @type {import('./arm-executor.js').ArmExecutor} */
  #executor;

  /** @type {number} */
  #cycleCount;

  /** @type {LoopPhase} */
  #phase;

  /** @type {number|null} */
  #intervalId;

  /** @type {function|null} */
  #decisionFn;

  /** @type {LoopCycleResult[]} */
  #history;

  /** @type {number} */
  #maxHistory;

  /** @type {boolean} */
  #running;

  /**
   * @param {import('./arm-executor.js').ArmExecutor} executor
   * @param {Object} [options]
   * @param {function} [options.decisionFn] - Function that decides which motor arms to activate based on sense+think results. Receives ({sensed, thought}) → {armSlug, action}[]
   * @param {number} [options.maxHistory=100]
   * @param {number} [options.intervalMs] - Override default heartbeat interval
   */
  constructor(executor, options = {}) {
    this.#executor = executor;
    this.#cycleCount = 0;
    this.#phase = 'idle';
    this.#intervalId = null;
    this.#decisionFn = options.decisionFn || null;
    this.#history = [];
    this.#maxHistory = options.maxHistory ?? 100;
    this.#running = false;
  }

  /**
   * Start the autonomous sense→think→act loop.
   * Runs on the organism's 873ms × φ pulse (≈1412ms per full cycle).
   */
  start() {
    if (this.#running) return;
    this.#running = true;

    const cycleInterval = Math.round(HEARTBEAT_MS * PHI);
    this.#intervalId = setInterval(() => this.#runCycle(), cycleInterval);
  }

  /**
   * Stop the loop.
   */
  stop() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
    this.#running = false;
    this.#phase = 'idle';
  }

  /**
   * Run a single sense→think→act cycle manually (for testing or one-shot usage).
   * @param {Object} [context={}] - Environmental context to sense
   * @returns {Promise<LoopCycleResult>}
   */
  async runOnce(context = {}) {
    return this.#runCycle(context);
  }

  /**
   * Set or replace the decision function.
   * @param {function} fn - ({sensed, thought}) → {armSlug, action}[]
   */
  setDecisionFunction(fn) {
    this.#decisionFn = fn;
  }

  /**
   * Current loop phase.
   * @returns {LoopPhase}
   */
  get phase() {
    return this.#phase;
  }

  /**
   * Whether the loop is currently running.
   * @returns {boolean}
   */
  get running() {
    return this.#running;
  }

  /**
   * Number of completed cycles.
   * @returns {number}
   */
  get cycleCount() {
    return this.#cycleCount;
  }

  /**
   * Get recent cycle history.
   * @param {number} [limit=10]
   * @returns {LoopCycleResult[]}
   */
  getHistory(limit = 10) {
    return this.#history.slice(-limit);
  }

  /**
   * Core loop execution.
   */
  async #runCycle(context = {}) {
    const cycleStart = performance.now();
    this.#cycleCount++;

    // Phase 1: SENSE
    this.#phase = 'sensing';
    let sensed = [];
    try {
      sensed = await this.#executor.sense(context);
    } catch (err) {
      sensed = [{ error: err.message }];
    }

    // Phase 2: THINK
    this.#phase = 'thinking';
    let thought = [];
    try {
      const problem = {
        sensoryInput: sensed.map(r => r.output || r),
        context,
        cycleNumber: this.#cycleCount,
      };
      thought = await this.#executor.think(problem);
    } catch (err) {
      thought = [{ error: err.message }];
    }

    // Phase 3: ACT (only if decision function is set)
    this.#phase = 'acting';
    let acted = [];
    if (this.#decisionFn) {
      try {
        const decisions = this.#decisionFn({ sensed, thought });
        if (Array.isArray(decisions)) {
          for (const { armSlug, action } of decisions) {
            try {
              const result = await this.#executor.act(armSlug, action);
              acted.push(result);
            } catch (err) {
              acted.push({ arm: armSlug, error: err.message });
            }
          }
        }
      } catch (err) {
        acted = [{ error: err.message }];
      }
    }

    // Phase 4: REST
    this.#phase = 'resting';
    const totalDuration = performance.now() - cycleStart;

    const result = {
      cycleNumber: this.#cycleCount,
      sensed,
      thought,
      acted,
      totalDuration,
      finalPhase: 'resting',
    };

    this.#history.push(result);
    if (this.#history.length > this.#maxHistory) {
      this.#history.shift();
    }

    return result;
  }
}

export default SenseActLoop;
