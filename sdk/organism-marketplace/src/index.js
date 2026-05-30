/**
 * @medina/organism-marketplace — Callable Tool Marketplace for the Sovereign Organism
 *
 * The marketplace is three things at once:
 *
 * 1. Registry — A searchable map of callable tools, SDKs, organisms, and package ecosystems
 * 2. Protocol Surface — A standard way for AIs, developers, apps, and other organisms to invoke calls
 * 3. Settlement Layer — A usage, reward, billing, and token-routing layer for the calls
 *
 * AIs do not automatically "understand the market." They use tools reliably when four things are true:
 * - the tool has a clear callable interface (ToolSchemaBuilder)
 * - the tool is discoverable in a registry (ToolRegistry)
 * - the AI is routed to it by policy/orchestration (MarketplaceRouter)
 * - the result comes back in a usable schema (ToolInvoker)
 *
 * 24 hand-crafted tools organized into 4 core families:
 *   🕷 Crawling — discovery, monitoring, mapping, streaming
 *   🧠 Context  — state reading, context assembly, lineage tracing
 *   ⚡ Commander — routing, orchestration, synchronization, dispatch
 *   🛡 Sentry   — guarding, verification, enforcement, auditing
 *
 * Plus a FamilyTemplate generator for creating additional tools from family blueprints.
 *
 * @module @medina/organism-marketplace
 */

// Core marketplace layers
export { ToolSchemaBuilder, PHI, HEARTBEAT, VALID_EXPOSURES, VALID_BILLING, VALID_TRUST, VALID_FAMILIES } from './tool-schema.js';
export { ToolRegistry } from './tool-registry.js';
export { ToolInvoker } from './tool-invoker.js';
export { MarketplaceSettlement } from './marketplace-settlement.js';
export { MarketplaceRouter } from './marketplace-router.js';

// Family system
export {
  FAMILY_PROFILES, ALL_FAMILIES,
  CRAWLING_FAMILY, CONTEXT_FAMILY, COMMANDER_FAMILY, SENTRY_FAMILY,
  getFamilyByToolId, getFamilyMembers, getResonanceGraph, getCrossFamilyResonance,
} from './family-profiles.js';
export { FamilyTemplate, getFamilyBlueprint, ALL_BLUEPRINTS } from './family-template.js';

// Re-export all 24 tool schemas and handlers
export {
  // Context family
  PulseKeeperSchema, pulseKeeperHandler,
  StateGuardianSchema, stateGuardianHandler,
  CycleCounterSchema, cycleCounterHandler,
  ContextBuilderSchema, contextBuilderHandler,
  MemoryConsolidatorSchema, memoryConsolidatorHandler,
  LineageTracerSchema, lineageTracerHandler,
  // Commander family
  SyncWeaverSchema, syncWeaverHandler,
  InferEngineSchema, inferEngineHandler,
  AttentionRouterSchema, attentionRouterHandler,
  ResourceBalancerSchema, resourceBalancerHandler,
  ConnectionPoolSchema, connectionPoolHandler,
  TaskCommanderSchema, taskCommanderHandler,
  // Crawling family
  FlowMonitorSchema, flowMonitorHandler,
  PatternSeekerSchema, patternSeekerHandler,
  AnomalyDetectorSchema, anomalyDetectorHandler,
  CacheOptimizerSchema, cacheOptimizerHandler,
  LogStreamerSchema, logStreamerHandler,
  TopologyCrawlerSchema, topologyCrawlerHandler,
  // Sentry family
  SentinelWatchSchema, sentinelWatchHandler,
  IntegrityCheckerSchema, integrityCheckerHandler,
  BoundaryEnforcerSchema, boundaryEnforcerHandler,
  SealVerifierSchema, sealVerifierHandler,
  QueueProcessorSchema, queueProcessorHandler,
  DoctrineAuditorSchema, doctrineAuditorHandler,
} from './tools/index.js';
