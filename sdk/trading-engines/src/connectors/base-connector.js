/**
 * Base Broker Connector
 * Unified interface for all FX and Crypto connectors
 */

export class BaseBrokerConnector {
  constructor(name, config = {}) {
    this.name = name;
    this.apiKey = config.apiKey || '';
    this.apiSecret = config.apiSecret || '';
    this.baseUrl = config.baseUrl || '';
    this.sandbox = config.sandbox !== false;
    this.connected = false;
    this.lastHeartbeat = null;
    this.rateLimiter = { remaining: config.rateLimit || 100, resetAt: 0 };
  }

  async connect() {
    this.connected = true;
    this.lastHeartbeat = Date.now();
    return { status: 'connected', broker: this.name };
  }

  async disconnect() {
    this.connected = false;
    return { status: 'disconnected', broker: this.name };
  }

  // Order Management
  async placeOrder(order) { throw new Error(`${this.name}: placeOrder not implemented`); }
  async cancelOrder(orderId) { throw new Error(`${this.name}: cancelOrder not implemented`); }
  async modifyOrder(orderId, modifications) { throw new Error(`${this.name}: modifyOrder not implemented`); }
  async getOrder(orderId) { throw new Error(`${this.name}: getOrder not implemented`); }
  async getOpenOrders(symbol) { throw new Error(`${this.name}: getOpenOrders not implemented`); }

  // Position Management
  async getPositions() { throw new Error(`${this.name}: getPositions not implemented`); }
  async getPosition(symbol) { throw new Error(`${this.name}: getPosition not implemented`); }
  async closePosition(symbol, quantity) { throw new Error(`${this.name}: closePosition not implemented`); }
  async closeAllPositions() { throw new Error(`${this.name}: closeAllPositions not implemented`); }

  // Account
  async getBalance() { throw new Error(`${this.name}: getBalance not implemented`); }
  async getAccountInfo() { throw new Error(`${this.name}: getAccountInfo not implemented`); }

  // Market Data
  async getQuote(symbol) { throw new Error(`${this.name}: getQuote not implemented`); }
  async getOrderBook(symbol, depth) { throw new Error(`${this.name}: getOrderBook not implemented`); }
  async getCandles(symbol, timeframe, limit) { throw new Error(`${this.name}: getCandles not implemented`); }

  // Utilities
  _normalizeOrder(order) {
    return {
      symbol: order.symbol,
      side: (order.side || order.action || 'BUY').toUpperCase(),
      type: (order.type || 'MARKET').toUpperCase(),
      quantity: parseFloat(order.quantity || order.amount || order.size || 0),
      price: order.price ? parseFloat(order.price) : undefined,
      stopLoss: order.stopLoss ? parseFloat(order.stopLoss) : undefined,
      takeProfit: order.takeProfit ? parseFloat(order.takeProfit) : undefined,
      timeInForce: order.timeInForce || 'GTC',
      clientOrderId: order.clientOrderId || `${this.name}-${Date.now()}`,
    };
  }

  _normalizePosition(pos) {
    return {
      symbol: pos.symbol,
      side: pos.side || (pos.quantity > 0 ? 'LONG' : 'SHORT'),
      quantity: Math.abs(parseFloat(pos.quantity || pos.size || 0)),
      entryPrice: parseFloat(pos.entryPrice || pos.avgPrice || 0),
      currentPrice: parseFloat(pos.currentPrice || pos.markPrice || 0),
      unrealizedPnl: parseFloat(pos.unrealizedPnl || pos.pnl || 0),
      margin: parseFloat(pos.margin || 0),
      leverage: parseFloat(pos.leverage || 1),
    };
  }

  _normalizeBalance(bal) {
    return {
      currency: bal.currency || 'USD',
      total: parseFloat(bal.total || bal.balance || 0),
      available: parseFloat(bal.available || bal.free || 0),
      margin: parseFloat(bal.margin || bal.used || 0),
      unrealizedPnl: parseFloat(bal.unrealizedPnl || 0),
    };
  }
}
