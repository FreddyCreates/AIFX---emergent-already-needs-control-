/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🧪 WISDOM DISTILLERY — Knowledge Extraction & Compression System 🧪                  ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * The Wisdom Distillery extracts, purifies, and compresses knowledge from
 * large models into smaller, more efficient representations.
 * 
 * DISTILLERY PRINCIPLES:
 *   - Extract essence from complex models
 *   - Compress without losing critical insights
 *   - Transfer knowledge across model architectures
 *   - Preserve reasoning chains and decision patterns
 * 
 * @module sdk/ai-kingdom/wisdom-distillery
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// DISTILLERY STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const DISTILLERY_STATES = {
  IDLE: 'idle',                   // Not processing
  EXTRACTING: 'extracting',       // Pulling knowledge from source
  PURIFYING: 'purifying',         // Removing noise and redundancy
  COMPRESSING: 'compressing',     // Reducing to essential form
  CRYSTALLIZING: 'crystallizing', // Forming final knowledge crystals
  TRANSFERRING: 'transferring'    // Moving to target model
};

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const KNOWLEDGE_TYPES = {
  FACTUAL: 'factual',             // Pure facts and data
  PROCEDURAL: 'procedural',       // How-to knowledge
  CONCEPTUAL: 'conceptual',       // Abstract understanding
  RELATIONAL: 'relational',       // Connections between concepts
  INTUITIVE: 'intuitive',         // Pattern-based insights
  META: 'meta'                    // Knowledge about knowledge
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPRESSION LEVELS
// ═══════════════════════════════════════════════════════════════════════════════
export const COMPRESSION_LEVELS = {
  LOSSLESS: { ratio: 1.0, name: 'lossless' },
  MILD: { ratio: PHI_INVERSE, name: 'mild' },           // ~62% retention
  MODERATE: { ratio: PHI_INVERSE ** 2, name: 'moderate' }, // ~38% retention
  AGGRESSIVE: { ratio: PHI_INVERSE ** 3, name: 'aggressive' }, // ~24% retention
  ESSENCE: { ratio: PHI_INVERSE ** 4, name: 'essence' }  // ~15% - core only
};

// ═══════════════════════════════════════════════════════════════════════════════
// WISDOM DISTILLERY CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class WisdomDistillery {
  constructor(distilleryId, config = {}) {
    this.distilleryId = distilleryId;
    this.state = DISTILLERY_STATES.IDLE;
    this.sourceModels = new Map();
    this.targetModels = new Map();
    this.knowledgeCrystals = new Map();
    this.compressionLevel = config.compressionLevel || COMPRESSION_LEVELS.MILD;
    this.purityThreshold = config.purityThreshold || 0.95;
    this.metrics = {
      totalExtractions: 0,
      totalTransfers: 0,
      averageCompression: 0,
      knowledgePreserved: 0
    };
    this.createdAt = Date.now();
  }

  /**
   * Register a source model for knowledge extraction
   */
  registerSource(modelId, modelConfig) {
    const source = {
      id: modelId,
      config: modelConfig,
      parameters: modelConfig.parameters || 0,
      architecture: modelConfig.architecture || 'unknown',
      knowledgeMap: new Map(),
      registeredAt: Date.now()
    };
    this.sourceModels.set(modelId, source);
    return { registered: true, modelId, type: 'source' };
  }

  /**
   * Register a target model for knowledge transfer
   */
  registerTarget(modelId, modelConfig) {
    const target = {
      id: modelId,
      config: modelConfig,
      parameters: modelConfig.parameters || 0,
      architecture: modelConfig.architecture || 'unknown',
      capacity: modelConfig.capacity || 1.0,
      receivedKnowledge: new Map(),
      registeredAt: Date.now()
    };
    this.targetModels.set(modelId, target);
    return { registered: true, modelId, type: 'target' };
  }

  /**
   * Extract knowledge from a source model
   */
  async extract(sourceId, options = {}) {
    const source = this.sourceModels.get(sourceId);
    if (!source) throw new Error(`Source model ${sourceId} not found`);

    this.state = DISTILLERY_STATES.EXTRACTING;
    
    const knowledgeTypes = options.types || Object.keys(KNOWLEDGE_TYPES);
    const extracted = {
      sourceId,
      extractedAt: Date.now(),
      knowledge: new Map()
    };

    // Simulate knowledge extraction with φ-weighted importance
    for (const type of knowledgeTypes) {
      const importance = this._calculateImportance(type);
      const volume = Math.floor(source.parameters * importance * PHI_INVERSE);
      
      extracted.knowledge.set(type, {
        type,
        volume,
        importance,
        purity: Math.random() * 0.3 + 0.7, // 70-100% purity
        extractedFrom: sourceId
      });
    }

    source.knowledgeMap = extracted.knowledge;
    this.metrics.totalExtractions++;
    
    return extracted;
  }

  /**
   * Purify extracted knowledge by removing noise
   */
  async purify(sourceId) {
    const source = this.sourceModels.get(sourceId);
    if (!source) throw new Error(`Source model ${sourceId} not found`);
    if (!source.knowledgeMap.size) throw new Error('No knowledge to purify');

    this.state = DISTILLERY_STATES.PURIFYING;

    const purified = new Map();
    
    for (const [type, knowledge] of source.knowledgeMap) {
      // Apply φ-enhanced purification
      const newPurity = Math.min(1.0, knowledge.purity * PHI_INVERSE + 0.4);
      
      if (newPurity >= this.purityThreshold) {
        purified.set(type, {
          ...knowledge,
          purity: newPurity,
          purifiedAt: Date.now()
        });
      }
    }

    return {
      sourceId,
      originalCount: source.knowledgeMap.size,
      purifiedCount: purified.size,
      averagePurity: this._calculateAveragePurity(purified)
    };
  }

  /**
   * Compress knowledge to target compression level
   */
  async compress(sourceId, level = null) {
    const source = this.sourceModels.get(sourceId);
    if (!source) throw new Error(`Source model ${sourceId} not found`);

    this.state = DISTILLERY_STATES.COMPRESSING;
    
    const compressionLevel = level || this.compressionLevel;
    const crystals = new Map();

    for (const [type, knowledge] of source.knowledgeMap) {
      const compressedVolume = Math.floor(knowledge.volume * compressionLevel.ratio);
      const crystal = {
        id: `crystal-${sourceId}-${type}-${Date.now()}`,
        type,
        originalVolume: knowledge.volume,
        compressedVolume,
        compressionRatio: compressionLevel.ratio,
        purity: knowledge.purity,
        density: knowledge.importance / compressionLevel.ratio,
        createdAt: Date.now()
      };
      
      crystals.set(crystal.id, crystal);
      this.knowledgeCrystals.set(crystal.id, crystal);
    }

    this.state = DISTILLERY_STATES.CRYSTALLIZING;
    
    return {
      sourceId,
      compressionLevel: compressionLevel.name,
      crystalsCreated: crystals.size,
      totalCompressedVolume: Array.from(crystals.values())
        .reduce((sum, c) => sum + c.compressedVolume, 0)
    };
  }

  /**
   * Transfer knowledge crystals to a target model
   */
  async transfer(crystalIds, targetId) {
    const target = this.targetModels.get(targetId);
    if (!target) throw new Error(`Target model ${targetId} not found`);

    this.state = DISTILLERY_STATES.TRANSFERRING;

    const transferred = [];
    let totalVolume = 0;

    for (const crystalId of crystalIds) {
      const crystal = this.knowledgeCrystals.get(crystalId);
      if (!crystal) continue;

      // Check capacity
      const currentLoad = this._calculateTargetLoad(target);
      if (currentLoad + crystal.compressedVolume > target.capacity * target.parameters) {
        continue; // Skip if would exceed capacity
      }

      // Transfer with φ-scaled efficiency
      const transferEfficiency = Math.min(1.0, crystal.purity * PHI_INVERSE + 0.3);
      const effectiveVolume = Math.floor(crystal.compressedVolume * transferEfficiency);

      target.receivedKnowledge.set(crystalId, {
        crystal,
        effectiveVolume,
        transferredAt: Date.now(),
        efficiency: transferEfficiency
      });

      transferred.push({
        crystalId,
        effectiveVolume,
        efficiency: transferEfficiency
      });

      totalVolume += effectiveVolume;
    }

    this.metrics.totalTransfers += transferred.length;
    this.state = DISTILLERY_STATES.IDLE;

    return {
      targetId,
      transferred: transferred.length,
      totalVolume,
      averageEfficiency: transferred.length > 0 
        ? transferred.reduce((sum, t) => sum + t.efficiency, 0) / transferred.length 
        : 0
    };
  }

  /**
   * Run full distillation pipeline
   */
  async distill(sourceId, targetId, options = {}) {
    // Extract
    await this.extract(sourceId, options);
    
    // Purify
    await this.purify(sourceId);
    
    // Compress
    const compression = await this.compress(sourceId, options.compressionLevel);
    
    // Transfer
    const crystalIds = Array.from(this.knowledgeCrystals.keys())
      .filter(id => id.includes(sourceId));
    
    const transfer = await this.transfer(crystalIds, targetId);

    return {
      sourceId,
      targetId,
      compression,
      transfer,
      completedAt: Date.now()
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  _calculateImportance(knowledgeType) {
    const importanceMap = {
      [KNOWLEDGE_TYPES.FACTUAL]: 0.6,
      [KNOWLEDGE_TYPES.PROCEDURAL]: 0.8,
      [KNOWLEDGE_TYPES.CONCEPTUAL]: 0.9,
      [KNOWLEDGE_TYPES.RELATIONAL]: 0.85,
      [KNOWLEDGE_TYPES.INTUITIVE]: PHI_INVERSE,
      [KNOWLEDGE_TYPES.META]: 1.0
    };
    return importanceMap[knowledgeType] || 0.5;
  }

  _calculateAveragePurity(knowledgeMap) {
    if (!knowledgeMap.size) return 0;
    const total = Array.from(knowledgeMap.values())
      .reduce((sum, k) => sum + k.purity, 0);
    return total / knowledgeMap.size;
  }

  _calculateTargetLoad(target) {
    return Array.from(target.receivedKnowledge.values())
      .reduce((sum, k) => sum + k.effectiveVolume, 0);
  }

  /**
   * Get distillery status
   */
  getStatus() {
    return {
      distilleryId: this.distilleryId,
      state: this.state,
      sources: this.sourceModels.size,
      targets: this.targetModels.size,
      crystals: this.knowledgeCrystals.size,
      compressionLevel: this.compressionLevel.name,
      metrics: this.metrics
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISTILLERY NETWORK - Coordinated multi-distillery operations
// ═══════════════════════════════════════════════════════════════════════════════
export class DistilleryNetwork {
  constructor(networkId) {
    this.networkId = networkId;
    this.distilleries = new Map();
    this.sharedCrystals = new Map();
    this.createdAt = Date.now();
  }

  addDistillery(distilleryId, config = {}) {
    const distillery = new WisdomDistillery(distilleryId, config);
    this.distilleries.set(distilleryId, distillery);
    return distillery;
  }

  async crossDistill(sourceDistilleryId, targetDistilleryId, crystalIds) {
    const source = this.distilleries.get(sourceDistilleryId);
    const target = this.distilleries.get(targetDistilleryId);
    
    if (!source || !target) throw new Error('Distillery not found');

    // Share crystals across network
    for (const crystalId of crystalIds) {
      const crystal = source.knowledgeCrystals.get(crystalId);
      if (crystal) {
        this.sharedCrystals.set(crystalId, crystal);
        target.knowledgeCrystals.set(crystalId, crystal);
      }
    }

    return {
      shared: crystalIds.length,
      from: sourceDistilleryId,
      to: targetDistilleryId
    };
  }

  getNetworkStatus() {
    return {
      networkId: this.networkId,
      distilleries: this.distilleries.size,
      sharedCrystals: this.sharedCrystals.size,
      uptime: Date.now() - this.createdAt
    };
  }
}

export default WisdomDistillery;
