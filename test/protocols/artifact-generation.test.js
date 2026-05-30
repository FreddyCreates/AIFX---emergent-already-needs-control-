const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('ArtifactGenerationProtocol', () => {
  let ArtifactGenerationProtocol, ARTIFACT_TYPES;
  let protocol;
  const PHI = 1.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/artifact-generation-protocol.js');
    ArtifactGenerationProtocol = module.ArtifactGenerationProtocol;
    ARTIFACT_TYPES = module.ARTIFACT_TYPES;
    protocol = new ArtifactGenerationProtocol();
  });

  describe('ARTIFACT_TYPES constant', () => {
    it('should include code', () => {
      assert.ok(ARTIFACT_TYPES.includes('code'));
    });

    it('should include document', () => {
      assert.ok(ARTIFACT_TYPES.includes('document'));
    });

    it('should include analysis', () => {
      assert.ok(ARTIFACT_TYPES.includes('analysis'));
    });

    it('should include decision', () => {
      assert.ok(ARTIFACT_TYPES.includes('decision'));
    });

    it('should include model', () => {
      assert.ok(ARTIFACT_TYPES.includes('model'));
    });

    it('should include data', () => {
      assert.ok(ARTIFACT_TYPES.includes('data'));
    });

    it('should include config', () => {
      assert.ok(ARTIFACT_TYPES.includes('config'));
    });

    it('should have 7 artifact types', () => {
      assert.equal(ARTIFACT_TYPES.length, 7);
    });
  });

  describe('constructor', () => {
    it('should initialize empty artifacts map', () => {
      assert.ok(protocol.artifacts instanceof Map);
      assert.equal(protocol.artifacts.size, 0);
    });

    it('should initialize empty generators map', () => {
      assert.ok(protocol.generators instanceof Map);
      assert.equal(protocol.generators.size, 0);
    });

    it('should initialize empty validations array', () => {
      assert.ok(Array.isArray(protocol.validations));
      assert.equal(protocol.validations.length, 0);
    });

    it('should initialize total generated to 0', () => {
      assert.equal(protocol.totalGenerated, 0);
    });

    it('should initialize total validated to 0', () => {
      assert.equal(protocol.totalValidated, 0);
    });
  });

  describe('registerGenerator()', () => {
    it('should register generator and return id', () => {
      const id = protocol.registerGenerator('code-gen', {
        name: 'Code Generator',
        type: 'code'
      });
      assert.equal(id, 'code-gen');
    });

    it('should add generator to map', () => {
      protocol.registerGenerator('code-gen', { type: 'code' });
      assert.ok(protocol.generators.has('code-gen'));
    });

    it('should store name', () => {
      protocol.registerGenerator('code-gen', {
        name: 'Code Generator',
        type: 'code'
      });
      const gen = protocol.generators.get('code-gen');
      assert.equal(gen.name, 'Code Generator');
    });

    it('should default name to id', () => {
      protocol.registerGenerator('my-gen', { type: 'data' });
      const gen = protocol.generators.get('my-gen');
      assert.equal(gen.name, 'my-gen');
    });

    it('should store type', () => {
      protocol.registerGenerator('code-gen', { type: 'code' });
      const gen = protocol.generators.get('code-gen');
      assert.equal(gen.type, 'code');
    });

    it('should default type to data', () => {
      protocol.registerGenerator('my-gen', {});
      const gen = protocol.generators.get('my-gen');
      assert.equal(gen.type, 'data');
    });

    it('should store generate function', () => {
      const fn = () => 'generated';
      protocol.registerGenerator('gen', { generateFn: fn });
      const gen = protocol.generators.get('gen');
      assert.equal(gen.generateFn, fn);
    });

    it('should store validate function', () => {
      const fn = () => true;
      protocol.registerGenerator('gen', { validateFn: fn });
      const gen = protocol.generators.get('gen');
      assert.equal(gen.validateFn, fn);
    });

    it('should initialize empty transforms', () => {
      protocol.registerGenerator('gen', {});
      const gen = protocol.generators.get('gen');
      assert.ok(Array.isArray(gen.transforms));
      assert.equal(gen.transforms.length, 0);
    });

    it('should accept custom transforms', () => {
      const transforms = [x => x.toUpperCase()];
      protocol.registerGenerator('gen', { transforms });
      const gen = protocol.generators.get('gen');
      assert.equal(gen.transforms.length, 1);
    });

    it('should initialize generation count to 0', () => {
      protocol.registerGenerator('gen', {});
      const gen = protocol.generators.get('gen');
      assert.equal(gen.generationCount, 0);
    });
  });

  describe('generate()', () => {
    beforeEach(() => {
      protocol.registerGenerator('simple-gen', {
        type: 'data',
        generateFn: (input) => ({ processed: input.value * 2 })
      });
    });

    it('should generate artifact', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.ok(artifact);
      assert.ok(artifact.id);
    });

    it('should set artifact id', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.ok(artifact.id.startsWith('artifact-'));
    });

    it('should store generator id', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.equal(artifact.generatorId, 'simple-gen');
    });

    it('should store type from generator', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.equal(artifact.type, 'data');
    });

    it('should store generated content', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.deepEqual(artifact.content, { processed: 10 });
    });

    it('should store input', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.deepEqual(artifact.input, { value: 5 });
    });

    it('should set version to 1', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.equal(artifact.version, 1);
    });

    it('should set createdAt timestamp', async () => {
      const before = Date.now();
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      const after = Date.now();
      assert.ok(artifact.createdAt >= before);
      assert.ok(artifact.createdAt <= after);
    });

    it('should track generation time', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.ok(typeof artifact.generationTimeMs === 'number');
    });

    it('should set validated to false', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.equal(artifact.validated, false);
    });

    it('should calculate phi quality', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.ok(typeof artifact.phiQuality === 'number');
    });

    it('should add to artifacts map', async () => {
      const artifact = await protocol.generate('simple-gen', { value: 5 });
      assert.ok(protocol.artifacts.has(artifact.id));
    });

    it('should increment generator count', async () => {
      await protocol.generate('simple-gen', { value: 5 });
      const gen = protocol.generators.get('simple-gen');
      assert.equal(gen.generationCount, 1);
    });

    it('should increment total generated', async () => {
      await protocol.generate('simple-gen', { value: 5 });
      await protocol.generate('simple-gen', { value: 10 });
      assert.equal(protocol.totalGenerated, 2);
    });

    it('should throw for unknown generator', async () => {
      try {
        await protocol.generate('unknown', {});
        assert.fail('Should have thrown');
      } catch (e) {
        assert.ok(e.message.includes('Generator not found'));
      }
    });

    it('should apply transforms', async () => {
      protocol.registerGenerator('transform-gen', {
        type: 'data',
        generateFn: () => 'hello',
        transforms: [s => s.toUpperCase()]
      });
      const artifact = await protocol.generate('transform-gen', {});
      assert.equal(artifact.content, 'HELLO');
    });
  });

  describe('validate()', () => {
    let artifactId;

    beforeEach(async () => {
      protocol.registerGenerator('gen', {
        type: 'data',
        generateFn: () => ({ valid: true }),
        validateFn: (content) => content.valid ? 1.0 : 0.0
      });
      const artifact = await protocol.generate('gen', {});
      artifactId = artifact.id;
    });

    it('should validate artifact', async () => {
      const result = await protocol.validate(artifactId);
      assert.ok(result);
    });

    it('should set validated to true', async () => {
      await protocol.validate(artifactId);
      const artifact = protocol.artifacts.get(artifactId);
      assert.equal(artifact.validated, true);
    });

    it('should set validation score', async () => {
      await protocol.validate(artifactId);
      const artifact = protocol.artifacts.get(artifactId);
      assert.ok(typeof artifact.validationScore === 'number');
    });

    it('should increment total validated', async () => {
      await protocol.validate(artifactId);
      assert.equal(protocol.totalValidated, 1);
    });

    it('should add to validations array', async () => {
      await protocol.validate(artifactId);
      assert.ok(protocol.validations.length >= 1);
    });
  });

  describe('getArtifact()', () => {
    it('should return artifact by id', async () => {
      protocol.registerGenerator('gen', { generateFn: () => 'content' });
      const generated = await protocol.generate('gen', {});
      const artifact = protocol.getArtifact(generated.id);
      assert.ok(artifact);
      assert.equal(artifact.id, generated.id);
    });

    it('should return undefined for unknown id', () => {
      const artifact = protocol.getArtifact('unknown');
      assert.equal(artifact, undefined);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include total generated', async () => {
      protocol.registerGenerator('gen', { generateFn: () => 'x' });
      await protocol.generate('gen', {});
      const metrics = protocol.getMetrics();
      assert.ok(metrics.totalGenerated >= 1);
    });

    it('should include total validated', () => {
      const metrics = protocol.getMetrics();
      assert.ok('totalValidated' in metrics);
    });

    it('should include artifact count', async () => {
      protocol.registerGenerator('gen', { generateFn: () => 'x' });
      await protocol.generate('gen', {});
      const metrics = protocol.getMetrics();
      assert.ok(metrics.artifactCount >= 1 || metrics.totalGenerated >= 1);
    });
  });

  describe('integration', () => {
    it('should handle complete artifact lifecycle', async () => {
      // Register generator
      protocol.registerGenerator('doc-gen', {
        name: 'Document Generator',
        type: 'document',
        generateFn: (input) => ({
          title: input.title,
          body: `Generated content for ${input.title}`
        }),
        validateFn: (content) => content.title && content.body ? 1.0 : 0.0
      });
      
      // Generate artifact
      const artifact = await protocol.generate('doc-gen', { title: 'Test Doc' });
      assert.ok(artifact.id);
      assert.equal(artifact.type, 'document');
      
      // Validate artifact
      await protocol.validate(artifact.id);
      const validated = protocol.getArtifact(artifact.id);
      assert.ok(validated.validated);
      
      // Check metrics
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalGenerated, 1);
      assert.equal(metrics.totalValidated, 1);
    });
  });
});
