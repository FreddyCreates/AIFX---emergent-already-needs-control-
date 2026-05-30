# Centerfold Engine Specification

## Purpose

The Centerfold Engine provides a concrete internal engine for processing information through four explicit concepts:

1. **Linear path**
2. **Exponential parallel path**
3. **Perpendicular interaction**
4. **Centerfold convergence**

This implementation is designed to be reviewable and traceable through code boundaries, protocol hooks, tests, and CLI integration.

---

## Module Boundaries

### Core Engine Modules

- `sdk/engines/centerfold-math.js`
  - Mathematical primitives and path builders.
- `sdk/engines/centerfold-kernel-bank.js`
  - Large calibration lattice for kernelized behavior selection.
- `sdk/engines/centerfold-state.js`
  - Durable state snapshots and trend summaries.
- `sdk/engines/centerfold-observability.js`
  - Event and metric lifecycle tracking.
- `sdk/engines/centerfold-engine.js`
  - Unified orchestration runtime.

### Protocol Hook

- `protocols/centerfold-convergence-protocol.js`
  - `activate`, `tick`, and `watchCycle` lifecycle interface.

### API/CLI Integration

- `scripts/centerfold-cycle.js`
  - Direct CLI/API entry point for cycle execution.
- `package.json`
  - `npm run centerfold:cycle`

### Validation

- `test/sdk/centerfold-engine.test.js`

---

## Input Model

The input model supports:

- `vector` (numeric sequence)
- `metadata` (source and contextual envelope)
- `kernel` selector (`kernelId` or entropy-based)

Kernel selection comes from `CENTERFOLD_KERNEL_BANK`, allowing deterministic tuning.

---

## Processing Paths

### 1) Linear Path

`createLinearPath()` applies:

- slope
- bias
- damping
- clamping

It produces deterministic directional transformation and linear energy.

### 2) Exponential Parallel Path

`createExponentialParallel()` applies:

- base
- gain
- parallel branches
- branch aggregation

It creates multiple exponential manifolds and merges them into an aggregate vector.

### 3) Perpendicular Interaction Model

`createPerpendicularInteraction()` computes:

- normalized linear/exponential relationship
- orthogonality estimate
- coupling-derived perpendicular vector

This introduces a cross-axis interaction lane independent from pure linear/exponential progression.

### 4) Centerfold Convergence

`convergeToCenterfold()` produces:

- weighted mixed vector
- center mass
- centerfold energy

The centerfold output is the final unified state for each cycle.

---

## Persistence and State

`CenterfoldStateStore` tracks:

- sequence snapshots
- full cycle outputs
- trend lines (linear, exponential, perpendicular, centerfold, center mass)

State keeps recent history and supports trend summary extraction for governance and observability surfaces.

---

## Observability

`CenterfoldObservability` tracks:

- cycle count
- failure count
- duration metrics (last/avg/max)
- event streams for start/complete/error lifecycle

Event names:

- `centerfold:cycle:start`
- `centerfold:cycle:complete`
- `centerfold:cycle:error`

---

## Protocol Lifecycle

`CenterfoldConvergenceProtocol` implements:

- `activate(payload)`
- `tick(payload)`
- `watchCycle(limit)`
- `status()`

This creates a protocol-level hook that can be invoked in larger orchestration pipelines.

---

## Traceability Notes

Concepts are explicitly represented in file and symbol names:

- **linear** (`createLinearPath`)
- **exponential** (`createExponentialParallel`)
- **perpendicular** (`createPerpendicularInteraction`)
- **centerfold** (`convergeToCenterfold`, `CenterfoldEngine`, `CenterfoldConvergenceProtocol`)

This structure is designed to be readable, testable, and maintainable under further expansion.
