/* API Mesh Adapter — Engine Service (EXT-038) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class ApiMeshAdapter {
  constructor() {
    // Schema registry: url pattern → detected schema
    this.schemaRegistry = new Map();
    this.interceptLog = [];
    this.maxLog = 500;
    this.interceptCount = 0;
    this.meshRoutes = 0;

    // Supported schema types
    this.SCHEMA_TYPES = {
      REST_JSON:    'rest-json',
      GRAPHQL:      'graphql',
      RSS_XML:      'rss-xml',
      CSV_TABLE:    'csv-table',
      KEY_VALUE:    'key-value',
      ARRAY:        'array',
      NESTED:       'nested-object',
      UNKNOWN:      'unknown'
    };

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };

    this._startHeartbeat();
  }

  /**
   * Intercept a data payload from the content layer.
   * Detects schema, normalizes, and routes to mesh.
   * @param {string} url
   * @param {any} rawData
   * @param {string} contentType
   * @returns {object} normalized mesh payload
   */
  intercept(url, rawData, contentType) {
    this.interceptCount++;

    var schema = this._detectSchema(rawData, contentType, url);
    var normalized = this._normalize(rawData, schema);
    var meshPayload = this._buildMeshPayload(url, schema, normalized);

    // Register schema for this URL pattern
    var pattern = this._urlPattern(url);
    this.schemaRegistry.set(pattern, { schema: schema, lastSeen: Date.now(), count: (this.schemaRegistry.get(pattern) || { count: 0 }).count + 1 });

    this.interceptLog.unshift({
      id: 'api-' + Date.now().toString(36),
      url: url,
      schema: schema,
      rowCount: normalized.rows ? normalized.rows.length : null,
      fieldCount: normalized.fields ? normalized.fields.length : null,
      timestamp: Date.now()
    });
    if (this.interceptLog.length > this.maxLog) this.interceptLog.pop();

    this.meshRoutes++;
    this._persist();

    return {
      success: true,
      schema: schema,
      payload: meshPayload,
      interceptCount: this.interceptCount,
      ring: 'transport'
    };
  }

  /**
   * Get schema registry summary.
   */
  getSchemaRegistry() {
    var result = [];
    this.schemaRegistry.forEach(function (info, pattern) {
      result.push({ pattern: pattern, schema: info.schema, count: info.count, lastSeen: info.lastSeen });
    });
    return result.sort(function (a, b) { return b.count - a.count; });
  }

  /**
   * Get recent intercept log entries.
   */
  getLog(n) {
    return this.interceptLog.slice(0, n || 50);
  }

  getState() {
    return {
      initialized: this.state.initialized,
      heartbeatCount: this.state.heartbeatCount,
      healthy: this.state.healthy,
      interceptCount: this.interceptCount,
      meshRoutes: this.meshRoutes,
      registeredSchemas: this.schemaRegistry.size
    };
  }

  _detectSchema(data, contentType, url) {
    var ct = (contentType || '').toLowerCase();
    var u = (url || '').toLowerCase();

    if (ct.indexOf('graphql') !== -1 || u.indexOf('/graphql') !== -1) return this.SCHEMA_TYPES.GRAPHQL;
    if (ct.indexOf('xml') !== -1 || ct.indexOf('rss') !== -1) return this.SCHEMA_TYPES.RSS_XML;

    if (typeof data === 'string') {
      var trimmed = data.trim();
      if (trimmed.indexOf('"data"') !== -1 && trimmed.indexOf('"errors"') !== -1) return this.SCHEMA_TYPES.GRAPHQL;
      if (trimmed.indexOf('<rss') !== -1 || trimmed.indexOf('<feed') !== -1) return this.SCHEMA_TYPES.RSS_XML;
      if (trimmed.indexOf(',') !== -1 && trimmed.split('\n').length > 2) return this.SCHEMA_TYPES.CSV_TABLE;
      try { data = JSON.parse(trimmed); } catch (e) { return this.SCHEMA_TYPES.UNKNOWN; }
    }

    if (Array.isArray(data)) return this.SCHEMA_TYPES.ARRAY;
    if (data && typeof data === 'object') {
      var keys = Object.keys(data);
      if (keys.length > 0 && typeof data[keys[0]] === 'object') return this.SCHEMA_TYPES.NESTED;
      return this.SCHEMA_TYPES.KEY_VALUE;
    }

    return this.SCHEMA_TYPES.UNKNOWN;
  }

  _normalize(data, schema) {
    try {
      if (schema === this.SCHEMA_TYPES.ARRAY) {
        var arr = Array.isArray(data) ? data : JSON.parse(data);
        var fields = arr.length > 0 && typeof arr[0] === 'object' ? Object.keys(arr[0]) : [];
        return { fields: fields, rows: arr.slice(0, 100), totalRows: arr.length };
      }
      if (schema === this.SCHEMA_TYPES.KEY_VALUE || schema === this.SCHEMA_TYPES.NESTED) {
        var obj = typeof data === 'string' ? JSON.parse(data) : data;
        return { fields: Object.keys(obj), rows: [obj], totalRows: 1 };
      }
      if (schema === this.SCHEMA_TYPES.CSV_TABLE) {
        var lines = (typeof data === 'string' ? data : '').split('\n').filter(Boolean);
        var headers = lines[0] ? lines[0].split(',').map(function (h) { return h.trim(); }) : [];
        var rows = lines.slice(1, 101).map(function (l) {
          var vals = l.split(',');
          var row = {};
          headers.forEach(function (h, i) { row[h] = vals[i] ? vals[i].trim() : ''; });
          return row;
        });
        return { fields: headers, rows: rows, totalRows: lines.length - 1 };
      }
    } catch (e) { /* pass through */ }
    return { fields: [], rows: [], totalRows: 0 };
  }

  _buildMeshPayload(url, schema, normalized) {
    // Phi-weight the payload priority based on data richness
    var richness = Math.min(1, (normalized.fields.length * 0.1 + normalized.totalRows * 0.01));
    var phiPriority = Math.round(richness * PHI * 1000) / 1000;

    return {
      id: 'mesh-' + Date.now().toString(36),
      source: url,
      schema: schema,
      fields: normalized.fields,
      rowCount: normalized.totalRows,
      previewRows: normalized.rows.slice(0, 5),
      phiPriority: phiPriority,
      routedAt: new Date().toISOString()
    };
  }

  _urlPattern(url) {
    try {
      var u = new URL(url);
      return u.hostname + u.pathname.replace(/\/\d+/g, '/:id');
    } catch (e) {
      return url.substring(0, 60);
    }
  }

  _persist() {
    try {
      chrome.storage.local.set({ 'api-mesh-adapter_log': this.interceptLog.slice(0, 50) });
    } catch (e) { }
  }

  _startHeartbeat() {
    setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }
}

globalThis.apiMeshAdapter = new ApiMeshAdapter();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.apiMeshAdapter;

  switch (message.action) {
    case 'intercept':
      sendResponse(engine.intercept(message.url, message.data, message.contentType));
      break;
    case 'getSchemaRegistry':
      sendResponse(engine.getSchemaRegistry());
      break;
    case 'getLog':
      sendResponse(engine.getLog(message.n));
      break;
    case 'getState':
      sendResponse(engine.getState());
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }
  return true;
});

/* ── Action click opens side panel ─────────────────────────── */
chrome.action.onClicked.addListener(function (tab) {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

/* ── Production 24/7 Keep-Alive ───────────────────────────── */
(function () {
  var ALARM_NAME = 'api-mesh-adapter-keepalive';
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.apiMeshAdapter) {
      globalThis.apiMeshAdapter = new ApiMeshAdapter();
    }
    try {
      chrome.storage.local.set({
        'api-mesh-adapter_state': {
          heartbeatCount: globalThis.apiMeshAdapter.state.heartbeatCount,
          interceptCount: globalThis.apiMeshAdapter.interceptCount,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });
  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  });
})();
