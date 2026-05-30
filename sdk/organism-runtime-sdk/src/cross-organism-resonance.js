import crypto from 'node:crypto';

/**
 * @typedef {Object} PeerOrganism
 * @property {string} organismId
 * @property {string} endpoint
 * @property {number} registeredAt
 * @property {number|null} lastSignalTimestamp
 * @property {Array<Object>} signalHistory
 */

/**
 * CrossOrganismResonance — cross-organism communication and state synchronization.
 *
 * Allows organisms to discover each other, exchange resonance signals,
 * and synchronize state registers across the network.
 */
export class CrossOrganismResonance {
  /** @type {string} */
  #selfId;

  /** @type {Map<string, PeerOrganism>} */
  #peers;

  /** @type {Array<function>} */
  #resonanceListeners;

  /** @type {import('./organism-state.js').OrganismState|null} */
  #organismState;

  /**
   * @param {string} [selfId] - This organism's identifier
   * @param {import('./organism-state.js').OrganismState} [organismState] - Local state for synchronization
   */
  constructor(selfId = null, organismState = null) {
    this.#selfId = selfId ?? crypto.randomUUID();
    this.#peers = new Map();
    this.#resonanceListeners = [];
    this.#organismState = organismState;
  }

  /**
   * Registers a peer organism for resonance communication.
   * @param {string} organismId - Unique identifier of the peer organism
   * @param {string} endpoint - Communication endpoint (URL, address, or channel)
   */
  registerOrganism(organismId, endpoint) {
    if (this.#peers.has(organismId)) {
      throw new Error(`Organism "${organismId}" is already registered`);
    }

    this.#peers.set(organismId, {
      organismId,
      endpoint,
      registeredAt: Date.now(),
      lastSignalTimestamp: null,
      signalHistory: [],
    });
  }

  /**
   * Sends a resonance signal to a peer organism.
   * @param {string} targetOrganismId
   * @param {Object} signal - The signal payload
   * @returns {{signalId: string, source: string, target: string, timestamp: number, delivered: boolean}}
   */
  resonate(targetOrganismId, signal) {
    const peer = this.#peers.get(targetOrganismId);
    if (!peer) {
      throw new Error(`Organism "${targetOrganismId}" is not registered`);
    }

    const signalId = crypto.randomUUID();
    const timestamp = Date.now();

    const signalEnvelope = {
      signalId,
      source: this.#selfId,
      target: targetOrganismId,
      payload: structuredClone(signal),
      timestamp,
    };

    peer.lastSignalTimestamp = timestamp;
    peer.signalHistory.push(signalEnvelope);

    // Keep only last 100 signals per peer
    if (peer.signalHistory.length > 100) {
      peer.signalHistory = peer.signalHistory.slice(-100);
    }

    return {
      signalId,
      source: this.#selfId,
      target: targetOrganismId,
      timestamp,
      delivered: true,
    };
  }

  /**
   * Listens for incoming resonance signals.
   * @param {function} callback - Receives signal envelope `{signalId, source, target, payload, timestamp}`
   * @returns {function} Unsubscribe function
   */
  onResonance(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('onResonance callback must be a function');
    }

    this.#resonanceListeners.push(callback);

    return () => {
      const idx = this.#resonanceListeners.indexOf(callback);
      if (idx !== -1) this.#resonanceListeners.splice(idx, 1);
    };
  }

  /**
   * Receives an inbound resonance signal (called by transport layer or peer).
   * Dispatches to all registered resonance listeners.
   * @param {Object} signalEnvelope - The incoming signal
   */
  receiveSignal(signalEnvelope) {
    for (const callback of this.#resonanceListeners) {
      try {
        callback(structuredClone(signalEnvelope));
      } catch (err) {
        console.error(`[CrossOrganismResonance] Listener error:`, err);
      }
    }

    // Update peer timestamp if known
    const peer = this.#peers.get(signalEnvelope.source);
    if (peer) {
      peer.lastSignalTimestamp = signalEnvelope.timestamp ?? Date.now();
    }
  }

  /**
   * Synchronizes state registers with a peer organism.
   * Sends this organism's current state snapshot and returns the sync metadata.
   * @param {string} targetOrganismId
   * @returns {{syncId: string, source: string, target: string, timestamp: number, snapshot: Object|null}}
   */
  synchronize(targetOrganismId) {
    const peer = this.#peers.get(targetOrganismId);
    if (!peer) {
      throw new Error(`Organism "${targetOrganismId}" is not registered`);
    }

    const syncId = crypto.randomUUID();
    const timestamp = Date.now();
    const snapshot = this.#organismState ? this.#organismState.snapshot() : null;

    const syncSignal = {
      signalId: syncId,
      source: this.#selfId,
      target: targetOrganismId,
      payload: { type: 'state-sync', snapshot },
      timestamp,
    };

    peer.lastSignalTimestamp = timestamp;
    peer.signalHistory.push(syncSignal);

    if (peer.signalHistory.length > 100) {
      peer.signalHistory = peer.signalHistory.slice(-100);
    }

    return {
      syncId,
      source: this.#selfId,
      target: targetOrganismId,
      timestamp,
      snapshot,
    };
  }

  /**
   * Returns the resonance field: all connected organisms and their last signal timestamps.
   * @returns {Array<{organismId: string, endpoint: string, registeredAt: number, lastSignalTimestamp: number|null, signalCount: number}>}
   */
  getResonanceField() {
    return Array.from(this.#peers.values()).map(peer => ({
      organismId: peer.organismId,
      endpoint: peer.endpoint,
      registeredAt: peer.registeredAt,
      lastSignalTimestamp: peer.lastSignalTimestamp,
      signalCount: peer.signalHistory.length,
    }));
  }

  /**
   * Returns this organism's ID.
   * @returns {string}
   */
  getSelfId() {
    return this.#selfId;
  }

  /**
   * Unregisters a peer organism.
   * @param {string} organismId
   */
  unregisterOrganism(organismId) {
    if (!this.#peers.has(organismId)) {
      throw new Error(`Organism "${organismId}" is not registered`);
    }
    this.#peers.delete(organismId);
  }

  /**
   * Cleans up all peers and listeners.
   */
  destroy() {
    this.#peers.clear();
    this.#resonanceListeners.length = 0;
  }
}

export default CrossOrganismResonance;
