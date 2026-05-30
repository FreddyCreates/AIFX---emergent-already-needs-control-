/* Screen Commander — Content Script (EXT-024) */

(function () {
  'use strict';

  var PANEL_ID = 'screen-commander-panel';
  if (document.getElementById(PANEL_ID)) return;

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', left: '20px', width: '360px',
    maxHeight: '520px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #58a6ff', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(88,166,255,0.35)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  /* Header */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #58a6ff, #1f6feb)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83E\uDD16 Screen Commander';
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';
  var toggle = document.createElement('button');
  Object.assign(toggle.style, { background: 'none', border: 'none', color: '#e0e0e0', fontSize: '16px', cursor: 'pointer', padding: '0 4px' });
  toggle.textContent = '\u2796';
  header.appendChild(title);
  header.appendChild(toggle);
  panel.appendChild(header);

  /* Body */
  var body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflowY = 'auto';
  body.style.flex = '1';

  /* Command input */
  var cmdInput = document.createElement('input');
  cmdInput.placeholder = 'Tell JARVIS what to do\u2026 e.g. "scroll down", "read #main"';
  Object.assign(cmdInput.style, {
    width: '100%', padding: '10px', backgroundColor: '#161b22', color: '#e0e0e0',
    border: '1px solid #58a6ff', borderRadius: '6px', fontSize: '13px',
    boxSizing: 'border-box', marginBottom: '8px'
  });
  body.appendChild(cmdInput);

  /* Quick action buttons */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' });

  function makeQBtn(label, cmd) {
    var b = document.createElement('button');
    b.textContent = label;
    Object.assign(b.style, {
      padding: '6px 10px', border: 'none', borderRadius: '4px',
      backgroundColor: '#21262d', color: '#58a6ff', fontSize: '11px',
      cursor: 'pointer', fontWeight: '600'
    });
    b.addEventListener('click', function () { cmdInput.value = cmd; executeCommand(cmd); });
    return b;
  }

  btnRow.appendChild(makeQBtn('\u2B07 Scroll Down', 'scroll down'));
  btnRow.appendChild(makeQBtn('\u2B06 Scroll Up', 'scroll up'));
  btnRow.appendChild(makeQBtn('\uD83D\uDC41 Read Page', 'read this page'));
  btnRow.appendChild(makeQBtn('\uD83D\uDD0D Find', 'find'));
  btnRow.appendChild(makeQBtn('\uD83D\uDCCA Extract Data', 'extract data'));
  btnRow.appendChild(makeQBtn('\uD83D\uDCDD Summarize', 'summarize'));
  body.appendChild(btnRow);

  /* Results */
  var results = document.createElement('div');
  Object.assign(results.style, {
    padding: '8px', backgroundColor: '#161b22', borderRadius: '6px',
    minHeight: '40px', maxHeight: '280px', overflowY: 'auto',
    fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    display: 'none'
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

  function executeCommand(cmd) {
    showResult('Processing: ' + cmd + '\u2026');
    chrome.runtime.sendMessage({ action: 'parseCommand', command: cmd }, function (resp) {
      if (!resp || !resp.success) { showResult('Error: ' + ((resp && resp.error) || 'No response')); return; }
      var act = resp.data.action;
      var parsed = resp.data.parsed;

      var out = '\uD83C\uDFAF Intent: ' + parsed.intent + ' (confidence: ' + parsed.confidence + ')\n';
      if (parsed.matchedKeywords.length > 0) out += 'Matched: ' + parsed.matchedKeywords.join(', ') + '\n';
      out += '\n';

      /* Execute on page */
      switch (act.type) {
        case 'scroll':
          var px = act.payload.pixels;
          var dir = act.payload.direction;
          if (dir === 'up') window.scrollBy({ top: -px, behavior: 'smooth' });
          else if (dir === 'left') window.scrollBy({ left: -px, behavior: 'smooth' });
          else if (dir === 'right') window.scrollBy({ left: px, behavior: 'smooth' });
          else window.scrollBy({ top: px, behavior: 'smooth' });
          out += '\u2705 Scrolled ' + dir + ' ' + px + 'px';
          break;
        case 'click':
          var el = act.payload.selector ? document.querySelector(act.payload.selector) : null;
          if (el) { el.click(); out += '\u2705 Clicked: ' + act.payload.selector; }
          else out += '\u274C Element not found: ' + act.payload.selector;
          break;
        case 'read':
          var readEl = act.payload.selector ? document.querySelector(act.payload.selector) : document.body;
          if (readEl) { var txt = readEl.innerText.substring(0, 1500); out += '\uD83D\uDCD6 Content:\n' + txt; }
          else out += '\u274C Element not found';
          break;
        case 'find':
          var found = window.find(act.payload.query || '');
          out += found ? '\u2705 Found and highlighted' : '\u274C Not found on page';
          break;
        case 'highlight':
          var hEl = act.payload.selector ? document.querySelector(act.payload.selector) : null;
          if (hEl) {
            hEl.style.outline = '3px solid #58a6ff';
            hEl.style.outlineOffset = '2px';
            hEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            out += '\u2705 Highlighted: ' + act.payload.selector;
          } else out += '\u274C Element not found';
          break;
        case 'navigate':
          if (act.payload.url) { window.location.href = act.payload.url; out += '\u2705 Navigating to: ' + act.payload.url; }
          else out += '\u274C No URL provided';
          break;
        case 'summarize':
          var sEl = act.payload.selector ? document.querySelector(act.payload.selector) : document.body;
          if (sEl) {
            var full = sEl.innerText;
            var sentences = full.split(/[.!?]+/).filter(function (s) { return s.trim().length > 20; });
            var summary = sentences.slice(0, 5).map(function (s) { return s.trim(); }).join('. ') + '.';
            out += '\uD83D\uDCDD Summary (' + sentences.length + ' sentences total, showing first 5):\n\n' + summary;
          } else out += '\u274C Element not found';
          break;
        case 'extract-data':
          var dEl = act.payload.selector ? document.querySelector(act.payload.selector) : document.body;
          if (dEl) {
            var nums = dEl.innerText.match(/[-+]?\d[\d,]*\.?\d*(?:[eE][-+]?\d+)?%?/g) || [];
            out += '\uD83D\uDCCA Extracted ' + nums.length + ' values:\n' + nums.slice(0, 30).join(', ');
          } else out += '\u274C Element not found';
          break;
        default:
          out += '\u2753 Unknown command. Try: scroll, read, click, find, highlight, navigate, summarize, extract data';
      }
      showResult(out);
    });
  }

  cmdInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') executeCommand(cmdInput.value.trim());
  });
})();
