/**
 * BASE FX BROKER CONNECTOR
 *
 * Abstract base class for all FX broker integrations.
 * Provides unified interface for:
 * - Authentication & session management
 * - Order placement (market, limit, stop, OCO)
 * - Position management
 * - Account info & balance
 * - Market data streaming
 * - Rate limiting & retry logic
 */

import crypto from 'node:crypto';

const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit',
  TRAILING_STOP: 'trailing_stop',
  OCO: 'oco',
};

const ORDER_SIDES = {
  BUY: 'buy',
  SELL: 'sell',
};

const ORDER_STATUS = {
  PENDING: 'pending',
  OPEN: 'open',
  FILLED: 'filled',
  PARTIALLY_FILLED: 'partially_filled',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

const BROKER_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
};

class BaseFXBroker {
  constructor({ brokerId, name, apiEndpoint, credentials = {}, rateLimit = { requests: 30, windowMs: 1000 } }) {
    this.brokerId = brokerId;
    this.name = name;
    this.apiEndpoint = apiEndpoint;
    this.credentials = credentials;
    this.rateLimit = rateLimit;
    this.status = BROKER_STATUS.DISCONNECTED;
    this.requestLog = [];
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.orders = new Map();
    this.positions = new Map();
    this.balances = new Map();
    this.instruments = new Map();
    this.eventHandlers = new Map();
  }

  async connect() {
    this.status = BROKER_STATUS.CONNECTING;
    const result = await this._doConnect();
    this.status = result.success ? BROKER_STATUS.CONNECTED : BROKER_STATUS.ERROR;
    return result;
  }

  async authenticate() {
    if (this.status !== BROKER_STATUS.CONNECTED) {
      throw new Error(`Cannot authenticate in state: ${this.status}`);
    }
    const result = await this._doAuthenticate();
    this.status = result.success ? BROKER_STATUS.AUTHENTICATED : BROKER_STATUS.ERROR;
    return result;
  }

  async disconnect() {
    await this._doDisconnect();
    this.status = BROKER_STATUS.DISCONNECTED;
    return { disconnected: true };
  }

  async placeOrder(order) {
    this._enforceRateLimit();
    this._validateOrder(order);

    const internalOrder = {
      id: `${this.brokerId}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`,
      brokerOrderId: null,
      ...order,
      status: ORDER_STATUS.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fills: [],
    };

    const result = await this._doPlaceOrder(internalOrder);
    internalOrder.brokerOrderId = result.brokerOrderId;
    internalOrder.status = result.status || ORDER_STATUS.OPEN;
    this.orders.set(internalOrder.id, internalOrder);
    this._emit('order.placed', internalOrder);
    return internalOrder;
  }

  async cancelOrder(orderId) {
    this._enforceRateLimit();
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order not found: ${orderId}`);

    const result = await this._doCancelOrder(order);
    order.status = ORDER_STATUS.CANCELLED;
    order.updatedAt = Date.now();
    this._emit('order.cancelled', order);
    return { ...order, ...result };
  }

  async modifyOrder(orderId, modifications) {
    this._enforceRateLimit();
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order not found: ${orderId}`);

    const result = await this._doModifyOrder(order, modifications);
    Object.assign(order, modifications, { updatedAt: Date.now() });
    this._emit('order.modified', order);
    return { ...order, ...result };
  }

  async getPositions() {
    this._enforceRateLimit();
    const positions = await this._doGetPositions();
    for (const pos of positions) {
      this.positions.set(pos.instrument, pos);
    }
    return positions;
  }

  async getBalance() {
    this._enforceRateLimit();
    return this._doGetBalance();
  }

  async getInstruments() {
    this._enforceRateLimit();
    const instruments = await this._doGetInstruments();
    for (const inst of instruments) {
      this.instruments.set(inst.symbol, inst);
    }
    return instruments;
  }

  async getQuote(symbol) {
    this._enforceRateLimit();
    return this._doGetQuote(symbol);
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  _emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const h of handlers) {
      try { h(data); } catch { /* isolated */ }
    }
  }

  _enforceRateLimit() {
    const now = Date.now();
    if (now - this.windowStart > this.rateLimit.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }
    this.requestCount++;
    if (this.requestCount > this.rateLimit.requests) {
      throw new Error(`Rate limit exceeded: ${this.rateLimit.requests} per ${this.rateLimit.windowMs}ms`);
    }
  }

  _validateOrder(order) {
    if (!order.symbol) throw new Error('Order symbol required');
    if (!order.side || !Object.values(ORDER_SIDES).includes(order.side)) {
      throw new Error(`Invalid order side: ${order.side}`);
    }
    if (!order.quantity || order.quantity <= 0) throw new Error('Invalid order quantity');
    if (!order.type) order.type = ORDER_TYPES.MARKET;
    if (order.type === ORDER_TYPES.LIMIT && !order.limitPrice) {
      throw new Error('Limit price required for limit orders');
    }
    if (order.type === ORDER_TYPES.STOP && !order.stopPrice) {
      throw new Error('Stop price required for stop orders');
    }
  }

  getStatus() {
    return {
      brokerId: this.brokerId,
      name: this.name,
      status: this.status,
      openOrders: [...this.orders.values()].filter(o => o.status === ORDER_STATUS.OPEN).length,
      positions: this.positions.size,
    };
  }

  // Abstract methods to be implemented by subclasses
  async _doConnect() { return { success: true }; }
  async _doAuthenticate() { return { success: true }; }
  async _doDisconnect() { return { success: true }; }
  async _doPlaceOrder(order) { return { brokerOrderId: `sim-${Date.now()}`, status: ORDER_STATUS.FILLED }; }
  async _doCancelOrder(order) { return { cancelled: true }; }
  async _doModifyOrder(order, mods) { return { modified: true }; }
  async _doGetPositions() { return []; }
  async _doGetBalance() { return { balance: 0, equity: 0, margin: 0, freeMargin: 0 }; }
  async _doGetInstruments() { return []; }
  async _doGetQuote(symbol) { return { bid: 0, ask: 0, spread: 0 }; }
}

export {
  BaseFXBroker,
  ORDER_TYPES,
  ORDER_SIDES,
  ORDER_STATUS,
  BROKER_STATUS,
};

export default BaseFXBroker;
