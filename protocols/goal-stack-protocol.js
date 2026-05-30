/**
 * PROTO-219: Goal Stack Protocol (GSP)
 * Hierarchical goal management with phi-weighted priority.
 * 
 * Goals are organized in a priority stack with sub-goal decomposition.
 * Supports goal adoption, completion, abandonment, and conflict resolution.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const GOAL_STATES = ['pending', 'active', 'blocked', 'completed', 'abandoned'];

class GoalStackProtocol {
  constructor() {
    this.goals = new Map();
    this.stack = [];  // Active goal stack (LIFO)
    this.completedGoals = [];
    this.abandonedGoals = [];
    this.totalGoals = 0;
  }

  createGoal(config) {
    const id = config.id || `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const goal = {
      id,
      name: config.name || id,
      description: config.description || '',
      priority: config.priority ?? 1.0,
      state: 'pending',
      parentId: config.parentId || null,
      subGoals: [],
      preconditions: config.preconditions || [],
      effects: config.effects || [],
      createdAt: Date.now(),
      activatedAt: null,
      completedAt: null,
      progress: 0,
    };
    
    // Link to parent if specified
    if (goal.parentId && this.goals.has(goal.parentId)) {
      const parent = this.goals.get(goal.parentId);
      parent.subGoals.push(id);
    }
    
    this.goals.set(id, goal);
    this.totalGoals++;
    
    return id;
  }

  adopt(goalId) {
    const goal = this.goals.get(goalId);
    if (!goal) return null;
    
    // Check preconditions
    const preconditionsMet = goal.preconditions.every(p => this.checkCondition(p));
    if (!preconditionsMet) {
      goal.state = 'blocked';
      return { adopted: false, reason: 'Preconditions not met', goalId };
    }
    
    goal.state = 'active';
    goal.activatedAt = Date.now();
    
    // Push to stack (higher priority = higher position)
    let insertIndex = this.stack.length;
    for (let i = 0; i < this.stack.length; i++) {
      const stackGoal = this.goals.get(this.stack[i]);
      if (stackGoal && goal.priority * PHI > stackGoal.priority) {
        insertIndex = i;
        break;
      }
    }
    this.stack.splice(insertIndex, 0, goalId);
    
    return { adopted: true, goalId, stackPosition: insertIndex };
  }

  checkCondition(condition) {
    // Simplified condition checking
    if (typeof condition === 'function') return condition();
    if (typeof condition === 'boolean') return condition;
    if (condition.goalCompleted) {
      const goal = this.goals.get(condition.goalCompleted);
      return goal && goal.state === 'completed';
    }
    return true;
  }

  updateProgress(goalId, progress) {
    const goal = this.goals.get(goalId);
    if (!goal) return null;
    
    goal.progress = Math.max(0, Math.min(1, progress));
    
    if (goal.progress >= 1) {
      return this.complete(goalId);
    }
    
    return { goalId, progress: goal.progress };
  }

  complete(goalId) {
    const goal = this.goals.get(goalId);
    if (!goal) return null;
    
    goal.state = 'completed';
    goal.completedAt = Date.now();
    goal.progress = 1;
    
    // Remove from stack
    const stackIndex = this.stack.indexOf(goalId);
    if (stackIndex > -1) {
      this.stack.splice(stackIndex, 1);
    }
    
    // Record
    this.completedGoals.push({
      id: goalId,
      name: goal.name,
      completedAt: goal.completedAt,
      duration: goal.completedAt - (goal.activatedAt || goal.createdAt),
    });
    if (this.completedGoals.length > 100) this.completedGoals.shift();
    
    // Check if parent goal should be updated
    if (goal.parentId) {
      this.updateParentProgress(goal.parentId);
    }
    
    return { completed: true, goalId, duration: goal.completedAt - goal.activatedAt };
  }

  updateParentProgress(parentId) {
    const parent = this.goals.get(parentId);
    if (!parent || parent.subGoals.length === 0) return;
    
    let completedCount = 0;
    for (const subId of parent.subGoals) {
      const sub = this.goals.get(subId);
      if (sub && sub.state === 'completed') {
        completedCount++;
      }
    }
    
    parent.progress = completedCount / parent.subGoals.length;
    if (parent.progress >= 1) {
      this.complete(parentId);
    }
  }

  abandon(goalId, reason = '') {
    const goal = this.goals.get(goalId);
    if (!goal) return null;
    
    goal.state = 'abandoned';
    
    // Remove from stack
    const stackIndex = this.stack.indexOf(goalId);
    if (stackIndex > -1) {
      this.stack.splice(stackIndex, 1);
    }
    
    this.abandonedGoals.push({
      id: goalId,
      name: goal.name,
      reason,
      abandonedAt: Date.now(),
    });
    if (this.abandonedGoals.length > 50) this.abandonedGoals.shift();
    
    return { abandoned: true, goalId, reason };
  }

  getCurrentGoal() {
    if (this.stack.length === 0) return null;
    return this.goals.get(this.stack[0]);
  }

  getStack() {
    return this.stack.map(id => {
      const goal = this.goals.get(id);
      return {
        id,
        name: goal?.name,
        priority: goal?.priority,
        progress: goal?.progress,
        state: goal?.state,
      };
    });
  }

  getMetrics() {
    let activeCount = 0;
    let blockedCount = 0;
    let pendingCount = 0;
    
    for (const goal of this.goals.values()) {
      if (goal.state === 'active') activeCount++;
      else if (goal.state === 'blocked') blockedCount++;
      else if (goal.state === 'pending') pendingCount++;
    }
    
    return {
      totalGoals: this.totalGoals,
      activeCount,
      blockedCount,
      pendingCount,
      completedCount: this.completedGoals.length,
      abandonedCount: this.abandonedGoals.length,
      stackDepth: this.stack.length,
      currentGoal: this.getCurrentGoal()?.name || null,
      stack: this.getStack(),
      recentCompleted: this.completedGoals.slice(-5),
      goalStates: GOAL_STATES,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { GoalStackProtocol, GOAL_STATES };
export default GoalStackProtocol;
