/**
 * PROTO-206: Kernel Execution Protocol (KEP)
 * Autonomous kernel scheduling with phi-priority queuing.
 * 
 * Kernels are self-contained intelligence units that execute on heartbeat.
 * Priority levels: 0=CRITICAL, 1=HIGH, 2=NORMAL, 3=LOW (phi-weighted)
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const PRIORITY = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

class KernelExecutionProtocol {
  constructor() {
    this.kernels = new Map();
    this.queue = [];
    this.executionLog = [];
    this.beatNumber = 0;
    this.totalExecutions = 0;
  }

  loadKernel(config, executor) {
    const kernel = {
      id: config.id,
      name: config.name || config.id,
      priority: config.priority ?? PRIORITY.NORMAL,
      timeoutMs: config.timeoutMs || HEARTBEAT,
      runOnBeat: config.runOnBeat ?? true,
      beatInterval: config.beatInterval || 1,
      executor,
      lastRun: null,
      runCount: 0,
      totalTimeMs: 0,
      errors: [],
    };
    
    this.kernels.set(config.id, kernel);
    return config.id;
  }

  unloadKernel(id) {
    return this.kernels.delete(id);
  }

  async executeKernel(id, context = {}) {
    const kernel = this.kernels.get(id);
    if (!kernel) return { error: `Kernel not found: ${id}` };
    
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        kernel.executor(context, this.beatNumber),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Kernel timeout')), kernel.timeoutMs)
        ),
      ]);
      
      const duration = Date.now() - startTime;
      kernel.lastRun = Date.now();
      kernel.runCount++;
      kernel.totalTimeMs += duration;
      this.totalExecutions++;
      
      const logEntry = {
        kernelId: id,
        beat: this.beatNumber,
        duration,
        success: true,
        timestamp: Date.now(),
      };
      this.executionLog.push(logEntry);
      if (this.executionLog.length > 1000) this.executionLog.shift();
      
      return { success: true, result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      kernel.errors.push({ message: error.message, beat: this.beatNumber });
      if (kernel.errors.length > 100) kernel.errors.shift();
      
      return { success: false, error: error.message, duration };
    }
  }

  async beat(context = {}) {
    this.beatNumber++;
    const results = [];
    
    // Build priority queue with phi-weighted scheduling
    const scheduled = [];
    for (const [id, kernel] of this.kernels) {
      if (kernel.runOnBeat && this.beatNumber % kernel.beatInterval === 0) {
        const phiWeight = Math.pow(PHI, -kernel.priority);
        scheduled.push({ id, kernel, weight: phiWeight });
      }
    }
    
    // Sort by phi-weighted priority
    scheduled.sort((a, b) => b.weight - a.weight);
    
    // Execute in priority order
    for (const { id } of scheduled) {
      const result = await this.executeKernel(id, context);
      results.push({ kernelId: id, ...result });
    }
    
    return {
      beat: this.beatNumber,
      executed: results.length,
      results,
    };
  }

  getKernelStats() {
    const stats = [];
    for (const [id, kernel] of this.kernels) {
      stats.push({
        id,
        name: kernel.name,
        priority: kernel.priority,
        runCount: kernel.runCount,
        avgTimeMs: kernel.runCount > 0 ? kernel.totalTimeMs / kernel.runCount : 0,
        errorCount: kernel.errors.length,
      });
    }
    return stats;
  }

  getMetrics() {
    return {
      kernelCount: this.kernels.size,
      totalExecutions: this.totalExecutions,
      beatNumber: this.beatNumber,
      recentLogs: this.executionLog.slice(-20),
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { KernelExecutionProtocol, PRIORITY };
export default KernelExecutionProtocol;
