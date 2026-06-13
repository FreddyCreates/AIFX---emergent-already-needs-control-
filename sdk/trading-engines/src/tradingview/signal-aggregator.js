/**
 * Signal Aggregator
 * Multi-timeframe confluence scoring
 */

export class SignalAggregator {
  constructor(config = {}) {
    this.timeframes = config.timeframes || ['1m', '5m', '15m', '1h', '4h', '1d'];
    this.weights = config.weights || { '1m': 0.05, '5m': 0.1, '15m': 0.15, '1h': 0.25, '4h': 0.25, '1d': 0.2 };
    this.confluenceThreshold = config.confluenceThreshold || 0.6;
    this.signals = new Map(); // symbol -> timeframe -> signal[]
    this.maxSignalAge = config.maxSignalAge || 60000 * 60; // 1 hour
  }

  addSignal(signal) {
    const { symbol, timeframe, action, strength = 1 } = signal;
    if (!symbol || !timeframe) return null;

    if (!this.signals.has(symbol)) this.signals.set(symbol, new Map());
    const symSignals = this.signals.get(symbol);
    if (!symSignals.has(timeframe)) symSignals.set(timeframe, []);

    const entry = {
      action: action.toUpperCase(),
      strength: Math.min(1, Math.max(-1, strength)),
      timestamp: Date.now(),
      ...signal,
    };
    symSignals.get(timeframe).push(entry);
    this._pruneOldSignals(symbol);
    return entry;
  }

  getConfluenceScore(symbol) {
    if (!this.signals.has(symbol)) return { score: 0, direction: 'NEUTRAL', signals: {} };

    const symSignals = this.signals.get(symbol);
    let bullScore = 0, bearScore = 0;
    const breakdown = {};

    for (const [tf, signals] of symSignals) {
      if (signals.length === 0) continue;
      const latest = signals[signals.length - 1];
      const weight = this.weights[tf] || 0.1;
      const direction = latest.action === 'BUY' || latest.action === 'LONG' ? 1 : 
                        latest.action === 'SELL' || latest.action === 'SHORT' ? -1 : 0;
      const weighted = direction * latest.strength * weight;
      if (weighted > 0) bullScore += weighted;
      else bearScore += Math.abs(weighted);
      breakdown[tf] = { direction: latest.action, strength: latest.strength, weighted };
    }

    const totalWeight = Object.values(this.weights).reduce((s, w) => s + w, 0);
    const netScore = (bullScore - bearScore) / totalWeight;
    const absScore = Math.abs(netScore);
    const direction = netScore > 0.1 ? 'BULLISH' : netScore < -0.1 ? 'BEARISH' : 'NEUTRAL';

    return {
      score: netScore,
      absScore,
      direction,
      confluent: absScore >= this.confluenceThreshold,
      bullScore: bullScore / totalWeight,
      bearScore: bearScore / totalWeight,
      timeframesAligned: Object.keys(breakdown).length,
      totalTimeframes: this.timeframes.length,
      breakdown,
    };
  }

  getTradeSignal(symbol) {
    const confluence = this.getConfluenceScore(symbol);
    if (!confluence.confluent) {
      return { action: 'HOLD', confluence, reason: 'Insufficient confluence' };
    }
    return {
      action: confluence.direction === 'BULLISH' ? 'BUY' : 'SELL',
      confluence,
      reason: `${confluence.timeframesAligned}/${confluence.totalTimeframes} timeframes aligned ${confluence.direction}`,
    };
  }

  _pruneOldSignals(symbol) {
    const now = Date.now();
    const symSignals = this.signals.get(symbol);
    for (const [tf, signals] of symSignals) {
      const pruned = signals.filter(s => now - s.timestamp < this.maxSignalAge);
      symSignals.set(tf, pruned);
    }
  }

  reset(symbol) {
    if (symbol) this.signals.delete(symbol);
    else this.signals.clear();
  }
}
