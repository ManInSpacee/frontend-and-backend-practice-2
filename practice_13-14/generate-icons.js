import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const teeth = 8;
  const toothHeight = size * 0.1;
  const toothWidth = (Math.PI * 2) / teeth / 2.5;

  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2 - Math.PI / 2;
    const nextAngle = ((i + 1) / teeth) * Math.PI * 2 - Math.PI / 2;
    const midAngle = angle + (nextAngle - angle) * 0.5;

    const x1 = cx + Math.cos(angle - toothWidth) * r;
    const y1 = cy + Math.sin(angle - toothWidth) * r;
    const x2 = cx + Math.cos(angle - toothWidth) * (r + toothHeight);
    const y2 = cy + Math.sin(angle - toothWidth) * (r + toothHeight);
    const x3 = cx + Math.cos(angle + toothWidth) * (r + toothHeight);
    const y3 = cy + Math.sin(angle + toothWidth) * (r + toothHeight);
    const x4 = cx + Math.cos(angle + toothWidth) * r;
    const y4 = cy + Math.sin(angle + toothWidth) * r;

    if (i === 0) ctx.moveTo(x1, y1);
    else ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.arc(cx, cy, r, angle + toothWidth, nextAngle - toothWidth);
  }
  ctx.closePath();
  ctx.fillStyle = '#ff4d00';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();

  return canvas.toBuffer('image/png');
}

const sizes = [32, 192, 512];
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

for (const size of sizes) {
  const buf = drawIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), buf);
  console.log(`icon-${size}.png создана`);
}
console.log('Иконки готовы');
