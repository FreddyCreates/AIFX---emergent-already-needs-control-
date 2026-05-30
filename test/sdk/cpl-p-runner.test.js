const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CplPRunner = require('../../sdk/governance/cpl-p-runner.js');

describe('CplPRunner', () => {
  let tmpDir;
  let tmpPipelineFile;

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `cpl-p-test-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    
    // Create a sample pipeline file
    const pipelineContent = `
id: "pipeline://test/example"

steps:
  - id: "step_one"
    use: "test.step_one"
    description: "First step"
    on_error: "continue"
  - id: "step_two"
    use: "test.step_two"
    description: "Second step"
    on_error: "stop"
  - id: "step_three"
    use: "test.step_three"
    description: "Third step"

branches:
  - id: "if_high_risk"
    when: 'context.risk_score > 0.7'
    then:
      type: "ESCALATE"
      target: "human://operator"
  - id: "if_low_priority"
    when: 'context.priority < 0.3'
    then:
      type: "SKIP"
      target: "notification"

bindings:
  "test.step_one": "step_one_handler"
  "test.step_two": "step_two_handler"
`;
    tmpPipelineFile = path.join(tmpDir, 'test-pipeline.cpl-p');
    fs.writeFileSync(tmpPipelineFile, pipelineContent);
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should initialize with null pipeline file', () => {
      const runner = new CplPRunner();
      assert.equal(runner._pipelineFile, null);
    });

    it('should accept pipeline file path', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      assert.equal(runner._pipelineFile, tmpPipelineFile);
    });

    it('should initialize empty functions map', () => {
      const runner = new CplPRunner();
      assert.equal(runner._functions.size, 0);
    });

    it('should initialize pipeline to null', () => {
      const runner = new CplPRunner();
      assert.equal(runner._pipeline, null);
    });
  });

  describe('_parsePipeline()', () => {
    it('should parse pipeline id', () => {
      const runner = new CplPRunner();
      const pipeline = runner._parsePipeline('id: "pipeline://test/example"');
      assert.equal(pipeline.id, 'pipeline://test/example');
    });

    it('should parse steps', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const content = fs.readFileSync(tmpPipelineFile, 'utf8');
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.steps.length, 3);
    });

    it('should parse step id and use', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const content = fs.readFileSync(tmpPipelineFile, 'utf8');
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.steps[0].id, 'step_one');
      assert.equal(pipeline.steps[0].use, 'test.step_one');
    });

    it('should parse step description', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const content = fs.readFileSync(tmpPipelineFile, 'utf8');
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.steps[0].description, 'First step');
    });

    it('should parse step on_error', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const content = fs.readFileSync(tmpPipelineFile, 'utf8');
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.steps[0].on_error, 'continue');
      assert.equal(pipeline.steps[1].on_error, 'stop');
    });

    it('should parse branches', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const content = fs.readFileSync(tmpPipelineFile, 'utf8');
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.branches.length, 2);
    });

    it('should parse branch when condition', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const content = fs.readFileSync(tmpPipelineFile, 'utf8');
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.branches[0].when, 'context.risk_score > 0.7');
    });

    it('should parse branch then action', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const content = fs.readFileSync(tmpPipelineFile, 'utf8');
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.branches[0].then.type, 'ESCALATE');
      assert.equal(pipeline.branches[0].then.target, 'human://operator');
    });

    it('should parse bindings', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const content = fs.readFileSync(tmpPipelineFile, 'utf8');
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.bindings['test.step_one'], 'step_one_handler');
    });

    it('should ignore comments', () => {
      const runner = new CplPRunner();
      const content = `
# This is a comment
id: "pipeline://test"
# Another comment
steps:
  - id: "step1"
    use: "test.step"
`;
      const pipeline = runner._parsePipeline(content);
      assert.equal(pipeline.id, 'pipeline://test');
      assert.equal(pipeline.steps.length, 1);
    });
  });

  describe('_load()', () => {
    it('should return default pipeline when no file specified', () => {
      const runner = new CplPRunner();
      const pipeline = runner._load();
      assert.equal(pipeline.id, 'pipeline://governance/default');
    });

    it('should return default pipeline when file does not exist', () => {
      const runner = new CplPRunner('/nonexistent/path.cpl-p');
      const pipeline = runner._load();
      assert.equal(pipeline.id, 'pipeline://governance/default');
    });

    it('should cache loaded pipeline', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const p1 = runner._load();
      const p2 = runner._load();
      assert.equal(p1, p2); // Same object reference
    });

    it('should parse pipeline from file', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const pipeline = runner._load();
      assert.equal(pipeline.id, 'pipeline://test/example');
    });
  });

  describe('bind()', () => {
    it('should add function to functions map', () => {
      const runner = new CplPRunner();
      const fn = () => {};
      runner.bind('test.func', fn);
      assert.equal(runner._functions.get('test.func'), fn);
    });

    it('should return this for chaining', () => {
      const runner = new CplPRunner();
      const result = runner.bind('test.func', () => {});
      assert.equal(result, runner);
    });

    it('should overwrite existing binding', () => {
      const runner = new CplPRunner();
      const fn1 = () => 1;
      const fn2 = () => 2;
      runner.bind('test.func', fn1);
      runner.bind('test.func', fn2);
      assert.equal(runner._functions.get('test.func'), fn2);
    });
  });

  describe('bindAll()', () => {
    it('should bind multiple functions', () => {
      const runner = new CplPRunner();
      runner.bindAll({
        'test.a': () => 'a',
        'test.b': () => 'b',
      });
      assert.equal(runner._functions.size, 2);
    });

    it('should return this for chaining', () => {
      const runner = new CplPRunner();
      const result = runner.bindAll({});
      assert.equal(result, runner);
    });
  });

  describe('_evalBranchCondition()', () => {
    it('should return false for null condition', () => {
      const runner = new CplPRunner();
      const result = runner._evalBranchCondition(null, {});
      assert.equal(result, false);
    });

    it('should evaluate simple boolean expression', () => {
      const runner = new CplPRunner();
      const result = runner._evalBranchCondition('context.value > 5', { value: 10 });
      assert.equal(result, true);
    });

    it('should return false for non-matching condition', () => {
      const runner = new CplPRunner();
      const result = runner._evalBranchCondition('context.value > 5', { value: 2 });
      assert.equal(result, false);
    });

    it('should handle property access', () => {
      const runner = new CplPRunner();
      const result = runner._evalBranchCondition('context.nested.value === "test"', { nested: { value: 'test' } });
      assert.equal(result, true);
    });

    it('should return false for invalid expressions', () => {
      const runner = new CplPRunner();
      const result = runner._evalBranchCondition('this is not valid {{ }}', {});
      assert.equal(result, false);
    });

    it('should return false for expressions that throw', () => {
      const runner = new CplPRunner();
      const result = runner._evalBranchCondition('context.undefined.property', {});
      assert.equal(result, false);
    });
  });

  describe('run()', () => {
    it('should execute bound steps', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      let executed = false;
      runner.bind('test.step_one', (ctx) => {
        executed = true;
        return { stepOneRan: true };
      });
      
      await runner.run();
      assert.equal(executed, true);
    });

    it('should pass context to steps', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      let receivedCtx = null;
      runner.bind('test.step_one', (ctx) => {
        receivedCtx = ctx;
        return {};
      });
      
      await runner.run({ initial: 'value' });
      assert.equal(receivedCtx.initial, 'value');
    });

    it('should accumulate context from steps', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      runner.bind('test.step_one', () => ({ fromOne: 1 }));
      runner.bind('test.step_two', () => ({ fromTwo: 2 }));
      
      const result = await runner.run();
      assert.equal(result.context.fromOne, 1);
      assert.equal(result.context.fromTwo, 2);
    });

    it('should record steps_run', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      runner.bind('test.step_one', () => ({}));
      runner.bind('test.step_two', () => ({}));
      
      const result = await runner.run();
      assert.ok(result.context.steps_run.includes('step_one'));
      assert.ok(result.context.steps_run.includes('step_two'));
    });

    it('should return audit trail', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      runner.bind('test.step_one', () => ({}));
      
      const result = await runner.run();
      assert.ok(Array.isArray(result.audit));
      assert.ok(result.audit.some(a => a.id === 'step_one'));
    });

    it('should include pipeline_id in result', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const result = await runner.run();
      assert.equal(result.pipeline_id, 'pipeline://test/example');
    });

    it('should evaluate branch conditions', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const result = await runner.run({ risk_score: 0.9 });
      assert.ok(result.context.branches_triggered.includes('if_high_risk'));
    });

    it('should not trigger branch when condition is false', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const result = await runner.run({ risk_score: 0.3 });
      assert.equal(result.context.branches_triggered.includes('if_high_risk'), false);
    });

    it('should handle step errors with on_error: continue', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      runner.bind('test.step_one', () => { throw new Error('Test error'); });
      runner.bind('test.step_two', () => ({ stepTwoRan: true }));
      
      const result = await runner.run();
      assert.ok(result.context.errors.some(e => e.step === 'step_one'));
      assert.equal(result.context.stepTwoRan, true);
    });

    it('should stop on error with on_error: stop', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      runner.bind('test.step_one', () => ({}));
      runner.bind('test.step_two', () => { throw new Error('Stop here'); });
      runner.bind('test.step_three', () => ({ stepThreeRan: true }));
      
      const result = await runner.run();
      assert.ok(result.context.errors.some(e => e.step === 'step_two'));
      assert.equal(result.context.stepThreeRan, undefined);
    });

    it('should handle steps without binding', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      // Don't bind any functions
      const result = await runner.run();
      assert.ok(result.audit.some(a => a.status === 'no_binding'));
    });

    it('should handle async step functions', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      runner.bind('test.step_one', async () => {
        await new Promise(r => setTimeout(r, 10));
        return { asyncValue: 42 };
      });
      
      const result = await runner.run();
      assert.equal(result.context.asyncValue, 42);
    });

    it('should record execution time in audit', async () => {
      const runner = new CplPRunner(tmpPipelineFile);
      runner.bind('test.step_one', async () => {
        await new Promise(r => setTimeout(r, 50));
        return {};
      });
      
      const result = await runner.run();
      const stepAudit = result.audit.find(a => a.id === 'step_one' && a.status === 'ok');
      assert.ok(stepAudit.ms >= 50);
    });
  });

  describe('metadata()', () => {
    it('should return pipeline id', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const meta = runner.metadata();
      assert.equal(meta.id, 'pipeline://test/example');
    });

    it('should return step ids', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const meta = runner.metadata();
      assert.deepEqual(meta.steps, ['step_one', 'step_two', 'step_three']);
    });

    it('should return branch ids', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const meta = runner.metadata();
      assert.deepEqual(meta.branches, ['if_high_risk', 'if_low_priority']);
    });

    it('should return binding keys', () => {
      const runner = new CplPRunner(tmpPipelineFile);
      const meta = runner.metadata();
      assert.ok(meta.bindings.includes('test.step_one'));
    });
  });

  describe('CplPRunner.forDomain()', () => {
    it('should create runner for specified domain', () => {
      const runner = CplPRunner.forDomain('bot', tmpDir);
      assert.ok(runner instanceof CplPRunner);
    });

    it('should fall back to default when domain file not found', () => {
      const runner = CplPRunner.forDomain('nonexistent', tmpDir);
      assert.ok(runner instanceof CplPRunner);
    });
  });

  describe('CplPRunner.loadAll()', () => {
    it('should return Map of runners', () => {
      // Create some test pipeline files
      fs.writeFileSync(path.join(tmpDir, 'test-cycle.cpl-p'), 'id: "test"');
      fs.writeFileSync(path.join(tmpDir, 'other-cycle.cpl-p'), 'id: "other"');
      
      const runners = CplPRunner.loadAll(tmpDir);
      assert.ok(runners instanceof Map);
      assert.ok(runners.size >= 2);
    });

    it('should return empty Map for non-existent directory', () => {
      const runners = CplPRunner.loadAll('/nonexistent/dir');
      assert.equal(runners.size, 0);
    });

    it('should only load .cpl-p files', () => {
      fs.writeFileSync(path.join(tmpDir, 'test.txt'), 'not a pipeline');
      fs.writeFileSync(path.join(tmpDir, 'test-cycle.cpl-p'), 'id: "test"');
      
      const runners = CplPRunner.loadAll(tmpDir);
      assert.ok(!Array.from(runners.keys()).some(k => k.includes('txt')));
    });
  });
});
