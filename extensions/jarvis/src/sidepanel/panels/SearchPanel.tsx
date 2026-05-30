import React, { useState } from 'react';

interface SearchResult {
  type: string;
  title: string;
  text: string;
  url: string;
  source: string;
}

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    chrome.runtime.sendMessage({ action: 'sandboxSearch', query: query.trim() }, (resp) => {
      setLoading(false);
      if (chrome.runtime.lastError || !resp?.success) return;
      setResults(resp.results || []);
    });
  };

  const typeColor = (type: string) => {
    if (type === 'answer') return 'border-cyan-700/50 bg-cyan-950/30';
    if (type === 'abstract') return 'border-purple-700/50 bg-purple-950/30';
    return 'border-gray-700/50 bg-gray-900/30';
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={search} className="flex gap-2 px-2 py-2 border-b border-gray-800 bg-gray-900/50">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Animus knowledge…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 text-white rounded-lg text-xs transition-colors"
        >
          🔍
        </button>
      </form>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {loading && <div className="text-xs text-cyan-400 animate-pulse text-center py-4">Searching…</div>}
        {!loading && results.length === 0 && query && (
          <div className="text-xs text-gray-600 text-center py-4">No results</div>
        )}
        {results.map((r, i) => (
          <div key={i} className={`rounded-lg p-2.5 border text-xs ${typeColor(r.type)}`}>
            <div className="font-semibold text-gray-200 mb-1">{r.title}</div>
            <div className="text-gray-400 leading-relaxed">{r.text}</div>
            {r.url && (
              <div className="mt-1 text-purple-400 text-xs truncate">{r.source}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
