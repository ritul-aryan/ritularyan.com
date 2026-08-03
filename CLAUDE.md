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
- Under `prefers-reduced-motion`, skip the loader entirely and land on `/`.
  (See approved deviation 3 — the prototype instead shows it for 350ms.)

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

These are **explicitly approved by Ritul** (2026-08-03). Do **not** revert them
as "fidelity violations". This register is exhaustive — any departure from the
prototype not listed here is a bug. Everything else stays exact.

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

### 3. Under `prefers-reduced-motion`, the IntroLoader is skipped entirely

**Prototype behaviour:** the loader still runs, at a shortened duration —
`const dur = this.reduce ? 350 : 1700;` (`deploy/index.html:1276`). It is not
skipped.

**What we do instead:** skip the loader entirely and land directly on `/`.

**Reason:** instructed by Ritul (2026-08-03) alongside the IntroLoader spec, and
consistent with the project-wide rule that `prefers-reduced-motion` means canvas
static and no animation. Recorded here because it *is* a departure from the
prototype and would otherwise contradict the "only approved deviations" clause
above. **Flagged to Ritul for confirmation — if he meant "350ms, as the
prototype", this entry is wrong and should be corrected to match.**

## The About column — preserved, not removed

The 230px 4:5 frame in the About section is **preserved, not removed**. A photo
is coming later and must drop straight into that cell with no re-layout, so the
two-column geometry and the frame's exact dimensions are load-bearing.

Fill it **only** with content that already exists in the prototype:

- `28.6139°N 77.2090°E`
- `DELHI NCR, INDIA`
- `IST` live — the same clock as the header

Styled as an instrument readout using the existing mono token. Keep the
coordinate caption where the design puts it. **Invent no new copy.**

Screenshot it and show Ritul **before committing step 3**. If it reads as filler
he will switch to full-width prose with the coordinates in the left rail — so do
not treat this cell as settled until he has seen it rendered.

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
