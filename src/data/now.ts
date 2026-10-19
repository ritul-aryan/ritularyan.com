// The "Now" log: what Ritul is doing, newest first. This file is the source
// of truth — add a line at the top when something changes, and keep 3 to 6
// entries. `month` is YYYY-MM; it renders as "October 2026".
// `npm run verify:content` checks the format and the order.
//
// Keep entries free of client or institution names (see BUILD-RULES.md).

import type { NowEntry } from './types';

export const NOW_LOG: readonly NowEntry[] = [
  {
    month: "2026-10",
    text: "Building a separate internal AI product at Akin, not yet public.",
  },
  {
    month: "2026-10",
    text: "Trained NanoGLM-Flash, a 72M-parameter multimodal language model, with a Zero-Critic GRPO pipeline.",
  },
  {
    month: "2026-10",
    text: "Reviving the eldercare robot from the patent: documentation first, then rebuilding the software.",
  },
  {
    month: "2026-09",
    text: "Delivered the SAGE prototype at Akin; the project is paused for higher-priority work.",
  },
  {
    month: "2026-08",
    text: "Built a real-time DDoS detection dashboard.",
  },
];
