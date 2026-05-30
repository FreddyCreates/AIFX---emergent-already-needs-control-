/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🏛️ MEMORY PALACE — Hierarchical Memory Management System 🏛️                          ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * The Memory Palace organizes knowledge using spatial metaphors and
 * associative linking, enabling efficient retrieval and consolidation.
 * 
 * MEMORY PRINCIPLES:
 *   - Memories organized in hierarchical chambers
 *   - Associative links connect related concepts
 *   - Importance-based consolidation during "sleep"
 *   - φ-scaled forgetting curves for natural decay
 * 
 * @module sdk/ai-kingdom/memory-palace
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const MEMORY_TYPES = {
  EPISODIC: 'episodic',           // Events and experiences
  SEMANTIC: 'semantic',           // Facts and concepts
  PROCEDURAL: 'procedural',       // Skills and how-to
  WORKING: 'working',             // Short-term active
  SENSORY: 'sensory',             // Raw perceptions
  PROSPECTIVE: 'prospective'      // Future intentions
};

// ═══════════════════════════════════════════════════════════════════════════════
// PALACE STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const PALACE_STATES = {
  DORMANT: 'dormant',             // Not active
  ENCODING: 'encoding',           // Storing new memories
  RETRIEVING: 'retrieving',       // Accessing memories
  CONSOLIDATING: 'consolidating', // Strengthening memories
  PRUNING: 'pruning',             // Removing weak memories
  DREAMING: 'dreaming'            // Creative recombination
};

// ═══════════════════════════════════════════════════════════════════════════════
// RETRIEVAL STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════
export const RETRIEVAL_STRATEGIES = {
  EXACT: 'exact',                 // Precise match
  SEMANTIC: 'semantic',           // Meaning-based
  ASSOCIATIVE: 'associative',     // Follow links
  CONTEXTUAL: 'contextual',       // Context-dependent
  TEMPORAL: 'temporal'            // Time-based
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class Memory {
  constructor(id, content, type = MEMORY_TYPES.SEMANTIC) {
    this.id = id;
    this.content = content;
    this.type = type;
    this.strength = 1.0;
    this.importance = 0.5;
    this.associations = new Map(); // id -> weight
    this.accessCount = 0;
    this.lastAccessed = Date.now();
    this.createdAt = Date.now();
    this.tags = [];
    this.embedding = null;
    this.chamber = null;
  }

  /**
   * Access this memory, strengthening it
   */
  access() {
    this.accessCount++;
    this.lastAccessed = Date.now();
    // Strengthen on access (spacing effect)
    this.strength = Math.min(1.0, this.strength + 0.1 * PHI_INVERSE);
    return this.content;
  }

  /**
   * Apply forgetting curve
   */
  decay(elapsedTime) {
    // φ-scaled Ebbinghaus forgetting curve
    const decayRate = Math.pow(PHI_INVERSE, elapsedTime / (86400000 * this.strength));
    this.strength *= decayRate;
    return this.strength;
  }

  /**
   * Add association to another memory
   */
  associate(targetId, weight = 0.5) {
    const existingWeight = this.associations.get(targetId) || 0;
    this.associations.set(targetId, Math.min(1.0, existingWeight + weight));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAMBER CLASS - A room in the memory palace
// ═══════════════════════════════════════════════════════════════════════════════
export class Chamber {
  constructor(chamberId, theme) {
    this.chamberId = chamberId;
    this.theme = theme;
    this.memories = new Map();
    this.subChambers = new Map();
    this.parentChamber = null;
    this.capacity = 1000;
    this.accessFrequency = 0;
    this.createdAt = Date.now();
  }

  /**
   * Store a memory in this chamber
   */
  store(memory) {
    if (this.memories.size >= this.capacity) {
      // Remove weakest memory
      this._evictWeakest();
    }
    memory.chamber = this.chamberId;
    this.memories.set(memory.id, memory);
    return true;
  }

  /**
   * Retrieve a memory by ID
   */
  retrieve(memoryId) {
    const memory = this.memories.get(memoryId);
    if (memory) {
      memory.access();
      this.accessFrequency++;
    }
    return memory;
  }

  /**
   * Search memories by content
   */
  search(query, strategy = RETRIEVAL_STRATEGIES.SEMANTIC) {
    const results = [];
    
    for (const memory of this.memories.values()) {
      const relevance = this._calculateRelevance(memory, query, strategy);
      if (relevance > 0.1) {
        results.push({ memory, relevance });
      }
    }
    
    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Calculate relevance score
   */
  _calculateRelevance(memory, query, strategy) {
    switch (strategy) {
      case RETRIEVAL_STRATEGIES.EXACT:
        return memory.content === query ? 1.0 : 0;
        
      case RETRIEVAL_STRATEGIES.SEMANTIC:
        // Simplified semantic similarity (would use embeddings in real impl)
        const contentStr = JSON.stringify(memory.content).toLowerCase();
        const queryStr = query.toLowerCase();
        const overlap = this._wordOverlap(contentStr, queryStr);
        return overlap * memory.strength;
        
      case RETRIEVAL_STRATEGIES.TEMPORAL:
        const timeDiff = Date.now() - memory.lastAccessed;
        return Math.exp(-timeDiff / 86400000) * memory.strength;
        
      default:
        return memory.strength * PHI_INVERSE;
    }
  }

  /**
   * Calculate word overlap
   */
  _wordOverlap(str1, str2) {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    let overlap = 0;
    for (const word of words1) {
      if (words2.has(word)) overlap++;
    }
    return overlap / Math.max(words1.size, words2.size);
  }

  /**
   * Evict the weakest memory
   */
  _evictWeakest() {
    let weakest = null;
    let minScore = Infinity;
    
    for (const memory of this.memories.values()) {
      const score = memory.strength * memory.importance;
      if (score < minScore) {
        minScore = score;
        weakest = memory;
      }
    }
    
    if (weakest) {
      this.memories.delete(weakest.id);
    }
  }

  /**
   * Add a sub-chamber
   */
  addSubChamber(chamber) {
    chamber.parentChamber = this.chamberId;
    this.subChambers.set(chamber.chamberId, chamber);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY PALACE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class MemoryPalace {
  constructor(palaceId, config = {}) {
    this.palaceId = palaceId;
    this.state = PALACE_STATES.DORMANT;
    this.chambers = new Map();
    this.workingMemory = new Map();
    this.associationGraph = new Map();
    this.totalMemories = 0;
    this.workingMemoryCapacity = config.workingMemoryCapacity || 7;
    this.consolidationThreshold = config.consolidationThreshold || 0.3;
    this.metrics = {
      encodings: 0,
      retrievals: 0,
      consolidations: 0,
      prunings: 0
    };
    this.createdAt = Date.now();
    
    // Create default chambers
    this._initializeDefaultChambers();
  }

  /**
   * Initialize default chamber structure
   */
  _initializeDefaultChambers() {
    const defaultChambers = [
      { id: 'episodic', theme: 'Personal Experiences' },
      { id: 'semantic', theme: 'Facts and Knowledge' },
      { id: 'procedural', theme: 'Skills and Methods' },
      { id: 'sensory', theme: 'Perceptions' }
    ];
    
    for (const { id, theme } of defaultChambers) {
      const chamber = new Chamber(id, theme);
      this.chambers.set(id, chamber);
    }
  }

  /**
   * Encode a new memory
   */
  encode(content, type = MEMORY_TYPES.SEMANTIC, options = {}) {
    this.state = PALACE_STATES.ENCODING;
    
    const memoryId = options.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const memory = new Memory(memoryId, content, type);
    
    // Set additional properties
    memory.importance = options.importance || 0.5;
    memory.tags = options.tags || [];
    memory.embedding = options.embedding || null;
    
    // Determine chamber
    const chamberId = this._selectChamber(type);
    const chamber = this.chambers.get(chamberId);
    
    if (chamber) {
      chamber.store(memory);
    }
    
    // Add to working memory if important enough
    if (memory.importance > this.consolidationThreshold) {
      this._addToWorkingMemory(memory);
    }
    
    // Create associations
    if (options.associateWith) {
      for (const targetId of options.associateWith) {
        this._createAssociation(memoryId, targetId, 0.5);
      }
    }
    
    this.totalMemories++;
    this.metrics.encodings++;
    
    return { memoryId, encoded: true, chamber: chamberId };
  }

  /**
   * Select appropriate chamber for memory type
   */
  _selectChamber(type) {
    const typeMap = {
      [MEMORY_TYPES.EPISODIC]: 'episodic',
      [MEMORY_TYPES.SEMANTIC]: 'semantic',
      [MEMORY_TYPES.PROCEDURAL]: 'procedural',
      [MEMORY_TYPES.SENSORY]: 'sensory',
      [MEMORY_TYPES.WORKING]: 'semantic',
      [MEMORY_TYPES.PROSPECTIVE]: 'episodic'
    };
    return typeMap[type] || 'semantic';
  }

  /**
   * Add memory to working memory
   */
  _addToWorkingMemory(memory) {
    // Remove oldest if at capacity
    while (this.workingMemory.size >= this.workingMemoryCapacity) {
      const oldest = Array.from(this.workingMemory.keys())[0];
      this.workingMemory.delete(oldest);
    }
    this.workingMemory.set(memory.id, memory);
  }

  /**
   * Create bidirectional association
   */
  _createAssociation(id1, id2, weight) {
    // Add to association graph
    if (!this.associationGraph.has(id1)) {
      this.associationGraph.set(id1, new Map());
    }
    if (!this.associationGraph.has(id2)) {
      this.associationGraph.set(id2, new Map());
    }
    
    this.associationGraph.get(id1).set(id2, weight);
    this.associationGraph.get(id2).set(id1, weight);
    
    // Update memory objects
    const mem1 = this._findMemory(id1);
    const mem2 = this._findMemory(id2);
    
    if (mem1) mem1.associate(id2, weight);
    if (mem2) mem2.associate(id1, weight);
  }

  /**
   * Retrieve memories by query
   */
  retrieve(query, options = {}) {
    this.state = PALACE_STATES.RETRIEVING;
    
    const strategy = options.strategy || RETRIEVAL_STRATEGIES.SEMANTIC;
    const limit = options.limit || 10;
    const chambers = options.chambers || Array.from(this.chambers.keys());
    
    let allResults = [];
    
    for (const chamberId of chambers) {
      const chamber = this.chambers.get(chamberId);
      if (chamber) {
        const results = chamber.search(query, strategy);
        allResults.push(...results);
      }
    }
    
    // Sort by relevance and limit
    allResults = allResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
    
    this.metrics.retrievals++;
    
    // Follow associations if requested
    if (options.followAssociations) {
      allResults = this._expandAssociations(allResults, options.associationDepth || 1);
    }
    
    return allResults;
  }

  /**
   * Expand results by following associations
   */
  _expandAssociations(results, depth) {
    const expanded = [...results];
    const seen = new Set(results.map(r => r.memory.id));
    
    for (let d = 0; d < depth; d++) {
      const newMemories = [];
      
      for (const result of expanded) {
        const associations = this.associationGraph.get(result.memory.id);
        if (!associations) continue;
        
        for (const [targetId, weight] of associations) {
          if (seen.has(targetId)) continue;
          
          const memory = this._findMemory(targetId);
          if (memory) {
            newMemories.push({
              memory,
              relevance: result.relevance * weight * PHI_INVERSE
            });
            seen.add(targetId);
          }
        }
      }
      
      expanded.push(...newMemories);
    }
    
    return expanded.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Find memory across all chambers
   */
  _findMemory(memoryId) {
    for (const chamber of this.chambers.values()) {
      const memory = chamber.memories.get(memoryId);
      if (memory) return memory;
    }
    return null;
  }

  /**
   * Consolidate memories (like sleep)
   */
  consolidate() {
    this.state = PALACE_STATES.CONSOLIDATING;
    
    const consolidated = [];
    const now = Date.now();
    
    for (const chamber of this.chambers.values()) {
      for (const memory of chamber.memories.values()) {
        // Strengthen important and frequently accessed memories
        if (memory.importance > 0.5 && memory.accessCount > 3) {
          memory.strength = Math.min(1.0, memory.strength * PHI);
          consolidated.push(memory.id);
        }
        
        // Apply forgetting curve
        const elapsed = now - memory.lastAccessed;
        memory.decay(elapsed);
      }
    }
    
    this.metrics.consolidations++;
    
    return { consolidated: consolidated.length };
  }

  /**
   * Prune weak memories
   */
  prune(threshold = 0.1) {
    this.state = PALACE_STATES.PRUNING;
    
    let pruned = 0;
    
    for (const chamber of this.chambers.values()) {
      const toRemove = [];
      
      for (const [id, memory] of chamber.memories) {
        if (memory.strength < threshold) {
          toRemove.push(id);
        }
      }
      
      for (const id of toRemove) {
        chamber.memories.delete(id);
        this.associationGraph.delete(id);
        pruned++;
      }
    }
    
    this.totalMemories -= pruned;
    this.metrics.prunings++;
    
    return { pruned };
  }

  /**
   * Dream mode: Creative recombination
   */
  dream(iterations = 10) {
    this.state = PALACE_STATES.DREAMING;
    
    const insights = [];
    
    for (let i = 0; i < iterations; i++) {
      // Randomly select two memories
      const allMemories = [];
      for (const chamber of this.chambers.values()) {
        allMemories.push(...chamber.memories.values());
      }
      
      if (allMemories.length < 2) break;
      
      const mem1 = allMemories[Math.floor(Math.random() * allMemories.length)];
      const mem2 = allMemories[Math.floor(Math.random() * allMemories.length)];
      
      if (mem1.id !== mem2.id) {
        // Create potential new association
        const potentialWeight = Math.random() * PHI_INVERSE;
        
        if (potentialWeight > 0.3) {
          this._createAssociation(mem1.id, mem2.id, potentialWeight);
          insights.push({
            memory1: mem1.id,
            memory2: mem2.id,
            weight: potentialWeight
          });
        }
      }
    }
    
    return { insights: insights.length, connections: insights };
  }

  /**
   * Get palace status
   */
  getStatus() {
    return {
      palaceId: this.palaceId,
      state: this.state,
      chambers: this.chambers.size,
      totalMemories: this.totalMemories,
      workingMemory: this.workingMemory.size,
      associations: this.associationGraph.size,
      metrics: this.metrics
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PALACE NETWORK - Distributed memory across palaces
// ═══════════════════════════════════════════════════════════════════════════════
export class PalaceNetwork {
  constructor(networkId) {
    this.networkId = networkId;
    this.palaces = new Map();
    this.sharedMemories = new Map();
    this.createdAt = Date.now();
  }

  addPalace(palaceId, config = {}) {
    const palace = new MemoryPalace(palaceId, config);
    this.palaces.set(palaceId, palace);
    return palace;
  }

  /**
   * Share a memory across palaces
   */
  shareMemory(sourcePalaceId, memoryId, targetPalaceIds) {
    const source = this.palaces.get(sourcePalaceId);
    if (!source) return { shared: false, reason: 'Source palace not found' };
    
    const memory = source._findMemory(memoryId);
    if (!memory) return { shared: false, reason: 'Memory not found' };
    
    const shared = [];
    
    for (const targetId of targetPalaceIds) {
      const target = this.palaces.get(targetId);
      if (target && targetId !== sourcePalaceId) {
        // Encode copy in target
        target.encode(memory.content, memory.type, {
          importance: memory.importance * PHI_INVERSE,
          tags: [...memory.tags, 'shared']
        });
        shared.push(targetId);
      }
    }
    
    this.sharedMemories.set(memoryId, {
      original: sourcePalaceId,
      copies: shared,
      sharedAt: Date.now()
    });
    
    return { shared: true, targets: shared };
  }

  /**
   * Global dream across all palaces
   */
  globalDream(iterations = 10) {
    const results = [];
    
    for (const [id, palace] of this.palaces) {
      const result = palace.dream(iterations);
      results.push({ palaceId: id, ...result });
    }
    
    return results;
  }

  getNetworkStatus() {
    return {
      networkId: this.networkId,
      palaces: this.palaces.size,
      totalMemories: Array.from(this.palaces.values())
        .reduce((sum, p) => sum + p.totalMemories, 0),
      sharedMemories: this.sharedMemories.size
    };
  }
}

export default MemoryPalace;
