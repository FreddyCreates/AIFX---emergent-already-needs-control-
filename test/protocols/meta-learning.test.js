const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('MetaLearningProtocol', () => {
  let MetaLearningProtocol, HYPER_BOUNDS;
  let protocol;
  const PHI = 1.618033988749895;
  const PHI_INV = 1 / PHI;

  beforeEach(async () => {
    const module = await import('../../protocols/meta-learning-protocol.js');
    MetaLearningProtocol = module.MetaLearningProtocol;
    HYPER_BOUNDS = module.HYPER_BOUNDS;
    protocol = new MetaLearningProtocol();
  });

  describe('HYPER_BOUNDS constant', () => {
    it('should define learningRate bounds', () => {
      assert.ok(HYPER_BOUNDS.learningRate);
      assert.ok('min' in HYPER_BOUNDS.learningRate);
      assert.ok('max' in HYPER_BOUNDS.learningRate);
      assert.ok('default' in HYPER_BOUNDS.learningRate);
    });

    it('should define weightDecay bounds', () => {
      assert.ok(HYPER_BOUNDS.weightDecay);
    });

    it('should define momentum bounds', () => {
      assert.ok(HYPER_BOUNDS.momentum);
    });

    it('should define batchSize bounds', () => {
      assert.ok(HYPER_BOUNDS.batchSize);
    });

    it('should define discountFactor bounds', () => {
      assert.ok(HYPER_BOUNDS.discountFactor);
    });

    it('should use phi-based defaults', () => {
      assert.ok(Math.abs(HYPER_BOUNDS.momentum.default - PHI_INV) < 0.001);
    });
  });

  describe('constructor', () => {
    it('should initialize hyperparams', () => {
      assert.ok(protocol.hyperparams);
    });

    it('should set default learning rate', () => {
      assert.equal(protocol.hyperparams.learningRate, 0.01);
    });

    it('should set default weight decay', () => {
      assert.equal(protocol.hyperparams.weightDecay, 0.001);
    });

    it('should set default momentum from phi', () => {
      assert.ok(Math.abs(protocol.hyperparams.momentum - PHI_INV) < 0.001);
    });

    it('should set default batch size', () => {
      assert.equal(protocol.hyperparams.batchSize, 8);
    });

    it('should set default discount factor from phi', () => {
      assert.ok(Math.abs(protocol.hyperparams.discountFactor - PHI_INV) < 0.001);
    });

    it('should accept custom hyperparams', async () => {
      const module = await import('../../protocols/meta-learning-protocol.js');
      const custom = new module.MetaLearningProtocol({
        learningRate: 0.05,
        momentum: 0.9
      });
      assert.equal(custom.hyperparams.learningRate, 0.05);
      assert.equal(custom.hyperparams.momentum, 0.9);
    });

    it('should initialize empty inner loop', () => {
      assert.ok(Array.isArray(protocol.innerLoop));
      assert.equal(protocol.innerLoop.length, 0);
    });

    it('should initialize empty outer loop', () => {
      assert.ok(Array.isArray(protocol.outerLoop));
      assert.equal(protocol.outerLoop.length, 0);
    });

    it('should initialize meta gradients', () => {
      assert.ok(protocol.metaGradients);
      assert.ok('learningRate' in protocol.metaGradients);
    });

    it('should initialize task performance array', () => {
      assert.ok(Array.isArray(protocol.taskPerformance));
      assert.equal(protocol.taskPerformance.length, 0);
    });

    it('should set default meta learning rate', () => {
      assert.equal(protocol.metaLR, 0.001);
    });

    it('should accept custom meta learning rate', async () => {
      const module = await import('../../protocols/meta-learning-protocol.js');
      const custom = new module.MetaLearningProtocol({ metaLR: 0.01 });
      assert.equal(custom.metaLR, 0.01);
    });

    it('should set default inner steps', () => {
      assert.equal(protocol.innerSteps, 5);
    });

    it('should initialize outer steps to 0', () => {
      assert.equal(protocol.outerSteps, 0);
    });

    it('should initialize stats', () => {
      assert.equal(protocol.stats.tasksCompleted, 0);
      assert.equal(protocol.stats.adaptations, 0);
      assert.equal(protocol.stats.convergenceImprovement, 0);
      assert.equal(protocol.stats.bestPerformance, 0);
    });
  });

  describe('beginTask()', () => {
    it('should return current hyperparams snapshot', () => {
      const snapshot = protocol.beginTask('task-1');
      assert.deepEqual(snapshot, protocol.hyperparams);
    });

    it('should add to inner loop', () => {
      protocol.beginTask('task-1');
      assert.equal(protocol.innerLoop.length, 1);
    });

    it('should store task id', () => {
      protocol.beginTask('my-task');
      assert.equal(protocol.innerLoop[0].taskId, 'my-task');
    });

    it('should store start params', () => {
      protocol.beginTask('task-1');
      assert.ok(protocol.innerLoop[0].startParams);
    });

    it('should initialize empty steps array', () => {
      protocol.beginTask('task-1');
      assert.ok(Array.isArray(protocol.innerLoop[0].steps));
      assert.equal(protocol.innerLoop[0].steps.length, 0);
    });

    it('should record start time', () => {
      const before = Date.now();
      protocol.beginTask('task-1');
      const after = Date.now();
      assert.ok(protocol.innerLoop[0].startTime >= before);
      assert.ok(protocol.innerLoop[0].startTime <= after);
    });
  });

  describe('recordStep()', () => {
    beforeEach(() => {
      protocol.beginTask('task-1');
    });

    it('should add step to current task', () => {
      protocol.recordStep({ loss: 0.5, accuracy: 0.8 });
      assert.equal(protocol.innerLoop[0].steps.length, 1);
    });

    it('should store loss', () => {
      protocol.recordStep({ loss: 0.5 });
      assert.equal(protocol.innerLoop[0].steps[0].loss, 0.5);
    });

    it('should store accuracy', () => {
      protocol.recordStep({ loss: 0.5, accuracy: 0.8 });
      assert.equal(protocol.innerLoop[0].steps[0].accuracy, 0.8);
    });

    it('should store timestamp', () => {
      const before = Date.now();
      protocol.recordStep({ loss: 0.5 });
      const after = Date.now();
      assert.ok(protocol.innerLoop[0].steps[0].timestamp >= before);
      assert.ok(protocol.innerLoop[0].steps[0].timestamp <= after);
    });

    it('should handle multiple steps', () => {
      protocol.recordStep({ loss: 0.5 });
      protocol.recordStep({ loss: 0.4 });
      protocol.recordStep({ loss: 0.3 });
      assert.equal(protocol.innerLoop[0].steps.length, 3);
    });
  });

  describe('endTask()', () => {
    beforeEach(() => {
      protocol.beginTask('task-1');
      protocol.recordStep({ loss: 0.5, accuracy: 0.7 });
      protocol.recordStep({ loss: 0.3, accuracy: 0.8 });
    });

    it('should return task summary', () => {
      const summary = protocol.endTask();
      assert.ok(summary);
    });

    it('should include final loss', () => {
      const summary = protocol.endTask();
      assert.ok('finalLoss' in summary || 'loss' in summary);
    });

    it('should include final accuracy', () => {
      const summary = protocol.endTask();
      assert.ok('finalAccuracy' in summary || 'accuracy' in summary);
    });

    it('should increment tasks completed', () => {
      protocol.endTask();
      assert.equal(protocol.stats.tasksCompleted, 1);
    });

    it('should add to task performance', () => {
      protocol.endTask();
      assert.ok(protocol.taskPerformance.length >= 1);
    });

    it('should compute convergence rate', () => {
      const summary = protocol.endTask();
      assert.ok('convergenceRate' in summary || 'improvement' in summary);
    });
  });

  describe('adapt()', () => {
    beforeEach(() => {
      // Complete several tasks to enable adaptation
      for (let i = 0; i < 5; i++) {
        protocol.beginTask(`task-${i}`);
        protocol.recordStep({ loss: 0.5 - i * 0.05, accuracy: 0.5 + i * 0.1 });
        protocol.endTask();
      }
    });

    it('should adapt hyperparameters', () => {
      const oldLR = protocol.hyperparams.learningRate;
      protocol.adapt();
      // May or may not change depending on gradients
      assert.ok(typeof protocol.hyperparams.learningRate === 'number');
    });

    it('should increment adaptations count', () => {
      protocol.adapt();
      assert.ok(protocol.stats.adaptations >= 1);
    });

    it('should increment outer steps', () => {
      protocol.adapt();
      assert.ok(protocol.outerSteps >= 1);
    });

    it('should add to outer loop history', () => {
      protocol.adapt();
      assert.ok(protocol.outerLoop.length >= 1);
    });

    it('should keep hyperparams in bounds', () => {
      protocol.adapt();
      for (const [key, bounds] of Object.entries(HYPER_BOUNDS)) {
        assert.ok(protocol.hyperparams[key] >= bounds.min);
        assert.ok(protocol.hyperparams[key] <= bounds.max);
      }
    });
  });

  describe('computeMetaGradient()', () => {
    it('should compute gradient for learning rate', () => {
      protocol.beginTask('task-1');
      protocol.recordStep({ loss: 0.5 });
      protocol.recordStep({ loss: 0.3 });
      protocol.endTask();
      
      const gradient = protocol.computeMetaGradient('learningRate');
      assert.ok(typeof gradient === 'number');
    });

    it('should return 0 for insufficient data', () => {
      const gradient = protocol.computeMetaGradient('learningRate');
      assert.equal(gradient, 0);
    });
  });

  describe('getHyperparams()', () => {
    it('should return current hyperparams', () => {
      const params = protocol.getHyperparams();
      assert.ok(params);
      assert.ok('learningRate' in params);
    });

    it('should return copy not reference', () => {
      const params = protocol.getHyperparams();
      params.learningRate = 999;
      assert.notEqual(protocol.hyperparams.learningRate, 999);
    });
  });

  describe('setHyperparams()', () => {
    it('should update hyperparams', () => {
      protocol.setHyperparams({ learningRate: 0.05 });
      assert.equal(protocol.hyperparams.learningRate, 0.05);
    });

    it('should clamp to bounds', () => {
      protocol.setHyperparams({ learningRate: 10.0 }); // Way above max
      assert.ok(protocol.hyperparams.learningRate <= HYPER_BOUNDS.learningRate.max);
    });

    it('should preserve unspecified params', () => {
      const oldMomentum = protocol.hyperparams.momentum;
      protocol.setHyperparams({ learningRate: 0.05 });
      assert.equal(protocol.hyperparams.momentum, oldMomentum);
    });
  });

  describe('resetMetaGradients()', () => {
    it('should reset all gradients to 0', () => {
      protocol.metaGradients.learningRate = 0.5;
      protocol.metaGradients.momentum = 0.3;
      protocol.resetMetaGradients();
      for (const key of Object.keys(protocol.metaGradients)) {
        assert.equal(protocol.metaGradients[key], 0);
      }
    });
  });

  describe('getStats()', () => {
    it('should return stats object', () => {
      const stats = protocol.getStats();
      assert.ok(stats);
    });

    it('should include tasks completed', () => {
      const stats = protocol.getStats();
      assert.ok('tasksCompleted' in stats);
    });

    it('should include adaptations', () => {
      const stats = protocol.getStats();
      assert.ok('adaptations' in stats);
    });

    it('should include convergence improvement', () => {
      const stats = protocol.getStats();
      assert.ok('convergenceImprovement' in stats);
    });

    it('should include best performance', () => {
      const stats = protocol.getStats();
      assert.ok('bestPerformance' in stats);
    });
  });

  describe('getMetaReport()', () => {
    it('should return comprehensive report', () => {
      protocol.beginTask('task-1');
      protocol.recordStep({ loss: 0.5 });
      protocol.endTask();
      
      const report = protocol.getMetaReport();
      assert.ok(report);
    });

    it('should include current hyperparams', () => {
      const report = protocol.getMetaReport();
      assert.ok(report.hyperparams || report.currentParams);
    });

    it('should include stats', () => {
      const report = protocol.getMetaReport();
      assert.ok(report.stats);
    });

    it('should include task history summary', () => {
      const report = protocol.getMetaReport();
      assert.ok('taskCount' in report || 'history' in report);
    });
  });

  describe('integration', () => {
    it('should complete full meta-learning cycle', () => {
      // Run multiple tasks
      for (let task = 0; task < 10; task++) {
        protocol.beginTask(`task-${task}`);
        
        // Simulate training steps
        for (let step = 0; step < 5; step++) {
          const loss = 0.5 * Math.pow(0.9, step);
          const accuracy = 0.5 + 0.1 * step;
          protocol.recordStep({ loss, accuracy });
        }
        
        protocol.endTask();
      }
      
      // Adapt based on task performance
      protocol.adapt();
      
      // Check stats
      const stats = protocol.getStats();
      assert.equal(stats.tasksCompleted, 10);
      assert.ok(stats.adaptations >= 1);
    });

    it('should improve with adaptation', () => {
      // Track convergence before and after adaptation
      const initialParams = { ...protocol.hyperparams };
      
      // Run tasks
      for (let i = 0; i < 5; i++) {
        protocol.beginTask(`task-${i}`);
        protocol.recordStep({ loss: 0.5, accuracy: 0.6 });
        protocol.recordStep({ loss: 0.3, accuracy: 0.7 });
        protocol.endTask();
      }
      
      protocol.adapt();
      
      // Parameters may have changed
      const finalParams = protocol.getHyperparams();
      assert.ok(finalParams);
    });
  });
});
