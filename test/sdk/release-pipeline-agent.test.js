'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  ReleasePipelineAgent,
  STAGES,
  STAGE_ORDER,
} = require('../../scripts/deploy-release-pipeline.js');

describe('Release Pipeline Agent', () => {

  describe('Module exports', () => {
    it('exports ReleasePipelineAgent class', () => {
      assert.ok(ReleasePipelineAgent);
      assert.equal(typeof ReleasePipelineAgent, 'function');
    });

    it('exports STAGES constants', () => {
      assert.ok(STAGES);
      assert.equal(STAGES.PREFLIGHT, 'preflight');
      assert.equal(STAGES.VALIDATE, 'validate');
      assert.equal(STAGES.BUILD, 'build');
      assert.equal(STAGES.PACKAGE, 'package');
      assert.equal(STAGES.CHANGELOG, 'changelog');
      assert.equal(STAGES.PUBLISH, 'publish');
      assert.equal(STAGES.NOTIFY, 'notify');
    });

    it('exports STAGE_ORDER with 7 stages', () => {
      assert.ok(Array.isArray(STAGE_ORDER));
      assert.equal(STAGE_ORDER.length, 7);
    });
  });

  describe('Agent construction', () => {
    it('creates agent with default options', () => {
      const agent = new ReleasePipelineAgent();
      assert.equal(agent.id, 'RELEASE-PIPELINE-AGENT');
      assert.equal(agent.version, '1.0.0');
      assert.equal(agent.options.dryRun, false);
      assert.equal(agent.options.stage, null);
      assert.equal(agent.state.status, 'idle');
    });

    it('creates agent with custom options', () => {
      const agent = new ReleasePipelineAgent({
        dryRun: true,
        stage: 'validate',
        verbose: true,
        skipTests: true,
        targetVersion: '2.0.0',
      });
      assert.equal(agent.options.dryRun, true);
      assert.equal(agent.options.stage, 'validate');
      assert.equal(agent.options.verbose, true);
      assert.equal(agent.options.skipTests, true);
      assert.equal(agent.options.targetVersion, '2.0.0');
    });

    it('initializes all stage states as pending', () => {
      const agent = new ReleasePipelineAgent();
      for (const stage of STAGE_ORDER) {
        assert.equal(agent.state.stages[stage].status, 'pending');
        assert.equal(agent.state.stages[stage].startedAt, null);
        assert.equal(agent.state.stages[stage].error, null);
      }
    });
  });

  describe('Pipeline execution (dry-run)', () => {
    it('runs full pipeline in dry-run mode', async () => {
      const agent = new ReleasePipelineAgent({ dryRun: true, skipTests: true });
      const report = await agent.deploy();

      assert.ok(report);
      assert.equal(report.agent, 'RELEASE-PIPELINE-AGENT');
      assert.ok(report.timing.startedAt);
      assert.ok(report.timing.completedAt);
      assert.ok(report.timing.durationMs >= 0);
    });

    it('runs a single stage in dry-run mode', async () => {
      const agent = new ReleasePipelineAgent({ dryRun: true, stage: 'preflight' });
      const report = await agent.deploy();

      assert.ok(report);
      assert.equal(report.stages[0].name, 'preflight');
      // Only preflight should be non-pending
      const completedStages = report.stages.filter(s => s.status === 'complete');
      assert.ok(completedStages.length >= 1);
    });

    it('reports errors for unknown stage', async () => {
      const agent = new ReleasePipelineAgent({ stage: 'nonexistent' });
      const report = await agent.deploy();

      assert.equal(report.status, 'failed');
      assert.ok(report.errors.length > 0);
    });
  });

  describe('Report generation', () => {
    it('generates a valid report structure', () => {
      const agent = new ReleasePipelineAgent();
      const report = agent.getReport();

      assert.ok(report.agent);
      assert.ok(report.version);
      assert.ok(report.status);
      assert.ok(report.options);
      assert.ok(report.environment);
      assert.ok(report.timing);
      assert.ok(report.stages);
      assert.ok(report.artifacts);
      assert.ok(report.errors);
      assert.ok(report.warnings);
      assert.ok(report.pipeline);
    });

    it('report includes pipeline metrics', () => {
      const agent = new ReleasePipelineAgent();
      const report = agent.getReport();

      assert.equal(report.pipeline.totalStages, 7);
      assert.equal(report.pipeline.completedStages, 0);
      assert.equal(report.pipeline.failedStages, 0);
    });
  });

  describe('Stage constants', () => {
    it('STAGE_ORDER matches STAGES values', () => {
      const stageValues = Object.values(STAGES);
      for (const stage of STAGE_ORDER) {
        assert.ok(stageValues.includes(stage), `${stage} should be in STAGES`);
      }
    });

    it('all stages in correct order', () => {
      assert.equal(STAGE_ORDER[0], 'preflight');
      assert.equal(STAGE_ORDER[1], 'validate');
      assert.equal(STAGE_ORDER[2], 'build');
      assert.equal(STAGE_ORDER[3], 'package');
      assert.equal(STAGE_ORDER[4], 'changelog');
      assert.equal(STAGE_ORDER[5], 'publish');
      assert.equal(STAGE_ORDER[6], 'notify');
    });
  });
});
