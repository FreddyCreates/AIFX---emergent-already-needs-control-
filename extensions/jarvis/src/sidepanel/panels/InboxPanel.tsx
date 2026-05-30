/**
 * InboxPanel — ANIMUS v13
 *
 * Jarvis's proactive outbox to the user. This is where Jarvis sends YOU
 * things without you asking:
 *
 *  - 🌐 Tab briefs: every time you switch to a new tab, Jarvis reads the
 *    domain/title and sends you a contextual brief with what he can do.
 *
 *  - 📋 Clipboard intel: every time you copy something on any page, Jarvis
 *    captures it, classifies it (URL / code / text / data), and tells you
 *    what he can do with it. The raw content is also staged in Mirror.
 *
 *  - 🤖 Agent updates: when an agent completes a mission, an inbox item
 *    fires alongside the Mirror report so you always know what happened.
 *
 *  - 💡 Insights: periodic pattern observations from Jarvis based on what
 *    you've been doing this session.
 *
 *  - ⚡ Alerts: anomalies, blocked fetches, timer expirations.
 *
 * Each item has action buttons: → Mirror, → Analyze (Chat), → Note, 🗑 dismiss.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useJarvisStore } from '../../store';

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type InboxCategory = 'tab' | 'agent' | 'clipboard' | 'insight' | 'alert';

export interface InboxItem {
  id: string;
  category: InboxCategory;
  title: string;
  body: string;
  meta?: string;
  timestamp: number;
  read: boolean;
}

const CAT_META: Record<InboxCategory, { icon: string; cls: string; label: string }> = {
  tab:       { icon: '🌐', cls: 'bg-blue-900/30 border-blue-800/50 text-blue-300',        label: 'Tab Brief' },
  agent:     { icon: '🤖', cls: 'bg-green-900/30 border-green-800/50 text-green-300',     label: 'Agent' },
  clipboard: { icon: '📋', cls: 'bg-yellow-900/30 border-yellow-800/50 text-yellow-300',  label: 'Clipboard' },
  insight:   { icon: '💡', cls: 'bg-purple-900/30 border-purple-800/50 text-purple-300',  label: 'Insight' },
  alert:     { icon: '⚡', cls: 'bg-red-900/30 border-red-800/50 text-red-400',           label: 'Alert' },
};

/* ── InboxPanel ─────────────────────────────────────────────────────────────── */

export default function InboxPanel() {
  const { setActivePanel } = useJarvisStore();

  const [items, setItems]     = useState<InboxItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter]   = useState<InboxCategory | 'all'>('all');
  const [noted, setNoted]     = useState<string | null>(null);

  /* ── Load from background on mount ── */
  const load = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'listInbox' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setItems(resp.items || []);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Real-time push from background ── */
  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      if (msg.action === '_inboxPush') {
        setItems(prev => [msg.item as InboxItem, ...prev].slice(0, 100));
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  /* ── Actions ── */
  const markRead = (id: string) => {
    chrome.runtime.sendMessage({ action: 'markInboxRead', id }, () => {
      setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
    });
  };

  const dismiss = (id: string) => {
    chrome.runtime.sendMessage({ action: 'dismissInbox', id }, () => {
      setItems(prev => prev.filter(i => i.id !== id));
    });
  };

  const clearAll = () => {
    chrome.runtime.sendMessage({ action: 'clearInbox' }, () => setItems([]));
  };

  const sendToMirror = (item: InboxItem, e: React.MouseEvent) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({
      action: 'mirrorPush',
      content: { type: 'text', title: item.title, data: item.body, meta: item.meta },
    });
    setActivePanel('mirror');
  };

  const sendToChat = (item: InboxItem, e: React.MouseEvent) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({
      action: 'executeCommand',
      command: 'analyze: ' + item.title + '\n\n' + item.body.substring(0, 500),
    });
    setActivePanel('chat');
  };

  const saveNote = (item: InboxItem, e: React.MouseEvent) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({
      action: 'takeNote',
      content: '[' + CAT_META[item.category].label + '] ' + item.title + '\n\n' + item.body,
    }, () => {
      setNoted(item.id);
      setTimeout(() => setNoted(null), 1500);
    });
  };

  /* ── Derived ── */
  const unread   = items.filter(i => !i.read).length;
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-200 text-xs">

      {/* ── Email to self ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/60 bg-gray-900/30 flex-shrink-0">
        <input
          type="email"
          placeholder="your@email.com"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-700"
          id="inbox-email-input"
        />
        <button
          onClick={() => {
            const inp = document.getElementById('inbox-email-input') as HTMLInputElement;
            const addr = inp?.value?.trim();
            if (!addr) return;
            const subject = encodeURIComponent('Vigil AI Inbox Export — ' + new Date().toLocaleDateString());
            const body = encodeURIComponent(items.map(i => `[${CAT_META[i.category].label}] ${i.title}\n${i.body}`).join('\n\n---\n\n'));
            window.open(`mailto:${addr}?subject=${subject}&body=${body}`);
          }}
          className="text-[10px] px-2 py-1 bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-800/50 text-cyan-300 rounded transition-colors whitespace-nowrap"
        >
          ✉ Email me
        </button>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 bg-gray-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-cyan-300">📥</span>
          <span className="font-bold tracking-widest text-[11px] text-white">INBOX</span>
          {unread > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 bg-cyan-800/60 border border-cyan-700/50 text-cyan-300 rounded animate-pulse">
              {unread} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={load} className="text-[9px] text-cyan-600 hover:text-cyan-400 transition-colors">↻</button>
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[9px] px-1.5 py-0.5 text-gray-600 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Category filter tabs ── */}
      <div className="flex gap-1 px-3 py-1.5 border-b border-gray-800/40 overflow-x-auto scrollbar-hide flex-shrink-0">
        {(['all', 'tab', 'agent', 'clipboard', 'insight', 'alert'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 text-[9px] px-2 py-0.5 rounded border transition-colors ${
              filter === cat
                ? cat === 'all'
                  ? 'bg-gray-600 text-gray-200 border-gray-500'
                  : CAT_META[cat as InboxCategory].cls
                : 'bg-gray-800 text-gray-600 border-gray-700'
            }`}
          >
            {cat === 'all'
              ? 'All (' + items.length + ')'
              : CAT_META[cat as InboxCategory].icon + ' ' + CAT_META[cat as InboxCategory].label}
          </button>
        ))}
      </div>

      {/* ── Feed ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40">

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
            <div className="text-4xl opacity-20">📥</div>
            <div className="text-[11px] font-semibold text-gray-500">Inbox empty</div>
            <div className="text-[10px] text-gray-700 leading-relaxed">
              Jarvis sends you briefs here automatically — no asking required.<br /><br />
              <span className="text-gray-600">Switch tabs</span> → tab briefs appear.<br />
              <span className="text-gray-600">Copy text on any page</span> → clipboard intel appears.<br />
              <span className="text-gray-600">Agent completes</span> → report appears here + Mirror.
            </div>
          </div>
        )}

        {filtered.map(item => {
          const meta   = CAT_META[item.category];
          const isOpen = expanded === item.id;

          return (
            <div
              key={item.id}
              className={`px-3 py-2.5 hover:bg-gray-800/20 transition-colors cursor-pointer ${
                !item.read ? 'border-l-2 border-l-cyan-600/70' : 'border-l-2 border-l-transparent'
              }`}
              onClick={() => {
                setExpanded(isOpen ? null : item.id);
                if (!item.read) markRead(item.id);
              }}
            >
              <div className="flex items-start gap-2">
                {/* Category icon */}
                <span className="text-base flex-shrink-0 mt-0.5">{meta.icon}</span>

                <div className="flex-1 min-w-0">
                  {/* Row header */}
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-px rounded border font-medium ${meta.cls}`}>
                      {meta.label}
                    </span>
                    <span className="text-[8px] text-gray-700">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 animate-pulse" />
                    )}
                  </div>

                  {/* Title */}
                  <div className="text-[11px] font-semibold text-gray-100 truncate">{item.title}</div>

                  {/* Body — collapsed: first line; expanded: full */}
                  <div className={`text-[10px] text-gray-400 mt-0.5 leading-relaxed ${isOpen ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                    {item.body}
                  </div>

                  {/* Source meta */}
                  {item.meta && (
                    <div className="text-[9px] text-gray-700 truncate mt-0.5">{item.meta}</div>
                  )}

                  {/* Expanded action bar */}
                  {isOpen && (
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => sendToMirror(item, e)}
                        className="text-[9px] px-2 py-0.5 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-800/50 text-cyan-300 rounded transition-colors"
                      >
                        🪞 Mirror
                      </button>
                      <button
                        onClick={e => sendToChat(item, e)}
                        className="text-[9px] px-2 py-0.5 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-800/50 text-cyan-300 rounded transition-colors"
                      >
                        💬 Analyze
                      </button>
                      <button
                        onClick={e => saveNote(item, e)}
                        className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
                          noted === item.id
                            ? 'bg-green-800/60 border-green-700 text-green-300'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-400'
                        }`}
                      >
                        {noted === item.id ? '✓ Noted' : '📓 Note'}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(item.id); }}
                        className="text-[9px] px-1.5 py-0.5 text-red-700 hover:text-red-400 transition-colors ml-auto"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                <span className="text-[9px] text-gray-700 flex-shrink-0 mt-0.5">
                  {isOpen ? '▲' : '▼'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer hint ── */}
      {items.length > 0 && (
        <div className="px-3 py-1.5 border-t border-gray-800 bg-gray-900/40 flex-shrink-0">
          <p className="text-[9px] text-gray-700">
            {items.length} item{items.length !== 1 ? 's' : ''} this session · tap any item to expand + take action
          </p>
        </div>
      )}
    </div>
  );
}
