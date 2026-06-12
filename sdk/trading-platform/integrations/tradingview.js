/**
 * TRADINGVIEW INTEGRATION
 *
 * Full production integration with TradingView:
 * - Webhook alert receiver (JSON & plaintext)
 * - Pine Script signal parser
 * - Chart data feed provider
 * - Strategy alert routing
 * - Multi-timeframe signal aggregation
 */

import crypto from 'node:crypto';

const ALERT_TYPES = {
  ENTRY_LONG: 'entry_long',
  ENTRY_SHORT: 'entry_short',
  EXIT_LONG: 'exit_long',
  EXIT_SHORT: 'exit_short',
  TAKE_PROFIT: 'take_profit',
  STOP_LOSS: 'stop_loss',
  TRAILING_STOP: 'trailing_stop',
  SCALE_IN: 'scale_in',
  SCALE_OUT: 'scale_out',
  CUSTOM: 'custom',
};

const TIMEFRAMES = {
  M1: '1',
  M5: '5',
  M15: '15',
  M30: '30',
  H1: '60',
  H4: '240',
  D1: 'D',
  W1: 'W',
  MN: 'M',
};

const SIGNAL_QUALITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

class TradingViewWebhookReceiver {
  constructor({ secret, maxAlertAge = 30000, dedupeWindow = 5000 } = {}) {
    this.secret = secret;
    this.maxAlertAge = maxAlertAge;
    this.dedupeWindow = dedupeWindow;
    this.alertLog = [];
    this.recentHashes = new Map();
    this.subscribers = new Map();
    this.stats = { received: 0, processed: 0, rejected: 0, deduplicated: 0 };
  }

  validateSignature(payload, signature) {
    if (!this.secret) return true;
    const expected = crypto
      .createHmac('sha256', this.secret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  parseAlert(raw) {
    this.stats.received++;

    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        return this._parsePlainTextAlert(raw);
      }
    }

    const alert = {
      id: raw.id || `tv-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`,
      symbol: raw.ticker || raw.symbol,
      exchange: raw.exchange || null,
      timeframe: raw.interval || raw.timeframe || TIMEFRAMES.H1,
      action: this._mapAction(raw.action || raw.strategy?.order_action),
      price: parseFloat(raw.close || raw.price || 0),
      volume: parseFloat(raw.volume || 0),
      timestamp: raw.time ? new Date(raw.time).getTime() : Date.now(),
      strategy: raw.strategy || null,
      indicators: raw.indicators || {},
      contracts: parseFloat(raw.strategy?.order_contracts || raw.contracts || 0),
      comment: raw.comment || raw.strategy?.order_comment || '',
      raw,
    };

    return this._processAlert(alert);
  }

  _parsePlainTextAlert(text) {
    const lines = text.trim().split('\n');
    const parsed = {};
    for (const line of lines) {
      const [key, ...vals] = line.split(':');
      if (key && vals.length) parsed[key.trim().toLowerCase()] = vals.join(':').trim();
    }

    const alert = {
      id: `tv-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`,
      symbol: parsed.symbol || parsed.ticker || 'UNKNOWN',
      exchange: parsed.exchange || null,
      timeframe: parsed.timeframe || parsed.interval || TIMEFRAMES.H1,
      action: this._mapAction(parsed.action || parsed.side),
      price: parseFloat(parsed.price || parsed.close || 0),
      volume: parseFloat(parsed.volume || 0),
      timestamp: Date.now(),
      strategy: null,
      indicators: {},
      contracts: parseFloat(parsed.contracts || parsed.quantity || 0),
      comment: parsed.comment || '',
      raw: text,
    };

    return this._processAlert(alert);
  }

  _mapAction(action) {
    if (!action) return ALERT_TYPES.CUSTOM;
    const normalized = action.toLowerCase().replace(/[^a-z_]/g, '');
    const mapping = {
      buy: ALERT_TYPES.ENTRY_LONG,
      long: ALERT_TYPES.ENTRY_LONG,
      entry_long: ALERT_TYPES.ENTRY_LONG,
      sell: ALERT_TYPES.ENTRY_SHORT,
      short: ALERT_TYPES.ENTRY_SHORT,
      entry_short: ALERT_TYPES.ENTRY_SHORT,
      exit_long: ALERT_TYPES.EXIT_LONG,
      close_long: ALERT_TYPES.EXIT_LONG,
      exit_short: ALERT_TYPES.EXIT_SHORT,
      close_short: ALERT_TYPES.EXIT_SHORT,
      take_profit: ALERT_TYPES.TAKE_PROFIT,
      tp: ALERT_TYPES.TAKE_PROFIT,
      stop_loss: ALERT_TYPES.STOP_LOSS,
      sl: ALERT_TYPES.STOP_LOSS,
      trailing_stop: ALERT_TYPES.TRAILING_STOP,
      scale_in: ALERT_TYPES.SCALE_IN,
      scale_out: ALERT_TYPES.SCALE_OUT,
    };
    return mapping[normalized] || ALERT_TYPES.CUSTOM;
  }

  _processAlert(alert) {
    const hash = crypto
      .createHash('sha256')
      .update(`${alert.symbol}:${alert.action}:${alert.price}:${alert.timeframe}`)
      .digest('hex')
      .slice(0, 16);

    const lastSeen = this.recentHashes.get(hash);
    if (lastSeen && (Date.now() - lastSeen) < this.dedupeWindow) {
      this.stats.deduplicated++;
      return { accepted: false, reason: 'duplicate', alert };
    }

    if (Date.now() - alert.timestamp > this.maxAlertAge) {
      this.stats.rejected++;
      return { accepted: false, reason: 'stale', alert };
    }

    this.recentHashes.set(hash, Date.now());
    this.alertLog.push(alert);
    this.stats.processed++;

    this._notifySubscribers(alert);

    return { accepted: true, alert };
  }

  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel).push(callback);
  }

  _notifySubscribers(alert) {
    const channels = ['*', alert.symbol, alert.action];
    for (const ch of channels) {
      const subs = this.subscribers.get(ch) || [];
      for (const cb of subs) {
        try { cb(alert); } catch { /* subscriber error isolated */ }
      }
    }
  }

  getStats() {
    return { ...this.stats, alertCount: this.alertLog.length };
  }
}

class TradingViewSignalAggregator {
  constructor({ confluenceThreshold = 2, maxAge = 300000 } = {}) {
    this.confluenceThreshold = confluenceThreshold;
    this.maxAge = maxAge;
    this.signals = new Map();
  }

  addSignal({ symbol, timeframe, direction, strength = 1, source = 'tradingview' }) {
    const key = `${symbol}:${direction}`;
    if (!this.signals.has(key)) {
      this.signals.set(key, []);
    }
    this.signals.get(key).push({ timeframe, strength, source, timestamp: Date.now() });
    this._pruneStale(key);
    return this.evaluate(symbol, direction);
  }

  evaluate(symbol, direction) {
    const key = `${symbol}:${direction}`;
    const entries = this.signals.get(key) || [];
    const active = entries.filter(e => Date.now() - e.timestamp < this.maxAge);

    const uniqueTimeframes = new Set(active.map(e => e.timeframe));
    const totalStrength = active.reduce((sum, e) => sum + e.strength, 0);
    const confluence = uniqueTimeframes.size;

    let quality = SIGNAL_QUALITY.LOW;
    if (confluence >= this.confluenceThreshold + 1) quality = SIGNAL_QUALITY.HIGH;
    else if (confluence >= this.confluenceThreshold) quality = SIGNAL_QUALITY.MEDIUM;

    return {
      symbol,
      direction,
      confluence,
      totalStrength,
      quality,
      timeframes: [...uniqueTimeframes],
      eligible: confluence >= this.confluenceThreshold,
    };
  }

  _pruneStale(key) {
    const entries = this.signals.get(key) || [];
    this.signals.set(key, entries.filter(e => Date.now() - e.timestamp < this.maxAge));
  }
}

class TradingViewChartDataProvider {
  constructor() {
    this.symbols = new Map();
    this.history = new Map();
  }

  registerSymbol({ symbol, exchange, type = 'forex', pricescale = 100000, minmov = 1 }) {
    this.symbols.set(symbol, {
      name: symbol,
      exchange,
      type,
      session: type === 'crypto' ? '24x7' : '0930-1600',
      timezone: 'Etc/UTC',
      pricescale,
      minmov,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      supported_resolutions: Object.values(TIMEFRAMES),
    });
    return this.symbols.get(symbol);
  }

  resolveSymbol(symbolName) {
    return this.symbols.get(symbolName) || null;
  }

  pushBar({ symbol, time, open, high, low, close, volume = 0 }) {
    const key = symbol;
    if (!this.history.has(key)) this.history.set(key, []);
    this.history.get(key).push({ time, open, high, low, close, volume });
    return { symbol, bar: { time, open, high, low, close, volume } };
  }

  getBars(symbol, from, to) {
    const bars = this.history.get(symbol) || [];
    return bars.filter(b => b.time >= from && b.time <= to);
  }
}

export {
  TradingViewWebhookReceiver,
  TradingViewSignalAggregator,
  TradingViewChartDataProvider,
  ALERT_TYPES,
  TIMEFRAMES,
  SIGNAL_QUALITY,
};

export default TradingViewWebhookReceiver;
