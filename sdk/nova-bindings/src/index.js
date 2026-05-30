/**
 * Nova AI Bindings SDK
 * 
 * Universal binding layer for Jarvis extension, Cloudflare Workers,
 * and all deployment surfaces to communicate with Nova AI infrastructure.
 * 
 * @module sdk/nova-bindings
 * @version 1.0.0
 * @powered-by Nova Princeps (Tier V Sovereign)
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────
export const PHI = 1.618033988749895;
export const PHI_INV = 0.618033988749895;
export const HEARTBEAT = 873;
export const GOLDEN_ANGLE = 137.508;
export const EMERGENCE_THRESHOLD = PHI_INV;

// ─── Nova AI Endpoints ────────────────────────────────────────────────────────
export const NOVA_ENDPOINTS = {
  // Production endpoints
  SOVEREIGN: 'https://nova.organism.earth',
  GATE: 'https://gate.organism.earth',
  KNOWLEDGE: 'https://knowledge.organism.earth',
  
  // GitHub Pages fallback
  PAGES_ROOT: 'https://itsnotailabs.com',
  DOCUMENTS_PORTAL: 'https://itsnotailabs.com/documents.html',
  
  // API routes
  API: {
    AUTH: '/api/auth/geometric-key',
    QUERY: '/api/knowledge/query',
    STATUS: '/api/workers/status',
    PING: '/api/hebbian/ping',
    CHARTER: '/api/charter',
    GOVERNANCE: '/api/governance',
  },
};

// ─── Deployment Targets ───────────────────────────────────────────────────────
export const DEPLOYMENT_TARGETS = {
  JARVIS: 'jarvis-extension',
  VIGIL: 'vigil-extension',
  CLOUDFLARE: 'cloudflare-workers',
  ICP: 'internet-computer',
  GITHUB_PAGES: 'github-pages',
  LOCAL: 'local-development',
};

// ─── Message Types ────────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  // Binding messages
  BIND_REQUEST: 'nova:bind:request',
  BIND_RESPONSE: 'nova:bind:response',
  BIND_ACK: 'nova:bind:ack',
  
  // Heartbeat messages
  HEARTBEAT: 'nova:heartbeat',
  HEARTBEAT_ACK: 'nova:heartbeat:ack',
  
  // Query messages
  QUERY: 'nova:query',
  QUERY_RESPONSE: 'nova:query:response',
  
  // Auth messages
  AUTH_REQUEST: 'nova:auth:request',
  AUTH_RESPONSE: 'nova:auth:response',
  
  // Document messages
  DOC_REQUEST: 'nova:doc:request',
  DOC_RESPONSE: 'nova:doc:response',
  
  // Deployment messages
  DEPLOY_STATUS: 'nova:deploy:status',
  DEPLOY_NOTIFY: 'nova:deploy:notify',
};

// ─── NovaBinding Class ────────────────────────────────────────────────────────

/**
 * Core Nova AI Binding - establishes connection between deployment surfaces
 */
export class NovaBinding {
  constructor(options = {}) {
    this.source = options.source || DEPLOYMENT_TARGETS.LOCAL;
    this.target = options.target || DEPLOYMENT_TARGETS.CLOUDFLARE;
    this.id = this._generateBindingId();
    this.phase = this._calculatePhase();
    this.connected = false;
    this.lastHeartbeat = 0;
    this.heartbeatInterval = null;
    this.listeners = new Map();
    this.pendingRequests = new Map();
    this.stats = {
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      latencyMs: 0,
    };
  }

  /**
   * Generate phi-based binding ID
   */
  _generateBindingId() {
    const timestamp = Date.now();
    const phiComponent = Math.floor((timestamp % 10000) * PHI);
    return `nova-bind-${this.source}-${phiComponent.toString(36)}`;
  }

  /**
   * Calculate current phase in heartbeat cycle
   */
  _calculatePhase() {
    const now = Date.now();
    const cyclePosition = (now % HEARTBEAT) / HEARTBEAT;
    return cyclePosition * 2 * Math.PI;
  }

  /**
   * Initialize the binding connection
   */
  async connect() {
    try {
      // Clear any existing heartbeat interval to prevent leaks
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      
      // Start heartbeat
      this.heartbeatInterval = setInterval(() => this._heartbeat(), HEARTBEAT);
      
      // Send initial bind request
      const response = await this._sendMessage({
        type: MESSAGE_TYPES.BIND_REQUEST,
        source: this.source,
        target: this.target,
        bindingId: this.id,
        phase: this.phase,
        timestamp: Date.now(),
      });

      if (response && response.type === MESSAGE_TYPES.BIND_RESPONSE) {
        this.connected = true;
        this._emit('connected', { bindingId: this.id });
        return true;
      }
      
      // Even without response, consider connected for local operations
      // This allows offline-first behavior where local operations work
      this.connected = true;
      this._emit('connected', { bindingId: this.id, offline: true });
      return true;
    } catch (error) {
      this.stats.errors++;
      this._emit('error', { error: error.message });
      // Soft fail - allow local operations in offline mode
      this.connected = true;
      return true;
    }
  }

  /**
   * Disconnect binding
   */
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.connected = false;
    this._emit('disconnected', { bindingId: this.id });
  }

  /**
   * Internal heartbeat tick
   */
  _heartbeat() {
    this.lastHeartbeat = Date.now();
    this.phase = this._calculatePhase();
    
    this._sendMessage({
      type: MESSAGE_TYPES.HEARTBEAT,
      bindingId: this.id,
      phase: this.phase,
      timestamp: this.lastHeartbeat,
    }).catch(() => {
      // Silent fail on heartbeat - don't spam errors
    });
    
    this._emit('heartbeat', { phase: this.phase, timestamp: this.lastHeartbeat });
  }

  /**
   * Send a message to target
   */
  async _sendMessage(message) {
    this.stats.messagesSent++;
    const startTime = Date.now();
    
    try {
      // For browser extension context
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(message, (response) => {
            this.stats.latencyMs = Date.now() - startTime;
            this.stats.messagesReceived++;
            resolve(response);
          });
        });
      }
      
      // For worker context - use fetch
      const endpoint = this._getEndpoint(message.type);
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        this.stats.latencyMs = Date.now() - startTime;
        this.stats.messagesReceived++;
        return response.json();
      }
      
      return null;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * Get endpoint for message type
   */
  _getEndpoint(messageType) {
    switch (messageType) {
      case MESSAGE_TYPES.AUTH_REQUEST:
        return `${NOVA_ENDPOINTS.GATE}${NOVA_ENDPOINTS.API.AUTH}`;
      case MESSAGE_TYPES.QUERY:
        return `${NOVA_ENDPOINTS.KNOWLEDGE}${NOVA_ENDPOINTS.API.QUERY}`;
      case MESSAGE_TYPES.HEARTBEAT:
        return `${NOVA_ENDPOINTS.SOVEREIGN}${NOVA_ENDPOINTS.API.PING}`;
      default:
        return `${NOVA_ENDPOINTS.SOVEREIGN}${NOVA_ENDPOINTS.API.STATUS}`;
    }
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  _emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }

  /**
   * Get binding statistics
   */
  getStats() {
    return {
      ...this.stats,
      bindingId: this.id,
      connected: this.connected,
      source: this.source,
      target: this.target,
      lastHeartbeat: this.lastHeartbeat,
      phase: this.phase,
    };
  }
}

// ─── JarvisNovaBinding Class ──────────────────────────────────────────────────

/**
 * Specialized binding for Jarvis extension to Nova AI
 */
export class JarvisNovaBinding extends NovaBinding {
  constructor(options = {}) {
    super({
      ...options,
      source: DEPLOYMENT_TARGETS.JARVIS,
    });
    
    this.extensionId = options.extensionId || null;
    this.activeTab = null;
    this.pageContext = null;
    this.documentCache = new Map();
  }

  /**
   * Connect with Jarvis-specific setup
   */
  async connect() {
    await super.connect();
    
    // Setup message listener for extension
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this._handleExtensionMessage(message, sender, sendResponse);
        return true; // Keep channel open for async response
      });
    }
    
    return this.connected;
  }

  /**
   * Handle incoming extension messages
   */
  _handleExtensionMessage(message, sender, sendResponse) {
    if (!message.type || !message.type.startsWith('nova:')) {
      return;
    }

    switch (message.type) {
      case MESSAGE_TYPES.HEARTBEAT_ACK:
        this._emit('heartbeat_ack', message);
        sendResponse({ success: true });
        break;
        
      case MESSAGE_TYPES.QUERY_RESPONSE:
        this._emit('query_response', message);
        sendResponse({ success: true });
        break;
        
      case MESSAGE_TYPES.DOC_RESPONSE:
        this._handleDocResponse(message);
        sendResponse({ success: true });
        break;
        
      case MESSAGE_TYPES.DEPLOY_NOTIFY:
        this._emit('deploy_notify', message);
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  /**
   * Request document from Nova AI
   */
  async requestDocument(docId, format = 'pdf') {
    const cached = this.documentCache.get(`${docId}-${format}`);
    if (cached && Date.now() - cached.timestamp < 300000) {
      return cached.data;
    }

    const response = await this._sendMessage({
      type: MESSAGE_TYPES.DOC_REQUEST,
      bindingId: this.id,
      docId,
      format,
      timestamp: Date.now(),
    });

    if (response && response.data) {
      this.documentCache.set(`${docId}-${format}`, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  }

  /**
   * Handle document response
   */
  _handleDocResponse(message) {
    if (message.docId && message.data) {
      this.documentCache.set(`${message.docId}-${message.format || 'pdf'}`, {
        data: message.data,
        timestamp: Date.now(),
      });
    }
    this._emit('document', message);
  }

  /**
   * Query Nova AI knowledge base
   */
  async query(queryText, options = {}) {
    return this._sendMessage({
      type: MESSAGE_TYPES.QUERY,
      bindingId: this.id,
      query: queryText,
      depth: options.depth || 'medium',
      context: options.context || [],
      timestamp: Date.now(),
    });
  }

  /**
   * Update active tab context
   */
  setActiveTab(tabInfo) {
    this.activeTab = tabInfo;
    this.pageContext = {
      url: tabInfo.url,
      title: tabInfo.title,
      timestamp: Date.now(),
    };
  }
}

// ─── DeploymentNovaBinding Class ──────────────────────────────────────────────

/**
 * Specialized binding for deployment workflows to Nova AI
 */
export class DeploymentNovaBinding extends NovaBinding {
  constructor(options = {}) {
    super({
      ...options,
      source: options.deploymentType || DEPLOYMENT_TARGETS.GITHUB_PAGES,
    });
    
    this.deploymentId = options.deploymentId || null;
    this.environment = options.environment || 'production';
    this.components = new Map();
    this.deploymentStatus = 'pending';
  }

  /**
   * Register component in deployment
   */
  registerComponent(componentId, config) {
    this.components.set(componentId, {
      id: componentId,
      config,
      status: 'registered',
      registeredAt: Date.now(),
    });
    
    this._emit('component_registered', { componentId, config });
  }

  /**
   * Update deployment status
   */
  async updateStatus(status, metadata = {}) {
    this.deploymentStatus = status;
    
    return this._sendMessage({
      type: MESSAGE_TYPES.DEPLOY_STATUS,
      bindingId: this.id,
      deploymentId: this.deploymentId,
      environment: this.environment,
      status,
      metadata,
      components: Array.from(this.components.entries()),
      timestamp: Date.now(),
    });
  }

  /**
   * Notify other bindings of deployment event
   */
  async notifyDeployment(event, data = {}) {
    return this._sendMessage({
      type: MESSAGE_TYPES.DEPLOY_NOTIFY,
      bindingId: this.id,
      deploymentId: this.deploymentId,
      event,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get deployment manifest
   */
  getManifest() {
    return {
      bindingId: this.id,
      deploymentId: this.deploymentId,
      environment: this.environment,
      status: this.deploymentStatus,
      components: Array.from(this.components.values()),
      stats: this.getStats(),
      timestamp: Date.now(),
    };
  }
}

// ─── WorkerNovaBinding Class ──────────────────────────────────────────────────

/**
 * Specialized binding for Cloudflare Workers to Nova AI
 */
export class WorkerNovaBinding extends NovaBinding {
  constructor(options = {}) {
    super({
      ...options,
      source: DEPLOYMENT_TARGETS.CLOUDFLARE,
      target: DEPLOYMENT_TARGETS.CLOUDFLARE,
    });
    
    this.workerId = options.workerId;
    this.tier = options.tier || 'III';
    this.protocols = options.protocols || [];
    this.kvNamespace = options.kvNamespace || null;
  }

  /**
   * Initialize with worker-specific protocols
   */
  async initialize(env) {
    if (env && env.KV) {
      this.kvNamespace = env.KV;
    }
    
    await this.connect();
    
    // Load binding state from KV if available
    if (this.kvNamespace) {
      try {
        const state = await this.kvNamespace.get(`binding:${this.id}`, 'json');
        if (state) {
          this.stats = { ...this.stats, ...state.stats };
        }
      } catch {
        // Ignore KV errors
      }
    }
    
    return this;
  }

  /**
   * Persist binding state to KV
   */
  async persistState() {
    if (!this.kvNamespace) return;
    
    try {
      await this.kvNamespace.put(`binding:${this.id}`, JSON.stringify({
        stats: this.stats,
        workerId: this.workerId,
        tier: this.tier,
        lastUpdate: Date.now(),
      }), {
        expirationTtl: 86400, // 24 hours
      });
    } catch {
      // Ignore KV errors
    }
  }

  /**
   * Handle incoming request from worker
   */
  async handleRequest(request) {
    const url = new URL(request.url);
    
    // Route to appropriate handler based on path
    if (url.pathname.startsWith('/api/nova/')) {
      const action = url.pathname.replace('/api/nova/', '');
      return this._handleNovaAction(action, request);
    }
    
    return null; // Not a Nova binding request
  }

  /**
   * Handle Nova API action
   */
  async _handleNovaAction(action, request) {
    switch (action) {
      case 'status':
        return new Response(JSON.stringify({
          success: true,
          binding: this.getStats(),
          workerId: this.workerId,
          tier: this.tier,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
        
      case 'heartbeat':
        this._heartbeat();
        return new Response(JSON.stringify({
          success: true,
          phase: this.phase,
          timestamp: this.lastHeartbeat,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
        
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Unknown action',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  }
}

// ─── Binding Manager ──────────────────────────────────────────────────────────

/**
 * Central manager for all Nova bindings
 */
export class NovaBindingManager {
  constructor() {
    this.bindings = new Map();
    this.globalListeners = new Map();
  }

  /**
   * Create a new binding
   */
  createBinding(type, options = {}) {
    let binding;
    
    switch (type) {
      case 'jarvis':
        binding = new JarvisNovaBinding(options);
        break;
      case 'deployment':
        binding = new DeploymentNovaBinding(options);
        break;
      case 'worker':
        binding = new WorkerNovaBinding(options);
        break;
      default:
        binding = new NovaBinding(options);
    }
    
    this.bindings.set(binding.id, binding);
    this._setupBindingListeners(binding);
    
    return binding;
  }

  /**
   * Setup listeners for cross-binding communication
   */
  _setupBindingListeners(binding) {
    binding.on('heartbeat', (data) => {
      this._broadcast('heartbeat', { bindingId: binding.id, ...data });
    });
    
    binding.on('deploy_notify', (data) => {
      this._broadcast('deploy_notify', { bindingId: binding.id, ...data });
    });
  }

  /**
   * Broadcast message to all bindings
   */
  _broadcast(event, data) {
    const listeners = this.globalListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
    
    // Forward to all other bindings
    for (const [id, binding] of this.bindings) {
      if (id !== data.bindingId) {
        binding._emit(event, data);
      }
    }
  }

  /**
   * Register global listener
   */
  onGlobal(event, callback) {
    if (!this.globalListeners.has(event)) {
      this.globalListeners.set(event, []);
    }
    this.globalListeners.get(event).push(callback);
  }

  /**
   * Get binding by ID
   */
  getBinding(id) {
    return this.bindings.get(id);
  }

  /**
   * Get all bindings
   */
  getAllBindings() {
    return Array.from(this.bindings.values());
  }

  /**
   * Get combined stats
   */
  getStats() {
    const stats = {
      totalBindings: this.bindings.size,
      connectedBindings: 0,
      totalMessages: 0,
      totalErrors: 0,
      bindings: [],
    };
    
    for (const binding of this.bindings.values()) {
      const bindingStats = binding.getStats();
      stats.bindings.push(bindingStats);
      if (bindingStats.connected) stats.connectedBindings++;
      stats.totalMessages += bindingStats.messagesSent + bindingStats.messagesReceived;
      stats.totalErrors += bindingStats.errors;
    }
    
    return stats;
  }
}

// ─── Singleton Manager Instance ───────────────────────────────────────────────
export const novaBindings = new NovaBindingManager();

// ─── Convenience Factory Functions ────────────────────────────────────────────

/**
 * Create Jarvis binding (for extension use)
 */
export function createJarvisBinding(options = {}) {
  return novaBindings.createBinding('jarvis', options);
}

/**
 * Create Deployment binding (for CI/CD use)
 */
export function createDeploymentBinding(options = {}) {
  return novaBindings.createBinding('deployment', options);
}

/**
 * Create Worker binding (for Cloudflare Workers use)
 */
export function createWorkerBinding(options = {}) {
  return novaBindings.createBinding('worker', options);
}

// ─── Default Export ───────────────────────────────────────────────────────────
export default {
  // Constants
  PHI,
  PHI_INV,
  HEARTBEAT,
  GOLDEN_ANGLE,
  EMERGENCE_THRESHOLD,
  NOVA_ENDPOINTS,
  DEPLOYMENT_TARGETS,
  MESSAGE_TYPES,
  
  // Classes
  NovaBinding,
  JarvisNovaBinding,
  DeploymentNovaBinding,
  WorkerNovaBinding,
  NovaBindingManager,
  
  // Singleton
  novaBindings,
  
  // Factory functions
  createJarvisBinding,
  createDeploymentBinding,
  createWorkerBinding,
};
