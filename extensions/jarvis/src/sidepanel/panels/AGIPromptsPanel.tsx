import React, { useState } from 'react';
import AGIToolsPanel from './AGIToolsPanel';
import PromptsPanel from './PromptsPanel';
import CampaignPanel from './CampaignPanel';

const SUB_TABS = [
  { id: 'agi',      label: '⚗️ AGI Tools' },
  { id: 'prompts',  label: '💡 Prompts' },
  { id: 'campaigns', label: '🎯 Campaigns' },
];

export default function AGIPromptsPanel() {
  const [active, setActive] = useState('agi');

  return (
    <div className="flex flex-col h-full bg-[#080d14] text-gray-100">
      <div className="flex overflow-x-auto bg-[#0d1520] border-b border-[#1a3a5c] scrollbar-hide flex-shrink-0">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
              active === t.id
                ? 'text-cyan-400 border-b-2 border-[#ffd700] bg-[#080d14]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {active === 'agi'       ? <AGIToolsPanel /> :
         active === 'prompts'   ? <PromptsPanel /> :
         active === 'campaigns' ? <CampaignPanel /> : null}
      </div>
    </div>
  );
}
