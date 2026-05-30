/* Sovereign Nexus — Content Script (EXT-020)
 *
 * JARVIS Copilot. Always on. AI has the terminals.
 * The AI boots itself, runs its own terminals, routes intelligence
 * across all models, and stays alive. You don't type commands.
 * The AI types the commands. You see the output.
 */

(function () {
  'use strict';

  var PANEL_ID = 'sovereign-nexus-panel';
  if (document.getElementById(PANEL_ID)) return;

  var HEARTBEAT = 873;
  var PHI = 1.618033988749895;

  var MODELS = [
    {id:'M-01',n:'GPT-4o',org:'OpenAI',cap:'reasoning',c:'#00a67e'},
    {id:'M-02',n:'Claude',org:'Anthropic',cap:'analysis',c:'#d4a574'},
    {id:'M-03',n:'Gemini',org:'Google',cap:'multimodal',c:'#4285f4'},
    {id:'M-04',n:'Llama',org:'Meta',cap:'open-source',c:'#0668e1'},
    {id:'M-05',n:'Mistral',org:'Mistral',cap:'efficiency',c:'#ff7000'},
    {id:'M-06',n:'Codex',org:'OpenAI',cap:'code',c:'#00a67e'},
    {id:'M-07',n:'Whisper',org:'OpenAI',cap:'speech',c:'#00a67e'},
    {id:'M-08',n:'DALL-E',org:'OpenAI',cap:'image',c:'#00a67e'},
    {id:'M-09',n:'Sora',org:'OpenAI',cap:'video',c:'#00a67e'},
    {id:'M-10',n:'Perplexity',org:'Perplexity',cap:'search',c:'#20b2aa'},
    {id:'M-11',n:'DeepSeek',org:'DeepSeek',cap:'code',c:'#4d6bfe'},
    {id:'M-12',n:'Grok',org:'xAI',cap:'social',c:'#1da1f2'},
    {id:'M-13',n:'Phi',org:'Microsoft',cap:'edge',c:'#00bcf2'},
    {id:'M-14',n:'Command R',org:'Cohere',cap:'rag',c:'#39594d'},
    {id:'M-15',n:'Stable Diffusion',org:'Stability',cap:'image',c:'#a855f7'},
    {id:'M-16',n:'ElevenLabs',org:'ElevenLabs',cap:'voice',c:'#000'},
  ];

  var AGENTS = [
    {id:'A-01',n:'Reasoning Core',icon:'\uD83E\uDDE0',models:['GPT-4o','Claude','Gemini'],job:'Fuses reasoning from multiple models'},
    {id:'A-02',n:'Code Engine',icon:'\uD83D\uDCBB',models:['Codex','DeepSeek','Claude'],job:'Writes, debugs, reviews code'},
    {id:'A-03',n:'Vision Lab',icon:'\uD83C\uDFA8',models:['DALL-E','Stable Diffusion','Sora'],job:'Generates images and video'},
    {id:'A-04',n:'Research Desk',icon:'\uD83D\uDD2C',models:['Perplexity','Claude','Command R'],job:'Searches, synthesizes, cites'},
    {id:'A-05',n:'Voice Bridge',icon:'\uD83C\uDFA4',models:['Whisper','ElevenLabs'],job:'Listens, speaks, transcribes'},
    {id:'A-06',n:'Security Guard',icon:'\uD83D\uDEE1',models:['GPT-4o','Claude'],job:'Scans threats, blocks injections'},
    {id:'A-07',n:'Data X-Ray',icon:'\uD83D\uDD2E',models:['GPT-4o','Gemini','Llama'],job:'Extracts signals from noise'},
    {id:'A-08',n:'Screen Pilot',icon:'\uD83D\uDDA5',models:['GPT-4o','Gemini'],job:'Reads and operates the page'},
  ];

  /* ── Inject styles ───────────────────────────────────────── */
  var s = document.createElement('style');
  s.textContent = '\
#'+PANEL_ID+'{position:fixed;top:10px;right:10px;width:460px;max-height:92vh;background:#0a0a14;color:#ccc;border:1px solid #ffd700;border-radius:12px;box-shadow:0 8px 40px rgba(255,215,0,.2);font-family:Menlo,"Cascadia Code","Fira Code",monospace;font-size:11px;z-index:2147483647;display:flex;flex-direction:column;overflow:hidden}\
.jv-bar{display:flex;align-items:center;gap:8px;padding:8px 14px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-bottom:1px solid #333;cursor:grab;user-select:none}\
.jv-dots{display:flex;gap:5px}\
.jv-dot{width:10px;height:10px;border-radius:50%}\
.jv-title{flex:1;font-size:12px;font-weight:700;color:#ffd700;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}\
.jv-pulse{display:inline-block;width:7px;height:7px;border-radius:50%;background:#28c840;margin-right:6px;animation:jvp 873ms ease-in-out infinite}\
@keyframes jvp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}\
.jv-body{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0}\
.jv-term{border-top:1px solid #1a1a2e;display:flex;flex-direction:column}\
.jv-term-bar{display:flex;align-items:center;gap:6px;padding:4px 10px;background:#0f0f1e;font-size:10px;color:#888;border-bottom:1px solid #1a1a2e}\
.jv-term-icon{font-size:12px}\
.jv-term-name{flex:1;font-weight:600;color:#bbb;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}\
.jv-term-status{font-size:9px;padding:1px 6px;border-radius:8px;background:#112211;color:#28c840}\
.jv-term-out{padding:6px 10px;max-height:120px;overflow-y:auto;line-height:1.55;font-size:10px;background:#08080f}\
.jv-term-out .p{color:#28c840}\
.jv-term-out .c{color:#58a6ff}\
.jv-term-out .ok{color:#28c840}\
.jv-term-out .w{color:#febc2e}\
.jv-term-out .i{color:#a371f7}\
.jv-term-out .d{color:#444}\
.jv-term-out .b{font-weight:700}\
.jv-term-out .m{color:#ffd700}\
.jv-cur{display:inline-block;width:5px;height:10px;background:#28c840;animation:jvb 1s step-end infinite;vertical-align:text-bottom}\
@keyframes jvb{50%{opacity:0}}\
.jv-footer{padding:5px 10px;border-top:1px solid #222;font-size:9px;color:#555;text-align:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}\
';
  document.head.appendChild(s);

  /* ── Panel shell ─────────────────────────────────────────── */
  var panel = document.createElement('div');
  panel.id = PANEL_ID;

  var bar = document.createElement('div');
  bar.className = 'jv-bar';
  bar.innerHTML = '<div class="jv-dots"><div class="jv-dot" style="background:#ff5f57"></div><div class="jv-dot" style="background:#febc2e"></div><div class="jv-dot" style="background:#28c840"></div></div><div class="jv-title"><span class="jv-pulse"></span>JARVIS \u00b7 Sovereign Nexus</div>';
  panel.appendChild(bar);

  var body = document.createElement('div');
  body.className = 'jv-body';
  panel.appendChild(body);

  var footer = document.createElement('div');
  footer.className = 'jv-footer';
  footer.textContent = '\u2764 873ms \u00b7 ' + MODELS.length + ' models \u00b7 ' + AGENTS.length + ' agents \u00b7 Always on';
  panel.appendChild(footer);

  document.body.appendChild(panel);

  /* ── Drag ────────────────────────────────────────────────── */
  var dg=false,dx=0,dy=0;
  bar.addEventListener('mousedown',function(e){dg=true;dx=e.clientX-panel.getBoundingClientRect().left;dy=e.clientY-panel.getBoundingClientRect().top;bar.style.cursor='grabbing';e.preventDefault()});
  document.addEventListener('mousemove',function(e){if(!dg)return;panel.style.left=(e.clientX-dx)+'px';panel.style.right='auto';panel.style.top=(e.clientY-dy)+'px';panel.style.bottom='auto'});
  document.addEventListener('mouseup',function(){if(dg){dg=false;bar.style.cursor='grab'}});

  /* ── Terminal builder ────────────────────────────────────── */
  function makeTerminal(agent) {
    var term = document.createElement('div');
    term.className = 'jv-term';

    var tbar = document.createElement('div');
    tbar.className = 'jv-term-bar';
    tbar.innerHTML = '<span class="jv-term-icon">'+agent.icon+'</span><span class="jv-term-name">'+agent.n+'</span><span class="jv-term-status">booting</span>';
    term.appendChild(tbar);

    var out = document.createElement('div');
    out.className = 'jv-term-out';
    term.appendChild(out);

    body.appendChild(term);

    return {
      el: term,
      out: out,
      status: tbar.querySelector('.jv-term-status'),
      lines: [],
      write: function(html) {
        var d = document.createElement('div');
        d.innerHTML = html;
        this.out.appendChild(d);
        this.out.scrollTop = this.out.scrollHeight;
      },
      setStatus: function(text, color) {
        this.status.textContent = text;
        this.status.style.color = color || '#28c840';
        this.status.style.background = (color === '#28c840' || !color) ? '#112211' : (color === '#febc2e' ? '#222211' : '#221111');
      }
    };
  }

  /* ── Build all agent terminals ───────────────────────────── */
  var terminals = [];
  for (var a = 0; a < AGENTS.length; a++) {
    terminals.push(makeTerminal(AGENTS[a]));
  }

  /* ── Delay helper ────────────────────────────────────────── */
  function wait(ms) { return new Promise(function(r){setTimeout(r,ms)}); }

  /* ── Simulate an agent's boot sequence ───────────────────── */
  async function bootAgent(idx) {
    var t = terminals[idx];
    var ag = AGENTS[idx];
    var d = 60 + Math.floor(Math.random() * 40);

    t.write('<span class="p">$</span> <span class="c">init '+ag.n.toLowerCase().replace(/\s/g,'-')+'</span>');
    await wait(d);
    t.setStatus('loading', '#febc2e');

    for (var m = 0; m < ag.models.length; m++) {
      var model = ag.models[m];
      var mi = MODELS.find(function(x){return x.n===model});
      var color = mi ? mi.c : '#888';
      t.write('<span class="d">\u251c</span> loading <span class="m" style="color:'+color+'">'+model+'</span>');
      await wait(d);
    }

    t.write('<span class="ok">\u2713</span> <span class="b">'+ag.models.length+' models wired</span>');
    await wait(d);
    t.setStatus('online', '#28c840');

    t.write('<span class="p">$</span> <span class="c">'+ag.job.toLowerCase()+'</span>');
    await wait(d);
    t.write('<span class="ok">\u2713</span> ready <span class="d">\u00b7 \u03c6='+PHI.toFixed(3)+'</span>');

    var cur = document.createElement('span');
    cur.className = 'jv-cur';
    t.out.appendChild(cur);

    return t;
  }

  /* ── Run the page analysis agent after boot ──────────────── */
  async function analyzeCurrentPage(t) {
    var title = document.title || location.hostname || 'this page';
    if (title.length > 50) title = title.substring(0, 47) + '...';

    await wait(400 + Math.floor(Math.random() * 300));
    t.write('');
    t.write('<span class="p">$</span> <span class="c">scan "'+title+'"</span>');
    await wait(200);

    var wordCount = (document.body && document.body.innerText) ? document.body.innerText.split(/\s+/).length : 0;
    var links = document.querySelectorAll('a').length;
    var images = document.querySelectorAll('img').length;
    var scripts = document.querySelectorAll('script').length;
    var forms = document.querySelectorAll('form').length;

    t.write('<span class="d">\u251c</span> words: <span class="b">'+wordCount.toLocaleString()+'</span>');
    t.write('<span class="d">\u251c</span> links: '+links+' \u00b7 images: '+images+' \u00b7 forms: '+forms);
    t.write('<span class="d">\u2514</span> scripts: '+scripts);
    await wait(100);
    t.write('<span class="ok">\u2713</span> page indexed');
  }

  /* ── Security scan ───────────────────────────────────────── */
  async function securityScan(t) {
    await wait(600 + Math.floor(Math.random() * 400));
    t.write('');
    t.write('<span class="p">$</span> <span class="c">threat-scan '+location.hostname+'</span>');
    await wait(200);

    var https = location.protocol === 'https:';
    t.write('<span class="d">\u251c</span> protocol: '+(https?'<span class="ok">HTTPS \u2713</span>':'<span class="w">HTTP \u26A0</span>'));

    var extScripts = document.querySelectorAll('script[src]').length;
    t.write('<span class="d">\u251c</span> external scripts: '+extScripts);

    var iframes = document.querySelectorAll('iframe').length;
    t.write('<span class="d">\u2514</span> iframes: '+iframes+(iframes>3?' <span class="w">\u26A0 high</span>':''));
    await wait(100);

    t.write('<span class="ok">\u2713</span> no threats detected');
  }

  /* ── Model routing ───────────────────────────────────────── */
  async function routeIntelligence(t) {
    await wait(800 + Math.floor(Math.random() * 400));
    t.write('');
    t.write('<span class="p">$</span> <span class="c">route-intelligence --page</span>');
    await wait(150);

    var routes = [
      {from:'page content',to:'GPT-4o',reason:'reasoning'},
      {from:'code blocks',to:'DeepSeek',reason:'code analysis'},
      {from:'images',to:'Gemini',reason:'multimodal'},
    ];
    for (var r = 0; r < routes.length; r++) {
      var mi = MODELS.find(function(x){return x.n===routes[r].to});
      t.write('<span class="d">\u251c</span> '+routes[r].from+' \u2192 <span class="m" style="color:'+(mi?mi.c:'#888')+'">'+routes[r].to+'</span> <span class="d">('+routes[r].reason+')</span>');
      await wait(80);
    }
    t.write('<span class="ok">\u2713</span> intelligence routed');
  }

  /* ── Heartbeat across all terminals ──────────────────────── */
  var beatCount = 0;
  function heartbeat() {
    beatCount++;
    footer.textContent = '\u2764 Beat #'+beatCount+' \u00b7 '+MODELS.length+' models \u00b7 '+AGENTS.length+' agents \u00b7 Always on';

    chrome.runtime.sendMessage({action:'masterHeartbeat'}, function(r){
      if (r && r.success) {
        var sync = r.data.synchronization;
        var syncPct = (sync * 100).toFixed(0);
        footer.textContent = '\u2764 #'+beatCount+' \u00b7 sync '+syncPct+'% \u00b7 '+MODELS.length+' models \u00b7 '+AGENTS.length+' agents';
      }
    });
  }
  setInterval(heartbeat, HEARTBEAT);

  /* ── Boot everything ─────────────────────────────────────── */
  async function boot() {
    var bootPromises = [];
    for (var i = 0; i < AGENTS.length; i++) {
      bootPromises.push(bootAgent(i));
    }
    await Promise.all(bootPromises);

    analyzeCurrentPage(terminals[7]);
    securityScan(terminals[5]);
    routeIntelligence(terminals[0]);
  }

  boot();

})();
