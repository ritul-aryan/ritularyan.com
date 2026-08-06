/**
 * Event bus between the two React islands.
 *
 * The prototype was one component, so the canvas and the retrieval UI shared
 * state directly. Here CanvasField and AskIndex are separate islands — the
 * architecture names them separately — so they talk over window events instead.
 *
 * Payloads carry fact indices, never DOM references, so neither island needs to
 * know how the other renders.
 */

/** A scored hit, reduced to what the canvas needs to light a node. */
export interface NodeHit {
  /** Index into FACTS. */
  readonly i: number;
  /** Normalised score, 0..1. */
  readonly n: number;
  /** Rank in the result list; 0 is the top hit and gets a label. */
  readonly rank: number;
}

export const RK = {
  /** AskIndex -> CanvasField: light these nodes. Empty array clears. */
  hits: 'rk:hits',
  /** AskIndex -> CanvasField: fire the shockwave and spawn packets. */
  pulse: 'rk:pulse',
  /** CanvasField -> AskIndex: the visitor clicked a node; ask its title. */
  askFact: 'rk:ask-fact',
} as const;

export function emitHits(hits: readonly NodeHit[]): void {
  window.dispatchEvent(new CustomEvent(RK.hits, { detail: hits }));
}

export function emitPulse(hits: readonly NodeHit[]): void {
  window.dispatchEvent(new CustomEvent(RK.pulse, { detail: hits }));
}

export function emitAskFact(title: string): void {
  window.dispatchEvent(new CustomEvent(RK.askFact, { detail: title }));
}

export function onHits(fn: (hits: readonly NodeHit[]) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent).detail as NodeHit[]);
  window.addEventListener(RK.hits, h);
  return () => window.removeEventListener(RK.hits, h);
}

export function onPulse(fn: (hits: readonly NodeHit[]) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent).detail as NodeHit[]);
  window.addEventListener(RK.pulse, h);
  return () => window.removeEventListener(RK.pulse, h);
}

export function onAskFact(fn: (title: string) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent).detail as string);
  window.addEventListener(RK.askFact, h);
  return () => window.removeEventListener(RK.askFact, h);
}

/** True when the visitor asked for reduced motion. */
export function prefersReducedMotion(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** True only on a real pointer with hover. CustomCursor must not widen this. */
export function hasFinePointer(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(hover:hover) and (pointer:fine)').matches
  );
}
