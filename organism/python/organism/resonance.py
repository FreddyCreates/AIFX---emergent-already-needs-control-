"""Cross-organism resonance — inter-organism communication & synchronisation."""
from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from typing import Any, Callable

from .constants import PHI, GOLDEN_ANGLE

ResonanceCallback = Callable[[str, Any], None]


@dataclass
class OrganismPeer:
    organism_id: str
    registered_at: float = field(default_factory=time.monotonic)
    last_signal: Any = None
    last_signal_time: float = 0.0
    resonance_strength: float = 0.0


class CrossOrganismResonance:
    """Manages the resonance field between co-existing organisms."""

    def __init__(self, self_id: str = "organism-0") -> None:
        self._self_id = self_id
        self._lock = threading.Lock()
        self._peers: dict[str, OrganismPeer] = {}
        self._callbacks: list[ResonanceCallback] = []

    # -- peer management ------------------------------------------------

    def register_organism(self, organism_id: str) -> None:
        """Register a peer organism for resonance."""
        with self._lock:
            self._peers[organism_id] = OrganismPeer(organism_id=organism_id)

    # -- signalling -----------------------------------------------------

    def resonate(self, signal: Any) -> dict[str, float]:
        """Broadcast a signal to all registered peers.

        Returns a mapping of peer_id → resonance_strength after propagation.
        """
        strengths: dict[str, float] = {}
        with self._lock:
            peers = list(self._peers.values())
        for peer in peers:
            strength = self._compute_strength(peer)
            with self._lock:
                peer.resonance_strength = strength
            strengths[peer.organism_id] = strength
            # deliver to callbacks
            for cb in self._callbacks:
                try:
                    cb(peer.organism_id, signal)
                except Exception:
                    pass
        return strengths

    def receive_signal(self, from_id: str, signal: Any) -> None:
        """Ingest a signal from another organism."""
        with self._lock:
            peer = self._peers.get(from_id)
            if peer is None:
                self._peers[from_id] = OrganismPeer(organism_id=from_id)
                peer = self._peers[from_id]
            peer.last_signal = signal
            peer.last_signal_time = time.monotonic()
        for cb in self._callbacks:
            try:
                cb(from_id, signal)
            except Exception:
                pass

    def on_resonance(self, callback: ResonanceCallback) -> None:
        """Register a callback for incoming resonance events."""
        self._callbacks.append(callback)

    def synchronize(self) -> dict[str, float]:
        """Re-compute resonance strength for every peer."""
        result: dict[str, float] = {}
        with self._lock:
            for peer in self._peers.values():
                s = self._compute_strength(peer)
                peer.resonance_strength = s
                result[peer.organism_id] = s
        return result

    def get_resonance_field(self) -> dict[str, dict[str, Any]]:
        """Snapshot of the full resonance field."""
        with self._lock:
            return {
                pid: {
                    "organism_id": p.organism_id,
                    "resonance_strength": p.resonance_strength,
                    "last_signal": p.last_signal,
                    "age_s": time.monotonic() - p.registered_at,
                }
                for pid, p in self._peers.items()
            }

    # -- internals ------------------------------------------------------

    @staticmethod
    def _compute_strength(peer: OrganismPeer) -> float:
        """Phi-weighted resonance decay based on time since registration."""
        age = time.monotonic() - peer.registered_at
        # strength decays toward zero following the golden angle curve
        return 1.0 / (1.0 + (age / GOLDEN_ANGLE) ** (1.0 / PHI))
