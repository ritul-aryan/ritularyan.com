// Verifies every extracted string appears verbatim in the source prototype.
//
// The data files under src/data are generated from deploy/index.html. This
// script is the guard: it walks every string in every data file and asserts it
// is a verbatim substring of the source, with HTML entities decoded. A single
// wrong apostrophe, en dash or curly quote fails the run.
//
//   node scripts/verify-content.mjs [path/to/deploy/index.html]
//
// Exits non-zero on any mismatch.

import { readFileSync } from 'node:fs';
import { FACTS, FACT_COUNT } from '../src/data/facts.ts';
import { SEED, GH, repo } from '../src/data/projects.ts';
import { STOP, STOP_WORDS, SUGGESTIONS } from '../src/data/search.ts';
import { COPY } from '../src/data/copy.ts';

const SRC =
  process.argv[2] ?? '/mnt/user-data/uploads/portfolio/deploy/index.html';

const raw = readFileSync(SRC, 'utf8');

// Decode the entities the prototype actually uses, then normalise the <br> and
// tag boundaries that split a logical string across nodes.
const decoded = raw
  .replaceAll('&amp;', '&')
  .replaceAll('&nbsp;', ' ')
  .replaceAll('&quot;', '"')
  .replaceAll('&#2315;', 'ऋ')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');

// A second haystack with tags stripped, so strings the prototype splits across
// <br> or <span> boundaries still match as continuous text.
const stripped = decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// A third haystack with JS string escapes undone. Facts live inside JS literals
// in the script block, so an embedded quote is stored as \" — the extracted
// value holds a real quote and would otherwise look like a mismatch.
const unescaped = decoded.replaceAll('\\"', '"').replaceAll("\\'", "'");

const failures = [];
const checked = { strings: 0, skipped: 0 };

// Structural values that are ours, not the prototype's copy: URLs assembled by
// repo(), hrefs, and numeric/boolean fields.
const STRUCTURAL = /^(https?:|mailto:|tel:|#|\/)/;

function check(path, value) {
  if (typeof value === 'number' || typeof value === 'boolean') return;
  if (typeof value !== 'string') return;
  if (!value.trim()) return;
  if (STRUCTURAL.test(value)) {
    checked.skipped++;
    return;
  }
  checked.strings++;
  const needle = value.replace(/\s+/g, ' ').trim();
  if (
    decoded.includes(value) ||
    stripped.includes(needle) ||
    unescaped.includes(value)
  )
    return;
  failures.push({ path, value });
}

function walk(node, path) {
  if (node === null || node === undefined) return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`));
    return;
  }
  if (node instanceof Set) {
    // Stop words are single tokens from one source literal, checked via STOP_WORDS.
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
    return;
  }
  check(path, node);
}

walk(FACTS, 'FACTS');
walk(SEED, 'SEED');
walk(SUGGESTIONS, 'SUGGESTIONS');
walk(COPY, 'COPY');
check('STOP_WORDS', STOP_WORDS);

// ---- structural assertions -------------------------------------------------
const asserts = [];
const eq = (label, actual, expected) => {
  asserts.push({ label, actual, expected, ok: actual === expected });
};

eq('FACTS length', FACTS.length, 44);
eq('FACT_COUNT', FACT_COUNT, 44);
eq('SEED length', SEED.length, 9);
eq('SUGGESTIONS length', SUGGESTIONS.length, 6);
eq('STOP size', STOP.size, 62);
eq('GH', GH, 'https://github.com/ritul-aryan');
eq('typewriter lines', COPY.hero.typewriterLines.length, 6);
eq('nav links', COPY.header.nav.length, 5);
eq('about paragraphs', COPY.about.paragraphs.length, 3);
eq('now stats', COPY.now.stats.length, 4);
eq('now chips', COPY.now.chips.length, 6);
eq('work roles', COPY.work.roles.length, 2);
eq('patent record rows', COPY.patent.record.length, 5);
eq('patent chips', COPY.patent.chips.length, 4);
eq('skill bars', COPY.stack.groups.languages.bars.length, 4);
eq('agentic chips', COPY.stack.groups.agentic.chips.length, 7);
eq('dataVision chips', COPY.stack.groups.dataVision.chips.length, 6);
eq('platform chips', COPY.stack.groups.platform.chips.length, 12);
eq('certifications', COPY.recognition.certifications.items.length, 4);
eq('footer index links', COPY.footer.indexLinks.length, 6);
eq('fast experience jobs', COPY.fast.experience.jobs.length, 2);
eq('fast skills lines', COPY.fast.skills.lines.length, 7);

// Section coverage of the fact index.
const bySection = {};
for (const f of FACTS) bySection[f.section] = (bySection[f.section] ?? 0) + 1;
const EXPECTED_SECTIONS = {
  now: 6,
  work: 5,
  patent: 3,
  projects: 7,
  stack: 8,
  about: 10,
  recognition: 3,
  contact: 2,
};
for (const [k, v] of Object.entries(EXPECTED_SECTIONS)) {
  eq(`facts in "${k}"`, bySection[k] ?? 0, v);
}

// The SEED url built by repo() must round-trip.
eq('repo() shape', repo('smart mouse'), GH + '?tab=repositories&q=smart%20mouse');

// ---- report ----------------------------------------------------------------
const badAsserts = asserts.filter((a) => !a.ok);

console.log('source:', SRC);
console.log('');
console.log(
  `strings verified verbatim : ${checked.strings}  (${checked.skipped} structural URLs/hrefs skipped)`
);
console.log(`mismatched strings        : ${failures.length}`);
console.log(`structural assertions     : ${asserts.length - badAsserts.length}/${asserts.length} passed`);
console.log('');

if (failures.length) {
  console.log('MISMATCHED STRINGS — not found verbatim in source:');
  for (const f of failures) {
    console.log(`  ${f.path}`);
    console.log(`    ${JSON.stringify(f.value.slice(0, 160))}`);
  }
  console.log('');
}

if (badAsserts.length) {
  console.log('FAILED ASSERTIONS:');
  for (const a of badAsserts) {
    console.log(`  ${a.label}: got ${a.actual}, expected ${a.expected}`);
  }
  console.log('');
}

if (failures.length || badAsserts.length) {
  console.log('RESULT: FAIL');
  process.exit(1);
}
console.log('RESULT: PASS — every extracted string is verbatim from the prototype.');
