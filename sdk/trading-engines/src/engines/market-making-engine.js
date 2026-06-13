/**
 * Market Making Engine
 * Multi-level quoting, inventory skew, volatility adjustment
 */

export class MarketMakingEngine {
  constructor(config = {}) {
    this.levels = config.levels || 5;
    this.baseSpread = config.baseSpread || 0.001; // 10 bps
    this.levelSpacing = config.levelSpacing || 0.0005; // 5 bps between levels
    this.baseSize = config.baseSize || 1;
    this.sizeMultiplier = config.sizeMultiplier || 1.5;
    this.maxInventory = config.maxInventory || 100;
    this.inventorySkewFactor = config.inventorySkewFactor || 0.5;
    this.volatilityAdjFactor = config.volatilityAdjFactor || 2;
    this.inventory = 0;
    this.quoteHistory = [];
  }

  // ─── Multi-Level Quoting ───────────────────────────────────────────────

  generateQuotes(midPrice, options = {}) {
    const { volatility = 0.01, inventory = this.inventory } = options;
    const bids = [];
    const asks = [];

    // Volatility adjustment: widen spread in high vol
    const volAdjSpread = this.baseSpread * (1 + volatility * this.volatilityAdjFactor);
    
    // Inventory skew: shift quotes away from inventory direction
    const inventoryRatio = inventory / this.maxInventory;
    const skew = inventoryRatio * this.inventorySkewFactor * volAdjSpread;

    for (let i = 0; i < this.levels; i++) {
      const levelOffset = volAdjSpread / 2 + this.levelSpacing * i;
      const levelSize = this.baseSize * Math.pow(this.sizeMultiplier, i);

      bids.push({
        level: i + 1,
        price: midPrice - levelOffset - skew,
        size: levelSize,
        spread: (levelOffset + skew) * 2 / midPrice,
      });

      asks.push({
        level: i + 1,
        price: midPrice + levelOffset - skew,
        size: levelSize,
        spread: (levelOffset - skew) * 2 / midPrice,
      });
    }

    const quotes = {
      mid: midPrice,
      bestBid: bids[0].price,
      bestAsk: asks[0].price,
      spread: asks[0].price - bids[0].price,
      spreadBps: (asks[0].price - bids[0].price) / midPrice * 10000,
      bids,
      asks,
      inventory,
      skew,
      volatilityAdj: volAdjSpread / this.baseSpread,
      timestamp: Date.now(),
    };

    this.quoteHistory.push(quotes);
    if (this.quoteHistory.length > 1000) this.quoteHistory.shift();
    return quotes;
  }

  // ─── Inventory Management ──────────────────────────────────────────────

  updateInventory(fill) {
    const delta = fill.side === 'BUY' ? fill.quantity : -fill.quantity;
    this.inventory += delta;
    return {
      inventory: this.inventory,
      maxInventory: this.maxInventory,
      utilizationPct: Math.abs(this.inventory) / this.maxInventory * 100,
      side: this.inventory > 0 ? 'LONG' : this.inventory < 0 ? 'SHORT' : 'NEUTRAL',
    };
  }

  getInventoryStatus() {
    return {
      inventory: this.inventory,
      maxInventory: this.maxInventory,
      utilizationPct: Math.abs(this.inventory) / this.maxInventory * 100,
      risk: Math.abs(this.inventory) > this.maxInventory * 0.8 ? 'HIGH' : 
            Math.abs(this.inventory) > this.maxInventory * 0.5 ? 'MEDIUM' : 'LOW',
    };
  }

  // ─── Performance ───────────────────────────────────────────────────────

  getStats() {
    if (this.quoteHistory.length === 0) return { avgSpread: 0, quotesGenerated: 0 };
    const avgSpread = this.quoteHistory.reduce((s, q) => s + q.spreadBps, 0) / this.quoteHistory.length;
    return {
      quotesGenerated: this.quoteHistory.length,
      avgSpreadBps: avgSpread,
      currentInventory: this.inventory,
    };
  }
}
