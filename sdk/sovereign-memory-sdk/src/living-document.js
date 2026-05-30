import crypto from 'node:crypto';

/**
 * LivingDocument — manages documents that evolve over time, tracking every
 * mutation as lineage and providing immutable snapshots at any point.
 */
export class LivingDocument {
  constructor() {
    /** @type {Map<string, object>} docId → current document state */
    this._docs = new Map();
    /** @type {Map<string, object[]>} docId → ordered mutation log */
    this._history = new Map();
  }

  /**
   * Create a new living document.
   * @param {string} title
   * @param {string} initialContent
   * @returns {{id: string, title: string, content: string, version: number, createdAt: number}}
   */
  create(title, initialContent) {
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const doc = {
      id,
      title,
      content: initialContent,
      version: 1,
      createdAt,
      updatedAt: createdAt,
    };

    this._docs.set(id, doc);
    this._history.set(id, [
      {
        mutationId: crypto.randomUUID(),
        type: 'create',
        before: null,
        after: initialContent,
        timestamp: createdAt,
        version: 1,
      },
    ]);

    return { id, title, content: initialContent, version: 1, createdAt };
  }

  /**
   * Evolve a document by applying a mutation.
   * @param {string} docId
   * @param {{type: string, content: string}} mutation — type is a label (e.g. "append", "replace"), content is the new body
   * @returns {{id: string, version: number, updatedAt: number}}
   */
  evolve(docId, mutation) {
    const doc = this._docs.get(docId);
    if (!doc) throw new Error(`Document ${docId} not found`);

    const before = doc.content;
    const after = mutation.content;
    const updatedAt = Date.now();
    const version = doc.version + 1;

    doc.content = after;
    doc.version = version;
    doc.updatedAt = updatedAt;

    const history = this._history.get(docId);
    history.push({
      mutationId: crypto.randomUUID(),
      type: mutation.type || 'update',
      before,
      after,
      timestamp: updatedAt,
      version,
    });

    return { id: docId, version, updatedAt };
  }

  /**
   * Return an immutable snapshot of the document at its current version.
   * @param {string} docId
   * @returns {{id: string, title: string, content: string, version: number, snapshotAt: number}}
   */
  snapshot(docId) {
    const doc = this._docs.get(docId);
    if (!doc) throw new Error(`Document ${docId} not found`);

    return Object.freeze({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      version: doc.version,
      snapshotAt: Date.now(),
    });
  }

  /**
   * Return the full evolution history (all mutations) for a document.
   * @param {string} docId
   * @returns {object[]}
   */
  getEvolutionHistory(docId) {
    const history = this._history.get(docId);
    if (!history) throw new Error(`Document ${docId} not found`);

    return history.map((entry) => ({ ...entry }));
  }
}

export default LivingDocument;
