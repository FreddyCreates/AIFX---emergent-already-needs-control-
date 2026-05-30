# ⚡ Alpha Tools SDK

Production-ready tool primitives for the Sovereign Organism.

## Categories

| Category | Class | Purpose |
|----------|-------|---------|
| Transform | `AlphaTransformer` | Data mutation, format conversion, schema mapping |
| Analysis | `AlphaAnalyzer` | Pattern detection, anomaly scoring, signal extraction |
| Generation | `AlphaGenerator` | Content creation, synthesis, multi-modal output |
| Connection | `AlphaConnector` | API bridging, protocol translation, mesh routing |
| Automation | `AlphaAutomator` | Workflow orchestration, trigger chains, batch ops |

## Quick Start

```javascript
import { createAlphaTools } from '@medina/alpha-tools';

const tools = createAlphaTools();

// Use built-in plugins
const result = tools.invokePlugin('phi-encoder', { name: 'test', value: 42 });

// Use built-in adapters
const adapted = tools.invokeAdapter('rest-api', { method: 'POST', url: '/api/data' });

// Direct tool access
tools.analyzer.analyze([1, 2, 3, 100, 4, 5]);
tools.generator.registerTemplate('greeting', 'Hello {{name}}!');
tools.generator.generate('greeting', { name: 'World' });
```

## Built-in Plugins

- **json-flattener** — Flatten nested objects to dot-notation
- **markdown-generator** — Convert data to markdown
- **data-validator** — Validate object fields
- **phi-encoder** — φ-weighted encoding
- **batch-processor** — Batch items with phi weights

## Built-in Adapters

- **rest-api** — HTTP/REST protocol adapter
- **graphql** — GraphQL query adapter
- **websocket** — WebSocket message adapter
- **event-bus** — Pub/sub event adapter
- **organism-mesh** — Organism intelligence wire adapter

## Extending

```javascript
import { AlphaPlugin, AlphaAdapter } from '@medina/alpha-tools';

class MyPlugin extends AlphaPlugin {
  constructor() { super('my-plugin', '1.0.0'); }
  run(input) { return { ...input, enhanced: true }; }
}

class MyAdapter extends AlphaAdapter {
  constructor() { super('my-adapter', 'custom'); }
  transform(data) { return { wrapped: data }; }
}
```
