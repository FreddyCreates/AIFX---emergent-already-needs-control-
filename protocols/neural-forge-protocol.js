/**
 * PROTO-236: Neural Forge Protocol (NFP)
 * Distributed AI training, fine-tuning, and knowledge transfer.
 *
 * The Neural Forge Protocol defines formal rules for:
 * - Federated learning across distributed workers
 * - Model registration and version management
 * - φ-enhanced learning rate scheduling
 * - Knowledge distillation from teacher to student
 * - Gradient aggregation and model merging
 *
 * φ-enhanced: Uses golden ratio for learning rate decay and weight initialization.
 *
 * @module protocols/neural-forge-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-236';
const PROTOCOL_NAME = 'Neural Forge Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// FORGE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const FORGE_CONFIG = {
  // Learning parameters
  BASE_LEARNING_RATE: 0.001,
  MIN_LEARNING_RATE: 0.00001,
  WARMUP_EPOCHS: 10,
  DECAY_FACTOR: PHI_INVERSE,
  
  // Batch parameters
  MIN_BATCH_SIZE: 8,
  MAX_BATCH_SIZE: 512,
  OPTIMAL_BATCH_SIZE: Math.floor(32 * PHI),
  
  // Training limits
  MAX_EPOCHS: 1000,
  EARLY_STOP_PATIENCE: Math.floor(10 * PHI),
  CONVERGENCE_THRESHOLD: 0.0001,
  
  // Federated learning
  MIN_WORKERS: 2,
  MAX_WORKERS: 100,
  AGGREGATION_ROUNDS: 10,
  
  // Distillation
  DISTILLATION_TEMPERATURE: PHI,
  DISTILLATION_ALPHA: PHI_INVERSE,
  
  // Temperature (forge heat)
  COLD_TEMP: 0,
  WARM_TEMP: 500,
  HOT_TEMP: 1000
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  REGISTER_MODEL: 'register_model',
  START_TRAINING: 'start_training',
  PAUSE_TRAINING: 'pause_training',
  STOP_TRAINING: 'stop_training',
  WORKER_JOIN: 'worker_join',
  WORKER_LEAVE: 'worker_leave',
  GRADIENT_PUSH: 'gradient_push',
  WEIGHT_PULL: 'weight_pull',
  AGGREGATE_REQUEST: 'aggregate_request',
  DISTILL_REQUEST: 'distill_request',
  CHECKPOINT_SAVE: 'checkpoint_save',
  CHECKPOINT_LOAD: 'checkpoint_load'
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORGE STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const FORGE_STATES = {
  COLD: 'cold',
  WARMING: 'warming',
  HOT: 'hot',
  FORGING: 'forging',
  COOLING: 'cooling',
  TEMPERING: 'tempering'
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRAINING MODES
// ═══════════════════════════════════════════════════════════════════════════════

export const TRAINING_MODES = {
  SUPERVISED: 'supervised',
  UNSUPERVISED: 'unsupervised',
  REINFORCEMENT: 'reinforcement',
  FEDERATED: 'federated',
  DISTILLATION: 'distillation',
  CONTINUAL: 'continual'
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL FORGE PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class NeuralForgeProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  /**
   * Calculate φ-enhanced learning rate for given epoch
   */
  calculateLearningRate(epoch, warmupEpochs = FORGE_CONFIG.WARMUP_EPOCHS) {
    const baseLr = FORGE_CONFIG.BASE_LEARNING_RATE;
    
    if (epoch < warmupEpochs) {
      // Linear warmup
      return baseLr * (epoch / warmupEpochs);
    }
    
    // φ-based exponential decay
    const decayedLr = baseLr * Math.pow(FORGE_CONFIG.DECAY_FACTOR, (epoch - warmupEpochs) / 100);
    return Math.max(decayedLr, FORGE_CONFIG.MIN_LEARNING_RATE);
  }

  /**
   * Calculate optimal batch size based on available memory
   */
  calculateBatchSize(availableMemoryMB, modelSizeMB) {
    const ratio = availableMemoryMB / modelSizeMB;
    const optimalBatch = Math.floor(ratio * PHI_INVERSE);
    
    return Math.min(
      Math.max(optimalBatch, FORGE_CONFIG.MIN_BATCH_SIZE),
      FORGE_CONFIG.MAX_BATCH_SIZE
    );
  }

  /**
   * Calculate φ-weighted federated aggregation
   */
  calculateFederatedWeights(workerContributions) {
    const totalSamples = workerContributions.reduce((sum, w) => sum + w.samples, 0);
    
    return workerContributions.map(worker => ({
      workerId: worker.id,
      weight: (worker.samples / totalSamples) * PHI_INVERSE,
      normalizedWeight: worker.samples / totalSamples
    }));
  }

  /**
   * Calculate distillation loss components
   */
  calculateDistillationLoss(studentLogits, teacherLogits, hardLabels, temperature = FORGE_CONFIG.DISTILLATION_TEMPERATURE) {
    const alpha = FORGE_CONFIG.DISTILLATION_ALPHA;
    
    // Soft loss component (from teacher)
    const softLossWeight = alpha * (temperature * temperature);
    
    // Hard loss component (from labels)
    const hardLossWeight = (1 - alpha);
    
    return {
      softLossWeight,
      hardLossWeight,
      temperature,
      alpha,
      totalWeight: softLossWeight + hardLossWeight
    };
  }

  /**
   * Determine if training should early stop
   */
  shouldEarlyStop(lossHistory, patience = FORGE_CONFIG.EARLY_STOP_PATIENCE) {
    if (lossHistory.length < patience) return false;
    
    const recentLosses = lossHistory.slice(-patience);
    const oldestRecent = recentLosses[0];
    const improvement = recentLosses.every(loss => loss >= oldestRecent - FORGE_CONFIG.CONVERGENCE_THRESHOLD);
    
    return improvement;
  }

  /**
   * Get protocol metadata
   */
  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      config: FORGE_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES),
      states: Object.keys(FORGE_STATES),
      trainingModes: Object.keys(TRAINING_MODES),
      phi: this.phi
    };
  }
}

export default NeuralForgeProtocol;
