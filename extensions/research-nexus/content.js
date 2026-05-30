/**
 * Research Nexus — EXT-008 Content Script
 * Side panel for search-augmented research intelligence
 */

(function () {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  var panelVisible = false;
  var researchFindings = [];
  var detectedClaims = [];

  function createToggleButton() {
    var btn = document.createElement('div');
    btn.id = 'rn-toggle-btn';
    btn.textContent = '\uD83D\uDD2C Research';
    btn.style.cssText = [
      'position:fixed',
      'right:0',
      'top:50%',
      'transform:translateY(-50%)',
      'background:linear-gradient(135deg,#1a1a2e,#16213e)',
      'color:#e8d44d',
      'padding:12px 8px',
      'border-radius:8px 0 0 8px',
      'cursor:pointer',
      'z-index:2147483646',
      'font-size:14px',
      'font-family:system-ui,sans-serif',
      'writing-mode:vertical-rl',
      'text-orientation:mixed',
      'box-shadow:-2px 0 10px rgba(0,0,0,0.3)',
      'transition:all 0.3s ease',
      'user-select:none'
    ].join(';');

    btn.addEventListener('mouseenter', function () {
      btn.style.padding = '14px 10px';
      btn.style.boxShadow = '-4px 0 15px rgba(232,212,77,0.3)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.padding = '12px 8px';
      btn.style.boxShadow = '-2px 0 10px rgba(0,0,0,0.3)';
    });
    btn.addEventListener('click', function () {
      togglePanel();
    });

    document.body.appendChild(btn);
    return btn;
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.id = 'rn-panel';
    panel.style.cssText = [
      'position:fixed',
      'top:0',
      'right:-300px',
      'width:300px',
      'height:100vh',
      'background:#0d1117',
      'color:#c9d1d9',
      'z-index:2147483647',
      'transition:right 0.35s cubic-bezier(0.4,0,0.2,1)',
      'box-shadow:-4px 0 20px rgba(0,0,0,0.5)',
      'font-family:system-ui,-apple-system,sans-serif',
      'font-size:13px',
      'display:flex',
      'flex-direction:column',
      'overflow:hidden'
    ].join(';');

    panel.innerHTML = buildPanelHTML();
    document.body.appendChild(panel);
    attachPanelEvents(panel);
    return panel;
  }

  function buildPanelHTML() {
    return [
      '<div style="padding:12px 14px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0">',
      '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">',
      '    <span style="font-size:15px;font-weight:600;color:#e8d44d">\uD83D\uDD2C Research Nexus</span>',
      '    <span id="rn-close" style="cursor:pointer;color:#8b949e;font-size:18px;line-height:1">&times;</span>',
      '  </div>',
      '  <input id="rn-query" type="text" placeholder="Enter research query..." style="',
      '    width:100%;box-sizing:border-box;padding:8px 10px;background:#0d1117;border:1px solid #30363d;',
      '    border-radius:6px;color:#c9d1d9;font-size:13px;outline:none',
      '  " />',
      '  <button id="rn-synthesize" style="',
      '    width:100%;margin-top:8px;padding:8px;background:linear-gradient(135deg,#1a1a2e,#16213e);',
      '    color:#e8d44d;border:1px solid #30363d;border-radius:6px;cursor:pointer;font-size:13px;',
      '    font-weight:600;transition:opacity 0.2s',
      '  ">Synthesize</button>',
      '</div>',
      '<div style="flex:1;overflow-y:auto;padding:0">',
      '  <div id="rn-claims-section" style="padding:10px 14px;border-bottom:1px solid #30363d">',
      '    <div style="font-weight:600;color:#e8d44d;margin-bottom:6px">\uD83D\uDCCB Claims Detected</div>',
      '    <button id="rn-scan-claims" style="',
      '      width:100%;padding:6px;background:#21262d;color:#c9d1d9;border:1px solid #30363d;',
      '      border-radius:4px;cursor:pointer;font-size:12px;transition:opacity 0.2s',
      '    ">Scan Page for Claims</button>',
      '    <div id="rn-claims-list" style="margin-top:8px;max-height:150px;overflow-y:auto"></div>',
      '  </div>',
      '  <div id="rn-citations-section" style="padding:10px 14px;border-bottom:1px solid #30363d">',
      '    <div style="font-weight:600;color:#e8d44d;margin-bottom:6px">\uD83D\uDD17 Citation Links</div>',
      '    <div id="rn-citations-list" style="max-height:120px;overflow-y:auto;color:#8b949e;font-size:12px">',
      '      No citations discovered yet.',
      '    </div>',
      '  </div>',
      '  <div id="rn-digest-section" style="padding:10px 14px;border-bottom:1px solid #30363d">',
      '    <div style="font-weight:600;color:#e8d44d;margin-bottom:6px">\uD83D\uDCD6 Research Digest</div>',
      '    <div id="rn-digest-content" style="max-height:200px;overflow-y:auto;font-size:12px;color:#8b949e;line-height:1.5">',
      '      Run a synthesis to build your research digest.',
      '    </div>',
      '  </div>',
      '  <div id="rn-sources-section" style="padding:10px 14px">',
      '    <div style="font-weight:600;color:#e8d44d;margin-bottom:6px">\uD83C\uDFAF Source Rankings</div>',
      '    <div id="rn-sources-list" style="max-height:150px;overflow-y:auto;font-size:12px"></div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function attachPanelEvents(panel) {
    var closeBtn = panel.querySelector('#rn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        togglePanel();
      });
    }

    var queryInput = panel.querySelector('#rn-query');
    var synthesizeBtn = panel.querySelector('#rn-synthesize');
    if (synthesizeBtn) {
      synthesizeBtn.addEventListener('click', function () {
        var query = queryInput ? queryInput.value.trim() : '';
        if (query) {
          runSynthesis(query);
        }
      });
    }

    if (queryInput) {
      queryInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var query = queryInput.value.trim();
          if (query) {
            runSynthesis(query);
          }
        }
      });
    }

    var scanBtn = panel.querySelector('#rn-scan-claims');
    if (scanBtn) {
      scanBtn.addEventListener('click', function () {
        scanPageForClaims();
      });
    }
  }

  function togglePanel() {
    var panel = document.getElementById('rn-panel');
    var toggle = document.getElementById('rn-toggle-btn');
    if (!panel) return;

    panelVisible = !panelVisible;
    if (panelVisible) {
      panel.style.right = '0px';
      if (toggle) toggle.style.right = '300px';
    } else {
      panel.style.right = '-300px';
      if (toggle) toggle.style.right = '0px';
    }
  }

  function runSynthesis(query) {
    var synthesizeBtn = document.getElementById('rn-synthesize');
    if (synthesizeBtn) {
      synthesizeBtn.textContent = 'Synthesizing...';
      synthesizeBtn.style.opacity = '0.6';
    }

    chrome.runtime.sendMessage(
      { action: 'synthesizeResearch', query: query },
      function (response) {
        if (synthesizeBtn) {
          synthesizeBtn.textContent = 'Synthesize';
          synthesizeBtn.style.opacity = '1';
        }

        if (response && response.success) {
          var data = response.data;
          researchFindings.push(data);
          updateDigest(data);
          updateCitations(data.sources);
          updateSourceRankings(data.sources);
          runDigestGeneration(query);
        }
      }
    );
  }

  function runDigestGeneration(topic) {
    chrome.runtime.sendMessage(
      { action: 'generateDigest', topic: topic, depth: 'detailed' },
      function (response) {
        if (response && response.success) {
          var digest = response.data.digest;
          var container = document.getElementById('rn-digest-content');
          if (!container) return;

          var html = '<div style="margin-bottom:6px;font-weight:600;color:#c9d1d9">' + escapeHTML(digest.title) + '</div>';
          html += '<div style="margin-bottom:8px;color:#8b949e">' + escapeHTML(digest.summary) + '</div>';

          for (var s = 0; s < digest.sections.length; s++) {
            var sec = digest.sections[s];
            html += '<div style="margin-top:6px;font-weight:600;color:#58a6ff;font-size:11px">' + escapeHTML(sec.heading) + '</div>';
            html += '<div style="color:#8b949e;margin-bottom:4px">' + escapeHTML(sec.content.substring(0, 200)) + '...</div>';
          }

          container.innerHTML = html;
        }
      }
    );
  }

  function updateDigest(data) {
    var container = document.getElementById('rn-digest-content');
    if (!container) return;

    var html = '<div style="margin-bottom:6px;font-weight:600;color:#c9d1d9">Latest Synthesis</div>';
    html += '<div style="margin-bottom:4px">Confidence: <span style="color:#e8d44d">' + (data.confidence * 100).toFixed(1) + '%</span></div>';
    html += '<div style="margin-bottom:4px">Sub-questions: ' + data.subQuestions.length + '</div>';

    for (var i = 0; i < Math.min(data.subQuestions.length, 3); i++) {
      html += '<div style="color:#58a6ff;font-size:11px;margin:2px 0">\u2022 ' + escapeHTML(data.subQuestions[i]) + '</div>';
    }

    container.innerHTML = html;
  }

  function updateCitations(sources) {
    var container = document.getElementById('rn-citations-list');
    if (!container) return;

    var html = '';
    for (var i = 0; i < sources.length; i++) {
      var src = sources[i];
      html += '<div style="padding:4px 0;border-bottom:1px solid #21262d">';
      html += '<div style="color:#58a6ff">' + escapeHTML(src.title) + '</div>';
      html += '<div style="color:#8b949e;font-size:11px">Relevance: ' + (src.relevance * 100).toFixed(1) + '%</div>';
      html += '</div>';
    }

    container.innerHTML = html || 'No citations discovered yet.';
  }

  function updateSourceRankings(sources) {
    var sourcesForRanking = sources.map(function (s, idx) {
      return {
        name: s.title,
        recency: Math.max(0.3, 1 - idx * 0.15),
        authority: Math.max(0.2, s.relevance),
        relevance: s.relevance,
        citationCount: Math.floor((sources.length - idx) * 12)
      };
    });

    chrome.runtime.sendMessage(
      { action: 'rankSources', sources: sourcesForRanking },
      function (response) {
        var container = document.getElementById('rn-sources-list');
        if (!container) return;

        if (response && response.success) {
          var ranked = response.data;
          var html = '';
          for (var i = 0; i < ranked.length; i++) {
            var item = ranked[i];
            var barWidth = Math.round(item.score * 100 / (ranked[0] ? ranked[0].score : 1));
            html += '<div style="padding:4px 0;border-bottom:1px solid #21262d">';
            html += '<div style="display:flex;justify-content:space-between">';
            html += '<span style="color:#c9d1d9">' + escapeHTML(item.source.name) + '</span>';
            html += '<span style="color:#e8d44d;font-weight:600">' + item.score.toFixed(4) + '</span>';
            html += '</div>';
            html += '<div style="background:#21262d;height:4px;border-radius:2px;margin-top:3px">';
            html += '<div style="background:linear-gradient(90deg,#e8d44d,#58a6ff);height:100%;border-radius:2px;width:' + barWidth + '%"></div>';
            html += '</div></div>';
          }
          container.innerHTML = html || 'No sources ranked yet.';
        }
      }
    );
  }

  function scanPageForClaims() {
    detectedClaims = [];
    var paragraphs = document.querySelectorAll('p, li, td, h1, h2, h3, h4, h5, h6');
    var claimPatterns = [
      /\d+(\.\d+)?%/,
      /\$[\d,.]+/,
      /\b\d{4,}\b/,
      /\b(study|research|data|evidence|shows?|proves?|found|indicates?|demonstrates?|according to|reported|statistics?)\b/i,
      /\b(always|never|every|all|none|most|majority|significantly|dramatically)\b/i
    ];

    paragraphs.forEach(function (el) {
      var text = el.textContent || '';
      var sentences = text.match(/[^.!?]+[.!?]+/g) || [];

      sentences.forEach(function (sentence) {
        var trimmed = sentence.trim();
        if (trimmed.length < 20) return;

        var matchCount = 0;
        for (var p = 0; p < claimPatterns.length; p++) {
          if (claimPatterns[p].test(trimmed)) matchCount++;
        }

        if (matchCount >= 1) {
          detectedClaims.push({ text: trimmed, element: el, matches: matchCount });
        }
      });
    });

    highlightClaims();
    renderClaimsList();
  }

  function highlightClaims() {
    var existing = document.querySelectorAll('.rn-claim-highlight');
    existing.forEach(function (el) {
      var parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent), el);
      }
    });

    for (var i = 0; i < detectedClaims.length; i++) {
      var claim = detectedClaims[i];
      var el = claim.element;
      var html = el.innerHTML;
      var escapedClaim = escapeRegExp(claim.text);

      var wrapped = '<span class="rn-claim-highlight" data-claim-index="' + i + '" style="'
        + 'border-bottom:2px dashed #e8d44d;cursor:pointer;position:relative'
        + '">' + claim.text
        + '<span class="rn-fact-check-btn" data-claim-index="' + i + '" style="'
        + 'display:none;position:absolute;bottom:100%;left:0;background:#161b22;'
        + 'color:#e8d44d;padding:2px 8px;border-radius:4px;font-size:11px;'
        + 'white-space:nowrap;cursor:pointer;border:1px solid #30363d;z-index:999999'
        + '">\u2713 Fact Check</span></span>';

      var regex = new RegExp(escapedClaim, '');
      if (regex.test(html)) {
        el.innerHTML = html.replace(regex, wrapped);
      }
    }

    document.addEventListener('mouseover', function (e) {
      var highlight = e.target.closest('.rn-claim-highlight');
      if (highlight) {
        var btn = highlight.querySelector('.rn-fact-check-btn');
        if (btn) btn.style.display = 'block';
      }
    });

    document.addEventListener('mouseout', function (e) {
      var highlight = e.target.closest('.rn-claim-highlight');
      if (highlight) {
        var related = e.relatedTarget;
        if (!highlight.contains(related)) {
          var btn = highlight.querySelector('.rn-fact-check-btn');
          if (btn) btn.style.display = 'none';
        }
      }
    });

    document.addEventListener('click', function (e) {
      var factBtn = e.target.closest('.rn-fact-check-btn');
      if (factBtn) {
        e.preventDefault();
        e.stopPropagation();
        var index = parseInt(factBtn.getAttribute('data-claim-index'), 10);
        if (detectedClaims[index]) {
          runFactCheck(detectedClaims[index].text, index);
        }
      }
    });
  }

  function renderClaimsList() {
    var container = document.getElementById('rn-claims-list');
    if (!container) return;

    if (detectedClaims.length === 0) {
      container.innerHTML = '<div style="color:#8b949e;font-size:12px">No claims detected. Try scanning the page.</div>';
      return;
    }

    var html = '<div style="color:#8b949e;font-size:11px;margin-bottom:4px">' + detectedClaims.length + ' claims found</div>';
    var displayCount = Math.min(detectedClaims.length, 10);
    for (var i = 0; i < displayCount; i++) {
      var claim = detectedClaims[i];
      var truncated = claim.text.length > 80 ? claim.text.substring(0, 80) + '...' : claim.text;
      html += '<div style="padding:4px 0;border-bottom:1px solid #21262d;font-size:11px">';
      html += '<div style="color:#c9d1d9">' + escapeHTML(truncated) + '</div>';
      html += '<div style="display:flex;justify-content:space-between;margin-top:2px">';
      html += '<span style="color:#8b949e">Signals: ' + claim.matches + '</span>';
      html += '<span class="rn-check-claim" data-idx="' + i + '" style="color:#e8d44d;cursor:pointer">\u2713 Check</span>';
      html += '</div></div>';
    }

    if (detectedClaims.length > 10) {
      html += '<div style="color:#8b949e;font-size:11px;margin-top:4px">...and ' + (detectedClaims.length - 10) + ' more</div>';
    }

    container.innerHTML = html;

    container.addEventListener('click', function (e) {
      var checkBtn = e.target.closest('.rn-check-claim');
      if (checkBtn) {
        var idx = parseInt(checkBtn.getAttribute('data-idx'), 10);
        if (detectedClaims[idx]) {
          runFactCheck(detectedClaims[idx].text, idx);
        }
      }
    });
  }

  function runFactCheck(claimText, index) {
    chrome.runtime.sendMessage(
      { action: 'factCheck', claim: claimText },
      function (response) {
        if (response && response.success) {
          showFactCheckResult(response.data, index);
        }
      }
    );
  }

  function showFactCheckResult(result, index) {
    var container = document.getElementById('rn-claims-list');
    if (!container) return;

    var verdictColors = {
      'true': '#3fb950',
      'false': '#f85149',
      'partially_true': '#d29922',
      'unverifiable': '#8b949e'
    };

    var verdictColor = verdictColors[result.verdict] || '#8b949e';

    var html = '<div style="background:#161b22;border:1px solid #30363d;border-radius:6px;padding:8px;margin-bottom:8px">';
    html += '<div style="font-weight:600;color:' + verdictColor + ';margin-bottom:4px">';
    html += result.verdict.toUpperCase().replace('_', ' ') + ' (' + (result.confidence * 100).toFixed(1) + '% confidence)';
    html += '</div>';

    for (var v = 0; v < result.modelVerdicts.length; v++) {
      var mv = result.modelVerdicts[v];
      html += '<div style="font-size:11px;margin:2px 0;color:#8b949e">';
      html += '<span style="color:#58a6ff">' + escapeHTML(mv.model) + '</span>: ' + mv.verdict;
      html += '</div>';
    }

    html += '</div>';

    var existingContent = container.innerHTML;
    container.innerHTML = html + existingContent;
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function init() {
    if (document.getElementById('rn-panel')) return;
    createToggleButton();
    createPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
