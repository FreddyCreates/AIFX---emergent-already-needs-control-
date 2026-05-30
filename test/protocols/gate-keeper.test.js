const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('GateKeeperProtocol', () => {
  let GateKeeperProtocol;
  let GATE_CONFIG;
  let MESSAGE_TYPES;
  let GATE_STATES;
  let STATE_TRANSITIONS;
  let calculateThreatScore;
  let calculateTollAmount;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/gate-keeper-protocol.js');
    GateKeeperProtocol = module.GateKeeperProtocol;
    GATE_CONFIG = module.GATE_CONFIG;
    MESSAGE_TYPES = module.MESSAGE_TYPES;
    GATE_STATES = module.GATE_STATES;
    STATE_TRANSITIONS = module.STATE_TRANSITIONS;
    calculateThreatScore = module.calculateThreatScore;
    calculateTollAmount = module.calculateTollAmount;
    protocol = new GateKeeperProtocol();
  });

  describe('GATE_CONFIG exports', () => {
    it('should export max gates', () => {
      assert.ok(GATE_CONFIG.MAX_GATES > 0);
    });

    it('should export min keepers per gate', () => {
      assert.ok(GATE_CONFIG.MIN_KEEPERS_PER_GATE >= 0);
    });

    it('should export toll base rate', () => {
      assert.ok(GATE_CONFIG.TOLL_BASE_RATE >= 0);
    });

    it('should export phi multiplier', () => {
      assert.ok(GATE_CONFIG.TOLL_PHI_MULTIPLIER > 0);
    });

    it('should export heartbeat interval', () => {
      assert.ok(GATE_CONFIG.HEARTBEAT_INTERVAL > 0);
    });

    it('should export quarantine threshold', () => {
      assert.ok(GATE_CONFIG.QUARANTINE_THRESHOLD > 0);
      assert.ok(GATE_CONFIG.QUARANTINE_THRESHOLD <= 1);
    });
  });

  describe('GATE_STATES exports', () => {
    it('should export all gate states', () => {
      assert.equal(GATE_STATES.UNREGISTERED, 'unregistered');
      assert.equal(GATE_STATES.REGISTERED, 'registered');
      assert.equal(GATE_STATES.ACTIVATING, 'activating');
      assert.equal(GATE_STATES.ACTIVE, 'active');
      assert.equal(GATE_STATES.OVERLOADED, 'overloaded');
      assert.equal(GATE_STATES.MAINTENANCE, 'maintenance');
      assert.equal(GATE_STATES.DEACTIVATING, 'deactivating');
      assert.equal(GATE_STATES.DEACTIVATED, 'deactivated');
    });
  });

  describe('STATE_TRANSITIONS exports', () => {
    it('should define transitions for registered state', () => {
      assert.ok(Array.isArray(STATE_TRANSITIONS[GATE_STATES.REGISTERED]));
    });

    it('should define transitions for active state', () => {
      assert.ok(Array.isArray(STATE_TRANSITIONS[GATE_STATES.ACTIVE]));
    });

    it('should allow registered to activating transition', () => {
      assert.ok(STATE_TRANSITIONS[GATE_STATES.REGISTERED].includes(GATE_STATES.ACTIVATING));
    });
  });

  describe('MESSAGE_TYPES exports', () => {
    it('should export gate lifecycle messages', () => {
      assert.equal(MESSAGE_TYPES.GATE_REGISTER, 'gate.register');
      assert.equal(MESSAGE_TYPES.GATE_ACTIVATE, 'gate.activate');
      assert.equal(MESSAGE_TYPES.GATE_DEACTIVATE, 'gate.deactivate');
      assert.equal(MESSAGE_TYPES.GATE_HEARTBEAT, 'gate.heartbeat');
    });

    it('should export keeper messages', () => {
      assert.equal(MESSAGE_TYPES.KEEPER_DEPLOY, 'keeper.deploy');
      assert.equal(MESSAGE_TYPES.KEEPER_RECALL, 'keeper.recall');
      assert.equal(MESSAGE_TYPES.KEEPER_STATUS, 'keeper.status');
    });

    it('should export traffic messages', () => {
      assert.equal(MESSAGE_TYPES.TRAFFIC_ADMIT, 'traffic.admit');
      assert.equal(MESSAGE_TYPES.TRAFFIC_DENY, 'traffic.deny');
      assert.equal(MESSAGE_TYPES.TRAFFIC_QUARANTINE, 'traffic.quarantine');
    });

    it('should export toll messages', () => {
      assert.equal(MESSAGE_TYPES.TOLL_CALCULATE, 'toll.calculate');
      assert.equal(MESSAGE_TYPES.TOLL_COLLECT, 'toll.collect');
      assert.equal(MESSAGE_TYPES.TOLL_RECEIPT, 'toll.receipt');
    });

    it('should export inter-gate messages', () => {
      assert.equal(MESSAGE_TYPES.GATE_SYNC, 'gate.sync');
      assert.equal(MESSAGE_TYPES.THREAT_BROADCAST, 'gate.threat_broadcast');
      assert.equal(MESSAGE_TYPES.LOAD_BALANCE, 'gate.load_balance');
    });
  });

  describe('calculateThreatScore()', () => {
    it('should return threat calculation object', () => {
      const result = calculateThreatScore({ type: 'scan' });
      assert.ok('score' in result);
      assert.ok('level' in result);
      assert.ok('factors' in result);
    });

    it('should return score between 0 and 1', () => {
      const result = calculateThreatScore({ type: 'normal' });
      assert.ok(result.score >= 0 && result.score <= 1);
    });

    it('should include level classification', () => {
      const result = calculateThreatScore({ type: 'scan', frequency: 100 });
      assert.ok(result.level);
    });
  });

  describe('calculateTollAmount()', () => {
    it('should return toll calculation', () => {
      const result = calculateTollAmount({ size: 1000 });
      assert.ok('amount' in result);
    });

    it('should return non-negative amount', () => {
      const result = calculateTollAmount({ size: 100 });
      assert.ok(result.amount >= 0);
    });
  });

  describe('GateKeeperProtocol constructor', () => {
    it('should initialize protocol ID', () => {
      assert.equal(protocol.protocolId, 'PROTO-232');
    });

    it('should initialize protocol name', () => {
      assert.equal(protocol.protocolName, 'Gate Keeper Protocol');
    });

    it('should initialize version', () => {
      assert.equal(protocol.version, '1.0.0');
    });

    it('should initialize empty gates map', () => {
      assert.equal(protocol.gates.size, 0);
    });

    it('should initialize empty message log', () => {
      assert.deepEqual(protocol.messageLog, []);
    });

    it('should initialize toll ledger', () => {
      assert.deepEqual(protocol.tollLedger, []);
    });

    it('should initialize threat intel map', () => {
      assert.equal(protocol.threatIntel.size, 0);
    });
  });

  describe('getInfo()', () => {
    it('should return protocol metadata', () => {
      const info = protocol.getInfo();
      assert.equal(info.id, 'PROTO-232');
      assert.equal(info.name, 'Gate Keeper Protocol');
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

    it('should include gate states count', () => {
      const info = protocol.getInfo();
      assert.ok(info.gateStates > 0);
    });
  });

  describe('registerGate()', () => {
    it('should register a new gate', () => {
      const result = protocol.registerGate('gate-1');
      assert.equal(result.success, true);
      assert.equal(result.gateId, 'gate-1');
    });

    it('should add gate to gates map', () => {
      protocol.registerGate('gate-1');
      assert.equal(protocol.gates.size, 1);
      assert.ok(protocol.gates.has('gate-1'));
    });

    it('should accept custom config', () => {
      const result = protocol.registerGate('gate-1', { name: 'Test Gate' });
      assert.equal(result.success, true);
    });

    it('should reject duplicate gate', () => {
      protocol.registerGate('gate-1');
      const result = protocol.registerGate('gate-1');
      assert.equal(result.success, false);
      assert.ok(result.error.includes('already registered'));
    });

    it('should return initial state', () => {
      const result = protocol.registerGate('gate-1');
      assert.equal(result.state, GATE_STATES.REGISTERED);
    });

    it('should log message on registration', () => {
      protocol.registerGate('gate-1');
      assert.ok(protocol.messageLog.length > 0);
    });
  });

  describe('getMetrics()', () => {
    it('should return protocol metrics', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalGates' in metrics);
    });

    it('should count gates correctly', () => {
      protocol.registerGate('gate-1');
      protocol.registerGate('gate-2');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalGates, 2);
    });
  });
});
