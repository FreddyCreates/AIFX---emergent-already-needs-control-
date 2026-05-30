import React, { useState, useEffect } from 'react';

interface SentryAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: string;
  location: string;
  text: string;
  url: string;
  timestamp: number;
  dismissed: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400 border-red-800/60 bg-red-900/20',
  high: 'text-orange-400 border-orange-800/60 bg-orange-900/20',
  medium: 'text-yellow-400 border-yellow-800/60 bg-yellow-900/20',
  low: 'text-gray-400 border-gray-700 bg-gray-800/40',
};

const TYPE_ICONS: Record<string, string> = {
  PHISHING: '🎣',
  PII: '🔑',
  INJECTION: '💉',
  MALWARE_URL: '☠️',
  SUSPICIOUS_FORM: '📝',
};

export default function SentryPanel() {
  const [alerts, setAlerts] = useState<SentryAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{ riskScore: number; summary: string } | null>(null);
  const [activeMode, setActiveMode] = useState<'active' | 'passive'>('active');
  const [scanStatus, setScanStatus] = useState('');

  useEffect(() => {
    loadAlerts();
    const handler = (msg: Record<string, unknown>) => {
      if (msg.action === '_sentryAlert') {
        const a = msg.alert as SentryAlert;
        setAlerts(prev => [a, ...prev].slice(0, 100));
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  const loadAlerts = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'sentryGetAlerts' }, (resp) => {
      setLoading(false);
      if (chrome.runtime.lastError || !resp?.success) return;
      setAlerts(resp.alerts || []);
    });
  };

  const handleScanPage = () => {
    setScanStatus('Scanning…');
    setScanResult(null);
    chrome.runtime.sendMessage({ action: 'sentryScanPage' }, (resp) => {
      setScanStatus('');
      if (chrome.runtime.lastError || !resp?.success) {
        setScanStatus('❌ Error');
        return;
      }
      setScanResult({ riskScore: resp.riskScore, summary: resp.summary });
      if (resp.alerts?.length) {
        setAlerts(prev => [...(resp.alerts as SentryAlert[]), ...prev].slice(0, 100));
      }
    });
  };

  const handleDismiss = (id: string) => {
    chrome.runtime.sendMessage({ action: 'sentryDismiss', id }, () => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    });
  };

  const handleClear = () => {
    chrome.runtime.sendMessage({ action: 'sentryClear' }, () => setAlerts([]));
  };

  const visibleAlerts = alerts.filter(a => !a.dismissed);
  const riskColor = !scanResult ? '' : scanResult.riskScore >= 70 ? 'text-red-400' : scanResult.riskScore >= 30 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <div>
          <span className="font-bold text-white tracking-widest">SENTRY</span>
          <span className="ml-2 text-xs text-gray-500">Security Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          {visibleAlerts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-800/50 text-red-400 text-xs font-bold">{visibleAlerts.length}</span>
          )}
          <button
            onClick={() => setActiveMode(m => m === 'active' ? 'passive' : 'active')}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${activeMode === 'active' ? 'border-green-700 text-green-400' : 'border-gray-600 text-gray-500'}`}
          >
            {activeMode === 'active' ? '● Active' : '○ Passive'}
          </button>
        </div>
      </div>

      {/* Scan button */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/60">
        <button
          onClick={handleScanPage}
          className="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs font-medium text-gray-200 transition-colors"
        >
          🔍 Scan Current Page
        </button>
        {alerts.length > 0 && (
          <button onClick={handleClear} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Clear All</button>
        )}
        {scanStatus && <span className="text-xs text-yellow-400">{scanStatus}</span>}
      </div>

      {/* Risk score */}
      {scanResult && (
        <div className={`mx-3 mt-2 px-3 py-2 rounded border ${scanResult.riskScore >= 70 ? 'border-red-800/60 bg-red-900/20' : scanResult.riskScore >= 30 ? 'border-yellow-800/60 bg-yellow-900/20' : 'border-green-800/60 bg-green-900/20'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-300">{scanResult.summary}</span>
            <span className={`text-sm font-bold ${riskColor}`}>{scanResult.riskScore}/100</span>
          </div>
          <div className="mt-1.5 w-full bg-gray-700/50 rounded h-1.5">
            <div className={`h-1.5 rounded transition-all ${scanResult.riskScore >= 70 ? 'bg-red-500' : scanResult.riskScore >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: scanResult.riskScore + '%' }} />
          </div>
        </div>
      )}

      {/* Alert feed */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading && <div className="text-xs text-gray-500 animate-pulse">Loading alerts…</div>}

        {!loading && visibleAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs">
            <div className="text-2xl mb-2">🛡</div>
            <div>No threats detected.</div>
            <div className="mt-1">Scan a page or browse — Sentry monitors automatically.</div>
          </div>
        )}

        {visibleAlerts.map(alert => (
          <div key={alert.id} className={`p-2 rounded border ${SEVERITY_COLORS[alert.severity]} transition-colors group`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span>{TYPE_ICONS[alert.type] || '⚠'}</span>
                <span className="text-xs font-bold uppercase">{alert.type.replace('_', ' ')}</span>
                <span className={`text-xs px-1 rounded ${alert.severity === 'critical' ? 'bg-red-800/50' : alert.severity === 'high' ? 'bg-orange-800/50' : 'bg-yellow-800/50'}`}>{alert.severity}</span>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="text-gray-700 hover:text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-all"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{alert.text}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600 truncate flex-1">{alert.location}</span>
              <span className="text-xs text-gray-700">{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
