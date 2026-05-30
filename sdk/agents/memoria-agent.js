/**
 * MEMORIA AGENT — Memory
 * 
 * The memory center of the organism. MEMORIA stores and retrieves.
 * Uses CHRONO for timing, NEXORIS for state, phi-weighted decay.
 * 
 * Responsibilities:
 *   - Short-term and long-term memory
 *   - Memory encoding and retrieval
 *   - Memory consolidation
 *   - Associative recall
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

class MemoriaAgent {
  constructor(engines) {
    this.id = 'MEMORIA';
    this.engines = engines;
    
    // Memory stores
    this.stm = [];  // Short-term memory (recent, fast decay)
    this.ltm = new Map();  // Long-term memory (consolidated, slow decay)
    this.workingMemory = new Map();  // Active working set
    
    // Memory configuration
    this.config = {
      stmCapacity: 7,  // Miller's law
      stmDecayRate: 0.1,
      ltmDecayRate: 0.001,
      consolidationThreshold: PHI_INV,
    };
    
    // Timers
    this.decayTimer = null;
    this.consolidateTimer = null;
    
    // Statistics
    this.stats = {
      encodings: 0,
      retrievals: 0,
      consolidations: 0,
      forgettings: 0,
    };
    
    this.awake = false;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  awaken() {
    if (this.awake) return;
    this.awake = true;
    
    console.log(`[MEMORIA] Awakening — memories surface...`);
    
    // Start decay loop (every 5 beats)
    this.decayTimer = this.engines.chrono.setInterval(() => this._decay(), 5);
    
    // Start consolidation loop (every 50 beats)
    this.consolidateTimer = this.engines.chrono.setInterval(() => this._consolidate(), 50);
  }

  shutdown() {
    if (!this.awake) return;
    this.awake = false;
    
    if (this.decayTimer) this.engines.chrono.clearInterval(this.decayTimer);
    if (this.consolidateTimer) this.engines.chrono.clearInterval(this.consolidateTimer);
    
    console.log(`[MEMORIA] Shutting down — ${this.ltm.size} memories preserved`);
  }

  restart() {
    this.shutdown();
    this.awaken();
  }

  // ── Core Memory Loops ──────────────────────────────────────────────────

  /**
   * Decay loop — runs every 5 beats
   * Apply phi-weighted decay to all memories
   */
  _decay() {
    if (!this.awake) return;
    
    // Decay STM
    this.stm = this.stm
      .map(m => ({
        ...m,
        strength: m.strength * (1 - this.config.stmDecayRate * PHI_INV),
      }))
      .filter(m => {
        if (m.strength < 0.1) {
          this.stats.forgettings++;
          return false;
        }
        return true;
      });
    
    // Decay LTM (much slower)
    for (const [id, memory] of this.ltm) {
      memory.strength *= (1 - this.config.ltmDecayRate * PHI_INV);
      if (memory.strength < 0.01) {
        this.ltm.delete(id);
        this.stats.forgettings++;
      }
    }
    
    // Decay working memory
    for (const [id, memory] of this.workingMemory) {
      memory.activation *= PHI_INV;
      if (memory.activation < 0.1) {
        this.workingMemory.delete(id);
      }
    }
  }

  /**
   * Consolidation loop — runs every 50 beats
   * Move strong STM memories to LTM
   */
  _consolidate() {
    if (!this.awake) return;
    
    const toConsolidate = this.stm.filter(m => m.strength >= this.config.consolidationThreshold);
    
    for (const memory of toConsolidate) {
      // Check if already in LTM
      if (this.ltm.has(memory.id)) {
        // Strengthen existing memory
        const existing = this.ltm.get(memory.id);
        existing.strength = Math.min(PHI, existing.strength + memory.strength * PHI_INV);
        existing.retrievalCount++;
      } else {
        // Create new LTM entry
        this.ltm.set(memory.id, {
          ...memory,
          consolidatedAt: Date.now(),
          retrievalCount: 0,
        });
      }
      
      this.stats.consolidations++;
    }
    
    // Remove consolidated from STM
    this.stm = this.stm.filter(m => m.strength < this.config.consolidationThreshold);
    
    // Emit consolidation event
    if (toConsolidate.length > 0) {
      this.engines.coreograph.emit('MEMORIA:consolidated', {
        count: toConsolidate.length,
        ltmSize: this.ltm.size,
      });
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Receive a message (from COREOGRAPH)
   */
  receive(message) {
    if (message.action === 'encode') {
      return this.encode(message.payload.content, message.payload.importance);
    } else if (message.action === 'recall') {
      return this.recall(message.payload.id);
    } else if (message.action === 'search') {
      return this.search(message.payload.query);
    }
    return { received: true };
  }

  /**
   * Encode a new memory
   */
  encode(content, importance = 1.0) {
    const id = `mem-${Date.now()}-${this.engines.quantumFlux.uuid().slice(0, 8)}`;
    
    const memory = {
      id,
      content,
      strength: importance * PHI_INV,
      encodedAt: Date.now(),
      tags: this._extractTags(content),
    };
    
    // Add to STM
    this.stm.push(memory);
    
    // Enforce STM capacity (replace weakest)
    if (this.stm.length > this.config.stmCapacity) {
      this.stm.sort((a, b) => b.strength - a.strength);
      this.stm = this.stm.slice(0, this.config.stmCapacity);
    }
    
    this.stats.encodings++;
    
    return { encoded: true, id, strength: memory.strength };
  }

  /**
   * Recall a specific memory by ID
   */
  recall(id) {
    this.stats.retrievals++;
    
    // Check working memory first
    if (this.workingMemory.has(id)) {
      const memory = this.workingMemory.get(id);
      memory.activation = Math.min(PHI, memory.activation + 0.2);
      return { found: true, memory };
    }
    
    // Check STM
    const stmMemory = this.stm.find(m => m.id === id);
    if (stmMemory) {
      stmMemory.strength = Math.min(PHI, stmMemory.strength + 0.1);
      this._activateInWorkingMemory(stmMemory);
      return { found: true, memory: stmMemory };
    }
    
    // Check LTM
    if (this.ltm.has(id)) {
      const ltmMemory = this.ltm.get(id);
      ltmMemory.strength = Math.min(PHI, ltmMemory.strength + 0.05);
      ltmMemory.retrievalCount++;
      this._activateInWorkingMemory(ltmMemory);
      return { found: true, memory: ltmMemory };
    }
    
    return { found: false };
  }

  /**
   * Search memories by content
   */
  search(query) {
    this.stats.retrievals++;
    
    const queryTags = this._extractTags(query);
    const results = [];
    
    // Search STM
    for (const memory of this.stm) {
      const relevance = this._calculateRelevance(queryTags, memory.tags);
      if (relevance > 0.3) {
        results.push({ ...memory, source: 'stm', relevance });
      }
    }
    
    // Search LTM
    for (const [, memory] of this.ltm) {
      const relevance = this._calculateRelevance(queryTags, memory.tags);
      if (relevance > 0.3) {
        results.push({ ...memory, source: 'ltm', relevance });
      }
    }
    
    // Sort by relevance (phi-weighted by strength)
    results.sort((a, b) => {
      const scoreA = a.relevance * PHI + a.strength;
      const scoreB = b.relevance * PHI + b.strength;
      return scoreB - scoreA;
    });
    
    // Activate top results in working memory
    for (const result of results.slice(0, 3)) {
      this._activateInWorkingMemory(result);
    }
    
    return { found: results.length > 0, results: results.slice(0, 10) };
  }

  /**
   * Add to working memory
   */
  _activateInWorkingMemory(memory) {
    this.workingMemory.set(memory.id, {
      ...memory,
      activation: 1.0,
      activatedAt: Date.now(),
    });
  }

  /**
   * Extract tags from content
   */
  _extractTags(content) {
    if (typeof content === 'string') {
      // Simple word extraction
      return content.toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 2)
        .slice(0, 10);
    } else if (typeof content === 'object') {
      return Object.keys(content);
    }
    return [];
  }

  /**
   * Calculate relevance between query tags and memory tags
   */
  _calculateRelevance(queryTags, memoryTags) {
    if (queryTags.length === 0 || memoryTags.length === 0) return 0;
    
    const matches = queryTags.filter(t => memoryTags.includes(t)).length;
    return matches / Math.max(queryTags.length, memoryTags.length);
  }

  /**
   * Get current state
   */
  getState() {
    return {
      awake: this.awake,
      stmCount: this.stm.length,
      stmCapacity: this.config.stmCapacity,
      ltmCount: this.ltm.size,
      workingMemoryCount: this.workingMemory.size,
      stats: { ...this.stats },
    };
  }

  /**
   * Get health score
   */
  getHealth() {
    if (!this.awake) return { score: 0 };
    
    const stmHealth = this.stm.length > 0 ? 1 : 0.5;
    const ltmHealth = this.ltm.size > 0 ? Math.min(1, this.ltm.size / 100) : 0.5;
    const retrievalRatio = this.stats.encodings > 0 
      ? Math.min(1, this.stats.retrievals / this.stats.encodings)
      : 0.5;
    
    const score = Math.round(((stmHealth + ltmHealth + retrievalRatio) / 3) * 100);
    
    return { score: Math.max(0, Math.min(100, score)) };
  }
}

export { MemoriaAgent };
export default MemoriaAgent;
