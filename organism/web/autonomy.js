/**
 * Autonomy Runtime — Production Self-Healing Monitor
 *
 * This module runs alongside the download worker and provides:
 * - Automatic worker restart on crash
 * - Health monitoring with configurable thresholds
 * - Build state persistence via localStorage
 * - Performance telemetry (build times, sizes)
 * - Console status dashboard
 *
 * The organism is alive from the second it boots. This runtime
 * ensures it stays alive 24/7 — self-healing, self-monitoring,
 * fully autonomous.
 *
 * Usage (from download.html or any host page):
 *   const autonomy = new OrganismAutonomy({
 *     workerPath: 'organism/web/download-worker.js',
 *     onZipReady: function(slug, blob, filename) { ... },
 *     onAllReady: function(count) { ... },
 *     onHeartbeat: function(beat) { ... },
 *     onStatusChange: function(status) { ... }
 *   });
 *   autonomy.boot(extensions);
 */

'use strict';

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var MAX_MISSED_HEARTBEATS = 5;
var RESTART_DELAY_MS = 1000;
var MAX_RESTARTS = 10;
var STORAGE_KEY = 'organism-autonomy-state';

/**
 * OrganismAutonomy — self-healing production runtime
 */
function OrganismAutonomy(config) {
  this.config = config || {};
  this.workerPath = this.config.workerPath || 'organism/web/download-worker.js';
  this.worker = null;
  this.status = 'idle';           // idle → booting → building → alive → crashed → restarting
  this.restartCount = 0;
  this.lastHeartbeat = 0;
  this.heartbeatCount = 0;
  this.missedHeartbeats = 0;
  this.healthCheckInterval = null;
  this.buildStartTime = 0;
  this.buildEndTime = 0;
  this.builtCount = 0;
  this.totalExtensions = 0;
  this.telemetry = {
    boots: 0,
    crashes: 0,
    totalBuilds: 0,
    avgBuildTimeMs: 0,
    lastBuildTimeMs: 0,
    uptimeStart: Date.now()
  };

  // Restore persisted state
  this._restoreState();
}

/**
 * Boot the organism — starts worker, begins health monitoring
 */
OrganismAutonomy.prototype.boot = function (extensions) {
  this.totalExtensions = extensions ? extensions.length : 0;
  this._extensions = extensions;
  this.telemetry.boots++;
  this._setStatus('booting');
  this._startWorker();
  this._startHealthCheck();
  this._log('🧬 Organism autonomy booted — build ' + this.telemetry.boots);
};

/**
 * Start (or restart) the Web Worker
 */
OrganismAutonomy.prototype._startWorker = function () {
  var self = this;

  // Terminate existing worker if any
  if (this.worker) {
    try { this.worker.terminate(); } catch (e) { /* ignore */ }
  }

  try {
    this.worker = new Worker(this.workerPath);
  } catch (e) {
    this._log('✗ Worker failed to load: ' + e.message);
    this._setStatus('crashed');
    this._scheduleRestart();
    return;
  }

  this.worker.onmessage = function (e) {
    self._handleMessage(e.data);
  };

  this.worker.onerror = function (err) {
    self._log('✗ Worker error: ' + (err.message || 'unknown'));
    self._setStatus('crashed');
    self.telemetry.crashes++;
    self._scheduleRestart();
  };

  // Send build command if we have extensions
  if (this._extensions && this._extensions.length > 0) {
    this._setStatus('building');
    this.buildStartTime = Date.now();
    this.builtCount = 0;
    this.worker.postMessage({ type: 'build', extensions: this._extensions });
  }
};

/**
 * Handle messages from the worker
 */
OrganismAutonomy.prototype._handleMessage = function (msg) {
  switch (msg.type) {
    case 'zip-ready':
      this.builtCount++;
      if (this.config.onZipReady) {
        this.config.onZipReady(msg.slug, msg.blob, msg.filename, msg.name);
      }
      break;

    case 'all-ready':
      this.buildEndTime = Date.now();
      this.telemetry.lastBuildTimeMs = this.buildEndTime - this.buildStartTime;
      this.telemetry.totalBuilds++;
      this.telemetry.avgBuildTimeMs = Math.round(
        ((this.telemetry.avgBuildTimeMs * (this.telemetry.totalBuilds - 1)) + this.telemetry.lastBuildTimeMs)
        / this.telemetry.totalBuilds
      );
      this._setStatus('alive');
      this.restartCount = 0; // Reset restart counter on success
      this._persistState();
      this._log('✓ All ' + msg.count + ' extensions built in ' + this.telemetry.lastBuildTimeMs + 'ms');
      if (this.config.onAllReady) {
        this.config.onAllReady(msg.count);
      }
      break;

    case 'zip-error':
      this._log('✗ Build error for ' + msg.slug + ': ' + msg.error);
      if (this.config.onError) {
        this.config.onError(msg.slug, msg.error);
      }
      break;

    case 'heartbeat':
      this.lastHeartbeat = Date.now();
      this.heartbeatCount = msg.beat;
      this.missedHeartbeats = 0;
      if (this.config.onHeartbeat) {
        this.config.onHeartbeat(msg.beat, msg.timestamp);
      }
      break;

    case 'stopped':
      this._setStatus('idle');
      break;

    case 'state':
      break;
  }
};

/**
 * Health check — detects missed heartbeats, triggers restart
 */
OrganismAutonomy.prototype._startHealthCheck = function () {
  var self = this;

  if (this.healthCheckInterval) {
    clearInterval(this.healthCheckInterval);
  }

  this.healthCheckInterval = setInterval(function () {
    if (self.status === 'idle' || self.status === 'restarting') return;

    // Only check heartbeats once worker is alive (building or alive)
    if (self.lastHeartbeat > 0) {
      var elapsed = Date.now() - self.lastHeartbeat;
      if (elapsed > HEARTBEAT_MS * 2) {
        self.missedHeartbeats++;
        if (self.missedHeartbeats >= MAX_MISSED_HEARTBEATS) {
          self._log('✗ Worker unresponsive (' + self.missedHeartbeats + ' missed heartbeats) — restarting');
          self._setStatus('crashed');
          self.telemetry.crashes++;
          self._scheduleRestart();
        }
      }
    }
  }, HEARTBEAT_MS);
};

/**
 * Schedule a worker restart with exponential backoff
 */
OrganismAutonomy.prototype._scheduleRestart = function () {
  var self = this;

  if (this.restartCount >= MAX_RESTARTS) {
    this._log('✗ Max restarts (' + MAX_RESTARTS + ') exceeded — giving up');
    this._setStatus('crashed');
    if (this.config.onMaxRestarts) {
      this.config.onMaxRestarts();
    }
    return;
  }

  this.restartCount++;
  var delay = RESTART_DELAY_MS * Math.pow(PHI, this.restartCount - 1);
  delay = Math.min(delay, 30000); // Cap at 30s

  this._setStatus('restarting');
  this._log('↻ Restart ' + this.restartCount + '/' + MAX_RESTARTS + ' in ' + Math.round(delay) + 'ms');

  setTimeout(function () {
    self.lastHeartbeat = 0;
    self.missedHeartbeats = 0;
    self._startWorker();
  }, delay);
};

/**
 * Update status and notify listener
 */
OrganismAutonomy.prototype._setStatus = function (status) {
  this.status = status;
  if (this.config.onStatusChange) {
    this.config.onStatusChange(status);
  }
};

/**
 * Persist state to localStorage
 */
OrganismAutonomy.prototype._persistState = function () {
  try {
    var state = {
      telemetry: this.telemetry,
      lastSave: Date.now(),
      builtCount: this.builtCount,
      totalExtensions: this.totalExtensions
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage may be unavailable
  }
};

/**
 * Restore state from localStorage
 */
OrganismAutonomy.prototype._restoreState = function () {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var state = JSON.parse(raw);
      if (state.telemetry) {
        this.telemetry.boots = state.telemetry.boots || 0;
        this.telemetry.totalBuilds = state.telemetry.totalBuilds || 0;
        this.telemetry.avgBuildTimeMs = state.telemetry.avgBuildTimeMs || 0;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
};

/**
 * Get uptime in seconds
 */
OrganismAutonomy.prototype.getUptimeSeconds = function () {
  return Math.round((Date.now() - this.telemetry.uptimeStart) / 1000);
};

/**
 * Get full telemetry snapshot
 */
OrganismAutonomy.prototype.getTelemetry = function () {
  return {
    status: this.status,
    uptime: this.getUptimeSeconds(),
    heartbeats: this.heartbeatCount,
    restarts: this.restartCount,
    built: this.builtCount,
    total: this.totalExtensions,
    telemetry: this.telemetry
  };
};

/**
 * Graceful shutdown
 */
OrganismAutonomy.prototype.shutdown = function () {
  this._log('Shutting down autonomy runtime');
  if (this.healthCheckInterval) {
    clearInterval(this.healthCheckInterval);
  }
  if (this.worker) {
    this.worker.postMessage({ type: 'stop' });
    try { this.worker.terminate(); } catch (e) { /* ignore */ }
  }
  this._setStatus('idle');
  this._persistState();
};

/**
 * Console logger with timestamp
 */
OrganismAutonomy.prototype._log = function (msg) {
  var uptime = this.getUptimeSeconds();
  console.log('[organism +' + uptime + 's] ' + msg);
};

// Export for use in download.html
if (typeof window !== 'undefined') {
  window.OrganismAutonomy = OrganismAutonomy;
}
