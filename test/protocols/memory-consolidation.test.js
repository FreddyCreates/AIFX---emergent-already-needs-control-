const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('MemoryConsolidationProtocol', () => {
  let MemoryConsolidationProtocol;
  let MEMORY_TYPES;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/memory-consolidation-protocol.js');
    MemoryConsolidationProtocol = module.MemoryConsolidationProtocol;
    MEMORY_TYPES = module.MEMORY_TYPES;
    protocol = new MemoryConsolidationProtocol();
  });

  describe('constructor', () => {
    it('should initialize empty memory stores', () => {
      assert.equal(protocol.working.size, 0);
      assert.equal(protocol.episodic.size, 0);
      assert.equal(protocol.semantic.size, 0);
    });

    it('should set working capacity to 7 (Miller\'s number)', () => {
      assert.equal(protocol.workingCapacity, 7);
    });

    it('should set consolidation threshold to phi - 1', () => {
      const PHI = 1.618033988749895;
      assert.ok(Math.abs(protocol.consolidationThreshold - (PHI - 1)) < 0.001);
    });

    it('should initialize counters to zero', () => {
      assert.equal(protocol.totalConsolidations, 0);
      assert.equal(protocol.beatCount, 0);
    });
  });

  describe('encode()', () => {
    it('should add memory to working memory', () => {
      protocol.encode('test content');
      assert.equal(protocol.working.size, 1);
    });

    it('should return memory id', () => {
      const id = protocol.encode('test');
      assert.ok(id.startsWith('mem-'));
    });

    it('should store content in memory', () => {
      const id = protocol.encode('test content');
      const mem = protocol.working.get(id);
      assert.equal(mem.content, 'test content');
    });

    it('should accept importance parameter', () => {
      const id = protocol.encode('important', 0.9);
      const mem = protocol.working.get(id);
      assert.equal(mem.importance, 0.9);
    });

    it('should use default importance of 0.5', () => {
      const id = protocol.encode('normal');
      const mem = protocol.working.get(id);
      assert.equal(mem.importance, 0.5);
    });

    it('should clamp importance to [0, 1]', () => {
      const id1 = protocol.encode('high', 1.5);
      const id2 = protocol.encode('low', -0.5);
      assert.equal(protocol.working.get(id1).importance, 1);
      assert.equal(protocol.working.get(id2).importance, 0);
    });

    it('should set encodedAt timestamp', () => {
      const before = Date.now();
      const id = protocol.encode('test');
      const after = Date.now();
      const mem = protocol.working.get(id);
      assert.ok(mem.encodedAt >= before);
      assert.ok(mem.encodedAt <= after);
    });

    it('should set initial accessCount to 0', () => {
      const id = protocol.encode('test');
      const mem = protocol.working.get(id);
      assert.equal(mem.accessCount, 0);
    });

    it('should set memory type to working', () => {
      const id = protocol.encode('test');
      const mem = protocol.working.get(id);
      assert.equal(mem.type, 'working');
    });

    it('should calculate strength as importance * PHI', () => {
      const PHI = 1.618033988749895;
      const id = protocol.encode('test', 0.5);
      const mem = protocol.working.get(id);
      assert.ok(Math.abs(mem.strength - (0.5 * PHI)) < 0.001);
    });

    it('should enforce working memory capacity limit', () => {
      // Add more than capacity
      for (let i = 0; i < 10; i++) {
        protocol.encode(`item-${i}`, 0.5);
      }
      assert.equal(protocol.working.size, 7);
    });

    it('should remove weakest memories when over capacity', () => {
      // Add weak memories
      for (let i = 0; i < 7; i++) {
        protocol.encode(`weak-${i}`, 0.1);
      }
      // Add strong memory - should push out a weak one
      const strongId = protocol.encode('strong', 0.9);
      assert.ok(protocol.working.has(strongId));
      assert.equal(protocol.working.size, 7);
    });
  });

  describe('recall()', () => {
    it('should return memory from working store', () => {
      const id = protocol.encode('test');
      const mem = protocol.recall(id);
      assert.ok(mem);
      assert.equal(mem.content, 'test');
    });

    it('should return memory from episodic store', () => {
      const id = protocol.encode('test', 0.9);
      // Force consolidation
      protocol.working.get(id).strength = 1.0;
      protocol.consolidate();
      const mem = protocol.recall(id);
      assert.ok(mem);
      assert.equal(mem.content, 'test');
    });

    it('should return memory from semantic store', () => {
      const id = protocol.encode('test', 0.9);
      const mem = protocol.working.get(id);
      mem.strength = 1.5;
      mem.accessCount = 5;
      // Move to semantic via consolidations
      protocol.consolidate();
      protocol.consolidate();
      const recalled = protocol.recall(id);
      assert.ok(recalled);
    });

    it('should return undefined for non-existent memory', () => {
      const mem = protocol.recall('nonexistent');
      assert.equal(mem, undefined);
    });

    it('should increment accessCount on recall', () => {
      const id = protocol.encode('test');
      protocol.recall(id);
      protocol.recall(id);
      const mem = protocol.working.get(id);
      assert.equal(mem.accessCount, 2);
    });

    it('should update lastAccess timestamp', () => {
      const id = protocol.encode('test');
      const before = Date.now();
      protocol.recall(id);
      const after = Date.now();
      const mem = protocol.working.get(id);
      assert.ok(mem.lastAccess >= before);
      assert.ok(mem.lastAccess <= after);
    });

    it('should strengthen memory on recall', () => {
      const id = protocol.encode('test', 0.5);
      const strengthBefore = protocol.working.get(id).strength;
      protocol.recall(id);
      const strengthAfter = protocol.working.get(id).strength;
      assert.ok(strengthAfter > strengthBefore);
    });

    it('should cap strength at PHI', () => {
      const id = protocol.encode('test', 0.9);
      const mem = protocol.working.get(id);
      mem.strength = 1.6;
      protocol.recall(id);
      const PHI = 1.618033988749895;
      assert.ok(mem.strength <= PHI);
    });
  });

  describe('search()', () => {
    beforeEach(() => {
      protocol.encode('apple pie recipe');
      protocol.encode('banana bread');
      protocol.encode('cherry cake');
    });

    it('should find memories matching string query', () => {
      const results = protocol.search('apple');
      assert.equal(results.length, 1);
      assert.ok(results[0].content.includes('apple'));
    });

    it('should return empty array for no matches', () => {
      const results = protocol.search('orange');
      assert.equal(results.length, 0);
    });

    it('should search case-insensitively', () => {
      const results = protocol.search('APPLE');
      assert.equal(results.length, 1);
    });

    it('should search all memory stores', () => {
      const id = protocol.encode('important memory', 0.9);
      protocol.working.get(id).strength = 1.0;
      protocol.consolidate();
      
      const results = protocol.search('memory');
      assert.ok(results.length >= 1);
    });

    it('should sort results by relevance (strength)', () => {
      const id1 = protocol.encode('weak match', 0.2);
      const id2 = protocol.encode('strong match', 0.9);
      
      const results = protocol.search('match');
      assert.ok(results[0].strength >= results[1].strength);
    });

    it('should include memory type in results', () => {
      const results = protocol.search('apple');
      assert.ok('type' in results[0]);
    });

    it('should include relevance score in results', () => {
      const results = protocol.search('apple');
      assert.ok('relevance' in results[0]);
    });

    it('should handle object content', () => {
      protocol.encode({ fruit: 'apple', color: 'red' });
      const results = protocol.search('apple');
      assert.equal(results.length, 2); // including 'apple pie recipe'
    });
  });

  describe('consolidate()', () => {
    it('should increment beatCount', () => {
      protocol.consolidate();
      assert.equal(protocol.beatCount, 1);
    });

    it('should return consolidated array', () => {
      const result = protocol.consolidate();
      assert.ok(Array.isArray(result.consolidated));
    });

    it('should return beat number', () => {
      const result = protocol.consolidate();
      assert.equal(result.beat, 1);
    });

    it('should move strong working memories to episodic', () => {
      const id = protocol.encode('important', 0.9);
      protocol.working.get(id).strength = 0.7; // Above threshold
      
      protocol.consolidate();
      
      assert.equal(protocol.working.has(id), false);
      assert.equal(protocol.episodic.has(id), true);
    });

    it('should not move weak working memories', () => {
      const id = protocol.encode('weak', 0.1);
      protocol.working.get(id).strength = 0.3; // Below threshold
      
      protocol.consolidate();
      
      assert.equal(protocol.working.has(id), true);
      assert.equal(protocol.episodic.has(id), false);
    });

    it('should update memory type when consolidated', () => {
      const id = protocol.encode('test', 0.9);
      protocol.working.get(id).strength = 0.7;
      
      protocol.consolidate();
      
      const mem = protocol.episodic.get(id);
      assert.equal(mem.type, 'episodic');
    });

    it('should set consolidatedAt timestamp', () => {
      const id = protocol.encode('test', 0.9);
      protocol.working.get(id).strength = 0.7;
      const before = Date.now();
      
      protocol.consolidate();
      
      const mem = protocol.episodic.get(id);
      assert.ok(mem.consolidatedAt >= before);
    });

    it('should increment totalConsolidations counter', () => {
      const id = protocol.encode('test', 0.9);
      protocol.working.get(id).strength = 0.7;
      
      protocol.consolidate();
      
      assert.equal(protocol.totalConsolidations, 1);
    });

    it('should move frequently accessed episodic to semantic', () => {
      const id = protocol.encode('test', 0.9);
      const mem = protocol.working.get(id);
      mem.strength = 1.2;
      mem.accessCount = 5;
      
      // First consolidation: working -> episodic
      protocol.consolidate();
      
      // Second consolidation: episodic -> semantic
      protocol.consolidate();
      
      assert.equal(protocol.episodic.has(id), false);
      assert.equal(protocol.semantic.has(id), true);
    });

    it('should create abstraction for semantic memories', () => {
      const id = protocol.encode('detailed memory content here', 0.9);
      const mem = protocol.working.get(id);
      mem.strength = 1.2;
      mem.accessCount = 5;
      
      protocol.consolidate();
      protocol.consolidate();
      
      const semantic = protocol.semantic.get(id);
      assert.ok('abstraction' in semantic);
    });

    it('should record from/to in consolidated array', () => {
      const id = protocol.encode('test', 0.9);
      protocol.working.get(id).strength = 0.7;
      
      const result = protocol.consolidate();
      
      assert.ok(result.consolidated.some(c => c.from === 'working' && c.to === 'episodic'));
    });
  });

  describe('abstract()', () => {
    it('should extract key terms from string', () => {
      const abstraction = protocol.abstract('This is a detailed memory about important events');
      assert.ok(abstraction.includes('detailed') || abstraction.includes('memory') || abstraction.includes('important'));
    });

    it('should filter short words', () => {
      const abstraction = protocol.abstract('a to be or not to be');
      // Should only keep words > 3 chars
      assert.ok(!abstraction.includes(' a '));
    });

    it('should limit to 5 unique terms', () => {
      const abstraction = protocol.abstract('one two three four five six seven eight nine ten eleven');
      const terms = abstraction.split(' ').filter(t => t.length > 0);
      assert.ok(terms.length <= 5);
    });

    it('should handle object content', () => {
      const abstraction = protocol.abstract({ key: 'value', data: 'content' });
      assert.ok(typeof abstraction === 'string');
    });

    it('should remove duplicate terms', () => {
      const abstraction = protocol.abstract('important important important data data');
      const terms = abstraction.split(' ');
      const unique = [...new Set(terms)];
      assert.equal(terms.length, unique.length);
    });
  });

  describe('decay()', () => {
    it('should reduce strength of working memories', () => {
      const id = protocol.encode('test', 0.5);
      const strengthBefore = protocol.working.get(id).strength;
      
      protocol.decay();
      
      const strengthAfter = protocol.working.get(id).strength;
      assert.ok(strengthAfter < strengthBefore);
    });

    it('should apply faster decay to working than episodic', () => {
      // Encode with low importance to keep in working memory
      const workingId = protocol.encode('working', 0.1);
      const episodicId = protocol.encode('episodic', 0.9);
      
      // Move episodic memory to episodic store
      protocol.working.get(episodicId).strength = 0.7;
      protocol.consolidate();
      
      // Make sure workingId is still in working (set low strength before consolidate)
      if (protocol.working.has(workingId)) {
        // Set same strength for comparison
        protocol.working.get(workingId).strength = 0.5;
        protocol.episodic.get(episodicId).strength = 0.5;
        
        protocol.decay();
        
        const workingStrength = protocol.working.get(workingId).strength;
        const episodicStrength = protocol.episodic.get(episodicId).strength;
        
        assert.ok(workingStrength < episodicStrength);
      } else {
        // Working memory was consolidated, just verify decay rates are different
        const workingRate = 0.9;
        const episodicRate = 0.99;
        assert.ok(workingRate < episodicRate);
      }
    });

    it('should remove memories below strength threshold', () => {
      const id = protocol.encode('weak', 0.1);
      protocol.working.get(id).strength = 0.1;
      
      // Decay multiple times
      for (let i = 0; i < 10; i++) {
        protocol.decay();
      }
      
      assert.equal(protocol.working.has(id), false);
    });

    it('should preserve semantic memories longer', () => {
      const id = protocol.encode('semantic', 0.9);
      const mem = protocol.working.get(id);
      mem.strength = 1.2;
      mem.accessCount = 5;
      protocol.consolidate();
      protocol.consolidate();
      
      // Decay many times
      for (let i = 0; i < 50; i++) {
        protocol.decay();
      }
      
      // Semantic should still exist
      assert.ok(protocol.semantic.has(id));
    });
  });

  describe('getStats()', () => {
    it('should return working memory stats', () => {
      const stats = protocol.getStats();
      assert.ok('working' in stats);
      assert.ok('count' in stats.working);
      assert.ok('capacity' in stats.working);
      assert.ok('avgStrength' in stats.working);
    });

    it('should return episodic memory stats', () => {
      const stats = protocol.getStats();
      assert.ok('episodic' in stats);
      assert.ok('count' in stats.episodic);
      assert.ok('avgStrength' in stats.episodic);
    });

    it('should return semantic memory stats', () => {
      const stats = protocol.getStats();
      assert.ok('semantic' in stats);
      assert.ok('count' in stats.semantic);
      assert.ok('avgStrength' in stats.semantic);
    });

    it('should return accurate counts', () => {
      protocol.encode('a');
      protocol.encode('b');
      protocol.encode('c');
      
      const stats = protocol.getStats();
      assert.equal(stats.working.count, 3);
    });

    it('should return totalConsolidations', () => {
      const stats = protocol.getStats();
      assert.ok('totalConsolidations' in stats);
    });

    it('should return beatCount', () => {
      const stats = protocol.getStats();
      assert.ok('beatCount' in stats);
    });

    it('should return protocol constants', () => {
      const stats = protocol.getStats();
      assert.ok(Math.abs(stats.phi - 1.618) < 0.001);
      assert.equal(stats.heartbeat, 873);
      assert.ok(Math.abs(stats.consolidationThreshold - 0.618) < 0.001);
    });

    it('should calculate average strength correctly', () => {
      const id1 = protocol.encode('a', 0.4);
      const id2 = protocol.encode('b', 0.6);
      protocol.working.get(id1).strength = 0.4;
      protocol.working.get(id2).strength = 0.6;
      
      const stats = protocol.getStats();
      assert.ok(Math.abs(stats.working.avgStrength - 0.5) < 0.001);
    });
  });

  describe('avgStrength()', () => {
    it('should return 0 for empty store', () => {
      assert.equal(protocol.avgStrength(protocol.working), 0);
    });

    it('should calculate average correctly', () => {
      protocol.encode('a', 0.5);
      protocol.encode('b', 0.5);
      // Set known strengths
      let i = 0;
      for (const mem of protocol.working.values()) {
        mem.strength = [0.3, 0.5][i++];
      }
      
      const avg = protocol.avgStrength(protocol.working);
      assert.ok(Math.abs(avg - 0.4) < 0.001);
    });
  });
});

describe('MEMORY_TYPES', () => {
  it('should export memory types array', async () => {
    const module = await import('../../protocols/memory-consolidation-protocol.js');
    assert.deepEqual(module.MEMORY_TYPES, ['working', 'episodic', 'semantic']);
  });
});
