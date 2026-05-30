import crypto from 'node:crypto';

/**
 * @typedef {'loaded' | 'running' | 'completed' | 'failed'} KernelStatus
 */

/**
 * @typedef {Object} KernelConfig
 * @property {number} [priority=0] - Execution priority (higher = sooner)
 * @property {number} [timeout=5000] - Max execution time in milliseconds
 * @property {number} [resourceBudget=100] - Abstract resource budget units
 */

/**
 * @typedef {Object} KernelRecord
 * @property {string} kernelId
 * @property {function} kernelFn
 * @property {KernelConfig} config
 * @property {KernelStatus} status
 * @property {Object|null} lastResult
 */

/**
 * KernelExecutor — loads and executes computation kernels within the organism.
 *
 * Kernels are functions that represent discrete units of computation.
 * They can be executed immediately or scheduled for a specific heartbeat.
 */
export class KernelExecutor {
  /** @type {Map<string, KernelRecord>} */
  #kernels;

  /** @type {Map<number, Array<{kernelId: string, input: unknown}>>} */
  #scheduledExecutions;

  /** @type {import('./heartbeat.js').Heartbeat|null} */
  #heartbeat;

  /** @type {function|null} */
  #heartbeatUnsubscribe;

  /**
   * @param {import('./heartbeat.js').Heartbeat} [heartbeat] - Optional Heartbeat instance for scheduled execution
   */
  constructor(heartbeat = null) {
    this.#kernels = new Map();
    this.#scheduledExecutions = new Map();
    this.#heartbeat = heartbeat;
    this.#heartbeatUnsubscribe = null;

    if (this.#heartbeat) {
      this.#heartbeatUnsubscribe = this.#heartbeat.onBeat(({ beatNumber }) => {
        this.#runScheduled(beatNumber);
      });
    }
  }

  /**
   * Loads a computation kernel.
   * @param {string} kernelId - Unique identifier for the kernel
   * @param {function} kernelFn - The kernel function to execute. Receives `(input, config)` and returns output.
   * @param {KernelConfig} [config={}]
   */
  loadKernel(kernelId, kernelFn, config = {}) {
    if (this.#kernels.has(kernelId)) {
      throw new Error(`Kernel "${kernelId}" is already loaded`);
    }
    if (typeof kernelFn !== 'function') {
      throw new TypeError('kernelFn must be a function');
    }

    this.#kernels.set(kernelId, {
      kernelId,
      kernelFn,
      config: {
        priority: config.priority ?? 0,
        timeout: config.timeout ?? 5000,
        resourceBudget: config.resourceBudget ?? 100,
      },
      status: 'loaded',
      lastResult: null,
    });
  }

  /**
   * Executes a loaded kernel with the given input.
   * @param {string} kernelId
   * @param {unknown} input
   * @returns {Promise<{output: unknown, duration: number, resourcesUsed: number, executionId: string}>}
   */
  async execute(kernelId, input) {
    const kernel = this.#kernels.get(kernelId);
    if (!kernel) {
      throw new Error(`Kernel "${kernelId}" not found`);
    }

    const executionId = crypto.randomUUID();
    kernel.status = 'running';
    const startTime = performance.now();

    try {
      const result = await Promise.race([
        Promise.resolve(kernel.kernelFn(input, kernel.config)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Kernel "${kernelId}" timed out after ${kernel.config.timeout}ms`)), kernel.config.timeout)
        ),
      ]);

      const duration = performance.now() - startTime;
      const resourcesUsed = Math.min(duration / kernel.config.timeout * kernel.config.resourceBudget, kernel.config.resourceBudget);

      kernel.status = 'completed';
      kernel.lastResult = { output: result, duration, resourcesUsed, executionId };

      return { output: result, duration, resourcesUsed, executionId };
    } catch (err) {
      const duration = performance.now() - startTime;
      kernel.status = 'failed';
      kernel.lastResult = { error: err.message, duration, executionId };
      throw err;
    }
  }

  /**
   * Schedules a kernel for execution at a specific beat number.
   * Requires a Heartbeat instance in the constructor.
   * @param {string} kernelId
   * @param {unknown} input
   * @param {number} beatNumber - The beat number at which to execute
   * @returns {string} Schedule ID
   */
  schedule(kernelId, input, beatNumber) {
    if (!this.#kernels.has(kernelId)) {
      throw new Error(`Kernel "${kernelId}" not found`);
    }
    if (!this.#heartbeat) {
      throw new Error('Heartbeat instance required for scheduled execution');
    }
    if (typeof beatNumber !== 'number' || beatNumber < 1) {
      throw new Error('beatNumber must be a positive integer');
    }

    const scheduleId = crypto.randomUUID();

    if (!this.#scheduledExecutions.has(beatNumber)) {
      this.#scheduledExecutions.set(beatNumber, []);
    }

    this.#scheduledExecutions.get(beatNumber).push({ kernelId, input, scheduleId });

    return scheduleId;
  }

  /**
   * Returns the status of a loaded kernel.
   * @param {string} kernelId
   * @returns {KernelStatus}
   */
  getKernelStatus(kernelId) {
    const kernel = this.#kernels.get(kernelId);
    if (!kernel) {
      throw new Error(`Kernel "${kernelId}" not found`);
    }
    return kernel.status;
  }

  /**
   * Returns metadata for all loaded kernels.
   * @returns {Array<{kernelId: string, status: KernelStatus, config: KernelConfig}>}
   */
  listKernels() {
    return Array.from(this.#kernels.values()).map(({ kernelId, status, config }) => ({
      kernelId,
      status,
      config: { ...config },
    }));
  }

  /**
   * Runs all kernels scheduled for the given beat number.
   * @param {number} beatNumber
   */
  async #runScheduled(beatNumber) {
    const scheduled = this.#scheduledExecutions.get(beatNumber);
    if (!scheduled) return;

    const sorted = [...scheduled].sort((a, b) => {
      const ka = this.#kernels.get(a.kernelId);
      const kb = this.#kernels.get(b.kernelId);
      return (kb?.config.priority ?? 0) - (ka?.config.priority ?? 0);
    });

    for (const { kernelId, input } of sorted) {
      try {
        await this.execute(kernelId, input);
      } catch (err) {
        console.error(`[KernelExecutor] Scheduled kernel "${kernelId}" failed on beat ${beatNumber}:`, err.message);
      }
    }

    this.#scheduledExecutions.delete(beatNumber);
  }

  /**
   * Disconnects from heartbeat and clears all state.
   */
  destroy() {
    if (this.#heartbeatUnsubscribe) {
      this.#heartbeatUnsubscribe();
      this.#heartbeatUnsubscribe = null;
    }
    this.#kernels.clear();
    this.#scheduledExecutions.clear();
  }
}

export default KernelExecutor;
