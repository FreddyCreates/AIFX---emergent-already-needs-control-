/**
 * 🔄 Universal CPL-P Runner
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Loads any `.cpl-p` pipeline file and executes its steps + branches.
 * Works for any domain: bot_cycle, economy_cycle, learning_cycle, etc.
 *
 * Pipeline file format (YAML-ish):
 * ---
 * id: "pipeline://governance/bot_cycle"
 * steps:
 *   - id: "ingest_events"
 *     use: "governance.ingest_events"
 *   - id: "apply_laws"
 *     use: "governance.apply_cpl_l"
 *   - id: "route_actions"
 *     use: "governance.route_actions"
 * branches:
 *   - id: "if_high_risk"
 *     when: 'context.risk_score > 0.7'
 *     then:
 *       type: "ESCALATE"
 *       target: "human://operator"
 *
 * Step functions are bound via `bindFunction(use_symbol, fn)`.
 * Each step receives `context` (mutable) and returns additions to it.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PIPELINES_DIR_DEFAULT = path.resolve(__dirname, '../../governance/pipelines');

class CplPRunner {
  /**
   * @param {string} [pipelineFile]   path to a specific .cpl-p file
   */
  constructor(pipelineFile = null) {
    this._pipelineFile = pipelineFile;
    this._pipeline     = null;
    this._functions    = new Map();
  }

  // ── Parser ───────────────────────────────────────────────────────────────────

  _parsePipeline(text) {
    const pipeline = { id: null, steps: [], branches: [], bindings: {} };

    const idMatch = text.match(/^id:\s*"([^"]+)"/m);
    if (idMatch) pipeline.id = idMatch[1];

    const lines = text.split('\n');
    let inSteps    = false;
    let inBranches = false;
    let inBindings = false;
    let currentStep = null;
    let currentBranch = null;
    let inThen = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trim = line.trim();

      if (trim.startsWith('#') || trim === '') continue;

      if (trim === 'steps:')    { inSteps = true; inBranches = false; inBindings = false; continue; }
      if (trim === 'branches:') { inBranches = true; inSteps = false; inBindings = false; continue; }
      if (trim === 'bindings:') { inBindings = true; inBranches = false; inSteps = false; continue; }

      if (inSteps) {
        const idMatch = trim.match(/^- id:\s*"([^"]+)"/);
        if (idMatch) {
          if (currentStep) pipeline.steps.push(currentStep);
          currentStep = { id: idMatch[1], use: null, description: null, on_error: 'continue', inputs: [], outputs: [] };
          continue;
        }
        if (currentStep) {
          const useMatch  = trim.match(/^use:\s*"([^"]+)"/);
          const descMatch = trim.match(/^description:\s*"([^"]+)"/);
          const errMatch  = trim.match(/^on_error:\s*"([^"]+)"/);
          if (useMatch)  currentStep.use         = useMatch[1];
          if (descMatch) currentStep.description = descMatch[1];
          if (errMatch)  currentStep.on_error    = errMatch[1];
        }
      }

      if (inBranches) {
        const idMatch = trim.match(/^- id:\s*"([^"]+)"/);
        if (idMatch) {
          if (currentBranch) pipeline.branches.push(currentBranch);
          currentBranch = { id: idMatch[1], when: null, then: { type: null, target: null } };
          inThen = false;
          continue;
        }
        if (currentBranch) {
          if (trim.startsWith('when:')) {
            currentBranch.when = trim.replace(/^when:\s*'/, '').replace(/'$/, '').trim();
          }
          if (trim === 'then:') { inThen = true; continue; }
          if (inThen) {
            const typeM   = trim.match(/^type:\s*"([^"]+)"/);
            const targetM = trim.match(/^target:\s*"([^"]+)"/);
            if (typeM)   currentBranch.then.type   = typeM[1];
            if (targetM) currentBranch.then.target = targetM[1];
          }
        }
      }

      if (inBindings) {
        const bindM = trim.match(/^"([^"]+)":\s*"([^"]+)"/);
        if (bindM) pipeline.bindings[bindM[1]] = bindM[2];
      }
    }

    if (currentStep) pipeline.steps.push(currentStep);
    if (currentBranch) pipeline.branches.push(currentBranch);

    return pipeline;
  }

  _load() {
    if (this._pipeline) return this._pipeline;
    if (!this._pipelineFile || !fs.existsSync(this._pipelineFile)) {
      this._pipeline = { id: 'pipeline://governance/default', steps: [], branches: [], bindings: {} };
      return this._pipeline;
    }
    this._pipeline = this._parsePipeline(fs.readFileSync(this._pipelineFile, 'utf8'));
    return this._pipeline;
  }

  // ── Function Binding ─────────────────────────────────────────────────────────

  /**
   * Bind a `use` symbol to a real function.
   * @param {string} symbol    e.g. "governance.apply_cpl_l"
   * @param {Function} fn      async (context) => partialContext
   */
  bind(symbol, fn) {
    this._functions.set(symbol, fn);
    return this;
  }

  /**
   * Bind multiple symbols at once
   * @param {object} bindings  { symbol: fn }
   */
  bindAll(bindings) {
    for (const [symbol, fn] of Object.entries(bindings)) {
      this._functions.set(symbol, fn);
    }
    return this;
  }

  // ── Condition Evaluator ───────────────────────────────────────────────────────

  _evalBranchCondition(whenExpr, context) {
    if (!whenExpr) return false;
    try {
      const fn = new Function('context', `"use strict"; try { return !!(${whenExpr}); } catch(e) { return false; }`);
      return fn(context);
    } catch {
      return false;
    }
  }

  // ── Pipeline Execution ────────────────────────────────────────────────────────

  /**
   * Run the pipeline with an initial context object.
   * @param {object} initialContext
   * @returns {object} final enriched context + audit trail
   */
  async run(initialContext = {}) {
    const pipeline = this._load();
    const audit    = [];
    const ctx      = { ...initialContext };

    ctx.pipeline_id = pipeline.id;
    ctx.steps_run   = [];
    ctx.branches_triggered = [];
    ctx.errors      = [];

    // Check branches upfront to see if any skip steps
    const skipSteps = new Set();
    for (const branch of pipeline.branches) {
      if (this._evalBranchCondition(branch.when, ctx)) {
        ctx.branches_triggered.push(branch.id);
        audit.push({ phase: 'branch', id: branch.id, type: branch.then?.type, target: branch.then?.target });

        if (Array.isArray(branch.skip_steps)) {
          for (const s of branch.skip_steps) skipSteps.add(s);
        }
      }
    }

    // Execute steps
    for (const step of pipeline.steps) {
      if (skipSteps.has(step.id)) {
        audit.push({ phase: 'step', id: step.id, status: 'skipped' });
        continue;
      }

      const fn = this._functions.get(step.use);
      const start = Date.now();

      if (!fn) {
        // No binding — log and continue unless on_error === 'stop'
        const entry = { phase: 'step', id: step.id, status: 'no_binding', use: step.use };
        audit.push(entry);
        if (step.on_error === 'stop') break;
        continue;
      }

      try {
        const result = await Promise.resolve(fn(ctx));
        if (result && typeof result === 'object') Object.assign(ctx, result);
        ctx.steps_run.push(step.id);
        audit.push({ phase: 'step', id: step.id, status: 'ok', ms: Date.now() - start });
      } catch (err) {
        ctx.errors.push({ step: step.id, error: err.message });
        audit.push({ phase: 'step', id: step.id, status: 'error', error: err.message, ms: Date.now() - start });
        if (step.on_error === 'stop') break;
      }
    }

    // Re-evaluate branches post-steps (decisions may have changed context)
    for (const branch of pipeline.branches) {
      if (ctx.branches_triggered.includes(branch.id)) continue; // already triggered
      if (this._evalBranchCondition(branch.when, ctx)) {
        ctx.branches_triggered.push(branch.id);
        audit.push({ phase: 'branch_post', id: branch.id, type: branch.then?.type, target: branch.then?.target });
      }
    }

    return { context: ctx, audit, pipeline_id: pipeline.id };
  }

  /**
   * Get pipeline metadata without running
   */
  metadata() {
    const p = this._load();
    return { id: p.id, steps: p.steps.map(s => s.id), branches: p.branches.map(b => b.id), bindings: Object.keys(p.bindings) };
  }
}

/**
 * Load a pipeline runner for a given domain
 * @param {'bot'|'economy'|'learning'|'topology'|'default'} domain
 */
CplPRunner.forDomain = function(domain, pipelinesDir = PIPELINES_DIR_DEFAULT) {
  const file = path.join(pipelinesDir, `${domain}-cycle.cpl-p`);
  if (fs.existsSync(file)) return new CplPRunner(file);
  const defaultFile = path.join(pipelinesDir, 'bot-governance.cpl-p');
  return new CplPRunner(fs.existsSync(defaultFile) ? defaultFile : null);
};

/**
 * Load all pipeline runners from a directory
 * @param {string} [pipelinesDir]
 * @returns {Map<string, CplPRunner>}  domain → runner
 */
CplPRunner.loadAll = function(pipelinesDir = PIPELINES_DIR_DEFAULT) {
  const runners = new Map();
  if (!fs.existsSync(pipelinesDir)) return runners;

  const files = fs.readdirSync(pipelinesDir).filter(f => f.endsWith('.cpl-p'));
  for (const file of files) {
    const domain = file.replace('-cycle.cpl-p', '').replace('-governance.cpl-p', '');
    runners.set(domain, new CplPRunner(path.join(pipelinesDir, file)));
  }
  return runners;
};

module.exports = CplPRunner;
