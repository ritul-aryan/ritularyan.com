interface ImportMetaEnv {
  /**
   * Set to "1" to build against the SEED project list with no network call.
   * Used for offline builds and for deterministic pixel comparisons against
   * deploy/ — see src/lib/github.ts.
   */
  readonly RK_SKIP_GITHUB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
