/**
 * Trading Engines SDK
 * Complete trading platform with TradingView integration, 
 * 10 FX + 10 Crypto connectors, and deep trading engines
 */

// TradingView Integration
export { WebhookReceiver, SignalAggregator, ChartDataProvider } from './src/tradingview/index.js';

// Connectors
export { BaseBrokerConnector } from './src/connectors/base-connector.js';
export {
  OandaConnector, InteractiveBrokersConnector, FxcmConnector, SaxoBankConnector,
  IgGroupConnector, LmaxConnector, DukascopyConnector, PepperstoneConnector,
  CmcMarketsConnector, XtbConnector, FX_BROKERS, createFxConnector,
} from './src/connectors/fx/index.js';
export {
  BinanceConnector, CoinbaseConnector, KrakenConnector, BybitConnector,
  OkxConnector, KuCoinConnector, GateIoConnector, BitfinexConnector,
  GeminiConnector, CryptoComConnector, CRYPTO_EXCHANGES, createCryptoConnector,
} from './src/connectors/crypto/index.js';

// Deep Trading Engines
export { SignalEngine } from './src/engines/signal-engine.js';
export { ExecutionEngine } from './src/engines/execution-engine.js';
export { RiskEngine } from './src/engines/risk-engine.js';
export { PortfolioEngine } from './src/engines/portfolio-engine.js';
export { MarketMakingEngine } from './src/engines/market-making-engine.js';
export { ArbitrageEngine } from './src/engines/arbitrage-engine.js';

// Infrastructure
export { UnifiedBrokerAdapter } from './src/infrastructure/unified-adapter.js';
export { ENVIRONMENTS, getEnvironment, validateConfig } from './src/infrastructure/environment.js';
export { createTradingPlatform } from './src/infrastructure/factory.js';
