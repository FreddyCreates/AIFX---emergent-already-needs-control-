const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('PowerDistributionProtocol', () => {
  let PowerDistributionProtocol;
  let POWER_CONFIG;
  let MESSAGE_TYPES;
  let POWER_STATES;
  let GENERATION_SOURCES;
  let LOAD_PRIORITIES;
  let calculateLoadDistribution;
  let calculateBatteryPlan;
  let calculateTransmissionEfficiency;
  let getPowerState;
  let calculateEnergyExport;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/power-distribution-protocol.js');
    PowerDistributionProtocol = module.PowerDistributionProtocol;
    POWER_CONFIG = module.POWER_CONFIG;
    MESSAGE_TYPES = module.MESSAGE_TYPES;
    POWER_STATES = module.POWER_STATES;
    GENERATION_SOURCES = module.GENERATION_SOURCES;
    LOAD_PRIORITIES = module.LOAD_PRIORITIES;
    calculateLoadDistribution = module.calculateLoadDistribution;
    calculateBatteryPlan = module.calculateBatteryPlan;
    calculateTransmissionEfficiency = module.calculateTransmissionEfficiency;
    getPowerState = module.getPowerState;
    calculateEnergyExport = module.calculateEnergyExport;
    protocol = new PowerDistributionProtocol();
  });

  describe('POWER_CONFIG exports', () => {
    it('should export phi constant', () => {
      assert.ok(POWER_CONFIG.PHI_CONSTANT > 1.6);
      assert.ok(POWER_CONFIG.PHI_CONSTANT < 1.7);
    });

    it('should export battery limits', () => {
      assert.ok(POWER_CONFIG.BATTERY_MIN_CHARGE >= 0);
      assert.ok(POWER_CONFIG.BATTERY_MAX_CHARGE <= 1);
    });

    it('should export load thresholds', () => {
      assert.ok(POWER_CONFIG.WARNING_LOAD_THRESHOLD > 0);
      assert.ok(POWER_CONFIG.CRITICAL_LOAD_THRESHOLD > POWER_CONFIG.WARNING_LOAD_THRESHOLD);
    });

    it('should export charge rate limits', () => {
      assert.ok(POWER_CONFIG.CHARGE_RATE_LIMIT > 0);
      assert.ok(POWER_CONFIG.DISCHARGE_RATE_LIMIT > 0);
    });

    it('should export conversion efficiency', () => {
      assert.ok(POWER_CONFIG.CONVERSION_EFFICIENCY > 0);
      assert.ok(POWER_CONFIG.CONVERSION_EFFICIENCY <= 1);
    });

    it('should export export price', () => {
      assert.ok(POWER_CONFIG.EXPORT_PRICE_PER_KWH > 0);
    });
  });

  describe('POWER_STATES exports', () => {
    it('should export all power states', () => {
      assert.equal(POWER_STATES.BLACKOUT, 'blackout');
      assert.equal(POWER_STATES.EMERGENCY, 'emergency');
      assert.equal(POWER_STATES.CRITICAL, 'critical');
      assert.equal(POWER_STATES.CONSTRAINED, 'constrained');
      assert.equal(POWER_STATES.NORMAL, 'normal');
      assert.equal(POWER_STATES.ABUNDANT, 'abundant');
    });
  });

  describe('MESSAGE_TYPES exports', () => {
    it('should export generation messages', () => {
      assert.equal(MESSAGE_TYPES.GENERATION_ONLINE, 'generation.online');
      assert.equal(MESSAGE_TYPES.GENERATION_OFFLINE, 'generation.offline');
      assert.equal(MESSAGE_TYPES.GENERATION_OUTPUT, 'generation.output');
    });

    it('should export load management messages', () => {
      assert.equal(MESSAGE_TYPES.LOAD_REQUEST, 'load.request');
      assert.equal(MESSAGE_TYPES.LOAD_ALLOCATE, 'load.allocate');
      assert.equal(MESSAGE_TYPES.LOAD_SHED, 'load.shed');
      assert.equal(MESSAGE_TYPES.LOAD_RESTORE, 'load.restore');
    });

    it('should export battery messages', () => {
      assert.equal(MESSAGE_TYPES.BATTERY_CHARGE, 'battery.charge');
      assert.equal(MESSAGE_TYPES.BATTERY_DISCHARGE, 'battery.discharge');
      assert.equal(MESSAGE_TYPES.BATTERY_IDLE, 'battery.idle');
    });
  });

  describe('GENERATION_SOURCES exports', () => {
    it('should export solar source', () => {
      assert.ok(GENERATION_SOURCES.SOLAR);
      assert.equal(GENERATION_SOURCES.SOLAR.id, 'solar');
      assert.ok(GENERATION_SOURCES.SOLAR.phi > 1);
    });

    it('should export wind source', () => {
      assert.ok(GENERATION_SOURCES.WIND);
      assert.equal(GENERATION_SOURCES.WIND.id, 'wind');
    });

    it('should export grid source', () => {
      assert.ok(GENERATION_SOURCES.EXTERNAL_GRID);
      assert.equal(GENERATION_SOURCES.EXTERNAL_GRID.id, 'grid');
    });

    it('should export backup source', () => {
      assert.ok(GENERATION_SOURCES.BACKUP_GENERATOR);
      assert.equal(GENERATION_SOURCES.BACKUP_GENERATOR.id, 'backup');
    });
  });

  describe('LOAD_PRIORITIES exports', () => {
    it('should export critical priority', () => {
      assert.ok(LOAD_PRIORITIES.CRITICAL);
      assert.equal(LOAD_PRIORITIES.CRITICAL.level, 1);
      assert.equal(LOAD_PRIORITIES.CRITICAL.shedable, false);
    });

    it('should export high priority', () => {
      assert.ok(LOAD_PRIORITIES.HIGH);
      assert.equal(LOAD_PRIORITIES.HIGH.level, 2);
    });

    it('should export medium priority', () => {
      assert.ok(LOAD_PRIORITIES.MEDIUM);
      assert.equal(LOAD_PRIORITIES.MEDIUM.level, 3);
    });

    it('should export low priority', () => {
      assert.ok(LOAD_PRIORITIES.LOW);
      assert.equal(LOAD_PRIORITIES.LOW.level, 4);
      assert.equal(LOAD_PRIORITIES.LOW.shedable, true);
    });
  });

  describe('calculateLoadDistribution()', () => {
    it('should distribute power when supply exceeds demand', () => {
      const sectors = [
        { id: 'sector-1', demand: 1000, priority: 1 },
        { id: 'sector-2', demand: 2000, priority: 2 },
      ];
      const result = calculateLoadDistribution(5000, sectors);
      
      assert.equal(result.totalPower, 5000);
      assert.equal(result.totalDemand, 3000);
      assert.equal(result.constrained, false);
      assert.equal(result.unallocated, 2000);
    });

    it('should handle constrained distribution', () => {
      const sectors = [
        { id: 'sector-1', demand: 3000, priority: 1 },
        { id: 'sector-2', demand: 4000, priority: 2 },
      ];
      const result = calculateLoadDistribution(5000, sectors);
      
      assert.equal(result.constrained, true);
      assert.ok(result.loadFactor > 1);
    });

    it('should satisfy all sectors when power is abundant', () => {
      const sectors = [
        { id: 'sector-1', demand: 1000, priority: 1 },
        { id: 'sector-2', demand: 1000, priority: 2 },
      ];
      const result = calculateLoadDistribution(10000, sectors);
      
      result.distribution.forEach(d => {
        assert.equal(d.satisfied, true);
        assert.equal(d.shortfall, 0);
      });
    });

    it('should prioritize higher priority sectors', () => {
      const sectors = [
        { id: 'critical', demand: 1000, priority: 1 },
        { id: 'low', demand: 1000, priority: 4 },
      ];
      const result = calculateLoadDistribution(1500, sectors);
      
      const critical = result.distribution.find(d => d.sectorId === 'critical');
      const low = result.distribution.find(d => d.sectorId === 'low');
      
      assert.ok(critical.allocated >= low.allocated);
    });

    it('should include distribution details for each sector', () => {
      const sectors = [
        { id: 'sector-1', demand: 1000, priority: 1 },
      ];
      const result = calculateLoadDistribution(5000, sectors);
      
      const d = result.distribution[0];
      assert.equal(d.sectorId, 'sector-1');
      assert.equal(d.demand, 1000);
      assert.ok('allocated' in d);
      assert.ok('shortfall' in d);
      assert.ok('priority' in d);
      assert.ok('satisfied' in d);
    });

    it('should handle empty sectors array', () => {
      const result = calculateLoadDistribution(5000, []);
      
      assert.equal(result.totalDemand, 0);
      assert.equal(result.unallocated, 5000);
      assert.deepEqual(result.distribution, []);
    });
  });

  describe('calculateBatteryPlan()', () => {
    it('should return idle when power is balanced', () => {
      const result = calculateBatteryPlan(0.5, 0, 100000);
      assert.equal(result.action, 'idle');
      assert.equal(result.rate, 0);
    });

    it('should charge when there is surplus power', () => {
      const result = calculateBatteryPlan(0.5, 1000, 100000);
      assert.equal(result.action, 'charge');
      assert.ok(result.rate > 0);
      assert.ok(result.targetCharge > 0.5);
    });

    it('should discharge when there is power deficit', () => {
      const result = calculateBatteryPlan(0.5, -1000, 100000);
      assert.equal(result.action, 'discharge');
      assert.ok(result.rate > 0);
      assert.ok(result.targetCharge < 0.5);
    });

    it('should not charge when battery is full', () => {
      const result = calculateBatteryPlan(0.95, 1000, 100000);
      assert.equal(result.action, 'idle');
    });

    it('should not discharge when battery is low', () => {
      const result = calculateBatteryPlan(0.15, -1000, 100000);
      assert.equal(result.action, 'idle');
    });

    it('should indicate battery low status', () => {
      const result = calculateBatteryPlan(0.18, 0, 100000);
      assert.equal(result.batteryLow, true);
    });

    it('should indicate battery full status', () => {
      const result = calculateBatteryPlan(0.92, 0, 100000);
      assert.equal(result.batteryFull, true);
    });

    it('should include headroom values', () => {
      const result = calculateBatteryPlan(0.5, 0, 100000);
      assert.ok('chargeHeadroom' in result);
      assert.ok('dischargeHeadroom' in result);
    });
  });

  describe('calculateTransmissionEfficiency()', () => {
    it('should calculate power loss', () => {
      const result = calculateTransmissionEfficiency(10000, 1000, 1000);
      assert.ok(result.powerLoss >= 0);
      assert.ok(result.outputPower <= result.inputPower);
    });

    it('should calculate efficiency percentage', () => {
      const result = calculateTransmissionEfficiency(10000, 100, 10000);
      assert.ok(result.efficiency > 0);
      assert.ok(result.efficiency <= 100);
    });

    it('should increase loss with distance', () => {
      const short = calculateTransmissionEfficiency(10000, 100, 1000);
      const long = calculateTransmissionEfficiency(10000, 10000, 1000);
      assert.ok(long.powerLoss > short.powerLoss);
    });

    it('should decrease loss with higher voltage', () => {
      const lowV = calculateTransmissionEfficiency(10000, 1000, 1000);
      const highV = calculateTransmissionEfficiency(10000, 1000, 10000);
      assert.ok(highV.powerLoss < lowV.powerLoss);
    });

    it('should suggest optimal voltage', () => {
      const result = calculateTransmissionEfficiency(10000, 1000, 1000);
      assert.ok(result.suggestedVoltage > 0);
    });
  });

  describe('getPowerState()', () => {
    it('should return BLACKOUT for extreme conditions', () => {
      assert.equal(getPowerState(1.3, 0.05), POWER_STATES.BLACKOUT);
    });

    it('should return EMERGENCY for critical conditions', () => {
      assert.equal(getPowerState(1.15, 0.12), POWER_STATES.EMERGENCY);
    });

    it('should return CRITICAL for high load', () => {
      assert.equal(getPowerState(0.95, 0.5), POWER_STATES.CRITICAL);
    });

    it('should return CONSTRAINED for elevated load', () => {
      assert.equal(getPowerState(0.85, 0.5), POWER_STATES.CONSTRAINED);
    });

    it('should return NORMAL for balanced load', () => {
      assert.equal(getPowerState(0.7, 0.5), POWER_STATES.NORMAL);
    });

    it('should return ABUNDANT for low load', () => {
      assert.equal(getPowerState(0.3, 0.5), POWER_STATES.ABUNDANT);
    });
  });

  describe('calculateEnergyExport()', () => {
    it('should calculate energy in kWh', () => {
      const result = calculateEnergyExport(1000, 2);
      assert.equal(result.energyKwh, 2);
    });

    it('should calculate gross revenue', () => {
      const result = calculateEnergyExport(1000, 1);
      assert.ok(result.grossRevenue > 0);
    });

    it('should include volume bonus for large exports', () => {
      const result = calculateEnergyExport(100000, 2);
      assert.ok(result.volumeBonus > 0);
    });

    it('should not include volume bonus for small exports', () => {
      const result = calculateEnergyExport(1000, 1);
      assert.equal(result.volumeBonus, 0);
    });

    it('should return export details', () => {
      const result = calculateEnergyExport(5000, 4);
      assert.equal(result.surplusWatts, 5000);
      assert.equal(result.durationHours, 4);
      assert.ok('netRevenue' in result);
      assert.ok('pricePerKwh' in result);
    });
  });

  describe('PowerDistributionProtocol constructor', () => {
    it('should initialize protocol ID', () => {
      assert.equal(protocol.protocolId, 'PROTO-234');
    });

    it('should initialize protocol name', () => {
      assert.ok(protocol.protocolName.includes('Power'));
    });

    it('should initialize version', () => {
      assert.equal(protocol.version, '1.0.0');
    });

    it('should initialize empty sectors map', () => {
      assert.equal(protocol.sectors.size, 0);
    });

    it('should initialize empty generators map', () => {
      assert.equal(protocol.generators.size, 0);
    });

    it('should initialize empty batteries map', () => {
      assert.equal(protocol.batteries.size, 0);
    });

    it('should initialize empty message log', () => {
      assert.deepEqual(protocol.messageLog, []);
    });

    it('should initialize empty power history', () => {
      assert.deepEqual(protocol.powerHistory, []);
    });

    it('should initialize empty alerts', () => {
      assert.deepEqual(protocol.alerts, []);
    });
  });

  describe('getInfo()', () => {
    it('should return protocol metadata', () => {
      const info = protocol.getInfo();
      assert.equal(info.id, 'PROTO-234');
      assert.ok(info.name.includes('Power'));
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

    it('should include counts', () => {
      const info = protocol.getInfo();
      assert.ok(info.messageTypes > 0);
      assert.ok(info.powerStates > 0);
      assert.ok(info.generationSources > 0);
      assert.ok(info.loadPriorities > 0);
    });
  });

  describe('registerSector()', () => {
    it('should register a new sector', () => {
      const result = protocol.registerSector('sector-1');
      assert.equal(result.success, true);
      assert.equal(result.sectorId, 'sector-1');
    });

    it('should add sector to sectors map', () => {
      protocol.registerSector('sector-1');
      assert.equal(protocol.sectors.size, 1);
      assert.ok(protocol.sectors.has('sector-1'));
    });

    it('should accept custom config', () => {
      protocol.registerSector('sector-1', { 
        name: 'Main Sector',
        priority: LOAD_PRIORITIES.CRITICAL.level,
        maxDemand: 50000 
      });
      const sector = protocol.sectors.get('sector-1');
      assert.equal(sector.name, 'Main Sector');
      assert.equal(sector.priority, 1);
      assert.equal(sector.maxDemand, 50000);
    });

    it('should reject duplicate sector', () => {
      protocol.registerSector('sector-1');
      const result = protocol.registerSector('sector-1');
      assert.equal(result.success, false);
      assert.ok(result.error.includes('already registered'));
    });

    it('should log message on registration', () => {
      protocol.registerSector('sector-1');
      assert.ok(protocol.messageLog.length > 0);
      assert.equal(protocol.messageLog[0].type, MESSAGE_TYPES.LOAD_REQUEST);
    });
  });

  describe('registerGenerator()', () => {
    it('should register a new generator', () => {
      const result = protocol.registerGenerator('gen-1');
      assert.equal(result.success, true);
      assert.equal(result.generatorId, 'gen-1');
    });

    it('should add generator to generators map', () => {
      protocol.registerGenerator('gen-1');
      assert.equal(protocol.generators.size, 1);
      assert.ok(protocol.generators.has('gen-1'));
    });

    it('should accept source type', () => {
      protocol.registerGenerator('gen-1', { 
        sourceType: GENERATION_SOURCES.SOLAR.id 
      });
      const generator = protocol.generators.get('gen-1');
      assert.equal(generator.source.id, 'solar');
    });

    it('should reject duplicate generator', () => {
      protocol.registerGenerator('gen-1');
      const result = protocol.registerGenerator('gen-1');
      assert.equal(result.success, false);
      assert.ok(result.error.includes('already registered'));
    });

    it('should log message on registration', () => {
      protocol.registerGenerator('gen-1');
      assert.ok(protocol.messageLog.some(m => m.type === MESSAGE_TYPES.GENERATION_ONLINE));
    });
  });

  describe('registerBattery()', () => {
    it('should register a new battery', () => {
      const result = protocol.registerBattery('batt-1');
      assert.equal(result.success, true);
      assert.equal(result.batteryId, 'batt-1');
    });

    it('should add battery to batteries map', () => {
      protocol.registerBattery('batt-1');
      assert.equal(protocol.batteries.size, 1);
      assert.ok(protocol.batteries.has('batt-1'));
    });

    it('should accept custom config', () => {
      protocol.registerBattery('batt-1', { 
        capacity: 200000,
        currentCharge: 0.8 
      });
      const battery = protocol.batteries.get('batt-1');
      assert.equal(battery.capacity, 200000);
      assert.equal(battery.currentCharge, 0.8);
    });

    it('should reject duplicate battery', () => {
      protocol.registerBattery('batt-1');
      const result = protocol.registerBattery('batt-1');
      assert.equal(result.success, false);
      assert.ok(result.error.includes('already registered'));
    });

    it('should return charge level', () => {
      const result = protocol.registerBattery('batt-1', { currentCharge: 0.75 });
      assert.equal(result.chargeLevel, 75);
    });
  });

  describe('updateDemand()', () => {
    beforeEach(() => {
      protocol.registerSector('sector-1');
      protocol.registerGenerator('gen-1', { currentOutput: 10000 });
    });

    it('should update sector demand', () => {
      const result = protocol.updateDemand('sector-1', 5000);
      assert.equal(result.success, true);
      assert.equal(result.demand, 5000);
    });

    it('should return error for unknown sector', () => {
      const result = protocol.updateDemand('unknown', 5000);
      assert.equal(result.success, false);
      assert.ok(result.error.includes('not found'));
    });

    it('should calculate allocation', () => {
      const result = protocol.updateDemand('sector-1', 5000);
      assert.ok('allocated' in result);
      assert.ok('satisfied' in result);
    });
  });

  describe('updateGeneratorOutput()', () => {
    beforeEach(() => {
      protocol.registerGenerator('gen-1', { maxOutput: 50000 });
    });

    it('should update generator output', () => {
      const result = protocol.updateGeneratorOutput('gen-1', 10000);
      assert.equal(result.success, true);
      assert.equal(result.output, 10000);
    });

    it('should cap output at max', () => {
      const result = protocol.updateGeneratorOutput('gen-1', 100000);
      assert.equal(result.output, 50000);
    });

    it('should return error for unknown generator', () => {
      const result = protocol.updateGeneratorOutput('unknown', 5000);
      assert.equal(result.success, false);
      assert.ok(result.error.includes('not found'));
    });

    it('should log output change', () => {
      const initialLogLength = protocol.messageLog.length;
      protocol.updateGeneratorOutput('gen-1', 10000);
      assert.ok(protocol.messageLog.length > initialLogLength);
    });
  });

  describe('shedLoad()', () => {
    beforeEach(() => {
      protocol.registerSector('critical-sector', { priority: LOAD_PRIORITIES.CRITICAL.level });
      protocol.registerSector('low-sector', { priority: LOAD_PRIORITIES.LOW.level });
    });

    it('should shed low priority sector', () => {
      const result = protocol.shedLoad('low-sector');
      assert.equal(result.success, true);
      assert.equal(result.isolated, true);
    });

    it('should not shed critical sector', () => {
      const result = protocol.shedLoad('critical-sector');
      assert.equal(result.success, false);
      assert.ok(result.error.includes('priority'));
    });

    it('should isolate sector', () => {
      protocol.shedLoad('low-sector');
      const sector = protocol.sectors.get('low-sector');
      assert.equal(sector.isolated, true);
      assert.equal(sector.allocated, 0);
    });

    it('should return error for unknown sector', () => {
      const result = protocol.shedLoad('unknown');
      assert.equal(result.success, false);
    });

    it('should log shed message', () => {
      protocol.shedLoad('low-sector');
      assert.ok(protocol.messageLog.some(m => m.type === MESSAGE_TYPES.LOAD_SHED));
    });

    it('should create alert', () => {
      protocol.shedLoad('low-sector');
      assert.ok(protocol.alerts.length > 0);
    });
  });

  describe('restoreLoad()', () => {
    beforeEach(() => {
      protocol.registerSector('sector-1', { priority: LOAD_PRIORITIES.LOW.level });
      protocol.shedLoad('sector-1');
    });

    it('should restore shed sector', () => {
      const result = protocol.restoreLoad('sector-1');
      assert.equal(result.success, true);
      assert.equal(result.isolated, false);
    });

    it('should un-isolate sector', () => {
      protocol.restoreLoad('sector-1');
      const sector = protocol.sectors.get('sector-1');
      assert.equal(sector.isolated, false);
    });

    it('should return error for unknown sector', () => {
      const result = protocol.restoreLoad('unknown');
      assert.equal(result.success, false);
    });

    it('should log restore message', () => {
      protocol.restoreLoad('sector-1');
      assert.ok(protocol.messageLog.some(m => m.type === MESSAGE_TYPES.LOAD_RESTORE));
    });
  });

  describe('getMetrics()', () => {
    it('should return protocol metrics', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalSectors' in metrics);
      assert.ok('activeSectors' in metrics);
      assert.ok('totalGenerators' in metrics);
      assert.ok('onlineGenerators' in metrics);
      assert.ok('totalBatteries' in metrics);
      assert.ok('totalGeneration' in metrics);
      assert.ok('totalDemand' in metrics);
      assert.ok('loadFactor' in metrics);
    });

    it('should count sectors correctly', () => {
      protocol.registerSector('sector-1');
      protocol.registerSector('sector-2');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalSectors, 2);
    });

    it('should count generators correctly', () => {
      protocol.registerGenerator('gen-1');
      protocol.registerGenerator('gen-2');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalGenerators, 2);
    });

    it('should count batteries correctly', () => {
      protocol.registerBattery('batt-1');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalBatteries, 1);
    });

    it('should exclude isolated sectors from active count', () => {
      protocol.registerSector('sector-1', { priority: LOAD_PRIORITIES.LOW.level });
      protocol.shedLoad('sector-1');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalSectors, 1);
      assert.equal(metrics.activeSectors, 0);
    });
  });
});
