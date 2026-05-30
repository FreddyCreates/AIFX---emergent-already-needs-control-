const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('Webbed Sphere Networking Protocol', () => {
  let protocol;
  let WebbedSphereNetworkingProtocol, phiEdgeWeight, phiNodeWeight, phiRoutePriority, phiResonance, phiLoadShare, phiHealingUrgency, SPHERE_CONFIG, SPHERE_STATES;

  beforeEach(async () => {
    const mod = await import('../../protocols/webbed-sphere-networking-protocol.js');
    WebbedSphereNetworkingProtocol = mod.WebbedSphereNetworkingProtocol;
    phiEdgeWeight = mod.phiEdgeWeight;
    phiNodeWeight = mod.phiNodeWeight;
    phiRoutePriority = mod.phiRoutePriority;
    phiResonance = mod.phiResonance;
    phiLoadShare = mod.phiLoadShare;
    phiHealingUrgency = mod.phiHealingUrgency;
    SPHERE_CONFIG = mod.SPHERE_CONFIG;
    SPHERE_STATES = mod.SPHERE_STATES;
    protocol = new WebbedSphereNetworkingProtocol();
  });

  describe('φ-weight functions (never fixed)', () => {
    it('phiEdgeWeight changes with distance', () => {
      const near = phiEdgeWeight(0.1, 10, 0.1);
      const far = phiEdgeWeight(2.5, 10, 0.1);
      assert.ok(near > far, 'Closer nodes should have higher edge weight');
    });

    it('phiEdgeWeight changes with age', () => {
      const young = phiEdgeWeight(1.0, 1, 0.1);
      const mature = phiEdgeWeight(1.0, 500, 0.1);
      assert.ok(mature > young, 'Older edges should mature and gain weight');
    });

    it('phiEdgeWeight dampens under load', () => {
      const idle = phiEdgeWeight(1.0, 50, 0.0);
      const loaded = phiEdgeWeight(1.0, 50, 0.9);
      assert.ok(idle > loaded, 'Loaded edges should be dampened');
    });

    it('phiNodeWeight scales with shell depth', () => {
      const core = phiNodeWeight(5, 0);
      const edge = phiNodeWeight(5, 7);
      assert.ok(core > edge, 'Core nodes should have more centrality');
    });

    it('phiRoutePriority decays with hops', () => {
      const short = phiRoutePriority(1, 2);
      const long = phiRoutePriority(5, 2);
      assert.ok(short > long, 'Shorter paths should have higher priority');
    });

    it('phiResonance peaks at golden angle', () => {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const atGolden = phiResonance(goldenAngle);
      const offGolden = phiResonance(goldenAngle + 0.5);
      assert.ok(atGolden > offGolden, 'Golden-angle separation should resonate most');
    });

    it('phiLoadShare returns higher share for more headroom', () => {
      const availableNode = phiLoadShare(1.0, 0.1, 10);
      const busyNode = phiLoadShare(1.0, 0.9, 10);
      assert.ok(availableNode > busyNode, 'Nodes with headroom get more load');
    });

    it('phiHealingUrgency grows with time and path stress', () => {
      const fresh = phiHealingUrgency(1, 2, 0.5);
      const stale = phiHealingUrgency(100, 5, 0.5);
      assert.ok(stale > fresh, 'Longer-broken edges should heal more urgently');
    });
  });

  describe('protocol instance', () => {
    it('starts in forming state', () => {
      assert.equal(protocol.state, SPHERE_STATES.FORMING);
    });

    it('addNode creates a node in correct shell', () => {
      const node = protocol.addNode('n1', 2, 0.5, 1.0);
      assert.equal(node.id, 'n1');
      assert.equal(node.shell, 2);
    });

    it('transitions to stable after 4+ nodes', () => {
      protocol.addNode('a', 0, 0.1, 0.1);
      protocol.addNode('b', 0, 0.5, 0.5);
      protocol.addNode('c', 1, 1.0, 1.0);
      protocol.addNode('d', 1, 1.5, 1.5);
      assert.equal(protocol.state, SPHERE_STATES.STABLE);
    });

    it('formEdge creates a dynamic-weight edge', () => {
      protocol.addNode('x', 0, 0.0, 0.0);
      protocol.addNode('y', 0, 1.0, 1.0);
      const edge = protocol.formEdge('x', 'y');
      assert.ok(edge);
      assert.ok(edge.currentWeight > 0);
      assert.ok(edge.geodesicDist > 0);
    });

    it('routing finds paths through mesh', () => {
      protocol.addNode('a', 0, 0.1, 0.1);
      protocol.addNode('b', 0, 0.5, 0.5);
      protocol.addNode('c', 1, 1.0, 1.0);
      protocol.addNode('d', 1, 1.5, 1.5);
      protocol.formEdge('a', 'b');
      protocol.formEdge('b', 'c');
      protocol.formEdge('c', 'd');
      const result = protocol.route('a', 'd');
      assert.ok(result);
      assert.ok(result.path.length >= 2);
      assert.ok(result.priority > 0);
    });

    it('removeNode triggers healing state', () => {
      protocol.addNode('a', 0, 0.1, 0.1);
      protocol.addNode('b', 0, 0.5, 0.5);
      protocol.addNode('c', 1, 1.0, 1.0);
      protocol.addNode('d', 1, 1.5, 1.5);
      protocol.formEdge('a', 'b');
      protocol.formEdge('b', 'c');
      protocol.removeNode('b');
      assert.equal(protocol.state, SPHERE_STATES.HEALING);
    });

    it('getMetrics returns mesh statistics', () => {
      protocol.addNode('a', 0, 0.1, 0.1);
      protocol.addNode('b', 0, 0.5, 0.5);
      protocol.formEdge('a', 'b');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.nodeCount, 2);
      assert.equal(metrics.edgeCount, 1);
    });
  });

  describe('SPHERE_CONFIG', () => {
    it('has 8 shell radii following Fibonacci growth', () => {
      assert.equal(SPHERE_CONFIG.SHELL_RADII.length, 8);
      // Each radius = PHI^n — check monotonically increasing
      for (let i = 1; i < SPHERE_CONFIG.SHELL_RADII.length; i++) {
        assert.ok(SPHERE_CONFIG.SHELL_RADII[i] > SPHERE_CONFIG.SHELL_RADII[i - 1]);
      }
    });

    it('inner shells have more max connections', () => {
      assert.ok(SPHERE_CONFIG.MAX_CONNECTIONS_BY_SHELL[0] > SPHERE_CONFIG.MAX_CONNECTIONS_BY_SHELL[7]);
    });

    it('inner shells have faster heartbeats', () => {
      assert.ok(SPHERE_CONFIG.HEARTBEAT_BY_SHELL[0] < SPHERE_CONFIG.HEARTBEAT_BY_SHELL[7]);
    });
  });
});
