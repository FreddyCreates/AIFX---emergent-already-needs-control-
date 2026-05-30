/**
 * MirrorPanel — ANIMUS v13
 *
 * Jarvis's virtual display canvas. He can push any content here —
 * agent reports, text summaries, image URLs, web URLs — for the user
 * to review while Jarvis keeps working. Think of it as his screen
 * that he can show things on before handing them over.
 *
 * Content sources:
 *  - Auto: every completed agent pushes its report here (_agentComplete)
 *  - Auto: clipboard copy on any page → pushed here immediately
 *  - Auto: background sends _mirrorPush for any explicit show request
 *  - Manual: user can "Fetch & Analyze" — Jarvis actually fetches + parses the URL
 *  - Manual: user can load any URL into the iframe canvas
 *
 * Smart actions on any item:
 *  → Research  deploy a researcher agent on this content
 *  → Analyze   send to Chat for deep analysis
 *  → Expand    ask Jarvis to go deeper
 *  → Note      save to Journal with context
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useJarvisStore } from '../../store';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type MirrorType = 'text' | 'report' | 'image' | 'url';

interface MirrorItem {
  id: string;
  type: MirrorType;
  title: string;
  content: string;
  meta?: string;
  pushedAt: number;
  author: string;
}

/* ── MirrorPanel ────────────────────────────────────────────────────────────── */

export default function MirrorPanel() {
  const { setActivePanel } = useJarvisStore();

  const [items, setItems]         = useState<MirrorItem[]>([]);
  const [cursor, setCursor]       = useState(0);
  const [urlInput, setUrlInput]   = useState('');
  const [copyDone, setCopyDone]   = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [fetching, setFetching]   = useState(false);

  /* ── Push a new item to the front of the stack ── */
  const push = useCallback((item: MirrorItem) => {
    setItems(prev => [item, ...prev].slice(0, 30));
    setCursor(0);
  }, []);

  /* ── Listen for background pushes ── */
  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      /* Auto-push from completed agent */
      if (msg.action === '_agentComplete') {
        const agent = msg.agent as Record<string, unknown>;
        const steps  = (agent.steps  as Array<Record<string, unknown>>  ) || [];
        const report = (agent.report as string) ||
          steps.filter(s => s['extract'])
               .map(s => String(s['label']) + ':\n' + String(s['extract']))
               .join('\n\n---\n\n');
        if (!report.trim()) return;
        push({
          id: 'agent-' + Date.now(),
          type: 'report',
          title: String(agent.name || 'Agent') + ' Report',
          content: report,
          meta: String(agent.mission || ''),
          pushedAt: Date.now(),
          author: 'ANIMUS',
        });
        return;
      }

      /* Explicit push from background or any component */
      if (msg.action === '_mirrorPush') {
        const c = msg.content as Record<string, unknown>;
        push({
          id: 'push-' + Date.now(),
          type: (c['type'] as MirrorType) || 'text',
          title: String(c['title'] || 'ANIMUS'),
          content: String(c['data'] || ''),
          meta: c['meta'] ? String(c['meta']) : undefined,
          pushedAt: Date.now(),
          author: 'ANIMUS',
        });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [push]);

  /* ── Load a URL into the canvas (iframe) ── */
  const loadUrl = () => {
    const raw = urlInput.trim();
    if (!raw) return;
    const url = raw.startsWith('http') ? raw : 'https://' + raw;
    push({ id: 'url-' + Date.now(), type: 'url', title: url, content: url, pushedAt: Date.now(), author: 'User' });
    setUrlInput('');
  };

  /* ── Fetch & analyze a URL using Jarvis's real scraper ── */
  const fetchAndAnalyze = () => {
    const raw = urlInput.trim();
    if (!raw || fetching) return;
    const url = raw.startsWith('http') ? raw : 'https://' + raw;
    setFetching(true);
    setUrlInput('');
    push({
      id: 'fetch-' + Date.now(), type: 'text',
      title: '⏳ Fetching ' + url.substring(0, 50) + '…',
      content: 'Jarvis is fetching and analyzing this URL. Report will appear here when ready.',
      pushedAt: Date.now(), author: 'ANIMUS',
    });
    chrome.runtime.sendMessage({ action: 'agiSummarize', url }, (resp) => {
      setFetching(false);
      const result = resp?.success ? resp.message : ('Fetch failed: ' + (resp?.message || 'Unknown error'));
      // Replace the spinner item with the real result
      setItems(prev => {
        const updated = [...prev];
        const spinnerIdx = updated.findIndex(i => i.title.startsWith('⏳ Fetching'));
        if (spinnerIdx !== -1) {
          updated[spinnerIdx] = {
            ...updated[spinnerIdx],
            id: 'fetched-' + Date.now(),
            title: '📄 ' + url.split('/')[2],
            content: result,
            meta: url,
          };
        }
        return updated;
      });
    });
  };

  /* ── Save current item to notes ── */
  const saveToNotes = () => {
    const item = items[cursor];
    if (!item) return;
    const content = item.title + '\n\n' + item.content;
    chrome.runtime.sendMessage({ action: 'takeNote', content }, () => {});
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1600);
  };

  /* ── Copy current item content ── */
  const copyContent = () => {
    const item = items[cursor];
    if (!item) return;
    navigator.clipboard.writeText(item.content).catch(() => {});
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 1400);
  };

  /* ── Remove current item ── */
  const removeItem = () => {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== cursor);
      if (cursor >= next.length && cursor > 0) setCursor(cursor - 1);
      return next;
    });
  };

  /* ── Smart actions — send content to Jarvis for work ── */
  const smartResearch = () => {
    const item = items[cursor];
    if (!item) return;
    const topic = item.title.replace(/^[📄📋🤖⏳✅🌐💡⚡]\s*/, '').substring(0, 80);
    chrome.runtime.sendMessage({
      action: 'deployAgent',
      agentType: 'researcher',
      mission: 'Research: ' + topic,
      target: item.meta || topic,
    });
    setActivePanel('agents');
  };

  const smartAnalyze = () => {
    const item = items[cursor];
    if (!item) return;
    chrome.runtime.sendMessage({
      action: 'executeCommand',
      command: 'analyze: ' + item.title + '\n\n' + item.content.substring(0, 600),
    });
    setActivePanel('chat');
  };

  const smartExpand = () => {
    const item = items[cursor];
    if (!item) return;
    chrome.runtime.sendMessage({
      action: 'executeCommand',
      command: 'expand and go deeper on: ' + item.title + '\n\n' + item.content.substring(0, 400),
    });
    setActivePanel('chat');
  };

  const current = items[cursor];

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-200 text-xs">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 bg-gray-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-cyan-300">🪞</span>
          <span className="font-bold tracking-widest text-[11px] text-white">MIRROR</span>
          {items.length > 0 && (
            <span className="text-[9px] text-gray-600 px-1.5 py-0.5 bg-gray-800 rounded">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {items.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCursor(c => Math.min(c + 1, items.length - 1))}
              disabled={cursor >= items.length - 1}
              className="text-[10px] px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded transition-colors"
            >‹</button>
            <span className="text-[9px] text-gray-600">{cursor + 1}/{items.length}</span>
            <button
              onClick={() => setCursor(c => Math.max(c - 1, 0))}
              disabled={cursor <= 0}
              className="text-[10px] px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded transition-colors"
            >›</button>
          </div>
        )}
      </div>

      {/* ── URL loader ── */}
      <div className="flex flex-col gap-1 px-3 py-1.5 border-b border-gray-800/40 bg-gray-900/20 flex-shrink-0">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchAndAnalyze()}
            placeholder="URL to fetch & analyze…"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
          />
          <button
            onClick={fetchAndAnalyze}
            disabled={!urlInput.trim() || fetching}
            title="Jarvis fetches, reads, and summarizes the URL"
            className="px-2 py-1 bg-cyan-800 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors text-[10px] whitespace-nowrap"
          >
            {fetching ? '⏳' : '⚡ Fetch'}
          </button>
          <button
            onClick={loadUrl}
            disabled={!urlInput.trim() || fetching}
            title="Load URL in iframe canvas"
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-300 rounded transition-colors text-[10px]"
          >
            🖼
          </button>
        </div>
        <p className="text-[9px] text-gray-700">⚡ Fetch = Jarvis reads + summarizes. 🖼 = iframe canvas.</p>
      </div>

      {/* ── Main canvas ── */}
      <div className="flex-1 overflow-hidden relative">

        {/* Empty state */}
        {!current && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
            <div className="text-4xl opacity-20">🪞</div>
            <div className="text-[11px] font-semibold text-gray-500">Nothing here yet</div>
            <div className="text-[10px] text-gray-700 leading-relaxed">
              When Jarvis completes an agent mission, the report appears here automatically.<br /><br />
              You can also tell him: <em className="text-gray-600">"show me the results"</em> or load any URL above.<br /><br />
              Jarvis uses this as his workspace display — he'll surface content here before handing it to you.
            </div>
          </div>
        )}

        {/* URL iframe */}
        {current?.type === 'url' && (
          <iframe
            src={current.content}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title={current.title}
          />
        )}

        {/* Image */}
        {current?.type === 'image' && (
          <div className="flex flex-col h-full overflow-y-auto p-3 gap-2">
            <div className="text-[10px] text-gray-500">{current.title}</div>
            <img
              src={current.content}
              alt={current.title}
              className="max-w-full rounded border border-gray-800"
            />
          </div>
        )}

        {/* Text / Report */}
        {(current?.type === 'text' || current?.type === 'report') && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Item header */}
            <div className="flex items-start justify-between gap-2 px-3 py-1.5 border-b border-gray-800/40 bg-gray-900/30 flex-shrink-0">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-gray-100 truncate">{current.title}</div>
                {current.meta && (
                  <div className="text-[9px] text-gray-600 truncate mt-0.5">{current.meta}</div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {current.type === 'report' && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-green-900/40 border border-green-800/50 text-green-400 rounded">
                    Report
                  </span>
                )}
                <span className="text-[9px] px-1.5 py-0.5 bg-cyan-900/30 border border-cyan-800/40 text-cyan-400 rounded">
                  {current.author}
                </span>
                <span className="text-[9px] text-gray-700">
                  {new Date(current.pushedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3">
              <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {current.content}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions bar ── */}
      {current && (
        <div className="border-t border-gray-800/60 bg-gray-900/30 flex-shrink-0">
          {/* Smart actions row */}
          {(current.type === 'text' || current.type === 'report') && (
            <div className="flex gap-1 px-3 py-1 border-b border-gray-800/30">
              <button
                onClick={smartResearch}
                title="Deploy a researcher agent on this content"
                className="flex-1 text-[9px] py-0.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded transition-colors"
              >
                🔬 Research
              </button>
              <button
                onClick={smartAnalyze}
                title="Send to Chat for deep analysis"
                className="flex-1 text-[9px] py-0.5 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 rounded transition-colors"
              >
                📊 Analyze
              </button>
              <button
                onClick={smartExpand}
                title="Ask Jarvis to expand and go deeper"
                className="flex-1 text-[9px] py-0.5 bg-green-900/30 hover:bg-green-900/50 text-green-300 rounded transition-colors"
              >
                🔭 Expand
              </button>
            </div>
          )}
          {/* Standard actions row */}
          <div className="flex gap-1.5 px-3 py-1.5">
            <button
              onClick={copyContent}
              className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                copyDone ? 'bg-green-800/60 text-green-300' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {copyDone ? '✓ Copied' : '📋 Copy'}
            </button>
            {current.type !== 'url' && (
              <button
                onClick={saveToNotes}
                className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                  noteSaved ? 'bg-green-800/60 text-green-300' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {noteSaved ? '✓ Saved' : '📓 Journal'}
              </button>
            )}
            <button
              onClick={removeItem}
              className="text-[10px] py-1 px-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
