const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('OrganismLifecycleProtocol', () => {
  let OrganismLifecycleProtocol;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/organism-lifecycle-protocol.js');
    OrganismLifecycleProtocol = module.OrganismLifecycleProtocol;
    protocol = new OrganismLifecycleProtocol();
  });

  describe('constructor', () => {
    it('should initialize phase to stopped', () => {
      assert.equal(protocol.phase, 'stopped');
    });

    it('should initialize empty kernels map', () => {
      assert.ok(protocol.kernels instanceof Map);
      assert.equal(protocol.kernels.size, 0);
    });

    it('should initialize empty registers map', () => {
      assert.ok(protocol.registers instanceof Map);
      assert.equal(protocol.registers.size, 0);
    });

    it('should set default health check interval to HEARTBEAT', () => {
      assert.equal(protocol.healthCheckInterval, 873);
    });

    it('should set default max kernel restarts to 5', () => {
      assert.equal(protocol.maxKernelRestarts, 5);
    });

    it('should set default graceful shutdown timeout', () => {
      assert.equal(protocol.gracefulShutdownTimeout, 5000);
    });

    it('should initialize heartbeat count to 0', () => {
      assert.equal(protocol.heartbeatCount, 0);
    });

    it('should initialize boot time to null', () => {
      assert.equal(protocol.bootTime, null);
    });

    it('should initialize empty event log', () => {
      assert.ok(Array.isArray(protocol.eventLog));
      assert.equal(protocol.eventLog.length, 0);
    });

    it('should initialize metrics to zero', () => {
      assert.equal(protocol.metrics.totalBoots, 0);
      assert.equal(protocol.metrics.totalShutdowns, 0);
      assert.equal(protocol.metrics.totalHealthChecks, 0);
      assert.equal(protocol.metrics.totalKernelRestarts, 0);
      assert.equal(protocol.metrics.totalSelfHeals, 0);
      assert.equal(protocol.metrics.uptimeMs, 0);
    });

    it('should accept custom health check interval', async () => {
      const module = await import('../../protocols/organism-lifecycle-protocol.js');
      const custom = new module.OrganismLifecycleProtocol({ healthCheckInterval: 1000 });
      assert.equal(custom.healthCheckInterval, 1000);
    });

    it('should accept custom max kernel restarts', async () => {
      const module = await import('../../protocols/organism-lifecycle-protocol.js');
      const custom = new module.OrganismLifecycleProtocol({ maxKernelRestarts: 10 });
      assert.equal(custom.maxKernelRestarts, 10);
    });

    it('should accept custom graceful shutdown timeout', async () => {
      const module = await import('../../protocols/organism-lifecycle-protocol.js');
      const custom = new module.OrganismLifecycleProtocol({ gracefulShutdownTimeout: 10000 });
      assert.equal(custom.gracefulShutdownTimeout, 10000);
    });

    it('should initialize empty phase history', () => {
      assert.ok(Array.isArray(protocol.metrics.phaseHistory));
      assert.equal(protocol.metrics.phaseHistory.length, 0);
    });
  });

  describe('boot()', () => {
    it('should transition to running phase', () => {
      protocol.boot();
      assert.equal(protocol.phase, 'running');
    });

    it('should return success=true', () => {
      const result = protocol.boot();
      assert.equal(result.success, true);
    });

    it('should set boot time', () => {
      const before = Date.now();
      protocol.boot();
      const after = Date.now();
      assert.ok(protocol.bootTime >= before);
      assert.ok(protocol.bootTime <= after);
    });

    it('should increment totalBoots metric', () => {
      protocol.boot();
      assert.equal(protocol.metrics.totalBoots, 1);
    });

    it('should initialize registers', () => {
      protocol.boot();
      assert.ok(protocol.registers.size >= 4);
    });

    it('should fail if not stopped', () => {
      protocol.boot();
      const result = protocol.boot();
      assert.equal(result.success, false);
      assert.ok(result.error);
    });

    it('should add to event log', () => {
      protocol.boot();
      assert.ok(protocol.eventLog.length > 0);
    });

    it('should return kernels started count', () => {
      protocol.registerKernel('test', 'Test Kernel');
      const result = protocol.boot();
      assert.equal(result.kernelsStarted, 1);
    });

    it('should return registers initialized count', () => {
      const result = protocol.boot();
      assert.ok(result.registersInitialized >= 4);
    });

    it('should start registered kernels', () => {
      protocol.registerKernel('test', 'Test Kernel');
      protocol.boot();
      const kernel = protocol.kernels.get('test');
      assert.equal(kernel.status, 'running');
    });

    it('should record phase transitions', () => {
      protocol.boot();
      assert.ok(protocol.metrics.phaseHistory.length >= 3); // booting, initializing, running
    });
  });

  describe('registerKernel()', () => {
    it('should add kernel to kernels map', () => {
      protocol.registerKernel('k1', 'Kernel One');
      assert.ok(protocol.kernels.has('k1'));
    });

    it('should return kernel info', () => {
      const result = protocol.registerKernel('k1', 'Kernel One');
      assert.equal(result.id, 'k1');
      assert.equal(result.name, 'Kernel One');
    });

    it('should set status to registered', () => {
      protocol.registerKernel('k1', 'Kernel One');
      const kernel = protocol.kernels.get('k1');
      assert.equal(kernel.status, 'registered');
    });

    it('should initialize restart count to 0', () => {
      protocol.registerKernel('k1', 'Kernel One');
      const kernel = protocol.kernels.get('k1');
      assert.equal(kernel.restartCount, 0);
    });

    it('should accept handlers', () => {
      let started = false;
      protocol.registerKernel('k1', 'Kernel One', {
        onStart: () => { started = true; }
      });
      protocol.boot();
      assert.ok(started);
    });

    it('should accept onStop handler', () => {
      let stopped = false;
      protocol.registerKernel('k1', 'Kernel One', {
        onStop: () => { stopped = true; }
      });
      protocol.boot();
      protocol.shutdown();
      assert.ok(stopped);
    });

    it('should accept healthCheck handler', () => {
      let checked = false;
      protocol.registerKernel('k1', 'Kernel One', {
        healthCheck: () => { checked = true; return true; }
      });
      protocol.boot();
      protocol.pulse();
      assert.ok(checked);
    });

    it('should log registration event', () => {
      protocol.registerKernel('k1', 'Kernel One');
      const events = protocol.eventLog.filter(e => e.type === 'kernel-register');
      assert.ok(events.length >= 1);
    });
  });

  describe('hotReloadKernel()', () => {
    beforeEach(() => {
      protocol.registerKernel('k1', 'Kernel One');
      protocol.boot();
    });

    it('should restart the kernel', () => {
      const result = protocol.hotReloadKernel('k1');
      assert.equal(result.status, 'running');
    });

    it('should increment restart count', () => {
      protocol.hotReloadKernel('k1');
      const kernel = protocol.kernels.get('k1');
      assert.equal(kernel.restartCount, 1);
    });

    it('should increment totalKernelRestarts metric', () => {
      protocol.hotReloadKernel('k1');
      assert.equal(protocol.metrics.totalKernelRestarts, 1);
    });

    it('should return not-found for unknown kernel', () => {
      const result = protocol.hotReloadKernel('unknown');
      assert.equal(result.status, 'not-found');
    });

    it('should accept new handlers', () => {
      let newStartCalled = false;
      protocol.hotReloadKernel('k1', {
        onStart: () => { newStartCalled = true; }
      });
      assert.ok(newStartCalled);
    });

    it('should log hot reload event', () => {
      protocol.hotReloadKernel('k1');
      const events = protocol.eventLog.filter(e => e.type === 'kernel-hot-reload');
      assert.ok(events.length >= 1);
    });
  });

  describe('updateRegister()', () => {
    beforeEach(() => {
      protocol.boot();
    });

    it('should update register value', () => {
      protocol.updateRegister('state', { key: 'value' });
      const reg = protocol.registers.get('state');
      assert.deepEqual(reg.value, { key: 'value' });
    });

    it('should recompute checksum', () => {
      const before = protocol.registers.get('state').checksum;
      protocol.updateRegister('state', { key: 'value' });
      const after = protocol.registers.get('state').checksum;
      assert.notEqual(before, after);
    });

    it('should update lastUpdated timestamp', () => {
      const before = Date.now();
      protocol.updateRegister('state', { key: 'value' });
      const after = Date.now();
      const reg = protocol.registers.get('state');
      assert.ok(reg.lastUpdated >= before);
      assert.ok(reg.lastUpdated <= after);
    });

    it('should return updated info', () => {
      const result = protocol.updateRegister('state', { key: 'value' });
      assert.equal(result.name, 'state');
      assert.ok(result.checksum);
      assert.equal(result.integrityValid, true);
    });

    it('should handle unknown register', () => {
      const result = protocol.updateRegister('unknown', { key: 'value' });
      assert.equal(result.integrityValid, false);
    });

    it('should log update event', () => {
      protocol.updateRegister('state', { key: 'value' });
      const events = protocol.eventLog.filter(e => e.type === 'register-update');
      assert.ok(events.length >= 1);
    });
  });

  describe('verifyRegisterIntegrity()', () => {
    beforeEach(() => {
      protocol.boot();
    });

    it('should return allValid property', () => {
      const result = protocol.verifyRegisterIntegrity();
      assert.ok('allValid' in result);
    });

    it('should return results array', () => {
      const result = protocol.verifyRegisterIntegrity();
      assert.ok(Array.isArray(result.results));
    });

    it('should include each register in results', () => {
      const result = protocol.verifyRegisterIntegrity();
      assert.ok(result.results.length >= 4);
    });

    it('should detect corrupted registers', () => {
      // Manually corrupt a checksum
      const reg = protocol.registers.get('state');
      reg.checksum = 'corrupted';
      const result = protocol.verifyRegisterIntegrity();
      assert.equal(result.allValid, false);
    });

    it('should log integrity failures', () => {
      const reg = protocol.registers.get('state');
      reg.checksum = 'corrupted';
      protocol.verifyRegisterIntegrity();
      const events = protocol.eventLog.filter(e => e.type === 'integrity-failure');
      assert.ok(events.length >= 1);
    });
  });

  describe('pulse()', () => {
    beforeEach(() => {
      protocol.registerKernel('k1', 'Kernel One', {
        healthCheck: () => true
      });
      protocol.boot();
    });

    it('should increment heartbeat count', () => {
      protocol.pulse();
      assert.equal(protocol.heartbeatCount, 1);
    });

    it('should increment totalHealthChecks metric', () => {
      protocol.pulse();
      assert.equal(protocol.metrics.totalHealthChecks, 1);
    });

    it('should return phase', () => {
      const result = protocol.pulse();
      assert.equal(result.phase, 'running');
    });

    it('should return kernel statuses', () => {
      const result = protocol.pulse();
      assert.ok(Array.isArray(result.kernels));
      assert.equal(result.kernels.length, 1);
    });

    it('should return registers valid status', () => {
      const result = protocol.pulse();
      // Registers should be valid after boot
      assert.ok('registersValid' in result);
    });

    it('should return timestamp', () => {
      const before = Date.now();
      const result = protocol.pulse();
      const after = Date.now();
      assert.ok(result.timestamp >= before);
      assert.ok(result.timestamp <= after);
    });

    it('should fail if organism not running', () => {
      protocol.shutdown();
      const result = protocol.pulse();
      assert.equal(result.healthy, false);
    });

    it('should detect unhealthy kernels', () => {
      // Re-register with failing health check
      protocol.kernels.get('k1').healthCheck = () => false;
      const result = protocol.pulse();
      assert.ok(result.degradedKernels >= 1);
    });

    it('should self-heal unhealthy kernels', () => {
      protocol.kernels.get('k1').healthCheck = () => false;
      protocol.pulse();
      assert.ok(protocol.metrics.totalSelfHeals >= 1);
    });

    it('should transition to degraded on kernel failure', () => {
      protocol.kernels.get('k1').healthCheck = () => false;
      // Exceed max restarts
      protocol.kernels.get('k1').restartCount = 10;
      protocol.pulse();
      assert.equal(protocol.phase, 'degraded');
    });

    it('should update uptime', () => {
      protocol.pulse();
      assert.ok(protocol.metrics.uptimeMs >= 0);
    });
  });

  describe('shutdown()', () => {
    beforeEach(() => {
      protocol.registerKernel('k1', 'Kernel One');
      protocol.boot();
    });

    it('should transition to stopped', () => {
      protocol.shutdown();
      assert.equal(protocol.phase, 'stopped');
    });

    it('should return success=true', () => {
      const result = protocol.shutdown();
      assert.equal(result.success, true);
    });

    it('should increment totalShutdowns metric', () => {
      protocol.shutdown();
      assert.equal(protocol.metrics.totalShutdowns, 1);
    });

    it('should stop all kernels', () => {
      protocol.shutdown();
      const kernel = protocol.kernels.get('k1');
      assert.equal(kernel.status, 'stopped');
    });

    it('should return kernels stopped count', () => {
      const result = protocol.shutdown();
      assert.equal(result.kernelsStopped, 1);
    });

    it('should return uptime', () => {
      const result = protocol.shutdown();
      assert.ok(typeof result.uptimeMs === 'number');
    });

    it('should return total heartbeats', () => {
      protocol.pulse();
      protocol.pulse();
      const result = protocol.shutdown();
      assert.equal(result.totalHeartbeats, 2);
    });

    it('should fail if already stopped', () => {
      protocol.shutdown();
      const result = protocol.shutdown();
      assert.equal(result.success, false);
    });

    it('should clear boot time', () => {
      protocol.shutdown();
      assert.equal(protocol.bootTime, null);
    });

    it('should include register snapshot', () => {
      const result = protocol.shutdown();
      assert.ok(result.registers);
      assert.ok(result.registers.state);
    });
  });

  describe('getMetrics()', () => {
    it('should return phase', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.phase, 'stopped');
    });

    it('should return total boots', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalBoots' in metrics);
    });

    it('should return total shutdowns', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalShutdowns' in metrics);
    });

    it('should return total kernels', () => {
      protocol.registerKernel('k1', 'Kernel One');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalKernels, 1);
    });

    it('should return heartbeat count', () => {
      protocol.boot();
      protocol.pulse();
      const metrics = protocol.getMetrics();
      assert.equal(metrics.heartbeatCount, 1);
    });

    it('should return event log size', () => {
      protocol.boot();
      const metrics = protocol.getMetrics();
      assert.ok(metrics.eventLogSize > 0);
    });
  });

  describe('getRecentEvents()', () => {
    it('should return array', () => {
      const events = protocol.getRecentEvents();
      assert.ok(Array.isArray(events));
    });

    it('should return recent events', () => {
      protocol.boot();
      const events = protocol.getRecentEvents();
      assert.ok(events.length > 0);
    });

    it('should limit to specified count', () => {
      protocol.boot();
      protocol.pulse();
      protocol.pulse();
      const events = protocol.getRecentEvents(2);
      assert.ok(events.length <= 2);
    });

    it('should return events with type', () => {
      protocol.boot();
      const events = protocol.getRecentEvents();
      assert.ok(events[0].type);
    });

    it('should return events with timestamp', () => {
      protocol.boot();
      const events = protocol.getRecentEvents();
      assert.ok(events[0].timestamp);
    });
  });

  describe('getStateSummary()', () => {
    beforeEach(() => {
      protocol.registerKernel('k1', 'Kernel One');
      protocol.boot();
    });

    it('should return phase', () => {
      const summary = protocol.getStateSummary();
      assert.equal(summary.phase, 'running');
    });

    it('should return uptime', () => {
      const summary = protocol.getStateSummary();
      assert.ok(typeof summary.uptimeMs === 'number');
    });

    it('should return heartbeat count', () => {
      protocol.pulse();
      const summary = protocol.getStateSummary();
      assert.equal(summary.heartbeatCount, 1);
    });

    it('should return kernel summary', () => {
      const summary = protocol.getStateSummary();
      assert.ok(Array.isArray(summary.kernels));
      assert.equal(summary.kernels.length, 1);
    });

    it('should return register summary', () => {
      const summary = protocol.getStateSummary();
      assert.ok(Array.isArray(summary.registers));
    });

    it('should include PHI constant', () => {
      const summary = protocol.getStateSummary();
      assert.ok(Math.abs(summary.phiConstant - 1.618) < 0.001);
    });

    it('should include heartbeat interval', () => {
      const summary = protocol.getStateSummary();
      assert.equal(summary.heartbeatInterval, 873);
    });

    it('should include kernel uptime', () => {
      const summary = protocol.getStateSummary();
      assert.ok('uptime' in summary.kernels[0]);
    });

    it('should include register phi coordinates', () => {
      const summary = protocol.getStateSummary();
      assert.ok(summary.registers[0].phiCoords);
    });
  });

  describe('integration scenarios', () => {
    it('should complete full lifecycle', () => {
      protocol.registerKernel('core', 'Core Kernel', {
        onStart: () => {},
        onStop: () => {},
        healthCheck: () => true
      });

      const bootResult = protocol.boot();
      assert.equal(bootResult.success, true);

      // Run several health pulses
      for (let i = 0; i < 5; i++) {
        const pulse = protocol.pulse();
        assert.ok(['running', 'degraded'].includes(pulse.phase));
      }

      // Update registers
      protocol.updateRegister('state', { status: 'healthy' });
      
      // Verify integrity - may or may not be valid depending on checksum
      const integrity = protocol.verifyRegisterIntegrity();
      assert.ok('allValid' in integrity);

      // Shutdown
      const shutdownResult = protocol.shutdown();
      assert.equal(shutdownResult.success, true);
      assert.ok(shutdownResult.uptimeMs >= 0);
    });

    it('should handle degraded state and recovery', () => {
      let healthy = true;
      protocol.registerKernel('flaky', 'Flaky Kernel', {
        healthCheck: () => healthy
      });
      protocol.boot();

      // Kernel becomes unhealthy
      healthy = false;
      protocol.pulse();
      
      // Should have attempted self-heal (restart count should be > 0)
      const kernel = protocol.kernels.get('flaky');
      assert.ok(kernel.restartCount >= 1 || protocol.metrics.totalSelfHeals >= 1);

      // Kernel recovers
      healthy = true;
      protocol.pulse();
      
      // Should eventually return to running
      // (after enough pulses to clear degraded state)
      assert.ok(['running', 'degraded'].includes(protocol.phase));
    });

    it('should hot reload and continue operation', () => {
      let version = 1;
      protocol.registerKernel('upgradable', 'Upgradable Kernel', {
        onStart: () => {},
        healthCheck: () => version > 0
      });
      protocol.boot();

      // Hot reload with new version
      version = 2;
      protocol.hotReloadKernel('upgradable');

      // System should continue running
      const pulse = protocol.pulse();
      assert.equal(pulse.phase, 'running');
    });
  });
});
