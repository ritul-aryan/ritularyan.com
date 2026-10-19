// Shared types for the extracted content.

/** The eight sections the fact index is partitioned across. */
export type SectionId =
  | 'about'
  | 'now'
  | 'work'
  | 'patent'
  | 'projects'
  | 'stack'
  | 'recognition'
  | 'contact';

/**
 * One entry in the retrieval index.
 *
 * Field names are expanded from the prototype's `s`/`t`/`x`/`k`. The
 * scoring pass must concatenate them as `title + ' ' + text + ' ' + keywords`
 * to reproduce the prototype's term frequencies exactly.
 */
export interface Fact {
  /** Section this fact belongs to; doubles as the answer's source anchor. */
  readonly section: SectionId;
  /** Short label, shown as the source chip and the canvas node tooltip. */
  readonly title: string;
  /** The answer body streamed into the retrieval panel. */
  readonly text: string;
  /** Extra search terms, never displayed. */
  readonly keywords: string;
}

/**
 * A curated project entry (src/data/projects.ts). `repo` links it to a GitHub
 * repo; omit it for private work, which then needs an in-page `anchor`.
 */
export interface CuratedProject {
  /** GitHub repo name, matched case-insensitively. Omit for private work. */
  readonly repo?: string;
  readonly name: string;
  readonly description: string;
  /** Pre-joined display string, e.g. "LangGraph · FastAPI · React/TS". */
  readonly tags: string;
  /** Corner badge; empty string renders no badge. */
  readonly badge: string;
  /** Space-separated Stack skill keys, matched by StackFilter. */
  readonly skills: string;
  /** Private work only: the in-page section the card points at. */
  readonly anchor?: string;
}

/** A rendered project card. `url` may be an in-page anchor rather than a repo link. */
export interface Project {
  readonly name: string;
  readonly description: string;
  /** Pre-joined display string, e.g. "LangGraph · FastAPI · React/TS". */
  readonly tags: string;
  /** Corner badge; empty string renders no badge. */
  readonly badge: string;
  /** Space-separated keys matched against `data-skill` for StackFilter. */
  readonly skills: string;
  readonly url: string;
  /** True for work that has no public repo, which changes the hover label. */
  readonly priv?: boolean;
  /** ISO timestamp of the repo's last push, from GitHub at build time. */
  readonly updated?: string;
  /** Primary language reported by GitHub. */
  readonly language?: string;
  readonly stars?: number;
}
