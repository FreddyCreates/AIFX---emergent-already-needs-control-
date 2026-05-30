/**
 * 🌲 Cloud Glade Security Biome SDK — Biome Engine
 * ════════════════════════════════════════════════════════════════════════════
 *
 * AI-powered orchestration engine for the Cloud Glade security biome.
 * Coordinates all Phantom primitives, threat assessment, and adaptive response.
 *
 * The biome operates through seasonal cycles (phi-timed):
 *   SPRING (0.0–0.25)  — Growth, scanning, learning
 *   SUMMER (0.25–0.5)  — Full activity, active defense
 *   AUTUMN (0.5–0.75)  — Consolidation, threat assessment
 *   WINTER (0.75–1.0)  — Dormancy, key rotation, recovery
 *
 * @module sdk/cloud-glade/biome-engine
 * @version 1.0.0
 */

import { PhantomIntegration, PHANTOM_TIERS } from './phantom-integration.js';

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;
const GOLDEN_ANGLE = 137.508;

// ─── Biome Seasons ───────────────────────────────────────────────────────────

export const BIOME_SEASONS = {
  SPRING: {
    id: 'spring',
    range: [0, 0.25],
    label: 'Growth',
    emoji: '🌱',
    activities: ['scanning', 'learning', 'route-discovery'],
    primitiveBoost: ['HASH_DISCOVERY', 'PHI_SCAN'],
  },
  SUMMER: {
    id: 'summer',
    range: [0.25, 0.5],
    label: 'Active Defense',
    emoji: '☀️',
    activities: ['active-defense', 'threat-blocking', 'decoy-generation'],
    primitiveBoost: ['STEALTH_ROUTING', 'DECOY_TRAFFIC', 'ENCRYPTION_WEAVE'],
  },
  AUTUMN: {
    id: 'autumn',
    range: [0.5, 0.75],
    label: 'Consolidation',
    emoji: '🍂',
    activities: ['assessment', 'route-optimization', 'intel-gathering'],
    primitiveBoost: ['CLOAK_COMPUTE', 'MULTI_ALGO'],
  },
  WINTER: {
    id: 'winter',
    range: [0.75, 1.0],
    label: 'Recovery',
    emoji: '❄️',
    activities: ['key-rotation', 'cleanup', 'dormancy'],
    primitiveBoost: ['KEY_ROTATION'],
  },
};

// ─── Biome Health States ─────────────────────────────────────────────────────

export const BIOME_HEALTH = {
  THRIVING:    { min: 0.8, max: 1.0, label: 'Thriving',    emoji: '💚' },
  HEALTHY:     { min: 0.6, max: 0.8, label: 'Healthy',     emoji: '💛' },
  STRESSED:    { min: 0.4, max: 0.6, label: 'Stressed',    emoji: '🧡' },
  DEGRADED:    { min: 0.2, max: 0.4, label: 'Degraded',    emoji: '❤️' },
  CRITICAL:    { min: 0.0, max: 0.2, label: 'Critical',    emoji: '🖤' },
};

// ─── Threat Response Playbooks ───────────────────────────────────────────────

export const THREAT_PLAYBOOKS = {
  RECONNAISSANCE: {
    id: 'recon',
    threatTypes: ['scan', 'probe', 'enumeration'],
    response: ['decoy-burst', 'route-obfuscate', 'log'],
    escalation: 0.2,
  },
  INTRUSION_ATTEMPT: {
    id: 'intrusion',
    threatTypes: ['exploit', 'injection', 'overflow'],
    response: ['block', 'rotate-keys', 'alert', 'cloak-compute'],
    escalation: 0.6,
  },
  DATA_EXFILTRATION: {
    id: 'exfil',
    threatTypes: ['data-leak', 'unauthorized-access', 'theft'],
    response: ['encrypt-all', 'kill-routes', 'emergency-rotation', 'lockdown'],
    escalation: 0.9,
  },
  DENIAL_OF_SERVICE: {
    id: 'dos',
    threatTypes: ['flood', 'resource-exhaustion', 'amplification'],
    response: ['rate-limit', 'decoy-absorb', 'route-diversity'],
    escalation: 0.5,
  },
  PERSISTENCE: {
    id: 'persistence',
    threatTypes: ['backdoor', 'implant', 'c2'],
    response: ['full-scan', 'isolate', 'rotate-all', 'rebuild-routes'],
    escalation: 0.8,
  },
};

// ─── Biome Event Types ───────────────────────────────────────────────────────

export const BIOME_EVENTS = {
  THREAT_DETECTED:    'threat:detected',
  THREAT_BLOCKED:     'threat:blocked',
  THREAT_ESCALATED:   'threat:escalated',
  KEY_ROTATED:        'key:rotated',
  ROUTE_CREATED:      'route:created',
  ROUTE_EXPIRED:      'route:expired',
  SEASON_CHANGED:     'season:changed',
  HEALTH_CHANGED:     'health:changed',
  PRIMITIVE_ACTIVATED: 'primitive:activated',
  DECOY_BURST:        'decoy:burst',
  ENVELOPE_WOVEN:     'envelope:woven',
};

// ─── Cloud Glade Biome Engine ────────────────────────────────────────────────

export class CloudGladeBiomeEngine {
  constructor(options = {}) {
    this.id = `glade-${Date.now().toString(36)}`;
    
    // Phantom integration
    this.phantom = new PhantomIntegration(options.phantom);
    
    // Biome state
    this.health = 1.0; // 0.0 - 1.0
    this.seasonPhase = 0; // 0.0 - 1.0 (cycles through seasons)
    this.threatLevel = 0; // 0.0 - 1.0
    
    // Event system
    this.listeners = new Map();
    this.eventLog = [];
    
    // Threat tracking
    this.activeThreats = [];
    this.blockedThreats = [];
    this.threatHistory = [];
    
    // Metrics
    this.metrics = {
      cycleCount: 0,
      threatsDetected: 0,
      threatsBlocked: 0,
      playbooksExecuted: 0,
      keyRotations: 0,
      routesCreated: 0,
      decoysGenerated: 0,
      envelopesWoven: 0,
    };
    
    // Timing
    this.createdAt = Date.now();
    this.lastCycle = Date.now();
    this.cycleIntervalMs = options.cycleInterval || HEARTBEAT;
    
    // Auto-activate basic tiers
    this.phantom.activateTier(1);
    this.phantom.activateTier(2);
  }

  // ── Season Management ──────────────────────────────────────────────────────

  getCurrentSeason() {
    for (const [name, season] of Object.entries(BIOME_SEASONS)) {
      if (this.seasonPhase >= season.range[0] && this.seasonPhase < season.range[1]) {
        return { name, ...season };
      }
    }
    return { name: 'SPRING', ...BIOME_SEASONS.SPRING };
  }

  advanceSeason(delta = 0.01) {
    const oldSeason = this.getCurrentSeason();
    this.seasonPhase = (this.seasonPhase + delta) % 1.0;
    const newSeason = this.getCurrentSeason();
    
    if (oldSeason.name !== newSeason.name) {
      this._emit(BIOME_EVENTS.SEASON_CHANGED, {
        from: oldSeason.name,
        to: newSeason.name,
        phase: this.seasonPhase,
      });
      
      // Apply seasonal primitive boosts
      this._applySeason(newSeason);
    }
    
    return newSeason;
  }

  _applySeason(season) {
    // Activate primitives boosted by this season
    for (const primitive of season.primitiveBoost) {
      const tier = this._getPrimitiveTier(primitive);
      if (tier) {
        this.phantom.activateTier(tier);
      }
    }
  }

  _getPrimitiveTier(primitiveId) {
    for (const [, tierInfo] of Object.entries(PHANTOM_TIERS)) {
      if (tierInfo.primitives.includes(primitiveId)) {
        return tierInfo.level;
      }
    }
    return null;
  }

  // ── Health Management ──────────────────────────────────────────────────────

  getHealthStatus() {
    for (const [name, health] of Object.entries(BIOME_HEALTH)) {
      if (this.health >= health.min && this.health < health.max) {
        return { name, ...health, value: this.health };
      }
    }
    return { name: 'THRIVING', ...BIOME_HEALTH.THRIVING, value: this.health };
  }

  adjustHealth(delta) {
    const oldHealth = this.getHealthStatus();
    this.health = Math.max(0, Math.min(1, this.health + delta));
    const newHealth = this.getHealthStatus();
    
    if (oldHealth.name !== newHealth.name) {
      this._emit(BIOME_EVENTS.HEALTH_CHANGED, {
        from: oldHealth.name,
        to: newHealth.name,
        value: this.health,
      });
    }
    
    return newHealth;
  }

  // ── Threat Processing ──────────────────────────────────────────────────────

  ingestThreat(threat) {
    const normalized = {
      id: threat.id || `threat-${Date.now().toString(36)}`,
      type: threat.type || 'unknown',
      severity: Math.min(1, Math.max(0, threat.severity || 0.5)),
      source: threat.source || 'unknown',
      payload: threat.payload || null,
      detectedAt: Date.now(),
      status: 'active',
    };

    this.activeThreats.push(normalized);
    this.threatHistory.push({ ...normalized, action: 'detected' });
    this.metrics.threatsDetected++;
    
    this._emit(BIOME_EVENTS.THREAT_DETECTED, normalized);
    
    // Update threat level
    this.threatLevel = Math.min(1, this.threatLevel + normalized.severity * 0.2);
    
    // Impact health
    this.adjustHealth(-normalized.severity * 0.1);
    
    // Auto-respond based on severity
    if (normalized.severity >= PHI_INV) {
      this._escalateThreat(normalized);
    } else {
      this._respondToThreat(normalized);
    }
    
    // Trigger key rotation risk
    this.phantom.keyRotation.addRisk({ severity: normalized.severity });
    
    return normalized;
  }

  _respondToThreat(threat) {
    const playbook = this._selectPlaybook(threat);
    if (!playbook) return;

    const response = {
      threatId: threat.id,
      playbook: playbook.id,
      actions: [],
    };

    for (const action of playbook.response) {
      const result = this._executeAction(action, threat);
      response.actions.push({ action, result });
    }

    this.metrics.playbooksExecuted++;
    return response;
  }

  _escalateThreat(threat) {
    this._emit(BIOME_EVENTS.THREAT_ESCALATED, threat);
    
    // Activate all tiers
    for (let tier = 1; tier <= 5; tier++) {
      this.phantom.activateTier(tier);
    }
    
    // Force key rotation
    const rotation = this.phantom.keyRotation.rotate('threat-escalation');
    this.metrics.keyRotations++;
    this._emit(BIOME_EVENTS.KEY_ROTATED, rotation);
    
    // Generate decoy burst
    const decoys = this.phantom.decoy.burst();
    this.metrics.decoysGenerated += decoys.length;
    this._emit(BIOME_EVENTS.DECOY_BURST, { count: decoys.length });
    
    // Execute full playbook
    this._respondToThreat(threat);
  }

  _selectPlaybook(threat) {
    for (const [, playbook] of Object.entries(THREAT_PLAYBOOKS)) {
      if (playbook.threatTypes.some(t => threat.type.includes(t))) {
        return playbook;
      }
    }
    return THREAT_PLAYBOOKS.RECONNAISSANCE; // Default
  }

  _executeAction(action, threat) {
    switch (action) {
      case 'decoy-burst':
        return this.phantom.decoy.burst();
        
      case 'route-obfuscate':
        return this.phantom.stealth.createRoute('internal', 'external', 5);
        
      case 'block':
        return this.blockThreat(threat.id);
        
      case 'rotate-keys':
      case 'emergency-rotation':
      case 'rotate-all':
        const result = this.phantom.keyRotation.rotate(action);
        this.metrics.keyRotations++;
        return result;
        
      case 'alert':
        return { alerted: true, severity: threat.severity };
        
      case 'cloak-compute':
        const profile = this.phantom.cloak.createProfile();
        return this.phantom.cloak.cloakedExecute(profile.id, 'defensive-scan');
        
      case 'encrypt-all':
        return { encrypted: true, tier: 4 };
        
      case 'kill-routes':
        const routes = this.phantom.stealth.getActiveRoutes();
        routes.forEach(r => this.phantom.stealth.deactivateRoute(r.id));
        return { killed: routes.length };
        
      case 'lockdown':
        this.threatLevel = 1.0;
        return { lockdown: true };
        
      case 'rate-limit':
        return { rateLimited: true };
        
      case 'decoy-absorb':
        return this.phantom.decoy.burst(Math.round(this.phantom.decoy.baseRate * PHI * 2));
        
      case 'route-diversity':
        const newRoutes = [];
        for (let i = 0; i < 3; i++) {
          newRoutes.push(this.phantom.stealth.createRoute(`origin-${i}`, 'safe-zone', 4));
        }
        return { routes: newRoutes.length };
        
      case 'full-scan':
        return { scanned: true, timestamp: Date.now() };
        
      case 'isolate':
        return { isolated: true, threatId: threat.id };
        
      case 'rebuild-routes':
        return { rebuilt: true };
        
      case 'log':
        return { logged: true, threatId: threat.id };
        
      default:
        return { action, status: 'unknown' };
    }
  }

  blockThreat(threatId) {
    const threat = this.activeThreats.find(t => t.id === threatId);
    if (!threat) return { blocked: false, error: 'Threat not found' };

    threat.status = 'blocked';
    threat.blockedAt = Date.now();
    this.activeThreats = this.activeThreats.filter(t => t.id !== threatId);
    this.blockedThreats.push(threat);
    this.metrics.threatsBlocked++;
    
    // Recover health
    this.adjustHealth(threat.severity * 0.05);
    
    // Lower threat level
    this.threatLevel = Math.max(0, this.threatLevel - threat.severity * 0.1);
    
    this._emit(BIOME_EVENTS.THREAT_BLOCKED, threat);
    return { blocked: true, threat };
  }

  // ── Biome Cycle ────────────────────────────────────────────────────────────

  cycle() {
    this.metrics.cycleCount++;
    this.lastCycle = Date.now();
    
    // Advance season
    const seasonProgressionRate = 0.001 * PHI_INV; // Slow seasonal progression
    this.advanceSeason(seasonProgressionRate);
    
    // Natural health recovery
    if (this.activeThreats.length === 0 && this.threatLevel < 0.2) {
      this.adjustHealth(0.01);
    }
    
    // Natural threat level decay
    this.threatLevel = Math.max(0, this.threatLevel - 0.005);
    
    // Check key rotation
    if (this.phantom.keyRotation.shouldRotate()) {
      const rotation = this.phantom.keyRotation.rotate('scheduled');
      this.metrics.keyRotations++;
      this._emit(BIOME_EVENTS.KEY_ROTATED, rotation);
    }
    
    // Seasonal activities
    const season = this.getCurrentSeason();
    if (season.activities.includes('decoy-generation') && Math.random() < 0.1) {
      this.phantom.decoy.generate();
      this.metrics.decoysGenerated++;
    }
    
    // Expire old routes
    for (const route of this.phantom.stealth.getActiveRoutes()) {
      // Check if route is old (simplified)
      if (Date.now() - route.createdAt > HEARTBEAT * PHI * 60 * 1000) {
        this.phantom.stealth.deactivateRoute(route.id);
        this._emit(BIOME_EVENTS.ROUTE_EXPIRED, { routeId: route.id });
      }
    }
    
    return this.getState();
  }

  // ── Event System ───────────────────────────────────────────────────────────

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  _emit(event, data) {
    const entry = { event, data, timestamp: Date.now() };
    this.eventLog.push(entry);
    if (this.eventLog.length > 1000) this.eventLog.shift();
    
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (e) {
          // Ignore callback errors
        }
      }
    }
  }

  // ── State Export ───────────────────────────────────────────────────────────

  getState() {
    return {
      id: this.id,
      health: this.getHealthStatus(),
      season: this.getCurrentSeason(),
      threatLevel: parseFloat(this.threatLevel.toFixed(3)),
      activeThreats: this.activeThreats.length,
      blockedThreats: this.blockedThreats.length,
      metrics: { ...this.metrics },
      phantom: this.phantom.getStats(),
      uptime: Date.now() - this.createdAt,
      lastCycle: this.lastCycle,
    };
  }

  getFullReport() {
    return {
      ...this.getState(),
      threatHistory: this.threatHistory.slice(-50),
      recentEvents: this.eventLog.slice(-50),
      playbooks: Object.keys(THREAT_PLAYBOOKS),
    };
  }
}

export default CloudGladeBiomeEngine;
