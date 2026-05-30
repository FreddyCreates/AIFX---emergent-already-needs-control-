/**
 * AI-Intelligent Protocols — Organism Wire Index (ORO Systems / AURO)
 *
 * 36 protocols, each a literal AI: adaptive, self-healing, multi-engine,
 * phi-math wired throughout. All export into the sovereign AURO organism.
 *
 * Original 11 (PROTO-001 through PROTO-011):
 *   SRP, EIT, PRSP, AKAP, MMFP, SCVP, EMIP, VSIP, MLP, OLP, OMP
 *
 * AURO Charter Protocols (PROTO-181 through PROTO-185):
 *   AGIP, MLEP, SOCP, OEIP, AACP
 *
 * Alpha Intelligence Protocols (PROTO-201 through PROTO-220):
 *   NODEP, PSP, HLP, KOP, VHP, KEP, CSRP, SBEP, MHP, MBP,
 *   NEP, ESP, AGCEP, PCP, ARP, MCP, RSP, HDP, GSP, AGP
 *
 * @module protocols
 * @version 3.1.0
 * @powered-by ORO Systems
 */

// ─── Phi Constants (shared across all protocols) ─────────────────────────────
export const PHI = 1.618033988749895;
export const HEARTBEAT = 873;
export const GOLDEN_ANGLE = 137.508;
export const EMERGENCE_THRESHOLD = PHI - 1;  // 0.618...

// ─── Original ORO Wire Protocols (PROTO-001 – PROTO-011) ─────────────────────
export { SovereignRoutingProtocol } from './sovereign-routing-protocol.js';
export { EncryptedIntelligenceTransport } from './encrypted-intelligence-transport.js';
export { PhiResonanceSyncProtocol } from './phi-resonance-sync-protocol.js';
export { AdaptiveKnowledgeAbsorptionProtocol } from './adaptive-knowledge-absorption-protocol.js';
export { MultiModelFusionProtocol } from './multi-model-fusion-protocol.js';
export { SovereignContractVerificationProtocol } from './sovereign-contract-verification-protocol.js';
export { EdgeMeshIntelligenceProtocol } from './edge-mesh-intelligence-protocol.js';
export { VisualSceneIntelligenceProtocol } from './visual-scene-intelligence-protocol.js';
export { MemoryLineageProtocol } from './memory-lineage-protocol.js';
export { OrganismLifecycleProtocol } from './organism-lifecycle-protocol.js';
export { OrganismMarketplaceProtocol } from './organism-marketplace-protocol.js';

// ─── AURO Charter Protocols (PROTO-181 – PROTO-185) ──────────────────────────
export { AuroGuardianIntelligenceProtocol } from './auro-guardian-intelligence-protocol.js';
export { MemoryLineageEnhancementProtocol } from './memory-lineage-enhancement-protocol.js';
export { SovereignOfflineCognitionProtocol } from './sovereign-offline-cognition-protocol.js';
export { OroEngineIntegrationProtocol, ORO_CAPABILITIES } from './oro-engine-integration-protocol.js';
export { AuroAbsorptionCharterProtocol, USE_CLASSES, CHARTER_PRINCIPLES } from './auro-absorption-charter-protocol.js';

// ─── Alpha Intelligence Protocols (PROTO-201 – PROTO-220) ────────────────────

// PROTO-201: Neurochemistry ODE — 6 species, Hill equation, Jacobian coupling
export { NeurochemistryODEProtocol, SPECIES, STIMULUS_TABLE } from './neurochemistry-ode-protocol.js';

// PROTO-202: Pattern Synthesis — 40 primitives, 8 domains, knowledge synthesis
export { PatternSynthesisProtocol, KNOWLEDGE_PRIMITIVES, DOMAINS } from './pattern-synthesis-protocol.js';

// PROTO-203: Hebbian Learning — synaptic plasticity, LTP/LTD, eligibility traces
export { HebbianLearningProtocol } from './hebbian-learning-protocol.js';

// PROTO-204: Kuramoto Oscillator — phase synchronization, collective emergence
export { KuramotoOscillatorProtocol } from './kuramoto-oscillator-protocol.js';

// PROTO-205: Vitality Homeostasis — 4-register health, phi-weighted equilibrium
export { VitalityHomeostasisProtocol, HOMEOSTATIC_TARGET } from './vitality-homeostasis-protocol.js';

// PROTO-206: Kernel Execution — autonomous kernel scheduling, phi-priority queue
export { KernelExecutionProtocol, PRIORITY } from './kernel-execution-protocol.js';

// PROTO-207: Cross-Substrate Resonance — 6 substrates, phi-encoded messaging
export { CrossSubstrateResonanceProtocol, SUBSTRATES } from './cross-substrate-resonance-protocol.js';

// PROTO-208: Synapse Binding Engine — permanent imprints, 5 job types, 7 failures
export { SynapseBindingEngineProtocol, JOB_TYPES, PRIORITY_LEVELS, FAILURE_CLASSES, RECOVERY_BOUNDS } from './synapse-binding-engine-protocol.js';

// PROTO-209: Mini-Heart — per-worker vitals, health score 0-100
export { MiniHeartProtocol, VITAL_TYPES } from './mini-heart-protocol.js';

// PROTO-210: Mini-Brain — stimulus-response, Hebbian learning, amortized decay
export { MiniBrainProtocol, LEARNING_RATE, DECAY_RATE } from './mini-brain-protocol.js';

// PROTO-211: Neuro-Emergence — phase coupling, collective synchrony, cascade triggers
export { NeuroEmergenceProtocol, CASCADE_THRESHOLD } from './neuro-emergence-protocol.js';

// PROTO-212: Edge Sensor — real-time sensing, phi-weighted thresholds
export { EdgeSensorProtocol, SENSOR_TYPES } from './edge-sensor-protocol.js';

// PROTO-213: Auto-Generate Calls Engine — self-generating API calls
export { AutoGenerateCallsEngineProtocol, INTENT_TYPES } from './auto-generate-calls-engine-protocol.js';

// PROTO-214: Predictive Coding — hierarchical prediction, error propagation
export { PredictiveCodingProtocol } from './predictive-coding-protocol.js';

// PROTO-215: Attention Routing — phi-weighted attention, QKV mechanism
export { AttentionRoutingProtocol, ATTENTION_DECAY } from './attention-routing-protocol.js';

// PROTO-216: Memory Consolidation — STM→LTM transfer, working/episodic/semantic
export { MemoryConsolidationProtocol, MEMORY_TYPES } from './memory-consolidation-protocol.js';

// PROTO-217: Reward Signal — TD(λ) learning, dopaminergic reward prediction
export { RewardSignalProtocol, GAMMA, LAMBDA, ALPHA } from './reward-signal-protocol.js';

// PROTO-218: Homeostatic Drive — internal drives, motivation generation
export { HomeostaticDriveProtocol, DRIVE_TYPES } from './homeostatic-drive-protocol.js';

// PROTO-219: Goal Stack — hierarchical goals, phi-weighted priority
export { GoalStackProtocol, GOAL_STATES } from './goal-stack-protocol.js';

// PROTO-220: Artifact Generation — autonomous artifact production, validation
export { ArtifactGenerationProtocol, ARTIFACT_TYPES } from './artifact-generation-protocol.js';

// PROTO-221: Meta-Learning — adapts learning hyperparameters, MAML-inspired meta-gradients
export { MetaLearningProtocol, HYPER_BOUNDS } from './meta-learning-protocol.js';

// PROTO-222: Curriculum — structured learning progression, phi-weighted difficulty scaling
export { CurriculumProtocol, CURRICULUM_DOMAINS, MASTERY_LEVELS } from './curriculum-protocol.js';

// ─── Active Intelligence Contracts & Edge Protocols (PROTO-223 – PROTO-225) ──

// PROTO-223: Intelligence Contract — active self-executing contracts, watch/trigger/fulfill lifecycle
export { IntelligenceContractProtocol, IntelligenceContract, CONTRACT_STATES, CONTRACT_TYPES } from './intelligence-contract-protocol.js';

// PROTO-224: Edge Compute — Cloudflare Workers orchestration, phi-weighted latency routing
export { EdgeComputeProtocol, EdgeWorker, WORKER_TYPES, WORKER_STATES, EDGE_REGIONS } from './edge-compute-protocol.js';

// PROTO-225: Cyber Defense — threat matrix, attack surface map, incident engine
export { CyberDefenseProtocol, ThreatIndicator, THREAT_LEVELS, SURFACE_CATEGORIES } from './cyber-defense-protocol.js';

// PROTO-226: Geometric Key — phi-resonance access gate, Nova protocol bridge
export { GeometricKeyProtocol, INTERFACE_TYPES, KEY_STATES, ACCESS, WINDOW_MS, DEFAULT_DIMENSIONS } from './geometric-key-protocol.js';

// PROTO-227: Sovereign Charter — hierarchical covenant binding all protocols, canisters, and the log
export { SovereignCharterProtocol, TIERS, PROTOCOLS, DEPENDENCIES, CANISTERS, LOG_COVENANT, ACTIVATION_SEQUENCE } from './sovereign-charter.js';
