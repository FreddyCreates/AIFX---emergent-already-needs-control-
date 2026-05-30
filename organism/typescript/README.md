# Sovereign Organism Runtime — TypeScript

A living TypeScript runtime implementing the sovereign organism architecture with a **873ms heartbeat**, 4-register state, phi-encoded math, kernel execution, edge sensing, and cross-organism resonance.

## Architecture

| Component | File | Purpose |
|---|---|---|
| **Types** | `src/types.ts` | All interfaces, types, and phi constants |
| **OrganismState** | `src/organism-state.ts` | 4-register state (Cognitive/Affective/Somatic/Sovereign) with change listeners |
| **Heartbeat** | `src/heartbeat.ts` | 873ms pulse — the fundamental clock |
| **KernelExecutor** | `src/kernel-executor.ts` | Load and execute computation kernels with timeout isolation |
| **EdgeSensor** | `src/edge-sensor.ts` | Sense edge environment (temperature/network/resource/signal/custom) |
| **CrossOrganismResonance** | `src/cross-organism-resonance.ts` | Exchange resonance signals with peer organisms |
| **VitalityCalculator** | `src/vitality.ts` | Phi-weighted vitality scoring across all registers and sensors |

## Constants

- **PHI** = `1.618033988749895`
- **GOLDEN_ANGLE** = `137.508°`
- **HEARTBEAT** = `873ms`

## Quick Start

```bash
npm install
npm start
```

The organism boots, begins beating at 873ms, runs kernels, polls sensors, and logs vitality every 5 beats. It runs 24/7 until explicitly stopped.

## Register Architecture

Each register is a typed object with numeric fields scored in `[0, 1]`:

- **Cognitive**: reasoning, pattern_recognition, abstraction, memory_integration
- **Affective**: valence, arousal, coherence, resonance
- **Somatic**: cpu_load, memory_pressure, io_throughput, network_latency
- **Sovereign**: autonomy, integrity, alignment, phi_ratio

## Kernels

Kernels are async functions executed on heartbeat intervals with `Promise.race` timeout:

```typescript
kernelExecutor.loadKernel(
  { id: 'my-kernel', name: 'My Kernel', timeoutMs: 500, priority: 1, runOnBeat: true, beatInterval: 3 },
  async (state, beatNumber) => { /* computation */ }
);
```

## License

MIT
