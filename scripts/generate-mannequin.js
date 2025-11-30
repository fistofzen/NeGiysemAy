const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const width = 240;
const height = 512;
const outputDir = path.join(__dirname, '..', 'public', 'templates');
const outputPath = path.join(outputDir, 'mannequin.png');

fs.mkdirSync(outputDir, { recursive: true });

const png = new PNG({ width, height, colorType: 6 });

const centerX = Math.floor(width / 2);
const headRadius = 36;
const headCenterY = 80;
const neckHeight = 16;
const torsoTop = headCenterY + headRadius + neckHeight;
const torsoBottom = 340;
const hipWidth = 70;
const shoulderWidth = 120;
const legWidth = 42;
const legGap = 18;
const legTop = torsoBottom;
const legBottom = height - 24;
const armTop = torsoTop - 16;
const armBottom = torsoBottom - 36;
const armThickness = 28;
const bodyColor = { r: 56, g: 66, b: 82 };
const highlightColor = { r: 75, g: 85, b: 99 };

function setPixel(x, y, color) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (width * y + x) << 2;
  png.data[idx] = color.r;
  png.data[idx + 1] = color.g;
  png.data[idx + 2] = color.b;
  png.data[idx + 3] = color.a ?? 255;
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    let color = null;

    const dx = x - centerX;
    const dyHead = y - headCenterY;
    if (dx * dx + dyHead * dyHead <= headRadius * headRadius && y <= headCenterY + headRadius) {
      color = highlightColor;
    }

    if (!color && y >= headCenterY && y <= headCenterY + neckHeight && Math.abs(dx) <= 12) {
      color = bodyColor;
    }

    if (!color && y >= torsoTop && y <= torsoBottom) {
      const shoulderInterpolation = (y - torsoTop) / Math.max(torsoBottom - torsoTop, 1);
      const halfWidth = shoulderWidth / 2 - (shoulderWidth / 2 - hipWidth / 2) * shoulderInterpolation;
      if (Math.abs(dx) <= halfWidth) {
        color = y < torsoTop + 40 ? highlightColor : bodyColor;
      }
    }

    if (!color && y >= armTop && y <= armBottom) {
      const armOffset = shoulderWidth / 2 + armThickness / 2 - 4;
      if (Math.abs(Math.abs(dx) - armOffset) <= armThickness / 2) {
        color = bodyColor;
      }
    }

    if (!color && y >= legTop && y <= legBottom) {
      const leftLegCenter = centerX - legGap - legWidth / 2;
      const rightLegCenter = centerX + legGap + legWidth / 2;
      if (
        (Math.abs(x - leftLegCenter) <= legWidth / 2) ||
        (Math.abs(x - rightLegCenter) <= legWidth / 2)
      ) {
        color = y < legTop + 32 ? highlightColor : bodyColor;
      }
    }

    if (color) {
      setPixel(x, y, { ...color, a: 255 });
    } else {
      setPixel(x, y, { r: 0, g: 0, b: 0, a: 0 });
    }
  }
}

png.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
  console.log(`mannequin silhouette written to ${outputPath}`);
});
