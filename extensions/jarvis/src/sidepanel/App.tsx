import React, { useEffect } from 'react';
import { useJarvisStore } from '../store';
import ChatPanel from './panels/ChatPanel';
import InboxPanel from './panels/InboxPanel';
import SolusPanel from './panels/SolusPanel';
import AgentsPanel from './panels/AgentsPanel';
import AGIPromptsPanel from './panels/AGIPromptsPanel';
import SentryPanel from './panels/SentryPanel';
import MemoryVaultPanel from './panels/MemoryVaultPanel';
import WorkspacePanel from './panels/WorkspacePanel';
import SearchPanel from './panels/SearchPanel';
import ScreenPanel from './panels/ScreenPanel';
import TabsPanel from './panels/TabsPanel';
import InstallPanel from './panels/InstallPanel';
import LogPanel from './panels/LogPanel';
import PhantomPanel from './panels/PhantomPanel';

// CNS sections — each group is a logical nervous-system layer
type TabDef = { id: string; label: string; section?: string };
const TABS: TabDef[] = [
  // ── COMMAND ─ primary operator surface ──────────────────────
  { id: '_cmd',      label: '── COMMAND',  section: 'divider' },
  { id: 'chat',      label: '💬 Chat' },
  { id: 'inbox',     label: '📥 Inbox' },
  { id: 'screen',    label: '🖥️ Control' },
  { id: 'tabs',      label: '🗂️ Tabs' },
  // ── INTELLIGENCE ─ agents, search, AGI ──────────────────────
  { id: '_intel',    label: '── INTEL',    section: 'divider' },
  { id: 'agents',    label: '🤖 Agents' },
  { id: 'agi',       label: '⚗️ AGI' },
  { id: 'search',    label: '🔍 Search' },
  { id: 'phantom',   label: '👁 Phantom' },
  // ── MIND ─ memory, learning, monitoring ─────────────────────
  { id: '_mind',     label: '── MIND',     section: 'divider' },
  { id: 'memory',    label: '🧠 Memory' },
  { id: 'solus',     label: '🔵 Solus' },
  { id: 'sentry',    label: '🛡 Sentry' },
  // ── ARCHIVE ─ documents, workspace ──────────────────────────
  { id: '_archive',  label: '── ARCHIVE',  section: 'divider' },
  { id: 'workspace', label: '📁 Workspace' },
  // ── SYSTEM ──────────────────────────────────────────────────
  { id: '_sys',      label: '── SYS',      section: 'divider' },
  { id: 'log',       label: '📋 Log' },
  { id: 'install',   label: '⬇ Install' },
];

export default function App() {
  const {
    activePanel, setActivePanel, heartbeatCount, uptime,
    commandCount, mood, awareness, memTurns, setStatus,
    neuroChem, neuroMood, neuroEnergy, neuroState,
  } = useJarvisStore();

  useEffect(() => {
    const poll = () => {
      chrome.runtime.sendMessage({ action: 'getStatus' }, (resp) => {
        if (chrome.runtime.lastError || !resp?.success) return;
        const d = resp.data;
        setStatus({
          heartbeatCount: d.heartbeatCount,
          uptime: d.uptime ? Math.floor(d.uptime / 1000) : 0,
          commandCount: d.commandCount,
          mood: d.mood,
          awareness: d.awarenessLevel,
          memTurns: d.memoryTurns,
          neuroChem: d.neuroChem,
          neuroMood: d.neuroPersonality?.mood,
          neuroEnergy: d.neuroPersonality?.energy,
          neuroState: d.neuroPersonality?.stateSummary,
        });
      });
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [setStatus]);

  const renderPanel = () => {
    switch (activePanel) {
      case 'chat':      return <ChatPanel />;
      case 'inbox':     return <InboxPanel />;
      case 'solus':     return <SolusPanel />;
      case 'agents':    return <AgentsPanel />;
      case 'agi':       return <AGIPromptsPanel />;
      case 'sentry':    return <SentryPanel />;
      case 'memory':    return <MemoryVaultPanel />;
      case 'workspace': return <WorkspacePanel />;
      case 'search':    return <SearchPanel />;
      case 'phantom':   return <PhantomPanel />;
      case 'screen':    return <ScreenPanel />;
      case 'tabs':      return <TabsPanel />;
      case 'install':   return <InstallPanel />;
      case 'log':       return <LogPanel />;
      default:          return <ChatPanel />;
    }
  };

  const uptimeStr = (() => {
    const s = uptime;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + sec + 's';
  })();

  const moodDot = neuroMood === 'energized' ? 'bg-amber-400'
    : neuroMood === 'reflective' ? 'bg-emerald-300'
    : neuroMood === 'calm'       ? 'bg-amber-300'
    : neuroMood === 'alert'      ? 'bg-cyan-400'
    : neuroMood === 'stressed'   ? 'bg-red-400'
    : neuroMood === 'connected'  ? 'bg-purple-400'
    : neuroMood === 'analytical' ? 'bg-blue-400'
    : 'bg-amber-400';

  // Color a neurochemical level bar: deviation from baseline 1.0
  const neuroColor = (c: number) =>
    c > 1.15 ? '#22c55e' : c < 0.85 ? '#ef4444' : '#d4a017';

  const nc = neuroChem;

  return (
    <div className="flex flex-col h-screen text-gray-100 text-sm overflow-hidden" style={{ background: '#0d0b08' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #100d08 0%, #1a1408 100%)', borderColor: '#2d2010' }}
      >
        <div className="flex items-center gap-2">
          <span className="animate-heartbeat text-amber-400 text-lg">⚡</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-[0.25em] text-sm">V I G I L</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold" style={{ borderColor: '#d4a017', color: '#d4a017' }}>CNS</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${moodDot} animate-pulse`} title={'Neuro mood: ' + neuroMood} />
          <span className="text-xs text-gray-500 capitalize">{neuroMood}</span>
          <span className="text-[10px] text-gray-600" title={neuroState}>E:{neuroEnergy}%</span>
        </div>
      </div>

      {/* Nav tabs — scrollable with CNS section labels */}
      <div className="flex overflow-x-auto scrollbar-hide flex-shrink-0" style={{ background: '#13100a', borderBottom: '1px solid #2d2010' }}>
        {TABS.map((t) => {
          if (t.section === 'divider') {
            return (
              <span
                key={t.id}
                className="flex-shrink-0 px-2 py-1.5 text-[9px] font-bold tracking-widest select-none"
                style={{ color: '#5a4a20', borderRight: '1px solid #2d2010', whiteSpace: 'nowrap' }}
              >
                {t.label}
              </span>
            );
          }
          return (
            <button
              key={t.id}
              onClick={() => setActivePanel(t.id)}
              className={`flex-shrink-0 px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap ${
                activePanel === t.id
                  ? 'border-b-2'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              style={activePanel === t.id ? { color: '#d4a017', borderBottomColor: '#d4a017', background: '#0d0b08' } : {}}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-hidden">
        {renderPanel()}
      </div>

      {/* Download strip */}
      <div className="flex gap-1 px-2 py-1 flex-shrink-0" style={{ background: '#13100a', borderTop: '1px solid #2d2010' }}>
        <button
          onClick={() => chrome.runtime.sendMessage({ action: 'downloadJarvisZip' })}
          className="flex-1 text-xs py-0.5 px-1 rounded transition-colors"
          style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid #2d2010' }}
        >
          ⬇ ZIP
        </button>
        <button
          onClick={() => chrome.runtime.sendMessage({ action: 'downloadJarvisBat' })}
          className="flex-1 text-xs py-0.5 px-1 rounded transition-colors"
          style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid #2d2010' }}
        >
          🪟 Installer
        </button>
        <button
          onClick={() => window.open('https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/SDK_Model_Manifest.json', '_blank')}
          className="flex-1 text-xs py-0.5 px-1 rounded transition-colors"
          style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid #2d2010' }}
        >
          ⬇ SDK
        </button>
        <button
          onClick={() => window.open('https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/AI_Protocols_Register.csv', '_blank')}
          className="flex-1 text-xs py-0.5 px-1 rounded transition-colors"
          style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid #2d2010' }}
        >
          ⬇ Protocols
        </button>
      </div>

      {/* Neurochemical status bar */}
      <div className="flex items-center justify-between px-2 py-0.5 flex-shrink-0 font-mono text-[10px]" style={{ background: '#0c0a07', borderTop: '1px solid #1e1a0f' }}>
        {(['DA','SE','NE','CO','ACh','OX'] as const).map(sp => (
          <span key={sp} title={sp} style={{ color: neuroColor(nc[sp] ?? 1) }}>
            {sp}:{Math.round((nc[sp] ?? 1) * 100)}
          </span>
        ))}
        <span className="text-gray-700" title={neuroState ?? ''}>{neuroMood}</span>
      </div>

      {/* System status bar */}
      <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-600 flex-shrink-0" style={{ background: '#0a0806', borderTop: '1px solid #2d2010' }}>
        <span>⏱ {uptimeStr}</span>
        <span>💓 {heartbeatCount}</span>
        <span>⚡ {commandCount}</span>
        <span>🧠 {awareness}%</span>
        <span>📖 {memTurns}t</span>
      </div>
    </div>
  );
}
