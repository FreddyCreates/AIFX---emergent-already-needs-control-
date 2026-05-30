const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('Medina Calls SDK', () => {
  let sdk;

  beforeEach(async () => {
    sdk = await import('../../sdk/medina-calls/src/index.js');
  });

  describe('Civitas Calls exports', () => {
    it('should export callBootstrapCivitas', () => {
      assert.ok(sdk.callBootstrapCivitas);
    });

    it('should export callAwakenCivitas', () => {
      assert.ok(sdk.callAwakenCivitas);
    });

    it('should export callDormantCivitas', () => {
      assert.ok(sdk.callDormantCivitas);
    });

    it('should export callTerminateCivitas', () => {
      assert.ok(sdk.callTerminateCivitas);
    });

    it('should export callUpdateAgentState', () => {
      assert.ok(sdk.callUpdateAgentState);
    });

    it('should export callSendStimulus', () => {
      assert.ok(sdk.callSendStimulus);
    });

    it('should export callTriggerReflection', () => {
      assert.ok(sdk.callTriggerReflection);
    });

    it('should export callSetAgentGoal', () => {
      assert.ok(sdk.callSetAgentGoal);
    });

    it('should export callCompleteGoal', () => {
      assert.ok(sdk.callCompleteGoal);
    });

    it('should export callStoreMemory', () => {
      assert.ok(sdk.callStoreMemory);
    });

    it('should export callConsolidateMemories', () => {
      assert.ok(sdk.callConsolidateMemories);
    });

    it('should export callForgetMemory', () => {
      assert.ok(sdk.callForgetMemory);
    });

    it('should export callUpdateMemoryImportance', () => {
      assert.ok(sdk.callUpdateMemoryImportance);
    });

    it('should export callCreateArtifact', () => {
      assert.ok(sdk.callCreateArtifact);
    });

    it('should export callUpdateArtifact', () => {
      assert.ok(sdk.callUpdateArtifact);
    });

    it('should export callArchiveArtifact', () => {
      assert.ok(sdk.callArchiveArtifact);
    });

    it('should export callBindCivitasSynapse', () => {
      assert.ok(sdk.callBindCivitasSynapse);
    });

    it('should export callStrengthenSynapse', () => {
      assert.ok(sdk.callStrengthenSynapse);
    });

    it('should export callTriggerResonance', () => {
      assert.ok(sdk.callTriggerResonance);
    });

    it('should export callApplyReward', () => {
      assert.ok(sdk.callApplyReward);
    });

    it('should export callApplyPunishment', () => {
      assert.ok(sdk.callApplyPunishment);
    });

    it('should export callUpdateLearningRate', () => {
      assert.ok(sdk.callUpdateLearningRate);
    });
  });

  describe('Organism Calls exports', () => {
    it('should export callDeployOrganism', () => {
      assert.ok(sdk.callDeployOrganism);
    });

    it('should export callUpgradeOrganism', () => {
      assert.ok(sdk.callUpgradeOrganism);
    });

    it('should export callDeleteOrganism', () => {
      assert.ok(sdk.callDeleteOrganism);
    });

    it('should export callStartHeartbeat', () => {
      assert.ok(sdk.callStartHeartbeat);
    });

    it('should export callStopHeartbeat', () => {
      assert.ok(sdk.callStopHeartbeat);
    });

    it('should export callRegisterCitizen', () => {
      assert.ok(sdk.callRegisterCitizen);
    });

    it('should export callCreateProposal', () => {
      assert.ok(sdk.callCreateProposal);
    });

    it('should export callVote', () => {
      assert.ok(sdk.callVote);
    });

    it('should export callExecuteProposal', () => {
      assert.ok(sdk.callExecuteProposal);
    });

    it('should export callTransfer', () => {
      assert.ok(sdk.callTransfer);
    });

    it('should export callStake', () => {
      assert.ok(sdk.callStake);
    });

    it('should export callUnstake', () => {
      assert.ok(sdk.callUnstake);
    });

    it('should export callClaimRewards', () => {
      assert.ok(sdk.callClaimRewards);
    });
  });

  describe('callBootstrapCivitas', () => {
    it('should be a function', () => {
      assert.equal(typeof sdk.callBootstrapCivitas, 'function');
    });
  });

  describe('callUpdateAgentState', () => {
    it('should be a function', () => {
      assert.equal(typeof sdk.callUpdateAgentState, 'function');
    });
  });

  describe('callStoreMemory', () => {
    it('should be a function', () => {
      assert.equal(typeof sdk.callStoreMemory, 'function');
    });
  });

  describe('callCreateArtifact', () => {
    it('should be a function', () => {
      assert.equal(typeof sdk.callCreateArtifact, 'function');
    });
  });

  describe('callDeployOrganism', () => {
    it('should be a function', () => {
      assert.equal(typeof sdk.callDeployOrganism, 'function');
    });
  });

  describe('callStartHeartbeat', () => {
    it('should be a function', () => {
      assert.equal(typeof sdk.callStartHeartbeat, 'function');
    });
  });
});
