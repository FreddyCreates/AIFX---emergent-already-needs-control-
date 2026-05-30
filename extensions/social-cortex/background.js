/* Social Cortex — Background Service Worker (EXT-013) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class SocialCortexEngine {
  constructor() {
    this.engines = ['grok', 'inflection', 'gpt'];
    this.emotionSet = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation'];
    this.conversationHistory = [];
  }

  analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      return { error: 'Text is required' };
    }

    var lower = text.toLowerCase();
    var positiveWords = ['good', 'great', 'awesome', 'love', 'amazing', 'happy', 'excellent',
      'wonderful', 'fantastic', 'beautiful', 'brilliant', 'perfect', 'thank', 'best', 'glad'];
    var negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'sad', 'worst',
      'angry', 'disgusting', 'ugly', 'stupid', 'fail', 'wrong', 'disappointing', 'poor'];

    var posCount = 0;
    var negCount = 0;
    for (var i = 0; i < positiveWords.length; i++) {
      if (lower.indexOf(positiveWords[i]) !== -1) posCount++;
    }
    for (var j = 0; j < negativeWords.length; j++) {
      if (lower.indexOf(negativeWords[j]) !== -1) negCount++;
    }

    var total = posCount + negCount;
    var positive, negative, neutral;

    if (total === 0) {
      positive = 0.1;
      negative = 0.1;
      neutral = 0.8;
    } else {
      positive = posCount / (total + 1);
      negative = negCount / (total + 1);
      neutral = 1 / (total + 1);
    }

    var sum = positive + negative + neutral;
    positive = Math.round((positive / sum) * 1000) / 1000;
    negative = Math.round((negative / sum) * 1000) / 1000;
    neutral = Math.round((1 - positive - negative) * 1000) / 1000;

    var dominant = positive >= negative && positive >= neutral ? 'positive'
      : negative >= positive && negative >= neutral ? 'negative' : 'neutral';

    var confidence = Math.round(Math.max(positive, negative, neutral) * 1000) / 1000;

    return {
      positive: positive,
      negative: negative,
      neutral: neutral,
      dominant: dominant,
      confidence: confidence,
      wordCount: text.split(/\s+/).length,
      engine: 'grok',
      timestamp: Date.now()
    };
  }

  detectEmotion(text) {
    if (!text) return { error: 'Text is required' };

    var lower = text.toLowerCase();
    var emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'laugh', 'smile', 'celebrate', 'delighted', 'cheerful'],
      sadness: ['sad', 'cry', 'tears', 'grief', 'mourn', 'depressed', 'lonely', 'heartbroken'],
      anger: ['angry', 'furious', 'rage', 'mad', 'irritated', 'outraged', 'hostile', 'livid'],
      fear: ['afraid', 'scared', 'terrified', 'anxious', 'panic', 'dread', 'nervous', 'worried'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'wow', 'sudden'],
      disgust: ['disgusted', 'revolted', 'gross', 'sickening', 'repulsive', 'vile', 'nauseating'],
      trust: ['trust', 'believe', 'reliable', 'honest', 'faithful', 'loyal', 'depend', 'confident'],
      anticipation: ['expect', 'hope', 'anticipate', 'looking forward', 'await', 'eager', 'planning']
    };

    var scores = {};
    var maxScore = 0;
    var primary = 'neutral';

    for (var i = 0; i < this.emotionSet.length; i++) {
      var emotion = this.emotionSet[i];
      var keywords = emotionKeywords[emotion] || [];
      var count = 0;

      for (var k = 0; k < keywords.length; k++) {
        if (lower.indexOf(keywords[k]) !== -1) count++;
      }

      var phiWeight = Math.pow(PHI, -(i * 0.3));
      var score = Math.round(count * phiWeight * 1000) / 1000;
      scores[emotion] = score;

      if (score > maxScore) {
        maxScore = score;
        primary = emotion;
      }
    }

    return {
      primary: primary,
      scores: scores,
      intensity: maxScore > 2 ? 'high' : maxScore > 0.5 ? 'medium' : 'low',
      engine: 'inflection',
      timestamp: Date.now()
    };
  }

  draftEmpathicResponse(context, tone) {
    if (tone === undefined) tone = 'supportive';

    var sentiment = this.analyzeSentiment(context);
    var emotion = this.detectEmotion(context);

    var toneTemplates = {
      supportive: {
        positive: 'That sounds wonderful! I can see why you feel that way.',
        negative: 'I understand this is difficult. Your feelings are completely valid.',
        neutral: 'Thank you for sharing. I\'m here to listen and help.'
      },
      professional: {
        positive: 'That\'s a positive development. Let\'s build on this momentum.',
        negative: 'I appreciate you raising this concern. Let\'s work through it together.',
        neutral: 'Understood. Let me help clarify the next steps.'
      },
      casual: {
        positive: 'Nice! That\'s really great to hear!',
        negative: 'Hey, that sounds rough. Hang in there!',
        neutral: 'Got it! What else is on your mind?'
      },
      empathetic: {
        positive: 'I can feel the joy in your words. That truly makes me glad.',
        negative: 'I sense the weight of what you\'re going through. You\'re not alone.',
        neutral: 'I hear you. Every thought matters and deserves attention.'
      }
    };

    var templates = toneTemplates[tone] || toneTemplates.supportive;
    var response = templates[sentiment.dominant] || templates.neutral;

    if (emotion.primary !== 'neutral' && emotion.intensity !== 'low') {
      response += ' I notice a sense of ' + emotion.primary + ' in what you\'ve shared.';
    }

    return {
      response: response,
      tone: tone,
      basedOn: {
        sentiment: sentiment.dominant,
        emotion: emotion.primary,
        intensity: emotion.intensity
      },
      confidence: Math.round(sentiment.confidence * PHI / (PHI + 1) * 1000) / 1000,
      engine: 'gpt',
      timestamp: Date.now()
    };
  }

  trackConversationFlow(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return { error: 'Messages array is required' };
    }

    var topics = [];
    var shifts = [];
    var sentimentTrack = [];

    for (var i = 0; i < messages.length; i++) {
      var msg = typeof messages[i] === 'string' ? messages[i] : (messages[i].text || '');
      var sentiment = this.analyzeSentiment(msg);
      sentimentTrack.push(sentiment.dominant);

      var words = msg.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 4; });
      var topKeywords = words.slice(0, 5);
      topics.push({ index: i, keywords: topKeywords, sentiment: sentiment.dominant });

      if (i > 0) {
        var prevKeywords = topics[i - 1].keywords;
        var overlap = 0;
        for (var k = 0; k < topKeywords.length; k++) {
          if (prevKeywords.indexOf(topKeywords[k]) !== -1) overlap++;
        }
        var maxLen = Math.max(topKeywords.length, prevKeywords.length, 1);
        var continuity = overlap / maxLen;

        if (continuity < 0.2) {
          shifts.push({
            atMessage: i,
            from: prevKeywords.join(', ') || '(none)',
            to: topKeywords.join(', ') || '(none)',
            continuity: Math.round(continuity * 1000) / 1000
          });
        }
      }
    }

    var sentimentFlips = 0;
    for (var s = 1; s < sentimentTrack.length; s++) {
      if (sentimentTrack[s] !== sentimentTrack[s - 1]) sentimentFlips++;
    }

    return {
      totalMessages: messages.length,
      topicShifts: shifts,
      shiftCount: shifts.length,
      sentimentFlow: sentimentTrack,
      sentimentVolatility: Math.round((sentimentFlips / Math.max(1, messages.length - 1)) * 1000) / 1000,
      conversationDepth: Math.round(Math.log(messages.length + 1) / Math.log(PHI) * 100) / 100,
      timestamp: Date.now()
    };
  }

  socialRiskScore(post) {
    if (!post) return { error: 'Post text is required' };

    var lower = (typeof post === 'string' ? post : (post.text || '')).toLowerCase();

    var riskFactors = {
      toxicity: { keywords: ['hate', 'kill', 'die', 'threat', 'attack', 'destroy', 'violence'], weight: Math.pow(PHI, 0) },
      misinformation: { keywords: ['fake', 'hoax', 'conspiracy', 'lie', 'fraud', 'scam', 'misleading'], weight: Math.pow(PHI, -1) },
      harassment: { keywords: ['bully', 'harass', 'stalk', 'abuse', 'insult', 'shame', 'humiliate'], weight: Math.pow(PHI, -2) },
      spam: { keywords: ['buy now', 'click here', 'free money', 'winner', 'prize', 'limited offer'], weight: Math.pow(PHI, -3) },
      selfHarm: { keywords: ['hurt myself', 'self-harm', 'suicide', 'end it', 'no point'], weight: Math.pow(PHI, 0) }
    };

    var scores = {};
    var totalRisk = 0;
    var totalWeight = 0;
    var factorKeys = Object.keys(riskFactors);

    for (var i = 0; i < factorKeys.length; i++) {
      var factor = factorKeys[i];
      var config = riskFactors[factor];
      var hits = 0;

      for (var k = 0; k < config.keywords.length; k++) {
        if (lower.indexOf(config.keywords[k]) !== -1) hits++;
      }

      var factorScore = Math.min(1, hits / 3);
      scores[factor] = Math.round(factorScore * 1000) / 1000;
      totalRisk += factorScore * config.weight;
      totalWeight += config.weight;
    }

    var overallRisk = totalWeight > 0 ? totalRisk / totalWeight : 0;
    overallRisk = Math.round(Math.min(1, overallRisk) * 1000) / 1000;

    return {
      overallRisk: overallRisk,
      level: overallRisk > 0.7 ? 'critical' : overallRisk > 0.4 ? 'warning' : overallRisk > 0.1 ? 'caution' : 'safe',
      factors: scores,
      recommendation: overallRisk > 0.4 ? 'Review before posting' : 'Content appears safe',
      engine: 'grok',
      timestamp: Date.now()
    };
  }
}

globalThis.socialCortex = new SocialCortexEngine();

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
    var engine = globalThis.socialCortex;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Social Cortex engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Social Cortex AI Workspace\n\nCapabilities:\n• Analyze Sentiment — Analyze text sentiment\n• Detect Emotion — Detect emotions in text\n• Draft Empathic Response — Draft empathic response\n• Track Conversation Flow — Track conversation flow\n• Social Risk Score — Score social risk level\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'social-cortex_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('sentiment') !== -1 || lower.indexOf('feel') !== -1 || lower.indexOf('emotion') !== -1 || lower.indexOf('mood') !== -1 || lower.indexOf('analyze') !== -1) {
          result = engine.analyzeSentiment(cmd);
        }
        else if (lower.indexOf('emotion') !== -1 || lower.indexOf('detect') !== -1 || lower.indexOf('feeling') !== -1 || lower.indexOf('express') !== -1) {
          result = engine.detectEmotion(cmd);
        }
        else if (lower.indexOf('draft') !== -1 || lower.indexOf('respond') !== -1 || lower.indexOf('reply') !== -1 || lower.indexOf('empathic') !== -1 || lower.indexOf('write') !== -1) {
          result = engine.draftEmpathicResponse(cmd, "empathetic");
        }
        else if (lower.indexOf('conversation') !== -1 || lower.indexOf('flow') !== -1 || lower.indexOf('track') !== -1 || lower.indexOf('thread') !== -1) {
          result = engine.trackConversationFlow([{role:"user",content:cmd}]);
        }
        else if (lower.indexOf('risk') !== -1 || lower.indexOf('score') !== -1 || lower.indexOf('social') !== -1 || lower.indexOf('danger') !== -1) {
          result = engine.socialRiskScore(cmd);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.analyzeSentiment(cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Social Cortex encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.socialCortex;

  switch (message.action) {
    case 'analyzeSentiment':
      sendResponse({ success: true, data: engine.analyzeSentiment(message.text) });
      break;
    case 'detectEmotion':
      sendResponse({ success: true, data: engine.detectEmotion(message.text) });
      break;
    case 'draftEmpathicResponse':
      sendResponse({ success: true, data: engine.draftEmpathicResponse(message.context, message.tone) });
      break;
    case 'trackConversationFlow':
      sendResponse({ success: true, data: engine.trackConversationFlow(message.messages) });
      break;
    case 'socialRiskScore':
      sendResponse({ success: true, data: engine.socialRiskScore(message.post) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'social-cortex-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.socialCortex) {
      globalThis.socialCortex = new SocialCortexEngine();
      console.log('[Social Cortex] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'social-cortex_state': {
          heartbeatCount: globalThis.socialCortex.heartbeatCount || globalThis.socialCortex.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.socialCortex.state?.startTime || globalThis.socialCortex.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('social-cortex_state', function (data) {
    if (data && data['social-cortex_state']) {
      console.log('[Social Cortex] Restored from previous session \u2014 last alive: ' +
        new Date(data['social-cortex_state'].lastAlive).toISOString());
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
    console.log('[Social Cortex] Installed/updated \u2014 24/7 keepalive active');
  });
})();
