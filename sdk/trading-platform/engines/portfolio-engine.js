/**
 * DEEP PORTFOLIO ENGINE
 *
 * Full portfolio management:
 * - Multi-asset tracking (FX, crypto, equities, metals)
 * - Real-time P&L attribution
 * - Sharpe, Sortino, Calmar ratios
 * - Correlation matrix
 * - Rebalancing engine
 * - Performance analytics
 * - Trade journal
 */

const PHI = 1.618033988749895;

class DeepPortfolioEngine {
  constructor({ baseCurrency = 'USD', benchmarkReturn = 0.05 } = {}) {
    this.baseCurrency = baseCurrency;
    this.benchmarkReturn = benchmarkReturn;
    this.positions = new Map();
    this.closedTrades = [];
    this.equityCurve = [];
    this.initialEquity = 0;
    this.cash = 0;
    this.deposits = 0;
    this.withdrawals = 0;
  }

  initialize(equity) {
    this.initialEquity = equity;
    this.cash = equity;
    this.deposits = equity;
    this.equityCurve.push({ equity, timestamp: Date.now() });
  }

  openPosition({ symbol, side, quantity, price, fees = 0, assetClass = 'forex', metadata = {} }) {
    const position = {
      id: `pos-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      symbol,
      side,
      quantity,
      entryPrice: price,
      currentPrice: price,
      fees,
      assetClass,
      unrealizedPnL: 0,
      realizedPnL: 0,
      openedAt: Date.now(),
      metadata,
    };

    this.positions.set(position.id, position);
    const cost = quantity * price + fees;
    if (side === 'buy') this.cash -= cost;
    else this.cash += quantity * price - fees;

    return position;
  }

  closePosition(positionId, price, fees = 0) {
    const position = this.positions.get(positionId);
    if (!position) throw new Error(`Position not found: ${positionId}`);

    const pnl = position.side === 'buy'
      ? (price - position.entryPrice) * position.quantity - position.fees - fees
      : (position.entryPrice - price) * position.quantity - position.fees - fees;

    const trade = {
      ...position,
      exitPrice: price,
      closeFees: fees,
      realizedPnL: pnl,
      closedAt: Date.now(),
      holdingPeriodMs: Date.now() - position.openedAt,
      returnPct: pnl / (position.entryPrice * position.quantity),
    };

    this.closedTrades.push(trade);
    this.positions.delete(positionId);

    if (position.side === 'buy') this.cash += price * position.quantity - fees;
    else this.cash -= price * position.quantity + fees;

    return trade;
  }

  updatePrice(symbol, price) {
    for (const [, pos] of this.positions) {
      if (pos.symbol === symbol) {
        pos.currentPrice = price;
        pos.unrealizedPnL = pos.side === 'buy'
          ? (price - pos.entryPrice) * pos.quantity - pos.fees
          : (pos.entryPrice - price) * pos.quantity - pos.fees;
      }
    }
  }

  snapshot() {
    const totalEquity = this.getEquity();
    this.equityCurve.push({ equity: totalEquity, timestamp: Date.now() });
    return totalEquity;
  }

  getEquity() {
    const unrealized = [...this.positions.values()].reduce((s, p) => s + p.unrealizedPnL, 0);
    return this.cash + [...this.positions.values()].reduce((s, p) => s + p.currentPrice * p.quantity, 0);
  }

  getPerformanceMetrics() {
    const equity = this.getEquity();
    const totalReturn = (equity - this.initialEquity) / this.initialEquity;

    const returns = this._computeReturns();
    const sharpe = this._sharpeRatio(returns);
    const sortino = this._sortinoRatio(returns);
    const maxDrawdown = this._maxDrawdown();
    const calmar = maxDrawdown > 0 ? (totalReturn * 252 / this.equityCurve.length) / maxDrawdown : 0;

    const trades = this.closedTrades;
    const winners = trades.filter(t => t.realizedPnL > 0);
    const losers = trades.filter(t => t.realizedPnL <= 0);

    return {
      equity,
      totalReturn,
      totalReturnPct: totalReturn * 100,
      sharpeRatio: sharpe,
      sortinoRatio: sortino,
      calmarRatio: calmar,
      maxDrawdown,
      maxDrawdownPct: maxDrawdown * 100,
      totalTrades: trades.length,
      winRate: trades.length > 0 ? winners.length / trades.length : 0,
      avgWin: winners.length > 0 ? winners.reduce((s, t) => s + t.realizedPnL, 0) / winners.length : 0,
      avgLoss: losers.length > 0 ? losers.reduce((s, t) => s + t.realizedPnL, 0) / losers.length : 0,
      profitFactor: losers.length > 0
        ? Math.abs(winners.reduce((s, t) => s + t.realizedPnL, 0) / (losers.reduce((s, t) => s + t.realizedPnL, 0) || 1))
        : Infinity,
      openPositions: this.positions.size,
      cash: this.cash,
    };
  }

  getPositionsByAssetClass() {
    const grouped = {};
    for (const [, pos] of this.positions) {
      if (!grouped[pos.assetClass]) grouped[pos.assetClass] = [];
      grouped[pos.assetClass].push(pos);
    }
    return grouped;
  }

  getTradeJournal(limit = 50) {
    return this.closedTrades.slice(-limit).map(t => ({
      symbol: t.symbol,
      side: t.side,
      entry: t.entryPrice,
      exit: t.exitPrice,
      pnl: t.realizedPnL,
      returnPct: t.returnPct * 100,
      holdingMs: t.holdingPeriodMs,
      assetClass: t.assetClass,
    }));
  }

  computeRebalanceOrders(targetWeights) {
    const equity = this.getEquity();
    const orders = [];

    for (const [symbol, targetWeight] of Object.entries(targetWeights)) {
      const targetValue = equity * targetWeight;
      const currentPositions = [...this.positions.values()].filter(p => p.symbol === symbol);
      const currentValue = currentPositions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
      const diff = targetValue - currentValue;

      if (Math.abs(diff) / equity > 0.01) {
        const price = currentPositions[0]?.currentPrice || 0;
        if (price > 0) {
          orders.push({
            symbol,
            side: diff > 0 ? 'buy' : 'sell',
            quantity: Math.abs(diff / price),
            reason: 'rebalance',
            currentWeight: currentValue / equity,
            targetWeight,
          });
        }
      }
    }

    return orders;
  }

  _computeReturns() {
    const curve = this.equityCurve;
    if (curve.length < 2) return [];
    const returns = [];
    for (let i = 1; i < curve.length; i++) {
      returns.push((curve[i].equity - curve[i - 1].equity) / curve[i - 1].equity);
    }
    return returns;
  }

  _sharpeRatio(returns) {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length);
    if (stdDev === 0) return 0;
    const annualized = mean * Math.sqrt(252);
    const annualizedStd = stdDev * Math.sqrt(252);
    return (annualized - this.benchmarkReturn) / annualizedStd;
  }

  _sortinoRatio(returns) {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const downside = returns.filter(r => r < 0);
    if (downside.length === 0) return Infinity;
    const downsideDev = Math.sqrt(downside.reduce((s, r) => s + r ** 2, 0) / downside.length);
    if (downsideDev === 0) return 0;
    return (mean * Math.sqrt(252) - this.benchmarkReturn) / (downsideDev * Math.sqrt(252));
  }

  _maxDrawdown() {
    const curve = this.equityCurve;
    let peak = 0;
    let maxDD = 0;
    for (const point of curve) {
      if (point.equity > peak) peak = point.equity;
      const dd = (peak - point.equity) / peak;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD;
  }
}

export { DeepPortfolioEngine };
export default DeepPortfolioEngine;
