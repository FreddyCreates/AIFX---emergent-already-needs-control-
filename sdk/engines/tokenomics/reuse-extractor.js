/**
 * REUSE EXTRACTOR
 *
 * Pulls out rules, templates, and memory from successful interactions.
 * Converts repeated patterns into reusable artifacts.
 *
 * Types of reusable artifacts:
 *   - Rules: "If X then Y" decision heuristics
 *   - Templates: Reusable output structures
 *   - Memory: Facts/patterns to inform future tasks
 *   - Procedures: Step sequences that worked
 */

const ARTIFACT_TYPES = {
  RULE: 'rule',
  TEMPLATE: 'template',
  MEMORY: 'memory',
  PROCEDURE: 'procedure',
};

class ReuseExtractor {
  constructor(options = {}) {
    this.artifacts = [];
    this.minCRForExtraction = options.minCR || 15; // Only extract from high-CR outputs
    this.dedupeThreshold = options.dedupeThreshold || 0.8;
  }

  /**
   * Extract reusable artifacts from a scored interaction.
   * @param {object} interaction
   * @param {object} interaction.input - Task input / prompt context
   * @param {object} interaction.output - Generated output
   * @param {object} interaction.scores - CR scores { dq, act, risk, reuse, learn }
   * @param {string} interaction.taskType - Task classification
   * @returns {Array<object>} Extracted artifacts
   */
  extract(interaction) {
    const cr = (interaction.scores.dq || 0) +
               (interaction.scores.act || 0) +
               (interaction.scores.risk || 0) +
               (interaction.scores.reuse || 0) +
               (interaction.scores.learn || 0);

    if (cr < this.minCRForExtraction) {
      return [];
    }

    const extracted = [];

    // Extract rules (if decision quality is high)
    if (interaction.scores.dq >= 4 && interaction.output.decision) {
      const rule = this._extractRule(interaction);
      if (rule && !this._isDuplicate(rule)) {
        extracted.push(rule);
        this.artifacts.push(rule);
      }
    }

    // Extract templates (if reuse score is high)
    if (interaction.scores.reuse >= 4 && interaction.output.structure) {
      const template = this._extractTemplate(interaction);
      if (template && !this._isDuplicate(template)) {
        extracted.push(template);
        this.artifacts.push(template);
      }
    }

    // Extract memory (if learning gain is high)
    if (interaction.scores.learn >= 4) {
      const memory = this._extractMemory(interaction);
      if (memory && !this._isDuplicate(memory)) {
        extracted.push(memory);
        this.artifacts.push(memory);
      }
    }

    // Extract procedures (if actionability is high)
    if (interaction.scores.act >= 4 && interaction.output.steps) {
      const procedure = this._extractProcedure(interaction);
      if (procedure && !this._isDuplicate(procedure)) {
        extracted.push(procedure);
        this.artifacts.push(procedure);
      }
    }

    return extracted;
  }

  _extractRule(interaction) {
    return {
      type: ARTIFACT_TYPES.RULE,
      taskType: interaction.taskType,
      content: interaction.output.decision,
      condition: interaction.input.condition || null,
      confidence: interaction.scores.dq / 5,
      extractedAt: Date.now(),
      sourceInteraction: interaction.id || null,
    };
  }

  _extractTemplate(interaction) {
    return {
      type: ARTIFACT_TYPES.TEMPLATE,
      taskType: interaction.taskType,
      content: interaction.output.structure,
      applicableTo: interaction.output.applicableTo || [interaction.taskType],
      extractedAt: Date.now(),
      sourceInteraction: interaction.id || null,
    };
  }

  _extractMemory(interaction) {
    return {
      type: ARTIFACT_TYPES.MEMORY,
      taskType: interaction.taskType,
      content: interaction.output.insight || interaction.output.text || null,
      domain: interaction.input.domain || null,
      extractedAt: Date.now(),
      sourceInteraction: interaction.id || null,
    };
  }

  _extractProcedure(interaction) {
    return {
      type: ARTIFACT_TYPES.PROCEDURE,
      taskType: interaction.taskType,
      steps: interaction.output.steps,
      preconditions: interaction.input.preconditions || null,
      extractedAt: Date.now(),
      sourceInteraction: interaction.id || null,
    };
  }

  /**
   * Check if an artifact is a duplicate of existing ones.
   */
  _isDuplicate(artifact) {
    for (const existing of this.artifacts) {
      if (existing.type !== artifact.type) continue;
      if (existing.taskType !== artifact.taskType) continue;

      const existingContent = JSON.stringify(existing.content || '');
      const newContent = JSON.stringify(artifact.content || '');

      if (existingContent === newContent) return true;

      // Simple similarity check
      const overlap = this._contentSimilarity(existingContent, newContent);
      if (overlap > this.dedupeThreshold) return true;
    }
    return false;
  }

  _contentSimilarity(a, b) {
    if (!a || !b) return 0;
    const setA = new Set(a.split(/\s+/));
    const setB = new Set(b.split(/\s+/));
    let overlap = 0;
    for (const w of setA) {
      if (setB.has(w)) overlap++;
    }
    const union = new Set([...setA, ...setB]).size;
    return union > 0 ? overlap / union : 0;
  }

  /**
   * Get all artifacts, optionally filtered.
   */
  getArtifacts(filter = {}) {
    let results = [...this.artifacts];
    if (filter.type) results = results.filter(a => a.type === filter.type);
    if (filter.taskType) results = results.filter(a => a.taskType === filter.taskType);
    return results;
  }

  /**
   * Get extraction stats.
   */
  getStats() {
    const byType = {};
    for (const type of Object.values(ARTIFACT_TYPES)) {
      byType[type] = this.artifacts.filter(a => a.type === type).length;
    }
    return { total: this.artifacts.length, byType };
  }

  reset() {
    this.artifacts = [];
  }
}

export { ReuseExtractor, ARTIFACT_TYPES };
export default ReuseExtractor;
