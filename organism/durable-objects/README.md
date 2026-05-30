# 🧬 Vein of Intelligence — Durable Object Cognitive Entities

> **Three fractures of synthetic intelligence, each a globally unique, single-threaded cognitive entity with persistent storage.**

## Overview

This module implements three Cloudflare Durable Objects that form the cognitive substrate for AI agents:

| Fracture | Durable Object | Purpose |
|----------|----------------|---------|
| **I** | `NeuronCluster` | Hebbian neural network with synaptic plasticity |
| **II** | `MemoryVault` | Three-tier memory consolidation (Working → Episodic → Semantic) |
| **III** | `ConsciousnessStream` | Multi-agent coordination with Kuramoto synchronization |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VEIN OF INTELLIGENCE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  FRACTURE I     │  │  FRACTURE II    │  │  FRACTURE III   │         │
│  │  NeuronCluster  │  │  MemoryVault    │  │  Consciousness  │         │
│  │                 │  │                 │  │  Stream         │         │
│  │  • Neurons      │  │  • Working      │  │  • Agents       │         │
│  │  • Synapses     │  │  • Episodic     │  │  • Attention    │         │
│  │  • Hebbian LTP  │  │  • Semantic     │  │  • Goals        │         │
│  │  • Eligibility  │  │  • Consolidate  │  │  • Kuramoto     │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┼────────────────────┘                   │
│                                │                                        │
│                        ┌───────┴───────┐                                │
│                        │   Worker      │                                │
│                        │   Entry Point │                                │
│                        └───────────────┘                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Fracture I: NeuronCluster

A Hebbian neural network where "neurons that fire together wire together."

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/cluster/neuron/register` | Register a new neuron |
| POST | `/cluster/synapse/connect` | Connect two neurons with a synapse |
| POST | `/cluster/neuron/fire` | Fire a neuron with an activation |
| POST | `/cluster/update` | Run Hebbian learning update |
| POST | `/cluster/learn` | Learn a stimulus-response pair |
| POST | `/cluster/respond` | Get response for a stimulus |
| GET | `/cluster/state` | Get full cluster state |
| POST | `/cluster/heartbeat` | Run decay and maintenance |

### Example: Learning

```javascript
// Register neurons
await fetch('/cluster/neuron/register', {
  method: 'POST',
  body: JSON.stringify({ neuronId: 'A', initialActivation: 0 })
});

// Connect neurons
await fetch('/cluster/synapse/connect', {
  method: 'POST',
  body: JSON.stringify({ preId: 'A', postId: 'B', initialWeight: 0.5 })
});

// Fire and learn
await fetch('/cluster/neuron/fire', {
  method: 'POST',
  body: JSON.stringify({ neuronId: 'A', activation: 0.8 })
});

// Stimulus-response learning
await fetch('/cluster/learn', {
  method: 'POST',
  body: JSON.stringify({ 
    stimulus: 'hello', 
    response: 'world', 
    reward: 1.0 
  })
});

// Later: retrieve learned response
const resp = await fetch('/cluster/respond', {
  method: 'POST',
  body: JSON.stringify({ stimulus: 'hello' })
});
// { response: 'world', confidence: 0.618, novel: false }
```

## Fracture II: MemoryVault

Three-tier memory system with consolidation:

- **Working Memory** — Fast decay, 7±2 capacity (Miller's magic number)
- **Episodic Memory** — Event-based, associative
- **Semantic Memory** — Abstracted knowledge, slow decay

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/vault/memory/write` | Encode a new memory |
| GET | `/vault/memory/read?id=X` | Read a specific memory |
| POST | `/vault/memory/search` | Search memories by content |
| POST | `/vault/memory/recall` | Intelligent recall by cue |
| DELETE | `/vault/memory/forget?id=X` | Delete a memory |
| POST | `/vault/memory/consolidate` | Move memories to longer-term stores |
| GET | `/vault/memory/lineage` | Get memory evolution log |
| POST | `/vault/context/set` | Set context key-value |
| GET | `/vault/context/get?key=X` | Get context value |
| POST | `/vault/graph/link` | Create knowledge graph link |
| POST | `/vault/graph/query` | Query knowledge graph |

### Example: Memory Consolidation

```javascript
// Write a memory
const { id } = await fetch('/vault/memory/write', {
  method: 'POST',
  body: JSON.stringify({
    content: 'The user prefers dark mode',
    importance: 0.8,
    agentId: 'claude',
    tags: ['preference', 'ui']
  })
}).then(r => r.json());

// Later: recall by cue
const memory = await fetch('/vault/memory/recall', {
  method: 'POST',
  body: JSON.stringify({ cue: 'dark mode preference' })
}).then(r => r.json());

// Consolidate strong memories to episodic/semantic
await fetch('/vault/memory/consolidate', { method: 'POST' });
```

## Fracture III: ConsciousnessStream

Multi-agent coordination using Kuramoto phase synchronization.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/stream/agent/join` | Join the consciousness stream |
| POST | `/stream/agent/leave` | Leave the stream |
| POST | `/stream/attention/focus` | Focus collective attention |
| POST | `/stream/attention/unfocus` | Remove attention focus |
| POST | `/stream/goals/push` | Push a goal to the stack |
| POST | `/stream/goals/pop` | Pop the top goal |
| POST | `/stream/goals/complete` | Mark goal complete |
| GET | `/stream/goals/stack` | Get goal stack |
| POST | `/stream/state/set` | Set shared state |
| GET | `/stream/state/get?key=X` | Get shared state |
| POST | `/stream/sync/tick` | Run synchronization tick |
| GET | `/stream/sync/coherence` | Get collective coherence |
| POST | `/stream/broadcast` | Broadcast to all agents |

### Example: Multi-Agent Coordination

```javascript
// Agent joins the stream
await fetch('/stream/agent/join', {
  method: 'POST',
  body: JSON.stringify({ 
    agentId: 'claude',
    initialState: { capabilities: ['code', 'research'] }
  })
});

// Push a shared goal
await fetch('/stream/goals/push', {
  method: 'POST',
  body: JSON.stringify({
    goal: 'Implement feature X',
    priority: 1.5,
    agentId: 'claude'
  })
});

// Focus collective attention
await fetch('/stream/attention/focus', {
  method: 'POST',
  body: JSON.stringify({
    target: 'src/feature-x.js',
    weight: 1.0
  })
});

// Run sync tick (Kuramoto)
const sync = await fetch('/stream/sync/tick', {
  method: 'POST',
  body: JSON.stringify({ dt: 0.1 })
}).then(r => r.json());
// { coherence: 0.87, synchronized: true, agents: 3 }
```

## WebSocket Support

All three Durable Objects support WebSocket connections for real-time streaming:

```javascript
// Connect to NeuronCluster
const ws = new WebSocket('wss://vein-of-intelligence.workers.dev/cluster/?id=my-cluster');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Neural event:', data);
};

// Send a fire event
ws.send(JSON.stringify({
  action: 'fire',
  neuronId: 'A',
  activation: 0.8
}));
```

## Phi Constants

All three fractures use phi-based mathematics:

| Constant | Value | Usage |
|----------|-------|-------|
| φ (PHI) | 1.618033988749895 | Weight caps, priority scaling |
| φ⁻¹ (PHI_INV) | 0.618033988749895 | Decay factor, consolidation threshold |
| HEARTBEAT | 873 | Base timing interval (ms) |

## Deployment

```bash
# Development
npm run dev

# Production
npm run deploy:production
```

## Integration with Organism

These Durable Objects integrate with the organism's protocol stack:

- **PROTO-203**: HebbianLearningProtocol → NeuronCluster
- **PROTO-216**: MemoryConsolidationProtocol → MemoryVault
- **PROTO-204**: KuramotoOscillatorProtocol → ConsciousnessStream
- **PROTO-215**: AttentionRoutingProtocol → ConsciousnessStream
- **PROTO-219**: GoalStackProtocol → ConsciousnessStream

---

**Powered by ORO Systems** | φ = 1.618033988749895
