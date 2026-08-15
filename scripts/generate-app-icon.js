/**
 * Generate Windows .ico + PNG icon sizes from the Cowork UI logo (public/logo.svg).
 *
 * Prefers @resvg/resvg-js when available (transparent PNG with SVG gradients/shadow).
 * Falls back to public/logo.png via PowerShell System.Drawing for the .ico pack only.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SOURCE_SVG = path.join(ROOT, 'public', 'logo.svg');
const SOURCE_PNG = path.join(ROOT, 'public', 'logo.png');
const PNG_DIR = path.join(ROOT, 'build', 'icons', 'png');
const OUT_DIR = path.join(ROOT, 'build', 'icons', 'win');
const OUT_ICO = path.join(OUT_DIR, 'icon.ico');
const TRAY_DIR = path.join(ROOT, 'resources', 'tray');
const PNG_SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
const ICO_SIZES = [256, 128, 64, 48, 32, 16];
const TRAY_ICO_SIZES = [48, 32, 16];

fs.mkdirSync(PNG_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TRAY_DIR, { recursive: true });

function packIco(pngBuffers, outPath) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  let currentOffset = headerSize + entrySize * count;
  const entries = pngBuffers.map(({ size, data }) => {
    const entry = {
      width: size >= 256 ? 0 : size,
      height: size >= 256 ? 0 : size,
      dataSize: data.length,
      offset: currentOffset,
      data,
    };
    currentOffset += data.length;
    return entry;
  });

  const ico = Buffer.alloc(currentOffset);
  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(count, 4);
  entries.forEach((e, i) => {
    const off = headerSize + i * entrySize;
    ico.writeUInt8(e.width, off + 0);
    ico.writeUInt8(e.height, off + 1);
    ico.writeUInt8(0, off + 2);
    ico.writeUInt8(0, off + 3);
    ico.writeUInt16LE(1, off + 4);
    ico.writeUInt16LE(32, off + 6);
    ico.writeUInt32LE(e.dataSize, off + 8);
    ico.writeUInt32LE(e.offset, off + 12);
  });
  entries.forEach((e) => e.data.copy(ico, e.offset));
  fs.writeFileSync(outPath, ico);
  console.log(`Generated ${outPath} (${pngBuffers.map((p) => p.size).join(', ')}px) — ${ico.length} bytes`);
}

function tryResvg() {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    return require('@resvg/resvg-js');
  } catch {
    return null;
  }
}

function generateFromSvg(Resvg) {
  if (!fs.existsSync(SOURCE_SVG)) {
    throw new Error(`Missing Cowork UI logo: ${SOURCE_SVG}`);
  }
  const svg = fs.readFileSync(SOURCE_SVG);
  const render = (size) => {
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: size },
      background: 'rgba(0,0,0,0)',
    });
    return Buffer.from(resvg.render().asPng());
  };

  for (const size of PNG_SIZES) {
    const buf = render(size);
    fs.writeFileSync(path.join(PNG_DIR, `${size}x${size}.png`), buf);
    console.log(`Wrote ${size}x${size}.png (${buf.length} bytes)`);
  }

  // Keep logo.png in sync as a raster fallback of the UI SVG.
  fs.writeFileSync(SOURCE_PNG, render(512));
  console.log(`Updated ${SOURCE_PNG}`);

  packIco(
    ICO_SIZES.map((size) => ({ size, data: render(size) })),
    OUT_ICO,
  );
  packIco(
    TRAY_ICO_SIZES.map((size) => ({ size, data: render(size) })),
    path.join(TRAY_DIR, 'tray-icon.ico'),
  );
  fs.writeFileSync(path.join(TRAY_DIR, 'tray-icon.png'), render(48));
  fs.writeFileSync(path.join(TRAY_DIR, 'tray-icon-mac.png'), render(22));
  fs.writeFileSync(path.join(TRAY_DIR, 'tray-icon-mac@2x.png'), render(44));
}

function generateFromPngFallback() {
  if (!fs.existsSync(SOURCE_PNG)) {
    throw new Error(`Missing logo.png fallback: ${SOURCE_PNG}`);
  }

  const tmpDir = path.join(ROOT, 'build', 'icons', '_tmp');
  fs.mkdirSync(tmpDir, { recursive: true });

  const psScript = `
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile("${SOURCE_PNG.replace(/\\/g, '\\\\')}")
$sizes = @(${ICO_SIZES.join(',')})
foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $s, $s)
    $g.Dispose()
    $outPath = "${tmpDir.replace(/\\/g, '\\\\')}\\\\icon_$s.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}
$src.Dispose()
`;

  const psFile = path.join(tmpDir, 'resize.ps1');
  fs.writeFileSync(psFile, psScript, 'utf8');
  execSync(`powershell -ExecutionPolicy Bypass -File "${psFile}"`, { stdio: 'inherit' });

  packIco(
    ICO_SIZES.map((size) => ({
      size,
      data: fs.readFileSync(path.join(tmpDir, `icon_${size}.png`)),
    })),
    OUT_ICO,
  );
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.warn('Generated from logo.png fallback. Install @resvg/resvg-js to use logo.svg directly.');
}

const resvgMod = tryResvg();
if (resvgMod) {
  generateFromSvg(resvgMod.Resvg);
} else {
  generateFromPngFallback();
}
