/* Sovereign Mind — Content Script (EXT-001) */

(function () {
  'use strict';

  var PANEL_ID = 'sovereign-mind-panel';

  if (document.getElementById(PANEL_ID)) return;

  /* ── Build Panel DOM ─────────────────────────────────────── */
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '360px',
    maxHeight: '520px',
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    border: '1px solid #6c63ff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(108,99,255,0.35)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    zIndex: '2147483647',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  });

  /* ── Header (draggable) ──────────────────────────────────── */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #6c63ff, #3f3d9e)',
    cursor: 'grab',
    userSelect: 'none'
  });

  var title = document.createElement('span');
  title.textContent = '\uD83E\uDDE0 Sovereign Mind';
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
  panel.appendChild(header);

  /* ── Body container ──────────────────────────────────────── */
  var body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflowY = 'auto';
  body.style.flex = '1';

  /* Textarea */
  var textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '100%',
    height: '72px',
    backgroundColor: '#16213e',
    color: '#e0e0e0',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '12px',
    resize: 'vertical',
    boxSizing: 'border-box'
  });
  textarea.placeholder = 'Enter a prompt or select text on the page\u2026';
  body.appendChild(textarea);

  /* Button row */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, {
    display: 'flex',
    gap: '8px',
    marginTop: '8px'
  });

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

  var fuseBtn = makeButton('\u26A1 Fuse Reasoning', '#6c63ff');
  var routeBtn = makeButton('\uD83C\uDFAF Route Alpha', '#e94560');

  btnRow.appendChild(fuseBtn);
  btnRow.appendChild(routeBtn);
  body.appendChild(btnRow);

  /* Results area */
  var results = document.createElement('div');
  Object.assign(results.style, {
    marginTop: '10px',
    padding: '8px',
    backgroundColor: '#0f3460',
    borderRadius: '6px',
    minHeight: '40px',
    maxHeight: '220px',
    overflowY: 'auto',
    fontSize: '12px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    display: 'none'
  });
  body.appendChild(results);

  panel.appendChild(body);
  document.body.appendChild(panel);

  /* ── Collapse / Expand ───────────────────────────────────── */
  var collapsed = false;
  toggle.addEventListener('click', function () {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    toggle.textContent = collapsed ? '\u2795' : '\u2796';
  });

  /* ── Drag behaviour ──────────────────────────────────────── */
  var isDragging = false;
  var dragOffsetX = 0;
  var dragOffsetY = 0;

  header.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragOffsetX = e.clientX - panel.getBoundingClientRect().left;
    dragOffsetY = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var x = e.clientX - dragOffsetX;
    var y = e.clientY - dragOffsetY;
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', function () {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'grab';
    }
  });

  /* ── Text selection capture ──────────────────────────────── */
  document.addEventListener('mouseup', function (e) {
    if (panel.contains(e.target)) return;
    var sel = window.getSelection().toString().trim();
    if (sel.length > 0) {
      textarea.value = sel;
    }
  });

  /* ── Helper: show result ─────────────────────────────────── */
  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  /* ── Fuse Reasoning ──────────────────────────────────────── */
  fuseBtn.addEventListener('click', function () {
    var prompt = textarea.value.trim();
    if (!prompt) {
      showResult('Please enter a prompt or select text on the page.');
      return;
    }
    showResult('Fusing reasoning across models\u2026');
    chrome.runtime.sendMessage(
      { action: 'fuseReasoning', prompt: prompt },
      function (resp) {
        if (resp && resp.success) {
          showResult(resp.data);
        } else {
          showResult('Error: ' + ((resp && resp.error) || 'No response from background'));
        }
      }
    );
  });

  /* ── Route Alpha ─────────────────────────────────────────── */
  routeBtn.addEventListener('click', function () {
    var task = textarea.value.trim();
    if (!task) {
      showResult('Please enter a task description or select text.');
      return;
    }
    showResult('Routing to optimal model\u2026');
    chrome.runtime.sendMessage(
      { action: 'routeToAlpha', task: task },
      function (resp) {
        if (resp && resp.success) {
          showResult(resp.data);
        } else {
          showResult('Error: ' + ((resp && resp.error) || 'No response from background'));
        }
      }
    );
  });

})();
