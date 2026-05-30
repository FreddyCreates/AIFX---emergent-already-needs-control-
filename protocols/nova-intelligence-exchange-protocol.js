/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-251: NOVA Intelligence Exchange Protocol                           ║
 * ║  Pactum Intelligentiae — Julia-Motoko Contracted Compute Exchange         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Governs how AI models propose, negotiate, execute, verify, and store
 * computational work across language boundaries (Julia ↔ JS/WASM ↔ Motoko).
 *
 * LAYERS:
 *   L0 Forma Prima — primitive shapes
 *   L1 Sigillum — canonical hashes
 *   L2 Pactum — intelligence contracts
 *   L3 LinguaCheck — language verification
 *   L4 Consilium — cross-model review
 *   L5 Executio — execution + receipt
 *   L6 Memoria — sovereign memory
 *   L7 Discentia — learning/correction
 *
 * @module protocols/nova-intelligence-exchange-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ─── Protocol States ─────────────────────────────────────────────────────────
export const NIE_PROTOCOL_STATES = {
  IDLE: 'idle',
  PROPOSING: 'proposing',
  NEGOTIATING: 'negotiating',
  INSPECTING: 'inspecting',
  EXECUTING: 'executing',
  VERIFYING: 'verifying',
  STORING: 'storing',
  LEARNING: 'learning',
  DISPUTING: 'disputing',
  ERROR: 'error',
};

// ─── Contract Types ──────────────────────────────────────────────────────────
export const NIE_CONTRACT_TYPES = {
  INTELLIGENCE: 'NOVA_INTELLIGENCE_CONTRACT',
  COMPUTE: 'NOVA_COMPUTE_CONTRACT',
  VERIFICATION: 'NOVA_VERIFICATION_CONTRACT',
  STORAGE: 'NOVA_STORAGE_CONTRACT',
};

// ─── Agent Roster ────────────────────────────────────────────────────────────
export const NIE_AGENT_ROSTER = {
  JULIA_INSPECTOR: 'julia_inspector',
  MOTOKO_SOVEREIGN: 'motoko_sovereign',
  CANDID_TREATY: 'candid_treaty',
  JS_BRIDGE: 'js_bridge',
  PRIMITIVE_SHAPE: 'primitive_shape',
  PROOF_AGENT: 'proof_agent',
  CRITIC_DISPUTE: 'critic_dispute',
  SOVEREIGN_ACCEPTANCE: 'sovereign_acceptance',
};

// ─── Layer Definitions ───────────────────────────────────────────────────────
export const NIE_LAYERS = {
  L0: { id: 'forma_prima', name: 'Forma Prima', purpose: 'Primitive shape capture' },
  L1: { id: 'sigillum', name: 'Sigillum', purpose: 'Canonical hash sealing' },
  L2: { id: 'pactum', name: 'Pactum', purpose: 'Intelligence contract negotiation' },
  L3: { id: 'lingua_check', name: 'LinguaCheck', purpose: 'Cross-language verification' },
  L4: { id: 'consilium', name: 'Consilium', purpose: 'Cross-model review council' },
  L5: { id: 'executio', name: 'Executio', purpose: 'Execution and receipt generation' },
  L6: { id: 'memoria', name: 'Memoria Sovereigna', purpose: 'Motoko sovereign storage' },
  L7: { id: 'discentia', name: 'Discentia', purpose: 'Learning and correction' },
};

// ─── Configuration ───────────────────────────────────────────────────────────
export const NIE_CONFIG = {
  maxConcurrentContracts: 50,
  contractTimeout: 30000,
  heartbeatInterval: HEARTBEAT,
  phiSealRequired: true,
  minimumAgentConsensus: 5,
  maxDisputeRetries: 3,
  learningEnabled: true,
  memoryRetention: 100000,
  supportedLanguages: ['Julia', 'Motoko', 'JavaScript', 'Candid', 'Python', 'Rust'],
};

// ─── Message Types ───────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  CONTRACT_PROPOSE: 'nie.contract.propose',
  CONTRACT_ACCEPT: 'nie.contract.accept',
  CONTRACT_REJECT: 'nie.contract.reject',
  CONTRACT_EXECUTE: 'nie.contract.execute',
  CONTRACT_VERIFY: 'nie.contract.verify',
  CONTRACT_STORE: 'nie.contract.store',
  CONTRACT_DISPUTE: 'nie.contract.dispute',
  LINGUA_CHECK: 'nie.lingua.check',
  LINGUA_RESULT: 'nie.lingua.result',
  AGENT_INSPECT: 'nie.agent.inspect',
  AGENT_REPORT: 'nie.agent.report',
  RECEIPT_SEAL: 'nie.receipt.seal',
  MEMORY_LEARN: 'nie.memory.learn',
  MEMORY_RECALL: 'nie.memory.recall',
  BRIDGE_STATUS: 'nie.bridge.status',
};

/**
 * Calculate contract priority (φ-weighted by risk and agent consensus)
 */
export function calculateContractPriority(riskLevel, agentConsensus, queueDepth) {
  const riskWeights = { low: 1.0, medium: PHI - 1, high: 1 / PHI, critical: 1 / (PHI * PHI) };
  const risk = riskWeights[riskLevel] || 1.0;
  const consensus = agentConsensus / NIE_CONFIG.minimumAgentConsensus;
  return risk * consensus * PHI / (queueDepth + 1);
}

/**
 * Calculate proof completeness score
 */
export function calculateProofScore(presentHashes, requiredHashes) {
  if (requiredHashes === 0) return 1.0;
  return (presentHashes / requiredHashes) * (PHI - 1) + (1 - (PHI - 1)) * 0.5;
}

/**
 * Calculate bridge learning confidence over time
 */
export function calculateLearningConfidence(executionCount, successRate, ageSinceLastMs) {
  const frequency = Math.log2(executionCount + 1);
  const recency = 1 / (ageSinceLastMs / (HEARTBEAT * 1000) + 1);
  return (frequency * successRate * recency) * (PHI - 1);
}

/**
 * Calculate lingua check confidence
 */
export function calculateLinguaConfidence(warningCount, agentsPassed, totalAgents) {
  const passRate = totalAgents > 0 ? agentsPassed / totalAgents : 0;
  const warningPenalty = warningCount * 0.05;
  return Math.max(0, (passRate * (PHI - 1)) - warningPenalty);
}

/**
 * NovaIntelligenceExchangeProtocol — Main protocol class
 */
export class NovaIntelligenceExchangeProtocol {
  constructor(config = {}) {
    this.config = { ...NIE_CONFIG, ...config };
    this.state = NIE_PROTOCOL_STATES.IDLE;
    this.stats = {
      proposed: 0, accepted: 0, executed: 0,
      verified: 0, stored: 0, disputed: 0,
      rejected: 0, learned: 0, errors: 0,
    };
  }

  getStatus() {
    return { state: this.state, stats: this.stats, config: this.config };
  }
}
