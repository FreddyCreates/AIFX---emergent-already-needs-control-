"""873 ms heartbeat — the pulse of the organism."""
from __future__ import annotations

import threading
import time
from typing import Callable

from .constants import HEARTBEAT_SECONDS

BeatCallback = Callable[[int], None]


class Heartbeat:
    """Daemon thread that fires every 873 ms."""

    def __init__(self) -> None:
        self._beat_count: int = 0
        self._running = threading.Event()
        self._callbacks: list[BeatCallback] = []
        self._lock = threading.Lock()
        self._thread: threading.Thread | None = None
        self._start_time: float = 0.0

    # -- public API -----------------------------------------------------

    def on_beat(self, callback: BeatCallback) -> None:
        """Register a callback invoked each heartbeat with the beat number."""
        self._callbacks.append(callback)

    def start(self) -> None:
        """Start the heartbeat thread (idempotent)."""
        if self._thread is not None and self._thread.is_alive():
            return
        self._running.set()
        self._start_time = time.monotonic()
        self._thread = threading.Thread(target=self._run, daemon=True, name="heartbeat")
        self._thread.start()

    def stop(self) -> None:
        """Signal the heartbeat to stop."""
        self._running.clear()

    def is_alive(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def get_beat_count(self) -> int:
        with self._lock:
            return self._beat_count

    def get_uptime(self) -> float:
        """Seconds since start."""
        if self._start_time == 0.0:
            return 0.0
        return time.monotonic() - self._start_time

    # -- internals ------------------------------------------------------

    def _run(self) -> None:
        while self._running.is_set():
            time.sleep(HEARTBEAT_SECONDS)
            with self._lock:
                self._beat_count += 1
                beat = self._beat_count
            for cb in self._callbacks:
                try:
                    cb(beat)
                except Exception:
                    pass  # organism survives callback failures
