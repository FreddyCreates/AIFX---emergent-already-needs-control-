import crypto from 'node:crypto';

const WORKSPACE_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
};

const HANDOFF_STATUS = {
  QUEUED: 'queued',
  CLAIMED: 'claimed',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
};

/**
 * AgentWorkspace — shared collaboration surface for internal AIs.
 * Lets multiple AI actors coordinate through persistent workspaces,
 * notes, and handoff lanes instead of direct conversation channels.
 */
export class AgentWorkspace {
  constructor() {
    /** @type {Map<string, any>} */
    this._workspaces = new Map();
    /** @type {Array<{ event: string, workspaceId: string, at: number, refId?: string }>} */
    this._events = [];
  }

  /**
   * @param {{ workspaceId?: string, title: string, description?: string, participants?: any[], tags?: string[], channels?: string[], visibility?: string, metadata?: Record<string, *> }} definition
   */
  createWorkspace(definition) {
    if (!definition?.title) throw new Error('Workspace title is required');

    const workspaceId = definition.workspaceId || crypto.randomUUID();
    if (this._workspaces.has(workspaceId)) {
      throw new Error(`Workspace already exists: ${workspaceId}`);
    }

    const now = Date.now();
    const workspace = {
      workspaceId,
      title: definition.title,
      description: definition.description || '',
      visibility: definition.visibility || 'internal',
      status: WORKSPACE_STATUS.ACTIVE,
      participants: Array.isArray(definition.participants) ? [...definition.participants] : [],
      tags: Array.isArray(definition.tags) ? [...definition.tags] : [],
      channels: Array.isArray(definition.channels) && definition.channels.length > 0
        ? [...definition.channels]
        : ['notes', 'handoffs', 'artifacts'],
      notes: [],
      handoffs: [],
      metadata: { ...(definition.metadata || {}) },
      createdAt: now,
      updatedAt: now,
    };

    this._workspaces.set(workspaceId, workspace);
    this._record('workspace-created', workspaceId);
    return this.getWorkspace(workspaceId);
  }

  /**
   * @param {string} workspaceId
   * @param {{ participantId: string, label?: string, type?: string, capabilities?: string[] }} participant
   */
  registerParticipant(workspaceId, participant) {
    if (!participant?.participantId) throw new Error('participantId is required');
    const workspace = this._requireWorkspace(workspaceId);
    const existing = workspace.participants.find((p) => p.participantId === participant.participantId);

    if (existing) {
      Object.assign(existing, {
        ...participant,
        capabilities: Array.isArray(participant.capabilities) ? [...participant.capabilities] : existing.capabilities || [],
      });
    } else {
      workspace.participants.push({
        participantId: participant.participantId,
        label: participant.label || participant.participantId,
        type: participant.type || 'ai',
        capabilities: Array.isArray(participant.capabilities) ? [...participant.capabilities] : [],
      });
    }

    workspace.updatedAt = Date.now();
    this._record('participant-registered', workspaceId, participant.participantId);
    return this.getWorkspace(workspaceId);
  }

  /**
   * @param {string} workspaceId
   * @param {{ authorId: string, content: string, channel?: string, kind?: string, tags?: string[] }} note
   */
  postNote(workspaceId, note) {
    if (!note?.authorId) throw new Error('authorId is required');
    if (!note?.content) throw new Error('content is required');
    const workspace = this._requireWorkspace(workspaceId);

    const entry = {
      noteId: crypto.randomUUID(),
      authorId: note.authorId,
      channel: note.channel || 'notes',
      kind: note.kind || 'note',
      content: note.content,
      tags: Array.isArray(note.tags) ? [...note.tags] : [],
      createdAt: Date.now(),
    };

    workspace.notes.push(entry);
    workspace.updatedAt = entry.createdAt;
    this._record('note-posted', workspaceId, entry.noteId);
    return { ...entry };
  }

  /**
   * @param {string} workspaceId
   * @param {{ title: string, from: string, to?: string, payload?: Record<string, *>, priority?: string, acceptanceCriteria?: string[], tags?: string[] }} handoff
   */
  queueHandoff(workspaceId, handoff) {
    if (!handoff?.title) throw new Error('handoff.title is required');
    if (!handoff?.from) throw new Error('handoff.from is required');
    const workspace = this._requireWorkspace(workspaceId);

    const now = Date.now();
    const entry = {
      handoffId: crypto.randomUUID(),
      title: handoff.title,
      from: handoff.from,
      to: handoff.to || 'shared',
      payload: { ...(handoff.payload || {}) },
      priority: handoff.priority || 'medium',
      acceptanceCriteria: Array.isArray(handoff.acceptanceCriteria) ? [...handoff.acceptanceCriteria] : [],
      tags: Array.isArray(handoff.tags) ? [...handoff.tags] : [],
      status: HANDOFF_STATUS.QUEUED,
      claimedBy: null,
      result: null,
      createdAt: now,
      updatedAt: now,
    };

    workspace.handoffs.push(entry);
    workspace.updatedAt = now;
    this._record('handoff-queued', workspaceId, entry.handoffId);
    return { ...entry, payload: { ...entry.payload }, acceptanceCriteria: [...entry.acceptanceCriteria], tags: [...entry.tags] };
  }

  /**
   * @param {string} workspaceId
   * @param {string} handoffId
   * @param {string} actorId
   */
  claimHandoff(workspaceId, handoffId, actorId) {
    const handoff = this._requireHandoff(workspaceId, handoffId);
    if (handoff.status !== HANDOFF_STATUS.QUEUED) {
      throw new Error(`Handoff ${handoffId} is not claimable from state ${handoff.status}`);
    }

    handoff.status = HANDOFF_STATUS.CLAIMED;
    handoff.claimedBy = actorId;
    handoff.updatedAt = Date.now();
    this._touchWorkspace(workspaceId);
    this._record('handoff-claimed', workspaceId, handoffId);
    return { ...handoff, payload: { ...handoff.payload }, acceptanceCriteria: [...handoff.acceptanceCriteria], tags: [...handoff.tags] };
  }

  /**
   * @param {string} workspaceId
   * @param {string} handoffId
   * @param {string} actorId
   * @param {Record<string, *>} [result]
   */
  completeHandoff(workspaceId, handoffId, actorId, result = {}) {
    const handoff = this._requireHandoff(workspaceId, handoffId);
    if (handoff.claimedBy && handoff.claimedBy !== actorId) {
      throw new Error(`Handoff ${handoffId} is claimed by ${handoff.claimedBy}`);
    }

    handoff.status = HANDOFF_STATUS.COMPLETED;
    handoff.claimedBy = actorId;
    handoff.result = { ...result };
    handoff.updatedAt = Date.now();
    this._touchWorkspace(workspaceId);
    this._record('handoff-completed', workspaceId, handoffId);
    return { ...handoff, payload: { ...handoff.payload }, result: { ...handoff.result }, acceptanceCriteria: [...handoff.acceptanceCriteria], tags: [...handoff.tags] };
  }

  /**
   * @param {string} workspaceId
   * @param {string} handoffId
   * @param {string} actorId
   * @param {string} reason
   */
  blockHandoff(workspaceId, handoffId, actorId, reason) {
    const handoff = this._requireHandoff(workspaceId, handoffId);
    handoff.status = HANDOFF_STATUS.BLOCKED;
    handoff.claimedBy = actorId;
    handoff.result = { reason };
    handoff.updatedAt = Date.now();
    this._touchWorkspace(workspaceId);
    this._record('handoff-blocked', workspaceId, handoffId);
    return { ...handoff, payload: { ...handoff.payload }, result: { ...handoff.result }, acceptanceCriteria: [...handoff.acceptanceCriteria], tags: [...handoff.tags] };
  }

  /**
   * @param {{ status?: string, tag?: string }} [filter]
   */
  listWorkspaces(filter = {}) {
    return Array.from(this._workspaces.values())
      .filter((workspace) => !filter.status || workspace.status === filter.status)
      .filter((workspace) => !filter.tag || workspace.tags.includes(filter.tag))
      .map((workspace) => this.getWorkspace(workspace.workspaceId));
  }

  /**
   * @param {string} workspaceId
   */
  getWorkspace(workspaceId) {
    const workspace = this._requireWorkspace(workspaceId);
    return {
      ...workspace,
      participants: workspace.participants.map((participant) => ({ ...participant, capabilities: [...(participant.capabilities || [])] })),
      tags: [...workspace.tags],
      channels: [...workspace.channels],
      notes: workspace.notes.map((note) => ({ ...note, tags: [...note.tags] })),
      handoffs: workspace.handoffs.map((handoff) => ({
        ...handoff,
        payload: { ...handoff.payload },
        result: handoff.result ? { ...handoff.result } : null,
        acceptanceCriteria: [...handoff.acceptanceCriteria],
        tags: [...handoff.tags],
      })),
      metadata: { ...workspace.metadata },
    };
  }

  /**
   * @param {string} workspaceId
   */
  archiveWorkspace(workspaceId) {
    const workspace = this._requireWorkspace(workspaceId);
    workspace.status = WORKSPACE_STATUS.ARCHIVED;
    workspace.updatedAt = Date.now();
    this._record('workspace-archived', workspaceId);
    return this.getWorkspace(workspaceId);
  }

  getMetrics() {
    const workspaces = Array.from(this._workspaces.values());
    return {
      totalWorkspaces: workspaces.length,
      activeWorkspaces: workspaces.filter((workspace) => workspace.status === WORKSPACE_STATUS.ACTIVE).length,
      totalParticipants: workspaces.reduce((sum, workspace) => sum + workspace.participants.length, 0),
      totalNotes: workspaces.reduce((sum, workspace) => sum + workspace.notes.length, 0),
      totalHandoffs: workspaces.reduce((sum, workspace) => sum + workspace.handoffs.length, 0),
      completedHandoffs: workspaces.reduce((sum, workspace) => sum + workspace.handoffs.filter((handoff) => handoff.status === HANDOFF_STATUS.COMPLETED).length, 0),
      blockedHandoffs: workspaces.reduce((sum, workspace) => sum + workspace.handoffs.filter((handoff) => handoff.status === HANDOFF_STATUS.BLOCKED).length, 0),
      recentEvents: this._events.slice(-10).map((event) => ({ ...event })),
    };
  }

  _requireWorkspace(workspaceId) {
    const workspace = this._workspaces.get(workspaceId);
    if (!workspace) throw new Error(`Unknown workspace: ${workspaceId}`);
    return workspace;
  }

  _requireHandoff(workspaceId, handoffId) {
    const workspace = this._requireWorkspace(workspaceId);
    const handoff = workspace.handoffs.find((entry) => entry.handoffId === handoffId);
    if (!handoff) throw new Error(`Unknown handoff: ${handoffId}`);
    return handoff;
  }

  _touchWorkspace(workspaceId) {
    const workspace = this._requireWorkspace(workspaceId);
    workspace.updatedAt = Date.now();
  }

  _record(event, workspaceId, refId) {
    this._events.push({ event, workspaceId, at: Date.now(), refId });
    if (this._events.length > 200) this._events.shift();
  }
}

export { WORKSPACE_STATUS, HANDOFF_STATUS };
export default AgentWorkspace;
