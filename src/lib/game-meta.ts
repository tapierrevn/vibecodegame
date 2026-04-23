/** Values aligned with game collection schema / MDX frontmatter. */
export type GamePlatformValue = 'Web Browser' | 'PC' | 'Console';

export type GamePlayModeValue = 'SinglePlayer' | 'MultiPlayer' | 'CoOp';

export function playModeDisplayLabel(mode: GamePlayModeValue): string {
  const map: Record<GamePlayModeValue, string> = {
    SinglePlayer: 'Single player',
    MultiPlayer: 'Multiplayer',
    CoOp: 'Co-op',
  };
  return map[mode];
}

const LEGACY_MMYYYY = /^(0[1-9]|1[0-2])-(\d{4})$/;

/** Normalize legacy MM-YYYY strings to Date (first of month) before z.coerce.date(). */
export function normalizeGamePublishedAtInput(val: unknown): unknown {
  if (val === undefined || val === null) return undefined;
  if (val instanceof Date) return val;
  if (typeof val === 'string') {
    const m = LEGACY_MMYYYY.exec(val);
    if (m) return new Date(Number(m[2]), Number(m[1]) - 1, 1);
  }
  return val;
}

/** Card / short label: MM-YYYY */
export function publishedAtToDisplayMmYyyy(date: Date | undefined): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${month}-${year}`;
}

/** Hero: "January 2026" */
export function publishedAtToLongMonthYear(date: Date | undefined): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export function publishedAtToIsoDateLocal(date: Date | undefined): string | undefined {
  if (!date || Number.isNaN(date.getTime())) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function publishedAtSortKey(date: Date | undefined): number {
  if (!date || Number.isNaN(date.getTime())) return 0;
  return date.getTime();
}

/** Lucide icon names (via Icon.astro). */
export function gamePlatformIcon(platform: GamePlatformValue): string {
  switch (platform) {
    case 'Web Browser':
      return 'globe';
    case 'PC':
      return 'monitor';
    case 'Console':
      return 'gamepad-2';
    default:
      return 'globe';
  }
}

const YT_ID = /^[\w-]{11}$/;

export function youtubeVideoIdFromUrl(input: string | undefined): string | undefined {
  if (!input?.trim()) return undefined;
  const s = input.trim();
  if (YT_ID.test(s)) return s;

  try {
    const u = s.includes('://') ? new URL(s) : new URL(`https://${s}`);

    if (u.hostname === 'youtu.be' || u.hostname.endsWith('.youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id && YT_ID.test(id) ? id : undefined;
    }

    const v = u.searchParams.get('v');
    if (v && YT_ID.test(v)) return v;

    const embed = u.pathname.match(/\/embed\/([\w-]{11})/);
    if (embed) return embed[1];

    const shorts = u.pathname.match(/\/shorts\/([\w-]{11})/);
    if (shorts) return shorts[1];
  } catch {
    /* ignore */
  }

  return undefined;
}
