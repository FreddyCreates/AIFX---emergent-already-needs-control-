/**
 * PROTO-239: Wisdom Distillery Protocol (WDP)
 * Knowledge extraction, compression, and transfer across AI models.
 *
 * The Wisdom Distillery Protocol defines formal rules for:
 * - Knowledge extraction from source models
 * - Purification and noise removal
 * - Compression into knowledge crystals
 * - Transfer to target models with efficiency tracking
 *
 * φ-enhanced: Uses golden ratio for compression ratios and transfer efficiency.
 *
 * @module protocols/wisdom-distillery-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-239';
const PROTOCOL_NAME = 'Wisdom Distillery Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// DISTILLERY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const DISTILLERY_CONFIG = {
  // Compression ratios
  LOSSLESS_RATIO: 1.0,
  MILD_RATIO: PHI_INVERSE,                    // ~62%
  MODERATE_RATIO: PHI_INVERSE ** 2,           // ~38%
  AGGRESSIVE_RATIO: PHI_INVERSE ** 3,         // ~24%
  ESSENCE_RATIO: PHI_INVERSE ** 4,            // ~15%
  
  // Purity thresholds
  MIN_PURITY: 0.7,
  TARGET_PURITY: 0.95,
  PURE_THRESHOLD: 0.99,
  
  // Transfer parameters
  MIN_TRANSFER_EFFICIENCY: 0.5,
  OPTIMAL_TRANSFER_EFFICIENCY: PHI_INVERSE + 0.3,
  
  // Capacity limits
  MAX_CRYSTALS_PER_EXTRACTION: 100,
  MAX_TRANSFER_BATCH: 50
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  REGISTER_SOURCE: 'register_source',
  REGISTER_TARGET: 'register_target',
  EXTRACT_REQUEST: 'extract_request',
  EXTRACT_COMPLETE: 'extract_complete',
  PURIFY_REQUEST: 'purify_request',
  PURIFY_COMPLETE: 'purify_complete',
  COMPRESS_REQUEST: 'compress_request',
  CRYSTAL_CREATED: 'crystal_created',
  TRANSFER_REQUEST: 'transfer_request',
  TRANSFER_COMPLETE: 'transfer_complete',
  DISTILL_PIPELINE: 'distill_pipeline'
};

// ═══════════════════════════════════════════════════════════════════════════════
// DISTILLERY STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const DISTILLERY_STATES = {
  IDLE: 'idle',
  EXTRACTING: 'extracting',
  PURIFYING: 'purifying',
  COMPRESSING: 'compressing',
  CRYSTALLIZING: 'crystallizing',
  TRANSFERRING: 'transferring'
};

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const KNOWLEDGE_TYPES = {
  FACTUAL: 'factual',
  PROCEDURAL: 'procedural',
  CONCEPTUAL: 'conceptual',
  RELATIONAL: 'relational',
  INTUITIVE: 'intuitive',
  META: 'meta'
};

// ═══════════════════════════════════════════════════════════════════════════════
// WISDOM DISTILLERY PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class WisdomDistilleryProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  /**
   * Calculate compression ratio for given level
   */
  getCompressionRatio(level) {
    const ratios = {
      lossless: DISTILLERY_CONFIG.LOSSLESS_RATIO,
      mild: DISTILLERY_CONFIG.MILD_RATIO,
      moderate: DISTILLERY_CONFIG.MODERATE_RATIO,
      aggressive: DISTILLERY_CONFIG.AGGRESSIVE_RATIO,
      essence: DISTILLERY_CONFIG.ESSENCE_RATIO
    };
    return ratios[level] || DISTILLERY_CONFIG.MILD_RATIO;
  }

  /**
   * Calculate expected purity after purification
   */
  calculatePurifiedPurity(initialPurity) {
    return Math.min(1.0, initialPurity * PHI_INVERSE + 0.4);
  }

  /**
   * Calculate knowledge importance by type
   */
  getKnowledgeImportance(type) {
    const importanceMap = {
      [KNOWLEDGE_TYPES.FACTUAL]: 0.6,
      [KNOWLEDGE_TYPES.PROCEDURAL]: 0.8,
      [KNOWLEDGE_TYPES.CONCEPTUAL]: 0.9,
      [KNOWLEDGE_TYPES.RELATIONAL]: 0.85,
      [KNOWLEDGE_TYPES.INTUITIVE]: PHI_INVERSE,
      [KNOWLEDGE_TYPES.META]: 1.0
    };
    return importanceMap[type] || 0.5;
  }

  /**
   * Calculate transfer efficiency
   */
  calculateTransferEfficiency(crystalPurity, targetCapacity) {
    return Math.min(1.0, crystalPurity * PHI_INVERSE + 0.3) * targetCapacity;
  }

  /**
   * Get protocol metadata
   */
  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      config: DISTILLERY_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES),
      states: Object.keys(DISTILLERY_STATES),
      knowledgeTypes: Object.keys(KNOWLEDGE_TYPES),
      phi: this.phi
    };
  }
}

export default WisdomDistilleryProtocol;
