/**
 * CENTERFOLD OBSERVABILITY LAYER
 *
 * Tracks cycle-level metrics, emits lifecycle events, and summarizes health.
 */

class CenterfoldObservability {
  constructor(options = {}) {
    this.events = [];
    this.eventLimit = Math.max(100, options.eventLimit || 10000);
    this.handlers = new Map();
    this.metrics = {
      cycles: 0,
      failures: 0,
      lastDurationMs: 0,
      avgDurationMs: 0,
      maxDurationMs: 0,
    };
    this.totalDurationMs = 0;
  }

  on(eventName, handler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName).push(handler);
    return () => {
      const list = this.handlers.get(eventName) || [];
      const index = list.indexOf(handler);
      if (index >= 0) list.splice(index, 1);
    };
  }

  emit(eventName, payload = {}) {
    const event = {
      eventName,
      payload,
      timestamp: Date.now(),
    };

    this.events.push(event);
    if (this.events.length > this.eventLimit) {
      this.events = this.events.slice(-this.eventLimit);
    }

    const handlers = this.handlers.get(eventName) || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        // swallow handler errors to protect cycle runtime
      }
    }

    return event;
  }

  markCycle(durationMs, status = 'ok') {
    this.metrics.cycles += 1;
    if (status !== 'ok') {
      this.metrics.failures += 1;
    }

    this.metrics.lastDurationMs = durationMs;
    this.totalDurationMs += durationMs;
    this.metrics.avgDurationMs = this.totalDurationMs / this.metrics.cycles;
    this.metrics.maxDurationMs = Math.max(this.metrics.maxDurationMs, durationMs);
  }

  getMetrics() {
    const failureRate = this.metrics.cycles > 0
      ? this.metrics.failures / this.metrics.cycles
      : 0;

    return {
      ...this.metrics,
      failureRate,
      health: failureRate < 0.01 ? 'excellent' : failureRate < 0.05 ? 'stable' : 'degraded',
    };
  }

  recentEvents(limit = 100) {
    return this.events.slice(-Math.max(1, limit));
  }

  reset() {
    this.events = [];
    this.handlers.clear();
    this.metrics = {
      cycles: 0,
      failures: 0,
      lastDurationMs: 0,
      avgDurationMs: 0,
      maxDurationMs: 0,
    };
    this.totalDurationMs = 0;
  }
}

export { CenterfoldObservability };
export default CenterfoldObservability;
