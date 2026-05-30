# Organism Runtime — C++17

Sovereign organism runtime with phi-encoded state architecture.

## Constants

| Symbol | Value |
|---|---|
| PHI | 1.618033988749895 |
| GOLDEN_ANGLE | 137.508° |
| HEARTBEAT | 873 ms |

## Architecture

Four registers: **Cognitive**, **Affective**, **Somatic**, **Sovereign**.
Each contains three phi-weighted fields. Vitality is scored across all registers using golden-ratio weighting.

## Build

```bash
cd organism/cpp
cmake -B build .
cmake --build build
```

## Run

```bash
./build/organism
```

The organism runs forever. Send `SIGINT` (Ctrl-C) or `SIGTERM` to shut down gracefully.
