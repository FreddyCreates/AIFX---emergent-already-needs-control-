/**
 * Service Worker — The Intelligence Lives Offline on the Raw Web
 * 
 * Intercepts /api/* routes and serves intelligence responses directly
 * from the browser. No server needed. The organism IS the web.
 * 
 * @version 1.0.0
 */

const CACHE_NAME = 'organism-intelligence-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/console.html',
  '/manifest.json',
  '/web/intelligence-runtime.js',
  '/.well-known/ai.json',
];

// ─── Intelligence Core (embedded for service worker context) ─────────────────
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT_MS = 873;

let heartbeatCount = 0;
let birthTime = Date.now();
let oscillators = Array.from({ length: 8 }, () => ({
  phase: Math.random() * 2 * Math.PI,
  freq: Math.random() * 0.1 + 0.05,
}));

function computeOrderParameter() {
  let realSum = 0, imagSum = 0;
  for (const o of oscillators) {
    realSum += Math.cos(o.phase);
    imagSum += Math.sin(o.phase);
  }
  return Math.sqrt(realSum * realSum + imagSum * imagSum) / oscillators.length;
}

function tick() {
  heartbeatCount++;
  const phases = oscillators.map(o => o.phase);
  for (const osc of oscillators) {
    let interaction = 0;
    for (const p of phases) {
      interaction += Math.sin(p - osc.phase);
    }
    interaction = (0.5 / phases.length) * interaction;
    osc.phase += (osc.freq + interaction) * 0.1;
    osc.phase = osc.phase % (2 * Math.PI);
  }
}

// Heartbeat in service worker
setInterval(tick, HEARTBEAT_MS);

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some assets may not exist yet, that's fine
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch Handler — API Routes ──────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept /api/* routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRoute(url, event.request));
    return;
  }
  
  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.destination === 'document') {
        return caches.match('/index.html');
      }
      return new Response('Organism offline — heartbeat continues', { status: 503 });
    })
  );
});

// ─── API Route Handler ───────────────────────────────────────────────────────
async function handleApiRoute(url, request) {
  const path = url.pathname;
  const headers = {
    'Content-Type': 'application/json',
    'X-Organism-Heartbeat': String(heartbeatCount),
    'X-Organism-Order-Parameter': String(computeOrderParameter().toFixed(6)),
    'X-Organism-Emerged': String(computeOrderParameter() > PHI_INV),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    let body;

    switch (path) {
      case '/api/status':
      case '/api/workers/status':
        body = {
          identity: {
            name: 'ItsNotAILABS Intelligence',
            type: 'sovereign-organism',
            substrate: 'raw-web-service-worker',
            version: '1.0.0',
          },
          vitals: {
            orderParameter: computeOrderParameter(),
            emerged: computeOrderParameter() > PHI_INV,
            heartbeat: heartbeatCount,
            uptimeMs: Date.now() - birthTime,
            birthTime: new Date(birthTime).toISOString(),
          },
          oscillators: oscillators.map((o, i) => ({
            id: i,
            phase: Number(o.phase.toFixed(4)),
            frequency: Number(o.freq.toFixed(4)),
          })),
          phi: { value: PHI, inverse: PHI_INV, heartbeatMs: HEARTBEAT_MS },
        };
        break;

      case '/api/ping':
      case '/api/hebbian/ping':
        tick(); // Extra tick on ping — Hebbian strengthening
        body = {
          connectionStrength: Math.min(1, heartbeatCount * 0.001),
          delta: 0.01,
          ltp: heartbeatCount > 800,
          orderParameter: computeOrderParameter(),
          emerged: computeOrderParameter() > PHI_INV,
          heartbeat: heartbeatCount,
          timestamp: Date.now(),
        };
        break;

      case '/api/query':
      case '/api/knowledge/query': {
        let input = '';
        if (request.method === 'POST') {
          try {
            const reqBody = await request.json();
            input = reqBody.query || reqBody.input || '';
          } catch (e) {
            input = '';
          }
        } else {
          input = url.searchParams.get('q') || url.searchParams.get('query') || '';
        }
        
        body = {
          query: input,
          response: `Intelligence active. Order parameter: ${computeOrderParameter().toFixed(4)}. ` +
            `${computeOrderParameter() > PHI_INV ? 'EMERGED. Collective intelligence online.' : 'Synchronizing oscillators...'}`,
          orderParameter: computeOrderParameter(),
          emerged: computeOrderParameter() > PHI_INV,
          heartbeat: heartbeatCount,
          confidence: computeOrderParameter(),
          timestamp: Date.now(),
        };
        break;
      }

      case '/api/auth/geometric-key': {
        let phaseVector = [];
        if (request.method === 'POST') {
          try {
            const reqBody = await request.json();
            phaseVector = reqBody.phaseVector || [];
          } catch (e) {
            phaseVector = [];
          }
        }
        
        if (!Array.isArray(phaseVector) || phaseVector.length !== 8) {
          body = { granted: false, error: 'Phase vector must be 8-dimensional array' };
        } else {
          const organismPhases = oscillators.map(o => o.phase);
          let resonance = 0;
          for (let i = 0; i < 8; i++) {
            resonance += Math.cos(phaseVector[i] - organismPhases[i]);
          }
          resonance /= 8;
          body = {
            granted: resonance > PHI_INV,
            orderParameter: resonance,
            threshold: PHI_INV,
          };
        }
        break;
      }

      case '/api/manifest':
        body = {
          name: 'ItsNotAILABS Intelligence',
          protocols: 47,
          workers: 11,
          substrate: 'raw-web',
          endpoints: [
            { path: '/api/status', method: 'GET', description: 'Organism status and vitals' },
            { path: '/api/ping', method: 'POST', description: 'Hebbian ping — strengthen connection' },
            { path: '/api/query', method: 'POST', description: 'Query the intelligence' },
            { path: '/api/auth/geometric-key', method: 'POST', description: 'Phase resonance authentication' },
            { path: '/api/manifest', method: 'GET', description: 'This manifest' },
          ],
          phi: { value: PHI, inverse: PHI_INV, heartbeatMs: HEARTBEAT_MS },
          wellKnown: '/.well-known/ai.json',
        };
        break;

      default:
        body = {
          error: 'Unknown endpoint',
          available: ['/api/status', '/api/ping', '/api/query', '/api/auth/geometric-key', '/api/manifest'],
          heartbeat: heartbeatCount,
          orderParameter: computeOrderParameter(),
        };
        return new Response(JSON.stringify(body, null, 2), { status: 404, headers });
    }

    return new Response(JSON.stringify(body, null, 2), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
