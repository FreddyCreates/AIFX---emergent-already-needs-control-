/// <reference types="chrome"/>

(function () {
  'use strict';

  const JARVIS_FAB_ID = 'jarvis-fab';
  const JARVIS_OVERLAY_ID = 'jarvis-overlay-notification';
  const JARVIS_INJECTED = '__jarvis_content_injected__';

  // De-duplicate check
  if ((window as any)[JARVIS_INJECTED]) return;
  (window as any)[JARVIS_INJECTED] = true;
  if (document.getElementById(JARVIS_FAB_ID)) return;

  const PHI = 1.618033988749895;
  const HEARTBEAT = 873;

  /* ----------------------------------------------------------
   *  Floating Action Button (FAB) — Arc Reactor style
   * ---------------------------------------------------------- */

  const fab = document.createElement('div');
  fab.id = JARVIS_FAB_ID;
  fab.setAttribute('role', 'button');
  fab.setAttribute('aria-label', 'Open JARVIS Side Panel');
  fab.setAttribute('tabindex', '0');
  Object.assign(fab.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 40%, #6c63ff 0%, #3d37a5 60%, #1a1640 100%)',
    border: '2px solid #00d4aa',
    boxShadow: '0 0 20px rgba(108, 99, 255, 0.6), 0 0 40px rgba(0, 212, 170, 0.3), inset 0 0 12px rgba(108, 99, 255, 0.4)',
    cursor: 'pointer',
    zIndex: '2147483647',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    textShadow: '0 0 8px rgba(0, 212, 170, 0.8)',
    userSelect: 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden',
  });
  fab.textContent = 'J';

  // Pulsing glow animation
  let glowState = 0;
  setInterval(function () {
    glowState = (glowState + 1) % 2;
    if (glowState === 0) {
      fab.style.boxShadow = '0 0 20px rgba(108, 99, 255, 0.6), 0 0 40px rgba(0, 212, 170, 0.3), inset 0 0 12px rgba(108, 99, 255, 0.4)';
    } else {
      fab.style.boxShadow = '0 0 28px rgba(108, 99, 255, 0.8), 0 0 56px rgba(0, 212, 170, 0.5), inset 0 0 16px rgba(108, 99, 255, 0.6)';
    }
  }, HEARTBEAT);

  fab.addEventListener('mouseenter', function () { fab.style.transform = 'scale(1.12)'; });
  fab.addEventListener('mouseleave', function () { fab.style.transform = 'scale(1)'; });

  fab.addEventListener('click', function () {
    try {
      chrome.runtime.sendMessage({ action: 'openSidePanel' }, function () {
        if (chrome.runtime.lastError) {
          console.log('[JARVIS] Side panel open request sent');
        }
      });
    } catch { /* extension context may have been invalidated */ }
  });

  fab.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fab.click();
    }
  });

  /* ----------------------------------------------------------
   *  Page Analysis Function
   * ---------------------------------------------------------- */

  function analyzeCurrentPage() {
    let selectedText = '';
    try { selectedText = (window.getSelection()?.toString() || '').substring(0, 500); } catch (e) { /* ignore */ }

    let metaDesc = '';
    const metaEl = document.querySelector('meta[name="description"]');
    if (metaEl) metaDesc = metaEl.getAttribute('content') || '';

    const headings: Array<{ tag: string; text: string }> = [];
    const hTags = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (let i = 0; i < Math.min(hTags.length, 30); i++) {
      headings.push({ tag: hTags[i].tagName.toLowerCase(), text: (hTags[i] as HTMLElement).innerText.substring(0, 120) });
    }

    let bodyText = '';
    try { bodyText = document.body.innerText || ''; } catch (e) { /* ignore */ }

    return {
      title: document.title || '',
      url: window.location.href,
      selectedText,
      metaDescription: metaDesc,
      headings,
      linkCount: document.querySelectorAll('a[href]').length,
      imageCount: document.querySelectorAll('img').length,
      wordCount: bodyText.split(/\s+/).filter((w) => w.length > 0).length,
      formCount: document.querySelectorAll('form').length,
      scriptCount: document.querySelectorAll('script').length,
      timestamp: Date.now(),
    };
  }

  /* ----------------------------------------------------------
   *  Overlay Notification System
   * ---------------------------------------------------------- */

  function showOverlayNotification(message: string, duration?: number | string): void {
    const existing = document.getElementById(JARVIS_OVERLAY_ID);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = JARVIS_OVERLAY_ID;

    let bgColor = '#1a1640';
    let borderColor = '#6c63ff';
    let icon = '🤖';
    const type = typeof duration === 'string' ? duration : 'info';
    if (type === 'success') { borderColor = '#00d4aa'; icon = '✅'; }
    if (type === 'error') { borderColor = '#ff4757'; icon = '❌'; }
    if (type === 'info') { borderColor = '#6c63ff'; icon = 'ℹ️'; }
    if (type === 'screenshot') { borderColor = '#00d4aa'; icon = '📸'; }
    if (type === 'note') { borderColor = '#ffd93d'; icon = '📝'; }

    Object.assign(overlay.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      maxWidth: '380px',
      minWidth: '280px',
      padding: '14px 18px',
      backgroundColor: bgColor,
      color: '#e0e0e0',
      border: '1px solid ' + borderColor,
      borderRadius: '10px',
      boxShadow: '0 8px 32px rgba(108, 99, 255, 0.4)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      lineHeight: '1.5',
      zIndex: '2147483647',
      opacity: '0',
      transform: 'translateX(100px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
    });

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.style.fontSize = '18px';
    iconSpan.style.flexShrink = '0';

    const textDiv = document.createElement('div');
    textDiv.style.flex = '1';

    const header = document.createElement('div');
    header.style.fontWeight = '700';
    header.style.fontSize = '12px';
    header.style.color = borderColor;
    header.style.marginBottom = '4px';
    header.style.textTransform = 'uppercase';
    header.style.letterSpacing = '0.5px';
    header.textContent = 'JARVIS';

    const body = document.createElement('div');
    body.textContent = message;
    body.style.wordBreak = 'break-word';

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      background: 'none', border: 'none', color: '#666',
      fontSize: '16px', cursor: 'pointer', padding: '0',
      lineHeight: '1', flexShrink: '0',
    });
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', function () {
      overlay.style.opacity = '0';
      overlay.style.transform = 'translateX(100px)';
      setTimeout(function () { overlay.remove(); }, 300);
    });

    textDiv.appendChild(header);
    textDiv.appendChild(body);
    overlay.appendChild(iconSpan);
    overlay.appendChild(textDiv);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translateX(0)';
      });
    });

    const dismissMs = typeof duration === 'number' ? duration : Math.round(4000 * PHI);
    setTimeout(function () {
      if (document.getElementById(JARVIS_OVERLAY_ID)) {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateX(100px)';
        setTimeout(function () { overlay.remove(); }, 300);
      }
    }, dismissMs);
  }

  /* ----------------------------------------------------------
   *  Screenshot Flash Overlay
   * ---------------------------------------------------------- */

  function showScreenshotFlash(): void {
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      zIndex: '2147483647',
      pointerEvents: 'none',
      opacity: '1',
      transition: 'opacity 0.4s ease',
    });
    document.body.appendChild(flash);
    requestAnimationFrame(function () {
      flash.style.opacity = '0';
      setTimeout(function () { flash.remove(); }, 400);
    });
  }

  /* ----------------------------------------------------------
   *  Highlight Text Function
   * ---------------------------------------------------------- */

  function highlightTextOnPage(query: string): number {
    if (!query) return 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let count = 0;
    let node: Text | null;
    const nodesToProcess: Text[] = [];

    while ((node = walker.nextNode() as Text | null)) {
      if (node.nodeValue && node.nodeValue.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
        nodesToProcess.push(node);
      }
    }

    for (let n = 0; n < nodesToProcess.length; n++) {
      const textNode = nodesToProcess[n];
      const parent = textNode.parentNode;
      if (!parent) continue;
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = (textNode.nodeValue || '').split(new RegExp('(' + escaped + ')', 'gi'));
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].toLowerCase() === query.toLowerCase()) {
          const mark = document.createElement('mark');
          mark.style.backgroundColor = '#6c63ff';
          mark.style.color = '#ffffff';
          mark.style.padding = '1px 3px';
          mark.style.borderRadius = '2px';
          mark.textContent = parts[i];
          parent.insertBefore(mark, textNode);
          count++;
        } else {
          parent.insertBefore(document.createTextNode(parts[i]), textNode);
        }
      }
      parent.removeChild(textNode);
    }
    return count;
  }

  /* ----------------------------------------------------------
   *  PDF Render Overlay
   * ---------------------------------------------------------- */

  function renderPdfOverlay(pdfData: { title?: string; author?: string; content?: string; timestamp?: number }): void {
    const overlayId = 'jarvis-pdf-overlay';
    const existing = document.getElementById(overlayId);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = overlayId;
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: '2147483647',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width: '520px', maxHeight: '80vh', backgroundColor: '#0d1117',
      border: '1px solid #6c63ff', borderRadius: '12px', overflow: 'hidden',
      boxShadow: '0 16px 64px rgba(108, 99, 255, 0.5)', display: 'flex', flexDirection: 'column',
    });

    const cardHeader = document.createElement('div');
    Object.assign(cardHeader.style, {
      padding: '16px 20px', background: 'linear-gradient(135deg, #6c63ff, #3d37a5)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    });

    const cardTitle = document.createElement('span');
    cardTitle.textContent = '📄 ' + (pdfData.title || 'JARVIS Document');
    cardTitle.style.color = '#ffffff';
    cardTitle.style.fontWeight = '700';
    cardTitle.style.fontSize = '15px';

    const cardClose = document.createElement('button');
    Object.assign(cardClose.style, {
      background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff',
      fontSize: '14px', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px',
    });
    cardClose.textContent = 'Close';
    cardClose.addEventListener('click', function () { overlay.remove(); });
    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(cardClose);

    const cardBody = document.createElement('div');
    Object.assign(cardBody.style, {
      padding: '20px', color: '#e0e0e0', fontSize: '14px', lineHeight: '1.7',
      overflowY: 'auto', flex: '1',
    });

    const meta = document.createElement('div');
    meta.style.marginBottom = '16px';
    meta.style.fontSize = '12px';
    meta.style.color = '#888';
    meta.innerHTML = 'Author: <strong style="color:#00d4aa">' + (pdfData.author || 'Alfredo') +
      '</strong> &nbsp;|&nbsp; Generated: ' + new Date(pdfData.timestamp || Date.now()).toLocaleString();

    const content = document.createElement('div');
    content.style.whiteSpace = 'pre-wrap';
    content.style.wordBreak = 'break-word';
    content.textContent = pdfData.content || 'Empty document';
    cardBody.appendChild(meta);
    cardBody.appendChild(content);

    const cardFooter = document.createElement('div');
    Object.assign(cardFooter.style, {
      padding: '12px 20px', borderTop: '1px solid #21262d',
      fontSize: '11px', color: '#666', textAlign: 'center',
    });
    cardFooter.textContent = 'JARVIS AI Document — PDF rendering (use browser print for full PDF export)';

    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    overlay.appendChild(card);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  /* ----------------------------------------------------------
   *  Note Capture — selected text
   * ---------------------------------------------------------- */

  function getSelectedText(): string {
    let text = '';
    try { text = window.getSelection()?.toString() || ''; } catch (e) { /* ignore */ }
    return text.substring(0, 2000);
  }

  function saveSelectedTextAsNote(): void {
    const text = getSelectedText();
    if (!text) {
      showOverlayNotification('No text selected to save as note.', 'error');
      return;
    }
    try {
      chrome.runtime.sendMessage({ action: 'takeNote', content: text }, function (resp) {
        if (chrome.runtime.lastError) return;
        if (resp && resp.success) {
          showOverlayNotification('Note saved: "' + text.substring(0, 60) + '…"', 'note');
        } else {
          showOverlayNotification('Failed to save note.', 'error');
        }
      });
    } catch { /* extension context may have been invalidated */ }
  }

  /* ----------------------------------------------------------
   *  Clipboard Intelligence — copy event → Jarvis analysis
   *  Every time the user copies text on a page, Jarvis captures it
   *  and pushes analysis to Inbox + stages raw content in Mirror.
   * ---------------------------------------------------------- */

  let _lastClipText = '';
  let _clipThrottle = 0;

  document.addEventListener('copy', function () {
    // Throttle: don't fire if same text was just sent within 2s
    const now = Date.now();
    if (now - _clipThrottle < 2000) return;

    // Get selected text (available right after copy event fires)
    const selected = (window.getSelection()?.toString() || '').trim();
    if (!selected || selected.length < 5) return;
    if (selected === _lastClipText) return;

    _lastClipText  = selected;
    _clipThrottle  = now;

    try {
      chrome.runtime.sendMessage({
        action: 'clipboardCopy',
        text:   selected.substring(0, 2000),
        url:    window.location.href,
        title:  document.title || window.location.hostname,
      });
    } catch { /* extension context may have been invalidated */ }
  });

  /* ----------------------------------------------------------
   *  Message Listener
   * ---------------------------------------------------------- */

  chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
    // Guard against invalidated extension context (happens after extension reload)
    try { if (!chrome.runtime?.id) return; } catch { return; }

    try {
    switch (message.action) {
      case 'renderPdf':
        renderPdfOverlay(message.data);
        sendResponse({ success: true });
        break;

      case 'analyzePage':
        sendResponse({ success: true, data: analyzeCurrentPage() });
        break;

      case 'highlightText': {
        const count = highlightTextOnPage(message.query);
        sendResponse({ success: true, count });
        break;
      }

      case 'screenshotFlash':
        showScreenshotFlash();
        sendResponse({ success: true });
        break;

      case 'showNotification':
        showOverlayNotification(message.message, message.type || 'info');
        sendResponse({ success: true });
        break;

      case 'getPageInfo':
        sendResponse({ success: true, data: analyzeCurrentPage() });
        break;

      case 'getSelectedText':
        sendResponse({ success: true, text: getSelectedText() });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown content action: ' + message.action });
    }
    } catch (err) {
      // Extension context may have been invalidated; swallow to avoid console noise
      try { sendResponse({ success: false, error: String(err) }); } catch { /* ignore */ }
    }
    // All paths are synchronous — do NOT return true (would cause "message channel closed" warning)
  });

  /* ----------------------------------------------------------
   *  PostMessage Bridge
   * ---------------------------------------------------------- */

  window.addEventListener('message', function (event) {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== 'JARVIS_BRIDGE') return;

    const bridgeData = event.data;
    try {
      chrome.runtime.sendMessage({
        action: bridgeData.action || 'executeCommand',
        command: bridgeData.command || '',
        data: bridgeData.data || {},
      }, function (resp) {
        window.postMessage({ type: 'JARVIS_BRIDGE_RESPONSE', id: bridgeData.id, response: resp }, '*');
      });
    } catch { /* extension context may have been invalidated */ }
  });

  /* ----------------------------------------------------------
   *  Keyboard Shortcut — double-J to save selection as note
   * ---------------------------------------------------------- */

  let lastKeyTime = 0;
  let lastKey = '';

  document.addEventListener('keydown', function (e) {
    if (e.key === 'j' || e.key === 'J') {
      const now = Date.now();
      if (lastKey === 'j' && (now - lastKeyTime) < 400) {
        const tag = ((e.target as HTMLElement).tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !(e.target as HTMLElement).isContentEditable) {
          e.preventDefault();
          saveSelectedTextAsNote();
        }
      }
      lastKey = 'j';
      lastKeyTime = now;
    } else {
      lastKey = '';
    }
  });

  /* ----------------------------------------------------------
   *  Inject FAB
   * ---------------------------------------------------------- */

  function injectFab(): void {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(fab);
      });
    } else {
      document.body.appendChild(fab);
    }
  }

  injectFab();

  /* ----------------------------------------------------------
   *  Auto Phantom Meta Push — fires after page loads
   *  Extracts page meta layer (meta tags, OG, headings, JSON-LD)
   *  and sends to background for storage. Completely non-blocking —
   *  fires 1.5s after DOMContentLoaded to not slow page rendering.
   * ---------------------------------------------------------- */
  function _autoPhantomPush(): void {
    try {
      const url = window.location.href;
      if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') ||
          url.startsWith('about:') || url.startsWith('data:')) return;

      // Collect meta primitives inline (lightweight version — no PSE, no import)
      const metas: { key: string; value: string }[] = [];
      document.querySelectorAll('meta[content]').forEach(m => {
        const key = m.getAttribute('name') || m.getAttribute('property') || '';
        const value = (m.getAttribute('content') || '').trim();
        if (key && value && value.length < 400) metas.push({ key, value });
      });

      const headings: string[] = [];
      document.querySelectorAll('h1,h2,h3').forEach(h => {
        const t = (h.textContent || '').trim().substring(0, 100);
        if (t) headings.push(t);
      });

      const jsonLdSnippets: string[] = [];
      document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
        const t = (s.textContent || '').trim().substring(0, 500);
        if (t) jsonLdSnippets.push(t);
      });

      const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)?.href || '';
      const scrollPct = Math.round(
        (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100,
      );

      chrome.runtime.sendMessage({
        action: 'autoPhantomMeta',
        url,
        title: document.title,
        metas,
        headings,
        jsonLdSnippets,
        canonical,
        scrollPct,
      }).catch(() => {});
    } catch { /* ignore */ }
  }

  if (document.readyState === 'complete') {
    setTimeout(_autoPhantomPush, 1500);
  } else {
    window.addEventListener('load', () => setTimeout(_autoPhantomPush, 1500), { once: true });
  }

  console.log('[VIGIL v18] Content script injected — FAB active, auto-phantom-meta armed, PHI=' + PHI);
})();
