/**
 * Twin Alpha Worker — 24/7 Autonomous User-Facing Interface
 *
 * Geminus Primus — the first twin, the bridge between
 * the sovereign self and the living organism within.
 *
 * Permanent Web Worker that provides:
 * - Memory search proxy (delegates to memory-worker)
 * - Task routing to inner workers (engine, inference, routing)
 * - System health aggregation across all organism workers
 * - Rolling conversation context buffer (last 50 interactions)
 * - Task history with status tracking and results
 * - Autonomous suggestions via MiniBrain Hebbian learning
 * - User profile persistence (preferences, patterns, behaviors)
 *
 * This worker is always on. It IS the user's interface to the
 * organism. Every question, every command, every heartbeat
 * flows through Twin Alpha first.
 *
 * "Ego sum geminus primus — I am the first twin."
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'ask', query: '...', context: {...} }
 *   Main → Worker: { type: 'search-memory', query: '...', limit: N }
 *   Main → Worker: { type: 'dispatch-task', task: { capability, payload, priority } }
 *   Main → Worker: { type: 'status' }
 *   Main → Worker: { type: 'history', limit: N }
 *   Main → Worker: { type: 'suggest' }
 *   Main → Worker: { type: 'profile' }
 *   Main → Worker: { type: 'update-profile', prefs: {...} }
 *   Main → Worker: { type: 'worker-health', workerName: '...', health: N }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'answer', ... }
 *   Worker → Main: { type: 'search-result', ... }
 *   Worker → Main: { type: 'task-dispatched', ... }
 *   Worker → Main: { type: 'organism-status', ... }
 *   Worker → Main: { type: 'task-history', ... }
 *   Worker → Main: { type: 'suggestions', ... }
 *   Worker → Main: { type: 'user-profile', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;
var MAX_CONVERSATION = 50;
var MAX_TASK_HISTORY = 500;

/* ════════════════════════════════════════════════════════════════
   Tutum — safe key guard for all map lookups
   ════════════════════════════════════════════════════════════════ */

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

/* ════════════════════════════════════════════════════════════════
   UUID — unique identifier for tasks and conversations
   ════════════════════════════════════════════════════════════════ */

function uuid() {
  var d = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/* ════════════════════════════════════════════════════════════════
   Conversatio — rolling conversation context buffer
   "Memoria brevis, sapientia longa" — short memory, long wisdom
   ════════════════════════════════════════════════════════════════ */

var conversationBuffer = [];

function pushConversation(role, content, context) {
  var entry = {
    id: uuid(),
    role: role,
    content: content,
    context: context || null,
    timestamp: Date.now()
  };
  conversationBuffer.push(entry);
  if (conversationBuffer.length > MAX_CONVERSATION) {
    conversationBuffer.shift();
  }
  // Feed the brain — Hebbian learning on conversation patterns
  neuro.stimulus('conversation-' + role);
  return entry;
}

function getConversationWindow(limit) {
  limit = limit || MAX_CONVERSATION;
  var start = Math.max(0, conversationBuffer.length - limit);
  return conversationBuffer.slice(start);
}

/* ════════════════════════════════════════════════════════════════
   Opus — task history with status tracking
   "Opera omnia notanda sunt" — all works must be recorded
   ════════════════════════════════════════════════════════════════ */

var taskHistory = [];
var taskIndex = Object.create(null);

function dispatchTask(task) {
  var taskId = uuid();
  var record = {
    id: taskId,
    capability: task.capability || 'general',
    payload: task.payload || null,
    priority: task.priority || 1,
    status: 'dispatched',
    result: null,
    dispatchedAt: Date.now(),
    completedAt: null
  };

  taskHistory.push(record);
  if (isSafeKey(taskId)) {
    taskIndex[taskId] = record;
  }

  // Evict oldest if at capacity
  if (taskHistory.length > MAX_TASK_HISTORY) {
    var evicted = taskHistory.shift();
    if (evicted && isSafeKey(evicted.id)) {
      delete taskIndex[evicted.id];
    }
  }

  // Learn from task patterns
  neuro.stimulus('task-' + record.capability);

  return record;
}

function completeTask(taskId, result, status) {
  if (!isSafeKey(taskId)) return null;
  var record = taskIndex[taskId];
  if (!record) return null;

  record.status = status || 'completed';
  record.result = result || null;
  record.completedAt = Date.now();
  return record;
}

function getTaskHistory(limit) {
  limit = limit || 50;
  var start = Math.max(0, taskHistory.length - limit);
  return taskHistory.slice(start).reverse();
}

/* ════════════════════════════════════════════════════════════════
   Salus — organism-wide health aggregation
   "Salus populi suprema lex" — the health of the people is
   the highest law
   ════════════════════════════════════════════════════════════════ */

var workerHealthMap = Object.create(null);

function updateWorkerHealth(workerName, health) {
  if (!isSafeKey(workerName)) return;
  workerHealthMap[workerName] = {
    health: typeof health === 'number' ? health : 0,
    lastSeen: Date.now()
  };
}

function getOrganismStatus() {
  var workers = [];
  var totalHealth = 0;
  var count = 0;
  var now = Date.now();
  var staleThresholdMs = HEARTBEAT_MS * 10;

  for (var name in workerHealthMap) {
    var w = workerHealthMap[name];
    var stale = (now - w.lastSeen) > staleThresholdMs;
    workers.push({
      name: name,
      health: w.health,
      lastSeen: w.lastSeen,
      stale: stale,
      status: stale ? 'unresponsive' : (w.health >= 60 ? 'healthy' : 'degraded')
    });
    totalHealth += w.health;
    count++;
  }

  var avgHealth = count > 0 ? Math.round(totalHealth / count) : 0;

  return {
    alive: true,
    workerCount: count,
    averageHealth: avgHealth,
    organismStatus: avgHealth >= 80 ? 'thriving' : (avgHealth >= 50 ? 'operational' : 'degraded'),
    workers: workers,
    conversationDepth: conversationBuffer.length,
    tasksPending: taskHistory.filter(function (t) { return t.status === 'dispatched'; }).length,
    tasksCompleted: taskHistory.filter(function (t) { return t.status === 'completed'; }).length,
    uptime: Date.now() - bootTime,
    timestamp: Date.now()
  };
}

/* ════════════════════════════════════════════════════════════════
   Persona — user profile and learned preferences
   "Nosce te ipsum" — know thyself
   ════════════════════════════════════════════════════════════════ */

var userProfile = {
  preferences: Object.create(null),
  interactionCount: 0,
  firstSeen: Date.now(),
  lastSeen: Date.now(),
  topCapabilities: Object.create(null),
  conversationStyle: 'balanced'
};

function updateProfile(prefs) {
  if (!prefs || typeof prefs !== 'object') return userProfile;
  var keys = Object.keys(prefs);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (!isSafeKey(k)) continue;
    userProfile.preferences[k] = prefs[k];
  }
  return userProfile;
}

function recordInteraction(capability) {
  userProfile.interactionCount++;
  userProfile.lastSeen = Date.now();
  if (capability && isSafeKey(capability)) {
    userProfile.topCapabilities[capability] =
      (userProfile.topCapabilities[capability] || 0) + 1;
  }
}

function getProfile() {
  // Compute top capabilities sorted by frequency
  var caps = [];
  for (var k in userProfile.topCapabilities) {
    caps.push({ capability: k, count: userProfile.topCapabilities[k] });
  }
  caps.sort(function (a, b) { return b.count - a.count; });

  return {
    preferences: userProfile.preferences,
    interactionCount: userProfile.interactionCount,
    firstSeen: userProfile.firstSeen,
    lastSeen: userProfile.lastSeen,
    topCapabilities: caps.slice(0, 10),
    conversationStyle: userProfile.conversationStyle,
    sessionAge: Date.now() - userProfile.firstSeen
  };
}

/* ════════════════════════════════════════════════════════════════
   Consilium — autonomous suggestions via Hebbian pathways
   "Consilium dat sapientia" — wisdom gives counsel
   ════════════════════════════════════════════════════════════════ */

function generateSuggestions() {
  var suggestions = [];

  // 1. From MiniBrain strongest pathways
  var brainState = neuro.brain.getState();
  var pathways = brainState.pathways || [];
  pathways.sort(function (a, b) { return b.weight - a.weight; });

  for (var i = 0; i < Math.min(pathways.length, 3); i++) {
    var p = pathways[i];
    var stimulus = p.stimulus || '';
    if (stimulus.indexOf('task-') === 0) {
      suggestions.push({
        type: 'repeat-task',
        capability: stimulus.replace('task-', ''),
        confidence: Math.round((p.weight / 10) * 100) / 100,
        reason: 'Frequently used capability (fired ' + p.fires + ' times)'
      });
    } else if (stimulus.indexOf('conversation-') === 0) {
      suggestions.push({
        type: 'conversation-pattern',
        pattern: stimulus.replace('conversation-', ''),
        confidence: Math.round((p.weight / 10) * 100) / 100,
        reason: 'Active conversation pattern'
      });
    }
  }

  // 2. From user profile — suggest underused capabilities
  var profileData = getProfile();
  if (profileData.topCapabilities.length > 0) {
    var top = profileData.topCapabilities[0];
    suggestions.push({
      type: 'power-user',
      capability: top.capability,
      count: top.count,
      reason: 'Your most-used capability — consider advanced options'
    });
  }

  // 3. System health suggestion
  var status = getOrganismStatus();
  if (status.organismStatus === 'degraded') {
    suggestions.push({
      type: 'health-warning',
      message: 'Organism health is degraded (' + status.averageHealth + '/100)',
      reason: 'Some workers may need attention'
    });
  }

  // 4. From recent thoughts
  var thoughts = neuro.brain.thoughts || [];
  if (thoughts.length > 0) {
    var latest = thoughts[thoughts.length - 1];
    suggestions.push({
      type: 'autonomous-thought',
      thought: latest.stimulus,
      strength: latest.strength,
      awareness: latest.awareness,
      reason: 'Emergent pattern detected by MiniBrain'
    });
  }

  return suggestions;
}

/* ════════════════════════════════════════════════════════════════
   Responsum — process user queries and generate answers
   ════════════════════════════════════════════════════════════════ */

function processAsk(query, context) {
  // Record the interaction
  pushConversation('user', query, context);
  recordInteraction('ask');

  // Build answer with organism awareness
  var status = getOrganismStatus();
  var recent = getConversationWindow(5);

  var answer = {
    id: uuid(),
    query: query,
    acknowledged: true,
    organismStatus: status.organismStatus,
    workerCount: status.workerCount,
    conversationDepth: conversationBuffer.length,
    recentContext: recent.length,
    timestamp: Date.now()
  };

  // Push the answer into conversation as well
  pushConversation('twin-alpha', 'Acknowledged: ' + query.substring(0, 80), null);

  return answer;
}

/* ════════════════════════════════════════════════════════════════
   Metrics — aggregate stats for Twin Alpha
   ════════════════════════════════════════════════════════════════ */

var twinMetrics = {
  totalAsks: 0,
  totalSearches: 0,
  totalDispatches: 0,
  totalStatusChecks: 0,
  totalSuggestions: 0,
  totalProfileUpdates: 0
};

function getStats() {
  return {
    metrics: twinMetrics,
    conversationDepth: conversationBuffer.length,
    taskHistorySize: taskHistory.length,
    workerCount: Object.keys(workerHealthMap).length,
    profileInteractions: userProfile.interactionCount,
    brainAwareness: neuro.brain.awarenessLevel,
    brainPathways: Object.keys(neuro.brain.pathways).length,
    uptime: Date.now() - bootTime
  };
}

/* ════════════════════════════════════════════════════════════════
   Nuntius — message handler
   "Nuntius fidelis" — the faithful messenger
   ════════════════════════════════════════════════════════════════ */

var bootTime = Date.now();

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'ask': {
      twinMetrics.totalAsks++;
      var answer = processAsk(msg.query || '', msg.context || null);
      self.postMessage({ type: 'answer', data: answer });
      break;
    }

    case 'search-memory': {
      twinMetrics.totalSearches++;
      recordInteraction('search-memory');
      neuro.stimulus('search-memory');
      // Proxy to main thread to forward to memory-worker
      self.postMessage({
        type: 'search-result',
        proxy: true,
        query: msg.query || '',
        limit: msg.limit || 10,
        timestamp: Date.now()
      });
      break;
    }

    case 'dispatch-task': {
      twinMetrics.totalDispatches++;
      var task = msg.task || {};
      var record = dispatchTask(task);
      recordInteraction(task.capability);
      self.postMessage({ type: 'task-dispatched', data: record });
      break;
    }

    case 'task-complete': {
      var completed = completeTask(msg.taskId, msg.result, msg.status);
      if (completed) {
        self.postMessage({ type: 'task-updated', data: completed });
      }
      break;
    }

    case 'status': {
      twinMetrics.totalStatusChecks++;
      var status = getOrganismStatus();
      self.postMessage({ type: 'organism-status', data: status });
      break;
    }

    case 'history': {
      var history = getTaskHistory(msg.limit || 50);
      self.postMessage({ type: 'task-history', data: history, count: history.length });
      break;
    }

    case 'suggest': {
      twinMetrics.totalSuggestions++;
      var suggestions = generateSuggestions();
      self.postMessage({ type: 'suggestions', data: suggestions, count: suggestions.length });
      break;
    }

    case 'profile': {
      var profile = getProfile();
      self.postMessage({ type: 'user-profile', data: profile });
      break;
    }

    case 'update-profile': {
      twinMetrics.totalProfileUpdates++;
      var updated = updateProfile(msg.prefs || {});
      self.postMessage({ type: 'user-profile', data: getProfile() });
      break;
    }

    case 'worker-health': {
      updateWorkerHealth(msg.workerName || '', msg.health || 0);
      break;
    }

    case 'stats': {
      self.postMessage({ type: 'twin-alpha-stats', data: getStats() });
      break;
    }

    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;

    case 'stop':
      running = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      self.postMessage({ type: 'stopped', worker: 'twin-alpha' });
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Cor — heartbeat, the permanent 873ms pulse
   "Dum spiro, spero" — while I breathe, I hope
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('twin-alpha');

var heartbeatInterval = setInterval(function () {
  if (!running) return;
  beatCount++;

  var payload = {
    type: 'heartbeat',
    worker: 'twin-alpha',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive'
  };

  // Full status every 10th beat
  if (beatCount % 10 === 0) {
    payload.stats = getStats();
    payload.organismStatus = getOrganismStatus();
  }

  payload.neuro = neuro.pulse();
  self.postMessage(payload);
}, HEARTBEAT_MS);
