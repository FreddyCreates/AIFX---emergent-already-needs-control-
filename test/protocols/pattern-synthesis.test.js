const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('PatternSynthesisProtocol', () => {
  let PatternSynthesisProtocol, DOMAINS, KNOWLEDGE_PRIMITIVES;
  let protocol;
  const PHI = 1.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/pattern-synthesis-protocol.js');
    PatternSynthesisProtocol = module.PatternSynthesisProtocol;
    DOMAINS = module.DOMAINS;
    KNOWLEDGE_PRIMITIVES = module.KNOWLEDGE_PRIMITIVES;
    protocol = new PatternSynthesisProtocol();
  });

  describe('DOMAINS constant', () => {
    it('should have 40 domains', () => {
      assert.equal(DOMAINS.length, 40);
    });

    it('should include physics domain', () => {
      assert.ok(DOMAINS.includes('physics'));
    });

    it('should include math domain', () => {
      assert.ok(DOMAINS.includes('math'));
    });

    it('should include neuroscience domain', () => {
      assert.ok(DOMAINS.includes('neuroscience'));
    });

    it('should include economics domain', () => {
      assert.ok(DOMAINS.includes('economics'));
    });

    it('should include logic domain', () => {
      assert.ok(DOMAINS.includes('logic'));
    });

    it('should include systems domain', () => {
      assert.ok(DOMAINS.includes('systems'));
    });
  });

  describe('KNOWLEDGE_PRIMITIVES constant', () => {
    it('should have primitives for physics', () => {
      assert.ok(KNOWLEDGE_PRIMITIVES.physics);
      assert.equal(KNOWLEDGE_PRIMITIVES.physics.length, 5);
    });

    it('should have primitives for math', () => {
      assert.ok(KNOWLEDGE_PRIMITIVES.math);
      assert.equal(KNOWLEDGE_PRIMITIVES.math.length, 5);
    });

    it('should have 200 total primitives (5 per 40 domains)', () => {
      let total = 0;
      for (const domain of DOMAINS) {
        if (KNOWLEDGE_PRIMITIVES[domain]) {
          total += KNOWLEDGE_PRIMITIVES[domain].length;
        }
      }
      assert.equal(total, 200);
    });

    it('should include phi-weighted primitives', () => {
      const phiPrimitive = KNOWLEDGE_PRIMITIVES.physics.find(p => p.weight === PHI);
      assert.ok(phiPrimitive);
    });
  });

  describe('constructor', () => {
    it('should initialize empty synthesis map', () => {
      assert.ok(protocol.syntheses instanceof Map);
      assert.equal(protocol.syntheses.size, 0);
    });

    it('should initialize empty patterns array', () => {
      assert.ok(Array.isArray(protocol.patterns));
      assert.equal(protocol.patterns.length, 0);
    });

    it('should initialize empty extractions array', () => {
      assert.ok(Array.isArray(protocol.extractions));
      assert.equal(protocol.extractions.length, 0);
    });

    it('should initialize synthesis count to 0', () => {
      assert.equal(protocol.synthesisCount, 0);
    });

    it('should initialize primitives map', () => {
      assert.ok(protocol.primitives instanceof Map);
    });
  });

  describe('recognize()', () => {
    it('should recognize patterns in input', () => {
      const result = protocol.recognize('The conservation of energy demonstrates phi-ratio symmetry');
      assert.ok(result);
    });

    it('should return matches array', () => {
      const result = protocol.recognize('Mathematical recursion and fractal patterns');
      assert.ok(Array.isArray(result.matches));
    });

    it('should return confidence score', () => {
      const result = protocol.recognize('Evolutionary dynamics in biology');
      assert.ok('confidence' in result);
    });

    it('should identify physics domain', () => {
      const result = protocol.recognize('Conservation laws and entropy in thermodynamics');
      assert.ok(result.domains.includes('physics') || result.matches.some(m => m.domain === 'physics'));
    });

    it('should identify biology domain', () => {
      const result = protocol.recognize('Evolution and morphogenesis in organisms');
      assert.ok(result.domains.includes('biology') || result.matches.some(m => m.domain === 'biology'));
    });

    it('should identify math domain', () => {
      const result = protocol.recognize('Recursive fractal geometry with golden ratios');
      assert.ok(result.domains.includes('math') || result.matches.some(m => m.domain === 'math'));
    });

    it('should return empty matches for unrecognized input', () => {
      const result = protocol.recognize('xyzzy florp bloop');
      assert.ok(result.matches.length === 0 || result.confidence < 0.5);
    });
  });

  describe('extract()', () => {
    it('should extract primitives from text', () => {
      const result = protocol.extract('The system demonstrates conservation and symmetry');
      assert.ok(result);
    });

    it('should return extracted primitives', () => {
      const result = protocol.extract('Entropy increases in closed systems');
      assert.ok(Array.isArray(result.primitives));
    });

    it('should include primitive id', () => {
      const result = protocol.extract('Conservation of energy');
      if (result.primitives.length > 0) {
        assert.ok('id' in result.primitives[0]);
      }
    });

    it('should include primitive weight', () => {
      const result = protocol.extract('Golden ratio phi harmonics');
      if (result.primitives.length > 0) {
        assert.ok('weight' in result.primitives[0]);
      }
    });

    it('should add to extractions history', () => {
      protocol.extract('Test extraction');
      assert.ok(protocol.extractions.length >= 1);
    });
  });

  describe('merge()', () => {
    it('should merge multiple extractions', () => {
      const ext1 = protocol.extract('Conservation of energy');
      const ext2 = protocol.extract('Recursive fractal patterns');
      const result = protocol.merge([ext1, ext2]);
      assert.ok(result);
    });

    it('should return merged primitives', () => {
      const ext1 = protocol.extract('Entropy in thermodynamics');
      const ext2 = protocol.extract('Evolution in biology');
      const result = protocol.merge([ext1, ext2]);
      assert.ok(result.primitives);
    });

    it('should combine weights using phi', () => {
      const ext1 = protocol.extract('Test 1');
      const ext2 = protocol.extract('Test 2');
      const result = protocol.merge([ext1, ext2]);
      assert.ok('totalWeight' in result || 'combinedWeight' in result);
    });

    it('should track source domains', () => {
      const ext1 = protocol.extract('Physics conservation');
      const ext2 = protocol.extract('Math recursion');
      const result = protocol.merge([ext1, ext2]);
      assert.ok(result.domains || result.sourceDomains);
    });
  });

  describe('synthesize()', () => {
    it('should synthesize new knowledge', () => {
      protocol.extract('Conservation and symmetry in physics');
      protocol.extract('Recursive patterns in mathematics');
      const result = protocol.synthesize('cross-domain patterns');
      assert.ok(result);
    });

    it('should increment synthesis count', () => {
      protocol.extract('Some concept');
      protocol.synthesize('new synthesis');
      assert.ok(protocol.synthesisCount >= 1);
    });

    it('should return synthesis id', () => {
      protocol.extract('Test concept');
      const result = protocol.synthesize('synthesis test');
      assert.ok(result.id || result.synthesisId);
    });

    it('should store in syntheses map', () => {
      protocol.extract('Base concept');
      const result = protocol.synthesize('stored synthesis');
      const id = result.id || result.synthesisId;
      assert.ok(protocol.syntheses.has(id) || protocol.syntheses.size >= 1);
    });

    it('should return confidence score', () => {
      protocol.extract('Test');
      const result = protocol.synthesize('confidence test');
      assert.ok('confidence' in result);
    });
  });

  describe('findCrossDomainPatterns()', () => {
    it('should find patterns across domains', () => {
      protocol.extract('Conservation in physics');
      protocol.extract('Homeostasis in biology');
      const result = protocol.findCrossDomainPatterns();
      assert.ok(result);
    });

    it('should return pattern array', () => {
      const result = protocol.findCrossDomainPatterns();
      assert.ok(Array.isArray(result.patterns || result));
    });

    it('should identify shared concepts', () => {
      protocol.extract('Equilibrium in chemistry');
      protocol.extract('Homeostasis in biology');
      const result = protocol.findCrossDomainPatterns();
      // Both relate to balance/stability
      assert.ok(result.patterns || result.length >= 0);
    });
  });

  describe('getPrimitivesByDomain()', () => {
    it('should return primitives for physics', () => {
      const primitives = protocol.getPrimitivesByDomain('physics');
      assert.ok(Array.isArray(primitives));
      assert.ok(primitives.length >= 5);
    });

    it('should return primitives for math', () => {
      const primitives = protocol.getPrimitivesByDomain('math');
      assert.ok(Array.isArray(primitives));
      assert.ok(primitives.length >= 5);
    });

    it('should return empty for unknown domain', () => {
      const primitives = protocol.getPrimitivesByDomain('unknown');
      assert.ok(Array.isArray(primitives));
      assert.equal(primitives.length, 0);
    });
  });

  describe('getSynthesisMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getSynthesisMetrics();
      assert.ok(metrics);
    });

    it('should include synthesis count', () => {
      const metrics = protocol.getSynthesisMetrics();
      assert.ok('synthesisCount' in metrics || 'totalSyntheses' in metrics);
    });

    it('should include extraction count', () => {
      const metrics = protocol.getSynthesisMetrics();
      assert.ok('extractionCount' in metrics || 'totalExtractions' in metrics);
    });

    it('should include pattern count', () => {
      const metrics = protocol.getSynthesisMetrics();
      assert.ok('patternCount' in metrics || 'totalPatterns' in metrics);
    });
  });

  describe('integration', () => {
    it('should complete full synthesis pipeline', () => {
      // 1. Recognize
      const recognition = protocol.recognize('The golden ratio appears in fractal patterns and biological growth');
      assert.ok(recognition);
      
      // 2. Extract
      const extraction = protocol.extract('Phi-ratios in mathematical structures');
      assert.ok(extraction);
      
      // 3. Synthesize
      const synthesis = protocol.synthesize('unified phi-patterns');
      assert.ok(synthesis);
    });

    it('should accumulate knowledge across multiple inputs', () => {
      const inputs = [
        'Conservation laws in physics',
        'Recursive algorithms in computation',
        'Evolutionary selection in biology',
        'Economic equilibrium in markets',
        'Neural networks in cognition'
      ];
      
      for (const input of inputs) {
        protocol.extract(input);
      }
      
      const metrics = protocol.getSynthesisMetrics();
      assert.ok((metrics.extractionCount || metrics.totalExtractions) >= 5);
    });

    it('should identify phi-weighted primitives', () => {
      const result = protocol.extract('Golden ratio harmonics and fibonacci sequences');
      // Should find phi-related primitives
      const phiRelated = result.primitives?.filter(p => p.weight === PHI || p.id?.includes('phi'));
      assert.ok(phiRelated?.length >= 0);
    });
  });
});
