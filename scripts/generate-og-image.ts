import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "fs";
import { join } from "path";

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#888;stop-opacity:0.3" />
      <stop offset="50%" style="stop-color:#aaa;stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#888;stop-opacity:0.3" />
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />

  <!-- Subtle border -->
  <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}" rx="8" ry="8"
        fill="none" stroke="#333" stroke-width="1" />

  <!-- Decorative cross / tombstone motif -->
  <rect x="568" y="140" width="64" height="8" rx="4" fill="#444" />
  <rect x="596" y="120" width="8" height="48" rx="4" fill="#444" />

  <!-- Title -->
  <text x="${WIDTH / 2}" y="240" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="bold"
        fill="#e0e0e0" letter-spacing="4">
    Bitrot
  </text>

  <!-- Divider line -->
  <line x1="460" y1="275" x2="740" y2="275" stroke="url(#accent)" stroke-width="2" />

  <!-- Tagline -->
  <text x="${WIDTH / 2}" y="330" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="28" font-style="italic"
        fill="#999">
    An interactive memorial for dead technology
  </text>

  <!-- Tombstone icons row -->
  <g fill="#555" opacity="0.5">
    <!-- Tombstone shapes -->
    <rect x="200" y="420" width="50" height="70" rx="25" ry="15" />
    <rect x="320" y="430" width="40" height="60" rx="20" ry="12" />
    <rect x="440" y="415" width="55" height="75" rx="27" ry="15" />
    <rect x="570" y="425" width="45" height="65" rx="22" ry="13" />
    <rect x="700" y="420" width="50" height="70" rx="25" ry="15" />
    <rect x="830" y="435" width="38" height="55" rx="19" ry="12" />
    <rect x="940" y="418" width="48" height="72" rx="24" ry="14" />
  </g>

  <!-- Ground line -->
  <line x1="160" y1="490" x2="1040" y2="490" stroke="#444" stroke-width="1" />

  <!-- URL -->
  <text x="${WIDTH / 2}" y="560" text-anchor="middle"
        font-family="monospace" font-size="18"
        fill="#666">
    bitrot.timothybrits.co.za
  </text>
</svg>
`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: WIDTH },
});

const pngData = resvg.render();
const pngBuffer = pngData.asPng();

const outPath = join(import.meta.dir, "..", "public", "og-image.png");
writeFileSync(outPath, pngBuffer);
console.log(`OG image generated: ${outPath} (${pngBuffer.byteLength} bytes)`);
