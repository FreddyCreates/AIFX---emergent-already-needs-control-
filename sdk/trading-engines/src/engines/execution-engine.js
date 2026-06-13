/**
 * Execution Engine
 * Smart routing, TWAP, VWAP, Iceberg algos, slippage protection, TCA
 */

export class ExecutionEngine {
  constructor(config = {}) {
    this.maxSlippageBps = config.maxSlippageBps || 10; // basis points
    this.defaultAlgo = config.defaultAlgo || 'MARKET';
    this.executionLog = [];
  }

  // ─── Execution Algorithms ──────────────────────────────────────────────

  async executeMarket(connector, order) {
    const result = await connector.placeOrder({ ...order, type: 'MARKET' });
    this._logExecution(order, result, 'MARKET');
    return result;
  }

  generateTWAP(order, config = {}) {
    const { duration = 3600000, slices = 10 } = config;
    const sliceQty = order.quantity / slices;
    const interval = duration / slices;
    const schedule = [];
    for (let i = 0; i < slices; i++) {
      schedule.push({
        slice: i + 1,
        quantity: sliceQty,
        executeAt: Date.now() + interval * i,
        status: 'PENDING',
      });
    }
    return {
      algo: 'TWAP',
      order,
      schedule,
      totalSlices: slices,
      duration,
      sliceInterval: interval,
    };
  }

  generateVWAP(order, volumeProfile = []) {
    const totalVolume = volumeProfile.reduce((s, v) => s + v, 0) || order.quantity;
    const slices = volumeProfile.length || 10;
    const schedule = [];
    for (let i = 0; i < slices; i++) {
      const volWeight = volumeProfile[i] ? volumeProfile[i] / totalVolume : 1 / slices;
      schedule.push({
        slice: i + 1,
        quantity: order.quantity * volWeight,
        volumeWeight: volWeight,
        status: 'PENDING',
      });
    }
    return {
      algo: 'VWAP',
      order,
      schedule,
      totalSlices: slices,
    };
  }

  generateIceberg(order, config = {}) {
    const { visibleQuantity, totalQuantity } = config;
    const visible = visibleQuantity || order.quantity * 0.1;
    const total = totalQuantity || order.quantity;
    const numLevels = Math.ceil(total / visible);
    const levels = [];
    let remaining = total;
    for (let i = 0; i < numLevels; i++) {
      const qty = Math.min(visible, remaining);
      levels.push({ level: i + 1, quantity: qty, status: 'HIDDEN' });
      remaining -= qty;
    }
    levels[0].status = 'VISIBLE';
    return {
      algo: 'ICEBERG',
      order,
      visibleQuantity: visible,
      totalQuantity: total,
      levels,
      currentLevel: 0,
    };
  }

  // ─── Smart Routing ─────────────────────────────────────────────────────

  async smartRoute(connectors, order) {
    // Get quotes from all connectors and route to best price
    const quotes = [];
    for (const connector of connectors) {
      try {
        const quote = await connector.getQuote(order.symbol);
        quotes.push({ connector, quote });
      } catch { /* skip failed connectors */ }
    }
    if (quotes.length === 0) throw new Error('No connectors available');

    const isBuy = order.side === 'BUY';
    quotes.sort((a, b) => isBuy
      ? a.quote.ask - b.quote.ask
      : b.quote.bid - a.quote.bid);

    const best = quotes[0];
    const result = await best.connector.placeOrder(order);
    this._logExecution(order, result, 'SMART_ROUTE');
    return { ...result, routedTo: best.connector.name, quote: best.quote };
  }

  // ─── Slippage Protection ───────────────────────────────────────────────

  checkSlippage(expectedPrice, executedPrice, side) {
    if (!expectedPrice || !executedPrice) return { acceptable: true, slippageBps: 0 };
    const slippage = side === 'BUY'
      ? (executedPrice - expectedPrice) / expectedPrice
      : (expectedPrice - executedPrice) / expectedPrice;
    const slippageBps = slippage * 10000;
    return {
      acceptable: slippageBps <= this.maxSlippageBps,
      slippageBps,
      expectedPrice,
      executedPrice,
      side,
    };
  }

  // ─── Transaction Cost Analysis ─────────────────────────────────────────

  computeTCA(executions) {
    if (executions.length === 0) return { totalCost: 0, avgSlippage: 0, fillRate: 0 };
    let totalSlippage = 0, totalCost = 0, filled = 0;
    for (const exec of executions) {
      if (exec.status === 'FILLED') filled++;
      totalSlippage += exec.slippageBps || 0;
      totalCost += exec.commission || 0;
    }
    return {
      totalExecutions: executions.length,
      filledCount: filled,
      fillRate: filled / executions.length,
      avgSlippageBps: totalSlippage / executions.length,
      totalCommission: totalCost,
      effectiveCostBps: (totalSlippage + totalCost) / executions.length,
    };
  }

  _logExecution(order, result, algo) {
    this.executionLog.push({
      timestamp: Date.now(),
      order,
      result,
      algo,
    });
    if (this.executionLog.length > 10000) this.executionLog.shift();
  }

  getExecutionLog() { return [...this.executionLog]; }
}
