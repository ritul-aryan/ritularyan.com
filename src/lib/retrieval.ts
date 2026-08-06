/**
 * The retrieval engine, ported from the prototype's script block.
 *
 * The scoring must reproduce the prototype exactly: same tokeniser, same crude
 * stemmer, same prefix fallback, same TF-IDF expression, same top-4 slice, same
 * weak-match threshold. Any drift changes which fact answers a question.
 *
 * Reference: deploy/index.html — tok() at 684, buildIndex() at 987,
 * search() at 999, ask() at 1035.
 */

import { FACTS } from '../data/facts';
import { STOP } from '../data/search';
import type { Fact } from '../data/types';

export interface Doc {
  /** Index into FACTS. CanvasField uses this to map a hit to its node. */
  readonly i: number;
  readonly f: Fact;
  readonly tf: Record<string, number>;
  /** Term count, floored at 1 so the sqrt divisor is never zero. */
  readonly len: number;
}

export interface Hit {
  readonly d: Doc;
  /** Raw score. Compared against 1.1 to decide "weak match". */
  readonly s: number;
  /** Score normalised against the top hit, 0..1. Drives node brightness. */
  readonly n: number;
}

/**
 * Lowercase, split on anything that is not alphanumeric / + / #, drop
 * single characters and stop words, then strip a trailing "s" from words longer
 * than three characters.
 *
 * The stemmer is deliberately crude — it is the prototype's, and matching it
 * matters more than improving it.
 */
export function tok(s: string): string[] {
  return String(s)
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => (w.endsWith('s') && w.length > 3 ? w.slice(0, -1) : w));
}

export class Index {
  readonly docs: Doc[];
  readonly df: Record<string, number>;
  readonly N: number;

  constructor(facts: readonly Fact[] = FACTS) {
    this.docs = facts.map((f, i) => {
      // The prototype concatenates title, text and keywords in this order.
      const terms = tok(f.title + ' ' + f.text + ' ' + f.keywords);
      const tf: Record<string, number> = {};
      terms.forEach((w) => {
        tf[w] = (tf[w] ?? 0) + 1;
      });
      return { i, f, tf, len: terms.length || 1 };
    });

    this.df = {};
    this.docs.forEach((d) => {
      Object.keys(d.tf).forEach((w) => {
        this.df[w] = (this.df[w] ?? 0) + 1;
      });
    });

    this.N = this.docs.length;
  }

  search(q: string): Hit[] {
    const qt = tok(q);
    if (!qt.length) return [];

    const scored = this.docs
      .map((d) => {
        let s = 0;
        qt.forEach((w) => {
          let hit = d.tf[w] ?? 0;
          if (!hit) {
            // Prefix fallback, at 0.6 weight, first match wins.
            for (const key in d.tf) {
              if (key.length > 3 && (key.startsWith(w) || w.startsWith(key))) {
                hit = d.tf[key]! * 0.6;
                break;
              }
            }
          }
          if (hit) {
            s += (hit / Math.sqrt(d.len)) * Math.log(1 + this.N / (this.df[w] ?? 1)) * 3;
          }
        });
        return { d, s };
      })
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s);

    const max = scored.length ? scored[0]!.s : 1;
    return scored.slice(0, 4).map((r) => ({ d: r.d, s: r.s, n: r.s / max }));
  }
}

/** Raw score below this reads as a weak match, and the answer is prefixed. */
export const WEAK_THRESHOLD = 1.1;

export const NO_MATCH_STATUS = '0 MATCHES — TRY: PATENT, SAGE, LANGGRAPH, KURASH';

export const NO_MATCH_ANSWER =
  'Nothing in the index matches that. It only holds facts about my work — try asking about the patent, SAGE, my stack, or why you should hire me.';

export const WEAK_PREFIX = 'Closest thing in the index: ';

/** Word-at-a-time reveal interval, ms. */
export const STREAM_MS = 26;
