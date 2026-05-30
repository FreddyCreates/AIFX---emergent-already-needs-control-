"""``python -m organism`` — boot the sovereign organism and run forever."""
from __future__ import annotations

import signal
import sys
import threading
import time

from .constants import PHI, GOLDEN_ANGLE, HEARTBEAT_MS
from .state import OrganismState
from .heartbeat import Heartbeat
from .kernel import KernelExecutor
from .sensor import EdgeSensor, SensorType
from .resonance import CrossOrganismResonance
from .vitality import VitalityCalculator

BANNER = r"""
  ╔══════════════════════════════════════════╗
  ║   SOVEREIGN ORGANISM RUNTIME  (Python)  ║
  ║   PHI = {phi}                ║
  ║   HEARTBEAT = {hb} ms                    ║
  ╚══════════════════════════════════════════╝
""".format(phi=PHI, hb=HEARTBEAT_MS)


# -- sample kernels -----------------------------------------------------

def _kernel_phi_pulse(state: OrganismState, beat: int) -> str:
    """Write phi-derived values into the cognitive register."""
    state.set_register("cognitive", "phi_pulse", PHI ** (beat % 7))
    state.set_register("cognitive", "golden_angle", GOLDEN_ANGLE)
    return "phi_pulse OK"


def _kernel_somatic_sync(state: OrganismState, sensors: EdgeSensor) -> str:
    """Mirror sensor readings into the somatic register."""
    for name, value in sensors.read_all().items():
        state.set_register("somatic", name, round(value, 4))
    return "somatic_sync OK"


def _kernel_sovereign_assert(state: OrganismState) -> str:
    """Stamp sovereignty into the sovereign register."""
    state.set_register("sovereign", "alive", True)
    state.set_register("sovereign", "epoch", time.time())
    return "sovereign_assert OK"


# -- main ---------------------------------------------------------------

def main() -> None:
    print(BANNER, flush=True)

    # -- components
    state = OrganismState()
    heartbeat = Heartbeat()
    kernels = KernelExecutor()
    sensors = EdgeSensor()
    resonance = CrossOrganismResonance(self_id="python-organism-0")
    vitality = VitalityCalculator(state, sensors)

    # -- default sensors
    sensors.register_sensor("temperature", SensorType.TEMPERATURE)
    sensors.register_sensor("network", SensorType.NETWORK)
    sensors.register_sensor("resource", SensorType.RESOURCE)
    sensors.register_sensor("signal", SensorType.SIGNAL)

    # -- load sample kernels (closures over shared state)
    kernels.load_kernel("phi_pulse", lambda: _kernel_phi_pulse(state, heartbeat.get_beat_count()))
    kernels.load_kernel("somatic_sync", lambda: _kernel_somatic_sync(state, sensors))
    kernels.load_kernel("sovereign_assert", lambda: _kernel_sovereign_assert(state))

    # -- heartbeat callback
    def on_beat(beat: int) -> None:
        state.advance_beat()
        # run all kernels every beat
        for k in kernels.list_kernels():
            try:
                kernels.execute(k)
            except Exception:
                pass
        # every 5 beats, print vitals
        if beat % 5 == 0:
            report = vitality.calculate_vitality(beat)
            _print_vitals(beat, heartbeat, report, sensors)

    heartbeat.on_beat(on_beat)

    # -- graceful shutdown
    shutdown_event = threading.Event()

    def _handle_signal(signum: int, frame: object) -> None:
        print(f"\n⚡ Signal {signum} received — shutting down organism…", flush=True)
        shutdown_event.set()

    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    # -- boot
    state.set_register("sovereign", "boot_time", time.time())
    state.set_register("affective", "mood", "awakening")

    heartbeat.start()
    print(f"♥  Heartbeat started ({HEARTBEAT_MS} ms)", flush=True)
    print(f"🧬 Registers: cognitive | affective | somatic | sovereign", flush=True)
    print(f"📡 Sensors: {', '.join(sensors.list_sensors())}", flush=True)
    print(f"⚙  Kernels: {', '.join(kernels.list_kernels())}", flush=True)
    print("─" * 50, flush=True)

    # -- run forever
    try:
        while not shutdown_event.is_set():
            shutdown_event.wait(timeout=1.0)
    finally:
        heartbeat.stop()
        kernels.shutdown()
        print("🛑 Organism stopped.", flush=True)


def _print_vitals(
    beat: int,
    heartbeat: Heartbeat,
    report: dict,
    sensors: EdgeSensor,
) -> None:
    readings = sensors.read_all()
    uptime = heartbeat.get_uptime()
    mins, secs = divmod(int(uptime), 60)
    hrs, mins = divmod(mins, 60)
    print(
        f"[beat {beat:>6}]  vitality={report['vitality']:.4f}  "
        f"weighted={report['weighted_total']:.4f}  "
        f"penalty={report['sensor_penalty']:.4f}  "
        f"uptime={hrs}h{mins:02d}m{secs:02d}s  "
        f"temp={readings.get('temperature', 0):.1f}°C  "
        f"net={readings.get('network', 0):.1f}ms  "
        f"res={readings.get('resource', 0):.2f}",
        flush=True,
    )


if __name__ == "__main__":
    main()
