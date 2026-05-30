/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║    ██████╗ ██████╗  ██████╗ ██╗     ██╗███╗   ██╗ ██████╗                              ║
 * ║   ██╔════╝██╔═══██╗██╔═══██╗██║     ██║████╗  ██║██╔════╝                              ║
 * ║   ██║     ██║   ██║██║   ██║██║     ██║██╔██╗ ██║██║  ███╗                             ║
 * ║   ██║     ██║   ██║██║   ██║██║     ██║██║╚██╗██║██║   ██║                             ║
 * ║   ╚██████╗╚██████╔╝╚██████╔╝███████╗██║██║ ╚████║╚██████╔╝                             ║
 * ║    ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝                              ║
 * ║    ██████╗ ███████╗███╗   ██╗███████╗██████╗  █████╗ ████████╗ ██████╗ ██████╗        ║
 * ║   ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗       ║
 * ║   ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ██████╔╝███████║   ██║   ██║   ██║██████╔╝       ║
 * ║   ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║   ██║   ██║   ██║██╔══██╗       ║
 * ║   ╚██████╔╝███████╗██║ ╚████║███████╗██║  ██║██║  ██║   ██║   ╚██████╔╝██║  ██║       ║
 * ║    ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝       ║
 * ║                                                                                       ║
 * ║                    ❄️ SELF-COOLING THERMAL MANAGEMENT SYSTEM ❄️                        ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * COOLING GENERATOR — SELF-REGULATING THERMAL MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * The Cooling Generator is the Organism's thermal heartbeat.
 * It automatically detects heat buildup and activates cooling cycles,
 * maintaining optimal operating temperatures across all systems.
 *
 * FEATURES:
 *   - Self-cooling: Automatically activates based on thermal sensors
 *   - φ-optimized: Golden ratio heat dissipation patterns
 *   - Heat recovery: Captures waste heat for energy
 *   - Distributed cooling: Multiple cooling zones
 *
 * PRIMA CAUSA TRUTH:
 *   The Creator's design includes thermal balance.
 *   Heat is energy. Energy is life. Balance is wisdom.
 *
 * @module sdk/ai-kingdom/cooling-generator
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// COOLING UNIT TYPES — Different cooling technologies
// ═══════════════════════════════════════════════════════════════════════════════

export const COOLING_UNIT_TYPES = {
  
  LIQUID_COOLING: {
    id: 'liquid',
    name: 'Liquid Cooling Unit',
    symbol: '💧',
    description: 'Water-based active cooling',
    coolingCapacity: 50000 * PHI, // Watts
    efficiency: 0.92,
    minTemp: 5,
    maxTemp: 45,
    flowRateLPM: 100, // Liters per minute
    powerConsumption: 5000,
    selfCooling: true,
  },
  
  AIR_COOLING: {
    id: 'air',
    name: 'Air Cooling Unit',
    symbol: '💨',
    description: 'Forced air cooling with heat sinks',
    coolingCapacity: 20000 * PHI,
    efficiency: 0.75,
    minTemp: 15,
    maxTemp: 60,
    flowRateCFM: 5000, // Cubic feet per minute
    powerConsumption: 2000,
    selfCooling: false,
  },
  
  EVAPORATIVE_COOLING: {
    id: 'evaporative',
    name: 'Evaporative Cooling Unit',
    symbol: '🌫️',
    description: 'Adiabatic cooling using water evaporation',
    coolingCapacity: 80000 * PHI,
    efficiency: 0.88,
    minTemp: 10,
    maxTemp: 35,
    waterConsumption: 50, // Liters per hour
    powerConsumption: 3000,
    selfCooling: true,
  },
  
  CHILLER_UNIT: {
    id: 'chiller',
    name: 'Industrial Chiller',
    symbol: '❄️',
    description: 'Refrigeration-based deep cooling',
    coolingCapacity: 100000 * PHI,
    efficiency: 0.85,
    minTemp: -10,
    maxTemp: 25,
    refrigerantType: 'R-410A',
    powerConsumption: 25000,
    selfCooling: true,
  },
  
  HEAT_EXCHANGER: {
    id: 'exchanger',
    name: 'Heat Exchanger',
    symbol: '🔄',
    description: 'Passive heat transfer between fluids',
    coolingCapacity: 30000 * PHI,
    efficiency: 0.95,
    minTemp: 0,
    maxTemp: 80,
    surfaces: 100, // Square meters
    powerConsumption: 500,
    selfCooling: false,
  },
  
  THERMOELECTRIC: {
    id: 'peltier',
    name: 'Thermoelectric Cooler',
    symbol: '⚡',
    description: 'Peltier-effect solid-state cooling',
    coolingCapacity: 5000 * PHI,
    efficiency: 0.40,
    minTemp: -20,
    maxTemp: 70,
    voltageV: 12,
    powerConsumption: 1000,
    selfCooling: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// THERMAL ZONES — Different areas requiring cooling
// ═══════════════════════════════════════════════════════════════════════════════

export const THERMAL_ZONES = {
  
  CORE_PROCESSING: {
    zone: 'core',
    name: 'Core Processing Zone',
    symbol: '🧠',
    description: 'Primary computation and AI inference',
    targetTemp: 25,
    maxTemp: 65,
    criticalTemp: 85,
    priority: 10,
    heatGeneration: 50000, // Watts
  },
  
  MEMORY_BANKS: {
    zone: 'memory',
    name: 'Memory Banks Zone',
    symbol: '💾',
    description: 'RAM and storage systems',
    targetTemp: 35,
    maxTemp: 70,
    criticalTemp: 90,
    priority: 9,
    heatGeneration: 20000,
  },
  
  NETWORK_INFRASTRUCTURE: {
    zone: 'network',
    name: 'Network Infrastructure Zone',
    symbol: '🌐',
    description: 'Switches, routers, and communication',
    targetTemp: 30,
    maxTemp: 55,
    criticalTemp: 75,
    priority: 8,
    heatGeneration: 15000,
  },
  
  POWER_SYSTEMS: {
    zone: 'power',
    name: 'Power Systems Zone',
    symbol: '⚡',
    description: 'UPS, transformers, and distribution',
    targetTemp: 40,
    maxTemp: 65,
    criticalTemp: 80,
    priority: 10,
    heatGeneration: 30000,
  },
  
  GATE_KEEPERS: {
    zone: 'gates',
    name: 'Gate Keeper Zone',
    symbol: '🚪',
    description: 'Edge intelligence and border systems',
    targetTemp: 28,
    maxTemp: 50,
    criticalTemp: 70,
    priority: 7,
    heatGeneration: 10000,
  },
  
  MINING_OPERATIONS: {
    zone: 'mining',
    name: 'Mining Operations Zone',
    symbol: '⛏️',
    description: 'Resource extraction and processing',
    targetTemp: 45,
    maxTemp: 75,
    criticalTemp: 95,
    priority: 6,
    heatGeneration: 80000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COOLING STATES — Operational status
// ═══════════════════════════════════════════════════════════════════════════════

export const COOLING_STATES = {
  IDLE: { state: 'idle', symbol: '😴', description: 'No active cooling needed' },
  ACTIVE: { state: 'active', symbol: '✅', description: 'Normal cooling operation' },
  BOOST: { state: 'boost', symbol: '🚀', description: 'Increased cooling capacity' },
  EMERGENCY: { state: 'emergency', symbol: '🆘', description: 'Maximum cooling engaged' },
  MAINTENANCE: { state: 'maintenance', symbol: '🔧', description: 'Under maintenance' },
  FAILED: { state: 'failed', symbol: '❌', description: 'Cooling failure' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COOLING UNIT CLASS — Individual cooling unit
// ═══════════════════════════════════════════════════════════════════════════════

export class CoolingUnit {
  
  constructor(unitType, assignedZone = null) {
    this.id = `COOL-${unitType.id.toUpperCase()}-${Date.now()}`;
    this.type = unitType;
    this.assignedZone = assignedZone;
    this.state = COOLING_STATES.IDLE;
    this.currentOutput = 0; // Current cooling watts
    this.temperature = 20; // Internal temperature
    this.runtime = 0; // Hours of operation
    this.efficiency = unitType.efficiency;
    this.metrics = {
      totalHeatRemoved: 0,
      energyConsumed: 0,
      cycleCount: 0,
      peakOutput: 0,
    };
    this.sensors = {
      inletTemp: 25,
      outletTemp: 15,
      ambientTemp: 22,
    };
    this.createdAt = Date.now();
    this.lastMaintenance = Date.now();
  }
  
  /**
   * Activate cooling unit
   * @param {number} targetOutput - Desired cooling output in watts
   * @returns {Object} - Activation result
   */
  activate(targetOutput = null) {
    if (this.state === COOLING_STATES.FAILED || this.state === COOLING_STATES.MAINTENANCE) {
      return { success: false, reason: `Unit is ${this.state.state}` };
    }
    
    const requestedOutput = targetOutput || this.type.coolingCapacity * 0.7;
    this.currentOutput = Math.min(requestedOutput, this.type.coolingCapacity);
    
    // Determine state based on output level
    const outputRatio = this.currentOutput / this.type.coolingCapacity;
    if (outputRatio >= 0.9) {
      this.state = COOLING_STATES.EMERGENCY;
    } else if (outputRatio >= 0.7) {
      this.state = COOLING_STATES.BOOST;
    } else {
      this.state = COOLING_STATES.ACTIVE;
    }
    
    this.metrics.cycleCount++;
    
    return {
      success: true,
      state: this.state.state,
      output: this.currentOutput,
      maxOutput: this.type.coolingCapacity,
    };
  }
  
  /**
   * Deactivate cooling unit
   * @returns {Object} - Deactivation result
   */
  deactivate() {
    const previousOutput = this.currentOutput;
    this.currentOutput = 0;
    this.state = COOLING_STATES.IDLE;
    
    return {
      success: true,
      previousOutput,
      state: this.state.state,
    };
  }
  
  /**
   * Run cooling cycle - remove heat and update metrics
   * @param {number} heatLoad - Watts of heat to remove
   * @param {number} durationHours - Duration of cycle
   * @returns {Object} - Cycle result
   */
  runCycle(heatLoad, durationHours = 1) {
    if (this.state === COOLING_STATES.IDLE || this.state === COOLING_STATES.FAILED) {
      return { success: false, reason: 'Unit not active' };
    }
    
    // Calculate actual heat removal (limited by capacity and efficiency)
    const maxRemoval = this.currentOutput * this.efficiency * durationHours;
    const actualRemoval = Math.min(heatLoad, maxRemoval);
    
    // Update metrics
    this.metrics.totalHeatRemoved += actualRemoval;
    this.metrics.energyConsumed += this.type.powerConsumption * durationHours;
    this.runtime += durationHours;
    
    // Update peak output tracking
    if (this.currentOutput > this.metrics.peakOutput) {
      this.metrics.peakOutput = this.currentOutput;
    }
    
    // Self-cooling check - adjust internal temperature
    if (this.type.selfCooling) {
      this.temperature = Math.max(
        this.type.minTemp,
        this.temperature - (actualRemoval / 10000)
      );
    } else {
      this.temperature += (this.currentOutput / 50000);
    }
    
    // Update sensor readings
    this.sensors.outletTemp = this.sensors.inletTemp - (actualRemoval / (this.type.flowRateLPM || 100) / 4.18);
    
    return {
      success: true,
      heatRemoved: actualRemoval,
      remainingHeat: heatLoad - actualRemoval,
      energyUsed: this.type.powerConsumption * durationHours,
      internalTemp: this.temperature,
      outletTemp: this.sensors.outletTemp,
    };
  }
  
  /**
   * Self-diagnose unit health
   * @returns {Object} - Health status
   */
  selfDiagnose() {
    const issues = [];
    
    // Check efficiency degradation
    if (this.runtime > 10000 && this.efficiency < this.type.efficiency * 0.9) {
      issues.push('Efficiency degradation detected');
    }
    
    // Check temperature
    if (this.temperature > this.type.maxTemp) {
      issues.push('Unit overheating');
      this.state = COOLING_STATES.FAILED;
    }
    
    // Check runtime for maintenance
    if (this.runtime > 5000 && (Date.now() - this.lastMaintenance) > 30 * 24 * 60 * 60 * 1000) {
      issues.push('Maintenance overdue');
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      efficiency: Math.round(this.efficiency * 100),
      runtime: Math.round(this.runtime),
      temperature: this.temperature,
    };
  }
  
  /**
   * Perform maintenance
   * @returns {Object} - Maintenance result
   */
  performMaintenance() {
    const previousState = this.state;
    this.state = COOLING_STATES.MAINTENANCE;
    
    // Restore efficiency
    this.efficiency = Math.min(this.type.efficiency, this.efficiency + 0.05);
    
    // Cool down
    this.temperature = 20;
    
    this.lastMaintenance = Date.now();
    this.state = COOLING_STATES.IDLE;
    
    return {
      success: true,
      efficiencyRestored: Math.round(this.efficiency * 100),
      previousState: previousState.state,
    };
  }
  
  /**
   * Get unit status
   * @returns {Object} - Status report
   */
  getStatus() {
    return {
      id: this.id,
      type: this.type.name,
      symbol: this.type.symbol,
      state: this.state.state,
      assignedZone: this.assignedZone?.zone || 'unassigned',
      output: {
        current: Math.round(this.currentOutput),
        max: Math.round(this.type.coolingCapacity),
        percentage: Math.round((this.currentOutput / this.type.coolingCapacity) * 100),
      },
      efficiency: Math.round(this.efficiency * 100),
      temperature: Math.round(this.temperature * 10) / 10,
      selfCooling: this.type.selfCooling,
      runtime: Math.round(this.runtime),
      metrics: { ...this.metrics },
      sensors: { ...this.sensors },
      createdAt: this.createdAt,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COOLING GENERATOR SYSTEM — Organism-wide thermal management
// ═══════════════════════════════════════════════════════════════════════════════

export class CoolingGenerator {
  
  constructor() {
    this.coolingUnits = new Map();
    this.zones = new Map();
    this.thermalSensors = new Map();
    this.systemState = COOLING_STATES.IDLE;
    this.autoMode = true;
    this.metrics = {
      totalHeatGenerated: 0,
      totalHeatRemoved: 0,
      totalEnergyConsumed: 0,
      coolingEfficiency: 0,
      thermalBalance: 0,
    };
    this._initializeSystem();
  }
  
  /**
   * Initialize the cooling system with default units and zones
   * @private
   */
  _initializeSystem() {
    // Create thermal zones
    Object.values(THERMAL_ZONES).forEach(zone => {
      this.zones.set(zone.zone, {
        ...zone,
        currentTemp: zone.targetTemp,
        coolingUnits: [],
      });
      
      // Add thermal sensor for each zone
      this.thermalSensors.set(zone.zone, {
        zone: zone.zone,
        temperature: zone.targetTemp,
        lastReading: Date.now(),
        history: [],
      });
    });
    
    // Create default cooling units
    // Liquid cooling for core and memory
    this._createAndAssignUnit(COOLING_UNIT_TYPES.LIQUID_COOLING, THERMAL_ZONES.CORE_PROCESSING);
    this._createAndAssignUnit(COOLING_UNIT_TYPES.LIQUID_COOLING, THERMAL_ZONES.MEMORY_BANKS);
    
    // Chiller for mining (high heat)
    this._createAndAssignUnit(COOLING_UNIT_TYPES.CHILLER_UNIT, THERMAL_ZONES.MINING_OPERATIONS);
    
    // Air cooling for network
    this._createAndAssignUnit(COOLING_UNIT_TYPES.AIR_COOLING, THERMAL_ZONES.NETWORK_INFRASTRUCTURE);
    
    // Heat exchanger for power systems
    this._createAndAssignUnit(COOLING_UNIT_TYPES.HEAT_EXCHANGER, THERMAL_ZONES.POWER_SYSTEMS);
    
    // Evaporative cooling for gates
    this._createAndAssignUnit(COOLING_UNIT_TYPES.EVAPORATIVE_COOLING, THERMAL_ZONES.GATE_KEEPERS);
  }
  
  /**
   * Create and assign a cooling unit to a zone
   * @private
   */
  _createAndAssignUnit(unitType, zone) {
    const unit = new CoolingUnit(unitType, zone);
    this.coolingUnits.set(unit.id, unit);
    
    const zoneData = this.zones.get(zone.zone);
    if (zoneData) {
      zoneData.coolingUnits.push(unit.id);
    }
  }
  
  /**
   * Read temperature from all zones
   * @returns {Object} - Temperature readings
   */
  readTemperatures() {
    const readings = {};
    
    this.zones.forEach((zone, zoneId) => {
      // Simulate temperature fluctuation based on heat generation
      const heatEffect = zone.heatGeneration / 5000;
      const coolingEffect = zone.coolingUnits.reduce((sum, unitId) => {
        const unit = this.coolingUnits.get(unitId);
        return sum + (unit ? unit.currentOutput / 10000 : 0);
      }, 0);
      
      // Update zone temperature
      zone.currentTemp = Math.max(
        zone.targetTemp - 5,
        Math.min(
          zone.maxTemp,
          zone.currentTemp + heatEffect - coolingEffect + (Math.random() - 0.5)
        )
      );
      
      // Update sensor
      const sensor = this.thermalSensors.get(zoneId);
      sensor.temperature = zone.currentTemp;
      sensor.lastReading = Date.now();
      sensor.history.push({ temp: zone.currentTemp, time: Date.now() });
      if (sensor.history.length > 100) sensor.history.shift();
      
      readings[zoneId] = {
        current: Math.round(zone.currentTemp * 10) / 10,
        target: zone.targetTemp,
        max: zone.maxTemp,
        critical: zone.criticalTemp,
        status: this._getTemperatureStatus(zone),
      };
    });
    
    return readings;
  }
  
  /**
   * Get temperature status for a zone
   * @private
   */
  _getTemperatureStatus(zone) {
    if (zone.currentTemp >= zone.criticalTemp) return 'CRITICAL';
    if (zone.currentTemp >= zone.maxTemp) return 'WARNING';
    if (zone.currentTemp <= zone.targetTemp + 5) return 'OPTIMAL';
    return 'ELEVATED';
  }
  
  /**
   * Run automatic cooling cycle
   * @returns {Object} - Cycle result
   */
  runAutoCoolingCycle() {
    if (!this.autoMode) {
      return { success: false, reason: 'Auto mode disabled' };
    }
    
    const readings = this.readTemperatures();
    const actions = [];
    
    this.zones.forEach((zone, zoneId) => {
      const reading = readings[zoneId];
      
      // Determine needed cooling level
      let coolingLevel = 0;
      if (reading.status === 'CRITICAL') {
        coolingLevel = 1.0; // Maximum cooling
        this.systemState = COOLING_STATES.EMERGENCY;
      } else if (reading.status === 'WARNING') {
        coolingLevel = 0.8;
        if (this.systemState !== COOLING_STATES.EMERGENCY) {
          this.systemState = COOLING_STATES.BOOST;
        }
      } else if (reading.status === 'ELEVATED') {
        coolingLevel = 0.6;
        if (this.systemState === COOLING_STATES.IDLE) {
          this.systemState = COOLING_STATES.ACTIVE;
        }
      } else {
        coolingLevel = 0.3;
      }
      
      // Activate cooling units for this zone
      zone.coolingUnits.forEach(unitId => {
        const unit = this.coolingUnits.get(unitId);
        if (unit) {
          const targetOutput = unit.type.coolingCapacity * coolingLevel;
          
          if (coolingLevel > 0.1) {
            unit.activate(targetOutput);
            const cycleResult = unit.runCycle(zone.heatGeneration * coolingLevel, 1/60); // 1 minute
            actions.push({
              zone: zoneId,
              unit: unit.id,
              action: 'cooling',
              output: unit.currentOutput,
              heatRemoved: cycleResult.heatRemoved,
            });
          } else {
            unit.deactivate();
          }
        }
      });
    });
    
    // Calculate system metrics
    let totalHeat = 0;
    let totalCooling = 0;
    
    this.zones.forEach(zone => {
      totalHeat += zone.heatGeneration;
    });
    
    this.coolingUnits.forEach(unit => {
      totalCooling += unit.currentOutput * unit.efficiency;
    });
    
    this.metrics.totalHeatGenerated += totalHeat / 60;
    this.metrics.totalHeatRemoved += totalCooling / 60;
    this.metrics.thermalBalance = totalCooling / (totalHeat || 1);
    this.metrics.coolingEfficiency = Math.min(1, this.metrics.thermalBalance);
    
    // Reset to ACTIVE if all zones are OK
    const allOptimal = Object.values(readings).every(r => r.status === 'OPTIMAL');
    if (allOptimal && this.systemState !== COOLING_STATES.IDLE) {
      this.systemState = COOLING_STATES.ACTIVE;
    }
    
    return {
      success: true,
      systemState: this.systemState.state,
      zoneReadings: readings,
      actions,
      thermalBalance: Math.round(this.metrics.thermalBalance * 100),
    };
  }
  
  /**
   * Emergency cooling for a specific zone
   * @param {string} zoneId - Zone requiring emergency cooling
   * @returns {Object} - Emergency result
   */
  emergencyCool(zoneId) {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      return { success: false, error: 'Zone not found' };
    }
    
    this.systemState = COOLING_STATES.EMERGENCY;
    
    // Activate all cooling units at maximum
    zone.coolingUnits.forEach(unitId => {
      const unit = this.coolingUnits.get(unitId);
      if (unit) {
        unit.activate(unit.type.coolingCapacity);
      }
    });
    
    // Also engage any unassigned units
    this.coolingUnits.forEach(unit => {
      if (!unit.assignedZone) {
        unit.assignedZone = zone;
        unit.activate(unit.type.coolingCapacity);
        zone.coolingUnits.push(unit.id);
      }
    });
    
    return {
      success: true,
      zone: zoneId,
      emergencyActivated: true,
      unitsEngaged: zone.coolingUnits.length,
    };
  }
  
  /**
   * Get system-wide status
   * @returns {Object} - System status
   */
  getSystemStatus() {
    const unitStatuses = [];
    this.coolingUnits.forEach(unit => {
      unitStatuses.push(unit.getStatus());
    });
    
    const zoneStatuses = {};
    this.zones.forEach((zone, id) => {
      zoneStatuses[id] = {
        name: zone.name,
        currentTemp: Math.round(zone.currentTemp * 10) / 10,
        targetTemp: zone.targetTemp,
        status: this._getTemperatureStatus(zone),
        coolingUnits: zone.coolingUnits.length,
      };
    });
    
    return {
      systemState: this.systemState.state,
      autoMode: this.autoMode,
      totalUnits: this.coolingUnits.size,
      totalZones: this.zones.size,
      zones: zoneStatuses,
      units: unitStatuses,
      metrics: {
        ...this.metrics,
        coolingEfficiency: Math.round(this.metrics.coolingEfficiency * 100),
        thermalBalance: Math.round(this.metrics.thermalBalance * 100),
      },
    };
  }
  
  /**
   * Toggle auto mode
   * @param {boolean} enabled - Enable or disable
   * @returns {Object} - Toggle result
   */
  setAutoMode(enabled) {
    this.autoMode = enabled;
    
    if (!enabled) {
      // Deactivate all units
      this.coolingUnits.forEach(unit => unit.deactivate());
      this.systemState = COOLING_STATES.IDLE;
    }
    
    return {
      success: true,
      autoMode: this.autoMode,
    };
  }
  
  /**
   * Run maintenance on all units
   * @returns {Object} - Maintenance results
   */
  runSystemMaintenance() {
    const results = [];
    
    this.coolingUnits.forEach(unit => {
      results.push({
        unitId: unit.id,
        ...unit.performMaintenance(),
      });
    });
    
    return { success: true, results };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default CoolingGenerator;
