/**
 * PROTO-235: Quantum Entanglement Protocol (QEP)
 * Cross-AI state synchronization and coordination through entanglement.
 *
 * The Quantum Entanglement Protocol defines formal rules for:
 * - Establishing quantum-like entanglement between AI agents
 * - Instantaneous state synchronization across distances
 * - Collective decision-making through entangled voting
 * - Decoherence detection and automatic recovery
 * - Entanglement topology optimization
 *
 * φ-enhanced: Uses golden ratio for optimal entanglement strength decay and topology.
 *
 * @module protocols/quantum-entanglement-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-235';
const PROTOCOL_NAME = 'Quantum Entanglement Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// ENTANGLEMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const ENTANGLEMENT_CONFIG = {
  // Strength parameters
  INITIAL_STRENGTH: 1.0,
  MIN_STRENGTH_THRESHOLD: 0.3,
  DECAY_HALF_LIFE_MS: 60000 * PHI, // ~1.618 minutes
  
  // Network limits
  MAX_PEERS_BASE: 10,
  MAX_PEERS_MULTIPLIER: PHI, // 10 * 1.618 ≈ 16 peers max
  
  // Sync parameters
  SYNC_TIMEOUT_MS: 5000,
  HEARTBEAT_INTERVAL_MS: 10000,
  
  // Voting thresholds
  CONSENSUS_THRESHOLD: PHI_INVERSE, // ~61.8%
  SUPERMAJORITY_THRESHOLD: 0.75,
  
  // Quality metrics
  HIGH_COHERENCE: 0.9,
  MEDIUM_COHERENCE: 0.6,
  LOW_COHERENCE: 0.3
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  ENTANGLE_REQUEST: 'entangle_request',
  ENTANGLE_ACCEPT: 'entangle_accept',
  ENTANGLE_REJECT: 'entangle_reject',
  DISENTANGLE: 'disentangle',
  STATE_SYNC: 'state_sync',
  HEARTBEAT: 'heartbeat',
  VOTE_REQUEST: 'vote_request',
  VOTE_RESPONSE: 'vote_response',
  DECOHERENCE_ALERT: 'decoherence_alert',
  RECOVERY_INITIATE: 'recovery_initiate'
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENTANGLEMENT STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const ENTANGLEMENT_STATES = {
  ISOLATED: 'isolated',
  SEEKING: 'seeking',
  HANDSHAKING: 'handshaking',
  ENTANGLED: 'entangled',
  DECOHERENT: 'decoherent',
  SUPERPOSED: 'superposed'
};

// ═══════════════════════════════════════════════════════════════════════════════
// QUANTUM ENTANGLEMENT PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class QuantumEntanglementProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  /**
   * Calculate entanglement strength decay over time
   */
  calculateStrengthDecay(initialStrength, elapsedMs) {
    const halfLife = ENTANGLEMENT_CONFIG.DECAY_HALF_LIFE_MS;
    return initialStrength * Math.pow(0.5, elapsedMs / halfLife);
  }

  /**
   * Calculate optimal entanglement topology for N agents
   */
  calculateOptimalTopology(agentCount) {
    // φ-based topology: each agent connects to φ-scaled neighbors
    const connectionsPerAgent = Math.min(
      Math.floor(agentCount * PHI_INVERSE),
      Math.floor(ENTANGLEMENT_CONFIG.MAX_PEERS_BASE * ENTANGLEMENT_CONFIG.MAX_PEERS_MULTIPLIER)
    );

    return {
      agentCount,
      connectionsPerAgent,
      totalConnections: (agentCount * connectionsPerAgent) / 2,
      topology: connectionsPerAgent >= agentCount - 1 ? 'full_mesh' : 'partial_mesh',
      efficiency: connectionsPerAgent / agentCount
    };
  }

  /**
   * Calculate consensus from weighted votes
   */
  calculateConsensus(votes) {
    const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0);
    const yesWeight = votes.filter(v => v.vote === true).reduce((sum, v) => sum + v.weight, 0);
    
    const consensus = yesWeight / totalWeight;
    
    return {
      consensus,
      approved: consensus >= ENTANGLEMENT_CONFIG.CONSENSUS_THRESHOLD,
      supermajority: consensus >= ENTANGLEMENT_CONFIG.SUPERMAJORITY_THRESHOLD,
      totalVotes: votes.length,
      totalWeight,
      yesWeight
    };
  }

  /**
   * Determine coherence level from strength
   */
  getCoherenceLevel(strength) {
    if (strength >= ENTANGLEMENT_CONFIG.HIGH_COHERENCE) return 'high';
    if (strength >= ENTANGLEMENT_CONFIG.MEDIUM_COHERENCE) return 'medium';
    if (strength >= ENTANGLEMENT_CONFIG.LOW_COHERENCE) return 'low';
    return 'critical';
  }

  /**
   * Check if decoherence has occurred
   */
  checkDecoherence(strength) {
    return strength < ENTANGLEMENT_CONFIG.MIN_STRENGTH_THRESHOLD;
  }

  /**
   * Get protocol metadata
   */
  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      config: ENTANGLEMENT_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES),
      states: Object.keys(ENTANGLEMENT_STATES),
      phi: this.phi
    };
  }
}

export default QuantumEntanglementProtocol;
