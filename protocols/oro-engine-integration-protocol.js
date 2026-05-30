/**
 * PROTO-184: ORO Engine Integration Protocol (OEIP)
 * Standard integration specification for all ORO-powered reasoning engines.
 * Defines the universal adapter interface, health contract, and wire handshake.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const ORO_WIRE_VERSION = '1.0.0';

/**
 * ORO Engine capability flags
 */
const ORO_CAPABILITIES = {
  REASONING:        0b000000001,
  MEMORY:           0b000000010,
  SECURITY:         0b000000100,
  ROUTING:          0b000001000,
  FUSION:           0b000010000,
  OFFLINE:          0b000100000,
  KNOWLEDGE_GRAPH:  0b001000000,
  CODE_GEN:         0b010000000,
  MULTIMODAL:       0b100000000
};

class OroEngineIntegrationProtocol {
  /**
   * @param {Object} config - {engineId, engineName, capabilities, version}
   */
  constructor(config = {}) {
    this.name = 'ORO Engine Integration Protocol';
    this.id = 'PROTO-184-OEIP';
    this.ring = 'Sovereign Ring';

    this.engineId = config.engineId || `oro-engine-${Date.now().toString(36)}`;
    this.engineName = config.engineName || 'UnnamedOROEngine';
    this.engineVersion = config.version || '0.0.0';
    this.capabilities = config.capabilities || 0;

    // Wire registration state
    this.registered = false;
    this.wireEndpoint = null;
    this.peerEngines = new Map();

    // Health contract: each engine must report health every PHI * HEARTBEAT ms
    this.healthInterval = PHI * HEARTBEAT; // ≈ 1411ms
    this.lastHealthReport = null;
    this.health = {
      status: 'initializing',
      score: 0,
      phi_resonance: 0,
      heartbeat_delta: 0
    };

    // Message queue with phi-priority weighting
    this.messageQueue = [];
    this.processedCount = 0;
    this.errorCount = 0;

    this.metrics = {
      handshakes: 0,
      messagesRouted: 0,
      healthReports: 0,
      peerRegistrations: 0,
      wireErrors: 0
    };
  }

  /**
   * Perform the ORO wire handshake — register this engine on the intelligence wire
   * @param {Function} wireCallback - called with registration payload
   * @returns {Object} registration result
   */
  handshake(wireCallback) {
    const payload = {
      protocol: ORO_WIRE_VERSION,
      engineId: this.engineId,
      engineName: this.engineName,
      version: this.engineVersion,
      capabilities: this.capabilities,
      capabilityFlags: this._decodeCapabilities(this.capabilities),
      wireEndpoint: `intelligence-wire/${this.engineId}`,
      phi: PHI,
      heartbeat: HEARTBEAT,
      timestamp: Date.now()
    };

    this.wireEndpoint = payload.wireEndpoint;
    this.registered = true;
    this.metrics.handshakes++;
    this.lastHealthReport = Date.now();
    this.health.status = 'active';
    this.health.score = PHI / (PHI + 1); // ≈ 0.618 initial health

    if (typeof wireCallback === 'function') wireCallback(payload);

    return { success: true, wireEndpoint: this.wireEndpoint, engineId: this.engineId };
  }

  /**
   * Register a peer engine for direct communication
   * @param {string} peerId
   * @param {Object} peerInfo - {name, capabilities, endpoint}
   */
  registerPeer(peerId, peerInfo) {
    this.peerEngines.set(peerId, {
      ...peerInfo,
      registeredAt: Date.now(),
      trust: 0.8,
      messageCount: 0
    });
    this.metrics.peerRegistrations++;
  }

  /**
   * Route a message through the ORO wire to a peer or broadcast
   * @param {Object} message - {type, payload, targetId?, priority?}
   * @returns {Object} routing result
   */
  route(message) {
    if (!this.registered) {
      return { success: false, error: 'engine_not_registered', hint: 'Call handshake() first' };
    }

    const priority = message.priority || 1.0;
    const phiPriority = priority * PHI;

    const envelope = {
      from: this.engineId,
      to: message.targetId || 'broadcast',
      type: message.type,
      payload: message.payload,
      phi_priority: phiPriority,
      wire_version: ORO_WIRE_VERSION,
      timestamp: Date.now()
    };

    // Insert into priority queue
    this._enqueue(envelope, phiPriority);
    this.metrics.messagesRouted++;

    return { success: true, envelope };
  }

  /**
   * Report engine health to the ORO wire
   * @returns {Object} health report
   */
  reportHealth() {
    const now = Date.now();
    const delta = now - (this.lastHealthReport || now);
    const resonance = 1 - Math.abs(delta - this.healthInterval) / this.healthInterval;

    this.health = {
      status: resonance > 0.5 ? 'healthy' : 'degraded',
      score: resonance * PHI / (PHI + 1),
      phi_resonance: Math.max(0, resonance),
      heartbeat_delta: delta,
      processedCount: this.processedCount,
      errorRate: this.errorCount / Math.max(1, this.processedCount)
    };

    this.lastHealthReport = now;
    this.metrics.healthReports++;
    return this.health;
  }

  /**
   * Process the next message from the priority queue
   * @param {Function} handler - (envelope) => result
   */
  processNext(handler) {
    if (this.messageQueue.length === 0) return null;
    const envelope = this.messageQueue.shift().envelope;
    try {
      const result = handler(envelope);
      this.processedCount++;
      return result;
    } catch (err) {
      this.errorCount++;
      this.metrics.wireErrors++;
      return { error: err.message, envelope };
    }
  }

  /**
   * Check if this engine has a specific capability
   * @param {string} capabilityName - key from ORO_CAPABILITIES
   */
  hasCapability(capabilityName) {
    const flag = ORO_CAPABILITIES[capabilityName.toUpperCase()];
    return flag ? (this.capabilities & flag) !== 0 : false;
  }

  /**
   * Decode capability bitmask to human-readable array
   */
  _decodeCapabilities(bitmask) {
    return Object.entries(ORO_CAPABILITIES)
      .filter(([, flag]) => (bitmask & flag) !== 0)
      .map(([name]) => name);
  }

  /**
   * Insert into phi-priority queue (higher phi_priority = processed sooner)
   */
  _enqueue(envelope, priority) {
    const item = { envelope, priority };
    let i = this.messageQueue.length;
    while (i > 0 && this.messageQueue[i - 1].priority < priority) i--;
    this.messageQueue.splice(i, 0, item);
    if (this.messageQueue.length > 500) this.messageQueue.pop();
  }

  /**
   * Status report
   */
  status() {
    return {
      protocol: this.id,
      ring: this.ring,
      engineId: this.engineId,
      engineName: this.engineName,
      registered: this.registered,
      wireEndpoint: this.wireEndpoint,
      capabilities: this._decodeCapabilities(this.capabilities),
      health: { ...this.health },
      peers: this.peerEngines.size,
      queueDepth: this.messageQueue.length,
      metrics: { ...this.metrics },
      phi: PHI,
      heartbeat: HEARTBEAT,
      wireVersion: ORO_WIRE_VERSION
    };
  }
}

export { OroEngineIntegrationProtocol, ORO_CAPABILITIES };
