/**
 * Date formatting for everything rendered at build time.
 *
 * Dates are always written in full — "10 October 2026", never "10 Oct" or
 * "10 Sept" — and in India time, because that is where the site's owner is.
 * The month names are spelled out here rather than taken from Intl, whose
 * en-GB short form writes September as "Sept".
 */

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** The parts of an instant, as seen on a clock in India (UTC+5:30, no DST). */
function inIndia(iso: string | Date) {
  const t = new Date(new Date(iso).getTime() + 330 * 60_000);
  return {
    day: t.getUTCDate(),
    month: MONTHS[t.getUTCMonth()]!,
    year: t.getUTCFullYear(),
    hh: String(t.getUTCHours()).padStart(2, '0'),
    mm: String(t.getUTCMinutes()).padStart(2, '0'),
  };
}

/** "10 October 2026" */
export function formatDate(iso: string | Date): string {
  const d = inIndia(iso);
  return `${d.day} ${d.month} ${d.year}`;
}

/** "October 2026", from a "2026-10" month key. */
export function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1] ?? ''} ${y}`;
}

/** The calendar year in India, for the copyright line. */
export function yearInIndia(iso: string | Date): number {
  return inIndia(iso).year;
}

/** "20 October 2026, 06:17 India Standard Time" */
export function formatStamp(iso: string | Date): string {
  const d = inIndia(iso);
  return `${d.day} ${d.month} ${d.year}, ${d.hh}:${d.mm} India Standard Time`;
}
