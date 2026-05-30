/**
 * ⚖️ Universal CPL-L Engine
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Loads any `.cpl-l` law file and evaluates rules against entity + event context.
 * Works for any entity class: Bot, Agent, Organism, Realm, Engine, Terminal.
 *
 * Law file format (YAML-ish):
 * ---
 * id: "LAW_ID"
 * subjects:
 *   - id: "atlas://bot/organism-release-bot"
 *     rules:
 *       - name: "RULE_NAME"
 *         when: 'context.risk_score > 0.7 && entity.division == "Secure & Monitor"'
 *         then:
 *           - { action: "FORBID", target: "release" }
 *           - { action: "REQUIRE", target: "human_review", arg: "security_team" }
 *
 * Condition DSL:
 *   context.*   — event context fields
 *   entity.*    — entity registry fields (class, division, domain, capabilities, etc.)
 *   event.*     — full event (op, tags, ts, etc.)
 *
 * Decision actions: FORBID | ALLOW | REQUIRE | ESCALATE | NOTIFY | QUARANTINE
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const glob = require('fs');

const LAWS_DIR_DEFAULT = path.resolve(__dirname, '../../governance/laws');

class CplLEngine {
  /**
   * @param {string|string[]} [lawFiles]  specific .cpl-l files to load, or directory to scan
   */
  constructor(lawFiles = null) {
    this._lawFiles  = lawFiles;
    this._subjects  = null;  // loaded lazily
  }

  // ── Law File Parser ──────────────────────────────────────────────────────────

  _parseLaws(yamlText) {
    const subjects  = [];
    let currentSubj = null;
    let currentRule = null;
    let inSubjects  = false;
    let inThen      = false;

    const lines = yamlText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trim = line.trim();

      if (trim.startsWith('#') || trim === '') continue;

      if (trim === 'subjects:') { inSubjects = true; continue; }
      if (!inSubjects) continue;

      const subjectMatch = trim.match(/^- id:\s*"(atlas:\/\/[^"]+)"/);
      if (subjectMatch) {
        if (currentRule && currentSubj) currentSubj.rules.push(currentRule);
        currentRule = null;
        if (currentSubj) subjects.push(currentSubj);
        currentSubj = { id: subjectMatch[1], rules: [] };
        inThen = false;
        continue;
      }
      if (!currentSubj) continue;

      const ruleMatch = trim.match(/^- name:\s*"([^"]+)"/);
      if (ruleMatch) {
        if (currentRule) currentSubj.rules.push(currentRule);
        currentRule = { name: ruleMatch[1], when: null, then: [] };
        inThen = false;
        continue;
      }
      if (!currentRule) continue;

      if (trim.startsWith('when:')) {
        currentRule.when = trim.replace(/^when:\s*'/, '').replace(/'$/, '').trim();
        inThen = false;
        continue;
      }
      if (trim === 'then:') { inThen = true; continue; }

      if (inThen && trim.startsWith('- action:')) {
        const action = trim.replace(/^- action:\s*["']?/, '').replace(/["']$/, '').trim();
        let target = '', reason = '', arg = '';
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          const lt = lines[j].trim();
          if (lt.startsWith('- action:') || lt === 'then:' || lt.startsWith('- name:') || lt.startsWith('- id:')) break;
          const tm = lt.match(/^target:\s*["']?([^"'\n]+?)["']?$/);
          const rm = lt.match(/^reason:\s*["']?(.+?)["']?$/);
          const am = lt.match(/^arg:\s*["']?([^"'\n]+?)["']?$/);
          if (tm) target = tm[1].trim();
          if (rm) reason = rm[1].trim();
          if (am) arg    = am[1].trim();
        }
        currentRule.then.push({ action, target, reason, arg });
      }
    }

    if (currentRule && currentSubj) currentSubj.rules.push(currentRule);
    if (currentSubj) subjects.push(currentSubj);
    return subjects;
  }

  _loadSubjects() {
    if (this._subjects) return this._subjects;

    let files = [];
    if (!this._lawFiles) {
      // Scan default laws directory
      if (fs.existsSync(LAWS_DIR_DEFAULT)) {
        files = fs.readdirSync(LAWS_DIR_DEFAULT)
          .filter(f => f.endsWith('.cpl-l'))
          .map(f => path.join(LAWS_DIR_DEFAULT, f));
      }
    } else if (Array.isArray(this._lawFiles)) {
      files = this._lawFiles;
    } else if (typeof this._lawFiles === 'string') {
      if (fs.statSync(this._lawFiles).isDirectory()) {
        files = fs.readdirSync(this._lawFiles)
          .filter(f => f.endsWith('.cpl-l'))
          .map(f => path.join(this._lawFiles, f));
      } else {
        files = [this._lawFiles];
      }
    }

    this._subjects = [];
    this._lawSources = {};

    for (const file of files) {
      if (!fs.existsSync(file)) continue;
      const text     = fs.readFileSync(file, 'utf8');
      const lawId    = text.match(/^id:\s*"([^"]+)"/m)?.[1] || path.basename(file, '.cpl-l');
      const subjects = this._parseLaws(text);
      for (const s of subjects) {
        this._lawSources[s.id] = this._lawSources[s.id] || [];
        this._lawSources[s.id].push({ lawId, rules: s.rules });
      }
      this._subjects.push(...subjects);
    }

    return this._subjects;
  }

  // ── Condition Evaluator ────────────────────────────────────────────────────

  _evalCondition(conditionExpr, entity, event, context) {
    if (!conditionExpr) return false;
    try {
      const fn = new Function(
        'entity', 'event', 'context',
        `"use strict"; try { return !!(${conditionExpr}); } catch(e) { return false; }`
      );
      return fn(entity || {}, event || {}, context || {});
    } catch {
      return false;
    }
  }

  // ── Apply Laws ──────────────────────────────────────────────────────────────

  /**
   * Evaluate all loaded laws against an entity + event.
   *
   * @param {string} entityId   atlas URI
   * @param {object} entity     entity object from registry (may be null)
   * @param {object} event      full event object
   * @param {object} context    event.context enriched with fleet state
   * @returns {{ decisions, blocked, required, escalations }}
   */
  apply(entityId, entity, event, context) {
    this._loadSubjects();

    const entityRules = this._lawSources?.[entityId] || [];
    const decisions   = [];
    let blocked       = false;
    const required    = [];
    const escalations = [];

    for (const { lawId, rules } of entityRules) {
      for (const rule of rules) {
        if (!rule.when) continue;

        const triggered = this._evalCondition(rule.when, entity, event, context);
        if (!triggered) continue;

        for (const action of rule.then) {
          const decision = {
            rule:    rule.name,
            law:     lawId,
            action:  action.action,
            target:  action.target,
            reason:  action.reason,
            arg:     action.arg,
            entity:  entityId,
            at:      new Date().toISOString(),
          };
          decisions.push(decision);

          if (action.action === 'FORBID')    blocked = true;
          if (action.action === 'REQUIRE')   required.push({ target: action.target, arg: action.arg });
          if (action.action === 'ESCALATE')  escalations.push({ target: action.target, reason: action.reason });
        }
      }
    }

    return { decisions, blocked, required, escalations };
  }

  /**
   * Apply laws to a full batch of events (grouped by entity_id)
   * @param {object[]} events
   * @param {Map<string, object>} entityMap   entityId → entity object
   * @returns {object[]}  results per event
   */
  applyBatch(events, entityMap = new Map()) {
    return events.map(evt => {
      const entity  = entityMap.get(evt.entity_id) || null;
      const context = {
        ...evt.context,
        entity_id: evt.entity_id,
        op:        evt.op,
        tags:      evt.tags || [],
      };
      return {
        event_id:  evt.id,
        entity_id: evt.entity_id,
        op:        evt.op,
        ...this.apply(evt.entity_id, entity, evt, context),
      };
    });
  }

  /**
   * Get all subject IDs this engine has rules for
   */
  subjects() {
    this._loadSubjects();
    return Object.keys(this._lawSources || {});
  }

  /**
   * List all rules for a given entity
   */
  rulesFor(entityId) {
    this._loadSubjects();
    return (this._lawSources?.[entityId] || []).flatMap(s => s.rules.map(r => ({ law: s.lawId, ...r })));
  }
}

module.exports = CplLEngine;
