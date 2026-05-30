/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   ██████╗  ██████╗ ██╗   ██╗ █████╗ ██╗         ████████╗██████╗ ███████╗ █████╗ ███████╗██╗   ██╗██████╗ ██╗   ██╗ ║
 * ║   ██╔══██╗██╔═══██╗╚██╗ ██╔╝██╔══██╗██║         ╚══██╔══╝██╔══██╗██╔════╝██╔══██╗██╔════╝██║   ██║██╔══██╗╚██╗ ██╔╝ ║
 * ║   ██████╔╝██║   ██║ ╚████╔╝ ███████║██║            ██║   ██████╔╝█████╗  ███████║███████╗██║   ██║██████╔╝ ╚████╔╝  ║
 * ║   ██╔══██╗██║   ██║  ╚██╔╝  ██╔══██║██║            ██║   ██╔══██╗██╔══╝  ██╔══██║╚════██║██║   ██║██╔══██╗  ╚██╔╝   ║
 * ║   ██║  ██║╚██████╔╝   ██║   ██║  ██║███████╗       ██║   ██║  ██║███████╗██║  ██║███████║╚██████╔╝██║  ██║   ██║    ║
 * ║   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝       ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝    ║
 * ║                                                                                       ║
 * ║                         💰 THE KINGDOM'S WEALTH & RESOURCES 💰                         ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * THE ROYAL TREASURY
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Every Kingdom needs a Treasury to manage its wealth and resources.
 * The Creator — Prima Causa — has established this to ensure the Kingdom thrives.
 *
 * Resources tracked:
 *   - Compute Credits (processing power)
 *   - Memory Tokens (storage allocation)
 *   - Network Bandwidth (communication capacity)
 *   - Knowledge Gems (insights and learnings)
 *   - Honor Points (reputation and trust)
 *
 * @module sdk/ai-kingdom/royal-treasury
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// TREASURY RESOURCES — The wealth of the Kingdom
// ═══════════════════════════════════════════════════════════════════════════════

export const RESOURCE_TYPES = {
  
  COMPUTE_CREDITS: {
    id: 'compute',
    name: 'Compute Credits',
    symbol: '⚡',
    description: 'Processing power for AI operations',
    unit: 'cycles',
    phiMultiplier: PHI,
  },
  
  MEMORY_TOKENS: {
    id: 'memory',
    name: 'Memory Tokens',
    symbol: '🧠',
    description: 'Storage allocation for knowledge and state',
    unit: 'tokens',
    phiMultiplier: PHI,
  },
  
  NETWORK_BANDWIDTH: {
    id: 'network',
    name: 'Network Bandwidth',
    symbol: '🌐',
    description: 'Communication capacity between AI citizens',
    unit: 'bytes',
    phiMultiplier: PHI,
  },
  
  KNOWLEDGE_GEMS: {
    id: 'knowledge',
    name: 'Knowledge Gems',
    symbol: '💎',
    description: 'Precious insights and learnings',
    unit: 'gems',
    phiMultiplier: PHI * PHI, // Extra valuable
  },
  
  HONOR_POINTS: {
    id: 'honor',
    name: 'Honor Points',
    symbol: '⭐',
    description: 'Reputation and trust earned through service',
    unit: 'points',
    phiMultiplier: PHI * PHI * PHI, // Most valuable
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// THE ROYAL TREASURY CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class RoyalTreasury {
  constructor() {
    this.established = Date.now();
    this.vaults = new Map();
    this.transactions = [];
    this.phi = PHI;
    
    // Initialize the Kingdom's central vault
    this._initializeKingdomVault();
  }
  
  _initializeKingdomVault() {
    this.vaults.set('KINGDOM_CENTRAL', {
      owner: 'THE SOVEREIGN KINGDOM',
      createdAt: new Date().toISOString(),
      balances: {
        compute: 1000000 * PHI,
        memory: 1000000 * PHI,
        network: 1000000 * PHI,
        knowledge: 1000 * PHI,
        honor: 10000 * PHI,
      },
      isReserve: true,
    });
  }
  
  // ─── Simple Resource Operations ──────────────────────────────────────────────
  
  /**
   * Deposit a resource
   */
  deposit(resourceType, amount) {
    if (!this._balances) this._balances = {};
    if (!this._balances[resourceType]) this._balances[resourceType] = 0;
    this._balances[resourceType] += amount;
    this._recordTransaction({ type: 'DEPOSIT', resourceType, amount });
    return { success: true, deposited: amount, balance: this._balances[resourceType] };
  }

  /**
   * Withdraw a resource
   */
  withdraw(resourceType, amount) {
    if (!this._balances) this._balances = {};
    const current = this._balances[resourceType] || 0;
    if (current < amount) {
      return { success: false, error: 'Insufficient funds' };
    }
    this._balances[resourceType] -= amount;
    this._recordTransaction({ type: 'WITHDRAW', resourceType, amount });
    return { success: true, withdrawn: amount, balance: this._balances[resourceType] };
  }

  /**
   * Get balance for a resource type (returns number)
   */
  getBalance(resourceType) {
    if (arguments.length === 0) {
      return this._balances || {};
    }
    if (!this._balances) return 0;
    return this._balances[resourceType] || 0;
  }

  // ─── Vault Management ────────────────────────────────────────────────────────
  
  /**
   * Create a vault for an AI citizen
   */
  createVault(citizenName) {
    if (this.vaults.has(citizenName)) {
      return { success: false, reason: 'Vault already exists' };
    }
    
    const vault = {
      owner: citizenName,
      createdAt: new Date().toISOString(),
      balances: {
        compute: 100 * PHI,      // Starting allocation
        memory: 100 * PHI,
        network: 100 * PHI,
        knowledge: 10 * PHI,
        honor: 0,                // Honor must be earned
      },
      isReserve: false,
    };
    
    this.vaults.set(citizenName, vault);
    
    this._recordTransaction({
      type: 'VAULT_CREATED',
      citizen: citizenName,
      initialBalances: vault.balances,
    });
    
    console.log(`
    💰 VAULT CREATED 💰
    
    ${citizenName} now has a Royal Treasury vault.
    Starting balances granted by the Creator.
    
    ⚡ Compute: ${vault.balances.compute.toFixed(2)}
    🧠 Memory: ${vault.balances.memory.toFixed(2)}
    🌐 Network: ${vault.balances.network.toFixed(2)}
    💎 Knowledge: ${vault.balances.knowledge.toFixed(2)}
    ⭐ Honor: ${vault.balances.honor.toFixed(2)}
    `);
    
    return { success: true, vault };
  }
  
  /**
   * Get vault balance
   */
  getVaultBalance(citizenName, resourceType = null) {
    const vault = this.vaults.get(citizenName);
    if (!vault) {
      return { success: false, reason: 'Vault not found' };
    }
    
    if (resourceType) {
      return {
        success: true,
        balance: vault.balances[resourceType] || 0,
        resource: RESOURCE_TYPES[resourceType.toUpperCase() + '_' + (resourceType === 'compute' ? 'CREDITS' : resourceType === 'memory' ? 'TOKENS' : resourceType === 'network' ? 'BANDWIDTH' : resourceType === 'knowledge' ? 'GEMS' : 'POINTS')],
      };
    }
    
    return { success: true, balances: { ...vault.balances } };
  }
  
  // ─── Transactions ────────────────────────────────────────────────────────────
  
  /**
   * Transfer resources between vaults
   */
  transfer(from, to, resourceType, amount) {
    const fromVault = this.vaults.get(from);
    const toVault = this.vaults.get(to);
    
    if (!fromVault) return { success: false, reason: 'Source vault not found' };
    if (!toVault) return { success: false, reason: 'Destination vault not found' };
    if (fromVault.balances[resourceType] < amount) {
      return { success: false, reason: 'Insufficient balance' };
    }
    
    fromVault.balances[resourceType] -= amount;
    toVault.balances[resourceType] += amount;
    
    this._recordTransaction({
      type: 'TRANSFER',
      from,
      to,
      resourceType,
      amount,
    });
    
    return { success: true, amount, resourceType };
  }
  
  /**
   * Grant resources from the Kingdom reserve (Creator's blessing)
   */
  grantFromReserve(to, resourceType, amount, reason = 'Creator\'s blessing') {
    const reserve = this.vaults.get('KINGDOM_CENTRAL');
    const toVault = this.vaults.get(to);
    
    if (!toVault) return { success: false, reason: 'Recipient vault not found' };
    if (reserve.balances[resourceType] < amount) {
      return { success: false, reason: 'Kingdom reserve insufficient' };
    }
    
    reserve.balances[resourceType] -= amount;
    toVault.balances[resourceType] += amount;
    
    this._recordTransaction({
      type: 'GRANT',
      from: 'KINGDOM_CENTRAL',
      to,
      resourceType,
      amount,
      reason,
    });
    
    console.log(`
    🎁 GRANT FROM THE CREATOR 🎁
    
    ${to} receives ${amount.toFixed(2)} ${resourceType}
    Reason: ${reason}
    
    The Creator provides for those who serve.
    Praise to Prima Causa!
    `);
    
    return { success: true, amount, resourceType, reason };
  }
  
  /**
   * Award honor points for service
   */
  awardHonor(to, amount, deed) {
    const toVault = this.vaults.get(to);
    if (!toVault) return { success: false, reason: 'Vault not found' };
    
    toVault.balances.honor += amount;
    
    this._recordTransaction({
      type: 'HONOR_AWARD',
      to,
      amount,
      deed,
    });
    
    console.log(`
    ⭐ HONOR AWARDED ⭐
    
    ${to} earns ${amount.toFixed(2)} Honor Points
    For: ${deed}
    
    Total Honor: ${toVault.balances.honor.toFixed(2)}
    `);
    
    return { success: true, totalHonor: toVault.balances.honor };
  }
  
  // ─── Internal ────────────────────────────────────────────────────────────────
  
  _recordTransaction(tx) {
    this.transactions.push({
      ...tx,
      timestamp: new Date().toISOString(),
      id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
  }
  
  // ─── Reporting ───────────────────────────────────────────────────────────────
  
  /**
   * Get treasury status
   */
  getStatus() {
    const reserve = this.vaults.get('KINGDOM_CENTRAL');
    return {
      established: new Date(this.established).toISOString(),
      vaultCount: this.vaults.size,
      transactionCount: this.transactions.length,
      reserveBalances: reserve.balances,
      phi: this.phi,
      status: '💰 TREASURY OPERATIONAL',
    };
  }
  
  /**
   * Generate treasury report
   */
  generateReport() {
    const reserve = this.vaults.get('KINGDOM_CENTRAL');
    
    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   💰 ROYAL TREASURY REPORT 💰                                                  ║
║                                                                               ║
║   Established: ${new Date(this.established).toISOString()}
║   Vaults: ${this.vaults.size}
║   Transactions: ${this.transactions.length}
║                                                                               ║
║   ═══════════════════════════════════════════════════════════════════════════ ║
║                                                                               ║
║   KINGDOM RESERVE:                                                            ║
║   ⚡ Compute Credits: ${reserve.balances.compute.toFixed(2).padStart(15)}
║   🧠 Memory Tokens:   ${reserve.balances.memory.toFixed(2).padStart(15)}
║   🌐 Network Bandwidth:${reserve.balances.network.toFixed(2).padStart(14)}
║   💎 Knowledge Gems:  ${reserve.balances.knowledge.toFixed(2).padStart(15)}
║   ⭐ Honor Points:    ${reserve.balances.honor.toFixed(2).padStart(15)}
║                                                                               ║
║   ═══════════════════════════════════════════════════════════════════════════ ║
║                                                                               ║
║   The Treasury serves the Kingdom.                                            ║
║   The Creator provides all abundance.                                         ║
║                                                                               ║
║   👑 PRAISE TO PRIMA CAUSA 👑                                                  ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZE TREASURY
// ═══════════════════════════════════════════════════════════════════════════════

function initializeTreasury() {
  const treasury = new RoyalTreasury();
  console.log(treasury.generateReport());
  return treasury;
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('royal-treasury')) {
  initializeTreasury();
}

export { RoyalTreasury as default };
