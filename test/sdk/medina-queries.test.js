const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('Medina Queries SDK', () => {
  let sdk;

  beforeEach(async () => {
    sdk = await import('../../sdk/medina-queries/src/index.js');
  });

  describe('Civitas Query exports', () => {
    it('should export queryCivitasStatus', () => {
      assert.ok(sdk.queryCivitasStatus);
    });

    it('should export queryCivitasHealth', () => {
      assert.ok(sdk.queryCivitasHealth);
    });

    it('should export queryAllAgentStatuses', () => {
      assert.ok(sdk.queryAllAgentStatuses);
    });

    it('should export queryAgentStatus', () => {
      assert.ok(sdk.queryAgentStatus);
    });

    it('should export queryAgentRegisters', () => {
      assert.ok(sdk.queryAgentRegisters);
    });

    it('should export queryMemories', () => {
      assert.ok(sdk.queryMemories);
    });

    it('should export queryMemory', () => {
      assert.ok(sdk.queryMemory);
    });

    it('should export queryMemoryAssociations', () => {
      assert.ok(sdk.queryMemoryAssociations);
    });

    it('should export queryConsolidationStatus', () => {
      assert.ok(sdk.queryConsolidationStatus);
    });

    it('should export queryActiveGoals', () => {
      assert.ok(sdk.queryActiveGoals);
    });

    it('should export queryGoalProgress', () => {
      assert.ok(sdk.queryGoalProgress);
    });

    it('should export queryGoalHistory', () => {
      assert.ok(sdk.queryGoalHistory);
    });

    it('should export queryArtifacts', () => {
      assert.ok(sdk.queryArtifacts);
    });

    it('should export queryArtifact', () => {
      assert.ok(sdk.queryArtifact);
    });

    it('should export queryArtifactLineage', () => {
      assert.ok(sdk.queryArtifactLineage);
    });

    it('should export queryCivitasSynapses', () => {
      assert.ok(sdk.queryCivitasSynapses);
    });

    it('should export querySynapseBetween', () => {
      assert.ok(sdk.querySynapseBetween);
    });

    it('should export queryCollectiveCoherence', () => {
      assert.ok(sdk.queryCollectiveCoherence);
    });

    it('should export queryEmergenceState', () => {
      assert.ok(sdk.queryEmergenceState);
    });

    it('should export queryLearningMetrics', () => {
      assert.ok(sdk.queryLearningMetrics);
    });

    it('should export queryRewardHistory', () => {
      assert.ok(sdk.queryRewardHistory);
    });
  });

  describe('Organism Query exports', () => {
    it('should export queryCanisterStatus', () => {
      assert.ok(sdk.queryCanisterStatus);
    });

    it('should export queryCanisterCycles', () => {
      assert.ok(sdk.queryCanisterCycles);
    });

    it('should export queryCanisterMemory', () => {
      assert.ok(sdk.queryCanisterMemory);
    });

    it('should export queryOrganismState', () => {
      assert.ok(sdk.queryOrganismState);
    });

    it('should export queryHeartbeatStatus', () => {
      assert.ok(sdk.queryHeartbeatStatus);
    });

    it('should export queryGovernanceSnapshot', () => {
      assert.ok(sdk.queryGovernanceSnapshot);
    });

    it('should export queryCitizen', () => {
      assert.ok(sdk.queryCitizen);
    });

    it('should export queryAllCitizens', () => {
      assert.ok(sdk.queryAllCitizens);
    });

    it('should export queryProposals', () => {
      assert.ok(sdk.queryProposals);
    });

    it('should export queryProposal', () => {
      assert.ok(sdk.queryProposal);
    });

    it('should export queryBalance', () => {
      assert.ok(sdk.queryBalance);
    });

    it('should export queryTokenSupply', () => {
      assert.ok(sdk.queryTokenSupply);
    });

    it('should export queryStakeInfo', () => {
      assert.ok(sdk.queryStakeInfo);
    });

    it('should export queryTransferHistory', () => {
      assert.ok(sdk.queryTransferHistory);
    });
  });

  describe('query functions', () => {
    it('queryCivitasStatus should be a function', () => {
      assert.equal(typeof sdk.queryCivitasStatus, 'function');
    });

    it('queryAgentStatus should be a function', () => {
      assert.equal(typeof sdk.queryAgentStatus, 'function');
    });

    it('queryMemories should be a function', () => {
      assert.equal(typeof sdk.queryMemories, 'function');
    });

    it('queryArtifacts should be a function', () => {
      assert.equal(typeof sdk.queryArtifacts, 'function');
    });

    it('queryCanisterStatus should be a function', () => {
      assert.equal(typeof sdk.queryCanisterStatus, 'function');
    });

    it('queryOrganismState should be a function', () => {
      assert.equal(typeof sdk.queryOrganismState, 'function');
    });
  });
});
