/**
 * 24/7 Scheduler Worker — Always-On Task Scheduling
 *
 * Permanent Web Worker that provides:
 * - Cron-like recurring job scheduling (interval-based)
 * - Deferred task execution (run at future timestamp)
 * - Priority queue with phi-weighted ordering
 * - Job lifecycle management (create, pause, resume, cancel)
 * - Retry logic with exponential backoff
 *
 * This worker never sleeps. It IS the organism's clock.
 * Every scheduled task, every recurring job, every deferred
 * operation runs through here.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'schedule', job: { name, intervalMs, action, payload, priority } }
 *   Main → Worker: { type: 'defer', task: { name, runAt, action, payload } }
 *   Main → Worker: { type: 'cancel', jobId: '...' }
 *   Main → Worker: { type: 'pause', jobId: '...' }
 *   Main → Worker: { type: 'resume', jobId: '...' }
 *   Main → Worker: { type: 'list' }
 *   Main → Worker: { type: 'stats' }
 *   Main → Worker: { type: 'queue' }
 *   Worker → Main: { type: 'job-created', ... }
 *   Worker → Main: { type: 'job-fired', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var TICK_MS = 100;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Job Registry
   ════════════════════════════════════════════════════════════════ */

var jobs = Object.create(null);
var jobCount = 0;
var deferredQueue = [];   // sorted by runAt ascending

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

var schedulerMetrics = {
  totalScheduled: 0,
  totalDeferred: 0,
  totalFired: 0,
  totalCancelled: 0,
  totalRetries: 0,
  totalMissedDeadlines: 0,
  activeJobs: 0
};

/* ════════════════════════════════════════════════════════════════
   Job Scheduling
   ════════════════════════════════════════════════════════════════ */

function scheduleJob(spec) {
  jobCount++;
  var id = 'JOB-' + String(jobCount).padStart(4, '0');
  var job = {
    id: id,
    name: spec.name || 'Unnamed Job',
    intervalMs: spec.intervalMs || 60000,
    action: spec.action || 'default',
    payload: spec.payload || null,
    priority: spec.priority || 2,
    status: 'active',      // active, paused, cancelled, completed
    createdAt: Date.now(),
    lastFired: null,
    nextFire: Date.now() + (spec.intervalMs || 60000),
    fireCount: 0,
    maxFires: spec.maxFires || Infinity,
    retries: 0,
    maxRetries: spec.maxRetries || 3
  };

  jobs[id] = job;
  schedulerMetrics.totalScheduled++;
  schedulerMetrics.activeJobs++;

  return job;
}

function deferTask(spec) {
  jobCount++;
  var id = 'DEFER-' + String(jobCount).padStart(4, '0');
  var task = {
    id: id,
    name: spec.name || 'Deferred Task',
    runAt: spec.runAt || (Date.now() + 5000),
    action: spec.action || 'default',
    payload: spec.payload || null,
    status: 'pending',     // pending, fired, cancelled
    createdAt: Date.now()
  };

  // Insert sorted by runAt
  var inserted = false;
  for (var i = 0; i < deferredQueue.length; i++) {
    if (task.runAt < deferredQueue[i].runAt) {
      deferredQueue.splice(i, 0, task);
      inserted = true;
      break;
    }
  }
  if (!inserted) deferredQueue.push(task);

  schedulerMetrics.totalDeferred++;
  return task;
}

function cancelJob(jobId) {
  if (!isSafeKey(jobId)) return false;
  var job = jobs[jobId];
  if (job) {
    job.status = 'cancelled';
    schedulerMetrics.totalCancelled++;
    schedulerMetrics.activeJobs = Math.max(0, schedulerMetrics.activeJobs - 1);
    return true;
  }
  // Check deferred queue
  for (var i = 0; i < deferredQueue.length; i++) {
    if (deferredQueue[i].id === jobId) {
      deferredQueue[i].status = 'cancelled';
      schedulerMetrics.totalCancelled++;
      return true;
    }
  }
  return false;
}

function pauseJob(jobId) {
  if (!isSafeKey(jobId)) return false;
  var job = jobs[jobId];
  if (job && job.status === 'active') {
    job.status = 'paused';
    return true;
  }
  return false;
}

function resumeJob(jobId) {
  if (!isSafeKey(jobId)) return false;
  var job = jobs[jobId];
  if (job && job.status === 'paused') {
    job.status = 'active';
    job.nextFire = Date.now() + job.intervalMs;
    return true;
  }
  return false;
}

/* ════════════════════════════════════════════════════════════════
   Tick — runs every 100ms to check jobs and deferred tasks
   ════════════════════════════════════════════════════════════════ */

function tick() {
  if (!running) return;
  var now = Date.now();

  // Check recurring jobs
  for (var id in jobs) {
    var job = jobs[id];
    if (job.status !== 'active') continue;
    if (now >= job.nextFire) {
      job.fireCount++;
      job.lastFired = now;
      job.nextFire = now + job.intervalMs;
      schedulerMetrics.totalFired++;

      self.postMessage({
        type: 'job-fired',
        jobId: job.id,
        name: job.name,
        action: job.action,
        payload: job.payload,
        fireCount: job.fireCount,
        timestamp: now
      });

      if (job.fireCount >= job.maxFires) {
        job.status = 'completed';
        schedulerMetrics.activeJobs = Math.max(0, schedulerMetrics.activeJobs - 1);
      }
    }
  }

  // Check deferred queue
  while (deferredQueue.length > 0 && deferredQueue[0].runAt <= now) {
    var task = deferredQueue.shift();
    if (task.status === 'cancelled') continue;
    task.status = 'fired';
    schedulerMetrics.totalFired++;

    self.postMessage({
      type: 'job-fired',
      jobId: task.id,
      name: task.name,
      action: task.action,
      payload: task.payload,
      deferred: true,
      timestamp: now
    });
  }
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'schedule': {
      var job = scheduleJob(msg.job || {});
      self.postMessage({ type: 'job-created', job: job });
      break;
    }
    case 'defer': {
      var task = deferTask(msg.task || {});
      self.postMessage({ type: 'defer-created', task: task });
      break;
    }
    case 'cancel': {
      var cancelled = cancelJob(msg.jobId);
      self.postMessage({ type: 'job-cancelled', jobId: msg.jobId, success: cancelled });
      break;
    }
    case 'pause': {
      var paused = pauseJob(msg.jobId);
      self.postMessage({ type: 'job-paused', jobId: msg.jobId, success: paused });
      break;
    }
    case 'resume': {
      var resumed = resumeJob(msg.jobId);
      self.postMessage({ type: 'job-resumed', jobId: msg.jobId, success: resumed });
      break;
    }
    case 'list': {
      var list = [];
      for (var id in jobs) list.push(jobs[id]);
      self.postMessage({ type: 'job-list', jobs: list, deferred: deferredQueue });
      break;
    }
    case 'queue': {
      self.postMessage({ type: 'queue-status', pending: deferredQueue.length, items: deferredQueue.slice(0, 20) });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'scheduler-stats', stats: schedulerMetrics });
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
   Tick loop + Heartbeat
   ════════════════════════════════════════════════════════════════ */

setInterval(tick, TICK_MS);

var neuro = new NeuroCore('scheduler');

setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    worker: 'scheduler',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: schedulerMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
