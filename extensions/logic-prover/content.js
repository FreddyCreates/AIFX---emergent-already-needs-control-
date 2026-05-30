/* Logic Prover — Content Script (EXT-012) */

(function () {
  'use strict';

  var PANEL_ID = 'logic-prover-panel';
  if (document.getElementById(PANEL_ID)) return;

  /* Detect math expressions on page */
  var mathPatterns = /(\$\$.+?\$\$|\\\(.+?\\\)|\\begin\{equation\}|\\frac|\\sum|\\int|\bx\^2\b)/;

  function scanForMath() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var mathNodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (mathPatterns.test(node.textContent)) {
        mathNodes.push(node);
      }
    }
    return mathNodes;
  }

  /* Add verify badges to detected math */
  function addVerifyBadges() {
    var nodes = scanForMath();
    for (var i = 0; i < nodes.length; i++) {
      var parent = nodes[i].parentElement;
      if (!parent || parent.querySelector('.lp-verify-badge')) continue;

      var badge = document.createElement('span');
      badge.className = 'lp-verify-badge';
      Object.assign(badge.style, {
        display: 'inline-block', marginLeft: '6px', padding: '2px 8px',
        backgroundColor: '#6c63ff', color: '#fff', borderRadius: '10px',
        fontSize: '10px', fontWeight: '600', cursor: 'pointer', verticalAlign: 'middle'
      });
      badge.textContent = '\u2713 Verify';
      badge.setAttribute('data-math', nodes[i].textContent.trim().substring(0, 200));
      badge.addEventListener('click', function (e) {
        var mathText = e.target.getAttribute('data-math');
        textarea.value = mathText;
        showResult('Verifying\u2026');
        chrome.runtime.sendMessage(
          { action: 'evaluateComplexity', problem: mathText },
          function (r) { showResult(r && r.success ? r.data : 'Error'); }
        );
      });
      parent.appendChild(badge);
    }
  }

  /* Panel */
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '370px',
    maxHeight: '540px', backgroundColor: '#0f0e17', color: '#e0e0e0',
    border: '1px solid #6c63ff', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(108,99,255,0.35)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83D\uDD23 Logic Prover';
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

  var textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '100%', height: '64px', backgroundColor: '#1a1a2e',
    color: '#e0e0e0', border: '1px solid #444', borderRadius: '6px',
    padding: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
  });
  textarea.placeholder = 'Enter a math expression or theorem\u2026';
  body.appendChild(textarea);

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

  var parseBtn = makeButton('\uD83D\uDD0D Parse', '#6c63ff');
  var proveBtn = makeButton('\u2696 Prove', '#e94560');
  var complexBtn = makeButton('\uD83D\uDCCA Complexity', '#28a745');

  btnRow.appendChild(parseBtn);
  btnRow.appendChild(proveBtn);
  btnRow.appendChild(complexBtn);
  body.appendChild(btnRow);

  /* Proof expansion area */
  var results = document.createElement('div');
  Object.assign(results.style, {
    marginTop: '10px', padding: '8px', backgroundColor: '#1a1a2e',
    borderRadius: '6px', minHeight: '40px', maxHeight: '240px',
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

  parseBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter a math expression.'); return; }
    chrome.runtime.sendMessage({ action: 'parseExpression', mathText: text },
      function (r) { showResult(r && r.success ? r.data : 'Error'); });
  });

  proveBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter a theorem to prove.'); return; }
    showResult('Generating proof chain\u2026');
    chrome.runtime.sendMessage({ action: 'generateProofChain', theorem: text },
      function (r) { showResult(r && r.success ? r.data : 'Error'); });
  });

  complexBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter a problem.'); return; }
    chrome.runtime.sendMessage({ action: 'evaluateComplexity', problem: text },
      function (r) { showResult(r && r.success ? r.data : 'Error'); });
  });

  /* Scan page for math on load */
  setTimeout(addVerifyBadges, 1500);

})();
