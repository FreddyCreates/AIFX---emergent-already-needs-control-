/**
 * @auro/geometry-lock — GeometryBridge
 *
 * Adapter that gates access to sdk/medina-calls/ behind the Geometric Key Protocol.
 * Enforces the Intelligence vs Machine distinction at the call boundary.
 *
 * ── Two call paths ────────────────────────────────────────────────────────────
 *
 *   Intelligence path  bridge.call(token, callFn, ...args)
 *     For AI entities (Jay's Gemini, Nova partner, etc.).
 *     token must be a geometric key (phi-spiral phase vector, HMAC-signed).
 *     Validated by Kuramoto resonance: R > φ⁻¹ = 0.618 → granted.
 *     This is the sovereign terminal — the AI docks into the organism's field.
 *
 *   Machine path  bridge.callMachine(machineToken, callFn, ...args)
 *     For scripts, bots, and mechanical services.
 *     machineToken must be a bearer-style token (HMAC + timestamp freshness).
 *     No phase resonance — machines are not in phase with the organism.
 *
 *   Auto-dispatch  bridge.dispatch(request, callFn, ...args)
 *     Inspects request.interfaceType (or token shape) and routes automatically.
 *
 * ── EXCHANGE contract (inline PROTO-223 pattern) ─────────────────────────────
 *   condition: caller presents a resonating geometric key (intelligence) OR
 *              a fresh, signed machine token (machine)
 *   action:    forward the call to the target medina-call function
 *
 * Usage:
 *   const bridge = new GeometryBridge({ sentinelAlert: myAlertFn });
 *   bridge.registerIntelligence('gemini-partner', sharedSecret);
 *   bridge.registerMachine('ci-bot', apiKey);
 *
 *   // Intelligence call (AI partner):
 *   const result = await bridge.call(geoToken, callDeployOrganism, config);
 *
 *   // Machine call (bot/script):
 *   const result = await bridge.callMachine(machineToken, callStartHeartbeat, opts);
 *
 *   // Auto-dispatch (unknown caller type):
 *   const result = await bridge.dispatch(anyToken, callFn, ...args);
 */

import { GeometryLockSDK, INTERFACE_TYPES, ACCESS } from './geometry-lock-sdk.js';

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

// EXCHANGE contract state (simplified inline — mirrors PROTO-223 shape)
const CONTRACT_STATE = {
  WATCHING:  'watching',
  TRIGGERED: 'triggered',
  EXECUTING: 'executing',
  FULFILLED: 'fulfilled',
  DENIED:    'denied',
};

class GeometryBridge {
  /**
   * @param {object} config
   * @param {object}   [config.lockConfig]      - Options forwarded to GeometryLockSDK
   * @param {Function} [config.sentinelAlert]   - fn({ callerId, interfaceType, reason, R?, at })
   * @param {Function} [config.onGrant]         - fn({ callerId, interfaceType, R?, callType, at })
   * @param {boolean}  [config.dryRun=false]    - Log only, do not execute calls
   */
  constructor(config = {}) {
    this._lock          = new GeometryLockSDK(config.lockConfig || {});
    this._sentinelAlert = config.sentinelAlert || null;
    this._onGrant       = config.onGrant       || null;
    this.dryRun         = config.dryRun        || false;

    this._callLog   = [];   // recent call events (capped at 200)
    this._contracts = [];   // registered EXCHANGE contracts

    this.stats = {
      totalCalls: 0,
      granted:    0,
      denied:     0,
      byInterface: {
        [INTERFACE_TYPES.INTELLIGENCE]: { totalCalls: 0, granted: 0, denied: 0 },
        [INTERFACE_TYPES.MACHINE]:      { totalCalls: 0, granted: 0, denied: 0 },
      },
    };
  }

  // ── Caller registration ───────────────────────────────────────────────────

  /**
   * Register an AI entity as an intelligence-interface caller.
   * @param {string} callerId - AI entity identifier
   * @param {string} secret   - Shared secret
   * @param {object} [opts]
   */
  registerIntelligence(callerId, secret, opts = {}) {
    return this._lock.registerIntelligence(callerId, secret, opts);
  }

  /**
   * Register a mechanical system as a machine-interface caller.
   * @param {string} callerId - Machine identifier
   * @param {string} apiKey   - API key
   * @param {object} [opts]
   */
  registerMachine(callerId, apiKey, opts = {}) {
    return this._lock.registerMachine(callerId, apiKey, opts);
  }

  /** Register a caller with explicit interfaceType (prefer registerIntelligence/registerMachine). */
  registerCaller(callerId, secret, opts = {}) {
    return this._lock.registerCaller(callerId, secret, opts);
  }

  revokeKey(callerId, reason) {
    return this._lock.revokeKey(callerId, reason);
  }

  getCallerState(callerId) {
    return this._lock.getCallerState(callerId);
  }

  // ── Exchange contract registration ────────────────────────────────────────

  /**
   * Register an EXCHANGE intelligence contract that binds a caller to a
   * specific medina-call function.  When the caller presents a valid token,
   * the contract is fulfilled and the target function is invoked.
   *
   * @param {object} contractDef
   * @param {string}   contractDef.callerId  - Caller this contract is bound to
   * @param {string}   contractDef.id        - Unique contract id
   * @param {Function} contractDef.target    - medina-call fn to invoke on fulfillment
   * @param {string}   [contractDef.label]   - Human-readable description
   * @returns {object}
   */
  registerContract({ callerId, id, target, label = '' }) {
    if (typeof target !== 'function') {
      throw new Error('contract target must be a function');
    }
    const contract = {
      id:       id || `exchange-${callerId}-${Date.now().toString(36)}`,
      callerId,
      target,
      label,
      state:        CONTRACT_STATE.WATCHING,
      weight:       PHI_INV,
      fulfillCount: 0,
      denyCount:    0,
      createdAt:    Date.now(),
    };
    this._contracts.push(contract);
    return contract;
  }

  // ── Intelligence call path ────────────────────────────────────────────────

  /**
   * Execute a medina-call via the intelligence interface.
   * The AI partner must present a valid geometric key token.
   *
   * @param {object}   token  - Geometric key token (phase vector + signature)
   * @param {Function} callFn - medina-call function to execute on grant
   * @param {...*}     args   - Arguments forwarded to callFn
   * @returns {Promise<object>}
   */
  async call(token, callFn, ...args) {
    return this._execute(INTERFACE_TYPES.INTELLIGENCE, token, callFn, args);
  }

  // ── Machine call path ─────────────────────────────────────────────────────

  /**
   * Execute a medina-call via the machine interface.
   * The mechanical system must present a valid machine token (HMAC + timestamp).
   *
   * @param {object}   machineToken - Machine token (timestamp + nonce + signature)
   * @param {Function} callFn       - medina-call function to execute on grant
   * @param {...*}     args         - Arguments forwarded to callFn
   * @returns {Promise<object>}
   */
  async callMachine(machineToken, callFn, ...args) {
    return this._execute(INTERFACE_TYPES.MACHINE, machineToken, callFn, args);
  }

  // ── Auto-dispatch ─────────────────────────────────────────────────────────

  /**
   * Automatically route a call to the correct interface path.
   * Routing logic (in order):
   *   1. token.interfaceType === 'intelligence' → call()
   *   2. token.interfaceType === 'machine'      → callMachine()
   *   3. token.phases is an array               → inferred intelligence → call()
   *   4. token.timestamp is a number            → inferred machine → callMachine()
   *   5. Default: intelligence
   *
   * @param {object}   request - Token (intelligence or machine)
   * @param {Function} callFn  - medina-call function
   * @param {...*}     args
   * @returns {Promise<object>}
   */
  async dispatch(request, callFn, ...args) {
    const type = request?.interfaceType
      || (Array.isArray(request?.phases)            ? INTERFACE_TYPES.INTELLIGENCE
        : typeof request?.timestamp === 'number'    ? INTERFACE_TYPES.MACHINE
        : INTERFACE_TYPES.INTELLIGENCE);

    if (type === INTERFACE_TYPES.MACHINE) {
      return this.callMachine(request, callFn, ...args);
    }
    return this.call(request, callFn, ...args);
  }

  // ── Shared execution engine ───────────────────────────────────────────────

  async _execute(interfaceType, token, callFn, args) {
    this.stats.totalCalls++;
    this.stats.byInterface[interfaceType].totalCalls++;
    const now = Date.now();

    if (typeof callFn !== 'function') {
      throw new Error('callFn must be a callable medina-call function');
    }

    const validation = interfaceType === INTERFACE_TYPES.INTELLIGENCE
      ? this._lock.validateKey(token)
      : this._lock.validateMachineToken(token);

    if (validation.access === ACCESS.DENIED) {
      this.stats.denied++;
      this.stats.byInterface[interfaceType].denied++;
      this._logCall({
        event:         'denied',
        interfaceType,
        callerId:      token?.callerId,
        reason:        validation.reason,
        R:             validation.R,
        at:            now,
      });

      if (this._sentinelAlert) {
        this._sentinelAlert({
          callerId:      token?.callerId,
          interfaceType,
          reason:        validation.reason,
          R:             validation.R,
          at:            now,
        });
      }

      for (const c of this._contracts) {
        if (c.callerId === token?.callerId) {
          c.state = CONTRACT_STATE.DENIED;
          c.denyCount++;
          c.weight = Math.max(0.01, c.weight * PHI_INV);
        }
      }

      return {
        access:  ACCESS.DENIED,
        denial:  {
          callerId:      token?.callerId,
          interfaceType,
          reason:        validation.reason,
          R:             validation.R,
        },
      };
    }

    // Access granted
    this.stats.granted++;
    this.stats.byInterface[interfaceType].granted++;

    for (const c of this._contracts) {
      if (c.callerId === token.callerId && c.target === callFn) {
        c.state = CONTRACT_STATE.EXECUTING;
      }
    }

    if (this._onGrant) {
      this._onGrant({
        callerId:      token.callerId,
        interfaceType,
        R:             validation.R,
        callType:      callFn.name || 'unknown',
        at:            now,
      });
    }

    let result;
    if (this.dryRun) {
      result = { dryRun: true, callType: callFn.name, args };
    } else {
      result = await callFn(...args);
    }

    for (const c of this._contracts) {
      if (c.callerId === token.callerId && c.target === callFn) {
        c.state       = CONTRACT_STATE.FULFILLED;
        c.fulfillCount++;
        c.weight      = Math.min(PHI, c.weight + 0.05);
      }
    }

    const executedAt = Date.now();
    this._logCall({
      event:         'granted',
      interfaceType,
      callerId:      token.callerId,
      R:             validation.R,
      callType:      callFn.name || 'unknown',
      durationMs:    executedAt - now,
      at:            executedAt,
    });

    return {
      access:        ACCESS.GRANTED,
      callerId:      token.callerId,
      interfaceType,
      R:             validation.R,
      result,
      _meta: {
        callType:     callFn.name || 'unknown',
        interfaceType,
        executedAt,
        durationMs:   executedAt - now,
        phiTimestamp: executedAt * PHI_INV,
      },
    };
  }

  // ── Introspection ─────────────────────────────────────────────────────────

  /**
   * Bridge health metrics split by interface type.
   * @returns {object}
   */
  getMetrics() {
    const intlStats = this.stats.byInterface[INTERFACE_TYPES.INTELLIGENCE];
    const machStats = this.stats.byInterface[INTERFACE_TYPES.MACHINE];
    return {
      totalCalls:  this.stats.totalCalls,
      granted:     this.stats.granted,
      denied:      this.stats.denied,
      grantRate:   this.stats.totalCalls > 0 ? this.stats.granted / this.stats.totalCalls : 0,
      denyRate:    this.stats.totalCalls > 0 ? this.stats.denied  / this.stats.totalCalls : 0,
      byInterface: {
        intelligence: {
          ...intlStats,
          grantRate: intlStats.totalCalls > 0 ? intlStats.granted / intlStats.totalCalls : 0,
        },
        machine: {
          ...machStats,
          grantRate: machStats.totalCalls > 0 ? machStats.granted / machStats.totalCalls : 0,
        },
      },
      activeContracts: this._contracts.filter(c => c.state === CONTRACT_STATE.WATCHING).length,
      lock: this._lock.getMetrics(),
    };
  }

  getCallLog() {
    return [...this._callLog];
  }

  getContracts() {
    return this._contracts.map(c => ({
      id:           c.id,
      callerId:     c.callerId,
      label:        c.label,
      state:        c.state,
      weight:       c.weight,
      fulfillCount: c.fulfillCount,
      denyCount:    c.denyCount,
    }));
  }

  _logCall(entry) {
    this._callLog.push(entry);
    if (this._callLog.length > 200) this._callLog.shift();
  }
}

export { GeometryBridge, CONTRACT_STATE, INTERFACE_TYPES };
export default GeometryBridge;
