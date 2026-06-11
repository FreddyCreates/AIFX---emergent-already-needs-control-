/**
 * ExchangeConnector — Multi-exchange normalization layer.
 *
 * Provides a unified interface for connecting to and normalizing data
 * from all supported global exchanges. Handles protocol differences,
 * data format normalization, and exchange-specific quirks.
 *
 * @module @medina/aifx-foundation-model/exchange-connector
 */

import { SUPPORTED_EXCHANGES } from './constants.js';

/**
 * Normalized tick format that all exchange data is converted to.
 * @typedef {object} NormalizedTick
 * @property {string} symbol
 * @property {number} price
 * @property {number} volume
 * @property {number} timestamp
 * @property {string} side — 'buy' | 'sell' | 'unknown'
 * @property {string} exchange
 * @property {string} assetClass
 */

/**
 * Normalized OHLCV candle format.
 * @typedef {object} NormalizedCandle
 * @property {string} symbol
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 * @property {number} volume
 * @property {number} timestamp
 * @property {string} timeframe
 * @property {string} exchange
 */

export class ExchangeConnector {
  constructor(config = {}) {
    this.enabledExchanges = config.exchanges ?? Object.keys(SUPPORTED_EXCHANGES);
    /** @type {Map<string, {status: string, lastPing: number}>} */
    this.connections = new Map();
    this.normalizers = new Map();
    this._initNormalizers();
  }

  /**
   * Connect to an exchange (simulated for foundation model).
   * @param {string} exchangeId
   * @returns {object} connection state
   */
  connect(exchangeId) {
    if (!SUPPORTED_EXCHANGES[exchangeId]) {
      throw new Error(`ExchangeConnector: Unknown exchange "${exchangeId}"`);
    }
    if (!this.enabledExchanges.includes(exchangeId)) {
      throw new Error(`ExchangeConnector: Exchange "${exchangeId}" not enabled`);
    }

    const state = { status: 'connected', lastPing: Date.now(), exchange: SUPPORTED_EXCHANGES[exchangeId] };
    this.connections.set(exchangeId, state);
    return state;
  }

  /**
   * Disconnect from an exchange.
   * @param {string} exchangeId
   */
  disconnect(exchangeId) {
    this.connections.delete(exchangeId);
  }

  /**
   * Normalize raw tick data from any exchange into unified format.
   * @param {string} exchangeId
   * @param {object} rawTick — exchange-specific tick data
   * @returns {NormalizedTick}
   */
  normalizeTick(exchangeId, rawTick) {
    const normalizer = this.normalizers.get(exchangeId);
    if (!normalizer) {
      throw new Error(`ExchangeConnector: No normalizer for "${exchangeId}"`);
    }
    return normalizer.tick(rawTick);
  }

  /**
   * Normalize raw candle data from any exchange into unified format.
   * @param {string} exchangeId
   * @param {object} rawCandle — exchange-specific candle data
   * @param {string} timeframe
   * @returns {NormalizedCandle}
   */
  normalizeCandle(exchangeId, rawCandle, timeframe) {
    const normalizer = this.normalizers.get(exchangeId);
    if (!normalizer) {
      throw new Error(`ExchangeConnector: No normalizer for "${exchangeId}"`);
    }
    return normalizer.candle(rawCandle, timeframe);
  }

  /**
   * Normalize a batch of ticks.
   * @param {string} exchangeId
   * @param {object[]} rawTicks
   * @returns {NormalizedTick[]}
   */
  normalizeTicks(exchangeId, rawTicks) {
    return rawTicks.map(t => this.normalizeTick(exchangeId, t));
  }

  /**
   * Get connection status for all enabled exchanges.
   * @returns {object}
   */
  getStatus() {
    const status = {};
    for (const exId of this.enabledExchanges) {
      const conn = this.connections.get(exId);
      status[exId] = conn ? conn.status : 'disconnected';
    }
    return status;
  }

  /**
   * Get supported exchanges by asset class.
   * @param {string} assetClass
   * @returns {object[]}
   */
  getExchangesByAssetClass(assetClass) {
    return Object.values(SUPPORTED_EXCHANGES).filter(ex => ex.assetClass === assetClass);
  }

  /**
   * Get supported exchanges by region.
   * @param {string} region
   * @returns {object[]}
   */
  getExchangesByRegion(region) {
    return Object.values(SUPPORTED_EXCHANGES).filter(ex => ex.region === region);
  }

  /* ---- Internal ---- */

  _initNormalizers() {
    // Generic normalizer that works for standard exchange formats
    const genericNormalizer = {
      tick: (raw) => ({
        symbol: raw.symbol ?? raw.s ?? raw.instrument ?? 'UNKNOWN',
        price: +(raw.price ?? raw.p ?? raw.last ?? 0),
        volume: +(raw.volume ?? raw.v ?? raw.qty ?? raw.size ?? 0),
        timestamp: raw.timestamp ?? raw.ts ?? raw.time ?? raw.T ?? Date.now(),
        side: raw.side ?? raw.direction ?? (raw.isBuyerMaker === false ? 'buy' : raw.isBuyerMaker === true ? 'sell' : 'unknown'),
        exchange: raw._exchange ?? 'unknown',
        assetClass: raw._assetClass ?? 'unknown',
      }),
      candle: (raw, timeframe) => ({
        symbol: raw.symbol ?? raw.s ?? 'UNKNOWN',
        open: +(raw.open ?? raw.o ?? 0),
        high: +(raw.high ?? raw.h ?? 0),
        low: +(raw.low ?? raw.l ?? 0),
        close: +(raw.close ?? raw.c ?? 0),
        volume: +(raw.volume ?? raw.v ?? 0),
        timestamp: raw.timestamp ?? raw.ts ?? raw.time ?? Date.now(),
        timeframe,
        exchange: raw._exchange ?? 'unknown',
      }),
    };

    // Register generic normalizer for all exchanges
    for (const exId of Object.keys(SUPPORTED_EXCHANGES)) {
      const exchange = SUPPORTED_EXCHANGES[exId];
      this.normalizers.set(exId, {
        tick: (raw) => ({
          ...genericNormalizer.tick(raw),
          exchange: exId,
          assetClass: exchange.assetClass,
        }),
        candle: (raw, tf) => ({
          ...genericNormalizer.candle(raw, tf),
          exchange: exId,
        }),
      });
    }
  }
}
