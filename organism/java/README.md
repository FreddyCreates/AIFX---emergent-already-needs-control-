# Organism Runtime — Java 17

Sovereign organism runtime with phi-encoded state architecture.

## Constants

| Symbol | Value |
|---|---|
| PHI | 1.618033988749895 |
| GOLDEN_ANGLE | 137.508° |
| HEARTBEAT | 873 ms |

## Architecture

Four registers: **Cognitive**, **Affective**, **Somatic**, **Sovereign**.
Each contains phi-weighted fields. Vitality is scored across all registers using golden-ratio weighting.

## Build

```bash
cd organism/java
mvn package
```

## Run

```bash
java -jar target/organism-runtime-1.0.0.jar
```

The organism runs forever. Send `SIGINT` (Ctrl-C) or `SIGTERM` to shut down gracefully.

## Components

| Class | Role |
|---|---|
| `OrganismConstants` | PHI, GOLDEN_ANGLE, HEARTBEAT_MS, register weights |
| `RegisterState` | Thread-safe 4-register state with snapshot support |
| `Heartbeat` | 873 ms fixed-rate scheduler with listener pattern |
| `KernelExecutor` | Async kernel execution with timeout via CompletableFuture |
| `EdgeSensor` | Typed edge sensors with phi-modulated simulation |
| `VitalityCalculator` | Phi-weighted vitality scoring across registers and sensors |
| `Organism` | Main entry point — wires everything and runs 24/7 |
