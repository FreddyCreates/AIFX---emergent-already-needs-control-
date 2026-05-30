/**
 * PROTO-211: Neuro-Emergence Protocol (NEP)
 * Phase coupling, collective synchrony, cascade triggers when emergence > 0.618
 * 
 * Monitors multiple workers for collective emergence patterns.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const EMERGENCE_THRESHOLD = PHI - 1;  // 0.618...
const CASCADE_THRESHOLD = 0.8;

class NeuroEmergenceProtocol {
  constructor() {
    this.workers = new Map();
    this.couplings = new Map();
    this.emergenceLevel = 0;
    this.cascadeEvents = [];
    this.collectivePhase = 0;
    this.beatCount = 0;
  }

  registerWorker(workerId, phase = null) {
    this.workers.set(workerId, {
      id: workerId,
      phase: phase ?? Math.random() * 2 * Math.PI,
      activity: 0.5,
      lastUpdate: Date.now(),
    });
    return workerId;
  }

  unregisterWorker(workerId) {
    this.workers.delete(workerId);
    // Remove couplings
    for (const key of this.couplings.keys()) {
      if (key.includes(workerId)) {
        this.couplings.delete(key);
      }
    }
  }

  couple(worker1, worker2, strength = PHI - 1) {
    const key = [worker1, worker2].sort().join('<->');
    this.couplings.set(key, {
      workers: [worker1, worker2],
      strength,
      coherence: 0,
    });
    return key;
  }

  updateActivity(workerId, activity) {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.activity = Math.max(0, Math.min(1, activity));
      worker.lastUpdate = Date.now();
    }
  }

  step(dt = HEARTBEAT / 1000) {
    this.beatCount++;
    
    // Update phases based on coupling
    for (const [key, coupling] of this.couplings) {
      const [id1, id2] = coupling.workers;
      const w1 = this.workers.get(id1);
      const w2 = this.workers.get(id2);
      if (!w1 || !w2) continue;
      
      // Kuramoto-style coupling
      const phaseDiff = w2.phase - w1.phase;
      const couplingForce = coupling.strength * Math.sin(phaseDiff);
      
      w1.phase += couplingForce * dt * w1.activity;
      w2.phase -= couplingForce * dt * w2.activity;
      
      // Wrap phases
      w1.phase = ((w1.phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      w2.phase = ((w2.phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      
      // Update coupling coherence
      coupling.coherence = Math.cos(phaseDiff);
    }
    
    // Calculate collective emergence
    this.calculateEmergence();
    
    // Check for cascade
    if (this.emergenceLevel > CASCADE_THRESHOLD) {
      this.triggerCascade();
    }
    
    return {
      beat: this.beatCount,
      emergence: this.emergenceLevel,
      emerged: this.emergenceLevel > EMERGENCE_THRESHOLD,
      collectivePhase: this.collectivePhase,
    };
  }

  calculateEmergence() {
    const N = this.workers.size;
    if (N === 0) {
      this.emergenceLevel = 0;
      this.collectivePhase = 0;
      return;
    }
    
    // Order parameter (synchronization measure)
    let sumCos = 0;
    let sumSin = 0;
    let sumActivity = 0;
    
    for (const worker of this.workers.values()) {
      sumCos += Math.cos(worker.phase) * worker.activity;
      sumSin += Math.sin(worker.phase) * worker.activity;
      sumActivity += worker.activity;
    }
    
    const avgActivity = sumActivity / N;
    sumCos /= N;
    sumSin /= N;
    
    const R = Math.sqrt(sumCos * sumCos + sumSin * sumSin);
    this.collectivePhase = Math.atan2(sumSin, sumCos);
    
    // Emergence = synchronization × average activity
    this.emergenceLevel = R * avgActivity;
  }

  triggerCascade() {
    const cascade = {
      beat: this.beatCount,
      emergence: this.emergenceLevel,
      collectivePhase: this.collectivePhase,
      workerCount: this.workers.size,
      timestamp: Date.now(),
    };
    
    this.cascadeEvents.push(cascade);
    if (this.cascadeEvents.length > 100) this.cascadeEvents.shift();
    
    // Boost all worker activities during cascade
    for (const worker of this.workers.values()) {
      worker.activity = Math.min(1, worker.activity * PHI);
    }
    
    return cascade;
  }

  getState() {
    const workers = [];
    for (const [id, w] of this.workers) {
      workers.push({
        id,
        phase: w.phase,
        activity: w.activity,
      });
    }
    
    const couplings = [];
    for (const [key, c] of this.couplings) {
      couplings.push({
        key,
        workers: c.workers,
        strength: c.strength,
        coherence: c.coherence,
      });
    }
    
    return {
      workers,
      couplings,
      emergenceLevel: this.emergenceLevel,
      emerged: this.emergenceLevel > EMERGENCE_THRESHOLD,
      collectivePhase: this.collectivePhase,
      cascadeCount: this.cascadeEvents.length,
      recentCascades: this.cascadeEvents.slice(-5),
      thresholds: {
        emergence: EMERGENCE_THRESHOLD,
        cascade: CASCADE_THRESHOLD,
      },
      beatCount: this.beatCount,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { NeuroEmergenceProtocol, EMERGENCE_THRESHOLD, CASCADE_THRESHOLD };
export default NeuroEmergenceProtocol;
