/**
 * Phantom Meta — Page Primitive Extractor & Cross-Domain Synthesizer
 * ─────────────────────────────────────────────────────────────────────
 *
 * "Phantom" refers to reading what is structurally present in the page but
 * not immediately visible to the user — the meta layer: JSON-LD schemas,
 * Open Graph protocol tags, canonical signals, heading structure, link
 * topology, and hidden data attributes.
 *
 * The engine reads THROUGH the visible surface of a page to extract
 * primitive signals — the raw semantic atoms that underlie the content.
 * These primitives are then fed into the PatternSynthesisEngine (PSE) for
 * cross-domain synthesis: a single physics/math/systems-theory lens applied
 * to the meta structure of whatever page Vigil is observing.
 *
 * ── What it extracts ────────────────────────────────────────────────────
 *
 *   Meta tags        <meta name="…" content="…">  (description, keywords,
 *                    author, robots, viewport, theme-color, etc.)
 *   Open Graph       <meta property="og:…">        (type, title, image, url)
 *   Twitter Card     <meta name="twitter:…">
 *   JSON-LD          <script type="application/ld+json"> (schema.org)
 *   Canonical        <link rel="canonical">
 *   Heading tree     H1–H6 full hierarchy with text + depth
 *   Link topology    <a href> with anchor text → outbound signal map
 *   Data attributes  data-* on root + body + main elements
 *
 * ── Output: PhantomRead ─────────────────────────────────────────────────
 *
 *   Each PhantomRead contains:
 *     primitives  — flat array of { layer, key, value } triples
 *     headings    — structured heading tree
 *     synthesis   — PSE synthesis result run over all primitive signals
 *     spatial     — SpatialCoordinate of the reading (top of page, scroll=0)
 *     url, title, timestamp
 *
 * Storage: chrome.storage.local under 'vigil_phantom_reads' (max 200).
 *
 * ── Cross-page synthesis ────────────────────────────────────────────────
 *
 * `synthesizeAcrossReads(reads)` aggregates all primitive signals from N
 * pages and runs a single PSE pass across the merged corpus. This produces
 * a "beyond and in between" synthesis — insights that span pages rather
 * than summarizing any one of them.
 */

import { pse } from '../pattern-synthesis-engine';
import { encodeSpatialCoord, type SpatialCoordinate } from './memoryAI';
import type { SynthesisResult } from '../pattern-synthesis-engine';

const STORAGE_KEY = 'vigil_phantom_reads';

/* ──────────────────────────────────────────────────────────────────────
 *  Types
 * ────────────────────────────────────────────────────────────────────── */

export interface MetaPrimitive {
  layer: 'meta' | 'og' | 'twitter' | 'jsonld' | 'canonical' | 'heading' | 'link' | 'data';
  key:   string;
  value: string;
}

export interface HeadingNode {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text:  string;
  /** Child headings (only populated for H1/H2 to avoid deep nesting) */
  children?: HeadingNode[];
}

export interface PhantomRead {
  id:         string;
  url:        string;
  title:      string;
  timestamp:  number;
  primitives: MetaPrimitive[];
  headings:   HeadingNode[];
  /** Dominant keywords extracted from all primitive values */
  keywords:   string[];
  /** PSE synthesis of all primitive signals merged */
  synthesis:  SynthesisResult;
  spatial:    SpatialCoordinate;
}

/* ──────────────────────────────────────────────────────────────────────
 *  Storage helpers
 * ────────────────────────────────────────────────────────────────────── */

async function loadReads(): Promise<PhantomRead[]> {
  return new Promise(r => chrome.storage.local.get([STORAGE_KEY], d => {
    r((d[STORAGE_KEY] as PhantomRead[]) || []);
  }));
}

async function saveReads(reads: PhantomRead[]): Promise<void> {
  return new Promise(r => chrome.storage.local.set({ [STORAGE_KEY]: reads }, r));
}

/* ──────────────────────────────────────────────────────────────────────
 *  Page extraction (runs inside chrome.scripting.executeScript)
 *  This function is stringified and injected — it must be self-contained.
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Injected into the page via executeScript.
 * Returns raw extracted data that is JSON-serializable.
 */
export function extractPagePrimitives(): {
  url: string;
  title: string;
  scrollPct: number;
  metas: { name: string; property: string; content: string }[];
  jsonLd: string[];
  canonical: string;
  headings: { level: number; text: string }[];
  links: { href: string; text: string }[];
  dataAttrs: { key: string; value: string }[];
} {
  const metas: { name: string; property: string; content: string }[] = [];
  document.querySelectorAll('meta[content]').forEach(m => {
    metas.push({
      name:     m.getAttribute('name')     || '',
      property: m.getAttribute('property') || '',
      content:  m.getAttribute('content')  || '',
    });
  });

  const jsonLd: string[] = [];
  document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
    const t = s.textContent?.trim();
    if (t) jsonLd.push(t.substring(0, 2000));
  });

  const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)?.href || '';

  const headings: { level: number; text: string }[] = [];
  document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
    const level = parseInt(h.tagName[1]!, 10);
    const text = h.textContent?.trim().substring(0, 120) || '';
    if (text) headings.push({ level, text });
  });

  const links: { href: string; text: string }[] = [];
  document.querySelectorAll('a[href]').forEach(a => {
    const href = (a as HTMLAnchorElement).href;
    const text = (a.textContent || '').trim().substring(0, 80);
    if (href && text && !href.startsWith('javascript:')) {
      links.push({ href, text });
    }
  });
  // Deduplicate links by href
  const seenHrefs = new Set<string>();
  const uniqueLinks = links.filter(l => {
    if (seenHrefs.has(l.href)) return false;
    seenHrefs.add(l.href);
    return true;
  }).slice(0, 100);

  const dataAttrs: { key: string; value: string }[] = [];
  const rootEls = [document.documentElement, document.body,
    document.querySelector('main'), document.querySelector('article'),
    document.querySelector('[role="main"]')].filter(Boolean) as Element[];
  rootEls.forEach(el => {
    if (el.dataset) {
      Object.entries(el.dataset).forEach(([k, v]) => {
        if (v && v.length < 200) dataAttrs.push({ key: k, value: v });
      });
    }
  });

  const scrollPct = Math.round(
    (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100,
  );

  return {
    url: window.location.href,
    title: document.title,
    scrollPct,
    metas,
    jsonLd,
    canonical,
    headings,
    links: uniqueLinks,
    dataAttrs,
  };
}

/* ──────────────────────────────────────────────────────────────────────
 *  Primitive assembly (background-side, after injection)
 * ────────────────────────────────────────────────────────────────────── */

function assemblePrimitives(raw: ReturnType<typeof extractPagePrimitives>): MetaPrimitive[] {
  const prims: MetaPrimitive[] = [];

  // Meta tags
  for (const m of raw.metas) {
    const key = m.name || m.property;
    if (!key || !m.content.trim()) continue;
    const layer: MetaPrimitive['layer'] = m.property.startsWith('og:')
      ? 'og'
      : m.name.startsWith('twitter:')
        ? 'twitter'
        : 'meta';
    prims.push({ layer, key, value: m.content.trim().substring(0, 300) });
  }

  // JSON-LD
  for (const raw_ld of raw.jsonLd) {
    try {
      const obj = JSON.parse(raw_ld) as Record<string, unknown>;
      // Flatten top-level string fields
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && v.length > 1 && v.length < 500) {
          prims.push({ layer: 'jsonld', key: k, value: v });
        }
      }
    } catch { /* malformed JSON-LD — skip */ }
  }

  // Canonical
  if (raw.canonical) prims.push({ layer: 'canonical', key: 'canonical', value: raw.canonical });

  // Headings
  for (const h of raw.headings.slice(0, 30)) {
    prims.push({ layer: 'heading', key: `h${h.level}`, value: h.text });
  }

  // Top outbound links
  for (const l of raw.links.slice(0, 20)) {
    if (l.text.length > 3) prims.push({ layer: 'link', key: 'a', value: l.text });
  }

  // Data attributes
  for (const d of raw.dataAttrs) {
    prims.push({ layer: 'data', key: d.key, value: d.value });
  }

  return prims;
}

/**
 * Build structured heading tree from flat heading list.
 * Only descends two levels deep (H1 → H2 → stop) for readability.
 */
function buildHeadingTree(headings: { level: number; text: string }[]): HeadingNode[] {
  const roots: HeadingNode[] = [];
  let lastH1: HeadingNode | null = null;
  let lastH2: HeadingNode | null = null;
  for (const h of headings) {
    const node: HeadingNode = { level: h.level as HeadingNode['level'], text: h.text };
    if (h.level === 1) {
      node.children = [];
      roots.push(node);
      lastH1 = node;
      lastH2 = null;
    } else if (h.level === 2) {
      node.children = [];
      (lastH1?.children ?? roots).push(node);
      lastH2 = node;
    } else if (h.level === 3) {
      (lastH2?.children ?? lastH1?.children ?? roots).push(node);
    } else {
      roots.push(node); // H4–H6 at root
    }
  }
  return roots;
}

/**
 * Extract dominant keywords from primitive values.
 * Splits all values into words, filters stop words, returns top-N by frequency.
 */
function extractKeywords(prims: MetaPrimitive[], topN = 20): string[] {
  const STOP = new Set([
    'the','a','an','is','are','was','were','in','on','at','of','to','and','or',
    'but','for','with','this','that','it','as','by','from','be','have','has',
  ]);
  const freq: Map<string, number> = new Map();
  for (const p of prims) {
    const words = p.value.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !STOP.has(w));
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(e => e[0]);
}

/* ──────────────────────────────────────────────────────────────────────
 *  Public API
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Perform a phantom read of the given tab.
 *
 * Injects the extractor, assembles primitives, runs PSE synthesis,
 * encodes spatial coordinates, and persists the PhantomRead.
 *
 * @returns The PhantomRead result, or null if the tab is unavailable.
 */
export async function phantomReadTab(tabId: number): Promise<PhantomRead | null> {
  return new Promise(resolve => {
    chrome.scripting.executeScript(
      { target: { tabId }, func: extractPagePrimitives },
      results => {
        if (chrome.runtime.lastError || !results?.[0]?.result) {
          resolve(null);
          return;
        }
        const raw = results[0].result as ReturnType<typeof extractPagePrimitives>;
        const primitives = assemblePrimitives(raw);
        const headings = buildHeadingTree(raw.headings);
        const keywords = extractKeywords(primitives);

        // Build synthesis input: join all primitive values + keywords
        const synthesisInput = keywords.join(' ') + ' ' +
          primitives.filter(p => p.layer !== 'link').map(p => p.value).join(' ');

        const synthesis = pse.synthesize(synthesisInput.substring(0, 2000), 'focused');

        // Spatial: encode top-of-read position (current scroll + first heading path)
        const sectionPath = raw.headings.slice(0, 3).map(h => h.text);
        const spatial = encodeSpatialCoord(raw.scrollPct, sectionPath, 0);

        const read: PhantomRead = {
          id: 'phr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          url:    raw.url,
          title:  raw.title,
          timestamp: Date.now(),
          primitives,
          headings,
          keywords,
          synthesis,
          spatial,
        };

        loadReads().then(existing => {
          existing.unshift(read);
          saveReads(existing.slice(0, 200)).then(() => resolve(read));
        });
      },
    );
  });
}

/** Retrieve stored phantom reads */
export async function getPhantomReads(limit = 50): Promise<PhantomRead[]> {
  const reads = await loadReads();
  return reads.slice(0, limit);
}

/**
 * Cross-page synthesis: aggregate all primitive signals from multiple reads
 * and run a single PSE pass across the merged corpus.
 *
 * This produces insights that span pages — the "beyond and in between" synthesis.
 * The resulting text describes patterns that no single page contains alone.
 *
 * @param reads  Array of PhantomReads to synthesize across
 * @returns      A SynthesisResult representing the cross-page pattern
 */
export function synthesizeAcrossReads(reads: PhantomRead[]): SynthesisResult {
  if (reads.length === 0) {
    return pse.synthesize('empty', 'focused');
  }

  // Aggregate: collect all keywords from all reads, weighted by recency
  const keywordFreq: Map<string, number> = new Map();
  reads.forEach((r, idx) => {
    // Decay weight: most recent read gets full weight, older reads less
    const weight = 1.0 / (idx + 1);
    for (const kw of r.keywords) {
      keywordFreq.set(kw, (keywordFreq.get(kw) ?? 0) + weight);
    }
  });

  // Also collect all heading texts and JSON-LD values for richer signal
  const signals: string[] = [...keywordFreq.keys()];
  for (const r of reads.slice(0, 10)) {
    for (const p of r.primitives.filter(p => p.layer === 'heading' || p.layer === 'jsonld' || p.layer === 'og')) {
      signals.push(p.value);
    }
  }

  const synthesisInput = signals.join(' ').substring(0, 3000);
  return pse.synthesize(synthesisInput, 'focused');
}

/** Delete all phantom reads */
export async function clearPhantomReads(): Promise<void> {
  await saveReads([]);
}
