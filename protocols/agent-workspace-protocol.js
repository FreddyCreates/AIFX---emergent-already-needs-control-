/**
 * PROTO-228: Agent Workspace Protocol (AWP)
 * Structured workspace-and-handoff contract for Copilot, ChatGPT, and internal AIs.
 *
 * The protocol does not require direct agent-to-agent chat. Instead, agents work
 * through shared workspace lanes, leave durable notes, and exchange handoff
 * envelopes with explicit states and acceptance criteria.
 *
 * Lifecycle:
 *   REGISTERED_WORKSPACE → HANDOFF_QUEUED → CLAIMED → IN_PROGRESS → COMPLETED
 *                                                ↓
 *                                           BLOCKED / REJECTED
 *
 * @module protocols/agent-workspace-protocol
 * @version 1.0.0
 */

const HANDOFF_STATES = {
  QUEUED: 'queued',
  CLAIMED: 'claimed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  REJECTED: 'rejected',
};

const WORKSPACE_VISIBILITY = {
  INTERNAL: 'internal',
  SHARED: 'shared',
  EXTERNAL_DOCK: 'external_dock',
};

class AgentWorkspaceProtocol {
  constructor() {
    this.workspaces = new Map();
    this.handoffs = new Map();
    this.metrics = {
      workspaces: 0,
      handoffsQueued: 0,
      handoffsCompleted: 0,
      handoffsBlocked: 0,
    };
  }

  registerWorkspace(definition = {}) {
    if (!definition.workspaceId) throw new Error('workspaceId is required');
    if (!definition.title) throw new Error('title is required');

    const workspace = {
      workspaceId: definition.workspaceId,
      title: definition.title,
      visibility: definition.visibility || WORKSPACE_VISIBILITY.INTERNAL,
      participants: Array.isArray(definition.participants) ? [...definition.participants] : [],
      lanes: Array.isArray(definition.lanes) && definition.lanes.length > 0 ? [...definition.lanes] : ['handoffs'],
      registeredAt: Date.now(),
    };

    this.workspaces.set(workspace.workspaceId, workspace);
    this.metrics.workspaces = this.workspaces.size;
    return { ...workspace, participants: [...workspace.participants], lanes: [...workspace.lanes] };
  }

  createHandoffEnvelope(definition = {}) {
    if (!definition.workspaceId) throw new Error('workspaceId is required');
    if (!this.workspaces.has(definition.workspaceId)) {
      throw new Error(`Unknown workspace: ${definition.workspaceId}`);
    }
    if (!definition.title) throw new Error('title is required');
    if (!definition.from) throw new Error('from is required');

    const envelope = {
      handoffId: definition.handoffId || `handoff-${Date.now().toString(36)}-${this.handoffs.size + 1}`,
      workspaceId: definition.workspaceId,
      lane: definition.lane || 'handoffs',
      title: definition.title,
      from: definition.from,
      to: definition.to || 'shared',
      payload: { ...(definition.payload || {}) },
      acceptanceCriteria: Array.isArray(definition.acceptanceCriteria) ? [...definition.acceptanceCriteria] : [],
      state: HANDOFF_STATES.QUEUED,
      claimedBy: null,
      resolution: null,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    this.handoffs.set(envelope.handoffId, envelope);
    this.metrics.handoffsQueued += 1;
    return this.getHandoff(envelope.handoffId);
  }

  acceptHandoff(handoffId, actorId) {
    const envelope = this._requireHandoff(handoffId);
    if (envelope.state !== HANDOFF_STATES.QUEUED) {
      throw new Error(`Handoff ${handoffId} cannot be accepted from state ${envelope.state}`);
    }
    envelope.state = HANDOFF_STATES.CLAIMED;
    envelope.claimedBy = actorId;
    envelope.updatedAt = Date.now();
    return this.getHandoff(handoffId);
  }

  startHandoff(handoffId, actorId) {
    const envelope = this._requireHandoff(handoffId);
    if (envelope.state !== HANDOFF_STATES.CLAIMED) {
      throw new Error(`Handoff ${handoffId} cannot start from state ${envelope.state}`);
    }
    if (envelope.claimedBy !== actorId) {
      throw new Error(`Handoff ${handoffId} is claimed by ${envelope.claimedBy}`);
    }
    envelope.state = HANDOFF_STATES.IN_PROGRESS;
    envelope.updatedAt = Date.now();
    return this.getHandoff(handoffId);
  }

  completeHandoff(handoffId, actorId, resolution = {}) {
    const envelope = this._requireHandoff(handoffId);
    if (![HANDOFF_STATES.CLAIMED, HANDOFF_STATES.IN_PROGRESS].includes(envelope.state)) {
      throw new Error(`Handoff ${handoffId} cannot complete from state ${envelope.state}`);
    }
    if (envelope.claimedBy !== actorId) {
      throw new Error(`Handoff ${handoffId} is claimed by ${envelope.claimedBy}`);
    }
    envelope.state = HANDOFF_STATES.COMPLETED;
    envelope.resolution = { ...resolution };
    envelope.updatedAt = Date.now();
    this.metrics.handoffsCompleted += 1;
    return this.getHandoff(handoffId);
  }

  blockHandoff(handoffId, actorId, reason) {
    const envelope = this._requireHandoff(handoffId);
    envelope.state = HANDOFF_STATES.BLOCKED;
    envelope.claimedBy = actorId;
    envelope.resolution = { reason };
    envelope.updatedAt = Date.now();
    this.metrics.handoffsBlocked += 1;
    return this.getHandoff(handoffId);
  }

  listWorkspaceHandoffs(workspaceId) {
    return Array.from(this.handoffs.values())
      .filter((handoff) => handoff.workspaceId === workspaceId)
      .map((handoff) => this.getHandoff(handoff.handoffId));
  }

  getHandoff(handoffId) {
    const envelope = this._requireHandoff(handoffId);
    return {
      ...envelope,
      payload: { ...envelope.payload },
      acceptanceCriteria: [...envelope.acceptanceCriteria],
      resolution: envelope.resolution ? { ...envelope.resolution } : null,
    };
  }

  getState() {
    return {
      metrics: { ...this.metrics },
      workspaces: Array.from(this.workspaces.values()).map((workspace) => ({
        ...workspace,
        participants: [...workspace.participants],
        lanes: [...workspace.lanes],
      })),
      handoffs: Array.from(this.handoffs.values()).map((handoff) => this.getHandoff(handoff.handoffId)),
    };
  }

  _requireHandoff(handoffId) {
    const envelope = this.handoffs.get(handoffId);
    if (!envelope) throw new Error(`Unknown handoff: ${handoffId}`);
    return envelope;
  }
}

export { AgentWorkspaceProtocol, HANDOFF_STATES, WORKSPACE_VISIBILITY };
export default AgentWorkspaceProtocol;
