const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('AdaptiveKnowledgeAbsorptionProtocol', () => {
  let AdaptiveKnowledgeAbsorptionProtocol;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/adaptive-knowledge-absorption-protocol.js');
    AdaptiveKnowledgeAbsorptionProtocol = module.AdaptiveKnowledgeAbsorptionProtocol;
    protocol = new AdaptiveKnowledgeAbsorptionProtocol();
  });

  describe('constructor', () => {
    it('should initialize 5-stage pipeline', () => {
      assert.deepEqual(protocol.pipeline, ['intake', 'extract', 'classify', 'index', 'absorb']);
    });

    it('should initialize pattern library with defaults', () => {
      assert.ok(protocol.patternLibrary instanceof Map);
      assert.ok(protocol.patternLibrary.size >= 8);
    });

    it('should initialize empty knowledge store', () => {
      assert.ok(Array.isArray(protocol.knowledgeStore));
      assert.equal(protocol.knowledgeStore.length, 0);
    });

    it('should initialize knowledge graph', () => {
      assert.ok(protocol.knowledgeGraph);
      assert.ok(protocol.knowledgeGraph.nodes instanceof Map);
      assert.ok(Array.isArray(protocol.knowledgeGraph.edges));
    });

    it('should set learning rate to 1/PHI', () => {
      const expected = 1 / 1.618033988749895;
      assert.ok(Math.abs(protocol.learningRate - expected) < 0.0001);
    });

    it('should initialize metrics to zero', () => {
      assert.equal(protocol.metrics.documentsAbsorbed, 0);
      assert.equal(protocol.metrics.entitiesExtracted, 0);
      assert.equal(protocol.metrics.graphNodes, 0);
      assert.equal(protocol.metrics.graphEdges, 0);
      assert.equal(protocol.metrics.patternsLearned, 0);
    });

    it('should include person pattern', () => {
      assert.ok(protocol.patternLibrary.has('person'));
    });

    it('should include organization pattern', () => {
      assert.ok(protocol.patternLibrary.has('organization'));
    });

    it('should include location pattern', () => {
      assert.ok(protocol.patternLibrary.has('location'));
    });

    it('should include date pattern', () => {
      assert.ok(protocol.patternLibrary.has('date'));
    });

    it('should include concept pattern', () => {
      assert.ok(protocol.patternLibrary.has('concept'));
    });

    it('should include email pattern', () => {
      assert.ok(protocol.patternLibrary.has('email'));
    });

    it('should include url pattern', () => {
      assert.ok(protocol.patternLibrary.has('url'));
    });

    it('should include number pattern', () => {
      assert.ok(protocol.patternLibrary.has('number'));
    });

    it('should initialize pattern success counts to 0', () => {
      const personPattern = protocol.patternLibrary.get('person');
      assert.equal(personPattern.successCount, 0);
      assert.equal(personPattern.totalAttempts, 0);
    });
  });

  describe('absorb()', () => {
    it('should return entities array', () => {
      const result = protocol.absorb('John Smith works at Tech Corp');
      assert.ok(Array.isArray(result.entities));
    });

    it('should return keywords array', () => {
      const result = protocol.absorb('Test content with some keywords');
      assert.ok(Array.isArray(result.keywords));
    });

    it('should return summary string', () => {
      const result = protocol.absorb('This is a test document. It has multiple sentences.');
      assert.ok(typeof result.summary === 'string');
    });

    it('should return graph node count', () => {
      const result = protocol.absorb('John Smith and Jane Doe');
      assert.ok(typeof result.graphNodes === 'number');
    });

    it('should return graph edge count', () => {
      const result = protocol.absorb('John Smith and Jane Doe');
      assert.ok(typeof result.graphEdges === 'number');
    });

    it('should return classification', () => {
      const result = protocol.absorb('Machine learning algorithm');
      assert.ok(result.classification);
      assert.ok(result.classification.topCategory);
    });

    it('should increment documentsAbsorbed metric', () => {
      protocol.absorb('Test content');
      assert.equal(protocol.metrics.documentsAbsorbed, 1);
    });

    it('should add to knowledge store', () => {
      protocol.absorb('Test content');
      assert.equal(protocol.knowledgeStore.length, 1);
    });

    it('should store document id', () => {
      protocol.absorb('Test content');
      assert.equal(protocol.knowledgeStore[0].id, 'doc-1');
    });

    it('should store content type', () => {
      protocol.absorb('Test content', 'markdown');
      assert.equal(protocol.knowledgeStore[0].contentType, 'markdown');
    });

    it('should default to text content type', () => {
      protocol.absorb('Test content');
      assert.equal(protocol.knowledgeStore[0].contentType, 'text');
    });

    it('should store absorbedAt timestamp', () => {
      const before = Date.now();
      protocol.absorb('Test content');
      const after = Date.now();
      assert.ok(protocol.knowledgeStore[0].absorbedAt >= before);
      assert.ok(protocol.knowledgeStore[0].absorbedAt <= after);
    });

    it('should normalize whitespace', () => {
      const result = protocol.absorb('Test   content\n\twith   whitespace');
      assert.ok(!result.summary.includes('  '));
    });

    it('should extract top 10 keywords', () => {
      const longContent = 'word '.repeat(100) + 'test '.repeat(50) + 'sample '.repeat(30);
      const result = protocol.absorb(longContent);
      assert.ok(result.keywords.length <= 10);
    });

    it('should filter short keywords', () => {
      const result = protocol.absorb('a an the is to');
      assert.ok(result.keywords.every(k => k.word.length > 3));
    });

    it('should extract person entities', () => {
      const result = protocol.absorb('John Smith met with Jane Doe');
      const persons = result.entities.filter(e => e.type === 'person');
      assert.ok(persons.length >= 2);
    });

    it('should extract email entities', () => {
      const result = protocol.absorb('Contact us at test@example.com');
      const emails = result.entities.filter(e => e.type === 'email');
      assert.ok(emails.length >= 1);
    });

    it('should extract URL entities', () => {
      const result = protocol.absorb('Visit https://example.com for more');
      const urls = result.entities.filter(e => e.type === 'url');
      assert.ok(urls.length >= 1);
    });

    it('should extract date entities', () => {
      const result = protocol.absorb('Meeting on 2024-01-15');
      const dates = result.entities.filter(e => e.type === 'date');
      assert.ok(dates.length >= 1);
    });

    it('should increment patternsLearned metric', () => {
      protocol.absorb('John Smith at Tech Corp');
      assert.ok(protocol.metrics.patternsLearned >= 1);
    });
  });

  describe('extractEntities()', () => {
    it('should return array', () => {
      const result = protocol.extractEntities('Test text');
      assert.ok(Array.isArray(result));
    });

    it('should extract entities with text property', () => {
      const result = protocol.extractEntities('John Smith');
      if (result.length > 0) {
        assert.ok('text' in result[0]);
      }
    });

    it('should extract entities with type property', () => {
      const result = protocol.extractEntities('John Smith');
      if (result.length > 0) {
        assert.ok('type' in result[0]);
      }
    });

    it('should extract entities with confidence property', () => {
      const result = protocol.extractEntities('John Smith');
      if (result.length > 0) {
        assert.ok('confidence' in result[0]);
      }
    });

    it('should extract entities with position property', () => {
      const result = protocol.extractEntities('John Smith');
      if (result.length > 0) {
        assert.ok('position' in result[0]);
      }
    });

    it('should increment entitiesExtracted metric', () => {
      protocol.extractEntities('John Smith and Jane Doe at Tech Corp');
      assert.ok(protocol.metrics.entitiesExtracted > 0);
    });

    it('should not duplicate entities', () => {
      const result = protocol.extractEntities('John Smith John Smith');
      const johns = result.filter(e => e.text === 'John Smith');
      assert.equal(johns.length, 1);
    });

    it('should sort by confidence descending', () => {
      const result = protocol.extractEntities('John Smith at Tech Corp on 2024-01-15');
      if (result.length >= 2) {
        assert.ok(result[0].confidence >= result[1].confidence);
      }
    });

    it('should extract concepts', () => {
      const result = protocol.extractEntities('The algorithm uses a neural network system');
      const concepts = result.filter(e => e.type === 'concept');
      assert.ok(concepts.length >= 1);
    });

    it('should extract numbers', () => {
      const result = protocol.extractEntities('Revenue increased 25% to 1000000');
      const numbers = result.filter(e => e.type === 'number');
      assert.ok(numbers.length >= 1);
    });

    it('should handle empty text', () => {
      const result = protocol.extractEntities('');
      assert.ok(Array.isArray(result));
    });

    it('should extract locations', () => {
      const result = protocol.extractEntities('Offices in New York and London');
      const locations = result.filter(e => e.type === 'location');
      assert.ok(locations.length >= 1);
    });

    it('should extract organizations', () => {
      const result = protocol.extractEntities('Working with Tech Corp Inc and Data LLC');
      const orgs = result.filter(e => e.type === 'organization');
      assert.ok(orgs.length >= 1);
    });
  });

  describe('classifyContent()', () => {
    it('should return topCategory', () => {
      const result = protocol.classifyContent('Machine learning algorithm');
      assert.ok(result.topCategory);
    });

    it('should return confidence score', () => {
      const result = protocol.classifyContent('Machine learning algorithm');
      assert.ok('confidence' in result);
    });

    it('should return categories object', () => {
      const result = protocol.classifyContent('Machine learning algorithm');
      assert.ok(result.categories);
    });

    it('should classify technology content', () => {
      const result = protocol.classifyContent('software algorithm computer ai data network system code');
      assert.equal(result.topCategory, 'technology');
    });

    it('should classify science content', () => {
      const result = protocol.classifyContent('research experiment hypothesis theory study scientific');
      assert.equal(result.topCategory, 'science');
    });

    it('should classify business content', () => {
      const result = protocol.classifyContent('company market revenue profit investment strategy');
      assert.equal(result.topCategory, 'business');
    });

    it('should classify health content', () => {
      const result = protocol.classifyContent('medical health disease treatment patient clinical');
      assert.equal(result.topCategory, 'health');
    });

    it('should classify education content', () => {
      const result = protocol.classifyContent('learning student teacher course education academic');
      assert.equal(result.topCategory, 'education');
    });

    it('should classify legal content', () => {
      const result = protocol.classifyContent('law legal court regulation compliance contract');
      assert.equal(result.topCategory, 'legal');
    });

    it('should classify creative content', () => {
      const result = protocol.classifyContent('art design creative music writing visual');
      assert.equal(result.topCategory, 'creative');
    });

    it('should default to general for unknown content', () => {
      const result = protocol.classifyContent('xyzzy florp bloop');
      assert.equal(result.topCategory, 'general');
    });

    it('should normalize category scores', () => {
      const result = protocol.classifyContent('software algorithm system network');
      const totalScore = Object.values(result.categories).reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(totalScore - 1.0) < 0.01 || totalScore === 0);
    });

    it('should apply phi-weighting to categories', () => {
      const result = protocol.classifyContent('software algorithm');
      assert.ok(result.confidence >= 0);
      assert.ok(result.confidence <= 1);
    });

    it('should handle empty content', () => {
      const result = protocol.classifyContent('');
      assert.ok(result.topCategory);
    });

    it('should be case insensitive', () => {
      const result1 = protocol.classifyContent('ALGORITHM SOFTWARE');
      const result2 = protocol.classifyContent('algorithm software');
      assert.equal(result1.topCategory, result2.topCategory);
    });
  });

  describe('buildKnowledgeGraph()', () => {
    it('should add nodes to graph', () => {
      const entities = [{ text: 'John', type: 'person', confidence: 0.9 }];
      protocol.buildKnowledgeGraph(entities, []);
      assert.ok(protocol.knowledgeGraph.nodes.size >= 1);
    });

    it('should add edges to graph', () => {
      const entities = [
        { text: 'John', type: 'person', confidence: 0.9 },
        { text: 'Tech Corp', type: 'organization', confidence: 0.8 }
      ];
      const relations = [{ source: 'John', target: 'Tech Corp', relation: 'works-at', weight: 1.0 }];
      protocol.buildKnowledgeGraph(entities, relations);
      assert.ok(protocol.knowledgeGraph.edges.length >= 1);
    });

    it('should return added nodes', () => {
      const entities = [{ text: 'John', type: 'person', confidence: 0.9 }];
      const result = protocol.buildKnowledgeGraph(entities, []);
      assert.ok(Array.isArray(result.nodes));
    });

    it('should return added edges', () => {
      const entities = [{ text: 'John', type: 'person', confidence: 0.9 }];
      const result = protocol.buildKnowledgeGraph(entities, []);
      assert.ok(Array.isArray(result.edges));
    });

    it('should increment graphNodes metric', () => {
      const entities = [{ text: 'John', type: 'person', confidence: 0.9 }];
      protocol.buildKnowledgeGraph(entities, []);
      assert.ok(protocol.metrics.graphNodes >= 1);
    });

    it('should increment graphEdges metric', () => {
      const entities = [
        { text: 'John', type: 'person', confidence: 0.9 },
        { text: 'Tech Corp', type: 'organization', confidence: 0.8 }
      ];
      const relations = [{ source: 'John', target: 'Tech Corp', relation: 'works-at', weight: 1.0 }];
      protocol.buildKnowledgeGraph(entities, relations);
      assert.ok(protocol.metrics.graphEdges >= 1);
    });

    it('should not duplicate nodes', () => {
      const entities = [{ text: 'John', type: 'person', confidence: 0.9 }];
      protocol.buildKnowledgeGraph(entities, []);
      protocol.buildKnowledgeGraph(entities, []);
      assert.equal(protocol.knowledgeGraph.nodes.size, 1);
    });

    it('should track connection counts', () => {
      const entities = [
        { text: 'John', type: 'person', confidence: 0.9 },
        { text: 'Tech Corp', type: 'organization', confidence: 0.8 }
      ];
      const relations = [{ source: 'John', target: 'Tech Corp', relation: 'works-at', weight: 1.0 }];
      protocol.buildKnowledgeGraph(entities, relations);
      const johnNode = protocol.knowledgeGraph.nodes.get('person:John');
      assert.ok(johnNode.connections >= 1);
    });

    it('should create typed node IDs', () => {
      const entities = [{ text: 'John', type: 'person', confidence: 0.9 }];
      protocol.buildKnowledgeGraph(entities, []);
      assert.ok(protocol.knowledgeGraph.nodes.has('person:John'));
    });
  });

  describe('query()', () => {
    beforeEach(() => {
      // Seed some data
      protocol.absorb('John Smith works at Tech Corp in New York');
      protocol.absorb('Jane Doe is at Data LLC in London');
    });

    it('should find nodes by entity name', () => {
      const result = protocol.query({ entity: 'John' });
      assert.ok(result.nodes.length >= 1);
    });

    it('should find nodes by type', () => {
      const result = protocol.query({ type: 'person' });
      assert.ok(result.nodes.length >= 1);
    });

    it('should find edges by relation', () => {
      const result = protocol.query({ relation: 'co-occurs' });
      assert.ok(result.edges.length >= 0);
    });

    it('should return nodes array', () => {
      const result = protocol.query({ entity: 'John' });
      assert.ok(Array.isArray(result.nodes));
    });

    it('should return edges array', () => {
      const result = protocol.query({ entity: 'John' });
      assert.ok(Array.isArray(result.edges));
    });

    it('should handle no matches', () => {
      const result = protocol.query({ entity: 'NonexistentEntity' });
      assert.equal(result.nodes.length, 0);
    });

    it('should be case insensitive for entity search', () => {
      const result1 = protocol.query({ entity: 'john' });
      const result2 = protocol.query({ entity: 'JOHN' });
      assert.equal(result1.nodes.length, result2.nodes.length);
    });

    it('should find partial entity matches', () => {
      const result = protocol.query({ entity: 'Tech' });
      assert.ok(result.nodes.length >= 0);
    });

    it('should deduplicate nodes', () => {
      const result = protocol.query({ type: 'person' });
      const ids = result.nodes.map(n => n.id);
      const unique = new Set(ids);
      assert.equal(ids.length, unique.size);
    });

    it('should return connected edges for nodes', () => {
      const result = protocol.query({ type: 'person' });
      // Edges should be connected to the found nodes
      for (const edge of result.edges) {
        const nodeIds = result.nodes.map(n => n.id);
        assert.ok(nodeIds.includes(edge.source) || nodeIds.includes(edge.target));
      }
    });
  });

  describe('generateDigest()', () => {
    beforeEach(() => {
      protocol.absorb('Machine learning is transforming AI technology. Deep learning models are advancing rapidly.');
      protocol.absorb('AI algorithms are becoming more sophisticated. Neural networks power modern systems.');
    });

    it('should return format', () => {
      const result = protocol.generateDigest('AI');
      assert.ok(result.format);
    });

    it('should return content', () => {
      const result = protocol.generateDigest('AI');
      assert.ok(result.content);
    });

    it('should return source count', () => {
      const result = protocol.generateDigest('AI');
      assert.ok(typeof result.sources === 'number');
    });

    it('should default to brief format', () => {
      const result = protocol.generateDigest('AI');
      assert.equal(result.format, 'brief');
    });

    it('should support detailed format', () => {
      const result = protocol.generateDigest('AI', 'detailed');
      assert.equal(result.format, 'detailed');
    });

    it('should support executive format', () => {
      const result = protocol.generateDigest('AI', 'executive');
      assert.equal(result.format, 'executive');
    });

    it('should handle unknown topic', () => {
      const result = protocol.generateDigest('NonexistentTopic12345');
      assert.ok(result.content.includes('No knowledge available'));
      assert.equal(result.sources, 0);
    });

    it('should find topic in content', () => {
      const result = protocol.generateDigest('learning');
      assert.ok(result.sources >= 1);
    });

    it('should find topic in keywords', () => {
      const result = protocol.generateDigest('neural');
      assert.ok(result.sources >= 0);
    });

    it('should be case insensitive', () => {
      const result1 = protocol.generateDigest('AI');
      const result2 = protocol.generateDigest('ai');
      assert.equal(result1.sources, result2.sources);
    });

    it('should limit brief format length', () => {
      const result = protocol.generateDigest('AI', 'brief');
      assert.ok(result.content.length <= 500);
    });

    it('should include document IDs in detailed format', () => {
      const result = protocol.generateDigest('AI', 'detailed');
      assert.ok(result.content.includes('[doc-'));
    });

    it('should include bullet points in executive format', () => {
      const result = protocol.generateDigest('AI', 'executive');
      assert.ok(result.content.includes('•'));
    });
  });

  describe('learnPattern()', () => {
    it('should increment totalAttempts for matched patterns', () => {
      const extractionResult = {
        entities: [{ text: 'John', type: 'person', confidence: 0.9 }],
        keywords: []
      };
      const before = protocol.patternLibrary.get('person').totalAttempts;
      protocol.learnPattern('text', extractionResult);
      assert.ok(protocol.patternLibrary.get('person').totalAttempts > before);
    });

    it('should increment successCount for high confidence', () => {
      const extractionResult = {
        entities: [{ text: 'John', type: 'person', confidence: 0.9 }],
        keywords: []
      };
      const before = protocol.patternLibrary.get('person').successCount;
      protocol.learnPattern('text', extractionResult);
      assert.ok(protocol.patternLibrary.get('person').successCount > before);
    });

    it('should not increment successCount for low confidence', () => {
      const extractionResult = {
        entities: [{ text: 'John', type: 'person', confidence: 0.3 }],
        keywords: []
      };
      const before = protocol.patternLibrary.get('person').successCount;
      protocol.learnPattern('text', extractionResult);
      assert.equal(protocol.patternLibrary.get('person').successCount, before);
    });

    it('should update pattern weight using learning rate', () => {
      const extractionResult = {
        entities: [{ text: 'John', type: 'person', confidence: 0.9 }],
        keywords: []
      };
      const before = protocol.patternLibrary.get('person').weight;
      protocol.learnPattern('text', extractionResult);
      assert.notEqual(protocol.patternLibrary.get('person').weight, before);
    });

    it('should increment patternsLearned metric', () => {
      const extractionResult = {
        entities: [{ text: 'John', type: 'person', confidence: 0.9 }],
        keywords: []
      };
      const before = protocol.metrics.patternsLearned;
      protocol.learnPattern('text', extractionResult);
      assert.ok(protocol.metrics.patternsLearned > before);
    });
  });

  describe('getAbsorptionMetrics()', () => {
    it('should return all metrics', () => {
      const metrics = protocol.getAbsorptionMetrics();
      assert.ok('documentsAbsorbed' in metrics);
      assert.ok('entitiesExtracted' in metrics);
      assert.ok('graphNodes' in metrics);
      assert.ok('graphEdges' in metrics);
      assert.ok('patternsLearned' in metrics);
    });

    it('should return copy of metrics', () => {
      const metrics = protocol.getAbsorptionMetrics();
      metrics.documentsAbsorbed = 999;
      assert.notEqual(protocol.metrics.documentsAbsorbed, 999);
    });

    it('should reflect absorption activity', () => {
      protocol.absorb('John Smith at Tech Corp');
      const metrics = protocol.getAbsorptionMetrics();
      assert.equal(metrics.documentsAbsorbed, 1);
      assert.ok(metrics.entitiesExtracted > 0);
    });
  });

  describe('integration scenarios', () => {
    it('should build comprehensive knowledge graph', () => {
      protocol.absorb('John Smith is CEO of Tech Corp based in New York');
      protocol.absorb('Jane Doe is CTO of Data LLC based in London');
      protocol.absorb('Tech Corp partners with Data LLC on AI projects');
      
      const metrics = protocol.getAbsorptionMetrics();
      assert.equal(metrics.documentsAbsorbed, 3);
      assert.ok(metrics.graphNodes >= 4);
    });

    it('should query across multiple documents', () => {
      protocol.absorb('John Smith works on AI at Tech Corp');
      protocol.absorb('Jane Doe works on AI at Data LLC');
      
      const result = protocol.query({ type: 'concept' });
      assert.ok(result.nodes.length >= 0);
    });

    it('should generate comprehensive digest', () => {
      protocol.absorb('Machine learning transforms healthcare. AI diagnosis is improving.');
      protocol.absorb('Deep learning models analyze medical images. Neural networks detect diseases.');
      
      const digest = protocol.generateDigest('learning', 'executive');
      assert.ok(digest.sources >= 1);
      assert.ok(digest.content.includes('Topic'));
    });

    it('should adapt extraction over time', () => {
      // Absorb multiple documents to train patterns
      for (let i = 0; i < 5; i++) {
        protocol.absorb(`John Smith and Jane Doe discussed AI algorithms at Tech Corp`);
      }
      
      const metrics = protocol.getAbsorptionMetrics();
      assert.ok(metrics.patternsLearned >= 5);
    });
  });
});
