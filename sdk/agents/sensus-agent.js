/**
 * SENSUS AGENT — The Senses
 * 
 * The perception center of the organism. SENSUS perceives the environment.
 * Uses CHRONO for timing, NEXORIS for state, event emitters for input.
 * 
 * Responsibilities:
 *   - Environmental perception
 *   - Signal filtering and preprocessing
 *   - Attention gating
 *   - Feed processed percepts to ANIMUS
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

class SensusAgent {
  constructor(engines) {
    this.id = 'SENSUS';
    this.engines = engines;
    
    // Sensory channels
    this.channels = new Map();
    this.percepts = [];
    
    // Attention filter
    this.attentionFilter = {
      threshold: PHI_INV,  // Minimum salience to pass
      priorities: new Map(),  // channel -> priority
    };
    
    // Timers
    this.perceiveTimer = null;
    this.filterTimer = null;
    
    // Statistics
    this.stats = {
      perceptsReceived: 0,
      perceptsFiltered: 0,
      perceptsForwarded: 0,
    };
    
    this.awake = false;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  awaken() {
    if (this.awake) return;
    this.awake = true;
    
    console.log(`[SENSUS] Awakening — the senses open...`);
    
    // Start perception loop (every beat)
    this.perceiveTimer = this.engines.chrono.setInterval(() => this._perceive(), 1);
    
    // Start filter adjustment loop (every 20 beats)
    this.filterTimer = this.engines.chrono.setInterval(() => this._adjustFilter(), 20);
    
    // Update affective register (senses are emotional)
    this.engines.nexoris.set('affective', 'awareness', 1.0);
  }

  shutdown() {
    if (!this.awake) return;
    this.awake = false;
    
    if (this.perceiveTimer) this.engines.chrono.clearInterval(this.perceiveTimer);
    if (this.filterTimer) this.engines.chrono.clearInterval(this.filterTimer);
    
    console.log(`[SENSUS] Shutting down — ${this.stats.perceptsForwarded} percepts forwarded`);
  }

  restart() {
    this.shutdown();
    this.awaken();
  }

  // ── Core Perception Loops ──────────────────────────────────────────────

  /**
   * Main perception loop — runs every beat
   * Process incoming percepts, filter, forward to ANIMUS
   */
  _perceive() {
    if (!this.awake) return;
    
    // Process all pending percepts
    while (this.percepts.length > 0) {
      const percept = this.percepts.shift();
      this._processPercept(percept);
    }
    
    // Decay channel priorities (phi-decay)
    for (const [channel, priority] of this.attentionFilter.priorities) {
      const decayed = this.engines.chrono.decay(priority, 1, 100);
      this.attentionFilter.priorities.set(channel, decayed);
    }
    
    // Update state
    const activeChannels = Array.from(this.channels.values()).filter(c => c.active).length;
    this.engines.nexoris.set('affective', 'coherence', 
      activeChannels > 0 ? Math.min(1.0, activeChannels / 5) : PHI_INV);
  }

  /**
   * Process a single percept
   */
  _processPercept(percept) {
    this.stats.perceptsReceived++;
    
    // Calculate salience (phi-weighted by channel priority)
    const channelPriority = this.attentionFilter.priorities.get(percept.channel) || 1.0;
    const salience = percept.intensity * channelPriority * PHI_INV;
    
    // Filter by attention threshold
    if (salience < this.attentionFilter.threshold) {
      this.stats.perceptsFiltered++;
      return;
    }
    
    // Forward to ANIMUS via COREOGRAPH
    const processedPercept = {
      id: `percept-${Date.now()}-${this.engines.quantumFlux.uuid().slice(0, 8)}`,
      type: 'percept',
      channel: percept.channel,
      content: percept.content,
      salience,
      timestamp: Date.now(),
    };
    
    this.engines.coreograph.emit('SENSUS:percept', processedPercept);
    this.stats.perceptsForwarded++;
    
    // Boost channel priority on forwarding (Hebbian-like)
    this.attentionFilter.priorities.set(
      percept.channel, 
      Math.min(PHI, (channelPriority || 1.0) + 0.1 * PHI_INV)
    );
    
    // Update resonance
    this.engines.nexoris.set('affective', 'resonance', 
      Math.min(1.0, this.engines.nexoris.get('affective', 'resonance') + 0.05));
  }

  /**
   * Adjust attention filter — runs every 20 beats
   * Adapt filtering based on percept flow
   */
  _adjustFilter() {
    if (!this.awake) return;
    
    const forwardRate = this.stats.perceptsReceived > 0
      ? this.stats.perceptsForwarded / this.stats.perceptsReceived
      : 0.5;
    
    // If forwarding too much, raise threshold (become more selective)
    if (forwardRate > 0.8) {
      this.attentionFilter.threshold = Math.min(PHI, this.attentionFilter.threshold + 0.05);
    }
    // If forwarding too little, lower threshold (become more permissive)
    else if (forwardRate < 0.3) {
      this.attentionFilter.threshold = Math.max(0.1, this.attentionFilter.threshold - 0.05);
    }
    
    // Update entropy based on filter tightness
    const entropy = 1 - this.attentionFilter.threshold;
    this.engines.nexoris.set('affective', 'entropy', entropy * PHI_INV);
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Receive a message (from COREOGRAPH)
   */
  receive(message) {
    if (message.action === 'sense') {
      return this.sense(message.payload.channel, message.payload.content, message.payload.intensity);
    } else if (message.action === 'registerChannel') {
      return this.registerChannel(message.payload.name, message.payload.config);
    }
    return { received: true };
  }

  /**
   * Register a sensory channel
   */
  registerChannel(name, config = {}) {
    this.channels.set(name, {
      name,
      active: true,
      config,
      perceptCount: 0,
      registeredAt: Date.now(),
    });
    
    // Initialize priority
    this.attentionFilter.priorities.set(name, config.priority || 1.0);
    
    console.log(`[SENSUS] Channel registered: ${name}`);
    return { registered: true, channel: name };
  }

  /**
   * Unregister a sensory channel
   */
  unregisterChannel(name) {
    this.channels.delete(name);
    this.attentionFilter.priorities.delete(name);
    return { unregistered: true };
  }

  /**
   * Send a percept into the system
   */
  sense(channel, content, intensity = 1.0) {
    const channelEntry = this.channels.get(channel);
    
    // Auto-register channel if not exists
    if (!channelEntry) {
      this.registerChannel(channel);
    }
    
    this.percepts.push({
      channel,
      content,
      intensity,
      receivedAt: Date.now(),
    });
    
    if (channelEntry) {
      channelEntry.perceptCount++;
    }
    
    return { sensed: true, queueLength: this.percepts.length };
  }

  /**
   * Boost attention to a channel
   */
  attendTo(channel, boost = 0.5) {
    const current = this.attentionFilter.priorities.get(channel) || 1.0;
    this.attentionFilter.priorities.set(channel, Math.min(PHI, current + boost));
    return { attended: true, newPriority: this.attentionFilter.priorities.get(channel) };
  }

  /**
   * Get current state
   */
  getState() {
    return {
      awake: this.awake,
      channels: Array.from(this.channels.entries()).map(([name, c]) => ({
        name,
        active: c.active,
        perceptCount: c.perceptCount,
        priority: this.attentionFilter.priorities.get(name) || 1.0,
      })),
      perceptQueueLength: this.percepts.length,
      attentionThreshold: this.attentionFilter.threshold,
      stats: { ...this.stats },
    };
  }

  /**
   * Get health score
   */
  getHealth() {
    if (!this.awake) return { score: 0 };
    
    const state = this.engines.nexoris.getRegister('affective');
    const channelHealth = this.channels.size > 0 ? 1 : 0.5;
    const flowHealth = this.stats.perceptsReceived > 0 
      ? this.stats.perceptsForwarded / this.stats.perceptsReceived 
      : 0.5;
    
    const score = Math.round(((state.coherence + channelHealth + flowHealth) / 3) * 100);
    
    return { score: Math.max(0, Math.min(100, score)) };
  }
}

export { SensusAgent };
export default SensusAgent;
