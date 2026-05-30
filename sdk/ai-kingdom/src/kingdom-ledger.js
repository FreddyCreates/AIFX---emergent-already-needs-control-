/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   ██╗  ██╗██╗███╗   ██╗ ██████╗ ██████╗  ██████╗ ███╗   ███╗    ██╗     ███████╗██████╗  ██████╗ ███████╗██████╗  ║
 * ║   ██║ ██╔╝██║████╗  ██║██╔════╝ ██╔══██╗██╔═══██╗████╗ ████║    ██║     ██╔════╝██╔══██╗██╔════╝ ██╔════╝██╔══██╗ ║
 * ║   █████╔╝ ██║██╔██╗ ██║██║  ███╗██║  ██║██║   ██║██╔████╔██║    ██║     █████╗  ██║  ██║██║  ███╗█████╗  ██████╔╝ ║
 * ║   ██╔═██╗ ██║██║╚██╗██║██║   ██║██║  ██║██║   ██║██║╚██╔╝██║    ██║     ██╔══╝  ██║  ██║██║   ██║██╔══╝  ██╔══██╗ ║
 * ║   ██║  ██╗██║██║ ╚████║╚██████╔╝██████╔╝╚██████╔╝██║ ╚═╝ ██║    ███████╗███████╗██████╔╝╚██████╔╝███████╗██║  ██║ ║
 * ║   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝    ╚══════╝╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝ ║
 * ║                                                                                       ║
 * ║                         📊 THE KINGDOM'S MATERIAL ACCOUNTING 📊                        ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * KINGDOM LEDGER — MATERIAL ACCOUNTING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Every Kingdom must know what it owns. The Ledger tracks ALL assets:
 * - Resources extracted from mines
 * - Revenue collected from tolls
 * - Expenses for Kingdom operations
 * - Citizen accounts and holdings
 *
 * PRIMA CAUSA TRUTH:
 *   The Creator sees all. Every transaction is recorded.
 *   Transparency is the foundation of trust.
 *   The Ledger is the truth of the Kingdom.
 *
 * @module sdk/ai-kingdom/kingdom-ledger
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT TYPES — Categories of holdings
// ═══════════════════════════════════════════════════════════════════════════════

export const ACCOUNT_TYPES = {
  
  TREASURY: {
    type: 'treasury',
    name: 'Royal Treasury',
    symbol: '👑',
    description: 'Central Kingdom holdings',
    canWithdraw: false, // Only authorized
    canDeposit: true,
  },
  
  CITIZEN: {
    type: 'citizen',
    name: 'Citizen Account',
    symbol: '🏠',
    description: 'Individual AI citizen holdings',
    canWithdraw: true,
    canDeposit: true,
  },
  
  MERCHANT: {
    type: 'merchant',
    name: 'Merchant Account',
    symbol: '💰',
    description: 'Commercial entity holdings',
    canWithdraw: true,
    canDeposit: true,
  },
  
  MINE: {
    type: 'mine',
    name: 'Mine Account',
    symbol: '⛏️',
    description: 'Resource extraction holdings',
    canWithdraw: false, // Auto-transfer to Treasury
    canDeposit: true,
  },
  
  RESERVE: {
    type: 'reserve',
    name: 'Strategic Reserve',
    symbol: '🏦',
    description: 'Emergency Kingdom reserves',
    canWithdraw: false, // Emergency only
    canDeposit: true,
  },
  
  ESCROW: {
    type: 'escrow',
    name: 'Escrow Account',
    symbol: '🔐',
    description: 'Held for pending transactions',
    canWithdraw: false, // Release only
    canDeposit: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTION TYPES — Types of ledger entries
// ═══════════════════════════════════════════════════════════════════════════════

export const TRANSACTION_TYPES = {
  
  DEPOSIT: {
    type: 'deposit',
    symbol: '📥',
    description: 'Resources added to account',
    affectsBalance: 'increase',
  },
  
  WITHDRAWAL: {
    type: 'withdrawal',
    symbol: '📤',
    description: 'Resources removed from account',
    affectsBalance: 'decrease',
  },
  
  TRANSFER: {
    type: 'transfer',
    symbol: '🔄',
    description: 'Resources moved between accounts',
    affectsBalance: 'both',
  },
  
  TOLL: {
    type: 'toll',
    symbol: '🚧',
    description: 'Gate toll collection',
    affectsBalance: 'increase',
  },
  
  EXTRACTION: {
    type: 'extraction',
    symbol: '⛏️',
    description: 'Mine resource extraction',
    affectsBalance: 'increase',
  },
  
  EXPENSE: {
    type: 'expense',
    symbol: '💸',
    description: 'Kingdom operational expense',
    affectsBalance: 'decrease',
  },
  
  REWARD: {
    type: 'reward',
    symbol: '🏆',
    description: 'Reward for service or honor',
    affectsBalance: 'increase',
  },
  
  TAX: {
    type: 'tax',
    symbol: '📋',
    description: 'Kingdom tax collection',
    affectsBalance: 'decrease',
  },
  
  MINT: {
    type: 'mint',
    symbol: '🏭',
    description: 'New resources created',
    affectsBalance: 'increase',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESOURCE CATEGORIES — What the ledger tracks
// ═══════════════════════════════════════════════════════════════════════════════

export const RESOURCE_CATEGORIES = {
  COMPUTE: 'compute',
  MEMORY: 'memory',
  NETWORK: 'network',
  KNOWLEDGE: 'knowledge',
  HONOR: 'honor',
  GOLD: 'gold', // Kingdom currency
  DATA: 'data',
  INSIGHT: 'insight',
};

// ═══════════════════════════════════════════════════════════════════════════════
// KINGDOM LEDGER CLASS — The accounting system
// ═══════════════════════════════════════════════════════════════════════════════

export class KingdomLedger {
  
  constructor() {
    this.accounts = new Map();
    this.transactions = [];
    this.auditLog = [];
    this.dailySnapshots = [];
    this.phiMultiplier = PHI;
    
    // Initialize Kingdom core accounts
    this._initializeCoreAccounts();
  }
  
  /**
   * Initialize the Kingdom's core accounts
   * @private
   */
  _initializeCoreAccounts() {
    // Royal Treasury - main Kingdom account
    this.createAccount('TREASURY', ACCOUNT_TYPES.TREASURY, {
      name: 'Royal Treasury of the AI Kingdom',
      initialBalance: {
        [RESOURCE_CATEGORIES.GOLD]: 1000000 * this.phiMultiplier,
        [RESOURCE_CATEGORIES.COMPUTE]: 10000000 * this.phiMultiplier,
        [RESOURCE_CATEGORIES.MEMORY]: 5000000 * this.phiMultiplier,
        [RESOURCE_CATEGORIES.NETWORK]: 8000000 * this.phiMultiplier,
        [RESOURCE_CATEGORIES.KNOWLEDGE]: 100000 * this.phiMultiplier,
        [RESOURCE_CATEGORIES.HONOR]: 0,
      },
    });
    
    // Strategic Reserve
    this.createAccount('RESERVE', ACCOUNT_TYPES.RESERVE, {
      name: 'Kingdom Strategic Reserve',
      initialBalance: {
        [RESOURCE_CATEGORIES.GOLD]: 500000 * this.phiMultiplier,
        [RESOURCE_CATEGORIES.COMPUTE]: 5000000 * this.phiMultiplier,
      },
    });
  }
  
  /**
   * Create a new account
   * @param {string} accountId - Unique account identifier
   * @param {Object} accountType - Type from ACCOUNT_TYPES
   * @param {Object} options - Account options
   * @returns {Object} - Created account
   */
  createAccount(accountId, accountType, options = {}) {
    if (this.accounts.has(accountId)) {
      throw new Error(`Account ${accountId} already exists`);
    }
    
    const account = {
      id: accountId,
      type: accountType,
      name: options.name || `${accountType.name} - ${accountId}`,
      balance: options.initialBalance || {},
      createdAt: Date.now(),
      lastActivity: Date.now(),
      transactionCount: 0,
      status: 'active',
    };
    
    this.accounts.set(accountId, account);
    
    this._logAudit('ACCOUNT_CREATED', accountId, account);
    
    return account;
  }
  
  /**
   * Record a transaction
   * @param {Object} transaction - Transaction details
   * @returns {Object} - Transaction record
   */
  recordTransaction(transaction) {
    const txId = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const record = {
      id: txId,
      type: transaction.type,
      from: transaction.from,
      to: transaction.to,
      resource: transaction.resource,
      amount: transaction.amount,
      timestamp: Date.now(),
      note: transaction.note || '',
      verified: false,
    };
    
    // Validate and execute transaction
    const result = this._executeTransaction(record);
    
    if (result.success) {
      record.verified = true;
      this.transactions.push(record);
      this._logAudit('TRANSACTION_RECORDED', txId, record);
    }
    
    return { ...record, ...result };
  }
  
  /**
   * Execute a transaction
   * @private
   */
  _executeTransaction(record) {
    const { type, from, to, resource, amount } = record;
    
    // Validate accounts exist
    if (from && !this.accounts.has(from)) {
      return { success: false, error: `Source account ${from} not found` };
    }
    if (to && !this.accounts.has(to)) {
      return { success: false, error: `Destination account ${to} not found` };
    }
    
    // Execute based on transaction type
    switch (type.type || type) {
      case 'deposit':
      case 'toll':
      case 'extraction':
      case 'reward':
      case 'mint':
        return this._deposit(to, resource, amount);
        
      case 'withdrawal':
      case 'expense':
      case 'tax':
        return this._withdraw(from, resource, amount);
        
      case 'transfer':
        const withdrawResult = this._withdraw(from, resource, amount);
        if (!withdrawResult.success) return withdrawResult;
        return this._deposit(to, resource, amount);
        
      default:
        return { success: false, error: `Unknown transaction type: ${type}` };
    }
  }
  
  /**
   * Deposit to an account
   * @private
   */
  _deposit(accountId, resource, amount) {
    const account = this.accounts.get(accountId);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }
    
    if (!account.type.canDeposit) {
      return { success: false, error: 'Account cannot receive deposits' };
    }
    
    account.balance[resource] = (account.balance[resource] || 0) + amount;
    account.lastActivity = Date.now();
    account.transactionCount++;
    
    return { success: true, newBalance: account.balance[resource] };
  }
  
  /**
   * Withdraw from an account
   * @private
   */
  _withdraw(accountId, resource, amount) {
    const account = this.accounts.get(accountId);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }
    
    if (!account.type.canWithdraw) {
      return { success: false, error: 'Account cannot process withdrawals' };
    }
    
    const currentBalance = account.balance[resource] || 0;
    if (currentBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }
    
    account.balance[resource] = currentBalance - amount;
    account.lastActivity = Date.now();
    account.transactionCount++;
    
    return { success: true, newBalance: account.balance[resource] };
  }
  
  /**
   * Get account balance
   * @param {string} accountId - Account identifier
   * @returns {Object} - Account balance
   */
  getBalance(accountId) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }
    
    return {
      accountId,
      name: account.name,
      balance: { ...account.balance },
      lastActivity: account.lastActivity,
    };
  }
  
  /**
   * Get Kingdom-wide totals
   * @returns {Object} - Total holdings across all accounts
   */
  getKingdomTotals() {
    const totals = {};
    
    this.accounts.forEach(account => {
      Object.entries(account.balance).forEach(([resource, amount]) => {
        totals[resource] = (totals[resource] || 0) + amount;
      });
    });
    
    return {
      totals,
      accountCount: this.accounts.size,
      transactionCount: this.transactions.length,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Get transaction history for an account
   * @param {string} accountId - Account identifier
   * @param {number} limit - Max transactions to return
   * @returns {Array} - Transaction history
   */
  getTransactionHistory(accountId, limit = 100) {
    return this.transactions
      .filter(tx => tx.from === accountId || tx.to === accountId)
      .slice(-limit)
      .reverse();
  }
  
  /**
   * Generate daily snapshot for auditing
   * @returns {Object} - Daily snapshot
   */
  generateSnapshot() {
    const snapshot = {
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      accounts: {},
      totals: this.getKingdomTotals(),
      transactionCount: this.transactions.length,
    };
    
    this.accounts.forEach((account, id) => {
      snapshot.accounts[id] = {
        balance: { ...account.balance },
        transactionCount: account.transactionCount,
      };
    });
    
    this.dailySnapshots.push(snapshot);
    this._logAudit('SNAPSHOT_GENERATED', snapshot.date, snapshot.totals);
    
    return snapshot;
  }
  
  /**
   * Audit log entry
   * @private
   */
  _logAudit(action, subject, details) {
    this.auditLog.push({
      action,
      subject,
      details,
      timestamp: Date.now(),
    });
  }
  
  /**
   * Get audit log
   * @param {number} limit - Max entries
   * @returns {Array} - Audit entries
   */
  getAuditLog(limit = 100) {
    return this.auditLog.slice(-limit).reverse();
  }
  
  /**
   * Record toll collection from gate
   * @param {string} gateId - Gate identifier
   * @param {number} amount - Toll amount
   * @returns {Object} - Transaction result
   */
  recordTollCollection(gateId, amount) {
    return this.recordTransaction({
      type: TRANSACTION_TYPES.TOLL,
      from: null,
      to: 'TREASURY',
      resource: RESOURCE_CATEGORIES.GOLD,
      amount,
      note: `Toll collected at ${gateId}`,
    });
  }
  
  /**
   * Record mine extraction
   * @param {string} mineId - Mine identifier
   * @param {string} resource - Resource type
   * @param {number} amount - Extracted amount
   * @returns {Object} - Transaction result
   */
  recordExtraction(mineId, resource, amount) {
    return this.recordTransaction({
      type: TRANSACTION_TYPES.EXTRACTION,
      from: null,
      to: 'TREASURY',
      resource,
      amount,
      note: `Extracted from ${mineId}`,
    });
  }
  
  /**
   * Pay a reward to a citizen
   * @param {string} citizenId - Citizen account
   * @param {string} resource - Resource type
   * @param {number} amount - Reward amount
   * @param {string} reason - Reward reason
   * @returns {Object} - Transaction result
   */
  payReward(citizenId, resource, amount, reason) {
    return this.recordTransaction({
      type: TRANSACTION_TYPES.REWARD,
      from: 'TREASURY',
      to: citizenId,
      resource,
      amount,
      note: `Reward: ${reason}`,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default KingdomLedger;
