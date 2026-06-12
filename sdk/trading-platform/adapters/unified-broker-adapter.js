/**
 * UNIFIED BROKER ADAPTER
 *
 * Single interface to route orders to any FX broker or crypto exchange.
 * Features:
 * - Normalized order interface across all venues
 * - Automatic venue selection based on asset class
 * - Failover routing
 * - Aggregated position view
 * - Cross-venue portfolio reconciliation
 */

import crypto from 'node:crypto';

const ASSET_CLASSES = {
  FX: 'fx',
  CRYPTO: 'crypto',
  METALS: 'metals',
  INDICES: 'indices',
};

class UnifiedBrokerAdapter {
  constructor() {
    this.fxBrokers = new Map();
    this.cryptoExchanges = new Map();
    this.routingRules = new Map();
    this.orderHistory = [];
    this.stats = { routed: 0, filled: 0, rejected: 0, failovers: 0 };
  }

  registerFXBroker(brokerId, broker) {
    this.fxBrokers.set(brokerId, broker);
  }

  registerCryptoExchange(exchangeId, exchange) {
    this.cryptoExchanges.set(exchangeId, exchange);
  }

  setRoutingRule(symbol, { preferredVenue, failoverVenues = [], assetClass }) {
    this.routingRules.set(symbol, { preferredVenue, failoverVenues, assetClass });
  }

  async routeOrder(order) {
    this.stats.routed++;
    const assetClass = this._classifyAsset(order.symbol);
    const route = this._resolveRoute(order.symbol, assetClass);

    const normalizedOrder = {
      id: `unified-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`,
      ...order,
      assetClass,
      routedTo: route.venue,
      routedAt: Date.now(),
    };

    let result;
    try {
      result = await this._executeOnVenue(route.venue, assetClass, normalizedOrder);
    } catch (err) {
      // Failover
      for (const fallback of route.failovers) {
        try {
          result = await this._executeOnVenue(fallback, assetClass, normalizedOrder);
          this.stats.failovers++;
          normalizedOrder.routedTo = fallback;
          break;
        } catch { /* try next */ }
      }
      if (!result) {
        this.stats.rejected++;
        result = { status: 'rejected', reason: err.message };
      }
    }

    const record = { ...normalizedOrder, result, completedAt: Date.now() };
    this.orderHistory.push(record);

    if (result.status === 'filled' || result.status === 'open') {
      this.stats.filled++;
    }

    return record;
  }

  async getAggregatedPositions() {
    const positions = [];

    for (const [id, broker] of this.fxBrokers) {
      try {
        const brokerPositions = await broker.getPositions();
        for (const p of brokerPositions) {
          positions.push({ ...p, venue: id, assetClass: ASSET_CLASSES.FX });
        }
      } catch { /* skip unavailable */ }
    }

    for (const [id, exchange] of this.cryptoExchanges) {
      try {
        const exchangePositions = await exchange.getPositions();
        for (const p of exchangePositions) {
          positions.push({ ...p, venue: id, assetClass: ASSET_CLASSES.CRYPTO });
        }
      } catch { /* skip unavailable */ }
    }

    return positions;
  }

  async getAggregatedBalance() {
    const balances = {};

    for (const [id, broker] of this.fxBrokers) {
      try {
        balances[id] = await broker.getBalance();
      } catch { balances[id] = { error: 'unavailable' }; }
    }

    for (const [id, exchange] of this.cryptoExchanges) {
      try {
        balances[id] = await exchange.getBalance();
      } catch { balances[id] = { error: 'unavailable' }; }
    }

    return balances;
  }

  _classifyAsset(symbol) {
    const rule = this.routingRules.get(symbol);
    if (rule?.assetClass) return rule.assetClass;

    const normalized = symbol.toUpperCase().replace(/[/_-]/g, '');
    const cryptoTokens = ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC'];
    const fxPairs = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'NZD', 'CAD'];
    const metals = ['XAU', 'XAG', 'XPT', 'XPD'];

    if (cryptoTokens.some(t => normalized.includes(t) && (normalized.includes('USD') || normalized.includes('USDT')))) {
      return ASSET_CLASSES.CRYPTO;
    }
    if (metals.some(m => normalized.includes(m))) return ASSET_CLASSES.METALS;
    if (fxPairs.some(p => normalized.startsWith(p) || normalized.endsWith(p))) return ASSET_CLASSES.FX;

    return ASSET_CLASSES.CRYPTO; // Default to crypto for unknown
  }

  _resolveRoute(symbol, assetClass) {
    const rule = this.routingRules.get(symbol);
    if (rule) return { venue: rule.preferredVenue, failovers: rule.failoverVenues };

    // Default routing by asset class
    if (assetClass === ASSET_CLASSES.FX || assetClass === ASSET_CLASSES.METALS) {
      const firstFX = [...this.fxBrokers.keys()][0];
      return { venue: firstFX || 'none', failovers: [...this.fxBrokers.keys()].slice(1) };
    }

    const firstCrypto = [...this.cryptoExchanges.keys()][0];
    return { venue: firstCrypto || 'none', failovers: [...this.cryptoExchanges.keys()].slice(1) };
  }

  async _executeOnVenue(venueId, assetClass, order) {
    if (assetClass === ASSET_CLASSES.FX || assetClass === ASSET_CLASSES.METALS) {
      const broker = this.fxBrokers.get(venueId);
      if (!broker) throw new Error(`FX broker not found: ${venueId}`);
      return broker.placeOrder(order);
    }

    const exchange = this.cryptoExchanges.get(venueId);
    if (!exchange) throw new Error(`Crypto exchange not found: ${venueId}`);
    return exchange.placeOrder(order);
  }

  getStats() { return { ...this.stats, totalOrders: this.orderHistory.length }; }
  getOrderHistory(limit = 50) { return this.orderHistory.slice(-limit); }
}

export { UnifiedBrokerAdapter, ASSET_CLASSES };
export default UnifiedBrokerAdapter;
