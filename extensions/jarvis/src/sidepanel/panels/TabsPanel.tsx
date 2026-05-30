import React, { useEffect } from 'react';
import { useJarvisStore } from '../../store';

export default function TabsPanel() {
  const { openTabs, setOpenTabs } = useJarvisStore();

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'listTabs' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setOpenTabs(resp.tabs || []);
    });
  }, [setOpenTabs]);

  const switchTab = (tabIndex: number) => {
    chrome.runtime.sendMessage({ action: 'switchTab', tabIndex }, () => {});
  };

  const closeTab = (tabIndex: number) => {
    chrome.runtime.sendMessage({ action: 'executeCommand', command: 'close tab ' + tabIndex }, () => {
      chrome.runtime.sendMessage({ action: 'listTabs' }, (resp) => {
        if (resp?.success) setOpenTabs(resp.tabs || []);
      });
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/50 border-b border-gray-800/50">
        <span className="text-xs text-gray-400">{openTabs.length} tabs open</span>
        <button
          onClick={() => chrome.runtime.sendMessage({ action: 'listTabs' }, (resp) => { if (resp?.success) setOpenTabs(resp.tabs || []); })}
          className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
        {openTabs.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">No tabs loaded</div>
        )}
        {openTabs.map((tab: any) => (
          <div key={tab.id} className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-800/40 transition-colors ${tab.active ? 'bg-gray-800/60 border-l-2 border-cyan-500' : ''}`}>
            {tab.favIconUrl && (
              <img src={tab.favIconUrl} alt="" className="w-4 h-4 flex-shrink-0 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-200 truncate">{tab.title || 'Untitled'}</div>
              <div className="text-xs text-gray-600 truncate">{tab.url}</div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => switchTab(tab.index)}
                className="text-xs px-1.5 py-0.5 bg-cyan-900/50 hover:bg-cyan-800/70 rounded text-cyan-300 transition-colors"
              >
                Go
              </button>
              <button
                onClick={() => closeTab(tab.index)}
                className="text-xs px-1.5 py-0.5 bg-red-900/40 hover:bg-red-800/60 rounded text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
