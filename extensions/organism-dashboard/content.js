/* Organism Dashboard — Content Script (EXT-016) */

(function () {
  'use strict';

  var PANEL_ID = 'organism-dashboard-panel';
  if (document.getElementById(PANEL_ID)) return;

  var HEARTBEAT = 873;

  /* Floating widget */
  var widget = document.createElement('div');
  widget.id = PANEL_ID;
  Object.assign(widget.style, {
    position: 'fixed', bottom: '20px', left: '20px', width: '300px',
    backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #00e676', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,230,118,0.25)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '12px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  /* Header */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', background: 'linear-gradient(135deg, #00e676, #00897b)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.style.fontWeight = '700';
  title.style.fontSize = '13px';

  /* Heartbeat pulse animation */
  var pulse = document.createElement('span');
  pulse.textContent = '\u2764';
  pulse.style.marginRight = '6px';
  pulse.style.display = 'inline-block';
  title.appendChild(pulse);
  title.appendChild(document.createTextNode('Organism Dashboard'));

  var toggle = document.createElement('button');
  Object.assign(toggle.style, {
    background: 'none', border: 'none', color: '#e0e0e0',
    fontSize: '14px', cursor: 'pointer', padding: '0 4px'
  });
  toggle.textContent = '\u2796';
  header.appendChild(title);
  header.appendChild(toggle);
  widget.appendChild(header);

  var body = document.createElement('div');
  body.style.padding = '10px';

  /* Vitality score */
  var vitalityRow = document.createElement('div');
  Object.assign(vitalityRow.style, {
    textAlign: 'center', padding: '8px 0', fontSize: '24px', fontWeight: '700'
  });
  vitalityRow.id = 'od-vitality';
  vitalityRow.textContent = '--';
  body.appendChild(vitalityRow);

  var vitalityLabel = document.createElement('div');
  vitalityLabel.style.textAlign = 'center';
  vitalityLabel.style.fontSize = '11px';
  vitalityLabel.style.color = '#888';
  vitalityLabel.style.marginBottom = '10px';
  vitalityLabel.textContent = 'Vitality Score';
  body.appendChild(vitalityLabel);

  /* 4-register meters */
  var registers = ['cognitive', 'affective', 'somatic', 'sovereign'];
  var registerColors = ['#6c63ff', '#e94560', '#00d4aa', '#f5a623'];
  var meterEls = {};

  for (var i = 0; i < registers.length; i++) {
    var row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex', alignItems: 'center', marginBottom: '6px', gap: '8px'
    });

    var label = document.createElement('span');
    label.style.width = '70px';
    label.style.fontSize = '11px';
    label.style.textTransform = 'capitalize';
    label.textContent = registers[i];

    var barBg = document.createElement('div');
    Object.assign(barBg.style, {
      flex: '1', height: '8px', backgroundColor: '#161b22',
      borderRadius: '4px', overflow: 'hidden'
    });
    var barFill = document.createElement('div');
    Object.assign(barFill.style, {
      width: '0%', height: '100%', backgroundColor: registerColors[i],
      borderRadius: '4px', transition: 'width 0.5s ease'
    });
    barBg.appendChild(barFill);

    var val = document.createElement('span');
    val.style.width = '36px';
    val.style.textAlign = 'right';
    val.style.fontSize = '11px';
    val.textContent = '0%';

    row.appendChild(label);
    row.appendChild(barBg);
    row.appendChild(val);
    body.appendChild(row);

    meterEls[registers[i]] = { bar: barFill, value: val };
  }

  /* Sensor readings */
  var sensorHeader = document.createElement('div');
  Object.assign(sensorHeader.style, {
    fontSize: '11px', color: '#888', marginTop: '10px', marginBottom: '4px'
  });
  sensorHeader.textContent = 'Edge Sensors';
  body.appendChild(sensorHeader);

  var sensorGrid = document.createElement('div');
  Object.assign(sensorGrid.style, {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px'
  });
  var sensorNames = ['temperature', 'network', 'memory', 'cpu'];
  var sensorEmojis = { temperature: '\uD83C\uDF21', network: '\uD83C\uDF10', memory: '\uD83D\uDCBE', cpu: '\u2699' };
  var sensorEls = {};

  for (var s = 0; s < sensorNames.length; s++) {
    var cell = document.createElement('div');
    Object.assign(cell.style, {
      padding: '4px 6px', backgroundColor: '#161b22', borderRadius: '4px',
      fontSize: '11px'
    });
    cell.textContent = sensorEmojis[sensorNames[s]] + ' ' + sensorNames[s] + ': --';
    sensorGrid.appendChild(cell);
    sensorEls[sensorNames[s]] = cell;
  }
  body.appendChild(sensorGrid);

  widget.appendChild(body);
  document.body.appendChild(widget);

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
    isDragging = true; dx = e.clientX - widget.getBoundingClientRect().left;
    dy = e.clientY - widget.getBoundingClientRect().top;
    header.style.cursor = 'grabbing'; e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    widget.style.left = (e.clientX - dx) + 'px';
    widget.style.top = (e.clientY - dy) + 'px';
    widget.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', function () {
    if (isDragging) { isDragging = false; header.style.cursor = 'grab'; }
  });

  /* Heartbeat pulse animation */
  var pulseState = false;
  setInterval(function () {
    pulseState = !pulseState;
    pulse.style.transform = pulseState ? 'scale(1.3)' : 'scale(1)';
    pulse.style.transition = 'transform 0.3s ease';
  }, HEARTBEAT);

  /* Update loop */
  function updateDashboard() {
    chrome.runtime.sendMessage({ action: 'calculateVitality' }, function (r) {
      if (r && r.success) {
        var v = r.data;
        var vEl = document.getElementById('od-vitality');
        if (vEl) {
          vEl.textContent = (v.score * 100).toFixed(1) + '%';
          vEl.style.color = v.score > 0.7 ? '#00e676' : v.score > 0.5 ? '#ff9800' : '#e94560';
        }

        for (var reg in v.breakdown) {
          if (meterEls[reg]) {
            var pct = Math.round(v.breakdown[reg] * 100);
            meterEls[reg].bar.style.width = pct + '%';
            meterEls[reg].value.textContent = pct + '%';
          }
        }
      }
    });

    chrome.runtime.sendMessage({ action: 'readSensors' }, function (r) {
      if (r && r.success) {
        var s = r.data;
        if (sensorEls.temperature) sensorEls.temperature.textContent = sensorEmojis.temperature + ' temp: ' + s.temperature.status;
        if (sensorEls.network) sensorEls.network.textContent = sensorEmojis.network + ' net: ' + s.network.status;
        if (sensorEls.memory) sensorEls.memory.textContent = sensorEmojis.memory + ' mem: ' + s.memory.usagePercent + '%';
        if (sensorEls.cpu) sensorEls.cpu.textContent = sensorEmojis.cpu + ' cpu: ' + s.cpu.usagePercent + '%';
      }
    });
  }

  updateDashboard();
  setInterval(updateDashboard, HEARTBEAT * 3);

})();
