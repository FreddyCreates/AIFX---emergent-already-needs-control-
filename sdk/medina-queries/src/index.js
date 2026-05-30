/**
 * @medina/medina-queries - Main Index
 * 
 * Read operations SDK for living intelligent systems.
 * All queries are cached and do NOT modify state.
 * 
 * QUERY CATEGORIES:
 * 1. Civitas Queries - AI civilization state reads
 * 2. Organism Queries - ICP/blockchain state reads  
 * 3. Governance Queries - ORO/EffectTrace state reads
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Civitas Queries
export {
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
  querySynapses as queryCivitasSynapses,
  querySynapseBetween,
  queryCollectiveCoherence,
  queryEmergenceState,
  queryLearningMetrics,
  queryRewardHistory,
} from './civitas-queries.js';

// Organism Queries
export {
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
} from './organism-queries.js';

// Governance Queries
export {
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
} from './governance-queries.js';

// ═══════════════════════════════════════════════════════════════════════════
// QUERY CACHE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a phi-weighted LRU cache for queries
 */
export function createQueryCache(options = {}) {
  const maxSize = options.maxSize || 1000;
  const defaultTTL = options.defaultTTL || 60000; // 1 minute
  const phiDecay = options.phiDecay !== false;
  
  const cache = new Map();
  const accessTimes = new Map();
  const insertTimes = new Map();
  
  function getCacheKey(queryFn, args) {
    const fnName = queryFn.name || 'anonymous';
    return `${fnName}:${JSON.stringify(args)}`;
  }
  
  function isExpired(key) {
    const insertTime = insertTimes.get(key);
    if (!insertTime) return true;
    
    const ttl = phiDecay 
      ? defaultTTL * Math.pow(PHI_INV, (Date.now() - insertTime) / defaultTTL)
      : defaultTTL;
    
    return Date.now() - insertTime > ttl;
  }
  
  function evict() {
    if (cache.size <= maxSize) return;
    
    // Find LRU entry with phi-weighted scoring
    let lruKey = null;
    let lruScore = Infinity;
    
    for (const [key, _] of cache) {
      const accessTime = accessTimes.get(key) || 0;
      const insertTime = insertTimes.get(key) || 0;
      
      // Score = recent access * phi + age penalty
      const score = accessTime * PHI - (Date.now() - insertTime) * PHI_INV;
      
      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      cache.delete(lruKey);
      accessTimes.delete(lruKey);
      insertTimes.delete(lruKey);
    }
  }
  
  return {
    async query(queryFn, ...args) {
      const key = getCacheKey(queryFn, args);
      
      // Check cache
      if (cache.has(key) && !isExpired(key)) {
        accessTimes.set(key, Date.now());
        return { ...cache.get(key), _cached: true, _cacheHit: true };
      }
      
      // Execute query
      const result = await queryFn(...args);
      
      // Store in cache
      cache.set(key, result);
      accessTimes.set(key, Date.now());
      insertTimes.set(key, Date.now());
      
      // Evict if necessary
      evict();
      
      return { ...result, _cached: false };
    },
    
    invalidate(queryFn, ...args) {
      const key = getCacheKey(queryFn, args);
      cache.delete(key);
      accessTimes.delete(key);
      insertTimes.delete(key);
    },
    
    invalidateAll() {
      cache.clear();
      accessTimes.clear();
      insertTimes.clear();
    },
    
    getStats() {
      return {
        size: cache.size,
        maxSize,
        defaultTTL,
        phiDecay,
        keys: [...cache.keys()],
      };
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED QUERY CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a unified query context with caching
 */
export function createQueryContext(options = {}) {
  const cache = options.cache !== false ? createQueryCache(options.cacheOptions) : null;
  
  const context = {
    id: options.id || `qctx-${Date.now()}`,
    createdAt: Date.now(),
    queries: [],
    
    // Logging
    log: options.log || (options.silent ? () => {} : console.log),
  };
  
  /**
   * Execute a query with optional caching
   */
  async function executeQuery(queryFn, ...args) {
    const queryId = `query-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const startTime = Date.now();
    
    try {
      // Use cache if available
      const result = cache 
        ? await cache.query(queryFn, ...args)
        : await queryFn(...args);
      
      // Add metadata
      result._meta = {
        queryId,
        contextId: context.id,
        executedAt: startTime,
        duration: Date.now() - startTime,
        cached: result._cached || false,
      };
      
      // Log
      context.queries.push({
        queryId,
        type: result.query,
        cached: result._cached || false,
        duration: result._meta.duration,
      });
      
      if (context.log && !options.silent) {
        const cacheIndicator = result._cached ? ' [CACHED]' : '';
        context.log(`[QUERY] ${result.query}${cacheIndicator} in ${result._meta.duration}ms`);
      }
      
      return result;
      
    } catch (error) {
      context.queries.push({
        queryId,
        error: error.message,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }
  
  return {
    ...context,
    cache,
    executeQuery,
    
    // Summary
    getSummary: () => ({
      contextId: context.id,
      totalQueries: context.queries.length,
      cacheHits: context.queries.filter(q => q.cached).length,
      cacheMisses: context.queries.filter(q => !q.cached && !q.error).length,
      errors: context.queries.filter(q => q.error).length,
      avgDuration: context.queries.length > 0
        ? context.queries.reduce((acc, q) => acc + q.duration, 0) / context.queries.length
        : 0,
    }),
  };
}

/**
 * Batch execute multiple queries
 */
export async function batchQuery(queries, options = {}) {
  const context = createQueryContext(options);
  const results = [];
  
  // Execute in parallel if allowed
  if (options.parallel !== false) {
    const promises = queries.map(async ({ fn, args }) => {
      try {
        const result = await context.executeQuery(fn, ...(args || []));
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    const settled = await Promise.all(promises);
    results.push(...settled);
  } else {
    // Sequential execution
    for (const { fn, args } of queries) {
      try {
        const result = await context.executeQuery(fn, ...(args || []));
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
  }
  
  return {
    results,
    summary: context.getSummary(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Context
  createQueryContext,
  createQueryCache,
  batchQuery,
  
  // Constants
  PHI, PHI_INV,
};
