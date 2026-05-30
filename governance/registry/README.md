# Atlas Universal Registry — Entities

This directory contains entity definitions for all non-bot Atlas entities.
Bot entities live in `governance/organism/registry/entities/`.

## Entity Classes

| Class | Count | Examples |
|-------|-------|---------|
| Agent | 4 | animus, corpus, sensus, memoria |
| Engine | 4 | chrono, nexoris, quantum_flux, coreograph |
| Organism | 2 | oracle, guardian |

## Atlas URI Scheme

All entities use the URI pattern `atlas://{class}/{name}`:

| Class | URI Pattern | Example |
|-------|-------------|---------|
| Bot | `atlas://bot/{name}` | `atlas://bot/organism-alpha-bot` |
| Agent | `atlas://agent/{name}` | `atlas://agent/animus` |
| Engine | `atlas://engine/{name}` | `atlas://engine/chrono` |
| Organism | `atlas://organism/{name}` | `atlas://organism/oracle` |
| Realm | `atlas://realm/{name}` | `atlas://realm/wyoming` |
| Terminal | `atlas://terminal/{name}` | `atlas://terminal/cli` |

## Registry API

```js
const registry = require('../../sdk/governance/atlas-registry.js');

registry.all();                      // all 31 entities
registry.byClass('Agent');           // 4 agents
registry.byAtlasClass('engine');     // 4 engines
registry.byDomain('heartbeat');      // entities whose domain contains "heartbeat"
registry.byCapability('reason');     // entities with 'reason' capability
registry.byProtocol('PROTO-223');    // entities referencing IntelligenceContractProtocol
registry.summary();                  // { total: 31, byClass: {...}, ... }
```

## Governance Pipeline Assignment

| Class | Default Pipeline |
|-------|-----------------|
| Bot | `pipeline://governance/bot_cycle` |
| Agent | `pipeline://governance/agent_cycle` |
| Engine | `pipeline://governance/topology_cycle` |
| Organism | `pipeline://governance/topology_cycle` |
| Economy bot | `pipeline://governance/economy_cycle` |
| Learning bot | `pipeline://governance/learning_cycle` |
