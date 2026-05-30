/**
 * PROTO-234: Power Distribution Protocol (PDP)
 * Organism-wide power generation, distribution, storage, and load balancing.
 *
 * The Power Distribution Protocol defines formal rules for:
 * - Power grid topology and sector management
 * - Energy generation from multiple sources (solar, thermal, kinetic)
 * - Battery storage and discharge cycles
 * - Load balancing and priority routing
 * - Emergency power backup and failover
 * - Energy monetization (selling excess to external grids)
 *
 * φ-enhanced: Uses golden ratio for load distribution curves and efficiency optimization.
 *
 * @module protocols/power-distribution-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PROTOCOL_ID = 'PROTO-234';
const PROTOCOL_NAME = 'Power Distribution Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// POWER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const POWER_CONFIG = {
  
  // φ constant
  PHI_CONSTANT: PHI,
  
  // Voltage standards (Volts)
  HIGH_VOLTAGE: 400,
  MEDIUM_VOLTAGE: 230,
  LOW_VOLTAGE: 48,
  LOGIC_VOLTAGE: 3.3,
  
  // Power thresholds (Watts)
  MIN_GRID_POWER: 1000 * PHI,
  MAX_GRID_POWER: 10000000 * PHI,
  CRITICAL_LOAD_THRESHOLD: 0.90,
  WARNING_LOAD_THRESHOLD: 0.75,
  
  // Battery parameters
  BATTERY_MIN_CHARGE: 0.20,
  BATTERY_OPTIMAL_CHARGE: 0.80,
  BATTERY_MAX_CHARGE: 0.95,
  CHARGE_RATE_LIMIT: 0.1, // 10% per hour max
  DISCHARGE_RATE_LIMIT: 0.2, // 20% per hour max
  
  // Efficiency targets
  TRANSMISSION_EFFICIENCY: 0.98,
  CONVERSION_EFFICIENCY: 0.95,
  STORAGE_EFFICIENCY: 0.90,
  
  // Response times (ms)
  LOAD_BALANCE_INTERVAL: 1000,
  EMERGENCY_RESPONSE: 100,
  FAILOVER_TIME: 500,
  
  // Monetization
  EXPORT_PRICE_PER_KWH: 0.12 * PHI,
  IMPORT_PRICE_PER_KWH: 0.18 * PHI,
  
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  
  // Power Generation
  GENERATION_ONLINE: 'generation.online',
  GENERATION_OFFLINE: 'generation.offline',
  GENERATION_OUTPUT: 'generation.output',
  GENERATION_FAULT: 'generation.fault',
  
  // Distribution
  LOAD_REQUEST: 'load.request',
  LOAD_ALLOCATE: 'load.allocate',
  LOAD_DENIED: 'load.denied',
  LOAD_SHED: 'load.shed',
  LOAD_RESTORE: 'load.restore',
  
  // Storage
  BATTERY_CHARGE: 'battery.charge',
  BATTERY_DISCHARGE: 'battery.discharge',
  BATTERY_IDLE: 'battery.idle',
  BATTERY_LOW: 'battery.low',
  BATTERY_FULL: 'battery.full',
  
  // Grid Events
  GRID_STABLE: 'grid.stable',
  GRID_UNSTABLE: 'grid.unstable',
  GRID_BLACKOUT: 'grid.blackout',
  GRID_RECOVERY: 'grid.recovery',
  SECTOR_ISOLATED: 'sector.isolated',
  
  // Monetization
  ENERGY_EXPORT: 'energy.export',
  ENERGY_IMPORT: 'energy.import',
  PRICE_UPDATE: 'price.update',
  
};

// ═══════════════════════════════════════════════════════════════════════════════
// POWER STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const POWER_STATES = {
  ABUNDANT: 'abundant',
  NORMAL: 'normal',
  CONSTRAINED: 'constrained',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency',
  BLACKOUT: 'blackout',
};

export const STATE_TRANSITIONS = {
  [POWER_STATES.ABUNDANT]: [POWER_STATES.NORMAL],
  [POWER_STATES.NORMAL]: [POWER_STATES.ABUNDANT, POWER_STATES.CONSTRAINED],
  [POWER_STATES.CONSTRAINED]: [POWER_STATES.NORMAL, POWER_STATES.CRITICAL],
  [POWER_STATES.CRITICAL]: [POWER_STATES.CONSTRAINED, POWER_STATES.EMERGENCY],
  [POWER_STATES.EMERGENCY]: [POWER_STATES.CRITICAL, POWER_STATES.BLACKOUT],
  [POWER_STATES.BLACKOUT]: [POWER_STATES.EMERGENCY],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATION SOURCES
// ═══════════════════════════════════════════════════════════════════════════════

export const GENERATION_SOURCES = {
  SOLAR: {
    id: 'solar',
    name: 'Solar Array',
    variability: 'high',
    carbonIntensity: 0,
    phi: PHI,
    priority: 1,
  },
  WIND: {
    id: 'wind',
    name: 'Wind Turbine',
    variability: 'high',
    carbonIntensity: 0,
    priority: 2,
  },
  THERMAL_RECOVERY: {
    id: 'thermal_recovery',
    name: 'Thermal Recovery',
    variability: 'medium',
    carbonIntensity: 0,
    priority: 3,
  },
  KINETIC: {
    id: 'kinetic',
    name: 'Kinetic Harvesting',
    variability: 'medium',
    carbonIntensity: 0,
    priority: 4,
  },
  BATTERY: {
    id: 'battery',
    name: 'Battery Storage',
    variability: 'none',
    carbonIntensity: 0,
    priority: 5,
  },
  EXTERNAL_GRID: {
    id: 'grid',
    name: 'External Grid Import',
    variability: 'low',
    carbonIntensity: 0.4,
    priority: 6,
  },
  BACKUP_GENERATOR: {
    id: 'backup',
    name: 'Backup Generator',
    variability: 'low',
    carbonIntensity: 0.6,
    priority: 7,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD PRIORITY CLASSES
// ═══════════════════════════════════════════════════════════════════════════════

export const LOAD_PRIORITIES = {
  CRITICAL: {
    level: 1,
    name: 'Critical',
    shedable: false,
    description: 'Life safety, core computation, security systems',
  },
  HIGH: {
    level: 2,
    name: 'High',
    shedable: false,
    description: 'Primary AI operations, data integrity, cooling',
  },
  MEDIUM: {
    level: 3,
    name: 'Medium',
    shedable: true,
    description: 'Standard operations, networking, storage',
  },
  LOW: {
    level: 4,
    name: 'Low',
    shedable: true,
    description: 'Non-essential services, background tasks',
  },
  DEFERRABLE: {
    level: 5,
    name: 'Deferrable',
    shedable: true,
    description: 'Batch processing, maintenance, optional features',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// φ-ENHANCED POWER CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate optimal load distribution using φ-weighted balancing
 * @param {number} totalPower - Total available power
 * @param {Array} sectors - Sector configurations with demand
 * @returns {Object} - Distribution plan
 */
export function calculateLoadDistribution(totalPower, sectors) {
  const totalDemand = sectors.reduce((sum, s) => sum + s.demand, 0);
  const loadFactor = totalDemand / totalPower;
  
  // φ-weighted priority allocation
  const distribution = sectors.map((sector, index) => {
    const priorityWeight = Math.pow(PHI, -sector.priority);
    const baseAllocation = (sector.demand / totalDemand) * totalPower;
    
    // Adjust by priority when constrained
    let allocation;
    if (loadFactor > 1) {
      const shortfall = totalDemand - totalPower;
      const priorityFactor = priorityWeight / sectors.reduce((sum, s) => sum + Math.pow(PHI, -s.priority), 0);
      allocation = baseAllocation - (shortfall * (1 - priorityFactor));
    } else {
      allocation = sector.demand;
    }
    
    return {
      sectorId: sector.id,
      demand: sector.demand,
      allocated: Math.max(0, Math.round(allocation)),
      shortfall: Math.max(0, sector.demand - allocation),
      priority: sector.priority,
      satisfied: allocation >= sector.demand,
    };
  });
  
  return {
    totalPower,
    totalDemand,
    loadFactor: Math.round(loadFactor * 1000) / 1000,
    constrained: loadFactor > 1,
    distribution,
    unallocated: Math.max(0, totalPower - totalDemand),
  };
}

/**
 * Calculate battery charge/discharge plan using φ curves
 * @param {number} currentCharge - Current charge level (0-1)
 * @param {number} powerBalance - Power surplus (+) or deficit (-)
 * @param {number} batteryCapacity - Total battery capacity in Wh
 * @returns {Object} - Battery action plan
 */
export function calculateBatteryPlan(currentCharge, powerBalance, batteryCapacity) {
  const chargeWh = currentCharge * batteryCapacity;
  
  // φ-enhanced charging curve - slower near full
  const chargeHeadroom = POWER_CONFIG.BATTERY_MAX_CHARGE - currentCharge;
  const dischargeHeadroom = currentCharge - POWER_CONFIG.BATTERY_MIN_CHARGE;
  
  let action = 'idle';
  let rate = 0;
  let targetCharge = currentCharge;
  
  if (powerBalance > 0 && chargeHeadroom > 0) {
    // Surplus power - charge battery
    action = 'charge';
    const maxChargeRate = batteryCapacity * POWER_CONFIG.CHARGE_RATE_LIMIT;
    const phiRate = maxChargeRate * Math.pow(chargeHeadroom / 0.75, 1 / PHI);
    rate = Math.min(powerBalance, phiRate);
    targetCharge = Math.min(POWER_CONFIG.BATTERY_MAX_CHARGE, currentCharge + (rate / batteryCapacity));
  } else if (powerBalance < 0 && dischargeHeadroom > 0) {
    // Power deficit - discharge battery
    action = 'discharge';
    const maxDischargeRate = batteryCapacity * POWER_CONFIG.DISCHARGE_RATE_LIMIT;
    const phiRate = maxDischargeRate * Math.pow(dischargeHeadroom / 0.60, 1 / PHI);
    rate = Math.min(Math.abs(powerBalance), phiRate);
    targetCharge = Math.max(POWER_CONFIG.BATTERY_MIN_CHARGE, currentCharge - (rate / batteryCapacity));
  }
  
  return {
    action,
    currentCharge: Math.round(currentCharge * 100) / 100,
    targetCharge: Math.round(targetCharge * 100) / 100,
    rate: Math.round(rate),
    chargeHeadroom: Math.round(chargeHeadroom * 100) / 100,
    dischargeHeadroom: Math.round(dischargeHeadroom * 100) / 100,
    batteryLow: currentCharge < POWER_CONFIG.BATTERY_MIN_CHARGE + 0.05,
    batteryFull: currentCharge > POWER_CONFIG.BATTERY_MAX_CHARGE - 0.05,
  };
}

/**
 * Calculate transmission efficiency over distance
 * @param {number} power - Power to transmit in Watts
 * @param {number} distance - Distance in meters
 * @param {number} voltage - Transmission voltage
 * @returns {Object} - Transmission calculation
 */
export function calculateTransmissionEfficiency(power, distance, voltage) {
  // Resistance increases with distance, decreases with voltage
  const baseResistance = 0.0001 * distance;
  const current = power / voltage;
  const powerLoss = current * current * baseResistance;
  
  // φ-optimized voltage selection
  const optimalVoltage = Math.sqrt(power * baseResistance * PHI) * 10;
  const actualEfficiency = 1 - (powerLoss / power);
  
  return {
    inputPower: power,
    outputPower: Math.round(power - powerLoss),
    powerLoss: Math.round(powerLoss),
    efficiency: Math.round(actualEfficiency * 10000) / 100,
    suggestedVoltage: Math.round(optimalVoltage),
    currentVoltage: voltage,
    distance,
  };
}

/**
 * Calculate power state from load factor
 * @param {number} loadFactor - Current load factor (demand/supply)
 * @param {number} batteryLevel - Battery charge level
 * @returns {string} - Power state
 */
export function getPowerState(loadFactor, batteryLevel) {
  if (loadFactor > 1.2 && batteryLevel < 0.1) return POWER_STATES.BLACKOUT;
  if (loadFactor > 1.1 || batteryLevel < 0.15) return POWER_STATES.EMERGENCY;
  if (loadFactor > POWER_CONFIG.CRITICAL_LOAD_THRESHOLD) return POWER_STATES.CRITICAL;
  if (loadFactor > POWER_CONFIG.WARNING_LOAD_THRESHOLD) return POWER_STATES.CONSTRAINED;
  if (loadFactor < 0.5) return POWER_STATES.ABUNDANT;
  return POWER_STATES.NORMAL;
}

/**
 * Calculate energy monetization opportunity
 * @param {number} surplus - Power surplus in Watts
 * @param {number} hours - Hours of expected surplus
 * @returns {Object} - Monetization calculation
 */
export function calculateEnergyExport(surplus, hours) {
  const energyKwh = (surplus * hours) / 1000;
  const grossRevenue = energyKwh * POWER_CONFIG.EXPORT_PRICE_PER_KWH;
  
  // φ-based volume discount for large exports
  const volumeBonus = energyKwh > 100 ? Math.log(energyKwh) / Math.log(PHI) * 0.01 : 0;
  const netRevenue = grossRevenue * (1 + volumeBonus);
  
  return {
    surplusWatts: surplus,
    durationHours: hours,
    energyKwh: Math.round(energyKwh * 10) / 10,
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    volumeBonus: Math.round(volumeBonus * 10000) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    pricePerKwh: POWER_CONFIG.EXPORT_PRICE_PER_KWH,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// POWER DISTRIBUTION PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class PowerDistributionProtocol {
  
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.sectors = new Map();
    this.generators = new Map();
    this.batteries = new Map();
    this.messageLog = [];
    this.powerHistory = [];
    this.alerts = [];
  }
  
  /**
   * Get protocol info
   * @returns {Object} - Protocol metadata
   */
  getInfo() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      description: 'Organism-wide power generation, distribution, and storage management',
      config: POWER_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES).length,
      powerStates: Object.keys(POWER_STATES).length,
      generationSources: Object.keys(GENERATION_SOURCES).length,
      loadPriorities: Object.keys(LOAD_PRIORITIES).length,
    };
  }
  
  /**
   * Register a power sector
   * @param {string} sectorId - Sector identifier
   * @param {Object} config - Sector configuration
   * @returns {Object} - Registration result
   */
  registerSector(sectorId, config = {}) {
    if (this.sectors.has(sectorId)) {
      return { success: false, error: 'Sector already registered' };
    }
    
    const sector = {
      id: sectorId,
      name: config.name || sectorId,
      priority: config.priority || LOAD_PRIORITIES.MEDIUM.level,
      maxDemand: config.maxDemand || 10000,
      currentDemand: config.currentDemand || 0,
      allocated: 0,
      state: POWER_STATES.NORMAL,
      isolated: false,
      registeredAt: Date.now(),
    };
    
    this.sectors.set(sectorId, sector);
    this._logMessage(MESSAGE_TYPES.LOAD_REQUEST, sectorId, { demand: sector.currentDemand });
    
    return {
      success: true,
      sectorId,
      state: sector.state,
    };
  }
  
  /**
   * Register a power generator
   * @param {string} generatorId - Generator identifier
   * @param {Object} config - Generator configuration
   * @returns {Object} - Registration result
   */
  registerGenerator(generatorId, config = {}) {
    if (this.generators.has(generatorId)) {
      return { success: false, error: 'Generator already registered' };
    }
    
    const sourceType = config.sourceType || GENERATION_SOURCES.EXTERNAL_GRID.id;
    const source = Object.values(GENERATION_SOURCES).find(s => s.id === sourceType) || GENERATION_SOURCES.EXTERNAL_GRID;
    
    const generator = {
      id: generatorId,
      name: config.name || generatorId,
      source,
      maxOutput: config.maxOutput || 50000,
      currentOutput: config.currentOutput || 0,
      efficiency: config.efficiency || POWER_CONFIG.CONVERSION_EFFICIENCY,
      online: true,
      registeredAt: Date.now(),
    };
    
    this.generators.set(generatorId, generator);
    this._logMessage(MESSAGE_TYPES.GENERATION_ONLINE, generatorId, { 
      output: generator.currentOutput,
      source: source.name,
    });
    
    return {
      success: true,
      generatorId,
      source: source.name,
    };
  }
  
  /**
   * Register a battery storage unit
   * @param {string} batteryId - Battery identifier
   * @param {Object} config - Battery configuration
   * @returns {Object} - Registration result
   */
  registerBattery(batteryId, config = {}) {
    if (this.batteries.has(batteryId)) {
      return { success: false, error: 'Battery already registered' };
    }
    
    const battery = {
      id: batteryId,
      name: config.name || batteryId,
      capacity: config.capacity || 100000, // Wh
      currentCharge: config.currentCharge || 0.5,
      maxChargeRate: config.maxChargeRate || config.capacity * POWER_CONFIG.CHARGE_RATE_LIMIT,
      maxDischargeRate: config.maxDischargeRate || config.capacity * POWER_CONFIG.DISCHARGE_RATE_LIMIT,
      state: 'idle',
      cycles: 0,
      registeredAt: Date.now(),
    };
    
    this.batteries.set(batteryId, battery);
    
    return {
      success: true,
      batteryId,
      chargeLevel: Math.round(battery.currentCharge * 100),
    };
  }
  
  /**
   * Update sector demand
   * @param {string} sectorId - Sector identifier
   * @param {number} demand - Current demand in Watts
   * @returns {Object} - Update result
   */
  updateDemand(sectorId, demand) {
    const sector = this.sectors.get(sectorId);
    if (!sector) {
      return { success: false, error: 'Sector not found' };
    }
    
    sector.currentDemand = demand;
    
    // Recalculate distribution
    const distribution = this._recalculateDistribution();
    const sectorAllocation = distribution.distribution.find(d => d.sectorId === sectorId);
    
    sector.allocated = sectorAllocation ? sectorAllocation.allocated : 0;
    
    return {
      success: true,
      sectorId,
      demand,
      allocated: sector.allocated,
      satisfied: sector.allocated >= demand,
    };
  }
  
  /**
   * Update generator output
   * @param {string} generatorId - Generator identifier
   * @param {number} output - Current output in Watts
   * @returns {Object} - Update result
   */
  updateGeneratorOutput(generatorId, output) {
    const generator = this.generators.get(generatorId);
    if (!generator) {
      return { success: false, error: 'Generator not found' };
    }
    
    generator.currentOutput = Math.min(output, generator.maxOutput);
    this._logMessage(MESSAGE_TYPES.GENERATION_OUTPUT, generatorId, { output });
    
    // Recalculate distribution
    this._recalculateDistribution();
    
    return {
      success: true,
      generatorId,
      output: generator.currentOutput,
    };
  }
  
  /**
   * Trigger load shedding for a sector
   * @param {string} sectorId - Sector identifier
   * @returns {Object} - Shed result
   */
  shedLoad(sectorId) {
    const sector = this.sectors.get(sectorId);
    if (!sector) {
      return { success: false, error: 'Sector not found' };
    }
    
    const priorityConfig = Object.values(LOAD_PRIORITIES).find(p => p.level === sector.priority);
    if (!priorityConfig?.shedable) {
      return { success: false, error: 'Sector cannot be shed due to priority' };
    }
    
    sector.isolated = true;
    sector.allocated = 0;
    this._logMessage(MESSAGE_TYPES.LOAD_SHED, sectorId, { 
      previousDemand: sector.currentDemand 
    });
    this._createAlert(sectorId, 'WARNING', `Load shed: ${sector.name}`);
    
    return {
      success: true,
      sectorId,
      isolated: true,
    };
  }
  
  /**
   * Restore power to a shed sector
   * @param {string} sectorId - Sector identifier
   * @returns {Object} - Restore result
   */
  restoreLoad(sectorId) {
    const sector = this.sectors.get(sectorId);
    if (!sector) {
      return { success: false, error: 'Sector not found' };
    }
    
    sector.isolated = false;
    this._logMessage(MESSAGE_TYPES.LOAD_RESTORE, sectorId, {});
    
    // Recalculate with restored sector
    this._recalculateDistribution();
    
    return {
      success: true,
      sectorId,
      isolated: false,
      allocated: sector.allocated,
    };
  }
  
  /**
   * Recalculate power distribution across all sectors
   * @private
   * @returns {Object} - Distribution result
   */
  _recalculateDistribution() {
    // Calculate total available power
    let totalGeneration = 0;
    this.generators.forEach(g => {
      if (g.online) {
        totalGeneration += g.currentOutput * g.efficiency;
      }
    });
    
    // Calculate total battery power available
    let totalBatteryPower = 0;
    this.batteries.forEach(b => {
      const available = (b.currentCharge - POWER_CONFIG.BATTERY_MIN_CHARGE) * b.capacity;
      totalBatteryPower += Math.max(0, Math.min(available, b.maxDischargeRate));
    });
    
    // Build sector list for distribution
    const activeSectors = [];
    this.sectors.forEach(s => {
      if (!s.isolated) {
        activeSectors.push({
          id: s.id,
          demand: s.currentDemand,
          priority: s.priority,
        });
      }
    });
    
    // Calculate distribution
    const totalPower = totalGeneration + totalBatteryPower;
    const distribution = calculateLoadDistribution(totalPower, activeSectors);
    
    // Update sector allocations
    distribution.distribution.forEach(d => {
      const sector = this.sectors.get(d.sectorId);
      if (sector) {
        sector.allocated = d.allocated;
      }
    });
    
    // Record history
    this.powerHistory.push({
      timestamp: Date.now(),
      totalGeneration,
      totalBatteryPower,
      totalPower,
      totalDemand: distribution.totalDemand,
      loadFactor: distribution.loadFactor,
      state: getPowerState(distribution.loadFactor, this._getAverageBatteryLevel()),
    });
    
    // Keep history bounded
    if (this.powerHistory.length > 10000) {
      this.powerHistory = this.powerHistory.slice(-5000);
    }
    
    return distribution;
  }
  
  /**
   * Get average battery charge level
   * @private
   * @returns {number} - Average charge level
   */
  _getAverageBatteryLevel() {
    if (this.batteries.size === 0) return 0.5;
    let sum = 0;
    this.batteries.forEach(b => sum += b.currentCharge);
    return sum / this.batteries.size;
  }
  
  /**
   * Log a protocol message
   * @private
   */
  _logMessage(type, entityId, data) {
    this.messageLog.push({
      type,
      entityId,
      data,
      timestamp: Date.now(),
    });
    
    if (this.messageLog.length > 10000) {
      this.messageLog = this.messageLog.slice(-5000);
    }
  }
  
  /**
   * Create an alert
   * @private
   */
  _createAlert(entityId, severity, message) {
    this.alerts.push({
      id: `ALERT-${Date.now()}`,
      entityId,
      severity,
      message,
      timestamp: Date.now(),
      acknowledged: false,
    });
  }
  
  /**
   * Get protocol metrics
   * @returns {Object} - Protocol metrics
   */
  getMetrics() {
    let totalGeneration = 0;
    let totalDemand = 0;
    
    this.generators.forEach(g => {
      if (g.online) totalGeneration += g.currentOutput;
    });
    
    this.sectors.forEach(s => {
      if (!s.isolated) totalDemand += s.currentDemand;
    });
    
    const loadFactor = totalGeneration > 0 ? totalDemand / totalGeneration : 0;
    const batteryLevel = this._getAverageBatteryLevel();
    
    return {
      totalSectors: this.sectors.size,
      activeSectors: Array.from(this.sectors.values()).filter(s => !s.isolated).length,
      totalGenerators: this.generators.size,
      onlineGenerators: Array.from(this.generators.values()).filter(g => g.online).length,
      totalBatteries: this.batteries.size,
      totalGeneration: Math.round(totalGeneration),
      totalDemand: Math.round(totalDemand),
      loadFactor: Math.round(loadFactor * 1000) / 1000,
      batteryLevel: Math.round(batteryLevel * 100),
      powerState: getPowerState(loadFactor, batteryLevel),
      alerts: {
        total: this.alerts.length,
        unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
      },
      messageCount: this.messageLog.length,
      historyLength: this.powerHistory.length,
    };
  }
  
  /**
   * Get unacknowledged alerts
   * @returns {Array} - Alerts
   */
  getAlerts() {
    return this.alerts.filter(a => !a.acknowledged);
  }
  
  /**
   * Acknowledge an alert
   * @param {string} alertId - Alert ID
   * @returns {Object} - Acknowledgment result
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return { success: false, error: 'Alert not found' };
    }
    
    alert.acknowledged = true;
    alert.acknowledgedAt = Date.now();
    
    return { success: true, alertId };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  PROTOCOL_ID,
  PROTOCOL_NAME,
  PHI,
};

export default PowerDistributionProtocol;
