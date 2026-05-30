/**
 * CENTERFOLD ENGINE
 *
 * Concrete implementation of:
 * 1) Input model
 * 2) Linear path
 * 3) Exponential parallel path
 * 4) Perpendicular interaction model
 * 5) Centerfold convergence output
 * 6) Observability and persistence hooks
 */

import {
  createLinearPath,
  createExponentialParallel,
  createPerpendicularInteraction,
  convergeToCenterfold,
} from './centerfold-math.js';

import { CenterfoldStateStore } from './centerfold-state.js';
import { CenterfoldObservability } from './centerfold-observability.js';
import {
  CENTERFOLD_KERNEL_BANK,
  selectKernel,
  selectKernelByEntropy,
} from './centerfold-kernel-bank.js';

const DEFAULT_MODEL = {
  linear: {
    slope: 1,
    bias: 0,
    damping: 0.03,
    floor: -1e6,
    ceiling: 1e6,
  },
  exponential: {
    base: 1.05,
    gain: 0.75,
    offset: 0,
    branches: 4,
    maxValue: 1e6,
  },
  perpendicular: {
    coupling: 0.85,
    orthogonalityFloor: -1,
    orthogonalityCeiling: 1,
  },
  centerfold: {
    linearWeight: 0.34,
    exponentialWeight: 0.33,
    perpendicularWeight: 0.33,
    centerBias: 0,
    centerClamp: 1e6,
  },
};

function mergeModel(base, overlay) {
  return {
    linear: { ...(base.linear || {}), ...((overlay && overlay.linear) || {}) },
    exponential: { ...(base.exponential || {}), ...((overlay && overlay.exponential) || {}) },
    perpendicular: { ...(base.perpendicular || {}), ...((overlay && overlay.perpendicular) || {}) },
    centerfold: { ...(base.centerfold || {}), ...((overlay && overlay.centerfold) || {}) },
  };
}

class CenterfoldEngine {
  constructor(options = {}) {
    this.model = mergeModel(DEFAULT_MODEL, options.model || {});
    this.state = options.state || new CenterfoldStateStore(options.stateOptions || {});
    this.observability = options.observability || new CenterfoldObservability(options.observabilityOptions || {});
    this.kernelBank = options.kernelBank || CENTERFOLD_KERNEL_BANK;
  }

  setModel(partialModel = {}) {
    this.model = mergeModel(this.model, partialModel);
    return this.model;
  }

  getModel() {
    return this.model;
  }

  resolveKernel({ kernelId, entropy } = {}) {
    if (kernelId) {
      return selectKernel(this.kernelBank, kernelId);
    }
    if (Number.isFinite(entropy)) {
      return selectKernelByEntropy(this.kernelBank, entropy);
    }
    return this.kernelBank.default;
  }

  createInputModel(payload = {}) {
    const inputVector = Array.isArray(payload.vector) ? payload.vector : [];
    const metadata = payload.metadata || {};
    const kernel = this.resolveKernel(payload.kernel || {});

    return {
      vector: inputVector,
      metadata,
      kernel,
      timestamp: Date.now(),
    };
  }

  runCycle(payload = {}) {
    const cycleStartedAt = Date.now();
    const input = this.createInputModel(payload);

    this.observability.emit('centerfold:cycle:start', {
      kernelId: input.kernel.id,
      dimensions: input.vector.length,
    });

    try {
      const runtimeModel = mergeModel(this.model, input.kernel.overrides || {});

      const linear = createLinearPath(input.vector, runtimeModel.linear);
      const exponential = createExponentialParallel(input.vector, runtimeModel.exponential);
      const perpendicular = createPerpendicularInteraction(
        linear.output,
        exponential.aggregate,
        runtimeModel.perpendicular,
      );
      const centerfold = convergeToCenterfold(
        linear,
        exponential,
        perpendicular,
        runtimeModel.centerfold,
      );

      const output = {
        linear,
        exponential,
        perpendicular,
        centerfold,
      };

      const durationMs = Date.now() - cycleStartedAt;
      const observability = {
        durationMs,
        kernelId: input.kernel.id,
        modelVersion: input.kernel.version,
      };

      const snapshot = this.state.record({
        timestamp: input.timestamp,
        input,
        model: runtimeModel,
        output,
        observability,
      });

      this.observability.markCycle(durationMs, 'ok');
      this.observability.emit('centerfold:cycle:complete', {
        sequence: snapshot.sequence,
        durationMs,
        centerMass: output.centerfold.centerMass,
        centerEnergy: output.centerfold.energy,
      });

      return snapshot;
    } catch (error) {
      const durationMs = Date.now() - cycleStartedAt;
      this.observability.markCycle(durationMs, 'error');
      this.observability.emit('centerfold:cycle:error', {
        durationMs,
        message: error.message,
      });
      throw error;
    }
  }

  runBatch(payloads = []) {
    const outputs = [];
    for (const payload of payloads) {
      outputs.push(this.runCycle(payload));
    }
    return outputs;
  }

  getStatus() {
    return {
      model: this.model,
      state: {
        sequence: this.state.sequence,
        lastUpdatedAt: this.state.lastUpdatedAt,
        trendSummary: this.state.getTrendSummary(),
      },
      observability: this.observability.getMetrics(),
      kernels: {
        count: Object.keys(this.kernelBank.catalog || {}).length,
        default: this.kernelBank.default?.id || null,
      },
    };
  }

  reset() {
    this.state.reset();
    this.observability.reset();
  }
}

const centerfoldEngine = new CenterfoldEngine();

export {
  DEFAULT_MODEL,
  CenterfoldEngine,
  centerfoldEngine,
};

export default centerfoldEngine;
