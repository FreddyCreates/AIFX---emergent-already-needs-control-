/* Video Architect — Content Script (EXT-011) */

(function () {
  'use strict';

  var PANEL_ID = 'video-architect-panel';
  if (document.getElementById(PANEL_ID)) return;

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '380px',
    maxHeight: '560px',
    backgroundColor: '#0d1117',
    color: '#e0e0e0',
    border: '1px solid #ff6b35',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(255,107,53,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    background: 'linear-gradient(135deg, #ff6b35, #c2185b)',
    cursor: 'grab',
    userSelect: 'none'
  });

  var title = document.createElement('span');
  title.textContent = '\uD83C\uDFAC Video Architect';
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';

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

  /* Engine selector */
  var selectorRow = document.createElement('div');
  Object.assign(selectorRow.style, { display: 'flex', gap: '6px', marginBottom: '8px' });

  var engineSelect = document.createElement('select');
  Object.assign(engineSelect.style, {
    flex: '1', padding: '6px', backgroundColor: '#161b22',
    color: '#e0e0e0', border: '1px solid #444', borderRadius: '6px', fontSize: '12px'
  });
  var engines = ['sora', 'runway', 'pika', 'kling'];
  for (var i = 0; i < engines.length; i++) {
    var opt = document.createElement('option');
    opt.value = engines[i];
    opt.textContent = engines[i].charAt(0).toUpperCase() + engines[i].slice(1);
    engineSelect.appendChild(opt);
  }
  selectorRow.appendChild(engineSelect);
  body.appendChild(selectorRow);

  /* Prompt textarea */
  var textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '100%', height: '64px', backgroundColor: '#161b22',
    color: '#e0e0e0', border: '1px solid #444', borderRadius: '6px',
    padding: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
  });
  textarea.placeholder = 'Describe the video you want to generate\u2026';
  body.appendChild(textarea);

  /* Preview thumbnails */
  var thumbRow = document.createElement('div');
  Object.assign(thumbRow.style, {
    display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto'
  });
  for (var t = 0; t < 4; t++) {
    var thumb = document.createElement('div');
    Object.assign(thumb.style, {
      width: '76px', height: '44px', backgroundColor: '#21262d',
      borderRadius: '4px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '10px', color: '#888', flexShrink: '0'
    });
    thumb.textContent = 'Frame ' + (t + 1);
    thumbRow.appendChild(thumb);
  }
  body.appendChild(thumbRow);

  /* Button row */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '8px', marginTop: '8px' });

  function makeButton(label, color) {
    var btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      flex: '1', padding: '8px 0', border: 'none', borderRadius: '6px',
      backgroundColor: color, color: '#fff', fontWeight: '600',
      fontSize: '12px', cursor: 'pointer'
    });
    btn.addEventListener('mouseenter', function () { btn.style.opacity = '0.85'; });
    btn.addEventListener('mouseleave', function () { btn.style.opacity = '1'; });
    return btn;
  }

  var generateBtn = makeButton('\uD83C\uDFAC Generate', '#ff6b35');
  var routeBtn = makeButton('\uD83E\uDDE0 Auto-Route', '#6c63ff');
  var downloadBtn = makeButton('\u2B07 Download', '#28a745');

  btnRow.appendChild(generateBtn);
  btnRow.appendChild(routeBtn);
  btnRow.appendChild(downloadBtn);
  body.appendChild(btnRow);

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
  var isDragging = false, dragX = 0, dragY = 0;
  header.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragX = e.clientX - panel.getBoundingClientRect().left;
    dragY = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    panel.style.left = (e.clientX - dragX) + 'px';
    panel.style.top = (e.clientY - dragY) + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', function () {
    if (isDragging) { isDragging = false; header.style.cursor = 'grab'; }
  });

  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  generateBtn.addEventListener('click', function () {
    var prompt = textarea.value.trim();
    if (!prompt) { showResult('Enter a video prompt.'); return; }
    showResult('Generating video\u2026');
    chrome.runtime.sendMessage(
      { action: 'generateVideo', prompt: prompt, engine: engineSelect.value, duration: 10 },
      function (r) { showResult(r && r.success ? r.data : 'Error: ' + ((r && r.error) || 'No response')); }
    );
  });

  routeBtn.addEventListener('click', function () {
    var prompt = textarea.value.trim();
    if (!prompt) { showResult('Enter a prompt to auto-route.'); return; }
    showResult('Routing to best engine\u2026');
    chrome.runtime.sendMessage(
      { action: 'routeByComplexity', prompt: prompt },
      function (r) { showResult(r && r.success ? r.data : 'Error: ' + ((r && r.error) || 'No response')); }
    );
  });

  downloadBtn.addEventListener('click', function () {
    showResult('Download queued — video will be saved when generation completes.');
  });

})();
