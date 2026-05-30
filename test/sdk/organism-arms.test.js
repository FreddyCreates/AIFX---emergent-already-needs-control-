const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('Organism Arms SDK', () => {
  let ArmRegistry, ARM_CLASSIFICATIONS, ArmExecutor, SenseActLoop;
  let registry, executor;

  beforeEach(async () => {
    const regModule = await import('../../sdk/organism-arms/src/arm-registry.js');
    ArmRegistry = regModule.ArmRegistry;
    ARM_CLASSIFICATIONS = regModule.ARM_CLASSIFICATIONS;

    const execModule = await import('../../sdk/organism-arms/src/arm-executor.js');
    ArmExecutor = execModule.ArmExecutor;

    const loopModule = await import('../../sdk/organism-arms/src/sense-act-loop.js');
    SenseActLoop = loopModule.SenseActLoop;

    registry = new ArmRegistry();
    executor = new ArmExecutor(registry);
  });

  describe('ArmRegistry', () => {
    it('registers an extension as an arm', () => {
      const ext = { id: 'EXT-024', slug: 'screen-commander', name: 'Screen Commander', wire: 'intelligence-wire/commander', engines: ['DOMControl'] };
      const arm = registry.registerArm(ext, async () => ({ navigated: true }));

      assert.equal(arm.slug, 'screen-commander');
      assert.equal(arm.armType, 'motor');
      assert.equal(arm.available, true);
      assert.equal(registry.size, 1);
    });

    it('classifies sensory, motor, and cognitive arms correctly', () => {
      const sensory = { id: 'EXT-010', slug: 'data-alchemist', name: 'Data Alchemist', wire: 'intelligence-wire/absorb', engines: [] };
      const motor = { id: 'EXT-024', slug: 'screen-commander', name: 'Screen Commander', wire: 'intelligence-wire/commander', engines: [] };
      const cognitive = { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', wire: 'intelligence-wire/fusion', engines: [] };

      registry.registerArm(sensory, async () => ({}));
      registry.registerArm(motor, async () => ({}));
      registry.registerArm(cognitive, async () => ({}));

      assert.equal(registry.getArmsByType('sensory').length, 1);
      assert.equal(registry.getArmsByType('motor').length, 1);
      assert.equal(registry.getArmsByType('cognitive').length, 1);
    });

    it('disables and enables arms', () => {
      const ext = { id: 'EXT-005', slug: 'code-sovereign', name: 'Code Sovereign', wire: 'intelligence-wire/code', engines: [] };
      registry.registerArm(ext, async () => ({}));

      registry.disableArm('code-sovereign');
      assert.equal(registry.getArm('code-sovereign').available, false);

      registry.enableArm('code-sovereign');
      assert.equal(registry.getArm('code-sovereign').available, true);
    });

    it('returns all arms sorted by priority', () => {
      const low = { id: 'EXT-004', slug: 'vision-weaver', name: 'Vision Weaver', wire: 'w', engines: [] };
      const high = { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', wire: 'w', engines: [] };

      registry.registerArm(low, async () => ({}));
      registry.registerArm(high, async () => ({}));

      const all = registry.getAllArms();
      assert.equal(all[0].slug, 'sovereign-mind'); // highest priority
    });
  });

  describe('ArmExecutor', () => {
    it('reaches an arm and returns a result', async () => {
      const ext = { id: 'EXT-024', slug: 'screen-commander', name: 'Screen Commander', wire: 'w', engines: [] };
      registry.registerArm(ext, async ({ intent, payload }) => ({ clicked: payload.target }));

      const result = await executor.reach({
        targetArm: 'screen-commander',
        intent: 'act',
        payload: { target: '#submit-btn' },
      });

      assert.equal(result.arm, 'screen-commander');
      assert.equal(result.armType, 'motor');
      assert.deepEqual(result.output, { clicked: '#submit-btn' });
      assert.ok(result.phiScore > 0);
    });

    it('throws when reaching an unavailable arm', async () => {
      const ext = { id: 'EXT-005', slug: 'code-sovereign', name: 'Code Sovereign', wire: 'w', engines: [] };
      registry.registerArm(ext, async () => ({}));
      registry.disableArm('code-sovereign');

      await assert.rejects(
        () => executor.reach({ targetArm: 'code-sovereign', intent: 'act', payload: {} }),
        /unavailable/
      );
    });

    it('reachAll executes multiple arms in parallel', async () => {
      const ext1 = { id: 'EXT-010', slug: 'data-alchemist', name: 'Data Alchemist', wire: 'w', engines: [] };
      const ext2 = { id: 'EXT-007', slug: 'sentinel-watch', name: 'Sentinel Watch', wire: 'w', engines: [] };

      registry.registerArm(ext1, async () => ({ absorbed: true }));
      registry.registerArm(ext2, async () => ({ threats: 0 }));

      const results = await executor.reachAll([
        { targetArm: 'data-alchemist', intent: 'sense', payload: {} },
        { targetArm: 'sentinel-watch', intent: 'sense', payload: {} },
      ]);

      assert.equal(results.length, 2);
    });

    it('tracks execution stats', async () => {
      const ext = { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', wire: 'w', engines: [] };
      registry.registerArm(ext, async () => ({ answer: 42 }));

      await executor.reach({ targetArm: 'sovereign-mind', intent: 'think', payload: {} });
      await executor.reach({ targetArm: 'sovereign-mind', intent: 'think', payload: {} });

      const stats = executor.getStats();
      assert.equal(stats.totalExecutions, 2);
      assert.equal(stats.failedExecutions, 0);
      assert.equal(stats.successRate, 1);
    });
  });

  describe('SenseActLoop', () => {
    it('runs a single sense→think→act cycle', async () => {
      const sensory = { id: 'EXT-010', slug: 'data-alchemist', name: 'Data Alchemist', wire: 'w', engines: [] };
      const cognitive = { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', wire: 'w', engines: [] };
      const motor = { id: 'EXT-024', slug: 'screen-commander', name: 'Screen Commander', wire: 'w', engines: [] };

      registry.registerArm(sensory, async () => ({ data: 'page content' }));
      registry.registerArm(cognitive, async () => ({ decision: 'click submit' }));
      registry.registerArm(motor, async () => ({ clicked: true }));

      const loop = new SenseActLoop(executor, {
        decisionFn: ({ sensed, thought }) => [
          { armSlug: 'screen-commander', action: { target: '#submit' } }
        ],
      });

      const result = await loop.runOnce({ url: 'https://example.com' });

      assert.equal(result.cycleNumber, 1);
      assert.ok(result.sensed.length > 0);
      assert.ok(result.thought.length > 0);
      assert.ok(result.acted.length > 0);
      assert.equal(loop.cycleCount, 1);
    });

    it('sense→think without acting when no decision function', async () => {
      const sensory = { id: 'EXT-010', slug: 'data-alchemist', name: 'Data Alchemist', wire: 'w', engines: [] };
      const cognitive = { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', wire: 'w', engines: [] };

      registry.registerArm(sensory, async () => ({ perceived: true }));
      registry.registerArm(cognitive, async () => ({ reasoned: true }));

      const loop = new SenseActLoop(executor);
      const result = await loop.runOnce();

      assert.equal(result.acted.length, 0);
      assert.ok(result.sensed.length > 0);
    });
  });

  describe('BidirectionalRelay', () => {
    let BidirectionalRelay, relay;

    beforeEach(async () => {
      const relayModule = await import('../../sdk/organism-arms/src/bidirectional-relay.js');
      BidirectionalRelay = relayModule.BidirectionalRelay;
      relay = new BidirectionalRelay(executor);
    });

    it('dispatches outbound motor commands', () => {
      const result = relay.dispatch({
        target: 'screen-commander',
        type: 'motor',
        intent: 'click',
        payload: { selector: '#btn' },
        urgency: 1.5,
      });

      assert.ok(result.commandId.startsWith('cmd-'));
      assert.equal(result.target, 'screen-commander');
      assert.equal(result.dispatched, true);
      assert.ok(result.phiWeight > 0);
    });

    it('receives inbound signals from extensions', () => {
      let received = null;
      relay.onSignal('threat', (signal) => { received = signal; });

      relay.receiveSignal({
        source: 'sentinel-watch',
        type: 'threat',
        payload: { severity: 'high', description: 'XSS detected' },
        priority: 0.9,
      });

      assert.ok(received !== null);
      assert.equal(received.source, 'sentinel-watch');
      assert.equal(received.type, 'threat');
    });

    it('dispatches and executes through ArmExecutor', async () => {
      const ext = { id: 'EXT-024', slug: 'screen-commander', name: 'Screen Commander', wire: 'w', engines: [] };
      registry.registerArm(ext, async ({ payload }) => ({ navigated: payload.url }));

      const result = await relay.dispatchAndExecute({
        target: 'screen-commander',
        type: 'motor',
        intent: 'navigate',
        payload: { url: 'https://example.com' },
      });

      assert.equal(result.dispatched, true);
      assert.equal(result.result.arm, 'screen-commander');
      assert.deepEqual(result.result.output, { navigated: 'https://example.com' });
    });

    it('tracks relay statistics', async () => {
      const ext = { id: 'EXT-005', slug: 'code-sovereign', name: 'Code Sovereign', wire: 'w', engines: [] };
      registry.registerArm(ext, async () => ({ written: true }));

      await relay.dispatchAndExecute({ target: 'code-sovereign', intent: 'write', payload: {} });
      relay.receiveSignal({ source: 'sentinel-watch', type: 'data', payload: {} });

      const stats = relay.getStats();
      assert.equal(stats.outboundCount, 1);
      assert.equal(stats.acknowledgedCount, 1);
      assert.equal(stats.inboundCount, 1);
      assert.ok(stats.phiEfficiency >= 0 && stats.phiEfficiency <= 1);
    });

    it('handles wildcard signal handler', () => {
      let caught = [];
      relay.onSignal('*', (signal) => { caught.push(signal); });

      relay.receiveSignal({ source: 'data-alchemist', type: 'data', payload: {} });
      relay.receiveSignal({ source: 'memory-palace', type: 'memory', payload: {} });

      assert.equal(caught.length, 2);
    });

    it('reports pending outbound commands', () => {
      relay.dispatch({ target: 'voice-forge', intent: 'speak', payload: { text: 'hello' } });
      relay.dispatch({ target: 'code-sovereign', intent: 'write', payload: {} });

      const pending = relay.getPendingOutbound();
      assert.equal(pending.length, 2);
      assert.equal(pending[0].acknowledged, false);
    });
  });
});

describe('Organism Arm Invocation Protocol (PROTO-253)', () => {
  let OrganismArmInvocationProtocol, ARM_PROTOCOL_STATES, ARM_TYPES, ARM_PROTOCOL_CONFIG;
  let calculateArmPriority, calculateArmBackoff, calculateCycleHealth, shouldEscalate;
  let protocol;

  beforeEach(async () => {
    const mod = await import('../../protocols/organism-arm-invocation-protocol.js');
    OrganismArmInvocationProtocol = mod.OrganismArmInvocationProtocol;
    ARM_PROTOCOL_STATES = mod.ARM_PROTOCOL_STATES;
    ARM_TYPES = mod.ARM_TYPES;
    ARM_PROTOCOL_CONFIG = mod.ARM_PROTOCOL_CONFIG;
    calculateArmPriority = mod.calculateArmPriority;
    calculateArmBackoff = mod.calculateArmBackoff;
    calculateCycleHealth = mod.calculateCycleHealth;
    shouldEscalate = mod.shouldEscalate;

    protocol = new OrganismArmInvocationProtocol();
  });

  it('starts in idle state', () => {
    assert.equal(protocol.state, 'idle');
  });

  it('transitions through sense→think→act states', () => {
    protocol.transition('sensing');
    assert.equal(protocol.state, 'sensing');
    protocol.transition('thinking');
    assert.equal(protocol.state, 'thinking');
    protocol.transition('acting');
    assert.equal(protocol.state, 'acting');
    protocol.transition('resting');
    assert.equal(protocol.state, 'resting');
  });

  it('rejects invalid state transitions', () => {
    assert.throws(() => protocol.transition('invalid_state'), /Invalid state/);
  });

  it('tracks arm health and success rate', () => {
    protocol.recordArmHealth('screen-commander', true, 50);
    protocol.recordArmHealth('screen-commander', true, 60);
    protocol.recordArmHealth('screen-commander', false, 900);

    assert.ok(Math.abs(protocol.getArmSuccessRate('screen-commander') - 2/3) < 0.001);
  });

  it('calculateArmBackoff grows exponentially with φ', () => {
    const delay0 = calculateArmBackoff(0);
    const delay1 = calculateArmBackoff(1);
    const delay2 = calculateArmBackoff(2);

    assert.equal(delay0, 873);
    assert.ok(delay1 > delay0);
    assert.ok(Math.abs(delay1 / delay0 - 1.618) < 0.01);
    assert.ok(delay2 > delay1);
  });

  it('calculateCycleHealth returns value between 0 and 1', () => {
    const health = calculateCycleHealth(5, 6, 500);
    assert.ok(health >= 0 && health <= 1);
  });

  it('shouldEscalate triggers when health is low and urgency is high', () => {
    assert.equal(shouldEscalate(0.3, 2.0), true);   // low health, high urgency
    assert.equal(shouldEscalate(0.8, 1.0), false);  // high health, low urgency
  });

  it('returns protocol metadata', () => {
    const meta = protocol.getMetadata();
    assert.equal(meta.protocolId, 'PROTO-253');
    assert.equal(meta.name, 'OrganismArmInvocationProtocol');
    assert.ok(meta.config.cycleIntervalMs > 0);
  });
});
