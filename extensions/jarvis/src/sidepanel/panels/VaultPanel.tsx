/**
 * VaultPanel — ANIMUS v13
 *
 * Local-only secure storage for the user's important data:
 * API keys, passwords, credentials, config values, references.
 *
 * All data stays in chrome.storage.local — never leaves the device.
 * Values are masked by default; click the eye to reveal.
 */

import React, { useState, useEffect, useCallback } from 'react';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type VaultCategory = 'api_key' | 'password' | 'credential' | 'reference' | 'config';

interface VaultEntry {
  id: string;
  label: string;
  value: string;
  category: VaultCategory;
  note?: string;
  createdAt: number;
}

/* ── Constants ──────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'jarvis_vault';

const CAT_META: Record<VaultCategory, { icon: string; label: string; activeClass: string }> = {
  api_key:    { icon: '🔑', label: 'API Key',    activeClass: 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50' },
  password:   { icon: '🔐', label: 'Password',   activeClass: 'bg-red-900/40 text-red-300 border-red-800/50' },
  credential: { icon: '🪪', label: 'Credential', activeClass: 'bg-purple-900/40 text-purple-300 border-purple-800/50' },
  reference:  { icon: '📌', label: 'Reference',  activeClass: 'bg-blue-900/40 text-blue-300 border-blue-800/50' },
  config:     { icon: '⚙️', label: 'Config',     activeClass: 'bg-gray-700/60 text-gray-300 border-gray-600/50' },
};

const CATEGORIES = Object.keys(CAT_META) as VaultCategory[];

/* ── VaultPanel ─────────────────────────────────────────────────────────────── */

export default function VaultPanel() {
  const [entries, setEntries]   = useState<VaultEntry[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [adding, setAdding]     = useState(false);
  const [search, setSearch]     = useState('');
  const [copied, setCopied]     = useState<string | null>(null);

  /* form state */
  const [label, setLabel]       = useState('');
  const [value, setValue]       = useState('');
  const [note, setNote]         = useState('');
  const [category, setCategory] = useState<VaultCategory>('reference');

  /* ── Persistence ── */
  const load = useCallback(() => {
    chrome.storage.local.get([STORAGE_KEY], (d) => {
      setEntries((d[STORAGE_KEY] as VaultEntry[]) || []);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = (updated: VaultEntry[]) => {
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, load);
  };

  /* ── CRUD ── */
  const saveEntry = () => {
    if (!label.trim() || !value.trim()) return;
    const entry: VaultEntry = {
      id: 'v-' + Date.now(),
      label: label.trim(),
      value: value.trim(),
      category,
      note: note.trim() || undefined,
      createdAt: Date.now(),
    };
    persist([entry, ...entries]);
    setLabel(''); setValue(''); setNote(''); setAdding(false);
  };

  const removeEntry = (id: string) => {
    persist(entries.filter(e => e.id !== id));
    setRevealed(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const copyValue = (entry: VaultEntry) => {
    navigator.clipboard.writeText(entry.value).catch(() => {});
    setCopied(entry.id);
    setTimeout(() => setCopied(null), 1500);
  };

  /* ── Filtered list ── */
  const filtered = entries.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.label.toLowerCase().includes(q) ||
           e.category.includes(q) ||
           (e.note || '').toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-200 text-xs">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 bg-gray-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">🔐</span>
          <span className="font-bold tracking-widest text-[11px] text-white">VAULT</span>
          <span className="text-[9px] text-gray-600">{entries.length} item{entries.length !== 1 ? 's' : ''} · local only</span>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          className="text-[10px] px-2 py-0.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded transition-colors"
        >
          {adding ? '✕ Cancel' : '+ Add'}
        </button>
      </div>

      {/* ── Add form ── */}
      {adding && (
        <div className="border-b border-gray-800 bg-gray-900/80 px-3 py-2 space-y-2 flex-shrink-0">
          {/* Category selector */}
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
                  category === c ? CAT_META[c].activeClass : 'bg-gray-800 text-gray-500 border-gray-700'
                }`}
              >
                {CAT_META[c].icon} {CAT_META[c].label}
              </button>
            ))}
          </div>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Label (e.g. OpenAI Key, GitHub PAT)…"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
          />
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Value / secret…"
            type="password"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
          />
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveEntry()}
            placeholder="Optional note…"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
          />
          <button
            onClick={saveEntry}
            disabled={!label.trim() || !value.trim()}
            className="w-full py-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
          >
            Save to Vault
          </button>
        </div>
      )}

      {/* ── Search ── */}
      <div className="px-3 py-1.5 border-b border-gray-800/40 flex-shrink-0">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vault…"
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
        />
      </div>

      {/* ── Entry list ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-10 space-y-2">
            <div className="text-3xl">🔐</div>
            <div>{search ? 'No matches in vault.' : 'Vault is empty.'}</div>
            {!search && (
              <div className="text-gray-700 text-[10px] px-4 leading-relaxed">
                Store API keys, passwords, credentials, and references here.<br />
                Everything stays on your device — never leaves Chrome.
              </div>
            )}
          </div>
        )}

        {filtered.map(entry => {
          const meta = CAT_META[entry.category];
          const isRevealed = revealed.has(entry.id);
          const masked = '•'.repeat(Math.min(entry.value.length, 20));

          return (
            <div
              key={entry.id}
              className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-800/30 transition-colors group"
            >
              <span className="text-base flex-shrink-0">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-gray-200 truncate">{entry.label}</span>
                  <span className={`text-[8px] px-1.5 py-px rounded border ${meta.activeClass}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-gray-500 mt-0.5 truncate">
                  {isRevealed ? entry.value : masked}
                </div>
                {entry.note && (
                  <div className="text-[9px] text-gray-700 truncate mt-0.5">{entry.note}</div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleReveal(entry.id)}
                  title={isRevealed ? 'Hide' : 'Reveal'}
                  className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {isRevealed ? '🙈' : '👁'}
                </button>
                <button
                  onClick={() => copyValue(entry)}
                  title="Copy to clipboard"
                  className={`text-[10px] transition-colors ${
                    copied === entry.id ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {copied === entry.id ? '✓' : '📋'}
                </button>
                <button
                  onClick={() => removeEntry(entry.id)}
                  title="Delete"
                  className="text-[10px] text-red-600 hover:text-red-400 transition-colors"
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer note ── */}
      <div className="px-3 py-1.5 border-t border-gray-800 bg-gray-900/40 flex-shrink-0">
        <p className="text-[9px] text-gray-700">🔒 Stored in chrome.storage.local. Never synced or transmitted.</p>
      </div>
    </div>
  );
}
