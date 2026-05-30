/**
 * BidirectionalRelay — bridges the organism's ArmExecutor with the
 * Signal Relay Adapter (EXT-040) for two-way communication.
 *
 * Inbound  (sensory):  extensions → organism (signal capture + relay)
 * Outbound (motor):    organism → extensions (command dispatch)
 *
 * The organism sends motor commands through `dispatch()`.
 * Extensions acknowledge with results that feed back into the intelligence loop.
 * This completes the embodiment: extensions ARE the organism's arms.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

/**
 * @typedef {Object} OutboundCommand
 * @property {string} target - Extension slug to command
 * @property {'motor'|'query'|'reason'|'configure'|'heartbeat'} type - Command type
 * @property {string} intent - What the organism wants
 * @property {Object} payload - Data to send
 * @property {number} [urgency=1] - Priority multiplier
 */

/**
 * @typedef {Object} InboundSignal
 * @property {string} source - Extension that generated the signal
 * @property {'threat'|'memory'|'route'|'context'|'data'|'heartbeat'|'emergence'} type
 * @property {Object} payload - Signal data
 * @property {number} priority - Signal priority
 */

/**
 * @typedef {Object} RelayStats
 * @property {number} inboundCount - Total inbound signals received
 * @property {number} outboundCount - Total outbound commands dispatched
 * @property {number} acknowledgedCount - Commands that received responses
 * @property {number} avgRoundTripMs - Average command round-trip time
 * @property {number} phiEfficiency - Overall relay efficiency (0-1)
 */

export class BidirectionalRelay {
  /** @type {import('./arm-executor.js').ArmExecutor} */
  #executor;

  /** @type {Map<string, function>} */
  #signalHandlers;

  /** @type {OutboundCommand[]} */
  #outboundLog;

  /** @type {InboundSignal[]} */
  #inboundLog;

  /** @type {number} */
  #inboundCount;

  /** @type {number} */
  #outboundCount;

  /** @type {number} */
  #acknowledgedCount;

  /** @type {number} */
  #totalRoundTripMs;

  /** @type {number} */
  #maxLogSize;

  /**
   * @param {import('./arm-executor.js').ArmExecutor} executor
   * @param {Object} [options]
   * @param {number} [options.maxLogSize=200]
   */
  constructor(executor, options = {}) {
    this.#executor = executor;
    this.#signalHandlers = new Map();
    this.#outboundLog = [];
    this.#inboundLog = [];
    this.#inboundCount = 0;
    this.#outboundCount = 0;
    this.#acknowledgedCount = 0;
    this.#totalRoundTripMs = 0;
    this.#maxLogSize = options.maxLogSize ?? 200;
  }

  /**
   * Dispatch a motor command to an extension arm (outbound).
   * The organism reaches out through the relay.
   * @param {OutboundCommand} command
   * @returns {Object} Dispatch confirmation
   */
  dispatch(command) {
    this.#outboundCount++;

    const entry = {
      id: `cmd-${Date.now().toString(36)}-${this.#outboundCount}`,
      target: command.target,
      type: command.type || 'motor',
      intent: command.intent || 'act',
      payload: command.payload || {},
      urgency: command.urgency || 1,
      phiWeight: Math.pow(PHI, (command.urgency || 1) * 2),
      dispatchedAt: Date.now(),
      acknowledged: false,
    };

    this.#outboundLog.push(entry);
    if (this.#outboundLog.length > this.#maxLogSize) {
      this.#outboundLog.shift();
    }

    return {
      commandId: entry.id,
      target: entry.target,
      phiWeight: Math.round(entry.phiWeight * 1000) / 1000,
      dispatched: true,
    };
  }

  /**
   * Dispatch a motor command and execute through the ArmExecutor.
   * This is the full path: organism decides → relay dispatches → arm executes.
   * @param {OutboundCommand} command
   * @returns {Promise<Object>} Arm execution result
   */
  async dispatchAndExecute(command) {
    const dispatch = this.dispatch(command);

    const result = await this.#executor.reach({
      targetArm: command.target,
      intent: command.intent || 'act',
      payload: command.payload || {},
      urgency: command.urgency || 1,
    });

    // Auto-acknowledge with the arm result
    this.acknowledge(dispatch.commandId, result);

    return {
      ...dispatch,
      result,
      roundTripMs: result.duration,
    };
  }

  /**
   * Dispatch multiple motor commands and execute them all.
   * @param {OutboundCommand[]} commands
   * @returns {Promise<Object[]>}
   */
  async dispatchAndExecuteAll(commands) {
    return Promise.all(commands.map(cmd => this.dispatchAndExecute(cmd)));
  }

  /**
   * Receive an inbound signal from an extension (sensory input).
   * @param {InboundSignal} signal
   */
  receiveSignal(signal) {
    this.#inboundCount++;

    const entry = {
      id: `sig-${Date.now().toString(36)}-${this.#inboundCount}`,
      source: signal.source,
      type: signal.type || 'data',
      payload: signal.payload || {},
      priority: signal.priority || 0.5,
      receivedAt: Date.now(),
    };

    this.#inboundLog.push(entry);
    if (this.#inboundLog.length > this.#maxLogSize) {
      this.#inboundLog.shift();
    }

    // Notify registered signal handlers
    const handler = this.#signalHandlers.get(signal.type) || this.#signalHandlers.get('*');
    if (handler) {
      handler(entry);
    }

    return entry;
  }

  /**
   * Register a handler for a specific signal type.
   * @param {string} type - Signal type (or '*' for all)
   * @param {function} handler - Receives the signal entry
   */
  onSignal(type, handler) {
    this.#signalHandlers.set(type, handler);
  }

  /**
   * Acknowledge an outbound command with a result.
   * @param {string} commandId
   * @param {Object} result
   */
  acknowledge(commandId, result) {
    const cmd = this.#outboundLog.find(c => c.id === commandId);
    if (!cmd) return;

    cmd.acknowledged = true;
    cmd.acknowledgedAt = Date.now();
    cmd.result = result;
    cmd.roundTripMs = cmd.acknowledgedAt - cmd.dispatchedAt;

    this.#acknowledgedCount++;
    this.#totalRoundTripMs += cmd.roundTripMs;
  }

  /**
   * Get relay statistics.
   * @returns {RelayStats}
   */
  getStats() {
    const avgRoundTripMs = this.#acknowledgedCount > 0
      ? this.#totalRoundTripMs / this.#acknowledgedCount
      : 0;

    const phiEfficiency = avgRoundTripMs > 0
      ? Math.max(0, 1 - (avgRoundTripMs / (HEARTBEAT_MS * PHI)))
      : 1;

    return {
      inboundCount: this.#inboundCount,
      outboundCount: this.#outboundCount,
      acknowledgedCount: this.#acknowledgedCount,
      avgRoundTripMs: Math.round(avgRoundTripMs),
      phiEfficiency: Math.round(phiEfficiency * 1000) / 1000,
    };
  }

  /**
   * Get recent outbound log.
   * @param {number} [limit=20]
   * @returns {Object[]}
   */
  getOutboundLog(limit = 20) {
    return this.#outboundLog.slice(-limit);
  }

  /**
   * Get recent inbound log.
   * @param {number} [limit=20]
   * @returns {Object[]}
   */
  getInboundLog(limit = 20) {
    return this.#inboundLog.slice(-limit);
  }

  /**
   * Get pending (unacknowledged) outbound commands.
   * @returns {Object[]}
   */
  getPendingOutbound() {
    return this.#outboundLog.filter(c => !c.acknowledged);
  }
}

export default BidirectionalRelay;
