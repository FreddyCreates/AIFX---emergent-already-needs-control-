/**
 * PROTO-243: Evolution Chamber Protocol (ECP)
 * Genetic algorithm-based model evolution and optimization.
 *
 * The Evolution Chamber Protocol defines formal rules for:
 * - Population initialization and management
 * - Selection, crossover, and mutation operations
 * - Fitness evaluation and elitism
 * - Multi-chamber migration
 *
 * φ-enhanced: Uses golden ratio for crossover blending and adaptive mutation.
 *
 * @module protocols/evolution-chamber-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-243';
const PROTOCOL_NAME = 'Evolution Chamber Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const EVOLUTION_CONFIG = {
  // Population parameters
  MIN_POPULATION: 10,
  MAX_POPULATION: 10000,
  DEFAULT_POPULATION: 50,
  DEFAULT_GENE_COUNT: 100,
  
  // Selection parameters
  ELITE_COUNT: 2,
  TOURNAMENT_SIZE: 3,
  
  // Genetic operators
  DEFAULT_MUTATION_RATE: 0.1,
  DEFAULT_CROSSOVER_RATE: PHI_INVERSE,
  
  // Convergence
  STAGNATION_THRESHOLD: 10,
  DIVERSITY_THRESHOLD: 0.1,
  
  // Migration
  MIGRATION_RATE: 0.1,
  MIGRATION_INTERVAL: 5
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  INITIALIZE: 'initialize',
  EVALUATE: 'evaluate',
  SELECT: 'select',
  CROSSOVER: 'crossover',
  MUTATE: 'mutate',
  EVOLVE: 'evolve',
  MIGRATE: 'migrate',
  GET_BEST: 'get_best',
  RESET: 'reset'
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const EVOLUTION_STATES = {
  DORMANT: 'dormant',
  INITIALIZING: 'initializing',
  EVALUATING: 'evaluating',
  SELECTING: 'selecting',
  BREEDING: 'breeding',
  MUTATING: 'mutating',
  EVOLVING: 'evolving'
};

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION METHODS
// ═══════════════════════════════════════════════════════════════════════════════

export const SELECTION_METHODS = {
  ROULETTE: 'roulette',
  TOURNAMENT: 'tournament',
  RANK: 'rank',
  ELITISM: 'elitism',
  BOLTZMANN: 'boltzmann'
};

// ═══════════════════════════════════════════════════════════════════════════════
// CROSSOVER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const CROSSOVER_TYPES = {
  SINGLE_POINT: 'single_point',
  TWO_POINT: 'two_point',
  UNIFORM: 'uniform',
  ARITHMETIC: 'arithmetic',
  PHI_BLEND: 'phi_blend'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MUTATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MUTATION_TYPES = {
  GAUSSIAN: 'gaussian',
  UNIFORM: 'uniform',
  POLYNOMIAL: 'polynomial',
  ADAPTIVE: 'adaptive',
  QUANTUM: 'quantum'
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION CHAMBER PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class EvolutionChamberProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  /**
   * Calculate φ-blend crossover weights
   */
  getPhiBlendWeights() {
    return {
      parent1: PHI_INVERSE,
      parent2: 1 - PHI_INVERSE
    };
  }

  /**
   * Calculate adaptive mutation rate based on fitness
   */
  calculateAdaptiveMutationRate(baseMutationRate, fitnessRatio) {
    return baseMutationRate * (1 - fitnessRatio * PHI_INVERSE);
  }

  /**
   * Calculate Boltzmann selection probability
   */
  calculateBoltzmannProbability(fitness, temperature) {
    return Math.exp(fitness / temperature);
  }

  /**
   * Calculate tournament selection probability
   */
  getTournamentWinner(candidates) {
    return candidates.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  /**
   * Calculate population diversity
   */
  calculateDiversity(distances, pairs) {
    return pairs > 0 ? distances / pairs : 0;
  }

  /**
   * Check if population is stagnant
   */
  isStagnant(improvementCount, threshold = EVOLUTION_CONFIG.STAGNATION_THRESHOLD) {
    return improvementCount >= threshold;
  }

  /**
   * Calculate migration count
   */
  getMigrationCount(populationSize, rate = EVOLUTION_CONFIG.MIGRATION_RATE) {
    return Math.floor(populationSize * rate);
  }

  /**
   * Get protocol metadata
   */
  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      config: EVOLUTION_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES),
      states: Object.keys(EVOLUTION_STATES),
      selectionMethods: Object.keys(SELECTION_METHODS),
      crossoverTypes: Object.keys(CROSSOVER_TYPES),
      mutationTypes: Object.keys(MUTATION_TYPES),
      phi: this.phi
    };
  }
}

export default EvolutionChamberProtocol;
