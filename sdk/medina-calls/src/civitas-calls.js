/**
 * @medina/medina-calls - Civitas Calls
 * 
 * Write operations for AI civilization mutations.
 * These calls modify the state of Civitas organisms.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════
// CIVITAS LIFECYCLE CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bootstrap a new Civitas civilization
 */
export async function callBootstrapCivitas(meridian, civitasId, options = {}) {
  return {
    type: 'BOOTSTRAP_CIVITAS',
    meridian,
    civitasId,
    timestamp: Date.now(),
    config: {
      heartbeat: options.heartbeat || 873,
      agents: options.agents || ['ANIMUS', 'CORPUS', 'SENSUS', 'MEMORIA'],
      phiWeighted: true,
      autoAwaken: options.autoAwaken !== false,
    },
  };
}

/**
 * Awaken a sleeping Civitas
 */
export async function callAwakenCivitas(civitasId) {
  return {
    type: 'AWAKEN_CIVITAS',
    civitasId,
    timestamp: Date.now(),
    action: 'START_ALL_AGENT_LOOPS',
  };
}

/**
 * Put Civitas into dormant state
 */
export async function callDormantCivitas(civitasId, reason) {
  return {
    type: 'DORMANT_CIVITAS',
    civitasId,
    timestamp: Date.now(),
    reason,
    action: 'STOP_ALL_AGENT_LOOPS',
    preserveMemory: true,
  };
}

/**
 * Terminate a Civitas completely
 */
export async function callTerminateCivitas(civitasId, reason) {
  return {
    type: 'TERMINATE_CIVITAS',
    civitasId,
    timestamp: Date.now(),
    reason,
    action: 'FULL_SHUTDOWN',
    preserveMemory: false,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT MUTATION CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update agent state
 */
export async function callUpdateAgentState(civitasId, agentName, newState) {
  return {
    type: 'UPDATE_AGENT_STATE',
    civitasId,
    agentName,
    timestamp: Date.now(),
    previousState: null, // Would be filled by runtime
    newState,
    phiDecay: PHI_INV,
  };
}

/**
 * Send stimulus to agent
 */
export async function callSendStimulus(civitasId, agentName, stimulus) {
  return {
    type: 'SEND_STIMULUS',
    civitasId,
    agentName,
    timestamp: Date.now(),
    stimulus: {
      ...stimulus,
      intensity: stimulus.intensity || 1.0,
      phiWeighted: (stimulus.intensity || 1.0) * PHI_INV,
    },
  };
}

/**
 * Trigger agent reflection
 */
export async function callTriggerReflection(civitasId, agentName, depth = 1) {
  return {
    type: 'TRIGGER_REFLECTION',
    civitasId,
    agentName,
    timestamp: Date.now(),
    depth,
    phiDepth: Math.pow(PHI, depth),
  };
}

/**
 * Set agent goal
 */
export async function callSetAgentGoal(civitasId, agentName, goal) {
  return {
    type: 'SET_AGENT_GOAL',
    civitasId,
    agentName,
    timestamp: Date.now(),
    goal: {
      id: goal.id || `goal-${Date.now()}`,
      description: goal.description,
      priority: goal.priority || 1.0,
      phiPriority: (goal.priority || 1.0) * PHI_INV,
      deadline: goal.deadline,
      subgoals: goal.subgoals || [],
    },
  };
}

/**
 * Complete agent goal
 */
export async function callCompleteGoal(civitasId, agentName, goalId, outcome) {
  return {
    type: 'COMPLETE_GOAL',
    civitasId,
    agentName,
    timestamp: Date.now(),
    goalId,
    outcome: {
      success: outcome.success,
      artifacts: outcome.artifacts || [],
      learnings: outcome.learnings || [],
      phiReward: outcome.success ? PHI : PHI_INV,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Store memory
 */
export async function callStoreMemory(civitasId, memory) {
  return {
    type: 'STORE_MEMORY',
    civitasId,
    timestamp: Date.now(),
    memory: {
      id: memory.id || `mem-${Date.now()}`,
      content: memory.content,
      type: memory.type || 'episodic',
      importance: memory.importance || 1.0,
      phiImportance: (memory.importance || 1.0) * PHI_INV,
      associations: memory.associations || [],
      decay: PHI_INV, // Phi-based decay rate
      encoding: 'phi-weighted',
    },
  };
}

/**
 * Consolidate memories (move to long-term)
 */
export async function callConsolidateMemories(civitasId, memoryIds) {
  return {
    type: 'CONSOLIDATE_MEMORIES',
    civitasId,
    timestamp: Date.now(),
    memoryIds,
    action: 'MOVE_TO_LONG_TERM',
    phiStrengthBoost: PHI,
  };
}

/**
 * Forget memory
 */
export async function callForgetMemory(civitasId, memoryId, reason) {
  return {
    type: 'FORGET_MEMORY',
    civitasId,
    timestamp: Date.now(),
    memoryId,
    reason,
    preserveAssociations: true,
  };
}

/**
 * Update memory importance
 */
export async function callUpdateMemoryImportance(civitasId, memoryId, newImportance) {
  return {
    type: 'UPDATE_MEMORY_IMPORTANCE',
    civitasId,
    timestamp: Date.now(),
    memoryId,
    newImportance,
    phiNewImportance: newImportance * PHI_INV,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTIFACT CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create artifact
 */
export async function callCreateArtifact(civitasId, artifact) {
  return {
    type: 'CREATE_ARTIFACT',
    civitasId,
    timestamp: Date.now(),
    artifact: {
      id: artifact.id || `artifact-${Date.now()}`,
      type: artifact.type, // 'document', 'code', 'image', 'analysis', 'synthesis'
      content: artifact.content,
      creator: artifact.creator,
      quality: artifact.quality || 1.0,
      phiQuality: (artifact.quality || 1.0) * PHI,
      lineage: artifact.lineage || [],
      metadata: artifact.metadata || {},
    },
  };
}

/**
 * Update artifact
 */
export async function callUpdateArtifact(civitasId, artifactId, updates) {
  return {
    type: 'UPDATE_ARTIFACT',
    civitasId,
    timestamp: Date.now(),
    artifactId,
    updates,
    versionIncrement: true,
  };
}

/**
 * Archive artifact
 */
export async function callArchiveArtifact(civitasId, artifactId, reason) {
  return {
    type: 'ARCHIVE_ARTIFACT',
    civitasId,
    timestamp: Date.now(),
    artifactId,
    reason,
    preserveLineage: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RESONANCE CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bind synapse between agents
 */
export async function callBindSynapse(civitasId, fromAgent, toAgent, bindingType) {
  return {
    type: 'BIND_SYNAPSE',
    civitasId,
    timestamp: Date.now(),
    fromAgent,
    toAgent,
    bindingType, // 'excitatory', 'inhibitory', 'modulatory'
    strength: PHI_INV,
    permanent: false,
  };
}

/**
 * Strengthen synapse
 */
export async function callStrengthenSynapse(civitasId, fromAgent, toAgent, amount) {
  return {
    type: 'STRENGTHEN_SYNAPSE',
    civitasId,
    timestamp: Date.now(),
    fromAgent,
    toAgent,
    amount,
    phiAmount: amount * PHI,
    hebbianRule: true,
  };
}

/**
 * Trigger cross-organism resonance
 */
export async function callTriggerResonance(civitasId, targetCivitasId, signal) {
  return {
    type: 'TRIGGER_RESONANCE',
    civitasId,
    timestamp: Date.now(),
    targetCivitasId,
    signal: {
      ...signal,
      phiEncoded: true,
      resonanceFrequency: PHI * 1000, // Hz
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply reward signal
 */
export async function callApplyReward(civitasId, agentName, reward) {
  return {
    type: 'APPLY_REWARD',
    civitasId,
    timestamp: Date.now(),
    agentName,
    reward: {
      value: reward.value,
      phiValue: reward.value * PHI_INV,
      source: reward.source,
      decay: PHI_INV,
    },
  };
}

/**
 * Apply punishment signal
 */
export async function callApplyPunishment(civitasId, agentName, punishment) {
  return {
    type: 'APPLY_PUNISHMENT',
    civitasId,
    timestamp: Date.now(),
    agentName,
    punishment: {
      value: -Math.abs(punishment.value),
      phiValue: -Math.abs(punishment.value) * PHI_INV,
      source: punishment.source,
      recovery: PHI,
    },
  };
}

/**
 * Update learning rate
 */
export async function callUpdateLearningRate(civitasId, agentName, newRate) {
  return {
    type: 'UPDATE_LEARNING_RATE',
    civitasId,
    timestamp: Date.now(),
    agentName,
    newRate,
    phiRate: newRate * PHI_INV,
    adaptiveDecay: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Lifecycle
  callBootstrapCivitas,
  callAwakenCivitas,
  callDormantCivitas,
  callTerminateCivitas,
  // Agent
  callUpdateAgentState,
  callSendStimulus,
  callTriggerReflection,
  callSetAgentGoal,
  callCompleteGoal,
  // Memory
  callStoreMemory,
  callConsolidateMemories,
  callForgetMemory,
  callUpdateMemoryImportance,
  // Artifact
  callCreateArtifact,
  callUpdateArtifact,
  callArchiveArtifact,
  // Resonance
  callBindSynapse,
  callStrengthenSynapse,
  callTriggerResonance,
  // Learning
  callApplyReward,
  callApplyPunishment,
  callUpdateLearningRate,
};
