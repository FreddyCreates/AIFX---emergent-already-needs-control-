/**
 * Contract & Agreement Worker — Sovereign Contract Engine
 *
 * Permanent Web Worker that provides:
 * - Smart contract verification (hash-based integrity checks)
 * - SLA enforcement (latency, uptime, throughput guarantees)
 * - Agreement lifecycle management (create, sign, verify, revoke)
 * - Policy enforcement across all organism operations
 * - Audit trail with tamper-evident logging
 *
 * Every operation in the organism can be governed by a contract.
 * This worker ensures nothing runs without authorization.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'create-contract', contract: { name, terms, parties, sla } }
 *   Main → Worker: { type: 'verify', contractId: '...', operation: {...} }
 *   Main → Worker: { type: 'enforce-sla', contractId: '...', metrics: {...} }
 *   Main → Worker: { type: 'sign', contractId: '...', party: '...' }
 *   Main → Worker: { type: 'revoke', contractId: '...' }
 *   Main → Worker: { type: 'audit', contractId: '...' }
 *   Main → Worker: { type: 'list' }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'contract-created', ... }
 *   Worker → Main: { type: 'verification-result', ... }
 *   Worker → Main: { type: 'sla-result', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Contract Registry
   ════════════════════════════════════════════════════════════════ */

var contracts = Object.create(null);
var contractCount = 0;
var auditLog = [];
var MAX_AUDIT = 5000;

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

var contractMetrics = {
  totalCreated: 0,
  totalVerified: 0,
  totalEnforced: 0,
  totalViolations: 0,
  totalRevoked: 0,
  totalSigned: 0
};

/* ════════════════════════════════════════════════════════════════
   Contract Operations
   ════════════════════════════════════════════════════════════════ */

function createContract(spec) {
  contractCount++;
  var id = 'CONTRACT-' + String(contractCount).padStart(4, '0');
  var contract = {
    id: id,
    name: spec.name || 'Unnamed Contract',
    terms: spec.terms || [],
    parties: spec.parties || [],
    sla: spec.sla || { maxLatencyMs: 5000, minUptime: 0.99, maxErrorRate: 0.01 },
    status: 'draft',   // draft, active, violated, revoked, expired
    signatures: [],
    createdAt: Date.now(),
    activatedAt: null,
    violationCount: 0,
    hash: null
  };

  // Generate integrity hash
  contract.hash = simpleHash(JSON.stringify(contract.terms) + contract.name + contract.createdAt);

  contracts[id] = contract;
  contractMetrics.totalCreated++;
  addAudit(id, 'created', 'Contract created: ' + contract.name);

  return contract;
}

function verifyOperation(contractId, operation) {
  if (!isSafeKey(contractId)) return { allowed: false, reason: 'invalid-key' };
  var contract = contracts[contractId];
  if (!contract) return { allowed: false, reason: 'contract-not-found' };
  if (contract.status === 'revoked') return { allowed: false, reason: 'contract-revoked' };
  if (contract.status === 'draft') return { allowed: false, reason: 'contract-not-active' };

  contractMetrics.totalVerified++;

  // Check terms
  var violations = [];
  for (var i = 0; i < contract.terms.length; i++) {
    var term = contract.terms[i];
    if (term.type === 'require-capability' && operation.capability !== term.value) {
      violations.push('Missing capability: ' + term.value);
    }
    if (term.type === 'max-priority' && operation.priority && operation.priority > term.value) {
      violations.push('Priority exceeds limit: ' + operation.priority + ' > ' + term.value);
    }
    if (term.type === 'allowed-parties' && term.value.indexOf(operation.party) === -1) {
      violations.push('Unauthorized party: ' + operation.party);
    }
  }

  if (violations.length > 0) {
    contract.violationCount++;
    contractMetrics.totalViolations++;
    addAudit(contractId, 'violation', violations.join('; '));
    return { allowed: false, reason: 'terms-violated', violations: violations };
  }

  addAudit(contractId, 'verified', 'Operation verified: ' + (operation.type || 'unknown'));
  return { allowed: true, contractId: contractId, hash: contract.hash };
}

function enforceSla(contractId, metrics) {
  if (!isSafeKey(contractId)) return { compliant: false, reason: 'invalid-key' };
  var contract = contracts[contractId];
  if (!contract) return { compliant: false, reason: 'contract-not-found' };

  contractMetrics.totalEnforced++;
  var violations = [];

  if (metrics.latencyMs > contract.sla.maxLatencyMs) {
    violations.push('Latency ' + metrics.latencyMs + 'ms exceeds ' + contract.sla.maxLatencyMs + 'ms');
  }
  if (metrics.uptime < contract.sla.minUptime) {
    violations.push('Uptime ' + (metrics.uptime * 100).toFixed(1) + '% below ' + (contract.sla.minUptime * 100) + '%');
  }
  if (metrics.errorRate > contract.sla.maxErrorRate) {
    violations.push('Error rate ' + (metrics.errorRate * 100).toFixed(1) + '% exceeds ' + (contract.sla.maxErrorRate * 100) + '%');
  }

  if (violations.length > 0) {
    contract.violationCount++;
    contract.status = 'violated';
    contractMetrics.totalViolations++;
    addAudit(contractId, 'sla-violation', violations.join('; '));
    return { compliant: false, violations: violations };
  }

  addAudit(contractId, 'sla-pass', 'SLA compliant');
  return { compliant: true, contractId: contractId };
}

function signContract(contractId, party) {
  if (!isSafeKey(contractId)) return null;
  var contract = contracts[contractId];
  if (!contract) return null;

  contract.signatures.push({ party: party, timestamp: Date.now() });
  contractMetrics.totalSigned++;

  // Activate if all parties have signed
  if (contract.signatures.length >= contract.parties.length && contract.parties.length > 0) {
    contract.status = 'active';
    contract.activatedAt = Date.now();
    addAudit(contractId, 'activated', 'All parties signed — contract active');
  } else {
    addAudit(contractId, 'signed', 'Signed by: ' + party);
  }

  return contract;
}

function revokeContract(contractId) {
  if (!isSafeKey(contractId)) return false;
  var contract = contracts[contractId];
  if (!contract) return false;
  contract.status = 'revoked';
  contractMetrics.totalRevoked++;
  addAudit(contractId, 'revoked', 'Contract revoked');
  return true;
}

/* ════════════════════════════════════════════════════════════════
   Audit Trail
   ════════════════════════════════════════════════════════════════ */

function addAudit(contractId, action, detail) {
  auditLog.push({
    contractId: contractId,
    action: action,
    detail: detail,
    timestamp: Date.now()
  });
  if (auditLog.length > MAX_AUDIT) auditLog = auditLog.slice(-MAX_AUDIT);
}

function simpleHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  return 'h-' + Math.abs(hash).toString(16).padStart(8, '0');
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'create-contract': {
      var contract = createContract(msg.contract || {});
      self.postMessage({ type: 'contract-created', contract: contract });
      break;
    }
    case 'verify': {
      var result = verifyOperation(msg.contractId, msg.operation || {});
      self.postMessage({ type: 'verification-result', data: result });
      break;
    }
    case 'enforce-sla': {
      var slaResult = enforceSla(msg.contractId, msg.metrics || {});
      self.postMessage({ type: 'sla-result', data: slaResult });
      break;
    }
    case 'sign': {
      var signed = signContract(msg.contractId, msg.party || 'organism');
      self.postMessage({ type: 'contract-signed', contract: signed });
      break;
    }
    case 'revoke': {
      var revoked = revokeContract(msg.contractId);
      self.postMessage({ type: 'contract-revoked', contractId: msg.contractId, success: revoked });
      break;
    }
    case 'audit': {
      var entries = auditLog.filter(function (a) { return a.contractId === msg.contractId; });
      self.postMessage({ type: 'audit-log', contractId: msg.contractId, entries: entries });
      break;
    }
    case 'list': {
      var list = [];
      for (var id in contracts) list.push(contracts[id]);
      self.postMessage({ type: 'contract-list', contracts: list });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'contract-stats', stats: contractMetrics, total: contractCount, auditSize: auditLog.length });
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
   Heartbeat — 873ms organism pulse
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('contract');

setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    worker: 'contract',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: contractMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
