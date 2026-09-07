#!/usr/bin/env node
'use strict';

/**
 * Generates the NSIS installer welcome bitmap (630×352).
 * Visual language matches the in-app startup loading screen:
 * soft brand wash, colorful orbit ribbons, centered mascot/icon, flat CTA.
 */

const fs = require('fs');
const path = require('path');

const { GlobalFonts, createCanvas, loadImage } = require('@napi-rs/canvas');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'build', 'installer');
const sourceIcon = path.join(projectRoot, 'build', 'icons', 'png', '256x256.png');
const outputBmp = path.join(outputDir, 'welcome.bmp');
const outputPreviewPng = path.join(outputDir, 'welcome.png');

const WIDTH = 630;
const HEIGHT = 352;

/** Brand primary — keep BaiYing tokens, not the skill purple palette. */
const PRIMARY = '#FF004D';
const PRIMARY_SOFT = 'rgba(255, 0, 77, 0.08)';
const INK = '#1A1D23';
const MUTED = '#6B7280';

function registerFontIfPresent(filePath, family) {
  if (!fs.existsSync(filePath)) return;
  try {
    GlobalFonts.registerFromPath(filePath, family);
  } catch {
    // Font registration is best-effort; canvas will fall back to a system font.
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  roundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function writeBmp(canvas, filePath) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const headerSize = 54;
  const buffer = Buffer.alloc(headerSize + pixelDataSize);

  buffer.write('BM', 0, 2, 'ascii');
  buffer.writeUInt32LE(buffer.length, 2);
  buffer.writeUInt32LE(headerSize, 10);
  buffer.writeUInt32LE(40, 14);
  buffer.writeInt32LE(width, 18);
  buffer.writeInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(24, 28);
  buffer.writeUInt32LE(0, 30);
  buffer.writeUInt32LE(pixelDataSize, 34);
  buffer.writeInt32LE(2835, 38);
  buffer.writeInt32LE(2835, 42);

  for (let y = 0; y < height; y += 1) {
    const sourceY = height - 1 - y;
    const rowOffset = headerSize + y * rowSize;
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = (sourceY * width + x) * 4;
      const targetOffset = rowOffset + x * 3;
      buffer[targetOffset] = rgba[sourceOffset + 2];
      buffer[targetOffset + 1] = rgba[sourceOffset + 1];
      buffer[targetOffset + 2] = rgba[sourceOffset];
    }
  }

  fs.writeFileSync(filePath, buffer);
}

/** Hue wheel helper — same feel as startup orbit ribbons. */
function wheel(hue, s = 0.55, l = 0.62) {
  const h = ((hue % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r;
  let g;
  let b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const hex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/**
 * Draw a frozen “loading animation” frame: elliptical colorful arcs
 * wrapping a center mark — mirrors CoworkStartupMascot orbit ribbons.
 */
function drawOrbitRibbons(ctx, cx, cy, radius) {
  const rings = [
    { a: 1.15, tilt: 0.55, phase: 0.15, sweep: 2.4, hue: 12, width: 7 },
    { a: 1.28, tilt: -0.4, phase: 1.2, sweep: 2.1, hue: 165, width: 6 },
    { a: 1.38, tilt: 0.85, phase: 2.4, sweep: 1.9, hue: 265, width: 5.5 },
    { a: 1.22, tilt: -0.95, phase: 3.5, sweep: 2.0, hue: 45, width: 5 },
  ];

  for (const ring of rings) {
    const rx = radius * ring.a;
    const ry = radius * ring.a * 0.42;
    const start = ring.phase;
    const end = ring.phase + ring.sweep;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ring.tilt);
    ctx.lineCap = 'round';
    ctx.lineWidth = ring.width;
    ctx.globalAlpha = 0.88;

    const steps = 36;
    for (let i = 0; i < steps; i += 1) {
      const t0 = start + ((end - start) * i) / steps;
      const t1 = start + ((end - start) * (i + 1)) / steps;
      const hue = ring.hue + (i / steps) * 70;
      ctx.strokeStyle = wheel(hue);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, t0, t1);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawBotFace(ctx, cx, cy, scale) {
  // Soft body disc
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, 38 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(26, 29, 35, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Face silhouette hint (rounded capsule)
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2 * scale, 28 * scale, 26 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes — slightly open, friendly
  ctx.fillStyle = '#FFFFFF';
  const eyeY = cy - 2 * scale;
  ctx.beginPath();
  ctx.ellipse(cx - 10 * scale, eyeY, 5.2 * scale, 6.2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 11 * scale, eyeY, 5 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTitle(ctx) {
  const prefix = '安装 ';
  const product = '百应';
  ctx.save();
  ctx.font = '700 30px "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif';
  ctx.textBaseline = 'middle';

  const prefixWidth = ctx.measureText(prefix).width;
  const productWidth = ctx.measureText(product).width;
  const startX = (WIDTH - prefixWidth - productWidth) / 2;
  const y = 188;

  ctx.fillStyle = INK;
  ctx.fillText(prefix, startX, y);
  ctx.fillStyle = PRIMARY;
  ctx.fillText(product, startX + prefixWidth, y);

  // Accent underline under product name (flat, no heavy decoration)
  ctx.strokeStyle = PRIMARY;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(startX + prefixWidth + 2, y + 16);
  ctx.lineTo(startX + prefixWidth + productWidth - 2, y + 16);
  ctx.stroke();
  ctx.restore();
}

function drawSubtitle(ctx) {
  ctx.save();
  ctx.font = '400 13px "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif';
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('你的全场景办公 Agent · 安装后即可开始协作', WIDTH / 2, 218);
  ctx.restore();
}

function drawInstallButton(ctx) {
  const w = 148;
  const h = 42;
  const x = (WIDTH - w) / 2;
  const y = 242;
  fillRoundRect(ctx, x, y, w, h, 21, PRIMARY);
  ctx.font = '700 15px "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('一键安装', WIDTH / 2, y + h / 2);
}

function drawProgressHint(ctx) {
  // Mini shimmer bar — echoes the loading page progress strip
  const barW = 160;
  const barH = 4;
  const x = (WIDTH - barW) / 2;
  const y = 300;
  fillRoundRect(ctx, x, y, barW, barH, 2, 'rgba(255, 0, 77, 0.14)');
  fillRoundRect(ctx, x, y, barW * 0.42, barH, 2, PRIMARY);
}

async function drawWelcomeImage() {
  registerFontIfPresent('C:\\Windows\\Fonts\\msyh.ttc', 'Microsoft YaHei');
  registerFontIfPresent('C:\\Windows\\Fonts\\msyhbd.ttc', 'Microsoft YaHei UI');

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Flat light canvas + soft brand wash (same family as EngineStartupOverlay)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const wash = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  wash.addColorStop(0, 'rgba(255, 0, 77, 0.07)');
  wash.addColorStop(0.45, 'rgba(255, 0, 77, 0.02)');
  wash.addColorStop(1, 'rgba(255, 0, 77, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const softGlow = ctx.createRadialGradient(WIDTH / 2, 96, 20, WIDTH / 2, 96, 160);
  softGlow.addColorStop(0, PRIMARY_SOFT);
  softGlow.addColorStop(1, 'rgba(255, 0, 77, 0)');
  ctx.fillStyle = softGlow;
  ctx.fillRect(WIDTH / 2 - 180, 0, 360, 220);

  const heroX = WIDTH / 2;
  const heroY = 98;
  drawOrbitRibbons(ctx, heroX, heroY, 52);

  if (fs.existsSync(sourceIcon)) {
    const icon = await loadImage(sourceIcon);
    ctx.save();
    fillRoundRect(ctx, heroX - 36, heroY - 36, 72, 72, 20, '#FFFFFF');
    ctx.beginPath();
    roundRect(ctx, heroX - 36, heroY - 36, 72, 72, 20);
    ctx.clip();
    ctx.drawImage(icon, heroX - 32, heroY - 32, 64, 64);
    ctx.restore();
    // Thin flat ring
    ctx.strokeStyle = 'rgba(26, 29, 35, 0.08)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, heroX - 36, heroY - 36, 72, 72, 20);
    ctx.stroke();
  } else {
    drawBotFace(ctx, heroX, heroY, 1);
  }

  drawTitle(ctx);
  drawSubtitle(ctx);
  drawInstallButton(ctx);
  drawProgressHint(ctx);

  return canvas;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const canvas = await drawWelcomeImage();
  writeBmp(canvas, outputBmp);
  fs.writeFileSync(outputPreviewPng, canvas.toBuffer('image/png'));
  console.log(`Generated installer assets: ${path.relative(projectRoot, outputBmp)}`);
  console.log(`Preview PNG: ${path.relative(projectRoot, outputPreviewPng)}`);
}

module.exports = {
  generateInstallerAssets: main,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
