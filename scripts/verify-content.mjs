// Checks the STRUCTURE of the site's content, not its wording.
//
//   node --experimental-strip-types scripts/verify-content.mjs
//
// The files under src/data are the source of truth for every word on the site
// and are edited directly. This script guards the shape those edits must keep,
// so a typo in a data file fails here instead of quietly breaking the page:
//
//   - no empty strings, and none with stray leading/trailing whitespace;
//   - no placeholder text (TODO, TBD, FIXME, lorem ipsum);
//   - every fact belongs to a known section, every section has at least one
//     fact, fact titles are unique, and FACT_COUNT equals the index length;
//   - curated project names and repo names are unique; public entries name a
//     plausible repo, private entries (no repo) point at a real section;
//   - every in-page link (#...) points at a section id that exists;
//   - each stat's displayed value equals its count-up target plus suffix;
//   - the Now log has 1 to 6 entries, months as YYYY-MM, newest first and
//     none in the future;
//   - every skill key used by a project card or a chip exists in the Stack
//     section — otherwise StackFilter could never select it.
//
// Exits non-zero on any failure. Needs no network and no reference folder, so
// it runs the same on any machine.

import { FACTS, FACT_COUNT } from '../src/data/facts.ts';
import { CURATED } from '../src/data/projects.ts';
import { STOP, STOP_WORDS, SUGGESTIONS } from '../src/data/search.ts';
import { COPY } from '../src/data/copy.ts';
import { SITE } from '../src/data/site.ts';
import { NOW_LOG } from '../src/data/now.ts';

const SECTIONS = ['about', 'now', 'work', 'patent', 'projects', 'stack', 'recognition', 'contact'];
const ANCHORS = new Set([...SECTIONS, 'top']);
const PLACEHOLDER = /\b(TODO|TBD|FIXME|lorem ipsum)\b/i;
/** Fields where an empty string is meaningful: no badge, no stat suffix. */
const MAY_BE_EMPTY = new Set(['badge', 'suffix']);

const failures = [];
const fail = (msg) => failures.push(msg);
let stringsChecked = 0;
let assertions = 0;
let assertionFailures = 0;
const check = (ok, msg) => {
  assertions++;
  if (!ok) {
    assertionFailures++;
    fail(msg);
  }
};

// ---- every string: non-empty, trimmed, no placeholders ---------------------
function walk(node, path, key = '') {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') {
    stringsChecked++;
    if (!node.trim()) {
      if (!(node === '' && MAY_BE_EMPTY.has(key))) fail(`${path}: empty string`);
    }
    else if (node !== node.trim()) fail(`${path}: leading/trailing whitespace ${JSON.stringify(node.slice(0, 40))}`);
    if (PLACEHOLDER.test(node)) fail(`${path}: placeholder text ${JSON.stringify(node.slice(0, 60))}`);
    return;
  }
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`));
  if (node instanceof Set) return;
  if (typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, k);
}
walk(FACTS, 'FACTS');
walk(CURATED, 'CURATED');
walk(SUGGESTIONS, 'SUGGESTIONS');
walk(COPY, 'COPY');
walk(SITE, 'SITE');
walk(NOW_LOG, 'NOW_LOG');

// ---- link helpers -----------------------------------------------------------
const isUrl = (u) => /^https:\/\/[^\s]+$/.test(u) || /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u) || /^tel:\+?\d+$/.test(u);
function checkHref(href, path) {
  if (href.startsWith('#')) check(ANCHORS.has(href.slice(1)), `${path}: anchor ${href} matches no section id`);
  else if (href.startsWith('/')) check(['/', '/fast'].includes(href), `${path}: unknown route ${href}`);
  else check(isUrl(href), `${path}: not a valid https/mailto/tel link: ${href}`);
}
function walkLinks(node, path) {
  if (Array.isArray(node)) return node.forEach((v, i) => walkLinks(v, `${path}[${i}]`));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'href' && typeof v === 'string') checkHref(v, `${path}.href`);
      else walkLinks(v, `${path}.${k}`);
    }
  }
}
walkLinks(COPY, 'COPY');

// ---- facts ------------------------------------------------------------------
check(FACTS.length > 0, 'FACTS is empty');
check(FACT_COUNT === FACTS.length, `FACT_COUNT ${FACT_COUNT} != FACTS.length ${FACTS.length}`);
const bySection = Object.fromEntries(SECTIONS.map((s) => [s, 0]));
const titles = new Set();
FACTS.forEach((f, i) => {
  check(SECTIONS.includes(f.section), `FACTS[${i}]: unknown section "${f.section}"`);
  if (SECTIONS.includes(f.section)) bySection[f.section]++;
  const t = f.title.toLowerCase();
  check(!titles.has(t), `FACTS[${i}]: duplicate title "${f.title}"`);
  titles.add(t);
});
for (const s of SECTIONS) check(bySection[s] > 0, `no fact in section "${s}"`);

// ---- projects ---------------------------------------------------------------
const names = new Set();
const repos = new Set();
CURATED.forEach((p, i) => {
  const at = `CURATED[${i}] "${p.name}"`;
  const n = p.name.toLowerCase();
  check(!names.has(n), `${at}: duplicate project name`);
  names.add(n);
  if (p.repo) {
    check(/^[A-Za-z0-9._-]+$/.test(p.repo), `${at}: "${p.repo}" is not a valid repo name`);
    check(!repos.has(p.repo.toLowerCase()), `${at}: repo "${p.repo}" listed twice`);
    repos.add(p.repo.toLowerCase());
    check(p.anchor === undefined, `${at}: a public repo entry must not set an anchor`);
  } else {
    check(typeof p.anchor === 'string', `${at}: private entry (no repo) needs an anchor`);
    if (typeof p.anchor === 'string') checkHref(p.anchor, `${at}.anchor`);
  }
});

// ---- stats ------------------------------------------------------------------
COPY.now.stats.forEach((s, i) => {
  check(s.value === String(s.count) + s.suffix, `COPY.now.stats[${i}]: value "${s.value}" != count ${s.count} + suffix "${s.suffix}"`);
});

// ---- skill keys -------------------------------------------------------------
const { languages, agentic, dataVision, platform } = COPY.stack.groups;
const stackKeys = [...languages.bars, ...agentic.chips, ...dataVision.chips, ...platform.chips].map((c) => c.key);
const stackSet = new Set(stackKeys);
check(stackSet.size === stackKeys.length, `Stack has duplicate skill keys: ${stackKeys.filter((k, i) => stackKeys.indexOf(k) !== i).join(', ')}`);
CURATED.forEach((p, i) => {
  for (const k of p.skills.split(' ')) check(stackSet.has(k), `CURATED[${i}] "${p.name}": skill "${k}" is not in the Stack section`);
});
COPY.now.chips.forEach((c, i) => check(stackSet.has(c.key), `COPY.now.chips[${i}]: key "${c.key}" is not in the Stack section`));
COPY.patent.chips.forEach((c, i) => {
  if (c.key) check(stackSet.has(c.key), `COPY.patent.chips[${i}]: key "${c.key}" is not in the Stack section`);
});

// ---- now log ----------------------------------------------------------------
const thisMonth = new Date().toISOString().slice(0, 7);
check(NOW_LOG.length >= 1 && NOW_LOG.length <= 6, `NOW_LOG has ${NOW_LOG.length} entries; keep 1 to 6`);
NOW_LOG.forEach((e, i) => {
  const ok = /^\d{4}-(0[1-9]|1[0-2])$/.test(e.month);
  check(ok, `NOW_LOG[${i}]: month "${e.month}" is not YYYY-MM`);
  if (ok) check(e.month <= thisMonth, `NOW_LOG[${i}]: month ${e.month} is in the future`);
  if (i > 0) check(NOW_LOG[i - 1].month >= e.month, `NOW_LOG[${i}]: entries must be newest first`);
});

// ---- search config ----------------------------------------------------------
check(SUGGESTIONS.length > 0, 'SUGGESTIONS is empty');
check(new Set(SUGGESTIONS).size === SUGGESTIONS.length, 'SUGGESTIONS has duplicates');
check(STOP.size === STOP_WORDS.split(' ').length, 'STOP_WORDS has duplicate words');

// ---- report -----------------------------------------------------------------
console.log(`facts                : ${FACTS.length}  (${SECTIONS.map((s) => `${s} ${bySection[s]}`).join(', ')})`);
console.log(`projects (curated)   : ${CURATED.length}  (${repos.size} public repos, ${CURATED.length - repos.size} private)`);
console.log(`strings checked      : ${stringsChecked}`);
console.log(`structural assertions: ${assertions - assertionFailures}/${assertions} passed`);
console.log('');

if (failures.length) {
  console.log('FAILURES:');
  failures.forEach((f) => console.log('  ' + f));
  console.log('');
  console.log('RESULT: FAIL');
  process.exit(1);
}
console.log('RESULT: PASS — content structure is sound.');
