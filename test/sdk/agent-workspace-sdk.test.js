const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

describe('Agent workspace SDK', () => {
  let AgentWorkspace;
  let createDefaultAIWorkspaces;
  let DEFAULT_AI_WORKSPACES;
  let AgentWorkspaceProtocol;

  before(async () => {
    const sdkModulePath = pathToFileURL(
      path.resolve(__dirname, '../../sdk/agent-workspace-sdk/src/index.js'),
    ).href;
    ({ AgentWorkspace, createDefaultAIWorkspaces, DEFAULT_AI_WORKSPACES } = await import(sdkModulePath));

    const protocolModulePath = pathToFileURL(
      path.resolve(__dirname, '../../protocols/agent-workspace-protocol.js'),
    ).href;
    ({ AgentWorkspaceProtocol } = await import(protocolModulePath));
  });

  it('creates a workspace and posts durable notes', () => {
    const workspace = new AgentWorkspace();
    const created = workspace.createWorkspace({
      workspaceId: 'test-workspace',
      title: 'Test Workspace',
      participants: [{ participantId: 'copilot', label: 'Copilot' }],
    });

    const note = workspace.postNote('test-workspace', {
      authorId: 'copilot',
      content: 'Ready for handoff.',
      tags: ['status'],
    });

    assert.equal(created.workspaceId, 'test-workspace');
    assert.equal(note.authorId, 'copilot');
    assert.equal(workspace.getWorkspace('test-workspace').notes.length, 1);
  });

  it('supports queue, claim, and complete handoff flow', () => {
    const workspace = new AgentWorkspace();
    workspace.createWorkspace({
      workspaceId: 'shared-handoff-workspace',
      title: 'Shared Handoff Workspace',
    });

    const handoff = workspace.queueHandoff('shared-handoff-workspace', {
      title: 'Review adapter exports',
      from: 'copilot',
      to: 'chatgpt',
      acceptanceCriteria: ['exports verified', 'tests green'],
    });

    const claimed = workspace.claimHandoff('shared-handoff-workspace', handoff.handoffId, 'chatgpt');
    const completed = workspace.completeHandoff(
      'shared-handoff-workspace',
      handoff.handoffId,
      'chatgpt',
      { summary: 'Verified and complete' },
    );

    assert.equal(claimed.status, 'claimed');
    assert.equal(completed.status, 'completed');
    assert.equal(completed.result.summary, 'Verified and complete');
  });

  it('seeds default AI workspaces for Copilot, My AI, ChatGPT, and shared handoff', () => {
    const workspace = new AgentWorkspace();
    const seeded = createDefaultAIWorkspaces(workspace);

    assert.equal(seeded.length, DEFAULT_AI_WORKSPACES.length);
    assert.ok(seeded.some((entry) => entry.workspaceId === 'copilot-internal-workspace'));
    assert.ok(seeded.some((entry) => entry.workspaceId === 'my-ai-internal-workspace'));
    assert.ok(seeded.some((entry) => entry.workspaceId === 'chatgpt-shared-workspace'));
    assert.ok(seeded.some((entry) => entry.workspaceId === 'shared-handoff-workspace'));
  });

  it('enforces protocol state transitions for workspace handoffs', () => {
    const protocol = new AgentWorkspaceProtocol();
    protocol.registerWorkspace({
      workspaceId: 'shared-handoff-workspace',
      title: 'Shared Handoff Workspace',
      participants: ['copilot', 'my-ai', 'chatgpt'],
    });

    const envelope = protocol.createHandoffEnvelope({
      workspaceId: 'shared-handoff-workspace',
      title: 'Take over implementation',
      from: 'copilot',
      to: 'my-ai',
      acceptanceCriteria: ['context loaded', 'handoff acknowledged'],
    });

    const claimed = protocol.acceptHandoff(envelope.handoffId, 'my-ai');
    const inProgress = protocol.startHandoff(envelope.handoffId, 'my-ai');
    const completed = protocol.completeHandoff(envelope.handoffId, 'my-ai', {
      status: 'done',
    });

    assert.equal(claimed.state, 'claimed');
    assert.equal(inProgress.state, 'in_progress');
    assert.equal(completed.state, 'completed');
  });
});
