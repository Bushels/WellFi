// Generate WellFi favicons from the brand "XX" signal-weave mark.
// Source: public/wellfi_logo_transparent.webp (the live site logo, transparent).
// We crop the red XX mark and set it on a dark brand chip (matches the site UI),
// then emit Next.js App-Router icons: src/app/icon.png, apple-icon.png, favicon.ico.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const SRC = 'public/wellfi_logo_transparent.webp';
const CHIP = '#0b1622';   // dark brand navy chip
const MARK_FRAC = 0.84;   // XX width as a fraction of the square

// Tight crop of just the XX mark (left of the wordmark gap), then clean it:
// the source crop carries a faint semi-transparent shadow/texture, so we drop
// low-alpha pixels and normalize the kept pixels to the brand red (#ef4444).
const RED = [0xef, 0x44, 0x44];
const ALPHA_FLOOR = 60; // below this is background haze → fully transparent
const crop = await sharp(SRC)
  .extract({ left: 35, top: 0, width: 330, height: 201 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
{
  const { data, info } = crop;
  for (let i = 0; i < info.width * info.height; i++) {
    const a = data[i * 4 + 3];
    const cleaned = a < ALPHA_FLOOR ? 0 : Math.min(255, Math.round(((a - ALPHA_FLOOR) * 255) / (255 - ALPHA_FLOOR)));
    data[i * 4] = RED[0];
    data[i * 4 + 1] = RED[1];
    data[i * 4 + 2] = RED[2];
    data[i * 4 + 3] = cleaned;
  }
}
const xx = await sharp(crop.data, { raw: { width: crop.info.width, height: crop.info.height, channels: 4 } }).png().toBuffer();
const xxAR = crop.info.width / crop.info.height;

async function chipBase(size, round) {
  if (!round) {
    return sharp({ create: { width: size, height: size, channels: 4, background: CHIP } }).png().toBuffer();
  }
  const r = Math.round(size * 0.16);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${CHIP}"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function compose(size, round) {
  const base = await chipBase(size, round);
  const markW = Math.round(size * MARK_FRAC);
  const markH = Math.round(markW / xxAR);
  const mark = await sharp(xx).resize(markW, markH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(base)
    .composite([{ input: mark, top: Math.round((size - markH) / 2), left: Math.round((size - markW) / 2) }])
    .png()
    .toBuffer();
}

// PNG-embedded ICO (modern browsers + Windows support PNG-in-ICO).
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + 16 * entries.length;
  entries.forEach((e, i) => {
    const b = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b);
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1);
    dir.writeUInt8(0, b + 2);
    dir.writeUInt8(0, b + 3);
    dir.writeUInt16LE(1, b + 4);
    dir.writeUInt16LE(32, b + 6);
    dir.writeUInt32LE(e.data.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += e.data.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

// Browser tab icon + PWA icon (rounded chip).
await sharp(await compose(512, true)).toFile('src/app/icon.png');
// Apple touch icon — full-bleed square (iOS rounds it itself).
await sharp(await compose(180, false)).toFile('src/app/apple-icon.png');
// Legacy favicon.ico (32 + 48, rounded).
const ico = buildIco([
  { size: 32, data: await compose(32, true) },
  { size: 48, data: await compose(48, true) },
]);
writeFileSync('src/app/favicon.ico', ico);

// Small preview for visual QA.
await sharp(await compose(32, true)).resize(160, 160, { kernel: 'nearest' }).toFile('tmp_favicon32_preview.png');
console.log('favicons written: src/app/icon.png, apple-icon.png, favicon.ico');
