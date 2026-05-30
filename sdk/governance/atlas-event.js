/**
 * 📡 Atlas Universal Event Schema
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Canonical event format for every entity in the Atlas universe:
 * bots, agents, organisms, realms, terminals, engines.
 *
 * Schema:
 * {
 *   id:         "evt-{ISO-timestamp}",      — unique event ID
 *   entity_id:  "atlas://bot/alpha-bot",    — any atlas URI
 *   op:         "fleet_census_completed",   — what happened
 *   ts:         "2026-05-03T04:30:00.000Z", — ISO timestamp
 *   context:    { ...domain payload },      — structured data
 *   tags:       ["bot", "alpha", "census"]  — routing hints
 * }
 *
 * All events are written to dist/governance/events/{entity-slug}-{ts}.json
 * The atlas-governance-cycle.js ingests all files in that directory.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const EVENTS_DIR_DEFAULT = path.resolve(__dirname, '../../dist/governance/events');

class AtlasEvent {
  /**
   * @param {object} opts
   * @param {string} opts.entity_id    atlas URI of the emitting entity
   * @param {string} opts.op           operation name
   * @param {object} [opts.context]    domain-specific payload
   * @param {string[]} [opts.tags]     routing hints
   */
  constructor({ entity_id, op, context = {}, tags = [] }) {
    if (!entity_id) throw new Error('AtlasEvent: entity_id is required');
    if (!op)        throw new Error('AtlasEvent: op is required');

    this.id        = `evt-${new Date().toISOString()}`;
    this.entity_id = entity_id;
    this.op        = op;
    this.ts        = new Date().toISOString();
    this.context   = context;
    this.tags      = Array.isArray(tags) ? tags : [tags];
  }

  /**
   * Serialize to plain JSON-compatible object
   */
  toJSON() {
    return {
      id:        this.id,
      entity_id: this.entity_id,
      op:        this.op,
      ts:        this.ts,
      context:   this.context,
      tags:      this.tags,
    };
  }

  /**
   * Write event to dist/governance/events/
   * @param {string} [eventsDir]  override default events dir
   * @returns {string}  path of written file
   */
  emit(eventsDir = EVENTS_DIR_DEFAULT) {
    fs.mkdirSync(eventsDir, { recursive: true });

    // Slug the entity_id: atlas://bot/organism-alpha-bot → organism-alpha-bot
    const slug = this.entity_id.replace(/^atlas:\/\/[^/]+\//, '').replace(/[^a-z0-9-]/gi, '-');
    const ts   = this.ts.replace(/[:.]/g, '-');
    const file = path.join(eventsDir, `${slug}-${ts}.json`);

    fs.writeFileSync(file, JSON.stringify(this.toJSON(), null, 2));
    return file;
  }

  // ── Convenience factories ─────────────────────────────────────────────────

  static bot(name, op, context = {}, extraTags = []) {
    return new AtlasEvent({
      entity_id: `atlas://bot/${name}`,
      op,
      context,
      tags: ['bot', ...extraTags],
    });
  }

  static agent(name, op, context = {}, extraTags = []) {
    return new AtlasEvent({
      entity_id: `atlas://agent/${name}`,
      op,
      context,
      tags: ['agent', ...extraTags],
    });
  }

  static organism(name, op, context = {}, extraTags = []) {
    return new AtlasEvent({
      entity_id: `atlas://organism/${name}`,
      op,
      context,
      tags: ['organism', ...extraTags],
    });
  }

  static engine(name, op, context = {}, extraTags = []) {
    return new AtlasEvent({
      entity_id: `atlas://engine/${name}`,
      op,
      context,
      tags: ['engine', ...extraTags],
    });
  }

  static realm(name, op, context = {}, extraTags = []) {
    return new AtlasEvent({
      entity_id: `atlas://realm/${name}`,
      op,
      context,
      tags: ['realm', ...extraTags],
    });
  }

  /**
   * Load all events from a directory
   * @param {string} [eventsDir]
   * @returns {AtlasEvent[]}  raw objects (not class instances, just parsed JSON)
   */
  static loadAll(eventsDir = EVENTS_DIR_DEFAULT) {
    if (!fs.existsSync(eventsDir)) return [];
    return fs.readdirSync(eventsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(eventsDir, f), 'utf8')); }
        catch { return null; }
      })
      .filter(Boolean);
  }

  /**
   * Ingest events from a directory, group by entity_id / class / tag
   * @param {string} [eventsDir]
   * @returns {{ all: object[], byEntity: Map, byClass: Map, byTag: Map }}
   */
  static ingest(eventsDir = EVENTS_DIR_DEFAULT) {
    const all = AtlasEvent.loadAll(eventsDir);

    const byEntity = new Map();
    const byClass  = new Map();   // "bot", "agent", "organism", "realm", "engine", "terminal"
    const byTag    = new Map();

    for (const evt of all) {
      // Entity grouping
      if (!byEntity.has(evt.entity_id)) byEntity.set(evt.entity_id, []);
      byEntity.get(evt.entity_id).push(evt);

      // Class extraction from atlas URI: atlas://bot/... → "bot"
      const cls = evt.entity_id?.match(/^atlas:\/\/([^/]+)\//)?.[1] || 'unknown';
      if (!byClass.has(cls)) byClass.set(cls, []);
      byClass.get(cls).push(evt);

      // Tag grouping
      for (const tag of (evt.tags || [])) {
        if (!byTag.has(tag)) byTag.set(tag, []);
        byTag.get(tag).push(evt);
      }
    }

    return { all, byEntity, byClass, byTag };
  }
}

module.exports = AtlasEvent;
