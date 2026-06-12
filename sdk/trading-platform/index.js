/**
 * AIFX TRADING PLATFORM — PRODUCTION INDEX
 *
 * Full production-ready trading platform with:
 * - TradingView integration (webhooks, signals, chart data)
 * - 10 FX broker connectors (OANDA, IB, FXCM, Saxo, IG, LMAX, Dukascopy, Pepperstone, CMC, XTB)
 * - 10 Crypto exchange connectors (Binance, Coinbase, Kraken, Bybit, OKX, KuCoin, Gate.io, Bitfinex, Gemini, Crypto.com)
 * - Deep Signal Engine (multi-timeframe, regime classification, composite signals)
 * - Deep Execution Engine (TWAP, VWAP, Iceberg, smart routing, TCA)
 * - Deep Risk Engine (Kelly sizing, VaR, drawdown, circuit breakers)
 * - Deep Portfolio Engine (P&L attribution, Sharpe/Sortino, rebalancing)
 * - Market Making Engine (spread management, inventory skew)
 * - Arbitrage Engine (cross-exchange, triangular, basis)
 * - Unified Broker Adapter (normalized routing, failover)
 * - Production configuration management
 */

// TradingView Integration
export {
  TradingViewWebhookReceiver,
  TradingViewSignalAggregator,
  TradingViewChartDataProvider,
  ALERT_TYPES,
  TIMEFRAMES,
  SIGNAL_QUALITY,
} from './integrations/tradingview.js';

// FX Brokers
export {
  BaseFXBroker,
  OandaBroker,
  InteractiveBrokersFX,
  FXCMBroker,
  SaxoBroker,
  IGBroker,
  LMAXBroker,
  DukascopyBroker,
  PepperstoneBroker,
  CMCMarketsBroker,
  XTBBroker,
  FX_BROKERS,
  createFXBroker,
  ORDER_TYPES,
  ORDER_SIDES,
  ORDER_STATUS,
  BROKER_STATUS,
  OANDA_ENVIRONMENTS,
  OANDA_INSTRUMENTS,
} from './brokers/fx/index.js';

// Crypto Exchanges
export {
  BaseCryptoExchange,
  BinanceExchange,
  CoinbaseExchange,
  KrakenExchange,
  BybitExchange,
  OKXExchange,
  KuCoinExchange,
  GateIOExchange,
  BitfinexExchange,
  GeminiExchange,
  CryptoComExchange,
  CRYPTO_EXCHANGES,
  createCryptoExchange,
  MARKET_TYPES,
  CRYPTO_ORDER_TYPES,
  EXCHANGE_STATUS,
  COMMON_PAIRS,
} from './brokers/crypto/index.js';

// Deep Engines
export { DeepSignalEngine, SIGNAL_TYPES, REGIMES } from './engines/signal-engine.js';
export { DeepExecutionEngine, ALGOS, EXECUTION_STATUS } from './engines/execution-engine.js';
export { DeepRiskEngine, POSITION_SIZING, RISK_LEVELS } from './engines/risk-engine.js';
export { DeepPortfolioEngine } from './engines/portfolio-engine.js';
export { MarketMakingEngine, ArbitrageEngine } from './engines/market-making-engine.js';

// Unified Adapter
export { UnifiedBrokerAdapter, ASSET_CLASSES } from './adapters/unified-broker-adapter.js';

// Configuration
export { createConfig, validateConfig, DEFAULT_CONFIG, ENVIRONMENTS } from './config/index.js';

/**
 * Factory: Create a fully-wired trading platform instance
 */
import { TradingViewWebhookReceiver, TradingViewSignalAggregator } from './integrations/tradingview.js';
import { DeepSignalEngine } from './engines/signal-engine.js';
import { DeepExecutionEngine } from './engines/execution-engine.js';
import { DeepRiskEngine } from './engines/risk-engine.js';
import { DeepPortfolioEngine } from './engines/portfolio-engine.js';
import { MarketMakingEngine, ArbitrageEngine } from './engines/market-making-engine.js';
import { UnifiedBrokerAdapter } from './adapters/unified-broker-adapter.js';
import { createConfig, validateConfig } from './config/index.js';
import { createFXBroker } from './brokers/fx/index.js';
import { createCryptoExchange } from './brokers/crypto/index.js';

export function createTradingPlatform(userConfig = {}, environment = 'development') {
  const config = createConfig(userConfig, environment);
  const validation = validateConfig(config);

  const platform = {
    config,
    validation,

    // Core engines
    tradingView: new TradingViewWebhookReceiver(config.tradingView),
    signalAggregator: new TradingViewSignalAggregator({
      confluenceThreshold: config.signals.confluenceRequired,
      maxAge: config.signals.maxSignalAge,
    }),
    signalEngine: new DeepSignalEngine({
      lookback: config.signals.lookbackBars,
      confidenceThreshold: config.signals.confidenceThreshold,
    }),
    executionEngine: new DeepExecutionEngine({
      maxSlippageBps: config.execution.maxSlippageBps,
      maxRetries: config.execution.maxRetries,
      timeoutMs: config.execution.timeoutMs,
    }),
    riskEngine: new DeepRiskEngine({
      maxDrawdownPct: config.risk.maxDrawdownPct,
      maxPositionPct: config.risk.maxPositionPct,
      maxDailyLossPct: config.risk.maxDailyLossPct,
      kellyFraction: config.risk.kellyFraction,
    }),
    portfolioEngine: new DeepPortfolioEngine({
      baseCurrency: config.portfolio.baseCurrency,
      benchmarkReturn: config.portfolio.benchmarkReturn,
    }),
    marketMaking: new MarketMakingEngine(config.marketMaking),
    arbitrage: new ArbitrageEngine(config.arbitrage),
    adapter: new UnifiedBrokerAdapter(),

    // Wire TradingView alerts to signal engine
    wireAlertToSignal() {
      this.tradingView.subscribe('*', (alert) => {
        const direction = alert.action.includes('long') || alert.action === 'entry_long' ? 'long' : 'short';
        this.signalAggregator.addSignal({
          symbol: alert.symbol,
          timeframe: alert.timeframe,
          direction,
          strength: alert.confidence || 1,
          source: 'tradingview',
        });
      });
    },

    // Initialize with brokers
    initBrokers() {
      const { fx, crypto } = config.brokers;
      for (const brokerId of (fx.enabled || [])) {
        const broker = createFXBroker(brokerId, config.brokers.fx[brokerId] || {});
        this.adapter.registerFXBroker(brokerId, broker);
      }
      for (const exchangeId of (crypto.enabled || [])) {
        const exchange = createCryptoExchange(exchangeId, config.brokers.crypto[exchangeId] || {});
        this.adapter.registerCryptoExchange(exchangeId, exchange);
      }
    },

    // Full pipeline: signal → risk → execute
    async processSignal(signal) {
      const riskCheck = this.riskEngine.evaluateOrder({
        symbol: signal.symbol,
        side: signal.direction === 'long' ? 'buy' : 'sell',
        quantity: signal.positionSize || 1,
        referencePrice: signal.price || 100,
      }, signal);

      if (!riskCheck.allowed) {
        return { executed: false, reason: riskCheck.reason, signal };
      }

      const order = {
        symbol: signal.symbol,
        side: signal.direction === 'long' ? 'buy' : 'sell',
        quantity: riskCheck.positionSize.quantity,
        type: 'market',
        referencePrice: signal.price || 100,
        stopLoss: riskCheck.stopLoss?.price,
        takeProfit: riskCheck.takeProfit?.price,
      };

      const execution = await this.executionEngine.execute(order);
      return { executed: true, signal, riskCheck, execution };
    },
  };

  return platform;
}
