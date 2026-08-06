// Site-level metadata.
//
// The description and social copy are the strings from deploy/index.html's head
// block, which the deploy README records as deliberate additions to the raw
// Claude Design export. They are content, so they live here rather than being
// inlined in the layout.

export const SITE = {
  /** meta description, and the og/twitter description fallback. */
  description:
    'AI software engineer building agentic systems, multi-agent orchestration and LLM applications. Delhi NCR, India. Named inventor on a published Indian patent application.',

  /** Longer og:description used on the full route. */
  ogDescription:
    'Agentic systems, multi-agent orchestration, LLM applications. Ask the index — 44 facts, scored in your browser.',

  /** Shorter twitter:description. */
  twitterDescription: 'Agentic systems, multi-agent orchestration, LLM applications.',

  /** Live origin. Nothing else should hardcode the domain. */
  // origin: 'https://ritularyan.com',

  // TEMPORARY: domain not registered yet. Switch to https://ritularyan.com
  // when DNS resolves — this drives canonical, og:url and og:image.
  origin: 'https://ritularyan-com.vercel.app',
} as const;
