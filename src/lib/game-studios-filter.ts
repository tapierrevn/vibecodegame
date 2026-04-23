export function gameStudiosFilterSlugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function genreToGameStudiosPathSegment(genre: string): string {
  return `${gameStudiosFilterSlugify(genre)}-games`;
}

export function genreToGameStudiosPath(genre: string): string {
  return `/game-studios-using-AI/${genreToGameStudiosPathSegment(genre)}`;
}

export function aiToolToGameStudiosPathSegment(tool: string): string {
  return `${gameStudiosFilterSlugify(tool)}-games`;
}

export function aiToolToGameStudiosPath(tool: string): string {
  return `/game-studios-using-AI/${aiToolToGameStudiosPathSegment(tool)}`;
}

export function gameEngineToGameStudiosPathSegment(engine: string): string {
  return `${gameStudiosFilterSlugify(engine)}-games`;
}

export function gameEngineToGameStudiosPath(engine: string): string {
  return `/game-studios-using-AI/${gameEngineToGameStudiosPathSegment(engine)}`;
}

function buildUniqueSegmentToValueMap(
  values: Iterable<string>,
  segmentBuilder: (value: string) => string,
  collisionLabel: string,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const value of values) {
    const segment = segmentBuilder(value);
    const existing = map.get(segment);
    if (existing !== undefined && existing !== value) {
      throw new Error(
        `Game studios ${collisionLabel} URL collision: values "${existing}" and "${value}" both map to /game-studios-using-AI/${segment}.`,
      );
    }
    if (!map.has(segment)) {
      map.set(segment, value);
    }
  }
  return map;
}

export function buildGenreSegmentToTagMap(genres: Iterable<string>): Map<string, string> {
  return buildUniqueSegmentToValueMap(genres, genreToGameStudiosPathSegment, 'genre');
}

export function buildAiToolSegmentToTagMap(tools: Iterable<string>): Map<string, string> {
  return buildUniqueSegmentToValueMap(tools, aiToolToGameStudiosPathSegment, 'AI tool');
}

export function buildGameEngineSegmentToTagMap(engines: Iterable<string>): Map<string, string> {
  return buildUniqueSegmentToValueMap(engines, gameEngineToGameStudiosPathSegment, 'game engine');
}

export function assertFilterPathsDoNotCollideWithStudioSlugs(studioSlugs: string[], filterSegments: Iterable<string>): void {
  const filterSet = new Set(filterSegments);
  for (const slug of studioSlugs) {
    if (filterSet.has(slug)) {
      throw new Error(`Game studios route collision: studio slug "${slug}" equals a filter URL segment.`);
    }
  }
}
