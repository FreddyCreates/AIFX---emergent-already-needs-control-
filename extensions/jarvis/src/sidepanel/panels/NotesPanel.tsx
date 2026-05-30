/**
 * NotesPanel — ANIMUS v13 Journal
 *
 * Bidirectional journal: the user can write notes, and Jarvis writes here too.
 * Author badges distinguish user entries from Jarvis entries.
 * Full CRUD + search + date grouping.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useJarvisStore } from '../../store';

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function dayLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const fmt = (d: Date) => d.toDateString();
  if (fmt(d) === fmt(today))     return 'Today';
  if (fmt(d) === fmt(yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupByDay(notes: any[]): Map<string, any[]> {
  const map = new Map<string, any[]>();
  for (const n of notes) {
    const label = dayLabel(n.timestamp);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(n);
  }
  return map;
}

/* ── NotesPanel ─────────────────────────────────────────────────────────────── */

export default function NotesPanel() {
  const { notes, setNotes } = useJarvisStore();
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [copied, setCopied]   = useState<number | null>(null);

  const loadNotes = () => {
    chrome.runtime.sendMessage({ action: 'listNotes' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setNotes(resp.notes || []);
    });
  };

  useEffect(() => { loadNotes(); }, []);

  /* Also refresh when Jarvis takes a note from Chat */
  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      if (msg.action === '_noteTaken') loadNotes();
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const saveNote = () => {
    if (!newNote.trim()) return;
    setSaving(true);
    chrome.runtime.sendMessage({ action: 'takeNote', content: newNote.trim() }, (resp) => {
      setSaving(false);
      if (resp?.success) { setNewNote(''); loadNotes(); }
    });
  };

  const deleteNote = (noteId: number) => {
    chrome.runtime.sendMessage({ action: 'deleteNote', noteId }, (resp) => {
      if (resp?.success) loadNotes();
    });
  };

  const copyNote = (content: string, id: number) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  /* Filter + group */
  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter((n: any) =>
      n.content.toLowerCase().includes(q) ||
      (n.author || '').toLowerCase().includes(q),
    );
  }, [notes, search]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  const isJarvis = (author: string) => !author || author.toLowerCase() !== 'user';

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-200 text-xs">

      {/* ── Composer ── */}
      <div className="px-3 py-2 bg-gray-900/50 border-b border-gray-800/50 flex-shrink-0">
        <div className="text-[9px] tracking-widest uppercase text-gray-600 mb-1.5">Journal — add entry</div>
        <div className="flex gap-1.5">
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(); } }}
            placeholder="Write a note… (Enter to save, Shift+Enter for newline)"
            rows={2}
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors resize-none"
          />
          <button
            onClick={saveNote}
            disabled={!newNote.trim() || saving}
            className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-xs transition-colors self-end"
          >
            {saving ? '…' : '+ Save'}
          </button>
        </div>
        <p className="text-[9px] text-gray-700 mt-1">
          Jarvis also writes here automatically when he takes notes during your session.
        </p>
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800/50 flex-shrink-0">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search journal…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
        />
        <span className="text-[9px] text-gray-600 flex-shrink-0">
          {filtered.length}/{notes.length}
        </span>
        <button onClick={loadNotes} className="text-[10px] text-cyan-600 hover:text-cyan-400 transition-colors flex-shrink-0">↻</button>
      </div>

      {/* ── Journal entries (grouped by day) ── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 py-10 space-y-1">
            <div className="text-2xl">📓</div>
            <div>{search ? 'No matches.' : 'Journal is empty. Write above or ask Jarvis to take a note.'}</div>
          </div>
        )}

        {[...grouped.entries()].map(([day, dayNotes]) => (
          <div key={day}>
            {/* Day header */}
            <div className="sticky top-0 z-10 px-3 py-1 bg-gray-900/90 border-b border-gray-800/40 backdrop-blur">
              <span className="text-[9px] tracking-widest uppercase text-gray-600">{day}</span>
              <span className="text-[9px] text-gray-700 ml-1.5">{dayNotes.length} entr{dayNotes.length !== 1 ? 'ies' : 'y'}</span>
            </div>

            {/* Entries */}
            {dayNotes.map((note: any) => {
              const byJarvis = isJarvis(note.author);
              return (
                <div
                  key={note.id}
                  className={`flex items-start gap-2 px-3 py-2.5 border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors group ${
                    byJarvis ? 'border-l-2 border-l-cyan-900/60' : 'border-l-2 border-l-blue-900/60'
                  }`}
                >
                  {/* Author icon */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] mt-0.5 ${
                    byJarvis ? 'bg-cyan-900/50 text-cyan-400' : 'bg-blue-900/40 text-blue-400'
                  }`}>
                    {byJarvis ? '⚡' : '🧑'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[9px] font-semibold ${byJarvis ? 'text-cyan-500' : 'text-blue-400'}`}>
                        {byJarvis ? 'ANIMUS' : 'You'}
                      </span>
                      <span className="text-[8px] text-gray-700">
                        {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                    <button
                      onClick={() => copyNote(note.content, note.id)}
                      title="Copy"
                      className={`text-[10px] transition-colors ${
                        copied === note.id ? 'text-green-400' : 'text-gray-600 hover:text-gray-300'
                      }`}
                    >
                      {copied === note.id ? '✓' : '📋'}
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      title="Delete"
                      className="text-[10px] text-red-700 hover:text-red-400 transition-colors"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

