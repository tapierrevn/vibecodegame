/**
 * Screenshots for game detail pages live under `public/game/{slug}/`.
 * Supported: .png, .jpg, .jpeg, .webp (case-insensitive). Sorted alphabetically.
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

export function listGameGalleryPublicUrls(slug: string): string[] {
  const dir = path.join(process.cwd(), 'public', 'game', slug);
  if (!existsSync(dir)) return [];

  const files = readdirSync(dir)
    .filter((name) => IMAGE_EXT.test(name) && !name.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  return files.map((file) => `/game/${slug}/${file}`);
}
