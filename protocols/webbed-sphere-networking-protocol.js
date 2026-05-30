/**
 * PROTO-252: Webbed Sphere Networking Protocol (WSNP)
 * Geodesic mesh networking with φ-driven dynamic weight functions.
 *
 * The Webbed Sphere Networking Protocol defines formal rules for:
 * - Geodesic sphere topology with vertices as network nodes
 * - Dynamic edge weights computed via golden-ratio functions (never fixed)
 * - Fibonacci-layered routing shells (L0–L7 sphere radii)
 * - Phi-spiral path optimization across sphere surface
 * - Resonance-based load distribution along great-circle arcs
 * - Self-healing mesh reconnection using golden-angle separation
 *
 * KEY PRINCIPLE: No weight is ever a constant. Every weight is a FUNCTION
 * of distance, age, load, and φ-phase. The sphere breathes.
 *
 * @module protocols/webbed-sphere-networking-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.399 rad ≈ 137.508°
const PROTOCOL_ID = 'PROTO-252';
const PROTOCOL_NAME = 'Webbed Sphere Networking Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// φ-WEIGHT FUNCTIONS — The core of WSNP: weights are NEVER static
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute edge weight between two sphere nodes.
 * Weight decays with geodesic distance and oscillates with φ-phase.
 * @param {number} geodesicDist - Arc distance (0–π) between nodes on unit sphere
 * @param {number} age - Edge age in heartbeats since creation
 * @param {number} load - Current traffic load fraction (0–1)
 * @returns {number} Dynamic weight (higher = stronger connection)
 */
export function phiEdgeWeight(geodesicDist, age, load) {
  // Base: inverse-φ decay with distance
  const distanceFactor = Math.pow(PHI, -geodesicDist / Math.PI);
  // Age: Fibonacci-like maturation — young edges grow, old edges stabilize
  const ageFactor = 1 - Math.pow(PHI_INV, age * 0.01 + 1);
  // Load: phi-oscillation dampens overloaded edges
  const loadDampen = 1 / (1 + Math.pow(load * PHI, 2));
  return distanceFactor * ageFactor * loadDampen;
}

/**
 * Compute node importance (centrality weight) based on connection count and depth.
 * @param {number} connections - Number of active edges
 * @param {number} shellDepth - Which Fibonacci shell (0=core, 7=edge)
 * @returns {number} Dynamic centrality weight
 */
export function phiNodeWeight(connections, shellDepth) {
  // Inner shells have exponentially more weight (PHI^(7-shell))
  const shellFactor = Math.pow(PHI, 7 - shellDepth);
  // Connections scale logarithmically in φ-base
  const connectionFactor = Math.log(connections + 1) / Math.log(PHI);
  return shellFactor * connectionFactor;
}

/**
 * Compute routing priority along a path (sequence of hops).
 * Each hop applies φ-decay so shorter paths dominate naturally.
 * @param {number} hopCount - Number of hops in path
 * @param {number} urgency - Message urgency level (0=background, 4=critical)
 * @returns {number} Path priority score
 */
export function phiRoutePriority(hopCount, urgency) {
  const urgencyBoost = Math.pow(PHI, urgency);
  const hopDecay = Math.pow(PHI_INV, hopCount);
  return urgencyBoost * hopDecay;
}

/**
 * Compute resonance between two nodes (phase-based affinity).
 * Nodes at golden-angle separations resonate maximally.
 * @param {number} angularSeparation - Angle in radians between nodes
 * @returns {number} Resonance factor (0–1, peaks at golden angle multiples)
 */
export function phiResonance(angularSeparation) {
  // Peak resonance at multiples of golden angle
  const nearestGolden = Math.round(angularSeparation / GOLDEN_ANGLE) * GOLDEN_ANGLE;
  const deviation = Math.abs(angularSeparation - nearestGolden);
  return Math.exp(-deviation * PHI);
}

/**
 * Compute load distribution weight across sphere shell.
 * Returns fraction of total load a node should handle.
 * @param {number} nodeCapacity - Node's compute capacity (0–1)
 * @param {number} currentLoad - Node's current load fraction (0–1)
 * @param {number} shellPopulation - Total nodes in this shell
 * @returns {number} Load share fraction
 */
export function phiLoadShare(nodeCapacity, currentLoad, shellPopulation) {
  const headroom = Math.max(0, nodeCapacity - currentLoad);
  const phiHeadroom = Math.pow(headroom, PHI_INV); // φ-compressed headroom
  const normalizer = shellPopulation * Math.pow(PHI_INV, 2);
  return phiHeadroom / normalizer;
}

/**
 * Compute mesh healing weight — how urgently a broken edge should be repaired.
 * @param {number} disconnectedDuration - Time since edge broke (heartbeats)
 * @param {number} alternatePathLength - Shortest alternate path hop count
 * @param {number} trafficDemand - Traffic that used to flow on this edge (0–1)
 * @returns {number} Healing urgency (higher = repair sooner)
 */
export function phiHealingUrgency(disconnectedDuration, alternatePathLength, trafficDemand) {
  const timePressure = Math.log(disconnectedDuration + 1) / Math.log(PHI);
  const pathStress = Math.pow(PHI, alternatePathLength - 1);
  const demandFactor = trafficDemand * PHI;
  return timePressure * pathStress * demandFactor;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPHERE CONFIGURATION — Topology parameters
// ═══════════════════════════════════════════════════════════════════════════════

export const SPHERE_CONFIG = {
  PHI,
  PHI_INV,
  GOLDEN_ANGLE,
  
  // Fibonacci shell radii (each shell = PHI^n from center)
  SHELL_RADII: Array.from({ length: 8 }, (_, i) => Math.pow(PHI, i)),
  
  // Max connections per node varies by shell (inner = more connected)
  MAX_CONNECTIONS_BY_SHELL: Array.from({ length: 8 }, (_, i) => Math.round(Math.pow(PHI, 7 - i))),
  
  // Heartbeat intervals per shell (inner = faster pulse)
  HEARTBEAT_BY_SHELL: Array.from({ length: 8 }, (_, i) => Math.round(100 * Math.pow(PHI, i))),
  
  // Geodesic subdivision depth (more = finer mesh)
  ICOSAHEDRON_SUBDIVISIONS: 5,
  
  // Vertices on a geodesic sphere: 10 * 4^n + 2
  get VERTEX_COUNT() { return 10 * Math.pow(4, this.ICOSAHEDRON_SUBDIVISIONS) + 2; },
  
  // Reconnection parameters
  HEALING_CHECK_INTERVAL: Math.round(873 * PHI_INV), // ~539ms
  MAX_HEALING_ATTEMPTS: Math.round(PHI * 8),
  
  // Routing
  MAX_HOP_COUNT: 8,
  PATH_CACHE_TTL: Math.round(1000 * PHI * PHI), // ~2618ms
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  // Mesh topology
  NODE_JOIN: 'sphere.node.join',
  NODE_LEAVE: 'sphere.node.leave',
  NODE_HEARTBEAT: 'sphere.node.heartbeat',
  EDGE_FORM: 'sphere.edge.form',
  EDGE_BREAK: 'sphere.edge.break',
  EDGE_REWEIGHT: 'sphere.edge.reweight',
  
  // Routing
  ROUTE_REQUEST: 'sphere.route.request',
  ROUTE_RESPONSE: 'sphere.route.response',
  ROUTE_FORWARD: 'sphere.route.forward',
  ROUTE_FAILED: 'sphere.route.failed',
  
  // Load distribution
  LOAD_REPORT: 'sphere.load.report',
  LOAD_REDISTRIBUTE: 'sphere.load.redistribute',
  LOAD_OVERFLOW: 'sphere.load.overflow',
  
  // Healing
  HEAL_DETECT: 'sphere.heal.detect',
  HEAL_PROPOSE: 'sphere.heal.propose',
  HEAL_COMPLETE: 'sphere.heal.complete',
  HEAL_FAILED: 'sphere.heal.failed',
  
  // Resonance
  RESONANCE_PING: 'sphere.resonance.ping',
  RESONANCE_SYNC: 'sphere.resonance.sync',
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPHERE STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const SPHERE_STATES = {
  FORMING: 'forming',       // Initial mesh construction
  STABLE: 'stable',         // Normal operation
  REBALANCING: 'rebalancing', // Load redistribution in progress
  HEALING: 'healing',       // Mesh repair in progress
  DEGRADED: 'degraded',     // Operating with reduced connectivity
  CRITICAL: 'critical',     // Core shell integrity compromised
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPHERE NODE
// ═══════════════════════════════════════════════════════════════════════════════

class SphereNode {
  constructor(id, shell, coordinates) {
    this.id = id;
    this.shell = shell;
    this.coordinates = coordinates; // { theta, phi } on sphere surface
    this.edges = new Map(); // nodeId -> { weight: fn result, age, lastTraffic }
    this.load = 0;
    this.capacity = 1.0;
    this.heartbeats = 0;
    this.alive = true;
    this.joinedAt = Date.now();
  }

  /**
   * Get dynamic weight of edge to target node
   */
  getEdgeWeight(targetId) {
    const edge = this.edges.get(targetId);
    if (!edge) return 0;
    return phiEdgeWeight(edge.geodesicDist, edge.age, edge.lastTraffic);
  }

  /**
   * Get this node's dynamic centrality weight
   */
  getCentralityWeight() {
    return phiNodeWeight(this.edges.size, this.shell);
  }

  /**
   * Pulse heartbeat — ages all edges, updates weights dynamically
   */
  heartbeat() {
    this.heartbeats++;
    for (const [, edge] of this.edges) {
      edge.age++;
      // Weights recompute on access — they are functions, not stored values
    }
    return {
      id: this.id,
      shell: this.shell,
      centrality: this.getCentralityWeight(),
      edgeCount: this.edges.size,
      load: this.load,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBBED SPHERE NETWORKING PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════

export class WebbedSphereNetworkingProtocol {
  constructor(config = {}) {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.config = { ...SPHERE_CONFIG, ...config };
    this.state = SPHERE_STATES.FORMING;
    this.nodes = new Map();
    this.shells = Array.from({ length: 8 }, () => new Set());
    this.routeCache = new Map();
    this.healingQueue = [];
    this.stats = {
      messagesRouted: 0,
      edgesFormed: 0,
      edgesBroken: 0,
      healsCompleted: 0,
      rebalances: 0,
    };
  }

  // ── Node Management ──────────────────────────────────────────────────────

  /**
   * Add a node to the sphere mesh at a given shell and position
   */
  addNode(id, shell, theta, phi_coord) {
    const node = new SphereNode(id, shell, { theta, phi: phi_coord });
    this.nodes.set(id, node);
    this.shells[shell].add(id);
    
    // Auto-connect to nearby nodes using golden-angle spacing
    this._connectToNeighbors(node);
    
    if (this.nodes.size > 3 && this.state === SPHERE_STATES.FORMING) {
      this.state = SPHERE_STATES.STABLE;
    }
    
    return node;
  }

  /**
   * Remove a node — triggers healing for broken edges
   */
  removeNode(id) {
    const node = this.nodes.get(id);
    if (!node) return null;
    
    // Mark edges for healing
    for (const [targetId] of node.edges) {
      const target = this.nodes.get(targetId);
      if (target) {
        target.edges.delete(id);
        this.stats.edgesBroken++;
        this.healingQueue.push({
          brokenAt: Date.now(),
          nodeA: targetId,
          missingNode: id,
          trafficDemand: node.load,
        });
      }
    }
    
    this.shells[node.shell].delete(id);
    this.nodes.delete(id);
    
    if (this.healingQueue.length > 0) {
      this.state = SPHERE_STATES.HEALING;
    }
    
    return node;
  }

  // ── Edge Management ──────────────────────────────────────────────────────

  /**
   * Form an edge between two nodes. Weight is ALWAYS computed dynamically.
   */
  formEdge(nodeIdA, nodeIdB) {
    const nodeA = this.nodes.get(nodeIdA);
    const nodeB = this.nodes.get(nodeIdB);
    if (!nodeA || !nodeB) return null;

    const geodesicDist = this._geodesicDistance(nodeA.coordinates, nodeB.coordinates);
    
    const edgeData = {
      geodesicDist,
      age: 0,
      lastTraffic: 0,
      formedAt: Date.now(),
    };

    nodeA.edges.set(nodeIdB, { ...edgeData });
    nodeB.edges.set(nodeIdA, { ...edgeData });
    this.stats.edgesFormed++;

    return {
      between: [nodeIdA, nodeIdB],
      geodesicDist,
      // Weight is a FUNCTION, computed on demand:
      currentWeight: phiEdgeWeight(geodesicDist, 0, 0),
    };
  }

  // ── Routing ──────────────────────────────────────────────────────────────

  /**
   * Find optimal path using φ-weighted geodesic routing.
   * Path selection uses phiRoutePriority and phiEdgeWeight dynamically.
   */
  route(sourceId, destId, urgency = 2) {
    const cacheKey = `${sourceId}:${destId}:${urgency}`;
    const cached = this.routeCache.get(cacheKey);
    if (cached && Date.now() - cached.computedAt < this.config.PATH_CACHE_TTL) {
      this.stats.messagesRouted++;
      return cached.path;
    }

    const path = this._findPath(sourceId, destId, urgency);
    if (path) {
      this.routeCache.set(cacheKey, { path, computedAt: Date.now() });
      this.stats.messagesRouted++;
    }
    return path;
  }

  // ── Load Distribution ────────────────────────────────────────────────────

  /**
   * Redistribute load across a shell using φ-weighted shares.
   * No fixed weights — phiLoadShare computes dynamically.
   */
  redistributeLoad(shell) {
    const shellNodes = [...this.shells[shell]].map(id => this.nodes.get(id)).filter(Boolean);
    if (shellNodes.length === 0) return [];

    const totalLoad = shellNodes.reduce((sum, n) => sum + n.load, 0);
    const assignments = [];

    for (const node of shellNodes) {
      const share = phiLoadShare(node.capacity, node.load, shellNodes.length);
      const targetLoad = totalLoad * share;
      assignments.push({
        nodeId: node.id,
        currentLoad: node.load,
        targetLoad,
        delta: targetLoad - node.load,
        shareWeight: share, // computed dynamically, never stored as fixed
      });
    }

    this.stats.rebalances++;
    this.state = SPHERE_STATES.REBALANCING;
    return assignments;
  }

  // ── Healing ──────────────────────────────────────────────────────────────

  /**
   * Process healing queue — repair broken mesh connections.
   * Urgency is φ-function based, not fixed priority.
   */
  processHealing() {
    if (this.healingQueue.length === 0) {
      if (this.state === SPHERE_STATES.HEALING) {
        this.state = SPHERE_STATES.STABLE;
      }
      return [];
    }

    const healed = [];
    const remaining = [];

    for (const entry of this.healingQueue) {
      const duration = (Date.now() - entry.brokenAt) / this.config.HEALING_CHECK_INTERVAL;
      const nodeA = this.nodes.get(entry.nodeA);
      if (!nodeA) { remaining.push(entry); continue; }

      // Find best replacement using resonance
      const candidates = this._findHealCandidates(nodeA, entry.missingNode);
      
      if (candidates.length > 0) {
        // Pick candidate with highest φ-resonance
        const best = candidates[0];
        this.formEdge(entry.nodeA, best.id);
        this.stats.healsCompleted++;
        healed.push({ from: entry.nodeA, to: best.id, urgency: phiHealingUrgency(duration, 2, entry.trafficDemand) });
      } else {
        remaining.push(entry);
      }
    }

    this.healingQueue = remaining;
    if (remaining.length === 0) {
      this.state = SPHERE_STATES.STABLE;
    }
    return healed;
  }

  // ── Resonance ────────────────────────────────────────────────────────────

  /**
   * Find nodes that resonate (golden-angle aligned) with a given node.
   */
  findResonantNodes(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const resonant = [];
    for (const [otherId, otherNode] of this.nodes) {
      if (otherId === nodeId) continue;
      const separation = this._angularSeparation(node.coordinates, otherNode.coordinates);
      const resonanceScore = phiResonance(separation);
      if (resonanceScore > PHI_INV) { // Threshold: above 1/φ
        resonant.push({ id: otherId, resonance: resonanceScore, shell: otherNode.shell });
      }
    }

    return resonant.sort((a, b) => b.resonance - a.resonance);
  }

  // ── State ────────────────────────────────────────────────────────────────

  getState() {
    return {
      protocolId: this.protocolId,
      state: this.state,
      nodes: this.nodes.size,
      shells: this.shells.map(s => s.size),
      healingQueue: this.healingQueue.length,
      stats: { ...this.stats },
    };
  }

  getMetrics() {
    let totalEdges = 0;
    let totalLoad = 0;
    for (const [, node] of this.nodes) {
      totalEdges += node.edges.size;
      totalLoad += node.load;
    }
    return {
      nodeCount: this.nodes.size,
      edgeCount: totalEdges / 2, // edges counted from both sides
      avgLoad: this.nodes.size > 0 ? totalLoad / this.nodes.size : 0,
      meshDensity: this.nodes.size > 1 ? (totalEdges / 2) / (this.nodes.size * (this.nodes.size - 1) / 2) : 0,
      ...this.stats,
    };
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  _geodesicDistance(coordA, coordB) {
    // Haversine on unit sphere
    const dTheta = coordB.theta - coordA.theta;
    const dPhi = coordB.phi - coordA.phi;
    const a = Math.sin(dTheta / 2) ** 2 + 
              Math.cos(coordA.theta) * Math.cos(coordB.theta) * Math.sin(dPhi / 2) ** 2;
    return 2 * Math.asin(Math.sqrt(a));
  }

  _angularSeparation(coordA, coordB) {
    return this._geodesicDistance(coordA, coordB);
  }

  _connectToNeighbors(node) {
    const maxConn = this.config.MAX_CONNECTIONS_BY_SHELL[node.shell] || 3;
    const candidates = [];

    for (const [otherId, otherNode] of this.nodes) {
      if (otherId === node.id) continue;
      const dist = this._geodesicDistance(node.coordinates, otherNode.coordinates);
      const resonance = phiResonance(dist);
      candidates.push({ id: otherId, dist, resonance });
    }

    // Sort by resonance (prefer golden-angle neighbors)
    candidates.sort((a, b) => b.resonance - a.resonance);
    
    const toConnect = candidates.slice(0, Math.min(maxConn, candidates.length));
    for (const c of toConnect) {
      this.formEdge(node.id, c.id);
    }
  }

  _findPath(sourceId, destId, urgency) {
    // Dijkstra with φ-weighted edges
    const visited = new Set();
    const dist = new Map();
    const prev = new Map();
    dist.set(sourceId, 0);

    const queue = [{ id: sourceId, cost: 0 }];

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();

      if (current.id === destId) {
        // Reconstruct path
        const path = [];
        let step = destId;
        while (step) {
          path.unshift(step);
          step = prev.get(step);
        }
        return {
          path,
          hops: path.length - 1,
          priority: phiRoutePriority(path.length - 1, urgency),
        };
      }

      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const node = this.nodes.get(current.id);
      if (!node) continue;

      for (const [neighborId, edge] of node.edges) {
        if (visited.has(neighborId)) continue;
        // Weight is computed dynamically on every traversal
        const edgeWeight = phiEdgeWeight(edge.geodesicDist, edge.age, edge.lastTraffic);
        const cost = current.cost + (1 / (edgeWeight + 0.001)); // Invert: higher weight = lower cost

        if (!dist.has(neighborId) || cost < dist.get(neighborId)) {
          dist.set(neighborId, cost);
          prev.set(neighborId, current.id);
          queue.push({ id: neighborId, cost });
        }
      }

      if (queue.length > this.config.MAX_HOP_COUNT * this.nodes.size) break;
    }

    return null; // No path found
  }

  _findHealCandidates(node, excludeId) {
    const candidates = [];
    for (const [otherId, otherNode] of this.nodes) {
      if (otherId === node.id || otherId === excludeId) continue;
      if (node.edges.has(otherId)) continue; // Already connected

      const separation = this._angularSeparation(node.coordinates, otherNode.coordinates);
      const resonance = phiResonance(separation);
      candidates.push({ id: otherId, resonance, shell: otherNode.shell });
    }
    return candidates.sort((a, b) => b.resonance - a.resonance);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  PHI,
  PHI_INV,
  GOLDEN_ANGLE,
  PROTOCOL_ID,
  PROTOCOL_NAME,
};
