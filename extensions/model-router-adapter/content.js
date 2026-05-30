/* Model Router Adapter — Interface Layer (EXT-036) */

(function () {
  'use strict';

  var PANEL_ID = 'model-router-adapter-panel';
  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  var ACCENT = '#7c3aed';
  var ACCENT_GRAD = 'linear-gradient(135deg, #7c3aed, #5b21b6)';

  var state = { collapsed: false, dragging: false, dragOffset: { x: 0, y: 0 } };

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    var container = document.createElement('div');
    container.id = PANEL_ID;
    Object.assign(container.style, {
      position: 'fixed', bottom: '20px', right: '20px',
      width: '340px', maxHeight: '500px',
      backgroundColor: '#0d1117', color: '#e0e0e0',
      border: '1px solid ' + ACCENT, borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
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
    title.textContent = '\uD83D\uDCE1 Model Router';
    title.style.fontWeight = '700';

    var toggle = document.createElement('button');
    Object.assign(toggle.style, {
      background: 'none', border: 'none', color: '#e0e0e0', fontSize: '16px', cursor: 'pointer'
    });
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

    var textarea = document.createElement('textarea');
    Object.assign(textarea.style, {
      width: '100%', height: '64px', backgroundColor: '#161b22', color: '#e0e0e0',
      border: '1px solid #333', borderRadius: '6px', padding: '8px', fontSize: '12px',
      resize: 'vertical', boxSizing: 'border-box'
    });
    textarea.placeholder = 'Enter a task to route to the best model\u2026';
    body.appendChild(textarea);

    var btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginTop: '8px' });

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

    var routeBtn = makeBtn('\uD83D\uDCE1 Route', ACCENT);
    var compareBtn = makeBtn('\u2696\uFE0F Compare', '#e94560');

    btnRow.appendChild(routeBtn);
    btnRow.appendChild(compareBtn);
    body.appendChild(btnRow);

    var results = document.createElement('div');
    Object.assign(results.style, {
      marginTop: '10px', padding: '8px', backgroundColor: '#1a0a3d',
      borderRadius: '6px', minHeight: '36px', maxHeight: '240px',
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

    routeBtn.addEventListener('click', function () {
      var prompt = textarea.value.trim();
      if (!prompt) { show('Enter a task to route.'); return; }
      show('\u23F3 Routing...');
      chrome.runtime.sendMessage({ action: 'route', prompt: prompt }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    compareBtn.addEventListener('click', function () {
      var prompt = textarea.value.trim();
      if (!prompt) { show('Enter a task to compare.'); return; }
      show('\u23F3 Comparing models...');
      chrome.runtime.sendMessage({ action: 'compare', prompt: prompt }, function (r) {
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
