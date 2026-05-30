const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('IntelligenceContractProtocol', () => {
  let IntelligenceContract, IntelligenceContractProtocol, CONTRACT_STATES, CONTRACT_TYPES;
  let protocol;
  const PHI = 1.618033988749895;
  const PHI_INV = 1 / PHI;

  beforeEach(async () => {
    const module = await import('../../protocols/intelligence-contract-protocol.js');
    IntelligenceContract = module.IntelligenceContract;
    IntelligenceContractProtocol = module.IntelligenceContractProtocol;
    CONTRACT_STATES = module.CONTRACT_STATES;
    CONTRACT_TYPES = module.CONTRACT_TYPES;
    protocol = new IntelligenceContractProtocol();
  });

  describe('CONTRACT_STATES', () => {
    it('should define DRAFT state', () => {
      assert.equal(CONTRACT_STATES.DRAFT, 'draft');
    });

    it('should define ACTIVE state', () => {
      assert.equal(CONTRACT_STATES.ACTIVE, 'active');
    });

    it('should define WATCHING state', () => {
      assert.equal(CONTRACT_STATES.WATCHING, 'watching');
    });

    it('should define TRIGGERED state', () => {
      assert.equal(CONTRACT_STATES.TRIGGERED, 'triggered');
    });

    it('should define EXECUTING state', () => {
      assert.equal(CONTRACT_STATES.EXECUTING, 'executing');
    });

    it('should define FULFILLED state', () => {
      assert.equal(CONTRACT_STATES.FULFILLED, 'fulfilled');
    });

    it('should define EXPIRED state', () => {
      assert.equal(CONTRACT_STATES.EXPIRED, 'expired');
    });

    it('should define BREACHED state', () => {
      assert.equal(CONTRACT_STATES.BREACHED, 'breached');
    });

    it('should define RENEGOTIATED state', () => {
      assert.equal(CONTRACT_STATES.RENEGOTIATED, 'renegotiated');
    });
  });

  describe('CONTRACT_TYPES', () => {
    it('should define SERVICE type', () => {
      assert.equal(CONTRACT_TYPES.SERVICE, 'service');
    });

    it('should define EXCHANGE type', () => {
      assert.equal(CONTRACT_TYPES.EXCHANGE, 'exchange');
    });

    it('should define SENTINEL type', () => {
      assert.equal(CONTRACT_TYPES.SENTINEL, 'sentinel');
    });

    it('should define LEARNING type', () => {
      assert.equal(CONTRACT_TYPES.LEARNING, 'learning');
    });
  });

  describe('IntelligenceContract', () => {
    describe('constructor', () => {
      it('should create contract with default id', () => {
        const contract = new IntelligenceContract({});
        assert.ok(contract.id);
        assert.ok(contract.id.startsWith('contract-'));
      });

      it('should accept custom id', () => {
        const contract = new IntelligenceContract({ id: 'my-contract' });
        assert.equal(contract.id, 'my-contract');
      });

      it('should default type to SERVICE', () => {
        const contract = new IntelligenceContract({});
        assert.equal(contract.type, CONTRACT_TYPES.SERVICE);
      });

      it('should accept custom type', () => {
        const contract = new IntelligenceContract({ type: CONTRACT_TYPES.SENTINEL });
        assert.equal(contract.type, CONTRACT_TYPES.SENTINEL);
      });

      it('should initialize empty parties array', () => {
        const contract = new IntelligenceContract({});
        assert.ok(Array.isArray(contract.parties));
        assert.equal(contract.parties.length, 0);
      });

      it('should accept custom parties', () => {
        const contract = new IntelligenceContract({ parties: ['agent-1', 'agent-2'] });
        assert.equal(contract.parties.length, 2);
      });

      it('should initialize empty conditions array', () => {
        const contract = new IntelligenceContract({});
        assert.ok(Array.isArray(contract.conditions));
      });

      it('should initialize empty actions array', () => {
        const contract = new IntelligenceContract({});
        assert.ok(Array.isArray(contract.actions));
      });

      it('should set state to DRAFT', () => {
        const contract = new IntelligenceContract({});
        assert.equal(contract.state, CONTRACT_STATES.DRAFT);
      });

      it('should set createdAt timestamp', () => {
        const before = Date.now();
        const contract = new IntelligenceContract({});
        const after = Date.now();
        assert.ok(contract.createdAt >= before);
        assert.ok(contract.createdAt <= after);
      });

      it('should initialize phi-weighted weight', () => {
        const contract = new IntelligenceContract({});
        assert.ok(Math.abs(contract.weight - PHI_INV) < 0.001);
      });

      it('should initialize trigger count to 0', () => {
        const contract = new IntelligenceContract({});
        assert.equal(contract.triggerCount, 0);
      });

      it('should initialize fulfill count to 0', () => {
        const contract = new IntelligenceContract({});
        assert.equal(contract.fulfillCount, 0);
      });
    });

    describe('activate()', () => {
      let contract;

      beforeEach(() => {
        contract = new IntelligenceContract({});
      });

      it('should activate draft contract', () => {
        const result = contract.activate();
        assert.ok(result.activated);
      });

      it('should change state to ACTIVE', () => {
        contract.activate();
        assert.equal(contract.state, CONTRACT_STATES.ACTIVE);
      });

      it('should set activatedAt timestamp', () => {
        const before = Date.now();
        contract.activate();
        const after = Date.now();
        assert.ok(contract.activatedAt >= before);
        assert.ok(contract.activatedAt <= after);
      });

      it('should not activate already active contract', () => {
        contract.activate();
        contract.state = CONTRACT_STATES.WATCHING;
        const result = contract.activate();
        assert.ok(!result.activated);
      });
    });

    describe('watch()', () => {
      let contract;

      beforeEach(() => {
        contract = new IntelligenceContract({});
        contract.activate();
      });

      it('should transition to WATCHING state', () => {
        contract.watch();
        assert.equal(contract.state, CONTRACT_STATES.WATCHING);
      });
    });

    describe('checkConditions()', () => {
      let contract;

      beforeEach(() => {
        contract = new IntelligenceContract({
          conditions: [
            (ctx) => ctx.value > 10,
            (ctx) => ctx.active === true
          ]
        });
        contract.activate();
        contract.watch();
      });

      it('should return true when all conditions met', () => {
        const result = contract.checkConditions({ value: 15, active: true });
        assert.ok(result.allMet || result === true);
      });

      it('should return false when conditions not met', () => {
        const result = contract.checkConditions({ value: 5, active: true });
        assert.ok(!result.allMet && result !== true);
      });
    });

    describe('trigger()', () => {
      let contract;

      beforeEach(() => {
        contract = new IntelligenceContract({});
        contract.activate();
        contract.watch();
      });

      it('should transition to TRIGGERED state', () => {
        contract.trigger();
        assert.equal(contract.state, CONTRACT_STATES.TRIGGERED);
      });

      it('should increment trigger count', () => {
        contract.trigger();
        assert.equal(contract.triggerCount, 1);
      });
    });

    describe('execute()', () => {
      let contract;
      let executed = false;

      beforeEach(() => {
        executed = false;
        contract = new IntelligenceContract({
          actions: [() => { executed = true; }]
        });
        contract.activate();
        contract.watch();
        contract.trigger();
      });

      it('should execute actions', () => {
        contract.execute();
        assert.ok(executed);
      });

      it('should transition to EXECUTING state', () => {
        contract.execute();
        assert.equal(contract.state, CONTRACT_STATES.EXECUTING);
      });
    });

    describe('fulfill()', () => {
      let contract;

      beforeEach(() => {
        contract = new IntelligenceContract({});
        contract.activate();
        contract.watch();
        contract.trigger();
        contract.execute();
      });

      it('should transition to FULFILLED state', () => {
        contract.fulfill();
        assert.equal(contract.state, CONTRACT_STATES.FULFILLED);
      });

      it('should increment fulfill count', () => {
        contract.fulfill();
        assert.equal(contract.fulfillCount, 1);
      });

      it('should increase weight on fulfillment', () => {
        const weightBefore = contract.weight;
        contract.fulfill();
        assert.ok(contract.weight >= weightBefore);
      });

      it('should set fulfilledAt timestamp', () => {
        contract.fulfill();
        assert.ok(contract.fulfilledAt);
      });
    });

    describe('breach()', () => {
      let contract;

      beforeEach(() => {
        contract = new IntelligenceContract({});
        contract.activate();
      });

      it('should transition to BREACHED state', () => {
        contract.breach('reason');
        assert.equal(contract.state, CONTRACT_STATES.BREACHED);
      });

      it('should decrease weight on breach', () => {
        const weightBefore = contract.weight;
        contract.breach('reason');
        assert.ok(contract.weight <= weightBefore);
      });
    });

    describe('expire()', () => {
      let contract;

      beforeEach(() => {
        contract = new IntelligenceContract({ ttl: 1000 });
        contract.activate();
      });

      it('should transition to EXPIRED state', () => {
        contract.expire();
        assert.equal(contract.state, CONTRACT_STATES.EXPIRED);
      });
    });

    describe('getState()', () => {
      it('should return current state', () => {
        const contract = new IntelligenceContract({});
        const state = contract.getState();
        assert.ok(state);
      });
    });
  });

  describe('IntelligenceContractProtocol', () => {
    describe('constructor', () => {
      it('should initialize empty contracts map', () => {
        assert.ok(protocol.contracts instanceof Map);
      });

      it('should initialize empty active contracts set', () => {
        assert.ok(protocol.activeContracts instanceof Set);
      });
    });

    describe('createContract()', () => {
      it('should create and register contract', () => {
        const contract = protocol.createContract({
          type: CONTRACT_TYPES.SERVICE
        });
        assert.ok(contract);
        assert.ok(protocol.contracts.has(contract.id));
      });
    });

    describe('activateContract()', () => {
      it('should activate contract by id', () => {
        const contract = protocol.createContract({});
        const result = protocol.activateContract(contract.id);
        assert.ok(result.activated);
      });

      it('should add to active contracts', () => {
        const contract = protocol.createContract({});
        protocol.activateContract(contract.id);
        assert.ok(protocol.activeContracts.has(contract.id));
      });
    });

    describe('tick()', () => {
      it('should check all active contracts', () => {
        const contract = protocol.createContract({
          conditions: [() => true]
        });
        protocol.activateContract(contract.id);
        
        const result = protocol.tick({});
        assert.ok(result);
      });
    });

    describe('getMetrics()', () => {
      it('should return metrics object', () => {
        const metrics = protocol.getMetrics();
        assert.ok(metrics);
      });

      it('should include contract count', () => {
        protocol.createContract({});
        const metrics = protocol.getMetrics();
        assert.ok(metrics.totalContracts >= 1 || metrics.contractCount >= 1);
      });
    });
  });
});
