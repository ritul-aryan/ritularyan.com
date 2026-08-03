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

These two are **explicitly approved by Ritul** (2026-08-03). Do **not** revert
them as "fidelity violations". They are the ONLY approved deviations —
everything else stays exact.

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
