/** URL-safe piece derived from a tag (no `blog-` prefix). */
export function tagSlugify(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Full first path segment under `/blog/`, e.g. `javascript` → `blog-javascript`. */
export function tagToBlogPathSegment(tag: string): string {
  return `blog-${tagSlugify(tag)}`;
}

export function tagToBlogPath(tag: string): string {
  return `/blog/${tagToBlogPathSegment(tag)}`;
}

/**
 * Map `/blog/{segment}` segment → canonical tag string from frontmatter.
 * Throws if two tags normalize to the same segment.
 */
export function buildSegmentToTagMap(tags: Iterable<string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const tag of tags) {
    const seg = tagToBlogPathSegment(tag);
    const existing = map.get(seg);
    if (existing !== undefined && existing !== tag) {
      throw new Error(
        `Blog tag URL collision: tags "${existing}" and "${tag}" both map to /blog/${seg}. Use distinct tag strings after normalization.`,
      );
    }
    if (!map.has(seg)) {
      map.set(seg, tag);
    }
  }
  return map;
}

export function assertTagPathsDoNotCollideWithPostSlugs(
  postSlugs: string[],
  tagSegments: Iterable<string>,
): void {
  const tagSet = new Set(tagSegments);
  for (const slug of postSlugs) {
    if (tagSet.has(slug)) {
      throw new Error(
        `Blog route collision: post slug "${slug}" equals a tag filter URL segment. Rename the post file or change the tag.`,
      );
    }
  }
}
