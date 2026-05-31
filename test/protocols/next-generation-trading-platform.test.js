const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('NextGenerationTradingPlatformProtocol', () => {
  let NextGenerationTradingPlatformProtocol;
  let EXECUTION_MODES;
  let ROLLOUT_STAGES;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/next-generation-trading-platform-protocol.js');
    NextGenerationTradingPlatformProtocol = module.NextGenerationTradingPlatformProtocol;
    EXECUTION_MODES = module.EXECUTION_MODES;
    ROLLOUT_STAGES = module.ROLLOUT_STAGES;
    protocol = new NextGenerationTradingPlatformProtocol();
    protocol.createAccount({ accountId: 'acct-1', cash: 50000 });
    protocol.setRiskLimits('acct-1', { maxOrderNotional: 50000, maxPositionNotional: 100000 });
  });

  it('defines product target and measurable platform goals', () => {
    const definition = protocol.getPlatformDefinition();

    assert.ok(definition.productTarget.segments.includes('retail'));
    assert.ok(definition.productTarget.segments.includes('professional'));
    assert.ok(definition.productTarget.markets.includes('spot'));
    assert.ok(definition.productTarget.markets.includes('derivatives'));
    assert.ok(definition.productTarget.custody.includes('custodial'));
    assert.ok(definition.productTarget.custody.includes('non-custodial'));

    assert.equal(typeof definition.goals.latencyMsP99, 'number');
    assert.equal(typeof definition.goals.uptimeSLO, 'number');
    assert.equal(typeof definition.goals.executionQualityBps, 'number');
    assert.equal(definition.goals.riskLimitBreachesPerDay, 0);
    assert.equal(definition.goals.trustAndSafety.immutableAuditTrail, true);
  });

  it('runs first milestone vertical slice end-to-end', () => {
    const result = protocol.runVerticalSlice({
      marketData: { symbol: 'BTC-USD', bid: 49890, ask: 49910, last: 49900 },
      order: {
        accountId: 'acct-1',
        symbol: 'BTC-USD',
        side: 'buy',
        quantity: 0.1,
        mode: EXECUTION_MODES.ADVISORY,
        idempotencyKey: 'slice-1',
      },
    });

    assert.equal(result.receipt.status, 'filled');
    assert.ok(result.milestones.includes('market-data'));
    assert.ok(result.milestones.includes('simulated-fill'));

    const portfolio = protocol.getPortfolio('acct-1');
    assert.ok(portfolio.positions['BTC-USD'] > 0);
    assert.ok(portfolio.cash < 50000);

    const replay = protocol.replayByIdempotencyKey('slice-1');
    assert.equal(replay.orderId, result.receipt.orderId);
  });

  it('enforces risk-first controls using kill switch and circuit breaker', () => {
    protocol.ingestMarketData({ symbol: 'ETH-USD', bid: 3000, ask: 3005, last: 3002 });

    protocol.setKillSwitch(true);
    const killSwitchReceipt = protocol.submitOrder({
      accountId: 'acct-1',
      symbol: 'ETH-USD',
      side: 'buy',
      quantity: 1,
      mode: EXECUTION_MODES.ADVISORY,
    });
    assert.equal(killSwitchReceipt.status, 'rejected');
    assert.equal(killSwitchReceipt.reason, 'kill-switch-enabled');

    protocol.setKillSwitch(false);
    protocol.setCircuitBreaker('ETH-USD', 'open');
    const breakerReceipt = protocol.submitOrder({
      accountId: 'acct-1',
      symbol: 'ETH-USD',
      side: 'buy',
      quantity: 1,
      mode: EXECUTION_MODES.ADVISORY,
    });
    assert.equal(breakerReceipt.status, 'rejected');
    assert.equal(breakerReceipt.reason, 'circuit-breaker-open');
  });

  it('keeps advisory and auto-execution separated by rollout controls', () => {
    protocol.ingestMarketData({ symbol: 'SOL-USD', bid: 130, ask: 131, last: 130.5 });

    const blockedAuto = protocol.submitOrder({
      accountId: 'acct-1',
      symbol: 'SOL-USD',
      side: 'buy',
      quantity: 10,
      mode: EXECUTION_MODES.AUTO,
    });

    assert.equal(blockedAuto.status, 'rejected');
    assert.equal(blockedAuto.reason, 'auto-execution-disabled');

    protocol.setRolloutStage(ROLLOUT_STAGES.PRODUCTION);

    const allowedAuto = protocol.submitOrder({
      accountId: 'acct-1',
      symbol: 'SOL-USD',
      side: 'buy',
      quantity: 10,
      mode: EXECUTION_MODES.AUTO,
    });

    assert.equal(allowedAuto.status, 'filled');
    assert.equal(allowedAuto.route.settlement, 'real');
  });

  it('emits tamper-evident audit chain and telemetry snapshot', () => {
    protocol.ingestMarketData({ symbol: 'ADA-USD', bid: 0.59, ask: 0.6, last: 0.595 });
    protocol.submitOrder({
      accountId: 'acct-1',
      symbol: 'ADA-USD',
      side: 'buy',
      quantity: 100,
      mode: EXECUTION_MODES.ADVISORY,
      idempotencyKey: 'audit-1',
    });

    const telemetry = protocol.getTelemetrySnapshot();
    assert.equal(telemetry.metrics.ordersFilled, 1);
    assert.ok(telemetry.eventCount >= 3);

    const compliance = protocol.getComplianceSnapshot('acct-1');
    assert.equal(compliance.checks.kyc, true);
    assert.equal(compliance.checks.aml, true);
  });
});
