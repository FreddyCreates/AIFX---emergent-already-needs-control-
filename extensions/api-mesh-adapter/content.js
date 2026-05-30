/* API Mesh Adapter — Interface Layer (EXT-038) */

(function () {
  'use strict';

  var PANEL_ID = 'api-mesh-adapter-panel';
  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  var ACCENT = '#10b981';
  var ACCENT_GRAD = 'linear-gradient(135deg, #10b981, #059669)';

  var state = { collapsed: false, dragging: false, dragOffset: { x: 0, y: 0 } };
  var interceptCount = 0;

  // Intercept fetch to capture API calls
  (function patchFetch() {
    if (!window.fetch || window.__apiMeshPatched) return;
    window.__apiMeshPatched = true;
    var origFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      return origFetch(input, init).then(function (resp) {
        try {
          var ct = resp.headers.get('content-type') || '';
          if (ct.indexOf('json') !== -1 || ct.indexOf('xml') !== -1) {
            resp.clone().text().then(function (text) {
              try {
                interceptCount++;
                chrome.runtime.sendMessage({
                  action: 'intercept', url: url, data: text, contentType: ct
                });
              } catch (e) { }
            });
          }
        } catch (e) { }
        return resp;
      });
    };
  })();

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    var container = document.createElement('div');
    container.id = PANEL_ID;
    Object.assign(container.style, {
      position: 'fixed', bottom: '20px', right: '20px',
      width: '340px', maxHeight: '500px',
      backgroundColor: '#0d1117', color: '#e0e0e0',
      border: '1px solid ' + ACCENT, borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
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
    title.textContent = '\uD83D\uDD78\uFE0F API Mesh';
    title.style.fontWeight = '700';

    var badge = document.createElement('span');
    Object.assign(badge.style, {
      background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '2px 8px', fontSize: '11px'
    });
    badge.textContent = '0 intercepted';
    setInterval(function () { badge.textContent = interceptCount + ' intercepted'; }, 1000);

    var toggle = document.createElement('button');
    Object.assign(toggle.style, { background: 'none', border: 'none', color: '#e0e0e0', fontSize: '16px', cursor: 'pointer' });
    toggle.textContent = '\u2796';

    header.appendChild(title);
    header.appendChild(badge);
    header.appendChild(toggle);
    container.appendChild(header);

    header.addEventListener('mousedown', function (e) {
      if (e.target === toggle || e.target === badge) return;
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

    var btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginBottom: '8px' });

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

    var logBtn = makeBtn('\uD83D\uDCCB View Log', ACCENT);
    var schemaBtn = makeBtn('\uD83D\uDDC2\uFE0F Schemas', '#0ea5e9');
    var stateBtn = makeBtn('\u2699\uFE0F State', '#7c3aed');

    btnRow.appendChild(logBtn);
    btnRow.appendChild(schemaBtn);
    btnRow.appendChild(stateBtn);
    body.appendChild(btnRow);

    var results = document.createElement('div');
    Object.assign(results.style, {
      padding: '8px', backgroundColor: '#061a10',
      borderRadius: '6px', minHeight: '36px', maxHeight: '280px',
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

    logBtn.addEventListener('click', function () {
      chrome.runtime.sendMessage({ action: 'getLog', n: 20 }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    schemaBtn.addEventListener('click', function () {
      chrome.runtime.sendMessage({ action: 'getSchemaRegistry' }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    stateBtn.addEventListener('click', function () {
      chrome.runtime.sendMessage({ action: 'getState' }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    return container;
  }

  if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(buildPanel());
  }
})();
