"""Edge sensing — environmental perception for the organism."""
from __future__ import annotations

import math
import random
import threading
import time
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable

from .constants import PHI

ThresholdCallback = Callable[[str, float], None]


class SensorType(Enum):
    TEMPERATURE = auto()
    NETWORK = auto()
    RESOURCE = auto()
    SIGNAL = auto()
    CUSTOM = auto()


@dataclass
class SensorRecord:
    name: str
    sensor_type: SensorType
    reader: Callable[[], float]
    calibration_offset: float = 0.0
    thresholds: list[tuple[float, ThresholdCallback]] = field(default_factory=list)
    last_value: float = 0.0


# -- default simulated readers -----------------------------------------

def _sim_temperature() -> float:
    """Simulated CPU-ish temperature oscillating around 42°C."""
    return 42.0 + 3.0 * math.sin(time.monotonic() / PHI)


def _sim_network() -> float:
    """Simulated network latency in ms."""
    return max(0.1, 12.0 + random.gauss(0, 2.5))


def _sim_resource() -> float:
    """Simulated resource utilisation 0-1."""
    return min(1.0, max(0.0, 0.35 + 0.15 * math.cos(time.monotonic() / PHI)))


def _sim_signal() -> float:
    """Simulated ambient signal strength 0-1."""
    return min(1.0, max(0.0, 0.7 + 0.2 * math.sin(time.monotonic())))


_DEFAULT_READERS: dict[SensorType, Callable[[], float]] = {
    SensorType.TEMPERATURE: _sim_temperature,
    SensorType.NETWORK: _sim_network,
    SensorType.RESOURCE: _sim_resource,
    SensorType.SIGNAL: _sim_signal,
}


class EdgeSensor:
    """Registers, reads, and monitors edge sensors."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._sensors: dict[str, SensorRecord] = {}

    def register_sensor(
        self,
        name: str,
        sensor_type: SensorType,
        reader: Callable[[], float] | None = None,
    ) -> None:
        """Add a named sensor.  Uses a simulated reader when *reader* is None."""
        if reader is None:
            reader = _DEFAULT_READERS.get(sensor_type, lambda: 0.0)
        with self._lock:
            self._sensors[name] = SensorRecord(
                name=name, sensor_type=sensor_type, reader=reader
            )

    def read(self, name: str) -> float:
        """Read a single sensor, applying calibration offset."""
        with self._lock:
            rec = self._sensors.get(name)
            if rec is None:
                raise KeyError(f"Sensor {name!r} not registered")
        value = rec.reader() + rec.calibration_offset
        with self._lock:
            rec.last_value = value
        # check thresholds
        for threshold, cb in rec.thresholds:
            if value >= threshold:
                try:
                    cb(name, value)
                except Exception:
                    pass
        return value

    def read_all(self) -> dict[str, float]:
        """Read every registered sensor."""
        with self._lock:
            names = list(self._sensors)
        return {n: self.read(n) for n in names}

    def on_threshold(
        self, name: str, threshold: float, callback: ThresholdCallback
    ) -> None:
        """Fire *callback(name, value)* whenever sensor >= threshold."""
        with self._lock:
            rec = self._sensors.get(name)
            if rec is None:
                raise KeyError(f"Sensor {name!r} not registered")
            rec.thresholds.append((threshold, callback))

    def calibrate(self, name: str, offset: float) -> None:
        """Apply a calibration offset to a sensor."""
        with self._lock:
            rec = self._sensors.get(name)
            if rec is None:
                raise KeyError(f"Sensor {name!r} not registered")
            rec.calibration_offset = offset

    def list_sensors(self) -> list[str]:
        with self._lock:
            return list(self._sensors)
