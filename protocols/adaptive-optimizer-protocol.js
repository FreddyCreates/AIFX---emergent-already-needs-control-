/**
 * PROTO-240: Adaptive Optimizer Protocol (AOP)
 * Self-tuning optimization with dynamic strategy selection.
 *
 * The Adaptive Optimizer Protocol defines formal rules for:
 * - Dynamic learning rate adjustment
 * - Strategy switching based on convergence patterns
 * - Exploration vs exploitation balancing
 * - Ensemble optimization coordination
 *
 * φ-enhanced: Uses golden ratio for learning rate decay and adaptation triggers.
 *
 * @module protocols/adaptive-optimizer-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-240';
const PROTOCOL_NAME = 'Adaptive Optimizer Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const OPTIMIZER_CONFIG = {
  // Learning rate bounds
  DEFAULT_LEARNING_RATE: 0.01,
  MIN_LEARNING_RATE: 1e-6,
  MAX_LEARNING_RATE: 1.0,
  
  // Momentum parameters
  DEFAULT_MOMENTUM: 0.9,
  BETA1: 0.9,
  BETA2: 0.999,
  EPSILON: 1e-8,
  
  // Convergence criteria
  LOSS_THRESHOLD: 1e-6,
  GRADIENT_NORM_THRESHOLD: 1e-5,
  PATIENCE_STEPS: 10,
  MIN_IMPROVEMENT: 1e-4,
  
  // Exploration
  INITIAL_EXPLORATION: 0.5,
  EXPLORATION_DECAY: PHI_INVERSE,
  MIN_EXPLORATION: 0.01
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  INITIALIZE: 'initialize',
  COMPUTE_UPDATE: 'compute_update',
  APPLY_UPDATE: 'apply_update',
  CHECK_CONVERGENCE: 'check_convergence',
  ADAPT_STRATEGY: 'adapt_strategy',
  RESET: 'reset',
  ENSEMBLE_VOTE: 'ensemble_vote',
  UPDATE_WEIGHTS: 'update_weights'
};

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZER STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const OPTIMIZER_STATES = {
  DORMANT: 'dormant',
  CALIBRATING: 'calibrating',
  EXPLORING: 'exploring',
  EXPLOITING: 'exploiting',
  ADAPTING: 'adapting',
  CONVERGING: 'converging',
  CONVERGED: 'converged'
};

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZATION STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════

export const STRATEGIES = {
  PHI_GRADIENT: { name: 'phi_gradient', explorationBias: 0.5 },
  MOMENTUM: { name: 'momentum', explorationBias: 0.3 },
  ADAPTIVE: { name: 'adaptive', explorationBias: 0.4 },
  SPARSE: { name: 'sparse', explorationBias: 0.2 },
  QUANTUM: { name: 'quantum', explorationBias: 0.8 },
  EVOLUTIONARY: { name: 'evolutionary', explorationBias: 0.7 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTIVE OPTIMIZER PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class AdaptiveOptimizerProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  /**
   * Calculate φ-decayed learning rate
   */
  calculateLearningRate(baseLr, step, decayPeriod = 1000) {
    const decayFactor = Math.pow(PHI_INVERSE, step / decayPeriod);
    return Math.max(OPTIMIZER_CONFIG.MIN_LEARNING_RATE, baseLr * decayFactor);
  }

  /**
   * Check if adaptation should trigger
   */
  shouldAdapt(lossHistory, minImprovement = OPTIMIZER_CONFIG.MIN_IMPROVEMENT) {
    if (lossHistory.length < 20) return false;
    
    const recent = lossHistory.slice(-10);
    const previous = lossHistory.slice(-20, -10);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / 10;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / 10;
    
    const improvement = (previousAvg - recentAvg) / previousAvg;
    return improvement < minImprovement;
  }

  /**
   * Select next strategy based on exploration rate
   */
  selectStrategy(currentStrategy, explorationRate) {
    if (explorationRate > 0.5) {
      return Math.random() > 0.5 ? STRATEGIES.QUANTUM : STRATEGIES.EVOLUTIONARY;
    }
    
    const strategies = Object.values(STRATEGIES);
    const currentIndex = strategies.findIndex(s => s.name === currentStrategy.name);
    return strategies[(currentIndex + 1) % strategies.length];
  }

  /**
   * Check convergence
   */
  hasConverged(loss, gradientNorm) {
    return loss < OPTIMIZER_CONFIG.LOSS_THRESHOLD || 
           gradientNorm < OPTIMIZER_CONFIG.GRADIENT_NORM_THRESHOLD;
  }

  /**
   * Get protocol metadata
   */
  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      config: OPTIMIZER_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES),
      states: Object.keys(OPTIMIZER_STATES),
      strategies: Object.keys(STRATEGIES),
      phi: this.phi
    };
  }
}

export default AdaptiveOptimizerProtocol;
