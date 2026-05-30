import React, { useState, useEffect, useRef } from 'react';

type Mode = 'summarize' | 'classify' | 'ask';
type OverallStatus = 'idle' | 'loading' | 'ready' | 'error';

interface ModelProgress {
  model: string;
  status: string;
  progress?: number;
  message?: string;
}

interface ClassifyResult {
  label: string;
  score: number;
  all: Array<{ label: string; score: number }>;
}

export default function SolusPanel() {
  const [mode, setMode] = useState<Mode>('summarize');
  const [overallStatus, setOverallStatus] = useState<OverallStatus>('idle');
  const [modelProgress, setModelProgress] = useState<Record<string, ModelProgress>>({});
  const [inputText, setInputText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [labelsText, setLabelsText] = useState('positive, negative, neutral');
  const [result, setResult] = useState('');
  const [classifyResult, setClassifyResult] = useState<ClassifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pageContent, setPageContent] = useState('');
  const initialized = useRef(false);

  // Check current status on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    chrome.runtime.sendMessage({ action: 'solusStatus' }, (resp) => {
      if (chrome.runtime.lastError) return;
      if (resp?.ready) setOverallStatus('ready');
    });
    // Listen for progress updates
    const handler = (msg: Record<string, unknown>) => {
      if (msg.action === '_solusProgress') {
        const p = msg.progress as ModelProgress;
        setModelProgress(prev => ({ ...prev, [p.model]: p }));
        if (p.status === 'ready') {
          // Check if all ready
          chrome.runtime.sendMessage({ action: 'solusStatus' }, (resp) => {
            if (resp?.ready) setOverallStatus('ready');
            else if (resp?.anyLoading) setOverallStatus('loading');
          });
        } else if (p.status === 'loading') {
          setOverallStatus('loading');
        } else if (p.status === 'error') {
          setOverallStatus('error');
        }
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  const handleActivate = () => {
    setOverallStatus('loading');
    setModelProgress({});
    setError('');
    chrome.runtime.sendMessage({ action: 'solusLoad' }, (resp) => {
      if (chrome.runtime.lastError) { setError('Background error'); setOverallStatus('error'); return; }
      if (resp?.error) { setError(resp.error); setOverallStatus('error'); }
    });
  };

  const handleReadPage = () => {
    chrome.runtime.sendMessage({ action: 'readPageArticle' }, (resp) => {
      if (chrome.runtime.lastError) return;
      if (resp?.article?.textContent) {
        setInputText(resp.article.textContent.substring(0, 4000));
      }
    });
  };

  const handleRun = () => {
    if (!inputText.trim()) { setError('Enter some text first.'); return; }
    if (overallStatus !== 'ready') { setError('Activate Solus first — models must be loaded.'); return; }
    setBusy(true);
    setError('');
    setResult('');
    setClassifyResult(null);

    if (mode === 'summarize') {
      chrome.runtime.sendMessage({ action: 'solusSummarize', text: inputText }, (resp) => {
        setBusy(false);
        if (chrome.runtime.lastError || !resp?.success) { setError(resp?.message || 'Inference error'); return; }
        setResult(resp.summary);
      });
    } else if (mode === 'classify') {
      const labels = labelsText.split(',').map(l => l.trim()).filter(Boolean);
      if (!labels.length) { setBusy(false); setError('Enter at least one label.'); return; }
      chrome.runtime.sendMessage({ action: 'solusClassify', text: inputText, labels }, (resp) => {
        setBusy(false);
        if (chrome.runtime.lastError || !resp?.success) { setError(resp?.message || 'Inference error'); return; }
        setClassifyResult(resp.result as ClassifyResult);
      });
    } else {
      if (!questionText.trim()) { setBusy(false); setError('Enter a question.'); return; }
      const context = inputText || pageContent;
      chrome.runtime.sendMessage({ action: 'solusAnswer', context, question: questionText }, (resp) => {
        setBusy(false);
        if (chrome.runtime.lastError || !resp?.success) { setError(resp?.message || 'Inference error'); return; }
        setResult(resp.answer + (resp.score !== undefined ? `\n\nConfidence: ${(resp.score * 100).toFixed(1)}%` : ''));
      });
    }
  };

  const statusColor = overallStatus === 'ready' ? 'text-green-400' : overallStatus === 'loading' ? 'text-yellow-400' : overallStatus === 'error' ? 'text-red-400' : 'text-gray-500';
  const statusLabel = overallStatus === 'ready' ? '● OFFLINE READY' : overallStatus === 'loading' ? '◌ LOADING…' : overallStatus === 'error' ? '✕ ERROR' : '○ NOT LOADED';

  const progressEntries = Object.values(modelProgress);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <div>
          <span className="font-bold text-white tracking-widest">S·O·L·U·S</span>
          <span className="ml-2 text-xs text-gray-500">Sovereign Offline Intelligence</span>
        </div>
        <span className={`text-xs font-mono font-bold ${statusColor}`}>{statusLabel}</span>
      </div>

      {/* Activate banner */}
      {overallStatus === 'idle' && (
        <div className="mx-3 mt-3 p-3 rounded border border-gray-700 bg-gray-900/60">
          <p className="text-xs text-gray-400 mb-2">
            Solus uses offline Transformers.js models (~60–120 MB total). Downloaded once, cached permanently. <strong className="text-white">Zero network calls during inference.</strong>
          </p>
          <button
            onClick={handleActivate}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-sm font-bold text-white transition-colors"
          >
            ⚡ Activate Solus
          </button>
        </div>
      )}

      {/* Loading progress */}
      {overallStatus === 'loading' && progressEntries.length > 0 && (
        <div className="mx-3 mt-3 space-y-2">
          {['Summarization', 'Classification', 'Q&A'].map(name => {
            const p = modelProgress[name];
            const pct = p?.progress ?? 0;
            const isReady = p?.status === 'ready';
            return (
              <div key={name}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className={isReady ? 'text-green-400' : 'text-gray-400'}>{name}</span>
                  <span className={isReady ? 'text-green-400' : 'text-yellow-400'}>{isReady ? '✓' : pct + '%'}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div className={`h-1 rounded-full transition-all ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: (isReady ? 100 : pct) + '%' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {overallStatus === 'loading' && progressEntries.length === 0 && (
        <div className="mx-3 mt-3 text-xs text-yellow-400 animate-pulse">Initializing models…</div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-3 mt-2 p-2 rounded bg-red-900/30 border border-red-800/50 text-xs text-red-400">{error}</div>
      )}

      {/* Controls — only shown when ready or if user wants to preload text */}
      {(overallStatus === 'ready' || overallStatus === 'loading') && (
        <>
          {/* Mode selector */}
          <div className="flex mx-3 mt-3 rounded border border-gray-700 overflow-hidden">
            {(['summarize', 'classify', 'ask'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1 text-xs font-medium transition-colors ${mode === m ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {m === 'summarize' ? '📄 Summarize' : m === 'classify' ? '🏷 Classify' : '❓ Ask'}
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="flex items-center gap-1 mx-3 mt-2">
            <span className="text-xs text-gray-500 flex-1">Context / Article text</span>
            <button onClick={handleReadPage} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">📄 Use Page</button>
          </div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste text here, or click 📄 Use Page to pull the current article…"
            className="mx-3 mt-1 h-24 p-2 rounded bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500"
          />

          {/* Classify labels */}
          {mode === 'classify' && (
            <input
              value={labelsText}
              onChange={e => setLabelsText(e.target.value)}
              placeholder="Labels, comma-separated (e.g. positive, negative, neutral)"
              className="mx-3 mt-1 p-2 rounded bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500"
            />
          )}

          {/* Question */}
          {mode === 'ask' && (
            <input
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="Your question about the text…"
              className="mx-3 mt-1 p-2 rounded bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500"
            />
          )}

          <button
            onClick={handleRun}
            disabled={busy || overallStatus !== 'ready'}
            className="mx-3 mt-2 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded border border-gray-600 text-sm font-bold text-white transition-colors"
          >
            {busy ? '◌ Running…' : overallStatus !== 'ready' ? '⏳ Loading models…' : '⚡ Run Solus'}
          </button>
        </>
      )}

      {/* Results */}
      {result && (
        <div className="mx-3 mt-2 p-2 rounded bg-gray-800/60 border border-gray-700 flex-1 overflow-y-auto">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Result</div>
          <pre className="text-xs text-gray-200 whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      {classifyResult && (
        <div className="mx-3 mt-2 p-2 rounded bg-gray-800/60 border border-gray-700 flex-1 overflow-y-auto">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Classification</div>
          <div className="mb-2">
            <span className="font-bold text-white">{classifyResult.label}</span>
            <span className="ml-2 text-xs text-green-400">{(classifyResult.score * 100).toFixed(1)}%</span>
          </div>
          {classifyResult.all.map(item => (
            <div key={item.label} className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 w-28 truncate">{item.label}</span>
              <div className="flex-1 bg-gray-700 rounded h-1.5">
                <div className="bg-cyan-500 h-1.5 rounded" style={{ width: (item.score * 100) + '%' }} />
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">{(item.score * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Error retry when error */}
      {overallStatus === 'error' && (
        <div className="mx-3 mt-2">
          <button onClick={handleActivate} className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 transition-colors">
            ↺ Retry
          </button>
        </div>
      )}
    </div>
  );
}
