/* ============================================================
 *  Readability — DOM Article Extractor (Firefox Reader Mode style)
 *  Pure TypeScript, no external dependencies.
 * ============================================================ */

export interface ArticleResult {
  title: string;
  byline: string;
  content: string;
  textContent: string;
  wordCount: number;
  readingTimeMin: number;
  excerpt: string;
  siteName: string;
  url: string;
}

/* Positive class/id patterns (article content) */
const POSITIVE_RE =
  /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story|reader|center/i;

/* Negative class/id patterns (noise) */
const NEGATIVE_RE =
  /hidden|^hid$|hid-|hid$|combx|comment|craft|disqus|extra|foot|header|legends|menu|metabar|nav|rail|related|scroll|shoutbox|sidebar|skyscraper|sponsor|tags|tool|widget|ad|ads|adspot|banner|cookie|modal|popup|overlay|share|social|print|toc|breadcrumb/i;

/* Tags to strip before scoring */
const STRIP_TAGS = new Set([
  'script', 'style', 'noscript', 'iframe', 'form', 'button',
  'input', 'select', 'textarea', 'nav', 'footer', 'header',
  'aside', 'figure', 'figcaption', 'picture',
]);

/* Tags that are meaningful block containers */
const BLOCK_TAGS = new Set([
  'article', 'section', 'div', 'main', 'td', 'blockquote',
]);

interface Candidate {
  el: Element;
  score: number;
}

/* ----------------------------------------------------------
 *  extractArticle
 *  html   — raw HTML string for the page
 *  url    — page URL (for siteName extraction)
 * ---------------------------------------------------------- */
export function extractArticle(html: string, url: string): ArticleResult {
  const doc = parseDocument(html);

  const title = extractTitle(doc);
  const byline = extractByline(doc);
  const siteName = extractSiteName(doc, url);

  const content = extractContent(doc);
  const textContent = stripTags(content);
  const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const readingTimeMin = Math.max(1, Math.round(wordCount / 200));
  const excerpt = textContent.replace(/\s+/g, ' ').trim().substring(0, 200);

  return {
    title,
    byline,
    content,
    textContent,
    wordCount,
    readingTimeMin,
    excerpt,
    siteName,
    url,
  };
}

/* ----------------------------------------------------------
 *  parseDocument — DOMParser with fallback for non-browser envs
 * ---------------------------------------------------------- */
function parseDocument(html: string): Document {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser().parseFromString(html, 'text/html');
  }
  // Minimal fallback: return a stub document
  return {
    title: '',
    querySelectorAll: () => [],
    querySelector: () => null,
    body: null,
    head: null,
  } as unknown as Document;
}

/* ----------------------------------------------------------
 *  extractTitle
 * ---------------------------------------------------------- */
function extractTitle(doc: Document): string {
  // 1. og:title
  const og = doc.querySelector('meta[property="og:title"]');
  if (og) {
    const c = (og as HTMLMetaElement).content?.trim();
    if (c) return c;
  }
  // 2. twitter:title
  const tw = doc.querySelector('meta[name="twitter:title"]');
  if (tw) {
    const c = (tw as HTMLMetaElement).content?.trim();
    if (c) return c;
  }
  // 3. <title>
  if (doc.title) {
    const t = doc.title.trim();
    if (t) return t;
  }
  // 4. first <h1>
  const h1 = doc.querySelector('h1');
  if (h1) return (h1 as HTMLElement).innerText?.trim() || h1.textContent?.trim() || '';
  return '';
}

/* ----------------------------------------------------------
 *  extractByline
 * ---------------------------------------------------------- */
function extractByline(doc: Document): string {
  const selectors = [
    '[rel="author"]',
    '[class*="byline"]',
    '[class*="author"]',
    '[itemprop="author"]',
    'meta[name="author"]',
    '.byline',
    '.author',
    '#byline',
    '#author',
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (!el) continue;
    const text = sel.startsWith('meta')
      ? (el as HTMLMetaElement).content
      : ((el as HTMLElement).innerText || el.textContent || '');
    const clean = text?.trim().replace(/\s+/g, ' ') || '';
    if (clean && clean.length < 100) return clean;
  }
  return '';
}

/* ----------------------------------------------------------
 *  extractSiteName
 * ---------------------------------------------------------- */
function extractSiteName(doc: Document, url: string): string {
  const og = doc.querySelector('meta[property="og:site_name"]');
  if (og) {
    const c = (og as HTMLMetaElement).content?.trim();
    if (c) return c;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/* ----------------------------------------------------------
 *  Paragraph scoring — main content extraction algorithm
 * ---------------------------------------------------------- */
function scoreNode(el: Element): number {
  const classId = ((el.className || '') + ' ' + (el.id || '')).toLowerCase();
  let score = 0;

  // Positive/negative class heuristics
  if (POSITIVE_RE.test(classId)) score += 25;
  if (NEGATIVE_RE.test(classId)) score -= 25;

  // Tag bonuses
  const tag = el.tagName?.toLowerCase() || '';
  if (tag === 'article') score += 30;
  if (tag === 'section') score += 5;
  if (tag === 'div') score += 2;

  // Text density: score paragraphs inside this node
  const paragraphs = el.querySelectorAll('p');
  let charCount = 0;
  for (const p of Array.from(paragraphs)) {
    const text = p.textContent || '';
    charCount += text.length;
    if (text.length > 80) score += 1;
    if (text.length > 200) score += 2;
    // Comma density (natural prose has commas)
    score += (text.match(/,/g)?.length || 0) * 0.3;
  }

  // Absolute character count bonus
  score += Math.sqrt(charCount) * 0.2;

  return score;
}

function extractContent(doc: Document): string {
  if (!doc.body) return '';

  // Remove noise elements
  for (const tag of STRIP_TAGS) {
    for (const el of Array.from(doc.body.querySelectorAll(tag))) {
      el.parentNode?.removeChild(el);
    }
  }

  // Score all block-level candidate elements
  const candidates: Candidate[] = [];
  for (const tag of BLOCK_TAGS) {
    for (const el of Array.from(doc.body.querySelectorAll(tag))) {
      const score = scoreNode(el);
      candidates.push({ el, score });
    }
  }

  if (candidates.length === 0) {
    // Fallback: return body text
    return doc.body.innerHTML || '';
  }

  // Pick the highest-scored candidate
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  // Clean up the winner's HTML
  return cleanHtml(best.el.innerHTML || '');
}

/* ----------------------------------------------------------
 *  cleanHtml — remove remaining junk from extracted block
 * ---------------------------------------------------------- */
function cleanHtml(html: string): string {
  return html
    // Remove inline styles and event handlers
    .replace(/\sstyle="[^"]*"/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    // Collapse excessive whitespace
    .replace(/\s{3,}/g, ' ')
    .trim();
}

/* ----------------------------------------------------------
 *  stripTags — HTML → plain text
 * ---------------------------------------------------------- */
function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
