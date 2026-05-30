/**
 * @medina/medina-calls - Organism Calls
 * 
 * Write operations for ICP/blockchain organism mutations.
 * These calls interact with Internet Computer canisters.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════
// DEPLOYMENT CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Deploy a new organism canister
 */
export async function callDeployOrganism(config) {
  return {
    type: 'DEPLOY_ORGANISM',
    timestamp: Date.now(),
    canister: {
      name: config.name,
      network: config.network || 'ic', // 'ic', 'local'
      controllers: config.controllers || [],
      cycles: config.cycles || 1_000_000_000_000, // 1T cycles
      phiHeartbeat: config.heartbeat || 873_000_000, // nanoseconds
    },
    modules: {
      main: config.wasmPath,
      candid: config.didPath,
    },
    initArgs: config.initArgs || {},
  };
}

/**
 * Upgrade an organism canister
 */
export async function callUpgradeOrganism(canisterId, config) {
  return {
    type: 'UPGRADE_ORGANISM',
    timestamp: Date.now(),
    canisterId,
    modules: {
      main: config.wasmPath,
      candid: config.didPath,
    },
    preserveState: config.preserveState !== false,
    skipPreupgrade: config.skipPreupgrade || false,
  };
}

/**
 * Delete an organism canister
 */
export async function callDeleteOrganism(canisterId, reason) {
  return {
    type: 'DELETE_ORGANISM',
    timestamp: Date.now(),
    canisterId,
    reason,
    finalizeState: true,
    returnCycles: true,
  };
}

/**
 * Start organism heartbeat timer
 */
export async function callStartHeartbeat(canisterId, intervalNs = 873_000_000) {
  return {
    type: 'START_HEARTBEAT',
    timestamp: Date.now(),
    canisterId,
    intervalNs,
    phiInterval: intervalNs,
  };
}

/**
 * Stop organism heartbeat timer
 */
export async function callStopHeartbeat(canisterId) {
  return {
    type: 'STOP_HEARTBEAT',
    timestamp: Date.now(),
    canisterId,
    gracefulShutdown: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GOVERNANCE CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register a citizen in governance organism
 */
export async function callRegisterCitizen(canisterId, citizenId, options = {}) {
  return {
    type: 'REGISTER_CITIZEN',
    timestamp: Date.now(),
    canisterId,
    citizen: {
      id: citizenId,
      zone: options.zone || 'default',
      initialReputation: PHI_INV,
      initialVoteWeight: PHI_INV,
    },
  };
}

/**
 * Create governance proposal
 */
export async function callCreateProposal(canisterId, proposal) {
  return {
    type: 'CREATE_PROPOSAL',
    timestamp: Date.now(),
    canisterId,
    proposal: {
      title: proposal.title,
      proposer: proposal.proposer,
      category: proposal.category,
      fundAmount: proposal.fundAmount || 0,
      description: proposal.description,
      duration: proposal.duration || 7 * 24 * 60 * 60 * 1_000_000_000, // 7 days in ns
      phiThreshold: PHI_INV, // ~61.8% approval needed
    },
  };
}

/**
 * Vote on proposal
 */
export async function callVote(canisterId, citizenId, proposalId, approve) {
  return {
    type: 'VOTE',
    timestamp: Date.now(),
    canisterId,
    vote: {
      citizenId,
      proposalId,
      approve,
      phiWeighted: true,
    },
  };
}

/**
 * Execute passed proposal
 */
export async function callExecuteProposal(canisterId, proposalId) {
  return {
    type: 'EXECUTE_PROPOSAL',
    timestamp: Date.now(),
    canisterId,
    proposalId,
    verifyPassed: true,
    verifyFunds: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TOKEN CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Transfer tokens
 */
export async function callTransfer(canisterId, from, to, amount) {
  return {
    type: 'TRANSFER',
    timestamp: Date.now(),
    canisterId,
    transfer: {
      from,
      to,
      amount,
      memo: null,
      fee: Math.ceil(amount * PHI_INV * 0.001), // 0.1% phi-weighted fee
    },
  };
}

/**
 * Stake tokens
 */
export async function callStake(canisterId, owner, amount, duration) {
  return {
    type: 'STAKE',
    timestamp: Date.now(),
    canisterId,
    stake: {
      owner,
      amount,
      duration,
      phiMultiplier: 1 + duration / (365 * 24 * 60 * 60 * 1_000_000_000) * PHI_INV,
    },
  };
}

/**
 * Unstake tokens
 */
export async function callUnstake(canisterId, stakeId) {
  return {
    type: 'UNSTAKE',
    timestamp: Date.now(),
    canisterId,
    stakeId,
    applyRewards: true,
  };
}

/**
 * Claim rewards
 */
export async function callClaimRewards(canisterId, owner) {
  return {
    type: 'CLAIM_REWARDS',
    timestamp: Date.now(),
    canisterId,
    owner,
    phiCompound: false,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FUND CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Deposit funds to organism
 */
export async function callDepositFunds(canisterId, amount, source) {
  return {
    type: 'DEPOSIT_FUNDS',
    timestamp: Date.now(),
    canisterId,
    amount,
    source,
    purpose: 'governance-pool',
  };
}

/**
 * Withdraw funds from organism
 */
export async function callWithdrawFunds(canisterId, amount, recipient, reason) {
  return {
    type: 'WITHDRAW_FUNDS',
    timestamp: Date.now(),
    canisterId,
    amount,
    recipient,
    reason,
    requiresProposal: amount > 1_000_000,
  };
}

/**
 * Allocate funds to purpose
 */
export async function callAllocateFunds(canisterId, proposalId, amount, recipient, purpose) {
  return {
    type: 'ALLOCATE_FUNDS',
    timestamp: Date.now(),
    canisterId,
    allocation: {
      proposalId,
      amount,
      recipient,
      purpose,
      phiDistribution: true,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SYN (SYNAPSE BINDING) CALLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bind synapse to organism
 */
export async function callBindSynapse(canisterId, agentId) {
  return {
    type: 'BIND_SYNAPSE',
    timestamp: Date.now(),
    canisterId,
    agentId,
    jobType: 'BIND',
    priority: 0, // CRITICAL
    permanent: true,
  };
}

/**
 * Sync synapse with organism
 */
export async function callSyncSynapse(canisterId, agentId) {
  return {
    type: 'SYNC_SYNAPSE',
    timestamp: Date.now(),
    canisterId,
    agentId,
    jobType: 'SYNC',
    priority: 1, // HIGH
  };
}

/**
 * Heal synapse connection
 */
export async function callHealSynapse(canisterId, agentId, failureClass) {
  return {
    type: 'HEAL_SYNAPSE',
    timestamp: Date.now(),
    canisterId,
    agentId,
    jobType: 'HEAL',
    priority: 0, // CRITICAL
    failureClass,
    recoveryBound: Math.pow(PHI, failureClass),
  };
}

/**
 * Verify synapse integrity
 */
export async function callVerifySynapse(canisterId, agentId) {
  return {
    type: 'VERIFY_SYNAPSE',
    timestamp: Date.now(),
    canisterId,
    agentId,
    jobType: 'VERIFY',
    priority: 2, // MEDIUM
  };
}

/**
 * Terminate synapse connection
 */
export async function callTerminateSynapse(canisterId, agentId, reason) {
  return {
    type: 'TERMINATE_SYNAPSE',
    timestamp: Date.now(),
    canisterId,
    agentId,
    jobType: 'TERMINATE',
    priority: 1, // HIGH
    reason,
    preserveImprint: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INNOVATION ZONE CALLS (Nevada-specific)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create innovation zone
 */
export async function callCreateInnovationZone(canisterId, zone) {
  return {
    type: 'CREATE_INNOVATION_ZONE',
    timestamp: Date.now(),
    canisterId,
    zone: {
      name: zone.name,
      county: zone.county,
      sponsor: zone.sponsor,
      status: 'proposed',
      phiEnergyMultiplier: PHI_INV,
    },
  };
}

/**
 * Activate innovation zone
 */
export async function callActivateInnovationZone(canisterId, zoneId) {
  return {
    type: 'ACTIVATE_INNOVATION_ZONE',
    timestamp: Date.now(),
    canisterId,
    zoneId,
    generateEnergyCredits: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Deployment
  callDeployOrganism,
  callUpgradeOrganism,
  callDeleteOrganism,
  callStartHeartbeat,
  callStopHeartbeat,
  // Governance
  callRegisterCitizen,
  callCreateProposal,
  callVote,
  callExecuteProposal,
  // Token
  callTransfer,
  callStake,
  callUnstake,
  callClaimRewards,
  // Fund
  callDepositFunds,
  callWithdrawFunds,
  callAllocateFunds,
  // SYN
  callBindSynapse,
  callSyncSynapse,
  callHealSynapse,
  callVerifySynapse,
  callTerminateSynapse,
  // Innovation Zone
  callCreateInnovationZone,
  callActivateInnovationZone,
};
