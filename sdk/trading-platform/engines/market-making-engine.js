/**
 * MARKET MAKING ENGINE
 *
 * Automated market-making strategies:
 * - Bid/ask spread management
 * - Inventory risk management
 * - Quote adjustment based on volatility
 * - Adverse selection detection
 * - Multi-level order book quoting
 */

class MarketMakingEngine {
  constructor({
    baseSpreadBps = 5,
    maxInventory = 100,
    inventorySkew = 0.5,
    levels = 5,
    levelSpacing = 2,
    refreshInterval = 1000,
  } = {}) {
    this.baseSpreadBps = baseSpreadBps;
    this.maxInventory = maxInventory;
    this.inventorySkew = inventorySkew;
    this.levels = levels;
    this.levelSpacing = levelSpacing;
    this.refreshInterval = refreshInterval;
    this.inventory = new Map();
    this.quotes = new Map();
    this.fills = [];
    this.stats = { quotesGenerated: 0, fills: 0, pnl: 0 };
  }

  generateQuotes(symbol, midPrice, volatility = 0.01) {
    const inventory = this.inventory.get(symbol) || 0;
    const inventoryRatio = inventory / this.maxInventory;
    const skewAdjustment = inventoryRatio * this.inventorySkew * this.baseSpreadBps;
    const volAdjustment = volatility * 10000 * 0.5;

    const effectiveSpread = this.baseSpreadBps + volAdjustment;

    const bids = [];
    const asks = [];

    for (let i = 0; i < this.levels; i++) {
      const levelOffset = i * this.levelSpacing;
      const bidSpread = (effectiveSpread / 2 + levelOffset + skewAdjustment) / 10000;
      const askSpread = (effectiveSpread / 2 + levelOffset - skewAdjustment) / 10000;

      bids.push({
        price: midPrice * (1 - bidSpread),
        size: this._computeLevelSize(i),
        level: i,
      });
      asks.push({
        price: midPrice * (1 + askSpread),
        size: this._computeLevelSize(i),
        level: i,
      });
    }

    const quote = { symbol, midPrice, bids, asks, inventory, timestamp: Date.now() };
    this.quotes.set(symbol, quote);
    this.stats.quotesGenerated++;
    return quote;
  }

  processFill(symbol, side, price, quantity) {
    const current = this.inventory.get(symbol) || 0;
    const newInventory = side === 'buy' ? current + quantity : current - quantity;
    this.inventory.set(symbol, newInventory);

    const pnl = side === 'sell' ? quantity * price : -quantity * price;
    this.stats.pnl += pnl;
    this.stats.fills++;

    this.fills.push({ symbol, side, price, quantity, inventory: newInventory, pnl, timestamp: Date.now() });

    return { symbol, inventory: newInventory, pnl, totalPnL: this.stats.pnl };
  }

  shouldHedge(symbol) {
    const inventory = Math.abs(this.inventory.get(symbol) || 0);
    return inventory > this.maxInventory * 0.8;
  }

  _computeLevelSize(level) {
    return Math.max(1, 10 - level * 2);
  }

  getStats() { return { ...this.stats, inventory: Object.fromEntries(this.inventory) }; }
}

/**
 * ARBITRAGE ENGINE
 *
 * Cross-exchange & cross-asset arbitrage detection:
 * - Triangular arbitrage (FX)
 * - Cross-exchange spot arbitrage (crypto)
 * - Futures basis arbitrage
 * - Statistical arbitrage (pairs trading)
 */

class ArbitrageEngine {
  constructor({ minProfitBps = 5, maxLatencyMs = 500, maxExposure = 100000 } = {}) {
    this.minProfitBps = minProfitBps;
    this.maxLatencyMs = maxLatencyMs;
    this.maxExposure = maxExposure;
    this.opportunities = [];
    this.prices = new Map();
    this.stats = { scanned: 0, found: 0, executed: 0, totalProfit: 0 };
  }

  updatePrice(exchange, symbol, bid, ask, timestamp = Date.now()) {
    const key = `${exchange}:${symbol}`;
    this.prices.set(key, { exchange, symbol, bid, ask, timestamp });
  }

  scanCrossExchange(symbol, exchanges) {
    this.stats.scanned++;
    const quotes = exchanges.map(ex => this.prices.get(`${ex}:${symbol}`)).filter(Boolean);
    if (quotes.length < 2) return null;

    let bestBid = { bid: 0, exchange: '' };
    let bestAsk = { ask: Infinity, exchange: '' };

    for (const q of quotes) {
      if (q.bid > bestBid.bid) bestBid = { bid: q.bid, exchange: q.exchange };
      if (q.ask < bestAsk.ask) bestAsk = { ask: q.ask, exchange: q.exchange };
    }

    const profitBps = (bestBid.bid - bestAsk.ask) / bestAsk.ask * 10000;

    if (profitBps > this.minProfitBps && bestBid.exchange !== bestAsk.exchange) {
      const opp = {
        type: 'cross_exchange',
        symbol,
        buyExchange: bestAsk.exchange,
        sellExchange: bestBid.exchange,
        buyPrice: bestAsk.ask,
        sellPrice: bestBid.bid,
        profitBps,
        timestamp: Date.now(),
      };
      this.opportunities.push(opp);
      this.stats.found++;
      return opp;
    }

    return null;
  }

  scanTriangular(base, quote, cross, rates) {
    this.stats.scanned++;
    // A -> B -> C -> A triangular path
    const leg1 = rates[`${base}/${quote}`];
    const leg2 = rates[`${quote}/${cross}`];
    const leg3 = rates[`${cross}/${base}`];

    if (!leg1 || !leg2 || !leg3) return null;

    const impliedRate = leg1.ask * leg2.ask * leg3.ask;
    const profitBps = (1 / impliedRate - 1) * 10000;

    if (Math.abs(profitBps) > this.minProfitBps) {
      const opp = {
        type: 'triangular',
        path: `${base} -> ${quote} -> ${cross} -> ${base}`,
        legs: [leg1, leg2, leg3],
        impliedRate,
        profitBps: Math.abs(profitBps),
        direction: profitBps > 0 ? 'forward' : 'reverse',
        timestamp: Date.now(),
      };
      this.opportunities.push(opp);
      this.stats.found++;
      return opp;
    }

    return null;
  }

  scanBasisArbitrage(spotPrice, futuresPrice, daysToExpiry) {
    this.stats.scanned++;
    const basis = (futuresPrice - spotPrice) / spotPrice;
    const annualizedBasis = basis * (365 / daysToExpiry);
    const profitBps = basis * 10000;

    if (Math.abs(profitBps) > this.minProfitBps * 5) {
      const opp = {
        type: 'basis',
        spotPrice,
        futuresPrice,
        basis,
        annualizedBasis,
        profitBps: Math.abs(profitBps),
        direction: basis > 0 ? 'cash_and_carry' : 'reverse_cash_and_carry',
        daysToExpiry,
        timestamp: Date.now(),
      };
      this.opportunities.push(opp);
      this.stats.found++;
      return opp;
    }

    return null;
  }

  getOpportunities(limit = 20) {
    return this.opportunities.slice(-limit);
  }

  getStats() { return { ...this.stats }; }
}

export { MarketMakingEngine, ArbitrageEngine };
