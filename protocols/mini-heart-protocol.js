/**
 * PROTO-209: Mini-Heart Protocol (MHP)
 * Self-monitoring vitals for each Worker AI. Health score 0-100.
 * 
 * Every worker gets a MiniHeart that beats on the 873ms heartbeat,
 * monitors vitals, and reports health status.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const VITAL_TYPES = ['cpu', 'memory', 'latency', 'throughput', 'errors', 'uptime'];

class MiniHeartProtocol {
  constructor(workerId) {
    this.workerId = workerId;
    this.beatCount = 0;
    this.startTime = Date.now();
    this.lastBeat = null;
    this.vitals = {
      cpu: 0.5,
      memory: 0.5,
      latency: 50,
      throughput: 100,
      errors: 0,
      uptime: 0,
    };
    this.healthScore = 100;
    this.alarms = [];
    this.history = [];
  }

  beat() {
    this.beatCount++;
    this.lastBeat = Date.now();
    this.vitals.uptime = (Date.now() - this.startTime) / 1000;
    
    // Calculate health score (phi-weighted)
    const cpuHealth = Math.max(0, 1 - this.vitals.cpu) * 30;
    const memHealth = Math.max(0, 1 - this.vitals.memory) * 25;
    const latencyHealth = Math.max(0, 1 - this.vitals.latency / 1000) * 20;
    const errorHealth = Math.max(0, 1 - this.vitals.errors / 100) * 15;
    const throughputHealth = Math.min(1, this.vitals.throughput / 100) * 10;
    
    this.healthScore = Math.round(cpuHealth + memHealth + latencyHealth + errorHealth + throughputHealth);
    
    // Check thresholds and raise alarms
    this.checkAlarms();
    
    // Record history
    this.history.push({
      beat: this.beatCount,
      health: this.healthScore,
      timestamp: this.lastBeat,
    });
    if (this.history.length > 100) this.history.shift();
    
    return {
      beat: this.beatCount,
      health: this.healthScore,
      vitals: { ...this.vitals },
      alarms: this.alarms.length,
    };
  }

  checkAlarms() {
    const newAlarms = [];
    
    if (this.vitals.cpu > 0.9) {
      newAlarms.push({ type: 'cpu', severity: 'critical', value: this.vitals.cpu });
    } else if (this.vitals.cpu > 0.7) {
      newAlarms.push({ type: 'cpu', severity: 'warning', value: this.vitals.cpu });
    }
    
    if (this.vitals.memory > 0.9) {
      newAlarms.push({ type: 'memory', severity: 'critical', value: this.vitals.memory });
    } else if (this.vitals.memory > 0.8) {
      newAlarms.push({ type: 'memory', severity: 'warning', value: this.vitals.memory });
    }
    
    if (this.vitals.latency > 500) {
      newAlarms.push({ type: 'latency', severity: 'critical', value: this.vitals.latency });
    } else if (this.vitals.latency > 200) {
      newAlarms.push({ type: 'latency', severity: 'warning', value: this.vitals.latency });
    }
    
    if (this.healthScore < 30) {
      newAlarms.push({ type: 'health', severity: 'critical', value: this.healthScore });
    } else if (this.healthScore < 50) {
      newAlarms.push({ type: 'health', severity: 'warning', value: this.healthScore });
    }
    
    this.alarms = newAlarms;
  }

  updateVital(type, value) {
    if (VITAL_TYPES.includes(type)) {
      this.vitals[type] = value;
    }
  }

  recordError() {
    this.vitals.errors++;
  }

  getStatus() {
    const statusLevel = 
      this.healthScore >= 80 ? 'healthy' :
      this.healthScore >= 50 ? 'degraded' :
      this.healthScore >= 30 ? 'unhealthy' :
      'critical';
    
    return {
      workerId: this.workerId,
      status: statusLevel,
      health: this.healthScore,
      vitals: { ...this.vitals },
      beatCount: this.beatCount,
      uptime: this.vitals.uptime,
      alarms: [...this.alarms],
      lastBeat: this.lastBeat,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }

  getHistory(limit = 50) {
    return this.history.slice(-limit);
  }
}

export { MiniHeartProtocol, VITAL_TYPES };
export default MiniHeartProtocol;
