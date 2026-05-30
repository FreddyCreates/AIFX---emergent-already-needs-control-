/* Edge Runner — Content Script (EXT-014) */

(function () {
  'use strict';

  var PANEL_ID = 'edge-runner-panel';
  if (document.getElementById(PANEL_ID)) return;

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '370px',
    maxHeight: '540px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #00d4aa', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,212,170,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  /* Header */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #00d4aa, #00897b)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\u26A1 Edge Runner';
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';

  /* Offline indicator badge */
  var offlineBadge = document.createElement('span');
  Object.assign(offlineBadge.style, {
    padding: '2px 8px', borderRadius: '10px', fontSize: '10px',
    fontWeight: '600', marginLeft: '8px'
  });
  offlineBadge.textContent = navigator.onLine ? '\uD83D\uDFE2 Online' : '\uD83D\uDD34 Offline';
  offlineBadge.style.backgroundColor = navigator.onLine ? '#28a74533' : '#e9456033';
  title.appendChild(offlineBadge);

  window.addEventListener('online', function () {
    offlineBadge.textContent = '\uD83D\uDFE2 Online';
    offlineBadge.style.backgroundColor = '#28a74533';
  });
  window.addEventListener('offline', function () {
    offlineBadge.textContent = '\uD83D\uDD34 Offline';
    offlineBadge.style.backgroundColor = '#e9456033';
  });

  var toggle = document.createElement('button');
  Object.assign(toggle.style, {
    background: 'none', border: 'none', color: '#e0e0e0',
    fontSize: '16px', cursor: 'pointer', padding: '0 4px'
  });
  toggle.textContent = '\u2796';
  header.appendChild(title);
  header.appendChild(toggle);
  panel.appendChild(header);

  /* Body */
  var body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflowY = 'auto';
  body.style.flex = '1';

  /* Model selector */
  var modelSelect = document.createElement('select');
  Object.assign(modelSelect.style, {
    width: '100%', padding: '6px', marginBottom: '8px',
    backgroundColor: '#161b22', color: '#e0e0e0',
    border: '1px solid #444', borderRadius: '6px', fontSize: '12px'
  });
  var modelNames = { phi: 'Phi (2.7GB)', gemma: 'Gemma (5GB)', dbrx: 'DBRX (36GB)' };
  var modelKeys = ['phi', 'gemma', 'dbrx'];
  for (var i = 0; i < modelKeys.length; i++) {
    var opt = document.createElement('option');
    opt.value = modelKeys[i];
    opt.textContent = modelNames[modelKeys[i]];
    modelSelect.appendChild(opt);
  }
  body.appendChild(modelSelect);

  /* Input */
  var textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '100%', height: '64px', backgroundColor: '#161b22',
    color: '#e0e0e0', border: '1px solid #444', borderRadius: '6px',
    padding: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
  });
  textarea.placeholder = 'Enter prompt for local inference\u2026';
  body.appendChild(textarea);

  /* Buttons */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginTop: '8px' });

  function makeButton(label, color) {
    var btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      flex: '1', padding: '7px 0', border: 'none', borderRadius: '6px',
      backgroundColor: color, color: '#fff', fontWeight: '600',
      fontSize: '11px', cursor: 'pointer'
    });
    return btn;
  }

  var inferBtn = makeButton('\u26A1 Infer', '#00d4aa');
  var benchBtn = makeButton('\uD83D\uDCCA Benchmark', '#6c63ff');
  var selectBtn = makeButton('\uD83C\uDFAF Auto-Select', '#e94560');

  btnRow.appendChild(inferBtn);
  btnRow.appendChild(benchBtn);
  btnRow.appendChild(selectBtn);
  body.appendChild(btnRow);

  /* Performance dashboard area */
  var dashboard = document.createElement('div');
  Object.assign(dashboard.style, {
    marginTop: '10px', padding: '8px', backgroundColor: '#161b22',
    borderRadius: '6px', fontSize: '11px', display: 'none'
  });
  body.appendChild(dashboard);

  /* Results */
  var results = document.createElement('div');
  Object.assign(results.style, {
    marginTop: '10px', padding: '8px', backgroundColor: '#161b22',
    borderRadius: '6px', minHeight: '40px', maxHeight: '200px',
    overflowY: 'auto', fontSize: '12px', lineHeight: '1.5',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'none'
  });
  body.appendChild(results);
  panel.appendChild(body);
  document.body.appendChild(panel);

  /* Collapse */
  var collapsed = false;
  toggle.addEventListener('click', function () {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    toggle.textContent = collapsed ? '\u2795' : '\u2796';
  });

  /* Drag */
  var isDragging = false, dx = 0, dy = 0;
  header.addEventListener('mousedown', function (e) {
    isDragging = true; dx = e.clientX - panel.getBoundingClientRect().left;
    dy = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing'; e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    panel.style.left = (e.clientX - dx) + 'px';
    panel.style.top = (e.clientY - dy) + 'px';
    panel.style.right = 'auto'; panel.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', function () {
    if (isDragging) { isDragging = false; header.style.cursor = 'grab'; }
  });

  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  function showDashboard(bench) {
    dashboard.style.display = 'block';
    var html = '';
    for (var i = 0; i < bench.ranking.length; i++) {
      var m = bench.models[bench.ranking[i]];
      html += m.name + ': ' + m.grade + ' (PI: ' + m.performanceIndex + ')\n';
    }
    dashboard.textContent = html;
  }

  inferBtn.addEventListener('click', function () {
    var prompt = textarea.value.trim();
    if (!prompt) { showResult('Enter a prompt.'); return; }
    showResult('Running local inference\u2026');
    chrome.runtime.sendMessage(
      { action: 'inferLocal', prompt: prompt, model: modelSelect.value },
      function (r) { showResult(r && r.success ? r.data : 'Error'); }
    );
  });

  benchBtn.addEventListener('click', function () {
    showResult('Running benchmarks\u2026');
    chrome.runtime.sendMessage({ action: 'benchmarkModels' }, function (r) {
      if (r && r.success) {
        showDashboard(r.data);
        showResult(r.data);
      } else { showResult('Error'); }
    });
  });

  selectBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage(
      { action: 'selectOptimalModel', taskComplexity: 0.5, availableMemory: 8000 },
      function (r) { showResult(r && r.success ? r.data : 'Error'); }
    );
  });

})();
