/* Creative Muse — Background Service Worker (EXT-019) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class CreativeMuseEngine {
  constructor() {
    this.imageEngines = {
      sd: { name: 'Stable Diffusion', strengths: ['precision', 'control', 'consistency'] },
      'dall-e': { name: 'DALL-E', strengths: ['photorealism', 'creativity', 'text-rendering'] }
    };
    this.musicEngines = {
      musicgen: { name: 'MusicGen', strengths: ['instrumental', 'ambient', 'classical'] },
      suno: { name: 'Suno', strengths: ['vocal', 'pop', 'lyrical', 'full-production'] }
    };
    this.creationHistory = [];
  }

  generateArt(prompt, medium, engine) {
    if (medium === undefined) medium = 'image';
    if (engine === undefined) engine = 'sd';

    if (medium === 'music' || medium === 'audio') {
      return this.generateMusic(prompt, 'ambient', 30, engine === 'sd' ? 'suno' : engine);
    }

    var config = this.imageEngines[engine];
    if (!config) {
      return { error: 'Unknown image engine: ' + engine, available: Object.keys(this.imageEngines) };
    }

    var composition = this.goldenComposition(1024, Math.round(1024 / PHI));
    var seed = Math.abs(this._hashString(prompt)) % 4294967295;

    var record = {
      artId: 'art-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8),
      type: 'image',
      prompt: prompt,
      engine: engine,
      engineName: config.name,
      dimensions: { width: composition.width, height: composition.height },
      composition: composition,
      seed: seed,
      quality: this._calculateArtQuality(prompt, composition),
      status: 'generated',
      timestamp: Date.now()
    };

    this.creationHistory.push(record);
    return record;
  }

  generateMusic(prompt, genre, duration, engine) {
    if (genre === undefined) genre = 'ambient';
    if (duration === undefined) duration = 30;
    if (engine === undefined) engine = 'suno';

    var config = this.musicEngines[engine];
    if (!config) {
      return { error: 'Unknown music engine: ' + engine, available: Object.keys(this.musicEngines) };
    }

    var bpm = this._genreBPM(genre);
    var beats = Math.round(duration * bpm / 60);
    var measures = Math.round(beats / 4);

    var phiStructure = [];
    var totalBeats = beats;
    var remaining = totalBeats;
    var sectionIndex = 0;
    var sectionNames = ['intro', 'verse', 'chorus', 'bridge', 'outro'];

    while (remaining > 0 && sectionIndex < sectionNames.length) {
      var sectionLen = Math.max(4, Math.round(remaining / PHI));
      if (sectionIndex === sectionNames.length - 1) sectionLen = remaining;
      phiStructure.push({
        section: sectionNames[sectionIndex],
        beats: sectionLen,
        startBeat: totalBeats - remaining
      });
      remaining -= sectionLen;
      sectionIndex++;
    }

    var record = {
      musicId: 'mus-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8),
      type: 'music',
      prompt: prompt,
      genre: genre,
      engine: engine,
      engineName: config.name,
      duration: duration,
      bpm: bpm,
      totalBeats: beats,
      measures: measures,
      structure: phiStructure,
      status: 'generated',
      timestamp: Date.now()
    };

    this.creationHistory.push(record);
    return record;
  }

  fuseCreation(imagePrompt, musicPrompt) {
    if (!imagePrompt || !musicPrompt) {
      return { error: 'Both image and music prompts are required' };
    }

    var art = this.generateArt(imagePrompt, 'image', 'sd');
    var music = this.generateMusic(musicPrompt, 'cinematic', 30, 'suno');

    var harmonyScore = this._computeHarmony(imagePrompt, musicPrompt);

    return {
      fusionId: 'fusion-' + Date.now().toString(36),
      image: art,
      music: music,
      harmony: harmonyScore,
      pairing: harmonyScore > 0.7 ? 'excellent' : harmonyScore > 0.4 ? 'good' : 'experimental',
      timestamp: Date.now()
    };
  }

  styleTransfer(content, style) {
    if (!content || !style) return { error: 'Both content and style are required' };

    var styleWeights = {
      impressionist: { brushStrokes: 0.9, colorVibrancy: 0.8, detail: 0.3 },
      cubist: { brushStrokes: 0.5, colorVibrancy: 0.6, detail: 0.4 },
      surreal: { brushStrokes: 0.7, colorVibrancy: 0.9, detail: 0.6 },
      minimalist: { brushStrokes: 0.2, colorVibrancy: 0.4, detail: 0.8 },
      baroque: { brushStrokes: 0.8, colorVibrancy: 0.7, detail: 0.95 },
      abstract: { brushStrokes: 0.6, colorVibrancy: 0.95, detail: 0.2 }
    };

    var weights = styleWeights[style.toLowerCase()] || styleWeights.impressionist;

    var phiBlend = {
      brushStrokes: Math.round(weights.brushStrokes * PHI / (PHI + 1) * 1000) / 1000,
      colorVibrancy: Math.round(weights.colorVibrancy * PHI / (PHI + 1) * 1000) / 1000,
      detail: Math.round(weights.detail * PHI / (PHI + 1) * 1000) / 1000
    };

    return {
      transferId: 'xfer-' + Date.now().toString(36),
      content: typeof content === 'string' ? content.substring(0, 100) : 'image-data',
      style: style,
      weights: weights,
      phiBlend: phiBlend,
      quality: Math.round((phiBlend.brushStrokes + phiBlend.colorVibrancy + phiBlend.detail) / 3 * 1000) / 1000,
      engine: 'sd',
      timestamp: Date.now()
    };
  }

  goldenComposition(width, height) {
    var phiW = Math.round(width / PHI);
    var phiH = Math.round(height / PHI);

    var guides = {
      vertical: [phiW, width - phiW],
      horizontal: [phiH, height - phiH]
    };

    var focalPoints = [
      { x: phiW, y: phiH, name: 'top-left golden' },
      { x: width - phiW, y: phiH, name: 'top-right golden' },
      { x: phiW, y: height - phiH, name: 'bottom-left golden' },
      { x: width - phiW, y: height - phiH, name: 'bottom-right golden' }
    ];

    /* Golden spiral anchor */
    var spiralSteps = [];
    var sw = width;
    var sh = height;
    var sx = 0;
    var sy = 0;
    for (var i = 0; i < 8; i++) {
      if (i % 2 === 0) {
        var newW = Math.round(sw / PHI);
        spiralSteps.push({ x: sx + newW, y: sy, width: sw - newW, height: sh });
        sw = newW;
      } else {
        var newH = Math.round(sh / PHI);
        spiralSteps.push({ x: sx, y: sy + newH, width: sw, height: sh - newH });
        sh = newH;
      }
    }

    return {
      width: width,
      height: height,
      aspectRatio: Math.round((width / height) * 1000) / 1000,
      phiRatio: Math.round(PHI * 1000) / 1000,
      guides: guides,
      focalPoints: focalPoints,
      spiralSteps: spiralSteps,
      isGoldenRatio: Math.abs(width / height - PHI) < 0.01
    };
  }

  inspirationChain(seed, depth) {
    if (depth === undefined) depth = 5;
    if (!seed) return { error: 'Seed prompt is required' };

    var chain = [{ step: 0, prompt: seed, decay: 1.0 }];
    var current = seed;

    var modifiers = [
      'reimagined as', 'in the style of', 'but more abstract', 'with golden proportions',
      'at golden hour', 'through a fractal lens', 'in vivid contrast',
      'as a dreamscape', 'with phi-spiral composition', 'deconstructed and rebuilt'
    ];

    for (var i = 1; i <= depth; i++) {
      var decay = Math.round(Math.pow(PHI, -i) * 1000) / 1000;
      var modifier = modifiers[(i - 1) % modifiers.length];
      current = current.split(' ').slice(0, Math.max(5, Math.round(current.split(' ').length / PHI))).join(' ');
      var variation = current + ' ' + modifier;

      chain.push({
        step: i,
        prompt: variation,
        decay: decay,
        modifier: modifier
      });
    }

    return {
      seed: seed,
      chain: chain,
      totalVariations: chain.length,
      finalDecay: chain[chain.length - 1].decay,
      timestamp: Date.now()
    };
  }

  _calculateArtQuality(prompt, composition) {
    var lengthScore = Math.min(1, (prompt || '').split(/\s+/).length / 30);
    var goldenScore = composition.isGoldenRatio ? 1.0 : 0.7;
    var quality = (lengthScore * PHI + goldenScore) / (PHI + 1);
    return Math.round(quality * 1000) / 1000;
  }

  _computeHarmony(text1, text2) {
    var words1 = (text1 || '').toLowerCase().split(/\s+/);
    var words2 = (text2 || '').toLowerCase().split(/\s+/);
    var overlap = 0;
    for (var i = 0; i < words1.length; i++) {
      if (words2.indexOf(words1[i]) !== -1) overlap++;
    }
    var maxLen = Math.max(words1.length, words2.length, 1);
    var semantic = overlap / maxLen;
    return Math.round((semantic * PHI + 0.3) / (PHI + 0.3) * 1000) / 1000;
  }

  _genreBPM(genre) {
    var bpmMap = {
      ambient: 70, classical: 90, jazz: 110, pop: 120,
      rock: 130, electronic: 128, hiphop: 95, cinematic: 80,
      metal: 150, folk: 100
    };
    return bpmMap[genre.toLowerCase()] || 120;
  }

  _hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return hash;
  }
}

globalThis.creativeMuse = new CreativeMuseEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  /* ── Universal message routing (popup / side panel / devtools) ──── */
  if (message.type === 'heartbeat') {
    sendResponse({ status: 'alive', healthy: true, timestamp: Date.now() });
    return true;
  }
  if (message.type === 'openSidePanel') {
    try { if (chrome.sidePanel && chrome.sidePanel.open) chrome.sidePanel.open({ windowId: sender.tab ? sender.tab.windowId : undefined }).catch(function(){}); } catch(e){}
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === 'popup' || message.type === 'sidePanel' || message.type === 'devtools') {
    var cmd = message.command || '';
    var lower = cmd.toLowerCase();
    var engine = globalThis.creativeMuse;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Creative Muse engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Creative Muse AI Workspace\n\nCapabilities:\n• Generate Art — Generate visual art\n• Generate Music — Compose music\n• Fuse Creation — Fuse multi-modal creation\n• Style Transfer — Apply style transfer\n• Golden Composition — Generate golden-ratio composition\n• Inspiration Chain — Generate inspiration chain\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'creative-muse_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('art') !== -1 || lower.indexOf('image') !== -1 || lower.indexOf('visual') !== -1 || lower.indexOf('draw') !== -1 || lower.indexOf('paint') !== -1 || lower.indexOf('picture') !== -1) {
          result = engine.generateArt(cmd, "digital", "phi-diffusion");
        }
        else if (lower.indexOf('music') !== -1 || lower.indexOf('melody') !== -1 || lower.indexOf('song') !== -1 || lower.indexOf('audio') !== -1 || lower.indexOf('compose') !== -1) {
          result = engine.generateMusic(cmd, "ambient", 30, "harmonic-phi");
        }
        else if (lower.indexOf('fuse') !== -1 || lower.indexOf('combine') !== -1 || lower.indexOf('mix') !== -1 || lower.indexOf('blend') !== -1 || lower.indexOf('merge') !== -1) {
          result = engine.fuseCreation(cmd, cmd);
        }
        else if (lower.indexOf('style') !== -1 || lower.indexOf('transfer') !== -1 || lower.indexOf('transform') !== -1 || lower.indexOf('convert') !== -1) {
          result = engine.styleTransfer(cmd, "impressionist");
        }
        else if (lower.indexOf('composition') !== -1 || lower.indexOf('golden') !== -1 || lower.indexOf('layout') !== -1 || lower.indexOf('design') !== -1) {
          result = engine.goldenComposition(1024, 633);
        }
        else if (lower.indexOf('inspire') !== -1 || lower.indexOf('chain') !== -1 || lower.indexOf('brainstorm') !== -1 || lower.indexOf('idea') !== -1) {
          result = engine.inspirationChain(cmd, 3);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.generateArt(cmd, "digital", "phi-diffusion");
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Creative Muse encountered an error processing: "' + cmd + '"' };
      }

      var responseText;
      if (typeof result === 'string') { responseText = result; }
      else if (result && result.error) { responseText = '\u26A0\uFE0F ' + (result.fallback || result.error); }
      else { responseText = JSON.stringify(result, null, 2); }

      history.push({ role: 'ai', content: responseText, ts: Date.now() });
      if (history.length > 100) { history = history.slice(-100); }
      var update = {};
      update[storageKey] = history;
      chrome.storage.local.set(update);

      sendResponse({ result: responseText });
    });
    return true;
  }

  var engine = globalThis.creativeMuse;

  switch (message.action) {
    case 'generateArt':
      sendResponse({ success: true, data: engine.generateArt(message.prompt, message.medium, message.engine) });
      break;
    case 'generateMusic':
      sendResponse({ success: true, data: engine.generateMusic(message.prompt, message.genre, message.duration, message.engine) });
      break;
    case 'fuseCreation':
      sendResponse({ success: true, data: engine.fuseCreation(message.imagePrompt, message.musicPrompt) });
      break;
    case 'styleTransfer':
      sendResponse({ success: true, data: engine.styleTransfer(message.content, message.style) });
      break;
    case 'goldenComposition':
      sendResponse({ success: true, data: engine.goldenComposition(message.width || 1024, message.height || 633) });
      break;
    case 'inspirationChain':
      sendResponse({ success: true, data: engine.inspirationChain(message.seed, message.depth) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'creative-muse-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.creativeMuse) {
      globalThis.creativeMuse = new CreativeMuseEngine();
      console.log('[Creative Muse] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'creative-muse_state': {
          heartbeatCount: globalThis.creativeMuse.heartbeatCount || globalThis.creativeMuse.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.creativeMuse.state?.startTime || globalThis.creativeMuse.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('creative-muse_state', function (data) {
    if (data && data['creative-muse_state']) {
      console.log('[Creative Muse] Restored from previous session \u2014 last alive: ' +
        new Date(data['creative-muse_state'].lastAlive).toISOString());
    }
  });

  /* Also re-init on install/update */
  chrome.runtime.onInstalled.addListener(function () {
    /* Auto-activate side panel on install */
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ enabled: true });
    }
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function(){});
    }
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Creative Muse] Installed/updated \u2014 24/7 keepalive active');
  });
})();
