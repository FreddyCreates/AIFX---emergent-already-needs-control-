"""4-register state architecture with thread-safe access."""
from __future__ import annotations

import copy
import threading
from dataclasses import dataclass, field
from typing import Any, Callable

from .constants import REGISTER_NAMES


@dataclass(frozen=True)
class StateSnapshot:
    """Immutable deep-copy snapshot of organism state."""

    cognitive: dict[str, Any]
    affective: dict[str, Any]
    somatic: dict[str, Any]
    sovereign: dict[str, Any]
    beat: int = 0

    def as_dict(self) -> dict[str, dict[str, Any]]:
        return {
            "cognitive": dict(self.cognitive),
            "affective": dict(self.affective),
            "somatic": dict(self.somatic),
            "sovereign": dict(self.sovereign),
        }


ChangeCallback = Callable[[str, str, Any, Any], None]


class OrganismState:
    """Thread-safe 4-register organism state.

    Registers: cognitive, affective, somatic, sovereign.
    Each register is a string-keyed dict protected by a shared lock.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._registers: dict[str, dict[str, Any]] = {
            name: {} for name in REGISTER_NAMES
        }
        self._callbacks: list[ChangeCallback] = []
        self._beat: int = 0

    def get_register(self, register: str, key: str, default: Any = None) -> Any:
        """Read a single value from a register."""
        self._validate_register(register)
        with self._lock:
            return self._registers[register].get(key, default)

    def set_register(self, register: str, key: str, value: Any) -> None:
        """Write a value into a register and fire change callbacks."""
        self._validate_register(register)
        with self._lock:
            old = self._registers[register].get(key)
            self._registers[register][key] = value
        for cb in self._callbacks:
            cb(register, key, old, value)

    def snapshot(self, beat: int = 0) -> StateSnapshot:
        """Return a frozen deep-copy of the current state."""
        with self._lock:
            return StateSnapshot(
                cognitive=copy.deepcopy(self._registers["cognitive"]),
                affective=copy.deepcopy(self._registers["affective"]),
                somatic=copy.deepcopy(self._registers["somatic"]),
                sovereign=copy.deepcopy(self._registers["sovereign"]),
                beat=beat or self._beat,
            )

    def on_change(self, callback: ChangeCallback) -> None:
        """Register a callback invoked on every set_register call."""
        self._callbacks.append(callback)

    def advance_beat(self) -> int:
        """Increment and return the beat counter."""
        with self._lock:
            self._beat += 1
            return self._beat

    @staticmethod
    def diff(a: StateSnapshot, b: StateSnapshot) -> dict[str, dict[str, tuple[Any, Any]]]:
        """Return per-register diffs between two snapshots.

        Returns ``{register: {key: (old, new)}}`` for every changed key.
        """
        result: dict[str, dict[str, tuple[Any, Any]]] = {}
        for reg in REGISTER_NAMES:
            reg_a = getattr(a, reg)
            reg_b = getattr(b, reg)
            keys = set(reg_a) | set(reg_b)
            changes: dict[str, tuple[Any, Any]] = {}
            for k in keys:
                va, vb = reg_a.get(k), reg_b.get(k)
                if va != vb:
                    changes[k] = (va, vb)
            if changes:
                result[reg] = changes
        return result

    # ------------------------------------------------------------------
    def _validate_register(self, register: str) -> None:
        if register not in REGISTER_NAMES:
            raise ValueError(
                f"Unknown register {register!r}. Valid: {REGISTER_NAMES}"
            )
