/* Windows Notification Cortex — Interface Layer (EXT-W003) */

(function () {
  'use strict';

  var PANEL_ID = 'windows-notification-cortex-panel';

  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  var panel = {
    id: PANEL_ID,
    title: '\uD83D\uDD14 Notification Cortex',
    theme: {
      background: '#1a1a2e',
      foreground: '#e0e0e0',
      accent: '#ff8c00',
      accentGradient: 'linear-gradient(135deg, #ff8c00, #e67700)',
      surface: '#16213e',
      border: '#ff8c00'
    }
  };

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    var container = document.createElement('div');
    container.id = panel.id;
    Object.assign(container.style, {
      position: 'fixed', bottom: '20px', right: '20px', width: '370px', maxHeight: '500px',
      backgroundColor: panel.theme.background, color: panel.theme.foreground,
      border: '1px solid ' + panel.theme.border, borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(255,140,0,0.35)',
      fontFamily: '"Segoe UI", sans-serif', fontSize: '13px',
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
    var toggle = document.createElement('button');
    Object.assign(toggle.style, { background: 'none', border: 'none', color: '#e0e0e0', fontSize: '16px', cursor: 'pointer', padding: '0 4px' });
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
    ['GPT', 'Claude', 'Inflection'].forEach(function (e) {
      var chip = document.createElement('span');
      chip.textContent = e;
      Object.assign(chip.style, { padding: '3px 8px', borderRadius: '12px', backgroundColor: '#ff8c00', color: '#fff', fontSize: '11px', fontWeight: '600' });
      engineRow.appendChild(chip);
    });
    body.appendChild(engineRow);

    var textarea = document.createElement('textarea');
    Object.assign(textarea.style, {
      width: '100%', height: '72px', backgroundColor: panel.theme.surface,
      color: panel.theme.foreground, border: '1px solid #444', borderRadius: '6px',
      padding: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
    });
    textarea.placeholder = 'Enter notification content to compose or score\u2026';
    body.appendChild(textarea);

    var btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '8px', marginTop: '8px' });

    function makeButton(label, color) {
      var btn = document.createElement('button');
      btn.textContent = label;
      Object.assign(btn.style, { flex: '1', padding: '8px 0', border: 'none', borderRadius: '6px', backgroundColor: color, color: '#fff', fontWeight: '600', fontSize: '12px', cursor: 'pointer' });
      return btn;
    }

    var composeBtn = makeButton('\u270D Compose', '#ff8c00');
    var scoreBtn = makeButton('\uD83D\uDCCA Score', '#e94560');

    btnRow.appendChild(composeBtn);
    btnRow.appendChild(scoreBtn);
    body.appendChild(btnRow);

    var results = document.createElement('div');
    Object.assign(results.style, {
      marginTop: '10px', padding: '8px', backgroundColor: '#0f3460', borderRadius: '6px',
      minHeight: '40px', maxHeight: '220px', overflowY: 'auto', fontSize: '12px',
      lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'none'
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

    composeBtn.addEventListener('click', function () {
      var text = textarea.value.trim();
      if (!text) { showResult('Please enter notification content.'); return; }
      if (typeof globalThis.windowsNotificationCortex !== 'undefined') {
        showResult(globalThis.windowsNotificationCortex.compose('Alert', text, 'normal'));
      } else { showResult('Engine not loaded.'); }
    });

    scoreBtn.addEventListener('click', function () {
      var text = textarea.value.trim();
      if (!text) { showResult('Please enter content to score.'); return; }
      if (typeof globalThis.windowsNotificationCortex !== 'undefined') {
        showResult(globalThis.windowsNotificationCortex.scoreUrgency(text));
      } else { showResult('Engine not loaded.'); }
    });

    return container;
  }

  if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(buildPanel());
  }
})();
