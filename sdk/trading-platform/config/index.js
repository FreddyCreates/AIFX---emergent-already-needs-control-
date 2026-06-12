/**
 * PRODUCTION CONFIGURATION
 *
 * Environment-specific configuration for the trading platform.
 * Supports: development, staging, production
 */

const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

const DEFAULT_CONFIG = {
  environment: ENVIRONMENTS.DEVELOPMENT,

  tradingView: {
    webhookSecret: null,
    maxAlertAge: 30000,
    dedupeWindow: 5000,
    enabledAlertTypes: ['entry_long', 'entry_short', 'exit_long', 'exit_short', 'take_profit', 'stop_loss'],
  },

  risk: {
    maxDrawdownPct: 0.2,
    maxPositionPct: 0.05,
    maxDailyLossPct: 0.03,
    maxCorrelation: 0.7,
    kellyFraction: 0.5,
    killSwitchEnabled: false,
  },

  execution: {
    maxSlippageBps: 10,
    maxRetries: 3,
    timeoutMs: 30000,
    defaultAlgo: 'market',
    enableTWAP: true,
    enableIceberg: true,
  },

  portfolio: {
    baseCurrency: 'USD',
    benchmarkReturn: 0.05,
    rebalanceThreshold: 0.02,
    maxOpenPositions: 50,
  },

  signals: {
    confidenceThreshold: 0.6,
    confluenceRequired: 2,
    lookbackBars: 200,
    maxSignalAge: 300000,
  },

  marketMaking: {
    baseSpreadBps: 5,
    maxInventory: 100,
    levels: 5,
    refreshInterval: 1000,
  },

  arbitrage: {
    minProfitBps: 5,
    maxLatencyMs: 500,
    maxExposure: 100000,
  },

  brokers: {
    fx: {
      primary: null,
      failover: [],
      enabled: [],
    },
    crypto: {
      primary: null,
      failover: [],
      enabled: [],
    },
  },

  observability: {
    metricsInterval: 5000,
    traceEnabled: true,
    logLevel: 'info',
    alertsEnabled: true,
  },
};

function createConfig(overrides = {}, environment = ENVIRONMENTS.DEVELOPMENT) {
  const config = structuredClone(DEFAULT_CONFIG);
  config.environment = environment;

  if (environment === ENVIRONMENTS.PRODUCTION) {
    config.risk.maxDrawdownPct = 0.15;
    config.risk.maxDailyLossPct = 0.02;
    config.execution.maxSlippageBps = 5;
    config.signals.confidenceThreshold = 0.7;
    config.observability.logLevel = 'warn';
  }

  if (environment === ENVIRONMENTS.STAGING) {
    config.risk.maxDrawdownPct = 0.25;
    config.execution.maxSlippageBps = 15;
  }

  return deepMerge(config, overrides);
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function validateConfig(config) {
  const errors = [];

  if (config.risk.maxDrawdownPct <= 0 || config.risk.maxDrawdownPct > 1) {
    errors.push('risk.maxDrawdownPct must be between 0 and 1');
  }
  if (config.risk.maxPositionPct <= 0 || config.risk.maxPositionPct > 1) {
    errors.push('risk.maxPositionPct must be between 0 and 1');
  }
  if (config.execution.maxSlippageBps < 0) {
    errors.push('execution.maxSlippageBps must be non-negative');
  }
  if (config.signals.confidenceThreshold < 0 || config.signals.confidenceThreshold > 1) {
    errors.push('signals.confidenceThreshold must be between 0 and 1');
  }

  if (config.environment === ENVIRONMENTS.PRODUCTION) {
    if (!config.tradingView.webhookSecret) {
      errors.push('tradingView.webhookSecret is required in production');
    }
    if (!config.brokers.fx.primary && !config.brokers.crypto.primary) {
      errors.push('At least one primary broker must be configured in production');
    }
  }

  return { valid: errors.length === 0, errors };
}

export { createConfig, validateConfig, DEFAULT_CONFIG, ENVIRONMENTS };
