/**
 * PROTO-226: Geometric Key Protocol (GKP)
 * Phase-resonance access gate — geometric identity verification for external callers.
 *
 * A geometric key is a phi-spiral encoded phase vector derived from a shared secret
 * and the current heartbeat time window. Identity is proven not by matching a string
 * but by demonstrating phase resonance with the organism's expected envelope.
 *
 * ── Intelligence vs Machine distinction ──────────────────────────────────────
 *
 * Two fundamentally different caller types are supported:
 *
 *   INTELLIGENCE — AI-to-AI docking. An AI entity (e.g. Jay's Gemini) presents a
 *     geometric key: a phi-spiral phase vector that must resonate (Kuramoto R > φ⁻¹)
 *     with the organism's expected envelope. This is a sovereign terminal — the AI
 *     docks into the organism's resonant field. Wrong shape = no resonance = no access.
 *
 *   MACHINE — Conventional mechanical access. Scripts, bots, and services present a
 *     bearer-style token (HMAC over callerId + timestamp + nonce) that is validated
 *     by freshness alone. No phase resonance — machines are not in phase.
 *
 * Using the wrong interface for a caller type is rejected at the protocol level.
 *
 * Key lifecycle (intelligence):
 *   REGISTERED → ACTIVE → RESONATING → GRANTED
 *                              ↓
 *                          DRIFTED → DENIED → (re-key or revoke)
 *
 * Token lifecycle (machine):
 *   REGISTERED → TOKEN_ISSUED → FRESH → GRANTED
 *                                  ↓
 *                              EXPIRED → DENIED
 *
 * Resonance check (Kuramoto order parameter, intelligence only):
 *   R·e^(iΨ) = (1/N)·Σe^(iθⱼ)
 *   If R > EMERGENCE_THRESHOLD (φ⁻¹ = 0.618) → access granted
 *   If R ≤ threshold              → access denied + logged
 *
 * Time windows:
 *   Intelligence: rotate every HEARTBEAT × φ ≈ 1413ms (phi-heartbeat)
 *   Machine:      30 000ms (30s freshness window — mechanical latency tolerance)
 *
 * Keys are multi-dimensional (default 8 phases) — no single value to steal.
 * HMAC signature (SHA-256) prevents token tampering (reuses SCVP approach).
 *
 * @module protocols/geometric-key-protocol
 * @version 1.1.0
 */

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const PHI                = 1.618033988749895;
const PHI_INV            = 1 / PHI;
const HEARTBEAT          = 873;
const WINDOW_MS          = Math.round(HEARTBEAT * PHI);   // ~1413 ms per time window
const MACHINE_TOKEN_WINDOW_MS = 30_000;                   // 30s freshness for machine tokens
const EMERGENCE_THRESHOLD = PHI_INV;                      // 0.618…
const DEFENSIVE_THRESHOLD = Math.cos(Math.PI / 5);        // cos(36°) ≈ 0.809 — tighter gate
const DEFAULT_DIMENSIONS = 8;                             // phase vector dimensionality
const TWO_PI             = 2 * Math.PI;

// Hebbian learning rates
const LTP_RATE  = 0.05;    // Long-Term Potentiation: reinforce on grant
const LTD_RATE  = 0.03;    // Long-Term Depression: suppress on deny
const MAX_WEIGHT = PHI;    // upper bound on core weight
const MIN_WEIGHT = 0.01;   // lower bound — never fully silent

// Defensive mode auto-triggers when global deny rate exceeds this over a rolling window
const DEFENSIVE_DENY_RATE = 0.5;  // ≥ 50% denials in last DEFENSIVE_WINDOW_SIZE checks
const DEFENSIVE_WINDOW_SIZE = 10; // rolling window length

// ── Interface types ───────────────────────────────────────────────────────────
const INTERFACE_TYPES = {
  INTELLIGENCE: 'intelligence',  // AI-to-AI: phase-resonant geometric key
  MACHINE:      'machine',       // Mechanical: HMAC + timestamp freshness
};

// ── Key states ────────────────────────────────────────────────────────────────
const KEY_STATES = {
  REGISTERED: 'registered',
  ACTIVE:     'active',
  RESONATING: 'resonating',
  GRANTED:    'granted',
  DRIFTED:    'drifted',
  DENIED:     'denied',
  REVOKED:    'revoked',
};

// ── Access decisions ──────────────────────────────────────────────────────────
const ACCESS = {
  GRANTED: 'granted',
  DENIED:  'denied',
};

// ── Phase vector utilities ────────────────────────────────────────────────────

/**
 * Derive a phi-spiral phase vector from an HMAC digest.
 * Each pair of bytes maps to one phase angle in [0, 2π).
 * Successive angles are offset by the golden ratio to create the phi-spiral.
 *
 * @param {string} secret     - Shared secret
 * @param {string} callerId   - Caller identity
 * @param {number} timeWindow - Integer window index
 * @param {number} dimensions - Vector dimensionality
 * @returns {number[]} - Phase angles [θ₁, θ₂, ..., θₙ]
 */
function derivePhaseVector(secret, callerId, timeWindow, dimensions = DEFAULT_DIMENSIONS) {
  const material = `${callerId}|${timeWindow}`;
  const digest   = createHmac('sha256', secret).update(material).digest();
  const phases   = [];

  for (let i = 0; i < dimensions; i++) {
    const byteA = digest[(i * 2)     % digest.length];
    const byteB = digest[(i * 2 + 1) % digest.length];
    const raw   = ((byteA << 8) | byteB) / 65535;  // normalise to [0, 1)
    // Apply phi-spiral offset so each dimension sits on the golden spiral
    const phiOffset = (i * (PHI - 1) * TWO_PI) % TWO_PI;
    phases.push((raw * TWO_PI + phiOffset) % TWO_PI);
  }

  return phases;
}

/**
 * Compute the phase-difference resonance score between two phase vectors.
 *
 * Uses the Kuramoto order parameter on the per-dimension phase differences:
 *   diff_i = presented_i − expected_i
 *   R·e^(iΨ) = (1/N)·Σ e^(i·diff_j)
 *
 * Interpretation:
 *   R = 1.0 → perfect match (all diffs = 0)
 *   R ≈ 0   → phases are uncorrelated (wrong key)
 *   R > EMERGENCE_THRESHOLD (φ⁻¹ ≈ 0.618) → resonant → access granted
 *
 * This is superior to combining the two vectors, because the phi-spiral
 * distributes phases uniformly across [0, 2π) — a naïve combination would
 * always produce R ≈ 0 even for a correct key.
 *
 * @param {number[]} presentedPhases
 * @param {number[]} expectedPhases
 * @returns {{ R: number, Psi: number }}
 */
function orderParameter(presentedPhases, expectedPhases) {
  const N = presentedPhases.length;
  if (N === 0 || N !== expectedPhases.length) return { R: 0, Psi: 0 };

  let sumCos = 0;
  let sumSin = 0;
  for (let i = 0; i < N; i++) {
    const diff = presentedPhases[i] - expectedPhases[i];
    sumCos += Math.cos(diff);
    sumSin += Math.sin(diff);
  }
  sumCos /= N;
  sumSin /= N;

  return {
    R:   Math.sqrt(sumCos * sumCos + sumSin * sumSin),
    Psi: Math.atan2(sumSin, sumCos),
  };
}

/**
 * Return the integer index of the current heartbeat time window.
 * Changes every WINDOW_MS milliseconds.
 */
function currentWindow() {
  return Math.floor(Date.now() / WINDOW_MS);
}

// ── CallerRecord ──────────────────────────────────────────────────────────────

class CallerRecord {
  constructor({
    callerId,
    secret,
    dimensions    = DEFAULT_DIMENSIONS,
    label         = '',
    interfaceType = INTERFACE_TYPES.INTELLIGENCE,
  }) {
    this.callerId      = callerId;
    this.secret        = secret;
    this.dimensions    = dimensions;
    this.label         = label;
    this.interfaceType = interfaceType;
    this.state         = KEY_STATES.REGISTERED;
    this.registeredAt  = Date.now();
    this.lastAccess    = null;
    this.grantCount    = 0;
    this.denyCount     = 0;
    this.revoked       = false;

    // ── Hebbian immune memory core ────────────────────────────────────────
    // coreWeight starts at φ⁻¹ (balanced, not potentiated or suppressed).
    // Long-Term Potentiation (LTP) on grant: weight grows toward φ.
    // Long-Term Depression (LTD) on deny:  weight decays toward 0.
    // The weight modulates how much benefit of the doubt the lock extends
    // (currently informational; can be wired to threshold dampening).
    this.coreWeight    = PHI_INV;   // Hebbian core weight [MIN_WEIGHT, MAX_WEIGHT]
    this.ltpEvents     = 0;         // lifetime LTP (potentiation) count
    this.ltdEvents     = 0;         // lifetime LTD (depression) count
  }

  /** Apply Long-Term Potentiation: reinforce on successful validation. */
  potentiate() {
    this.coreWeight = Math.min(MAX_WEIGHT, this.coreWeight + (MAX_WEIGHT - this.coreWeight) * LTP_RATE);
    this.ltpEvents++;
  }

  /** Apply Long-Term Depression: suppress on failed validation. */
  depress() {
    this.coreWeight = Math.max(MIN_WEIGHT, this.coreWeight - this.coreWeight * LTD_RATE);
    this.ltdEvents++;
  }

  /** Generate the expected phase vector for a given time window (intelligence only). */
  expectedPhases(window) {
    return derivePhaseVector(this.secret, this.callerId, window, this.dimensions);
  }
}

// ── GeometricKeyProtocol ──────────────────────────────────────────────────────

class GeometricKeyProtocol {
  /**
   * @param {object} config
   * @param {number} [config.dimensions]       - Phase vector dimensions (default 8)
   * @param {number} [config.windowTolerance]  - Accept keys ± N windows (default 1)
   * @param {number} [config.threshold]        - Resonance threshold (default φ⁻¹ = 0.618)
   */
  constructor(config = {}) {
    this.callers         = new Map();   // callerId → CallerRecord
    this.accessLog       = [];          // capped at 500 entries
    this.dimensions      = config.dimensions      || DEFAULT_DIMENSIONS;
    this.windowTolerance = config.windowTolerance !== undefined ? config.windowTolerance : 1;
    this.threshold       = config.threshold       !== undefined ? config.threshold : EMERGENCE_THRESHOLD;

    // ── Adaptive Kuramoto threshold ─────────────────────────────────────────
    // In defensive mode the threshold rises to DEFENSIVE_THRESHOLD (cos 36° ≈ 0.809).
    // Mode is set explicitly via setDefensiveMode() or automatically when the global
    // rolling deny rate exceeds DEFENSIVE_DENY_RATE over DEFENSIVE_WINDOW_SIZE checks.
    this._defensiveMode    = false;
    this._baseThreshold    = this.threshold;       // user-supplied or φ⁻¹
    this._recentOutcomes   = [];                   // rolling window of 'granted'|'denied'

    this.stats = {
      totalValidations: 0,
      totalGranted:     0,
      totalDenied:      0,
      totalRevocations: 0,
    };
  }

  // ── Adaptive threshold control ────────────────────────────────────────────

  /**
   * Explicitly enable or disable defensive mode.
   * In defensive mode the Kuramoto threshold rises to DEFENSIVE_THRESHOLD (cos 36° ≈ 0.809),
   * requiring stronger phase coherence for access to be granted.
   *
   * @param {boolean} active
   */
  setDefensiveMode(active) {
    this._defensiveMode = Boolean(active);
    this.threshold = this._defensiveMode ? DEFENSIVE_THRESHOLD : this._baseThreshold;
    this._log({ event: this._defensiveMode ? 'defensive_mode_on' : 'defensive_mode_off', threshold: this.threshold, at: Date.now() });
  }

  /** Return whether defensive mode is currently active. */
  get defensiveMode() { return this._defensiveMode; }

  /**
   * Update the rolling deny-rate window and auto-engage or disengage defensive mode.
   * Called after every intelligence-interface validation.
   * @param {'granted'|'denied'} outcome
   */
  _trackOutcome(outcome) {
    this._recentOutcomes.push(outcome);
    if (this._recentOutcomes.length > DEFENSIVE_WINDOW_SIZE) {
      this._recentOutcomes.shift();
    }

    if (this._recentOutcomes.length < DEFENSIVE_WINDOW_SIZE) return; // not enough data yet

    const denyCount  = this._recentOutcomes.filter(o => o === 'denied').length;
    const denyRate   = denyCount / this._recentOutcomes.length;
    const shouldDefend = denyRate >= DEFENSIVE_DENY_RATE;

    if (shouldDefend !== this._defensiveMode) {
      this.setDefensiveMode(shouldDefend);
    }
  }

  // ── Caller registration ───────────────────────────────────────────────────

  /**
   * Register an external caller with a shared secret.
   * The secret must be established out-of-band between parties.
   *
   * @param {string} callerId - Unique identifier (e.g. 'nova-partner')
   * @param {string} secret   - Shared secret (≥ 16 chars recommended)
   * @param {object} [opts]   - { dimensions, label, interfaceType }
   * @returns {object}        - { callerId, interfaceType, registeredAt, windowMs, dimensions, threshold }
   */
  registerCaller(callerId, secret, opts = {}) {
    if (!callerId || typeof callerId !== 'string') {
      throw new Error('callerId must be a non-empty string');
    }
    if (!secret || typeof secret !== 'string' || secret.length < 8) {
      throw new Error('secret must be a string of at least 8 characters');
    }

    const interfaceType = opts.interfaceType || INTERFACE_TYPES.INTELLIGENCE;
    if (!Object.values(INTERFACE_TYPES).includes(interfaceType)) {
      throw new Error(`interfaceType must be one of: ${Object.values(INTERFACE_TYPES).join(', ')}`);
    }

    const record = new CallerRecord({
      callerId,
      secret,
      dimensions:    opts.dimensions || this.dimensions,
      label:         opts.label      || callerId,
      interfaceType,
    });

    this.callers.set(callerId, record);
    this._log({ event: 'registered', callerId, interfaceType, at: Date.now() });

    return {
      callerId,
      interfaceType,
      registeredAt: record.registeredAt,
      windowMs:     interfaceType === INTERFACE_TYPES.INTELLIGENCE ? WINDOW_MS : MACHINE_TOKEN_WINDOW_MS,
      dimensions:   record.dimensions,
      threshold:    this.threshold,
    };
  }

  /**
   * Revoke a caller's access permanently.
   * @param {string} callerId
   * @param {string} [reason]
   * @returns {object}
   */
  revokeCaller(callerId, reason = 'revoked') {
    const record = this.callers.get(callerId);
    if (!record) return { revoked: false, reason: 'caller not found' };

    record.revoked = true;
    record.state   = KEY_STATES.REVOKED;
    this.stats.totalRevocations++;
    this._log({ event: 'revoked', callerId, reason, at: Date.now() });

    return { revoked: true, callerId, reason };
  }

  // ── Key generation (intelligence interface) ──────────────────────────────

  /**
   * Generate a geometric key token for an intelligence caller.
   * Typically called by the external AI partner to produce a key for each call.
   * The token is valid for the current time window (± windowTolerance windows).
   *
   * @param {string} callerId - Must match a registered intelligence caller
   * @param {string} secret   - Must match the registered secret
   * @returns {object}        - { callerId, interfaceType, phases, window, signature, generatedAt, windowMs }
   */
  generateKey(callerId, secret) {
    const win    = currentWindow();
    const phases = derivePhaseVector(secret, callerId, win, this.dimensions);
    const payload    = JSON.stringify({ callerId, phases, window: win });
    const signature  = createHmac('sha256', secret).update(payload).digest('hex');

    return {
      callerId,
      interfaceType: INTERFACE_TYPES.INTELLIGENCE,
      phases,
      window:      win,
      signature,
      generatedAt: Date.now(),
      windowMs:    WINDOW_MS,
    };
  }

  // ── Token generation (machine interface) ─────────────────────────────────

  /**
   * Generate a machine token for a machine-interface caller.
   * Valid for MACHINE_TOKEN_WINDOW_MS (30s) — timestamp freshness only.
   *
   * @param {string} callerId - Must match a registered machine caller
   * @param {string} apiKey   - Must match the registered secret/apiKey
   * @returns {object}        - { callerId, interfaceType, timestamp, nonce, signature, generatedAt, windowMs }
   */
  generateMachineToken(callerId, apiKey) {
    const timestamp = Date.now();
    const nonce     = randomBytes(8).toString('hex');   // cryptographically random nonce
    const payload   = `${callerId}|${timestamp}|${nonce}`;
    const signature = createHmac('sha256', apiKey).update(payload).digest('hex');

    return {
      callerId,
      interfaceType: INTERFACE_TYPES.MACHINE,
      timestamp,
      nonce,
      signature,
      generatedAt: timestamp,
      windowMs:    MACHINE_TOKEN_WINDOW_MS,
    };
  }

  // ── Key validation (intelligence interface) ──────────────────────────────

  /**
   * Validate a geometric key token (intelligence interface only).
   *
   * Steps:
   *   1. Caller must be registered as INTELLIGENCE and not revoked
   *   2. Verify HMAC signature (tamper-proof check)
   *   3. Time window must be within tolerance
   *   4. Compute Kuramoto order parameter R between presented and expected phases
   *   5. Grant if R > threshold, deny otherwise
   *
   * @param {object} token - { callerId, phases, window, signature }
   * @returns {object}     - { access, callerId, interfaceType, R, Psi, window, reason }
   */
  validateKey(token) {
    this.stats.totalValidations++;
    const now    = Date.now();
    const result = this._validateIntelligence(token);

    const record = this.callers.get(token?.callerId);
    if (record) {
      record.lastAccess = now;
      if (result.access === ACCESS.GRANTED) {
        record.grantCount++;
        record.state = KEY_STATES.GRANTED;
        record.potentiate();                     // Hebbian LTP
      } else {
        record.denyCount++;
        record.state = KEY_STATES.DENIED;
        record.depress();                        // Hebbian LTD
      }
    }

    if (result.access === ACCESS.GRANTED) {
      this.stats.totalGranted++;
      this._trackOutcome('granted');
    } else {
      this.stats.totalDenied++;
      this._trackOutcome('denied');
    }

    this._log({ event: result.access, callerId: token?.callerId, interfaceType: INTERFACE_TYPES.INTELLIGENCE, R: result.R, at: now });
    return result;
  }

  // ── Token validation (machine interface) ─────────────────────────────────

  /**
   * Validate a machine token (machine interface only).
   *
   * Steps:
   *   1. Caller must be registered as MACHINE and not revoked
   *   2. Timestamp freshness: |now − timestamp| ≤ MACHINE_TOKEN_WINDOW_MS
   *   3. Verify HMAC signature (timing-safe)
   *
   * @param {object} token - { callerId, timestamp, nonce, signature }
   * @returns {object}     - { access, callerId, interfaceType, reason? }
   */
  validateMachineToken(token) {
    this.stats.totalValidations++;
    const now    = Date.now();
    const result = this._validateMachine(token, now);

    const record = this.callers.get(token?.callerId);
    if (record) {
      record.lastAccess = now;
      if (result.access === ACCESS.GRANTED) {
        record.grantCount++;
        record.state = KEY_STATES.GRANTED;
        record.potentiate();                     // Hebbian LTP
      } else {
        record.denyCount++;
        record.state = KEY_STATES.DENIED;
        record.depress();                        // Hebbian LTD
      }
    }

    if (result.access === ACCESS.GRANTED) {
      this.stats.totalGranted++;
    } else {
      this.stats.totalDenied++;
    }

    this._log({ event: result.access, callerId: token?.callerId, interfaceType: INTERFACE_TYPES.MACHINE, at: now });
    return result;
  }

  _validateIntelligence(token) {
    if (!token || typeof token !== 'object') {
      return this._deny('invalid token structure');
    }

    const { callerId, phases, window: tokenWindow, signature } = token;

    // 1. Caller must be registered
    const record = this.callers.get(callerId);
    if (!record) {
      return this._deny('caller not registered', callerId);
    }

    // 2. Caller must not be revoked
    if (record.revoked) {
      return this._deny('caller revoked', callerId);
    }

    // 3. Must be an intelligence-interface caller
    if (record.interfaceType !== INTERFACE_TYPES.INTELLIGENCE) {
      return this._deny(
        'caller is registered as machine interface — use validateMachineToken() for machine callers',
        callerId,
      );
    }

    // 4. Phases must be a valid array with the correct dimensionality
    if (!Array.isArray(phases) || phases.length !== record.dimensions) {
      return this._deny('invalid phase vector dimensions', callerId);
    }

    // 5. Verify HMAC signature (timing-safe comparison)
    const payload  = JSON.stringify({ callerId, phases, window: tokenWindow });
    const expected = createHmac('sha256', record.secret).update(payload).digest('hex');
    const sigBuf   = Buffer.from(signature  || '', 'hex');
    const expBuf   = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return this._deny('signature mismatch', callerId);
    }

    // 6. Time window must be within tolerance
    const win = currentWindow();
    if (Math.abs(tokenWindow - win) > this.windowTolerance) {
      return this._deny(
        'key expired — time window out of tolerance',
        callerId,
        { tokenWindow, currentWindow: win },
      );
    }

    // 7. Compute resonance between presented and expected phase vectors
    const expectedPhases = record.expectedPhases(tokenWindow);
    const { R, Psi }     = orderParameter(phases, expectedPhases);

    if (R > this.threshold) {
      return {
        access:        ACCESS.GRANTED,
        callerId,
        interfaceType: INTERFACE_TYPES.INTELLIGENCE,
        R,
        Psi,
        window:    tokenWindow,
        threshold: this.threshold,
      };
    }

    return this._deny(
      `resonance below threshold (R=${R.toFixed(4)} ≤ ${this.threshold.toFixed(4)})`,
      callerId,
      { R, Psi },
    );
  }

  _validateMachine(token, now = Date.now()) {
    if (!token || typeof token !== 'object') {
      return this._deny('invalid token structure');
    }

    const { callerId, timestamp, nonce, signature } = token;

    // 1. Caller must be registered
    const record = this.callers.get(callerId);
    if (!record) {
      return this._deny('caller not registered', callerId);
    }

    // 2. Caller must not be revoked
    if (record.revoked) {
      return this._deny('caller revoked', callerId);
    }

    // 3. Must be a machine-interface caller
    if (record.interfaceType !== INTERFACE_TYPES.MACHINE) {
      return this._deny(
        'caller is registered as intelligence interface — use validateKey() for intelligence callers',
        callerId,
      );
    }

    // 4. Timestamp must be a number and token must be fresh
    if (typeof timestamp !== 'number' || Math.abs(now - timestamp) > MACHINE_TOKEN_WINDOW_MS) {
      return this._deny('machine token expired or timestamp out of window', callerId);
    }

    // 5. Verify HMAC signature (timing-safe)
    const payload  = `${callerId}|${timestamp}|${nonce}`;
    const expected = createHmac('sha256', record.secret).update(payload).digest('hex');
    const sigBuf   = Buffer.from(signature || '', 'hex');
    const expBuf   = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return this._deny('signature mismatch', callerId);
    }

    return {
      access:        ACCESS.GRANTED,
      callerId,
      interfaceType: INTERFACE_TYPES.MACHINE,
      timestamp,
    };
  }

  _deny(reason, callerId = null, extra = {}) {
    return {
      access:   ACCESS.DENIED,
      callerId,
      reason,
      R:   extra.R   || 0,
      Psi: extra.Psi || 0,
      ...extra,
    };
  }

  // ── Introspection ─────────────────────────────────────────────────────────

  /**
   * Get the current state of a registered caller.
   * @param {string} callerId
   * @returns {object|null}
   */
  getCallerState(callerId) {
    const record = this.callers.get(callerId);
    if (!record) return null;
    return {
      callerId:      record.callerId,
      label:         record.label,
      interfaceType: record.interfaceType,
      state:         record.state,
      revoked:       record.revoked,
      dimensions:    record.dimensions,
      grantCount:    record.grantCount,
      denyCount:     record.denyCount,
      lastAccess:    record.lastAccess,
      registeredAt:  record.registeredAt,
      hebbian: {
        coreWeight: record.coreWeight,
        ltpEvents:  record.ltpEvents,
        ltdEvents:  record.ltdEvents,
      },
    };
  }

  /**
   * Return protocol health metrics.
   * @returns {object}
   */
  getMetrics() {
    const all          = [...this.callers.values()];
    const intelligence = all.filter(c => c.interfaceType === INTERFACE_TYPES.INTELLIGENCE);
    const machines     = all.filter(c => c.interfaceType === INTERFACE_TYPES.MACHINE);
    const avgWeight    = all.length > 0
      ? all.reduce((s, c) => s + c.coreWeight, 0) / all.length
      : 0;
    return {
      registeredCallers:      all.length,
      activeCallers:          all.filter(c => !c.revoked).length,
      intelligenceCallers:    intelligence.length,
      machineCallers:         machines.length,
      windowMs:               WINDOW_MS,
      machineTokenWindowMs:   MACHINE_TOKEN_WINDOW_MS,
      threshold:              this.threshold,
      baseThreshold:          this._baseThreshold,
      defensiveMode:          this._defensiveMode,
      dimensions:             this.dimensions,
      hebbian: {
        avgCoreWeight: avgWeight,
        recentDenyRate: this._recentOutcomes.length > 0
          ? this._recentOutcomes.filter(o => o === 'denied').length / this._recentOutcomes.length
          : 0,
      },
      ...this.stats,
    };
  }

  _log(entry) {
    this.accessLog.push(entry);
    if (this.accessLog.length > 500) this.accessLog.shift();
  }
}

export {
  GeometricKeyProtocol,
  INTERFACE_TYPES,
  KEY_STATES,
  ACCESS,
  WINDOW_MS,
  MACHINE_TOKEN_WINDOW_MS,
  EMERGENCE_THRESHOLD,
  DEFENSIVE_THRESHOLD,
  DEFAULT_DIMENSIONS,
  LTP_RATE,
  LTD_RATE,
  derivePhaseVector,
  orderParameter,
  currentWindow,
};
export default GeometricKeyProtocol;
