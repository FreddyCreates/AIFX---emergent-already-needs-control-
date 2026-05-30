import React, { useState, useEffect } from 'react';

interface CampaignStep {
  index: number;
  text: string;
  status: 'pending' | 'active' | 'done' | 'failed';
  note?: string;
}

interface Campaign {
  id: string;
  title: string;
  goal: string;
  steps: CampaignStep[];
  status: 'active' | 'paused' | 'complete';
  createdAt: number;
  updatedAt: number;
  currentStep: number;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-gray-500',
  active:  'text-cyan-400',
  done:    'text-emerald-400',
  failed:  'text-red-400',
};

const STATUS_ICON: Record<string, string> = {
  pending: '○',
  active:  '▶',
  done:    '✓',
  failed:  '✗',
};

const CAMPAIGN_STATUS_COLOR: Record<string, string> = {
  active:   'text-cyan-400 border-cyan-700',
  paused:   'text-amber-400 border-amber-700',
  complete: 'text-emerald-400 border-emerald-700',
};

export default function CampaignPanel() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [stepsRaw, setStepsRaw] = useState('');
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    chrome.runtime.sendMessage({ action: 'getCampaigns' }, (r) => {
      if (r?.success) setCampaigns(r.campaigns || []);
    });
  };

  useEffect(() => { load(); }, []);

  const startCampaign = () => {
    if (!title.trim() || !goal.trim()) { setMsg('Title and goal are required.'); return; }
    const steps = stepsRaw.split('\n').map(s => s.trim()).filter(Boolean);
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'startCampaign', title, goal, steps }, (r) => {
      setLoading(false);
      if (r?.success) {
        setMsg(r.message || 'Campaign launched.');
        setTitle(''); setGoal(''); setStepsRaw('');
        setCreating(false);
        load();
      } else {
        setMsg(r?.message || 'Failed to start campaign.');
      }
    });
  };

  const stepAction = (id: string, stepIndex: number, status: string) => {
    chrome.runtime.sendMessage({ action: 'stepCampaign', id, stepIndex, status }, (r) => {
      if (r?.success) { setMsg(r.message || ''); load(); }
    });
  };

  const deleteCampaign = (id: string) => {
    chrome.runtime.sendMessage({ action: 'deleteCampaign', id }, (r) => {
      if (r?.success) load();
    });
  };

  const pauseCampaign = (id: string) => {
    chrome.runtime.sendMessage({ action: 'pauseCampaign', id }, (r) => {
      if (r?.success) load();
    });
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0d0b08] text-xs text-gray-300 select-none">

      {/* Header */}
      <div className="px-3 py-2 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#2d2010', background: '#13100a' }}>
        <div className="flex items-center gap-2">
          <span className="text-amber-400">🎯</span>
          <span className="font-bold tracking-widest text-white text-[11px]">CAMPAIGNS</span>
          <span className="text-[9px] px-1 py-0.5 rounded border font-bold" style={{ borderColor: '#d4a017', color: '#d4a017' }}>v17 Alpha</span>
        </div>
        <button
          onClick={() => setCreating(c => !c)}
          className="text-[10px] px-2 py-1 rounded border transition-colors"
          style={{ borderColor: '#2d2010', background: creating ? 'rgba(212,160,23,0.15)' : 'transparent', color: creating ? '#d4a017' : '#6b7280' }}
        >
          {creating ? '✕ Cancel' : '＋ New'}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="px-3 py-3 border-b space-y-2" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
          <p className="text-[10px] text-amber-400 font-semibold">New Campaign</p>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Campaign title…"
            className="w-full bg-[#13100a] border rounded px-2 py-1.5 text-gray-200 outline-none text-xs"
            style={{ borderColor: '#2d2010' }}
          />
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Goal — what does success look like?"
            rows={2}
            className="w-full bg-[#13100a] border rounded px-2 py-1.5 text-gray-200 outline-none text-xs resize-none"
            style={{ borderColor: '#2d2010' }}
          />
          <textarea
            value={stepsRaw}
            onChange={e => setStepsRaw(e.target.value)}
            placeholder={"Steps (one per line):\nResearch competitors\nDraft positioning doc\nReview with team"}
            rows={4}
            className="w-full bg-[#13100a] border rounded px-2 py-1.5 text-gray-400 outline-none text-xs resize-none font-mono"
            style={{ borderColor: '#2d2010' }}
          />
          <button
            onClick={startCampaign}
            disabled={loading}
            className="w-full py-1.5 rounded font-bold text-[11px] transition-colors"
            style={{ background: 'rgba(212,160,23,0.2)', color: '#d4a017', border: '1px solid #d4a017' }}
          >
            {loading ? 'Launching…' : '🎯 Launch Campaign'}
          </button>
        </div>
      )}

      {/* Status msg */}
      {msg && (
        <div className="px-3 py-1.5 text-[10px] border-b" style={{ borderColor: '#2d2010', background: '#0f0d09', color: '#d4a017' }}>
          {msg}
          <button onClick={() => setMsg('')} className="ml-2 text-gray-600 hover:text-gray-400">✕</button>
        </div>
      )}

      {/* Campaign list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {campaigns.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <p className="text-2xl mb-2">🎯</p>
            <p>No campaigns yet.</p>
            <p className="mt-1 text-gray-700">Start one for long-running missions, research sprints, or multi-step work.</p>
          </div>
        )}
        {campaigns.map(cmp => (
          <div key={cmp.id} className="border rounded-lg overflow-hidden" style={{ borderColor: '#2d2010' }}>
            {/* Campaign header */}
            <div
              className="flex items-start justify-between px-2.5 py-2 cursor-pointer hover:bg-[#13100a]"
              onClick={() => setExpanded(expanded === cmp.id ? null : cmp.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-gray-200 text-[11px] truncate">{cmp.title}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded border font-bold ${CAMPAIGN_STATUS_COLOR[cmp.status] ?? 'text-gray-400 border-gray-700'}`}>
                    {cmp.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-500 mt-0.5 leading-relaxed truncate">{cmp.goal}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                  <span>{cmp.steps.filter(s => s.status === 'done').length}/{cmp.steps.length} steps</span>
                  <span>·</span>
                  <span>{fmtDate(cmp.updatedAt)}</span>
                </div>
              </div>
              <span className="text-gray-600 ml-2 flex-shrink-0">{expanded === cmp.id ? '▲' : '▼'}</span>
            </div>

            {/* Progress bar */}
            {cmp.steps.length > 0 && (
              <div className="h-0.5 w-full bg-[#1a1408]">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(cmp.steps.filter(s => s.status === 'done').length / cmp.steps.length) * 100}%` }}
                />
              </div>
            )}

            {/* Expanded step list */}
            {expanded === cmp.id && (
              <div className="px-2.5 pb-2 pt-1 bg-[#0a0806]">
                <p className="text-[10px] text-amber-400 mb-1.5 font-semibold">Steps</p>
                {cmp.steps.length === 0 && (
                  <p className="text-gray-600 text-[10px]">No steps defined.</p>
                )}
                {cmp.steps.map(step => (
                  <div key={step.index} className="flex items-start gap-2 py-1 border-b last:border-0" style={{ borderColor: '#1a1408' }}>
                    <span className={`text-[11px] font-mono flex-shrink-0 mt-0.5 ${STATUS_COLOR[step.status] ?? 'text-gray-500'}`}>
                      {STATUS_ICON[step.status] ?? '○'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`leading-relaxed ${step.status === 'done' ? 'line-through text-gray-600' : 'text-gray-300'}`}>{step.text}</p>
                      {step.note && <p className="text-[10px] text-gray-500 mt-0.5">{step.note}</p>}
                    </div>
                    {step.status === 'pending' || step.status === 'active' ? (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => stepAction(cmp.id, step.index, 'done')}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-800/60 transition-colors"
                        >✓</button>
                        <button
                          onClick={() => stepAction(cmp.id, step.index, 'failed')}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/40 hover:bg-red-800/60 transition-colors"
                        >✗</button>
                      </div>
                    ) : null}
                  </div>
                ))}

                {/* Actions */}
                <div className="flex gap-1.5 mt-2">
                  {cmp.status === 'active' && (
                    <button
                      onClick={() => pauseCampaign(cmp.id)}
                      className="text-[10px] px-2 py-1 rounded border transition-colors text-amber-400 border-amber-800/40 hover:bg-amber-900/30"
                    >⏸ Pause</button>
                  )}
                  <button
                    onClick={() => { if (confirm('Delete this campaign?')) deleteCampaign(cmp.id); }}
                    className="text-[10px] px-2 py-1 rounded border transition-colors text-red-400 border-red-800/40 hover:bg-red-900/30"
                  >🗑 Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 text-[10px] text-gray-700 border-t flex-shrink-0" style={{ borderColor: '#1a1408' }}>
        Vigil tracks each step. Neurochemistry responds as you progress.
      </div>
    </div>
  );
}
