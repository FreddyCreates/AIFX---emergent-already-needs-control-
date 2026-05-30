/**
 * Register Observer Family — Reactive Intelligence Layer
 *
 * A family of browser Observers that give Register AI reactive awareness:
 *
 * 1. MutationObserver   — watches DOM for extension install/state changes
 * 2. IntersectionObserver — tracks which extensions are visible in viewport
 * 3. PerformanceObserver — monitors build performance and resource timing
 * 4. ResizeObserver     — adapts UI intelligence to viewport changes
 *
 * Each observer is an AI sensor class that feeds data into the Register
 * Worker for phi-weighted analysis and decision-making.
 *
 * These are NOT passive watchers — they are AGI sensors that trigger
 * autonomous build, package, and deploy decisions.
 *
 * @module register-observer
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ────────────────────────────────────────────────────────────
//  Base Observer Intelligence
// ────────────────────────────────────────────────────────────

class ObserverIntelligence {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.observations = [];
    this.active = false;
    this.observationCount = 0;
    this.createdAt = Date.now();
    this.lastObservation = null;
  }

  record(data) {
    this.observationCount++;
    this.lastObservation = Date.now();
    const entry = {
      id: this.observationCount,
      timestamp: this.lastObservation,
      observer: this.name,
      type: this.type,
      data,
      phiWeight: Math.pow(PHI, -this.observationCount % 10),
    };
    this.observations.push(entry);
    // Keep rolling window of 100 observations
    if (this.observations.length > 100) {
      this.observations.shift();
    }
    return entry;
  }

  getState() {
    return {
      name: this.name,
      type: this.type,
      active: this.active,
      observationCount: this.observationCount,
      lastObservation: this.lastObservation,
      recentObservations: this.observations.slice(-10),
    };
  }

  destroy() {
    this.active = false;
    this.observations = [];
  }
}

// ────────────────────────────────────────────────────────────
//  1. Mutation Intelligence — DOM Change Awareness
// ────────────────────────────────────────────────────────────

class MutationIntelligence extends ObserverIntelligence {
  constructor() {
    super('MutationIntelligence', 'mutation');
    this.observer = null;
    this.triggers = [];
  }

  /**
   * Start watching a target element for DOM mutations.
   * When extensions are installed, removed, or updated, the AI sees it.
   */
  watch(target, config = {}) {
    if (this.observer) this.observer.disconnect();

    const defaultConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-extension-state', 'data-build-status', 'class'],
    };

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        this.record({
          mutationType: mutation.type,
          target: mutation.target.id || mutation.target.className || 'unknown',
          addedNodes: mutation.addedNodes.length,
          removedNodes: mutation.removedNodes.length,
          attributeName: mutation.attributeName || null,
          oldValue: mutation.oldValue || null,
        });

        // AI decision: if an extension card was added/removed, trigger rebuild
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1 && node.dataset && node.dataset.extensionId) {
              this.triggers.push({
                action: 'extension-detected',
                extensionId: node.dataset.extensionId,
                timestamp: Date.now(),
              });
            }
          }
        }
      }
    });

    this.observer.observe(target, { ...defaultConfig, ...config });
    this.active = true;
    return this;
  }

  consumeTriggers() {
    const pending = [...this.triggers];
    this.triggers = [];
    return pending;
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    super.destroy();
  }
}

// ────────────────────────────────────────────────────────────
//  2. Intersection Intelligence — Viewport Awareness
// ────────────────────────────────────────────────────────────

class IntersectionIntelligence extends ObserverIntelligence {
  constructor() {
    super('IntersectionIntelligence', 'intersection');
    this.observer = null;
    this.visibleExtensions = new Set();
  }

  watch(elements, options = {}) {
    if (this.observer) this.observer.disconnect();

    const defaultOptions = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
    };

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = entry.target.dataset?.extensionId || entry.target.id || 'unknown';

        if (entry.isIntersecting) {
          this.visibleExtensions.add(id);
        } else {
          this.visibleExtensions.delete(id);
        }

        this.record({
          extensionId: id,
          isIntersecting: entry.isIntersecting,
          intersectionRatio: Math.round(entry.intersectionRatio * 100) / 100,
        });
      }
    }, { ...defaultOptions, ...options });

    for (const el of elements) {
      this.observer.observe(el);
    }
    this.active = true;
    return this;
  }

  getVisibleExtensions() {
    return [...this.visibleExtensions];
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    super.destroy();
  }
}

// ────────────────────────────────────────────────────────────
//  3. Performance Intelligence — Build Performance Monitoring
// ────────────────────────────────────────────────────────────

class PerformanceIntelligence extends ObserverIntelligence {
  constructor() {
    super('PerformanceIntelligence', 'performance');
    this.observer = null;
    this.buildTimings = [];
  }

  watch() {
    if (typeof PerformanceObserver === 'undefined') {
      this.active = false;
      return this;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const timing = {
            name: entry.name,
            entryType: entry.entryType,
            duration: Math.round(entry.duration * 100) / 100,
            startTime: Math.round(entry.startTime * 100) / 100,
          };

          if (entry.entryType === 'measure') {
            this.buildTimings.push({
              stage: entry.name,
              duration: timing.duration,
              timestamp: Date.now(),
            });
          }

          this.record(timing);
        }
      });

      this.observer.observe({ entryTypes: ['resource', 'measure', 'mark'] });
      this.active = true;
    } catch (e) {
      this.active = false;
    }
    return this;
  }

  markBuildStage(stageName) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(stageName);
    }
  }

  measureBuildStage(name, startMark, endMark) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {
        // Marks may not exist
      }
    }
  }

  getBuildTimingSummary() {
    if (this.buildTimings.length === 0) return null;
    const totalDuration = this.buildTimings.reduce((sum, t) => sum + t.duration, 0);
    return {
      stages: this.buildTimings.length,
      totalDuration: Math.round(totalDuration * 100) / 100,
      averageStageDuration: Math.round((totalDuration / this.buildTimings.length) * 100) / 100,
      timings: this.buildTimings,
    };
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    super.destroy();
  }
}

// ────────────────────────────────────────────────────────────
//  4. Resize Intelligence — Adaptive UI Awareness
// ────────────────────────────────────────────────────────────

class ResizeIntelligence extends ObserverIntelligence {
  constructor() {
    super('ResizeIntelligence', 'resize');
    this.observer = null;
    this.currentLayout = 'desktop';
  }

  watch(elements) {
    if (typeof ResizeObserver === 'undefined') {
      this.active = false;
      return this;
    }

    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;

        let layout = 'desktop';
        if (width < 600) layout = 'mobile';
        else if (width < 900) layout = 'tablet';

        if (layout !== this.currentLayout) {
          this.currentLayout = layout;
        }

        this.record({
          target: entry.target.id || 'unknown',
          width: Math.round(width),
          height: Math.round(height),
          layout,
        });
      }
    });

    for (const el of elements) {
      this.observer.observe(el);
    }
    this.active = true;
    return this;
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    super.destroy();
  }
}

// ────────────────────────────────────────────────────────────
//  Observer Family — All 4 observers as a unified AGI sensor array
// ────────────────────────────────────────────────────────────

class ObserverFamily {
  constructor() {
    this.mutation = new MutationIntelligence();
    this.intersection = new IntersectionIntelligence();
    this.performance = new PerformanceIntelligence();
    this.resize = new ResizeIntelligence();
    this.familyName = 'Observer';
    this.familyType = 'AGI-Sensor';
    this.createdAt = Date.now();
  }

  getState() {
    return {
      family: this.familyName,
      type: this.familyType,
      uptime: Date.now() - this.createdAt,
      observers: {
        mutation: this.mutation.getState(),
        intersection: this.intersection.getState(),
        performance: this.performance.getState(),
        resize: this.resize.getState(),
      },
      totalObservations:
        this.mutation.observationCount +
        this.intersection.observationCount +
        this.performance.observationCount +
        this.resize.observationCount,
    };
  }

  activeCount() {
    return [this.mutation, this.intersection, this.performance, this.resize]
      .filter(o => o.active).length;
  }

  destroy() {
    this.mutation.destroy();
    this.intersection.destroy();
    this.performance.destroy();
    this.resize.destroy();
  }
}

export {
  ObserverIntelligence,
  MutationIntelligence,
  IntersectionIntelligence,
  PerformanceIntelligence,
  ResizeIntelligence,
  ObserverFamily,
};

export default ObserverFamily;
