/**
 * 🧠 Universal Atlas Memory Store
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Persistent memory across governance cycles for pattern detection.
 *
 * Stores:
 *   MML (Meta-Memory Layer)  — law trigger stats, pipeline stats per domain
 *   RIL (Runtime Incident Log) — recurring incidents by entity/pattern
 *   UEL (Universe Evolution Log) — evolution rules proposed by meta engine
 *
 * Writes to dist/governance/ as JSON files.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const AUDIT_DIR_DEFAULT = path.resolve(__dirname, '../../dist/governance');

class AtlasMemory {
  constructor(dir = AUDIT_DIR_DEFAULT) {
    this._dir = dir;
    fs.mkdirSync(dir, { recursive: true });
  }

  _file(name) { return path.join(this._dir, name); }
  _read(name, fallback) {
    const f = this._file(name);
    if (!fs.existsSync(f)) return fallback;
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; }
  }
  _write(name, data) {
    fs.writeFileSync(this._file(name), JSON.stringify(data, null, 2));
  }
  _append(name, entry) {
    fs.appendFileSync(this._file(name), JSON.stringify({ ...entry, at: new Date().toISOString() }) + '\n');
  }

  // ── MML — Meta-Memory Layer ────────────────────────────────────────────────

  /**
   * Record law evaluation results for MML
   * @param {object[]} decisions    from CplLEngine.apply()
   * @param {string} entityId
   * @param {boolean} blocked
   * @param {string} domain
   */
  recordLawStats({ decisions = [], entityId, blocked = false, domain = 'bot' }) {
    const mml = this._read('mml-stats.json', { cycles: 0, domains: {}, entities: {}, rules: {} });
    mml.cycles++;

    // Domain stats
    if (!mml.domains[domain]) mml.domains[domain] = { cycles: 0, blocked: 0, escalated: 0, total_decisions: 0 };
    mml.domains[domain].cycles++;
    if (blocked) mml.domains[domain].blocked++;
    mml.domains[domain].total_decisions += decisions.length;

    // Entity stats
    const ek = entityId;
    if (!mml.entities[ek]) mml.entities[ek] = { blocked: 0, allowed: 0, escalated: 0, rules_triggered: 0, domain };
    if (blocked) mml.entities[ek].blocked++; else mml.entities[ek].allowed++;
    mml.entities[ek].rules_triggered += decisions.length;
    mml.entities[ek].domain = domain;

    for (const d of decisions) {
      if (d.action === 'ESCALATE') {
        mml.entities[ek].escalated++;
        mml.domains[domain].escalated++;
      }
      // Rule stats
      const rk = `${d.law}#${d.rule}`;
      if (!mml.rules[rk]) mml.rules[rk] = { triggered: 0, entities: [], domains: [] };
      mml.rules[rk].triggered++;
      if (!mml.rules[rk].entities.includes(ek)) mml.rules[rk].entities.push(ek);
      if (!mml.rules[rk].domains.includes(domain)) mml.rules[rk].domains.push(domain);
    }

    mml.updated_at = new Date().toISOString();
    this._write('mml-stats.json', mml);
    return mml;
  }

  /**
   * Record pipeline execution stats
   * @param {string} pipelineId
   * @param {object} result    from CplPRunner.run()
   * @param {string} domain
   */
  recordPipelineStats({ pipelineId, result, domain = 'bot' }) {
    const ps = this._read('pipeline-stats.json', { cycles: 0, pipelines: {} });
    ps.cycles++;

    if (!ps.pipelines[pipelineId]) {
      ps.pipelines[pipelineId] = { runs: 0, success: 0, errors: 0, escalations: 0, avg_steps: 0, domain };
    }
    const p = ps.pipelines[pipelineId];
    p.runs++;

    const hasError    = (result.context?.errors?.length || 0) > 0;
    const escalated   = (result.context?.branches_triggered || []).some(b => b.includes('high_risk'));
    if (!hasError)  p.success++;
    if (hasError)   p.errors++;
    if (escalated)  p.escalations++;
    p.avg_steps = ((p.avg_steps * (p.runs - 1)) + (result.context?.steps_run?.length || 0)) / p.runs;

    ps.updated_at = new Date().toISOString();
    this._write('pipeline-stats.json', ps);
    return ps;
  }

  // ── RIL — Runtime Incident Log ────────────────────────────────────────────

  /**
   * Record a runtime incident
   * @param {object} incident  { entity_id, cause, severity, context }
   */
  recordIncident(incident) {
    this._append('ril.jsonl', {
      id: `ril-${Date.now().toString(36)}`,
      ...incident,
    });
  }

  /**
   * Read recent incidents (last N)
   * @param {number} n
   */
  recentIncidents(n = 20) {
    const f = this._file('ril.jsonl');
    if (!fs.existsSync(f)) return [];
    const lines = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean);
    return lines.slice(-n).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  }

  /**
   * Get incident patterns (most frequent causes)
   * @returns {{ cause: string, count: number, entities: string[] }[]}
   */
  incidentPatterns() {
    const incidents = this.recentIncidents(200);
    const causes = {};
    for (const inc of incidents) {
      const c = inc.cause || 'unknown';
      if (!causes[c]) causes[c] = { cause: c, count: 0, entities: [] };
      causes[c].count++;
      if (inc.entity_id && !causes[c].entities.includes(inc.entity_id)) {
        causes[c].entities.push(inc.entity_id);
      }
    }
    return Object.values(causes).sort((a, b) => b.count - a.count);
  }

  // ── UEL — Universe Evolution Log ─────────────────────────────────────────

  /**
   * Add a universe evolution rule/proposal
   * @param {object} rule  { id, type, description, suggestion, source }
   */
  addEvolutionRule(rule) {
    const uel = this._read('uel-rules.json', { rules: [], updated_at: null });
    const existing = uel.rules.findIndex(r => r.id === rule.id);
    if (existing >= 0) {
      uel.rules[existing] = { ...uel.rules[existing], ...rule, updated_at: new Date().toISOString() };
    } else {
      uel.rules.push({ ...rule, created_at: new Date().toISOString() });
    }
    uel.updated_at = new Date().toISOString();
    this._write('uel-rules.json', uel);
  }

  /**
   * Get all active evolution rules
   */
  evolutionRules() {
    return this._read('uel-rules.json', { rules: [] }).rules;
  }

  // ── Audit Log ────────────────────────────────────────────────────────────

  appendAudit(entry) {
    this._append('audit-log.jsonl', entry);
  }

  recentAudit(n = 50) {
    const f = this._file('audit-log.jsonl');
    if (!fs.existsSync(f)) return [];
    const lines = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean);
    return lines.slice(-n).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  }

  // ── MML Snapshot ─────────────────────────────────────────────────────────

  mmlSnapshot() { return this._read('mml-stats.json', {}); }
  pipelineSnapshot() { return this._read('pipeline-stats.json', {}); }
}

// Singleton
const memory = new AtlasMemory();
module.exports = memory;
module.exports.AtlasMemory = AtlasMemory;
