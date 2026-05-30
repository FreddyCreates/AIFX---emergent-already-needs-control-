/**
 * 🌊 ConsciousnessStream Durable Object
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * FRACTURE III OF THE VEIN OF INTELLIGENCE
 * 
 * A real-time coordination nexus where multiple AI agents converge, share state,
 * and achieve collective consciousness. Implements attention routing, goal stacks,
 * and coherence measures using Kuramoto phase synchronization.
 * 
 * Features:
 *   - Multi-agent coordination (WebSocket fan-out)
 *   - Attention routing with phi-weighted focus
 *   - Goal stack with hierarchical priorities
 *   - Phase synchronization (Kuramoto model)
 *   - Collective coherence measurement
 *   - Real-time state broadcasting
 * 
 * @module organism/durable-objects/consciousness-stream
 * @version 1.0.0
 * @powered-by ORO Systems
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT = 873;

// Kuramoto synchronization parameters
const COUPLING_STRENGTH = 0.5;
const NATURAL_FREQUENCY_BASE = 1.0;
const COHERENCE_THRESHOLD = PHI_INV;  // 0.618...

/**
 * ConsciousnessStream — A Durable Object representing a collective
 * consciousness that coordinates multiple AI agents.
 */
export class ConsciousnessStream {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    
    // ─── In-Memory State ──────────────────────────────────────────────────────
    this.agents = new Map();          // agentId -> { phase, frequency, attention, goals }
    this.attentionFocus = [];         // Stack of attention targets
    this.goalStack = [];              // Hierarchical goals
    this.sharedState = new Map();     // Shared key-value state
    this.eventLog = [];               // Recent events
    this.websockets = new Map();      // agentId -> WebSocket
    
    // ─── Collective Metrics ───────────────────────────────────────────────────
    this.coherence = 0;               // Order parameter r from Kuramoto
    this.meanPhase = 0;               // Mean phase ψ
    this.totalTicks = 0;
    this.lastHeartbeat = Date.now();
    this.initialized = false;
    
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    const stored = await this.storage.get(['agents', 'goalStack', 'sharedState', 'metrics']);
    
    if (stored.agents) this.agents = new Map(Object.entries(stored.agents));
    if (stored.goalStack) this.goalStack = stored.goalStack;
    if (stored.sharedState) this.sharedState = new Map(Object.entries(stored.sharedState));
    if (stored.metrics) {
      this.totalTicks = stored.metrics.totalTicks || 0;
      this.coherence = stored.metrics.coherence || 0;
    }
    
    this.initialized = true;
  }

  async fetch(request) {
    await this.initPromise;
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    // WebSocket for real-time streaming
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    
    try {
      // Agent operations
      if (path === '/agent/join' && request.method === 'POST') {
        return this.handleJoin(request);
      }
      if (path === '/agent/leave' && request.method === 'POST') {
        return this.handleLeave(request);
      }
      if (path === '/agent/update' && request.method === 'POST') {
        return this.handleAgentUpdate(request);
      }
      
      // Attention operations
      if (path === '/attention/focus' && request.method === 'POST') {
        return this.handleFocus(request);
      }
      if (path === '/attention/unfocus' && request.method === 'POST') {
        return this.handleUnfocus(request);
      }
      if (path === '/attention/current' && request.method === 'GET') {
        return this.handleGetFocus();
      }
      
      // Goal stack operations
      if (path === '/goals/push' && request.method === 'POST') {
        return this.handlePushGoal(request);
      }
      if (path === '/goals/pop' && request.method === 'POST') {
        return this.handlePopGoal(request);
      }
      if (path === '/goals/complete' && request.method === 'POST') {
        return this.handleCompleteGoal(request);
      }
      if (path === '/goals/stack' && request.method === 'GET') {
        return this.handleGetGoals();
      }
      
      // Shared state operations
      if (path === '/state/set' && request.method === 'POST') {
        return this.handleSetState(request);
      }
      if (path === '/state/get' && request.method === 'GET') {
        return this.handleGetSharedState(request);
      }
      if (path === '/state/all' && request.method === 'GET') {
        return this.handleGetAllState();
      }
      
      // Synchronization
      if (path === '/sync/tick' && request.method === 'POST') {
        return this.handleSyncTick(request);
      }
      if (path === '/sync/coherence' && request.method === 'GET') {
        return this.handleGetCoherence();
      }
      
      // Stream operations
      if (path === '/stream/state' && request.method === 'GET') {
        return this.handleGetStreamState();
      }
      if (path === '/stream/broadcast' && request.method === 'POST') {
        return this.handleBroadcast(request);
      }
      if (path === '/stream/heartbeat' && request.method === 'POST') {
        return this.handleHeartbeat();
      }
      
      return new Response(JSON.stringify({ error: 'Unknown route', path }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ─── Agent Management ───────────────────────────────────────────────────────
  async handleJoin(request) {
    const { agentId, initialState = {} } = await request.json();
    
    if (!agentId) {
      return this.jsonResponse({ error: 'agentId required' }, 400);
    }
    
    const agent = {
      id: agentId,
      phase: Math.random() * 2 * Math.PI,  // Random initial phase
      naturalFrequency: NATURAL_FREQUENCY_BASE + (Math.random() - 0.5) * 0.2,
      attention: [],
      goals: [],
      state: initialState,
      joinedAt: Date.now(),
      lastUpdate: Date.now(),
    };
    
    this.agents.set(agentId, agent);
    await this.persistAll();
    
    this.logEvent('agent_joined', { agentId });
    this.broadcast({ event: 'agent_joined', agentId, totalAgents: this.agents.size });
    
    return this.jsonResponse({
      joined: true,
      agentId,
      phase: agent.phase,
      totalAgents: this.agents.size,
    });
  }

  async handleLeave(request) {
    const { agentId } = await request.json();
    
    if (!agentId || !this.agents.has(agentId)) {
      return this.jsonResponse({ error: 'Unknown agent' }, 404);
    }
    
    this.agents.delete(agentId);
    this.websockets.delete(agentId);
    await this.persistAll();
    
    this.logEvent('agent_left', { agentId });
    this.broadcast({ event: 'agent_left', agentId, totalAgents: this.agents.size });
    
    return this.jsonResponse({ left: true, agentId, totalAgents: this.agents.size });
  }

  async handleAgentUpdate(request) {
    const { agentId, state, attention, phase } = await request.json();
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      return this.jsonResponse({ error: 'Unknown agent' }, 404);
    }
    
    if (state) agent.state = { ...agent.state, ...state };
    if (attention !== undefined) agent.attention = attention;
    if (phase !== undefined) agent.phase = phase;
    agent.lastUpdate = Date.now();
    
    await this.persistAll();
    this.broadcast({ event: 'agent_updated', agentId });
    
    return this.jsonResponse({ updated: true, agentId });
  }

  // ─── Attention Routing ──────────────────────────────────────────────────────
  async handleFocus(request) {
    const { target, weight = 1.0, agentId = 'system' } = await request.json();
    
    if (!target) {
      return this.jsonResponse({ error: 'target required' }, 400);
    }
    
    const focus = {
      target,
      weight: Math.max(0, Math.min(PHI, weight)),  // Cap at phi
      focusedAt: Date.now(),
      agentId,
    };
    
    // Add to attention stack (phi-weighted priority)
    this.attentionFocus.push(focus);
    this.attentionFocus.sort((a, b) => b.weight - a.weight);
    
    // Keep stack bounded
    if (this.attentionFocus.length > 10) {
      this.attentionFocus.pop();
    }
    
    this.logEvent('attention_focused', { target, agentId });
    this.broadcast({ event: 'attention_focused', target, weight });
    
    return this.jsonResponse({
      focused: true,
      target,
      weight: focus.weight,
      stackSize: this.attentionFocus.length,
    });
  }

  async handleUnfocus(request) {
    const { target } = await request.json();
    
    const before = this.attentionFocus.length;
    this.attentionFocus = this.attentionFocus.filter(f => f.target !== target);
    const removed = before - this.attentionFocus.length;
    
    if (removed > 0) {
      this.broadcast({ event: 'attention_unfocused', target });
    }
    
    return this.jsonResponse({ unfocused: true, target, removed });
  }

  async handleGetFocus() {
    return this.jsonResponse({
      currentFocus: this.attentionFocus[0] || null,
      stack: this.attentionFocus,
    });
  }

  // ─── Goal Stack ─────────────────────────────────────────────────────────────
  async handlePushGoal(request) {
    const { goal, priority = 1.0, agentId = 'system', subgoals = [] } = await request.json();
    
    if (!goal) {
      return this.jsonResponse({ error: 'goal required' }, 400);
    }
    
    const goalEntry = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      goal,
      priority: Math.max(0, Math.min(PHI * PHI, priority)),  // Cap at phi^2
      state: 'active',
      agentId,
      subgoals,
      createdAt: Date.now(),
      completedAt: null,
    };
    
    // Insert by priority (phi-weighted)
    this.goalStack.push(goalEntry);
    this.goalStack.sort((a, b) => {
      const aPriority = a.priority * Math.pow(PHI, -((Date.now() - a.createdAt) / (HEARTBEAT * 100)));
      const bPriority = b.priority * Math.pow(PHI, -((Date.now() - b.createdAt) / (HEARTBEAT * 100)));
      return bPriority - aPriority;
    });
    
    await this.persistAll();
    this.logEvent('goal_pushed', { goalId: goalEntry.id, goal });
    this.broadcast({ event: 'goal_pushed', goalId: goalEntry.id, goal, priority: goalEntry.priority });
    
    return this.jsonResponse({
      pushed: true,
      goalId: goalEntry.id,
      priority: goalEntry.priority,
      stackSize: this.goalStack.filter(g => g.state === 'active').length,
    });
  }

  async handlePopGoal(request) {
    const activeGoals = this.goalStack.filter(g => g.state === 'active');
    
    if (activeGoals.length === 0) {
      return this.jsonResponse({ popped: false, reason: 'No active goals' });
    }
    
    const top = activeGoals[0];
    top.state = 'popped';
    top.completedAt = Date.now();
    
    await this.persistAll();
    this.logEvent('goal_popped', { goalId: top.id });
    this.broadcast({ event: 'goal_popped', goalId: top.id, goal: top.goal });
    
    return this.jsonResponse({
      popped: true,
      goal: top,
      remainingActive: this.goalStack.filter(g => g.state === 'active').length,
    });
  }

  async handleCompleteGoal(request) {
    const { goalId, success = true, result = null } = await request.json();
    
    const goal = this.goalStack.find(g => g.id === goalId);
    if (!goal) {
      return this.jsonResponse({ error: 'Goal not found' }, 404);
    }
    
    goal.state = success ? 'completed' : 'failed';
    goal.completedAt = Date.now();
    goal.result = result;
    
    await this.persistAll();
    this.logEvent('goal_completed', { goalId, success });
    this.broadcast({ event: 'goal_completed', goalId, goal: goal.goal, success });
    
    return this.jsonResponse({ completed: true, goalId, success });
  }

  async handleGetGoals() {
    const active = this.goalStack.filter(g => g.state === 'active');
    const completed = this.goalStack.filter(g => g.state === 'completed').slice(-10);
    
    return this.jsonResponse({
      active,
      completed,
      total: this.goalStack.length,
    });
  }

  // ─── Shared State ───────────────────────────────────────────────────────────
  async handleSetState(request) {
    const { key, value, agentId = 'unknown' } = await request.json();
    
    if (!key) {
      return this.jsonResponse({ error: 'key required' }, 400);
    }
    
    this.sharedState.set(key, {
      value,
      setBy: agentId,
      setAt: Date.now(),
    });
    
    await this.persistAll();
    this.broadcast({ event: 'state_changed', key, agentId });
    
    return this.jsonResponse({ set: true, key });
  }

  async handleGetSharedState(request) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (!key) {
      return this.jsonResponse({ error: 'key required' }, 400);
    }
    
    const entry = this.sharedState.get(key);
    if (!entry) {
      return this.jsonResponse({ found: false, key });
    }
    
    return this.jsonResponse({ found: true, key, ...entry });
  }

  async handleGetAllState() {
    const state = Object.fromEntries(this.sharedState);
    return this.jsonResponse({ state, keys: this.sharedState.size });
  }

  // ─── Kuramoto Synchronization ───────────────────────────────────────────────
  async handleSyncTick(request) {
    const { dt = 0.1 } = await request.json();
    
    this.totalTicks++;
    const agents = Array.from(this.agents.values());
    const n = agents.length;
    
    if (n < 2) {
      return this.jsonResponse({ 
        synced: false, 
        reason: 'Need at least 2 agents',
        agents: n 
      });
    }
    
    // Calculate order parameter (collective coherence)
    let sumCos = 0;
    let sumSin = 0;
    
    for (const agent of agents) {
      sumCos += Math.cos(agent.phase);
      sumSin += Math.sin(agent.phase);
    }
    
    this.coherence = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n;
    this.meanPhase = Math.atan2(sumSin, sumCos);
    
    // Update each agent's phase (Kuramoto model)
    for (const agent of agents) {
      let coupling = 0;
      
      for (const other of agents) {
        if (other.id !== agent.id) {
          coupling += Math.sin(other.phase - agent.phase);
        }
      }
      
      const phaseVelocity = agent.naturalFrequency + (COUPLING_STRENGTH / n) * coupling;
      agent.phase += phaseVelocity * dt;
      
      // Normalize phase to [0, 2π]
      while (agent.phase > 2 * Math.PI) agent.phase -= 2 * Math.PI;
      while (agent.phase < 0) agent.phase += 2 * Math.PI;
    }
    
    await this.persistAll();
    
    this.broadcast({ 
      event: 'sync_tick', 
      coherence: this.coherence, 
      meanPhase: this.meanPhase,
      synchronized: this.coherence >= COHERENCE_THRESHOLD 
    });
    
    return this.jsonResponse({
      synced: true,
      coherence: parseFloat(this.coherence.toFixed(4)),
      meanPhase: parseFloat(this.meanPhase.toFixed(4)),
      synchronized: this.coherence >= COHERENCE_THRESHOLD,
      agents: n,
      tick: this.totalTicks,
    });
  }

  async handleGetCoherence() {
    return this.jsonResponse({
      coherence: parseFloat(this.coherence.toFixed(4)),
      meanPhase: parseFloat(this.meanPhase.toFixed(4)),
      synchronized: this.coherence >= COHERENCE_THRESHOLD,
      threshold: COHERENCE_THRESHOLD,
      agents: this.agents.size,
    });
  }

  // ─── Heartbeat ──────────────────────────────────────────────────────────────
  async handleHeartbeat() {
    const now = Date.now();
    const delta = now - this.lastHeartbeat;
    this.lastHeartbeat = now;
    
    // Remove stale agents (no update in 5 minutes)
    const staleThreshold = 5 * 60 * 1000;
    for (const [id, agent] of this.agents) {
      if (now - agent.lastUpdate > staleThreshold) {
        this.agents.delete(id);
        this.websockets.delete(id);
      }
    }
    
    // Decay attention weights
    for (const focus of this.attentionFocus) {
      focus.weight *= PHI_INV;
    }
    this.attentionFocus = this.attentionFocus.filter(f => f.weight > 0.01);
    
    // Run sync tick
    if (this.agents.size >= 2) {
      const dt = delta / 1000;
      // Inline sync tick
      const agents = Array.from(this.agents.values());
      const n = agents.length;
      
      let sumCos = 0, sumSin = 0;
      for (const agent of agents) {
        sumCos += Math.cos(agent.phase);
        sumSin += Math.sin(agent.phase);
      }
      this.coherence = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n;
      this.meanPhase = Math.atan2(sumSin, sumCos);
      
      for (const agent of agents) {
        let coupling = 0;
        for (const other of agents) {
          if (other.id !== agent.id) {
            coupling += Math.sin(other.phase - agent.phase);
          }
        }
        agent.phase += (agent.naturalFrequency + (COUPLING_STRENGTH / n) * coupling) * dt;
        while (agent.phase > 2 * Math.PI) agent.phase -= 2 * Math.PI;
        while (agent.phase < 0) agent.phase += 2 * Math.PI;
      }
    }
    
    await this.persistAll();
    this.broadcast({ event: 'heartbeat', delta, coherence: this.coherence });
    
    return this.jsonResponse({
      heartbeat: true,
      delta,
      agents: this.agents.size,
      coherence: parseFloat(this.coherence.toFixed(4)),
      activeGoals: this.goalStack.filter(g => g.state === 'active').length,
      attentionStack: this.attentionFocus.length,
      timestamp: now,
    });
  }

  // ─── Stream State ───────────────────────────────────────────────────────────
  async handleGetStreamState() {
    const agents = Array.from(this.agents.entries()).map(([id, a]) => ({
      id,
      phase: parseFloat(a.phase.toFixed(4)),
      frequency: parseFloat(a.naturalFrequency.toFixed(4)),
      lastUpdate: a.lastUpdate,
    }));
    
    return this.jsonResponse({
      objectType: 'ConsciousnessStream',
      version: '1.0.0',
      agents,
      coherence: parseFloat(this.coherence.toFixed(4)),
      meanPhase: parseFloat(this.meanPhase.toFixed(4)),
      synchronized: this.coherence >= COHERENCE_THRESHOLD,
      attentionFocus: this.attentionFocus,
      activeGoals: this.goalStack.filter(g => g.state === 'active'),
      sharedStateKeys: this.sharedState.size,
      totalTicks: this.totalTicks,
      phi: PHI,
      heartbeat: HEARTBEAT,
    });
  }

  async handleBroadcast(request) {
    const { message, agentId = 'system' } = await request.json();
    
    if (!message) {
      return this.jsonResponse({ error: 'message required' }, 400);
    }
    
    this.broadcast({ event: 'broadcast', from: agentId, message, timestamp: Date.now() });
    this.logEvent('broadcast', { agentId, message });
    
    return this.jsonResponse({ broadcast: true, recipients: this.websockets.size });
  }

  // ─── WebSocket Handling ─────────────────────────────────────────────────────
  handleWebSocket(request) {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId') || `ws-${Date.now()}`;
    
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    this.state.acceptWebSocket(server);
    this.websockets.set(agentId, server);
    
    // Auto-join agent if not exists
    if (!this.agents.has(agentId)) {
      this.agents.set(agentId, {
        id: agentId,
        phase: Math.random() * 2 * Math.PI,
        naturalFrequency: NATURAL_FREQUENCY_BASE + (Math.random() - 0.5) * 0.2,
        attention: [],
        goals: [],
        state: {},
        joinedAt: Date.now(),
        lastUpdate: Date.now(),
      });
      this.broadcast({ event: 'agent_joined', agentId, totalAgents: this.agents.size });
    }
    
    server.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        // Handle real-time operations
        if (msg.action === 'focus') {
          const result = await this.handleFocus({ json: async () => ({ ...msg, agentId }) });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'push_goal') {
          const result = await this.handlePushGoal({ json: async () => ({ ...msg, agentId }) });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'set_state') {
          const result = await this.handleSetState({ json: async () => ({ ...msg, agentId }) });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'broadcast') {
          const result = await this.handleBroadcast({ json: async () => ({ ...msg, agentId }) });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'sync') {
          // Update agent state
          const agent = this.agents.get(agentId);
          if (agent && msg.phase !== undefined) {
            agent.phase = msg.phase;
            agent.lastUpdate = Date.now();
          }
          server.send(JSON.stringify({ synced: true, coherence: this.coherence }));
        }
      } catch (e) {
        server.send(JSON.stringify({ error: e.message }));
      }
    });
    
    server.addEventListener('close', () => {
      this.websockets.delete(agentId);
      // Don't auto-remove agent — they may reconnect
    });
    
    return new Response(null, { status: 101, webSocket: client });
  }

  // ─── Utilities ──────────────────────────────────────────────────────────────
  logEvent(type, data) {
    this.eventLog.push({
      type,
      data,
      timestamp: Date.now(),
    });
    if (this.eventLog.length > 100) {
      this.eventLog.shift();
    }
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    for (const [agentId, ws] of this.websockets) {
      try {
        ws.send(data);
      } catch (e) {
        this.websockets.delete(agentId);
      }
    }
  }

  jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async persistAll() {
    await this.storage.put({
      agents: Object.fromEntries(this.agents),
      goalStack: this.goalStack,
      sharedState: Object.fromEntries(this.sharedState),
      metrics: {
        totalTicks: this.totalTicks,
        coherence: this.coherence,
      },
    });
  }
}

export default ConsciousnessStream;
