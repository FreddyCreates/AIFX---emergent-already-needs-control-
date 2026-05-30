/* Data Alchemist — Content Script (EXT-010) */

(function () {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  var state = {
    absorbed: false,
    graphVisible: false,
    sidebarVisible: false,
    graphData: null,
    digestData: null,
    animationFrame: null
  };

  // ── Absorb Button ──────────────────────────────────────────────────────

  function createAbsorbButton() {
    var btn = document.createElement('button');
    btn.id = 'da-absorb-btn';
    btn.textContent = '⚗️ Absorb';
    btn.style.cssText = [
      'position:fixed', 'top:16px', 'right:16px', 'z-index:2147483647',
      'padding:10px 18px', 'border:none', 'border-radius:8px',
      'background:linear-gradient(135deg,#6c5ce7,#a29bfe)', 'color:#fff',
      'font:600 14px/1 -apple-system,BlinkMacSystemFont,sans-serif',
      'cursor:pointer', 'box-shadow:0 4px 14px rgba(108,92,231,0.4)',
      'transition:all 0.3s ease', 'user-select:none'
    ].join(';');

    btn.addEventListener('mouseenter', function () {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 6px 20px rgba(108,92,231,0.6)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 14px rgba(108,92,231,0.4)';
    });

    btn.addEventListener('click', function () {
      if (state.absorbed) {
        toggleSidebar();
        return;
      }
      startAbsorption();
    });

    document.body.appendChild(btn);
    return btn;
  }

  function startAbsorption() {
    var btn = document.getElementById('da-absorb-btn');
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = '⚗️ Absorbing...';
    btn.style.opacity = '0.8';

    showProgressOverlay();

    var pageContent = {
      title: document.title || '',
      body: document.body ? document.body.innerHTML : '',
      meta: extractMeta(),
      url: window.location.href
    };

    var fullContent = pageContent.title + '\n\n' + pageContent.body;

    var stages = ['intake', 'extract', 'classify', 'index', 'absorb'];
    var stageIndex = 0;

    var stageInterval = setInterval(function () {
      if (stageIndex < stages.length) {
        updateProgress(stages[stageIndex], stageIndex, stages.length);
        stageIndex++;
      }
    }, HEARTBEAT / 3);

    chrome.runtime.sendMessage(
      { action: 'absorbPage', url: pageContent.url, content: fullContent },
      function (response) {
        clearInterval(stageInterval);

        if (response && response.success) {
          state.absorbed = true;
          state.digestData = null;
          completeProgress();

          setTimeout(function () {
            hideProgressOverlay();
            showSuccessAnimation(btn, response.data);
            requestDigest(fullContent);
            requestKnowledgeGraph(fullContent);
          }, 600);
        } else {
          hideProgressOverlay();
          btn.textContent = '⚗️ Error';
          btn.style.background = 'linear-gradient(135deg,#d63031,#e17055)';
          setTimeout(function () {
            btn.textContent = '⚗️ Absorb';
            btn.style.background = 'linear-gradient(135deg,#6c5ce7,#a29bfe)';
            btn.disabled = false;
            btn.style.opacity = '1';
          }, 2000);
        }
      }
    );
  }

  function extractMeta() {
    var meta = {};
    var tags = document.querySelectorAll('meta[name], meta[property]');
    tags.forEach(function (tag) {
      var name = tag.getAttribute('name') || tag.getAttribute('property') || '';
      var content = tag.getAttribute('content') || '';
      if (name && content) meta[name] = content;
    });
    return meta;
  }

  function showSuccessAnimation(btn, data) {
    btn.textContent = '⚗️ Absorbed ✓';
    btn.style.background = 'linear-gradient(135deg,#00b894,#55efc4)';
    btn.disabled = false;
    btn.style.opacity = '1';

    var badge = document.createElement('span');
    badge.style.cssText = [
      'position:fixed', 'top:60px', 'right:16px', 'z-index:2147483647',
      'padding:8px 14px', 'border-radius:6px',
      'background:rgba(0,0,0,0.85)', 'color:#55efc4',
      'font:12px/1.4 monospace', 'pointer-events:none',
      'transition:opacity 0.5s'
    ].join(';');
    badge.textContent = data.entities + ' entities · ' + data.classification + ' · ' +
      data.pipelineStages.length + ' stages';
    document.body.appendChild(badge);

    setTimeout(function () {
      badge.style.opacity = '0';
      setTimeout(function () { badge.remove(); }, 500);
    }, 3000);

    setTimeout(function () {
      btn.textContent = '⚗️ View Digest';
      btn.style.background = 'linear-gradient(135deg,#6c5ce7,#a29bfe)';
    }, 2000);
  }

  // ── Progress Overlay ───────────────────────────────────────────────────

  function showProgressOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'da-progress-overlay';
    overlay.style.cssText = [
      'position:fixed', 'top:60px', 'right:16px', 'z-index:2147483646',
      'width:260px', 'padding:16px', 'border-radius:10px',
      'background:rgba(0,0,0,0.9)', 'color:#fff',
      'font:13px/1.5 -apple-system,BlinkMacSystemFont,sans-serif',
      'box-shadow:0 8px 32px rgba(0,0,0,0.4)'
    ].join(';');

    overlay.innerHTML = '<div style="font-weight:600;margin-bottom:10px">⚗️ Absorption Pipeline</div>' +
      '<div id="da-progress-stages"></div>' +
      '<div id="da-progress-bar" style="margin-top:10px;height:4px;border-radius:2px;background:#333">' +
      '<div id="da-progress-fill" style="height:100%;width:0;border-radius:2px;background:linear-gradient(90deg,#6c5ce7,#a29bfe);transition:width 0.4s ease"></div>' +
      '</div>';

    document.body.appendChild(overlay);
  }

  function updateProgress(stageName, index, total) {
    var stagesEl = document.getElementById('da-progress-stages');
    var fillEl = document.getElementById('da-progress-fill');
    if (!stagesEl || !fillEl) return;

    var icons = { intake: '📥', extract: '🔍', classify: '🏷️', index: '📐', absorb: '🧬' };
    var stageDiv = document.createElement('div');
    stageDiv.style.cssText = 'display:flex;align-items:center;gap:8px;margin:4px 0;color:#a29bfe';
    stageDiv.innerHTML = '<span>' + (icons[stageName] || '⚙️') + '</span><span>' + stageName + '</span>' +
      '<span style="margin-left:auto;font-size:11px;color:#888">processing…</span>';
    stagesEl.appendChild(stageDiv);

    fillEl.style.width = (((index + 1) / total) * 100) + '%';
  }

  function completeProgress() {
    var fillEl = document.getElementById('da-progress-fill');
    if (fillEl) {
      fillEl.style.width = '100%';
      fillEl.style.background = 'linear-gradient(90deg,#00b894,#55efc4)';
    }
  }

  function hideProgressOverlay() {
    var overlay = document.getElementById('da-progress-overlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.3s';
      overlay.style.opacity = '0';
      setTimeout(function () { overlay.remove(); }, 300);
    }
  }

  // ── Knowledge Graph Visualization ──────────────────────────────────────

  function requestKnowledgeGraph(content) {
    chrome.runtime.sendMessage(
      { action: 'extractEntities', text: content.substring(0, 10000) },
      function (response) {
        if (response && response.success) {
          chrome.runtime.sendMessage(
            { action: 'buildKnowledgeGraph', entities: response.data.entities, relations: [] },
            function (graphResponse) {
              if (graphResponse && graphResponse.success) {
                state.graphData = graphResponse.data;
              }
            }
          );
        }
      }
    );
  }

  function toggleGraph() {
    if (state.graphVisible) {
      hideGraph();
    } else {
      showGraph();
    }
  }

  function showGraph() {
    if (!state.graphData || state.graphData.nodes.length === 0) return;
    state.graphVisible = true;

    var container = document.createElement('div');
    container.id = 'da-graph-overlay';
    container.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'width:100vw', 'height:100vh',
      'z-index:2147483640', 'background:rgba(0,0,0,0.85)',
      'display:flex', 'align-items:center', 'justify-content:center'
    ].join(';');

    var canvas = document.createElement('canvas');
    canvas.id = 'da-graph-canvas';
    canvas.width = Math.min(window.innerWidth * 0.8, 1200);
    canvas.height = Math.min(window.innerHeight * 0.8, 800);
    canvas.style.cssText = 'border-radius:12px;background:#1a1a2e;cursor:grab';
    container.appendChild(canvas);

    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = [
      'position:absolute', 'top:20px', 'right:20px', 'z-index:2147483641',
      'width:36px', 'height:36px', 'border:none', 'border-radius:50%',
      'background:rgba(255,255,255,0.15)', 'color:#fff',
      'font:18px/1 sans-serif', 'cursor:pointer'
    ].join(';');
    closeBtn.addEventListener('click', hideGraph);
    container.appendChild(closeBtn);

    var tooltip = document.createElement('div');
    tooltip.id = 'da-graph-tooltip';
    tooltip.style.cssText = [
      'position:absolute', 'display:none', 'padding:8px 12px',
      'border-radius:6px', 'background:rgba(0,0,0,0.9)', 'color:#fff',
      'font:12px/1.4 monospace', 'pointer-events:none', 'z-index:2147483642'
    ].join(';');
    container.appendChild(tooltip);

    document.body.appendChild(container);

    runForceDirectedLayout(canvas, state.graphData, tooltip);
  }

  function hideGraph() {
    state.graphVisible = false;
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }
    var overlay = document.getElementById('da-graph-overlay');
    if (overlay) overlay.remove();
  }

  function runForceDirectedLayout(canvas, graphData, tooltip) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    var typeColors = {
      person: '#3498db',
      org: '#2ecc71',
      location: '#e74c3c',
      date: '#9b59b6',
      monetary: '#f39c12',
      percentage: '#1abc9c',
      email: '#e67e22',
      url: '#34495e',
      technical: '#fd79a8'
    };

    // Initialize positions
    var positions = {};
    var velocities = {};
    graphData.nodes.forEach(function (node, i) {
      var angle = i * GOLDEN_ANGLE * (Math.PI / 180);
      var r = 50 + Math.sqrt(i) * 30;
      positions[node.id] = { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
      velocities[node.id] = { vx: 0, vy: 0 };
    });

    var edgeMap = {};
    graphData.edges.forEach(function (edge) {
      edgeMap[edge.source + '-' + edge.target] = edge;
    });

    function simulate() {
      var damping = 0.92;
      var repulsion = 3000;
      var attraction = 0.005;
      var centerGravity = 0.01;

      // Repulsion between all node pairs
      for (var i = 0; i < graphData.nodes.length; i++) {
        var a = graphData.nodes[i];
        var pa = positions[a.id];
        for (var j = i + 1; j < graphData.nodes.length; j++) {
          var b = graphData.nodes[j];
          var pb = positions[b.id];
          var dx = pa.x - pb.x;
          var dy = pa.y - pb.y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          var force = repulsion / (dist * dist);
          var fx = (dx / dist) * force;
          var fy = (dy / dist) * force;
          velocities[a.id].vx += fx;
          velocities[a.id].vy += fy;
          velocities[b.id].vx -= fx;
          velocities[b.id].vy -= fy;
        }
      }

      // Attraction along edges
      graphData.edges.forEach(function (edge) {
        var pa = positions[edge.source];
        var pb = positions[edge.target];
        if (!pa || !pb) return;
        var dx = pb.x - pa.x;
        var dy = pb.y - pa.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var force = dist * attraction * (edge.weight || 1);
        var fx = (dx / dist) * force;
        var fy = (dy / dist) * force;
        velocities[edge.source].vx += fx;
        velocities[edge.source].vy += fy;
        velocities[edge.target].vx -= fx;
        velocities[edge.target].vy -= fy;
      });

      // Center gravity & update positions
      graphData.nodes.forEach(function (node) {
        var p = positions[node.id];
        var v = velocities[node.id];
        v.vx += (W / 2 - p.x) * centerGravity;
        v.vy += (H / 2 - p.y) * centerGravity;
        v.vx *= damping;
        v.vy *= damping;
        p.x += v.vx;
        p.y += v.vy;
        p.x = Math.max(30, Math.min(W - 30, p.x));
        p.y = Math.max(30, Math.min(H - 30, p.y));
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw edges
      ctx.lineWidth = 1;
      graphData.edges.forEach(function (edge) {
        var pa = positions[edge.source];
        var pb = positions[edge.target];
        if (!pa || !pb) return;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = Math.min(edge.weight * 2, 4);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      // Draw nodes
      graphData.nodes.forEach(function (node) {
        var p = positions[node.id];
        var radius = 6 + node.centrality * 80;
        radius = Math.max(4, Math.min(radius, 24));
        var color = typeColors[node.type] || '#95a5a6';

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        if (radius > 8) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.label.substring(0, 16), p.x, p.y + radius + 14);
        }
      });
    }

    function animate() {
      simulate();
      draw();
      state.animationFrame = requestAnimationFrame(animate);
    }

    // Click-to-inspect node
    canvas.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;

      var closest = null;
      var closestDist = Infinity;
      graphData.nodes.forEach(function (node) {
        var p = positions[node.id];
        var d = Math.sqrt((p.x - mx) * (p.x - mx) + (p.y - my) * (p.y - my));
        if (d < closestDist && d < 30) {
          closestDist = d;
          closest = node;
        }
      });

      if (closest) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 12) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
        tooltip.innerHTML = '<strong>' + closest.label + '</strong><br>' +
          'Type: ' + closest.type + '<br>' +
          'Centrality: ' + (closest.centrality * 100).toFixed(2) + '%';
      } else {
        tooltip.style.display = 'none';
      }
    });

    animate();
  }

  // ── Digest Sidebar ─────────────────────────────────────────────────────

  function requestDigest(content) {
    chrome.runtime.sendMessage(
      { action: 'generateDigest', content: content.substring(0, 15000), format: 'detailed' },
      function (response) {
        if (response && response.success) {
          state.digestData = response.data;
        }
      }
    );
  }

  function toggleSidebar() {
    if (state.sidebarVisible) {
      hideSidebar();
    } else {
      showSidebar();
    }
  }

  function showSidebar() {
    if (!state.digestData) return;
    state.sidebarVisible = true;

    var sidebar = document.createElement('div');
    sidebar.id = 'da-sidebar';
    sidebar.style.cssText = [
      'position:fixed', 'top:0', 'right:0', 'width:380px', 'height:100vh',
      'z-index:2147483645', 'background:#16213e', 'color:#e0e0e0',
      'font:14px/1.6 -apple-system,BlinkMacSystemFont,sans-serif',
      'overflow-y:auto', 'box-shadow:-4px 0 24px rgba(0,0,0,0.5)',
      'transform:translateX(100%)', 'transition:transform 0.35s ease'
    ].join(';');

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'padding:20px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center';
    header.innerHTML = '<span style="font-size:18px;font-weight:700">⚗️ Page Digest</span>';
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'border:none;background:none;color:#fff;font-size:18px;cursor:pointer;padding:4px 8px';
    closeBtn.addEventListener('click', hideSidebar);
    header.appendChild(closeBtn);
    sidebar.appendChild(header);

    // Confidence bar
    var confBar = document.createElement('div');
    confBar.style.cssText = 'padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.1)';
    var confPct = Math.round(state.digestData.confidence * 100);
    confBar.innerHTML = '<div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:4px">Confidence</div>' +
      '<div style="height:6px;border-radius:3px;background:#333">' +
      '<div style="height:100%;width:' + confPct + '%;border-radius:3px;background:linear-gradient(90deg,#6c5ce7,#a29bfe)"></div>' +
      '</div><div style="text-align:right;font-size:11px;color:#a29bfe;margin-top:2px">' + confPct + '%</div>';
    sidebar.appendChild(confBar);

    // Digest content
    var digestSection = document.createElement('div');
    digestSection.style.cssText = 'padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1)';
    digestSection.innerHTML = '<div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:8px">Digest (' + state.digestData.format + ')</div>' +
      '<div style="font-size:13px;line-height:1.7;color:#ccc;white-space:pre-wrap">' + escapeHtml(state.digestData.digest) + '</div>';
    sidebar.appendChild(digestSection);

    // Key findings
    if (state.digestData.keyFindings && state.digestData.keyFindings.length > 0) {
      var findingsSection = document.createElement('div');
      findingsSection.style.cssText = 'padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1)';
      var findingsHtml = '<div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:8px">Key Findings</div><ul style="margin:0;padding:0 0 0 18px">';
      state.digestData.keyFindings.forEach(function (f) {
        findingsHtml += '<li style="margin:6px 0;font-size:13px;color:#ddd">' + escapeHtml(f) + '</li>';
      });
      findingsHtml += '</ul>';
      findingsSection.innerHTML = findingsHtml;
      sidebar.appendChild(findingsSection);
    }

    // Entity summary
    if (state.digestData.entities && state.digestData.entities.length > 0) {
      var entitySection = document.createElement('div');
      entitySection.style.cssText = 'padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1)';
      var typeCounts = {};
      state.digestData.entities.forEach(function (e) {
        typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
      });
      var entityHtml = '<div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:8px">Entity Summary</div>';
      entityHtml += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
      var typeColorMap = {
        person: '#3498db', org: '#2ecc71', location: '#e74c3c', date: '#9b59b6',
        monetary: '#f39c12', percentage: '#1abc9c', email: '#e67e22', url: '#34495e', technical: '#fd79a8'
      };
      Object.keys(typeCounts).forEach(function (type) {
        var color = typeColorMap[type] || '#95a5a6';
        entityHtml += '<span style="padding:3px 10px;border-radius:12px;font-size:12px;background:' + color + '22;color:' + color + ';border:1px solid ' + color + '44">' + type + ': ' + typeCounts[type] + '</span>';
      });
      entityHtml += '</div>';
      entitySection.innerHTML = entityHtml;
      sidebar.appendChild(entitySection);
    }

    // Actions
    var actionsSection = document.createElement('div');
    actionsSection.style.cssText = 'padding:16px 20px;display:flex;gap:10px;flex-wrap:wrap';

    var exportBtn = document.createElement('button');
    exportBtn.textContent = '📥 Export Digest';
    exportBtn.style.cssText = [
      'flex:1', 'padding:10px', 'border:1px solid rgba(108,92,231,0.5)',
      'border-radius:6px', 'background:rgba(108,92,231,0.15)', 'color:#a29bfe',
      'font:600 13px sans-serif', 'cursor:pointer'
    ].join(';');
    exportBtn.addEventListener('click', exportDigest);
    actionsSection.appendChild(exportBtn);

    var graphBtn = document.createElement('button');
    graphBtn.textContent = '🕸️ Knowledge Graph';
    graphBtn.style.cssText = [
      'flex:1', 'padding:10px', 'border:1px solid rgba(46,204,113,0.5)',
      'border-radius:6px', 'background:rgba(46,204,113,0.15)', 'color:#2ecc71',
      'font:600 13px sans-serif', 'cursor:pointer'
    ].join(';');
    graphBtn.addEventListener('click', function () {
      hideSidebar();
      toggleGraph();
    });
    actionsSection.appendChild(graphBtn);

    sidebar.appendChild(actionsSection);
    document.body.appendChild(sidebar);

    // Slide in
    requestAnimationFrame(function () {
      sidebar.style.transform = 'translateX(0)';
    });
  }

  function hideSidebar() {
    state.sidebarVisible = false;
    var sidebar = document.getElementById('da-sidebar');
    if (sidebar) {
      sidebar.style.transform = 'translateX(100%)';
      setTimeout(function () { sidebar.remove(); }, 350);
    }
  }

  function exportDigest() {
    if (!state.digestData) return;

    var lines = [
      '═══════════════════════════════════════════════',
      '  ⚗️ DATA ALCHEMIST — PAGE DIGEST',
      '═══════════════════════════════════════════════',
      '',
      'URL: ' + window.location.href,
      'Title: ' + document.title,
      'Date: ' + new Date().toISOString(),
      'Format: ' + state.digestData.format,
      'Confidence: ' + (state.digestData.confidence * 100).toFixed(1) + '%',
      'Words: ' + state.digestData.wordCount,
      '',
      '── DIGEST ──────────────────────────────────────',
      '',
      state.digestData.digest,
      ''
    ];

    if (state.digestData.keyFindings && state.digestData.keyFindings.length > 0) {
      lines.push('── KEY FINDINGS ────────────────────────────────');
      lines.push('');
      state.digestData.keyFindings.forEach(function (f, i) {
        lines.push('  ' + (i + 1) + '. ' + f);
      });
      lines.push('');
    }

    if (state.digestData.entities && state.digestData.entities.length > 0) {
      lines.push('── ENTITIES ────────────────────────────────────');
      lines.push('');
      state.digestData.entities.forEach(function (e) {
        lines.push('  [' + e.type.toUpperCase() + '] ' + e.text);
      });
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════');
    lines.push('  Generated by Data Alchemist v1.0.0');
    lines.push('═══════════════════════════════════════════════');

    var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'data-alchemist-digest-' + Date.now() + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ── Initialization ─────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAbsorbButton);
  } else {
    createAbsorbButton();
  }
})();
