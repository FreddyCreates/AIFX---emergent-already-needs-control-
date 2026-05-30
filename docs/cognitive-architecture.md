# 🧬 Cognitive Organism Architecture

> **The Complete AGI Infrastructure Specification**  
> *Protocol: PROTO-231 | Version: 2.0.0 | Powered by ORO Systems*

---

## The Vision

This isn't just another backend architecture. This is a **living cognitive system** — a synthetic brain operating at the edge, learning from every interaction, protecting itself with an invisible security triad, and grounding all AI responses in verified knowledge.

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                   ║
║                    "Intelligence is not stored, it flows"                         ║
║                                                                                   ║
║                              — The Vein of Intelligence                           ║
║                                                                                   ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 🏗️ Architecture Map

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           COGNITIVE ORGANISM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│                              👤 Users / AI Agents / APIs                            │
│                                         │                                           │
│                                         ▼                                           │
│  ╔═══════════════════════════════════════════════════════════════════════════════╗  │
│  ║                          🛡️ SECURITY TRIAD LAYER                              ║  │
│  ║                                                                               ║  │
│  ║   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐     ║  │
│  ║   │    👁️ WRAITH      │───▶│    👻 GHOST       │───▶│   🌫️ PHANTOM     │     ║  │
│  ║   │                   │    │                   │    │                   │     ║  │
│  ║   │  Invisible Watch  │    │  Honeypot Traps   │    │ Stealth Counter   │     ║  │
│  ║   │  Hebbian Anomaly  │    │  Attacker Profile │    │ Encrypt/Obscure   │     ║  │
│  ║   │  Threat Scoring   │    │  Pattern Extract  │    │ Decoy Injection   │     ║  │
│  ║   └───────────────────┘    └───────────────────┘    └───────────────────┘     ║  │
│  ║                                                                               ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════╝  │
│                                         │                                           │
│                                         ▼                                           │
│  ╔═══════════════════════════════════════════════════════════════════════════════╗  │
│  ║                          🧠 COGNITIVE CORE LAYER                              ║  │
│  ║                                                                               ║  │
│  ║   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐     ║  │
│  ║   │  🔮 NEURON        │    │  💾 MEMORY        │    │  👁‍🗨 CONSCIOUSNESS │     ║  │
│  ║   │    CLUSTER        │◀──▶│    VAULT          │◀──▶│    STREAM         │     ║  │
│  ║   │                   │    │                   │    │                   │     ║  │
│  ║   │  Hebbian Learning │    │  RIL → MML → UEL  │    │  Multi-Agent Hub  │     ║  │
│  ║   │  Kuramoto Sync    │    │  Consolidation    │    │  Attention Focus  │     ║  │
│  ║   │  Synaptic Weights │    │  Dream Cycle      │    │  Goal Stack       │     ║  │
│  ║   └───────────────────┘    └───────────────────┘    └───────────────────┘     ║  │
│  ║                                                                               ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════╝  │
│                                         │                                           │
│                                         ▼                                           │
│  ╔═══════════════════════════════════════════════════════════════════════════════╗  │
│  ║                          📚 KNOWLEDGE LAYER                                   ║  │
│  ║                                                                               ║  │
│  ║   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐     ║  │
│  ║   │  📖 KNOWLEDGE     │    │  🔍 VECTORIZE     │    │  📁 R2 STORAGE    │     ║  │
│  ║   │    CORPUS         │◀──▶│                   │◀──▶│                   │     ║  │
│  ║   │                   │    │                   │    │                   │     ║  │
│  ║   │  Phi-Chunking     │    │  Embeddings       │    │  Original Docs    │     ║  │
│  ║   │  Hebbian Links    │    │  Similarity       │    │  Blob Storage     │     ║  │
│  ║   │  Cluster Org      │    │  TopK Retrieval   │    │  Multi-Format     │     ║  │
│  ║   └───────────────────┘    └───────────────────┘    └───────────────────┘     ║  │
│  ║                                                                               ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════╝  │
│                                         │                                           │
│                                         ▼                                           │
│  ╔═══════════════════════════════════════════════════════════════════════════════╗  │
│  ║                          ⚡ AI GATEWAY LAYER                                  ║  │
│  ║                                                                               ║  │
│  ║   ┌─────────────────────────────────────────────────────────────────────┐     ║  │
│  ║   │                      AI Gateway Controller                          │     ║  │
│  ║   │                                                                     │     ║  │
│  ║   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │     ║  │
│  ║   │  │Workers  │  │ OpenAI  │  │Anthropic│  │DeepSeek │  │ Custom  │   │     ║  │
│  ║   │  │   AI    │  │         │  │         │  │         │  │Provider │   │     ║  │
│  ║   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │     ║  │
│  ║   │                                                                     │     ║  │
│  ║   │  • Caching (90% latency reduction)    • Dynamic Routing            │     ║  │
│  ║   │  • Rate Limiting                       • Provider Fallbacks        │     ║  │
│  ║   │  • Cost Tracking                       • A/B Testing               │     ║  │
│  ║   └─────────────────────────────────────────────────────────────────────┘     ║  │
│  ║                                                                               ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════╝  │
│                                         │                                           │
│                                         ▼                                           │
│  ╔═══════════════════════════════════════════════════════════════════════════════╗  │
│  ║                          💾 PERSISTENCE LAYER                                 ║  │
│  ║                                                                               ║  │
│  ║   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐     ║  │
│  ║   │  🗄️ D1 Database   │    │  ⚡ KV Store      │    │  🧩 DO SQLite     │     ║  │
│  ║   │                   │    │                   │    │                   │     ║  │
│  ║   │  Relational       │    │  Session Cache    │    │  Per-Object SQL   │     ║  │
│  ║   │  Metadata         │    │  Fast Lookup      │    │  Transactional    │     ║  │
│  ║   │  Analytics        │    │  TTL-based        │    │  Isolated State   │     ║  │
│  ║   └───────────────────┘    └───────────────────┘    └───────────────────┘     ║  │
│  ║                                                                               ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════════╝  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Security Triad — Wraith / Ghost / Phantom

Unlike traditional security that blocks and alerts, our **Security Triad** operates as invisible watchers that learn, trap, and counter.

### 👁️ Wraith Guard — The Invisible Watcher

```javascript
// Wraith uses Hebbian learning to detect anomalies
// "Neurons that fire together, wire together"

const threatScore = await wraith.check({
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  path: url.pathname,
  payload: await request.text(),
});

if (threatScore.severity === 'critical') {
  return wraith.block(ip, '24h');
}
if (threatScore.severity === 'high') {
  return redirectToGhost(request); // Send to honeypot
}
```

**Features:**
- 📊 **Threat Scoring** — Multi-factor risk assessment
- 🧠 **Hebbian Anomaly Detection** — Learns normal patterns, flags deviations
- ⏱️ **Adaptive Rate Limiting** — Adjusts limits based on behavior
- 🚫 **IP/Pattern Blocklists** — Permanent + temporary blocks
- 📈 **Attack Statistics** — Historical threat analytics

### 👻 Ghost Honeypot — The Trap

When Wraith detects suspicious activity but isn't certain, it redirects to Ghost:

```javascript
// Ghost operates in different modes:
const ghostModes = {
  MIRROR: 'Mimics real system responses',
  TARPIT: 'Deliberately slow responses',
  RESEARCH: 'Full attack analysis',
  COUNTERINTEL: 'Feeds fake data',
};

// Everything the attacker does is recorded and analyzed
const interaction = {
  attacker: extractAttackerProfile(request),
  techniques: identifyAttackTechniques(request),
  patterns: extractAttackPatterns(request),
};
```

**Features:**
- 📝 **Full Request Recording** — Every byte captured
- 🎭 **Attacker Profiling** — Behavioral fingerprinting
- 🔬 **Pattern Extraction** — SQL injection, XSS, path traversal detection
- 🎪 **Fake Data Generation** — Convincing decoy databases and configs
- 📊 **Threat Level Calculation** — 0-10 severity scoring

### 🌫️ Phantom Stealth — The Countermeasure

*(Coming in v2.1)*

- Traffic obfuscation
- Encryption weaving
- Decoy injection
- Evasive routing

---

## 🧠 Cognitive Core — The Synthetic Brain

Three interconnected Durable Objects that form a complete cognitive system.

### 🔮 NeuronCluster — Neural Computation

```javascript
// Hebbian Learning: "Fire together, wire together"
const cluster = new NeuronCluster();

// Register neurons
await cluster.registerNeuron('concept-ai', { threshold: 0.5 });
await cluster.registerNeuron('concept-ethics', { threshold: 0.5 });
await cluster.registerNeuron('concept-safety', { threshold: 0.5 });

// Create synapses
await cluster.connect('concept-ai', 'concept-ethics', 0.8);
await cluster.connect('concept-ethics', 'concept-safety', 0.9);

// Fire a neuron — causes cascade through connected neurons
const activation = await cluster.fire('concept-ai', 1.0);
// Returns: { fired: ['concept-ai', 'concept-ethics', 'concept-safety'] }
```

**Architecture:**
```
Neuron A ──(weight: 0.8)──▶ Neuron B ──(weight: 0.9)──▶ Neuron C
    │                           │                           │
    └── threshold: 0.5          └── threshold: 0.5          └── threshold: 0.5
        activation: 1.0             activation: 0.8             activation: 0.72
```

**Features:**
- 🔗 **Synaptic Connections** — Weighted directed edges between neurons
- 📈 **Hebbian Learning** — Strengths increase with co-activation
- 🌊 **Kuramoto Synchronization** — Neurons phase-lock for coherent output
- 📉 **Synaptic Decay** — Unused connections weaken over time
- ⚡ **Cascade Activation** — One fire can trigger many

### 💾 MemoryVault — Three-Tier Memory System

Inspired by biological memory consolidation:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MEMORY CONSOLIDATION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐                                                   │
│   │       RIL       │  Recent Interaction Log (Working Memory)          │
│   │   ⏱️ < 24 hours │  Fast access, limited capacity                    │
│   └────────┬────────┘                                                   │
│            │                                                            │
│            ▼ consolidate()                                              │
│   ┌─────────────────┐                                                   │
│   │       MML       │  Mid-term Memory Layer (Short-Term)               │
│   │   🗓️ < 30 days  │  Pattern-tagged, searchable                       │
│   └────────┬────────┘                                                   │
│            │                                                            │
│            ▼ dream()                                                    │
│   ┌─────────────────┐                                                   │
│   │       UEL       │  Universal Experience Log (Long-Term)             │
│   │   ♾️ Permanent   │  Compressed, indexed, eternal                     │
│   └─────────────────┘                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**API:**
```javascript
// Write to RIL (fast, ephemeral)
await vault.write({
  tier: 'RIL',
  type: 'user_interaction',
  content: { user: 'Alice', said: 'Hello AI!' },
});

// Read from any tier
const memory = await vault.read('memory-id');

// Search across tiers
const results = await vault.search({ query: 'conversation about ethics' });

// Trigger consolidation (RIL → MML)
await vault.consolidate();

// Trigger dream cycle (MML → UEL, pattern extraction)
await vault.dream();
```

### 👁‍🗨 ConsciousnessStream — Multi-Agent Coordination

The hub where AI agents connect, synchronize, and coordinate:

```javascript
// Join the stream
const agentId = await stream.join({
  name: 'GPT-4o',
  capabilities: ['reasoning', 'vision', 'code'],
  priority: 1,
});

// Focus attention on a topic
await stream.focus({
  agentId,
  topic: 'user-request-123',
  intensity: 0.9,
});

// Push a goal to the stack
await stream.pushGoal({
  goal: 'Answer user question about quantum computing',
  priority: 1,
  deadline: Date.now() + 30000,
});

// Synchronize with other agents (Kuramoto)
const syncResult = await stream.sync();
// Returns: { coherence: 0.87, phase: 0.432, agents: 5 }
```

**Features:**
- 👥 **Multi-Agent Registry** — Track all connected AI agents
- 🎯 **Attention System** — Focus resources on important topics
- 📚 **Goal Stack** — Priority-ordered objective queue
- 🌊 **Kuramoto Sync** — Achieve coherent multi-agent output
- 📡 **WebSocket Broadcast** — Real-time updates to all agents

---

## 📚 Knowledge Layer — RAG Pipeline

Retrieval-Augmented Generation that grounds AI responses in verified knowledge.

### 📖 KnowledgeCorpus — Smart Dataset

```javascript
// Ingest a document
const result = await corpus.ingest({
  source: 'company-docs',
  content: '... 10,000 words of documentation ...',
  type: 'markdown',
  metadata: { author: 'engineering', version: '2.0' },
});
// Returns: { docId: 'doc-123', chunks: 42 }

// Query for relevant chunks
const chunks = await corpus.query({
  query: 'How do I configure the authentication system?',
  topK: 5,
  filter: { docType: 'markdown' },
});
// Returns top 5 most relevant chunks for context injection
```

### Phi-Harmonic Chunking

Documents are split at natural boundaries with sizes following the golden ratio:

```javascript
const CHUNK_SIZES = {
  MICRO: Math.round(100 * PHI_INV),   // ~62 chars
  SMALL: Math.round(100 * PHI),       // ~162 chars
  MEDIUM: Math.round(250 * PHI),      // ~405 chars
  LARGE: Math.round(400 * PHI),       // ~647 chars
  MAX: Math.round(650 * PHI),         // ~1052 chars
};
```

### Hebbian Chunk Linking

Chunks that are frequently retrieved together form stronger links:

```
Chunk A ──(co-retrieved 15x)──▶ Chunk B
    │                             │
    └── weight: 1.8               └── weight: 0.9
        (strengthened)                (new link)
```

---

## ⚡ AI Gateway — Multi-Provider Orchestration

Unified control plane across all AI providers.

### Provider Configuration

```javascript
const AI_PROVIDERS = {
  WORKERS_AI: {
    models: {
      embedding: '@cf/baai/bge-base-en-v1.5',
      llm: '@cf/meta/llama-2-7b-chat-int8',
    },
    features: ['edge_inference', 'low_latency', 'no_egress'],
    priority: 1,  // Primary provider
  },
  OPENAI: {
    models: {
      embedding: 'text-embedding-3-small',
      llm: 'gpt-4o',
    },
    features: ['high_quality', 'function_calling', 'vision'],
    priority: 2,  // Fallback for complex tasks
  },
  ANTHROPIC: {
    models: { llm: 'claude-3-5-sonnet-latest' },
    features: ['long_context', 'safety', 'reasoning'],
    priority: 3,  // Fallback for long context
  },
  DEEPSEEK: {
    models: { code: 'deepseek-coder' },
    features: ['code_generation', 'cost_effective'],
    priority: 4,  // Code-specific tasks
  },
};
```

### Caching Strategy

```
Request → Cache Check → Hit? → Return cached (0ms)
                          ↓
                         Miss
                          ↓
                    Provider Call
                          ↓
                     Cache Store
                          ↓
                    Return Response
```

**Cache Benefits:**
- ⚡ **90% latency reduction** for repeat queries
- 💰 **Cost savings** — no API call for cached responses
- 🛡️ **Rate limit protection** — fewer calls to providers

---

## 🔄 Data Flow Patterns

### Pattern 1: RAG Query

```
User Query
    │
    ▼
┌─────────────────┐
│  Wraith Guard   │ ← Security check
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Knowledge Corpus│ ← Embed query
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Vectorize    │ ← Find similar chunks (TopK)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Knowledge Corpus│ ← Retrieve full chunks
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Neuron Cluster │ ← Process context through neural net
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AI Gateway    │ ← Generate response with context
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Consciousness   │ ← Format and stream output
│    Stream       │
└────────┬────────┘
         │
         ▼
    Grounded Response
```

### Pattern 2: Threat Response

```
Suspicious Request
    │
    ▼
┌─────────────────┐
│  Wraith Guard   │ ← Detect threat level
└────────┬────────┘
         │
    ┌────┴────┬────────────┐
    ▼         ▼            ▼
┌───────┐ ┌────────┐ ┌─────────┐
│ LOW   │ │ MEDIUM │ │  HIGH   │
│ Log & │ │ Redirect│ │  Block  │
│ Allow │ │ to Ghost│ │ + Alert │
└───────┘ └────┬───┘ └─────────┘
               │
               ▼
        ┌─────────────┐
        │    Ghost    │ ← Record, profile, extract
        │  Honeypot   │
        └─────────────┘
```

### Pattern 3: Memory Consolidation

```
New Interaction
    │
    ▼
┌─────────────────┐
│   Write to RIL  │ ← Working memory (24h)
└────────┬────────┘
         │
         ▼ (every 6 hours)
┌─────────────────┐
│   Consolidate   │ ← Pattern extraction
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Move to MML    │ ← Short-term (30 days)
└────────┬────────┘
         │
         ▼ (dream cycle - nightly)
┌─────────────────┐
│ Compress & Move │ ← Long-term (permanent)
│    to UEL       │
└─────────────────┘
```

---

## 📋 wrangler.toml — Complete Configuration

```toml
name = "cognitive-organism"
main = "index.js"
compatibility_date = "2024-01-01"

# ═══════════════════════════════════════════════════════════════════════════════
# AI Bindings
# ═══════════════════════════════════════════════════════════════════════════════

[ai]
binding = "AI"

# ═══════════════════════════════════════════════════════════════════════════════
# Vectorize — Embedding Storage & Similarity Search
# ═══════════════════════════════════════════════════════════════════════════════

[[vectorize]]
binding = "VECTORIZE"
index_name = "knowledge-corpus"

[[vectorize]]
binding = "VECTORIZE_MEMORY"
index_name = "memory-vault"

# ═══════════════════════════════════════════════════════════════════════════════
# D1 — Relational Database
# ═══════════════════════════════════════════════════════════════════════════════

[[d1_databases]]
binding = "DB"
database_name = "cognitive-db"
database_id = "your-d1-database-id"

# ═══════════════════════════════════════════════════════════════════════════════
# R2 — Object Storage for Documents
# ═══════════════════════════════════════════════════════════════════════════════

[[r2_buckets]]
binding = "DOCUMENTS"
bucket_name = "cognitive-documents"

[[r2_buckets]]
binding = "MEMORIES"
bucket_name = "cognitive-memories"

# ═══════════════════════════════════════════════════════════════════════════════
# KV — Key-Value Store for Caching
# ═══════════════════════════════════════════════════════════════════════════════

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your-sessions-kv-id"

# ═══════════════════════════════════════════════════════════════════════════════
# Durable Objects — Cognitive Core
# ═══════════════════════════════════════════════════════════════════════════════

[[durable_objects.bindings]]
name = "NEURON_CLUSTER"
class_name = "NeuronCluster"

[[durable_objects.bindings]]
name = "MEMORY_VAULT"
class_name = "MemoryVault"

[[durable_objects.bindings]]
name = "CONSCIOUSNESS_STREAM"
class_name = "ConsciousnessStream"

# ═══════════════════════════════════════════════════════════════════════════════
# Durable Objects — Security Triad
# ═══════════════════════════════════════════════════════════════════════════════

[[durable_objects.bindings]]
name = "WRAITH_GUARD"
class_name = "WraithGuard"

[[durable_objects.bindings]]
name = "GHOST_HONEYPOT"
class_name = "GhostHoneypot"

# ═══════════════════════════════════════════════════════════════════════════════
# Durable Objects — Knowledge Layer
# ═══════════════════════════════════════════════════════════════════════════════

[[durable_objects.bindings]]
name = "KNOWLEDGE_CORPUS"
class_name = "KnowledgeCorpus"

# ═══════════════════════════════════════════════════════════════════════════════
# AI Gateway
# ═══════════════════════════════════════════════════════════════════════════════

[ai_gateway]
id = "cognitive-gateway"

# ═══════════════════════════════════════════════════════════════════════════════
# Migrations
# ═══════════════════════════════════════════════════════════════════════════════

[[migrations]]
tag = "v1"
new_sqlite_classes = ["NeuronCluster", "MemoryVault", "ConsciousnessStream"]

[[migrations]]
tag = "v2"
new_sqlite_classes = ["WraithGuard", "GhostHoneypot", "KnowledgeCorpus"]

# ═══════════════════════════════════════════════════════════════════════════════
# Environment Variables
# ═══════════════════════════════════════════════════════════════════════════════

[vars]
ENVIRONMENT = "production"
PHI = "1.618033988749895"
HEARTBEAT_MS = "873"
```

---

## 🚀 Build Order

| Step | Component | Products | Duration |
|------|-----------|----------|----------|
| 1 | AI Gateway | AI Gateway instance | 5 min |
| 2 | Knowledge Corpus | Workers AI + Vectorize + D1 | 30 min |
| 3 | Security Triad | Wraith + Ghost Durable Objects | 45 min |
| 4 | Cognitive Core | Neuron + Memory + Consciousness | 1 hour |
| 5 | Document Storage | R2 bucket + ingest pipeline | 20 min |
| 6 | Frontend | Pages chat UI or dashboard | 2 hours |

---

## 📊 Phi Constants

Everything follows the golden ratio:

```javascript
const PHI = 1.618033988749895;        // The golden ratio
const PHI_INV = 0.618033988749895;    // 1/PHI
const HEARTBEAT = 873;                // 1000/PHI ≈ 618 → round to 873 for rhythm
```

**Why Phi?**
- Chunk sizes follow phi ratios for natural boundaries
- Hebbian weight updates use phi multipliers
- Kuramoto coupling strength is phi-scaled
- Memory consolidation thresholds are phi-derived

---

## 🔮 The Future

### v2.1 — Phantom Stealth
- Traffic obfuscation layer
- Encryption weaving
- Decoy packet injection

### v2.2 — Agent Marketplace
- Connect external AI agents
- Capability discovery
- Task routing

### v3.0 — Distributed Consciousness
- Multi-region coordination
- Global coherence
- Federated learning

---

*Built with 💜 by ORO Systems*  
*Protocol: PROTO-231 | The Cognitive Architecture*
