const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('AnimusAgent', () => {
  let AnimusAgent;
  let agent;
  let mockEngines;

  beforeEach(async () => {
    const module = await import('../../sdk/agents/animus-agent.js');
    AnimusAgent = module.AnimusAgent;
    
    // Create mock engines
    mockEngines = {
      chrono: {
        getBeat: () => 0,
        setInterval: (cb, beats) => {
          const id = Math.random().toString();
          return id;
        },
        clearInterval: () => {},
        decay: (val, target, halfLife) => val * 0.99,
      },
      nexoris: {
        get: () => 1.0,
        set: () => {},
      },
      quantumFlux: {
        random: () => Math.random(),
      }
    };
    
    agent = new AnimusAgent(mockEngines);
  });

  describe('constructor', () => {
    it('should set id to ANIMUS', () => {
      assert.equal(agent.id, 'ANIMUS');
    });

    it('should store engines reference', () => {
      assert.equal(agent.engines, mockEngines);
    });

    it('should initialize empty thoughts array', () => {
      assert.ok(Array.isArray(agent.thoughts));
      assert.equal(agent.thoughts.length, 0);
    });

    it('should initialize currentGoal to null', () => {
      assert.equal(agent.currentGoal, null);
    });

    it('should initialize empty attention map', () => {
      assert.ok(agent.attention instanceof Map);
      assert.equal(agent.attention.size, 0);
    });

    it('should initialize empty patterns array', () => {
      assert.ok(Array.isArray(agent.patterns));
      assert.equal(agent.patterns.length, 0);
    });

    it('should initialize timers to null', () => {
      assert.equal(agent.thinkTimer, null);
      assert.equal(agent.dreamTimer, null);
      assert.equal(agent.reflectTimer, null);
    });

    it('should initialize stats to zero', () => {
      assert.equal(agent.stats.thoughtsProcessed, 0);
      assert.equal(agent.stats.decisionssMade, 0);
      assert.equal(agent.stats.patternsRecognized, 0);
    });

    it('should initialize awake to false', () => {
      assert.equal(agent.awake, false);
    });
  });

  describe('awaken()', () => {
    it('should set awake to true', () => {
      agent.awaken();
      assert.equal(agent.awake, true);
    });

    it('should start think timer', () => {
      agent.awaken();
      assert.ok(agent.thinkTimer !== null);
    });

    it('should start dream timer', () => {
      agent.awaken();
      assert.ok(agent.dreamTimer !== null);
    });

    it('should start reflect timer', () => {
      agent.awaken();
      assert.ok(agent.reflectTimer !== null);
    });

    it('should not re-awaken if already awake', () => {
      agent.awaken();
      const thinkTimer = agent.thinkTimer;
      agent.awaken();
      assert.equal(agent.thinkTimer, thinkTimer);
    });

    it('should call nexoris.set for cognitive awareness', () => {
      let setCalled = false;
      mockEngines.nexoris.set = () => { setCalled = true; };
      agent.awaken();
      assert.ok(setCalled);
    });
  });

  describe('shutdown()', () => {
    it('should set awake to false', () => {
      agent.awaken();
      agent.shutdown();
      assert.equal(agent.awake, false);
    });

    it('should clear timers', () => {
      let clearCalled = 0;
      mockEngines.chrono.clearInterval = () => { clearCalled++; };
      agent.awaken();
      agent.shutdown();
      assert.ok(clearCalled >= 3);
    });

    it('should not throw if not awake', () => {
      assert.doesNotThrow(() => agent.shutdown());
    });
  });

  describe('restart()', () => {
    it('should call shutdown then awaken', () => {
      let shutdownCalled = false;
      let awakenCalled = false;
      
      const origShutdown = agent.shutdown.bind(agent);
      const origAwaken = agent.awaken.bind(agent);
      
      agent.shutdown = () => { shutdownCalled = true; origShutdown(); };
      agent.awaken = () => { awakenCalled = true; origAwaken(); };
      
      agent.restart();
      
      assert.ok(shutdownCalled);
      assert.ok(awakenCalled);
    });

    it('should result in awake state', () => {
      agent.awaken();
      agent.restart();
      assert.equal(agent.awake, true);
    });
  });

  describe('addThought()', () => {
    it('should add thought to thoughts array', () => {
      agent.addThought('test thought');
      assert.ok(agent.thoughts.length > 0);
    });

    it('should return thought object', () => {
      const thought = agent.addThought('test thought');
      assert.ok(thought);
      assert.equal(thought.content, 'test thought');
    });

    it('should include timestamp', () => {
      const thought = agent.addThought('test thought');
      assert.ok(thought.timestamp);
    });

    it('should include id', () => {
      const thought = agent.addThought('test thought');
      assert.ok(thought.id);
    });

    it('should default priority to 2', () => {
      const thought = agent.addThought('test thought');
      assert.equal(thought.priority, 2);
    });

    it('should accept custom priority', () => {
      const thought = agent.addThought('test thought', 0);
      assert.equal(thought.priority, 0);
    });
  });

  describe('setGoal()', () => {
    it('should set currentGoal', () => {
      agent.setGoal({ id: 'goal-1', description: 'test goal' });
      assert.ok(agent.currentGoal);
      assert.equal(agent.currentGoal.description, 'test goal');
    });

    it('should return goal object', () => {
      const goal = agent.setGoal({ description: 'test goal' });
      assert.ok(goal);
    });

    it('should increment decisionssMade stat', () => {
      agent.setGoal({ description: 'test goal' });
      assert.ok(agent.stats.decisionssMade > 0);
    });

    it('should replace existing goal', () => {
      agent.setGoal({ description: 'goal 1' });
      agent.setGoal({ description: 'goal 2' });
      assert.equal(agent.currentGoal.description, 'goal 2');
    });
  });

  describe('clearGoal()', () => {
    it('should set currentGoal to null', () => {
      agent.setGoal({ description: 'test goal' });
      agent.clearGoal();
      assert.equal(agent.currentGoal, null);
    });

    it('should return cleared goal', () => {
      agent.setGoal({ description: 'test goal' });
      const cleared = agent.clearGoal();
      assert.equal(cleared.description, 'test goal');
    });

    it('should return null if no goal', () => {
      const cleared = agent.clearGoal();
      assert.equal(cleared, null);
    });
  });

  describe('attend()', () => {
    it('should add resource to attention map', () => {
      agent.attend('resource-1', 1.0);
      assert.ok(agent.attention.has('resource-1'));
    });

    it('should set attention weight', () => {
      agent.attend('resource-1', 0.8);
      assert.equal(agent.attention.get('resource-1'), 0.8);
    });

    it('should clamp weight to [0, 1]', () => {
      agent.attend('resource-1', 1.5);
      assert.ok(agent.attention.get('resource-1') <= 1);
    });

    it('should update existing attention', () => {
      agent.attend('resource-1', 0.5);
      agent.attend('resource-1', 0.9);
      assert.equal(agent.attention.get('resource-1'), 0.9);
    });
  });

  describe('getAttention()', () => {
    it('should return attention weight', () => {
      agent.attend('resource-1', 0.8);
      assert.equal(agent.getAttention('resource-1'), 0.8);
    });

    it('should return 0 for unknown resource', () => {
      assert.equal(agent.getAttention('unknown'), 0);
    });
  });

  describe('clearAttention()', () => {
    it('should remove resource from attention', () => {
      agent.attend('resource-1', 0.8);
      agent.clearAttention('resource-1');
      assert.ok(!agent.attention.has('resource-1'));
    });

    it('should not throw for unknown resource', () => {
      assert.doesNotThrow(() => agent.clearAttention('unknown'));
    });
  });

  describe('addPattern()', () => {
    it('should add pattern to patterns array', () => {
      agent.addPattern({ type: 'test', data: {} });
      assert.ok(agent.patterns.length > 0);
    });

    it('should increment patternsRecognized stat', () => {
      agent.addPattern({ type: 'test', data: {} });
      assert.ok(agent.stats.patternsRecognized > 0);
    });

    it('should return pattern object', () => {
      const pattern = agent.addPattern({ type: 'test', data: {} });
      assert.ok(pattern);
    });
  });

  describe('decide()', () => {
    it('should return decision object', () => {
      const decision = agent.decide([
        { id: 'option-1', score: 0.8 },
        { id: 'option-2', score: 0.6 }
      ]);
      assert.ok(decision);
    });

    it('should select highest scored option', () => {
      const decision = agent.decide([
        { id: 'option-1', score: 0.6 },
        { id: 'option-2', score: 0.8 }
      ]);
      assert.equal(decision.selected.id, 'option-2');
    });

    it('should increment decisionssMade stat', () => {
      const before = agent.stats.decisionssMade;
      agent.decide([{ id: 'option-1', score: 0.8 }]);
      assert.ok(agent.stats.decisionssMade > before);
    });

    it('should return null for empty options', () => {
      const decision = agent.decide([]);
      assert.equal(decision, null);
    });
  });

  describe('getStats()', () => {
    it('should return stats object', () => {
      const stats = agent.getStats();
      assert.ok(stats);
    });

    it('should include thoughtsProcessed', () => {
      const stats = agent.getStats();
      assert.ok('thoughtsProcessed' in stats);
    });

    it('should include decisionssMade', () => {
      const stats = agent.getStats();
      assert.ok('decisionssMade' in stats);
    });

    it('should include patternsRecognized', () => {
      const stats = agent.getStats();
      assert.ok('patternsRecognized' in stats);
    });

    it('should reflect current values', () => {
      agent.addPattern({ type: 'test' });
      agent.addPattern({ type: 'test2' });
      const stats = agent.getStats();
      assert.equal(stats.patternsRecognized, 2);
    });
  });

  describe('integration', () => {
    it('should handle complete cognitive cycle', () => {
      agent.awaken();
      
      // Add thoughts
      agent.addThought('I need to process data', 1);
      agent.addThought('Weather seems nice', 3);
      
      // Set goal
      agent.setGoal({ description: 'Analyze data patterns' });
      
      // Add attention
      agent.attend('data-source', 0.9);
      agent.attend('weather-api', 0.2);
      
      // Recognize pattern
      agent.addPattern({ type: 'data-spike', data: { value: 100 } });
      
      // Make decision
      const decision = agent.decide([
        { id: 'analyze-more', score: 0.7 },
        { id: 'alert-user', score: 0.9 }
      ]);
      
      // Verify state
      assert.ok(agent.awake);
      assert.ok(agent.currentGoal);
      assert.equal(decision.selected.id, 'alert-user');
      
      // Shutdown
      agent.shutdown();
      assert.equal(agent.awake, false);
    });
  });
});
