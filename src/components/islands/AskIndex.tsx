/**
 * AskIndex — the 44-fact client-side retrieval UI. client:load.
 *
 * Behaviour must match the prototype: same scoring (see lib/retrieval.ts), the
 * same top-4 slice with three source chips, the same status strings, the same
 * word-at-a-time stream at 26ms, "/" to focus, Escape to close, live node
 * highlighting on every keystroke after a 110ms debounce.
 *
 * Ported from deploy/index.html: onInput() at 1021, ask() at 1035,
 * stream() at 1063, openAnswer() at 1074.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { COPY } from '../../data/copy';
import { FACT_COUNT } from '../../data/facts';
import { SUGGESTIONS } from '../../data/search';
import {
  Index,
  NO_MATCH_ANSWER,
  NO_MATCH_STATUS,
  STREAM_MS,
  WEAK_PREFIX,
  WEAK_THRESHOLD,
} from '../../lib/retrieval';
import { emitHits, emitPulse, onAskFact, prefersReducedMotion } from '../../lib/bus';
import type { NodeHit } from '../../lib/bus';

interface Source {
  title: string;
  href: string;
  score: string;
}

export default function AskIndex() {
  const index = useMemo(() => new Index(), []);
  const reduce = useMemo(prefersReducedMotion, []);

  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  /** The full answer, announced once to screen readers (the visible text streams). */
  const [spoken, setSpoken] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);

  const { hero } = COPY;

  /** Height-animate the panel to its content, as the prototype does. */
  useEffect(() => {
    const el = panelRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    el.style.height = open ? inner.offsetHeight + 28 + 'px' : '0px';
  }, [open, answer, sources]);

  /**
   * Keep the panel fitted when its content reflows without changing — a resize
   * or a phone rotation. Without this a finished answer is clipped (audit,
   * 2026-10-05). Deviation 8.
   */
  useEffect(() => {
    const el = panelRef.current;
    const inner = innerRef.current;
    if (!open || !el || !inner || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      el.style.height = inner.offsetHeight + 28 + 'px';
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [open]);

  const stopStream = () => {
    if (streamRef.current !== null) {
      clearInterval(streamRef.current);
      streamRef.current = null;
    }
  };

  const stream = (text: string) => {
    stopStream();
    if (reduce) {
      setAnswer(text);
      return;
    }
    const words = text.split(' ');
    let i = 0;
    streamRef.current = window.setInterval(() => {
      i += 1;
      setAnswer(words.slice(0, i).join(' '));
      if (i >= words.length) stopStream();
    }, STREAM_MS);
  };

  const ask = (q: string) => {
    if (inputRef.current) inputRef.current.value = q;
    const hits = index.search(q);

    if (!hits.length) {
      emitPulse([]);
      setSources([]);
      setStatus(NO_MATCH_STATUS);
      setAnswer('');
      setOpen(true);
      setSpoken(NO_MATCH_ANSWER);
      stream(NO_MATCH_ANSWER);
      return;
    }

    const payload: NodeHit[] = hits.map((h, rank) => ({ i: h.d.i, n: h.n, rank }));
    emitPulse(payload);

    const top = hits[0]!;
    const weak = top.s < WEAK_THRESHOLD;
    setSources(
      hits.slice(0, 3).map((h) => ({
        title: h.d.f.title,
        href: '#' + h.d.f.section,
        score: (h.n * 100).toFixed(0),
      }))
    );
    setStatus((weak ? 'WEAK MATCH · ' : 'TOP MATCH · ') + hits.length + ' OF ' + index.N + ' FACTS SCORED');
    setAnswer('');
    setOpen(true);
    setSpoken((weak ? WEAK_PREFIX : '') + top.d.f.text);
    stream((weak ? WEAK_PREFIX : '') + top.d.f.text);
  };

  const closeAnswer = () => {
    stopStream();
    setOpen(false);
    setAnswer('');
    setSources([]);
    setStatus('');
    emitHits([]);
  };

  /** Live node highlighting while typing, debounced at 110ms. */
  const onInput = (e: { currentTarget: HTMLInputElement }) => {
    const q = e.currentTarget.value.trim();
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (!q) {
        emitHits([]);
        return;
      }
      emitHits(index.search(q).map((h, rank) => ({ i: h.d.i, n: h.n, rank })));
    }, 110);
  };

  const runAsk = () => {
    const q = inputRef.current?.value.trim() ?? '';
    if (q) ask(q);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') closeAnswer();
    };
    window.addEventListener('keydown', onKey);
    const off = onAskFact((title) => ask(title));
    return () => {
      window.removeEventListener('keydown', onKey);
      off();
      stopStream();
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="rk-ask">
        <div className="rk-ask__label">
          <span className="rk-ask__bullet">{hero.askBullet}</span>
          <span>
            {hero.askBefore} {FACT_COUNT} {hero.askAfter}
          </span>
        </div>

        <div className="rk-ask__box" data-rk-ask>
          <span className="rk-ask__sigil">{hero.askPrompt}</span>
          <input
            ref={inputRef}
            className="rk-ask__input"
            type="text"
            placeholder={SUGGESTIONS[0]}
            aria-label="Ask the index"
            onInput={onInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runAsk();
            }}
          />
          <button className="rk-ask__submit" type="button" data-cursor onClick={runAsk}>
            {hero.retrieve}
          </button>
        </div>

        <div className="rk-chips">
          {SUGGESTIONS.map((label) => (
            <button
              key={label}
              className="rk-chip"
              type="button"
              data-rk-chip
              data-cursor
              onClick={() => ask(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Announces the finished answer once; deviation 8. */}
      <div className="rk-sr-only" role="status" aria-live="polite">
        {spoken}
      </div>

      {/* inert while closed, so its CLOSE button is not a hidden Tab stop. */}
      <div ref={panelRef} className="rk-answer" inert={!open} aria-hidden={!open}>
        <div ref={innerRef} className="rk-answer__inner">
          <div className="rk-answer__bar">
            <span>{status}</span>
            <button
              className="rk-answer__close"
              type="button"
              data-cursor
              data-rk-close
              onClick={closeAnswer}
            >
              {hero.closeAnswer}
            </button>
          </div>
          <div className="rk-answer__body">
            <div className="rk-answer__text">
              {answer}
              <span className="rk-answer__caret" />
            </div>
            <div className="rk-answer__sources">
              {sources.map((s) => (
                <a key={s.title} href={s.href} data-cursor>
                  <span className="rk-answer__score">{s.score}</span>
                  <span>{s.title}</span>
                  <span className="rk-answer__arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
