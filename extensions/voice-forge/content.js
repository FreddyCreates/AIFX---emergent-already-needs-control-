/* Voice Forge — EXT-009 Content Script */

(function () {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  var isRecording = false;
  var isMinimized = false;

  /* ── Panel Container ── */
  var panel = document.createElement('div');
  panel.id = 'voice-forge-panel';
  panel.style.cssText = [
    'position:fixed',
    'bottom:20px',
    'left:50%',
    'transform:translateX(-50%)',
    'width:380px',
    'background:#1a1a2e',
    'border:1px solid #533483',
    'border-radius:12px',
    'box-shadow:0 8px 32px rgba(83,52,131,0.4)',
    'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
    'color:#e0e0e0',
    'z-index:2147483647',
    'overflow:hidden',
    'transition:height 0.3s ease'
  ].join(';');

  /* ── Drag Support ── */
  var dragOffsetX = 0;
  var dragOffsetY = 0;
  var isDragging = false;

  function onDragStart(e) {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
    isDragging = true;
    var rect = panel.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    panel.style.transition = 'none';
    e.preventDefault();
  }

  function onDragMove(e) {
    if (!isDragging) return;
    var x = e.clientX - dragOffsetX;
    var y = e.clientY - dragOffsetY;
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
    panel.style.bottom = 'auto';
    panel.style.transform = 'none';
  }

  function onDragEnd() {
    isDragging = false;
    panel.style.transition = 'height 0.3s ease';
  }

  panel.addEventListener('mousedown', onDragStart);
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);

  /* ── Header ── */
  var header = document.createElement('div');
  header.style.cssText = [
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'padding:10px 14px',
    'background:linear-gradient(135deg,#533483,#0f3460)',
    'cursor:move',
    'user-select:none'
  ].join(';');

  var title = document.createElement('span');
  title.textContent = '\uD83C\uDFB5 Voice Forge';
  title.style.cssText = 'font-weight:700;font-size:14px;letter-spacing:0.5px;';

  var minimizeBtn = document.createElement('button');
  minimizeBtn.textContent = '\u2015';
  minimizeBtn.title = 'Minimize';
  minimizeBtn.style.cssText = [
    'background:none',
    'border:none',
    'color:#e0e0e0',
    'font-size:16px',
    'cursor:pointer',
    'padding:0 4px',
    'line-height:1'
  ].join(';');

  header.appendChild(title);
  header.appendChild(minimizeBtn);
  panel.appendChild(header);

  /* ── Body Wrapper ── */
  var body = document.createElement('div');
  body.id = 'voice-forge-body';
  body.style.cssText = 'padding:12px 14px;';

  /* ── Action Buttons Row ── */
  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;justify-content:center;';

  var buttonDefs = [
    { icon: '\uD83C\uDFA4', label: 'Record', id: 'vf-record' },
    { icon: '\uD83D\uDCDD', label: 'Transcribe', id: 'vf-transcribe' },
    { icon: '\uD83D\uDD0A', label: 'Speak', id: 'vf-speak' },
    { icon: '\uD83C\uDFB6', label: 'Music', id: 'vf-music' }
  ];

  var actionButtons = {};

  buttonDefs.forEach(function (def) {
    var btn = document.createElement('button');
    btn.id = def.id;
    btn.title = def.label;
    btn.textContent = def.icon;
    btn.style.cssText = [
      'width:48px',
      'height:48px',
      'border-radius:10px',
      'border:1px solid #533483',
      'background:#16213e',
      'color:#e0e0e0',
      'font-size:20px',
      'cursor:pointer',
      'transition:background 0.2s,transform 0.1s'
    ].join(';');

    btn.addEventListener('mouseenter', function () {
      btn.style.background = '#1a1a40';
      btn.style.transform = 'scale(1.08)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.background = '#16213e';
      btn.style.transform = 'scale(1)';
      if (def.id === 'vf-record' && isRecording) {
        btn.style.background = '#6b1d1d';
      }
    });

    actionButtons[def.id] = btn;
    btnRow.appendChild(btn);
  });

  body.appendChild(btnRow);

  /* ── Textarea ── */
  var textArea = document.createElement('textarea');
  textArea.placeholder = 'Enter text for speech or a prompt for music\u2026';
  textArea.style.cssText = [
    'width:100%',
    'height:60px',
    'background:#0f3460',
    'color:#e0e0e0',
    'border:1px solid #533483',
    'border-radius:8px',
    'padding:8px',
    'font-size:12px',
    'resize:vertical',
    'box-sizing:border-box',
    'margin-bottom:8px',
    'font-family:inherit'
  ].join(';');
  body.appendChild(textArea);

  /* ── Voice Selector ── */
  var voiceRow = document.createElement('div');
  voiceRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;';

  var voiceLabel = document.createElement('label');
  voiceLabel.textContent = 'Voice:';
  voiceLabel.style.cssText = 'font-size:12px;min-width:40px;';

  var voiceSelect = document.createElement('select');
  voiceSelect.style.cssText = [
    'flex:1',
    'background:#16213e',
    'color:#e0e0e0',
    'border:1px solid #533483',
    'border-radius:6px',
    'padding:4px 8px',
    'font-size:12px',
    'cursor:pointer'
  ].join(';');

  var voices = [
    { value: 'rachel', label: 'Rachel — Warm Narrator' },
    { value: 'drew', label: 'Drew — Deep Baritone' },
    { value: 'clyde', label: 'Clyde — Gravelly Bass' },
    { value: 'paul', label: 'Paul — Smooth Tenor' },
    { value: 'domi', label: 'Domi — Bright Soprano' }
  ];

  voices.forEach(function (v) {
    var opt = document.createElement('option');
    opt.value = v.value;
    opt.textContent = v.label;
    voiceSelect.appendChild(opt);
  });

  voiceRow.appendChild(voiceLabel);
  voiceRow.appendChild(voiceSelect);
  body.appendChild(voiceRow);

  /* ── Duration Slider ── */
  var durRow = document.createElement('div');
  durRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:10px;';

  var durLabel = document.createElement('label');
  durLabel.textContent = 'Duration:';
  durLabel.style.cssText = 'font-size:12px;min-width:56px;';

  var durSlider = document.createElement('input');
  durSlider.type = 'range';
  durSlider.min = '10';
  durSlider.max = '120';
  durSlider.value = '30';
  durSlider.style.cssText = 'flex:1;accent-color:#533483;';

  var durValue = document.createElement('span');
  durValue.textContent = '30s';
  durValue.style.cssText = 'font-size:12px;min-width:32px;text-align:right;';

  durSlider.addEventListener('input', function () {
    durValue.textContent = durSlider.value + 's';
  });

  durRow.appendChild(durLabel);
  durRow.appendChild(durSlider);
  durRow.appendChild(durValue);
  body.appendChild(durRow);

  /* ── Waveform Visualization ── */
  var waveContainer = document.createElement('div');
  waveContainer.style.cssText = [
    'display:flex',
    'align-items:flex-end',
    'justify-content:center',
    'gap:2px',
    'height:30px',
    'margin-bottom:10px'
  ].join(';');

  var bars = [];
  for (var b = 0; b < 24; b++) {
    var bar = document.createElement('div');
    var h = 4 + Math.round(Math.abs(Math.sin(b * GOLDEN_ANGLE * Math.PI / 180)) * 22);
    bar.style.cssText = [
      'width:4px',
      'height:' + h + 'px',
      'background:linear-gradient(to top,#533483,#e94560)',
      'border-radius:2px',
      'transition:height 0.15s ease'
    ].join(';');
    bars.push(bar);
    waveContainer.appendChild(bar);
  }

  body.appendChild(waveContainer);

  var waveAnimId = null;

  function animateWave() {
    var time = Date.now() / HEARTBEAT;
    for (var i = 0; i < bars.length; i++) {
      var h = 4 + Math.round(Math.abs(Math.sin(time * PHI + i * GOLDEN_ANGLE * Math.PI / 180)) * 22);
      bars[i].style.height = h + 'px';
    }
    waveAnimId = requestAnimationFrame(animateWave);
  }

  function startWaveAnimation() {
    if (!waveAnimId) animateWave();
  }

  function stopWaveAnimation() {
    if (waveAnimId) {
      cancelAnimationFrame(waveAnimId);
      waveAnimId = null;
    }
  }

  /* ── Status Indicator ── */
  var statusBar = document.createElement('div');
  statusBar.style.cssText = [
    'font-size:11px',
    'padding:4px 8px',
    'background:#16213e',
    'border-radius:6px',
    'margin-bottom:8px',
    'text-align:center',
    'color:#8888aa',
    'min-height:18px'
  ].join(';');
  statusBar.textContent = 'Ready';
  body.appendChild(statusBar);

  /* ── Results Area ── */
  var results = document.createElement('div');
  results.style.cssText = [
    'font-size:11px',
    'max-height:120px',
    'overflow-y:auto',
    'background:#0a0a1a',
    'border-radius:6px',
    'padding:8px',
    'white-space:pre-wrap',
    'word-break:break-word',
    'color:#aaa',
    'display:none'
  ].join(';');
  body.appendChild(results);

  panel.appendChild(body);
  document.documentElement.appendChild(panel);

  /* ── Helpers ── */
  function setStatus(text, color) {
    statusBar.textContent = text;
    statusBar.style.color = color || '#8888aa';
  }

  function showResults(text) {
    results.textContent = text;
    results.style.display = 'block';
  }

  function sendMessage(payload, callback) {
    try {
      chrome.runtime.sendMessage(payload, function (response) {
        if (chrome.runtime.lastError) {
          setStatus('Error: ' + chrome.runtime.lastError.message, '#e94560');
          return;
        }
        if (callback) callback(response);
      });
    } catch (err) {
      setStatus('Connection error', '#e94560');
    }
  }

  /* ── Minimize Toggle ── */
  minimizeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    isMinimized = !isMinimized;
    body.style.display = isMinimized ? 'none' : 'block';
    minimizeBtn.textContent = isMinimized ? '+' : '\u2015';
  });

  /* ── Record Button ── */
  actionButtons['vf-record'].addEventListener('click', function () {
    isRecording = !isRecording;
    var btn = actionButtons['vf-record'];

    if (isRecording) {
      btn.style.background = '#6b1d1d';
      btn.style.boxShadow = '0 0 12px rgba(233,69,96,0.6)';
      setStatus('\uD83D\uDD34 Recording\u2026', '#e94560');
      startWaveAnimation();
    } else {
      btn.style.background = '#16213e';
      btn.style.boxShadow = 'none';
      setStatus('Recording stopped', '#8888aa');
      stopWaveAnimation();
    }
  });

  /* ── Transcribe Button ── */
  actionButtons['vf-transcribe'].addEventListener('click', function () {
    setStatus('Transcribing\u2026', '#f0a500');
    startWaveAnimation();

    var audioData = textArea.value || 'simulated_audio_buffer_' + Date.now();
    sendMessage(
      { action: 'transcribe', audioData: audioData },
      function (response) {
        stopWaveAnimation();
        if (response && response.success) {
          var d = response.data;
          setStatus('Transcription complete (' + d.wordCount + ' words)', '#4ecca3');
          var out = 'Text: ' + d.text + '\n';
          out += 'Language: ' + d.language + '\n';
          out += 'Duration: ' + d.duration + 's\n';
          out += 'Segments: ' + d.segments.length;
          showResults(out);
        } else {
          setStatus('Transcription failed', '#e94560');
        }
      }
    );
  });

  /* ── Speak Button ── */
  actionButtons['vf-speak'].addEventListener('click', function () {
    var text = window.getSelection().toString().trim() || textArea.value.trim();
    if (!text) {
      setStatus('Enter or select text first', '#f0a500');
      return;
    }

    setStatus('Synthesizing speech\u2026', '#f0a500');
    startWaveAnimation();

    sendMessage(
      { action: 'synthesize', text: text, voice: voiceSelect.value },
      function (response) {
        stopWaveAnimation();
        if (response && response.success) {
          var d = response.data;
          setStatus('Speech ready (' + d.duration + 's)', '#4ecca3');
          var out = 'Audio ID: ' + d.audioId + '\n';
          out += 'Voice: ' + d.voice + '\n';
          out += 'Duration: ' + d.duration + 's\n';
          out += 'Sample Rate: ' + d.sampleRate + ' Hz\n';
          out += 'Pitch: ' + d.prosody.pitch + ' Hz';
          showResults(out);
        } else {
          setStatus('Synthesis failed', '#e94560');
        }
      }
    );
  });

  /* ── Music Button ── */
  actionButtons['vf-music'].addEventListener('click', function () {
    var prompt = textArea.value.trim();
    if (!prompt) {
      setStatus('Enter a music prompt first', '#f0a500');
      return;
    }

    var duration = parseInt(durSlider.value, 10);
    setStatus('Generating music\u2026', '#f0a500');
    startWaveAnimation();

    sendMessage(
      { action: 'generateMusic', prompt: prompt, duration: duration },
      function (response) {
        stopWaveAnimation();
        if (response && response.success) {
          var d = response.data;
          setStatus('Track generated (' + d.duration + 's)', '#4ecca3');
          var out = 'Track ID: ' + d.trackId + '\n';
          out += 'Genre: ' + d.genre + ' | Mood: ' + d.mood + '\n';
          out += 'BPM: ' + d.bpm + ' | Key: ' + d.key + '\n';
          out += 'Structure:\n';
          d.structure.forEach(function (s) {
            out += '  ' + s.section + ': ' + s.start + 's \u2013 ' + s.end + 's\n';
          });
          showResults(out);
        } else {
          setStatus('Music generation failed', '#e94560');
        }
      }
    );
  });
})();
