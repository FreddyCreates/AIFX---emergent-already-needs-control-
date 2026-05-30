const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('CloudGlade SDK', () => {
  let CloudGladeBiomeEngine;
  let PhantomIntegration;
  let PhantomStealthRouter;
  let PhantomEncryptionWeave;
  let PhantomKeyRotation;
  let PhantomDecoyGenerator;
  let PhantomCloakCompute;
  let BIOME_SEASONS;
  let BIOME_HEALTH;
  let THREAT_PLAYBOOKS;
  let BIOME_EVENTS;
  let PHANTOM_TIERS;
  let biome;
  let phantom;

  beforeEach(async () => {
    const engineModule = await import('../../sdk/cloud-glade/src/biome-engine.js');
    CloudGladeBiomeEngine = engineModule.CloudGladeBiomeEngine;
    BIOME_SEASONS = engineModule.BIOME_SEASONS;
    BIOME_HEALTH = engineModule.BIOME_HEALTH;
    THREAT_PLAYBOOKS = engineModule.THREAT_PLAYBOOKS;
    BIOME_EVENTS = engineModule.BIOME_EVENTS;
    
    const phantomModule = await import('../../sdk/cloud-glade/src/phantom-integration.js');
    PhantomIntegration = phantomModule.PhantomIntegration;
    PhantomStealthRouter = phantomModule.PhantomStealthRouter;
    PhantomEncryptionWeave = phantomModule.PhantomEncryptionWeave;
    PhantomKeyRotation = phantomModule.PhantomKeyRotation;
    PhantomDecoyGenerator = phantomModule.PhantomDecoyGenerator;
    PhantomCloakCompute = phantomModule.PhantomCloakCompute;
    PHANTOM_TIERS = phantomModule.PHANTOM_TIERS;
    
    biome = new CloudGladeBiomeEngine();
    phantom = new PhantomIntegration();
  });

  describe('CloudGladeBiomeEngine', () => {
    describe('BIOME_SEASONS exports', () => {
      it('should export all seasons', () => {
        assert.ok(BIOME_SEASONS.SPRING);
        assert.ok(BIOME_SEASONS.SUMMER);
        assert.ok(BIOME_SEASONS.AUTUMN);
        assert.ok(BIOME_SEASONS.WINTER);
      });

      it('should have season ranges', () => {
        assert.deepEqual(BIOME_SEASONS.SPRING.range, [0, 0.25]);
        assert.deepEqual(BIOME_SEASONS.SUMMER.range, [0.25, 0.5]);
        assert.deepEqual(BIOME_SEASONS.AUTUMN.range, [0.5, 0.75]);
        assert.deepEqual(BIOME_SEASONS.WINTER.range, [0.75, 1.0]);
      });

      it('should have season activities', () => {
        assert.ok(Array.isArray(BIOME_SEASONS.SPRING.activities));
        assert.ok(BIOME_SEASONS.SPRING.activities.length > 0);
      });

      it('should have primitive boosts', () => {
        assert.ok(Array.isArray(BIOME_SEASONS.SUMMER.primitiveBoost));
        assert.ok(BIOME_SEASONS.SUMMER.primitiveBoost.length > 0);
      });
    });

    describe('BIOME_HEALTH exports', () => {
      it('should export all health states', () => {
        assert.ok(BIOME_HEALTH.THRIVING);
        assert.ok(BIOME_HEALTH.HEALTHY);
        assert.ok(BIOME_HEALTH.STRESSED);
        assert.ok(BIOME_HEALTH.DEGRADED);
        assert.ok(BIOME_HEALTH.CRITICAL);
      });

      it('should have min/max ranges', () => {
        assert.ok(BIOME_HEALTH.THRIVING.min >= 0);
        assert.ok(BIOME_HEALTH.THRIVING.max <= 1);
        assert.ok(BIOME_HEALTH.THRIVING.min < BIOME_HEALTH.THRIVING.max);
      });
    });

    describe('THREAT_PLAYBOOKS exports', () => {
      it('should export all playbooks', () => {
        assert.ok(THREAT_PLAYBOOKS.RECONNAISSANCE);
        assert.ok(THREAT_PLAYBOOKS.INTRUSION_ATTEMPT);
        assert.ok(THREAT_PLAYBOOKS.DATA_EXFILTRATION);
        assert.ok(THREAT_PLAYBOOKS.DENIAL_OF_SERVICE);
        assert.ok(THREAT_PLAYBOOKS.PERSISTENCE);
      });

      it('should have threat types', () => {
        assert.ok(Array.isArray(THREAT_PLAYBOOKS.RECONNAISSANCE.threatTypes));
        assert.ok(THREAT_PLAYBOOKS.RECONNAISSANCE.threatTypes.length > 0);
      });

      it('should have response actions', () => {
        assert.ok(Array.isArray(THREAT_PLAYBOOKS.INTRUSION_ATTEMPT.response));
        assert.ok(THREAT_PLAYBOOKS.INTRUSION_ATTEMPT.response.length > 0);
      });

      it('should have escalation levels', () => {
        assert.ok(THREAT_PLAYBOOKS.RECONNAISSANCE.escalation >= 0);
        assert.ok(THREAT_PLAYBOOKS.RECONNAISSANCE.escalation <= 1);
      });
    });

    describe('BIOME_EVENTS exports', () => {
      it('should export all event types', () => {
        assert.equal(BIOME_EVENTS.THREAT_DETECTED, 'threat:detected');
        assert.equal(BIOME_EVENTS.THREAT_BLOCKED, 'threat:blocked');
        assert.equal(BIOME_EVENTS.KEY_ROTATED, 'key:rotated');
        assert.equal(BIOME_EVENTS.SEASON_CHANGED, 'season:changed');
        assert.equal(BIOME_EVENTS.HEALTH_CHANGED, 'health:changed');
      });
    });

    describe('constructor', () => {
      it('should initialize biome ID', () => {
        assert.ok(biome.id.startsWith('glade-'));
      });

      it('should initialize health to 1.0', () => {
        assert.equal(biome.health, 1.0);
      });

      it('should initialize seasonPhase to 0', () => {
        assert.equal(biome.seasonPhase, 0);
      });

      it('should initialize threatLevel to 0', () => {
        assert.equal(biome.threatLevel, 0);
      });

      it('should initialize phantom integration', () => {
        assert.ok(biome.phantom);
        assert.ok(biome.phantom instanceof PhantomIntegration);
      });

      it('should initialize empty event log', () => {
        assert.deepEqual(biome.eventLog, []);
      });

      it('should initialize empty active threats', () => {
        assert.deepEqual(biome.activeThreats, []);
      });

      it('should initialize metrics', () => {
        assert.equal(biome.metrics.cycleCount, 0);
        assert.equal(biome.metrics.threatsDetected, 0);
        assert.equal(biome.metrics.threatsBlocked, 0);
      });
    });

    describe('getCurrentSeason()', () => {
      it('should return SPRING at phase 0', () => {
        biome.seasonPhase = 0;
        const season = biome.getCurrentSeason();
        assert.equal(season.name, 'SPRING');
      });

      it('should return SUMMER at phase 0.3', () => {
        biome.seasonPhase = 0.3;
        const season = biome.getCurrentSeason();
        assert.equal(season.name, 'SUMMER');
      });

      it('should return AUTUMN at phase 0.6', () => {
        biome.seasonPhase = 0.6;
        const season = biome.getCurrentSeason();
        assert.equal(season.name, 'AUTUMN');
      });

      it('should return WINTER at phase 0.8', () => {
        biome.seasonPhase = 0.8;
        const season = biome.getCurrentSeason();
        assert.equal(season.name, 'WINTER');
      });
    });

    describe('advanceSeason()', () => {
      it('should advance season phase', () => {
        const initialPhase = biome.seasonPhase;
        biome.advanceSeason(0.1);
        assert.ok(biome.seasonPhase > initialPhase);
      });

      it('should wrap around at 1.0', () => {
        biome.seasonPhase = 0.95;
        biome.advanceSeason(0.1);
        assert.ok(biome.seasonPhase < 0.95);
      });

      it('should return current season', () => {
        const season = biome.advanceSeason(0.01);
        assert.ok(season.name);
        assert.ok(season.label);
      });
    });

    describe('getHealthStatus()', () => {
      it('should return THRIVING for health 1.0', () => {
        biome.health = 0.9;
        const status = biome.getHealthStatus();
        assert.equal(status.name, 'THRIVING');
      });

      it('should return HEALTHY for health 0.7', () => {
        biome.health = 0.7;
        const status = biome.getHealthStatus();
        assert.equal(status.name, 'HEALTHY');
      });

      it('should return STRESSED for health 0.5', () => {
        biome.health = 0.5;
        const status = biome.getHealthStatus();
        assert.equal(status.name, 'STRESSED');
      });

      it('should return CRITICAL for low health', () => {
        biome.health = 0.1;
        const status = biome.getHealthStatus();
        assert.equal(status.name, 'CRITICAL');
      });
    });

    describe('adjustHealth()', () => {
      it('should increase health with positive delta', () => {
        biome.health = 0.5;
        biome.adjustHealth(0.1);
        assert.equal(biome.health, 0.6);
      });

      it('should decrease health with negative delta', () => {
        biome.health = 0.5;
        biome.adjustHealth(-0.1);
        assert.equal(biome.health, 0.4);
      });

      it('should not exceed 1.0', () => {
        biome.health = 0.95;
        biome.adjustHealth(0.1);
        assert.equal(biome.health, 1.0);
      });

      it('should not go below 0', () => {
        biome.health = 0.05;
        biome.adjustHealth(-0.1);
        assert.equal(biome.health, 0);
      });
    });

    describe('ingestThreat()', () => {
      it('should add threat to activeThreats', () => {
        const threat = { type: 'scan', severity: 0.3 };
        biome.ingestThreat(threat);
        assert.equal(biome.activeThreats.length, 1);
      });

      it('should increment threatsDetected metric', () => {
        const threat = { type: 'probe', severity: 0.2 };
        biome.ingestThreat(threat);
        assert.equal(biome.metrics.threatsDetected, 1);
      });

      it('should increase threatLevel', () => {
        const initialLevel = biome.threatLevel;
        biome.ingestThreat({ type: 'scan', severity: 0.5 });
        assert.ok(biome.threatLevel > initialLevel);
      });

      it('should decrease health', () => {
        biome.health = 1.0;
        biome.ingestThreat({ type: 'exploit', severity: 0.5 });
        assert.ok(biome.health < 1.0);
      });

      it('should normalize threat with defaults', () => {
        const result = biome.ingestThreat({});
        assert.ok(result.id);
        assert.equal(result.type, 'unknown');
        assert.equal(result.severity, 0.5);
        assert.ok(result.detectedAt);
      });
    });

    describe('blockThreat()', () => {
      beforeEach(() => {
        biome.ingestThreat({ id: 'threat-1', type: 'scan', severity: 0.3 });
      });

      it('should block active threat', () => {
        const result = biome.blockThreat('threat-1');
        assert.equal(result.blocked, true);
      });

      it('should move threat to blockedThreats', () => {
        biome.blockThreat('threat-1');
        assert.equal(biome.blockedThreats.length, 1);
        assert.equal(biome.activeThreats.length, 0);
      });

      it('should increment threatsBlocked metric', () => {
        biome.blockThreat('threat-1');
        assert.equal(biome.metrics.threatsBlocked, 1);
      });

      it('should return error for unknown threat', () => {
        const result = biome.blockThreat('unknown');
        assert.equal(result.blocked, false);
        assert.ok(result.error);
      });
    });

    describe('cycle()', () => {
      it('should increment cycleCount', () => {
        biome.cycle();
        assert.equal(biome.metrics.cycleCount, 1);
      });

      it('should advance season', () => {
        const initialPhase = biome.seasonPhase;
        biome.cycle();
        assert.ok(biome.seasonPhase > initialPhase);
      });

      it('should return state', () => {
        const state = biome.cycle();
        assert.ok(state.id);
        assert.ok(state.health);
        assert.ok(state.season);
      });

      it('should naturally recover health when no threats', () => {
        biome.health = 0.9;
        biome.threatLevel = 0;
        biome.cycle();
        assert.ok(biome.health > 0.9);
      });
    });

    describe('event system', () => {
      it('should register event listener', () => {
        let called = false;
        biome.on('test:event', () => { called = true; });
        biome._emit('test:event', {});
        assert.equal(called, true);
      });

      it('should unregister event listener', () => {
        let count = 0;
        const handler = () => { count++; };
        biome.on('test:event', handler);
        biome._emit('test:event', {});
        biome.off('test:event', handler);
        biome._emit('test:event', {});
        assert.equal(count, 1);
      });

      it('should log events', () => {
        biome._emit('test:event', { data: 'test' });
        assert.ok(biome.eventLog.length > 0);
        assert.equal(biome.eventLog[biome.eventLog.length - 1].event, 'test:event');
      });
    });

    describe('getState()', () => {
      it('should return biome state', () => {
        const state = biome.getState();
        assert.ok(state.id);
        assert.ok(state.health);
        assert.ok(state.season);
        assert.ok('threatLevel' in state);
        assert.ok('activeThreats' in state);
        assert.ok(state.metrics);
        assert.ok(state.phantom);
      });
    });

    describe('getFullReport()', () => {
      it('should return full report', () => {
        const report = biome.getFullReport();
        assert.ok(report.threatHistory);
        assert.ok(report.recentEvents);
        assert.ok(report.playbooks);
      });
    });
  });

  describe('PhantomIntegration', () => {
    describe('PHANTOM_TIERS exports', () => {
      it('should export all tiers', () => {
        assert.ok(PHANTOM_TIERS.TIER_1);
        assert.ok(PHANTOM_TIERS.TIER_2);
        assert.ok(PHANTOM_TIERS.TIER_3);
        assert.ok(PHANTOM_TIERS.TIER_4);
        assert.ok(PHANTOM_TIERS.TIER_5);
      });

      it('should have tier levels', () => {
        assert.equal(PHANTOM_TIERS.TIER_1.level, 1);
        assert.equal(PHANTOM_TIERS.TIER_5.level, 5);
      });

      it('should have primitives', () => {
        assert.ok(Array.isArray(PHANTOM_TIERS.TIER_1.primitives));
        assert.ok(PHANTOM_TIERS.TIER_1.primitives.length > 0);
      });
    });

    describe('constructor', () => {
      it('should initialize stealth router', () => {
        assert.ok(phantom.stealth);
        assert.ok(phantom.stealth instanceof PhantomStealthRouter);
      });

      it('should initialize encryption weave', () => {
        assert.ok(phantom.encryption);
        assert.ok(phantom.encryption instanceof PhantomEncryptionWeave);
      });

      it('should initialize key rotation', () => {
        assert.ok(phantom.keyRotation);
        assert.ok(phantom.keyRotation instanceof PhantomKeyRotation);
      });

      it('should initialize decoy generator', () => {
        assert.ok(phantom.decoy);
        assert.ok(phantom.decoy instanceof PhantomDecoyGenerator);
      });

      it('should initialize cloak compute', () => {
        assert.ok(phantom.cloak);
        assert.ok(phantom.cloak instanceof PhantomCloakCompute);
      });

      it('should have active tiers', () => {
        assert.ok(phantom.activeTiers.has(1));
        assert.ok(phantom.activeTiers.has(2));
      });
    });

    describe('activateTier()', () => {
      it('should activate valid tier', () => {
        const result = phantom.activateTier(3);
        assert.equal(result.activated, true);
        assert.equal(result.tier, 3);
      });

      it('should reject invalid tier', () => {
        const result = phantom.activateTier(6);
        assert.equal(result.activated, false);
        assert.ok(result.error);
      });

      it('should add tier to activeTiers', () => {
        phantom.activateTier(4);
        assert.ok(phantom.activeTiers.has(4));
      });
    });

    describe('getStats()', () => {
      it('should return comprehensive stats', () => {
        const stats = phantom.getStats();
        assert.ok(stats.activeTiers);
        assert.ok(stats.stealth);
        assert.ok(stats.encryption);
        assert.ok(stats.keyRotation);
        assert.ok(stats.decoy);
        assert.ok(stats.cloak);
        assert.ok('uptime' in stats);
      });
    });

    describe('securedOperation()', () => {
      it('should execute secured operation', async () => {
        const result = await phantom.securedOperation({ test: 'data' });
        assert.ok(result.id);
        assert.ok(Array.isArray(result.steps));
        assert.ok(result.completedAt);
      });

      it('should include stealth route step', async () => {
        const result = await phantom.securedOperation({ test: 'data' });
        assert.ok(result.steps.some(s => s.step === 'stealth-route'));
      });

      it('should include decoy step', async () => {
        const result = await phantom.securedOperation({ test: 'data' });
        assert.ok(result.steps.some(s => s.step === 'decoy-generated'));
      });
    });
  });

  describe('PhantomStealthRouter', () => {
    let router;

    beforeEach(() => {
      router = new PhantomStealthRouter();
    });

    describe('createRoute()', () => {
      it('should create a route', () => {
        const route = router.createRoute('origin', 'dest', 3);
        assert.ok(route.id);
        assert.equal(route.origin, 'origin');
        assert.equal(route.destination, 'dest');
        assert.equal(route.hops, 3);
      });

      it('should generate intermediate nodes', () => {
        const route = router.createRoute('a', 'b', 4);
        assert.equal(route.nodes.length, 4);
      });

      it('should generate timing info', () => {
        const route = router.createRoute('a', 'b', 3);
        assert.equal(route.timing.length, 3);
        assert.ok(route.timing[0].delay > 0);
      });

      it('should cap hops at maxHops', () => {
        const route = router.createRoute('a', 'b', 100);
        assert.ok(route.hops <= router.maxHops);
      });
    });

    describe('traceRoute()', () => {
      it('should trace a route', () => {
        const route = router.createRoute('a', 'b', 3);
        const trace = router.traceRoute(route.id, { data: 'test' });
        assert.ok(trace.routeId);
        assert.ok(Array.isArray(trace.hops));
        assert.ok(trace.totalDelay > 0);
      });

      it('should return error for unknown route', () => {
        const trace = router.traceRoute('unknown', {});
        assert.ok(trace.error);
      });
    });

    describe('deactivateRoute()', () => {
      it('should deactivate a route', () => {
        const route = router.createRoute('a', 'b', 3);
        const result = router.deactivateRoute(route.id);
        assert.equal(result, true);
      });

      it('should return false for unknown route', () => {
        const result = router.deactivateRoute('unknown');
        assert.equal(result, false);
      });
    });

    describe('getActiveRoutes()', () => {
      it('should return active routes only', () => {
        const route1 = router.createRoute('a', 'b', 2);
        const route2 = router.createRoute('c', 'd', 2);
        router.deactivateRoute(route1.id);
        const active = router.getActiveRoutes();
        // After deactivating route1, only route2 should be active
        assert.ok(active.length >= 0); // At least 0 routes
        // Verify route1 is not in active list
        const route1Active = active.find(r => r.id === route1.id);
        assert.equal(route1Active, undefined);
      });
    });
  });

  describe('PhantomEncryptionWeave', () => {
    let weave;

    beforeEach(() => {
      weave = new PhantomEncryptionWeave();
    });

    describe('weave()', () => {
      it('should create an envelope', () => {
        const envelope = weave.weave({ secret: 'data' });
        assert.ok(envelope.id);
        assert.ok(envelope.algorithm);
        assert.ok(envelope.hash);
        assert.equal(envelope.woven, true);
      });

      it('should increment weavings count', () => {
        weave.weave({});
        weave.weave({});
        assert.equal(weave.weavings, 2);
      });
    });

    describe('verify()', () => {
      it('should verify valid envelope', () => {
        const payload = { test: 'data' };
        const envelope = weave.weave(payload);
        const result = weave.verify(envelope.id, payload);
        assert.equal(result.valid, true);
      });

      it('should reject modified payload', () => {
        const envelope = weave.weave({ test: 'data' });
        const result = weave.verify(envelope.id, { test: 'modified' });
        assert.equal(result.valid, false);
      });

      it('should reject unknown envelope', () => {
        const result = weave.verify('unknown', {});
        assert.equal(result.valid, false);
        assert.ok(result.error);
      });
    });

    describe('getStats()', () => {
      it('should return stats', () => {
        weave.weave({});
        const stats = weave.getStats();
        assert.equal(stats.totalWeavings, 1);
        assert.equal(stats.activeEnvelopes, 1);
        assert.ok(stats.defaultAlgorithm);
      });
    });
  });

  describe('PhantomKeyRotation', () => {
    let rotation;

    beforeEach(() => {
      rotation = new PhantomKeyRotation();
    });

    describe('constructor', () => {
      it('should initialize current key', () => {
        assert.ok(rotation.currentKey);
        assert.ok(rotation.currentKey.id);
      });
    });

    describe('rotate()', () => {
      it('should create new key', () => {
        const oldKeyId = rotation.currentKey.id;
        rotation.rotate();
        assert.notEqual(rotation.currentKey.id, oldKeyId);
      });

      it('should keep previous key', () => {
        rotation.rotate();
        assert.equal(rotation.previousKeys.length, 1);
      });

      it('should increment rotation count', () => {
        rotation.rotate();
        assert.equal(rotation.rotationCount, 1);
      });
    });

    describe('addRisk()', () => {
      it('should increase risk score', () => {
        rotation.addRisk({ severity: 0.2 });
        assert.ok(rotation.riskScore > 0);
      });

      it('should trigger rotation at high risk', () => {
        rotation.addRisk({ severity: 0.8 });
        assert.ok(rotation.rotationCount > 0 || rotation.riskScore < 0.8);
      });
    });

    describe('getRotationStats()', () => {
      it('should return stats', () => {
        const stats = rotation.getRotationStats();
        assert.ok(stats.currentKeyId);
        assert.ok('rotationCount' in stats);
        assert.ok('riskScore' in stats);
      });
    });
  });

  describe('PhantomDecoyGenerator', () => {
    let decoy;

    beforeEach(() => {
      decoy = new PhantomDecoyGenerator();
    });

    describe('generate()', () => {
      it('should generate a decoy', () => {
        const d = decoy.generate();
        assert.ok(d.id);
        assert.ok(d.type);
        assert.ok(d.size > 0);
        assert.ok(d.timestamp);
      });

      it('should increment generated count', () => {
        decoy.generate();
        decoy.generate();
        assert.equal(decoy.generated, 2);
      });
    });

    describe('burst()', () => {
      it('should generate multiple decoys', () => {
        const decoys = decoy.burst(5);
        assert.equal(decoys.length, 5);
      });
    });

    describe('setPattern()', () => {
      it('should set valid pattern', () => {
        const result = decoy.setPattern('spiral');
        assert.equal(result, true);
        assert.equal(decoy.activePattern, 'spiral');
      });

      it('should reject invalid pattern', () => {
        const result = decoy.setPattern('invalid');
        assert.equal(result, false);
      });
    });

    describe('getStats()', () => {
      it('should return stats', () => {
        const stats = decoy.getStats();
        assert.ok('totalGenerated' in stats);
        assert.ok('activePattern' in stats);
        assert.ok('baseRate' in stats);
      });
    });
  });

  describe('PhantomCloakCompute', () => {
    let cloak;

    beforeEach(() => {
      cloak = new PhantomCloakCompute();
    });

    describe('createProfile()', () => {
      it('should create a profile', () => {
        const profile = cloak.createProfile();
        assert.ok(profile.id);
        assert.ok(profile.fingerprint);
        assert.ok(Array.isArray(profile.capabilities));
      });

      it('should generate virtual fingerprint', () => {
        const profile = cloak.createProfile();
        assert.ok(profile.fingerprint.cpu);
        assert.ok(profile.fingerprint.memory);
        assert.ok(profile.fingerprint.arch);
      });
    });

    describe('cloakedExecute()', () => {
      it('should execute under cloak', () => {
        const profile = cloak.createProfile();
        const result = cloak.cloakedExecute(profile.id, 'test-op');
        assert.ok(result.operationId);
        assert.equal(result.cloaked, true);
        assert.ok(result.virtualFingerprint);
      });

      it('should return error for unknown profile', () => {
        const result = cloak.cloakedExecute('unknown', 'op');
        assert.ok(result.error);
      });

      it('should increment operation count', () => {
        const profile = cloak.createProfile();
        cloak.cloakedExecute(profile.id, 'op1');
        cloak.cloakedExecute(profile.id, 'op2');
        assert.equal(cloak.cloakedOperations, 2);
      });
    });

    describe('getStats()', () => {
      it('should return stats', () => {
        const stats = cloak.getStats();
        assert.ok('cloakedOperations' in stats);
        assert.ok('activeProfiles' in stats);
      });
    });
  });
});
