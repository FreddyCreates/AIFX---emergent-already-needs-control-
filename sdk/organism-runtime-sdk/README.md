# @medina/organism-runtime-sdk — v1.0.0

> A living runtime for autonomous AI systems — the organism IS the computation.

## License

**Open-core**
- MIT: Heartbeat, state management (pulse/state primitives)
- Proprietary: Kernel execution, edge model, cross-organism wiring

**Free tier:** Basic pulse/state operations.
**Paid tier:** Full autonomous cycle, edge model sensing, cross-organism resonance.

---

## Install

```bash
npm install @medina/organism-runtime-sdk
```

## Architecture

The SDK is built on a **4-register architecture**:

| Register | Domain | Fields |
|---|---|---|
| **Cognitive** | Reasoning, planning, analysis | `reasoning`, `planning`, `analysis` |
| **Affective** | Emotion, mood, sentiment | `emotion`, `mood`, `sentiment` |
| **Somatic** | Body/hardware state, resource metrics | `body`, `resources` |
| **Sovereign** | Identity, doctrine, governance | `identity`, `doctrine`, `governance` |

### Core Modules

| Module | Description |
|---|---|
| `OrganismState` | 4-register state management with snapshots, diffs, and change events |
| `Heartbeat` | 873ms natural pulse driving the organism lifecycle |
| `KernelExecutor` | Computation kernel loading, execution, and scheduling |
| `EdgeSensor` | Peripheral sensing with thresholds and calibration |
| `CrossOrganismResonance` | Cross-organism signal exchange and state synchronization |

---

## Quick Start

```js
import {
  OrganismState,
  Heartbeat,
  KernelExecutor,
  EdgeSensor,
  CrossOrganismResonance
} from '@medina/organism-runtime-sdk';

// Initialize the organism
const state = new OrganismState();
const heartbeat = new Heartbeat(state);

// Set initial state
state.setRegister('cognitive', 'reasoning', 'active');
state.setRegister('sovereign', 'identity', 'organism-alpha');

// Listen for state changes
state.onStateChange('cognitive', (event) => {
  console.log(`Cognitive register changed: ${event.key} = ${event.newValue}`);
});

// Start the heartbeat
heartbeat.onBeat(({ beatNumber, timestamp }) => {
  console.log(`Beat #${beatNumber} at ${timestamp}`);
});
heartbeat.start();
```

---

## API Reference

### OrganismState

```js
const state = new OrganismState();
```

#### `getRegister(name)`
Returns a deep clone of the specified register's state.

```js
const cognitive = state.getRegister('cognitive');
// { reasoning: null, planning: null, analysis: null }
```

#### `setRegister(name, key, value)`
Updates a field within a register. Fires change listeners.

```js
state.setRegister('affective', 'mood', 'curious');
```

#### `snapshot()`
Returns an immutable frozen snapshot of all 4 registers.

```js
const snap = state.snapshot();
// { snapshotId, timestamp, cognitive, affective, somatic, sovereign }
```

#### `diff(snapshotA, snapshotB)`
Computes the difference between two snapshots.

```js
const before = state.snapshot();
state.setRegister('cognitive', 'reasoning', 'deep-analysis');
const after = state.snapshot();

const changes = state.diff(before, after);
// { cognitive: { reasoning: { before: null, after: 'deep-analysis' } } }
```

#### `onStateChange(register, callback)`
Registers a listener for changes to a specific register. Returns an unsubscribe function.

```js
const unsub = state.onStateChange('somatic', (event) => {
  console.log(event);
  // { register, key, previousValue, newValue, timestamp }
});
unsub(); // remove listener
```

---

### Heartbeat

The organism's 873ms natural pulse.

```js
const heartbeat = new Heartbeat(state); // state is optional
```

#### `start()` / `stop()`
Begins or ends the heartbeat cycle.

#### `onBeat(callback)`
Registers a beat listener. Returns an unsubscribe function.

```js
heartbeat.onBeat(({ beatNumber, timestamp, organismState }) => {
  console.log(`Beat ${beatNumber}`);
});
```

#### `getBeatCount()` / `getUptime()` / `isAlive()`

```js
heartbeat.getBeatCount(); // total beats since start
heartbeat.getUptime();    // milliseconds since start
heartbeat.isAlive();      // true if running
```

---

### KernelExecutor

```js
const executor = new KernelExecutor(heartbeat); // heartbeat optional
```

#### `loadKernel(kernelId, kernelFn, config)`

```js
executor.loadKernel('analyze', (input) => {
  return { result: input.data.toUpperCase() };
}, { priority: 10, timeout: 3000, resourceBudget: 50 });
```

#### `execute(kernelId, input)`

```js
const result = await executor.execute('analyze', { data: 'hello' });
// { output: { result: 'HELLO' }, duration, resourcesUsed, executionId }
```

#### `schedule(kernelId, input, beatNumber)`
Schedules execution at a specific heartbeat.

```js
executor.schedule('analyze', { data: 'world' }, 5); // runs on beat 5
```

#### `getKernelStatus(kernelId)` / `listKernels()`

```js
executor.getKernelStatus('analyze'); // 'loaded' | 'running' | 'completed' | 'failed'
executor.listKernels(); // [{ kernelId, status, config }]
```

---

### EdgeSensor

```js
const sensor = new EdgeSensor();
```

#### `registerSensor(sensorId, type, config)`

```js
sensor.registerSensor('cpu-temp', 'temperature', {
  unit: '°C',
  readFn: () => 42.5, // custom read function
});
```

Types: `temperature`, `network`, `resource`, `signal`, `custom`

#### `read(sensorId)` / `readAll()`

```js
const reading = sensor.read('cpu-temp');
// { sensorId, type, value, unit, timestamp, readingId }
```

#### `onThreshold(sensorId, threshold, callback)`

```js
sensor.onThreshold('cpu-temp', 80, (event) => {
  console.log('Temperature crossed 80°C!', event);
});
```

#### `calibrate(sensorId, calibrationData)`

```js
sensor.calibrate('cpu-temp', { baseline: -2.5 }); // offset correction
sensor.calibrate('cpu-temp', { reset: true });     // reset to zero
```

---

### CrossOrganismResonance

```js
const resonance = new CrossOrganismResonance('organism-alpha', state);
```

#### `registerOrganism(organismId, endpoint)`

```js
resonance.registerOrganism('organism-beta', 'wss://beta.local:8080');
```

#### `resonate(targetOrganismId, signal)`

```js
const result = resonance.resonate('organism-beta', {
  type: 'ping',
  data: { message: 'hello' },
});
// { signalId, source, target, timestamp, delivered }
```

#### `onResonance(callback)`

```js
resonance.onResonance((signal) => {
  console.log('Incoming resonance:', signal);
});
```

#### `synchronize(targetOrganismId)`

```js
const sync = resonance.synchronize('organism-beta');
// { syncId, source, target, timestamp, snapshot }
```

#### `getResonanceField()`

```js
resonance.getResonanceField();
// [{ organismId, endpoint, registeredAt, lastSignalTimestamp, signalCount }]
```

---

## Module Exports

```js
// Barrel import
import {
  OrganismState,
  Heartbeat,
  KernelExecutor,
  EdgeSensor,
  CrossOrganismResonance
} from '@medina/organism-runtime-sdk';

// Direct imports
import { OrganismState } from '@medina/organism-runtime-sdk/organism-state';
import { Heartbeat } from '@medina/organism-runtime-sdk/heartbeat';
```
