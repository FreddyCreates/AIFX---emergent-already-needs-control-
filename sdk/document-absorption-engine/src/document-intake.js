import crypto from 'node:crypto';

/**
 * Supported document formats for ingestion.
 * @readonly
 * @enum {string}
 */
const SUPPORTED_FORMATS = ['text', 'markdown', 'html', 'json', 'csv'];

/**
 * Processing status values.
 * @readonly
 * @enum {string}
 */
const STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Handles document intake with multi-format parsing, validation, and queue management.
 */
export class DocumentIntake {
  /** @type {Map<string, object>} */
  #documents = new Map();

  /** @type {Array<string>} */
  #queue = [];

  /** @type {boolean} */
  #processing = false;

  /**
   * Ingest a single document from a source string.
   * @param {string} source - Raw document content.
   * @param {string} format - One of `text`, `markdown`, `html`, `json`, `csv`.
   * @returns {{ id: string, status: string, metadata: object }} Ingestion receipt.
   */
  ingest(source, format) {
    if (typeof source !== 'string' || source.length === 0) {
      throw new Error('Source must be a non-empty string');
    }
    if (!SUPPORTED_FORMATS.includes(format)) {
      throw new Error(`Unsupported format "${format}". Use one of: ${SUPPORTED_FORMATS.join(', ')}`);
    }

    const id = crypto.randomUUID();
    const normalized = this.#normalize(source, format);

    const doc = {
      id,
      format,
      raw: source,
      normalized,
      status: STATUS.QUEUED,
      metadata: {
        ingestedAt: new Date().toISOString(),
        byteLength: Buffer.byteLength(source, 'utf8'),
        format,
        wordCount: normalized.split(/\s+/).filter(Boolean).length,
      },
    };

    this.#documents.set(id, doc);
    this.#queue.push(id);
    this.#processQueue();

    return { id, status: doc.status, metadata: doc.metadata };
  }

  /**
   * Ingest an array of documents.
   * @param {Array<{ source: string, format: string }>} sources
   * @returns {Array<{ id: string, status: string, metadata: object }>}
   */
  batchIngest(sources) {
    if (!Array.isArray(sources)) {
      throw new Error('Sources must be an array');
    }
    return sources.map(({ source, format }) => this.ingest(source, format));
  }

  /**
   * Returns the processing status for a given document ID.
   * @param {string} docId
   * @returns {{ id: string, status: string, metadata: object } | null}
   */
  getIngestionStatus(docId) {
    const doc = this.#documents.get(docId);
    if (!doc) return null;
    return { id: doc.id, status: doc.status, metadata: doc.metadata };
  }

  /**
   * Returns all ingested documents and their metadata.
   * @returns {Array<{ id: string, status: string, metadata: object }>}
   */
  listIngested() {
    return [...this.#documents.values()].map((doc) => ({
      id: doc.id,
      status: doc.status,
      metadata: doc.metadata,
    }));
  }

  /**
   * Retrieve the normalized content of a document by ID.
   * @param {string} docId
   * @returns {string | null}
   */
  getNormalizedContent(docId) {
    const doc = this.#documents.get(docId);
    return doc ? doc.normalized : null;
  }

  /**
   * Retrieve full document record by ID (internal use / pipeline integration).
   * @param {string} docId
   * @returns {object | null}
   */
  getDocument(docId) {
    return this.#documents.get(docId) ?? null;
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /** Drains the queue, marking each document as completed. */
  #processQueue() {
    if (this.#processing) return;
    this.#processing = true;

    while (this.#queue.length > 0) {
      const id = this.#queue.shift();
      const doc = this.#documents.get(id);
      if (!doc) continue;

      doc.status = STATUS.PROCESSING;
      try {
        // Parsing validation happens during normalization; mark completed.
        doc.status = STATUS.COMPLETED;
        doc.metadata.completedAt = new Date().toISOString();
      } catch (err) {
        doc.status = STATUS.FAILED;
        doc.metadata.error = err.message;
      }
    }

    this.#processing = false;
  }

  /**
   * Normalize raw source into plain text based on format.
   * @param {string} source
   * @param {string} format
   * @returns {string}
   */
  #normalize(source, format) {
    switch (format) {
      case 'text':
        return source.trim();

      case 'markdown':
        return source
          .replace(/^#{1,6}\s+/gm, '')      // strip heading markers
          .replace(/(\*{1,2}|_{1,2})/g, '')  // strip bold/italic markers
          .replace(/!\[.*?\]\(.*?\)/g, '')    // strip images
          .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // inline links → text
          .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, '')) // code
          .replace(/^\s*[-*+]\s+/gm, '')     // unordered list markers
          .replace(/^\s*\d+\.\s+/gm, '')     // ordered list markers
          .trim();

      case 'html':
        return source
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"')
          .replace(/\s+/g, ' ')
          .trim();

      case 'json': {
        const obj = JSON.parse(source); // validates JSON
        return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
      }

      case 'csv':
        return source
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .join('\n');

      default:
        return source.trim();
    }
  }
}

export default DocumentIntake;
