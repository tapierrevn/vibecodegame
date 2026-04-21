export function developersFilterSlugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function genreToDevelopersPathSegment(genre: string): string {
  return `developers-vibe-coding-${developersFilterSlugify(genre)}-games`;
}

export function genreToDevelopersPath(genre: string): string {
  return `/developers/${genreToDevelopersPathSegment(genre)}`;
}

export function aiToolToDevelopersPathSegment(tool: string): string {
  return `developers-vibe-coding-games-with-${developersFilterSlugify(tool)}`;
}

export function aiToolToDevelopersPath(tool: string): string {
  return `/developers/${aiToolToDevelopersPathSegment(tool)}`;
}

export function buildGenreSegmentToTagMap(genres: Iterable<string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const genre of genres) {
    const segment = genreToDevelopersPathSegment(genre);
    const existing = map.get(segment);
    if (existing !== undefined && existing !== genre) {
      throw new Error(
        `Developers genre URL collision: genres "${existing}" and "${genre}" both map to /developers/${segment}.`,
      );
    }
    if (!map.has(segment)) {
      map.set(segment, genre);
    }
  }
  return map;
}

export function buildAiToolSegmentToTagMap(tools: Iterable<string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const tool of tools) {
    const segment = aiToolToDevelopersPathSegment(tool);
    const existing = map.get(segment);
    if (existing !== undefined && existing !== tool) {
      throw new Error(
        `Developers AI tool URL collision: tools "${existing}" and "${tool}" both map to /developers/${segment}.`,
      );
    }
    if (!map.has(segment)) {
      map.set(segment, tool);
    }
  }
  return map;
}

export function assertFilterPathsDoNotCollideWithDeveloperSlugs(
  developerSlugs: string[],
  filterSegments: Iterable<string>,
): void {
  const filterSet = new Set(filterSegments);
  for (const slug of developerSlugs) {
    if (filterSet.has(slug)) {
      throw new Error(`Developers route collision: developer slug "${slug}" equals a filter URL segment.`);
    }
  }
}
