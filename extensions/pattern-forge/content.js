/* Pattern Forge — Content Script (EXT-025) */

(function () {
  'use strict';

  var PANEL_ID = 'pattern-forge-panel';
  if (document.getElementById(PANEL_ID)) return;

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '380px',
    maxHeight: '560px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #f778ba', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(247,120,186,0.35)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  /* Header */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #f778ba, #a371f7)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83D\uDD2C Pattern Forge';
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

  /* Data input */
  var textarea = document.createElement('textarea');
  textarea.placeholder = 'Paste numbers (one per line, or comma-separated)\u2026';
  Object.assign(textarea.style, {
    width: '100%', height: '60px', backgroundColor: '#161b22', color: '#e0e0e0',
    border: '1px solid #444', borderRadius: '6px', padding: '8px',
    fontSize: '12px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '8px'
  });
  body.appendChild(textarea);

  /* Buttons */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' });

  function makeBtn(label, color, action) {
    var b = document.createElement('button');
    b.textContent = label;
    Object.assign(b.style, {
      padding: '7px 10px', border: 'none', borderRadius: '5px',
      backgroundColor: color, color: '#fff', fontSize: '11px',
      cursor: 'pointer', fontWeight: '600', flex: '1'
    });
    b.addEventListener('click', function () { runAnalysis(action); });
    return b;
  }

  btnRow.appendChild(makeBtn('\uD83D\uDD2C X-Ray', '#f778ba', 'xrayDepth'));
  btnRow.appendChild(makeBtn('\uD83C\uDF10 Spectral', '#a371f7', 'spectralDecompose'));
  btnRow.appendChild(makeBtn('\u21A9 Reversion', '#58a6ff', 'meanReversion'));
  btnRow.appendChild(makeBtn('\u26A0 Anomalies', '#f0883e', 'detectAnomalies'));
  body.appendChild(btnRow);

  /* Auto-scan page button */
  var scanBtn = document.createElement('button');
  scanBtn.textContent = '\uD83D\uDCE1 X-Ray Page Numbers';
  Object.assign(scanBtn.style, {
    width: '100%', padding: '8px', border: 'none', borderRadius: '5px',
    backgroundColor: '#21262d', color: '#f778ba', fontSize: '12px',
    cursor: 'pointer', fontWeight: '600', marginBottom: '8px'
  });
  scanBtn.addEventListener('click', function () {
    var pageText = document.body.innerText;
    var matches = pageText.match(/[-+]?\d[\d,]*\.?\d*(?:[eE][-+]?\d+)?/g) || [];
    var nums = [];
    for (var i = 0; i < matches.length && nums.length < 200; i++) {
      var v = parseFloat(matches[i].replace(/,/g, ''));
      if (!isNaN(v) && isFinite(v) && Math.abs(v) > 0.001) nums.push(v);
    }
    textarea.value = nums.join('\n');
    showResult('Extracted ' + nums.length + ' values from page. Click an analysis button.');
  });
  body.appendChild(scanBtn);

  /* Results */
  var results = document.createElement('div');
  Object.assign(results.style, {
    padding: '8px', backgroundColor: '#161b22', borderRadius: '6px',
    minHeight: '40px', maxHeight: '320px', overflowY: 'auto',
    fontSize: '11px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
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

  /* Selection capture */
  document.addEventListener('mouseup', function (e) {
    if (panel.contains(e.target)) return;
    var sel = window.getSelection().toString().trim();
    if (sel.length > 0 && /\d/.test(sel)) textarea.value = sel;
  });

  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  function parseValues() {
    var raw = textarea.value.trim();
    if (!raw) return null;
    var parts = raw.split(/[\n,;\s]+/);
    var vals = [];
    for (var i = 0; i < parts.length; i++) {
      var v = parseFloat(parts[i].replace(/[,$%]/g, ''));
      if (!isNaN(v) && isFinite(v)) vals.push(v);
    }
    return vals.length > 0 ? vals : null;
  }

  function runAnalysis(action) {
    var vals = parseValues();
    if (!vals) { showResult('Paste or select numbers first.'); return; }
    showResult('Running ' + action + ' on ' + vals.length + ' values\u2026');
    chrome.runtime.sendMessage({ action: action, values: vals }, function (resp) {
      if (resp && resp.success) {
        var d = resp.data;
        var out = '';
        if (action === 'xrayDepth') {
          out = '\uD83D\uDD2C X-RAY DEPTH ANALYSIS\n\n';
          out += 'N=' + d.n + ' | \u221AN=' + d.sqrtN + '\n';
          out += 'Mean=' + d.mean + ' | \u03C3=' + d.stddev + ' | SE=' + d.stderror + '\n';
          out += 'Signals: ' + d.signalCount + ' | Noise: ' + d.noiseCount + ' | Ratio: ' + d.signalRatio + '\n\n';
          var sigs = d.depths.filter(function (x) { return x.isSignal; }).slice(0, 10);
          if (sigs.length > 0) {
            out += 'TOP SIGNALS (phi-depth > 1):\n';
            for (var s = 0; s < sigs.length; s++) {
              out += '  [' + sigs[s].index + '] ' + sigs[s].raw + ' z=' + sigs[s].zScore + ' ' + sigs[s].classification + '\n';
            }
          }
        } else if (action === 'spectralDecompose') {
          out = '\uD83C\uDF10 SPECTRAL DECOMPOSITION\n\n';
          out += 'Dominant period: ' + d.dominantPeriod + '\n';
          out += 'Spectral energy: ' + Math.round(d.spectralEnergy * 100) / 100 + '\n\n';
          out += 'TOP FREQUENCIES:\n';
          for (var f = 0; f < d.fundamentalFrequencies.length; f++) {
            var ff = d.fundamentalFrequencies[f];
            out += '  f=' + ff.frequency + ' mag=' + ff.magnitude + ' period=' + ff.period + (ff.isPhiResonant ? ' \u03C6-resonant' : '') + '\n';
          }
        } else if (action === 'meanReversion') {
          out = '\u21A9 MEAN REVERSION SCAN\n\n';
          out += 'Lookback: ' + d.lookback + ' | Points: ' + d.totalPoints + '\n';
          out += 'Extremes: ' + d.extremeCount + ' | Current: ' + d.currentSignal + '\n\n';
          var exs = d.extremes.slice(-8);
          if (exs.length > 0) {
            out += 'RECENT EXTREMES:\n';
            for (var e = 0; e < exs.length; e++) {
              out += '  [' + exs[e].index + '] ' + exs[e].value + ' z=' + exs[e].zScore + ' ' + exs[e].signal + ' \u2192 target ' + exs[e].revertTarget + '\n';
            }
          }
        } else if (action === 'detectAnomalies') {
          out = '\u26A0 ANOMALY DETECTION (IQR \u00D7 \u03C6)\n\n';
          out += 'Q1=' + d.q1 + ' Q3=' + d.q3 + ' IQR=' + d.iqr + '\n';
          out += 'Fences: [' + d.lowerFence + ', ' + d.upperFence + ']\n';
          out += 'Anomalies: ' + d.anomalyCount + '\n\n';
          for (var a = 0; a < d.anomalies.length && a < 15; a++) {
            out += '  [' + d.anomalies[a].index + '] ' + d.anomalies[a].value + ' ' + d.anomalies[a].type + '\n';
          }
        } else {
          out = JSON.stringify(d, null, 2);
        }
        showResult(out);
      } else {
        showResult('Error: ' + ((resp && resp.error) || 'No response'));
      }
    });
  }
})();
