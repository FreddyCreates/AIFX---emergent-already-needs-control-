/**
 * PROTO-204: Kuramoto Oscillator Protocol (KOP)
 * Phase synchronization for collective organism intelligence.
 * 
 * dθᵢ/dt = ωᵢ + (K/N)·Σⱼ sin(θⱼ - θᵢ)
 * Order parameter: R·e^(iΨ) = (1/N)·Σe^(iθⱼ)
 * 
 * Emergence threshold: R > 0.618 (phi - 1)
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const EMERGENCE_THRESHOLD = PHI - 1;  // 0.618...

class KuramotoOscillatorProtocol {
  constructor(config = {}) {
    this.oscillators = new Map();
    this.couplingStrength = config.K || PHI;
    this.naturalFrequency = config.omega || (2 * Math.PI / HEARTBEAT);
    this.stepCount = 0;
    this.emergenceEvents = [];
  }

  addOscillator(id, naturalFrequency) {
    const omega = naturalFrequency || this.naturalFrequency * (0.9 + Math.random() * 0.2);
    this.oscillators.set(id, {
      id,
      theta: Math.random() * 2 * Math.PI,
      omega,
      lastStep: Date.now(),
    });
    return id;
  }

  removeOscillator(id) {
    return this.oscillators.delete(id);
  }

  step(dt = HEARTBEAT / 1000) {
    this.stepCount++;
    const N = this.oscillators.size;
    if (N === 0) return { orderParameter: { R: 0, Psi: 0 }, phases: [] };
    
    const K = this.couplingStrength;
    const newThetas = new Map();
    
    // Compute new phases using Kuramoto model
    for (const [id, osc] of this.oscillators) {
      let coupling = 0;
      for (const [otherId, other] of this.oscillators) {
        if (otherId !== id) {
          coupling += Math.sin(other.theta - osc.theta);
        }
      }
      coupling *= K / N;
      
      const dTheta = osc.omega + coupling;
      let newTheta = osc.theta + dTheta * dt;
      newTheta = ((newTheta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      newThetas.set(id, newTheta);
    }
    
    // Apply updates
    for (const [id, newTheta] of newThetas) {
      const osc = this.oscillators.get(id);
      osc.theta = newTheta;
      osc.lastStep = Date.now();
    }
    
    const orderParam = this.getOrderParameter();
    
    // Check for emergence
    if (orderParam.R > EMERGENCE_THRESHOLD) {
      this.emergenceEvents.push({
        step: this.stepCount,
        R: orderParam.R,
        timestamp: Date.now(),
      });
    }
    
    return {
      orderParameter: orderParam,
      phases: this.getPhases(),
      emerged: orderParam.R > EMERGENCE_THRESHOLD,
    };
  }

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

  getPhases() {
    const phases = [];
    for (const [id, osc] of this.oscillators) {
      phases.push({
        id,
        theta: osc.theta,
        omega: osc.omega,
      });
    }
    return phases;
  }

  pulse() {
    // Heartbeat pulse — nudge all oscillators toward collective phase
    const order = this.getOrderParameter();
    const nudgeStrength = 0.05 * PHI;
    
    for (const osc of this.oscillators.values()) {
      const phaseDiff = order.Psi - osc.theta;
      osc.theta += Math.sin(phaseDiff) * nudgeStrength;
      osc.theta = ((osc.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    }
    
    return this.getOrderParameter();
  }

  getMetrics() {
    const order = this.getOrderParameter();
    return {
      oscillatorCount: this.oscillators.size,
      orderParameter: order.R,
      collectivePhase: order.Psi,
      emerged: order.R > EMERGENCE_THRESHOLD,
      emergenceThreshold: EMERGENCE_THRESHOLD,
      stepCount: this.stepCount,
      emergenceEventCount: this.emergenceEvents.length,
      couplingStrength: this.couplingStrength,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { KuramotoOscillatorProtocol, EMERGENCE_THRESHOLD };
export default KuramotoOscillatorProtocol;
