/* Windows Terminal Forge — Interface Layer (EXT-W005) */

(function () {
  'use strict';

  var PANEL_ID = 'windows-terminal-forge-panel';

  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  var panel = {
    id: PANEL_ID,
    title: '\uD83D\uDCBB Terminal Forge',
    theme: {
      background: '#0c0c0c',
      foreground: '#cccccc',
      accent: '#61d6d6',
      accentGradient: 'linear-gradient(135deg, #61d6d6, #3da3a3)',
      surface: '#1e1e1e',
      border: '#61d6d6'
    }
  };

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    var container = document.createElement('div');
    container.id = panel.id;
    Object.assign(container.style, {
      position: 'fixed', bottom: '20px', right: '20px', width: '400px', maxHeight: '520px',
      backgroundColor: panel.theme.background, color: panel.theme.foreground,
      border: '1px solid ' + panel.theme.border, borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(97,214,214,0.35)',
      fontFamily: '"Cascadia Code", "Consolas", monospace', fontSize: '13px',
      zIndex: '2147483647', overflow: 'hidden', display: 'flex', flexDirection: 'column'
    });

    var header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', background: panel.theme.accentGradient,
      cursor: 'grab', userSelect: 'none'
    });
    var title = document.createElement('span');
    title.textContent = panel.title;
    title.style.fontWeight = '700';
    title.style.fontSize = '14px';
    title.style.color = '#0c0c0c';
    var toggle = document.createElement('button');
    Object.assign(toggle.style, { background: 'none', border: 'none', color: '#0c0c0c', fontSize: '16px', cursor: 'pointer', padding: '0 4px' });
    toggle.textContent = '\u2796';
    header.appendChild(title);
    header.appendChild(toggle);
    container.appendChild(header);

    var body = document.createElement('div');
    body.style.padding = '12px';
    body.style.overflowY = 'auto';
    body.style.flex = '1';

    var engineRow = document.createElement('div');
    Object.assign(engineRow.style, { display: 'flex', gap: '4px', marginBottom: '8px' });
    ['Codex', 'DeepSeek', 'Phi'].forEach(function (e) {
      var chip = document.createElement('span');
      chip.textContent = e;
      Object.assign(chip.style, { padding: '3px 8px', borderRadius: '12px', backgroundColor: '#3da3a3', color: '#fff', fontSize: '11px', fontWeight: '600' });
      engineRow.appendChild(chip);
    });
    body.appendChild(engineRow);

    var textarea = document.createElement('textarea');
    Object.assign(textarea.style, {
      width: '100%', height: '72px', backgroundColor: panel.theme.surface,
      color: panel.theme.foreground, border: '1px solid #444', borderRadius: '6px',
      padding: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box',
      fontFamily: '"Cascadia Code", "Consolas", monospace'
    });
    textarea.placeholder = 'Describe what you want to do in the terminal\u2026';
    body.appendChild(textarea);

    var btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '8px', marginTop: '8px' });

    function makeButton(label, color) {
      var btn = document.createElement('button');
      btn.textContent = label;
      Object.assign(btn.style, { flex: '1', padding: '8px 0', border: 'none', borderRadius: '6px', backgroundColor: color, color: '#fff', fontWeight: '600', fontSize: '12px', cursor: 'pointer' });
      return btn;
    }

    var genBtn = makeButton('\u26A1 Generate', '#61d6d6');
    genBtn.style.color = '#0c0c0c';
    var explainBtn = makeButton('\uD83D\uDCD6 Explain', '#0078d4');
    var routeBtn = makeButton('\uD83C\uDFAF Route', '#e94560');

    btnRow.appendChild(genBtn);
    btnRow.appendChild(explainBtn);
    btnRow.appendChild(routeBtn);
    body.appendChild(btnRow);

    var results = document.createElement('div');
    Object.assign(results.style, {
      marginTop: '10px', padding: '8px', backgroundColor: '#1e1e1e', borderRadius: '6px',
      minHeight: '40px', maxHeight: '220px', overflowY: 'auto', fontSize: '12px',
      lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'none',
      fontFamily: '"Cascadia Code", "Consolas", monospace'
    });
    body.appendChild(results);
    container.appendChild(body);

    var collapsed = false;
    toggle.addEventListener('click', function () {
      collapsed = !collapsed;
      body.style.display = collapsed ? 'none' : 'block';
      toggle.textContent = collapsed ? '\u2795' : '\u2796';
    });

    function showResult(data) {
      results.style.display = 'block';
      results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    genBtn.addEventListener('click', function () {
      var desc = textarea.value.trim();
      if (!desc) { showResult('Please describe what you need.'); return; }
      showResult('⏳ Generating...');
      chrome.runtime.sendMessage({ action: 'generateCommand', description: desc, shell: 'powershell' }, function (resp) {
        if (chrome.runtime.lastError) { showResult('Error: ' + chrome.runtime.lastError.message); return; }
        showResult(resp);
      });
    });

    explainBtn.addEventListener('click', function () {
      var cmd = textarea.value.trim();
      if (!cmd) { showResult('Please enter a command to explain.'); return; }
      showResult('⏳ Explaining...');
      chrome.runtime.sendMessage({ action: 'explainCommand', command: cmd, shell: 'powershell' }, function (resp) {
        if (chrome.runtime.lastError) { showResult('Error: ' + chrome.runtime.lastError.message); return; }
        showResult(resp);
      });
    });

    routeBtn.addEventListener('click', function () {
      var task = textarea.value.trim();
      if (!task) { showResult('Please enter a task.'); return; }
      showResult('⏳ Routing...');
      chrome.runtime.sendMessage({ action: 'routeToAlpha', task: task }, function (resp) {
        if (chrome.runtime.lastError) { showResult('Error: ' + chrome.runtime.lastError.message); return; }
        showResult(resp);
      });
    });

    return container;
  }

  if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(buildPanel());
  }
})();
