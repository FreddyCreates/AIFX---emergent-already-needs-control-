import crypto from 'node:crypto';

/**
 * Default stage processors used when no custom stages are provided.
 */
const DEFAULT_STAGES = [
  {
    name: 'intake',
    processor: (doc) => ({
      ...doc,
      _intake: { receivedAt: new Date().toISOString(), size: (doc.normalized ?? doc.raw ?? '').length },
    }),
  },
  {
    name: 'extract',
    processor: (doc) => {
      const text = doc.normalized ?? doc.raw ?? '';
      const words = text.split(/\s+/).filter(Boolean);
      return {
        ...doc,
        _extract: {
          wordCount: words.length,
          sentenceCount: text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length,
        },
      };
    },
  },
  {
    name: 'classify',
    processor: (doc) => {
      const text = (doc.normalized ?? doc.raw ?? '').toLowerCase();
      const categories = [];
      if (/\b(report|analysis|findings)\b/.test(text)) categories.push('report');
      if (/\b(memo|memorandum|internal)\b/.test(text)) categories.push('memo');
      if (/\b(research|study|experiment)\b/.test(text)) categories.push('research');
      if (/\b(guide|tutorial|how[\s-]?to)\b/.test(text)) categories.push('guide');
      if (categories.length === 0) categories.push('general');
      return { ...doc, _classify: { categories } };
    },
  },
  {
    name: 'index',
    processor: (doc) => {
      const text = (doc.normalized ?? doc.raw ?? '').toLowerCase();
      const tokens = text.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
      const index = {};
      for (const token of tokens) {
        index[token] = (index[token] || 0) + 1;
      }
      return { ...doc, _index: { tokenCount: tokens.length, uniqueTokens: Object.keys(index).length } };
    },
  },
  {
    name: 'absorb',
    processor: (doc) => ({
      ...doc,
      _absorb: { absorbedAt: new Date().toISOString(), status: 'absorbed' },
    }),
  },
];

/**
 * Manages configurable document processing pipelines with per-stage metrics.
 */
export class AbsorptionPipeline {
  /** @type {Map<string, object>} */
  #pipelines = new Map();

  /**
   * Create a new named pipeline.
   * @param {string} name - Human-readable pipeline name.
   * @param {Array<{ name: string, processor: function }>} [stages] - Pipeline stages; defaults to the built-in five-stage pipeline.
   * @returns {{ id: string, name: string, stageNames: string[] }}
   */
  createPipeline(name, stages) {
    if (!name || typeof name !== 'string') throw new Error('Pipeline name is required');

    const resolvedStages = Array.isArray(stages) && stages.length > 0 ? stages : DEFAULT_STAGES;

    for (const stage of resolvedStages) {
      if (!stage.name || typeof stage.processor !== 'function') {
        throw new Error(`Each stage must have a "name" string and a "processor" function`);
      }
    }

    const id = crypto.randomUUID();

    this.#pipelines.set(id, {
      id,
      name,
      stages: resolvedStages,
      outputs: [],
      metrics: resolvedStages.map((s) => ({
        stage: s.name,
        invocations: 0,
        totalMs: 0,
      })),
    });

    return { id, name, stageNames: resolvedStages.map((s) => s.name) };
  }

  /**
   * Feed a document through every stage of the specified pipeline.
   * @param {string} pipelineId
   * @param {object} document - Document object (usually from DocumentIntake).
   * @returns {object} The fully-processed document.
   */
  feed(pipelineId, document) {
    const pipeline = this.#pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline "${pipelineId}" not found`);

    let result = { ...document };

    for (let i = 0; i < pipeline.stages.length; i++) {
      const stage = pipeline.stages[i];
      const start = performance.now();
      result = stage.processor(result);
      const elapsed = performance.now() - start;

      pipeline.metrics[i].invocations += 1;
      pipeline.metrics[i].totalMs += elapsed;
    }

    pipeline.outputs.push(result);
    return result;
  }

  /**
   * Retrieve all processed outputs for a pipeline.
   * @param {string} pipelineId
   * @returns {object[]}
   */
  getOutput(pipelineId) {
    const pipeline = this.#pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline "${pipelineId}" not found`);
    return [...pipeline.outputs];
  }

  /**
   * Return per-stage timing and throughput metrics.
   * @param {string} pipelineId
   * @returns {Array<{ stage: string, invocations: number, totalMs: number, avgMs: number }>}
   */
  getPipelineMetrics(pipelineId) {
    const pipeline = this.#pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline "${pipelineId}" not found`);

    return pipeline.metrics.map((m) => ({
      stage: m.stage,
      invocations: m.invocations,
      totalMs: Math.round(m.totalMs * 100) / 100,
      avgMs: m.invocations > 0 ? Math.round((m.totalMs / m.invocations) * 100) / 100 : 0,
    }));
  }
}

export default AbsorptionPipeline;
