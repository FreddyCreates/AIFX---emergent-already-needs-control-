/**
 * Tests for PROTO-201: Neurochemistry ODE Protocol (NODEP)
 */
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('NeurochemistryODEProtocol', () => {
  let NeurochemistryODEProtocol, SPECIES, STIMULUS_TABLE, protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/neurochemistry-ode-protocol.js');
    NeurochemistryODEProtocol = module.NeurochemistryODEProtocol;
    SPECIES = module.SPECIES;
    STIMULUS_TABLE = module.STIMULUS_TABLE;
    protocol = new NeurochemistryODEProtocol();
  });

  describe('exports', () => {
    it('should export NeurochemistryODEProtocol class', () => {
      assert.strictEqual(typeof NeurochemistryODEProtocol, 'function');
    });

    it('should export SPECIES array', () => {
      assert.ok(Array.isArray(SPECIES));
    });

    it('should export STIMULUS_TABLE object', () => {
      assert.strictEqual(typeof STIMULUS_TABLE, 'object');
    });

    it('should have default export', async () => {
      const module = await import('../../protocols/neurochemistry-ode-protocol.js');
      assert.strictEqual(module.default, NeurochemistryODEProtocol);
    });
  });

  describe('SPECIES constant', () => {
    it('should contain 6 species', () => {
      assert.strictEqual(SPECIES.length, 6);
    });

    it('should include DA (Dopamine)', () => {
      assert.ok(SPECIES.includes('DA'));
    });

    it('should include SE (Serotonin)', () => {
      assert.ok(SPECIES.includes('SE'));
    });

    it('should include NE (Norepinephrine)', () => {
      assert.ok(SPECIES.includes('NE'));
    });

    it('should include CO (Cortisol)', () => {
      assert.ok(SPECIES.includes('CO'));
    });

    it('should include ACh (Acetylcholine)', () => {
      assert.ok(SPECIES.includes('ACh'));
    });

    it('should include OX (Oxytocin)', () => {
      assert.ok(SPECIES.includes('OX'));
    });
  });

  describe('STIMULUS_TABLE constant', () => {
    it('should have chat stimulus', () => {
      assert.ok(STIMULUS_TABLE.chat);
    });

    it('should have research stimulus', () => {
      assert.ok(STIMULUS_TABLE.research);
    });

    it('should have mission stimulus', () => {
      assert.ok(STIMULUS_TABLE.mission);
    });

    it('should have agent_complete stimulus', () => {
      assert.ok(STIMULUS_TABLE.agent_complete);
    });

    it('should have error stimulus', () => {
      assert.ok(STIMULUS_TABLE.error);
    });

    it('should have success stimulus', () => {
      assert.ok(STIMULUS_TABLE.success);
    });

    it('should have alert stimulus', () => {
      assert.ok(STIMULUS_TABLE.alert);
    });

    it('should have cognitive stimulus', () => {
      assert.ok(STIMULUS_TABLE.cognitive);
    });

    it('should have emotional stimulus', () => {
      assert.ok(STIMULUS_TABLE.emotional);
    });

    it('should have creative stimulus', () => {
      assert.ok(STIMULUS_TABLE.creative);
    });
  });

  describe('constructor', () => {
    it('should create instance', () => {
      assert.ok(protocol instanceof NeurochemistryODEProtocol);
    });

    it('should initialize C with all species at 1.0', () => {
      for (const sp of SPECIES) {
        assert.strictEqual(protocol.C[sp], 1.0);
      }
    });

    it('should initialize totalTicks to 0', () => {
      assert.strictEqual(protocol.totalTicks, 0);
    });
  });

  describe('tick()', () => {
    it('should increment totalTicks', () => {
      protocol.tick();
      assert.strictEqual(protocol.totalTicks, 1);
    });

    it('should return state object', () => {
      const state = protocol.tick();
      assert.strictEqual(typeof state, 'object');
    });

    it('should return concentrations in state', () => {
      const state = protocol.tick();
      assert.ok(state.concentrations);
    });

    it('should return occupancies in state', () => {
      const state = protocol.tick();
      assert.ok(state.occupancies);
    });

    it('should return energy in state', () => {
      const state = protocol.tick();
      assert.strictEqual(typeof state.energy, 'number');
    });

    it('should return tick count in state', () => {
      const state = protocol.tick();
      assert.strictEqual(state.tick, 1);
    });

    it('should return heartbeat constant', () => {
      const state = protocol.tick();
      assert.strictEqual(state.heartbeat, 873);
    });

    it('should return phi constant', () => {
      const state = protocol.tick();
      assert.ok(Math.abs(state.phi - 1.618033988749895) < 1e-10);
    });

    it('should clamp concentrations above 0.10', () => {
      protocol.C.DA = 0.05;
      protocol.tick();
      assert.ok(protocol.C.DA >= 0.10);
    });

    it('should clamp concentrations below 4.0', () => {
      protocol.C.DA = 5.0;
      protocol.tick();
      assert.ok(protocol.C.DA <= 4.0);
    });

    it('should update multiple ticks correctly', () => {
      for (let i = 0; i < 10; i++) {
        protocol.tick();
      }
      assert.strictEqual(protocol.totalTicks, 10);
    });
  });

  describe('stimulus()', () => {
    it('should apply chat stimulus', () => {
      const before = protocol.C.DA;
      protocol.stimulus('chat');
      assert.notStrictEqual(protocol.C.DA, before);
    });

    it('should apply research stimulus', () => {
      const before = protocol.C.ACh;
      protocol.stimulus('research');
      assert.ok(protocol.C.ACh > before);
    });

    it('should apply error stimulus with negative DA effect', () => {
      const before = protocol.C.DA;
      protocol.stimulus('error');
      assert.ok(protocol.C.DA < before);
    });

    it('should not modify state for unknown stimulus', () => {
      const before = { ...protocol.C };
      protocol.stimulus('unknown_type');
      for (const sp of SPECIES) {
        assert.strictEqual(protocol.C[sp], before[sp]);
      }
    });

    it('should clamp stimulus results above 0.10', () => {
      protocol.C.DA = 0.12;
      protocol.stimulus('error'); // DA -0.05
      assert.ok(protocol.C.DA >= 0.10);
    });

    it('should clamp stimulus results below 4.0', () => {
      protocol.C.DA = 3.95;
      protocol.stimulus('agent_complete'); // DA +0.12
      assert.ok(protocol.C.DA <= 4.0);
    });
  });

  describe('hill()', () => {
    it('should return 0.5 when C equals Kd and n=1', () => {
      const result = protocol.hill(1.0, 1.0, 1);
      assert.ok(Math.abs(result - 0.5) < 1e-10);
    });

    it('should return 0.5 when C equals Kd and n=2', () => {
      const result = protocol.hill(1.0, 1.0, 2);
      assert.ok(Math.abs(result - 0.5) < 1e-10);
    });

    it('should return value close to 1 for high C', () => {
      const result = protocol.hill(100, 1.0, 2);
      assert.ok(result > 0.99);
    });

    it('should return value close to 0 for low C', () => {
      const result = protocol.hill(0.01, 1.0, 2);
      assert.ok(result < 0.01);
    });

    it('should handle n=1 (linear saturation)', () => {
      const result = protocol.hill(2, 1.0, 1);
      assert.ok(Math.abs(result - 2/3) < 1e-10);
    });

    it('should handle negative C by clamping to 0', () => {
      const result = protocol.hill(-1, 1.0, 2);
      assert.strictEqual(result, 0);
    });

    it('should increase with higher Kd for same C', () => {
      const low = protocol.hill(1.0, 2.0, 2);
      const high = protocol.hill(1.0, 0.5, 2);
      assert.ok(high > low);
    });
  });

  describe('getReceptorOccupancies()', () => {
    it('should return object with all occupancies', () => {
      const occ = protocol.getReceptorOccupancies();
      assert.ok('oDA' in occ);
      assert.ok('oSE' in occ);
      assert.ok('oNE' in occ);
      assert.ok('oCO' in occ);
      assert.ok('oACh' in occ);
      assert.ok('oOX' in occ);
    });

    it('should return values between 0 and 1', () => {
      const occ = protocol.getReceptorOccupancies();
      for (const val of Object.values(occ)) {
        assert.ok(val >= 0 && val <= 1);
      }
    });

    it('should return 0.5 for baseline DA', () => {
      const occ = protocol.getReceptorOccupancies();
      assert.ok(Math.abs(occ.oDA - 0.5) < 1e-10);
    });

    it('should return 0.5 for baseline SE', () => {
      const occ = protocol.getReceptorOccupancies();
      assert.ok(Math.abs(occ.oSE - 0.5) < 1e-10);
    });

    it('should use different Kd for OX', () => {
      const occ = protocol.getReceptorOccupancies();
      // OX uses Kd=0.8, n=2, so at C=1.0: 1/(0.64+1) = 0.61
      assert.ok(occ.oOX > 0.5);
    });
  });

  describe('getState()', () => {
    it('should return concentrations object', () => {
      const state = protocol.getState();
      assert.ok(state.concentrations);
    });

    it('should return occupancies object', () => {
      const state = protocol.getState();
      assert.ok(state.occupancies);
    });

    it('should return energy as number', () => {
      const state = protocol.getState();
      assert.strictEqual(typeof state.energy, 'number');
    });

    it('should return tick count', () => {
      const state = protocol.getState();
      assert.strictEqual(state.tick, 0);
    });

    it('should return heartbeat constant', () => {
      const state = protocol.getState();
      assert.strictEqual(state.heartbeat, 873);
    });

    it('should return phi constant', () => {
      const state = protocol.getState();
      assert.ok(Math.abs(state.phi - 1.618033988749895) < 1e-10);
    });

    it('should clamp energy between 0 and 100', () => {
      const state = protocol.getState();
      assert.ok(state.energy >= 0 && state.energy <= 100);
    });

    it('should return copied concentrations', () => {
      const state = protocol.getState();
      state.concentrations.DA = 999;
      assert.notStrictEqual(protocol.C.DA, 999);
    });
  });

  describe('integration tests', () => {
    it('should handle multiple stimuli in sequence', () => {
      protocol.stimulus('chat');
      protocol.stimulus('research');
      protocol.stimulus('success');
      const state = protocol.getState();
      assert.ok(state.concentrations.DA > 1.0);
    });

    it('should mean-revert over many ticks', () => {
      protocol.stimulus('mission');
      for (let i = 0; i < 1000; i++) {
        protocol.tick();
      }
      // Should be close to baseline
      assert.ok(Math.abs(protocol.C.NE - 1.0) < 0.5);
    });

    it('should handle stress accumulation', () => {
      for (let i = 0; i < 5; i++) {
        protocol.stimulus('error');
      }
      assert.ok(protocol.C.CO > 1.0);
    });
  });
});
