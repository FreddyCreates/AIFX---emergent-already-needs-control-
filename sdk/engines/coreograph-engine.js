/**
 * COREOGRAPH ENGINE — Orchestration Physics
 * 
 * The foundational "physics" of coordination in the Civitas system.
 * All agents use COREOGRAPH for orchestration, messaging, and wiring.
 * 
 * Features:
 *   - Agent registration and lifecycle management
 *   - Event bus for inter-agent communication
 *   - Message routing with phi-weighted priority
 *   - Workflow orchestration
 *   - Health monitoring and recovery
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// Message priorities (phi-weighted)
const PRIORITY = {
  CRITICAL: 0,  // weight = PHI^4 = 6.85
  HIGH: 1,      // weight = PHI^3 = 4.24
  NORMAL: 2,    // weight = PHI^2 = 2.62
  LOW: 3,       // weight = PHI^1 = 1.62
  BACKGROUND: 4, // weight = PHI^0 = 1.0
};

class CoreographEngine {
  constructor() {
    // Agent registry
    this.agents = new Map();
    
    // Event bus
    this.eventHandlers = new Map();
    
    // Message queue (priority queue)
    this.messageQueue = [];
    
    // Workflows
    this.workflows = new Map();
    this.activeWorkflows = new Map();
    
    // Health tracking
    this.healthStatus = new Map();
    this.healthCheckInterval = null;
    
    // Statistics
    this.stats = {
      messagesRouted: 0,
      eventsEmitted: 0,
      workflowsCompleted: 0,
      agentsRegistered: 0,
    };
  }

  // ── Agent Registry ─────────────────────────────────────────────────────

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agentId, agent, config = {}) {
    this.agents.set(agentId, {
      instance: agent,
      config: {
        priority: config.priority ?? PRIORITY.NORMAL,
        healthCheckInterval: config.healthCheckInterval ?? 10,  // beats
        autoRestart: config.autoRestart ?? true,
        ...config,
      },
      status: 'registered',
      registeredAt: Date.now(),
      lastActivity: Date.now(),
    });
    
    this.healthStatus.set(agentId, {
      score: 100,
      lastCheck: Date.now(),
      failures: 0,
    });
    
    this.stats.agentsRegistered++;
    
    console.log(`[COREOGRAPH] Agent registered: ${agentId}`);
    this.emit('agent:registered', { agentId, config });
    
    return agentId;
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    // Call shutdown if available
    if (typeof agent.instance.shutdown === 'function') {
      agent.instance.shutdown();
    }
    
    this.agents.delete(agentId);
    this.healthStatus.delete(agentId);
    
    this.emit('agent:unregistered', { agentId });
    
    return true;
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId) {
    const entry = this.agents.get(agentId);
    return entry ? entry.instance : null;
  }

  /**
   * Get all registered agents
   */
  getAllAgents() {
    const result = [];
    for (const [id, entry] of this.agents) {
      result.push({
        id,
        status: entry.status,
        health: this.healthStatus.get(id)?.score ?? 0,
        registeredAt: entry.registeredAt,
        lastActivity: entry.lastActivity,
      });
    }
    return result;
  }

  // ── Event Bus ──────────────────────────────────────────────────────────

  /**
   * Subscribe to an event
   */
  on(eventName, handler, priority = PRIORITY.NORMAL) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    
    const handlerId = `handler-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    this.eventHandlers.get(eventName).push({
      id: handlerId,
      handler,
      priority,
    });
    
    // Sort by phi-weighted priority
    this.eventHandlers.get(eventName).sort((a, b) => {
      return Math.pow(PHI, 4 - a.priority) - Math.pow(PHI, 4 - b.priority);
    });
    
    return handlerId;
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName, handlerId) {
    const handlers = this.eventHandlers.get(eventName);
    if (!handlers) return false;
    
    const index = handlers.findIndex(h => h.id === handlerId);
    if (index >= 0) {
      handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Emit an event
   */
  async emit(eventName, data = {}) {
    const handlers = this.eventHandlers.get(eventName);
    if (!handlers || handlers.length === 0) return;
    
    this.stats.eventsEmitted++;
    
    const event = {
      name: eventName,
      data,
      timestamp: Date.now(),
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    
    // Execute handlers in priority order
    for (const { handler } of handlers) {
      try {
        await handler(event);
      } catch (e) {
        console.error(`[COREOGRAPH] Event handler error for ${eventName}:`, e.message);
      }
    }
  }

  // ── Message Routing ────────────────────────────────────────────────────

  /**
   * Send message to an agent
   */
  async send(targetAgentId, message, priority = PRIORITY.NORMAL) {
    const target = this.agents.get(targetAgentId);
    if (!target) {
      throw new Error(`Agent not found: ${targetAgentId}`);
    }
    
    const envelope = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      target: targetAgentId,
      message,
      priority,
      timestamp: Date.now(),
      phiWeight: Math.pow(PHI, 4 - priority),
    };
    
    // Add to priority queue
    this.messageQueue.push(envelope);
    this.messageQueue.sort((a, b) => b.phiWeight - a.phiWeight);
    
    this.stats.messagesRouted++;
    
    // Process immediately if high priority
    if (priority <= PRIORITY.HIGH) {
      return await this.processNextMessage();
    }
    
    return envelope.id;
  }

  /**
   * Broadcast message to all agents
   */
  async broadcast(message, priority = PRIORITY.NORMAL) {
    const results = [];
    for (const agentId of this.agents.keys()) {
      results.push(await this.send(agentId, message, priority));
    }
    return results;
  }

  /**
   * Process next message in queue
   */
  async processNextMessage() {
    if (this.messageQueue.length === 0) return null;
    
    const envelope = this.messageQueue.shift();
    const target = this.agents.get(envelope.target);
    
    if (!target) {
      console.error(`[COREOGRAPH] Target agent not found: ${envelope.target}`);
      return null;
    }
    
    // Update activity timestamp
    target.lastActivity = Date.now();
    
    // Deliver message
    if (typeof target.instance.receive === 'function') {
      try {
        return await target.instance.receive(envelope.message);
      } catch (e) {
        console.error(`[COREOGRAPH] Message delivery failed to ${envelope.target}:`, e.message);
        this.emit('message:failed', { envelope, error: e.message });
      }
    }
    
    return null;
  }

  /**
   * Process all pending messages
   */
  async processAllMessages() {
    const results = [];
    while (this.messageQueue.length > 0) {
      results.push(await this.processNextMessage());
    }
    return results;
  }

  // ── Workflow Orchestration ─────────────────────────────────────────────

  /**
   * Define a workflow
   */
  defineWorkflow(workflowId, steps) {
    this.workflows.set(workflowId, {
      id: workflowId,
      steps: steps.map((step, index) => ({
        ...step,
        index,
        status: 'pending',
      })),
      createdAt: Date.now(),
    });
    
    return workflowId;
  }

  /**
   * Start a workflow
   */
  async startWorkflow(workflowId, context = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    const instanceId = `${workflowId}-${Date.now()}`;
    
    const instance = {
      workflowId,
      instanceId,
      context,
      currentStep: 0,
      status: 'running',
      startedAt: Date.now(),
      completedAt: null,
      results: [],
    };
    
    this.activeWorkflows.set(instanceId, instance);
    this.emit('workflow:started', { instanceId, workflowId });
    
    // Execute workflow steps
    await this.executeWorkflowStep(instanceId);
    
    return instanceId;
  }

  /**
   * Execute current workflow step
   */
  async executeWorkflowStep(instanceId) {
    const instance = this.activeWorkflows.get(instanceId);
    if (!instance || instance.status !== 'running') return;
    
    const workflow = this.workflows.get(instance.workflowId);
    const step = workflow.steps[instance.currentStep];
    
    if (!step) {
      // Workflow complete
      instance.status = 'completed';
      instance.completedAt = Date.now();
      this.stats.workflowsCompleted++;
      this.emit('workflow:completed', { instanceId, results: instance.results });
      return;
    }
    
    this.emit('workflow:step:started', { instanceId, step: step.index, name: step.name });
    
    try {
      // Execute step
      let result;
      if (step.agent) {
        // Route to agent
        result = await this.send(step.agent, {
          action: step.action,
          payload: { ...step.payload, ...instance.context },
        }, step.priority ?? PRIORITY.NORMAL);
      } else if (step.handler) {
        // Execute handler function
        result = await step.handler(instance.context);
      }
      
      instance.results.push({ step: step.index, result, status: 'success' });
      instance.currentStep++;
      
      // Continue to next step
      await this.executeWorkflowStep(instanceId);
      
    } catch (e) {
      instance.results.push({ step: step.index, error: e.message, status: 'failed' });
      
      if (step.continueOnError) {
        instance.currentStep++;
        await this.executeWorkflowStep(instanceId);
      } else {
        instance.status = 'failed';
        this.emit('workflow:failed', { instanceId, error: e.message, step: step.index });
      }
    }
  }

  /**
   * Get workflow instance status
   */
  getWorkflowStatus(instanceId) {
    return this.activeWorkflows.get(instanceId);
  }

  // ── Health Monitoring ──────────────────────────────────────────────────

  /**
   * Start health monitoring
   */
  startHealthMonitoring(intervalMs = 5000) {
    if (this.healthCheckInterval) return;
    
    this.healthCheckInterval = setInterval(() => {
      this.checkAllAgentsHealth();
    }, intervalMs);
    
    console.log(`[COREOGRAPH] Health monitoring started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Check health of all agents
   */
  async checkAllAgentsHealth() {
    for (const [agentId] of this.agents) {
      await this.checkAgentHealth(agentId);
    }
  }

  /**
   * Check health of single agent
   */
  async checkAgentHealth(agentId) {
    const entry = this.agents.get(agentId);
    const health = this.healthStatus.get(agentId);
    
    if (!entry || !health) return;
    
    let score = 100;
    
    // Check if agent has health method
    if (typeof entry.instance.getHealth === 'function') {
      try {
        const agentHealth = await entry.instance.getHealth();
        score = agentHealth.score ?? agentHealth ?? 100;
      } catch (e) {
        health.failures++;
        score = Math.max(0, health.score - 10 * PHI);
      }
    }
    
    // Check activity (phi-decay)
    const inactiveMs = Date.now() - entry.lastActivity;
    const inactiveBeats = inactiveMs / 873;
    const activityPenalty = Math.min(50, inactiveBeats * 0.1 * PHI_INV);
    score -= activityPenalty;
    
    // Update health
    health.score = Math.max(0, Math.min(100, score));
    health.lastCheck = Date.now();
    
    // Emit health event
    if (health.score < 50) {
      this.emit('agent:unhealthy', { agentId, health: health.score });
      
      // Auto-restart if configured
      if (entry.config.autoRestart && typeof entry.instance.restart === 'function') {
        console.log(`[COREOGRAPH] Auto-restarting unhealthy agent: ${agentId}`);
        await entry.instance.restart();
      }
    }
    
    return health;
  }

  /**
   * Get health status for agent
   */
  getAgentHealth(agentId) {
    return this.healthStatus.get(agentId);
  }

  // ── Wiring (Agent Connections) ─────────────────────────────────────────

  /**
   * Wire two agents together (one-way)
   * Source agent's output feeds into target agent's input
   */
  wire(sourceAgentId, targetAgentId, eventName = 'output') {
    const source = this.getAgent(sourceAgentId);
    const target = this.getAgent(targetAgentId);
    
    if (!source || !target) {
      throw new Error(`Cannot wire: agent not found`);
    }
    
    // Subscribe to source's events and forward to target
    const handlerId = this.on(`${sourceAgentId}:${eventName}`, async (event) => {
      await this.send(targetAgentId, event.data, PRIORITY.HIGH);
    });
    
    console.log(`[COREOGRAPH] Wired: ${sourceAgentId} → ${targetAgentId} (on ${eventName})`);
    
    return handlerId;
  }

  /**
   * Wire multiple agents in a chain
   */
  wireChain(agentIds, eventName = 'output') {
    const handlers = [];
    for (let i = 0; i < agentIds.length - 1; i++) {
      handlers.push(this.wire(agentIds[i], agentIds[i + 1], eventName));
    }
    return handlers;
  }

  // ── Status & Utilities ─────────────────────────────────────────────────

  /**
   * Get orchestrator status
   */
  getStatus() {
    return {
      agents: this.agents.size,
      eventHandlers: Array.from(this.eventHandlers.values()).reduce((sum, h) => sum + h.length, 0),
      pendingMessages: this.messageQueue.length,
      activeWorkflows: this.activeWorkflows.size,
      healthMonitoring: !!this.healthCheckInterval,
      stats: { ...this.stats },
    };
  }

  /**
   * Reset the orchestrator
   */
  reset() {
    // Shutdown all agents
    for (const agentId of this.agents.keys()) {
      this.unregisterAgent(agentId);
    }
    
    this.agents.clear();
    this.eventHandlers.clear();
    this.messageQueue = [];
    this.workflows.clear();
    this.activeWorkflows.clear();
    this.healthStatus.clear();
    this.stopHealthMonitoring();
    
    this.stats = {
      messagesRouted: 0,
      eventsEmitted: 0,
      workflowsCompleted: 0,
      agentsRegistered: 0,
    };
  }
}

// Export singleton and class
const coreographEngine = new CoreographEngine();

export { CoreographEngine, coreographEngine, PRIORITY };
export default coreographEngine;
