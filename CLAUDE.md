# ritularyan.com — build rules

Personal portfolio for Ritul Aryan, AI Software Engineer. Production rebuild of a
Claude Design prototype. Deploys to Vercel as static output.

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
| `deploy/` | working verified render — ground truth and CONTENT SOURCE |

### Line-number offset between the two files

The two HTML files are byte-identical **except** for 14 lines of head metadata
(`<title>`, meta description, canonical, OG + Twitter, theme-color, inline SVG
favicon) which exist only in `deploy/index.html`.

**`deploy/index.html` line N === `.dc.html` line N − 14** (for N > 19).

Example: the FULL/FAST buttons are `.dc.html:132` and `deploy/index.html:146`.
Always state which file a line number refers to.

## Content facts (verified, do not drift)

- The fact index holds exactly **44 facts**: now 6, work 5, patent 3, projects 7,
  stack 8, about 10, recognition 3, contact 2.
- The SEED projects array holds exactly **9 entries**.
- Colour tokens: `--rk-acc` `#FF4A1C`, `--rk-acc2` `#7CE7FF`, bg `#08080B`.
- Devanagari `ऋतुल आर्यन` must render correctly — verify the font subset covers it.

## Islands — all 15 behaviours must survive with identical timing, easing and feel

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
script for theme (and one for the clock) is sanctioned. Inline only — no
external file, no extra request. Theme reads the same `rk-theme` localStorage
key, runs before first paint so there is no wrong-theme flash, and is wrapped in
`try`/`catch` falling back to the design default if localStorage is blocked.

`/fast` renders the complete header, matching the prototype: `RITUL ARYAN`,
`NOW / PATENT / WORK / STACK / CONTACT`, the clock, and `LIGHT` / `FULL` / `FAST`.

Verify "no script loads" against `astro preview` (production), never `astro dev`
— the dev server injects `/@vite/client`, the dev-toolbar entrypoint and an
inline `window.__astro_dev_toolbar__` blob that are absent from the build.

## Approved deviations from the prototype

There are exactly **five**, all **explicitly approved by Ritul**. Do **not**
revert them as "fidelity violations". This register is exhaustive — any departure
from the prototype not listed here is a bug. Everything else stays exact.

Deviations 1-4 are **bug fixes**: the prototype's behaviour has no coherent
intentional reading. Deviation 5 is a **new design addition**, requested
deliberately, and is not a fidelity matter at all.

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

It was invisible in Claude Design's constrained preview panel, which is why it
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

### Never add Vercel Analytics or Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are **declined, deliberately**
(Ritul, 2026-08-03). Both inject a client-side script, which would break the
zero-JS requirement on `/fast`. Do not add either package at any point, and do
not enable Web Analytics or Speed Insights in the Vercel dashboard.

### `public/robots.txt` — the crawl block has been lifted

It held `Disallow: /` while the site was half-built, because the production Vercel
deployment is publicly reachable and does **not** get an automatic `noindex` —
only preview deployments do. As of 2026-08-06 the site is complete and the domain
is attached, so it is now `Allow: /`.

There is deliberately **no `Sitemap:` line**: no sitemap is generated, and
pointing crawlers at a 404 is worse than omitting it. Adding one means either a
hand-written `public/sitemap.xml` or `@astrojs/sitemap` — a new dependency, so
ask first.

### The custom domain

`ritularyan.com` is attached. `canonical`, `og:url` and the OG image URL are
built from a single origin constant in `src/data/site.ts` — nothing else should
hardcode the domain.

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
  into static HTML, with the SEED list as fallback. The build must never break
  because GitHub is down.
- Do NOT port `image-slot.js`, `<image-slot>`, `support.js`, or Claude Design's
  dc-runtime. Clean rebuild. No portrait placeholder — a photo is coming later
  and must drop into the About cell's 230px 4:5 frame with no re-layout.
