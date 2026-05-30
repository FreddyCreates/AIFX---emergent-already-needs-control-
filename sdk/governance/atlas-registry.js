/**
 * 🗂️ Universal Atlas Registry
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Generalized entity registry for the entire Atlas universe.
 * Loads from any directory of entity JSON files, not just bots.
 *
 * Entity classes: Bot | Agent | Organism | Engine | Realm | Terminal
 * All entity URIs follow: atlas://{class}/{name}
 *
 * Merges multiple registry directories (bots + agents + organisms etc.)
 * and provides a unified queryable interface.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');

// All registry directories to merge
const DEFAULT_REGISTRY_DIRS = [
  path.join(REPO, 'governance', 'organism', 'registry', 'entities'),  // bots (21)
  path.join(REPO, 'governance', 'registry', 'entities'),              // agents, organisms, engines
];

class UniversalAtlasRegistry {
  constructor(dirs = DEFAULT_REGISTRY_DIRS) {
    this._dirs     = Array.isArray(dirs) ? dirs : [dirs];
    this._entities = new Map();
    this._loaded   = false;
  }

  load() {
    if (this._loaded) return this;
    for (const dir of this._dirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        try {
          const entity = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
          if (entity.id) this._entities.set(entity.id, entity);
        } catch (err) {
          console.warn(`[Atlas] Skipped: ${file} — ${err.message}`);
        }
      }
    }
    this._loaded = true;
    return this;
  }

  reload() {
    this._entities.clear();
    this._loaded = false;
    return this.load();
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
    return Array.from(this._entities.values()).filter(e =>
      e.class?.toLowerCase() === cls.toLowerCase()
    );
  }

  byDivision(division) {
    this.load();
    return Array.from(this._entities.values()).filter(e => e.division === division);
  }

  byDomain(domain) {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      e.domain?.toLowerCase().includes(domain.toLowerCase())
    );
  }

  byCapability(cap) {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      Array.isArray(e.capabilities) && e.capabilities.includes(cap)
    );
  }

  byLaw(lawRef) {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      Array.isArray(e.law_refs) && e.law_refs.some(r => r.includes(lawRef))
    );
  }

  byProtocol(protocolRef) {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      Array.isArray(e.protocol_refs) && e.protocol_refs.some(r => r.includes(protocolRef))
    );
  }

  /**
   * Get entities that emit a given event op
   */
  byEventOp(op) {
    this.load();
    return Array.from(this._entities.values()).filter(e =>
      Array.isArray(e.events) && e.events.includes(op)
    );
  }

  /**
   * Get entity by atlas URI prefix (class)
   * e.g. atlas://bot/* → all bots
   */
  byAtlasClass(atlasClass) {
    this.load();
    const prefix = `atlas://${atlasClass}/`;
    return Array.from(this._entities.values()).filter(e =>
      e.id?.startsWith(prefix)
    );
  }

  has(id) {
    this.load();
    return this._entities.has(id);
  }

  size() {
    this.load();
    return this._entities.size;
  }

  /**
   * Full taxonomy summary
   */
  summary() {
    this.load();
    const all = Array.from(this._entities.values());
    const byClass = {};
    const byDiv   = {};
    const caps    = new Set();

    for (const e of all) {
      const cls = e.class || 'Unknown';
      if (!byClass[cls]) byClass[cls] = [];
      byClass[cls].push(e.name || e.id);

      if (e.division) {
        if (!byDiv[e.division]) byDiv[e.division] = [];
        byDiv[e.division].push(e.name || e.id);
      }

      for (const c of (e.capabilities || [])) caps.add(c);
    }

    return {
      total: all.length,
      byClass,
      byDivision: byDiv,
      capabilities: [...caps],
    };
  }

  /**
   * Register a new entity in-memory (without writing to disk)
   */
  register(entity) {
    if (!entity.id) throw new Error('Entity must have an id');
    this.load();
    this._entities.set(entity.id, entity);
    return this;
  }
}

// Singleton
const registry = new UniversalAtlasRegistry();
module.exports = registry;
module.exports.UniversalAtlasRegistry = UniversalAtlasRegistry;
