/**
 * PROTO-242: Memory Palace Protocol (MPP)
 * Hierarchical memory organization and retrieval.
 *
 * The Memory Palace Protocol defines formal rules for:
 * - Memory encoding and storage
 * - Hierarchical chamber organization
 * - Associative linking and retrieval
 * - Consolidation and pruning cycles
 *
 * φ-enhanced: Uses golden ratio for forgetting curves and association weights.
 *
 * @module protocols/memory-palace-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-242';
const PROTOCOL_NAME = 'Memory Palace Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const MEMORY_CONFIG = {
  // Capacity limits
  WORKING_MEMORY_CAPACITY: 7,  // Miller's magic number
  CHAMBER_CAPACITY: 1000,
  MAX_ASSOCIATIONS: 100,
  
  // Strength parameters
  INITIAL_STRENGTH: 1.0,
  MIN_STRENGTH_THRESHOLD: 0.1,
  STRENGTHENING_INCREMENT: 0.1 * PHI_INVERSE,
  
  // Importance thresholds
  LOW_IMPORTANCE: 0.3,
  MEDIUM_IMPORTANCE: 0.5,
  HIGH_IMPORTANCE: 0.8,
  CONSOLIDATION_THRESHOLD: 0.3,
  
  // Timing (milliseconds)
  FORGETTING_HALF_LIFE: 86400000,  // 1 day
  CONSOLIDATION_INTERVAL: 3600000,  // 1 hour
  
  // Association weights
  DEFAULT_ASSOCIATION_WEIGHT: 0.5,
  ASSOCIATION_DECAY: PHI_INVERSE
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  ENCODE: 'encode',
  RETRIEVE: 'retrieve',
  ASSOCIATE: 'associate',
  CONSOLIDATE: 'consolidate',
  PRUNE: 'prune',
  DREAM: 'dream',
  CREATE_CHAMBER: 'create_chamber',
  MOVE_MEMORY: 'move_memory',
  SHARE_MEMORY: 'share_memory'
};

// ═══════════════════════════════════════════════════════════════════════════════
// PALACE STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const PALACE_STATES = {
  DORMANT: 'dormant',
  ENCODING: 'encoding',
  RETRIEVING: 'retrieving',
  CONSOLIDATING: 'consolidating',
  PRUNING: 'pruning',
  DREAMING: 'dreaming'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MEMORY_TYPES = {
  EPISODIC: 'episodic',
  SEMANTIC: 'semantic',
  PROCEDURAL: 'procedural',
  WORKING: 'working',
  SENSORY: 'sensory',
  PROSPECTIVE: 'prospective'
};

// ═══════════════════════════════════════════════════════════════════════════════
// RETRIEVAL STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════

export const RETRIEVAL_STRATEGIES = {
  EXACT: 'exact',
  SEMANTIC: 'semantic',
  ASSOCIATIVE: 'associative',
  CONTEXTUAL: 'contextual',
  TEMPORAL: 'temporal'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY PALACE PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class MemoryPalaceProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  /**
   * Calculate φ-scaled forgetting curve
   */
  calculateDecay(initialStrength, elapsedMs) {
    const decayRate = Math.pow(PHI_INVERSE, elapsedMs / MEMORY_CONFIG.FORGETTING_HALF_LIFE);
    return initialStrength * decayRate;
  }

  /**
   * Strengthen memory on access (spacing effect)
   */
  strengthenOnAccess(currentStrength) {
    return Math.min(1.0, currentStrength + MEMORY_CONFIG.STRENGTHENING_INCREMENT);
  }

  /**
   * Calculate relevance score for retrieval
   */
  calculateRelevance(strength, importance, recency) {
    // Recency is 0-1, where 1 is most recent
    return strength * importance * (0.5 + 0.5 * recency) * PHI_INVERSE;
  }

  /**
   * Should memory be pruned?
   */
  shouldPrune(strength, threshold = MEMORY_CONFIG.MIN_STRENGTH_THRESHOLD) {
    return strength < threshold;
  }

  /**
   * Should memory be consolidated?
   */
  shouldConsolidate(importance, accessCount) {
    return importance > MEMORY_CONFIG.CONSOLIDATION_THRESHOLD && accessCount > 3;
  }

  /**
   * Calculate association weight for dream mode
   */
  calculateDreamAssociation() {
    return Math.random() * PHI_INVERSE;
  }

  /**
   * Get chamber for memory type
   */
  getChamberForType(memoryType) {
    const typeMap = {
      [MEMORY_TYPES.EPISODIC]: 'episodic',
      [MEMORY_TYPES.SEMANTIC]: 'semantic',
      [MEMORY_TYPES.PROCEDURAL]: 'procedural',
      [MEMORY_TYPES.SENSORY]: 'sensory',
      [MEMORY_TYPES.WORKING]: 'semantic',
      [MEMORY_TYPES.PROSPECTIVE]: 'episodic'
    };
    return typeMap[memoryType] || 'semantic';
  }

  /**
   * Get protocol metadata
   */
  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      config: MEMORY_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES),
      states: Object.keys(PALACE_STATES),
      memoryTypes: Object.keys(MEMORY_TYPES),
      retrievalStrategies: Object.keys(RETRIEVAL_STRATEGIES),
      phi: this.phi
    };
  }
}

export default MemoryPalaceProtocol;
