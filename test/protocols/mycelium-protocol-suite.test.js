const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('Mycelium Protocol Suite', () => {
  let Charter;
  let Identity;
  let Mesh;
  let Routing;
  let Trust;
  let Healing;
  let Economy;
  let Exchange;

  beforeEach(async () => {
    Charter = (await import('../../protocols/mycelium-charter-protocol.js')).MyceliumCharterProtocol;
    Identity = (await import('../../protocols/mycelium-node-identity-protocol.js')).MyceliumNodeIdentityProtocol;
    Mesh = (await import('../../protocols/mycelium-mesh-formation-protocol.js')).MyceliumMeshFormationProtocol;
    Routing = (await import('../../protocols/mycelium-routing-intelligence-protocol.js')).MyceliumRoutingIntelligenceProtocol;
    Trust = (await import('../../protocols/mycelium-trust-reputation-protocol.js')).MyceliumTrustReputationProtocol;
    Healing = (await import('../../protocols/mycelium-healing-recovery-protocol.js')).MyceliumHealingRecoveryProtocol;
    Economy = (await import('../../protocols/mycelium-economic-signaling-protocol.js')).MyceliumEconomicSignalingProtocol;
    Exchange = (await import('../../protocols/mycelium-cross-substrate-exchange-protocol.js')).MyceliumCrossSubstrateExchangeProtocol;
  });

  it('enforces charter admission and upgrade law', () => {
    const charter = new Charter();
    charter.activate();
    const rejected = charter.evaluateAdmission({ nodeId: 'n1', attestationScore: 0.2 });
    const accepted = charter.evaluateAdmission({ nodeId: 'n2', attestationScore: 0.9 });
    const upgradeDenied = charter.evaluateUpgrade({ compatibilityScore: 0.4, evidenceCount: 1, rollbackPlan: false });
    const upgradeAccepted = charter.evaluateUpgrade({ compatibilityScore: 0.9, evidenceCount: 3, rollbackPlan: true });

    assert.equal(rejected.accepted, false);
    assert.equal(accepted.accepted, true);
    assert.equal(upgradeDenied.accepted, false);
    assert.equal(upgradeAccepted.accepted, true);
  });

  it('supports identity lifecycle and voting safety', () => {
    const id = new Identity();
    id.admitNode('node-a', { rights: ['observe', 'relay'] });
    id.activateNode('node-a', 0.95, 10);
    const active = id.getIdentity('node-a');
    assert.equal(active.state, 'active');
    assert.equal(id.canVote('node-a'), true);

    id.attestHeartbeat('node-a', 3000);
    const quarantined = id.getIdentity('node-a');
    assert.equal(quarantined.state, 'quarantined');
  });

  it('detects partitions and reconciles mesh liveness', () => {
    const mesh = new Mesh();
    mesh.joinNode('a');
    mesh.joinNode('b');
    mesh.joinNode('c');
    mesh.joinNode('d');
    mesh.formLink('a', 'b', 10, 0.9);
    mesh.formLink('c', 'd', 10, 0.9);

    const partition = mesh.detectPartition();
    assert.equal(partition.partitioned, true);

    const result = mesh.reconcile();
    assert.equal(result.reconciled, true);
    assert.equal(mesh.detectPartition().partitioned, false);
  });

  it('finds routes and reroutes around isolated nodes', () => {
    const routing = new Routing();
    routing.registerDomain('core', { maxHops: 6, trustFloor: 0.2 });

    const adjacency = {
      a: ['b'],
      b: ['a', 'c'],
      c: ['b', 'd'],
      d: ['c']
    };
    const edgeMeta = {
      'a->b': { latencyMs: 8 },
      'b->c': { latencyMs: 10 },
      'c->d': { latencyMs: 12 }
    };
    const trustByNode = { a: 0.9, b: 0.8, c: 0.85, d: 0.9 };

    const route = routing.discoverRoute({ source: 'a', target: 'd', adjacency, edgeMeta, trustByNode, domain: 'core' });
    assert.deepEqual(route.path, ['a', 'b', 'c', 'd']);

    const rerouted = routing.rerouteOnPartition(route, ['c'], {
      source: 'a',
      target: 'd',
      adjacency: { a: ['b'], b: ['a', 'd'], d: ['b'] },
      edgeMeta: { 'a->b': { latencyMs: 9 }, 'b->d': { latencyMs: 14 } },
      trustByNode: { a: 0.9, b: 0.8, d: 0.9 },
      domain: 'core'
    });

    assert.deepEqual(rerouted.path, ['a', 'b', 'd']);
  });

  it('applies trust decay/recovery and healing priority invariants', () => {
    const trust = new Trust();
    trust.initNode('node-z', 0.9);
    const dropped = trust.recordProof('node-z', { valid: false, violations: 2, loadFactor: 0.5 });
    const recovered = trust.recordProof('node-z', { valid: true, weight: 0.9, stability: 0.95 });
    assert.ok(dropped.trust < 0.9);
    assert.ok(recovered.trust > dropped.trust);

    const healing = new Healing();
    const incident = healing.reportFailure({ id: 'inc-1', edge: 'a->b', downtimeMs: 1000, alternateHops: 3, trafficDemand: 0.9, trust: 0.8 });
    assert.ok(incident.priority > 0);
    healing.proposeRepair('inc-1');
    const closed = healing.completeRepair('inc-1', { proofRef: 'proof-heal-1' });
    assert.equal(closed.status, 'closed');
  });

  it('settles economic signals and validates cross-substrate exchange', () => {
    const economy = new Economy();
    economy.applySignal('node-e', { type: 'reward', amount: 10 });
    economy.applySignal('node-e', { type: 'bond', amount: 5 });
    const standings = economy.settleEpoch({ 'node-e': { trust: 0.9, latencyMs: 20, load: 0.1 } });
    assert.equal(standings.length, 1);
    assert.ok(standings[0].bid > 0);

    const exchange = new Exchange();
    exchange.registerConnector('web', { health: 0.95, trust: 0.9, congestion: 0.1 });
    exchange.registerConnector('canister', { health: 0.92, trust: 0.88, congestion: 0.1 });
    const ex = exchange.publishExchange({ from: 'web', to: 'canister', payloadType: 'route-proof', sizeKb: 4, proof: true });
    assert.equal(ex.accepted, true);
    assert.equal(exchange.verifyExchange(ex.id).valid, true);
  });
});
