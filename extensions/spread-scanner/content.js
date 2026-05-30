/* Spread Scanner — Content Script / JARVIS Panel (EXT-022) */

(function () {
  'use strict';
  if (document.getElementById('spread-scanner-panel')) return;

  var ACCENT = '#00e676';
  var BG = '#0d1117';
  var BG_LIGHT = '#161b22';
  var BORDER = '#30363d';
  var TEXT = '#e6edf3';
  var TEXT_DIM = '#8b949e';
  var collapsed = false;

  /* ── Panel Creation ──────────────────────────────────────── */
  var panel = document.createElement('div');
  panel.id = 'spread-scanner-panel';
  panel.style.cssText = 'position:fixed;top:80px;right:20px;width:380px;background:' + BG +
    ';color:' + TEXT + ';border:1px solid ' + BORDER + ';border-radius:12px;font-family:' +
    '"SF Mono",Consolas,monospace;font-size:12px;z-index:2147483647;box-shadow:0 8px 32px rgba(0,0,0,0.6);' +
    'user-select:none;overflow:hidden;transition:height 0.3s ease;';

  /* ── Header ──────────────────────────────────────────────── */
  var header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;' +
    'background:' + BG_LIGHT + ';border-bottom:1px solid ' + BORDER + ';cursor:move;';
  header.innerHTML = '<span style="font-weight:700;color:' + ACCENT + ';font-size:13px;">📊 Spread Scanner</span>';

  var toggleBtn = document.createElement('span');
  toggleBtn.textContent = '▼';
  toggleBtn.style.cssText = 'cursor:pointer;color:' + TEXT_DIM + ';font-size:14px;padding:0 4px;';
  toggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    toggleBtn.textContent = collapsed ? '▶' : '▼';
  });
  header.appendChild(toggleBtn);
  panel.appendChild(header);

  /* ── Body ────────────────────────────────────────────────── */
  var body = document.createElement('div');
  body.style.cssText = 'padding:10px 14px;max-height:520px;overflow-y:auto;';

  // Auto-scan button
  var scanBtn = document.createElement('button');
  scanBtn.textContent = '⚡ Auto-Scan Page';
  scanBtn.style.cssText = 'width:100%;padding:8px;background:' + ACCENT + ';color:#000;border:none;' +
    'border-radius:6px;font-weight:700;cursor:pointer;font-family:inherit;font-size:12px;margin-bottom:8px;';
  scanBtn.addEventListener('click', autoScan);
  body.appendChild(scanBtn);

  // Paste data area
  var pasteLabel = document.createElement('div');
  pasteLabel.textContent = 'Paste numbers (one per line):';
  pasteLabel.style.cssText = 'color:' + TEXT_DIM + ';margin-bottom:4px;font-size:11px;';
  body.appendChild(pasteLabel);

  var textarea = document.createElement('textarea');
  textarea.id = 'spread-scanner-textarea';
  textarea.placeholder = '100.5\n101.2\n99.8\n102.1';
  textarea.style.cssText = 'width:100%;height:70px;background:' + BG_LIGHT + ';color:' + TEXT +
    ';border:1px solid ' + BORDER + ';border-radius:6px;padding:6px;font-family:inherit;font-size:11px;' +
    'resize:vertical;box-sizing:border-box;margin-bottom:6px;';
  body.appendChild(textarea);

  var analyzeBtn = document.createElement('button');
  analyzeBtn.textContent = '🔬 Analyze Pasted Data';
  analyzeBtn.style.cssText = 'width:100%;padding:7px;background:transparent;color:' + ACCENT +
    ';border:1px solid ' + ACCENT + ';border-radius:6px;font-weight:600;cursor:pointer;font-family:inherit;' +
    'font-size:12px;margin-bottom:10px;';
  analyzeBtn.addEventListener('click', analyzePasted);
  body.appendChild(analyzeBtn);

  // Results panel
  var results = document.createElement('div');
  results.id = 'spread-scanner-results';
  results.style.cssText = 'font-size:11px;line-height:1.6;';
  results.innerHTML = '<span style="color:' + TEXT_DIM + '">Ready — scan a page or paste data</span>';
  body.appendChild(results);

  panel.appendChild(body);
  document.body.appendChild(panel);

  /* ── Drag Behavior ───────────────────────────────────────── */
  var isDragging = false;
  var dragX = 0;
  var dragY = 0;
  header.addEventListener('mousedown', function (e) {
    if (e.target === toggleBtn) return;
    isDragging = true;
    dragX = e.clientX - panel.getBoundingClientRect().left;
    dragY = e.clientY - panel.getBoundingClientRect().top;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onDragEnd);
    e.preventDefault();
  });
  function onDrag(e) {
    if (!isDragging) return;
    var x = e.clientX - dragX;
    var y = e.clientY - dragY;
    x = Math.max(0, Math.min(x, window.innerWidth - panel.offsetWidth));
    y = Math.max(0, Math.min(y, window.innerHeight - panel.offsetHeight));
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
    panel.style.right = 'auto';
  }
  function onDragEnd() {
    isDragging = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onDragEnd);
  }

  /* ── Text Selection Capture ──────────────────────────────── */
  document.addEventListener('mouseup', function () {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    var text = sel.toString().trim();
    if (!text) return;
    var nums = text.split(/[\n\r,;\s\t]+/).filter(function (s) {
      return /^[-+]?\d{1,3}(?:,?\d{3})*(?:\.\d+)?$/.test(s.replace(/,/g, ''));
    });
    if (nums.length >= 2) {
      textarea.value = nums.join('\n');
      flashBorder(textarea);
    }
  });

  /* ── Helper: send message to background ──────────────────── */
  function sendMsg(payload, cb) {
    try {
      chrome.runtime.sendMessage(payload, function (resp) {
        if (chrome.runtime.lastError) {
          cb({ error: chrome.runtime.lastError.message });
          return;
        }
        cb(resp && resp.data ? resp.data : resp);
      });
    } catch (e) {
      cb({ error: e.message });
    }
  }

  /* ── Auto-Scan ───────────────────────────────────────────── */
  function autoScan() {
    scanBtn.textContent = '⏳ Scanning…';
    var pageText = document.body.innerText || '';
    sendMsg({ action: 'scanForNumbers', text: pageText }, function (extracted) {
      if (!extracted || extracted.error || extracted.length === 0) {
        showResults('<span style="color:#f85149">No numbers found on page</span>');
        scanBtn.textContent = '⚡ Auto-Scan Page';
        return;
      }
      var values = extracted.map(function (e) { return e.value; });
      runFullAnalysis(values, extracted.length);
      scanBtn.textContent = '⚡ Auto-Scan Page';
    });
  }

  /* ── Analyze Pasted Data ─────────────────────────────────── */
  function analyzePasted() {
    var text = textarea.value.trim();
    if (!text) return;
    var values = text.split(/[\n\r,;\s\t]+/).map(function (s) {
      return parseFloat(s.replace(/,/g, ''));
    }).filter(function (n) { return !isNaN(n); });
    if (values.length < 2) {
      showResults('<span style="color:#f85149">Need at least 2 numbers</span>');
      return;
    }
    runFullAnalysis(values, values.length);
  }

  /* ── Full Analysis Pipeline ──────────────────────────────── */
  function runFullAnalysis(values, extractedCount) {
    var html = '<div style="color:' + ACCENT + ';font-weight:700;margin-bottom:6px;">SCAN RESULTS</div>';
    html += '<div style="color:' + TEXT_DIM + '">Extracted: <strong style="color:' + TEXT + '">' + extractedCount + '</strong> values</div>';
    var pending = 3;

    function checkDone() {
      pending--;
      if (pending <= 0) showResults(html);
    }

    // Statistics
    sendMsg({ action: 'calculateStatistics', values: values }, function (stats) {
      if (stats && !stats.error) {
        html += sectionHeader('📈 Statistics');
        html += statLine('Mean', stats.mean);
        html += statLine('Median', stats.median);
        html += statLine('Std Dev (σ)', stats.stddev);
        html += statLine('Skewness', stats.skewness);
        html += statLine('Kurtosis', stats.kurtosis);
        html += statLine('CV%', stats.coefficientOfVariation);
        html += statLine('Range', stats.range);
      }
      // Score
      sendMsg({ action: 'scoreArbitrageOpportunity', values: values, labels: [] }, function (score) {
        if (score && !score.error) {
          var gradeColor = score.grade === 'A' ? '#00e676' : score.grade === 'B' ? '#69f0ae' :
            score.grade === 'C' ? '#ffd740' : score.grade === 'D' ? '#ff9100' : '#f85149';
          html += sectionHeader('🎯 Arbitrage Score');
          html += '<div style="font-size:28px;font-weight:900;color:' + gradeColor + ';text-align:center;' +
            'margin:6px 0;">' + score.grade + ' <span style="font-size:14px;color:' + TEXT_DIM + '">' +
            score.score + '/100</span></div>';
          html += '<div style="color:' + TEXT_DIM + ';margin-bottom:4px;">' + score.reasoning + '</div>';
          html += '<div style="color:' + ACCENT + ';font-weight:600;">→ ' + score.recommended_action + '</div>';
        }
        checkDone();
      });
    });

    // Spreads
    sendMsg({ action: 'detectSpreads', values: values.slice(0, 50) }, function (spreads) {
      if (spreads && !spreads.error && spreads.length > 0) {
        var anomalies = spreads.filter(function (s) { return s.isAnomaly; });
        html += sectionHeader('💰 Spread Anomalies (' + anomalies.length + '/' + spreads.length + ')');
        anomalies.slice(0, 5).forEach(function (s) {
          html += '<div style="padding:3px 0;border-bottom:1px solid ' + BORDER + ';">' +
            '<span style="color:' + ACCENT + '">φ=' + s.phiScore.toFixed(2) + '</span> ' +
            s.valA.toFixed(2) + ' ↔ ' + s.valB.toFixed(2) +
            ' <span style="color:' + TEXT_DIM + '">(z=' + s.zScore.toFixed(2) + ')</span></div>';
        });
      }
      checkDone();
    });

    // Patterns
    sendMsg({ action: 'findPatterns', values: values }, function (patterns) {
      if (patterns && !patterns.error && patterns.length > 0) {
        html += sectionHeader('🔍 Patterns (' + patterns.length + ')');
        patterns.slice(0, 6).forEach(function (p) {
          var icon = p.type === 'mean_reversion' ? '↩️' : p.type === 'momentum' ? '🚀' :
            p.type === 'cluster' ? '🎯' : '🔄';
          html += '<div style="padding:3px 0;border-bottom:1px solid ' + BORDER + ';">' +
            icon + ' <span style="color:' + ACCENT + '">' + (p.confidence * 100).toFixed(0) +
            '%</span> ' + p.description + '</div>';
        });
      }
      checkDone();
    });
  }

  /* ── UI Helpers ──────────────────────────────────────────── */
  function sectionHeader(title) {
    return '<div style="color:' + ACCENT + ';font-weight:700;margin-top:10px;margin-bottom:4px;' +
      'border-top:1px solid ' + BORDER + ';padding-top:8px;">' + title + '</div>';
  }

  function statLine(label, value) {
    return '<div style="display:flex;justify-content:space-between;"><span style="color:' + TEXT_DIM +
      '">' + label + '</span><span>' + (typeof value === 'number' ? value.toFixed(4) : value) + '</span></div>';
  }

  function showResults(html) {
    results.innerHTML = html;
  }

  function flashBorder(el) {
    el.style.borderColor = ACCENT;
    setTimeout(function () { el.style.borderColor = BORDER; }, 600);
  }

  console.log('[Spread Scanner] JARVIS panel injected — ready to scan');
})();
