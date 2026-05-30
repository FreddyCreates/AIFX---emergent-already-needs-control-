/* Signal Relay Adapter — Interface Layer (EXT-040) */

(function () {
  'use strict';

  var PANEL_ID = 'signal-relay-adapter-panel';
  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  var ACCENT = '#e94560';
  var ACCENT_GRAD = 'linear-gradient(135deg, #e94560, #c41c3c)';

  var state = { collapsed: false, dragging: false, dragOffset: { x: 0, y: 0 } };

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    var container = document.createElement('div');
    container.id = PANEL_ID;
    Object.assign(container.style, {
      position: 'fixed', bottom: '20px', right: '20px',
      width: '340px', maxHeight: '500px',
      backgroundColor: '#0d1117', color: '#e0e0e0',
      border: '1px solid ' + ACCENT, borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(233,69,96,0.4)',
      fontFamily: '"Segoe UI", -apple-system, sans-serif',
      fontSize: '13px', zIndex: '2147483647',
      overflow: 'hidden', display: 'flex', flexDirection: 'column'
    });

    var header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', background: ACCENT_GRAD, cursor: 'grab', userSelect: 'none'
    });

    var title = document.createElement('span');
    title.textContent = '\u26A1 Signal Relay';
    title.style.fontWeight = '700';

    var pulseDot = document.createElement('span');
    Object.assign(pulseDot.style, {
      width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e',
      boxShadow: '0 0 6px #22c55e', display: 'inline-block'
    });
    setInterval(function () {
      pulseDot.style.opacity = pulseDot.style.opacity === '0.3' ? '1' : '0.3';
    }, 873);

    var toggle = document.createElement('button');
    Object.assign(toggle.style, { background: 'none', border: 'none', color: '#e0e0e0', fontSize: '16px', cursor: 'pointer' });
    toggle.textContent = '\u2796';

    header.appendChild(title);
    header.appendChild(pulseDot);
    header.appendChild(toggle);
    container.appendChild(header);

    header.addEventListener('mousedown', function (e) {
      if (e.target === toggle || e.target === pulseDot) return;
      state.dragging = true;
      state.dragOffset.x = e.clientX - container.getBoundingClientRect().left;
      state.dragOffset.y = e.clientY - container.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', function (e) {
      if (!state.dragging) return;
      container.style.left = (e.clientX - state.dragOffset.x) + 'px';
      container.style.top = (e.clientY - state.dragOffset.y) + 'px';
      container.style.right = 'auto'; container.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', function () { state.dragging = false; });

    var body = document.createElement('div');
    body.style.padding = '12px'; body.style.overflowY = 'auto'; body.style.flex = '1';

    var signalTypeRow = document.createElement('div');
    Object.assign(signalTypeRow.style, { display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' });

    var types = ['threat', 'memory', 'route', 'context', 'data', 'emergence'];
    types.forEach(function (t) {
      var chip = document.createElement('span');
      chip.textContent = t;
      Object.assign(chip.style, {
        padding: '2px 8px', borderRadius: '10px', background: '#3a1520',
        color: ACCENT, fontSize: '10px', fontWeight: '600', cursor: 'pointer',
        border: '1px solid ' + ACCENT + '44'
      });
      chip.dataset.type = t;
      chip.addEventListener('click', function () {
        chip.style.background = chip.style.background === '#3a1520' ? ACCENT : '#3a1520';
        chip.style.color = chip.style.color === '#fff' ? ACCENT : '#fff';
      });
      signalTypeRow.appendChild(chip);
    });
    body.appendChild(signalTypeRow);

    var btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginBottom: '8px' });

    function makeBtn(label, color) {
      var b = document.createElement('button');
      b.textContent = label;
      Object.assign(b.style, {
        flex: '1', padding: '8px 0', border: 'none', borderRadius: '6px',
        backgroundColor: color, color: '#fff', fontWeight: '600', fontSize: '12px', cursor: 'pointer'
      });
      b.addEventListener('mouseenter', function () { b.style.opacity = '0.85'; });
      b.addEventListener('mouseleave', function () { b.style.opacity = '1'; });
      return b;
    }

    var captureBtn = makeBtn('\u26A1 Capture Signal', ACCENT);
    var relayBtn = makeBtn('\uD83D\uDD04 Relay All', '#7c3aed');
    var stateBtn = makeBtn('\uD83D\uDCCA State', '#0ea5e9');

    btnRow.appendChild(captureBtn);
    btnRow.appendChild(relayBtn);
    btnRow.appendChild(stateBtn);
    body.appendChild(btnRow);

    var results = document.createElement('div');
    Object.assign(results.style, {
      padding: '8px', backgroundColor: '#1a0a10',
      borderRadius: '6px', minHeight: '36px', maxHeight: '240px',
      overflowY: 'auto', fontSize: '12px', lineHeight: '1.5',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'none'
    });
    body.appendChild(results);
    container.appendChild(body);

    toggle.addEventListener('click', function () {
      state.collapsed = !state.collapsed;
      body.style.display = state.collapsed ? 'none' : 'flex';
      body.style.flexDirection = 'column';
      toggle.textContent = state.collapsed ? '\u2795' : '\u2796';
    });

    function show(data) {
      results.style.display = 'block';
      results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    captureBtn.addEventListener('click', function () {
      // Capture a page-context intelligence signal
      var activeType = 'data';
      signalTypeRow.querySelectorAll('span').forEach(function (chip) {
        if (chip.style.color === '#fff') activeType = chip.dataset.type;
      });
      var signal = {
        type: activeType,
        source: 'context-bridge',
        payload: { url: location.href, title: document.title, ts: Date.now() },
        priority: 0.7
      };
      chrome.runtime.sendMessage({ action: 'capture', signal: signal }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    relayBtn.addEventListener('click', function () {
      show('\uD83D\uDD04 Relaying signals...');
      chrome.runtime.sendMessage({ action: 'relay' }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    stateBtn.addEventListener('click', function () {
      chrome.runtime.sendMessage({ action: 'getState' }, function (r) {
        if (chrome.runtime.lastError) { show('Error: ' + chrome.runtime.lastError.message); return; }
        show(r);
      });
    });

    return container;
  }

  if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(buildPanel());
  }
})();
