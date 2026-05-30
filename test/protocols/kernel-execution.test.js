const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('KernelExecutionProtocol', () => {
  let KernelExecutionProtocol;
  let PRIORITY;
  let protocol;
  const PHI = 1.618033988749895;
  const HEARTBEAT = 873;

  beforeEach(async () => {
    const module = await import('../../protocols/kernel-execution-protocol.js');
    KernelExecutionProtocol = module.KernelExecutionProtocol;
    PRIORITY = module.PRIORITY;
    protocol = new KernelExecutionProtocol();
  });

  describe('PRIORITY export', () => {
    it('should have CRITICAL = 0', () => {
      assert.equal(PRIORITY.CRITICAL, 0);
    });

    it('should have HIGH = 1', () => {
      assert.equal(PRIORITY.HIGH, 1);
    });

    it('should have NORMAL = 2', () => {
      assert.equal(PRIORITY.NORMAL, 2);
    });

    it('should have LOW = 3', () => {
      assert.equal(PRIORITY.LOW, 3);
    });

    it('should have exactly 4 priority levels', () => {
      assert.equal(Object.keys(PRIORITY).length, 4);
    });
  });

  describe('constructor', () => {
    it('should initialize empty kernels map', () => {
      assert.ok(protocol.kernels instanceof Map);
      assert.equal(protocol.kernels.size, 0);
    });

    it('should initialize empty queue', () => {
      assert.ok(Array.isArray(protocol.queue));
      assert.equal(protocol.queue.length, 0);
    });

    it('should initialize empty executionLog', () => {
      assert.ok(Array.isArray(protocol.executionLog));
      assert.equal(protocol.executionLog.length, 0);
    });

    it('should initialize beatNumber to 0', () => {
      assert.equal(protocol.beatNumber, 0);
    });

    it('should initialize totalExecutions to 0', () => {
      assert.equal(protocol.totalExecutions, 0);
    });
  });

  describe('loadKernel()', () => {
    it('should add kernel to kernels map', () => {
      const id = protocol.loadKernel({ id: 'test-kernel' }, () => {});
      assert.ok(protocol.kernels.has(id));
    });

    it('should return kernel ID', () => {
      const id = protocol.loadKernel({ id: 'my-kernel' }, () => {});
      assert.equal(id, 'my-kernel');
    });

    it('should store kernel name', () => {
      protocol.loadKernel({ id: 'k1', name: 'Test Kernel' }, () => {});
      assert.equal(protocol.kernels.get('k1').name, 'Test Kernel');
    });

    it('should use id as name if not provided', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.equal(protocol.kernels.get('k1').name, 'k1');
    });

    it('should default priority to NORMAL', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.equal(protocol.kernels.get('k1').priority, PRIORITY.NORMAL);
    });

    it('should accept custom priority', () => {
      protocol.loadKernel({ id: 'k1', priority: PRIORITY.CRITICAL }, () => {});
      assert.equal(protocol.kernels.get('k1').priority, PRIORITY.CRITICAL);
    });

    it('should default timeoutMs to HEARTBEAT', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.equal(protocol.kernels.get('k1').timeoutMs, HEARTBEAT);
    });

    it('should accept custom timeoutMs', () => {
      protocol.loadKernel({ id: 'k1', timeoutMs: 5000 }, () => {});
      assert.equal(protocol.kernels.get('k1').timeoutMs, 5000);
    });

    it('should default runOnBeat to true', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.equal(protocol.kernels.get('k1').runOnBeat, true);
    });

    it('should accept runOnBeat false', () => {
      protocol.loadKernel({ id: 'k1', runOnBeat: false }, () => {});
      assert.equal(protocol.kernels.get('k1').runOnBeat, false);
    });

    it('should default beatInterval to 1', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.equal(protocol.kernels.get('k1').beatInterval, 1);
    });

    it('should accept custom beatInterval', () => {
      protocol.loadKernel({ id: 'k1', beatInterval: 5 }, () => {});
      assert.equal(protocol.kernels.get('k1').beatInterval, 5);
    });

    it('should store executor function', () => {
      const executor = () => 'result';
      protocol.loadKernel({ id: 'k1' }, executor);
      assert.equal(protocol.kernels.get('k1').executor, executor);
    });

    it('should initialize lastRun to null', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.equal(protocol.kernels.get('k1').lastRun, null);
    });

    it('should initialize runCount to 0', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.equal(protocol.kernels.get('k1').runCount, 0);
    });

    it('should initialize totalTimeMs to 0', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.equal(protocol.kernels.get('k1').totalTimeMs, 0);
    });

    it('should initialize empty errors array', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      assert.deepEqual(protocol.kernels.get('k1').errors, []);
    });

    it('should allow loading multiple kernels', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      protocol.loadKernel({ id: 'k2' }, () => {});
      protocol.loadKernel({ id: 'k3' }, () => {});
      assert.equal(protocol.kernels.size, 3);
    });
  });

  describe('unloadKernel()', () => {
    it('should remove kernel from map', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      const result = protocol.unloadKernel('k1');
      assert.equal(result, true);
      assert.equal(protocol.kernels.has('k1'), false);
    });

    it('should return false for non-existent kernel', () => {
      const result = protocol.unloadKernel('nonexistent');
      assert.equal(result, false);
    });

    it('should not affect other kernels', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      protocol.loadKernel({ id: 'k2' }, () => {});
      protocol.unloadKernel('k1');
      assert.ok(protocol.kernels.has('k2'));
    });
  });

  describe('executeKernel()', () => {
    it('should return error for non-existent kernel', async () => {
      const result = await protocol.executeKernel('nonexistent');
      assert.ok(result.error);
      assert.ok(result.error.includes('not found'));
    });

    it('should execute kernel and return result', async () => {
      protocol.loadKernel({ id: 'k1' }, () => 'hello');
      const result = await protocol.executeKernel('k1');
      assert.equal(result.success, true);
      assert.equal(result.result, 'hello');
    });

    it('should pass context to executor', async () => {
      let receivedContext;
      protocol.loadKernel({ id: 'k1' }, (ctx) => { receivedContext = ctx; });
      await protocol.executeKernel('k1', { key: 'value' });
      assert.deepEqual(receivedContext, { key: 'value' });
    });

    it('should pass beatNumber to executor', async () => {
      let receivedBeat;
      protocol.loadKernel({ id: 'k1' }, (ctx, beat) => { receivedBeat = beat; });
      protocol.beatNumber = 42;
      await protocol.executeKernel('k1');
      assert.equal(receivedBeat, 42);
    });

    it('should measure duration', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      const result = await protocol.executeKernel('k1');
      assert.ok('duration' in result);
      assert.ok(result.duration >= 0);
    });

    it('should update kernel lastRun', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      const before = Date.now();
      await protocol.executeKernel('k1');
      const after = Date.now();
      const kernel = protocol.kernels.get('k1');
      assert.ok(kernel.lastRun >= before);
      assert.ok(kernel.lastRun <= after);
    });

    it('should increment kernel runCount', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      await protocol.executeKernel('k1');
      assert.equal(protocol.kernels.get('k1').runCount, 2);
    });

    it('should accumulate kernel totalTimeMs', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      await protocol.executeKernel('k1');
      assert.ok(protocol.kernels.get('k1').totalTimeMs >= 0);
    });

    it('should increment totalExecutions', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      await protocol.executeKernel('k1');
      assert.equal(protocol.totalExecutions, 2);
    });

    it('should add to executionLog on success', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      assert.equal(protocol.executionLog.length, 1);
    });

    it('should include kernelId in log entry', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      assert.equal(protocol.executionLog[0].kernelId, 'k1');
    });

    it('should include beat in log entry', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      protocol.beatNumber = 5;
      await protocol.executeKernel('k1');
      assert.equal(protocol.executionLog[0].beat, 5);
    });

    it('should include duration in log entry', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      assert.ok('duration' in protocol.executionLog[0]);
    });

    it('should include success in log entry', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      assert.equal(protocol.executionLog[0].success, true);
    });

    it('should include timestamp in log entry', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      const before = Date.now();
      await protocol.executeKernel('k1');
      const after = Date.now();
      assert.ok(protocol.executionLog[0].timestamp >= before);
      assert.ok(protocol.executionLog[0].timestamp <= after);
    });

    it('should limit executionLog to 1000 entries', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      for (let i = 0; i < 1100; i++) {
        await protocol.executeKernel('k1');
      }
      assert.equal(protocol.executionLog.length, 1000);
    });

    it('should handle async executors', async () => {
      protocol.loadKernel({ id: 'k1' }, async () => {
        await new Promise(r => setTimeout(r, 5));
        return 'async-result';
      });
      const result = await protocol.executeKernel('k1');
      assert.equal(result.success, true);
      assert.equal(result.result, 'async-result');
    });

    it('should handle executor errors', async () => {
      protocol.loadKernel({ id: 'k1' }, () => { throw new Error('test error'); });
      const result = await protocol.executeKernel('k1');
      assert.equal(result.success, false);
      assert.ok(result.error.includes('test error'));
    });

    it('should add error to kernel errors array', async () => {
      protocol.loadKernel({ id: 'k1' }, () => { throw new Error('test error'); });
      await protocol.executeKernel('k1');
      const kernel = protocol.kernels.get('k1');
      assert.equal(kernel.errors.length, 1);
      assert.ok(kernel.errors[0].message.includes('test error'));
    });

    it('should include beat in error entry', async () => {
      protocol.loadKernel({ id: 'k1' }, () => { throw new Error('test'); });
      protocol.beatNumber = 7;
      await protocol.executeKernel('k1');
      const kernel = protocol.kernels.get('k1');
      assert.equal(kernel.errors[0].beat, 7);
    });

    it('should limit kernel errors to 100', async () => {
      protocol.loadKernel({ id: 'k1' }, () => { throw new Error('test'); });
      for (let i = 0; i < 120; i++) {
        await protocol.executeKernel('k1');
      }
      assert.equal(protocol.kernels.get('k1').errors.length, 100);
    });

    it('should timeout long-running executors', async () => {
      protocol.loadKernel({ id: 'k1', timeoutMs: 50 }, async () => {
        await new Promise(r => setTimeout(r, 200));
        return 'never';
      });
      const result = await protocol.executeKernel('k1');
      assert.equal(result.success, false);
      assert.ok(result.error.includes('timeout'));
    });
  });

  describe('beat()', () => {
    it('should increment beatNumber', async () => {
      await protocol.beat();
      assert.equal(protocol.beatNumber, 1);
    });

    it('should increment beatNumber on multiple beats', async () => {
      await protocol.beat();
      await protocol.beat();
      await protocol.beat();
      assert.equal(protocol.beatNumber, 3);
    });

    it('should return beat result object', async () => {
      const result = await protocol.beat();
      assert.ok(result);
      assert.equal(typeof result, 'object');
    });

    it('should return beat number in result', async () => {
      await protocol.beat();
      const result = await protocol.beat();
      assert.equal(result.beat, 2);
    });

    it('should return executed count', async () => {
      const result = await protocol.beat();
      assert.ok('executed' in result);
    });

    it('should return results array', async () => {
      const result = await protocol.beat();
      assert.ok(Array.isArray(result.results));
    });

    it('should execute kernels with runOnBeat=true', async () => {
      let executed = false;
      protocol.loadKernel({ id: 'k1', runOnBeat: true }, () => { executed = true; });
      await protocol.beat();
      assert.equal(executed, true);
    });

    it('should not execute kernels with runOnBeat=false', async () => {
      let executed = false;
      protocol.loadKernel({ id: 'k1', runOnBeat: false }, () => { executed = true; });
      await protocol.beat();
      assert.equal(executed, false);
    });

    it('should respect beatInterval', async () => {
      let execCount = 0;
      protocol.loadKernel({ id: 'k1', beatInterval: 3 }, () => { execCount++; });
      await protocol.beat(); // beat 1
      await protocol.beat(); // beat 2
      await protocol.beat(); // beat 3 - executes
      await protocol.beat(); // beat 4
      await protocol.beat(); // beat 5
      await protocol.beat(); // beat 6 - executes
      assert.equal(execCount, 2);
    });

    it('should execute kernels by priority (CRITICAL first)', async () => {
      const order = [];
      protocol.loadKernel({ id: 'low', priority: PRIORITY.LOW }, () => { order.push('low'); });
      protocol.loadKernel({ id: 'critical', priority: PRIORITY.CRITICAL }, () => { order.push('critical'); });
      protocol.loadKernel({ id: 'normal', priority: PRIORITY.NORMAL }, () => { order.push('normal'); });
      await protocol.beat();
      assert.equal(order[0], 'critical');
    });

    it('should include kernel results in results array', async () => {
      protocol.loadKernel({ id: 'k1' }, () => 'result1');
      const result = await protocol.beat();
      assert.equal(result.results.length, 1);
      assert.equal(result.results[0].kernelId, 'k1');
    });

    it('should pass context to executed kernels', async () => {
      let receivedContext;
      protocol.loadKernel({ id: 'k1' }, (ctx) => { receivedContext = ctx; });
      await protocol.beat({ test: 'value' });
      assert.deepEqual(receivedContext, { test: 'value' });
    });

    it('should use phi-weighted scheduling', async () => {
      // CRITICAL (0) should have highest weight: PHI^0 = 1
      // LOW (3) should have lowest weight: PHI^-3 ≈ 0.236
      const order = [];
      protocol.loadKernel({ id: 'high', priority: PRIORITY.HIGH }, () => { order.push('high'); });
      protocol.loadKernel({ id: 'low', priority: PRIORITY.LOW }, () => { order.push('low'); });
      await protocol.beat();
      assert.equal(order[0], 'high');
      assert.equal(order[1], 'low');
    });
  });

  describe('getKernelStats()', () => {
    it('should return empty array with no kernels', () => {
      const stats = protocol.getKernelStats();
      assert.deepEqual(stats, []);
    });

    it('should return stats for each kernel', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      protocol.loadKernel({ id: 'k2' }, () => {});
      const stats = protocol.getKernelStats();
      assert.equal(stats.length, 2);
    });

    it('should include kernel id', () => {
      protocol.loadKernel({ id: 'my-kernel' }, () => {});
      const stats = protocol.getKernelStats();
      assert.equal(stats[0].id, 'my-kernel');
    });

    it('should include kernel name', () => {
      protocol.loadKernel({ id: 'k1', name: 'Test Kernel' }, () => {});
      const stats = protocol.getKernelStats();
      assert.equal(stats[0].name, 'Test Kernel');
    });

    it('should include priority', () => {
      protocol.loadKernel({ id: 'k1', priority: PRIORITY.HIGH }, () => {});
      const stats = protocol.getKernelStats();
      assert.equal(stats[0].priority, PRIORITY.HIGH);
    });

    it('should include runCount', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      await protocol.executeKernel('k1');
      const stats = protocol.getKernelStats();
      assert.equal(stats[0].runCount, 2);
    });

    it('should calculate avgTimeMs', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      const stats = protocol.getKernelStats();
      assert.ok('avgTimeMs' in stats[0]);
      assert.ok(stats[0].avgTimeMs >= 0);
    });

    it('should return avgTimeMs 0 when no runs', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      const stats = protocol.getKernelStats();
      assert.equal(stats[0].avgTimeMs, 0);
    });

    it('should include errorCount', async () => {
      protocol.loadKernel({ id: 'k1' }, () => { throw new Error('test'); });
      await protocol.executeKernel('k1');
      await protocol.executeKernel('k1');
      const stats = protocol.getKernelStats();
      assert.equal(stats[0].errorCount, 2);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
      assert.equal(typeof metrics, 'object');
    });

    it('should include kernelCount', () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      protocol.loadKernel({ id: 'k2' }, () => {});
      const metrics = protocol.getMetrics();
      assert.equal(metrics.kernelCount, 2);
    });

    it('should include totalExecutions', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      await protocol.executeKernel('k1');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalExecutions, 2);
    });

    it('should include beatNumber', async () => {
      await protocol.beat();
      await protocol.beat();
      const metrics = protocol.getMetrics();
      assert.equal(metrics.beatNumber, 2);
    });

    it('should include recentLogs', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      await protocol.executeKernel('k1');
      const metrics = protocol.getMetrics();
      assert.ok(Array.isArray(metrics.recentLogs));
      assert.equal(metrics.recentLogs.length, 1);
    });

    it('should limit recentLogs to 20', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      for (let i = 0; i < 50; i++) {
        await protocol.executeKernel('k1');
      }
      const metrics = protocol.getMetrics();
      assert.equal(metrics.recentLogs.length, 20);
    });

    it('should include phi constant', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.phi, PHI);
    });

    it('should include heartbeat constant', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.heartbeat, HEARTBEAT);
    });
  });

  describe('integration tests', () => {
    it('should coordinate multiple kernels', async () => {
      const results = [];
      protocol.loadKernel({ id: 'kernel-a', priority: PRIORITY.HIGH }, () => {
        results.push('A');
        return 'A-done';
      });
      protocol.loadKernel({ id: 'kernel-b', priority: PRIORITY.LOW }, () => {
        results.push('B');
        return 'B-done';
      });
      
      const beatResult = await protocol.beat();
      assert.equal(beatResult.executed, 2);
      assert.equal(results[0], 'A'); // High priority first
    });

    it('should track metrics across beats', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      for (let i = 0; i < 10; i++) {
        await protocol.beat();
      }
      const metrics = protocol.getMetrics();
      assert.equal(metrics.beatNumber, 10);
      assert.equal(metrics.totalExecutions, 10);
    });

    it('should handle kernel unload during operation', async () => {
      protocol.loadKernel({ id: 'k1' }, () => 'result');
      await protocol.beat();
      protocol.unloadKernel('k1');
      const result = await protocol.beat();
      assert.equal(result.executed, 0);
    });

    it('should maintain statistics accurately', async () => {
      protocol.loadKernel({ id: 'k1' }, async () => {
        await new Promise(r => setTimeout(r, 5));
        return 'result';
      });
      
      for (let i = 0; i < 5; i++) {
        await protocol.executeKernel('k1');
      }
      
      const stats = protocol.getKernelStats();
      assert.equal(stats[0].runCount, 5);
      assert.ok(stats[0].avgTimeMs >= 5);
    });
  });

  describe('edge cases', () => {
    it('should handle empty context', async () => {
      protocol.loadKernel({ id: 'k1' }, () => 'result');
      const result = await protocol.beat();
      assert.equal(result.executed, 1);
    });

    it('should handle kernel that returns undefined', async () => {
      protocol.loadKernel({ id: 'k1' }, () => {});
      const result = await protocol.executeKernel('k1');
      assert.equal(result.success, true);
      assert.equal(result.result, undefined);
    });

    it('should handle kernel that returns null', async () => {
      protocol.loadKernel({ id: 'k1' }, () => null);
      const result = await protocol.executeKernel('k1');
      assert.equal(result.success, true);
      assert.equal(result.result, null);
    });

    it('should handle kernel that returns object', async () => {
      protocol.loadKernel({ id: 'k1' }, () => ({ key: 'value' }));
      const result = await protocol.executeKernel('k1');
      assert.deepEqual(result.result, { key: 'value' });
    });

    it('should handle same priority kernels', async () => {
      protocol.loadKernel({ id: 'k1', priority: PRIORITY.NORMAL }, () => 'a');
      protocol.loadKernel({ id: 'k2', priority: PRIORITY.NORMAL }, () => 'b');
      const result = await protocol.beat();
      assert.equal(result.executed, 2);
    });
  });
});
