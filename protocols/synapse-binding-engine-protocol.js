/**
 * PROTO-208: Synapse Binding Engine Protocol (SBEP)
 * Permanent imprints that survive upgrades. 5 job types, priority queue, 7 failure classes.
 * 
 * Job Types: BIND, SYNC, HEAL, VERIFY, TERMINATE
 * Priority: 0=CRITICAL, 1=HIGH, 2=NORMAL, 3=LOW
 * Failure Classes: TRANSIENT, PERMANENT, PARTIAL, TIMEOUT, RESOURCE, CONFLICT, UNKNOWN
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const JOB_TYPES = ['BIND', 'SYNC', 'HEAL', 'VERIFY', 'TERMINATE'];
const PRIORITY_LEVELS = { CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
const FAILURE_CLASSES = ['TRANSIENT', 'PERMANENT', 'PARTIAL', 'TIMEOUT', 'RESOURCE', 'CONFLICT', 'UNKNOWN'];

const RECOVERY_BOUNDS = {
  TRANSIENT: { retries: 3, backoffMs: HEARTBEAT },
  PERMANENT: { retries: 0, backoffMs: 0 },
  PARTIAL: { retries: 5, backoffMs: HEARTBEAT * PHI },
  TIMEOUT: { retries: 2, backoffMs: HEARTBEAT * 2 },
  RESOURCE: { retries: 3, backoffMs: HEARTBEAT * PHI * PHI },
  CONFLICT: { retries: 1, backoffMs: HEARTBEAT },
  UNKNOWN: { retries: 1, backoffMs: HEARTBEAT * PHI },
};

class SynapseBindingEngineProtocol {
  constructor() {
    this.imprints = new Map();
    this.jobQueue = [];
    this.completedJobs = [];
    this.failedJobs = [];
    this.totalJobs = 0;
  }

  createImprint(id, data) {
    const imprint = {
      id,
      data,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      bindings: [],
      phiSignature: this.computeSignature(data),
      persistent: true,
    };
    
    this.imprints.set(id, imprint);
    return imprint;
  }

  computeSignature(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return (Math.abs(hash) % 1000000) * PHI / 1000000;
  }

  scheduleJob(type, target, payload, priority = PRIORITY_LEVELS.NORMAL) {
    if (!JOB_TYPES.includes(type)) {
      throw new Error(`Invalid job type: ${type}`);
    }
    
    const job = {
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      target,
      payload,
      priority,
      status: 'queued',
      retries: 0,
      createdAt: Date.now(),
      scheduledAt: null,
      completedAt: null,
      failureClass: null,
    };
    
    // Insert in priority order (phi-weighted)
    const phiWeight = Math.pow(PHI, -priority);
    let inserted = false;
    for (let i = 0; i < this.jobQueue.length; i++) {
      const existingWeight = Math.pow(PHI, -this.jobQueue[i].priority);
      if (phiWeight > existingWeight) {
        this.jobQueue.splice(i, 0, job);
        inserted = true;
        break;
      }
    }
    if (!inserted) this.jobQueue.push(job);
    
    this.totalJobs++;
    return job.id;
  }

  async processNext() {
    if (this.jobQueue.length === 0) return null;
    
    const job = this.jobQueue.shift();
    job.status = 'processing';
    job.scheduledAt = Date.now();
    
    try {
      const result = await this.executeJob(job);
      job.status = 'completed';
      job.completedAt = Date.now();
      this.completedJobs.push(job);
      if (this.completedJobs.length > 1000) this.completedJobs.shift();
      
      return { success: true, job, result };
    } catch (error) {
      const failureClass = this.classifyFailure(error);
      job.failureClass = failureClass;
      
      const bounds = RECOVERY_BOUNDS[failureClass];
      if (job.retries < bounds.retries) {
        job.retries++;
        job.status = 'retry_scheduled';
        // Re-queue with backoff
        setTimeout(() => {
          job.status = 'queued';
          this.jobQueue.push(job);
        }, bounds.backoffMs);
      } else {
        job.status = 'failed';
        this.failedJobs.push(job);
        if (this.failedJobs.length > 100) this.failedJobs.shift();
      }
      
      return { success: false, job, error: error.message, failureClass };
    }
  }

  async executeJob(job) {
    switch (job.type) {
      case 'BIND':
        return this.executeBind(job);
      case 'SYNC':
        return this.executeSync(job);
      case 'HEAL':
        return this.executeHeal(job);
      case 'VERIFY':
        return this.executeVerify(job);
      case 'TERMINATE':
        return this.executeTerminate(job);
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  executeBind(job) {
    const imprint = this.imprints.get(job.target);
    if (!imprint) throw new Error(`Imprint not found: ${job.target}`);
    
    imprint.bindings.push({
      ...job.payload,
      boundAt: Date.now(),
    });
    imprint.updatedAt = Date.now();
    imprint.version++;
    
    return { bound: true, bindingCount: imprint.bindings.length };
  }

  executeSync(job) {
    const imprint = this.imprints.get(job.target);
    if (!imprint) throw new Error(`Imprint not found: ${job.target}`);
    
    // Verify signature integrity
    const currentSig = this.computeSignature(imprint.data);
    const drift = Math.abs(currentSig - imprint.phiSignature);
    
    return { synced: true, drift, integrity: drift < 0.01 };
  }

  executeHeal(job) {
    const imprint = this.imprints.get(job.target);
    if (!imprint) throw new Error(`Imprint not found: ${job.target}`);
    
    // Recalculate phi signature
    imprint.phiSignature = this.computeSignature(imprint.data);
    imprint.updatedAt = Date.now();
    
    return { healed: true, newSignature: imprint.phiSignature };
  }

  executeVerify(job) {
    const imprint = this.imprints.get(job.target);
    if (!imprint) throw new Error(`Imprint not found: ${job.target}`);
    
    const expectedSig = this.computeSignature(imprint.data);
    const valid = Math.abs(expectedSig - imprint.phiSignature) < 0.001;
    
    return { verified: true, valid, signature: imprint.phiSignature };
  }

  executeTerminate(job) {
    const deleted = this.imprints.delete(job.target);
    return { terminated: deleted };
  }

  classifyFailure(error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('timeout')) return 'TIMEOUT';
    if (msg.includes('resource') || msg.includes('memory')) return 'RESOURCE';
    if (msg.includes('conflict') || msg.includes('lock')) return 'CONFLICT';
    if (msg.includes('not found') || msg.includes('invalid')) return 'PERMANENT';
    if (msg.includes('partial')) return 'PARTIAL';
    if (msg.includes('retry') || msg.includes('temporary')) return 'TRANSIENT';
    return 'UNKNOWN';
  }

  getMetrics() {
    return {
      imprintCount: this.imprints.size,
      queueLength: this.jobQueue.length,
      completedCount: this.completedJobs.length,
      failedCount: this.failedJobs.length,
      totalJobs: this.totalJobs,
      jobTypes: JOB_TYPES,
      failureClasses: FAILURE_CLASSES,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { SynapseBindingEngineProtocol, JOB_TYPES, PRIORITY_LEVELS, FAILURE_CLASSES, RECOVERY_BOUNDS };
export default SynapseBindingEngineProtocol;
