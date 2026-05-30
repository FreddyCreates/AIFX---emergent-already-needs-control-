import React, { useState } from 'react';

interface ToolResult {
  success: boolean;
  message?: string;
  pageData?: any;
  summary?: any;
  links?: any[];
}

export default function ToolsPanel() {
  const [result, setResult] = useState<ToolResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');

  const run = (action: string, label: string, extra?: Record<string, unknown>) => {
    setLoading(true);
    setLoadingLabel(label);
    setResult(null);
    chrome.runtime.sendMessage({ action, ...extra }, (resp) => {
      setLoading(false);
      setLoadingLabel('');
      if (chrome.runtime.lastError) {
        setResult({ success: false, message: chrome.runtime.lastError.message });
        return;
      }
      setResult(resp);
    });
  };

  const searchWeb = () => {
    const q = prompt('Search for:');
    if (q) run('searchWeb', 'Search', { query: q });
  };

  const draftEmail = () => {
    const to = prompt('To (email):') || '';
    const subject = prompt('Subject:') || '';
    const body = prompt('Body:') || '';
    if (subject || body) run('draftEmail', 'Email', { to, subject, body });
  };

  const formatResult = (r: ToolResult): string => {
    if (!r.success) return '❌ ' + (r.message || 'Failed');
    if (r.summary) {
      const s = r.summary;
      return `📄 "${s.title}"\n${s.wordCount} words, ${s.headingCount} headings\n\nKey points:\n${(s.keyPoints || []).join('\n')}`;
    }
    if (r.pageData) {
      const p = r.pageData;
      return `📖 "${p.title}"\n${p.wordCount} words, ${p.linkCount} links\n\n${p.text?.substring(0, 400)}…`;
    }
    if (r.links) {
      return r.links.slice(0, 30).map((l: any) => `• ${l.text || '(no text)'}: ${l.href}`).join('\n');
    }
    return r.message || '✅ Done';
  };

  const TOOLS = [
    { label: '🔬 Analyze Page', action: 'analyzeCurrentPage', extra: undefined },
    { label: '📋 Summarize', action: 'summarize', extra: undefined },
    { label: '🔗 Extract Links', action: 'extractLinks', extra: undefined },
    { label: '🌐 Search Web', action: null, extra: undefined },
    { label: '📧 Draft Email', action: null, extra: undefined },
    { label: '🔬 Research Mode', action: 'runSovereignTool', extra: { tool: 'researchMode', params: { topic: 'general' } } },
  ];

  const handleTool = (t: typeof TOOLS[number]) => {
    if (t.action === null && t.label.includes('Search')) { searchWeb(); return; }
    if (t.action === null && t.label.includes('Email')) { draftEmail(); return; }
    if (t.action) run(t.action, t.label, t.extra);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-2 gap-2 p-3">
        {TOOLS.map((t) => (
          <button
            key={t.label}
            onClick={() => handleTool(t)}
            disabled={loading}
            className="py-2 px-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-xs text-gray-200 transition-colors text-left"
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="px-3 text-xs text-cyan-400 animate-pulse">{loadingLabel}…</div>
      )}

      {result && (
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{result.success ? '✅ Result' : '❌ Error'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(formatResult(result)).catch(() => {})}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              title="Copy result"
            >
              📋
            </button>
          </div>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-900/60 rounded p-2 border border-gray-800">
            {formatResult(result)}
          </pre>
        </div>
      )}
    </div>
  );
}
