/**
 * Build-time GitHub project feed.
 *
 * The prototype fetched this in the browser. Here it runs once at build time and
 * the result is baked into static HTML, so visitors make no request to
 * api.github.com and the list still curates itself by repo topic.
 *
 * THE BUILD MUST NEVER FAIL BECAUSE GITHUB IS DOWN. Every failure path — network
 * error, non-200, rate limit, malformed JSON, timeout — falls back to SEED and
 * logs what happened. There is no `throw` on this path by design.
 */

import { SEED } from '../data/projects';
import { COPY } from '../data/copy';
import type { Project } from '../data/types';

const USER = 'ritul-aryan';
const TOPIC = 'portfolio';
const ENDPOINT = `https://api.github.com/search/repositories?q=user:${USER}+topic:${TOPIC}&sort=updated&per_page=30`;

/** Give up rather than hang a build behind a stalled connection. */
const TIMEOUT_MS = 8000;

interface Repo {
  name?: string;
  description?: string | null;
  topics?: string[];
  language?: string | null;
  stargazers_count?: number;
  html_url?: string;
}

export interface Feed {
  projects: readonly Project[];
  /** The status line shown in the Projects rail. */
  status: string;
}

/** Title-cases a repo slug, as the prototype does. */
const titleise = (name: string): string =>
  name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export async function fetchProjects(): Promise<Feed> {
  const seedFeed: Feed = { projects: SEED, status: COPY.projects.seedFeedStatus };

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ritularyan.com-build',
      },
    });
  } catch (err) {
    console.warn(
      `[github] fetch failed (${err instanceof Error ? err.message : String(err)}) — falling back to SEED`
    );
    return { ...seedFeed, status: 'FEED OFFLINE · SHOWING SEED' };
  }

  if (!res.ok) {
    console.warn(`[github] HTTP ${res.status} — falling back to SEED`);
    return { ...seedFeed, status: 'FEED OFFLINE · SHOWING SEED' };
  }

  let items: Repo[];
  try {
    const json = (await res.json()) as { items?: Repo[] };
    items = Array.isArray(json.items) ? json.items : [];
  } catch (err) {
    console.warn(
      `[github] malformed JSON (${err instanceof Error ? err.message : String(err)}) — falling back to SEED`
    );
    return { ...seedFeed, status: 'FEED OFFLINE · SHOWING SEED' };
  }

  const live: Project[] = items
    .filter((it): it is Repo & { name: string } => typeof it.name === 'string' && !!it.name)
    .map((it) => ({
      name: titleise(it.name),
      description: it.description || 'No description on the repo yet.',
      tags:
        (it.topics ?? [])
          .filter((t) => t !== TOPIC)
          .slice(0, 4)
          .join(' · ') || it.language || 'Repository',
      badge: '★ ' + (it.stargazers_count ?? 0),
      skills: (it.topics ?? []).join(' '),
      url: it.html_url ?? `https://github.com/${USER}`,
    }));

  if (!live.length) {
    console.log('[github] 0 repos tagged `portfolio` — showing SEED');
    return { ...seedFeed, status: 'LIVE · 0 TAGGED YET · SHOWING SEED' };
  }

  // Live entries first, then any SEED entry the feed does not already cover.
  const seen = new Set(live.map((p) => p.name.toLowerCase()));
  const merged = live.concat(SEED.filter((p) => !seen.has(p.name.toLowerCase())));

  console.log(`[github] ${live.length} tagged + ${merged.length - live.length} seed`);
  return {
    projects: merged,
    status: `LIVE · ${live.length} TAGGED + ${merged.length - live.length} SEED`,
  };
}
