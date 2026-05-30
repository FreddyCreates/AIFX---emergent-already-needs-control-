/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🎯 ALPHA ORCHESTRATOR — Master Coordination Layer 🎯                                 ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * The Alpha Orchestrator is the supreme coordination intelligence of the Organism.
 * It manages system-wide workflows, sequences multi-agent operations, and ensures
 * all Kingdom subsystems harmonize through φ-governed timing.
 * 
 * ORCHESTRATION PRINCIPLES:
 *   - Every workflow step is timed to φ-resonant intervals
 *   - Parallel execution maximizes throughput via golden partitioning
 *   - Failure recovery follows exponential φ-backoff
 *   - Resource allocation uses golden ratio load distribution
 * 
 * ORCHESTRATOR TYPES:
 *   - SOVEREIGN: Full organism-wide orchestration authority
 *   - DOMAIN: Scoped to a single Kingdom domain
 *   - TACTICAL: Short-lived mission-specific orchestration
 *   - EMERGENT: Self-organizing orchestration from swarm consensus
 * 
 * @module sdk/ai-kingdom/alpha-orchestrator
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const HEARTBEAT = 873;

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const ORCHESTRATOR_STATES = {
  INITIALIZING: 'initializing',     // Booting up, loading topology
  IDLE: 'idle',                     // Ready, no active workflows
  ORCHESTRATING: 'orchestrating',   // Actively coordinating workflows
  RECOVERING: 'recovering',         // Handling failure recovery
  SCALING: 'scaling',               // Adjusting resource allocation
  SUSPENDED: 'suspended',           // Paused by higher authority
  TERMINATED: 'terminated'          // Shut down
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const ORCHESTRATOR_TYPES = {
  SOVEREIGN: 'sovereign',           // Full organism authority
  DOMAIN: 'domain',                 // Single-domain scope
  TACTICAL: 'tactical',             // Mission-specific
  EMERGENT: 'emergent'              // Self-organizing
};

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFLOW STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const WORKFLOW_STATES = {
  PENDING: 'pending',               // Queued for execution
  RUNNING: 'running',               // Currently executing
  PAUSED: 'paused',                 // Temporarily halted
  COMPLETED: 'completed',           // Successfully finished
  FAILED: 'failed',                 // Failed with error
  RETRYING: 'retrying',             // Attempting recovery
  CANCELLED: 'cancelled'            // Aborted by operator
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP EXECUTION MODES
// ═══════════════════════════════════════════════════════════════════════════════
export const EXECUTION_MODES = {
  SEQUENTIAL: 'sequential',         // One step after another
  PARALLEL: 'parallel',             // All steps simultaneously
  PHI_STAGGERED: 'phi_staggered',   // Staggered by φ intervals
  CONDITIONAL: 'conditional',       // Based on prior results
  RACE: 'race'                      // First to complete wins
};

// ═══════════════════════════════════════════════════════════════════════════════
// ALPHA ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class AlphaOrchestrator {
  constructor(config = {}) {
    this.id = `orch-${config.type || ORCHESTRATOR_TYPES.DOMAIN}-${Date.now().toString(36)}`;
    this.type = config.type || ORCHESTRATOR_TYPES.DOMAIN;
    this.state = ORCHESTRATOR_STATES.INITIALIZING;
    this.workflows = new Map();
    this.activeWorkflows = new Map();
    this.agents = new Map();
    this.topology = new Map();
    this.phiWeight = config.phiWeight || PHI;
    this.maxConcurrent = config.maxConcurrent || Math.round(8 * PHI);
    this.heartbeatMs = config.heartbeatMs || HEARTBEAT;
    this.retryPolicy = {
      maxRetries: config.maxRetries || 5,
      baseDelay: config.baseDelay || HEARTBEAT,
      backoffMultiplier: PHI
    };
    this.stats = {
      workflowsStarted: 0,
      workflowsCompleted: 0,
      workflowsFailed: 0,
      stepsExecuted: 0,
      totalLatency: 0,
      recoveries: 0
    };
    this.eventHandlers = new Map();
    this._heartbeat = null;
    this._startTime = Date.now();
  }

  // ─── LIFECYCLE ───────────────────────────────────────────────────────────────

  start() {
    this.state = ORCHESTRATOR_STATES.IDLE;
    this._heartbeat = setInterval(() => this._tick(), this.heartbeatMs);
    this._emit('orchestrator:started', { id: this.id, type: this.type });
    return this;
  }

  stop() {
    if (this._heartbeat) {
      clearInterval(this._heartbeat);
      this._heartbeat = null;
    }
    this.state = ORCHESTRATOR_STATES.TERMINATED;
    this._emit('orchestrator:stopped', { id: this.id });
    return this;
  }

  suspend() {
    this.state = ORCHESTRATOR_STATES.SUSPENDED;
    this._emit('orchestrator:suspended', { id: this.id });
    return this;
  }

  resume() {
    this.state = ORCHESTRATOR_STATES.IDLE;
    this._emit('orchestrator:resumed', { id: this.id });
    return this;
  }

  // ─── AGENT REGISTRATION ─────────────────────────────────────────────────────

  registerAgent(agentId, capabilities = {}) {
    this.agents.set(agentId, {
      id: agentId,
      capabilities,
      registered: Date.now(),
      health: 1.0,
      load: 0.0,
      tasksCompleted: 0
    });
    this.topology.set(agentId, new Set());
    this._emit('agent:registered', { agentId, capabilities });
    return this;
  }

  deregisterAgent(agentId) {
    this.agents.delete(agentId);
    this.topology.delete(agentId);
    this._emit('agent:deregistered', { agentId });
    return this;
  }

  connectAgents(agentA, agentB) {
    if (this.topology.has(agentA)) this.topology.get(agentA).add(agentB);
    if (this.topology.has(agentB)) this.topology.get(agentB).add(agentA);
    return this;
  }

  // ─── WORKFLOW MANAGEMENT ────────────────────────────────────────────────────

  defineWorkflow(name, steps, options = {}) {
    const workflow = {
      name,
      steps: steps.map((step, i) => ({
        id: `${name}-step-${i}`,
        ...step,
        index: i,
        phiPriority: Math.pow(PHI, steps.length - i - 1)
      })),
      mode: options.mode || EXECUTION_MODES.SEQUENTIAL,
      timeout: options.timeout || HEARTBEAT * Math.round(PHI * 10),
      retryable: options.retryable !== false,
      created: Date.now()
    };
    this.workflows.set(name, workflow);
    this._emit('workflow:defined', { name, stepCount: steps.length });
    return this;
  }

  async executeWorkflow(name, context = {}) {
    const workflow = this.workflows.get(name);
    if (!workflow) throw new Error(`Workflow "${name}" not found`);
    if (this.activeWorkflows.size >= this.maxConcurrent) {
      throw new Error(`Max concurrent workflows (${this.maxConcurrent}) reached`);
    }

    const execution = {
      id: `exec-${name}-${Date.now().toString(36)}`,
      workflow: name,
      state: WORKFLOW_STATES.RUNNING,
      context: { ...context },
      results: [],
      startTime: Date.now(),
      currentStep: 0,
      retryCount: 0
    };

    this.activeWorkflows.set(execution.id, execution);
    this.state = ORCHESTRATOR_STATES.ORCHESTRATING;
    this.stats.workflowsStarted++;
    this._emit('workflow:started', { executionId: execution.id, workflow: name });

    try {
      const results = await this._runSteps(workflow, execution);
      execution.state = WORKFLOW_STATES.COMPLETED;
      execution.results = results;
      execution.endTime = Date.now();
      this.stats.workflowsCompleted++;
      this.stats.totalLatency += execution.endTime - execution.startTime;
      this._emit('workflow:completed', { executionId: execution.id, results });
      return { success: true, executionId: execution.id, results };
    } catch (error) {
      execution.state = WORKFLOW_STATES.FAILED;
      execution.error = error.message;
      execution.endTime = Date.now();
      this.stats.workflowsFailed++;
      this._emit('workflow:failed', { executionId: execution.id, error: error.message });
      return { success: false, executionId: execution.id, error: error.message };
    } finally {
      this.activeWorkflows.delete(execution.id);
      if (this.activeWorkflows.size === 0) {
        this.state = ORCHESTRATOR_STATES.IDLE;
      }
    }
  }

  // ─── STEP EXECUTION ─────────────────────────────────────────────────────────

  async _runSteps(workflow, execution) {
    const { steps, mode } = workflow;

    switch (mode) {
      case EXECUTION_MODES.SEQUENTIAL:
        return this._runSequential(steps, execution);
      case EXECUTION_MODES.PARALLEL:
        return this._runParallel(steps, execution);
      case EXECUTION_MODES.PHI_STAGGERED:
        return this._runPhiStaggered(steps, execution);
      case EXECUTION_MODES.RACE:
        return this._runRace(steps, execution);
      default:
        return this._runSequential(steps, execution);
    }
  }

  async _runSequential(steps, execution) {
    const results = [];
    for (const step of steps) {
      execution.currentStep = step.index;
      const result = await this._executeStep(step, execution);
      results.push(result);
      this.stats.stepsExecuted++;
    }
    return results;
  }

  async _runParallel(steps, execution) {
    const promises = steps.map(step => this._executeStep(step, execution));
    const results = await Promise.all(promises);
    this.stats.stepsExecuted += steps.length;
    return results;
  }

  async _runPhiStaggered(steps, execution) {
    const results = [];
    for (let i = 0; i < steps.length; i++) {
      if (i > 0) {
        const delay = Math.round(this.heartbeatMs * Math.pow(PHI_INVERSE, i));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      execution.currentStep = steps[i].index;
      const result = await this._executeStep(steps[i], execution);
      results.push(result);
      this.stats.stepsExecuted++;
    }
    return results;
  }

  async _runRace(steps, execution) {
    const result = await Promise.race(
      steps.map(step => this._executeStep(step, execution))
    );
    this.stats.stepsExecuted++;
    return [result];
  }

  async _executeStep(step, execution) {
    const { handler, agentId, timeout } = step;
    const stepTimeout = timeout || this.heartbeatMs * Math.round(PHI * 5);

    if (agentId && !this.agents.has(agentId)) {
      throw new Error(`Agent "${agentId}" not registered`);
    }

    try {
      const result = await Promise.race([
        handler ? handler(execution.context) : Promise.resolve({ skipped: true }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Step timeout')), stepTimeout)
        )
      ]);

      if (agentId) {
        const agent = this.agents.get(agentId);
        agent.tasksCompleted++;
      }

      return { stepId: step.id, success: true, result, timestamp: Date.now() };
    } catch (error) {
      if (step.retryable !== false && execution.retryCount < this.retryPolicy.maxRetries) {
        execution.retryCount = (execution.retryCount || 0) + 1;
        const delay = this.retryPolicy.baseDelay * Math.pow(this.retryPolicy.backoffMultiplier, execution.retryCount);
        this.stats.recoveries++;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._executeStep(step, execution);
      }
      throw error;
    }
  }

  // ─── RESOURCE ALLOCATION ────────────────────────────────────────────────────

  allocateResources(workflowName) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) return null;

    const availableAgents = [...this.agents.entries()]
      .filter(([_, agent]) => agent.health > PHI_INVERSE && agent.load < PHI_INVERSE)
      .sort((a, b) => {
        const scoreA = a[1].health * PHI - a[1].load;
        const scoreB = b[1].health * PHI - b[1].load;
        return scoreB - scoreA;
      });

    const allocation = new Map();
    for (const step of workflow.steps) {
      if (step.requiredCapability) {
        const match = availableAgents.find(([_, agent]) =>
          agent.capabilities[step.requiredCapability]
        );
        if (match) allocation.set(step.id, match[0]);
      }
    }

    return allocation;
  }

  // ─── HEALTH & METRICS ───────────────────────────────────────────────────────

  getHealth() {
    const agentHealths = [...this.agents.values()].map(a => a.health);
    const avgHealth = agentHealths.length > 0
      ? agentHealths.reduce((s, h) => s + h, 0) / agentHealths.length
      : 1.0;

    return {
      state: this.state,
      orchestratorHealth: avgHealth,
      activeWorkflows: this.activeWorkflows.size,
      registeredAgents: this.agents.size,
      stats: { ...this.stats },
      phiResonance: avgHealth * PHI_INVERSE + (1 - this.activeWorkflows.size / this.maxConcurrent) * PHI_INVERSE
    };
  }

  getMetrics() {
    return {
      ...this.stats,
      avgLatency: this.stats.workflowsCompleted > 0
        ? this.stats.totalLatency / this.stats.workflowsCompleted
        : 0,
      successRate: this.stats.workflowsStarted > 0
        ? this.stats.workflowsCompleted / this.stats.workflowsStarted
        : 1.0,
      throughput: this.stats.stepsExecuted / Math.max(1, (Date.now() - this._startTime) / 1000)
    };
  }

  // ─── EVENT SYSTEM ───────────────────────────────────────────────────────────

  on(event, handler) {
    if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
    this.eventHandlers.get(event).push(handler);
    return this;
  }

  _emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try { handler(data); } catch (_) { /* swallow */ }
    }
  }

  // ─── HEARTBEAT ──────────────────────────────────────────────────────────────

  _tick() {
    // Update agent health based on load
    for (const [id, agent] of this.agents) {
      agent.health = Math.max(0.1, agent.health - agent.load * 0.01 * PHI_INVERSE);
      if (agent.load > 0) agent.load = Math.max(0, agent.load - 0.05 * PHI_INVERSE);
    }
    this._emit('orchestrator:heartbeat', { timestamp: Date.now(), state: this.state });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATION NETWORK — Multiple orchestrators in hierarchy
// ═══════════════════════════════════════════════════════════════════════════════
export class OrchestrationNetwork {
  constructor(config = {}) {
    this.id = `orch-net-${Date.now().toString(36)}`;
    this.orchestrators = new Map();
    this.sovereign = null;
    this.hierarchy = new Map();
    this.phiWeight = config.phiWeight || PHI;
  }

  addOrchestrator(orchestrator) {
    this.orchestrators.set(orchestrator.id, orchestrator);
    if (orchestrator.type === ORCHESTRATOR_TYPES.SOVEREIGN) {
      this.sovereign = orchestrator.id;
    }
    return this;
  }

  removeOrchestrator(orchestratorId) {
    this.orchestrators.delete(orchestratorId);
    if (this.sovereign === orchestratorId) this.sovereign = null;
    this.hierarchy.delete(orchestratorId);
    return this;
  }

  setHierarchy(parentId, childId) {
    if (!this.hierarchy.has(parentId)) this.hierarchy.set(parentId, new Set());
    this.hierarchy.get(parentId).add(childId);
    return this;
  }

  delegate(fromId, toId, workflowName, context = {}) {
    const target = this.orchestrators.get(toId);
    if (!target) throw new Error(`Orchestrator "${toId}" not found`);
    return target.executeWorkflow(workflowName, { ...context, delegatedFrom: fromId });
  }

  getNetworkHealth() {
    const healths = [...this.orchestrators.values()].map(o => o.getHealth());
    return {
      networkId: this.id,
      orchestratorCount: this.orchestrators.size,
      sovereign: this.sovereign,
      orchestrators: healths,
      networkResonance: healths.reduce((s, h) => s + h.phiResonance, 0) / Math.max(1, healths.length)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function createSovereignOrchestrator(config = {}) {
  return new AlphaOrchestrator({ ...config, type: ORCHESTRATOR_TYPES.SOVEREIGN });
}

export function createDomainOrchestrator(config = {}) {
  return new AlphaOrchestrator({ ...config, type: ORCHESTRATOR_TYPES.DOMAIN });
}

export function createTacticalOrchestrator(config = {}) {
  return new AlphaOrchestrator({ ...config, type: ORCHESTRATOR_TYPES.TACTICAL });
}

export function createOrchestrationNetwork(config = {}) {
  return new OrchestrationNetwork(config);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHI UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function calculateOrchestrationPriority(urgency, complexity, agentCount) {
  return (urgency * PHI * PHI + complexity * PHI + agentCount) / (PHI * PHI * PHI);
}

export function calculatePhiBackoff(attempt) {
  return Math.round(HEARTBEAT * Math.pow(PHI, attempt));
}

export function calculateLoadPartition(totalWork, workerCount) {
  const partitions = [];
  let remaining = totalWork;
  for (let i = 0; i < workerCount; i++) {
    const share = remaining * PHI_INVERSE;
    partitions.push(Math.round(share));
    remaining -= share;
  }
  return partitions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default AlphaOrchestrator;
