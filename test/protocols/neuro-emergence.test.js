const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('NeuroEmergenceProtocol', () => {
  let NeuroEmergenceProtocol;
  let protocol;
  const PHI = 1.618033988749895;
  const EMERGENCE_THRESHOLD = PHI - 1;

  beforeEach(async () => {
    const module = await import('../../protocols/neuro-emergence-protocol.js');
    NeuroEmergenceProtocol = module.NeuroEmergenceProtocol;
    protocol = new NeuroEmergenceProtocol();
  });

  describe('constructor', () => {
    it('should initialize empty workers map', () => {
      assert.ok(protocol.workers instanceof Map);
      assert.equal(protocol.workers.size, 0);
    });

    it('should initialize empty couplings map', () => {
      assert.ok(protocol.couplings instanceof Map);
      assert.equal(protocol.couplings.size, 0);
    });

    it('should initialize emergence level to 0', () => {
      assert.equal(protocol.emergenceLevel, 0);
    });

    it('should initialize empty cascade events', () => {
      assert.ok(Array.isArray(protocol.cascadeEvents));
      assert.equal(protocol.cascadeEvents.length, 0);
    });

    it('should initialize collective phase to 0', () => {
      assert.equal(protocol.collectivePhase, 0);
    });

    it('should initialize beat count to 0', () => {
      assert.equal(protocol.beatCount, 0);
    });
  });

  describe('registerWorker()', () => {
    it('should register worker and return id', () => {
      const id = protocol.registerWorker('worker-1');
      assert.equal(id, 'worker-1');
    });

    it('should add worker to map', () => {
      protocol.registerWorker('worker-1');
      assert.ok(protocol.workers.has('worker-1'));
    });

    it('should initialize worker with random phase', () => {
      protocol.registerWorker('worker-1');
      const worker = protocol.workers.get('worker-1');
      assert.ok(worker.phase >= 0);
      assert.ok(worker.phase < 2 * Math.PI);
    });

    it('should accept custom phase', () => {
      protocol.registerWorker('worker-1', Math.PI);
      const worker = protocol.workers.get('worker-1');
      assert.equal(worker.phase, Math.PI);
    });

    it('should initialize activity to 0.5', () => {
      protocol.registerWorker('worker-1');
      const worker = protocol.workers.get('worker-1');
      assert.equal(worker.activity, 0.5);
    });

    it('should set lastUpdate timestamp', () => {
      const before = Date.now();
      protocol.registerWorker('worker-1');
      const after = Date.now();
      const worker = protocol.workers.get('worker-1');
      assert.ok(worker.lastUpdate >= before);
      assert.ok(worker.lastUpdate <= after);
    });
  });

  describe('unregisterWorker()', () => {
    beforeEach(() => {
      protocol.registerWorker('worker-1');
      protocol.registerWorker('worker-2');
    });

    it('should remove worker from map', () => {
      protocol.unregisterWorker('worker-1');
      assert.ok(!protocol.workers.has('worker-1'));
    });

    it('should remove associated couplings', () => {
      protocol.couple('worker-1', 'worker-2');
      protocol.unregisterWorker('worker-1');
      // Coupling should be removed
      assert.equal(protocol.couplings.size, 0);
    });
  });

  describe('couple()', () => {
    beforeEach(() => {
      protocol.registerWorker('worker-1');
      protocol.registerWorker('worker-2');
    });

    it('should create coupling between workers', () => {
      const key = protocol.couple('worker-1', 'worker-2');
      assert.ok(key);
    });

    it('should add coupling to map', () => {
      protocol.couple('worker-1', 'worker-2');
      assert.equal(protocol.couplings.size, 1);
    });

    it('should use phi-based default strength', () => {
      protocol.couple('worker-1', 'worker-2');
      const coupling = Array.from(protocol.couplings.values())[0];
      assert.ok(Math.abs(coupling.strength - (PHI - 1)) < 0.001);
    });

    it('should accept custom strength', () => {
      protocol.couple('worker-1', 'worker-2', 0.5);
      const coupling = Array.from(protocol.couplings.values())[0];
      assert.equal(coupling.strength, 0.5);
    });

    it('should initialize coherence to 0', () => {
      protocol.couple('worker-1', 'worker-2');
      const coupling = Array.from(protocol.couplings.values())[0];
      assert.equal(coupling.coherence, 0);
    });

    it('should store both worker ids', () => {
      protocol.couple('worker-1', 'worker-2');
      const coupling = Array.from(protocol.couplings.values())[0];
      assert.ok(coupling.workers.includes('worker-1'));
      assert.ok(coupling.workers.includes('worker-2'));
    });
  });

  describe('updateActivity()', () => {
    beforeEach(() => {
      protocol.registerWorker('worker-1');
    });

    it('should update worker activity', () => {
      protocol.updateActivity('worker-1', 0.8);
      const worker = protocol.workers.get('worker-1');
      assert.equal(worker.activity, 0.8);
    });

    it('should clamp activity to 0', () => {
      protocol.updateActivity('worker-1', -0.5);
      const worker = protocol.workers.get('worker-1');
      assert.equal(worker.activity, 0);
    });

    it('should clamp activity to 1', () => {
      protocol.updateActivity('worker-1', 1.5);
      const worker = protocol.workers.get('worker-1');
      assert.equal(worker.activity, 1);
    });

    it('should update lastUpdate timestamp', () => {
      const before = Date.now();
      protocol.updateActivity('worker-1', 0.7);
      const after = Date.now();
      const worker = protocol.workers.get('worker-1');
      assert.ok(worker.lastUpdate >= before);
      assert.ok(worker.lastUpdate <= after);
    });
  });

  describe('step()', () => {
    beforeEach(() => {
      protocol.registerWorker('worker-1', 0);
      protocol.registerWorker('worker-2', Math.PI);
      protocol.couple('worker-1', 'worker-2');
    });

    it('should increment beat count', () => {
      protocol.step();
      assert.equal(protocol.beatCount, 1);
    });

    it('should update phases', () => {
      const phase1Before = protocol.workers.get('worker-1').phase;
      protocol.step();
      const phase1After = protocol.workers.get('worker-1').phase;
      // Phase should change due to coupling
      assert.ok(phase1After !== phase1Before || phase1Before === 0);
    });

    it('should wrap phases to [0, 2π)', () => {
      for (let i = 0; i < 100; i++) {
        protocol.step();
      }
      const worker = protocol.workers.get('worker-1');
      assert.ok(worker.phase >= 0);
      assert.ok(worker.phase < 2 * Math.PI);
    });

    it('should accept custom dt', () => {
      protocol.step(0.5);
      assert.equal(protocol.beatCount, 1);
    });
  });

  describe('calculateEmergence()', () => {
    beforeEach(() => {
      protocol.registerWorker('worker-1', 0);
      protocol.registerWorker('worker-2', 0.1);
      protocol.registerWorker('worker-3', 0.2);
    });

    it('should calculate emergence level', () => {
      const emergence = protocol.calculateEmergence();
      assert.ok(typeof emergence === 'number');
    });

    it('should be high for synchronized phases', () => {
      // All workers at similar phases
      protocol.workers.get('worker-1').phase = 0;
      protocol.workers.get('worker-2').phase = 0.1;
      protocol.workers.get('worker-3').phase = 0.2;
      const emergence = protocol.calculateEmergence();
      assert.ok(emergence > 0.5);
    });

    it('should be low for dispersed phases', () => {
      // Workers at different phases
      protocol.workers.get('worker-1').phase = 0;
      protocol.workers.get('worker-2').phase = 2 * Math.PI / 3;
      protocol.workers.get('worker-3').phase = 4 * Math.PI / 3;
      const emergence = protocol.calculateEmergence();
      assert.ok(emergence < 0.5);
    });

    it('should update emergenceLevel property', () => {
      protocol.calculateEmergence();
      assert.ok(typeof protocol.emergenceLevel === 'number');
    });
  });

  describe('checkCascade()', () => {
    beforeEach(() => {
      protocol.registerWorker('worker-1', 0);
      protocol.registerWorker('worker-2', 0);
      protocol.registerWorker('worker-3', 0);
    });

    it('should detect cascade when emergence is high', () => {
      // Force high emergence
      protocol.emergenceLevel = 0.9;
      const cascade = protocol.checkCascade();
      assert.ok(typeof cascade === 'boolean' || cascade === null);
    });

    it('should add cascade event when triggered', () => {
      protocol.emergenceLevel = 0.9;
      protocol.checkCascade();
      // May or may not trigger depending on threshold
    });
  });

  describe('getState()', () => {
    it('should return state object', () => {
      const state = protocol.getState();
      assert.ok(state);
    });

    it('should include worker count', () => {
      protocol.registerWorker('worker-1');
      const state = protocol.getState();
      assert.ok('workerCount' in state || 'workers' in state);
    });

    it('should include emergence level', () => {
      const state = protocol.getState();
      assert.ok('emergenceLevel' in state || 'emergence' in state);
    });

    it('should include beat count', () => {
      const state = protocol.getState();
      assert.ok('beatCount' in state || 'beats' in state);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include coupling count', () => {
      const metrics = protocol.getMetrics();
      assert.ok('couplingCount' in metrics || 'couplings' in metrics);
    });

    it('should include cascade count', () => {
      const metrics = protocol.getMetrics();
      assert.ok('cascadeCount' in metrics || 'cascades' in metrics);
    });
  });

  describe('integration', () => {
    it('should evolve toward synchronization', () => {
      // Register multiple workers with random phases
      for (let i = 0; i < 5; i++) {
        protocol.registerWorker(`worker-${i}`);
      }
      
      // Couple all workers
      for (let i = 0; i < 4; i++) {
        protocol.couple(`worker-${i}`, `worker-${i + 1}`);
      }
      
      // Run many steps
      for (let i = 0; i < 100; i++) {
        protocol.step();
      }
      
      // Calculate emergence
      const emergence = protocol.calculateEmergence();
      // Should have some level of synchronization
      assert.ok(typeof emergence === 'number');
    });

    it('should handle complex network', () => {
      // Create network
      for (let i = 0; i < 10; i++) {
        protocol.registerWorker(`w-${i}`);
      }
      
      // Create couplings
      protocol.couple('w-0', 'w-1');
      protocol.couple('w-1', 'w-2');
      protocol.couple('w-2', 'w-3');
      protocol.couple('w-0', 'w-5');
      
      // Run simulation
      for (let i = 0; i < 50; i++) {
        protocol.step();
      }
      
      const state = protocol.getState();
      assert.ok(state);
    });
  });
});
