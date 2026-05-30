package org.organism;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Edge sensing subsystem with typed sensors and phi-modulated simulation.
 */
public final class EdgeSensor {

    public enum SensorType { TEMPERATURE, NETWORK, RESOURCE, SIGNAL, CUSTOM }

    /** Immutable reading from a sensor. */
    public record SensorReading(
            String sensorId,
            SensorType type,
            double value,
            double normalizedValue,
            long timestampMs,
            boolean withinThreshold
    ) {}

    /** Mutable sensor configuration. */
    private record SensorConfig(
            String id,
            String name,
            SensorType type,
            double thresholdMin,
            double thresholdMax,
            double calibrationOffset
    ) {}

    private final ConcurrentHashMap<String, SensorConfig> sensors = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Double> lastValues = new ConcurrentHashMap<>();

    /** Register a new sensor. */
    public void registerSensor(String id, String name, SensorType type,
                               double thresholdMin, double thresholdMax,
                               double calibrationOffset) {
        sensors.put(id, new SensorConfig(id, name, type, thresholdMin, thresholdMax, calibrationOffset));
        lastValues.put(id, simulateDefault(type));
    }

    /** Read a single sensor, producing a fresh simulated value modulated by beat. */
    public SensorReading read(String sensorId, long beatNumber) {
        SensorConfig config = sensors.get(sensorId);
        if (config == null) return null;

        double raw = simulateValue(config.type, beatNumber);
        double calibrated = raw + config.calibrationOffset;
        lastValues.put(sensorId, calibrated);

        double range = config.thresholdMax - config.thresholdMin;
        double normalized = range == 0.0 ? 0.0
                : Math.max(0.0, Math.min(1.0, (calibrated - config.thresholdMin) / range));

        boolean withinThreshold = calibrated >= config.thresholdMin && calibrated <= config.thresholdMax;

        return new SensorReading(sensorId, config.type, calibrated, normalized,
                System.currentTimeMillis(), withinThreshold);
    }

    /** Read all sensors. */
    public Map<String, SensorReading> readAll(long beatNumber) {
        var results = new ConcurrentHashMap<String, SensorReading>();
        for (String id : sensors.keySet()) {
            SensorReading r = read(id, beatNumber);
            if (r != null) results.put(id, r);
        }
        return Collections.unmodifiableMap(results);
    }

    /** List all registered sensor IDs. */
    public List<String> listSensors() {
        return List.copyOf(sensors.keySet());
    }

    public int sensorCount() {
        return sensors.size();
    }

    // Phi-modulated simulation per sensor type
    private double simulateValue(SensorType type, long beat) {
        double phase = (beat * OrganismConstants.GOLDEN_ANGLE) % 360.0;
        double phiWave = Math.sin(Math.toRadians(phase));
        return switch (type) {
            case TEMPERATURE -> 36.5 + phiWave * 2.0;
            case NETWORK     -> 50.0 + phiWave * 45.0;
            case RESOURCE    -> 0.3  + (phiWave + 1.0) * 0.25;
            case SIGNAL      -> -40.0 + phiWave * 15.0;
            case CUSTOM      -> OrganismConstants.PHI + phiWave * OrganismConstants.PHI_INVERSE;
        };
    }

    private double simulateDefault(SensorType type) {
        return switch (type) {
            case TEMPERATURE -> 36.5;
            case NETWORK     -> 50.0;
            case RESOURCE    -> 0.5;
            case SIGNAL      -> -40.0;
            case CUSTOM      -> OrganismConstants.PHI;
        };
    }
}
