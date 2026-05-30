import React, { useState, useEffect, useCallback } from 'react';

interface MetaPrimitive { layer: string; key: string; value: string; }
interface HeadingNode { level: number; text: string; children?: HeadingNode[]; }
interface SynthResult { merged: string; confidence: number; domains: string[]; primitiveCount: number; concepts: string[]; }
interface PhantomRead {
  id: string; url: string; title: string; timestamp: number;
  primitives: MetaPrimitive[]; headings: HeadingNode[];
  keywords: string[]; synthesis: SynthResult;
  spatial: { scrollPct: number; sectionPath: string[]; xPhi: number; yPhi: number; };
}

const LAYER_COLOR: Record<string, string> = {
  meta: '#4a9eff', og: '#a78bfa', twitter: '#38bdf8', jsonld: '#34d399',
  canonical: '#d4a017', heading: '#fbbf24', link: '#9ca3af', data: '#6b7280',
};

function HeadingTree({ nodes, depth = 0 }: { nodes: HeadingNode[]; depth?: number }) {
  return (
    <div style={{ paddingLeft: depth * 10 }}>
      {nodes.map((n, i) => (
        <div key={i}>
          <span className="text-[10px]" style={{ color: n.level <= 2 ? '#d4a017' : '#9ca3af' }}>
            {'  '.repeat(n.level - 1)}H{n.level} {n.text}
          </span>
          {n.children && n.children.length > 0 && <HeadingTree nodes={n.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

export default function PhantomPanel() {
  const [reads, setReads] = useState<PhantomRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [synthAll, setSynthAll] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<'reads' | 'spatial'>('reads');
  const [msg, setMsg] = useState('');

  const loadReads = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'getPhantomReads', limit: 30 }, r => {
      if (r?.success) setReads(r.reads || []);
    });
  }, []);

  useEffect(() => { loadReads(); }, [loadReads]);

  const scan = () => {
    setScanning(true);
    setMsg('');
    chrome.runtime.sendMessage({ action: 'phantomReadPage' }, r => {
      setScanning(false);
      if (r?.success) {
        setMsg(r.message || 'Phantom read complete.');
        loadReads();
      } else {
        setMsg(r?.message || 'Scan failed.');
      }
    });
  };

  const synthAllReads = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'phantomSynthesizeAll' }, r => {
      setLoading(false);
      if (r?.success) setSynthAll(r.message || '');
      else setMsg(r?.message || 'No reads available.');
    });
  };

  const clearAll = () => {
    if (!confirm('Clear all phantom reads?')) return;
    chrome.runtime.sendMessage({ action: 'clearPhantomReads' }, () => {
      setReads([]); setSynthAll('');
    });
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col h-full text-xs" style={{ background: '#0d0b08', color: '#d1d5db' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: '#2d2010', background: '#13100a' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: '#d4a017' }}>👁</span>
          <span className="font-bold tracking-widest text-white text-[11px]">PHANTOM META</span>
          <span className="text-[9px] px-1 py-0.5 rounded border font-bold" style={{ borderColor: '#d4a017', color: '#d4a017' }}>v17</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={scan}
            disabled={scanning}
            className="text-[10px] px-2 py-1 rounded font-bold transition-colors"
            style={{ background: scanning ? '#1a1408' : 'rgba(212,160,23,0.2)', color: '#d4a017', border: '1px solid rgba(212,160,23,0.4)' }}
          >
            {scanning ? '⏳ Reading…' : '🔮 Scan Page'}
          </button>
          <button
            onClick={loadReads}
            className="text-[10px] px-1.5 py-1 rounded transition-colors text-gray-500 hover:text-gray-300"
            style={{ background: '#1a1408', border: '1px solid #2d2010' }}
          >↺</button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: '#2d2010', background: '#0f0d09' }}>
        {(['reads', 'spatial'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 text-[10px] font-semibold transition-colors capitalize"
            style={tab === t ? { color: '#d4a017', borderBottom: '2px solid #d4a017' } : { color: '#6b7280' }}
          >
            {t === 'reads' ? '📖 Reads' : '📍 Spatial'}
          </button>
        ))}
      </div>

      {/* Message */}
      {msg && (
        <div className="px-3 py-1.5 text-[10px] border-b whitespace-pre-line" style={{ borderColor: '#2d2010', background: '#0f0d09', color: '#d4a017' }}>
          {msg.substring(0, 300)}
          <button onClick={() => setMsg('')} className="ml-2 text-gray-600 hover:text-gray-400">✕</button>
        </div>
      )}

      {/* READS TAB */}
      {tab === 'reads' && (
        <div className="flex-1 overflow-y-auto">

          {/* Cross-page synthesis */}
          <div className="px-3 py-2 border-b" style={{ borderColor: '#2d2010' }}>
            <div className="flex gap-1.5 mb-1.5">
              <button onClick={synthAllReads} disabled={loading || reads.length === 0}
                className="text-[10px] px-2 py-1 rounded transition-colors"
                style={{ background: 'rgba(74,158,255,0.15)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.3)' }}
              >
                {loading ? '⏳ Synthesizing…' : '🌐 Synthesize All Pages'}
              </button>
              {reads.length > 0 && (
                <button onClick={clearAll}
                  className="text-[10px] px-2 py-1 rounded transition-colors text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >🗑 Clear</button>
              )}
            </div>
            {synthAll && (
              <div className="text-[10px] leading-relaxed p-2 rounded" style={{ background: '#0a0806', border: '1px solid #2d2010', color: '#a3e8a0', whiteSpace: 'pre-wrap' }}>
                {synthAll.substring(0, 800)}
              </div>
            )}
          </div>

          {reads.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              <p className="text-2xl mb-2">👁</p>
              <p>No phantom reads yet.</p>
              <p className="mt-1 text-gray-700">Click Scan Page to read through any page's meta layer. Reads also auto-capture on every page you visit.</p>
            </div>
          )}

          <div className="px-3 py-2 space-y-2">
            {reads.map(r => (
              <div key={r.id} className="border rounded-lg overflow-hidden" style={{ borderColor: '#2d2010' }}>
                {/* Read header */}
                <div
                  className="px-2.5 py-2 cursor-pointer hover:bg-[#13100a]"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-200 text-[11px] truncate">{r.title || r.url}</p>
                      <p className="text-gray-500 truncate mt-0.5">{r.url}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.keywords.slice(0, 6).map(kw => (
                          <span key={kw} className="text-[9px] px-1 py-0.5 rounded" style={{ background: '#1a1408', color: '#d4a017' }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2 text-right">
                      <p className="text-[9px] text-gray-600">{fmtDate(r.timestamp)}</p>
                      <p className="text-[9px] text-gray-600 mt-0.5">{r.primitives.length} prim</p>
                      <p className="text-[9px] mt-0.5" style={{ color: '#d4a017' }}>{(r.synthesis.confidence * 100).toFixed(0)}% conf</p>
                    </div>
                  </div>
                </div>

                {expanded === r.id && (
                  <div className="px-2.5 pb-2 pt-1" style={{ background: '#0a0806', borderTop: '1px solid #2d2010' }}>

                    {/* PSE Synthesis */}
                    {r.synthesis.merged && (
                      <div className="mb-2">
                        <p className="text-[10px] font-semibold mb-1" style={{ color: '#4a9eff' }}>
                          🧬 PSE Synthesis ({r.synthesis.primitiveCount} primitives · {r.synthesis.domains.join(', ')})
                        </p>
                        <p className="text-[10px] leading-relaxed text-gray-400 italic">{r.synthesis.merged}</p>
                        <p className="text-[9px] text-gray-600 mt-0.5">Concepts: {r.synthesis.concepts.slice(0, 4).join(' · ')}</p>
                      </div>
                    )}

                    {/* Spatial */}
                    <div className="mb-2 p-1.5 rounded text-[10px]" style={{ background: '#13100a', border: '1px solid #2d2010' }}>
                      <span className="text-gray-500">📍 Spatial: </span>
                      <span style={{ color: '#d4a017' }}>scroll {r.spatial.scrollPct}%</span>
                      {r.spatial.sectionPath.length > 0 && (
                        <span className="text-gray-500"> · [{r.spatial.sectionPath.slice(0, 2).join(' › ')}]</span>
                      )}
                      <span className="text-gray-700 ml-1 font-mono">φ({r.spatial.xPhi.toFixed(2)}, {r.spatial.yPhi.toFixed(2)})</span>
                    </div>

                    {/* Heading tree */}
                    {r.headings.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-semibold mb-1 text-gray-400">📐 Heading Structure</p>
                        <HeadingTree nodes={r.headings.slice(0, 8)} />
                      </div>
                    )}

                    {/* Primitive layers */}
                    <p className="text-[10px] font-semibold mb-1 text-gray-400">🔍 Meta Primitives</p>
                    <div className="space-y-0.5 max-h-32 overflow-y-auto">
                      {r.primitives.filter(p => p.layer !== 'link').slice(0, 30).map((p, i) => (
                        <div key={i} className="flex gap-1.5 text-[10px]">
                          <span className="flex-shrink-0 w-14 text-right font-mono text-[9px] opacity-70" style={{ color: LAYER_COLOR[p.layer] ?? '#9ca3af' }}>{p.layer}</span>
                          <span className="text-gray-500 flex-shrink-0">{p.key}</span>
                          <span className="text-gray-300 truncate">{p.value.substring(0, 80)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SPATIAL TAB */}
      {tab === 'spatial' && <SpatialTab />}
    </div>
  );
}

function SpatialTab() {
  const [entries, setEntries] = useState<{
    id: string; url: string; title: string; timestamp: number;
    spatial?: { scrollPct: number; sectionPath: string[]; xPhi: number; yPhi: number; zPhi: number; sPhi: number };
  }[]>([]);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getPhantomSpatial' }, r => {
      if (r?.success) setEntries(r.entries || []);
    });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2">
      <p className="text-[10px] text-gray-600 mb-2">
        Memories with encoded spatial coordinates. Sorted by scroll depth — shows where on each page Vigil was reading.
      </p>
      {entries.length === 0 && (
        <div className="text-center py-6 text-gray-600">
          <p>No spatial memories yet.</p>
          <p className="mt-1 text-gray-700">Browse pages — Vigil auto-captures spatial position after load.</p>
        </div>
      )}
      <div className="space-y-1.5">
        {entries.map(e => (
          <div key={e.id} className="p-2 rounded border text-[10px]" style={{ background: '#0f0d09', borderColor: '#2d2010' }}>
            <p className="font-semibold text-gray-200 truncate">{e.title || e.url}</p>
            <p className="text-gray-500 truncate mt-0.5">{e.url}</p>
            {e.spatial && (
              <div className="flex flex-wrap gap-2 mt-1">
                <span style={{ color: '#d4a017' }}>scroll {e.spatial.scrollPct}%</span>
                {e.spatial.sectionPath.length > 0 && (
                  <span className="text-gray-500">[{e.spatial.sectionPath.slice(0, 2).join(' › ')}]</span>
                )}
                <span className="text-gray-700 font-mono">
                  φ⁴({e.spatial.xPhi.toFixed(2)}, {e.spatial.yPhi.toFixed(2)}, {e.spatial.zPhi.toFixed(2)}, {e.spatial.sPhi.toFixed(2)})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
