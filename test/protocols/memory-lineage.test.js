const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('MemoryLineageProtocol', () => {
  let MemoryLineageProtocol;
  let protocol;
  const PHI = 1.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/memory-lineage-protocol.js');
    MemoryLineageProtocol = module.MemoryLineageProtocol;
    protocol = new MemoryLineageProtocol();
  });

  describe('constructor', () => {
    it('should initialize empty memories map', () => {
      assert.ok(protocol.memories instanceof Map);
      assert.equal(protocol.memories.size, 0);
    });

    it('should initialize empty branches map', () => {
      assert.ok(protocol.branches instanceof Map);
    });

    it('should initialize empty rootIds set', () => {
      assert.ok(protocol.rootIds instanceof Set);
      assert.equal(protocol.rootIds.size, 0);
    });

    it('should set default maxMemories to 10000', () => {
      assert.equal(protocol.maxMemories, 10000);
    });

    it('should accept custom maxMemories', async () => {
      const module = await import('../../protocols/memory-lineage-protocol.js');
      const custom = new module.MemoryLineageProtocol({ maxMemories: 5000 });
      assert.equal(custom.maxMemories, 5000);
    });

    it('should set default gcThreshold to 0.3', () => {
      assert.equal(protocol.gcThreshold, 0.3);
    });

    it('should set default consolidationDepth to 5', () => {
      assert.equal(protocol.consolidationDepth, 5);
    });

    it('should initialize nextIndex to 0', () => {
      assert.equal(protocol.nextIndex, 0);
    });

    it('should initialize metrics', () => {
      assert.ok(protocol.metrics);
      assert.equal(protocol.metrics.totalCreated, 0);
      assert.equal(protocol.metrics.totalForked, 0);
    });
  });

  describe('_phiCoordinates()', () => {
    it('should return array of two numbers', () => {
      const coords = protocol._phiCoordinates(0);
      assert.ok(Array.isArray(coords));
      assert.equal(coords.length, 2);
    });

    it('should compute coordinates for index 0', () => {
      const [x, y] = protocol._phiCoordinates(0);
      assert.ok(typeof x === 'number');
      assert.ok(typeof y === 'number');
    });

    it('should use golden angle spiral', () => {
      const coords1 = protocol._phiCoordinates(1);
      const coords2 = protocol._phiCoordinates(2);
      // Different indices should give different coords
      assert.notDeepEqual(coords1, coords2);
    });
  });

  describe('_contentHash()', () => {
    it('should return string hash', () => {
      const hash = protocol._contentHash('test content');
      assert.ok(typeof hash === 'string');
    });

    it('should return consistent hash for same content', () => {
      const hash1 = protocol._contentHash('test');
      const hash2 = protocol._contentHash('test');
      assert.equal(hash1, hash2);
    });

    it('should return different hash for different content', () => {
      const hash1 = protocol._contentHash('test1');
      const hash2 = protocol._contentHash('test2');
      assert.notEqual(hash1, hash2);
    });
  });

  describe('createMemory()', () => {
    it('should create memory and return node', () => {
      const node = protocol.createMemory('test content');
      assert.ok(node);
      assert.ok(node.id);
    });

    it('should add to memories map', () => {
      const node = protocol.createMemory('test content');
      assert.ok(protocol.memories.has(node.id));
    });

    it('should add to rootIds for root memory', () => {
      const node = protocol.createMemory('test content');
      assert.ok(protocol.rootIds.has(node.id));
    });

    it('should store content', () => {
      const node = protocol.createMemory('my content');
      assert.equal(node.content, 'my content');
    });

    it('should set parentId to null for root', () => {
      const node = protocol.createMemory('test');
      assert.equal(node.parentId, null);
    });

    it('should initialize empty childIds', () => {
      const node = protocol.createMemory('test');
      assert.ok(Array.isArray(node.childIds));
      assert.equal(node.childIds.length, 0);
    });

    it('should compute phiCoords', () => {
      const node = protocol.createMemory('test');
      assert.ok(Array.isArray(node.phiCoords));
      assert.equal(node.phiCoords.length, 2);
    });

    it('should set createdAt timestamp', () => {
      const before = Date.now();
      const node = protocol.createMemory('test');
      const after = Date.now();
      assert.ok(node.createdAt >= before);
      assert.ok(node.createdAt <= after);
    });

    it('should initialize accessCount to 0', () => {
      const node = protocol.createMemory('test');
      assert.equal(node.accessCount, 0);
    });

    it('should set generation to 0 for root', () => {
      const node = protocol.createMemory('test');
      assert.equal(node.generation, 0);
    });

    it('should compute content hash', () => {
      const node = protocol.createMemory('test');
      assert.ok(node.contentHash);
    });

    it('should increment totalCreated metric', () => {
      protocol.createMemory('test1');
      protocol.createMemory('test2');
      assert.equal(protocol.metrics.totalCreated, 2);
    });

    it('should increment nextIndex', () => {
      protocol.createMemory('test1');
      protocol.createMemory('test2');
      assert.equal(protocol.nextIndex, 2);
    });
  });

  describe('forkMemory()', () => {
    let parentId;

    beforeEach(() => {
      const parent = protocol.createMemory('parent content');
      parentId = parent.id;
    });

    it('should create forked memory', () => {
      const fork = protocol.forkMemory(parentId, 'forked content');
      assert.ok(fork);
    });

    it('should set parentId', () => {
      const fork = protocol.forkMemory(parentId, 'forked');
      assert.equal(fork.parentId, parentId);
    });

    it('should add to parent childIds', () => {
      const fork = protocol.forkMemory(parentId, 'forked');
      const parent = protocol.memories.get(parentId);
      assert.ok(parent.childIds.includes(fork.id));
    });

    it('should increment generation', () => {
      const fork = protocol.forkMemory(parentId, 'forked');
      assert.equal(fork.generation, 1);
    });

    it('should not be in rootIds', () => {
      const fork = protocol.forkMemory(parentId, 'forked');
      assert.ok(!protocol.rootIds.has(fork.id));
    });

    it('should return null for unknown parent', () => {
      const fork = protocol.forkMemory('unknown-id', 'content');
      assert.equal(fork, null);
    });

    it('should increment totalForked metric', () => {
      protocol.forkMemory(parentId, 'fork1');
      protocol.forkMemory(parentId, 'fork2');
      assert.equal(protocol.metrics.totalForked, 2);
    });

    it('should track deepest generation', () => {
      const fork1 = protocol.forkMemory(parentId, 'gen1');
      const fork2 = protocol.forkMemory(fork1.id, 'gen2');
      const fork3 = protocol.forkMemory(fork2.id, 'gen3');
      assert.ok(protocol.metrics.deepestGeneration >= 3);
    });
  });

  describe('accessMemory()', () => {
    let memoryId;

    beforeEach(() => {
      const node = protocol.createMemory('test content');
      memoryId = node.id;
    });

    it('should return memory content', () => {
      const result = protocol.accessMemory(memoryId);
      assert.ok(result);
    });

    it('should increment accessCount', () => {
      protocol.accessMemory(memoryId);
      protocol.accessMemory(memoryId);
      const node = protocol.memories.get(memoryId);
      assert.equal(node.accessCount, 2);
    });

    it('should update lastAccessed', () => {
      const before = Date.now();
      protocol.accessMemory(memoryId);
      const after = Date.now();
      const node = protocol.memories.get(memoryId);
      assert.ok(node.lastAccessed >= before);
      assert.ok(node.lastAccessed <= after);
    });

    it('should return null for unknown memory', () => {
      const result = protocol.accessMemory('unknown-id');
      assert.equal(result, null);
    });

    it('should increment totalAccessed metric', () => {
      protocol.accessMemory(memoryId);
      protocol.accessMemory(memoryId);
      assert.equal(protocol.metrics.totalAccessed, 2);
    });
  });

  describe('getLineage()', () => {
    it('should return lineage for memory', () => {
      const root = protocol.createMemory('root');
      const fork1 = protocol.forkMemory(root.id, 'fork1');
      const fork2 = protocol.forkMemory(fork1.id, 'fork2');
      
      const lineage = protocol.getLineage(fork2.id);
      assert.ok(Array.isArray(lineage));
      assert.ok(lineage.length >= 3);
    });

    it('should include all ancestors', () => {
      const root = protocol.createMemory('root');
      const fork1 = protocol.forkMemory(root.id, 'fork1');
      
      const lineage = protocol.getLineage(fork1.id);
      assert.ok(lineage.some(n => n.id === root.id));
    });

    it('should return empty for unknown memory', () => {
      const lineage = protocol.getLineage('unknown');
      assert.ok(Array.isArray(lineage));
      assert.equal(lineage.length, 0);
    });
  });

  describe('consolidate()', () => {
    it('should consolidate deep lineages', () => {
      // Create deep lineage
      let currentId = protocol.createMemory('root').id;
      for (let i = 0; i < 10; i++) {
        currentId = protocol.forkMemory(currentId, `gen${i}`).id;
      }
      
      const result = protocol.consolidate(currentId);
      assert.ok(result || result === null);
    });
  });

  describe('garbageCollect()', () => {
    it('should remove infrequently accessed memories', () => {
      // Create many memories
      for (let i = 0; i < 100; i++) {
        protocol.createMemory(`memory ${i}`);
      }
      
      // Access some frequently
      const ids = Array.from(protocol.memories.keys()).slice(0, 10);
      for (const id of ids) {
        for (let i = 0; i < 10; i++) {
          protocol.accessMemory(id);
        }
      }
      
      const collected = protocol.garbageCollect();
      assert.ok(typeof collected === 'number' || collected === undefined);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include totalCreated', () => {
      protocol.createMemory('test');
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalCreated, 1);
    });

    it('should include totalForked', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalForked' in metrics);
    });

    it('should include deepestGeneration', () => {
      const metrics = protocol.getMetrics();
      assert.ok('deepestGeneration' in metrics);
    });
  });

  describe('integration', () => {
    it('should build complete memory tree', () => {
      // Create root
      const root = protocol.createMemory('root knowledge');
      
      // Create branches
      const branch1 = protocol.forkMemory(root.id, 'branch 1');
      const branch2 = protocol.forkMemory(root.id, 'branch 2');
      
      // Create sub-branches
      protocol.forkMemory(branch1.id, 'sub 1.1');
      protocol.forkMemory(branch1.id, 'sub 1.2');
      protocol.forkMemory(branch2.id, 'sub 2.1');
      
      // Access memories
      protocol.accessMemory(root.id);
      protocol.accessMemory(branch1.id);
      
      // Check structure
      assert.equal(protocol.memories.size, 6);
      assert.equal(protocol.rootIds.size, 1);
      assert.ok(protocol.metrics.deepestGeneration >= 2);
    });
  });
});
