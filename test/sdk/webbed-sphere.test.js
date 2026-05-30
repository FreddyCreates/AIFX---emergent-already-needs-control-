const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('Webbed Sphere SDK', () => {
  let WebbedSphere, SphereNetwork, PhiWeightEngine, SPHERE_SHELLS, NODE_TYPES;

  beforeEach(async () => {
    const mod = await import('../../sdk/ai-kingdom/src/webbed-sphere.js');
    WebbedSphere = mod.WebbedSphere;
    SphereNetwork = mod.SphereNetwork;
    PhiWeightEngine = mod.PhiWeightEngine;
    SPHERE_SHELLS = mod.SPHERE_SHELLS;
    NODE_TYPES = mod.NODE_TYPES;
  });

  describe('PhiWeightEngine', () => {
    it('edgeWeight is always dynamic (varies with inputs)', () => {
      const w1 = PhiWeightEngine.edgeWeight(0.5, 10, 0.1);
      const w2 = PhiWeightEngine.edgeWeight(0.5, 100, 0.1);
      assert.notEqual(w1, w2, 'Weights must not be fixed — they change with age');
    });

    it('goldenSpiralPosition distributes nodes evenly', () => {
      const pos1 = PhiWeightEngine.goldenSpiralPosition(0, 100);
      const pos2 = PhiWeightEngine.goldenSpiralPosition(50, 100);
      assert.ok(pos1.theta !== pos2.theta || pos1.phi !== pos2.phi);
    });
  });

  describe('WebbedSphere', () => {
    let sphere;

    beforeEach(() => {
      sphere = new WebbedSphere();
    });

    it('starts in forming state', () => {
      assert.equal(sphere.state, 'forming');
    });

    it('addNode places node in correct shell', () => {
      const node = sphere.addNode('n1', 3, NODE_TYPES.COMPUTE);
      assert.equal(node.shell, 3);
      assert.equal(node.type, NODE_TYPES.COMPUTE);
    });

    it('transitions to stable after adding enough nodes', () => {
      sphere.addNode('a', 0);
      sphere.addNode('b', 0);
      sphere.addNode('c', 1);
      sphere.addNode('d', 1);
      assert.equal(sphere.state, 'stable');
    });

    it('connect forms edge with dynamic weight', () => {
      sphere = new WebbedSphere({ autoConnect: false });
      sphere.addNode('x', 0);
      sphere.addNode('y', 1);
      const edge = sphere.connect('x', 'y');
      assert.ok(edge);
      assert.ok(edge.weight > 0);
    });

    it('getEdgeWeight computes fresh weight each time', () => {
      sphere.addNode('a', 0);
      sphere.addNode('b', 1);
      sphere.connect('a', 'b');
      const w1 = sphere.getEdgeWeight('a', 'b');
      // Age the edge
      sphere.heartbeat();
      sphere.heartbeat();
      const w2 = sphere.getEdgeWeight('a', 'b');
      // Weight changes because age increased
      assert.notEqual(w1, w2, 'Weight must change with heartbeats (not fixed)');
    });

    it('route finds a path', () => {
      sphere.addNode('a', 0);
      sphere.addNode('b', 0);
      sphere.addNode('c', 1);
      sphere.connect('a', 'b');
      sphere.connect('b', 'c');
      const result = sphere.route('a', 'c');
      assert.ok(result);
      assert.ok(result.hops >= 1);
    });

    it('heartbeat ages edges and decays traffic', () => {
      sphere.addNode('a', 0);
      sphere.addNode('b', 0);
      sphere.connect('a', 'b');
      const node = sphere.nodes.get('a');
      const edge = node.edges.get('b');
      edge.lastTraffic = 0.8;
      sphere.heartbeat();
      assert.ok(edge.lastTraffic < 0.8, 'Traffic should decay after heartbeat');
      assert.equal(edge.age, 1);
    });

    it('removeNode triggers healing', () => {
      sphere.addNode('a', 0);
      sphere.addNode('b', 0);
      sphere.addNode('c', 1);
      sphere.connect('a', 'b');
      sphere.connect('b', 'c');
      sphere.removeNode('b');
      assert.equal(sphere.state, 'healing');
      assert.ok(sphere.healQueue.length > 0);
    });

    it('heal repairs the mesh', () => {
      sphere.addNode('a', 0);
      sphere.addNode('b', 0);
      sphere.addNode('c', 1);
      sphere.addNode('d', 1);
      sphere.connect('a', 'b');
      sphere.connect('b', 'c');
      sphere.removeNode('b');
      const healed = sphere.heal();
      // Should have tried to heal
      assert.ok(Array.isArray(healed));
    });

    it('rebalanceShell distributes load via φ-functions', () => {
      sphere.addNode('a', 0);
      sphere.addNode('b', 0);
      sphere.addNode('c', 0);
      sphere.nodes.get('a').load = 0.9;
      sphere.nodes.get('b').load = 0.1;
      sphere.nodes.get('c').load = 0.5;
      const assignments = sphere.rebalanceShell(0);
      assert.equal(assignments.length, 3);
      // Node with most headroom gets positive delta
      const bAssignment = assignments.find(a => a.id === 'b');
      assert.ok(bAssignment.delta > 0, 'Node with headroom should receive more load');
    });

    it('findResonant discovers golden-angle aligned nodes', () => {
      sphere.addNode('center', 0);
      for (let i = 0; i < 10; i++) {
        sphere.addNode(`n${i}`, 1);
      }
      const resonant = sphere.findResonant('center');
      assert.ok(Array.isArray(resonant));
    });

    it('getStatus returns complete state', () => {
      sphere.addNode('a', 0);
      const status = sphere.getStatus();
      assert.ok('state' in status);
      assert.ok('nodes' in status);
      assert.ok('edges' in status);
      assert.ok('shells' in status);
      assert.ok('stats' in status);
    });
  });

  describe('SphereNetwork', () => {
    it('creates and manages multiple spheres', () => {
      const network = new SphereNetwork();
      const s1 = network.createSphere('realm-a');
      const s2 = network.createSphere('realm-b');
      s1.addNode('a1', 0);
      s2.addNode('b1', 0);
      const status = network.getStatus();
      assert.ok(status['realm-a']);
      assert.ok(status['realm-b']);
    });
  });

  describe('SPHERE_SHELLS constants', () => {
    it('has 8 shells from CORE to EDGE', () => {
      const shells = Object.keys(SPHERE_SHELLS);
      assert.equal(shells.length, 8);
      assert.ok(shells.includes('CORE'));
      assert.ok(shells.includes('EDGE'));
    });

    it('each shell radius follows φ^n', () => {
      const PHI = 1.618033988749895;
      assert.ok(Math.abs(SPHERE_SHELLS.INNER.radius - PHI) < 0.001);
      assert.ok(Math.abs(SPHERE_SHELLS.NEURAL.radius - PHI ** 2) < 0.001);
    });
  });
});
