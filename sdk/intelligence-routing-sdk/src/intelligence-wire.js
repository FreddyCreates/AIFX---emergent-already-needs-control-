import crypto from 'node:crypto';

/**
 * @typedef {Object} WireConfig
 * @property {number} bandwidth - Maximum throughput in messages/sec
 * @property {string} protocol - Wire protocol identifier (e.g. 'json-rpc', 'grpc', 'ws')
 * @property {boolean} encryption - Whether payloads are encrypted in transit
 */

/**
 * @typedef {Object} Wire
 * @property {string} wireId
 * @property {string} sourceId
 * @property {string} targetId
 * @property {WireConfig} config
 * @property {'connected'|'disconnected'} state
 * @property {Function[]} listeners
 * @property {{ messagesSent: number, messagesReceived: number, errors: number, totalLatencyMs: number }} metrics
 */

/**
 * IntelligenceWire — point-to-point communication channels between
 * intelligence endpoints. Wires carry payloads, track metrics, and
 * support configurable bandwidth, protocol, and encryption settings.
 */
export class IntelligenceWire {
  constructor() {
    /** @type {Map<string, Wire>} */
    this._wires = new Map();
  }

  /**
   * Creates a wire between two intelligence endpoints.
   * @param {string} sourceId
   * @param {string} targetId
   * @param {WireConfig} wireConfig
   * @returns {{ wireId: string, sourceId: string, targetId: string, state: string }}
   */
  connect(sourceId, targetId, wireConfig) {
    if (!sourceId || !targetId) {
      throw new Error('sourceId and targetId are required');
    }

    const wireId = crypto.randomUUID();

    /** @type {Wire} */
    const wire = {
      wireId,
      sourceId,
      targetId,
      config: {
        bandwidth: wireConfig?.bandwidth ?? 1000,
        protocol: wireConfig?.protocol ?? 'json-rpc',
        encryption: wireConfig?.encryption ?? false,
      },
      state: 'connected',
      listeners: [],
      metrics: {
        messagesSent: 0,
        messagesReceived: 0,
        errors: 0,
        totalLatencyMs: 0,
      },
    };

    this._wires.set(wireId, wire);

    return {
      wireId,
      sourceId,
      targetId,
      state: wire.state,
    };
  }

  /**
   * Sends a payload over an established wire.
   * Notifies all registered receive handlers on that wire.
   * @param {string} wireId
   * @param {*} payload
   * @returns {{ wireId: string, delivered: boolean, timestamp: number }}
   */
  send(wireId, payload) {
    const wire = this._getWire(wireId);
    const sendTime = Date.now();

    wire.metrics.messagesSent += 1;

    const envelope = {
      wireId,
      sourceId: wire.sourceId,
      targetId: wire.targetId,
      payload,
      timestamp: sendTime,
    };

    let delivered = false;

    try {
      for (const listener of wire.listeners) {
        listener(envelope);
        wire.metrics.messagesReceived += 1;
        delivered = true;
      }
    } catch (err) {
      wire.metrics.errors += 1;
      throw err;
    }

    const latency = Date.now() - sendTime;
    wire.metrics.totalLatencyMs += latency;

    return { wireId, delivered, timestamp: sendTime };
  }

  /**
   * Registers a callback to receive payloads on a wire.
   * @param {string} wireId
   * @param {Function} callback - Called with `{ wireId, sourceId, targetId, payload, timestamp }`
   * @returns {{ wireId: string, listenerCount: number }}
   */
  onReceive(wireId, callback) {
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    const wire = this._getWire(wireId);
    wire.listeners.push(callback);

    return { wireId, listenerCount: wire.listeners.length };
  }

  /**
   * Tears down a wire, removing all listeners and marking it disconnected.
   * @param {string} wireId
   * @returns {{ wireId: string, state: string }}
   */
  disconnect(wireId) {
    const wire = this._getWire(wireId);
    wire.state = 'disconnected';
    wire.listeners = [];

    return { wireId, state: wire.state };
  }

  /**
   * Returns performance metrics for a wire.
   * @param {string} wireId
   * @returns {{ wireId: string, messagesSent: number, messagesReceived: number, errors: number, averageLatencyMs: number, throughput: number }}
   */
  getWireMetrics(wireId) {
    const wire = this._getWire(wireId);
    const { messagesSent, messagesReceived, errors, totalLatencyMs } =
      wire.metrics;

    const averageLatencyMs =
      messagesSent > 0
        ? Math.round((totalLatencyMs / messagesSent) * 1000) / 1000
        : 0;

    return {
      wireId,
      messagesSent,
      messagesReceived,
      errors,
      averageLatencyMs,
      throughput: messagesReceived,
    };
  }

  /* ---- internal ---- */

  /**
   * Retrieves a wire by ID, throwing if missing or disconnected.
   * @param {string} wireId
   * @returns {Wire}
   * @private
   */
  _getWire(wireId) {
    const wire = this._wires.get(wireId);
    if (!wire) throw new Error(`Unknown wire: ${wireId}`);
    if (wire.state === 'disconnected') {
      throw new Error(`Wire ${wireId} is disconnected`);
    }
    return wire;
  }
}

export default IntelligenceWire;
