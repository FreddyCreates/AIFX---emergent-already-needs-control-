/**
 * CIVITAS INTELLIGENTIAE SDK
 * 
 * The complete SDK for building living intelligent systems.
 * 
 * Architecture (backend-first):
 *   STEP 1: ENGINES (physics)
 *     - CHRONO: Time & Scheduling
 *     - NEXORIS: State Management
 *     - QUANTUM_FLUX: Randomness & Entropy
 *     - COREOGRAPH: Orchestration
 * 
 *   STEP 2: AGENTS (organs)
 *     - ANIMUS: Mind (reasoning, decisions)
 *     - CORPUS: Body (execution, actions)
 *     - SENSUS: Senses (perception, filtering)
 *     - MEMORIA: Memory (encoding, retrieval)
 * 
 *   STEP 3: RUNTIME (coordinator)
 *     - CivitasRuntime: Creates agents, wires them, manages lifecycle
 * 
 *   STEP 4: BOOTSTRAP (activation)
 *     - bootstrapCivitas(): One call to start a living civilization
 * 
 * Internal SDKs (Professional Pattern):
 *   - @medina/medina-timers: Mathematical timers (ancient calendars, sacred geometry, cosmic cycles)
 *   - @medina/medina-calls: Write operations (civitas, organism, governance mutations)
 *   - @medina/medina-queries: Read operations with caching
 *   - @medina/organism-bootstrap: ICP/Motoko organism bootstrap
 * 
 * Usage:
 *   import { bootstrapCivitas } from '@medina/civitas-intelligentiae';
 *   const civitas = bootstrapCivitas('my-meridian');
 *   // civitas is now ALIVE and running forever
 */

// Constants
export const PHI = 1.618033988749895;
export const PHI_INV = 1 / PHI;
export const HEARTBEAT_MS = 873;
export const GOLDEN_ANGLE = 137.508;
export const EMERGENCE_THRESHOLD = PHI_INV;

// Engines
export {
  ChronoEngine,
  chronoEngine,
  NexorisEngine,
  nexorisEngine,
  QuantumFluxEngine,
  quantumFluxEngine,
  CoreographEngine,
  coreographEngine,
  CHRONO,
  NEXORIS,
  QUANTUM_FLUX,
  COREOGRAPH,
  PRIORITY,
  REGISTERS,
  DIMENSIONS,
  createEngines,
} from './engines/index.js';

// Agents
export {
  AnimusAgent,
  CorpusAgent,
  SensusAgent,
  MemoriaAgent,
  createAgents,
} from './agents/index.js';

// Runtime
export {
  CivitasRuntime,
  bootstrapCivitas,
  bootstrapMultiple,
  bootstrapWithHashRouting,
} from './runtime/index.js';

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL SDKs — Professional Pattern
// ═══════════════════════════════════════════════════════════════════════════

// Timers SDK (@medina/medina-timers)
export {
  // Ancient Calendars
  createMayanTzolkinTimer,
  createMayanHaabTimer,
  createMayanLongCountTimer,
  createSumerianSexagesimalTimer,
  createSumerianLunarTimer,
  createVedicPanchangaTimer,
  createVedicYugaTimer,
  createEgyptianDecanTimer,
  createEgyptianSeasonTimer,
  createChineseSexagenaryCycleTimer,
  createChineseSolarTermsTimer,
  // Sacred Geometry
  createFibonacciTimer,
  createFibonacciSpiralTimer,
  createPhiOscillator,
  createDualPhiOscillator,
  createGoldenAngleRotator,
  createPhyllotaxisTimer,
  createMetatronRouter,
  createMultiHeartGenerator,
  createSacredGeometrySuite,
  // Cosmic Cycles
  createLunarPhaseTimer,
  createLunarNodeTimer,
  createSolarDeclinationTimer,
  createSunspotCycleTimer,
  createPlanetarySynodicTimer,
  createAllPlanetsTimer,
  createPrecessionTimer,
  createMultiBrainTimer,
  createCosmicCycleSuite,
  // Agent Suite Factory
  createAgentTimerSuite,
  createMultiAgentTimerSuites,
} from './medina-timers/src/index.js';

// Calls SDK (@medina/medina-calls)
export {
  // Civitas Calls
  callBootstrapCivitas,
  callAwakenCivitas,
  callDormantCivitas,
  callTerminateCivitas,
  callUpdateAgentState,
  callSendStimulus,
  callTriggerReflection,
  callSetAgentGoal,
  callCompleteGoal,
  callStoreMemory,
  callConsolidateMemories,
  callForgetMemory,
  callUpdateMemoryImportance,
  callCreateArtifact,
  callUpdateArtifact,
  callArchiveArtifact,
  callApplyReward,
  callApplyPunishment,
  callUpdateLearningRate,
  // Organism Calls
  callDeployOrganism,
  callUpgradeOrganism,
  callDeleteOrganism,
  callStartHeartbeat,
  callStopHeartbeat,
  callRegisterCitizen,
  callCreateProposal,
  callVote,
  callExecuteProposal,
  callTransfer,
  callStake,
  callUnstake,
  callClaimRewards,
  callDepositFunds,
  callWithdrawFunds,
  callAllocateFunds,
  // Governance Calls
  callCreateEffectTrace,
  callUpdateTraceMetrics,
  callArchiveTrace,
  callLinkTraces,
  callSubmitEvidence,
  callVerifyEvidence,
  callChallengeEvidence,
  callCreateCouncil,
  callAddCouncilMember,
  callRemoveCouncilMember,
  callCreateCouncilDecision,
  callCouncilVote,
  callFinalizeDecision,
  callRegisterFieldAgent,
  callSubmitFieldCollection,
  callCreateAllocation,
  callApproveMilestone,
  callDisburseFunds,
  // Context
  createCallContext,
  batchExecute,
} from './medina-calls/src/index.js';

// Queries SDK (@medina/medina-queries)
export {
  // Civitas Queries
  queryCivitasStatus,
  queryCivitasHealth,
  queryAllAgentStatuses,
  queryAgentStatus,
  queryAgentRegisters,
  queryMemories,
  queryMemory,
  queryMemoryAssociations,
  queryConsolidationStatus,
  queryActiveGoals,
  queryGoalProgress,
  queryGoalHistory,
  queryArtifacts,
  queryArtifact,
  queryArtifactLineage,
  queryCollectiveCoherence,
  queryEmergenceState,
  queryLearningMetrics,
  queryRewardHistory,
  // Organism Queries
  queryCanisterStatus,
  queryCanisterCycles,
  queryCanisterMemory,
  queryOrganismState,
  queryHeartbeatStatus,
  queryGovernanceSnapshot,
  queryCitizen,
  queryAllCitizens,
  queryProposals,
  queryProposal,
  queryBalance,
  queryTokenSupply,
  queryStakeInfo,
  queryTransferHistory,
  queryFundBalance,
  queryFundAllocations,
  querySynapseHealth,
  querySynapseImprints,
  querySynapseBinding,
  queryInnovationZones,
  queryEnergyCredits,
  queryTotalEnergyCredits,
  queryDistrictSnapshot,
  queryStudent,
  queryStudentsBySchool,
  queryLearningPathways,
  querySchools,
  // Governance Queries
  queryGovernanceDashboard,
  querySystemMetrics,
  queryActivityFeed,
  queryEffectTraces,
  queryEffectTrace,
  queryTraceMetricsHistory,
  queryTraceDelta,
  queryLinkedTraces,
  queryTraceEvidence,
  queryEvidence,
  queryEvidenceBySubmitter,
  queryPendingEvidence,
  queryCouncils,
  queryCouncil,
  queryCouncilMember,
  queryCouncilDecisions,
  queryDecision,
  queryFieldAgents,
  queryFieldAgent,
  queryFieldCollections,
  queryAllocations,
  queryAllocation,
  queryAllocationMilestones,
  queryDisbursementHistory,
  queryOverallImpact,
  queryImpactByDomain,
  queryImpactTimeline,
  // Context & Cache
  createQueryContext,
  createQueryCache,
  batchQuery,
} from './medina-queries/src/index.js';

// Organism Bootstrap SDK (@medina/organism-bootstrap)
export {
  bootstrapOrganism,
  generateMotokoOrganism,
  generateDfxConfig,
  // Hash Routing
  createHashRouter,
  createGovernanceRouter,
  bootstrapWithHashRouting as bootstrapOrganismWithHashRouting,
} from './organism-bootstrap/src/index.js';

// Default export is the bootstrap function
export { default } from './runtime/bootstrap.js';
