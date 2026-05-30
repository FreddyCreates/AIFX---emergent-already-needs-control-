# 🏛️ Organism Bot Fleet Charter

> The Sovereign Organism Bot Fleet — Operational Charter & Taxonomy v2.0

## Mission

The Organism Bot Fleet is a self-organizing automation ecosystem that builds, tests, secures, documents, deploys, learns from, and continuously improves the Sovereign Organism. Every bot is a real, wired automation — not documentation. Each runs on GitHub Actions, commits under its own identity, and produces deliverables. Bots spawn microbots internally, register with the Civitas runtime, and collectively form an intelligent automation intelligence.

## Fleet Taxonomy

The organism contains multiple classes of autonomous entities. Here is how they differ:

### 🤖 Bots (CI/CD Automation)
**What they are:** GitHub Actions workflows with dedicated identities that auto-commit.
**How they work:** Trigger on push/PR/schedule, run scripts, produce artifacts, commit reports. May spawn microbots internally.
**Examples:** organism-build-bot, organism-sentinel-bot, organism-alpha-bot, organism-cyber-bot, organism-cloud-bot

### 🦠 Microbots (Sub-Agents of Bots)
**What they are:** Lightweight sub-agents spawned inside parent bots to handle specific parallel sub-tasks.
**How they work:** Parent bot instantiates microbots via `MicrobotBase`. Each has `spawn()`, `run()`, `tick()`, `report()`, `shutdown()`. Run in parallel via `MicrobotRunner`. Register with CivitasRuntime.
**Examples:** signal-gatherer (→ learning-bot), synapse-trainer (→ learning-bot), orphan-scanner (→ crawler-bot), link-checker (→ crawler-bot)

### 🧬 Agents (Cognitive Organs)
**What they are:** Living SDK modules inside `sdk/agents/` that form the Civitas runtime.
**How they work:** Run inside the organism's cognitive loop (CHRONO beats). Have internal state, reasoning, memory.
**Examples:** ANIMUS (mind), CORPUS (body), SENSUS (senses), MEMORIA (memory)

### 🕷️ Crawlers (Discovery & Mapping)
**What they are:** Bots specialized in traversing and mapping the organism's structure.
**How they work:** Walk directories, parse exports, trace dependencies, find dead code. Produce HTML dashboards.
**Examples:** organism-crawler-bot

### 🧠 Synthetic Beings (AI Runtimes)
**What they are:** Multi-language runtime instances in `organism/` that execute intelligence.
**How they work:** Run as TypeScript, Python, C++, Java, Motoko, or Web runtimes.
**Examples:** organism/typescript, organism/python, organism/motoko

### 🧫 Protocols (Intelligence Wiring)
**What they are:** The 42 intelligence protocols in `protocols/` that define how the organism thinks.
**How they work:** Each is a self-contained AI module (learning, memory, routing, sensing). New: active "intelligence contracts" (PROTO-223+) self-execute based on conditions.
**Examples:** Hebbian Learning, Reward Signal, IntelligenceContract, EdgeCompute, CyberDefense

### 📜 Intelligence Contracts (Active Protocols)
**What they are:** A sub-class of protocols that are ACTIVE — they watch the organism state and self-execute.
**How they work:** DRAFT → ACTIVE → WATCHING → TRIGGERED → EXECUTING → FULFILLED. Register with CivitasRuntime via `registerContract()`.
**Examples:** PROTO-223 IntelligenceContractProtocol, any protocol with `activate()` + `watchCycle()`

### 🔌 Engines (Core Infrastructure)
**What they are:** The 4 foundational engines in `sdk/engines/` that power everything.
**How they work:** CHRONO (time), NEXORIS (state), QUANTUM_FLUX (randomness), COREOGRAPH (messaging).

---

## Fleet Divisions — 7 Divisions, 20 Bots

### 👑 Division VII — Command & Control

| Bot | Emoji | What It Does | Microbots |
|-----|-------|-------------|-----------|
| organism-alpha-bot | 👑 | Fleet commander, census, health, policy, trigger | — |

### 🏗️ Division I — Build & Package

| Bot | Emoji | What It Does | Microbots |
|-----|-------|-------------|-----------|
| organism-build-bot | 🧬 | Zips all 38 browser extensions | — |
| organism-sdk-bot | 📦 | Validates & packages 18 SDKs for npm | — |
| organism-release-bot | 🚀 | Builds everything, creates GitHub Releases | — |

### 🔬 Division II — Validate & Test

| Bot | Emoji | What It Does | Microbots |
|-----|-------|-------------|-----------|
| organism-test-bot | 🧪 | Cross-matrix testing on Node 18/20/22 | — |
| organism-protocol-bot | 🔬 | Lints protocols, detects circular deps | — |
| organism-neural-bot | 🧠 | Validates neural architecture graph | — |
| organism-sandcastle-bot | 🏰 | Sandboxed build-test-land pipeline | — |
| organism-visual-bot | 📸 | Visual regression, screenshots, video | — |

### 🛡️ Division III — Secure & Monitor

| Bot | Emoji | What It Does | Microbots |
|-----|-------|-------------|-----------|
| organism-sentinel-bot | 🛡️ | Security audits, CSP, secrets scanning | — |
| organism-deps-bot | 🔄 | Dependency staleness & vulnerability scanning | — |
| organism-crawler-bot | 🕷️ | Maps organism, orphans, dead links, dep web, HTML dashboard | orphan-scanner, link-checker, graph-builder |
| organism-cyber-bot | 🔐 | Cyber defense/offense, threat scan, attack surface, defense matrix | threat-scanner, surface-mapper |

### 📚 Division IV — Document & Report

| Bot | Emoji | What It Does | Microbots |
|-----|-------|-------------|-----------|
| organism-docs-bot | 📚 | Generates catalogs, encyclopedias, references | — |
| organism-intel-bot | 🔭 | Aggregates all bot reports, cross-correlates, unified awareness picture | report-aggregator, pattern-detector |

### 🌐 Division V — Deploy & Operate

| Bot | Emoji | What It Does | Microbots |
|-----|-------|-------------|-----------|
| organism-deploy-bot | 🌐 | ICP canister deployment & Pages hosting | — |
| organism-cloud-bot | ☁️ | Cloudflare Workers/edge orchestration, deployment manifests, regional health | worker-health, edge-latency |
| organism-runtime-bot | ⚙️ | Live Civitas runtime monitor, microbot registry, contract manager | agent-vitals, contract-watcher |

### 🧠 Division VI — Learn & Evolve

| Bot | Emoji | What It Does | Microbots |
|-----|-------|-------------|-----------|
| organism-learning-bot | 🎓 | Trains Hebbian synapses from CI outcomes, evolves protocol weights | signal-gatherer, synapse-trainer, weight-evolver |
| organism-economy-bot | 💰 | Marketplace analytics, SDK/extension/protocol economy dashboards | — |

### 🏛️ Division VIII — Governance

| Bot | Emoji | What It Does | Microbots |
|-----|-------|-------------|-----------|
| organism-governance-bot | 🏛️ | CPL-L law evaluator, CPL-P pipeline runner, meta-analysis, audit trail, escalation routing | — |

---

## Governance Layer (OCL / CPL-L / CPL-P)

The organism has a full governance engine wired to the bot fleet:

### 📜 OCL — Organism Control Language
Defines the fleet charter: capabilities, limits, drives. File: `governance/organism/bot-fleet.ocl`

### ⚖️ CPL-L — Laws
Safety rules evaluated against every bot event. File: `governance/laws/bot-fleet.cpl-l`

Rules include: `BLOCK_SECRETS`, `NO_RELEASE_ON_RED`, `ESCALATE_CRITICAL_THREAT`, `NO_DEPLOY_WITHOUT_TESTS`, `PREVENT_WEIGHT_DIVERGENCE`, and more.

### 🔄 CPL-P — Pipelines
Governance workflow: `collect_state → apply_laws → route_escalations → update_meta → report`. File: `governance/pipelines/bot-governance.cpl-p`

### 🗂️ Atlas Registry
Every bot has an entity JSON at `governance/organism/registry/entities/organism-{name}-bot.json`. Registry API at `governance/organism/registry/index.js`.

### 🔮 Meta Engine
Detects patterns across governance cycles: chronically blocked bots, never-triggered rules, override patterns, fleet health trends, new bot proposals. Script: `scripts/governance-meta-engine.js`

### 📝 Human Feedback
Override files in `governance/feedback/fb-YYYY-MM-DD-NNN.yaml`. When a human overrides a bot decision, a feedback file is created and the meta engine ingests it.

---

## Alpha Bot Authority

The **organism-alpha-bot** (👑) is the fleet commander with the following authorities:

1. **Orchestration** — Can trigger any of the 21 bot workflows via `workflow_dispatch`
2. **Health Monitoring** — Monitors all bot workflow run statuses
3. **Policy Enforcement** — Enforces fleet-wide rules (commit format, report structure)
4. **Escalation** — Creates issues when bots fail repeatedly
5. **Fleet Census** — Maintains a live inventory of all bots and their last-run status
6. **Cross-Division Coordination** — Ensures Division I doesn't release without Division II approval

## Civitas Runtime Wiring

All bots interact with the running Civitas runtime via:
- **`registerMicrobot(name, parentBot, instanceId)`** — register a microbot sub-agent
- **`registerContract(id, contract)`** — register an active intelligence contract
- **`watchContracts()`** — run one watch cycle across all active contracts
- **`getMicrobots()`** — get all currently registered microbots
- **`getContracts()`** — get all active intelligence contracts

## Intelligence Contract Lifecycle

```
DRAFT → ACTIVE → WATCHING → TRIGGERED → EXECUTING → FULFILLED
                                 ↓
                           EXPIRED / BREACHED → RENEGOTIATED → ACTIVE
```

## Microbot Lifecycle

```
IDLE → SPAWNED → RUNNING → (REPORTING) → COMPLETE
                    ↓
                  FAILED → (parent retries or escalates to alpha-bot)
```

## Bot Identity Rules

1. Every bot commits under `organism-{name}-bot <organism-{name}-bot@users.noreply.github.com>`
2. Every bot commit message starts with its emoji
3. Every bot produces a report in `docs/`
4. Every bot has a workflow in `.github/workflows/organism-{name}-bot.yml`
5. Every bot has a script in `scripts/`
6. The Alpha bot can trigger any other bot
7. Bots that use microbots register them via `sdk/microbots/index.js`
8. Every bot has an Atlas entity at `governance/organism/registry/entities/organism-{name}-bot.json`
9. Every bot is subject to CPL-L laws in `governance/laws/bot-fleet.cpl-l`

---

## Fleet Metrics

| Metric | Current |
|--------|---------|
| Total Bots | 21 |
| Divisions | 8 |
| Protocols | 42 |
| Active Protocols (Intelligence Contracts) | 8+ |
| Agents | 4 |
| Engines | 4 |
| Microbots | 6 |
| Runtimes | 6 |
| Extensions | 38 |
| SDKs | 18 |
| Edge Workers | 6 |
| Governance Laws (CPL-L rules) | 16 |
| Atlas Registry Entities | 21 |

---
*Organism Bot Fleet Charter v3.0 — Maintained by organism-alpha-bot & organism-governance-bot*


## Mission

The Organism Bot Fleet is a self-organizing automation ecosystem that builds, tests, secures, documents, deploys, learns from, and continuously improves the Sovereign Organism. Every bot is a real, wired automation — not documentation. Each runs on GitHub Actions, commits under its own identity, and produces deliverables.

## Fleet Taxonomy

The organism contains multiple classes of autonomous entities. Here is how they differ:

### 🤖 Bots (CI/CD Automation)
**What they are:** GitHub Actions workflows with dedicated identities that auto-commit.
**How they work:** Trigger on push/PR/schedule, run scripts, produce artifacts, commit reports.
**Examples:** organism-build-bot, organism-sentinel-bot, organism-alpha-bot

### 🧬 Agents (Cognitive Organs)
**What they are:** Living SDK modules inside `sdk/agents/` that form the Civitas runtime.
**How they work:** Run inside the organism's cognitive loop (CHRONO beats). Have internal state, reasoning, memory.
**Examples:** ANIMUS (mind), CORPUS (body), SENSUS (senses), MEMORIA (memory)

### 🕷️ Crawlers (Discovery & Mapping)
**What they are:** Bots specialized in traversing and mapping the organism's structure.
**How they work:** Walk directories, parse exports, trace dependencies, find dead code.
**Examples:** organism-crawler-bot

### 🧠 Synthetic Beings (AI Runtimes)
**What they are:** Multi-language runtime instances in `organism/` that execute intelligence.
**How they work:** Run as TypeScript, Python, C++, Java, Motoko, or Web runtimes.
**Examples:** organism/typescript, organism/python, organism/motoko

### 🧫 Protocols (Intelligence Wiring)
**What they are:** The 38+ intelligence protocols in `protocols/` that define how the organism thinks.
**How they work:** Each is a self-contained AI module (learning, memory, routing, sensing).
**Examples:** Hebbian Learning, Reward Signal, Attention Routing, Meta-Learning

### 🔌 Engines (Core Infrastructure)
**What they are:** The 4 foundational engines in `sdk/engines/` that power everything.
**How they work:** CHRONO (time), NEXORIS (state), QUANTUM_FLUX (randomness), COREOGRAPH (messaging).

---

## Fleet Divisions

### 🏗️ Division I — Build & Package
Responsible for compiling, packaging, and distributing all organism artifacts.

| Bot | Emoji | What It Does |
|-----|-------|-------------|
| organism-build-bot | 🧬 | Zips all 38 browser extensions |
| organism-sdk-bot | 📦 | Validates & packages 18 SDKs for npm |
| organism-release-bot | 🚀 | Builds everything, creates GitHub Releases |

### 🔬 Division II — Validate & Test
Responsible for ensuring correctness, integrity, and quality.

| Bot | Emoji | What It Does |
|-----|-------|-------------|
| organism-test-bot | 🧪 | Cross-matrix testing on Node 18/20/22 |
| organism-protocol-bot | 🔬 | Lints protocols, detects circular deps |
| organism-neural-bot | 🧠 | Validates neural architecture graph |
| organism-sandcastle-bot | 🏰 | Sandboxed build-test-land pipeline |
| organism-visual-bot | 📸 | Visual regression, screenshots, video |

### 🛡️ Division III — Secure & Monitor
Responsible for security, dependency health, and ongoing surveillance.

| Bot | Emoji | What It Does |
|-----|-------|-------------|
| organism-sentinel-bot | 🛡️ | Security audits, CSP, secrets scanning |
| organism-deps-bot | 🔄 | Dependency staleness & vulnerability scanning |
| organism-crawler-bot | 🕷️ | Maps organism, finds dead code & orphan files |

### 📚 Division IV — Document & Report
Responsible for keeping documentation current and comprehensive.

| Bot | Emoji | What It Does |
|-----|-------|-------------|
| organism-docs-bot | 📚 | Generates catalogs, encyclopedias, references |

### 🌐 Division V — Deploy & Operate
Responsible for deployment, infrastructure, and runtime operations.

| Bot | Emoji | What It Does |
|-----|-------|-------------|
| organism-deploy-bot | 🌐 | ICP canister deployment & Pages hosting |

### 🧠 Division VI — Learn & Evolve
Responsible for continuous improvement, learning, and economic intelligence.

| Bot | Emoji | What It Does |
|-----|-------|-------------|
| organism-learning-bot | 🎓 | Trains Hebbian synapses from CI outcomes, evolves protocol weights |
| organism-economy-bot | 💰 | Marketplace analytics, SDK/extension usage tracking |

### 👑 Division VII — Command & Control
The fleet commander. Has authority over all other divisions.

| Bot | Emoji | What It Does |
|-----|-------|-------------|
| organism-alpha-bot | 👑 | Fleet orchestration, health monitoring, policy enforcement |

---

## Alpha Bot Authority

The **organism-alpha-bot** (👑) is the fleet commander with the following authorities:

1. **Orchestration** — Can trigger any bot workflow via `workflow_dispatch`
2. **Health Monitoring** — Monitors all bot workflow run statuses
3. **Policy Enforcement** — Enforces fleet-wide rules (commit format, report structure)
4. **Escalation** — Creates issues when bots fail repeatedly
5. **Fleet Census** — Maintains a live inventory of all bots and their last-run status
6. **Cross-Division Coordination** — Ensures Division I doesn't release without Division II approval

## Bot Identity Rules

1. Every bot commits under `organism-{name}-bot <organism-{name}-bot@users.noreply.github.com>`
2. Every bot commit message starts with its emoji
3. Every bot produces a report in `docs/`
4. Every bot has a workflow in `.github/workflows/organism-{name}-bot.yml`
5. Every bot has a script in `scripts/`
6. The Alpha bot can trigger any other bot

## Lifecycle States

```
DORMANT → TRIGGERED → RUNNING → REPORTING → COMMITTING → COMPLETE
                                     ↓
                                   FAILED → ESCALATED (Alpha creates issue)
```

---

## Fleet Metrics

| Metric | Current |
|--------|---------|
| Total Bots | 15 |
| Divisions | 7 |
| Protocols | 38 |
| Agents | 4 |
| Engines | 4 |
| Runtimes | 6 |
| Extensions | 38 |
| SDKs | 18 |

---
*Organism Bot Fleet Charter v1.0 — Maintained by organism-alpha-bot*
