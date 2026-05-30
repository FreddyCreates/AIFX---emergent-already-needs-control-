/**
 * @medina/ai-model-engines — ModelWire
 *
 * Creates encrypted intelligence wires between AI model families and the
 * organism's internal components. Each wire is a point-to-point channel
 * that tracks throughput, encryption, and activity metrics.
 *
 * Conceptually integrates with IntelligenceWire from
 * @medina/intelligence-routing-sdk.
 *
 * @module @medina/ai-model-engines/model-wire
 */

import crypto from 'node:crypto';

/**
 * Ring-affinity → organism layer mapping used by {@link ModelWire#wireAllEngines}.
 * @type {Record<string, string>}
 */
const RING_TO_LAYER = {
  'Interface Ring':           'orchestration-layer',
  'Memory Ring':              'memory-layer',
  'Sovereign Ring':           'sovereign-compute',
  'Build Ring':               'packaging-layer',
  'Geometry Ring':            'scene-layer',
  'Transport Ring':           'channel-layer',
  'Native Capability Ring':   'native-runtime',
  'Proof Ring':               'verification-layer',
  'Counsel Ring':             'governance-layer',
};

/**
 * @typedef {Object} WireRecord
 * @property {string}  wireId
 * @property {string}  sourceEndpoint   — e.g. 'engine/AIF-001'
 * @property {string}  targetEndpoint   — e.g. 'organism/cognitive-register'
 * @property {string}  wireProtocol     — e.g. 'intelligence-wire/openai'
 * @property {string}  encryption       — e.g. 'aes-256-gcm'
 * @property {'connected'|'disconnected'|'error'} status
 * @property {number}  bandwidth        — messages-per-second limit
 * @property {string}  createdAt        — ISO-8601 timestamp
 * @property {string}  lastActivity     — ISO-8601 timestamp
 * @property {number}  messageCount
 * @property {number}  bytesSent
 */

/**
 * @typedef {Object} EndpointMetadata
 * @property {'engine'|'organism'|'external'} type
 * @property {string}  [ringAffinity]
 * @property {string[]} [capabilities]
 */

/**
 * @typedef {Object} SendResult
 * @property {boolean} delivered
 * @property {string}  wireId
 * @property {string}  timestamp — ISO-8601
 */

export class ModelWire {
  /**
   * @param {object} [config]
   * @param {string} [config.defaultEncryption='aes-256-gcm']
   * @param {number} [config.maxWires=200]
   * @param {number} [config.heartbeatIntervalMs=873]
   */
  constructor(config = {}) {
    /** @type {string} */
    this.defaultEncryption = config.defaultEncryption ?? 'aes-256-gcm';

    /** @type {number} */
    this.maxWires = config.maxWires ?? 200;

    /** @type {number} */
    this.heartbeatIntervalMs = config.heartbeatIntervalMs ?? 873;

    /** @type {Map<string, WireRecord>} wireId → wire record */
    this.wires = new Map();

    /** @type {Map<string, EndpointMetadata>} endpointId → metadata */
    this.endpoints = new Map();

    /** @type {object} global counters */
    this.metrics = {
      totalBytesSent: 0,
      totalMessages: 0,
      activeWires: 0,
      failedConnections: 0,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Endpoint management                                                */
  /* ------------------------------------------------------------------ */

  /**
   * Registers an endpoint (engine, organism component, or external).
   * @param {string} endpointId
   * @param {EndpointMetadata} metadata
   * @returns {{ endpointId: string, registered: true }}
   */
  registerEndpoint(endpointId, metadata = {}) {
    if (!endpointId) {
      throw new Error('endpointId is required');
    }

    this.endpoints.set(endpointId, {
      type: metadata.type ?? 'external',
      ringAffinity: metadata.ringAffinity ?? null,
      capabilities: metadata.capabilities ?? [],
    });

    return { endpointId, registered: true };
  }

  /* ------------------------------------------------------------------ */
  /*  Wire lifecycle                                                     */
  /* ------------------------------------------------------------------ */

  /**
   * Creates a wire between two registered endpoints.
   * @param {string} sourceId — registered endpoint id
   * @param {string} targetId — registered endpoint id
   * @param {object} [options]
   * @param {string} [options.wireProtocol='intelligence-wire/default']
   * @param {string} [options.encryption]     — defaults to this.defaultEncryption
   * @param {number} [options.bandwidth=1000] — messages per second
   * @returns {WireRecord}
   */
  connect(sourceId, targetId, options = {}) {
    if (!this.endpoints.has(sourceId)) {
      throw new Error(`Source endpoint not registered: ${sourceId}`);
    }
    if (!this.endpoints.has(targetId)) {
      throw new Error(`Target endpoint not registered: ${targetId}`);
    }
    if (this.wires.size >= this.maxWires) {
      this.metrics.failedConnections += 1;
      throw new Error(`Maximum wire limit reached (${this.maxWires})`);
    }

    const now = new Date().toISOString();

    /** @type {WireRecord} */
    const wire = {
      wireId: crypto.randomUUID(),
      sourceEndpoint: sourceId,
      targetEndpoint: targetId,
      wireProtocol: options.wireProtocol ?? 'intelligence-wire/default',
      encryption: options.encryption ?? this.defaultEncryption,
      status: 'connected',
      bandwidth: options.bandwidth ?? 1000,
      createdAt: now,
      lastActivity: now,
      messageCount: 0,
      bytesSent: 0,
    };

    this.wires.set(wire.wireId, wire);
    this.metrics.activeWires += 1;

    return { ...wire };
  }

  /**
   * Disconnects an existing wire.
   * @param {string} wireId
   * @returns {{ wireId: string, status: 'disconnected' }}
   */
  disconnect(wireId) {
    const wire = this._requireWire(wireId);

    if (wire.status === 'connected') {
      this.metrics.activeWires -= 1;
    }
    wire.status = 'disconnected';
    wire.lastActivity = new Date().toISOString();

    return { wireId, status: 'disconnected' };
  }

  /* ------------------------------------------------------------------ */
  /*  Messaging                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Sends a message over a connected wire.
   * @param {string} wireId
   * @param {{ type: string, payload: *, timestamp: string }} message
   * @returns {SendResult}
   */
  send(wireId, message) {
    const wire = this._requireConnectedWire(wireId);

    const payloadBytes = typeof message.payload === 'string'
      ? message.payload.length
      : JSON.stringify(message.payload ?? '').length;

    wire.messageCount += 1;
    wire.bytesSent += payloadBytes;
    wire.lastActivity = new Date().toISOString();

    this.metrics.totalMessages += 1;
    this.metrics.totalBytesSent += payloadBytes;

    return {
      delivered: true,
      wireId,
      timestamp: wire.lastActivity,
    };
  }

  /**
   * Broadcasts a message to every wire originating from sourceId.
   * @param {string} sourceId
   * @param {{ type: string, payload: *, timestamp: string }} message
   * @returns {SendResult[]}
   */
  broadcast(sourceId, message) {
    const results = [];

    for (const wire of this.wires.values()) {
      if (wire.sourceEndpoint === sourceId && wire.status === 'connected') {
        results.push(this.send(wire.wireId, message));
      }
    }

    return results;
  }

  /* ------------------------------------------------------------------ */
  /*  Query helpers                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Returns a snapshot of a single wire record.
   * @param {string} wireId
   * @returns {WireRecord}
   */
  getWire(wireId) {
    return { ...this._requireWire(wireId) };
  }

  /**
   * Returns all wires as an array.
   * @returns {WireRecord[]}
   */
  listWires() {
    return [...this.wires.values()].map((w) => ({ ...w }));
  }

  /**
   * Returns every wire connected to a given endpoint (source or target).
   * @param {string} endpointId
   * @returns {WireRecord[]}
   */
  listWiresByEndpoint(endpointId) {
    return [...this.wires.values()]
      .filter(
        (w) => w.sourceEndpoint === endpointId || w.targetEndpoint === endpointId,
      )
      .map((w) => ({ ...w }));
  }

  /* ------------------------------------------------------------------ */
  /*  Metrics                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Returns global wire metrics.
   * @returns {{ totalBytesSent: number, totalMessages: number, activeWires: number, failedConnections: number }}
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Returns per-wire metrics.
   * @param {string} wireId
   * @returns {{ messageCount: number, bytesSent: number, avgMessageSize: number, lastActivity: string }}
   */
  getWireMetrics(wireId) {
    const wire = this._requireWire(wireId);

    return {
      messageCount: wire.messageCount,
      bytesSent: wire.bytesSent,
      avgMessageSize:
        wire.messageCount > 0
          ? Math.round((wire.bytesSent / wire.messageCount) * 1000) / 1000
          : 0,
      lastActivity: wire.lastActivity,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Convenience wiring                                                 */
  /* ------------------------------------------------------------------ */

  /**
   * Convenience: wire a single engine family to an organism component.
   *
   * Registers both endpoints if they do not already exist, then connects
   * them with the given protocol.
   *
   * @param {string} familyId          — e.g. 'AIF-001'
   * @param {string} organismComponent — e.g. 'cognitive-register'
   * @param {string} wireProtocol      — e.g. 'intelligence-wire/openai'
   * @returns {WireRecord}
   */
  wireEngineToOrganism(familyId, organismComponent, wireProtocol) {
    const engineEndpoint = `engine/${familyId}`;
    const organismEndpoint = `organism/${organismComponent}`;

    if (!this.endpoints.has(engineEndpoint)) {
      this.registerEndpoint(engineEndpoint, { type: 'engine' });
    }
    if (!this.endpoints.has(organismEndpoint)) {
      this.registerEndpoint(organismEndpoint, { type: 'organism' });
    }

    return this.connect(engineEndpoint, organismEndpoint, { wireProtocol });
  }

  /**
   * Bulk-wire engine families to organism layers based on ring affinity.
   *
   * For each family the ring affinity is mapped to an organism layer via
   * {@link RING_TO_LAYER}. Families whose ring affinity is not in the map
   * are silently skipped.
   *
   * @param {{ id: string, ringAffinity: string }[]} familyList
   * @param {string[]} organismComponents — available organism components
   * @returns {WireRecord[]}
   */
  wireAllEngines(familyList, organismComponents) {
    const componentSet = new Set(organismComponents);
    const records = [];

    for (const family of familyList) {
      const layer = RING_TO_LAYER[family.ringAffinity];
      if (!layer || !componentSet.has(layer)) continue;

      const wireProtocol = `intelligence-wire/${family.id}`;
      records.push(this.wireEngineToOrganism(family.id, layer, wireProtocol));
    }

    return records;
  }

  /* ------------------------------------------------------------------ */
  /*  Health                                                             */
  /* ------------------------------------------------------------------ */

  /**
   * Returns aggregate health of all wires.
   * @returns {{ total: number, connected: number, disconnected: number, error: number }}
   */
  healthCheck() {
    let connected = 0;
    let disconnected = 0;
    let error = 0;

    for (const wire of this.wires.values()) {
      if (wire.status === 'connected') connected += 1;
      else if (wire.status === 'disconnected') disconnected += 1;
      else error += 1;
    }

    return { total: this.wires.size, connected, disconnected, error };
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Retrieves a wire by ID, throwing if it does not exist.
   * @param {string} wireId
   * @returns {WireRecord}
   * @private
   */
  _requireWire(wireId) {
    const wire = this.wires.get(wireId);
    if (!wire) throw new Error(`Unknown wire: ${wireId}`);
    return wire;
  }

  /**
   * Retrieves a wire that must be in 'connected' status.
   * @param {string} wireId
   * @returns {WireRecord}
   * @private
   */
  _requireConnectedWire(wireId) {
    const wire = this._requireWire(wireId);
    if (wire.status !== 'connected') {
      throw new Error(`Wire ${wireId} is not connected (status: ${wire.status})`);
    }
    return wire;
  }
}

export default ModelWire;
