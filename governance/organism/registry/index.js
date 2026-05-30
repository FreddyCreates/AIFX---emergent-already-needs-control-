/**
 * ATLAS ENTITY REGISTRY — Organism Bot Fleet
 * ═══════════════════════════════════════════
 *
 * Loads all bot entity definitions from governance/organism/registry/entities/
 * and exposes them as a queryable registry.
 *
 * Usage:
 *   const registry = require('./governance/organism/registry/index.js');
 *   const entity = registry.get('atlas://bot/organism-alpha-bot');
 *   const bots = registry.byDivision('Secure & Monitor');
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ENTITIES_DIR = path.join(__dirname, 'entities');

class AtlasRegistry {
  constructor() {
    this._entities = new Map();
    this._loaded = false;
  }

  load() {
    if (this._loaded) return this;
    const files = fs.readdirSync(ENTITIES_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const entity = JSON.parse(fs.readFileSync(path.join(ENTITIES_DIR, file), 'utf8'));
        this._entities.set(entity.id, entity);
      } catch (err) {
        console.warn(`[Atlas] Skipped malformed entity: ${file} — ${err.message}`);
      }
    }
    this._loaded = true;
    return this;
  }

  get(id) {
    this.load();
    return this._entities.get(id) || null;
  }

  getByName(name) {
    this.load();
    return Array.from(this._entities.values()).find(e => e.name === name) || null;
  }

  all() {
    this.load();
    return Array.from(this._entities.values());
  }

  byClass(cls) {
    this.load();
    return Array.from(this._entities.values()).filter(e => e.class === cls);
  }

  byDivision(division) {
    this.load();
    return Array.from(this._entities.values()).filter(e => e.division === division);
  }

  byCapability(capability) {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      Array.isArray(e.capabilities) && e.capabilities.includes(capability)
    );
  }

  /**
   * Get all bots that reference a specific law
   */
  byLaw(lawRef) {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      Array.isArray(e.law_refs) && e.law_refs.some(r => r.includes(lawRef))
    );
  }

  /**
   * Get all bots that reference a specific protocol
   */
  byProtocol(protocolRef) {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      Array.isArray(e.protocol_refs) && e.protocol_refs.some(r => r.includes(protocolRef))
    );
  }

  /**
   * Get all bots with microbots
   */
  withMicrobots() {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      Array.isArray(e.microbots) && e.microbots.length > 0
    );
  }

  /**
   * Fleet taxonomy summary
   */
  summary() {
    this.load();
    const all = Array.from(this._entities.values());
    const byDiv = {};
    for (const e of all) {
      if (!byDiv[e.division]) byDiv[e.division] = [];
      byDiv[e.division].push(e.name);
    }
    return {
      total: all.length,
      byDivision: byDiv,
      classes: [...new Set(all.map(e => e.class))],
      capabilities: [...new Set(all.flatMap(e => e.capabilities || []))],
    };
  }

  has(id) {
    this.load();
    return this._entities.has(id);
  }

  size() {
    this.load();
    return this._entities.size;
  }
}

// Singleton registry
const registry = new AtlasRegistry();

module.exports = registry;
module.exports.AtlasRegistry = AtlasRegistry;
