# ritularyan.com — build rules

Personal portfolio for Ritul Aryan, AI Software Engineer. Production rebuild of a
design prototype. Deploys to Vercel as static output.

## Target stack — decided, do not substitute

- Astro (static output) + React islands + TypeScript (strict).
- Plain CSS with custom properties for tokens.
- No Next.js. No Tailwind without asking first. No CSS-in-JS. No state library.
- Self-hosted fonts via `@fontsource`. No requests to `fonts.googleapis.com`.
- No new dependencies without asking.

## Reference folders — READ-ONLY, never modify

| Path | Role |
| --- | --- |
| `portfolio-design-brief-ritul-aryan/project/Ritul Aryan - Portfolio.dc.html` | design prototype — the VISUAL SPEC |
| `deploy/` | original verified render — reference for layout and behaviour only, no longer a content source (see Content) |

### Line-number offset between the two files

The two HTML files are byte-identical **except** for 14 lines of head metadata
(`<title>`, meta description, canonical, OG + Twitter, theme-color, inline SVG
favicon) which exist only in `deploy/index.html`.

**`deploy/index.html` line N === `.dc.html` line N − 14** (for N > 19).

Example: the FULL/FAST buttons are `.dc.html:132` and `deploy/index.html:146`.
Always state which file a line number refers to.

## Content — `src/data/` is the source of truth

Since 2026-10-19 (Ritul's decision) the site's wording no longer has to match
the prototype. Every word lives in `src/data/*.ts` and is edited there directly.
The prototype remains the visual and behavioural spec: the approved-deviations
register below governs layout and behaviour, not wording.

`npm run verify:content` checks structure, not wording: no empty or padded
strings, no placeholder text, every fact in a known section and every section
covered, unique fact titles and project names, `FACT_COUNT` equal to the index
length, stat values consistent with their count-up targets, in-page links
pointing at real section ids, and every skill key used by a project or chip
present in the Stack section (otherwise StackFilter could never select it).

Fixed regardless of content:

- Colour tokens: `--rk-acc` `#FF4A1C`, `--rk-acc2` `#7CE7FF`, bg `#08080B`.
- Devanagari `ऋतुल आर्यन` must render correctly — `verify:fonts` checks that the
  font subsets cover every Devanagari codepoint used in `src/data`.

## Islands — all 15 prototype behaviours must survive with identical timing, easing and feel

`CanvasField`, `AskIndex`, `ThemeToggle`, `IntroLoader`, `CustomCursor`,
`LiveClock`, `HeroTypewriter`, `ScrollProgress`, `H1Parallax`, `RevealOnScroll`,
`CountUpStats`, `SkillBars`, `TimelineSpine`, `CardTilt3D`, `StackFilter`.

Grouping and componentisation are implementation choices. Dropping a behaviour,
or reducing one to CSS, is not. `CustomCursor` stays scoped to
`@media (hover:hover) and (pointer:fine)` exactly as the prototype scopes it —
do not widen that.

Extra JS on `/` is acceptable. `/fast` is the light path and that is the whole
reason it exists.

### IntroLoader — why it exists

**The loader is functional, not decorative. It is the FULL vs FAST decision
point.** It is modelled on Gmail's "load basic HTML" link: on weak hardware or a
poor connection the visitor gets a visible chance to bail out to the fast page
rather than watch a heavy page stutter in.

**Never remove or shorten it as an optimisation.** Deleting it to improve a
Lighthouse score removes the only moment a struggling visitor is offered the
light path.

Spec — match the prototype's timing and easing exactly:

- Warp-streak canvas, glyph-by-glyph `ऋतुल आर्यन`, progress bar to 100%,
  `SKIP → PLAIN TEXT VERSION`, ~1.7s.
- `SKIP` must be **visible and clickable from the first frame**,
  keyboard-focusable, and reachable by <kbd>Tab</kbd>.
- The loader is a **visual overlay only** — all page content stays in the DOM
  beneath it. It must never gate rendering, block crawlers, or defer content.
- Under `prefers-reduced-motion`, keep the prototype's behaviour:
  `const dur = this.reduce ? 350 : 1700;` (`deploy/index.html:1276`). The loader
  still runs, at the shortened duration. **Do not skip it.** Skipping would
  remove the `SKIP → PLAIN TEXT` choice from exactly the users most likely to
  want the fast path. Considered and rejected, 2026-08-04.

**ASK before changing any of:**

- the fixed ~1.7s timer (it is a fixed duration, *not* real load progress);
- the fact that it runs on every visit;
- substituting anything, if any part proves impossible in Astro.

## `/fast` route

No framework and no hydration. "Zero client JS" means no framework and no
hydration, **not** literally zero bytes: a small synchronous inline `<head>`
script for theme (and one for the clock and the phone menu, deviation 9) is
sanctioned. Inline only — no
external file, no extra request. Theme reads the same `rk-theme` localStorage
key, runs before first paint so there is no wrong-theme flash, and is wrapped in
`try`/`catch` falling back to the design default if localStorage is blocked.

`/fast` renders the complete header, matching the prototype: `RITUL ARYAN`,
`NOW / PATENT / WORK / STACK / CONTACT`, the clock, and `LIGHT` / `FULL` / `FAST`.

Verify "no script loads" against `astro preview` (production), never `astro dev`
— the dev server injects `/@vite/client`, the dev-toolbar entrypoint and an
inline `window.__astro_dev_toolbar__` blob that are absent from the build.

## Approved deviations from the prototype

There are exactly **nine**, all **explicitly approved by Ritul**. Do **not**
revert them as "fidelity violations". This register is exhaustive — any departure
from the prototype's layout or behaviour not listed here is a bug. Everything
else stays exact. Wording is not covered here — see Content above.

Deviations 1-4, 6 and 8 are **bug fixes**: the prototype's behaviour has no
coherent intentional reading. Deviations 5, 7 and 9 are **new design
additions**, requested deliberately, and are not fidelity matters at all.

### 1. `/fast` sections get `id` attributes the prototype lacks

**Prototype behaviour:** the header block sits outside both `<sc-if>` blocks, so
it renders identically in both modes — including the five nav anchors
`#now`, `#patent`, `#projects`, `#stack`, `#contact`. But every one of those `id`
attributes lives on a `<section>` inside the `isFull` block. The fast block
(`deploy/index.html:565–605`) carries **no `id` attributes at all** — it is plain
`<div>`s with `## EXPERIENCE`-style text headings. So in the prototype's fast
mode all five nav links, plus the logo's `#top`, resolve to nothing.

**What we do instead:** give `/fast`'s own sections real ids — `now`, `work`,
`patent`, `projects`, `stack`, `recognition`, `contact`, `about` — so the
existing header anchors resolve **in-page**.

**Reason:** the rejected alternative was pointing them cross-route at `/#now`
etc., which sends a visitor who deliberately chose the light path onto the heavy
page, defeating the purpose of `/fast`. Adding ids adds `id` attributes only —
invisible, no new behaviour, no new content, no visual change. A visible
cross-link to `/` is kept as separately specified.

### 2. FULL/FAST active state reflects the actual route

**Prototype behaviour:** `FULL` is hardcoded with
`background:var(--rk-acc,#FF4A1C)` and `FAST` with the dim style
(`.dc.html:132–133`, `deploy/index.html:146–147`), unconditionally. The
prototype's fast mode therefore paints **FULL** as the active button while the
visitor is looking at fast mode.

**What we do instead:** the highlighted button reflects the actual route. On
`/fast`, `FAST` is highlighted. On `/`, `FULL` is highlighted.

**Reason:** the prototype's hardcoding is a bug, not a design decision.

### 3. Tiro Devanagari Hindi is the Devanagari fallback on the IBM Plex Mono stack

**Prototype behaviour:** the footer index links carry Devanagari
(`00 · परिचय / About`, and five more) but are rendered in
`font-family:'IBM Plex Mono',monospace`. IBM Plex Mono ships **no Devanagari
glyphs**, so those characters fall back to whatever the operating system
provides. Verified with DevTools `CSS.getPlatformFontsForNode`: 5 glyphs in that
link came from **FreeSans as a system fallback**, not from any webfont.

**What we do instead:** `--rk-font-mono` is
`'IBM Plex Mono', 'Tiro Devanagari Hindi', monospace`. Plex Mono still wins for
Latin; Tiro is only reached for codepoints Plex Mono cannot draw.

**Reason** (Ritul, 2026-08-04): "render Devanagari in a font that ships no
Devanagari glyphs" has no coherent intentional reading, so it fails the same test
the FULL/FAST bug failed — unlike `WORK → #projects`, which passes it. The
failure mode is tofu in the footer nav on machines with no Devanagari system
font. Tiro is already loaded for Devanagari elsewhere, so this makes rendering
deterministic rather than OS-dependent.

**Do NOT widen the fallback to any other stack.** Only the mono stack.

### 4. `.rk-root` uses `overflow-x: clip`, not `hidden` — fixes a double scrollbar

**Prototype behaviour:** the root wrapper carried `min-height:100vh` together with
`overflow-x:hidden`. Per CSS spec, when one axis is not `visible` the other
computes to `auto` — so `overflow-y` became `auto` and `.rk-root` turned into a
second scroll container stacked on the document's. Two scrollbars.

Measured before the fix, at 1440px and 390px on `/`:
computed `overflow-y: auto`, and **both** `docScrolls` and `rootScrolls` true.

It was invisible in the design tool's constrained preview panel, which is why it
survived into the export.

**What we do instead:** `overflow-x: clip`. `clip` does not trigger the coercion
and creates no scroll container, so horizontal clipping is preserved and the inner
scrollbar disappears. **No overflow rules on `html` or `body`** — that would be a
different fix with different side effects.

Measured after: `overflow-y: visible`, `rootScrolls: false`, exactly **one**
scrollbar on both routes at both widths, no horizontal overflow at 390px.

`clip` does **not** disturb anything that reads document scroll. Verified after
the change: H1Parallax still tracks scroll, ScrollProgress reaches 100% at the
true bottom, RevealOnScroll reaches opacity 1, the fixed canvas stays pinned at
0,0 at full viewport size and is **not** clipped, and the fixed header stays at
`top: 0`.

### 5. A custom scrollbar — a NEW design addition, not fidelity

**The prototype has zero scrollbar styling.** This is not a bug fix and not a
port; Ritul requested it deliberately (2026-08-06). Do not remove it as
"something the prototype doesn't have" — that is the point.

Rules live in `src/styles/global.css` under the `scrollbar` heading. Constraints
it must keep:

- **Pure CSS.** Nothing about this may add a script to `/fast`.
- **Tokens, never hex.** `--rk-line` for the thumb, `--rk-acc` on hover,
  transparent track. Verified in both themes: dark resolves to
  `rgba(243,241,235,0.13)`, light to `rgba(20,19,26,0.15)`.
- Square — `border-radius: 0`, matching the design language. Thin.
- Both `::-webkit-scrollbar*` **and** Firefox's `scrollbar-width` /
  `scrollbar-color`, so it is not Chrome-only.
- Applies to both routes.

Known limitation: Firefox exposes no thumb-hover selector, so **accent-on-hover
is WebKit/Blink only**. Faking it with `html:hover` would turn the thumb accent
whenever the pointer is anywhere on the page, which is worse than not having it.

### `scrollbar-gutter: stable` — considered, deliberately NOT set

It reserves the scrollbar's width permanently, whether or not the page scrolls.
Measured: adding it reduced `documentElement.scrollWidth` from 1440 to **1430**,
a real 10px change to a width measurement.

It only earns that cost on pages that toggle between scrolling and not scrolling.
Both routes **always** scroll at every tested width — `/` is 5744px at 1440 and
10527px at 390; `/fast` is 1800px and 3023px, against a 900px viewport. So there
is no layout shift to prevent, and the gutter would just narrow the page and shift
every width-based measurement, including the side-by-side baselines and the
responsive breakpoints.

**If a future change can make either route short enough not to scroll, revisit
this** — that is the condition under which it becomes worth the 10px.

### 6. `html` is themed from `--rk-bg`

**Prototype behaviour:** `html { background:#08080B }` is hardcoded at
`deploy/index.html:30` and never themed. `applyTheme` only sets CSS variables on
`document.documentElement` and assigns `document.body.style.background` — both
verified. So in light theme `html` stays `rgb(8,8,11)` while body and root go
light, and a black band leaks below the hero.

Measured at 1440px in light theme: prototype `html` computed
`rgb(8, 8, 11)` against a `--rk-bg` of `#F2EFE8`. It accounted for essentially
all of a 4.087% hero difference.

**What we do instead:** the `html` rule at the top of `src/styles/global.css`
themes `html` from `--rk-bg`, so it follows the theme like everything else. It
is deliberately not in `tokens.css`, which is generated by
`scripts/gen-tokens.mjs` and would be overwritten.

**Reason** (Ritul, 2026-08-06): "hardcode dark on html so the light theme leaks a
black band" has no coherent intentional reading, so it fails the same test the
FULL/FAST bug failed.

### 7. Live-data additions — NEW, not fidelity

Requested by Ritul (2026-10-19) so the site reads as current rather than a
snapshot. None exist in the prototype; do not remove them as such.

- **Project card meta line** — language, last push (full date) and stars, from
  GitHub at build time. Items wrap between each other, never inside one.
- **Recently active** — the three most recently pushed public repos, in the
  Projects rail and on `/fast`.
- **Now log** — dated lines from `src/data/now.ts`, above SAGE in the Now
  section and as `## NOW` on `/fast` (which now carries the `now` id).
- **Build stamp** — "Rebuilt every morning from GitHub. Last rebuilt …" in the
  footer and on `/fast`; the copyright year comes from the build date.
- **RelativeTimes** — a 16th behaviour, `/` only: appends "· 9 days ago" to
  build-time dates. The full date is always server-rendered beside it, so
  `/fast` stays script-free and nothing breaks without it.

Dates are always written in full ("10 October 2026"), in India time, via
`src/lib/dates.ts` (Ritul, 2026-10-19: no short forms).

### 8. Accessibility and robustness fixes (2026-10-19)

From the 2026-10-05 audit. None changes timing, easing or look for a mouse
user; they add what the prototype never had for keyboards, screen readers,
resizing and reduced motion.

- **Answer panel** refits on resize (ResizeObserver) instead of clipping, and is
  `inert` while closed, so its CLOSE button is not a hidden Tab stop.
- **Screen readers** hear each finished answer once, via a polite live region;
  the visible text still streams word by word.
- **Stack chips** are focusable buttons: focus previews like hover, Enter or
  Space pins like a click, and `aria-pressed` tracks the pin. The pin's clear
  control is a real button.
- **Focus ring**: `:focus-visible` only, accent colour; the search box shows
  focus on its border.
- **Reduced motion**: the canvas is drawn once in its settled constellation
  (previously the single static frame caught the scattered intro positions),
  with no scroll parallax.
- **Brand link** has an accessible name, since its text is hidden below 380px.

### 9. Phone menu and accessible text on accent (2026-10-19)

Both chosen by Ritul.

- **Phone and tablet menu.** Below 980px the prototype hides the whole nav and
  offers nothing in its place. A `MENU` button in the bar opens a panel in the
  clock panel's style with every section (About, Now, Experience, Patent,
  Projects, Stack, Recognition, Contact). It closes on a link, on Escape (focus
  returns to the button), and when the window widens past 980px; it is `inert`
  while closed. Driven by the sanctioned inline script, so it works on `/fast`
  with no external file. The header's desktop nav — including `WORK` →
  `#projects` — is unchanged.
- **Text on accent.** `--rk-on-acc` replaces hardcoded white on accent
  backgrounds (FULL/FAST active, RETRIEVE, the email button, link-row hover,
  text selection): near-black `#08080B` in dark theme (5.97:1, was 3.36:1),
  white in light theme (4.53:1, unchanged). Lives in `global.css`, not the
  generated `tokens.css`.

## Considered and rejected — do not re-raise

These look like prototype bugs but are settled. Re-opening them wastes a round
trip.

### The header's `WORK` link points at `#projects`, not `#work` — intentional

`.dc.html:118` / `deploy/index.html:132`. The Experience section (`id="work"`)
is therefore unreachable from the header; the only link to it is the footer's
`02 · कार्य / Experience`.

**This is a design choice, not a typo, and it stays as-is.** It is *not* an
approved deviation because nothing deviates — we reproduce it exactly. The
reasoning (Ritul, 2026-08-04): "Work" is standard portfolio vocabulary for a
projects section, and the header is already a curated five-item subset that omits
About, Experience and Recognition. Experience is reachable from the footer index.
Unlike the FULL/FAST hardcoding, this has a coherent intentional reading.

### Skipping the IntroLoader under `prefers-reduced-motion` — rejected

Briefly recorded as a third approved deviation, then cancelled (2026-08-04).
Keep the prototype's `dur = reduce ? 350 : 1700`. See the IntroLoader section.

### Four-decimal coordinates in the About panel — rejected

An earlier About-panel spec cited `28.6139°N 77.2090°E`. That string appears zero
times in the prototype; `28.61` appears three times. It came from Ritul's resume,
not the design. The fidelity rule wins: use the extracted `28.61°N 77.21°E`
everywhere.

## The About column — preserved, not removed

The 230px 4:5 frame in the About section is **preserved, not removed**. A photo
is coming later and must drop straight into that cell with no re-layout, so the
two-column geometry and the frame's exact dimensions are load-bearing.

**Settled 2026-08-04 after reviewing three rendered options.** The frame holds an
instrument readout of:

- `DELHI NCR, INDIA` — top
- `IST` + live time — bottom, on a rule
- a centred registration mark in the space the photo will occupy

The coordinates `28.61°N 77.21°E` appear **exactly once**, in the caption below
the frame, because that is where the design fixes them.

**Rejected:** putting the coordinates inside the panel as well. Every option
carries the caption, so a panel copy prints them twice within ~250px — at the
same size (obviously wrong) or at two sizes (reads as an error, not a
hierarchy). The chosen layout is also structurally closest to the finished
design: photo in frame, coordinates as caption.

**Invent no new copy** in this cell.

## Workflow

- One step per commit. Never work ahead. Never combine steps.
- Run `git --no-pager diff` and show the actual output **before** every commit.
  A summary of what changed is not acceptable.
- Push to `github.com/ritul-aryan/ritularyan.com` after every step. GitHub is the
  authoritative home; any local mirror is a convenience copy.
- After every step: run the build AND open the page. Report what was
  **observed**, not intended — console errors, horizontal overflow at 390px, and
  which scripts loaded.
- If something in the prototype is ambiguous, **ask**. Do not invent.
- Never claim visual fidelity without comparing against `deploy/` side by side.
- `git init` belongs inside `ritularyan/`. The parent folder is NOT a repo and
  must never become one.

## Hard prohibitions

### Never put comment keys in a JSON file a platform validates

JSON has no comment syntax. `vercel.json` once carried `"//"` keys used as
pseudo-comments; Vercel validates that file against a schema with
`additionalProperties: false`, so **every deployment from 46b8209 onward failed
schema validation** — commit C, the origin fix and the scrollbar fix were all
built and verified locally but never actually deployed.

**If a config needs explaining, explain it here, not in the file.**

This applies to any file a platform parses against a schema. `package.json` is
the documented exception — npm explicitly supports `"//"` as a comment key.

### A green local build says nothing about platform config acceptance

`astro build` passed on every one of those broken deployments. The build never
reads `vercel.json`. **Verifying the build is not verifying the config.**

`npm run verify:config` exists for this, and it is wired to **`prebuild`**, so
npm runs it automatically before every `build` — locally and on Vercel. A bad
config now fails with a clear message naming the offending key, instead of
Vercel's schema error after the fact. Verified: with a `"//"` key present, `npm
run build` exits 1 and `astro build` never runs.

It hard-fails on comment-shaped keys anywhere in a schema-validated file, and
additionally validates against the live schema when the host is reachable — the
fetch is best effort and degrades to a vendored top-level property list rather
than failing a build for being offline. Verified in that state: the host returns
403 from the build container, prebuild prints a NOTICE and exits 0, and the build
proceeds.

**`vercel.json` must keep `"buildCommand": "npm run build"`.** It previously said
`astro build`, which Vercel runs as a shell command — that bypasses npm lifecycle
scripts entirely, so `prebuild` would never have fired on Vercel. Setting a
buildCommand that is not an npm script silently disables every guard hanging off
`prebuild`.

### What belongs in `prebuild`, and what does not

`verify:config` and `verify:content`. The test for `verify:config` is whether
the failure mode is **invisible locally and fatal remotely** — that is the gap
a deploy-time guard closes. `verify:content` passes a different test: builds now
run unattended, so a broken data file must stop the deploy rather than ship.

- **`verify:config` — yes.** A green local build says nothing about it, and the
  failure only surfaces on the platform. ~335ms against a ~2.6s build.
- **`verify:content` — yes, since 2026-10-19.** It checks structure only and
  reads nothing outside the repo. It imports the `.ts` data files, which needs
  type stripping: Node is pinned to `24.x` (`engines` in `package.json`,
  matching the Vercel project setting), where that is built in. Do not lower
  the Node version without re-checking this.
- **`verify:fonts` — safe but low value there.** It is self-contained (reads
  `node_modules/@fontsource` and `src/data`) and would run fine on Vercel at
  ~194ms. But it fails the same way locally as remotely, so it catches nothing a
  local run would miss. Add it only for belt-and-braces against a partial
  `npm install`.

`npm run verify` runs all three for local and CI use.

Confirmed against the real failure: with the two `"//"` keys restored,
`verify:config` exits 1 and names both, while `npm run build` still reports
Complete.

### Read the whole output of a check, never a tail

`npm run check` reported **1 error** for two commits — `process` was untyped in
`src/lib/github.ts` — and it went unnoticed because the command was piped through
`tail -3`, which cut the error count off and left only the warning and hint lines
visible. The check was doing its job; the reporting was not.

Do not truncate the output of a verification command before reading it. If a
summary is needed, print the summary line explicitly rather than slicing the tail
off and hoping the important line survived.

### What vercel.json actually does

Recorded here because the file itself must stay comment-free:

- `framework: astro`, `buildCommand: npm run build` (never `astro build` — see
  above), `outputDirectory: dist` — static output, matching the dashboard
  settings.
- `cleanUrls: true`, `trailingSlash: false` — `/fast` rather than `/fast/`.
- `/_astro/(.*)` gets `max-age=31536000, immutable`. Those filenames are content
  hashed, so they can never go stale.
- `og.png`, `favicon.svg`, `apple-touch-icon.png` get `max-age=86400,
  must-revalidate`. They change only when regenerated by hand, but they keep
  their filenames, so they must not be cached immutably.
- Everything gets `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`.

### Never add Vercel Analytics or Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are **declined, deliberately**
(Ritul, 2026-08-03). Both inject a client-side script, which would break the
zero-JS requirement on `/fast`. Do not add either package at any point, and do
not enable Web Analytics or Speed Insights in the Vercel dashboard.

### robots.txt — the crawl block has been lifted

It held `Disallow: /` while the site was half-built, because the production Vercel
deployment is publicly reachable and does **not** get an automatic `noindex` —
only preview deployments do. As of 2026-08-06 the site is complete, so it is now
`Allow: /`.

Since 2026-10-19 both `robots.txt` and `sitemap.xml` are generated by
`src/pages/robots.txt.ts` and `src/pages/sitemap.xml.ts` — no dependency —
so the Sitemap line and the URLs come from the single origin constant in
`src/data/site.ts`. `lastmod` is the build date. There is no
`public/robots.txt` any more; adding one back would collide with the route.

### The custom domain

`ritularyan.com` is **not registered yet**. Until it is, `SITE.origin` points at
`https://ritularyan-com.vercel.app` (commit c3c7326); switching that one
constant is the whole change when the domain resolves. `canonical`, `og:url`
and the OG image URL are built from a single origin constant in
`src/data/site.ts` — nothing else should hardcode the domain.

## Daily rebuild

Everything fetched at build time goes stale between builds, so the site is
rebuilt once a day without a commit. `.github/workflows/daily-rebuild.yml` runs
at 00:47 UTC (06:17 IST) and POSTs to a Vercel deploy hook stored in the
repository secret `VERCEL_DEPLOY_HOOK`. It can also be run by hand from the
Actions tab. The hook URL is a secret: it never goes in the repo.

- The workflow has `permissions: {}` — it reads nothing and writes nothing in the
  repo; it only calls the hook.
- GitHub disables scheduled workflows in a public repo after 60 days with no
  repository activity, and emails a warning first. Any push resets the clock.
- A scheduled build runs `prebuild` like any other, so a broken data file fails
  that day's deploy and the previous deployment stays live.
- Optional: a fine-grained, read-only `GITHUB_TOKEN` in the Vercel project's
  environment variables lifts GitHub's unauthenticated rate limit for the
  build-time feed. Without it the feed still works, and falls back to the
  curated list if GitHub refuses.

## Environment notes

- Vercel is connected to the repo: framework preset **Astro**, output `dist`.
  Every push produces a deployment URL, checked on real hardware — claims about
  overflow, console errors and which scripts load are independently verifiable.
- Do **not** run git commands against the folder through the Cowork device
  bridge. The bridge's mount layer denies `unlink`, so git creates
  `.git/index.lock` and cannot remove it, leaving a stale lock behind. Verified
  2026-08-03: native git in that same folder works fine — the restriction is the
  bridge only. Run git in the container or natively, never through the bridge.

## Other required work

- `<title>`, meta description, canonical, Open Graph + Twitter card, theme-color,
  favicon (`ऋ` in `#FF4A1C` on `#08080B`).
- `og.png` at 1200×630 matching the dark hero.
- `prefers-reduced-motion` respected: canvas static, no animation.
- GitHub projects fetched **at build time** from
  `api.github.com/search/repositories?q=user:ritul-aryan+topic:portfolio`, baked
  into static HTML, with the curated list in `src/data/projects.ts` as fallback.
  The build must never break because GitHub is down. The topic decides which
  repos appear; the curated list decides their wording and order (rules at the
  top of `projects.ts`).
- Do NOT port `image-slot.js`, `<image-slot>`, `support.js`, or the design tool's
  dc-runtime. Clean rebuild. No portrait placeholder — a photo is coming later
  and must drop into the About cell's 230px 4:5 frame with no re-layout.
