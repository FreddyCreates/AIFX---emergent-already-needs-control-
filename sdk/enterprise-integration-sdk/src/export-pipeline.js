import crypto from 'node:crypto';

/**
 * @typedef {Object} TransformStep
 * @property {string} type - 'filter' | 'map' | 'aggregate' | 'enrich' | 'deduplicate'
 * @property {function | Object} config - Step-specific configuration or function
 */

/**
 * @typedef {Object} Destination
 * @property {string} type - 'file' | 'api' | 'database' | 's3' | 'webhook'
 * @property {Object} config - Destination-specific configuration
 */

/**
 * @typedef {'idle' | 'running' | 'completed' | 'failed' | 'scheduled'} PipelineStatus
 */

/**
 * Configurable export pipeline engine. Define a source, chain transform steps,
 * and push data to a destination — on demand or on a cron schedule.
 */
export class ExportPipeline {
  constructor() {
    /** @type {Map<string, Object>} */
    this._pipelines = new Map();
    /** @type {Map<string, Object[]>} execution history keyed by pipelineId */
    this._history = new Map();
  }

  /**
   * Define a new export pipeline.
   *
   * @param {string} name - Human-readable pipeline name
   * @param {Object} source - Data source descriptor (e.g. `{ type: 'connector', connectorId, entity }`)
   * @param {TransformStep[]} transforms - Ordered list of transform steps
   * @param {Destination} destination - Where to export the final data
   * @returns {{ pipelineId: string, name: string, status: PipelineStatus, createdAt: string }}
   */
  createPipeline(name, source, transforms = [], destination) {
    if (!name) throw new Error('Pipeline name is required');
    if (!source) throw new Error('Source configuration is required');
    if (!destination) throw new Error('Destination configuration is required');

    const pipelineId = crypto.randomUUID();
    const now = new Date().toISOString();

    const pipeline = {
      pipelineId,
      name,
      source: { ...source },
      transforms: transforms.map((t, i) => ({ order: i, ...t })),
      destination: { ...destination },
      status: /** @type {PipelineStatus} */ ('idle'),
      schedule: null,
      createdAt: now,
      lastRunAt: null,
    };

    this._pipelines.set(pipelineId, pipeline);
    this._history.set(pipelineId, []);

    return { pipelineId, name, status: 'idle', createdAt: now };
  }

  /**
   * Execute a pipeline immediately.
   *
   * @param {string} pipelineId
   * @returns {{ pipelineId: string, executionId: string, status: PipelineStatus, recordsProcessed: number, startedAt: string, completedAt: string }}
   */
  execute(pipelineId) {
    const pipeline = this._pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline "${pipelineId}" not found`);

    const executionId = crypto.randomUUID();
    const startedAt = new Date().toISOString();

    pipeline.status = 'running';

    // Simulate extract → transform → load
    let records = this._extract(pipeline.source);
    const transformResults = [];

    for (const step of pipeline.transforms) {
      const before = records.length;
      records = this._applyTransform(step, records);
      transformResults.push({
        step: step.type,
        order: step.order,
        inputCount: before,
        outputCount: records.length,
      });
    }

    const loadResult = this._load(pipeline.destination, records);

    const completedAt = new Date().toISOString();
    pipeline.status = 'completed';
    pipeline.lastRunAt = completedAt;

    const execution = {
      executionId,
      pipelineId,
      status: 'completed',
      recordsProcessed: records.length,
      transformResults,
      loadResult,
      startedAt,
      completedAt,
    };

    this._history.get(pipelineId).push(execution);

    return {
      pipelineId,
      executionId,
      status: 'completed',
      recordsProcessed: records.length,
      startedAt,
      completedAt,
    };
  }

  /**
   * Schedule recurring pipeline execution.
   *
   * @param {string} pipelineId
   * @param {string} cron - Cron expression (e.g. `'0 * * * *'` for hourly)
   * @returns {{ pipelineId: string, status: PipelineStatus, schedule: string, scheduledAt: string }}
   */
  schedule(pipelineId, cron) {
    const pipeline = this._pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline "${pipelineId}" not found`);
    if (!cron) throw new Error('Cron expression is required');

    if (!/^[\d*\/,\-]+(\s+[\d*\/,\-]+){4}$/.test(cron.trim())) {
      throw new Error(`Invalid cron expression: "${cron}"`);
    }

    const now = new Date().toISOString();
    pipeline.schedule = cron.trim();
    pipeline.status = 'scheduled';

    this._history.get(pipelineId).push({
      executionId: null,
      pipelineId,
      status: 'scheduled',
      schedule: cron.trim(),
      scheduledAt: now,
    });

    return {
      pipelineId,
      status: 'scheduled',
      schedule: cron.trim(),
      scheduledAt: now,
    };
  }

  /**
   * Return the execution history for a pipeline.
   *
   * @param {string} pipelineId
   * @returns {{ pipelineId: string, name: string, executions: Object[] }}
   */
  getHistory(pipelineId) {
    const pipeline = this._pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline "${pipelineId}" not found`);

    return {
      pipelineId,
      name: pipeline.name,
      status: pipeline.status,
      schedule: pipeline.schedule,
      executions: [...this._history.get(pipelineId)],
    };
  }

  /**
   * Simulate data extraction from a source.
   * @param {Object} source
   * @returns {Object[]}
   */
  _extract(source) {
    const count = source.sampleSize ?? 100;
    return Array.from({ length: count }, (_, i) => ({
      id: crypto.randomUUID(),
      index: i,
      sourceType: source.type,
      extractedAt: new Date().toISOString(),
    }));
  }

  /**
   * Apply a single transform step to a set of records.
   * @param {TransformStep} step
   * @param {Object[]} records
   * @returns {Object[]}
   */
  _applyTransform(step, records) {
    switch (step.type) {
      case 'filter': {
        const fn = typeof step.config === 'function' ? step.config : () => true;
        return records.filter(fn);
      }
      case 'map': {
        const fn = typeof step.config === 'function' ? step.config : (r) => r;
        return records.map(fn);
      }
      case 'aggregate': {
        // Group all records into a single summary record
        return [{ aggregatedCount: records.length, aggregatedAt: new Date().toISOString() }];
      }
      case 'enrich': {
        return records.map((r) => ({ ...r, enrichedAt: new Date().toISOString() }));
      }
      case 'deduplicate': {
        const key = step.config?.key ?? 'id';
        const seen = new Set();
        return records.filter((r) => {
          const k = r[key];
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      }
      default:
        return records;
    }
  }

  /**
   * Simulate loading records into a destination.
   * @param {Destination} destination
   * @param {Object[]} records
   * @returns {{ destinationType: string, recordsLoaded: number, loadedAt: string }}
   */
  _load(destination, records) {
    return {
      destinationType: destination.type,
      recordsLoaded: records.length,
      loadedAt: new Date().toISOString(),
    };
  }
}

export default ExportPipeline;
