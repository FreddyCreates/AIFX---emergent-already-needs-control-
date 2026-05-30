import crypto from 'node:crypto';
import { ContentExtractor } from './content-extractor.js';

/**
 * Supported digest formats.
 * @readonly
 */
const DIGEST_FORMATS = new Set(['brief', 'detailed', 'executive']);

/**
 * Generates consolidated digests from multiple documents.
 */
export class DigestGenerator {
  /** @type {Map<string, object>} */
  #digests = new Map();

  /** @type {ContentExtractor} */
  #extractor = new ContentExtractor();

  /**
   * Create a new digest from an array of documents.
   * @param {Array<{ id?: string, normalized?: string, raw?: string }>} documents
   * @param {{ format?: string, maxLength?: number, focus?: string[] }} [config={}]
   * @returns {{ id: string, status: string, documentCount: number }}
   */
  createDigest(documents, config = {}) {
    const format = config.format ?? 'brief';
    if (!DIGEST_FORMATS.has(format)) {
      throw new Error(`Unsupported format "${format}". Use one of: ${[...DIGEST_FORMATS].join(', ')}`);
    }

    const id = crypto.randomUUID();
    const entries = (Array.isArray(documents) ? documents : []).map((doc) =>
      this.#processDocument(doc),
    );

    this.#digests.set(id, {
      id,
      config: {
        format,
        maxLength: config.maxLength ?? Infinity,
        focus: Array.isArray(config.focus) ? config.focus : [],
      },
      entries,
      status: 'draft',
      createdAt: new Date().toISOString(),
      output: null,
    });

    return { id, status: 'draft', documentCount: entries.length };
  }

  /**
   * Add more documents to an existing digest.
   * @param {string} digestId
   * @param {{ id?: string, normalized?: string, raw?: string }} document
   * @returns {{ documentCount: number }}
   */
  addToDigest(digestId, document) {
    const digest = this.#digests.get(digestId);
    if (!digest) throw new Error(`Digest "${digestId}" not found`);
    if (digest.status === 'finalized') throw new Error('Cannot add to a finalized digest');

    digest.entries.push(this.#processDocument(document));
    return { documentCount: digest.entries.length };
  }

  /**
   * Finalize a digest, producing the rendered output.
   * @param {string} digestId
   * @returns {{ id: string, status: string, output: string }}
   */
  finalize(digestId) {
    const digest = this.#digests.get(digestId);
    if (!digest) throw new Error(`Digest "${digestId}" not found`);

    digest.output = this.#render(digest);
    digest.status = 'finalized';
    digest.finalizedAt = new Date().toISOString();

    return { id: digestId, status: 'finalized', output: digest.output };
  }

  /**
   * Get the current state of a digest.
   * @param {string} digestId
   * @returns {object | null}
   */
  getDigest(digestId) {
    const digest = this.#digests.get(digestId);
    if (!digest) return null;
    return {
      id: digest.id,
      status: digest.status,
      documentCount: digest.entries.length,
      config: { ...digest.config },
      output: digest.output,
      createdAt: digest.createdAt,
      finalizedAt: digest.finalizedAt ?? null,
    };
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Extract structured information from a single document.
   * @param {object} doc
   * @returns {object}
   */
  #processDocument(doc) {
    const text = doc.normalized ?? doc.raw ?? (typeof doc === 'string' ? doc : '');
    const extraction = this.#extractor.extract({ normalized: text });
    return {
      id: doc.id ?? crypto.randomUUID(),
      title: extraction.title,
      keywords: extraction.keywords,
      summary: extraction.summary,
      entities: extraction.entities,
      sections: extraction.sections,
    };
  }

  /**
   * Render the final digest string based on format and focus filters.
   * @param {object} digest
   * @returns {string}
   */
  #render(digest) {
    const { config, entries } = digest;
    let filtered = entries;

    // Apply focus filter: keep entries whose keywords overlap with focus topics
    if (config.focus.length > 0) {
      const focusLower = config.focus.map((f) => f.toLowerCase());
      filtered = entries.filter((entry) =>
        entry.keywords.some((kw) => focusLower.includes(kw.toLowerCase())) ||
        focusLower.some((f) => entry.title.toLowerCase().includes(f)),
      );
      // Fall back to all entries if filter is too aggressive
      if (filtered.length === 0) filtered = entries;
    }

    let output;

    switch (config.format) {
      case 'brief':
        output = this.#renderBrief(filtered);
        break;
      case 'detailed':
        output = this.#renderDetailed(filtered);
        break;
      case 'executive':
        output = this.#renderExecutive(filtered);
        break;
      default:
        output = this.#renderBrief(filtered);
    }

    // Enforce maxLength
    if (config.maxLength !== Infinity && output.length > config.maxLength) {
      output = output.slice(0, config.maxLength - 3) + '...';
    }

    return output;
  }

  /**
   * Brief format: one-line summary per document.
   * @param {object[]} entries
   * @returns {string}
   */
  #renderBrief(entries) {
    const lines = entries.map(
      (e, i) => `${i + 1}. ${e.title || 'Untitled'}: ${e.summary || '(no summary)'}`,
    );
    return `Digest (${entries.length} documents)\n${'='.repeat(40)}\n${lines.join('\n')}`;
  }

  /**
   * Detailed format: full sections and entities per document.
   * @param {object[]} entries
   * @returns {string}
   */
  #renderDetailed(entries) {
    const parts = entries.map((e) => {
      const header = `## ${e.title || 'Untitled'}`;
      const summary = `Summary: ${e.summary || '(none)'}`;
      const kw = `Keywords: ${e.keywords.join(', ') || '(none)'}`;
      const ent = `Entities: ${e.entities.join(', ') || '(none)'}`;
      const secs = e.sections
        .map((s) => `  ### ${s.heading || '(section)'}\n  ${s.body}`)
        .join('\n');
      return [header, summary, kw, ent, secs].filter(Boolean).join('\n');
    });

    return `Detailed Digest (${entries.length} documents)\n${'='.repeat(40)}\n${parts.join('\n\n---\n\n')}`;
  }

  /**
   * Executive format: high-level overview with key themes.
   * @param {object[]} entries
   * @returns {string}
   */
  #renderExecutive(entries) {
    // Aggregate all keywords across documents for theme detection
    const kwFreq = new Map();
    for (const entry of entries) {
      for (const kw of entry.keywords) {
        kwFreq.set(kw, (kwFreq.get(kw) || 0) + 1);
      }
    }
    const topThemes = [...kwFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([kw]) => kw);

    const entitySet = new Set();
    for (const entry of entries) {
      for (const e of entry.entities) entitySet.add(e);
    }

    const highlights = entries.map((e) => `• ${e.title || 'Untitled'}: ${e.summary || '(no summary)'}`);

    return [
      `Executive Digest`,
      `${'='.repeat(40)}`,
      `Documents reviewed: ${entries.length}`,
      `Key themes: ${topThemes.join(', ') || '(none)'}`,
      `Notable entities: ${[...entitySet].slice(0, 10).join(', ') || '(none)'}`,
      ``,
      `Highlights:`,
      highlights.join('\n'),
    ].join('\n');
  }
}

export default DigestGenerator;
