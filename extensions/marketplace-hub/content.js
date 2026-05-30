/* Marketplace Hub — Content Script (EXT-021)
 *
 * AI Tool Marketplace user experience — a floating panel that lets users
 * search, browse, invoke, and explore organism tools with natural language.
 *
 * Features:
 * - Family-tabbed tool browser (Crawling / Context / Commander / Sentry)
 * - Natural-language search with phi-weighted relevance
 * - One-click tool invocation with action selector
 * - Live invocation result display
 * - Invocation history timeline
 * - Family color-coded UI
 */

(function () {
  'use strict';

  var PANEL_ID = 'marketplace-hub-panel';
  if (document.getElementById(PANEL_ID)) return;

  var HEARTBEAT = 873;
  var FAMILY_COLORS = {
    Context: '#6c63ff',
    Commander: '#f5a623',
    Crawling: '#00e676',
    Sentry: '#e94560'
  };
  var FAMILY_ICONS = { Context: '\uD83E\uDDE0', Commander: '\u26A1', Crawling: '\uD83D\uDD77', Sentry: '\uD83D\uDEE1' };

  /* ── Main Panel ─────────────────────────────────────────── */
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '380px',
    maxHeight: '580px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #f5a623', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(245,166,35,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '12px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  /* ── Header ─────────────────────────────────────────────── */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #f5a623, #e94560)',
    cursor: 'grab', userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83C\uDFEA Marketplace Hub';
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';

  var toggleBtn = document.createElement('button');
  Object.assign(toggleBtn.style, {
    background: 'none', border: 'none', color: '#e0e0e0',
    fontSize: '16px', cursor: 'pointer', padding: '0 4px'
  });
  toggleBtn.textContent = '\u2796';
  header.appendChild(title);
  header.appendChild(toggleBtn);
  panel.appendChild(header);

  /* ── Body Container ─────────────────────────────────────── */
  var body = document.createElement('div');
  body.style.overflow = 'auto';
  body.style.maxHeight = '500px';
  body.style.padding = '10px';

  /* ── Search Bar ─────────────────────────────────────────── */
  var searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = '\uD83D\uDD0D Search tools by name, family, or intent...';
  Object.assign(searchBox.style, {
    width: '100%', padding: '8px 10px', marginBottom: '10px',
    backgroundColor: '#161b22', color: '#e0e0e0',
    border: '1px solid #30363d', borderRadius: '8px',
    fontSize: '12px', boxSizing: 'border-box', outline: 'none'
  });
  body.appendChild(searchBox);

  /* ── Family Tabs ────────────────────────────────────────── */
  var tabBar = document.createElement('div');
  Object.assign(tabBar.style, {
    display: 'flex', gap: '4px', marginBottom: '10px'
  });
  var families = ['Context', 'Commander', 'Crawling', 'Sentry'];
  var activeFamily = 'Context';
  var tabBtns = {};

  for (var fi = 0; fi < families.length; fi++) {
    (function (fam) {
      var btn = document.createElement('button');
      btn.textContent = FAMILY_ICONS[fam] + ' ' + fam;
      Object.assign(btn.style, {
        flex: '1', padding: '6px 4px', fontSize: '11px', fontWeight: '600',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        backgroundColor: fam === activeFamily ? FAMILY_COLORS[fam] : '#161b22',
        color: fam === activeFamily ? '#fff' : '#888',
        transition: 'all 0.2s'
      });
      btn.addEventListener('click', function () {
        activeFamily = fam;
        updateTabs();
        renderToolList();
      });
      tabBtns[fam] = btn;
      tabBar.appendChild(btn);
    })(families[fi]);
  }
  body.appendChild(tabBar);

  /* ── Tool List ──────────────────────────────────────────── */
  var toolList = document.createElement('div');
  toolList.id = 'mh-tool-list';
  body.appendChild(toolList);

  /* ── Result Display ─────────────────────────────────────── */
  var resultBox = document.createElement('div');
  resultBox.id = 'mh-result';
  Object.assign(resultBox.style, {
    display: 'none', marginTop: '10px', padding: '10px',
    backgroundColor: '#161b22', borderRadius: '8px',
    border: '1px solid #30363d', fontSize: '11px',
    maxHeight: '160px', overflow: 'auto', whiteSpace: 'pre-wrap',
    fontFamily: 'monospace'
  });
  body.appendChild(resultBox);

  /* ── Status Bar ─────────────────────────────────────────── */
  var statusBar = document.createElement('div');
  Object.assign(statusBar.style, {
    padding: '6px 10px', fontSize: '10px', color: '#888',
    borderTop: '1px solid #30363d', textAlign: 'center'
  });
  statusBar.textContent = '24 tools \u2022 4 families \u2022 VOIS-addressable';

  panel.appendChild(body);
  panel.appendChild(statusBar);
  document.body.appendChild(panel);

  /* ── Toggle collapse ────────────────────────────────────── */
  var collapsed = false;
  toggleBtn.addEventListener('click', function () {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    statusBar.style.display = collapsed ? 'none' : 'block';
    toggleBtn.textContent = collapsed ? '\u2795' : '\u2796';
  });

  /* ── Drag support ───────────────────────────────────────── */
  var dragX = 0, dragY = 0, isDragging = false;
  header.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragX = e.clientX - panel.getBoundingClientRect().left;
    dragY = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    panel.style.left = (e.clientX - dragX) + 'px';
    panel.style.top = (e.clientY - dragY) + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', function () {
    isDragging = false;
    header.style.cursor = 'grab';
  });

  /* ── Tab highlighting ───────────────────────────────────── */
  function updateTabs() {
    for (var f = 0; f < families.length; f++) {
      var fam = families[f];
      tabBtns[fam].style.backgroundColor = fam === activeFamily ? FAMILY_COLORS[fam] : '#161b22';
      tabBtns[fam].style.color = fam === activeFamily ? '#fff' : '#888';
    }
  }

  /* ── Render tool list ───────────────────────────────────── */
  function renderToolList(searchResults) {
    toolList.innerHTML = '';

    var displayTools;
    if (searchResults) {
      displayTools = searchResults.map(function (r) { return r.tool; });
    } else {
      /* Fetch from background — in real extension context */
      displayTools = getToolsByFamilyLocal(activeFamily);
    }

    for (var i = 0; i < displayTools.length; i++) {
      (function (tool) {
        var card = document.createElement('div');
        Object.assign(card.style, {
          padding: '8px 10px', marginBottom: '6px',
          backgroundColor: '#161b22', borderRadius: '8px',
          border: '1px solid #30363d', cursor: 'pointer',
          transition: 'border-color 0.2s'
        });
        card.addEventListener('mouseenter', function () {
          card.style.borderColor = FAMILY_COLORS[tool.family] || '#f5a623';
        });
        card.addEventListener('mouseleave', function () {
          card.style.borderColor = '#30363d';
        });

        /* Tool name + icon */
        var nameRow = document.createElement('div');
        nameRow.style.display = 'flex';
        nameRow.style.justifyContent = 'space-between';
        nameRow.style.alignItems = 'center';

        var nameEl = document.createElement('span');
        nameEl.style.fontWeight = '700';
        nameEl.style.fontSize = '12px';
        nameEl.textContent = tool.icon + ' ' + tool.name;

        var badge = document.createElement('span');
        Object.assign(badge.style, {
          fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
          backgroundColor: FAMILY_COLORS[tool.family] || '#333',
          color: '#fff', fontWeight: '600'
        });
        badge.textContent = tool.role;

        nameRow.appendChild(nameEl);
        nameRow.appendChild(badge);
        card.appendChild(nameRow);

        /* Purpose */
        var purposeEl = document.createElement('div');
        purposeEl.style.fontSize = '11px';
        purposeEl.style.color = '#888';
        purposeEl.style.marginTop = '4px';
        purposeEl.textContent = tool.purpose;
        card.appendChild(purposeEl);

        /* Action buttons */
        var actionRow = document.createElement('div');
        Object.assign(actionRow.style, {
          display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap'
        });

        for (var a = 0; a < tool.actions.length; a++) {
          (function (action) {
            var actionBtn = document.createElement('button');
            actionBtn.textContent = action;
            Object.assign(actionBtn.style, {
              padding: '3px 8px', fontSize: '10px', fontWeight: '600',
              border: '1px solid ' + (FAMILY_COLORS[tool.family] || '#f5a623'),
              borderRadius: '4px', cursor: 'pointer',
              backgroundColor: 'transparent',
              color: FAMILY_COLORS[tool.family] || '#f5a623',
              transition: 'all 0.15s'
            });
            actionBtn.addEventListener('mouseenter', function () {
              actionBtn.style.backgroundColor = FAMILY_COLORS[tool.family] || '#f5a623';
              actionBtn.style.color = '#fff';
            });
            actionBtn.addEventListener('mouseleave', function () {
              actionBtn.style.backgroundColor = 'transparent';
              actionBtn.style.color = FAMILY_COLORS[tool.family] || '#f5a623';
            });
            actionBtn.addEventListener('click', function (e) {
              e.stopPropagation();
              invokeToolAction(tool, action);
            });
            actionRow.appendChild(actionBtn);
          })(tool.actions[a]);
        }
        card.appendChild(actionRow);
        toolList.appendChild(card);
      })(displayTools[i]);
    }

    if (displayTools.length === 0) {
      var empty = document.createElement('div');
      empty.style.textAlign = 'center';
      empty.style.color = '#555';
      empty.style.padding = '20px';
      empty.textContent = 'No tools found';
      toolList.appendChild(empty);
    }
  }

  /* ── Invoke tool action via chrome.runtime messaging ─────── */
  function invokeToolAction(tool, action) {
    resultBox.style.display = 'block';
    resultBox.style.borderColor = FAMILY_COLORS[tool.family] || '#30363d';
    resultBox.textContent = '\u23F3 Invoking ' + tool.name + '.' + action + '...';

    var invokeStartTime = Date.now();

    chrome.runtime.sendMessage(
      { action: 'invokeTool', callId: tool.callId, toolAction: action, params: {} },
      function (result) {
        var latencyMs = Date.now() - invokeStartTime;

        if (chrome.runtime.lastError) {
          resultBox.textContent = '\u274C Error: ' + chrome.runtime.lastError.message;
          statusBar.textContent = '\u26A0 Background unreachable';
          return;
        }

        if (!result) {
          resultBox.textContent = '\u274C No response from background engine';
          statusBar.textContent = '\u26A0 Empty response';
          return;
        }

        resultBox.textContent =
          FAMILY_ICONS[tool.family] + ' ' + tool.name + '.' + action + ' \u2192 ' +
          (result.status || 'ok').toUpperCase() + '\n' +
          JSON.stringify(result, null, 2);

        statusBar.textContent = '\u2713 ' + tool.name + '.' + action + ' completed \u2022 ' +
          latencyMs + 'ms';
      }
    );
  }

  /* ── Local tool data (mirrors background.js catalog) ──── */
  var ALL_TOOLS = [
    { callId: 'TOOL-001', name: 'PULSE-KEEPER', family: 'Context', role: 'Heartbeat Witness', ring: 'Sovereign Ring', purpose: 'Monitor organism heartbeat pulse at 873ms cadence', icon: '\uD83D\uDC93', actions: ['status', 'beat', 'drift'] },
    { callId: 'TOOL-004', name: 'STATE-GUARDIAN', family: 'Context', role: 'State Reader', ring: 'Sovereign Ring', purpose: 'Read and validate 4-register organism state', icon: '\uD83C\uDFDB', actions: ['snapshot', 'validate', 'diff'] },
    { callId: 'TOOL-005', name: 'CYCLE-COUNTER', family: 'Context', role: 'Phase Tracker', ring: 'Sovereign Ring', purpose: 'Count organism lifecycle cycles and phases', icon: '\uD83D\uDD04', actions: ['count', 'phase', 'history'] },
    { callId: 'TOOL-008', name: 'CONTEXT-BUILDER', family: 'Context', role: 'Context Architect', ring: 'Interface Ring', purpose: 'Assemble rich execution context for AI reasoning', icon: '\uD83E\uDDE9', actions: ['build', 'enrich', 'summarize'] },
    { callId: 'TOOL-010', name: 'MEMORY-CONSOLIDATOR', family: 'Context', role: 'Memory Keeper', ring: 'Memory Ring', purpose: 'Consolidate and prune organism memories', icon: '\uD83D\uDDC3', actions: ['consolidate', 'prune', 'compact', 'status'] },
    { callId: 'TOOL-022', name: 'LINEAGE-TRACER', family: 'Context', role: 'Lineage Historian', ring: 'Memory Ring', purpose: 'Trace full lineage of organism entities', icon: '\uD83C\uDF33', actions: ['trace', 'ancestors', 'descendants', 'causal-chain'] },
    { callId: 'TOOL-002', name: 'SYNC-WEAVER', family: 'Commander', role: 'Synchronization Master', ring: 'Sovereign Ring', purpose: 'Synchronize endpoints via phi-resonance coupling', icon: '\uD83C\uDF00', actions: ['status', 'register', 'step', 'resonate'] },
    { callId: 'TOOL-006', name: 'INFER-ENGINE', family: 'Commander', role: 'Model Strategist', ring: 'Interface Ring', purpose: 'Route inference tasks to optimal AI model', icon: '\uD83C\uDFAF', actions: ['route', 'score', 'compare'] },
    { callId: 'TOOL-009', name: 'ATTENTION-ROUTER', family: 'Commander', role: 'Focus Director', ring: 'Interface Ring', purpose: 'Route attention and focus across subsystems', icon: '\uD83D\uDC41', actions: ['focus', 'distribute', 'query'] },
    { callId: 'TOOL-016', name: 'RESOURCE-BALANCER', family: 'Commander', role: 'Resource Allocator', ring: 'Sovereign Ring', purpose: 'Balance resources across rings', icon: '\u2696', actions: ['balance', 'allocate', 'status'] },
    { callId: 'TOOL-017', name: 'CONNECTION-POOL', family: 'Commander', role: 'Connection Quartermaster', ring: 'Transport Ring', purpose: 'Manage connection pools for connectors', icon: '\uD83D\uDD0C', actions: ['status', 'drain', 'expand', 'health'] },
    { callId: 'TOOL-024', name: 'TASK-COMMANDER', family: 'Commander', role: 'Execution General', ring: 'Interface Ring', purpose: 'Orchestrate multi-step task plans across tools', icon: '\u2694', actions: ['plan', 'dispatch', 'status', 'rollback'] },
    { callId: 'TOOL-003', name: 'FLOW-MONITOR', family: 'Crawling', role: 'Flow Scout', ring: 'Transport Ring', purpose: 'Monitor data flow throughput and bottlenecks', icon: '\uD83C\uDF0A', actions: ['status', 'throughput', 'bottlenecks'] },
    { callId: 'TOOL-007', name: 'PATTERN-SEEKER', family: 'Crawling', role: 'Pattern Analyst', ring: 'Memory Ring', purpose: 'Detect recurring patterns in data streams', icon: '\uD83D\uDD0D', actions: ['scan', 'frequency', 'anomaly'] },
    { callId: 'TOOL-014', name: 'ANOMALY-DETECTOR', family: 'Crawling', role: 'Anomaly Hunter', ring: 'Sovereign Ring', purpose: 'Detect anomalies in organism behavior', icon: '\u26A0', actions: ['detect', 'baseline', 'status'] },
    { callId: 'TOOL-018', name: 'CACHE-OPTIMIZER', family: 'Crawling', role: 'Cache Surgeon', ring: 'Memory Ring', purpose: 'Optimize caching across memory layers', icon: '\uD83D\uDCBE', actions: ['status', 'optimize', 'evict', 'warm'] },
    { callId: 'TOOL-020', name: 'LOG-STREAMER', family: 'Crawling', role: 'Stream Keeper', ring: 'Transport Ring', purpose: 'Stream organism logs in real-time', icon: '\uD83D\uDCE1', actions: ['stream', 'query', 'tail', 'status'] },
    { callId: 'TOOL-021', name: 'TOPOLOGY-CRAWLER', family: 'Crawling', role: 'Topology Mapper', ring: 'Sovereign Ring', purpose: 'Crawl and map organism topology', icon: '\uD83D\uDDFA', actions: ['crawl', 'map', 'orphans', 'dependencies'] },
    { callId: 'TOOL-011', name: 'SENTINEL-WATCH', family: 'Sentry', role: 'Perimeter Guard', ring: 'Counsel Ring', purpose: 'Real-time security monitoring', icon: '\uD83D\uDEE1', actions: ['scan', 'status', 'threats'] },
    { callId: 'TOOL-012', name: 'INTEGRITY-CHECKER', family: 'Sentry', role: 'Truth Verifier', ring: 'Proof Ring', purpose: 'Verify data integrity and schema consistency', icon: '\u2705', actions: ['check', 'verify-contract', 'audit'] },
    { callId: 'TOOL-013', name: 'BOUNDARY-ENFORCER', family: 'Sentry', role: 'Ring Warden', ring: 'Counsel Ring', purpose: 'Enforce ring boundaries', icon: '\uD83D\uDEA7', actions: ['enforce', 'validate', 'status'] },
    { callId: 'TOOL-015', name: 'SEAL-VERIFIER', family: 'Sentry', role: 'Seal Master', ring: 'Counsel Ring', purpose: 'Verify cryptographic seals', icon: '\uD83D\uDD0F', actions: ['verify', 'seal', 'status'] },
    { callId: 'TOOL-019', name: 'QUEUE-PROCESSOR', family: 'Sentry', role: 'Security Queue Handler', ring: 'Transport Ring', purpose: 'Process security and settlement queues', icon: '\uD83D\uDCCB', actions: ['status', 'enqueue', 'process', 'drain'] },
    { callId: 'TOOL-023', name: 'DOCTRINE-AUDITOR', family: 'Sentry', role: 'Doctrine Judge', ring: 'Counsel Ring', purpose: 'Audit organism against 40 architectural laws', icon: '\uD83D\uDCDC', actions: ['audit', 'check-law', 'drift-report', 'compliance-score'] }
  ];

  function getToolsByFamilyLocal(familyName) {
    return ALL_TOOLS.filter(function (t) { return t.family === familyName; });
  }

  function searchToolsLocal(query) {
    if (!query || query.trim().length === 0) return [];
    var terms = query.toLowerCase().split(/\s+/);
    var results = [];
    for (var i = 0; i < ALL_TOOLS.length; i++) {
      var tool = ALL_TOOLS[i];
      var searchable = [tool.name, tool.family, tool.role, tool.purpose, tool.ring].join(' ').toLowerCase();
      var hits = 0;
      for (var t = 0; t < terms.length; t++) {
        if (searchable.indexOf(terms[t]) !== -1) hits++;
      }
      if (hits > 0) {
        results.push({ tool: tool, relevance: hits / terms.length });
      }
    }
    results.sort(function (a, b) { return b.relevance - a.relevance; });
    return results;
  }

  /* ── Search handler (routes to background engine) ────────── */
  var searchTimeout;
  searchBox.addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      var query = searchBox.value.trim();
      if (query.length === 0) {
        renderToolList();
        return;
      }
      chrome.runtime.sendMessage(
        { action: 'searchTools', query: query },
        function (results) {
          if (chrome.runtime.lastError || !results) {
            /* Fallback to local search if background unavailable */
            var localResults = searchToolsLocal(query);
            renderToolList(localResults);
            return;
          }
          renderToolList(results);
        }
      );
    }, 200);
  });

  /* ── Initial render ─────────────────────────────────────── */
  renderToolList();
})();
