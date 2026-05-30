/**
 * Product Analytics Worker — Usage Tracking & Metrics
 *
 * Permanent Web Worker that provides:
 * - Event tracking (page views, actions, conversions)
 * - Funnel analysis (multi-step flows)
 * - Session management (active sessions, durations)
 * - Feature usage heatmaps
 * - Real-time dashboards via aggregated counters
 * - Zero external dependencies — all analytics in-browser
 *
 * This worker tracks everything the organism does — so you can
 * measure, improve, and ship better products.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'track', event: { name, category, data } }
 *   Main → Worker: { type: 'page-view', page: '...', referrer: '...' }
 *   Main → Worker: { type: 'funnel-step', funnel: '...', step: N }
 *   Main → Worker: { type: 'session-start' }
 *   Main → Worker: { type: 'session-end' }
 *   Main → Worker: { type: 'report', period: 'hour'|'day'|'all' }
 *   Main → Worker: { type: 'funnels' }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'event-tracked', ... }
 *   Worker → Main: { type: 'analytics-report', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;
var MAX_EVENTS = 50000;

/* ════════════════════════════════════════════════════════════════
   Analytics State
   ════════════════════════════════════════════════════════════════ */

var events = [];
var funnels = Object.create(null);
var sessions = [];
var currentSession = null;
var counters = Object.create(null);

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

var analyticsMetrics = {
  totalEvents: 0,
  totalPageViews: 0,
  totalSessions: 0,
  totalConversions: 0,
  uniqueCategories: 0
};

/* ════════════════════════════════════════════════════════════════
   Event Tracking
   ════════════════════════════════════════════════════════════════ */

function trackEvent(event) {
  var record = {
    name: event.name || 'unnamed',
    category: event.category || 'general',
    data: event.data || null,
    timestamp: Date.now(),
    session: currentSession ? currentSession.id : null
  };

  events.push(record);
  if (events.length > MAX_EVENTS) events = events.slice(-MAX_EVENTS);

  analyticsMetrics.totalEvents++;

  // Increment counter
  var counterKey = record.category + ':' + record.name;
  if (isSafeKey(counterKey)) {
    counters[counterKey] = (counters[counterKey] || 0) + 1;
  }

  return record;
}

function trackPageView(page, referrer) {
  analyticsMetrics.totalPageViews++;
  return trackEvent({
    name: 'page-view',
    category: 'navigation',
    data: { page: page, referrer: referrer || null }
  });
}

/* ════════════════════════════════════════════════════════════════
   Funnel Analysis
   ════════════════════════════════════════════════════════════════ */

function funnelStep(funnelName, step) {
  if (!isSafeKey(funnelName)) return null;
  if (!funnels[funnelName]) {
    funnels[funnelName] = {
      name: funnelName,
      steps: Object.create(null),
      totalEntries: 0,
      createdAt: Date.now()
    };
  }

  var stepKey = 'step-' + step;
  if (!funnels[funnelName].steps[stepKey]) {
    funnels[funnelName].steps[stepKey] = 0;
  }
  funnels[funnelName].steps[stepKey]++;

  if (step === 0) funnels[funnelName].totalEntries++;

  return funnels[funnelName];
}

/* ════════════════════════════════════════════════════════════════
   Session Management
   ════════════════════════════════════════════════════════════════ */

function startSession() {
  currentSession = {
    id: 'sess-' + Date.now().toString(36),
    startedAt: Date.now(),
    endedAt: null,
    eventCount: 0,
    pages: []
  };
  sessions.push(currentSession);
  analyticsMetrics.totalSessions++;
  return currentSession;
}

function endSession() {
  if (currentSession) {
    currentSession.endedAt = Date.now();
    var duration = currentSession.endedAt - currentSession.startedAt;
    currentSession = null;
    return { ended: true, durationMs: duration };
  }
  return { ended: false };
}

/* ════════════════════════════════════════════════════════════════
   Reports
   ════════════════════════════════════════════════════════════════ */

function generateReport(period) {
  var now = Date.now();
  var cutoff = 0;
  if (period === 'hour') cutoff = now - 3600000;
  else if (period === 'day') cutoff = now - 86400000;

  var filtered = events.filter(function (e) { return e.timestamp >= cutoff; });

  // Category breakdown
  var categories = Object.create(null);
  for (var i = 0; i < filtered.length; i++) {
    var cat = filtered[i].category;
    if (isSafeKey(cat)) {
      categories[cat] = (categories[cat] || 0) + 1;
    }
  }

  // Top events
  var eventCounts = Object.create(null);
  for (var j = 0; j < filtered.length; j++) {
    var name = filtered[j].name;
    if (isSafeKey(name)) {
      eventCounts[name] = (eventCounts[name] || 0) + 1;
    }
  }

  var topEvents = Object.keys(eventCounts).sort(function (a, b) {
    return eventCounts[b] - eventCounts[a];
  }).slice(0, 10).map(function (n) { return { name: n, count: eventCounts[n] }; });

  return {
    period: period || 'all',
    totalEvents: filtered.length,
    categories: categories,
    topEvents: topEvents,
    activeSessions: currentSession ? 1 : 0,
    totalSessions: sessions.length
  };
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'track': {
      var record = trackEvent(msg.event || {});
      self.postMessage({ type: 'event-tracked', event: record });
      break;
    }
    case 'page-view': {
      var pv = trackPageView(msg.page, msg.referrer);
      self.postMessage({ type: 'event-tracked', event: pv });
      break;
    }
    case 'funnel-step': {
      var funnel = funnelStep(msg.funnel, msg.step || 0);
      self.postMessage({ type: 'funnel-updated', funnel: funnel });
      break;
    }
    case 'session-start': {
      var session = startSession();
      self.postMessage({ type: 'session-started', session: session });
      break;
    }
    case 'session-end': {
      var ended = endSession();
      self.postMessage({ type: 'session-ended', data: ended });
      break;
    }
    case 'report': {
      var report = generateReport(msg.period);
      self.postMessage({ type: 'analytics-report', data: report });
      break;
    }
    case 'funnels': {
      var list = [];
      for (var f in funnels) list.push(funnels[f]);
      self.postMessage({ type: 'funnel-list', funnels: list });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'analytics-stats', stats: analyticsMetrics, counters: counters });
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

var neuro = new NeuroCore('analytics');

setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    worker: 'analytics',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: analyticsMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
