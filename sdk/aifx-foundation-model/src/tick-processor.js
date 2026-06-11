/**
 * TickProcessor — Real-time tick data ingestion and micro-structure analysis.
 *
 * Processes raw tick-by-tick market data from any exchange, computing
 * micro-structure metrics: VWAP, spread dynamics, volatility clustering,
 * trade intensity, and momentum indicators.
 *
 * @module @medina/aifx-foundation-model/tick-processor
 */

export class TickProcessor {
  /**
   * @param {object} [config={}]
   * @param {number} [config.windowSize=1000] — rolling window size for statistics
   * @param {number} [config.volatilityLookback=100] — lookback for volatility calculation
   */
  constructor(config = {}) {
    this.windowSize = config.windowSize ?? 1000;
    this.volatilityLookback = config.volatilityLookback ?? 100;
    /** @type {Array<{price: number, volume: number, timestamp: number, side?: string}>} */
    this.buffer = [];
    this.stats = null;
  }

  /**
   * Ingest a single tick.
   * @param {{price: number, volume?: number, timestamp?: number, side?: string}} tick
   */
  ingest(tick) {
    this.buffer.push({
      price: tick.price,
      volume: tick.volume ?? 0,
      timestamp: tick.timestamp ?? Date.now(),
      side: tick.side ?? 'unknown',
    });
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }
  }

  /**
   * Ingest multiple ticks at once.
   * @param {Array} ticks
   */
  ingestBatch(ticks) {
    for (const tick of ticks) {
      this.ingest(tick);
    }
  }

  /**
   * Compute current statistics from the tick buffer.
   * @returns {object} computed stats
   */
  compute() {
    if (this.buffer.length === 0) {
      return { empty: true, tickCount: 0 };
    }

    const prices = this.buffer.map(t => t.price);
    const volumes = this.buffer.map(t => t.volume);
    const n = prices.length;

    // Basic statistics
    const last = prices[n - 1];
    const first = prices[0];
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const mean = prices.reduce((a, b) => a + b, 0) / n;
    const totalVolume = volumes.reduce((a, b) => a + b, 0);

    // VWAP
    const vwap = totalVolume > 0
      ? prices.reduce((sum, p, i) => sum + p * volumes[i], 0) / totalVolume
      : mean;

    // Variance & Standard Deviation
    const variance = prices.reduce((a, p) => a + (p - mean) ** 2, 0) / n;
    const stddev = Math.sqrt(variance);

    // Returns for volatility
    const returns = [];
    for (let i = 1; i < n; i++) {
      if (prices[i - 1] !== 0) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      }
    }
    const volatility = returns.length > 0
      ? Math.sqrt(returns.reduce((a, r) => a + r ** 2, 0) / returns.length)
      : 0;

    // Trade intensity (ticks per second)
    const timeSpan = this.buffer[n - 1].timestamp - this.buffer[0].timestamp;
    const tradeIntensity = timeSpan > 0 ? (n / (timeSpan / 1000)) : 0;

    // Buy/sell pressure
    const buyTicks = this.buffer.filter(t => t.side === 'buy');
    const sellTicks = this.buffer.filter(t => t.side === 'sell');
    const buyVolume = buyTicks.reduce((s, t) => s + t.volume, 0);
    const sellVolume = sellTicks.reduce((s, t) => s + t.volume, 0);

    // Momentum (rate of change)
    const roc = first !== 0 ? (last - first) / first : 0;
    const direction = roc > 0.001 ? 'bullish' : roc < -0.001 ? 'bearish' : 'neutral';

    this.stats = {
      tickCount: n,
      last: +last.toFixed(6),
      high: +high.toFixed(6),
      low: +low.toFixed(6),
      mean: +mean.toFixed(6),
      vwap: +vwap.toFixed(6),
      stddev: +stddev.toFixed(6),
      volatility: +volatility.toFixed(8),
      totalVolume,
      buyVolume,
      sellVolume,
      tradeIntensity: +tradeIntensity.toFixed(2),
      roc: +roc.toFixed(6),
      direction,
      timestamp: Date.now(),
    };

    return this.stats;
  }

  /**
   * Reset the tick buffer.
   */
  reset() {
    this.buffer = [];
    this.stats = null;
  }

  /**
   * Get current buffer size.
   * @returns {number}
   */
  get size() {
    return this.buffer.length;
  }
}
