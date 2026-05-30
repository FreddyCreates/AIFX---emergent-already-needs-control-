/**
 * Heartbeat — the organism's 873ms natural pulse.
 *
 * Drives the organism lifecycle by emitting beats at a fixed interval.
 * Each beat carries the current beat number, timestamp, and organism state.
 */
export class Heartbeat {
  /** @type {number} The organism's natural pulse interval in milliseconds */
  static INTERVAL_MS = 873;

  /** @type {number|null} */
  #intervalId;

  /** @type {number} */
  #beatCount;

  /** @type {number|null} */
  #startTime;

  /** @type {Array<function>} */
  #beatListeners;

  /** @type {import('./organism-state.js').OrganismState|null} */
  #organismState;

  /**
   * @param {import('./organism-state.js').OrganismState} [organismState] - Optional OrganismState instance to include in beat payloads
   */
  constructor(organismState = null) {
    this.#intervalId = null;
    this.#beatCount = 0;
    this.#startTime = null;
    this.#beatListeners = [];
    this.#organismState = organismState;
  }

  /**
   * Begins the heartbeat cycle at the 873ms interval.
   * @throws {Error} If heartbeat is already running
   */
  start() {
    if (this.#intervalId !== null) {
      throw new Error('Heartbeat is already running');
    }

    this.#startTime = Date.now();
    this.#beatCount = 0;

    this.#intervalId = setInterval(() => {
      this.#beatCount++;
      const payload = {
        beatNumber: this.#beatCount,
        timestamp: Date.now(),
        organismState: this.#organismState ? this.#organismState.snapshot() : null,
      };

      for (const callback of this.#beatListeners) {
        try {
          callback(payload);
        } catch (err) {
          console.error(`[Heartbeat] Listener error on beat ${this.#beatCount}:`, err);
        }
      }
    }, Heartbeat.INTERVAL_MS);
  }

  /**
   * Stops the heartbeat cycle.
   * @throws {Error} If heartbeat is not running
   */
  stop() {
    if (this.#intervalId === null) {
      throw new Error('Heartbeat is not running');
    }

    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  /**
   * Registers a beat listener.
   * @param {function} callback - Receives `{beatNumber, timestamp, organismState}`
   * @returns {function} Unsubscribe function
   */
  onBeat(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('onBeat callback must be a function');
    }

    this.#beatListeners.push(callback);

    return () => {
      const idx = this.#beatListeners.indexOf(callback);
      if (idx !== -1) this.#beatListeners.splice(idx, 1);
    };
  }

  /**
   * Returns total beats since start.
   * @returns {number}
   */
  getBeatCount() {
    return this.#beatCount;
  }

  /**
   * Returns milliseconds since heartbeat started.
   * @returns {number}
   */
  getUptime() {
    if (this.#startTime === null) return 0;
    return Date.now() - this.#startTime;
  }

  /**
   * Returns true if the heartbeat is currently running.
   * @returns {boolean}
   */
  isAlive() {
    return this.#intervalId !== null;
  }
}

export default Heartbeat;
