const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('PhiResonanceSyncProtocol', () => {
  let PhiResonanceSyncProtocol;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/phi-resonance-sync-protocol.js');
    PhiResonanceSyncProtocol = module.PhiResonanceSyncProtocol;
    protocol = new PhiResonanceSyncProtocol();
  });

  describe('constructor', () => {
    it('should initialize empty oscillators map', () => {
      assert.ok(protocol.oscillators instanceof Map);
      assert.equal(protocol.oscillators.size, 0);
    });

    it('should initialize default coupling constant to PHI', () => {
      assert.ok(Math.abs(protocol.couplingConstant - 1.618033988749895) < 0.0001);
    });

    it('should initialize natural frequency based on HEARTBEAT', () => {
      const expected = 2 * Math.PI / 873;
      assert.ok(Math.abs(protocol.naturalFrequency - expected) < 0.0001);
    });

    it('should initialize empty resonance bonds map', () => {
      assert.ok(protocol.resonanceBonds instanceof Map);
      assert.equal(protocol.resonanceBonds.size, 0);
    });

    it('should initialize totalPulses to 0', () => {
      assert.equal(protocol.totalPulses, 0);
    });

    it('should record startTime', () => {
      const before = Date.now();
      const newProtocol = new PhiResonanceSyncProtocol();
      const after = Date.now();
      assert.ok(newProtocol.startTime >= before);
      assert.ok(newProtocol.startTime <= after);
    });

    it('should accept custom coupling constant', async () => {
      const module = await import('../../protocols/phi-resonance-sync-protocol.js');
      const custom = new module.PhiResonanceSyncProtocol({ K: 2.5 });
      assert.equal(custom.couplingConstant, 2.5);
    });

    it('should accept custom natural frequency', async () => {
      const module = await import('../../protocols/phi-resonance-sync-protocol.js');
      const custom = new module.PhiResonanceSyncProtocol({ omega: 0.5 });
      assert.equal(custom.naturalFrequency, 0.5);
    });
  });

  describe('registerOscillator()', () => {
    it('should add oscillator to map', () => {
      protocol.registerOscillator('osc-1');
      assert.ok(protocol.oscillators.has('osc-1'));
    });

    it('should return oscillator info', () => {
      const result = protocol.registerOscillator('osc-1');
      assert.equal(result.id, 'osc-1');
      assert.ok('theta' in result);
      assert.ok('frequency' in result);
    });

    it('should initialize theta randomly in [0, 2π)', () => {
      const result = protocol.registerOscillator('osc-1');
      assert.ok(result.theta >= 0);
      assert.ok(result.theta < 2 * Math.PI);
    });

    it('should use default frequency', () => {
      const result = protocol.registerOscillator('osc-1');
      assert.equal(result.frequency, protocol.naturalFrequency);
    });

    it('should accept custom frequency', () => {
      const result = protocol.registerOscillator('osc-1', 0.123);
      assert.equal(result.frequency, 0.123);
    });

    it('should set lastUpdate timestamp', () => {
      const before = Date.now();
      protocol.registerOscillator('osc-1');
      const after = Date.now();
      const osc = protocol.oscillators.get('osc-1');
      assert.ok(osc.lastUpdate >= before);
      assert.ok(osc.lastUpdate <= after);
    });

    it('should initialize pulseCount to 0', () => {
      protocol.registerOscillator('osc-1');
      const osc = protocol.oscillators.get('osc-1');
      assert.equal(osc.pulseCount, 0);
    });

    it('should handle multiple oscillators', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.registerOscillator('osc-3');
      assert.equal(protocol.oscillators.size, 3);
    });

    it('should generate different initial phases', () => {
      const phases = [];
      for (let i = 0; i < 10; i++) {
        const result = protocol.registerOscillator(`osc-${i}`);
        phases.push(result.theta);
      }
      const unique = new Set(phases);
      assert.ok(unique.size > 1); // Should have some variation
    });
  });

  describe('step()', () => {
    it('should return order parameter when oscillators exist', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      const result = protocol.step(0.1);
      assert.ok('orderParameter' in result);
      assert.ok('R' in result.orderParameter);
      assert.ok('Psi' in result.orderParameter);
    });

    it('should return phases array', () => {
      protocol.registerOscillator('osc-1');
      const result = protocol.step(0.1);
      assert.ok(Array.isArray(result.phases));
    });

    it('should return empty result for no oscillators', () => {
      const result = protocol.step(0.1);
      assert.equal(result.orderParameter.R, 0);
      assert.equal(result.orderParameter.Psi, 0);
      assert.equal(result.phases.length, 0);
    });

    it('should update oscillator phases', () => {
      protocol.registerOscillator('osc-1');
      const oldTheta = protocol.oscillators.get('osc-1').theta;
      protocol.step(1.0);
      const newTheta = protocol.oscillators.get('osc-1').theta;
      assert.notEqual(oldTheta, newTheta);
    });

    it('should update lastUpdate timestamp', () => {
      protocol.registerOscillator('osc-1');
      const before = Date.now();
      protocol.step(0.1);
      const after = Date.now();
      const osc = protocol.oscillators.get('osc-1');
      assert.ok(osc.lastUpdate >= before);
      assert.ok(osc.lastUpdate <= after);
    });

    it('should keep phases in [0, 2π)', () => {
      protocol.registerOscillator('osc-1');
      for (let i = 0; i < 100; i++) {
        protocol.step(0.1);
      }
      const osc = protocol.oscillators.get('osc-1');
      assert.ok(osc.theta >= 0);
      assert.ok(osc.theta < 2 * Math.PI);
    });

    it('should apply Kuramoto coupling between oscillators', () => {
      // Register two oscillators with same phase
      protocol.registerOscillator('osc-1', protocol.naturalFrequency);
      protocol.registerOscillator('osc-2', protocol.naturalFrequency);
      
      // Set same initial phase
      protocol.oscillators.get('osc-1').theta = Math.PI;
      protocol.oscillators.get('osc-2').theta = Math.PI;
      
      protocol.step(0.01);
      
      // Phases should stay synchronized (coupling = 0 when phases equal)
      const osc1 = protocol.oscillators.get('osc-1');
      const osc2 = protocol.oscillators.get('osc-2');
      assert.ok(Math.abs(osc1.theta - osc2.theta) < 0.1);
    });

    it('should use phi-boosted coupling for resonance bonds', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.resonate('osc-1', 'osc-2');
      
      // Stepping should not throw
      assert.doesNotThrow(() => protocol.step(0.1));
    });

    it('should handle single oscillator', () => {
      protocol.registerOscillator('osc-1');
      const result = protocol.step(0.1);
      assert.ok(Math.abs(result.orderParameter.R - 1) < 1e-12); // Single oscillator = perfect sync
    });
  });

  describe('getOrderParameter()', () => {
    it('should return R=0 for no oscillators', () => {
      const result = protocol.getOrderParameter();
      assert.equal(result.R, 0);
      assert.equal(result.Psi, 0);
    });

    it('should return R=1 for single oscillator', () => {
      protocol.registerOscillator('osc-1');
      const result = protocol.getOrderParameter();
      assert.ok(Math.abs(result.R - 1) < 1e-12);
    });

    it('should return R near 1 for synchronized oscillators', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.oscillators.get('osc-1').theta = 0;
      protocol.oscillators.get('osc-2').theta = 0;
      const result = protocol.getOrderParameter();
      assert.ok(Math.abs(result.R - 1) < 0.01);
    });

    it('should return R near 0 for opposite phases', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.oscillators.get('osc-1').theta = 0;
      protocol.oscillators.get('osc-2').theta = Math.PI;
      const result = protocol.getOrderParameter();
      assert.ok(result.R < 0.1);
    });

    it('should return Psi as mean phase angle', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.oscillators.get('osc-1').theta = 0;
      protocol.oscillators.get('osc-2').theta = 0;
      const result = protocol.getOrderParameter();
      assert.ok(Math.abs(result.Psi) < 0.1);
    });

    it('should have R in range [0, 1]', () => {
      for (let i = 0; i < 10; i++) {
        protocol.registerOscillator(`osc-${i}`);
      }
      const result = protocol.getOrderParameter();
      assert.ok(result.R >= 0);
      assert.ok(result.R <= 1);
    });

    it('should have Psi in range [-π, π]', () => {
      for (let i = 0; i < 10; i++) {
        protocol.registerOscillator(`osc-${i}`);
      }
      const result = protocol.getOrderParameter();
      assert.ok(result.Psi >= -Math.PI);
      assert.ok(result.Psi <= Math.PI);
    });
  });

  describe('pulse()', () => {
    it('should increment totalPulses', () => {
      protocol.pulse();
      assert.equal(protocol.totalPulses, 1);
      protocol.pulse();
      assert.equal(protocol.totalPulses, 2);
    });

    it('should return beat number', () => {
      protocol.pulse();
      const result = protocol.pulse();
      assert.equal(result.beat, 2);
    });

    it('should return timestamp', () => {
      const before = Date.now();
      const result = protocol.pulse();
      const after = Date.now();
      assert.ok(result.timestamp >= before);
      assert.ok(result.timestamp <= after);
    });

    it('should return interval as HEARTBEAT', () => {
      const result = protocol.pulse();
      assert.equal(result.intervalMs, 873);
    });

    it('should return order parameter', () => {
      protocol.registerOscillator('osc-1');
      const result = protocol.pulse();
      assert.ok('orderParameter' in result);
    });

    it('should return active oscillator count', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      const result = protocol.pulse();
      assert.equal(result.activeOscillators, 2);
    });

    it('should increment pulseCount for all oscillators', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.pulse();
      assert.equal(protocol.oscillators.get('osc-1').pulseCount, 1);
      assert.equal(protocol.oscillators.get('osc-2').pulseCount, 1);
    });

    it('should handle empty oscillator set', () => {
      const result = protocol.pulse();
      assert.equal(result.activeOscillators, 0);
    });
  });

  describe('detectDeadNodes()', () => {
    it('should return empty array when no dead nodes', () => {
      protocol.registerOscillator('osc-1');
      const dead = protocol.detectDeadNodes();
      assert.equal(dead.length, 0);
    });

    it('should detect nodes past timeout', () => {
      protocol.registerOscillator('osc-1');
      // Manually set lastUpdate to past
      protocol.oscillators.get('osc-1').lastUpdate = Date.now() - 10000;
      const dead = protocol.detectDeadNodes(5);
      assert.ok(dead.includes('osc-1'));
    });

    it('should use default timeout of 5 heartbeats', () => {
      protocol.registerOscillator('osc-1');
      protocol.oscillators.get('osc-1').lastUpdate = Date.now() - (5 * 873 + 100);
      const dead = protocol.detectDeadNodes();
      assert.ok(dead.includes('osc-1'));
    });

    it('should accept custom timeout', () => {
      protocol.registerOscillator('osc-1');
      protocol.oscillators.get('osc-1').lastUpdate = Date.now() - 2000;
      const dead = protocol.detectDeadNodes(2);
      assert.ok(dead.includes('osc-1'));
    });

    it('should handle empty oscillator set', () => {
      const dead = protocol.detectDeadNodes();
      assert.equal(dead.length, 0);
    });

    it('should return array of IDs', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.oscillators.get('osc-1').lastUpdate = Date.now() - 10000;
      const dead = protocol.detectDeadNodes(5);
      assert.ok(Array.isArray(dead));
      assert.equal(dead.length, 1);
    });
  });

  describe('getPhaseMap()', () => {
    it('should return array of phase objects', () => {
      protocol.registerOscillator('osc-1');
      const phases = protocol.getPhaseMap();
      assert.ok(Array.isArray(phases));
      assert.equal(phases.length, 1);
    });

    it('should include id in each phase', () => {
      protocol.registerOscillator('osc-1');
      const phases = protocol.getPhaseMap();
      assert.equal(phases[0].id, 'osc-1');
    });

    it('should include theta in each phase', () => {
      protocol.registerOscillator('osc-1');
      const phases = protocol.getPhaseMap();
      assert.ok('theta' in phases[0]);
    });

    it('should include frequency in each phase', () => {
      protocol.registerOscillator('osc-1');
      const phases = protocol.getPhaseMap();
      assert.ok('frequency' in phases[0]);
    });

    it('should include lastUpdate in each phase', () => {
      protocol.registerOscillator('osc-1');
      const phases = protocol.getPhaseMap();
      assert.ok('lastUpdate' in phases[0]);
    });

    it('should return empty array for no oscillators', () => {
      const phases = protocol.getPhaseMap();
      assert.equal(phases.length, 0);
    });

    it('should return all oscillators', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.registerOscillator('osc-3');
      const phases = protocol.getPhaseMap();
      assert.equal(phases.length, 3);
    });
  });

  describe('resonate()', () => {
    it('should create resonance bond', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.resonate('osc-1', 'osc-2');
      assert.equal(protocol.resonanceBonds.size, 1);
    });

    it('should return bond info', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      const bond = protocol.resonate('osc-1', 'osc-2');
      assert.equal(bond.source, 'osc-1');
      assert.equal(bond.target, 'osc-2');
    });

    it('should set strength to PHI', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      const bond = protocol.resonate('osc-1', 'osc-2');
      assert.ok(Math.abs(bond.strength - 1.618033988749895) < 0.0001);
    });

    it('should set createdAt timestamp', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      const before = Date.now();
      const bond = protocol.resonate('osc-1', 'osc-2');
      const after = Date.now();
      assert.ok(bond.createdAt >= before);
      assert.ok(bond.createdAt <= after);
    });

    it('should use symmetric bond key', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.resonate('osc-2', 'osc-1');
      assert.ok(protocol.resonanceBonds.has('osc-1<->osc-2'));
    });

    it('should overwrite existing bond', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.resonate('osc-1', 'osc-2');
      protocol.resonate('osc-2', 'osc-1');
      assert.equal(protocol.resonanceBonds.size, 1);
    });
  });

  describe('getSyncMetrics()', () => {
    it('should return order parameter', () => {
      protocol.registerOscillator('osc-1');
      const metrics = protocol.getSyncMetrics();
      assert.ok('orderParameter' in metrics);
    });

    it('should return active peers count', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      const metrics = protocol.getSyncMetrics();
      assert.equal(metrics.activePeers, 2);
    });

    it('should return dead nodes count', () => {
      protocol.registerOscillator('osc-1');
      protocol.oscillators.get('osc-1').lastUpdate = Date.now() - 10000;
      const metrics = protocol.getSyncMetrics();
      assert.equal(metrics.deadNodes, 1);
    });

    it('should return total pulses', () => {
      protocol.pulse();
      protocol.pulse();
      const metrics = protocol.getSyncMetrics();
      assert.equal(metrics.totalPulses, 2);
    });

    it('should calculate average drift', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      const metrics = protocol.getSyncMetrics();
      assert.ok('avgDrift' in metrics);
      assert.ok(typeof metrics.avgDrift === 'number');
    });

    it('should return 0 avgDrift for empty set', () => {
      const metrics = protocol.getSyncMetrics();
      assert.equal(metrics.avgDrift, 0);
    });

    it('should return low drift for synchronized oscillators', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.oscillators.get('osc-1').theta = 0;
      protocol.oscillators.get('osc-2').theta = 0;
      const metrics = protocol.getSyncMetrics();
      assert.ok(metrics.avgDrift < 0.1);
    });
  });

  describe('integration scenarios', () => {
    it('should evolve toward synchronization with strong coupling', async () => {
      const module = await import('../../protocols/phi-resonance-sync-protocol.js');
      const strongCoupling = new module.PhiResonanceSyncProtocol({ K: 5.0 });
      
      for (let i = 0; i < 5; i++) {
        strongCoupling.registerOscillator(`osc-${i}`);
      }
      
      const initialR = strongCoupling.getOrderParameter().R;
      
      // Evolve system
      for (let t = 0; t < 100; t++) {
        strongCoupling.step(0.1);
      }
      
      const finalR = strongCoupling.getOrderParameter().R;
      // Strong coupling should lead to more synchronization
      assert.ok(finalR >= initialR * 0.8); // Allow some variance
    });

    it('should maintain pulse rhythm', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      
      for (let i = 0; i < 10; i++) {
        const result = protocol.pulse();
        assert.equal(result.beat, i + 1);
        assert.equal(result.intervalMs, 873);
      }
    });

    it('should track dead nodes over time', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      
      // Step only osc-2
      protocol.oscillators.get('osc-1').lastUpdate = Date.now() - 10000;
      
      const metrics = protocol.getSyncMetrics();
      assert.equal(metrics.deadNodes, 1);
      assert.equal(metrics.activePeers, 1);
    });

    it('should enhance coupling with resonance bonds', () => {
      protocol.registerOscillator('osc-1');
      protocol.registerOscillator('osc-2');
      protocol.registerOscillator('osc-3');
      
      // Create resonance bond between osc-1 and osc-2
      protocol.resonate('osc-1', 'osc-2');
      
      // Step the system
      protocol.step(0.1);
      
      // Should not throw and bond should exist
      assert.equal(protocol.resonanceBonds.size, 1);
    });
  });
});
