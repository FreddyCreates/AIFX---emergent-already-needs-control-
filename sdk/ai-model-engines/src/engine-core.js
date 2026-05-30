/**
 * @medina/ai-model-engines — EngineCore
 *
 * Central dispatch engine that accepts intelligence tasks and routes them
 * to the correct AI model family through capability matching, priority
 * resolution, and fallback handling.
 *
 * Conceptually integrates with the ModelRouter from
 * @medina/intelligence-routing-sdk and the Heartbeat from
 * @medina/organism-runtime-sdk.
 *
 * @module @medina/ai-model-engines/engine-core
 */

import crypto from 'node:crypto';

/** Priority ranking — lower index = higher priority. */
const PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3'];

class EngineCore {
  /**
   * Creates a new EngineCore instance.
   * @param {object} [config={}] — engine configuration
   * @param {number} [config.maxConcurrentTasks=100] — maximum concurrent tasks
   * @param {number} [config.taskTimeoutMs=30000] — task timeout in milliseconds
   * @param {number} [config.heartbeatIntervalMs=873] — heartbeat interval in milliseconds
   */
  constructor(config = {}) {
    /** @type {number} */
    this.maxConcurrentTasks = config.maxConcurrentTasks ?? 100;

    /** @type {number} */
    this.taskTimeoutMs = config.taskTimeoutMs ?? 30000;

    /** @type {number} */
    this.heartbeatIntervalMs = config.heartbeatIntervalMs ?? 873;

    /** @type {Map<string, object>} taskId → task record */
    this.tasks = new Map();

    /** @type {Map<string, object>} familyId → engine instance */
    this.engines = new Map();

    /** @type {object} dispatch metrics */
    this.metrics = {
      totalDispatched: 0,
      totalCompleted: 0,
      totalFailed: 0,
      totalUnroutable: 0,
      cumulativeLatencyMs: 0,
    };

    /** @type {Map<string, Function[]>} event listeners */
    this._listeners = new Map();

    /** @type {string} */
    this.status = 'idle';
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Creates an engine object for a given model family.
   * @param {string} familyId — deterministic family identifier
   * @param {object} familyMeta — family metadata from the registry
   * @returns {object} engine instance
   * @private
   */
  _createEngine(familyId, familyMeta) {
    return {
      familyId,
      familyName: familyMeta.name,
      alphaModel: familyMeta.alphaModel,
      wireProtocol: familyMeta.wireProtocol,
      primaryCapability: familyMeta.primaryCapability,
      routingPriority: familyMeta.routingPriority,
      status: 'ready',
      tasksProcessed: 0,
      totalLatencyMs: 0,
      lastUsed: null,
    };
  }

  /**
   * Emits an event to all registered listeners.
   * @param {string} eventName — name of the event
   * @param {*} data — event payload
   * @private
   */
  _emit(eventName, data) {
    const callbacks = this._listeners.get(eventName);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(data);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Engine registration                                                */
  /* ------------------------------------------------------------------ */

  /**
   * Registers a single engine for a model family.
   * @param {string} familyId — deterministic family identifier (e.g. 'AIF-001')
   * @param {object} familyMeta — family metadata containing name, alphaModel,
   *   wireProtocol, primaryCapability, and routingPriority
   * @returns {object} the created engine instance
   */
  registerEngine(familyId, familyMeta) {
    const engine = this._createEngine(familyId, familyMeta);
    this.engines.set(familyId, engine);
    return engine;
  }

  /**
   * Bulk-registers engines from an array of family objects.
   * Each entry must contain an `id` property plus the family metadata fields.
   * @param {object[]} familyList — array of family descriptors
   * @returns {object[]} array of created engine instances
   */
  registerAll(familyList) {
    return familyList.map((family) => {
      const { id, ...meta } = family;
      return this.registerEngine(id, meta);
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Task dispatch                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Dispatches a task to the most appropriate engine.
   *
   * Resolution order:
   * 1. If `preferredFamily` is set and the engine exists, use it.
   * 2. Match by `requiredCapability` across registered engines.
   * 3. Among multiple matches, prefer by routing priority (P0 > P1 > P2 > P3).
   * 4. If no match, the task is marked as `'unroutable'`.
   *
   * @param {object} task — task descriptor
   * @param {string} task.type — task type identifier
   * @param {*} task.payload — task payload
   * @param {string} [task.requiredCapability] — capability the engine must support
   * @param {string} [task.priority] — task priority hint (P0–P3)
   * @param {string} [task.preferredFamily] — preferred engine family ID
   * @returns {object} task record with taskId, assignedEngine, status, createdAt
   */
  dispatch(task) {
    const taskId = crypto.randomUUID();
    let assignedEngine = null;
    let status = 'queued';

    // 1. Preferred family shortcut
    if (task.preferredFamily && this.engines.has(task.preferredFamily)) {
      assignedEngine = this.engines.get(task.preferredFamily);
    }

    // 2. Capability matching
    if (!assignedEngine && task.requiredCapability) {
      const candidates = [];
      for (const engine of this.engines.values()) {
        if (engine.primaryCapability === task.requiredCapability) {
          candidates.push(engine);
        }
      }

      if (candidates.length === 1) {
        assignedEngine = candidates[0];
      } else if (candidates.length > 1) {
        // 3. Priority resolution — pick the highest-priority engine
        candidates.sort(
          (a, b) =>
            PRIORITY_ORDER.indexOf(a.routingPriority) -
            PRIORITY_ORDER.indexOf(b.routingPriority)
        );
        assignedEngine = candidates[0];
      }
    }

    // 4. Unroutable
    if (!assignedEngine) {
      status = 'unroutable';
      this.metrics.totalUnroutable++;
    }

    const record = {
      taskId,
      type: task.type,
      payload: task.payload,
      requiredCapability: task.requiredCapability ?? null,
      priority: task.priority ?? null,
      preferredFamily: task.preferredFamily ?? null,
      assignedEngine: assignedEngine
        ? { familyId: assignedEngine.familyId, familyName: assignedEngine.familyName }
        : null,
      status,
      createdAt: Date.now(),
      completedAt: null,
      durationMs: null,
    };

    this.tasks.set(taskId, record);
    this.metrics.totalDispatched++;

    this._emit('dispatch', record);

    return record;
  }

  /* ------------------------------------------------------------------ */
  /*  Task execution                                                     */
  /* ------------------------------------------------------------------ */

  /**
   * Simulates execution of a previously dispatched task.
   *
   * Marks the task as `'running'`, records a simulated duration via
   * `Date.now()` arithmetic (no actual async delay), then marks it as
   * `'completed'` and updates engine-level metrics.
   *
   * @param {string} taskId — the UUID of the dispatched task
   * @returns {object} result with taskId, result, engineUsed, durationMs
   * @throws {Error} if the task does not exist or is not in a dispatchable state
   */
  execute(taskId) {
    const record = this.tasks.get(taskId);
    if (!record) {
      throw new Error(`Task not found: ${taskId}`);
    }
    if (record.status === 'unroutable') {
      this.metrics.totalFailed++;
      record.status = 'failed';
      return { taskId, result: 'unroutable', engineUsed: null, durationMs: 0 };
    }

    // Mark running
    record.status = 'running';
    const startTime = Date.now();

    // Simulated execution (synchronous — no setTimeout)
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Mark completed
    record.status = 'completed';
    record.completedAt = endTime;
    record.durationMs = durationMs;
    this.metrics.totalCompleted++;
    this.metrics.cumulativeLatencyMs += durationMs;

    // Update engine metrics
    if (record.assignedEngine) {
      const engine = this.engines.get(record.assignedEngine.familyId);
      if (engine) {
        engine.tasksProcessed++;
        engine.totalLatencyMs += durationMs;
        engine.lastUsed = endTime;
      }
    }

    const result = {
      taskId,
      result: 'executed',
      engineUsed: record.assignedEngine,
      durationMs,
    };

    this._emit('complete', result);

    return result;
  }

  /* ------------------------------------------------------------------ */
  /*  Query methods                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Returns the task record for a given task ID.
   * @param {string} taskId — UUID of the task
   * @returns {object|undefined} task record or undefined if not found
   */
  getTaskStatus(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * Returns all registered engines as an array.
   * @returns {object[]} array of engine instances
   */
  listEngines() {
    return Array.from(this.engines.values());
  }

  /**
   * Returns the engine registered for a given family ID.
   * @param {string} familyId — deterministic family identifier
   * @returns {object|undefined} engine instance or undefined
   */
  getEngine(familyId) {
    return this.engines.get(familyId);
  }

  /**
   * Returns aggregate dispatch metrics.
   * @returns {object} metrics snapshot
   */
  getMetrics() {
    const completed = this.metrics.totalCompleted;
    return {
      totalDispatched: this.metrics.totalDispatched,
      totalCompleted: completed,
      totalFailed: this.metrics.totalFailed,
      totalUnroutable: this.metrics.totalUnroutable,
      averageLatencyMs: completed > 0
        ? this.metrics.cumulativeLatencyMs / completed
        : 0,
      engineCount: this.engines.size,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Event system                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Registers an event listener.
   * @param {string} eventName — name of the event to listen for
   * @param {Function} callback — function to invoke when the event fires
   */
  on(eventName, callback) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, []);
    }
    this._listeners.get(eventName).push(callback);
  }

  /* ------------------------------------------------------------------ */
  /*  Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Shuts down the engine core, clearing all tasks and setting status
   * to `'shutdown'`.
   */
  shutdown() {
    this.status = 'shutdown';
    this.tasks.clear();
    this._emit('shutdown', { timestamp: Date.now() });
  }
}

export { EngineCore };
export default EngineCore;
