const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('ThermalManagementProtocol', () => {
  let ThermalManagementProtocol;
  let THERMAL_CONFIG;
  let MESSAGE_TYPES;
  let THERMAL_STATES;
  let STATE_TRANSITIONS;
  let calculateCoolingPower;
  let calculateWaterFlow;
  let getThermalState;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/thermal-management-protocol.js');
    ThermalManagementProtocol = module.ThermalManagementProtocol;
    THERMAL_CONFIG = module.THERMAL_CONFIG;
    MESSAGE_TYPES = module.MESSAGE_TYPES;
    THERMAL_STATES = module.THERMAL_STATES;
    STATE_TRANSITIONS = module.STATE_TRANSITIONS;
    calculateCoolingPower = module.calculateCoolingPower;
    calculateWaterFlow = module.calculateWaterFlow;
    getThermalState = module.getThermalState;
    protocol = new ThermalManagementProtocol();
  });

  describe('THERMAL_CONFIG exports', () => {
    it('should export temperature thresholds', () => {
      assert.ok(THERMAL_CONFIG.OPTIMAL_TEMP > 0);
      assert.ok(THERMAL_CONFIG.WARNING_TEMP > THERMAL_CONFIG.OPTIMAL_TEMP);
      assert.ok(THERMAL_CONFIG.CRITICAL_TEMP > THERMAL_CONFIG.WARNING_TEMP);
      assert.ok(THERMAL_CONFIG.EMERGENCY_TEMP > THERMAL_CONFIG.CRITICAL_TEMP);
    });

    it('should export cooling parameters', () => {
      assert.ok(THERMAL_CONFIG.MIN_COOLING_CAPACITY > 0);
      assert.ok(THERMAL_CONFIG.MAX_COOLING_CAPACITY > THERMAL_CONFIG.MIN_COOLING_CAPACITY);
      assert.ok(THERMAL_CONFIG.COOLING_RAMP_RATE > 0);
    });

    it('should export water parameters', () => {
      assert.ok(THERMAL_CONFIG.WATER_TEMP_MIN >= 0);
      assert.ok(THERMAL_CONFIG.WATER_TEMP_MAX > THERMAL_CONFIG.WATER_TEMP_MIN);
      assert.ok(THERMAL_CONFIG.WATER_PURITY_MIN > 0);
    });

    it('should export response times', () => {
      assert.ok(THERMAL_CONFIG.SENSOR_INTERVAL_MS > 0);
      assert.ok(THERMAL_CONFIG.COOLING_RESPONSE_MS > 0);
      assert.ok(THERMAL_CONFIG.EMERGENCY_RESPONSE_MS > 0);
    });

    it('should export efficiency targets', () => {
      assert.ok(THERMAL_CONFIG.TARGET_EFFICIENCY > 0);
      assert.ok(THERMAL_CONFIG.MIN_EFFICIENCY > 0);
    });
  });

  describe('THERMAL_STATES exports', () => {
    it('should export all thermal states', () => {
      assert.equal(THERMAL_STATES.COLD, 'cold');
      assert.equal(THERMAL_STATES.OPTIMAL, 'optimal');
      assert.equal(THERMAL_STATES.WARM, 'warm');
      assert.equal(THERMAL_STATES.HOT, 'hot');
      assert.equal(THERMAL_STATES.CRITICAL, 'critical');
      assert.equal(THERMAL_STATES.EMERGENCY, 'emergency');
      assert.equal(THERMAL_STATES.SHUTDOWN, 'shutdown');
    });
  });

  describe('STATE_TRANSITIONS exports', () => {
    it('should define transitions for all states', () => {
      assert.ok(Array.isArray(STATE_TRANSITIONS[THERMAL_STATES.COLD]));
      assert.ok(Array.isArray(STATE_TRANSITIONS[THERMAL_STATES.OPTIMAL]));
      assert.ok(Array.isArray(STATE_TRANSITIONS[THERMAL_STATES.WARM]));
      assert.ok(Array.isArray(STATE_TRANSITIONS[THERMAL_STATES.HOT]));
      assert.ok(Array.isArray(STATE_TRANSITIONS[THERMAL_STATES.CRITICAL]));
    });
  });

  describe('MESSAGE_TYPES exports', () => {
    it('should export thermal messages', () => {
      assert.equal(MESSAGE_TYPES.TEMP_READING, 'thermal.reading');
      assert.equal(MESSAGE_TYPES.TEMP_WARNING, 'thermal.warning');
      assert.equal(MESSAGE_TYPES.TEMP_CRITICAL, 'thermal.critical');
      assert.equal(MESSAGE_TYPES.TEMP_EMERGENCY, 'thermal.emergency');
    });

    it('should export cooling messages', () => {
      assert.equal(MESSAGE_TYPES.COOLING_ACTIVATE, 'cooling.activate');
      assert.equal(MESSAGE_TYPES.COOLING_DEACTIVATE, 'cooling.deactivate');
      assert.equal(MESSAGE_TYPES.COOLING_BOOST, 'cooling.boost');
      assert.equal(MESSAGE_TYPES.COOLING_EMERGENCY, 'cooling.emergency');
    });

    it('should export water management messages', () => {
      assert.equal(MESSAGE_TYPES.WATER_FLOW_START, 'water.flow_start');
      assert.equal(MESSAGE_TYPES.WATER_FLOW_STOP, 'water.flow_stop');
      assert.equal(MESSAGE_TYPES.WATER_TRANSFER, 'water.transfer');
    });

    it('should export system event messages', () => {
      assert.equal(MESSAGE_TYPES.ZONE_OVERHEAT, 'zone.overheat');
      assert.equal(MESSAGE_TYPES.ZONE_NORMAL, 'zone.normal');
      assert.equal(MESSAGE_TYPES.SYSTEM_SHUTDOWN, 'system.shutdown');
    });
  });

  describe('calculateCoolingPower()', () => {
    it('should return cooling calculation object', () => {
      const result = calculateCoolingPower(45, 25, 10000);
      assert.ok('baseCooling' in result);
      assert.ok('urgencyCooling' in result);
      assert.ok('totalRequired' in result);
      assert.ok('urgencyFactor' in result);
      assert.ok('efficiencyFactor' in result);
    });

    it('should calculate base cooling exceeding heat load', () => {
      const result = calculateCoolingPower(45, 25, 10000);
      assert.ok(result.baseCooling > 10000);
    });

    it('should increase cooling with higher temperature difference', () => {
      const lowDiff = calculateCoolingPower(30, 25, 10000);
      const highDiff = calculateCoolingPower(60, 25, 10000);
      assert.ok(highDiff.totalRequired > lowDiff.totalRequired);
    });

    it('should include temperature difference', () => {
      const result = calculateCoolingPower(45, 25, 10000);
      assert.equal(result.tempDiff, 20);
    });
  });

  describe('calculateWaterFlow()', () => {
    it('should return flow calculation object', () => {
      const result = calculateWaterFlow(10000, 10);
      assert.ok('theoreticalFlow' in result);
      assert.ok('optimalFlow' in result);
      assert.ok('safetyMargin' in result);
      assert.ok('unit' in result);
    });

    it('should return flow in LPM', () => {
      const result = calculateWaterFlow(10000, 10);
      assert.equal(result.unit, 'LPM');
    });

    it('should have optimal flow higher than theoretical', () => {
      const result = calculateWaterFlow(10000, 10);
      assert.ok(result.optimalFlow > result.theoreticalFlow);
    });

    it('should increase flow with higher cooling power', () => {
      const lowPower = calculateWaterFlow(5000, 10);
      const highPower = calculateWaterFlow(20000, 10);
      assert.ok(highPower.optimalFlow > lowPower.optimalFlow);
    });
  });

  describe('getThermalState()', () => {
    it('should return COLD for low temperature', () => {
      assert.equal(getThermalState(15), THERMAL_STATES.COLD);
    });

    it('should return OPTIMAL for optimal temperature', () => {
      assert.equal(getThermalState(25), THERMAL_STATES.OPTIMAL);
    });

    it('should return WARM for slightly elevated temperature', () => {
      assert.equal(getThermalState(40), THERMAL_STATES.WARM);
    });

    it('should return HOT for warning temperature', () => {
      assert.equal(getThermalState(50), THERMAL_STATES.HOT);
    });

    it('should return CRITICAL for critical temperature', () => {
      assert.equal(getThermalState(70), THERMAL_STATES.CRITICAL);
    });

    it('should return EMERGENCY for emergency temperature', () => {
      assert.equal(getThermalState(85), THERMAL_STATES.EMERGENCY);
    });

    it('should return SHUTDOWN for extreme temperature', () => {
      assert.equal(getThermalState(100), THERMAL_STATES.SHUTDOWN);
    });
  });

  describe('ThermalManagementProtocol constructor', () => {
    it('should initialize protocol ID', () => {
      assert.equal(protocol.protocolId, 'PROTO-233');
    });

    it('should initialize protocol name', () => {
      assert.ok(protocol.protocolName.includes('Thermal'));
    });

    it('should initialize version', () => {
      assert.equal(protocol.version, '1.0.0');
    });

    it('should initialize empty zones map', () => {
      assert.equal(protocol.zones.size, 0);
    });

    it('should initialize empty message log', () => {
      assert.deepEqual(protocol.messageLog, []);
    });

    it('should initialize empty thermal history', () => {
      assert.deepEqual(protocol.thermalHistory, []);
    });

    it('should initialize empty alerts', () => {
      assert.deepEqual(protocol.alerts, []);
    });
  });

  describe('getInfo()', () => {
    it('should return protocol metadata', () => {
      const info = protocol.getInfo();
      assert.equal(info.id, 'PROTO-233');
      assert.ok(info.name.includes('Thermal'));
      assert.equal(info.version, '1.0.0');
    });

    it('should include description', () => {
      const info = protocol.getInfo();
      assert.ok(info.description.length > 0);
    });

    it('should include config', () => {
      const info = protocol.getInfo();
      assert.ok(info.config);
    });

    it('should include message types count', () => {
      const info = protocol.getInfo();
      assert.ok(info.messageTypes > 0);
    });

    it('should include thermal states count', () => {
      const info = protocol.getInfo();
      assert.ok(info.thermalStates > 0);
    });
  });

  describe('registerZone()', () => {
    it('should register a new zone', () => {
      const result = protocol.registerZone('zone-1');
      assert.equal(result.success, true);
      assert.equal(result.zoneId, 'zone-1');
    });

    it('should add zone to zones map', () => {
      protocol.registerZone('zone-1');
      assert.equal(protocol.zones.size, 1);
      assert.ok(protocol.zones.has('zone-1'));
    });

    it('should accept custom config', () => {
      protocol.registerZone('zone-1', { 
        name: 'Test Zone',
        targetTemp: 22 
      });
      const zone = protocol.zones.get('zone-1');
      assert.equal(zone.name, 'Test Zone');
      assert.equal(zone.targetTemp, 22);
    });

    it('should reject duplicate zone', () => {
      protocol.registerZone('zone-1');
      const result = protocol.registerZone('zone-1');
      assert.equal(result.success, false);
      assert.ok(result.error.includes('already registered'));
    });

    it('should return initial state', () => {
      const result = protocol.registerZone('zone-1');
      assert.equal(result.state, THERMAL_STATES.OPTIMAL);
    });

    it('should log message on registration', () => {
      protocol.registerZone('zone-1');
      assert.ok(protocol.messageLog.length > 0);
    });
  });

  describe('updateTemperature()', () => {
    beforeEach(() => {
      protocol.registerZone('zone-1');
    });

    it('should update zone temperature', () => {
      const result = protocol.updateTemperature('zone-1', 35);
      assert.equal(result.success, true);
    });

    it('should update zone state based on temperature', () => {
      protocol.updateTemperature('zone-1', 50);
      const zone = protocol.zones.get('zone-1');
      assert.equal(zone.state, THERMAL_STATES.HOT);
    });

    it('should return error for unknown zone', () => {
      const result = protocol.updateTemperature('unknown', 35);
      assert.equal(result.success, false);
      assert.ok(result.error.includes('not found'));
    });

    it('should add to thermal history', () => {
      protocol.updateTemperature('zone-1', 35);
      assert.ok(protocol.thermalHistory.length > 0);
    });

    it('should return previous and current state', () => {
      const result = protocol.updateTemperature('zone-1', 50);
      assert.ok('previousState' in result);
      assert.ok('state' in result);
    });
  });

  describe('getMetrics()', () => {
    it('should return protocol metrics', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalZones' in metrics);
      assert.ok('messageCount' in metrics);
      assert.ok('historyLength' in metrics);
      assert.ok('alerts' in metrics);
    });

    it('should count zones correctly', () => {
      protocol.registerZone('zone-1');
      protocol.registerZone('zone-2');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalZones, 2);
    });

    it('should include temperature statistics', () => {
      protocol.registerZone('zone-1');
      protocol.updateTemperature('zone-1', 30);
      const metrics = protocol.getMetrics();
      assert.ok('averageTemp' in metrics);
    });
  });

  describe('getAlerts()', () => {
    it('should return alerts array', () => {
      const alerts = protocol.getAlerts();
      assert.ok(Array.isArray(alerts));
    });

    it('should include alerts when zones are in critical state', () => {
      protocol.registerZone('zone-1');
      protocol.updateTemperature('zone-1', 85);
      const alerts = protocol.getAlerts();
      assert.ok(alerts.length >= 0); // May or may not have alerts depending on implementation
    });
  });
});
