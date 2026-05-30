/**
 * @medina/medina-queries - Governance Queries
 * 
 * Read operations for ORO/EffectTrace governance state.
 * These queries do NOT modify state.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query governance dashboard
 */
export async function queryGovernanceDashboard() {
  return {
    query: 'GOVERNANCE_DASHBOARD',
    timestamp: Date.now(),
    sections: {
      activeTraces: true,
      pendingEvidence: true,
      councilDecisions: true,
      recentAllocations: true,
      systemHealth: true,
    },
    timeRange: {
      since: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
    },
  };
}

/**
 * Query system metrics
 */
export async function querySystemMetrics() {
  return {
    query: 'SYSTEM_METRICS',
    timestamp: Date.now(),
    metrics: {
      totalTraces: true,
      totalEvidence: true,
      totalAllocations: true,
      activeCouncils: true,
      activeFieldAgents: true,
      phiResonance: true,
    },
  };
}

/**
 * Query activity feed
 */
export async function queryActivityFeed(filter = {}) {
  return {
    query: 'ACTIVITY_FEED',
    timestamp: Date.now(),
    filter: {
      types: filter.types || ['trace', 'evidence', 'decision', 'allocation'],
      since: filter.since,
      limit: filter.limit || 50,
    },
    sort: { field: 'timestamp', order: 'desc' },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TRACE QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query effect traces
 */
export async function queryEffectTraces(filter = {}) {
  return {
    query: 'EFFECT_TRACES',
    timestamp: Date.now(),
    filter: {
      domain: filter.domain,
      status: filter.status, // 'active', 'archived'
      creator: filter.creator,
      since: filter.since,
      limit: filter.limit || 100,
    },
    sort: filter.sort || { field: 'createdAt', order: 'desc' },
    includeMetricsSummary: true,
  };
}

/**
 * Query single trace
 */
export async function queryEffectTrace(traceId) {
  return {
    query: 'EFFECT_TRACE',
    traceId,
    timestamp: Date.now(),
    includeBaseline: true,
    includeCurrentMetrics: true,
    includeEvidence: true,
    includeLinkedTraces: true,
  };
}

/**
 * Query trace metrics history
 */
export async function queryTraceMetricsHistory(traceId, timeRange = {}) {
  return {
    query: 'TRACE_METRICS_HISTORY',
    traceId,
    timestamp: Date.now(),
    timeRange: {
      since: timeRange.since,
      until: timeRange.until || Date.now(),
      granularity: timeRange.granularity || 'daily',
    },
    includePhiWeighted: true,
  };
}

/**
 * Query trace delta (change from baseline)
 */
export async function queryTraceDelta(traceId) {
  return {
    query: 'TRACE_DELTA',
    traceId,
    timestamp: Date.now(),
    calculatePercentChange: true,
    calculatePhiImpact: true,
    includeStatisticalSignificance: true,
  };
}

/**
 * Query linked traces
 */
export async function queryLinkedTraces(traceId, direction = 'both') {
  return {
    query: 'LINKED_TRACES',
    traceId,
    timestamp: Date.now(),
    direction, // 'parents', 'children', 'both'
    maxDepth: 5,
    includeRelationshipTypes: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query evidence for trace
 */
export async function queryTraceEvidence(traceId, filter = {}) {
  return {
    query: 'TRACE_EVIDENCE',
    traceId,
    timestamp: Date.now(),
    filter: {
      type: filter.type, // 'quantitative', 'qualitative', 'testimonial', 'documentary'
      status: filter.status, // 'pending', 'verified', 'disputed'
      minReliability: filter.minReliability,
      limit: filter.limit || 100,
    },
    sort: filter.sort || { field: 'phiReliability', order: 'desc' },
  };
}

/**
 * Query single evidence
 */
export async function queryEvidence(evidenceId) {
  return {
    query: 'EVIDENCE',
    evidenceId,
    timestamp: Date.now(),
    includeContent: true,
    includeVerifications: true,
    includeChallenges: true,
    includeSubmitter: true,
  };
}

/**
 * Query evidence by submitter
 */
export async function queryEvidenceBySubmitter(submitterId, filter = {}) {
  return {
    query: 'EVIDENCE_BY_SUBMITTER',
    submitterId,
    timestamp: Date.now(),
    filter: {
      status: filter.status,
      since: filter.since,
      limit: filter.limit || 100,
    },
  };
}

/**
 * Query pending evidence
 */
export async function queryPendingEvidence(councilId = null) {
  return {
    query: 'PENDING_EVIDENCE',
    timestamp: Date.now(),
    councilId,
    requiresReview: true,
    sort: { field: 'submittedAt', order: 'asc' },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COUNCIL QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query councils
 */
export async function queryCouncils(domain = null) {
  return {
    query: 'COUNCILS',
    timestamp: Date.now(),
    domain,
    includeMembers: true,
    includePendingDecisions: true,
  };
}

/**
 * Query single council
 */
export async function queryCouncil(councilId) {
  return {
    query: 'COUNCIL',
    councilId,
    timestamp: Date.now(),
    includeMembers: true,
    includeDecisionHistory: true,
    includeQuorumStatus: true,
  };
}

/**
 * Query council member
 */
export async function queryCouncilMember(councilId, memberId) {
  return {
    query: 'COUNCIL_MEMBER',
    councilId,
    memberId,
    timestamp: Date.now(),
    includeVoteHistory: true,
    includeExpertise: true,
  };
}

/**
 * Query council decisions
 */
export async function queryCouncilDecisions(councilId, filter = {}) {
  return {
    query: 'COUNCIL_DECISIONS',
    councilId,
    timestamp: Date.now(),
    filter: {
      status: filter.status, // 'pending', 'approved', 'rejected'
      type: filter.type,
      since: filter.since,
      limit: filter.limit || 100,
    },
    includeVotes: true,
  };
}

/**
 * Query single decision
 */
export async function queryDecision(councilId, decisionId) {
  return {
    query: 'DECISION',
    councilId,
    decisionId,
    timestamp: Date.now(),
    includeVotes: true,
    includeRelatedTraces: true,
    includeRelatedEvidence: true,
    includeOutcome: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD AGENT QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query field agents
 */
export async function queryFieldAgents(filter = {}) {
  return {
    query: 'FIELD_AGENTS',
    timestamp: Date.now(),
    filter: {
      region: filter.region,
      status: filter.status, // 'active', 'inactive', 'suspended'
      expertise: filter.expertise,
      limit: filter.limit || 100,
    },
    includeReliability: true,
    includeCollectionCount: true,
  };
}

/**
 * Query single field agent
 */
export async function queryFieldAgent(agentId) {
  return {
    query: 'FIELD_AGENT',
    agentId,
    timestamp: Date.now(),
    includeCollections: true,
    includeReliabilityHistory: true,
    includeCertifications: true,
  };
}

/**
 * Query field collections
 */
export async function queryFieldCollections(filter = {}) {
  return {
    query: 'FIELD_COLLECTIONS',
    timestamp: Date.now(),
    filter: {
      agentId: filter.agentId,
      traceId: filter.traceId,
      type: filter.type,
      since: filter.since,
      limit: filter.limit || 100,
    },
    includeQuality: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query allocations
 */
export async function queryAllocations(filter = {}) {
  return {
    query: 'ALLOCATIONS',
    timestamp: Date.now(),
    filter: {
      traceId: filter.traceId,
      recipient: filter.recipient,
      status: filter.status, // 'pending', 'active', 'completed'
      since: filter.since,
      limit: filter.limit || 100,
    },
    includeMilestones: true,
    includeDisbursements: true,
  };
}

/**
 * Query single allocation
 */
export async function queryAllocation(allocationId) {
  return {
    query: 'ALLOCATION',
    allocationId,
    timestamp: Date.now(),
    includeMilestones: true,
    includeDisbursements: true,
    includeTrace: true,
  };
}

/**
 * Query allocation milestones
 */
export async function queryAllocationMilestones(allocationId) {
  return {
    query: 'ALLOCATION_MILESTONES',
    allocationId,
    timestamp: Date.now(),
    includeApprovals: true,
    includeProgress: true,
  };
}

/**
 * Query disbursement history
 */
export async function queryDisbursementHistory(allocationId) {
  return {
    query: 'DISBURSEMENT_HISTORY',
    allocationId,
    timestamp: Date.now(),
    includeTimestamps: true,
    includeRecipients: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPACT QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query overall impact
 */
export async function queryOverallImpact(domain = null) {
  return {
    query: 'OVERALL_IMPACT',
    timestamp: Date.now(),
    domain,
    metrics: {
      totalTraces: true,
      positiveOutcomes: true,
      totalAllocated: true,
      livesImpacted: true,
      phiEfficiency: true,
    },
  };
}

/**
 * Query impact by domain
 */
export async function queryImpactByDomain() {
  return {
    query: 'IMPACT_BY_DOMAIN',
    timestamp: Date.now(),
    domains: ['education', 'governance', 'economic', 'social'],
    includeBreakdown: true,
    includeComparison: true,
  };
}

/**
 * Query impact timeline
 */
export async function queryImpactTimeline(timeRange = {}) {
  return {
    query: 'IMPACT_TIMELINE',
    timestamp: Date.now(),
    timeRange: {
      since: timeRange.since || Date.now() - 365 * 24 * 60 * 60 * 1000,
      until: timeRange.until || Date.now(),
      granularity: timeRange.granularity || 'monthly',
    },
    includeProjections: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Dashboard
  queryGovernanceDashboard,
  querySystemMetrics,
  queryActivityFeed,
  // Trace
  queryEffectTraces,
  queryEffectTrace,
  queryTraceMetricsHistory,
  queryTraceDelta,
  queryLinkedTraces,
  // Evidence
  queryTraceEvidence,
  queryEvidence,
  queryEvidenceBySubmitter,
  queryPendingEvidence,
  // Council
  queryCouncils,
  queryCouncil,
  queryCouncilMember,
  queryCouncilDecisions,
  queryDecision,
  // Field Agent
  queryFieldAgents,
  queryFieldAgent,
  queryFieldCollections,
  // Allocation
  queryAllocations,
  queryAllocation,
  queryAllocationMilestones,
  queryDisbursementHistory,
  // Impact
  queryOverallImpact,
  queryImpactByDomain,
  queryImpactTimeline,
};
