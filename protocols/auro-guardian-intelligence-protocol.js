/**
 * PROTO-181: AURO Guardian Intelligence Protocol (AGIP)
 * Advanced threat immunity with AURO-specific behavioral fingerprinting.
 * Extends the Guardian Worker immune system with ORO-chartered identity verification.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const AURO_VERSION = '1.0.0';

class AuroGuardianIntelligenceProtocol {
  /**
   * @param {Object} config
   */
  constructor(config = {}) {
    this.name = 'AURO Guardian Intelligence Protocol';
    this.id = 'PROTO-181-AGIP';
    this.ring = 'Security Ring';
    this.version = AURO_VERSION;

    // Behavioral fingerprint store
    this.fingerprints = new Map();
    this.threatMemory = [];
    this.immuneResponses = [];

    // Phi-weighted severity thresholds
    this.thresholds = {
      low:      PHI,             // 1.618
      medium:   PHI * PHI,      // 2.618
      high:     PHI ** 3,       // 4.236
      critical: PHI ** 4,       // 6.854
      sovereign: PHI ** 5       // 11.090
    };

    // Hebbian threat weights — increases on repeated threat detection
    this.hebbianWeights = {};

    // AURO identity registry
    this.identityRegistry = new Map();

    this.metrics = {
      threatsDetected: 0,
      threatsNeutralized: 0,
      fingerprintsRecorded: 0,
      immuneActivations: 0,
      uptime: Date.now()
    };

    this._initInnateImmunity();
  }

  /**
   * Initialize innate immunity rules (hardcoded threat patterns)
   */
  _initInnateImmunity() {
    this.innateRules = [
      { name: 'prototype_pollution', pattern: /(__proto__|constructor\s*\[|prototype\s*\[)/i, severity: this.thresholds.high },
      { name: 'code_injection',     pattern: /(eval\s*\(|Function\s*\(|setTimeout\s*\(.*['"]/i, severity: this.thresholds.high },
      { name: 'path_traversal',     pattern: /(\.\.\/)|(\.\.\\)/,                               severity: this.thresholds.medium },
      { name: 'xss_attempt',        pattern: /<script[\s>]|javascript:/i,                        severity: this.thresholds.medium },
      { name: 'sql_injection',      pattern: /(union\s+select|drop\s+table|insert\s+into)/i,     severity: this.thresholds.high },
      { name: 'charter_violation',  pattern: /auro[\s_-]?bypass|vigil[\s_-]?override/i,          severity: this.thresholds.sovereign }
    ];
  }

  /**
   * Register an AURO identity token
   * @param {string} entityId
   * @param {Object} identity - {role, permissions, charterVersion}
   * @returns {string} fingerprint hash
   */
  registerIdentity(entityId, identity) {
    const fingerprint = this._computeFingerprint(entityId, identity);
    this.identityRegistry.set(entityId, {
      ...identity,
      fingerprint,
      registeredAt: Date.now(),
      lastSeen: Date.now(),
      trustScore: 0.8
    });
    this.metrics.fingerprintsRecorded++;
    return fingerprint;
  }

  /**
   * Verify an entity against the AURO identity registry
   * @param {string} entityId
   * @param {string} fingerprint
   * @returns {{valid: boolean, trustScore: number, reason: string}}
   */
  verifyIdentity(entityId, fingerprint) {
    const record = this.identityRegistry.get(entityId);
    if (!record) return { valid: false, trustScore: 0, reason: 'entity_not_registered' };

    if (record.fingerprint !== fingerprint) {
      this._recordThreat('identity_mismatch', entityId, this.thresholds.critical);
      return { valid: false, trustScore: 0, reason: 'fingerprint_mismatch' };
    }

    record.lastSeen = Date.now();
    return { valid: true, trustScore: record.trustScore, reason: 'verified' };
  }

  /**
   * Scan a payload for threats — core immune checkpoint
   * @param {string|Object} payload
   * @param {string} sourceId
   * @returns {{safe: boolean, severity: number, threats: string[]}}
   */
  scan(payload, sourceId = 'unknown') {
    const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const detectedThreats = [];
    let maxSeverity = 0;

    for (const rule of this.innateRules) {
      if (rule.pattern.test(str)) {
        detectedThreats.push(rule.name);
        maxSeverity = Math.max(maxSeverity, rule.severity);
        this._hebbianReinforce(rule.name, rule.severity);
        this._recordThreat(rule.name, sourceId, rule.severity);
      }
    }

    // Adaptive threat detection — check Hebbian weights for learned threats
    for (const [threatName, weight] of Object.entries(this.hebbianWeights)) {
      if (weight > this.thresholds.medium && !detectedThreats.includes(threatName)) {
        // Pattern likely evolved — flag for review
        detectedThreats.push(`learned:${threatName}`);
        maxSeverity = Math.max(maxSeverity, weight * 0.5);
      }
    }

    if (detectedThreats.length > 0) {
      this.metrics.threatsDetected++;
      this._activateImmuneResponse(detectedThreats, sourceId, maxSeverity);
    }

    return {
      safe: detectedThreats.length === 0,
      severity: maxSeverity,
      threats: detectedThreats
    };
  }

  /**
   * Phi-weighted behavioral fingerprint
   */
  _computeFingerprint(entityId, identity) {
    const raw = `${entityId}:${JSON.stringify(identity)}:${PHI}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
      hash = Math.imul(hash, 0x9e3779b9) >>> 0;
    }
    return hash.toString(16).padStart(8, '0') + '-AGIP';
  }

  /**
   * Hebbian reinforcement: repeated threats strengthen detection weights
   */
  _hebbianReinforce(threatName, severity) {
    const current = this.hebbianWeights[threatName] || 0;
    // dW = lr * (1 - current) * severity — asymptotic approach to ceiling
    const lr = 1 / PHI;
    this.hebbianWeights[threatName] = current + lr * (1 - current) * severity;
  }

  /**
   * Record a threat event to threat memory
   */
  _recordThreat(threatType, sourceId, severity) {
    this.threatMemory.push({
      type: threatType,
      source: sourceId,
      severity,
      phi_score: severity / PHI,
      timestamp: Date.now()
    });
    if (this.threatMemory.length > 1000) this.threatMemory.shift();
  }

  /**
   * Activate an immune response
   */
  _activateImmuneResponse(threats, sourceId, severity) {
    this.metrics.immuneActivations++;
    this.immuneResponses.push({
      threats,
      sourceId,
      severity,
      action: severity >= this.thresholds.critical ? 'BLOCK' : 'QUARANTINE',
      timestamp: Date.now()
    });

    // Update trust score for known entities
    const record = this.identityRegistry.get(sourceId);
    if (record) {
      record.trustScore = Math.max(0, record.trustScore - (severity * (1 / PHI ** 2)));
    }
  }

  /**
   * Get status report
   */
  status() {
    return {
      protocol: this.id,
      ring: this.ring,
      version: this.version,
      metrics: { ...this.metrics, uptime: Date.now() - this.metrics.uptime },
      registeredEntities: this.identityRegistry.size,
      learnedThreats: Object.keys(this.hebbianWeights).length,
      phi: PHI,
      heartbeat: HEARTBEAT
    };
  }
}

export { AuroGuardianIntelligenceProtocol };
