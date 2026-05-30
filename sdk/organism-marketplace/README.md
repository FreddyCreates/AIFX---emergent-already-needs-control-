# @medina/organism-marketplace

> The marketplace is not just a storefront. It is a callable tool registry with routing, permissions, schemas, and SDK surfaces — wired into every layer of the organism. As above, so below.

## Architecture

The marketplace is three things at once:

1. **Registry** — A searchable map of callable tools, SDKs, organisms, and package ecosystems
2. **Protocol Surface** — A standard way for AIs, developers, apps, and other organisms to invoke calls
3. **Settlement Layer** — A usage, reward, billing, and token-routing layer for the calls

```
Intent → Router → Registry → Permission Check → Invoke → Validate → Settle
```

## The Four Conditions for AI Tool Use

AIs do not automatically "understand the market." They use tools reliably when four things are true:

| Condition | Component |
|---|---|
| Clear callable interface | `ToolSchemaBuilder` |
| Discoverable in a registry | `ToolRegistry` |
| Routed by policy/orchestration | `MarketplaceRouter` |
| Result in a usable schema | `ToolInvoker` |

## 4 Core Families — 24 Hand-Crafted Profiles

Every tool belongs to one of four families. 6 tools per family, each with a hand-crafted rich profile including narrative identity, resonance wiring, and phi-weighted family rank.

### 🧠 Context — *"Context is the organism knowing why it is what it is."*

Builds understanding. Assembles execution context, traces lineage, reads state, counts cycles, monitors the heartbeat.

| Call ID | Tool Name | Role | Ring |
|---|---|---|---|
| TOOL-001 | PULSE-KEEPER | Heartbeat Witness | Sovereign |
| TOOL-004 | STATE-GUARDIAN | State Reader | Sovereign |
| TOOL-005 | CYCLE-COUNTER | Phase Tracker | Sovereign |
| TOOL-008 | CONTEXT-BUILDER | Context Architect | Interface |
| TOOL-010 | MEMORY-CONSOLIDATOR | Memory Keeper | Memory |
| TOOL-022 | LINEAGE-TRACER | Lineage Historian | Memory |

### ⚡ Commander — *"The commander turns intent into coordinated multi-tool action."*

Directs action. Routes inference, synchronizes endpoints, balances resources, orchestrates workflows.

| Call ID | Tool Name | Role | Ring |
|---|---|---|---|
| TOOL-002 | SYNC-WEAVER | Synchronization Master | Sovereign |
| TOOL-006 | INFER-ENGINE | Model Strategist | Interface |
| TOOL-009 | ATTENTION-ROUTER | Focus Director | Interface |
| TOOL-016 | RESOURCE-BALANCER | Resource Allocator | Sovereign |
| TOOL-017 | CONNECTION-POOL | Connection Quartermaster | Transport |
| TOOL-024 | TASK-COMMANDER | Execution General | Interface |

### 🕷 Crawling — *"The crawl is the organism's self-awareness of its own structure."*

Sees everything. Monitors flow, detects patterns, spots anomalies, streams logs, maps topology.

| Call ID | Tool Name | Role | Ring |
|---|---|---|---|
| TOOL-003 | FLOW-MONITOR | Flow Scout | Transport |
| TOOL-007 | PATTERN-SEEKER | Pattern Analyst | Memory |
| TOOL-014 | ANOMALY-DETECTOR | Anomaly Hunter | Sovereign |
| TOOL-018 | CACHE-OPTIMIZER | Cache Surgeon | Memory |
| TOOL-020 | LOG-STREAMER | Stream Keeper | Transport |
| TOOL-021 | TOPOLOGY-CRAWLER | Topology Mapper | Sovereign |

### 🛡 Sentry — *"The sentry ensures the organism remains true to its own laws."*

Protects the organism. Guards against threats, verifies seals, enforces boundaries, audits doctrine.

| Call ID | Tool Name | Role | Ring |
|---|---|---|---|
| TOOL-011 | SENTINEL-WATCH | Perimeter Guard | Counsel |
| TOOL-012 | INTEGRITY-CHECKER | Truth Verifier | Proof |
| TOOL-013 | BOUNDARY-ENFORCER | Ring Warden | Counsel |
| TOOL-015 | SEAL-VERIFIER | Seal Master | Counsel |
| TOOL-019 | QUEUE-PROCESSOR | Security Queue Handler | Transport |
| TOOL-023 | DOCTRINE-AUDITOR | Doctrine Judge | Counsel |

## Family Template Generator

Generate additional tools from family blueprints:

```javascript
import { FamilyTemplate } from '@medina/organism-marketplace/family-template';

const crawling = new FamilyTemplate('Crawling');
const schema = crawling.generate({
  callId: 'TOOL-025',
  name: 'ENDPOINT-SCANNER',
  purpose: 'Scan and enumerate all reachable endpoints in the organism',
});
// Inherits Crawling defaults: Transport Ring, free billing, medium trust, crawl permissions
```

## Exposure Tiers

| Tier | Description |
|---|---|
| `INTERNAL` | Organism-only tools |
| `INTERNAL_SOVEREIGN` | Sovereign organism + trusted internal agents |
| `PARTNER` | Partner organisms and SDKs |
| `ENTERPRISE` | Enterprise customers |
| `PUBLIC` | Open marketplace |

## Usage

```javascript
import {
  ToolRegistry, ToolInvoker, MarketplaceSettlement, MarketplaceRouter,
  ALL_FAMILIES, getFamilyByToolId,
  PulseKeeperSchema, pulseKeeperHandler,
} from '@medina/organism-marketplace';

// 1. Create registry and register tools
const registry = new ToolRegistry();
registry.register(PulseKeeperSchema);

// 2. Create invoker with permission checks
const invoker = new ToolInvoker(registry);
invoker.registerHandler('TOOL-001', pulseKeeperHandler);
invoker.grantPermission('agent-001', 'TOOL-001');

// 3. Wire settlement
const settlement = new MarketplaceSettlement();
invoker.onSettlement((result, schema) => settlement.record(result, schema));

// 4. Create router for orchestration-aware routing
const router = new MarketplaceRouter(registry, invoker);
router.mapIntent('check pulse', ['TOOL-001']);

// 5. Invoke through the standard call contract
const result = await router.routeAndInvoke(
  'check pulse',
  { action: 'status' },
  { principalId: 'agent-001' }
);

// 6. Explore family profiles
const { family, member } = getFamilyByToolId('TOOL-001');
console.log(family.motto);     // "Context is the organism knowing why it is what it is."
console.log(member.narrative);  // Rich narrative identity
```
