/**
 * Slug / anchor helpers aligned with {@link src/components/glossary/GlossaryInteractions.astro}
 * so FAQ “Related terms” links match glossary `h3` ids (`term-${slugify(headingText)}`).
 */
export function glossarySlugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** FAQ label → glossary H3 text when the visible label is shorter than the heading (parentheticals). */
const TERM_TO_HEADING: Record<string, string> = {
  LoRA: 'LoRA (Low-Rank Adaptation)',
};

/**
 * Fragment id for a glossary term (e.g. `term-prompt-engineering`).
 */
export function glossaryTermAnchorId(termLabel: string): string {
  const trimmed = termLabel.trim();
  const heading = TERM_TO_HEADING[trimmed] ?? trimmed;
  return `term-${glossarySlugify(heading)}`;
}

export const GLOSSARY_PAGE_PATH = '/game-vibe-coding-glossary';

/** Persists intended #term-… when view transitions drop the URL fragment (see Astro ClientRouter + hash). */
export const GLOSSARY_HASH_STORAGE_KEY = 'vibecode-glossary-hash';
