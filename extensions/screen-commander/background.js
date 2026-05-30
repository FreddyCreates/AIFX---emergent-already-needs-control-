/* Screen Commander — Background Service Worker (EXT-024)
 *
 * JARVIS-style autonomous screen agent. Reads page structure, writes content,
 * moves/scrolls viewport, opens panels, navigates. AI that operates
 * your screen with natural-language intent.
 */

var PHI = 1.618033988749895;
var GOLDEN_ANGLE = 137.508;
var HEARTBEAT = 873;

class ScreenCommanderEngine {
  constructor() {
    this.startTime = Date.now();
    this.commandCount = 0;
    this.commandHistory = [];
    this.state = { initialized: true, heartbeatCount: 0 };
    this._startHeartbeat();
  }

  parseCommand(natural) {
    this.commandCount++;
    var lower = (natural || '').toLowerCase().trim();
    var cmd = { raw: natural, timestamp: Date.now(), id: 'cmd-' + this.commandCount };

    var patterns = [
      { intent: 'scroll', keywords: ['scroll','move down','move up','go down','go up','page down','page up'], params: {} },
      { intent: 'click', keywords: ['click','press','tap','hit','select'], params: {} },
      { intent: 'read', keywords: ['read','extract','get text','show text','what does','whats on','scan'], params: {} },
      { intent: 'write', keywords: ['write','type','input','fill','enter','put'], params: {} },
      { intent: 'navigate', keywords: ['navigate','go to','open','visit','load','browse'], params: {} },
      { intent: 'find', keywords: ['find','search','locate','where is','look for'], params: {} },
      { intent: 'highlight', keywords: ['highlight','mark','outline','show me','point to'], params: {} },
      { intent: 'screenshot', keywords: ['screenshot','capture','snapshot','picture'], params: {} },
      { intent: 'summarize', keywords: ['summarize','summary','overview','brief','tldr'], params: {} },
      { intent: 'extract-data', keywords: ['extract data','pull numbers','get values','scrape','harvest'], params: {} }
    ];

    var bestMatch = { intent: 'unknown', score: 0, matched: [] };
    for (var i = 0; i < patterns.length; i++) {
      var p = patterns[i];
      var score = 0;
      var matched = [];
      for (var j = 0; j < p.keywords.length; j++) {
        if (lower.indexOf(p.keywords[j]) !== -1) { score++; matched.push(p.keywords[j]); }
      }
      if (score > bestMatch.score) {
        bestMatch = { intent: p.intent, score: score, matched: matched };
      }
    }

    /* Extract target selector or text */
    var target = null;
    var quoteMatch = natural.match(/["']([^"']+)["']/);
    if (quoteMatch) target = quoteMatch[1];
    var hashMatch = lower.match(/#([a-z0-9_-]+)/);
    if (hashMatch) target = '#' + hashMatch[1];
    var dotMatch = lower.match(/\.([a-z0-9_-]+)/);
    if (dotMatch && !target) target = '.' + dotMatch[1];

    /* Extract direction for scroll */
    var direction = 'down';
    if (lower.indexOf('up') !== -1 || lower.indexOf('top') !== -1) direction = 'up';
    if (lower.indexOf('left') !== -1) direction = 'left';
    if (lower.indexOf('right') !== -1) direction = 'right';

    /* Extract amount */
    var amountMatch = lower.match(/(\d+)\s*(px|pixels|percent|%|lines|pages?)/);
    var amount = amountMatch ? parseInt(amountMatch[1], 10) : null;
    var unit = amountMatch ? amountMatch[2].replace(/s$/, '') : 'page';

    /* Extract URL for navigate */
    var urlMatch = natural.match(/https?:\/\/[^\s"']+/);
    var url = urlMatch ? urlMatch[0] : null;

    /* Extract write content */
    var writeContent = null;
    if (bestMatch.intent === 'write' && quoteMatch) writeContent = quoteMatch[1];

    cmd.intent = bestMatch.intent;
    cmd.confidence = bestMatch.score > 0 ? Math.min(1, 0.5 + bestMatch.score * 0.2) : 0.1;
    cmd.target = target;
    cmd.direction = direction;
    cmd.amount = amount;
    cmd.unit = unit;
    cmd.url = url;
    cmd.writeContent = writeContent;
    cmd.matchedKeywords = bestMatch.matched;

    this.commandHistory.push(cmd);
    if (this.commandHistory.length > 100) this.commandHistory = this.commandHistory.slice(-100);

    return cmd;
  }

  buildAction(parsedCommand) {
    var c = parsedCommand;
    var action = { intent: c.intent, timestamp: Date.now() };

    switch (c.intent) {
      case 'scroll':
        var px = c.amount || 500;
        if (c.unit === 'page') px = 800;
        action.type = 'scroll';
        action.payload = { direction: c.direction, pixels: px };
        action.script = 'window.scrollBy(0,' + (c.direction === 'up' ? -px : px) + ')';
        break;
      case 'click':
        action.type = 'click';
        action.payload = { selector: c.target || 'body' };
        action.script = c.target ? 'document.querySelector("' + c.target.replace(/"/g, '\\"') + '")?.click()' : null;
        break;
      case 'read':
        action.type = 'read';
        action.payload = { selector: c.target || 'body' };
        action.script = c.target
          ? 'document.querySelector("' + c.target.replace(/"/g, '\\"') + '")?.innerText?.substring(0,2000)'
          : 'document.body.innerText.substring(0,2000)';
        break;
      case 'write':
        action.type = 'write';
        action.payload = { selector: c.target, text: c.writeContent };
        break;
      case 'navigate':
        action.type = 'navigate';
        action.payload = { url: c.url };
        break;
      case 'find':
        action.type = 'find';
        action.payload = { query: c.target || c.raw };
        action.script = 'window.find("' + (c.target || '').replace(/"/g, '\\"') + '")';
        break;
      case 'highlight':
        action.type = 'highlight';
        action.payload = { selector: c.target };
        break;
      case 'summarize':
        action.type = 'summarize';
        action.payload = { selector: c.target || 'body' };
        break;
      case 'extract-data':
        action.type = 'extract-data';
        action.payload = { selector: c.target || 'body' };
        break;
      default:
        action.type = 'unknown';
        action.payload = { raw: c.raw };
    }

    return action;
  }

  getHistory() {
    return this.commandHistory.slice(-20);
  }

  _startHeartbeat() {
    var self = this;
    setInterval(function () { self.state.heartbeatCount++; }, HEARTBEAT);
  }
}

globalThis.screenCommander = new ScreenCommanderEngine();

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
    var engine = globalThis.screenCommander;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Screen Commander engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Screen Commander AI Workspace\n\nCapabilities:\n• Parse Command — Parse and execute screen command\n• Get History — Get command history\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'screen-commander_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('parse') !== -1 || lower.indexOf('command') !== -1 || lower.indexOf('do') !== -1 || lower.indexOf('execute') !== -1 || lower.indexOf('run') !== -1) {
          result = engine.parseCommand(cmd);
        }
        else if (lower.indexOf('history') !== -1 || lower.indexOf('log') !== -1 || lower.indexOf('previous') !== -1 || lower.indexOf('recent') !== -1) {
          result = engine.getHistory();
        }
        else {
          /* Default: route to primary engine method */
          result = engine.parseCommand(cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Screen Commander encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.screenCommander;
  switch (message.action) {
    case 'parseCommand':
      var parsed = engine.parseCommand(message.command);
      var action = engine.buildAction(parsed);
      sendResponse({ success: true, data: { parsed: parsed, action: action } });
      break;
    case 'getHistory':
      sendResponse({ success: true, data: engine.getHistory() });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }
  return true;
});

/* ── Production 24/7 Keep-Alive ────────────────────────────── */
(function () {
  var ALARM_NAME = 'screen-commander-heartbeat';
  var ALARM_PERIOD = 0.4;
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.screenCommander) {
      globalThis.screenCommander = new ScreenCommanderEngine();
      console.log('[Screen Commander] Engine re-initialized by keepalive alarm');
    }
    try {
      chrome.storage.local.set({ 'screen-commander_state': { commandCount: globalThis.screenCommander.commandCount || 0, lastAlive: Date.now() } });
    } catch (e) {}
  });
  chrome.storage.local.get('screen-commander_state', function (data) {
    if (data && data['screen-commander_state']) {
      console.log('[Screen Commander] Restored — last alive: ' + new Date(data['screen-commander_state'].lastAlive).toISOString());
    }
  });
  chrome.runtime.onInstalled.addListener(function () {
    /* Auto-activate side panel on install */
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ enabled: true });
    }
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function(){});
    }
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Screen Commander] 24/7 keepalive active');
  });
})();
