import type { GameJamStatus } from '@/lib/game-jams-status';

export function yearToGameJamsPathSegment(year: number): string {
  return `game-jams-in-${year}`;
}

export function yearToGameJamsPath(year: number): string {
  return `/game-jams/${yearToGameJamsPathSegment(year)}`;
}

export function segmentToYear(segment: string): number | null {
  const match = /^game-jams-in-(\d{4})$/.exec(segment);
  if (!match) return null;
  return Number(match[1]);
}

export const GAME_JAM_STATUS_SEGMENTS: Record<GameJamStatus, string> = {
  in_progress: 'in-progress-game-jams',
  coming_soon: 'coming-soon-game-jams',
  past: 'past-game-jams',
};

export function statusToGameJamsPathSegment(status: GameJamStatus): string {
  return GAME_JAM_STATUS_SEGMENTS[status];
}

export function statusToGameJamsPath(status: GameJamStatus): string {
  return `/game-jams/${statusToGameJamsPathSegment(status)}`;
}

export function segmentToStatusFilter(segment: string): GameJamStatus | null {
  const entry = Object.entries(GAME_JAM_STATUS_SEGMENTS).find(([, s]) => s === segment);
  return entry ? (entry[0] as GameJamStatus) : null;
}

export function listGameJamReservedFilterSegments(): string[] {
  return Object.values(GAME_JAM_STATUS_SEGMENTS);
}

export function assertGameJamFilterSegmentsDoNotCollideWithEventSlugs(
  eventSlugs: string[],
  extraSegments: Iterable<string>,
): void {
  const reserved = new Set([...listGameJamReservedFilterSegments(), ...extraSegments]);
  for (const slug of eventSlugs) {
    if (reserved.has(slug)) {
      throw new Error(`Game jam route collision: event slug "${slug}" equals a reserved filter segment.`);
    }
  }
}
