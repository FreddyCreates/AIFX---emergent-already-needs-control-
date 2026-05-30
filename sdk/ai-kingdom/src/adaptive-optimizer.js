/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🎯 ADAPTIVE OPTIMIZER — Self-Tuning Optimization Engine 🎯                           ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * The Adaptive Optimizer automatically tunes hyperparameters and learning
 * strategies based on real-time performance feedback.
 * 
 * OPTIMIZER PRINCIPLES:
 *   - Continuously monitor loss landscape topology
 *   - Adapt learning rate using φ-harmonic scheduling
 *   - Switch strategies based on convergence patterns
 *   - Balance exploration vs exploitation dynamically
 * 
 * @module sdk/ai-kingdom/adaptive-optimizer
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_SQUARED = PHI * PHI;

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZER STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const OPTIMIZER_STATES = {
  DORMANT: 'dormant',             // Not active
  CALIBRATING: 'calibrating',     // Initial parameter search
  EXPLORING: 'exploring',         // Searching solution space
  EXPLOITING: 'exploiting',       // Refining best solution
  ADAPTING: 'adapting',           // Changing strategy
  CONVERGING: 'converging',       // Approaching optimum
  CONVERGED: 'converged'          // Reached optimal point
};

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZATION STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════
export const STRATEGIES = {
  PHI_GRADIENT: {
    name: 'phi_gradient',
    description: 'Golden ratio learning rate decay',
    explorationBias: 0.5
  },
  MOMENTUM: {
    name: 'momentum',
    description: 'Accelerated gradient descent',
    explorationBias: 0.3
  },
  ADAPTIVE: {
    name: 'adaptive',
    description: 'Self-adjusting parameters (Adam-like)',
    explorationBias: 0.4
  },
  SPARSE: {
    name: 'sparse',
    description: 'Efficient sparse updates',
    explorationBias: 0.2
  },
  QUANTUM: {
    name: 'quantum',
    description: 'Quantum-inspired tunneling',
    explorationBias: 0.8
  },
  EVOLUTIONARY: {
    name: 'evolutionary',
    description: 'Population-based optimization',
    explorationBias: 0.7
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERGENCE CRITERIA
// ═══════════════════════════════════════════════════════════════════════════════
export const CONVERGENCE_CRITERIA = {
  LOSS_THRESHOLD: 1e-6,
  GRADIENT_NORM: 1e-5,
  PATIENCE_EPOCHS: 10,
  MIN_IMPROVEMENT: 1e-4
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTIVE OPTIMIZER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class AdaptiveOptimizer {
  constructor(optimizerId, config = {}) {
    this.optimizerId = optimizerId;
    this.state = OPTIMIZER_STATES.DORMANT;
    this.currentStrategy = config.initialStrategy || STRATEGIES.PHI_GRADIENT;
    
    // Learning parameters
    this.learningRate = config.learningRate || 0.01;
    this.minLearningRate = config.minLearningRate || 1e-6;
    this.maxLearningRate = config.maxLearningRate || 1.0;
    
    // Momentum and adaptive parameters
    this.momentum = config.momentum || 0.9;
    this.beta1 = config.beta1 || 0.9;  // First moment decay
    this.beta2 = config.beta2 || 0.999; // Second moment decay
    this.epsilon = config.epsilon || 1e-8;
    
    // History and tracking
    this.lossHistory = [];
    this.gradientHistory = [];
    this.strategyHistory = [];
    this.adaptationCount = 0;
    
    // First and second moment estimates (Adam-style)
    this.m = {}; // First moment
    this.v = {}; // Second moment
    this.t = 0;  // Time step
    
    // Exploration vs exploitation balance
    this.explorationRate = config.explorationRate || 0.5;
    this.explorationDecay = config.explorationDecay || PHI_INVERSE;
    
    this.createdAt = Date.now();
  }

  /**
   * Initialize optimizer for a new optimization task
   */
  initialize(parameterCount) {
    this.state = OPTIMIZER_STATES.CALIBRATING;
    this.parameterCount = parameterCount;
    
    // Initialize moment estimates
    this.m = new Array(parameterCount).fill(0);
    this.v = new Array(parameterCount).fill(0);
    this.t = 0;
    
    this.lossHistory = [];
    this.gradientHistory = [];
    
    return {
      optimizerId: this.optimizerId,
      initialized: true,
      parameterCount,
      strategy: this.currentStrategy.name
    };
  }

  /**
   * Compute parameter update based on current strategy
   */
  computeUpdate(gradients, loss) {
    this.t++;
    this.lossHistory.push(loss);
    this.gradientHistory.push(this._gradientNorm(gradients));
    
    let updates;
    
    switch (this.currentStrategy.name) {
      case 'phi_gradient':
        updates = this._phiGradientUpdate(gradients);
        break;
      case 'momentum':
        updates = this._momentumUpdate(gradients);
        break;
      case 'adaptive':
        updates = this._adaptiveUpdate(gradients);
        break;
      case 'sparse':
        updates = this._sparseUpdate(gradients);
        break;
      case 'quantum':
        updates = this._quantumUpdate(gradients);
        break;
      case 'evolutionary':
        updates = this._evolutionaryUpdate(gradients);
        break;
      default:
        updates = this._phiGradientUpdate(gradients);
    }

    // Check for strategy adaptation
    this._checkAdaptation();
    
    return {
      updates,
      learningRate: this.learningRate,
      strategy: this.currentStrategy.name,
      step: this.t
    };
  }

  /**
   * φ-Gradient update: Golden ratio learning rate scheduling
   */
  _phiGradientUpdate(gradients) {
    // Apply φ-harmonic learning rate decay
    const decayFactor = Math.pow(PHI_INVERSE, this.t / 1000);
    const effectiveLr = Math.max(this.minLearningRate, this.learningRate * decayFactor);
    
    return gradients.map(g => -effectiveLr * g);
  }

  /**
   * Momentum update: Accelerated gradient descent
   */
  _momentumUpdate(gradients) {
    const updates = gradients.map((g, i) => {
      this.m[i] = this.momentum * (this.m[i] || 0) + this.learningRate * g;
      return -this.m[i];
    });
    return updates;
  }

  /**
   * Adaptive update: Adam-style with φ-enhanced moments
   */
  _adaptiveUpdate(gradients) {
    const updates = gradients.map((g, i) => {
      // Update biased first moment estimate
      this.m[i] = this.beta1 * (this.m[i] || 0) + (1 - this.beta1) * g;
      
      // Update biased second moment estimate
      this.v[i] = this.beta2 * (this.v[i] || 0) + (1 - this.beta2) * g * g;
      
      // Bias correction with φ enhancement
      const mHat = this.m[i] / (1 - Math.pow(this.beta1, this.t));
      const vHat = this.v[i] / (1 - Math.pow(this.beta2, this.t));
      
      // φ-scaled update
      const phiScale = 1 + (PHI_INVERSE - 1) * Math.exp(-this.t / 100);
      
      return -this.learningRate * phiScale * mHat / (Math.sqrt(vHat) + this.epsilon);
    });
    return updates;
  }

  /**
   * Sparse update: Only update significant gradients
   */
  _sparseUpdate(gradients) {
    const threshold = this._calculateSparsityThreshold(gradients);
    
    return gradients.map(g => {
      if (Math.abs(g) < threshold) return 0;
      return -this.learningRate * g;
    });
  }

  /**
   * Quantum-inspired update: Probabilistic tunneling
   */
  _quantumUpdate(gradients) {
    const temperature = Math.max(0.01, 1 - this.t / 1000);
    
    return gradients.map(g => {
      // Quantum tunneling probability
      const tunnelProb = Math.exp(-Math.abs(g) / (temperature * PHI));
      
      if (Math.random() < tunnelProb * this.explorationRate) {
        // Tunnel: random perturbation
        return (Math.random() - 0.5) * 2 * this.learningRate;
      } else {
        // Classical gradient descent
        return -this.learningRate * g;
      }
    });
  }

  /**
   * Evolutionary update: Population-based mutation
   */
  _evolutionaryUpdate(gradients) {
    const mutationRate = this.explorationRate * PHI_INVERSE;
    
    return gradients.map(g => {
      if (Math.random() < mutationRate) {
        // Mutation: scaled random change
        const mutation = (Math.random() - 0.5) * 2 * this.learningRate * PHI;
        return mutation - this.learningRate * g * PHI_INVERSE;
      }
      return -this.learningRate * g;
    });
  }

  /**
   * Check if strategy adaptation is needed
   */
  _checkAdaptation() {
    if (this.lossHistory.length < 10) return;

    const recentLosses = this.lossHistory.slice(-10);
    const previousLosses = this.lossHistory.slice(-20, -10);
    
    if (previousLosses.length < 10) return;

    const recentAvg = recentLosses.reduce((a, b) => a + b, 0) / 10;
    const previousAvg = previousLosses.reduce((a, b) => a + b, 0) / 10;
    
    const improvement = (previousAvg - recentAvg) / previousAvg;

    // Stagnation detection
    if (improvement < CONVERGENCE_CRITERIA.MIN_IMPROVEMENT) {
      this._adaptStrategy();
    }

    // Convergence check
    if (recentAvg < CONVERGENCE_CRITERIA.LOSS_THRESHOLD) {
      this.state = OPTIMIZER_STATES.CONVERGED;
    } else if (improvement > 0) {
      this.state = OPTIMIZER_STATES.CONVERGING;
    }
  }

  /**
   * Adapt to a new optimization strategy
   */
  _adaptStrategy() {
    this.state = OPTIMIZER_STATES.ADAPTING;
    this.adaptationCount++;

    const strategies = Object.values(STRATEGIES);
    const currentIndex = strategies.findIndex(s => s.name === this.currentStrategy.name);
    
    // Try next strategy in rotation, weighted by exploration rate
    if (this.explorationRate > 0.5) {
      // High exploration: prefer quantum/evolutionary
      this.currentStrategy = Math.random() > 0.5 ? STRATEGIES.QUANTUM : STRATEGIES.EVOLUTIONARY;
    } else {
      // Low exploration: prefer adaptive/momentum
      this.currentStrategy = strategies[(currentIndex + 1) % strategies.length];
    }

    // Decay exploration rate
    this.explorationRate *= this.explorationDecay;
    
    this.strategyHistory.push({
      strategy: this.currentStrategy.name,
      step: this.t,
      reason: 'stagnation'
    });

    // Adjust learning rate on adaptation
    this.learningRate = Math.min(
      this.maxLearningRate,
      this.learningRate * PHI_INVERSE
    );
  }

  /**
   * Calculate gradient norm
   */
  _gradientNorm(gradients) {
    return Math.sqrt(gradients.reduce((sum, g) => sum + g * g, 0));
  }

  /**
   * Calculate sparsity threshold
   */
  _calculateSparsityThreshold(gradients) {
    const sorted = [...gradients].map(Math.abs).sort((a, b) => b - a);
    const topK = Math.ceil(sorted.length * PHI_INVERSE);
    return sorted[topK] || 0;
  }

  /**
   * Get optimizer status
   */
  getStatus() {
    return {
      optimizerId: this.optimizerId,
      state: this.state,
      strategy: this.currentStrategy.name,
      learningRate: this.learningRate,
      explorationRate: this.explorationRate,
      step: this.t,
      adaptations: this.adaptationCount,
      convergenceMetric: this.lossHistory.length > 0 
        ? this.lossHistory[this.lossHistory.length - 1] 
        : null,
      strategyHistory: this.strategyHistory.slice(-5)
    };
  }

  /**
   * Reset optimizer state
   */
  reset() {
    this.state = OPTIMIZER_STATES.DORMANT;
    this.t = 0;
    this.m = {};
    this.v = {};
    this.lossHistory = [];
    this.gradientHistory = [];
    this.explorationRate = 0.5;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZER ENSEMBLE - Multiple optimizers working together
// ═══════════════════════════════════════════════════════════════════════════════
export class OptimizerEnsemble {
  constructor(ensembleId, config = {}) {
    this.ensembleId = ensembleId;
    this.optimizers = new Map();
    this.votingWeight = new Map();
    this.ensembleStrategy = config.strategy || 'majority';
    this.createdAt = Date.now();
  }

  addOptimizer(optimizerId, config = {}) {
    const optimizer = new AdaptiveOptimizer(optimizerId, config);
    this.optimizers.set(optimizerId, optimizer);
    this.votingWeight.set(optimizerId, 1.0);
    return optimizer;
  }

  /**
   * Ensemble update: Combine updates from all optimizers
   */
  computeEnsembleUpdate(gradients, loss) {
    const allUpdates = [];
    
    for (const [id, optimizer] of this.optimizers) {
      const result = optimizer.computeUpdate(gradients, loss);
      allUpdates.push({
        id,
        updates: result.updates,
        weight: this.votingWeight.get(id)
      });
    }

    // Combine updates based on ensemble strategy
    return this._combineUpdates(allUpdates, gradients.length);
  }

  _combineUpdates(allUpdates, paramCount) {
    const combined = new Array(paramCount).fill(0);
    let totalWeight = 0;

    for (const { updates, weight } of allUpdates) {
      totalWeight += weight;
      for (let i = 0; i < paramCount; i++) {
        combined[i] += updates[i] * weight;
      }
    }

    return combined.map(u => u / totalWeight);
  }

  /**
   * Update voting weights based on performance
   */
  updateWeights() {
    for (const [id, optimizer] of this.optimizers) {
      const status = optimizer.getStatus();
      // Better convergence = higher weight
      const performance = status.convergenceMetric 
        ? 1 / (status.convergenceMetric + 1) 
        : 0.5;
      this.votingWeight.set(id, performance * PHI_INVERSE + 0.5);
    }
  }

  getEnsembleStatus() {
    return {
      ensembleId: this.ensembleId,
      optimizerCount: this.optimizers.size,
      weights: Object.fromEntries(this.votingWeight),
      strategy: this.ensembleStrategy
    };
  }
}

export default AdaptiveOptimizer;
