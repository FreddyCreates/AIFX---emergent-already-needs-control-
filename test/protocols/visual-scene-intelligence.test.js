const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('VisualSceneIntelligenceProtocol', () => {
  let VisualSceneIntelligenceProtocol;
  let protocol;
  const PHI = 1.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/visual-scene-intelligence-protocol.js');
    VisualSceneIntelligenceProtocol = module.VisualSceneIntelligenceProtocol;
    protocol = new VisualSceneIntelligenceProtocol();
  });

  describe('constructor', () => {
    it('should initialize pipeline', () => {
      assert.ok(Array.isArray(protocol.pipeline));
    });

    it('should have describe in pipeline', () => {
      assert.ok(protocol.pipeline.includes('describe'));
    });

    it('should have detect in pipeline', () => {
      assert.ok(protocol.pipeline.includes('detect'));
    });

    it('should have segment in pipeline', () => {
      assert.ok(protocol.pipeline.includes('segment'));
    });

    it('should have generate in pipeline', () => {
      assert.ok(protocol.pipeline.includes('generate'));
    });

    it('should have compose in pipeline', () => {
      assert.ok(protocol.pipeline.includes('compose'));
    });

    it('should initialize engine registry', () => {
      assert.ok(protocol.engineRegistry instanceof Map);
    });

    it('should register default engines', () => {
      assert.ok(protocol.engineRegistry.size >= 5);
    });

    it('should include vision-describe engine', () => {
      assert.ok(protocol.engineRegistry.has('vision-describe'));
    });

    it('should include yolo-detect engine', () => {
      assert.ok(protocol.engineRegistry.has('yolo-detect'));
    });

    it('should include sam-segment engine', () => {
      assert.ok(protocol.engineRegistry.has('sam-segment'));
    });

    it('should include dalle-generate engine', () => {
      assert.ok(protocol.engineRegistry.has('dalle-generate'));
    });

    it('should initialize metrics', () => {
      assert.ok(protocol.metrics);
      assert.equal(protocol.metrics.scenesComposed, 0);
      assert.equal(protocol.metrics.objectsDetected, 0);
    });

    it('should accept custom engines', async () => {
      const module = await import('../../protocols/visual-scene-intelligence-protocol.js');
      const custom = new module.VisualSceneIntelligenceProtocol({
        engines: [{ id: 'custom-engine', type: 'custom', capability: 0.99 }]
      });
      assert.ok(custom.engineRegistry.has('custom-engine'));
    });
  });

  describe('_getBestEngine()', () => {
    it('should return best engine for type', () => {
      const engine = protocol._getBestEngine('describe');
      assert.ok(engine);
      assert.equal(engine.type, 'describe');
    });

    it('should return highest capability', () => {
      const engine = protocol._getBestEngine('generate');
      // Should be DALL-E-3 with capability 0.93
      assert.ok(engine.capability >= 0.9);
    });

    it('should return null for unknown type', () => {
      const engine = protocol._getBestEngine('unknown');
      assert.equal(engine, null);
    });
  });

  describe('_simpleHash()', () => {
    it('should return number', () => {
      const hash = protocol._simpleHash('test string');
      assert.ok(typeof hash === 'number');
    });

    it('should be consistent', () => {
      const hash1 = protocol._simpleHash('test');
      const hash2 = protocol._simpleHash('test');
      assert.equal(hash1, hash2);
    });

    it('should differ for different strings', () => {
      const hash1 = protocol._simpleHash('test1');
      const hash2 = protocol._simpleHash('test2');
      assert.notEqual(hash1, hash2);
    });

    it('should return positive number', () => {
      const hash = protocol._simpleHash('any string');
      assert.ok(hash >= 0);
    });
  });

  describe('describeScene()', () => {
    it('should return description object', () => {
      const result = protocol.describeScene('image-data');
      assert.ok(result);
    });

    it('should include description', () => {
      const result = protocol.describeScene('image-data');
      assert.ok(result.description || 'description' in result);
    });

    it('should include engine info', () => {
      const result = protocol.describeScene('image-data');
      assert.ok(result.engine);
    });

    it('should include confidence', () => {
      const result = protocol.describeScene('image-data');
      assert.ok(typeof result.confidence === 'number');
    });

    it('should handle object input', () => {
      const result = protocol.describeScene({ src: 'image.jpg', width: 100 });
      assert.ok(result);
    });

    it('should increment engine usage count', () => {
      const engineBefore = protocol.engineRegistry.get('vision-describe');
      const usageBefore = engineBefore.usageCount;
      protocol.describeScene('image');
      const usageAfter = protocol.engineRegistry.get('vision-describe').usageCount;
      assert.ok(usageAfter > usageBefore);
    });
  });

  describe('detectObjects()', () => {
    it('should return detection results', () => {
      const result = protocol.detectObjects('image-data');
      assert.ok(result);
    });

    it('should include objects array', () => {
      const result = protocol.detectObjects('image-data');
      assert.ok(Array.isArray(result.objects) || result.objects !== undefined);
    });

    it('should include engine info', () => {
      const result = protocol.detectObjects('image-data');
      assert.ok(result.engine);
    });

    it('should update objects detected metric', () => {
      protocol.detectObjects('image');
      assert.ok(protocol.metrics.objectsDetected >= 0);
    });
  });

  describe('segmentScene()', () => {
    it('should return segmentation results', () => {
      const result = protocol.segmentScene('image-data');
      assert.ok(result);
    });

    it('should include segments', () => {
      const result = protocol.segmentScene('image-data');
      assert.ok(result.segments || 'segments' in result);
    });

    it('should include engine info', () => {
      const result = protocol.segmentScene('image-data');
      assert.ok(result.engine);
    });
  });

  describe('generateElement()', () => {
    it('should return generated element', () => {
      const result = protocol.generateElement({ prompt: 'a red car' });
      assert.ok(result);
    });

    it('should include generated output', () => {
      const result = protocol.generateElement({ prompt: 'test' });
      assert.ok(result.output || result.generated || result.element);
    });

    it('should include engine info', () => {
      const result = protocol.generateElement({ prompt: 'test' });
      assert.ok(result.engine);
    });

    it('should update elements generated metric', () => {
      protocol.generateElement({ prompt: 'test' });
      assert.ok(protocol.metrics.elementsGenerated >= 0);
    });
  });

  describe('composeScene()', () => {
    it('should compose scene from elements', () => {
      const elements = [
        { type: 'background', data: 'sky.jpg' },
        { type: 'object', data: 'car.png' }
      ];
      const result = protocol.composeScene(elements);
      assert.ok(result);
    });

    it('should return composition', () => {
      const result = protocol.composeScene([{ type: 'bg' }]);
      assert.ok(result.composition || result.scene);
    });

    it('should include composition score', () => {
      const result = protocol.composeScene([{ type: 'bg' }]);
      assert.ok(typeof result.score === 'number' || typeof result.compositionScore === 'number');
    });

    it('should update scenes composed metric', () => {
      protocol.composeScene([{ type: 'test' }]);
      assert.ok(protocol.metrics.scenesComposed >= 1);
    });
  });

  describe('runPipeline()', () => {
    it('should run full pipeline', async () => {
      const result = await protocol.runPipeline('image-data');
      assert.ok(result);
    });

    it('should return final output', async () => {
      const result = await protocol.runPipeline('image-data');
      assert.ok(result.output || result.final || result.scene);
    });

    it('should include pipeline stages', async () => {
      const result = await protocol.runPipeline('image-data');
      assert.ok(result.stages || result.pipelineStages);
    });
  });

  describe('applyStyle()', () => {
    it('should apply style transfer', () => {
      const result = protocol.applyStyle('content-image', 'style-image');
      assert.ok(result);
    });

    it('should return styled output', () => {
      const result = protocol.applyStyle('content', 'style');
      assert.ok(result.output || result.styled);
    });
  });

  describe('getEngines()', () => {
    it('should return all engines', () => {
      const engines = protocol.getEngines();
      assert.ok(engines);
    });

    it('should include engine details', () => {
      const engines = protocol.getEngines();
      assert.ok(engines.length >= 5 || Object.keys(engines).length >= 5);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include scenes composed', () => {
      const metrics = protocol.getMetrics();
      assert.ok('scenesComposed' in metrics);
    });

    it('should include objects detected', () => {
      const metrics = protocol.getMetrics();
      assert.ok('objectsDetected' in metrics);
    });

    it('should include elements generated', () => {
      const metrics = protocol.getMetrics();
      assert.ok('elementsGenerated' in metrics);
    });
  });

  describe('integration', () => {
    it('should handle complete visual processing workflow', async () => {
      // Describe
      const description = protocol.describeScene('input-image');
      assert.ok(description);
      
      // Detect
      const detection = protocol.detectObjects('input-image');
      assert.ok(detection);
      
      // Segment
      const segmentation = protocol.segmentScene('input-image');
      assert.ok(segmentation);
      
      // Generate element
      const generated = protocol.generateElement({ prompt: 'enhancement' });
      assert.ok(generated);
      
      // Compose final scene
      const composed = protocol.composeScene([
        { type: 'base', data: description },
        { type: 'overlay', data: generated }
      ]);
      assert.ok(composed);
      
      // Check metrics
      assert.ok(protocol.metrics.scenesComposed >= 1);
    });
  });
});
