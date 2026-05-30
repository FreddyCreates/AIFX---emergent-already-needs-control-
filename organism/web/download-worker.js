/**
 * Download Worker — Sovereign Zip Builder
 *
 * Web Worker that builds real .zip files from extension source code
 * entirely in the browser. No server. No GitHub. No dependencies.
 *
 * Uses a minimal pure-JS zip implementation (STORE method, no compression
 * needed — extensions are tiny). Generates Blob URLs that trigger real
 * file downloads when clicked.
 *
 * This worker runs permanently on the user's device. It builds all 26
 * extension zips on startup, posts blob URLs back to the main thread,
 * and keeps a heartbeat alive at 873ms.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'build', extensions: [...] }
 *   Worker → Main: { type: 'zip-ready', slug, blob, filename }
 *   Worker → Main: { type: 'all-ready', count }
 *   Worker → Main: { type: 'heartbeat', beat, status }
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
let beatCount = 0;
let running = true;

/* ════════════════════════════════════════════════════════════════
   Minimal ZIP builder — pure JS, zero dependencies
   Implements PKZIP STORE (no compression) which is perfect for
   small text files like manifest.json, background.js, content.js
   ════════════════════════════════════════════════════════════════ */

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function strToBytes(str) {
  return new TextEncoder().encode(str);
}

function u16le(v) { return [v & 0xFF, (v >> 8) & 0xFF]; }
function u32le(v) { return [v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF, (v >> 24) & 0xFF]; }

function buildZip(files) {
  // files = [ { name: 'manifest.json', data: Uint8Array }, ... ]
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = strToBytes(file.name);
    const data = file.data;
    const crc = crc32(data);
    const size = data.length;

    // Local file header (30 bytes + name + data)
    const local = new Uint8Array([
      0x50, 0x4B, 0x03, 0x04,   // signature
      0x14, 0x00,                 // version needed (2.0)
      0x00, 0x00,                 // flags
      0x00, 0x00,                 // compression (STORE)
      0x00, 0x00,                 // mod time
      0x00, 0x00,                 // mod date
      ...u32le(crc),
      ...u32le(size),             // compressed size
      ...u32le(size),             // uncompressed size
      ...u16le(nameBytes.length),
      0x00, 0x00,                 // extra field length
      ...nameBytes,
      ...data,
    ]);
    localHeaders.push(local);

    // Central directory header (46 bytes + name)
    const central = new Uint8Array([
      0x50, 0x4B, 0x01, 0x02,   // signature
      0x14, 0x00,                 // version made by
      0x14, 0x00,                 // version needed
      0x00, 0x00,                 // flags
      0x00, 0x00,                 // compression (STORE)
      0x00, 0x00,                 // mod time
      0x00, 0x00,                 // mod date
      ...u32le(crc),
      ...u32le(size),
      ...u32le(size),
      ...u16le(nameBytes.length),
      0x00, 0x00,                 // extra field length
      0x00, 0x00,                 // comment length
      0x00, 0x00,                 // disk number
      0x00, 0x00,                 // internal attrs
      0x00, 0x00, 0x00, 0x00,   // external attrs
      ...u32le(offset),           // local header offset
      ...nameBytes,
    ]);
    centralHeaders.push(central);

    offset += local.length;
  }

  const centralOffset = offset;
  let centralSize = 0;
  for (const ch of centralHeaders) centralSize += ch.length;

  // End of central directory (22 bytes)
  const eocd = new Uint8Array([
    0x50, 0x4B, 0x05, 0x06,
    0x00, 0x00,                   // disk number
    0x00, 0x00,                   // disk with central dir
    ...u16le(files.length),
    ...u16le(files.length),
    ...u32le(centralSize),
    ...u32le(centralOffset),
    0x00, 0x00,                   // comment length
  ]);

  // Concatenate all parts
  const totalSize = offset + centralSize + eocd.length;
  const result = new Uint8Array(totalSize);
  let pos = 0;
  for (const lh of localHeaders) { result.set(lh, pos); pos += lh.length; }
  for (const ch of centralHeaders) { result.set(ch, pos); pos += ch.length; }
  result.set(eocd, pos);

  return result;
}

/* ════════════════════════════════════════════════════════════════
   Icon generator — creates PNG data for extension icons
   Simple colored square with initials (same as build-extensions.sh)
   ════════════════════════════════════════════════════════════════ */

function generateIconPNG(size, color, initials) {
  // Minimal 1x1-ish PNG placeholder — in production the real icons from
  // the extensions/ dirs are used. This is a fallback for in-browser builds.
  // Creates a minimal valid PNG with the right dimensions.
  // For real icons, the worker reads them from the extension source.
  return null; // Will use actual icon files from source
}

/* ════════════════════════════════════════════════════════════════
   Build pipeline — packages each extension into a zip
   ════════════════════════════════════════════════════════════════ */

function buildExtensionZip(ext) {
  // ext = { slug, name, manifest, background, content, icons }
  const files = [];

  // manifest.json
  if (ext.manifest) {
    files.push({ name: 'manifest.json', data: strToBytes(ext.manifest) });
  }

  // background.js
  if (ext.background) {
    files.push({ name: 'background.js', data: strToBytes(ext.background) });
  }

  // content.js
  if (ext.content) {
    files.push({ name: 'content.js', data: strToBytes(ext.content) });
  }

  // icons
  if (ext.icons) {
    for (const icon of ext.icons) {
      if (icon.data) {
        files.push({ name: icon.name, data: icon.data });
      }
    }
  }

  return buildZip(files);
}

function buildAllZip(individualZips) {
  // Bundle all individual zips into one mega-zip
  const files = [];
  for (const iz of individualZips) {
    files.push({ name: iz.filename, data: iz.data });
  }
  return buildZip(files);
}

/* ════════════════════════════════════════════════════════════════
   Message handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  const msg = e.data;

  switch (msg.type) {
    case 'build': {
      const extensions = msg.extensions || [];
      const builtZips = [];

      for (const ext of extensions) {
        try {
          const zipData = buildExtensionZip(ext);
          const filename = ext.slug + '.zip';

          builtZips.push({ filename, data: zipData, slug: ext.slug });

          self.postMessage({
            type: 'zip-ready',
            slug: ext.slug,
            name: ext.name,
            filename,
            blob: new Blob([zipData], { type: 'application/zip' }),
          });
        } catch (err) {
          self.postMessage({
            type: 'zip-error',
            slug: ext.slug,
            error: err.message,
          });
        }
      }

      // Build all-in-one bundle
      if (builtZips.length > 0) {
        try {
          const allData = buildAllZip(builtZips);
          self.postMessage({
            type: 'zip-ready',
            slug: 'all-extensions',
            name: 'All Extensions',
            filename: 'all-extensions.zip',
            blob: new Blob([allData], { type: 'application/zip' }),
          });
        } catch (err) {
          self.postMessage({ type: 'zip-error', slug: 'all-extensions', error: err.message });
        }
      }

      self.postMessage({ type: 'all-ready', count: builtZips.length });
      break;
    }

    case 'stop':
      running = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      self.postMessage({ type: 'stopped' });
      break;

    case 'getState':
      self.postMessage({ type: 'state', beatCount, running });
      break;
  }
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat — runs permanently at 873ms
   ════════════════════════════════════════════════════════════════ */

var heartbeatInterval = setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    beat: beatCount,
    phi: PHI,
    heartbeatMs: HEARTBEAT,
    timestamp: Date.now(),
    status: 'alive',
  });
}, HEARTBEAT);
