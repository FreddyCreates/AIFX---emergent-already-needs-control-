/* Data Oracle — Content Script (EXT-023) */

(function () {
  'use strict';

  var PANEL_ID = 'data-oracle-panel';
  if (document.getElementById(PANEL_ID)) return;

  /* ── Build Panel ────────────────────────────────────────── */
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '400px', width: '380px',
    maxHeight: '560px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #f0883e', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(240,136,62,0.35)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  /* ── Header ─────────────────────────────────────────────── */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #f0883e, #da3633)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83D\uDD2E Data Oracle';
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';
  var toggle = document.createElement('button');
  Object.assign(toggle.style, { background: 'none', border: 'none', color: '#e0e0e0', fontSize: '16px', cursor: 'pointer', padding: '0 4px' });
  toggle.textContent = '\u2796';
  header.appendChild(title);
  header.appendChild(toggle);
  panel.appendChild(header);

  /* ── Body ───────────────────────────────────────────────── */
  var body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflowY = 'auto';
  body.style.flex = '1';

  /* Ingest button */
  var ingestBtn = document.createElement('button');
  ingestBtn.textContent = '\uD83D\uDCE1 X-Ray This Page';
  Object.assign(ingestBtn.style, {
    width: '100%', padding: '10px', border: 'none', borderRadius: '6px',
    backgroundColor: '#f0883e', color: '#fff', fontWeight: '700',
    fontSize: '13px', cursor: 'pointer', marginBottom: '8px'
  });
  body.appendChild(ingestBtn);

  /* Query input */
  var queryInput = document.createElement('input');
  queryInput.placeholder = 'Query knowledge store\u2026';
  Object.assign(queryInput.style, {
    width: '100%', padding: '8px', backgroundColor: '#161b22', color: '#e0e0e0',
    border: '1px solid #444', borderRadius: '6px', fontSize: '12px',
    boxSizing: 'border-box', marginBottom: '8px'
  });
  body.appendChild(queryInput);

  /* Results */
  var results = document.createElement('div');
  Object.assign(results.style, {
    padding: '8px', backgroundColor: '#161b22', borderRadius: '6px',
    minHeight: '40px', maxHeight: '360px', overflowY: 'auto',
    fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    display: 'none'
  });
  body.appendChild(results);
  panel.appendChild(body);
  document.body.appendChild(panel);

  /* ── Collapse ───────────────────────────────────────────── */
  var collapsed = false;
  toggle.addEventListener('click', function () {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    toggle.textContent = collapsed ? '\u2795' : '\u2796';
  });

  /* ── Drag ───────────────────────────────────────────────── */
  var isDragging = false, dragX = 0, dragY = 0;
  header.addEventListener('mousedown', function (e) {
    isDragging = true; dragX = e.clientX - panel.getBoundingClientRect().left;
    dragY = e.clientY - panel.getBoundingClientRect().top; header.style.cursor = 'grabbing'; e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    panel.style.left = (e.clientX - dragX) + 'px'; panel.style.top = (e.clientY - dragY) + 'px';
    panel.style.right = 'auto'; panel.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', function () { if (isDragging) { isDragging = false; header.style.cursor = 'grab'; } });

  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  /* ── Gather page data ───────────────────────────────────── */
  function gatherPageData() {
    var meta = {};
    var metaTags = document.querySelectorAll('meta');
    metaTags.forEach(function (m) {
      var name = m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('http-equiv');
      if (name) meta[name] = m.getAttribute('content') || '';
    });

    var tables = [];
    document.querySelectorAll('table').forEach(function (t) {
      var headers = [];
      t.querySelectorAll('th').forEach(function (th) { headers.push(th.textContent.trim()); });
      var rows = [];
      t.querySelectorAll('tbody tr, tr').forEach(function (tr) {
        var cells = [];
        tr.querySelectorAll('td').forEach(function (td) { cells.push(td.textContent.trim()); });
        if (cells.length > 0) rows.push(cells);
      });
      if (headers.length > 0 || rows.length > 0) tables.push({ headers: headers, rows: rows });
    });

    return { text: document.body.innerText.substring(0, 50000), meta: meta, tables: tables, url: location.href };
  }

  /* ── Ingest ─────────────────────────────────────────────── */
  ingestBtn.addEventListener('click', function () {
    showResult('X-raying page data\u2026');
    var pageData = gatherPageData();
    chrome.runtime.sendMessage({ action: 'ingestPage', pageData: pageData }, function (resp) {
      if (resp && resp.success) {
        var d = resp.data;
        var summary = '\u2705 PAGE INGESTED\n\n';
        summary += 'Numbers found: ' + d.numbers.length + '\n';
        summary += 'Keywords: ' + d.keywords.slice(0, 8).map(function (k) { return k.word + '(' + k.count + ')'; }).join(', ') + '\n';
        summary += 'Entities: ' + d.entities.slice(0, 5).map(function (e) { return e.entity; }).join(', ') + '\n';
        summary += 'Sentiment: ' + d.sentiment.label + ' (' + d.sentiment.score + ')\n';
        summary += 'Noise: ' + d.noiseScore.level + ' (CV=' + d.noiseScore.coefficientOfVariation + ')\n\n';
        summary += '\uD83D\uDD2C X-RAY FUNDAMENTALS\n';
        summary += 'Signal strength: ' + d.fundamentals.strength + '\n';
        summary += 'Signals: ' + d.fundamentals.signalCount + ' / Noise: ' + d.fundamentals.noiseCount + '\n';
        summary += 'Mean: ' + d.fundamentals.mean + ' | \u03C3: ' + d.fundamentals.stddev + '\n';
        summary += 'SE: ' + d.fundamentals.stderror + ' | \u221AN: ' + d.fundamentals.sqrtN + '\n';
        summary += d.fundamentals.description;
        showResult(summary);
      } else {
        showResult('Error: ' + ((resp && resp.error) || 'No response'));
      }
    });
  });

  /* ── Query ──────────────────────────────────────────────── */
  queryInput.addEventListener('keypress', function (e) {
    if (e.key !== 'Enter') return;
    var q = queryInput.value.trim();
    if (!q) return;
    chrome.runtime.sendMessage({ action: 'queryKnowledge', query: q }, function (resp) {
      if (resp && resp.success) showResult(resp.data);
      else showResult('Error: ' + ((resp && resp.error) || 'No response'));
    });
  });
})();
