/**
 * PROTO-222: Curriculum Protocol (CP)
 * Structured learning progression — the organism teaches itself in order.
 *
 * Implements curriculum learning: tasks are presented in increasing difficulty,
 * with phi-weighted progression thresholds. The organism must master simpler
 * concepts before advancing to complex ones.
 *
 * Progression rule: advance when mastery > φ⁻¹ (0.618) for current level
 * Difficulty scaling: d(n) = d(0) · φⁿ
 *
 * @module protocols/curriculum-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// Curriculum domains (categories of learning)
const CURRICULUM_DOMAINS = {
  perception:    { order: 1, description: 'Input processing, filtering, attention' },
  memory:        { order: 2, description: 'Encoding, retrieval, consolidation' },
  reasoning:     { order: 3, description: 'Logic, inference, pattern matching' },
  planning:      { order: 4, description: 'Goal setting, strategy, scheduling' },
  execution:     { order: 5, description: 'Action selection, motor control' },
  communication: { order: 6, description: 'Language, protocol, messaging' },
  creativity:    { order: 7, description: 'Novel synthesis, exploration' },
  metacognition: { order: 8, description: 'Self-monitoring, meta-learning' },
};

// Mastery levels
const MASTERY_LEVELS = {
  NOVICE:       { threshold: 0.0, label: 'Novice' },
  APPRENTICE:   { threshold: 0.2, label: 'Apprentice' },
  PRACTITIONER: { threshold: PHI_INV * 0.7, label: 'Practitioner' },   // ~0.433
  JOURNEYMAN:   { threshold: PHI_INV, label: 'Journeyman' },           // ~0.618
  EXPERT:       { threshold: 0.8, label: 'Expert' },
  MASTER:       { threshold: 0.95, label: 'Master' },
};

class CurriculumProtocol {
  constructor(config = {}) {
    this.domains = {};
    this.lessons = [];
    this.currentLevel = 0;
    this.maxLevel = config.maxLevel || 10;
    this.progressionThreshold = config.progressionThreshold || PHI_INV;

    // Initialize all domains
    for (const [name, info] of Object.entries(CURRICULUM_DOMAINS)) {
      this.domains[name] = {
        ...info,
        mastery: 0,
        lessonsCompleted: 0,
        totalAttempts: 0,
        successRate: 0,
        currentDifficulty: 1.0,
        history: [],
      };
    }

    // Statistics
    this.stats = {
      totalLessons: 0,
      totalSuccesses: 0,
      levelUps: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // ── Curriculum Management ──────────────────────────────────────────────

  /**
   * Create a lesson in a domain
   * @param {string} domain - Domain name from CURRICULUM_DOMAINS
   * @param {number} difficulty - Difficulty level (1.0 = baseline)
   * @param {object} content - Lesson content/specification
   */
  createLesson(domain, difficulty, content = {}) {
    if (!this.domains[domain]) {
      throw new Error(`Unknown domain: ${domain}. Valid: ${Object.keys(CURRICULUM_DOMAINS).join(', ')}`);
    }

    const lesson = {
      id: `lesson-${domain}-${this.lessons.length}`,
      domain,
      difficulty,
      content,
      created: Date.now(),
      attempts: [],
      completed: false,
      mastered: false,
    };

    this.lessons.push(lesson);
    return lesson;
  }

  /**
   * Get the next recommended lesson based on curriculum progression
   * Returns lessons from the lowest-mastery domain at appropriate difficulty
   */
  getNextLesson(domain) {
    if (domain) {
      const domainInfo = this.domains[domain];
      if (!domainInfo) return null;

      const difficulty = domainInfo.currentDifficulty;
      const pending = this.lessons.filter(l =>
        l.domain === domain && !l.mastered && l.difficulty <= difficulty * PHI
      );

      return pending.length > 0 ? pending[0] : null;
    }

    // Find the domain with lowest mastery that's unlocked
    const unlocked = Object.entries(this.domains)
      .filter(([, d]) => d.order <= this.currentLevel + 1)
      .sort((a, b) => a[1].mastery - b[1].mastery);

    if (unlocked.length === 0) return null;

    const [targetDomain, domainInfo] = unlocked[0];

    // Find an uncompleted lesson at appropriate difficulty
    const difficulty = domainInfo.currentDifficulty;
    const pending = this.lessons.filter(l =>
      l.domain === targetDomain && !l.mastered && l.difficulty <= difficulty * PHI
    );

    if (pending.length > 0) {
      return pending[0];
    }

    // Auto-generate a lesson at current difficulty
    return this.createLesson(targetDomain, difficulty, {
      type: 'auto-generated',
      level: this.currentLevel,
    });
  }

  // ── Learning Events ────────────────────────────────────────────────────

  /**
   * Record an attempt at a lesson
   * @param {string} lessonId - Lesson identifier
   * @param {number} score - Score from 0 to 1
   * @param {number} duration - Time taken in ms
   */
  attempt(lessonId, score, duration = 0) {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson) return null;

    const domain = this.domains[lesson.domain];
    if (!domain) return null;

    const attempt = {
      score,
      duration,
      timestamp: Date.now(),
      difficulty: lesson.difficulty,
    };

    lesson.attempts.push(attempt);
    domain.totalAttempts++;
    this.stats.totalLessons++;

    const success = score >= this.progressionThreshold;

    if (success) {
      this.stats.totalSuccesses++;
      this.stats.currentStreak++;
      if (this.stats.currentStreak > this.stats.longestStreak) {
        this.stats.longestStreak = this.stats.currentStreak;
      }

      // Update mastery using phi-weighted exponential moving average
      domain.mastery = PHI_INV * domain.mastery + (1 - PHI_INV) * score;
      domain.lessonsCompleted++;

      // Check if lesson is mastered (3 successful attempts)
      if (lesson.attempts.filter(a => a.score >= this.progressionThreshold).length >= 3) {
        lesson.mastered = true;
      }

      // Check if lesson is completed (1 successful attempt)
      if (!lesson.completed) {
        lesson.completed = true;
      }
    } else {
      this.stats.currentStreak = 0;
      // Partial mastery update (learn from failures too, but less)
      domain.mastery = domain.mastery * (1 - 0.01 * (1 - score));
    }

    // Update domain success rate
    domain.successRate = domain.totalAttempts > 0
      ? domain.lessonsCompleted / domain.totalAttempts
      : 0;

    // Record in domain history
    domain.history.push({
      lessonId,
      score,
      mastery: domain.mastery,
      timestamp: Date.now(),
    });

    // Check for level progression
    const progressResult = this._checkProgression();

    return {
      success,
      mastery: domain.mastery,
      domain: lesson.domain,
      levelUp: progressResult,
      masteryLevel: this._getMasteryLevel(domain.mastery),
    };
  }

  // ── Progression ────────────────────────────────────────────────────────

  /**
   * Check if the organism should advance to the next curriculum level
   */
  _checkProgression() {
    // Must have mastery above threshold in all unlocked domains
    const unlockedDomains = Object.entries(this.domains)
      .filter(([, d]) => d.order <= this.currentLevel + 1);

    if (unlockedDomains.length === 0) return null;

    const allMastered = unlockedDomains.every(([, d]) => d.mastery >= this.progressionThreshold);

    if (allMastered && this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      this.stats.levelUps++;

      // Increase difficulty for all domains using phi scaling
      for (const domain of Object.values(this.domains)) {
        domain.currentDifficulty *= PHI;
      }

      return {
        newLevel: this.currentLevel,
        unlockedDomain: Object.entries(CURRICULUM_DOMAINS)
          .find(([, d]) => d.order === this.currentLevel + 1)?.[0] || null,
      };
    }

    return null;
  }

  /**
   * Get the mastery level label for a mastery score
   */
  _getMasteryLevel(mastery) {
    let level = MASTERY_LEVELS.NOVICE;
    for (const ml of Object.values(MASTERY_LEVELS)) {
      if (mastery >= ml.threshold) level = ml;
    }
    return level.label;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Complete a lesson by id with a boolean success flag
   */
  completeLesson(lessonId, success) {
    return this.attempt(lessonId, success ? 1.0 : 0.0);
  }

  /**
   * Get the mastery value for a domain
   */
  getDomainMastery(domain) {
    const d = this.domains[domain];
    if (!d) return null;
    return d.mastery;
  }

  /**
   * Get the mastery level object for a domain
   */
  getMasteryLevel(domain) {
    const d = this.domains[domain];
    if (!d) return null;
    let level = MASTERY_LEVELS.NOVICE;
    for (const ml of Object.values(MASTERY_LEVELS)) {
      if (d.mastery >= ml.threshold) level = ml;
    }
    return level;
  }

  /**
   * Check if the organism can advance to the next level
   */
  canAdvance() {
    const unlockedDomains = Object.entries(this.domains)
      .filter(([, d]) => d.order <= this.currentLevel + 1);
    if (unlockedDomains.length === 0) return false;
    return unlockedDomains.every(([, d]) => d.mastery >= this.progressionThreshold);
  }

  /**
   * Advance to the next curriculum level
   */
  advanceLevel() {
    if (this.currentLevel >= this.maxLevel) return null;
    this.currentLevel++;
    this.stats.levelUps++;
    for (const domain of Object.values(this.domains)) {
      domain.currentDifficulty *= PHI;
    }
    return { newLevel: this.currentLevel };
  }

  /**
   * Get overall progress report
   */
  getProgress() {
    return {
      currentLevel: this.currentLevel,
      level: this.currentLevel,
      domains: Object.fromEntries(
        Object.entries(this.domains).map(([name, d]) => [name, d.mastery])
      ),
      domainMasteries: Object.fromEntries(
        Object.entries(this.domains).map(([name, d]) => [name, d.mastery])
      ),
    };
  }

  /**
   * Get statistics
   */
  getStats() {
    return { ...this.stats };
  }

  // ── Query Interface ────────────────────────────────────────────────────

  /**
   * Get the full curriculum state
   */
  getState() {
    return {
      currentLevel: this.currentLevel,
      maxLevel: this.maxLevel,
      progressionThreshold: this.progressionThreshold,
      domains: Object.fromEntries(
        Object.entries(this.domains).map(([name, d]) => [name, {
          mastery: parseFloat(d.mastery.toFixed(4)),
          masteryLevel: this._getMasteryLevel(d.mastery),
          lessonsCompleted: d.lessonsCompleted,
          totalAttempts: d.totalAttempts,
          successRate: parseFloat(d.successRate.toFixed(4)),
          currentDifficulty: parseFloat(d.currentDifficulty.toFixed(4)),
          unlocked: d.order <= this.currentLevel + 1,
        }])
      ),
      stats: { ...this.stats },
      totalLessons: this.lessons.length,
    };
  }

  /**
   * Get progress report for a specific domain
   */
  getDomainProgress(domain) {
    const d = this.domains[domain];
    if (!d) return null;

    return {
      domain,
      mastery: d.mastery,
      masteryLevel: this._getMasteryLevel(d.mastery),
      lessonsCompleted: d.lessonsCompleted,
      totalAttempts: d.totalAttempts,
      successRate: d.successRate,
      currentDifficulty: d.currentDifficulty,
      unlocked: d.order <= this.currentLevel + 1,
      recentHistory: d.history.slice(-10),
    };
  }

  /**
   * Get overall readiness assessment
   */
  getReadiness() {
    const domainMasteries = Object.values(this.domains).map(d => d.mastery);
    const avgMastery = domainMasteries.reduce((s, m) => s + m, 0) / domainMasteries.length;
    const minMastery = Math.min(...domainMasteries);
    const maxMastery = Math.max(...domainMasteries);

    return {
      overallMastery: parseFloat(avgMastery.toFixed(4)),
      overallLevel: this._getMasteryLevel(avgMastery),
      curriculumLevel: this.currentLevel,
      weakestDomain: Object.entries(this.domains)
        .sort((a, b) => a[1].mastery - b[1].mastery)[0]?.[0] || null,
      strongestDomain: Object.entries(this.domains)
        .sort((a, b) => b[1].mastery - a[1].mastery)[0]?.[0] || null,
      masteryRange: parseFloat((maxMastery - minMastery).toFixed(4)),
      ready: avgMastery >= PHI_INV,
    };
  }
}

export { CurriculumProtocol, CURRICULUM_DOMAINS, MASTERY_LEVELS };
export default CurriculumProtocol;
