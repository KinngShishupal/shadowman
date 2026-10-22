/* eslint-env node */
/**
 * Renders the app icon for Android (legacy + adaptive) and iOS from SVG.
 *   node scripts/make-icons.js <path-to-node_modules-with-@resvg/resvg-js>
 * The SVG sources are written to assets/icon/ so they can be edited later.
 */
const fs = require('fs');
const path = require('path');

const resvgDir = process.argv[2];
const { Resvg } = require(path.join(resvgDir, '@resvg', 'resvg-js'));
const root = path.join(__dirname, '..');

// ------------------------------------------------------------- artwork

const defs = `
  <radialGradient id="sky" cx="0.55" cy="0.32" r="0.85">
    <stop offset="0" stop-color="#4a2276"/>
    <stop offset="0.45" stop-color="#22104a"/>
    <stop offset="1" stop-color="#07041a"/>
  </radialGradient>
  <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0.35" stop-color="#e9d6ff" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#9a6ad8" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="moonFace" cx="0.4" cy="0.35" r="0.75">
    <stop offset="0" stop-color="#ffffff"/>
    <stop offset="0.7" stop-color="#ecdcff"/>
    <stop offset="1" stop-color="#c3a8ee"/>
  </radialGradient>
  <radialGradient id="eyeGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#d8fff6" stop-opacity="1"/>
    <stop offset="0.3" stop-color="#3ef0d0" stop-opacity="0.75"/>
    <stop offset="1" stop-color="#3ef0d0" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="scarf" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#5bffe2"/>
    <stop offset="0.7" stop-color="#25c9ad"/>
    <stop offset="1" stop-color="#1a8f7e" stop-opacity="0.6"/>
  </linearGradient>
  <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7a3470" stop-opacity="0"/>
    <stop offset="1" stop-color="#c45a6e" stop-opacity="0.55"/>
  </linearGradient>`;

function stars() {
  let s = '';
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 40; i++) {
    const x = rnd() * 1024;
    const y = rnd() * 560;
    const r = rnd() > 0.85 ? 4 : 1.5 + rnd() * 1.5;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(
      1,
    )}" fill="#fff4ff" opacity="${(0.35 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  return s;
}

/** Sky, eclipsed moon, stars and misty hills. */
const background = `
  <rect width="1024" height="1024" fill="url(#sky)"/>
  ${stars()}
  <circle cx="640" cy="360" r="330" fill="url(#moonGlow)"/>
  <circle cx="640" cy="360" r="215" fill="url(#moonFace)"/>
  <circle cx="700" cy="300" r="34" fill="#cdb6ec" opacity="0.5"/>
  <circle cx="590" cy="440" r="24" fill="#cdb6ec" opacity="0.45"/>
  <circle cx="530" cy="335" r="205" fill="#1b0f3d" opacity="0.82"/>
  <path d="M0 760 Q180 650 340 720 T700 690 T1024 720 V1024 H0 Z" fill="#2a1749"/>
  <rect y="600" width="1024" height="424" fill="url(#fog)"/>
  <path d="M0 860 Q220 780 460 840 T1024 820 V1024 H0 Z" fill="#140a26"/>`;

/** Shadowman's hooded bust, rim-lit, with the glowing eye and scarf. */
const hero = `
  <g transform="translate(512 610)">
    <path d="M-40 40 C -160 10 -300 40 -420 -30 C -330 70 -230 100 -120 110 C -240 140 -330 210 -380 260 C -250 230 -130 170 -20 120 Z" fill="url(#scarf)"/>
    <g transform="translate(12 -12)" opacity="0.7">
      <path d="M-270 800 L -270 420 C -260 250 -190 160 -100 120 Q 0 95 100 120 C 190 160 260 250 270 420 L 270 800 Z" fill="#9b85ff"/>
      <circle cx="0" cy="-40" r="165" fill="#9b85ff"/>
    </g>
    <path d="M-270 800 L -270 420 C -260 250 -190 160 -100 120 Q 0 95 100 120 C 190 160 260 250 270 420 L 270 800 Z" fill="#000"/>
    <circle cx="0" cy="-40" r="165" fill="#000"/>
    <path d="M-60 90 L 60 90 L 70 140 L -70 140 Z" fill="#000"/>
    <path d="M-140 -120 L -255 -70 L -130 -20 Z" fill="#000"/>
    <ellipse cx="85" cy="-48" rx="105" ry="55" fill="url(#eyeGlow)" opacity="0.8"/>
    <path d="M 10 -66 L 165 -56 L 157 -30 L 16 -38 Z" fill="#c8fff6"/>
  </g>`;

const svg = (body, size = 1024) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024"><defs>${defs}</defs>${body}</svg>`;

// Full icon, and the adaptive layers. Adaptive icons crop to the central
// 72/108 of the canvas, so the foreground hero is scaled into that zone.
const full = svg(`${background}${hero}`);
const square = svg(
  `<clipPath id="rr"><rect width="1024" height="1024" rx="190"/></clipPath><g clip-path="url(#rr)">${background}${hero}</g>`,
);
const round = svg(
  `<clipPath id="cc"><circle cx="512" cy="512" r="512"/></clipPath><g clip-path="url(#cc)">${background}${hero}</g>`,
);
const fgLayer = svg(
  `<g transform="translate(512 512) scale(0.7) translate(-512 -600)">${hero}</g>`,
);
const bgLayer = svg(background);

function render(svgText, size, out) {
  const png = new Resvg(svgText, { fitTo: { mode: 'width', value: size } })
    .render()
    .asPng();
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, png);
}

fs.mkdirSync(path.join(root, 'assets/icon'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets/icon/icon.svg'), full);
fs.writeFileSync(path.join(root, 'assets/icon/foreground.svg'), fgLayer);
fs.writeFileSync(path.join(root, 'assets/icon/background.svg'), bgLayer);
render(full, 512, path.join(root, 'assets/icon/play-store-512.png'));

// ------------------------------------------------------------- Android

const res = path.join(root, 'android/app/src/main/res');
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(densities)) {
  render(
    square,
    Math.round(48 * k),
    path.join(res, `mipmap-${d}/ic_launcher.png`),
  );
  render(
    round,
    Math.round(48 * k),
    path.join(res, `mipmap-${d}/ic_launcher_round.png`),
  );
  render(
    fgLayer,
    Math.round(108 * k),
    path.join(res, `mipmap-${d}/ic_launcher_foreground.png`),
  );
  render(
    bgLayer,
    Math.round(108 * k),
    path.join(res, `mipmap-${d}/ic_launcher_background.png`),
  );
}
const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
fs.mkdirSync(path.join(res, 'mipmap-anydpi-v26'), { recursive: true });
fs.writeFileSync(path.join(res, 'mipmap-anydpi-v26/ic_launcher.xml'), adaptive);
fs.writeFileSync(
  path.join(res, 'mipmap-anydpi-v26/ic_launcher_round.xml'),
  adaptive,
);

// ------------------------------------------------------------- iOS

const iconset = path.join(
  root,
  'ios/ShadowMan/Images.xcassets/AppIcon.appiconset',
);
const iosIcons = [
  ['iphone', '20x20', 2],
  ['iphone', '20x20', 3],
  ['iphone', '29x29', 2],
  ['iphone', '29x29', 3],
  ['iphone', '40x40', 2],
  ['iphone', '40x40', 3],
  ['iphone', '60x60', 2],
  ['iphone', '60x60', 3],
  ['ios-marketing', '1024x1024', 1],
];
const images = iosIcons.map(([idiom, size, scale]) => {
  const px = Number(size.split('x')[0]) * scale;
  const filename = `icon-${px}.png`;
  // iOS applies its own corner mask, so these are full-bleed squares.
  render(full, px, path.join(iconset, filename));
  return { idiom, size, scale: `${scale}x`, filename };
});
fs.writeFileSync(
  path.join(iconset, 'Contents.json'),
  JSON.stringify({ images, info: { author: 'xcode', version: 1 } }, null, 2) +
    '\n',
);
console.log('icons written');
