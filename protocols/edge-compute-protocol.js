/**
 * PROTO-224: Edge Compute Protocol (ECP)
 * Cloudflare Workers / edge orchestration for the Sovereign Organism.
 *
 * Manages the organism's edge compute layer: deploys intelligence to the
 * edge, routes requests using phi-weighted latency scoring, tracks worker
 * health across regions, and provides a live edge mesh for sub-50ms
 * intelligence delivery.
 *
 * Edge architecture:
 *   ORIGIN (ICP/GitHub) → EDGE WORKERS (CF) → END USERS
 *
 * Worker types:
 *   ROUTER    — routes requests to the best origin or cache
 *   GATEWAY   — API gateway with auth and rate limiting
 *   CACHE     — intelligent response caching with TTL
 *   TRANSFORM — on-the-fly data transformation at the edge
 *   SENTINEL  — edge-level security and threat detection
 *
 * @module protocols/edge-compute-protocol
 * @version 1.0.0
 */

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

let _workerSeq = 0;

const WORKER_TYPES = {
  ROUTER:    'router',
  GATEWAY:   'gateway',
  CACHE:     'cache',
  TRANSFORM: 'transform',
  SENTINEL:  'sentinel',
};

const WORKER_STATES = {
  DEPLOYING: 'deploying',
  ACTIVE:    'active',
  DEGRADED:  'degraded',
  OFFLINE:   'offline',
  DRAINING:  'draining',
};

// Major Cloudflare edge regions
const EDGE_REGIONS = [
  'DFW', 'LAX', 'SEA', 'ORD', 'EWR', 'MIA',  // North America
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD',           // Europe
  'NRT', 'HKG', 'SIN', 'SYD',                  // Asia-Pacific
  'GRU', 'BOG',                                 // Latin America
];

class EdgeWorker {
  constructor({ id, type, name, routes = [], region = null }) {
    this.id      = id || `worker-${Date.now().toString(36)}-${++_workerSeq}`;
    this.type    = type || WORKER_TYPES.ROUTER;
    this.name    = name || this.id;
    this.routes  = routes;    // URL patterns this worker handles
    this.region  = region;    // null = global
    this.state   = WORKER_STATES.DEPLOYING;

    // Performance metrics
    this.metrics = {
      requests:     0,
      errors:       0,
      avgLatencyMs: 0,
      p99LatencyMs: 0,
      cpuMs:        0,
      cacheHitRate: 0,
    };

    // Phi-weighted health score
    this.health = 100;
    this.deployedAt = null;
    this.lastSeen   = null;

    this._latencySamples = [];
  }

  /** Record a request through this worker */
  recordRequest({ latencyMs, error = false, cacheHit = false, cpuMs = 0 }) {
    this.metrics.requests++;
    this.lastSeen = Date.now();

    if (error) {
      this.metrics.errors++;
      this.health = Math.max(0, this.health - 5);
    } else {
      // Exponential moving average of latency
      this.metrics.avgLatencyMs = this.metrics.avgLatencyMs === 0
        ? latencyMs
        : PHI_INV * this.metrics.avgLatencyMs + (1 - PHI_INV) * latencyMs;

      // Track p99
      this._latencySamples.push(latencyMs);
      if (this._latencySamples.length > 100) this._latencySamples.shift();
      const sorted = [...this._latencySamples].sort((a, b) => a - b);
      this.metrics.p99LatencyMs = sorted[Math.floor(sorted.length * 0.99)] || 0;

      // CPU
      this.metrics.cpuMs = PHI_INV * this.metrics.cpuMs + (1 - PHI_INV) * cpuMs;

      // Cache hit rate
      if (cacheHit) {
        const totalHits = this.metrics.cacheHitRate * (this.metrics.requests - 1) + 1;
        this.metrics.cacheHitRate = totalHits / this.metrics.requests;
      }

      // Health recovery
      this.health = Math.min(100, this.health + 0.1);
    }

    // Update state based on health
    if (this.health < 30)      this.state = WORKER_STATES.DEGRADED;
    else if (this.health >= 70) this.state = WORKER_STATES.ACTIVE;
  }

  /** Deploy this worker (transition to ACTIVE) */
  deploy() {
    this.state = WORKER_STATES.ACTIVE;
    this.deployedAt = Date.now();
  }

  /** Mark worker as degraded */
  degrade() {
    this.state = WORKER_STATES.DEGRADED;
  }

  /** Take worker offline */
  offline() {
    this.state = WORKER_STATES.OFFLINE;
  }

  /** Drain worker (stop accepting new requests) */
  drain() {
    this.state = WORKER_STATES.DRAINING;
  }

  /** Recalculate health based on error rate */
  updateHealth() {
    if (this.metrics.requests > 0) {
      const errorRate = this.metrics.errors / this.metrics.requests;
      this.health = Math.max(0, 100 - errorRate * 100);
    }
  }

  /** Return current metrics snapshot */
  getMetrics() {
    return { ...this.metrics };
  }

  getState() {
    return {
      id:      this.id,
      name:    this.name,
      type:    this.type,
      region:  this.region,
      state:   this.state,
      health:  this.health,
      routes:  this.routes,
      metrics: { ...this.metrics },
      uptime:  this.deployedAt ? Date.now() - this.deployedAt : 0,
    };
  }
}

class EdgeComputeProtocol {
  constructor(config = {}) {
    this.workers  = new Map();
    this.routes   = new Map();  // route pattern → [worker ids]
    this.regions  = new Map(EDGE_REGIONS.map(r => [r, []]));
    this.ticks    = 0;

    // Global edge metrics
    this.globalMetrics = {
      totalRequests:  0,
      totalErrors:    0,
      avgGlobalLatency: 0,
      activeWorkers:  0,
      deployedRegions: 0,
    };
  }

  // ── Worker Management ──────────────────────────────────────────────────

  /**
   * Register an edge worker
   */
  deployWorker(config) {
    const worker = new EdgeWorker(config);
    worker.state      = WORKER_STATES.ACTIVE;
    worker.deployedAt = Date.now();
    this.workers.set(worker.id, worker);

    // Register routes
    for (const route of worker.routes) {
      if (!this.routes.has(route)) this.routes.set(route, []);
      this.routes.get(route).push(worker.id);
    }

    this.globalMetrics.activeWorkers++;
    return worker;
  }

  /**
   * Retire a worker gracefully
   */
  drainWorker(workerId) {
    const worker = this.workers.get(workerId);
    if (!worker) return false;
    worker.state = WORKER_STATES.DRAINING;

    // Remove from routes
    for (const [route, ids] of this.routes) {
      const filtered = ids.filter(id => id !== workerId);
      if (filtered.length > 0) this.routes.set(route, filtered);
      else this.routes.delete(route);
    }

    setTimeout(() => {
      worker.state = WORKER_STATES.OFFLINE;
      this.globalMetrics.activeWorkers = Math.max(0, this.globalMetrics.activeWorkers - 1);
    }, 5000);

    return true;
  }

  // ── Routing ────────────────────────────────────────────────────────────

  /**
   * Route a request to the best available worker using phi-weighted scoring
   * Score = health * φ + (1/latency) * φ⁻¹
   */
  route(url, region = null) {
    // Find matching routes
    const matchingWorkerIds = new Set();
    for (const [pattern, ids] of this.routes) {
      if (this._matchRoute(url, pattern)) {
        ids.forEach(id => matchingWorkerIds.add(id));
      }
    }

    if (matchingWorkerIds.size === 0) return null;

    // Score available workers
    const candidates = Array.from(matchingWorkerIds)
      .map(id => this.workers.get(id))
      .filter(w => w && w.state === WORKER_STATES.ACTIVE)
      .filter(w => !region || !w.region || w.region === region);

    if (candidates.length === 0) return null;

    const scored = candidates.map(w => {
      const latencyScore = w.metrics.avgLatencyMs > 0 ? 1000 / w.metrics.avgLatencyMs : 1;
      const score = (w.health / 100) * PHI + latencyScore * PHI_INV;
      return { worker: w, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].worker;
  }

  _matchRoute(url, pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(url);
  }

  // ── Traffic Simulation & Recording ────────────────────────────────────

  /**
   * Record that a request was handled by a worker
   */
  recordRequest(workerId, metrics = {}) {
    const worker = this.workers.get(workerId);
    if (!worker) return;
    worker.recordRequest(metrics);

    this.globalMetrics.totalRequests++;
    if (metrics.error) this.globalMetrics.totalErrors++;
    this.globalMetrics.avgGlobalLatency = this.globalMetrics.totalRequests > 1
      ? PHI_INV * this.globalMetrics.avgGlobalLatency + (1 - PHI_INV) * (metrics.latencyMs || 0)
      : metrics.latencyMs || 0;
  }

  // ── Health & Monitoring ────────────────────────────────────────────────

  /**
   * Get health summary across all workers
   */
  getHealthSummary() {
    const workers = Array.from(this.workers.values());
    const active  = workers.filter(w => w.state === WORKER_STATES.ACTIVE);
    const avgHealth = workers.length > 0
      ? workers.reduce((s, w) => s + w.health, 0) / workers.length
      : 0;

    return {
      totalWorkers:  workers.length,
      activeWorkers: active.length,
      avgHealth:     parseFloat(avgHealth.toFixed(1)),
      byRegion: EDGE_REGIONS.map(r => ({
        region: r,
        workers: workers.filter(w => w.region === r || !w.region).length,
      })),
    };
  }

  /**
   * Tick — updates global metrics and checks worker health
   */
  tick() {
    this.ticks++;
    this.globalMetrics.activeWorkers = Array.from(this.workers.values())
      .filter(w => w.state === WORKER_STATES.ACTIVE).length;
    this.globalMetrics.deployedRegions = new Set(
      Array.from(this.workers.values()).map(w => w.region).filter(Boolean)
    ).size;
  }

  /** Get a worker by id */
  getWorker(id) {
    return this.workers.get(id);
  }

  /** Get all healthy (ACTIVE) workers */
  getHealthyWorkers() {
    return Array.from(this.workers.values())
      .filter(w => w.state === WORKER_STATES.ACTIVE);
  }

  /** Get workers deployed to a specific region */
  getRegionWorkers(region) {
    return Array.from(this.workers.values())
      .filter(w => w.region === region);
  }

  /** Route a request object { path, method } to the best worker */
  routeRequest(request) {
    return this.route(request.path);
  }

  /** Get global metrics summary */
  getMetrics() {
    return {
      ...this.globalMetrics,
      totalWorkers: this.workers.size,
      workerCount:  this.workers.size,
    };
  }

  getState() {
    const workers = {};
    for (const [id, worker] of this.workers) {
      workers[id] = worker.getState();
    }
    return {
      ticks:         this.ticks,
      globalMetrics: { ...this.globalMetrics },
      workerCount:   this.workers.size,
      routeCount:    this.routes.size,
      workers,
      health:        this.getHealthSummary(),
    };
  }
}

export { EdgeComputeProtocol, EdgeWorker, WORKER_TYPES, WORKER_STATES, EDGE_REGIONS };
export default EdgeComputeProtocol;
