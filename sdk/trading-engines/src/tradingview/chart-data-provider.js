/**
 * Chart Data Provider
 * UDF-compatible symbol resolution
 */

export class ChartDataProvider {
  constructor(config = {}) {
    this.exchanges = config.exchanges || ['OANDA', 'BINANCE', 'COINBASE'];
    this.supportedResolutions = config.resolutions || ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'];
    this.symbols = new Map();
    this.bars = new Map();
  }

  registerSymbol(symbolInfo) {
    const key = `${symbolInfo.exchange}:${symbolInfo.name}`;
    this.symbols.set(key, {
      name: symbolInfo.name,
      full_name: key,
      exchange: symbolInfo.exchange || 'UNKNOWN',
      type: symbolInfo.type || 'forex',
      description: symbolInfo.description || symbolInfo.name,
      ticker: symbolInfo.ticker || symbolInfo.name,
      session: symbolInfo.session || '24x7',
      timezone: symbolInfo.timezone || 'Etc/UTC',
      minmov: symbolInfo.minmov || 1,
      pricescale: symbolInfo.pricescale || 100000,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      supported_resolutions: this.supportedResolutions,
      volume_precision: symbolInfo.volume_precision || 2,
      data_status: 'streaming',
    });
    return this.symbols.get(key);
  }

  // UDF /config
  getConfig() {
    return {
      supported_resolutions: this.supportedResolutions,
      supports_group_request: false,
      supports_marks: false,
      supports_search: true,
      supports_timescale_marks: false,
      exchanges: this.exchanges.map(e => ({ value: e, name: e, desc: e })),
    };
  }

  // UDF /symbols
  resolveSymbol(symbolName) {
    // Try exact match first
    if (this.symbols.has(symbolName)) return this.symbols.get(symbolName);
    // Search by name
    for (const [, info] of this.symbols) {
      if (info.name === symbolName || info.ticker === symbolName) return info;
    }
    return null;
  }

  // UDF /search
  searchSymbols(query, type, exchange, limit = 30) {
    const results = [];
    const q = query.toLowerCase();
    for (const [, info] of this.symbols) {
      if (type && info.type !== type) continue;
      if (exchange && info.exchange !== exchange) continue;
      if (info.name.toLowerCase().includes(q) || info.description.toLowerCase().includes(q)) {
        results.push({
          symbol: info.name,
          full_name: info.full_name,
          description: info.description,
          exchange: info.exchange,
          type: info.type,
        });
      }
      if (results.length >= limit) break;
    }
    return results;
  }

  // UDF /history
  addBars(symbol, resolution, bars) {
    const key = `${symbol}:${resolution}`;
    if (!this.bars.has(key)) this.bars.set(key, []);
    this.bars.get(key).push(...bars);
    this.bars.get(key).sort((a, b) => a.time - b.time);
  }

  getBars(symbol, resolution, from, to, limit = 1000) {
    const key = `${symbol}:${resolution}`;
    const allBars = this.bars.get(key) || [];
    const filtered = allBars.filter(b => b.time >= from && b.time <= to);
    const limited = filtered.slice(-limit);
    return {
      s: limited.length > 0 ? 'ok' : 'no_data',
      t: limited.map(b => b.time),
      o: limited.map(b => b.open),
      h: limited.map(b => b.high),
      l: limited.map(b => b.low),
      c: limited.map(b => b.close),
      v: limited.map(b => b.volume || 0),
    };
  }
}
