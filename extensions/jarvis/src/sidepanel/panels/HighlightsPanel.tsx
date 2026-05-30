import React, { useEffect, useState, useCallback } from 'react';

interface HighlightEntry {
  id: string;
  url: string;
  title: string;
  text: string;
  context: string;
  color: string;
  timestamp: number;
  tags: string[];
}

type GroupedHighlights = Record<string, HighlightEntry[]>;

function groupBySite(highlights: HighlightEntry[]): GroupedHighlights {
  const grouped: GroupedHighlights = {};
  for (const h of highlights) {
    let site = h.url;
    try { site = new URL(h.url).hostname.replace(/^www\./, ''); } catch { /* keep raw url */ }
    if (!grouped[site]) grouped[site] = [];
    grouped[site].push(h);
  }
  return grouped;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return new Date(ts).toLocaleDateString();
}

const COLOR_NAMES: Record<string, string> = {
  '#fbbf24': '🟡',
  '#f87171': '🔴',
  '#34d399': '🟢',
  '#60a5fa': '🔵',
  '#c084fc': '🟣',
};

export default function HighlightsPanel() {
  const [highlights, setHighlights] = useState<HighlightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const loadHighlights = useCallback(() => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'getHighlights' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) { setLoading(false); return; }
      setHighlights(resp.highlights || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadHighlights(); }, [loadHighlights]);

  const handleDelete = (id: string) => {
    chrome.runtime.sendMessage({ action: 'deleteHighlight', id }, (resp) => {
      if (resp?.success) {
        setHighlights(prev => prev.filter(h => h.id !== id));
        setStatus('Highlight deleted.');
        setTimeout(() => setStatus(''), 2000);
      }
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {});
  };

  const handleExportAll = () => {
    chrome.runtime.sendMessage({ action: 'exportHighlights' }, (resp) => {
      if (!resp?.success || !resp.json) return;
      const blob = new Blob([resp.json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'animus-highlights-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Highlights exported.');
      setTimeout(() => setStatus(''), 2000);
    });
  };

  const grouped = groupBySite(highlights);
  const sites = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 text-xs overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-cyan-400 font-bold">📌 Highlights</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{highlights.length} saved</span>
          <button
            onClick={handleExportAll}
            disabled={highlights.length === 0}
            className="px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 disabled:opacity-40 transition-colors"
          >
            ⬇ Export All
          </button>
          <button
            onClick={loadHighlights}
            className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            ↻
          </button>
        </div>
      </div>

      {status && (
        <div className="mx-3 mt-2 px-2 py-1 bg-green-900/30 border border-green-800/40 rounded text-green-400 text-xs">
          {status}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {loading && (
          <div className="text-center text-gray-500 mt-8">Loading highlights…</div>
        )}

        {!loading && highlights.length === 0 && (
          <div className="text-center text-gray-600 mt-8 space-y-1">
            <div className="text-2xl">📌</div>
            <div className="text-gray-500">No highlights yet.</div>
            <div className="text-gray-700 text-xs">
              Select text on any page and save it as a highlight.
            </div>
          </div>
        )}

        {!loading && sites.map(site => (
          <div key={site}>
            {/* Site header */}
            <div className="text-gray-500 font-semibold mb-1 px-1 flex items-center gap-1">
              <span>🌐</span>
              <span className="truncate">{site}</span>
              <span className="text-gray-700">({grouped[site].length})</span>
            </div>

            {/* Highlights for this site */}
            {grouped[site].map(h => (
              <div
                key={h.id}
                className="mb-2 rounded-lg border border-gray-800/60 bg-gray-900/60 overflow-hidden"
              >
                {/* Color tag strip + meta */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800/40">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: h.color || '#fbbf24' }}
                    title={COLOR_NAMES[h.color] || h.color}
                  />
                  <span className="text-gray-400 truncate flex-1">
                    {h.title || site}
                  </span>
                  <span className="text-gray-600 flex-shrink-0">{timeAgo(h.timestamp)}</span>
                </div>

                {/* Highlight text */}
                <div className="px-3 py-2 text-gray-200 leading-relaxed">
                  &ldquo;{h.text}&rdquo;
                </div>

                {/* Context snippet */}
                {h.context && (
                  <div className="px-3 pb-1 text-gray-600 italic text-xs">
                    {h.context.substring(0, 120)}{h.context.length > 120 ? '…' : ''}
                  </div>
                )}

                {/* Tags */}
                {h.tags && h.tags.length > 0 && (
                  <div className="px-3 pb-1 flex flex-wrap gap-1">
                    {h.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-500 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 px-3 pb-2">
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
                    title={h.url}
                  >
                    🔗
                  </a>
                  <button
                    onClick={() => handleCopy(h.text, h.id)}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
                  >
                    {copied === h.id ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="px-2 py-0.5 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors ml-auto"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
