/**
 * BASE CRYPTO EXCHANGE CONNECTOR
 *
 * Abstract base class for all crypto exchange integrations.
 * Provides unified interface for:
 * - Spot & derivatives trading
 * - WebSocket market data
 * - Wallet & balance management
 * - Funding rates & leverage
 * - Cross-exchange order book normalization
 */

import crypto from 'node:crypto';

const MARKET_TYPES = {
  SPOT: 'spot',
  PERPETUAL: 'perpetual',
  FUTURES: 'futures',
  OPTIONS: 'options',
  MARGIN: 'margin',
};

const CRYPTO_ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP_MARKET: 'stop_market',
  STOP_LIMIT: 'stop_limit',
  TAKE_PROFIT: 'take_profit',
  TAKE_PROFIT_LIMIT: 'take_profit_limit',
  TRAILING_STOP: 'trailing_stop',
  LIMIT_MAKER: 'limit_maker',
  IOC: 'immediate_or_cancel',
  FOK: 'fill_or_kill',
};

const EXCHANGE_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
  RATE_LIMITED: 'rate_limited',
  MAINTENANCE: 'maintenance',
  ERROR: 'error',
};

class BaseCryptoExchange {
  constructor({ exchangeId, name, apiEndpoint, wsEndpoint, credentials = {}, rateLimit = { requests: 20, windowMs: 1000 } }) {
    this.exchangeId = exchangeId;
    this.name = name;
    this.apiEndpoint = apiEndpoint;
    this.wsEndpoint = wsEndpoint;
    this.credentials = credentials;
    this.rateLimit = rateLimit;
    this.status = EXCHANGE_STATUS.DISCONNECTED;
    this.orders = new Map();
    this.positions = new Map();
    this.balances = new Map();
    this.markets = new Map();
    this.orderBooks = new Map();
    this.eventHandlers = new Map();
    this.requestCount = 0;
    this.windowStart = Date.now();
  }

  async connect() {
    this.status = EXCHANGE_STATUS.CONNECTING;
    const result = await this._doConnect();
    this.status = result.success ? EXCHANGE_STATUS.CONNECTED : EXCHANGE_STATUS.ERROR;
    return result;
  }

  async authenticate() {
    if (this.status !== EXCHANGE_STATUS.CONNECTED) {
      throw new Error(`Cannot authenticate in state: ${this.status}`);
    }
    const result = await this._doAuthenticate();
    this.status = result.success ? EXCHANGE_STATUS.AUTHENTICATED : EXCHANGE_STATUS.ERROR;
    return result;
  }

  async disconnect() {
    await this._doDisconnect();
    this.status = EXCHANGE_STATUS.DISCONNECTED;
  }

  async placeOrder(order) {
    this._enforceRateLimit();
    this._validateOrder(order);

    const internalOrder = {
      id: `${this.exchangeId}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`,
      exchangeOrderId: null,
      ...order,
      status: 'pending',
      createdAt: Date.now(),
      fills: [],
    };

    const result = await this._doPlaceOrder(internalOrder);
    internalOrder.exchangeOrderId = result.exchangeOrderId;
    internalOrder.status = result.status || 'open';
    this.orders.set(internalOrder.id, internalOrder);
    this._emit('order.placed', internalOrder);
    return internalOrder;
  }

  async cancelOrder(orderId) {
    this._enforceRateLimit();
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order not found: ${orderId}`);
    const result = await this._doCancelOrder(order);
    order.status = 'cancelled';
    this._emit('order.cancelled', order);
    return { ...order, ...result };
  }

  async getBalance() {
    this._enforceRateLimit();
    return this._doGetBalance();
  }

  async getMarkets() {
    this._enforceRateLimit();
    const markets = await this._doGetMarkets();
    for (const m of markets) this.markets.set(m.symbol, m);
    return markets;
  }

  async getOrderBook(symbol, depth = 20) {
    this._enforceRateLimit();
    return this._doGetOrderBook(symbol, depth);
  }

  async getTicker(symbol) {
    this._enforceRateLimit();
    return this._doGetTicker(symbol);
  }

  async getPositions() {
    this._enforceRateLimit();
    return this._doGetPositions();
  }

  async setLeverage(symbol, leverage) {
    this._enforceRateLimit();
    return this._doSetLeverage(symbol, leverage);
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
    this.eventHandlers.get(event).push(handler);
  }

  _emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const h of handlers) { try { h(data); } catch { /* isolated */ } }
  }

  _enforceRateLimit() {
    const now = Date.now();
    if (now - this.windowStart > this.rateLimit.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }
    this.requestCount++;
    if (this.requestCount > this.rateLimit.requests) {
      throw new Error(`Rate limit exceeded: ${this.rateLimit.requests}/${this.rateLimit.windowMs}ms`);
    }
  }

  _validateOrder(order) {
    if (!order.symbol) throw new Error('Symbol required');
    if (!order.side || !['buy', 'sell'].includes(order.side)) throw new Error(`Invalid side: ${order.side}`);
    if (!order.quantity || order.quantity <= 0) throw new Error('Invalid quantity');
    if (!order.type) order.type = CRYPTO_ORDER_TYPES.MARKET;
  }

  getStatus() {
    return {
      exchangeId: this.exchangeId,
      name: this.name,
      status: this.status,
      openOrders: [...this.orders.values()].filter(o => o.status === 'open').length,
      markets: this.markets.size,
    };
  }

  // Abstract methods
  async _doConnect() { return { success: true }; }
  async _doAuthenticate() { return { success: true }; }
  async _doDisconnect() { return { success: true }; }
  async _doPlaceOrder(order) { return { exchangeOrderId: `sim-${Date.now()}`, status: 'filled' }; }
  async _doCancelOrder(order) { return { cancelled: true }; }
  async _doGetBalance() { return {}; }
  async _doGetMarkets() { return []; }
  async _doGetOrderBook(symbol, depth) { return { bids: [], asks: [] }; }
  async _doGetTicker(symbol) { return { last: 0, bid: 0, ask: 0, volume: 0 }; }
  async _doGetPositions() { return []; }
  async _doSetLeverage(symbol, leverage) { return { symbol, leverage }; }
}

export {
  BaseCryptoExchange,
  MARKET_TYPES,
  CRYPTO_ORDER_TYPES,
  EXCHANGE_STATUS,
};

export default BaseCryptoExchange;
