# @medina/intelligence-routing-sdk — v1.0.0

> Intelligent task routing for AI workforces

**License:** Open-core (MIT routing layer, proprietary RUDN + wire dispatch)

**Monetization:** Free for single-model routing · Paid for multi-model orchestration + RUDN

---

## What It Ships

| Module | Description |
|---|---|
| **ModelRouter** | Capability-aware model selection with adaptive scoring |
| **CommandParser** | Natural-language and structured command parsing with suggestions |
| **TerminalDispatch** | Fleet management for local, remote, and edge execution terminals |
| **IntelligenceWire** | Point-to-point intelligence channels with metrics and encryption config |
| **WorkforceRouter** | Skill-based agent assignment, rebalancing, and escalation |

---

## Installation

```bash
npm install @medina/intelligence-routing-sdk
```

## Quick Start

```js
import {
  ModelRouter,
  CommandParser,
  TerminalDispatch,
  IntelligenceWire,
  WorkforceRouter,
} from '@medina/intelligence-routing-sdk';
```

---

## API Reference

### ModelRouter

```js
const router = new ModelRouter();
```

#### `registerModel(modelId, capabilities, config)`

Registers a model with its capabilities and routing configuration.

- **modelId** `string` — unique identifier
- **capabilities** `string[]` — what the model can do (e.g. `['code-gen', 'summarize']`)
- **config** `{ priority: number, latencyBudget: number, costTier: 'free' | 'standard' | 'premium' }`

```js
router.registerModel('gpt-4', ['code-gen', 'reasoning', 'summarize'], {
  priority: 1,
  latencyBudget: 3000,
  costTier: 'premium',
});
```

#### `route(task)`

Selects the single best model for a task.

- **task** `{ type: string, requirements: string[], priority: 'low' | 'medium' | 'high' | 'critical' }`
- **returns** `{ modelId, score, capabilities }` or `null`

```js
const best = router.route({
  type: 'code-review',
  requirements: ['code-gen', 'reasoning'],
  priority: 'high',
});
```

#### `routeMulti(task, count)`

Returns the top N models for multi-model orchestration.

#### `getRoutingTable()`

Returns all registered models with capabilities, config, and performance stats.

#### `recordOutcome(modelId, taskId, result)`

Records success/failure for adaptive routing.

```js
router.recordOutcome('gpt-4', 'task-123', { success: true, latency: 1200 });
```

---

### CommandParser

```js
const parser = new CommandParser();
```

#### `parse(rawInput)`

Parses natural language or structured input into a normalised command.

```js
const cmd = parser.parse('deploy api --env=production --verbose');
// { action: 'deploy', target: 'api', params: { env: 'production' }, flags: ['verbose'], raw: '...' }
```

#### `registerCommand(pattern, handler)`

Registers a command pattern (regex or comma-separated keywords) with a handler.

```js
parser.registerCommand('deploy,ship', (parsed) => { /* ... */ });
parser.registerCommand(/^rollback\s/, (parsed) => { /* ... */ });
```

#### `validate(parsed)`

Validates a parsed command against registered patterns.

#### `suggest(partialInput)`

Returns matching command names for auto-completion.

---

### TerminalDispatch

```js
const dispatch = new TerminalDispatch();
```

#### `createTerminal(terminalId, config)`

- **config** `{ type: 'local' | 'remote' | 'edge', capabilities: string[], maxConcurrency: number }`

#### `dispatch(terminalId, command)`

Sends a command to a terminal. Returns a promise that resolves with execution results.

#### `broadcast(command)`

Sends a command to all online terminals.

#### `getTerminalStatus(terminalId)`

Returns health, active tasks, and utilization percentage.

#### `listTerminals()`

Returns all terminals and their states.

---

### IntelligenceWire

```js
const wire = new IntelligenceWire();
```

#### `connect(sourceId, targetId, wireConfig)`

Creates a wire between two intelligence endpoints.

- **wireConfig** `{ bandwidth: number, protocol: string, encryption: boolean }`
- **returns** `{ wireId, sourceId, targetId, state }`

#### `send(wireId, payload)`

Sends data over an established wire. Triggers all registered listeners.

#### `onReceive(wireId, callback)`

Registers a handler that is called when data arrives on the wire.

#### `disconnect(wireId)`

Tears down the wire and removes all listeners.

#### `getWireMetrics(wireId)`

Returns `{ messagesSent, messagesReceived, errors, averageLatencyMs, throughput }`.

---

### WorkforceRouter

```js
const workforce = new WorkforceRouter();
```

#### `registerAgent(agentId, role, skills, availability)`

Registers an agent in the workforce pool.

```js
workforce.registerAgent('agent-1', 'engineer', ['python', 'docker', 'k8s'], 'available');
```

#### `assignTask(task)`

Assigns a task to the best available agent based on skill match and load.

- **task** `{ type: string, requiredSkills: string[], priority: string }`

#### `rebalance()`

Redistributes tasks across agents for optimal load balancing.

#### `getWorkforceStatus()`

Returns all agents, their task counts, skills, and utilization stats.

#### `escalate(taskId, reason)`

Moves a task from its current agent to a higher-capability agent.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Intelligence Routing SDK            │
├──────────┬──────────┬──────────┬────────────────┤
│  Model   │ Command  │ Terminal │  Intelligence  │
│  Router  │  Parser  │ Dispatch │     Wire       │
├──────────┴──────────┴──────────┴────────────────┤
│                Workforce Router                  │
└─────────────────────────────────────────────────┘
```

## License

MIT (routing layer) — see LICENSE for proprietary RUDN + wire dispatch terms.
