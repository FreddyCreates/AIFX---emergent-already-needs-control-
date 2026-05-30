import React, { useState, useEffect, useRef } from 'react';

interface GraphNode {
  id: string;
  title: string;
  url: string;
  entities: string[];
  timestamp: number;
  visitCount: number;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  sharedEntities: string[];
  weight: number;
}

interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  updatedAt: number;
}

/* ----------------------------------------------------------
 *  Simple force-directed layout (no D3 needed)
 * ---------------------------------------------------------- */
function layoutNodes(nodes: GraphNode[], edges: GraphEdge[]): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const W = 280, H = 220;

  // Initial random placement
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    pos.set(n.id, {
      x: W / 2 + (W * 0.4) * Math.cos(angle),
      y: H / 2 + (H * 0.4) * Math.sin(angle),
    });
  });

  // Simple force iterations
  for (let iter = 0; iter < 40; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>();
    nodes.forEach(n => forces.set(n.id, { fx: 0, fy: 0 }));

    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = pos.get(nodes[i].id)!;
        const b = pos.get(nodes[j].id)!;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const repel = 800 / (dist * dist);
        const fa = forces.get(nodes[i].id)!;
        const fb = forces.get(nodes[j].id)!;
        fa.fx -= repel * (dx / dist); fa.fy -= repel * (dy / dist);
        fb.fx += repel * (dx / dist); fb.fy += repel * (dy / dist);
      }
    }

    // Attraction along edges
    for (const e of edges) {
      const a = pos.get(e.from), b = pos.get(e.to);
      if (!a || !b) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const attract = dist * 0.04 * e.weight;
      const fa = forces.get(e.from)!;
      const fb = forces.get(e.to)!;
      if (fa) { fa.fx += attract * (dx / dist); fa.fy += attract * (dy / dist); }
      if (fb) { fb.fx -= attract * (dx / dist); fb.fy -= attract * (dy / dist); }
    }

    // Apply forces
    nodes.forEach(n => {
      const p = pos.get(n.id)!;
      const f = forces.get(n.id)!;
      pos.set(n.id, {
        x: Math.max(20, Math.min(W - 20, p.x + f.fx * 0.3)),
        y: Math.max(20, Math.min(H - 20, p.y + f.fy * 0.3)),
      });
    });
  }

  return pos;
}

export default function GraphPanel() {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [stats, setStats] = useState<{ nodes: number; edges: number; entities: number } | null>(null);
  const [addStatus, setAddStatus] = useState('');

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'graphGet' }, (resp) => {
      setLoading(false);
      if (chrome.runtime.lastError || !resp?.success) return;
      setGraph(resp.graph || null);
      setStats(resp.stats || null);
    });
  };

  const handleAddPage = () => {
    setAddStatus('Adding…');
    chrome.runtime.sendMessage({ action: 'graphAddCurrentPage' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) { setAddStatus('❌ Error'); return; }
      setAddStatus('✓ Added');
      loadGraph();
      setTimeout(() => setAddStatus(''), 2000);
    });
  };

  const handleClear = () => {
    chrome.runtime.sendMessage({ action: 'graphClear' }, () => { setGraph(null); setStats(null); setSelected(null); });
  };

  const displayNodes = (graph?.nodes || []).slice(0, 40);
  const displayEdges = (graph?.edges || []).filter(e =>
    displayNodes.some(n => n.id === e.from) && displayNodes.some(n => n.id === e.to)
  ).slice(0, 80);

  const nodePositions = displayNodes.length > 0 ? layoutNodes(displayNodes, displayEdges) : new Map();
  const W = 280, H = 220;

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <div>
          <span className="font-bold text-white tracking-widest">CARTOGRAPHER</span>
          <span className="ml-2 text-xs text-gray-500">Knowledge Graph</span>
        </div>
        {stats && (
          <div className="flex gap-2 text-xs text-gray-500">
            <span>{stats.nodes} nodes</span>
            <span>{stats.edges} edges</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/60">
        <button onClick={handleAddPage} className="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 transition-colors">
          + Map Current Page
        </button>
        {(graph?.nodes?.length ?? 0) > 0 && (
          <button onClick={handleClear} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Clear</button>
        )}
        {addStatus && <span className="text-xs text-green-400">{addStatus}</span>}
      </div>

      {loading && <div className="text-xs text-gray-500 animate-pulse mx-3 mt-2">Loading graph…</div>}

      {!loading && displayNodes.length === 0 && (
        <div className="text-center py-8 text-gray-600 text-xs mx-3">
          <div className="text-2xl mb-2">🗺</div>
          <div>No pages mapped yet.</div>
          <div className="mt-1">Click "+ Map Current Page" to start building your knowledge graph.</div>
        </div>
      )}

      {/* SVG graph visualization */}
      {displayNodes.length > 0 && (
        <div className="mx-3 mt-2 rounded border border-gray-800 overflow-hidden bg-gray-900/40">
          <svg width={W} height={H} className="w-full">
            {/* Edges */}
            {displayEdges.map(e => {
              const a = nodePositions.get(e.from);
              const b = nodePositions.get(e.to);
              if (!a || !b) return null;
              return (
                <line
                  key={e.id}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="#374151"
                  strokeWidth={Math.min(3, e.weight * 0.5)}
                  opacity={0.6}
                />
              );
            })}
            {/* Nodes */}
            {displayNodes.map(n => {
              const p = nodePositions.get(n.id);
              if (!p) return null;
              const isSelected = selected?.id === n.id;
              return (
                <g key={n.id} onClick={() => setSelected(isSelected ? null : n)} style={{ cursor: 'pointer' }}>
                  <circle
                    cx={p.x} cy={p.y}
                    r={Math.max(4, Math.min(9, 4 + n.visitCount))}
                    fill={isSelected ? '#06b6d4' : '#4b5563'}
                    stroke={isSelected ? '#0e7490' : '#6b7280'}
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Selected node detail */}
      {selected && (
        <div className="mx-3 mt-2 p-2 rounded bg-gray-800/60 border border-cyan-900/40">
          <a href={selected.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline block truncate">
            {selected.title}
          </a>
          <div className="flex flex-wrap gap-1 mt-1">
            {selected.entities.slice(0, 12).map(e => (
              <span key={e} className="px-1 py-0.5 bg-gray-700/60 rounded text-xs text-gray-400">{e}</span>
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-1">{selected.entities.length} entities · visited {selected.visitCount}×</div>
        </div>
      )}

      {/* Node list */}
      {displayNodes.length > 0 && !selected && (
        <div className="flex-1 overflow-y-auto px-3 pb-2 mt-1 space-y-1">
          {displayNodes.map(n => (
            <div
              key={n.id}
              onClick={() => setSelected(n)}
              className="p-1.5 rounded bg-gray-800/40 border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors"
            >
              <div className="text-xs text-gray-300 truncate">{n.title}</div>
              <div className="text-xs text-gray-600 truncate">{n.entities.slice(0, 5).join(' · ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
