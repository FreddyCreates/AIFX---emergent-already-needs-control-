/**
 * CORPUS AGENT — The Body
 * 
 * The execution center of the organism. CORPUS takes action.
 * Uses CHRONO for timing, NEXORIS for state, QUANTUM_FLUX for randomness.
 * 
 * Responsibilities:
 *   - Execute commands from ANIMUS
 *   - Motor control and action sequencing
 *   - Resource management
 *   - Physical state maintenance
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

class CorpusAgent {
  constructor(engines) {
    this.id = 'CORPUS';
    this.engines = engines;
    
    // Action queue
    this.actionQueue = [];
    this.currentAction = null;
    
    // Resources
    this.resources = {
      energy: 100,
      capacity: 100,
      load: 0,
    };
    
    // Timers
    this.executeTimer = null;
    this.maintainTimer = null;
    
    // Statistics
    this.stats = {
      actionsExecuted: 0,
      actionsFailed: 0,
      energyConsumed: 0,
    };
    
    this.awake = false;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  awaken() {
    if (this.awake) return;
    this.awake = true;
    
    console.log(`[CORPUS] Awakening — the body readies...`);
    
    // Start execution loop (every beat)
    this.executeTimer = this.engines.chrono.setInterval(() => this._execute(), 1);
    
    // Start maintenance loop (every 10 beats)
    this.maintainTimer = this.engines.chrono.setInterval(() => this._maintain(), 10);
    
    // Update somatic register
    this.engines.nexoris.set('somatic', 'awareness', 1.0);
  }

  shutdown() {
    if (!this.awake) return;
    this.awake = false;
    
    if (this.executeTimer) this.engines.chrono.clearInterval(this.executeTimer);
    if (this.maintainTimer) this.engines.chrono.clearInterval(this.maintainTimer);
    
    console.log(`[CORPUS] Shutting down — ${this.stats.actionsExecuted} actions executed`);
  }

  restart() {
    this.shutdown();
    this.resources.energy = 100;
    this.awaken();
  }

  // ── Core Execution Loops ───────────────────────────────────────────────

  /**
   * Main execution loop — runs every beat
   * Process action queue, manage resources
   */
  _execute() {
    if (!this.awake) return;
    
    // Check if we can execute (enough energy)
    if (this.resources.energy < 1) {
      this.engines.nexoris.set('somatic', 'coherence', 0.1);
      return;
    }
    
    // Process current action
    if (this.currentAction) {
      this._progressAction();
    } else if (this.actionQueue.length > 0) {
      // Start next action
      this.currentAction = this.actionQueue.shift();
      this.currentAction.startedAt = Date.now();
      this.currentAction.progress = 0;
    }
    
    // Update load
    this.resources.load = this.actionQueue.length / 10;  // 0-1 range
    this.engines.nexoris.set('somatic', 'resonance', 1 - this.resources.load);
  }

  /**
   * Progress current action
   */
  _progressAction() {
    const action = this.currentAction;
    
    // Calculate progress increment (phi-weighted by priority)
    const priorityFactor = Math.pow(PHI, -action.priority || 0);
    const progressIncrement = 0.1 * priorityFactor;
    
    action.progress = Math.min(1, action.progress + progressIncrement);
    
    // Consume energy
    const energyCost = 0.5 * priorityFactor;
    this.resources.energy = Math.max(0, this.resources.energy - energyCost);
    this.stats.energyConsumed += energyCost;
    
    // Check completion
    if (action.progress >= 1) {
      this._completeAction(action);
    }
    
    // Update state
    this.engines.nexoris.set('somatic', 'coherence', 
      this.resources.energy / this.resources.capacity);
  }

  /**
   * Complete an action
   */
  _completeAction(action) {
    this.stats.actionsExecuted++;
    
    // Emit completion event
    this.engines.coreograph.emit('CORPUS:actionComplete', {
      actionId: action.id,
      duration: Date.now() - action.startedAt,
      result: 'success',
    });
    
    // Clear current action
    this.currentAction = null;
    
    // Boost resonance on completion
    this.engines.nexoris.set('somatic', 'resonance', 
      Math.min(PHI, this.engines.nexoris.get('somatic', 'resonance') + 0.1));
  }

  /**
   * Maintenance loop — runs every 10 beats
   * Recover energy, check health
   */
  _maintain() {
    if (!this.awake) return;
    
    // Recover energy (phi-weighted)
    const recoveryRate = 2 * PHI_INV;
    this.resources.energy = Math.min(
      this.resources.capacity,
      this.resources.energy + recoveryRate
    );
    
    // Add some randomness (quantum flux)
    if (this.engines.quantumFlux.bool(0.05)) {
      // Random energy fluctuation
      const fluctuation = this.engines.quantumFlux.gaussian(0, 1);
      this.resources.energy += fluctuation;
      this.resources.energy = Math.max(0, Math.min(this.resources.capacity, this.resources.energy));
    }
    
    // Update entropy based on queue length
    const entropy = this.actionQueue.length / 20;  // Max entropy at 20 queued
    this.engines.nexoris.set('somatic', 'entropy', Math.min(PHI, entropy));
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Receive a message (from COREOGRAPH)
   */
  receive(message) {
    if (message.action === 'execute') {
      return this.queueAction(message.payload);
    } else if (message.action === 'cancel') {
      return this.cancelAction(message.payload.actionId);
    }
    return { received: true };
  }

  /**
   * Queue an action for execution
   */
  queueAction(action) {
    const actionEntry = {
      id: action.id || `action-${Date.now()}-${this.engines.quantumFlux.uuid().slice(0, 8)}`,
      type: action.type,
      payload: action.payload,
      priority: action.priority || 2,
      queuedAt: Date.now(),
      progress: 0,
    };
    
    // Insert by priority (phi-weighted)
    const insertIndex = this.actionQueue.findIndex(
      a => Math.pow(PHI, -a.priority) < Math.pow(PHI, -actionEntry.priority)
    );
    
    if (insertIndex === -1) {
      this.actionQueue.push(actionEntry);
    } else {
      this.actionQueue.splice(insertIndex, 0, actionEntry);
    }
    
    return { queued: true, actionId: actionEntry.id, position: insertIndex === -1 ? this.actionQueue.length : insertIndex };
  }

  /**
   * Cancel a queued action
   */
  cancelAction(actionId) {
    // Check current action
    if (this.currentAction?.id === actionId) {
      this.stats.actionsFailed++;
      this.currentAction = null;
      return { cancelled: true };
    }
    
    // Check queue
    const index = this.actionQueue.findIndex(a => a.id === actionId);
    if (index !== -1) {
      this.actionQueue.splice(index, 1);
      return { cancelled: true };
    }
    
    return { cancelled: false, reason: 'not found' };
  }

  /**
   * Get resource status
   */
  getResources() {
    return { ...this.resources };
  }

  /**
   * Get current state
   */
  getState() {
    return {
      awake: this.awake,
      currentAction: this.currentAction ? {
        id: this.currentAction.id,
        type: this.currentAction.type,
        progress: this.currentAction.progress,
      } : null,
      queueLength: this.actionQueue.length,
      resources: { ...this.resources },
      stats: { ...this.stats },
    };
  }

  /**
   * Get health score
   */
  getHealth() {
    if (!this.awake) return { score: 0 };
    
    const energyScore = this.resources.energy / this.resources.capacity;
    const loadScore = 1 - this.resources.load;
    const failureRate = this.stats.actionsExecuted > 0 
      ? 1 - (this.stats.actionsFailed / this.stats.actionsExecuted)
      : 1;
    
    const score = Math.round(((energyScore + loadScore + failureRate) / 3) * 100);
    
    return { score: Math.max(0, Math.min(100, score)) };
  }
}

export { CorpusAgent };
export default CorpusAgent;
