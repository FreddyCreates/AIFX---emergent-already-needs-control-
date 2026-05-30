/**
 * Cipher Shield — Content Script
 * EXT-002 | Real-time Input Monitoring & Injection Detection
 */

(function () {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  // Local injection detection patterns (subset of background logic)
  var injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)/i,
    /system\s+prompt/i,
    /jailbreak/i,
    /disregard\s+(all\s+)?(previous|prior|above)/i,
    /pretend\s+you\s+are/i,
    /act\s+as\s+if/i,
    /bypass\s+(security|filter|restriction)/i,
    /override\s+(instruction|protocol|safety)/i,
    /do\s+anything\s+now/i
  ];

  var sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)\b.*\b(FROM|INTO|TABLE|SET|WHERE|DATABASE)\b)/i,
    /(\b(UNION)\b.*\b(SELECT)\b)/i,
    /(';\s*--)/,
    /(OR\s+1\s*=\s*1)/i
  ];

  var xssPatterns = [
    /<script[\s>]/i,
    /javascript\s*:/i,
    /on(load|error|click|mouseover|focus|blur)\s*=/i,
    /<iframe[\s>]/i,
    /eval\s*\(/i
  ];

  function detectInjectionLocal(text) {
    var score = 0;
    var matched = [];

    injectionPatterns.forEach(function (pattern) {
      if (pattern.test(text)) {
        matched.push('prompt-injection');
        score += 0.3;
      }
    });

    sqlPatterns.forEach(function (pattern) {
      if (pattern.test(text)) {
        matched.push('sql-injection');
        score += 0.25;
      }
    });

    xssPatterns.forEach(function (pattern) {
      if (pattern.test(text)) {
        matched.push('xss');
        score += 0.2;
      }
    });

    return { score: Math.min(score, 1.0), patterns: matched };
  }

  // Shield status indicator
  var shieldIndicator = document.createElement('div');
  shieldIndicator.id = 'cipher-shield-indicator';
  shieldIndicator.textContent = '\uD83D\uDEE1\uFE0F';
  shieldIndicator.style.cssText = [
    'position: fixed',
    'top: 10px',
    'right: 10px',
    'z-index: 2147483647',
    'font-size: 24px',
    'width: 40px',
    'height: 40px',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'background: rgba(0, 128, 0, 0.85)',
    'border-radius: 50%',
    'cursor: pointer',
    'box-shadow: 0 2px 8px rgba(0,0,0,0.3)',
    'transition: background 0.3s ease',
    'user-select: none'
  ].join('; ');
  shieldIndicator.title = 'Cipher Shield: Page Secure';

  var pageThreats = 0;

  function updateShieldStatus() {
    if (pageThreats === 0) {
      shieldIndicator.style.background = 'rgba(0, 128, 0, 0.85)';
      shieldIndicator.title = 'Cipher Shield: Page Secure';
    } else if (pageThreats <= 2) {
      shieldIndicator.style.background = 'rgba(255, 165, 0, 0.85)';
      shieldIndicator.title = 'Cipher Shield: ' + pageThreats + ' warning(s) detected';
    } else {
      shieldIndicator.style.background = 'rgba(255, 0, 0, 0.85)';
      shieldIndicator.title = 'Cipher Shield: ' + pageThreats + ' threat(s) detected';
    }
  }

  function removeWarningTooltip(field) {
    var existingTip = field.parentElement
      ? field.parentElement.querySelector('.cipher-shield-tooltip')
      : null;
    if (existingTip) {
      existingTip.remove();
    }
  }

  function addWarningTooltip(field, message) {
    removeWarningTooltip(field);
    var tooltip = document.createElement('div');
    tooltip.className = 'cipher-shield-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = [
      'position: absolute',
      'background: #ff4444',
      'color: white',
      'padding: 4px 8px',
      'border-radius: 4px',
      'font-size: 12px',
      'white-space: nowrap',
      'z-index: 2147483646',
      'pointer-events: none',
      'margin-top: 2px'
    ].join('; ');

    if (field.parentElement) {
      var parentPos = getComputedStyle(field.parentElement).position;
      if (parentPos === 'static') {
        field.parentElement.style.position = 'relative';
      }
      field.parentElement.appendChild(tooltip);
    }
  }

  function handleInput(event) {
    var field = event.target;
    var value = field.value || '';

    if (value.length < 3) {
      field.style.border = '';
      removeWarningTooltip(field);
      return;
    }

    var result = detectInjectionLocal(value);

    if (result.score > 0.5) {
      field.style.border = '3px solid red';
      addWarningTooltip(field, '\uD83D\uDEA8 High injection risk detected!');
      pageThreats++;
      updateShieldStatus();

      // Send to background for full analysis
      chrome.runtime.sendMessage(
        { action: 'detectInjection', text: value },
        function (response) {
          if (chrome.runtime.lastError) return;
          if (response && response.risk === 'critical') {
            field.style.border = '3px solid darkred';
          }
        }
      );
    } else if (result.score >= 0.3) {
      field.style.border = '3px solid yellow';
      addWarningTooltip(field, '\u26A0\uFE0F Moderate risk — review input');
    } else {
      field.style.border = '';
      removeWarningTooltip(field);
    }
  }

  function attachListeners(field) {
    if (field.dataset && field.dataset.cipherShieldBound) return;
    field.addEventListener('input', handleInput);
    if (field.dataset) {
      field.dataset.cipherShieldBound = 'true';
    }
  }

  function scanAndBind(root) {
    var fields = root.querySelectorAll('input, textarea');
    fields.forEach(function (field) {
      attachListeners(field);
    });
  }

  // Initial binding
  if (document.body) {
    document.body.appendChild(shieldIndicator);
    scanAndBind(document.body);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(shieldIndicator);
      scanAndBind(document.body);
    });
  }

  // MutationObserver to catch dynamically added fields
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        var tagName = node.tagName ? node.tagName.toLowerCase() : '';
        if (tagName === 'input' || tagName === 'textarea') {
          attachListeners(node);
        }

        if (node.querySelectorAll) {
          scanAndBind(node);
        }
      });
    });
  });

  var observerTarget = document.body || document.documentElement;
  observer.observe(observerTarget, { childList: true, subtree: true });
})();
