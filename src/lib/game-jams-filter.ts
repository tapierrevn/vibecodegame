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
