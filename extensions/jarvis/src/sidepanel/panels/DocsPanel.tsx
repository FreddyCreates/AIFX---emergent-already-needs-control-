/**
 * DocsPanel — ANIMUS v13 File Manager
 *
 * Folder-organized document storage. Folders live in chrome.storage.local;
 * documents come from Dexie via the background. Docs can be assigned to folders
 * through a lightweight mapping also stored in chrome.storage.local.
 *
 * Folder structure persists across sessions. Documents are kernelized to the
 * backend (Dexie) automatically when Jarvis creates them.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useJarvisStore } from '../../store';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

const FOLDER_COLORS = [
  'text-cyan-400', 'text-purple-400', 'text-green-400',
  'text-yellow-400', 'text-pink-400', 'text-orange-400',
];

const FOLDERS_KEY  = 'jarvis_folders';
const FMAP_KEY     = 'jarvis_folder_map';   // Record<docId, folderId>

/* ── DocsPanel ──────────────────────────────────────────────────────────────── */

export default function DocsPanel() {
  const { docs, setDocs } = useJarvisStore();

  const [folders, setFolders]     = useState<Folder[]>([]);
  const [folderMap, setFolderMap] = useState<Record<string, string>>({});
  const [expanded, setExpanded]   = useState<Set<string>>(new Set(['__none__']));
  const [adding, setAdding]       = useState(false);
  const [folderName, setFolderName] = useState('');
  const [colorIdx, setColorIdx]   = useState(0);
  const [assignTarget, setAssignTarget] = useState<{ docId: string; open: boolean } | null>(null);
  const [search, setSearch]       = useState('');

  /* ── Load all data ── */
  const loadDocs = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'listDocuments' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setDocs(resp.documents || []);
    });
  }, [setDocs]);

  const loadFolders = useCallback(() => {
    chrome.storage.local.get([FOLDERS_KEY, FMAP_KEY], (d) => {
      setFolders((d[FOLDERS_KEY] as Folder[]) || []);
      setFolderMap((d[FMAP_KEY] as Record<string, string>) || {});
    });
  }, []);

  useEffect(() => { loadDocs(); loadFolders(); }, [loadDocs, loadFolders]);

  /* ── Create folder ── */
  const createFolder = () => {
    if (!folderName.trim()) return;
    const folder: Folder = {
      id: 'f-' + Date.now(),
      name: folderName.trim(),
      color: FOLDER_COLORS[colorIdx],
      createdAt: Date.now(),
    };
    const updated = [...folders, folder];
    chrome.storage.local.set({ [FOLDERS_KEY]: updated }, () => {
      setFolders(updated);
      setFolderName('');
      setAdding(false);
      // Auto-expand new folder
      setExpanded(prev => new Set([...prev, folder.id]));
    });
  };

  /* ── Delete folder (docs go to Unfiled) ── */
  const deleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter(f => f.id !== folderId);
    const updatedMap = { ...folderMap };
    for (const [docId, fid] of Object.entries(updatedMap)) {
      if (fid === folderId) delete updatedMap[docId];
    }
    chrome.storage.local.set({ [FOLDERS_KEY]: updatedFolders, [FMAP_KEY]: updatedMap }, () => {
      setFolders(updatedFolders);
      setFolderMap(updatedMap);
    });
  };

  /* ── Assign doc to folder ── */
  const assignToFolder = (docId: string, folderId: string | null) => {
    const updated = { ...folderMap };
    if (folderId === null) { delete updated[docId]; }
    else { updated[docId] = folderId; }
    chrome.storage.local.set({ [FMAP_KEY]: updated }, () => setFolderMap(updated));
    setAssignTarget(null);
  };

  /* ── Toggle folder expand ── */
  const toggleFolder = (id: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  /* ── Download doc ── */
  const downloadDoc = (doc: any) => {
    if (doc.type === 'pdf') {
      chrome.runtime.sendMessage({ action: 'generatePdf', title: doc.title, content: doc.content, author: doc.author });
    } else {
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = doc.title.replace(/[^a-z0-9]/gi, '_') + '.txt'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const typeIcon = (type: string) => type === 'pdf' ? '📄' : type === 'excel' ? '📊' : '📝';

  /* ── Filtered docs ── */
  const filteredDocs = useMemo(() => {
    if (!search.trim()) return docs;
    const q = search.toLowerCase();
    return docs.filter((d: any) =>
      d.title.toLowerCase().includes(q) || (d.content || '').toLowerCase().includes(q),
    );
  }, [docs, search]);

  /* ── Group docs by folder ── */
  const docsByFolder = useMemo(() => {
    const map = new Map<string, any[]>(); // folderId → docs
    map.set('__none__', []);
    for (const f of folders) map.set(f.id, []);

    for (const doc of filteredDocs) {
      const fid = folderMap[doc.id];
      if (fid && map.has(fid)) { map.get(fid)!.push(doc); }
      else { map.get('__none__')!.push(doc); }
    }
    return map;
  }, [filteredDocs, folders, folderMap]);

  /* ── Render a single doc row ── */
  const DocRow = ({ doc }: { doc: any }) => (
    <div className="flex items-start gap-2 px-3 py-2 hover:bg-gray-800/30 transition-colors group border-b border-gray-800/30">
      <span className="text-base flex-shrink-0">{typeIcon(doc.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-gray-200 truncate">{doc.title}</div>
        <div className="text-[9px] text-gray-600 mt-0.5">
          {doc.author} · {doc.type} · {new Date(doc.timestamp).toLocaleDateString()}
        </div>
        {doc.content && (
          <div className="text-[9px] text-gray-600 truncate mt-0.5">
            {doc.content.substring(0, 80)}…
          </div>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Assign to folder */}
        <div className="relative">
          <button
            onClick={() => setAssignTarget(t => t?.docId === doc.id ? null : { docId: doc.id, open: true })}
            title="Move to folder"
            className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors"
          >
            📁
          </button>
          {assignTarget?.docId === doc.id && (
            <div className="absolute right-0 top-5 z-20 bg-gray-800 border border-gray-700 rounded shadow-xl min-w-[120px]">
              <button
                onClick={() => assignToFolder(doc.id, null)}
                className="block w-full text-left px-2 py-1 text-[10px] text-gray-400 hover:bg-gray-700 transition-colors"
              >
                🗂 Unfiled
              </button>
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => assignToFolder(doc.id, f.id)}
                  className="block w-full text-left px-2 py-1 text-[10px] text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <span className={f.color}>📁</span> {f.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => downloadDoc(doc)}
          title="Download"
          className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors"
        >
          ⬇
        </button>
      </div>
    </div>
  );

  /* ── Render a folder section ── */
  const FolderSection = ({
    id, label, color, docs: sectionDocs, deletable,
  }: {
    id: string; label: string; color?: string; docs: any[]; deletable?: boolean;
  }) => {
    const isOpen = expanded.has(id);
    return (
      <div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/40 border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/30 transition-colors group/folder"
          onClick={() => toggleFolder(id)}
        >
          <span className={color || 'text-gray-500'}>📁</span>
          <span className="text-[10px] font-semibold text-gray-300 flex-1">{label}</span>
          <span className="text-[9px] text-gray-600">{sectionDocs.length}</span>
          {deletable && sectionDocs.length === 0 && (
            <button
              onClick={e => { e.stopPropagation(); deleteFolder(id); }}
              className="text-[9px] text-red-700 hover:text-red-500 opacity-0 group-hover/folder:opacity-100 transition-opacity"
            >
              🗑
            </button>
          )}
          <span className="text-[9px] text-gray-700">{isOpen ? '▲' : '▼'}</span>
        </div>
        {isOpen && sectionDocs.map((doc: any) => <DocRow key={doc.id} doc={doc} />)}
        {isOpen && sectionDocs.length === 0 && (
          <div className="px-6 py-2 text-[10px] text-gray-700 italic border-b border-gray-800/30">
            Empty — assign docs here via 📁 on any document.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-200 text-xs">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 bg-gray-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-orange-400">📁</span>
          <span className="font-bold tracking-widest text-[11px] text-white">FILES</span>
          <span className="text-[9px] text-gray-600">{docs.length} doc{docs.length !== 1 ? 's' : ''} · {folders.length} folder{folders.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={loadDocs} className="text-[9px] text-cyan-600 hover:text-cyan-400 transition-colors">↻</button>
          <button
            onClick={() => setAdding(a => !a)}
            className="text-[10px] px-2 py-0.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded transition-colors"
          >
            {adding ? '✕' : '+ Folder'}
          </button>
        </div>
      </div>

      {/* ── New folder form ── */}
      {adding && (
        <div className="border-b border-gray-800 bg-gray-900/80 px-3 py-2 space-y-2 flex-shrink-0">
          <div className="flex gap-1">
            {FOLDER_COLORS.map((c, i) => (
              <button
                key={c}
                onClick={() => setColorIdx(i)}
                className={`w-5 h-5 rounded-full border-2 transition-colors ${c.replace('text-', 'bg-').replace('/400', '/60')} ${colorIdx === i ? 'border-white' : 'border-transparent'}`}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              placeholder="Folder name…"
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
            />
            <button
              onClick={createFolder}
              disabled={!folderName.trim()}
              className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* ── Search ── */}
      <div className="px-3 py-1.5 border-b border-gray-800/40 flex-shrink-0">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
        />
      </div>

      {/* ── File tree ── */}
      <div className="flex-1 overflow-y-auto" onClick={() => assignTarget && setAssignTarget(null)}>
        {docs.length === 0 && !search && (
          <div className="text-center text-gray-600 py-10 space-y-2">
            <div className="text-3xl">📄</div>
            <div>No documents yet.</div>
            <div className="text-gray-700 text-[10px] px-4 leading-relaxed">
              Say <em>"create pdf: title"</em> or <em>"generate excel"</em> in Chat.<br />
              Documents are saved here automatically and kernelized to the backend.
            </div>
          </div>
        )}

        {/* Folder sections */}
        {folders.map(f => (
          <FolderSection
            key={f.id}
            id={f.id}
            label={f.name}
            color={f.color}
            docs={docsByFolder.get(f.id) || []}
            deletable
          />
        ))}

        {/* Unfiled */}
        <FolderSection
          id="__none__"
          label="Unfiled"
          docs={docsByFolder.get('__none__') || []}
        />
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-1.5 border-t border-gray-800 bg-gray-900/40 flex-shrink-0">
        <p className="text-[9px] text-gray-700">Documents are stored in IndexedDB (Dexie). Folder structure persists in chrome.storage.local.</p>
      </div>
    </div>
  );
}

