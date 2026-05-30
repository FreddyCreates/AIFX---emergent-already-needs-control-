/* Contract Forge — Content Script (EXT-015) */

(function () {
  'use strict';

  var PANEL_ID = 'contract-forge-panel';
  if (document.getElementById(PANEL_ID)) return;

  var RISK_COLORS = { high: '#e94560', medium: '#ff9800', low: '#28a745' };

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '380px',
    maxHeight: '560px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #f5a623', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(245,166,35,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #f5a623, #e67e22)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83D\uDCDC Contract Forge';
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

  /* Contract editor */
  var textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '100%', height: '100px', backgroundColor: '#161b22',
    color: '#e0e0e0', border: '1px solid #444', borderRadius: '6px',
    padding: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
  });
  textarea.placeholder = 'Enter contract terms or paste contract text\u2026';
  body.appendChild(textarea);

  /* Clause highlighting area */
  var clauseArea = document.createElement('div');
  Object.assign(clauseArea.style, {
    marginTop: '8px', maxHeight: '120px', overflowY: 'auto',
    fontSize: '11px', display: 'none'
  });
  body.appendChild(clauseArea);

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

  var draftBtn = makeButton('\uD83D\uDCDD Draft', '#f5a623');
  var analyzeBtn = makeButton('\uD83D\uDD0D Analyze', '#6c63ff');
  var signBtn = makeButton('\u270D Sign', '#28a745');

  btnRow.appendChild(draftBtn);
  btnRow.appendChild(analyzeBtn);
  btnRow.appendChild(signBtn);
  body.appendChild(btnRow);

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

  function showClauses(analysis) {
    clauseArea.style.display = 'block';
    clauseArea.innerHTML = '';
    var risks = analysis.risks || [];
    var riskIndices = {};
    for (var r = 0; r < risks.length; r++) {
      riskIndices[risks[r].clauseIndex] = risks[r].severity;
    }
    var clauses = analysis.clauses || [];
    for (var i = 0; i < Math.min(clauses.length, 10); i++) {
      var div = document.createElement('div');
      var riskLevel = riskIndices[i] || 'none';
      var color = RISK_COLORS[riskLevel] || '#444';
      Object.assign(div.style, {
        padding: '4px 8px', margin: '2px 0', borderLeft: '3px solid ' + color,
        backgroundColor: '#0d1117', borderRadius: '2px', fontSize: '11px'
      });
      div.textContent = '[' + clauses[i].type + '] ' + clauses[i].text.substring(0, 80);
      clauseArea.appendChild(div);
    }
  }

  draftBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter contract terms.'); return; }
    showResult('Drafting contract\u2026');
    chrome.runtime.sendMessage({ action: 'draftContract', terms: text, type: 'intelligence' },
      function (r) { showResult(r && r.success ? r.data : 'Error'); });
  });

  analyzeBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Paste contract text to analyze.'); return; }
    showResult('Analyzing contract\u2026');
    chrome.runtime.sendMessage({ action: 'analyzeContract', contractText: text },
      function (r) {
        if (r && r.success) {
          showClauses(r.data);
          showResult(r.data);
        } else { showResult('Error'); }
      });
  });

  signBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter contract to sign.'); return; }
    showResult('Signing contract\u2026');
    chrome.runtime.sendMessage({ action: 'signContract', contract: text, signerKey: 'user-sovereign-key' },
      function (r) { showResult(r && r.success ? r.data : 'Error'); });
  });

})();
