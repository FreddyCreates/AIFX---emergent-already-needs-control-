import crypto from 'node:crypto';

const PHI = 1.618033988749;

/**
 * SpatialMemoryStore — persists values at five-axis coordinates
 * (θ, φ, ρ, ring, beat) and retrieves them by key or coordinate slice.
 */
export class SpatialMemoryStore {
  /**
   * @param {object} [config]
   * @param {number} [config.ringCount=7]    — number of concentric rings
   * @param {number} [config.beatResolution=64] — temporal beat slots per ring
   * @param {number} [config.phiBase=1.618033988749] — golden-ratio base constant
   */
  constructor(config = {}) {
    this.ringCount = config.ringCount ?? 7;
    this.beatResolution = config.beatResolution ?? 64;
    this.phiBase = config.phiBase ?? PHI;

    /** @type {Map<string, object>} */
    this._records = new Map();
  }

  /**
   * Store a value at the given spatial coordinates.
   * @param {string} key — unique memory key
   * @param {*} value — payload to store
   * @param {{theta: number, phi: number, rho: number, ring: number, beat: number}} coordinates
   * @returns {{id: string, key: string, timestamp: number, coordinates: object, hash: string}}
   */
  store(key, value, coordinates) {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const hash = this._hash(key, value, coordinates, timestamp);

    const record = {
      id,
      key,
      value,
      timestamp,
      coordinates: { ...coordinates },
      hash,
    };

    this._records.set(key, record);
    return { id: record.id, key, timestamp, coordinates: record.coordinates, hash };
  }

  /**
   * Retrieve a stored memory by key.
   * @param {string} key
   * @returns {object|undefined}
   */
  retrieve(key) {
    const record = this._records.get(key);
    if (!record) return undefined;
    return { ...record };
  }

  /**
   * List all memory records on a given ring.
   * @param {number} ring
   * @returns {object[]}
   */
  listByRing(ring) {
    const results = [];
    for (const record of this._records.values()) {
      if (record.coordinates.ring === ring) {
        results.push({ ...record });
      }
    }
    return results;
  }

  /**
   * List all memory records at a given beat.
   * @param {number} beat
   * @returns {object[]}
   */
  listByBeat(beat) {
    const results = [];
    for (const record of this._records.values()) {
      if (record.coordinates.beat === beat) {
        results.push({ ...record });
      }
    }
    return results;
  }

  /* ---- internal helpers ---- */

  /**
   * Produce a deterministic hex hash for a memory record.
   * @private
   */
  _hash(key, value, coordinates, timestamp) {
    const payload = JSON.stringify({ key, value, coordinates, timestamp });
    let h = 0;
    for (let i = 0; i < payload.length; i++) {
      h = ((h << 5) - h + payload.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }
}

export default SpatialMemoryStore;
