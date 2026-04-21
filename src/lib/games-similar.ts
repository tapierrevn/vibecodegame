import type { CollectionEntry } from 'astro:content';

function publishedOrZero(value?: string): number {
  if (!value) return 0;
  const m = /^(\d{2})-(\d{4})$/.exec(value);
  if (!m) return 0;
  const month = Number(m[1]) - 1;
  const year = Number(m[2]);
  if (month < 0 || month > 11 || Number.isNaN(year)) return 0;
  return new Date(year, month, 1).valueOf();
}

/** Overlap count between two string arrays (exact string match). */
function overlapCount(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  return a.filter((x) => setB.has(x)).length;
}

export function getSimilarGamesByGenre(
  current: CollectionEntry<'games'>,
  all: CollectionEntry<'games'>[],
  max = 3,
): CollectionEntry<'games'>[] {
  const genres = current.data.genre;
  if (!genres.length) return [];

  return all
    .filter((g) => g.id !== current.id)
    .filter((g) => overlapCount(genres, g.data.genre) > 0)
    .sort((a, b) => {
      const oa = overlapCount(genres, a.data.genre);
      const ob = overlapCount(genres, b.data.genre);
      if (ob !== oa) return ob - oa;
      if (b.data.communityScore !== a.data.communityScore) {
        return b.data.communityScore - a.data.communityScore;
      }
      return publishedOrZero(b.data.publishedAt) - publishedOrZero(a.data.publishedAt);
    })
    .slice(0, max);
}

export function getSimilarGamesByAiTools(
  current: CollectionEntry<'games'>,
  all: CollectionEntry<'games'>[],
  max = 3,
): CollectionEntry<'games'>[] {
  const tools = current.data.aiTools;
  if (!tools.length) return [];

  return all
    .filter((g) => g.id !== current.id)
    .filter((g) => overlapCount(tools, g.data.aiTools) > 0)
    .sort((a, b) => {
      const oa = overlapCount(tools, a.data.aiTools);
      const ob = overlapCount(tools, b.data.aiTools);
      if (ob !== oa) return ob - oa;
      if (b.data.communityScore !== a.data.communityScore) {
        return b.data.communityScore - a.data.communityScore;
      }
      return publishedOrZero(b.data.publishedAt) - publishedOrZero(a.data.publishedAt);
    })
    .slice(0, max);
}

export function gameEntryToPath(entry: CollectionEntry<'games'>, locale = 'en'): string {
  return `/vibe-coded-games/${entry.id.replace(`${locale}/`, '')}`;
}
