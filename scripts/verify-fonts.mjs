// Verifies the self-hosted font setup covers the Devanagari the site actually
// renders, rather than assuming a package named "devanagari" does the job.
//
//   node scripts/verify-fonts.mjs
//
// Checks, per font family the site declares:
//   1. every @font-face file referenced by the imported CSS exists on disk;
//   2. every Devanagari codepoint used anywhere in src/data falls inside a
//      declared unicode-range for the family that renders it;
//   3. no CSS references fonts.googleapis.com or fonts.gstatic.com.
//
// Glyph-level cmap coverage was additionally confirmed out-of-band with
// fontTools; this script is the dependency-free regression guard.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const nm = (p) => resolve(root, 'node_modules', p);

/** Which imported CSS renders which family, and where Devanagari is required. */
const FAMILIES = [
  {
    label: 'Rozha One',
    css: '@fontsource/rozha-one/400.css',
    needsDevanagari: true,
    usedFor: 'hero name, loader, footer wordmark, /fast name',
  },
  {
    label: 'Tiro Devanagari Hindi',
    css: '@fontsource/tiro-devanagari-hindi/400.css',
    needsDevanagari: true,
    usedFor: 'section rails, patterns headline',
  },
  {
    label: 'Bricolage Grotesque Variable',
    css: '@fontsource-variable/bricolage-grotesque/opsz.css',
    needsDevanagari: false,
    usedFor: 'display headings',
  },
  {
    label: 'IBM Plex Sans 400',
    css: '@fontsource/ibm-plex-sans/400.css',
    needsDevanagari: false,
    usedFor: 'body copy',
  },
  {
    label: 'IBM Plex Mono 400',
    css: '@fontsource/ibm-plex-mono/400.css',
    needsDevanagari: false,
    usedFor: 'labels, tables, /fast',
  },
];

const DEVANAGARI_BLOCK = [0x0900, 0x097f];

/** Parses `unicode-range` into a list of [start, end] pairs. */
function parseRanges(value) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((token) => {
      const body = token.replace(/^U\+/i, '');
      if (body.includes('-')) {
        const [a, b] = body.split('-');
        return [parseInt(a, 16), parseInt(b, 16)];
      }
      if (body.includes('?')) {
        return [
          parseInt(body.replaceAll('?', '0'), 16),
          parseInt(body.replaceAll('?', 'F'), 16),
        ];
      }
      const cp = parseInt(body, 16);
      return [cp, cp];
    });
}

/** Extracts @font-face blocks: their src file and unicode-range. */
function faces(cssPath) {
  const css = readFileSync(cssPath, 'utf8');
  const dir = dirname(cssPath);
  const out = [];
  for (const block of css.split('@font-face').slice(1)) {
    const src = [...block.matchAll(/url\(([^)]+)\)/g)].map((m) =>
      m[1].replace(/['"]/g, '').trim()
    );
    const ur = block.match(/unicode-range:\s*([^;}]+)/i);
    out.push({
      files: src.map((s) => resolve(dir, s)),
      ranges: ur ? parseRanges(ur[1]) : null, // null = unrestricted
      raw: ur ? ur[1].trim() : null,
    });
  }
  return out;
}

/** Every Devanagari codepoint the site actually renders. */
function devanagariInUse() {
  const found = new Map();
  for (const file of ['copy.ts', 'facts.ts', 'projects.ts', 'search.ts']) {
    const text = readFileSync(resolve(root, 'src/data', file), 'utf8');
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp >= DEVANAGARI_BLOCK[0] && cp <= DEVANAGARI_BLOCK[1]) {
        if (!found.has(cp)) found.set(cp, file);
      }
    }
  }
  return [...found.keys()].sort((a, b) => a - b);
}

const inUse = devanagariInUse();
const failures = [];
let filesChecked = 0;

console.log(`Devanagari codepoints rendered by the site: ${inUse.length}`);
console.log('');

for (const family of FAMILIES) {
  const cssPath = nm(family.css);
  if (!existsSync(cssPath)) {
    failures.push(`${family.label}: CSS not found at ${family.css}`);
    continue;
  }
  const css = readFileSync(cssPath, 'utf8');
  if (/fonts\.(googleapis|gstatic)\.com/.test(css)) {
    failures.push(`${family.label}: CSS references Google Fonts`);
  }

  const list = faces(cssPath);
  let missing = 0;
  for (const face of list) {
    for (const f of face.files) {
      filesChecked++;
      if (!existsSync(f)) {
        missing++;
        failures.push(`${family.label}: missing file ${f.replace(root, '.')}`);
      }
    }
  }

  let devNote = 'n/a';
  if (family.needsDevanagari) {
    const covered = new Set();
    for (const face of list) {
      if (!face.ranges) {
        inUse.forEach((cp) => covered.add(cp));
        continue;
      }
      for (const [lo, hi] of face.ranges) {
        for (const cp of inUse) if (cp >= lo && cp <= hi) covered.add(cp);
      }
    }
    const uncovered = inUse.filter((cp) => !covered.has(cp));
    if (uncovered.length) {
      failures.push(
        `${family.label}: ${uncovered.length} Devanagari codepoints outside every declared unicode-range: ` +
          uncovered.map((c) => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')).join(' ')
      );
      devNote = `${covered.size}/${inUse.length} FAIL`;
    } else {
      devNote = `${covered.size}/${inUse.length} covered`;
    }
  }

  console.log(
    `${family.label.padEnd(30)} faces=${String(list.length).padStart(2)}  ` +
      `files ok=${missing === 0 ? 'yes' : 'NO'}  devanagari=${devNote}`
  );
  console.log(`${''.padEnd(30)} ${family.usedFor}`);
}

console.log('');
console.log(`font files checked: ${filesChecked}`);

if (failures.length) {
  console.log('');
  console.log('FAILURES:');
  failures.forEach((f) => console.log('  ' + f));
  console.log('');
  console.log('RESULT: FAIL');
  process.exit(1);
}

console.log('RESULT: PASS — Devanagari covered, all font files present, no Google Fonts.');
