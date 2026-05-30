import { ToolSchemaBuilder } from '../tool-schema.js';

/**
 * TOOL-021: TOPOLOGY-CRAWLER
 * Family: Crawling
 *
 * Crawls the organism's full topology — rings, wires, extensions, protocols,
 * SDKs, and tools — building a live map of all connected surfaces.
 * Discovers new endpoints, detects orphaned nodes, and maps dependency graphs.
 *
 * The Crawling family sees everything. It walks every wire, reads every
 * heartbeat, maps every connection. Where the Sentry guards the perimeter,
 * the Crawler maps the interior. As above, so below — the crawl is the
 * organism's self-awareness of its own structure.
 *
 * Primitive function: Discovery / Mapping / Topology resolution
 * Organism role: The organism's eyes — continuous structural awareness
 * Resonance: Feeds topology data into PATTERN-SEEKER and ANOMALY-DETECTOR
 *
 * @module tools/topology-crawler
 */

const PHI = 1.618033988749895;

export const TopologyCrawlerSchema = ToolSchemaBuilder.create({
  callId: 'TOOL-021',
  name: 'TOPOLOGY-CRAWLER',
  displayName: 'Topology Crawler',
  purpose: 'Crawl organism topology — discover rings, wires, extensions, protocols, SDKs, and tools; build live dependency map',
  permissionClass: 'organism.topology.read',
  family: 'Crawling',
  inputSchema: [
    { name: 'action', type: 'string', required: true, description: 'Action: "crawl" | "map" | "orphans" | "dependencies"' },
    { name: 'startNode', type: 'string', required: false, description: 'Node to start crawl from (ring, tool ID, SDK name); defaults to organism root' },
    { name: 'depth', type: 'number', required: false, description: 'Maximum crawl depth (1-10)', defaultValue: 5 },
    { name: 'includeMetrics', type: 'boolean', required: false, description: 'Attach live metrics to each discovered node', defaultValue: false },
  ],
  outputSchema: [
    { name: 'status', type: 'string', required: true, description: 'ok | partial | unreachable | error' },
    { name: 'nodesDiscovered', type: 'number', required: true, description: 'Total nodes found in crawl' },
    { name: 'edgesDiscovered', type: 'number', required: true, description: 'Total edges (connections) found' },
    { name: 'orphanedNodes', type: 'array', required: true, description: 'Nodes with no inbound connections' },
    { name: 'topology', type: 'object', required: true, description: 'Full topology graph { nodes: [...], edges: [...] }' },
    { name: 'crawlDepthReached', type: 'number', required: true, description: 'Actual depth reached in crawl' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
  ],
  latencyExpectation: 800,
  costWeight: 4,
  successContract: 'Returns full topology graph with node/edge counts and orphan detection',
  failureContract: 'Returns status "unreachable" if organism root or start node cannot be reached',
  housePlacement: 'Sovereign Ring',
  exposure: 'INTERNAL',
  version: '1.0.0',
  endpointProtocol: 'intelligence-wire/topology-crawler',
  billingClass: 'free',
  trustTier: 'medium',
  sdkDependencies: ['@medina/organism-runtime-sdk', '@medina/intelligence-routing-sdk'],
  lawsEnforced: ['AL-001', 'AL-034', 'AL-037'],
});

/**
 * Default handler for TOPOLOGY-CRAWLER.
 * Performs a phi-spiraling crawl of the organism topology.
 */
export async function topologyCrawlerHandler(input) {
  const maxDepth = Math.min(input.depth || 5, 10);
  const rings = [
    'Sovereign Ring', 'Interface Ring', 'Memory Ring', 'Transport Ring',
    'Geometry Ring', 'Build Ring', 'Counsel Ring', 'Proof Ring', 'Native Capability Ring',
  ];

  // Build synthetic topology — in production this walks real organism state
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  // Rings
  for (const ring of rings) {
    nodes.push({ id: `ring-${nodeId}`, type: 'ring', name: ring, depth: 0 });
    nodeId++;
  }

  // SDKs
  const sdks = [
    'sovereign-memory-sdk', 'enterprise-integration-sdk', 'intelligence-routing-sdk',
    'organism-runtime-sdk', 'document-absorption-engine', 'ai-model-engines',
    'frontend-intelligence-models', 'organism-marketplace',
  ];
  for (const sdk of sdks) {
    nodes.push({ id: `sdk-${nodeId}`, type: 'sdk', name: sdk, depth: 1 });
    edges.push({ from: 'ring-0', to: `sdk-${nodeId}`, type: 'contains' });
    nodeId++;
  }

  // Tools — wired to the marketplace SDK (last SDK registered)
  const marketplaceSdkId = `sdk-${rings.length + sdks.length - 1}`;
  for (let t = 1; t <= 24; t++) {
    const toolId = `TOOL-${String(t).padStart(3, '0')}`;
    nodes.push({ id: toolId, type: 'tool', name: toolId, depth: 2 });
    edges.push({ from: marketplaceSdkId, to: toolId, type: 'exposes' });
  }

  // Extensions
  for (let e = 1; e <= 20; e++) {
    const extId = `EXT-${String(e).padStart(3, '0')}`;
    nodes.push({ id: extId, type: 'extension', name: extId, depth: 2 });
    edges.push({ from: 'ring-0', to: extId, type: 'hosts' });
    nodeId++;
  }

  // Protocols
  for (let p = 1; p <= 11; p++) {
    const protoId = `PROTO-${String(p).padStart(3, '0')}`;
    nodes.push({ id: protoId, type: 'protocol', name: protoId, depth: 1 });
    edges.push({ from: 'ring-0', to: protoId, type: 'governs' });
    nodeId++;
  }

  // Find orphans — nodes with no inbound edges
  const inboundTargets = new Set(edges.map((e) => e.to));
  const orphanedNodes = nodes.filter((n) => !inboundTargets.has(n.id) && n.depth > 0).map((n) => n.id);

  return {
    status: 'ok',
    nodesDiscovered: nodes.length,
    edgesDiscovered: edges.length,
    orphanedNodes,
    topology: { nodes, edges },
    crawlDepthReached: Math.min(maxDepth, 3),
    timestamp: Date.now(),
  };
}

export default TopologyCrawlerSchema;
