// AUTO-EXTRACTED from deploy/index.html. Do not hand-edit.
// Retrieval configuration: stop words and the hero suggestion chips.
// Source of truth: deploy/index.html (the verified render of the design
// prototype). Regenerate rather than retype.

/**
 * Stop words stripped during tokenisation. Kept as one space-separated string
 * so it stays diffable against the prototype's single-line literal.
 */
export const STOP_WORDS = "a an the is are was were be been being of for to in on at by with and or but do does did his her he she they it i you what which who whom how why when where can could would should has have had about from as that this these those any some more most me my mine your";

export const STOP = new Set<string>(STOP_WORDS.split(' '));

/** Hero chips. The first is also the search input's placeholder. */
export const SUGGESTIONS: readonly string[] = [
  "Has he shipped anything real?",
  "What's the patent about?",
  "Does he know LangGraph?",
  "Why should I hire him?",
  "What are his weaknesses?",
  "How was this site built?",
];
