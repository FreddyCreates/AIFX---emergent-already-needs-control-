const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { UniversalAtlasRegistry } = require('../../sdk/governance/atlas-registry.js');

describe('UniversalAtlasRegistry', () => {
  let tmpRegistryDir;
  let registry;

  beforeEach(() => {
    tmpRegistryDir = path.join(os.tmpdir(), `atlas-registry-test-${Date.now()}`);
    fs.mkdirSync(tmpRegistryDir, { recursive: true });
    
    // Create some test entity files
    const entities = [
      {
        id: 'atlas://bot/alpha-bot',
        name: 'Alpha Bot',
        class: 'Bot',
        division: 'Core',
        domain: 'Security',
        capabilities: ['scan', 'alert'],
        events: ['security_scan', 'alert_triggered'],
        law_refs: ['BOT_FLEET_LAW#SECURITY'],
        protocol_refs: ['PROTO-001'],
      },
      {
        id: 'atlas://bot/beta-bot',
        name: 'Beta Bot',
        class: 'Bot',
        division: 'Core',
        domain: 'Learning',
        capabilities: ['learn', 'train'],
        events: ['training_complete'],
        law_refs: ['BOT_FLEET_LAW#LEARNING'],
        protocol_refs: ['PROTO-002', 'PROTO-003'],
      },
      {
        id: 'atlas://agent/copilot',
        name: 'Copilot Agent',
        class: 'Agent',
        division: 'External',
        domain: 'Coding',
        capabilities: ['code', 'review'],
        events: ['code_generated'],
      },
      {
        id: 'atlas://organism/sovereign',
        name: 'Sovereign Organism',
        class: 'Organism',
        division: 'Core',
        domain: 'Orchestration',
        capabilities: ['orchestrate', 'manage'],
      },
    ];

    for (const entity of entities) {
      const filename = entity.id.split('/').pop() + '.json';
      fs.writeFileSync(path.join(tmpRegistryDir, filename), JSON.stringify(entity, null, 2));
    }

    registry = new UniversalAtlasRegistry([tmpRegistryDir]);
  });

  afterEach(() => {
    if (fs.existsSync(tmpRegistryDir)) {
      fs.rmSync(tmpRegistryDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should accept single directory', () => {
      const reg = new UniversalAtlasRegistry(tmpRegistryDir);
      assert.deepEqual(reg._dirs, [tmpRegistryDir]);
    });

    it('should accept array of directories', () => {
      const dirs = ['/dir1', '/dir2'];
      const reg = new UniversalAtlasRegistry(dirs);
      assert.deepEqual(reg._dirs, dirs);
    });

    it('should initialize empty entities map', () => {
      const reg = new UniversalAtlasRegistry([tmpRegistryDir]);
      assert.equal(reg._entities.size, 0);
    });

    it('should initialize loaded flag to false', () => {
      const reg = new UniversalAtlasRegistry([tmpRegistryDir]);
      assert.equal(reg._loaded, false);
    });
  });

  describe('load()', () => {
    it('should load entities from directory', () => {
      registry.load();
      assert.equal(registry._entities.size, 4);
    });

    it('should set loaded flag', () => {
      registry.load();
      assert.equal(registry._loaded, true);
    });

    it('should return this for chaining', () => {
      const result = registry.load();
      assert.equal(result, registry);
    });

    it('should skip non-existent directories', () => {
      const reg = new UniversalAtlasRegistry(['/nonexistent', tmpRegistryDir]);
      reg.load();
      assert.equal(reg._entities.size, 4);
    });

    it('should skip non-JSON files', () => {
      fs.writeFileSync(path.join(tmpRegistryDir, 'readme.txt'), 'text file');
      registry.load();
      assert.equal(registry._entities.size, 4);
    });

    it('should skip invalid JSON files', () => {
      fs.writeFileSync(path.join(tmpRegistryDir, 'invalid.json'), '{ bad json }');
      registry.load();
      assert.equal(registry._entities.size, 4);
    });

    it('should skip entities without id', () => {
      fs.writeFileSync(path.join(tmpRegistryDir, 'no-id.json'), '{"name": "No ID"}');
      registry.load();
      assert.equal(registry._entities.size, 4);
    });

    it('should not reload if already loaded', () => {
      registry.load();
      // Add a new file
      fs.writeFileSync(path.join(tmpRegistryDir, 'new.json'), '{"id": "atlas://new/entity"}');
      registry.load(); // Should not pick up new file
      assert.equal(registry._entities.size, 4);
    });
  });

  describe('reload()', () => {
    it('should clear and reload entities', () => {
      registry.load();
      assert.equal(registry._entities.size, 4);
      
      // Add a new file
      fs.writeFileSync(path.join(tmpRegistryDir, 'new.json'), '{"id": "atlas://new/entity"}');
      registry.reload();
      assert.equal(registry._entities.size, 5);
    });

    it('should return this for chaining', () => {
      const result = registry.reload();
      assert.equal(result, registry);
    });
  });

  describe('get()', () => {
    it('should return entity by id', () => {
      const entity = registry.get('atlas://bot/alpha-bot');
      assert.equal(entity.name, 'Alpha Bot');
    });

    it('should return null for non-existent id', () => {
      const entity = registry.get('atlas://bot/nonexistent');
      assert.equal(entity, null);
    });

    it('should auto-load if not loaded', () => {
      const fresh = new UniversalAtlasRegistry([tmpRegistryDir]);
      const entity = fresh.get('atlas://bot/alpha-bot');
      assert.equal(entity.name, 'Alpha Bot');
    });
  });

  describe('getByName()', () => {
    it('should return entity by name', () => {
      const entity = registry.getByName('Alpha Bot');
      assert.equal(entity.id, 'atlas://bot/alpha-bot');
    });

    it('should return null for non-existent name', () => {
      const entity = registry.getByName('Nonexistent');
      assert.equal(entity, null);
    });
  });

  describe('all()', () => {
    it('should return all entities', () => {
      const entities = registry.all();
      assert.equal(entities.length, 4);
    });

    it('should return array', () => {
      const entities = registry.all();
      assert.ok(Array.isArray(entities));
    });
  });

  describe('byClass()', () => {
    it('should filter by class', () => {
      const bots = registry.byClass('Bot');
      assert.equal(bots.length, 2);
    });

    it('should be case-insensitive', () => {
      const bots = registry.byClass('bot');
      assert.equal(bots.length, 2);
    });

    it('should return empty array for no matches', () => {
      const engines = registry.byClass('Engine');
      assert.deepEqual(engines, []);
    });
  });

  describe('byDivision()', () => {
    it('should filter by division', () => {
      const core = registry.byDivision('Core');
      assert.equal(core.length, 3);
    });

    it('should return empty array for no matches', () => {
      const none = registry.byDivision('Nonexistent');
      assert.deepEqual(none, []);
    });
  });

  describe('byDomain()', () => {
    it('should filter by domain', () => {
      const security = registry.byDomain('Security');
      assert.equal(security.length, 1);
    });

    it('should be case-insensitive', () => {
      const security = registry.byDomain('security');
      assert.equal(security.length, 1);
    });

    it('should match partial domain names', () => {
      const learn = registry.byDomain('Learn');
      assert.equal(learn.length, 1);
    });
  });

  describe('byCapability()', () => {
    it('should filter by capability', () => {
      const scanners = registry.byCapability('scan');
      assert.equal(scanners.length, 1);
      assert.equal(scanners[0].name, 'Alpha Bot');
    });

    it('should return empty array for no matches', () => {
      const none = registry.byCapability('nonexistent');
      assert.deepEqual(none, []);
    });
  });

  describe('byLaw()', () => {
    it('should filter by law reference', () => {
      const security = registry.byLaw('SECURITY');
      assert.equal(security.length, 1);
    });

    it('should match partial law refs', () => {
      const bots = registry.byLaw('BOT_FLEET_LAW');
      assert.equal(bots.length, 2);
    });
  });

  describe('byProtocol()', () => {
    it('should filter by protocol reference', () => {
      const proto1 = registry.byProtocol('PROTO-001');
      assert.equal(proto1.length, 1);
    });

    it('should match partial protocol refs', () => {
      const protos = registry.byProtocol('PROTO');
      assert.equal(protos.length, 2);
    });
  });

  describe('byEventOp()', () => {
    it('should filter by event operation', () => {
      const scanners = registry.byEventOp('security_scan');
      assert.equal(scanners.length, 1);
    });

    it('should return empty array for no matches', () => {
      const none = registry.byEventOp('nonexistent_event');
      assert.deepEqual(none, []);
    });
  });

  describe('byAtlasClass()', () => {
    it('should filter by atlas URI prefix', () => {
      const bots = registry.byAtlasClass('bot');
      assert.equal(bots.length, 2);
    });

    it('should match agent class', () => {
      const agents = registry.byAtlasClass('agent');
      assert.equal(agents.length, 1);
    });

    it('should match organism class', () => {
      const organisms = registry.byAtlasClass('organism');
      assert.equal(organisms.length, 1);
    });
  });

  describe('has()', () => {
    it('should return true for existing entity', () => {
      assert.equal(registry.has('atlas://bot/alpha-bot'), true);
    });

    it('should return false for non-existent entity', () => {
      assert.equal(registry.has('atlas://bot/nonexistent'), false);
    });
  });

  describe('size()', () => {
    it('should return entity count', () => {
      assert.equal(registry.size(), 4);
    });
  });

  describe('summary()', () => {
    it('should return total count', () => {
      const summary = registry.summary();
      assert.equal(summary.total, 4);
    });

    it('should group by class', () => {
      const summary = registry.summary();
      assert.ok('Bot' in summary.byClass);
      assert.equal(summary.byClass.Bot.length, 2);
    });

    it('should group by division', () => {
      const summary = registry.summary();
      assert.ok('Core' in summary.byDivision);
      assert.equal(summary.byDivision.Core.length, 3);
    });

    it('should collect all capabilities', () => {
      const summary = registry.summary();
      assert.ok(summary.capabilities.includes('scan'));
      assert.ok(summary.capabilities.includes('learn'));
      assert.ok(summary.capabilities.includes('code'));
    });
  });

  describe('register()', () => {
    it('should require entity id', () => {
      assert.throws(
        () => registry.register({ name: 'No ID' }),
        /Entity must have an id/
      );
    });

    it('should add entity in-memory', () => {
      registry.register({
        id: 'atlas://new/entity',
        name: 'New Entity',
      });
      assert.equal(registry.size(), 5);
    });

    it('should return this for chaining', () => {
      const result = registry.register({ id: 'atlas://test/chain' });
      assert.equal(result, registry);
    });

    it('should make entity retrievable', () => {
      registry.register({
        id: 'atlas://custom/test',
        name: 'Custom Test',
      });
      const entity = registry.get('atlas://custom/test');
      assert.equal(entity.name, 'Custom Test');
    });
  });
});
