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
    this.attention = new Map();  // resource -> attention weight
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
    
    console.log(`[ANIMUS] Awakening — the mind stirs...`);
    
    // Start thinking loop (every beat)
    this.thinkTimer = this.engines.chrono.setInterval(() => this._think(), 1);
    
    // Start dreaming loop (every 5 beats)
    this.dreamTimer = this.engines.chrono.setInterval(() => this._dream(), 5);
    
    // Start reflection loop (every 30 beats)
    this.reflectTimer = this.engines.chrono.setInterval(() => this._reflect(), 30);
    
    // Update cognitive register
    this.engines.nexoris.set('cognitive', 'awareness', 1.0);
  }

  shutdown() {
    if (!this.awake) return;
    this.awake = false;
    
    if (this.thinkTimer) this.engines.chrono.clearInterval(this.thinkTimer);
    if (this.dreamTimer) this.engines.chrono.clearInterval(this.dreamTimer);
    if (this.reflectTimer) this.engines.chrono.clearInterval(this.reflectTimer);
    
    console.log(`[ANIMUS] Shutting down — ${this.stats.thoughtsProcessed} thoughts processed`);
  }

  restart() {
    this.shutdown();
    this.awaken();
  }

  // ── Core Cognitive Loops ───────────────────────────────────────────────

  /**
   * Main reasoning loop — runs every beat
   * Process input, update attention, make decisions
   */
  _think() {
    if (!this.awake) return;
    
    const beat = this.engines.chrono.getBeat();
    
    // Update attention with phi-decay
    for (const [key, weight] of this.attention) {
      const decayed = this.engines.chrono.decay(weight, 1, 50);
      if (decayed < 0.01) {
        this.attention.delete(key);
      } else {
        this.attention.set(key, decayed);
      }
    }
    
    // Process pending thoughts
    if (this.thoughts.length > 0) {
      const thought = this.thoughts.shift();
      this._processThought(thought);
      this.stats.thoughtsProcessed++;
    }
    
    // Update cognitive coherence based on attention distribution
    const totalAttention = Array.from(this.attention.values()).reduce((s, v) => s + v, 0);
    const coherence = totalAttention > 0 ? Math.min(1.0, totalAttention / PHI) : PHI_INV;
    this.engines.nexoris.set('cognitive', 'coherence', coherence);
  }

  /**
   * Background processing — runs every 5 beats
   * Synthesize patterns, consolidate knowledge
   */
  _dream() {
    if (!this.awake) return;
    
    // Prune old patterns with phi-decay
    this.patterns = this.patterns
      .map(p => ({ ...p, strength: p.strength * PHI_INV }))
      .filter(p => p.strength > 0.1);
    
    // Random creative insight (quantum flux)
    if (this.engines.quantumFlux.bool(0.1)) {
      const insight = this._generateInsight();
      if (insight) {
        this.patterns.push({
          type: 'insight',
          content: insight,
          strength: PHI_INV,
          createdAt: Date.now(),
        });
      }
    }
  }

  /**
   * Self-analysis — runs every 30 beats
   * Evaluate performance, adjust strategies
   */
  _reflect() {
    if (!this.awake) return;
    
    const state = this.engines.nexoris.getRegister('cognitive');
    
    // Calculate effectiveness
    const effectiveness = (state.awareness + state.coherence + state.resonance) / 3;
    
    // If effectiveness is low, increase entropy (try new things)
    if (effectiveness < PHI_INV) {
      this.engines.nexoris.set('cognitive', 'entropy', state.entropy + 0.1);
    } else {
      // If effective, reduce entropy (stick with what works)
      this.engines.nexoris.set('cognitive', 'entropy', state.entropy * PHI_INV);
    }
    
    // Emit reflection event
    this.engines.coreograph.emit('ANIMUS:reflection', {
      effectiveness,
      thoughtsProcessed: this.stats.thoughtsProcessed,
      patternsCount: this.patterns.length,
    });
  }

  // ── Cognitive Functions ────────────────────────────────────────────────

  /**
   * Process a thought
   */
  _processThought(thought) {
    // Route based on thought type
    switch (thought.type) {
      case 'percept':
        this._procesPercept(thought);
        break;
      case 'query':
        this._processQuery(thought);
        break;
      case 'goal':
        this._processGoal(thought);
        break;
      default:
        // Generic processing
        this.attention.set(thought.id, PHI_INV);
    }
  }

  _procesPercept(percept) {
    // Pattern match against existing patterns
    for (const pattern of this.patterns) {
      if (this._matches(percept, pattern)) {
        pattern.strength = Math.min(PHI, pattern.strength + 0.1);
        this.stats.patternsRecognized++;
        return;
      }
    }
    
    // New pattern
    this.patterns.push({
      type: 'percept',
      content: percept.content,
      strength: PHI_INV,
      createdAt: Date.now(),
    });
  }

  _processQuery(query) {
    // Search patterns for answer
    const relevant = this.patterns
      .filter(p => this._relevantTo(p, query))
      .sort((a, b) => b.strength - a.strength);
    
    if (relevant.length > 0) {
      return { answer: relevant[0].content, confidence: relevant[0].strength };
    }
    return { answer: null, confidence: 0 };
  }

  _processGoal(goal) {
    // Prioritize with phi-weighted urgency
    const priority = goal.urgency * PHI + goal.importance;
    
    if (!this.currentGoal || priority > this.currentGoal.priority) {
      this.currentGoal = { ...goal, priority };
      this.stats.decisionssMade++;
    }
  }

  _generateInsight() {
    if (this.patterns.length < 2) return null;
    
    // Pick two random patterns
    const p1 = this.engines.quantumFlux.pick(this.patterns);
    const p2 = this.engines.quantumFlux.pick(this.patterns);
    
    if (p1 === p2) return null;
    
    // Combine into insight
    return {
      type: 'synthesis',
      sources: [p1, p2],
      content: `${p1.type}↔${p2.type}`,
    };
  }

  _matches(percept, pattern) {
    // Simple matching — could be enhanced
    return percept.type === pattern.type;
  }

  _relevantTo(pattern, query) {
    // Simple relevance check
    return pattern.type === query.type || pattern.type === 'insight';
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Receive a message (from COREOGRAPH)
   */
  receive(message) {
    this.thoughts.push({
      id: `thought-${Date.now()}`,
      ...message,
    });
    return { received: true, queueLength: this.thoughts.length };
  }

  /**
   * Focus attention on something
   */
  focus(key, weight = 1.0) {
    this.attention.set(key, Math.min(PHI, weight));
    this.engines.nexoris.set('cognitive', 'awareness', 
      Math.min(PHI, this.engines.nexoris.get('cognitive', 'awareness') + 0.1));
  }

  /**
   * Set a goal
   */
  setGoal(goal) {
    this.thoughts.push({
      id: `goal-${Date.now()}`,
      type: 'goal',
      ...goal,
    });
  }

  /**
   * Get current state
   */
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

  /**
   * Get health score
   */
  getHealth() {
    if (!this.awake) return { score: 0 };
    
    const state = this.engines.nexoris.getRegister('cognitive');
    const score = Math.round(
      ((state.awareness + state.coherence + state.resonance) / 3 - state.entropy / PHI) * 100
    );
    
    return { score: Math.max(0, Math.min(100, score)) };
  }
}

export { AnimusAgent };
export default AnimusAgent;
