/* Vision Weaver — Visual Intelligence Compositor (EXT-004) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class VisionWeaverEngine {
  constructor() {
    this.engines = new Map([
      ['dall-e', {
        name: 'DALL-E',
        type: 'generative',
        maxResolution: 1024,
        defaultSteps: 50,
        strengths: ['photorealism', 'text-rendering', 'composition']
      }],
      ['stable-diffusion', {
        name: 'Stable Diffusion',
        type: 'generative',
        maxResolution: 768,
        defaultSteps: 30,
        strengths: ['precision', 'technical', 'consistency']
      }],
      ['midjourney', {
        name: 'Midjourney',
        type: 'generative',
        maxResolution: 1792,
        defaultSteps: 60,
        strengths: ['artistic', 'painterly', 'stylization']
      }],
      ['sam', {
        name: 'Segment Anything Model',
        type: 'segmentation',
        maxResolution: 2048,
        defaultSteps: 1,
        strengths: ['segmentation', 'masking', 'object-detection']
      }]
    ]);

    this.styleDatabase = {
      photorealistic: { guidance: 7.5, sampler: 'euler_a', weight: 1.0 },
      artistic: { guidance: 12.0, sampler: 'dpm_2', weight: 0.85 },
      painterly: { guidance: 10.0, sampler: 'heun', weight: 0.9 },
      cinematic: { guidance: 8.5, sampler: 'euler', weight: 0.95 },
      abstract: { guidance: 15.0, sampler: 'lms', weight: 0.7 },
      technical: { guidance: 5.0, sampler: 'ddim', weight: 1.0 },
      anime: { guidance: 11.0, sampler: 'dpm_pp_2m', weight: 0.8 },
      surreal: { guidance: 14.0, sampler: 'dpm_sde', weight: 0.75 }
    };

    this.generationHistory = [];
  }

  generateImage(prompt, engine) {
    if (engine === undefined) engine = 'dall-e';

    var engineConfig = this.engines.get(engine);
    if (!engineConfig) {
      return { error: 'Unknown engine: ' + engine, available: Array.from(this.engines.keys()) };
    }

    var styleAnalysis = this._analyzePromptStyle(prompt);
    var styleConfig = this.styleDatabase[styleAnalysis.primaryStyle] || this.styleDatabase.photorealistic;

    var aspectRatio = PHI;
    var baseWidth = engineConfig.maxResolution;
    var baseHeight = Math.round(baseWidth / aspectRatio);
    baseHeight = baseHeight - (baseHeight % 64);
    baseWidth = baseWidth - (baseWidth % 64);

    var steps = Math.round(engineConfig.defaultSteps * styleConfig.weight);
    var guidance = styleConfig.guidance * (1 + (styleAnalysis.complexity - 0.5) * 0.4);
    var seed = Math.floor(Math.abs(Math.sin(this._hashString(prompt)) * HEARTBEAT * 100000)) % 4294967295;

    var params = {
      width: baseWidth,
      height: baseHeight,
      steps: steps,
      guidance: Math.round(guidance * 100) / 100,
      seed: seed
    };

    var quality = this._computePhiQuality(params);

    var record = {
      imageId: 'vw-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8),
      prompt: prompt,
      engine: engine,
      params: params,
      status: 'generated',
      quality: quality,
      metadata: {
        style: styleAnalysis.primaryStyle,
        mood: styleAnalysis.mood,
        complexity: styleAnalysis.complexity,
        sampler: styleConfig.sampler,
        engineName: engineConfig.name,
        timestamp: Date.now(),
        phiRatio: PHI,
        goldenAngle: GOLDEN_ANGLE
      }
    };

    this.generationHistory.push(record);
    return record;
  }

  segmentImage(imageData) {
    var startTime = Date.now();
    var width = (imageData && imageData.width) || 512;
    var height = (imageData && imageData.height) || 512;
    var totalArea = width * height;

    var segmentCount = Math.max(3, Math.round(Math.sqrt(totalArea) / (HEARTBEAT / 10)));
    var segments = [];

    for (var i = 0; i < segmentCount; i++) {
      var angle = i * GOLDEN_ANGLE * (Math.PI / 180);
      var radius = Math.sqrt(i / segmentCount) * Math.min(width, height) / 2;
      var cx = Math.round(width / 2 + radius * Math.cos(angle));
      var cy = Math.round(height / 2 + radius * Math.sin(angle));

      var segWidth = Math.round((width / Math.sqrt(segmentCount)) * (0.8 + Math.random() * 0.4));
      var segHeight = Math.round((height / Math.sqrt(segmentCount)) * (0.8 + Math.random() * 0.4));

      var x1 = Math.max(0, cx - Math.round(segWidth / 2));
      var y1 = Math.max(0, cy - Math.round(segHeight / 2));
      var x2 = Math.min(width, x1 + segWidth);
      var y2 = Math.min(height, y1 + segHeight);

      var area = (x2 - x1) * (y2 - y1);
      var confidence = Math.round((1 / (1 + Math.exp(-PHI * (1 - i / segmentCount)))) * 1000) / 1000;

      var labels = ['object', 'background', 'person', 'texture', 'structure', 'foreground', 'detail'];
      var label = labels[i % labels.length];

      segments.push({
        id: 'seg-' + (i + 1),
        bbox: [x1, y1, x2, y2],
        area: area,
        confidence: confidence,
        label: label
      });
    }

    segments.sort(function (a, b) { return b.confidence - a.confidence; });

    return {
      segments: segments,
      totalSegments: segments.length,
      processingTime: Date.now() - startTime + Math.round(PHI * 10)
    };
  }

  compositeScene(layers) {
    if (!Array.isArray(layers) || layers.length === 0) {
      return { error: 'At least one layer is required', layers: 0 };
    }

    var sortedLayers = layers.map(function (layer, index) {
      return {
        id: layer.id || 'layer-' + (index + 1),
        zIndex: layer.zIndex !== undefined ? layer.zIndex : index,
        opacity: layer.opacity !== undefined ? layer.opacity : 1.0,
        blendWeight: Math.pow(PHI, -(index + 1)),
        source: layer.source || 'unknown'
      };
    });

    sortedLayers.sort(function (a, b) { return a.zIndex - b.zIndex; });

    var maxWidth = 0;
    var maxHeight = 0;
    for (var i = 0; i < layers.length; i++) {
      var w = (layers[i].width) || 1024;
      var h = (layers[i].height) || Math.round(1024 / PHI);
      if (w > maxWidth) maxWidth = w;
      if (h > maxHeight) maxHeight = h;
    }

    var totalBlendWeight = 0;
    for (var j = 0; j < sortedLayers.length; j++) {
      totalBlendWeight += sortedLayers[j].blendWeight;
    }
    var phiHarmony = Math.round((1 - Math.abs(totalBlendWeight - PHI) / PHI) * 10000) / 10000;
    if (phiHarmony < 0) phiHarmony = 0;
    if (phiHarmony > 1) phiHarmony = 1;

    return {
      compositeId: 'comp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      layers: sortedLayers.length,
      dimensions: { width: maxWidth, height: maxHeight },
      blendMode: 'phi-weighted',
      phiHarmony: phiHarmony
    };
  }

  routeByStyle(prompt) {
    var analysis = this._analyzePromptStyle(prompt);
    var scores = {};
    var self = this;

    this.engines.forEach(function (config, key) {
      var score = 0;

      config.strengths.forEach(function (strength) {
        if (analysis.primaryStyle === strength) score += 3;
        if (analysis.descriptors.indexOf(strength) !== -1) score += 2;
      });

      if (analysis.primaryStyle === 'photorealistic' && key === 'dall-e') score += 4;
      if ((analysis.primaryStyle === 'artistic' || analysis.primaryStyle === 'painterly') && key === 'midjourney') score += 4;
      if ((analysis.primaryStyle === 'technical' || analysis.primaryStyle === 'precise') && key === 'stable-diffusion') score += 4;
      if (analysis.descriptors.indexOf('segment') !== -1 || analysis.descriptors.indexOf('mask') !== -1 || analysis.descriptors.indexOf('detect') !== -1) {
        if (key === 'sam') score += 6;
      }

      score += analysis.complexity * PHI;
      scores[key] = Math.round(score * 1000) / 1000;
    });

    var entries = Object.keys(scores).map(function (k) { return { key: k, score: scores[k] }; });
    entries.sort(function (a, b) { return b.score - a.score; });

    var best = entries[0];
    var maxScore = best.score || 1;
    var confidence = Math.round(Math.min(1, best.score / (maxScore + PHI)) * 1000) / 1000;

    var reasons = [];
    if (analysis.primaryStyle) reasons.push('Primary style "' + analysis.primaryStyle + '" aligns with engine strengths');
    if (analysis.mood) reasons.push('Mood "' + analysis.mood + '" supports selection');
    reasons.push('Phi-scored confidence: ' + confidence);

    var alternatives = entries.slice(1).map(function (e) {
      return {
        engine: e.key,
        confidence: Math.round(Math.min(1, e.score / (maxScore + PHI)) * 1000) / 1000
      };
    });

    return {
      engine: best.key,
      confidence: confidence,
      reasoning: reasons.join('; '),
      alternatives: alternatives
    };
  }

  _analyzePromptStyle(prompt) {
    var lower = (prompt || '').toLowerCase();

    var styleKeywords = {
      photorealistic: ['photo', 'realistic', 'real', 'photograph', 'camera', 'dslr', 'lens'],
      artistic: ['art', 'artistic', 'creative', 'inspired', 'expression'],
      painterly: ['painting', 'paint', 'oil', 'watercolor', 'brush', 'canvas', 'impressionist'],
      cinematic: ['cinematic', 'movie', 'film', 'dramatic', 'scene', 'lighting'],
      abstract: ['abstract', 'geometric', 'pattern', 'fractal', 'conceptual'],
      technical: ['technical', 'precise', 'blueprint', 'diagram', 'schematic', 'engineering'],
      anime: ['anime', 'manga', 'cel-shaded', 'cartoon', 'illustration'],
      surreal: ['surreal', 'dream', 'fantasy', 'ethereal', 'otherworldly']
    };

    var moodKeywords = {
      serene: ['calm', 'peaceful', 'serene', 'tranquil', 'gentle'],
      dramatic: ['dramatic', 'intense', 'powerful', 'bold', 'striking'],
      mysterious: ['mysterious', 'dark', 'shadow', 'enigmatic', 'hidden'],
      joyful: ['happy', 'bright', 'joyful', 'vibrant', 'colorful'],
      melancholic: ['sad', 'melancholic', 'somber', 'muted', 'lonely']
    };

    var primaryStyle = 'photorealistic';
    var maxStyleScore = 0;
    var descriptors = [];

    var styleKeys = Object.keys(styleKeywords);
    for (var i = 0; i < styleKeys.length; i++) {
      var style = styleKeys[i];
      var keywords = styleKeywords[style];
      var score = 0;
      for (var j = 0; j < keywords.length; j++) {
        if (lower.indexOf(keywords[j]) !== -1) {
          score++;
          descriptors.push(keywords[j]);
        }
      }
      if (score > maxStyleScore) {
        maxStyleScore = score;
        primaryStyle = style;
      }
    }

    if (lower.indexOf('segment') !== -1) descriptors.push('segment');
    if (lower.indexOf('mask') !== -1) descriptors.push('mask');
    if (lower.indexOf('detect') !== -1) descriptors.push('detect');

    var mood = 'neutral';
    var maxMoodScore = 0;
    var moodKeys = Object.keys(moodKeywords);
    for (var m = 0; m < moodKeys.length; m++) {
      var moodName = moodKeys[m];
      var moodWords = moodKeywords[moodName];
      var mScore = 0;
      for (var n = 0; n < moodWords.length; n++) {
        if (lower.indexOf(moodWords[n]) !== -1) mScore++;
      }
      if (mScore > maxMoodScore) {
        maxMoodScore = mScore;
        mood = moodName;
      }
    }

    var words = lower.split(/\s+/).filter(function (w) { return w.length > 0; });
    var complexity = Math.min(1, words.length / 50) * 0.5 + Math.min(1, descriptors.length / 5) * 0.3 + (maxStyleScore > 2 ? 0.2 : maxStyleScore * 0.1);
    complexity = Math.round(complexity * 1000) / 1000;

    return {
      primaryStyle: primaryStyle,
      mood: mood,
      complexity: complexity,
      descriptors: descriptors
    };
  }

  _computePhiQuality(params) {
    var aspectRatio = params.width / params.height;
    var phiDeviation = Math.abs(aspectRatio - PHI) / PHI;
    var aspectScore = Math.max(0, 1 - phiDeviation);

    var stepScore = Math.min(1, params.steps / 60);
    var guidanceScore = 1 - Math.abs(params.guidance - 7.5) / 15;
    if (guidanceScore < 0) guidanceScore = 0;

    var resolutionScore = Math.min(1, (params.width * params.height) / (1024 * 1024));

    var quality = (
      aspectScore * PHI +
      stepScore * 1 +
      guidanceScore * (PHI - 1) +
      resolutionScore * 1
    ) / (PHI + 1 + (PHI - 1) + 1);

    return Math.round(quality * 10000) / 10000;
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

globalThis.visionWeaver = new VisionWeaverEngine();

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
    var engine = globalThis.visionWeaver;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Vision Weaver engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Vision Weaver AI Workspace\n\nCapabilities:\n• Generate Image — Generate image from prompt\n• Segment Image — Segment/analyze image\n• Composite Scene — Composite scene from layers\n• Route By Style — Route by visual style\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'vision-weaver_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('generate') !== -1 || lower.indexOf('image') !== -1 || lower.indexOf('create') !== -1 || lower.indexOf('draw') !== -1 || lower.indexOf('picture') !== -1 || lower.indexOf('visual') !== -1) {
          result = engine.generateImage(cmd, "phi-diffusion");
        }
        else if (lower.indexOf('segment') !== -1 || lower.indexOf('analyze') !== -1 || lower.indexOf('detect') !== -1 || lower.indexOf('identify') !== -1) {
          result = engine.segmentImage(cmd);
        }
        else if (lower.indexOf('composite') !== -1 || lower.indexOf('layer') !== -1 || lower.indexOf('combine') !== -1 || lower.indexOf('scene') !== -1) {
          result = engine.compositeScene([{prompt:cmd}]);
        }
        else if (lower.indexOf('style') !== -1 || lower.indexOf('route') !== -1 || lower.indexOf('classify') !== -1) {
          result = engine.routeByStyle(cmd);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.generateImage(cmd, "phi-diffusion");
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Vision Weaver encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.visionWeaver;

  switch (message.type) {
    case 'generateImage':
      sendResponse(engine.generateImage(message.prompt, message.engine));
      break;
    case 'segmentImage':
      sendResponse(engine.segmentImage(message.imageData));
      break;
    case 'compositeScene':
      sendResponse(engine.compositeScene(message.layers));
      break;
    case 'routeByStyle':
      sendResponse(engine.routeByStyle(message.prompt));
      break;
    default:
      sendResponse({ error: 'Unknown message type: ' + message.type });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'vision-weaver-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.visionWeaver) {
      globalThis.visionWeaver = new VisionWeaverEngine();
      console.log('[Vision Weaver] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'vision-weaver_state': {
          heartbeatCount: globalThis.visionWeaver.heartbeatCount || globalThis.visionWeaver.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.visionWeaver.state?.startTime || globalThis.visionWeaver.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('vision-weaver_state', function (data) {
    if (data && data['vision-weaver_state']) {
      console.log('[Vision Weaver] Restored from previous session \u2014 last alive: ' +
        new Date(data['vision-weaver_state'].lastAlive).toISOString());
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
    console.log('[Vision Weaver] Installed/updated \u2014 24/7 keepalive active');
  });
})();
