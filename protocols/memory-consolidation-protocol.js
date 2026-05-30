/**
 * PROTO-216: Memory Consolidation Protocol (MCP)
 * Short-term to long-term memory transfer with phi-weighted importance.
 * 
 * Implements memory consolidation during heartbeat cycles:
 * - Working memory (fast decay, high capacity)
 * - Episodic memory (medium decay, associative)
 * - Semantic memory (slow decay, abstracted)
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const MEMORY_TYPES = ['working', 'episodic', 'semantic'];

class MemoryConsolidationProtocol {
  constructor() {
    this.working = new Map();      // Fast decay, recent items
    this.episodic = new Map();     // Event-based memories
    this.semantic = new Map();     // Abstracted knowledge
    
    this.workingCapacity = 7;      // Miller's magic number
    this.consolidationThreshold = PHI - 1;  // 0.618
    this.totalConsolidations = 0;
    this.beatCount = 0;
  }

  encode(content, importance = 0.5) {
    const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const memory = {
      id,
      content,
      importance: Math.max(0, Math.min(1, importance)),
      encodedAt: Date.now(),
      accessCount: 0,
      lastAccess: Date.now(),
      strength: importance * PHI,
      type: 'working',
    };
    
    // Add to working memory
    this.working.set(id, memory);
    
    // Enforce capacity limit (FIFO with importance weighting)
    while (this.working.size > this.workingCapacity) {
      let weakestId = null;
      let weakestStrength = Infinity;
      
      for (const [mid, mem] of this.working) {
        if (mem.strength < weakestStrength) {
          weakestStrength = mem.strength;
          weakestId = mid;
        }
      }
      
      if (weakestId) {
        this.working.delete(weakestId);
      } else {
        break;
      }
    }
    
    return id;
  }

  recall(id) {
    // Search all memory stores
    let memory = this.working.get(id) || this.episodic.get(id) || this.semantic.get(id);
    
    if (memory) {
      memory.accessCount++;
      memory.lastAccess = Date.now();
      // Strengthen on recall
      memory.strength = Math.min(PHI, memory.strength * 1.1);
    }
    
    return memory;
  }

  search(query) {
    const results = [];
    const queryLower = typeof query === 'string' ? query.toLowerCase() : JSON.stringify(query).toLowerCase();
    
    const searchStore = (store, type) => {
      for (const [id, mem] of store) {
        const content = typeof mem.content === 'string' 
          ? mem.content.toLowerCase() 
          : JSON.stringify(mem.content).toLowerCase();
        
        if (content.includes(queryLower)) {
          results.push({ ...mem, type, relevance: mem.strength });
        }
      }
    };
    
    searchStore(this.working, 'working');
    searchStore(this.episodic, 'episodic');
    searchStore(this.semantic, 'semantic');
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  consolidate() {
    this.beatCount++;
    const consolidated = [];
    
    // Move strong working memories to episodic
    for (const [id, mem] of this.working) {
      if (mem.strength >= this.consolidationThreshold) {
        mem.type = 'episodic';
        mem.consolidatedAt = Date.now();
        this.episodic.set(id, mem);
        this.working.delete(id);
        consolidated.push({ id, from: 'working', to: 'episodic' });
        this.totalConsolidations++;
      }
    }
    
    // Move frequently accessed episodic to semantic (abstracted)
    for (const [id, mem] of this.episodic) {
      if (mem.accessCount >= 3 && mem.strength >= PHI - 0.5) {
        mem.type = 'semantic';
        mem.abstractedAt = Date.now();
        // Abstract the content (simplified)
        mem.abstraction = this.abstract(mem.content);
        this.semantic.set(id, mem);
        this.episodic.delete(id);
        consolidated.push({ id, from: 'episodic', to: 'semantic' });
        this.totalConsolidations++;
      }
    }
    
    return { consolidated, beat: this.beatCount };
  }

  abstract(content) {
    // Simple abstraction: extract key terms
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    const words = str.split(/\s+/).filter(w => w.length > 3);
    const unique = [...new Set(words)];
    return unique.slice(0, 5).join(' ');
  }

  decay() {
    // Apply phi-weighted decay to all memories
    const decayRates = {
      working: 0.9,           // Fast decay
      episodic: 0.99,         // Medium decay
      semantic: 0.999,        // Slow decay
    };
    
    const decay = (store, rate) => {
      const toRemove = [];
      for (const [id, mem] of store) {
        mem.strength *= rate;
        if (mem.strength < 0.1) {
          toRemove.push(id);
        }
      }
      for (const id of toRemove) {
        store.delete(id);
      }
    };
    
    decay(this.working, decayRates.working);
    decay(this.episodic, decayRates.episodic);
    decay(this.semantic, decayRates.semantic);
  }

  getStats() {
    return {
      working: {
        count: this.working.size,
        capacity: this.workingCapacity,
        avgStrength: this.avgStrength(this.working),
      },
      episodic: {
        count: this.episodic.size,
        avgStrength: this.avgStrength(this.episodic),
      },
      semantic: {
        count: this.semantic.size,
        avgStrength: this.avgStrength(this.semantic),
      },
      totalConsolidations: this.totalConsolidations,
      beatCount: this.beatCount,
      consolidationThreshold: this.consolidationThreshold,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }

  avgStrength(store) {
    if (store.size === 0) return 0;
    let sum = 0;
    for (const mem of store.values()) {
      sum += mem.strength;
    }
    return sum / store.size;
  }
}

export { MemoryConsolidationProtocol, MEMORY_TYPES };
export default MemoryConsolidationProtocol;
