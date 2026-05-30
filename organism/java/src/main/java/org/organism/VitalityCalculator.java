package org.organism;

import java.util.Map;

import static org.organism.OrganismConstants.*;

/**
 * Phi-weighted vitality scoring across registers and edge sensors.
 */
public final class VitalityCalculator {

    /** Full vitality report. */
    public record VitalityScore(
            double overall,
            double cognitive,
            double affective,
            double somatic,
            double sovereign,
            double sensorPenalty,
            double phiHarmony
    ) {}

    private final RegisterState state;
    private final EdgeSensor edgeSensor;

    public VitalityCalculator(RegisterState state, EdgeSensor edgeSensor) {
        this.state = state;
        this.edgeSensor = edgeSensor;
    }

    /** Compute the full vitality score for the current beat. */
    public VitalityScore calculate(long beatNumber) {
        double cogScore = state.registerAverage(RegisterState.RegisterName.COGNITIVE);
        double affScore = state.registerAverage(RegisterState.RegisterName.AFFECTIVE);

        // Somatic: invert negative metrics (lower cpu_load / memory_pressure / latency = healthier)
        double cpuLoad   = toDouble(state.getField(RegisterState.RegisterName.SOMATIC, "cpu_load"));
        double memPress  = toDouble(state.getField(RegisterState.RegisterName.SOMATIC, "memory_pressure"));
        double ioThrpt   = toDouble(state.getField(RegisterState.RegisterName.SOMATIC, "io_throughput"));
        double netLat    = toDouble(state.getField(RegisterState.RegisterName.SOMATIC, "network_latency"));
        double somScore  = 1.0 - (cpuLoad * 0.3 + memPress * 0.3 + (netLat / 100.0) * 0.2 + (1.0 - ioThrpt) * 0.2);
        somScore = clamp(somScore);

        double sovScore = state.registerAverage(RegisterState.RegisterName.SOVEREIGN);

        // Phi-weighted combination
        double weightedSum = cogScore * WEIGHT_COGNITIVE
                           + affScore * WEIGHT_AFFECTIVE
                           + somScore * WEIGHT_SOMATIC
                           + sovScore * WEIGHT_SOVEREIGN;
        double totalWeight = WEIGHT_COGNITIVE + WEIGHT_AFFECTIVE + WEIGHT_SOMATIC + WEIGHT_SOVEREIGN;
        double rawOverall = weightedSum / totalWeight;

        // Sensor penalty: fraction of out-of-threshold sensors, scaled by PHI_INVERSE
        double sensorPenalty = 0.0;
        var readings = edgeSensor.readAll(beatNumber);
        if (!readings.isEmpty()) {
            long outCount = readings.values().stream()
                    .filter(r -> !r.withinThreshold())
                    .count();
            sensorPenalty = ((double) outCount / readings.size()) * PHI_INVERSE;
        }

        double overall = clamp(rawOverall - sensorPenalty);

        // Phi harmony: closeness to the golden ratio's fractional part (0.618...)
        double phiHarmony = 1.0 - Math.abs(overall - PHI_INVERSE);

        return new VitalityScore(overall, cogScore, affScore, somScore, sovScore,
                sensorPenalty, phiHarmony);
    }

    private static double toDouble(Object v) {
        return v instanceof Number n ? n.doubleValue() : 0.0;
    }

    private static double clamp(double v) {
        return Math.max(0.0, Math.min(1.0, v));
    }
}
