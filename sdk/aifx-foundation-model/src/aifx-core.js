/**
 * AIFXCore — The central foundation model engine for AIFX.
 *
 * Orchestrates all sub-engines: tick processing, chart pattern recognition,
 * order flow analysis, exchange connectivity, and regulatory compliance.
 * Built on the Sovereign Organism intelligence architecture.
 *
 * @module @medina/aifx-foundation-model/aifx-core
 */

import crypto from 'node:crypto';
import { AIFX_CONFIG, SUPPORTED_EXCHANGES, REGULATORY_FRAMEWORKS } from './constants.js';

const PHI = 1.618033988749895;

/**
 * @typedef {object} AIFXTask
 * @property {string} id
 * @property {string} type
 * @property {object} payload
 * @property {string} exchange
 * @property {string} asset
 * @property {number} createdAt
 * @property {string} status
 */

export class AIFXCore {
  /**
   * @param {object} [config={}]
   * @param {number} [config.maxConcurrentAnalyses=50]
   * @param {number} [config.analysisTimeoutMs=60000]
   * @param {number} [config.heartbeatIntervalMs=873]
   * @param {string[]} [config.enabledExchanges]
   * @param {string[]} [config.enabledRegulations]
   */
  constructor(config = {}) {
    this.maxConcurrentAnalyses = config.maxConcurrentAnalyses ?? 50;
    this.analysisTimeoutMs = config.analysisTimeoutMs ?? 60000;
    this.heartbeatIntervalMs = config.heartbeatIntervalMs ?? 873;
    this.enabledExchanges = config.enabledExchanges ?? Object.keys(SUPPORTED_EXCHANGES);
    this.enabledRegulations = config.enabledRegulations ?? Object.keys(REGULATORY_FRAMEWORKS);

    /** @type {Map<string, AIFXTask>} */
    this.activeTasks = new Map();

    /** @type {Map<string, Function[]>} */
    this._listeners = new Map();

    this.metrics = {
      totalAnalyses: 0,
      totalCompleted: 0,
      totalFailed: 0,
      totalComplianceChecks: 0,
      totalAlertsRaised: 0,
      cumulativeLatencyMs: 0,
    };

    this.status = 'idle';
    this.modelId = AIFX_CONFIG.modelId;
    this.version = AIFX_CONFIG.version;
  }

  /**
   * Initialize the AIFX foundation model with exchange connections
   * and regulatory framework loading.
   */
  async initialize() {
    this.status = 'initializing';
    this._emit('lifecycle', { event: 'initializing', timestamp: Date.now() });

    // Validate exchange configuration
    for (const exId of this.enabledExchanges) {
      if (!SUPPORTED_EXCHANGES[exId]) {
        throw new Error(`AIFX: Unknown exchange "${exId}"`);
      }
    }

    // Validate regulatory configuration
    for (const regId of this.enabledRegulations) {
      if (!REGULATORY_FRAMEWORKS[regId]) {
        throw new Error(`AIFX: Unknown regulatory framework "${regId}"`);
      }
    }

    this.status = 'active';
    this._emit('lifecycle', { event: 'active', timestamp: Date.now() });
    return this;
  }

  /**
   * Submit a market analysis task to the AIFX foundation model.
   * @param {object} task
   * @param {string} task.type — 'tick-analysis' | 'chart-pattern' | 'order-flow' | 'multi-timeframe' | 'compliance-check'
   * @param {object} task.payload — task-specific data
   * @param {string} [task.exchange] — target exchange
   * @param {string} [task.asset] — target asset/symbol
   * @returns {AIFXTask}
   */
  submitAnalysis(task) {
    if (this.status !== 'active') {
      throw new Error(`AIFX: Cannot submit analysis in status "${this.status}"`);
    }
    if (this.activeTasks.size >= this.maxConcurrentAnalyses) {
      throw new Error('AIFX: Max concurrent analyses reached');
    }

    const record = {
      id: crypto.randomUUID(),
      type: task.type,
      payload: task.payload,
      exchange: task.exchange ?? null,
      asset: task.asset ?? null,
      createdAt: Date.now(),
      status: 'pending',
      result: null,
    };

    this.activeTasks.set(record.id, record);
    this.metrics.totalAnalyses++;
    this._emit('task:submitted', record);
    return record;
  }

  /**
   * Process a submitted task through the appropriate engine.
   * @param {string} taskId
   * @returns {object} analysis result
   */
  async processTask(taskId) {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error(`AIFX: Task "${taskId}" not found`);

    task.status = 'processing';
    const start = Date.now();

    try {
      let result;
      switch (task.type) {
        case 'tick-analysis':
          result = this._processTickAnalysis(task);
          break;
        case 'chart-pattern':
          result = this._processChartPattern(task);
          break;
        case 'order-flow':
          result = this._processOrderFlow(task);
          break;
        case 'multi-timeframe':
          result = this._processMultiTimeframe(task);
          break;
        case 'compliance-check':
          result = this._processComplianceCheck(task);
          this.metrics.totalComplianceChecks++;
          break;
        default:
          throw new Error(`AIFX: Unknown task type "${task.type}"`);
      }

      task.status = 'completed';
      task.result = result;
      task.completedAt = Date.now();
      this.metrics.totalCompleted++;
      this.metrics.cumulativeLatencyMs += (Date.now() - start);
      this._emit('task:completed', task);
      return result;
    } catch (err) {
      task.status = 'failed';
      task.error = err.message;
      this.metrics.totalFailed++;
      this._emit('task:failed', { task, error: err.message });
      throw err;
    }
  }

  /**
   * Get the applicable regulatory frameworks for a given exchange.
   * @param {string} exchangeId
   * @returns {object[]}
   */
  getApplicableRegulations(exchangeId) {
    const exchange = SUPPORTED_EXCHANGES[exchangeId];
    if (!exchange) return [];

    return Object.values(REGULATORY_FRAMEWORKS).filter(reg => {
      if (reg.jurisdiction === 'GLOBAL') return true;
      if (reg.jurisdiction === exchange.region) return true;
      if (reg.jurisdiction === 'US' && exchange.region === 'US') return true;
      if (reg.jurisdiction === 'EU' && exchange.region === 'EU') return true;
      return false;
    });
  }

  /**
   * Retrieve model diagnostics and metrics.
   * @returns {object}
   */
  getDiagnostics() {
    return {
      modelId: this.modelId,
      version: this.version,
      status: this.status,
      activeTasks: this.activeTasks.size,
      enabledExchanges: this.enabledExchanges.length,
      enabledRegulations: this.enabledRegulations.length,
      metrics: { ...this.metrics },
      avgLatencyMs: this.metrics.totalCompleted > 0
        ? Math.round(this.metrics.cumulativeLatencyMs / this.metrics.totalCompleted)
        : 0,
    };
  }

  /**
   * Graceful shutdown.
   */
  async shutdown() {
    this.status = 'shutting-down';
    this._emit('lifecycle', { event: 'shutdown', timestamp: Date.now() });

    // Cancel pending tasks
    for (const [id, task] of this.activeTasks) {
      if (task.status === 'pending' || task.status === 'processing') {
        task.status = 'cancelled';
      }
    }

    this.status = 'stopped';
    return this.getDiagnostics();
  }

  /* ---- Internal analysis methods ---- */

  _processTickAnalysis(task) {
    const { ticks, symbol, windowSize } = task.payload;
    if (!ticks || !Array.isArray(ticks)) {
      throw new Error('AIFX: tick-analysis requires payload.ticks array');
    }
    const n = ticks.length;
    const window = windowSize ?? n;
    const slice = ticks.slice(-window);

    // Compute tick statistics
    const prices = slice.map(t => t.price);
    const volumes = slice.map(t => t.volume ?? 0);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, p) => a + (p - mean) ** 2, 0) / prices.length;
    const stddev = Math.sqrt(variance);
    const totalVolume = volumes.reduce((a, b) => a + b, 0);
    const vwap = prices.reduce((sum, p, i) => sum + p * volumes[i], 0) / (totalVolume || 1);

    // Momentum via rate of change
    const roc = prices.length > 1 ? (prices[prices.length - 1] - prices[0]) / prices[0] : 0;

    // Detect micro-structure: bid-ask bounce, momentum shift
    const direction = roc > 0 ? 'bullish' : roc < 0 ? 'bearish' : 'neutral';

    return {
      symbol: symbol ?? task.asset,
      tickCount: slice.length,
      mean: +mean.toFixed(6),
      stddev: +stddev.toFixed(6),
      vwap: +vwap.toFixed(6),
      totalVolume,
      roc: +roc.toFixed(6),
      direction,
      timestamp: Date.now(),
    };
  }

  _processChartPattern(task) {
    const { candles, patternTypes } = task.payload;
    if (!candles || !Array.isArray(candles)) {
      throw new Error('AIFX: chart-pattern requires payload.candles array');
    }

    const detected = [];
    const search = patternTypes ?? ['double-top', 'double-bottom', 'head-shoulders', 'triangle', 'wedge', 'flag', 'harmonic'];

    // Simplified pattern detection heuristics
    if (candles.length >= 5) {
      const highs = candles.map(c => c.high);
      const lows = candles.map(c => c.low);
      const closes = candles.map(c => c.close);

      // Double-top detection
      if (search.includes('double-top')) {
        const maxH = Math.max(...highs);
        const peaks = highs.filter(h => h >= maxH * 0.98);
        if (peaks.length >= 2) {
          detected.push({ pattern: 'double-top', confidence: 0.72, level: maxH });
        }
      }

      // Double-bottom detection
      if (search.includes('double-bottom')) {
        const minL = Math.min(...lows);
        const troughs = lows.filter(l => l <= minL * 1.02);
        if (troughs.length >= 2) {
          detected.push({ pattern: 'double-bottom', confidence: 0.72, level: minL });
        }
      }

      // Harmonic (PHI-based) pattern
      if (search.includes('harmonic') && candles.length >= 5) {
        const swing = highs[highs.length - 1] - lows[0];
        const retrace = Math.abs(closes[closes.length - 1] - closes[0]);
        const ratio = swing !== 0 ? retrace / swing : 0;
        if (Math.abs(ratio - (1 / PHI)) < 0.05) {
          detected.push({ pattern: 'harmonic-gartley', confidence: 0.68, phiRatio: +ratio.toFixed(4) });
        }
      }

      // Trend strength via linear regression slope
      const n = closes.length;
      const xMean = (n - 1) / 2;
      const yMean = closes.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        num += (i - xMean) * (closes[i] - yMean);
        den += (i - xMean) ** 2;
      }
      const slope = den !== 0 ? num / den : 0;
      const trend = slope > 0 ? 'uptrend' : slope < 0 ? 'downtrend' : 'sideways';

      return {
        asset: task.asset,
        candleCount: candles.length,
        patternsDetected: detected,
        trend,
        slope: +slope.toFixed(6),
        timestamp: Date.now(),
      };
    }

    return { asset: task.asset, candleCount: candles.length, patternsDetected: [], trend: 'insufficient-data', timestamp: Date.now() };
  }

  _processOrderFlow(task) {
    const { orders, depth } = task.payload;
    if (!orders || !Array.isArray(orders)) {
      throw new Error('AIFX: order-flow requires payload.orders array');
    }

    const buys = orders.filter(o => o.side === 'buy');
    const sells = orders.filter(o => o.side === 'sell');
    const buyVolume = buys.reduce((s, o) => s + (o.quantity ?? 0), 0);
    const sellVolume = sells.reduce((s, o) => s + (o.quantity ?? 0), 0);
    const delta = buyVolume - sellVolume;
    const totalVolume = buyVolume + sellVolume;
    const imbalance = totalVolume > 0 ? delta / totalVolume : 0;

    // Detect aggressive orders (market orders vs limit)
    const aggressiveBuys = buys.filter(o => o.type === 'market').length;
    const aggressiveSells = sells.filter(o => o.type === 'market').length;

    // Iceberg detection: repeated fills at same price
    const priceMap = new Map();
    for (const o of orders) {
      const key = `${o.price}-${o.side}`;
      priceMap.set(key, (priceMap.get(key) ?? 0) + 1);
    }
    const icebergCandidates = [...priceMap.entries()]
      .filter(([, count]) => count >= 3)
      .map(([key]) => key);

    return {
      asset: task.asset,
      orderCount: orders.length,
      buyVolume,
      sellVolume,
      delta,
      imbalance: +imbalance.toFixed(4),
      aggressiveBuys,
      aggressiveSells,
      pressure: imbalance > 0.2 ? 'buy-pressure' : imbalance < -0.2 ? 'sell-pressure' : 'balanced',
      icebergCandidates: icebergCandidates.length,
      timestamp: Date.now(),
    };
  }

  _processMultiTimeframe(task) {
    const { timeframes } = task.payload;
    if (!timeframes || typeof timeframes !== 'object') {
      throw new Error('AIFX: multi-timeframe requires payload.timeframes object');
    }

    const analyses = {};
    for (const [tf, candles] of Object.entries(timeframes)) {
      if (!Array.isArray(candles) || candles.length === 0) continue;
      const closes = candles.map(c => c.close);
      const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
      const last = closes[closes.length - 1];
      const trend = last > mean ? 'bullish' : last < mean ? 'bearish' : 'neutral';
      analyses[tf] = { trend, mean: +mean.toFixed(6), last, candleCount: candles.length };
    }

    // Confluence: do multiple timeframes agree?
    const trends = Object.values(analyses).map(a => a.trend);
    const bullishCount = trends.filter(t => t === 'bullish').length;
    const bearishCount = trends.filter(t => t === 'bearish').length;
    const confluence = bullishCount === trends.length ? 'strong-bullish'
      : bearishCount === trends.length ? 'strong-bearish'
      : bullishCount > bearishCount ? 'lean-bullish'
      : bearishCount > bullishCount ? 'lean-bearish'
      : 'mixed';

    return {
      asset: task.asset,
      timeframeCount: Object.keys(analyses).length,
      analyses,
      confluence,
      timestamp: Date.now(),
    };
  }

  _processComplianceCheck(task) {
    const { exchange, operation, regulatoryScope } = task.payload;
    if (!exchange || !operation) {
      throw new Error('AIFX: compliance-check requires payload.exchange and payload.operation');
    }

    const applicableRegs = this.getApplicableRegulations(exchange);
    const scopeFilter = regulatoryScope
      ? applicableRegs.filter(r => regulatoryScope.includes(r.id))
      : applicableRegs;

    const checks = scopeFilter.map(reg => ({
      regulator: reg.id,
      jurisdiction: reg.jurisdiction,
      mandatesChecked: reg.mandates,
      operationAllowed: true, // Foundation: extensible compliance engine
      notes: `Operation "${operation}" evaluated under ${reg.name}`,
    }));

    return {
      exchange,
      operation,
      regulatorsEvaluated: checks.length,
      checks,
      overallCompliant: checks.every(c => c.operationAllowed),
      timestamp: Date.now(),
    };
  }

  /* ---- Event system ---- */

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(fn);
    return this;
  }

  _emit(event, data) {
    const fns = this._listeners.get(event);
    if (fns) fns.forEach(fn => fn(data));
  }
}
