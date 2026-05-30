const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// Import using dynamic import for ES modules
let HebbianLearningProtocol;

describe('HebbianLearningProtocol', () => {
  let protocol;

  beforeEach(async () => {
    // Dynamically import ES module
    const module = await import('../../protocols/hebbian-learning-protocol.js');
    HebbianLearningProtocol = module.HebbianLearningProtocol;
    protocol = new HebbianLearningProtocol();
  });

  describe('constructor', () => {
    it('should initialize with default learning rate', async () => {
      const module = await import('../../protocols/hebbian-learning-protocol.js');
      const proto = new module.HebbianLearningProtocol();
      assert.equal(proto.learningRate, 0.01);
    });

    it('should initialize with default weight decay', async () => {
      const module = await import('../../protocols/hebbian-learning-protocol.js');
      const proto = new module.HebbianLearningProtocol();
      assert.equal(proto.weightDecay, 0.001);
    });

    it('should accept custom config', async () => {
      const module = await import('../../protocols/hebbian-learning-protocol.js');
      const proto = new module.HebbianLearningProtocol({ eta: 0.05, lambda: 0.01 });
      assert.equal(proto.learningRate, 0.05);
      assert.equal(proto.weightDecay, 0.01);
    });

    it('should initialize empty neuron and synapse maps', async () => {
      const module = await import('../../protocols/hebbian-learning-protocol.js');
      const proto = new module.HebbianLearningProtocol();
      assert.equal(proto.neurons.size, 0);
      assert.equal(proto.synapses.size, 0);
    });

    it('should initialize counters to zero', async () => {
      const module = await import('../../protocols/hebbian-learning-protocol.js');
      const proto = new module.HebbianLearningProtocol();
      assert.equal(proto.totalUpdates, 0);
      assert.equal(proto.ltpEvents, 0);
      assert.equal(proto.ltdEvents, 0);
    });
  });

  describe('registerNeuron()', () => {
    it('should add neuron to neurons map', () => {
      protocol.registerNeuron('n1');
      assert.ok(protocol.neurons.has('n1'));
    });

    it('should return the neuron id', () => {
      const id = protocol.registerNeuron('n1');
      assert.equal(id, 'n1');
    });

    it('should initialize neuron with default activation', () => {
      protocol.registerNeuron('n1');
      const neuron = protocol.neurons.get('n1');
      assert.equal(neuron.activation, 0);
    });

    it('should accept initial activation value', () => {
      protocol.registerNeuron('n1', 0.5);
      const neuron = protocol.neurons.get('n1');
      assert.equal(neuron.activation, 0.5);
    });

    it('should initialize fire count to zero', () => {
      protocol.registerNeuron('n1');
      const neuron = protocol.neurons.get('n1');
      assert.equal(neuron.fireCount, 0);
    });

    it('should initialize lastFired to null', () => {
      protocol.registerNeuron('n1');
      const neuron = protocol.neurons.get('n1');
      assert.equal(neuron.lastFired, null);
    });
  });

  describe('connect()', () => {
    beforeEach(() => {
      protocol.registerNeuron('pre');
      protocol.registerNeuron('post');
    });

    it('should create synapse between neurons', () => {
      protocol.connect('pre', 'post');
      assert.ok(protocol.synapses.has('pre->post'));
    });

    it('should return synapse key', () => {
      const key = protocol.connect('pre', 'post');
      assert.equal(key, 'pre->post');
    });

    it('should set default initial weight of 0.5', () => {
      protocol.connect('pre', 'post');
      const synapse = protocol.synapses.get('pre->post');
      assert.equal(synapse.weight, 0.5);
    });

    it('should accept custom initial weight', () => {
      protocol.connect('pre', 'post', 0.8);
      const synapse = protocol.synapses.get('pre->post');
      assert.equal(synapse.weight, 0.8);
    });

    it('should throw if pre neuron not registered', () => {
      assert.throws(
        () => protocol.connect('unknown', 'post'),
        /must be registered before connecting/
      );
    });

    it('should throw if post neuron not registered', () => {
      assert.throws(
        () => protocol.connect('pre', 'unknown'),
        /must be registered before connecting/
      );
    });

    it('should initialize trace to zero', () => {
      protocol.connect('pre', 'post');
      const synapse = protocol.synapses.get('pre->post');
      assert.equal(synapse.trace, 0);
    });

    it('should initialize updateCount to zero', () => {
      protocol.connect('pre', 'post');
      const synapse = protocol.synapses.get('pre->post');
      assert.equal(synapse.updateCount, 0);
    });
  });

  describe('fire()', () => {
    beforeEach(() => {
      protocol.registerNeuron('n1');
      protocol.registerNeuron('n2');
      protocol.connect('n1', 'n2');
    });

    it('should update neuron activation', () => {
      protocol.fire('n1', 0.8);
      const neuron = protocol.neurons.get('n1');
      assert.equal(neuron.activation, 0.8);
    });

    it('should clamp activation to [0, 1]', () => {
      protocol.fire('n1', 1.5);
      assert.equal(protocol.neurons.get('n1').activation, 1);
      
      protocol.fire('n1', -0.5);
      assert.equal(protocol.neurons.get('n1').activation, 0);
    });

    it('should increment fire count', () => {
      protocol.fire('n1', 0.5);
      protocol.fire('n1', 0.6);
      assert.equal(protocol.neurons.get('n1').fireCount, 2);
    });

    it('should update lastFired timestamp', () => {
      const before = Date.now();
      protocol.fire('n1', 0.5);
      const after = Date.now();
      const neuron = protocol.neurons.get('n1');
      assert.ok(neuron.lastFired >= before);
      assert.ok(neuron.lastFired <= after);
    });

    it('should return result object', () => {
      const result = protocol.fire('n1', 0.8);
      assert.equal(result.neuronId, 'n1');
      assert.equal(result.oldActivation, 0);
      assert.equal(result.newActivation, 0.8);
    });

    it('should update eligibility trace on outgoing synapses', () => {
      protocol.fire('n1', 0.8);
      const synapse = protocol.synapses.get('n1->n2');
      assert.ok(synapse.trace > 0);
    });

    it('should handle unknown neuron gracefully', () => {
      const result = protocol.fire('unknown', 0.5);
      assert.equal(result, undefined);
    });
  });

  describe('update()', () => {
    beforeEach(() => {
      protocol.registerNeuron('pre', 0.8);
      protocol.registerNeuron('post', 0.7);
      protocol.connect('pre', 'post', 0.5);
    });

    it('should increment totalUpdates counter', () => {
      protocol.update();
      assert.equal(protocol.totalUpdates, 1);
    });

    it('should return array of weight updates', () => {
      const updates = protocol.update();
      assert.ok(Array.isArray(updates));
      assert.equal(updates.length, 1);
    });

    it('should include synapse key in update', () => {
      const updates = protocol.update();
      assert.equal(updates[0].synapse, 'pre->post');
    });

    it('should include old and new weights', () => {
      const updates = protocol.update();
      assert.ok('oldWeight' in updates[0]);
      assert.ok('newWeight' in updates[0]);
      assert.ok('delta' in updates[0]);
    });

    it('should modify synapse weight based on Hebbian rule', () => {
      const oldWeight = protocol.synapses.get('pre->post').weight;
      protocol.update();
      const newWeight = protocol.synapses.get('pre->post').weight;
      // Weight should change (pre * post > 0)
      assert.notEqual(oldWeight, newWeight);
    });

    it('should track LTP events (weight increase)', () => {
      // High pre and post activation should cause LTP
      protocol.neurons.get('pre').activation = 0.9;
      protocol.neurons.get('post').activation = 0.9;
      protocol.update();
      assert.ok(protocol.ltpEvents > 0 || protocol.ltdEvents > 0);
    });

    it('should clamp weight to [0, 1]', () => {
      // Set up conditions for large weight increase
      protocol.synapses.get('pre->post').weight = 0.99;
      protocol.neurons.get('pre').activation = 1.0;
      protocol.neurons.get('post').activation = 1.0;
      protocol.update();
      assert.ok(protocol.synapses.get('pre->post').weight <= 1);
    });

    it('should decay synapse trace', () => {
      protocol.fire('pre', 0.8);
      const traceBefore = protocol.synapses.get('pre->post').trace;
      protocol.update();
      const traceAfter = protocol.synapses.get('pre->post').trace;
      assert.ok(traceAfter < traceBefore);
    });

    it('should increment synapse updateCount', () => {
      protocol.update();
      assert.equal(protocol.synapses.get('pre->post').updateCount, 1);
    });
  });

  describe('reinforce()', () => {
    beforeEach(() => {
      protocol.registerNeuron('n1');
      protocol.registerNeuron('n2');
      protocol.connect('n1', 'n2', 0.5);
    });

    it('should not modify weights if trace is low', () => {
      const weightBefore = protocol.synapses.get('n1->n2').weight;
      protocol.reinforce(1.0);
      const weightAfter = protocol.synapses.get('n1->n2').weight;
      assert.equal(weightBefore, weightAfter);
    });

    it('should modify weights with high trace and positive reward', () => {
      // Set up high trace
      protocol.synapses.get('n1->n2').trace = 0.5;
      const weightBefore = protocol.synapses.get('n1->n2').weight;
      protocol.reinforce(1.0);
      const weightAfter = protocol.synapses.get('n1->n2').weight;
      assert.ok(weightAfter > weightBefore);
    });

    it('should reduce weights with negative reward', () => {
      protocol.synapses.get('n1->n2').trace = 0.5;
      const weightBefore = protocol.synapses.get('n1->n2').weight;
      protocol.reinforce(-1.0);
      const weightAfter = protocol.synapses.get('n1->n2').weight;
      assert.ok(weightAfter < weightBefore);
    });

    it('should clamp weight to [0, 1]', () => {
      protocol.synapses.get('n1->n2').trace = 0.9;
      protocol.synapses.get('n1->n2').weight = 0.99;
      protocol.reinforce(10.0);
      assert.ok(protocol.synapses.get('n1->n2').weight <= 1);
    });
  });

  describe('getNetworkState()', () => {
    beforeEach(() => {
      protocol.registerNeuron('n1', 0.5);
      protocol.registerNeuron('n2', 0.3);
      protocol.connect('n1', 'n2', 0.7);
    });

    it('should return neurons array', () => {
      const state = protocol.getNetworkState();
      assert.ok(Array.isArray(state.neurons));
      assert.equal(state.neurons.length, 2);
    });

    it('should include neuron properties', () => {
      const state = protocol.getNetworkState();
      const n1 = state.neurons.find(n => n.id === 'n1');
      assert.ok(n1);
      assert.equal(n1.activation, 0.5);
      assert.equal(n1.fireCount, 0);
    });

    it('should return synapses array', () => {
      const state = protocol.getNetworkState();
      assert.ok(Array.isArray(state.synapses));
      assert.equal(state.synapses.length, 1);
    });

    it('should include synapse properties', () => {
      const state = protocol.getNetworkState();
      const syn = state.synapses[0];
      assert.equal(syn.key, 'n1->n2');
      assert.equal(syn.weight, 0.7);
      assert.ok('trace' in syn);
    });

    it('should include LTP/LTD statistics', () => {
      const state = protocol.getNetworkState();
      assert.ok('ltpEvents' in state);
      assert.ok('ltdEvents' in state);
      assert.ok('ltpLtdRatio' in state);
    });

    it('should include protocol constants', () => {
      const state = protocol.getNetworkState();
      assert.ok(Math.abs(state.phi - 1.618) < 0.001);
      assert.equal(state.heartbeat, 873);
    });

    it('should calculate ltpLtdRatio correctly', () => {
      protocol.ltpEvents = 10;
      protocol.ltdEvents = 5;
      const state = protocol.getNetworkState();
      assert.equal(state.ltpLtdRatio, 2);
    });

    it('should return phi when ltdEvents is 0', () => {
      protocol.ltpEvents = 10;
      protocol.ltdEvents = 0;
      const state = protocol.getNetworkState();
      assert.ok(Math.abs(state.ltpLtdRatio - 1.618) < 0.001);
    });
  });
});
