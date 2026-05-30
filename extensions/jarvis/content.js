/* ============================================================
 *  JARVIS AI — Content Script
 *  Floating action button, page analysis, overlay notifications
 * ============================================================ */

(function () {
  'use strict';

  var JARVIS_FAB_ID = 'jarvis-fab-button';
  var JARVIS_OVERLAY_ID = 'jarvis-overlay-notification';
  var JARVIS_INJECTED = '__jarvis_content_injected__';

  // De-duplicate check — don't inject twice
  if (window[JARVIS_INJECTED]) return;
  window[JARVIS_INJECTED] = true;
  if (document.getElementById(JARVIS_FAB_ID)) return;

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  /* ----------------------------------------------------------
   *  Floating Action Button (FAB) — Arc Reactor style
   * ---------------------------------------------------------- */

  var fab = document.createElement('div');
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
    overflow: 'hidden'
  });
  fab.textContent = 'J';

  // Pulsing glow animation
  var glowState = 0;
  setInterval(function () {
    glowState = (glowState + 1) % 2;
    if (glowState === 0) {
      fab.style.boxShadow = '0 0 20px rgba(108, 99, 255, 0.6), 0 0 40px rgba(0, 212, 170, 0.3), inset 0 0 12px rgba(108, 99, 255, 0.4)';
    } else {
      fab.style.boxShadow = '0 0 28px rgba(108, 99, 255, 0.8), 0 0 56px rgba(0, 212, 170, 0.5), inset 0 0 16px rgba(108, 99, 255, 0.6)';
    }
  }, HEARTBEAT);

  // Hover effects
  fab.addEventListener('mouseenter', function () {
    fab.style.transform = 'scale(1.12)';
  });
  fab.addEventListener('mouseleave', function () {
    fab.style.transform = 'scale(1)';
  });

  // Click — open side panel
  fab.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'openSidePanel' }, function (resp) {
      if (chrome.runtime.lastError) {
        console.log('[JARVIS] Side panel open request sent');
      }
    });
  });

  // Keyboard accessibility
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
    var selectedText = '';
    try {
      selectedText = window.getSelection().toString().substring(0, 500);
    } catch (e) { /* ignore */ }

    var metaDesc = '';
    var metaEl = document.querySelector('meta[name="description"]');
    if (metaEl) metaDesc = metaEl.getAttribute('content') || '';

    var headings = [];
    var hTags = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (var i = 0; i < Math.min(hTags.length, 30); i++) {
      headings.push({
        tag: hTags[i].tagName.toLowerCase(),
        text: hTags[i].innerText.substring(0, 120)
      });
    }

    var bodyText = '';
    try { bodyText = document.body.innerText || ''; } catch (e) { /* ignore */ }

    return {
      title: document.title || '',
      url: window.location.href,
      selectedText: selectedText,
      metaDescription: metaDesc,
      headings: headings,
      linkCount: document.querySelectorAll('a[href]').length,
      imageCount: document.querySelectorAll('img').length,
      wordCount: bodyText.split(/\s+/).filter(function (w) { return w.length > 0; }).length,
      formCount: document.querySelectorAll('form').length,
      scriptCount: document.querySelectorAll('script').length,
      timestamp: Date.now()
    };
  }

  /* ----------------------------------------------------------
   *  Overlay Notification System
   * ---------------------------------------------------------- */

  function showOverlayNotification(message, type) {
    var existing = document.getElementById(JARVIS_OVERLAY_ID);
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = JARVIS_OVERLAY_ID;

    var bgColor = '#1a1640';
    var borderColor = '#6c63ff';
    var icon = '🤖';
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
      gap: '10px'
    });

    var iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.style.fontSize = '18px';
    iconSpan.style.flexShrink = '0';

    var textDiv = document.createElement('div');
    textDiv.style.flex = '1';

    var header = document.createElement('div');
    header.style.fontWeight = '700';
    header.style.fontSize = '12px';
    header.style.color = borderColor;
    header.style.marginBottom = '4px';
    header.style.textTransform = 'uppercase';
    header.style.letterSpacing = '0.5px';
    header.textContent = 'JARVIS';

    var body = document.createElement('div');
    body.textContent = message;
    body.style.wordBreak = 'break-word';

    var closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      background: 'none',
      border: 'none',
      color: '#666',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '0',
      lineHeight: '1',
      flexShrink: '0'
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

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translateX(0)';
      });
    });

    // Auto-dismiss after golden ratio seconds
    setTimeout(function () {
      if (document.getElementById(JARVIS_OVERLAY_ID)) {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateX(100px)';
        setTimeout(function () { overlay.remove(); }, 300);
      }
    }, Math.round(4000 * PHI));
  }

  /* ----------------------------------------------------------
   *  Screenshot Overlay Indicator
   * ---------------------------------------------------------- */

  function showScreenshotFlash() {
    var flash = document.createElement('div');
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
      transition: 'opacity 0.4s ease'
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

  function highlightTextOnPage(query) {
    if (!query) return 0;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var count = 0;
    var node;
    var nodesToProcess = [];

    while ((node = walker.nextNode())) {
      if (node.nodeValue.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
        nodesToProcess.push(node);
      }
    }

    for (var n = 0; n < nodesToProcess.length; n++) {
      node = nodesToProcess[n];
      var parent = node.parentNode;
      if (!parent) continue;
      var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var parts = node.nodeValue.split(new RegExp('(' + escaped + ')', 'gi'));
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].toLowerCase() === query.toLowerCase()) {
          var mark = document.createElement('mark');
          mark.style.backgroundColor = '#6c63ff';
          mark.style.color = '#ffffff';
          mark.style.padding = '1px 3px';
          mark.style.borderRadius = '2px';
          mark.textContent = parts[i];
          parent.insertBefore(mark, node);
          count++;
        } else {
          parent.insertBefore(document.createTextNode(parts[i]), node);
        }
      }
      parent.removeChild(node);
    }
    return count;
  }

  /* ----------------------------------------------------------
   *  PDF Render Overlay (triggered from background)
   * ---------------------------------------------------------- */

  function renderPdfOverlay(pdfData) {
    var overlayId = 'jarvis-pdf-overlay';
    var existing = document.getElementById(overlayId);
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = overlayId;
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: '2147483647',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });

    var card = document.createElement('div');
    Object.assign(card.style, {
      width: '520px',
      maxHeight: '80vh',
      backgroundColor: '#0d1117',
      border: '1px solid #6c63ff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 16px 64px rgba(108, 99, 255, 0.5)',
      display: 'flex',
      flexDirection: 'column'
    });

    // Card header
    var cardHeader = document.createElement('div');
    Object.assign(cardHeader.style, {
      padding: '16px 20px',
      background: 'linear-gradient(135deg, #6c63ff, #3d37a5)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    });

    var cardTitle = document.createElement('span');
    cardTitle.textContent = '📄 ' + (pdfData.title || 'JARVIS Document');
    cardTitle.style.color = '#ffffff';
    cardTitle.style.fontWeight = '700';
    cardTitle.style.fontSize = '15px';

    var cardClose = document.createElement('button');
    Object.assign(cardClose.style, {
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      color: '#ffffff',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '4px 10px',
      borderRadius: '4px'
    });
    cardClose.textContent = 'Close';
    cardClose.addEventListener('click', function () { overlay.remove(); });

    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(cardClose);

    // Card body
    var cardBody = document.createElement('div');
    Object.assign(cardBody.style, {
      padding: '20px',
      color: '#e0e0e0',
      fontSize: '14px',
      lineHeight: '1.7',
      overflowY: 'auto',
      flex: '1'
    });

    var meta = document.createElement('div');
    meta.style.marginBottom = '16px';
    meta.style.fontSize = '12px';
    meta.style.color = '#888';
    meta.innerHTML = 'Author: <strong style="color:#00d4aa">' + (pdfData.author || 'Alfredo') +
      '</strong> &nbsp;|&nbsp; Generated: ' + new Date(pdfData.timestamp).toLocaleString();

    var content = document.createElement('div');
    content.style.whiteSpace = 'pre-wrap';
    content.style.wordBreak = 'break-word';
    content.textContent = pdfData.content || 'Empty document';

    cardBody.appendChild(meta);
    cardBody.appendChild(content);

    // Card footer
    var cardFooter = document.createElement('div');
    Object.assign(cardFooter.style, {
      padding: '12px 20px',
      borderTop: '1px solid #21262d',
      fontSize: '11px',
      color: '#666',
      textAlign: 'center'
    });
    cardFooter.textContent = 'JARVIS AI Document — PDF stub rendering (use browser print for full PDF export)';

    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    overlay.appendChild(card);

    // Click backdrop to close
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  /* ----------------------------------------------------------
   *  Note Capture — select text context
   * ---------------------------------------------------------- */

  function getSelectedText() {
    var text = '';
    try { text = window.getSelection().toString(); } catch (e) { /* ignore */ }
    return text.substring(0, 2000);
  }

  function saveSelectedTextAsNote() {
    var text = getSelectedText();
    if (!text) {
      showOverlayNotification('No text selected to save as note.', 'error');
      return;
    }
    chrome.runtime.sendMessage({
      action: 'takeNote',
      content: text
    }, function (resp) {
      if (chrome.runtime.lastError) return;
      if (resp && resp.success) {
        showOverlayNotification('Note saved: "' + text.substring(0, 60) + '…"', 'note');
      } else {
        showOverlayNotification('Failed to save note.', 'error');
      }
    });
  }

  /* ----------------------------------------------------------
   *  Message Listener — receives commands from background
   * ---------------------------------------------------------- */

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
      case 'renderPdf':
        renderPdfOverlay(message.data);
        sendResponse({ success: true });
        break;

      case 'analyzePage':
        var analysis = analyzeCurrentPage();
        sendResponse({ success: true, data: analysis });
        break;

      case 'highlightText':
        var count = highlightTextOnPage(message.query);
        sendResponse({ success: true, count: count });
        break;

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
    return true;
  });

  /* ----------------------------------------------------------
   *  PostMessage Bridge — page to extension communication
   * ---------------------------------------------------------- */

  window.addEventListener('message', function (event) {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== 'JARVIS_BRIDGE') return;

    var bridgeData = event.data;
    chrome.runtime.sendMessage({
      action: bridgeData.action || 'executeCommand',
      command: bridgeData.command || '',
      data: bridgeData.data || {}
    }, function (resp) {
      window.postMessage({
        type: 'JARVIS_BRIDGE_RESPONSE',
        id: bridgeData.id,
        response: resp
      }, '*');
    });
  });

  /* ----------------------------------------------------------
   *  Keyboard Shortcut — double-press J to save selection
   * ---------------------------------------------------------- */

  var lastKeyTime = 0;
  var lastKey = '';

  document.addEventListener('keydown', function (e) {
    // Double-press J within 400ms to save selection as note
    if (e.key === 'j' || e.key === 'J') {
      var now = Date.now();
      if (lastKey === 'j' && (now - lastKeyTime) < 400) {
        // Don't trigger in input fields
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable) {
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
   *  Inject FAB into page
   * ---------------------------------------------------------- */

  function injectFab() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(fab);
      });
    } else {
      document.body.appendChild(fab);
    }
  }

  injectFab();

  console.log('[JARVIS] Content script injected — FAB active, PHI=' + PHI);

})();
