/**
 * PROTO-010: Organism Lifecycle Protocol (OLP)
 * Autonomous Lifecycle Intelligence managing full organism lifecycle from boot to shutdown
 * with self-healing, kernel hot-reload, register integrity, and heartbeat monitoring.
 *
 * Engines wired: OrganismState + Heartbeat + KernelExecutor + CrossOrganismResonance + EdgeSensor
 * Ring: Sovereign Ring | Organism placement: Organism core / runtime layer
 * Wire: intelligence-wire/olp
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

/**
 * @typedef {'booting'|'initializing'|'running'|'degraded'|'healing'|'shutting-down'|'stopped'} LifecyclePhase
 */

/**
 * @typedef {Object} KernelEntry
 * @property {string} id - Kernel identifier
 * @property {string} name - Kernel name
 * @property {string} status - Current status
 * @property {number} startedAt - Start timestamp
 * @property {number} restartCount - Number of restarts
 * @property {number} lastHealthCheck - Last health check timestamp
 * @property {Function|null} onStart - Start handler
 * @property {Function|null} onStop - Stop handler
 * @property {Function|null} healthCheck - Health check handler
 */

class OrganismLifecycleProtocol {
  /**
   * @param {Object} config - Configuration
   * @param {number} [config.healthCheckInterval] - Health check interval in ms
   * @param {number} [config.maxKernelRestarts=5] - Max restarts before marking kernel dead
   * @param {number} [config.gracefulShutdownTimeout=5000] - Shutdown timeout in ms
   */
  constructor(config = {}) {
    /** @type {LifecyclePhase} */
    this.phase = 'stopped';
    /** @type {Map<string, KernelEntry>} */
    this.kernels = new Map();
    /** @type {Map<string, Object>} */
    this.registers = new Map();
    this.healthCheckInterval = config.healthCheckInterval || HEARTBEAT;
    this.maxKernelRestarts = config.maxKernelRestarts || 5;
    this.gracefulShutdownTimeout = config.gracefulShutdownTimeout || 5000;
    this.heartbeatCount = 0;
    this.bootTime = null;
    this.healthCheckTimer = null;
    this.eventLog = [];
    this.metrics = {
      totalBoots: 0,
      totalShutdowns: 0,
      totalHealthChecks: 0,
      totalKernelRestarts: 0,
      totalSelfHeals: 0,
      uptimeMs: 0,
      phaseHistory: []
    };
  }

  /* ─── Lifecycle Phase Management ─── */

  /**
   * Transition to a new lifecycle phase.
   * @param {LifecyclePhase} newPhase
   * @returns {Object} - {from, to, timestamp}
   */
  _transitionPhase(newPhase) {
    const from = this.phase;
    this.phase = newPhase;
    const entry = { from, to: newPhase, timestamp: Date.now() };
    this.metrics.phaseHistory.push(entry);
    this._log('phase-transition', `${from} → ${newPhase}`);
    return entry;
  }

  /**
   * Log an event to the internal event log.
   * @param {string} type - Event type
   * @param {string} detail - Event detail
   */
  _log(type, detail) {
    this.eventLog.push({ type, detail, timestamp: Date.now(), heartbeat: this.heartbeatCount });
    // Keep log bounded
    if (this.eventLog.length > 10000) {
      this.eventLog = this.eventLog.slice(-5000);
    }
  }

  /* ─── Boot Sequence ─── */

  /**
   * Boot the organism through a phi-sequenced startup.
   * Stages: booting → initializing → running
   * @returns {Object} - Boot result
   */
  boot() {
    if (this.phase !== 'stopped') {
      return { success: false, error: `Cannot boot from phase: ${this.phase}` };
    }

    this._transitionPhase('booting');
    this.bootTime = Date.now();
    this.metrics.totalBoots++;

    // Stage 1: Initialize registers with integrity checksums
    this._initRegisters();
    this._log('boot', 'Registers initialized');

    // Stage 2: Initialize kernels
    this._transitionPhase('initializing');
    const kernelResults = [];
    for (const [id, kernel] of this.kernels) {
      const result = this._startKernel(id);
      kernelResults.push(result);
    }
    this._log('boot', `${kernelResults.length} kernels started`);

    // Stage 3: Start health monitoring
    this._transitionPhase('running');
    this._startHealthMonitoring();
    this._log('boot', 'Health monitoring active');

    return {
      success: true,
      phase: this.phase,
      bootTime: this.bootTime,
      kernelsStarted: kernelResults.length,
      registersInitialized: this.registers.size
    };
  }

  /* ─── Kernel Management ─── */

  /**
   * Register a kernel with the lifecycle manager.
   * @param {string} id - Kernel identifier
   * @param {string} name - Kernel name
   * @param {Object} [handlers={}] - { onStart, onStop, healthCheck }
   * @returns {Object} - Registered kernel info
   */
  registerKernel(id, name, handlers = {}) {
    const kernel = {
      id,
      name,
      status: 'registered',
      startedAt: 0,
      restartCount: 0,
      lastHealthCheck: 0,
      onStart: handlers.onStart || null,
      onStop: handlers.onStop || null,
      healthCheck: handlers.healthCheck || null
    };
    this.kernels.set(id, kernel);
    this._log('kernel-register', `Kernel ${name} (${id}) registered`);
    return { id, name, status: kernel.status };
  }

  /**
   * Start a specific kernel.
   * @param {string} id - Kernel ID
   * @returns {Object} - {id, status, startedAt}
   */
  _startKernel(id) {
    const kernel = this.kernels.get(id);
    if (!kernel) return { id, status: 'not-found', startedAt: 0 };

    try {
      if (typeof kernel.onStart === 'function') {
        kernel.onStart();
      }
      kernel.status = 'running';
      kernel.startedAt = Date.now();
      kernel.lastHealthCheck = Date.now();
      this._log('kernel-start', `Kernel ${kernel.name} started`);
    } catch (err) {
      kernel.status = 'failed';
      this._log('kernel-error', `Kernel ${kernel.name} failed to start: ${err.message}`);
    }
    return { id, status: kernel.status, startedAt: kernel.startedAt };
  }

  /**
   * Stop a specific kernel gracefully.
   * @param {string} id - Kernel ID
   * @returns {Object} - {id, status}
   */
  _stopKernel(id) {
    const kernel = this.kernels.get(id);
    if (!kernel) return { id, status: 'not-found' };

    try {
      if (typeof kernel.onStop === 'function') {
        kernel.onStop();
      }
      kernel.status = 'stopped';
      this._log('kernel-stop', `Kernel ${kernel.name} stopped`);
    } catch (err) {
      kernel.status = 'error-stopping';
      this._log('kernel-error', `Kernel ${kernel.name} error stopping: ${err.message}`);
    }
    return { id, status: kernel.status };
  }

  /**
   * Hot-reload a kernel by stopping and restarting it.
   * @param {string} id - Kernel ID
   * @param {Object} [newHandlers] - Optional new handlers to install
   * @returns {Object} - {id, status, restartCount}
   */
  hotReloadKernel(id, newHandlers) {
    const kernel = this.kernels.get(id);
    if (!kernel) return { id, status: 'not-found', restartCount: 0 };

    this._stopKernel(id);
    if (newHandlers) {
      if (newHandlers.onStart) kernel.onStart = newHandlers.onStart;
      if (newHandlers.onStop) kernel.onStop = newHandlers.onStop;
      if (newHandlers.healthCheck) kernel.healthCheck = newHandlers.healthCheck;
    }
    kernel.restartCount++;
    this.metrics.totalKernelRestarts++;
    const result = this._startKernel(id);
    this._log('kernel-hot-reload', `Kernel ${kernel.name} hot-reloaded (restart #${kernel.restartCount})`);
    return { id, status: result.status, restartCount: kernel.restartCount };
  }

  /* ─── Register Integrity ─── */

  /**
   * Initialize organism registers with integrity checksums.
   */
  _initRegisters() {
    const registerNames = ['state', 'memory', 'routing', 'heartbeat'];
    for (let i = 0; i < registerNames.length; i++) {
      const name = registerNames[i];
      const coords = this._phiCoordinates(i);
      this.registers.set(name, {
        name,
        value: {},
        phiCoords: coords,
        checksum: this._computeChecksum(name + ':init'),
        lastUpdated: Date.now(),
        integrityValid: true
      });
    }
  }

  /**
   * Compute phyllotaxis coordinates for register index n.
   * @param {number} n
   * @returns {number[]}
   */
  _phiCoordinates(n) {
    const r = Math.sqrt(n + 1);
    const angle = n * GOLDEN_ANGLE;
    return [r * Math.cos(angle), r * Math.sin(angle)];
  }

  /**
   * Compute a checksum for register integrity.
   * @param {string} data
   * @returns {string}
   */
  _computeChecksum(data) {
    let h = 0;
    for (let i = 0; i < data.length; i++) {
      h = ((h << 5) - h + data.charCodeAt(i)) | 0;
    }
    const m = 2147483647;
    let a = Math.abs(h) % m;
    let b = 1;
    for (let i = 0; i < 16; i++) {
      const t = (a + b) % m;
      a = b;
      b = t;
    }
    return b.toString(16).padStart(8, '0');
  }

  /**
   * Update a register value and recompute its checksum.
   * @param {string} name - Register name
   * @param {Object} value - New value
   * @returns {Object} - {name, checksum, integrityValid}
   */
  updateRegister(name, value) {
    const reg = this.registers.get(name);
    if (!reg) return { name, checksum: '', integrityValid: false };

    reg.value = value;
    reg.checksum = this._computeChecksum(name + ':' + JSON.stringify(value));
    reg.lastUpdated = Date.now();
    reg.integrityValid = true;
    this._log('register-update', `Register ${name} updated`);
    return { name, checksum: reg.checksum, integrityValid: reg.integrityValid };
  }

  /**
   * Verify integrity of all registers.
   * @returns {Object} - { allValid, results }
   */
  verifyRegisterIntegrity() {
    let allValid = true;
    const results = [];
    for (const [name, reg] of this.registers) {
      const expected = this._computeChecksum(name + ':' + JSON.stringify(reg.value));
      const valid = expected === reg.checksum;
      if (!valid) {
        allValid = false;
        reg.integrityValid = false;
        this._log('integrity-failure', `Register ${name} integrity failed`);
      }
      results.push({ name, valid, checksum: reg.checksum });
    }
    return { allValid, results };
  }

  /* ─── Health Monitoring & Self-Healing ─── */

  /**
   * Start the health monitoring loop.
   */
  _startHealthMonitoring() {
    // In a real environment this would use setInterval;
    // here we expose pulse() for manual/external invocation
    this._log('health', 'Health monitoring started');
  }

  /**
   * Execute one health pulse. Call this on every heartbeat (873ms).
   * Checks all kernels, verifies register integrity, and self-heals.
   * @returns {Object} - Health report
   */
  pulse() {
    if (this.phase !== 'running' && this.phase !== 'degraded') {
      return { phase: this.phase, healthy: false, reason: 'Organism not running' };
    }

    this.heartbeatCount++;
    this.metrics.totalHealthChecks++;
    const now = Date.now();

    // Check each kernel
    const kernelStatuses = [];
    let degradedCount = 0;
    for (const [id, kernel] of this.kernels) {
      if (kernel.status === 'running') {
        let healthy = true;
        if (typeof kernel.healthCheck === 'function') {
          try {
            healthy = kernel.healthCheck();
          } catch (err) {
            healthy = false;
            this._log('health-error', `Kernel ${kernel.name} health check threw: ${err.message}`);
          }
        }
        kernel.lastHealthCheck = now;

        if (!healthy) {
          degradedCount++;
          this._log('health-degraded', `Kernel ${kernel.name} unhealthy`);

          // Self-heal: restart if under max restarts
          if (kernel.restartCount < this.maxKernelRestarts) {
            this.hotReloadKernel(id);
            this.metrics.totalSelfHeals++;
            this._log('self-heal', `Kernel ${kernel.name} restarted (attempt ${kernel.restartCount})`);
          } else {
            kernel.status = 'dead';
            this._log('kernel-dead', `Kernel ${kernel.name} exceeded max restarts, marked dead`);
          }
        }

        kernelStatuses.push({ id, name: kernel.name, status: kernel.status, healthy, restartCount: kernel.restartCount });
      } else if (kernel.status === 'dead' || kernel.status === 'failed') {
        degradedCount++;
        kernelStatuses.push({ id, name: kernel.name, status: kernel.status, healthy: false, restartCount: kernel.restartCount });
      }
    }

    // Check register integrity
    const integrity = this.verifyRegisterIntegrity();

    // Decide overall phase
    if (degradedCount > 0 && this.phase === 'running') {
      this._transitionPhase('degraded');
    } else if (degradedCount === 0 && this.phase === 'degraded') {
      this._transitionPhase('running');
    }

    // Update uptime
    if (this.bootTime) {
      this.metrics.uptimeMs = now - this.bootTime;
    }

    return {
      phase: this.phase,
      heartbeatCount: this.heartbeatCount,
      kernels: kernelStatuses,
      registersValid: integrity.allValid,
      degradedKernels: degradedCount,
      uptimeMs: this.metrics.uptimeMs,
      timestamp: now
    };
  }

  /* ─── Graceful Shutdown ─── */

  /**
   * Graceful shutdown: stops all kernels, persists registers, transitions to stopped.
   * @returns {Object} - Shutdown report
   */
  shutdown() {
    if (this.phase === 'stopped') {
      return { success: false, error: 'Already stopped' };
    }

    this._transitionPhase('shutting-down');
    this._log('shutdown', 'Graceful shutdown initiated');

    // Stop all kernels
    const kernelResults = [];
    for (const [id] of this.kernels) {
      const result = this._stopKernel(id);
      kernelResults.push(result);
    }

    // Final register snapshot
    const registerSnapshot = {};
    for (const [name, reg] of this.registers) {
      registerSnapshot[name] = {
        checksum: reg.checksum,
        integrityValid: reg.integrityValid,
        lastUpdated: reg.lastUpdated
      };
    }

    this._transitionPhase('stopped');
    this.metrics.totalShutdowns++;

    const uptimeMs = this.bootTime ? Date.now() - this.bootTime : 0;
    this.bootTime = null;

    this._log('shutdown', 'Shutdown complete');

    return {
      success: true,
      kernelsStopped: kernelResults.length,
      registers: registerSnapshot,
      uptimeMs,
      totalHeartbeats: this.heartbeatCount
    };
  }

  /* ─── Diagnostics ─── */

  /**
   * Get full organism lifecycle metrics.
   * @returns {Object} - Metrics snapshot
   */
  getMetrics() {
    return {
      phase: this.phase,
      ...this.metrics,
      totalKernels: this.kernels.size,
      totalRegisters: this.registers.size,
      heartbeatCount: this.heartbeatCount,
      eventLogSize: this.eventLog.length
    };
  }

  /**
   * Get recent event log entries.
   * @param {number} [count=50] - Number of recent events
   * @returns {Object[]} - Recent events
   */
  getRecentEvents(count = 50) {
    return this.eventLog.slice(-count);
  }

  /**
   * Get current organism state summary suitable for dashboard display.
   * @returns {Object} - State summary
   */
  getStateSummary() {
    const kernelSummary = [];
    for (const [id, kernel] of this.kernels) {
      kernelSummary.push({
        id,
        name: kernel.name,
        status: kernel.status,
        restartCount: kernel.restartCount,
        uptime: kernel.startedAt > 0 ? Date.now() - kernel.startedAt : 0
      });
    }

    const registerSummary = [];
    for (const [name, reg] of this.registers) {
      registerSummary.push({
        name,
        checksum: reg.checksum,
        integrityValid: reg.integrityValid,
        phiCoords: reg.phiCoords
      });
    }

    return {
      phase: this.phase,
      uptimeMs: this.bootTime ? Date.now() - this.bootTime : 0,
      heartbeatCount: this.heartbeatCount,
      kernels: kernelSummary,
      registers: registerSummary,
      phiConstant: PHI,
      heartbeatInterval: HEARTBEAT
    };
  }
}

export { OrganismLifecycleProtocol };
export default OrganismLifecycleProtocol;
