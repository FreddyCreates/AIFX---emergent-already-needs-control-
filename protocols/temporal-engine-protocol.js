/**
 * PROTO-237: Temporal Engine Protocol (TEP)
 * Time-aware scheduling, forecasting, and temporal reasoning.
 *
 * The Temporal Engine Protocol defines formal rules for:
 * - Task scheduling with priority-based execution
 * - Time-series forecasting with confidence intervals
 * - Temporal pattern recognition and analysis
 * - Schedule optimization based on predicted load
 * - Network-wide time synchronization
 *
 * φ-enhanced: Uses golden ratio for decay functions and periodicity detection.
 *
 * @module protocols/temporal-engine-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-237';
const PROTOCOL_NAME = 'Temporal Engine Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPORAL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const TEMPORAL_CONFIG = {
  // Tick parameters
  DEFAULT_TICK_INTERVAL_MS: 1000,
  MIN_TICK_INTERVAL_MS: 100,
  MAX_TICK_INTERVAL_MS: 60000,
  
  // Forecasting
  DEFAULT_HORIZON_TICKS: 100,
  MAX_HORIZON_TICKS: 1000,
  CONFIDENCE_DECAY_RATE: PHI_INVERSE,
  
  // Pattern detection
  MIN_PATTERN_SAMPLES: 10,
  PHI_PERIODICITY_TOLERANCE: 0.1, // 10% tolerance
  PHI_PATTERN_THRESHOLD: 0.3, // 30% of intervals
  
  // Scheduling
  MAX_SCHEDULED_TASKS: 10000,
  TASK_TIMEOUT_MS: 300000, // 5 minutes
  
  // Load balancing
  HIGH_LOAD_THRESHOLD: 0.8,
  MEDIUM_LOAD_THRESHOLD: 0.5,
  LOW_LOAD_THRESHOLD: 0.2
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  SCHEDULE_TASK: 'schedule_task',
  CANCEL_TASK: 'cancel_task',
  TASK_COMPLETED: 'task_completed',
  TASK_FAILED: 'task_failed',
  FORECAST_REQUEST: 'forecast_request',
  FORECAST_RESPONSE: 'forecast_response',
  SYNC_TIME: 'sync_time',
  TICK_ADVANCE: 'tick_advance',
  PATTERN_DETECTED: 'pattern_detected',
  OPTIMIZE_SCHEDULE: 'optimize_schedule'
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPORAL STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const TEMPORAL_STATES = {
  DORMANT: 'dormant',
  TICKING: 'ticking',
  FORECASTING: 'forecasting',
  SCHEDULING: 'scheduling',
  REWINDING: 'rewinding',
  ACCELERATING: 'accelerating'
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULE PRIORITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const SCHEDULE_PRIORITIES = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  BACKGROUND: 5
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIME SCALES
// ═══════════════════════════════════════════════════════════════════════════════

export const TIME_SCALES = {
  INSTANT: { name: 'instant', ms: 1000 },
  SHORT: { name: 'short', ms: 60000 },
  MEDIUM: { name: 'medium', ms: 3600000 },
  LONG: { name: 'long', ms: 86400000 },
  EXTENDED: { name: 'extended', ms: 604800000 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPORAL ENGINE PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class TemporalEngineProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  /**
   * Calculate forecast confidence based on horizon distance
   */
  calculateForecastConfidence(ticksAhead) {
    return Math.pow(TEMPORAL_CONFIG.CONFIDENCE_DECAY_RATE, ticksAhead / 10);
  }

  /**
   * Calculate predicted load using φ-weighted history
   */
  calculatePredictedLoad(historicalLoads, ticksAhead) {
    if (historicalLoads.length === 0) return 0;
    
    // Recent loads weighted more heavily using φ
    let weightedSum = 0;
    let totalWeight = 0;
    
    historicalLoads.forEach((load, i) => {
      const recency = historicalLoads.length - i;
      const weight = Math.pow(PHI_INVERSE, recency / historicalLoads.length);
      weightedSum += load * weight;
      totalWeight += weight;
    });
    
    return weightedSum / totalWeight;
  }

  /**
   * Detect φ-based periodicity in interval data
   */
  detectPhiPeriodicity(intervals) {
    if (intervals.length < TEMPORAL_CONFIG.MIN_PATTERN_SAMPLES) {
      return { detected: false, reason: 'insufficient_data' };
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const phiPeriod = Math.floor(avgInterval * PHI);
    const tolerance = phiPeriod * TEMPORAL_CONFIG.PHI_PERIODICITY_TOLERANCE;
    
    const matchingIntervals = intervals.filter(i => 
      Math.abs(i - phiPeriod) < tolerance
    ).length;
    
    const matchRatio = matchingIntervals / intervals.length;
    
    return {
      detected: matchRatio >= TEMPORAL_CONFIG.PHI_PATTERN_THRESHOLD,
      period: phiPeriod,
      matchRatio,
      avgInterval,
      confidence: matchRatio
    };
  }

  /**
   * Calculate optimal reschedule tick for load balancing
   */
  calculateRescheduleTick(currentTick, currentLoad, predictions) {
    // Find tick with lowest predicted load
    const lowLoadTicks = predictions.filter(p => 
      p.predictedLoad < currentLoad * PHI_INVERSE &&
      p.tick > currentTick
    );
    
    if (lowLoadTicks.length === 0) return null;
    
    // Return earliest low-load tick
    return lowLoadTicks.sort((a, b) => a.tick - b.tick)[0];
  }

  /**
   * Get load level classification
   */
  getLoadLevel(load) {
    if (load >= TEMPORAL_CONFIG.HIGH_LOAD_THRESHOLD) return 'high';
    if (load >= TEMPORAL_CONFIG.MEDIUM_LOAD_THRESHOLD) return 'medium';
    if (load >= TEMPORAL_CONFIG.LOW_LOAD_THRESHOLD) return 'low';
    return 'idle';
  }

  /**
   * Get protocol metadata
   */
  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      config: TEMPORAL_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES),
      states: Object.keys(TEMPORAL_STATES),
      priorities: Object.keys(SCHEDULE_PRIORITIES),
      timeScales: Object.keys(TIME_SCALES),
      phi: this.phi
    };
  }
}

export default TemporalEngineProtocol;
