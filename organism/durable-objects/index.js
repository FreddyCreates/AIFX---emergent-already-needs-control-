/**
 * 🧬 Vein of Intelligence — Durable Object Worker Entry Point
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Main entry point for the three fractures of the vein of intelligence:
 * 
 *   FRACTURE I:   NeuronCluster — Hebbian neural network with synaptic plasticity
 *   FRACTURE II:  MemoryVault — Three-tier memory consolidation system
 *   FRACTURE III: ConsciousnessStream — Multi-agent coordination nexus
 * 
 * These Durable Objects form the cognitive substrate for synthetic intelligence.
 * AI agents can connect, store memories, learn associations, and achieve
 * collective coherence through Kuramoto phase synchronization.
 * 
 * @module organism/durable-objects
 * @version 1.0.0
 * @powered-by ORO Systems
 */

import { NeuronCluster } from './src/neuron-cluster.js';
import { MemoryVault } from './src/memory-vault.js';
import { ConsciousnessStream } from './src/consciousness-stream.js';

// ─── Security Triad ───────────────────────────────────────────────────────────
import { WraithGuard, SEVERITY, THREAT_TYPES, ACTIONS } from './src/security/wraith-guard.js';
import { GhostHoneypot, GHOST_TYPES, FAKE_DATA } from './src/security/ghost-honeypot.js';

// ─── Knowledge Layer ──────────────────────────────────────────────────────────
import { KnowledgeCorpus, DOC_TYPES, CHUNK_SIZES, CLUSTER_STATES } from './src/datasets/knowledge-corpus.js';

// ─── Phi Constants ────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ─── Export Durable Object Classes ────────────────────────────────────────────

// Cognitive Core
export { NeuronCluster, MemoryVault, ConsciousnessStream };

// Security Triad
export { WraithGuard, SEVERITY, THREAT_TYPES, ACTIONS };
export { GhostHoneypot, GHOST_TYPES, FAKE_DATA };

// Knowledge Layer
export { KnowledgeCorpus, DOC_TYPES, CHUNK_SIZES, CLUSTER_STATES };

/**
 * Main Worker — Routes requests to appropriate Durable Objects
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Agent-ID, X-Cluster-ID, X-Vault-ID, X-Stream-ID',
    };
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // ─── Health Check ─────────────────────────────────────────────────────
      if (path === '/' || path === '/health') {
        return jsonResponse({
          service: 'cognitive-organism',
          version: '2.0.0',
          layers: {
            cognitive: {
              neuronCluster: 'Hebbian neural network with synaptic plasticity',
              memoryVault: 'Three-tier memory consolidation system',
              consciousnessStream: 'Multi-agent coordination nexus',
            },
            security: {
              wraithGuard: 'Invisible threat detection with Hebbian anomaly learning',
              ghostHoneypot: 'Decoy system that traps and profiles attackers',
            },
            knowledge: {
              knowledgeCorpus: 'RAG-powered document corpus with phi-chunking',
            },
          },
          phi: PHI,
          heartbeat: HEARTBEAT,
          status: 'operational',
        }, corsHeaders);
      }
      
      // ─── NeuronCluster Routes (/cluster/*) ────────────────────────────────
      if (path.startsWith('/cluster/')) {
        const clusterId = url.searchParams.get('id') || request.headers.get('X-Cluster-ID') || 'default';
        const id = env.NEURON_CLUSTER.idFromName(clusterId);
        const stub = env.NEURON_CLUSTER.get(id);
        
        // Rewrite path
        const clusterPath = path.replace('/cluster', '');
        const newUrl = new URL(request.url);
        newUrl.pathname = clusterPath;
        
        const response = await stub.fetch(new Request(newUrl.toString(), request));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // ─── MemoryVault Routes (/vault/*) ────────────────────────────────────
      if (path.startsWith('/vault/')) {
        const vaultId = url.searchParams.get('id') || request.headers.get('X-Vault-ID') || 'default';
        const id = env.MEMORY_VAULT.idFromName(vaultId);
        const stub = env.MEMORY_VAULT.get(id);
        
        // Rewrite path
        const vaultPath = path.replace('/vault', '');
        const newUrl = new URL(request.url);
        newUrl.pathname = vaultPath;
        
        const response = await stub.fetch(new Request(newUrl.toString(), request));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // ─── ConsciousnessStream Routes (/stream/*) ───────────────────────────
      if (path.startsWith('/stream/')) {
        const streamId = url.searchParams.get('id') || request.headers.get('X-Stream-ID') || 'default';
        const id = env.CONSCIOUSNESS_STREAM.idFromName(streamId);
        const stub = env.CONSCIOUSNESS_STREAM.get(id);
        
        // Rewrite path
        const streamPath = path.replace('/stream', '');
        const newUrl = new URL(request.url);
        newUrl.pathname = streamPath;
        
        const response = await stub.fetch(new Request(newUrl.toString(), request));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // ─── Direct Access by Object Type ─────────────────────────────────────
      
      // POST /neuron — Direct NeuronCluster access
      if (path === '/neuron' && request.method === 'POST') {
        const body = await request.json();
        const clusterId = body.clusterId || 'default';
        const id = env.NEURON_CLUSTER.idFromName(clusterId);
        const stub = env.NEURON_CLUSTER.get(id);
        
        const action = body.action || 'state';
        let targetPath = '/cluster/state';
        
        if (action === 'fire') targetPath = '/neuron/fire';
        else if (action === 'register') targetPath = '/neuron/register';
        else if (action === 'connect') targetPath = '/synapse/connect';
        else if (action === 'update') targetPath = '/cluster/update';
        else if (action === 'learn') targetPath = '/cluster/learn';
        else if (action === 'respond') targetPath = '/cluster/respond';
        
        const response = await stub.fetch(new Request(
          `https://durable-object${targetPath}`,
          { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
        ));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // POST /memory — Direct MemoryVault access
      if (path === '/memory' && request.method === 'POST') {
        const body = await request.json();
        const vaultId = body.vaultId || 'default';
        const id = env.MEMORY_VAULT.idFromName(vaultId);
        const stub = env.MEMORY_VAULT.get(id);
        
        const action = body.action || 'state';
        let targetPath = '/vault/state';
        
        if (action === 'write') targetPath = '/memory/write';
        else if (action === 'read') targetPath = '/memory/read';
        else if (action === 'recall') targetPath = '/memory/recall';
        else if (action === 'search') targetPath = '/memory/search';
        else if (action === 'consolidate') targetPath = '/memory/consolidate';
        
        const response = await stub.fetch(new Request(
          `https://durable-object${targetPath}`,
          { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
        ));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // POST /consciousness — Direct ConsciousnessStream access
      if (path === '/consciousness' && request.method === 'POST') {
        const body = await request.json();
        const streamId = body.streamId || 'default';
        const id = env.CONSCIOUSNESS_STREAM.idFromName(streamId);
        const stub = env.CONSCIOUSNESS_STREAM.get(id);
        
        const action = body.action || 'state';
        let targetPath = '/stream/state';
        
        if (action === 'join') targetPath = '/agent/join';
        else if (action === 'leave') targetPath = '/agent/leave';
        else if (action === 'focus') targetPath = '/attention/focus';
        else if (action === 'push_goal') targetPath = '/goals/push';
        else if (action === 'sync') targetPath = '/sync/tick';
        else if (action === 'broadcast') targetPath = '/stream/broadcast';
        
        const response = await stub.fetch(new Request(
          `https://durable-object${targetPath}`,
          { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
        ));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // SECURITY TRIAD — Wraith/Ghost/Phantom
      // ═══════════════════════════════════════════════════════════════════════
      
      // ─── WraithGuard Routes (/security/wraith/*) ───────────────────────────
      if (path.startsWith('/security/wraith/')) {
        const wraithId = url.searchParams.get('id') || request.headers.get('X-Wraith-ID') || 'global';
        const id = env.WRAITH_GUARD.idFromName(wraithId);
        const stub = env.WRAITH_GUARD.get(id);
        
        const wraithPath = path.replace('/security/wraith', '');
        const newUrl = new URL(request.url);
        newUrl.pathname = wraithPath;
        
        const response = await stub.fetch(new Request(newUrl.toString(), request));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // ─── GhostHoneypot Routes (/security/ghost/*) ──────────────────────────
      if (path.startsWith('/security/ghost/')) {
        const ghostId = url.searchParams.get('id') || request.headers.get('X-Ghost-ID') || 'trap-1';
        const id = env.GHOST_HONEYPOT.idFromName(ghostId);
        const stub = env.GHOST_HONEYPOT.get(id);
        
        const ghostPath = path.replace('/security/ghost', '');
        const newUrl = new URL(request.url);
        newUrl.pathname = ghostPath;
        
        const response = await stub.fetch(new Request(newUrl.toString(), request));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // KNOWLEDGE LAYER — RAG Pipeline
      // ═══════════════════════════════════════════════════════════════════════
      
      // ─── KnowledgeCorpus Routes (/knowledge/*) ─────────────────────────────
      if (path.startsWith('/knowledge/')) {
        const corpusId = url.searchParams.get('id') || request.headers.get('X-Corpus-ID') || 'main';
        const id = env.KNOWLEDGE_CORPUS.idFromName(corpusId);
        const stub = env.KNOWLEDGE_CORPUS.get(id);
        
        const knowledgePath = path.replace('/knowledge', '');
        const newUrl = new URL(request.url);
        newUrl.pathname = knowledgePath;
        
        const response = await stub.fetch(new Request(newUrl.toString(), request));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // DIRECT ACCESS ENDPOINTS
      // ═══════════════════════════════════════════════════════════════════════
      
      // POST /security — Direct security check
      if (path === '/security' && request.method === 'POST') {
        const body = await request.json();
        const wraithId = body.wraithId || 'global';
        const id = env.WRAITH_GUARD.idFromName(wraithId);
        const stub = env.WRAITH_GUARD.get(id);
        
        const response = await stub.fetch(new Request(
          'https://durable-object/check',
          { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
        ));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // POST /rag — Direct RAG query
      if (path === '/rag' && request.method === 'POST') {
        const body = await request.json();
        const corpusId = body.corpusId || 'main';
        const id = env.KNOWLEDGE_CORPUS.idFromName(corpusId);
        const stub = env.KNOWLEDGE_CORPUS.get(id);
        
        const response = await stub.fetch(new Request(
          'https://durable-object/query',
          { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
        ));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // POST /ingest — Direct document ingestion
      if (path === '/ingest' && request.method === 'POST') {
        const body = await request.json();
        const corpusId = body.corpusId || 'main';
        const id = env.KNOWLEDGE_CORPUS.idFromName(corpusId);
        const stub = env.KNOWLEDGE_CORPUS.get(id);
        
        const response = await stub.fetch(new Request(
          'https://durable-object/ingest',
          { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
        ));
        return addCorsHeaders(response, corsHeaders);
      }
      
      // ─── Unknown Route ────────────────────────────────────────────────────
      return jsonResponse({
        error: 'Unknown route',
        path,
        availableRoutes: {
          // Cognitive Core
          cluster: '/cluster/* — NeuronCluster operations',
          vault: '/vault/* — MemoryVault operations',
          stream: '/stream/* — ConsciousnessStream operations',
          neuron: 'POST /neuron — Direct NeuronCluster access',
          memory: 'POST /memory — Direct MemoryVault access',
          consciousness: 'POST /consciousness — Direct ConsciousnessStream access',
          // Security Triad
          wraith: '/security/wraith/* — WraithGuard operations',
          ghost: '/security/ghost/* — GhostHoneypot operations',
          security: 'POST /security — Direct security check',
          // Knowledge Layer
          knowledge: '/knowledge/* — KnowledgeCorpus operations',
          rag: 'POST /rag — Direct RAG query',
          ingest: 'POST /ingest — Document ingestion',
        },
      }, corsHeaders, 404);
      
    } catch (err) {
      // Log full error internally but don't expose stack traces to clients
      console.error('Request handler error:', err);
      return jsonResponse({ error: err.message }, corsHeaders, 500);
    }
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function jsonResponse(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

function addCorsHeaders(response, corsHeaders) {
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
