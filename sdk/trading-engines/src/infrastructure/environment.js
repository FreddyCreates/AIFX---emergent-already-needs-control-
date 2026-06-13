/**
 * Environment Configs
 * Dev / Staging / Prod with validation
 */

export const ENVIRONMENTS = {
  development: {
    name: 'development',
    sandbox: true,
    logLevel: 'debug',
    maxOrderSize: 1000,
    maxPositions: 5,
    allowLiveTrading: false,
    webhookValidation: false,
    rateLimit: 100,
    killSwitchDefault: false,
    circuitBreakerEnabled: true,
    maxDailyLoss: 0.1,
    maxDrawdown: 0.2,
    connectors: {
      fx: { sandbox: true },
      crypto: { sandbox: true },
    },
  },
  staging: {
    name: 'staging',
    sandbox: true,
    logLevel: 'info',
    maxOrderSize: 10000,
    maxPositions: 20,
    allowLiveTrading: false,
    webhookValidation: true,
    rateLimit: 50,
    killSwitchDefault: false,
    circuitBreakerEnabled: true,
    maxDailyLoss: 0.05,
    maxDrawdown: 0.15,
    connectors: {
      fx: { sandbox: true },
      crypto: { sandbox: true },
    },
  },
  production: {
    name: 'production',
    sandbox: false,
    logLevel: 'warn',
    maxOrderSize: 1000000,
    maxPositions: 100,
    allowLiveTrading: true,
    webhookValidation: true,
    rateLimit: 30,
    killSwitchDefault: false,
    circuitBreakerEnabled: true,
    maxDailyLoss: 0.03,
    maxDrawdown: 0.1,
    connectors: {
      fx: { sandbox: false },
      crypto: { sandbox: false },
    },
  },
};

export function getEnvironment(env) {
  const config = ENVIRONMENTS[env || 'development'];
  if (!config) throw new Error(`Unknown environment: ${env}. Use: development, staging, production`);
  return { ...config };
}

export function validateConfig(config) {
  const errors = [];

  if (!config.name) errors.push('Missing environment name');
  if (config.maxDailyLoss !== undefined && (config.maxDailyLoss < 0 || config.maxDailyLoss > 1)) {
    errors.push('maxDailyLoss must be between 0 and 1');
  }
  if (config.maxDrawdown !== undefined && (config.maxDrawdown < 0 || config.maxDrawdown > 1)) {
    errors.push('maxDrawdown must be between 0 and 1');
  }
  if (config.maxOrderSize !== undefined && config.maxOrderSize <= 0) {
    errors.push('maxOrderSize must be positive');
  }
  if (config.rateLimit !== undefined && config.rateLimit <= 0) {
    errors.push('rateLimit must be positive');
  }

  return {
    valid: errors.length === 0,
    errors,
    config,
  };
}
