/**
 * Tests for @medina/aifx-foundation-model
 *
 * Validates core AIFX foundation model functionality:
 * - AIFXCore initialization and task processing
 * - TickProcessor statistics
 * - ChartPatternRecognizer detection
 * - ExchangeConnector normalization
 * - RegulatoryComplianceEngine evaluation
 * - OrderFlowAnalyzer analysis
 * - MarketAnalysisEngine signal generation
 * - AIFX Protocol
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

let AIFXCore, TickProcessor, ChartPatternRecognizer, ExchangeConnector;
let RegulatoryComplianceEngine, OrderFlowAnalyzer, MarketAnalysisEngine;
let AIFXProtocol, ANALYSIS_TYPES, COMPLIANCE_MODES;
let AIFX_CONFIG, SUPPORTED_EXCHANGES, REGULATORY_FRAMEWORKS;

const load = async () => {
  const core = await import('../../sdk/aifx-foundation-model/src/aifx-core.js');
  AIFXCore = core.AIFXCore;
  const tp = await import('../../sdk/aifx-foundation-model/src/tick-processor.js');
  TickProcessor = tp.TickProcessor;
  const cpr = await import('../../sdk/aifx-foundation-model/src/chart-pattern-recognizer.js');
  ChartPatternRecognizer = cpr.ChartPatternRecognizer;
  const ec = await import('../../sdk/aifx-foundation-model/src/exchange-connector.js');
  ExchangeConnector = ec.ExchangeConnector;
  const rce = await import('../../sdk/aifx-foundation-model/src/regulatory-compliance-engine.js');
  RegulatoryComplianceEngine = rce.RegulatoryComplianceEngine;
  const ofa = await import('../../sdk/aifx-foundation-model/src/order-flow-analyzer.js');
  OrderFlowAnalyzer = ofa.OrderFlowAnalyzer;
  const mae = await import('../../sdk/aifx-foundation-model/src/market-analysis-engine.js');
  MarketAnalysisEngine = mae.MarketAnalysisEngine;
  const proto = await import('../../protocols/aifx-foundation-market-intelligence-protocol.js');
  AIFXProtocol = proto.AIFXProtocol;
  ANALYSIS_TYPES = proto.ANALYSIS_TYPES;
  COMPLIANCE_MODES = proto.COMPLIANCE_MODES;
  const constants = await import('../../sdk/aifx-foundation-model/src/constants.js');
  AIFX_CONFIG = constants.AIFX_CONFIG;
  SUPPORTED_EXCHANGES = constants.SUPPORTED_EXCHANGES;
  REGULATORY_FRAMEWORKS = constants.REGULATORY_FRAMEWORKS;
};

/* ---- Constants ---- */

describe('AIFX Constants', () => {
  beforeEach(async () => { await load(); });

  it('exports model configuration', () => {
    assert.equal(AIFX_CONFIG.modelFamily, 'AIFX');
    assert.equal(AIFX_CONFIG.engineStatus, 'active');
    assert.ok(AIFX_CONFIG.modalities.includes('tick-data'));
  });

  it('lists supported exchanges', () => {
    assert.ok(Object.keys(SUPPORTED_EXCHANGES).length >= 20);
    assert.ok(SUPPORTED_EXCHANGES.NYSE);
    assert.ok(SUPPORTED_EXCHANGES.BINANCE);
    assert.ok(SUPPORTED_EXCHANGES.CME);
  });

  it('lists regulatory frameworks', () => {
    assert.ok(Object.keys(REGULATORY_FRAMEWORKS).length >= 10);
    assert.ok(REGULATORY_FRAMEWORKS.SEC);
    assert.ok(REGULATORY_FRAMEWORKS.ESMA);
    assert.ok(REGULATORY_FRAMEWORKS.FATF);
  });
});

/* ---- AIFXCore ---- */

describe('AIFXCore', () => {
  let core;

  beforeEach(async () => {
    await load();
    core = new AIFXCore();
    await core.initialize();
  });

  it('initializes in active state', () => {
    assert.equal(core.status, 'active');
    assert.equal(core.modelId, 'aifx-foundation-v1');
  });

  it('rejects unknown exchanges in config', async () => {
    const bad = new AIFXCore({ enabledExchanges: ['FAKE_EXCHANGE'] });
    await assert.rejects(() => bad.initialize(), /Unknown exchange/);
  });

  it('submits and processes tick-analysis', async () => {
    const task = core.submitAnalysis({
      type: 'tick-analysis',
      asset: 'AAPL',
      exchange: 'NASDAQ',
      payload: {
        ticks: [
          { price: 150.00, volume: 100 },
          { price: 150.10, volume: 200 },
          { price: 150.20, volume: 150 },
          { price: 150.15, volume: 100 },
          { price: 150.30, volume: 300 },
        ],
        symbol: 'AAPL',
      },
    });

    assert.equal(task.status, 'pending');
    const result = await core.processTask(task.id);
    assert.equal(result.direction, 'bullish');
    assert.ok(result.vwap > 0);
    assert.ok(result.stddev >= 0);
  });

  it('submits and processes chart-pattern', async () => {
    const candles = Array.from({ length: 20 }, (_, i) => ({
      open: 100 + i * 0.5,
      high: 101 + i * 0.5,
      low: 99 + i * 0.5,
      close: 100.5 + i * 0.5,
      volume: 1000,
    }));

    const task = core.submitAnalysis({
      type: 'chart-pattern',
      asset: 'EURUSD',
      payload: { candles },
    });

    const result = await core.processTask(task.id);
    assert.ok(result.trend);
    assert.ok(Array.isArray(result.patternsDetected));
  });

  it('submits and processes order-flow', async () => {
    const orders = [
      { price: 100, quantity: 500, side: 'buy', type: 'market' },
      { price: 100, quantity: 200, side: 'sell', type: 'limit' },
      { price: 100.1, quantity: 300, side: 'buy', type: 'market' },
      { price: 99.9, quantity: 100, side: 'sell', type: 'market' },
    ];

    const task = core.submitAnalysis({
      type: 'order-flow',
      asset: 'BTC/USD',
      payload: { orders },
    });

    const result = await core.processTask(task.id);
    assert.equal(result.buyVolume, 800);
    assert.equal(result.sellVolume, 300);
    assert.equal(result.pressure, 'buy-pressure');
  });

  it('submits and processes compliance-check', async () => {
    const task = core.submitAnalysis({
      type: 'compliance-check',
      exchange: 'NYSE',
      payload: { exchange: 'NYSE', operation: 'market-order' },
    });

    const result = await core.processTask(task.id);
    assert.ok(result.overallCompliant);
    assert.ok(result.regulatorsEvaluated > 0);
  });

  it('gets applicable regulations for US exchange', () => {
    const regs = core.getApplicableRegulations('NYSE');
    const regIds = regs.map(r => r.id);
    assert.ok(regIds.includes('SEC'));
    assert.ok(regIds.includes('FINRA'));
    assert.ok(regIds.includes('IOSCO')); // Global
  });

  it('reports diagnostics', () => {
    const diag = core.getDiagnostics();
    assert.equal(diag.status, 'active');
    assert.ok(diag.enabledExchanges > 0);
    assert.ok(diag.enabledRegulations > 0);
  });

  it('shuts down gracefully', async () => {
    const diag = await core.shutdown();
    assert.equal(diag.status, 'stopped');
  });
});

/* ---- TickProcessor ---- */

describe('TickProcessor', () => {
  let tp;

  beforeEach(async () => {
    await load();
    tp = new TickProcessor({ windowSize: 100 });
  });

  it('ingests ticks and computes stats', () => {
    const ticks = Array.from({ length: 50 }, (_, i) => ({
      price: 100 + Math.sin(i / 5) * 2,
      volume: 100 + i * 10,
      timestamp: Date.now() + i * 1000,
      side: i % 2 === 0 ? 'buy' : 'sell',
    }));

    tp.ingestBatch(ticks);
    assert.equal(tp.size, 50);

    const stats = tp.compute();
    assert.ok(stats.mean > 0);
    assert.ok(stats.vwap > 0);
    assert.ok(stats.volatility >= 0);
    assert.ok(stats.tradeIntensity >= 0);
    assert.ok(['bullish', 'bearish', 'neutral'].includes(stats.direction));
  });

  it('respects window size', () => {
    for (let i = 0; i < 150; i++) {
      tp.ingest({ price: 100 + i * 0.01, volume: 10, timestamp: Date.now() + i });
    }
    assert.equal(tp.size, 100);
  });

  it('handles empty buffer', () => {
    const stats = tp.compute();
    assert.equal(stats.empty, true);
  });
});

/* ---- ChartPatternRecognizer ---- */

describe('ChartPatternRecognizer', () => {
  let cpr;

  beforeEach(async () => {
    await load();
    cpr = new ChartPatternRecognizer();
  });

  it('detects uptrend', () => {
    const candles = Array.from({ length: 20 }, (_, i) => ({
      open: 100 + i, high: 101 + i, low: 99 + i, close: 100.5 + i,
    }));

    const result = cpr.detect(candles);
    assert.equal(result.trend, 'uptrend');
  });

  it('detects downtrend', () => {
    const candles = Array.from({ length: 20 }, (_, i) => ({
      open: 200 - i, high: 201 - i, low: 199 - i, close: 200.5 - i,
    }));

    const result = cpr.detect(candles);
    assert.equal(result.trend, 'downtrend');
  });

  it('computes fibonacci levels', () => {
    const candles = Array.from({ length: 10 }, (_, i) => ({
      open: 100, high: 110, low: 90, close: 100,
    }));

    const result = cpr.detect(candles);
    assert.ok(result.fibLevels);
    assert.ok(result.fibLevels['0.0%']);
    assert.ok(result.fibLevels['61.8%']);
  });

  it('returns insufficient-data for small candle sets', () => {
    const result = cpr.detect([{ open: 1, high: 2, low: 0, close: 1 }]);
    assert.equal(result.trend, 'insufficient-data');
  });
});

/* ---- ExchangeConnector ---- */

describe('ExchangeConnector', () => {
  let ec;

  beforeEach(async () => {
    await load();
    ec = new ExchangeConnector();
  });

  it('connects to a valid exchange', () => {
    const state = ec.connect('NYSE');
    assert.equal(state.status, 'connected');
    assert.equal(state.exchange.id, 'NYSE');
  });

  it('rejects unknown exchange', () => {
    assert.throws(() => ec.connect('FAKE'), /Unknown exchange/);
  });

  it('normalizes tick data', () => {
    ec.connect('BINANCE');
    const normalized = ec.normalizeTick('BINANCE', {
      symbol: 'BTCUSDT',
      price: 65000.50,
      volume: 1.5,
      timestamp: 1700000000000,
      isBuyerMaker: false,
    });

    assert.equal(normalized.symbol, 'BTCUSDT');
    assert.equal(normalized.price, 65000.50);
    assert.equal(normalized.volume, 1.5);
    assert.equal(normalized.exchange, 'BINANCE');
    assert.equal(normalized.assetClass, 'crypto');
    assert.equal(normalized.side, 'buy');
  });

  it('normalizes candle data', () => {
    const candle = ec.normalizeCandle('CME', {
      symbol: 'ES',
      open: 5000, high: 5010, low: 4995, close: 5005, volume: 50000,
    }, '1h');

    assert.equal(candle.exchange, 'CME');
    assert.equal(candle.timeframe, '1h');
    assert.equal(candle.open, 5000);
  });

  it('filters exchanges by asset class', () => {
    const crypto = ec.getExchangesByAssetClass('crypto');
    assert.ok(crypto.length >= 3);
    assert.ok(crypto.some(e => e.id === 'BINANCE'));
  });

  it('filters exchanges by region', () => {
    const us = ec.getExchangesByRegion('US');
    assert.ok(us.some(e => e.id === 'NYSE'));
    assert.ok(us.some(e => e.id === 'NASDAQ'));
  });
});

/* ---- RegulatoryComplianceEngine ---- */

describe('RegulatoryComplianceEngine', () => {
  let rce;

  beforeEach(async () => {
    await load();
    rce = new RegulatoryComplianceEngine();
  });

  it('evaluates a compliant operation', () => {
    const result = rce.evaluate({
      type: 'trade',
      exchange: 'NYSE',
      asset: 'AAPL',
      quantity: 100,
      notional: 15000,
    });

    assert.ok(result.overallCompliant);
    assert.ok(result.regulatorsEvaluated > 0);
  });

  it('detects non-compliant large positions on futures exchange', () => {
    const result = rce.evaluate({
      type: 'trade',
      exchange: 'CME',
      asset: 'ES',
      quantity: 10000,
      notional: 50_000_000, // Exceeds position limit threshold
    });

    assert.equal(result.overallCompliant, false);
    assert.ok(result.results.some(r => !r.compliant));
  });

  it('generates compliance report', () => {
    rce.evaluate({ type: 'trade', exchange: 'NYSE', asset: 'AAPL', quantity: 100, notional: 15000 });
    rce.evaluate({ type: 'trade', exchange: 'NYSE', asset: 'MSFT', quantity: 50, notional: 20000 });

    const report = rce.generateReport();
    assert.equal(report.totalEvaluations, 2);
    assert.ok(report.complianceRate >= 0);
  });

  it('raises alerts for non-compliant operations', () => {
    rce.evaluate({ type: 'trade', exchange: 'CME', asset: 'ES', quantity: 10000, notional: 50_000_000 });
    const alerts = rce.getAlerts();
    assert.ok(alerts.length > 0);
    assert.equal(alerts[0].level, 'BLOCK');
  });

  it('gets pre-trade requirements', () => {
    const reqs = rce.getPreTradeRequirements('trade', 'NYSE');
    assert.ok(reqs.applicable);
    assert.ok(reqs.requirements.length > 0);
  });
});

/* ---- OrderFlowAnalyzer ---- */

describe('OrderFlowAnalyzer', () => {
  let ofa;

  beforeEach(async () => {
    await load();
    ofa = new OrderFlowAnalyzer();
  });

  it('analyzes buy-heavy order flow', () => {
    const orders = [
      { price: 100, quantity: 500, side: 'buy', type: 'market' },
      { price: 100, quantity: 400, side: 'buy', type: 'market' },
      { price: 100, quantity: 100, side: 'sell', type: 'limit' },
    ];

    const result = ofa.analyze(orders);
    assert.equal(result.pressure, 'buy-pressure');
    assert.equal(result.buyVolume, 900);
    assert.equal(result.sellVolume, 100);
  });

  it('detects iceberg orders', () => {
    const orders = Array.from({ length: 5 }, () => ({
      price: 100, quantity: 50, side: 'buy', type: 'limit',
    }));

    const result = ofa.analyze(orders);
    assert.ok(result.icebergs.length > 0);
  });

  it('analyzes order book depth', () => {
    const book = {
      bids: [
        { price: 99.9, quantity: 1000 },
        { price: 99.8, quantity: 500 },
        { price: 99.7, quantity: 200 },
      ],
      asks: [
        { price: 100.1, quantity: 300 },
        { price: 100.2, quantity: 200 },
        { price: 100.3, quantity: 100 },
      ],
    };

    const result = ofa.analyzeDepth(book);
    assert.equal(result.bestBid, 99.9);
    assert.equal(result.bestAsk, 100.1);
    assert.ok(result.spread > 0);
    assert.equal(result.depthBias, 'bid-heavy');
  });
});

/* ---- MarketAnalysisEngine ---- */

describe('MarketAnalysisEngine', () => {
  beforeEach(async () => { await load(); });

  it('generates bullish signal from aligned factors', () => {
    const mae = new MarketAnalysisEngine({ signalThreshold: 0.3 });
    const signal = mae.generateSignal({
      tickAnalysis: { direction: 'bullish' },
      chartPattern: { trend: 'uptrend', patternsDetected: [{ confidence: 0.8 }] },
      orderFlow: { pressure: 'buy-pressure', imbalance: 0.5 },
      multiTimeframe: { confluence: 'strong-bullish' },
    });

    assert.equal(signal.direction, 'long');
    assert.ok(signal.strength > 0);
  });

  it('generates neutral signal from mixed factors', () => {
    const mae = new MarketAnalysisEngine();
    const signal = mae.generateSignal({
      tickAnalysis: { direction: 'bullish' },
      orderFlow: { pressure: 'sell-pressure', imbalance: -0.3 },
    });

    assert.equal(signal.direction, 'neutral');
  });
});

/* ---- AIFX Protocol ---- */

describe('AIFX Protocol', () => {
  let protocol;

  beforeEach(async () => {
    await load();
    protocol = new AIFXProtocol();
  });

  it('exposes protocol metadata', () => {
    const meta = protocol.getMetadata();
    assert.equal(meta.id, 'aifx-foundation-market-intelligence');
    assert.ok(meta.capabilities.includes('tick-analysis'));
    assert.ok(meta.charter.principles.length > 0);
  });

  it('submits and processes tasks', () => {
    const receipt = protocol.submit({ type: ANALYSIS_TYPES.TICK_ANALYSIS });
    assert.equal(receipt.status, 'queued');
    assert.ok(receipt.taskId);

    const result = protocol.processNext();
    assert.equal(result.status, 'completed');
    assert.equal(result.taskId, receipt.taskId);
  });

  it('rejects unknown task types', () => {
    assert.throws(() => protocol.submit({ type: 'invalid-type' }), /unknown task type/);
  });

  it('returns null when queue is empty', () => {
    const result = protocol.processNext();
    assert.equal(result, null);
  });

  it('tracks queue depth', () => {
    protocol.submit({ type: ANALYSIS_TYPES.CHART_PATTERN });
    protocol.submit({ type: ANALYSIS_TYPES.ORDER_FLOW });
    assert.equal(protocol.queueDepth, 2);

    protocol.processNext();
    assert.equal(protocol.queueDepth, 1);
  });
});
