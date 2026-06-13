/**
 * Trading Platform Factory
 * createTradingPlatform() wires everything together
 */

import { WebhookReceiver, SignalAggregator, ChartDataProvider } from '../tradingview/index.js';
import { createFxConnector, FX_BROKERS } from '../connectors/fx/index.js';
import { createCryptoConnector, CRYPTO_EXCHANGES } from '../connectors/crypto/index.js';
import { SignalEngine, ExecutionEngine, RiskEngine, PortfolioEngine, MarketMakingEngine, ArbitrageEngine } from '../engines/index.js';
import { UnifiedBrokerAdapter } from './unified-adapter.js';
import { getEnvironment, validateConfig } from './environment.js';

export function createTradingPlatform(config = {}) {
  const env = getEnvironment(config.environment || 'development');
  const validation = validateConfig(env);
  if (!validation.valid) {
    throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
  }

  // ─── TradingView Integration ───────────────────────────────────────────
  const webhook = new WebhookReceiver({
    secret: config.webhookSecret || '',
    allowedIPs: config.webhookAllowedIPs || [],
  });

  const signalAggregator = new SignalAggregator({
    timeframes: config.timeframes,
    confluenceThreshold: config.confluenceThreshold,
  });

  const chartProvider = new ChartDataProvider({
    exchanges: config.chartExchanges,
  });

  // ─── Broker Adapter ────────────────────────────────────────────────────
  const adapter = new UnifiedBrokerAdapter({
    failoverOrder: config.failoverOrder || [],
    assetClassRouting: config.assetClassRouting || {},
    maxFailoverAttempts: config.maxFailoverAttempts || 3,
  });

  // Register FX connectors
  if (config.fxBrokers) {
    for (const [name, brokerConfig] of Object.entries(config.fxBrokers)) {
      const connector = createFxConnector(name, { ...env.connectors.fx, ...brokerConfig });
      adapter.registerConnector(name, connector);
    }
  }

  // Register Crypto connectors
  if (config.cryptoExchanges) {
    for (const [name, exchangeConfig] of Object.entries(config.cryptoExchanges)) {
      const connector = createCryptoConnector(name, { ...env.connectors.crypto, ...exchangeConfig });
      adapter.registerConnector(name, connector);
    }
  }

  // ─── Trading Engines ───────────────────────────────────────────────────
  const signalEngine = new SignalEngine(config.signalEngine || {});

  const executionEngine = new ExecutionEngine({
    maxSlippageBps: config.maxSlippageBps || 10,
  });

  const riskEngine = new RiskEngine({
    maxPositionPct: config.maxPositionPct || 0.02,
    maxDailyLossPct: env.maxDailyLoss,
    maxDrawdownPct: env.maxDrawdown,
    initialEquity: config.initialEquity || 100000,
    circuitBreakerThreshold: config.circuitBreakerThreshold || 0.03,
  });

  const portfolioEngine = new PortfolioEngine({
    initialEquity: config.initialEquity || 100000,
    riskFreeRate: config.riskFreeRate || 0.05,
  });

  const marketMaking = new MarketMakingEngine(config.marketMaking || {});
  const arbitrage = new ArbitrageEngine(config.arbitrage || {});

  // ─── Wire Webhook → Signal Aggregator ──────────────────────────────────
  webhook.onAlert((alert) => {
    signalAggregator.addSignal({
      symbol: alert.symbol,
      timeframe: alert.timeframe,
      action: alert.action,
      strength: alert.indicators?.strength ? parseFloat(alert.indicators.strength) : 0.7,
    });
  });

  // ─── Platform Object ───────────────────────────────────────────────────
  return {
    // Environment
    environment: env,

    // TradingView
    webhook,
    signalAggregator,
    chartProvider,

    // Connectors
    adapter,

    // Engines
    signalEngine,
    executionEngine,
    riskEngine,
    portfolioEngine,
    marketMaking,
    arbitrage,

    // Convenience methods
    async connect() {
      return adapter.connectAll();
    },

    async placeOrder(order) {
      // Pre-trade risk check
      const balance = await adapter.getBalance();
      const totalBalance = Array.isArray(balance)
        ? balance.reduce((s, b) => s + b.total, 0)
        : balance.total || 0;
      const check = riskEngine.preTradeCheck(order, totalBalance);
      if (!check.approved) {
        return { status: 'REJECTED', reason: 'Risk check failed', checks: check.checks };
      }
      return adapter.placeOrder(order);
    },

    getStatus() {
      return {
        environment: env.name,
        connectors: adapter.getStatus(),
        risk: {
          killSwitch: riskEngine.killSwitchActive,
          dailyPnl: riskEngine.dailyPnl,
          drawdown: riskEngine.getDrawdown(),
        },
        portfolio: portfolioEngine.getPerformanceMetrics(),
      };
    },
  };
}
