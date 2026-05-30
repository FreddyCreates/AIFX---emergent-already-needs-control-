import { PHI, HEARTBEAT, VALID_FAMILIES } from './tool-schema.js';

/**
 * Family Profiles — 24 hand-crafted rich profiles for 4 core families.
 *
 * Every tool in the organism belongs to one of four families:
 *
 * 🕷 CRAWLING — sees everything. Walks every wire, reads every heartbeat,
 *   maps every connection. The organism's eyes — continuous structural awareness.
 *   "The crawl is the organism's self-awareness of its own structure."
 *
 * 🧠 CONTEXT — builds understanding. Maps meaning, traces lineage,
 *   assembles knowledge. The organism's memory-of-self.
 *   "Context is the organism knowing why it is what it is."
 *
 * ⚡ COMMANDER — directs action. Routes inference, schedules tasks,
 *   balances resources, synchronizes endpoints. The organism's will.
 *   "The commander turns intent into coordinated multi-tool action."
 *
 * 🛡 SENTRY — protects the organism. Guards perimeters, verifies seals,
 *   audits doctrine, checks integrity. The organism's immune system.
 *   "The sentry ensures the organism remains true to its own laws."
 *
 * As above, so below — every family operates at every level of the organism,
 * from the 873ms heartbeat to the sovereign doctrine.
 *
 * @module family-profiles
 */

// ──────────────────────────────────────────────────────────────────────
//  FAMILY DEFINITIONS
// ──────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} FamilyProfile
 * @property {string} id - Family identifier
 * @property {string} name - Family name (Crawling | Context | Commander | Sentry)
 * @property {string} icon - Family icon emoji
 * @property {string} motto - Family motto / one-liner
 * @property {string} description - Rich multi-sentence description of the family's role
 * @property {string} primitiveFunction - Core primitive function this family serves
 * @property {string} organismRole - What this family represents in the organism metaphor
 * @property {string} resonancePattern - How this family feeds into other families
 * @property {string[]} coreRings - Primary rings this family operates in
 * @property {string[]} archetypes - Types of tools that belong to this family
 * @property {string[]} lawsDomain - Architectural law domains this family enforces
 * @property {ToolFamilyMember[]} members - The 6 hand-crafted member profiles
 */

/**
 * @typedef {Object} ToolFamilyMember
 * @property {string} callId - Tool call ID (TOOL-xxx)
 * @property {string} name - Tool name
 * @property {string} role - Role within the family
 * @property {string} narrative - Rich narrative description of this tool's identity
 * @property {string} familyResonance - How this tool resonates with its family siblings
 * @property {string[]} feedsInto - Tools this one provides data to
 * @property {string[]} consumesFrom - Tools this one receives data from
 * @property {number} familyRank - Position within the family (1 = lead, 6 = support)
 * @property {number} phiWeight - Phi-weighted importance (1.0 = lead, descending by 1/φ)
 */

// ──────────────────────────────────────────────────────────────────────
//  🕷 CRAWLING FAMILY
// ──────────────────────────────────────────────────────────────────────

/** @type {FamilyProfile} */
export const CRAWLING_FAMILY = Object.freeze({
  id: 'FAM-CRAWL',
  name: 'Crawling',
  icon: '🕷',
  motto: 'The crawl is the organism\'s self-awareness of its own structure.',
  description:
    'The Crawling family sees everything. It walks every wire, reads every heartbeat, ' +
    'maps every connection. Where the Sentry guards the perimeter, the Crawler maps the interior. ' +
    'Crawling tools are the organism\'s eyes — they provide continuous structural awareness, ' +
    'detect topology changes, monitor flow health, spot anomalies, stream logs, and optimize caches. ' +
    'Without the Crawling family, the organism would be blind to its own shape.',
  primitiveFunction: 'Discovery / Monitoring / Mapping / Streaming',
  organismRole: 'The organism\'s eyes — continuous structural awareness',
  resonancePattern: 'Crawling feeds topology into Context, alerts into Sentry, metrics into Commander',
  coreRings: ['Transport Ring', 'Sovereign Ring', 'Memory Ring'],
  archetypes: ['monitor', 'scanner', 'streamer', 'crawler', 'optimizer', 'detector'],
  lawsDomain: ['AL-005', 'AL-014', 'AL-033', 'AL-034', 'AL-037'],
  members: [
    {
      callId: 'TOOL-003',
      name: 'FLOW-MONITOR',
      role: 'Flow Scout',
      narrative:
        'FLOW-MONITOR is the Crawling family\'s primary scout. It monitors every data channel ' +
        'in the organism, measuring throughput, detecting bottlenecks, and reporting channel health. ' +
        'Like blood pressure readings for the organism, its reports are the first signal that ' +
        'something is flowing well — or flowing wrong.',
      familyResonance: 'Provides throughput baselines for ANOMALY-DETECTOR and flow maps for TOPOLOGY-CRAWLER',
      feedsInto: ['TOOL-014', 'TOOL-021', 'TOOL-020'],
      consumesFrom: [],
      familyRank: 1,
      phiWeight: 1.0,
    },
    {
      callId: 'TOOL-007',
      name: 'PATTERN-SEEKER',
      role: 'Pattern Analyst',
      narrative:
        'PATTERN-SEEKER scans data streams, memory lineage, and invocation logs for recurring patterns. ' +
        'Using phi-weighted frequency analysis, it finds the rhythms hiding in organism noise — ' +
        'the repeated sequences that reveal underlying behavior. It is the Crawling family\'s ' +
        'pattern-recognition engine, turning raw observations into actionable signal.',
      familyResonance: 'Converts raw crawl data from FLOW-MONITOR and LOG-STREAMER into detected patterns',
      feedsInto: ['TOOL-014', 'TOOL-008', 'TOOL-007'],
      consumesFrom: ['TOOL-003', 'TOOL-020'],
      familyRank: 2,
      phiWeight: Math.round(1 / PHI * 1000) / 1000,
    },
    {
      callId: 'TOOL-014',
      name: 'ANOMALY-DETECTOR',
      role: 'Anomaly Hunter',
      narrative:
        'ANOMALY-DETECTOR watches for deviations from baseline. When patterns shift, when latency ' +
        'spikes, when state transitions happen that shouldn\'t — the Anomaly Hunter raises the alarm. ' +
        'It bridges the Crawling and Sentry families: crawling data is its input, security alerts ' +
        'are its output.',
      familyResonance: 'Bridges Crawling→Sentry by converting observed deviations into security-grade alerts',
      feedsInto: ['TOOL-011', 'TOOL-013', 'TOOL-009'],
      consumesFrom: ['TOOL-003', 'TOOL-007', 'TOOL-001'],
      familyRank: 3,
      phiWeight: Math.round(1 / (PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-020',
      name: 'LOG-STREAMER',
      role: 'Stream Keeper',
      narrative:
        'LOG-STREAMER captures every structured log entry across the organism — from tool invocations ' +
        'to protocol handshakes to extension messages. It is the Crawling family\'s historian, ' +
        'providing the raw material that PATTERN-SEEKER and ANOMALY-DETECTOR analyze. Without ' +
        'the stream, there is nothing to crawl.',
      familyResonance: 'Feeds raw log data into PATTERN-SEEKER for analysis and TOPOLOGY-CRAWLER for mapping',
      feedsInto: ['TOOL-007', 'TOOL-021'],
      consumesFrom: [],
      familyRank: 4,
      phiWeight: Math.round(1 / (PHI * PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-018',
      name: 'CACHE-OPTIMIZER',
      role: 'Cache Surgeon',
      narrative:
        'CACHE-OPTIMIZER crawls the organism\'s cache layers — spatial memory, knowledge graph, ' +
        'and routing caches — optimizing hit rates and coherence. Using phi-decay eviction, it ' +
        'ensures the organism\'s hot paths stay hot and cold data doesn\'t consume precious memory. ' +
        'It is the Crawling family\'s maintenance specialist.',
      familyResonance: 'Optimizes the caches that all other Crawling tools read from and write to',
      feedsInto: ['TOOL-010', 'TOOL-016'],
      consumesFrom: ['TOOL-003', 'TOOL-007'],
      familyRank: 5,
      phiWeight: Math.round(1 / (PHI * PHI * PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-021',
      name: 'TOPOLOGY-CRAWLER',
      role: 'Topology Mapper',
      narrative:
        'TOPOLOGY-CRAWLER is the Crawling family\'s cartographer. It walks the organism\'s entire ' +
        'structure — rings, wires, SDKs, extensions, protocols, tools — building a live dependency ' +
        'graph. It finds orphaned nodes, detects new endpoints, and maps every connection. ' +
        'Where other crawlers observe behavior, TOPOLOGY-CRAWLER observes structure itself.',
      familyResonance: 'Provides the structural map that all other Crawling tools navigate within',
      feedsInto: ['TOOL-008', 'TOOL-009', 'TOOL-016'],
      consumesFrom: ['TOOL-003', 'TOOL-020'],
      familyRank: 6,
      phiWeight: Math.round(1 / (PHI * PHI * PHI * PHI * PHI) * 1000) / 1000,
    },
  ],
});

// ──────────────────────────────────────────────────────────────────────
//  🧠 CONTEXT FAMILY
// ──────────────────────────────────────────────────────────────────────

/** @type {FamilyProfile} */
export const CONTEXT_FAMILY = Object.freeze({
  id: 'FAM-CTX',
  name: 'Context',
  icon: '🧠',
  motto: 'Context is the organism knowing why it is what it is.',
  description:
    'The Context family builds understanding. Where the Crawling family maps structure, ' +
    'the Context family maps meaning. It assembles execution context, traces lineage, ' +
    'reads state, counts cycles, and monitors the heartbeat. Context tools answer the ' +
    'question every AI needs answered before it can reason: "What is the current situation?" ' +
    'Without Context, the organism has eyes but no comprehension.',
  primitiveFunction: 'Context assembly / State reading / Temporal awareness / Lineage tracing',
  organismRole: 'The organism\'s comprehension — knowing what it is and why',
  resonancePattern: 'Context feeds enriched state into Commander for execution and Sentry for validation',
  coreRings: ['Sovereign Ring', 'Memory Ring', 'Interface Ring'],
  archetypes: ['builder', 'tracer', 'reader', 'counter', 'consolidator', 'monitor'],
  lawsDomain: ['AL-004', 'AL-005', 'AL-006', 'AL-007', 'AL-019', 'AL-020', 'AL-022', 'AL-023', 'AL-024'],
  members: [
    {
      callId: 'TOOL-001',
      name: 'PULSE-KEEPER',
      role: 'Heartbeat Witness',
      narrative:
        'PULSE-KEEPER is the Context family\'s timekeeper. It witnesses every 873ms heartbeat, ' +
        'tracking beat number, uptime, and drift. It is the most fundamental context any tool ' +
        'in the organism can have: "Is the organism alive? How long has it been alive? ' +
        'Is the pulse steady?" Every other Context tool builds on this temporal foundation.',
      familyResonance: 'Provides the temporal foundation (beat number, uptime) that all Context tools reference',
      feedsInto: ['TOOL-005', 'TOOL-004', 'TOOL-008'],
      consumesFrom: [],
      familyRank: 1,
      phiWeight: 1.0,
    },
    {
      callId: 'TOOL-008',
      name: 'CONTEXT-BUILDER',
      role: 'Context Architect',
      narrative:
        'CONTEXT-BUILDER is the family\'s master architect. It assembles rich execution context ' +
        'from organism state, memory, and environment — weaving together snapshots from ' +
        'PULSE-KEEPER, STATE-GUARDIAN, and MEMORY-CONSOLIDATOR into a unified context object ' +
        'that AIs can reason over. It answers "what does the organism know right now?"',
      familyResonance: 'Consumes state and memory from all Context siblings, produces unified reasoning context',
      feedsInto: ['TOOL-006', 'TOOL-009', 'TOOL-024'],
      consumesFrom: ['TOOL-001', 'TOOL-004', 'TOOL-010', 'TOOL-022'],
      familyRank: 2,
      phiWeight: Math.round(1 / PHI * 1000) / 1000,
    },
    {
      callId: 'TOOL-004',
      name: 'STATE-GUARDIAN',
      role: 'State Reader',
      narrative:
        'STATE-GUARDIAN reads and validates the 4-register organism state — Cognitive, ' +
        'Affective, Somatic, Sovereign. It provides snapshots, diffs, and integrity checks. ' +
        'For the Context family, it answers "what is the organism\'s internal state?" ' +
        'It bridges Context and Sentry: reading state is Context work, guarding it is Sentry work.',
      familyResonance: 'Provides real-time state snapshots that CONTEXT-BUILDER weaves into full context',
      feedsInto: ['TOOL-008', 'TOOL-012'],
      consumesFrom: ['TOOL-001'],
      familyRank: 3,
      phiWeight: Math.round(1 / (PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-005',
      name: 'CYCLE-COUNTER',
      role: 'Phase Tracker',
      narrative:
        'CYCLE-COUNTER tracks the organism\'s lifecycle phases — boot, pulse, settle, rest, ' +
        'shutdown. It provides temporal context at the phase level: not just "beat 47,293" but ' +
        '"we are in the pulse phase, 1,200 cycles since last boot." Phase awareness lets AIs ' +
        'understand not just the instant, but the era.',
      familyResonance: 'Enriches PULSE-KEEPER\'s beat-level time with lifecycle-phase-level time',
      feedsInto: ['TOOL-008', 'TOOL-014'],
      consumesFrom: ['TOOL-001'],
      familyRank: 4,
      phiWeight: Math.round(1 / (PHI * PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-010',
      name: 'MEMORY-CONSOLIDATOR',
      role: 'Memory Keeper',
      narrative:
        'MEMORY-CONSOLIDATOR manages the organism\'s memory health — merging branches, pruning ' +
        'stale entries, compacting spatial memory. For the Context family, it ensures that ' +
        'the memories CONTEXT-BUILDER assembles are clean, consolidated, and lineage-accurate. ' +
        'Without consolidation, context degrades into noise.',
      familyResonance: 'Maintains clean memory state that CONTEXT-BUILDER and LINEAGE-TRACER depend on',
      feedsInto: ['TOOL-008', 'TOOL-022'],
      consumesFrom: ['TOOL-001', 'TOOL-018'],
      familyRank: 5,
      phiWeight: Math.round(1 / (PHI * PHI * PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-022',
      name: 'LINEAGE-TRACER',
      role: 'Lineage Historian',
      narrative:
        'LINEAGE-TRACER is the Context family\'s historian. It traces the full ancestry of ' +
        'any organism entity — memories, invocations, state transitions, decisions — ' +
        'reconstructing the causal chain that led to any current state. It answers the ' +
        'deepest Context question: "How did we get here?"',
      familyResonance: 'Provides causal provenance that enriches CONTEXT-BUILDER\'s assembled context',
      feedsInto: ['TOOL-008', 'TOOL-023'],
      consumesFrom: ['TOOL-010', 'TOOL-004'],
      familyRank: 6,
      phiWeight: Math.round(1 / (PHI * PHI * PHI * PHI * PHI) * 1000) / 1000,
    },
  ],
});

// ──────────────────────────────────────────────────────────────────────
//  ⚡ COMMANDER FAMILY
// ──────────────────────────────────────────────────────────────────────

/** @type {FamilyProfile} */
export const COMMANDER_FAMILY = Object.freeze({
  id: 'FAM-CMD',
  name: 'Commander',
  icon: '⚡',
  motto: 'The commander turns intent into coordinated multi-tool action.',
  description:
    'The Commander family directs action. It routes inference tasks, synchronizes endpoints, ' +
    'balances resources, manages connections, and orchestrates multi-step workflows. ' +
    'Commander tools are the organism\'s executive function — they consume the Context ' +
    'family\'s understanding and translate it into coordinated, prioritized action. ' +
    'Without the Commander, the organism would understand but never act.',
  primitiveFunction: 'Routing / Orchestration / Synchronization / Resource management',
  organismRole: 'The organism\'s will — executive function and coordinated action',
  resonancePattern: 'Commander consumes Context for state, dispatches to Crawling for monitoring, triggers Sentry for validation',
  coreRings: ['Interface Ring', 'Sovereign Ring', 'Transport Ring'],
  archetypes: ['router', 'orchestrator', 'scheduler', 'balancer', 'synchronizer', 'dispatcher'],
  lawsDomain: ['AL-019', 'AL-025', 'AL-026', 'AL-027', 'AL-035', 'AL-036'],
  members: [
    {
      callId: 'TOOL-006',
      name: 'INFER-ENGINE',
      role: 'Model Strategist',
      narrative:
        'INFER-ENGINE is the Commander family\'s strategist. It scores every available AI model ' +
        'by capability match, cost, and routing priority, then selects the optimal model for ' +
        'any task. It turns the abstract question "which AI should handle this?" into a concrete, ' +
        'ranked selection with alternatives. The first decision in any Commander chain.',
      familyResonance: 'Makes the first routing decision that ATTENTION-ROUTER and TASK-COMMANDER build on',
      feedsInto: ['TOOL-009', 'TOOL-024'],
      consumesFrom: ['TOOL-008'],
      familyRank: 1,
      phiWeight: 1.0,
    },
    {
      callId: 'TOOL-009',
      name: 'ATTENTION-ROUTER',
      role: 'Focus Director',
      narrative:
        'ATTENTION-ROUTER distributes the organism\'s attention across subsystems. When multiple ' +
        'tools, agents, and extensions compete for processing, ATTENTION-ROUTER decides who gets ' +
        'priority. Using urgency-weighted phi-scoring, it ensures the organism\'s focus follows ' +
        'the most important signal.',
      familyResonance: 'Prioritizes where INFER-ENGINE\'s selected models and TASK-COMMANDER\'s plans execute',
      feedsInto: ['TOOL-024', 'TOOL-016'],
      consumesFrom: ['TOOL-006', 'TOOL-008', 'TOOL-014'],
      familyRank: 2,
      phiWeight: Math.round(1 / PHI * 1000) / 1000,
    },
    {
      callId: 'TOOL-002',
      name: 'SYNC-WEAVER',
      role: 'Synchronization Master',
      narrative:
        'SYNC-WEAVER orchestrates phi-resonance synchronization across all organism endpoints ' +
        'using Kuramoto oscillator coupling. It maintains the global coherence that allows ' +
        'distributed tools to act as one organism. The Commander family\'s metronome — ' +
        'ensuring everyone is on the same beat.',
      familyResonance: 'Provides the timing coherence that TASK-COMMANDER and ATTENTION-ROUTER depend on',
      feedsInto: ['TOOL-024', 'TOOL-009', 'TOOL-001'],
      consumesFrom: ['TOOL-001'],
      familyRank: 3,
      phiWeight: Math.round(1 / (PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-016',
      name: 'RESOURCE-BALANCER',
      role: 'Resource Allocator',
      narrative:
        'RESOURCE-BALANCER distributes compute, memory, and network resources across organism ' +
        'rings using phi-weighted allocation. It ensures no ring starves while another feasts. ' +
        'The Commander family\'s supply officer — making sure the troops have what they need.',
      familyResonance: 'Allocates the resources that INFER-ENGINE, ATTENTION-ROUTER, and TASK-COMMANDER consume',
      feedsInto: ['TOOL-006', 'TOOL-009', 'TOOL-024'],
      consumesFrom: ['TOOL-003', 'TOOL-021'],
      familyRank: 4,
      phiWeight: Math.round(1 / (PHI * PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-017',
      name: 'CONNECTION-POOL',
      role: 'Connection Quartermaster',
      narrative:
        'CONNECTION-POOL manages the organism\'s connection pools for enterprise connectors, ' +
        'intelligence wires, and cross-organism channels. It ensures connections are available ' +
        'when the Commander family needs to dispatch actions, and drains gracefully when load drops.',
      familyResonance: 'Provides the connection infrastructure that TASK-COMMANDER dispatches through',
      feedsInto: ['TOOL-024', 'TOOL-003'],
      consumesFrom: ['TOOL-016'],
      familyRank: 5,
      phiWeight: Math.round(1 / (PHI * PHI * PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-024',
      name: 'TASK-COMMANDER',
      role: 'Execution General',
      narrative:
        'TASK-COMMANDER is the Commander family\'s general. It takes multi-step task plans and ' +
        'dispatches them across tools, agents, and extensions with dependency resolution, rollback, ' +
        'and progress tracking. It consumes INFER-ENGINE\'s model selections, ATTENTION-ROUTER\'s ' +
        'priority maps, and RESOURCE-BALANCER\'s allocations to orchestrate complex workflows.',
      familyResonance: 'Orchestrates the combined output of all Commander siblings into coordinated multi-tool execution',
      feedsInto: ['TOOL-020', 'TOOL-003'],
      consumesFrom: ['TOOL-006', 'TOOL-009', 'TOOL-002', 'TOOL-016', 'TOOL-017', 'TOOL-008'],
      familyRank: 6,
      phiWeight: Math.round(1 / (PHI * PHI * PHI * PHI * PHI) * 1000) / 1000,
    },
  ],
});

// ──────────────────────────────────────────────────────────────────────
//  🛡 SENTRY FAMILY
// ──────────────────────────────────────────────────────────────────────

/** @type {FamilyProfile} */
export const SENTRY_FAMILY = Object.freeze({
  id: 'FAM-SENT',
  name: 'Sentry',
  icon: '🛡',
  motto: 'The sentry ensures the organism remains true to its own laws.',
  description:
    'The Sentry family protects the organism. It guards against external threats (prompt ' +
    'injection, phishing, PII leakage) and internal drift (law violations, boundary breaches, ' +
    'doctrine misalignment). Sentry tools are the organism\'s immune system — they verify seals, ' +
    'enforce boundaries, check integrity, audit governance, and process security queues. ' +
    'Without the Sentry, the organism would be defenseless against corruption.',
  primitiveFunction: 'Protection / Verification / Enforcement / Auditing',
  organismRole: 'The organism\'s immune system — defense against external threats and internal drift',
  resonancePattern: 'Sentry consumes alerts from Crawling, validates state from Context, gates actions from Commander',
  coreRings: ['Counsel Ring', 'Proof Ring', 'Sovereign Ring'],
  archetypes: ['guard', 'verifier', 'enforcer', 'auditor', 'checker', 'processor'],
  lawsDomain: ['AL-001', 'AL-010', 'AL-011', 'AL-014', 'AL-015', 'AL-020', 'AL-021'],
  members: [
    {
      callId: 'TOOL-011',
      name: 'SENTINEL-WATCH',
      role: 'Perimeter Guard',
      narrative:
        'SENTINEL-WATCH is the Sentry family\'s perimeter guard — the first line of defense. ' +
        'It scans for prompt injection, phishing, toxicity, and PII leakage in real-time. ' +
        'Where ANOMALY-DETECTOR (Crawling) spots unusual patterns, SENTINEL-WATCH classifies ' +
        'them as threats. It is always on, always scanning, always watching.',
      familyResonance: 'Receives anomaly alerts from Crawling family and classifies them as security threats',
      feedsInto: ['TOOL-013', 'TOOL-015', 'TOOL-023'],
      consumesFrom: ['TOOL-014'],
      familyRank: 1,
      phiWeight: 1.0,
    },
    {
      callId: 'TOOL-012',
      name: 'INTEGRITY-CHECKER',
      role: 'Truth Verifier',
      narrative:
        'INTEGRITY-CHECKER verifies data integrity, contract compliance, and schema consistency ' +
        'across every organism layer. It runs 40 architectural law checks and reports pass/fail ' +
        'with evidence. The Sentry family\'s truth-tester — it answers "is this data what it ' +
        'claims to be?"',
      familyResonance: 'Validates the integrity of data that SENTINEL-WATCH has cleared as non-threatening',
      feedsInto: ['TOOL-023', 'TOOL-013'],
      consumesFrom: ['TOOL-004', 'TOOL-011'],
      familyRank: 2,
      phiWeight: Math.round(1 / PHI * 1000) / 1000,
    },
    {
      callId: 'TOOL-013',
      name: 'BOUNDARY-ENFORCER',
      role: 'Ring Warden',
      narrative:
        'BOUNDARY-ENFORCER guards the boundaries between organism rings. It validates every ' +
        'cross-ring communication, prevents unauthorized state leakage, and ensures isolation ' +
        'between layers. The Ring Warden — no data crosses a boundary without permission.',
      familyResonance: 'Enforces the ring boundaries that INTEGRITY-CHECKER validates and SENTINEL-WATCH monitors',
      feedsInto: ['TOOL-023', 'TOOL-020'],
      consumesFrom: ['TOOL-011', 'TOOL-012'],
      familyRank: 3,
      phiWeight: Math.round(1 / (PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-015',
      name: 'SEAL-VERIFIER',
      role: 'Seal Master',
      narrative:
        'SEAL-VERIFIER is the Sentry family\'s cryptographic specialist. It verifies HMAC-SHA256 ' +
        'seals on intelligence contracts, data packages, and organism communications. A broken ' +
        'seal means tampering — and SEAL-VERIFIER catches it.',
      familyResonance: 'Provides cryptographic proof that supports INTEGRITY-CHECKER\'s compliance verification',
      feedsInto: ['TOOL-012', 'TOOL-023'],
      consumesFrom: ['TOOL-011'],
      familyRank: 4,
      phiWeight: Math.round(1 / (PHI * PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-019',
      name: 'QUEUE-PROCESSOR',
      role: 'Security Queue Handler',
      narrative:
        'QUEUE-PROCESSOR handles the organism\'s security and settlement queues. It processes ' +
        'priority-ordered tasks for invocation validation, agent authorization, and settlement ' +
        'cycles. The Sentry family\'s logistics officer — ensuring security work is processed ' +
        'in the right order.',
      familyResonance: 'Processes the security tasks that other Sentry tools generate and queue',
      feedsInto: ['TOOL-011', 'TOOL-012'],
      consumesFrom: ['TOOL-013', 'TOOL-015'],
      familyRank: 5,
      phiWeight: Math.round(1 / (PHI * PHI * PHI * PHI) * 1000) / 1000,
    },
    {
      callId: 'TOOL-023',
      name: 'DOCTRINE-AUDITOR',
      role: 'Doctrine Judge',
      narrative:
        'DOCTRINE-AUDITOR is the Sentry family\'s judge. It audits organism behavior against ' +
        'all 40 architectural laws and the sovereign doctrine. Where other Sentry tools guard ' +
        'against external threats and data corruption, DOCTRINE-AUDITOR guards against internal ' +
        'drift — ensuring the organism remains architecturally true to itself.',
      familyResonance: 'Audits the compliance of all other Sentry actions against the sovereign doctrine',
      feedsInto: ['TOOL-004', 'TOOL-008'],
      consumesFrom: ['TOOL-011', 'TOOL-012', 'TOOL-013', 'TOOL-015', 'TOOL-022'],
      familyRank: 6,
      phiWeight: Math.round(1 / (PHI * PHI * PHI * PHI * PHI) * 1000) / 1000,
    },
  ],
});

// ──────────────────────────────────────────────────────────────────────
//  FAMILY REGISTRY
// ──────────────────────────────────────────────────────────────────────

/**
 * All 4 family profiles indexed by name.
 * @type {Record<string, FamilyProfile>}
 */
export const FAMILY_PROFILES = Object.freeze({
  Crawling: CRAWLING_FAMILY,
  Context: CONTEXT_FAMILY,
  Commander: COMMANDER_FAMILY,
  Sentry: SENTRY_FAMILY,
});

/**
 * All 4 family profiles as an array.
 */
export const ALL_FAMILIES = Object.freeze([
  CRAWLING_FAMILY,
  CONTEXT_FAMILY,
  COMMANDER_FAMILY,
  SENTRY_FAMILY,
]);

/**
 * Get the family profile for a tool by its call ID.
 * @param {string} callId
 * @returns {{ family: FamilyProfile, member: ToolFamilyMember } | undefined}
 */
export function getFamilyByToolId(callId) {
  for (const family of ALL_FAMILIES) {
    const member = family.members.find((m) => m.callId === callId);
    if (member) return { family, member };
  }
  return undefined;
}

/**
 * Get all tools belonging to a specific family.
 * @param {string} familyName - Crawling | Context | Commander | Sentry
 * @returns {ToolFamilyMember[]}
 */
export function getFamilyMembers(familyName) {
  const family = FAMILY_PROFILES[familyName];
  return family ? family.members : [];
}

/**
 * Get the resonance graph — all inter-tool data flow edges across all families.
 * @returns {Array<{ from: string, to: string, fromFamily: string, toFamily: string }>}
 */
export function getResonanceGraph() {
  const edges = [];
  for (const family of ALL_FAMILIES) {
    for (const member of family.members) {
      for (const target of member.feedsInto) {
        const targetInfo = getFamilyByToolId(target);
        edges.push({
          from: member.callId,
          to: target,
          fromFamily: family.name,
          toFamily: targetInfo ? targetInfo.family.name : 'unknown',
        });
      }
    }
  }
  return edges;
}

/**
 * Get cross-family resonance summary — how many edges flow between each family pair.
 * @returns {Record<string, Record<string, number>>}
 */
export function getCrossFamilyResonance() {
  const graph = getResonanceGraph();
  const matrix = {};

  for (const familyName of VALID_FAMILIES) {
    matrix[familyName] = {};
    for (const targetName of VALID_FAMILIES) {
      matrix[familyName][targetName] = 0;
    }
  }

  for (const edge of graph) {
    if (matrix[edge.fromFamily] && matrix[edge.fromFamily][edge.toFamily] !== undefined) {
      matrix[edge.fromFamily][edge.toFamily]++;
    }
  }

  return matrix;
}

export default FAMILY_PROFILES;
