# Cloudflare Workers Protocol SDK

SDK for binding AURO/ORO protocols to Cloudflare Workers in the sovereign edge mesh.

## Installation

```javascript
import { 
  WorkerProtocolLoader, 
  createWorkerLoader, 
  WORKER_IDS,
  getTopology 
} from './src/index.js';
```

## Usage

### Initialize a Worker with Protocol Bindings

```javascript
import { createWorkerLoader, WORKER_IDS } from 'sdk/cloudflare-workers';

// Create loader for gate-node
const loader = createWorkerLoader(WORKER_IDS.GATE_NODE);

// Initialize all 10 bound protocols
await loader.initialize();

// Access specific protocol
const geometricKey = loader.getProtocol('PROTO-226');
const cyberDefense = loader.getProtocol('PROTO-225');

// Run heartbeat tick
const tickResult = loader.heartbeatTick();

// Get full state
const state = loader.getState();
```

### Worker IDs

| Constant | Worker ID | Role |
|----------|-----------|------|
| `GATE_NODE` | gate-node | Protocol Gateway |
| `KNOWLEDGE_REALM` | knowledge-realm | Memory Core |
| `NOVA_SOVEREIGN` | nova-sovereign | Nova Protocol Core |
| `ENTERPRISE_OS` | enterprise-os-intelligence | OS Layer |
| `INTELLIGENCE_ENGINE` | enterprisentelligence | Intelligence Engine |
| `CRYPTO_CORE` | crimson-dawn-4f6d | Crypto Core |
| `AI_ORCHESTRATOR` | patient-shape-7a30 | AI Orchestrator |
| `ORCHESTRATION_ENGINE` | workflows-starter-template | Orchestration Engine |
| `HONEYPOT_ADMIN` | honeypot-admin | Honeypot |
| `HONEYPOT_PORTAL` | honeypot-portal | Honeypot |
| `PROBE_NODE` | probe-node | Auto-Probe |

## Protocol Bindings

Each worker is bound to exactly **10 protocols** from the 47-protocol stack.

See `docs/cloudflare-worker-fleet-charter.md` for full binding details.

## Phi Constants

```javascript
const PHI = 1.618033988749895;        // The golden ratio
const PHI_INV = 0.618033988749895;    // φ⁻¹ = φ - 1
const HEARTBEAT = 873;                 // Base heartbeat in milliseconds
const GOLDEN_ANGLE = 137.508;          // Optimal phyllotaxis angle
const EMERGENCE_THRESHOLD = 0.618;     // Kuramoto order parameter threshold
```

## License

Sovereign — AURO/ORO Systems
