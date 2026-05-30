"""Vitality calculator — phi-weighted health metric for the organism."""
from __future__ import annotations

from .constants import PHI, GOLDEN_ANGLE
from .state import OrganismState, StateSnapshot
from .sensor import EdgeSensor


# Phi-derived weights for the four registers (normalised to sum ≈ 1.0)
_RAW_WEIGHTS: dict[str, float] = {
    "cognitive": PHI ** 3,       # ≈ 4.236
    "affective": PHI ** 2,       # ≈ 2.618
    "somatic": PHI ** 1,         # ≈ 1.618
    "sovereign": PHI ** 4,       # ≈ 6.854
}
_WEIGHT_SUM = sum(_RAW_WEIGHTS.values())
REGISTER_WEIGHTS: dict[str, float] = {k: v / _WEIGHT_SUM for k, v in _RAW_WEIGHTS.items()}


def _score_register(data: dict) -> float:
    """Score a register 0-1 based on how many keys carry truthy values."""
    if not data:
        return 0.0
    truthy = sum(1 for v in data.values() if v)
    return truthy / len(data)


class VitalityCalculator:
    """Computes organism vitality as a phi-weighted composite score."""

    def __init__(self, state: OrganismState, sensors: EdgeSensor) -> None:
        self._state = state
        self._sensors = sensors

    def calculate_vitality(self, beat: int = 0) -> dict[str, float]:
        """Return vitality report.

        Keys:
            register_scores  — per-register score 0-1
            weighted_total   — phi-weighted aggregate 0-1
            sensor_penalty   — deduction from abnormal sensor readings
            vitality         — final score (weighted_total - sensor_penalty), clamped 0-1
        """
        snap = self._state.snapshot(beat)
        reg_scores: dict[str, float] = {}
        weighted = 0.0
        for reg, weight in REGISTER_WEIGHTS.items():
            score = _score_register(getattr(snap, reg))
            reg_scores[reg] = round(score, 4)
            weighted += score * weight

        # sensor penalty — high temperature or resource pressure
        penalty = self._sensor_penalty()
        vitality = max(0.0, min(1.0, weighted - penalty))

        return {
            "register_scores": reg_scores,
            "weighted_total": round(weighted, 4),
            "sensor_penalty": round(penalty, 4),
            "vitality": round(vitality, 4),
            "beat": beat,
        }

    def _sensor_penalty(self) -> float:
        """Derive a penalty from sensor readings."""
        penalty = 0.0
        try:
            readings = self._sensors.read_all()
        except Exception:
            return 0.0
        # temperature above 50 °C starts incurring penalty
        temp = readings.get("temperature", 0.0)
        if temp > 50.0:
            penalty += (temp - 50.0) / GOLDEN_ANGLE  # gentle curve

        # resource utilisation above 0.85 adds penalty
        resource = readings.get("resource", 0.0)
        if resource > 0.85:
            penalty += (resource - 0.85) * PHI

        return min(penalty, 0.5)  # cap at 0.5
