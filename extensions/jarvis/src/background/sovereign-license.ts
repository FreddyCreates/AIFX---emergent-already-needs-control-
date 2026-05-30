/**
 * SOVEREIGN TOOL LICENSE
 * ─────────────────────────────────────────────────────────────────────────────
 * Licensor  : Sovereign Organism  /  @medina/organism-marketplace
 * Licensee  : VIGIL AI  (extensions/jarvis)
 * Owner     : Alfredo
 * License   : INTERNAL_SOVEREIGN — full internal access across all 24 tools
 * Issued    : 2026-04-25T00:00:00Z
 * Version   : 1.0.0
 *
 * Grant:
 *   VIGIL is hereby licensed to invoke all 24 tools in the Sovereign
 *   Organism Marketplace for internal mission-dispatch purposes. This license
 *   covers all four tool families: Context, Commander, Crawling, and Sentry.
 *   VIGIL may use these tools to build, route, and execute missions across
 *   web, blockchain, data, governance, and infrastructure domains.
 *
 * Conditions:
 *   1. Tools must be invoked through the MissionEngine dispatch layer.
 *   2. INTERNAL_SOVEREIGN tools (INFER-ENGINE, CONTEXT-BUILDER, SEAL-VERIFIER,
 *      DOCTRINE-AUDITOR, TASK-COMMANDER) are metered — usage is logged.
 *   3. VIGIL must not expose tool internals or schemas externally.
 *   4. All tool output belongs to the Sovereign Organism and its owner.
 *   5. The 873ms heartbeat cadence is sacred — tool latency must not block it.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface LicensedTool {
  callId: string;
  name: string;
  family: 'Context' | 'Commander' | 'Crawling' | 'Sentry';
  permission: string;
  exposure: 'INTERNAL' | 'INTERNAL_SOVEREIGN';
  billingClass: 'free' | 'metered';
  trustTier: 'low' | 'medium' | 'high' | 'critical';
  latencyMs: number;
  purpose: string;
}

export const LICENSED_TOOLS: readonly LicensedTool[] = [
  // ── Context Family ──────────────────────────────────────────────────────────
  { callId: 'TOOL-001', name: 'PULSE-KEEPER',        family: 'Context',   permission: 'organism.pulse.read',      exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'low',      latencyMs: 873,  purpose: 'Monitor organism heartbeat pulse at the 873ms cadence' },
  { callId: 'TOOL-004', name: 'STATE-GUARDIAN',      family: 'Context',   permission: 'organism.state.read',      exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'high',     latencyMs: 50,   purpose: 'Read, validate, and protect 4-register organism state integrity' },
  { callId: 'TOOL-005', name: 'CYCLE-COUNTER',       family: 'Context',   permission: 'organism.lifecycle.read',  exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'low',      latencyMs: 50,   purpose: 'Count and report organism lifecycle cycles' },
  { callId: 'TOOL-008', name: 'CONTEXT-BUILDER',     family: 'Context',   permission: 'organism.context.read',    exposure: 'INTERNAL_SOVEREIGN', billingClass: 'metered', trustTier: 'medium',   latencyMs: 300,  purpose: 'Assemble rich execution context from organism state, memory, and environment' },
  { callId: 'TOOL-010', name: 'MEMORY-CONSOLIDATOR', family: 'Context',   permission: 'organism.memory.write',    exposure: 'INTERNAL',          billingClass: 'metered', trustTier: 'high',     latencyMs: 1000, purpose: 'Consolidate organism memories — merge, prune, compact' },
  { callId: 'TOOL-022', name: 'LINEAGE-TRACER',      family: 'Context',   permission: 'organism.lineage.read',    exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'medium',   latencyMs: 400,  purpose: 'Trace full lineage of organism entities — memories, state transitions, decision paths' },
  // ── Commander Family ─────────────────────────────────────────────────────────
  { callId: 'TOOL-002', name: 'SYNC-WEAVER',         family: 'Commander', permission: 'organism.sync.write',      exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'medium',   latencyMs: 100,  purpose: 'Synchronize organism endpoints using phi-resonance coupling' },
  { callId: 'TOOL-006', name: 'INFER-ENGINE',        family: 'Commander', permission: 'organism.inference.execute', exposure: 'INTERNAL_SOVEREIGN', billingClass: 'metered', trustTier: 'medium', latencyMs: 200,  purpose: 'Route inference tasks to the optimal AI model by capability and cost' },
  { callId: 'TOOL-009', name: 'ATTENTION-ROUTER',    family: 'Commander', permission: 'organism.routing.write',   exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'medium',   latencyMs: 100,  purpose: 'Route attention and focus across organism subsystems by urgency' },
  { callId: 'TOOL-016', name: 'RESOURCE-BALANCER',   family: 'Commander', permission: 'organism.resources.write', exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'high',     latencyMs: 200,  purpose: 'Balance compute, memory, and network resources across organism rings' },
  { callId: 'TOOL-017', name: 'CONNECTION-POOL',     family: 'Commander', permission: 'organism.connections.read', exposure: 'INTERNAL',         billingClass: 'free',    trustTier: 'medium',   latencyMs: 100,  purpose: 'Manage connection pools for enterprise connectors and intelligence wires' },
  { callId: 'TOOL-024', name: 'TASK-COMMANDER',      family: 'Commander', permission: 'organism.command.execute', exposure: 'INTERNAL_SOVEREIGN', billingClass: 'metered', trustTier: 'high',    latencyMs: 1000, purpose: 'Orchestrate multi-step task plans across tools, agents, and extensions with rollback' },
  // ── Crawling Family ──────────────────────────────────────────────────────────
  { callId: 'TOOL-003', name: 'FLOW-MONITOR',        family: 'Crawling',  permission: 'organism.flow.read',       exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'low',      latencyMs: 200,  purpose: 'Monitor data flow throughput and detect bottlenecks' },
  { callId: 'TOOL-007', name: 'PATTERN-SEEKER',      family: 'Crawling',  permission: 'organism.analysis.read',   exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'medium',   latencyMs: 500,  purpose: 'Detect recurring patterns across organism data streams and memory lineage' },
  { callId: 'TOOL-014', name: 'ANOMALY-DETECTOR',    family: 'Crawling',  permission: 'organism.analysis.read',   exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'medium',   latencyMs: 300,  purpose: 'Detect anomalies in organism behavior — unexpected state changes and unusual latency' },
  { callId: 'TOOL-018', name: 'CACHE-OPTIMIZER',     family: 'Crawling',  permission: 'organism.cache.write',     exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'medium',   latencyMs: 150,  purpose: 'Optimize caching across organism memory layers — coherence and eviction' },
  { callId: 'TOOL-020', name: 'LOG-STREAMER',        family: 'Crawling',  permission: 'organism.logs.read',       exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'low',      latencyMs: 100,  purpose: 'Stream organism logs in real-time — structured entries from all layers' },
  { callId: 'TOOL-021', name: 'TOPOLOGY-CRAWLER',    family: 'Crawling',  permission: 'organism.topology.read',   exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'medium',   latencyMs: 800,  purpose: 'Crawl organism topology — discover rings, wires, extensions, protocols, SDKs, and tools' },
  // ── Sentry Family ────────────────────────────────────────────────────────────
  { callId: 'TOOL-011', name: 'SENTINEL-WATCH',      family: 'Sentry',    permission: 'organism.security.read',   exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'critical', latencyMs: 150,  purpose: 'Real-time security monitoring — prompt injection, phishing, toxicity, PII detection' },
  { callId: 'TOOL-012', name: 'INTEGRITY-CHECKER',   family: 'Sentry',    permission: 'organism.integrity.read',  exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'high',     latencyMs: 500,  purpose: 'Verify data integrity, contract compliance, and schema consistency' },
  { callId: 'TOOL-013', name: 'BOUNDARY-ENFORCER',   family: 'Sentry',    permission: 'organism.boundary.write',  exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'critical', latencyMs: 100,  purpose: 'Enforce organism boundaries — ring isolation and cross-ring communication validation' },
  { callId: 'TOOL-015', name: 'SEAL-VERIFIER',       family: 'Sentry',    permission: 'organism.security.read',   exposure: 'INTERNAL_SOVEREIGN', billingClass: 'metered', trustTier: 'critical', latencyMs: 100, purpose: 'Verify cryptographic seals on intelligence contracts and data packages' },
  { callId: 'TOOL-019', name: 'QUEUE-PROCESSOR',     family: 'Sentry',    permission: 'organism.queue.write',     exposure: 'INTERNAL',          billingClass: 'free',    trustTier: 'medium',   latencyMs: 200,  purpose: 'Process organism task queues — priority queues for invocations and settlement' },
  { callId: 'TOOL-023', name: 'DOCTRINE-AUDITOR',    family: 'Sentry',    permission: 'organism.governance.read', exposure: 'INTERNAL_SOVEREIGN', billingClass: 'metered', trustTier: 'critical', latencyMs: 600, purpose: 'Audit organism behavior against 40 architectural laws and sovereign doctrine' },
] as const;

/** The 6 sovereign permissions that represent metered / high-trust tool access */
export const SOVEREIGN_PERMISSIONS = LICENSED_TOOLS
  .filter(t => t.exposure === 'INTERNAL_SOVEREIGN')
  .map(t => t.permission);

/** Look up a licensed tool by its callId */
export function getLicensedTool(callId: string): LicensedTool | undefined {
  return LICENSED_TOOLS.find(t => t.callId === callId);
}

/** Get all tools in a specific family */
export function getToolsByFamily(family: LicensedTool['family']): LicensedTool[] {
  return LICENSED_TOOLS.filter(t => t.family === family);
}

/** Verify that a given callId is covered by this license */
export function isToolLicensed(callId: string): boolean {
  return LICENSED_TOOLS.some(t => t.callId === callId);
}

/** The full license manifest — Jarvis carries this at runtime */
export const SOVEREIGN_LICENSE = {
  licensee:    'VIGIL_AI',
  licensor:    'SOVEREIGN_ORGANISM',
  owner:       'Alfredo',
  licenseType: 'INTERNAL_SOVEREIGN',
  version:     '1.0.0',
  issuedAt:    1745625600000,   // 2026-04-25T00:00:00Z
  toolCount:   LICENSED_TOOLS.length,
  families:    ['Context', 'Commander', 'Crawling', 'Sentry'] as const,
  accessTiers: { INTERNAL: true, INTERNAL_SOVEREIGN: true },
  conditions: [
    'Tools must be invoked through the MissionEngine dispatch layer.',
    'INTERNAL_SOVEREIGN tools are metered — usage is logged.',
    'VIGIL must not expose tool internals or schemas externally.',
    'All tool output belongs to the Sovereign Organism and its owner.',
    'The 873ms heartbeat cadence is sacred — tool latency must not block it.',
  ],
} as const;
