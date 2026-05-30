/**
 * MICROBOT BASE — The Atom of Automation
 * ═══════════════════════════════════════
 *
 * Every microbot is a lightweight sub-agent that runs inside a parent bot.
 * Microbots are single-purpose, stateful, and observable. They report
 * metrics to the parent, can be spawned in parallel, and use phi-math
 * for timing and priority decisions.
 *
 * Lifecycle:
 *   IDLE → SPAWNED → RUNNING → REPORTING → COMPLETE
 *                                ↓
 *                              FAILED → (parent retries or escalates)
 *
 * Each microbot:
 *   - Has a unique identity (name + instanceId)
 *   - Exposes tick(), report(), and shutdown()
 *   - Emits progress events the parent can subscribe to
 *   - Tracks its own vitals (cpu-equivalent: ticks/sec, memory: stateSize)
 */

'use strict';

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT_MS = 873;

const STATES = {
  IDLE:      'idle',
  SPAWNED:   'spawned',
  RUNNING:   'running',
  REPORTING: 'reporting',
  COMPLETE:  'complete',
  FAILED:    'failed',
};

class MicrobotBase {
  /**
   * @param {string} name - Microbot name, e.g. 'signal-gatherer'
   * @param {string} parentBot - Parent bot name, e.g. 'organism-learning-bot'
   * @param {object} config - Optional config
   */
  constructor(name, parentBot, config = {}) {
    this.name       = name;
    this.parentBot  = parentBot;
    this.instanceId = `${name}-${Date.now().toString(36)}`;
    this.config     = config;

    this.state     = STATES.IDLE;
    this.spawnedAt = null;
    this.startedAt = null;
    this.endedAt   = null;

    this.ticks      = 0;
    this.errors     = [];
    this.results    = null;

    // Event listeners map
    this._listeners = {};

    // Vitals
    this.vitals = {
      ticksPerSecond: 0,
      lastTickAt:     null,
      stateSize:      0,
      errorRate:      0,
      health:         100,
    };
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  /** Spawn the microbot — called by parent before run() */
  spawn() {
    this.state     = STATES.SPAWNED;
    this.spawnedAt = Date.now();
    this._emit('spawn', { name: this.name, instanceId: this.instanceId, parentBot: this.parentBot });
    return this;
  }

  /**
   * Run the microbot — calls the subclass's _execute() method.
   * Returns a promise that resolves with the results object.
   */
  async run(input = {}) {
    if (this.state === STATES.IDLE) this.spawn();
    this.state     = STATES.RUNNING;
    this.startedAt = Date.now();

    this._emit('start', { name: this.name, input });

    try {
      this.results = await this._execute(input);
      this.state   = STATES.COMPLETE;
      this.endedAt = Date.now();
      this._emit('complete', { name: this.name, results: this.results, duration: this.duration() });
    } catch (err) {
      this.errors.push({ message: err.message, at: Date.now() });
      this.state   = STATES.FAILED;
      this.endedAt = Date.now();
      this._emit('error', { name: this.name, error: err.message });
      // Return partial results if any
      this.results = this.results || { error: err.message, partial: true };
    }

    this._updateVitals();
    return this.results;
  }

  /** Override in subclass — the actual work */
  async _execute(input) {
    throw new Error(`${this.name}: _execute() must be implemented by subclass`);
  }

  /** Graceful shutdown */
  shutdown() {
    if (this.state === STATES.RUNNING) {
      this.state   = STATES.FAILED;
      this.endedAt = Date.now();
      this.errors.push({ message: 'Shutdown requested during execution', at: Date.now() });
    }
    this._emit('shutdown', { name: this.name });
  }

  // ── Tick ──────────────────────────────────────────────────────────────

  /**
   * Tick — called on each heartbeat by the parent.
   * Subclasses can override to do incremental work.
   */
  tick() {
    this.ticks++;
    const now = Date.now();

    if (this.vitals.lastTickAt) {
      const elapsed = (now - this.vitals.lastTickAt) / 1000;
      this.vitals.ticksPerSecond = elapsed > 0 ? 1 / elapsed : 0;
    }
    this.vitals.lastTickAt = now;
    this._onTick();
  }

  /** Override in subclass for incremental heartbeat work */
  _onTick() {}

  // ── Reporting ─────────────────────────────────────────────────────────

  /** Generate a status report for the parent bot */
  report() {
    this.state = this.state === STATES.RUNNING ? STATES.REPORTING : this.state;

    return {
      name:       this.name,
      parentBot:  this.parentBot,
      instanceId: this.instanceId,
      state:      this.state,
      ticks:      this.ticks,
      duration:   this.duration(),
      vitals:     { ...this.vitals },
      errors:     this.errors.slice(-5),
      results:    this.results,
    };
  }

  // ── Events ────────────────────────────────────────────────────────────

  on(event, listener) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(listener);
    return this;
  }

  _emit(event, data) {
    const listeners = this._listeners[event] || [];
    for (const listener of listeners) {
      try { listener(data); } catch { /* never let listener errors kill the microbot */ }
    }
  }

  // ── Utilities ─────────────────────────────────────────────────────────

  duration() {
    if (!this.startedAt) return 0;
    return (this.endedAt || Date.now()) - this.startedAt;
  }

  _updateVitals() {
    this.vitals.stateSize  = JSON.stringify(this.results || {}).length;
    this.vitals.errorRate  = this.ticks > 0 ? this.errors.length / this.ticks : 0;
    this.vitals.health     = Math.max(0, 100 - this.errors.length * 10);
  }

  toString() {
    return `[Microbot:${this.name}@${this.parentBot}] state=${this.state} ticks=${this.ticks}`;
  }
}

// ── Microbot Runner — runs multiple microbots in parallel ─────────────────────

class MicrobotRunner {
  constructor(parentBot) {
    this.parentBot = parentBot;
    this.microbots = [];
  }

  register(microbot) {
    this.microbots.push(microbot);
    return this;
  }

  /** Run all registered microbots in parallel */
  async runAll(input = {}) {
    const results = await Promise.allSettled(
      this.microbots.map(mb => mb.spawn().run(input))
    );

    return results.map((r, i) => ({
      name:    this.microbots[i].name,
      success: r.status === 'fulfilled',
      result:  r.status === 'fulfilled' ? r.value : null,
      error:   r.status === 'rejected'  ? r.reason?.message : null,
    }));
  }

  /** Report from all microbots */
  reportAll() {
    return this.microbots.map(mb => mb.report());
  }
}

module.exports = { MicrobotBase, MicrobotRunner, STATES, PHI, PHI_INV, HEARTBEAT_MS };
