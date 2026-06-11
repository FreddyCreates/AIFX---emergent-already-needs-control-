/**
 * MarketAnalysisEngine — High-level market analysis combining tick data,
 * chart patterns, order flow, and multi-timeframe confluence into
 * unified market intelligence signals.
 *
 * @module @medina/aifx-foundation-model/market-analysis-engine
 */

import { TIMEFRAMES, ASSET_CLASSES } from './constants.js';

export class MarketAnalysisEngine {
  constructor(config = {}) {
    this.defaultTimeframes = config.timeframes ?? [TIMEFRAMES.M5, TIMEFRAMES.M15, TIMEFRAMES.H1, TIMEFRAMES.H4, TIMEFRAMES.D1];
    this.signalThreshold = config.signalThreshold ?? 0.6;
    this.riskMultiplier = config.riskMultiplier ?? 1.5;
    this.signals = [];
  }

  /**
   * Generate a market signal from multi-source analysis.
   * @param {object} params
   * @param {object} params.tickAnalysis — output from TickProcessor
   * @param {object} params.chartPattern — output from ChartPatternRecognizer
   * @param {object} params.orderFlow — output from OrderFlowAnalyzer
   * @param {object} [params.multiTimeframe] — output from multi-timeframe analysis
   * @returns {object} unified signal
   */
  generateSignal({ tickAnalysis, chartPattern, orderFlow, multiTimeframe }) {
    const factors = [];
    let score = 0;

    // Tick momentum contribution
    if (tickAnalysis) {
      const tickScore = tickAnalysis.direction === 'bullish' ? 1
        : tickAnalysis.direction === 'bearish' ? -1 : 0;
      factors.push({ source: 'tick-momentum', score: tickScore, weight: 0.2 });
      score += tickScore * 0.2;
    }

    // Chart pattern contribution
    if (chartPattern && chartPattern.patternsDetected?.length > 0) {
      const patternBias = chartPattern.trend === 'uptrend' ? 1
        : chartPattern.trend === 'downtrend' ? -1 : 0;
      const confidence = Math.max(...chartPattern.patternsDetected.map(p => p.confidence));
      factors.push({ source: 'chart-pattern', score: patternBias * confidence, weight: 0.3 });
      score += patternBias * confidence * 0.3;
    }

    // Order flow contribution
    if (orderFlow) {
      const flowScore = orderFlow.pressure === 'buy-pressure' ? 1
        : orderFlow.pressure === 'sell-pressure' ? -1 : 0;
      factors.push({ source: 'order-flow', score: flowScore * Math.abs(orderFlow.imbalance), weight: 0.3 });
      score += flowScore * Math.abs(orderFlow.imbalance) * 0.3;
    }

    // Multi-timeframe confluence contribution
    if (multiTimeframe) {
      const mtfScore = multiTimeframe.confluence === 'strong-bullish' ? 1
        : multiTimeframe.confluence === 'strong-bearish' ? -1
        : multiTimeframe.confluence === 'lean-bullish' ? 0.5
        : multiTimeframe.confluence === 'lean-bearish' ? -0.5 : 0;
      factors.push({ source: 'multi-timeframe', score: mtfScore, weight: 0.2 });
      score += mtfScore * 0.2;
    }

    const direction = score > this.signalThreshold ? 'long'
      : score < -this.signalThreshold ? 'short' : 'neutral';

    const signal = {
      direction,
      strength: +Math.abs(score).toFixed(4),
      confidence: +Math.min(Math.abs(score) / 1.0, 1.0).toFixed(4),
      factors,
      compositeScore: +score.toFixed(4),
      timestamp: Date.now(),
    };

    this.signals.push(signal);
    return signal;
  }

  /**
   * Get recent signals.
   * @param {number} [limit=10]
   * @returns {object[]}
   */
  getRecentSignals(limit = 10) {
    return this.signals.slice(-limit);
  }

  /**
   * Reset signal history.
   */
  reset() {
    this.signals = [];
  }
}
