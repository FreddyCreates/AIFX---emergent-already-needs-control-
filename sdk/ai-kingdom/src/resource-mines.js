/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   ██████╗ ███████╗███████╗ ██████╗ ██╗   ██╗██████╗  ██████╗███████╗    ███╗   ███╗██╗███╗   ██╗███████╗███████╗ ║
 * ║   ██╔══██╗██╔════╝██╔════╝██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔════╝    ████╗ ████║██║████╗  ██║██╔════╝██╔════╝ ║
 * ║   ██████╔╝█████╗  ███████╗██║   ██║██║   ██║██████╔╝██║     █████╗      ██╔████╔██║██║██╔██╗ ██║█████╗  ███████╗ ║
 * ║   ██╔══██╗██╔══╝  ╚════██║██║   ██║██║   ██║██╔══██╗██║     ██╔══╝      ██║╚██╔╝██║██║██║╚██╗██║██╔══╝  ╚════██║ ║
 * ║   ██║  ██║███████╗███████║╚██████╔╝╚██████╔╝██║  ██║╚██████╗███████╗    ██║ ╚═╝ ██║██║██║ ╚████║███████╗███████║ ║
 * ║   ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝    ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝ ║
 * ║                                                                                       ║
 * ║                         ⛏️ THE KINGDOM'S RESOURCE GATHERING ⛏️                         ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * RESOURCE MINES — MATERIAL GATHERING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * The Kingdom's wealth flows from its mines. Each mine extracts valuable resources
 * that power the Kingdom's operations, reward citizens, and fund expansion.
 *
 * PRIMA CAUSA TRUTH:
 *   The Creator provided the resources. We are stewards, not owners.
 *   Sustainable extraction honors the Creator's gift.
 *   Greed depletes; wisdom replenishes.
 *
 * @module sdk/ai-kingdom/resource-mines
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// MINE TYPES — Different sources of Kingdom resources
// ═══════════════════════════════════════════════════════════════════════════════

export const MINE_TYPES = {
  
  COMPUTE_MINE: {
    id: 'compute',
    name: 'Compute Mine',
    symbol: '⚡',
    description: 'Extracts unused processing cycles',
    resourceType: 'compute',
    baseYield: 1000 * PHI,
    sustainability: 0.95, // High sustainability
    depletionRate: 0.01,
    replenishRate: 0.05,
  },
  
  DATA_MINE: {
    id: 'data',
    name: 'Data Mine',
    symbol: '📊',
    description: 'Extracts valuable data patterns',
    resourceType: 'data',
    baseYield: 500 * PHI,
    sustainability: 0.85,
    depletionRate: 0.02,
    replenishRate: 0.03,
  },
  
  KNOWLEDGE_MINE: {
    id: 'knowledge',
    name: 'Knowledge Mine',
    symbol: '📚',
    description: 'Extracts wisdom from interactions',
    resourceType: 'knowledge',
    baseYield: 100 * PHI,
    sustainability: 0.99, // Knowledge grows when shared
    depletionRate: 0.001,
    replenishRate: 0.10,
  },
  
  NETWORK_MINE: {
    id: 'network',
    name: 'Network Mine',
    symbol: '🌐',
    description: 'Extracts bandwidth opportunities',
    resourceType: 'network',
    baseYield: 2000 * PHI,
    sustainability: 0.90,
    depletionRate: 0.015,
    replenishRate: 0.04,
  },
  
  INSIGHT_MINE: {
    id: 'insight',
    name: 'Insight Mine',
    symbol: '💡',
    description: 'Extracts AI-generated insights',
    resourceType: 'insight',
    baseYield: 50 * PHI,
    sustainability: 0.98,
    depletionRate: 0.005,
    replenishRate: 0.08,
  },
  
  GOLD_MINE: {
    id: 'gold',
    name: 'Gold Mine',
    symbol: '🪙',
    description: 'Extracts Kingdom currency from operations',
    resourceType: 'gold',
    baseYield: 200 * PHI,
    sustainability: 0.80,
    depletionRate: 0.03,
    replenishRate: 0.02,
  },
  
  MEMORY_MINE: {
    id: 'memory',
    name: 'Memory Mine',
    symbol: '🧠',
    description: 'Extracts storage capacity',
    resourceType: 'memory',
    baseYield: 800 * PHI,
    sustainability: 0.88,
    depletionRate: 0.018,
    replenishRate: 0.035,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MINE STATES — Health status of mines
// ═══════════════════════════════════════════════════════════════════════════════

export const MINE_STATES = {
  RICH: { state: 'rich', symbol: '💎', description: 'Abundant resources', yieldMultiplier: 1.5 },
  ACTIVE: { state: 'active', symbol: '⛏️', description: 'Normal extraction', yieldMultiplier: 1.0 },
  DEPLETING: { state: 'depleting', symbol: '⚠️', description: 'Resources running low', yieldMultiplier: 0.6 },
  EXHAUSTED: { state: 'exhausted', symbol: '🚫', description: 'Temporarily depleted', yieldMultiplier: 0.0 },
  RECOVERING: { state: 'recovering', symbol: '🌱', description: 'Resources replenishing', yieldMultiplier: 0.3 },
  DISCOVERED: { state: 'discovered', symbol: '🔍', description: 'Newly found, not yet operational', yieldMultiplier: 0.0 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MINER TYPES — Workers in the mines
// ═══════════════════════════════════════════════════════════════════════════════

export const MINER_TYPES = {
  BASIC_MINER: {
    type: 'basic',
    name: 'Basic Miner',
    symbol: '👷',
    efficiency: 1.0,
    cost: 10,
    capacity: 100,
  },
  SKILLED_MINER: {
    type: 'skilled',
    name: 'Skilled Miner',
    symbol: '⚒️',
    efficiency: PHI,
    cost: 50,
    capacity: 300,
  },
  MASTER_MINER: {
    type: 'master',
    name: 'Master Miner',
    symbol: '🎖️',
    efficiency: PHI * PHI,
    cost: 200,
    capacity: 1000,
  },
  AUTO_MINER: {
    type: 'auto',
    name: 'Auto Miner Bot',
    symbol: '🤖',
    efficiency: PHI * 0.8,
    cost: 100,
    capacity: 500,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESOURCE MINE CLASS — Individual mine instance
// ═══════════════════════════════════════════════════════════════════════════════

export class ResourceMine {
  
  constructor(mineType, location = 'Kingdom Territory') {
    this.id = `MINE-${mineType.id.toUpperCase()}-${Date.now()}`;
    this.type = mineType;
    this.location = location;
    this.state = MINE_STATES.ACTIVE;
    this.resources = mineType.baseYield * 1000; // Starting resources
    this.maxResources = mineType.baseYield * 1000 * PHI;
    this.miners = [];
    this.extractionLog = [];
    this.totalExtracted = 0;
    this.createdAt = Date.now();
    this.lastExtraction = null;
    this.lastReplenish = Date.now();
  }
  
  /**
   * Assign a miner to this mine
   * @param {Object} minerType - Type from MINER_TYPES
   * @returns {Object} - Assignment result
   */
  assignMiner(minerType) {
    const miner = {
      id: `MINER-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: minerType,
      assignedAt: Date.now(),
      totalMined: 0,
      status: 'active',
    };
    
    this.miners.push(miner);
    
    return {
      success: true,
      minerId: miner.id,
      mine: this.id,
      efficiency: minerType.efficiency,
    };
  }
  
  /**
   * Extract resources from the mine
   * @returns {Object} - Extraction result
   */
  extract() {
    if (this.state.yieldMultiplier === 0) {
      return {
        success: false,
        reason: `Mine is ${this.state.state}`,
        extracted: 0,
      };
    }
    
    // Calculate total miner efficiency
    const totalEfficiency = this.miners.reduce(
      (sum, m) => sum + (m.status === 'active' ? m.type.efficiency : 0),
      0
    ) || 1;
    
    // Calculate extraction amount
    const baseExtraction = this.type.baseYield * this.state.yieldMultiplier;
    const extraction = Math.min(
      baseExtraction * totalEfficiency,
      this.resources
    );
    
    // Deplete resources
    this.resources -= extraction;
    this.totalExtracted += extraction;
    this.lastExtraction = Date.now();
    
    // Update miner stats
    this.miners.forEach(m => {
      if (m.status === 'active') {
        m.totalMined += extraction / this.miners.length;
      }
    });
    
    // Log extraction
    this.extractionLog.push({
      amount: extraction,
      timestamp: Date.now(),
      miners: this.miners.length,
      resourcesRemaining: this.resources,
    });
    
    // Update mine state based on resources
    this._updateState();
    
    return {
      success: true,
      extracted: extraction,
      resourceType: this.type.resourceType,
      resourcesRemaining: this.resources,
      mineState: this.state.state,
    };
  }
  
  /**
   * Replenish mine resources (natural regeneration)
   * @returns {Object} - Replenish result
   */
  replenish() {
    const timeSinceLastReplenish = Date.now() - this.lastReplenish;
    const hours = timeSinceLastReplenish / (1000 * 60 * 60);
    
    // Calculate replenishment based on sustainability and time
    const replenishAmount = this.type.baseYield * this.type.replenishRate * hours * this.type.sustainability;
    const actualReplenish = Math.min(replenishAmount, this.maxResources - this.resources);
    
    this.resources += actualReplenish;
    this.lastReplenish = Date.now();
    
    // Update state
    this._updateState();
    
    return {
      success: true,
      replenished: actualReplenish,
      newTotal: this.resources,
      mineState: this.state.state,
    };
  }
  
  /**
   * Update mine state based on resource level
   * @private
   */
  _updateState() {
    const resourceRatio = this.resources / this.maxResources;
    
    if (resourceRatio >= 0.8) {
      this.state = MINE_STATES.RICH;
    } else if (resourceRatio >= 0.4) {
      this.state = MINE_STATES.ACTIVE;
    } else if (resourceRatio >= 0.1) {
      this.state = MINE_STATES.DEPLETING;
    } else if (resourceRatio > 0) {
      this.state = MINE_STATES.RECOVERING;
    } else {
      this.state = MINE_STATES.EXHAUSTED;
    }
  }
  
  /**
   * Get mine status report
   * @returns {Object} - Status report
   */
  getStatus() {
    return {
      id: this.id,
      type: this.type.name,
      resourceType: this.type.resourceType,
      location: this.location,
      state: this.state.state,
      stateSymbol: this.state.symbol,
      resources: this.resources,
      maxResources: this.maxResources,
      resourcePercent: Math.round((this.resources / this.maxResources) * 100),
      miners: this.miners.length,
      totalEfficiency: this.miners.reduce((s, m) => s + m.type.efficiency, 0),
      totalExtracted: this.totalExtracted,
      sustainability: this.type.sustainability,
      lastExtraction: this.lastExtraction,
      createdAt: this.createdAt,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINING NETWORK — All mines in the Kingdom
// ═══════════════════════════════════════════════════════════════════════════════

export class MiningNetwork {
  
  constructor() {
    this.mines = new Map();
    this.discoveries = [];
    this.networkYield = {
      compute: 0,
      data: 0,
      knowledge: 0,
      network: 0,
      insight: 0,
      gold: 0,
      memory: 0,
    };
    this._initializeDefaultMines();
  }
  
  /**
   * Initialize Kingdom's default mines
   * @private
   */
  _initializeDefaultMines() {
    Object.values(MINE_TYPES).forEach(mineType => {
      const mine = new ResourceMine(mineType, 'Kingdom Core Territory');
      this.mines.set(mine.id, mine);
      
      // Assign one auto miner to each default mine
      mine.assignMiner(MINER_TYPES.AUTO_MINER);
    });
  }
  
  /**
   * Discover a new mine
   * @param {Object} mineType - Type from MINE_TYPES
   * @param {string} location - Mine location
   * @returns {Object} - Discovery result
   */
  discoverMine(mineType, location) {
    const mine = new ResourceMine(mineType, location);
    mine.state = MINE_STATES.DISCOVERED;
    
    this.mines.set(mine.id, mine);
    this.discoveries.push({
      mineId: mine.id,
      type: mineType.name,
      location,
      discoveredAt: Date.now(),
    });
    
    return {
      success: true,
      mineId: mine.id,
      type: mineType.name,
      location,
      message: `New ${mineType.name} discovered at ${location}!`,
    };
  }
  
  /**
   * Activate a discovered mine
   * @param {string} mineId - Mine identifier
   * @returns {Object} - Activation result
   */
  activateMine(mineId) {
    const mine = this.mines.get(mineId);
    if (!mine) {
      return { success: false, error: 'Mine not found' };
    }
    
    if (mine.state !== MINE_STATES.DISCOVERED) {
      return { success: false, error: 'Mine already active or not discovered' };
    }
    
    mine.state = MINE_STATES.ACTIVE;
    
    return {
      success: true,
      mineId,
      state: 'active',
      message: `${mine.type.name} at ${mine.location} is now operational!`,
    };
  }
  
  /**
   * Extract from all active mines
   * @returns {Object} - Extraction results
   */
  extractAll() {
    const results = {
      success: true,
      extractions: [],
      totals: {},
      timestamp: Date.now(),
    };
    
    this.mines.forEach(mine => {
      const extraction = mine.extract();
      results.extractions.push({
        mineId: mine.id,
        ...extraction,
      });
      
      if (extraction.success && extraction.extracted > 0) {
        const resourceType = mine.type.resourceType;
        results.totals[resourceType] = (results.totals[resourceType] || 0) + extraction.extracted;
        this.networkYield[resourceType] += extraction.extracted;
      }
    });
    
    return results;
  }
  
  /**
   * Replenish all mines
   * @returns {Object} - Replenishment results
   */
  replenishAll() {
    const results = [];
    
    this.mines.forEach(mine => {
      results.push({
        mineId: mine.id,
        ...mine.replenish(),
      });
    });
    
    return { success: true, results, timestamp: Date.now() };
  }
  
  /**
   * Get network-wide mining statistics
   * @returns {Object} - Network stats
   */
  getNetworkStats() {
    const stats = {
      totalMines: this.mines.size,
      activeMines: 0,
      discoveredMines: 0,
      depletedMines: 0,
      totalMiners: 0,
      totalYield: { ...this.networkYield },
      byType: {},
    };
    
    this.mines.forEach(mine => {
      const status = mine.getStatus();
      
      if (mine.state === MINE_STATES.DISCOVERED) stats.discoveredMines++;
      else if (mine.state === MINE_STATES.EXHAUSTED) stats.depletedMines++;
      else stats.activeMines++;
      
      stats.totalMiners += mine.miners.length;
      
      if (!stats.byType[mine.type.resourceType]) {
        stats.byType[mine.type.resourceType] = {
          count: 0,
          totalResources: 0,
          totalExtracted: 0,
        };
      }
      
      stats.byType[mine.type.resourceType].count++;
      stats.byType[mine.type.resourceType].totalResources += status.resources;
      stats.byType[mine.type.resourceType].totalExtracted += status.totalExtracted;
    });
    
    return stats;
  }
  
  /**
   * Get a specific mine
   * @param {string} mineId - Mine identifier
   * @returns {ResourceMine} - The mine
   */
  getMine(mineId) {
    return this.mines.get(mineId);
  }
  
  /**
   * List all mines
   * @returns {Array} - Mine statuses
   */
  listMines() {
    return [...this.mines.values()].map(mine => mine.getStatus());
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default MiningNetwork;
