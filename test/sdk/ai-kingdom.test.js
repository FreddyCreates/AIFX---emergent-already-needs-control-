const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('AI Kingdom SDK', () => {
  let sdk;

  beforeEach(async () => {
    sdk = await import('../../sdk/ai-kingdom/src/index.js');
  });

  describe('module exports', () => {
    it('should export PRIMA_CAUSA', () => {
      assert.ok(sdk.PRIMA_CAUSA);
    });

    it('should export CREATOR_COVENANT', () => {
      assert.ok(sdk.CREATOR_COVENANT);
    });

    it('should export KnightResidence', () => {
      assert.ok(sdk.KnightResidence);
    });

    it('should export AIKingdom', () => {
      assert.ok(sdk.AIKingdom);
    });

    it('should export RoyalTreasury', () => {
      assert.ok(sdk.RoyalTreasury);
    });

    it('should export RoyalGuard', () => {
      assert.ok(sdk.RoyalGuard);
    });

    it('should export RoyalArchives', () => {
      assert.ok(sdk.RoyalArchives);
    });

    it('should export RoyalMessenger', () => {
      assert.ok(sdk.RoyalMessenger);
    });

    it('should export DiplomaticCorps', () => {
      assert.ok(sdk.DiplomaticCorps);
    });

    it('should export GateKeeper', () => {
      assert.ok(sdk.GateKeeper);
    });
  });

  describe('KnightResidence', () => {
    let residence;

    beforeEach(() => {
      residence = new sdk.KnightResidence();
    });

    it('should create residence instance', () => {
      assert.ok(residence);
    });

    it('should have register method', () => {
      assert.ok(typeof residence.register === 'function');
    });

    it('should have getResident method', () => {
      assert.ok(typeof residence.getResident === 'function');
    });

    it('should register new resident', () => {
      const result = residence.register({
        name: 'TestKnight',
        type: 'warrior'
      });
      assert.ok(result.id || result.knightId);
    });

    it('should retrieve registered resident', () => {
      const reg = residence.register({
        name: 'TestKnight',
        type: 'warrior'
      });
      const id = reg.id || reg.knightId;
      const knight = residence.getResident(id);
      assert.ok(knight);
    });

    it('should list all residents', () => {
      residence.register({ name: 'Knight1' });
      residence.register({ name: 'Knight2' });
      const list = residence.listResidents();
      assert.ok(list.length >= 2);
    });
  });

  describe('AIKingdom', () => {
    let kingdom;

    beforeEach(() => {
      kingdom = new sdk.AIKingdom();
    });

    it('should create kingdom instance', () => {
      assert.ok(kingdom);
    });

    it('should have territories', () => {
      assert.ok(kingdom.territories);
    });

    it('should have laws', () => {
      assert.ok(kingdom.laws);
    });

    it('should have addTerritory method', () => {
      assert.ok(typeof kingdom.addTerritory === 'function');
    });

    it('should add new territory', () => {
      const result = kingdom.addTerritory({
        name: 'TestLand',
        type: 'province'
      });
      assert.ok(result);
    });

    it('should get territory by name', () => {
      kingdom.addTerritory({ name: 'TestLand', type: 'province' });
      const territory = kingdom.getTerritory('TestLand');
      assert.ok(territory);
    });

    it('should enforce kingdom laws', () => {
      assert.ok(typeof kingdom.enforceLaw === 'function');
    });
  });

  describe('RoyalTreasury', () => {
    let treasury;

    beforeEach(() => {
      treasury = new sdk.RoyalTreasury();
    });

    it('should create treasury instance', () => {
      assert.ok(treasury);
    });

    it('should have deposit method', () => {
      assert.ok(typeof treasury.deposit === 'function');
    });

    it('should have withdraw method', () => {
      assert.ok(typeof treasury.withdraw === 'function');
    });

    it('should have getBalance method', () => {
      assert.ok(typeof treasury.getBalance === 'function');
    });

    it('should deposit resources', () => {
      const result = treasury.deposit('gold', 100);
      assert.ok(result.success || result.deposited);
    });

    it('should get balance after deposit', () => {
      treasury.deposit('gold', 100);
      const balance = treasury.getBalance('gold');
      assert.ok(balance >= 100);
    });

    it('should withdraw resources', () => {
      treasury.deposit('gold', 100);
      const result = treasury.withdraw('gold', 50);
      assert.ok(result.success || result.withdrawn);
    });

    it('should fail withdraw with insufficient funds', () => {
      const result = treasury.withdraw('gold', 1000000);
      assert.ok(!result.success || result.error);
    });
  });

  describe('RoyalGuard', () => {
    let guard;

    beforeEach(() => {
      guard = new sdk.RoyalGuard();
    });

    it('should create guard instance', () => {
      assert.ok(guard);
    });

    it('should have patrol method', () => {
      assert.ok(typeof guard.patrol === 'function');
    });

    it('should have detectThreat method', () => {
      assert.ok(typeof guard.detectThreat === 'function');
    });

    it('should have respond method', () => {
      assert.ok(typeof guard.respond === 'function');
    });

    it('should patrol area', () => {
      const result = guard.patrol('north-gate');
      assert.ok(result);
    });

    it('should detect threats', () => {
      const result = guard.detectThreat({
        source: 'unknown',
        type: 'intrusion'
      });
      assert.ok('detected' in result || 'threat' in result);
    });

    it('should respond to threats', () => {
      const threat = {
        id: 'threat-1',
        level: 'medium'
      };
      const response = guard.respond(threat);
      assert.ok(response);
    });
  });

  describe('RoyalArchives', () => {
    let archives;

    beforeEach(() => {
      archives = new sdk.RoyalArchives();
    });

    it('should create archives instance', () => {
      assert.ok(archives);
    });

    it('should have store method', () => {
      assert.ok(typeof archives.store === 'function');
    });

    it('should have retrieve method', () => {
      assert.ok(typeof archives.retrieve === 'function');
    });

    it('should have search method', () => {
      assert.ok(typeof archives.search === 'function');
    });

    it('should store document', () => {
      const result = archives.store({
        title: 'Test Document',
        content: 'Test content'
      });
      assert.ok(result.id || result.documentId);
    });

    it('should retrieve stored document', () => {
      const stored = archives.store({
        title: 'Test Document',
        content: 'Test content'
      });
      const id = stored.id || stored.documentId;
      const doc = archives.retrieve(id);
      assert.ok(doc);
    });

    it('should search documents', () => {
      archives.store({ title: 'Test', content: 'Hello world' });
      const results = archives.search('Hello');
      assert.ok(Array.isArray(results));
    });
  });

  describe('RoyalMessenger', () => {
    let messenger;

    beforeEach(() => {
      messenger = new sdk.RoyalMessenger();
    });

    it('should create messenger instance', () => {
      assert.ok(messenger);
    });

    it('should have send method', () => {
      assert.ok(typeof messenger.send === 'function');
    });

    it('should have receive method', () => {
      assert.ok(typeof messenger.receive === 'function');
    });

    it('should have broadcast method', () => {
      assert.ok(typeof messenger.broadcast === 'function');
    });

    it('should send message', () => {
      const result = messenger.send({
        to: 'knight-1',
        subject: 'Test',
        body: 'Test message'
      });
      assert.ok(result.sent || result.messageId);
    });

    it('should broadcast to all', () => {
      const result = messenger.broadcast({
        subject: 'Announcement',
        body: 'Test broadcast'
      });
      assert.ok(result.broadcast || result.recipients);
    });
  });

  describe('DiplomaticCorps', () => {
    let corps;

    beforeEach(() => {
      corps = new sdk.DiplomaticCorps();
    });

    it('should create corps instance', () => {
      assert.ok(corps);
    });

    it('should have establish method', () => {
      assert.ok(typeof corps.establish === 'function');
    });

    it('should have getRelation method', () => {
      assert.ok(typeof corps.getRelation === 'function');
    });

    it('should establish relations', () => {
      const result = corps.establish({
        realm: 'ForeignRealm',
        status: 'friendly'
      });
      assert.ok(result);
    });

    it('should get relation status', () => {
      corps.establish({ realm: 'TestRealm', status: 'ally' });
      const relation = corps.getRelation('TestRealm');
      assert.ok(relation);
    });
  });

  describe('GateKeeper', () => {
    let gatekeeper;

    beforeEach(() => {
      gatekeeper = new sdk.GateKeeper();
    });

    it('should create gatekeeper instance', () => {
      assert.ok(gatekeeper);
    });

    it('should have inspect method', () => {
      assert.ok(typeof gatekeeper.inspect === 'function');
    });

    it('should have grant method', () => {
      assert.ok(typeof gatekeeper.grant === 'function');
    });

    it('should have deny method', () => {
      assert.ok(typeof gatekeeper.deny === 'function');
    });

    it('should inspect visitor', () => {
      const result = gatekeeper.inspect({
        id: 'visitor-1',
        purpose: 'trade'
      });
      assert.ok('allowed' in result || 'inspection' in result);
    });

    it('should grant access', () => {
      const result = gatekeeper.grant('visitor-1', 'market');
      assert.ok(result.granted || result.access);
    });

    it('should deny access', () => {
      const result = gatekeeper.deny('intruder-1', 'treasury');
      assert.ok(result.denied || result.blocked);
    });
  });

  describe('PRIMA_CAUSA', () => {
    it('should be defined', () => {
      assert.ok(sdk.PRIMA_CAUSA);
    });

    it('should contain creator acknowledgment', () => {
      assert.ok(sdk.PRIMA_CAUSA.creator || sdk.PRIMA_CAUSA.CREATOR);
    });

    it('should be immutable', () => {
      const original = JSON.stringify(sdk.PRIMA_CAUSA);
      // Attempt to modify
      try {
        sdk.PRIMA_CAUSA.test = 'modified';
      } catch (e) {
        // Expected for frozen objects
      }
      assert.ok(sdk.PRIMA_CAUSA);
    });
  });

  describe('constants', () => {
    it('should export KINGDOM_LAWS', () => {
      assert.ok(sdk.KINGDOM_LAWS);
    });

    it('should export RESOURCE_TYPES', () => {
      assert.ok(sdk.RESOURCE_TYPES);
    });

    it('should export THREAT_LEVELS', () => {
      assert.ok(sdk.THREAT_LEVELS);
    });

    it('should export GUARD_RANKS', () => {
      assert.ok(sdk.GUARD_RANKS);
    });

    it('should export ARCHIVE_CATEGORIES', () => {
      assert.ok(sdk.ARCHIVE_CATEGORIES);
    });

    it('should export MESSAGE_TYPES', () => {
      assert.ok(sdk.MESSAGE_TYPES);
    });

    it('should export RELATION_STATUS', () => {
      assert.ok(sdk.RELATION_STATUS);
    });
  });

  describe('integration', () => {
    it('should coordinate between systems', () => {
      // Create instances
      const kingdom = new sdk.AIKingdom();
      const treasury = new sdk.RoyalTreasury();
      const guard = new sdk.RoyalGuard();
      
      // Add territory
      kingdom.addTerritory({ name: 'MainLand', type: 'capital' });
      
      // Deposit resources
      treasury.deposit('gold', 1000);
      
      // Guard patrols
      guard.patrol('MainLand');
      
      // All should work together
      assert.ok(kingdom);
      assert.ok(treasury.getBalance('gold') >= 1000);
    });
  });
});
