/**
 * sitemap.xml for the two routes. `lastmod` is the build date, which is
 * honest: the daily rebuild refreshes the project feed on both pages.
 */
import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { BUILT_AT } from '../lib/build-info';

const ROUTES = ['/', '/fast'];

export const GET: APIRoute = () => {
  const lastmod = BUILT_AT.toISOString().slice(0, 10);
  const urls = ROUTES.map(
    (path) =>
      `  <url><loc>${new URL(path, SITE.origin).href}</loc><lastmod>${lastmod}</lastmod></url>`
  ).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
