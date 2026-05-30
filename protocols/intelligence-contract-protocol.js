/**
 * PROTO-223: Intelligence Contract Protocol (ICP-2)
 * Active self-executing intelligence contracts — protocols as living agreements.
 *
 * Intelligence contracts are protocols with CONDITIONS, TRIGGERS, and LIFECYCLE
 * states. They watch for conditions in the organism and auto-execute when
 * thresholds are crossed. Unlike passive protocols that are called, intelligence
 * contracts WATCH and ACT autonomously.
 *
 * Contract execution model:
 *   DRAFT → ACTIVE → WATCHING → TRIGGERED → EXECUTING → FULFILLED
 *                                   ↓
 *                                EXPIRED / BREACHED → RENEGOTIATED
 *
 * Contract types:
 *   SERVICE  — provides a continuous service (e.g. "keep memory < 80% capacity")
 *   EXCHANGE — triggers when parties exchange data (e.g. "sync when divergence > φ⁻¹")
 *   SENTINEL — monitors and alerts (e.g. "escalate if health < 50%")
 *   LEARNING — self-modifies based on outcomes (e.g. "increase weight if success > φ")
 *
 * @module protocols/intelligence-contract-protocol
 * @version 1.0.0
 */

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

const CONTRACT_STATES = {
  DRAFT:      'draft',
  ACTIVE:     'active',
  WATCHING:   'watching',
  TRIGGERED:  'triggered',
  EXECUTING:  'executing',
  FULFILLED:  'fulfilled',
  EXPIRED:    'expired',
  BREACHED:   'breached',
  RENEGOTIATED: 'renegotiated',
};

const CONTRACT_TYPES = {
  SERVICE:   'service',
  EXCHANGE:  'exchange',
  SENTINEL:  'sentinel',
  LEARNING:  'learning',
};

class IntelligenceContract {
  constructor({ id, type, parties, conditions, actions, ttl = null }) {
    this.id         = id || `contract-${Date.now().toString(36)}`;
    this.type       = type || CONTRACT_TYPES.SERVICE;
    this.parties    = parties || [];         // Who is bound by this contract
    this.conditions = conditions || [];      // Array of condition functions
    this.actions    = actions || [];         // Array of action functions
    this.ttl        = ttl;                  // Time-to-live in ms (null = eternal)

    this.state      = CONTRACT_STATES.DRAFT;
    this.createdAt  = Date.now();
    this.activatedAt = null;
    this.fulfilledAt = null;
    this.triggerCount = 0;
    this.fulfillCount = 0;
    this.executionLog = [];

    // Self-learning weight (increases when fulfilled, decreases when breached)
    this.weight = PHI_INV;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  /** Activate the contract — moves from DRAFT to ACTIVE */
  activate(context = {}) {
    if (this.state !== CONTRACT_STATES.DRAFT && this.state !== CONTRACT_STATES.RENEGOTIATED) {
      return { activated: false, reason: `Cannot activate from state: ${this.state}` };
    }
    this.state       = CONTRACT_STATES.ACTIVE;
    this.activatedAt = Date.now();
    this._log('activated', context);
    return { activated: true, id: this.id, type: this.type };
  }

  /** Transition to WATCHING state (sync convenience) */
  watch(context) {
    if (arguments.length === 0 || context === undefined) {
      if (this.state === CONTRACT_STATES.ACTIVE) {
        this.state = CONTRACT_STATES.WATCHING;
        this._log('watching', {});
      }
      return { watching: true, id: this.id };
    }
    return this.watchCycle(context);
  }

  /**
   * Watch cycle — evaluate all conditions. If any condition triggers, execute actions.
   * Call this on every heartbeat tick.
   * @param {object} context - Current organism state for condition evaluation
   */
  async watchCycle(context = {}) {
    if (this.state === CONTRACT_STATES.DRAFT || this.state === CONTRACT_STATES.FULFILLED) return null;

    // Check TTL
    if (this.ttl && (Date.now() - this.activatedAt) > this.ttl) {
      this.state = CONTRACT_STATES.EXPIRED;
      this._log('expired', {});
      return { state: CONTRACT_STATES.EXPIRED, id: this.id };
    }

    this.state = CONTRACT_STATES.WATCHING;

    // Evaluate conditions
    const triggered = [];
    for (const condition of this.conditions) {
      try {
        const result = await condition(context);
        if (result && result.triggered) {
          triggered.push({ condition: condition.name || 'anonymous', ...result });
        }
      } catch (err) {
        this._log('condition-error', { error: err.message });
      }
    }

    if (triggered.length === 0) return { watching: true, id: this.id };

    // Execute actions
    this.state = CONTRACT_STATES.TRIGGERED;
    this.triggerCount++;
    this._log('triggered', { conditions: triggered });

    const actionResults = [];
    this.state = CONTRACT_STATES.EXECUTING;

    for (const action of this.actions) {
      try {
        const result = await action(context, triggered);
        actionResults.push({ action: action.name || 'anonymous', result });
      } catch (err) {
        this._log('action-error', { error: err.message });
        this.state = CONTRACT_STATES.BREACHED;
        this.weight *= PHI_INV;  // Reduce weight on breach
        return { breached: true, id: this.id, error: err.message };
      }
    }

    // Check if contract is fulfilled (SERVICE contracts stay active)
    if (this.type !== CONTRACT_TYPES.SERVICE) {
      this.state       = CONTRACT_STATES.FULFILLED;
      this.fulfilledAt = Date.now();
      this.fulfillCount++;
      this.weight      = Math.min(PHI, this.weight + 0.1);  // Increase weight on success
      this._log('fulfilled', { actions: actionResults });
    } else {
      this.state = CONTRACT_STATES.ACTIVE;
      this.fulfillCount++;
      this.weight = Math.min(PHI, this.weight + 0.05);
      this._log('executed', { actions: actionResults });
    }

    return { executed: true, id: this.id, type: this.type, triggered, actionResults };
  }

  /** Renegotiate — update conditions or actions and reactivate */
  renegotiate(updates = {}) {
    if (updates.conditions) this.conditions = updates.conditions;
    if (updates.actions)    this.actions    = updates.actions;
    if (updates.ttl)        this.ttl        = updates.ttl;
    this.state = CONTRACT_STATES.RENEGOTIATED;
    this._log('renegotiated', updates);
    return this.activate();
  }

  _log(event, data) {
    this.executionLog.push({ event, data, at: Date.now() });
    if (this.executionLog.length > 50) this.executionLog.shift();
  }

  /** Check conditions against context without triggering actions */
  checkConditions(context = {}) {
    const results = this.conditions.map(cond => {
      try { return cond(context); } catch { return false; }
    });
    const allMet = results.every(r => !!r);
    return { allMet, results };
  }

  /** Trigger the contract — moves from WATCHING to TRIGGERED */
  trigger() {
    this.state = CONTRACT_STATES.TRIGGERED;
    this.triggerCount++;
    this._log('triggered', {});
    return { triggered: true, id: this.id };
  }

  /** Execute all actions */
  execute(context = {}) {
    this.state = CONTRACT_STATES.EXECUTING;
    for (const action of this.actions) {
      try { action(context); } catch (err) { this._log('action-error', { error: err.message }); }
    }
    this._log('executed', {});
    return { executed: true, id: this.id };
  }

  /** Fulfill the contract */
  fulfill() {
    this.state = CONTRACT_STATES.FULFILLED;
    this.fulfilledAt = Date.now();
    this.fulfillCount++;
    this.weight = Math.min(PHI, this.weight + 0.1);
    this._log('fulfilled', {});
    return { fulfilled: true, id: this.id };
  }

  /** Breach the contract */
  breach(reason = '') {
    this.state = CONTRACT_STATES.BREACHED;
    this.weight *= PHI_INV;
    this._log('breached', { reason });
    return { breached: true, id: this.id, reason };
  }

  /** Expire the contract */
  expire() {
    this.state = CONTRACT_STATES.EXPIRED;
    this._log('expired', {});
    return { expired: true, id: this.id };
  }

  getState() {
    return {
      id:           this.id,
      type:         this.type,
      state:        this.state,
      parties:      this.parties,
      weight:       this.weight,
      triggerCount: this.triggerCount,
      fulfillCount: this.fulfillCount,
      age:          Date.now() - this.createdAt,
      activatedAt:  this.activatedAt,
      recentLog:    this.executionLog.slice(-5),
    };
  }
}

// ── Intelligence Contract Protocol — manages a registry of contracts ──────────

class IntelligenceContractProtocol {
  constructor() {
    this.contracts = new Map();
    this.active    = new Set();
    this.activeContracts = this.active;  // Alias for tests
    this.watchInterval = null;
    this.ticks     = 0;

    this.stats = {
      totalContracts: 0,
      totalTriggers:  0,
      totalFulfilled: 0,
      totalBreached:  0,
      totalExpired:   0,
    };
  }

  /**
   * Register a new intelligence contract
   */
  register(contractDef) {
    const contract = new IntelligenceContract(contractDef);
    this.contracts.set(contract.id, contract);
    this.stats.totalContracts++;
    return contract;
  }

  /**
   * Activate a contract by ID
   */
  activate(contractId, context = {}) {
    const contract = this.contracts.get(contractId);
    if (!contract) return { error: `Contract not found: ${contractId}` };
    const result = contract.activate(context);
    if (result.activated) this.active.add(contractId);
    return result;
  }

  /**
   * Activate all registered contracts
   */
  activateAll(context = {}) {
    const results = [];
    for (const [id, contract] of this.contracts) {
      const result = contract.activate(context);
      if (result.activated) this.active.add(id);
      results.push(result);
    }
    return results;
  }

  /**
   * Run one watch cycle across all active contracts
   * Call this on each heartbeat
   */
  async watchCycle(context = {}) {
    this.ticks++;
    const results = [];

    for (const contractId of this.active) {
      const contract = this.contracts.get(contractId);
      if (!contract) { this.active.delete(contractId); continue; }

      const result = await contract.watchCycle(context);

      if (result) {
        results.push(result);
        if (result.state === CONTRACT_STATES.EXPIRED) {
          this.active.delete(contractId);
          this.stats.totalExpired++;
        } else if (result.breached) {
          this.stats.totalBreached++;
        } else if (result.executed || result.fulfilled) {
          this.stats.totalTriggers++;
          if (contract.state === CONTRACT_STATES.FULFILLED) {
            this.active.delete(contractId);
            this.stats.totalFulfilled++;
          }
        }
      }
    }

    return { ticks: this.ticks, activeContracts: this.active.size, results };
  }

  /**
   * Start autonomous watch loop (runs every heartbeat)
   * @param {function} contextFn - Function that returns current organism context
   */
  startWatchLoop(contextFn, intervalMs = HEARTBEAT) {
    this.watchInterval = setInterval(async () => {
      const context = typeof contextFn === 'function' ? await contextFn() : {};
      await this.watchCycle(context);
    }, intervalMs);
    return this.watchInterval;
  }

  stopWatchLoop() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
  }

  /**
   * Create a SERVICE contract (pre-built factory)
   */
  createServiceContract({ id, service, parties, condition, action, ttl }) {
    return this.register({
      id,
      type: CONTRACT_TYPES.SERVICE,
      parties: parties || [service],
      conditions: [Object.assign(async (ctx) => ({ triggered: await condition(ctx) }), { name: service })],
      actions: [Object.assign(async (ctx, t) => action(ctx, t), { name: `${service}-action` })],
      ttl,
    });
  }

  /**
   * Create a SENTINEL contract (monitoring/alerting)
   */
  createSentinelContract({ id, name, threshold, metric, onAlert }) {
    return this.register({
      id: id || `sentinel-${name}`,
      type: CONTRACT_TYPES.SENTINEL,
      parties: [name],
      conditions: [Object.assign(async (ctx) => {
        const value = typeof metric === 'function' ? metric(ctx) : ctx[metric];
        return { triggered: value !== undefined && value < threshold, value, threshold };
      }, { name: `${name}-condition` })],
      actions: [Object.assign(async (ctx, triggered) => onAlert({ metric, triggered, ctx }), { name: `${name}-alert` })],
      ttl: null,
    });
  }

  getState() {
    const contractStates = {};
    for (const [id, contract] of this.contracts) {
      contractStates[id] = contract.getState();
    }
    return {
      totalContracts: this.contracts.size,
      activeContracts: this.active.size,
      ticks:  this.ticks,
      stats:  { ...this.stats },
      contracts: contractStates,
    };
  }

  /** Alias: create and register a contract */
  createContract(def) {
    return this.register(def);
  }

  /** Alias: activate a contract by ID */
  activateContract(contractId, context) {
    return this.activate(contractId, context);
  }

  /** Alias: run one watch cycle (sync-friendly wrapper) */
  tick(context = {}) {
    this.ticks++;
    const results = [];
    for (const contractId of this.active) {
      const contract = this.contracts.get(contractId);
      if (!contract) { this.active.delete(contractId); continue; }
      const condResult = contract.checkConditions(context);
      results.push({ id: contractId, ...condResult });
    }
    return { ticks: this.ticks, activeContracts: this.active.size, results };
  }

  /** Return protocol metrics */
  getMetrics() {
    return {
      totalContracts: this.contracts.size,
      contractCount: this.contracts.size,
      activeContracts: this.active.size,
      ticks: this.ticks,
      ...this.stats,
    };
  }
}

export { IntelligenceContractProtocol, IntelligenceContract, CONTRACT_STATES, CONTRACT_TYPES };
export default IntelligenceContractProtocol;
