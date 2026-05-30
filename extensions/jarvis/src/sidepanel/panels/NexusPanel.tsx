/**
 * NexusPanel — ANIMUS v13 Status Dashboard
 *
 * A read-only control surface for things that genuinely need UI:
 *  - TTS / mic toggles (binary state that can't be expressed in chat)
 *  - Live agent cards with per-agent Recall (needs live IDs to act on)
 *  - Cognitive Framework — 5 thinking lenses Jarvis runs on every response
 *  - Recent notes preview with copy / delete (persistent view without tab-switching)
 *  - Session stats (uptime, memory turns, command count)
 *  - Active page awareness (contextual, proactive)
 *
 * NOT a chat-command launcher — everything Jarvis understands via natural
 * language belongs in Chat, not here.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useJarvisStore } from '../../store';

/* ── Cognitive framework — Jarvis's 5 thinking lenses ──────────────────────── */
// Every response Jarvis generates is simultaneously processed through these
// thinking architectures. They are not user buttons — they are his cognition.

const COGNITIVE_MODES = [
  {
    id: 'researcher',
    icon: '🔬',
    label: 'Researcher',
    desc: 'Source-driven, factual verification',
    cls: 'border-blue-800/60 bg-blue-900/20 text-blue-300',
    dot: 'bg-blue-400',
  },
  {
    id: 'analyst',
    icon: '📊',
    label: 'Analyst',
    desc: 'Patterns, data, implications',
    cls: 'border-purple-800/60 bg-purple-900/20 text-purple-300',
    dot: 'bg-purple-400',
  },
  {
    id: 'theorist',
    icon: '🧠',
    label: 'Theorist',
    desc: 'Abstract, first-principles',
    cls: 'border-pink-800/60 bg-pink-900/20 text-pink-300',
    dot: 'bg-pink-400',
  },
  {
    id: 'scout',
    icon: '🔭',
    label: 'Scout',
    desc: 'Exploratory, opportunistic',
    cls: 'border-cyan-800/60 bg-cyan-900/20 text-cyan-300',
    dot: 'bg-cyan-400',
  },
  {
    id: 'synthesizer',
    icon: '⚗️',
    label: 'Synthesizer',
    desc: 'Cross-domain integration',
    cls: 'border-green-800/60 bg-green-900/20 text-green-300',
    dot: 'bg-green-400',
  },
];

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface AgentData {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'complete' | 'recalled' | 'failed';
  mission: string;
  currentStep: number;
  steps: unknown[];
  startedAt: number;
  completedAt?: number;
}

/* ── Agent card (with recall) ────────────────────────────────────────────────── */

const STATUS_ICON: Record<string, string> = {
  running: '🟢', queued: '⏳', complete: '✅', recalled: '⚡', failed: '❌',
};

function AgentCard({ agent, onRecall }: { agent: AgentData; onRecall: (id: string) => void }) {
  const pct = agent.steps.length > 0
    ? Math.round(((agent.currentStep + 1) / agent.steps.length) * 100)
    : 0;
  const canRecall = agent.status === 'running' || agent.status === 'queued';
  const elapsed = agent.completedAt
    ? Math.round((agent.completedAt - agent.startedAt) / 1000) + 's'
    : agent.status === 'running'
      ? Math.round((Date.now() - agent.startedAt) / 1000) + 's'
      : '';

  return (
    <div className="rounded border border-gray-700/50 bg-gray-900/60 px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className={agent.status === 'running' ? 'animate-pulse' : ''}>{STATUS_ICON[agent.status] || '○'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-gray-200 truncate">{agent.name}</span>
            {elapsed && <span className="text-[9px] text-gray-600">{elapsed}</span>}
          </div>
          <div className="text-[9px] text-gray-500 truncate">{agent.mission.substring(0, 55)}</div>
        </div>
        {canRecall && (
          <button
            onClick={() => onRecall(agent.id)}
            title="Recall this agent"
            className="flex-shrink-0 text-[9px] px-1.5 py-0.5 bg-red-900/40 hover:bg-red-800/60 border border-red-800/50 text-red-400 rounded transition-colors"
          >
            ⚡ Recall
          </button>
        )}
      </div>
      {agent.status === 'running' && agent.steps.length > 0 && (
        <div className="mt-1 h-0.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-700"
            style={{ width: pct + '%' }}
          />
        </div>
      )}
    </div>
  );
}

/* ── NexusPanel ─────────────────────────────────────────────────────────────── */

export default function NexusPanel() {
  const {
    setActivePanel,
    mood, commandCount, memTurns, uptime,
    ttsEnabled, setTtsEnabled,
    micListening, setMicListening,
    notes, setNotes,
  } = useJarvisStore();

  // Active cognitive mode cycles through all 5 every few seconds
  // to show they're all running simultaneously (not one at a time)
  const [activeModeIdx, setActiveModeIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setActiveModeIdx(i => (i + 1) % COGNITIVE_MODES.length), 1400);
    return () => clearInterval(iv);
  }, []);

  const [agents, setAgents]       = useState<AgentData[]>([]);
  const [currentPage, setCurrentPage] = useState<{ title: string; url: string } | null>(null);
  const [copyId, setCopyId]       = useState<number | null>(null);

  /* ── Load agents ── */
  const refreshAgents = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'listAgents' }, (resp) => {
      if (chrome.runtime.lastError || !resp) return;
      setAgents(resp.agents || []);
    });
  }, []);

  useEffect(() => {
    refreshAgents();
    const iv = setInterval(refreshAgents, 3000);
    return () => clearInterval(iv);
  }, [refreshAgents]);

  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      if (msg.action === '_agentProgress' || msg.action === '_agentComplete') refreshAgents();
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [refreshAgents]);

  /* ── Load notes ── */
  const refreshNotes = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'listNotes' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setNotes(resp.notes || []);
    });
  }, [setNotes]);

  useEffect(() => { refreshNotes(); }, [refreshNotes]);

  /* ── Active tab ── */
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) setCurrentPage({ title: tabs[0].title || 'Untitled', url: tabs[0].url || '' });
    });
  }, []);

  /* ── Recall agent ── */
  const recallAgent = (id: string) => {
    chrome.runtime.sendMessage({ action: 'recallAgent', agentId: id }, () => setTimeout(refreshAgents, 400));
  };

  /* ── Delete note ── */
  const deleteNote = (noteId: number) => {
    chrome.runtime.sendMessage({ action: 'deleteNote', noteId }, (resp) => {
      if (resp?.success) refreshNotes();
    });
  };

  /* ── Copy note ── */
  const copyNote = (content: string, id: number) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopyId(id);
    setTimeout(() => setCopyId(null), 1400);
  };

  /* ── Toggle TTS via background ── */
  const toggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    chrome.runtime.sendMessage({ action: 'setTts', enabled: next });
  };

  /* ── Derived ── */
  const moodLabel = mood === 'energized' ? '⚡ Energized'
    : mood === 'reflective' ? '🔮 Reflective'
    : mood === 'calm'       ? '🌊 Calm'
    : '🎯 Focused';

  const liveAgents = agents.filter(a => a.status === 'running' || a.status === 'queued');
  const doneAgents = agents.filter(a => a.status === 'complete' || a.status === 'failed' || a.status === 'recalled');
  const recentNotes = notes.slice(0, 4);

  const uptimeFmt = uptime > 0
    ? uptime >= 3600
      ? Math.floor(uptime / 3600) + 'h ' + Math.floor((uptime % 3600) / 60) + 'm'
      : Math.floor(uptime / 60) + 'm ' + (uptime % 60) + 's'
    : '—';

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-950 text-gray-200 text-xs">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 bg-gray-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="animate-heartbeat text-cyan-400">⚡</span>
          <span className="font-bold tracking-widest text-white text-[11px]">NEXUS</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span>{moodLabel}</span>
          {liveAgents.length > 0 && (
            <span className="px-1.5 py-0.5 bg-green-900/40 border border-green-800/50 text-green-400 rounded text-[9px] animate-pulse">
              {liveAgents.length} agent{liveAgents.length > 1 ? 's' : ''} live
            </span>
          )}
        </div>
      </div>

      {/* ── Active page awareness ── */}
      {currentPage && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/30 border-b border-gray-800/40 flex-shrink-0">
          <span className="text-blue-500 flex-shrink-0">🌐</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-400 truncate">{currentPage.title}</div>
            <div className="text-[9px] text-gray-600 truncate">{currentPage.url}</div>
          </div>
          <button
            onClick={() => setActivePanel('chat')}
            title="Switch to Chat and ask Jarvis to read this page"
            className="flex-shrink-0 text-[9px] px-1.5 py-0.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-800/50 text-blue-400 rounded transition-colors"
          >
            → Chat
          </button>
        </div>
      )}

      {/* ── Controls ── */}
      <section className="px-3 pt-2 pb-1.5 border-b border-gray-800/50 flex-shrink-0">
        <div className="text-[9px] tracking-widest uppercase text-gray-600 mb-1.5">Controls</div>
        <div className="flex gap-2">
          {/* TTS toggle */}
          <button
            onClick={toggleTts}
            className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded border text-[10px] font-medium transition-colors ${
              ttsEnabled
                ? 'border-cyan-700/60 bg-cyan-900/30 text-cyan-300'
                : 'border-gray-700 bg-gray-900/60 text-gray-500'
            }`}
          >
            <span>{ttsEnabled ? '🔊' : '🔇'}</span>
            <span>Voice {ttsEnabled ? 'On' : 'Off'}</span>
          </button>

          {/* Mic toggle */}
          <button
            onClick={() => setMicListening(!micListening)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded border text-[10px] font-medium transition-colors ${
              micListening
                ? 'border-red-700/60 bg-red-900/30 text-red-300 animate-pulse'
                : 'border-gray-700 bg-gray-900/60 text-gray-500'
            }`}
          >
            <span>{micListening ? '🎙' : '🎤'}</span>
            <span>{micListening ? 'Listening' : 'Mic Off'}</span>
          </button>
        </div>
      </section>

      {/* ── Cognitive Framework ── */}
      <section className="px-3 pt-2 pb-2 border-b border-gray-800/50 flex-shrink-0">
        <div className="text-[9px] tracking-widest uppercase text-gray-600 mb-1.5">Cognitive Framework</div>
        <div className="grid grid-cols-5 gap-1">
          {COGNITIVE_MODES.map((m, idx) => {
            const isActive = idx === activeModeIdx;
            return (
              <div
                key={m.id}
                title={m.desc}
                className={`rounded border px-1 py-1.5 text-center transition-all duration-700 ${
                  isActive ? m.cls : 'border-gray-800/40 bg-gray-900/20'
                }`}
              >
                <div className={`text-[13px] ${isActive ? '' : 'opacity-30'}`}>{m.icon}</div>
                <div className={`text-[8px] mt-0.5 font-medium leading-tight ${isActive ? '' : 'text-gray-700'}`}>
                  {m.label}
                </div>
                <div className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${isActive ? m.dot + ' animate-pulse' : 'bg-gray-800'}`} />
              </div>
            );
          })}
        </div>
        <div className="text-[8px] text-gray-700 mt-1 text-center leading-tight">
          All 5 lenses run simultaneously on every response — this is how Jarvis thinks.
        </div>
      </section>

      {/* ── Live agents ── */}
      <section className="px-3 pt-2 pb-1.5 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[9px] tracking-widest uppercase text-gray-600">Agents</div>
          {agents.length > 0 && (
            <button
              onClick={() => setActivePanel('agents')}
              className="text-[9px] text-gray-600 hover:text-cyan-500 transition-colors"
            >
              All agents →
            </button>
          )}
        </div>

        {liveAgents.length === 0 && doneAgents.length === 0 && (
          <div className="text-[10px] text-gray-700 italic py-0.5">
            No agents running. Ask Jarvis in Chat.
          </div>
        )}

        {doneAgents.length > 0 && (
          <div className="text-[9px] text-gray-700 mb-1 flex items-center gap-1">
            <span>✅ Completed reports pushed to</span>
            <button onClick={() => setActivePanel('mirror')} className="text-cyan-600 hover:text-cyan-400 transition-colors">🪞 Mirror</button>
          </div>
        )}

        <div className="space-y-1">
          {liveAgents.map(a => (
            <AgentCard key={a.id} agent={a} onRecall={recallAgent} />
          ))}
          {doneAgents.slice(0, 2).map(a => (
            <AgentCard key={a.id} agent={a} onRecall={recallAgent} />
          ))}
        </div>
      </section>

      {/* ── Recent notes ── */}
      <section className="px-3 pt-2 pb-1.5 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[9px] tracking-widest uppercase text-gray-600">Recent Notes</div>
          {notes.length > 0 && (
            <button
              onClick={() => setActivePanel('notes')}
              className="text-[9px] text-gray-600 hover:text-cyan-500 transition-colors"
            >
              All notes →
            </button>
          )}
        </div>

        {recentNotes.length === 0 && (
          <div className="text-[10px] text-gray-700 italic py-0.5">
            No notes yet. Ask Jarvis to take a note in Chat.
          </div>
        )}

        <div className="space-y-1">
          {recentNotes.map((note: any) => (
            <div
              key={note.id}
              className="flex items-start gap-1.5 rounded bg-gray-900/50 border border-gray-800/50 px-2 py-1 group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-gray-300 leading-snug line-clamp-2">{note.content}</div>
                <div className="text-[9px] text-gray-600 mt-0.5">
                  {new Date(note.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                <button
                  onClick={() => copyNote(note.content, note.id)}
                  title="Copy"
                  className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {copyId === note.id ? '✓' : '📋'}
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  title="Delete"
                  className="text-[9px] text-red-600 hover:text-red-400 transition-colors"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Session stats ── */}
      <section className="px-3 pt-2 pb-3">
        <div className="text-[9px] tracking-widest uppercase text-gray-600 mb-1.5">Session</div>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="rounded bg-gray-900/50 border border-gray-800/40 px-2 py-1.5 text-center">
            <div className="text-sm font-bold text-cyan-400">{commandCount}</div>
            <div className="text-[9px] text-gray-600">commands</div>
          </div>
          <div className="rounded bg-gray-900/50 border border-gray-800/40 px-2 py-1.5 text-center">
            <div className="text-sm font-bold text-purple-400">{memTurns}<span className="text-[9px] text-gray-600">/100</span></div>
            <div className="text-[9px] text-gray-600">memory</div>
          </div>
          <div className="rounded bg-gray-900/50 border border-gray-800/40 px-2 py-1.5 text-center">
            <div className="text-[11px] font-bold text-green-400">{uptimeFmt}</div>
            <div className="text-[9px] text-gray-600">uptime</div>
          </div>
        </div>
      </section>

    </div>
  );
}
