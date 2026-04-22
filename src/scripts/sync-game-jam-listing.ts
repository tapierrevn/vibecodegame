import {
  getGameJamStatus,
  gameJamCardArticleBaseClass,
  gameJamCardBorderClasses,
  type GameJamStatus,
} from '@/lib/game-jams-status';

export type JamRange = { start: string; end: string };

function setBadgeVisibility(article: Element, status: GameJamStatus) {
  article.querySelectorAll<HTMLElement>('[data-jam-status-badge]').forEach((badge) => {
    const role = badge.getAttribute('data-jam-status-badge') as GameJamStatus | null;
    const match = role === status;
    // Use the HTML `hidden` attribute — Tailwind `hidden` + `inline-flex` both set `display` and can fight each other.
    badge.hidden = !match;
    badge.classList.toggle('jam-coming-soon-tag', match && role === 'coming_soon');
  });
}

function setCtaVisibility(article: Element, status: GameJamStatus) {
  const ctaSoon = article.querySelector<HTMLElement>('[data-jam-cta="coming_soon"]');
  const ctaPast = article.querySelector<HTMLElement>('[data-jam-cta="past"]');
  if (ctaSoon) ctaSoon.hidden = status !== 'coming_soon';
  if (ctaPast) ctaPast.hidden = status !== 'past';
}

function applyCardChrome(article: Element, status: GameJamStatus) {
  article.className = `${gameJamCardArticleBaseClass} ${gameJamCardBorderClasses[status]}`;
  setBadgeVisibility(article, status);
  setCtaVisibility(article, status);
}

export function syncGameJamListingClient(options: {
  allJams: JamRange[];
  pageStatusFilter: GameJamStatus | null;
}) {
  const now = new Date();
  let inProgress = 0;
  let comingSoon = 0;
  let past = 0;
  for (const j of options.allJams) {
    const s = getGameJamStatus(new Date(j.start), new Date(j.end), now);
    if (s === 'in_progress') inProgress++;
    else if (s === 'coming_soon') comingSoon++;
    else past++;
  }

  document.querySelectorAll('[data-jam-count]').forEach((el) => {
    const role = el.getAttribute('data-jam-count');
    if (role === 'in_progress') el.textContent = String(inProgress);
    else if (role === 'coming_soon') el.textContent = String(comingSoon);
    else if (role === 'past') el.textContent = String(past);
  });

  document.querySelectorAll('[data-game-jam-card]').forEach((article) => {
    const start = article.getAttribute('data-jam-start');
    const end = article.getAttribute('data-jam-end');
    if (!start || !end) return;
    const status = getGameJamStatus(new Date(start), new Date(end), now);
    applyCardChrome(article, status);

    if (options.pageStatusFilter && status !== options.pageStatusFilter) {
      article.classList.add('hidden');
    } else {
      article.classList.remove('hidden');
    }
  });

  document.querySelectorAll('[data-jam-status-filter-grid]').forEach((grid) => {
    const filter = grid.getAttribute('data-jam-status-filter-grid') as GameJamStatus | '' | null;
    const expected = filter && filter.length > 0 ? filter : null;
    const cards = grid.querySelectorAll('[data-game-jam-card]');
    let visible = 0;
    cards.forEach((c) => {
      if (!c.classList.contains('hidden')) visible++;
    });
    const emptyEl = grid.querySelector<HTMLElement>('[data-jam-filter-empty]');
    if (emptyEl) {
      const showEmpty = expected !== null && visible === 0;
      emptyEl.classList.toggle('hidden', !showEmpty);
    }
  });
}

type SyncPayload = {
  allJams: JamRange[];
  pageStatusFilter: GameJamStatus | null;
};

function readSyncPayload(): SyncPayload | null {
  const el = document.getElementById('jam-listing-sync-payload');
  if (!el?.textContent?.trim()) return null;
  try {
    return JSON.parse(el.textContent) as SyncPayload;
  } catch {
    return null;
  }
}

/** Re-read `#jam-listing-sync-payload` and refresh cards, counters, and status-filter empty state. */
export function runGameJamListingSyncFromDom() {
  const payload = readSyncPayload();
  if (payload) syncGameJamListingClient(payload);
}
