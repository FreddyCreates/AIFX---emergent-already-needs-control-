import React from 'react';

const BRANCH = 'copilot/create-jarvis-integration';
const RAW_BASE = `https://github.com/FreddyCreates/potential-succotash/raw/${BRANCH}`;
const DIST_BASE = `${RAW_BASE}/dist/extensions`;
const BAT_URL   = `${RAW_BASE}/install-vigil-edge.bat`;
const VIGIL_ZIP = `${DIST_BASE}/vigil.zip`;

const SDK_EXTENSIONS = [
  { id: 'vigil',                  name: 'Vigil AI',                   icon: '⚡', desc: 'Sovereign intelligence. Chat, agents, memory, neurochemistry, campaign engine, legal AI.' },
  { id: 'code-sovereign',         name: 'Code Sovereign',             icon: '💻', desc: 'Full-stack code intelligence. Refactor, review, generate, explain.' },
  { id: 'research-nexus',         name: 'Research Nexus',             icon: '🔬', desc: 'Deep research agent. Crawls, synthesizes, and reports on any topic.' },
  { id: 'knowledge-cartographer', name: 'Knowledge Cartographer',     icon: '🗺', desc: 'Builds knowledge graphs from your browsing. Connects ideas across pages.' },
  { id: 'memory-palace',          name: 'Memory Palace',              icon: '🏛', desc: 'Persistent memory vault. Stores, searches, and surfaces past sessions.' },
  { id: 'data-oracle',            name: 'Data Oracle',                icon: '📊', desc: 'Data analysis agent. Reads tables, generates charts, exports Excel.' },
  { id: 'screen-commander',       name: 'Screen Commander',           icon: '🖥️', desc: 'Capture, record, and analyze screen content with AI vision.' },
  { id: 'voice-forge',            name: 'Voice Forge',                icon: '🎙', desc: 'Voice-first AI interface. Speak commands, get spoken responses.' },
  { id: 'sentinel-watch',         name: 'Sentinel Watch',             icon: '🛡', desc: 'Page monitoring and anomaly detection. Alerts on changes.' },
  { id: 'creative-muse',          name: 'Creative Muse',              icon: '🎨', desc: 'Creative writing AI. Stories, scripts, poems, and content generation.' },
  { id: 'pattern-forge',          name: 'Pattern Forge',              icon: '🔮', desc: 'Pattern synthesis engine. Finds cross-domain connections and insights.' },
  { id: 'sovereign-mind',         name: 'Sovereign Mind',             icon: '🧠', desc: 'Advanced reasoning and cognitive framework. Strategy, philosophy, systems.' },
  { id: 'protocol-bridge',        name: 'Protocol Bridge',            icon: '🔗', desc: 'AI protocol orchestration. Connects agents across sessions and tabs.' },
  { id: 'data-alchemist',         name: 'Data Alchemist',             icon: '⚗️', desc: 'Transforms raw data into structured knowledge. JSON, CSV, PDF extraction.' },
  { id: 'vision-weaver',          name: 'Vision Weaver',              icon: '👁', desc: 'Visual AI. Reads and interprets images, screenshots, and page layouts.' },
  { id: 'edge-runner',            name: 'Edge Runner',                icon: '🚀', desc: 'Fast-task executor. Quick automations, form fills, and page actions.' },
  { id: 'logic-prover',           name: 'Logic Prover',               icon: '∴',  desc: 'Formal reasoning engine. Validates arguments, proofs, and logic chains.' },
  { id: 'social-cortex',          name: 'Social Cortex',              icon: '🌐', desc: 'Social signal reader. Trends, sentiment, and network analysis.' },
  { id: 'organism-dashboard',     name: 'Organism Dashboard',         icon: '🔭', desc: 'Organism marketplace hub. Explore, deploy, and manage AI extensions.' },
  { id: 'campaign-runner',        name: 'Campaign Runner',            icon: '🎯', desc: 'Long-task & campaign manager. Multi-step missions, progress tracking, AGI coordination.' },
];

export default function InstallPanel() {
  const downloadZip = (id: string) => {
    const url = `${DIST_BASE}/${id}.zip`;
    chrome.runtime.sendMessage({ action: 'downloadExtensionZip', url, name: `${id}-v17-alpha` });
  };

  const downloadVigilZip = () => {
    chrome.runtime.sendMessage({ action: 'downloadExtensionZip', url: VIGIL_ZIP, name: 'vigil-v17-alpha-sdk' });
  };

  const downloadVigilBat = () => {
    chrome.runtime.sendMessage({ action: 'downloadJarvisBat' });
  };

  const openLink = (url: string) => window.open(url, '_blank');

  return (
    <div className="flex flex-col h-full overflow-y-auto text-xs text-gray-300" style={{ background: '#0d0b08' }}>

      {/* Header */}
      <div className="px-3 py-3 border-b flex-shrink-0" style={{ borderColor: '#2d2010', background: '#13100a' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-400 text-base">⚡</span>
          <span className="font-bold tracking-widest text-white text-sm">V I G I L</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold border" style={{ borderColor: '#d4a017', color: '#d4a017' }}>v17 Alpha SDK</span>
        </div>
        <p className="text-gray-500 leading-relaxed mt-1">
          Sovereign AI platform. Download the main extension or any Alpha SDK sub-module below. Each one is a specialized AI agent that works alongside Vigil.
        </p>
      </div>

      {/* ── Vigil Alpha SDK — primary bundle ─────────────────────── */}
      <div className="px-3 py-3 border-b" style={{ borderColor: '#2d2010', background: '#0f0d09' }}>
        <p className="font-semibold mb-2" style={{ color: '#d4a017' }}>⚡ Vigil Alpha SDK — Primary Bundle</p>

        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <button
            onClick={downloadVigilZip}
            className="py-2 rounded font-medium text-[11px] transition-colors"
            style={{ background: 'rgba(212,160,23,0.18)', color: '#d4a017', border: '1px solid rgba(212,160,23,0.4)' }}
          >
            ⬇ Extension ZIP
          </button>
          <button
            onClick={downloadVigilBat}
            className="py-2 rounded font-medium text-[11px] transition-colors"
            style={{ background: 'rgba(212,160,23,0.10)', color: '#d4a017', border: '1px solid rgba(212,160,23,0.3)' }}
          >
            🪟 Windows Installer (.bat)
          </button>
        </div>

        {/* Production links */}
        <div className="space-y-1 mt-2">
          <p className="text-gray-500 font-semibold text-[10px] mb-1">📎 Production Links</p>
          {[
            { label: 'Extension ZIP', url: VIGIL_ZIP },
            { label: 'Windows Installer', url: BAT_URL },
            { label: 'SDK Manifest', url: `${RAW_BASE}/SDK_Model_Manifest.json` },
            { label: 'AI Protocols Register', url: `${RAW_BASE}/AI_Protocols_Register.csv` },
            { label: 'Source Repo', url: 'https://github.com/FreddyCreates/potential-succotash/tree/copilot/create-jarvis-integration' },
          ].map(link => (
            <div key={link.label} className="flex items-center gap-1.5">
              <span className="text-gray-600 text-[10px] w-32 truncate flex-shrink-0">{link.label}</span>
              <button
                onClick={() => openLink(link.url)}
                className="flex-1 truncate text-left text-[10px] hover:underline"
                style={{ color: '#4a9eff' }}
                title={link.url}
              >
                {link.url.replace('https://github.com/FreddyCreates/potential-succotash/', '…/')}
              </button>
              <button
                onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(link.url); }}
                className="flex-shrink-0 text-[9px] px-1 py-0.5 rounded text-gray-600 hover:text-gray-400 transition-colors"
                title="Copy URL"
              >⧉</button>
            </div>
          ))}
        </div>

        <p className="mt-2 text-gray-600 text-[10px] leading-relaxed">
          Manual install: Download ZIP → extract → <code className="text-cyan-400">edge://extensions</code> → Enable Dev Mode → Load unpacked.
        </p>
      </div>

      {/* ── Alpha SDK Sub-Extensions ─────────────────────────────── */}
      <div className="px-3 pt-3 pb-1 flex-shrink-0">
        <p className="font-semibold mb-1" style={{ color: '#d4a017' }}>🧩 Alpha SDK Sub-Extensions</p>
        <p className="text-gray-600 leading-relaxed mb-2">
          Each is a sovereign AI agent. Download as ZIP or copy the direct link.
        </p>
      </div>

      <div className="px-3 pb-4 space-y-2">
        {SDK_EXTENSIONS.map((ext) => {
          const zipUrl = `${DIST_BASE}/${ext.id}.zip`;
          return (
            <div key={ext.id} className="flex items-start gap-2 p-2.5 rounded-lg border" style={{ background: '#0f0d09', borderColor: '#2d2010' }}>
              <span className="text-lg flex-shrink-0 mt-0.5">{ext.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-semibold text-gray-200 text-[11px]">{ext.name}</p>
                  <span className="text-[9px] px-1 py-0.5 rounded font-bold" style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017' }}>Alpha SDK</span>
                </div>
                <p className="text-gray-500 leading-relaxed mt-0.5">{ext.desc}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <button
                    onClick={() => downloadZip(ext.id)}
                    className="text-[10px] px-2 py-1 rounded transition-colors"
                    style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid rgba(212,160,23,0.3)' }}
                  >
                    ⬇ ZIP
                  </button>
                  <button
                    onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(zipUrl); }}
                    className="text-[10px] px-2 py-1 rounded transition-colors text-gray-500 hover:text-gray-300"
                    style={{ background: '#1a1408', border: '1px solid #2d2010' }}
                    title="Copy ZIP link"
                  >
                    ⧉ Copy Link
                  </button>
                  <button
                    onClick={() => openLink(zipUrl)}
                    className="text-[10px] px-2 py-1 rounded transition-colors text-cyan-400 hover:text-cyan-200"
                    style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    🌐 Open
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 text-gray-700 text-[10px] border-t" style={{ borderColor: '#1a1408' }}>
        <p className="mt-2">Vigil AI Alpha SDK v17.0.0 · FreddyCreates/potential-succotash · branch: copilot/create-jarvis-integration</p>
        <p className="mt-0.5">ODE neurochemistry · Campaign engine · Sovereign agents · Legal AI · Knowledge graph</p>
      </div>
    </div>
  );
}

