# @medina/document-absorption-engine — v1.0.0

Document intake, extraction, and knowledge absorption — turning raw documents into structured intelligence that feeds into the organism.

**License:** Proprietary (UNLICENSED)

---

## Features

| Module | Description |
|---|---|
| **DocumentIntake** | Multi-format parsing (text, markdown, HTML, JSON, CSV), validation, normalization, and queue management |
| **ContentExtractor** | Structured content extraction — title, sections, entities, keywords, and extractive summaries |
| **KnowledgeGraph** | In-memory knowledge graph with typed nodes, weighted edges, traversal queries, and graph merging |
| **AbsorptionPipeline** | Configurable multi-stage processing pipelines with per-stage timing metrics |
| **DigestGenerator** | Consolidated digest generation in brief, detailed, or executive formats |

---

## Installation

```bash
npm install @medina/document-absorption-engine
```

## Quick Start

```js
import {
  DocumentIntake,
  ContentExtractor,
  KnowledgeGraph,
  AbsorptionPipeline,
  DigestGenerator,
} from '@medina/document-absorption-engine';
```

### 1 — Ingest Documents

```js
const intake = new DocumentIntake();

const receipt = intake.ingest('# Project Report\n\nFindings show growth.', 'markdown');
console.log(receipt.id, receipt.status);

const batch = intake.batchIngest([
  { source: '<p>Hello World</p>', format: 'html' },
  { source: '{"key": "value"}', format: 'json' },
]);
```

### 2 — Extract Content

```js
const extractor = new ContentExtractor();
const doc = { normalized: intake.getNormalizedContent(receipt.id) };
const { title, sections, entities, keywords, summary } = extractor.extract(doc);
```

### 3 — Build a Knowledge Graph

```js
const graph = new KnowledgeGraph();

graph.addNode('doc-1', 'document', { title: 'Report' });
graph.addNode('growth', 'concept', { domain: 'business' });
graph.addEdge('doc-1', 'growth', 'contains', 0.9);

const results = graph.query({ nodeType: 'concept', depth: 2 });
const exported = graph.export(); // serializable snapshot
```

### 4 — Run the Absorption Pipeline

```js
const pipeline = new AbsorptionPipeline();
const { id: pipeId } = pipeline.createPipeline('default');

// Feed documents through all stages (intake → extract → classify → index → absorb)
pipeline.feed(pipeId, { normalized: 'Raw document text...' });

const outputs = pipeline.getOutput(pipeId);
const metrics = pipeline.getPipelineMetrics(pipeId);
```

### 5 — Generate a Digest

```js
const gen = new DigestGenerator();
const { id: digestId } = gen.createDigest(
  [{ normalized: 'First document...' }, { normalized: 'Second document...' }],
  { format: 'executive', maxLength: 2000, focus: ['growth'] },
);

gen.addToDigest(digestId, { normalized: 'Third document...' });
const { output } = gen.finalize(digestId);
console.log(output);
```

---

## API Reference

### DocumentIntake

| Method | Description |
|---|---|
| `ingest(source, format)` | Ingest a single document. Formats: `text`, `markdown`, `html`, `json`, `csv` |
| `batchIngest(sources)` | Ingest an array of `{ source, format }` objects |
| `getIngestionStatus(docId)` | Get processing status for a document |
| `listIngested()` | List all ingested documents with metadata |
| `getNormalizedContent(docId)` | Retrieve the normalized plain-text content |

### ContentExtractor

| Method | Description |
|---|---|
| `extract(document)` | Extract `{ title, sections, entities, keywords, summary }` |
| `extractEntities(text)` | NER-like extraction (names, emails, URLs, numbers) |
| `extractKeywords(text, topN)` | TF-based keyword extraction |
| `generateSummary(text, maxSentences)` | Extractive summarization by keyword density |

### KnowledgeGraph

| Method | Description |
|---|---|
| `addNode(id, type, properties)` | Add a node (`concept` / `entity` / `document` / `fact`) |
| `addEdge(sourceId, targetId, relation, weight)` | Add a directed edge (`references` / `contains` / `relates_to` / `derived_from` / `contradicts`) |
| `getNode(id)` | Get node with all connected edges |
| `query(pattern)` | Traverse by `{ nodeType, relation, depth }` |
| `merge(otherGraph)` | Merge another graph into this one |
| `export()` | Export serializable `{ nodes, edges }` |

### AbsorptionPipeline

| Method | Description |
|---|---|
| `createPipeline(name, stages)` | Create a pipeline; defaults to intake → extract → classify → index → absorb |
| `feed(pipelineId, document)` | Process a document through all stages |
| `getOutput(pipelineId)` | Retrieve all processed outputs |
| `getPipelineMetrics(pipelineId)` | Per-stage invocation count, total ms, and average ms |

### DigestGenerator

| Method | Description |
|---|---|
| `createDigest(documents, config)` | Start a digest; config: `{ format, maxLength, focus }` |
| `addToDigest(digestId, document)` | Append a document to an existing draft digest |
| `finalize(digestId)` | Render the final digest output |
| `getDigest(digestId)` | Get current digest state |

---

## Architecture

```
Documents ──► DocumentIntake ──► ContentExtractor ──► KnowledgeGraph
                                        │
                                        ▼
                              AbsorptionPipeline
                                        │
                                        ▼
                               DigestGenerator ──► Structured Intelligence
```
