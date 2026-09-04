#!/usr/bin/env node
'use strict';

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

function strokeRoundRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth = 1) {
  roundRect(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
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

function drawBox(ctx, centerX, centerY) {
  const boxY = centerY + 16;
  const boxWidth = 120;
  const half = boxWidth / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(225, 108, 60, 0.16)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;

  ctx.beginPath();
  ctx.moveTo(centerX - half, boxY - 8);
  ctx.lineTo(centerX, boxY + 26);
  ctx.lineTo(centerX + half, boxY - 8);
  ctx.lineTo(centerX, boxY - 39);
  ctx.closePath();
  ctx.fillStyle = '#F2C991';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX - half, boxY - 8);
  ctx.lineTo(centerX - 22, boxY - 28);
  ctx.lineTo(centerX, boxY - 39);
  ctx.lineTo(centerX - 10, boxY - 4);
  ctx.closePath();
  ctx.fillStyle = '#F8D9A8';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX + half, boxY - 8);
  ctx.lineTo(centerX + 22, boxY - 28);
  ctx.lineTo(centerX, boxY - 39);
  ctx.lineTo(centerX + 10, boxY - 4);
  ctx.closePath();
  ctx.fillStyle = '#FFE3B6';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX - 50, boxY - 1);
  ctx.lineTo(centerX - 8, boxY + 22);
  ctx.lineTo(centerX - 1, boxY - 4);
  ctx.lineTo(centerX - 31, boxY - 23);
  ctx.closePath();
  ctx.fillStyle = '#EEC37F';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX + 50, boxY - 1);
  ctx.lineTo(centerX + 8, boxY + 22);
  ctx.lineTo(centerX + 1, boxY - 4);
  ctx.lineTo(centerX + 31, boxY - 23);
  ctx.closePath();
  ctx.fillStyle = '#F7D497';
  ctx.fill();

  ctx.restore();
}

function drawDownloadBadge(ctx, centerX, centerY) {
  ctx.save();
  ctx.shadowColor = 'rgba(236, 87, 54, 0.2)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#F4D0BE';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = '#F15A36';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 6);
  ctx.lineTo(centerX, centerY + 5);
  ctx.moveTo(centerX - 5, centerY + 1);
  ctx.lineTo(centerX, centerY + 6);
  ctx.lineTo(centerX + 5, centerY + 1);
  ctx.stroke();
  ctx.restore();
}

function drawTitle(ctx) {
  const prefix = '点击按钮安装 ';
  const product = 'BaiYing';
  ctx.save();
  ctx.font = '700 28px "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif';
  ctx.fillStyle = '#050505';
  ctx.textBaseline = 'middle';

  const prefixWidth = ctx.measureText(prefix).width;
  const productWidth = ctx.measureText(product).width;
  const startX = (WIDTH - prefixWidth - productWidth) / 2;
  const y = 172;

  ctx.fillText(prefix, startX, y);
  ctx.fillText(product, startX + prefixWidth, y);

  ctx.strokeStyle = '#FF6B65';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(startX + prefixWidth + 3, y + 17);
  ctx.bezierCurveTo(
    startX + prefixWidth + 26,
    y + 20,
    startX + prefixWidth + productWidth - 20,
    y + 12,
    startX + prefixWidth + productWidth,
    y + 16,
  );
  ctx.stroke();
  ctx.restore();
}

function drawInstallButton(ctx) {
  const x = (WIDTH - 138) / 2;
  const y = 218;
  fillRoundRect(ctx, x, y, 138, 40, 21, '#050505');
  ctx.font = '700 15px "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('一键安装', WIDTH / 2, y + 20);
}

async function drawWelcomeImage() {
  registerFontIfPresent('C:\\Windows\\Fonts\\msyh.ttc', 'Microsoft YaHei');
  registerFontIfPresent('C:\\Windows\\Fonts\\msyhbd.ttc', 'Microsoft YaHei UI');

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#FFF1EA');
  gradient.addColorStop(0.52, '#FFF8F3');
  gradient.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(65, 0, 10, 65, 0, 130);
  glow.addColorStop(0, 'rgba(255, 118, 76, 0.18)');
  glow.addColorStop(1, 'rgba(255, 118, 76, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 230, 130);

  const coolGlow = ctx.createRadialGradient(510, 105, 20, 510, 105, 310);
  coolGlow.addColorStop(0, 'rgba(255, 221, 184, 0.24)');
  coolGlow.addColorStop(1, 'rgba(255, 221, 184, 0)');
  ctx.fillStyle = coolGlow;
  ctx.fillRect(240, 0, 390, 270);

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.lineWidth = 1.4;
  for (const radius of [44, 63, 84]) {
    ctx.beginPath();
    ctx.arc(WIDTH / 2, 92, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  drawBox(ctx, WIDTH / 2, 92);

  if (fs.existsSync(sourceIcon)) {
    const icon = await loadImage(sourceIcon);
    ctx.save();
    ctx.shadowColor = 'rgba(224, 76, 52, 0.16)';
    ctx.shadowBlur = 12;
    fillRoundRect(ctx, WIDTH / 2 - 35, 42, 70, 70, 18, '#FFFFFF');
    strokeRoundRect(ctx, WIDTH / 2 - 35, 42, 70, 70, 18, 'rgba(241, 207, 190, 0.7)');
    ctx.clip();
    ctx.drawImage(icon, WIDTH / 2 - 31, 46, 62, 62);
    ctx.restore();
  }

  drawDownloadBadge(ctx, WIDTH / 2, 129);
  drawTitle(ctx);
  drawInstallButton(ctx);

  return canvas;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const canvas = await drawWelcomeImage();
  writeBmp(canvas, outputBmp);
  fs.writeFileSync(outputPreviewPng, canvas.toBuffer('image/png'));
  console.log(`Generated installer assets: ${path.relative(projectRoot, outputBmp)}`);
}

module.exports = {
  generateInstallerAssets: main,
};

if (require.main === module) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
