import type {
  SensorConfig,
  SensorReading,
  SensorRecord,
  SensorReadFunction,
  SensorType,
  ThresholdCallback,
  Unsubscribe,
} from './types.js';

export class EdgeSensor {
  private readonly sensors: Map<string, SensorRecord> = new Map();
  private readonly thresholdCallbacks: Map<string, Set<ThresholdCallback>> = new Map();

  registerSensor(config: SensorConfig, readFn: SensorReadFunction): void {
    if (this.sensors.has(config.id)) {
      throw new Error(`Sensor already registered: ${config.id}`);
    }

    const record: SensorRecord = {
      config,
      readFn,
      lastReading: null,
      pollTimer: null,
    };

    this.sensors.set(config.id, record);
    this.thresholdCallbacks.set(config.id, new Set());

    if (config.pollIntervalMs > 0) {
      this.startPolling(config.id);
    }
  }

  async read(sensorId: string): Promise<SensorReading> {
    const record = this.sensors.get(sensorId);
    if (!record) {
      throw new Error(`Sensor not found: ${sensorId}`);
    }

    const rawValue = await Promise.resolve(record.readFn());
    const calibrated = rawValue + record.config.calibrationOffset;

    const range = record.config.thresholdMax - record.config.thresholdMin;
    const normalizedValue =
      range !== 0
        ? Math.max(0, Math.min(1, (calibrated - record.config.thresholdMin) / range))
        : 0;

    const reading: SensorReading = {
      sensorId,
      type: record.config.type,
      value: calibrated,
      normalizedValue,
      timestamp: Date.now(),
      withinThreshold:
        calibrated >= record.config.thresholdMin &&
        calibrated <= record.config.thresholdMax,
    };

    record.lastReading = reading;

    if (!reading.withinThreshold) {
      const callbacks = this.thresholdCallbacks.get(sensorId);
      if (callbacks) {
        for (const cb of callbacks) {
          cb(reading);
        }
      }
    }

    return reading;
  }

  async readAll(): Promise<ReadonlyArray<SensorReading>> {
    const promises = Array.from(this.sensors.keys()).map((id) => this.read(id));
    return Promise.all(promises);
  }

  onThreshold(sensorId: string, callback: ThresholdCallback): Unsubscribe {
    const set = this.thresholdCallbacks.get(sensorId);
    if (!set) {
      throw new Error(`Sensor not found: ${sensorId}`);
    }
    set.add(callback);
    return () => {
      set.delete(callback);
    };
  }

  calibrate(sensorId: string, offset: number): void {
    const record = this.sensors.get(sensorId);
    if (!record) {
      throw new Error(`Sensor not found: ${sensorId}`);
    }

    // Create a new config with updated calibration
    const updatedConfig: SensorConfig = {
      ...record.config,
      calibrationOffset: offset,
    };

    // Re-register the mutable record fields
    const updatedRecord: SensorRecord = {
      config: updatedConfig,
      readFn: record.readFn,
      lastReading: record.lastReading,
      pollTimer: record.pollTimer,
    };

    this.sensors.set(sensorId, updatedRecord);
  }

  getLastReading(sensorId: string): SensorReading | null {
    return this.sensors.get(sensorId)?.lastReading ?? null;
  }

  listSensors(): ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly type: SensorType;
    readonly lastValue: number | null;
  }> {
    return Array.from(this.sensors.values()).map((s) => ({
      id: s.config.id,
      name: s.config.name,
      type: s.config.type,
      lastValue: s.lastReading?.value ?? null,
    }));
  }

  removeSensor(sensorId: string): boolean {
    const record = this.sensors.get(sensorId);
    if (record?.pollTimer) {
      clearInterval(record.pollTimer);
    }
    this.thresholdCallbacks.delete(sensorId);
    return this.sensors.delete(sensorId);
  }

  stopAllPolling(): void {
    for (const record of this.sensors.values()) {
      if (record.pollTimer) {
        clearInterval(record.pollTimer);
        const updated: SensorRecord = {
          config: record.config,
          readFn: record.readFn,
          lastReading: record.lastReading,
          pollTimer: null,
        };
        this.sensors.set(record.config.id, updated);
      }
    }
  }

  private startPolling(sensorId: string): void {
    const record = this.sensors.get(sensorId);
    if (!record) return;

    const timer = setInterval(() => {
      void this.read(sensorId).catch(() => {
        // Polling errors are silently recorded in lastReading
      });
    }, record.config.pollIntervalMs);

    const updated: SensorRecord = {
      config: record.config,
      readFn: record.readFn,
      lastReading: record.lastReading,
      pollTimer: timer,
    };
    this.sensors.set(sensorId, updated);
  }
}
