import React, { useState } from 'react';

type ToolId = 'summarize' | 'tables' | 'diff' | 'forge' | 'scout';

interface ToolResult {
  toolId: ToolId;
  output: string;
  loading: boolean;
  error?: string;
}

const send = (action: string, extra: Record<string, unknown> = {}): Promise<{ success: boolean; message?: string }> =>
  chrome.runtime.sendMessage({ action, ...extra });

export default function AGIToolsPanel() {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [diffUrl1, setDiffUrl1] = useState('');
  const [diffUrl2, setDiffUrl2] = useState('');
  const [results, setResults] = useState<Record<ToolId, ToolResult | null>>({
    summarize: null, tables: null, diff: null, forge: null, scout: null,
  });

  const setLoading = (toolId: ToolId) =>
    setResults(r => ({ ...r, [toolId]: { toolId, output: '', loading: true } }));

  const setDone = (toolId: ToolId, output: string, error?: string) =>
    setResults(r => ({ ...r, [toolId]: { toolId, output, loading: false, error } }));

  const runSummarize = async () => {
    if (!url1.trim()) return;
    setLoading('summarize');
    const r = await send('agiSummarize', { url: url1.trim() });
    setDone('summarize', r.message || '(no result)', r.success ? undefined : r.message);
  };

  const runTables = async () => {
    if (!url1.trim()) return;
    setLoading('tables');
    const r = await send('agiExtractTables', { url: url1.trim() });
    setDone('tables', r.message || '(no tables)', r.success ? undefined : r.message);
  };

  const runDiff = async () => {
    if (!diffUrl1.trim() || !diffUrl2.trim()) return;
    setLoading('diff');
    const r = await send('agiDiff', { url1: diffUrl1.trim(), url2: diffUrl2.trim() });
    setDone('diff', r.message || '(no diff)', r.success ? undefined : r.message);
  };

  const runForge = async () => {
    setLoading('forge');
    const r = await send('agiForgeReport');
    setDone('forge', r.message || '(no reports)', r.success ? undefined : r.message);
  };

  const runScout = async () => {
    if (!url2.trim()) return;
    setLoading('scout');
    const r = await send('agiScout', { url: url2.trim() });
    setDone('scout', r.message || '(no result)', r.success ? undefined : r.message);
  };

  const copyResult = (toolId: ToolId) => {
    const txt = results[toolId]?.output;
    if (txt) navigator.clipboard.writeText(txt).catch(() => {});
  };

  const downloadResult = (toolId: ToolId) => {
    const txt = results[toolId]?.output;
    if (!txt) return;
    const blob = new Blob([txt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'jarvis-v7-' + toolId + '-' + Date.now() + '.txt';
    a.click();
  };

  const ResultBox = ({ toolId, label }: { toolId: ToolId; label: string }) => {
    const r = results[toolId];
    if (!r) return null;
    return (
      <div style={{ marginTop: 10, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ color: '#00d4ff', fontSize: 11, fontWeight: 700 }}>{label}</span>
          {!r.loading && r.output && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => copyResult(toolId)} style={btnSm}>📋 Copy</button>
              <button onClick={() => downloadResult(toolId)} style={btnSm}>⬇ Save</button>
            </div>
          )}
        </div>
        {r.loading ? (
          <div style={{ color: '#00d4ff', fontSize: 12 }}>⏳ Processing…</div>
        ) : (
          <pre style={{ color: r.error ? '#ff6b6b' : '#c8d8e8', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 220, overflowY: 'auto', margin: 0 }}>
            {r.output}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '14px 12px', fontFamily: 'monospace', color: '#c8d8e8' }}>
      <div style={{ color: '#00d4ff', fontSize: 13, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>
        ⚗️ ANIMUS v13 — AGI TOOLS
      </div>
      <div style={{ color: '#7b9ab8', fontSize: 10, marginBottom: 14 }}>
        Parallel fetch engine · No tab overhead · CORS-exempt
      </div>

      {/* Shared URL input for summarize + tables + scout */}
      <Section label="🌐 Target URL (Summarize / Tables)">
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={url1}
            onChange={e => setUrl1(e.target.value)}
            placeholder="https://example.com"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && runSummarize()}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button onClick={runSummarize} disabled={!url1.trim() || !!results.summarize?.loading} style={btn}>
            {results.summarize?.loading ? '⏳' : '📄'} Summarize
          </button>
          <button onClick={runTables} disabled={!url1.trim() || !!results.tables?.loading} style={btn}>
            {results.tables?.loading ? '⏳' : '📊'} Extract Tables
          </button>
        </div>
        <ResultBox toolId="summarize" label="📄 SUMMARY" />
        <ResultBox toolId="tables" label="📊 TABLES" />
      </Section>

      {/* Scout */}
      <Section label="🔭 Quick Scout (URL Deep Scan)">
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={url2}
            onChange={e => setUrl2(e.target.value)}
            placeholder="https://example.com"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && runScout()}
          />
          <button onClick={runScout} disabled={!url2.trim() || !!results.scout?.loading} style={{ ...btn, flexShrink: 0 }}>
            {results.scout?.loading ? '⏳' : '🔭'} Scout
          </button>
        </div>
        <ResultBox toolId="scout" label="🔭 SCOUT REPORT" />
      </Section>

      {/* Diff */}
      <Section label="🔍 Source Diff (Compare Two Pages)">
        <input
          value={diffUrl1}
          onChange={e => setDiffUrl1(e.target.value)}
          placeholder="URL 1"
          style={{ ...inputStyle, marginBottom: 6 }}
        />
        <input
          value={diffUrl2}
          onChange={e => setDiffUrl2(e.target.value)}
          placeholder="URL 2"
          style={inputStyle}
        />
        <button
          onClick={runDiff}
          disabled={!diffUrl1.trim() || !diffUrl2.trim() || !!results.diff?.loading}
          style={{ ...btn, marginTop: 8 }}
        >
          {results.diff?.loading ? '⏳ Diffing…' : '🔍 Compare Sources'}
        </button>
        <ResultBox toolId="diff" label="🔍 DIFF" />
      </Section>

      {/* Knowledge Forge */}
      <Section label="⚗️ Knowledge Forge (Synthesize All Agent Reports)">
        <div style={{ color: '#7b9ab8', fontSize: 10, marginBottom: 8 }}>
          Compiles all completed Sovereign Agent reports into one unified document.
        </div>
        <button onClick={runForge} disabled={!!results.forge?.loading} style={btn}>
          {results.forge?.loading ? '⏳ Forging…' : '⚗️ Forge Knowledge Report'}
        </button>
        <ResultBox toolId="forge" label="⚗️ KNOWLEDGE FORGE" />
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ color: '#00d4ff', fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: 0.5 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(0,212,255,0.06)',
  border: '1px solid rgba(0,212,255,0.2)',
  borderRadius: 6,
  color: '#c8d8e8',
  fontSize: 11,
  padding: '6px 8px',
  fontFamily: 'monospace',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const btn: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,200,0.2))',
  border: '1px solid rgba(0,212,255,0.3)',
  color: '#00d4ff',
  borderRadius: 6,
  padding: '6px 12px',
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontWeight: 700,
};

const btnSm: React.CSSProperties = {
  ...btn,
  padding: '3px 8px',
  fontSize: 10,
};
