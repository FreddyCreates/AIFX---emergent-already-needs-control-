# @medina/organism-arms

**Extensions as Organism Arms** — the organism invokes its own extensions as motor and sensory capabilities.

## Architecture

The organism no longer waits for users to interact with extensions. It reaches out with its own arms:

```
SENSE (sensory arms)  →  THINK (cognitive arms)  →  ACT (motor arms)
     ↑                                                      │
     └──────────────────────────────────────────────────────┘
                    873ms × φ cycle (≈1412ms)
```

### Arm Types

| Type | Role | Extensions |
|------|------|------------|
| **Sensory** | Perception (inbound) | Data Alchemist, Sentinel Watch, Knowledge Cartographer, Data Oracle |
| **Cognitive** | Reasoning (internal) | Sovereign Mind, Logic Prover, Research Nexus, Memory Palace |
| **Motor** | Action (outbound) | Screen Commander, Code Sovereign, Voice Forge, Vision Weaver |

## Usage

```js
import { ArmRegistry, ArmExecutor, SenseActLoop } from '@medina/organism-arms';

// 1. Register extensions as arms
const registry = new ArmRegistry();
registry.registerArm(
  { id: 'EXT-024', slug: 'screen-commander', name: 'Screen Commander', wire: 'intelligence-wire/commander', engines: ['DOMControl'] },
  async ({ intent, payload }) => { /* invoke extension logic */ }
);

// 2. Create executor (the motor cortex)
const executor = new ArmExecutor(registry);

// 3. Reach with a single arm
const result = await executor.reach({
  targetArm: 'screen-commander',
  intent: 'act',
  payload: { target: '#submit-btn' },
});

// 4. Or run the full autonomous loop
const loop = new SenseActLoop(executor, {
  decisionFn: ({ sensed, thought }) => [
    { armSlug: 'screen-commander', action: { target: '#next' } }
  ],
});
loop.start(); // pulses every 873ms × φ
```

## Protocol

PROTO-253: Organism Arm Invocation Protocol (`protocols/organism-arm-invocation-protocol.js`)

Defines the state machine, φ-backoff retry logic, cycle health scoring, and escalation thresholds.
