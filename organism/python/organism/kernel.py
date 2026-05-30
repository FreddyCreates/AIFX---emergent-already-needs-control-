"""Kernel executor — load, schedule, and run kernels within the organism."""
from __future__ import annotations

import concurrent.futures
import threading
import time
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable

KernelFunc = Callable[..., Any]


class KernelStatus(Enum):
    IDLE = auto()
    RUNNING = auto()
    COMPLETED = auto()
    FAILED = auto()
    TIMEOUT = auto()


@dataclass
class KernelRecord:
    name: str
    func: KernelFunc
    status: KernelStatus = KernelStatus.IDLE
    last_result: Any = None
    last_error: str | None = None
    run_count: int = 0
    scheduled_beats: list[int] = field(default_factory=list)


class KernelExecutor:
    """Loads, schedules, and executes kernel functions."""

    def __init__(self, max_workers: int = 4) -> None:
        self._lock = threading.Lock()
        self._kernels: dict[str, KernelRecord] = {}
        self._pool = concurrent.futures.ThreadPoolExecutor(
            max_workers=max_workers, thread_name_prefix="kernel"
        )

    # -- loading --------------------------------------------------------

    def load_kernel(self, name: str, func: KernelFunc) -> None:
        """Register a named kernel function."""
        with self._lock:
            self._kernels[name] = KernelRecord(name=name, func=func)

    # -- execution ------------------------------------------------------

    def execute(
        self, name: str, *args: Any, timeout: float = 5.0, **kwargs: Any
    ) -> Any:
        """Execute a kernel by name with an optional timeout (seconds)."""
        with self._lock:
            rec = self._kernels.get(name)
            if rec is None:
                raise KeyError(f"Kernel {name!r} not loaded")
            rec.status = KernelStatus.RUNNING

        future = self._pool.submit(rec.func, *args, **kwargs)
        try:
            result = future.result(timeout=timeout)
            with self._lock:
                rec.status = KernelStatus.COMPLETED
                rec.last_result = result
                rec.run_count += 1
            return result
        except concurrent.futures.TimeoutError:
            future.cancel()
            with self._lock:
                rec.status = KernelStatus.TIMEOUT
                rec.last_error = "timeout"
            raise
        except Exception as exc:
            with self._lock:
                rec.status = KernelStatus.FAILED
                rec.last_error = str(exc)
            raise

    # -- scheduling -----------------------------------------------------

    def schedule(self, name: str, beats: list[int]) -> None:
        """Bind a kernel to fire on specific beat numbers."""
        with self._lock:
            rec = self._kernels.get(name)
            if rec is None:
                raise KeyError(f"Kernel {name!r} not loaded")
            rec.scheduled_beats = list(beats)

    def tick(self, beat: int) -> list[str]:
        """Called each heartbeat. Executes any kernels scheduled for *beat*.

        Returns names of kernels that ran.
        """
        to_run: list[str] = []
        with self._lock:
            for name, rec in self._kernels.items():
                if beat in rec.scheduled_beats:
                    to_run.append(name)
        for name in to_run:
            try:
                self.execute(name)
            except Exception:
                pass
        return to_run

    # -- introspection --------------------------------------------------

    def list_kernels(self) -> list[str]:
        with self._lock:
            return list(self._kernels)

    def get_kernel_status(self, name: str) -> KernelStatus:
        with self._lock:
            rec = self._kernels.get(name)
            if rec is None:
                raise KeyError(f"Kernel {name!r} not loaded")
            return rec.status

    def shutdown(self) -> None:
        self._pool.shutdown(wait=False)
