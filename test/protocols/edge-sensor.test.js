const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

describe('EdgeSensorProtocol', () => {
  let EdgeSensorProtocol;
  let protocol;
  const HEARTBEAT = 873;

  beforeEach(async () => {
    const module = await import('../../protocols/edge-sensor-protocol.js');
    EdgeSensorProtocol = module.EdgeSensorProtocol;
    protocol = new EdgeSensorProtocol();
  });

  afterEach(() => {
    // Stop all polling
    protocol.stopAllPolling();
  });

  describe('constructor', () => {
    it('should initialize empty sensors map', () => {
      assert.ok(protocol.sensors instanceof Map);
      assert.equal(protocol.sensors.size, 0);
    });

    it('should initialize empty readings map', () => {
      assert.ok(protocol.readings instanceof Map);
      assert.equal(protocol.readings.size, 0);
    });

    it('should initialize empty anomalies array', () => {
      assert.ok(Array.isArray(protocol.anomalies));
      assert.equal(protocol.anomalies.length, 0);
    });

    it('should initialize total readings to 0', () => {
      assert.equal(protocol.totalReadings, 0);
    });
  });

  describe('registerSensor()', () => {
    it('should register sensor and return id', () => {
      const id = protocol.registerSensor(
        { id: 'temp-1', name: 'Temperature', type: 'temperature' },
        () => 25
      );
      assert.equal(id, 'temp-1');
    });

    it('should add sensor to sensors map', () => {
      protocol.registerSensor(
        { id: 'temp-1', name: 'Temperature' },
        () => 25
      );
      assert.ok(protocol.sensors.has('temp-1'));
    });

    it('should store sensor name', () => {
      protocol.registerSensor(
        { id: 'temp-1', name: 'Temperature Sensor' },
        () => 25
      );
      const sensor = protocol.sensors.get('temp-1');
      assert.equal(sensor.name, 'Temperature Sensor');
    });

    it('should default to custom type', () => {
      protocol.registerSensor(
        { id: 'custom-1' },
        () => 0
      );
      const sensor = protocol.sensors.get('custom-1');
      assert.equal(sensor.type, 'custom');
    });

    it('should use specified type', () => {
      protocol.registerSensor(
        { id: 'net-1', type: 'network' },
        () => 0
      );
      const sensor = protocol.sensors.get('net-1');
      assert.equal(sensor.type, 'network');
    });

    it('should default poll interval to HEARTBEAT', () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 0
      );
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.pollIntervalMs, HEARTBEAT);
    });

    it('should use specified poll interval', () => {
      protocol.registerSensor(
        { id: 'sensor-1', pollIntervalMs: 1000 },
        () => 0
      );
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.pollIntervalMs, 1000);
    });

    it('should default threshold min to 0', () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 0
      );
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.thresholdMin, 0);
    });

    it('should default threshold max to 100', () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 0
      );
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.thresholdMax, 100);
    });

    it('should use specified thresholds', () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMin: 10, thresholdMax: 50 },
        () => 0
      );
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.thresholdMin, 10);
      assert.equal(sensor.thresholdMax, 50);
    });

    it('should initialize poll count to 0', () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 0
      );
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.pollCount, 0);
    });

    it('should initialize anomaly count to 0', () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 0
      );
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.anomalyCount, 0);
    });

    it('should initialize readings array for sensor', () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 0
      );
      assert.ok(protocol.readings.has('sensor-1'));
      assert.ok(Array.isArray(protocol.readings.get('sensor-1')));
    });

    it('should accept calibration offset', () => {
      protocol.registerSensor(
        { id: 'sensor-1', calibrationOffset: 2.5 },
        () => 0
      );
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.calibrationOffset, 2.5);
    });
  });

  describe('poll()', () => {
    it('should poll sensor and return reading', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 42
      );
      const reading = await protocol.poll('sensor-1');
      assert.ok(reading);
      assert.equal(reading.value, 42);
    });

    it('should increment poll count', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      await protocol.poll('sensor-1');
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.pollCount, 1);
    });

    it('should update last poll timestamp', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      const before = Date.now();
      await protocol.poll('sensor-1');
      const after = Date.now();
      const sensor = protocol.sensors.get('sensor-1');
      assert.ok(sensor.lastPoll >= before);
      assert.ok(sensor.lastPoll <= after);
    });

    it('should add to readings history', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      await protocol.poll('sensor-1');
      const readings = protocol.readings.get('sensor-1');
      assert.ok(readings.length >= 1);
    });

    it('should increment total readings', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      await protocol.poll('sensor-1');
      assert.equal(protocol.totalReadings, 1);
    });

    it('should apply calibration offset', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', calibrationOffset: 5 },
        () => 20
      );
      const reading = await protocol.poll('sensor-1');
      assert.equal(reading.value, 25);
    });

    it('should detect anomaly above threshold', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMax: 50 },
        () => 75
      );
      const reading = await protocol.poll('sensor-1');
      assert.ok(reading.anomaly);
    });

    it('should detect anomaly below threshold', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMin: 20 },
        () => 10
      );
      const reading = await protocol.poll('sensor-1');
      assert.ok(reading.anomaly);
    });

    it('should not flag normal reading as anomaly', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMin: 0, thresholdMax: 100 },
        () => 50
      );
      const reading = await protocol.poll('sensor-1');
      assert.ok(!reading.anomaly);
    });

    it('should add anomaly to anomalies array', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMax: 50 },
        () => 75
      );
      await protocol.poll('sensor-1');
      assert.ok(protocol.anomalies.length >= 1);
    });

    it('should increment sensor anomaly count', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMax: 50 },
        () => 75
      );
      await protocol.poll('sensor-1');
      const sensor = protocol.sensors.get('sensor-1');
      assert.equal(sensor.anomalyCount, 1);
    });

    it('should return null for unknown sensor', async () => {
      const reading = await protocol.poll('unknown');
      assert.equal(reading, null);
    });

    it('should handle async poll function', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        async () => {
          await new Promise(r => setTimeout(r, 1));
          return 42;
        }
      );
      const reading = await protocol.poll('sensor-1');
      assert.equal(reading.value, 42);
    });

    it('should include sensor id in reading', async () => {
      protocol.registerSensor(
        { id: 'my-sensor' },
        () => 25
      );
      const reading = await protocol.poll('my-sensor');
      assert.equal(reading.sensorId, 'my-sensor');
    });

    it('should include timestamp in reading', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      const before = Date.now();
      const reading = await protocol.poll('sensor-1');
      const after = Date.now();
      assert.ok(reading.timestamp >= before);
      assert.ok(reading.timestamp <= after);
    });
  });

  describe('getReading()', () => {
    it('should return latest reading', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 42
      );
      await protocol.poll('sensor-1');
      const reading = protocol.getReading('sensor-1');
      assert.equal(reading.value, 42);
    });

    it('should return null for no readings', () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 42
      );
      const reading = protocol.getReading('sensor-1');
      assert.equal(reading, null);
    });

    it('should return null for unknown sensor', () => {
      const reading = protocol.getReading('unknown');
      assert.equal(reading, null);
    });
  });

  describe('getReadings()', () => {
    it('should return all readings for sensor', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      await protocol.poll('sensor-1');
      await protocol.poll('sensor-1');
      await protocol.poll('sensor-1');
      const readings = protocol.getReadings('sensor-1');
      assert.equal(readings.length, 3);
    });

    it('should return empty array for no readings', () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      const readings = protocol.getReadings('sensor-1');
      assert.equal(readings.length, 0);
    });

    it('should accept limit parameter', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      for (let i = 0; i < 10; i++) {
        await protocol.poll('sensor-1');
      }
      const readings = protocol.getReadings('sensor-1', 5);
      assert.equal(readings.length, 5);
    });
  });

  describe('getAnomalies()', () => {
    it('should return all anomalies', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMax: 50 },
        () => 75
      );
      await protocol.poll('sensor-1');
      await protocol.poll('sensor-1');
      const anomalies = protocol.getAnomalies();
      assert.ok(anomalies.length >= 2);
    });

    it('should return empty array for no anomalies', () => {
      const anomalies = protocol.getAnomalies();
      assert.equal(anomalies.length, 0);
    });

    it('should filter by sensor id', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMax: 50 },
        () => 75
      );
      protocol.registerSensor(
        { id: 'sensor-2', thresholdMax: 50 },
        () => 75
      );
      await protocol.poll('sensor-1');
      await protocol.poll('sensor-2');
      const anomalies = protocol.getAnomalies('sensor-1');
      assert.ok(anomalies.every(a => a.sensorId === 'sensor-1'));
    });
  });

  describe('getSensorStats()', () => {
    it('should return stats for sensor', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      await protocol.poll('sensor-1');
      const stats = protocol.getSensorStats('sensor-1');
      assert.ok(stats);
    });

    it('should include poll count', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      await protocol.poll('sensor-1');
      await protocol.poll('sensor-1');
      const stats = protocol.getSensorStats('sensor-1');
      assert.equal(stats.pollCount, 2);
    });

    it('should include anomaly count', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMax: 50 },
        () => 75
      );
      await protocol.poll('sensor-1');
      const stats = protocol.getSensorStats('sensor-1');
      assert.equal(stats.anomalyCount, 1);
    });

    it('should return null for unknown sensor', () => {
      const stats = protocol.getSensorStats('unknown');
      assert.equal(stats, null);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include total readings', async () => {
      protocol.registerSensor(
        { id: 'sensor-1' },
        () => 25
      );
      await protocol.poll('sensor-1');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalReadings, 1);
    });

    it('should include sensor count', () => {
      protocol.registerSensor({ id: 'sensor-1' }, () => 0);
      protocol.registerSensor({ id: 'sensor-2' }, () => 0);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.sensorCount, 2);
    });

    it('should include anomaly count', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMax: 50 },
        () => 75
      );
      await protocol.poll('sensor-1');
      const metrics = protocol.getMetrics();
      assert.ok(metrics.anomalyCount >= 1);
    });
  });

  describe('integration', () => {
    it('should handle multiple sensors', async () => {
      protocol.registerSensor(
        { id: 'temp', type: 'temperature' },
        () => 25
      );
      protocol.registerSensor(
        { id: 'net', type: 'network' },
        () => 100
      );
      protocol.registerSensor(
        { id: 'res', type: 'resource' },
        () => 50
      );
      
      await protocol.poll('temp');
      await protocol.poll('net');
      await protocol.poll('res');
      
      const metrics = protocol.getMetrics();
      assert.equal(metrics.sensorCount, 3);
      assert.equal(metrics.totalReadings, 3);
    });

    it('should track anomalies across sensors', async () => {
      protocol.registerSensor(
        { id: 'sensor-1', thresholdMax: 50 },
        () => 75  // anomaly
      );
      protocol.registerSensor(
        { id: 'sensor-2', thresholdMin: 20 },
        () => 10  // anomaly
      );
      
      await protocol.poll('sensor-1');
      await protocol.poll('sensor-2');
      
      const anomalies = protocol.getAnomalies();
      assert.equal(anomalies.length, 2);
    });
  });
});
