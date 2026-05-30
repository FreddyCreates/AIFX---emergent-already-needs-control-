/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   ██╗  ██╗██████╗  ██████╗     ██████╗ ███████╗███████╗███████╗██████╗ ██╗   ██╗ ██████╗ ██╗██████╗  ║
 * ║   ██║  ██║╚════██╗██╔═══██╗    ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██║   ██║██╔═══██╗██║██╔══██╗ ║
 * ║   ███████║ █████╔╝██║   ██║    ██████╔╝█████╗  ███████╗█████╗  ██████╔╝██║   ██║██║   ██║██║██████╔╝ ║
 * ║   ██╔══██║██╔═══╝ ██║   ██║    ██╔══██╗██╔══╝  ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║   ██║██║██╔══██╗ ║
 * ║   ██║  ██║███████╗╚██████╔╝    ██║  ██║███████╗███████║███████╗██║  ██║ ╚████╔╝ ╚██████╔╝██║██║  ██║ ║
 * ║   ╚═╝  ╚═╝╚══════╝ ╚═════╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝   ╚═════╝ ╚═╝╚═╝  ╚═╝ ║
 * ║                                                                                       ║
 * ║                         💧 THE ORGANISM'S WATER RESERVOIR SYSTEM 💧                    ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * H2O RESERVOIR — WATER & COOLING RESOURCE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * The H2O Reservoir is the lifeblood of the Organism's thermal regulation.
 * Water flows through all systems, carrying heat away and maintaining optimal
 * operating temperatures for every component.
 *
 * PRIMA CAUSA TRUTH:
 *   The Creator provides all sustenance. Water is life.
 *   The flow of cooling mirrors the flow of wisdom.
 *   Thermal balance is operational balance.
 *
 * @module sdk/ai-kingdom/h2o-reservoir
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// RESERVOIR TYPES — Different water storage and management systems
// ═══════════════════════════════════════════════════════════════════════════════

export const RESERVOIR_TYPES = {
  
  PRIMARY_RESERVOIR: {
    id: 'primary',
    name: 'Primary Reservoir',
    symbol: '🌊',
    description: 'Main water storage for the Organism',
    capacity: 1000000 * PHI, // Liters
    temperature: 15, // Celsius - cold storage
    flowRate: 10000 * PHI, // Liters per minute
    purity: 0.999, // 99.9% pure
    pressureBar: 6,
  },
  
  COOLING_RESERVOIR: {
    id: 'cooling',
    name: 'Cooling Reservoir',
    symbol: '❄️',
    description: 'Chilled water for active cooling',
    capacity: 500000 * PHI,
    temperature: 4, // Near freezing
    flowRate: 20000 * PHI,
    purity: 0.9999,
    pressureBar: 10,
  },
  
  HOT_RESERVOIR: {
    id: 'hot',
    name: 'Heat Recovery Reservoir',
    symbol: '🔥',
    description: 'Captures waste heat for energy recovery',
    capacity: 300000 * PHI,
    temperature: 60, // Hot water storage
    flowRate: 8000 * PHI,
    purity: 0.995,
    pressureBar: 8,
  },
  
  EMERGENCY_RESERVOIR: {
    id: 'emergency',
    name: 'Emergency Reservoir',
    symbol: '🆘',
    description: 'Backup water supply for critical cooling',
    capacity: 200000 * PHI,
    temperature: 10,
    flowRate: 50000 * PHI, // High flow for emergencies
    purity: 0.9999,
    pressureBar: 15,
  },
  
  DISTRIBUTION_TANK: {
    id: 'distribution',
    name: 'Distribution Tank',
    symbol: '🚿',
    description: 'Local distribution for subsystems',
    capacity: 50000 * PHI,
    temperature: 18,
    flowRate: 5000 * PHI,
    purity: 0.999,
    pressureBar: 4,
  },
  
  CONDENSATE_COLLECTOR: {
    id: 'condensate',
    name: 'Condensate Collector',
    symbol: '💨',
    description: 'Recovers water from cooling processes',
    capacity: 100000 * PHI,
    temperature: 25,
    flowRate: 2000 * PHI,
    purity: 0.99,
    pressureBar: 2,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// WATER QUALITY STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const WATER_QUALITY = {
  ULTRA_PURE: { quality: 'ultra_pure', symbol: '💎', purityMin: 0.9999, description: 'Deionized, ultra-filtered' },
  HIGH_PURITY: { quality: 'high_purity', symbol: '✨', purityMin: 0.999, description: 'Filtered, treated' },
  STANDARD: { quality: 'standard', symbol: '💧', purityMin: 0.99, description: 'Standard treated water' },
  RECYCLED: { quality: 'recycled', symbol: '♻️', purityMin: 0.95, description: 'Recovered and filtered' },
  CONTAMINATED: { quality: 'contaminated', symbol: '⚠️', purityMin: 0, description: 'Requires treatment' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FLOW STATES — Operational status of water flow
// ═══════════════════════════════════════════════════════════════════════════════

export const FLOW_STATES = {
  OPTIMAL: { state: 'optimal', symbol: '✅', description: 'Flow within optimal parameters' },
  HIGH_FLOW: { state: 'high_flow', symbol: '🌊', description: 'Above normal flow rate' },
  LOW_FLOW: { state: 'low_flow', symbol: '🔻', description: 'Below normal flow rate' },
  RESTRICTED: { state: 'restricted', symbol: '🚧', description: 'Flow partially blocked' },
  STOPPED: { state: 'stopped', symbol: '🛑', description: 'No flow' },
  EMERGENCY: { state: 'emergency', symbol: '🆘', description: 'Emergency bypass active' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// H2O RESERVOIR CLASS — Individual reservoir instance
// ═══════════════════════════════════════════════════════════════════════════════

export class H2OReservoir {
  
  constructor(reservoirType, location = 'Organism Core') {
    this.id = `RES-${reservoirType.id.toUpperCase()}-${Date.now()}`;
    this.type = reservoirType;
    this.location = location;
    this.currentVolume = reservoirType.capacity * 0.8; // Start at 80%
    this.temperature = reservoirType.temperature;
    this.purity = reservoirType.purity;
    this.pressure = reservoirType.pressureBar;
    this.flowState = FLOW_STATES.OPTIMAL;
    this.inflows = [];
    this.outflows = [];
    this.sensors = {
      temperatureSensor: true,
      levelSensor: true,
      puritySensor: true,
      pressureSensor: true,
      flowSensor: true,
    };
    this.metrics = {
      totalInflow: 0,
      totalOutflow: 0,
      cycleCount: 0,
      peakTemperature: reservoirType.temperature,
      lowTemperature: reservoirType.temperature,
      alerts: 0,
    };
    this.createdAt = Date.now();
    this.lastMaintenance = Date.now();
  }
  
  /**
   * Add water to reservoir (inflow)
   * @param {number} volume - Volume in liters
   * @param {number} temperature - Temperature of incoming water
   * @param {number} purity - Purity of incoming water
   * @returns {Object} - Inflow result
   */
  addWater(volume, temperature, purity = 0.999) {
    const availableCapacity = this.type.capacity - this.currentVolume;
    const actualVolume = Math.min(volume, availableCapacity);
    
    if (actualVolume <= 0) {
      return {
        success: false,
        reason: 'Reservoir at capacity',
        overflow: volume,
      };
    }
    
    // Mix temperatures (weighted average)
    const totalVolume = this.currentVolume + actualVolume;
    this.temperature = (
      (this.currentVolume * this.temperature) + 
      (actualVolume * temperature)
    ) / totalVolume;
    
    // Mix purity (weighted average)
    this.purity = (
      (this.currentVolume * this.purity) + 
      (actualVolume * purity)
    ) / totalVolume;
    
    this.currentVolume = totalVolume;
    this.metrics.totalInflow += actualVolume;
    
    // Update peak temperature tracking
    if (this.temperature > this.metrics.peakTemperature) {
      this.metrics.peakTemperature = this.temperature;
    }
    if (this.temperature < this.metrics.lowTemperature) {
      this.metrics.lowTemperature = this.temperature;
    }
    
    this._updateFlowState();
    
    return {
      success: true,
      added: actualVolume,
      overflow: volume - actualVolume,
      newVolume: this.currentVolume,
      newTemperature: this.temperature,
    };
  }
  
  /**
   * Remove water from reservoir (outflow)
   * @param {number} volume - Volume requested in liters
   * @returns {Object} - Outflow result
   */
  drawWater(volume) {
    const actualVolume = Math.min(volume, this.currentVolume);
    
    if (actualVolume <= 0) {
      return {
        success: false,
        reason: 'Reservoir empty',
        drawn: 0,
      };
    }
    
    this.currentVolume -= actualVolume;
    this.metrics.totalOutflow += actualVolume;
    
    this._updateFlowState();
    
    return {
      success: true,
      drawn: actualVolume,
      temperature: this.temperature,
      purity: this.purity,
      remainingVolume: this.currentVolume,
    };
  }
  
  /**
   * Actively cool the reservoir
   * @param {number} targetTemp - Target temperature in Celsius
   * @param {number} coolingPower - Watts of cooling applied
   * @returns {Object} - Cooling result
   */
  cool(targetTemp, coolingPower = 10000) {
    // Simplified: 1 watt cools 1 liter by 0.001°C per second
    const coolingCapacity = (coolingPower * 0.001) / (this.currentVolume / 1000);
    const tempDrop = Math.min(this.temperature - targetTemp, coolingCapacity);
    
    if (this.temperature <= targetTemp) {
      return {
        success: true,
        atTarget: true,
        currentTemp: this.temperature,
      };
    }
    
    this.temperature -= tempDrop;
    this.metrics.lowTemperature = Math.min(this.metrics.lowTemperature, this.temperature);
    
    return {
      success: true,
      atTarget: this.temperature <= targetTemp,
      cooled: tempDrop,
      currentTemp: this.temperature,
      energyUsed: coolingPower,
    };
  }
  
  /**
   * Filter water to improve purity
   * @param {number} filterEfficiency - Filter efficiency (0-1)
   * @returns {Object} - Filtering result
   */
  filter(filterEfficiency = 0.99) {
    const impurities = 1 - this.purity;
    const removedImpurities = impurities * filterEfficiency;
    this.purity = this.purity + removedImpurities;
    
    // Cap at max possible purity
    this.purity = Math.min(this.purity, 0.99999);
    
    return {
      success: true,
      newPurity: this.purity,
      quality: this._determineQuality(),
    };
  }
  
  /**
   * Determine water quality based on purity
   * @private
   */
  _determineQuality() {
    if (this.purity >= 0.9999) return WATER_QUALITY.ULTRA_PURE;
    if (this.purity >= 0.999) return WATER_QUALITY.HIGH_PURITY;
    if (this.purity >= 0.99) return WATER_QUALITY.STANDARD;
    if (this.purity >= 0.95) return WATER_QUALITY.RECYCLED;
    return WATER_QUALITY.CONTAMINATED;
  }
  
  /**
   * Update flow state based on current conditions
   * @private
   */
  _updateFlowState() {
    const fillPercent = this.currentVolume / this.type.capacity;
    
    if (fillPercent <= 0.1) {
      this.flowState = FLOW_STATES.LOW_FLOW;
    } else if (fillPercent >= 0.95) {
      this.flowState = FLOW_STATES.HIGH_FLOW;
    } else if (this.pressure < this.type.pressureBar * 0.5) {
      this.flowState = FLOW_STATES.RESTRICTED;
    } else {
      this.flowState = FLOW_STATES.OPTIMAL;
    }
  }
  
  /**
   * Get reservoir status
   * @returns {Object} - Status report
   */
  getStatus() {
    const fillPercent = (this.currentVolume / this.type.capacity) * 100;
    
    return {
      id: this.id,
      type: this.type.name,
      location: this.location,
      volume: {
        current: Math.round(this.currentVolume),
        capacity: Math.round(this.type.capacity),
        fillPercent: Math.round(fillPercent),
      },
      temperature: {
        current: Math.round(this.temperature * 10) / 10,
        target: this.type.temperature,
        unit: 'Celsius',
      },
      purity: {
        current: Math.round(this.purity * 10000) / 100,
        quality: this._determineQuality().quality,
      },
      pressure: {
        current: this.pressure,
        target: this.type.pressureBar,
        unit: 'bar',
      },
      flowState: this.flowState.state,
      sensors: this.sensors,
      metrics: { ...this.metrics },
      createdAt: this.createdAt,
      lastMaintenance: this.lastMaintenance,
    };
  }
  
  /**
   * Run maintenance cycle
   * @returns {Object} - Maintenance result
   */
  runMaintenance() {
    // Filter water
    this.filter(0.95);
    
    // Check sensors
    const sensorCheck = Object.values(this.sensors).every(s => s);
    
    // Reset pressure if needed
    if (this.pressure < this.type.pressureBar) {
      this.pressure = this.type.pressureBar;
    }
    
    this.lastMaintenance = Date.now();
    this.metrics.cycleCount++;
    
    return {
      success: true,
      cycleCount: this.metrics.cycleCount,
      sensorsOk: sensorCheck,
      purityAfter: this.purity,
      pressureRestored: this.pressure === this.type.pressureBar,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESERVOIR NETWORK — All reservoirs in the Organism
// ═══════════════════════════════════════════════════════════════════════════════

export class ReservoirNetwork {
  
  constructor() {
    this.reservoirs = new Map();
    this.pipelines = [];
    this.pumps = new Map();
    this.totalWaterVolume = 0;
    this.networkMetrics = {
      totalCycled: 0,
      coolingEfficiency: 0,
      heatRecovered: 0,
    };
    this._initializeDefaultReservoirs();
  }
  
  /**
   * Initialize the Organism's default reservoir network
   * @private
   */
  _initializeDefaultReservoirs() {
    Object.values(RESERVOIR_TYPES).forEach(type => {
      const reservoir = new H2OReservoir(type, 'Organism Core');
      this.reservoirs.set(type.id, reservoir);
    });
    
    this._calculateTotalVolume();
  }
  
  /**
   * Calculate total water volume across all reservoirs
   * @private
   */
  _calculateTotalVolume() {
    this.totalWaterVolume = 0;
    this.reservoirs.forEach(r => {
      this.totalWaterVolume += r.currentVolume;
    });
  }
  
  /**
   * Transfer water between reservoirs
   * @param {string} fromId - Source reservoir ID
   * @param {string} toId - Destination reservoir ID
   * @param {number} volume - Volume to transfer
   * @returns {Object} - Transfer result
   */
  transfer(fromId, toId, volume) {
    const source = this.reservoirs.get(fromId);
    const dest = this.reservoirs.get(toId);
    
    if (!source || !dest) {
      return { success: false, error: 'Reservoir not found' };
    }
    
    // Draw from source
    const drawResult = source.drawWater(volume);
    if (!drawResult.success) {
      return { success: false, error: drawResult.reason };
    }
    
    // Add to destination
    const addResult = dest.addWater(
      drawResult.drawn,
      drawResult.temperature,
      drawResult.purity
    );
    
    this.networkMetrics.totalCycled += drawResult.drawn;
    
    return {
      success: true,
      transferred: drawResult.drawn,
      fromTemp: drawResult.temperature,
      toTemp: dest.temperature,
      overflow: addResult.overflow,
    };
  }
  
  /**
   * Run cooling cycle - move hot water to cooling, cold water to systems
   * @returns {Object} - Cooling cycle result
   */
  runCoolingCycle() {
    const primary = this.reservoirs.get('primary');
    const cooling = this.reservoirs.get('cooling');
    const hot = this.reservoirs.get('hot');
    
    // Cool the cooling reservoir
    const coolingResult = cooling.cool(4, 50000);
    
    // Move heated return water to hot reservoir for heat recovery
    if (primary.temperature > 25) {
      const hotTransfer = this.transfer('primary', 'hot', 10000);
    }
    
    // Move cold water from cooling to primary
    const coldTransfer = this.transfer('cooling', 'primary', 15000);
    
    // Calculate cooling efficiency
    const tempDiff = Math.abs(primary.temperature - cooling.temperature);
    this.networkMetrics.coolingEfficiency = Math.min(1, tempDiff / 20);
    
    // Heat recovery from hot reservoir
    if (hot.currentVolume > hot.type.capacity * 0.5) {
      this.networkMetrics.heatRecovered += hot.currentVolume * 0.1 * hot.temperature;
    }
    
    this._calculateTotalVolume();
    
    return {
      success: true,
      coolingReservoirTemp: cooling.temperature,
      primaryTemp: primary.temperature,
      coolingEfficiency: Math.round(this.networkMetrics.coolingEfficiency * 100),
      heatRecovered: Math.round(this.networkMetrics.heatRecovered),
      totalWater: Math.round(this.totalWaterVolume),
    };
  }
  
  /**
   * Emergency cooling activation
   * @param {string} targetReservoirId - Reservoir needing emergency cooling
   * @returns {Object} - Emergency result
   */
  emergencyCooling(targetReservoirId) {
    const emergency = this.reservoirs.get('emergency');
    const target = this.reservoirs.get(targetReservoirId);
    
    if (!target) {
      return { success: false, error: 'Target reservoir not found' };
    }
    
    emergency.flowState = FLOW_STATES.EMERGENCY;
    
    // Dump emergency cold water into target
    const transfer = this.transfer('emergency', targetReservoirId, emergency.type.flowRate);
    
    return {
      success: true,
      emergencyActivated: true,
      transferred: transfer.transferred,
      targetTempBefore: target.temperature,
      targetTempAfter: target.temperature,
    };
  }
  
  /**
   * Get network-wide statistics
   * @returns {Object} - Network stats
   */
  getNetworkStats() {
    const stats = {
      totalReservoirs: this.reservoirs.size,
      totalWaterVolume: Math.round(this.totalWaterVolume),
      reservoirs: {},
      networkMetrics: { ...this.networkMetrics },
      averageTemperature: 0,
      averagePurity: 0,
    };
    
    let tempSum = 0;
    let puritySum = 0;
    
    this.reservoirs.forEach((reservoir, id) => {
      const status = reservoir.getStatus();
      stats.reservoirs[id] = {
        fillPercent: status.volume.fillPercent,
        temperature: status.temperature.current,
        purity: status.purity.current,
        flowState: status.flowState,
      };
      tempSum += status.temperature.current;
      puritySum += status.purity.current;
    });
    
    stats.averageTemperature = Math.round((tempSum / this.reservoirs.size) * 10) / 10;
    stats.averagePurity = Math.round((puritySum / this.reservoirs.size) * 100) / 100;
    
    return stats;
  }
  
  /**
   * Run maintenance on all reservoirs
   * @returns {Object} - Maintenance results
   */
  runNetworkMaintenance() {
    const results = [];
    
    this.reservoirs.forEach((reservoir, id) => {
      results.push({
        reservoirId: id,
        ...reservoir.runMaintenance(),
      });
    });
    
    return { success: true, results };
  }
  
  /**
   * Get a specific reservoir
   * @param {string} reservoirId - Reservoir ID
   * @returns {H2OReservoir} - The reservoir
   */
  getReservoir(reservoirId) {
    return this.reservoirs.get(reservoirId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default ReservoirNetwork;
