import crypto from 'node:crypto';

/**
 * MemoryLineage — tracks parent/child ancestry of memory records,
 * supports forking and branch consolidation.
 */
export class MemoryLineage {
  constructor() {
    /** @type {Map<string, string[]>} childId → [parentIds] */
    this._parents = new Map();
    /** @type {Map<string, string[]>} parentId → [childIds] */
    this._children = new Map();
    /** @type {Map<string, object>} forkId → fork metadata */
    this._forks = new Map();
  }

  /**
   * Record that `childId` descends from `parentId`.
   * @param {string} childId
   * @param {string} parentId
   * @returns {{childId: string, parentId: string, recorded: number}}
   */
  recordAncestor(childId, parentId) {
    const parents = this._parents.get(childId) || [];
    if (!parents.includes(parentId)) {
      parents.push(parentId);
    }
    this._parents.set(childId, parents);

    const children = this._children.get(parentId) || [];
    if (!children.includes(childId)) {
      children.push(childId);
    }
    this._children.set(parentId, children);

    return { childId, parentId, recorded: Date.now() };
  }

  /**
   * Return the full ancestor chain for a memory, walking upward to the root(s).
   * @param {string} memoryId
   * @returns {string[]} ordered list of ancestor ids, oldest first
   */
  getLineage(memoryId) {
    const chain = [];
    const visited = new Set();
    const queue = [memoryId];

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      const parents = this._parents.get(current) || [];
      for (const pid of parents) {
        chain.push(pid);
        queue.push(pid);
      }
    }

    return chain.reverse();
  }

  /**
   * Fork a memory into a new branch, creating an independent descendant.
   * @param {string} memoryId — source memory to fork from
   * @param {string} newBranch — human-readable branch label
   * @returns {{forkId: string, sourceId: string, branch: string, timestamp: number}}
   */
  fork(memoryId, newBranch) {
    const forkId = crypto.randomUUID();
    const timestamp = Date.now();

    this.recordAncestor(forkId, memoryId);

    const meta = { forkId, sourceId: memoryId, branch: newBranch, timestamp };
    this._forks.set(forkId, meta);

    return meta;
  }

  /**
   * Consolidate (merge) multiple lineage branches into a single new memory.
   * @param {string[]} memoryIds — ids of memories to merge
   * @returns {{mergedId: string, sources: string[], timestamp: number}}
   */
  consolidate(memoryIds) {
    if (!memoryIds || memoryIds.length < 2) {
      throw new Error('consolidate requires at least two memory ids');
    }

    const mergedId = crypto.randomUUID();
    const timestamp = Date.now();

    for (const mid of memoryIds) {
      this.recordAncestor(mergedId, mid);
    }

    return { mergedId, sources: [...memoryIds], timestamp };
  }
}

export default MemoryLineage;
