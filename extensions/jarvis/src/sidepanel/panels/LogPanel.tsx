import React from 'react';
import { useJarvisStore } from '../../store';

const MAX_LOG_ENTRIES = 50;

export default function LogPanel() {
  const { messages } = useJarvisStore();
  const logEntries = messages.slice(-MAX_LOG_ENTRIES);

  const roleColor = (role: string) =>
    role === 'user' ? 'text-cyan-400' : 'text-purple-400';

  const truncate = (text: string, n = 80) =>
    text.length > n ? text.substring(0, n) + '…' : text;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/50 border-b border-gray-800/50">
        <span className="text-xs text-gray-400">Session log — {logEntries.length} entries</span>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-xs divide-y divide-gray-800/30">
        {logEntries.length === 0 && (
          <div className="text-center text-gray-600 py-8">No messages yet</div>
        )}
        {logEntries.map((msg, i) => (
          <div key={i} className="flex gap-2 px-3 py-1.5 hover:bg-gray-800/20 transition-colors">
            <span className="text-gray-600 flex-shrink-0">{formatTime(msg.ts)}</span>
            <span className={`flex-shrink-0 font-semibold ${roleColor(msg.role)}`}>
              {msg.role === 'user' ? 'USR' : 'JAR'}
            </span>
            <span className="text-gray-400 truncate">{truncate(msg.text)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
