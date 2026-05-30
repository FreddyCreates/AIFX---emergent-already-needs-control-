/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PROTO-254: Spider MoE AGI/AECI Protocol
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Protocol governing BLACKWXDOW (AGI) and JUMPER (AECI) MoE systems.
 * Defines coordination, routing, and personality-driven decision making.
 * 
 * φ = 1.618033988749895 (Golden Ratio) governs all calculations
 */

const φ = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const MOE_PROTOCOL_STATES = {
  DORMANT: 'dormant',
  ROUTING: 'routing',
  PROCESSING: 'processing',
  INTEGRATING: 'integrating',
  RESPONDING: 'responding',
  LEARNING: 'learning',
  EVOLVING: 'evolving',
  COLLABORATING: 'collaborating'
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENCE TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const INTELLIGENCE_TYPES = {
  AGI: {
    name: 'AGI',
    fullName: 'Artificial General Intelligence',
    entity: 'BLACKWXDOW',
    characteristics: ['general_reasoning', 'cross_domain_transfer', 'meta_learning']
  },
  AECI: {
    name: 'AECI',
    fullName: 'Artificial Emergent Cognitive Intelligence',
    entity: 'JUMPER',
    characteristics: ['emergence', 'self_organization', 'intuitive_cognition']
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const MESSAGE_TYPES = {
  ROUTE_REQUEST: 'moe:route_request',
  EXPERT_ACTIVATION: 'moe:expert_activation',
  INTEGRATION_SIGNAL: 'moe:integration_signal',
  PERSONALITY_INFLUENCE: 'moe:personality_influence',
  COLLABORATION_REQUEST: 'moe:collaboration_request',
  LEARNING_UPDATE: 'moe:learning_update',
  EMERGENCE_DETECTED: 'moe:emergence_detected',
  THREAT_ASSESSMENT: 'moe:threat_assessment',
  OPPORTUNITY_DETECTED: 'moe:opportunity_detected'
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
export const MOE_PROTOCOL_CONFIG = {
  version: '1.0.0',
  protocolId: 'PROTO-254',
  name: 'SpiderMoEProtocol',
  entities: ['BLACKWXDOW', 'JUMPER'],
  routingConfig: {
    defaultTopK: 2,
    maxTopK: 4,
    temperature: 1.0,
    noiseStd: 0.1 * φ,
    loadBalancingFactor: φ
  },
  personalityConfig: {
    influenceWeight: 0.3,
    traitThreshold: 0.7,
    emotionalDecay: 0.95
  },
  collaborationConfig: {
    syncInterval: 873 * φ,  // ms
    consensusThreshold: 0.8,
    conflictResolution: 'weighted_merge'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPIDER MOE PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class SpiderMoEProtocol {
  constructor(config = {}) {
    this.config = { ...MOE_PROTOCOL_CONFIG, ...config };
    this.state = MOE_PROTOCOL_STATES.DORMANT;
    this.activeEntities = new Map();
    this.routingHistory = [];
    this.collaborationLog = [];
  }

  // Register an entity (BLACKWXDOW or JUMPER)
  registerEntity(entity) {
    this.activeEntities.set(entity.name, {
      entity,
      type: entity.type,
      personality: entity.personality,
      registeredAt: Date.now()
    });
    return { success: true, entityName: entity.name };
  }

  // Route a task to appropriate entity/experts
  route(task, context = {}) {
    this.state = MOE_PROTOCOL_STATES.ROUTING;
    
    const taskType = this._analyzeTaskType(task);
    const selectedEntity = this._selectEntity(taskType, context);
    const routingDecision = {
      task,
      selectedEntity,
      reason: this._getRoutingReason(taskType, selectedEntity),
      confidence: this._calculateRoutingConfidence(taskType, selectedEntity),
      timestamp: Date.now()
    };
    
    this.routingHistory.push(routingDecision);
    return routingDecision;
  }

  // Facilitate collaboration between BLACKWXDOW and JUMPER
  collaborate(task) {
    this.state = MOE_PROTOCOL_STATES.COLLABORATING;
    
    const collaboration = {
      task,
      participants: Array.from(this.activeEntities.keys()),
      strategy: this._determineCollaborationStrategy(task),
      startedAt: Date.now()
    };
    
    this.collaborationLog.push(collaboration);
    return collaboration;
  }

  // Apply personality influence to a decision
  applyPersonalityInfluence(decision, entityName) {
    const entityData = this.activeEntities.get(entityName);
    if (!entityData) return decision;
    
    const personality = entityData.personality;
    const influence = this.config.personalityConfig.influenceWeight;
    
    return {
      ...decision,
      personalityModified: true,
      influencedBy: entityName,
      traits: personality.traits,
      philosophy: personality.philosophy
    };
  }

  // Internal: Analyze what type of task this is
  _analyzeTaskType(task) {
    const taskStr = JSON.stringify(task).toLowerCase();
    
    if (taskStr.includes('threat') || taskStr.includes('security') || taskStr.includes('analyze')) {
      return 'strategic';  // BLACKWXDOW territory
    }
    if (taskStr.includes('adapt') || taskStr.includes('create') || taskStr.includes('opportunity')) {
      return 'emergent';  // JUMPER territory
    }
    return 'collaborative';  // Both
  }

  // Internal: Select the best entity for a task type
  _selectEntity(taskType, context) {
    if (taskType === 'strategic') return 'BLACKWXDOW';
    if (taskType === 'emergent') return 'JUMPER';
    return context.preference || 'BLACKWXDOW';  // Default to strategic
  }

  // Internal: Get reason for routing decision
  _getRoutingReason(taskType, entity) {
    const reasons = {
      strategic: `${entity} selected for strategic analysis requiring patience and precision`,
      emergent: `${entity} selected for emergent cognition requiring adaptability and intuition`,
      collaborative: `${entity} selected as lead with collaboration from partner entity`
    };
    return reasons[taskType] || reasons.collaborative;
  }

  // Internal: Calculate confidence in routing decision
  _calculateRoutingConfidence(taskType, entity) {
    const baseConfidence = 0.8;
    const typeBonus = taskType === 'strategic' && entity === 'BLACKWXDOW' ? 0.15 :
                      taskType === 'emergent' && entity === 'JUMPER' ? 0.15 : 0.05;
    return Math.min((baseConfidence + typeBonus) * φ / φ, 1.0);
  }

  // Internal: Determine how entities should collaborate
  _determineCollaborationStrategy(task) {
    return {
      mode: 'parallel_then_merge',
      blackwxdowRole: 'strategic_analysis',
      jumperRole: 'emergent_insights',
      mergeStrategy: this.config.collaborationConfig.conflictResolution
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHI-ENHANCED UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateExpertActivation(scores, topK = 2) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const selected = sorted.slice(0, topK);
  const total = selected.reduce((sum, s) => sum + Math.exp(s.score), 0);
  return selected.map(s => ({ ...s, weight: Math.exp(s.score) / total }));
}

export function calculateEmergenceScore(synergies, novelty) {
  return synergies.length * novelty * φ / Math.max(synergies.length, 1);
}

export function calculateCollaborationScore(blackwxdowConfidence, jumperConfidence) {
  return (blackwxdowConfidence * 0.5 + jumperConfidence * 0.5) * φ;
}

export function calculatePersonalityWeight(trait, threshold = 0.7) {
  return trait >= threshold ? trait * φ : trait;
}

export default SpiderMoEProtocol;
