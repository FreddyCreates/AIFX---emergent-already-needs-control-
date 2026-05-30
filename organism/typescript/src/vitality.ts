import type { SensorReading, StateSnapshot, VitalityScore } from './types.js';
import { PHI } from './types.js';

// Phi-weighted scoring: each register contributes by its position in the Fibonacci-like weight sequence
const REGISTER_WEIGHTS = {
  cognitive: 1 / (PHI * PHI * PHI),   // ~0.236
  affective: 1 / (PHI * PHI),          // ~0.382
  somatic: 1 / PHI,                     // ~0.618
  sovereign: 1.0,                       // 1.000
} as const;

function averageFields(register: Record<string, number>): number {
  const values = Object.values(register);
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export class VitalityCalculator {
  calculateVitality(
    state: StateSnapshot,
    sensorReadings: ReadonlyArray<SensorReading>
  ): VitalityScore {
    // Score each register as the average of its fields, clamped to [0, 1]
    const cognitiveScore = clamp(averageFields(state.cognitive as unknown as Record<string, number>));
    const affectiveScore = clamp(averageFields(state.affective as unknown as Record<string, number>));

    // Somatic: invert negative metrics (cpu_load, memory_pressure, network_latency are "lower is better")
    const somaticRaw = state.somatic;
    const somaticScore = clamp(
      1 -
        (somaticRaw.cpu_load * 0.3 +
          somaticRaw.memory_pressure * 0.3 +
          somaticRaw.network_latency / 100 * 0.2 +
          (1 - Math.min(1, somaticRaw.io_throughput)) * 0.2)
    );

    const sovereignScore = clamp(averageFields(state.sovereign as unknown as Record<string, number>));

    // Sensor penalty: each out-of-threshold sensor reduces vitality
    const outOfThreshold = sensorReadings.filter((r) => !r.withinThreshold).length;
    const sensorPenalty =
      sensorReadings.length > 0
        ? (outOfThreshold / sensorReadings.length) * (1 / PHI)
        : 0;

    // Weighted composite
    const totalWeight =
      REGISTER_WEIGHTS.cognitive +
      REGISTER_WEIGHTS.affective +
      REGISTER_WEIGHTS.somatic +
      REGISTER_WEIGHTS.sovereign;

    const weightedSum =
      cognitiveScore * REGISTER_WEIGHTS.cognitive +
      affectiveScore * REGISTER_WEIGHTS.affective +
      somaticScore * REGISTER_WEIGHTS.somatic +
      sovereignScore * REGISTER_WEIGHTS.sovereign;

    const rawOverall = weightedSum / totalWeight;

    // Phi harmony: how close the overall score is to the golden ratio's fractional part
    const phiHarmony = 1 - Math.abs(rawOverall - (PHI - 1));

    const overall = clamp(rawOverall - sensorPenalty);

    return {
      overall,
      cognitive: cognitiveScore,
      affective: affectiveScore,
      somatic: somaticScore,
      sovereign: sovereignScore,
      sensorPenalty,
      phiHarmony: clamp(phiHarmony),
      timestamp: Date.now(),
    };
  }
}
