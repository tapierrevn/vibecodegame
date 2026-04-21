/** URL helpers for games filters, e.g. /vibe-coded-games/arcades-games */
export function gamesFilterSlugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function genreSlugify(genre: string): string {
  return gamesFilterSlugify(genre);
}

export function genreToGamesPathSegment(genre: string): string {
  return `${genreSlugify(genre)}-vibe-coded-games`;
}

export function genreToGamesPath(genre: string): string {
  return `/vibe-coded-games/${genreToGamesPathSegment(genre)}`;
}

export function aiToolToGamesPathSegment(tool: string): string {
  return `${gamesFilterSlugify(tool)}-vibe-coded-games`;
}

export function aiToolToGamesPath(tool: string): string {
  return `/vibe-coded-games/${aiToolToGamesPathSegment(tool)}`;
}

export function buildGenreSegmentToTagMap(genres: Iterable<string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const genre of genres) {
    const segment = genreToGamesPathSegment(genre);
    const existing = map.get(segment);
    if (existing !== undefined && existing !== genre) {
      throw new Error(
        `Games genre URL collision: genres "${existing}" and "${genre}" both map to /vibe-coded-games/${segment}.`,
      );
    }
    if (!map.has(segment)) {
      map.set(segment, genre);
    }
  }
  return map;
}

export function assertGenrePathsDoNotCollideWithGameSlugs(
  gameSlugs: string[],
  genreSegments: Iterable<string>,
): void {
  const genreSet = new Set(genreSegments);
  for (const slug of gameSlugs) {
    if (genreSet.has(slug)) {
      throw new Error(
        `Games route collision: game slug "${slug}" equals a genre-filter URL segment.`,
      );
    }
  }
}

export function buildAiToolSegmentToTagMap(tools: Iterable<string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const tool of tools) {
    const segment = aiToolToGamesPathSegment(tool);
    const existing = map.get(segment);
    if (existing !== undefined && existing !== tool) {
      throw new Error(
        `Games AI tool URL collision: tools "${existing}" and "${tool}" both map to /vibe-coded-games/${segment}.`,
      );
    }
    if (!map.has(segment)) {
      map.set(segment, tool);
    }
  }
  return map;
}

export function assertFilterPathsDoNotCollideWithGameSlugs(
  gameSlugs: string[],
  filterSegments: Iterable<string>,
): void {
  const filterSet = new Set(filterSegments);
  for (const slug of gameSlugs) {
    if (filterSet.has(slug)) {
      throw new Error(
        `Games route collision: game slug "${slug}" equals a filter URL segment.`,
      );
    }
  }
}

