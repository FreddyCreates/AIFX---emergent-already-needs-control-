/**
 * Telemetry & Health Worker — System-Wide Monitoring
 *
 * Permanent Web Worker that provides:
 * - Aggregated metrics from all organism workers
 * - Performance monitoring (latency, throughput, error rates)
 * - Ring health tracking (per-ring status dashboard)
 * - Uptime tracking with phi-weighted health scores
 * - Alert detection (degraded performance, worker failures)
 *
 * This worker IS the organism's immune system. It watches every other
 * worker, every ring, every wire — and reports health in real time.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'report', worker: 'engine'|'memory'|..., data: {...} }
 *   Main → Worker: { type: 'health' }
 *   Main → Worker: { type: 'dashboard' }
 *   Main → Worker: { type: 'alerts' }
 *   Main → Worker: { type: 'ring-status' }
 *   Main → Worker: { type: 'reset' }
 *   Worker → Main: { type: 'health-report', ... }
 *   Worker → Main: { type: 'dashboard-data', ... }
 *   Worker → Main: { type: 'alert', ... }
 *   Worker → Main: { type: 'ring-status', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Worker Health Registry — tracks all organism workers
   ════════════════════════════════════════════════════════════════ */

var KNOWN_WORKERS = ['engine', 'memory', 'routing', 'crypto', 'download', 'contract', 'scheduler', 'mesh', 'analytics', 'guardian', 'pipeline', 'inference', 'orchestrator'];

var workerHealth = Object.create(null);

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

function initWorkerHealth() {
  for (var i = 0; i < KNOWN_WORKERS.length; i++) {
    var name = KNOWN_WORKERS[i];
    workerHealth[name] = {
      name: name,
      status: 'unknown',   // unknown, alive, degraded, dead
      lastHeartbeat: 0,
      heartbeatCount: 0,
      missedHeartbeats: 0,
      totalReports: 0,
      lastReport: null,
      metrics: {},
      alerts: [],
      startTime: null,
      phiHealthScore: 1.0   // 0.0 = dead, 1.0 = perfect
    };
  }
}

initWorkerHealth();

/* ════════════════════════════════════════════════════════════════
   Ring Health — per-ring status
   ════════════════════════════════════════════════════════════════ */

var RINGS = [
  'Interface Ring', 'Memory Ring', 'Sovereign Ring', 'Build Ring',
  'Geometry Ring', 'Transport Ring', 'Native Capability Ring',
  'Proof Ring', 'Counsel Ring'
];

var ringHealth = Object.create(null);

function initRingHealth() {
  for (var i = 0; i < RINGS.length; i++) {
    ringHealth[RINGS[i]] = {
      name: RINGS[i],
      status: 'nominal',  // nominal, stressed, degraded, critical
      activeEngines: 0,
      totalTasks: 0,
      successRate: 100,
      avgLatencyMs: 0,
      lastActivity: null
    };
  }
}

initRingHealth();

/* ════════════════════════════════════════════════════════════════
   Aggregate Metrics
   ════════════════════════════════════════════════════════════════ */

var systemMetrics = {
  totalTasksProcessed: 0,
  totalErrors: 0,
  systemUptime: Date.now(),
  peakLatencyMs: 0,
  avgLatencyMs: 0,
  totalLatencyMs: 0,
  latencySamples: 0,
  alertsTriggered: 0
};

var activeAlerts = [];

/* ════════════════════════════════════════════════════════════════
   Report Processing — ingests metrics from other workers
   ════════════════════════════════════════════════════════════════ */

function processReport(workerName, data) {
  if (!isSafeKey(workerName)) return;

  var wh = workerHealth[workerName];
  if (!wh) {
    // Unknown worker — register dynamically
    workerHealth[workerName] = {
      name: workerName,
      status: 'alive',
      lastHeartbeat: Date.now(),
      heartbeatCount: 0,
      missedHeartbeats: 0,
      totalReports: 0,
      lastReport: null,
      metrics: {},
      alerts: [],
      startTime: Date.now(),
      phiHealthScore: 1.0
    };
    wh = workerHealth[workerName];
  }

  wh.totalReports++;
  wh.lastReport = Date.now();
  wh.status = 'alive';
  wh.missedHeartbeats = 0;

  // Merge metrics
  if (data) {
    for (var key in data) {
      if (!isSafeKey(key)) continue;
      wh.metrics[key] = data[key];
    }
  }

  // Update system metrics
  if (data && data.totalDispatched) {
    systemMetrics.totalTasksProcessed = Math.max(systemMetrics.totalTasksProcessed, data.totalDispatched);
  }
  if (data && data.totalFailed) {
    systemMetrics.totalErrors = Math.max(systemMetrics.totalErrors, data.totalFailed);
  }
  if (data && data.averageLatencyMs) {
    systemMetrics.totalLatencyMs += data.averageLatencyMs;
    systemMetrics.latencySamples++;
    systemMetrics.avgLatencyMs = systemMetrics.totalLatencyMs / systemMetrics.latencySamples;
    if (data.averageLatencyMs > systemMetrics.peakLatencyMs) {
      systemMetrics.peakLatencyMs = data.averageLatencyMs;
    }
  }

  // Recalculate phi health score
  recalcPhiHealth(wh);
}

function processHeartbeat(workerName) {
  if (!isSafeKey(workerName)) return;
  var wh = workerHealth[workerName];
  if (!wh) return;
  wh.lastHeartbeat = Date.now();
  wh.heartbeatCount++;
  wh.status = 'alive';
  wh.missedHeartbeats = 0;
  if (!wh.startTime) wh.startTime = Date.now();
}

function recalcPhiHealth(wh) {
  // Health = (1 - missedRate) * φ-weighted-uptime
  var missedRate = wh.heartbeatCount > 0 ? wh.missedHeartbeats / Math.max(wh.heartbeatCount, 1) : 0;
  var uptimeFactor = wh.startTime ? Math.min(1, (Date.now() - wh.startTime) / (60000 * PHI)) : 0;
  wh.phiHealthScore = Math.round((1 - missedRate) * (0.5 + uptimeFactor * 0.5) * 1000) / 1000;
}

/* ════════════════════════════════════════════════════════════════
   Health Check — runs every heartbeat
   ════════════════════════════════════════════════════════════════ */

function runHealthCheck() {
  var now = Date.now();

  for (var name in workerHealth) {
    var wh = workerHealth[name];
    if (wh.status === 'unknown') continue;

    // Check for missed heartbeats
    if (wh.lastHeartbeat > 0 && (now - wh.lastHeartbeat) > HEARTBEAT_MS * 3) {
      wh.missedHeartbeats++;
      if (wh.missedHeartbeats >= 5) {
        wh.status = 'dead';
        triggerAlert('worker-dead', name + ' worker is unresponsive', name);
      } else if (wh.missedHeartbeats >= 2) {
        wh.status = 'degraded';
      }
      recalcPhiHealth(wh);
    }
  }
}

function triggerAlert(alertType, message, source) {
  var alert = {
    id: 'alert-' + Date.now() + '-' + systemMetrics.alertsTriggered,
    type: alertType,
    message: message,
    source: source,
    timestamp: Date.now(),
    acknowledged: false
  };
  activeAlerts.push(alert);
  systemMetrics.alertsTriggered++;

  // Cap active alerts at 100
  if (activeAlerts.length > 100) {
    activeAlerts = activeAlerts.slice(-100);
  }

  self.postMessage({ type: 'alert', alert: alert });
}

/* ════════════════════════════════════════════════════════════════
   Dashboard Data
   ════════════════════════════════════════════════════════════════ */

function getDashboard() {
  var workers = [];
  for (var name in workerHealth) {
    var wh = workerHealth[name];
    workers.push({
      name: wh.name,
      status: wh.status,
      phiHealth: wh.phiHealthScore,
      heartbeats: wh.heartbeatCount,
      reports: wh.totalReports,
      lastSeen: wh.lastHeartbeat || wh.lastReport
    });
  }

  var rings = [];
  for (var rname in ringHealth) {
    rings.push(ringHealth[rname]);
  }

  return {
    workers: workers,
    rings: rings,
    system: {
      uptime: Date.now() - systemMetrics.systemUptime,
      totalTasks: systemMetrics.totalTasksProcessed,
      totalErrors: systemMetrics.totalErrors,
      avgLatencyMs: Math.round(systemMetrics.avgLatencyMs * 100) / 100,
      peakLatencyMs: systemMetrics.peakLatencyMs,
      activeAlerts: activeAlerts.filter(function (a) { return !a.acknowledged; }).length
    }
  };
}

function getHealthReport() {
  var aliveCount = 0;
  var totalWorkers = Object.keys(workerHealth).length;
  for (var name in workerHealth) {
    if (workerHealth[name].status === 'alive') aliveCount++;
  }

  var overallHealth = totalWorkers > 0 ? aliveCount / totalWorkers : 0;

  return {
    overall: overallHealth >= 0.8 ? 'healthy' : (overallHealth >= 0.5 ? 'degraded' : 'critical'),
    overallScore: Math.round(overallHealth * 100),
    workersAlive: aliveCount,
    workersTotal: totalWorkers,
    systemUptime: Date.now() - systemMetrics.systemUptime,
    alertCount: activeAlerts.length
  };
}

/* ════════════════════════════════════════════════════════════════
   Message handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'report': {
      processReport(msg.worker || 'unknown', msg.data || {});
      break;
    }

    case 'worker-heartbeat': {
      processHeartbeat(msg.worker || 'unknown');
      break;
    }

    case 'health': {
      self.postMessage({ type: 'health-report', data: getHealthReport() });
      break;
    }

    case 'dashboard': {
      self.postMessage({ type: 'dashboard-data', data: getDashboard() });
      break;
    }

    case 'alerts': {
      self.postMessage({ type: 'alerts-list', data: activeAlerts });
      break;
    }

    case 'ring-status': {
      var rings = [];
      for (var rname in ringHealth) rings.push(ringHealth[rname]);
      self.postMessage({ type: 'ring-status-data', data: rings });
      break;
    }

    case 'acknowledge-alert': {
      for (var i = 0; i < activeAlerts.length; i++) {
        if (activeAlerts[i].id === msg.alertId) {
          activeAlerts[i].acknowledged = true;
          break;
        }
      }
      break;
    }

    case 'reset': {
      systemMetrics.totalTasksProcessed = 0;
      systemMetrics.totalErrors = 0;
      systemMetrics.peakLatencyMs = 0;
      systemMetrics.avgLatencyMs = 0;
      systemMetrics.totalLatencyMs = 0;
      systemMetrics.latencySamples = 0;
      activeAlerts = [];
      initWorkerHealth();
      initRingHealth();
      self.postMessage({ type: 'telemetry-reset' });
      break;
    }

    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      self.postMessage({ type: 'stopped' });
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat — permanent 873ms pulse + health checks
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('telemetry');

var heartbeatInterval = setInterval(function () {
  if (!running) return;
  beatCount++;

  // Run health check every beat
  runHealthCheck();

  var payload = {
    type: 'heartbeat',
    worker: 'telemetry',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive'
  };

  // Add dashboard data every 10th beat
  if (beatCount % 10 === 0) {
    payload.dashboard = getDashboard();
    payload.health = getHealthReport();
  }

  payload.neuro = neuro.pulse();
  self.postMessage(payload);
}, HEARTBEAT_MS);
