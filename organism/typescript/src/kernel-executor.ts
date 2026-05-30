import type {
  KernelConfig,
  KernelFunction,
  KernelRecord,
  KernelStatus,
  StateSnapshot,
} from './types.js';
import type { Heartbeat } from './heartbeat.js';

export class KernelExecutor {
  private readonly kernels: Map<string, KernelRecord> = new Map();
  private readonly beatSubscriptions: Map<string, () => void> = new Map();

  constructor(private readonly heartbeat: Heartbeat) {}

  loadKernel<T = unknown>(config: KernelConfig, fn: KernelFunction<T>): void {
    if (this.kernels.has(config.id)) {
      throw new Error(`Kernel already loaded: ${config.id}`);
    }

    const record: KernelRecord<T> = {
      config,
      fn,
      status: 'idle',
      lastResult: null,
      lastError: null,
      executionCount: 0,
      totalExecutionMs: 0,
    };

    this.kernels.set(config.id, record as KernelRecord);

    if (config.runOnBeat) {
      this.schedule(config.id, config.beatInterval);
    }
  }

  async execute<T = unknown>(kernelId: string, state: StateSnapshot, beatNumber: number): Promise<T> {
    const record = this.kernels.get(kernelId);
    if (!record) {
      throw new Error(`Kernel not found: ${kernelId}`);
    }

    const kernel = record as KernelRecord<T>;
    kernel.status = 'running';
    const startMs = performance.now();

    try {
      const result = await Promise.race<T>([
        kernel.fn(state, beatNumber),
        new Promise<never>((_resolve, reject) =>
          setTimeout(() => reject(new Error(`Kernel timeout: ${kernelId}`)), kernel.config.timeoutMs)
        ),
      ]);

      const elapsed = performance.now() - startMs;
      kernel.status = 'completed';
      kernel.lastResult = result;
      kernel.lastError = null;
      kernel.executionCount++;
      kernel.totalExecutionMs += elapsed;

      return result;
    } catch (err) {
      const elapsed = performance.now() - startMs;
      kernel.totalExecutionMs += elapsed;

      if (err instanceof Error && err.message.startsWith('Kernel timeout:')) {
        kernel.status = 'timeout';
        kernel.lastError = err.message;
      } else {
        kernel.status = 'error';
        kernel.lastError = err instanceof Error ? err.message : String(err);
      }

      throw err;
    }
  }

  schedule(kernelId: string, beatInterval: number): void {
    // Clean up existing subscription
    const existing = this.beatSubscriptions.get(kernelId);
    if (existing) {
      existing();
    }

    const unsubscribe = this.heartbeat.onBeat((payload) => {
      if (payload.beatNumber % beatInterval === 0) {
        void this.execute(kernelId, payload.state, payload.beatNumber).catch(() => {
          // Scheduled kernel errors are captured in the kernel record
        });
      }
    });

    this.beatSubscriptions.set(kernelId, unsubscribe);
  }

  getKernelStatus(kernelId: string): KernelStatus | null {
    return this.kernels.get(kernelId)?.status ?? null;
  }

  listKernels(): ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly status: KernelStatus;
    readonly executionCount: number;
    readonly avgExecutionMs: number;
  }> {
    return Array.from(this.kernels.values()).map((k) => ({
      id: k.config.id,
      name: k.config.name,
      status: k.status,
      executionCount: k.executionCount,
      avgExecutionMs:
        k.executionCount > 0 ? k.totalExecutionMs / k.executionCount : 0,
    }));
  }

  unloadKernel(kernelId: string): boolean {
    const sub = this.beatSubscriptions.get(kernelId);
    if (sub) {
      sub();
      this.beatSubscriptions.delete(kernelId);
    }
    return this.kernels.delete(kernelId);
  }
}
