/**
 * WASTE DETECTOR
 *
 * Flags redundancy, filler, generic explanation, and repeated context.
 * Identifies tokens that consume attention without improving outcome.
 *
 * Bad tokens:
 *   - Restate obvious context
 *   - Sound smart but do not change action
 *   - Add structure without leverage
 *   - Expand when the user needs execution
 *   - Hide uncertainty under clean language
 */

const WASTE_PATTERNS = [
  { id: 'restated_context',     weight: 1.0, description: 'Repeats information already provided' },
  { id: 'filler_language',      weight: 0.8, description: 'Adds words without meaning' },
  { id: 'false_precision',      weight: 1.2, description: 'Sounds confident without basis' },
  { id: 'structure_no_leverage', weight: 0.7, description: 'Formatting without information gain' },
  { id: 'expansion_over_execution', weight: 1.0, description: 'Explains when action is needed' },
  { id: 'hedging_without_value', weight: 0.6, description: 'Uncertainty signals that do not change decision' },
  { id: 'generic_advice',       weight: 0.9, description: 'Boilerplate applicable to anything' },
  { id: 'repeated_disclaimer',  weight: 0.5, description: 'Repeated safety/limitation disclaimers' },
];

class WasteDetector {
  constructor(options = {}) {
    this.patterns = options.patterns || WASTE_PATTERNS;
    this.detections = [];
  }

  /**
   * Analyze output for waste.
   * @param {object} params
   * @param {Array<object>} params.segments - Array of { text, tokens, type? }
   * @param {object} params.context - { knownContext, taskType, userIntent }
   * @returns {{ wasteScore, wasteTokens, totalTokens, wasteRatio, flags }}
   */
  detect(params) {
    const segments = params.segments || [];
    const context = params.context || {};
    const totalTokens = segments.reduce((sum, s) => sum + (s.tokens || 0), 0);

    const flags = [];
    let wasteTokens = 0;

    for (const segment of segments) {
      const segFlags = this._analyzeSegment(segment, context);
      if (segFlags.length > 0) {
        wasteTokens += segment.tokens || 0;
        flags.push({ segment: segment.text, tokens: segment.tokens, flags: segFlags });
      }
    }

    const wasteScore = this._computeWasteScore(flags);
    const wasteRatio = totalTokens > 0 ? wasteTokens / totalTokens : 0;

    const result = {
      wasteScore,
      wasteTokens,
      totalTokens,
      wasteRatio,
      flags,
      clean: flags.length === 0,
      timestamp: Date.now(),
    };

    this.detections.push(result);
    return result;
  }

  /**
   * Quick check: is this segment wasteful given context?
   * @param {object} segment - { text, tokens, type }
   * @param {object} context - Known context
   * @returns {Array<string>} Pattern IDs that matched
   */
  _analyzeSegment(segment, context) {
    const matched = [];
    const text = (segment.text || '').toLowerCase();
    const type = segment.type || 'unknown';

    // Check for restated known context
    if (context.knownContext && typeof context.knownContext === 'string') {
      const known = context.knownContext.toLowerCase();
      const overlap = this._overlapRatio(text, known);
      if (overlap > 0.6) {
        matched.push('restated_context');
      }
    }

    // Check for expansion over execution
    if (context.userIntent === 'execute' && type === 'explanation') {
      matched.push('expansion_over_execution');
    }

    // Check for structure without leverage
    if (type === 'formatting' && (!segment.tokens || segment.tokens < 3)) {
      matched.push('structure_no_leverage');
    }

    // Check for generic advice (high-level heuristic)
    if (segment.generic === true) {
      matched.push('generic_advice');
    }

    // Check for filler (explicitly tagged)
    if (segment.filler === true || type === 'filler') {
      matched.push('filler_language');
    }

    // Check for false precision
    if (segment.falsePrecision === true) {
      matched.push('false_precision');
    }

    return matched;
  }

  /**
   * Simple overlap ratio between two strings.
   */
  _overlapRatio(textA, textB) {
    if (!textA || !textB) return 0;
    const wordsA = new Set(textA.split(/\s+/));
    const wordsB = new Set(textB.split(/\s+/));
    let overlap = 0;
    for (const w of wordsA) {
      if (wordsB.has(w)) overlap++;
    }
    return wordsA.size > 0 ? overlap / wordsA.size : 0;
  }

  _computeWasteScore(flags) {
    let score = 0;
    const patternMap = new Map(this.patterns.map(p => [p.id, p]));

    for (const f of flags) {
      for (const patternId of f.flags) {
        const pattern = patternMap.get(patternId);
        score += (pattern ? pattern.weight : 1.0) * (f.tokens || 1);
      }
    }
    return score;
  }

  getStats() {
    if (this.detections.length === 0) return { count: 0, avgWasteRatio: 0, cleanRate: 0 };
    const count = this.detections.length;
    const avgWasteRatio = this.detections.reduce((s, d) => s + d.wasteRatio, 0) / count;
    const cleanRate = this.detections.filter(d => d.clean).length / count;
    return { count, avgWasteRatio, cleanRate };
  }

  reset() {
    this.detections = [];
  }
}

export { WasteDetector, WASTE_PATTERNS };
export default WasteDetector;
