/**
 * PromptsPanel — ANIMUS v13
 *
 * Saved prompt templates with variable placeholders.
 * Use {{variable}} syntax for fill-in slots.
 *
 * Ships with smart defaults (Research, SWOT, Code Review, etc).
 * User-created prompts are stored in chrome.storage.local.
 * Click "Use" to copy the template to clipboard, then paste into Chat.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useJarvisStore } from '../../store';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type PromptCategory = 'research' | 'analysis' | 'writing' | 'code' | 'chat' | 'strategy';

interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  category: PromptCategory;
  usageCount: number;
  isDefault?: boolean;
  createdAt: number;
}

/* ── Constants ──────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'jarvis_prompts';

const CAT_STYLE: Record<PromptCategory, string> = {
  research:  'bg-blue-900/40 text-blue-300 border-blue-800/50',
  analysis:  'bg-purple-900/40 text-purple-300 border-purple-800/50',
  writing:   'bg-green-900/40 text-green-300 border-green-800/50',
  code:      'bg-orange-900/40 text-orange-300 border-orange-800/50',
  chat:      'bg-gray-700/60 text-gray-300 border-gray-600/50',
  strategy:  'bg-cyan-900/40 text-cyan-300 border-cyan-800/50',
};

const CAT_ICON: Record<PromptCategory, string> = {
  research: '🔬',
  analysis: '📊',
  writing:  '✍️',
  code:     '💻',
  chat:     '💬',
  strategy: '♟',
};

const DEFAULTS: PromptTemplate[] = [
  {
    id: 'def-1', name: 'Deep Research', category: 'research', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Research {{topic}} in depth. Give me key findings, recent developments, and practical implications.',
  },
  {
    id: 'def-2', name: 'SWOT Analysis', category: 'analysis', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Run a SWOT analysis on {{subject}}. Cover Strengths, Weaknesses, Opportunities, and Threats with specifics.',
  },
  {
    id: 'def-3', name: 'First Principles', category: 'analysis', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Break {{topic}} down to first principles. What are the irreducible truths? What assumptions do people make that are wrong?',
  },
  {
    id: 'def-4', name: 'Code Review', category: 'code', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Review this code for bugs, performance issues, security flaws, and style: {{code}}',
  },
  {
    id: 'def-5', name: 'Draft Email', category: 'writing', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Draft a professional email to {{recipient}} about {{subject}}. Keep it direct and clear.',
  },
  {
    id: 'def-6', name: 'Decision Matrix', category: 'strategy', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Help me decide: {{decision}}. Use impact, effort, risk, and alignment as criteria. What do you recommend and why?',
  },
  {
    id: 'def-7', name: 'Explain Simply', category: 'chat', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Explain {{concept}} simply, like I\'m thinking through it for the first time. Use an analogy if it helps.',
  },
  {
    id: 'def-8', name: 'Brainstorm', category: 'strategy', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Brainstorm 10 unconventional approaches to {{problem}}. Don\'t filter — I want the wild ones too.',
  },
  {
    id: 'def-9', name: 'Summarize Page', category: 'research', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Read this page and give me the key points, main argument, and any data that matters: {{url}}',
  },
  {
    id: 'def-10', name: 'Theory Test', category: 'analysis', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Test this theory: {{theory}}. What supports it? What breaks it? What would prove it wrong?',
  },
  {
    id: 'def-11', name: 'Deploy Research Mission', category: 'strategy', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Deploy a researcher agent on {{topic}}. Crawl top sources, extract key findings, and synthesize a report.',
  },
  {
    id: 'def-12', name: 'Build a Plan', category: 'strategy', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Build a step-by-step execution plan for {{goal}}. Include milestones, resources needed, and potential blockers.',
  },
  {
    id: 'def-13', name: 'Competitive Analysis', category: 'research', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Run a competitive analysis on {{company_or_product}}. Who are the top 5 competitors? What are their strengths and weaknesses?',
  },
  {
    id: 'def-14', name: 'Refactor Code', category: 'code', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Refactor this code for readability, performance, and best practices:\n\n{{code}}',
  },
  {
    id: 'def-15', name: 'Market Research', category: 'research', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Research the market for {{product_or_service}}. Market size, trends, key players, and opportunities.',
  },
  {
    id: 'def-16', name: 'Teach Me', category: 'chat', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Teach me {{concept}} from first principles. Start simple, build up complexity, give real examples.',
  },
  {
    id: 'def-17', name: 'Agent Multi-Mission', category: 'strategy', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Deploy a research agent on {{topic}}, open a writing tab, and synthesize what the agent finds into a structured document.',
  },
  {
    id: 'def-18', name: 'Debate Both Sides', category: 'analysis', usageCount: 0, isDefault: true, createdAt: 0,
    template: 'Argue both sides of: {{topic}}. Give the strongest case for each position, then your conclusion.',
  },
];

/* ── PromptsPanel ───────────────────────────────────────────────────────────── */

export default function PromptsPanel() {
  const { setActivePanel } = useJarvisStore();

  const [userPrompts, setUserPrompts] = useState<PromptTemplate[]>([]);
  const [adding, setAdding]           = useState(false);
  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState<PromptCategory | 'all'>('all');
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [copied, setCopied]           = useState<string | null>(null);

  /* form state */
  const [fname, setFname]       = useState('');
  const [ftemplate, setFtemplate] = useState('');
  const [fcategory, setFcategory] = useState<PromptCategory>('chat');

  /* ── Load user prompts ── */
  const load = useCallback(() => {
    chrome.storage.local.get([STORAGE_KEY], (d) => {
      setUserPrompts((d[STORAGE_KEY] as PromptTemplate[]) || []);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Save user prompt ── */
  const savePrompt = () => {
    if (!fname.trim() || !ftemplate.trim()) return;
    const p: PromptTemplate = {
      id: 'p-' + Date.now(),
      name: fname.trim(),
      template: ftemplate.trim(),
      category: fcategory,
      usageCount: 0,
      isDefault: false,
      createdAt: Date.now(),
    };
    const updated = [...userPrompts, p];
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
      setUserPrompts(updated);
      setFname(''); setFtemplate(''); setAdding(false);
    });
  };

  /* ── Delete user prompt ── */
  const deletePrompt = (id: string) => {
    const updated = userPrompts.filter(p => p.id !== id);
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => setUserPrompts(updated));
  };

  /* ── Use a prompt (copy to clipboard, bump usage) ── */
  const usePrompt = (prompt: PromptTemplate) => {
    navigator.clipboard.writeText(prompt.template).catch(() => {});
    setCopied(prompt.id);
    setTimeout(() => setCopied(null), 1500);

    /* Increment usage count for user prompts */
    if (!prompt.isDefault) {
      const updated = userPrompts.map(p =>
        p.id === prompt.id ? { ...p, usageCount: p.usageCount + 1 } : p,
      );
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => setUserPrompts(updated));
    }

    /* Switch to chat so the user can immediately paste */
    setTimeout(() => setActivePanel('chat'), 200);
  };

  /* ── Merged + filtered prompt list ── */
  const allPrompts = [
    ...DEFAULTS,
    ...userPrompts.sort((a, b) => b.usageCount - a.usageCount),
  ];

  const filtered = allPrompts.filter(p => {
    const matchCat = filterCat === 'all' || p.category === filterCat;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.template.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const CATEGORIES: PromptCategory[] = ['research', 'analysis', 'strategy', 'writing', 'code', 'chat'];

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-200 text-xs">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 bg-gray-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-yellow-300">💡</span>
          <span className="font-bold tracking-widest text-[11px] text-white">PROMPTS</span>
          <span className="text-[9px] text-gray-600">{allPrompts.length} templates</span>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          className="text-[10px] px-2 py-0.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded transition-colors"
        >
          {adding ? '✕ Cancel' : '+ New'}
        </button>
      </div>

      {/* ── Add form ── */}
      {adding && (
        <div className="border-b border-gray-800 bg-gray-900/80 px-3 py-2 space-y-2 flex-shrink-0">
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setFcategory(c)}
                className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
                  fcategory === c ? CAT_STYLE[c] : 'bg-gray-800 text-gray-500 border-gray-700'
                }`}
              >
                {CAT_ICON[c]} {c}
              </button>
            ))}
          </div>
          <input
            value={fname}
            onChange={e => setFname(e.target.value)}
            placeholder="Template name…"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
          />
          <textarea
            value={ftemplate}
            onChange={e => setFtemplate(e.target.value)}
            placeholder="Template text… use {{variable}} for fill-in placeholders"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors resize-none"
          />
          <p className="text-[9px] text-gray-700">
            After clicking "Use", paste the template into Chat and fill in the <span className="text-gray-500">{'{{'}</span>variables<span className="text-gray-500">{'}}'}</span>.
          </p>
          <button
            onClick={savePrompt}
            disabled={!fname.trim() || !ftemplate.trim()}
            className="w-full py-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
          >
            Save Template
          </button>
        </div>
      )}

      {/* ── Search + filter ── */}
      <div className="px-3 py-1.5 border-b border-gray-800/40 space-y-1.5 flex-shrink-0">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search prompts…"
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
        />
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterCat('all')}
            className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
              filterCat === 'all' ? 'bg-gray-600 text-gray-200 border-gray-500' : 'bg-gray-800 text-gray-600 border-gray-700'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
                filterCat === c ? CAT_STYLE[c] : 'bg-gray-800 text-gray-600 border-gray-700'
              }`}
            >
              {CAT_ICON[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Prompt list ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            {search || filterCat !== 'all' ? 'No matching templates.' : 'No templates yet.'}
          </div>
        )}

        {filtered.map(p => (
          <div key={p.id} className="px-3 py-2 hover:bg-gray-800/20 transition-colors">
            {/* Row */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-medium text-gray-200">{p.name}</span>
                  <span className={`text-[8px] px-1.5 py-px rounded border ${CAT_STYLE[p.category]}`}>
                    {CAT_ICON[p.category]} {p.category}
                  </span>
                  {!p.isDefault && p.usageCount > 0 && (
                    <span className="text-[9px] text-gray-700">×{p.usageCount}</span>
                  )}
                </div>
                <div className="text-[9px] text-gray-600 truncate mt-0.5">
                  {p.template.substring(0, 70)}{p.template.length > 70 ? '…' : ''}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); usePrompt(p); }}
                  className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                    copied === p.id
                      ? 'bg-green-800/60 text-green-300'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {copied === p.id ? '✓ Copied' : '📋 Use'}
                </button>

                {!p.isDefault && (
                  <button
                    onClick={e => { e.stopPropagation(); deletePrompt(p.id); }}
                    className="text-[9px] text-red-600 hover:text-red-400 transition-colors"
                  >
                    🗑
                  </button>
                )}

                <span className="text-[9px] text-gray-700">
                  {expanded === p.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Expanded template preview */}
            {expanded === p.id && (
              <div className="mt-1.5 px-2 py-2 bg-gray-800/50 rounded border border-gray-700/40 text-[10px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
                {p.template}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-1.5 border-t border-gray-800 bg-gray-900/40 flex-shrink-0">
        <p className="text-[9px] text-gray-700">
          Click <span className="text-gray-500">Use</span> → copy template → paste into Chat → fill in {'{{variables}}'}.
        </p>
      </div>
    </div>
  );
}
