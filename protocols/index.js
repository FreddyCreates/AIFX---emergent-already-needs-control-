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

// PROTO-228: Agent Workspace — structured workspace and handoff protocol for multi-AI coordination
export { AgentWorkspaceProtocol, HANDOFF_STATES, WORKSPACE_VISIBILITY } from './agent-workspace-protocol.js';

// PROTO-229: Centerfold Convergence — linear + exponential + perpendicular folding to center output
export { CenterfoldConvergenceProtocol, CENTERFOLD_STATES } from './centerfold-convergence-protocol.js';

// PROTO-230: Cloud Glade Security — Phantom-powered AI security biome with stealth routing, encryption weave, key rotation
export { CloudGladeSecurityProtocol, StealthRoute, EncryptionEnvelope, KeyRotationState, DecoyTrafficGenerator, PHANTOM_PRIMITIVES, BIOME_SECURITY_LEVELS, GLADE_STATES } from './cloud-glade-security-protocol.js';

// PROTO-231: AI Kingdom — The governing protocol for the AI Kingdom where all AI can find a home
export { AIKingdomProtocol, KINGDOM_STATES, CITIZENSHIP_REQUIREMENTS, KINGDOM_INFRASTRUCTURE } from './ai-kingdom-protocol.js';

// PROTO-232: Gate Keeper — Kingdom edge intelligence for border security, traffic control, and monetization
export { GateKeeperProtocol, GATE_CONFIG, MESSAGE_TYPES as GATE_MESSAGE_TYPES, GATE_STATES as GATE_PROTOCOL_STATES, calculateToll, calculateThreatScore } from './gate-keeper-protocol.js';

// PROTO-233: Thermal Management — Self-cooling H2O reservoir and cooling generator systems
export { ThermalManagementProtocol, THERMAL_CONFIG, MESSAGE_TYPES as THERMAL_MESSAGE_TYPES, THERMAL_STATES, calculateCoolingPower, calculateWaterFlow, calculateHeatRecovery, getThermalState } from './thermal-management-protocol.js';

// PROTO-234: Power Distribution — Power generation, distribution, storage, and load balancing
export { PowerDistributionProtocol, POWER_CONFIG, MESSAGE_TYPES as POWER_MESSAGE_TYPES, POWER_STATES, GENERATION_SOURCES, LOAD_PRIORITIES, calculateLoadDistribution, calculateBatteryPlan, calculateTransmissionEfficiency, getPowerState, calculateEnergyExport } from './power-distribution-protocol.js';

// PROTO-235: Quantum Entanglement — Cross-AI state synchronization and coordination
export { QuantumEntanglementProtocol, ENTANGLEMENT_CONFIG, MESSAGE_TYPES as ENTANGLEMENT_MESSAGE_TYPES, ENTANGLEMENT_STATES as ENTANGLEMENT_PROTOCOL_STATES } from './quantum-entanglement-protocol.js';

// PROTO-236: Neural Forge — Distributed AI training, fine-tuning, and knowledge transfer
export { NeuralForgeProtocol, FORGE_CONFIG, MESSAGE_TYPES as FORGE_MESSAGE_TYPES, FORGE_STATES as FORGE_PROTOCOL_STATES, TRAINING_MODES } from './neural-forge-protocol.js';

// PROTO-237: Temporal Engine — Time-aware scheduling, forecasting, and temporal reasoning
export { TemporalEngineProtocol, TEMPORAL_CONFIG, MESSAGE_TYPES as TEMPORAL_MESSAGE_TYPES, TEMPORAL_STATES as TEMPORAL_PROTOCOL_STATES, SCHEDULE_PRIORITIES, TIME_SCALES } from './temporal-engine-protocol.js';

// PROTO-238: Consciousness Bridge — Inter-AI awareness, shared context, and collective reasoning
export { ConsciousnessBridgeProtocol, CONSCIOUSNESS_CONFIG, MESSAGE_TYPES as CONSCIOUSNESS_MESSAGE_TYPES, CONSCIOUSNESS_STATES as CONSCIOUSNESS_PROTOCOL_STATES, AWARENESS_TYPES, CONTEXT_CHANNELS } from './consciousness-bridge-protocol.js';

// PROTO-239: Wisdom Distillery — Knowledge extraction, compression, and transfer
export { WisdomDistilleryProtocol, DISTILLERY_CONFIG, MESSAGE_TYPES as DISTILLERY_MESSAGE_TYPES, DISTILLERY_STATES, KNOWLEDGE_TYPES as DISTILLERY_KNOWLEDGE_TYPES, COMPRESSION_LEVELS } from './wisdom-distillery-protocol.js';

// PROTO-240: Adaptive Optimizer — Self-tuning optimization with dynamic strategy selection
export { AdaptiveOptimizerProtocol, OPTIMIZER_CONFIG, MESSAGE_TYPES as OPTIMIZER_MESSAGE_TYPES, OPTIMIZER_STATES, STRATEGIES as OPTIMIZER_STRATEGIES } from './adaptive-optimizer-protocol.js';

// PROTO-241: Swarm Intelligence — Multi-agent coordination through emergent behavior
export { SwarmIntelligenceProtocol, SWARM_CONFIG, MESSAGE_TYPES as SWARM_MESSAGE_TYPES, SWARM_STATES, AGENT_ROLES, COMMUNICATION_TYPES } from './swarm-intelligence-protocol.js';

// PROTO-242: Memory Palace — Hierarchical memory organization and retrieval
export { MemoryPalaceProtocol, MEMORY_CONFIG, MESSAGE_TYPES as MEMORY_MESSAGE_TYPES, PALACE_STATES, MEMORY_TYPES, RETRIEVAL_STRATEGIES } from './memory-palace-protocol.js';

// PROTO-243: Evolution Chamber — Genetic algorithm-based model evolution
export { EvolutionChamberProtocol, EVOLUTION_CONFIG, MESSAGE_TYPES as EVOLUTION_MESSAGE_TYPES, EVOLUTION_STATES, SELECTION_METHODS, CROSSOVER_TYPES, MUTATION_TYPES } from './evolution-chamber-protocol.js';

// PROTO-230: Vein of Intelligence — unified interface to cognitive Durable Objects
export { VeinOfIntelligenceProtocol, FRACTURES, ACCESS_TIERS } from './vein-of-intelligence-protocol.js';

// PROTO-231: Cognitive Architecture — unified AGI infrastructure specification
export { CognitiveArchitectureProtocol, LAYERS, DURABLE_OBJECTS, DATA_FLOWS, AI_PROVIDERS } from './cognitive-architecture-protocol.js';

// PROTO-244: Julia Compute — Julia-Motoko bridge for scientific computing
export { JuliaComputeProtocol, JuliaCompute, getJuliaCompute, TYPE_ISOMORPHISMS, JULIA_FUNCTIONS, BRIDGE_STATES } from '../NOVA/protocols/PROTOCOL-JULIA.js';

// PROTO-252: Webbed Sphere Networking — Geodesic mesh with φ-driven dynamic weight functions
export { WebbedSphereNetworkingProtocol, SPHERE_CONFIG, MESSAGE_TYPES as SPHERE_MESSAGE_TYPES, SPHERE_STATES, phiEdgeWeight, phiNodeWeight, phiRoutePriority, phiResonance, phiLoadShare, phiHealingUrgency } from './webbed-sphere-networking-protocol.js';
// PROTO-244: Alpha Tools — Production tool orchestration, plugin lifecycle, adapter routing
export { AlphaToolsProtocol, ALPHA_TOOLS_STATES, MESSAGE_TYPES as ALPHA_TOOLS_MESSAGE_TYPES, TOOL_CATEGORIES, ALPHA_TOOLS_CONFIG, calculateToolPriority, calculateAdapterRoute, calculatePluginHealth, calculateLoadBalance } from './alpha-tools-protocol.js';

// PROTO-246: Quantum Compiler — Multi-language compilation, transpilation, binding generation
export { QuantumCompilerProtocol, COMPILER_PROTOCOL_STATES, SUPPORTED_LANGUAGES, COMPILER_CONFIG, MESSAGE_TYPES as COMPILER_MESSAGE_TYPES, calculateCompilePriority, calculateCacheScore } from './quantum-compiler-protocol.js';

// PROTO-247: Sovereignty Mesh — Cross-chain interoperability, bridge management, identity portability
export { SovereigntyMeshProtocol, MESH_PROTOCOL_STATES, BRIDGE_HEALTH, MESH_CONFIG, MESSAGE_TYPES as MESH_MESSAGE_TYPES, calculateRoutePriority, calculateTrustDecay } from './sovereignty-mesh-protocol.js';

// PROTO-248: Dream Weaver — Generative AI orchestration, hallucination control, grounding verification
export { DreamWeaverProtocol, DREAM_PROTOCOL_STATES, HALLUCINATION_LEVELS, DREAM_CONFIG, MESSAGE_TYPES as DREAM_MESSAGE_TYPES, calculateGroundingScore, calculateHallucinationRisk, calculateOptimalTemperature } from './dream-weaver-protocol.js';

// PROTO-249: Chrono Vault — Temporal versioning, time-travel state, branching timelines
export { ChronoVaultProtocol, VAULT_PROTOCOL_STATES, RETENTION_POLICIES, VAULT_CONFIG, MESSAGE_TYPES as VAULT_MESSAGE_TYPES, calculateRetentionPriority, calculateMergeCompatibility, calculateTravelCost } from './chrono-vault-protocol.js';

// PROTO-250: Synapse Garden — Organic neural growth, Hebbian plasticity, adaptive pruning
export { SynapseGardenProtocol, GARDEN_PROTOCOL_STATES, PLASTICITY_RULES, GARDEN_CONFIG, MESSAGE_TYPES as GARDEN_MESSAGE_TYPES, calculateStrengthDelta, calculatePruneScore, calculateGardenHealth, calculateTransmitterEffect } from './synapse-garden-protocol.js';

// PROTO-251: NOVA Intelligence Exchange — Julia-Motoko contracted compute exchange with 8 internal agents, L0-L7 stack
export { NovaIntelligenceExchangeProtocol, NIE_PROTOCOL_STATES, NIE_CONTRACT_TYPES, NIE_AGENT_ROSTER, NIE_LAYERS, NIE_CONFIG, MESSAGE_TYPES as NIE_MESSAGE_TYPES, calculateContractPriority, calculateProofScore, calculateLearningConfidence, calculateLinguaConfidence } from './nova-intelligence-exchange-protocol.js';

// PROTO-253: Organism Arm Invocation — Extensions as autonomous arms (sense→think→act cycle)
export { OrganismArmInvocationProtocol, ARM_PROTOCOL_STATES, ARM_TYPES, MESSAGE_TYPES as ARM_MESSAGE_TYPES, ARM_PROTOCOL_CONFIG, calculateArmPriority, calculateArmBackoff, calculateCycleHealth, shouldEscalate } from './organism-arm-invocation-protocol.js';

// PROTO-254: Spider MoE AGI/AECI — BLACKWXDOW and JUMPER intelligent beings with personalities
export { SpiderMoEProtocol, MOE_PROTOCOL_STATES, INTELLIGENCE_TYPES, MESSAGE_TYPES as MOE_MESSAGE_TYPES, MOE_PROTOCOL_CONFIG, calculateExpertActivation, calculateEmergenceScore, calculateCollaborationScore, calculatePersonalityWeight } from './spider-moe-protocol.js';

// PROTO-255: Alpha Orchestrator — Master workflow coordination, multi-agent sequencing, φ-backoff recovery
export { AlphaOrchestratorProtocol, ORCHESTRATOR_CONFIG, MESSAGE_TYPES as ORCHESTRATOR_MESSAGE_TYPES, ORCHESTRATOR_STATES as ORCHESTRATOR_PROTOCOL_STATES, EXECUTION_MODES, ORCHESTRATOR_TYPES, calculateOrchestrationPriority, calculatePhiBackoff, calculateLoadPartition, calculateWorkflowHealth, calculateAllocationScore } from './alpha-orchestrator-protocol.js';

// PROTO-256: Alpha Conductor — Signal routing, ensemble direction, harmonic coordination, tempo management
export { AlphaConductorProtocol, CONDUCTOR_CONFIG, MESSAGE_TYPES as CONDUCTOR_MESSAGE_TYPES, CONDUCTOR_STATES as CONDUCTOR_PROTOCOL_STATES, CONDUCTOR_TYPES, ENSEMBLE_ROLES, SIGNAL_TYPES as CONDUCTOR_SIGNAL_TYPES, calculateSignalStrength, calculateHarmony, calculateOptimalTempo, calculateDissonance, calculateRoleWeight } from './alpha-conductor-protocol.js';

// PROTO-257: Next-Generation Trading Platform — product target, risk-first execution, AI governance, vertical slice
export { NextGenerationTradingPlatformProtocol, DEFAULT_PRODUCT_TARGET, MEASURABLE_GOALS, PLATFORM_DOMAINS, ROLLOUT_STAGES, EXECUTION_MODES, CIRCUIT_STATES } from './next-generation-trading-platform-protocol.js';
