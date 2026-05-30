# ALPHA ONE — Bot Fleet Release Package

> **Version:** 0.1.0-alpha.1  
> **Codename:** ALPHA-ONE  
> **Status:** First public release of the Sovereign Organism bot fleet

---

## What's Included

ALPHA ONE bundles the complete bot infrastructure — **4 Agents** and **6 Microbots** organized into 2 operational divisions.

### Agents (The Organs)

| Agent | Role |
|-------|------|
| **ANIMUS** | Mind — reasoning, decisions, planning |
| **CORPUS** | Body — execution, action, resources |
| **SENSUS** | Senses — perception, filtering, attention |
| **MEMORIA** | Memory — encoding, retrieval, consolidation |

### Microbots (The Atoms)

#### Learning Division
| Microbot | Function |
|----------|----------|
| **SignalGatherer** | Collects training signals from CI reports |
| **SynapseTrainer** | Runs Hebbian learning on co-activation data |
| **WeightEvolver** | Evolves protocol weights via reward shaping |

#### Crawler Division
| Microbot | Function |
|----------|----------|
| **OrphanScanner** | Finds files with no importers |
| **LinkChecker** | Detects broken require/import/href references |
| **GraphBuilder** | Builds the full dependency web |

---

## Quick Start

```javascript
const { createAlphaOneFleet } = require('./index.js');

// Boot the fleet
const fleet = createAlphaOneFleet();

// Deploy the learning division
const result = await fleet.deploy('learning');
console.log(result);

// Deploy all divisions in parallel
const allResults = await fleet.deployAll();
console.log(allResults);

// Get fleet status
console.log(fleet.report());
```

## CLI Usage

```bash
node index.js --status
```

## Architecture

```
ALPHA ONE Fleet
├── Learning Division
│   ├── SignalGathererMicrobot
│   ├── SynapseTrainerMicrobot
│   └── WeightEvolverMicrobot
├── Crawler Division
│   ├── OrphanScannerMicrobot
│   ├── LinkCheckerMicrobot
│   └── GraphBuilderMicrobot
└── Agent Manifest
    ├── ANIMUS (Mind)
    ├── CORPUS (Body)
    ├── SENSUS (Senses)
    └── MEMORIA (Memory)
```

## Building

```bash
npm run build
# or from repo root:
node scripts/build-alpha-one.js
```

This produces a distributable package in `dist/alpha-one-v0.1.0-alpha.1/`.

---

**© MedinaSITech — All rights reserved**
