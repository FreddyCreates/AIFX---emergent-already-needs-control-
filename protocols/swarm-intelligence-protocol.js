/**
 * PROTO-241: Swarm Intelligence Protocol (SIP)
 * Multi-agent coordination through emergent behavior.
 *
 * The Swarm Intelligence Protocol defines formal rules for:
 * - Agent spawning and lifecycle management
 * - Swarm behavior rules (separation, alignment, cohesion)
 * - Pheromone-based communication
 * - Resource collection and target tracking
 *
 * φ-enhanced: Uses golden ratio for force weighting and pheromone decay.
 *
 * @module protocols/swarm-intelligence-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-241';
const PROTOCOL_NAME = 'Swarm Intelligence Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// SWARM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const SWARM_CONFIG = {
  // Population limits
  MIN_AGENTS: 2,
  MAX_AGENTS: 1000,
  DEFAULT_POPULATION: 50,
  
  // Behavior parameters
  SEPARATION_DISTANCE: 2.0,
  NEIGHBOR_RADIUS: 5.0,
  MAX_SPEED: 1.0,
  
  // Force weights (φ-scaled)
  SEPARATION_WEIGHT: PHI_INVERSE,
  ALIGNMENT_WEIGHT: PHI_INVERSE ** 2,
  COHESION_WEIGHT: PHI_INVERSE ** 3,
  PHEROMONE_WEIGHT: PHI_INVERSE,
  
  // Pheromone parameters
  PHEROMONE_DECAY: PHI_INVERSE,
  PHEROMONE_RANGE: 10.0,
  MIN_PHEROMONE_STRENGTH: 0.01,
  
  // Energy
  INITIAL_ENERGY: 1.0,
  ENERGY_DECAY: PHI_INVERSE ** 0.01
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  SPAWN: 'spawn',
  DESPAWN: 'despawn',
  ITERATE: 'iterate',
  DEPOSIT_PHEROMONE: 'deposit_pheromone',
  BROADCAST: 'broadcast',
  COLLECT_RESOURCE: 'collect_resource',
  SET_TARGETS: 'set_targets',
  MIGRATE: 'migrate'
};

// ═══════════════════════════════════════════════════════════════════════════════
// SWARM STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const SWARM_STATES = {
  DORMANT: 'dormant',
  SCOUTING: 'scouting',
  FORAGING: 'foraging',
  BUILDING: 'building',
  DEFENDING: 'defending',
  MIGRATING: 'migrating',
  CONVERGING: 'converging'
};

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT ROLES
// ═══════════════════════════════════════════════════════════════════════════════

export const AGENT_ROLES = {
  SCOUT: 'scout',
  WORKER: 'worker',
  SOLDIER: 'soldier',
  QUEEN: 'queen',
  MESSENGER: 'messenger',
  SPECIALIST: 'specialist'
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const COMMUNICATION_TYPES = {
  PHEROMONE: 'pheromone',
  WAGGLE: 'waggle',
  ALERT: 'alert',
  RECRUIT: 'recruit',
  CELEBRATE: 'celebrate'
};

// ═══════════════════════════════════════════════════════════════════════════════
// SWARM INTELLIGENCE PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class SwarmIntelligenceProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  /**
   * Calculate φ-weighted swarm force
   */
  calculateSwarmForce(separation, alignment, cohesion, pheromone) {
    return {
      x: separation.x * SWARM_CONFIG.SEPARATION_WEIGHT +
         alignment.x * SWARM_CONFIG.ALIGNMENT_WEIGHT +
         cohesion.x * SWARM_CONFIG.COHESION_WEIGHT +
         pheromone.x * SWARM_CONFIG.PHEROMONE_WEIGHT,
      y: separation.y * SWARM_CONFIG.SEPARATION_WEIGHT +
         alignment.y * SWARM_CONFIG.ALIGNMENT_WEIGHT +
         cohesion.y * SWARM_CONFIG.COHESION_WEIGHT +
         pheromone.y * SWARM_CONFIG.PHEROMONE_WEIGHT,
      z: separation.z * SWARM_CONFIG.SEPARATION_WEIGHT +
         alignment.z * SWARM_CONFIG.ALIGNMENT_WEIGHT +
         cohesion.z * SWARM_CONFIG.COHESION_WEIGHT +
         pheromone.z * SWARM_CONFIG.PHEROMONE_WEIGHT
    };
  }

  /**
   * Decay pheromone strength
   */
  decayPheromone(currentStrength) {
    const decayed = currentStrength * SWARM_CONFIG.PHEROMONE_DECAY;
    return decayed > SWARM_CONFIG.MIN_PHEROMONE_STRENGTH ? decayed : 0;
  }

  /**
   * Calculate convergence metric
   */
  calculateConvergence(avgDistanceToCenter) {
    return 1 / (avgDistanceToCenter + 1);
  }

  /**
   * Determine swarm state based on activity
   */
  determineState(convergenceRate, carryingRatio) {
    if (convergenceRate > 0.5) return SWARM_STATES.CONVERGING;
    if (carryingRatio > 0.5) return SWARM_STATES.FORAGING;
    return SWARM_STATES.SCOUTING;
  }

  /**
   * Get protocol metadata
   */
  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      config: SWARM_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES),
      states: Object.keys(SWARM_STATES),
      agentRoles: Object.keys(AGENT_ROLES),
      communicationTypes: Object.keys(COMMUNICATION_TYPES),
      phi: this.phi
    };
  }
}

export default SwarmIntelligenceProtocol;
