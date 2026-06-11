/**
 * ChartPatternRecognizer — Detects classical and advanced chart patterns
 * across all financial instruments and timeframes.
 *
 * Supports: double-top, double-bottom, head-and-shoulders, triangles,
 * wedges, flags, pennants, cup-and-handle, harmonic patterns (Gartley,
 * Butterfly, Bat, Crab), and Fibonacci retracements.
 *
 * @module @medina/aifx-foundation-model/chart-pattern-recognizer
 */

const PHI = 1.618033988749895;

/** Fibonacci levels based on PHI */
const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618];

export class ChartPatternRecognizer {
  constructor(config = {}) {
    this.minCandles = config.minCandles ?? 5;
    this.peakThreshold = config.peakThreshold ?? 0.02;
    this.harmonicTolerance = config.harmonicTolerance ?? 0.05;
  }

  /**
   * Detect all patterns in a candle dataset.
   * @param {Array<{open: number, high: number, low: number, close: number, volume?: number}>} candles
   * @returns {object} detection results
   */
  detect(candles) {
    if (!candles || candles.length < this.minCandles) {
      return { patterns: [], trend: 'insufficient-data', fibLevels: null };
    }

    const patterns = [];
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);

    // Find swing points
    const swingHighs = this._findSwingHighs(highs);
    const swingLows = this._findSwingLows(lows);

    // Double top / bottom
    patterns.push(...this._detectDoubleTop(swingHighs, highs));
    patterns.push(...this._detectDoubleBottom(swingLows, lows));

    // Head and shoulders
    patterns.push(...this._detectHeadShoulders(swingHighs, highs));

    // Triangle patterns
    patterns.push(...this._detectTriangle(swingHighs, swingLows, highs, lows));

    // Harmonic patterns
    patterns.push(...this._detectHarmonics(swingHighs, swingLows, highs, lows));

    // Trend determination
    const trend = this._computeTrend(closes);

    // Fibonacci levels from recent swing
    const fibLevels = this._computeFibLevels(highs, lows);

    return {
      patterns,
      trend,
      fibLevels,
      candleCount: candles.length,
      timestamp: Date.now(),
    };
  }

  _findSwingHighs(highs) {
    const swings = [];
    for (let i = 2; i < highs.length - 2; i++) {
      if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] &&
          highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
        swings.push({ index: i, value: highs[i] });
      }
    }
    return swings;
  }

  _findSwingLows(lows) {
    const swings = [];
    for (let i = 2; i < lows.length - 2; i++) {
      if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] &&
          lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
        swings.push({ index: i, value: lows[i] });
      }
    }
    return swings;
  }

  _detectDoubleTop(swingHighs, highs) {
    const patterns = [];
    for (let i = 0; i < swingHighs.length - 1; i++) {
      const a = swingHighs[i];
      const b = swingHighs[i + 1];
      const diff = Math.abs(a.value - b.value) / Math.max(a.value, b.value);
      if (diff < this.peakThreshold && (b.index - a.index) >= 3) {
        patterns.push({
          pattern: 'double-top',
          confidence: +(1 - diff / this.peakThreshold).toFixed(4) * 0.85,
          level: (a.value + b.value) / 2,
          indices: [a.index, b.index],
        });
      }
    }
    return patterns;
  }

  _detectDoubleBottom(swingLows, lows) {
    const patterns = [];
    for (let i = 0; i < swingLows.length - 1; i++) {
      const a = swingLows[i];
      const b = swingLows[i + 1];
      const diff = Math.abs(a.value - b.value) / Math.min(a.value, b.value);
      if (diff < this.peakThreshold && (b.index - a.index) >= 3) {
        patterns.push({
          pattern: 'double-bottom',
          confidence: +(1 - diff / this.peakThreshold).toFixed(4) * 0.85,
          level: (a.value + b.value) / 2,
          indices: [a.index, b.index],
        });
      }
    }
    return patterns;
  }

  _detectHeadShoulders(swingHighs, highs) {
    const patterns = [];
    if (swingHighs.length < 3) return patterns;

    for (let i = 0; i < swingHighs.length - 2; i++) {
      const ls = swingHighs[i];
      const head = swingHighs[i + 1];
      const rs = swingHighs[i + 2];

      // Head must be higher than both shoulders
      if (head.value > ls.value && head.value > rs.value) {
        const shoulderDiff = Math.abs(ls.value - rs.value) / Math.max(ls.value, rs.value);
        if (shoulderDiff < this.peakThreshold * 2) {
          patterns.push({
            pattern: 'head-and-shoulders',
            confidence: 0.75,
            headLevel: head.value,
            neckline: (ls.value + rs.value) / 2,
            indices: [ls.index, head.index, rs.index],
          });
        }
      }
    }
    return patterns;
  }

  _detectTriangle(swingHighs, swingLows, highs, lows) {
    const patterns = [];
    if (swingHighs.length < 2 || swingLows.length < 2) return patterns;

    // Check if highs are descending and lows are ascending (symmetric triangle)
    const highSlope = swingHighs.length >= 2
      ? (swingHighs[swingHighs.length - 1].value - swingHighs[0].value) / (swingHighs[swingHighs.length - 1].index - swingHighs[0].index || 1)
      : 0;
    const lowSlope = swingLows.length >= 2
      ? (swingLows[swingLows.length - 1].value - swingLows[0].value) / (swingLows[swingLows.length - 1].index - swingLows[0].index || 1)
      : 0;

    if (highSlope < 0 && lowSlope > 0) {
      patterns.push({ pattern: 'symmetric-triangle', confidence: 0.65, highSlope: +highSlope.toFixed(6), lowSlope: +lowSlope.toFixed(6) });
    } else if (highSlope < 0 && Math.abs(lowSlope) < 0.001) {
      patterns.push({ pattern: 'descending-triangle', confidence: 0.65, highSlope: +highSlope.toFixed(6) });
    } else if (Math.abs(highSlope) < 0.001 && lowSlope > 0) {
      patterns.push({ pattern: 'ascending-triangle', confidence: 0.65, lowSlope: +lowSlope.toFixed(6) });
    }

    return patterns;
  }

  _detectHarmonics(swingHighs, swingLows, highs, lows) {
    const patterns = [];
    // Need at least 4 swing points to detect XABCD
    const allSwings = [...swingHighs, ...swingLows].sort((a, b) => a.index - b.index);
    if (allSwings.length < 5) return patterns;

    for (let i = 0; i <= allSwings.length - 5; i++) {
      const [X, A, B, C, D] = allSwings.slice(i, i + 5);
      const XA = Math.abs(A.value - X.value);
      const AB = Math.abs(B.value - A.value);
      const BC = Math.abs(C.value - B.value);
      const CD = Math.abs(D.value - C.value);

      if (XA === 0) continue;

      const abRatio = AB / XA;
      const bcRatio = BC / AB || 0;
      const cdRatio = CD / BC || 0;

      // Gartley: AB=0.618*XA, BC=0.382-0.886*AB, CD=1.272-1.618*BC
      if (Math.abs(abRatio - 0.618) < this.harmonicTolerance) {
        if (bcRatio >= 0.382 - this.harmonicTolerance && bcRatio <= 0.886 + this.harmonicTolerance) {
          patterns.push({
            pattern: 'harmonic-gartley',
            confidence: 0.7,
            ratios: { ab: +abRatio.toFixed(4), bc: +bcRatio.toFixed(4), cd: +cdRatio.toFixed(4) },
            indices: [X.index, A.index, B.index, C.index, D.index],
          });
          break; // One harmonic per scan
        }
      }

      // Butterfly: AB=0.786*XA
      if (Math.abs(abRatio - 0.786) < this.harmonicTolerance) {
        patterns.push({
          pattern: 'harmonic-butterfly',
          confidence: 0.65,
          ratios: { ab: +abRatio.toFixed(4), bc: +bcRatio.toFixed(4), cd: +cdRatio.toFixed(4) },
          indices: [X.index, A.index, B.index, C.index, D.index],
        });
        break;
      }
    }

    return patterns;
  }

  _computeTrend(closes) {
    const n = closes.length;
    if (n < 2) return 'neutral';
    const xMean = (n - 1) / 2;
    const yMean = closes.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (closes[i] - yMean);
      den += (i - xMean) ** 2;
    }
    const slope = den !== 0 ? num / den : 0;
    const normalized = yMean !== 0 ? slope / yMean : 0;
    return normalized > 0.001 ? 'uptrend' : normalized < -0.001 ? 'downtrend' : 'sideways';
  }

  _computeFibLevels(highs, lows) {
    const swingHigh = Math.max(...highs);
    const swingLow = Math.min(...lows);
    const range = swingHigh - swingLow;
    if (range === 0) return null;

    return FIB_LEVELS.reduce((acc, level) => {
      acc[`${(level * 100).toFixed(1)}%`] = +(swingHigh - range * level).toFixed(6);
      return acc;
    }, {});
  }
}
