/* Social Cortex — Content Script (EXT-013) */

(function () {
  'use strict';

  var PANEL_ID = 'social-cortex-panel';
  if (document.getElementById(PANEL_ID)) return;

  var SENTIMENT_COLORS = {
    positive: '#28a745',
    negative: '#e94560',
    neutral: '#6c757d'
  };

  /* Sidebar panel */
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', top: '60px', right: '0', width: '320px',
    height: 'calc(100vh - 80px)', backgroundColor: '#0d1117',
    color: '#e0e0e0', borderLeft: '2px solid #e94560',
    boxShadow: '-4px 0 24px rgba(233,69,96,0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease'
  });

  /* Header */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #e94560, #c2185b)',
    userSelect: 'none'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83E\uDDE0 Social Cortex';
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';
  var toggle = document.createElement('button');
  Object.assign(toggle.style, {
    background: 'none', border: 'none', color: '#e0e0e0',
    fontSize: '16px', cursor: 'pointer', padding: '0 4px'
  });
  toggle.textContent = '\u25B6';
  header.appendChild(title);
  header.appendChild(toggle);
  panel.appendChild(header);

  /* Body */
  var body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflowY = 'auto';
  body.style.flex = '1';

  /* Sentiment indicator */
  var sentimentBar = document.createElement('div');
  Object.assign(sentimentBar.style, {
    display: 'flex', gap: '4px', marginBottom: '10px', height: '8px', borderRadius: '4px', overflow: 'hidden'
  });
  var posBar = document.createElement('div');
  posBar.style.backgroundColor = SENTIMENT_COLORS.positive;
  posBar.style.flex = '1';
  var negBar = document.createElement('div');
  negBar.style.backgroundColor = SENTIMENT_COLORS.negative;
  negBar.style.flex = '1';
  var neuBar = document.createElement('div');
  neuBar.style.backgroundColor = SENTIMENT_COLORS.neutral;
  neuBar.style.flex = '1';
  sentimentBar.appendChild(posBar);
  sentimentBar.appendChild(negBar);
  sentimentBar.appendChild(neuBar);
  body.appendChild(sentimentBar);

  /* Emotion indicators */
  var emotionRow = document.createElement('div');
  Object.assign(emotionRow.style, {
    display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px'
  });
  var emotionEmojis = {
    joy: '\uD83D\uDE04', sadness: '\uD83D\uDE22', anger: '\uD83D\uDE21', fear: '\uD83D\uDE28',
    surprise: '\uD83D\uDE32', disgust: '\uD83E\uDD22', trust: '\uD83E\uDD1D', anticipation: '\uD83E\uDD29'
  };
  var emotionKeys = Object.keys(emotionEmojis);
  for (var e = 0; e < emotionKeys.length; e++) {
    var emTag = document.createElement('span');
    Object.assign(emTag.style, {
      padding: '2px 6px', backgroundColor: '#161b22', borderRadius: '10px',
      fontSize: '11px', opacity: '0.5'
    });
    emTag.textContent = emotionEmojis[emotionKeys[e]] + ' ' + emotionKeys[e];
    emTag.id = 'sc-emotion-' + emotionKeys[e];
    emotionRow.appendChild(emTag);
  }
  body.appendChild(emotionRow);

  /* Text area */
  var textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '100%', height: '64px', backgroundColor: '#161b22',
    color: '#e0e0e0', border: '1px solid #444', borderRadius: '6px',
    padding: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
  });
  textarea.placeholder = 'Paste social media text to analyze\u2026';
  body.appendChild(textarea);

  /* Buttons */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginTop: '8px' });

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

  var sentimentBtn = makeButton('\uD83D\uDCCA Sentiment', '#6c63ff');
  var emotionBtn = makeButton('\uD83C\uDFAD Emotion', '#e94560');
  var respondBtn = makeButton('\uD83D\uDCAC Respond', '#28a745');
  var riskBtn = makeButton('\u26A0 Risk', '#ff9800');

  btnRow.appendChild(sentimentBtn);
  btnRow.appendChild(emotionBtn);
  btnRow.appendChild(respondBtn);
  btnRow.appendChild(riskBtn);
  body.appendChild(btnRow);

  /* Response suggestions */
  var results = document.createElement('div');
  Object.assign(results.style, {
    marginTop: '10px', padding: '8px', backgroundColor: '#161b22',
    borderRadius: '6px', minHeight: '40px', maxHeight: '240px',
    overflowY: 'auto', fontSize: '12px', lineHeight: '1.5',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'none'
  });
  body.appendChild(results);
  panel.appendChild(body);
  document.body.appendChild(panel);

  /* Toggle sidebar */
  var hidden = false;
  toggle.addEventListener('click', function () {
    hidden = !hidden;
    panel.style.transform = hidden ? 'translateX(290px)' : 'translateX(0)';
    toggle.textContent = hidden ? '\u25C0' : '\u25B6';
  });

  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  function updateSentimentBar(sentiment) {
    posBar.style.flex = String(Math.max(0.05, sentiment.positive));
    negBar.style.flex = String(Math.max(0.05, sentiment.negative));
    neuBar.style.flex = String(Math.max(0.05, sentiment.neutral));
  }

  function highlightEmotion(emotionData) {
    for (var i = 0; i < emotionKeys.length; i++) {
      var el = document.getElementById('sc-emotion-' + emotionKeys[i]);
      if (el) {
        el.style.opacity = emotionKeys[i] === emotionData.primary ? '1' : '0.4';
        el.style.border = emotionKeys[i] === emotionData.primary ? '1px solid #e94560' : 'none';
      }
    }
  }

  sentimentBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter text to analyze.'); return; }
    chrome.runtime.sendMessage({ action: 'analyzeSentiment', text: text }, function (r) {
      if (r && r.success) {
        updateSentimentBar(r.data);
        showResult(r.data);
      } else { showResult('Error'); }
    });
  });

  emotionBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter text to analyze.'); return; }
    chrome.runtime.sendMessage({ action: 'detectEmotion', text: text }, function (r) {
      if (r && r.success) {
        highlightEmotion(r.data);
        showResult(r.data);
      } else { showResult('Error'); }
    });
  });

  respondBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter context for a response.'); return; }
    chrome.runtime.sendMessage({ action: 'draftEmpathicResponse', context: text, tone: 'supportive' }, function (r) {
      showResult(r && r.success ? r.data : 'Error');
    });
  });

  riskBtn.addEventListener('click', function () {
    var text = textarea.value.trim();
    if (!text) { showResult('Enter a post to assess risk.'); return; }
    chrome.runtime.sendMessage({ action: 'socialRiskScore', post: text }, function (r) {
      showResult(r && r.success ? r.data : 'Error');
    });
  });

  /* Auto-capture selected text */
  document.addEventListener('mouseup', function (ev) {
    if (panel.contains(ev.target)) return;
    var sel = window.getSelection().toString().trim();
    if (sel.length > 5) textarea.value = sel;
  });

})();
