interface ImportMetaEnv {
  /**
   * Set to "1" to build from the curated project list with no network call.
   * Used for offline builds and deterministic comparisons — see
   * src/lib/github.ts.
   */
  readonly RK_SKIP_GITHUB?: string;
  /**
   * Optional read-only GitHub token (Vercel environment variable, never
   * committed). Lifts the API rate limit for the build-time project feed.
   */
  readonly GITHUB_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
