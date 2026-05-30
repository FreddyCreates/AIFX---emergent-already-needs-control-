/* Protocol Bridge — Content Script (EXT-018) */

(function () {
  'use strict';

  var PANEL_ID = 'protocol-bridge-panel';
  if (document.getElementById(PANEL_ID)) return;

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '360px',
    maxHeight: '520px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #00bcd4', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,188,212,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83C\uDF10 Protocol Bridge';
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

  /* Protocol status grid */
  var statusGrid = document.createElement('div');
  Object.assign(statusGrid.style, {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '10px'
  });

  var protocolNames = [
    'sovereign-ai', 'neural-mesh', 'cognitive-bus', 'phi-stream', 'golden-relay',
    'heartbeat-sync', 'organism-state', 'model-fusion', 'edge-inference', 'sovereign-nexus'
  ];

  for (var p = 0; p < protocolNames.length; p++) {
    var cell = document.createElement('div');
    Object.assign(cell.style, {
      padding: '4px 6px', backgroundColor: '#161b22', borderRadius: '4px',
      fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px'
    });
    var dot = document.createElement('span');
    dot.style.display = 'inline-block';
    dot.style.width = '6px';
    dot.style.height = '6px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = '#00e676';
    cell.appendChild(dot);
    cell.appendChild(document.createTextNode(protocolNames[p]));
    statusGrid.appendChild(cell);
  }
  body.appendChild(statusGrid);

  /* Relay activity counters */
  var counters = document.createElement('div');
  Object.assign(counters.style, {
    display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '11px'
  });
  var encryptedCount = document.createElement('span');
  encryptedCount.textContent = '\uD83D\uDD12 Encrypted: 0';
  encryptedCount.style.color = '#00e676';
  var unencryptedCount = document.createElement('span');
  unencryptedCount.textContent = '\uD83D\uDD13 Plain: 0';
  unencryptedCount.style.color = '#ff9800';
  var totalRelays = document.createElement('span');
  totalRelays.textContent = '\u26A1 Relays: 0';
  totalRelays.style.color = '#00bcd4';
  counters.appendChild(encryptedCount);
  counters.appendChild(unencryptedCount);
  counters.appendChild(totalRelays);
  body.appendChild(counters);

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

  var discoverBtn = makeButton('\uD83D\uDD0D Discover', '#00bcd4');
  var relayBtn = makeButton('\u26A1 Relay', '#6c63ff');
  var latencyBtn = makeButton('\uD83D\uDCCA Latency', '#e94560');

  btnRow.appendChild(discoverBtn);
  btnRow.appendChild(relayBtn);
  btnRow.appendChild(latencyBtn);
  body.appendChild(btnRow);

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

  var relayCount = 0;
  var encCount = 0;
  var plainCount = 0;

  discoverBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'discoverProtocols' }, function (r) {
      showResult(r && r.success ? r.data : 'Error');
    });
  });

  relayBtn.addEventListener('click', function () {
    showResult('Relaying test message\u2026');
    chrome.runtime.sendMessage({
      action: 'relayMessage',
      fromProtocol: 'sovereign-ai',
      toProtocol: 'phi-stream',
      message: 'Test relay from content script at ' + new Date().toISOString()
    }, function (r) {
      if (r && r.success) {
        relayCount++;
        if (r.data.encrypted) encCount++;
        else plainCount++;
        encryptedCount.textContent = '\uD83D\uDD12 Encrypted: ' + encCount;
        unencryptedCount.textContent = '\uD83D\uDD13 Plain: ' + plainCount;
        totalRelays.textContent = '\u26A1 Relays: ' + relayCount;
        showResult(r.data);
      } else { showResult('Relay error'); }
    });
  });

  latencyBtn.addEventListener('click', function () {
    showResult('Measuring latency\u2026');
    chrome.runtime.sendMessage({ action: 'measureLatency', protocolId: 'sovereign-ai' }, function (r) {
      showResult(r && r.success ? r.data : 'Error');
    });
  });

})();
