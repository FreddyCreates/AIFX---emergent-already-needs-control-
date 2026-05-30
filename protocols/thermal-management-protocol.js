/**
 * PROTO-233: Thermal Management Protocol (TMP)
 * Organism-wide thermal regulation, self-cooling systems, and heat recovery.
 *
 * The Thermal Management Protocol defines formal rules for:
 * - H2O reservoir management and water quality
 * - Cooling generator coordination and load balancing
 * - Thermal zone monitoring and emergency response
 * - Heat recovery and energy optimization
 * - Self-cooling feedback loops
 *
 * φ-enhanced: Uses golden ratio for heat dissipation curves and flow optimization.
 *
 * @module protocols/thermal-management-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PROTOCOL_ID = 'PROTO-233';
const PROTOCOL_NAME = 'Thermal Management Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// THERMAL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const THERMAL_CONFIG = {
  
  // Temperature thresholds (Celsius)
  OPTIMAL_TEMP: 25,
  WARNING_TEMP: 45,
  CRITICAL_TEMP: 65,
  EMERGENCY_TEMP: 80,
  SHUTDOWN_TEMP: 95,
  
  // Cooling parameters
  MIN_COOLING_CAPACITY: 10000 * PHI, // Watts
  MAX_COOLING_CAPACITY: 500000 * PHI,
  COOLING_RAMP_RATE: 1000 * PHI, // Watts per second
  
  // Water parameters
  WATER_TEMP_MIN: 4,
  WATER_TEMP_MAX: 60,
  WATER_PURITY_MIN: 0.95,
  WATER_FLOW_RATE_MIN: 100 * PHI, // Liters per minute
  
  // Response times
  SENSOR_INTERVAL_MS: 1000,
  COOLING_RESPONSE_MS: 5000,
  EMERGENCY_RESPONSE_MS: 500,
  
  // Efficiency targets
  TARGET_EFFICIENCY: 0.85,
  MIN_EFFICIENCY: 0.60,
  
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  
  // Thermal Monitoring
  TEMP_READING: 'thermal.reading',
  TEMP_WARNING: 'thermal.warning',
  TEMP_CRITICAL: 'thermal.critical',
  TEMP_EMERGENCY: 'thermal.emergency',
  
  // Cooling Control
  COOLING_ACTIVATE: 'cooling.activate',
  COOLING_DEACTIVATE: 'cooling.deactivate',
  COOLING_BOOST: 'cooling.boost',
  COOLING_EMERGENCY: 'cooling.emergency',
  COOLING_BALANCE: 'cooling.balance',
  
  // Water Management
  WATER_FLOW_START: 'water.flow_start',
  WATER_FLOW_STOP: 'water.flow_stop',
  WATER_TRANSFER: 'water.transfer',
  WATER_QUALITY_ALERT: 'water.quality_alert',
  
  // System Events
  ZONE_OVERHEAT: 'zone.overheat',
  ZONE_NORMAL: 'zone.normal',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  HEAT_RECOVERY: 'heat.recovery',
  
};

// ═══════════════════════════════════════════════════════════════════════════════
// THERMAL STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const THERMAL_STATES = {
  COLD: 'cold',
  OPTIMAL: 'optimal',
  WARM: 'warm',
  HOT: 'hot',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency',
  SHUTDOWN: 'shutdown',
};

export const STATE_TRANSITIONS = {
  [THERMAL_STATES.COLD]: [THERMAL_STATES.OPTIMAL],
  [THERMAL_STATES.OPTIMAL]: [THERMAL_STATES.COLD, THERMAL_STATES.WARM],
  [THERMAL_STATES.WARM]: [THERMAL_STATES.OPTIMAL, THERMAL_STATES.HOT],
  [THERMAL_STATES.HOT]: [THERMAL_STATES.WARM, THERMAL_STATES.CRITICAL],
  [THERMAL_STATES.CRITICAL]: [THERMAL_STATES.HOT, THERMAL_STATES.EMERGENCY],
  [THERMAL_STATES.EMERGENCY]: [THERMAL_STATES.CRITICAL, THERMAL_STATES.SHUTDOWN],
  [THERMAL_STATES.SHUTDOWN]: [THERMAL_STATES.COLD],
};

// ═══════════════════════════════════════════════════════════════════════════════
// φ-ENHANCED THERMAL CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate required cooling power using φ-optimized curve
 * @param {number} currentTemp - Current temperature
 * @param {number} targetTemp - Target temperature
 * @param {number} heatLoad - Current heat generation in watts
 * @returns {Object} - Cooling calculation
 */
export function calculateCoolingPower(currentTemp, targetTemp, heatLoad) {
  const tempDiff = currentTemp - targetTemp;
  
  // φ-enhanced urgency curve - cooling increases exponentially as temp rises
  const urgencyFactor = Math.pow(PHI, tempDiff / 10);
  
  // Base cooling must exceed heat load
  const baseCooling = heatLoad * 1.2;
  
  // Additional cooling based on urgency
  const urgencyCooling = baseCooling * (urgencyFactor - 1);
  
  // Total required cooling
  const totalCooling = baseCooling + urgencyCooling;
  
  // Efficiency factor (decreases at extreme temps)
  const efficiencyFactor = 1 / (1 + Math.pow((currentTemp - 25) / 50, 2));
  
  return {
    baseCooling: Math.round(baseCooling),
    urgencyCooling: Math.round(urgencyCooling),
    totalRequired: Math.round(totalCooling),
    urgencyFactor: Math.round(urgencyFactor * 100) / 100,
    efficiencyFactor: Math.round(efficiencyFactor * 100) / 100,
    tempDiff: Math.round(tempDiff * 10) / 10,
  };
}

/**
 * Calculate optimal water flow rate using φ distribution
 * @param {number} coolingPower - Cooling power in watts
 * @param {number} tempDrop - Desired temperature drop
 * @returns {Object} - Flow calculation
 */
export function calculateWaterFlow(coolingPower, tempDrop) {
  // Q = m * c * ΔT, where c = 4.18 kJ/kg°C for water
  // m = Q / (c * ΔT), convert to flow rate in LPM
  
  const specificHeat = 4.18; // kJ/kg°C
  const massFlowKgS = coolingPower / 1000 / (specificHeat * tempDrop);
  const flowRateLPM = massFlowKgS * 60; // Convert to liters per minute
  
  // Apply φ-based safety margin
  const safetyMargin = 1 / PHI; // ~0.618
  const optimalFlow = flowRateLPM * (1 + safetyMargin);
  
  return {
    theoreticalFlow: Math.round(flowRateLPM * 10) / 10,
    optimalFlow: Math.round(optimalFlow * 10) / 10,
    safetyMargin: Math.round(safetyMargin * 100),
    unit: 'LPM',
  };
}

/**
 * Calculate thermal state from temperature
 * @param {number} temp - Current temperature
 * @returns {string} - Thermal state
 */
export function getThermalState(temp) {
  if (temp >= THERMAL_CONFIG.SHUTDOWN_TEMP) return THERMAL_STATES.SHUTDOWN;
  if (temp >= THERMAL_CONFIG.EMERGENCY_TEMP) return THERMAL_STATES.EMERGENCY;
  if (temp >= THERMAL_CONFIG.CRITICAL_TEMP) return THERMAL_STATES.CRITICAL;
  if (temp >= THERMAL_CONFIG.WARNING_TEMP) return THERMAL_STATES.HOT;
  if (temp >= THERMAL_CONFIG.OPTIMAL_TEMP + 10) return THERMAL_STATES.WARM;
  if (temp >= THERMAL_CONFIG.OPTIMAL_TEMP - 5) return THERMAL_STATES.OPTIMAL;
  return THERMAL_STATES.COLD;
}

/**
 * Calculate heat recovery potential
 * @param {number} hotWaterVolume - Volume of hot water in liters
 * @param {number} hotTemp - Temperature of hot water
 * @param {number} coldTemp - Temperature of cold sink
 * @returns {Object} - Heat recovery calculation
 */
export function calculateHeatRecovery(hotWaterVolume, hotTemp, coldTemp) {
  const tempDiff = hotTemp - coldTemp;
  const specificHeat = 4.18; // kJ/kg°C
  
  // Energy available = m * c * ΔT
  const energyKJ = hotWaterVolume * specificHeat * tempDiff;
  const energyWH = energyKJ / 3.6; // Convert to Watt-hours
  
  // Practical recovery efficiency (φ-based)
  const recoveryEfficiency = 1 - (1 / PHI); // ~0.382
  const practicalEnergy = energyWH * recoveryEfficiency;
  
  return {
    theoreticalEnergyKJ: Math.round(energyKJ),
    theoreticalEnergyWH: Math.round(energyWH),
    practicalEnergyWH: Math.round(practicalEnergy),
    recoveryEfficiency: Math.round(recoveryEfficiency * 100),
    tempDrop: tempDiff,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// THERMAL MANAGEMENT PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class ThermalManagementProtocol {
  
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.zones = new Map();
    this.messageLog = [];
    this.thermalHistory = [];
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
      description: 'Organism-wide thermal regulation and self-cooling management',
      config: THERMAL_CONFIG,
      messageTypes: Object.keys(MESSAGE_TYPES).length,
      thermalStates: Object.keys(THERMAL_STATES).length,
    };
  }
  
  /**
   * Register a thermal zone
   * @param {string} zoneId - Zone identifier
   * @param {Object} config - Zone configuration
   * @returns {Object} - Registration result
   */
  registerZone(zoneId, config = {}) {
    if (this.zones.has(zoneId)) {
      return { success: false, error: 'Zone already registered' };
    }
    
    const zone = {
      id: zoneId,
      name: config.name || zoneId,
      targetTemp: config.targetTemp || THERMAL_CONFIG.OPTIMAL_TEMP,
      maxTemp: config.maxTemp || THERMAL_CONFIG.WARNING_TEMP,
      criticalTemp: config.criticalTemp || THERMAL_CONFIG.CRITICAL_TEMP,
      currentTemp: config.targetTemp || THERMAL_CONFIG.OPTIMAL_TEMP,
      state: THERMAL_STATES.OPTIMAL,
      coolingUnits: [],
      heatLoad: config.heatLoad || 10000,
      registeredAt: Date.now(),
    };
    
    this.zones.set(zoneId, zone);
    this._logMessage(MESSAGE_TYPES.TEMP_READING, zoneId, { temp: zone.currentTemp });
    
    return {
      success: true,
      zoneId,
      state: zone.state,
    };
  }
  
  /**
   * Update zone temperature and evaluate state
   * @param {string} zoneId - Zone identifier
   * @param {number} temperature - Current temperature
   * @returns {Object} - Update result
   */
  updateTemperature(zoneId, temperature) {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      return { success: false, error: 'Zone not found' };
    }
    
    const previousState = zone.state;
    zone.currentTemp = temperature;
    zone.state = getThermalState(temperature);
    
    // Record history
    this.thermalHistory.push({
      zoneId,
      temperature,
      state: zone.state,
      timestamp: Date.now(),
    });
    
    // Keep history bounded
    if (this.thermalHistory.length > 10000) {
      this.thermalHistory = this.thermalHistory.slice(-5000);
    }
    
    // Generate appropriate messages
    if (zone.state !== previousState) {
      if (zone.state === THERMAL_STATES.EMERGENCY) {
        this._logMessage(MESSAGE_TYPES.TEMP_EMERGENCY, zoneId, { temp: temperature });
        this._createAlert(zoneId, 'EMERGENCY', `Temperature emergency: ${temperature}°C`);
      } else if (zone.state === THERMAL_STATES.CRITICAL) {
        this._logMessage(MESSAGE_TYPES.TEMP_CRITICAL, zoneId, { temp: temperature });
        this._createAlert(zoneId, 'CRITICAL', `Temperature critical: ${temperature}°C`);
      } else if (zone.state === THERMAL_STATES.HOT) {
        this._logMessage(MESSAGE_TYPES.TEMP_WARNING, zoneId, { temp: temperature });
      } else if (zone.state === THERMAL_STATES.OPTIMAL) {
        this._logMessage(MESSAGE_TYPES.ZONE_NORMAL, zoneId, { temp: temperature });
      }
    }
    
    // Calculate required cooling
    const cooling = calculateCoolingPower(temperature, zone.targetTemp, zone.heatLoad);
    
    return {
      success: true,
      zoneId,
      temperature,
      state: zone.state,
      previousState,
      stateChanged: zone.state !== previousState,
      cooling,
    };
  }
  
  /**
   * Request cooling for a zone
   * @param {string} zoneId - Zone identifier
   * @param {number} coolingPower - Requested cooling power
   * @returns {Object} - Request result
   */
  requestCooling(zoneId, coolingPower) {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      return { success: false, error: 'Zone not found' };
    }
    
    const messageType = coolingPower > zone.heatLoad * 1.5 
      ? MESSAGE_TYPES.COOLING_BOOST 
      : MESSAGE_TYPES.COOLING_ACTIVATE;
    
    this._logMessage(messageType, zoneId, { power: coolingPower });
    
    // Calculate water flow needed
    const waterFlow = calculateWaterFlow(coolingPower, 10); // 10°C temp drop
    
    return {
      success: true,
      zoneId,
      requestedPower: coolingPower,
      waterFlow,
      messageType,
    };
  }
  
  /**
   * Trigger emergency cooling
   * @param {string} zoneId - Zone identifier
   * @returns {Object} - Emergency result
   */
  triggerEmergency(zoneId) {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      return { success: false, error: 'Zone not found' };
    }
    
    zone.state = THERMAL_STATES.EMERGENCY;
    this._logMessage(MESSAGE_TYPES.COOLING_EMERGENCY, zoneId, { 
      temp: zone.currentTemp 
    });
    this._createAlert(zoneId, 'EMERGENCY', 'Emergency cooling triggered manually');
    
    // Calculate maximum cooling needed
    const maxCooling = calculateCoolingPower(
      zone.currentTemp, 
      zone.targetTemp, 
      zone.heatLoad * 2
    );
    
    return {
      success: true,
      zoneId,
      emergencyActivated: true,
      maxCooling,
    };
  }
  
  /**
   * Log a protocol message
   * @private
   */
  _logMessage(type, zoneId, data) {
    this.messageLog.push({
      type,
      zoneId,
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
  _createAlert(zoneId, severity, message) {
    this.alerts.push({
      id: `ALERT-${Date.now()}`,
      zoneId,
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
    const metrics = {
      totalZones: this.zones.size,
      zonesByState: {},
      averageTemp: 0,
      alerts: {
        total: this.alerts.length,
        unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
      },
      messageCount: this.messageLog.length,
      historyLength: this.thermalHistory.length,
    };
    
    let tempSum = 0;
    this.zones.forEach(zone => {
      metrics.zonesByState[zone.state] = (metrics.zonesByState[zone.state] || 0) + 1;
      tempSum += zone.currentTemp;
    });
    
    metrics.averageTemp = this.zones.size > 0 
      ? Math.round((tempSum / this.zones.size) * 10) / 10 
      : 0;
    
    return metrics;
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

export default ThermalManagementProtocol;
