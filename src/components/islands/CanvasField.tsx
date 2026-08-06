/**
 * CanvasField — the hero node-link field. client:load.
 *
 * One node per fact, positioned by the prototype's deterministic hash so the
 * constellation is identical on every visit. Ported from deploy/index.html:
 * initField() at 1097, draw() at 1130, sizeCanvas() at 1087.
 *
 * Under prefers-reduced-motion the field is drawn once and left static: no
 * drift, no twinkle, no packets, no shockwave.
 */
import { useEffect, useRef } from 'react';
import { FACTS } from '../../data/facts';
import { emitAskFact, onHits, onPulse, prefersReducedMotion } from '../../lib/bus';
import type { NodeHit } from '../../lib/bus';

interface Node {
  f: (typeof FACTS)[number];
  hit: number;
  rank: number;
  ph: number;
  amp: number;
  bx: number;
  by: number;
  sx: number;
  sy: number;
  p: number;
  x: number;
  y: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  tw: number;
}

interface Packet {
  n?: Node;
  a?: Node;
  b?: Node;
  p: number;
  sp: number;
  fromCentre?: boolean;
}

/** The prototype's deterministic pseudo-random, so layout never shifts. */
const rnd = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function CanvasField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = prefersReducedMotion();
    let ctx: CanvasRenderingContext2D | null = null;
    let cw = 0;
    let ch = 0;
    let raf: number | null = null;
    let alive = true;

    let mx = -9999;
    let my = -9999;
    let scrollSmooth = 0;
    let pulse = 0;
    let lastPacket = 0;
    let nearNode: Node | null = null;

    const nodes: Node[] = FACTS.map((f, i) => {
      const ring = i % 3;
      const a = rnd(i) * Math.PI * 2;
      const r = 0.15 + ring * 0.145 + rnd(i + 91) * 0.11;
      return {
        f,
        hit: 0,
        rank: -1,
        ph: rnd(i + 41) * 6.283,
        amp: 0.004 + rnd(i + 17) * 0.007,
        bx: 0.5 + Math.cos(a) * r * 1.55,
        by: 0.5 + Math.sin(a) * r,
        sx: rnd(i + 5),
        sy: rnd(i + 61),
        p: 0,
        x: 0,
        y: 0,
      };
    });

    const stars: Star[] = [];
    for (let i = 0; i < 240; i++) {
      stars.push({
        x: rnd(i * 3 + 1),
        y: rnd(i * 3 + 2),
        z: 0.25 + rnd(i * 3 + 3) * 0.75,
        tw: rnd(i * 3 + 4) * 6.283,
      });
    }

    const links: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i]!.f.section === nodes[j]!.f.section && (i + j) % 3 === 0) links.push([i, j]);
      }
    }
    for (let i = 0; i < nodes.length - 1; i += 7) links.push([i, i + 1]);

    let packets: Packet[] = [];

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = canvas.clientWidth;
      ch = canvas.clientHeight;
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      ctx = canvas.getContext('2d');
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    const t0 = performance.now();

    const draw = (now: number) => {
      if (!alive || !ctx || !cw) {
        raf = null;
        return;
      }
      if (!reduce) raf = requestAnimationFrame(draw);

      const t = (now - t0) / 1000;
      const W = cw;
      const H = ch;
      const light = document.documentElement.dataset.theme === 'light';
      const par = Math.min(scrollSmooth * 0.05, 300);
      ctx.clearRect(0, 0, W, H);

      // nebula
      const neb: [number, number, string, number][] = [
        [0.24, 0.3, '255,74,28', 0.05],
        [0.78, 0.62, '124,231,255', 0.05],
        [0.5, 0.9, '160,120,255', 0.035],
      ];
      for (const [nx, ny, rgb, al] of neb) {
        const cx = (nx + Math.sin(t * 0.045 + nx * 9) * 0.03) * W;
        const cy = (ny + Math.cos(t * 0.037 + ny * 7) * 0.03) * H - par * 0.35;
        const rad = Math.max(W, H) * 0.42;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${rgb},${light ? al * 0.5 : al})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // starfield
      for (const s of stars) {
        const sx = s.x * W;
        const sy = (((s.y * H - par * s.z * 1.6) % (H + 60)) + H + 60) % (H + 60) - 30;
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * 1.4 + s.tw);
        const a = (light ? 0.2 : 0.42) * s.z * tw;
        ctx.fillStyle = (light ? 'rgba(20,19,26,' : 'rgba(243,241,235,') + a.toFixed(3) + ')';
        ctx.fillRect(sx, sy, s.z * 1.5, s.z * 1.5);
      }

      // node positions
      for (const n of nodes) {
        if (n.p < 1) n.p = Math.min(1, n.p + 0.02);
        const e = n.p * n.p * (3 - 2 * n.p);
        const dx = reduce ? 0 : Math.sin(t * 0.28 + n.ph) * n.amp;
        const dy = reduce ? 0 : Math.cos(t * 0.22 + n.ph * 1.3) * n.amp;
        let tx = (n.bx + dx) * W;
        let ty = (n.by + dy) * H - par;
        if (mx > -1000) {
          const ddx = mx - tx;
          const ddy = my - ty;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < 34000) {
            const f = (1 - d2 / 34000) * 0.24;
            tx += ddx * f;
            ty += ddy * f;
          }
        }
        n.x = n.sx * W * (1 - e) + tx * e;
        n.y = n.sy * H * (1 - e) + ty * e;
        if (n.hit > 0.34) n.hit = Math.max(0.34, n.hit - 0.004);
      }

      // links
      ctx.lineWidth = 1;
      for (const [i, j] of links) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const lit = Math.max(a.hit, b.hit);
        ctx.strokeStyle =
          lit > 0.04
            ? `rgba(255,74,28,${(0.1 + lit * 0.6).toFixed(3)})`
            : light
              ? 'rgba(20,19,26,.055)'
              : 'rgba(243,241,235,.07)';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // idle synapse packets
      if (!reduce && now - lastPacket > 900 && links.length) {
        lastPacket = now;
        const l = links[Math.floor(Math.random() * links.length)]!;
        packets.push({ a: nodes[l[0]]!, b: nodes[l[1]]!, p: 0, sp: 0.014 + Math.random() * 0.01 });
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const pk = packets[i]!;
        pk.p += pk.sp;
        if (pk.p >= 1) {
          packets.splice(i, 1);
          continue;
        }
        let px: number;
        let py: number;
        let col: string;
        if (pk.fromCentre && pk.n) {
          px = W * 0.5 + (pk.n.x - W * 0.5) * pk.p;
          py = H * 0.5 - par * 0.4 + (pk.n.y - (H * 0.5 - par * 0.4)) * pk.p;
          col = 'rgba(255,74,28,';
        } else if (pk.a && pk.b) {
          px = pk.a.x + (pk.b.x - pk.a.x) * pk.p;
          py = pk.a.y + (pk.b.y - pk.a.y) * pk.p;
          col = light ? 'rgba(14,90,200,' : 'rgba(124,231,255,';
        } else {
          continue;
        }
        const fade = Math.sin(pk.p * Math.PI);
        ctx.fillStyle = col + (fade * 0.85).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 1.7, 0, 6.2832);
        ctx.fill();
      }

      // query shockwave
      if (pulse > 0) {
        pulse = Math.max(0, pulse - 0.011);
        const rad = (1 - pulse) * Math.max(W, H) * 0.8;
        ctx.strokeStyle = `rgba(255,74,28,${(pulse * 0.32).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.5 - par * 0.4, rad, 0, 6.2832);
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      // nodes + hover pick
      let near: Node | null = null;
      let nearD = 20;
      const breathe = 0.5 + 0.5 * Math.sin(t * 2.4);
      for (const n of nodes) {
        const r = 1.7 + n.hit * 6.5;
        if (n.hit > 0.02) {
          const R = 30 + n.hit * 46 + breathe * 10;
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, R);
          g.addColorStop(0, `rgba(255,74,28,${(n.hit * 0.55).toFixed(3)})`);
          g.addColorStop(0.45, `rgba(255,74,28,${(n.hit * 0.16).toFixed(3)})`);
          g.addColorStop(1, 'rgba(255,74,28,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.x, n.y, R, 0, 6.2832);
          ctx.fill();
          ctx.strokeStyle = `rgba(255,74,28,${(n.hit * (0.55 - breathe * 0.35)).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 12 + breathe * 9 + n.hit * 6, 0, 6.2832);
          ctx.stroke();
        }
        const d = Math.hypot(n.x - mx, n.y - my);
        if (d < nearD) {
          nearD = d;
          near = n;
        }
        ctx.fillStyle =
          n.hit > 0.05 ? '#FF4A1C' : light ? 'rgba(20,19,26,.34)' : 'rgba(243,241,235,.36)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, 6.2832);
        ctx.fill();
        if (n.rank === 0 && n.hit > 0.3 && near !== n) {
          ctx.font = "500 10px 'IBM Plex Mono', monospace";
          ctx.fillStyle = 'rgba(255,74,28,.9)';
          ctx.fillText(n.f.title.toUpperCase(), n.x + 14, n.y + 3.5);
        }
      }

      nearNode = near;
      document.documentElement.classList.toggle('rk-on-node', !!near);

      const tip = tipRef.current;
      if (tip) {
        if (near) {
          tip.textContent = near.f.title + '  ·  CLICK TO ASK';
          tip.style.left = near.x + 'px';
          tip.style.top = near.y + 'px';
          tip.style.opacity = '1';
          ctx.strokeStyle = 'rgba(255,74,28,.7)';
          ctx.beginPath();
          ctx.arc(near.x, near.y, 9 + breathe * 4, 0, 6.2832);
          ctx.stroke();
        } else if (tip.style.opacity !== '0') {
          tip.style.opacity = '0';
        }
      }
    };

    const onResize = () => {
      sizeCanvas();
      if (reduce) draw(performance.now());
    };
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onScroll = () => {
      // The behaviours module owns the smoothed value; mirror it for parallax.
      const raw = window.scrollY || 0;
      scrollSmooth += (raw - scrollSmooth) * (reduce ? 1 : 0.11);
    };
    const onClick = (e: MouseEvent) => {
      if (!nearNode) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('a,button,input,textarea,[data-skill],[data-chip]')) return;
      emitAskFact(nearNode.f.title);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('click', onClick);

    const offHits = onHits((hits: readonly NodeHit[]) => {
      nodes.forEach((n) => {
        n.hit = 0;
        n.rank = -1;
      });
      hits.forEach((h) => {
        const n = nodes[h.i];
        if (n) {
          n.hit = Math.max(0.42, h.n * 0.85);
          n.rank = h.rank;
        }
      });
      if (reduce) draw(performance.now());
    });

    const offPulse = onPulse((hits: readonly NodeHit[]) => {
      nodes.forEach((n) => {
        n.hit = 0;
        n.rank = -1;
      });
      pulse = 1;
      hits.forEach((h) => {
        const n = nodes[h.i];
        if (n) {
          n.hit = Math.max(0.55, h.n);
          n.rank = h.rank;
          if (!reduce) {
            packets.push({ n, p: 0, sp: 0.012 + Math.random() * 0.012, fromCentre: true });
            packets.push({ n, p: 0, sp: 0.012 + Math.random() * 0.012, fromCentre: true });
          }
        }
      });
      if (reduce) draw(performance.now());
    });

    if (reduce) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onClick);
      offHits();
      offPulse();
      packets = [];
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="rk-canvas" aria-hidden="true" />
      <div ref={tipRef} className="rk-tip" aria-hidden="true" />
    </>
  );
}
