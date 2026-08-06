/**
 * The `/` behaviours bundle. Loaded only from src/pages/index.astro, so nothing
 * here can ever reach /fast.
 *
 * Thirteen of the fifteen behaviours live here; CanvasField and AskIndex are
 * React islands, and ThemeToggle plus the clock are the sanctioned inline
 * scripts in BaseLayout (they have to work on /fast too).
 *
 * Every timing, easing and magic number is the prototype's. Line references are
 * to deploy/index.html.
 */

const reduce = !!(
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);
const finePointer = !!(
  window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches
);

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

/** Grapheme-aware split, so Devanagari conjuncts are never broken apart. */
function graphemes(str: string): string[] {
  try {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const seg = new (Intl as unknown as { Segmenter: typeof Intl.Segmenter }).Segmenter('hi', {
        granularity: 'grapheme',
      });
      return Array.from(seg.segment(str), (s) => s.segment);
    }
  } catch {
    /* fall through */
  }
  return Array.from(str);
}

/* ------------------------------------------------------------ IntroLoader ---- */
/* The overlay dismisses itself in CSS; this only decorates it. runLoader() at
 * 1275, sizeWarp() at 1265. */

function introLoader(): void {
  const root = document.querySelector<HTMLElement>('[data-loader]');
  if (!root) return;

  const dur = reduce ? 350 : 1700;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-loader-warp]');
  const bar = root.querySelector<HTMLElement>('[data-loader-bar]');
  const count = root.querySelector<HTMLElement>('[data-loader-count]');
  const ticker = root.querySelector<HTMLElement>('[data-loader-ticker]');
  const nameEl = root.querySelector<HTMLElement>('[data-loader-name]');
  const skip = root.querySelector<HTMLElement>('[data-loader-skip]');

  // Dismiss immediately if the visitor takes the fast path, so the navigation
  // is not competing with an animating overlay.
  skip?.addEventListener('click', () => root.classList.add('rk-loader--gone'));

  let wctx: CanvasRenderingContext2D | null = null;
  let ww = 0;
  let wh = 0;
  const sizeWarp = () => {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ww = canvas.clientWidth;
    wh = canvas.clientHeight;
    canvas.width = Math.floor(ww * dpr);
    canvas.height = Math.floor(wh * dpr);
    wctx = canvas.getContext('2d');
    wctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  sizeWarp();

  const streaks = Array.from({ length: 90 }, () => ({
    a: Math.random() * 6.2832,
    r: Math.random(),
    sp: 0.4 + Math.random() * 1.4,
    w: 0.5 + Math.random() * 0.9,
  }));

  // Split the wordmark into graphemes for the staggered reveal.
  let glyphs: HTMLElement[] = [];
  if (nameEl) {
    const txt = nameEl.textContent ?? '';
    nameEl.textContent = '';
    graphemes(txt).forEach((ch) => {
      const sp = document.createElement('span');
      sp.textContent = ch === ' ' ? ' ' : ch;
      sp.style.cssText = 'display:inline-block; opacity:0; will-change:transform,opacity';
      nameEl.appendChild(sp);
      glyphs.push(sp);
    });
  }

  const t0 = performance.now();
  let raf: number | null = null;

  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / dur);
    const ease = 1 - Math.pow(1 - p, 2.4);

    if (wctx && ww) {
      const ctx = wctx;
      ctx.fillStyle = 'rgba(6,6,10,.34)';
      ctx.fillRect(0, 0, ww, wh);
      const cx = ww / 2;
      const cy = wh / 2;
      const speed = (1 - ease) * 0.055 + 0.001;
      const maxR = Math.hypot(cx, cy);
      for (const s of streaks) {
        s.r += speed * s.sp;
        if (s.r > 1) {
          s.r -= 1;
          s.a = Math.random() * 6.2832;
        }
        const r1 = s.r * maxR;
        const r2 = Math.max(0, r1 - speed * s.sp * maxR * 7);
        const al = Math.min(1, s.r * 1.5) * (0.25 + (1 - ease) * 0.6);
        ctx.strokeStyle =
          s.sp > 1.4 ? `rgba(255,74,28,${al.toFixed(3)})` : `rgba(200,225,245,${(al * 0.75).toFixed(3)})`;
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s.a) * r2, cy + Math.sin(s.a) * r2);
        ctx.lineTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1);
        ctx.stroke();
      }
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
      cg.addColorStop(0, `rgba(255,74,28,${(0.14 + ease * 0.1).toFixed(3)})`);
      cg.addColorStop(1, 'rgba(255,74,28,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, 6.2832);
      ctx.fill();
    }

    if (bar) bar.style.right = ((1 - ease) * 100).toFixed(1) + '%';
    if (count) count.textContent = pad(Math.round(ease * 100)) + '%';
    if (ticker) ticker.textContent = p < 1 ? 'building the index' : 'ready';

    glyphs.forEach((g, i) => {
      const gp = Math.max(0, Math.min(1, p * 1.5 - i * 0.06));
      g.style.opacity = String(gp);
      g.style.transform = `translateY(${((1 - gp) * 26).toFixed(1)}px)`;
      g.style.filter = `blur(${((1 - gp) * 8).toFixed(1)}px)`;
    });

    if (p < 1) {
      raf = requestAnimationFrame(step);
      return;
    }
    raf = null;
    // Belt and braces: the CSS animation already hides it.
    root.classList.add('rk-loader--gone');
  };

  window.addEventListener('resize', sizeWarp);
  raf = requestAnimationFrame(step);

  // If the tab is hidden the rAF loop stalls; make sure we never strand anyone.
  window.setTimeout(() => {
    if (raf) cancelAnimationFrame(raf);
    root.classList.add('rk-loader--gone');
  }, dur + 900);
}

/* ----------------------------------------------------------- CustomCursor ---- */
/* Scoped to (hover:hover) and (pointer:fine) exactly as the prototype scopes it.
 * Do not widen. initCursor() at 777, setCursorState() at 819. */

function customCursor(): void {
  if (!finePointer) return;

  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  const fill = document.querySelector<HTMLElement>('[data-cursor-fill]');
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const lab = document.querySelector<HTMLElement>('[data-cursor-label]');
  if (!ring || !dot) return;

  document.documentElement.classList.add('rk-cursor-on');
  ring.style.opacity = '1';
  dot.style.opacity = '1';

  let mx = -9999;
  let my = -9999;
  let rx = 0;
  let ry = 0;
  let magnet: HTMLElement | null = null;

  const labelFor = (el: HTMLElement): string => {
    if (el.matches('input')) return 'type';
    if (el.matches('[data-skill]')) return 'pin';
    const href = el.getAttribute?.('href');
    if (href?.startsWith('mailto:')) return 'write ↗';
    if (href?.startsWith('tel:')) return 'call ↗';
    if (href?.startsWith('#')) return 'jump ↓';
    if (href) return 'open ↗';
    return '';
  };

  const setState = (label: string, big: boolean) => {
    const onNode = document.documentElement.classList.contains('rk-on-node');
    const size = onNode ? 54 : big ? 44 : 28;
    ring.style.width = size + 'px';
    ring.style.height = size + 'px';
    ring.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
    if (fill) {
      fill.style.background = onNode
        ? 'rgba(255,74,28,.2)'
        : big
          ? 'rgba(255,74,28,.1)'
          : 'transparent';
      fill.style.opacity = onNode || big ? '0.9' : '0.4';
    }
    const d = onNode ? 3 : 5;
    dot.style.width = d + 'px';
    dot.style.height = d + 'px';
    dot.style.margin = `${-d / 2}px 0 0 ${-d / 2}px`;
    const text = onNode ? 'ask this fact' : label;
    if (lab) {
      lab.textContent = (text || '').toUpperCase();
      lab.style.opacity = text ? '1' : '0';
    }
  };

  const loop = () => {
    requestAnimationFrame(loop);
    if (mx < -1000) return;
    let tx = mx;
    let ty = my;
    if (magnet) {
      const r = magnet.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = mx + (cx - mx) * 0.34;
      ty = my + (cy - my) * 0.34;
    }
    rx += (tx - rx) * 0.19;
    ry += (ty - ry) * 0.19;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
    if (lab) lab.style.transform = `translate3d(${(rx + 20).toFixed(1)}px,${(ry + 15).toFixed(1)}px,0)`;
  };
  loop();

  window.addEventListener(
    'mousemove',
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    },
    { passive: true }
  );

  document.addEventListener('mouseover', (e) => {
    const hit = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      'a,button,[data-cursor],input'
    );
    magnet = hit && hit.matches('button,[data-mark],[data-skill]') ? hit : null;
    setState(hit ? hit.dataset.cursorLabel || labelFor(hit) : '', !!hit);
  });
}

/* --------------------------------------------------------- HeroTypewriter ---- */
/* startTyper() at 847. Under reduced motion the first line is shown statically. */

function heroTypewriter(lines: readonly string[]): void {
  const el = document.querySelector<HTMLElement>('[data-typewriter]');
  if (!el || !lines.length) return;
  if (reduce) {
    el.textContent = lines[0]!;
    return;
  }
  let li = 0;
  let ci = 0;
  let del = false;
  const run = () => {
    const full = lines[li]!;
    ci += del ? -1 : 1;
    el.textContent = full.slice(0, ci);
    let wait = del ? 16 : 30 + Math.random() * 26;
    if (!del && ci >= full.length) {
      del = true;
      wait = 2400;
    } else if (del && ci <= 0) {
      del = false;
      li = (li + 1) % lines.length;
      wait = 380;
    }
    window.setTimeout(run, wait);
  };
  window.setTimeout(run, 900);
}

/* ------------------------------------ ScrollProgress + H1Parallax (one loop) -- */
/* startScrollTick() at 874. One smoothed value drives both, as in the prototype. */

function scrollDriven(): void {
  const prog = document.querySelector<HTMLElement>('[data-progress]');
  const parallax = Array.from(document.querySelectorAll<HTMLElement>('[data-par]'));
  let smooth = 0;

  const tick = () => {
    requestAnimationFrame(tick);
    const y = window.scrollY || 0;
    smooth += (y - smooth) * (reduce ? 1 : 0.11);
    if (Math.abs(y - smooth) < 0.05) smooth = y;

    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) {
      prog.style.width = (h > 0 ? Math.max(0, Math.min(100, (smooth / h) * 100)) : 0).toFixed(2) + '%';
    }

    for (const el of parallax) {
      const f = parseFloat(el.dataset.par ?? '0') || 0;
      const top = el.getBoundingClientRect().top + smooth;
      el.style.transform = `translate3d(0,${((smooth - top) * f).toFixed(2)}px,0)`;
    }
  };
  tick();
}

/* ----------------------------------- RevealOnScroll + counters + bars + spine -- */
/* initReveal() at 1400, countUp() at 1441, splitGlyphs() at 1362, animGlyphs() at 1381. */

function splitGlyphs(): void {
  document.querySelectorAll<HTMLElement>('[data-glyphs]').forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    if (el.dataset.glyphs === 'line') {
      const lines = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = lines
        .map(
          (l) =>
            '<span style="display:block; overflow:hidden"><span data-g style="display:block; will-change:transform,opacity">' +
            l +
            '</span></span>'
        )
        .join('');
    } else {
      const parts = graphemes((el.textContent ?? '').trim());
      el.innerHTML = parts
        .map(
          (ch) =>
            '<span data-g style="display:inline-block; will-change:transform,opacity">' +
            (ch === ' ' ? ' ' : ch) +
            '</span>'
        )
        .join('');
    }
  });
}

function animGlyphs(el: Element | null, show: boolean): void {
  if (!el) return;
  el.querySelectorAll<HTMLElement>('[data-g]').forEach((g, i) => {
    if (reduce) {
      g.style.opacity = '1';
      g.style.transform = 'none';
      g.style.filter = 'none';
      return;
    }
    g.style.transition = 'none';
    g.style.opacity = '0';
    g.style.transform = 'translateY(34%)';
    g.style.filter = 'blur(8px)';
    if (!show) return;
    window.setTimeout(() => {
      g.style.transition =
        'opacity .8s cubic-bezier(.16,.9,.24,1), transform .95s cubic-bezier(.16,.9,.24,1), filter .8s cubic-bezier(.16,.9,.24,1)';
      g.style.opacity = '1';
      g.style.transform = 'none';
      g.style.filter = 'none';
    }, 40 + i * 52);
  });
}

function countUp(el: HTMLElement): void {
  if (reduce || el.dataset.done) return;
  el.dataset.done = '1';
  const target = parseInt(el.dataset.count ?? '0', 10) || 0;
  const suffix = el.dataset.suffix ?? '';
  const t0 = performance.now();
  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / 1000);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * e) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function reveal(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!els.length) return;

  const hide = (el: HTMLElement) => {
    if (reduce) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition =
      'opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1)';
    el.querySelectorAll<HTMLElement>('[data-bar]').forEach((b) => {
      b.style.transform = 'scaleX(0)';
    });
    el.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => {
      delete c.dataset.done;
      c.textContent = '0' + (c.dataset.suffix ?? '');
    });
    el.querySelectorAll<HTMLElement>('[data-spine]').forEach((s) => {
      s.style.transform = 'scaleY(0)';
    });
    el.querySelectorAll<HTMLElement>('[data-node]').forEach((n) => {
      n.style.transition = 'none';
      n.style.opacity = '0';
      n.style.transform = 'translateY(18px)';
    });
    el.querySelectorAll('[data-glyphs]').forEach((g) => animGlyphs(g, false));
  };

  const vh = window.innerHeight;
  els.forEach((el) => {
    if (el.getBoundingClientRect().top > vh * 0.9) hide(el);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        const el = en.target as HTMLElement;
        if (en.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.querySelectorAll<HTMLElement>('[data-bar]').forEach((b, i) =>
            window.setTimeout(() => {
              b.style.transform = 'scaleX(1)';
            }, 130 + i * 95)
          );
          el.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => countUp(c));
          el.querySelectorAll<HTMLElement>('[data-spine]').forEach((s) => {
            s.style.transform = 'scaleY(1)';
          });
          el.querySelectorAll<HTMLElement>('[data-node]').forEach((n, i) =>
            window.setTimeout(() => {
              n.style.transition =
                'opacity .7s cubic-bezier(.2,.8,.2,1), transform .7s cubic-bezier(.2,.8,.2,1)';
              n.style.opacity = '1';
              n.style.transform = 'none';
            }, 140 + i * 150)
          );
          el.querySelectorAll('[data-glyphs]').forEach((g) => animGlyphs(g, true));
        } else if (en.boundingClientRect.top > 0 || en.boundingClientRect.bottom < 0) {
          hide(el);
          if (el.id === 'stack') setPin(null);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------- CardTilt3D ---- */
/* initTilt() at 895. Hover-capable fine pointers only, and never under reduce. */

function cardTilt(): void {
  if (reduce || !finePointer) return;
  const grid = document.querySelector<HTMLElement>('[data-rk-grid]');
  if (!grid || grid.dataset.tilted) return;
  grid.dataset.tilted = '1';
  grid.style.perspective = '1100px';

  grid.addEventListener('mousemove', (e) => {
    const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-tilt]');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transition = 'background-color .25s, opacity .3s, filter .3s, box-shadow .35s';
    card.style.transform = `perspective(1100px) rotateY(${(px * 7).toFixed(2)}deg) rotateX(${(-py * 7).toFixed(2)}deg) translateZ(14px)`;
    card.style.boxShadow = '0 26px 60px -30px rgba(0,0,0,.85)';
    card.style.zIndex = '3';
  });

  grid.addEventListener('mouseout', (e) => {
    const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-tilt]');
    if (!card || card.contains(e.relatedTarget as Node)) return;
    card.style.transition =
      'background-color .25s, opacity .3s, filter .3s, transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s';
    card.style.transform = '';
    card.style.boxShadow = '';
    card.style.zIndex = '';
  });
}

/* ------------------------------------------------------------ StackFilter ---- */
/* applyFilter() at 1457, setPin() at 1479, initStack() at 1491. */

let pinned: string | null = null;

function applyFilter(key: string | null): number {
  const grid = document.querySelector<HTMLElement>('[data-rk-grid]');
  let count = 0;
  if (grid) {
    Array.from(grid.children).forEach((child) => {
      const card = child as HTMLElement;
      const has = !key || (card.dataset.skills ?? '').split(' ').indexOf(key) !== -1;
      if (key && has) count++;
      card.style.opacity = has ? '1' : '0.16';
      card.style.filter = has ? 'none' : 'saturate(0)';
    });
  }
  document.querySelectorAll<HTMLElement>('[data-chip]').forEach((c) => {
    const on = !!key && c.dataset.chip === key;
    c.style.borderColor = on ? 'var(--rk-acc)' : '';
    c.style.color = on ? 'var(--rk-acc)' : '';
  });
  document.querySelectorAll<HTMLElement>('[data-skill]').forEach((s) => {
    const on = !!key && s.dataset.skill === key;
    s.style.borderColor = on ? 'var(--rk-acc)' : '';
    s.style.color = on ? 'var(--rk-acc)' : '';
  });
  return count;
}

function setPin(key: string | null): void {
  pinned = key;
  const count = applyFilter(key);
  const box = document.querySelector<HTMLElement>('[data-filter-badge]');
  if (!box) return;
  if (!key) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }
  box.style.display = 'block';
  box.innerHTML =
    '<div class="rk-pin"><span>PINNED · ' +
    key.toUpperCase() +
    ' · ' +
    count +
    ' PROJECT' +
    (count === 1 ? '' : 'S') +
    '</span><span data-clear>✕</span></div>';
  box.querySelector('[data-clear]')?.addEventListener('click', () => setPin(null));
}

function stackFilter(): void {
  const stack = document.querySelector<HTMLElement>('[data-rk-stack]');
  if (!stack || stack.dataset.wired) return;
  stack.dataset.wired = '1';
  stack.addEventListener('mouseover', (e) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-skill]');
    if (el?.dataset.skill) applyFilter(el.dataset.skill);
  });
  stack.addEventListener('mouseleave', () => applyFilter(pinned));
  stack.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-skill]');
    if (!el?.dataset.skill) return;
    setPin(pinned === el.dataset.skill ? null : el.dataset.skill);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setPin(null);
  });
}

/* ------------------------------------------------------------------- boot ---- */

export function boot(typewriterLines: readonly string[]): void {
  introLoader();
  customCursor();
  heroTypewriter(typewriterLines);
  scrollDriven();
  // The prototype defers these by 60ms so first paint is not competing.
  window.setTimeout(() => {
    splitGlyphs();
    animGlyphs(document.querySelector("[data-glyphs='line']"), true);
    reveal();
    stackFilter();
    cardTilt();
  }, 60);
}
