import type { BeatCallback, BeatPayload, Unsubscribe } from './types.js';
import { HEARTBEAT_MS, PHI, GOLDEN_ANGLE } from './types.js';
import type { OrganismState } from './organism-state.js';

export class Heartbeat {
  static readonly INTERVAL_MS = HEARTBEAT_MS;

  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly callbacks: Set<BeatCallback> = new Set();
  private beatCount = 0;
  private startTime = 0;

  constructor(private readonly state: OrganismState) {}

  start(): void {
    if (this.timer !== null) return;
    this.startTime = Date.now();

    this.timer = setInterval(() => {
      void this.pulse();
    }, Heartbeat.INTERVAL_MS);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onBeat(callback: BeatCallback): Unsubscribe {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  getBeatCount(): number {
    return this.beatCount;
  }

  getUptime(): number {
    if (this.startTime === 0) return 0;
    return Date.now() - this.startTime;
  }

  isAlive(): boolean {
    return this.timer !== null;
  }

  private async pulse(): Promise<void> {
    this.beatCount++;
    this.state.incrementBeat();

    // phi-encoded phase: beat number modulated through golden angle
    const phiPhase = (this.beatCount * GOLDEN_ANGLE) % 360;

    const payload: BeatPayload = {
      beatNumber: this.beatCount,
      timestamp: Date.now(),
      intervalMs: Heartbeat.INTERVAL_MS,
      phiPhase,
      state: this.state.snapshot(),
    };

    // Update somatic register with runtime metrics
    const cpuLoad = Math.sin(this.beatCount / PHI) * 0.1 + 0.15;
    const memPressure = Math.cos(this.beatCount / (PHI * PHI)) * 0.05 + 0.2;

    this.state.setRegister('somatic', {
      cpu_load: Math.max(0, Math.min(1, cpuLoad)),
      memory_pressure: Math.max(0, Math.min(1, memPressure)),
      io_throughput: Math.random() * 0.1,
      network_latency: Math.random() * 50,
    });

    const promises: Array<void | Promise<void>> = [];
    for (const cb of this.callbacks) {
      try {
        promises.push(cb(payload));
      } catch {
        // Callbacks must not crash the heartbeat
      }
    }
    await Promise.allSettled(promises);
  }
}
