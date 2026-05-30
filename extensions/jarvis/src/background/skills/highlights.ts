/* ============================================================
 *  Highlights — Annotation / Highlight Engine
 *  Stores highlights in chrome.storage.local under 'animus_highlights'
 * ============================================================ */

export interface HighlightEntry {
  id: string;
  url: string;
  title: string;
  text: string;
  context: string;
  color: string;
  timestamp: number;
  tags: string[];
}

const STORAGE_KEY = 'animus_highlights';

/* ----------------------------------------------------------
 *  saveHighlight — persist a new highlight
 * ---------------------------------------------------------- */
export async function saveHighlight(entry: HighlightEntry): Promise<void> {
  const existing = await loadAll();
  existing.unshift(entry);
  await chrome.storage.local.set({ [STORAGE_KEY]: existing });
}

/* ----------------------------------------------------------
 *  getHighlights — retrieve all or filter by URL
 * ---------------------------------------------------------- */
export async function getHighlights(url?: string): Promise<HighlightEntry[]> {
  const all = await loadAll();
  if (!url) return all;
  return all.filter(h => h.url === url);
}

/* ----------------------------------------------------------
 *  deleteHighlight — remove a highlight by id
 * ---------------------------------------------------------- */
export async function deleteHighlight(id: string): Promise<void> {
  const existing = await loadAll();
  const filtered = existing.filter(h => h.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

/* ----------------------------------------------------------
 *  exportHighlights — return all highlights as a JSON string
 * ---------------------------------------------------------- */
export async function exportHighlights(): Promise<string> {
  const all = await loadAll();
  return JSON.stringify(all, null, 2);
}

/* ----------------------------------------------------------
 *  loadAll — internal helper
 * ---------------------------------------------------------- */
async function loadAll(): Promise<HighlightEntry[]> {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const raw = data[STORAGE_KEY];
  return Array.isArray(raw) ? (raw as HighlightEntry[]) : [];
}
