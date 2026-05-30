/**
 * Extracts structured content from normalized document text.
 */
export class ContentExtractor {
  /**
   * Extract structured content from a document object.
   * @param {{ id: string, normalized: string, metadata?: object }} document
   * @returns {{ title: string, sections: Array<{ heading: string, body: string }>, entities: string[], keywords: string[], summary: string }}
   */
  extract(document) {
    const text = typeof document === 'string' ? document : document.normalized ?? '';
    const title = this.#deriveTitle(text);
    const sections = this.#splitSections(text);
    const entities = this.extractEntities(text);
    const keywords = this.extractKeywords(text, 10);
    const summary = this.generateSummary(text, 3);

    return { title, sections, entities, keywords, summary };
  }

  /**
   * Simple NER-like extraction.
   * Finds capitalized multi-word names, email addresses, URLs, and standalone numbers.
   * @param {string} text
   * @returns {string[]} Deduplicated entity list.
   */
  extractEntities(text) {
    const entities = new Set();

    // Capitalized multi-word names (2-5 words starting with uppercase)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\b/g;
    let match;
    while ((match = namePattern.exec(text)) !== null) {
      entities.add(match[1]);
    }

    // Email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    while ((match = emailPattern.exec(text)) !== null) {
      entities.add(match[0]);
    }

    // URLs
    const urlPattern = /https?:\/\/[^\s,)]+/g;
    while ((match = urlPattern.exec(text)) !== null) {
      entities.add(match[0]);
    }

    // Standalone numbers (integers and decimals, 2+ digits)
    const numPattern = /\b\d[\d,.]*\d\b/g;
    while ((match = numPattern.exec(text)) !== null) {
      entities.add(match[0]);
    }

    return [...entities];
  }

  /**
   * TF-based keyword extraction.
   * @param {string} text
   * @param {number} [topN=10] - Number of keywords to return.
   * @returns {string[]}
   */
  extractKeywords(text, topN = 10) {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    const freq = new Map();
    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }

    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  }

  /**
   * Extractive summarization — selects top sentences by keyword density.
   * @param {string} text
   * @param {number} [maxSentences=3]
   * @returns {string}
   */
  generateSummary(text, maxSentences = 3) {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length === 0) return '';
    if (sentences.length <= maxSentences) return sentences.join(' ');

    const keywords = new Set(this.extractKeywords(text, 20));

    const scored = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().split(/\s+/);
      const hits = words.filter((w) => keywords.has(w.replace(/[^a-z0-9]/g, ''))).length;
      const density = words.length > 0 ? hits / words.length : 0;
      // Slight bias toward earlier sentences for lead-bias
      const positionBonus = 1 / (index + 1) * 0.1;
      return { sentence, score: density + positionBonus };
    });

    scored.sort((a, b) => b.score - a.score);

    // Return top sentences in their original order
    const topSet = new Set(scored.slice(0, maxSentences).map((s) => s.sentence));
    return sentences.filter((s) => topSet.has(s)).join(' ');
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Derive a title from the first meaningful line of text.
   * @param {string} text
   * @returns {string}
   */
  #deriveTitle(text) {
    const firstLine = text.split('\n').find((l) => l.trim().length > 0) ?? '';
    // Use first line capped at 120 chars as the title
    return firstLine.trim().slice(0, 120);
  }

  /**
   * Split text into sections using blank-line separation or heading-like patterns.
   * @param {string} text
   * @returns {Array<{ heading: string, body: string }>}
   */
  #splitSections(text) {
    const blocks = text.split(/\n{2,}/);
    const sections = [];
    let currentHeading = '';

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      // Heuristic: a short line (≤80 chars) with no period at end is treated as a heading
      if (trimmed.length <= 80 && !trimmed.endsWith('.') && !trimmed.includes('\n')) {
        currentHeading = trimmed;
      } else {
        sections.push({ heading: currentHeading, body: trimmed });
        currentHeading = '';
      }
    }

    // Flush dangling heading
    if (currentHeading) {
      sections.push({ heading: currentHeading, body: '' });
    }

    return sections;
  }
}

/** Common English stop words excluded from keyword extraction. */
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'was', 'are', 'is', 'has', 'had',
  'been', 'were', 'did', 'does', 'being', 'having', 'more', 'very',
]);

export default ContentExtractor;
