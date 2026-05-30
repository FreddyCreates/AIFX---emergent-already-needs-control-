/**
 * PROTO-003: Phi-Resonance Synchronization Protocol (PRSP)
 * Harmonic Synchronization Intelligence using Kuramoto oscillator coupling.
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

class PhiResonanceSyncProtocol {
  /**
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.oscillators = new Map();
    this.couplingConstant = config.K || PHI;
    this.naturalFrequency = config.omega || (2 * Math.PI / HEARTBEAT);
    this.resonanceBonds = new Map();
    this.totalPulses = 0;
    this.startTime = Date.now();
  }

  /**
   * Register an oscillator representing an intelligence endpoint.
   * @param {string} id - Oscillator identifier
   * @param {number} naturalFrequency - Natural frequency (defaults to system ω)
   * @returns {Object} - Registered oscillator info
   */
  registerOscillator(id, naturalFrequency) {
    const freq = naturalFrequency || this.naturalFrequency;
    const oscillator = {
      id,
      theta: Math.random() * 2 * Math.PI,
      frequency: freq,
      lastUpdate: Date.now(),
      pulseCount: 0
    };
    this.oscillators.set(id, oscillator);
    return { id, theta: oscillator.theta, frequency: freq };
  }

  /**
   * Advance all oscillators by dt using Kuramoto model.
   * dθ_i = ω_i + (K/N)·Σ_j sin(θ_j - θ_i)
   * Computes order parameter R·e^(iΨ) = (1/N)·Σe^(iθ_j)
   * @param {number} dt - Time step in seconds
   * @returns {Object} - {orderParameter, phases}
   */
  step(dt) {
    const N = this.oscillators.size;
    if (N === 0) return { orderParameter: { R: 0, Psi: 0 }, phases: [] };

    const K = this.couplingConstant;
    const updates = new Map();

    for (const [id, osc] of this.oscillators) {
      let coupling = 0;
      for (const [otherId, other] of this.oscillators) {
        if (otherId === id) continue;
        let couplingStrength = K / N;
        // Check for resonance bonds
        const bondKey = [id, otherId].sort().join('<->');
        if (this.resonanceBonds.has(bondKey)) {
          couplingStrength *= PHI;
        }
        coupling += couplingStrength * Math.sin(other.theta - osc.theta);
      }
      const dTheta = osc.frequency + coupling;
      let newTheta = osc.theta + dTheta * dt;
      // Wrap to [0, 2π)
      newTheta = ((newTheta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      updates.set(id, newTheta);
    }

    // Apply updates
    for (const [id, newTheta] of updates) {
      const osc = this.oscillators.get(id);
      osc.theta = newTheta;
      osc.lastUpdate = Date.now();
    }

    return {
      orderParameter: this.getOrderParameter(),
      phases: this.getPhaseMap()
    };
  }

  /**
   * Compute Kuramoto order parameter.
   * R·e^(iΨ) = (1/N)·Σe^(iθ_j)
   * @returns {Object} - {R, Psi} where R=synchronization level
   */
  getOrderParameter() {
    const N = this.oscillators.size;
    if (N === 0) return { R: 0, Psi: 0 };

    let sumCos = 0;
    let sumSin = 0;
    for (const osc of this.oscillators.values()) {
      sumCos += Math.cos(osc.theta);
      sumSin += Math.sin(osc.theta);
    }
    sumCos /= N;
    sumSin /= N;

    const R = Math.sqrt(sumCos * sumCos + sumSin * sumSin);
    const Psi = Math.atan2(sumSin, sumCos);

    return { R, Psi };
  }

  /**
   * Emit a heartbeat pulse at 873ms intervals.
   * @returns {Object} - Current phase state with pulse info
   */
  pulse() {
    this.totalPulses++;
    const now = Date.now();
    for (const osc of this.oscillators.values()) {
      osc.pulseCount++;
    }
    return {
      beat: this.totalPulses,
      timestamp: now,
      intervalMs: HEARTBEAT,
      orderParameter: this.getOrderParameter(),
      activeOscillators: this.oscillators.size
    };
  }

  /**
   * Find oscillators that haven't updated in timeout period.
   * @param {number} timeoutBeats - Number of heartbeats before considered dead
   * @returns {string[]} - Array of dead oscillator IDs
   */
  detectDeadNodes(timeoutBeats = 5) {
    const timeoutMs = timeoutBeats * HEARTBEAT;
    const now = Date.now();
    const dead = [];
    for (const [id, osc] of this.oscillators) {
      if (now - osc.lastUpdate > timeoutMs) {
        dead.push(id);
      }
    }
    return dead;
  }

  /**
   * Returns all oscillator phases.
   * @returns {Object[]} - Array of {id, theta, frequency, lastUpdate}
   */
  getPhaseMap() {
    const phases = [];
    for (const [id, osc] of this.oscillators) {
      phases.push({
        id,
        theta: osc.theta,
        frequency: osc.frequency,
        lastUpdate: osc.lastUpdate
      });
    }
    return phases;
  }

  /**
   * Create resonance bond between two oscillators boosting coupling.
   * @param {string} sourceId
   * @param {string} targetId
   * @returns {Object} - Bond info
   */
  resonate(sourceId, targetId) {
    const bondKey = [sourceId, targetId].sort().join('<->');
    const bond = {
      source: sourceId,
      target: targetId,
      strength: PHI,
      createdAt: Date.now()
    };
    this.resonanceBonds.set(bondKey, bond);
    return bond;
  }

  /**
   * Returns synchronization metrics.
   * @returns {Object} - {orderParameter, activePeers, deadNodes, totalPulses, avgDrift}
   */
  getSyncMetrics() {
    const orderParam = this.getOrderParameter();
    const deadNodes = this.detectDeadNodes();
    const phases = this.getPhaseMap();
    
    // Calculate average drift from mean phase
    let avgDrift = 0;
    if (phases.length > 0) {
      const meanPhase = orderParam.Psi;
      let totalDrift = 0;
      for (const p of phases) {
        let diff = Math.abs(p.theta - meanPhase);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        totalDrift += diff;
      }
      avgDrift = totalDrift / phases.length;
    }

    return {
      orderParameter: orderParam.R,
      activePeers: this.oscillators.size - deadNodes.length,
      deadNodes: deadNodes.length,
      totalPulses: this.totalPulses,
      avgDrift
    };
  }
}

export { PhiResonanceSyncProtocol };
export default PhiResonanceSyncProtocol;
