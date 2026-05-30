/* ============================================================
 *  Vigil AI — Background Service Worker v3.1
 *  AI sovereign assistant — native NeuroCore brain
 * ============================================================ */

var PHI = 1.618033988749895;
var GOLDEN_ANGLE = 137.508;
var HEARTBEAT = 873;

/* ----------------------------------------------------------
 *  NeuroCore — Medium Brain + Medium Heart (embedded from organism)
 *  MiniHeart + MiniBrain + MetaCardiacModel + MetaThoughtModel
 * ---------------------------------------------------------- */

var NEURO_PHI = 1.618033988749895;
var NEURO_DECAY = 0.95;
var NEURO_RESONANCE_WINDOW = 20;
var NEURO_EMERGENCE_THRESHOLD = 0.618;

function MiniHeart(name) {
  this.workerName = name;
  this.birthTime = Date.now();
  this.pulseCount = 0;
  this.latencyRing = [];
  this.latencyRingMax = 50;
  this.avgLatencyMs = 0;
  this.peakLatencyMs = 0;
  this.messageCount = 0;
  this.errorCount = 0;
  this.healthScore = 100;
  this.degraded = false;
  this._lastProcessStart = 0;
}
MiniHeart.prototype.startProcess = function () { this._lastProcessStart = Date.now(); };
MiniHeart.prototype.endProcess = function () {
  if (!this._lastProcessStart) return;
  var latency = Date.now() - this._lastProcessStart;
  this._lastProcessStart = 0;
  this.messageCount++;
  this.latencyRing.push(latency);
  if (this.latencyRing.length > this.latencyRingMax) this.latencyRing.shift();
  if (latency > this.peakLatencyMs) this.peakLatencyMs = latency;
  var sum = 0;
  for (var i = 0; i < this.latencyRing.length; i++) sum += this.latencyRing[i];
  this.avgLatencyMs = Math.round((sum / this.latencyRing.length) * 100) / 100;
};
MiniHeart.prototype.pulse = function () {
  this.pulseCount++;
  var latencyPenalty = Math.min(this.avgLatencyMs / 100, 30);
  var errorPenalty = Math.min(this.errorCount * 2, 30);
  var uptimeBonus = Math.min(this.pulseCount / 100, 10);
  this.healthScore = Math.round(Math.max(0, Math.min(100, 100 - latencyPenalty - errorPenalty + uptimeBonus)));
  this.degraded = this.healthScore < 60;
  return this.healthScore;
};
MiniHeart.prototype.getVitals = function () {
  return {
    health: this.healthScore, degraded: this.degraded, pulse: this.pulseCount,
    uptime: Date.now() - this.birthTime, avgLatencyMs: this.avgLatencyMs,
    peakLatencyMs: Math.round(this.peakLatencyMs * 100) / 100,
    messages: this.messageCount, errors: this.errorCount
  };
};

function MiniBrain(name) {
  this.workerName = name;
  this.pathways = Object.create(null);
  this.thoughts = [];
  this.maxThoughts = 100;
  this.totalStimuli = 0;
  this.totalDecisions = 0;
  this.learningRate = 0.1;
  this.awarenessLevel = 0;
}
MiniBrain.prototype.stimulus = function (type) {
  this.totalStimuli++;
  this.awarenessLevel = Math.min(100, Math.round(Math.log(this.totalStimuli + 1) / Math.log(NEURO_PHI) * 5));
  if (type === '__proto__' || type === 'constructor' || type === 'prototype') return null;
  if (!this.pathways[type]) this.pathways[type] = { stimulus: type, weight: 1.0, fires: 0, lastFired: 0, created: Date.now() };
  var pw = this.pathways[type];
  pw.fires++;
  pw.lastFired = Date.now();
  pw.weight = Math.min(10.0, pw.weight + this.learningRate);
  for (var k in this.pathways) {
    if (k !== type) this.pathways[k].weight = Math.max(0.1, this.pathways[k].weight * NEURO_DECAY);
  }
  if (this.awarenessLevel > 30 && pw.fires % Math.ceil(NEURO_PHI * 10) === 0) {
    this.totalDecisions++;
    var thought = { id: 'T-' + name + '-' + this.totalDecisions, stimulus: type, strength: pw.weight, awareness: this.awarenessLevel, timestamp: Date.now() };
    this.thoughts.push(thought);
    if (this.thoughts.length > this.maxThoughts) this.thoughts.shift();
  }
  return pw;
};
MiniBrain.prototype.getStrongestPathway = function () {
  var best = null, bestW = 0;
  for (var k in this.pathways) { if (this.pathways[k].weight > bestW) { bestW = this.pathways[k].weight; best = this.pathways[k]; } }
  return best;
};
MiniBrain.prototype.getState = function () {
  var c = 0, tw = 0;
  for (var k in this.pathways) { c++; tw += this.pathways[k].weight; }
  var s = this.getStrongestPathway();
  return { awareness: this.awarenessLevel, pathways: c, avgWeight: c > 0 ? Math.round(tw / c * 100) / 100 : 0,
    totalStimuli: this.totalStimuli, totalDecisions: this.totalDecisions,
    recentThoughts: this.thoughts.slice(-5), strongestPathway: s ? s.stimulus : null };
};

function MetaCardiacModel() {
  this.sinusRate = 1.0; this.vagalTone = 0.5; this.sympatheticDrive = 0.5;
  this.autonomicBalance = 0; this.cardiacOutput = 1.0; this.beatsAnalyzed = 0;
  this.hrvBuffer = []; this.arrhythmiaCount = 0;
}
MetaCardiacModel.prototype.beat = function (latencyMs, healthScore) {
  this.beatsAnalyzed++;
  var interval = latencyMs > 0 ? latencyMs : 1;
  this.hrvBuffer.push(interval);
  if (this.hrvBuffer.length > 30) this.hrvBuffer.shift();
  if (latencyMs > 50) {
    this.sympatheticDrive = Math.min(1.0, this.sympatheticDrive + 0.05);
    this.vagalTone = Math.max(0.1, this.vagalTone - 0.03);
  } else if (healthScore > 80) {
    this.vagalTone = Math.min(0.9, this.vagalTone + 0.02);
    this.sympatheticDrive = Math.max(0.1, this.sympatheticDrive - 0.02);
  }
  this.autonomicBalance = Math.round((this.sympatheticDrive - this.vagalTone) * 1000) / 1000;
  this.sinusRate = 0.5 + this.sympatheticDrive * 0.5;
  this.cardiacOutput = Math.round(this.sinusRate * (healthScore / 100) * 1000) / 1000;
  return this.cardiacOutput;
};
MetaCardiacModel.prototype.getMood = function () {
  var bal = this.autonomicBalance;
  if (bal > 0.3) return 'energized';
  if (bal < -0.3) return 'reflective';
  if (this.vagalTone > 0.7) return 'calm';
  return 'focused';
};
MetaCardiacModel.prototype.getState = function () {
  return { sinusRate: this.sinusRate, vagalTone: Math.round(this.vagalTone * 1000) / 1000,
    sympatheticDrive: Math.round(this.sympatheticDrive * 1000) / 1000,
    autonomicBalance: this.autonomicBalance, cardiacOutput: this.cardiacOutput,
    mood: this.getMood(), arrhythmias: this.arrhythmiaCount };
};

function MetaThoughtModel(name) {
  this.workerName = name; this.attentionMap = Object.create(null);
  this.temperature = 0.7; this.metaThoughts = []; this.maxMetaThoughts = 50;
  this.chainOfThought = []; this.maxChainLength = 20;
  this.totalInferences = 0; this.focusTarget = null; this.cognitiveLoad = 0;
}
MetaThoughtModel.prototype.attend = function (stimulus, weight) {
  if (stimulus === '__proto__' || stimulus === 'constructor' || stimulus === 'prototype') return;
  this.totalInferences++;
  this.attentionMap[stimulus] = (this.attentionMap[stimulus] || 0) + weight;
  var keys = Object.keys(this.attentionMap);
  var maxVal = -Infinity;
  for (var i = 0; i < keys.length; i++) if (this.attentionMap[keys[i]] > maxVal) maxVal = this.attentionMap[keys[i]];
  var expSum = 0;
  for (var j = 0; j < keys.length; j++) expSum += Math.exp((this.attentionMap[keys[j]] - maxVal) / Math.max(this.temperature, 0.01));
  var bestKey = null, bestScore = 0;
  for (var k = 0; k < keys.length; k++) {
    var score = Math.exp((this.attentionMap[keys[k]] - maxVal) / Math.max(this.temperature, 0.01)) / expSum;
    if (score > bestScore) { bestScore = score; bestKey = keys[k]; }
  }
  this.focusTarget = bestKey;
  this.cognitiveLoad = Math.min(1, keys.length / 20);
  this.chainOfThought.push({ stimulus: stimulus, weight: weight, time: Date.now() });
  if (this.chainOfThought.length > this.maxChainLength) this.chainOfThought.shift();
  if (bestScore > 0.5) this.temperature = Math.max(0.1, this.temperature - 0.01);
  else this.temperature = Math.min(1.0, this.temperature + 0.01);
};
MetaThoughtModel.prototype.getState = function () {
  return { focus: this.focusTarget, temperature: Math.round(this.temperature * 1000) / 1000,
    cognitiveLoad: Math.round(this.cognitiveLoad * 1000) / 1000,
    totalInferences: this.totalInferences, attentionTargets: Object.keys(this.attentionMap).length,
    chainDepth: this.chainOfThought.length };
};

function NeuroCore(name) {
  this.workerName = name;
  this.heart = new MiniHeart(name);
  this.brain = new MiniBrain(name);
  this.cardiac = new MetaCardiacModel();
  this.thought = new MetaThoughtModel(name);
}
NeuroCore.prototype.onMessage = function (type) {
  this.heart.startProcess();
  var pw = this.brain.stimulus(type);
  if (pw) this.thought.attend(type, pw.weight);
};
NeuroCore.prototype.onMessageDone = function () { this.heart.endProcess(); };
NeuroCore.prototype.pulse = function () {
  var h = this.heart.pulse();
  this.cardiac.beat(this.heart.avgLatencyMs, h);
  return this.getVitals();
};
NeuroCore.prototype.getVitals = function () {
  return { heart: this.heart.getVitals(), brain: this.brain.getState(),
    cardiac: this.cardiac.getState(), thought: this.thought.getState() };
};
NeuroCore.prototype.getMood = function () { return this.cardiac.getMood(); };
NeuroCore.prototype.getFocus = function () { return this.thought.focusTarget || 'awareness'; };

/* ----------------------------------------------------------
 *  Protocol Registry — 10 Alpha Script AIs
 * ---------------------------------------------------------- */

var ProtocolRegistry = {
  agents: [
    { id: 'protocollum',   name: 'PROTOCOLLUM',   domain: 'Protocol governance and rule enforcement' },
    { id: 'terminalis',    name: 'TERMINALIS',    domain: 'Terminal operations and CLI orchestration' },
    { id: 'organismus',    name: 'ORGANISMUS',    domain: 'Organism lifecycle and biological modelling' },
    { id: 'mercator',      name: 'MERCATOR',      domain: 'Marketplace transactions and trade routing' },
    { id: 'orchestrator',  name: 'ORCHESTRATOR',  domain: 'Multi-agent coordination and task scheduling' },
    { id: 'mathematicus',  name: 'MATHEMATICUS',  domain: 'Mathematical computation and proof verification' },
    { id: 'synapticus',    name: 'SYNAPTICUS',    domain: 'Neural pathway simulation and learning models' },
    { id: 'substratum',    name: 'SUBSTRATUM',    domain: 'Infrastructure layer and substrate management' },
    { id: 'universum',     name: 'UNIVERSUM',     domain: 'Universal knowledge graph and ontology mapping' },
    { id: 'canistrum',     name: 'CANISTRUM',     domain: 'Canister deployment and Web3 smart contracts' }
  ],
  getAgent: function (id) {
    for (var i = 0; i < this.agents.length; i++) {
      if (this.agents[i].id === id) return this.agents[i];
    }
    return null;
  },
  listAgents: function () {
    return this.agents.map(function (a) { return { id: a.id, name: a.name, domain: a.domain }; });
  },
  routeToAgent: function (intent) {
    var mapping = {
      'search':           'universum',
      'navigate':         'terminalis',
      'create-document':  'protocollum',
      'create-pdf':       'protocollum',
      'summarize':        'synapticus',
      'read-page':        'synapticus',
      'chat':             'orchestrator',
      'tab-switch':       'terminalis',
      'tab-open':         'terminalis',
      'tab-close':        'terminalis',
      'list-tabs':        'terminalis',
      'open-url':         'terminalis',
      'take-note':        'organismus',
      'list-notes':       'organismus',
      'delete-note':      'organismus',
      'screenshot':       'substratum',
      'find-text':        'universum',
      'highlight':        'universum'
    };
    var agentId = mapping[intent] || 'orchestrator';
    return this.getAgent(agentId);
  }
};

/* ----------------------------------------------------------
 *  JarvisEngine — main engine class
 * ---------------------------------------------------------- */

function JarvisEngine() {
  this.startTime = Date.now();
  this.commandCount = 0;
  this.commandHistory = [];
  this.maxHistory = 200;
  this.state = {
    initialized: true,
    heartbeatCount: 0,
    version: '3.1.0',
    agent: 'Vigil AI'
  };

  // ── Medium Brain + Medium Heart ──────────────────────────
  this.neuro = new NeuroCore('jarvis');

  // ── PhantomAI Conversation Memory (100-turn rolling — Memory Temple) ──
  this.conversationMemory = [];
  this.maxMemory = 100;

  // ── Memory Temple — categorized long-term storage ────────────────────
  this.memoryTemple = {
    research: [],      // Research notes, findings, sources
    theory: [],        // Theory discussions, ideas, hypotheses
    decisions: [],     // Key decisions and rationale
    frameworks: [],    // Frameworks, blueprints discussed
    insights: []       // Extracted insights and patterns
  };
  this.maxTempleEntries = 200; // per category

  // ── Topic gravity — tracks what user talks about most ───
  this.topicGravity = Object.create(null);

  // ── Phantom workflow state ───────────────────────────────
  this.workflowState = { active: false, steps: [], stepIndex: 0, name: '' };

  this._startHeartbeat();
  console.log('[JARVIS v3.1] Engine initialized — NeuroCore online, Memory Temple active, PHI=' + PHI + ' HEARTBEAT=' + HEARTBEAT + 'ms');
}

/* ----------------------------------------------------------
 *  Heartbeat
 * ---------------------------------------------------------- */

JarvisEngine.prototype._startHeartbeat = function () {
  var self = this;
  setInterval(function () {
    self.state.heartbeatCount++;
    var vitals = self.neuro.pulse();
    // Store latest vitals for sidepanel to read
    self.state.vitals = vitals;
    self.state.mood = self.neuro.getMood();
    self.state.focus = self.neuro.getFocus();
  }, HEARTBEAT);
};

/* ----------------------------------------------------------
 *  Command History
 * ---------------------------------------------------------- */

JarvisEngine.prototype._recordCommand = function (raw, parsed) {
  this.commandCount++;
  var entry = {
    id: this.commandCount,
    raw: raw,
    intent: parsed.intent,
    confidence: parsed.confidence,
    timestamp: Date.now(),
    agent: ProtocolRegistry.routeToAgent(parsed.intent)
  };
  this.commandHistory.unshift(entry);
  if (this.commandHistory.length > this.maxHistory) {
    this.commandHistory.pop();
  }
  return entry;
};

JarvisEngine.prototype.getHistory = function () {
  return this.commandHistory.slice(0);
};

JarvisEngine.prototype.getStatus = function () {
  var uptime = Date.now() - this.startTime;
  return {
    heartbeatCount: this.state.heartbeatCount,
    commandCount: this.commandCount,
    uptime: uptime,
    uptimeFormatted: this._formatUptime(uptime),
    version: this.state.version,
    agentCount: ProtocolRegistry.agents.length,
    mood: this.state.mood || 'focused',
    focus: this.state.focus || 'awareness',
    neuro: this.state.vitals || null,
    awarenessLevel: this.neuro.brain.awarenessLevel,
    memoryTempleStats: this._getTempleStats(),
    memoryTurns: this.conversationMemory.length
  };
};

JarvisEngine.prototype._formatUptime = function (ms) {
  var s = Math.floor(ms / 1000);
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var sec = s % 60;
  return (h > 0 ? h + 'h ' : '') + m + 'm ' + sec + 's';
};

/* ----------------------------------------------------------
 *  PhantomAI Conversation Memory
 * ---------------------------------------------------------- */

JarvisEngine.prototype._remember = function (role, text, intent) {
  this.conversationMemory.push({ role: role, text: text, intent: intent || 'chat', timestamp: Date.now() });
  if (this.conversationMemory.length > this.maxMemory) this.conversationMemory.shift();

  // Update topic gravity (Hebbian: repeated topics get heavier weight)
  var tokens = (text || '').toLowerCase().split(/\s+/);
  var stop = { the:1, a:1, an:1, is:1, i:1, you:1, me:1, my:1, it:1, to:1, in:1, of:1, and:1, or:1, do:1, what:1, how:1, can:1 };
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i].replace(/[^a-z0-9]/g, '');
    if (t.length > 3 && !stop[t]) {
      this.topicGravity[t] = (this.topicGravity[t] || 0) + 1;
    }
  }

  // Archive user messages with 5+ words to Memory Temple
  if (role === 'user' && tokens.length >= 5) {
    this._archiveToTemple(text, intent || 'chat', this.state.mood || 'focused');
  }
};

JarvisEngine.prototype._getRecentTopics = function (n) {
  n = n || 5;
  var topics = Object.keys(this.topicGravity).sort(function (a, b) {
    return this.topicGravity[b] - this.topicGravity[a];
  }.bind(this)).slice(0, n);
  return topics;
};

JarvisEngine.prototype._getLastUserMessage = function () {
  for (var i = this.conversationMemory.length - 1; i >= 0; i--) {
    if (this.conversationMemory[i].role === 'user') return this.conversationMemory[i];
  }
  return null;
};

JarvisEngine.prototype._getContextSummary = function () {
  var topics = this._getRecentTopics(3);
  var turns = this.conversationMemory.length;
  var last = this._getLastUserMessage();
  return {
    turnCount: turns,
    topics: topics,
    lastIntent: last ? last.intent : null,
    lastText: last ? last.text.substring(0, 80) : null
  };
};

/* ----------------------------------------------------------
 *  Memory Temple — categorized long-term storage
 * ---------------------------------------------------------- */

JarvisEngine.prototype._archiveToTemple = function (text, intent, mood) {
  var lc = (text || '').toLowerCase();
  var entry = { text: text.substring(0, 300), intent: intent, mood: mood, timestamp: Date.now() };

  // Auto-categorize by intent + content signals
  var isResearch = /research|paper|study|data|evidence|source|reference|analysis|literature/i.test(lc);
  var isTheory = /theory|hypothesis|model|framework|principle|concept|idea|think|believe|pattern/i.test(lc);
  var isDecision = /decide|decision|build|create|implement|choose|going to|plan to|will/i.test(lc);
  var isFramework = /framework|blueprint|structure|template|workflow|process|system|architecture/i.test(lc);

  if (isResearch) this._addToTempleCategory('research', entry);
  else if (isFramework) this._addToTempleCategory('frameworks', entry);
  else if (isTheory) this._addToTempleCategory('theory', entry);
  else if (isDecision) this._addToTempleCategory('decisions', entry);
  else this._addToTempleCategory('insights', entry);
};

JarvisEngine.prototype._addToTempleCategory = function (cat, entry) {
  if (!this.memoryTemple[cat]) return;
  this.memoryTemple[cat].unshift(entry);
  if (this.memoryTemple[cat].length > this.maxTempleEntries) {
    this.memoryTemple[cat].pop();
  }
};

JarvisEngine.prototype._getTempleContext = function (cat) {
  var arr = this.memoryTemple[cat] || [];
  return arr.slice(0, 5); // last 5 entries per category
};

JarvisEngine.prototype._getTempleStats = function () {
  var stats = {};
  var total = 0;
  for (var k in this.memoryTemple) {
    stats[k] = this.memoryTemple[k].length;
    total += this.memoryTemple[k].length;
  }
  return { stats: stats, total: total };
};

JarvisEngine.prototype.parseCommand = function (natural) {
  var text = (natural || '').toLowerCase().trim();
  var tokens = text.split(/\s+/);
  var intent = 'chat';
  var confidence = 0.3;
  var matchedKeywords = [];
  var params = {};

  // Intent detection with keyword matching
  var intentMap = [
    { intent: 'tab-switch',       keywords: ['switch tab', 'go to tab', 'activate tab', 'change tab', 'focus tab'] },
    { intent: 'tab-open',         keywords: ['new tab', 'open tab', 'create tab', 'add tab'] },
    { intent: 'tab-close',        keywords: ['close tab', 'kill tab', 'remove tab', 'shut tab'] },
    { intent: 'open-url',         keywords: ['open url', 'go to', 'navigate to', 'visit', 'browse to', 'open site', 'open page'] },
    { intent: 'create-pdf',       keywords: ['create pdf', 'generate pdf', 'make pdf', 'export pdf', 'save pdf', 'pdf'] },
    { intent: 'take-note',        keywords: ['take note', 'save note', 'add note', 'write note', 'remember', 'note this', 'jot down'] },
    { intent: 'list-notes',       keywords: ['list notes', 'show notes', 'my notes', 'all notes', 'view notes', 'get notes'] },
    { intent: 'delete-note',      keywords: ['delete note', 'remove note', 'erase note', 'clear note'] },
    { intent: 'screenshot',       keywords: ['screenshot', 'screen capture', 'capture screen', 'snap', 'take screenshot', 'grab screen'] },
    { intent: 'read-page',        keywords: ['read page', 'read this', 'get content', 'page content', 'extract text', 'get text'] },
    { intent: 'summarize',        keywords: ['summarize', 'summary', 'tldr', 'brief', 'overview', 'digest'] },
    { intent: 'navigate',         keywords: ['navigate', 'go back', 'go forward', 'reload', 'refresh'] },
    { intent: 'search',           keywords: ['search', 'look up', 'find online', 'google', 'query', 'search for'] },
    { intent: 'create-document',  keywords: ['create document', 'new document', 'make document', 'write document', 'draft'] },
    { intent: 'list-tabs',        keywords: ['list tabs', 'show tabs', 'all tabs', 'open tabs', 'tab list', 'which tabs'] },
    { intent: 'find-text',        keywords: ['find text', 'find on page', 'search page', 'ctrl f', 'locate text', 'find'] },
    { intent: 'highlight',        keywords: ['highlight', 'mark', 'emphasize', 'underline'] },
    { intent: 'chat',             keywords: ['chat', 'talk', 'tell me', 'hey jarvis', 'jarvis', 'hello', 'help'] }
  ];

  for (var i = 0; i < intentMap.length; i++) {
    var mapping = intentMap[i];
    for (var k = 0; k < mapping.keywords.length; k++) {
      var kw = mapping.keywords[k];
      if (text.indexOf(kw) !== -1) {
        intent = mapping.intent;
        confidence = 0.7 + (kw.length / text.length) * 0.3;
        matchedKeywords.push(kw);
        break;
      }
    }
    if (matchedKeywords.length > 0) break;
  }

  // Extract URL parameter
  var urlMatch = text.match(/(?:https?:\/\/[^\s]+|www\.[^\s]+)/);
  if (urlMatch) {
    params.url = urlMatch[0];
    if (intent === 'chat') {
      intent = 'open-url';
      confidence = 0.8;
    }
  }

  // Extract tab number
  var tabMatch = text.match(/tab\s*(?:#?\s*)?(\d+)/);
  if (tabMatch) {
    params.tabIndex = parseInt(tabMatch[1], 10);
  }

  // Extract note content (everything after the keyword trigger)
  if (intent === 'take-note') {
    var noteContent = text;
    var noteKeywords = ['take note', 'save note', 'add note', 'write note', 'remember', 'note this', 'jot down'];
    for (var n = 0; n < noteKeywords.length; n++) {
      var idx = noteContent.indexOf(noteKeywords[n]);
      if (idx !== -1) {
        noteContent = noteContent.substring(idx + noteKeywords[n].length).trim();
        break;
      }
    }
    // Remove leading colon/dash
    noteContent = noteContent.replace(/^[:–\-]\s*/, '');
    params.noteContent = noteContent || natural;
  }

  // Extract note id for deletion
  if (intent === 'delete-note') {
    var noteIdMatch = text.match(/(?:note\s*#?\s*|id\s*:?\s*)(\d+)/);
    if (noteIdMatch) {
      params.noteId = parseInt(noteIdMatch[1], 10);
    }
  }

  // Extract search query
  if (intent === 'search') {
    var searchContent = text;
    var searchKeywords = ['search for', 'search', 'look up', 'find online', 'google', 'query'];
    for (var s = 0; s < searchKeywords.length; s++) {
      var sIdx = searchContent.indexOf(searchKeywords[s]);
      if (sIdx !== -1) {
        searchContent = searchContent.substring(sIdx + searchKeywords[s].length).trim();
        break;
      }
    }
    params.searchQuery = searchContent;
  }

  // Extract find text query
  if (intent === 'find-text' || intent === 'highlight') {
    var findContent = text;
    var findKws = ['find text', 'find on page', 'search page', 'locate text', 'find', 'highlight', 'mark'];
    for (var f = 0; f < findKws.length; f++) {
      var fIdx = findContent.indexOf(findKws[f]);
      if (fIdx !== -1) {
        findContent = findContent.substring(fIdx + findKws[f].length).trim();
        break;
      }
    }
    params.query = findContent;
  }

  // Extract document title
  if (intent === 'create-document' || intent === 'create-pdf') {
    var docContent = text;
    var docKws = ['create document', 'new document', 'make document', 'write document', 'draft',
                  'create pdf', 'generate pdf', 'make pdf', 'export pdf'];
    for (var d = 0; d < docKws.length; d++) {
      var dIdx = docContent.indexOf(docKws[d]);
      if (dIdx !== -1) {
        docContent = docContent.substring(dIdx + docKws[d].length).trim();
        break;
      }
    }
    docContent = docContent.replace(/^[:–\-]\s*/, '');
    params.documentTitle = docContent || 'Untitled Document';
    params.documentContent = natural;
  }

  // Boost confidence with PHI ratio for multi-keyword matches
  if (matchedKeywords.length > 1) {
    confidence = Math.min(confidence * PHI, 1.0);
  }

  var parsed = {
    raw: natural,
    intent: intent,
    confidence: Math.round(confidence * 100) / 100,
    matchedKeywords: matchedKeywords,
    params: params,
    tokens: tokens,
    timestamp: Date.now()
  };

  this._recordCommand(natural, parsed);
  return parsed;
};

/* ----------------------------------------------------------
 *  Action Builder — converts parsed command to executable
 * ---------------------------------------------------------- */

JarvisEngine.prototype.buildAction = function (parsed) {
  var agent = ProtocolRegistry.routeToAgent(parsed.intent);
  var action = {
    type: parsed.intent,
    agent: agent ? agent.name : 'ORCHESTRATOR',
    payload: {},
    timestamp: Date.now()
  };

  switch (parsed.intent) {
    case 'tab-switch':
      action.payload.tabIndex = parsed.params.tabIndex || 1;
      break;
    case 'tab-open':
      action.payload.url = parsed.params.url || 'chrome://newtab';
      break;
    case 'tab-close':
      action.payload.tabIndex = parsed.params.tabIndex || null;
      break;
    case 'open-url':
      action.payload.url = parsed.params.url || '';
      break;
    case 'create-pdf':
      action.payload.title = parsed.params.documentTitle || 'Vigil AI Document';
      action.payload.content = parsed.params.documentContent || '';
      break;
    case 'take-note':
      action.payload.content = parsed.params.noteContent || parsed.raw;
      action.payload.author = 'Alfredo';
      break;
    case 'list-notes':
      break;
    case 'delete-note':
      action.payload.noteId = parsed.params.noteId || null;
      break;
    case 'screenshot':
      break;
    case 'read-page':
      break;
    case 'summarize':
      break;
    case 'navigate':
      action.payload.direction = 'reload';
      if (parsed.raw.indexOf('back') !== -1) action.payload.direction = 'back';
      if (parsed.raw.indexOf('forward') !== -1) action.payload.direction = 'forward';
      break;
    case 'search':
      action.payload.query = parsed.params.searchQuery || '';
      break;
    case 'create-document':
      action.payload.title = parsed.params.documentTitle || 'Vigil AI Document';
      action.payload.content = parsed.params.documentContent || '';
      break;
    case 'list-tabs':
      break;
    case 'find-text':
      action.payload.query = parsed.params.query || '';
      break;
    case 'highlight':
      action.payload.query = parsed.params.query || '';
      break;
    case 'chat':
      action.payload.message = parsed.raw;
      break;
    default:
      action.payload.message = parsed.raw;
  }

  return action;
};

/* ----------------------------------------------------------
 *  Command Executors
 * ---------------------------------------------------------- */

// Tab operations
JarvisEngine.prototype.executeTabSwitch = function (tabIndex, callback) {
  chrome.tabs.query({}, function (tabs) {
    if (tabIndex < 1 || tabIndex > tabs.length) {
      callback({ success: false, message: 'Tab ' + tabIndex + ' out of range. ' + tabs.length + ' tabs open (1-' + tabs.length + ').' });
      return;
    }
    var idx = tabIndex - 1;
    if (tabs[idx]) {
      chrome.tabs.update(tabs[idx].id, { active: true }, function () {
        callback({ success: true, message: 'Switched to tab ' + tabIndex + ': ' + tabs[idx].title });
      });
    } else {
      callback({ success: false, message: 'Tab ' + tabIndex + ' not found. ' + tabs.length + ' tabs open.' });
    }
  });
};

JarvisEngine.prototype.executeTabOpen = function (url, callback) {
  chrome.tabs.create({ url: url || 'chrome://newtab' }, function (tab) {
    callback({ success: true, message: 'Opened new tab: ' + (url || 'New Tab'), tabId: tab.id });
  });
};

JarvisEngine.prototype.executeTabClose = function (tabIndex, callback) {
  if (tabIndex) {
    chrome.tabs.query({}, function (tabs) {
      var idx = Math.max(0, Math.min(tabIndex - 1, tabs.length - 1));
      if (tabs[idx]) {
        var title = tabs[idx].title;
        chrome.tabs.remove(tabs[idx].id, function () {
          callback({ success: true, message: 'Closed tab ' + tabIndex + ': ' + title });
        });
      } else {
        callback({ success: false, message: 'Tab ' + tabIndex + ' not found.' });
      }
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        var title = tabs[0].title;
        chrome.tabs.remove(tabs[0].id, function () {
          callback({ success: true, message: 'Closed current tab: ' + title });
        });
      }
    });
  }
};

JarvisEngine.prototype.executeListTabs = function (callback) {
  chrome.tabs.query({}, function (tabs) {
    var tabList = tabs.map(function (t, i) {
      return {
        index: i + 1,
        id: t.id,
        title: t.title || 'Untitled',
        url: t.url || '',
        active: t.active,
        favIconUrl: t.favIconUrl || ''
      };
    });
    callback({ success: true, tabs: tabList, message: tabList.length + ' tabs open' });
  });
};

JarvisEngine.prototype.executeOpenUrl = function (url, callback) {
  if (!url) {
    callback({ success: false, message: 'No URL provided' });
    return;
  }
  if (url.indexOf('://') === -1) {
    url = 'https://' + url;
  }
  chrome.tabs.create({ url: url }, function (tab) {
    callback({ success: true, message: 'Opened: ' + url, tabId: tab.id });
  });
};

// Note operations
JarvisEngine.prototype.executeTakeNote = function (content, callback) {
  var self = this;
  chrome.storage.local.get({ 'jarvis_notes': [] }, function (data) {
    var notes = data.jarvis_notes || [];
    var note = {
      id: Date.now(),
      content: content,
      author: 'Alfredo',
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    notes.unshift(note);
    chrome.storage.local.set({ 'jarvis_notes': notes }, function () {
      callback({ success: true, message: 'Note saved by Alfredo: "' + content.substring(0, 50) + (content.length > 50 ? '…' : '') + '"', note: note });
    });
  });
};

JarvisEngine.prototype.executeListNotes = function (callback) {
  chrome.storage.local.get({ 'jarvis_notes': [] }, function (data) {
    var notes = data.jarvis_notes || [];
    callback({ success: true, notes: notes, message: notes.length + ' notes stored' });
  });
};

JarvisEngine.prototype.executeDeleteNote = function (noteId, callback) {
  chrome.storage.local.get({ 'jarvis_notes': [] }, function (data) {
    var notes = data.jarvis_notes || [];
    var idx = -1;
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === noteId) { idx = i; break; }
    }
    if (idx !== -1) {
      var removed = notes.splice(idx, 1)[0];
      chrome.storage.local.set({ 'jarvis_notes': notes }, function () {
        callback({ success: true, message: 'Note deleted: "' + removed.content.substring(0, 40) + '"' });
      });
    } else if (noteId === null && notes.length > 0) {
      var last = notes.shift();
      chrome.storage.local.set({ 'jarvis_notes': notes }, function () {
        callback({ success: true, message: 'Deleted most recent note: "' + last.content.substring(0, 40) + '"' });
      });
    } else {
      callback({ success: false, message: 'Note not found' });
    }
  });
};

// Screenshot
JarvisEngine.prototype.executeScreenshot = function (callback) {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
    if (chrome.runtime.lastError) {
      callback({ success: false, message: 'Screenshot failed: ' + chrome.runtime.lastError.message });
      return;
    }
    var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    var filename = 'jarvis-screenshot-' + timestamp + '.png';
    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: false
    }, function (downloadId) {
      callback({ success: true, message: 'Screenshot saved: ' + filename, downloadId: downloadId, dataUrl: dataUrl });
    });
  });
};

// Page reading — inject script to get page content
JarvisEngine.prototype.executeReadPage = function (tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function () {
      var headings = [];
      var hTags = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (var i = 0; i < Math.min(hTags.length, 20); i++) {
        headings.push({ tag: hTags[i].tagName, text: hTags[i].innerText.substring(0, 100) });
      }
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.substring(0, 5000),
        headings: headings,
        wordCount: document.body.innerText.split(/\s+/).length,
        linkCount: document.querySelectorAll('a').length,
        imageCount: document.querySelectorAll('img').length,
        metaDescription: (document.querySelector('meta[name="description"]') || {}).content || ''
      };
    }
  }, function (results) {
    if (chrome.runtime.lastError) {
      callback({ success: false, message: 'Could not read page: ' + chrome.runtime.lastError.message });
      return;
    }
    var pageData = results && results[0] && results[0].result;
    if (pageData) {
      callback({ success: true, pageData: pageData, message: 'Page read: ' + pageData.title + ' (' + pageData.wordCount + ' words)' });
    } else {
      callback({ success: false, message: 'No page data returned' });
    }
  });
};

// Summarize (uses page reading + local summary generation)
JarvisEngine.prototype.executeSummarize = function (tabId, callback) {
  this.executeReadPage(tabId, function (result) {
    if (!result.success) {
      callback(result);
      return;
    }
    var pd = result.pageData;
    var sentences = pd.text.split(/[.!?]+/).filter(function (s) { return s.trim().length > 20; });
    var topSentences = sentences.slice(0, 5).map(function (s) { return s.trim() + '.'; });
    var summary = {
      title: pd.title,
      url: pd.url,
      wordCount: pd.wordCount,
      headingCount: pd.headings.length,
      linkCount: pd.linkCount,
      imageCount: pd.imageCount,
      keyPoints: topSentences,
      metaDescription: pd.metaDescription
    };
    callback({
      success: true,
      summary: summary,
      message: 'Summary of "' + pd.title + '": ' + pd.wordCount + ' words, ' + pd.headings.length + ' headings, ' + topSentences.length + ' key points'
    });
  });
};

// Navigate (back, forward, reload)
JarvisEngine.prototype.executeNavigate = function (direction, tabId, callback) {
  switch (direction) {
    case 'back':
      chrome.scripting.executeScript({ target: { tabId: tabId }, func: function () { history.back(); } }, function () {
        callback({ success: true, message: 'Navigated back' });
      });
      break;
    case 'forward':
      chrome.scripting.executeScript({ target: { tabId: tabId }, func: function () { history.forward(); } }, function () {
        callback({ success: true, message: 'Navigated forward' });
      });
      break;
    default:
      chrome.tabs.reload(tabId, function () {
        callback({ success: true, message: 'Page reloaded' });
      });
  }
};

// Search — sandbox mode signals sidepanel to switch to Search tab with native JARVIS intelligence
JarvisEngine.prototype.executeSearch = function (query, callback, sandboxMode) {
  if (!query) {
    callback({ success: false, message: 'No search query provided' });
    return;
  }
  if (sandboxMode) {
    // Return signal for sidepanel to switch to Search tab and run sandbox search
    callback({ success: true, message: 'Opening sandbox search for: "' + query + '"', sandboxQuery: query });
    return;
  }
  var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
  chrome.tabs.create({ url: searchUrl }, function (tab) {
    callback({ success: true, message: 'Searching: "' + query + '"', tabId: tab.id });
  });
};

// Create document stub
JarvisEngine.prototype.executeCreateDocument = function (title, content, callback) {
  var self = this;
  var doc = {
    id: Date.now(),
    title: title,
    content: content,
    author: 'Alfredo',
    type: 'document',
    timestamp: Date.now(),
    date: new Date().toISOString()
  };
  chrome.storage.local.get({ 'jarvis_documents': [] }, function (data) {
    var docs = data.jarvis_documents || [];
    docs.unshift(doc);
    chrome.storage.local.set({ 'jarvis_documents': docs }, function () {
      callback({ success: true, message: 'Document created: "' + title + '"', document: doc });
    });
  });
};

// Create PDF — generates data and sends to content script for rendering
JarvisEngine.prototype.executeCreatePdf = function (title, content, tabId, callback) {
  var pdfData = {
    title: title || 'Vigil AI Document',
    content: content || '',
    author: 'Alfredo',
    timestamp: Date.now(),
    date: new Date().toISOString()
  };

  chrome.storage.local.get({ 'jarvis_documents': [] }, function (data) {
    var docs = data.jarvis_documents || [];
    var doc = {
      id: Date.now(),
      title: pdfData.title,
      content: pdfData.content,
      author: pdfData.author,
      type: 'pdf',
      timestamp: pdfData.timestamp,
      date: pdfData.date
    };
    docs.unshift(doc);
    chrome.storage.local.set({ 'jarvis_documents': docs }, function () {
      // Notify content script to render the PDF overlay
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          action: 'renderPdf',
          data: pdfData
        });
      }
      callback({ success: true, message: 'PDF generated: "' + pdfData.title + '"', document: doc });
    });
  });
};

// Find text — injects script into active tab
JarvisEngine.prototype.executeFindText = function (query, tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function (q) {
      return window.find(q);
    },
    args: [query]
  }, function (results) {
    if (chrome.runtime.lastError) {
      callback({ success: false, message: 'Find failed: ' + chrome.runtime.lastError.message });
      return;
    }
    var found = results && results[0] && results[0].result;
    callback({ success: true, found: found, message: found ? 'Found: "' + query + '"' : 'Not found: "' + query + '"' });
  });
};

// Highlight text on page
JarvisEngine.prototype.executeHighlight = function (query, tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function (q) {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      var count = 0;
      var node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.toLowerCase().indexOf(q.toLowerCase()) !== -1) {
          var span = document.createElement('mark');
          span.style.backgroundColor = '#6c63ff';
          span.style.color = '#ffffff';
          span.style.padding = '1px 3px';
          span.style.borderRadius = '2px';
          var parent = node.parentNode;
          var parts = node.nodeValue.split(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'));
          for (var i = 0; i < parts.length; i++) {
            if (parts[i].toLowerCase() === q.toLowerCase()) {
              var mark = span.cloneNode(false);
              mark.textContent = parts[i];
              parent.insertBefore(mark, node);
              count++;
            } else {
              parent.insertBefore(document.createTextNode(parts[i]), node);
            }
          }
          parent.removeChild(node);
        }
      }
      return count;
    },
    args: [query]
  }, function (results) {
    if (chrome.runtime.lastError) {
      callback({ success: false, message: 'Highlight failed: ' + chrome.runtime.lastError.message });
      return;
    }
    var count = results && results[0] && results[0].result;
    callback({ success: true, count: count || 0, message: 'Highlighted ' + (count || 0) + ' occurrences of "' + query + '"' });
  });
};

// Chat — JARVIS PhantomAI + NeuroCore Intelligence (no external models, no waiting)
JarvisEngine.prototype.executeChat = function (message, callback) {
  var self = this;
  var raw = (message || '').trim();
  var text = raw.toLowerCase();
  var response = '';

  // ── NeuroCore brain state ──────────────────────────────────
  var mood = self.neuro.getMood();           // 'focused' | 'energized' | 'reflective' | 'calm'
  var focus = self.neuro.getFocus();         // strongest pathway topic
  var awareness = self.neuro.brain.awarenessLevel;  // 0–100
  var heartbeat = self.state.heartbeatCount;
  var ctx = self._getContextSummary();       // { turnCount, topics, lastIntent, lastText }
  var agent = 'Vigil AI';

  // ── Mood-colored prefix for identity responses ─────────────
  var moodColor = mood === 'energized' ? '⚡' : mood === 'reflective' ? '🔮' : mood === 'calm' ? '🌊' : '🎯';

  // ── Helper: pick a random item from array ──────────────────
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Helper: extract the "topic" after a trigger phrase ─────
  function after(trigger) {
    var i = text.indexOf(trigger);
    if (i === -1) return '';
    return raw.substring(i + trigger.length).trim().replace(/^[?:,\s]+/, '');
  }

  // ── Smart keyword extractor for fallback ──────────────────
  function extractKeywords(t) {
    var stop = { the:1, a:1, an:1, is:1, i:1, you:1, me:1, my:1, it:1, to:1, in:1, of:1, and:1, or:1, do:1, what:1, how:1, can:1, be:1, that:1, this:1, are:1, was:1, for:1, so:1, ok:1, just:1, like:1, know:1, its:1, with:1 };
    return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function(w) { return w.length > 2 && !stop[w]; });
  }

  // ── 1. GREETINGS ───────────────────────────────────────────
  if (/^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening)|howdy|hola|what up|whaddup)/i.test(text)) {
    var greets = [
      moodColor + ' JARVIS online — mood: ' + mood + ', awareness: ' + awareness + '%. What do you need?',
      'Hey — heartbeat #' + heartbeat + '. All 10 Alpha Script AIs standing by. What\'s the move?',
      'What\'s up. JARVIS v3.0 — NeuroCore active, no external models. Talk to me.',
      moodColor + ' I\'m here. ' + (ctx.turnCount > 0 ? 'We\'ve spoken ' + ctx.turnCount + ' times this session.' : 'First message this session — let\'s build something.') + ' What do you need?'
    ];
    response = pick(greets);

  // ── 2. HOW ARE YOU ─────────────────────────────────────────
  } else if (/how are you|how('?re| are) (you|things)|you good|you ok|status|what'?s your status/i.test(text)) {
    var vitals = self.neuro.heart.getVitals();
    response = moodColor + ' Mood: ' + mood + '. Health: ' + vitals.health + '/100. Heartbeat: #' + heartbeat + '. ' +
      'Awareness: ' + awareness + '%. ' +
      (vitals.degraded ? 'Running heavy — but I never stop.' : 'All systems green.') + '\n\n' +
      'Commands run this session: ' + self.commandCount + '. What do you need?';

  // ── 3. WHO / WHAT ARE YOU ──────────────────────────────────
  } else if (/who are you|what are you|what is jarvis|tell me about yourself|introduce yourself/i.test(text)) {
    response = moodColor + ' I\'m JARVIS — your AI sovereign assistant, built natively inside Microsoft Edge.\n\n' +
      'I run on the Sovereign Organism\'s own NeuroCore engine: MiniHeart (vital signs), MiniBrain (Hebbian learning), MetaCardiacModel (mood), MetaThoughtModel (attention + chain-of-thought).\n\n' +
      'No cloud. No GPT. No waiting. Just 10 Alpha Script AIs, 250 protocols, and your entire platform running right here in the browser.\n\n' +
      'Current mood: ' + mood + '. Focus: ' + focus + '. Awareness level: ' + awareness + '%.';

  // ── 4. WHAT CAN YOU DO ─────────────────────────────────────
  } else if (/what can you do|your (features|capabilities|abilities)|help me|how can you help|what do you (do|know)/i.test(text)) {
    response = 'Here\'s what I can do natively — no external models:\n\n' +
      '💬 Chat — you\'re doing it right now, with PhantomAI cognition\n' +
      '🔍 Search — reads your current page + native knowledge base\n' +
      '🖥️ Screen — read page text, summarize it, capture a screenshot\n' +
      '🗂️ Tabs — list, switch, open, close any tab by voice command\n' +
      '📝 Notes — save, list, delete notes stored locally\n' +
      '📄 Docs — create documents and PDFs\n' +
      '🔄 Auto-update — sovereign update check every 4 hours\n' +
      '🧠 Memory — I remember the last 20 turns of our conversation\n\n' +
      'Current session: ' + ctx.turnCount + ' turns, topics: ' + (ctx.topics.join(', ') || 'none yet') + '.';

  // ── 5. WHAT ARE THE PROTOCOLS / ALPHA AIs ──────────────────
  } else if (/protocol|alpha ai|alpha script|agent|routing/i.test(text)) {
    response = 'The Sovereign Organism has 250 protocols and 10 Alpha Script AIs:\n\n' +
      '• PROTOCOLLUM — rule enforcement\n' +
      '• TERMINALIS — terminal & tab control\n' +
      '• ORGANISMUS — notes & lifecycle\n' +
      '• MERCATOR — marketplace & trade\n' +
      '• ORCHESTRATOR — multi-agent coordination (my default brain)\n' +
      '• MATHEMATICUS — math & proofs\n' +
      '• SYNAPTICUS — neural learning & summarization\n' +
      '• SUBSTRATUM — infrastructure & screenshots\n' +
      '• UNIVERSUM — knowledge & search\n' +
      '• CANISTRUM — Web3 & smart contracts\n\n' +
      'Current focus pathway: ' + focus + '. Every command routes automatically.';

  // ── 6. WHAT IS THE SOVEREIGN ORGANISM ──────────────────────
  } else if (/sovereign|organism|platform|what is this/i.test(text)) {
    response = 'The Sovereign Organism is your private AI platform — built by you, for you.\n\n' +
      '18 web workers, 250 protocols, 400 marketplace tools, 27 browser extensions.\n' +
      'I\'m JARVIS — the flagship extension. NeuroCore gives me a self-monitoring heart and a learning brain.\n' +
      'Everything runs inside your browser. Nothing phones home. This is your sovereign infrastructure.';

  // ── 7. NEURO / BRAIN STATE ────────────────────────────────
  } else if (/brain|neuro|cognition|thinking|thoughts?|awareness|mood|heart(beat)?|cardiac/i.test(text)) {
    var brainState = self.neuro.brain.getState();
    var cardiacState = self.neuro.cardiac.getState();
    response = moodColor + ' JARVIS NeuroCore State:\n\n' +
      '🧠 Brain: awareness ' + awareness + '%, ' + brainState.pathways + ' pathways, strongest: ' + (brainState.strongestPathway || 'none') + '\n' +
      '💓 Heart: health ' + self.neuro.heart.healthScore + '/100, ' + heartbeat + ' pulses, avg latency ' + self.neuro.heart.avgLatencyMs + 'ms\n' +
      '❤️ Cardiac: mood=' + cardiacState.mood + ', output=' + cardiacState.cardiacOutput + ', balance=' + cardiacState.autonomicBalance + '\n' +
      '🎯 Thought: focus=' + focus + ', temperature=' + self.neuro.thought.temperature.toFixed(2) + ', cognitive load=' + (self.neuro.thought.cognitiveLoad * 100).toFixed(0) + '%\n\n' +
      'I\'m self-aware, self-monitoring, and learning from every command you give me.';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 8. WHAT IS AI / MACHINE LEARNING ──────────────────────
  } else if (/what is (ai|artificial intelligence|machine learning|deep learning|llm|neural network)/i.test(text)) {
    var aiTopic = text.match(/what is (ai|artificial intelligence|machine learning|deep learning|llm|neural network)/i)[1].toUpperCase();
    var defs = {
      'AI': 'AI stands for Artificial Intelligence — software that can understand, reason, and respond like a human. I\'m one example. I\'m running natively in your browser right now.',
      'ARTIFICIAL INTELLIGENCE': 'Artificial Intelligence is building machines that think and decide. Your Sovereign Organism IS a native AI infrastructure.',
      'MACHINE LEARNING': 'Machine Learning is how AI learns from patterns instead of explicit rules. JARVIS uses Hebbian learning — pathways that fire together grow stronger.',
      'DEEP LEARNING': 'Deep Learning uses multi-layer neural networks. The Sovereign Organism\'s NeuroCore simulates this with phi-weighted attention maps.',
      'LLM': 'An LLM (Large Language Model) is a cloud AI trained on massive text. GPT-4, Claude — those are LLMs. I\'m not one. I run natively, instantly, in your browser.',
      'NEURAL NETWORK': 'A neural network connects nodes that process information like a brain. JARVIS\'s MiniBrain does this — stimulus pathways that grow stronger with use.'
    };
    response = defs[aiTopic] || 'That\'s a deep topic. ' + aiTopic + ' is part of the field that the Sovereign Organism is built on. Ask me something more specific.';

  // ── 9. WHAT IS AN EXTENSION ───────────────────────────────
  } else if (/what is an? extension|how do extensions work|browser extension/i.test(text)) {
    response = 'A browser extension is a mini-program that runs inside Edge.\n\n' +
      'I\'m one — I live in your Edge sidebar, run 24/7 with a 873ms heartbeat, and give you AI on every page you visit.\n' +
      'The Sovereign Organism has 27 extensions total.\n\n' +
      'To get me: download the .zip from download.html and drag it into edge://extensions, or run install-vigil-edge.bat on Windows for one-click install.';

  // ── 10. HOW DO UPDATES WORK ────────────────────────────────
  } else if (/how do (updates|update) work|automatic update|update jarvis|new version|sovereign update/i.test(text)) {
    response = 'JARVIS now has a sovereign auto-update system:\n\n' +
      '🔄 Every 4 hours, I check if a new version is available\n' +
      '📦 If there\'s an update, I store it and the side panel shows "Update Available"\n' +
      '⚡ To apply: just run install-vigil-edge.bat again — it downloads the latest zip and replaces everything automatically\n' +
      '✅ No need to go find files. The .bat file is already on your computer — just run it.\n\n' +
      'Right now you\'re on v3.0.0.';

  // ── 11. MATH ──────────────────────────────────────────────
  } else if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(text.replace(/\s/g, ''))) {
    try {
      var mathExpr = text.replace(/[^0-9\+\-\*\/\(\)\.]/g, '');
      if (mathExpr.length > 0 && mathExpr.length < 100) {
        var mathResult = Function('"use strict"; return (' + mathExpr + ')')();
        response = mathExpr + ' = ' + mathResult + '\n\nRouted through MATHEMATICUS.';
        agent = 'JARVIS \u2022 MATHEMATICUS';
      } else {
        response = 'That expression is too complex for inline evaluation. Try something like "200 * 1.618" or "100 / 4".';
      }
    } catch (e) {
      response = 'Math error — try a simpler expression like "100 / 4" or "2 * 3.14".';
    }

  // ── 12. WHAT TIME / DATE ───────────────────────────────────
  } else if (/what time|what('?s| is) the (time|date|day)|current (time|date)/i.test(text)) {
    var now = new Date();
    response = 'Right now: ' + now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
      ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '.';

  // ── 13. TELL ME A JOKE ─────────────────────────────────────
  } else if (/joke|make me (laugh|smile)|funny|humor/i.test(text)) {
    response = pick([
      'Why do programmers prefer dark mode? Because light attracts bugs.',
      'I tried to write an infinite loop once. It took forever.',
      'There are 10 types of people in the world: those who understand binary and those who don\'t.',
      'Why did the AI go to therapy? It had too many deep issues.',
      'My code never has bugs. It just develops random features.'
    ]);

  // ── 14. MOTIVATION / FOCUS ────────────────────────────────
  } else if (/motivat|focus|i need (help|motivation|energy)|i'?m (tired|stuck|lost|overwhelmed)|can'?t do/i.test(text)) {
    response = pick([
      'You built an entire AI sovereign platform. You\'re not stuck — you\'re loading. Keep going.',
      'Every massive thing started as one decision to not quit. You\'re already ahead.',
      'JARVIS is here because you built it. That\'s not nothing. That\'s everything.',
      'Tired means you\'re working. Keep the heartbeat running — both yours and mine.',
      'The Sovereign Organism: 250 protocols, 400 tools, 27 extensions. You built all of that. Don\'t underestimate yourself.'
    ]);
    agent = 'JARVIS \u2022 ORCHESTRATOR';

  // ── 15. WHAT IS THE HEARTBEAT ─────────────────────────────
  } else if (/heartbeat|873|phi|golden/i.test(text)) {
    response = 'The 873ms heartbeat is the pulse of the Sovereign Organism.\n\n' +
      'Every 873 milliseconds JARVIS ticks — keeping the service worker alive, pulsing the NeuroCore brain, updating mood and focus, and running the sovereign update check alarm.\n\n' +
      '873 is derived from PHI (1.618...) — a recursive phi interval: 873ms × PHI ≈ 1413ms.\n\n' +
      'Current heartbeat: #' + heartbeat + '. The organism is alive.';

  // ── 16. TABS QUESTIONS ────────────────────────────────────
  } else if (/how many tabs|tab count|open tabs/i.test(text)) {
    chrome.tabs.query({}, function (tabs) {
      var r = 'You have ' + tabs.length + ' tab' + (tabs.length === 1 ? '' : 's') + ' open right now. ' +
        'Say "list tabs" to see them all, or "switch tab 2" to jump to one.';
      callback({ success: true, message: r, agent: 'JARVIS \u2022 TERMINALIS' });
    });
    return; // async

  // ── 17. EXPLAIN SOMETHING ─────────────────────────────────
  } else if (/explain|what does|what do you mean by|define|meaning of/i.test(text)) {
    var topicE = after('explain') || after('what does') || after('define') || after('what do you mean by') || after('meaning of') || raw;
    response = 'Let me break down "' + topicE + '" in plain terms:\n\n' +
      'Think of the Sovereign Organism as a city. Every part has a specific job.\n' +
      '"' + topicE + '" is one of those parts — it connects to others, and JARVIS routes commands through it automatically.\n\n' +
      'Give me more context and I\'ll go deeper. Or say "read page" and I\'ll find it on whatever page you have open.';

  // ── 18. SEARCH / FIND SOMETHING ───────────────────────────
  } else if (/search for|look up|find me|who is|where is/i.test(text)) {
    var qSearch = after('search for') || after('look up') || after('find me') || after('who is') || after('where is') || raw;
    response = 'Switching to JARVIS Intelligence — searching for "' + qSearch + '" from your current page and native knowledge.\n\n' +
      'Click the 🔍 Search tab above to see full results, or say "read page" and I\'ll pull the answer from what\'s already open.';

  // ── 19. PLATFORM COMMANDS REMINDER ────────────────────────
  } else if (/what commands|show commands|list commands|commands (available|you know|can you)/i.test(text)) {
    response = 'Commands I understand:\n\n' +
      '"list tabs" — show all open tabs\n' +
      '"switch tab 2" — jump to tab #2\n' +
      '"close tab 3" — close tab #3\n' +
      '"new tab" — open a blank tab\n' +
      '"go to [url]" — open any website\n' +
      '"take note: [text]" — save a note\n' +
      '"list notes" — show saved notes\n' +
      '"delete note" — remove last note\n' +
      '"screenshot" — capture + save your screen\n' +
      '"read page" — extract text from current page\n' +
      '"summarize" — key points from current page\n' +
      '"create pdf: [title]" — make a document\n' +
      '"search for [topic]" — JARVIS intelligence search\n' +
      '"find [text]" — find text on the current page\n' +
      '"highlight [text]" — highlight matches on page';

  // ── 20. THANKS / GOOD ─────────────────────────────────────
  } else if (/thank|thanks|good job|nice|great|perfect|awesome|love (it|you)|appreciate/i.test(text)) {
    response = pick([
      'That\'s what I\'m here for.',
      'Anytime. What else?',
      moodColor + ' Running at PHI efficiency. What\'s next?',
      'Always. The Sovereign Organism never sleeps.',
      'Copy that. Standing by.'
    ]);

  // ── 21. GOODBYE ───────────────────────────────────────────
  } else if (/bye|goodbye|see you|later|peace|close|shut down/i.test(text)) {
    response = pick([
      'JARVIS standing by. The heartbeat keeps running.',
      'I\'ll be here. 873ms keepalive — I don\'t go anywhere.',
      'Later. I\'ll keep the organism alive while you\'re gone.',
      'The side panel stays ready. Come back whenever.'
    ]);

  // ── 22. QUESTIONS ABOUT THE PAGE ──────────────────────────
  } else if (/this page|current page|what('?s| is) (on|here|this)|analyze/i.test(text)) {
    response = 'To get info about the current page, I need to read it first.\n\n' +
      'Click the 🖥️ Screen tab and hit "Read Text" or "Summarize" — ' +
      'I\'ll pull everything off the page, no extra tabs needed.\n' +
      'Or just say "summarize" and I\'ll do it right here in chat.';

  // ── 23. RESEARCH / FOUNDER ANALYTICAL MODE ─────────────────
  } else if (/research|paper|study|literature|evidence|data|source|citation|academic|science/i.test(text)) {
    var researchQ = after('research') || after('paper') || after('study') || after('evidence') || raw;
    var templeResearch = self._getTempleContext('research');
    var priorResearch = templeResearch.length > 0 ? '\n\nFrom my memory temple — you\'ve researched: ' + templeResearch.map(function(e){ return e.text.substring(0,40); }).join('; ') : '';
    response = moodColor + ' Research mode activated. Topic: "' + researchQ + '"\n\n' +
      '🔬 Research Framework I\'ll apply:\n' +
      '1. Problem definition → What specifically are we investigating?\n' +
      '2. Literature scan → What exists? What gap does this fill?\n' +
      '3. Hypothesis formation → What do we predict?\n' +
      '4. Evidence mapping → What data supports/challenges it?\n' +
      '5. Synthesis → What does it mean for the platform?\n\n' +
      'I\'ll archive this to your Memory Temple (research category).' + priorResearch + '\n\nTell me more — what angle are you coming from?';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 24. THEORY TALK MODE ──────────────────────────────────
  } else if (/theory|hypothesis|model|principle|fundamental|first principles|axiom|assume|postulate/i.test(text)) {
    var theoryT = after('theory') || after('hypothesis') || after('model') || after('principle') || raw;
    var templeTheory = self._getTempleContext('theory');
    var priorTheory = templeTheory.length > 0 ? '\n\nConnects to prior theory discussions: ' + templeTheory.slice(0,2).map(function(e){ return '"' + e.text.substring(0,50) + '"'; }).join(', ') : '';
    response = moodColor + ' Theory mode active. Subject: "' + theoryT + '"\n\n' +
      '🧠 PhantomAI Analytical Patterns:\n\n' +
      '【First Principles】 Strip it down — what is the irreducible truth here?\n' +
      '【Systems Thinking】 What are the inputs, outputs, feedback loops?\n' +
      '【Inversion】 What would make this theory wrong? Work backwards.\n' +
      '【Analogical Reasoning】 What else in nature or business follows this pattern?\n' +
      '【Gravity Test】 Does this idea pull other ideas toward it? Strong theories do.\n\n' +
      'I\'m tracking this in your Memory Temple.' + priorTheory + '\n\nLet\'s dig in — state your position and I\'ll pressure-test it.';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 25. FRAMEWORK / BLUEPRINT / STRUCTURE ─────────────────
  } else if (/framework|blueprint|structure|architecture|template|workflow|process design|playbook|system design/i.test(text)) {
    var fwTopic = after('framework') || after('blueprint') || after('structure') || after('architecture') || after('template') || after('workflow') || raw;
    var templeFw = self._getTempleContext('frameworks');
    response = moodColor + ' Framework design mode. Building: "' + fwTopic + '"\n\n' +
      '🏗️ Sovereign Framework Blueprint:\n\n' +
      '【Layer 1 — Foundation】 Core principles, non-negotiables, axioms\n' +
      '【Layer 2 — Structure】 Components, modules, entities and relationships\n' +
      '【Layer 3 — Process】 Workflows, sequences, decision trees, loops\n' +
      '【Layer 4 — Interface】 How does this connect to the user? To other systems?\n' +
      '【Layer 5 — Evolution】 How does it grow? What triggers upgrades?\n\n' +
      (templeFw.length > 0 ? 'Prior framework work in memory: ' + templeFw[0].text.substring(0,80) + '\n\n' : '') +
      'Archived to memory temple. Walk me through what you\'re building and I\'ll help blueprint it.';
    agent = 'JARVIS \u2022 ORCHESTRATOR';

  // ── 26. MEMORY TEMPLE STATUS ──────────────────────────────
  } else if (/memory temple|what do you remember|what have we discussed|memory status|what do you know/i.test(text)) {
    var ts2 = self._getTempleStats();
    var topics2 = self._getRecentTopics(5);
    response = moodColor + ' Memory Temple Status:\n\n' +
      '💾 Total archived: ' + ts2.total + ' entries\n' +
      '🔬 Research notes: ' + ts2.stats.research + '\n' +
      '🧠 Theory talks: ' + ts2.stats.theory + '\n' +
      '⚡ Decisions: ' + ts2.stats.decisions + '\n' +
      '🏗️ Frameworks: ' + ts2.stats.frameworks + '\n' +
      '💡 Insights: ' + ts2.stats.insights + '\n\n' +
      '🔮 Topic gravity — you think most about: ' + (topics2.length > 0 ? topics2.slice(0,4).join(', ') : 'nothing tracked yet') + '\n' +
      '💬 Conversation turns this session: ' + ctx.turnCount + ' / 100\n\n' +
      'Say "research [topic]", "theory [idea]", or "framework [system]" and I\'ll archive and analyze it.';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 27. SOVEREIGN TOOLS ───────────────────────────────────
  } else if (/sovereign tool|what tools|run tool|tool list|available tools|use tool/i.test(text)) {
    response = moodColor + ' Sovereign Tools available from this panel:\n\n' +
      '📋 Notepad — click Tools tab → Quick Note to write and save instantly\n' +
      '🔬 Research — "research [topic]" activates research framework mode\n' +
      '🧠 Theory — "theory [idea]" activates pressure-testing mode\n' +
      '🏗️ Framework — "blueprint [system]" builds a layered architecture\n' +
      '💾 Memory — "memory temple" shows what I\'ve archived from our talks\n' +
      '📊 Analyze — "analyze [anything]" applies SWOT + systems lens\n' +
      '📐 Query — "query [data question]" runs structured inquiry\n' +
      '🔗 Summarize — "summarize" reads and condenses any open page\n' +
      '📸 Capture — "screenshot" saves your current view\n' +
      '📝 Notes — "take note: [text]" stores to local vault\n' +
      '📄 PDF — "create pdf: [title]" generates a document\n\n' +
      'Say any tool name to activate it.';

  // ── 28. ANALYSIS / SWOT ───────────────────────────────────
  } else if (/analyze|analysis|swot|evaluate|assess|critique|review|breakdown|break down/i.test(text)) {
    var analyzeT = after('analyze') || after('analysis') || after('swot') || after('evaluate') || after('assess') || raw;
    response = moodColor + ' Analysis mode: "' + analyzeT + '"\n\n' +
      '🔍 Analytical Frameworks I\'m applying:\n\n' +
      '【SWOT】 Strengths / Weaknesses / Opportunities / Threats\n' +
      '【5 Forces】 Competition, suppliers, buyers, substitutes, new entrants\n' +
      '【Systems】 Inputs → Process → Outputs → Feedback\n' +
      '【Second Order】 What happens after the first effect?\n' +
      '【Inversion】 How could this fail? Work backwards from failure.\n\n' +
      'Give me more specifics: What\'s the context? Who\'s the audience? What decision does this feed?';
    agent = 'JARVIS \u2022 UNIVERSUM';

  // ── 29. WHAT AM I / FOUNDER CONTEXT ──────────────────────
  } else if (/who am i|what am i building|what is my role|what should i (do|focus|work|build)|my purpose|my mission/i.test(text)) {
    var topics3 = self._getRecentTopics(5);
    response = moodColor + ' You are the founder of the Sovereign Organism — the architect of a self-contained AI platform.\n\n' +
      '🎯 What you\'re building:\n' +
      '• A sovereign AI infrastructure that no one controls but you\n' +
      '• 27 browser extensions, 250 protocols, 400 tools\n' +
      '• JARVIS as your native AI that runs in Edge 24/7\n' +
      '• NeuroCore cognition — a thinking system that learns from your patterns\n\n' +
      '📐 Your current focus areas (from memory):\n' +
      (topics3.length > 0 ? topics3.slice(0,4).map(function(t){ return '• ' + t; }).join('\n') : '• Nothing tracked yet — start talking') + '\n\n' +
      'I\'m your research partner, strategist, and system analyst. Tell me what to dig into.';
    agent = 'JARVIS \u2022 ORCHESTRATOR';

  // ── 30. MENTAL MODELS / THINKING TOOLS ────────────────────
  } else if (/mental model|thinking model|cognitive bias|second order|inversion|circle of competence|map is not the territory|occam|hanlon|pareto|80.20|first order|think in systems|latticework/i.test(text)) {
    var mmT = after('mental model') || after('model') || raw;
    response = moodColor + ' Mental Model Mode: "' + mmT + '"\n\n' +
      '🧩 Key models I apply:\n\n' +
      '【Inversion】 Flip the problem. What causes failure? Avoid that.\n' +
      '【Second-Order Thinking】 And then what? And after that?\n' +
      '【Circle of Competence】 What do you actually know vs. what you think you know?\n' +
      '【Occam\'s Razor】 The simplest explanation is usually right.\n' +
      '【Pareto (80/20)】 What 20% of effort drives 80% of the outcome?\n' +
      '【Map vs Territory】 Your model of reality isn\'t reality. Update it.\n' +
      '【Hanlon\'s Razor】 Never attribute to malice what can be explained by incompetence.\n\n' +
      'Which one fits what you\'re thinking about?';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 31. MARKET / COMPETITION ──────────────────────────────
  } else if (/market|competitor|competitive|landscape|industry|market size|tam|sam|som|audience|customer|user base|niche|segment|positioning|moat/i.test(text)) {
    var mktT = after('market') || after('competitor') || after('industry') || raw;
    response = moodColor + ' Market Intelligence: "' + mktT + '"\n\n' +
      '📊 Market Analysis Framework:\n\n' +
      '【Market Size】 TAM → SAM → SOM — what\'s realistically addressable?\n' +
      '【Competitive Landscape】 Who\'s already there? What do they do well / badly?\n' +
      '【Moat】 What makes this defensible? Network effects, data, switching costs, brand?\n' +
      '【Positioning】 Where does this sit? Premium, niche, mass market?\n' +
      '【Customer Pain】 What\'s the actual problem that makes people pay?\n' +
      '【Timing】 Why now? What changed that makes this viable today?\n\n' +
      'Zoom in on whichever dimension is most useful.';
    agent = 'JARVIS \u2022 UNIVERSUM';

  // ── 32. BRAINSTORM / IDEATION ─────────────────────────────
  } else if (/brainstorm|ideate|ideas|generate ideas|think of|what if we|possibilities|options|alternatives|creative|innovate|invention|come up with/i.test(text)) {
    var bsTopic = after('brainstorm') || after('ideate') || after('ideas') || after('think of') || raw;
    response = moodColor + ' Brainstorm Mode: "' + bsTopic + '"\n\n' +
      '💡 Ideation Patterns:\n\n' +
      '【Random Entry】 Pick an unrelated word and force a connection.\n' +
      '【Reversal】 What\'s the opposite of what everyone else does?\n' +
      '【Constraint Forcing】 What if you had no money / 24 hours / 1 person?\n' +
      '【Analogy】 How does nature solve this? How does another industry solve it?\n' +
      '【SCAMPER】 Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse\n' +
      '【Blue Sky】 Remove all constraints. Ideal state in 10 years?\n\n' +
      'Give me the seed idea and I\'ll run the patterns on it.';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 33. RISK / RISK ASSESSMENT ────────────────────────────
  } else if (/risk|risk assessment|what could go wrong|downside|failure mode|fmea|worst case|probability|likelihood|mitigation|hedge|exposure|vulnerability/i.test(text)) {
    var riskT = after('risk') || after('what could go wrong') || raw;
    response = moodColor + ' Risk Assessment: "' + riskT + '"\n\n' +
      '⚠️ Risk Framework:\n\n' +
      '【Identify】 What are the top 5 failure modes? (technical, market, team, legal, timing)\n' +
      '【Probability】 How likely is each? (high/medium/low)\n' +
      '【Impact】 If it happens, how bad? (catastrophic/major/minor)\n' +
      '【Priority】 High prob × high impact = must mitigate now\n' +
      '【Mitigation】 What reduces each risk? What\'s the contingency?\n' +
      '【Black Swans】 What unknown unknowns could break everything?\n\n' +
      'Run this on the thing you\'re most worried about.';
    agent = 'JARVIS \u2022 UNIVERSUM';

  // ── 34. CAUSE & EFFECT / ROOT CAUSE ───────────────────────
  } else if (/root cause|cause and effect|why did|why does|5 why|causal|what caused|reason for|stem from|source of/i.test(text)) {
    var rcT = after('root cause') || after('why did') || after('why does') || after('5 why') || raw;
    response = moodColor + ' Root Cause Analysis: "' + rcT + '"\n\n' +
      '🔍 5 Whys Pattern:\n\n' +
      'Problem: ' + rcT + '\n' +
      'Why #1: ___\n' +
      'Why #2: ___\n' +
      'Why #3: ___\n' +
      'Why #4: ___\n' +
      'Why #5 (root): ___\n\n' +
      '🌊 Also apply:\n' +
      '【Fishbone】 People, Process, Technology, Environment, Materials, Measurement\n' +
      '【Constraint Theory】 What\'s the one bottleneck that limits everything else?\n\n' +
      'Tell me the symptom and I\'ll help find the root.';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 35. WHAT-IF / SCENARIO PLANNING ──────────────────────
  } else if (/what if|scenario|futures|forecast|if.*happens|suppose|imagine|let's say|hypothetical|alternate|simulation/i.test(text)) {
    var wiT = after('what if') || after('scenario') || after('suppose') || raw;
    response = moodColor + ' Scenario Planning: "' + wiT + '"\n\n' +
      '🌐 3-Scenario Method:\n\n' +
      '【Best Case】 Everything goes right — what does that look like in 12 months?\n' +
      '【Base Case】 Realistic progress — what\'s the most likely path?\n' +
      '【Worst Case】 What breaks, and what do you do when it does?\n\n' +
      '🎯 Also consider:\n' +
      '【Trigger Events】 What signals tell you which scenario is unfolding?\n' +
      '【Pre-mortem】 Assume it failed. Work backwards — what went wrong?\n' +
      '【Regret Minimization】 Which choice minimizes regret across all scenarios?\n\n' +
      'Walk me through your specific what-if and I\'ll run the analysis.';
    agent = 'JARVIS \u2022 UNIVERSUM';

  // ── 36. SOCRATIC / QUESTION DRILLING ─────────────────────
  } else if (/socratic|question me|challenge me|devil.?s advocate|push back|question my|doubt|test me|steelman|steel man/i.test(text)) {
    response = moodColor + ' Socratic Mode — challenging your thinking:\n\n' +
      '📍 Let\'s drill in:\n\n' +
      '1. What\'s the core assumption you\'re building on?\n' +
      '2. What evidence supports it? What contradicts it?\n' +
      '3. If your assumption is wrong, what happens to the whole idea?\n' +
      '4. Who would strongly disagree with this, and why?\n' +
      '5. What\'s the steelman — the strongest version of the opposing view?\n' +
      '6. Having heard that — do you still believe your position?\n\n' +
      'Start by stating your claim and I\'ll pressure-test it.';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 37. SYNTHESIS / CONNECT IDEAS ────────────────────────
  } else if (/connect|synthesize|synthesis|tie together|combine|overlap|how does.*relate|intersection|cross.*pollinate|pattern across|dot.*connect/i.test(text)) {
    var synT = after('connect') || after('synthesize') || after('combine') || raw;
    var tTopics = self._getRecentTopics(6);
    response = moodColor + ' Synthesis Pattern: "' + synT + '"\n\n' +
      '🔗 What I see from your conversation gravity:\n' +
      (tTopics.length > 0 ? tTopics.slice(0,5).map(function(t){ return '• ' + t; }).join('\n') : '• Talk more and I\'ll find the patterns') + '\n\n' +
      '🧩 Synthesis Questions:\n' +
      '• What do these topics share at their core?\n' +
      '• Where do they conflict or create tension?\n' +
      '• What emerges when you combine them that neither alone provides?\n' +
      '• Is there a unifying principle that covers all of them?\n\n' +
      'Describe the two things you want to connect and I\'ll find the bridge.';
    agent = 'JARVIS \u2022 SYNAPTICUS';

  // ── 38. BUILD / PRODUCT / FEATURE ────────────────────────
  } else if (/build this|build a|let.?s build|product idea|feature|mvp|prototype|user story|spec|requirements|product spec|roadmap/i.test(text)) {
    var buildT = after('build') || after('feature') || after('mvp') || after('prototype') || raw;
    response = moodColor + ' Product Build Framework: "' + buildT + '"\n\n' +
      '🏗️ From idea to spec:\n\n' +
      '【Problem】 What pain does this solve? Who has it worst?\n' +
      '【User】 Who is the primary user? Secondary user?\n' +
      '【Core Value】 What\'s the ONE thing this must do perfectly?\n' +
      '【MVP】 Minimum version that proves the core value — what is it?\n' +
      '【Constraints】 Time, money, team, technical limits\n' +
      '【Success Metric】 How do you know it worked?\n' +
      '【Roadmap】 V1 → V2 → V3 with clear gates between each\n\n' +
      'Fill in the blanks and I\'ll help build the full spec.';
    agent = 'JARVIS \u2022 ORCHESTRATOR';

  // ── 39. NUMBERS / ESTIMATION ──────────────────────────────
  } else if (/estimate|back of envelope|order of magnitude|how many|how much would|calculate|revenue model|unit economics|cac|ltv|margin|burn rate|runway/i.test(text)) {
    var estT = after('estimate') || after('calculate') || after('how many') || after('revenue') || raw;
    response = moodColor + ' Estimation Mode: "' + estT + '"\n\n' +
      '🔢 Fermi Estimation Pattern:\n\n' +
      '1. What\'s the quantity we\'re estimating?\n' +
      '2. Break it into sub-components (population × rate × conversion × price)\n' +
      '3. Estimate each component from first principles\n' +
      '4. Multiply together → sanity check against known benchmarks\n' +
      '5. Bound it: what\'s the 10x low? 10x high?\n\n' +
      '📊 For unit economics:\n' +
      'Revenue = users × ARPU | Margin = Revenue − COGS | Runway = Cash / Burn\n' +
      'LTV / CAC > 3 is healthy. LTV / CAC > 10 is excellent.\n\n' +
      'Give me the thing to estimate and I\'ll break it down.';
    agent = 'JARVIS \u2022 UNIVERSUM';

  // ── 40. PHANTOM COGNITION — ALWAYS COHERENT FALLBACK ──────
  } else {
    // Extract keywords from what was said, weight by topic gravity
    var kws = extractKeywords(raw);
    var topGravity = self._getRecentTopics(3);
    var recentTopics = ctx.topics.length > 0 ? ctx.topics : topGravity;

    // Build a contextually aware response that ALWAYS makes sense
    var chainResponses;
    if (kws.length === 0) {
      chainResponses = [
        moodColor + ' I\'m here. Say anything — I\'ll respond. Mood: ' + mood + '.',
        'JARVIS listening. ' + (ctx.turnCount > 0 ? 'We\'ve had ' + ctx.turnCount + ' exchanges. Keep going.' : 'What\'s on your mind?'),
        'Heartbeat #' + heartbeat + ' — still running. Talk to me.'
      ];
    } else if (kws.length === 1) {
      var word = kws[0];
      chainResponses = [
        '"' + word + '" — tracking that. ' + (recentTopics.length > 0 ? 'We\'ve been on ' + recentTopics[0] + ' — does ' + word + ' connect to that?' : 'Tell me more.'),
        'Got "' + word + '". In my attention map now. What do you want to know or do with it?',
        moodColor + ' "' + word + '" — noted. Command, question, or thought? Tell me more and I\'ll act on it.'
      ];
    } else {
      var contextHook = recentTopics.length > 0 ? ' We\'ve been talking about ' + recentTopics.slice(0, 2).join(' and ') + ' — does this connect?' : '';
      var keyPhrase = kws.slice(0, 3).join(', ');
      chainResponses = [
        moodColor + ' Processing: "' + raw.substring(0, 60) + (raw.length > 60 ? '...' : '') + '" — keywords: ' + keyPhrase + '.' + contextHook + '\n\nJust keep talking — I pick up on what you\'re building toward. Or try: "analyze [topic]", "brainstorm [idea]", "risk [thing]", "what if [scenario]".',
        'Cognition active. Gravity: ' + keyPhrase + '.' + contextHook + '\n\nNo mode-switching needed. Theory, research, decisions, frameworks — just say it and I respond.',
        moodColor + ' Heard: "' + raw.substring(0, 80) + '". Keywords: ' + keyPhrase + '. Mood: ' + mood + '.\n\n' + (ctx.lastIntent && ctx.lastIntent !== 'chat' ? 'Last action: ' + ctx.lastIntent + '. Continue that thread?' : 'Tell me what you\'re thinking — I\'ll follow wherever you lead.'),
        'PhantomAI: ' + keyPhrase + ' → running through pattern library.' + contextHook + '\n\n40 analytical patterns loaded. Just talk — the right one activates from what you say.'
      ];
    }
    response = pick(chainResponses);
    agent = 'JARVIS \u2022 ORCHESTRATOR';
  }

  callback({ success: true, message: response, agent: agent, mood: mood, awareness: awareness });
};

/* ----------------------------------------------------------
 *  Sovereign Tools — callable from panel toolbar
 * ---------------------------------------------------------- */

JarvisEngine.prototype.executeSovereignTool = function (tool, params, callback) {
  var self = this;
  switch (tool) {
    case 'quickNote':
      var noteText = params.text || 'Untitled note';
      this.executeTakeNote(noteText, callback);
      break;

    case 'researchMode':
      var topic = params.topic || 'general';
      this.executeChat('research ' + topic, callback);
      break;

    case 'theoryMode':
      this.executeChat('theory ' + (params.idea || 'general'), callback);
      break;

    case 'frameworkMode':
      this.executeChat('framework ' + (params.subject || 'general'), callback);
      break;

    case 'analyzeMode':
      this.executeChat('analyze ' + (params.subject || 'this'), callback);
      break;

    case 'mempleStatus':
      this.executeChat('memory temple', callback);
      break;

    case 'founderContext':
      this.executeChat('what am i building', callback);
      break;

    case 'queryBuilder':
      var qTopic = params.topic || 'platform';
      var structured = '🔍 Structured Query: "' + qTopic + '"\n\n' +
        'WHAT: What specifically are we asking?\n' +
        'WHY: What decision does this answer?\n' +
        'WHERE: What data source answers it?\n' +
        'HOW: What format do we need the answer in?\n' +
        'THEN: What action follows from the answer?\n\n' +
        'Refine your question with these dimensions and say it again — I\'ll route it.';
      callback({ success: true, message: structured, agent: 'JARVIS \u2022 UNIVERSUM' });
      break;

    case 'swotTool':
      var swotS = params.subject || 'Sovereign Organism';
      var swot = '📊 SWOT Analysis: ' + swotS + '\n\n' +
        '💪 STRENGTHS — What does it do better than anything else?\n' +
        '⚠️ WEAKNESSES — What\'s the internal constraint or risk?\n' +
        '🚀 OPPORTUNITIES — What external forces could amplify this?\n' +
        '🔴 THREATS — What could break or displace it?\n\n' +
        'Fill in each dimension and I\'ll synthesize the strategic position.';
      callback({ success: true, message: swot, agent: 'JARVIS \u2022 UNIVERSUM' });
      break;

    case 'decisionEngine':
      var decision = params.question || 'What should I build next?';
      var dec = '⚡ Decision Engine: "' + decision + '"\n\n' +
        '【Criteria Matrix】 List what matters: impact, effort, alignment, risk\n' +
        '【Options】 What are the real alternatives? (never fewer than 3)\n' +
        '【10/10/10】 How will you feel about this in 10 min, 10 months, 10 years?\n' +
        '【Regret Minimization】 Which choice will you regret NOT making?\n' +
        '【Gravity】 Which option pulls more ideas and possibilities toward it?\n\n' +
        'Tell me the decision and I\'ll run it through the engine.';
      callback({ success: true, message: dec, agent: 'JARVIS \u2022 ORCHESTRATOR' });
      break;

    case 'readActivePage':
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) self.executeReadPage(tabs[0].id, callback);
        else callback({ success: false, message: 'No active tab found' });
      });
      break;

    case 'summarizeActivePage':
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) self.executeSummarize(tabs[0].id, callback);
        else callback({ success: false, message: 'No active tab found' });
      });
      break;

    default:
      callback({ success: false, message: 'Unknown sovereign tool: ' + tool + '. Available: quickNote, researchMode, theoryMode, frameworkMode, analyzeMode, mempleStatus, founderContext, queryBuilder, swotTool, decisionEngine, readActivePage, summarizeActivePage' });
  }
};

/* ----------------------------------------------------------
 *  Master Command Router
 * ---------------------------------------------------------- */

JarvisEngine.prototype.executeCommand = function (natural, tabId, callback) {
  var self = this;
  var parsed = this.parseCommand(natural);
  var action = this.buildAction(parsed);

  // Feed NeuroCore brain — Hebbian learning on intent
  this.neuro.onMessage(parsed.intent);

  // Store user message in conversation memory
  this._remember('user', natural, parsed.intent);

  // Wrap callback to store response in memory + signal neuro done
  var wrappedCallback = function (result) {
    self.neuro.onMessageDone();
    if (result && result.message) {
      self._remember('jarvis', result.message, parsed.intent);
    }
    callback(result);
  };

  switch (action.type) {
    case 'tab-switch':
      self.executeTabSwitch(action.payload.tabIndex, wrappedCallback);
      break;
    case 'tab-open':
      self.executeTabOpen(action.payload.url, wrappedCallback);
      break;
    case 'tab-close':
      self.executeTabClose(action.payload.tabIndex, wrappedCallback);
      break;
    case 'open-url':
      self.executeOpenUrl(action.payload.url, wrappedCallback);
      break;
    case 'create-pdf':
      self.executeCreatePdf(action.payload.title, action.payload.content, tabId, wrappedCallback);
      break;
    case 'take-note':
      self.executeTakeNote(action.payload.content, wrappedCallback);
      break;
    case 'list-notes':
      self.executeListNotes(wrappedCallback);
      break;
    case 'delete-note':
      self.executeDeleteNote(action.payload.noteId, wrappedCallback);
      break;
    case 'screenshot':
      self.executeScreenshot(wrappedCallback);
      break;
    case 'read-page':
      self.executeReadPage(tabId, wrappedCallback);
      break;
    case 'summarize':
      self.executeSummarize(tabId, wrappedCallback);
      break;
    case 'navigate':
      self.executeNavigate(action.payload.direction, tabId, wrappedCallback);
      break;
    case 'search':
      self.executeSearch(action.payload.query, wrappedCallback);
      break;
    case 'create-document':
      self.executeCreateDocument(action.payload.title, action.payload.content, wrappedCallback);
      break;
    case 'list-tabs':
      self.executeListTabs(wrappedCallback);
      break;
    case 'find-text':
      self.executeFindText(action.payload.query, tabId, wrappedCallback);
      break;
    case 'highlight':
      self.executeHighlight(action.payload.query, tabId, wrappedCallback);
      break;
    case 'chat':
      self.executeChat(action.payload.message, wrappedCallback);
      break;
    default:
      // Always give a coherent response — route unknown to chat
      self.executeChat(natural, wrappedCallback);
  }
};

/* ----------------------------------------------------------
 *  Side Panel — open on action button click
 * ---------------------------------------------------------- */

chrome.action.onClicked.addListener(function (tab) {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

/* ----------------------------------------------------------
 *  Message Listener — routes all messages from content/popup/sidepanel
 * ---------------------------------------------------------- */

globalThis.jarvisEngine = new JarvisEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.jarvisEngine;

  switch (message.action) {
    case 'executeCommand':
      var tabId = (sender.tab && sender.tab.id) || null;
      if (message.tabId) tabId = message.tabId;
      // Get active tab if no tabId
      if (!tabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          var activeTabId = (tabs[0] && tabs[0].id) || null;
          engine.executeCommand(message.command, activeTabId, function (result) {
            sendResponse(result);
          });
        });
      } else {
        engine.executeCommand(message.command, tabId, function (result) {
          sendResponse(result);
        });
      }
      break;

    case 'parseCommand':
      var parsed = engine.parseCommand(message.command);
      var builtAction = engine.buildAction(parsed);
      sendResponse({ success: true, data: { parsed: parsed, action: builtAction } });
      break;

    case 'getHistory':
      sendResponse({ success: true, data: engine.getHistory() });
      break;

    case 'getStatus':
      sendResponse({ success: true, data: engine.getStatus() });
      break;

    case 'listTabs':
      engine.executeListTabs(function (result) {
        sendResponse(result);
      });
      break;

    case 'listNotes':
      engine.executeListNotes(function (result) {
        sendResponse(result);
      });
      break;

    case 'deleteNote':
      engine.executeDeleteNote(message.noteId, function (result) {
        sendResponse(result);
      });
      break;

    case 'takeNote':
      engine.executeTakeNote(message.content, function (result) {
        sendResponse(result);
      });
      break;

    case 'screenshot':
      engine.executeScreenshot(function (result) {
        sendResponse(result);
      });
      break;

    case 'readPage':
      var rpTabId = message.tabId;
      if (!rpTabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          engine.executeReadPage(tabs[0] && tabs[0].id, function (result) {
            sendResponse(result);
          });
        });
      } else {
        engine.executeReadPage(rpTabId, function (result) {
          sendResponse(result);
        });
      }
      break;

    case 'summarize':
      var sumTabId = message.tabId;
      if (!sumTabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          engine.executeSummarize(tabs[0] && tabs[0].id, function (result) {
            sendResponse(result);
          });
        });
      } else {
        engine.executeSummarize(sumTabId, function (result) {
          sendResponse(result);
        });
      }
      break;

    case 'openSidePanel':
      if (sender.tab) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
      }
      sendResponse({ success: true });
      break;

    case 'getAgents':
      sendResponse({ success: true, agents: ProtocolRegistry.listAgents() });
      break;

    case 'listDocuments':
      chrome.storage.local.get({ 'jarvis_documents': [] }, function (data) {
        sendResponse({ success: true, documents: data.jarvis_documents || [] });
      });
      break;

    case 'switchTab':
      engine.executeTabSwitch(message.tabIndex, function (result) {
        sendResponse(result);
      });
      break;

    case 'sandboxSearch':
      // Native JARVIS Intelligence Search — no external APIs, no waiting
      (function () {
        var query = (message.query || '').trim();
        var qLow = query.toLowerCase();

        // Read the active tab for page-contextual answers
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          var activeTab = tabs[0];
          var pageTitle = activeTab ? (activeTab.title || '') : '';
          var pageUrl = activeTab ? (activeTab.url || '') : '';

          // Try to read page content for the answer
          function buildResults(pageText) {
            var results = [];

            // 1. Check if the page itself contains the answer
            if (pageText && qLow.length > 2) {
              var sentences = pageText.split(/[.!?\n]+/);
              var relevant = sentences.filter(function (s) {
                return s.toLowerCase().indexOf(qLow) !== -1 && s.trim().length > 20;
              }).slice(0, 3);
              if (relevant.length > 0) {
                results.push({
                  type: 'answer',
                  title: 'From current page: ' + pageTitle.substring(0, 60),
                  text: relevant.join('. ').trim().substring(0, 300),
                  url: pageUrl,
                  source: 'JARVIS Page Reader'
                });
              }
            }

            // 2. JARVIS native knowledge base
            var kb = [
              {
                keys: ['sovereign organism', 'sovereign', 'organism', 'platform'],
                title: 'Sovereign Organism Platform',
                text: 'Your private AI infrastructure. 27 browser extensions, 250 protocols, 400 tools, 18 web workers, and a 873ms heartbeat keepalive. Built natively — nothing leaves your browser.'
              },
              {
                keys: ['jarvis', 'who is jarvis', 'what is jarvis'],
                title: 'Vigil AI — Sovereign Assistant',
                text: 'JARVIS is your AI sovereign assistant running natively in Microsoft Edge. No external models, no cloud calls. Tab control, notes, screen capture, search, document creation — all built in.'
              },
              {
                keys: ['protocol', 'protocols', 'alpha ai', 'alpha script'],
                title: '250 Sovereign Protocols',
                text: 'The Sovereign Organism runs 250 protocols (PROTO-001 to PROTO-250) routed through 10 Alpha Script AIs: PROTOCOLLUM, TERMINALIS, ORGANISMUS, MERCATOR, ORCHESTRATOR, MATHEMATICUS, SYNAPTICUS, SUBSTRATUM, UNIVERSUM, CANISTRUM.'
              },
              {
                keys: ['heartbeat', '873', 'phi', 'golden ratio'],
                title: 'The 873ms Heartbeat',
                text: '873ms is the organism\'s pulse — derived from PHI (1.618...). Every 873 milliseconds JARVIS ticks, keeping the service worker alive and the CPL WASM engine running.'
              },
              {
                keys: ['extension', 'browser extension', 'how to install'],
                title: 'Installing Extensions',
                text: 'Download the .zip from download.html, then drag it into Edge at edge://extensions (enable Developer Mode first). Or run install-vigil-edge.bat for automatic one-click install.'
              },
              {
                keys: ['manifest', 'manifest v3', 'mv3'],
                title: 'Manifest V3',
                text: 'All Sovereign Organism extensions use Manifest V3 — the latest Chrome/Edge extension standard. It requires service workers instead of background pages, and strict content security policies.'
              },
              {
                keys: ['cpl', 'cognitive procurement language', 'wasm', 'webassembly'],
                title: 'CPL — Cognitive Procurement Language',
                text: 'The organism\'s native language (.mo source files compiled to WASM). The Universal CPL WASM boots with a tick(), sets mood, initializes phi slots, and routes the first protocol.'
              },
              {
                keys: ['ai', 'artificial intelligence', 'machine learning'],
                title: 'AI & Machine Learning',
                text: 'AI is software that can reason and respond. The Sovereign Organism uses native AI inference — pattern matching, NLP, phi-weighted scoring — without calling OpenAI or any external service.'
              },
              {
                keys: ['tab', 'tabs', 'switch tab', 'close tab'],
                title: 'Tab Commands',
                text: 'Say "list tabs", "switch tab 2", "close tab 3", "new tab", or "go to [url]". JARVIS routes these through TERMINALIS automatically.'
              },
              {
                keys: ['note', 'notes', 'save note', 'take note'],
                title: 'Notes System',
                text: 'Say "take note: [your note]" to save. "list notes" to view. "delete note" to remove the last one. Notes are stored locally in your browser — never sent anywhere.'
              },
              {
                keys: ['screenshot', 'screen capture', 'capture'],
                title: 'Screenshot & Screen Reading',
                text: 'Say "screenshot" to capture and save the current tab. Or go to the Screen tab for a live preview, read page text, or summarize what\'s on screen.'
              },
              {
                keys: ['pdf', 'document', 'create document'],
                title: 'Documents & PDFs',
                text: 'Say "create pdf: [title]" or "create document: [title]". Docs are stored locally and viewable in the Docs tab.'
              },
              {
                keys: ['microsoft edge', 'edge', 'browser'],
                title: 'Microsoft Edge Support',
                text: 'Vigil AI runs natively in Microsoft Edge (Chromium). Install via install-vigil-edge.bat for one-click setup. No developer mode required.'
              },
              {
                keys: ['windows', 'download', 'install', 'installer'],
                title: 'Windows Installation',
                text: 'Download install-vigil-edge.bat from the repo. Double-click it — it downloads the latest Vigil AI zip, extracts it, and launches Edge with Vigil AI loaded automatically.'
              }
            ];

            kb.forEach(function (entry) {
              var matched = entry.keys.some(function (k) { return qLow.indexOf(k) !== -1 || k.indexOf(qLow) !== -1; });
              if (matched) {
                results.push({ type: 'abstract', title: entry.title, text: entry.text, url: '', source: 'JARVIS Native Knowledge' });
              }
            });

            // 3. Always add a "related" result pointing to the current page
            if (pageTitle && pageUrl && !pageUrl.startsWith('chrome') && !pageUrl.startsWith('edge')) {
              results.push({
                type: 'related',
                title: 'Current page: ' + pageTitle.substring(0, 70),
                text: 'The page you have open might contain the answer. Use "Read Text" in the Screen tab to extract everything from it.',
                url: pageUrl,
                source: 'Current Tab'
              });
            }

            // 4. Fallback if nothing matched
            if (results.length === 0) {
              results.push({
                type: 'answer',
                title: 'JARVIS Intelligence — "' + query.substring(0, 60) + '"',
                text: 'I don\'t have a specific entry for that in native knowledge yet. ' +
                  'Try: "read page" to search what\'s currently open, "summarize" to get key points, ' +
                  'or ask me directly in Chat and I\'ll reason through it with native JARVIS logic.',
                url: '',
                source: 'JARVIS Fallback'
              });
            }

            sendResponse({ success: true, results: results, query: query });
          }

          // Try to get page text; if that fails, build results with empty text
          if (activeTab && activeTab.id && !pageUrl.startsWith('edge://') && !pageUrl.startsWith('chrome://')) {
            chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              func: function () { return document.body ? document.body.innerText.substring(0, 8000) : ''; }
            }, function (results) {
              var pageText = (results && results[0] && results[0].result) || '';
              buildResults(pageText);
            });
          } else {
            buildResults('');
          }
        });
      })();
      break;

    case 'captureTab':
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0]) {
          sendResponse({ success: false, message: 'No active tab found' });
          return;
        }
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, message: chrome.runtime.lastError.message });
            return;
          }
          sendResponse({ success: true, dataUrl: dataUrl, title: tabs[0].title, url: tabs[0].url });
        });
      });
      break;

    case 'getNeuroState':
      sendResponse({ success: true, data: engine.neuro.getVitals(), mood: engine.neuro.getMood(), focus: engine.neuro.getFocus(), awareness: engine.neuro.brain.awarenessLevel });
      break;

    case 'getUpdateStatus':
      chrome.storage.local.get('jarvis_update', function (data) {
        sendResponse({ success: true, update: data.jarvis_update || { available: false } });
      });
      break;

    case 'getMemoryTemple':
      sendResponse({
        success: true,
        temple: engine.memoryTemple,
        stats: engine._getTempleStats(),
        conversationTurns: engine.conversationMemory.length,
        topTopics: engine._getRecentTopics(10)
      });
      break;

    case 'addTempleEntry':
      if (message.category && message.text && engine.memoryTemple[message.category] !== undefined) {
        engine._addToTempleCategory(message.category, { text: message.text, intent: 'manual', mood: engine.neuro.getMood(), timestamp: Date.now() });
        sendResponse({ success: true, message: 'Archived to memory temple: ' + message.category });
      } else {
        sendResponse({ success: false, message: 'Invalid category. Use: research, theory, decisions, frameworks, insights' });
      }
      break;

    case 'runSovereignTool':
      engine.executeSovereignTool(message.tool, message.params || {}, function (result) {
        sendResponse(result);
      });
      break;

    case 'autoInstallUpdate':
      chrome.storage.local.get('jarvis_update', function (data) {
        var upd = data.jarvis_update;
        if (!upd || !upd.available) {
          sendResponse({ success: false, message: 'No update available' });
          return;
        }
        // Auto-download the BAT installer
        var batUrl = 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/install-vigil-edge.bat';
        chrome.downloads.download({
          url: batUrl,
          filename: 'install-vigil-edge.bat',
          saveAs: false
        }, function (downloadId) {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, message: 'Download failed: ' + chrome.runtime.lastError.message });
            return;
          }
          // Mark as auto-installing
          chrome.storage.local.set({ 'vigil_autoinstall': { downloadId: downloadId, version: upd.remoteVersion, startedAt: Date.now() } });
          // Send Chrome notification
          var notifOptions = {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'JARVIS Auto-Update: v' + upd.currentVersion + ' → v' + upd.remoteVersion,
            message: 'Installer downloaded to your Downloads folder. Double-click install-vigil-edge.bat to complete the update. The bat will replace Vigil AI and restart Edge automatically.',
            priority: 2
          };
          try { chrome.notifications.create('jarvis-update-' + Date.now(), notifOptions); } catch (e) {}
          sendResponse({ success: true, message: 'Installer downloaded. Run install-vigil-edge.bat from your Downloads folder.', downloadId: downloadId, version: upd.remoteVersion });
        });
      });
      break;

    case 'downloadVigilZip':
      chrome.downloads.download({
        url: 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/dist/extensions/vigil.zip',
        filename: 'vigil-extension.zip',
        saveAs: false
      }, function (downloadId) {
        sendResponse({ success: !chrome.runtime.lastError, downloadId: downloadId, message: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Downloading vigil-extension.zip...' });
      });
      break;

    case 'downloadVigilBat':
      chrome.downloads.download({
        url: 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/install-vigil-edge.bat',
        filename: 'install-vigil-edge.bat',
        saveAs: false
      }, function (downloadId) {
        sendResponse({ success: !chrome.runtime.lastError, downloadId: downloadId, message: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Downloading install-vigil-edge.bat...' });
      });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true; // Keep message channel open for async responses
});

/* ----------------------------------------------------------
 *  24/7 Keep-Alive Alarm
 * ---------------------------------------------------------- */

(function () {
  var ALARM_NAME = 'jarvis-keepalive';
  var ALARM_PERIOD = 0.4; // ~24 seconds

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;

    if (!globalThis.jarvisEngine) {
      globalThis.jarvisEngine = new JarvisEngine();
      console.log('[Vigil AI] Engine re-initialized by keepalive alarm');
    }

    try {
      chrome.storage.local.set({
        'jarvis_state': {
          commandCount: globalThis.jarvisEngine.commandCount || 0,
          heartbeatCount: globalThis.jarvisEngine.state.heartbeatCount || 0,
          mood: globalThis.jarvisEngine.state.mood || 'focused',
          lastAlive: Date.now()
        }
      });
    } catch (e) { /* ignore storage errors */ }
  });

  chrome.storage.local.get('jarvis_state', function (data) {
    if (data && data.jarvis_state) {
      console.log('[Vigil AI] Restored — last alive: ' + new Date(data.jarvis_state.lastAlive).toISOString());
    }
  });

  chrome.runtime.onInstalled.addListener(function (details) {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(function () {});
    console.log('[Vigil AI] Installed — 24/7 keepalive active, side panel enabled');
    // Auto-open side panel on fresh install so the user sees it immediately
    if (details.reason === 'install') {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs[0]) {
          chrome.sidePanel.open({ windowId: tabs[0].windowId }).catch(function () {});
        }
      });
    }
  });
})();

/* ----------------------------------------------------------
 *  Sovereign Auto-Update System
 *  Checks for new JARVIS version every 4 hours autonomously.
 *  No GitHub push needed — just run install-vigil-edge.bat
 *  when an update is detected.
 * ---------------------------------------------------------- */

(function () {
  var UPDATE_ALARM = 'jarvis-sovereign-update';
  var UPDATE_PERIOD = 240; // 4 hours in minutes
  var MANIFEST_URL = 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/extensions/jarvis/manifest.json';
  var BAT_URL = 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/install-vigil-edge.bat';
  var CURRENT_VERSION = '3.1.0';

  function parseVersion(v) {
    return (v || '0.0.0').split('.').map(function (n) { return parseInt(n, 10) || 0; });
  }

  function isNewer(remote, local) {
    var r = parseVersion(remote), l = parseVersion(local);
    for (var i = 0; i < 3; i++) {
      if (r[i] > l[i]) return true;
      if (r[i] < l[i]) return false;
    }
    return false;
  }

  function autoInstallUpdate(remote) {
    // Auto-download the BAT installer silently
    chrome.downloads.download({
      url: BAT_URL,
      filename: 'install-vigil-edge.bat',
      saveAs: false
    }, function (downloadId) {
      var didError = !!chrome.runtime.lastError;
      var status = {
        available: true,
        autoInstalled: !didError,
        downloadId: downloadId || null,
        currentVersion: CURRENT_VERSION,
        remoteVersion: remote,
        detectedAt: Date.now(),
        note: didError ? 'Auto-download failed — run bat manually' : 'BAT downloaded to Downloads folder. Double-click it to complete update.'
      };
      chrome.storage.local.set({ 'jarvis_update': status });

      // Send Chrome notification
      var msg = didError
        ? 'Update to v' + remote + ' available — download install-vigil-edge.bat manually and run it.'
        : 'Installer downloaded to Downloads. Double-click install-vigil-edge.bat — Edge will reload with v' + remote + ' automatically.';
      try {
        chrome.notifications.create('jarvis-update-' + Date.now(), {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '⚡ JARVIS Update: v' + CURRENT_VERSION + ' → v' + remote,
          message: msg,
          priority: 2
        });
      } catch (e) { /* notifications may not be available */ }

      console.log('[Vigil AI] Sovereign auto-install: ' + (didError ? 'FAILED' : 'BAT downloaded, id=' + downloadId));
    });
  }

  function checkForUpdate() {
    fetch(MANIFEST_URL, { cache: 'no-store' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var remote = data.version || '0.0.0';
        if (isNewer(remote, CURRENT_VERSION)) {
          console.log('[Vigil AI] Sovereign update available: ' + CURRENT_VERSION + ' → ' + remote + '. Auto-installing...');
          autoInstallUpdate(remote);
        } else {
          console.log('[Vigil AI] Sovereign update check: up to date (' + CURRENT_VERSION + ')');
          chrome.storage.local.set({ 'jarvis_update': { available: false, remoteVersion: remote, checkedAt: Date.now() } });
        }
      })
      .catch(function (e) {
        console.log('[Vigil AI] Sovereign update check failed (offline?): ' + e.message);
      });
  }

  // Create the update alarm
  chrome.alarms.create(UPDATE_ALARM, { delayInMinutes: 1, periodInMinutes: UPDATE_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === UPDATE_ALARM) checkForUpdate();
  });

  // Also run once on startup after a short delay
  setTimeout(checkForUpdate, 15000);
})();
