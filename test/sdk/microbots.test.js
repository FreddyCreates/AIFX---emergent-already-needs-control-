const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');

const { MicrobotBase, MicrobotRunner, STATES, PHI, PHI_INV, HEARTBEAT_MS } = require('../../sdk/microbots/microbot-base.js');

describe('MicrobotBase', () => {
  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      const bot = new MicrobotBase('test-bot', 'parent-bot');
      assert.equal(bot.name, 'test-bot');
      assert.equal(bot.parentBot, 'parent-bot');
      assert.ok(bot.instanceId.startsWith('test-bot-'));
      assert.equal(bot.state, STATES.IDLE);
      assert.equal(bot.ticks, 0);
      assert.deepEqual(bot.errors, []);
      assert.equal(bot.results, null);
    });

    it('should accept config parameter', () => {
      const config = { maxRetries: 3, timeout: 5000 };
      const bot = new MicrobotBase('test', 'parent', config);
      assert.deepEqual(bot.config, config);
    });

    it('should initialize vitals', () => {
      const bot = new MicrobotBase('test', 'parent');
      assert.equal(bot.vitals.ticksPerSecond, 0);
      assert.equal(bot.vitals.health, 100);
      assert.equal(bot.vitals.errorRate, 0);
    });
  });

  describe('spawn()', () => {
    it('should set state to SPAWNED', () => {
      const bot = new MicrobotBase('test', 'parent');
      bot.spawn();
      assert.equal(bot.state, STATES.SPAWNED);
    });

    it('should set spawnedAt timestamp', () => {
      const bot = new MicrobotBase('test', 'parent');
      const before = Date.now();
      bot.spawn();
      const after = Date.now();
      assert.ok(bot.spawnedAt >= before);
      assert.ok(bot.spawnedAt <= after);
    });

    it('should emit spawn event', () => {
      const bot = new MicrobotBase('test', 'parent');
      let eventData = null;
      bot.on('spawn', (data) => { eventData = data; });
      bot.spawn();
      assert.ok(eventData);
      assert.equal(eventData.name, 'test');
      assert.equal(eventData.parentBot, 'parent');
    });

    it('should return this for chaining', () => {
      const bot = new MicrobotBase('test', 'parent');
      const result = bot.spawn();
      assert.equal(result, bot);
    });
  });

  describe('run()', () => {
    it('should call spawn() if state is IDLE', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({ success: true });
      await bot.run();
      assert.ok(bot.spawnedAt !== null);
    });

    it('should set state to RUNNING during execution', async () => {
      const bot = new MicrobotBase('test', 'parent');
      let stateWhenRunning = null;
      bot._execute = async () => {
        stateWhenRunning = bot.state;
        return { done: true };
      };
      await bot.run();
      assert.equal(stateWhenRunning, STATES.RUNNING);
    });

    it('should set state to COMPLETE on success', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({ success: true });
      await bot.run();
      assert.equal(bot.state, STATES.COMPLETE);
    });

    it('should set state to FAILED on error', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => { throw new Error('Test error'); };
      await bot.run();
      assert.equal(bot.state, STATES.FAILED);
    });

    it('should store results on success', async () => {
      const bot = new MicrobotBase('test', 'parent');
      const expected = { data: [1, 2, 3] };
      bot._execute = async () => expected;
      await bot.run();
      assert.deepEqual(bot.results, expected);
    });

    it('should record error on failure', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => { throw new Error('Oops'); };
      await bot.run();
      assert.equal(bot.errors.length, 1);
      assert.equal(bot.errors[0].message, 'Oops');
    });

    it('should emit start event', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({});
      let startEvent = null;
      bot.on('start', (data) => { startEvent = data; });
      await bot.run({ input: 'value' });
      assert.ok(startEvent);
      assert.equal(startEvent.name, 'test');
    });

    it('should emit complete event on success', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({ done: true });
      let completeEvent = null;
      bot.on('complete', (data) => { completeEvent = data; });
      await bot.run();
      assert.ok(completeEvent);
      assert.ok(completeEvent.results);
      assert.ok(typeof completeEvent.duration === 'number');
    });

    it('should emit error event on failure', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => { throw new Error('Failure'); };
      let errorEvent = null;
      bot.on('error', (data) => { errorEvent = data; });
      await bot.run();
      assert.ok(errorEvent);
      assert.equal(errorEvent.error, 'Failure');
    });

    it('should pass input to _execute', async () => {
      const bot = new MicrobotBase('test', 'parent');
      let receivedInput = null;
      bot._execute = async (input) => {
        receivedInput = input;
        return {};
      };
      await bot.run({ key: 'value' });
      assert.deepEqual(receivedInput, { key: 'value' });
    });
  });

  describe('_execute()', () => {
    it('should throw error if not overridden', async () => {
      const bot = new MicrobotBase('test', 'parent');
      await assert.rejects(
        () => bot._execute({}),
        /must be implemented by subclass/
      );
    });
  });

  describe('shutdown()', () => {
    it('should set state to FAILED if running', async () => {
      const bot = new MicrobotBase('test', 'parent');
      let resolveExecute;
      bot._execute = () => new Promise((r) => { resolveExecute = r; });
      
      // Start running but don't await
      const runPromise = bot.run();
      
      // Wait a tick for state to change to RUNNING
      await new Promise(r => setTimeout(r, 10));
      
      bot.shutdown();
      assert.equal(bot.state, STATES.FAILED);
      
      // Clean up
      resolveExecute({});
      await runPromise;
    });

    it('should emit shutdown event', () => {
      const bot = new MicrobotBase('test', 'parent');
      let shutdownEvent = null;
      bot.on('shutdown', (data) => { shutdownEvent = data; });
      bot.shutdown();
      assert.ok(shutdownEvent);
      assert.equal(shutdownEvent.name, 'test');
    });

    it('should record shutdown error if running', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot.state = STATES.RUNNING;
      bot.shutdown();
      assert.ok(bot.errors.some(e => e.message.includes('Shutdown')));
    });
  });

  describe('tick()', () => {
    it('should increment tick count', () => {
      const bot = new MicrobotBase('test', 'parent');
      bot.tick();
      bot.tick();
      bot.tick();
      assert.equal(bot.ticks, 3);
    });

    it('should update lastTickAt', () => {
      const bot = new MicrobotBase('test', 'parent');
      const before = Date.now();
      bot.tick();
      const after = Date.now();
      assert.ok(bot.vitals.lastTickAt >= before);
      assert.ok(bot.vitals.lastTickAt <= after);
    });

    it('should calculate ticksPerSecond', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot.tick();
      await new Promise(r => setTimeout(r, 100));
      bot.tick();
      // Should be roughly 10 ticks per second (1 tick in ~100ms)
      assert.ok(bot.vitals.ticksPerSecond > 5);
      assert.ok(bot.vitals.ticksPerSecond < 20);
    });
  });

  describe('report()', () => {
    it('should return complete status report', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({ result: 42 });
      await bot.run();
      
      const report = bot.report();
      assert.equal(report.name, 'test');
      assert.equal(report.parentBot, 'parent');
      assert.ok(report.instanceId);
      assert.equal(report.state, STATES.COMPLETE);
      assert.equal(report.ticks, 0);
      assert.ok(typeof report.duration === 'number');
      assert.ok(report.vitals);
      assert.ok(Array.isArray(report.errors));
      assert.deepEqual(report.results, { result: 42 });
    });

    it('should limit errors to last 5', async () => {
      const bot = new MicrobotBase('test', 'parent');
      for (let i = 0; i < 10; i++) {
        bot.errors.push({ message: `error-${i}`, at: Date.now() });
      }
      const report = bot.report();
      assert.equal(report.errors.length, 5);
      assert.equal(report.errors[0].message, 'error-5');
    });
  });

  describe('on()', () => {
    it('should register event listeners', () => {
      const bot = new MicrobotBase('test', 'parent');
      const listener = () => {};
      bot.on('custom', listener);
      assert.ok(bot._listeners.custom);
      assert.ok(bot._listeners.custom.includes(listener));
    });

    it('should allow multiple listeners for same event', () => {
      const bot = new MicrobotBase('test', 'parent');
      bot.on('event', () => {});
      bot.on('event', () => {});
      assert.equal(bot._listeners.event.length, 2);
    });

    it('should return this for chaining', () => {
      const bot = new MicrobotBase('test', 'parent');
      const result = bot.on('event', () => {});
      assert.equal(result, bot);
    });
  });

  describe('_emit()', () => {
    it('should call all registered listeners', () => {
      const bot = new MicrobotBase('test', 'parent');
      let calls = 0;
      bot.on('event', () => { calls++; });
      bot.on('event', () => { calls++; });
      bot._emit('event', {});
      assert.equal(calls, 2);
    });

    it('should pass data to listeners', () => {
      const bot = new MicrobotBase('test', 'parent');
      let received = null;
      bot.on('event', (data) => { received = data; });
      bot._emit('event', { key: 'value' });
      assert.deepEqual(received, { key: 'value' });
    });

    it('should not throw if listener throws', () => {
      const bot = new MicrobotBase('test', 'parent');
      bot.on('event', () => { throw new Error('Listener error'); });
      assert.doesNotThrow(() => bot._emit('event', {}));
    });

    it('should handle events with no listeners', () => {
      const bot = new MicrobotBase('test', 'parent');
      assert.doesNotThrow(() => bot._emit('nonexistent', {}));
    });
  });

  describe('duration()', () => {
    it('should return 0 if not started', () => {
      const bot = new MicrobotBase('test', 'parent');
      assert.equal(bot.duration(), 0);
    });

    it('should return elapsed time', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => {
        await new Promise(r => setTimeout(r, 50));
        return {};
      };
      await bot.run();
      assert.ok(bot.duration() >= 50);
      assert.ok(bot.duration() < 200);
    });
  });

  describe('_updateVitals()', () => {
    it('should calculate state size', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({ data: 'test-data' });
      await bot.run();
      assert.ok(bot.vitals.stateSize > 0);
    });

    it('should calculate error rate', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({});
      bot.ticks = 10;
      bot.errors = [{ message: 'e1' }, { message: 'e2' }];
      await bot.run();
      assert.equal(bot.vitals.errorRate, 0.2);
    });

    it('should calculate health based on errors', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({});
      bot.errors = [{ message: 'e1' }, { message: 'e2' }, { message: 'e3' }];
      await bot.run();
      assert.equal(bot.vitals.health, 70); // 100 - 3 * 10
    });

    it('should not go below 0 health', async () => {
      const bot = new MicrobotBase('test', 'parent');
      bot._execute = async () => ({});
      for (let i = 0; i < 15; i++) {
        bot.errors.push({ message: `e${i}` });
      }
      await bot.run();
      assert.equal(bot.vitals.health, 0);
    });
  });

  describe('toString()', () => {
    it('should return readable string', () => {
      const bot = new MicrobotBase('test-bot', 'parent-bot');
      const str = bot.toString();
      assert.ok(str.includes('Microbot:test-bot'));
      assert.ok(str.includes('@parent-bot'));
      assert.ok(str.includes('state=idle'));
    });
  });
});

describe('MicrobotRunner', () => {
  describe('constructor', () => {
    it('should initialize with parent bot', () => {
      const runner = new MicrobotRunner('parent-bot');
      assert.equal(runner.parentBot, 'parent-bot');
      assert.deepEqual(runner.microbots, []);
    });
  });

  describe('register()', () => {
    it('should add microbot to registry', () => {
      const runner = new MicrobotRunner('parent');
      const bot = new MicrobotBase('test', 'parent');
      runner.register(bot);
      assert.equal(runner.microbots.length, 1);
      assert.equal(runner.microbots[0], bot);
    });

    it('should return this for chaining', () => {
      const runner = new MicrobotRunner('parent');
      const result = runner.register(new MicrobotBase('test', 'parent'));
      assert.equal(result, runner);
    });

    it('should allow multiple registrations', () => {
      const runner = new MicrobotRunner('parent');
      runner.register(new MicrobotBase('bot1', 'parent'));
      runner.register(new MicrobotBase('bot2', 'parent'));
      runner.register(new MicrobotBase('bot3', 'parent'));
      assert.equal(runner.microbots.length, 3);
    });
  });

  describe('runAll()', () => {
    it('should run all registered microbots', async () => {
      const runner = new MicrobotRunner('parent');
      
      const bot1 = new MicrobotBase('bot1', 'parent');
      bot1._execute = async () => ({ result: 1 });
      
      const bot2 = new MicrobotBase('bot2', 'parent');
      bot2._execute = async () => ({ result: 2 });
      
      runner.register(bot1).register(bot2);
      
      const results = await runner.runAll();
      assert.equal(results.length, 2);
    });

    it('should pass input to all microbots', async () => {
      const runner = new MicrobotRunner('parent');
      
      let receivedInputs = [];
      const bot1 = new MicrobotBase('bot1', 'parent');
      bot1._execute = async (input) => {
        receivedInputs.push(input);
        return {};
      };
      
      const bot2 = new MicrobotBase('bot2', 'parent');
      bot2._execute = async (input) => {
        receivedInputs.push(input);
        return {};
      };
      
      runner.register(bot1).register(bot2);
      await runner.runAll({ shared: 'data' });
      
      assert.equal(receivedInputs.length, 2);
      assert.deepEqual(receivedInputs[0], { shared: 'data' });
      assert.deepEqual(receivedInputs[1], { shared: 'data' });
    });

    it('should run microbots in parallel', async () => {
      const runner = new MicrobotRunner('parent');
      
      const startTime = Date.now();
      
      const bot1 = new MicrobotBase('bot1', 'parent');
      bot1._execute = async () => {
        await new Promise(r => setTimeout(r, 50));
        return { id: 1 };
      };
      
      const bot2 = new MicrobotBase('bot2', 'parent');
      bot2._execute = async () => {
        await new Promise(r => setTimeout(r, 50));
        return { id: 2 };
      };
      
      runner.register(bot1).register(bot2);
      await runner.runAll();
      
      const elapsed = Date.now() - startTime;
      // Should complete in ~50ms, not ~100ms if sequential
      assert.ok(elapsed < 100, `Expected < 100ms, got ${elapsed}ms`);
    });

    it('should return success status for each microbot', async () => {
      const runner = new MicrobotRunner('parent');
      
      const bot1 = new MicrobotBase('success-bot', 'parent');
      bot1._execute = async () => ({ done: true });
      
      const bot2 = new MicrobotBase('fail-bot', 'parent');
      bot2._execute = async () => { throw new Error('Failed'); };
      
      runner.register(bot1).register(bot2);
      const results = await runner.runAll();
      
      assert.equal(results[0].name, 'success-bot');
      assert.equal(results[0].success, true);
      assert.deepEqual(results[0].result, { done: true });
      assert.equal(results[0].error, null);
      
      // Note: MicrobotBase.run() catches errors internally and returns partial results
      // So Promise.allSettled sees it as fulfilled. We verify the error is recorded in the result.
      assert.equal(results[1].name, 'fail-bot');
      assert.equal(results[1].success, true); // run() doesn't throw, so it's "fulfilled"
      assert.ok(results[1].result.error === 'Failed' || results[1].result.partial === true);
    });

    it('should handle empty runner', async () => {
      const runner = new MicrobotRunner('parent');
      const results = await runner.runAll();
      assert.deepEqual(results, []);
    });
  });

  describe('reportAll()', () => {
    it('should return reports from all microbots', async () => {
      const runner = new MicrobotRunner('parent');
      
      const bot1 = new MicrobotBase('bot1', 'parent');
      bot1._execute = async () => ({ result: 1 });
      
      const bot2 = new MicrobotBase('bot2', 'parent');
      bot2._execute = async () => ({ result: 2 });
      
      runner.register(bot1).register(bot2);
      await runner.runAll();
      
      const reports = runner.reportAll();
      assert.equal(reports.length, 2);
      assert.equal(reports[0].name, 'bot1');
      assert.equal(reports[1].name, 'bot2');
    });

    it('should return reports even before running', () => {
      const runner = new MicrobotRunner('parent');
      runner.register(new MicrobotBase('bot1', 'parent'));
      
      const reports = runner.reportAll();
      assert.equal(reports.length, 1);
      assert.equal(reports[0].state, STATES.IDLE);
    });
  });
});

describe('Constants', () => {
  it('should export PHI (golden ratio)', () => {
    assert.ok(Math.abs(PHI - 1.618033988749895) < 0.0001);
  });

  it('should export PHI_INV (inverse golden ratio)', () => {
    assert.ok(Math.abs(PHI_INV - (1 / PHI)) < 0.0001);
  });

  it('should export HEARTBEAT_MS', () => {
    assert.equal(HEARTBEAT_MS, 873);
  });

  it('should export STATES object', () => {
    assert.equal(STATES.IDLE, 'idle');
    assert.equal(STATES.SPAWNED, 'spawned');
    assert.equal(STATES.RUNNING, 'running');
    assert.equal(STATES.REPORTING, 'reporting');
    assert.equal(STATES.COMPLETE, 'complete');
    assert.equal(STATES.FAILED, 'failed');
  });
});
