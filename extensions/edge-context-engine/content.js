/* Edge Context Engine — Interface Layer (EXT-035) */

(function () {
  'use strict';

  var PANEL_ID = 'edge-context-engine-panel';

  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  var panel = {
    id: PANEL_ID,
    title: '\uD83E\uDDE0 Edge Context Engine',
    width: 360,
    height: 520,
    theme: {
      background: '#0d1117',
      foreground: '#e0e0e0',
      accent: '#ff8c00',
      accentGradient: 'linear-gradient(135deg, #ff8c00, #e07800)',
      surface: '#161b22',
      border: '#ff8c00'
    }
  };

  var state = {
    collapsed: false,
    dragging: false,
    dragOffset: { x: 0, y: 0 }
  };

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    var container = document.createElement('div');
    container.id = panel.id;
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: panel.width + 'px',
      maxHeight: panel.height + 'px',
      backgroundColor: panel.theme.background,
      color: panel.theme.foreground,
      border: '1px solid ' + panel.theme.border,
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(255,140,0,0.35)',
      fontFamily: '"Segoe UI", -apple-system, sans-serif',
      fontSize: '13px',
      zIndex: '2147483647',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    });

    /* Header */
    var header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 14px',
      background: panel.theme.accentGradient,
      cursor: 'grab',
      userSelect: 'none'
    });

    var title = document.createElement('span');
    title.textContent = panel.title;
    title.style.fontWeight = '700';
    title.style.fontSize = '14px';

    var toggle = document.createElement('button');
    Object.assign(toggle.style, {
      background: 'none',
      border: 'none',
      color: '#e0e0e0',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '0 4px'
    });
    toggle.textContent = '\u2796';
    toggle.title = 'Collapse / Expand';

    header.appendChild(title);
    header.appendChild(toggle);
    container.appendChild(header);

    /* Drag support */
    header.addEventListener('mousedown', function (e) {
      if (e.target === toggle) return;
      state.dragging = true;
      state.dragOffset.x = e.clientX - container.getBoundingClientRect().left;
      state.dragOffset.y = e.clientY - container.getBoundingClientRect().top;
      header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function (e) {
      if (!state.dragging) return;
      container.style.left = (e.clientX - state.dragOffset.x) + 'px';
      container.style.top = (e.clientY - state.dragOffset.y) + 'px';
      container.style.right = 'auto';
      container.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', function () {
      state.dragging = false;
      header.style.cursor = 'grab';
    });

    /* Body */
    var body = document.createElement('div');
    body.style.padding = '12px';
    body.style.overflowY = 'auto';
    body.style.flex = '1';

    /* Model chips */
    var modelRow = document.createElement('div');
    Object.assign(modelRow.style, {
      display: 'flex',
      gap: '4px',
      marginBottom: '8px',
      flexWrap: 'wrap'
    });

    var models = ['Embeddings', 'GPT', 'Command R', 'Florence'];
    models.forEach(function (m) {
      var chip = document.createElement('span');
      chip.textContent = m;
      Object.assign(chip.style, {
        padding: '3px 8px',
        borderRadius: '12px',
        backgroundColor: '#ff8c00',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '600'
      });
      modelRow.appendChild(chip);
    });
    body.appendChild(modelRow);

    /* Button row */
    var btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '8px', marginTop: '8px' });

    function makeButton(label, color) {
      var btn = document.createElement('button');
      btn.textContent = label;
      Object.assign(btn.style, {
        flex: '1',
        padding: '8px 0',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: color,
        color: '#fff',
        fontWeight: '600',
        fontSize: '12px',
        cursor: 'pointer'
      });
      btn.addEventListener('mouseenter', function () { btn.style.opacity = '0.85'; });
      btn.addEventListener('mouseleave', function () { btn.style.opacity = '1'; });
      return btn;
    }

    var captureBtn = makeButton('\uD83D\uDCE5 Capture Page', '#ff8c00');
    var buildBtn = makeButton('\uD83E\uDDE0 Build Context', '#0078d4');
    var panelBtn = makeButton('\uD83D\uDCBB Side Panel', '#107c10');

    btnRow.appendChild(captureBtn);
    btnRow.appendChild(buildBtn);
    btnRow.appendChild(panelBtn);
    body.appendChild(btnRow);

    /* Results area */
    var results = document.createElement('div');
    Object.assign(results.style, {
      marginTop: '10px',
      padding: '8px',
      backgroundColor: '#2e1a00',
      borderRadius: '6px',
      minHeight: '40px',
      maxHeight: '280px',
      overflowY: 'auto',
      fontSize: '12px',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      display: 'none'
    });
    body.appendChild(results);

    container.appendChild(body);

    /* Collapse toggle */
    toggle.addEventListener('click', function () {
      state.collapsed = !state.collapsed;
      body.style.display = state.collapsed ? 'none' : 'block';
      toggle.textContent = state.collapsed ? '\u2795' : '\u2796';
    });

    /* Button handlers */
    function showResult(data) {
      results.style.display = 'block';
      results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    captureBtn.addEventListener('click', function () {
      var pageContent = document.body ? document.body.innerText.substring(0, 2000) : '';
      var pageTitle = document.title || '';
      var pageUrl = window.location.href || '';
      showResult('\u23F3 Capturing page context...');
      chrome.runtime.sendMessage(
        { action: 'addContext', url: pageUrl, title: pageTitle, content: pageContent },
        function (resp) {
          if (chrome.runtime.lastError) { showResult('Error: ' + chrome.runtime.lastError.message); return; }
          showResult(resp);
        }
      );
    });

    buildBtn.addEventListener('click', function () {
      showResult('\u23F3 Building context summary...');
      chrome.runtime.sendMessage(
        { action: 'buildContext' },
        function (resp) {
          if (chrome.runtime.lastError) { showResult('Error: ' + chrome.runtime.lastError.message); return; }
          showResult(resp);
        }
      );
    });

    panelBtn.addEventListener('click', function () {
      showResult('\u23F3 Opening side panel...');
      chrome.runtime.sendMessage(
        { action: 'getState' },
        function (resp) {
          if (chrome.runtime.lastError) { showResult('Error: ' + chrome.runtime.lastError.message); return; }
          showResult(resp);
        }
      );
    });

    return container;
  }

  if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(buildPanel());
  }
})();
