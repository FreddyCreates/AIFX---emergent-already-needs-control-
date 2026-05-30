/**
 * PROTO-007: Edge Mesh Intelligence Protocol (EMIP)
 * Distributed Edge Intelligence coordinating inference across edge devices.
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

class EdgeMeshIntelligenceProtocol {
  /**
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.nodes = new Map();
    this.edges = [];
    this.workloadQueue = [];
    this.replicationFactor = config.replicationFactor || PHI;
    this.completedTasks = [];
    this.metrics = {
      activeNodes: 0,
      deadNodes: 0,
      tasksSharded: 0,
      totalLatency: 0,
      taskCount: 0
    };
  }

  /**
   * Add an edge node with capability metrics.
   * @param {string} nodeId - Node identifier
   * @param {Object} capabilities - {model, memory, compute, latency}
   * @returns {Object} - Registered node info
   */
  registerNode(nodeId, capabilities) {
    const node = {
      id: nodeId,
      model: capabilities.model || 'generic',
      memory: capabilities.memory || 1024,
      compute: capabilities.compute || 1.0,
      latency: capabilities.latency || HEARTBEAT,
      status: 'active',
      load: 0,
      taskCount: 0,
      peers: new Set(),
      registeredAt: Date.now(),
      lastHeartbeat: Date.now()
    };
    this.nodes.set(nodeId, node);
    this.metrics.activeNodes = this._countActiveNodes();

    // Auto-discover nearby peers
    this._autoConnectPeers(nodeId);

    return { id: nodeId, capabilities: { model: node.model, memory: node.memory, compute: node.compute, latency: node.latency } };
  }

  _autoConnectPeers(nodeId) {
    for (const [otherId] of this.nodes) {
      if (otherId !== nodeId) {
        const node = this.nodes.get(nodeId);
        const other = this.nodes.get(otherId);
        node.peers.add(otherId);
        other.peers.add(nodeId);
        this.edges.push({ source: nodeId, target: otherId, weight: 1.0 });
      }
    }
  }

  _countActiveNodes() {
    let count = 0;
    for (const node of this.nodes.values()) {
      if (node.status === 'active') count++;
    }
    return count;
  }

  /**
   * Find reachable peer nodes using phi-weighted proximity scoring.
   * @param {string} nodeId - Source node
   * @param {number} maxHops - Maximum hop count
   * @returns {Object[]} - Array of {nodeId, distance, score}
   */
  discoverPeers(nodeId, maxHops = 3) {
    const visited = new Set();
    const result = [];
    const queue = [{ id: nodeId, hops: 0 }];
    visited.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.hops > maxHops) continue;

      const node = this.nodes.get(current.id);
      if (!node) continue;

      if (current.id !== nodeId && node.status === 'active') {
        const score = Math.pow(PHI, -current.hops) * node.compute;
        result.push({ nodeId: current.id, distance: current.hops, score });
      }

      for (const peerId of node.peers) {
        if (!visited.has(peerId)) {
          visited.add(peerId);
          queue.push({ id: peerId, hops: current.hops + 1 });
        }
      }
    }

    result.sort((a, b) => b.score - a.score);
    return result;
  }

  /**
   * Distribute task across nodes proportional to capability × φ^(-distance).
   * @param {Object} task - Task to shard
   * @param {Object[]} availableNodes - Array of {nodeId, distance}
   * @returns {Object[]} - Array of shard assignments {nodeId, shardId, weight, portion}
   */
  shardWorkload(task, availableNodes) {
    if (availableNodes.length === 0) return [];

    const shards = [];
    let totalWeight = 0;

    for (const an of availableNodes) {
      const node = this.nodes.get(an.nodeId);
      if (!node || node.status !== 'active') continue;
      const distance = an.distance || 1;
      const weight = node.compute * Math.pow(PHI, -distance);
      shards.push({ nodeId: an.nodeId, weight, node });
      totalWeight += weight;
    }

    const assignments = shards.map((s, i) => {
      const portion = totalWeight > 0 ? s.weight / totalWeight : 1 / shards.length;
      s.node.load += portion;
      s.node.taskCount++;
      return {
        nodeId: s.nodeId,
        shardId: `shard-${i + 1}`,
        weight: s.weight,
        portion
      };
    });

    this.metrics.tasksSharded++;
    return assignments;
  }

  /**
   * Combine shard results using phi-weighted averaging.
   * @param {Object[]} shardResults - Array of {shardId, nodeId, result, confidence, latencyMs}
   * @returns {Object} - {aggregatedResult, totalConfidence, avgLatency}
   */
  aggregateResults(shardResults) {
    if (shardResults.length === 0) return { aggregatedResult: null, totalConfidence: 0, avgLatency: 0 };

    let weightedConfidence = 0;
    let totalWeight = 0;
    let totalLatency = 0;
    const results = [];

    for (let i = 0; i < shardResults.length; i++) {
      const w = Math.pow(PHI, -i);
      weightedConfidence += w * (shardResults[i].confidence || 0.5);
      totalWeight += w;
      totalLatency += shardResults[i].latencyMs || 0;
      results.push(shardResults[i].result);
    }

    const avgLatency = totalLatency / shardResults.length;
    this.metrics.totalLatency += avgLatency;
    this.metrics.taskCount++;

    return {
      aggregatedResult: results,
      totalConfidence: totalWeight > 0 ? weightedConfidence / totalWeight : 0,
      avgLatency
    };
  }

  /**
   * Find nearest capable node by latency.
   * @param {Object} task - Task with requirements
   * @returns {Object|null} - Best node or null
   */
  routeToNearest(task) {
    let bestNode = null;
    let bestLatency = Infinity;

    for (const node of this.nodes.values()) {
      if (node.status !== 'active') continue;
      if (task.minCompute && node.compute < task.minCompute) continue;
      if (task.minMemory && node.memory < task.minMemory) continue;

      const adjustedLatency = node.latency * (1 + node.load);
      if (adjustedLatency < bestLatency) {
        bestLatency = adjustedLatency;
        bestNode = node;
      }
    }

    if (!bestNode) return null;
    return { nodeId: bestNode.id, latency: bestLatency, compute: bestNode.compute };
  }

  /**
   * Redistribute failed node's workload to peers.
   * @param {string} failedNodeId
   * @returns {Object} - {redistributed, targetNodes}
   */
  failover(failedNodeId) {
    const failedNode = this.nodes.get(failedNodeId);
    if (!failedNode) return { redistributed: false, targetNodes: [] };

    failedNode.status = 'dead';
    this.metrics.deadNodes++;
    this.metrics.activeNodes = this._countActiveNodes();

    const peers = this.discoverPeers(failedNodeId, 2);
    const activePeers = peers.filter(p => {
      const node = this.nodes.get(p.nodeId);
      return node && node.status === 'active';
    });

    const redistributedLoad = failedNode.load;
    const targetNodes = [];

    if (activePeers.length > 0) {
      const loadPerPeer = redistributedLoad / activePeers.length;
      for (const peer of activePeers) {
        const node = this.nodes.get(peer.nodeId);
        if (node) {
          node.load += loadPerPeer;
          targetNodes.push({ nodeId: peer.nodeId, additionalLoad: loadPerPeer });
        }
      }
    }

    failedNode.load = 0;
    return { redistributed: targetNodes.length > 0, targetNodes };
  }

  /**
   * Returns mesh graph topology.
   * @returns {Object} - {nodes, edges, loadDistribution}
   */
  getTopology() {
    const nodeList = [];
    const loadDistribution = {};

    for (const [id, node] of this.nodes) {
      nodeList.push({
        id,
        status: node.status,
        compute: node.compute,
        memory: node.memory,
        load: node.load,
        peers: [...node.peers]
      });
      loadDistribution[id] = node.load;
    }

    return {
      nodes: nodeList,
      edges: this.edges.map(e => ({ source: e.source, target: e.target, weight: e.weight })),
      loadDistribution
    };
  }

  /**
   * Returns mesh metrics.
   * @returns {Object}
   */
  getMeshMetrics() {
    const activeNodes = this._countActiveNodes();
    const totalNodes = this.nodes.size;

    // Calculate mesh connectivity as ratio of edges to maximum possible edges
    const maxEdges = totalNodes * (totalNodes - 1) / 2;
    const uniqueEdges = new Set(this.edges.map(e => [e.source, e.target].sort().join('-'))).size;
    const meshConnectivity = maxEdges > 0 ? uniqueEdges / maxEdges : 0;

    return {
      activeNodes,
      deadNodes: totalNodes - activeNodes,
      tasksSharded: this.metrics.tasksSharded,
      avgLatency: this.metrics.taskCount > 0 ? this.metrics.totalLatency / this.metrics.taskCount : 0,
      meshConnectivity
    };
  }
}

export { EdgeMeshIntelligenceProtocol };
export default EdgeMeshIntelligenceProtocol;
