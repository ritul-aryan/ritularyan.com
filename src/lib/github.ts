/**
 * Build-time GitHub project feed.
 *
 * Runs once per build and bakes the result into static HTML, so visitors make
 * no request to api.github.com. Both routes share one fetch (memoised below).
 * The curation rules — the `portfolio` topic decides inclusion, CURATED decides
 * wording and order — are documented at the top of src/data/projects.ts.
 *
 * THE BUILD MUST NEVER FAIL BECAUSE GITHUB IS DOWN. Every failure path — network
 * error, non-200, rate limit, malformed JSON, timeout — falls back to the
 * curated list and logs what happened. There is no `throw` on this path.
 *
 * Optional: set GITHUB_TOKEN in the Vercel project's environment variables (a
 * fine-grained token with public-repository read access only) to lift the
 * unauthenticated rate limit on shared build machines. Never commit it.
 */

import { CURATED, GH, USER } from '../data/projects';
import { COPY } from '../data/copy';
import type { CuratedProject, Project } from '../data/types';

const TOPIC = 'portfolio';
const ENDPOINT = `https://api.github.com/search/repositories?q=user:${USER}+topic:${TOPIC}&sort=updated&per_page=50`;

/** Give up rather than hang a build behind a stalled connection. */
const TIMEOUT_MS = 8000;

interface Repo {
  name?: string;
  description?: string | null;
  topics?: string[];
  language?: string | null;
  stargazers_count?: number;
  html_url?: string;
  pushed_at?: string;
  fork?: boolean;
  archived?: boolean;
  private?: boolean;
}

export interface Feed {
  projects: readonly Project[];
  /** The status line shown in the Projects rail. */
  status: string;
}

/** Reads a build-time variable from Astro's env, then the process env. */
function env(key: string): string | undefined {
  const fromAstro = (import.meta.env as unknown as Record<string, unknown>)[key];
  if (typeof fromAstro === 'string' && fromAstro) return fromAstro;
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[key];
}

/** Display date in India time, e.g. "10 Oct 2026". */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

/** Title-cases a repo slug for repos with no curated entry. */
const titleise = (name: string): string =>
  name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Language → Stack skill key, so uncurated cards still respond to the filter. */
const LANGUAGE_SKILL: Record<string, string> = {
  Python: 'python',
  'Jupyter Notebook': 'python',
  TypeScript: 'typescript',
};

function fromCurated(c: CuratedProject, repo?: Repo): Project {
  return {
    name: c.name,
    description: c.description,
    tags: c.tags,
    badge: c.badge,
    skills: c.skills,
    url: c.repo ? (repo?.html_url ?? `${GH}/${c.repo}`) : (c.anchor ?? '#projects'),
    priv: !c.repo,
    updated: repo?.pushed_at,
    language: repo?.language ?? undefined,
    stars: repo?.stargazers_count ?? 0,
  };
}

function fromRepo(r: Repo & { name: string }): Project {
  const topics = (r.topics ?? []).filter((t) => t !== TOPIC);
  const langSkill = r.language ? LANGUAGE_SKILL[r.language] : undefined;
  return {
    name: titleise(r.name),
    description: r.description || 'No description on the repo yet.',
    tags: topics.slice(0, 4).join(' · ') || r.language || 'Repository',
    badge: '',
    skills: [...topics, ...(langSkill ? [langSkill] : [])].join(' '),
    url: r.html_url ?? `${GH}/${r.name}`,
    updated: r.pushed_at,
    language: r.language ?? undefined,
    stars: r.stargazers_count ?? 0,
  };
}

let cached: Promise<Feed> | null = null;

/** One fetch per build, shared by `/` and `/fast`. */
export function fetchProjects(): Promise<Feed> {
  cached ??= load();
  return cached;
}

async function load(): Promise<Feed> {
  const curatedOnly: Feed = {
    projects: CURATED.map((c) => fromCurated(c)),
    status: COPY.projects.statusOffline,
  };

  /**
   * Deterministic escape hatch. Set RK_SKIP_GITHUB=1 to build from the curated
   * list only — for an offline build, or a pixel comparison that should not
   * depend on what is tagged today.
   */
  if (env('RK_SKIP_GITHUB') === '1') {
    console.log('[github] RK_SKIP_GITHUB=1 — curated list only, no network call');
    return curatedOnly;
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ritularyan.com-build',
  };
  const token = env('GITHUB_TOKEN');
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(ENDPOINT, { signal: AbortSignal.timeout(TIMEOUT_MS), headers });
  } catch (err) {
    console.warn(
      `[github] fetch failed (${err instanceof Error ? err.message : String(err)}) — curated list only`
    );
    return curatedOnly;
  }

  if (!res.ok) {
    console.warn(`[github] HTTP ${res.status} — curated list only`);
    return curatedOnly;
  }

  let items: (Repo & { name: string })[];
  try {
    const json = (await res.json()) as { items?: Repo[] };
    items = (Array.isArray(json.items) ? json.items : []).filter(
      (r): r is Repo & { name: string } =>
        typeof r.name === 'string' && !!r.name && !r.fork && !r.archived && !r.private
    );
  } catch (err) {
    console.warn(
      `[github] malformed JSON (${err instanceof Error ? err.message : String(err)}) — curated list only`
    );
    return curatedOnly;
  }

  if (!items.length) {
    console.log('[github] 0 repos tagged `portfolio` — curated list only');
    return curatedOnly;
  }

  const byName = new Map(items.map((r) => [r.name.toLowerCase(), r]));
  const used = new Set<string>();
  const projects: Project[] = [];

  // Curated entries, in the order written: private work always, public repos
  // only while they carry the topic.
  for (const c of CURATED) {
    if (!c.repo) {
      projects.push(fromCurated(c));
      continue;
    }
    const repo = byName.get(c.repo.toLowerCase());
    if (!repo) continue;
    used.add(c.repo.toLowerCase());
    projects.push(fromCurated(c, repo));
  }

  // Tagged repos with no curated entry, newest first.
  const extra = items
    .filter((r) => !used.has(r.name.toLowerCase()))
    .sort((a, b) => (b.pushed_at ?? '').localeCompare(a.pushed_at ?? ''));
  projects.push(...extra.map(fromRepo));

  console.log(`[github] ${items.length} tagged: ${used.size} curated, ${extra.length} uncurated`);
  return {
    projects,
    status: `LIVE · ${items.length} REPOS · SYNCED ${formatDate(new Date().toISOString()).toUpperCase()}`,
  };
}
