"""Phi-encoded constants for the sovereign organism runtime."""
from __future__ import annotations

PHI: float = 1.618033988749895
GOLDEN_ANGLE: float = 137.508
HEARTBEAT_MS: int = 873
HEARTBEAT_SECONDS: float = HEARTBEAT_MS / 1000.0

REGISTER_NAMES: tuple[str, ...] = ("cognitive", "affective", "somatic", "sovereign")
