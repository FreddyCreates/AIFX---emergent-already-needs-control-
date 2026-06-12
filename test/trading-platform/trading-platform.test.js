const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('AIFX Trading Platform', () => {
  let platform;

  beforeEach(async () => {
    const mod = await import('../../sdk/trading-platform/index.js');
    platform = mod.createTradingPlatform({
      brokers: { fx: { enabled: [] }, crypto: { enabled: [] } },
    });
  });

  describe('TradingView Integration', () => {
    it('parses JSON webhook alerts', async () => {
      const { TradingViewWebhookReceiver } = await import('../../sdk/trading-platform/index.js');
      const receiver = new TradingViewWebhookReceiver();

      const result = receiver.parseAlert({
        ticker: 'EURUSD',
        action: 'buy',
        close: '1.0950',
        volume: '15000',
        interval: '60',
      });

      assert.equal(result.accepted, true);
      assert.equal(result.alert.symbol, 'EURUSD');
      assert.equal(result.alert.action, 'entry_long');
      assert.equal(result.alert.price, 1.095);
    });

    it('parses plaintext webhook alerts', async () => {
      const { TradingViewWebhookReceiver } = await import('../../sdk/trading-platform/index.js');
      const receiver = new TradingViewWebhookReceiver();

      const result = receiver.parseAlert('symbol: BTCUSDT\naction: sell\nprice: 50000\ncontracts: 0.5');

      assert.equal(result.accepted, true);
      assert.equal(result.alert.symbol, 'BTCUSDT');
      assert.equal(result.alert.action, 'entry_short');
      assert.equal(result.alert.contracts, 0.5);
    });

    it('deduplicates rapid duplicate alerts', async () => {
      const { TradingViewWebhookReceiver } = await import('../../sdk/trading-platform/index.js');
      const receiver = new TradingViewWebhookReceiver({ dedupeWindow: 5000 });

      const alert = { ticker: 'EURUSD', action: 'buy', close: '1.095', interval: '60' };
      const first = receiver.parseAlert(alert);
      const second = receiver.parseAlert(alert);

      assert.equal(first.accepted, true);
      assert.equal(second.accepted, false);
      assert.equal(second.reason, 'duplicate');
    });

    it('aggregates multi-timeframe signals', async () => {
      const { TradingViewSignalAggregator } = await import('../../sdk/trading-platform/index.js');
      const agg = new TradingViewSignalAggregator({ confluenceThreshold: 2 });

      agg.addSignal({ symbol: 'EURUSD', timeframe: '60', direction: 'long', strength: 1 });
      agg.addSignal({ symbol: 'EURUSD', timeframe: '240', direction: 'long', strength: 1 });
      const result = agg.addSignal({ symbol: 'EURUSD', timeframe: 'D', direction: 'long', strength: 1 });

      assert.equal(result.eligible, true);
      assert.equal(result.quality, 'high');
      assert.equal(result.confluence, 3);
    });
  });

  describe('FX Broker Connectors', () => {
    it('creates OANDA broker and connects', async () => {
      const { OandaBroker } = await import('../../sdk/trading-platform/index.js');
      const broker = new OandaBroker({ accountId: 'test-123', apiKey: 'test-key' });

      const conn = await broker.connect();
      assert.equal(conn.success, true);

      const auth = await broker.authenticate();
      assert.equal(auth.success, true);
    });

    it('places order on FX broker', async () => {
      const { OandaBroker } = await import('../../sdk/trading-platform/index.js');
      const broker = new OandaBroker({ accountId: 'test-123', apiKey: 'test-key' });
      await broker.connect();
      await broker.authenticate();

      const order = await broker.placeOrder({
        symbol: 'EUR_USD',
        side: 'buy',
        quantity: 10000,
        type: 'market',
      });

      assert.ok(order.id);
      assert.equal(order.symbol, 'EUR_USD');
      assert.equal(order.status, 'filled');
    });

    it('creates all FX brokers via factory', async () => {
      const { createFXBroker, FX_BROKERS } = await import('../../sdk/trading-platform/index.js');

      for (const brokerId of Object.keys(FX_BROKERS)) {
        const broker = createFXBroker(brokerId);
        assert.ok(broker);
        assert.equal(broker.brokerId, brokerId);
        const conn = await broker.connect();
        assert.equal(conn.success, true);
      }
    });

    it('enforces rate limiting', async () => {
      const { OandaBroker } = await import('../../sdk/trading-platform/index.js');
      const broker = new OandaBroker({ accountId: 'test', apiKey: 'key' });
      broker.rateLimit = { requests: 2, windowMs: 1000 };
      await broker.connect();
      await broker.authenticate();

      await broker.placeOrder({ symbol: 'EUR_USD', side: 'buy', quantity: 1000, type: 'market' });
      await broker.placeOrder({ symbol: 'EUR_USD', side: 'buy', quantity: 1000, type: 'market' });

      await assert.rejects(
        () => broker.placeOrder({ symbol: 'EUR_USD', side: 'buy', quantity: 1000, type: 'market' }),
        /Rate limit exceeded/
      );
    });
  });

  describe('Crypto Exchange Connectors', () => {
    it('creates Binance exchange and connects', async () => {
      const { BinanceExchange } = await import('../../sdk/trading-platform/index.js');
      const exchange = new BinanceExchange({ testnet: true });

      const conn = await exchange.connect();
      assert.equal(conn.success, true);

      const auth = await exchange.authenticate();
      assert.equal(auth.success, true);
    });

    it('fetches markets from Binance', async () => {
      const { BinanceExchange } = await import('../../sdk/trading-platform/index.js');
      const exchange = new BinanceExchange({ testnet: true });
      await exchange.connect();

      const markets = await exchange.getMarkets();
      assert.ok(markets.length > 0);
      assert.ok(markets[0].symbol);
      assert.ok(markets[0].baseAsset);
    });

    it('creates all crypto exchanges via factory', async () => {
      const { createCryptoExchange, CRYPTO_EXCHANGES } = await import('../../sdk/trading-platform/index.js');

      for (const exchangeId of Object.keys(CRYPTO_EXCHANGES)) {
        const exchange = createCryptoExchange(exchangeId);
        assert.ok(exchange);
        assert.equal(exchange.exchangeId, exchangeId);
        const conn = await exchange.connect();
        assert.equal(conn.success, true);
      }
    });

    it('places order on crypto exchange', async () => {
      const { BinanceExchange } = await import('../../sdk/trading-platform/index.js');
      const exchange = new BinanceExchange({ testnet: true });
      await exchange.connect();
      await exchange.authenticate();

      const order = await exchange.placeOrder({
        symbol: 'BTC/USDT',
        side: 'buy',
        quantity: 0.01,
        type: 'market',
      });

      assert.ok(order.id);
      assert.equal(order.status, 'filled');
    });
  });

  describe('Deep Signal Engine', () => {
    it('generates momentum signals from price data', async () => {
      const { DeepSignalEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepSignalEngine({ confidenceThreshold: 0.1 });

      for (let i = 0; i < 100; i++) {
        engine.ingestPrice({
          symbol: 'EURUSD',
          open: 1.09 + i * 0.001,
          high: 1.091 + i * 0.001,
          low: 1.089 + i * 0.001,
          close: 1.0905 + i * 0.001,
          volume: 1000 + i * 10,
          timestamp: Date.now() - (100 - i) * 60000,
        });
      }

      const signals = engine.generateSignals('EURUSD');
      assert.ok(signals.length > 0);
      assert.ok(signals.some(s => s.type === 'momentum'));
    });

    it('classifies market regime', async () => {
      const { DeepSignalEngine, REGIMES } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepSignalEngine();

      for (let i = 0; i < 100; i++) {
        engine.ingestPrice({
          symbol: 'BTCUSD',
          open: 50000 + i * 100,
          high: 50100 + i * 100,
          low: 49900 + i * 100,
          close: 50050 + i * 100,
          volume: 500,
          timestamp: Date.now() - (100 - i) * 60000,
        });
      }

      const regime = engine.getRegime('BTCUSD');
      assert.ok(Object.values(REGIMES).includes(regime));
    });

    it('generates composite signals', async () => {
      const { DeepSignalEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepSignalEngine({ confidenceThreshold: 0.05 });

      for (let i = 0; i < 100; i++) {
        engine.ingestPrice({
          symbol: 'GBPUSD',
          open: 1.25 + i * 0.002,
          high: 1.252 + i * 0.002,
          low: 1.249 + i * 0.002,
          close: 1.251 + i * 0.002,
          volume: 2000 + i * 50,
          timestamp: Date.now() - (100 - i) * 60000,
        });
      }

      const composite = engine.generateCompositeSignal('GBPUSD');
      assert.ok(composite);
      assert.equal(composite.type, 'composite');
      assert.ok(['long', 'short', 'neutral'].includes(composite.direction));
      assert.ok(composite.confidence >= 0 && composite.confidence <= 1);
    });
  });

  describe('Deep Execution Engine', () => {
    it('executes market order with slippage tracking', async () => {
      const { DeepExecutionEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepExecutionEngine({ maxSlippageBps: 10 });

      const result = await engine.execute({
        symbol: 'EURUSD',
        side: 'buy',
        quantity: 10000,
        referencePrice: 1.095,
      });

      assert.equal(result.status, 'filled');
      assert.ok(result.totalFilled === 10000);
      assert.ok(result.slippageBps <= 10);
      assert.ok(result.tca);
    });

    it('executes TWAP order in slices', async () => {
      const { DeepExecutionEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepExecutionEngine();

      const result = await engine.executeTWAP(
        { symbol: 'BTCUSDT', side: 'buy', quantity: 1, referencePrice: 50000 },
        { slices: 5, duration: 5000 }
      );

      assert.equal(result.algo, 'twap');
      assert.equal(result.slices, 5);
      assert.ok(result.totalFilled > 0);
    });

    it('executes iceberg order with hidden size', async () => {
      const { DeepExecutionEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepExecutionEngine();

      const result = await engine.executeIceberg(
        { symbol: 'ETHUSDT', side: 'sell', quantity: 10, referencePrice: 3000 },
        { visibleSize: 2 }
      );

      assert.equal(result.algo, 'iceberg');
      assert.ok(result.totalFilled > 0);
    });
  });

  describe('Deep Risk Engine', () => {
    it('evaluates order risk and computes position size', async () => {
      const { DeepRiskEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepRiskEngine({ maxDrawdownPct: 0.2, maxPositionPct: 0.05 });

      const result = engine.evaluateOrder(
        { symbol: 'EURUSD', side: 'buy', quantity: 1000, referencePrice: 1.095 },
        { confidence: 0.7, winRate: 0.6, payoff: 2, atr: 0.005 }
      );

      assert.equal(result.allowed, true);
      assert.ok(result.positionSize);
      assert.ok(result.stopLoss);
      assert.ok(result.takeProfit);
    });

    it('blocks orders when kill switch is active', async () => {
      const { DeepRiskEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepRiskEngine();

      engine.setKillSwitch(true);
      const result = engine.evaluateOrder(
        { symbol: 'BTCUSD', side: 'buy', quantity: 1, referencePrice: 50000 },
        { confidence: 0.8 }
      );

      assert.equal(result.allowed, false);
      assert.equal(result.reason, 'kill_switch_active');
    });

    it('blocks orders when max drawdown exceeded', async () => {
      const { DeepRiskEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepRiskEngine({ maxDrawdownPct: 0.1 });

      engine.peakEquity = 100000;
      engine.equity = 85000;

      const result = engine.evaluateOrder(
        { symbol: 'EURUSD', side: 'buy', quantity: 1000, referencePrice: 1.1 },
        { confidence: 0.8 }
      );

      assert.equal(result.allowed, false);
      assert.equal(result.reason, 'max_drawdown_exceeded');
    });

    it('computes Value at Risk', async () => {
      const { DeepRiskEngine } = await import('../../sdk/trading-platform/index.js');
      const engine = new DeepRiskEngine();

      engine.updatePosition('EURUSD', 100000, 1.095, 0.008);
      engine.updatePosition('GBPUSD', 50000, 1.27, 0.01);

      const var95 = engine.computeVaR(0.95);
      assert.ok(var95.var > 0);
      assert.equal(var95.confidence, 0.95);
    });
  });

  describe('Deep Portfolio Engine', () => {
    it('tracks open and closed positions with P&L', async () => {
      const { DeepPortfolioEngine } = await import('../../sdk/trading-platform/index.js');
      const portfolio = new DeepPortfolioEngine();
      portfolio.initialize(100000);

      const pos = portfolio.openPosition({
        symbol: 'EURUSD',
        side: 'buy',
        quantity: 10000,
        price: 1.095,
        assetClass: 'forex',
      });

      assert.ok(pos.id);
      portfolio.updatePrice('EURUSD', 1.1);

      const trade = portfolio.closePosition(pos.id, 1.1);
      assert.ok(trade.realizedPnL > 0);
    });

    it('computes performance metrics', async () => {
      const { DeepPortfolioEngine } = await import('../../sdk/trading-platform/index.js');
      const portfolio = new DeepPortfolioEngine();
      portfolio.initialize(100000);

      const pos1 = portfolio.openPosition({ symbol: 'BTC/USDT', side: 'buy', quantity: 1, price: 50000, assetClass: 'crypto' });
      portfolio.snapshot();
      portfolio.updatePrice('BTC/USDT', 52000);
      portfolio.closePosition(pos1.id, 52000);
      portfolio.snapshot();

      const metrics = portfolio.getPerformanceMetrics();
      assert.ok(metrics.totalTrades === 1);
      assert.ok(metrics.winRate === 1);
      assert.ok(metrics.equity > 100000);
    });
  });

  describe('Market Making & Arbitrage Engines', () => {
    it('generates multi-level quotes', async () => {
      const { MarketMakingEngine } = await import('../../sdk/trading-platform/index.js');
      const mm = new MarketMakingEngine({ levels: 5, baseSpreadBps: 3 });

      const quotes = mm.generateQuotes('EURUSD', 1.095, 0.005);
      assert.equal(quotes.bids.length, 5);
      assert.equal(quotes.asks.length, 5);
      assert.ok(quotes.bids[0].price < 1.095);
      assert.ok(quotes.asks[0].price > 1.095);
    });

    it('detects cross-exchange arbitrage', async () => {
      const { ArbitrageEngine } = await import('../../sdk/trading-platform/index.js');
      const arb = new ArbitrageEngine({ minProfitBps: 3 });

      arb.updatePrice('binance', 'BTC/USDT', 50000, 50010);
      arb.updatePrice('kraken', 'BTC/USDT', 50050, 50060);

      const opp = arb.scanCrossExchange('BTC/USDT', ['binance', 'kraken']);
      assert.ok(arb.stats.scanned > 0);
    });

    it('detects basis arbitrage', async () => {
      const { ArbitrageEngine } = await import('../../sdk/trading-platform/index.js');
      const arb = new ArbitrageEngine({ minProfitBps: 5 });

      const opp = arb.scanBasisArbitrage(50000, 50500, 30);
      assert.ok(opp);
      assert.equal(opp.type, 'basis');
      assert.ok(opp.annualizedBasis > 0);
    });
  });

  describe('Unified Broker Adapter', () => {
    it('routes FX orders to registered broker', async () => {
      const { UnifiedBrokerAdapter, OandaBroker } = await import('../../sdk/trading-platform/index.js');
      const adapter = new UnifiedBrokerAdapter();

      const broker = new OandaBroker({ accountId: 'test', apiKey: 'key' });
      await broker.connect();
      await broker.authenticate();
      adapter.registerFXBroker('oanda', broker);

      const result = await adapter.routeOrder({
        symbol: 'EUR_USD',
        side: 'buy',
        quantity: 10000,
        type: 'market',
      });

      assert.ok(result.id);
      assert.equal(result.assetClass, 'fx');
      assert.equal(result.routedTo, 'oanda');
    });

    it('routes crypto orders to registered exchange', async () => {
      const { UnifiedBrokerAdapter, BinanceExchange } = await import('../../sdk/trading-platform/index.js');
      const adapter = new UnifiedBrokerAdapter();

      const exchange = new BinanceExchange({ testnet: true });
      await exchange.connect();
      await exchange.authenticate();
      adapter.registerCryptoExchange('binance', exchange);

      const result = await adapter.routeOrder({
        symbol: 'BTC/USDT',
        side: 'buy',
        quantity: 0.1,
        type: 'market',
      });

      assert.ok(result.id);
      assert.equal(result.assetClass, 'crypto');
      assert.equal(result.routedTo, 'binance');
    });

    it('aggregates positions across venues', async () => {
      const { UnifiedBrokerAdapter, OandaBroker, BinanceExchange } = await import('../../sdk/trading-platform/index.js');
      const adapter = new UnifiedBrokerAdapter();

      const broker = new OandaBroker({ accountId: 'test', apiKey: 'key' });
      await broker.connect();
      await broker.authenticate();
      adapter.registerFXBroker('oanda', broker);

      const exchange = new BinanceExchange({ testnet: true });
      await exchange.connect();
      adapter.registerCryptoExchange('binance', exchange);

      const positions = await adapter.getAggregatedPositions();
      assert.ok(Array.isArray(positions));
    });
  });

  describe('Platform Factory', () => {
    it('creates fully-wired platform instance', () => {
      assert.ok(platform.tradingView);
      assert.ok(platform.signalEngine);
      assert.ok(platform.executionEngine);
      assert.ok(platform.riskEngine);
      assert.ok(platform.portfolioEngine);
      assert.ok(platform.marketMaking);
      assert.ok(platform.arbitrage);
      assert.ok(platform.adapter);
      assert.ok(platform.config);
    });

    it('processes signal through full pipeline', async () => {
      const result = await platform.processSignal({
        symbol: 'EURUSD',
        direction: 'long',
        confidence: 0.75,
        winRate: 0.6,
        payoff: 2,
        atr: 0.005,
        price: 1.095,
      });

      assert.equal(result.executed, true);
      assert.ok(result.execution);
      assert.equal(result.execution.status, 'filled');
    });
  });

  describe('Configuration', () => {
    it('creates environment-specific config', async () => {
      const { createConfig, ENVIRONMENTS } = await import('../../sdk/trading-platform/index.js');

      const prodConfig = createConfig({}, ENVIRONMENTS.PRODUCTION);
      assert.equal(prodConfig.risk.maxDrawdownPct, 0.15);
      assert.equal(prodConfig.signals.confidenceThreshold, 0.7);

      const devConfig = createConfig({}, ENVIRONMENTS.DEVELOPMENT);
      assert.equal(devConfig.risk.maxDrawdownPct, 0.2);
    });

    it('validates production config requirements', async () => {
      const { createConfig, validateConfig, ENVIRONMENTS } = await import('../../sdk/trading-platform/index.js');

      const config = createConfig({}, ENVIRONMENTS.PRODUCTION);
      const result = validateConfig(config);

      assert.equal(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('webhookSecret')));
    });
  });
});
