/**
 * Code Sovereign — Content Script
 * EXT-005 | Detects code blocks, enhances with AI review, generation & clipboard tools.
 */

(function () {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  var STYLES = {
    enhanceBtn: 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;margin:0 0 4px 0;' +
      'font-size:12px;font-family:system-ui,sans-serif;background:#1a1a2e;color:#e0e0ff;' +
      'border:1px solid #4a4ae8;border-radius:6px;cursor:pointer;z-index:10000;position:relative;',
    overlay: 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,10,30,0.85);' +
      'z-index:100000;display:flex;align-items:center;justify-content:center;',
    overlayPanel: 'background:#13132b;color:#e0e0ff;border:1px solid #4a4ae8;border-radius:12px;' +
      'padding:24px;max-width:680px;width:90%;max-height:80vh;overflow-y:auto;font-family:monospace;font-size:13px;',
    closeBtn: 'position:absolute;top:10px;right:14px;background:none;border:none;color:#e0e0ff;' +
      'font-size:20px;cursor:pointer;',
    codeBlock: 'background:#0d0d1a;border:1px solid #333;border-radius:6px;padding:12px;' +
      'overflow-x:auto;white-space:pre-wrap;word-break:break-all;margin:8px 0;line-height:1.5;',
    badge: function (color) {
      return 'display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;' +
        'margin-right:6px;background:' + color + ';color:#fff;';
    },
    genPanel: 'position:fixed;bottom:20px;right:20px;width:360px;background:#13132b;color:#e0e0ff;' +
      'border:1px solid #4a4ae8;border-radius:12px;padding:16px;z-index:100001;font-family:system-ui,sans-serif;' +
      'box-shadow:0 8px 32px rgba(74,74,232,0.3);',
    genTextarea: 'width:100%;height:70px;background:#0d0d1a;color:#e0e0ff;border:1px solid #333;' +
      'border-radius:6px;padding:8px;font-size:13px;resize:vertical;font-family:monospace;box-sizing:border-box;',
    genSelect: 'background:#0d0d1a;color:#e0e0ff;border:1px solid #333;border-radius:6px;padding:6px 10px;' +
      'font-size:12px;margin-right:8px;',
    genButton: 'padding:6px 16px;background:#4a4ae8;color:#fff;border:none;border-radius:6px;' +
      'cursor:pointer;font-size:12px;font-weight:600;',
    copyBtn: 'padding:4px 12px;background:#2a6b2a;color:#fff;border:none;border-radius:6px;' +
      'cursor:pointer;font-size:11px;margin-top:6px;',
    commentBtn: 'display:inline-block;padding:1px 6px;margin-left:6px;font-size:10px;background:#4a4ae8;' +
      'color:#fff;border:none;border-radius:4px;cursor:pointer;vertical-align:middle;'
  };

  var LANGUAGES = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'shell'
  ];

  function sendMessage(payload, callback) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(payload, callback);
    } else {
      callback({ error: 'Chrome runtime unavailable' });
    }
  }

  function highlightSyntax(code) {
    var escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    escaped = escaped.replace(
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)/g,
      '<span style="color:#6a9955;">$1</span>'
    );
    escaped = escaped.replace(
      /\b(function|const|let|var|class|return|if|else|for|while|switch|case|break|continue|new|this|import|export|from|async|await|try|catch|throw|def|self|yield|lambda|True|False|None|fn|let|mut|pub|impl|struct|enum|trait|match|func|type|interface|package)\b/g,
      '<span style="color:#c586c0;">$1</span>'
    );
    escaped = escaped.replace(
      /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
      '<span style="color:#ce9178;">$1</span>'
    );
    escaped = escaped.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span style="color:#b5cea8;">$1</span>'
    );

    return escaped;
  }

  function severityColor(severity) {
    switch (severity) {
      case 'critical': return '#e53935';
      case 'high':     return '#ff7043';
      case 'medium':   return '#ffa726';
      case 'low':      return '#66bb6a';
      default:         return '#999';
    }
  }

  function createOverlay(html) {
    var overlay = document.createElement('div');
    overlay.style.cssText = STYLES.overlay;

    var panel = document.createElement('div');
    panel.style.cssText = STYLES.overlayPanel + 'position:relative;';
    panel.innerHTML = html;

    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = STYLES.closeBtn;
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () {
      document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) document.body.removeChild(overlay);
    });

    panel.insertBefore(closeBtn, panel.firstChild);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    return panel;
  }

  function renderReviewResults(review) {
    var scoreColor = review.score >= 80 ? '#66bb6a' : review.score >= 50 ? '#ffa726' : '#e53935';
    var html = '<h3 style="margin:0 0 12px 0;color:#e0e0ff;">✨ Code Review Results</h3>';
    html += '<div style="margin-bottom:12px;">';
    html += '<span style="font-size:28px;font-weight:700;color:' + scoreColor + ';">' + review.score + '</span>';
    html += '<span style="color:#aaa;font-size:14px;"> / 100</span>';
    html += '</div>';

    html += '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
    html += '<div style="' + STYLES.badge('#4a4ae8') + '">Complexity: ' + review.metrics.complexity + '</div>';
    html += '<div style="' + STYLES.badge('#6a5acd') + '">Maintainability: ' + review.metrics.maintainability + '</div>';
    html += '<div style="' + STYLES.badge('#333') + '">Lines: ' + review.metrics.linesOfCode + '</div>';
    html += '</div>';

    if (review.issues.length === 0) {
      html += '<p style="color:#66bb6a;">No issues found — clean code!</p>';
    } else {
      html += '<div style="margin-top:8px;">';
      for (var i = 0; i < review.issues.length; i++) {
        var issue = review.issues[i];
        html += '<div style="margin-bottom:10px;padding:8px;background:#0d0d1a;border-radius:6px;border-left:3px solid ' + severityColor(issue.severity) + ';">';
        html += '<span style="' + STYLES.badge(severityColor(issue.severity)) + '">' + issue.severity.toUpperCase() + '</span>';
        html += '<span style="color:#aaa;">Line ' + issue.line + '</span><br>';
        html += '<span style="color:#e0e0ff;">' + issue.message + '</span><br>';
        html += '<span style="color:#66bb6a;font-size:12px;">💡 ' + issue.suggestion + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    return html;
  }

  function attachEnhanceButton(codeEl) {
    if (codeEl.dataset.csSovereign === 'true') return;
    codeEl.dataset.csSovereign = 'true';

    var btn = document.createElement('button');
    btn.style.cssText = STYLES.enhanceBtn;
    btn.textContent = '✨ Enhance';
    btn.title = 'Code Sovereign: Review this code';

    btn.addEventListener('click', function () {
      var code = codeEl.textContent || codeEl.innerText || '';
      if (!code.trim()) return;

      btn.textContent = '⏳ Analyzing…';
      btn.disabled = true;

      sendMessage({ action: 'reviewCode', code: code }, function (review) {
        btn.textContent = '✨ Enhance';
        btn.disabled = false;

        if (!review || review.error) {
          var fallbackEngine = globalThis.codeSovereign || null;
          if (fallbackEngine) {
            review = fallbackEngine.reviewCode(code);
          } else {
            createOverlay('<p style="color:#e53935;">Failed to review code: ' + (review ? review.error : 'no response') + '</p>');
            return;
          }
        }

        createOverlay(renderReviewResults(review));
      });
    });

    codeEl.parentNode.insertBefore(btn, codeEl);
  }

  function detectCodeBlocks() {
    var selectors = [
      'pre code',
      'pre',
      '.highlight code',
      '.code-block',
      '.language-javascript', '.language-python', '.language-java',
      '.language-typescript', '.language-go', '.language-rust',
      '.language-cpp', '.language-csharp', '.language-ruby',
      '.hljs',
      '[class*="code"]',
      '[class*="Code"]'
    ];

    var seen = new Set();
    var results = [];

    for (var s = 0; s < selectors.length; s++) {
      var els = document.querySelectorAll(selectors[s]);
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (seen.has(el)) continue;
        var text = (el.textContent || '').trim();
        if (text.length < 20) continue;
        if (text.split('\n').length < 2 && !/[{};()=>]/.test(text)) continue;
        seen.add(el);
        results.push(el);
      }
    }

    return results;
  }

  function processComments(codeEl) {
    var code = codeEl.textContent || '';
    var lines = code.split('\n');
    var commentPattern = /^\s*(\/\/|#|--|%)\s*(.+)/;
    var hasComments = false;

    for (var i = 0; i < lines.length; i++) {
      if (commentPattern.test(lines[i])) {
        hasComments = true;
        break;
      }
    }

    if (!hasComments) return;
    if (codeEl.dataset.csComments === 'true') return;
    codeEl.dataset.csComments = 'true';

    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;';

    var genCommentBtn = document.createElement('button');
    genCommentBtn.style.cssText = STYLES.commentBtn;
    genCommentBtn.textContent = '→ Generate from Comments';
    genCommentBtn.title = 'Generate code from detected comments';

    genCommentBtn.addEventListener('click', function () {
      var comments = [];
      for (var j = 0; j < lines.length; j++) {
        var match = lines[j].match(commentPattern);
        if (match) comments.push(match[2].trim());
      }
      var prompt = comments.join('. ');

      genCommentBtn.textContent = '⏳ Generating…';
      genCommentBtn.disabled = true;

      sendMessage({ action: 'generateCode', prompt: prompt, language: 'javascript' }, function (result) {
        genCommentBtn.textContent = '→ Generate from Comments';
        genCommentBtn.disabled = false;

        if (!result || result.error) {
          var fallback = globalThis.codeSovereign || null;
          if (fallback) {
            result = fallback.generateCode(prompt, 'javascript', 'codex');
          } else {
            return;
          }
        }

        var html = '<h3 style="margin:0 0 12px 0;color:#e0e0ff;">→ Generated from Comments</h3>';
        html += '<div style="margin-bottom:8px;color:#aaa;font-size:12px;">Prompt: "' + prompt + '"</div>';
        html += '<div style="' + STYLES.codeBlock + '">' + highlightSyntax(result.code) + '</div>';
        html += '<div style="margin-top:8px;color:#aaa;font-size:11px;">';
        html += 'Engine: ' + result.engine + ' | Tokens: ' + result.tokens + ' | Confidence: ' + (result.confidence * 100).toFixed(0) + '%';
        html += '</div>';

        var panel = createOverlay(html);
        addCopyButton(panel, result.code);
      });
    });

    codeEl.parentNode.insertBefore(genCommentBtn, codeEl);
  }

  function addCopyButton(container, code) {
    var btn = document.createElement('button');
    btn.style.cssText = STYLES.copyBtn;
    btn.textContent = '📋 Copy to Clipboard';

    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(code).then(function () {
        btn.textContent = '✅ Copied!';
        setTimeout(function () { btn.textContent = '📋 Copy to Clipboard'; }, 2000);
      }).catch(function () {
        btn.textContent = '❌ Copy failed';
        setTimeout(function () { btn.textContent = '📋 Copy to Clipboard'; }, 2000);
      });
    });

    container.appendChild(btn);
  }

  function createGenerationPanel() {
    var panel = document.createElement('div');
    panel.style.cssText = STYLES.genPanel;
    panel.id = 'cs-gen-panel';

    var title = document.createElement('div');
    title.style.cssText = 'font-weight:700;margin-bottom:10px;font-size:14px;display:flex;justify-content:space-between;align-items:center;';
    title.innerHTML = '<span>⚡ Code Sovereign — Generate</span>';

    var minimizeBtn = document.createElement('button');
    minimizeBtn.style.cssText = 'background:none;border:none;color:#e0e0ff;font-size:16px;cursor:pointer;padding:0 4px;';
    minimizeBtn.textContent = '−';
    var panelMinimized = false;

    var contentArea = document.createElement('div');

    minimizeBtn.addEventListener('click', function () {
      panelMinimized = !panelMinimized;
      contentArea.style.display = panelMinimized ? 'none' : 'block';
      minimizeBtn.textContent = panelMinimized ? '+' : '−';
    });
    title.appendChild(minimizeBtn);
    panel.appendChild(title);

    var textarea = document.createElement('textarea');
    textarea.style.cssText = STYLES.genTextarea;
    textarea.placeholder = 'Describe the code you want to generate…';
    contentArea.appendChild(textarea);

    var controls = document.createElement('div');
    controls.style.cssText = 'display:flex;align-items:center;margin-top:8px;flex-wrap:wrap;gap:6px;';

    var select = document.createElement('select');
    select.style.cssText = STYLES.genSelect;
    for (var l = 0; l < LANGUAGES.length; l++) {
      var opt = document.createElement('option');
      opt.value = LANGUAGES[l];
      opt.textContent = LANGUAGES[l];
      select.appendChild(opt);
    }
    controls.appendChild(select);

    var engineSelect = document.createElement('select');
    engineSelect.style.cssText = STYLES.genSelect;
    var engineNames = ['codex', 'codellama', 'deepseek'];
    for (var e = 0; e < engineNames.length; e++) {
      var eOpt = document.createElement('option');
      eOpt.value = engineNames[e];
      eOpt.textContent = engineNames[e];
      engineSelect.appendChild(eOpt);
    }
    controls.appendChild(engineSelect);

    var genBtn = document.createElement('button');
    genBtn.style.cssText = STYLES.genButton;
    genBtn.textContent = '⚡ Generate';
    controls.appendChild(genBtn);

    contentArea.appendChild(controls);

    var outputArea = document.createElement('div');
    outputArea.style.cssText = 'margin-top:10px;display:none;';
    contentArea.appendChild(outputArea);

    genBtn.addEventListener('click', function () {
      var prompt = textarea.value.trim();
      if (!prompt) return;

      genBtn.textContent = '⏳ Generating…';
      genBtn.disabled = true;

      sendMessage({
        action: 'generateCode',
        prompt: prompt,
        language: select.value,
        engine: engineSelect.value
      }, function (result) {
        genBtn.textContent = '⚡ Generate';
        genBtn.disabled = false;

        if (!result || result.error) {
          var fallback = globalThis.codeSovereign || null;
          if (fallback) {
            result = fallback.generateCode(prompt, select.value, engineSelect.value);
          } else {
            outputArea.style.display = 'block';
            outputArea.innerHTML = '<p style="color:#e53935;">Generation failed.</p>';
            return;
          }
        }

        outputArea.style.display = 'block';
        outputArea.innerHTML =
          '<div style="' + STYLES.codeBlock + '">' + highlightSyntax(result.code) + '</div>' +
          '<div style="color:#aaa;font-size:11px;margin-top:4px;">' +
            'Engine: ' + result.engine +
            ' | Language: ' + result.language +
            ' | Tokens: ' + result.tokens +
            ' | Confidence: ' + (result.confidence * 100).toFixed(0) + '%' +
            ' | Complexity: ' + (typeof result.complexity === 'number' ? result.complexity.toFixed(2) : result.complexity) +
          '</div>';

        addCopyButton(outputArea, result.code);
      });
    });

    panel.appendChild(contentArea);
    document.body.appendChild(panel);
  }

  function init() {
    var codeBlocks = detectCodeBlocks();
    for (var i = 0; i < codeBlocks.length; i++) {
      attachEnhanceButton(codeBlocks[i]);
      processComments(codeBlocks[i]);
    }

    createGenerationPanel();

    var observer = new MutationObserver(function () {
      var newBlocks = detectCodeBlocks();
      for (var j = 0; j < newBlocks.length; j++) {
        if (newBlocks[j].dataset.csSovereign !== 'true') {
          attachEnhanceButton(newBlocks[j]);
          processComments(newBlocks[j]);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
