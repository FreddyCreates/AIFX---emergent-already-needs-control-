/**
 * 🧠 NeuronCluster Durable Object
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * FRACTURE I OF THE VEIN OF INTELLIGENCE
 * 
 * A synthetic neural cluster that learns via Hebbian plasticity. Each cluster
 * is a globally unique, single-threaded cognitive entity with its own private
 * persistent storage. Multiple AI agents can connect and coordinate through
 * a single cluster.
 * 
 * Features:
 *   - In-memory neural state (synapses, activations, eligibility traces)
 *   - Persistent learning (SQLite-backed storage)
 *   - Hebbian LTP/LTD (Long-Term Potentiation/Depression)
 *   - Phi-modulated plasticity (φ = 1.618...)
 *   - WebSocket support for real-time neural streaming
 * 
 * @module organism/durable-objects/neuron-cluster
 * @version 1.0.0
 * @powered-by ORO Systems
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT = 873;
const LEARNING_RATE = 0.01;
const DECAY_RATE = 0.001;

/**
 * NeuronCluster — A Durable Object representing a cluster of neurons
 * that learn via Hebbian plasticity.
 */
export class NeuronCluster {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    
    // ─── In-Memory Neural State ───────────────────────────────────────────────
    this.neurons = new Map();        // neuronId -> { activation, lastFired, fireCount }
    this.synapses = new Map();       // "pre->post" -> { weight, trace, updateCount }
    this.activationBuffer = [];      // Recent activations for pattern detection
    this.websockets = new Set();     // Connected clients
    
    // ─── Metrics ──────────────────────────────────────────────────────────────
    this.totalUpdates = 0;
    this.ltpEvents = 0;
    this.ltdEvents = 0;
    this.lastHeartbeat = Date.now();
    this.initialized = false;
    
    // Initialize from storage
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    // Load persisted neurons
    const storedNeurons = await this.storage.get('neurons');
    if (storedNeurons) {
      this.neurons = new Map(Object.entries(storedNeurons));
    }
    
    // Load persisted synapses
    const storedSynapses = await this.storage.get('synapses');
    if (storedSynapses) {
      this.synapses = new Map(Object.entries(storedSynapses));
    }
    
    // Load metrics
    const metrics = await this.storage.get('metrics');
    if (metrics) {
      this.totalUpdates = metrics.totalUpdates || 0;
      this.ltpEvents = metrics.ltpEvents || 0;
      this.ltdEvents = metrics.ltdEvents || 0;
    }
    
    this.initialized = true;
  }

  async fetch(request) {
    await this.initPromise;
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    // WebSocket upgrade for real-time neural streaming
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    
    // REST API routes
    try {
      if (path === '/neuron/register' && request.method === 'POST') {
        return this.handleRegisterNeuron(request);
      }
      if (path === '/synapse/connect' && request.method === 'POST') {
        return this.handleConnect(request);
      }
      if (path === '/neuron/fire' && request.method === 'POST') {
        return this.handleFire(request);
      }
      if (path === '/cluster/update' && request.method === 'POST') {
        return this.handleUpdate(request);
      }
      if (path === '/cluster/state' && request.method === 'GET') {
        return this.handleGetState();
      }
      if (path === '/cluster/learn' && request.method === 'POST') {
        return this.handleLearn(request);
      }
      if (path === '/cluster/respond' && request.method === 'POST') {
        return this.handleRespond(request);
      }
      if (path === '/cluster/heartbeat' && request.method === 'POST') {
        return this.handleHeartbeat();
      }
      
      return new Response(JSON.stringify({ error: 'Unknown route', path }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ─── Neuron Registration ────────────────────────────────────────────────────
  async handleRegisterNeuron(request) {
    const { neuronId, initialActivation = 0 } = await request.json();
    
    if (!neuronId) {
      return this.jsonResponse({ error: 'neuronId required' }, 400);
    }
    
    this.neurons.set(neuronId, {
      id: neuronId,
      activation: initialActivation,
      lastFired: null,
      fireCount: 0,
      createdAt: Date.now(),
    });
    
    await this.persistNeurons();
    this.broadcast({ event: 'neuron_registered', neuronId });
    
    return this.jsonResponse({ 
      registered: true, 
      neuronId,
      totalNeurons: this.neurons.size 
    });
  }

  // ─── Synapse Connection ─────────────────────────────────────────────────────
  async handleConnect(request) {
    const { preId, postId, initialWeight = 0.5 } = await request.json();
    
    if (!this.neurons.has(preId) || !this.neurons.has(postId)) {
      return this.jsonResponse({ error: 'Neurons must be registered first' }, 400);
    }
    
    const key = `${preId}->${postId}`;
    
    this.synapses.set(key, {
      pre: preId,
      post: postId,
      weight: initialWeight,
      trace: 0,
      updateCount: 0,
      lastUpdate: Date.now(),
    });
    
    await this.persistSynapses();
    this.broadcast({ event: 'synapse_connected', key, weight: initialWeight });
    
    return this.jsonResponse({ 
      connected: true, 
      synapse: key,
      weight: initialWeight,
      totalSynapses: this.synapses.size 
    });
  }

  // ─── Neural Firing ──────────────────────────────────────────────────────────
  async handleFire(request) {
    const { neuronId, activation } = await request.json();
    
    const neuron = this.neurons.get(neuronId);
    if (!neuron) {
      return this.jsonResponse({ error: 'Neuron not found' }, 404);
    }
    
    const oldActivation = neuron.activation;
    neuron.activation = Math.max(0, Math.min(1, activation));
    neuron.lastFired = Date.now();
    neuron.fireCount++;
    
    // Update eligibility traces for downstream synapses
    for (const [key, synapse] of this.synapses) {
      if (synapse.pre === neuronId) {
        // Eligibility trace with phi decay
        synapse.trace = synapse.trace * PHI_INV + neuron.activation;
      }
    }
    
    this.activationBuffer.push({
      neuronId,
      activation: neuron.activation,
      timestamp: Date.now(),
    });
    if (this.activationBuffer.length > 100) {
      this.activationBuffer.shift();
    }
    
    await this.persistNeurons();
    this.broadcast({ 
      event: 'neuron_fired', 
      neuronId, 
      oldActivation, 
      newActivation: neuron.activation 
    });
    
    return this.jsonResponse({ 
      fired: true, 
      neuronId, 
      oldActivation, 
      newActivation: neuron.activation 
    });
  }

  // ─── Hebbian Update ─────────────────────────────────────────────────────────
  async handleUpdate(request) {
    this.totalUpdates++;
    const updates = [];
    
    for (const [key, synapse] of this.synapses) {
      const pre = this.neurons.get(synapse.pre);
      const post = this.neurons.get(synapse.post);
      if (!pre || !post) continue;
      
      // Hebbian rule: dw = η * (pre × post) - λ * w
      const prePost = pre.activation * post.activation;
      const phiMod = Math.sin(this.totalUpdates / PHI) * 0.1 + 1;
      
      let dw = LEARNING_RATE * prePost * phiMod - DECAY_RATE * synapse.weight;
      
      // STDP-like trace reinforcement
      dw += LEARNING_RATE * synapse.trace * post.activation * PHI_INV;
      
      const oldWeight = synapse.weight;
      synapse.weight = Math.max(0, Math.min(1, synapse.weight + dw));
      synapse.lastUpdate = Date.now();
      synapse.updateCount++;
      
      // Track LTP/LTD
      if (dw > 0.001) this.ltpEvents++;
      if (dw < -0.001) this.ltdEvents++;
      
      if (Math.abs(synapse.weight - oldWeight) > 0.001) {
        updates.push({
          synapse: key,
          oldWeight: parseFloat(oldWeight.toFixed(4)),
          newWeight: parseFloat(synapse.weight.toFixed(4)),
          delta: parseFloat(dw.toFixed(6)),
        });
      }
      
      // Decay eligibility trace
      synapse.trace *= PHI_INV;
    }
    
    await this.persistSynapses();
    await this.persistMetrics();
    
    this.broadcast({ event: 'cluster_updated', updates: updates.length });
    
    return this.jsonResponse({
      updated: true,
      totalUpdates: this.totalUpdates,
      synapsesUpdated: updates.length,
      updates,
      ltpEvents: this.ltpEvents,
      ltdEvents: this.ltdEvents,
    });
  }

  // ─── Stimulus-Response Learning ─────────────────────────────────────────────
  async handleLearn(request) {
    const { stimulus, response, reward = 1.0 } = await request.json();
    
    const stimKey = this.normalize(stimulus);
    const respKey = this.normalize(response);
    
    // Get or create stimulus neuron
    if (!this.neurons.has(`stim:${stimKey}`)) {
      this.neurons.set(`stim:${stimKey}`, {
        id: `stim:${stimKey}`,
        activation: 0,
        lastFired: null,
        fireCount: 0,
        createdAt: Date.now(),
      });
    }
    
    // Get or create response neuron
    if (!this.neurons.has(`resp:${respKey}`)) {
      this.neurons.set(`resp:${respKey}`, {
        id: `resp:${respKey}`,
        activation: 0,
        lastFired: null,
        fireCount: 0,
        createdAt: Date.now(),
      });
    }
    
    // Create or strengthen synapse
    const synapseKey = `stim:${stimKey}->resp:${respKey}`;
    const existing = this.synapses.get(synapseKey);
    
    const delta = LEARNING_RATE * reward * PHI;
    const oldWeight = existing?.weight || 0;
    const newWeight = Math.min(1, oldWeight + delta);
    
    this.synapses.set(synapseKey, {
      pre: `stim:${stimKey}`,
      post: `resp:${respKey}`,
      weight: newWeight,
      trace: existing?.trace || 0,
      updateCount: (existing?.updateCount || 0) + 1,
      lastUpdate: Date.now(),
    });
    
    await this.persistNeurons();
    await this.persistSynapses();
    
    this.broadcast({ event: 'learned', stimulus: stimKey, response: respKey, weight: newWeight });
    
    return this.jsonResponse({
      learned: true,
      stimulus: stimKey,
      response: respKey,
      oldWeight: parseFloat(oldWeight.toFixed(4)),
      newWeight: parseFloat(newWeight.toFixed(4)),
    });
  }

  // ─── Stimulus-Response Retrieval ────────────────────────────────────────────
  async handleRespond(request) {
    const { stimulus } = await request.json();
    const stimKey = this.normalize(stimulus);
    
    // Find all synapses from this stimulus
    const candidates = [];
    for (const [key, synapse] of this.synapses) {
      if (synapse.pre === `stim:${stimKey}`) {
        candidates.push({
          response: synapse.post.replace('resp:', ''),
          weight: synapse.weight,
        });
      }
    }
    
    if (candidates.length === 0) {
      return this.jsonResponse({ response: null, confidence: 0, novel: true });
    }
    
    // Return highest-weighted response
    candidates.sort((a, b) => b.weight - a.weight);
    const best = candidates[0];
    
    return this.jsonResponse({
      response: best.response,
      confidence: parseFloat(best.weight.toFixed(4)),
      novel: false,
      alternatives: candidates.slice(1, 4),
    });
  }

  // ─── Heartbeat ──────────────────────────────────────────────────────────────
  async handleHeartbeat() {
    const now = Date.now();
    const delta = now - this.lastHeartbeat;
    this.lastHeartbeat = now;
    
    // Apply global decay
    for (const [key, synapse] of this.synapses) {
      synapse.weight *= (1 - DECAY_RATE * (delta / HEARTBEAT));
      synapse.trace *= PHI_INV;
    }
    
    // Decay neuron activations
    for (const [id, neuron] of this.neurons) {
      neuron.activation *= PHI_INV;
    }
    
    await this.persistSynapses();
    await this.persistNeurons();
    
    this.broadcast({ event: 'heartbeat', delta, timestamp: now });
    
    return this.jsonResponse({
      heartbeat: true,
      delta,
      neurons: this.neurons.size,
      synapses: this.synapses.size,
      timestamp: now,
    });
  }

  // ─── Get State ──────────────────────────────────────────────────────────────
  async handleGetState() {
    const neurons = Array.from(this.neurons.entries()).map(([id, n]) => ({
      id,
      activation: parseFloat(n.activation.toFixed(4)),
      fireCount: n.fireCount,
    }));
    
    const synapses = Array.from(this.synapses.entries()).map(([key, s]) => ({
      key,
      weight: parseFloat(s.weight.toFixed(4)),
      updateCount: s.updateCount,
    }));
    
    return this.jsonResponse({
      objectType: 'NeuronCluster',
      version: '1.0.0',
      neurons,
      synapses,
      metrics: {
        totalUpdates: this.totalUpdates,
        ltpEvents: this.ltpEvents,
        ltdEvents: this.ltdEvents,
        lastHeartbeat: this.lastHeartbeat,
      },
      phi: PHI,
      heartbeat: HEARTBEAT,
    });
  }

  // ─── WebSocket Handling ─────────────────────────────────────────────────────
  handleWebSocket(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    this.state.acceptWebSocket(server);
    this.websockets.add(server);
    
    server.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.action === 'fire') {
          const result = await this.handleFire({ json: async () => msg });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'learn') {
          const result = await this.handleLearn({ json: async () => msg });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'respond') {
          const result = await this.handleRespond({ json: async () => msg });
          server.send(JSON.stringify(await result.json()));
        }
      } catch (e) {
        server.send(JSON.stringify({ error: e.message }));
      }
    });
    
    server.addEventListener('close', () => {
      this.websockets.delete(server);
    });
    
    return new Response(null, { status: 101, webSocket: client });
  }

  // ─── Utilities ──────────────────────────────────────────────────────────────
  normalize(value) {
    if (typeof value === 'string') return value.toLowerCase().trim();
    return JSON.stringify(value);
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    for (const ws of this.websockets) {
      try {
        ws.send(data);
      } catch (e) {
        this.websockets.delete(ws);
      }
    }
  }

  jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async persistNeurons() {
    const obj = Object.fromEntries(this.neurons);
    await this.storage.put('neurons', obj);
  }

  async persistSynapses() {
    const obj = Object.fromEntries(this.synapses);
    await this.storage.put('synapses', obj);
  }

  async persistMetrics() {
    await this.storage.put('metrics', {
      totalUpdates: this.totalUpdates,
      ltpEvents: this.ltpEvents,
      ltdEvents: this.ltdEvents,
    });
  }
}

export default NeuronCluster;
