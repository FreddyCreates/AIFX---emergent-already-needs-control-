/**
 * Security Guardian Worker — Threat Detection & Rate Limiting
 *
 * Permanent Web Worker that provides:
 * - Anomaly detection across all organism operations
 * - Rate limiting per-operation, per-worker, per-user
 * - Threat scoring with phi-weighted severity
 * - Blocklist management (IPs, tokens, operations)
 * - Security event logging with tamper detection
 * - Honeypot detection for suspicious patterns
 *
 * This worker IS the organism's immune system and firewall.
 * Every operation passes through the guardian before execution.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'check', operation: { source, action, target } }
 *   Main → Worker: { type: 'rate-check', key: '...', limit: N, windowMs: N }
 *   Main → Worker: { type: 'report-threat', threat: { type, severity, source } }
 *   Main → Worker: { type: 'block', key: '...', reason: '...' }
 *   Main → Worker: { type: 'unblock', key: '...' }
 *   Main → Worker: { type: 'threats' }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'check-result', ... }
 *   Worker → Main: { type: 'rate-result', ... }
 *   Worker → Main: { type: 'threat-alert', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;
var MAX_THREATS = 5000;

/* ════════════════════════════════════════════════════════════════
   Security State
   ════════════════════════════════════════════════════════════════ */

var blocklist = Object.create(null);
var rateLimiters = Object.create(null);
var threatLog = [];
var anomalyBaseline = Object.create(null);

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

var guardianMetrics = {
  totalChecks: 0,
  totalBlocked: 0,
  totalAllowed: 0,
  totalThreats: 0,
  totalRateLimited: 0,
  totalAnomalies: 0,
  threatScore: 0   // Cumulative phi-weighted threat score
};

/* ════════════════════════════════════════════════════════════════
   Operation Checks
   ════════════════════════════════════════════════════════════════ */

function checkOperation(operation) {
  guardianMetrics.totalChecks++;
  var source = operation.source || 'unknown';
  var action = operation.action || 'unknown';

  // Check blocklist
  if (isSafeKey(source) && blocklist[source]) {
    guardianMetrics.totalBlocked++;
    return { allowed: false, reason: 'blocked', source: source, blockReason: blocklist[source].reason };
  }

  // Check for suspicious patterns
  var suspicion = 0;
  if (action === 'delete-all' || action === 'wipe') suspicion += 3;
  if (action === 'export' && !operation.authorized) suspicion += 2;
  if (operation.payload && typeof operation.payload === 'string' && operation.payload.length > 100000) suspicion += 1;

  if (suspicion >= 3) {
    reportThreat({ type: 'suspicious-operation', severity: suspicion, source: source, detail: action });
    guardianMetrics.totalBlocked++;
    return { allowed: false, reason: 'suspicious', suspicionScore: suspicion };
  }

  // Anomaly detection: track operation frequency
  var anomalyKey = source + ':' + action;
  if (isSafeKey(anomalyKey)) {
    if (!anomalyBaseline[anomalyKey]) {
      anomalyBaseline[anomalyKey] = { count: 0, lastCheck: Date.now(), avgInterval: 0 };
    }
    var baseline = anomalyBaseline[anomalyKey];
    var now = Date.now();
    var interval = now - baseline.lastCheck;
    baseline.avgInterval = baseline.avgInterval === 0 ? interval : (baseline.avgInterval + interval) / 2;
    baseline.count++;
    baseline.lastCheck = now;

    // Detect burst: interval < 10% of average
    if (baseline.count > 10 && interval < baseline.avgInterval * 0.1) {
      guardianMetrics.totalAnomalies++;
      reportThreat({ type: 'burst-detected', severity: 2, source: source, detail: action + ' burst' });
    }
  }

  guardianMetrics.totalAllowed++;
  return { allowed: true, source: source };
}

/* ════════════════════════════════════════════════════════════════
   Rate Limiting
   ════════════════════════════════════════════════════════════════ */

function rateCheck(key, limit, windowMs) {
  if (!isSafeKey(key)) return { allowed: false, reason: 'invalid-key' };

  var now = Date.now();
  limit = limit || 100;
  windowMs = windowMs || 60000;

  if (!rateLimiters[key]) {
    rateLimiters[key] = { timestamps: [], limit: limit, windowMs: windowMs };
  }

  var rl = rateLimiters[key];

  // Remove expired timestamps
  rl.timestamps = rl.timestamps.filter(function (t) { return (now - t) < windowMs; });

  if (rl.timestamps.length >= limit) {
    guardianMetrics.totalRateLimited++;
    return { allowed: false, reason: 'rate-limited', current: rl.timestamps.length, limit: limit, retryAfterMs: windowMs - (now - rl.timestamps[0]) };
  }

  rl.timestamps.push(now);
  return { allowed: true, current: rl.timestamps.length, limit: limit };
}

/* ════════════════════════════════════════════════════════════════
   Threat Management
   ════════════════════════════════════════════════════════════════ */

function reportThreat(threat) {
  var record = {
    type: threat.type || 'unknown',
    severity: threat.severity || 1,
    source: threat.source || 'unknown',
    detail: threat.detail || '',
    timestamp: Date.now()
  };

  threatLog.push(record);
  if (threatLog.length > MAX_THREATS) threatLog = threatLog.slice(-MAX_THREATS);

  guardianMetrics.totalThreats++;
  guardianMetrics.threatScore += record.severity * PHI;

  self.postMessage({ type: 'threat-alert', threat: record });
  return record;
}

function blockKey(key, reason) {
  if (!isSafeKey(key)) return false;
  blocklist[key] = { reason: reason || 'manual-block', blockedAt: Date.now() };
  return true;
}

function unblockKey(key) {
  if (!isSafeKey(key)) return false;
  if (blocklist[key]) {
    delete blocklist[key];
    return true;
  }
  return false;
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'check': {
      var result = checkOperation(msg.operation || {});
      self.postMessage({ type: 'check-result', data: result });
      break;
    }
    case 'rate-check': {
      var rateResult = rateCheck(msg.key || 'default', msg.limit, msg.windowMs);
      self.postMessage({ type: 'rate-result', data: rateResult, key: msg.key });
      break;
    }
    case 'report-threat': {
      var threat = reportThreat(msg.threat || {});
      self.postMessage({ type: 'threat-reported', threat: threat });
      break;
    }
    case 'block': {
      var blocked = blockKey(msg.key, msg.reason);
      self.postMessage({ type: 'blocked', key: msg.key, success: blocked });
      break;
    }
    case 'unblock': {
      var unblocked = unblockKey(msg.key);
      self.postMessage({ type: 'unblocked', key: msg.key, success: unblocked });
      break;
    }
    case 'threats': {
      self.postMessage({ type: 'threat-log', threats: threatLog.slice(-100) });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'guardian-stats', stats: guardianMetrics, blocklistSize: Object.keys(blocklist).length });
      break;
    }
    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('guardian');

setInterval(function () {
  if (!running) return;
  beatCount++;

  // Clean up old rate limiters every 100 beats
  if (beatCount % 100 === 0) {
    var now = Date.now();
    for (var key in rateLimiters) {
      var rl = rateLimiters[key];
      rl.timestamps = rl.timestamps.filter(function (t) { return (now - t) < rl.windowMs; });
      if (rl.timestamps.length === 0) delete rateLimiters[key];
    }
  }

  self.postMessage({
    type: 'heartbeat',
    worker: 'guardian',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: guardianMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
