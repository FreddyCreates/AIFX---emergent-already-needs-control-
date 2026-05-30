# @medina/sovereign-memory-sdk — v1.0.0

> Enterprise memory that never forgets.

**License:** Open-core (MIT wrapper, proprietary Memory Temple internals)

---

## Exports

| Class | Module | Description |
|---|---|---|
| `SpatialMemoryStore` | `spatial-memory-store.js` | Store and retrieve values at five-axis coordinates (θ, φ, ρ, ring, beat) |
| `DualLayerSearch` | `dual-layer-search.js` | Semantic (TF-IDF) + φ-resonance search with merged dual-read |
| `MemoryLineage` | `memory-lineage.js` | Ancestor tracking, forking, and branch consolidation |
| `LivingDocument` | `living-document.js` | Evolvable documents with mutation history and immutable snapshots |
| `PhiCoordinateGenerator` | `phi-coordinate-generator.js` | φ-encoded spiral coordinate generation, encode/decode, distance |

---

## Quick Start

```js
import {
  SpatialMemoryStore,
  DualLayerSearch,
  MemoryLineage,
  LivingDocument,
  PhiCoordinateGenerator,
} from '@medina/sovereign-memory-sdk';
```

### Spatial Memory Store

```js
const store = new SpatialMemoryStore({ ringCount: 7, beatResolution: 64 });

const record = store.store('idea-1', { text: 'Hello world' }, {
  theta: 1.2, phi: 0.8, rho: 0.5, ring: 3, beat: 12,
});

console.log(record.id);   // UUID
console.log(record.hash); // deterministic hash

const retrieved = store.retrieve('idea-1');
const ringItems = store.listByRing(3);
const beatItems = store.listByBeat(12);
```

### Dual-Layer Search

```js
const search = new DualLayerSearch();

const corpus = [
  { id: 'a', text: 'quantum entanglement theory', coordinates: { theta: 1, phi: 0.5, rho: 0.3, ring: 2, beat: 8 } },
  { id: 'b', text: 'classical mechanics overview', coordinates: { theta: 0.5, phi: 1.2, rho: 0.7, ring: 4, beat: 16 } },
];

// Semantic search (TF-IDF token overlap)
const semantic = search.searchSemantic('quantum theory', corpus);

// Resonance search (φ-weighted coordinate proximity)
const resonance = search.searchResonance(
  { theta: 1, phi: 0.5, rho: 0.3, ring: 2, beat: 8 },
  corpus,
  0.5,
);

// Combined dual-read
const merged = search.dualRead(
  { text: 'quantum theory', coordinates: { theta: 1, phi: 0.5, rho: 0.3, ring: 2, beat: 8 } },
  corpus,
  { semanticWeight: 0.6, resonanceWeight: 0.4 },
);
```

### Memory Lineage

```js
const lineage = new MemoryLineage();

lineage.recordAncestor('child-1', 'parent-1');
lineage.recordAncestor('parent-1', 'root');

const chain = lineage.getLineage('child-1');   // ['root', 'parent-1']
const fork  = lineage.fork('child-1', 'experiment-branch');
const merge = lineage.consolidate(['child-1', fork.forkId]);
```

### Living Document

```js
const docs = new LivingDocument();

const doc = docs.create('Research Notes', 'Initial observations...');
docs.evolve(doc.id, { type: 'append', content: 'Updated with new data...' });

const snap = docs.snapshot(doc.id);        // frozen object
const history = docs.getEvolutionHistory(doc.id);
```

### Phi Coordinate Generator

```js
const gen = new PhiCoordinateGenerator();

const coords = gen.generate(42);
const encoded = gen.encode(coords);  // "1.23456789:0.98765432:..."
const decoded = gen.decode(encoded);
const dist = gen.distance(coords, gen.generate(43));
```

---

## Tiers

| Feature | Free | Paid |
|---|---|---|
| `store` / `retrieve` | ✅ | ✅ |
| `listByRing` / `listByBeat` | ✅ | ✅ |
| `searchSemantic` | ✅ | ✅ |
| `dualRead` | — | ✅ |
| `getLineage` / `fork` | — | ✅ |
| `consolidate` | — | ✅ |
| Living Document management | — | ✅ |
| Kernel compression | — | ✅ |
