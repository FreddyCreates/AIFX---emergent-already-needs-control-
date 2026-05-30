import React, { useState } from 'react';
import MemoryPanel from './MemoryPanel';
import VaultPanel from './VaultPanel';
import HighlightsPanel from './HighlightsPanel';
import MirrorPanel from './MirrorPanel';
import GraphPanel from './GraphPanel';
import NotesPanel from './NotesPanel';

const SUB_TABS = [
  { id: 'memory',     label: '🧠 Memory' },
  { id: 'vault',      label: '🔐 Vault' },
  { id: 'highlights', label: '📌 Highlights' },
  { id: 'mirror',     label: '🪞 Mirror' },
  { id: 'graph',      label: '🗺 Graph' },
  { id: 'journal',    label: '📓 Journal' },
];

export default function MemoryVaultPanel() {
  const [active, setActive] = useState('memory');

  const renderSub = () => {
    switch (active) {
      case 'memory':     return <MemoryPanel />;
      case 'vault':      return <VaultPanel />;
      case 'highlights': return <HighlightsPanel />;
      case 'mirror':     return <MirrorPanel />;
      case 'graph':      return <GraphPanel />;
      case 'journal':    return <NotesPanel />;
      default:           return <MemoryPanel />;
    }
  };

  return (
    <div className="flex flex-col h-full text-gray-100" style={{ background: '#0d0b08' }}>
      {/* Sub-tab bar */}
      <div className="flex overflow-x-auto scrollbar-hide flex-shrink-0" style={{ background: '#13100a', borderBottom: '1px solid #2d2010' }}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="flex-shrink-0 px-3 py-1.5 text-xs transition-colors whitespace-nowrap"
            style={active === t.id
              ? { color: '#d4a017', borderBottom: '2px solid #d4a017', background: '#0d0b08' }
              : { color: '#666' }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Sub-panel */}
      <div className="flex-1 overflow-hidden">
        {renderSub()}
      </div>
    </div>
  );
}
