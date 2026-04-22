export type GameJamStatus = 'coming_soon' | 'in_progress' | 'past';

/** Matches GameJamCard rules: coming soon before start, in progress inclusive of start/end days, past after end. */
export function getGameJamStatus(startDate: Date, endDate: Date, now: Date = new Date()): GameJamStatus {
  if (startDate > now) return 'coming_soon';
  if (startDate <= now && endDate >= now) return 'in_progress';
  return 'past';
}

/** Border + ring classes on listing cards (Tailwind). */
export const gameJamCardBorderClasses: Record<GameJamStatus, string> = {
  coming_soon: 'border-violet-500/60 ring-violet-500/30 hover:border-violet-500',
  in_progress: 'border-emerald-500/60 ring-emerald-500/30 hover:border-emerald-500',
  past: 'border-slate-400/70 ring-slate-400/30 hover:border-slate-500',
};

export const gameJamCardArticleBaseClass =
  'jam-game-card group h-full rounded-lg border bg-background p-4 ring-1 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md';
