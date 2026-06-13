/**
 * Risk Engine
 * Kelly position sizing, VaR, max drawdown, daily loss limits, circuit breakers, kill switch
 */

export class RiskEngine {
  constructor(config = {}) {
    this.maxPositionPct = config.maxPositionPct || 0.02; // 2% max per position
    this.maxDailyLossPct = config.maxDailyLossPct || 0.05; // 5% daily loss limit
    this.maxDrawdownPct = config.maxDrawdownPct || 0.15; // 15% max drawdown
    this.varConfidence = config.varConfidence || 0.95;
    this.circuitBreakerThreshold = config.circuitBreakerThreshold || 0.03; // 3% rapid loss
    this.killSwitchActive = false;
    this.dailyPnl = 0;
    this.peakEquity = config.initialEquity || 100000;
    this.currentEquity = config.initialEquity || 100000;
    this.tradeCount = 0;
    this.consecutiveLosses = 0;
    this.maxConsecutiveLosses = config.maxConsecutiveLosses || 5;
  }

  // ─── Kelly Criterion Position Sizing ───────────────────────────────────

  kellySize(winRate, avgWin, avgLoss) {
    if (avgLoss === 0) return 0;
    const b = avgWin / avgLoss; // win/loss ratio
    const kelly = (winRate * b - (1 - winRate)) / b;
    // Half-Kelly for safety
    const halfKelly = Math.max(0, kelly * 0.5);
    return Math.min(halfKelly, this.maxPositionPct);
  }

  calculatePositionSize(accountBalance, winRate, avgWin, avgLoss, price) {
    if (this.killSwitchActive) return { size: 0, reason: 'Kill switch active' };
    
    const kellyFraction = this.kellySize(winRate, avgWin, avgLoss);
    const maxRisk = accountBalance * kellyFraction;
    const positionSize = maxRisk / price;

    return {
      fraction: kellyFraction,
      maxRiskAmount: maxRisk,
      positionSize,
      units: Math.floor(positionSize),
      notional: Math.floor(positionSize) * price,
    };
  }

  // ─── Value at Risk ─────────────────────────────────────────────────────

  calculateVaR(returns, confidence = this.varConfidence) {
    if (returns.length === 0) return 0;
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    const var95 = sorted[index] || sorted[0];
    return {
      var: Math.abs(var95),
      confidence,
      worstCase: sorted[0],
      observations: returns.length,
    };
  }

  // ─── Drawdown Management ───────────────────────────────────────────────

  updateEquity(newEquity) {
    this.currentEquity = newEquity;
    if (newEquity > this.peakEquity) this.peakEquity = newEquity;
    const drawdown = (this.peakEquity - this.currentEquity) / this.peakEquity;
    
    if (drawdown >= this.maxDrawdownPct) {
      this.killSwitchActive = true;
    }

    return {
      equity: this.currentEquity,
      peak: this.peakEquity,
      drawdown,
      drawdownPct: drawdown * 100,
      killSwitch: this.killSwitchActive,
    };
  }

  getDrawdown() {
    return (this.peakEquity - this.currentEquity) / this.peakEquity;
  }

  // ─── Daily Loss Limits ─────────────────────────────────────────────────

  recordTrade(pnl) {
    this.dailyPnl += pnl;
    this.tradeCount++;
    if (pnl < 0) this.consecutiveLosses++;
    else this.consecutiveLosses = 0;

    this.updateEquity(this.currentEquity + pnl);
  }

  checkDailyLimit() {
    const dailyLossPct = Math.abs(this.dailyPnl) / this.peakEquity;
    const breached = this.dailyPnl < 0 && dailyLossPct >= this.maxDailyLossPct;
    if (breached) this.killSwitchActive = true;
    return {
      dailyPnl: this.dailyPnl,
      dailyLossPct,
      limitPct: this.maxDailyLossPct,
      breached,
      killSwitch: this.killSwitchActive,
    };
  }

  // ─── Circuit Breakers ──────────────────────────────────────────────────

  checkCircuitBreaker(recentPnl) {
    const rapidLoss = recentPnl / this.currentEquity;
    const triggered = rapidLoss < -this.circuitBreakerThreshold;
    if (triggered) this.killSwitchActive = true;

    const consecutiveBreaker = this.consecutiveLosses >= this.maxConsecutiveLosses;
    if (consecutiveBreaker) this.killSwitchActive = true;

    return {
      rapidLossTrigger: triggered,
      consecutiveLossTrigger: consecutiveBreaker,
      consecutiveLosses: this.consecutiveLosses,
      maxConsecutive: this.maxConsecutiveLosses,
      killSwitch: this.killSwitchActive,
    };
  }

  // ─── Kill Switch ───────────────────────────────────────────────────────

  activateKillSwitch(reason = 'manual') {
    this.killSwitchActive = true;
    return { active: true, reason, timestamp: Date.now() };
  }

  deactivateKillSwitch() {
    this.killSwitchActive = false;
    return { active: false, timestamp: Date.now() };
  }

  // ─── Pre-Trade Risk Check ──────────────────────────────────────────────

  preTradeCheck(order, accountBalance) {
    const checks = [];
    
    if (this.killSwitchActive) {
      checks.push({ pass: false, rule: 'KILL_SWITCH', message: 'Kill switch is active' });
      return { approved: false, checks };
    }

    // Position size check
    const notional = (order.quantity || 0) * (order.price || 0);
    const positionPct = notional / accountBalance;
    checks.push({
      pass: positionPct <= this.maxPositionPct * 2,
      rule: 'POSITION_SIZE',
      message: `Position ${(positionPct * 100).toFixed(2)}% of account (max ${this.maxPositionPct * 200}%)`,
    });

    // Daily limit check
    const dailyCheck = this.checkDailyLimit();
    checks.push({
      pass: !dailyCheck.breached,
      rule: 'DAILY_LIMIT',
      message: `Daily P&L: ${this.dailyPnl.toFixed(2)} (${(dailyCheck.dailyLossPct * 100).toFixed(2)}% used)`,
    });

    // Drawdown check
    const dd = this.getDrawdown();
    checks.push({
      pass: dd < this.maxDrawdownPct,
      rule: 'MAX_DRAWDOWN',
      message: `Drawdown: ${(dd * 100).toFixed(2)}% (max ${this.maxDrawdownPct * 100}%)`,
    });

    const approved = checks.every(c => c.pass);
    return { approved, checks };
  }

  resetDaily() {
    this.dailyPnl = 0;
    this.tradeCount = 0;
    this.consecutiveLosses = 0;
  }
}
