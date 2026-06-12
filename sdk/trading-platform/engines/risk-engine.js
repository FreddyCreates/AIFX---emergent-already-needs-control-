/**
 * DEEP RISK ENGINE
 *
 * Real-time risk management:
 * - Position sizing (Kelly, fractional Kelly, fixed fractional)
 * - Value-at-Risk (VaR) calculation
 * - Maximum drawdown monitoring
 * - Correlation-based portfolio risk
 * - Dynamic stop-loss computation
 * - Kill switches & circuit breakers
 * - Exposure limits per asset/sector/account
 */

const POSITION_SIZING = {
  KELLY: 'kelly',
  HALF_KELLY: 'half_kelly',
  FIXED_FRACTIONAL: 'fixed_fractional',
  FIXED_RATIO: 'fixed_ratio',
  VOLATILITY_SCALED: 'volatility_scaled',
};

const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

class DeepRiskEngine {
  constructor({
    maxDrawdownPct = 0.2,
    maxPositionPct = 0.05,
    maxCorrelation = 0.7,
    maxDailyLossPct = 0.03,
    kellyFraction = 0.5,
  } = {}) {
    this.maxDrawdownPct = maxDrawdownPct;
    this.maxPositionPct = maxPositionPct;
    this.maxCorrelation = maxCorrelation;
    this.maxDailyLossPct = maxDailyLossPct;
    this.kellyFraction = kellyFraction;

    this.positions = new Map();
    this.equity = 100000;
    this.peakEquity = 100000;
    this.dailyPnL = 0;
    this.killSwitch = false;
    this.circuitBreakers = new Map();
    this.limits = new Map();
    this.incidents = [];
  }

  evaluateOrder(order, signal) {
    if (this.killSwitch) {
      return { allowed: false, reason: 'kill_switch_active' };
    }

    const breaker = this.circuitBreakers.get(order.symbol);
    if (breaker && breaker.state === 'open') {
      return { allowed: false, reason: 'circuit_breaker_open', symbol: order.symbol };
    }

    const drawdown = this._currentDrawdown();
    if (drawdown >= this.maxDrawdownPct) {
      return { allowed: false, reason: 'max_drawdown_exceeded', drawdown };
    }

    const dailyLoss = Math.abs(Math.min(this.dailyPnL, 0)) / this.equity;
    if (dailyLoss >= this.maxDailyLossPct) {
      return { allowed: false, reason: 'daily_loss_limit', dailyLoss };
    }

    const positionSize = this._computePositionSize(order, signal);
    const exposure = this._computeExposure(order.symbol, positionSize.quantity, order.referencePrice || 100);

    if (exposure > this.maxPositionPct) {
      return { allowed: false, reason: 'position_limit_exceeded', exposure };
    }

    const limits = this.limits.get(order.symbol);
    if (limits) {
      const notional = positionSize.quantity * (order.referencePrice || 100);
      if (notional > limits.maxNotional) {
        return { allowed: false, reason: 'notional_limit_exceeded', notional, limit: limits.maxNotional };
      }
    }

    return {
      allowed: true,
      positionSize,
      stopLoss: this._computeStopLoss(order, signal),
      takeProfit: this._computeTakeProfit(order, signal),
      riskLevel: this._assessRiskLevel(),
      drawdown,
    };
  }

  computeVaR(confidence = 0.95, horizon = 1) {
    const positions = [...this.positions.values()];
    if (positions.length === 0) return 0;

    const portfolioValue = positions.reduce((s, p) => s + Math.abs(p.notional), 0);
    const avgVolatility = positions.reduce((s, p) => s + (p.volatility || 0.02), 0) / positions.length;

    // Parametric VaR
    const zScore = confidence === 0.99 ? 2.326 : confidence === 0.95 ? 1.645 : 1.282;
    const var_ = portfolioValue * avgVolatility * zScore * Math.sqrt(horizon);

    return { var: var_, confidence, horizon, portfolioValue, avgVolatility };
  }

  updatePosition(symbol, quantity, price, volatility = 0.02) {
    const existing = this.positions.get(symbol) || { symbol, quantity: 0, avgPrice: 0, notional: 0, volatility };
    existing.quantity += quantity;
    existing.avgPrice = price;
    existing.notional = Math.abs(existing.quantity * price);
    existing.volatility = volatility;
    existing.updatedAt = Date.now();

    if (existing.quantity === 0) {
      this.positions.delete(symbol);
    } else {
      this.positions.set(symbol, existing);
    }
  }

  updateEquity(newEquity) {
    const pnl = newEquity - this.equity;
    this.dailyPnL += pnl;
    this.equity = newEquity;
    if (newEquity > this.peakEquity) this.peakEquity = newEquity;
  }

  setKillSwitch(enabled) {
    this.killSwitch = enabled;
    if (enabled) this.incidents.push({ type: 'kill_switch', timestamp: Date.now() });
    return { killSwitch: this.killSwitch };
  }

  setCircuitBreaker(symbol, { threshold = 0.05, cooldownMs = 300000 } = {}) {
    this.circuitBreakers.set(symbol, { state: 'closed', threshold, cooldownMs, openedAt: null });
  }

  tripCircuitBreaker(symbol) {
    const breaker = this.circuitBreakers.get(symbol);
    if (breaker) {
      breaker.state = 'open';
      breaker.openedAt = Date.now();
      this.incidents.push({ type: 'circuit_breaker', symbol, timestamp: Date.now() });
    }
  }

  setLimit(symbol, limits) {
    this.limits.set(symbol, { maxNotional: 100000, maxQuantity: 1000, ...limits });
  }

  resetDailyPnL() {
    this.dailyPnL = 0;
  }

  _currentDrawdown() {
    return this.peakEquity > 0 ? (this.peakEquity - this.equity) / this.peakEquity : 0;
  }

  _computePositionSize(order, signal) {
    const confidence = signal?.confidence || 0.5;
    const winRate = signal?.winRate || 0.55;
    const payoff = signal?.payoff || 1.5;

    // Kelly Criterion
    const kelly = (winRate * payoff - (1 - winRate)) / payoff;
    const adjustedKelly = Math.max(kelly * this.kellyFraction, 0);

    const riskCapital = this.equity * Math.min(adjustedKelly, this.maxPositionPct);
    const price = order.referencePrice || 100;
    const quantity = riskCapital / price;

    return {
      method: POSITION_SIZING.HALF_KELLY,
      kelly,
      adjustedKelly,
      riskCapital,
      quantity,
      confidence,
    };
  }

  _computeStopLoss(order, signal) {
    const price = order.referencePrice || 100;
    const atr = signal?.atr || price * 0.01;
    const multiplier = 2;
    const stopDistance = atr * multiplier;

    return {
      price: order.side === 'buy' ? price - stopDistance : price + stopDistance,
      distance: stopDistance,
      distancePct: stopDistance / price,
      method: 'atr_based',
    };
  }

  _computeTakeProfit(order, signal) {
    const price = order.referencePrice || 100;
    const atr = signal?.atr || price * 0.01;
    const riskReward = 2.5;
    const tpDistance = atr * 2 * riskReward;

    return {
      price: order.side === 'buy' ? price + tpDistance : price - tpDistance,
      distance: tpDistance,
      distancePct: tpDistance / price,
      riskReward,
      method: 'risk_reward',
    };
  }

  _assessRiskLevel() {
    const dd = this._currentDrawdown();
    if (dd >= this.maxDrawdownPct * 0.8) return RISK_LEVELS.CRITICAL;
    if (dd >= this.maxDrawdownPct * 0.5) return RISK_LEVELS.HIGH;
    if (dd >= this.maxDrawdownPct * 0.25) return RISK_LEVELS.MEDIUM;
    return RISK_LEVELS.LOW;
  }

  _computeExposure(symbol, quantity, price) {
    const notional = Math.abs(quantity * price);
    return notional / this.equity;
  }

  getSnapshot() {
    return {
      equity: this.equity,
      peakEquity: this.peakEquity,
      drawdown: this._currentDrawdown(),
      dailyPnL: this.dailyPnL,
      killSwitch: this.killSwitch,
      riskLevel: this._assessRiskLevel(),
      openPositions: this.positions.size,
      var95: this.computeVaR(0.95),
      incidents: this.incidents.length,
    };
  }
}

export { DeepRiskEngine, POSITION_SIZING, RISK_LEVELS };
export default DeepRiskEngine;
