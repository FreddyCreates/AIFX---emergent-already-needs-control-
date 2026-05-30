/**
 * PROTO-229: Centerfold Convergence Protocol (CCP)
 *
 * Purpose:
 * - Normalize input into a linear processing lane
 * - Expand in exponential parallel lanes
 * - Compute perpendicular interaction terms
 * - Converge into a centerfold output envelope
 *
 * This protocol acts as a bridge between protocol orchestration and sdk/engines/centerfold-engine.
 */

import { centerfoldEngine, CenterfoldEngine } from '../sdk/engines/centerfold-engine.js';

const CENTERFOLD_STATES = {
  IDLE: 'idle',
  ACTIVE: 'active',
  DEGRADED: 'degraded',
};

class CenterfoldConvergenceProtocol {
  constructor(options = {}) {
    this.engine = options.engine || centerfoldEngine;
    this.state = CENTERFOLD_STATES.IDLE;
    this.lastCycle = null;
    this.metrics = {
      cycles: 0,
      failures: 0,
    };
  }

  ensureEngine() {
    if (!this.engine) {
      this.engine = new CenterfoldEngine();
    }
    return this.engine;
  }

  activate(payload = {}) {
    this.state = CENTERFOLD_STATES.ACTIVE;
    return this.tick(payload);
  }

  tick(payload = {}) {
    const engine = this.ensureEngine();
    try {
      const cycle = engine.runCycle(payload);
      this.lastCycle = cycle;
      this.metrics.cycles += 1;
      this.state = CENTERFOLD_STATES.ACTIVE;
      return {
        state: this.state,
        sequence: cycle.sequence,
        centerMass: cycle.output.centerfold.centerMass,
        centerEnergy: cycle.output.centerfold.energy,
        kernelId: cycle.input.kernel.id,
      };
    } catch (error) {
      this.metrics.failures += 1;
      this.state = CENTERFOLD_STATES.DEGRADED;
      return {
        state: this.state,
        error: error.message,
      };
    }
  }

  watchCycle(limit = 5) {
    const engine = this.ensureEngine();
    return {
      state: this.state,
      metrics: { ...this.metrics },
      latest: this.lastCycle,
      recent: engine.state.listRecent(limit),
      trendSummary: engine.state.getTrendSummary(),
      observability: engine.observability.getMetrics(),
    };
  }

  status() {
    const engine = this.ensureEngine();
    return {
      state: this.state,
      metrics: { ...this.metrics },
      engine: engine.getStatus(),
    };
  }
}

export { CenterfoldConvergenceProtocol, CENTERFOLD_STATES };
export default CenterfoldConvergenceProtocol;
