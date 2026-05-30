/**
 * @auro/geometry-lock — GeometryLockSDK
 *
 * Callable surface for the Geometric Key Protocol (PROTO-226).
 * Wraps key generation, validation, caller registration, and revocation
 * behind a clean object-oriented API for use by organism infrastructure
 * and external Nova protocol partners.
 *
 * ── Intelligence vs Machine ───────────────────────────────────────────────────
 *
 *   Intelligence Interface:
 *     An AI entity docks into the organism's resonant field.
 *     Uses geometric keys: phi-spiral phase vectors validated by Kuramoto resonance.
 *     Registered via registerIntelligence(). Tokens via generateKey().
 *
 *   Machine Interface:
 *     A script, bot, or service accesses the organism mechanically.
 *     Uses bearer-style machine tokens: HMAC(apiKey, callerId|timestamp|nonce).
 *     Registered via registerMachine(). Tokens via generateMachineToken().
 *
 * Usage (intelligence — organism lock side):
 *   const lock = new GeometryLockSDK();
 *   lock.registerIntelligence('gemini-partner', sharedSecret);
 *   const result = lock.validateKey(incomingToken);
 *   if (result.access === 'granted') { ... }
 *
 * Usage (intelligence — AI partner side):
 *   const sdk = new GeometryLockSDK({ callerId: 'gemini-partner', secret });
 *   const token = sdk.generateKey();   // present with each call
 *
 * Usage (machine):
 *   const lock = new GeometryLockSDK();
 *   lock.registerMachine('ci-bot', apiKey);
 *   const mToken = lock.generateMachineToken('ci-bot', apiKey);
 *   const result = lock.validateMachineToken(mToken);
 */

import {
  GeometricKeyProtocol,
  INTERFACE_TYPES,
  KEY_STATES,
  ACCESS,
  WINDOW_MS,
  MACHINE_TOKEN_WINDOW_MS,
  EMERGENCE_THRESHOLD,
  DEFAULT_DIMENSIONS,
} from '../../../protocols/geometric-key-protocol.js';

class GeometryLockSDK {
  /**
   * @param {object} config
   * @param {string}  [config.callerId]        - Auto-register this caller on construction
   * @param {string}  [config.secret]          - Secret for auto-registered caller
   * @param {string}  [config.interfaceType]   - 'intelligence' or 'machine' (default 'intelligence')
   * @param {number}  [config.dimensions]      - Phase vector dimensions (default 8, intelligence only)
   * @param {number}  [config.windowTolerance] - Accepted window skew (default 1)
   * @param {number}  [config.threshold]       - Resonance threshold (default φ⁻¹)
   */
  constructor(config = {}) {
    this.callerId = config.callerId || null;
    this.secret   = config.secret   || null;

    this._protocol = new GeometricKeyProtocol({
      dimensions:      config.dimensions,
      windowTolerance: config.windowTolerance,
      threshold:       config.threshold,
    });

    // Auto-register if callerId + secret are provided
    if (this.callerId && this.secret) {
      const interfaceType = config.interfaceType || INTERFACE_TYPES.INTELLIGENCE;
      this._protocol.registerCaller(this.callerId, this.secret, {
        label:         config.label || this.callerId,
        interfaceType,
      });
    }
  }

  // ── Intelligence interface ──────────────────────────────────────────────────

  /**
   * Register an AI entity as an intelligence-interface caller.
   * Intelligence callers present geometric keys (phi-spiral phase vectors).
   *
   * @param {string} callerId - AI entity identifier (e.g. 'gemini-partner')
   * @param {string} secret   - Shared secret established out-of-band with the AI
   * @param {object} [opts]   - { dimensions, label }
   * @returns {object}        - Registration receipt
   */
  registerIntelligence(callerId, secret, opts = {}) {
    return this._protocol.registerCaller(callerId, secret, {
      ...opts,
      interfaceType: INTERFACE_TYPES.INTELLIGENCE,
    });
  }

  /**
   * Generate a geometric key token for the current time window.
   * Call this before each outbound request from an AI partner.
   *
   * @param {string} [callerId] - Defaults to this.callerId
   * @param {string} [secret]   - Defaults to this.secret
   * @returns {object} - { callerId, interfaceType, phases, window, signature, generatedAt, windowMs }
   */
  generateKey(callerId, secret) {
    const id  = callerId || this.callerId;
    const sec = secret   || this.secret;
    if (!id || !sec) {
      throw new Error('generateKey requires callerId and secret (pass or set in constructor)');
    }
    return this._protocol.generateKey(id, sec);
  }

  /**
   * Validate an incoming geometric key token (intelligence interface).
   * Returns { access: 'granted'|'denied', callerId, interfaceType, R, Psi, reason? }
   *
   * @param {object} token
   * @returns {object}
   */
  validateKey(token) {
    return this._protocol.validateKey(token);
  }

  // ── Machine interface ───────────────────────────────────────────────────────

  /**
   * Register a mechanical caller (bot, script, service) as a machine-interface caller.
   * Machine callers present bearer-style tokens validated by timestamp freshness.
   *
   * @param {string} callerId - Machine identifier (e.g. 'ci-bot', 'webhook-relay')
   * @param {string} apiKey   - API key established out-of-band
   * @param {object} [opts]   - { label }
   * @returns {object}        - Registration receipt
   */
  registerMachine(callerId, apiKey, opts = {}) {
    return this._protocol.registerCaller(callerId, apiKey, {
      ...opts,
      interfaceType: INTERFACE_TYPES.MACHINE,
    });
  }

  /**
   * Generate a machine token (valid for MACHINE_TOKEN_WINDOW_MS = 30s).
   *
   * @param {string} [callerId] - Defaults to this.callerId
   * @param {string} [apiKey]   - Defaults to this.secret
   * @returns {object} - { callerId, interfaceType, timestamp, nonce, signature, windowMs }
   */
  generateMachineToken(callerId, apiKey) {
    const id  = callerId || this.callerId;
    const key = apiKey   || this.secret;
    if (!id || !key) {
      throw new Error('generateMachineToken requires callerId and apiKey (pass or set in constructor)');
    }
    return this._protocol.generateMachineToken(id, key);
  }

  /**
   * Validate an incoming machine token.
   * Returns { access: 'granted'|'denied', callerId, interfaceType, reason? }
   *
   * @param {object} token
   * @returns {object}
   */
  validateMachineToken(token) {
    return this._protocol.validateMachineToken(token);
  }

  // ── Shared API ──────────────────────────────────────────────────────────────

  /**
   * Register a caller with an explicit interfaceType.
   * Prefer registerIntelligence() or registerMachine() for clarity.
   *
   * @param {string} callerId
   * @param {string} secret
   * @param {object} [opts]
   * @returns {object}
   */
  registerCaller(callerId, secret, opts = {}) {
    return this._protocol.registerCaller(callerId, secret, opts);
  }

  /**
   * Revoke a caller's access (intelligence or machine).
   * @param {string} callerId
   * @param {string} [reason]
   * @returns {object}
   */
  revokeKey(callerId, reason) {
    return this._protocol.revokeCaller(callerId, reason);
  }

  /**
   * Get state for a specific registered caller.
   * @param {string} callerId
   * @returns {object|null}
   */
  getCallerState(callerId) {
    return this._protocol.getCallerState(callerId);
  }

  /**
   * Get lock health metrics (registered callers by type, grant/deny rates, window info).
   * @returns {object}
   */
  getMetrics() {
    return this._protocol.getMetrics();
  }

  /**
   * Return the recent access log (up to 500 entries).
   * @returns {object[]}
   */
  getAccessLog() {
    return [...this._protocol.accessLog];
  }

  // ── Adaptive threshold ──────────────────────────────────────────────────────

  /**
   * Enable or disable defensive mode.
   * In defensive mode the Kuramoto threshold rises to cos(36°) ≈ 0.809,
   * requiring stronger phase coherence from intelligence callers.
   * Defensive mode is also triggered automatically when the rolling deny rate
   * exceeds 50% over the last 10 validations.
   *
   * @param {boolean} active
   */
  setDefensiveMode(active) {
    this._protocol.setDefensiveMode(active);
  }

  /** @returns {boolean} Whether defensive mode is currently active. */
  get defensiveMode() {
    return this._protocol.defensiveMode;
  }
}

export {
  GeometryLockSDK,
  INTERFACE_TYPES,
  KEY_STATES,
  ACCESS,
  WINDOW_MS,
  MACHINE_TOKEN_WINDOW_MS,
  EMERGENCE_THRESHOLD,
  DEFAULT_DIMENSIONS,
};
export default GeometryLockSDK;
