/**
 * OrderFlowAnalyzer — Analyzes order flow, market depth, and trade
 * execution patterns to detect institutional activity, iceberg orders,
 * spoofing, and supply/demand imbalances.
 *
 * @module @medina/aifx-foundation-model/order-flow-analyzer
 */

export class OrderFlowAnalyzer {
  constructor(config = {}) {
    this.icebergThreshold = config.icebergThreshold ?? 3;
    this.spoofingTimeWindowMs = config.spoofingTimeWindowMs ?? 5000;
    this.imbalanceThreshold = config.imbalanceThreshold ?? 0.2;
    /** @type {Array} */
    this.orderLog = [];
  }

  /**
   * Analyze a batch of orders/trades.
   * @param {Array<{price: number, quantity: number, side: string, type: string, timestamp?: number}>} orders
   * @returns {object} order flow analysis
   */
  analyze(orders) {
    if (!orders || orders.length === 0) {
      return { empty: true, orderCount: 0 };
    }

    this.orderLog.push(...orders);

    const buys = orders.filter(o => o.side === 'buy');
    const sells = orders.filter(o => o.side === 'sell');

    const buyVolume = buys.reduce((s, o) => s + (o.quantity ?? 0), 0);
    const sellVolume = sells.reduce((s, o) => s + (o.quantity ?? 0), 0);
    const totalVolume = buyVolume + sellVolume;
    const delta = buyVolume - sellVolume;
    const cumulativeDelta = delta;
    const imbalance = totalVolume > 0 ? delta / totalVolume : 0;

    // Aggressive vs passive
    const aggressiveBuys = buys.filter(o => o.type === 'market');
    const aggressiveSells = sells.filter(o => o.type === 'market');
    const passiveBuys = buys.filter(o => o.type === 'limit');
    const passiveSells = sells.filter(o => o.type === 'limit');

    // Iceberg detection
    const icebergs = this._detectIcebergs(orders);

    // Spoofing detection
    const spoofingIndicators = this._detectSpoofing(orders);

    // Large order detection (institutional)
    const avgSize = totalVolume / orders.length;
    const largeOrders = orders.filter(o => (o.quantity ?? 0) > avgSize * 3);

    // Absorption analysis: large passive orders absorbing aggressive flow
    const absorption = this._detectAbsorption(orders);

    // Pressure determination
    const pressure = imbalance > this.imbalanceThreshold ? 'buy-pressure'
      : imbalance < -this.imbalanceThreshold ? 'sell-pressure' : 'balanced';

    return {
      orderCount: orders.length,
      buyVolume,
      sellVolume,
      totalVolume,
      delta,
      cumulativeDelta,
      imbalance: +imbalance.toFixed(4),
      pressure,
      aggressiveBuys: aggressiveBuys.length,
      aggressiveSells: aggressiveSells.length,
      passiveBuys: passiveBuys.length,
      passiveSells: passiveSells.length,
      icebergCandidates: icebergs.length,
      icebergs,
      spoofingIndicators,
      largeOrders: largeOrders.length,
      absorption,
      timestamp: Date.now(),
    };
  }

  /**
   * Analyze order book depth (bid/ask levels).
   * @param {object} book — { bids: [{price, quantity}], asks: [{price, quantity}] }
   * @returns {object} depth analysis
   */
  analyzeDepth(book) {
    if (!book || !book.bids || !book.asks) {
      throw new Error('OrderFlowAnalyzer: analyzeDepth requires book with bids and asks');
    }

    const bidVolume = book.bids.reduce((s, b) => s + (b.quantity ?? 0), 0);
    const askVolume = book.asks.reduce((s, a) => s + (a.quantity ?? 0), 0);
    const totalDepth = bidVolume + askVolume;
    const depthImbalance = totalDepth > 0 ? (bidVolume - askVolume) / totalDepth : 0;

    const bestBid = book.bids.length > 0 ? Math.max(...book.bids.map(b => b.price)) : 0;
    const bestAsk = book.asks.length > 0 ? Math.min(...book.asks.map(a => a.price)) : 0;
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;
    const spreadBps = midPrice > 0 ? (spread / midPrice) * 10000 : 0;

    // Detect walls (large resting orders)
    const avgBidSize = bidVolume / (book.bids.length || 1);
    const avgAskSize = askVolume / (book.asks.length || 1);
    const bidWalls = book.bids.filter(b => b.quantity > avgBidSize * 5);
    const askWalls = book.asks.filter(a => a.quantity > avgAskSize * 5);

    return {
      bidLevels: book.bids.length,
      askLevels: book.asks.length,
      bidVolume,
      askVolume,
      depthImbalance: +depthImbalance.toFixed(4),
      bestBid,
      bestAsk,
      spread: +spread.toFixed(6),
      spreadBps: +spreadBps.toFixed(2),
      midPrice: +midPrice.toFixed(6),
      bidWalls: bidWalls.length,
      askWalls: askWalls.length,
      depthBias: depthImbalance > 0.15 ? 'bid-heavy' : depthImbalance < -0.15 ? 'ask-heavy' : 'balanced',
      timestamp: Date.now(),
    };
  }

  /**
   * Reset order log.
   */
  reset() {
    this.orderLog = [];
  }

  /* ---- Internal ---- */

  _detectIcebergs(orders) {
    const priceMap = new Map();
    for (const o of orders) {
      if (o.type !== 'limit') continue;
      const key = `${o.price}-${o.side}`;
      if (!priceMap.has(key)) priceMap.set(key, []);
      priceMap.get(key).push(o);
    }

    const icebergs = [];
    for (const [key, fills] of priceMap) {
      if (fills.length >= this.icebergThreshold) {
        const totalQty = fills.reduce((s, f) => s + (f.quantity ?? 0), 0);
        icebergs.push({ priceLevel: key, fills: fills.length, totalQuantity: totalQty });
      }
    }
    return icebergs;
  }

  _detectSpoofing(orders) {
    // Spoofing: large orders placed then quickly cancelled
    const indicators = [];
    const limitOrders = orders.filter(o => o.type === 'limit');

    // Check for orders that are suspiciously large relative to mean
    if (limitOrders.length > 5) {
      const avgQty = limitOrders.reduce((s, o) => s + (o.quantity ?? 0), 0) / limitOrders.length;
      const suspicious = limitOrders.filter(o => (o.quantity ?? 0) > avgQty * 10);
      if (suspicious.length > 0) {
        indicators.push({
          type: 'outsized-limit',
          count: suspicious.length,
          avgMultiple: +(suspicious.reduce((s, o) => s + (o.quantity ?? 0), 0) / suspicious.length / avgQty).toFixed(2),
        });
      }
    }

    return indicators;
  }

  _detectAbsorption(orders) {
    // Absorption: passive orders absorbing aggressive flow without price movement
    const marketOrders = orders.filter(o => o.type === 'market');
    const limitOrders = orders.filter(o => o.type === 'limit');

    if (marketOrders.length === 0 || limitOrders.length === 0) {
      return { detected: false };
    }

    const marketVolume = marketOrders.reduce((s, o) => s + (o.quantity ?? 0), 0);
    const limitVolume = limitOrders.reduce((s, o) => s + (o.quantity ?? 0), 0);
    const ratio = limitVolume / (marketVolume || 1);

    return {
      detected: ratio > 2,
      absorptionRatio: +ratio.toFixed(4),
      marketVolume,
      limitVolume,
    };
  }
}
