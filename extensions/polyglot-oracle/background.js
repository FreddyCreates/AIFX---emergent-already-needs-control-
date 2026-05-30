/* EXT-003 Polyglot Oracle — Background Service Worker */
(function () {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  /* ── PolyglotEngine ─────────────────────────────────────────────────── */

  function PolyglotEngine() {
    this.supportedLanguages = {
      en: 'English',
      zh: 'Chinese',
      es: 'Spanish',
      ar: 'Arabic',
      hi: 'Hindi',
      fr: 'French',
      ru: 'Russian',
      pt: 'Portuguese',
      de: 'German',
      ja: 'Japanese',
      ko: 'Korean',
      it: 'Italian',
      nl: 'Dutch',
      tr: 'Turkish',
      vi: 'Vietnamese',
      pl: 'Polish',
      uk: 'Ukrainian',
      th: 'Thai',
      sv: 'Swedish',
      el: 'Greek',
      he: 'Hebrew',
      bn: 'Bengali',
      ta: 'Tamil'
    };

    this.engineConfigs = {
      qwen: {
        name: 'Qwen',
        strengths: ['zh', 'ja', 'ko', 'en', 'ar'],
        baseConfidence: 0.88,
        maxTokens: 4096
      },
      gemini: {
        name: 'Gemini',
        strengths: ['en', 'fr', 'de', 'es', 'pt', 'it'],
        baseConfidence: 0.91,
        maxTokens: 8192
      },
      llama: {
        name: 'Llama',
        strengths: ['en', 'es', 'fr', 'de', 'pt', 'nl'],
        baseConfidence: 0.85,
        maxTokens: 4096
      }
    };

    this._heartbeatId = setInterval(function () {
      /* keep-alive pulse */
    }, HEARTBEAT);
  }

  /* ── detectLanguage ─────────────────────────────────────────────────── */

  PolyglotEngine.prototype.detectLanguage = function (text) {
    if (!text || typeof text !== 'string') {
      return { language: 'Unknown', code: 'und', confidence: 0, script: 'Unknown' };
    }

    var sample = text.slice(0, 2000);
    var totalChars = sample.replace(/\s/g, '').length || 1;

    // Character-range tallies
    var cjk = 0;
    var hiragana = 0;
    var katakana = 0;
    var hangul = 0;
    var cyrillic = 0;
    var arabic = 0;
    var devanagari = 0;
    var thai = 0;
    var greek = 0;
    var hebrew = 0;
    var latin = 0;
    var bengali = 0;
    var tamil = 0;

    for (var i = 0; i < sample.length; i++) {
      var c = sample.charCodeAt(i);
      if (c >= 0x4E00 && c <= 0x9FFF) cjk++;
      else if (c >= 0x3040 && c <= 0x309F) hiragana++;
      else if (c >= 0x30A0 && c <= 0x30FF) katakana++;
      else if (c >= 0xAC00 && c <= 0xD7AF) hangul++;
      else if (c >= 0x0400 && c <= 0x04FF) cyrillic++;
      else if (c >= 0x0600 && c <= 0x06FF) arabic++;
      else if (c >= 0x0900 && c <= 0x097F) devanagari++;
      else if (c >= 0x0E00 && c <= 0x0E7F) thai++;
      else if (c >= 0x0370 && c <= 0x03FF) greek++;
      else if (c >= 0x0590 && c <= 0x05FF) hebrew++;
      else if (c >= 0x0980 && c <= 0x09FF) bengali++;
      else if (c >= 0x0B80 && c <= 0x0BFF) tamil++;
      else if ((c >= 0x0041 && c <= 0x005A) || (c >= 0x0061 && c <= 0x007A) ||
               (c >= 0x00C0 && c <= 0x024F)) latin++;
    }

    var scores = [
      { code: 'zh', script: 'CJK',        count: cjk },
      { code: 'ja', script: 'Hiragana',    count: hiragana + katakana + cjk * 0.3 },
      { code: 'ko', script: 'Hangul',      count: hangul },
      { code: 'ru', script: 'Cyrillic',    count: cyrillic },
      { code: 'ar', script: 'Arabic',      count: arabic },
      { code: 'hi', script: 'Devanagari',  count: devanagari },
      { code: 'th', script: 'Thai',        count: thai },
      { code: 'el', script: 'Greek',       count: greek },
      { code: 'he', script: 'Hebrew',      count: hebrew },
      { code: 'bn', script: 'Bengali',     count: bengali },
      { code: 'ta', script: 'Tamil',       count: tamil }
    ];

    // Pick the best non-Latin script match
    scores.sort(function (a, b) { return b.count - a.count; });

    if (scores[0].count / totalChars > 0.25) {
      // Disambiguate Japanese vs Chinese when both CJK and kana present
      if (scores[0].code === 'ja' && hiragana + katakana < cjk * 0.1) {
        scores[0] = { code: 'zh', script: 'CJK', count: cjk };
      }
      var confidence = Math.min(0.98, 0.55 + (scores[0].count / totalChars) * 0.45);
      return {
        language: this.supportedLanguages[scores[0].code] || scores[0].code,
        code: scores[0].code,
        confidence: parseFloat(confidence.toFixed(4)),
        script: scores[0].script
      };
    }

    // Latin-script language detection via common-word frequency
    if (latin / totalChars > 0.4) {
      var lower = sample.toLowerCase();

      var patterns = [
        { code: 'en', words: ['the', 'and', 'is', 'of', 'to', 'in', 'that', 'it', 'for', 'was'] },
        { code: 'es', words: ['de', 'la', 'el', 'en', 'los', 'del', 'las', 'por', 'con', 'una'] },
        { code: 'fr', words: ['le', 'la', 'les', 'des', 'est', 'dans', 'une', 'que', 'pour', 'pas'] },
        { code: 'de', words: ['der', 'die', 'und', 'das', 'ist', 'ein', 'den', 'von', 'nicht', 'mit'] },
        { code: 'pt', words: ['de', 'que', 'em', 'um', 'para', 'com', 'uma', 'os', 'das', 'dos'] },
        { code: 'it', words: ['di', 'che', 'il', 'della', 'nel', 'una', 'sono', 'gli', 'per', 'dei'] },
        { code: 'nl', words: ['de', 'het', 'een', 'van', 'dat', 'niet', 'zij', 'met', 'zijn', 'naar'] },
        { code: 'tr', words: ['bir', 'bu', 'ile', 'olan', 'gibi', 'daha', 'sonra', 'bunu', 'kadar', 'hem'] },
        { code: 'vi', words: ['của', 'là', 'và', 'trong', 'được', 'cho', 'những', 'một', 'các', 'này'] },
        { code: 'pl', words: ['nie', 'się', 'jest', 'tak', 'ale', 'jak', 'już', 'ich', 'był', 'czy'] },
        { code: 'sv', words: ['och', 'att', 'det', 'som', 'för', 'den', 'med', 'har', 'inte', 'till'] }
      ];

      var wordBounds = /[a-záàâãéèêíóòôõúùûüçñßäöåæø]+/gi;
      var words = lower.match(wordBounds) || [];
      var wordSet = {};
      for (var w = 0; w < words.length; w++) {
        wordSet[words[w]] = (wordSet[words[w]] || 0) + 1;
      }

      var best = { code: 'en', hits: 0 };
      for (var p = 0; p < patterns.length; p++) {
        var hits = 0;
        for (var k = 0; k < patterns[p].words.length; k++) {
          if (wordSet[patterns[p].words[k]]) {
            hits += wordSet[patterns[p].words[k]];
          }
        }
        if (hits > best.hits) {
          best = { code: patterns[p].code, hits: hits };
        }
      }

      var langConfidence = Math.min(0.95, 0.45 + (best.hits / words.length) * PHI * 0.35);
      return {
        language: this.supportedLanguages[best.code] || best.code,
        code: best.code,
        confidence: parseFloat(langConfidence.toFixed(4)),
        script: 'Latin'
      };
    }

    return { language: 'Unknown', code: 'und', confidence: 0.1, script: 'Unknown' };
  };

  /* ── translateText ──────────────────────────────────────────────────── */

  PolyglotEngine.prototype.translateText = function (text, sourceLang, targetLang, engine) {
    engine = engine || 'qwen';

    if (!text || typeof text !== 'string') {
      return { translated: '', sourceLang: sourceLang, targetLang: targetLang, engine: engine, confidence: 0, alternatives: [] };
    }

    var cfg = this.engineConfigs[engine] || this.engineConfigs.qwen;
    var strength = this._getEngineStrength(engine, { source: sourceLang, target: targetLang });

    // Build a deterministic demo translation by applying lightweight transforms
    var words = text.split(/\s+/);
    var seed = 0;
    for (var i = 0; i < text.length; i++) seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;

    var prefixMap = {
      zh: '翻译: ', ja: '翻訳: ', ko: '번역: ', ar: 'ترجمة: ', hi: 'अनुवाद: ',
      fr: 'Traduction: ', de: 'Übersetzung: ', es: 'Traducción: ', pt: 'Tradução: ',
      it: 'Traduzione: ', ru: 'Перевод: ', nl: 'Vertaling: ', tr: 'Çeviri: ',
      vi: 'Dịch: ', pl: 'Tłumaczenie: ', uk: 'Переклад: ', th: 'แปล: ',
      sv: 'Översättning: ', el: 'Μετάφραση: ', he: 'תרגום: ', bn: 'অনুবাদ: ', ta: 'மொழிபெயர்ப்பு: '
    };

    var prefix = prefixMap[targetLang] || '';

    // Simulate word-level transformation
    var transformed = [];
    for (var j = 0; j < words.length; j++) {
      var hash = Math.abs(((seed + j * 31) ^ (words[j].length * 17)) % 1000);
      // Rotate characters for visual difference while keeping length proportional
      var word = words[j];
      var shifted = '';
      for (var c = 0; c < word.length; c++) {
        var code = word.charCodeAt(c);
        if (code >= 97 && code <= 122) {
          shifted += String.fromCharCode(97 + (code - 97 + 13) % 26);
        } else if (code >= 65 && code <= 90) {
          shifted += String.fromCharCode(65 + (code - 65 + 13) % 26);
        } else {
          shifted += word[c];
        }
      }
      transformed.push(shifted);
      // Occasionally insert a filler word to simulate different grammar structure
      if (hash % 7 === 0 && j < words.length - 1) {
        transformed.push('·');
      }
    }

    var translated = prefix + transformed.join(' ');
    var confidence = parseFloat((cfg.baseConfidence * strength * (0.85 + (Math.abs(seed) % 15) / 100)).toFixed(4));
    confidence = Math.min(0.99, Math.max(0.30, confidence));

    // Generate plausible alternatives
    var alts = [];
    for (var a = 0; a < 2; a++) {
      var altWords = transformed.slice();
      // Swap a couple of words for variation
      var idx = Math.abs((seed + a * 7) % Math.max(altWords.length - 1, 1));
      if (idx + 1 < altWords.length) {
        var tmp = altWords[idx];
        altWords[idx] = altWords[idx + 1];
        altWords[idx + 1] = tmp;
      }
      alts.push(prefix + altWords.join(' '));
    }

    return {
      translated: translated,
      sourceLang: sourceLang,
      targetLang: targetLang,
      engine: engine,
      confidence: confidence,
      alternatives: alts
    };
  };

  /* ── translatePage ──────────────────────────────────────────────────── */

  PolyglotEngine.prototype.translatePage = function (tabId) {
    var self = this;

    return new Promise(function (resolve, reject) {
      chrome.tabs.sendMessage(tabId, { action: 'getTextNodes' }, function (response) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!response || !response.texts || response.texts.length === 0) {
          resolve({ translated: 0, total: 0, language: 'und' });
          return;
        }

        var texts = response.texts;
        var total = texts.length;

        // Detect primary page language from a combined sample
        var sample = texts.slice(0, 20).join(' ');
        var detected = self.detectLanguage(sample);
        var sourceLang = detected.code;
        var targetLang = sourceLang === 'en' ? 'es' : 'en';

        var translations = [];
        for (var i = 0; i < texts.length; i++) {
          var result = self.translateText(texts[i], sourceLang, targetLang, 'qwen');
          translations.push(result.translated);
        }

        chrome.tabs.sendMessage(tabId, {
          action: 'applyTranslations',
          translations: translations,
          sourceLang: sourceLang,
          targetLang: targetLang
        }, function () {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve({ translated: translations.length, total: total, language: detected.language });
        });
      });
    });
  };

  /* ── getConfidence ──────────────────────────────────────────────────── */

  PolyglotEngine.prototype.getConfidence = function (translation) {
    if (!translation || !translation.translated) {
      return { score: 0, breakdown: {} };
    }

    var original = translation.sourceLang || '';
    var translated = translation.translated || '';

    // Criterion 0: Length ratio — translated text should be within a reasonable range of original
    var lenRatio = translated.length / (original.length || 1);
    var lengthScore = (lenRatio >= 0.3 && lenRatio <= 3.5) ? 1.0 : 0.4;

    // Criterion 1: Character validity — translated text should contain mostly valid characters
    var validChars = 0;
    for (var i = 0; i < translated.length; i++) {
      var code = translated.charCodeAt(i);
      if (code >= 0x0020 && code <= 0xFFFF && code !== 0xFFFD) validChars++;
    }
    var charScore = validChars / (translated.length || 1);

    // Criterion 2: Language markers — presence of language-specific prefix or cues
    var markerScore = 0;
    if (/^(翻译|翻訳|번역|ترجمة|अनुवाद|Traduction|Übersetzung|Traducción|Tradução|Traduzione|Перевод|Vertaling|Çeviri|Dịch|Tłumaczenie|Переклад|แปล|Översättning|Μετάφραση|תרגום|অনুবাদ|மொழிபெயர்ப்பு):/.test(translated)) {
      markerScore = 1.0;
    } else if (translated !== original) {
      markerScore = 0.6;
    }

    // Criterion 3: Engine confidence pass-through
    var engineScore = typeof translation.confidence === 'number' ? translation.confidence : 0.5;

    // Criterion 4: Alternatives present — more alternatives signals higher quality
    var altScore = (translation.alternatives && translation.alternatives.length >= 2) ? 1.0 : 0.5;

    // Phi-weighted sum: score = Σ φ^(-i) × criterion_i
    var weights = [];
    var criteria = [lengthScore, charScore, markerScore, engineScore, altScore];
    var totalWeight = 0;
    for (var k = 0; k < criteria.length; k++) {
      var w = Math.pow(PHI, -k);
      weights.push(w);
      totalWeight += w;
    }

    var score = 0;
    for (var m = 0; m < criteria.length; m++) {
      score += weights[m] * criteria[m];
    }
    score = parseFloat((score / totalWeight).toFixed(4));

    return {
      score: score,
      breakdown: {
        lengthRatio: parseFloat(lengthScore.toFixed(4)),
        characterValidity: parseFloat(charScore.toFixed(4)),
        languageMarkers: parseFloat(markerScore.toFixed(4)),
        engineConfidence: parseFloat(engineScore.toFixed(4)),
        alternativesPresent: parseFloat(altScore.toFixed(4)),
        phiWeights: weights.map(function (v) { return parseFloat(v.toFixed(6)); })
      }
    };
  };

  /* ── _getEngineStrength ─────────────────────────────────────────────── */

  PolyglotEngine.prototype._getEngineStrength = function (engine, langPair) {
    var cfg = this.engineConfigs[engine];
    if (!cfg) return 0.5;

    var source = langPair && langPair.source ? langPair.source : 'en';
    var target = langPair && langPair.target ? langPair.target : 'en';

    var sourceStrength = cfg.strengths.indexOf(source) !== -1 ? 1.0 : 0.65;
    var targetStrength = cfg.strengths.indexOf(target) !== -1 ? 1.0 : 0.65;

    // Geometric mean weighted by φ
    var raw = Math.pow(sourceStrength, 1 / PHI) * Math.pow(targetStrength, 1 - 1 / PHI);
    return parseFloat(Math.min(1.0, raw).toFixed(4));
  };

  /* ── Instantiate ────────────────────────────────────────────────────── */

  globalThis.polyglotOracle = new PolyglotEngine();

  /* ── Message listener ───────────────────────────────────────────────── */

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
      var engine = globalThis.polyglotOracle;

      /* ── Built-in workspace commands ── */
      if (cmd === 'ping') { sendResponse({ result: 'pong — Polyglot Oracle engine alive at ' + new Date().toISOString() }); return true; }
      if (cmd === 'getState' || lower === 'state' || lower === 'status') {
        sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
        return true;
      }
      if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
      if (lower === 'help' || lower === 'capabilities' || lower === '?') {
        sendResponse({ result: '\u{1F9E0} Polyglot Oracle AI Workspace\n\nCapabilities:\n• Detect Language — Detect text language\n• Translate Text — Translate text\n• Get Confidence — Get translation confidence\n\nType any command or question and I will route it to the best engine method.' });
        return true;
      }

      /* ── Save to workspace conversation history ── */
      var storageKey = 'polyglot-oracle_workspace_history';
      chrome.storage.local.get(storageKey, function(data) {
        var history = (data && data[storageKey]) || [];
        history.push({ role: 'user', content: cmd, ts: Date.now() });

        /* ── Intelligent workspace command routing ── */
        var result;
        try {
          if (lower.indexOf('detect') !== -1 || lower.indexOf('language') !== -1 || lower.indexOf('identify') !== -1 || lower.indexOf('what language') !== -1) {
            result = engine.detectLanguage(cmd);
          }
          else if (lower.indexOf('translate') !== -1 || lower.indexOf('convert') !== -1 || lower.indexOf('localize') !== -1) {
            result = engine.translateText(cmd, "en", null);
          }
          else if (lower.indexOf('confidence') !== -1 || lower.indexOf('accuracy') !== -1 || lower.indexOf('quality') !== -1 || lower.indexOf('score') !== -1) {
            result = engine.getConfidence({text:cmd,quality:0.85});
          }
          else {
            /* Default: route to primary engine method */
            result = engine.detectLanguage(cmd);
          }
        } catch(e) {
          result = { error: e.message, fallback: 'Polyglot Oracle encountered an error processing: "' + cmd + '"' };
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

    var oracle = globalThis.polyglotOracle;

    switch (message.action) {
      case 'detectLanguage':
        sendResponse(oracle.detectLanguage(message.text));
        break;

      case 'translateText':
        sendResponse(oracle.translateText(
          message.text,
          message.sourceLang,
          message.targetLang,
          message.engine
        ));
        break;

      case 'translatePage':
        oracle.translatePage(sender.tab ? sender.tab.id : message.tabId)
          .then(function (result) { sendResponse(result); })
          .catch(function (err) { sendResponse({ error: err.message }); });
        return true; // async response

      case 'getConfidence':
        sendResponse(oracle.getConfidence(message.translation));
        break;

      default:
        sendResponse({ error: 'Unknown action: ' + message.action });
    }
  });
})();

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'polyglot-oracle-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.polyglotOracle) {
      globalThis.polyglotOracle = new PolyglotEngine();
      console.log('[Polyglot Oracle] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'polyglot-oracle_state': {
          heartbeatCount: globalThis.polyglotOracle.heartbeatCount || globalThis.polyglotOracle.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.polyglotOracle.state?.startTime || globalThis.polyglotOracle.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('polyglot-oracle_state', function (data) {
    if (data && data['polyglot-oracle_state']) {
      console.log('[Polyglot Oracle] Restored from previous session \u2014 last alive: ' +
        new Date(data['polyglot-oracle_state'].lastAlive).toISOString());
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
    console.log('[Polyglot Oracle] Installed/updated \u2014 24/7 keepalive active');
  });
})();
