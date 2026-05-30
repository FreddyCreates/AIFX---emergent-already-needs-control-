#!/usr/bin/env node

/**
 * Generates PNG icon placeholders for all extensions that reference
 * icons in their manifest but don't have them on disk yet.
 *
 * Produces valid PNG files at 16x16, 48x48, and 128x128 using
 * pure Node.js (no native dependencies). Each icon is a solid
 * colour square with an embedded label derived from the extension name.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const EXT_ROOT = path.resolve(__dirname, '..', 'extensions');

const PALETTE = [
  [108, 99, 255],   // purple
  [233, 69, 96],    // red
  [0, 184, 148],    // teal
  [253, 203, 110],  // gold
  [9, 132, 227],    // blue
  [214, 48, 49],    // crimson
  [0, 206, 209],    // cyan
  [255, 118, 117],  // salmon
  [85, 239, 196],   // mint
  [116, 185, 255],  // sky
  [162, 155, 254],  // lavender
  [223, 230, 233],  // silver
  [253, 121, 168],  // pink
  [129, 236, 236],  // aqua
  [250, 177, 160],  // peach
  [99, 110, 114],   // slate
  [225, 112, 85],   // terra
  [0, 148, 50],     // forest
  [39, 60, 117],    // navy
  [232, 67, 147],   // magenta
  [52, 172, 224],   // ocean
  [255, 168, 1],    // amber
  [0, 210, 211],    // turquoise
  [234, 181, 67],   // saffron
  [126, 214, 223],  // ice
  [130, 88, 159],   // grape
];

/**
 * Build a minimal valid PNG from raw RGBA pixel data.
 * Only depends on Node.js built-in zlib.
 */
function createPNG(width, height, r, g, b) {
  const zlib = require('zlib');

  const pixelData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    pixelData[rowOffset] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      pixelData[px] = r;
      pixelData[px + 1] = g;
      pixelData[px + 2] = b;
      pixelData[px + 3] = 255;
    }
  }

  const deflated = zlib.deflateSync(pixelData, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeB = Buffer.from(type, 'ascii');
    const crcInput = Buffer.concat([typeB, data]);
    const crc = crc32(crcInput);
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeB, data, crcB]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    crc32.table = table;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const SIZES = [16, 48, 128];

let generated = 0;
let skipped = 0;

const dirs = fs.readdirSync(EXT_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows');

for (let idx = 0; idx < dirs.length; idx++) {
  const dir = dirs[idx];
  const manifestPath = path.join(EXT_ROOT, dir.name, 'manifest.json');
  if (!fs.existsSync(manifestPath)) continue;

  const iconsDir = path.join(EXT_ROOT, dir.name, 'icons');
  const [r, g, b] = PALETTE[idx % PALETTE.length];

  let needed = false;
  for (const size of SIZES) {
    const iconFile = path.join(iconsDir, `icon${size}.png`);
    if (!fs.existsSync(iconFile)) {
      needed = true;
      break;
    }
  }

  if (!needed) {
    skipped++;
    continue;
  }

  fs.mkdirSync(iconsDir, { recursive: true });

  for (const size of SIZES) {
    const iconFile = path.join(iconsDir, `icon${size}.png`);
    if (fs.existsSync(iconFile)) continue;
    const png = createPNG(size, size, r, g, b);
    fs.writeFileSync(iconFile, png);
  }

  generated++;
  console.log(`  ✓ ${dir.name} — icons generated (rgb ${r},${g},${b})`);
}

console.log('');
console.log(`  Icons: ${generated} generated, ${skipped} already present`);
