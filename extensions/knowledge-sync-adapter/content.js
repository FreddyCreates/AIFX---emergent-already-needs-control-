/* Knowledge Sync Adapter — Interface Layer (EXT-039) */

(function () {
  'use strict';

  var PANEL_ID = 'knowledge-sync-adapter-panel';
  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  var ACCENT = '#f59e0b';
  var ACCENT_GRAD = 'linear-gradient(135deg, #f59e0b, #d97706)';

  var state = { collapsed: false, dragging: false, dragOffset: { x: 0, y: 0 } };

  function getPageText() {
    if (!document.body) return '';
    var clone = document.body.cloneNode(true);
    var scripts = clone.querySelectorAll('script, style, nav, footer');
    scripts.forEach(function (el) { el.remove(); });
    return (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim().substring(0, 8000);
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
      boxShadow: '0 8px 32px rgba(245,158,11,0.35)',
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
    title.textContent = '\uD83E\uDDE0 Knowledge Sync';
    title.style.fontWeight = '700'; title.style.color = '#1a0a00';

    var toggle = document.createElement('button');
    Object.assign(toggle.style, { background: 'none', border: 'none', color: '#1a0a00', fontSize: '16px', cursor: 'pointer' });
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
      background: '#1a0a00', borderRadius: '6px', padding: '6px 8px',
      fontSize: '11px', color: '#f59e0b', marginBottom: '8px'
    });
    info.textContent = '\uD83D\uDD17 ' + location.hostname + ' — Click Sync to extract entities';
    body.appendChild(info);

    var searchRow = document.createElement('div');
    Object.assign(searchRow.style, { display: 'flex', gap: '6px', marginBottom: '8px' });

    var searchInput = document.createElement('input');
    Object.assign(searchInput.style, {
      flex: '1', background: '#161b22', color: '#e0e0e0', border: '1px solid #333',
      borderRadius: '6px', padding: '6px 10px', fontSize: '12px', outline: 'none'
    });
    searchInput.placeholder = 'Query graph (e.g. "AI", "OpenAI")...';
    searchRow.appendChild(searchInput);

    var queryBtn = document.createElement('button');
    Object.assign(queryBtn.style, {
      padding: '6px 12px', background: ACCENT, border: 'none', borderRadius: '6px',
      color: '#1a0a00', fontWeight: '700', fontSize: '12px', cursor: 'pointer'
    });
    queryBtn.textContent = '\uD83D\uDD0D';
    searchRow.appendChild(queryBtn);
    body.appendChild(searchRow);

    var btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '6px' });

    function makeBtn(label, color, textColor) {
      var b = document.createElement('button');
      b.textContent = label;
      Object.assign(b.style, {
        flex: '1', padding: '8px 0', border: 'none', borderRadius: '6px',
        backgroundColor: color, color: textColor || '#fff', fontWeight: '600', fontSize: '12px', cursor: 'pointer'
      });
      b.addEventListener('mouseenter', function () { b.style.opacity = '0.85'; });
      b.addEventListener('mouseleave', function () { b.style.opacity = '1'; });
      return b;
    }

    var syncBtn = makeBtn('\uD83E\uDDE0 Sync Page', ACCENT, '#1a0a00');
    var graphBtn = makeBtn('\uD83D\uDDFA\uFE0F Graph', '#7c3aed');

    btnRow.appendChild(syncBtn);
    btnRow.appendChild(graphBtn);
    body.appendChild(btnRow);

    var results = document.createElement('div');
    Object.assign(results.style, {
      marginTop: '10px', padding: '8px', backgroundColor: '#1a0e00',
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

    syncBtn.addEventListener('click', function () {
      show('\u23F3 Extracting entities...');
      var text = getPageText();
      chrome.runtime.sendMessage({ action: 'syncPage', text: text, url: location.href }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    graphBtn.addEventListener('click', function () {
      chrome.runtime.sendMessage({ action: 'getGraph' }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    queryBtn.addEventListener('click', function () {
      var term = searchInput.value.trim();
      if (!term) { show('Enter a search term.'); return; }
      chrome.runtime.sendMessage({ action: 'query', term: term }, function (r) {
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
