import React, { useState, useEffect } from 'react';

interface MemoryEntry {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  tags: string[];
  coords: { ring: number; beat: number; rho: number };
  timestamp: number;
  visitCount: number;
}

export default function MemoryPanel() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ count: number; rings: number[] } | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = (q?: string) => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'memoryGet', query: q || '' }, (resp) => {
      setLoading(false);
      if (chrome.runtime.lastError || !resp?.success) return;
      setEntries(resp.entries || []);
      setStats(resp.stats || null);
    });
  };

  const handleSaveCurrent = () => {
    setStatus('Saving…');
    chrome.runtime.sendMessage({ action: 'memorySaveCurrent' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) { setStatus('❌ Error'); return; }
      setStatus('✓ Saved');
      loadMemories(query);
      setTimeout(() => setStatus(''), 2000);
    });
  };

  const handleDelete = (id: string) => {
    chrome.runtime.sendMessage({ action: 'memoryDelete', id }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setEntries(prev => prev.filter(e => e.id !== id));
      if (stats) setStats({ ...stats, count: stats.count - 1 });
    });
  };

  const handleSearch = () => loadMemories(query);

  // Group entries by ring
  const byRing: Record<number, MemoryEntry[]> = {};
  entries.forEach(e => {
    if (!byRing[e.coords.ring]) byRing[e.coords.ring] = [];
    byRing[e.coords.ring].push(e);
  });
  const rings = Object.keys(byRing).map(Number).sort((a, b) => b - a);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <div>
          <span className="font-bold text-white tracking-widest">MEMORY PALACE</span>
          <span className="ml-2 text-xs text-gray-500">φ-encoded spatial memory</span>
        </div>
        <div className="flex items-center gap-2">
          {stats && <span className="text-xs text-gray-500">{stats.count} nodes</span>}
          {status && <span className="text-xs text-green-400">{status}</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-1 px-3 py-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search memories…"
          className="flex-1 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500"
        />
        <button onClick={handleSearch} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 transition-colors">🔍</button>
        <button onClick={handleSaveCurrent} className="px-2 py-1 bg-purple-900/50 hover:bg-purple-800/70 border border-purple-700/50 rounded text-xs text-purple-300 transition-colors">+ Save Page</button>
      </div>

      {/* Memory rings */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
        {loading && <div className="text-xs text-gray-500 animate-pulse">Loading palace…</div>}

        {!loading && entries.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs">
            <div className="text-2xl mb-2">🏛</div>
            <div>Memory Palace is empty.</div>
            <div className="mt-1">Save pages to begin building your spatial memory.</div>
          </div>
        )}

        {rings.map(ring => (
          <div key={ring}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="text-xs text-purple-400 font-mono">Ring {ring}</div>
              <div className="flex-1 h-px bg-purple-900/40" />
              <div className="text-xs text-gray-600">{byRing[ring].length}</div>
            </div>
            <div className="space-y-1.5">
              {byRing[ring].map(entry => (
                <div key={entry.id} className="p-2 rounded bg-gray-800/60 border border-gray-700/50 hover:border-purple-700/40 transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline truncate flex-1"
                    >
                      {entry.title || entry.url}
                    </a>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                  {entry.excerpt && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{entry.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600 font-mono">φ={entry.coords.beat.toFixed(3)} ρ={entry.coords.rho.toFixed(2)}</span>
                    {entry.visitCount > 1 && <span className="text-xs text-purple-400">×{entry.visitCount}</span>}
                    <span className="text-xs text-gray-700">{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.tags.map(t => (
                        <span key={t} className="px-1 py-0.5 rounded bg-gray-700/60 text-xs text-gray-400">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
