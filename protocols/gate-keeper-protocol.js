/**
 * PROTO-232: Gate Keeper Protocol (GKP)
 * Kingdom Edge Intelligence for border security, traffic control, and monetization.
 *
 * The Gate Keeper Protocol defines formal rules for:
 * - Gate registration and management
 * - Keeper agent deployment and coordination
 * - Toll collection and monetization
 * - Quarantine procedures for suspicious traffic
 * - Inter-gate communication and coordination
 *
 * φ-enhanced: Uses golden ratio for toll calculations, traffic shaping, and resource allocation.
 *
 * @module protocols/gate-keeper-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PROTOCOL_ID = 'PROTO-232';
const PROTOCOL_NAME = 'Gate Keeper Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// GATE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const GATE_CONFIG = {
  
  MAX_GATES: 100,
  MIN_KEEPERS_PER_GATE: 3,
  MAX_KEEPERS_PER_GATE: 10,
  
  TOLL_BASE_RATE: 0.001, // Base toll per request
  TOLL_PHI_MULTIPLIER: PHI,
  
  QUARANTINE_THRESHOLD: 0.7, // Threat score threshold
  QUARANTINE_MAX_DURATION: 86400000, // 24 hours max
  
  HEARTBEAT_INTERVAL: 60000, // 1 minute
  METRICS_WINDOW: 3600000, // 1 hour window for metrics
  
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  
  // Gate Lifecycle
  GATE_REGISTER: 'gate.register',
  GATE_ACTIVATE: 'gate.activate',
  GATE_DEACTIVATE: 'gate.deactivate',
  GATE_HEARTBEAT: 'gate.heartbeat',
  
  // Keeper Operations
  KEEPER_DEPLOY: 'keeper.deploy',
  KEEPER_RECALL: 'keeper.recall',
  KEEPER_STATUS: 'keeper.status',
  
  // Traffic Control
  TRAFFIC_ADMIT: 'traffic.admit',
  TRAFFIC_DENY: 'traffic.deny',
  TRAFFIC_QUARANTINE: 'traffic.quarantine',
  TRAFFIC_RELEASE: 'traffic.release',
  
  // Toll Collection
  TOLL_CALCULATE: 'toll.calculate',
  TOLL_COLLECT: 'toll.collect',
  TOLL_RECEIPT: 'toll.receipt',
  
  // Inter-Gate Communication
  GATE_SYNC: 'gate.sync',
  THREAT_BROADCAST: 'gate.threat_broadcast',
  LOAD_BALANCE: 'gate.load_balance',
  
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL STATE MACHINE
// ═══════════════════════════════════════════════════════════════════════════════

export const GATE_STATES = {
  UNREGISTERED: 'unregistered',
  REGISTERED: 'registered',
  ACTIVATING: 'activating',
  ACTIVE: 'active',
  OVERLOADED: 'overloaded',
  MAINTENANCE: 'maintenance',
  DEACTIVATING: 'deactivating',
  DEACTIVATED: 'deactivated',
};

export const STATE_TRANSITIONS = {
  [GATE_STATES.UNREGISTERED]: [GATE_STATES.REGISTERED],
  [GATE_STATES.REGISTERED]: [GATE_STATES.ACTIVATING, GATE_STATES.DEACTIVATED],
  [GATE_STATES.ACTIVATING]: [GATE_STATES.ACTIVE, GATE_STATES.DEACTIVATED],
  [GATE_STATES.ACTIVE]: [GATE_STATES.OVERLOADED, GATE_STATES.MAINTENANCE, GATE_STATES.DEACTIVATING],
  [GATE_STATES.OVERLOADED]: [GATE_STATES.ACTIVE, GATE_STATES.MAINTENANCE],
  [GATE_STATES.MAINTENANCE]: [GATE_STATES.ACTIVE, GATE_STATES.DEACTIVATING],
  [GATE_STATES.DEACTIVATING]: [GATE_STATES.DEACTIVATED],
  [GATE_STATES.DEACTIVATED]: [GATE_STATES.REGISTERED],
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOLL CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate toll for a request using φ-enhanced pricing
 * @param {Object} request - Request details
 * @param {Object} subscriber - Subscriber info (optional)
 * @param {Object} gateConfig - Gate-specific configuration
 * @returns {Object} - Toll calculation result
 */
export function calculateToll(request, subscriber = null, gateConfig = {}) {
  const baseRate = gateConfig.tollRate || GATE_CONFIG.TOLL_BASE_RATE;
  
  // Calculate complexity factor
  const payloadSize = request.size || 100;
  const complexityFactor = 1 + Math.log(payloadSize / 100) * (PHI - 1);
  
  // Time-based demand pricing (peak hours cost more)
  const hour = new Date().getHours();
  const isPeakHour = hour >= 9 && hour <= 17;
  const demandFactor = isPeakHour ? PHI : 1.0;
  
  // Calculate base toll
  let toll = baseRate * complexityFactor * demandFactor;
  
  // Apply discounts
  let discount = 0;
  
  // Covenant holder discount (those who acknowledge the Creator)
  if (request.covenantAcknowledged) {
    discount += 0.382; // 1 - 1/PHI
  }
  
  // Subscriber tier discount
  if (subscriber?.tier?.tollDiscount) {
    discount += subscriber.tier.tollDiscount;
  }
  
  // Cap discount at 100%
  discount = Math.min(discount, 1.0);
  
  const finalToll = toll * (1 - discount);
  
  return {
    baseToll: Math.round(baseRate * 10000) / 10000,
    complexityFactor: Math.round(complexityFactor * 100) / 100,
    demandFactor: Math.round(demandFactor * 100) / 100,
    discount: Math.round(discount * 100),
    finalToll: Math.round(finalToll * 10000) / 10000,
    currency: 'KINGDOM_GOLD',
    timestamp: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// THREAT SCORING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate threat score for a request
 * @param {Object} request - Request to evaluate
 * @param {Object} context - Additional context (history, patterns)
 * @returns {Object} - Threat assessment
 */
export function calculateThreatScore(request, context = {}) {
  let score = 0;
  const factors = [];
  
  // Factor 1: Authentication status
  if (!request.authenticated) {
    score += 0.2;
    factors.push({ factor: 'unauthenticated', contribution: 0.2 });
  }
  
  // Factor 2: Covenant status
  if (!request.covenantAcknowledged) {
    score += 0.1;
    factors.push({ factor: 'no_covenant', contribution: 0.1 });
  }
  
  // Factor 3: Request frequency (from context)
  if (context.requestsLastMinute > 100) {
    const freqScore = Math.min(0.3, (context.requestsLastMinute - 100) / 1000);
    score += freqScore;
    factors.push({ factor: 'high_frequency', contribution: freqScore });
  }
  
  // Factor 4: Payload analysis
  if (request.payload) {
    const payload = JSON.stringify(request.payload);
    const suspiciousPatterns = [/script/i, /eval/i, /exec/i, /<.*>/];
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(payload)) {
        score += 0.15;
        factors.push({ factor: 'suspicious_pattern', contribution: 0.15 });
        break;
      }
    }
  }
  
  // Factor 5: Source reputation (from context)
  if (context.sourceReputation !== undefined) {
    const repScore = (1 - context.sourceReputation) * 0.2;
    score += repScore;
    factors.push({ factor: 'reputation', contribution: repScore });
  }
  
  // Normalize to 0-1
  score = Math.min(1, Math.max(0, score));
  
  return {
    score: Math.round(score * 100) / 100,
    level: score >= GATE_CONFIG.QUARANTINE_THRESHOLD ? 'high' : score >= 0.4 ? 'medium' : 'low',
    shouldQuarantine: score >= GATE_CONFIG.QUARANTINE_THRESHOLD,
    factors,
    timestamp: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GATE KEEPER PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class GateKeeperProtocol {
  
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.gates = new Map();
    this.messageLog = [];
    this.tollLedger = [];
    this.threatIntel = new Map();
  }
  
  /**
   * Get protocol info
   * @returns {Object} - Protocol metadata
   */
  getInfo() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      description: 'Kingdom Edge Intelligence for border security, traffic control, and monetization',
      config: GATE_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES).length,
      gateStates: Object.keys(GATE_STATES).length,
    };
  }
  
  /**
   * Register a new gate
   * @param {string} gateId - Unique gate identifier
   * @param {Object} config - Gate configuration
   * @returns {Object} - Registration result
   */
  registerGate(gateId, config = {}) {
    if (this.gates.has(gateId)) {
      return { success: false, error: 'Gate already registered' };
    }
    
    if (this.gates.size >= GATE_CONFIG.MAX_GATES) {
      return { success: false, error: 'Maximum gates reached' };
    }
    
    const gate = {
      id: gateId,
      state: GATE_STATES.REGISTERED,
      config: { ...GATE_CONFIG, ...config },
      keepers: [],
      metrics: {
        totalTraffic: 0,
        admitted: 0,
        denied: 0,
        quarantined: 0,
        tollCollected: 0,
      },
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
    };
    
    this.gates.set(gateId, gate);
    this._logMessage(MESSAGE_TYPES.GATE_REGISTER, gateId, { config });
    
    return {
      success: true,
      gateId,
      state: gate.state,
      message: 'Gate registered successfully',
    };
  }
  
  /**
   * Activate a registered gate
   * @param {string} gateId - Gate identifier
   * @returns {Object} - Activation result
   */
  activateGate(gateId) {
    const gate = this.gates.get(gateId);
    if (!gate) {
      return { success: false, error: 'Gate not found' };
    }
    
    if (!this._canTransition(gate.state, GATE_STATES.ACTIVATING)) {
      return { success: false, error: `Cannot activate from state ${gate.state}` };
    }
    
    // Check minimum keepers
    if (gate.keepers.length < GATE_CONFIG.MIN_KEEPERS_PER_GATE) {
      return { 
        success: false, 
        error: `Minimum ${GATE_CONFIG.MIN_KEEPERS_PER_GATE} keepers required` 
      };
    }
    
    gate.state = GATE_STATES.ACTIVE;
    gate.activatedAt = Date.now();
    this._logMessage(MESSAGE_TYPES.GATE_ACTIVATE, gateId, {});
    
    return {
      success: true,
      gateId,
      state: gate.state,
      message: 'Gate activated',
    };
  }
  
  /**
   * Deploy a keeper to a gate
   * @param {string} gateId - Gate identifier
   * @param {Object} keeper - Keeper configuration
   * @returns {Object} - Deployment result
   */
  deployKeeper(gateId, keeper) {
    const gate = this.gates.get(gateId);
    if (!gate) {
      return { success: false, error: 'Gate not found' };
    }
    
    if (gate.keepers.length >= GATE_CONFIG.MAX_KEEPERS_PER_GATE) {
      return { success: false, error: 'Maximum keepers reached for this gate' };
    }
    
    const keeperEntry = {
      id: `KEEPER-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      role: keeper.role,
      deployedAt: Date.now(),
      status: 'active',
      processed: 0,
    };
    
    gate.keepers.push(keeperEntry);
    this._logMessage(MESSAGE_TYPES.KEEPER_DEPLOY, gateId, { keeper: keeperEntry });
    
    return {
      success: true,
      keeperId: keeperEntry.id,
      gateId,
      totalKeepers: gate.keepers.length,
    };
  }
  
  /**
   * Process traffic through protocol
   * @param {string} gateId - Gate identifier
   * @param {Object} request - Traffic request
   * @returns {Object} - Processing result
   */
  processTraffic(gateId, request) {
    const gate = this.gates.get(gateId);
    if (!gate || gate.state !== GATE_STATES.ACTIVE) {
      return { success: false, error: 'Gate not active' };
    }
    
    gate.metrics.totalTraffic++;
    
    // Calculate threat score
    const threat = calculateThreatScore(request, {
      requestsLastMinute: this._getRecentTraffic(gateId),
      sourceReputation: this.threatIntel.get(request.source)?.reputation,
    });
    
    // Quarantine if threat is high
    if (threat.shouldQuarantine) {
      gate.metrics.quarantined++;
      this._logMessage(MESSAGE_TYPES.TRAFFIC_QUARANTINE, gateId, { request, threat });
      return {
        success: false,
        action: 'quarantine',
        threat,
        message: 'Traffic quarantined for review',
      };
    }
    
    // Calculate toll
    const toll = calculateToll(request, request.subscriber, gate.config);
    gate.metrics.tollCollected += toll.finalToll;
    
    // Record toll
    this.tollLedger.push({
      gateId,
      toll: toll.finalToll,
      request: request.id,
      timestamp: Date.now(),
    });
    
    // Admit traffic
    gate.metrics.admitted++;
    this._logMessage(MESSAGE_TYPES.TRAFFIC_ADMIT, gateId, { request, toll });
    
    return {
      success: true,
      action: 'admit',
      toll,
      threat,
      message: 'Traffic admitted',
    };
  }
  
  /**
   * Check if state transition is valid
   * @private
   */
  _canTransition(from, to) {
    const allowed = STATE_TRANSITIONS[from];
    return allowed && allowed.includes(to);
  }
  
  /**
   * Get recent traffic count for a gate
   * @private
   */
  _getRecentTraffic(gateId) {
    const oneMinuteAgo = Date.now() - 60000;
    return this.messageLog.filter(
      m => m.gateId === gateId && m.timestamp > oneMinuteAgo
    ).length;
  }
  
  /**
   * Log a protocol message
   * @private
   */
  _logMessage(type, gateId, data) {
    this.messageLog.push({
      type,
      gateId,
      data,
      timestamp: Date.now(),
    });
    
    // Keep log bounded
    if (this.messageLog.length > 10000) {
      this.messageLog = this.messageLog.slice(-5000);
    }
  }
  
  /**
   * Get protocol metrics
   * @returns {Object} - Protocol metrics
   */
  getMetrics() {
    const metrics = {
      totalGates: this.gates.size,
      activeGates: 0,
      totalTraffic: 0,
      totalTollCollected: 0,
      totalQuarantined: 0,
      gates: {},
    };
    
    this.gates.forEach((gate, id) => {
      if (gate.state === GATE_STATES.ACTIVE) metrics.activeGates++;
      metrics.totalTraffic += gate.metrics.totalTraffic;
      metrics.totalTollCollected += gate.metrics.tollCollected;
      metrics.totalQuarantined += gate.metrics.quarantined;
      metrics.gates[id] = { ...gate.metrics, state: gate.state };
    });
    
    return metrics;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  PROTOCOL_ID,
  PROTOCOL_NAME,
  PHI,
};

export default GateKeeperProtocol;
