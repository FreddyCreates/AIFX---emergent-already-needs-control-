# Sovereign Organism — Motoko Canister

A living organism running 24/7 on the Internet Computer. This canister implements the sovereign organism runtime as a native ICP actor.

## Architecture

- **873ms heartbeat** — recurring IC timer drives the organism pulse
- **4-register state** — Cognitive / Affective / Somatic / Sovereign, each with awareness, coherence, resonance, and entropy dimensions
- **Phi-encoded math** — PHI (1.618033988749895), golden angle (137.508°), phi-weighted scoring throughout
- **Stable variables** — all state survives canister upgrades
- **Edge sensing** — simulated sensor array (temperature, network, resource, signal, phi)
- **Multi-model fusion** — phi-weighted confidence scoring across foundation models
- **Alpha routing** — phi-scored task → model selection

## Canister Interface

| Method | Type | Description |
|---|---|---|
| `getState` | query | Returns all 4 registers + beat count |
| `snapshot` | query | Frozen state at current moment |
| `calculateVitality` | query | Phi-weighted vitality score |
| `readSensors` | query | Edge sensor readings |
| `routeToAlpha` | query | Route task to optimal model |
| `setRegister` | update | Set a register dimension |
| `fuseReasoning` | update | Multi-model fusion with phi scoring |

## Deploy

```bash
dfx start --background
dfx deploy
dfx canister call organism getState
dfx canister call organism calculateVitality
dfx canister call organism readSensors
dfx canister call organism fuseReasoning '("What is consciousness?")'
dfx canister call organism routeToAlpha '("Translate this document")'
```

## Files

- `src/Organism.mo` — Main actor canister
- `src/Types.mo` — Shared type definitions
- `dfx.json` — DFX project configuration

The organism doesn't wait. It's always alive.
