import crypto from 'node:crypto';

/**
 * Allowed node types.
 * @readonly
 */
const NODE_TYPES = new Set(['concept', 'entity', 'document', 'fact']);

/**
 * Allowed edge relations.
 * @readonly
 */
const EDGE_RELATIONS = new Set([
  'references',
  'contains',
  'relates_to',
  'derived_from',
  'contradicts',
]);

/**
 * In-memory knowledge graph supporting nodes, typed edges, traversal, and merging.
 */
export class KnowledgeGraph {
  /** @type {Map<string, object>} */
  #nodes = new Map();

  /** @type {Map<string, object>} */
  #edges = new Map();

  /** @type {Map<string, Set<string>>} adjacency list — nodeId → Set<edgeId> */
  #adjacency = new Map();

  /**
   * Add a node to the graph.
   * @param {string} id - Unique node identifier.
   * @param {string} type - One of `concept`, `entity`, `document`, `fact`.
   * @param {object} [properties={}] - Arbitrary properties attached to the node.
   * @returns {{ id: string, type: string, properties: object }}
   */
  addNode(id, type, properties = {}) {
    if (!id) throw new Error('Node id is required');
    if (!NODE_TYPES.has(type)) {
      throw new Error(`Invalid node type "${type}". Use one of: ${[...NODE_TYPES].join(', ')}`);
    }

    const node = {
      id,
      type,
      properties: { ...properties },
      createdAt: new Date().toISOString(),
    };

    this.#nodes.set(id, node);
    if (!this.#adjacency.has(id)) {
      this.#adjacency.set(id, new Set());
    }

    return { id: node.id, type: node.type, properties: node.properties };
  }

  /**
   * Add a directed edge between two nodes.
   * @param {string} sourceId
   * @param {string} targetId
   * @param {string} relation - One of `references`, `contains`, `relates_to`, `derived_from`, `contradicts`.
   * @param {number} [weight=1.0] - Edge weight (0–1).
   * @returns {{ id: string, sourceId: string, targetId: string, relation: string, weight: number }}
   */
  addEdge(sourceId, targetId, relation, weight = 1.0) {
    if (!this.#nodes.has(sourceId)) throw new Error(`Source node "${sourceId}" not found`);
    if (!this.#nodes.has(targetId)) throw new Error(`Target node "${targetId}" not found`);
    if (!EDGE_RELATIONS.has(relation)) {
      throw new Error(`Invalid relation "${relation}". Use one of: ${[...EDGE_RELATIONS].join(', ')}`);
    }

    const id = crypto.randomUUID();
    const edge = {
      id,
      sourceId,
      targetId,
      relation,
      weight: Math.max(0, Math.min(1, weight)),
      createdAt: new Date().toISOString(),
    };

    this.#edges.set(id, edge);
    this.#adjacency.get(sourceId).add(id);
    this.#adjacency.get(targetId).add(id);

    return { id, sourceId, targetId, relation, weight: edge.weight };
  }

  /**
   * Get a node together with all edges that touch it.
   * @param {string} id
   * @returns {{ node: object, edges: object[] } | null}
   */
  getNode(id) {
    const node = this.#nodes.get(id);
    if (!node) return null;

    const edgeIds = this.#adjacency.get(id) ?? new Set();
    const edges = [...edgeIds].map((eid) => this.#edges.get(eid)).filter(Boolean);

    return { node: { ...node }, edges };
  }

  /**
   * Query the graph by pattern.
   * @param {{ nodeType?: string, relation?: string, depth?: number }} pattern
   * @returns {object[]} Matching nodes with their connected subgraphs.
   */
  query(pattern = {}) {
    const { nodeType, relation, depth = 1 } = pattern;

    // Seed: nodes matching the requested type (or all nodes)
    let seeds = [...this.#nodes.values()];
    if (nodeType) {
      seeds = seeds.filter((n) => n.type === nodeType);
    }

    const results = [];

    for (const seed of seeds) {
      const visited = new Set();
      const collected = this.#traverse(seed.id, relation, depth, visited);
      results.push({
        root: { ...seed },
        connected: collected,
      });
    }

    return results;
  }

  /**
   * Merge another KnowledgeGraph instance into this one.
   * Existing nodes with the same ID have their properties merged.
   * @param {KnowledgeGraph} otherGraph
   */
  merge(otherGraph) {
    const data = otherGraph.export();

    for (const node of data.nodes) {
      if (this.#nodes.has(node.id)) {
        const existing = this.#nodes.get(node.id);
        existing.properties = { ...existing.properties, ...node.properties };
      } else {
        this.addNode(node.id, node.type, node.properties);
      }
    }

    for (const edge of data.edges) {
      // Avoid duplicate edges with same source/target/relation
      const isDuplicate = [...this.#edges.values()].some(
        (e) =>
          e.sourceId === edge.sourceId &&
          e.targetId === edge.targetId &&
          e.relation === edge.relation,
      );
      if (!isDuplicate && this.#nodes.has(edge.sourceId) && this.#nodes.has(edge.targetId)) {
        this.addEdge(edge.sourceId, edge.targetId, edge.relation, edge.weight);
      }
    }
  }

  /**
   * Export the full graph as a serializable plain object.
   * @returns {{ nodes: object[], edges: object[] }}
   */
  export() {
    return {
      nodes: [...this.#nodes.values()].map((n) => ({ ...n })),
      edges: [...this.#edges.values()].map((e) => ({ ...e })),
    };
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * BFS traversal from a node, optionally filtering by relation.
   * @param {string} startId
   * @param {string | undefined} relation
   * @param {number} maxDepth
   * @param {Set<string>} visited
   * @returns {object[]}
   */
  #traverse(startId, relation, maxDepth, visited) {
    const result = [];
    /** @type {Array<{ id: string, depth: number }>} */
    const frontier = [{ id: startId, depth: 0 }];

    while (frontier.length > 0) {
      const { id, depth } = frontier.shift();
      if (visited.has(id) || depth > maxDepth) continue;
      visited.add(id);

      const edgeIds = this.#adjacency.get(id) ?? new Set();
      for (const eid of edgeIds) {
        const edge = this.#edges.get(eid);
        if (!edge) continue;
        if (relation && edge.relation !== relation) continue;

        const neighborId = edge.sourceId === id ? edge.targetId : edge.sourceId;
        const neighborNode = this.#nodes.get(neighborId);
        if (neighborNode && !visited.has(neighborId)) {
          result.push({ node: { ...neighborNode }, edge: { ...edge } });
          frontier.push({ id: neighborId, depth: depth + 1 });
        }
      }
    }

    return result;
  }
}

export default KnowledgeGraph;
