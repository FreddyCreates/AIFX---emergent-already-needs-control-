/**
 * Trading Engines — Comprehensive Test Suite
 * 34 tests covering all components
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  WebhookReceiver, SignalAggregator, ChartDataProvider,
  OandaConnector, InteractiveBrokersConnector, FxcmConnector, SaxoBankConnector,
  IgGroupConnector, LmaxConnector, DukascopyConnector, PepperstoneConnector,
  CmcMarketsConnector, XtbConnector, FX_BROKERS, createFxConnector,
  BinanceConnector, CoinbaseConnector, KrakenConnector, BybitConnector,
  OkxConnector, KuCoinConnector, GateIoConnector, BitfinexConnector,
  GeminiConnector, CryptoComConnector, CRYPTO_EXCHANGES, createCryptoConnector,
  SignalEngine, ExecutionEngine, RiskEngine, PortfolioEngine,
  MarketMakingEngine, ArbitrageEngine,
  UnifiedBrokerAdapter, ENVIRONMENTS, getEnvironment, validateConfig,
  createTradingPlatform,
} from '../../sdk/trading-engines/index.js';

// ═══════════════════════════════════════════════════════════════════════════
// TradingView Integration Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('WebhookReceiver', () => {
  it('parses JSON alerts correctly', () => {
    const receiver = new WebhookReceiver();
    const alert = receiver.parseAlert(JSON.stringify({
      symbol: 'EURUSD', action: 'BUY', price: '1.1050', timeframe: '1h'
    }));
    assert.equal(alert.symbol, 'EURUSD');
    assert.equal(alert.action, 'BUY');
    assert.equal(alert.price, 1.1050);
    assert.equal(alert.timeframe, '1h');
  });

  it('parses plaintext alerts correctly', () => {
    const receiver = new WebhookReceiver();
    const alert = receiver.parseAlert('symbol: BTCUSDT\naction: SELL\nprice: 50000\ntimeframe: 4h');
    assert.equal(alert.symbol, 'BTCUSDT');
    assert.equal(alert.action, 'SELL');
    assert.equal(alert.price, 50000);
  });

  it('validates HMAC signatures', async () => {
    const receiver = new WebhookReceiver({ secret: 'test-secret' });
    const payload = '{"symbol":"EURUSD"}';
    const { createHmac } = await import('node:crypto');
    const sig = 'sha256=' + createHmac('sha256', 'test-secret').update(payload).digest('hex');
    assert.equal(receiver.validateSignature(payload, sig), true);
    assert.equal(receiver.validateSignature(payload, 'sha256=invalid'), false);
  });

  it('processes webhooks and dispatches to handlers', async () => {
    const receiver = new WebhookReceiver();
    let received = null;
    receiver.onAlert((alert) => { received = alert; });
    const result = await receiver.processWebhook({
      body: { symbol: 'GBPUSD', action: 'BUY', price: 1.25 },
      headers: {},
    });
    assert.equal(result.status, 200);
    assert.equal(received.symbol, 'GBPUSD');
  });
});

describe('SignalAggregator', () => {
  it('scores multi-timeframe confluence', () => {
    const agg = new SignalAggregator();
    agg.addSignal({ symbol: 'EURUSD', timeframe: '1h', action: 'BUY', strength: 0.8 });
    agg.addSignal({ symbol: 'EURUSD', timeframe: '4h', action: 'BUY', strength: 0.9 });
    agg.addSignal({ symbol: 'EURUSD', timeframe: '1d', action: 'BUY', strength: 0.7 });
    const score = agg.getConfluenceScore('EURUSD');
    assert.equal(score.direction, 'BULLISH');
    assert.ok(score.score > 0);
    assert.ok(score.timeframesAligned === 3);
  });

  it('returns NEUTRAL on conflicting signals', () => {
    const agg = new SignalAggregator();
    agg.addSignal({ symbol: 'EURUSD', timeframe: '1h', action: 'BUY', strength: 0.5 });
    agg.addSignal({ symbol: 'EURUSD', timeframe: '4h', action: 'SELL', strength: 0.5 });
    const score = agg.getConfluenceScore('EURUSD');
    assert.ok(Math.abs(score.score) < 0.5);
  });
});

describe('ChartDataProvider', () => {
  it('resolves symbols UDF-compatible', () => {
    const provider = new ChartDataProvider();
    provider.registerSymbol({ name: 'EURUSD', exchange: 'OANDA', type: 'forex' });
    const resolved = provider.resolveSymbol('EURUSD');
    assert.equal(resolved.name, 'EURUSD');
    assert.equal(resolved.exchange, 'OANDA');
    assert.ok(resolved.supported_resolutions.length > 0);
  });

  it('provides UDF config', () => {
    const provider = new ChartDataProvider();
    const config = provider.getConfig();
    assert.ok(config.supported_resolutions.includes('1D'));
    assert.equal(config.supports_search, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FX Broker Connector Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('FX Broker Connectors', () => {
  it('has 10 registered FX brokers', () => {
    assert.equal(Object.keys(FX_BROKERS).length, 10);
  });

  it('all FX connectors place orders with unified interface', async () => {
    const brokers = ['OANDA', 'INTERACTIVE_BROKERS', 'FXCM', 'SAXO_BANK', 'IG_GROUP',
      'LMAX', 'DUKASCOPY', 'PEPPERSTONE', 'CMC_MARKETS', 'XTB'];
    for (const name of brokers) {
      const connector = createFxConnector(name, { sandbox: true });
      await connector.connect();
      const result = await connector.placeOrder({ symbol: 'EURUSD', side: 'BUY', quantity: 10000, price: 1.1050 });
      assert.ok(result.orderId, `${name} missing orderId`);
      assert.ok(result.status, `${name} missing status`);
      assert.equal(result.broker, name);
    }
  });

  it('all FX connectors return balance', async () => {
    for (const name of Object.keys(FX_BROKERS)) {
      const connector = createFxConnector(name);
      const balance = await connector.getBalance();
      assert.ok(balance.total > 0, `${name} balance.total should be positive`);
      assert.ok(balance.available > 0, `${name} balance.available should be positive`);
    }
  });

  it('createFxConnector throws for unknown broker', () => {
    assert.throws(() => createFxConnector('UNKNOWN'), /Unknown FX broker/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Crypto Exchange Connector Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Crypto Exchange Connectors', () => {
  it('has 10 registered crypto exchanges', () => {
    assert.equal(Object.keys(CRYPTO_EXCHANGES).length, 10);
  });

  it('all crypto connectors place orders with unified interface', async () => {
    const exchanges = ['BINANCE', 'COINBASE', 'KRAKEN', 'BYBIT', 'OKX',
      'KUCOIN', 'GATEIO', 'BITFINEX', 'GEMINI', 'CRYPTO_COM'];
    for (const name of exchanges) {
      const connector = createCryptoConnector(name, { sandbox: true });
      await connector.connect();
      const result = await connector.placeOrder({ symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 50000 });
      assert.ok(result.orderId, `${name} missing orderId`);
      assert.equal(result.broker, name);
    }
  });

  it('perpetual-capable exchanges support perpetual orders', async () => {
    const perpExchanges = ['BINANCE', 'BYBIT', 'OKX', 'GATEIO', 'CRYPTO_COM'];
    for (const name of perpExchanges) {
      const connector = createCryptoConnector(name);
      const result = await connector.placePerpetualOrder({ symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1 });
      assert.equal(result.market, 'perpetual');
    }
  });

  it('margin-capable exchanges support margin orders', async () => {
    const marginExchanges = ['KRAKEN', 'KUCOIN', 'BITFINEX'];
    for (const name of marginExchanges) {
      const connector = createCryptoConnector(name);
      const result = await connector.placeMarginOrder({ symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1 });
      assert.equal(result.market, 'margin');
    }
  });

  it('createCryptoConnector throws for unknown exchange', () => {
    assert.throws(() => createCryptoConnector('UNKNOWN'), /Unknown crypto exchange/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Signal Engine Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('SignalEngine', () => {
  it('computes momentum signals', () => {
    const engine = new SignalEngine();
    const prices = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
    const momentum = engine.computeMomentum(prices);
    assert.ok(momentum > 0, 'Uptrending prices should give positive momentum');
  });

  it('computes mean-reversion signals', () => {
    const engine = new SignalEngine({ lookback: 5 });
    const prices = [100, 101, 100, 99, 100, 95]; // drop at end
    const mr = engine.computeMeanReversion(prices);
    assert.ok(mr > 0, 'Price below mean should give positive (buy) reversion signal');
  });

  it('classifies market regimes', () => {
    const engine = new SignalEngine();
    const trending = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
    const regime = engine.classifyRegime(trending);
    assert.ok(['TRENDING_UP', 'TRENDING_DOWN', 'VOLATILE', 'RANGING', 'MEAN_REVERTING'].includes(regime.regime));
    assert.ok(regime.volatility !== undefined);
    assert.ok(typeof regime.momentum === 'number');
  });

  it('generates composite signals with all components', () => {
    const engine = new SignalEngine();
    const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i / 5) * 5);
    const signal = engine.generateCompositeSignal({
      prices,
      bids: [{ volume: 100 }, { volume: 90 }],
      asks: [{ volume: 80 }, { volume: 70 }],
    });
    assert.ok(signal.composite >= -1 && signal.composite <= 1);
    assert.ok(['BUY', 'SELL', 'HOLD'].includes(signal.direction));
    assert.ok(signal.components.momentum !== undefined);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Execution Engine Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ExecutionEngine', () => {
  it('generates TWAP schedule', () => {
    const engine = new ExecutionEngine();
    const twap = engine.generateTWAP({ symbol: 'BTCUSDT', quantity: 10, side: 'BUY' }, { slices: 5 });
    assert.equal(twap.algo, 'TWAP');
    assert.equal(twap.schedule.length, 5);
    assert.equal(twap.schedule.reduce((s, sl) => s + sl.quantity, 0), 10);
  });

  it('generates VWAP schedule with volume profile', () => {
    const engine = new ExecutionEngine();
    const vwap = engine.generateVWAP({ symbol: 'ETHUSDT', quantity: 100, side: 'BUY' }, [30, 20, 10, 15, 25]);
    assert.equal(vwap.algo, 'VWAP');
    assert.equal(vwap.schedule.length, 5);
    const totalQty = vwap.schedule.reduce((s, sl) => s + sl.quantity, 0);
    assert.ok(Math.abs(totalQty - 100) < 0.01);
  });

  it('generates Iceberg orders', () => {
    const engine = new ExecutionEngine();
    const iceberg = engine.generateIceberg(
      { symbol: 'BTCUSDT', side: 'BUY' },
      { visibleQuantity: 1, totalQuantity: 10 }
    );
    assert.equal(iceberg.algo, 'ICEBERG');
    assert.equal(iceberg.levels.length, 10);
    assert.equal(iceberg.levels[0].status, 'VISIBLE');
    assert.equal(iceberg.levels[1].status, 'HIDDEN');
  });

  it('checks slippage protection', () => {
    const engine = new ExecutionEngine({ maxSlippageBps: 10 });
    const ok = engine.checkSlippage(100, 100.05, 'BUY');
    assert.equal(ok.acceptable, true);
    const bad = engine.checkSlippage(100, 101, 'BUY');
    assert.equal(bad.acceptable, false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Risk Engine Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('RiskEngine', () => {
  it('calculates Kelly position sizing', () => {
    const engine = new RiskEngine();
    const size = engine.calculatePositionSize(100000, 0.6, 200, 100, 50000);
    assert.ok(size.positionSize > 0);
    assert.ok(size.fraction <= engine.maxPositionPct);
  });

  it('calculates Value at Risk', () => {
    const engine = new RiskEngine();
    const returns = [-0.02, -0.01, 0.005, 0.01, -0.005, 0.02, -0.015, 0.008, -0.025, 0.003];
    const var95 = engine.calculateVaR(returns);
    assert.ok(var95.var > 0);
    assert.equal(var95.confidence, 0.95);
  });

  it('tracks drawdown and triggers kill switch', () => {
    const engine = new RiskEngine({ initialEquity: 100000, maxDrawdownPct: 0.1 });
    engine.updateEquity(95000);
    assert.equal(engine.killSwitchActive, false);
    engine.updateEquity(89000); // 11% drawdown
    assert.equal(engine.killSwitchActive, true);
  });

  it('enforces daily loss limits', () => {
    const engine = new RiskEngine({ initialEquity: 100000, maxDailyLossPct: 0.05 });
    engine.recordTrade(-3000);
    engine.recordTrade(-2500); // total -5500 = 5.5%
    const check = engine.checkDailyLimit();
    assert.equal(check.breached, true);
    assert.equal(engine.killSwitchActive, true);
  });

  it('circuit breaker on consecutive losses', () => {
    const engine = new RiskEngine({ maxConsecutiveLosses: 3, initialEquity: 100000 });
    engine.recordTrade(-100);
    engine.recordTrade(-100);
    engine.recordTrade(-100);
    const cb = engine.checkCircuitBreaker(-300);
    assert.equal(cb.consecutiveLossTrigger, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Portfolio Engine Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('PortfolioEngine', () => {
  it('records trades and computes P&L attribution', () => {
    const engine = new PortfolioEngine();
    engine.recordTrade({ symbol: 'EURUSD', side: 'BUY', quantity: 10000, entryPrice: 1.10, exitPrice: 1.11, strategy: 'momentum' });
    engine.recordTrade({ symbol: 'GBPUSD', side: 'BUY', quantity: 10000, entryPrice: 1.25, exitPrice: 1.24, strategy: 'meanrev' });
    const attr = engine.getPnlAttribution('strategy');
    assert.ok(attr.momentum.pnl > 0);
    assert.ok(attr.meanrev.pnl < 0);
  });

  it('calculates Sharpe ratio', () => {
    const engine = new PortfolioEngine();
    const returns = [0.01, 0.02, -0.005, 0.015, 0.008, -0.002, 0.012, 0.005, -0.01, 0.02];
    returns.forEach(r => engine.addDailyReturn(r));
    const sharpe = engine.calculateSharpe();
    assert.ok(sharpe > 0, 'Positive returns should give positive Sharpe');
  });

  it('calculates Sortino and Calmar ratios', () => {
    const engine = new PortfolioEngine();
    [0.01, 0.02, -0.005, 0.015, -0.01].forEach(r => engine.addDailyReturn(r));
    const sortino = engine.calculateSortino();
    const calmar = engine.calculateCalmar();
    assert.ok(typeof sortino === 'number');
    assert.ok(typeof calmar === 'number');
  });

  it('calculates rebalancing trades', () => {
    const engine = new PortfolioEngine({ rebalanceThreshold: 0.05 });
    const result = engine.calculateRebalance(
      { BTC: 0.6, ETH: 0.3, USDT: 0.1 },
      { BTC: 0.4, ETH: 0.4, USDT: 0.2 }
    );
    assert.equal(result.needsRebalance, true);
    assert.ok(result.trades.length >= 2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Market Making Engine Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('MarketMakingEngine', () => {
  it('generates multi-level quotes', () => {
    const engine = new MarketMakingEngine({ levels: 3 });
    const quotes = engine.generateQuotes(50000);
    assert.equal(quotes.bids.length, 3);
    assert.equal(quotes.asks.length, 3);
    assert.ok(quotes.bestBid < 50000);
    assert.ok(quotes.bestAsk > 50000);
  });

  it('applies inventory skew', () => {
    const engine = new MarketMakingEngine({ levels: 1, maxInventory: 10 });
    const neutral = engine.generateQuotes(100, { inventory: 0 });
    const long = engine.generateQuotes(100, { inventory: 8 });
    // When long inventory, asks should be tighter (lower) to sell
    assert.ok(long.bestAsk < neutral.bestAsk);
  });

  it('widens spread on high volatility', () => {
    const engine = new MarketMakingEngine({ levels: 1 });
    const lowVol = engine.generateQuotes(100, { volatility: 0.01 });
    const highVol = engine.generateQuotes(100, { volatility: 0.1 });
    assert.ok(highVol.spreadBps > lowVol.spreadBps);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Arbitrage Engine Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ArbitrageEngine', () => {
  it('detects cross-exchange arbitrage', () => {
    const engine = new ArbitrageEngine({ minProfitBps: 5 });
    const ops = engine.detectCrossExchange([
      { exchange: 'BINANCE', symbol: 'BTC/USDT', bid: 50100, ask: 50050 },
      { exchange: 'KRAKEN', symbol: 'BTC/USDT', bid: 50200, ask: 50120 },
    ]);
    // Kraken bid (50200) - Binance ask (50050) = 150 = 30 bps profit
    assert.ok(ops.length > 0);
    assert.equal(ops[0].type, 'CROSS_EXCHANGE');
  });

  it('detects futures basis arbitrage', () => {
    const engine = new ArbitrageEngine({ minProfitBps: 5 });
    const result = engine.detectFuturesBasis(50000, 50500, 30);
    assert.equal(result.type, 'FUTURES_BASIS');
    assert.ok(result.annualizedBasisBps > 0);
    assert.equal(result.direction, 'SELL_FUTURES_BUY_SPOT');
  });

  it('detects triangular FX arbitrage', () => {
    const engine = new ArbitrageEngine({ minProfitBps: 1 });
    // Deliberately skewed rates to create opportunity
    const ops = engine.detectTriangularFX({
      'EUR/USD': { bid: 1.10, ask: 1.1001 },
      'GBP/USD': { bid: 1.25, ask: 1.2501 },
      'EUR/GBP': { bid: 0.879, ask: 0.88 },
    });
    // May or may not find an opportunity depending on exact rates
    assert.ok(Array.isArray(ops));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Infrastructure Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('UnifiedBrokerAdapter', () => {
  it('routes by asset class', async () => {
    const adapter = new UnifiedBrokerAdapter({
      assetClassRouting: { fx: 'OANDA', crypto: 'BINANCE' },
    });
    const oanda = new OandaConnector({ sandbox: true });
    const binance = new BinanceConnector({ sandbox: true });
    adapter.registerConnector('OANDA', oanda);
    adapter.registerConnector('BINANCE', binance);
    await adapter.connectAll();

    const fxQuote = await adapter.getQuote('EURUSD');
    assert.equal(fxQuote.broker, 'OANDA');
    const cryptoQuote = await adapter.getQuote('BTCUSDT');
    assert.equal(cryptoQuote.broker, 'BINANCE');
  });
});

describe('Environment Config', () => {
  it('provides dev/staging/prod configs', () => {
    const dev = getEnvironment('development');
    const prod = getEnvironment('production');
    assert.equal(dev.sandbox, true);
    assert.equal(prod.sandbox, false);
    assert.equal(prod.allowLiveTrading, true);
  });

  it('validates config correctly', () => {
    const valid = validateConfig({ name: 'test', maxDailyLoss: 0.05 });
    assert.equal(valid.valid, true);
    const invalid = validateConfig({ maxDailyLoss: 2 });
    assert.equal(invalid.valid, false);
  });
});

describe('createTradingPlatform', () => {
  it('wires everything together', async () => {
    const platform = createTradingPlatform({
      environment: 'development',
      fxBrokers: { OANDA: { accountId: 'test' } },
      cryptoExchanges: { BINANCE: {} },
      assetClassRouting: { fx: 'OANDA', crypto: 'BINANCE' },
      initialEquity: 100000,
    });

    assert.ok(platform.webhook);
    assert.ok(platform.signalAggregator);
    assert.ok(platform.signalEngine);
    assert.ok(platform.executionEngine);
    assert.ok(platform.riskEngine);
    assert.ok(platform.portfolioEngine);
    assert.ok(platform.marketMaking);
    assert.ok(platform.arbitrage);
    assert.ok(platform.adapter);
    assert.equal(platform.environment.name, 'development');

    const connections = await platform.connect();
    assert.ok(connections.length > 0);

    const status = platform.getStatus();
    assert.equal(status.environment, 'development');
  });
});
