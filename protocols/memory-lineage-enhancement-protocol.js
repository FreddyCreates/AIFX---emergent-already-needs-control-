/**
 * PROTO-182: Memory Lineage Enhancement Protocol (MLEP)
 * Spatial memory with phi-decay weighting, PSE LRU integration, and lineage tracking.
 * Extends the base Memory Lineage Protocol (PROTO-009) with AURO-specific enhancements.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const MAX_TURNS = 100;
const CATEGORIES = ['research', 'theory', 'decisions', 'frameworks', 'insights'];
const LRU_CAPACITY = Math.round(PHI * PHI * PHI * 10); // ≈ 68 entries

class MemoryLineageEnhancementProtocol {
  /**
   * @param {Object} config
   */
  constructor(config = {}) {
    this.name = 'Memory Lineage Enhancement Protocol';
    this.id = 'PROTO-182-MLEP';
    this.ring = 'Memory Ring';

    // Spatial memory: entries carry positional coordinates in concept-space
    this.spatialMemory = [];
    // Category-bucketed stores
    this.categoryStore = {};
    for (const cat of CATEGORIES) this.categoryStore[cat] = [];

    // PSE LRU cache: bounded cache with phi-weighted recency scoring
    this.lruCache = new Map();
    this.lruOrder = [];

    // Lineage graph: tracks derivation chains between memory entries
    this.lineageGraph = new Map(); // entryId → [parentId, ...]

    this.metrics = {
      totalEntries: 0,
      totalRecalls: 0,
      lruHits: 0,
      lruMisses: 0,
      lineageLinks: 0
    };
  }

  /**
   * Store a memory entry with spatial coordinates and category
   * @param {Object} entry - {content, category, parentIds?, spatialCoords?}
   * @returns {string} entryId
   */
  remember(entry) {
    const entryId = this._generateId();
    const timestamp = Date.now();

    const spatial = entry.spatialCoords || this._computeSpatialCoords(entry.content);

    const record = {
      id: entryId,
      content: entry.content,
      category: entry.category || 'insights',
      spatial,
      timestamp,
      decay: 1.0,      // starts fully fresh; decays via phi
      accessCount: 0,
      parentIds: entry.parentIds || []
    };

    // Store in spatial memory ring buffer
    this.spatialMemory.push(record);
    if (this.spatialMemory.length > MAX_TURNS) {
      const removed = this.spatialMemory.shift();
      this.lruCache.delete(removed.id);
    }

    // Store in category bucket
    const cat = record.category;
    if (CATEGORIES.includes(cat)) {
      this.categoryStore[cat].push(record);
      if (this.categoryStore[cat].length > 20) this.categoryStore[cat].shift();
    }

    // LRU cache
    this._lruInsert(entryId, record);

    // Lineage registration
    if (record.parentIds.length > 0) {
      this.lineageGraph.set(entryId, record.parentIds);
      this.metrics.lineageLinks += record.parentIds.length;
    }

    this.metrics.totalEntries++;
    return entryId;
  }

  /**
   * Recall memory entries relevant to a query
   * @param {string} query
   * @param {Object} opts - {category?, topK?, useCache?}
   * @returns {Object[]} sorted memory entries
   */
  recall(query, opts = {}) {
    this.metrics.totalRecalls++;

    // Check LRU cache first
    if (opts.useCache !== false) {
      const cacheKey = `${query}:${opts.category || 'all'}`;
      if (this.lruCache.has(cacheKey)) {
        this.metrics.lruHits++;
        return this.lruCache.get(cacheKey).value;
      }
      this.metrics.lruMisses++;
    }

    const pool = opts.category
      ? (this.categoryStore[opts.category] || [])
      : this.spatialMemory;

    const topK = opts.topK || 10;

    // Score each entry by relevance + freshness
    const scored = pool.map(entry => ({
      ...entry,
      score: this._score(entry, query)
    }));

    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, topK);

    // Update access counts and cache
    for (const r of results) {
      r.accessCount++;
      this._lruInsert(r.id, r);
    }

    const cacheKey = `${query}:${opts.category || 'all'}`;
    this._lruInsert(cacheKey, results);

    return results;
  }

  /**
   * Recall the lineage chain of an entry (ancestors)
   * @param {string} entryId
   * @returns {Object[]} lineage entries
   */
  recallLineage(entryId) {
    const chain = [];
    const visited = new Set();
    const queue = [entryId];

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      const parents = this.lineageGraph.get(current) || [];
      for (const pid of parents) {
        const entry = this.spatialMemory.find(e => e.id === pid);
        if (entry) chain.push(entry);
        queue.push(pid);
      }
    }

    return chain;
  }

  /**
   * Apply phi-decay to all entries — call on each heartbeat tick
   */
  tick() {
    const now = Date.now();
    for (const entry of this.spatialMemory) {
      const ageTicks = (now - entry.timestamp) / HEARTBEAT;
      // Amortized phi-decay: decay = 1 / phi^(ageTicks * 0.01)
      entry.decay = 1 / Math.pow(PHI, ageTicks * 0.01);
    }
  }

  /**
   * Compute relevance + freshness score for an entry
   */
  _score(entry, query) {
    const words = query.toLowerCase().split(/\s+/);
    const content = entry.content.toLowerCase();
    const termHits = words.filter(w => content.includes(w)).length;
    const termScore = termHits / (words.length || 1);
    const freshnessScore = entry.decay;
    const accessBoost = Math.log1p(entry.accessCount) / PHI;
    return termScore * PHI + freshnessScore + accessBoost;
  }

  /**
   * Compute pseudo-spatial coordinates based on content hash
   */
  _computeSpatialCoords(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = (hash * PHI + content.charCodeAt(i)) & 0xffffffff;
    }
    return {
      x: (hash & 0xffff) / 0xffff,
      y: ((hash >> 16) & 0xffff) / 0xffff
    };
  }

  /**
   * LRU cache insert with phi-bounded eviction
   */
  _lruInsert(key, value) {
    if (this.lruCache.has(key)) {
      this.lruOrder.splice(this.lruOrder.indexOf(key), 1);
    } else if (this.lruCache.size >= LRU_CAPACITY) {
      const evict = this.lruOrder.shift();
      this.lruCache.delete(evict);
    }
    this.lruCache.set(key, { value, ts: Date.now() });
    this.lruOrder.push(key);
  }

  /**
   * Generate a unique entry ID
   */
  _generateId() {
    return `mlep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /**
   * Status report
   */
  status() {
    return {
      protocol: this.id,
      ring: this.ring,
      metrics: { ...this.metrics },
      lruSize: this.lruCache.size,
      lruCapacity: LRU_CAPACITY,
      spatialEntries: this.spatialMemory.length,
      lineageNodes: this.lineageGraph.size,
      phi: PHI,
      heartbeat: HEARTBEAT
    };
  }
}

export { MemoryLineageEnhancementProtocol };
