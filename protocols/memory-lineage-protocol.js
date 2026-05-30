/**
 * PROTO-009: Memory Lineage Protocol (MLP)
 * Temporal Memory Intelligence that tracks full ancestry of every memory mutation
 * with phi-encoded spatial addressing, branch forking, consolidation, and garbage collection.
 *
 * Engines wired: SpatialMemoryStore + MemoryLineage + PhiCoordinateGenerator + Embeddings
 * Ring: Memory Ring | Organism placement: Frontend organism / memory layer
 * Wire: intelligence-wire/mlp
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;
const TWO_PI = 2 * Math.PI;

/**
 * A single memory node in the lineage tree.
 * @typedef {Object} MemoryNode
 * @property {string} id - Unique memory identifier
 * @property {string|null} parentId - Parent memory (null for roots)
 * @property {string[]} childIds - Child memory identifiers
 * @property {string} content - Stored content
 * @property {number[]} phiCoords - [x, y] phyllotaxis coordinates
 * @property {number} createdAt - Timestamp of creation
 * @property {number} lastAccessed - Timestamp of last access
 * @property {number} accessCount - Total access count
 * @property {number} generation - Depth in lineage tree (root = 0)
 * @property {string} branchTag - Human-readable branch label
 * @property {string} contentHash - SHA-like hash of content
 * @property {Object} metadata - Arbitrary metadata
 */

class MemoryLineageProtocol {
  /**
   * @param {Object} config - Configuration
   * @param {number} [config.maxMemories=10000] - Maximum memories before GC
   * @param {number} [config.gcThreshold=0.3] - Access-frequency threshold for GC
   * @param {number} [config.consolidationDepth=5] - Depth before consolidation triggers
   */
  constructor(config = {}) {
    /** @type {Map<string, MemoryNode>} */
    this.memories = new Map();
    /** @type {Map<string, Set<string>>} */
    this.branches = new Map();
    this.rootIds = new Set();
    this.maxMemories = config.maxMemories || 10000;
    this.gcThreshold = config.gcThreshold || 0.3;
    this.consolidationDepth = config.consolidationDepth || 5;
    this.nextIndex = 0;
    this.metrics = {
      totalCreated: 0,
      totalForked: 0,
      totalConsolidated: 0,
      totalGarbageCollected: 0,
      totalAccessed: 0,
      deepestGeneration: 0,
      activeBranches: 0
    };
  }

  /* ─── Phi-Coordinate Generator ─── */

  /**
   * Compute phyllotaxis coordinates for memory index n.
   * (x, y) = √(n+1) × (cos(n·θ), sin(n·θ))  where θ = golden angle
   * @param {number} n - Memory index
   * @returns {number[]} - [x, y]
   */
  _phiCoordinates(n) {
    const r = Math.sqrt(n + 1);
    const angle = n * GOLDEN_ANGLE;
    return [r * Math.cos(angle), r * Math.sin(angle)];
  }

  /**
   * Compute a simple content hash using Fibonacci identity.
   * @param {string} content
   * @returns {string}
   */
  _contentHash(content) {
    let h = 0;
    for (let i = 0; i < content.length; i++) {
      h = ((h << 5) - h + content.charCodeAt(i)) | 0;
    }
    const m = 2147483647; // 2^31 - 1
    let a = Math.abs(h) % m;
    let b = 1;
    for (let i = 0; i < 16; i++) {
      const t = (a + b) % m;
      a = b;
      b = t;
    }
    return b.toString(16).padStart(8, '0');
  }

  /* ─── Core Operations ─── */

  /**
   * Create a new root memory (no parent).
   * @param {string} content - Memory content
   * @param {Object} [metadata={}] - Arbitrary metadata
   * @param {string} [branchTag='main'] - Branch tag
   * @returns {Object} - Created memory node
   */
  createRoot(content, metadata = {}, branchTag = 'main') {
    const id = `mem-${this.nextIndex}`;
    const coords = this._phiCoordinates(this.nextIndex);
    const node = {
      id,
      parentId: null,
      childIds: [],
      content,
      phiCoords: coords,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      generation: 0,
      branchTag,
      contentHash: this._contentHash(content),
      metadata
    };
    this.memories.set(id, node);
    this.rootIds.add(id);
    if (!this.branches.has(branchTag)) {
      this.branches.set(branchTag, new Set());
    }
    this.branches.get(branchTag).add(id);
    this.nextIndex++;
    this.metrics.totalCreated++;
    this.metrics.activeBranches = this.branches.size;

    this._checkGC();
    return { id, phiCoords: coords, generation: 0, branchTag, contentHash: node.contentHash };
  }

  /**
   * Mutate (append a child to) an existing memory, tracking lineage.
   * @param {string} parentId - Parent memory ID
   * @param {string} content - New content
   * @param {Object} [metadata={}] - Metadata
   * @returns {Object} - Created child memory node
   */
  mutate(parentId, content, metadata = {}) {
    const parent = this.memories.get(parentId);
    if (!parent) {
      throw new Error(`Memory ${parentId} not found in lineage`);
    }
    const id = `mem-${this.nextIndex}`;
    const coords = this._phiCoordinates(this.nextIndex);
    const generation = parent.generation + 1;
    const node = {
      id,
      parentId,
      childIds: [],
      content,
      phiCoords: coords,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      generation,
      branchTag: parent.branchTag,
      contentHash: this._contentHash(content),
      metadata
    };
    parent.childIds.push(id);
    this.memories.set(id, node);
    if (this.branches.has(parent.branchTag)) {
      this.branches.get(parent.branchTag).add(id);
    }
    this.nextIndex++;
    this.metrics.totalCreated++;
    if (generation > this.metrics.deepestGeneration) {
      this.metrics.deepestGeneration = generation;
    }

    // Auto-consolidate if depth threshold reached
    if (generation > 0 && generation % this.consolidationDepth === 0) {
      this._autoConsolidate(id);
    }

    this._checkGC();
    return { id, parentId, phiCoords: coords, generation, branchTag: node.branchTag, contentHash: node.contentHash };
  }

  /**
   * Fork a new branch from an existing memory.
   * @param {string} sourceId - Memory to fork from
   * @param {string} newBranchTag - New branch tag
   * @param {string} content - Initial content on the new branch
   * @param {Object} [metadata={}] - Metadata
   * @returns {Object} - Forked memory node
   */
  fork(sourceId, newBranchTag, content, metadata = {}) {
    const source = this.memories.get(sourceId);
    if (!source) {
      throw new Error(`Memory ${sourceId} not found`);
    }
    const id = `mem-${this.nextIndex}`;
    const coords = this._phiCoordinates(this.nextIndex);
    const generation = source.generation + 1;
    const node = {
      id,
      parentId: sourceId,
      childIds: [],
      content,
      phiCoords: coords,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      generation,
      branchTag: newBranchTag,
      contentHash: this._contentHash(content),
      metadata: { ...metadata, forkedFrom: sourceId, originalBranch: source.branchTag }
    };
    source.childIds.push(id);
    this.memories.set(id, node);
    if (!this.branches.has(newBranchTag)) {
      this.branches.set(newBranchTag, new Set());
    }
    this.branches.get(newBranchTag).add(id);
    this.nextIndex++;
    this.metrics.totalCreated++;
    this.metrics.totalForked++;
    this.metrics.activeBranches = this.branches.size;
    if (generation > this.metrics.deepestGeneration) {
      this.metrics.deepestGeneration = generation;
    }

    return { id, parentId: sourceId, phiCoords: coords, generation, branchTag: newBranchTag, contentHash: node.contentHash };
  }

  /* ─── Retrieval ─── */

  /**
   * Access a memory by ID, updating access stats.
   * @param {string} id - Memory ID
   * @returns {Object|null} - Memory node or null
   */
  access(id) {
    const node = this.memories.get(id);
    if (!node) return null;
    node.lastAccessed = Date.now();
    node.accessCount++;
    this.metrics.totalAccessed++;
    return { ...node, childIds: [...node.childIds] };
  }

  /**
   * Trace full lineage from a memory back to its root.
   * @param {string} id - Memory ID
   * @returns {Object[]} - Array of ancestors from root to the given memory
   */
  traceLineage(id) {
    const lineage = [];
    let current = this.memories.get(id);
    while (current) {
      lineage.unshift({ id: current.id, generation: current.generation, branchTag: current.branchTag, contentHash: current.contentHash, phiCoords: current.phiCoords });
      current = current.parentId ? this.memories.get(current.parentId) : null;
    }
    return lineage;
  }

  /**
   * Get all memories on a branch.
   * @param {string} branchTag - Branch tag
   * @returns {Object[]} - Memories on this branch sorted by generation
   */
  getBranch(branchTag) {
    const ids = this.branches.get(branchTag);
    if (!ids) return [];
    const nodes = [];
    for (const id of ids) {
      const n = this.memories.get(id);
      if (n) nodes.push({ id: n.id, generation: n.generation, phiCoords: n.phiCoords, contentHash: n.contentHash, accessCount: n.accessCount });
    }
    nodes.sort((a, b) => a.generation - b.generation);
    return nodes;
  }

  /**
   * Find nearest memories in phi-coordinate space using Euclidean distance.
   * @param {number[]} coords - [x, y] target coordinates
   * @param {number} [k=5] - Number of nearest neighbors
   * @returns {Object[]} - Nearest memories with distance
   */
  findNearest(coords, k = 5) {
    const results = [];
    for (const [id, node] of this.memories) {
      const dx = node.phiCoords[0] - coords[0];
      const dy = node.phiCoords[1] - coords[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      results.push({ id, distance: dist, generation: node.generation, branchTag: node.branchTag });
    }
    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k);
  }

  /* ─── Consolidation ─── */

  /**
   * Auto-consolidate a memory chain. Merges intermediate memories
   * along the lineage into a single consolidated node.
   * @param {string} id - Tip memory ID
   * @returns {Object|null} - Consolidated node or null if nothing to consolidate
   */
  _autoConsolidate(id) {
    const lineage = this.traceLineage(id);
    if (lineage.length < this.consolidationDepth) return null;

    // Consolidate the intermediate memories content
    const toConsolidate = lineage.slice(-this.consolidationDepth);
    const consolidatedContent = toConsolidate.map(l => {
      const n = this.memories.get(l.id);
      return n ? n.content : '';
    }).join(' | ');

    const tipNode = this.memories.get(id);
    if (tipNode) {
      tipNode.metadata = tipNode.metadata || {};
      tipNode.metadata.consolidatedFrom = toConsolidate.map(l => l.id);
      tipNode.metadata.consolidatedContent = consolidatedContent;
      this.metrics.totalConsolidated++;
    }
    return tipNode ? { id, consolidatedCount: toConsolidate.length } : null;
  }

  /* ─── Garbage Collection ─── */

  /**
   * Garbage collect low-access memories when capacity exceeded.
   * Prunes memories below gcThreshold of max access frequency.
   * Never prunes root nodes or nodes with children.
   * @returns {Object} - { collected, remaining }
   */
  _checkGC() {
    if (this.memories.size <= this.maxMemories) return { collected: 0, remaining: this.memories.size };

    // Find max access count for normalization
    let maxAccess = 1;
    for (const [, node] of this.memories) {
      if (node.accessCount > maxAccess) maxAccess = node.accessCount;
    }

    const toRemove = [];
    for (const [id, node] of this.memories) {
      // Never GC roots or nodes with children
      if (this.rootIds.has(id)) continue;
      if (node.childIds.length > 0) continue;

      const normalizedAccess = node.accessCount / maxAccess;
      if (normalizedAccess < this.gcThreshold) {
        toRemove.push(id);
      }
    }

    // Sort by lowest access first, remove enough to get under limit
    toRemove.sort((a, b) => {
      const na = this.memories.get(a);
      const nb = this.memories.get(b);
      return (na ? na.accessCount : 0) - (nb ? nb.accessCount : 0);
    });

    const removeCount = Math.min(toRemove.length, this.memories.size - this.maxMemories + Math.floor(this.maxMemories * 0.1));
    let collected = 0;
    for (let i = 0; i < removeCount; i++) {
      const id = toRemove[i];
      const node = this.memories.get(id);
      if (node && node.parentId) {
        const parent = this.memories.get(node.parentId);
        if (parent) {
          parent.childIds = parent.childIds.filter(c => c !== id);
        }
      }
      if (node) {
        const branchSet = this.branches.get(node.branchTag);
        if (branchSet) branchSet.delete(id);
      }
      this.memories.delete(id);
      collected++;
    }

    this.metrics.totalGarbageCollected += collected;
    this.metrics.activeBranches = this.branches.size;
    return { collected, remaining: this.memories.size };
  }

  /**
   * Force a full garbage collection pass.
   * @returns {Object} - { collected, remaining }
   */
  forceGC() {
    const originalMax = this.maxMemories;
    this.maxMemories = Math.floor(this.memories.size * 0.8);
    const result = this._checkGC();
    this.maxMemories = originalMax;
    return result;
  }

  /* ─── Lineage Visualization ─── */

  /**
   * Generate a lineage tree structure suitable for visualization.
   * @returns {Object[]} - Array of root trees with nested children
   */
  getLineageTree() {
    const buildTree = (id) => {
      const node = this.memories.get(id);
      if (!node) return null;
      return {
        id: node.id,
        generation: node.generation,
        branchTag: node.branchTag,
        phiCoords: node.phiCoords,
        accessCount: node.accessCount,
        contentHash: node.contentHash,
        children: node.childIds.map(cid => buildTree(cid)).filter(Boolean)
      };
    };
    const trees = [];
    for (const rootId of this.rootIds) {
      const tree = buildTree(rootId);
      if (tree) trees.push(tree);
    }
    return trees;
  }

  /**
   * Returns protocol metrics.
   * @returns {Object} - Current metrics snapshot
   */
  getMetrics() {
    return {
      ...this.metrics,
      totalMemories: this.memories.size,
      totalBranches: this.branches.size,
      totalRoots: this.rootIds.size
    };
  }
}

export { MemoryLineageProtocol };
export default MemoryLineageProtocol;
