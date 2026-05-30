/**
 * Infrastructure Mesh Worker — Cross-Tab & Peer Coordination
 *
 * Permanent Web Worker that provides:
 * - BroadcastChannel mesh networking (cross-tab communication)
 * - Peer discovery and registration
 * - Shared state coordination across browser tabs
 * - Leader election (one tab becomes coordinator)
 * - Message relay and broadcast
 *
 * This worker IS the organism's infrastructure backbone.
 * Every tab running the organism becomes a node in the mesh.
 * They coordinate, share state, and elect a leader.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'join', nodeId: '...', capabilities: [...] }
 *   Main → Worker: { type: 'broadcast', channel: '...', message: {...} }
 *   Main → Worker: { type: 'send', targetNode: '...', message: {...} }
 *   Main → Worker: { type: 'peers' }
 *   Main → Worker: { type: 'leader' }
 *   Main → Worker: { type: 'state', key: '...', value: {...} }
 *   Main → Worker: { type: 'get-state', key: '...' }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'mesh-joined', ... }
 *   Worker → Main: { type: 'mesh-message', ... }
 *   Worker → Main: { type: 'leader-elected', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var PEER_TIMEOUT_MS = 10000;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Mesh State
   ════════════════════════════════════════════════════════════════ */

var localNodeId = null;
var peers = Object.create(null);
var sharedState = Object.create(null);
var leaderId = null;
var meshChannel = null;

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

var meshMetrics = {
  totalBroadcasts: 0,
  totalMessages: 0,
  totalPeersDiscovered: 0,
  totalLeaderElections: 0,
  totalStateUpdates: 0
};

/* ════════════════════════════════════════════════════════════════
   BroadcastChannel Mesh
   ════════════════════════════════════════════════════════════════ */

function initMesh(nodeId, capabilities) {
  localNodeId = nodeId || ('node-' + Date.now().toString(36));

  // BroadcastChannel for cross-tab communication
  if (typeof BroadcastChannel !== 'undefined') {
    meshChannel = new BroadcastChannel('organism-mesh');
    meshChannel.onmessage = function (e) {
      handleMeshMessage(e.data);
    };
  }

  // Register self
  peers[localNodeId] = {
    id: localNodeId,
    capabilities: capabilities || [],
    joinedAt: Date.now(),
    lastSeen: Date.now(),
    isLocal: true
  };

  // Announce presence
  broadcastMesh({
    meshType: 'announce',
    nodeId: localNodeId,
    capabilities: capabilities || [],
    timestamp: Date.now()
  });

  // Start leader election
  electLeader();

  return { nodeId: localNodeId, meshAvailable: !!meshChannel };
}

function handleMeshMessage(msg) {
  if (!msg || !msg.meshType) return;
  if (msg.nodeId === localNodeId) return; // Ignore own messages

  meshMetrics.totalMessages++;

  switch (msg.meshType) {
    case 'announce': {
      if (!isSafeKey(msg.nodeId)) break;
      peers[msg.nodeId] = {
        id: msg.nodeId,
        capabilities: msg.capabilities || [],
        joinedAt: msg.timestamp,
        lastSeen: Date.now(),
        isLocal: false
      };
      meshMetrics.totalPeersDiscovered++;
      // Re-elect leader when new peer joins
      electLeader();
      // Respond with our own announcement
      broadcastMesh({
        meshType: 'ack',
        nodeId: localNodeId,
        timestamp: Date.now()
      });
      self.postMessage({ type: 'peer-joined', nodeId: msg.nodeId });
      break;
    }
    case 'ack': {
      if (!isSafeKey(msg.nodeId)) break;
      if (peers[msg.nodeId]) {
        peers[msg.nodeId].lastSeen = Date.now();
      } else {
        peers[msg.nodeId] = {
          id: msg.nodeId,
          capabilities: [],
          joinedAt: msg.timestamp,
          lastSeen: Date.now(),
          isLocal: false
        };
        meshMetrics.totalPeersDiscovered++;
      }
      break;
    }
    case 'state-update': {
      if (isSafeKey(msg.key)) {
        sharedState[msg.key] = msg.value;
        meshMetrics.totalStateUpdates++;
        self.postMessage({ type: 'state-updated', key: msg.key, value: msg.value, source: msg.nodeId });
      }
      break;
    }
    case 'message': {
      if (!msg.targetNode || msg.targetNode === localNodeId) {
        self.postMessage({ type: 'mesh-message', from: msg.nodeId, message: msg.payload });
      }
      break;
    }
    case 'leave': {
      if (isSafeKey(msg.nodeId)) {
        delete peers[msg.nodeId];
        electLeader();
        self.postMessage({ type: 'peer-left', nodeId: msg.nodeId });
      }
      break;
    }
  }
}

function broadcastMesh(msg) {
  if (meshChannel) {
    meshChannel.postMessage(msg);
    meshMetrics.totalBroadcasts++;
  }
}

function electLeader() {
  // Simple: lowest nodeId wins
  var candidates = Object.keys(peers);
  candidates.sort();
  var newLeader = candidates.length > 0 ? candidates[0] : localNodeId;
  if (newLeader !== leaderId) {
    leaderId = newLeader;
    meshMetrics.totalLeaderElections++;
    self.postMessage({ type: 'leader-elected', leaderId: leaderId, isLocal: leaderId === localNodeId });
  }
}

function pruneDeadPeers() {
  var now = Date.now();
  for (var id in peers) {
    if (!peers[id].isLocal && (now - peers[id].lastSeen) > PEER_TIMEOUT_MS) {
      delete peers[id];
      self.postMessage({ type: 'peer-timeout', nodeId: id });
    }
  }
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'join': {
      var result = initMesh(msg.nodeId, msg.capabilities);
      self.postMessage({ type: 'mesh-joined', data: result });
      break;
    }
    case 'broadcast': {
      broadcastMesh({
        meshType: 'message',
        nodeId: localNodeId,
        payload: msg.message,
        timestamp: Date.now()
      });
      break;
    }
    case 'send': {
      broadcastMesh({
        meshType: 'message',
        nodeId: localNodeId,
        targetNode: msg.targetNode,
        payload: msg.message,
        timestamp: Date.now()
      });
      break;
    }
    case 'peers': {
      var list = [];
      for (var id in peers) list.push(peers[id]);
      self.postMessage({ type: 'peer-list', peers: list, leader: leaderId });
      break;
    }
    case 'leader': {
      self.postMessage({ type: 'leader-info', leaderId: leaderId, isLocal: leaderId === localNodeId });
      break;
    }
    case 'state': {
      if (isSafeKey(msg.key)) {
        sharedState[msg.key] = msg.value;
        meshMetrics.totalStateUpdates++;
        broadcastMesh({
          meshType: 'state-update',
          nodeId: localNodeId,
          key: msg.key,
          value: msg.value,
          timestamp: Date.now()
        });
        self.postMessage({ type: 'state-set', key: msg.key });
      }
      break;
    }
    case 'get-state': {
      self.postMessage({ type: 'state-value', key: msg.key, value: isSafeKey(msg.key) ? sharedState[msg.key] : undefined });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'mesh-stats', stats: meshMetrics, peerCount: Object.keys(peers).length, leader: leaderId });
      break;
    }
    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      broadcastMesh({ meshType: 'leave', nodeId: localNodeId, timestamp: Date.now() });
      if (meshChannel) meshChannel.close();
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat + Peer maintenance
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('mesh');

setInterval(function () {
  if (!running) return;
  beatCount++;
  pruneDeadPeers();

  // Periodic mesh ping
  if (beatCount % 5 === 0 && localNodeId) {
    broadcastMesh({ meshType: 'ack', nodeId: localNodeId, timestamp: Date.now() });
  }

  self.postMessage({
    type: 'heartbeat',
    worker: 'mesh',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: meshMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
