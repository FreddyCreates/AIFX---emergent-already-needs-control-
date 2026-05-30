/**
 * @medina/medina-queries - Organism Queries
 * 
 * Read operations for ICP/blockchain organism state.
 * These queries do NOT modify state.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════
// CANISTER QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query canister status
 */
export async function queryCanisterStatus(canisterId) {
  return {
    query: 'CANISTER_STATUS',
    canisterId,
    timestamp: Date.now(),
    fields: ['status', 'memory', 'cycles', 'controllers', 'moduleHash'],
  };
}

/**
 * Query canister cycles
 */
export async function queryCanisterCycles(canisterId) {
  return {
    query: 'CANISTER_CYCLES',
    canisterId,
    timestamp: Date.now(),
    includeHistory: true,
    projectBurnRate: true,
  };
}

/**
 * Query canister memory usage
 */
export async function queryCanisterMemory(canisterId) {
  return {
    query: 'CANISTER_MEMORY',
    canisterId,
    timestamp: Date.now(),
    breakdown: true,
    includeStable: true,
    includeHeap: true,
  };
}

/**
 * Query organism state
 */
export async function queryOrganismState(canisterId) {
  return {
    query: 'ORGANISM_STATE',
    canisterId,
    timestamp: Date.now(),
    registers: ['cognitive', 'affective', 'somatic', 'sovereign'],
    dimensions: ['awareness', 'coherence', 'resonance', 'entropy'],
    includeBeatCount: true,
  };
}

/**
 * Query heartbeat status
 */
export async function queryHeartbeatStatus(canisterId) {
  return {
    query: 'HEARTBEAT_STATUS',
    canisterId,
    timestamp: Date.now(),
    includeInterval: true,
    includeBeatHistory: true,
    includeNextScheduled: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GOVERNANCE QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query governance snapshot
 */
export async function queryGovernanceSnapshot(canisterId) {
  return {
    query: 'GOVERNANCE_SNAPSHOT',
    canisterId,
    timestamp: Date.now(),
    fields: [
      'beatCount', 'citizenCount', 'activeProposals',
      'fundBalance', 'resonanceScore'
    ],
  };
}

/**
 * Query citizen
 */
export async function queryCitizen(canisterId, citizenId) {
  return {
    query: 'CITIZEN',
    canisterId,
    citizenId,
    timestamp: Date.now(),
    includeReputation: true,
    includeVoteHistory: true,
    includeSyncCount: true,
  };
}

/**
 * Query all citizens
 */
export async function queryAllCitizens(canisterId, filter = {}) {
  return {
    query: 'ALL_CITIZENS',
    canisterId,
    timestamp: Date.now(),
    filter: {
      zone: filter.zone,
      minReputation: filter.minReputation,
      limit: filter.limit || 100,
    },
    sort: filter.sort || { field: 'reputation', order: 'desc' },
  };
}

/**
 * Query proposals
 */
export async function queryProposals(canisterId, statusFilter = null) {
  return {
    query: 'PROPOSALS',
    canisterId,
    timestamp: Date.now(),
    statusFilter, // 'active', 'passed', 'rejected', 'executed'
    includeVoteCounts: true,
    includeTimeRemaining: true,
  };
}

/**
 * Query single proposal
 */
export async function queryProposal(canisterId, proposalId) {
  return {
    query: 'PROPOSAL',
    canisterId,
    proposalId,
    timestamp: Date.now(),
    includeVoteBreakdown: true,
    includeVoters: true,
    includeTimeline: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TOKEN QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query token balance
 */
export async function queryBalance(canisterId, owner) {
  return {
    query: 'BALANCE',
    canisterId,
    owner,
    timestamp: Date.now(),
    includeStaked: true,
    includePending: true,
  };
}

/**
 * Query token supply
 */
export async function queryTokenSupply(canisterId) {
  return {
    query: 'TOKEN_SUPPLY',
    canisterId,
    timestamp: Date.now(),
    breakdown: {
      total: true,
      circulating: true,
      staked: true,
      locked: true,
    },
  };
}

/**
 * Query stake info
 */
export async function queryStakeInfo(canisterId, owner) {
  return {
    query: 'STAKE_INFO',
    canisterId,
    owner,
    timestamp: Date.now(),
    includeRewards: true,
    includeUnlockSchedule: true,
    includePhiMultiplier: true,
  };
}

/**
 * Query transfer history
 */
export async function queryTransferHistory(canisterId, account, filter = {}) {
  return {
    query: 'TRANSFER_HISTORY',
    canisterId,
    account,
    timestamp: Date.now(),
    filter: {
      direction: filter.direction, // 'sent', 'received', 'both'
      since: filter.since,
      until: filter.until,
      limit: filter.limit || 100,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FUND QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query fund balance
 */
export async function queryFundBalance(canisterId) {
  return {
    query: 'FUND_BALANCE',
    canisterId,
    timestamp: Date.now(),
    includeAllocated: true,
    includePending: true,
    includeHistory: true,
  };
}

/**
 * Query fund allocations
 */
export async function queryFundAllocations(canisterId, filter = {}) {
  return {
    query: 'FUND_ALLOCATIONS',
    canisterId,
    timestamp: Date.now(),
    filter: {
      status: filter.status, // 'pending', 'disbursed', 'completed'
      category: filter.category,
      recipient: filter.recipient,
      limit: filter.limit || 100,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SYN QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query synapse health
 */
export async function querySynapseHealth(canisterId) {
  return {
    query: 'SYNAPSE_HEALTH',
    canisterId,
    timestamp: Date.now(),
    fields: ['totalBound', 'lastSyncBeat', 'owner'],
  };
}

/**
 * Query synapse imprints
 */
export async function querySynapseImprints(canisterId) {
  return {
    query: 'SYNAPSE_IMPRINTS',
    canisterId,
    timestamp: Date.now(),
    includeAll: true,
    includeSyncCounts: true,
  };
}

/**
 * Query specific synapse binding
 */
export async function querySynapseBinding(canisterId, agentId) {
  return {
    query: 'SYNAPSE_BINDING',
    canisterId,
    agentId,
    timestamp: Date.now(),
    includeHistory: true,
    includeJobQueue: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INNOVATION ZONE QUERIES (Nevada-specific)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query innovation zones
 */
export async function queryInnovationZones(canisterId, statusFilter = null) {
  return {
    query: 'INNOVATION_ZONES',
    canisterId,
    timestamp: Date.now(),
    statusFilter, // 'proposed', 'active', 'suspended'
    includeEnergyCredits: true,
  };
}

/**
 * Query energy credits
 */
export async function queryEnergyCredits(canisterId, owner = null) {
  return {
    query: 'ENERGY_CREDITS',
    canisterId,
    timestamp: Date.now(),
    owner,
    includeTotal: true,
    includeBySource: true,
  };
}

/**
 * Query total energy credits
 */
export async function queryTotalEnergyCredits(canisterId) {
  return {
    query: 'TOTAL_ENERGY_CREDITS',
    canisterId,
    timestamp: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT QUERIES (Dallas ISD-specific)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query district snapshot
 */
export async function queryDistrictSnapshot(canisterId) {
  return {
    query: 'DISTRICT_SNAPSHOT',
    canisterId,
    timestamp: Date.now(),
    fields: [
      'studentCount', 'educatorCount', 'schoolCount',
      'averageGrowthRate', 'districtResonance'
    ],
  };
}

/**
 * Query student
 */
export async function queryStudent(canisterId, studentId) {
  return {
    query: 'STUDENT',
    canisterId,
    studentId,
    timestamp: Date.now(),
    includeScores: true,
    includePathway: true,
    includeGrowthTrend: true,
  };
}

/**
 * Query students by school
 */
export async function queryStudentsBySchool(canisterId, schoolId, filter = {}) {
  return {
    query: 'STUDENTS_BY_SCHOOL',
    canisterId,
    schoolId,
    timestamp: Date.now(),
    filter: {
      gradeLevel: filter.gradeLevel,
      pathwayId: filter.pathwayId,
      limit: filter.limit || 100,
    },
  };
}

/**
 * Query learning pathways
 */
export async function queryLearningPathways(canisterId, domain = null) {
  return {
    query: 'LEARNING_PATHWAYS',
    canisterId,
    timestamp: Date.now(),
    domain,
    includePrerequisites: true,
    includeOutcomes: true,
  };
}

/**
 * Query schools
 */
export async function querySchools(canisterId, region = null) {
  return {
    query: 'SCHOOLS',
    canisterId,
    timestamp: Date.now(),
    region,
    includeResonance: true,
    includeCounts: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Canister
  queryCanisterStatus,
  queryCanisterCycles,
  queryCanisterMemory,
  queryOrganismState,
  queryHeartbeatStatus,
  // Governance
  queryGovernanceSnapshot,
  queryCitizen,
  queryAllCitizens,
  queryProposals,
  queryProposal,
  // Token
  queryBalance,
  queryTokenSupply,
  queryStakeInfo,
  queryTransferHistory,
  // Fund
  queryFundBalance,
  queryFundAllocations,
  // SYN
  querySynapseHealth,
  querySynapseImprints,
  querySynapseBinding,
  // Innovation Zone
  queryInnovationZones,
  queryEnergyCredits,
  queryTotalEnergyCredits,
  // Student
  queryDistrictSnapshot,
  queryStudent,
  queryStudentsBySchool,
  queryLearningPathways,
  querySchools,
};
