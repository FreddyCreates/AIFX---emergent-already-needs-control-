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

  it('achieves quorum sensing and emergent consensus via collective intelligence', async () => {
    const Collective = (await import('../../protocols/mycelium-collective-intelligence-protocol.js')).MyceliumCollectiveIntelligenceProtocol;
    const collective = new Collective({ quorumThreshold: 0.5, consensusThreshold: 0.618 });

    // Emit signals from multiple nodes until quorum
    collective.emitSignal('node-1', 'attention', { strength: 0.9 });
    collective.emitSignal('node-2', 'attention', { strength: 0.85 });
    const result = collective.emitSignal('node-3', 'attention', { strength: 0.8 });
    assert.ok(result.density > 0);

    // Contribute knowledge fragments
    collective.contributeFragment('node-1', { domain: 'routing', coherence: 0.8, pattern: ['optimize', 'path'] });
    collective.contributeFragment('node-2', { domain: 'routing', coherence: 0.75, pattern: ['reduce', 'hops'] });
    collective.contributeFragment('node-3', { domain: 'routing', coherence: 0.9, pattern: ['trust', 'path'] });
    const fusion = collective.fuseKnowledge();
    assert.ok(fusion.score > 0);

    // Cast votes and reach consensus
    collective.castVote('node-1', 'upgrade', 1, 0.9);
    collective.castVote('node-2', 'upgrade', 1, 0.85);
    const consensus = collective.castVote('node-3', 'upgrade', 1, 0.8);
    assert.equal(consensus.consensus, true);
    assert.equal(consensus.decision.position, 'upgrade');

    // Stigmergy
    collective.depositTrace('node-1', 'path-a->b', 0.9);
    const trace = collective.readTraceAt('path-a->b');
    assert.ok(trace.intensity > 0);
    assert.equal(trace.traceCount, 1);
  });

  it('encodes, propagates, consolidates, and recalls network memory', async () => {
    const Memory = (await import('../../protocols/mycelium-memory-propagation-protocol.js')).MyceliumMemoryPropagationProtocol;
    const memory = new Memory({ consolidationThreshold: 0.2, recallThreshold: 0.1 });

    // Encode
    const encoding = memory.encode('node-a', { type: 'semantic', pattern: ['trust', 'route', 'phi'], strength: 0.8, domain: 'routing' });
    assert.ok(encoding.id);
    assert.equal(encoding.type, 'semantic');

    // Propagate
    const propagation = memory.propagate(encoding.id, ['node-b', 'node-c', 'node-d'], 1);
    assert.equal(propagation.propagations.length, 3);
    assert.ok(propagation.propagations[0].strength > 0);

    // Consolidate
    const consolidation = memory.consolidate();
    assert.ok(consolidation.count >= 1);

    // Recall
    const results = memory.recall(['trust', 'phi'], 'routing');
    assert.ok(results.length >= 1);
    assert.ok(results[0].recallScore > 0);

    // Metrics
    const metrics = memory.getMetrics();
    assert.ok(metrics.engramCount >= 1);
  });

  it('evolves strategies through fitness selection and mutation', async () => {
    const Evolution = (await import('../../protocols/mycelium-evolutionary-adaptation-protocol.js')).MyceliumEvolutionaryAdaptationProtocol;
    const evolution = new Evolution({ mutationRate: 0.2, survivalThreshold: 0.2 });

    // Register strategies
    evolution.registerStrategy('strat-alpha', { routingWeight: 0.7, trustWeight: 0.8, healRate: 0.5 });
    evolution.registerStrategy('strat-beta', { routingWeight: 0.3, trustWeight: 0.4, healRate: 0.2 });
    evolution.registerStrategy('strat-gamma', { routingWeight: 0.9, trustWeight: 0.9, healRate: 0.8 });

    // Evaluate fitness
    evolution.evaluateFitness('strat-alpha', { throughput: 0.8, trust: 0.85, efficiency: 0.7, failures: 1, latencyMs: 30 });
    evolution.evaluateFitness('strat-beta', { throughput: 0.3, trust: 0.2, efficiency: 0.3, failures: 5, latencyMs: 200 });
    evolution.evaluateFitness('strat-gamma', { throughput: 0.95, trust: 0.9, efficiency: 0.85, failures: 0, latencyMs: 15 });

    // Mutate
    const child = evolution.mutateStrategy('strat-gamma');
    assert.ok(child);
    assert.equal(child.parentId, 'strat-gamma');
    assert.equal(child.generation, 1);

    // Run epoch
    const epoch = evolution.runEpoch({ '*': { throughput: 0.6, trust: 0.7, efficiency: 0.6, failures: 1, latencyMs: 50 } });
    assert.ok(epoch.strategyCount > 0);
    assert.ok(epoch.avgFitness > 0);

    // Fittest
    const fittest = evolution.getFittest();
    assert.ok(fittest);
    assert.ok(fittest.fitness > 0);

    // Lineage
    const lineage = evolution.getLineage(child.id);
    assert.ok(lineage.length >= 1);
    assert.equal(lineage[0].parentId, 'strat-gamma');
  });
});
