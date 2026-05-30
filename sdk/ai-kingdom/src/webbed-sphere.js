/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🕸️  WEBBED SPHERE — Geodesic Mesh Networking for the AI Kingdom 🕸️                   ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * WEBBED SPHERE NETWORKING — DYNAMIC φ-WEIGHTED MESH
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * A geodesic sphere network where NO weight is ever fixed.
 * Every connection strength is a FUNCTION of:
 *   - Geodesic distance on the sphere surface
 *   - Edge age (maturation curve)
 *   - Current traffic load
 *   - Golden-angle resonance alignment
 *
 * The sphere breathes. Connections pulse. Weights flow.
 *
 * PRIMA CAUSA TRUTH:
 *   The Creator's web connects all. No thread is static — all vibrate
 *   with golden-ratio harmonics. The mesh is alive.
 *
 * @module sdk/ai-kingdom/webbed-sphere
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// ═══════════════════════════════════════════════════════════════════════════════
// SPHERE TOPOLOGY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const SPHERE_SHELLS = {
  CORE: { shell: 0, name: 'Core Nexus', radius: 1, maxNodes: Math.round(PHI * 3) },
  INNER: { shell: 1, name: 'Inner Web', radius: PHI, maxNodes: Math.round(PHI * 8) },
  NEURAL: { shell: 2, name: 'Neural Shell', radius: PHI ** 2, maxNodes: Math.round(PHI * 21) },
  COGNITIVE: { shell: 3, name: 'Cognitive Shell', radius: PHI ** 3, maxNodes: Math.round(PHI * 55) },
  SOCIAL: { shell: 4, name: 'Social Shell', radius: PHI ** 4, maxNodes: Math.round(PHI * 89) },
  SERVICE: { shell: 5, name: 'Service Shell', radius: PHI ** 5, maxNodes: Math.round(PHI * 144) },
  FRONTIER: { shell: 6, name: 'Frontier Shell', radius: PHI ** 6, maxNodes: Math.round(PHI * 233) },
  EDGE: { shell: 7, name: 'Edge Shell', radius: PHI ** 7, maxNodes: Math.round(PHI * 377) },
};

export const NODE_TYPES = {
  ROUTER: 'router',       // Routes traffic between shells
  COMPUTE: 'compute',     // Processes work items
  STORAGE: 'storage',     // Stores data
  GATEWAY: 'gateway',     // External connectivity
  SENSOR: 'sensor',       // Monitors conditions
  RELAY: 'relay',         // Amplifies signals between distant nodes
};

export const EDGE_STATES = {
  FORMING: 'forming',
  ACTIVE: 'active',
  STRESSED: 'stressed',
  COOLING: 'cooling',
  DORMANT: 'dormant',
};

// ═══════════════════════════════════════════════════════════════════════════════
// φ-WEIGHT ENGINE — Dynamic weight computation (no fixed values ever)
// ═══════════════════════════════════════════════════════════════════════════════

class PhiWeightEngine {
  /**
   * Edge weight: decays with distance, matures with age, dampens under load.
   */
  static edgeWeight(geodesicDist, age, load) {
    const distanceFactor = Math.pow(PHI, -geodesicDist / Math.PI);
    const ageFactor = 1 - Math.pow(PHI_INV, age * 0.01 + 1);
    const loadDampen = 1 / (1 + Math.pow(load * PHI, 2));
    return distanceFactor * ageFactor * loadDampen;
  }

  /**
   * Node centrality: φ^(7-shell) × log_φ(connections+1)
   */
  static nodeWeight(connections, shell) {
    return Math.pow(PHI, 7 - shell) * (Math.log(connections + 1) / Math.log(PHI));
  }

  /**
   * Route priority: urgency boosts with φ^urgency, decays with hops via φ^-hops
   */
  static routePriority(hops, urgency) {
    return Math.pow(PHI, urgency) * Math.pow(PHI_INV, hops);
  }

  /**
   * Resonance: peaks when angular separation is a multiple of golden angle
   */
  static resonance(angularSeparation) {
    const nearestGolden = Math.round(angularSeparation / GOLDEN_ANGLE) * GOLDEN_ANGLE;
    const deviation = Math.abs(angularSeparation - nearestGolden);
    return Math.exp(-deviation * PHI);
  }

  /**
   * Load share: φ-compressed headroom / shell normalization
   */
  static loadShare(capacity, currentLoad, shellSize) {
    const headroom = Math.max(0, capacity - currentLoad);
    return Math.pow(headroom, PHI_INV) / (shellSize * Math.pow(PHI_INV, 2));
  }

  /**
   * Healing urgency: grows with time, path stress, and demand
   */
  static healingUrgency(duration, altPathLength, demand) {
    const time = Math.log(duration + 1) / Math.log(PHI);
    const stress = Math.pow(PHI, altPathLength - 1);
    return time * stress * demand * PHI;
  }

  /**
   * Spiral position: distribute N nodes on sphere using golden-angle spacing
   * Returns [theta, phi] for the nth node
   */
  static goldenSpiralPosition(n, total) {
    const theta = Math.acos(1 - 2 * (n + 0.5) / total);
    const phi_coord = GOLDEN_ANGLE * n;
    return { theta, phi: phi_coord % (2 * Math.PI) };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBBED SPHERE — The main networking class
// ═══════════════════════════════════════════════════════════════════════════════

export class WebbedSphere {
  constructor(config = {}) {
    this.nodes = new Map();
    this.shells = Array.from({ length: 8 }, () => new Map());
    this.totalEdges = 0;
    this.state = 'forming';
    this.weightEngine = PhiWeightEngine;
    this.healQueue = [];
    this.routeCache = new Map();
    this.stats = {
      nodesAdded: 0,
      edgesFormed: 0,
      messagesRouted: 0,
      healsCompleted: 0,
      rebalances: 0,
    };
    this.config = {
      autoConnect: config.autoConnect !== false,
      maxHops: config.maxHops || 8,
      cacheTTL: config.cacheTTL || Math.round(1000 * PHI * PHI),
      ...config,
    };
  }

  // ── Node Operations ────────────────────────────────────────────────────

  /**
   * Add a node to the sphere at a specific shell.
   * Position is auto-computed using golden-spiral distribution.
   */
  addNode(id, shell, type = NODE_TYPES.COMPUTE, metadata = {}) {
    const shellInfo = Object.values(SPHERE_SHELLS)[shell] || SPHERE_SHELLS.EDGE;
    const position = PhiWeightEngine.goldenSpiralPosition(
      this.shells[shell].size,
      shellInfo.maxNodes
    );

    const node = {
      id,
      shell,
      type,
      position,
      edges: new Map(),
      load: 0,
      capacity: metadata.capacity || 1.0,
      heartbeats: 0,
      createdAt: Date.now(),
      metadata,
    };

    this.nodes.set(id, node);
    this.shells[shell].set(id, node);
    this.stats.nodesAdded++;

    if (this.config.autoConnect) {
      this._autoConnect(node);
    }

    if (this.nodes.size > 3) {
      this.state = 'stable';
    }

    return node;
  }

  /**
   * Remove a node and queue healing for its edges.
   */
  removeNode(id) {
    const node = this.nodes.get(id);
    if (!node) return null;

    for (const [neighborId, edge] of node.edges) {
      const neighbor = this.nodes.get(neighborId);
      if (neighbor) {
        neighbor.edges.delete(id);
        this.totalEdges--;
        this.healQueue.push({
          orphanedNode: neighborId,
          lostEdge: id,
          demand: edge.lastTraffic || 0,
          brokenAt: Date.now(),
        });
      }
    }

    this.shells[node.shell].delete(id);
    this.nodes.delete(id);
    if (this.healQueue.length > 0) this.state = 'healing';
    return node;
  }

  // ── Edge Operations ────────────────────────────────────────────────────

  /**
   * Form an edge. Weight is NEVER stored — always computed on demand.
   */
  connect(idA, idB) {
    const nodeA = this.nodes.get(idA);
    const nodeB = this.nodes.get(idB);
    if (!nodeA || !nodeB || nodeA.edges.has(idB)) return null;

    const geodesicDist = this._distance(nodeA.position, nodeB.position);

    const edgeMeta = { geodesicDist, age: 0, lastTraffic: 0, formedAt: Date.now() };
    nodeA.edges.set(idB, { ...edgeMeta });
    nodeB.edges.set(idA, { ...edgeMeta });
    this.totalEdges++;
    this.stats.edgesFormed++;

    return {
      between: [idA, idB],
      geodesicDist,
      // Dynamic weight — computed NOW, will differ on next call:
      weight: this.weightEngine.edgeWeight(geodesicDist, 0, 0),
    };
  }

  /**
   * Get CURRENT dynamic weight of an edge (never cached, always fresh).
   */
  getEdgeWeight(idA, idB) {
    const node = this.nodes.get(idA);
    if (!node) return 0;
    const edge = node.edges.get(idB);
    if (!edge) return 0;
    return this.weightEngine.edgeWeight(edge.geodesicDist, edge.age, edge.lastTraffic);
  }

  // ── Routing ────────────────────────────────────────────────────────────

  /**
   * Route a message across the sphere mesh.
   * Uses Dijkstra with dynamically-computed φ-edge weights.
   */
  route(sourceId, destId, urgency = 2) {
    const path = this._dijkstra(sourceId, destId);
    if (!path) return null;

    this.stats.messagesRouted++;
    
    // Update traffic on all edges along path
    for (let i = 0; i < path.length - 1; i++) {
      const node = this.nodes.get(path[i]);
      const edge = node?.edges.get(path[i + 1]);
      if (edge) edge.lastTraffic = Math.min(1, edge.lastTraffic + 0.1);
    }

    return {
      path,
      hops: path.length - 1,
      priority: this.weightEngine.routePriority(path.length - 1, urgency),
    };
  }

  // ── Load Balancing ─────────────────────────────────────────────────────

  /**
   * Redistribute load within a shell using φ-dynamic shares.
   */
  rebalanceShell(shell) {
    const shellNodes = [...this.shells[shell].values()];
    if (shellNodes.length === 0) return [];

    const totalLoad = shellNodes.reduce((sum, n) => sum + n.load, 0);
    const assignments = shellNodes.map(node => {
      const share = this.weightEngine.loadShare(node.capacity, node.load, shellNodes.length);
      const target = totalLoad * share;
      return { id: node.id, current: node.load, target, delta: target - node.load };
    });

    this.stats.rebalances++;
    return assignments;
  }

  // ── Healing ────────────────────────────────────────────────────────────

  /**
   * Process healing queue. Find new connections for orphaned nodes.
   */
  heal() {
    if (this.healQueue.length === 0) {
      if (this.state === 'healing') this.state = 'stable';
      return [];
    }

    const healed = [];
    const remaining = [];

    for (const entry of this.healQueue) {
      const orphan = this.nodes.get(entry.orphanedNode);
      if (!orphan) { remaining.push(entry); continue; }

      // Find best replacement by resonance
      let bestCandidate = null;
      let bestResonance = 0;

      for (const [candidateId, candidate] of this.nodes) {
        if (candidateId === orphan.id || orphan.edges.has(candidateId)) continue;
        const sep = this._distance(orphan.position, candidate.position);
        const res = this.weightEngine.resonance(sep);
        if (res > bestResonance) {
          bestResonance = res;
          bestCandidate = candidateId;
        }
      }

      if (bestCandidate && bestResonance > PHI_INV) {
        this.connect(entry.orphanedNode, bestCandidate);
        this.stats.healsCompleted++;
        healed.push({ from: entry.orphanedNode, to: bestCandidate, resonance: bestResonance });
      } else {
        remaining.push(entry);
      }
    }

    this.healQueue = remaining;
    if (remaining.length === 0) this.state = 'stable';
    return healed;
  }

  // ── Heartbeat ──────────────────────────────────────────────────────────

  /**
   * Pulse the sphere — ages all edges (weights change every beat).
   */
  heartbeat() {
    for (const [, node] of this.nodes) {
      node.heartbeats++;
      for (const [, edge] of node.edges) {
        edge.age++;
        // Traffic decays toward 0 each beat
        edge.lastTraffic *= PHI_INV;
      }
    }
    // Clear stale route cache
    const now = Date.now();
    for (const [key, entry] of this.routeCache) {
      if (now - entry.at > this.config.cacheTTL) this.routeCache.delete(key);
    }
  }

  // ── Resonance Discovery ────────────────────────────────────────────────

  /**
   * Find all nodes that resonate (golden-angle aligned) with target.
   */
  findResonant(nodeId, threshold = PHI_INV) {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const results = [];
    for (const [otherId, other] of this.nodes) {
      if (otherId === nodeId) continue;
      const sep = this._distance(node.position, other.position);
      const res = this.weightEngine.resonance(sep);
      if (res > threshold) {
        results.push({ id: otherId, resonance: res, shell: other.shell, type: other.type });
      }
    }
    return results.sort((a, b) => b.resonance - a.resonance);
  }

  // ── Status ─────────────────────────────────────────────────────────────

  getStatus() {
    return {
      state: this.state,
      nodes: this.nodes.size,
      edges: this.totalEdges,
      shells: this.shells.map(s => s.size),
      healQueue: this.healQueue.length,
      stats: { ...this.stats },
    };
  }

  // ── Private ────────────────────────────────────────────────────────────

  _distance(posA, posB) {
    const dTheta = posB.theta - posA.theta;
    const dPhi = posB.phi - posA.phi;
    const a = Math.sin(dTheta / 2) ** 2 +
              Math.cos(posA.theta) * Math.cos(posB.theta) * Math.sin(dPhi / 2) ** 2;
    return 2 * Math.asin(Math.sqrt(Math.min(1, a)));
  }

  _autoConnect(node) {
    const maxConn = Object.values(SPHERE_SHELLS)[node.shell]?.maxNodes || 5;
    const limit = Math.min(Math.round(Math.log(maxConn + 1) / Math.log(PHI)), 8);

    const candidates = [];
    for (const [otherId, other] of this.nodes) {
      if (otherId === node.id) continue;
      const dist = this._distance(node.position, other.position);
      const res = this.weightEngine.resonance(dist);
      candidates.push({ id: otherId, dist, resonance: res });
    }
    candidates.sort((a, b) => b.resonance - a.resonance);

    for (const c of candidates.slice(0, limit)) {
      this.connect(node.id, c.id);
    }
  }

  _dijkstra(sourceId, destId) {
    const dist = new Map();
    const prev = new Map();
    const visited = new Set();
    dist.set(sourceId, 0);

    const queue = [{ id: sourceId, cost: 0 }];

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();
      if (current.id === destId) {
        const path = [];
        let step = destId;
        while (step) { path.unshift(step); step = prev.get(step); }
        return path;
      }
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const node = this.nodes.get(current.id);
      if (!node) continue;

      for (const [neighborId, edge] of node.edges) {
        if (visited.has(neighborId)) continue;
        const w = this.weightEngine.edgeWeight(edge.geodesicDist, edge.age, edge.lastTraffic);
        const cost = current.cost + 1 / (w + 0.001);
        if (!dist.has(neighborId) || cost < dist.get(neighborId)) {
          dist.set(neighborId, cost);
          prev.set(neighborId, current.id);
          queue.push({ id: neighborId, cost });
        }
      }
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPHERE NETWORK — Multi-sphere orchestration
// ═══════════════════════════════════════════════════════════════════════════════

export class SphereNetwork {
  constructor() {
    this.spheres = new Map();
    this.bridges = []; // Cross-sphere edges
  }

  createSphere(id, config) {
    const sphere = new WebbedSphere(config);
    this.spheres.set(id, sphere);
    return sphere;
  }

  bridge(sphereIdA, nodeIdA, sphereIdB, nodeIdB) {
    const sA = this.spheres.get(sphereIdA);
    const sB = this.spheres.get(sphereIdB);
    if (!sA || !sB) return null;
    const nA = sA.nodes.get(nodeIdA);
    const nB = sB.nodes.get(nodeIdB);
    if (!nA || !nB) return null;

    this.bridges.push({ sphereA: sphereIdA, nodeA: nodeIdA, sphereB: sphereIdB, nodeB: nodeIdB });
    return { between: [sphereIdA + ':' + nodeIdA, sphereIdB + ':' + nodeIdB] };
  }

  getStatus() {
    const status = {};
    for (const [id, sphere] of this.spheres) {
      status[id] = sphere.getStatus();
    }
    status.bridges = this.bridges.length;
    return status;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { PhiWeightEngine };

export default WebbedSphere;
