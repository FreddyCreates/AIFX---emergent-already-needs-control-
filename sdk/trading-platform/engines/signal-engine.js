/**
 * DEEP SIGNAL ENGINE
 *
 * AI-powered signal generation combining:
 * - Multi-timeframe technical analysis
 * - Order flow imbalance detection
 * - Volatility regime classification
 * - Momentum & mean-reversion signals
 * - Cross-asset correlation signals
 * - Sentiment integration
 * - TradingView alert fusion
 */

const PHI = 1.618033988749895;

const SIGNAL_TYPES = {
  MOMENTUM: 'momentum',
  MEAN_REVERSION: 'mean_reversion',
  BREAKOUT: 'breakout',
  ORDER_FLOW: 'order_flow',
  VOLATILITY: 'volatility',
  CORRELATION: 'correlation',
  SENTIMENT: 'sentiment',
  COMPOSITE: 'composite',
};

const REGIMES = {
  TRENDING_UP: 'trending_up',
  TRENDING_DOWN: 'trending_down',
  RANGING: 'ranging',
  HIGH_VOLATILITY: 'high_volatility',
  LOW_VOLATILITY: 'low_volatility',
  BREAKOUT: 'breakout',
};

class DeepSignalEngine {
  constructor({ lookback = 200, confidenceThreshold = 0.6, maxSignals = 100 } = {}) {
    this.lookback = lookback;
    this.confidenceThreshold = confidenceThreshold;
    this.maxSignals = maxSignals;
    this.priceHistory = new Map();
    this.signals = [];
    this.regime = new Map();
    this.indicators = new Map();
  }

  ingestPrice({ symbol, open, high, low, close, volume, timestamp }) {
    if (!this.priceHistory.has(symbol)) this.priceHistory.set(symbol, []);
    const history = this.priceHistory.get(symbol);
    history.push({ open, high, low, close, volume, timestamp });
    if (history.length > this.lookback * 2) history.shift();

    this._updateIndicators(symbol);
    this._classifyRegime(symbol);
  }

  generateSignals(symbol) {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 50) return [];

    const generated = [];

    const momentum = this._momentumSignal(symbol);
    if (momentum) generated.push(momentum);

    const meanRev = this._meanReversionSignal(symbol);
    if (meanRev) generated.push(meanRev);

    const breakout = this._breakoutSignal(symbol);
    if (breakout) generated.push(breakout);

    const orderFlow = this._orderFlowSignal(symbol);
    if (orderFlow) generated.push(orderFlow);

    const volatility = this._volatilitySignal(symbol);
    if (volatility) generated.push(volatility);

    const eligible = generated.filter(s => s.confidence >= this.confidenceThreshold);

    for (const sig of eligible) {
      this.signals.push(sig);
    }
    if (this.signals.length > this.maxSignals) {
      this.signals = this.signals.slice(-this.maxSignals);
    }

    return eligible;
  }

  generateCompositeSignal(symbol) {
    const raw = this.generateSignals(symbol);
    if (raw.length === 0) return null;

    const bullish = raw.filter(s => s.direction === 'long');
    const bearish = raw.filter(s => s.direction === 'short');

    const bullScore = bullish.reduce((sum, s) => sum + s.confidence * s.weight, 0);
    const bearScore = bearish.reduce((sum, s) => sum + s.confidence * s.weight, 0);

    const netScore = bullScore - bearScore;
    const direction = netScore > 0 ? 'long' : netScore < 0 ? 'short' : 'neutral';
    const confidence = Math.min(Math.abs(netScore) / PHI, 1);

    return {
      type: SIGNAL_TYPES.COMPOSITE,
      symbol,
      direction,
      confidence,
      bullScore,
      bearScore,
      netScore,
      components: raw.length,
      regime: this.regime.get(symbol) || REGIMES.RANGING,
      timestamp: Date.now(),
    };
  }

  _momentumSignal(symbol) {
    const history = this.priceHistory.get(symbol);
    const recent = history.slice(-20);
    const older = history.slice(-50, -20);

    const recentAvg = recent.reduce((s, b) => s + b.close, 0) / recent.length;
    const olderAvg = older.reduce((s, b) => s + b.close, 0) / older.length;

    const momentum = (recentAvg - olderAvg) / olderAvg;
    const direction = momentum > 0.005 ? 'long' : momentum < -0.005 ? 'short' : null;

    if (!direction) return null;

    return {
      type: SIGNAL_TYPES.MOMENTUM,
      symbol,
      direction,
      confidence: Math.min(Math.abs(momentum) * 20, 1),
      weight: 1.0,
      metadata: { momentum, recentAvg, olderAvg },
      timestamp: Date.now(),
    };
  }

  _meanReversionSignal(symbol) {
    const history = this.priceHistory.get(symbol);
    const closes = history.slice(-this.lookback).map(b => b.close);
    const mean = closes.reduce((s, c) => s + c, 0) / closes.length;
    const stdDev = Math.sqrt(closes.reduce((s, c) => s + (c - mean) ** 2, 0) / closes.length);

    const current = closes[closes.length - 1];
    const zScore = (current - mean) / (stdDev || 1);

    const direction = zScore > 2 ? 'short' : zScore < -2 ? 'long' : null;
    if (!direction) return null;

    return {
      type: SIGNAL_TYPES.MEAN_REVERSION,
      symbol,
      direction,
      confidence: Math.min(Math.abs(zScore) / 4, 1),
      weight: 0.8,
      metadata: { zScore, mean, stdDev, current },
      timestamp: Date.now(),
    };
  }

  _breakoutSignal(symbol) {
    const history = this.priceHistory.get(symbol);
    const recent = history.slice(-50);

    const highs = recent.map(b => b.high);
    const lows = recent.map(b => b.low);
    const resistance = Math.max(...highs.slice(0, -5));
    const support = Math.min(...lows.slice(0, -5));
    const current = recent[recent.length - 1].close;

    if (current > resistance) {
      return {
        type: SIGNAL_TYPES.BREAKOUT,
        symbol,
        direction: 'long',
        confidence: 0.7,
        weight: 1.2,
        metadata: { resistance, support, current, breakType: 'resistance' },
        timestamp: Date.now(),
      };
    }

    if (current < support) {
      return {
        type: SIGNAL_TYPES.BREAKOUT,
        symbol,
        direction: 'short',
        confidence: 0.7,
        weight: 1.2,
        metadata: { resistance, support, current, breakType: 'support' },
        timestamp: Date.now(),
      };
    }

    return null;
  }

  _orderFlowSignal(symbol) {
    const history = this.priceHistory.get(symbol);
    const recent = history.slice(-10);

    const buyVolume = recent
      .filter(b => b.close > b.open)
      .reduce((s, b) => s + b.volume, 0);
    const sellVolume = recent
      .filter(b => b.close <= b.open)
      .reduce((s, b) => s + b.volume, 0);

    const totalVolume = buyVolume + sellVolume;
    if (totalVolume === 0) return null;

    const imbalance = (buyVolume - sellVolume) / totalVolume;
    const direction = imbalance > 0.3 ? 'long' : imbalance < -0.3 ? 'short' : null;

    if (!direction) return null;

    return {
      type: SIGNAL_TYPES.ORDER_FLOW,
      symbol,
      direction,
      confidence: Math.min(Math.abs(imbalance), 1),
      weight: 0.9,
      metadata: { buyVolume, sellVolume, imbalance },
      timestamp: Date.now(),
    };
  }

  _volatilitySignal(symbol) {
    const history = this.priceHistory.get(symbol);
    const recent = history.slice(-20);
    const returns = [];
    for (let i = 1; i < recent.length; i++) {
      returns.push(Math.log(recent[i].close / recent[i - 1].close));
    }

    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
    const volatility = Math.sqrt(variance * 252);

    const regime = this.regime.get(symbol);

    if (volatility > 0.5 && regime === REGIMES.HIGH_VOLATILITY) {
      return {
        type: SIGNAL_TYPES.VOLATILITY,
        symbol,
        direction: 'short',
        confidence: 0.55,
        weight: 0.6,
        metadata: { volatility, regime },
        timestamp: Date.now(),
      };
    }

    return null;
  }

  _updateIndicators(symbol) {
    const history = this.priceHistory.get(symbol);
    if (history.length < 26) return;

    const closes = history.map(b => b.close);
    const ema12 = this._ema(closes, 12);
    const ema26 = this._ema(closes, 26);
    const macd = ema12 - ema26;
    const rsi = this._rsi(closes, 14);
    const atr = this._atr(history.slice(-14));

    this.indicators.set(symbol, { ema12, ema26, macd, rsi, atr, timestamp: Date.now() });
  }

  _classifyRegime(symbol) {
    const indicators = this.indicators.get(symbol);
    if (!indicators) return;

    const history = this.priceHistory.get(symbol);
    const closes = history.slice(-50).map(b => b.close);
    const returns = [];
    for (let i = 1; i < closes.length; i++) returns.push(closes[i] / closes[i - 1] - 1);

    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const vol = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length);

    let regime = REGIMES.RANGING;
    if (vol > 0.03) regime = REGIMES.HIGH_VOLATILITY;
    else if (vol < 0.005) regime = REGIMES.LOW_VOLATILITY;
    else if (mean > 0.002) regime = REGIMES.TRENDING_UP;
    else if (mean < -0.002) regime = REGIMES.TRENDING_DOWN;

    this.regime.set(symbol, regime);
  }

  _ema(data, period) {
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }

  _rsi(closes, period) {
    if (closes.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  _atr(bars) {
    if (bars.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < bars.length; i++) {
      const tr = Math.max(
        bars[i].high - bars[i].low,
        Math.abs(bars[i].high - bars[i - 1].close),
        Math.abs(bars[i].low - bars[i - 1].close)
      );
      sum += tr;
    }
    return sum / (bars.length - 1);
  }

  getIndicators(symbol) { return this.indicators.get(symbol) || null; }
  getRegime(symbol) { return this.regime.get(symbol) || REGIMES.RANGING; }
  getSignalHistory() { return [...this.signals]; }
}

export { DeepSignalEngine, SIGNAL_TYPES, REGIMES };
export default DeepSignalEngine;
