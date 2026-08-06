// Renders public/og.png (1200x630) and public/apple-touch-icon.png (180x180).
//
// The card is rendered in a real browser using the SAME self-hosted font files
// the site ships, so the wordmark and the Devanagari are the actual typefaces
// rather than a system approximation. Colours come from tokens.css.
//
//   node scripts/gen-og.mjs
//
// Playwright is a verification-only tool and is deliberately NOT a project
// dependency; this script is run by hand when the card needs regenerating, and
// the committed PNGs are what deploys.

import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const nm = (p) => resolve(root, 'node_modules', p);

const EXEC = process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const b64 = (p) => readFileSync(p).toString('base64');
const font = (p) => `url(data:font/woff2;base64,${b64(nm(p))}) format('woff2')`;

const BRICOLAGE = font(
  '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2'
);
const ROZHA_DEV = font('@fontsource/rozha-one/files/rozha-one-devanagari-400-normal.woff2');
const MONO = font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2');

const favicon = readFileSync(resolve(root, 'public/favicon.svg'), 'utf8');

// Every string on the card is extracted copy, never invented. The eyebrow and
// wordmark come from COPY.hero; the second line is the prototype's own
// twitter:description.
const { COPY } = await import('../src/data/copy.ts');
const { SITE } = await import('../src/data/site.ts');
const EYEBROW_ROLE = COPY.hero.role;
const EYEBROW_LOC = COPY.hero.location;
const NAME = COPY.hero.nameLines;
const DEV = COPY.hero.devanagari;
const LEDE = SITE.twitterDescription;

const card = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family:'BG'; src:${BRICOLAGE}; font-weight:200 800; }
  @font-face { font-family:'RZ'; src:${ROZHA_DEV}; }
  @font-face { font-family:'PM'; src:${MONO}; }
  * { box-sizing:border-box; margin:0; }
  html,body { width:1200px; height:630px; }
  body {
    background:#08080B; color:#F3F1EB; position:relative; overflow:hidden;
    display:flex; flex-direction:column; justify-content:center;
    padding:0 78px; font-family:'PM',monospace;
  }
  /* the hero's nebula, flattened to static gradients */
  .neb { position:absolute; border-radius:50%; filter:blur(90px); }
  .n1 { width:760px; height:760px; left:-120px; top:-260px; background:rgba(255,74,28,.14); }
  .n2 { width:700px; height:700px; right:-150px; bottom:-300px; background:rgba(124,231,255,.12); }
  .n3 { width:520px; height:520px; left:520px; bottom:-320px; background:rgba(160,120,255,.10); }
  .inner { position:relative; z-index:2; }
  .eyebrow { display:flex; align-items:center; gap:14px; font-size:19px;
    letter-spacing:.24em; text-transform:uppercase; color:#8B8892; }
  .dot { width:11px; height:11px; border-radius:50%; background:#FF4A1C; }
  h1 { font-family:'BG',sans-serif; font-weight:800; font-size:158px; line-height:.82;
    letter-spacing:-.05em; text-transform:uppercase; margin:30px 0 0; }
  .row { display:flex; align-items:baseline; gap:28px; margin-top:26px; }
  .dev { font-family:'RZ',serif; font-size:66px; line-height:1; color:#7CE7FF; }
  .lede { font-family:'PM',monospace; font-size:21px; line-height:1.5; color:#8B8892; max-width:520px; }
  .rule { position:absolute; left:0; right:0; bottom:0; height:5px; background:#FF4A1C; }
  .mark { position:absolute; right:70px; top:62px; width:74px; height:74px; z-index:3; }
  .mark svg { width:100%; height:100%; }
</style></head><body>
  <div class="neb n1"></div><div class="neb n2"></div><div class="neb n3"></div>
  <div class="mark">${favicon}</div>
  <div class="inner">
    <div class="eyebrow"><span class="dot"></span><span>${EYEBROW_ROLE}</span>
      <span style="opacity:.4">${COPY.hero.separator}</span><span>${EYEBROW_LOC}</span></div>
    <h1>${NAME[0]}<br/>${NAME[1]}</h1>
    <div class="row">
      <div class="dev">${DEV}</div>
      <div class="lede">${LEDE}</div>
    </div>
  </div>
  <div class="rule"></div>
</body></html>`;

const iconHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0} html,body{width:180px;height:180px}
  body{background:#08080B} svg{width:180px;height:180px;display:block}
</style></head><body>${favicon}</body></html>`;

if (!existsSync(EXEC)) {
  console.error(`Chromium not found at ${EXEC}. Set CHROME_PATH.`);
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: EXEC });

const shoot = async (html, width, height, out) => {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(root, out) });
  await ctx.close();
  console.log(`wrote ${out} (${width}x${height})`);
};

await shoot(card, 1200, 630, 'public/og.png');
await shoot(iconHtml, 180, 180, 'public/apple-touch-icon.png');

await browser.close();
