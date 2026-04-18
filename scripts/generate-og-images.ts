import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { entries } from "../src/data/entries.ts";
import type { DeadTech } from "../src/data/types.ts";
import { buildEntryOgTemplate, OG_HEIGHT, OG_WIDTH } from "./og-template.ts";

const require = createRequire(import.meta.url);
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const OUT_DIR = resolve(REPO_ROOT, "public", "og");
const MANIFEST_PATH = resolve(OUT_DIR, ".manifest.json");

function entryHash(entry: DeadTech): string {
  const payload = JSON.stringify({
    id: entry.id,
    name: entry.name,
    tagline: entry.tagline,
    born: entry.born,
    died: entry.died,
    brandColor: entry.brandColor ?? null,
    v: 1,
  });
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

function loadFontBuffer(pkgPath: string): Uint8Array {
  const resolved = require.resolve(pkgPath);
  const buf = readFileSync(resolved);
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

async function generateAll(): Promise<void> {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  const manifest: Record<string, string> = existsSync(MANIFEST_PATH)
    ? JSON.parse(readFileSync(MANIFEST_PATH, "utf8"))
    : {};

  const fraunces = loadFontBuffer("@fontsource/fraunces/files/fraunces-latin-600-normal.woff");
  const instrumentSans = loadFontBuffer(
    "@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff"
  );

  const fonts = [
    { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
    {
      name: "Instrument Sans",
      data: instrumentSans,
      weight: 400 as const,
      style: "normal" as const,
    },
  ];

  let generated = 0;
  let skipped = 0;

  for (const entry of entries) {
    const hash = entryHash(entry);
    const outPath = resolve(OUT_DIR, `${entry.id}.png`);
    if (manifest[entry.id] === hash && existsSync(outPath)) {
      skipped += 1;
      continue;
    }

    const svg = await satori(buildEntryOgTemplate(entry) as Parameters<typeof satori>[0], {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
    });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
    writeFileSync(outPath, png);
    manifest[entry.id] = hash;
    generated += 1;
  }

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`OG images: ${generated} generated, ${skipped} cached (${entries.length} total)`);
}

const isMain =
  import.meta.url.startsWith("file:") && process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  generateAll().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
