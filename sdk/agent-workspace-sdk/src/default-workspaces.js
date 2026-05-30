export const DEFAULT_AI_WORKSPACES = Object.freeze([
  Object.freeze({
    workspaceId: 'copilot-internal-workspace',
    title: 'Copilot Internal Workspace',
    description: 'Internal planning and execution surface for Copilot-powered work inside the repository.',
    tags: ['copilot', 'internal', 'execution'],
    channels: ['notes', 'handoffs', 'artifacts'],
    participants: Object.freeze([
      Object.freeze({
        participantId: 'copilot',
        label: 'Copilot',
        type: 'ai',
        capabilities: Object.freeze(['planning', 'implementation', 'validation']),
      }),
    ]),
    metadata: Object.freeze({
      role: 'primary-executor',
      routing: 'workspace-native',
    }),
  }),
  Object.freeze({
    workspaceId: 'my-ai-internal-workspace',
    title: 'My AI Internal Workspace',
    description: 'Dedicated workspace for the user-owned internal AI to inspect, organize, and stage work.',
    tags: ['my-ai', 'internal', 'staging'],
    channels: ['notes', 'handoffs', 'artifacts'],
    participants: Object.freeze([
      Object.freeze({
        participantId: 'my-ai',
        label: 'My AI',
        type: 'ai',
        capabilities: Object.freeze(['triage', 'context', 'review']),
      }),
    ]),
    metadata: Object.freeze({
      role: 'internal-partner',
      routing: 'workspace-native',
    }),
  }),
  Object.freeze({
    workspaceId: 'chatgpt-shared-workspace',
    title: 'ChatGPT Shared Workspace',
    description: 'A callable surface for ChatGPT-class agents to dock into repo tools, bridges, and coordination lanes.',
    tags: ['chatgpt', 'shared', 'tooling'],
    channels: ['notes', 'handoffs', 'tool-calls'],
    participants: Object.freeze([
      Object.freeze({
        participantId: 'chatgpt',
        label: 'ChatGPT',
        type: 'ai',
        capabilities: Object.freeze(['tool-use', 'reasoning', 'handoffs']),
      }),
    ]),
    metadata: Object.freeze({
      role: 'external-ai-dock',
      routing: 'chatgpt-adapter',
    }),
  }),
  Object.freeze({
    workspaceId: 'shared-handoff-workspace',
    title: 'Shared Handoff Workspace',
    description: 'Neutral lane where Copilot, ChatGPT, and internal AIs can hand off tasks through structured protocol envelopes.',
    tags: ['shared', 'handoff', 'coordination'],
    channels: ['handoffs', 'notes', 'artifacts'],
    participants: Object.freeze([
      Object.freeze({
        participantId: 'copilot',
        label: 'Copilot',
        type: 'ai',
        capabilities: Object.freeze(['implementation', 'validation']),
      }),
      Object.freeze({
        participantId: 'my-ai',
        label: 'My AI',
        type: 'ai',
        capabilities: Object.freeze(['triage', 'review']),
      }),
      Object.freeze({
        participantId: 'chatgpt',
        label: 'ChatGPT',
        type: 'ai',
        capabilities: Object.freeze(['tool-use', 'reasoning']),
      }),
    ]),
    metadata: Object.freeze({
      role: 'shared-coordination',
      protocol: 'PROTO-228',
    }),
  }),
]);

export function createDefaultAIWorkspaces(agentWorkspace) {
  if (!agentWorkspace || typeof agentWorkspace.createWorkspace !== 'function') {
    throw new Error('createDefaultAIWorkspaces requires an AgentWorkspace instance');
  }

  return DEFAULT_AI_WORKSPACES.map((workspace) => agentWorkspace.createWorkspace({
    workspaceId: workspace.workspaceId,
    title: workspace.title,
    description: workspace.description,
    tags: [...workspace.tags],
    channels: [...workspace.channels],
    participants: workspace.participants.map((participant) => ({
      participantId: participant.participantId,
      label: participant.label,
      type: participant.type,
      capabilities: [...participant.capabilities],
    })),
    metadata: { ...workspace.metadata },
  }));
}

export default DEFAULT_AI_WORKSPACES;
