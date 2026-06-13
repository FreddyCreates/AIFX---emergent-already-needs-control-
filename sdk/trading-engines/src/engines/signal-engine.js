/**
 * Signal Engine
 * Momentum, mean-reversion, breakout, order flow, volatility signals
 * + regime classification + composite scoring
 */

export class SignalEngine {
  constructor(config = {}) {
    this.lookback = config.lookback || 20;
    this.momentumWeight = config.momentumWeight || 0.25;
    this.meanRevWeight = config.meanRevWeight || 0.2;
    this.breakoutWeight = config.breakoutWeight || 0.2;
    this.orderFlowWeight = config.orderFlowWeight || 0.15;
    this.volatilityWeight = config.volatilityWeight || 0.2;
    this.regime = 'UNKNOWN';
    this.signalHistory = [];
  }

  // ─── Individual Signal Generators ──────────────────────────────────────
  
  computeMomentum(prices) {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const avgReturn = returns.reduce((s, r) => s + r, 0) / returns.length;
    const recentReturn = returns.slice(-5).reduce((s, r) => s + r, 0) / 5;
    // Positive momentum = bullish, normalized to [-1, 1]
    return Math.max(-1, Math.min(1, recentReturn / (Math.abs(avgReturn) + 0.0001) * 0.5));
  }

  computeMeanReversion(prices) {
    if (prices.length < this.lookback) return 0;
    const window = prices.slice(-this.lookback);
    const mean = window.reduce((s, p) => s + p, 0) / window.length;
    const std = Math.sqrt(window.reduce((s, p) => s + (p - mean) ** 2, 0) / window.length);
    if (std === 0) return 0;
    const zscore = (prices[prices.length - 1] - mean) / std;
    // Far from mean = reversion signal (inverted)
    return Math.max(-1, Math.min(1, -zscore / 3));
  }

  computeBreakout(prices, highs, lows) {
    if (prices.length < this.lookback) return 0;
    const recentHighs = (highs || prices).slice(-this.lookback);
    const recentLows = (lows || prices).slice(-this.lookback);
    const resistance = Math.max(...recentHighs);
    const support = Math.min(...recentLows);
    const current = prices[prices.length - 1];
    const range = resistance - support;
    if (range === 0) return 0;
    const position = (current - support) / range;
    // Near resistance = bullish breakout potential; near support = bearish
    if (position > 0.95) return 0.8;
    if (position < 0.05) return -0.8;
    return (position - 0.5) * 0.4;
  }

  computeOrderFlow(bids, asks) {
    if (!bids || !asks || bids.length === 0 || asks.length === 0) return 0;
    const bidVolume = bids.reduce((s, b) => s + (b.volume || b.size || b[1] || 0), 0);
    const askVolume = asks.reduce((s, a) => s + (a.volume || a.size || a[1] || 0), 0);
    const total = bidVolume + askVolume;
    if (total === 0) return 0;
    const imbalance = (bidVolume - askVolume) / total;
    return Math.max(-1, Math.min(1, imbalance));
  }

  computeVolatility(prices) {
    if (prices.length < 2) return { level: 0, signal: 0 };
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    const vol = Math.sqrt(returns.reduce((s, r) => s + r ** 2, 0) / returns.length) * Math.sqrt(252);
    // Volatility regime-based signal
    const level = vol < 0.1 ? 'LOW' : vol < 0.3 ? 'MEDIUM' : 'HIGH';
    // Low vol favors mean-reversion, high vol favors momentum
    const signal = vol < 0.15 ? -0.3 : vol > 0.4 ? 0.3 : 0;
    return { level, annualized: vol, signal };
  }

  // ─── Regime Classification ─────────────────────────────────────────────

  classifyRegime(prices, volume = []) {
    const vol = this.computeVolatility(prices);
    const momentum = this.computeMomentum(prices);
    const meanRev = this.computeMeanReversion(prices);

    if (vol.annualized > 0.4) {
      this.regime = 'VOLATILE';
    } else if (Math.abs(momentum) > 0.5) {
      this.regime = momentum > 0 ? 'TRENDING_UP' : 'TRENDING_DOWN';
    } else if (Math.abs(meanRev) > 0.5) {
      this.regime = 'MEAN_REVERTING';
    } else {
      this.regime = 'RANGING';
    }

    return {
      regime: this.regime,
      volatility: vol,
      momentum,
      meanReversion: meanRev,
    };
  }

  // ─── Composite Scoring ─────────────────────────────────────────────────

  generateCompositeSignal(data) {
    const { prices, highs, lows, bids, asks } = data;
    
    const momentum = this.computeMomentum(prices);
    const meanReversion = this.computeMeanReversion(prices);
    const breakout = this.computeBreakout(prices, highs, lows);
    const orderFlow = this.computeOrderFlow(bids, asks);
    const volatility = this.computeVolatility(prices);
    const regime = this.classifyRegime(prices);

    // Regime-adaptive weighting
    let mw = this.momentumWeight, mrw = this.meanRevWeight;
    if (this.regime === 'TRENDING_UP' || this.regime === 'TRENDING_DOWN') {
      mw *= 1.5; mrw *= 0.5;
    } else if (this.regime === 'MEAN_REVERTING') {
      mw *= 0.5; mrw *= 1.5;
    }

    const totalWeight = mw + mrw + this.breakoutWeight + this.orderFlowWeight + this.volatilityWeight;
    const composite = (
      momentum * mw +
      meanReversion * mrw +
      breakout * this.breakoutWeight +
      orderFlow * this.orderFlowWeight +
      volatility.signal * this.volatilityWeight
    ) / totalWeight;

    const signal = {
      composite: Math.max(-1, Math.min(1, composite)),
      direction: composite > 0.15 ? 'BUY' : composite < -0.15 ? 'SELL' : 'HOLD',
      confidence: Math.abs(composite),
      regime: regime.regime,
      components: { momentum, meanReversion, breakout, orderFlow, volatilitySignal: volatility.signal },
      volatility: volatility.level,
      timestamp: Date.now(),
    };

    this.signalHistory.push(signal);
    if (this.signalHistory.length > 1000) this.signalHistory.shift();
    return signal;
  }
}
