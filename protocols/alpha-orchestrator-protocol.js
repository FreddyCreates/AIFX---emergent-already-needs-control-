/**
 * PROTO-255: Alpha Orchestrator Protocol (AOP)
 * Master workflow coordination, multi-agent sequencing, and resource allocation.
 *
 * The Alpha Orchestrator Protocol defines formal rules for:
 * - Defining and executing multi-step workflows across AI agents
 * - Resource allocation using φ-weighted load distribution
 * - Failure recovery with exponential φ-backoff
 * - Hierarchical orchestrator delegation
 * - Topology-aware agent routing
 *
 * φ-enhanced: Golden ratio governs priority, backoff, partitioning, and resonance.
 *
 * @module protocols/alpha-orchestrator-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-255';
const PROTOCOL_NAME = 'Alpha Orchestrator Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const ORCHESTRATOR_CONFIG = {
  // Timing
  HEARTBEAT_MS: 873,
  PHI_BACKOFF_BASE: 873,
  MAX_BACKOFF_MS: 873 * Math.pow(PHI, 5), // ~9,700ms
  
  // Capacity
  MAX_CONCURRENT_WORKFLOWS: Math.round(8 * PHI), // 13
  MAX_AGENTS_PER_ORCHESTRATOR: Math.round(21 * PHI), // 34
  MAX_STEPS_PER_WORKFLOW: Math.round(34 * PHI), // 55
  
  // Health
  HEALTH_CHECK_INTERVAL: 873,
  AGENT_HEALTH_THRESHOLD: PHI_INVERSE,
  LOAD_SATURATION_THRESHOLD: PHI_INVERSE,
  
  // Recovery
  MAX_RETRIES: 5,
  RETRY_BACKOFF_MULTIPLIER: PHI,
  CIRCUIT_BREAKER_THRESHOLD: 3,
  CIRCUIT_BREAKER_RESET_MS: 873 * Math.round(PHI * 10)
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  // Lifecycle
  ORCHESTRATOR_START: 'orchestrator_start',
  ORCHESTRATOR_STOP: 'orchestrator_stop',
  ORCHESTRATOR_SUSPEND: 'orchestrator_suspend',
  ORCHESTRATOR_RESUME: 'orchestrator_resume',
  
  // Agent management
  AGENT_REGISTER: 'agent_register',
  AGENT_DEREGISTER: 'agent_deregister',
  AGENT_HEALTH_CHECK: 'agent_health_check',
  AGENT_HEALTH_REPORT: 'agent_health_report',
  
  // Workflow execution
  WORKFLOW_DEFINE: 'workflow_define',
  WORKFLOW_START: 'workflow_start',
  WORKFLOW_COMPLETE: 'workflow_complete',
  WORKFLOW_FAIL: 'workflow_fail',
  WORKFLOW_CANCEL: 'workflow_cancel',
  
  // Step execution
  STEP_START: 'step_start',
  STEP_COMPLETE: 'step_complete',
  STEP_FAIL: 'step_fail',
  STEP_RETRY: 'step_retry',
  
  // Delegation
  DELEGATE_WORKFLOW: 'delegate_workflow',
  DELEGATION_ACCEPT: 'delegation_accept',
  DELEGATION_REJECT: 'delegation_reject',
  
  // Resource allocation
  RESOURCE_REQUEST: 'resource_request',
  RESOURCE_ALLOCATE: 'resource_allocate',
  RESOURCE_RELEASE: 'resource_release'
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const ORCHESTRATOR_STATES = {
  INITIALIZING: 'initializing',
  IDLE: 'idle',
  ORCHESTRATING: 'orchestrating',
  RECOVERING: 'recovering',
  SCALING: 'scaling',
  SUSPENDED: 'suspended',
  TERMINATED: 'terminated'
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTION MODES
// ═══════════════════════════════════════════════════════════════════════════════

export const EXECUTION_MODES = {
  SEQUENTIAL: 'sequential',
  PARALLEL: 'parallel',
  PHI_STAGGERED: 'phi_staggered',
  CONDITIONAL: 'conditional',
  RACE: 'race'
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const ORCHESTRATOR_TYPES = {
  SOVEREIGN: 'sovereign',
  DOMAIN: 'domain',
  TACTICAL: 'tactical',
  EMERGENT: 'emergent'
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHI UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate orchestration priority based on urgency, complexity, and agent count.
 * Higher value = higher priority.
 */
export function calculateOrchestrationPriority(urgency, complexity, agentCount) {
  return (urgency * PHI * PHI + complexity * PHI + agentCount) / (PHI * PHI * PHI);
}

/**
 * Calculate φ-exponential backoff delay for retries.
 */
export function calculatePhiBackoff(attempt, baseDelay = ORCHESTRATOR_CONFIG.PHI_BACKOFF_BASE) {
  return Math.min(
    Math.round(baseDelay * Math.pow(PHI, attempt)),
    ORCHESTRATOR_CONFIG.MAX_BACKOFF_MS
  );
}

/**
 * Calculate golden-ratio load partitioning across workers.
 */
export function calculateLoadPartition(totalWork, workerCount) {
  const partitions = [];
  let remaining = totalWork;
  for (let i = 0; i < workerCount; i++) {
    const share = remaining * PHI_INVERSE;
    partitions.push(Math.round(share));
    remaining -= share;
  }
  return partitions;
}

/**
 * Calculate workflow health based on step completion and failures.
 */
export function calculateWorkflowHealth(completedSteps, totalSteps, failedSteps) {
  const completionRatio = completedSteps / Math.max(1, totalSteps);
  const failureRatio = failedSteps / Math.max(1, totalSteps);
  return completionRatio * PHI_INVERSE + (1 - failureRatio) * PHI_INVERSE;
}

/**
 * Calculate agent allocation score for resource matching.
 */
export function calculateAllocationScore(agentHealth, agentLoad, capabilityMatch) {
  return (agentHealth * PHI + (1 - agentLoad) * PHI + capabilityMatch * PHI * PHI) / (PHI * PHI * PHI);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaOrchestratorProtocol {
  static get PROTOCOL_ID() { return PROTOCOL_ID; }
  static get PROTOCOL_NAME() { return PROTOCOL_NAME; }
  static get VERSION() { return '1.0.0'; }

  static validate(message) {
    if (!message || !message.type) return { valid: false, error: 'Missing message type' };
    if (!Object.values(MESSAGE_TYPES).includes(message.type)) {
      return { valid: false, error: `Unknown message type: ${message.type}` };
    }
    if (!message.orchestratorId) return { valid: false, error: 'Missing orchestratorId' };
    if (!message.timestamp) return { valid: false, error: 'Missing timestamp' };
    return { valid: true };
  }

  static createMessage(type, orchestratorId, payload = {}) {
    return {
      protocol: PROTOCOL_ID,
      type,
      orchestratorId,
      payload,
      timestamp: Date.now(),
      phi: PHI
    };
  }

  static getCapabilities() {
    return {
      protocolId: PROTOCOL_ID,
      name: PROTOCOL_NAME,
      version: '1.0.0',
      messageTypes: Object.values(MESSAGE_TYPES),
      executionModes: Object.values(EXECUTION_MODES),
      orchestratorTypes: Object.values(ORCHESTRATOR_TYPES),
      maxConcurrentWorkflows: ORCHESTRATOR_CONFIG.MAX_CONCURRENT_WORKFLOWS,
      maxAgents: ORCHESTRATOR_CONFIG.MAX_AGENTS_PER_ORCHESTRATOR,
      phiEnhanced: true
    };
  }
}

export default AlphaOrchestratorProtocol;
