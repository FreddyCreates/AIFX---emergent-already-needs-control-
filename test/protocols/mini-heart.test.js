const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('MiniHeartProtocol', () => {
  let MiniHeartProtocol;
  let VITAL_TYPES;
  let protocol;
  const PHI = 1.618033988749895;
  const HEARTBEAT = 873;

  beforeEach(async () => {
    const module = await import('../../protocols/mini-heart-protocol.js');
    MiniHeartProtocol = module.MiniHeartProtocol;
    VITAL_TYPES = module.VITAL_TYPES;
    protocol = new MiniHeartProtocol('worker-1');
  });

  describe('VITAL_TYPES export', () => {
    it('should include cpu', () => {
      assert.ok(VITAL_TYPES.includes('cpu'));
    });

    it('should include memory', () => {
      assert.ok(VITAL_TYPES.includes('memory'));
    });

    it('should include latency', () => {
      assert.ok(VITAL_TYPES.includes('latency'));
    });

    it('should include throughput', () => {
      assert.ok(VITAL_TYPES.includes('throughput'));
    });

    it('should include errors', () => {
      assert.ok(VITAL_TYPES.includes('errors'));
    });

    it('should include uptime', () => {
      assert.ok(VITAL_TYPES.includes('uptime'));
    });

    it('should have exactly 6 vital types', () => {
      assert.equal(VITAL_TYPES.length, 6);
    });
  });

  describe('constructor', () => {
    it('should store worker id', () => {
      assert.equal(protocol.workerId, 'worker-1');
    });

    it('should accept different worker ids', () => {
      const p2 = new MiniHeartProtocol('worker-99');
      assert.equal(p2.workerId, 'worker-99');
    });

    it('should initialize beatCount to 0', () => {
      assert.equal(protocol.beatCount, 0);
    });

    it('should set startTime to approximately now', () => {
      const now = Date.now();
      assert.ok(protocol.startTime <= now);
      assert.ok(protocol.startTime >= now - 100);
    });

    it('should initialize lastBeat to null', () => {
      assert.equal(protocol.lastBeat, null);
    });

    it('should initialize cpu vital to 0.5', () => {
      assert.equal(protocol.vitals.cpu, 0.5);
    });

    it('should initialize memory vital to 0.5', () => {
      assert.equal(protocol.vitals.memory, 0.5);
    });

    it('should initialize latency vital to 50', () => {
      assert.equal(protocol.vitals.latency, 50);
    });

    it('should initialize throughput vital to 100', () => {
      assert.equal(protocol.vitals.throughput, 100);
    });

    it('should initialize errors vital to 0', () => {
      assert.equal(protocol.vitals.errors, 0);
    });

    it('should initialize uptime vital to 0', () => {
      assert.equal(protocol.vitals.uptime, 0);
    });

    it('should initialize healthScore to 100', () => {
      assert.equal(protocol.healthScore, 100);
    });

    it('should initialize empty alarms array', () => {
      assert.ok(Array.isArray(protocol.alarms));
      assert.equal(protocol.alarms.length, 0);
    });

    it('should initialize empty history array', () => {
      assert.ok(Array.isArray(protocol.history));
      assert.equal(protocol.history.length, 0);
    });
  });

  describe('beat()', () => {
    it('should increment beatCount', () => {
      protocol.beat();
      assert.equal(protocol.beatCount, 1);
    });

    it('should increment beatCount on multiple beats', () => {
      protocol.beat();
      protocol.beat();
      protocol.beat();
      assert.equal(protocol.beatCount, 3);
    });

    it('should set lastBeat timestamp', () => {
      const before = Date.now();
      protocol.beat();
      const after = Date.now();
      assert.ok(protocol.lastBeat >= before);
      assert.ok(protocol.lastBeat <= after);
    });

    it('should update uptime', () => {
      protocol.beat();
      assert.ok(protocol.vitals.uptime >= 0);
    });

    it('should return beat result object', () => {
      const result = protocol.beat();
      assert.ok(result);
      assert.equal(typeof result, 'object');
    });

    it('should return beat count in result', () => {
      const result = protocol.beat();
      assert.equal(result.beat, 1);
    });

    it('should return health score in result', () => {
      const result = protocol.beat();
      assert.ok('health' in result);
      assert.ok(result.health >= 0 && result.health <= 100);
    });

    it('should return vitals copy in result', () => {
      const result = protocol.beat();
      assert.ok(result.vitals);
      assert.ok('cpu' in result.vitals);
      assert.ok('memory' in result.vitals);
    });

    it('should return alarms count in result', () => {
      const result = protocol.beat();
      assert.ok('alarms' in result);
      assert.equal(typeof result.alarms, 'number');
    });

    it('should add to history', () => {
      protocol.beat();
      assert.equal(protocol.history.length, 1);
    });

    it('should include beat number in history entry', () => {
      protocol.beat();
      assert.equal(protocol.history[0].beat, 1);
    });

    it('should include health in history entry', () => {
      protocol.beat();
      assert.ok('health' in protocol.history[0]);
    });

    it('should include timestamp in history entry', () => {
      protocol.beat();
      assert.ok('timestamp' in protocol.history[0]);
    });

    it('should limit history to 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        protocol.beat();
      }
      assert.equal(protocol.history.length, 100);
    });

    it('should keep most recent history entries', () => {
      for (let i = 0; i < 150; i++) {
        protocol.beat();
      }
      assert.equal(protocol.history[0].beat, 51);
      assert.equal(protocol.history[99].beat, 150);
    });
  });

  describe('health score calculation', () => {
    it('should calculate perfect health with ideal vitals', () => {
      protocol.vitals.cpu = 0;
      protocol.vitals.memory = 0;
      protocol.vitals.latency = 0;
      protocol.vitals.errors = 0;
      protocol.vitals.throughput = 100;
      protocol.beat();
      assert.equal(protocol.healthScore, 100);
    });

    it('should reduce health score with high CPU', () => {
      protocol.vitals.cpu = 1.0;
      protocol.beat();
      assert.ok(protocol.healthScore < 100);
    });

    it('should reduce health score with high memory', () => {
      protocol.vitals.memory = 1.0;
      protocol.beat();
      assert.ok(protocol.healthScore < 100);
    });

    it('should reduce health score with high latency', () => {
      protocol.vitals.latency = 1000;
      protocol.beat();
      assert.ok(protocol.healthScore < 100);
    });

    it('should reduce health score with errors', () => {
      protocol.vitals.errors = 50;
      protocol.beat();
      assert.ok(protocol.healthScore < 100);
    });

    it('should reduce health score with low throughput', () => {
      protocol.vitals.throughput = 0;
      protocol.beat();
      assert.ok(protocol.healthScore < 100);
    });

    it('should calculate zero health with worst vitals', () => {
      protocol.vitals.cpu = 1.0;
      protocol.vitals.memory = 1.0;
      protocol.vitals.latency = 1000;
      protocol.vitals.errors = 100;
      protocol.vitals.throughput = 0;
      protocol.beat();
      assert.equal(protocol.healthScore, 0);
    });

    it('should round health score to integer', () => {
      protocol.vitals.cpu = 0.33;
      protocol.beat();
      assert.equal(protocol.healthScore, Math.round(protocol.healthScore));
    });
  });

  describe('checkAlarms()', () => {
    it('should set critical CPU alarm above 0.9', () => {
      protocol.vitals.cpu = 0.95;
      protocol.beat();
      const cpuAlarm = protocol.alarms.find(a => a.type === 'cpu');
      assert.ok(cpuAlarm);
      assert.equal(cpuAlarm.severity, 'critical');
    });

    it('should set warning CPU alarm above 0.7', () => {
      protocol.vitals.cpu = 0.75;
      protocol.beat();
      const cpuAlarm = protocol.alarms.find(a => a.type === 'cpu');
      assert.ok(cpuAlarm);
      assert.equal(cpuAlarm.severity, 'warning');
    });

    it('should not set CPU alarm below 0.7', () => {
      protocol.vitals.cpu = 0.5;
      protocol.beat();
      const cpuAlarm = protocol.alarms.find(a => a.type === 'cpu');
      assert.equal(cpuAlarm, undefined);
    });

    it('should set critical memory alarm above 0.9', () => {
      protocol.vitals.memory = 0.95;
      protocol.beat();
      const memAlarm = protocol.alarms.find(a => a.type === 'memory');
      assert.ok(memAlarm);
      assert.equal(memAlarm.severity, 'critical');
    });

    it('should set warning memory alarm above 0.8', () => {
      protocol.vitals.memory = 0.85;
      protocol.beat();
      const memAlarm = protocol.alarms.find(a => a.type === 'memory');
      assert.ok(memAlarm);
      assert.equal(memAlarm.severity, 'warning');
    });

    it('should not set memory alarm below 0.8', () => {
      protocol.vitals.memory = 0.7;
      protocol.beat();
      const memAlarm = protocol.alarms.find(a => a.type === 'memory');
      assert.equal(memAlarm, undefined);
    });

    it('should set critical latency alarm above 500ms', () => {
      protocol.vitals.latency = 600;
      protocol.beat();
      const latencyAlarm = protocol.alarms.find(a => a.type === 'latency');
      assert.ok(latencyAlarm);
      assert.equal(latencyAlarm.severity, 'critical');
    });

    it('should set warning latency alarm above 200ms', () => {
      protocol.vitals.latency = 300;
      protocol.beat();
      const latencyAlarm = protocol.alarms.find(a => a.type === 'latency');
      assert.ok(latencyAlarm);
      assert.equal(latencyAlarm.severity, 'warning');
    });

    it('should not set latency alarm below 200ms', () => {
      protocol.vitals.latency = 100;
      protocol.beat();
      const latencyAlarm = protocol.alarms.find(a => a.type === 'latency');
      assert.equal(latencyAlarm, undefined);
    });

    it('should set critical health alarm below 30', () => {
      protocol.vitals.cpu = 1.0;
      protocol.vitals.memory = 1.0;
      protocol.beat();
      const healthAlarm = protocol.alarms.find(a => a.type === 'health');
      assert.ok(healthAlarm);
      assert.equal(healthAlarm.severity, 'critical');
    });

    it('should set warning health alarm below 50', () => {
      protocol.vitals.cpu = 0.8;
      protocol.vitals.memory = 0.8;
      protocol.beat();
      const healthAlarm = protocol.alarms.find(a => a.type === 'health');
      assert.ok(healthAlarm);
      assert.equal(healthAlarm.severity, 'warning');
    });

    it('should include value in alarm', () => {
      protocol.vitals.cpu = 0.95;
      protocol.beat();
      const cpuAlarm = protocol.alarms.find(a => a.type === 'cpu');
      assert.equal(cpuAlarm.value, 0.95);
    });

    it('should clear alarms when vitals recover', () => {
      protocol.vitals.cpu = 0.95;
      protocol.beat();
      assert.ok(protocol.alarms.length > 0);
      
      protocol.vitals.cpu = 0.5;
      protocol.vitals.memory = 0.5;
      protocol.beat();
      const cpuAlarm = protocol.alarms.find(a => a.type === 'cpu');
      assert.equal(cpuAlarm, undefined);
    });

    it('should track multiple simultaneous alarms', () => {
      protocol.vitals.cpu = 0.95;
      protocol.vitals.memory = 0.95;
      protocol.vitals.latency = 600;
      protocol.beat();
      assert.ok(protocol.alarms.length >= 3);
    });
  });

  describe('updateVital()', () => {
    it('should update cpu vital', () => {
      protocol.updateVital('cpu', 0.8);
      assert.equal(protocol.vitals.cpu, 0.8);
    });

    it('should update memory vital', () => {
      protocol.updateVital('memory', 0.7);
      assert.equal(protocol.vitals.memory, 0.7);
    });

    it('should update latency vital', () => {
      protocol.updateVital('latency', 200);
      assert.equal(protocol.vitals.latency, 200);
    });

    it('should update throughput vital', () => {
      protocol.updateVital('throughput', 150);
      assert.equal(protocol.vitals.throughput, 150);
    });

    it('should update errors vital', () => {
      protocol.updateVital('errors', 5);
      assert.equal(protocol.vitals.errors, 5);
    });

    it('should update uptime vital', () => {
      protocol.updateVital('uptime', 3600);
      assert.equal(protocol.vitals.uptime, 3600);
    });

    it('should ignore invalid vital types', () => {
      protocol.updateVital('invalid', 999);
      assert.equal(protocol.vitals.invalid, undefined);
    });

    it('should not modify other vitals', () => {
      const originalMemory = protocol.vitals.memory;
      protocol.updateVital('cpu', 0.9);
      assert.equal(protocol.vitals.memory, originalMemory);
    });
  });

  describe('recordError()', () => {
    it('should increment errors count', () => {
      protocol.recordError();
      assert.equal(protocol.vitals.errors, 1);
    });

    it('should increment errors on multiple calls', () => {
      protocol.recordError();
      protocol.recordError();
      protocol.recordError();
      assert.equal(protocol.vitals.errors, 3);
    });

    it('should affect health score', () => {
      protocol.beat();
      const healthBefore = protocol.healthScore;
      for (let i = 0; i < 50; i++) {
        protocol.recordError();
      }
      protocol.beat();
      assert.ok(protocol.healthScore < healthBefore);
    });
  });

  describe('getStatus()', () => {
    it('should return status object', () => {
      const status = protocol.getStatus();
      assert.ok(status);
      assert.equal(typeof status, 'object');
    });

    it('should include workerId', () => {
      const status = protocol.getStatus();
      assert.equal(status.workerId, 'worker-1');
    });

    it('should include status level', () => {
      const status = protocol.getStatus();
      assert.ok(['healthy', 'degraded', 'unhealthy', 'critical'].includes(status.status));
    });

    it('should return healthy status when health >= 80', () => {
      protocol.beat();
      const status = protocol.getStatus();
      assert.equal(status.status, 'healthy');
    });

    it('should return degraded status when health 50-79', () => {
      protocol.vitals.cpu = 0.75;
      protocol.vitals.memory = 0.75;
      protocol.beat();
      const status = protocol.getStatus();
      assert.equal(status.status, 'degraded');
    });

    it('should return unhealthy status when health 30-49', () => {
      protocol.vitals.cpu = 0.9;
      protocol.vitals.memory = 0.85;
      protocol.beat();
      const status = protocol.getStatus();
      assert.equal(status.status, 'unhealthy');
    });

    it('should return critical status when health < 30', () => {
      protocol.vitals.cpu = 1.0;
      protocol.vitals.memory = 1.0;
      protocol.beat();
      const status = protocol.getStatus();
      assert.equal(status.status, 'critical');
    });

    it('should include health score', () => {
      protocol.beat();
      const status = protocol.getStatus();
      assert.ok('health' in status);
      assert.equal(status.health, protocol.healthScore);
    });

    it('should include vitals copy', () => {
      const status = protocol.getStatus();
      assert.ok(status.vitals);
      assert.ok('cpu' in status.vitals);
      assert.ok('memory' in status.vitals);
    });

    it('should include beatCount', () => {
      protocol.beat();
      protocol.beat();
      const status = protocol.getStatus();
      assert.equal(status.beatCount, 2);
    });

    it('should include uptime', () => {
      protocol.beat();
      const status = protocol.getStatus();
      assert.ok('uptime' in status);
    });

    it('should include alarms array', () => {
      const status = protocol.getStatus();
      assert.ok(Array.isArray(status.alarms));
    });

    it('should include lastBeat', () => {
      protocol.beat();
      const status = protocol.getStatus();
      assert.ok(status.lastBeat);
    });

    it('should include phi constant', () => {
      const status = protocol.getStatus();
      assert.equal(status.phi, PHI);
    });

    it('should include heartbeat constant', () => {
      const status = protocol.getStatus();
      assert.equal(status.heartbeat, HEARTBEAT);
    });

    it('should return copy of vitals (not reference)', () => {
      const status = protocol.getStatus();
      status.vitals.cpu = 999;
      assert.notEqual(protocol.vitals.cpu, 999);
    });

    it('should return copy of alarms (not reference)', () => {
      protocol.vitals.cpu = 0.95;
      protocol.beat();
      const status = protocol.getStatus();
      status.alarms.push({ type: 'test' });
      assert.notEqual(protocol.alarms.length, status.alarms.length);
    });
  });

  describe('getHistory()', () => {
    it('should return empty array initially', () => {
      const history = protocol.getHistory();
      assert.deepEqual(history, []);
    });

    it('should return history entries', () => {
      protocol.beat();
      protocol.beat();
      const history = protocol.getHistory();
      assert.equal(history.length, 2);
    });

    it('should return default of 50 entries', () => {
      for (let i = 0; i < 100; i++) {
        protocol.beat();
      }
      const history = protocol.getHistory();
      assert.equal(history.length, 50);
    });

    it('should accept custom limit', () => {
      for (let i = 0; i < 100; i++) {
        protocol.beat();
      }
      const history = protocol.getHistory(20);
      assert.equal(history.length, 20);
    });

    it('should return most recent entries', () => {
      for (let i = 0; i < 100; i++) {
        protocol.beat();
      }
      const history = protocol.getHistory(10);
      assert.equal(history[history.length - 1].beat, 100);
    });

    it('should return all if limit exceeds history', () => {
      protocol.beat();
      protocol.beat();
      const history = protocol.getHistory(100);
      assert.equal(history.length, 2);
    });
  });

  describe('integration tests', () => {
    it('should track worker health over time', () => {
      // Simulate healthy operation
      for (let i = 0; i < 10; i++) {
        protocol.beat();
      }
      assert.equal(protocol.beatCount, 10);
      assert.ok(protocol.healthScore >= 70);
    });

    it('should degrade health under load', () => {
      protocol.beat();
      const initialHealth = protocol.healthScore;
      
      // Simulate load
      protocol.updateVital('cpu', 0.85);
      protocol.updateVital('memory', 0.85);
      protocol.updateVital('latency', 300);
      protocol.beat();
      
      assert.ok(protocol.healthScore < initialHealth);
    });

    it('should track error accumulation', () => {
      protocol.beat();
      const initialHealth = protocol.healthScore;
      
      // Record many errors
      for (let i = 0; i < 30; i++) {
        protocol.recordError();
      }
      protocol.beat();
      
      assert.ok(protocol.healthScore < initialHealth);
      assert.equal(protocol.vitals.errors, 30);
    });

    it('should maintain history accurately', () => {
      const healthScores = [];
      for (let i = 0; i < 5; i++) {
        protocol.updateVital('cpu', i * 0.1);
        const result = protocol.beat();
        healthScores.push(result.health);
      }
      
      const history = protocol.getHistory(5);
      for (let i = 0; i < 5; i++) {
        assert.equal(history[i].health, healthScores[i]);
      }
    });

    it('should handle rapid vital updates', () => {
      for (let i = 0; i < 100; i++) {
        protocol.updateVital('cpu', Math.random());
        protocol.updateVital('memory', Math.random());
        protocol.beat();
      }
      assert.equal(protocol.beatCount, 100);
      assert.ok(protocol.healthScore >= 0);
      assert.ok(protocol.healthScore <= 100);
    });
  });

  describe('edge cases', () => {
    it('should handle zero values', () => {
      protocol.vitals.cpu = 0;
      protocol.vitals.memory = 0;
      protocol.vitals.latency = 0;
      protocol.vitals.errors = 0;
      protocol.beat();
      assert.ok(protocol.healthScore >= 0);
    });

    it('should handle maximum values', () => {
      protocol.vitals.cpu = 1.0;
      protocol.vitals.memory = 1.0;
      protocol.vitals.latency = 10000;
      protocol.vitals.errors = 1000;
      protocol.beat();
      assert.ok(protocol.healthScore >= 0);
    });

    it('should handle negative latency gracefully', () => {
      protocol.vitals.latency = -100;
      protocol.beat();
      // Should not crash
      assert.ok(protocol.healthScore >= 0);
    });

    it('should handle very high throughput', () => {
      protocol.vitals.throughput = 10000;
      protocol.beat();
      assert.ok(protocol.healthScore >= 0);
    });
  });
});
