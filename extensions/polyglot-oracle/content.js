/* EXT-003 Polyglot Oracle — Content Script */
(function () {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  var TRANSLATABLE = 'p, h1, h2, h3, h4, h5, h6, li, td, span';
  var MIN_TEXT_LENGTH = 12;
  var TOP_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: 'Chinese' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ru', name: 'Russian' },
    { code: 'pt', name: 'Portuguese' }
  ];

  var selectedTargetLang = 'en';
  var activeOverlay = null;
  var floatingBtn = null;
  var hoveredEl = null;
  var controlPanel = null;

  /* ── Inject styles ──────────────────────────────────────────────────── */

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.polyglot-hover { border-left: 3px solid rgba(59,130,246,0.5) !important; padding-left: 6px !important; transition: border-color 0.2s, padding-left 0.2s; }',
      '.polyglot-float-btn { position: absolute; z-index: 2147483647; width: 36px; height: 36px; border-radius: 50%; background: #2563eb; color: #fff; border: none; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.18); transition: opacity 0.15s, transform 0.15s; opacity: 0; pointer-events: none; }',
      '.polyglot-float-btn.visible { opacity: 1; pointer-events: auto; transform: scale(1); }',
      '.polyglot-float-btn:hover { background: #1d4ed8; transform: scale(1.1); }',
      '.polyglot-overlay { position: absolute; z-index: 2147483646; background: #1e293b; color: #f1f5f9; font-size: 14px; line-height: 1.5; padding: 10px 14px; border-radius: 8px; max-width: 480px; box-shadow: 0 4px 16px rgba(0,0,0,0.25); word-wrap: break-word; }',
      '.polyglot-overlay-close { position: absolute; top: 4px; right: 8px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; }',
      '.polyglot-overlay-close:hover { color: #f1f5f9; }',
      '.polyglot-overlay-meta { font-size: 11px; color: #94a3b8; margin-top: 6px; }',
      '.polyglot-panel { position: fixed; top: 12px; right: 12px; z-index: 2147483647; background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 10px 14px; font-family: system-ui, sans-serif; font-size: 13px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 8px; }',
      '.polyglot-panel select { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 4px 8px; font-size: 13px; cursor: pointer; }',
      '.polyglot-panel button { background: #2563eb; color: #fff; border: none; border-radius: 6px; padding: 5px 12px; font-size: 13px; cursor: pointer; white-space: nowrap; }',
      '.polyglot-panel button:hover { background: #1d4ed8; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Floating translate button ──────────────────────────────────────── */

  function createFloatingButton() {
    floatingBtn = document.createElement('button');
    floatingBtn.className = 'polyglot-float-btn';
    floatingBtn.textContent = '🌐';
    floatingBtn.title = 'Translate with Polyglot Oracle';
    document.body.appendChild(floatingBtn);

    floatingBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (hoveredEl) {
        translateElement(hoveredEl);
      }
    });
  }

  function positionButton(el) {
    var rect = el.getBoundingClientRect();
    floatingBtn.style.top = (window.scrollY + rect.top - 10) + 'px';
    floatingBtn.style.left = (window.scrollX + rect.right + 6) + 'px';
    floatingBtn.classList.add('visible');
  }

  function hideButton() {
    if (floatingBtn) floatingBtn.classList.remove('visible');
  }

  /* ── Control panel (language selector + Translate Page) ─────────────── */

  function createControlPanel() {
    controlPanel = document.createElement('div');
    controlPanel.className = 'polyglot-panel';

    var label = document.createElement('span');
    label.textContent = '🌐 Polyglot';

    var select = document.createElement('select');
    for (var i = 0; i < TOP_LANGUAGES.length; i++) {
      var opt = document.createElement('option');
      opt.value = TOP_LANGUAGES[i].code;
      opt.textContent = TOP_LANGUAGES[i].name;
      if (TOP_LANGUAGES[i].code === selectedTargetLang) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', function () {
      selectedTargetLang = select.value;
    });

    var pageBtn = document.createElement('button');
    pageBtn.textContent = 'Translate Page';
    pageBtn.addEventListener('click', function () {
      translateAllVisible();
    });

    controlPanel.appendChild(label);
    controlPanel.appendChild(select);
    controlPanel.appendChild(pageBtn);
    document.body.appendChild(controlPanel);
  }

  /* ── Hover handling ─────────────────────────────────────────────────── */

  function onMouseOver(e) {
    var el = e.target.closest(TRANSLATABLE);
    if (!el) return;

    var text = (el.textContent || '').trim();
    if (text.length < MIN_TEXT_LENGTH) return;

    if (hoveredEl && hoveredEl !== el) {
      hoveredEl.classList.remove('polyglot-hover');
    }

    hoveredEl = el;
    el.classList.add('polyglot-hover');
    positionButton(el);
  }

  function onMouseOut(e) {
    var el = e.target.closest(TRANSLATABLE);
    if (!el) return;

    // Only remove if we are truly leaving the element
    var related = e.relatedTarget;
    if (related && (el.contains(related) || related === floatingBtn)) return;

    el.classList.remove('polyglot-hover');
    hideButton();
    if (hoveredEl === el) hoveredEl = null;
  }

  /* ── Translation overlay ────────────────────────────────────────────── */

  function removeActiveOverlay() {
    if (activeOverlay && activeOverlay.parentNode) {
      activeOverlay.parentNode.removeChild(activeOverlay);
    }
    activeOverlay = null;
  }

  function showOverlay(el, result) {
    removeActiveOverlay();

    var rect = el.getBoundingClientRect();
    var overlay = document.createElement('div');
    overlay.className = 'polyglot-overlay';
    overlay.style.top = (window.scrollY + rect.bottom + 6) + 'px';
    overlay.style.left = (window.scrollX + rect.left) + 'px';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'polyglot-overlay-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () { removeActiveOverlay(); });

    var textNode = document.createElement('div');
    textNode.textContent = result.translated;

    var meta = document.createElement('div');
    meta.className = 'polyglot-overlay-meta';
    meta.textContent = result.engine.toUpperCase() + ' · ' +
      result.sourceLang + ' → ' + result.targetLang +
      ' · confidence ' + (result.confidence * 100).toFixed(1) + '%';

    overlay.appendChild(closeBtn);
    overlay.appendChild(textNode);
    overlay.appendChild(meta);
    document.body.appendChild(overlay);
    activeOverlay = overlay;
  }

  /* ── Translate a single element ─────────────────────────────────────── */

  function translateElement(el) {
    var text = (el.textContent || '').trim();
    if (!text) return;

    chrome.runtime.sendMessage({ action: 'detectLanguage', text: text }, function (detected) {
      if (chrome.runtime.lastError) return;

      var sourceLang = (detected && detected.code) || 'en';
      var targetLang = selectedTargetLang === sourceLang ? 'en' : selectedTargetLang;

      chrome.runtime.sendMessage({
        action: 'translateText',
        text: text,
        sourceLang: sourceLang,
        targetLang: targetLang,
        engine: 'qwen'
      }, function (result) {
        if (chrome.runtime.lastError || !result) return;
        showOverlay(el, result);
      });
    });
  }

  /* ── Translate all visible text blocks ──────────────────────────────── */

  function translateAllVisible() {
    var elements = document.querySelectorAll(TRANSLATABLE);
    var count = 0;
    var total = 0;

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var text = (el.textContent || '').trim();
      if (text.length < MIN_TEXT_LENGTH) continue;

      // Skip elements not in viewport
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

      total++;
      translateAndAnnotate(el, total);
      count++;
    }

    function translateAndAnnotate(targetEl, idx) {
      var text = (targetEl.textContent || '').trim();

      chrome.runtime.sendMessage({ action: 'detectLanguage', text: text }, function (detected) {
        if (chrome.runtime.lastError) return;

        var sourceLang = (detected && detected.code) || 'en';
        var targetLang = selectedTargetLang === sourceLang ? 'en' : selectedTargetLang;

        chrome.runtime.sendMessage({
          action: 'translateText',
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang,
          engine: 'qwen'
        }, function (result) {
          if (chrome.runtime.lastError || !result) return;

          // Append inline translation below the original
          var existing = targetEl.querySelector('.polyglot-inline');
          if (existing) existing.parentNode.removeChild(existing);

          var wrapper = document.createElement('div');
          wrapper.className = 'polyglot-inline';
          wrapper.style.cssText = 'margin-top:4px;padding:6px 10px;background:#1e293b;color:#e2e8f0;border-radius:6px;font-size:13px;line-height:1.4;';
          wrapper.textContent = result.translated;

          var metaSpan = document.createElement('span');
          metaSpan.style.cssText = 'display:block;font-size:10px;color:#64748b;margin-top:3px;';
          metaSpan.textContent = result.engine + ' · ' + (result.confidence * 100).toFixed(1) + '%';
          wrapper.appendChild(metaSpan);

          targetEl.appendChild(wrapper);
        });
      });
    }
  }

  /* ── Message listener (for background→content communication) ────────── */

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'getTextNodes') {
      var nodes = document.querySelectorAll(TRANSLATABLE);
      var texts = [];
      for (var i = 0; i < nodes.length; i++) {
        var t = (nodes[i].textContent || '').trim();
        if (t.length >= MIN_TEXT_LENGTH) texts.push(t);
      }
      sendResponse({ texts: texts });
    }

    if (message.action === 'applyTranslations') {
      var elements = document.querySelectorAll(TRANSLATABLE);
      var idx = 0;
      for (var j = 0; j < elements.length; j++) {
        var text = (elements[j].textContent || '').trim();
        if (text.length < MIN_TEXT_LENGTH) continue;
        if (idx < message.translations.length) {
          var wrapper = document.createElement('div');
          wrapper.className = 'polyglot-inline';
          wrapper.style.cssText = 'margin-top:4px;padding:6px 10px;background:#1e293b;color:#e2e8f0;border-radius:6px;font-size:13px;line-height:1.4;';
          wrapper.textContent = message.translations[idx];
          elements[j].appendChild(wrapper);
        }
        idx++;
      }
      sendResponse({ applied: idx });
    }
  });

  /* ── Initialise ─────────────────────────────────────────────────────── */

  function init() {
    injectStyles();
    createFloatingButton();
    createControlPanel();

    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);

    // Close overlay on outside click
    document.addEventListener('click', function (e) {
      if (activeOverlay && !activeOverlay.contains(e.target) && e.target !== floatingBtn) {
        removeActiveOverlay();
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
