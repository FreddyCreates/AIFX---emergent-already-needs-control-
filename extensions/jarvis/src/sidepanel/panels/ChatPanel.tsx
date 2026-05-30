import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useJarvisStore } from '../../store';

const QUICK_ACTIONS = [
  { label: 'Brief me', text: '__brief__' },
  { label: 'Status', text: 'what is your status' },
  { label: '🤖 Research agent', text: '__agent_research__', prefill: true },
  { label: '🤖 Agents', text: '__listagents__' },
  { label: 'Timer', text: 'set a timer for ', prefill: true },
  { label: 'Summarize', text: 'summarize this page' },
  { label: 'Help', text: 'what can you do' },
];

/** Strip emoji and symbols so TTS sounds clean */
function stripForTTS(text: string): string {
  return text
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Speak text via Web Speech API */
function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(stripForTTS(text));
  utterance.rate = 0.88;
  utterance.pitch = 1.05;
  utterance.volume = 1;
  // prefer a warm natural English voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    /google uk english|karen|samantha|victoria|moira|fiona/i.test(v.name)
  ) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

export default function ChatPanel() {
  const {
    messages, isTyping, micListening, ttsEnabled,
    addMessage, setTyping, setMicListening, setTtsEnabled, clearMessages,
  } = useJarvisStore();

  const [input, setInput] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /** Deliver an ANIMUS response from background */
  const deliverResponse = useCallback((text: string, opts?: { skipTts?: boolean }) => {
    addMessage({ role: 'animus', text, ts: Date.now() });
    if (ttsEnabled && !opts?.skipTts) speak(text);
  }, [addMessage, ttsEnabled]);

  /** Trigger background greeting on first open */
  useEffect(() => {
    if (greeted) return;
    setGreeted(true);
    chrome.runtime.sendMessage({ action: 'brief' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      const greeting = resp.message as string;
      addMessage({ role: 'animus', text: greeting, ts: Date.now() });
      // TTS off by default — user can enable via 🔊 button
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Listen for proactive background messages (_timerDone, _tabChanged, _agentComplete) */
  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      if (msg.action === '_timerDone') {
        const label = (msg.label as string) || 'Timer';
        const alert = '⏱ "' + label + '" is done.';
        addMessage({ role: 'animus', text: alert, ts: Date.now() });
        if (ttsEnabled) speak(alert);
      } else if (msg.action === '_tabChanged') {
        const title = (msg.title as string) || 'Unknown';
        const context = (msg.context as string) || '';
        const note = '🌐 Active page: "' + title + '".' + (context ? '\n' + context : '');
        addMessage({ role: 'animus', text: note, ts: Date.now() });
      } else if (msg.action === '_agentComplete') {
        const agent = msg.agent as { name: string; mission: string; status: string; steps: { status: string }[] };
        if (!agent) return;
        const done = agent.steps.filter(s => s.status === 'done').length;
        const announcement = agent.status === 'complete'
          ? '🤖 ' + agent.name + ' — mission complete.\n\n"' + agent.mission.substring(0, 80) + '"\n\n' + done + '/' + agent.steps.length + ' sources extracted. Full report in the 🤖 Agents tab.'
          : '🤖 ' + agent.name + ' — status: ' + agent.status + '. Check the Agents tab for details.';
        addMessage({ role: 'animus', text: announcement, ts: Date.now() });
        if (ttsEnabled) speak(agent.name + ' mission complete.');
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => { chrome.runtime.onMessage.removeListener(listener); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMessage, ttsEnabled]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    // Special quick actions
    if (text === '__brief__') {
      chrome.runtime.sendMessage({ action: 'brief' }, (resp) => {
        if (chrome.runtime.lastError || !resp?.success) return;
        deliverResponse(resp.message as string);
      });
      return;
    }
    if (text === '__listtimers__') {
      chrome.runtime.sendMessage({ action: 'listTimers' }, (resp) => {
        if (chrome.runtime.lastError || !resp?.success) return;
        deliverResponse(resp.message as string);
      });
      return;
    }
    if (text === '__listagents__') {
      chrome.runtime.sendMessage({ action: 'listAgents' }, (resp) => {
        if (chrome.runtime.lastError || !resp?.success) return;
        const agents: Array<{ name: string; status: string; mission: string; currentStep: number; steps: unknown[] }> = resp?.agents || [];
        if (agents.length === 0) {
          deliverResponse('🤖 No agents deployed yet. Say "deploy agent: research [topic]" to send one out.');
          return;
        }
        const icon: Record<string, string> = { running: '🟢', complete: '✅', recalled: '⚡', failed: '❌', queued: '⏳' };
        const lines = agents.map(a => (icon[a.status] || '○') + ' ' + a.name + (a.status === 'running' ? ' [' + (a.currentStep + 1) + '/' + a.steps.length + ']' : '') + ' — ' + a.mission.substring(0, 60)).join('\n');
        deliverResponse('🤖 Sovereign Agents:\n\n' + lines + '\n\nCheck the 🤖 Agents tab for full reports and controls.');
      });
      return;
    }
    if (text === '__agent_research__') {
      addMessage({ role: 'animus', text: '🤖 What topic would you like me to research? Type it and I\'ll dispatch an agent right away.', ts: Date.now() });
      setInput('deploy agent: research ');
      return;
    }

    const userMsg = { role: 'user' as const, text: text.trim(), ts: Date.now() };
    addMessage(userMsg);
    setInput('');
    setTyping(true);

    chrome.runtime.sendMessage({ action: 'chat', text: text.trim() }, (resp) => {
      setTyping(false);
      if (chrome.runtime.lastError) {
        deliverResponse('[Error: ' + chrome.runtime.lastError.message + ']', { skipTts: true });
        return;
      }
      const reply: string = resp?.message || resp?.data?.message || 'No response.';
      deliverResponse(reply);
    });
  };

  const handleQuickAction = (qa: typeof QUICK_ACTIONS[number]) => {
    if (qa.prefill || qa.text.endsWith(': ') || qa.text.endsWith(' ')) { setInput(qa.text); return; }
    sendMessage(qa.text);
  };

  const copyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  const handleClearChat = () => {
    clearMessages();
    chrome.runtime.sendMessage({ action: 'clearChat' }, () => {});
  };

  const toggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    if (!next) window.speechSynthesis?.cancel();
  };

  const toggleMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      addMessage({ role: 'animus', text: 'Speech recognition not available in this browser.', ts: Date.now() });
      return;
    }
    if (micListening) { setMicListening(false); return; }
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    setMicListening(true);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setMicListening(false);
      sendMessage(transcript);
    };
    rec.onerror = () => setMicListening(false);
    rec.onend = () => setMicListening(false);
    rec.start();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0b08' }}>
      {/* Quick actions */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b" style={{ background: '#13100a', borderColor: '#2d2010' }}>
        <div className="flex gap-1 flex-1 flex-wrap">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              onClick={() => handleQuickAction(qa)}
              className="text-xs px-2 py-0.5 rounded text-gray-300 transition-colors"
              style={{ background: '#1e1a10', border: '1px solid #2d2010' }}
            >
              {qa.label}
            </button>
          ))}
        </div>
        <button
          onClick={toggleTts}
          title={ttsEnabled ? 'Voice output ON — click to mute' : 'Voice output OFF — click to enable'}
          className="text-xs px-2 py-0.5 rounded transition-colors flex-shrink-0"
          style={ttsEnabled ? { background: '#7a5c10', color: '#f0c040', border: '1px solid #d4a017' } : { background: '#1e1a10', color: '#666', border: '1px solid #2d2010' }}
        >
          {ttsEnabled ? '🔊' : '🔇'}
        </button>
        <button
          onClick={handleClearChat}
          title="Clear chat"
          className="text-xs px-2 py-0.5 rounded transition-colors ml-0.5 flex-shrink-0 text-gray-500 hover:text-red-400"
          style={{ background: '#1e1a10', border: '1px solid #2d2010' }}
        >
          🗑
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs mt-8 space-y-1">
            <div className="text-lg" style={{ color: '#d4a017' }}>⚡</div>
            <div className="text-gray-400">Vigil standing by</div>
            <div className="text-gray-600 text-[10px] leading-relaxed">
              Use <span style={{ color: '#d4a017' }}>Brief me</span> for a situational report.<br />
              Or ask anything — Vigil delegates to the right engine automatically.
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-fade-in flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'animus' && (
              <button
                onClick={() => speak(msg.text)}
                title="Speak"
                className="self-end mb-1 mr-1 text-xs text-gray-700 hover:text-amber-400 transition-colors flex-shrink-0"
              >
                🔊
              </button>
            )}
            <div
              onClick={() => copyMessage(msg.text, i)}
              title={new Date(msg.ts).toLocaleTimeString() + ' — click to copy'}
              className={`group max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words cursor-pointer relative`}
              style={msg.role === 'user'
                ? { background: 'rgba(212,160,23,0.12)', color: '#f0d080', border: '1px solid rgba(212,160,23,0.25)' }
                : { background: '#1a1810', color: '#d0cec0', border: '1px solid #2d2010' }
              }
            >
              {copiedIdx === i && (
                <span className="absolute -top-5 right-1 text-xs text-green-400 bg-gray-900 px-1 rounded">Copied!</span>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2 flex items-center gap-1.5" style={{ background: '#13100a', border: '1px solid #2d2010' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#d4a017', animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#d4a017', animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#d4a017', animationDelay: '300ms' }} />
              <span className="ml-1 text-[10px] font-mono" style={{ color: '#a88030' }}>Thinking…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 px-2 py-2 border-t" style={{ background: '#13100a', borderColor: '#2d2010' }}>
        <button
          onClick={toggleMic}
          className={`p-1.5 rounded-full text-sm transition-all ${micListening ? 'animate-pulse' : ''}`}
          style={{ background: micListening ? '#7a1010' : '#1e1a10', color: micListening ? '#fff' : '#888' }}
          title={micListening ? 'Stop listening' : 'Voice input'}
        >
          🎤
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="What's on your mind…"
          className="flex-1 rounded-lg px-3 py-1.5 text-xs text-gray-100 placeholder-gray-600 outline-none transition-colors"
          style={{ background: '#1e1a10', border: '1px solid #2d2010' }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          className="p-1.5 rounded-lg text-xs transition-colors"
          style={{ background: !input.trim() || isTyping ? '#1e1a10' : '#7a5c10', color: !input.trim() || isTyping ? '#555' : '#fff' }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
