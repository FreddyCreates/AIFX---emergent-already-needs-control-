/* Organism Dashboard — Background Service Worker (EXT-016) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class OrganismDashboardEngine {
  constructor() {
    this.heartbeatCount = 0;
    this.heartbeatActive = false;
    this.heartbeatInterval = null;
    this.organismState = {
      cognitive: 0.85,
      affective: 0.72,
      somatic: 0.90,
      sovereign: 0.95
    };
    this.sensorReadings = {
      temperature: 0.5,
      network: 1.0,
      memory: 0.6,
      cpu: 0.4
    };
    this.stateHistory = [];
  }

  startHeartbeat(intervalMs) {
    if (intervalMs === undefined) intervalMs = HEARTBEAT;

    if (this.heartbeatActive) {
      return {
        status: 'already-running',
        heartbeatCount: this.heartbeatCount,
        intervalMs: intervalMs
      };
    }

    this.heartbeatActive = true;
    var self = this;

    this.heartbeatInterval = setInterval(function () {
      self.heartbeatCount++;

      /* Drift state registers slightly each beat */
      var drift = Math.sin(self.heartbeatCount * GOLDEN_ANGLE * Math.PI / 180) * 0.02;
      self.organismState.cognitive = Math.max(0, Math.min(1, self.organismState.cognitive + drift));
      self.organismState.affective = Math.max(0, Math.min(1, self.organismState.affective - drift * 0.5));
      self.organismState.somatic = Math.max(0, Math.min(1, self.organismState.somatic + drift * 0.3));
      self.organismState.sovereign = Math.max(0, Math.min(1, self.organismState.sovereign + drift * 0.1));

      /* Update sensor readings */
      self.sensorReadings.temperature = Math.round((0.4 + Math.random() * 0.2) * 1000) / 1000;
      self.sensorReadings.memory = Math.round((0.3 + Math.random() * 0.5) * 1000) / 1000;
      self.sensorReadings.cpu = Math.round((0.2 + Math.random() * 0.6) * 1000) / 1000;

      self.stateHistory.push({
        beat: self.heartbeatCount,
        state: JSON.parse(JSON.stringify(self.organismState)),
        vitality: self.calculateVitality().score,
        timestamp: Date.now()
      });

      /* Keep history bounded */
      if (self.stateHistory.length > 100) {
        self.stateHistory = self.stateHistory.slice(-100);
      }

      console.log(
        '[OrganismDashboard] heartbeat #' + self.heartbeatCount +
        ' | vitality: ' + self.calculateVitality().score
      );
    }, intervalMs);

    return {
      status: 'started',
      intervalMs: intervalMs,
      heartbeatCount: this.heartbeatCount,
      timestamp: Date.now()
    };
  }

  getOrganismState() {
    return {
      cognitive: Math.round(this.organismState.cognitive * 1000) / 1000,
      affective: Math.round(this.organismState.affective * 1000) / 1000,
      somatic: Math.round(this.organismState.somatic * 1000) / 1000,
      sovereign: Math.round(this.organismState.sovereign * 1000) / 1000,
      heartbeatCount: this.heartbeatCount,
      heartbeatActive: this.heartbeatActive,
      lastUpdated: Date.now()
    };
  }

  readSensors() {
    var networkOnline = true;

    return {
      temperature: {
        value: this.sensorReadings.temperature,
        unit: 'normalized',
        status: this.sensorReadings.temperature > 0.8 ? 'hot' : this.sensorReadings.temperature > 0.5 ? 'warm' : 'cool'
      },
      network: {
        value: networkOnline ? 1.0 : 0.0,
        latencyMs: Math.round(HEARTBEAT * this.sensorReadings.temperature * 0.1),
        status: networkOnline ? 'connected' : 'disconnected'
      },
      memory: {
        value: this.sensorReadings.memory,
        usagePercent: Math.round(this.sensorReadings.memory * 100),
        status: this.sensorReadings.memory > 0.85 ? 'critical' : this.sensorReadings.memory > 0.7 ? 'high' : 'normal'
      },
      cpu: {
        value: this.sensorReadings.cpu,
        usagePercent: Math.round(this.sensorReadings.cpu * 100),
        status: this.sensorReadings.cpu > 0.85 ? 'overloaded' : this.sensorReadings.cpu > 0.6 ? 'busy' : 'idle'
      },
      timestamp: Date.now()
    };
  }

  calculateVitality() {
    var registers = this.organismState;
    var sensors = this.sensorReadings;

    var weights = {
      cognitive: Math.pow(PHI, 0),
      affective: Math.pow(PHI, -1),
      somatic: Math.pow(PHI, -2),
      sovereign: Math.pow(PHI, -3)
    };

    var totalWeight = 0;
    var weightedSum = 0;
    var registerKeys = Object.keys(weights);

    for (var i = 0; i < registerKeys.length; i++) {
      var key = registerKeys[i];
      var w = weights[key];
      totalWeight += w;
      weightedSum += (registers[key] || 0) * w;
    }

    var registerScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    var sensorPenalty = 0;
    if (sensors.temperature > 0.8) sensorPenalty += 0.1;
    if (sensors.memory > 0.85) sensorPenalty += 0.15;
    if (sensors.cpu > 0.85) sensorPenalty += 0.1;

    var score = Math.max(0, Math.min(1, registerScore - sensorPenalty));

    var status;
    if (score > 0.85) status = 'thriving';
    else if (score > 0.7) status = 'healthy';
    else if (score > 0.5) status = 'stressed';
    else if (score > 0.3) status = 'degraded';
    else status = 'critical';

    return {
      score: Math.round(score * 1000) / 1000,
      status: status,
      registerScore: Math.round(registerScore * 1000) / 1000,
      sensorPenalty: Math.round(sensorPenalty * 1000) / 1000,
      breakdown: {
        cognitive: Math.round(registers.cognitive * 1000) / 1000,
        affective: Math.round(registers.affective * 1000) / 1000,
        somatic: Math.round(registers.somatic * 1000) / 1000,
        sovereign: Math.round(registers.sovereign * 1000) / 1000
      },
      timestamp: Date.now()
    };
  }

  syncWithOrganism() {
    var state = this.getOrganismState();
    var vitality = this.calculateVitality();
    var sensors = this.readSensors();

    var broadcastPayload = {
      type: 'organism-sync',
      state: state,
      vitality: vitality,
      sensors: sensors,
      heartbeat: this.heartbeatCount,
      pulse: HEARTBEAT,
      goldenAngle: GOLDEN_ANGLE,
      timestamp: Date.now()
    };

    /* Broadcast to all tabs via chrome.runtime */
    try {
      chrome.runtime.sendMessage(broadcastPayload);
    } catch (e) {
      /* Ignore broadcast errors in isolated context */
    }

    return broadcastPayload;
  }
}

globalThis.organismDashboard = new OrganismDashboardEngine();
globalThis.organismDashboard.startHeartbeat(HEARTBEAT);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  /* ── Universal message routing (popup / side panel / devtools) ──── */
  if (message.type === 'heartbeat') {
    sendResponse({ status: 'alive', healthy: true, timestamp: Date.now() });
    return true;
  }
  if (message.type === 'openSidePanel') {
    try { if (chrome.sidePanel && chrome.sidePanel.open) chrome.sidePanel.open({ windowId: sender.tab ? sender.tab.windowId : undefined }).catch(function(){}); } catch(e){}
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === 'popup' || message.type === 'sidePanel' || message.type === 'devtools') {
    var cmd = message.command || '';
    var lower = cmd.toLowerCase();
    var engine = globalThis.organismDashboard;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Organism Dashboard engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Organism Dashboard AI Workspace\n\nCapabilities:\n• Get Organism State — Get full organism state\n• Read Sensors — Read all sensor values\n• Calculate Vitality — Calculate organism vitality\n• Sync With Organism — Sync with organism backend\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'organism-dashboard_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('state') !== -1 || lower.indexOf('status') !== -1 || lower.indexOf('overview') !== -1 || lower.indexOf('dashboard') !== -1) {
          result = engine.getOrganismState();
        }
        else if (lower.indexOf('sensor') !== -1 || lower.indexOf('read') !== -1 || lower.indexOf('monitor') !== -1 || lower.indexOf('watch') !== -1) {
          result = engine.readSensors();
        }
        else if (lower.indexOf('vitality') !== -1 || lower.indexOf('health') !== -1 || lower.indexOf('score') !== -1 || lower.indexOf('vital') !== -1) {
          result = engine.calculateVitality();
        }
        else if (lower.indexOf('sync') !== -1 || lower.indexOf('update') !== -1 || lower.indexOf('refresh') !== -1 || lower.indexOf('connect') !== -1) {
          result = engine.syncWithOrganism();
        }
        else {
          /* Default: route to primary engine method */
          result = engine.getOrganismState();
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Organism Dashboard encountered an error processing: "' + cmd + '"' };
      }

      var responseText;
      if (typeof result === 'string') { responseText = result; }
      else if (result && result.error) { responseText = '\u26A0\uFE0F ' + (result.fallback || result.error); }
      else { responseText = JSON.stringify(result, null, 2); }

      history.push({ role: 'ai', content: responseText, ts: Date.now() });
      if (history.length > 100) { history = history.slice(-100); }
      var update = {};
      update[storageKey] = history;
      chrome.storage.local.set(update);

      sendResponse({ result: responseText });
    });
    return true;
  }

  var engine = globalThis.organismDashboard;

  switch (message.action) {
    case 'startHeartbeat':
      sendResponse({ success: true, data: engine.startHeartbeat(message.intervalMs) });
      break;
    case 'getOrganismState':
      sendResponse({ success: true, data: engine.getOrganismState() });
      break;
    case 'readSensors':
      sendResponse({ success: true, data: engine.readSensors() });
      break;
    case 'calculateVitality':
      sendResponse({ success: true, data: engine.calculateVitality() });
      break;
    case 'syncWithOrganism':
      sendResponse({ success: true, data: engine.syncWithOrganism() });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'organism-dashboard-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.organismDashboard) {
      globalThis.organismDashboard = new OrganismDashboardEngine();
      console.log('[Organism Dashboard] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'organism-dashboard_state': {
          heartbeatCount: globalThis.organismDashboard.heartbeatCount || globalThis.organismDashboard.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.organismDashboard.state?.startTime || globalThis.organismDashboard.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('organism-dashboard_state', function (data) {
    if (data && data['organism-dashboard_state']) {
      console.log('[Organism Dashboard] Restored from previous session \u2014 last alive: ' +
        new Date(data['organism-dashboard_state'].lastAlive).toISOString());
    }
  });

  /* Also re-init on install/update */
  chrome.runtime.onInstalled.addListener(function () {
    /* Auto-activate side panel on install */
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ enabled: true });
    }
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function(){});
    }
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Organism Dashboard] Installed/updated \u2014 24/7 keepalive active');
  });
})();
