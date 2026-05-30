# Sovereign Organism Runtime — Python

A living, phi-encoded organism with a 873 ms heartbeat, 4-register state architecture, kernel execution, edge sensing, and cross-organism resonance.

## Quick start

```bash
# Run directly (no install required, stdlib only)
python -m organism

# Or install and use the entry-point
pip install -e .
organism
```

## Architecture

| Component | Module | Purpose |
|-----------|--------|---------|
| **Constants** | `organism.constants` | PHI, GOLDEN_ANGLE, HEARTBEAT_MS |
| **State** | `organism.state` | Thread-safe 4-register store (cognitive / affective / somatic / sovereign) |
| **Heartbeat** | `organism.heartbeat` | 873 ms daemon pulse with beat callbacks |
| **Kernel** | `organism.kernel` | Load, schedule, and execute kernel functions with timeout |
| **Sensor** | `organism.sensor` | Edge sensing with thresholds and calibration |
| **Resonance** | `organism.resonance` | Cross-organism communication and synchronisation |
| **Vitality** | `organism.vitality` | Phi-weighted composite health score |

## Constants

```
PHI           = 1.618033988749895
GOLDEN_ANGLE  = 137.508
HEARTBEAT_MS  = 873
```

## Requirements

- Python ≥ 3.10
- No external dependencies — stdlib only
