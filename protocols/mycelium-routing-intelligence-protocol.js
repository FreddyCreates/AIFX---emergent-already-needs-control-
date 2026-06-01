/**
 * PROTO-260: Mycelium Routing Intelligence Protocol (MRIP)
 * Domain-aware routing with congestion and trust adaptation.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export const ROUTING_STATES = {
  IDLE: 'idle',
  ROUTING: 'routing',
  DEGRADED: 'degraded',
};

export const MESSAGE_TYPES = {
  ROUTE_DISCOVER: 'mycelium.route.discover',
  ROUTE_FORWARD: 'mycelium.route.forward',
  ROUTE_FAIL: 'mycelium.route.fail',
  ROUTE_REROUTE: 'mycelium.route.reroute',
};

export function calculateRouteScore(hops, latencyMs, trust, congestion = 0) {
  const hopPenalty = Math.pow(PHI, Math.max(0, hops));
  const latencyPenalty = 1 + latencyMs / 1000;
  const trustBoost = Math.max(0.05, Math.min(1, trust));
  const congestionPenalty = 1 + Math.max(0, congestion) * PHI;
  return (trustBoost * PHI_INV) / (hopPenalty * latencyPenalty * congestionPenalty);
}

export class MyceliumRoutingIntelligenceProtocol {
  constructor(config = {}) {
    this.config = {
      maxHops: 12,
      defaultDomain: 'global',
      ...config,
    };
    this.state = ROUTING_STATES.IDLE;
    this.domains = new Map([[this.config.defaultDomain, { maxHops: this.config.maxHops }]]);
    this.events = [];
  }

  registerDomain(name, config = {}) {
    this.domains.set(name, {
      maxHops: config.maxHops || this.config.maxHops,
      trustFloor: config.trustFloor ?? 0.2,
    });
  }

  discoverRoute({ source, target, adjacency, edgeMeta = {}, trustByNode = {}, congestionByNode = {}, domain = 'global' }) {
    this.state = ROUTING_STATES.ROUTING;
    const domainConfig = this.domains.get(domain) || this.domains.get(this.config.defaultDomain);
    const maxHops = domainConfig.maxHops;

    const queue = [{ node: source, path: [source], latency: 0, trust: trustByNode[source] ?? 1 }];
    let best = null;

    while (queue.length) {
      const current = queue.shift();
      if (current.path.length - 1 > maxHops) continue;

      if (current.node === target) {
        const hops = current.path.length - 1;
        const score = calculateRouteScore(hops, current.latency, current.trust, congestionByNode[target] ?? 0);
        if (!best || score > best.score) best = { ...current, score };
        continue;
      }

      for (const neighbor of adjacency[current.node] || []) {
        if (current.path.includes(neighbor)) continue;
        const key = `${current.node}->${neighbor}`;
        const meta = edgeMeta[key] || edgeMeta[`${neighbor}->${current.node}`] || {};
        const nextTrust = Math.min(current.trust, trustByNode[neighbor] ?? 1);
        const nextLatency = current.latency + (meta.latencyMs ?? 10);
        if (nextTrust < domainConfig.trustFloor) continue;
        queue.push({
          node: neighbor,
          path: [...current.path, neighbor],
          latency: nextLatency,
          trust: nextTrust,
        });
      }
    }

    if (!best) {
      this.state = ROUTING_STATES.DEGRADED;
      this._event(MESSAGE_TYPES.ROUTE_FAIL, { source, target, domain });
      return null;
    }

    this.state = ROUTING_STATES.IDLE;
    this._event(MESSAGE_TYPES.ROUTE_DISCOVER, { source, target, domain, path: best.path, score: best.score });
    return { path: best.path, hops: best.path.length - 1, latencyMs: best.latency, trust: best.trust, score: best.score };
  }

  rerouteOnPartition(route, isolatedNodes = [], context) {
    if (!route || !route.path.some(n => isolatedNodes.includes(n))) return route;
    this._event(MESSAGE_TYPES.ROUTE_REROUTE, { oldPath: route.path, isolatedNodes });
    return this.discoverRoute(context);
  }

  getMetrics() {
    return {
      state: this.state,
      domainCount: this.domains.size,
      eventCount: this.events.length,
    };
  }

  _event(type, payload) {
    this.events.push({ at: Date.now(), type, payload });
    if (this.events.length > 1000) this.events.shift();
  }
}

export default MyceliumRoutingIntelligenceProtocol;
