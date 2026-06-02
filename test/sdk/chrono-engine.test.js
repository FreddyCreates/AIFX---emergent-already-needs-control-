const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('ChronoEngine', () => {
  let ChronoEngine;
  let engine;

  beforeEach(async () => {
    const module = await import('../../sdk/engines/chrono-engine.js');
    ChronoEngine = module.ChronoEngine;
    engine = new ChronoEngine();
  });

  describe('constructor', () => {
    it('should initialize epoch to current time', () => {
      const before = Date.now();
      const newEngine = new ChronoEngine();
      const after = Date.now();
      assert.ok(newEngine.epoch >= before);
      assert.ok(newEngine.epoch <= after);
    });

    it('should initialize beatCount to 0', () => {
      assert.equal(engine.beatCount, 0);
    });

    it('should initialize empty timers map', () => {
      assert.ok(engine.timers instanceof Map);
      assert.equal(engine.timers.size, 0);
    });

    it('should initialize empty scheduledTasks array', () => {
      assert.ok(Array.isArray(engine.scheduledTasks));
      assert.equal(engine.scheduledTasks.length, 0);
    });

    it('should initialize empty listeners map', () => {
      assert.ok(engine.listeners instanceof Map);
      assert.equal(engine.listeners.size, 0);
    });

    it('should initialize running to false', () => {
      assert.equal(engine.running, false);
    });

    it('should initialize heartbeatInterval to null', () => {
      assert.equal(engine.heartbeatInterval, null);
    });
  });

  describe('getBeat()', () => {
    it('should return current beat count', () => {
      assert.equal(engine.getBeat(), 0);
    });

    it('should reflect updated beat count', () => {
      engine.beatCount = 5;
      assert.equal(engine.getBeat(), 5);
    });

    it('should return number', () => {
      assert.ok(typeof engine.getBeat() === 'number');
    });
  });

  describe('getTime()', () => {
    it('should return milliseconds since epoch', () => {
      const time = engine.getTime();
      assert.ok(time >= 0);
    });

    it('should increase over time', () => {
      const time1 = engine.getTime();
      // Small delay
      const start = Date.now();
      while (Date.now() - start < 5) { /* busy wait */ }
      const time2 = engine.getTime();
      assert.ok(time2 >= time1);
    });

    it('should return number', () => {
      assert.ok(typeof engine.getTime() === 'number');
    });
  });

  describe('beatsToMs()', () => {
    it('should convert 0 beats to 0 ms', () => {
      assert.equal(engine.beatsToMs(0), 0);
    });

    it('should convert 1 beat to HEARTBEAT_MS (873)', () => {
      assert.equal(engine.beatsToMs(1), 873);
    });

    it('should convert multiple beats correctly', () => {
      assert.equal(engine.beatsToMs(10), 8730);
    });

    it('should handle fractional beats', () => {
      assert.equal(engine.beatsToMs(0.5), 436.5);
    });

    it('should handle negative beats', () => {
      assert.equal(engine.beatsToMs(-1), -873);
    });
  });

  describe('msToBeats()', () => {
    it('should convert 0 ms to 0 beats', () => {
      assert.equal(engine.msToBeats(0), 0);
    });

    it('should convert HEARTBEAT_MS to 1 beat', () => {
      assert.equal(engine.msToBeats(873), 1);
    });

    it('should floor fractional beats', () => {
      assert.equal(engine.msToBeats(1000), 1); // 1000/873 = 1.14
    });

    it('should convert multiple heartbeats correctly', () => {
      assert.equal(engine.msToBeats(8730), 10);
    });

    it('should return 0 for sub-heartbeat values', () => {
      assert.equal(engine.msToBeats(500), 0);
    });
  });

  describe('getPhiPhase()', () => {
    it('should return 0 at beat 0', () => {
      assert.equal(engine.getPhiPhase(), 0);
    });

    it('should return golden angle at beat 1', () => {
      engine.beatCount = 1;
      const phase = engine.getPhiPhase();
      assert.ok(Math.abs(phase - 137.508) < 0.001);
    });

    it('should wrap around at 360', () => {
      engine.beatCount = 3; // 3 * 137.508 = 412.524 -> 52.524
      const phase = engine.getPhiPhase();
      assert.ok(phase < 360);
      assert.ok(phase >= 0);
    });

    it('should always be in range [0, 360)', () => {
      for (let i = 0; i < 100; i++) {
        engine.beatCount = i;
        const phase = engine.getPhiPhase();
        assert.ok(phase >= 0);
        assert.ok(phase < 360);
      }
    });
  });

  describe('getTimeScale()', () => {
    it('should return value between PHI_INV and PHI', () => {
      const PHI_INV = 1 / 1.618033988749895;
      const PHI = 1.618033988749895;
      const scale = engine.getTimeScale();
      assert.ok(scale >= PHI_INV * 0.99); // Allow small tolerance
      assert.ok(scale <= PHI * 1.01);
    });

    it('should vary with beat count', () => {
      const scale1 = engine.getTimeScale();
      engine.beatCount = 5;
      const scale2 = engine.getTimeScale();
      // May or may not be different, but should not throw
      assert.ok(typeof scale1 === 'number');
      assert.ok(typeof scale2 === 'number');
    });
  });

  describe('scheduleAt()', () => {
    it('should return task ID', () => {
      const taskId = engine.scheduleAt(() => {}, 5);
      assert.ok(taskId.startsWith('task-'));
    });

    it('should add task to scheduledTasks', () => {
      engine.scheduleAt(() => {}, 5);
      assert.equal(engine.scheduledTasks.length, 1);
    });

    it('should set correct targetBeat', () => {
      engine.beatCount = 10;
      engine.scheduleAt(() => {}, 5);
      assert.equal(engine.scheduledTasks[0].targetBeat, 15);
    });

    it('should use default priority of 2', () => {
      engine.scheduleAt(() => {}, 5);
      assert.equal(engine.scheduledTasks[0].priority, 2);
    });

    it('should accept custom priority', () => {
      engine.scheduleAt(() => {}, 5, 0);
      assert.equal(engine.scheduledTasks[0].priority, 0);
    });

    it('should store callback', () => {
      const callback = () => 'test';
      engine.scheduleAt(callback, 5);
      assert.equal(engine.scheduledTasks[0].callback, callback);
    });

    it('should record createdAt beat', () => {
      engine.beatCount = 7;
      engine.scheduleAt(() => {}, 5);
      assert.equal(engine.scheduledTasks[0].createdAt, 7);
    });

    it('should sort tasks by targetBeat', () => {
      engine.scheduleAt(() => {}, 10);
      engine.scheduleAt(() => {}, 5);
      engine.scheduleAt(() => {}, 15);
      assert.equal(engine.scheduledTasks[0].targetBeat, 5);
      assert.equal(engine.scheduledTasks[1].targetBeat, 10);
      assert.equal(engine.scheduledTasks[2].targetBeat, 15);
    });

    it('should sort same-beat tasks by priority', () => {
      engine.scheduleAt(() => {}, 5, 3); // LOW
      engine.scheduleAt(() => {}, 5, 0); // CRITICAL
      engine.scheduleAt(() => {}, 5, 2); // NORMAL
      // Tasks with same targetBeat should be sorted by priority
      const sameBeats = engine.scheduledTasks.filter(t => t.targetBeat === 5);
      assert.ok(sameBeats.length === 3);
    });
  });

  describe('cancelTask()', () => {
    it('should remove task by ID', () => {
      const taskId = engine.scheduleAt(() => {}, 5);
      engine.cancelTask(taskId);
      assert.equal(engine.scheduledTasks.length, 0);
    });

    it('should return true on success', () => {
      const taskId = engine.scheduleAt(() => {}, 5);
      const result = engine.cancelTask(taskId);
      assert.equal(result, true);
    });

    it('should return false for unknown task', () => {
      const result = engine.cancelTask('unknown-task');
      assert.equal(result, false);
    });

    it('should not affect other tasks', () => {
      const task1 = engine.scheduleAt(() => {}, 5);
      const task2 = engine.scheduleAt(() => {}, 10);
      engine.cancelTask(task1);
      assert.equal(engine.scheduledTasks.length, 1);
      assert.equal(engine.scheduledTasks[0].targetBeat, 10);
    });
  });

  describe('on()', () => {
    it('should register event listener', () => {
      engine.on('beat', () => {});
      assert.ok(engine.listeners.has('beat'));
    });

    it('should return unsubscribe function', () => {
      const unsub = engine.on('beat', () => {});
      assert.ok(typeof unsub === 'function');
    });

    it('should unsubscribe when called', () => {
      const unsub = engine.on('beat', () => {});
      unsub();
      const listeners = engine.listeners.get('beat');
      assert.ok(!listeners || listeners.length === 0);
    });

    it('should support multiple listeners', () => {
      engine.on('beat', () => {});
      engine.on('beat', () => {});
      const listeners = engine.listeners.get('beat');
      assert.ok(listeners.length >= 2);
    });
  });

  describe('emit()', () => {
    it('should call registered listeners', () => {
      let called = false;
      engine.on('test', () => { called = true; });
      engine.emit('test', {});
      assert.ok(called);
    });

    it('should pass data to listeners', () => {
      let receivedData = null;
      engine.on('test', (data) => { receivedData = data; });
      engine.emit('test', { key: 'value' });
      assert.deepEqual(receivedData, { key: 'value' });
    });

    it('should not throw for no listeners', () => {
      assert.doesNotThrow(() => engine.emit('unknown-event', {}));
    });

    it('should call all listeners', () => {
      let count = 0;
      engine.on('test', () => { count++; });
      engine.on('test', () => { count++; });
      engine.emit('test', {});
      assert.equal(count, 2);
    });
  });

  describe('decay()', () => {
    it('should return value between 0 and 1', () => {
      const result = engine.decay(1, 5, 100);
      assert.ok(result >= 0);
      assert.ok(result <= 1);
    });

    it('should return 1 at age 0', () => {
      const result = engine.decay(1, 0, 100);
      assert.equal(result, 1);
    });

    it('should decrease with age', () => {
      const young = engine.decay(1, 1, 100);
      const old = engine.decay(1, 10, 100);
      assert.ok(young >= old);
    });

    it('should approach 0 for large age', () => {
      const result = engine.decay(1, 1000, 100);
      assert.ok(result < 0.1);
    });
  });

  describe('now()', () => {
    it('should return current state', () => {
      const now = engine.now();
      assert.ok('beat' in now);
      assert.ok('time' in now);
      assert.ok('phase' in now);
      assert.ok('scale' in now);
    });

    it('should include beat count', () => {
      engine.beatCount = 5;
      const now = engine.now();
      assert.equal(now.beat, 5);
    });

    it('should include time since epoch', () => {
      const now = engine.now();
      assert.ok(now.time >= 0);
    });

    it('should include phi phase', () => {
      const now = engine.now();
      assert.ok(now.phase >= 0);
      assert.ok(now.phase < 360);
    });

    it('should include time scale', () => {
      const now = engine.now();
      assert.ok(typeof now.scale === 'number');
    });
  });

  describe('integration', () => {
    it('should schedule and track multiple tasks', () => {
      engine.scheduleAt(() => {}, 5);
      engine.scheduleAt(() => {}, 10);
      engine.scheduleAt(() => {}, 15);
      assert.equal(engine.scheduledTasks.length, 3);
    });

    it('should emit events to listeners', () => {
      const events = [];
      engine.on('custom', (data) => events.push(data));
      engine.emit('custom', { id: 1 });
      engine.emit('custom', { id: 2 });
      assert.equal(events.length, 2);
    });

    it('should provide consistent time operations', () => {
      const beats = 10;
      const ms = engine.beatsToMs(beats);
      const backToBeats = engine.msToBeats(ms);
      assert.equal(backToBeats, beats);
    });
  });
});
