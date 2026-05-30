import crypto from 'node:crypto';

/**
 * @typedef {'temperature' | 'network' | 'resource' | 'signal' | 'custom'} SensorType
 */

/**
 * @typedef {Object} SensorConfig
 * @property {string} [unit=''] - Measurement unit (e.g., '°C', 'ms', '%')
 * @property {number} [pollIntervalMs=0] - Auto-poll interval (0 = manual read only)
 * @property {function} [readFn] - Custom read function returning a numeric value
 * @property {number} [baseline=0] - Baseline calibration offset
 */

/**
 * @typedef {Object} SensorRecord
 * @property {string} sensorId
 * @property {SensorType} type
 * @property {SensorConfig} config
 * @property {number} lastReading
 * @property {number} lastReadTimestamp
 * @property {number|null} pollIntervalId
 * @property {Array<{threshold: number, direction: string, callback: function}>} thresholds
 */

/**
 * EdgeSensor — peripheral sensing for the organism runtime.
 *
 * Registers sensors of various types, reads values, monitors thresholds,
 * and supports calibration adjustments.
 */
export class EdgeSensor {
  /** @type {Map<string, SensorRecord>} */
  #sensors;

  constructor() {
    this.#sensors = new Map();
  }

  /**
   * Registers a new sensor.
   * @param {string} sensorId - Unique sensor identifier
   * @param {SensorType} type - Sensor type
   * @param {SensorConfig} [config={}]
   */
  registerSensor(sensorId, type, config = {}) {
    const validTypes = ['temperature', 'network', 'resource', 'signal', 'custom'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid sensor type: "${type}". Valid types: ${validTypes.join(', ')}`);
    }
    if (this.#sensors.has(sensorId)) {
      throw new Error(`Sensor "${sensorId}" is already registered`);
    }

    const readFn = config.readFn ?? (() => this.#defaultRead(type));
    const baseline = config.baseline ?? 0;

    /** @type {SensorRecord} */
    const sensor = {
      sensorId,
      type,
      config: {
        unit: config.unit ?? '',
        pollIntervalMs: config.pollIntervalMs ?? 0,
        readFn,
        baseline,
      },
      lastReading: 0,
      lastReadTimestamp: 0,
      pollIntervalId: null,
      thresholds: [],
    };

    if (sensor.config.pollIntervalMs > 0) {
      sensor.pollIntervalId = setInterval(() => {
        this.read(sensorId);
      }, sensor.config.pollIntervalMs);
    }

    this.#sensors.set(sensorId, sensor);
  }

  /**
   * Reads the current value from a sensor, applies calibration, checks thresholds.
   * @param {string} sensorId
   * @returns {{sensorId: string, type: SensorType, value: number, unit: string, timestamp: number, readingId: string}}
   */
  read(sensorId) {
    const sensor = this.#sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor "${sensorId}" not found`);
    }

    const rawValue = sensor.config.readFn();
    const calibratedValue = rawValue + sensor.config.baseline;
    const previousReading = sensor.lastReading;
    sensor.lastReading = calibratedValue;
    sensor.lastReadTimestamp = Date.now();

    for (const th of sensor.thresholds) {
      const crossed =
        (th.direction === 'above' && previousReading <= th.threshold && calibratedValue > th.threshold) ||
        (th.direction === 'below' && previousReading >= th.threshold && calibratedValue < th.threshold) ||
        (th.direction === 'cross' && (
          (previousReading <= th.threshold && calibratedValue > th.threshold) ||
          (previousReading >= th.threshold && calibratedValue < th.threshold)
        ));

      if (crossed) {
        try {
          th.callback({
            sensorId,
            threshold: th.threshold,
            direction: th.direction,
            previousValue: previousReading,
            currentValue: calibratedValue,
            timestamp: sensor.lastReadTimestamp,
          });
        } catch (err) {
          console.error(`[EdgeSensor] Threshold callback error for sensor "${sensorId}":`, err);
        }
      }
    }

    return {
      sensorId,
      type: sensor.type,
      value: calibratedValue,
      unit: sensor.config.unit,
      timestamp: sensor.lastReadTimestamp,
      readingId: crypto.randomUUID(),
    };
  }

  /**
   * Reads all registered sensors and returns their current values.
   * @returns {Array<{sensorId: string, type: SensorType, value: number, unit: string, timestamp: number, readingId: string}>}
   */
  readAll() {
    const readings = [];
    for (const sensorId of this.#sensors.keys()) {
      readings.push(this.read(sensorId));
    }
    return readings;
  }

  /**
   * Registers a threshold callback for a sensor.
   * @param {string} sensorId
   * @param {number|{value: number, direction?: string}} threshold - Numeric threshold or config object
   * @param {function} callback - Fires when reading crosses the threshold
   * @returns {function} Unsubscribe function
   */
  onThreshold(sensorId, threshold, callback) {
    const sensor = this.#sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor "${sensorId}" not found`);
    }
    if (typeof callback !== 'function') {
      throw new TypeError('Threshold callback must be a function');
    }

    const thresholdValue = typeof threshold === 'number' ? threshold : threshold.value;
    const direction = typeof threshold === 'number' ? 'cross' : (threshold.direction ?? 'cross');

    const entry = { threshold: thresholdValue, direction, callback };
    sensor.thresholds.push(entry);

    return () => {
      const idx = sensor.thresholds.indexOf(entry);
      if (idx !== -1) sensor.thresholds.splice(idx, 1);
    };
  }

  /**
   * Adjusts a sensor's calibration baseline.
   * @param {string} sensorId
   * @param {{baseline?: number, reset?: boolean}} calibrationData
   */
  calibrate(sensorId, calibrationData) {
    const sensor = this.#sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor "${sensorId}" not found`);
    }

    if (calibrationData.reset) {
      sensor.config.baseline = 0;
    } else if (typeof calibrationData.baseline === 'number') {
      sensor.config.baseline = calibrationData.baseline;
    }
  }

  /**
   * Provides a default simulated reading based on sensor type.
   * @param {SensorType} type
   * @returns {number}
   */
  #defaultRead(type) {
    switch (type) {
      case 'temperature':
        return 20 + Math.random() * 15; // 20–35 range
      case 'network':
        return Math.random() * 100; // 0–100 ms latency
      case 'resource':
        return Math.random() * 100; // 0–100% utilization
      case 'signal':
        return -100 + Math.random() * 60; // -100 to -40 dBm
      case 'custom':
      default:
        return Math.random();
    }
  }

  /**
   * Unregisters a sensor and clears its polling interval.
   * @param {string} sensorId
   */
  unregisterSensor(sensorId) {
    const sensor = this.#sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor "${sensorId}" not found`);
    }
    if (sensor.pollIntervalId !== null) {
      clearInterval(sensor.pollIntervalId);
    }
    this.#sensors.delete(sensorId);
  }

  /**
   * Cleans up all sensors and intervals.
   */
  destroy() {
    for (const sensor of this.#sensors.values()) {
      if (sensor.pollIntervalId !== null) {
        clearInterval(sensor.pollIntervalId);
      }
    }
    this.#sensors.clear();
  }
}

export default EdgeSensor;
