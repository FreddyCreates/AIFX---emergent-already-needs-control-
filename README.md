<p align="center">
  <img src="extensions/jarvis/icons/icon128.png" width="80" alt="Vigil AI" />
</p>

<h1 align="center">Vigil AI</h1>

<p align="center">
  <strong>Sovereign offline intelligence for your browser</strong>
</p>

<p align="center">
  <em>Vigil (Latin): watchfulness, wakefulness — the state of being alert and observant</em>
</p>

<p align="center">
  <a href="#download">⬇ Download</a> · <a href="#features">✨ Features</a> · <a href="#technology">⚙️ Technology</a> · <a href="#solus">🔵 Solus</a> · <a href="#install">🚀 Install</a> · <a href="#architecture">🏗 Architecture</a>
</p>

---

## What Is Vigil AI

Vigil AI is a full-stack sovereign intelligence platform that runs entirely inside your browser — no cloud, no server, no subscription. It installs as a Chrome or Edge side panel extension and becomes a permanent cognitive co-pilot: reading pages, running offline AI inference, monitoring threats, building a spatial memory palace, constructing a knowledge graph of everything you read, deploying autonomous research agents, and reasoning through any problem you bring to it.

The architecture goes far beyond a chat wrapper. Vigil AI combines:
- **Solus** — a fully offline AI engine using Transformers.js (summarization, zero-shot classification, Q&A) with zero network calls during inference
- **Memory Palace** — phi-encoded spatial memory of every page you save, retrievable by resonance
- **Sentry Watch** — real-time security monitor scanning for phishing, PII, prompt injection, and malware URLs
- **Cartographer** — entity-based knowledge graph that maps connections between everything you read
- A phi-encoded NeuroCore oscillator (873ms heartbeat), a PatternSynthesisEngine with 40 primitives across 8 knowledge domains, nine autonomous agent types, and a full annotation system — all wired together into a single sovereign intelligence

---

<a id="download"></a>
## Download

### Vigil AI Extension (Chrome / Edge)

| Package | Link |
|---|---|
| **Vigil AI Extension ZIP** | [⬇ Download jarvis.zip](https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/jarvis.zip) |
| **All Extensions ZIP** | [⬇ Download all-extensions.zip](https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/all-extensions.zip) |
| **Windows Installer (.bat)** | [⬇ install-jarvis-edge.bat](https://github.com/FreddyCreates/potential-succotash/raw/main/install-jarvis-edge.bat) |
| **SDK Manifest** | [⬇ SDK_Model_Manifest.json](https://github.com/FreddyCreates/potential-succotash/raw/main/SDK_Model_Manifest.json) |
| **AI Protocols Register** | [⬇ AI_Protocols_Register.csv](https://github.com/FreddyCreates/potential-succotash/raw/main/AI_Protocols_Register.csv) |

### Load Unpacked in Chrome or Edge

1. Download and unzip `jarvis.zip`
2. Open Chrome/Edge → `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the unzipped folder
5. Click the puzzle piece 🧩 in the toolbar → pin **Vigil AI**
6. Press `Ctrl+Shift+Y` or click the icon to open the side panel

### Windows One-Click Installer

Download `install-jarvis-edge.bat`, right-click → **Run**. It downloads Vigil AI, extracts it, and opens Edge with the extension loaded automatically.

---

<a id="features"></a>
## Features

### 22 Panels

| Panel | Description |
|---|---|
| 💬 **Chat** | Full conversational AI with 40-category intent engine and context memory |
| ⚡ **Nexus** | Command surface — one-tap action tiles, live agent feed, page awareness |
| 🔵 **Solus** | Sovereign offline AI — summarize, classify, Q&A with zero network calls |
| 📥 **Inbox** | Proactive briefs: clipboard intel, tab changes, agent completions |
| 📌 **Highlights** | Annotation engine — save, tag, group, and export page highlights |
| 🪞 **Mirror** | Staged content hub — agent reports, clipboard, fetch results |
| 🏛 **Memory** | Phi-encoded Memory Palace — spatial storage of every page you save |
| 🛡 **Sentry** | Security monitor — phishing, PII, prompt injection, malware detection |
| 🗺 **Graph** | Knowledge graph — entity-based map of everything you've read |
| 🤖 **Agents** | Live autonomous agent dashboard with progress tracking |
| ⚗️ **AGI Tools** | Summarize URLs, extract tables, diff sources, forge knowledge reports |
| 📓 **Journal** | Notes with full Dexie.js persistence |
| 📁 **Files** | Document manager — PDFs, Excel, and created documents |
| 🔐 **Vault** | Secure local key-value store |
| 💡 **Prompts** | Saved prompt library for rapid dispatch |
| 📝 **Workspace** | Free-form text workspace with persistent storage |
| 🔧 **Tools** | Utility panel — PDF/Excel download, readability, email drafting |
| 🔍 **Search** | Page-aware search with built-in knowledge base |
| 🖥️ **Screen** | Tab capture, screenshot, and page analysis |
| 🗂️ **Tabs** | Tab manager — list, switch, close, open |
| ⬇ **Install** | Step-by-step install guide with download links |
| 📋 **Log** | Live log stream — all commands, agents, and system events |

### Skill Engines
- 🔵 **Solus Offline AI** — Transformers.js: summarization, zero-shot classification, extractive Q&A (all offline)
- 🧠 **NLP Intent Classification** — 40-category intent engine, compound multi-action dispatch
- 📄 **Readability Engine** — DOM article extraction (Firefox Reader Mode algorithm)
- 📌 **Highlights Engine** — Annotation storage, grouping, export
- 🏛 **Memory Palace** — Phi-encoded spatial memory with resonance search
- 🛡 **SentryAI** — Phishing, PII, prompt injection, malware URL detection
- 🗺 **Knowledge Graph** — Entity extraction, edge-weighted graph, force-directed visualization
- 📊 **PDF Generator** — jsPDF formatted reports
- 📈 **Excel Generator** — ExcelJS formatted workbooks
- 📧 **Email Drafter** — mailto: protocol with structured prefill

### Autonomous Agents (9 types)
- `researcher` — Wikipedia + domain-specific sources, parallel fetch
- `crawler` — Spider from seed URL, follows links, parallel batch extraction
- `scraper` — Structured data: tables, lists, prices, dates
- `scout` — Quick deep scan + link map
- `digest` — Multi-topic parallel synthesis
- `monitor` — Site content diff watcher
- `watcher` — Alarm-based recurring site monitoring
- `analyst` — Multi-URL parallel analysis
- `sweep` — Multi-site batch extraction

---

<a id="solus"></a>
## Solus — Sovereign Offline Intelligence

Solus is the 7th Domain AI. He runs **entirely in the browser with zero network calls during inference**. Models download once using the browser Cache API, and persist permanently across reloads.

### What Solus Can Do

| Mode | Capability |
|---|---|
| 📄 **Summarize** | Distill any article or pasted text into a concise summary — completely offline |
| 🏷 **Classify** | Zero-shot classify text against any labels you define — no training required |
| ❓ **Ask** | Answer questions from page content — extractive Q&A, no hallucination |

### How to Use Solus
1. Open Vigil AI side panel → click **🔵 Solus** tab
2. Click **⚡ Activate Solus** — models download once (~80 MB total), cached forever
3. Navigate to any article → click **📄 Use Page** to pull the content
4. Select a mode (Summarize / Classify / Ask) and click **⚡ Run Solus**
5. All inference happens locally — no API key, no cloud, no data leaves your browser

### Model Stack
- **Summarization**: `Xenova/distilbart-cnn-6-6`
- **Zero-shot Classification**: `Xenova/nli-deberta-v3-small`
- **Question Answering**: `Xenova/distilbert-base-uncased-distilled-squad`

---

<a id="technology"></a>
## Technology

### Solus Engine (Transformers.js)
Progressive model loading with browser Cache API persistence. Models download once and never re-download. All pipeline calls (`summarization`, `zero-shot-classification`, `question-answering`) run in the service worker via `@xenova/transformers`. No CORS, no API keys, no servers.

### PatternSynthesisEngine (PSE)
A centralized cognitive knowledge corpus with 40 pattern primitives across 8 domains. Every user message is silently synthesized through PSE — if confidence exceeds 28%, enrichment is appended to the response automatically.

### NeuroCore (873ms heartbeat, phi-encoded memory)
A four-component oscillator:
- **MiniHeart** — tracks latency, pulse count, health score, degradation
- **MiniBrain** — Hebbian learning pathways with phi-decayed weights
- **MetaCardiacModel** — autonomic balance: vagal tone, sympathetic drive, HRV, mood
- **MetaThoughtModel** — softmax attention map, temperature-adjusted focus, chain-of-thought

The 873ms interval is chosen because `873ms × φ ≈ 1413ms` — a recursive phi interval.

### Memory Palace (Phi-encoded spatial memory)
Every saved URL gets phi-encoded coordinates in a 5D conceptual space (`θ, φ, ρ, ring, beat`). Pages are stored as nodes in rings (day-indexed). Retrieval uses resonance distance — not text search — so related pages emerge from conceptual proximity.

### SentryAI (Real-time threat detection)
Pattern-based detection against page text and URLs:
- Phishing: urgency language + external link signatures
- PII: email, SSN, credit card regexes
- Prompt injection: ignore-instruction patterns, role-override signatures
- Malware URLs: executable extensions, URL shorteners, raw IPs

### Cartographer (Knowledge Graph)
Entity extraction (proper nouns, capitalized sequences, quoted strings) from every page you map. Edges form when the same entity appears on two different pages. Visualized as a force-directed SVG graph — pure math, no D3.

### CrawlFetcher (parallel fetch + extraction)
Background fetch engine for agents: parallel fetch, HTML stripping, link extraction, table extraction, content diffing.

---

<a id="install"></a>
## Install

### Step-by-Step

1. **Download** the [Vigil AI ZIP](https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/jarvis.zip)
2. **Unzip** the downloaded file to a folder (e.g., `VigilAI/`)
3. **Open** Chrome → `chrome://extensions` OR Edge → `edge://extensions`
4. **Enable Developer Mode** using the toggle in the top-right corner
5. **Click** "Load unpacked" → navigate to and select the unzipped `VigilAI/` folder
6. **Pin** the extension: click the 🧩 puzzle piece icon → click the 📌 pin next to Vigil AI
7. **Open** the side panel: press `Ctrl+Shift+Y` or click the Vigil AI icon
8. **Start** — type anything or say "brief me" for a situational report

### Windows One-Click (Edge)
```
Right-click install-jarvis-edge.bat → Run as Administrator
```
Automatically downloads, extracts, and loads Vigil AI into Edge.

---

<a id="architecture"></a>
## Architecture

```
extensions/jarvis/src/
├── background/
│   ├── index.ts              ← VigilEngine, NeuroCore, PSE, AgentDispatcher, message router
│   ├── pattern-synthesis-engine.ts  ← PSE: 40 primitives, 8 domains
│   ├── mission-engine.ts     ← Mission dispatch, 6 Domain AIs
│   ├── domain-ais.ts         ← Domain AI definitions
│   ├── db.ts                 ← Dexie.js IndexedDB layer
│   ├── sovereign-license.ts  ← License registry (24 sovereign tools)
│   └── skills/
│       ├── solus.ts          ← Solus offline AI (Transformers.js pipelines)
│       ├── memoryAI.ts       ← Phi-encoded Memory Palace
│       ├── sentryAI.ts       ← Threat detection engine
│       ├── knowledgeGraph.ts ← Entity graph + force layout engine
│       ├── readability.ts    ← DOM article extractor
│       ├── highlights.ts     ← Annotation/highlight engine
│       ├── nlp.ts            ← Transformers.js NLP pipeline
│       ├── pdf.ts            ← jsPDF report generator
│       ├── excel.ts          ← ExcelJS workbook generator
│       └── email.ts          ← mailto: draft composer
├── sidepanel/
│   ├── App.tsx               ← Root: 22-tab navigation, header, status bar
│   └── panels/
│       ├── ChatPanel.tsx     ← 40-category conversational AI
│       ├── NexusPanel.tsx    ← Command surface dashboard
│       ├── SolusPanel.tsx    ← Solus offline AI interface
│       ├── InboxPanel.tsx    ← Proactive brief feed
│       ├── HighlightsPanel.tsx  ← Annotation/highlight viewer
│       ├── MirrorPanel.tsx   ← Staged content hub
│       ├── MemoryPanel.tsx   ← Memory Palace — phi rings visualization
│       ├── SentryPanel.tsx   ← Threat monitor — live alert feed
│       ├── GraphPanel.tsx    ← Knowledge graph — force-directed SVG
│       ├── AgentsPanel.tsx   ← Sovereign agent dashboard
│       ├── AGIToolsPanel.tsx ← URL analysis tools
│       └── ...               ← Vault, Prompts, Journal, Files, Workspace, Log
└── store/index.ts            ← Zustand global state
```

### Key Data Flows

- **Solus**: panel → `solusLoad` → Transformers.js model load (cached) → `solusSummarize/Classify/Answer` → result
- **Memory**: "Save Page" → `memorySaveCurrent` → `encodePhiCoord` → `chrome.storage.local['vigil_memory_palace']`
- **Sentry**: "Scan Page" → `scripting.executeScript` → `analyzePageText` → alerts → `persistAlerts`
- **Graph**: "Map Page" → `scripting.executeScript` → `extractEntities` → `addPage` → edge rebuild → SVG render
- **Chat**: user → `executeCommand` → `parseCommand` → `buildAction` → skill/executor → `_remember` → response
- **Agents**: `deployAgent` → `AgentDispatcher.deploy` → `SovereignAgent.run` → `CrawlFetcher` → `pushToInbox` + `_mirrorPush`
- **Heartbeat**: 873ms `setInterval` → `NeuroCore.pulse` → mood/focus/awareness update

---

## Commercial Positioning

| Tier | Description |
|---|---|
| **Vigil AI (base)** | Full extension — all 22 panels, Solus offline AI, Memory Palace, Sentry, Graph — free, local-only |
| **Vigil Pro** | API key integration, cloud agent coordination, shared knowledge graphs |
| **Vigil Enterprise** | Org-wide sovereign deployment, custom model stack, on-premise Solus |

**Solus is the signature differentiator**: a fully offline AI that runs in the browser with zero ongoing cost. No API key required for AI inference. This is the core commercial value proposition.

---

## Extension Library

👉 See [download.html](download.html) for the full library of browser extensions.

---

*Built with React · TypeScript · Vite · Zustand · Dexie.js · Transformers.js · jsPDF · ExcelJS*
