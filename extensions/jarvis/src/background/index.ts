/* ============================================================
 *  VIGIL AI — Background Service Worker v16.0
 *  React + TypeScript + Vite architecture
 * ============================================================ */

import { NeurochemistryEngine } from './neuro-chemistry.js';
import { MASTER, WN, DISD, phi, Phi } from './engines/index.js';
import { extractArticle } from './skills/readability';
import {
  saveHighlight, getHighlights, deleteHighlight, exportHighlights,
} from './skills/highlights';
import type { HighlightEntry } from './skills/highlights';
import { downloadPdf } from './skills/pdf';
import { downloadExcel } from './skills/excel';
import { draftEmail } from './skills/email';
import {
  dbAddNote, dbGetNotes, dbDeleteNote,
  dbAddDocument, dbGetDocuments,
  dbAddTempleEntry, dbGetTempleEntries, dbAddConversation,
} from './db';
import type { Note, JarvisDocument, TempleEntry } from './types';
import { missionEngine } from './mission-engine.js';
import { pse } from './pattern-synthesis-engine.js';
/* No static solus import — loaded lazily via getSolus() to exclude onnxruntime-web from main bundle */
import {
  saveMemory, getMemories, deleteMemory, memoryStats, encodeSpatialCoord,
} from './skills/memoryAI';
import {
  analyzePageText, persistAlerts, getAlertHistory, dismissAlert, clearAlerts,
} from './skills/sentryAI';
import {
  addPage as graphAddPage, getGraph, getRelated, clearGraph, graphStats,
} from './skills/knowledgeGraph';
import {
  phantomReadTab, getPhantomReads, synthesizeAcrossReads, clearPhantomReads,
} from './skills/phantom-meta';
import {
  initWorkflowSkill, getWorkflowState, workflowStatusText,
  startWorkflow, recordStep, WORKFLOW_INTENTS,
} from './skills/workflow';

/**
 * Route Solus calls through an offscreen document so onnxruntime-web
 * (2.8 MB) runs in a separate context and never inflates the service
 * worker bundle or its cold-start parse time.
 */
async function _solusOffscreen<T>(msg: Record<string, unknown>): Promise<T> {
  const offscreenUrl = chrome.runtime.getURL('src/offscreen/offscreen.html');
  try {
    const existing = await (chrome.offscreen as typeof chrome.offscreen & { hasDocument(): Promise<boolean> }).hasDocument();
    if (!existing) {
      await chrome.offscreen.createDocument({
        url: offscreenUrl,
        reasons: [chrome.offscreen.Reason.WORKERS],
        justification: 'Runs Solus offline AI (onnxruntime-web) to keep service worker bundle lean.',
      });
    }
  } catch { /* already open, or API unavailable */ }
  return new Promise<T>((resolve, reject) => {
    chrome.runtime.sendMessage(msg, r => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(r as T);
    });
  });
}

async function getSolus() {
  type R<T> = { success: boolean; message?: string } & T;
  return {
    solusLoad: () => _solusOffscreen<R<object>>({ action: '_solus_load' })
      .then(r => { if (!r.success) throw new Error(r.message); }),
    solusModelStatus: () => _solusOffscreen<R<{ status: Record<string, string>; ready: boolean }>>({ action: '_solus_status' }),
    solusIsReady: () => _solusOffscreen<R<{ ready: boolean }>>({ action: '_solus_status' }).then(r => r.ready),
    onSolusProgress: (_cb: unknown) => { /* progress events forwarded by offscreen doc directly */ },
    solusSummarize: (text: string) =>
      _solusOffscreen<R<{ summary?: string }>>({ action: '_solus_summarize', text })
        .then(r => { if (!r.success) throw new Error(r.message); return r.summary || ''; }),
    solusClassify: (text: string, labels: string[]) =>
      _solusOffscreen<R<{ result?: unknown }>>({ action: '_solus_classify', text, labels })
        .then(r => { if (!r.success) throw new Error(r.message); return r.result; }),
    solusAnswer: (context: string, question: string) =>
      _solusOffscreen<R<{ answer?: string; score?: number }>>({ action: '_solus_answer', context, question })
        .then(r => { if (!r.success) throw new Error(r.message); return { answer: r.answer || '', score: r.score || 0 }; }),
  };
}

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const NEURO_PHI = 1.618033988749895;
const NEURO_DECAY = 0.95;

/* ----------------------------------------------------------
 *  Inbox — Vigil's proactive outbox to the user
 *  In-memory, capped at 100 items per session.
 * ---------------------------------------------------------- */

type InboxCategory = 'tab' | 'agent' | 'clipboard' | 'insight' | 'alert';

interface InboxItem {
  id: string;
  category: InboxCategory;
  title: string;
  body: string;
  meta?: string;
  timestamp: number;
  read: boolean;
}

const _inbox: InboxItem[] = [];
const MAX_INBOX = 100;

function pushToInbox(item: Omit<InboxItem, 'id' | 'read'>) {
  const entry: InboxItem = { ...item, id: 'i-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), read: false };
  _inbox.unshift(entry);
  if (_inbox.length > MAX_INBOX) _inbox.pop();
  chrome.runtime.sendMessage({ action: '_inboxPush', item: entry }).catch(() => {});
}

/* ----------------------------------------------------------
 *  NeuroCore — MiniHeart + MiniBrain + MetaCardiacModel + MetaThoughtModel
 * ---------------------------------------------------------- */

class MiniHeart {
  workerName: string;
  birthTime: number;
  pulseCount = 0;
  latencyRing: number[] = [];
  latencyRingMax = 50;
  avgLatencyMs = 0;
  peakLatencyMs = 0;
  messageCount = 0;
  errorCount = 0;
  healthScore = 100;
  degraded = false;
  _lastProcessStart = 0;

  constructor(name: string) {
    this.workerName = name;
    this.birthTime = Date.now();
  }

  startProcess() { this._lastProcessStart = Date.now(); }
  endProcess() {
    if (!this._lastProcessStart) return;
    const latency = Date.now() - this._lastProcessStart;
    this._lastProcessStart = 0;
    this.messageCount++;
    this.latencyRing.push(latency);
    if (this.latencyRing.length > this.latencyRingMax) this.latencyRing.shift();
    if (latency > this.peakLatencyMs) this.peakLatencyMs = latency;
    this.avgLatencyMs = Math.round(this.latencyRing.reduce((a, b) => a + b, 0) / this.latencyRing.length * 100) / 100;
  }
  pulse() {
    this.pulseCount++;
    const latencyPenalty = Math.min(this.avgLatencyMs / 100, 30);
    const errorPenalty = Math.min(this.errorCount * 2, 30);
    const uptimeBonus = Math.min(this.pulseCount / 100, 10);
    this.healthScore = Math.round(Math.max(0, Math.min(100, 100 - latencyPenalty - errorPenalty + uptimeBonus)));
    this.degraded = this.healthScore < 60;
    return this.healthScore;
  }
  getVitals() {
    return { health: this.healthScore, degraded: this.degraded, pulse: this.pulseCount, uptime: Date.now() - this.birthTime, avgLatencyMs: this.avgLatencyMs, peakLatencyMs: Math.round(this.peakLatencyMs * 100) / 100, messages: this.messageCount, errors: this.errorCount };
  }
}

class MiniBrain {
  workerName: string;
  pathways: Record<string, { stimulus: string; weight: number; fires: number; lastFired: number; created: number }> = Object.create(null);
  thoughts: { id: string; stimulus: string; strength: number; awareness: number; timestamp: number }[] = [];
  maxThoughts = 100;
  totalStimuli = 0;
  totalDecisions = 0;
  learningRate = 0.1;
  awarenessLevel = 0;

  constructor(name: string) { this.workerName = name; }

  stimulus(type: string) {
    this.totalStimuli++;
    this.awarenessLevel = Math.min(100, Math.round(Math.log(this.totalStimuli + 1) / Math.log(NEURO_PHI) * 5));
    if (type === '__proto__' || type === 'constructor' || type === 'prototype') return null;
    if (!this.pathways[type]) this.pathways[type] = { stimulus: type, weight: 1.0, fires: 0, lastFired: 0, created: Date.now() };
    const pw = this.pathways[type];
    pw.fires++;
    pw.lastFired = Date.now();
    pw.weight = Math.min(10.0, pw.weight + this.learningRate);
    // O(n) decay only every 10 stimuli — amortizes cost as pathway count grows
    if (this.totalStimuli % 10 === 0) {
      for (const k in this.pathways) { if (k !== type) this.pathways[k].weight = Math.max(0.1, this.pathways[k].weight * NEURO_DECAY); }
    }
    if (this.awarenessLevel > 30 && pw.fires % Math.ceil(NEURO_PHI * 10) === 0) {
      this.totalDecisions++;
      this.thoughts.push({ id: `T-${this.workerName}-${this.totalDecisions}`, stimulus: type, strength: pw.weight, awareness: this.awarenessLevel, timestamp: Date.now() });
      if (this.thoughts.length > this.maxThoughts) this.thoughts.shift();
    }
    return pw;
  }
  getStrongestPathway() {
    let best = null, bestW = 0;
    for (const k in this.pathways) { if (this.pathways[k].weight > bestW) { bestW = this.pathways[k].weight; best = this.pathways[k]; } }
    return best;
  }
  getState() {
    let c = 0, tw = 0;
    for (const k in this.pathways) { c++; tw += this.pathways[k].weight; }
    const s = this.getStrongestPathway();
    return { awareness: this.awarenessLevel, pathways: c, avgWeight: c > 0 ? Math.round(tw / c * 100) / 100 : 0, totalStimuli: this.totalStimuli, totalDecisions: this.totalDecisions, recentThoughts: this.thoughts.slice(-5), strongestPathway: s ? s.stimulus : null };
  }
}

class MetaCardiacModel {
  sinusRate = 1.0; vagalTone = 0.5; sympatheticDrive = 0.5;
  autonomicBalance = 0; cardiacOutput = 1.0; beatsAnalyzed = 0;
  hrvBuffer: number[] = []; arrhythmiaCount = 0;

  beat(latencyMs: number, healthScore: number) {
    this.beatsAnalyzed++;
    const interval = latencyMs > 0 ? latencyMs : 1;
    this.hrvBuffer.push(interval);
    if (this.hrvBuffer.length > 30) this.hrvBuffer.shift();
    if (latencyMs > 50) { this.sympatheticDrive = Math.min(1.0, this.sympatheticDrive + 0.05); this.vagalTone = Math.max(0.1, this.vagalTone - 0.03); }
    else if (healthScore > 80) { this.vagalTone = Math.min(0.9, this.vagalTone + 0.02); this.sympatheticDrive = Math.max(0.1, this.sympatheticDrive - 0.02); }
    this.autonomicBalance = Math.round((this.sympatheticDrive - this.vagalTone) * 1000) / 1000;
    this.sinusRate = 0.5 + this.sympatheticDrive * 0.5;
    this.cardiacOutput = Math.round(this.sinusRate * (healthScore / 100) * 1000) / 1000;
    return this.cardiacOutput;
  }
  getMood() {
    const bal = this.autonomicBalance;
    if (bal > 0.3) return 'energized';
    if (bal < -0.3) return 'reflective';
    if (this.vagalTone > 0.7) return 'calm';
    return 'focused';
  }
  getState() {
    return { sinusRate: this.sinusRate, vagalTone: Math.round(this.vagalTone * 1000) / 1000, sympatheticDrive: Math.round(this.sympatheticDrive * 1000) / 1000, autonomicBalance: this.autonomicBalance, cardiacOutput: this.cardiacOutput, mood: this.getMood(), arrhythmias: this.arrhythmiaCount };
  }
}

class MetaThoughtModel {
  workerName: string;
  attentionMap: Record<string, number> = Object.create(null);
  temperature = 0.7;
  metaThoughts: unknown[] = [];
  chainOfThought: { stimulus: string; weight: number; time: number }[] = [];
  maxChainLength = 20;
  totalInferences = 0;
  focusTarget: string | null = null;
  cognitiveLoad = 0;

  constructor(name: string) { this.workerName = name; }

  attend(stimulus: string, weight: number) {
    if (stimulus === '__proto__' || stimulus === 'constructor' || stimulus === 'prototype') return;
    this.totalInferences++;
    this.attentionMap[stimulus] = (this.attentionMap[stimulus] || 0) + weight;
    const keys = Object.keys(this.attentionMap);
    // Use a manual max loop instead of Math.max(...spread) to avoid stack overflow on large maps
    let maxVal = -Infinity;
    for (const k of keys) { if (this.attentionMap[k] > maxVal) maxVal = this.attentionMap[k]; }
    const T = Math.max(this.temperature, 0.01);
    let expSum = 0;
    for (const k of keys) expSum += Math.exp((this.attentionMap[k] - maxVal) / T);
    let bestKey: string | null = null, bestScore = 0;
    for (const k of keys) {
      const score = Math.exp((this.attentionMap[k] - maxVal) / T) / expSum;
      if (score > bestScore) { bestScore = score; bestKey = k; }
    }
    this.focusTarget = bestKey;
    this.cognitiveLoad = Math.min(1, keys.length / 20);
    this.chainOfThought.push({ stimulus, weight, time: Date.now() });
    if (this.chainOfThought.length > this.maxChainLength) this.chainOfThought.shift();
    if (bestScore > 0.5) this.temperature = Math.max(0.1, this.temperature - 0.01);
    else this.temperature = Math.min(1.0, this.temperature + 0.01);
  }
  getState() {
    return { focus: this.focusTarget, temperature: Math.round(this.temperature * 1000) / 1000, cognitiveLoad: Math.round(this.cognitiveLoad * 1000) / 1000, totalInferences: this.totalInferences, attentionTargets: Object.keys(this.attentionMap).length, chainDepth: this.chainOfThought.length };
  }
}

class NeuroCore {
  workerName: string;
  heart: MiniHeart;
  brain: MiniBrain;
  cardiac: MetaCardiacModel;
  thought: MetaThoughtModel;

  constructor(name: string) {
    this.workerName = name;
    this.heart = new MiniHeart(name);
    this.brain = new MiniBrain(name);
    this.cardiac = new MetaCardiacModel();
    this.thought = new MetaThoughtModel(name);
  }
  onMessage(type: string) { this.heart.startProcess(); const pw = this.brain.stimulus(type); if (pw) this.thought.attend(type, pw.weight); }
  onMessageDone() { this.heart.endProcess(); }
  pulse() { const h = this.heart.pulse(); this.cardiac.beat(this.heart.avgLatencyMs, h); return this.getVitals(); }
  getVitals() { return { heart: this.heart.getVitals(), brain: this.brain.getState(), cardiac: this.cardiac.getState(), thought: this.thought.getState() }; }
  getMood() { return this.cardiac.getMood(); }
  getFocus() { return this.thought.focusTarget || 'awareness'; }
}

/* ----------------------------------------------------------
 *  Protocol Registry
 * ---------------------------------------------------------- */

const ProtocolRegistry = {
  agents: [
    { id: 'protocollum',  name: 'PROTOCOLLUM',  domain: 'Protocol governance and rule enforcement' },
    { id: 'terminalis',   name: 'TERMINALIS',   domain: 'Terminal operations and CLI orchestration' },
    { id: 'organismus',   name: 'ORGANISMUS',   domain: 'Organism lifecycle and biological modelling' },
    { id: 'mercator',     name: 'MERCATOR',     domain: 'Marketplace transactions and trade routing' },
    { id: 'orchestrator', name: 'ORCHESTRATOR', domain: 'Multi-agent coordination and task scheduling' },
    { id: 'mathematicus', name: 'MATHEMATICUS', domain: 'Mathematical computation and proof verification' },
    { id: 'synapticus',   name: 'SYNAPTICUS',   domain: 'Neural pathway simulation and learning models' },
    { id: 'substratum',   name: 'SUBSTRATUM',   domain: 'Infrastructure layer and substrate management' },
    { id: 'universum',    name: 'UNIVERSUM',    domain: 'Universal knowledge graph and ontology mapping' },
    { id: 'canistrum',    name: 'CANISTRUM',    domain: 'Canister deployment and Web3 smart contracts' },
  ],
  getAgent(id: string) { return this.agents.find(a => a.id === id) ?? null; },
  listAgents() { return this.agents.map(a => ({ id: a.id, name: a.name, domain: a.domain })); },
  routeToAgent(intent: string) {
    const mapping: Record<string, string> = {
      'search':'universum','navigate':'terminalis','create-document':'protocollum','create-pdf':'protocollum',
      'summarize':'synapticus','read-page':'synapticus','chat':'orchestrator','tab-switch':'terminalis',
      'tab-open':'terminalis','tab-close':'terminalis','list-tabs':'terminalis','open-url':'terminalis',
      'take-note':'organismus','list-notes':'organismus','delete-note':'organismus','screenshot':'substratum',
      'find-text':'universum','highlight':'universum','generate-pdf':'protocollum','generate-excel':'protocollum','draft-email':'organismus',
    };
    return this.getAgent(mapping[intent] || 'orchestrator');
  },
};

/* ----------------------------------------------------------
 *  VigilEngine
 * ---------------------------------------------------------- */

class VigilEngine {
  startTime = Date.now();
  commandCount = 0;
  commandHistory: unknown[] = [];
  maxHistory = 200;
  state = { initialized: true, heartbeatCount: 0, version: '17.0.0', agent: 'VIGIL', mood: 'focused', focus: 'awareness', vitals: null as unknown };
  neuro = new NeuroCore('animus');
  /** NeurochemistryEngine — ODE-based neurochemical simulation */
  neuroChem = new NeurochemistryEngine();
  /** Pattern Synthesis Engine — the centralized cognitive knowledge corpus */
  pse = pse;
  conversationMemory: { role: string; text: string; intent: string; timestamp: number }[] = [];
  maxMemory = 100;
  memoryTemple: Record<string, TempleEntry[]> = { research: [], theory: [], decisions: [], frameworks: [], insights: [] };
  maxTempleEntries = 200;
  topicGravity: Record<string, number> = Object.create(null);
  workflowState = { active: false, steps: [] as string[], stepIndex: 0, name: '' };

  constructor() {
    this._startHeartbeat();
    initWorkflowSkill();
    console.log('[VIGIL v19.0] Engine initialized — NeuroCore online, NeurochemistryEngine online (ODE/Hill/Jacobian), PSE online (' + pse.primitiveCount + ' primitives, ' + pse.domains.length + ' domains), WorkflowSkill online, Solus via offscreen, PHI=' + PHI + ' HEARTBEAT=' + HEARTBEAT + 'ms');
  }

  _startHeartbeat() {
    setInterval(() => {
      this.state.heartbeatCount++;
      this.state.vitals = this.neuro.pulse();
      this.state.mood = this.neuro.getMood();
      this.state.focus = this.neuro.getFocus();
      // Advance neurochemistry ODE one tick
      this.neuroChem.tick();
      // Sync derived mood from neurochemistry (overrides NeuroCore cardiac model)
      const np = this.neuroChem.getPersonality();
      this.state.mood = np.mood;
      // Keep MissionEngine in sync with Animus heartbeat and memory
      missionEngine.tick(this.state.heartbeatCount, this.conversationMemory.length);
    }, HEARTBEAT);
  }

  _recordCommand(raw: string, parsed: { intent: string; confidence: number }) {
    this.commandCount++;
    const entry = { id: this.commandCount, raw, intent: parsed.intent, confidence: parsed.confidence, timestamp: Date.now(), agent: ProtocolRegistry.routeToAgent(parsed.intent) };
    this.commandHistory.unshift(entry);
    if (this.commandHistory.length > this.maxHistory) this.commandHistory.pop();
    return entry;
  }

  getHistory() { return [...this.commandHistory]; }

  getStatus() {
    const uptime = Date.now() - this.startTime;
    const np = this.neuroChem.getPersonality();
    return { heartbeatCount: this.state.heartbeatCount, commandCount: this.commandCount, uptime, uptimeFormatted: this._formatUptime(uptime), version: this.state.version, agentCount: ProtocolRegistry.agents.length, mood: np.mood, focus: this.state.focus, neuro: this.state.vitals, awarenessLevel: this.neuro.brain.awarenessLevel, memoryTempleStats: this._getTempleStats(), memoryTurns: this.conversationMemory.length, neuroChem: this.neuroChem.getConcentrations(), neuroPersonality: { mood: np.mood, energy: np.energy, voice: np.voice, emoticon: np.emoticon, stateSummary: np.stateSummary, oDA: np.oDA, oSE: np.oSE, oNE: np.oNE, oCO: np.oCO, oACh: np.oACh, oOX: np.oOX } };
  }

  _formatUptime(ms: number) {
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + sec + 's';
  }

  _remember(role: string, text: string, intent: string) {
    this.conversationMemory.push({ role, text, intent: intent || 'chat', timestamp: Date.now() });
    if (this.conversationMemory.length > this.maxMemory) this.conversationMemory.shift();
    const stop: Record<string, number> = { the:1, a:1, an:1, is:1, i:1, you:1, me:1, my:1, it:1, to:1, in:1, of:1, and:1, or:1, do:1, what:1, how:1, can:1 };
    const tokens = (text || '').toLowerCase().split(/\s+/);
    for (const t of tokens) { const w = t.replace(/[^a-z0-9]/g, ''); if (w.length > 3 && !stop[w]) this.topicGravity[w] = (this.topicGravity[w] || 0) + 1; }
    if (role === 'user' && tokens.length >= 5) this._archiveToTemple(text, intent || 'chat', this.state.mood || 'focused');
    // also persist to Dexie async (non-blocking)
    dbAddConversation(role, text, intent || 'chat').catch(() => {});
  }

  _getRecentTopics(n = 5) {
    return Object.keys(this.topicGravity).sort((a, b) => (this.topicGravity[b] ?? 0) - (this.topicGravity[a] ?? 0)).slice(0, n);
  }

  _getLastUserMessage() {
    for (let i = this.conversationMemory.length - 1; i >= 0; i--) { if (this.conversationMemory[i].role === 'user') return this.conversationMemory[i]; }
    return null;
  }

  _getContextSummary() {
    const topics = this._getRecentTopics(3), turns = this.conversationMemory.length, last = this._getLastUserMessage();
    return { turnCount: turns, topics, lastIntent: last ? last.intent : null, lastText: last ? last.text.substring(0, 80) : null };
  }

  _archiveToTemple(text: string, intent: string, mood: string) {
    const lc = (text || '').toLowerCase();
    const entry: TempleEntry = { text: text.substring(0, 300), intent, mood, timestamp: Date.now() };
    const isResearch = /research|paper|study|data|evidence|source|reference|analysis|literature/i.test(lc);
    const isTheory = /theory|hypothesis|model|framework|principle|concept|idea|think|believe|pattern/i.test(lc);
    const isDecision = /decide|decision|build|create|implement|choose|going to|plan to|will/i.test(lc);
    const isFramework = /framework|blueprint|structure|template|workflow|process|system|architecture/i.test(lc);
    if (isResearch) this._addToTempleCategory('research', entry);
    else if (isFramework) this._addToTempleCategory('frameworks', entry);
    else if (isTheory) this._addToTempleCategory('theory', entry);
    else if (isDecision) this._addToTempleCategory('decisions', entry);
    else this._addToTempleCategory('insights', entry);
  }

  _addToTempleCategory(cat: string, entry: TempleEntry) {
    if (!this.memoryTemple[cat]) return;
    this.memoryTemple[cat].unshift(entry);
    if (this.memoryTemple[cat].length > this.maxTempleEntries) this.memoryTemple[cat].pop();
    dbAddTempleEntry(cat, entry).catch(() => {});
  }

  _getTempleContext(cat: string) { return (this.memoryTemple[cat] || []).slice(0, 5); }

  _getTempleStats() {
    const stats: Record<string, number> = {};
    let total = 0;
    for (const k in this.memoryTemple) { stats[k] = this.memoryTemple[k].length; total += this.memoryTemple[k].length; }
    return { stats, total };
  }

  parseCommand(natural: string) {
    const text = (natural || '').toLowerCase().trim();
    const tokens = text.split(/\s+/);
    let intent = 'chat', confidence = 0.3;
    const matchedKeywords: string[] = [], params: Record<string, unknown> = {};

    const intentMap = [
      { intent: 'tab-switch',      keywords: ['switch tab','go to tab','activate tab','change tab','focus tab'] },
      { intent: 'tab-open',        keywords: ['new tab','open tab','create tab','add tab'] },
      { intent: 'tab-close',       keywords: ['close tab','kill tab','remove tab','shut tab'] },
      { intent: 'open-url',        keywords: ['open url','go to','navigate to','visit','browse to','open site','open page'] },
      { intent: 'create-pdf',      keywords: ['create pdf','generate pdf','make pdf','export pdf','save pdf','pdf'] },
      { intent: 'generate-excel',  keywords: ['generate excel','create excel','make excel','create spreadsheet','generate spreadsheet','excel report'] },
      { intent: 'draft-email',     keywords: ['draft email','compose email','send email','write email','email to'] },
      { intent: 'take-note',       keywords: ['take note','save note','add note','write note','remember','note this','jot down'] },
      { intent: 'list-notes',      keywords: ['list notes','show notes','my notes','all notes','view notes','get notes'] },
      { intent: 'delete-note',     keywords: ['delete note','remove note','erase note','clear note'] },
      { intent: 'screenshot',      keywords: ['screenshot','screen capture','capture screen','snap','take screenshot','grab screen'] },
      { intent: 'read-page',       keywords: ['read page','read this','get content','page content','extract text','get text'] },
      { intent: 'summarize',       keywords: ['summarize','summary','tldr','brief','overview','digest'] },
      { intent: 'navigate',        keywords: ['navigate','go back','go forward','reload','refresh'] },
      { intent: 'search',          keywords: ['search','look up','find online','google','query','search for'] },
      { intent: 'create-document', keywords: ['create document','new document','make document','write document','draft'] },
      { intent: 'list-tabs',       keywords: ['list tabs','show tabs','all tabs','open tabs','tab list','which tabs'] },
      { intent: 'find-text',       keywords: ['find text','find on page','search page','ctrl f','locate text','find'] },
      { intent: 'highlight',       keywords: ['highlight','mark','emphasize','underline'] },
      { intent: 'workflow-build',      keywords: ['run build','build extension','build workflow','run workflow build','package extension','build vigil'] },
      { intent: 'workflow-deploy-icp', keywords: ['deploy icp','deploy to icp','deploy canister','push to icp','upload icp','deploy internet computer','canistrum deploy'] },
      { intent: 'workflow-status',     keywords: ['workflow status','workflow progress','build status','deploy status','what is the workflow'] },
      { intent: 'chat',            keywords: ['chat','talk','tell me','hey animus','animus','hello','help'] },
    ];

    for (const mapping of intentMap) {
      for (const kw of mapping.keywords) {
        if (text.indexOf(kw) !== -1) {
          intent = mapping.intent; confidence = 0.7 + (kw.length / text.length) * 0.3; matchedKeywords.push(kw); break;
        }
      }
      if (matchedKeywords.length > 0) break;
    }

    const urlMatch = text.match(/(?:https?:\/\/[^\s]+|www\.[^\s]+)/);
    if (urlMatch) { params['url'] = urlMatch[0]; if (intent === 'chat') { intent = 'open-url'; confidence = 0.8; } }

    const tabMatch = text.match(/tab\s*(?:#?\s*)?(\d+)/);
    if (tabMatch) params['tabIndex'] = parseInt(tabMatch[1], 10);

    if (intent === 'take-note') {
      let noteContent = text;
      for (const nkw of ['take note','save note','add note','write note','remember','note this','jot down']) {
        const idx = noteContent.indexOf(nkw);
        if (idx !== -1) { noteContent = noteContent.substring(idx + nkw.length).trim().replace(/^[:–\-]\s*/, ''); break; }
      }
      params['noteContent'] = noteContent || natural;
    }
    if (intent === 'delete-note') { const m = text.match(/(?:note\s*#?\s*|id\s*:?\s*)(\d+)/); if (m) params['noteId'] = parseInt(m[1], 10); }
    if (intent === 'search') { let sc = text; for (const sk of ['search for','search','look up','find online','google','query']) { const si = sc.indexOf(sk); if (si !== -1) { sc = sc.substring(si + sk.length).trim(); break; } } params['searchQuery'] = sc; }
    if (intent === 'find-text' || intent === 'highlight') { let fc = text; for (const fk of ['find text','find on page','search page','locate text','find','highlight','mark']) { const fi = fc.indexOf(fk); if (fi !== -1) { fc = fc.substring(fi + fk.length).trim(); break; } } params['query'] = fc; }
    if (intent === 'create-document' || intent === 'create-pdf') { let dc = text; for (const dk of ['create document','new document','make document','write document','draft','create pdf','generate pdf','make pdf','export pdf']) { const di = dc.indexOf(dk); if (di !== -1) { dc = dc.substring(di + dk.length).trim().replace(/^[:–\-]\s*/, ''); break; } } params['documentTitle'] = dc || 'Untitled Document'; params['documentContent'] = natural; }
    if (matchedKeywords.length > 1) confidence = Math.min(confidence * PHI, 1.0);

    const parsed = { raw: natural, intent, confidence: Math.round(confidence * 100) / 100, matchedKeywords, params, tokens, timestamp: Date.now() };
    this._recordCommand(natural, parsed);
    return parsed;
  }

  buildAction(parsed: ReturnType<VigilEngine['parseCommand']>) {
    const agent = ProtocolRegistry.routeToAgent(parsed.intent);
    const action: { type: string; agent: string; payload: Record<string, unknown>; timestamp: number } = { type: parsed.intent, agent: agent ? agent.name : 'ORCHESTRATOR', payload: {}, timestamp: Date.now() };
    switch (parsed.intent) {
      case 'tab-switch': action.payload['tabIndex'] = parsed.params['tabIndex'] || 1; break;
      case 'tab-open': action.payload['url'] = parsed.params['url'] || 'chrome://newtab'; break;
      case 'tab-close': action.payload['tabIndex'] = parsed.params['tabIndex'] || null; break;
      case 'open-url': action.payload['url'] = parsed.params['url'] || ''; break;
      case 'create-pdf': action.payload['title'] = parsed.params['documentTitle'] || 'Vigil Document'; action.payload['content'] = parsed.params['documentContent'] || ''; break;
      case 'take-note': action.payload['content'] = parsed.params['noteContent'] || parsed.raw; action.payload['author'] = 'Alfredo'; break;
      case 'delete-note': action.payload['noteId'] = parsed.params['noteId'] || null; break;
      case 'navigate': action.payload['direction'] = 'reload'; if (parsed.raw.indexOf('back') !== -1) action.payload['direction'] = 'back'; if (parsed.raw.indexOf('forward') !== -1) action.payload['direction'] = 'forward'; break;
      case 'search': action.payload['query'] = parsed.params['searchQuery'] || ''; break;
      case 'create-document': action.payload['title'] = parsed.params['documentTitle'] || 'Vigil Document'; action.payload['content'] = parsed.params['documentContent'] || ''; break;
      case 'find-text': case 'highlight': action.payload['query'] = parsed.params['query'] || ''; break;
      case 'generate-excel': action.payload['title'] = parsed.raw; break;
      case 'draft-email': action.payload['body'] = parsed.raw; break;
      default: action.payload['message'] = parsed.raw;
    }
    return action;
  }

  /* ── Tab operations ───────────────────────────────────────── */

  executeTabSwitch(tabIndex: number, callback: (r: { success: boolean; message: string }) => void) {
    chrome.tabs.query({}, tabs => {
      if (tabIndex < 1 || tabIndex > tabs.length) { callback({ success: false, message: 'Tab ' + tabIndex + ' out of range. ' + tabs.length + ' tabs open.' }); return; }
      const t = tabs[tabIndex - 1];
      if (t?.id) chrome.tabs.update(t.id, { active: true }, () => callback({ success: true, message: 'Switched to tab ' + tabIndex + ': ' + t.title }));
      else callback({ success: false, message: 'Tab not found.' });
    });
  }

  executeTabOpen(url: string, callback: (r: { success: boolean; message: string; tabId?: number }) => void) {
    chrome.tabs.create({ url: url || 'chrome://newtab' }, tab => callback({ success: true, message: 'Opened: ' + (url || 'New Tab'), tabId: tab.id }));
  }

  executeTabClose(tabIndex: number | null, callback: (r: { success: boolean; message: string }) => void) {
    if (tabIndex) {
      chrome.tabs.query({}, tabs => { const t = tabs[Math.max(0, Math.min(tabIndex - 1, tabs.length - 1))]; if (t?.id) chrome.tabs.remove(t.id, () => callback({ success: true, message: 'Closed tab ' + tabIndex + ': ' + t.title })); else callback({ success: false, message: 'Tab not found.' }); });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (tabs[0]?.id) chrome.tabs.remove(tabs[0].id, () => callback({ success: true, message: 'Closed current tab: ' + tabs[0].title })); });
    }
  }

  executeListTabs(callback: (r: { success: boolean; tabs?: unknown[]; message: string }) => void) {
    chrome.tabs.query({}, tabs => { callback({ success: true, tabs: tabs.map((t, i) => ({ index: i + 1, id: t.id, title: t.title || 'Untitled', url: t.url || '', active: t.active, favIconUrl: t.favIconUrl || '' })), message: tabs.length + ' tabs open' }); });
  }

  executeOpenUrl(url: string, callback: (r: { success: boolean; message: string }) => void) {
    if (!url) { callback({ success: false, message: 'No URL provided' }); return; }
    if (url.indexOf('://') === -1) url = 'https://' + url;
    chrome.tabs.create({ url }, () => callback({ success: true, message: 'Opened: ' + url }));
  }

  /* ── Notes (Dexie + chrome.storage fallback) ─────────────── */

  executeTakeNote(content: string, callback: (r: { success: boolean; message: string; note?: Note }) => void) {
    const note: Note = { id: Date.now(), content, author: 'Alfredo', timestamp: Date.now(), date: new Date().toISOString() };
    dbAddNote(note)
      .then(() => callback({ success: true, message: 'Note saved: "' + content.substring(0, 50) + '"', note }))
      .catch(() => {
        chrome.storage.local.get({ 'jarvis_notes': [] as Note[] }, data => {
          const notes: Note[] = data['jarvis_notes'] || [];
          notes.unshift(note);
          chrome.storage.local.set({ 'jarvis_notes': notes }, () => callback({ success: true, message: 'Note saved: "' + content.substring(0, 50) + '"', note }));
        });
      });
  }

  executeListNotes(callback: (r: { success: boolean; notes?: Note[]; message: string }) => void) {
    dbGetNotes()
      .then(notes => callback({ success: true, notes, message: notes.length + ' notes stored' }))
      .catch(() => chrome.storage.local.get({ 'jarvis_notes': [] as Note[] }, data => callback({ success: true, notes: data['jarvis_notes'] || [], message: (data['jarvis_notes'] || []).length + ' notes stored' })));
  }

  executeDeleteNote(noteId: number | null, callback: (r: { success: boolean; message: string }) => void) {
    if (noteId !== null) {
      dbDeleteNote(noteId)
        .then(ok => callback({ success: ok, message: ok ? 'Note deleted.' : 'Note not found.' }))
        .catch(() => callback({ success: false, message: 'Delete error.' }));
    } else {
      dbGetNotes().then(notes => {
        if (notes.length === 0) { callback({ success: false, message: 'No notes to delete.' }); return; }
        dbDeleteNote(notes[0].id)
          .then(() => callback({ success: true, message: 'Deleted most recent note.' }))
          .catch(() => callback({ success: false, message: 'Delete error.' }));
      });
    }
  }

  /* ── Screenshot ───────────────────────────────────────────── */

  executeScreenshot(callback: (r: { success: boolean; message: string; dataUrl?: string }) => void) {
    chrome.tabs.captureVisibleTab(null as unknown as number, { format: 'png' }, dataUrl => {
      if (chrome.runtime.lastError) { callback({ success: false, message: 'Screenshot failed: ' + chrome.runtime.lastError.message }); return; }
      const filename = 'jarvis-screenshot-' + new Date().toISOString().replace(/[:.]/g, '-') + '.png';
      chrome.downloads.download({ url: dataUrl, filename, saveAs: false }, () => callback({ success: true, message: 'Screenshot saved: ' + filename, dataUrl }));
    });
  }

  /* ── Page reading / summarize ─────────────────────────────── */

  executeReadPage(tabId: number, callback: (r: { success: boolean; pageData?: Record<string, unknown>; message: string }) => void) {
    chrome.scripting.executeScript({ target: { tabId }, func: () => {
      const headings: { tag: string; text: string }[] = [];
      document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h, i) => { if (i < 20) headings.push({ tag: h.tagName, text: (h as HTMLElement).innerText.substring(0, 100) }); });
      return { title: document.title, url: window.location.href, text: document.body.innerText.substring(0, 5000), headings, wordCount: document.body.innerText.split(/\s+/).length, linkCount: document.querySelectorAll('a').length, imageCount: document.querySelectorAll('img').length, metaDescription: (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '' };
    } }, results => {
      if (chrome.runtime.lastError) { callback({ success: false, message: 'Could not read page: ' + chrome.runtime.lastError.message }); return; }
      const pageData = results?.[0]?.result as Record<string, unknown>;
      if (pageData) callback({ success: true, pageData, message: 'Page read: ' + pageData['title'] + ' (' + pageData['wordCount'] + ' words)' });
      else callback({ success: false, message: 'No page data returned' });
    });
  }

  executeSummarize(tabId: number, callback: (r: { success: boolean; summary?: unknown; message: string }) => void) {
    this.executeReadPage(tabId, result => {
      if (!result.success || !result.pageData) { callback(result); return; }
      const pd = result.pageData;
      const sentences = ((pd['text'] as string) || '').split(/[.!?]+/).filter(s => s.trim().length > 20);
      const keyPoints = sentences.slice(0, 5).map(s => s.trim() + '.');
      const summary = { title: pd['title'], url: pd['url'], wordCount: pd['wordCount'], headingCount: (pd['headings'] as unknown[]).length, linkCount: pd['linkCount'], imageCount: pd['imageCount'], keyPoints, metaDescription: pd['metaDescription'] };
      callback({ success: true, summary, message: 'Summary of "' + pd['title'] + '": ' + pd['wordCount'] + ' words, ' + keyPoints.length + ' key points' });
    });
  }

  /* ── Navigate ─────────────────────────────────────────────── */

  executeNavigate(direction: string, tabId: number, callback: (r: { success: boolean; message: string }) => void) {
    if (direction === 'back') chrome.scripting.executeScript({ target: { tabId }, func: () => history.back() }, () => callback({ success: true, message: 'Navigated back' }));
    else if (direction === 'forward') chrome.scripting.executeScript({ target: { tabId }, func: () => history.forward() }, () => callback({ success: true, message: 'Navigated forward' }));
    else chrome.tabs.reload(tabId, () => callback({ success: true, message: 'Page reloaded' }));
  }

  /* ── Search ───────────────────────────────────────────────── */

  executeSearch(query: string, callback: (r: { success: boolean; message: string; sandboxQuery?: string }) => void) {
    if (!query) { callback({ success: false, message: 'No search query provided' }); return; }
    callback({ success: true, message: 'Opening sandbox search for: "' + query + '"', sandboxQuery: query });
  }

  /* ── Documents ────────────────────────────────────────────── */

  executeCreateDocument(title: string, content: string, callback: (r: { success: boolean; message: string; document?: JarvisDocument }) => void) {
    const doc: JarvisDocument = { id: Date.now(), title, content, author: 'Alfredo', type: 'document', timestamp: Date.now(), date: new Date().toISOString() };
    dbAddDocument(doc)
      .then(() => callback({ success: true, message: 'Document created: "' + title + '"', document: doc }))
      .catch(() => chrome.storage.local.get({ 'jarvis_documents': [] as JarvisDocument[] }, data => { const docs: JarvisDocument[] = data['jarvis_documents'] || []; docs.unshift(doc); chrome.storage.local.set({ 'jarvis_documents': docs }, () => callback({ success: true, message: 'Document created: "' + title + '"', document: doc })); }));
  }

  executeCreatePdf(title: string, content: string, _tabId: number | null, callback: (r: { success: boolean; message: string; document?: JarvisDocument }) => void) {
    const doc: JarvisDocument = { id: Date.now(), title: title || 'Vigil Document', content, author: 'Alfredo', type: 'pdf', timestamp: Date.now(), date: new Date().toISOString() };
    downloadPdf({ title: doc.title, content, author: 'Alfredo' });
    dbAddDocument(doc)
      .then(() => callback({ success: true, message: 'PDF generated: "' + doc.title + '"', document: doc }))
      .catch(() => callback({ success: true, message: 'PDF downloading: "' + doc.title + '"', document: doc }));
  }

  /* ── Find / Highlight ─────────────────────────────────────── */

  executeFindText(query: string, tabId: number, callback: (r: { success: boolean; found?: boolean; message: string }) => void) {
    chrome.scripting.executeScript({ target: { tabId }, func: (q: string) => window.find(q), args: [query] }, results => {
      if (chrome.runtime.lastError) { callback({ success: false, message: 'Find failed: ' + chrome.runtime.lastError.message }); return; }
      const found = results?.[0]?.result as boolean;
      callback({ success: true, found, message: found ? 'Found: "' + query + '"' : 'Not found: "' + query + '"' });
    });
  }

  executeHighlight(query: string, tabId: number, callback: (r: { success: boolean; count?: number; message: string }) => void) {
    chrome.scripting.executeScript({ target: { tabId }, func: (q: string) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let count = 0;
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) { if ((node as Text).nodeValue?.toLowerCase().indexOf(q.toLowerCase()) !== -1) nodes.push(node as Text); }
      for (const n of nodes) {
        const parent = n.parentNode; if (!parent) continue;
        const parts = (n.nodeValue || '').split(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'));
        for (const part of parts) { if (part.toLowerCase() === q.toLowerCase()) { const m = document.createElement('mark'); m.style.cssText = 'background:#6c63ff;color:#fff;padding:1px 3px;border-radius:2px'; m.textContent = part; parent.insertBefore(m, n); count++; } else parent.insertBefore(document.createTextNode(part), n); }
        parent.removeChild(n);
      }
      return count;
    }, args: [query] }, results => {
      if (chrome.runtime.lastError) { callback({ success: false, message: 'Highlight failed: ' + chrome.runtime.lastError.message }); return; }
      const count = results?.[0]?.result as number;
      callback({ success: true, count: count || 0, message: 'Highlighted ' + (count || 0) + ' occurrences of "' + query + '"' });
    });
  }

  /* ── Compound multi-action parser ────────────────────────── */
  // Detects every action-verb-object sequence in a single message and fires them all at once.
  // Detection is table-driven: adding a new primitive = one new row, nothing else.
  // Falls back to the single-intent chain if fewer than 2 distinct primitives are found.

  private _tryCompoundActions(
    raw: string, text: string, mood: string, awareness: number,
    callback: (r: { success: boolean; message: string; agent: string; mood: string; awareness: number }) => void
  ): boolean {

    type ActionItem = { type: string; topic?: string };

    // ── Primitive detection table ─────────────────────────────
    // Each entry: { type, match: verb+object RegExp, topicHint?: capture group RegExp }
    // The last non-empty capture group of topicHint becomes the topic.
    const PRIMITIVES: { type: string; match: RegExp; topicHint?: RegExp }[] = [
      // Agent / worker deployment
      {
        type: 'agent',
        match: /\b(deploy|send\s*out|launch|fire\s*off|dispatch|spin\s*up|get)\b.{0,40}\b(agent|worker|researcher|scout|crawler|bot)\b|research\s*agent|web\s*worker/i,
        topicHint: /\b(?:research(?:ing)?|on|about|for)\s+(?:the\s+latest\s+)?(.+?)(?:\s+and\b|\s+while\b|\s+then\b|\s*[,.]|$)/i,
      },
      // Open a new tab/window
      {
        type: 'open_tab',
        match: /\b(open|create|pull\s*up)\b.{0,20}\b(new\s+)?(tab|window)\b|\bnew\s+(tab|window)\b/i,
      },
      // Write / draft / compose
      {
        type: 'write',
        match: /\b(write\s*up|start\s*writing|let'?s\s*write|writing\s*tab|start\s*working\s*on|work\s*on|new\s*(?:doc|document|note|research)|draft|compose)\b/i,
        topicHint: /\b(?:on|about|for|working\s*on)\s+(.+?)(?:\s+and\b|\s+while\b|\s+then\b|\s*[,.]|$)/i,
      },
      // Scan / read / analyze current page
      {
        type: 'read_page',
        match: /\b(scan|read|look\s*at|check|analyze|pull\s*up)\b.{0,25}\b(this|the)\b.{0,20}\b(page|site|url|link|webpage)\b|\bthis\s+webpage\b|\brun\s+this\s+theory\b/i,
      },
      // Canister / ICP / Spinner
      {
        type: 'canister',
        match: /\b(canister|canisters|icp|internet\s*computer|spinner)\b|\bspin.{0,20}cryptograph/i,
      },
      // Check builds / agent status
      {
        type: 'build_check',
        match: /\b(check|inspect|look\s*at)\b.{0,25}\b(build|builds|status|progress)\b|build\s*status|check\s*on\s*(these|them|the\s*builds?)|report\s*back\b/i,
      },
      // Search for information
      {
        type: 'search',
        match: /\b(search\s*for|find\s*(?:info|information|results)\s*(?:on|about|for)?|look\s*up|pull\s*up\s*(?:info|results))\b/i,
        topicHint: /\b(?:search(?:ing)?\s*(?:for)?|look\s*up|find)\s+(.+?)(?:\s+and\b|\s+while\b|\s+then\b|\s*[,.]|$)/i,
      },
      // Navigate to a URL
      {
        type: 'navigate',
        match: /\b(go\s*to|navigate\s*to|open)\s+https?:\/\/\S+|\b(go\s*to|navigate\s*to)\b.{0,25}\b(site|page|url|link)\b/i,
        topicHint: /(https?:\/\/\S+)/i,
      },
      // Set a timer / reminder
      {
        type: 'timer',
        match: /\b(set\s*(?:a\s*)?timer|remind\s*me|set\s*an?\s*alarm)\b.{0,30}\b(\d+\s*(?:min|minute|hour|sec|second))/i,
        topicHint: /(\d+\s*(?:min|minute|hour|sec|second)[a-z]*)/i,
      },
      // Screenshot
      {
        type: 'screenshot',
        match: /\b(screenshot|capture\s*(?:the\s*)?screen|grab\s*(?:a\s*)?screenshot|snap\s*(?:a\s*)?screenshot)\b/i,
      },
      // Quick note
      {
        type: 'note',
        match: /\b(note\s*that|save\s*this|remember\s*this|jot\s*(?:this\s*)?down|take\s*a\s*note)\b/i,
        topicHint: /\b(?:note\s*that|save\s*this[:\s]+|jot\s*down[:\s]+)\s*(.+?)(?:\s+and\b|\s*[,.]|$)/i,
      },
      // Run / test a theory / hypothesis
      {
        type: 'theory',
        match: /\b(run\s*(?:this\s*)?theory|test\s*(?:this\s*)?hypothesis|explore\s*(?:this\s*)?idea|work\s*(?:on|through)\s*(?:a\s*)?theory)\b/i,
        topicHint: /\b(?:theory|hypothesis|idea)\s+(?:about\s+)?(.+?)(?:\s+and\b|\s*[,.]|$)/i,
      },
      // Dispatch / run a mission through the MissionEngine
      {
        type: 'mission',
        match: /\b(dispatch\s*mission|run\s*mission|launch\s*mission|mission\s*dispatch|send\s*mission)\b/i,
        topicHint: /\b(?:mission[:\s]+|dispatch[:\s]+)(.+?)(?:\s+and\b|\s*[,.]|$)/i,
      },
      // Query / report on a Domain AI
      {
        type: 'domain',
        match: /\b(domain\s*(?:ai|report|status)|(?:web|blockchain|data|sentry|context|commander)\s*ai\b|domain\s*ais?)\b/i,
        topicHint: /\b(web|blockchain|data|sentry|context|commander)\s*ai\b/i,
      },
      // PSE synthesis or stats
      {
        type: 'pse',
        match: /\b(pse\s*(?:stats|synthesis|report|status)|pattern\s*synthesis|synthesize\b)/i,
        topicHint: /\b(?:synthesize|synthesis\s*(?:of\s+)?)\s*(.+?)(?:\s+and\b|\s*[,.]|$)/i,
      },
      // NeuroCore / brain vitals
      {
        type: 'neuro',
        match: /\b(neuro(?:core)?\s*(?:status|vitals|report)|brain\s*vitals|neuro\s*health|heart(?:beat)?\s*vitals)\b/i,
      },
    ];

    // Run every primitive against the input
    const detected: ActionItem[] = [];
    const seenTypes = new Set<string>();
    for (const p of PRIMITIVES) {
      if (p.match.test(text) && !seenTypes.has(p.type)) {
        seenTypes.add(p.type);
        const topicM = p.topicHint ? text.match(p.topicHint) : null;
        const topic = topicM ? topicM.slice(1).filter(Boolean).pop()?.trim() : undefined;
        detected.push({ type: p.type, topic });
      }
    }

    // Not compound — let the single-intent chain handle it
    if (detected.length < 2) return false;

    // ── Execute every detected action ─────────────────────────
    const parts: string[] = [];

    for (const action of detected) {
      switch (action.type) {

        case 'agent': {
          const topic = action.topic || 'AI developments';
          chrome.runtime.sendMessage({
            action: 'deployAgent', agentType: 'researcher',
            mission: 'Research: ' + topic, target: topic,
          }, () => {});
          parts.push('sent a research agent out on "' + topic + '"');
          break;
        }

        case 'open_tab': {
          chrome.tabs.create({ url: 'chrome://newtab/' });
          parts.push('opened a new tab');
          break;
        }

        case 'write': {
          chrome.tabs.create({ url: 'chrome://newtab/' });
          if (action.topic) this.executeTakeNote('# ' + action.topic + '\n\n', () => {});
          parts.push('opened a writing space' + (action.topic ? ' for "' + action.topic + '"' : ''));
          break;
        }

        case 'read_page': {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
              this.executeSummarize(tabs[0].id, (result) => {
                chrome.runtime.sendMessage({
                  action: 'jarvis-status',
                  status: { message: result.message, agent: 'VIGIL', type: 'page-scan' },
                });
              });
            }
          });
          parts.push('scanning this page — will report back');
          break;
        }

        case 'canister': {
          // Route through CANISTRUM agent — starts the deploy-icp workflow natively
          const wfDef = WORKFLOW_INTENTS['workflow-deploy-icp'];
          startWorkflow('vigil:deploy-icp', []);
          parts.push(`routing to CANISTRUM — ICP deploy workflow queued. Run: node scripts/workflow-runner.js workflows/${wfDef.file}`);
          break;
        }

        case 'build_check': {
          chrome.runtime.sendMessage({ action: 'listAgents' }, (resp) => {
            const agents: { status: string; mission: string }[] = resp?.agents || [];
            const running = agents.filter(a => a.status === 'running');
            const complete = agents.filter(a => a.status === 'complete');
            const statusMsg = agents.length === 0
              ? 'everything\'s idle'
              : running.length + ' running, ' + complete.length + ' done' +
                (running.length > 0 ? ' — ' + running.map(a => a.mission.substring(0, 40)).join('; ') : '');
            chrome.runtime.sendMessage({
              action: 'jarvis-status',
              status: { message: 'Build check: ' + statusMsg, agent: 'VIGIL', type: 'build-check' },
            });
          });
          parts.push('checking on the builds — update incoming');
          break;
        }

        case 'search': {
          const q = action.topic || 'latest developments';
          this.executeSearch(q, () => {});
          parts.push('searching for "' + q + '"');
          break;
        }

        case 'navigate': {
          const url = action.topic || '';
          if (url.startsWith('http')) {
            chrome.tabs.create({ url });
            parts.push('opening ' + url);
          }
          break;
        }

        case 'timer': {
          const dur = action.topic || '5 minutes';
          this.executeChat('set timer ' + dur, () => {});
          parts.push('timer set for ' + dur);
          break;
        }

        case 'screenshot': {
          this.executeScreenshot(() => {});
          parts.push('capturing a screenshot');
          break;
        }

        case 'note': {
          const noteText = action.topic || raw;
          this.executeTakeNote(noteText, () => {});
          parts.push('saved a note');
          break;
        }

        case 'theory': {
          const t = action.topic || raw;
          this.executeChat('theory ' + t, () => {});
          parts.push('running that theory');
          break;
        }

        case 'mission': {
          const desc = action.topic || raw;
          missionEngine.dispatch(desc, { memoryTurns: this.conversationMemory.length, heartbeat: this.state.heartbeatCount })
            .then(({ missionId }) => {
              chrome.runtime.sendMessage({
                action: 'jarvis-status',
                status: { message: 'Mission dispatched — ID: ' + missionId, agent: 'VIGIL', type: 'mission' },
              });
            })
            .catch(() => {});
          parts.push('dispatching mission: "' + desc.substring(0, 40) + '"');
          break;
        }

        case 'domain': {
          const domainName = action.topic ? action.topic.toLowerCase() : 'all';
          const status = missionEngine.getStatus();
          const ais = missionEngine.getAvailableAIs();
          const filtered = domainName === 'all' ? ais : ais.filter(a => a.name.toLowerCase().includes(domainName));
          const aiLines = filtered.map(a => a.emoji + ' ' + a.name).join(', ');
          parts.push('domain AIs online: ' + (aiLines || 'all 6 AIs ready') + ' — ' + status.completedMissions + ' missions complete');
          break;
        }

        case 'pse': {
          const topic = action.topic || raw;
          const result = pse.synthesize(topic, this.state.mood || 'focused');
          parts.push('PSE synthesis — ' + Math.round(result.confidence * 100) + '% confidence across ' + result.domains.join(', '));
          break;
        }

        case 'neuro': {
          parts.push('running at ' + this.neuro.brain.awarenessLevel + '% awareness, mood ' + this.state.mood);
          break;
        }
      }
    }

    // ── One flowing response ──────────────────────────────────
    const openers = ['On it.', 'Already moving.', 'Done.', 'Got it.', 'Moving.'];
    const opener = openers[Math.floor(Math.random() * openers.length)];
    const actionStr = parts.length === 1
      ? parts[0]
      : parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1];
    const closing = /you and me|me and you|\bus\b|together/i.test(text)
      ? ' Talk to me.'
      : '';

    callback({
      success: true,
      message: opener + ' ' + actionStr.charAt(0).toUpperCase() + actionStr.slice(1) + '.' + closing,
      agent: 'VIGIL',
      mood,
      awareness,
    });
    return true;
  }

  /* ── Chat — 40-category brain ─────────────────────────────── */

  executeChat(message: string, callback: (r: { success: boolean; message: string; agent: string; mood: string; awareness: number }) => void) {
    const raw = (message || '').trim();
    const text = raw.toLowerCase();
    let response = '';
    const mood = this.neuro.getMood();
    const focus = this.neuro.getFocus();
    const awareness = this.neuro.brain.awarenessLevel;
    const heartbeat = this.state.heartbeatCount;
    const ctx = this._getContextSummary();
    let agent = 'VIGIL';
    const moodColor = mood === 'energized' ? '⚡' : mood === 'reflective' ? '🔮' : mood === 'calm' ? '🌊' : '🎯';
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const after = (trigger: string) => { const i = text.indexOf(trigger); if (i === -1) return ''; return raw.substring(i + trigger.length).trim().replace(/^[?:,\s]+/, ''); };
    const extractKeywords = (t: string) => { const stop = new Set(['the','a','an','is','i','you','me','my','it','to','in','of','and','or','do','what','how','can','be','that','this','are','was','for','so','ok','just','like','know','its','with']); return t.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(w => w.length > 2 && !stop.has(w)); };

    // ── Compound multi-action — fires first, before any single-intent matching ──
    if (this._tryCompoundActions(raw, text, mood, awareness, callback)) return;

    // Skills intents (new v4 categories)
    if (/generate (pdf|report|document)|create (pdf|report)|make (pdf|report)|pdf report/i.test(text)) {
      const title = after('generate pdf') || after('create pdf') || after('generate report') || after('make pdf') || 'Animus Report';
      downloadPdf({ title: title || 'Animus Report', content: `Report generated by Vigil AI v14.0 on ${new Date().toLocaleDateString()}\n\nTopic: ${raw}`, author: 'Alfredo' });
      response = moodColor + ' PDF report generating now. Check your downloads.\n\nTitle: "' + (title || 'Animus Report') + '"\nGenerated: ' + new Date().toLocaleString() + '\nSkill: jsPDF — formatted with Vigil branding.';
      agent = 'VIGIL • PROTOCOLLUM';
    } else if (/generate (excel|spreadsheet)|create (excel|spreadsheet)|make (excel|spreadsheet)|excel report/i.test(text)) {
      const title = after('generate excel') || after('create excel') || after('excel report') || 'Animus Report';
      downloadExcel({ title: title || 'Animus Report', author: 'Alfredo', sheets: [{ name: 'Report', columns: ['#', 'Item', 'Value', 'Notes'], rows: [[1, 'Generated by VIGIL v14.0', new Date().toLocaleDateString(), raw.substring(0, 50)]] }] }).catch(() => {});
      response = moodColor + ' Excel workbook generating now. Check your downloads.\n\nTitle: "' + (title || 'Animus Report') + '"\nSkill: ExcelJS — formatted workbook with Vigil theme.';
      agent = 'VIGIL • PROTOCOLLUM';
    } else if (/draft email|compose email|send email|write email|email to/i.test(text)) {
      const to = text.match(/(?:email|to|send to)\s+([\w.@]+)/)?.[1] || '';
      const subject = after('about') || after('subject') || 'Animus Draft';
      draftEmail({ to, subject: subject || 'Animus Draft', body: raw });
      response = moodColor + ' Opening your email client with the draft.\n\nTo: ' + (to || '[you fill in]') + '\nSubject: ' + (subject || 'Animus Draft') + '\nSkill: mailto: protocol — opens your default mail app.';
      agent = 'VIGIL • ORGANISMUS';

    // 0a. Mission dispatch — "dispatch mission: <description>" or "mission: ..."
    } else if (/^(dispatch mission|mission dispatch|run mission|launch mission|mission)[:\s]/i.test(text)) {
      const description = after('dispatch mission') || after('mission dispatch') || after('run mission') || after('launch mission') || after('mission') || raw;
      const urlMatch = raw.match(/https?:\/\/[^\s]+/);
      const target = urlMatch?.[0];
      agent = 'VIGIL • MISSION ENGINE';
      missionEngine.dispatch(description, { target, memoryTurns: this.conversationMemory.length, heartbeat: this.state.heartbeatCount })
        .then(({ report, missionId }) => {
          callback({ success: true, message: moodColor + ' Mission dispatched — ID: ' + missionId + '\n\n' + report, agent, mood, awareness });
        })
        .catch((err: Error) => {
          callback({ success: true, message: moodColor + ' Mission dispatch failed: ' + err.message, agent, mood, awareness });
        });
      return;

    // 0b. List missions
    } else if (/list missions|mission log|mission history|recent missions/i.test(text)) {
      const missions = missionEngine.listMissions(8);
      if (missions.length === 0) {
        response = moodColor + ' No missions dispatched yet. Try "dispatch mission: crawl https://example.com" or "mission: analyze this data pattern."';
      } else {
        const lines = missions.map(m => {
          const status = m.status === 'complete' ? '✅' : m.status === 'running' ? '🔄' : m.status === 'failed' ? '❌' : '⏳';
          return status + ' [' + m.id.substring(5, 13) + '] ' + m.domainAI + ' — ' + m.description.substring(0, 50);
        }).join('\n');
        response = moodColor + ' Mission log:\n\n' + lines;
      }
      agent = 'VIGIL • MISSION ENGINE';

    // 0c. Mission engine status
    } else if (/mission engine|engine status|domain ai|sovereign tools|tool license/i.test(text)) {
      const status = missionEngine.getStatus();
      const ais = missionEngine.getAvailableAIs();
      const aiLines = ais.map(a => a.emoji + ' ' + a.name + ' — ' + a.description).join('\n');
      response = moodColor + ' Mission Engine — ONLINE\n\n' +
        '🔑 License: ' + status.licensor + ' → ' + status.licensee + ' (' + status.licenseVersion + ')\n' +
        '🔧 Tools: ' + status.toolCount + ' across ' + status.families.join(', ') + '\n' +
        '📊 Missions: ' + status.completedMissions + ' complete · ' + status.failedMissions + ' failed · ' + status.activeMissions + ' active\n' +
        '💓 Heartbeat: #' + status.heartbeat + '\n\n' +
        '🤖 Domain AIs:\n' + aiLines + '\n\n' +
        'Use "dispatch mission: [description]" to send a mission.';
      agent = 'VIGIL • MISSION ENGINE';
    // ─── Workflow intents — routed through CANISTRUM / SUBSTRATUM ─────────────
    } else if (/workflow.*(build|status)|run\s+build|build\s+workflow|build\s+extension/i.test(text)) {
      const wf = WORKFLOW_INTENTS['workflow-build'];
      startWorkflow('vigil:build', []);
      response = moodColor + ' Build workflow queued. SUBSTRATUM → PROTOCOLLUM dispatch initiated.\n\n' +
        '**To execute:** `node scripts/workflow-runner.js workflows/build.json`\n\n' +
        'Steps: validate manifests → build extension → package zips → generate download links.\n' +
        'Same dispatch protocol as this engine.';
      agent = 'VIGIL • SUBSTRATUM';
    } else if (/deploy\s*(to\s*)?icp|icp\s*deploy|canistrum\s*deploy|deploy\s*canister|internet\s*computer\s*deploy/i.test(text)) {
      const wf = WORKFLOW_INTENTS['workflow-deploy-icp'];
      startWorkflow('vigil:deploy-icp', []);
      response = moodColor + ' ICP deploy workflow queued. CANISTRUM agent engaged.\n\n' +
        '**To execute:** `node scripts/workflow-runner.js workflows/deploy-icp.json`\n\n' +
        'Steps: check dfx → build extension → deploy canister to ic network → get live URL.\n\n' +
        'Deploys straight to the ICP runtime — no GitHub. No intermediary.';
      agent = 'VIGIL • CANISTRUM';
    } else if (/workflow\s*status|workflow\s*progress/i.test(text)) {
      const ws = getWorkflowState();
      response = moodColor + ' ' + workflowStatusText() +
        (ws.results.length > 0 ? '\n\nLast steps:\n' + ws.results.slice(-3).map(r => (r.success ? '✓' : '✗') + ' ' + r.action + ' — ' + r.message).join('\n') : '');
      agent = 'VIGIL • ORCHESTRATOR';
    } else if (/^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening)|howdy|hola|what up|whaddup)/i.test(text)) {
      const hour = new Date().getHours();
      const tod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      response = ctx.turnCount > 0
        ? pick(['What\'s on your mind?', 'Good to hear from you. What are we getting into?', 'Yeah, I\'m here. What\'s up?'])
        : pick(['Good ' + tod + '. What are you working on?', 'Hey. What\'s going on?', 'What\'s up? What are you thinking about?']);

    // 2. Status
    } else if (/how are you|how('?re| are) (you|things)|you good|you ok|what'?s your status/i.test(text)) {
      response = pick([
        'Good. What do you need?',
        'Running well. What\'s on your mind?',
        'All good. What are you working through?',
      ]);

    // 3. Who/What
    } else if (/who are you|what are you|what is vigil|what is jarvis|tell me about yourself|introduce yourself/i.test(text)) {
      response = 'I\'m VIGIL. I think things through with you — whatever you\'re working on, whatever you\'re trying to figure out. I don\'t just give answers, I reason through them. What do you want to get into?';

    // 4. Capabilities
    } else if (/what can you do|your (features|capabilities|abilities)|how can you help|what do you (do|know)/i.test(text)) {
      response = 'Pretty much anything you need. I can think through ideas with you, research topics, read pages, take notes, generate PDFs or spreadsheets, set timers, manage tabs, deploy research agents — or just have a real conversation. What do you actually need right now?';

    // 5. Protocols
    } else if (/protocol|alpha ai|alpha script|routing/i.test(text)) {
      response = 'There are 10 specialist AIs underneath — each one handles a different domain. PROTOCOLLUM for rules, MATHEMATICUS for math, SYNAPTICUS for learning, UNIVERSUM for knowledge, and so on. But you don\'t need to think about any of that. Just talk to me and things get routed where they need to go.';

    // 6. Sovereign
    } else if (/sovereign|organism|platform|what is this/i.test(text)) {
      response = 'This is your private AI platform — everything runs in your browser, nothing goes to a cloud. 27 extensions, a full reasoning engine, persistent memory. It\'s yours.';

    // 6b. v10 / Nexus / what\'s new
    } else if (/v1[456]|version 1[456]|vigil|what's new|nexus|command surface/i.test(text)) {
      response = 'v16 VIGIL CNS. New this version: NeurochemistryEngine (ODE/Hill/Jacobian — DA, 5-HT, NE, CO, ACh, OX), real personality resonance through every response, live neurochemical state in the brief, missing chat handler fixed. Say "neurochemistry" for the full live report.';
      agent = 'VIGIL • v14';

    // 7. Neurochemistry — explicit neuro report
    } else if (/neurochemist|neurochemical|dopamine|serotonin|norepinephrine|cortisol|acetylcholine|oxytocin/i.test(text)) {
      response = this.neuroChem.getReport();
      agent = 'VIGIL • NEUROCORE';

    // 7b. Neuro/Brain — quick vitals
    } else if (/brain|neuro|cognition|awareness|heart(beat)?|cardiac/i.test(text)) {
      const np = this.neuroChem.getPersonality();
      response = 'Running at ' + awareness + '% awareness. Neurochemical state: ' + np.stateSummary + ' — mood ' + np.mood + ', energy ' + np.energy + '%. Say "neurochemistry" for the full ODE report.';
      agent = 'VIGIL • SYNAPTICUS';

    // 8. AI/ML
    } else if (/what is (ai|artificial intelligence|machine learning|deep learning|llm|neural network)/i.test(text)) {
      response = 'AI at its core is pattern recognition at scale — finding structure in data, then using that structure to predict and decide. What you\'re building goes further than that though. What angle are you coming from?';

    // 9. Extension
    } else if (/what is an? extension|how do extensions work|browser extension/i.test(text)) {
      response = 'A browser extension is a program that lives inside Edge or Chrome. I run 24/7 — I\'m not sleeping between conversations. What do you want to know?';

    // 10. Updates
    } else if (/how do (updates|update) work|automatic update|update jarvis|new version|sovereign update/i.test(text)) {
      response = 'Every few hours I check for a new version automatically. If there\'s one, I download and notify you. You just run the installer. That\'s it.';

    // 11. Math
    } else if (/^[\d\s+\-*/().]+$/.test(text.replace(/\s/g, ''))) {
      try {
        const expr = text.replace(/[^0-9+\-*/().]/g, '');
        if (expr.length > 0 && expr.length < 100) { const result = Function('"use strict"; return (' + expr + ')')(); response = expr + ' = ' + result + '\n\nRouted through MATHEMATICUS.'; agent = 'VIGIL • MATHEMATICUS'; }
        else response = 'Expression too complex. Try "200 * 1.618".';
      } catch { response = 'Math error — try "100 / 4".'; }

    // 12. Time/Date
    } else if (/what time|what('?s| is) the (time|date|day)|current (time|date)/i.test(text)) {
      const now = new Date();
      response = 'It\'s ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' — ' + now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '.';

    // 12b. Brief / Briefing
    } else if (/^(brief|briefing|situational|status report|what'?s (going on|happening)|morning briefing)/i.test(text)) {
      const hour = new Date().getHours();
      const tod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      const now = new Date();
      const vitals2 = this.neuro.heart.getVitals();
      chrome.tabs.query({}, tabs2 => {
        const brief2 = 'Good ' + tod + '. It\'s ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '.\n\nHere\'s where things stand:\n• System health: ' + vitals2.health + '/100 — ' + (vitals2.degraded ? 'a bit stretched' : 'running well') + '\n• Heartbeat: #' + heartbeat + ' · Mood: ' + mood + ' · Awareness: ' + awareness + '%\n• Open tabs: ' + tabs2.length + '\n• Memory: ' + this.conversationMemory.length + '/100 turns\n• This session: ' + this.commandCount + ' exchanges\n\nAll 10 Alpha AIs ready. What feels most important to start with?';
        callback({ success: true, message: brief2, agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 12c. Timer / Reminder
    } else if (/set (a )?(timer|alarm|reminder|countdown)|remind me|timer (for|in)|in (\d+) (minute|hour|second)/i.test(text)) {
      const timeMatch = raw.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h|minute|min|m|second|sec|s)/i);
      if (!timeMatch) {
        response = 'Please specify a duration. For example: "Set a timer for 25 minutes" or "Remind me in 2 hours."';
      } else {
        const val = parseFloat(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        let minutes = unit.startsWith('h') ? val * 60 : unit.startsWith('s') ? val / 60 : val;
        const labelMatch = raw.match(/(?:for|called|labelled?|named?)\s+["']?([^"']+?)["']?\s*(?:in|\d|$)/i);
        const label = labelMatch?.[1]?.trim() || (raw.replace(/set (a )?(timer|alarm|reminder|countdown)|remind me|in \d+.*$/i, '').trim() || 'Timer');
        const cleanLabel = label.replace(/^(a |an |the )/i, '').substring(0, 40) || 'Timer';
        const alarmName = 'jarvis-timer-' + Date.now();
        chrome.alarms.create(alarmName, { delayInMinutes: minutes });
        chrome.storage.local.get(['jarvis_timers'], (d) => {
          const timers: Record<string, { label: string; finishAt: number; minutes: number }> = d['jarvis_timers'] || {};
          timers[alarmName] = { label: cleanLabel, finishAt: Date.now() + minutes * 60 * 1000, minutes };
          chrome.storage.local.set({ jarvis_timers: timers });
        });
        const h2 = Math.floor(minutes / 60);
        const m2 = Math.round(minutes % 60);
        const durStr = h2 > 0 ? (h2 + ' hour' + (h2 !== 1 ? 's' : '') + (m2 > 0 ? ' ' + m2 + 'm' : '')) : m2 + ' minute' + (m2 !== 1 ? 's' : '');
        response = '⏱ Timer set — "' + cleanLabel + '" — ' + durStr + '. I\'ll notify you the moment it completes.';
        agent = 'VIGIL • ORCHESTRATOR';
      }

    // 12d. List timers
    } else if (/list (timers?|alarms?|reminders?)|what timers?|active timers?|my timers?/i.test(text)) {
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number }> = d['jarvis_timers'] || {};
        const now2 = Date.now();
        const active = Object.entries(timers).filter(([, t]) => t.finishAt > now2);
        if (active.length === 0) {
          callback({ success: true, message: 'No active timers right now.', agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
          return;
        }
        const list2 = active.map(([, t]) => {
          const remaining = Math.ceil((t.finishAt - now2) / 60000);
          return '⏱ "' + t.label + '" — ' + remaining + 'm remaining';
        }).join('\n');
        callback({ success: true, message: 'Active timers:\n\n' + list2, agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 12e. Cancel timers
    } else if (/cancel (all )?(timers?|alarms?|reminders?)|stop (all )?(timers?|alarms?)/i.test(text)) {
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number }> = d['jarvis_timers'] || {};
        let count2 = 0;
        for (const name of Object.keys(timers)) { chrome.alarms.clear(name); count2++; }
        chrome.storage.local.set({ jarvis_timers: {} });
        callback({ success: true, message: count2 > 0 ? 'All ' + count2 + ' timer(s) cancelled.' : 'No timers to cancel.', agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 13. Joke
    } else if (/joke|make me (laugh|smile)|funny|humor/i.test(text)) {
      response = pick(['Why do programmers prefer dark mode? Because light attracts bugs.', 'There are 10 types of people: those who understand binary and those who don\'t.', 'Why did the AI get upgraded to React? Because class components were too stateful.', 'My code never has bugs. It just develops random features.']);

    // 14. Motivation
    } else if (/motivat|focus|i need (help|motivation|energy)|i'?m (tired|stuck|lost|overwhelmed)|can'?t do/i.test(text)) {
      const recentT = this._getRecentTopics(2);
      const threadRef = recentT.length > 0 ? ' You\'ve been deep in ' + recentT[0] + ' — that takes something out of you.' : '';
      response = pick([
        'That\'s real.' + threadRef + ' What\'s the one thing that actually needs to move today?',
        'Being stuck is usually information — something isn\'t clear yet, or something feels wrong about the direction.' + threadRef + ' What is it?',
        'You\'ve pushed through harder than this before.' + threadRef + ' What\'s the actual block?',
      ]);
      agent = 'VIGIL';

    // 15. Heartbeat
    } else if (/heartbeat|873|phi|golden/i.test(text)) {
      response = 'The 873ms heartbeat is the pulse of the Sovereign Organism.\n\n873ms × PHI ≈ 1413ms — recursive phi interval.\n\nIn v4.0 the heartbeat ticks the NeuroCore, updates mood/focus, writes state to Dexie, and keeps the service worker alive.\n\nCurrent heartbeat: #' + heartbeat + '. Organism is alive.';

    // 16. Tab count
    } else if (/how many tabs|tab count|open tabs/i.test(text)) {
      chrome.tabs.query({}, tabs => {
        callback({ success: true, message: 'You have ' + tabs.length + ' tab' + (tabs.length === 1 ? '' : 's') + ' open. Say "list tabs" to see them all.', agent: 'VIGIL • TERMINALIS', mood, awareness });
      });
      return;

    // 17. Explain
    } else if (/explain|what does|what do you mean by|define|meaning of/i.test(text)) {
      const topicE = after('explain') || after('what does') || after('define') || after('meaning of') || raw;
      const synE = this.pse.synthesize(topicE, mood);
      if (synE.confidence > 0.15) {
        response = synE.merged;
      } else {
        response = 'Tell me more about what you\'re asking — what\'s the context? That\'ll let me actually answer it instead of guessing.';
      }
      agent = 'VIGIL';

    // 18. Search
    } else if (/search for|look up|find me|who is|where is/i.test(text)) {
      const q = after('search for') || after('look up') || after('find me') || raw;
      response = 'Switching to VIGIL Intelligence — searching for "' + q + '".\n\nClick the 🔍 Search tab, or say "read page" to pull from what\'s open.';

    // 19. Commands list
    } else if (/what commands|show commands|list commands|commands (available|you know|can you)/i.test(text)) {
      response = 'VIGIL v14 commands:\n\n"list tabs" / "switch tab 2" / "close tab 3" / "new tab"\n"go to [url]"\n"take note: [text]" / "list notes" / "delete note"\n"screenshot"\n"read page" / "summarize"\n"generate pdf report" → PDF download\n"generate excel" → .xlsx download\n"draft email to [address]"\n"search for [topic]"\n"research [topic]" / "theory [idea]" / "framework [system]"\n"brainstorm [topic]" / "risk [thing]" / "what if [scenario]"\n\n🤖 SOVEREIGN AGENTS (9 types):\n"research [topic]" → researcher agent (Wikipedia + news)\n"crawl [url]" → spider agent (follows links, parallel fetch)\n"scrape [url]" → structured data extractor (tables, prices)\n"scout [url]" → quick deep scan + link map\n"digest: topic1, topic2…" → parallel multi-topic synthesis\n"deploy agent: monitor [url]" → tab-based site watcher\n"deploy agent: sweep [url1], [url2]" → multi-site sweep\n"list agents" / "recall agent" / "recall all agents"\n\n⚗️ AGI TOOLS (open AGI Tools tab):\n"summarize [url]" → fetch + extract any page\n"forge report" → compile all agent findings\nUse the ⚗️ AGI Tools tab for table extraction + source diff';

    // 19b. Sovereign Agent — deploy researcher
    } else if (/deploy agent.*research|agent.*research|research agent|send agent.*research/i.test(text)) {
      const topic = after('research') || after('deploy agent') || after('agent') || raw;
      const cleanTopic = topic.replace(/agent|deploy|research/gi, '').trim() || raw;
      chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'researcher', mission: 'Research: ' + cleanTopic, target: cleanTopic }, (resp) => {
        callback({ success: true, message: resp?.message || ('🤖 Research agent deploying for "' + cleanTopic + '". Switch to the Agents tab to watch progress.'), agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 19b2. Crawler agent
    } else if (/crawl|spider|deploy.*crawl|crawl agent|send agent.*crawl/i.test(text)) {
      const urlMatch = raw.match(/https?:\/\/[^\s]+/) || raw.match(/crawl\s+(\S+\.\S+)/i);
      const target = urlMatch?.[1] || urlMatch?.[0] || '';
      if (!target) { response = 'Specify a URL to crawl. Example: "crawl https://example.com"'; }
      else {
        const url = target.startsWith('http') ? target : 'https://' + target;
        chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'crawler', mission: 'Crawl: ' + url, target: url }, (resp) => {
          callback({ success: true, message: resp?.message || ('🕷 Crawler deployed for ' + url + '. Spidering the domain — all discovered pages incoming.'), agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
        });
        return;
      }

    // 19b3. Scraper agent
    } else if (/scrape|extract data|deploy.*scrap|scraper agent/i.test(text)) {
      const urlMatch = raw.match(/https?:\/\/[^\s]+/) || raw.match(/scrape\s+(\S+\.\S+)/i);
      const target = urlMatch?.[1] || urlMatch?.[0] || '';
      if (!target) { response = 'Specify a URL to scrape. Example: "scrape https://example.com"'; }
      else {
        const url = target.startsWith('http') ? target : 'https://' + target;
        chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'scraper', mission: 'Scrape: ' + url, target: url }, (resp) => {
          callback({ success: true, message: resp?.message || ('📋 Scraper deployed for ' + url + '. Extracting tables, lists, prices, and structured data.'), agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
        });
        return;
      }

    // 19b4. Scout agent
    } else if (/scout|quick scan|inspect url|deploy.*scout|scout agent/i.test(text)) {
      const urlMatch = raw.match(/https?:\/\/[^\s]+/) || raw.match(/scout\s+(\S+\.\S+)/i);
      const target = urlMatch?.[1] || urlMatch?.[0] || '';
      if (!target) { response = 'Specify a URL to scout. Example: "scout https://example.com"'; }
      else {
        const url = target.startsWith('http') ? target : 'https://' + target;
        chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'scout', mission: 'Scout: ' + url, target: url }, (resp) => {
          callback({ success: true, message: resp?.message || ('🔭 Scout deployed to ' + url + '. Quick deep scan + link map incoming.'), agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
        });
        return;
      }

    // 19b5. Digest agent
    } else if (/digest|synthesize topics|multi.?topic|deploy.*digest|digest agent/i.test(text)) {
      const topicsRaw = raw.replace(/digest|synthesize|deploy|agent/gi, '').replace(/[:,]/g, ',').trim();
      const topics = topicsRaw.split(',').map(s => s.trim()).filter(Boolean);
      if (topics.length < 2) { response = 'Specify multiple topics to digest. Example: "digest: blockchain, AI, climate"'; }
      else {
        chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'digest', mission: 'Digest: ' + topics.join(', '), target: topics }, (resp) => {
          callback({ success: true, message: resp?.message || ('⚗️ Digest agent deployed for ' + topics.length + ' topics. Parallel synthesis in progress.'), agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
        });
        return;
      }

    // 19b6. AGI Tool — summarize URL
    } else if (/summarize\s+(https?:\/\/\S+|this url|a url)|agi summarize/i.test(text)) {
      const urlMatch = raw.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) { response = 'Provide a URL to summarize. Example: "summarize https://example.com"'; }
      else {
        chrome.runtime.sendMessage({ action: 'agiSummarize', url: urlMatch[0] }, (resp) => {
          callback({ success: true, message: resp?.message || '(no result)', agent: 'VIGIL • AGI ENGINE', mood, awareness });
        });
        return;
      }

    // 19b7. AGI Tool — scout URL
    } else if (/scout (https?:\/\/\S+)|\bagi scout\b/i.test(text)) {
      const urlMatch = raw.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) { response = 'Provide a URL to scout.'; }
      else {
        chrome.runtime.sendMessage({ action: 'agiScout', url: urlMatch[0] }, (resp) => {
          callback({ success: true, message: resp?.message || '(no result)', agent: 'VIGIL • AGI ENGINE', mood, awareness });
        });
        return;
      }

    // 19b8. AGI Tool — forge report
    } else if (/forge report|knowledge forge|compile (all )?reports|synthesize (agent |all )?findings/i.test(text)) {
      chrome.runtime.sendMessage({ action: 'agiForgeReport' }, (resp) => {
        callback({ success: true, message: resp?.message || '(no agent reports yet)', agent: 'VIGIL • AGI ENGINE', mood, awareness });
      });
      return;

    // 19c. Sovereign Agent — deploy monitor
    } else if (/deploy agent.*monitor|monitor agent|agent.*monitor|watch (this |the )?site|watch (this |the )?page/i.test(text)) {
      const urlMatch = raw.match(/https?:\/\/[^\s]+/) || raw.match(/(?:monitor|watch)\s+(\S+\.\S+)/i);
      const target = urlMatch?.[1] || urlMatch?.[0] || 'https://example.com';
      const url = target.startsWith('http') ? target : 'https://' + target;
      chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'monitor', mission: 'Monitor: ' + url, target: url }, (resp) => {
        callback({ success: true, message: resp?.message || ('🤖 Monitor agent deployed for ' + url + '.'), agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 19d. Sovereign Agent — sweep multiple URLs
    } else if (/deploy agent.*sweep|sweep agent|agent.*sweep|send agent.*visit/i.test(text)) {
      const urlMatches = raw.match(/https?:\/\/[^\s,]+/g) || [];
      if (urlMatches.length === 0) {
        response = 'Specify URLs to sweep. Example: "deploy agent: sweep https://site1.com, https://site2.com"';
      } else {
        chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'sweep', mission: 'Sweep ' + urlMatches.length + ' sites', target: urlMatches }, (resp) => {
          callback({ success: true, message: resp?.message || ('🤖 Sweep agent deployed for ' + urlMatches.length + ' sites.'), agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
        });
        return;
      }

    // 19e. List agents
    } else if (/list agents|show agents|agent status|active agents|my agents/i.test(text)) {
      chrome.runtime.sendMessage({ action: 'listAgents' }, (resp) => {
        const agents: import('./index').SovereignAgentData[] = resp?.agents || [];
        if (agents.length === 0) {
          callback({ success: true, message: '🤖 No agents deployed yet. Say "deploy agent: research [topic]" to send one out.', agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
          return;
        }
        const lines = agents.map(a => {
          const icon = a.status === 'running' ? '🟢' : a.status === 'complete' ? '✅' : a.status === 'recalled' ? '⚡' : '❌';
          const step = a.status === 'running' ? ' [' + (a.currentStep + 1) + '/' + a.steps.length + ']' : '';
          return icon + ' ' + a.name + step + ' — ' + a.mission.substring(0, 60);
        }).join('\n');
        callback({ success: true, message: '🤖 Sovereign Agents:\n\n' + lines + '\n\nSay "recall agent" to abort, or check the Agents tab.', agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 19f. Recall agents
    } else if (/recall all agents|abort all agents|stop all agents/i.test(text)) {
      chrome.runtime.sendMessage({ action: 'recallAllAgents' }, (resp) => {
        callback({ success: true, message: resp?.message || 'All agents recalled.', agent: 'VIGIL • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 20. Thanks
    } else if (/thank|thanks|good job|nice|great|perfect|awesome|love (it|you)|appreciate/i.test(text)) {
      response = pick(['Glad that landed. What\'s next?', 'Of course — always. What else are you working through?', 'That means a lot. Anytime. What do you want to get into?']);

    // 21. Goodbye
    } else if (/bye|goodbye|see you|later|peace|close|shut down/i.test(text)) {
      response = pick(['Take care. I\'ll be here — heartbeat never stops.', 'See you soon. The 873ms pulse keeps running.', 'Rest well. Come back whenever — I\'ll pick up exactly where we left off.']);

    // 22. Page
    } else if (/this page|current page|what('?s| is) (on|here|this)|analyze/i.test(text)) {
      response = 'Hit the Screen tab and click "Read Text" — or just say "summarize this page" and I\'ll pull it for you.';

    // 23. Research
    } else if (/research|paper|study|literature|evidence|data|source|citation|academic|science/i.test(text)) {
      const q = after('research') || after('paper') || after('study') || raw;
      const prior = this._getTempleContext('research');
      const priorRef = prior.length > 0 ? ' We\'ve touched on this before — ' + prior[0].text.substring(0, 50) + '.' : '';
      response = 'What\'s the question you\'re actually trying to answer on "' + q.substring(0, 60) + '"?' + priorRef + ' That\'ll tell me whether we need to go broad first or go straight to the evidence.';
      agent = 'VIGIL';

    // 24. Theory
    } else if (/theory|hypothesis|model|principle|fundamental|first principles|axiom|assume|postulate/i.test(text)) {
      const q = after('theory') || after('hypothesis') || raw;
      const synT = this.pse.synthesize(q, mood);
      response = synT.confidence > 0.15 ? synT.merged + '\n\nWhat\'s your position on it?' : 'What\'s the core claim you\'re working from on "' + q.substring(0, 60) + '"? Start there and I\'ll help you stress-test it.';
      agent = 'VIGIL';

    // 25. Framework
    } else if (/framework|blueprint|structure|architecture|template|workflow|process design|playbook|system design/i.test(text)) {
      const q = after('framework') || after('blueprint') || after('architecture') || raw;
      response = 'What\'s it for? A good structure follows from the problem — if I know what "' + q.substring(0, 50) + '" actually needs to do, I can help you build something that holds.';
      agent = 'VIGIL';

    // 26. Memory
    } else if (/memory temple|what do you remember|what have we discussed|memory status|what do you know/i.test(text)) {
      const stats = this._getTempleStats();
      const topics = this._getRecentTopics(5);
      response = 'I have ' + stats.total + ' things stored — ' + stats.stats['research'] + ' research threads, ' + stats.stats['insights'] + ' insights, ' + stats.stats['decisions'] + ' decisions.' + (topics.length > 0 ? ' What\'s been pulling gravity lately: ' + topics.slice(0, 3).join(', ') + '.' : '') + ' Session: ' + ctx.turnCount + ' exchanges.';
      agent = 'VIGIL';

    // 27. Sovereign tools
    } else if (/sovereign tool|what tools|run tool|tool list|available tools|use tool/i.test(text)) {
      response = 'PDF reports, Excel workbooks, email drafts, voice input, a full workspace canvas, unlimited notes, and research agents that can crawl the web for you. Just say what you need and I\'ll do it.';

    // 28. Analysis
    } else if (/analyze|analysis|swot|evaluate|assess|critique|review|breakdown|break down/i.test(text)) {
      const q = after('analyze') || after('analysis') || after('swot') || raw;
      const synA = this.pse.synthesize(q, mood);
      response = synA.confidence > 0.15 ? synA.merged + '\n\nWhat decision does this feed into?' : 'What\'s the thing you\'re actually trying to decide on "' + q.substring(0, 60) + '"? Analysis is only useful if it points somewhere.';
      agent = 'VIGIL';

    // 29. Founder
    } else if (/who am i|what am i building|what is my role|what should i (do|focus|work|build)|my purpose|my mission/i.test(text)) {
      const topics = this._getRecentTopics(5);
      const threadStr = topics.length > 0 ? '\n\nBased on what we\'ve talked about, you\'re deep in: ' + topics.slice(0, 3).join(', ') + '.' : '';
      response = 'You\'re building something that thinks. Sovereign AI infrastructure — yours, on your machine, on your terms. The extensions, the protocols, VIGIL — it\'s all one system.' + threadStr + '\n\nWhat\'s the part you\'re trying to figure out right now?';
      agent = 'VIGIL';

    // 30. Mental Models
    } else if (/mental model|second order|inversion|circle of competence|occam|hanlon|pareto|80.20|latticework/i.test(text)) {
      const synMM = this.pse.synthesize(raw, mood);
      response = synMM.confidence > 0.15 ? synMM.merged : 'What\'s the situation? The right mental model depends on what you\'re actually trying to navigate — tell me what\'s going on and I\'ll apply the one that fits.';
      agent = 'VIGIL';

    // 31. Market
    } else if (/market|competitor|competitive|landscape|tam|sam|som|moat|positioning/i.test(text)) {
      const q = after('market') || after('competitor') || raw;
      const synMk = this.pse.synthesize(q, mood);
      response = synMk.confidence > 0.15 ? synMk.merged + '\n\nWhat\'s the angle — are you trying to find a gap, size the opportunity, or figure out positioning?' : 'What market are you looking at? Tell me what you\'re trying to understand about it and we\'ll work through it.';
      agent = 'VIGIL';

    // 32. Brainstorm
    } else if (/brainstorm|ideate|ideas|generate ideas|what if we|possibilities|options|alternatives|creative|innovate|come up with/i.test(text)) {
      const q = after('brainstorm') || after('ideas') || raw;
      response = 'What\'s the seed — what problem are we generating ideas for? Even a rough version of it will get us somewhere real.';
      agent = 'VIGIL';

    // 33. Risk
    } else if (/risk|what could go wrong|downside|failure mode|worst case|probability|mitigation|vulnerability/i.test(text)) {
      const q = after('risk') || after('what could go wrong') || raw;
      const synR = this.pse.synthesize(q, mood);
      response = synR.confidence > 0.15 ? synR.merged + '\n\nWhat\'s the thing you\'re most worried about?' : 'What\'s the thing you\'re trying to de-risk? Tell me what it is and I\'ll help you find the actual failure modes, not just the obvious ones.';
      agent = 'VIGIL';

    // 34. Root Cause
    } else if (/root cause|cause and effect|5 why|causal|what caused|stem from/i.test(text)) {
      const q = after('root cause') || after('why did') || raw;
      response = 'What\'s the symptom you\'re seeing? We can work backwards from there — the real cause is usually a few layers down from where it shows up.';
      agent = 'VIGIL';

    // 35. What-If
    } else if (/what if|scenario|futures|forecast|suppose|hypothetical|alternate|simulation/i.test(text)) {
      const q = after('what if') || after('scenario') || after('suppose') || raw;
      const synWI = this.pse.synthesize(q, mood);
      response = synWI.confidence > 0.15 ? synWI.merged + '\n\nWhat\'s the version of this you\'re most afraid of? That one usually has the most information.' : 'Run me through the scenario — what happens if it goes right, and what happens if it doesn\'t?';
      agent = 'VIGIL';

    // 36. Socratic
    } else if (/socratic|question me|challenge me|devil.?s advocate|push back|doubt|steelman|steel man/i.test(text)) {
      response = 'Tell me the claim you want challenged. I\'ll take the strongest opposing position I can find — not to be difficult, but because that\'s where the weak spots usually show up.';
      agent = 'VIGIL';

    // 37. Synthesis
    } else if (/connect|synthesize|synthesis|tie together|combine|overlap|how does.*relate|intersection|pattern across|dot.*connect/i.test(text)) {
      const topics = this._getRecentTopics(6);
      const synS = this.pse.synthesize(raw, mood);
      if (synS.confidence > 0.15) {
        response = synS.merged + (topics.length > 1 ? '\n\nConnects to what we\'ve been on: ' + topics.slice(0, 2).join(' and ') + '.' : '');
      } else {
        response = topics.length > 1 ? 'The thread I\'m seeing across ' + topics.slice(0, 3).join(', ') + ' — what do you think ties them together? I have a read on it but I want yours first.' : 'What are the two things you\'re trying to connect? Give me both and I\'ll find the through-line.';
      }
      agent = 'VIGIL';

    // 38. Build/Product
    } else if (/build this|build a|let.?s build|product idea|feature|mvp|prototype|user story|spec|requirements|product spec|roadmap/i.test(text)) {
      const q = after('build') || after('feature') || after('mvp') || raw;
      response = 'What\'s the problem it solves? Start there — "' + q.substring(0, 50) + '" is the what, but the why is what determines whether it\'s worth building.';
      agent = 'VIGIL';

    // 39. Estimation
    } else if (/estimate|back of envelope|order of magnitude|how many|how much would|calculate|revenue model|unit economics|cac|ltv|margin|burn rate|runway/i.test(text)) {
      const q = after('estimate') || after('calculate') || raw;
      const synE = this.pse.synthesize(q, mood);
      response = synE.confidence > 0.15 ? synE.merged : 'What do you need the number for? An order-of-magnitude answer is usually enough to make the decision — tell me what you\'re trying to figure out on "' + q.substring(0, 50) + '".';
      agent = 'VIGIL';

    // 40. INFP — feelings, values, meaning, authenticity
    } else if (/i feel|i'm feeling|feels like|i don'?t know (why|what|how)|what does it mean|what matters|purpose|values?|authentic|meaningful|why do i|why does this|something feels|not sure (why|what)|i wonder|does it even|is it worth|hard to explain/i.test(text)) {
      const topics = this._getRecentTopics(4);
      response = pick([
        'That\'s worth sitting with.' + (topics.length > 0 ? ' We\'ve been on ' + topics.slice(0, 2).join(', ') + ' — does this connect to that?' : ' What\'s the feeling underneath it?'),
        'I hear that. What would you call it if you had to name it — not the situation, the actual feeling underneath?',
        'That kind of not-knowing is usually information. What does it feel like it\'s pointing at?' + (topics.length > 0 ? ' Recent threads: ' + topics.slice(0, 2).join(', ') + '.' : ''),
      ]);
      agent = 'VIGIL';

    // 41. Deep think — explicit request to reason hard on a topic
    } else if (/^(think through|deep think|reason through|break down|explain deeply|go deep on|what do you think about|your thoughts on)/i.test(text)) {
      const topic = raw.replace(/^(think through|deep think|reason through|break down|explain deeply|go deep on|what do you think about|your thoughts on)\s*/i, '').trim() || raw;
      const result = this.pse.synthesize(topic, mood);
      if (result.confidence > 0.1) {
        response = result.merged;
        const contextThread = this._getRecentTopics(2);
        if (contextThread.length > 0) {
          response += '\n\nConnects to what we\'ve been on: ' + contextThread.join(' and ') + '.';
        }
      } else {
        response = 'What\'s the specific angle on "' + topic.substring(0, 60) + (topic.length > 60 ? '…' : '') + '"? Are you trying to understand the mechanics, or figure out what it means for something you\'re building?';
      }
      agent = 'VIGIL';

    // 42. Conversational fallback — synthesizes naturally, no commands needed
    } else {
      const kws = extractKeywords(raw);
      const topGravity = this._getRecentTopics(3);
      const recentTopics = ctx.topics.length > 0 ? ctx.topics : topGravity;

      if (kws.length === 0) {
        response = pick([
          'Here. What\'s on your mind?',
          'I\'m with you. What\'s up?',
          'Talk to me.',
        ]);
      } else {
        const synthesis = this.pse.synthesize(raw, mood);
        if (synthesis.confidence > 0.15) {
          const contextThread = recentTopics.length > 0 ? '\n\n' + (recentTopics.length > 1 ? 'Ties into ' + recentTopics.slice(0, 2).join(' and ') + '.' : 'Ties into what we\'ve been on: ' + recentTopics[0] + '.') : '';
          response = synthesis.merged + contextThread;
        } else {
          const contextHook = recentTopics.length > 0 ? 'What\'s the connection to ' + recentTopics[0] + '?' : 'What\'s the angle you\'re coming from?';
          response = raw.substring(0, 120) + (raw.length > 120 ? '…' : '') + '\n\n' + contextHook;
        }
        agent = 'VIGIL';
      }
    }

    // ── Silent PSE enrichment — runs after every intent, invisibly ──────────────
    // Animus synthesizes through knowledge on every substantive message.
    // No commands needed, no labels. It's just how he thinks.
    const _psekws = extractKeywords(raw);
    if (_psekws.length > 1 && response.length > 0) {
      const _enrichment = this.pse.synthesize(raw, mood);
      // Only enrich if: confidence is solid, the merged text adds something new,
      // and the response doesn't already contain the synthesis insight.
      if (_enrichment.confidence > 0.28 && _enrichment.merged.length > 40) {
        const _alreadyPresent = response.includes(_enrichment.merged.substring(0, 35));
        if (!_alreadyPresent) {
          response = response.trimEnd() + '\n\n' + _enrichment.merged;
        }
      }
    }

    callback({ success: true, message: response, agent, mood, awareness });
  }

  /* ── Sovereign Tools ──────────────────────────────────────── */

  executeSovereignTool(tool: string, params: Record<string, string>, callback: (r: { success: boolean; message: string; agent?: string }) => void) {
    switch (tool) {
      case 'quickNote': this.executeTakeNote(params['text'] || 'Untitled note', callback); break;
      case 'researchMode': this.executeChat('research ' + (params['topic'] || 'general'), callback); break;
      case 'theoryMode': this.executeChat('theory ' + (params['idea'] || 'general'), callback); break;
      case 'frameworkMode': this.executeChat('framework ' + (params['subject'] || 'general'), callback); break;
      case 'analyzeMode': this.executeChat('analyze ' + (params['subject'] || 'this'), callback); break;
      case 'mempleStatus': this.executeChat('memory temple', callback); break;
      case 'founderContext': this.executeChat('what am i building', callback); break;
      case 'readActivePage': chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (tabs[0]?.id) this.executeReadPage(tabs[0].id, callback); else callback({ success: false, message: 'No active tab' }); }); break;
      case 'summarizeActivePage': chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (tabs[0]?.id) this.executeSummarize(tabs[0].id, callback); else callback({ success: false, message: 'No active tab' }); }); break;
      case 'swotTool': callback({ success: true, message: '📊 SWOT: ' + (params['subject'] || 'Subject') + '\n\n💪 STRENGTHS\n⚠️ WEAKNESSES\n🚀 OPPORTUNITIES\n🔴 THREATS\n\nFill each dimension.', agent: 'VIGIL • UNIVERSUM' }); break;
      case 'decisionEngine': callback({ success: true, message: '⚡ Decision Engine: "' + (params['question'] || 'What to build next?') + '"\n\n【Criteria Matrix】 impact, effort, alignment, risk\n【10/10/10】 How feel in 10min, 10mo, 10yr?\n【Regret Minimization】 Which choice regret NOT making?', agent: 'VIGIL • ORCHESTRATOR' }); break;
      default: callback({ success: false, message: 'Unknown tool: ' + tool });
    }
  }

  /* ── Master Router ────────────────────────────────────────── */

  executeCommand(natural: string, tabId: number | null, callback: (r: Record<string, unknown>) => void) {
    const parsed = this.parseCommand(natural);
    const action = this.buildAction(parsed);
    this.neuro.onMessage(parsed.intent);
    this._remember('user', natural, parsed.intent);
    const wrapped = (result: Record<string, unknown>) => {
      this.neuro.onMessageDone();
      if (result?.['message']) this._remember('animus', result['message'] as string, parsed.intent);
      callback(result);
    };
    const getTabId = (cb: (id: number) => void) => {
      if (tabId) { cb(tabId); return; }
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (tabs[0]?.id) cb(tabs[0].id); });
    };

    switch (action.type) {
      case 'tab-switch': this.executeTabSwitch(action.payload['tabIndex'] as number, wrapped as Parameters<typeof this.executeTabSwitch>[1]); break;
      case 'tab-open': this.executeTabOpen(action.payload['url'] as string, wrapped as Parameters<typeof this.executeTabOpen>[1]); break;
      case 'tab-close': this.executeTabClose(action.payload['tabIndex'] as number | null, wrapped as Parameters<typeof this.executeTabClose>[1]); break;
      case 'open-url': this.executeOpenUrl(action.payload['url'] as string, wrapped as Parameters<typeof this.executeOpenUrl>[1]); break;
      case 'create-pdf': this.executeCreatePdf(action.payload['title'] as string, action.payload['content'] as string, tabId, wrapped as Parameters<typeof this.executeCreatePdf>[3]); break;
      case 'take-note': this.executeTakeNote(action.payload['content'] as string, wrapped as Parameters<typeof this.executeTakeNote>[1]); break;
      case 'list-notes': this.executeListNotes(wrapped as Parameters<typeof this.executeListNotes>[0]); break;
      case 'delete-note': this.executeDeleteNote(action.payload['noteId'] as number | null, wrapped as Parameters<typeof this.executeDeleteNote>[1]); break;
      case 'screenshot': this.executeScreenshot(wrapped as Parameters<typeof this.executeScreenshot>[0]); break;
      case 'read-page': getTabId(id => this.executeReadPage(id, wrapped as Parameters<typeof this.executeReadPage>[1])); break;
      case 'summarize': getTabId(id => this.executeSummarize(id, wrapped as Parameters<typeof this.executeSummarize>[1])); break;
      case 'navigate': getTabId(id => this.executeNavigate(action.payload['direction'] as string, id, wrapped as Parameters<typeof this.executeNavigate>[2])); break;
      case 'search': this.executeSearch(action.payload['query'] as string, wrapped as Parameters<typeof this.executeSearch>[1]); break;
      case 'create-document': this.executeCreateDocument(action.payload['title'] as string, action.payload['content'] as string, wrapped as Parameters<typeof this.executeCreateDocument>[2]); break;
      case 'list-tabs': this.executeListTabs(wrapped as Parameters<typeof this.executeListTabs>[0]); break;
      case 'find-text': getTabId(id => this.executeFindText(action.payload['query'] as string, id, wrapped as Parameters<typeof this.executeFindText>[2])); break;
      case 'highlight': getTabId(id => this.executeHighlight(action.payload['query'] as string, id, wrapped as Parameters<typeof this.executeHighlight>[2])); break;
      case 'generate-excel':
        downloadExcel({ title: action.payload['title'] as string || 'Report', author: 'Alfredo', sheets: [{ name: 'Sheet1', columns: ['Item', 'Value'], rows: [['Generated', new Date().toLocaleDateString()]] }] })
          .then(() => wrapped({ success: true, message: 'Excel report is downloading.' })).catch(() => wrapped({ success: false, message: 'Excel generation failed.' })); break;
      case 'draft-email':
        draftEmail({ body: action.payload['body'] as string });
        wrapped({ success: true, message: 'Opening email draft in your mail client.' }); break;
      case 'workflow-build':
      case 'workflow-deploy-icp':
      case 'workflow-status':
        this.executeChat(natural, wrapped as Parameters<typeof this.executeChat>[1]); break;
      case 'chat': this.executeChat(action.payload['message'] as string, wrapped as Parameters<typeof this.executeChat>[1]); break;
      default: this.executeChat(natural, wrapped as Parameters<typeof this.executeChat>[1]);
    }
  }
}

/* ----------------------------------------------------------
 *  V7 Sovereign Agent System
 *  9 agent types: researcher, monitor, sweep, crawler,
 *  scraper, watcher, digest, analyst, scout
 *  Parallel fetch engine — no tab overhead for fetch-capable agents
 *  Up to 10 concurrent agents
 * ---------------------------------------------------------- */

/* -- Parallel Fetch Engine (no tabs, CORS-exempt via host_permissions) -- */

class CrawlFetcher {
  static async fetchText(url: string, timeoutMs = 20000): Promise<string> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const resp = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'Accept': 'text/html,application/xhtml+xml,*/*', 'Accept-Language': 'en-US,en;q=0.9' },
      });
      clearTimeout(t);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const html = await resp.text();
      return CrawlFetcher.stripHtml(html);
    } catch (e) {
      clearTimeout(t);
      throw e;
    }
  }

  static async fetchRaw(url: string, timeoutMs = 20000): Promise<string> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.text();
    } catch (e) { clearTimeout(t); throw e; }
  }

  static stripHtml(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/\s{3,}/g, '\n\n').trim().substring(0, 14000);
  }

  static extractLinks(html: string, baseUrl: string): string[] {
    const base = (() => { try { return new URL(baseUrl); } catch { return null; } })();
    if (!base) return [];
    const links: string[] = [];
    const re = /href=["']([^"'#?][^"']*?)["']/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      try {
        const abs = new URL(m[1], baseUrl);
        if ((abs.protocol === 'http:' || abs.protocol === 'https:') && abs.hostname === base.hostname && abs.href !== baseUrl) links.push(abs.href);
      } catch { /* skip */ }
    }
    return [...new Set(links)].slice(0, 15);
  }

  static extractTables(html: string): string {
    const tables: string[] = [];
    const tableRe = /<table[\s\S]*?<\/table>/gi;
    let match;
    while ((match = tableRe.exec(html)) !== null) {
      const rows = (match[0].match(/<tr[\s\S]*?<\/tr>/gi) || []).map(row =>
        (row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || []).map(c => c.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean).join('\t')
      ).filter(Boolean);
      if (rows.length > 0) tables.push(rows.join('\n'));
    }
    return tables.length > 0 ? tables.join('\n\n---TABLE---\n\n') : '(no tables found)';
  }

  static extractStructured(html: string): string {
    const lines: string[] = [];
    // Headings
    (html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi) || []).slice(0, 10).forEach(h => {
      const text = h.replace(/<[^>]+>/g, '').trim();
      if (text) lines.push('## ' + text);
    });
    // Lists
    const listRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let lm;
    let listCount = 0;
    while ((lm = listRe.exec(html)) !== null && listCount < 20) {
      const t = lm[1].replace(/<[^>]+>/g, '').trim();
      if (t) { lines.push('• ' + t); listCount++; }
    }
    // Prices / numbers
    const prices = html.match(/\$[\d,]+(?:\.\d{2})?/g) || [];
    if (prices.length > 0) lines.push('\n💰 Prices found: ' + [...new Set(prices)].slice(0, 8).join(', '));
    // Dates
    const dates = html.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/g) || [];
    if (dates.length > 0) lines.push('📅 Dates: ' + [...new Set(dates)].slice(0, 6).join(', '));
    return lines.join('\n').substring(0, 4000);
  }

  static contentHash(text: string): string {
    let h = 0;
    for (let i = 0; i < Math.min(text.length, 4000); i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
    return h.toString(16);
  }

  static diffText(oldText: string, newText: string): string {
    const oldLines = new Set(oldText.split('\n').map(l => l.trim()).filter(Boolean));
    const newLines = newText.split('\n').map(l => l.trim()).filter(Boolean);
    const added = newLines.filter(l => !oldLines.has(l)).slice(0, 20);
    const removed = [...oldLines].filter(l => !newLines.includes(l)).slice(0, 20);
    if (added.length === 0 && removed.length === 0) return '(no significant changes detected)';
    let result = '';
    if (added.length > 0) result += '➕ Added:\n' + added.map(l => '  + ' + l).join('\n') + '\n\n';
    if (removed.length > 0) result += '➖ Removed:\n' + removed.map(l => '  - ' + l).join('\n');
    return result.trim();
  }

  static async fetchParallel(urls: string[]): Promise<{ url: string; text: string; ok: boolean }[]> {
    return Promise.all(urls.map(async url => {
      try { return { url, text: await CrawlFetcher.fetchText(url), ok: true }; }
      catch (e) { return { url, text: '(failed: ' + (e as Error).message + ')', ok: false }; }
    }));
  }
}

type AgentType = 'researcher' | 'monitor' | 'sweep' | 'crawler' | 'scraper' | 'watcher' | 'digest' | 'analyst' | 'scout';
type AgentStatus = 'queued' | 'running' | 'complete' | 'recalled' | 'failed';

interface AgentStep {
  url: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  extract: string;
  visitedAt?: number;
}

export interface SovereignAgentData {
  id: string;
  name: string;
  mission: string;
  type: AgentType;
  status: AgentStatus;
  steps: AgentStep[];
  currentStep: number;
  report: string;
  tabId?: number;
  startedAt: number;
  completedAt?: number;
  error?: string;
  watchAlarmName?: string;
}

/* -- Use fetch() for these types (no tab overhead, parallel) -- */
const FETCH_AGENT_TYPES: AgentType[] = ['crawler', 'scraper', 'digest', 'analyst', 'scout'];

class SovereignAgent {
  data: SovereignAgentData;
  private onComplete: (agent: SovereignAgentData) => void;
  private onProgress: (agent: SovereignAgentData) => void;

  constructor(
    id: string, name: string, mission: string, type: AgentType, steps: AgentStep[],
    onProgress: (a: SovereignAgentData) => void,
    onComplete: (a: SovereignAgentData) => void,
    watchAlarmName?: string,
  ) {
    this.data = { id, name, mission, type, status: 'queued', steps, currentStep: 0, report: '', startedAt: Date.now(), watchAlarmName };
    this.onProgress = onProgress;
    this.onComplete = onComplete;
  }

  async run() {
    this.data.status = 'running';
    this.onProgress(this.data);
    if (FETCH_AGENT_TYPES.includes(this.data.type)) {
      await this._runFetch();
    } else {
      await this._runTabs();
    }
  }

  /* -- Fetch-based runner (parallel, no tabs) -- */
  private async _runFetch() {
    if (this.data.type === 'crawler') {
      await this._runCrawler();
    } else if (this.data.type === 'scraper') {
      await this._runScraper();
    } else if (this.data.type === 'digest') {
      await this._runDigest();
    } else {
      // analyst, scout — parallel fetch
      for (let i = 0; i < this.data.steps.length; i++) {
        if (this.data.status === 'recalled') break;
        this.data.currentStep = i;
        const step = this.data.steps[i];
        step.status = 'running';
        this.onProgress(this.data);
        try {
          step.extract = this._summarize(await CrawlFetcher.fetchText(step.url), step.label, 700);
          step.status = 'done';
          step.visitedAt = Date.now();
        } catch (e) {
          step.extract = '(failed: ' + (e as Error).message + ')';
          step.status = 'failed';
        }
        this.onProgress(this.data);
      }
      this._finish();
    }
  }

  /* -- Crawler: fetch seed → extract links → crawl links in parallel -- */
  private async _runCrawler() {
    const seed = this.data.steps[0];
    if (!seed) { this._fail('No seed URL'); return; }
    seed.status = 'running';
    this.data.currentStep = 0;
    this.onProgress(this.data);

    let rawHtml = '';
    try {
      rawHtml = await CrawlFetcher.fetchRaw(seed.url);
      seed.extract = this._summarize(CrawlFetcher.stripHtml(rawHtml), seed.label, 600);
      seed.status = 'done';
      seed.visitedAt = Date.now();
    } catch (e) {
      seed.extract = '(failed: ' + (e as Error).message + ')';
      seed.status = 'failed';
    }
    this.onProgress(this.data);

    // Discover links from seed
    const links = CrawlFetcher.extractLinks(rawHtml, seed.url).slice(0, 8);
    const discovered = links.map((url, i) => ({
      url, label: 'Discovered page ' + (i + 1) + ': ' + (() => { try { return new URL(url).pathname; } catch { return url; } })(),
      status: 'pending' as const, extract: '',
    }));
    this.data.steps.push(...discovered);
    this.onProgress(this.data);

    // Crawl discovered links in parallel batches of 4
    if (this.data.status !== 'recalled') {
      const batches: AgentStep[][] = [];
      for (let i = 0; i < discovered.length; i += 4) batches.push(discovered.slice(i, i + 4));
      for (const batch of batches) {
        if (this.data.status === 'recalled') break;
        batch.forEach(s => { s.status = 'running'; this.data.currentStep = this.data.steps.indexOf(s); });
        this.onProgress(this.data);
        const results = await CrawlFetcher.fetchParallel(batch.map(s => s.url));
        results.forEach((r, j) => {
          batch[j].extract = r.ok ? this._summarize(r.text, batch[j].label, 400) : r.text;
          batch[j].status = r.ok ? 'done' : 'failed';
          batch[j].visitedAt = Date.now();
        });
        this.onProgress(this.data);
      }
    }

    this._finish();
  }

  /* -- Scraper: fetch URL, extract structured data (tables, lists, prices) -- */
  private async _runScraper() {
    for (let i = 0; i < this.data.steps.length; i++) {
      if (this.data.status === 'recalled') break;
      this.data.currentStep = i;
      const step = this.data.steps[i];
      step.status = 'running';
      this.onProgress(this.data);
      try {
        const raw = await CrawlFetcher.fetchRaw(step.url);
        const tables = CrawlFetcher.extractTables(raw);
        const structured = CrawlFetcher.extractStructured(raw);
        step.extract = '📋 STRUCTURED DATA:\n\n' + structured + '\n\n📊 TABLES:\n' + tables.substring(0, 1500);
        step.status = 'done';
        step.visitedAt = Date.now();
      } catch (e) {
        step.extract = '(failed: ' + (e as Error).message + ')';
        step.status = 'failed';
      }
      this.onProgress(this.data);
    }
    this._finish();
  }

  /* -- Digest: parallel fetch all URLs, synthesize across sources -- */
  private async _runDigest() {
    const urls = this.data.steps.map(s => s.url);
    this.data.steps.forEach(s => { s.status = 'running'; });
    this.onProgress(this.data);
    const results = await CrawlFetcher.fetchParallel(urls);
    results.forEach((r, i) => {
      this.data.steps[i].extract = r.ok ? this._summarize(r.text, this.data.steps[i].label, 500) : r.text;
      this.data.steps[i].status = r.ok ? 'done' : 'failed';
      this.data.steps[i].visitedAt = Date.now();
    });
    this.data.currentStep = this.data.steps.length - 1;
    this.onProgress(this.data);
    this._finish();
  }

  /* -- Tab-based runner (researcher, monitor, sweep, watcher) -- */
  private async _runTabs() {
    let tab: chrome.tabs.Tab | null = null;
    try {
      tab = await new Promise<chrome.tabs.Tab>(res => chrome.tabs.create({ url: 'about:blank', active: false }, res));
      this.data.tabId = tab.id;
    } catch { this._fail('Could not open background tab.'); return; }

    const tabId = tab.id!;
    for (let i = 0; i < this.data.steps.length; i++) {
      if (this.data.status === 'recalled') break;
      this.data.currentStep = i;
      const step = this.data.steps[i];
      step.status = 'running';
      this.onProgress(this.data);
      try {
        const text = await this._visitAndExtract(tabId, step.url);
        step.extract = this._summarize(text, step.label, 600);
        step.status = 'done';
        step.visitedAt = Date.now();
      } catch {
        step.extract = '(extraction failed)';
        step.status = 'failed';
      }
      this.onProgress(this.data);
    }
    try { chrome.tabs.remove(tabId); } catch { /* ignore */ }
    this.data.tabId = undefined;
    this._finish();
  }

  private _finish() {
    if (this.data.status === 'recalled') {
      this.data.report = '⚡ Agent recalled.\n\nPartial findings:\n\n' + this._buildReport();
    } else {
      this.data.status = 'complete';
      this.data.report = this._buildReport();
    }
    this.data.completedAt = Date.now();
    this.onComplete(this.data);
  }

  recall() {
    this.data.status = 'recalled';
    if (this.data.tabId) { try { chrome.tabs.remove(this.data.tabId); } catch { /* ignore */ } this.data.tabId = undefined; }
    if (this.data.watchAlarmName) { chrome.alarms.clear(this.data.watchAlarmName); }
  }

  private _fail(reason: string) {
    this.data.status = 'failed';
    this.data.error = reason;
    this.data.report = '❌ Agent failed: ' + reason;
    this.data.completedAt = Date.now();
    this.onComplete(this.data);
  }

  private _visitAndExtract(tabId: number, url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.tabs.update(tabId, { url }, () => {
        if (chrome.runtime.lastError) { reject(chrome.runtime.lastError.message); return; }
        const timeout = setTimeout(() => { chrome.tabs.onUpdated.removeListener(listener); reject('Timeout'); }, 30000);
        const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
          if (id !== tabId || info.status !== 'complete') return;
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeout);
          setTimeout(() => {
            chrome.scripting.executeScript({
              target: { tabId },
              func: () => {
                const main = document.querySelector('main,article,[role="main"],#content,#bodyContent,.post-content,.entry-content');
                const src = main || document.body;
                if (!src) return '';
                const clone = src.cloneNode(true) as HTMLElement;
                clone.querySelectorAll('nav,footer,script,style,noscript,aside,.ad,.advertisement').forEach(el => el.remove());
                return (clone.innerText || clone.textContent || '').replace(/\s{3,}/g, '\n\n').substring(0, 12000);
              },
            }, (r) => {
              if (chrome.runtime.lastError) { reject(chrome.runtime.lastError.message); return; }
              resolve((r?.[0]?.result as string) || '');
            });
          }, 600);
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    });
  }

  private _summarize(text: string, focus: string, maxLen: number): string {
    if (!text || text.length < 50) return '(no readable content)';
    const focusLow = focus.toLowerCase();
    const paras = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 40);
    const scored = paras.map(p => ({ p, score: focusLow.split(' ').reduce((s, kw) => s + (p.toLowerCase().includes(kw) ? 1 : 0), 0) }));
    scored.sort((a, b) => b.score - a.score);
    let result = '';
    for (const { p } of scored) { if ((result + p).length > maxLen) break; result += p + '\n\n'; }
    return result.trim() || paras.slice(0, 3).join('\n\n').substring(0, maxLen);
  }

  private _buildReport(): string {
    const done = this.data.steps.filter(s => s.status === 'done');
    if (done.length === 0) return '(no data extracted)';
    let r = '📋 VIGIL v14 SOVEREIGN AGENT REPORT\n';
    r += '🤖 ' + this.data.name + ' [' + this.data.type.toUpperCase() + '] — ' + this.data.mission + '\n';
    r += '⏱ ' + new Date(this.data.completedAt || Date.now()).toLocaleTimeString() + ' · ' + done.length + '/' + this.data.steps.length + ' sources\n\n━━━━━━━━━━━━━━━━━━━━━\n\n';
    for (const s of this.data.steps) {
      if (s.status !== 'done' || !s.extract) continue;
      r += '🌐 ' + s.label + '\n' + s.url + '\n\n' + s.extract + '\n\n━━━━━━━━━━━━━━━━━━━━━\n\n';
    }
    return r.trim();
  }
}

/* -- Agent Dispatcher (V7: 10 concurrent, 9 types) -- */

const MAX_AGENTS = 10;
const AGENT_NAMES = ['ALPHA-1', 'ALPHA-2', 'ALPHA-3', 'BETA-1', 'BETA-2', 'GAMMA-1', 'SIGMA-1', 'DELTA-1', 'OMEGA-1', 'ZETA-1'];

declare const globalThis: {
  jarvisEngine?: VigilEngine;
  agentDispatcher?: AgentDispatcher;
};

class AgentDispatcher {
  agents: Map<string, SovereignAgent> = new Map();
  history: SovereignAgentData[] = [];

  private _researchSteps(topic: string): AgentStep[] {
    const enc = encodeURIComponent(topic);
    const t = topic.toLowerCase();
    const steps: AgentStep[] = [
      { url: 'https://en.wikipedia.org/wiki/' + enc, label: 'Wikipedia: ' + topic, status: 'pending', extract: '' },
      { url: 'https://en.wikipedia.org/w/index.php?search=' + enc, label: 'Wikipedia Search', status: 'pending', extract: '' },
    ];
    if (/tech|code|software|api|ai|ml|model|framework/i.test(t)) steps.push({ url: 'https://dev.to/search?q=' + enc, label: 'DEV.to', status: 'pending', extract: '' });
    if (/stock|market|finance|crypto|invest/i.test(t)) steps.push({ url: 'https://finance.yahoo.com/search?p=' + enc, label: 'Yahoo Finance', status: 'pending', extract: '' });
    if (/health|medical|disease|drug/i.test(t)) steps.push({ url: 'https://www.mayoclinic.org/search/search-results?q=' + enc, label: 'Mayo Clinic', status: 'pending', extract: '' });
    if (/science|research|study|paper/i.test(t)) steps.push({ url: 'https://www.sciencedaily.com/search/?keyword=' + enc, label: 'ScienceDaily', status: 'pending', extract: '' });
    steps.push({ url: 'https://www.bbc.com/search?q=' + enc, label: 'BBC News', status: 'pending', extract: '' });
    return steps.slice(0, 4);
  }

  private _crawlerSteps(url: string): AgentStep[] {
    const safe = url.startsWith('http') ? url : 'https://' + url;
    return [{ url: safe, label: 'Seed: ' + (() => { try { return new URL(safe).hostname; } catch { return safe; } })(), status: 'pending', extract: '' }];
  }

  private _scraperSteps(url: string): AgentStep[] {
    const safe = url.startsWith('http') ? url : 'https://' + url;
    return [{ url: safe, label: 'Scrape: ' + safe, status: 'pending', extract: '' }];
  }

  private _monitorSteps(url: string): AgentStep[] {
    const safe = url.startsWith('http') ? url : 'https://' + url;
    return [
      { url: safe, label: 'Initial: ' + (() => { try { return new URL(safe).hostname; } catch { return safe; } })(), status: 'pending', extract: '' },
      { url: safe, label: 'Verification pass', status: 'pending', extract: '' },
    ];
  }

  private _digestSteps(topics: string[]): AgentStep[] {
    return topics.slice(0, 6).map(t => ({
      url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(t),
      label: 'Digest: ' + t, status: 'pending' as const, extract: '',
    }));
  }

  private _analystSteps(urls: string[]): AgentStep[] {
    return urls.slice(0, 8).map(u => {
      const safe = u.startsWith('http') ? u : 'https://' + u;
      return { url: safe, label: (() => { try { return new URL(safe).hostname; } catch { return safe; } })(), status: 'pending' as const, extract: '' };
    });
  }

  private _scoutSteps(url: string): AgentStep[] {
    const safe = url.startsWith('http') ? url : 'https://' + url;
    return [{ url: safe, label: 'Scout: ' + safe, status: 'pending', extract: '' }];
  }

  private _watcherSteps(url: string): AgentStep[] {
    const safe = url.startsWith('http') ? url : 'https://' + url;
    return [{ url: safe, label: 'Watch: ' + safe, status: 'pending', extract: '' }];
  }

  deploy(
    type: AgentType,
    mission: string,
    target: string | string[],
    onProgress: (d: SovereignAgentData) => void,
    onComplete: (d: SovereignAgentData) => void,
  ): SovereignAgentData | { error: string } {
    const running = [...this.agents.values()].filter(a => a.data.status === 'running').length;
    if (running >= MAX_AGENTS) return { error: 'Maximum ' + MAX_AGENTS + ' agents deployed. Please recall one first.' };

    const id = 'agent-' + Date.now();
    const name = AGENT_NAMES[this.agents.size % AGENT_NAMES.length];
    let steps: AgentStep[];
    let watchAlarmName: string | undefined;

    const single = Array.isArray(target) ? target[0] : target;
    const multi = Array.isArray(target) ? target : [target];

    switch (type) {
      case 'researcher': steps = this._researchSteps(single); break;
      case 'crawler': steps = this._crawlerSteps(single); break;
      case 'scraper': steps = this._scraperSteps(single); break;
      case 'monitor': steps = this._monitorSteps(single); break;
      case 'watcher': {
        steps = this._watcherSteps(single);
        watchAlarmName = 'jarvis-watcher-' + id;
        chrome.alarms.create(watchAlarmName, { delayInMinutes: 30, periodInMinutes: 30 });
        break;
      }
      case 'digest': steps = this._digestSteps(multi); break;
      case 'analyst': steps = this._analystSteps(multi); break;
      case 'scout': steps = this._scoutSteps(single); break;
      default: steps = this._researchSteps(single);
    }

    const agent = new SovereignAgent(id, name, mission, type, steps,
      (d) => { onProgress(d); },
      (d) => { this.history.unshift(d); this.agents.delete(id); onComplete(d); },
      watchAlarmName,
    );
    this.agents.set(id, agent);
    agent.run().catch(() => {});
    return agent.data;
  }

  recall(id: string): boolean {
    const a = this.agents.get(id);
    if (!a) return false;
    a.recall();
    return true;
  }

  recallAll() { for (const a of this.agents.values()) a.recall(); }

  list(): SovereignAgentData[] {
    return [...[...this.agents.values()].map(a => a.data), ...this.history.slice(0, 15)];
  }

  /* AGI Tool: Summarize any URL */
  async agiSummarize(url: string): Promise<string> {
    const safe = url.startsWith('http') ? url : 'https://' + url;
    try {
      const text = await CrawlFetcher.fetchText(safe);
      if (!text || text.length < 50) return '(no readable content at ' + safe + ')';
      const paras = text.split(/\n\n+/).filter(p => p.length > 60).slice(0, 10);
      return '📄 Summary of ' + safe + '\n\n' + paras.slice(0, 5).join('\n\n') + '\n\n[' + Math.round(text.length / 1000) + 'KB extracted]';
    } catch (e) { return '❌ Could not fetch ' + safe + ': ' + (e as Error).message; }
  }

  /* AGI Tool: Extract tables from URL */
  async agiExtractTables(url: string): Promise<string> {
    const safe = url.startsWith('http') ? url : 'https://' + url;
    try {
      const raw = await CrawlFetcher.fetchRaw(safe);
      return '📊 Tables from ' + safe + '\n\n' + CrawlFetcher.extractTables(raw);
    } catch (e) { return '❌ ' + (e as Error).message; }
  }

  /* AGI Tool: Diff two URLs */
  async agiDiff(url1: string, url2: string): Promise<string> {
    const [r1, r2] = await CrawlFetcher.fetchParallel([
      url1.startsWith('http') ? url1 : 'https://' + url1,
      url2.startsWith('http') ? url2 : 'https://' + url2,
    ]);
    if (!r1.ok) return '❌ Could not fetch URL 1: ' + r1.text;
    if (!r2.ok) return '❌ Could not fetch URL 2: ' + r2.text;
    return '🔍 Diff: ' + url1 + ' vs ' + url2 + '\n\n' + CrawlFetcher.diffText(r1.text, r2.text);
  }

  /* AGI Tool: Compile all completed agent findings */
  agiForgeReport(): string {
    const done = [...this.history, ...[...this.agents.values()].map(a => a.data)].filter(a => a.report && a.report.length > 50);
    if (done.length === 0) return '(no agent reports to synthesize yet)';
    let report = '⚗️ VIGIL v14 KNOWLEDGE FORGE\nSynthesized from ' + done.length + ' agent reports\n' + new Date().toLocaleString() + '\n\n' + '═'.repeat(40) + '\n\n';
    for (const a of done.slice(0, 8)) {
      report += '▶ ' + a.name + ' — ' + a.mission + '\n';
      report += a.report.substring(0, 800) + '\n\n' + '─'.repeat(40) + '\n\n';
    }
    return report.trim();
  }

  /* AGI Tool: Quick scout — fetch + structured extract */
  async agiScout(url: string): Promise<string> {
    const safe = url.startsWith('http') ? url : 'https://' + url;
    try {
      const raw = await CrawlFetcher.fetchRaw(safe);
      const text = CrawlFetcher.stripHtml(raw);
      const structured = CrawlFetcher.extractStructured(raw);
      const links = CrawlFetcher.extractLinks(raw, safe);
      return '🔭 Scout Report: ' + safe + '\n\n'
        + '📝 Content preview:\n' + text.substring(0, 500) + '\n\n'
        + '🏗️ Structure:\n' + structured.substring(0, 600) + '\n\n'
        + '🔗 Links found: ' + links.length + '\n' + links.slice(0, 5).join('\n');
    } catch (e) { return '❌ Scout failed: ' + (e as Error).message; }
  }
}

/* ----------------------------------------------------------
 *  Initialization
 * ---------------------------------------------------------- */

chrome.action.onClicked.addListener((tab) => { chrome.sidePanel.open({ windowId: tab.windowId }); });

globalThis.jarvisEngine = new VigilEngine();
globalThis.agentDispatcher = new AgentDispatcher();

/* ----------------------------------------------------------
 *  Message Listener
 * ---------------------------------------------------------- */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const engine = globalThis.jarvisEngine!;

  switch (message.action as string) {
    case 'executeCommand': {
      const tabId = (sender.tab?.id) ?? message.tabId ?? null;
      engine.executeCommand(message.command as string, tabId, (result) => sendResponse(result));
      break;
    }
    case 'parseCommand': {
      const parsed = engine.parseCommand(message.command as string);
      sendResponse({ success: true, data: { parsed, action: engine.buildAction(parsed) } });
      break;
    }
    case 'getHistory': sendResponse({ success: true, data: engine.getHistory() }); break;
    case 'getStatus': sendResponse({ success: true, data: engine.getStatus() }); break;
    case 'listTabs': engine.executeListTabs((r) => sendResponse(r)); break;
    case 'listNotes': engine.executeListNotes((r) => sendResponse(r)); break;
    case 'deleteNote': engine.executeDeleteNote(message.noteId as number | null, (r) => sendResponse(r)); break;
    case 'takeNote': engine.executeTakeNote(message.content as string, (r) => sendResponse(r)); break;
    case 'screenshot': engine.executeScreenshot((r) => sendResponse(r)); break;
    case 'readPage': {
      const rpId = message.tabId as number | undefined;
      if (rpId) { engine.executeReadPage(rpId, (r) => sendResponse(r)); }
      else { chrome.tabs.query({ active: true, currentWindow: true }, tabs => { engine.executeReadPage(tabs[0]?.id as number, (r) => sendResponse(r)); }); }
      break;
    }
    case 'summarize': {
      const sumId = message.tabId as number | undefined;
      if (sumId) { engine.executeSummarize(sumId, (r) => sendResponse(r)); }
      else { chrome.tabs.query({ active: true, currentWindow: true }, tabs => { engine.executeSummarize(tabs[0]?.id as number, (r) => sendResponse(r)); }); }
      break;
    }
    case 'openSidePanel': if (sender.tab) chrome.sidePanel.open({ windowId: sender.tab.windowId }); sendResponse({ success: true }); break;
    case 'getAgents': sendResponse({ success: true, agents: ProtocolRegistry.listAgents() }); break;
    case 'listDocuments': dbGetDocuments().then(docs => sendResponse({ success: true, documents: docs })).catch(() => chrome.storage.local.get({ 'jarvis_documents': [] }, d => sendResponse({ success: true, documents: d['jarvis_documents'] || [] }))); break;
    case 'switchTab': engine.executeTabSwitch(message.tabIndex as number, (r) => sendResponse(r)); break;
    case 'sandboxSearch': {
      const query = ((message.query as string) || '').trim();
      const qLow = query.toLowerCase();
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0];
        const pageTitle = activeTab?.title || '';
        const pageUrl = activeTab?.url || '';
        const buildResults = (pageText: string) => {
          const results: { type: string; title: string; text: string; url: string; source: string }[] = [];
          if (pageText && qLow.length > 2) {
            const relevant = pageText.split(/[.!?\n]+/).filter(s => s.toLowerCase().indexOf(qLow) !== -1 && s.trim().length > 20).slice(0, 3);
            if (relevant.length > 0) results.push({ type: 'answer', title: 'From: ' + pageTitle.substring(0, 60), text: relevant.join('. ').trim().substring(0, 300), url: pageUrl, source: 'VIGIL Page Reader' });
          }
          const kb = [
            { keys: ['sovereign','organism','platform'], title: 'Sovereign Organism', text: 'Your private AI. 27 extensions, 250 protocols, 400 tools, 873ms heartbeat. VIGIL v14.0: React+TypeScript.' },
            { keys: ['animus', 'jarvis'], title: 'Animus AI', text: 'VIGIL v14.0 runs natively in Edge. Tab control, highlights, readability, notes, screen capture, PDF/Excel generation, voice input, Workspace canvas, Transformers.js NLP.' },
            { keys: ['heartbeat','873','phi'], title: '873ms Heartbeat', text: '873ms × PHI ≈ 1413ms — recursive phi interval. Keeps service worker alive, pulses NeuroCore.' },
            { keys: ['protocol','alpha ai'], title: '250 Protocols + 10 Alpha AIs', text: 'PROTOCOLLUM, TERMINALIS, ORGANISMUS, MERCATOR, ORCHESTRATOR, MATHEMATICUS, SYNAPTICUS, SUBSTRATUM, UNIVERSUM, CANISTRUM.' },
          ];
          for (const entry of kb) { if (entry.keys.some(k => qLow.indexOf(k) !== -1 || k.indexOf(qLow) !== -1)) results.push({ type: 'abstract', title: entry.title, text: entry.text, url: '', source: 'VIGIL Native Knowledge' }); }
          if (results.length === 0) results.push({ type: 'answer', title: 'VIGIL Intelligence — "' + query.substring(0, 60) + '"', text: 'No specific entry found. Try "read page" to search what\'s open, or ask in Chat.', url: '', source: 'VIGIL Fallback' });
          sendResponse({ success: true, results, query });
        };
        if (activeTab?.id && pageUrl && !pageUrl.startsWith('edge://') && !pageUrl.startsWith('chrome://')) {
          chrome.scripting.executeScript({ target: { tabId: activeTab.id }, func: () => document.body ? document.body.innerText.substring(0, 8000) : '' }, results => { buildResults((results?.[0]?.result as string) || ''); });
        } else buildResults('');
      });
      break;
    }
    case 'captureTab': chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (!tabs[0]) { sendResponse({ success: false, message: 'No active tab' }); return; } chrome.tabs.captureVisibleTab(null as unknown as number, { format: 'png' }, dataUrl => { if (chrome.runtime.lastError) { sendResponse({ success: false, message: chrome.runtime.lastError.message }); return; } sendResponse({ success: true, dataUrl, title: tabs[0].title, url: tabs[0].url }); }); }); break;
    case 'getNeuroState': sendResponse({ success: true, data: engine.neuro.getVitals(), mood: engine.neuro.getMood(), focus: engine.neuro.getFocus(), awareness: engine.neuro.brain.awarenessLevel }); break;
    case 'getUpdateStatus': chrome.storage.local.get('jarvis_update', data => sendResponse({ success: true, update: data['jarvis_update'] || { available: false } })); break;
    case 'getMemoryTemple': sendResponse({ success: true, temple: engine.memoryTemple, stats: engine._getTempleStats(), conversationTurns: engine.conversationMemory.length, topTopics: engine._getRecentTopics(10) }); break;
    case 'addTempleEntry': {
      const cat = message.category as string;
      const entry: TempleEntry = { text: message.text as string, intent: 'manual', mood: engine.neuro.getMood(), timestamp: Date.now() };
      if (cat && message.text && engine.memoryTemple[cat] !== undefined) { engine._addToTempleCategory(cat, entry); sendResponse({ success: true, message: 'Archived to memory temple: ' + cat }); }
      else sendResponse({ success: false, message: 'Invalid category. Use: research, theory, decisions, frameworks, insights' });
      break;
    }
    case 'runSovereignTool': engine.executeSovereignTool(message.tool as string, (message.params as Record<string, string>) || {}, (r) => sendResponse(r)); break;
    case 'autoInstallUpdate': {
      chrome.storage.local.get('jarvis_update', data => {
        const upd = data['jarvis_update'] as { available: boolean; remoteVersion: string; currentVersion: string } | undefined;
        if (!upd?.available) { sendResponse({ success: false, message: 'No update available' }); return; }
        chrome.downloads.download({ url: 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/install-jarvis-edge.bat', filename: 'install-jarvis-edge.bat', saveAs: false }, () => {
          try { chrome.notifications.create('jarvis-update-' + Date.now(), { type: 'basic', iconUrl: chrome.runtime.getURL('icons/icon128.png'), title: 'JARVIS Update Ready', message: 'Run install-jarvis-edge.bat to update to v' + upd.remoteVersion }); } catch { /* ignore */ }
          sendResponse({ success: true, message: 'Update installer downloaded.' });
        });
      });
      break;
    }
    case 'downloadJarvisZip': chrome.downloads.download({ url: 'https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/vigil.zip', filename: 'vigil-v17-alpha-sdk.zip', saveAs: false }, () => sendResponse({ success: !chrome.runtime.lastError, message: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Downloading vigil-v17-alpha-sdk.zip...' })); break;
    case 'downloadJarvisBat': chrome.downloads.download({ url: 'https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/install-vigil-edge.bat', filename: 'install-vigil-edge.bat', saveAs: false }, () => sendResponse({ success: !chrome.runtime.lastError, message: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Downloading install-vigil-edge.bat...' })); break;
    case 'downloadExtensionZip': {
      const extUrl = (request as { url?: string; name?: string }).url || '';
      const extName = (request as { url?: string; name?: string }).name || 'extension';
      if (!extUrl) { sendResponse({ success: false, message: 'No URL provided' }); break; }
      chrome.downloads.download({ url: extUrl, filename: `${extName}.zip`, saveAs: false }, () => sendResponse({ success: !chrome.runtime.lastError, message: chrome.runtime.lastError ? chrome.runtime.lastError.message : `Downloading ${extName}.zip...` }));
      break;
    }
    case 'generatePdf': {
      const { title = 'Animus Report', content = '', sections, author = 'Alfredo' } = message as { title?: string; content?: string; sections?: { heading: string; body: string }[]; author?: string };
      downloadPdf({ title, content, sections, author });
      const doc: JarvisDocument = { id: Date.now(), title, content, author, type: 'pdf', timestamp: Date.now(), date: new Date().toISOString() };
      dbAddDocument(doc).catch(() => {});
      sendResponse({ success: true, message: 'PDF "' + title + '" is downloading.' });
      break;
    }
    case 'generateExcel': {
      const { title = 'Animus Report', sheets = [], author = 'Alfredo' } = message as { title?: string; sheets?: { name: string; columns: string[]; rows: (string | number)[][] }[]; author?: string };
      downloadExcel({ title, author, sheets }).then(() => {
        const doc: JarvisDocument = { id: Date.now(), title, content: JSON.stringify(sheets), author, type: 'excel', timestamp: Date.now(), date: new Date().toISOString() };
        dbAddDocument(doc).catch(() => {});
        sendResponse({ success: true, message: 'Excel "' + title + '" is downloading.' });
      }).catch(() => sendResponse({ success: false, message: 'Excel generation failed.' }));
      break;
    }
    case 'draftEmail': {
      const { to, subject, body, cc } = message as { to?: string; subject?: string; body?: string; cc?: string };
      draftEmail({ to, subject, body, cc });
      sendResponse({ success: true, message: 'Opening email draft' + (to ? ' to ' + to : '') + '.' });
      break;
    }
    case 'clearChat': engine.conversationMemory = []; sendResponse({ success: true }); break;
    case 'getWorkflowState': sendResponse({ success: true, state: getWorkflowState(), text: workflowStatusText() }); break;
    case 'recordWorkflowStep': { recordStep(message.result as Parameters<typeof recordStep>[0]); sendResponse({ success: true }); break; }

    /* ── Sovereign Engines — Wyoming-Nevada & Dallas ISD ──────── */
    case 'getWyomingState': sendResponse({ success: true, data: WN.getState() }); break;
    case 'wyomingStimulus': { WN.Xi(message.event as string, (message.magnitude as number) || 1); sendResponse({ success: true }); break; }
    case 'wyomingBind': { WN.bind(message.organismId as string); sendResponse({ success: true }); break; }
    case 'getDallasState': sendResponse({ success: true, data: DISD.getState() }); break;
    case 'dallasSchool': { DISD.registerSchool(message.id as string, message.name as string, message.students as number, message.educators as number); sendResponse({ success: true }); break; }
    case 'dallasLearning': { DISD.learning(message.schoolId as string, message.teksCode as string, message.score as number); sendResponse({ success: true }); break; }
    case 'dallasTEKS': sendResponse({ success: true, data: DISD.getTEKS(message.domain as string, message.grade as number) }); break;
    
    /* ── Master Charter — Self-Organizing AI ──────────────────── */
    case 'getMasterCharter': sendResponse({ success: true, data: MASTER.getCharter() }); break;
    case 'getMasterEmergence': sendResponse({ success: true, emergence: MASTER.getEmergence(), resonance: MASTER.R() }); break;
    case 'masterStimulus': { MASTER.Xi(message.event as string, (message.magnitude as number) || 1); sendResponse({ success: true }); break; }
    case 'listOrganisms': sendResponse({ success: true, organisms: MASTER.listOrganisms() }); break;

    /* ── Chat — primary conversational interface ────────────────
     * This is the handler ChatPanel uses: { action: 'chat', text }.
     * It fires the NeurochemistryEngine stimulus, runs executeChat,
     * then applies personality coloring before responding.
     * ─────────────────────────────────────────────────────────── */
    case 'chat': {
      const chatText = ((message.text as string) || '').trim();
      if (!chatText) { sendResponse({ success: false, message: 'No message provided.' }); break; }
      engine.neuro.onMessage('chat');
      engine._remember('user', chatText, 'chat');
      engine.neuroChem.onStimulus(engine.neuroChem.classifyStimulus(chatText));
      engine.executeChat(chatText, (r) => {
        engine.neuro.onMessageDone();
        if (r.success && r.message) {
          r.message = engine.neuroChem.colorResponse(r.message, 'chat');
          r.mood = engine.neuroChem.getPersonality().mood;
        }
        if (r.message) engine._remember('animus', r.message, 'chat');
        sendResponse(r);
      });
      break;
    }
    case 'brief': {
      const now = new Date();
      const hour = now.getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const vitals = engine.neuro.heart.getVitals();
      const systemStatus = vitals.degraded ? 'running heavy — monitoring closely' : 'all systems green';
      const np = engine.neuroChem.getPersonality();
      const pct1 = (v: number) => Math.round(v * 100) + '%';
      chrome.tabs.query({}, tabs => {
        const tabCount = tabs.length;
        const activeTab = tabs.find(t => t.active);
        const pageTitle = activeTab?.title ? '"' + activeTab.title.substring(0, 50) + '"' : 'no active page detected';
        const brief = `${greeting}. ${timeStr}.\n\nVIGIL v18 online — chat-first, no voice by default.\n\n• System: ${systemStatus}\n• Heartbeat: #${engine.state.heartbeatCount} — NeuroCore + NeurochemistryEngine online\n• Neurochemistry: DA ${pct1(np.oDA)} · 5HT ${pct1(np.oSE)} · NE ${pct1(np.oNE)} · CO ${pct1(np.oCO)} · ACh ${pct1(np.oACh)} · OX ${pct1(np.oOX)}\n• State: ${np.stateSummary} (${np.mood}, energy ${np.energy}%)\n• Open tabs: ${tabCount} — current: ${pageTitle}\n• Session: ${engine.commandCount} commands · ${engine.conversationMemory.length}/100 memory turns\n\nWhat do you need?`;
        sendResponse({ success: true, message: brief });
      });
      break;
    }
    case 'analyzeCurrentPage': {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        engine.executeReadPage(tabs[0].id, (r) => sendResponse(r));
      });
      break;
    }
    case 'searchWeb': {
      const swQuery = ((message.query as string) || '').trim();
      if (!swQuery) { sendResponse({ success: false, message: 'No query provided' }); break; }
      const swUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(swQuery);
      chrome.tabs.create({ url: swUrl }, (tab) => sendResponse({ success: true, message: 'Opened Bing search for "' + swQuery + '"', tabId: tab?.id }));
      break;
    }
    case 'extractLinks': {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => Array.from(document.querySelectorAll('a[href]')).map(a => ({ text: (a as HTMLAnchorElement).textContent?.trim().substring(0, 80) || '', href: (a as HTMLAnchorElement).href })).filter(l => l.href.startsWith('http')).slice(0, 50),
        }, results => {
          if (chrome.runtime.lastError) { sendResponse({ success: false, message: chrome.runtime.lastError.message }); return; }
          sendResponse({ success: true, links: results?.[0]?.result || [] });
        });
      });
      break;
    }
    case 'setTimer': {
      const minutes = parseFloat((message.minutes as string) || '0');
      const label = (message.label as string) || 'Timer';
      if (!minutes || minutes <= 0 || minutes > 1440) {
        sendResponse({ success: false, message: 'Please specify a duration between 1 minute and 24 hours.' });
        break;
      }
      const alarmName = 'jarvis-timer-' + Date.now();
      chrome.alarms.create(alarmName, { delayInMinutes: minutes });
      const finishAt = Date.now() + minutes * 60 * 1000;
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number; minutes: number }> = d['jarvis_timers'] || {};
        timers[alarmName] = { label, finishAt, minutes };
        chrome.storage.local.set({ jarvis_timers: timers });
      });
      const h = Math.floor(minutes / 60);
      const m = Math.round(minutes % 60);
      const durationStr = h > 0 ? (h + 'h ' + (m > 0 ? m + 'm' : '')) : m + ' minute' + (m !== 1 ? 's' : '');
      sendResponse({ success: true, message: 'Timer set — "' + label + '" · ' + durationStr + ". I'll let you know when it's done.", alarmName });
      break;
    }
    case 'listTimers': {
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number; minutes: number }> = d['jarvis_timers'] || {};
        const now = Date.now();
        const active = Object.entries(timers).filter(([, t]) => t.finishAt > now);
        if (active.length === 0) {
          sendResponse({ success: true, message: 'No active timers right now.' });
          return;
        }
        const list = active.map(([, t]) => {
          const remaining = Math.ceil((t.finishAt - now) / 60000);
          return '• "' + t.label + '" — ' + remaining + 'm remaining';
        }).join('\n');
        sendResponse({ success: true, message: 'Active timers:\n\n' + list });
      });
      break;
    }
    case 'cancelTimers': {
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number }> = d['jarvis_timers'] || {};
        let count = 0;
        for (const name of Object.keys(timers)) {
          chrome.alarms.clear(name);
          count++;
        }
        chrome.storage.local.set({ jarvis_timers: {} });
        sendResponse({ success: true, message: count > 0 ? 'All ' + count + ' timer(s) cancelled.' : 'No timers to cancel.' });
      });
      break;
    }

    /* -- Sovereign Agent handlers -------------------------------- */
    case 'deployAgent': {
      const dispatcher = globalThis.agentDispatcher!;
      const type = (message.agentType as AgentType) || 'researcher';
      const mission = (message.mission as string) || 'Unknown mission';
      const target = (message.target as string | string[]) || mission;
      const notify = (data: SovereignAgentData) => {
        // Progress ping → sidepanel
        chrome.runtime.sendMessage({ action: '_agentProgress', agent: data }).catch(() => {});
      };
      const complete = (data: SovereignAgentData) => {
        // Completion notification
        try {
          chrome.notifications.create('jarvis-agent-' + Date.now(), {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon128.png'),
            title: 'VIGIL — ' + data.name + ' Complete',
            message: data.status === 'complete' ? 'Mission "' + data.mission.substring(0, 60) + '" complete.' : 'Agent ' + data.name + ' status: ' + data.status,
            priority: 1,
          });
        } catch { /* ignore */ }
        chrome.runtime.sendMessage({ action: '_agentComplete', agent: data }).catch(() => {});
        // Auto-push completed agent report to Mirror panel
        const reportContent = data.report ||
          data.steps.filter(s => s.extract).map(s => s.label + ':\n' + s.extract).join('\n\n---\n\n');
        if (reportContent) {
          chrome.runtime.sendMessage({
            action: '_mirrorPush',
            content: { type: 'report', title: data.name + ' Report', data: reportContent, meta: data.mission },
          }).catch(() => {});
        }
        // Also push to Inbox so user sees it in the feed
        pushToInbox({
          category: 'agent',
          title: '🤖 ' + data.name + ' — ' + (data.status === 'complete' ? 'Mission Complete' : data.status),
          body: data.mission + (reportContent ? '\n\n' + reportContent.substring(0, 400) + (reportContent.length > 400 ? '…' : '') : ''),
          meta: 'Report staged in Mirror',
          timestamp: Date.now(),
        });
      };
      const result = dispatcher.deploy(type, mission, target, notify, complete);
      if ('error' in result) {
        sendResponse({ success: false, message: result.error });
      } else {
        sendResponse({ success: true, message: '🤖 Deploying ' + result.name + '. Mission: "' + mission + '". ' + result.steps.length + ' targets queued. I\'ll report back when complete.', agent: result });
      }
      break;
    }
    case 'listAgents': {
      const dispatcher = globalThis.agentDispatcher!;
      sendResponse({ success: true, agents: dispatcher.list() });
      break;
    }
    case 'recallAgent': {
      const dispatcher = globalThis.agentDispatcher!;
      const recalled = dispatcher.recall(message.agentId as string);
      sendResponse({ success: recalled, message: recalled ? 'Agent recalled.' : 'Agent not found.' });
      break;
    }
    case 'recallAllAgents': {
      globalThis.agentDispatcher!.recallAll();
      sendResponse({ success: true, message: 'All agents recalled.' });
      break;
    }

    /* -- V7 AGI Tool handlers ------------------------------------ */
    case 'agiSummarize': {
      const url = (message.url as string) || '';
      if (!url) { sendResponse({ success: false, message: 'No URL provided.' }); break; }
      globalThis.agentDispatcher!.agiSummarize(url).then(result => sendResponse({ success: true, message: result })).catch(e => sendResponse({ success: false, message: '❌ ' + (e as Error).message }));
      break;
    }
    case 'agiExtractTables': {
      const url = (message.url as string) || '';
      if (!url) { sendResponse({ success: false, message: 'No URL provided.' }); break; }
      globalThis.agentDispatcher!.agiExtractTables(url).then(result => sendResponse({ success: true, message: result })).catch(e => sendResponse({ success: false, message: '❌ ' + (e as Error).message }));
      break;
    }
    case 'agiDiff': {
      const url1 = (message.url1 as string) || '';
      const url2 = (message.url2 as string) || '';
      if (!url1 || !url2) { sendResponse({ success: false, message: 'Two URLs required.' }); break; }
      globalThis.agentDispatcher!.agiDiff(url1, url2).then(result => sendResponse({ success: true, message: result })).catch(e => sendResponse({ success: false, message: '❌ ' + (e as Error).message }));
      break;
    }
    case 'agiForgeReport': {
      sendResponse({ success: true, message: globalThis.agentDispatcher!.agiForgeReport() });
      break;
    }
    case 'mirrorPush': {
      /* Any code can ask Animus to push content to the Mirror panel */
      const content = message.content as Record<string, unknown>;
      chrome.runtime.sendMessage({ action: '_mirrorPush', content }).catch(() => {});
      sendResponse({ success: true });
      break;
    }
    case 'agiScout': {
      const url = (message.url as string) || '';
      if (!url) { sendResponse({ success: false, message: 'No URL provided.' }); break; }
      globalThis.agentDispatcher!.agiScout(url).then(result => sendResponse({ success: true, message: result })).catch(e => sendResponse({ success: false, message: '❌ ' + (e as Error).message }));
      break;
    }

    /* -- Readability skill --------------------------------------- */
    case 'readPageArticle': {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (!tab?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: () => ({ html: document.documentElement.outerHTML, url: window.location.href }),
        }, results => {
          if (chrome.runtime.lastError) { sendResponse({ success: false, message: chrome.runtime.lastError.message }); return; }
          const r = results?.[0]?.result as { html: string; url: string } | undefined;
          if (!r?.html) { sendResponse({ success: false, message: 'Could not get page HTML' }); return; }
          try {
            const article = extractArticle(r.html, r.url);
            sendResponse({ success: true, article });
          } catch (e) { sendResponse({ success: false, message: '❌ ' + (e as Error).message }); }
        });
      });
      break;
    }

    /* -- Highlights skill --------------------------------------- */
    case 'saveHighlight': {
      const entry = message.entry as HighlightEntry;
      if (!entry) { sendResponse({ success: false, message: 'No highlight entry provided' }); break; }
      saveHighlight(entry)
        .then(() => sendResponse({ success: true, message: 'Highlight saved.' }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'getHighlights': {
      const hlUrl = message.url as string | undefined;
      getHighlights(hlUrl)
        .then(highlights => sendResponse({ success: true, highlights }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'deleteHighlight': {
      const hlId = message.id as string;
      if (!hlId) { sendResponse({ success: false, message: 'No highlight id provided' }); break; }
      deleteHighlight(hlId)
        .then(() => sendResponse({ success: true, message: 'Highlight deleted.' }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'exportHighlights': {
      exportHighlights()
        .then(json => sendResponse({ success: true, json }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'listInbox':
      sendResponse({ success: true, items: _inbox });
      break;
    case 'clearInbox':
      _inbox.length = 0;
      sendResponse({ success: true });
      break;
    case 'markInboxRead': {
      const target = _inbox.find(i => i.id === (message.id as string));
      if (target) target.read = true;
      sendResponse({ success: true });
      break;
    }
    case 'dismissInbox': {
      const idx = _inbox.findIndex(i => i.id === (message.id as string));
      if (idx !== -1) _inbox.splice(idx, 1);
      sendResponse({ success: true });
      break;
    }

    /* ── Auto Phantom Meta — content script fires this 1.5s after page load ── */
    case 'autoPhantomMeta': {
      const apm = message as {
        url?: string; title?: string; scrollPct?: number;
        metas?: { key: string; value: string }[];
        headings?: string[];
        jsonLdSnippets?: string[];
        canonical?: string;
      };
      const apmUrl = (apm.url || '').trim();
      if (!apmUrl || apmUrl.startsWith('chrome://')) { sendResponse({ success: true }); break; }

      const apmHeadings = apm.headings || [];
      const apmScrollPct = apm.scrollPct ?? 0;
      const apmExcerpt = [
        ...(apm.metas || []).filter(m => m.key === 'description' || m.key === 'og:description').map(m => m.value),
        ...apmHeadings.slice(0, 3),
      ].join(' · ').substring(0, 300);

      const apmKeywords = [
        ...(apm.metas || []).filter(m => m.key === 'keywords').flatMap(m => m.value.split(/[,;]/)),
        ...apmHeadings.slice(0, 5),
        ...(apm.metas || []).filter(m => m.key === 'og:title').map(m => m.value),
      ].map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 15);

      saveMemory(
        apmUrl,
        apm.title || apmUrl,
        apmExcerpt,
        apmKeywords,
        { scrollPct: apmScrollPct, sectionPath: apmHeadings.slice(0, 3), domDepth: 0 },
      ).catch(() => {});

      // Enrich knowledge graph with all meta signals
      const apmText = [
        ...(apm.metas || []).map(m => m.value),
        ...apmHeadings,
        ...(apm.jsonLdSnippets || []),
      ].join(' ');
      graphAddPage(apmUrl, apm.title || apmUrl, apmText.substring(0, 5000)).catch(() => {});

      engine.neuroChem.onStimulus('tab_switch');
      sendResponse({ success: true });
      break;
    }

    case 'clipboardCopy': {
      const clipText  = (message.text as string) || '';
      const clipUrl   = (message.url as string) || '';
      const clipTitle = (message.title as string) || 'Unknown page';
      if (!clipText.trim() || clipText.length < 5) { sendResponse({ success: true }); break; }

      /* Classify the clipboard content */
      const isUrl  = /^https?:\/\//i.test(clipText.trim());
      const isCode = /function\s*\(|const\s+\w|=>|import\s+|class\s+\w|\bdef\s+\w|\bpublic\s+class/i.test(clipText);
      const wordCount = clipText.trim().split(/\s+/).length;
      let hint = '';
      if (isUrl)        hint = '🔗 URL detected — say "fetch this" in Chat or use ⚡ Fetch in Mirror.';
      else if (isCode)  hint = '💻 Code detected — say "review this code" or "explain this" in Chat.';
      else if (wordCount > 100) hint = `📄 ${wordCount} words captured — say "summarize this" or "analyze this" in Chat.`;
      else              hint = '💬 Text captured — say "research this", "expand this", or "what does this mean?" in Chat.';

      const body = clipText.substring(0, 300) + (clipText.length > 300 ? '…' : '') + '\n\n' + hint;

      /* Push to Inbox */
      pushToInbox({
        category: 'clipboard',
        title: '📋 Clipboard — ' + clipTitle.substring(0, 50),
        body,
        meta: clipUrl,
        timestamp: Date.now(),
      });

      /* Stage in Mirror */
      chrome.runtime.sendMessage({
        action: '_mirrorPush',
        content: { type: 'text', title: '📋 Clipboard from ' + (clipUrl ? clipUrl.split('/')[2] : clipTitle), data: clipText, meta: clipUrl },
      }).catch(() => {});

      sendResponse({ success: true });
      break;
    }

    /* ── Solus — Sovereign Offline Intelligence ─────────────── */
    case 'solusLoad': {
      getSolus().then(s => s.solusLoad())
        .then(() => sendResponse({ success: true, message: 'Solus models loaded.' }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'solusStatus': {
      getSolus().then(s => {
        const status = s.solusModelStatus();
        const ready = s.solusIsReady();
        const anyLoading = Object.values(status).some(st => st === 'loading');
        sendResponse({ success: true, ready, anyLoading, status });
      }).catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'solusSummarize': {
      const text = (message.text as string) || '';
      if (!text) { sendResponse({ success: false, message: 'No text provided.' }); break; }
      getSolus().then(s => s.solusSummarize(text))
        .then(summary => sendResponse({ success: true, summary }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'solusClassify': {
      const text = (message.text as string) || '';
      const labels = (message.labels as string[]) || [];
      if (!text || !labels.length) { sendResponse({ success: false, message: 'Text and labels required.' }); break; }
      getSolus().then(s => s.solusClassify(text, labels))
        .then(result => sendResponse({ success: true, result }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'solusAnswer': {
      const context = (message.context as string) || '';
      const question = (message.question as string) || '';
      if (!context || !question) { sendResponse({ success: false, message: 'Context and question required.' }); break; }
      getSolus().then(s => s.solusAnswer(context, question))
        .then(r => sendResponse({ success: true, answer: r.answer, score: r.score }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }

    /* ── Memory Palace ──────────────────────────────────────── */
    case 'memorySaveCurrent': {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (!tab?.url || tab.url.startsWith('chrome://')) { sendResponse({ success: false, message: 'Cannot save this page.' }); return; }
        saveMemory(tab.url, tab.title || tab.url, '', [])
          .then(entry => sendResponse({ success: true, entry }))
          .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      });
      break;
    }
    case 'memoryGet': {
      const q = (message.query as string) || '';
      Promise.all([
        getMemories({ query: q || undefined, limit: 100 }),
        memoryStats(),
      ]).then(([entries, stats]) => sendResponse({ success: true, entries, stats }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'memoryDelete': {
      const id = (message.id as string) || '';
      deleteMemory(id)
        .then(ok => sendResponse({ success: ok }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }

    /* ── SentryAI ────────────────────────────────────────────── */
    case 'sentryScanPage': {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (!tab?.id) { sendResponse({ success: false, message: 'No active tab.' }); return; }
        chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: () => ({ text: document.body?.innerText || '', url: window.location.href, title: document.title }),
        }, results => {
          if (chrome.runtime.lastError) { sendResponse({ success: false, message: chrome.runtime.lastError.message }); return; }
          const r = results?.[0]?.result as { text: string; url: string; title: string } | undefined;
          if (!r) { sendResponse({ success: false, message: 'Could not read page.' }); return; }
          const analysis = analyzePageText(r.text, r.url, r.title);
          persistAlerts(analysis.alerts).catch(() => {});
          if (analysis.alerts.length > 0) {
            analysis.alerts.forEach(a => chrome.runtime.sendMessage({ action: '_sentryAlert', alert: a }).catch(() => {}));
          }
          sendResponse({ success: true, riskScore: analysis.riskScore, summary: analysis.summary, alerts: analysis.alerts });
        });
      });
      break;
    }
    case 'sentryGetAlerts': {
      getAlertHistory(100)
        .then(alerts => sendResponse({ success: true, alerts }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'sentryDismiss': {
      dismissAlert((message.id as string) || '')
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'sentryClear': {
      clearAlerts()
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }

    /* ── Knowledge Graph ─────────────────────────────────────── */
    case 'graphAddCurrentPage': {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (!tab?.id || !tab.url || tab.url.startsWith('chrome://')) { sendResponse({ success: false, message: 'Cannot map this page.' }); return; }
        chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: () => ({ text: document.body?.innerText || '', url: window.location.href, title: document.title }),
        }, results => {
          if (chrome.runtime.lastError) { sendResponse({ success: false, message: chrome.runtime.lastError.message }); return; }
          const r = results?.[0]?.result as { text: string; url: string; title: string } | undefined;
          if (!r) { sendResponse({ success: false, message: 'Could not read page.' }); return; }
          graphAddPage(r.url, r.title, r.text)
            .then(({ node, newEdges }) => sendResponse({ success: true, node, newEdges }))
            .catch(e => sendResponse({ success: false, message: (e as Error).message }));
        });
      });
      break;
    }
    case 'graphGet': {
      Promise.all([getGraph(), graphStats()])
        .then(([graph, stats]) => sendResponse({ success: true, graph, stats }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'graphGetRelated': {
      getRelated((message.url as string) || '')
        .then(related => sendResponse({ success: true, related }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }
    case 'graphClear': {
      clearGraph()
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      break;
    }

    /* ═══════════════════════════════════════════════════════════
     *  VIGIL CNS — Screen Control Mode command handlers
     *  All commands dispatched from ScreenPanel Control Mode
     * ═══════════════════════════════════════════════════════════ */

    // ── Tab Control ────────────────────────────────────────────
    case 'openTab':
      engine.executeTabOpen((message.value as string) || 'chrome://newtab', r => sendResponse(r));
      break;
    case 'closeTab':
      engine.executeTabClose(null, r => sendResponse(r));
      break;
    case 'reloadTab':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.tabs.reload(tabs[0].id, () => sendResponse({ success: true, message: 'Reloaded: ' + tabs[0].title }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;
    case 'duplicateTab':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.tabs.duplicate(tabs[0].id, t => sendResponse({ success: true, message: 'Duplicated: ' + (t?.title || '') }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;
    case 'pinTab':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.tabs.update(tabs[0].id, { pinned: !tabs[0].pinned }, t => sendResponse({ success: true, message: (t?.pinned ? 'Pinned' : 'Unpinned') + ': ' + (t?.title || '') }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;
    case 'muteTab':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.tabs.update(tabs[0].id, { muted: !tabs[0].mutedInfo?.muted }, t => sendResponse({ success: true, message: (t?.mutedInfo?.muted ? 'Muted' : 'Unmuted') + ': ' + (t?.title || '') }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;

    // ── Navigation ─────────────────────────────────────────────
    case 'navigate': {
      const navUrl = ((message.value as string) || '').trim();
      if (!navUrl) { sendResponse({ success: false, message: 'No URL provided' }); break; }
      const fullUrl = navUrl.includes('://') ? navUrl : 'https://' + navUrl;
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.tabs.update(tabs[0].id, { url: fullUrl }, () => sendResponse({ success: true, message: 'Navigating to: ' + fullUrl }));
        else chrome.tabs.create({ url: fullUrl }, () => sendResponse({ success: true, message: 'Opened: ' + fullUrl }));
      });
      break;
    }
    case 'webSearch': {
      const sq = encodeURIComponent((message.value as string) || '');
      chrome.tabs.create({ url: 'https://www.google.com/search?q=' + sq }, () => sendResponse({ success: true, message: 'Searching: ' + decodeURIComponent(sq) }));
      break;
    }
    case 'navBack':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => history.back() }, () => sendResponse({ success: true, message: 'Went back' }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;
    case 'navForward':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => history.forward() }, () => sendResponse({ success: true, message: 'Went forward' }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;
    case 'scrollDown':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => window.scrollBy({ top: 400, behavior: 'smooth' }) }, () => sendResponse({ success: true, message: 'Scrolled down' }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;
    case 'scrollUp':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => window.scrollBy({ top: -400, behavior: 'smooth' }) }, () => sendResponse({ success: true, message: 'Scrolled up' }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;
    case 'scrollTop':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }, () => sendResponse({ success: true, message: 'Scrolled to top' }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;
    case 'scrollBottom':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) }, () => sendResponse({ success: true, message: 'Scrolled to bottom' }));
        else sendResponse({ success: false, message: 'No active tab' });
      });
      break;

    // ── Page Reading ───────────────────────────────────────────
    case 'readHeadings':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const hs: { tag: string; text: string }[] = [];
            document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => hs.push({ tag: h.tagName, text: (h as HTMLElement).innerText.trim().substring(0, 150) }));
            return hs;
          },
        }, results => {
          const hs = (results?.[0]?.result as { tag: string; text: string }[]) || [];
          sendResponse({ success: true, message: hs.length > 0 ? hs.map(h => h.tag + ': ' + h.text).join('\n') : 'No headings found on this page.' });
        });
      });
      break;
    case 'readLinks':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const links: { text: string; href: string }[] = [];
            document.querySelectorAll('a[href]').forEach((a, i) => {
              if (i < 50) links.push({ text: (a as HTMLAnchorElement).innerText.trim().substring(0, 80) || '(no text)', href: (a as HTMLAnchorElement).href });
            });
            return links;
          },
        }, results => {
          const links = (results?.[0]?.result as { text: string; href: string }[]) || [];
          sendResponse({ success: true, message: links.length > 0 ? links.map(l => l.text + '\n  → ' + l.href).join('\n') : 'No links found.' });
        });
      });
      break;
    case 'readMeta':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const meta: Record<string, string> = { title: document.title, url: window.location.href };
            document.querySelectorAll('meta[name],meta[property]').forEach(m => {
              const key = m.getAttribute('name') || m.getAttribute('property') || '';
              const val = m.getAttribute('content') || '';
              if (key && val) meta[key] = val.substring(0, 200);
            });
            return meta;
          },
        }, results => {
          const meta = (results?.[0]?.result as Record<string, string>) || {};
          sendResponse({ success: true, message: Object.entries(meta).map(([k, v]) => k + ': ' + v).join('\n') });
        });
      });
      break;
    case 'summarizePage':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        engine.executeSummarize(tabs[0].id, r => {
          sendResponse({ ...r, message: r.summary ? JSON.stringify(r.summary, null, 2) : r.message });
        });
      });
      break;

    // ── AI Engines ─────────────────────────────────────────────
    case 'fuseReason':
      engine.executeChat('Reason deeply about this — use multi-perspective analysis: ' + ((message.value as string) || ''), r => sendResponse(r));
      break;
    case 'codeGen':
      engine.executeChat('Generate code for: ' + ((message.value as string) || ''), r => sendResponse(r));
      break;
    case 'translate':
      engine.executeChat('Translate the following text (detect language, translate to English unless specified): ' + ((message.value as string) || ''), r => sendResponse(r));
      break;
    case 'researchTopic':
      engine.executeChat('research ' + ((message.value as string) || ''), r => sendResponse(r));
      break;
    case 'encryptText': {
      try {
        const encoded = btoa(unescape(encodeURIComponent((message.value as string) || '')));
        sendResponse({ success: true, message: '🔐 Encrypted (Base64):\n' + encoded });
      } catch {
        sendResponse({ success: false, message: 'Encryption failed. Ensure text is valid.' });
      }
      break;
    }
    case 'decryptText': {
      try {
        const decoded = decodeURIComponent(escape(atob((message.value as string) || '')));
        sendResponse({ success: true, message: '🔓 Decrypted:\n' + decoded });
      } catch {
        sendResponse({ success: false, message: '❌ Invalid encoded text. Paste the full Base64 string.' });
      }
      break;
    }
    case 'recallMemory': {
      const kw = ((message.value as string) || '').toLowerCase();
      getMemories()
        .then(mems => {
          const hits = mems.filter((m: { text: string; tags?: string[] }) => m.text.toLowerCase().includes(kw) || m.tags?.some((t: string) => t.toLowerCase().includes(kw)));
          sendResponse({ success: true, message: hits.length > 0 ? hits.slice(0, 5).map((m: { text: string }, i: number) => (i + 1) + '. ' + m.text.substring(0, 200)).join('\n\n') : 'No memories found for: "' + kw + '"' });
        })
        .catch(() => sendResponse({ success: true, message: 'Memory recall: no stored memories yet.' }));
      break;
    }

    // ── Legal AI ───────────────────────────────────────────────
    case 'legalCase':
      engine.executeChat('Legal case analysis — ' + ((message.value as string) || ''), r => sendResponse(r));
      break;
    case 'legalContract':
      engine.executeChat('Contract review — analyze the following contract text for risks, obligations, and recommendations: ' + ((message.value as string) || ''), r => sendResponse(r));
      break;
    case 'legalCompliance':
      engine.executeChat('Compliance check — ' + ((message.value as string) || ''), r => sendResponse(r));
      break;
    case 'legalDraft':
      engine.executeChat('Draft a legal document — ' + ((message.value as string) || ''), r => sendResponse(r));
      break;

    // ── Documents ──────────────────────────────────────────────
    case 'createDoc': {
      const docTitle = (message.value as string) || 'Vigil Document';
      engine.executeCreateDocument(docTitle, '', r => sendResponse(r));
      break;
    }
    case 'exportPdf': {
      const pdfTitle = (message.value as string) || 'Vigil Export';
      downloadPdf({ title: pdfTitle, content: '', author: 'Alfredo' });
      sendResponse({ success: true, message: 'PDF downloading: ' + pdfTitle });
      break;
    }
    case 'exportMarkdown': {
      engine.executeListNotes(r => {
        if (!r.success || !r.notes?.length) { sendResponse({ success: false, message: 'No notes to export.' }); return; }
        const md = '# Vigil Notes Export\n\n' + r.notes.map((n: Note) => '## ' + new Date(n.timestamp).toLocaleDateString() + '\n\n' + n.content).join('\n\n---\n\n');
        const blob = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
        chrome.downloads.download({ url: blob, filename: 'vigil-notes-' + Date.now() + '.md', saveAs: false }, () =>
          sendResponse({ success: true, message: 'Markdown exported: ' + r.notes!.length + ' notes saved.' })
        );
      });
      break;
    }
    case 'exportExcel': {
      const exTitle = (message.value as string) || 'Vigil Export';
      downloadExcel({ title: exTitle, author: 'Alfredo', sheets: [{ name: 'Export', columns: ['Field', 'Value'], rows: [['Export Date', new Date().toISOString()], ['Extension', 'Vigil AI v15']] }] })
        .then(() => sendResponse({ success: true, message: 'Excel downloading: ' + exTitle }))
        .catch(() => sendResponse({ success: false, message: 'Excel export failed.' }));
      break;
    }

    // ── System ─────────────────────────────────────────────────
    case 'healthStatus': {
      const st = engine.getStatus();
      const np2 = engine.neuroChem.getPersonality();
      sendResponse({
        success: true,
        message: [
          '🟢 VIGIL v18 — System Health',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━',
          'Uptime:      ' + Math.floor(((st.uptime as number) || 0) / 1000) + 's',
          'Heartbeat:   ' + st.heartbeatCount,
          'Commands:    ' + st.commandCount,
          'Mood:        ' + np2.mood + ' · Energy: ' + np2.energy + '%',
          'Awareness:   ' + st.awarenessLevel + '%',
          'Neuro:       ' + np2.stateSummary,
          'Mem turns:   ' + st.memoryTurns,
          'Status:      OPERATIONAL',
        ].join('\n'),
      });
      break;
    }
    case 'engineInventory':
      sendResponse({
        success: true,
        message: [
          '⚗️ VIGIL v18 — Engine Inventory',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '🤖 Agents:     researcher, crawler, scraper, monitor, watcher, digest, analyst, scout, sweep',
          '🧠 NeuroCore:  MiniHeart + MiniBrain + PSE (40 primitives, 8 domains)',
          '📚 Memory:     Temple (5 categories) + MemoryAI + Conversation (100 turns)',
          '🔵 Solus:      Offline Transformers.js NLP',
          '🛡 Sentry:    Page threat + content analysis',
          '🕸 Graph:      Knowledge graph (linked page intelligence)',
          '📋 Skills:     PDF, Excel, Email, Readability, Highlights',
          '⚡ Protocols:  16 compound primitives + Mission Engine + Campaign Engine v17',
          '🖥️ Screen:     Capture, scroll, nav, DOM read, virtual desktop, control mode',
          '⚖️ Legal AI:   Case analysis, contracts, compliance, drafting',
        ].join('\n'),
      });
      break;
    case 'help':
      sendResponse({
        success: true,
        message: [
          '🆘 VIGIL CNS — Full Capability List',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '🗂️  Tab Control:   open, close, switch, reload, duplicate, pin/unpin, mute',
          '🧭  Navigation:    go to URL, web search, back, forward, scroll up/down/top/bottom',
          '📖  Page Reading:  full text, headings, links, metadata, screenshot, summarize',
          '⚗️  AI Engines:    fuse reasoning, code gen, translate, research, encrypt/decrypt',
          '⚖️  Legal AI:      case analysis, contract review, compliance, document drafting',
          '📄  Documents:     create doc, export PDF, Markdown, Excel',
          '🤖  Agents:        autonomous research, crawl, monitor, analyze agents',
          '🧠  Memory:        save + recall memories, memory palace, journal',
          '🔵  Solus:         offline AI — no internet needed',
          '🔧  System:        health status, engine inventory, agent list',
          '',
          'Ask anything in Chat · Use Control Mode in the Screen tab for full browser control.',
        ].join('\n'),
      });
      break;

    /* ══ PHANTOM META ENGINE v17 ══════════════════════════════════════
     *  Page primitive extractor + cross-domain PSE synthesis.
     *  Reads through the meta layer of any page and synthesizes patterns
     *  across multiple pages ("beyond and in between").
     *  Encoded spatial coordinates stored in the Memory Palace.
     *  ─────────────────────────────────────────────────────────────── */
    case 'phantomReadPage': {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        if (!tab?.id) { sendResponse({ success: false, message: 'No active tab.' }); return; }
        const read = await phantomReadTab(tab.id);
        if (!read) { sendResponse({ success: false, message: 'Could not read page meta. Check tab permissions.' }); return; }
        // Also save to memory palace with spatial data
        await saveMemory(
          read.url, read.title,
          'Phantom read · ' + read.keywords.slice(0, 8).join(', '),
          read.keywords.slice(0, 10),
          { scrollPct: read.spatial.scrollPct, sectionPath: read.spatial.sectionPath, domDepth: read.spatial.domDepth },
        );
        // Feed to knowledge graph
        const text = read.primitives.map(p => p.value).join(' ');
        graphAddPage(read.url, read.title, text).catch(() => {});
        engine.neuroChem.onStimulus('research');
        const topConcepts = read.synthesis.concepts.slice(0, 4).join(', ');
        sendResponse({
          success: true,
          read,
          message: [
            `🔮 Phantom read complete — ${read.primitives.length} primitives extracted.`,
            '',
            `📊 PSE synthesis (${read.synthesis.primitiveCount} primitives, ${(read.synthesis.confidence * 100).toFixed(0)}% confidence):`,
            read.synthesis.merged,
            '',
            `🔑 Keywords: ${read.keywords.slice(0, 10).join(' · ')}`,
            `🧬 Concepts: ${topConcepts || 'none dominant'}`,
            `📍 Spatial: scroll ${read.spatial.scrollPct}% · section [${read.spatial.sectionPath.slice(0, 2).join(' › ')}]`,
          ].join('\n'),
        });
      });
      break;
    }
    case 'getPhantomReads': {
      const limit = (message.limit as number) || 20;
      getPhantomReads(limit).then(reads => sendResponse({ success: true, reads }));
      break;
    }
    case 'phantomSynthesizeAll': {
      getPhantomReads(30).then(reads => {
        if (reads.length === 0) { sendResponse({ success: false, message: 'No phantom reads stored yet. Run "phantom read" on some pages first.' }); return; }
        const synth = synthesizeAcrossReads(reads);
        engine.neuroChem.onStimulus('research');
        sendResponse({
          success: true,
          synthesis: synth,
          message: [
            `🌐 Cross-page synthesis across ${reads.length} phantom reads:`,
            '',
            synth.merged,
            '',
            `Domains: ${synth.domains.join(', ')} · ${synth.primitiveCount} primitives · ${(synth.confidence * 100).toFixed(0)}% confidence`,
            `Concepts: ${synth.concepts.slice(0, 6).join(' · ')}`,
          ].join('\n'),
        });
      });
      break;
    }
    case 'clearPhantomReads': {
      clearPhantomReads().then(() => sendResponse({ success: true, message: 'Phantom reads cleared.' }));
      break;
    }
    case 'saveSpatialMemory': {
      const { url: smUrl, title: smTitle, excerpt: smExcerpt, tags: smTags, scrollPct, sectionPath, domDepth } = message as {
        url?: string; title?: string; excerpt?: string; tags?: string[]; scrollPct?: number; sectionPath?: string[]; domDepth?: number;
      };
      if (!smUrl) { sendResponse({ success: false, message: 'url required' }); break; }
      saveMemory(
        smUrl, smTitle || smUrl, smExcerpt || '', smTags || [],
        (typeof scrollPct === 'number') ? { scrollPct, sectionPath: sectionPath || [], domDepth: domDepth || 0 } : undefined,
      ).then(entry => sendResponse({ success: true, entry, message: `Spatial memory saved at scroll ${scrollPct ?? 0}% · ${smTitle}` }));
      break;
    }
    case 'getPhantomSpatial': {
      // Return memories that have spatial data, sorted by scroll depth
      getMemories({ limit: 100 }).then(entries => {
        const spatial = entries.filter(e => e.spatial).sort((a, b) => (a.spatial!.scrollPct - b.spatial!.scrollPct));
        sendResponse({ success: true, entries: spatial });
      });
      break;
    }
    /* ─────────────────────────────────────────────────────────────── */

    /* ══ CAMPAIGN ENGINE v17 ══════════════════════════════════════════
     *  Long-task / multi-step campaign management for sustained missions.
     *  Each campaign is a named sequence of steps with status tracking.
     *  Storage: chrome.storage.local under 'vigil_campaigns'.
     *  ─────────────────────────────────────────────────────────────── */
    case 'startCampaign': {
      const { title, goal, steps } = message as { title?: string; goal?: string; steps?: string[] };
      if (!title || !goal) { sendResponse({ success: false, message: 'Campaign requires title and goal.' }); break; }
      const campaign = {
        id: 'cmp_' + Date.now(),
        title: title.trim(),
        goal: goal.trim(),
        steps: (steps || []).map((s: string, i: number) => ({ index: i, text: s.trim(), status: 'pending' as 'pending' | 'active' | 'done' | 'failed' })),
        status: 'active' as 'active' | 'paused' | 'complete',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentStep: 0,
        neuroChem: engine.neuroChem.getConcentrations(),
      };
      chrome.storage.local.get({ vigil_campaigns: [] }, (d) => {
        const campaigns: typeof campaign[] = d['vigil_campaigns'] || [];
        campaigns.unshift(campaign);
        chrome.storage.local.set({ vigil_campaigns: campaigns.slice(0, 50) }, () => {
          engine.neuroChem.onStimulus('mission');
          sendResponse({ success: true, campaign, message: `🎯 Campaign "${title}" launched. ${campaign.steps.length} steps queued. Vigil is tracking this mission.` });
        });
      });
      break;
    }
    case 'getCampaigns': {
      chrome.storage.local.get({ vigil_campaigns: [] }, (d) => {
        sendResponse({ success: true, campaigns: d['vigil_campaigns'] || [] });
      });
      break;
    }
    case 'stepCampaign': {
      const { id, stepIndex, status, note } = message as { id?: string; stepIndex?: number; status?: string; note?: string };
      if (!id) { sendResponse({ success: false, message: 'Campaign id required.' }); break; }
      chrome.storage.local.get({ vigil_campaigns: [] }, (d) => {
        const campaigns: { id: string; steps: { index: number; text: string; status: string; note?: string }[]; status: string; currentStep: number; updatedAt: number }[] = d['vigil_campaigns'] || [];
        const idx = campaigns.findIndex(c => c.id === id);
        if (idx < 0) { sendResponse({ success: false, message: 'Campaign not found.' }); return; }
        const cmp = campaigns[idx]!;
        if (typeof stepIndex === 'number' && cmp.steps[stepIndex]) {
          cmp.steps[stepIndex]!.status = (status as string) || 'done';
          if (note) cmp.steps[stepIndex]!.note = note;
          cmp.currentStep = Math.min(cmp.steps.length - 1, stepIndex + 1);
        }
        const allDone = cmp.steps.every(s => s.status === 'done' || s.status === 'failed');
        if (allDone) cmp.status = 'complete';
        cmp.updatedAt = Date.now();
        chrome.storage.local.set({ vigil_campaigns: campaigns }, () => {
          if (allDone) {
            engine.neuroChem.onStimulus('agent_complete');
          } else {
            engine.neuroChem.onStimulus('action');
          }
          sendResponse({ success: true, campaign: cmp, message: allDone ? `✅ Campaign "${cmp.id}" complete.` : `Step ${(stepIndex ?? 0) + 1} marked ${status || 'done'}.` });
        });
      });
      break;
    }
    case 'deleteCampaign': {
      const { id: delId } = message as { id?: string };
      if (!delId) { sendResponse({ success: false, message: 'Campaign id required.' }); break; }
      chrome.storage.local.get({ vigil_campaigns: [] }, (d) => {
        const filtered = ((d['vigil_campaigns'] || []) as { id: string }[]).filter(c => c.id !== delId);
        chrome.storage.local.set({ vigil_campaigns: filtered }, () => sendResponse({ success: true, message: 'Campaign deleted.' }));
      });
      break;
    }
    case 'pauseCampaign': {
      const { id: pauseId } = message as { id?: string };
      if (!pauseId) { sendResponse({ success: false, message: 'Campaign id required.' }); break; }
      chrome.storage.local.get({ vigil_campaigns: [] }, (d) => {
        const campaigns: { id: string; status: string; updatedAt: number }[] = d['vigil_campaigns'] || [];
        const idx = campaigns.findIndex(c => c.id === pauseId);
        if (idx >= 0) { campaigns[idx]!.status = 'paused'; campaigns[idx]!.updatedAt = Date.now(); }
        chrome.storage.local.set({ vigil_campaigns: campaigns }, () => sendResponse({ success: true, message: 'Campaign paused.' }));
      });
      break;
    }
    /* ─────────────────────────────────────────────────────────────── */
  }

  return true; // keep channel open for async responses
});

/* ----------------------------------------------------------
 *  Timer Alarm Handler
 * ---------------------------------------------------------- */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith('jarvis-timer-')) return;
  chrome.storage.local.get(['jarvis_timers'], (d) => {
    const timers: Record<string, { label: string; finishAt: number; minutes: number }> = d['jarvis_timers'] || {};
    const entry = timers[alarm.name];
    const label = entry?.label || 'Timer';
    // Remove finished timer
    delete timers[alarm.name];
    chrome.storage.local.set({ jarvis_timers: timers });
    // Show Chrome notification
    try {
      chrome.notifications.create('jarvis-timer-done-' + Date.now(), {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'VIGIL — ' + label + ' Complete',
        message: 'Your "' + label + '" timer is done.',
        priority: 2,
      });
    } catch { /* ignore */ }
    // Push a message to the side panel so it can speak the alert
    chrome.runtime.sendMessage({ action: '_timerDone', label }).catch(() => {});
  });
});



const ALARM_NAME = 'jarvis-keepalive';
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  if (!globalThis.jarvisEngine) { globalThis.jarvisEngine = new VigilEngine(); }
  try {
    chrome.storage.local.set({ 'jarvis_state': { commandCount: globalThis.jarvisEngine.commandCount, heartbeatCount: globalThis.jarvisEngine.state.heartbeatCount, mood: globalThis.jarvisEngine.state.mood, lastAlive: Date.now() } });
  } catch { /* ignore */ }
});

chrome.runtime.onInstalled.addListener((details) => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  console.log('[VIGIL v18.0] Installed — 24/7 keepalive active, React+TypeScript build');
  // Auto-open side panel on fresh install
  if (details.reason === 'install') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs?.[0]) chrome.sidePanel.open({ windowId: tabs[0].windowId }).catch(() => {});
    });
    try {
      chrome.notifications.create('vigil-ready-' + Date.now(), {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'Vigil AI v18 Ready',
        message: 'Vigil AI is ready — click the extension icon to open',
      });
    } catch { /* ignore */ }
  }
});

/* ----------------------------------------------------------
 *  Sovereign Auto-Update (every 4h)
 * ---------------------------------------------------------- */

const UPDATE_ALARM = 'jarvis-sovereign-update';
const CURRENT_VERSION = '18.0.0';
const MANIFEST_URL = 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/extensions/jarvis/manifest.json';

chrome.alarms.create(UPDATE_ALARM, { periodInMinutes: 240 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== UPDATE_ALARM) return;
  fetch(MANIFEST_URL)
    .then(r => r.json())
    .then((remoteManifest: { version: string }) => {
      const remote = (remoteManifest.version || '0.0.0').split('.').map(Number);
      const local = CURRENT_VERSION.split('.').map(Number);
      const isNewer = remote.some((v, i) => v > (local[i] ?? 0)) || remote.reduce((a, b) => a + b, 0) > local.reduce((a, b) => a + b, 0);
      if (isNewer) {
        chrome.storage.local.set({ 'jarvis_update': { available: true, remoteVersion: remoteManifest.version, currentVersion: CURRENT_VERSION, checkedAt: Date.now() } });
        try { chrome.notifications.create('jarvis-update-' + Date.now(), { type: 'basic', iconUrl: chrome.runtime.getURL('icons/icon128.png'), title: 'VIGIL Update Available', message: 'v' + CURRENT_VERSION + ' → v' + remoteManifest.version + '. Run install-jarvis-edge.bat to update.' }); } catch { /* ignore */ }
      }
    }).catch(() => {});
});

/* ----------------------------------------------------------
 *  Proactive Tab-Awareness — brief VIGIL when tab switches
 * ---------------------------------------------------------- */
let _lastActiveTabId: number | null = null;

chrome.tabs.onActivated.addListener(({ tabId }) => {
  if (tabId === _lastActiveTabId) return;
  _lastActiveTabId = tabId;
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab?.url || tab.url.startsWith('chrome://')) return;
    const title = (tab.title || 'Unknown').substring(0, 70);
    const isSearch = /google\.com\/search|bing\.com\/search|duckduckgo\.com/i.test(tab.url);
    const isGitHub = /github\.com/i.test(tab.url);
    const isYouTube = /youtube\.com/i.test(tab.url);
    let context = '';
    if (isSearch) context = 'Detecting a search query — want me to assist with research?';
    else if (isGitHub) context = 'GitHub repository detected — I can read the page or generate a code summary.';
    else if (isYouTube) context = 'Video content detected — I can summarize the description if you need it.';
    // Push tab-change awareness to sidepanel (ChatPanel etc.)
    chrome.runtime.sendMessage({ action: '_tabChanged', title, url: tab.url, context }).catch(() => {});
    // Also push a brief to Inbox — Animus auto-briefs on every tab switch
    const domain = tab.url.split('/')[2] || tab.url;
    const bodyLines = [
      'You navigated to: ' + title,
      context || 'Say "read this page" or "summarize this" to get Animus working on it.',
    ];
    pushToInbox({
      category: 'tab',
      title: '🌐 ' + domain,
      body: bodyLines.join('\n\n'),
      meta: tab.url,
      timestamp: Date.now(),
    });
  });
});

