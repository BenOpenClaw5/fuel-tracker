import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Light cream substrate distinguishes FUEL from OVERLOAD on the home screen.
const BG = "#FAF7F2";
const FG = "#1A1814";
const ACCENT = "#FF6A00";
const INFO = "#2E7BFF";

function iconSvg(size, { maskable = false } = {}) {
  const pad = maskable ? Math.round(size * 0.22) : Math.round(size * 0.14);
  const inner = size - pad * 2;

  const barH = Math.round(inner * 0.18);
  const gap = Math.round(inner * 0.08);
  const groupH = barH * 3 + gap * 2;
  const startY = pad + Math.round((inner - groupH) / 2);

  const w1 = Math.round(inner * 0.5);
  const w2 = Math.round(inner * 0.74);
  const w3 = inner;

  const r = Math.max(2, Math.round(inner * 0.025));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect x="${pad}" y="${startY}" width="${w1}" height="${barH}" rx="${r}" fill="${INFO}"/>
  <rect x="${pad}" y="${startY + barH + gap}" width="${w2}" height="${barH}" rx="${r}" fill="${FG}"/>
  <rect x="${pad}" y="${startY + (barH + gap) * 2}" width="${w3}" height="${barH}" rx="${r}" fill="${ACCENT}"/>
</svg>`;
}

async function writePng(size, filename, opts) {
  const svg = iconSvg(size, opts);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(resolve("public", filename), png);
  console.log(`wrote ${filename} (${size}x${size})`);
}

async function writeSvg(size, filename, opts) {
  await writeFile(resolve("public", filename), iconSvg(size, opts));
  console.log(`wrote ${filename}`);
}

await writePng(192, "icon-192.png");
await writePng(512, "icon-512.png");
await writePng(512, "icon-maskable-512.png", { maskable: true });
await writePng(180, "apple-touch-icon.png");
await writeSvg(512, "icon.svg");

const favPng = await sharp(Buffer.from(iconSvg(64))).resize(64, 64).png().toBuffer();
await writeFile(resolve("public", "favicon.png"), favPng);
console.log("wrote favicon.png");
