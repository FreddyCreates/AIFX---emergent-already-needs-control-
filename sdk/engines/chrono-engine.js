/**
 * CHRONO ENGINE — Time & Scheduling Physics
 * 
 * The foundational "physics" of time in the Civitas system.
 * All agents use CHRONO for timing, scheduling, and temporal coordination.
 * 
 * Features:
 *   - 873ms heartbeat as base time unit
 *   - Phi-modulated time scales
 *   - Scheduled tasks with priority queuing
 *   - Time-based decay functions
 *   - Temporal event coordination
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;  // 0.618033988749895
const HEARTBEAT_MS = 873;
const GOLDEN_ANGLE = 137.508;

class ChronoEngine {
  constructor() {
    this.epoch = Date.now();
    this.beatCount = 0;
    this.timers = new Map();
    this.scheduledTasks = [];
    this.listeners = new Map();
    this.running = false;
    this.heartbeatInterval = null;
  }

  // ── Core Time Functions ────────────────────────────────────────────────

  /**
   * Get current beat number since epoch
   */
  getBeat() {
    return this.beatCount;
  }

  /**
   * Get milliseconds since organism epoch
   */
  getTime() {
    return Date.now() - this.epoch;
  }

  /**
   * Convert beats to milliseconds
   */
  beatsToMs(beats) {
    return beats * HEARTBEAT_MS;
  }

  /**
   * Convert milliseconds to beats
   */
  msToBeats(ms) {
    return Math.floor(ms / HEARTBEAT_MS);
  }

  /**
   * Get phi-phase at current beat (0-360 degrees)
   */
  getPhiPhase() {
    return (this.beatCount * GOLDEN_ANGLE) % 360;
  }

  /**
   * Get phi-modulated time scale factor
   * Returns value between PHI_INV and PHI based on phi-phase
   */
  getTimeScale() {
    const phase = this.getPhiPhase() * (Math.PI / 180);
    return PHI_INV + (PHI - PHI_INV) * (Math.sin(phase) + 1) / 2;
  }

  // ── Scheduling Functions ───────────────────────────────────────────────

  /**
   * Schedule a task to run after N beats
   * @param {Function} callback - Function to execute
   * @param {number} beats - Number of beats to wait
   * @param {number} priority - 0=CRITICAL, 1=HIGH, 2=NORMAL, 3=LOW
   * @returns {string} Task ID
   */
  scheduleAt(callback, beats, priority = 2) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const targetBeat = this.beatCount + beats;
    
    this.scheduledTasks.push({
      id: taskId,
      callback,
      targetBeat,
      priority,
      createdAt: this.beatCount,
    });
    
    // Sort by target beat, then by priority (phi-weighted)
    this.scheduledTasks.sort((a, b) => {
      if (a.targetBeat !== b.targetBeat) return a.targetBeat - b.targetBeat;
      return Math.pow(PHI, -a.priority) - Math.pow(PHI, -b.priority);
    });
    
    return taskId;
  }

  /**
   * Schedule a recurring task every N beats
   * @param {Function} callback - Function to execute
   * @param {number} intervalBeats - Number of beats between executions
   * @returns {string} Timer ID
   */
  setInterval(callback, intervalBeats) {
    const timerId = `timer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    this.timers.set(timerId, {
      callback,
      interval: intervalBeats,
      lastBeat: this.beatCount,
      active: true,
    });
    
    return timerId;
  }

  /**
   * Cancel a scheduled interval
   */
  clearInterval(timerId) {
    this.timers.delete(timerId);
  }

  /**
   * Cancel a scheduled task
   */
  cancelTask(taskId) {
    this.scheduledTasks = this.scheduledTasks.filter(t => t.id !== taskId);
  }

  // ── Time-Based Decay Functions ─────────────────────────────────────────

  /**
   * Phi-weighted exponential decay
   * @param {number} value - Initial value
   * @param {number} beats - Number of beats elapsed
   * @param {number} halfLife - Half-life in beats
   */
  decay(value, beats, halfLife = 100) {
    const lambda = Math.LN2 / halfLife;
    return value * Math.exp(-lambda * beats * PHI_INV);
  }

  /**
   * Phi-modulated drift function
   * Small oscillation around a value based on beat count
   */
  drift(value, amplitude = 0.001) {
    const phase = this.getPhiPhase() * (Math.PI / 180);
    return value + Math.sin(phase) * amplitude * PHI_INV;
  }

  // ── Event System ───────────────────────────────────────────────────────

  /**
   * Subscribe to heartbeat events
   */
  onBeat(callback) {
    const listenerId = `listener-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.listeners.set(listenerId, callback);
    return listenerId;
  }

  /**
   * Unsubscribe from heartbeat events
   */
  offBeat(listenerId) {
    this.listeners.delete(listenerId);
  }

  // ── Heartbeat Execution ────────────────────────────────────────────────

  /**
   * Process a single heartbeat tick
   * Called every 873ms
   */
  async tick() {
    this.beatCount++;
    const currentBeat = this.beatCount;
    
    // Execute scheduled tasks that are due
    const dueTasks = [];
    this.scheduledTasks = this.scheduledTasks.filter(task => {
      if (task.targetBeat <= currentBeat) {
        dueTasks.push(task);
        return false;
      }
      return true;
    });
    
    for (const task of dueTasks) {
      try {
        await task.callback(currentBeat);
      } catch (e) {
        console.error(`[CHRONO] Task ${task.id} failed:`, e.message);
      }
    }
    
    // Execute interval timers
    for (const [timerId, timer] of this.timers) {
      if (timer.active && currentBeat - timer.lastBeat >= timer.interval) {
        timer.lastBeat = currentBeat;
        try {
          await timer.callback(currentBeat);
        } catch (e) {
          console.error(`[CHRONO] Timer ${timerId} failed:`, e.message);
        }
      }
    }
    
    // Notify beat listeners
    for (const [, callback] of this.listeners) {
      try {
        callback(currentBeat, this.getPhiPhase());
      } catch (e) {
        console.error(`[CHRONO] Listener failed:`, e.message);
      }
    }
    
    return {
      beat: currentBeat,
      phiPhase: this.getPhiPhase(),
      timeScale: this.getTimeScale(),
      pendingTasks: this.scheduledTasks.length,
      activeTimers: this.timers.size,
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  /**
   * Start the heartbeat loop
   */
  start() {
    if (this.running) return;
    this.running = true;
    
    console.log(`[CHRONO] Engine started — heartbeat: ${HEARTBEAT_MS}ms, φ=${PHI}`);
    
    this.heartbeatInterval = setInterval(() => {
      this.tick();
    }, HEARTBEAT_MS);
  }

  /**
   * Stop the heartbeat loop
   */
  stop() {
    if (!this.running) return;
    this.running = false;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    console.log(`[CHRONO] Engine stopped — total beats: ${this.beatCount}`);
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      running: this.running,
      beatCount: this.beatCount,
      uptime: this.getTime(),
      phiPhase: this.getPhiPhase(),
      timeScale: this.getTimeScale(),
      scheduledTasks: this.scheduledTasks.length,
      activeTimers: this.timers.size,
      listeners: this.listeners.size,
      constants: { PHI, PHI_INV, HEARTBEAT_MS, GOLDEN_ANGLE },
    };
  }
}

// Export singleton and class
const chronoEngine = new ChronoEngine();

export { ChronoEngine, chronoEngine, PHI, PHI_INV, HEARTBEAT_MS, GOLDEN_ANGLE };
export default chronoEngine;
