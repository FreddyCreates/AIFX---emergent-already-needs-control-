/**
 * PROTO-259: Mycelium Mesh Formation Protocol (MMFP)
 * Topology growth, partition detection, and reconciliation.
 */

const PHI = 1.618033988749895;

export const MESH_STATES = {
  FORMING: 'forming',
  STABLE: 'stable',
  PARTITIONED: 'partitioned',
  RECONCILING: 'reconciling',
};

export const MESSAGE_TYPES = {
  NODE_JOIN: 'mycelium.mesh.node.join',
  NODE_LEAVE: 'mycelium.mesh.node.leave',
  LINK_FORM: 'mycelium.mesh.link.form',
  LINK_DROP: 'mycelium.mesh.link.drop',
  PARTITION_DETECT: 'mycelium.mesh.partition.detect',
  RECONCILE: 'mycelium.mesh.reconcile',
};

export function calculateTopologyWeight(degree, latencyMs, trust) {
  const degreeBoost = Math.log(degree + 1) / Math.log(PHI + 1);
  const latencyPenalty = 1 / (1 + latencyMs / 1000);
  return degreeBoost * latencyPenalty * Math.max(0, Math.min(1, trust));
}

export class MyceliumMeshFormationProtocol {
  constructor() {
    this.state = MESH_STATES.FORMING;
    this.nodes = new Map();
    this.links = new Map();
    this.events = [];
  }

  joinNode(nodeId, meta = {}) {
    this.nodes.set(nodeId, {
      nodeId,
      role: meta.role || 'worker',
      domain: meta.domain || 'global',
      joinedAt: Date.now(),
    });
    this.links.set(nodeId, this.links.get(nodeId) || new Map());
    if (this.nodes.size >= 4 && this.state === MESH_STATES.FORMING) this.state = MESH_STATES.STABLE;
    this._event(MESSAGE_TYPES.NODE_JOIN, { nodeId, meta });
    return this.nodes.get(nodeId);
  }

  leaveNode(nodeId) {
    this.nodes.delete(nodeId);
    this.links.delete(nodeId);
    for (const neighbors of this.links.values()) neighbors.delete(nodeId);
    this._event(MESSAGE_TYPES.NODE_LEAVE, { nodeId });
    this.detectPartition();
  }

  formLink(from, to, latencyMs = 10, trust = 1) {
    if (!this.nodes.has(from) || !this.nodes.has(to) || from === to) return null;
    const source = this.links.get(from) || new Map();
    const target = this.links.get(to) || new Map();
    const degree = source.size + target.size + 1;
    const weight = calculateTopologyWeight(degree, latencyMs, trust);
    const edge = { latencyMs, trust, weight, formedAt: Date.now() };
    source.set(to, edge);
    target.set(from, edge);
    this.links.set(from, source);
    this.links.set(to, target);
    this._event(MESSAGE_TYPES.LINK_FORM, { from, to, latencyMs, trust, weight });
    return edge;
  }

  dropLink(from, to, reason = 'manual') {
    const source = this.links.get(from);
    const target = this.links.get(to);
    source?.delete(to);
    target?.delete(from);
    this._event(MESSAGE_TYPES.LINK_DROP, { from, to, reason });
    this.detectPartition();
  }

  detectPartition() {
    if (this.nodes.size <= 1) return { partitioned: false, components: [this.nodes.size] };
    const componentNodes = this._getComponents();
    const components = componentNodes.map(group => group.length);
    const partitioned = components.length > 1;
    this.state = partitioned ? MESH_STATES.PARTITIONED : MESH_STATES.STABLE;
    if (partitioned) this._event(MESSAGE_TYPES.PARTITION_DETECT, { components });
    return { partitioned, components };
  }

  reconcile() {
    const componentNodes = this._getComponents();
    if (componentNodes.length <= 1) {
      this.state = MESH_STATES.STABLE;
      return { reconciled: true, linksAdded: 0 };
    }

    this.state = MESH_STATES.RECONCILING;
    const anchor = componentNodes[0][0];
    let linksAdded = 0;

    for (const group of componentNodes.slice(1)) {
      const bridgeNode = group[0];
      this.formLink(anchor, bridgeNode, 34, 0.8);
      linksAdded++;
    }

    this.state = MESH_STATES.STABLE;
    this._event(MESSAGE_TYPES.RECONCILE, { linksAdded });
    return { reconciled: true, linksAdded };
  }

  getAdjacency() {
    const adjacency = {};
    for (const [id, neighbors] of this.links.entries()) {
      adjacency[id] = [...neighbors.keys()];
    }
    return adjacency;
  }

  getMetrics() {
    let edgeCount = 0;
    for (const neighbors of this.links.values()) edgeCount += neighbors.size;
    return {
      state: this.state,
      nodeCount: this.nodes.size,
      edgeCount: Math.floor(edgeCount / 2),
      eventCount: this.events.length,
    };
  }

  _event(type, payload) {
    this.events.push({ at: Date.now(), type, payload });
    if (this.events.length > 1000) this.events.shift();
  }

  _getComponents() {
    const nodeIds = [...this.nodes.keys()];
    const seen = new Set();
    const components = [];

    for (const start of nodeIds) {
      if (seen.has(start)) continue;
      const queue = [start];
      seen.add(start);
      const nodes = [];

      while (queue.length) {
        const current = queue.shift();
        nodes.push(current);
        const neighbors = this.links.get(current) || new Map();
        for (const neighbor of neighbors.keys()) {
          if (!seen.has(neighbor)) {
            seen.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      components.push(nodes);
    }

    return components;
  }
}

export default MyceliumMeshFormationProtocol;
