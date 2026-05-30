import crypto from 'node:crypto';

/**
 * @typedef {Object} Agent
 * @property {string} agentId
 * @property {string} role
 * @property {string[]} skills
 * @property {'available'|'busy'|'offline'} availability
 * @property {Array<{ taskId: string, assignedAt: number }>} currentTasks
 * @property {{ completed: number, escalated: number }} stats
 */

/**
 * @typedef {Object} Task
 * @property {string} [taskId]
 * @property {string} type
 * @property {string[]} requiredSkills
 * @property {string} priority - 'low' | 'medium' | 'high' | 'critical'
 */

const PRIORITY_ORDER = { low: 0, medium: 1, high: 2, critical: 3 };

/**
 * WorkforceRouter — assigns tasks to the best available agent based on skills,
 * load, and priority. Supports rebalancing and escalation.
 */
export class WorkforceRouter {
  constructor() {
    /** @type {Map<string, Agent>} */
    this._agents = new Map();
    /** @type {Map<string, { task: Task, agentId: string, assignedAt: number }>} */
    this._assignments = new Map();
  }

  /**
   * Registers an agent/worker in the workforce.
   * @param {string} agentId
   * @param {string} role - Agent's role (e.g. 'engineer', 'reviewer', 'deployer')
   * @param {string[]} skills - Skills the agent possesses
   * @param {'available'|'busy'|'offline'} [availability='available']
   * @returns {{ agentId: string, registered: boolean }}
   */
  registerAgent(agentId, role, skills, availability = 'available') {
    if (!agentId || !role) throw new Error('agentId and role are required');

    this._agents.set(agentId, {
      agentId,
      role,
      skills: Array.isArray(skills) ? [...skills] : [],
      availability,
      currentTasks: [],
      stats: { completed: 0, escalated: 0 },
    });

    return { agentId, registered: true };
  }

  /**
   * Assigns a task to the best available agent based on skill overlap and
   * current load. Higher-priority tasks prefer less-loaded agents.
   * @param {Task} task
   * @returns {{ taskId: string, agentId: string, assignedAt: number } | null}
   */
  assignTask(task) {
    if (!task || !Array.isArray(task.requiredSkills)) {
      throw new Error('task.requiredSkills must be an array');
    }

    const taskId = task.taskId ?? crypto.randomUUID();
    const candidates = this._scoreCandidates(task);

    if (candidates.length === 0) return null;

    const best = candidates[0];
    const agent = this._agents.get(best.agentId);
    const assignedAt = Date.now();

    agent.currentTasks.push({ taskId, assignedAt });
    if (agent.currentTasks.length > 0) agent.availability = 'busy';

    this._assignments.set(taskId, { task: { ...task, taskId }, agentId: best.agentId, assignedAt });

    return { taskId, agentId: best.agentId, assignedAt };
  }

  /**
   * Redistributes tasks across the workforce to balance load.
   * Moves tasks from over-loaded agents to under-loaded ones when skill
   * requirements still match.
   * @returns {{ rebalanced: number }}
   */
  rebalance() {
    const agents = Array.from(this._agents.values()).filter(
      (a) => a.availability !== 'offline',
    );
    if (agents.length < 2) return { rebalanced: 0 };

    const avgLoad =
      agents.reduce((sum, a) => sum + a.currentTasks.length, 0) / agents.length;

    let rebalanced = 0;

    // Find overloaded agents (above average) and underloaded ones
    const overloaded = agents
      .filter((a) => a.currentTasks.length > Math.ceil(avgLoad))
      .sort((a, b) => b.currentTasks.length - a.currentTasks.length);

    const underloaded = agents
      .filter((a) => a.currentTasks.length < Math.floor(avgLoad))
      .sort((a, b) => a.currentTasks.length - b.currentTasks.length);

    for (const donor of overloaded) {
      while (
        donor.currentTasks.length > Math.ceil(avgLoad) &&
        underloaded.length > 0
      ) {
        const taskEntry = donor.currentTasks[donor.currentTasks.length - 1];
        const assignment = this._assignments.get(taskEntry.taskId);
        if (!assignment) break;

        // Find a suitable recipient
        const recipientIdx = underloaded.findIndex((r) => {
          const required = assignment.task.requiredSkills ?? [];
          return required.every((s) => r.skills.includes(s));
        });

        if (recipientIdx === -1) break;

        const recipient = underloaded[recipientIdx];

        // Move the task
        donor.currentTasks.pop();
        recipient.currentTasks.push(taskEntry);
        assignment.agentId = recipient.agentId;
        rebalanced += 1;

        // Update availability
        if (donor.currentTasks.length === 0) donor.availability = 'available';
        recipient.availability = 'busy';

        // Remove recipient if it reached average
        if (recipient.currentTasks.length >= Math.floor(avgLoad)) {
          underloaded.splice(recipientIdx, 1);
        }
      }
    }

    return { rebalanced };
  }

  /**
   * Returns full workforce status — all agents, current tasks, utilization.
   * @returns {Array<{ agentId: string, role: string, availability: string, taskCount: number, skills: string[], stats: object }>}
   */
  getWorkforceStatus() {
    return Array.from(this._agents.values()).map((a) => ({
      agentId: a.agentId,
      role: a.role,
      availability: a.availability,
      taskCount: a.currentTasks.length,
      skills: [...a.skills],
      stats: { ...a.stats },
    }));
  }

  /**
   * Escalates a task to a higher-priority agent — finds an agent with a
   * superset of skills and fewer current tasks.
   * @param {string} taskId
   * @param {string} reason
   * @returns {{ taskId: string, previousAgent: string, newAgent: string, reason: string } | null}
   */
  escalate(taskId, reason) {
    const assignment = this._assignments.get(taskId);
    if (!assignment) throw new Error(`Unknown task: ${taskId}`);

    const currentAgent = this._agents.get(assignment.agentId);
    const requiredSkills = assignment.task.requiredSkills ?? [];

    // Find a better agent — one who has all required skills, isn't offline,
    // and has fewer tasks than the current agent
    let bestCandidate = null;

    for (const agent of this._agents.values()) {
      if (agent.agentId === assignment.agentId) continue;
      if (agent.availability === 'offline') continue;
      if (!requiredSkills.every((s) => agent.skills.includes(s))) continue;

      // Prefer agents with more total skills (senior) and less load
      if (
        !bestCandidate ||
        agent.skills.length > bestCandidate.skills.length ||
        (agent.skills.length === bestCandidate.skills.length &&
          agent.currentTasks.length < bestCandidate.currentTasks.length)
      ) {
        bestCandidate = agent;
      }
    }

    if (!bestCandidate) return null;

    // Move task
    currentAgent.currentTasks = currentAgent.currentTasks.filter(
      (t) => t.taskId !== taskId,
    );
    if (currentAgent.currentTasks.length === 0) {
      currentAgent.availability = 'available';
    }
    currentAgent.stats.escalated += 1;

    const assignedAt = Date.now();
    bestCandidate.currentTasks.push({ taskId, assignedAt });
    bestCandidate.availability = 'busy';

    assignment.agentId = bestCandidate.agentId;
    assignment.assignedAt = assignedAt;

    return {
      taskId,
      previousAgent: currentAgent.agentId,
      newAgent: bestCandidate.agentId,
      reason,
    };
  }

  /* ---- internal ---- */

  /**
   * Scores and ranks candidate agents for a task.
   * @param {Task} task
   * @returns {Array<{ agentId: string, score: number }>}
   * @private
   */
  _scoreCandidates(task) {
    const results = [];

    for (const agent of this._agents.values()) {
      if (agent.availability === 'offline') continue;

      const matched = task.requiredSkills.filter((s) =>
        agent.skills.includes(s),
      );
      if (matched.length === 0) continue;

      const coverage = matched.length / task.requiredSkills.length;
      const loadPenalty = agent.currentTasks.length * 0.5;
      const priorityBonus = (PRIORITY_ORDER[task.priority] ?? 1) * 0.25;

      const score = coverage * 10 - loadPenalty + priorityBonus;
      results.push({ agentId: agent.agentId, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results;
  }
}

export default WorkforceRouter;
