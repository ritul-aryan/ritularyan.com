/**
 * robots.txt, generated so the Sitemap line is built from the single origin
 * constant in src/data/site.ts rather than hardcoding the domain.
 */
import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', SITE.origin).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
