/**
 * EXT-007 Sentinel Watch — Content Script
 * Security Intelligence Monitor — Guards + GPT + Claude
 */

(function() {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  var threats = [];
  var currentStatus = 'safe'; // 'safe' | 'caution' | 'danger'
  var statusIndicator = null;
  var badgeEl = null;
  var summaryPanel = null;

  // --- Status Indicator ---

  function createStatusIndicator() {
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'sentinel-watch-indicator';
    statusIndicator.style.cssText = [
      'position: fixed',
      'top: 12px',
      'right: 12px',
      'width: 28px',
      'height: 28px',
      'border-radius: 50%',
      'z-index: 2147483647',
      'cursor: pointer',
      'box-shadow: 0 2px 8px rgba(0,0,0,0.3)',
      'transition: background-color 0.3s ease',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'font-size: 11px',
      'font-family: Arial, sans-serif',
      'user-select: none'
    ].join(';');

    badgeEl = document.createElement('span');
    badgeEl.id = 'sentinel-watch-badge';
    badgeEl.style.cssText = [
      'position: absolute',
      'top: -4px',
      'right: -4px',
      'background: #ff0000',
      'color: #fff',
      'font-size: 9px',
      'font-weight: bold',
      'border-radius: 50%',
      'min-width: 14px',
      'height: 14px',
      'display: none',
      'align-items: center',
      'justify-content: center',
      'line-height: 14px',
      'text-align: center',
      'padding: 0 2px'
    ].join(';');

    statusIndicator.appendChild(badgeEl);
    updateIndicatorColor();

    statusIndicator.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleSummaryPanel();
    });

    document.documentElement.appendChild(statusIndicator);
  }

  function updateIndicatorColor() {
    if (!statusIndicator) return;
    var colors = { safe: '#22c55e', caution: '#eab308', danger: '#ef4444' };
    statusIndicator.style.backgroundColor = colors[currentStatus] || colors.safe;
  }

  function updateBadge() {
    if (!badgeEl) return;
    var count = threats.length;
    if (count > 0) {
      badgeEl.textContent = count > 99 ? '99+' : String(count);
      badgeEl.style.display = 'flex';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  function setStatus(status) {
    currentStatus = status;
    updateIndicatorColor();
    updateBadge();
  }

  // --- Threat Summary Panel ---

  function createSummaryPanel() {
    summaryPanel = document.createElement('div');
    summaryPanel.id = 'sentinel-watch-panel';
    summaryPanel.style.cssText = [
      'position: fixed',
      'top: 48px',
      'right: 12px',
      'width: 320px',
      'max-height: 400px',
      'overflow-y: auto',
      'background: #1a1a2e',
      'color: #e0e0e0',
      'border-radius: 8px',
      'box-shadow: 0 4px 20px rgba(0,0,0,0.5)',
      'z-index: 2147483647',
      'font-family: Arial, sans-serif',
      'font-size: 13px',
      'padding: 16px',
      'display: none'
    ].join(';');

    document.documentElement.appendChild(summaryPanel);
  }

  function toggleSummaryPanel() {
    if (!summaryPanel) createSummaryPanel();

    if (summaryPanel.style.display === 'none') {
      renderSummary();
      summaryPanel.style.display = 'block';
    } else {
      summaryPanel.style.display = 'none';
    }
  }

  function renderSummary() {
    if (!summaryPanel) return;

    var html = '<div style="font-size:15px;font-weight:bold;margin-bottom:10px;">'
      + '\uD83D\uDEE1\uFE0F Sentinel Watch</div>';

    var statusColors = { safe: '#22c55e', caution: '#eab308', danger: '#ef4444' };
    var statusLabels = { safe: 'Safe', caution: 'Caution', danger: 'Danger' };
    html += '<div style="margin-bottom:10px;">Status: <span style="color:'
      + (statusColors[currentStatus] || '#22c55e') + ';font-weight:bold;">'
      + (statusLabels[currentStatus] || 'Safe') + '</span></div>';

    if (threats.length === 0) {
      html += '<div style="color:#888;">No threats detected on this page.</div>';
    } else {
      html += '<div style="margin-bottom:6px;font-weight:bold;">'
        + threats.length + ' threat(s) found:</div>';

      var severityColors = { critical: '#ff0000', high: '#ff6600', medium: '#ffcc00', low: '#00aaff' };
      for (var i = 0; i < threats.length && i < 20; i++) {
        var t = threats[i];
        var sColor = severityColors[t.severity] || '#ccc';
        html += '<div style="margin:4px 0;padding:6px 8px;background:#16213e;border-radius:4px;'
          + 'border-left:3px solid ' + sColor + ';">'
          + '<span style="color:' + sColor + ';font-weight:bold;text-transform:uppercase;font-size:10px;">'
          + (t.severity || 'unknown') + '</span> '
          + '<span>' + escapeHtml(t.type || '') + '</span><br>'
          + '<span style="color:#aaa;font-size:11px;">' + escapeHtml(t.description || '') + '</span>'
          + '</div>';
      }
      if (threats.length > 20) {
        html += '<div style="color:#888;margin-top:6px;">...and ' + (threats.length - 20) + ' more</div>';
      }
    }

    summaryPanel.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Link Scanner ---

  function scanLinks() {
    var links = document.querySelectorAll('a[href]');
    links.forEach(function(link) {
      if (link.dataset.sentinelScanned) return;
      link.dataset.sentinelScanned = 'true';

      var href = (link.getAttribute('href') || '').trim();
      var text = (link.textContent || '').trim();
      var suspicious = false;
      var reason = '';

      // javascript: URI
      if (/^\s*javascript\s*:/i.test(href)) {
        suspicious = true;
        reason = 'javascript: URI detected';
      }

      // data: URI
      if (/^\s*data\s*:/i.test(href)) {
        suspicious = true;
        reason = 'data: URI detected';
      }

      // Mismatched href vs displayed text (text looks like a URL but points elsewhere)
      if (!suspicious && text.match(/^https?:\/\//i)) {
        try {
          var hrefHost = new URL(href, window.location.href).hostname;
          var textHost = new URL(text).hostname;
          if (hrefHost !== textHost) {
            suspicious = true;
            reason = 'Link text domain (' + textHost + ') does not match actual destination (' + hrefHost + ')';
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      if (suspicious) {
        markSuspiciousLink(link, reason);
        threats.push({
          type: 'suspicious_link',
          severity: 'medium',
          description: reason,
          location: href
        });
      }
    });

    updateStatus();
  }

  function markSuspiciousLink(link, reason) {
    // Red underline
    link.style.textDecoration = 'underline wavy red';
    link.style.textDecorationColor = '#ef4444';

    // Warning icon
    var icon = document.createElement('span');
    icon.textContent = ' \u26A0\uFE0F';
    icon.title = 'Sentinel Watch: ' + reason;
    icon.style.cssText = 'font-size:12px;cursor:help;';
    link.appendChild(icon);

    // Navigation warning
    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showWarningOverlay(link.href, reason);
    });
  }

  // --- Warning Overlay ---

  function showWarningOverlay(url, reason) {
    var existing = document.getElementById('sentinel-watch-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'sentinel-watch-overlay';
    overlay.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100vw',
      'height: 100vh',
      'background: rgba(0,0,0,0.75)',
      'z-index: 2147483647',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'font-family: Arial, sans-serif'
    ].join(';');

    var dialog = document.createElement('div');
    dialog.style.cssText = [
      'background: #1a1a2e',
      'color: #e0e0e0',
      'border-radius: 12px',
      'padding: 32px',
      'max-width: 460px',
      'width: 90%',
      'text-align: center',
      'box-shadow: 0 8px 32px rgba(0,0,0,0.6)'
    ].join(';');

    var title = document.createElement('div');
    title.style.cssText = 'font-size:20px;font-weight:bold;margin-bottom:12px;color:#ef4444;';
    title.textContent = '\u26A0\uFE0F Sentinel Watch: This link may be dangerous';

    var detail = document.createElement('div');
    detail.style.cssText = 'font-size:13px;color:#aaa;margin-bottom:8px;word-break:break-all;';
    detail.textContent = url;

    var reasonEl = document.createElement('div');
    reasonEl.style.cssText = 'font-size:12px;color:#ff9900;margin-bottom:20px;';
    reasonEl.textContent = reason;

    var buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display:flex;gap:12px;justify-content:center;';

    var blockBtn = document.createElement('button');
    blockBtn.textContent = 'Block';
    blockBtn.style.cssText = [
      'padding: 10px 28px',
      'border: none',
      'border-radius: 6px',
      'background: #22c55e',
      'color: #fff',
      'font-size: 14px',
      'font-weight: bold',
      'cursor: pointer'
    ].join(';');
    blockBtn.addEventListener('click', function() {
      overlay.remove();
    });

    var proceedBtn = document.createElement('button');
    proceedBtn.textContent = 'Proceed';
    proceedBtn.style.cssText = [
      'padding: 10px 28px',
      'border: 2px solid #ef4444',
      'border-radius: 6px',
      'background: transparent',
      'color: #ef4444',
      'font-size: 14px',
      'font-weight: bold',
      'cursor: pointer'
    ].join(';');
    proceedBtn.addEventListener('click', function() {
      overlay.remove();
      window.location.href = url;
    });

    buttonRow.appendChild(proceedBtn);
    buttonRow.appendChild(blockBtn);
    dialog.appendChild(title);
    dialog.appendChild(detail);
    dialog.appendChild(reasonEl);
    dialog.appendChild(buttonRow);
    overlay.appendChild(dialog);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });

    document.documentElement.appendChild(overlay);
  }

  // --- Dynamic Script Monitor (MutationObserver) ---

  function monitorDynamicScripts() {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          // Check injected scripts
          var scripts = [];
          if (node.tagName === 'SCRIPT') {
            scripts.push(node);
          }
          var nested = node.querySelectorAll ? node.querySelectorAll('script') : [];
          for (var i = 0; i < nested.length; i++) {
            scripts.push(nested[i]);
          }

          scripts.forEach(function(script) {
            var src = script.getAttribute('src') || '';
            var content = script.textContent || '';

            // Flag scripts from suspicious sources
            var suspiciousSource = /^(data:|blob:)/i.test(src) ||
              (/^https?:\/\/(\d{1,3}\.){3}\d{1,3}/.test(src));

            if (suspiciousSource) {
              threats.push({
                type: 'injected_script',
                severity: 'high',
                description: 'Dynamically injected script from suspicious source: ' + src.substring(0, 80),
                location: 'dom_mutation'
              });
              updateStatus();
            }

            // Quick content analysis for inline injected scripts
            if (content.length > 0) {
              var hasEval = /eval\s*\(/.test(content);
              var hasExfil = /(?:fetch|XMLHttpRequest|sendBeacon|new\s+Image)/.test(content) &&
                /(?:document\.cookie|localStorage|sessionStorage)/.test(content);

              if (hasEval || hasExfil) {
                threats.push({
                  type: 'malicious_injection',
                  severity: hasExfil ? 'critical' : 'high',
                  description: hasExfil
                    ? 'Injected script with data exfiltration pattern'
                    : 'Injected script uses eval()',
                  location: 'dom_mutation'
                });
                updateStatus();
              }
            }
          });

          // Also re-scan any new links
          var newLinks = [];
          if (node.tagName === 'A' && node.hasAttribute('href')) {
            newLinks.push(node);
          }
          var nestedLinks = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
          for (var j = 0; j < nestedLinks.length; j++) {
            newLinks.push(nestedLinks[j]);
          }
          if (newLinks.length > 0) {
            scanLinks();
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // --- Status Management ---

  function updateStatus() {
    var hasCritical = threats.some(function(t) { return t.severity === 'critical'; });
    var hasHigh = threats.some(function(t) { return t.severity === 'high'; });

    if (hasCritical || threats.length >= 5) {
      setStatus('danger');
    } else if (hasHigh || threats.length >= 2) {
      setStatus('caution');
    } else {
      setStatus('safe');
    }
  }

  // --- Message Handlers ---

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
      case 'getPageContent':
        sendResponse({ content: document.documentElement.outerHTML });
        break;
      case 'updateStatus':
        if (request.threats) {
          request.threats.forEach(function(t) { threats.push(t); });
        }
        updateStatus();
        sendResponse({ received: true });
        break;
      default:
        sendResponse({ error: 'Unknown action' });
    }
    return true;
  });

  // --- Initialization ---

  function init() {
    createStatusIndicator();
    scanLinks();
    monitorDynamicScripts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
