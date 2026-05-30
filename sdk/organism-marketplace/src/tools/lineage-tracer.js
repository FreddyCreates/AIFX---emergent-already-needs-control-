import { ToolSchemaBuilder } from '../tool-schema.js';

/**
 * TOOL-022: LINEAGE-TRACER
 * Family: Context
 *
 * Traces the full lineage of any organism entity — memories, state transitions,
 * tool invocations, and decision paths. Reconstructs the causal chain that
 * led to any current state, providing temporal context for AI reasoning.
 *
 * The Context family builds understanding. Where the Crawling family maps
 * structure, the Context family maps meaning. LINEAGE-TRACER is the family's
 * historian — it answers "how did we get here?" for any entity in the organism.
 *
 * Primitive function: Temporal tracing / Causal reconstruction / Provenance
 * Organism role: The organism's memory of its own decisions
 * Resonance: Feeds into CONTEXT-BUILDER for enriched reasoning context
 *
 * @module tools/lineage-tracer
 */

const PHI = 1.618033988749895;

export const LineageTracerSchema = ToolSchemaBuilder.create({
  callId: 'TOOL-022',
  name: 'LINEAGE-TRACER',
  displayName: 'Lineage Tracer',
  purpose: 'Trace full lineage of organism entities — memories, state transitions, invocations, and decision paths with causal chains',
  permissionClass: 'organism.lineage.read',
  family: 'Context',
  inputSchema: [
    { name: 'action', type: 'string', required: true, description: 'Action: "trace" | "ancestors" | "descendants" | "causal-chain"' },
    { name: 'entityId', type: 'string', required: true, description: 'Entity to trace (memory ID, invocation ID, state snapshot ID)' },
    { name: 'entityType', type: 'string', required: false, description: 'Entity type: "memory" | "invocation" | "state" | "decision"', defaultValue: 'memory' },
    { name: 'maxDepth', type: 'number', required: false, description: 'Maximum ancestry depth to trace', defaultValue: 10 },
    { name: 'includeTimestamps', type: 'boolean', required: false, description: 'Include timestamps on every lineage node', defaultValue: true },
  ],
  outputSchema: [
    { name: 'status', type: 'string', required: true, description: 'ok | not-found | orphan | error' },
    { name: 'entityId', type: 'string', required: true, description: 'The traced entity ID' },
    { name: 'lineageDepth', type: 'number', required: true, description: 'Actual depth of lineage traced' },
    { name: 'ancestors', type: 'array', required: true, description: 'Ordered ancestor chain from nearest to oldest' },
    { name: 'forkPoints', type: 'array', required: true, description: 'Points where lineage branches diverged' },
    { name: 'rootEntity', type: 'object', required: false, description: 'The ultimate root ancestor' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
  ],
  latencyExpectation: 400,
  costWeight: 3,
  successContract: 'Returns full ancestor chain with fork points and root entity',
  failureContract: 'Returns status "not-found" if entity ID does not exist in lineage store',
  housePlacement: 'Memory Ring',
  exposure: 'INTERNAL',
  version: '1.0.0',
  endpointProtocol: 'intelligence-wire/lineage-tracer',
  billingClass: 'free',
  trustTier: 'medium',
  sdkDependencies: ['@medina/sovereign-memory-sdk'],
  lawsEnforced: ['AL-022', 'AL-023', 'AL-024'],
});

/**
 * Default handler for LINEAGE-TRACER.
 * Reconstructs lineage chains using phi-decay weighted traversal.
 */
export async function lineageTracerHandler(input) {
  const entityId = input.entityId;
  const maxDepth = Math.min(input.maxDepth || 10, 50);

  // Synthetic lineage — in production this traverses real memory lineage
  const ancestors = [];
  let currentId = entityId;

  for (let depth = 0; depth < maxDepth; depth++) {
    const parentId = `${entityId}-ancestor-${depth}`;
    const age = Math.round(depth * 873 * Math.pow(PHI, depth));
    ancestors.push({
      id: parentId,
      depth: depth + 1,
      type: input.entityType || 'memory',
      createdAt: Date.now() - age,
      phiWeight: Math.round(Math.pow(1 / PHI, depth) * 1000) / 1000,
    });
    currentId = parentId;
  }

  return {
    status: 'ok',
    entityId,
    lineageDepth: ancestors.length,
    ancestors,
    forkPoints: [],
    rootEntity: ancestors.length > 0 ? ancestors[ancestors.length - 1] : null,
    timestamp: Date.now(),
  };
}

export default LineageTracerSchema;
