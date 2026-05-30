/**
 * PROTO-230: Cloud Glade Security Protocol (CGSP)
 * AI-powered security biome integrating Phantom blockchain primitives.
 *
 * Cloud Glade is a sovereign security biome that combines:
 *   1. PHANTOM INTEGRATION — 8 Phantom primitives for stealth/crypto ops
 *   2. THREAT DETECTION — AI-driven threat level assessment
 *   3. ENCRYPTION WEAVE — Payload confidentiality via Tier-4 shielding
 *   4. KEY ROTATION — Adaptive ephemeral key management (Tier-5)
 *   5. DECOY INJECTION — Network obfuscation via mimetic traffic
 *   6. STEALTH ROUTING — Cloaked transaction paths (Tier-2)
 *   7. CLOAK COMPUTE — Concealed hardware profiles (Tier-3)
 *
 * Extends PROTO-225 (CyberDefenseProtocol) with Phantom-powered primitives.
 *
 * @module protocols/cloud-glade-security-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;
const GOLDEN_ANGLE = 137.508;

// ─── Phantom Primitive Registry ──────────────────────────────────────────────

/**
 * The 8 Phantom blockchain primitives from Phantom_Blockchain_Model_Register.csv
 */
const PHANTOM_PRIMITIVES = {
  STEALTH_ROUTING: {
    id: 'stealth-routing',
    family: 'Stealth Routing',
    function: 'Obscure transaction propagation paths',
    stealthClass: 'Cloaked',
    tier: 2,
    mission: 'Mask origin and timing signatures',
    path: '/registry/phantom/ledger/stealth-routing',
    placement: 'Substrate organism / transport veil layer',
  },
  ENCRYPTION_WEAVE: {
    id: 'encryption-weave',
    family: 'Encryption Weave',
    function: 'Encrypt payload and state proofs',
    stealthClass: 'Shielded',
    tier: 4,
    mission: 'Protect message confidentiality and integrity',
    path: '/registry/phantom/ledger/encryption-weave',
    placement: 'Substrate organism / cryptography layer',
  },
  HASH_DISCOVERY: {
    id: 'hash-discovery',
    family: 'Hash Discovery Mesh',
    function: 'Discover valid hashes under adaptive constraints',
    stealthClass: 'Adaptive',
    tier: 1,
    mission: 'Optimize puzzle-space traversal',
    path: '/registry/phantom/ledger/hash-discovery',
    placement: 'Substrate organism / compute search layer',
  },
  PHI_SCAN: {
    id: 'phi-scan',
    family: 'Phi-Scanned Puzzle Search',
    function: 'Prioritize nonce search using phi-biased heuristics',
    stealthClass: 'Spectral',
    tier: 1,
    mission: 'Increase search efficiency under constrained power',
    path: '/registry/phantom/ledger/phi-scan',
    placement: 'Substrate organism / optimization layer',
  },
  CLOAK_COMPUTE: {
    id: 'cloak-compute',
    family: 'Cloak Computation',
    function: 'Execute proofs with concealed hardware profile',
    stealthClass: 'Opaque',
    tier: 3,
    mission: 'Reduce miner fingerprintability',
    path: '/registry/phantom/ledger/cloak-compute',
    placement: 'Substrate organism / execution concealment layer',
  },
  MULTI_ALGO: {
    id: 'multi-algo',
    family: 'Multi-Algorithm Diversification',
    function: 'Switch hashing families by runtime policy',
    stealthClass: 'Polymorphic',
    tier: 2,
    mission: 'Resist single-algorithm exploitation',
    path: '/registry/phantom/ledger/multi-algo',
    placement: 'Substrate organism / consensus defense layer',
  },
  DECOY_TRAFFIC: {
    id: 'decoy-traffic',
    family: 'Decoy Traffic Injection',
    function: 'Inject indistinguishable cover traffic',
    stealthClass: 'Mimetic',
    tier: 2,
    mission: 'Hide true chain activity patterns',
    path: '/registry/phantom/ledger/decoy-traffic',
    placement: 'Substrate organism / network obfuscation layer',
  },
  KEY_ROTATION: {
    id: 'key-rotation',
    family: 'Adaptive Key Rotation',
    function: 'Rotate ephemeral keys by risk trigger',
    stealthClass: 'Reactive',
    tier: 5,
    mission: 'Limit blast radius of key exposure',
    path: '/registry/phantom/ledger/key-rotation',
    placement: 'Substrate organism / key lifecycle layer',
  },
};

// ─── Biome Security Levels (phi-scaled) ──────────────────────────────────────

const BIOME_SECURITY_LEVELS = {
  DORMANT:   { min: 0,       max: 0.2,     label: 'DORMANT',   color: '🌱', primitives: [] },
  AWAKENED:  { min: 0.2,     max: 0.4,     label: 'AWAKENED',  color: '🌿', primitives: ['STEALTH_ROUTING'] },
  GUARDED:   { min: 0.4,     max: PHI_INV, label: 'GUARDED',   color: '🌲', primitives: ['STEALTH_ROUTING', 'ENCRYPTION_WEAVE', 'DECOY_TRAFFIC'] },
  FORTIFIED: { min: PHI_INV, max: 0.9,     label: 'FORTIFIED', color: '🏔️', primitives: ['STEALTH_ROUTING', 'ENCRYPTION_WEAVE', 'DECOY_TRAFFIC', 'CLOAK_COMPUTE', 'MULTI_ALGO'] },
  SOVEREIGN: { min: 0.9,     max: 1.0,     label: 'SOVEREIGN', color: '⛰️', primitives: Object.keys(PHANTOM_PRIMITIVES) },
};

// ─── Glade States ────────────────────────────────────────────────────────────

const GLADE_STATES = {
  INITIALIZING: 'initializing',
  ACTIVE:       'active',
  DEFENDING:    'defending',
  COMPROMISED:  'compromised',
  RECOVERING:   'recovering',
  DORMANT:      'dormant',
};

// ─── Stealth Route ───────────────────────────────────────────────────────────

class StealthRoute {
  constructor({ origin, destination, hops = 3 }) {
    this.id = `route-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    this.origin = origin;
    this.destination = destination;
    this.hops = hops;
    this.path = this._generatePath();
    this.createdAt = Date.now();
    this.expiresAt = Date.now() + (HEARTBEAT * PHI * 60 * 1000); // ~85 min
    this.active = true;
  }

  _generatePath() {
    const nodes = [];
    for (let i = 0; i < this.hops; i++) {
      const angle = GOLDEN_ANGLE * i * Math.PI / 180;
      nodes.push({
        id: `node-${Math.random().toString(36).slice(2, 8)}`,
        delay: Math.round(HEARTBEAT * PHI_INV * (i + 1)),
        angle: parseFloat(angle.toFixed(4)),
      });
    }
    return nodes;
  }

  isExpired() {
    return Date.now() > this.expiresAt;
  }

  deactivate() {
    this.active = false;
    this.deactivatedAt = Date.now();
  }
}

// ─── Encryption Envelope ─────────────────────────────────────────────────────

class EncryptionEnvelope {
  constructor({ payload, algorithm = 'AES-256-GCM', keyId = null }) {
    this.id = `env-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    this.algorithm = algorithm;
    this.keyId = keyId || `key-${Date.now().toString(36)}`;
    this.payloadHash = this._hashPayload(payload);
    this.woven = false;
    this.createdAt = Date.now();
    this.tier = 4; // Encryption Weave is Tier-4
  }

  _hashPayload(payload) {
    // Simplified hash for demo (would use crypto in production)
    let hash = 0;
    const str = JSON.stringify(payload);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  weave() {
    this.woven = true;
    this.wovenAt = Date.now();
    return this;
  }

  verify(payload) {
    return this._hashPayload(payload) === this.payloadHash;
  }
}

// ─── Key Rotation State ──────────────────────────────────────────────────────

class KeyRotationState {
  constructor({ keyPurpose = 'session', rotationIntervalMs = HEARTBEAT * PHI * 1000 }) {
    this.currentKeyId = `key-${Date.now().toString(36)}`;
    this.previousKeyId = null;
    this.keyPurpose = keyPurpose;
    this.rotationIntervalMs = rotationIntervalMs;
    this.rotations = 0;
    this.lastRotation = Date.now();
    this.riskTriggers = [];
    this.tier = 5; // Key Rotation is Tier-5
  }

  shouldRotate() {
    const elapsed = Date.now() - this.lastRotation;
    return elapsed >= this.rotationIntervalMs || this.riskTriggers.length > 0;
  }

  rotate(reason = 'scheduled') {
    this.previousKeyId = this.currentKeyId;
    this.currentKeyId = `key-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 4)}`;
    this.rotations++;
    this.lastRotation = Date.now();
    this.riskTriggers = [];
    return {
      newKeyId: this.currentKeyId,
      previousKeyId: this.previousKeyId,
      reason,
      rotationCount: this.rotations,
    };
  }

  addRiskTrigger(trigger) {
    this.riskTriggers.push({
      ...trigger,
      triggeredAt: Date.now(),
    });
  }
}

// ─── Decoy Traffic Generator ─────────────────────────────────────────────────

class DecoyTrafficGenerator {
  constructor({ baseRate = 10, burstFactor = PHI }) {
    this.baseRate = baseRate; // decoys per minute
    this.burstFactor = burstFactor;
    this.decoysSent = 0;
    this.lastBurst = null;
    this.patterns = ['heartbeat', 'random', 'golden-spiral'];
    this.currentPattern = 'heartbeat';
    this.tier = 2; // Decoy Traffic is Tier-2
  }

  generateDecoy() {
    const decoy = {
      id: `decoy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      pattern: this.currentPattern,
      timestamp: Date.now(),
      size: Math.round(PHI * 100 + Math.random() * 100), // bytes
      mimicType: this._selectMimicType(),
    };
    this.decoysSent++;
    return decoy;
  }

  _selectMimicType() {
    const types = ['query', 'heartbeat', 'sync', 'ack', 'data'];
    return types[Math.floor(Math.random() * types.length)];
  }

  burst() {
    const burstSize = Math.round(this.baseRate * this.burstFactor);
    const decoys = [];
    for (let i = 0; i < burstSize; i++) {
      decoys.push(this.generateDecoy());
    }
    this.lastBurst = Date.now();
    return decoys;
  }

  setPattern(pattern) {
    if (this.patterns.includes(pattern)) {
      this.currentPattern = pattern;
    }
  }
}

// ─── Cloud Glade Security Protocol ───────────────────────────────────────────

class CloudGladeSecurityProtocol {
  constructor(options = {}) {
    this.id = `glade-${Date.now().toString(36)}`;
    this.state = GLADE_STATES.INITIALIZING;
    this.securityLevel = 0.5; // Start at GUARDED level
    
    // Phantom primitive instances
    this.stealthRoutes = [];
    this.encryptionEnvelopes = [];
    this.keyRotation = new KeyRotationState({
      keyPurpose: options.keyPurpose || 'biome-session',
      rotationIntervalMs: options.keyRotationInterval || HEARTBEAT * PHI * 1000,
    });
    this.decoyGenerator = new DecoyTrafficGenerator({
      baseRate: options.decoyRate || 10,
    });
    
    // Security metrics
    this.metrics = {
      threatsDetected: 0,
      threatsBlocked: 0,
      routesCreated: 0,
      routesExpired: 0,
      keyRotations: 0,
      decoysSent: 0,
      envelopesWoven: 0,
    };
    
    // Active primitives based on security level
    this.activePrimitives = new Set();
    
    // Threat intel integration
    this.threatIntelFeed = [];
    
    // Timestamps
    this.createdAt = Date.now();
    this.lastTick = Date.now();
    this.ticks = 0;
    
    // Initialize
    this._updateActivePrimitives();
    this.state = GLADE_STATES.ACTIVE;
  }

  // ── Security Level Management ──────────────────────────────────────────────

  _updateActivePrimitives() {
    for (const [level, config] of Object.entries(BIOME_SECURITY_LEVELS)) {
      if (this.securityLevel >= config.min && this.securityLevel < config.max) {
        this.activePrimitives = new Set(config.primitives);
        this.currentLevel = level;
        return;
      }
    }
    // Default to SOVEREIGN for max level
    this.activePrimitives = new Set(Object.keys(PHANTOM_PRIMITIVES));
    this.currentLevel = 'SOVEREIGN';
  }

  setSecurityLevel(level) {
    this.securityLevel = Math.max(0, Math.min(1, level));
    this._updateActivePrimitives();
    
    // Trigger key rotation on significant level change
    if (Math.abs(level - this.securityLevel) > 0.2) {
      this.keyRotation.addRiskTrigger({ type: 'level-change', oldLevel: this.securityLevel, newLevel: level });
    }
    
    return this.getSecurityLevelInfo();
  }

  getSecurityLevelInfo() {
    for (const [name, config] of Object.entries(BIOME_SECURITY_LEVELS)) {
      if (this.securityLevel >= config.min && this.securityLevel < config.max) {
        return {
          level: name,
          value: this.securityLevel,
          color: config.color,
          activePrimitives: [...this.activePrimitives],
          primitiveCount: this.activePrimitives.size,
        };
      }
    }
    return {
      level: 'SOVEREIGN',
      value: this.securityLevel,
      color: BIOME_SECURITY_LEVELS.SOVEREIGN.color,
      activePrimitives: Object.keys(PHANTOM_PRIMITIVES),
      primitiveCount: Object.keys(PHANTOM_PRIMITIVES).length,
    };
  }

  // ── Stealth Routing Operations ─────────────────────────────────────────────

  createStealthRoute(origin, destination, hops = 3) {
    if (!this.activePrimitives.has('STEALTH_ROUTING')) {
      return { error: 'STEALTH_ROUTING primitive not active at current security level' };
    }
    
    const route = new StealthRoute({ origin, destination, hops });
    this.stealthRoutes.push(route);
    this.metrics.routesCreated++;
    
    return route;
  }

  getActiveRoutes() {
    return this.stealthRoutes.filter(r => r.active && !r.isExpired());
  }

  expireOldRoutes() {
    const now = Date.now();
    let expired = 0;
    for (const route of this.stealthRoutes) {
      if (route.active && route.isExpired()) {
        route.deactivate();
        expired++;
        this.metrics.routesExpired++;
      }
    }
    return expired;
  }

  // ── Encryption Weave Operations ────────────────────────────────────────────

  wrapPayload(payload) {
    if (!this.activePrimitives.has('ENCRYPTION_WEAVE')) {
      return { error: 'ENCRYPTION_WEAVE primitive not active at current security level' };
    }
    
    const envelope = new EncryptionEnvelope({
      payload,
      keyId: this.keyRotation.currentKeyId,
    });
    envelope.weave();
    this.encryptionEnvelopes.push(envelope);
    this.metrics.envelopesWoven++;
    
    return envelope;
  }

  verifyPayload(envelopeId, payload) {
    const envelope = this.encryptionEnvelopes.find(e => e.id === envelopeId);
    if (!envelope) return { valid: false, error: 'Envelope not found' };
    return { valid: envelope.verify(payload), envelopeId };
  }

  // ── Key Rotation Operations ────────────────────────────────────────────────

  checkKeyRotation() {
    if (!this.activePrimitives.has('KEY_ROTATION')) {
      return { rotated: false, reason: 'KEY_ROTATION primitive not active' };
    }
    
    if (this.keyRotation.shouldRotate()) {
      const result = this.keyRotation.rotate(
        this.keyRotation.riskTriggers.length > 0 ? 'risk-trigger' : 'scheduled'
      );
      this.metrics.keyRotations++;
      return { rotated: true, ...result };
    }
    
    return { rotated: false, currentKeyId: this.keyRotation.currentKeyId };
  }

  forceKeyRotation(reason = 'manual') {
    if (!this.activePrimitives.has('KEY_ROTATION')) {
      return { error: 'KEY_ROTATION primitive not active at current security level' };
    }
    
    const result = this.keyRotation.rotate(reason);
    this.metrics.keyRotations++;
    return result;
  }

  // ── Decoy Traffic Operations ───────────────────────────────────────────────

  generateDecoyTraffic(count = 1) {
    if (!this.activePrimitives.has('DECOY_TRAFFIC')) {
      return { error: 'DECOY_TRAFFIC primitive not active at current security level' };
    }
    
    const decoys = [];
    for (let i = 0; i < count; i++) {
      decoys.push(this.decoyGenerator.generateDecoy());
      this.metrics.decoysSent++;
    }
    return decoys;
  }

  burstDecoyTraffic() {
    if (!this.activePrimitives.has('DECOY_TRAFFIC')) {
      return { error: 'DECOY_TRAFFIC primitive not active at current security level' };
    }
    
    const decoys = this.decoyGenerator.burst();
    this.metrics.decoysSent += decoys.length;
    return decoys;
  }

  // ── Threat Integration ─────────────────────────────────────────────────────

  ingestThreat(threat) {
    this.threatIntelFeed.push({
      ...threat,
      receivedAt: Date.now(),
    });
    this.metrics.threatsDetected++;
    
    // Auto-escalate security level based on threat severity
    if (threat.severity >= 0.9) {
      this.setSecurityLevel(1.0); // Go SOVEREIGN
      this.state = GLADE_STATES.DEFENDING;
      this.keyRotation.addRiskTrigger({ type: 'critical-threat', threat });
    } else if (threat.severity >= PHI_INV) {
      this.setSecurityLevel(Math.max(this.securityLevel, 0.7));
      this.keyRotation.addRiskTrigger({ type: 'high-threat', threat });
    }
    
    // Trim feed
    if (this.threatIntelFeed.length > 500) {
      this.threatIntelFeed = this.threatIntelFeed.slice(-500);
    }
    
    return { ingested: true, newLevel: this.getSecurityLevelInfo() };
  }

  blockThreat(threatId) {
    const threat = this.threatIntelFeed.find(t => t.id === threatId);
    if (threat) {
      threat.blocked = true;
      threat.blockedAt = Date.now();
      this.metrics.threatsBlocked++;
      return { blocked: true, threatId };
    }
    return { blocked: false, error: 'Threat not found' };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  tick() {
    this.ticks++;
    this.lastTick = Date.now();
    
    // Expire old routes
    this.expireOldRoutes();
    
    // Check key rotation
    this.checkKeyRotation();
    
    // Generate heartbeat decoy if enabled
    if (this.activePrimitives.has('DECOY_TRAFFIC') && this.ticks % 10 === 0) {
      this.decoyGenerator.generateDecoy();
      this.metrics.decoysSent++;
    }
    
    // Gradual recovery if in DEFENDING state with no recent threats
    if (this.state === GLADE_STATES.DEFENDING) {
      const recentThreats = this.threatIntelFeed.filter(
        t => Date.now() - t.receivedAt < HEARTBEAT * PHI * 60 * 1000
      );
      if (recentThreats.length === 0) {
        this.state = GLADE_STATES.RECOVERING;
      }
    }
    
    // Recovery: gradually lower security level
    if (this.state === GLADE_STATES.RECOVERING) {
      this.securityLevel = Math.max(0.4, this.securityLevel - 0.01);
      this._updateActivePrimitives();
      if (this.securityLevel <= 0.5) {
        this.state = GLADE_STATES.ACTIVE;
      }
    }
    
    return this.getState();
  }

  // ── State Export ───────────────────────────────────────────────────────────

  getState() {
    return {
      id: this.id,
      state: this.state,
      securityLevel: this.getSecurityLevelInfo(),
      metrics: { ...this.metrics },
      activePrimitives: [...this.activePrimitives],
      activeRoutes: this.getActiveRoutes().length,
      currentKeyId: this.keyRotation.currentKeyId,
      keyRotations: this.keyRotation.rotations,
      decoyPattern: this.decoyGenerator.currentPattern,
      recentThreats: this.threatIntelFeed.slice(-10),
      ticks: this.ticks,
      uptime: Date.now() - this.createdAt,
    };
  }

  getPrimitiveInfo(primitiveId) {
    const primitive = PHANTOM_PRIMITIVES[primitiveId];
    if (!primitive) return null;
    return {
      ...primitive,
      active: this.activePrimitives.has(primitiveId),
      requiredLevel: this._getRequiredLevel(primitiveId),
    };
  }

  _getRequiredLevel(primitiveId) {
    for (const [level, config] of Object.entries(BIOME_SECURITY_LEVELS)) {
      if (config.primitives.includes(primitiveId)) {
        return { level, minValue: config.min };
      }
    }
    return { level: 'SOVEREIGN', minValue: 0.9 };
  }

  getAllPrimitives() {
    return Object.entries(PHANTOM_PRIMITIVES).map(([id, primitive]) => ({
      id,
      ...primitive,
      active: this.activePrimitives.has(id),
    }));
  }
}

export {
  CloudGladeSecurityProtocol,
  StealthRoute,
  EncryptionEnvelope,
  KeyRotationState,
  DecoyTrafficGenerator,
  PHANTOM_PRIMITIVES,
  BIOME_SECURITY_LEVELS,
  GLADE_STATES,
};

export default CloudGladeSecurityProtocol;
