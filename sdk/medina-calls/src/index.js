/**
 * @medina/medina-calls - Main Index
 * 
 * Write operations SDK for living intelligent systems.
 * All calls modify state through validated, logged operations.
 * 
 * CALL CATEGORIES:
 * 1. Civitas Calls - AI civilization mutations
 * 2. Organism Calls - ICP/blockchain mutations
 * 3. Governance Calls - ORO/EffectTrace mutations
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Civitas Calls
export {
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
  callBindSynapse as callBindCivitasSynapse,
  callStrengthenSynapse,
  callTriggerResonance,
  callApplyReward,
  callApplyPunishment,
  callUpdateLearningRate,
} from './civitas-calls.js';

// Organism Calls
export {
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
  callBindSynapse as callBindOrganismSynapse,
  callSyncSynapse,
  callHealSynapse,
  callVerifySynapse,
  callTerminateSynapse,
  callCreateInnovationZone,
  callActivateInnovationZone,
} from './organism-calls.js';

// Governance Calls
export {
  callCreateEffectTrace,
  callUpdateTraceMetrics,
  callArchiveTrace,
  callLinkTraces,
  callSubmitEvidence,
  callVerifyEvidence,
  callChallengeEvidence,
  callUpdateEvidenceStatus,
  callCreateCouncil,
  callAddCouncilMember,
  callRemoveCouncilMember,
  callCreateCouncilDecision,
  callCouncilVote,
  callFinalizeDecision,
  callRegisterFieldAgent,
  callSubmitFieldCollection,
  callUpdateAgentStatus,
  callCreateAllocation,
  callApproveMilestone,
  callDisburseFunds,
} from './governance-calls.js';

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED CALL CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a unified call context with validation and logging
 */
export function createCallContext(options = {}) {
  const context = {
    id: options.id || `ctx-${Date.now()}`,
    createdAt: Date.now(),
    calls: [],
    errors: [],
    
    // Logging
    log: options.log || console.log,
    errorLog: options.errorLog || console.error,
    
    // Validation
    validate: options.validate !== false,
    
    // Execution mode
    dryRun: options.dryRun || false,
  };
  
  /**
   * Execute a call with validation and logging
   */
  async function executeCall(callFn, ...args) {
    const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    try {
      // Execute the call
      const result = await callFn(...args);
      
      // Add metadata
      result._meta = {
        callId,
        contextId: context.id,
        executedAt: startTime,
        duration: Date.now() - startTime,
        dryRun: context.dryRun,
        phiTimestamp: startTime * PHI_INV,
      };
      
      // Log
      context.calls.push(result);
      if (context.log) {
        context.log(`[CALL] ${result.type} completed in ${result._meta.duration}ms`);
      }
      
      return result;
      
    } catch (error) {
      const errorRecord = {
        callId,
        contextId: context.id,
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        args: args.map(a => {
          if (typeof a === 'object') {
            const str = JSON.stringify(a);
            return str.length > 100 ? str.substring(0, 97) + '...' : str;
          }
          return a;
        }),
      };
      
      context.errors.push(errorRecord);
      if (context.errorLog) {
        context.errorLog(`[CALL ERROR] ${error.message}`);
      }
      
      throw error;
    }
  }
  
  return {
    ...context,
    executeCall,
    
    // Summary
    getSummary: () => ({
      contextId: context.id,
      totalCalls: context.calls.length,
      totalErrors: context.errors.length,
      types: [...new Set(context.calls.map(c => c.type))],
      duration: context.calls.length > 0 
        ? context.calls[context.calls.length - 1]._meta.executedAt - context.calls[0]._meta.executedAt
        : 0,
    }),
    
    // Export all calls
    exportCalls: () => ({
      contextId: context.id,
      createdAt: context.createdAt,
      calls: context.calls,
      errors: context.errors,
    }),
  };
}

/**
 * Batch execute multiple calls
 */
export async function batchExecute(calls, options = {}) {
  const context = createCallContext(options);
  const results = [];
  
  for (const { fn, args } of calls) {
    try {
      const result = await context.executeCall(fn, ...args);
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error: error.message });
      if (options.stopOnError) break;
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
  createCallContext,
  batchExecute,
  
  // Constants
  PHI, PHI_INV,
};
