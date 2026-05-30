/* Creative Muse — Content Script (EXT-019) */

(function () {
  'use strict';

  var PANEL_ID = 'creative-muse-panel';
  if (document.getElementById(PANEL_ID)) return;

  var PHI = 1.618033988749895;

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '390px',
    maxHeight: '580px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #e040fb', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(224,64,251,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #e040fb, #ab47bc)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83C\uDFA8 Creative Muse';
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

  var body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflowY = 'auto';
  body.style.flex = '1';

  /* Tab buttons: Image / Music */
  var tabRow = document.createElement('div');
  Object.assign(tabRow.style, { display: 'flex', gap: '4px', marginBottom: '8px' });

  function makeTab(label, active) {
    var btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      flex: '1', padding: '6px 0', border: '1px solid #444', borderRadius: '6px',
      backgroundColor: active ? '#e040fb' : '#161b22', color: '#fff',
      fontWeight: '600', fontSize: '12px', cursor: 'pointer'
    });
    return btn;
  }

  var imageTab = makeTab('\uD83D\uDDBC Image', true);
  var musicTab = makeTab('\uD83C\uDFB5 Music', false);
  tabRow.appendChild(imageTab);
  tabRow.appendChild(musicTab);
  body.appendChild(tabRow);

  var currentTab = 'image';

  /* Golden ratio overlay canvas */
  var canvas = document.createElement('canvas');
  canvas.width = 366;
  canvas.height = Math.round(366 / PHI);
  Object.assign(canvas.style, {
    width: '100%', height: Math.round(366 / PHI) + 'px',
    backgroundColor: '#161b22', borderRadius: '6px', marginBottom: '8px'
  });
  body.appendChild(canvas);

  function drawGoldenGrid() {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = canvas.width;
    var h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 0, w, h);

    /* Golden ratio grid lines */
    ctx.strokeStyle = '#e040fb44';
    ctx.lineWidth = 1;
    var phiW = Math.round(w / PHI);
    var phiH = Math.round(h / PHI);

    ctx.beginPath();
    ctx.moveTo(phiW, 0); ctx.lineTo(phiW, h);
    ctx.moveTo(w - phiW, 0); ctx.lineTo(w - phiW, h);
    ctx.moveTo(0, phiH); ctx.lineTo(w, phiH);
    ctx.moveTo(0, h - phiH); ctx.lineTo(w, h - phiH);
    ctx.stroke();

    /* Focal points */
    var points = [[phiW, phiH], [w - phiW, phiH], [phiW, h - phiH], [w - phiW, h - phiH]];
    ctx.fillStyle = '#e040fb88';
    for (var i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[i][0], points[i][1], 4, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Label */
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.fillText('\u03C6 Golden Ratio Grid', 8, h - 8);
  }
  drawGoldenGrid();

  /* Prompt */
  var textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '100%', height: '56px', backgroundColor: '#161b22',
    color: '#e0e0e0', border: '1px solid #444', borderRadius: '6px',
    padding: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
  });
  textarea.placeholder = 'Describe your creative vision\u2026';
  body.appendChild(textarea);

  /* Action buttons */
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

  var createBtn = makeButton('\u2728 Create', '#e040fb');
  var fuseBtn = makeButton('\uD83D\uDD17 Fuse', '#6c63ff');
  var inspireBtn = makeButton('\uD83C\uDF1F Inspire', '#ff9800');
  var downloadBtn = makeButton('\u2B07 Save', '#28a745');

  btnRow.appendChild(createBtn);
  btnRow.appendChild(fuseBtn);
  btnRow.appendChild(inspireBtn);
  btnRow.appendChild(downloadBtn);
  body.appendChild(btnRow);

  var results = document.createElement('div');
  Object.assign(results.style, {
    marginTop: '10px', padding: '8px', backgroundColor: '#161b22',
    borderRadius: '6px', minHeight: '40px', maxHeight: '180px',
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

  /* Tab switching */
  imageTab.addEventListener('click', function () {
    currentTab = 'image';
    imageTab.style.backgroundColor = '#e040fb';
    musicTab.style.backgroundColor = '#161b22';
    canvas.style.display = 'block';
    textarea.placeholder = 'Describe the image you want to create\u2026';
  });
  musicTab.addEventListener('click', function () {
    currentTab = 'music';
    musicTab.style.backgroundColor = '#e040fb';
    imageTab.style.backgroundColor = '#161b22';
    canvas.style.display = 'none';
    textarea.placeholder = 'Describe the music you want to generate\u2026';
  });

  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  createBtn.addEventListener('click', function () {
    var prompt = textarea.value.trim();
    if (!prompt) { showResult('Enter a creative prompt.'); return; }
    showResult('Creating\u2026');
    if (currentTab === 'image') {
      chrome.runtime.sendMessage({ action: 'generateArt', prompt: prompt, medium: 'image', engine: 'sd' },
        function (r) { showResult(r && r.success ? r.data : 'Error'); });
    } else {
      chrome.runtime.sendMessage({ action: 'generateMusic', prompt: prompt, genre: 'ambient', duration: 30, engine: 'suno' },
        function (r) { showResult(r && r.success ? r.data : 'Error'); });
    }
  });

  fuseBtn.addEventListener('click', function () {
    var prompt = textarea.value.trim();
    if (!prompt) { showResult('Enter prompts for fusion.'); return; }
    showResult('Fusing image + music\u2026');
    chrome.runtime.sendMessage({ action: 'fuseCreation', imagePrompt: prompt, musicPrompt: prompt },
      function (r) { showResult(r && r.success ? r.data : 'Error'); });
  });

  inspireBtn.addEventListener('click', function () {
    var prompt = textarea.value.trim();
    if (!prompt) { showResult('Enter a seed prompt for inspiration.'); return; }
    chrome.runtime.sendMessage({ action: 'inspirationChain', seed: prompt },
      function (r) { showResult(r && r.success ? r.data : 'Error'); });
  });

  downloadBtn.addEventListener('click', function () {
    showResult('Download queued \u2014 creation will be saved when ready.');
  });

})();
