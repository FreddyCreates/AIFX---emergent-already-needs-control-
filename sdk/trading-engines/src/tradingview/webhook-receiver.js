/**
 * TradingView Webhook Receiver
 * JSON + plaintext alert parsing, HMAC signature validation
 */

import { createHmac } from 'crypto';

export class WebhookReceiver {
  constructor(config = {}) {
    this.secret = config.secret || '';
    this.allowedIPs = config.allowedIPs || [];
    this.maxPayloadSize = config.maxPayloadSize || 1024 * 64;
    this.handlers = new Map();
    this.receivedAlerts = [];
  }

  validateSignature(payload, signature) {
    if (!this.secret) return true;
    const expected = createHmac('sha256', this.secret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');
    return `sha256=${expected}` === signature;
  }

  parseAlert(raw) {
    if (typeof raw !== 'string') {
      return this._normalizeAlert(raw);
    }
    // Try JSON first
    try {
      const parsed = JSON.parse(raw);
      return this._normalizeAlert(parsed);
    } catch {
      // Plaintext parsing
      return this._parsePlaintext(raw);
    }
  }

  _normalizeAlert(data) {
    return {
      symbol: data.symbol || data.ticker || '',
      action: (data.action || data.order || data.side || '').toUpperCase(),
      price: parseFloat(data.price || data.close || 0),
      timeframe: data.timeframe || data.interval || '',
      strategy: data.strategy || data.name || '',
      timestamp: data.timestamp || data.time || Date.now(),
      volume: parseFloat(data.volume || 0),
      indicators: data.indicators || {},
      raw: data,
    };
  }

  _parsePlaintext(text) {
    const lines = text.trim().split('\n');
    const alert = { raw: text, indicators: {} };
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (!key) continue;
      const value = valueParts.join(':').trim();
      const k = key.trim().toLowerCase();
      if (k === 'symbol' || k === 'ticker') alert.symbol = value;
      else if (k === 'action' || k === 'side' || k === 'order') alert.action = value.toUpperCase();
      else if (k === 'price' || k === 'close') alert.price = parseFloat(value);
      else if (k === 'timeframe' || k === 'interval') alert.timeframe = value;
      else if (k === 'strategy' || k === 'name') alert.strategy = value;
      else if (k === 'volume') alert.volume = parseFloat(value);
      else if (k === 'timestamp' || k === 'time') alert.timestamp = value;
      else alert.indicators[k] = value;
    }
    alert.timestamp = alert.timestamp || Date.now();
    return alert;
  }

  onAlert(handler) {
    const id = Symbol('handler');
    this.handlers.set(id, handler);
    return () => this.handlers.delete(id);
  }

  async processWebhook(request) {
    const { body, headers = {}, ip } = request;

    // IP whitelist check
    if (this.allowedIPs.length > 0 && ip && !this.allowedIPs.includes(ip)) {
      return { status: 403, body: { error: 'IP not allowed' } };
    }

    // Size check
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    if (rawBody.length > this.maxPayloadSize) {
      return { status: 413, body: { error: 'Payload too large' } };
    }

    // HMAC validation
    const signature = headers['x-tradingview-signature'] || headers['x-signature'] || '';
    if (this.secret && !this.validateSignature(rawBody, signature)) {
      return { status: 401, body: { error: 'Invalid signature' } };
    }

    // Parse & dispatch
    const alert = this.parseAlert(body);
    this.receivedAlerts.push(alert);
    for (const handler of this.handlers.values()) {
      try { await handler(alert); } catch (e) { /* swallow handler errors */ }
    }

    return { status: 200, body: { received: true, symbol: alert.symbol, action: alert.action } };
  }
}
