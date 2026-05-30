const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('GoalStackProtocol', () => {
  let GoalStackProtocol;
  let GOAL_STATES;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/goal-stack-protocol.js');
    GoalStackProtocol = module.GoalStackProtocol;
    GOAL_STATES = module.GOAL_STATES;
    protocol = new GoalStackProtocol();
  });

  describe('constructor', () => {
    it('should initialize empty goals map', () => {
      assert.equal(protocol.goals.size, 0);
    });

    it('should initialize empty stack', () => {
      assert.deepEqual(protocol.stack, []);
    });

    it('should initialize empty completedGoals', () => {
      assert.deepEqual(protocol.completedGoals, []);
    });

    it('should initialize empty abandonedGoals', () => {
      assert.deepEqual(protocol.abandonedGoals, []);
    });

    it('should initialize totalGoals to zero', () => {
      assert.equal(protocol.totalGoals, 0);
    });
  });

  describe('createGoal()', () => {
    it('should add goal to goals map', () => {
      const id = protocol.createGoal({ name: 'Test Goal' });
      assert.ok(protocol.goals.has(id));
    });

    it('should return goal ID', () => {
      const id = protocol.createGoal({ name: 'Test' });
      assert.ok(id.startsWith('goal-'));
    });

    it('should accept custom ID', () => {
      const id = protocol.createGoal({ id: 'custom-id', name: 'Test' });
      assert.equal(id, 'custom-id');
    });

    it('should increment totalGoals', () => {
      protocol.createGoal({ name: 'A' });
      protocol.createGoal({ name: 'B' });
      assert.equal(protocol.totalGoals, 2);
    });

    it('should set goal state to pending', () => {
      const id = protocol.createGoal({ name: 'Test' });
      assert.equal(protocol.goals.get(id).state, 'pending');
    });

    it('should set default priority to 1.0', () => {
      const id = protocol.createGoal({ name: 'Test' });
      assert.equal(protocol.goals.get(id).priority, 1.0);
    });

    it('should accept custom priority', () => {
      const id = protocol.createGoal({ name: 'Test', priority: 0.5 });
      assert.equal(protocol.goals.get(id).priority, 0.5);
    });

    it('should set createdAt timestamp', () => {
      const before = Date.now();
      const id = protocol.createGoal({ name: 'Test' });
      const after = Date.now();
      const goal = protocol.goals.get(id);
      assert.ok(goal.createdAt >= before);
      assert.ok(goal.createdAt <= after);
    });

    it('should initialize progress to 0', () => {
      const id = protocol.createGoal({ name: 'Test' });
      assert.equal(protocol.goals.get(id).progress, 0);
    });

    it('should initialize empty subGoals array', () => {
      const id = protocol.createGoal({ name: 'Test' });
      assert.deepEqual(protocol.goals.get(id).subGoals, []);
    });

    it('should link subgoal to parent', () => {
      const parentId = protocol.createGoal({ name: 'Parent' });
      const childId = protocol.createGoal({ name: 'Child', parentId });
      const parent = protocol.goals.get(parentId);
      assert.ok(parent.subGoals.includes(childId));
    });

    it('should store preconditions', () => {
      const id = protocol.createGoal({
        name: 'Test',
        preconditions: [true, { goalCompleted: 'other' }],
      });
      const goal = protocol.goals.get(id);
      assert.equal(goal.preconditions.length, 2);
    });

    it('should store effects', () => {
      const id = protocol.createGoal({
        name: 'Test',
        effects: ['effect1', 'effect2'],
      });
      const goal = protocol.goals.get(id);
      assert.deepEqual(goal.effects, ['effect1', 'effect2']);
    });
  });

  describe('adopt()', () => {
    it('should return null for non-existent goal', () => {
      const result = protocol.adopt('nonexistent');
      assert.equal(result, null);
    });

    it('should set goal state to active', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      assert.equal(protocol.goals.get(id).state, 'active');
    });

    it('should set activatedAt timestamp', () => {
      const id = protocol.createGoal({ name: 'Test' });
      const before = Date.now();
      protocol.adopt(id);
      const after = Date.now();
      const goal = protocol.goals.get(id);
      assert.ok(goal.activatedAt >= before);
      assert.ok(goal.activatedAt <= after);
    });

    it('should add goal to stack', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      assert.ok(protocol.stack.includes(id));
    });

    it('should return adopted: true on success', () => {
      const id = protocol.createGoal({ name: 'Test' });
      const result = protocol.adopt(id);
      assert.equal(result.adopted, true);
      assert.equal(result.goalId, id);
    });

    it('should return stack position', () => {
      const id = protocol.createGoal({ name: 'Test' });
      const result = protocol.adopt(id);
      assert.ok('stackPosition' in result);
    });

    it('should block goal with unmet preconditions', () => {
      const id = protocol.createGoal({
        name: 'Test',
        preconditions: [false],
      });
      const result = protocol.adopt(id);
      assert.equal(result.adopted, false);
      assert.equal(protocol.goals.get(id).state, 'blocked');
    });

    it('should accept goal with function precondition that returns true', () => {
      const id = protocol.createGoal({
        name: 'Test',
        preconditions: [() => true],
      });
      const result = protocol.adopt(id);
      assert.equal(result.adopted, true);
    });

    it('should insert higher priority goals earlier in stack', () => {
      const lowId = protocol.createGoal({ name: 'Low', priority: 0.5 });
      const highId = protocol.createGoal({ name: 'High', priority: 2.0 });
      protocol.adopt(lowId);
      protocol.adopt(highId);
      // High priority should be at index 0
      assert.equal(protocol.stack[0], highId);
    });

    it('should check goalCompleted preconditions', () => {
      const prereqId = protocol.createGoal({ name: 'Prereq' });
      const dependentId = protocol.createGoal({
        name: 'Dependent',
        preconditions: [{ goalCompleted: prereqId }],
      });
      
      // Should be blocked initially
      let result = protocol.adopt(dependentId);
      assert.equal(result.adopted, false);
      
      // Complete prereq and try again
      protocol.adopt(prereqId);
      protocol.complete(prereqId);
      
      // Now reset the dependent goal state to pending
      protocol.goals.get(dependentId).state = 'pending';
      result = protocol.adopt(dependentId);
      assert.equal(result.adopted, true);
    });
  });

  describe('checkCondition()', () => {
    it('should return true for boolean true', () => {
      assert.equal(protocol.checkCondition(true), true);
    });

    it('should return false for boolean false', () => {
      assert.equal(protocol.checkCondition(false), false);
    });

    it('should call function conditions', () => {
      let called = false;
      protocol.checkCondition(() => { called = true; return true; });
      assert.ok(called);
    });

    it('should return function result', () => {
      assert.equal(protocol.checkCondition(() => true), true);
      assert.equal(protocol.checkCondition(() => false), false);
    });

    it('should check goalCompleted condition', () => {
      const id = protocol.createGoal({ name: 'Test' });
      assert.equal(protocol.checkCondition({ goalCompleted: id }), false);
      
      protocol.adopt(id);
      protocol.complete(id);
      assert.equal(protocol.checkCondition({ goalCompleted: id }), true);
    });

    it('should return true for unknown condition types', () => {
      assert.equal(protocol.checkCondition({ unknown: 'value' }), true);
    });
  });

  describe('updateProgress()', () => {
    it('should return null for non-existent goal', () => {
      const result = protocol.updateProgress('nonexistent', 0.5);
      assert.equal(result, null);
    });

    it('should update goal progress', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.updateProgress(id, 0.5);
      assert.equal(protocol.goals.get(id).progress, 0.5);
    });

    it('should clamp progress to 0', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.updateProgress(id, -0.5);
      assert.equal(protocol.goals.get(id).progress, 0);
    });

    it('should clamp progress to 1', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      protocol.updateProgress(id, 1.5);
      assert.equal(protocol.goals.get(id).progress, 1);
    });

    it('should auto-complete at 100%', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      protocol.updateProgress(id, 1.0);
      assert.equal(protocol.goals.get(id).state, 'completed');
    });

    it('should return progress update result', () => {
      const id = protocol.createGoal({ name: 'Test' });
      const result = protocol.updateProgress(id, 0.5);
      assert.equal(result.goalId, id);
      assert.equal(result.progress, 0.5);
    });
  });

  describe('complete()', () => {
    it('should return null for non-existent goal', () => {
      const result = protocol.complete('nonexistent');
      assert.equal(result, null);
    });

    it('should set goal state to completed', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.complete(id);
      assert.equal(protocol.goals.get(id).state, 'completed');
    });

    it('should set completedAt timestamp', () => {
      const id = protocol.createGoal({ name: 'Test' });
      const before = Date.now();
      protocol.complete(id);
      const after = Date.now();
      const goal = protocol.goals.get(id);
      assert.ok(goal.completedAt >= before);
      assert.ok(goal.completedAt <= after);
    });

    it('should set progress to 1', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.complete(id);
      assert.equal(protocol.goals.get(id).progress, 1);
    });

    it('should remove goal from stack', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      protocol.complete(id);
      assert.equal(protocol.stack.includes(id), false);
    });

    it('should add to completedGoals array', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      protocol.complete(id);
      assert.ok(protocol.completedGoals.some(g => g.id === id));
    });

    it('should limit completedGoals to 100 entries', () => {
      for (let i = 0; i < 120; i++) {
        const id = protocol.createGoal({ name: `Test-${i}` });
        protocol.adopt(id);
        protocol.complete(id);
      }
      assert.equal(protocol.completedGoals.length, 100);
    });

    it('should return completion result', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      const result = protocol.complete(id);
      assert.equal(result.completed, true);
      assert.equal(result.goalId, id);
    });

    it('should calculate duration', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      const result = protocol.complete(id);
      assert.ok(result.duration >= 0);
    });

    it('should update parent progress', () => {
      const parentId = protocol.createGoal({ name: 'Parent' });
      const child1 = protocol.createGoal({ name: 'C1', parentId });
      const child2 = protocol.createGoal({ name: 'C2', parentId });
      
      protocol.adopt(child1);
      protocol.complete(child1);
      
      assert.equal(protocol.goals.get(parentId).progress, 0.5);
    });

    it('should auto-complete parent when all subgoals done', () => {
      const parentId = protocol.createGoal({ name: 'Parent' });
      const child1 = protocol.createGoal({ name: 'C1', parentId });
      const child2 = protocol.createGoal({ name: 'C2', parentId });
      
      protocol.adopt(child1);
      protocol.complete(child1);
      protocol.adopt(child2);
      protocol.complete(child2);
      
      assert.equal(protocol.goals.get(parentId).state, 'completed');
    });
  });

  describe('abandon()', () => {
    it('should return null for non-existent goal', () => {
      const result = protocol.abandon('nonexistent');
      assert.equal(result, null);
    });

    it('should set goal state to abandoned', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.abandon(id);
      assert.equal(protocol.goals.get(id).state, 'abandoned');
    });

    it('should remove goal from stack', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      protocol.abandon(id);
      assert.equal(protocol.stack.includes(id), false);
    });

    it('should add to abandonedGoals array', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.abandon(id, 'Test reason');
      assert.ok(protocol.abandonedGoals.some(g => g.id === id));
    });

    it('should record reason', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.abandon(id, 'Too difficult');
      assert.equal(protocol.abandonedGoals[0].reason, 'Too difficult');
    });

    it('should limit abandonedGoals to 50 entries', () => {
      for (let i = 0; i < 60; i++) {
        const id = protocol.createGoal({ name: `Test-${i}` });
        protocol.abandon(id);
      }
      assert.equal(protocol.abandonedGoals.length, 50);
    });

    it('should return abandonment result', () => {
      const id = protocol.createGoal({ name: 'Test' });
      const result = protocol.abandon(id, 'Reason');
      assert.equal(result.abandoned, true);
      assert.equal(result.goalId, id);
      assert.equal(result.reason, 'Reason');
    });
  });

  describe('getCurrentGoal()', () => {
    it('should return null for empty stack', () => {
      assert.equal(protocol.getCurrentGoal(), null);
    });

    it('should return top goal from stack', () => {
      const id1 = protocol.createGoal({ name: 'First' });
      const id2 = protocol.createGoal({ name: 'Second' });
      protocol.adopt(id1);
      protocol.adopt(id2);
      const current = protocol.getCurrentGoal();
      assert.ok(current);
      // The one with higher priority (inserted later) should be current
    });

    it('should return goal object, not just ID', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      const current = protocol.getCurrentGoal();
      assert.equal(current.name, 'Test');
      assert.equal(current.id, id);
    });
  });

  describe('getStack()', () => {
    it('should return empty array for empty stack', () => {
      assert.deepEqual(protocol.getStack(), []);
    });

    it('should return array of goal summaries', () => {
      const id = protocol.createGoal({ name: 'Test', priority: 0.8 });
      protocol.adopt(id);
      const stack = protocol.getStack();
      assert.equal(stack.length, 1);
      assert.equal(stack[0].id, id);
      assert.equal(stack[0].name, 'Test');
      assert.equal(stack[0].priority, 0.8);
    });

    it('should include progress and state', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      protocol.updateProgress(id, 0.5);
      const stack = protocol.getStack();
      assert.equal(stack[0].progress, 0.5);
      assert.equal(stack[0].state, 'active');
    });
  });

  describe('getMetrics()', () => {
    it('should include totalGoals', () => {
      protocol.createGoal({ name: 'A' });
      protocol.createGoal({ name: 'B' });
      const metrics = protocol.getMetrics();
      assert.equal(metrics.totalGoals, 2);
    });

    it('should include activeCount', () => {
      const id1 = protocol.createGoal({ name: 'A' });
      const id2 = protocol.createGoal({ name: 'B' });
      protocol.adopt(id1);
      protocol.adopt(id2);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.activeCount, 2);
    });

    it('should include blockedCount', () => {
      const id = protocol.createGoal({
        name: 'Test',
        preconditions: [false],
      });
      protocol.adopt(id);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.blockedCount, 1);
    });

    it('should include pendingCount', () => {
      protocol.createGoal({ name: 'Pending' });
      const metrics = protocol.getMetrics();
      assert.equal(metrics.pendingCount, 1);
    });

    it('should include completedCount', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      protocol.complete(id);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.completedCount, 1);
    });

    it('should include abandonedCount', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.abandon(id);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.abandonedCount, 1);
    });

    it('should include stackDepth', () => {
      const id1 = protocol.createGoal({ name: 'A' });
      const id2 = protocol.createGoal({ name: 'B' });
      protocol.adopt(id1);
      protocol.adopt(id2);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.stackDepth, 2);
    });

    it('should include currentGoal name', () => {
      const id = protocol.createGoal({ name: 'Current' });
      protocol.adopt(id);
      const metrics = protocol.getMetrics();
      assert.equal(metrics.currentGoal, 'Current');
    });

    it('should include stack', () => {
      const id = protocol.createGoal({ name: 'Test' });
      protocol.adopt(id);
      const metrics = protocol.getMetrics();
      assert.ok(Array.isArray(metrics.stack));
    });

    it('should include recentCompleted', () => {
      const metrics = protocol.getMetrics();
      assert.ok(Array.isArray(metrics.recentCompleted));
    });

    it('should include goalStates constant', () => {
      const metrics = protocol.getMetrics();
      assert.deepEqual(metrics.goalStates, GOAL_STATES);
    });

    it('should include phi constant', () => {
      const metrics = protocol.getMetrics();
      assert.ok(Math.abs(metrics.phi - 1.618) < 0.001);
    });

    it('should include heartbeat constant', () => {
      const metrics = protocol.getMetrics();
      assert.equal(metrics.heartbeat, 873);
    });
  });

  describe('GOAL_STATES export', () => {
    it('should include all goal states', () => {
      assert.ok(GOAL_STATES.includes('pending'));
      assert.ok(GOAL_STATES.includes('active'));
      assert.ok(GOAL_STATES.includes('blocked'));
      assert.ok(GOAL_STATES.includes('completed'));
      assert.ok(GOAL_STATES.includes('abandoned'));
    });

    it('should have exactly 5 states', () => {
      assert.equal(GOAL_STATES.length, 5);
    });
  });
});
