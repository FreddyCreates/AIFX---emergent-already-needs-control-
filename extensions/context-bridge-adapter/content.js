/* Context Bridge Adapter — Interface Layer (EXT-037) */

(function () {
  'use strict';

  var PANEL_ID = 'context-bridge-adapter-panel';
  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  var ACCENT = '#0ea5e9';
  var ACCENT_GRAD = 'linear-gradient(135deg, #0ea5e9, #0284c7)';

  var state = { collapsed: false, dragging: false, dragOffset: { x: 0, y: 0 } };

  function capturePageContext() {
    return {
      url: location.href,
      title: document.title,
      domain: location.hostname,
      selection: window.getSelection ? window.getSelection().toString() : '',
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 6).map(function (h) { return h.textContent.trim(); }),
      wordCount: (document.body ? document.body.innerText.split(/\s+/).filter(Boolean).length : 0),
      language: document.documentElement.lang || 'en',
      readingTime: Math.ceil((document.body ? document.body.innerText.split(/\s+/).length : 0) / 200)
    };
  }

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    var container = document.createElement('div');
    container.id = PANEL_ID;
    Object.assign(container.style, {
      position: 'fixed', bottom: '20px', right: '20px',
      width: '340px', maxHeight: '500px',
      backgroundColor: '#0d1117', color: '#e0e0e0',
      border: '1px solid ' + ACCENT, borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(14,165,233,0.4)',
      fontFamily: '"Segoe UI", -apple-system, sans-serif',
      fontSize: '13px', zIndex: '2147483647',
      overflow: 'hidden', display: 'flex', flexDirection: 'column'
    });

    var header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', background: ACCENT_GRAD, cursor: 'grab', userSelect: 'none'
    });

    var title = document.createElement('span');
    title.textContent = '\uD83C\uDF09 Context Bridge';
    title.style.fontWeight = '700';

    var toggle = document.createElement('button');
    Object.assign(toggle.style, { background: 'none', border: 'none', color: '#e0e0e0', fontSize: '16px', cursor: 'pointer' });
    toggle.textContent = '\u2796';

    header.appendChild(title);
    header.appendChild(toggle);
    container.appendChild(header);

    header.addEventListener('mousedown', function (e) {
      if (e.target === toggle) return;
      state.dragging = true;
      state.dragOffset.x = e.clientX - container.getBoundingClientRect().left;
      state.dragOffset.y = e.clientY - container.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', function (e) {
      if (!state.dragging) return;
      container.style.left = (e.clientX - state.dragOffset.x) + 'px';
      container.style.top = (e.clientY - state.dragOffset.y) + 'px';
      container.style.right = 'auto'; container.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', function () { state.dragging = false; });

    var body = document.createElement('div');
    body.style.padding = '12px'; body.style.overflowY = 'auto'; body.style.flex = '1';

    var info = document.createElement('div');
    Object.assign(info.style, {
      background: '#0c2a3d', borderRadius: '6px', padding: '8px',
      fontSize: '11px', color: '#88c0d0', marginBottom: '8px'
    });
    info.textContent = '\uD83D\uDCCD ' + document.title.substring(0, 50) + ' | ' + location.hostname;
    body.appendChild(info);

    var btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '6px' });

    function makeBtn(label, color) {
      var b = document.createElement('button');
      b.textContent = label;
      Object.assign(b.style, {
        flex: '1', padding: '8px 0', border: 'none', borderRadius: '6px',
        backgroundColor: color, color: '#fff', fontWeight: '600', fontSize: '12px', cursor: 'pointer'
      });
      b.addEventListener('mouseenter', function () { b.style.opacity = '0.85'; });
      b.addEventListener('mouseleave', function () { b.style.opacity = '1'; });
      return b;
    }

    var captureBtn = makeBtn('\uD83D\uDCF8 Capture Context', ACCENT);
    var bridgeBtn = makeBtn('\uD83C\uDF09 Bridge to AI', '#10b981');

    btnRow.appendChild(captureBtn);
    btnRow.appendChild(bridgeBtn);
    body.appendChild(btnRow);

    var results = document.createElement('div');
    Object.assign(results.style, {
      marginTop: '10px', padding: '8px', backgroundColor: '#0c1a2d',
      borderRadius: '6px', minHeight: '36px', maxHeight: '260px',
      overflowY: 'auto', fontSize: '12px', lineHeight: '1.5',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'none'
    });
    body.appendChild(results);
    container.appendChild(body);

    toggle.addEventListener('click', function () {
      state.collapsed = !state.collapsed;
      body.style.display = state.collapsed ? 'none' : 'flex';
      body.style.flexDirection = 'column';
      toggle.textContent = state.collapsed ? '\u2795' : '\u2796';
    });

    function show(data) {
      results.style.display = 'block';
      results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    captureBtn.addEventListener('click', function () {
      var ctx = capturePageContext();
      show('\u23F3 Capturing context...');
      chrome.runtime.sendMessage({ action: 'captureContext', context: ctx }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    bridgeBtn.addEventListener('click', function () {
      show('\u23F3 Building bridge payload...');
      chrome.runtime.sendMessage({ action: 'captureContext', context: capturePageContext() }, function () {
        chrome.tabs.getCurrent(function (tab) {
          chrome.runtime.sendMessage({ action: 'bridgeToPrompt', tabId: tab ? tab.id : 0 }, function (r) {
            if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
            show(r && r.bridgedPrompt ? r.bridgedPrompt : r);
          });
        });
      });
    });

    return container;
  }

  if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(buildPanel());
  }
})();
