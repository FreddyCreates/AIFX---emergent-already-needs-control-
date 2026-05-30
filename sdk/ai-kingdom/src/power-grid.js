/**
 * Power Grid — AI Kingdom power generation, distribution, and storage
 *
 * The Power Grid provides the energy backbone for the AI Kingdom, managing:
 * - Power generators (solar, thermal recovery, kinetic, external grid)
 * - Battery storage clusters for backup and load smoothing
 * - Sector-based distribution with priority routing
 * - Load balancing and emergency failover
 * - Energy monetization (export surplus to external grids)
 *
 * φ-enhanced: Uses golden ratio for optimal load distribution curves.
 *
 * @module sdk/ai-kingdom/src/power-grid
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// POWER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PowerGenerator — A single power generation unit
 */
export class PowerGenerator {
  
  /**
   * @param {Object} config - Generator configuration
   * @param {string} config.id - Unique identifier
   * @param {string} config.name - Human-readable name
   * @param {string} config.sourceType - Generation source type
   * @param {number} config.maxOutput - Maximum output in Watts
   */
  constructor(config = {}) {
    this.id = config.id || `generator-${Date.now()}`;
    this.name = config.name || 'Power Generator';
    this.sourceType = config.sourceType || 'external_grid';
    this.maxOutput = config.maxOutput || 50000;
    this.currentOutput = 0;
    this.efficiency = config.efficiency || 0.95;
    this.online = false;
    this.faults = [];
    this.totalGenerated = 0; // Wh
    this.createdAt = Date.now();
  }
  
  /**
   * Bring generator online
   * @returns {Object} - Status result
   */
  start() {
    if (this.online) {
      return { success: false, error: 'Generator already online' };
    }
    
    this.online = true;
    this.startedAt = Date.now();
    
    return {
      success: true,
      generatorId: this.id,
      online: true,
      maxOutput: this.maxOutput,
    };
  }
  
  /**
   * Take generator offline
   * @returns {Object} - Status result
   */
  stop() {
    if (!this.online) {
      return { success: false, error: 'Generator already offline' };
    }
    
    this.online = false;
    this.currentOutput = 0;
    
    return {
      success: true,
      generatorId: this.id,
      online: false,
    };
  }
  
  /**
   * Set generator output level
   * @param {number} output - Target output in Watts
   * @returns {Object} - Output result
   */
  setOutput(output) {
    if (!this.online) {
      return { success: false, error: 'Generator is offline' };
    }
    
    const previousOutput = this.currentOutput;
    this.currentOutput = Math.max(0, Math.min(output, this.maxOutput));
    
    // Track total generation (assuming 1 second intervals for simplicity)
    this.totalGenerated += this.currentOutput / 3600;
    
    return {
      success: true,
      generatorId: this.id,
      previousOutput,
      currentOutput: this.currentOutput,
      efficiency: this.efficiency,
      effectiveOutput: Math.round(this.currentOutput * this.efficiency),
    };
  }
  
  /**
   * Report a fault condition
   * @param {string} faultType - Type of fault
   * @param {string} description - Fault description
   * @returns {Object} - Fault result
   */
  reportFault(faultType, description) {
    const fault = {
      id: `FAULT-${Date.now()}`,
      type: faultType,
      description,
      timestamp: Date.now(),
      resolved: false,
    };
    
    this.faults.push(fault);
    
    // Auto-reduce output on fault
    if (this.online) {
      this.currentOutput = Math.min(this.currentOutput, this.maxOutput * 0.5);
    }
    
    return {
      success: true,
      faultId: fault.id,
      outputReduced: true,
      newOutput: this.currentOutput,
    };
  }
  
  /**
   * Get generator status
   * @returns {Object} - Status
   */
  getStatus() {
    const uptime = this.online && this.startedAt ? Date.now() - this.startedAt : 0;
    
    return {
      id: this.id,
      name: this.name,
      sourceType: this.sourceType,
      online: this.online,
      currentOutput: this.currentOutput,
      maxOutput: this.maxOutput,
      efficiency: this.efficiency,
      effectiveOutput: Math.round(this.currentOutput * this.efficiency),
      utilizationPercent: Math.round((this.currentOutput / this.maxOutput) * 100),
      totalGenerated: Math.round(this.totalGenerated),
      uptimeMs: uptime,
      activeFaults: this.faults.filter(f => !f.resolved).length,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATTERY CLUSTER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * BatteryCluster — A group of battery storage units
 */
export class BatteryCluster {
  
  /**
   * @param {Object} config - Battery cluster configuration
   * @param {string} config.id - Unique identifier
   * @param {string} config.name - Human-readable name
   * @param {number} config.capacity - Total capacity in Wh
   * @param {number} config.initialCharge - Initial charge level (0-1)
   */
  constructor(config = {}) {
    this.id = config.id || `battery-${Date.now()}`;
    this.name = config.name || 'Battery Cluster';
    this.capacity = config.capacity || 100000; // 100 kWh default
    this.charge = config.initialCharge || 0.5;
    this.maxChargeRate = config.maxChargeRate || this.capacity * 0.1; // 10% per hour
    this.maxDischargeRate = config.maxDischargeRate || this.capacity * 0.2; // 20% per hour
    this.state = 'idle'; // idle, charging, discharging
    this.cycles = 0;
    this.healthPercent = 100;
    this.createdAt = Date.now();
  }
  
  /**
   * Charge the battery cluster
   * @param {number} power - Charging power in Watts
   * @param {number} durationHours - Duration in hours (default 1)
   * @returns {Object} - Charge result
   */
  charge(power, durationHours = 1) {
    const effectivePower = Math.min(power, this.maxChargeRate);
    const energyWh = effectivePower * durationHours;
    const chargeAdded = energyWh / this.capacity;
    
    const previousCharge = this.charge;
    this.charge = Math.min(0.95, this.charge + chargeAdded * 0.9); // 90% charging efficiency
    this.state = 'charging';
    
    return {
      success: true,
      batteryId: this.id,
      previousCharge: Math.round(previousCharge * 100),
      currentCharge: Math.round(this.charge * 100),
      energyAdded: Math.round(energyWh),
      state: this.state,
    };
  }
  
  /**
   * Discharge the battery cluster
   * @param {number} power - Discharge power in Watts
   * @param {number} durationHours - Duration in hours (default 1)
   * @returns {Object} - Discharge result
   */
  discharge(power, durationHours = 1) {
    const effectivePower = Math.min(power, this.maxDischargeRate);
    const energyWh = effectivePower * durationHours;
    const chargeRemoved = energyWh / this.capacity;
    
    const previousCharge = this.charge;
    this.charge = Math.max(0.20, this.charge - chargeRemoved);
    this.state = 'discharging';
    
    // Track cycles (rough approximation)
    if (previousCharge > 0.5 && this.charge < 0.5) {
      this.cycles += 0.5;
    }
    
    return {
      success: true,
      batteryId: this.id,
      previousCharge: Math.round(previousCharge * 100),
      currentCharge: Math.round(this.charge * 100),
      energyProvided: Math.round(energyWh * 0.95), // 95% discharge efficiency
      state: this.state,
    };
  }
  
  /**
   * Set battery to idle
   * @returns {Object} - Status
   */
  setIdle() {
    this.state = 'idle';
    return {
      success: true,
      batteryId: this.id,
      state: this.state,
    };
  }
  
  /**
   * Get available discharge power
   * @returns {number} - Available power in Watts
   */
  getAvailablePower() {
    const availableEnergy = (this.charge - 0.20) * this.capacity;
    return Math.max(0, Math.min(availableEnergy, this.maxDischargeRate));
  }
  
  /**
   * Get battery status
   * @returns {Object} - Status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      capacity: this.capacity,
      chargePercent: Math.round(this.charge * 100),
      chargeWh: Math.round(this.charge * this.capacity),
      state: this.state,
      availablePower: Math.round(this.getAvailablePower()),
      maxChargeRate: this.maxChargeRate,
      maxDischargeRate: this.maxDischargeRate,
      cycles: Math.round(this.cycles),
      healthPercent: this.healthPercent,
      isLow: this.charge < 0.25,
      isFull: this.charge > 0.90,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POWER SECTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PowerSector — A power consumption zone with priority routing
 */
export class PowerSector {
  
  /**
   * @param {Object} config - Sector configuration
   * @param {string} config.id - Unique identifier
   * @param {string} config.name - Human-readable name
   * @param {number} config.priority - Load priority (0=critical, 4=deferrable)
   * @param {number} config.maxDemand - Maximum demand in Watts
   */
  constructor(config = {}) {
    this.id = config.id || `sector-${Date.now()}`;
    this.name = config.name || 'Power Sector';
    this.priority = config.priority ?? 2; // Default to medium
    this.maxDemand = config.maxDemand || 10000;
    this.currentDemand = 0;
    this.allocated = 0;
    this.isolated = false;
    this.totalConsumed = 0; // Wh
    this.createdAt = Date.now();
  }
  
  /**
   * Set sector power demand
   * @param {number} demand - Demand in Watts
   * @returns {Object} - Demand result
   */
  setDemand(demand) {
    this.currentDemand = Math.max(0, Math.min(demand, this.maxDemand));
    
    return {
      success: true,
      sectorId: this.id,
      demand: this.currentDemand,
      maxDemand: this.maxDemand,
    };
  }
  
  /**
   * Update power allocation from grid
   * @param {number} allocation - Allocated power in Watts
   * @returns {Object} - Allocation result
   */
  updateAllocation(allocation) {
    this.allocated = allocation;
    this.totalConsumed += allocation / 3600; // Track Wh
    
    return {
      success: true,
      sectorId: this.id,
      allocated: this.allocated,
      demand: this.currentDemand,
      satisfied: this.allocated >= this.currentDemand,
      shortfall: Math.max(0, this.currentDemand - this.allocated),
    };
  }
  
  /**
   * Isolate sector (shed load)
   * @returns {Object} - Isolation result
   */
  isolate() {
    this.isolated = true;
    this.allocated = 0;
    
    return {
      success: true,
      sectorId: this.id,
      isolated: true,
    };
  }
  
  /**
   * Restore sector from isolation
   * @returns {Object} - Restore result
   */
  restore() {
    this.isolated = false;
    
    return {
      success: true,
      sectorId: this.id,
      isolated: false,
    };
  }
  
  /**
   * Get sector status
   * @returns {Object} - Status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      priority: this.priority,
      currentDemand: this.currentDemand,
      maxDemand: this.maxDemand,
      allocated: this.allocated,
      isolated: this.isolated,
      satisfied: this.allocated >= this.currentDemand,
      shortfall: Math.max(0, this.currentDemand - this.allocated),
      totalConsumed: Math.round(this.totalConsumed),
      utilizationPercent: Math.round((this.currentDemand / this.maxDemand) * 100),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POWER GRID
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PowerGrid — The main power distribution network
 */
export class PowerGrid {
  
  /**
   * @param {Object} config - Grid configuration
   * @param {string} config.id - Grid identifier
   * @param {string} config.name - Grid name
   */
  constructor(config = {}) {
    this.id = config.id || `grid-${Date.now()}`;
    this.name = config.name || 'Kingdom Power Grid';
    this.generators = new Map();
    this.batteries = new Map();
    this.sectors = new Map();
    this.state = 'normal';
    this.history = [];
    this.monetization = {
      totalExported: 0,
      totalImported: 0,
      revenue: 0,
      costs: 0,
    };
    this.createdAt = Date.now();
  }
  
  /**
   * Add a generator to the grid
   * @param {PowerGenerator} generator - Generator instance
   * @returns {Object} - Add result
   */
  addGenerator(generator) {
    if (this.generators.has(generator.id)) {
      return { success: false, error: 'Generator already in grid' };
    }
    
    this.generators.set(generator.id, generator);
    
    return {
      success: true,
      generatorId: generator.id,
      totalGenerators: this.generators.size,
    };
  }
  
  /**
   * Add a battery cluster to the grid
   * @param {BatteryCluster} battery - Battery cluster instance
   * @returns {Object} - Add result
   */
  addBattery(battery) {
    if (this.batteries.has(battery.id)) {
      return { success: false, error: 'Battery already in grid' };
    }
    
    this.batteries.set(battery.id, battery);
    
    return {
      success: true,
      batteryId: battery.id,
      totalBatteries: this.batteries.size,
    };
  }
  
  /**
   * Add a sector to the grid
   * @param {PowerSector} sector - Sector instance
   * @returns {Object} - Add result
   */
  addSector(sector) {
    if (this.sectors.has(sector.id)) {
      return { success: false, error: 'Sector already in grid' };
    }
    
    this.sectors.set(sector.id, sector);
    
    return {
      success: true,
      sectorId: sector.id,
      totalSectors: this.sectors.size,
    };
  }
  
  /**
   * Calculate total available power
   * @returns {Object} - Power summary
   */
  calculateAvailablePower() {
    let generationPower = 0;
    let batteryPower = 0;
    
    this.generators.forEach(g => {
      if (g.online) {
        generationPower += g.currentOutput * g.efficiency;
      }
    });
    
    this.batteries.forEach(b => {
      batteryPower += b.getAvailablePower();
    });
    
    return {
      generation: Math.round(generationPower),
      battery: Math.round(batteryPower),
      total: Math.round(generationPower + batteryPower),
    };
  }
  
  /**
   * Calculate total demand
   * @returns {Object} - Demand summary
   */
  calculateTotalDemand() {
    let totalDemand = 0;
    let activeSectors = 0;
    
    this.sectors.forEach(s => {
      if (!s.isolated) {
        totalDemand += s.currentDemand;
        activeSectors++;
      }
    });
    
    return {
      total: Math.round(totalDemand),
      activeSectors,
    };
  }
  
  /**
   * Balance loads across the grid using φ-weighted distribution
   * @returns {Object} - Balance result
   */
  balanceLoads() {
    const available = this.calculateAvailablePower();
    const demand = this.calculateTotalDemand();
    
    const loadFactor = available.total > 0 ? demand.total / available.total : 0;
    
    // Collect active sectors
    const activeSectors = [];
    this.sectors.forEach(s => {
      if (!s.isolated) {
        activeSectors.push(s);
      }
    });
    
    // Sort by priority (lower = more important)
    activeSectors.sort((a, b) => a.priority - b.priority);
    
    // φ-weighted allocation
    let remainingPower = available.total;
    const allocations = [];
    
    activeSectors.forEach(sector => {
      const priorityWeight = Math.pow(PHI, -sector.priority);
      let allocation;
      
      if (loadFactor > 1) {
        // Constrained - allocate by priority
        allocation = Math.min(sector.currentDemand, remainingPower * priorityWeight);
      } else {
        // Abundant - full allocation
        allocation = sector.currentDemand;
      }
      
      allocation = Math.min(allocation, remainingPower);
      remainingPower -= allocation;
      
      sector.updateAllocation(allocation);
      allocations.push({
        sectorId: sector.id,
        demand: sector.currentDemand,
        allocated: Math.round(allocation),
        satisfied: allocation >= sector.currentDemand,
      });
    });
    
    // Determine grid state
    this.state = this._calculateState(loadFactor);
    
    // Record history
    this.history.push({
      timestamp: Date.now(),
      available: available.total,
      demand: demand.total,
      loadFactor,
      state: this.state,
    });
    
    if (this.history.length > 1000) {
      this.history = this.history.slice(-500);
    }
    
    return {
      success: true,
      availablePower: available.total,
      totalDemand: demand.total,
      loadFactor: Math.round(loadFactor * 1000) / 1000,
      state: this.state,
      surplus: Math.max(0, available.total - demand.total),
      allocations,
    };
  }
  
  /**
   * Calculate grid state from load factor
   * @private
   */
  _calculateState(loadFactor) {
    let avgBattery = 0;
    if (this.batteries.size > 0) {
      this.batteries.forEach(b => avgBattery += b.charge);
      avgBattery /= this.batteries.size;
    } else {
      avgBattery = 0.5;
    }
    
    if (loadFactor > 1.2 && avgBattery < 0.1) return 'blackout';
    if (loadFactor > 1.1 || avgBattery < 0.15) return 'emergency';
    if (loadFactor > 0.90) return 'critical';
    if (loadFactor > 0.75) return 'constrained';
    if (loadFactor < 0.5) return 'abundant';
    return 'normal';
  }
  
  /**
   * Export surplus energy to external grid
   * @param {number} power - Power to export in Watts
   * @param {number} hours - Duration in hours
   * @returns {Object} - Export result
   */
  exportEnergy(power, hours) {
    const energyKwh = (power * hours) / 1000;
    const pricePerKwh = 0.12 * PHI;
    
    // φ-based volume bonus
    const volumeBonus = energyKwh > 100 ? Math.log(energyKwh) / Math.log(PHI) * 0.01 : 0;
    const revenue = energyKwh * pricePerKwh * (1 + volumeBonus);
    
    this.monetization.totalExported += energyKwh;
    this.monetization.revenue += revenue;
    
    return {
      success: true,
      energyKwh: Math.round(energyKwh * 10) / 10,
      revenue: Math.round(revenue * 100) / 100,
      volumeBonus: Math.round(volumeBonus * 10000) / 100,
      totalExported: Math.round(this.monetization.totalExported),
      totalRevenue: Math.round(this.monetization.revenue * 100) / 100,
    };
  }
  
  /**
   * Import energy from external grid
   * @param {number} power - Power to import in Watts
   * @param {number} hours - Duration in hours
   * @returns {Object} - Import result
   */
  importEnergy(power, hours) {
    const energyKwh = (power * hours) / 1000;
    const pricePerKwh = 0.18 * PHI;
    const cost = energyKwh * pricePerKwh;
    
    this.monetization.totalImported += energyKwh;
    this.monetization.costs += cost;
    
    return {
      success: true,
      energyKwh: Math.round(energyKwh * 10) / 10,
      cost: Math.round(cost * 100) / 100,
      totalImported: Math.round(this.monetization.totalImported),
      totalCosts: Math.round(this.monetization.costs * 100) / 100,
    };
  }
  
  /**
   * Get grid status
   * @returns {Object} - Full grid status
   */
  getStatus() {
    const available = this.calculateAvailablePower();
    const demand = this.calculateTotalDemand();
    
    return {
      id: this.id,
      name: this.name,
      state: this.state,
      generators: {
        total: this.generators.size,
        online: Array.from(this.generators.values()).filter(g => g.online).length,
      },
      batteries: {
        total: this.batteries.size,
        avgCharge: Math.round(this._getAvgBatteryCharge() * 100),
      },
      sectors: {
        total: this.sectors.size,
        active: Array.from(this.sectors.values()).filter(s => !s.isolated).length,
      },
      power: {
        available: available.total,
        demand: demand.total,
        surplus: Math.max(0, available.total - demand.total),
        loadFactor: available.total > 0 ? Math.round((demand.total / available.total) * 1000) / 1000 : 0,
      },
      monetization: {
        netRevenue: Math.round((this.monetization.revenue - this.monetization.costs) * 100) / 100,
        ...this.monetization,
      },
      historyLength: this.history.length,
    };
  }
  
  /**
   * Get average battery charge
   * @private
   */
  _getAvgBatteryCharge() {
    if (this.batteries.size === 0) return 0;
    let sum = 0;
    this.batteries.forEach(b => sum += b.charge);
    return sum / this.batteries.size;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { PHI };
export default PowerGrid;
