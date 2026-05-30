/**
 * ANIMUS AGENT — The Mind
 * 
 * The cognitive center of the organism. ANIMUS reasons, decides, and plans.
 * Uses CHRONO for timing, NEXORIS for state, QUANTUM_FLUX for creativity.
 * 
 * Responsibilities:
 *   - High-level reasoning and decision making
 *   - Goal prioritization and planning
 *   - Pattern recognition and synthesis
 *   - Attention routing
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

class AnimusAgent {
  constructor(engines) {
    this.id = 'ANIMUS';
    this.engines = engines;
    
    // Cognitive state
    this.thoughts = [];
    this.currentGoal = null;
    this.attention = new Map();
    this.patterns = [];
    
    // Timers
    this.thinkTimer = null;
    this.dreamTimer = null;
    this.reflectTimer = null;
    
    // Statistics
    this.stats = {
      thoughtsProcessed: 0,
      decisionssMade: 0,
      patternsRecognized: 0,
    };
    
    this.awake = false;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  awaken() {
    if (this.awake) return;
    this.awake = true;
    
    this.thinkTimer = this.engines.chrono.setInterval(() => this._think(), 1);
    this.dreamTimer = this.engines.chrono.setInterval(() => this._dream(), 5);
    this.reflectTimer = this.engines.chrono.setInterval(() => this._reflect(), 30);
    
    this.engines.nexoris.set('cognitive', 'awareness', 1.0);
  }

  shutdown() {
    if (!this.awake) return;
    this.awake = false;
    
    if (this.thinkTimer) this.engines.chrono.clearInterval(this.thinkTimer);
    if (this.dreamTimer) this.engines.chrono.clearInterval(this.dreamTimer);
    if (this.reflectTimer) this.engines.chrono.clearInterval(this.reflectTimer);
    
    this.thinkTimer = null;
    this.dreamTimer = null;
    this.reflectTimer = null;
  }

  restart() {
    this.shutdown();
    this.awaken();
  }

  // ── Core Cognitive Loops ───────────────────────────────────────────────

  _think() {
    if (!this.awake) return;
    
    for (const [key, weight] of this.attention) {
      const decayed = this.engines.chrono.decay(weight, 1, 50);
      if (decayed < 0.01) {
        this.attention.delete(key);
      } else {
        this.attention.set(key, decayed);
      }
    }
    
    if (this.thoughts.length > 0) {
      const thought = this.thoughts.shift();
      this.stats.thoughtsProcessed++;
    }
  }

  _dream() {
    if (!this.awake) return;
    this.patterns = this.patterns
      .map(p => ({ ...p, strength: (p.strength || 1) * PHI_INV }))
      .filter(p => p.strength > 0.1);
  }

  _reflect() {
    if (!this.awake) return;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  addThought(content, priority = 2) {
    const thought = {
      id: `thought-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      priority,
      timestamp: Date.now(),
    };
    this.thoughts.push(thought);
    return thought;
  }

  setGoal(goal) {
    this.currentGoal = { ...goal };
    this.stats.decisionssMade++;
    return this.currentGoal;
  }

  clearGoal() {
    const prev = this.currentGoal;
    this.currentGoal = null;
    return prev;
  }

  attend(resource, weight) {
    const clamped = Math.max(0, Math.min(1, weight));
    this.attention.set(resource, clamped);
  }

  getAttention(resource) {
    return this.attention.get(resource) || 0;
  }

  clearAttention(resource) {
    this.attention.delete(resource);
  }

  addPattern(pattern) {
    const p = { ...pattern, strength: 1.0, createdAt: Date.now() };
    this.patterns.push(p);
    this.stats.patternsRecognized++;
    return p;
  }

  decide(options) {
    if (!options || options.length === 0) return null;
    const selected = options.reduce((best, cur) => cur.score > best.score ? cur : best, options[0]);
    this.stats.decisionssMade++;
    return { selected };
  }

  getStats() {
    return { ...this.stats };
  }

  receive(message) {
    this.thoughts.push({
      id: `thought-${Date.now()}`,
      ...message,
    });
    return { received: true, queueLength: this.thoughts.length };
  }

  getState() {
    return {
      awake: this.awake,
      currentGoal: this.currentGoal,
      thoughtQueueLength: this.thoughts.length,
      attentionKeys: Array.from(this.attention.keys()),
      patternCount: this.patterns.length,
      stats: { ...this.stats },
    };
  }
}

export { AnimusAgent };
export default AnimusAgent;
