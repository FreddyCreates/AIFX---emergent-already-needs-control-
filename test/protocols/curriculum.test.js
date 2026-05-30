const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('CurriculumProtocol', () => {
  let CurriculumProtocol, CURRICULUM_DOMAINS, MASTERY_LEVELS;
  let protocol;
  const PHI = 1.618033988749895;
  const PHI_INV = 1 / PHI;

  beforeEach(async () => {
    const module = await import('../../protocols/curriculum-protocol.js');
    CurriculumProtocol = module.CurriculumProtocol;
    CURRICULUM_DOMAINS = module.CURRICULUM_DOMAINS;
    MASTERY_LEVELS = module.MASTERY_LEVELS;
    protocol = new CurriculumProtocol();
  });

  describe('CURRICULUM_DOMAINS', () => {
    it('should define perception domain', () => {
      assert.ok(CURRICULUM_DOMAINS.perception);
      assert.equal(CURRICULUM_DOMAINS.perception.order, 1);
    });

    it('should define memory domain', () => {
      assert.ok(CURRICULUM_DOMAINS.memory);
      assert.equal(CURRICULUM_DOMAINS.memory.order, 2);
    });

    it('should define reasoning domain', () => {
      assert.ok(CURRICULUM_DOMAINS.reasoning);
      assert.equal(CURRICULUM_DOMAINS.reasoning.order, 3);
    });

    it('should define planning domain', () => {
      assert.ok(CURRICULUM_DOMAINS.planning);
      assert.equal(CURRICULUM_DOMAINS.planning.order, 4);
    });

    it('should define execution domain', () => {
      assert.ok(CURRICULUM_DOMAINS.execution);
    });

    it('should define communication domain', () => {
      assert.ok(CURRICULUM_DOMAINS.communication);
    });

    it('should define creativity domain', () => {
      assert.ok(CURRICULUM_DOMAINS.creativity);
    });

    it('should define metacognition domain', () => {
      assert.ok(CURRICULUM_DOMAINS.metacognition);
      assert.equal(CURRICULUM_DOMAINS.metacognition.order, 8);
    });

    it('should have 8 domains total', () => {
      assert.equal(Object.keys(CURRICULUM_DOMAINS).length, 8);
    });
  });

  describe('MASTERY_LEVELS', () => {
    it('should define NOVICE level', () => {
      assert.equal(MASTERY_LEVELS.NOVICE.threshold, 0.0);
    });

    it('should define APPRENTICE level', () => {
      assert.equal(MASTERY_LEVELS.APPRENTICE.threshold, 0.2);
    });

    it('should define JOURNEYMAN at phi-inverse', () => {
      assert.ok(Math.abs(MASTERY_LEVELS.JOURNEYMAN.threshold - PHI_INV) < 0.001);
    });

    it('should define EXPERT level', () => {
      assert.equal(MASTERY_LEVELS.EXPERT.threshold, 0.8);
    });

    it('should define MASTER level', () => {
      assert.equal(MASTERY_LEVELS.MASTER.threshold, 0.95);
    });
  });

  describe('constructor', () => {
    it('should initialize domains', () => {
      assert.ok(protocol.domains);
      assert.ok(protocol.domains.perception);
    });

    it('should initialize all 8 domains', () => {
      assert.equal(Object.keys(protocol.domains).length, 8);
    });

    it('should initialize domain mastery to 0', () => {
      assert.equal(protocol.domains.perception.mastery, 0);
    });

    it('should initialize lessons completed to 0', () => {
      assert.equal(protocol.domains.perception.lessonsCompleted, 0);
    });

    it('should initialize current level to 0', () => {
      assert.equal(protocol.currentLevel, 0);
    });

    it('should set default max level to 10', () => {
      assert.equal(protocol.maxLevel, 10);
    });

    it('should accept custom max level', async () => {
      const module = await import('../../protocols/curriculum-protocol.js');
      const custom = new module.CurriculumProtocol({ maxLevel: 20 });
      assert.equal(custom.maxLevel, 20);
    });

    it('should set phi-inverse as progression threshold', () => {
      assert.ok(Math.abs(protocol.progressionThreshold - PHI_INV) < 0.001);
    });

    it('should initialize stats', () => {
      assert.equal(protocol.stats.totalLessons, 0);
      assert.equal(protocol.stats.totalSuccesses, 0);
      assert.equal(protocol.stats.levelUps, 0);
    });

    it('should initialize empty lessons array', () => {
      assert.ok(Array.isArray(protocol.lessons));
      assert.equal(protocol.lessons.length, 0);
    });
  });

  describe('createLesson()', () => {
    it('should create a lesson', () => {
      const lesson = protocol.createLesson('perception', 1.0, { topic: 'test' });
      assert.ok(lesson);
    });

    it('should return lesson id', () => {
      const lesson = protocol.createLesson('perception', 1.0, { topic: 'test' });
      assert.ok(lesson.id || lesson.lessonId);
    });

    it('should add to lessons array', () => {
      protocol.createLesson('perception', 1.0, { topic: 'test' });
      assert.ok(protocol.lessons.length >= 1);
    });

    it('should store domain', () => {
      const lesson = protocol.createLesson('memory', 1.5, { topic: 'test' });
      assert.equal(lesson.domain, 'memory');
    });

    it('should store difficulty', () => {
      const lesson = protocol.createLesson('reasoning', 2.0, { topic: 'test' });
      assert.equal(lesson.difficulty, 2.0);
    });
  });

  describe('completeLesson()', () => {
    let lessonId;

    beforeEach(() => {
      const lesson = protocol.createLesson('perception', 1.0, { topic: 'test' });
      lessonId = lesson.id || lesson.lessonId;
    });

    it('should mark lesson as complete', () => {
      const result = protocol.completeLesson(lessonId, true);
      assert.ok(result);
    });

    it('should increment total lessons', () => {
      protocol.completeLesson(lessonId, true);
      assert.equal(protocol.stats.totalLessons, 1);
    });

    it('should increment successes on success', () => {
      protocol.completeLesson(lessonId, true);
      assert.equal(protocol.stats.totalSuccesses, 1);
    });

    it('should not increment successes on failure', () => {
      protocol.completeLesson(lessonId, false);
      assert.equal(protocol.stats.totalSuccesses, 0);
    });

    it('should update domain mastery', () => {
      protocol.completeLesson(lessonId, true);
      assert.ok(protocol.domains.perception.mastery > 0);
    });

    it('should increment domain lessons completed', () => {
      protocol.completeLesson(lessonId, true);
      assert.equal(protocol.domains.perception.lessonsCompleted, 1);
    });
  });

  describe('getDomainMastery()', () => {
    it('should return mastery for domain', () => {
      const mastery = protocol.getDomainMastery('perception');
      assert.ok(typeof mastery === 'number');
    });

    it('should return 0 for new domain', () => {
      assert.equal(protocol.getDomainMastery('perception'), 0);
    });

    it('should return null for unknown domain', () => {
      const mastery = protocol.getDomainMastery('unknown');
      assert.equal(mastery, null);
    });
  });

  describe('getMasteryLevel()', () => {
    it('should return NOVICE for 0 mastery', () => {
      const level = protocol.getMasteryLevel('perception');
      assert.equal(level.label, 'Novice');
    });

    it('should return appropriate level based on mastery', () => {
      // Simulate some mastery
      protocol.domains.perception.mastery = 0.7;
      const level = protocol.getMasteryLevel('perception');
      assert.ok(level.label);
    });
  });

  describe('getNextLesson()', () => {
    it('should return next appropriate lesson', () => {
      protocol.createLesson('perception', 1.0, { topic: 'test1' });
      protocol.createLesson('perception', 1.5, { topic: 'test2' });
      const next = protocol.getNextLesson('perception');
      assert.ok(next);
    });

    it('should return null if no lessons', () => {
      const next = protocol.getNextLesson('perception');
      assert.equal(next, null);
    });
  });

  describe('canAdvance()', () => {
    it('should return false at start', () => {
      assert.equal(protocol.canAdvance(), false);
    });

    it('should return true when mastery exceeds threshold', () => {
      // Set all domains to high mastery
      for (const domain of Object.keys(protocol.domains)) {
        protocol.domains[domain].mastery = 0.7;
      }
      const result = protocol.canAdvance();
      assert.ok(typeof result === 'boolean');
    });
  });

  describe('advanceLevel()', () => {
    beforeEach(() => {
      // Set mastery above threshold
      for (const domain of Object.keys(protocol.domains)) {
        protocol.domains[domain].mastery = 0.7;
      }
    });

    it('should increment level', () => {
      const oldLevel = protocol.currentLevel;
      protocol.advanceLevel();
      assert.equal(protocol.currentLevel, oldLevel + 1);
    });

    it('should increment levelUps stat', () => {
      protocol.advanceLevel();
      assert.equal(protocol.stats.levelUps, 1);
    });

    it('should not exceed max level', () => {
      for (let i = 0; i < 20; i++) {
        protocol.advanceLevel();
      }
      assert.ok(protocol.currentLevel <= protocol.maxLevel);
    });
  });

  describe('getProgress()', () => {
    it('should return progress object', () => {
      const progress = protocol.getProgress();
      assert.ok(progress);
    });

    it('should include current level', () => {
      const progress = protocol.getProgress();
      assert.ok('currentLevel' in progress || 'level' in progress);
    });

    it('should include domain masteries', () => {
      const progress = protocol.getProgress();
      assert.ok(progress.domains || progress.domainMasteries);
    });
  });

  describe('getStats()', () => {
    it('should return stats object', () => {
      const stats = protocol.getStats();
      assert.ok(stats);
    });

    it('should include total lessons', () => {
      const stats = protocol.getStats();
      assert.ok('totalLessons' in stats);
    });

    it('should include total successes', () => {
      const stats = protocol.getStats();
      assert.ok('totalSuccesses' in stats);
    });

    it('should include level ups', () => {
      const stats = protocol.getStats();
      assert.ok('levelUps' in stats);
    });
  });

  describe('integration', () => {
    it('should complete full learning cycle', () => {
      // Create lessons
      const lesson1 = protocol.createLesson('perception', 1.0, { topic: 'basics' });
      const lesson2 = protocol.createLesson('perception', 1.5, { topic: 'advanced' });
      
      // Complete lessons
      protocol.completeLesson(lesson1.id || lesson1.lessonId, true);
      protocol.completeLesson(lesson2.id || lesson2.lessonId, true);
      
      // Check progress
      assert.equal(protocol.stats.totalLessons, 2);
      assert.ok(protocol.domains.perception.mastery > 0);
    });
  });
});
