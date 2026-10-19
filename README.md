# ritularyan.com

Personal portfolio of Ritul Aryan, AI Software Engineer.
Live at https://ritularyan-com.vercel.app

## What it is

- `/` — the full experience. A hand-written index of facts is scored in the
  browser (TF-IDF, no server, no API key) and drawn as the node-link field
  behind the page. Ask it a question and the matching points light up.
- `/fast` — the light path. Complete content, no framework, no hydration.

## Stack

Astro (static output) · React islands · TypeScript (strict) · plain CSS with
custom properties (no Tailwind) · self-hosted fonts via @fontsource · Vercel.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (runs `verify:config` first) |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check |
| `npm run verify` | Config, font and content checks |

Build rules and design decisions live in `CLAUDE.md`.
