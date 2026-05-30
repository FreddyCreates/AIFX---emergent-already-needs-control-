import crypto from 'node:crypto';

/**
 * @typedef {'cognitive' | 'affective' | 'somatic' | 'sovereign'} RegisterName
 */

/**
 * @typedef {Object} CognitiveRegister
 * @property {string|null} reasoning - Current reasoning state
 * @property {string|null} planning - Current planning state
 * @property {string|null} analysis - Current analysis state
 */

/**
 * @typedef {Object} AffectiveRegister
 * @property {string|null} emotion - Current emotion
 * @property {string|null} mood - Current mood
 * @property {string|null} sentiment - Current sentiment
 */

/**
 * @typedef {Object} SomaticRegister
 * @property {string|null} body - Body/hardware state
 * @property {string|null} resources - Resource metrics
 */

/**
 * @typedef {Object} SovereignRegister
 * @property {string|null} identity - Identity state
 * @property {string|null} doctrine - Doctrine state
 * @property {string|null} governance - Governance state
 */

/**
 * @typedef {Object} StateSnapshot
 * @property {string} snapshotId
 * @property {number} timestamp
 * @property {CognitiveRegister} cognitive
 * @property {AffectiveRegister} affective
 * @property {SomaticRegister} somatic
 * @property {SovereignRegister} sovereign
 */

/**
 * OrganismState — 4-register architecture for organism state management.
 *
 * Registers: Cognitive, Affective, Somatic, Sovereign.
 * Provides immutable snapshots, diffs, and event-driven change listeners.
 */
export class OrganismState {
  /** @type {Map<RegisterName, Record<string, unknown>>} */
  #registers;

  /** @type {Map<RegisterName, Array<function>>} */
  #listeners;

  constructor() {
    this.#registers = new Map([
      ['cognitive', { reasoning: null, planning: null, analysis: null }],
      ['affective', { emotion: null, mood: null, sentiment: null }],
      ['somatic', { body: null, resources: null }],
      ['sovereign', { identity: null, doctrine: null, governance: null }],
    ]);

    this.#listeners = new Map([
      ['cognitive', []],
      ['affective', []],
      ['somatic', []],
      ['sovereign', []],
    ]);
  }

  /**
   * Returns a deep clone of the specified register's state.
   * @param {RegisterName} name
   * @returns {Record<string, unknown>}
   */
  getRegister(name) {
    const register = this.#registers.get(name);
    if (!register) {
      throw new Error(`Unknown register: "${name}". Valid registers: cognitive, affective, somatic, sovereign`);
    }
    return structuredClone(register);
  }

  /**
   * Updates a single field within a register and notifies listeners.
   * @param {RegisterName} name
   * @param {string} key
   * @param {unknown} value
   */
  setRegister(name, key, value) {
    const register = this.#registers.get(name);
    if (!register) {
      throw new Error(`Unknown register: "${name}". Valid registers: cognitive, affective, somatic, sovereign`);
    }

    const previousValue = register[key];
    register[key] = value;

    const listeners = this.#listeners.get(name);
    for (const callback of listeners) {
      callback({
        register: name,
        key,
        previousValue,
        newValue: value,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Returns an immutable deep-frozen snapshot of all 4 registers.
   * @returns {StateSnapshot}
   */
  snapshot() {
    const snap = {
      snapshotId: crypto.randomUUID(),
      timestamp: Date.now(),
      cognitive: structuredClone(this.#registers.get('cognitive')),
      affective: structuredClone(this.#registers.get('affective')),
      somatic: structuredClone(this.#registers.get('somatic')),
      sovereign: structuredClone(this.#registers.get('sovereign')),
    };

    return Object.freeze(snap);
  }

  /**
   * Computes the diff between two state snapshots.
   * Returns an object keyed by register name, each containing changed fields.
   * @param {StateSnapshot} snapshotA
   * @param {StateSnapshot} snapshotB
   * @returns {Record<RegisterName, Record<string, {before: unknown, after: unknown}>>}
   */
  diff(snapshotA, snapshotB) {
    const registerNames = /** @type {RegisterName[]} */ (['cognitive', 'affective', 'somatic', 'sovereign']);
    const result = {};

    for (const reg of registerNames) {
      const a = snapshotA[reg] || {};
      const b = snapshotB[reg] || {};
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
      const changes = {};

      for (const key of allKeys) {
        const valA = a[key];
        const valB = b[key];
        if (!Object.is(valA, valB)) {
          changes[key] = { before: valA, after: valB };
        }
      }

      if (Object.keys(changes).length > 0) {
        result[reg] = changes;
      }
    }

    return result;
  }

  /**
   * Registers a callback that fires whenever the specified register changes.
   * @param {RegisterName} register
   * @param {function} callback - Receives `{register, key, previousValue, newValue, timestamp}`
   * @returns {function} Unsubscribe function
   */
  onStateChange(register, callback) {
    const listeners = this.#listeners.get(register);
    if (!listeners) {
      throw new Error(`Unknown register: "${register}". Valid registers: cognitive, affective, somatic, sovereign`);
    }

    listeners.push(callback);

    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }
}

export default OrganismState;
