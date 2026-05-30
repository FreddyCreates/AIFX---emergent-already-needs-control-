/* Knowledge Cartographer — Content Script (EXT-017) */

(function () {
  'use strict';

  var PANEL_ID = 'knowledge-cartographer-panel';
  if (document.getElementById(PANEL_ID)) return;

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '400px',
    maxHeight: '580px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #9c27b0', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(156,39,176,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83D\uDDFA Knowledge Cartographer';
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

  /* Knowledge map canvas */
  var canvas = document.createElement('canvas');
  canvas.width = 370;
  canvas.height = 200;
  Object.assign(canvas.style, {
    width: '100%', height: '200px', backgroundColor: '#161b22',
    borderRadius: '6px', marginBottom: '8px'
  });
  body.appendChild(canvas);

  /* Buttons */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginBottom: '8px' });

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

  var mapBtn = makeButton('\uD83D\uDDFA Map Page', '#9c27b0');
  var queryBtn = makeButton('\uD83D\uDD0D Query', '#6c63ff');
  var vizBtn = makeButton('\uD83C\uDF00 Visualize', '#e94560');

  btnRow.appendChild(mapBtn);
  btnRow.appendChild(queryBtn);
  btnRow.appendChild(vizBtn);
  body.appendChild(btnRow);

  /* Results */
  var results = document.createElement('div');
  Object.assign(results.style, {
    marginTop: '6px', padding: '8px', backgroundColor: '#161b22',
    borderRadius: '6px', minHeight: '40px', maxHeight: '180px',
    overflowY: 'auto', fontSize: '12px', lineHeight: '1.5',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'none'
  });
  body.appendChild(results);
  panel.appendChild(body);
  document.body.appendChild(panel);

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

  /* Draw spiral visualization on canvas */
  function drawSpiral(layout) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var nodes = (layout && layout.layout) || [];

    /* Draw edges */
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (var e = 1; e < nodes.length; e++) {
      var sx = cx + nodes[e - 1].x * 0.3;
      var sy = cy + nodes[e - 1].y * 0.3;
      var ex = cx + nodes[e].x * 0.3;
      var ey = cy + nodes[e].y * 0.3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    /* Draw nodes */
    var colors = ['#9c27b0', '#6c63ff', '#e94560', '#00d4aa', '#f5a623', '#ff6b35'];
    for (var n = 0; n < nodes.length; n++) {
      var nx = cx + nodes[n].x * 0.3;
      var ny = cy + nodes[n].y * 0.3;
      var size = Math.max(3, nodes[n].size * 0.5);

      ctx.beginPath();
      ctx.arc(nx, ny, size, 0, Math.PI * 2);
      ctx.fillStyle = colors[n % colors.length];
      ctx.fill();

      if (size > 4 && nodes[n].label) {
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '8px sans-serif';
        ctx.fillText(nodes[n].label.substring(0, 10), nx + size + 2, ny + 3);
      }
    }
  }

  mapBtn.addEventListener('click', function () {
    showResult('Mapping current page\u2026');
    var pageContent = document.body.innerText.substring(0, 5000);
    chrome.runtime.sendMessage(
      { action: 'mapPage', url: window.location.href, content: pageContent },
      function (r) {
        if (r && r.success) {
          showResult(r.data);
          chrome.runtime.sendMessage({ action: 'visualizeCluster', centroid: 0, radius: 150 },
            function (v) { if (v && v.success) drawSpiral(v.data); });
        } else { showResult('Error mapping page'); }
      }
    );
  });

  queryBtn.addEventListener('click', function () {
    var query = prompt('Enter graph query:');
    if (!query) return;
    chrome.runtime.sendMessage({ action: 'queryGraph', sparql: query },
      function (r) { showResult(r && r.success ? r.data : 'Error'); });
  });

  vizBtn.addEventListener('click', function () {
    showResult('Generating visualization\u2026');
    chrome.runtime.sendMessage({ action: 'visualizeCluster', centroid: 0, radius: 180 },
      function (r) {
        if (r && r.success) {
          drawSpiral(r.data);
          showResult(r.data);
        } else { showResult('Error'); }
      });
  });

  /* Auto-map page on load */
  setTimeout(function () {
    var content = document.body.innerText.substring(0, 3000);
    chrome.runtime.sendMessage({ action: 'mapPage', url: window.location.href, content: content });
  }, 2000);

})();
