import React, { useState, useRef } from 'react';
import { useJarvisStore } from '../../store';
import DocsPanel from './DocsPanel';
import ToolsPanel from './ToolsPanel';
import NotesPanel from './NotesPanel';

const TEMPLATES: Record<string, string> = {
  'Meeting': `# Meeting Notes\nDate: ${new Date().toLocaleDateString()}\n\n## Attendees\n- \n\n## Agenda\n1. \n\n## Action Items\n- \n`,
  'SWOT': `# SWOT Analysis\n\n## Strengths\n- \n\n## Weaknesses\n- \n\n## Opportunities\n- \n\n## Threats\n- \n`,
  'Research': `# Research Notes\nTopic: \nDate: ${new Date().toLocaleDateString()}\n\n## Key Findings\n- \n\n## Sources\n- \n`,
  'Brainstorm': `# Brainstorm\nIdea: \n\n## Raw Ideas\n- \n\n## Top 3\n1. \n2. \n3. \n`,
  'Daily Plan': `# Daily Plan — ${new Date().toLocaleDateString()}\n\n## Must Do\n- [ ] \n\n## Goals\n- \n\n## Notes\n`,
  'Decision': `# Decision Record\nQuestion: \nDate: ${new Date().toLocaleDateString()}\n\n## Options\n1. \n2. \n\n## Chosen\n\n## Rationale\n`,
};

/* ── Workspace Editor ─────────────────────────────────────────────────────── */
function WorkspaceEditor() {
  const { workspaceText, setWorkspaceText } = useJarvisStore();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const wordCount = workspaceText.trim() ? workspaceText.trim().split(/\s+/).length : 0;
  const charCount = workspaceText.length;

  const applyTemplate = (name: string) => {
    if (workspaceText && !confirm('Replace current content with template?')) return;
    setWorkspaceText(TEMPLATES[name] || '');
  };

  const copyText = () => {
    if (!workspaceText) return;
    navigator.clipboard.writeText(workspaceText).then(() => {
      setSaveStatus('Copied!');
      setTimeout(() => setSaveStatus(null), 1500);
    }).catch(() => {});
  };

  const saveAsNote = () => {
    if (!workspaceText.trim()) return;
    const firstLine = workspaceText.trim().split('\n')[0].replace(/^#+\s*/, '').substring(0, 100);
    chrome.runtime.sendMessage({ action: 'takeNote', content: firstLine + (workspaceText.length > firstLine.length ? '\n…' : '') }, (resp) => {
      setSaveStatus(resp?.success ? 'Saved to Notes!' : 'Save failed');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  };

  const exportPdf = () => {
    if (!workspaceText) return;
    const title = workspaceText.trim().split('\n')[0].replace(/^#+\s*/, '') || 'Workspace Export';
    chrome.runtime.sendMessage({ action: 'generatePdf', title, content: workspaceText, author: 'Alfredo' }, () => {
      setSaveStatus('PDF downloading…');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  };

  const exportExcel = () => {
    if (!workspaceText) return;
    const lines = workspaceText.split('\n').filter((l) => l.trim());
    chrome.runtime.sendMessage({
      action: 'generateExcel',
      title: 'Workspace Export',
      sheets: [{ name: 'Workspace', columns: ['#', 'Content'], rows: lines.map((l, i) => [i + 1, l]) }],
    }, () => {
      setSaveStatus('Excel downloading…');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-1 px-2 py-1.5 bg-[#0d1520] border-b border-[#1a3a5c]">
        {Object.keys(TEMPLATES).map((t) => (
          <button
            key={t}
            onClick={() => applyTemplate(t)}
            className="text-xs px-2 py-0.5 bg-[#1a3a5c] hover:bg-[#1a4a7c] rounded text-gray-300 transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      <textarea
        className="flex-1 bg-[#080d14] text-gray-200 font-mono text-xs p-3 outline-none resize-none border-b border-[#1a3a5c] placeholder-gray-700"
        placeholder="Start typing or choose a template…"
        value={workspaceText}
        onChange={(e) => setWorkspaceText(e.target.value)}
        spellCheck={false}
      />

      <div className="flex items-center justify-end px-3 py-0.5 bg-[#0d1520] border-b border-[#1a3a5c] text-xs text-gray-600">
        {wordCount} word{wordCount !== 1 ? 's' : ''} · {charCount} char{charCount !== 1 ? 's' : ''}
        {saveStatus && <span className="ml-3 text-cyan-400">{saveStatus}</span>}
      </div>

      <div className="flex gap-1 px-2 py-1.5 bg-[#0d1520]">
        <button onClick={copyText} className="flex-1 text-xs py-1 bg-[#1a3a5c] hover:bg-[#1a4a7c] rounded text-gray-300 transition-colors">📋 Copy</button>
        <button onClick={saveAsNote} disabled={!workspaceText.trim()} className="flex-1 text-xs py-1 bg-cyan-900/60 hover:bg-cyan-800/80 disabled:bg-[#0d1520] disabled:text-gray-600 rounded text-cyan-200 transition-colors">📒 Note</button>
        <button onClick={exportPdf} disabled={!workspaceText.trim()} className="flex-1 text-xs py-1 bg-[#1a3a5c] hover:bg-[#1a4a7c] disabled:bg-[#0d1520] disabled:text-gray-600 rounded text-gray-300 transition-colors">📄 PDF</button>
        <button onClick={exportExcel} disabled={!workspaceText.trim()} className="flex-1 text-xs py-1 bg-[#1a3a5c] hover:bg-[#1a4a7c] disabled:bg-[#0d1520] disabled:text-gray-600 rounded text-gray-300 transition-colors">📊 Excel</button>
      </div>
    </div>
  );
}

/* ── Grid View ─────────────────────────────────────────────────────────────── */
function GridView() {
  const { notes } = useJarvisStore();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? notes.filter((n: any) => n.content?.toLowerCase().includes(search.toLowerCase()))
    : notes;

  const copyNote = (text: string) => navigator.clipboard.writeText(text).catch(() => {});
  const deleteNote = (id: number) => chrome.runtime.sendMessage({ action: 'deleteNote', noteId: id }, () => {});

  return (
    <div className="flex flex-col h-full bg-[#080d14]">
      <div className="px-2 py-1.5 bg-[#0d1520] border-b border-[#1a3a5c]">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="w-full bg-[#0a1018] border border-[#1a3a5c] rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-10 text-xs">No notes yet. Use 📝 Editor tab or ask Auro to take a note.</div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((note: any) => (
            <div
              key={note.id}
              className="bg-[#0d1520] border border-[#1a3a5c] rounded-lg p-2 group relative hover:border-[#2a5a8c] transition-colors"
            >
              <div className="text-[10px] text-gray-600 mb-1">
                {new Date(note.timestamp).toLocaleDateString()} {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
                {note.content}
              </div>
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => copyNote(note.content)} className="text-[10px] text-gray-600 hover:text-gray-300">📋</button>
                <button onClick={() => deleteNote(note.id)} className="text-[10px] text-red-700 hover:text-red-400">🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Codex — Code Editor + AI ─────────────────────────────────────────────── */
const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'C++', 'SQL', 'JSON', 'Bash', 'Other'];

interface CodexMessage {
  role: 'user' | 'ai';
  text: string;
  ts: number;
}

function CodexPanel() {
  const [lang, setLang] = useState('TypeScript');
  const [code, setCode] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<CodexMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const askAI = () => {
    if (!question.trim()) return;
    const userMsg: CodexMessage = { role: 'user', text: question.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setThinking(true);

    const context = code.trim()
      ? `[${lang} code]\n\`\`\`${lang.toLowerCase()}\n${code}\n\`\`\`\n\nQuestion: ${userMsg.text}`
      : userMsg.text;

    chrome.runtime.sendMessage({ action: 'chat', text: context }, (resp) => {
      setThinking(false);
      const reply: string = resp?.message || resp?.data?.message || 'No response.';
      setMessages(prev => [...prev, { role: 'ai', text: reply, ts: Date.now() }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
  };

  const saveAsMemory = () => {
    if (!code.trim()) return;
    const content = `[${lang} snippet]\n${code}`;
    chrome.runtime.sendMessage({ action: 'takeNote', content }, (resp) => {
      setSaveStatus(resp?.success ? 'Saved to Notes!' : 'Save failed');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  };

  const copyCode = () => navigator.clipboard.writeText(code).catch(() => {});

  return (
    <div className="flex flex-col h-full bg-[#080d14]">
      {/* Code editor area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#0d1520] border-b border-[#1a3a5c] flex-shrink-0">
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="text-xs bg-[#0a1018] border border-[#1a3a5c] rounded px-1.5 py-0.5 text-gray-300 outline-none"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <span className="text-[10px] text-gray-600 flex-1">{code.split('\n').length} lines · {code.length} chars</span>
          {saveStatus && <span className="text-[10px] text-cyan-400">{saveStatus}</span>}
          <button onClick={copyCode} disabled={!code} className="text-xs px-2 py-0.5 bg-[#1a3a5c] hover:bg-[#1a4a7c] disabled:opacity-40 rounded text-gray-300 transition-colors">📋 Copy</button>
          <button onClick={saveAsMemory} disabled={!code.trim()} className="text-xs px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800/80 disabled:opacity-40 rounded text-cyan-300 transition-colors">📒 Save</button>
        </div>

        {/* Code textarea */}
        <textarea
          className="flex-1 bg-[#060b10] text-green-300 font-mono text-xs p-3 outline-none resize-none placeholder-gray-700 min-h-0"
          placeholder={`// Write your ${lang} code here…\n// Then ask Auro anything about it below.`}
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          style={{ lineHeight: '1.6', tabSize: 2 }}
          onKeyDown={e => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const s = e.currentTarget.selectionStart;
              const v = e.currentTarget.value;
              setCode(v.substring(0, s) + '  ' + v.substring(e.currentTarget.selectionEnd));
              setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; }, 0);
            }
          }}
        />
      </div>

      {/* AI chat area */}
      <div className="flex flex-col border-t border-[#1a3a5c]" style={{ height: '40%', minHeight: '140px' }}>
        <div className="px-2 py-1 bg-[#0d1520] border-b border-[#1a3a5c] text-[10px] text-gray-500 tracking-wider uppercase flex-shrink-0">
          💻 Ask Auro about your code
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 bg-[#080d14]">
          {messages.length === 0 && (
            <div className="text-[10px] text-gray-700 py-2">Write code above, then ask a question — e.g. "How would this look architecturally?" or "Refactor this function."</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[90%] rounded px-2 py-1.5 text-xs leading-relaxed whitespace-pre-wrap break-words"
                style={m.role === 'user'
                  ? { background: 'rgba(30,80,120,0.5)', color: '#a0d4f0', border: '1px solid #1a3a5c' }
                  : { background: '#0d1520', color: '#c8e6c9', border: '1px solid #1a3a5c' }
                }
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded px-2 py-1.5 flex items-center gap-1" style={{ background: '#0d1520', border: '1px solid #1a3a5c' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-green-400" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-green-400" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-green-400" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-[10px] text-green-600">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#0d1520] border-t border-[#1a3a5c] flex-shrink-0">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI(); } }}
            placeholder="Ask about the code above…"
            className="flex-1 bg-[#060b10] border border-[#1a3a5c] rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none"
          />
          <button
            onClick={askAI}
            disabled={!question.trim() || thinking}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ background: !question.trim() || thinking ? '#1a3a5c' : '#0d6e6e', color: !question.trim() || thinking ? '#555' : '#fff' }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── WorkspacePanel ───────────────────────────────────────────────────────── */
export default function WorkspacePanel() {
  const [active, setActive] = useState('editor');

  const renderSub = () => {
    switch (active) {
      case 'editor':  return <WorkspaceEditor />;
      case 'journal': return <NotesPanel />;
      case 'grid':    return <GridView />;
      case 'codex':   return <CodexPanel />;
      case 'files':   return <DocsPanel />;
      case 'tools':   return <ToolsPanel />;
      default:        return <WorkspaceEditor />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080d14] text-gray-100">
      <div className="flex overflow-x-auto bg-[#0d1520] border-b border-[#1a3a5c] scrollbar-hide flex-shrink-0">
        {[
          { id: 'editor',  label: '📝 Editor' },
          { id: 'journal', label: '📓 Journal' },
          { id: 'grid',    label: '🗒️ Grid' },
          { id: 'codex',   label: '💻 Codex' },
          { id: 'files',   label: '📁 Files' },
          { id: 'tools',   label: '🔧 Tools' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
              active === t.id
                ? 'text-cyan-400 border-b-2 border-[#ffd700] bg-[#080d14]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {renderSub()}
      </div>
    </div>
  );
}
