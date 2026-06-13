/**
 * Portfolio Engine
 * P&L attribution, Sharpe/Sortino/Calmar ratios, rebalancing, trade journal
 */

export class PortfolioEngine {
  constructor(config = {}) {
    this.riskFreeRate = config.riskFreeRate || 0.05; // 5% annual
    this.rebalanceThreshold = config.rebalanceThreshold || 0.05; // 5% drift
    this.journal = [];
    this.positions = new Map();
    this.dailyReturns = [];
    this.equity = config.initialEquity || 100000;
    this.initialEquity = config.initialEquity || 100000;
  }

  // ─── P&L Attribution ───────────────────────────────────────────────────

  recordTrade(trade) {
    const entry = {
      id: `T-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      pnl: trade.exitPrice
        ? (trade.side === 'BUY' ? 1 : -1) * trade.quantity * (trade.exitPrice - trade.entryPrice)
        : 0,
      fees: trade.fees || 0,
      strategy: trade.strategy || 'default',
      timestamp: trade.timestamp || Date.now(),
      notes: trade.notes || '',
    };
    entry.netPnl = entry.pnl - entry.fees;
    this.journal.push(entry);
    this.equity += entry.netPnl;
    return entry;
  }

  getPnlAttribution(groupBy = 'strategy') {
    const groups = {};
    for (const trade of this.journal) {
      const key = trade[groupBy] || 'unknown';
      if (!groups[key]) groups[key] = { trades: 0, pnl: 0, fees: 0, wins: 0, losses: 0 };
      groups[key].trades++;
      groups[key].pnl += trade.netPnl;
      groups[key].fees += trade.fees;
      if (trade.netPnl > 0) groups[key].wins++;
      else if (trade.netPnl < 0) groups[key].losses++;
    }
    for (const key of Object.keys(groups)) {
      groups[key].winRate = groups[key].wins / (groups[key].trades || 1);
      groups[key].avgPnl = groups[key].pnl / (groups[key].trades || 1);
    }
    return groups;
  }

  // ─── Performance Ratios ────────────────────────────────────────────────

  addDailyReturn(ret) {
    this.dailyReturns.push(ret);
  }

  calculateSharpe(returns = this.dailyReturns) {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const std = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1));
    if (std === 0) return 0;
    const dailyRf = this.riskFreeRate / 252;
    return ((mean - dailyRf) / std) * Math.sqrt(252);
  }

  calculateSortino(returns = this.dailyReturns) {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const negReturns = returns.filter(r => r < 0);
    if (negReturns.length === 0) return Infinity;
    const downDev = Math.sqrt(negReturns.reduce((s, r) => s + r ** 2, 0) / negReturns.length);
    if (downDev === 0) return 0;
    const dailyRf = this.riskFreeRate / 252;
    return ((mean - dailyRf) / downDev) * Math.sqrt(252);
  }

  calculateCalmar(returns = this.dailyReturns) {
    if (returns.length < 2) return 0;
    const annualReturn = returns.reduce((s, r) => s + r, 0) * (252 / returns.length);
    // Max drawdown from equity curve
    let peak = 1, maxDd = 0, equity = 1;
    for (const r of returns) {
      equity *= (1 + r);
      if (equity > peak) peak = equity;
      const dd = (peak - equity) / peak;
      if (dd > maxDd) maxDd = dd;
    }
    if (maxDd === 0) return 0;
    return annualReturn / maxDd;
  }

  getPerformanceMetrics() {
    return {
      sharpe: this.calculateSharpe(),
      sortino: this.calculateSortino(),
      calmar: this.calculateCalmar(),
      totalReturn: (this.equity - this.initialEquity) / this.initialEquity,
      equity: this.equity,
      tradeCount: this.journal.length,
      winRate: this.journal.filter(t => t.netPnl > 0).length / (this.journal.length || 1),
    };
  }

  // ─── Rebalancing ───────────────────────────────────────────────────────

  calculateRebalance(currentAllocations, targetAllocations) {
    const trades = [];
    for (const [asset, target] of Object.entries(targetAllocations)) {
      const current = currentAllocations[asset] || 0;
      const drift = Math.abs(current - target);
      if (drift > this.rebalanceThreshold) {
        trades.push({
          asset,
          currentPct: current,
          targetPct: target,
          drift,
          action: current < target ? 'BUY' : 'SELL',
          adjustPct: target - current,
        });
      }
    }
    return {
      needsRebalance: trades.length > 0,
      trades,
      maxDrift: Math.max(0, ...trades.map(t => t.drift)),
    };
  }

  // ─── Trade Journal ─────────────────────────────────────────────────────

  getJournal(filter = {}) {
    let entries = [...this.journal];
    if (filter.symbol) entries = entries.filter(t => t.symbol === filter.symbol);
    if (filter.strategy) entries = entries.filter(t => t.strategy === filter.strategy);
    if (filter.from) entries = entries.filter(t => t.timestamp >= filter.from);
    if (filter.to) entries = entries.filter(t => t.timestamp <= filter.to);
    return entries;
  }

  getJournalSummary() {
    const total = this.journal.length;
    const wins = this.journal.filter(t => t.netPnl > 0);
    const losses = this.journal.filter(t => t.netPnl < 0);
    return {
      totalTrades: total,
      wins: wins.length,
      losses: losses.length,
      winRate: wins.length / (total || 1),
      totalPnl: this.journal.reduce((s, t) => s + t.netPnl, 0),
      avgWin: wins.length ? wins.reduce((s, t) => s + t.netPnl, 0) / wins.length : 0,
      avgLoss: losses.length ? losses.reduce((s, t) => s + t.netPnl, 0) / losses.length : 0,
      totalFees: this.journal.reduce((s, t) => s + t.fees, 0),
      profitFactor: Math.abs(
        (wins.reduce((s, t) => s + t.netPnl, 0) || 0) /
        (losses.reduce((s, t) => s + t.netPnl, 0) || 1)
      ),
    };
  }
}
