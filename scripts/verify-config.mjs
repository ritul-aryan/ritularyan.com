// Validates config files that a PLATFORM parses, not just files that a local
// build happens to tolerate.
//
//   node scripts/verify-config.mjs
//
// Why this exists: vercel.json once carried "//" keys used as pseudo-comments.
// JSON has no comment syntax, and Vercel validates vercel.json against a schema
// with additionalProperties:false, so every deployment failed schema validation
// while `astro build` stayed green. A passing local build says nothing about
// whether the platform will accept the config.
//
// Two layers, because the strict one needs network:
//
//   1. OFFLINE, always runs, hard failure — no comment-shaped keys anywhere in a
//      schema-validated file. This is the check that would have caught it.
//   2. ONLINE, best effort — fetch the real schema and report unknown top-level
//      properties. Skipped with a notice when the schema host is unreachable, so
//      this never fails a build for being offline.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Files a platform validates against a schema. These get the hard checks.
 *
 * package.json is deliberately NOT here: npm explicitly documents "//" as a
 * comment key, so the same pattern is legitimate there.
 */
const VALIDATED = [
  { file: 'vercel.json', schema: 'https://openapi.vercel.sh/vercel.json', platform: 'Vercel' },
];

/**
 * Vercel's documented top-level properties, vendored so the check still says
 * something useful offline. Unknown keys are a WARNING, not a failure — this
 * list can go stale as Vercel adds properties, and a stale list must never block
 * a deploy. The comment-key check above is the hard one.
 */
const VERCEL_TOP_LEVEL = new Set([
  '$schema', 'buildCommand', 'cleanUrls', 'crons', 'devCommand', 'framework',
  'functions', 'git', 'headers', 'ignoreCommand', 'images', 'installCommand',
  'outputDirectory', 'public', 'redirects', 'regions', 'rewrites', 'routes',
  'trailingSlash', 'version',
]);

const COMMENT_KEY = /^\s*(\/\/|#|\/\*)/;

const failures = [];
const warnings = [];
let filesChecked = 0;
let keysWalked = 0;

/** Walks every object key in the parsed JSON, reporting comment-shaped ones. */
function findCommentKeys(node, path, out) {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => findCommentKeys(v, `${path}[${i}]`, out));
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    keysWalked++;
    if (COMMENT_KEY.test(k)) out.push(`${path}.${JSON.stringify(k)}`);
    findCommentKeys(v, `${path}.${k}`, out);
  }
}

async function fetchSchema(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { ok: false, why: `HTTP ${res.status}` };
    return { ok: true, schema: await res.json() };
  } catch (err) {
    return { ok: false, why: err instanceof Error ? err.message : String(err) };
  }
}

for (const entry of VALIDATED) {
  const path = resolve(root, entry.file);
  if (!existsSync(path)) {
    failures.push(`${entry.file}: not found`);
    continue;
  }
  filesChecked++;
  const raw = readFileSync(path, 'utf8');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    failures.push(`${entry.file}: not valid JSON — ${err instanceof Error ? err.message : err}`);
    continue;
  }

  // --- layer 1: comment-shaped keys, offline, hard failure -----------------
  const comments = [];
  findCommentKeys(parsed, entry.file.replace(/\.json$/, ''), comments);
  if (comments.length) {
    failures.push(
      `${entry.file}: ${comments.length} comment-shaped key(s) — JSON has no comments and ` +
        `${entry.platform} rejects unknown properties:\n      ` +
        comments.join('\n      ') +
        `\n      Explain config in CLAUDE.md instead.`
    );
  }

  // --- layer 2: schema, online, best effort --------------------------------
  const got = await fetchSchema(entry.schema);
  if (!got.ok) {
    warnings.push(
      `${entry.file}: could not fetch ${entry.schema} (${got.why}) — ` +
        `fell back to the vendored top-level property list`
    );
    const unknown = Object.keys(parsed).filter((k) => !VERCEL_TOP_LEVEL.has(k));
    if (unknown.length) {
      warnings.push(`${entry.file}: unrecognised top-level key(s): ${unknown.join(', ')}`);
    }
  } else {
    const allowed = new Set(Object.keys(got.schema.properties ?? {}));
    const unknown = Object.keys(parsed).filter((k) => k !== '$schema' && !allowed.has(k));
    if (unknown.length) {
      failures.push(
        `${entry.file}: key(s) not in ${entry.platform}'s schema: ${unknown.join(', ')}`
      );
    }
    console.log(`${entry.file}: validated against the live schema (${allowed.size} properties)`);
  }
}

console.log('');
console.log(`config files checked : ${filesChecked}`);
console.log(`object keys walked   : ${keysWalked}`);
console.log(`comment-key failures : ${failures.length}`);

if (warnings.length) {
  console.log('');
  console.log('NOTICES:');
  warnings.forEach((w) => console.log('  ' + w));
}

if (failures.length) {
  console.log('');
  console.log('FAILURES:');
  failures.forEach((f) => console.log('  ' + f));
  console.log('');
  console.log('RESULT: FAIL');
  process.exit(1);
}

console.log('');
console.log('RESULT: PASS — no comment keys, no unrecognised properties.');
