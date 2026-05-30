/**
 * PROTO-212: Edge Sensor Protocol (ESP)
 * Real-time environmental sensing with phi-weighted thresholds.
 * 
 * Sensor types: temperature, network, resource, signal, custom
 * Each sensor polls on heartbeat intervals and reports anomalies.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const SENSOR_TYPES = ['temperature', 'network', 'resource', 'signal', 'custom'];

class EdgeSensorProtocol {
  constructor() {
    this.sensors = new Map();
    this.readings = new Map();
    this.anomalies = [];
    this.totalReadings = 0;
  }

  registerSensor(config, pollFn) {
    const sensor = {
      id: config.id,
      name: config.name || config.id,
      type: config.type || 'custom',
      pollIntervalMs: config.pollIntervalMs || HEARTBEAT,
      thresholdMin: config.thresholdMin ?? 0,
      thresholdMax: config.thresholdMax ?? 100,
      calibrationOffset: config.calibrationOffset || 0,
      pollFn,
      lastPoll: null,
      pollCount: 0,
      anomalyCount: 0,
      intervalId: null,
    };
    
    this.sensors.set(config.id, sensor);
    this.readings.set(config.id, []);
    
    return config.id;
  }

  startPolling(sensorId) {
    const sensor = this.sensors.get(sensorId);
    if (!sensor || sensor.intervalId) return;
    
    sensor.intervalId = setInterval(async () => {
      await this.poll(sensorId);
    }, sensor.pollIntervalMs);
  }

  stopPolling(sensorId) {
    const sensor = this.sensors.get(sensorId);
    if (!sensor || !sensor.intervalId) return;
    
    clearInterval(sensor.intervalId);
    sensor.intervalId = null;
  }

  startAllPolling() {
    for (const sensorId of this.sensors.keys()) {
      this.startPolling(sensorId);
    }
  }

  stopAllPolling() {
    for (const sensorId of this.sensors.keys()) {
      this.stopPolling(sensorId);
    }
  }

  async poll(sensorId) {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return null;
    
    try {
      let value = await sensor.pollFn();
      value += sensor.calibrationOffset;
      
      const reading = {
        sensorId,
        value,
        timestamp: Date.now(),
        inRange: value >= sensor.thresholdMin && value <= sensor.thresholdMax,
      };
      
      sensor.lastPoll = Date.now();
      sensor.pollCount++;
      this.totalReadings++;
      
      // Store reading
      const history = this.readings.get(sensorId);
      history.push(reading);
      if (history.length > 100) history.shift();
      
      // Check for anomaly
      if (!reading.inRange) {
        sensor.anomalyCount++;
        const anomaly = {
          ...reading,
          thresholdMin: sensor.thresholdMin,
          thresholdMax: sensor.thresholdMax,
          deviation: value < sensor.thresholdMin 
            ? sensor.thresholdMin - value 
            : value - sensor.thresholdMax,
        };
        this.anomalies.push(anomaly);
        if (this.anomalies.length > 100) this.anomalies.shift();
      }
      
      return reading;
    } catch (error) {
      return { sensorId, error: error.message, timestamp: Date.now() };
    }
  }

  async readAll() {
    const readings = [];
    for (const sensorId of this.sensors.keys()) {
      const reading = await this.poll(sensorId);
      if (reading) readings.push(reading);
    }
    return readings;
  }

  getLatest(sensorId) {
    const history = this.readings.get(sensorId);
    if (!history || history.length === 0) return null;
    return history[history.length - 1];
  }

  getHistory(sensorId, limit = 50) {
    const history = this.readings.get(sensorId);
    if (!history) return [];
    return history.slice(-limit);
  }

  calibrate(sensorId, offset) {
    const sensor = this.sensors.get(sensorId);
    if (sensor) {
      sensor.calibrationOffset = offset;
    }
  }

  setThresholds(sensorId, min, max) {
    const sensor = this.sensors.get(sensorId);
    if (sensor) {
      sensor.thresholdMin = min;
      sensor.thresholdMax = max;
    }
  }

  getAnomalies(limit = 20) {
    return this.anomalies.slice(-limit);
  }

  getMetrics() {
    const sensorStats = [];
    for (const [id, sensor] of this.sensors) {
      sensorStats.push({
        id,
        name: sensor.name,
        type: sensor.type,
        pollCount: sensor.pollCount,
        anomalyCount: sensor.anomalyCount,
        polling: !!sensor.intervalId,
      });
    }
    
    return {
      sensorCount: this.sensors.size,
      totalReadings: this.totalReadings,
      totalAnomalies: this.anomalies.length,
      sensors: sensorStats,
      sensorTypes: SENSOR_TYPES,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { EdgeSensorProtocol, SENSOR_TYPES };
export default EdgeSensorProtocol;
