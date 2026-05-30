/**
 * PROTO-214: Predictive Coding Protocol (PCP)
 * Top-down predictions with bottom-up error correction.
 * 
 * Implements hierarchical predictive processing:
 * - Each level predicts the level below
 * - Prediction errors propagate upward
 * - Phi-weighted precision weighting
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

class PredictiveCodingProtocol {
  constructor(config = {}) {
    this.levels = config.levels || 3;
    this.hierarchy = [];
    this.predictionErrors = [];
    this.totalPredictions = 0;
    this.totalUpdates = 0;
    
    // Initialize hierarchy
    for (let i = 0; i < this.levels; i++) {
      this.hierarchy.push({
        level: i,
        predictions: new Map(),
        precisions: new Map(),
        states: new Map(),
        errorSum: 0,
        updateCount: 0,
      });
    }
  }

  predict(level, key, value) {
    if (level < 0 || level >= this.levels) return null;
    
    const layer = this.hierarchy[level];
    layer.predictions.set(key, {
      value,
      timestamp: Date.now(),
      precision: this.calculatePrecision(level, key),
    });
    
    this.totalPredictions++;
    return { level, key, predicted: value };
  }

  observe(level, key, actualValue) {
    if (level < 0 || level >= this.levels) return null;
    
    const layer = this.hierarchy[level];
    const prediction = layer.predictions.get(key);
    
    let error = 0;
    if (prediction) {
      // Calculate prediction error
      if (typeof actualValue === 'number' && typeof prediction.value === 'number') {
        error = actualValue - prediction.value;
      } else {
        error = actualValue === prediction.value ? 0 : 1;
      }
      
      // Precision-weighted error
      const precision = prediction.precision || 1.0;
      const weightedError = error * precision;
      
      layer.errorSum += Math.abs(weightedError);
      layer.updateCount++;
      
      this.predictionErrors.push({
        level,
        key,
        predicted: prediction.value,
        actual: actualValue,
        error,
        weightedError,
        timestamp: Date.now(),
      });
      if (this.predictionErrors.length > 500) this.predictionErrors.shift();
    }
    
    // Update state
    layer.states.set(key, {
      value: actualValue,
      timestamp: Date.now(),
      fromPrediction: !!prediction,
    });
    
    this.totalUpdates++;
    
    // Propagate error upward (if not top level)
    if (level < this.levels - 1 && Math.abs(error) > 0.1) {
      this.propagateError(level + 1, key, error);
    }
    
    return { level, key, actual: actualValue, error, propagated: level < this.levels - 1 };
  }

  propagateError(level, sourceKey, error) {
    if (level >= this.levels) return;
    
    const layer = this.hierarchy[level];
    const propagatedKey = `error:${sourceKey}`;
    
    // Higher levels receive attenuated, phi-scaled errors
    const attenuatedError = error * Math.pow(PHI - 1, level);
    
    layer.states.set(propagatedKey, {
      value: attenuatedError,
      timestamp: Date.now(),
      isError: true,
    });
    
    // Update precision at source level
    if (level > 0) {
      const sourceLayer = this.hierarchy[level - 1];
      const currentPrecision = sourceLayer.precisions.get(sourceKey) || 1.0;
      // Reduce precision if errors are high
      const newPrecision = currentPrecision * (1 - Math.abs(error) * 0.1);
      sourceLayer.precisions.set(sourceKey, Math.max(0.1, newPrecision));
    }
  }

  calculatePrecision(level, key) {
    const layer = this.hierarchy[level];
    const stored = layer.precisions.get(key);
    if (stored !== undefined) return stored;
    
    // Default precision: phi-weighted by level (higher = more abstract = lower precision)
    return Math.pow(PHI - 1, level);
  }

  getHierarchyState() {
    return this.hierarchy.map((layer, i) => ({
      level: i,
      predictionCount: layer.predictions.size,
      stateCount: layer.states.size,
      avgError: layer.updateCount > 0 ? layer.errorSum / layer.updateCount : 0,
      updateCount: layer.updateCount,
    }));
  }

  getRecentErrors(limit = 20) {
    return this.predictionErrors.slice(-limit);
  }

  getMetrics() {
    let totalError = 0;
    let totalUpdates = 0;
    for (const layer of this.hierarchy) {
      totalError += layer.errorSum;
      totalUpdates += layer.updateCount;
    }
    
    return {
      levels: this.levels,
      totalPredictions: this.totalPredictions,
      totalUpdates: this.totalUpdates,
      avgError: totalUpdates > 0 ? totalError / totalUpdates : 0,
      hierarchy: this.getHierarchyState(),
      recentErrors: this.predictionErrors.slice(-10),
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { PredictiveCodingProtocol };
export default PredictiveCodingProtocol;
