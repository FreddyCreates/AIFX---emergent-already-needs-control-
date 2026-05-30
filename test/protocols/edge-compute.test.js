const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('EdgeComputeProtocol', () => {
  let EdgeWorker, EdgeComputeProtocol, WORKER_TYPES, WORKER_STATES, EDGE_REGIONS;
  let protocol;
  const PHI = 1.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/edge-compute-protocol.js');
    EdgeWorker = module.EdgeWorker;
    EdgeComputeProtocol = module.EdgeComputeProtocol;
    WORKER_TYPES = module.WORKER_TYPES;
    WORKER_STATES = module.WORKER_STATES;
    EDGE_REGIONS = module.EDGE_REGIONS;
    protocol = new EdgeComputeProtocol();
  });

  describe('WORKER_TYPES constant', () => {
    it('should define ROUTER type', () => {
      assert.equal(WORKER_TYPES.ROUTER, 'router');
    });

    it('should define GATEWAY type', () => {
      assert.equal(WORKER_TYPES.GATEWAY, 'gateway');
    });

    it('should define CACHE type', () => {
      assert.equal(WORKER_TYPES.CACHE, 'cache');
    });

    it('should define TRANSFORM type', () => {
      assert.equal(WORKER_TYPES.TRANSFORM, 'transform');
    });

    it('should define SENTINEL type', () => {
      assert.equal(WORKER_TYPES.SENTINEL, 'sentinel');
    });
  });

  describe('WORKER_STATES constant', () => {
    it('should define DEPLOYING state', () => {
      assert.equal(WORKER_STATES.DEPLOYING, 'deploying');
    });

    it('should define ACTIVE state', () => {
      assert.equal(WORKER_STATES.ACTIVE, 'active');
    });

    it('should define DEGRADED state', () => {
      assert.equal(WORKER_STATES.DEGRADED, 'degraded');
    });

    it('should define OFFLINE state', () => {
      assert.equal(WORKER_STATES.OFFLINE, 'offline');
    });

    it('should define DRAINING state', () => {
      assert.equal(WORKER_STATES.DRAINING, 'draining');
    });
  });

  describe('EDGE_REGIONS constant', () => {
    it('should include North American regions', () => {
      assert.ok(EDGE_REGIONS.includes('DFW'));
      assert.ok(EDGE_REGIONS.includes('LAX'));
    });

    it('should include European regions', () => {
      assert.ok(EDGE_REGIONS.includes('LHR'));
      assert.ok(EDGE_REGIONS.includes('FRA'));
    });

    it('should include Asia-Pacific regions', () => {
      assert.ok(EDGE_REGIONS.includes('NRT'));
      assert.ok(EDGE_REGIONS.includes('SIN'));
    });

    it('should have multiple regions', () => {
      assert.ok(EDGE_REGIONS.length >= 10);
    });
  });

  describe('EdgeWorker', () => {
    describe('constructor', () => {
      it('should create worker with default id', () => {
        const worker = new EdgeWorker({});
        assert.ok(worker.id);
        assert.ok(worker.id.startsWith('worker-'));
      });

      it('should accept custom id', () => {
        const worker = new EdgeWorker({ id: 'my-worker' });
        assert.equal(worker.id, 'my-worker');
      });

      it('should default type to ROUTER', () => {
        const worker = new EdgeWorker({});
        assert.equal(worker.type, WORKER_TYPES.ROUTER);
      });

      it('should accept custom type', () => {
        const worker = new EdgeWorker({ type: WORKER_TYPES.CACHE });
        assert.equal(worker.type, WORKER_TYPES.CACHE);
      });

      it('should default name to id', () => {
        const worker = new EdgeWorker({ id: 'test-worker' });
        assert.equal(worker.name, 'test-worker');
      });

      it('should accept custom name', () => {
        const worker = new EdgeWorker({ name: 'My Worker' });
        assert.equal(worker.name, 'My Worker');
      });

      it('should initialize empty routes array', () => {
        const worker = new EdgeWorker({});
        assert.ok(Array.isArray(worker.routes));
        assert.equal(worker.routes.length, 0);
      });

      it('should accept custom routes', () => {
        const worker = new EdgeWorker({ routes: ['/api/*', '/data/*'] });
        assert.equal(worker.routes.length, 2);
      });

      it('should default region to null (global)', () => {
        const worker = new EdgeWorker({});
        assert.equal(worker.region, null);
      });

      it('should accept custom region', () => {
        const worker = new EdgeWorker({ region: 'LAX' });
        assert.equal(worker.region, 'LAX');
      });

      it('should set initial state to DEPLOYING', () => {
        const worker = new EdgeWorker({});
        assert.equal(worker.state, WORKER_STATES.DEPLOYING);
      });

      it('should initialize metrics', () => {
        const worker = new EdgeWorker({});
        assert.ok(worker.metrics);
        assert.equal(worker.metrics.requests, 0);
        assert.equal(worker.metrics.errors, 0);
      });

      it('should initialize health to 100', () => {
        const worker = new EdgeWorker({});
        assert.equal(worker.health, 100);
      });
    });

    describe('recordRequest()', () => {
      let worker;

      beforeEach(() => {
        worker = new EdgeWorker({});
      });

      it('should increment request count', () => {
        worker.recordRequest({ latencyMs: 10 });
        assert.equal(worker.metrics.requests, 1);
      });

      it('should increment error count on error', () => {
        worker.recordRequest({ latencyMs: 10, error: true });
        assert.equal(worker.metrics.errors, 1);
      });

      it('should not increment error count on success', () => {
        worker.recordRequest({ latencyMs: 10, error: false });
        assert.equal(worker.metrics.errors, 0);
      });

      it('should update average latency', () => {
        worker.recordRequest({ latencyMs: 100 });
        worker.recordRequest({ latencyMs: 200 });
        assert.ok(worker.metrics.avgLatencyMs > 0);
      });

      it('should track cache hit rate', () => {
        worker.recordRequest({ latencyMs: 10, cacheHit: true });
        worker.recordRequest({ latencyMs: 10, cacheHit: false });
        assert.ok(typeof worker.metrics.cacheHitRate === 'number');
      });

      it('should update lastSeen timestamp', () => {
        const before = Date.now();
        worker.recordRequest({ latencyMs: 10 });
        const after = Date.now();
        assert.ok(worker.lastSeen >= before);
        assert.ok(worker.lastSeen <= after);
      });
    });

    describe('deploy()', () => {
      let worker;

      beforeEach(() => {
        worker = new EdgeWorker({});
      });

      it('should transition to ACTIVE state', () => {
        worker.deploy();
        assert.equal(worker.state, WORKER_STATES.ACTIVE);
      });

      it('should set deployedAt timestamp', () => {
        worker.deploy();
        assert.ok(worker.deployedAt);
      });
    });

    describe('degrade()', () => {
      let worker;

      beforeEach(() => {
        worker = new EdgeWorker({});
        worker.deploy();
      });

      it('should transition to DEGRADED state', () => {
        worker.degrade();
        assert.equal(worker.state, WORKER_STATES.DEGRADED);
      });
    });

    describe('offline()', () => {
      let worker;

      beforeEach(() => {
        worker = new EdgeWorker({});
        worker.deploy();
      });

      it('should transition to OFFLINE state', () => {
        worker.offline();
        assert.equal(worker.state, WORKER_STATES.OFFLINE);
      });
    });

    describe('drain()', () => {
      let worker;

      beforeEach(() => {
        worker = new EdgeWorker({});
        worker.deploy();
      });

      it('should transition to DRAINING state', () => {
        worker.drain();
        assert.equal(worker.state, WORKER_STATES.DRAINING);
      });
    });

    describe('updateHealth()', () => {
      let worker;

      beforeEach(() => {
        worker = new EdgeWorker({});
        worker.deploy();
      });

      it('should update health score', () => {
        worker.updateHealth();
        assert.ok(typeof worker.health === 'number');
      });

      it('should decrease health on errors', () => {
        worker.recordRequest({ latencyMs: 10, error: true });
        worker.recordRequest({ latencyMs: 10, error: true });
        worker.updateHealth();
        assert.ok(worker.health < 100);
      });
    });

    describe('getMetrics()', () => {
      let worker;

      beforeEach(() => {
        worker = new EdgeWorker({});
      });

      it('should return metrics object', () => {
        const metrics = worker.getMetrics();
        assert.ok(metrics);
      });

      it('should include request count', () => {
        worker.recordRequest({ latencyMs: 10 });
        const metrics = worker.getMetrics();
        assert.equal(metrics.requests, 1);
      });
    });
  });

  describe('EdgeComputeProtocol', () => {
    describe('constructor', () => {
      it('should initialize empty workers map', () => {
        assert.ok(protocol.workers instanceof Map);
      });

      it('should initialize empty regions map', () => {
        assert.ok(protocol.regions instanceof Map);
      });
    });

    describe('deployWorker()', () => {
      it('should deploy and register worker', () => {
        const worker = protocol.deployWorker({
          name: 'test-worker',
          type: WORKER_TYPES.ROUTER
        });
        assert.ok(worker);
        assert.ok(protocol.workers.has(worker.id));
      });

      it('should return deployed worker', () => {
        const worker = protocol.deployWorker({
          name: 'api-gateway',
          type: WORKER_TYPES.GATEWAY
        });
        assert.ok(worker.state === WORKER_STATES.ACTIVE || worker.state === WORKER_STATES.DEPLOYING);
      });
    });

    describe('getWorker()', () => {
      it('should return worker by id', () => {
        const deployed = protocol.deployWorker({ name: 'test' });
        const worker = protocol.getWorker(deployed.id);
        assert.ok(worker);
        assert.equal(worker.id, deployed.id);
      });

      it('should return undefined for unknown id', () => {
        const worker = protocol.getWorker('unknown');
        assert.equal(worker, undefined);
      });
    });

    describe('routeRequest()', () => {
      beforeEach(() => {
        protocol.deployWorker({
          name: 'router-1',
          type: WORKER_TYPES.ROUTER,
          routes: ['/api/*']
        });
      });

      it('should route request to appropriate worker', () => {
        const result = protocol.routeRequest({
          path: '/api/users',
          method: 'GET'
        });
        assert.ok(result);
      });
    });

    describe('getRegionWorkers()', () => {
      beforeEach(() => {
        protocol.deployWorker({
          name: 'lax-worker',
          type: WORKER_TYPES.ROUTER,
          region: 'LAX'
        });
        protocol.deployWorker({
          name: 'dfw-worker',
          type: WORKER_TYPES.ROUTER,
          region: 'DFW'
        });
      });

      it('should return workers for region', () => {
        const workers = protocol.getRegionWorkers('LAX');
        assert.ok(Array.isArray(workers));
      });
    });

    describe('getHealthyWorkers()', () => {
      beforeEach(() => {
        protocol.deployWorker({ name: 'healthy-1' });
        protocol.deployWorker({ name: 'healthy-2' });
      });

      it('should return array of healthy workers', () => {
        const healthy = protocol.getHealthyWorkers();
        assert.ok(Array.isArray(healthy));
      });
    });

    describe('getMetrics()', () => {
      it('should return metrics object', () => {
        const metrics = protocol.getMetrics();
        assert.ok(metrics);
      });

      it('should include worker count', () => {
        protocol.deployWorker({ name: 'test' });
        const metrics = protocol.getMetrics();
        assert.ok(metrics.totalWorkers >= 1 || metrics.workerCount >= 1);
      });
    });
  });

  describe('integration', () => {
    it('should handle complete edge deployment', () => {
      // Deploy workers
      const router = protocol.deployWorker({
        name: 'main-router',
        type: WORKER_TYPES.ROUTER,
        routes: ['/*'],
        region: 'LAX'
      });
      
      const gateway = protocol.deployWorker({
        name: 'api-gateway',
        type: WORKER_TYPES.GATEWAY,
        routes: ['/api/*'],
        region: 'LAX'
      });
      
      const cache = protocol.deployWorker({
        name: 'static-cache',
        type: WORKER_TYPES.CACHE,
        routes: ['/static/*'],
        region: 'LAX'
      });
      
      // Record some requests
      router.recordRequest({ latencyMs: 5 });
      gateway.recordRequest({ latencyMs: 20 });
      cache.recordRequest({ latencyMs: 2, cacheHit: true });
      
      // Check metrics
      const metrics = protocol.getMetrics();
      assert.ok(metrics.totalWorkers >= 3 || metrics.workerCount >= 3);
    });
  });
});
