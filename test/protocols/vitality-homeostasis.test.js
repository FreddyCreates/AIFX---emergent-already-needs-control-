const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

let VitalityHomeostasisProtocol;
let HOMEOSTATIC_TARGET;

describe('VitalityHomeostasisProtocol', () => {
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/vitality-homeostasis-protocol.js');
    VitalityHomeostasisProtocol = module.VitalityHomeostasisProtocol;
    HOMEOSTATIC_TARGET = module.HOMEOSTATIC_TARGET;
    protocol = new VitalityHomeostasisProtocol();
  });

  describe('exports', () => {
    it('should export VitalityHomeostasisProtocol class', async () => {
      const module = await import('../../protocols/vitality-homeostasis-protocol.js');
      assert.ok(module.VitalityHomeostasisProtocol);
    });

    it('should export HOMEOSTATIC_TARGET constant', async () => {
      const module = await import('../../protocols/vitality-homeostasis-protocol.js');
      assert.ok(typeof module.HOMEOSTATIC_TARGET === 'number');
    });

    it('should export default as VitalityHomeostasisProtocol', async () => {
      const module = await import('../../protocols/vitality-homeostasis-protocol.js');
      assert.equal(module.default, module.VitalityHomeostasisProtocol);
    });

    it('should have HOMEOSTATIC_TARGET equal to PHI - 1', async () => {
      const PHI = 1.618033988749895;
      assert.equal(HOMEOSTATIC_TARGET, PHI - 1);
    });
  });

  describe('constructor', () => {
    it('should initialize cognitive register with health 1.0', () => {
      assert.equal(protocol.registers.cognitive.health, 1.0);
    });

    it('should initialize affective register with health 1.0', () => {
      assert.equal(protocol.registers.affective.health, 1.0);
    });

    it('should initialize somatic register with health 1.0', () => {
      assert.equal(protocol.registers.somatic.health, 1.0);
    });

    it('should initialize sovereign register with health 1.0', () => {
      assert.equal(protocol.registers.sovereign.health, 1.0);
    });

    it('should set cognitive target to HOMEOSTATIC_TARGET', () => {
      assert.equal(protocol.registers.cognitive.target, HOMEOSTATIC_TARGET);
    });

    it('should set affective target to HOMEOSTATIC_TARGET', () => {
      assert.equal(protocol.registers.affective.target, HOMEOSTATIC_TARGET);
    });

    it('should set somatic target to HOMEOSTATIC_TARGET', () => {
      assert.equal(protocol.registers.somatic.target, HOMEOSTATIC_TARGET);
    });

    it('should set sovereign target to PHI - 0.5', () => {
      const PHI = 1.618033988749895;
      assert.equal(protocol.registers.sovereign.target, PHI - 0.5);
    });

    it('should set cognitive rate to 0.02', () => {
      assert.equal(protocol.registers.cognitive.rate, 0.02);
    });

    it('should set affective rate to 0.03', () => {
      assert.equal(protocol.registers.affective.rate, 0.03);
    });

    it('should set somatic rate to 0.01', () => {
      assert.equal(protocol.registers.somatic.rate, 0.01);
    });

    it('should set sovereign rate to 0.005', () => {
      assert.equal(protocol.registers.sovereign.rate, 0.005);
    });

    it('should initialize vitality to 1.0', () => {
      assert.equal(protocol.vitality, 1.0);
    });

    it('should initialize alarms as empty array', () => {
      assert.deepEqual(protocol.alarms, []);
    });

    it('should initialize ticks to 0', () => {
      assert.equal(protocol.ticks, 0);
    });

    it('should have four registers', () => {
      assert.equal(Object.keys(protocol.registers).length, 4);
    });
  });

  describe('tick()', () => {
    it('should increment ticks counter', () => {
      protocol.tick();
      assert.equal(protocol.ticks, 1);
    });

    it('should increment ticks on multiple calls', () => {
      protocol.tick();
      protocol.tick();
      protocol.tick();
      assert.equal(protocol.ticks, 3);
    });

    it('should return adjustments object', () => {
      const result = protocol.tick();
      assert.ok(result.adjustments);
    });

    it('should return vitality in result', () => {
      const result = protocol.tick();
      assert.ok(typeof result.vitality === 'number');
    });

    it('should return adjustments for all registers', () => {
      const result = protocol.tick();
      assert.ok(result.adjustments.cognitive);
      assert.ok(result.adjustments.affective);
      assert.ok(result.adjustments.somatic);
      assert.ok(result.adjustments.sovereign);
    });

    it('should calculate error in adjustments', () => {
      const result = protocol.tick();
      assert.ok(typeof result.adjustments.cognitive.error === 'number');
    });

    it('should calculate correction in adjustments', () => {
      const result = protocol.tick();
      assert.ok(typeof result.adjustments.cognitive.correction === 'number');
    });

    it('should keep health between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        protocol.tick();
      }
      for (const reg of Object.values(protocol.registers)) {
        assert.ok(reg.health >= 0 && reg.health <= 1);
      }
    });

    it('should add warning alarm when health below 0.5', () => {
      protocol.registers.cognitive.health = 0.4;
      protocol.tick();
      const hasWarning = protocol.alarms.some(a => a.severity === 'warning' && a.register === 'cognitive');
      assert.ok(hasWarning);
    });

    it('should add critical alarm when health below 0.3', () => {
      protocol.registers.cognitive.health = 0.2;
      protocol.tick();
      const hasCritical = protocol.alarms.some(a => a.severity === 'critical' && a.register === 'cognitive');
      assert.ok(hasCritical);
    });

    it('should record tick number in alarm', () => {
      protocol.registers.cognitive.health = 0.2;
      protocol.tick();
      assert.equal(protocol.alarms[0].tick, 1);
    });

    it('should record register name in alarm', () => {
      protocol.registers.affective.health = 0.2;
      protocol.tick();
      const alarm = protocol.alarms.find(a => a.register === 'affective');
      assert.ok(alarm);
    });

    it('should not add alarm when health is healthy', () => {
      protocol.tick();
      assert.equal(protocol.alarms.length, 0);
    });
  });

  describe('updateVitality()', () => {
    it('should update vitality based on weighted health', () => {
      protocol.updateVitality();
      assert.ok(typeof protocol.vitality === 'number');
    });

    it('should calculate vitality as weighted average', () => {
      const PHI = 1.618033988749895;
      const weights = {
        cognitive: PHI,
        affective: 1.0,
        somatic: PHI - 1,
        sovereign: PHI * PHI,
      };
      let weightedSum = 0;
      let totalWeight = 0;
      for (const [name, reg] of Object.entries(protocol.registers)) {
        weightedSum += reg.health * weights[name];
        totalWeight += weights[name];
      }
      const expected = weightedSum / totalWeight;
      protocol.updateVitality();
      assert.ok(Math.abs(protocol.vitality - expected) < 0.001);
    });

    it('should decrease vitality when health decreases', () => {
      protocol.registers.cognitive.health = 0.5;
      protocol.updateVitality();
      assert.ok(protocol.vitality < 1.0);
    });

    it('should reflect sovereign health strongly due to high weight', () => {
      protocol.registers.sovereign.health = 0.1;
      protocol.updateVitality();
      assert.ok(protocol.vitality < 0.5);
    });
  });

  describe('damage()', () => {
    it('should reduce health of specified register', () => {
      protocol.damage('cognitive', 0.3);
      assert.equal(protocol.registers.cognitive.health, 0.7);
    });

    it('should not reduce health below 0', () => {
      protocol.damage('cognitive', 2.0);
      assert.equal(protocol.registers.cognitive.health, 0);
    });

    it('should update vitality after damage', () => {
      const initialVitality = protocol.vitality;
      protocol.damage('cognitive', 0.5);
      assert.ok(protocol.vitality < initialVitality);
    });

    it('should ignore invalid register names', () => {
      const initialHealth = protocol.registers.cognitive.health;
      protocol.damage('invalid', 0.5);
      assert.equal(protocol.registers.cognitive.health, initialHealth);
    });

    it('should damage affective register', () => {
      protocol.damage('affective', 0.2);
      assert.equal(protocol.registers.affective.health, 0.8);
    });

    it('should damage somatic register', () => {
      protocol.damage('somatic', 0.4);
      assert.equal(protocol.registers.somatic.health, 0.6);
    });

    it('should damage sovereign register', () => {
      protocol.damage('sovereign', 0.1);
      assert.equal(protocol.registers.sovereign.health, 0.9);
    });
  });

  describe('heal()', () => {
    it('should increase health of specified register', () => {
      protocol.registers.cognitive.health = 0.5;
      protocol.heal('cognitive', 0.3);
      assert.equal(protocol.registers.cognitive.health, 0.8);
    });

    it('should not increase health above 1', () => {
      protocol.heal('cognitive', 0.5);
      assert.equal(protocol.registers.cognitive.health, 1.0);
    });

    it('should update vitality after heal', () => {
      protocol.registers.cognitive.health = 0.5;
      protocol.updateVitality();
      const damagedVitality = protocol.vitality;
      protocol.heal('cognitive', 0.5);
      assert.ok(protocol.vitality > damagedVitality);
    });

    it('should ignore invalid register names', () => {
      protocol.registers.cognitive.health = 0.5;
      protocol.heal('invalid', 0.5);
      assert.equal(protocol.registers.cognitive.health, 0.5);
    });

    it('should heal affective register', () => {
      protocol.registers.affective.health = 0.3;
      protocol.heal('affective', 0.5);
      assert.equal(protocol.registers.affective.health, 0.8);
    });

    it('should heal somatic register', () => {
      protocol.registers.somatic.health = 0.2;
      protocol.heal('somatic', 0.6);
      assert.equal(protocol.registers.somatic.health, 0.8);
    });

    it('should heal sovereign register', () => {
      protocol.registers.sovereign.health = 0.4;
      protocol.heal('sovereign', 0.3);
      assert.equal(protocol.registers.sovereign.health, 0.7);
    });
  });

  describe('getState()', () => {
    it('should return registers state', () => {
      const state = protocol.getState();
      assert.ok(state.registers);
    });

    it('should return vitality', () => {
      const state = protocol.getState();
      assert.ok(typeof state.vitality === 'number');
    });

    it('should return alarms', () => {
      const state = protocol.getState();
      assert.ok(Array.isArray(state.alarms));
    });

    it('should return ticks', () => {
      const state = protocol.getState();
      assert.equal(state.ticks, 0);
    });

    it('should return homeostaticTarget', () => {
      const state = protocol.getState();
      assert.equal(state.homeostaticTarget, HOMEOSTATIC_TARGET);
    });

    it('should return phi constant', () => {
      const state = protocol.getState();
      const PHI = 1.618033988749895;
      assert.equal(state.phi, PHI);
    });

    it('should return heartbeat constant', () => {
      const state = protocol.getState();
      assert.equal(state.heartbeat, 873);
    });

    it('should include register health in state', () => {
      const state = protocol.getState();
      assert.ok(typeof state.registers.cognitive.health === 'number');
    });

    it('should include register target in state', () => {
      const state = protocol.getState();
      assert.ok(typeof state.registers.cognitive.target === 'number');
    });

    it('should include register deviation in state', () => {
      const state = protocol.getState();
      assert.ok(typeof state.registers.cognitive.deviation === 'number');
    });

    it('should limit alarms to last 10', () => {
      for (let i = 0; i < 20; i++) {
        protocol.alarms.push({ register: 'test', health: 0.1, tick: i, severity: 'critical' });
      }
      const state = protocol.getState();
      assert.equal(state.alarms.length, 10);
    });

    it('should return most recent alarms', () => {
      for (let i = 0; i < 20; i++) {
        protocol.alarms.push({ register: 'test', health: 0.1, tick: i, severity: 'critical' });
      }
      const state = protocol.getState();
      assert.equal(state.alarms[0].tick, 10);
    });
  });

  describe('clearAlarms()', () => {
    it('should clear all alarms', () => {
      protocol.alarms.push({ register: 'test', health: 0.1, tick: 1, severity: 'critical' });
      protocol.clearAlarms();
      assert.equal(protocol.alarms.length, 0);
    });

    it('should allow new alarms after clearing', () => {
      protocol.alarms.push({ register: 'test', health: 0.1, tick: 1, severity: 'critical' });
      protocol.clearAlarms();
      protocol.alarms.push({ register: 'new', health: 0.2, tick: 2, severity: 'warning' });
      assert.equal(protocol.alarms.length, 1);
    });
  });

  describe('homeostatic behavior', () => {
    it('should move health towards target over time', () => {
      protocol.registers.cognitive.health = 0.9;
      const initialError = Math.abs(protocol.registers.cognitive.health - protocol.registers.cognitive.target);
      for (let i = 0; i < 50; i++) {
        protocol.tick();
      }
      const finalError = Math.abs(protocol.registers.cognitive.health - protocol.registers.cognitive.target);
      assert.ok(finalError < initialError);
    });

    it('should maintain health within bounds after many ticks', () => {
      for (let i = 0; i < 1000; i++) {
        protocol.tick();
      }
      for (const reg of Object.values(protocol.registers)) {
        assert.ok(reg.health >= 0 && reg.health <= 1);
      }
    });

    it('should calculate deviation correctly', () => {
      protocol.registers.cognitive.health = 0.8;
      const state = protocol.getState();
      const expectedDeviation = Math.abs(0.8 - protocol.registers.cognitive.target);
      assert.equal(state.registers.cognitive.deviation, expectedDeviation);
    });
  });
});
