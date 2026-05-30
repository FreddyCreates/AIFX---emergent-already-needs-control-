/**
 * VOIS Callable Tools — 24 Always-Running Organism Tools
 *
 * 24 hand-crafted rich profiles organized into 4 core families:
 *   🕷 Crawling (6 tools) — discovery, monitoring, mapping, streaming
 *   🧠 Context  (6 tools) — state reading, context assembly, lineage tracing
 *   ⚡ Commander (6 tools) — routing, orchestration, synchronization, dispatch
 *   🛡 Sentry   (6 tools) — guarding, verification, enforcement, auditing
 *
 * Each tool is a VOIS-addressable callable with:
 * - clear callable interface (schema)
 * - registry discoverability (ToolRegistry)
 * - policy/orchestration routing (MarketplaceRouter)
 * - structured result schema (input/output contracts)
 *
 * AIs use tools reliably when these four conditions are met.
 *
 * @module tools
 */

// ── 🧠 CONTEXT FAMILY ──────────────────────────────────────────────
// TOOL-001: Heartbeat monitor (Context / Heartbeat Witness)
export { PulseKeeperSchema, pulseKeeperHandler } from './pulse-keeper.js';

// TOOL-004: 4-register state guardian (Context / State Reader)
export { StateGuardianSchema, stateGuardianHandler } from './state-guardian.js';

// TOOL-005: Lifecycle cycle counter (Context / Phase Tracker)
export { CycleCounterSchema, cycleCounterHandler } from './cycle-counter.js';

// TOOL-008: Execution context assembly (Context / Context Architect)
export { ContextBuilderSchema, contextBuilderHandler } from './context-builder.js';

// TOOL-010: Memory consolidation (Context / Memory Keeper)
export { MemoryConsolidatorSchema, memoryConsolidatorHandler } from './memory-consolidator.js';

// TOOL-022: Lineage tracing (Context / Lineage Historian)
export { LineageTracerSchema, lineageTracerHandler } from './lineage-tracer.js';

// ── ⚡ COMMANDER FAMILY ─────────────────────────────────────────────
// TOOL-002: Phi-resonance synchronization (Commander / Synchronization Master)
export { SyncWeaverSchema, syncWeaverHandler } from './sync-weaver.js';

// TOOL-006: AI model inference routing (Commander / Model Strategist)
export { InferEngineSchema, inferEngineHandler } from './infer-engine.js';

// TOOL-009: Attention and focus routing (Commander / Focus Director)
export { AttentionRouterSchema, attentionRouterHandler } from './attention-router.js';

// TOOL-016: Resource allocation and balancing (Commander / Resource Allocator)
export { ResourceBalancerSchema, resourceBalancerHandler } from './resource-balancer.js';

// TOOL-017: Connection pool management (Commander / Connection Quartermaster)
export { ConnectionPoolSchema, connectionPoolHandler } from './connection-pool.js';

// TOOL-024: Multi-step task orchestration (Commander / Execution General)
export { TaskCommanderSchema, taskCommanderHandler } from './task-commander.js';

// ── 🕷 CRAWLING FAMILY ──────────────────────────────────────────────
// TOOL-003: Data flow monitoring (Crawling / Flow Scout)
export { FlowMonitorSchema, flowMonitorHandler } from './flow-monitor.js';

// TOOL-007: Pattern detection (Crawling / Pattern Analyst)
export { PatternSeekerSchema, patternSeekerHandler } from './pattern-seeker.js';

// TOOL-014: Anomaly detection (Crawling / Anomaly Hunter)
export { AnomalyDetectorSchema, anomalyDetectorHandler } from './anomaly-detector.js';

// TOOL-018: Cache optimization (Crawling / Cache Surgeon)
export { CacheOptimizerSchema, cacheOptimizerHandler } from './cache-optimizer.js';

// TOOL-020: Real-time log streaming (Crawling / Stream Keeper)
export { LogStreamerSchema, logStreamerHandler } from './log-streamer.js';

// TOOL-021: Topology crawling (Crawling / Topology Mapper)
export { TopologyCrawlerSchema, topologyCrawlerHandler } from './topology-crawler.js';

// ── 🛡 SENTRY FAMILY ────────────────────────────────────────────────
// TOOL-011: Security monitoring (Sentry / Perimeter Guard)
export { SentinelWatchSchema, sentinelWatchHandler } from './sentinel-watch.js';

// TOOL-012: Data integrity verification (Sentry / Truth Verifier)
export { IntegrityCheckerSchema, integrityCheckerHandler } from './integrity-checker.js';

// TOOL-013: Ring boundary enforcement (Sentry / Ring Warden)
export { BoundaryEnforcerSchema, boundaryEnforcerHandler } from './boundary-enforcer.js';

// TOOL-015: Cryptographic seal verification (Sentry / Seal Master)
export { SealVerifierSchema, sealVerifierHandler } from './seal-verifier.js';

// TOOL-019: Task queue processing (Sentry / Security Queue Handler)
export { QueueProcessorSchema, queueProcessorHandler } from './queue-processor.js';

// TOOL-023: Doctrine auditing (Sentry / Doctrine Judge)
export { DoctrineAuditorSchema, doctrineAuditorHandler } from './doctrine-auditor.js';

/**
 * All 24 tool schemas as an array for bulk registration.
 */
export const ALL_TOOL_SCHEMAS = [
  // Context family
  (await import('./pulse-keeper.js')).PulseKeeperSchema,
  (await import('./state-guardian.js')).StateGuardianSchema,
  (await import('./cycle-counter.js')).CycleCounterSchema,
  (await import('./context-builder.js')).ContextBuilderSchema,
  (await import('./memory-consolidator.js')).MemoryConsolidatorSchema,
  (await import('./lineage-tracer.js')).LineageTracerSchema,
  // Commander family
  (await import('./sync-weaver.js')).SyncWeaverSchema,
  (await import('./infer-engine.js')).InferEngineSchema,
  (await import('./attention-router.js')).AttentionRouterSchema,
  (await import('./resource-balancer.js')).ResourceBalancerSchema,
  (await import('./connection-pool.js')).ConnectionPoolSchema,
  (await import('./task-commander.js')).TaskCommanderSchema,
  // Crawling family
  (await import('./flow-monitor.js')).FlowMonitorSchema,
  (await import('./pattern-seeker.js')).PatternSeekerSchema,
  (await import('./anomaly-detector.js')).AnomalyDetectorSchema,
  (await import('./cache-optimizer.js')).CacheOptimizerSchema,
  (await import('./log-streamer.js')).LogStreamerSchema,
  (await import('./topology-crawler.js')).TopologyCrawlerSchema,
  // Sentry family
  (await import('./sentinel-watch.js')).SentinelWatchSchema,
  (await import('./integrity-checker.js')).IntegrityCheckerSchema,
  (await import('./boundary-enforcer.js')).BoundaryEnforcerSchema,
  (await import('./seal-verifier.js')).SealVerifierSchema,
  (await import('./queue-processor.js')).QueueProcessorSchema,
  (await import('./doctrine-auditor.js')).DoctrineAuditorSchema,
];

/**
 * All 24 tool handlers keyed by call ID for bulk handler registration.
 */
export const ALL_TOOL_HANDLERS = {
  // Context family
  'TOOL-001': (await import('./pulse-keeper.js')).pulseKeeperHandler,
  'TOOL-004': (await import('./state-guardian.js')).stateGuardianHandler,
  'TOOL-005': (await import('./cycle-counter.js')).cycleCounterHandler,
  'TOOL-008': (await import('./context-builder.js')).contextBuilderHandler,
  'TOOL-010': (await import('./memory-consolidator.js')).memoryConsolidatorHandler,
  'TOOL-022': (await import('./lineage-tracer.js')).lineageTracerHandler,
  // Commander family
  'TOOL-002': (await import('./sync-weaver.js')).syncWeaverHandler,
  'TOOL-006': (await import('./infer-engine.js')).inferEngineHandler,
  'TOOL-009': (await import('./attention-router.js')).attentionRouterHandler,
  'TOOL-016': (await import('./resource-balancer.js')).resourceBalancerHandler,
  'TOOL-017': (await import('./connection-pool.js')).connectionPoolHandler,
  'TOOL-024': (await import('./task-commander.js')).taskCommanderHandler,
  // Crawling family
  'TOOL-003': (await import('./flow-monitor.js')).flowMonitorHandler,
  'TOOL-007': (await import('./pattern-seeker.js')).patternSeekerHandler,
  'TOOL-014': (await import('./anomaly-detector.js')).anomalyDetectorHandler,
  'TOOL-018': (await import('./cache-optimizer.js')).cacheOptimizerHandler,
  'TOOL-020': (await import('./log-streamer.js')).logStreamerHandler,
  'TOOL-021': (await import('./topology-crawler.js')).topologyCrawlerHandler,
  // Sentry family
  'TOOL-011': (await import('./sentinel-watch.js')).sentinelWatchHandler,
  'TOOL-012': (await import('./integrity-checker.js')).integrityCheckerHandler,
  'TOOL-013': (await import('./boundary-enforcer.js')).boundaryEnforcerHandler,
  'TOOL-015': (await import('./seal-verifier.js')).sealVerifierHandler,
  'TOOL-019': (await import('./queue-processor.js')).queueProcessorHandler,
  'TOOL-023': (await import('./doctrine-auditor.js')).doctrineAuditorHandler,
};
