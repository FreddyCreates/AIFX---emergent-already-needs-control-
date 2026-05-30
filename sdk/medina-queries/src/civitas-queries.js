/**
 * @medina/medina-queries - Civitas Queries
 * 
 * Read operations for AI civilization state.
 * These queries do NOT modify state.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════
// CIVITAS STATUS QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query Civitas status
 */
export async function queryCivitasStatus(civitasId) {
  return {
    query: 'CIVITAS_STATUS',
    civitasId,
    timestamp: Date.now(),
    fields: ['lifecycle', 'heartbeat', 'agentCount', 'resonance', 'emergence'],
  };
}

/**
 * Query Civitas health metrics
 */
export async function queryCivitasHealth(civitasId) {
  return {
    query: 'CIVITAS_HEALTH',
    civitasId,
    timestamp: Date.now(),
    metrics: {
      vitality: true,
      coherence: true,
      entropy: true,
      phiBalance: true,
    },
  };
}

/**
 * Query all agent statuses
 */
export async function queryAllAgentStatuses(civitasId) {
  return {
    query: 'ALL_AGENT_STATUSES',
    civitasId,
    timestamp: Date.now(),
    includeTimers: true,
    includeState: true,
  };
}

/**
 * Query specific agent status
 */
export async function queryAgentStatus(civitasId, agentName) {
  return {
    query: 'AGENT_STATUS',
    civitasId,
    agentName,
    timestamp: Date.now(),
    includeTimers: true,
    includeState: true,
    includeGoals: true,
  };
}

/**
 * Query agent state registers
 */
export async function queryAgentRegisters(civitasId, agentName) {
  return {
    query: 'AGENT_REGISTERS',
    civitasId,
    agentName,
    timestamp: Date.now(),
    registers: ['cognitive', 'affective', 'somatic', 'sovereign'],
    dimensions: ['awareness', 'coherence', 'resonance', 'entropy'],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query memories
 */
export async function queryMemories(civitasId, filter = {}) {
  return {
    query: 'MEMORIES',
    civitasId,
    timestamp: Date.now(),
    filter: {
      type: filter.type, // 'episodic', 'semantic', 'procedural'
      minImportance: filter.minImportance || 0,
      maxAge: filter.maxAge,
      associations: filter.associations || [],
      limit: filter.limit || 100,
    },
    sort: filter.sort || { field: 'importance', order: 'desc' },
  };
}

/**
 * Query single memory
 */
export async function queryMemory(civitasId, memoryId) {
  return {
    query: 'MEMORY',
    civitasId,
    memoryId,
    timestamp: Date.now(),
    includeAssociations: true,
    includeLineage: true,
  };
}

/**
 * Query memory associations
 */
export async function queryMemoryAssociations(civitasId, memoryId, depth = 1) {
  return {
    query: 'MEMORY_ASSOCIATIONS',
    civitasId,
    memoryId,
    timestamp: Date.now(),
    depth,
    phiDepth: Math.pow(PHI, depth),
  };
}

/**
 * Query memory consolidation status
 */
export async function queryConsolidationStatus(civitasId) {
  return {
    query: 'CONSOLIDATION_STATUS',
    civitasId,
    timestamp: Date.now(),
    includeQueue: true,
    includeProgress: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GOAL QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query active goals
 */
export async function queryActiveGoals(civitasId, agentName = null) {
  return {
    query: 'ACTIVE_GOALS',
    civitasId,
    agentName,
    timestamp: Date.now(),
    filter: {
      status: 'active',
    },
    includeSubgoals: true,
    sort: { field: 'phiPriority', order: 'desc' },
  };
}

/**
 * Query goal progress
 */
export async function queryGoalProgress(civitasId, goalId) {
  return {
    query: 'GOAL_PROGRESS',
    civitasId,
    goalId,
    timestamp: Date.now(),
    includeSubgoals: true,
    includeMilestones: true,
    includeBlockers: true,
  };
}

/**
 * Query goal history
 */
export async function queryGoalHistory(civitasId, filter = {}) {
  return {
    query: 'GOAL_HISTORY',
    civitasId,
    timestamp: Date.now(),
    filter: {
      status: filter.status, // 'completed', 'failed', 'abandoned'
      agentName: filter.agentName,
      since: filter.since,
      limit: filter.limit || 100,
    },
    includeLearnings: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTIFACT QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query artifacts
 */
export async function queryArtifacts(civitasId, filter = {}) {
  return {
    query: 'ARTIFACTS',
    civitasId,
    timestamp: Date.now(),
    filter: {
      type: filter.type, // 'document', 'code', 'image', 'analysis', 'synthesis'
      creator: filter.creator,
      minQuality: filter.minQuality || 0,
      since: filter.since,
      limit: filter.limit || 100,
    },
    sort: filter.sort || { field: 'phiQuality', order: 'desc' },
  };
}

/**
 * Query single artifact
 */
export async function queryArtifact(civitasId, artifactId) {
  return {
    query: 'ARTIFACT',
    civitasId,
    artifactId,
    timestamp: Date.now(),
    includeContent: true,
    includeLineage: true,
    includeVersions: true,
  };
}

/**
 * Query artifact lineage
 */
export async function queryArtifactLineage(civitasId, artifactId, direction = 'both') {
  return {
    query: 'ARTIFACT_LINEAGE',
    civitasId,
    artifactId,
    timestamp: Date.now(),
    direction, // 'ancestors', 'descendants', 'both'
    maxDepth: 10,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RESONANCE QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query synapse connections
 */
export async function querySynapses(civitasId) {
  return {
    query: 'SYNAPSES',
    civitasId,
    timestamp: Date.now(),
    includeStrengths: true,
    includeTypes: true,
  };
}

/**
 * Query synapse between agents
 */
export async function querySynapseBetween(civitasId, fromAgent, toAgent) {
  return {
    query: 'SYNAPSE_BETWEEN',
    civitasId,
    fromAgent,
    toAgent,
    timestamp: Date.now(),
    includeHistory: true,
  };
}

/**
 * Query collective coherence
 */
export async function queryCollectiveCoherence(civitasId) {
  return {
    query: 'COLLECTIVE_COHERENCE',
    civitasId,
    timestamp: Date.now(),
    method: 'kuramoto',
    includePhaseDistribution: true,
    emergenceThreshold: PHI_INV,
  };
}

/**
 * Query emergence state
 */
export async function queryEmergenceState(civitasId) {
  return {
    query: 'EMERGENCE_STATE',
    civitasId,
    timestamp: Date.now(),
    metrics: {
      orderParameter: true,
      phaseSynchrony: true,
      cascadeHistory: true,
    },
    threshold: PHI_INV,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query learning metrics
 */
export async function queryLearningMetrics(civitasId, agentName = null) {
  return {
    query: 'LEARNING_METRICS',
    civitasId,
    agentName,
    timestamp: Date.now(),
    metrics: {
      learningRate: true,
      rewardHistory: true,
      errorTrend: true,
      hebbianStrength: true,
    },
  };
}

/**
 * Query reward history
 */
export async function queryRewardHistory(civitasId, agentName, timeRange = {}) {
  return {
    query: 'REWARD_HISTORY',
    civitasId,
    agentName,
    timestamp: Date.now(),
    timeRange: {
      since: timeRange.since,
      until: timeRange.until || Date.now(),
    },
    aggregation: timeRange.aggregation || 'none', // 'none', 'hourly', 'daily'
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Status
  queryCivitasStatus,
  queryCivitasHealth,
  queryAllAgentStatuses,
  queryAgentStatus,
  queryAgentRegisters,
  // Memory
  queryMemories,
  queryMemory,
  queryMemoryAssociations,
  queryConsolidationStatus,
  // Goals
  queryActiveGoals,
  queryGoalProgress,
  queryGoalHistory,
  // Artifacts
  queryArtifacts,
  queryArtifact,
  queryArtifactLineage,
  // Resonance
  querySynapses,
  querySynapseBetween,
  queryCollectiveCoherence,
  queryEmergenceState,
  // Learning
  queryLearningMetrics,
  queryRewardHistory,
};
