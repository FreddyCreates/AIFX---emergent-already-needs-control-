/**
 * Unified Broker Adapter
 * Automatic asset-class routing + failover
 */

import { FX_BROKERS, createFxConnector } from '../connectors/fx/index.js';
import { CRYPTO_EXCHANGES, createCryptoConnector } from '../connectors/crypto/index.js';

export class UnifiedBrokerAdapter {
  constructor(config = {}) {
    this.connectors = new Map();
    this.failoverOrder = config.failoverOrder || [];
    this.assetClassRouting = config.assetClassRouting || {};
    this.activeConnector = null;
    this.failoverAttempts = 0;
    this.maxFailoverAttempts = config.maxFailoverAttempts || 3;
  }

  registerConnector(name, connector) {
    this.connectors.set(name, connector);
    if (!this.activeConnector) this.activeConnector = name;
  }

  async connectAll() {
    const results = [];
    for (const [name, connector] of this.connectors) {
      try {
        await connector.connect();
        results.push({ name, status: 'connected' });
      } catch (e) {
        results.push({ name, status: 'failed', error: e.message });
      }
    }
    return results;
  }

  // ─── Asset-Class Routing ───────────────────────────────────────────────

  routeByAssetClass(symbol) {
    const upper = symbol.toUpperCase();
    // Crypto pairs typically contain USDT, BTC, ETH, etc.
    const cryptoIndicators = ['USDT', 'BTC', 'ETH', 'BNB', 'USDC', 'PERP'];
    const isCrypto = cryptoIndicators.some(i => upper.includes(i));
    
    if (isCrypto && this.assetClassRouting.crypto) {
      return this.connectors.get(this.assetClassRouting.crypto);
    }
    if (!isCrypto && this.assetClassRouting.fx) {
      return this.connectors.get(this.assetClassRouting.fx);
    }
    // Fall back to active connector
    return this.connectors.get(this.activeConnector);
  }

  // ─── Failover ──────────────────────────────────────────────────────────

  async executeWithFailover(operation, ...args) {
    const order = this.failoverOrder.length > 0 
      ? this.failoverOrder 
      : [...this.connectors.keys()];

    for (const name of order) {
      const connector = this.connectors.get(name);
      if (!connector || !connector.connected) continue;
      try {
        const result = await connector[operation](...args);
        this.failoverAttempts = 0;
        return { ...result, executedOn: name };
      } catch (e) {
        this.failoverAttempts++;
        if (this.failoverAttempts >= this.maxFailoverAttempts) {
          throw new Error(`All failover attempts exhausted after ${this.maxFailoverAttempts} tries`);
        }
      }
    }
    throw new Error('No connected connectors available');
  }

  // ─── Unified Interface ─────────────────────────────────────────────────

  async placeOrder(order) {
    const connector = this.routeByAssetClass(order.symbol);
    if (!connector) throw new Error(`No connector for symbol: ${order.symbol}`);
    return connector.placeOrder(order);
  }

  async cancelOrder(orderId, exchange) {
    if (exchange) {
      const connector = this.connectors.get(exchange);
      if (connector) return connector.cancelOrder(orderId);
    }
    return this.executeWithFailover('cancelOrder', orderId);
  }

  async getBalance(exchange) {
    if (exchange) {
      const connector = this.connectors.get(exchange);
      if (connector) return connector.getBalance();
    }
    // Aggregate balances
    const balances = [];
    for (const [name, connector] of this.connectors) {
      if (!connector.connected) continue;
      try {
        const bal = await connector.getBalance();
        balances.push({ exchange: name, ...bal });
      } catch { /* skip */ }
    }
    return balances;
  }

  async getPositions(exchange) {
    if (exchange) {
      const connector = this.connectors.get(exchange);
      if (connector) return connector.getPositions();
    }
    const all = [];
    for (const [name, connector] of this.connectors) {
      if (!connector.connected) continue;
      try {
        const positions = await connector.getPositions();
        all.push(...positions.map(p => ({ ...p, exchange: name })));
      } catch { /* skip */ }
    }
    return all;
  }

  async getQuote(symbol) {
    const connector = this.routeByAssetClass(symbol);
    if (!connector) throw new Error(`No connector for symbol: ${symbol}`);
    return connector.getQuote(symbol);
  }

  getConnectorNames() {
    return [...this.connectors.keys()];
  }

  getStatus() {
    const status = {};
    for (const [name, connector] of this.connectors) {
      status[name] = { connected: connector.connected, lastHeartbeat: connector.lastHeartbeat };
    }
    return status;
  }
}
