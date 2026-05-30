"""Sovereign Organism Runtime — Python implementation.

A living, phi-encoded, 4-register organism with heartbeat, kernel execution,
edge sensing, and cross-organism resonance.
"""
from __future__ import annotations

from .constants import PHI, GOLDEN_ANGLE, HEARTBEAT_MS
from .state import OrganismState, StateSnapshot
from .heartbeat import Heartbeat
from .kernel import KernelExecutor, KernelStatus
from .sensor import EdgeSensor, SensorType
from .resonance import CrossOrganismResonance
from .vitality import VitalityCalculator

__all__ = [
    "PHI",
    "GOLDEN_ANGLE",
    "HEARTBEAT_MS",
    "OrganismState",
    "StateSnapshot",
    "Heartbeat",
    "KernelExecutor",
    "KernelStatus",
    "EdgeSensor",
    "SensorType",
    "CrossOrganismResonance",
    "VitalityCalculator",
]
