/**
 * Glossary DOM enhancement + deep-link scroll. Loaded from BaseLayout so it runs on every
 * route (FAQ-first visits never load GlossaryInteractions.astro’s module otherwise).
 */
import { GLOSSARY_HASH_STORAGE_KEY } from '@/lib/glossary-anchors';

/** Hero subtitle under the main glossary title — not a term; no copy-link control. */
const GLOSSARY_INTRO_SUBTITLE_HEADING_ID = 'term-for-game-developers-building-with-ai';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function smoothScrollToY(targetY: number, durationMs = 850) {
  const startY = window.scrollY;
  const delta = targetY - startY;
  if (Math.abs(delta) < 2) {
    window.scrollTo({ top: targetY, left: 0, behavior: 'auto' });
    return;
  }

  const startTime = performance.now();
  const easeInOutQuint = (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

  const tick = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = easeInOutQuint(progress);
    window.scrollTo(0, startY + delta * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function scrollToHeading(target: HTMLElement, instant = false) {
  if (!target.id) return;
  const headerOffset = Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '72',
    10,
  );
  const extraOffset = 72;
  const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset - extraOffset;
  const y = Math.max(targetY, 0);
  if (instant) {
    window.scrollTo({ top: y, left: 0, behavior: 'auto' });
  } else {
    smoothScrollToY(y);
  }
  try {
    history.replaceState(null, '', `#${target.id}`);
  } catch {
    /* ignored */
  }
}

function hashFragmentId(): string | null {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return null;
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
}

/** Visible term title only (ignores appended copy-link control). */
function termHeadingPlainTitle(heading: HTMLElement): string {
  const clone = heading.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.glossary-term-copy-btn').forEach((el) => el.remove());
  return (clone.textContent || '').trim();
}

function termUrlForHeading(heading: HTMLElement): string {
  const url = new URL(window.location.href);
  url.hash = heading.id;
  return url.href;
}

function attachTermCopyButtons(article: HTMLElement) {
  article.querySelectorAll('h3').forEach((node) => {
    const heading = node as HTMLElement;
    if (!heading.id) return;
    if (heading.id === GLOSSARY_INTRO_SUBTITLE_HEADING_ID) return;
    if (heading.querySelector(':scope > .glossary-term-copy-btn')) return;
    heading.classList.add('glossary-term-heading');

    const plainTitle = termHeadingPlainTitle(heading).slice(0, 120) || 'this term';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'glossary-term-copy-btn';
    btn.setAttribute('aria-label', `Copy link to ${plainTitle}`);
    btn.title = 'Copy link to this term';

    btn.innerHTML =
      '<svg class="glossary-term-copy-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />' +
      '</svg>' +
      '<svg class="glossary-term-copy-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />' +
      '</svg>';

    const copyIcon = btn.querySelector('.glossary-term-copy-icon');
    const checkIcon = btn.querySelector('.glossary-term-copy-check');
    if (checkIcon) checkIcon.classList.add('glossary-term-copy-check-hidden');

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = termUrlForHeading(heading);
      try {
        await navigator.clipboard.writeText(url);
        if (copyIcon && checkIcon) {
          copyIcon.classList.add('glossary-term-copy-icon-hidden');
          checkIcon.classList.remove('glossary-term-copy-check-hidden');
          window.setTimeout(() => {
            copyIcon.classList.remove('glossary-term-copy-icon-hidden');
            checkIcon.classList.add('glossary-term-copy-check-hidden');
          }, 2000);
        }
      } catch {
        /* clipboard unavailable */
      }
    });

    heading.appendChild(btn);
  });
}

/** Match FAQ / deep-link ids (`term-…`) — must run before scrolling (SSR headings may use shorter ids). */
function assignTermHeadingIds(article: HTMLElement) {
  const termHeadings = Array.from(article.querySelectorAll('h3'));
  termHeadings.forEach((heading) => {
    const title = termHeadingPlainTitle(heading);
    if (!title) return;
    const fullKey = slugify(title);
    heading.id = `term-${fullKey}`;
  });
  attachTermCopyButtons(article);
}

function scrollGlossaryToHash() {
  const article = document.querySelector<HTMLElement>('[data-glossary-root]');
  if (!article) return;
  assignTermHeadingIds(article);

  let storageId: string | null = null;
  try {
    storageId = sessionStorage.getItem(GLOSSARY_HASH_STORAGE_KEY);
  } catch {
    /* ignored */
  }
  const hashId = hashFragmentId();
  const candidateIds = [...new Set([hashId, storageId].filter((x): x is string => Boolean(x)))];
  if (!candidateIds.length) return;

  for (const id of candidateIds) {
    const target = document.getElementById(id);
    if (target && article.contains(target)) {
      try {
        sessionStorage.removeItem(GLOSSARY_HASH_STORAGE_KEY);
      } catch {
        /* ignored */
      }
      try {
        if (!window.location.hash || decodeURIComponent(window.location.hash.slice(1)) !== id) {
          history.replaceState(null, '', `#${id}`);
        }
      } catch {
        history.replaceState(null, '', `#${id}`);
      }
      scrollToHeading(target, true);
      break;
    }
  }
}

let glossaryScrollRetryHandles: number[] = [];

function formatInPracticeQuotes() {
  const article = document.querySelector<HTMLElement>('[data-glossary-root]');
  if (!article) return;
  if (article.dataset.glossaryEnhanced === 'true') {
    assignTermHeadingIds(article);
    return;
  }
  article.dataset.glossaryEnhanced = 'true';

  const legendIntro = Array.from(article.querySelectorAll('p')).find(
    (p) => (p.textContent || '').trim().toLowerCase() === 'terms are tagged by type and level:',
  );
  if (legendIntro) {
    let cursor = legendIntro.nextElementSibling as HTMLElement | null;
    while (cursor && cursor.tagName === 'TABLE') {
      const next = cursor.nextElementSibling as HTMLElement | null;
      cursor.remove();
      cursor = next;
    }
    legendIntro.remove();
  }

  const children = Array.from(article.children) as HTMLElement[];
  const categoryHeadings = children.filter((el) => el.tagName === 'H2');
  categoryHeadings.forEach((heading, categoryIdx) => {
    if ((heading.textContent || '').trim().toLowerCase() === 'alphabetical index') return;

    const sectionEndMarker = categoryHeadings[categoryIdx + 1] ?? null;
    const sectionNodes: HTMLElement[] = [];
    for (let i = children.indexOf(heading) + 1; i < children.length; i++) {
      const node = children[i];
      if (sectionEndMarker && node === sectionEndMarker) break;
      sectionNodes.push(node);
    }

    const termBlocks: { title: string; nodes: HTMLElement[] }[] = [];
    for (let i = 0; i < sectionNodes.length; i++) {
      if (sectionNodes[i].tagName !== 'H3') continue;
      const block: HTMLElement[] = [sectionNodes[i]];
      let j = i + 1;
      while (j < sectionNodes.length && sectionNodes[j].tagName !== 'H3') {
        block.push(sectionNodes[j]);
        j++;
      }
      termBlocks.push({
        title: (sectionNodes[i].textContent || '').trim().toLowerCase(),
        nodes: block,
      });
      i = j - 1;
    }

    if (!termBlocks.length) return;
    const sortedBlocks = [...termBlocks].sort((a, b) => a.title.localeCompare(b.title));
    sortedBlocks.forEach((block) => {
      block.nodes.forEach((node) => {
        if (sectionEndMarker) {
          article.insertBefore(node, sectionEndMarker);
        } else {
          article.appendChild(node);
        }
      });
    });
  });

  const termAnchors = new Map<string, HTMLElement>();
  const categoryAnchors = new Map<string, HTMLElement>();
  assignTermHeadingIds(article);
  article.querySelectorAll('h3').forEach((heading) => {
    const title = termHeadingPlainTitle(heading as HTMLElement);
    if (!title) return;
    const fullKey = slugify(title);
    const shortKey = slugify(title.replace(/\s*\([^)]*\)\s*/g, ' ').trim());
    termAnchors.set(fullKey, heading as HTMLElement);
    if (shortKey) termAnchors.set(shortKey, heading as HTMLElement);
  });

  const scrollToTerm = (termName: string) => {
    const key = slugify(termName);
    const target =
      termAnchors.get(key) ||
      termAnchors.get(slugify(termName.replace(/\s*\([^)]*\)\s*/g, ' ').trim()));
    if (!target) return;
    scrollToHeading(target, false);
  };

  const categoryHeadingsForConsole = Array.from(article.querySelectorAll('h2')).filter((heading) => {
    const text = (heading.textContent || '').trim().toLowerCase();
    return text !== 'a note on why this exists' && text !== 'alphabetical index';
  });
  categoryHeadingsForConsole.forEach((heading) => {
    const title = (heading.textContent || '').trim();
    if (!title) return;
    if (!heading.id) heading.id = `category-${slugify(title)}`;
    categoryAnchors.set(title, heading);
  });

  const categoryConsole = document.getElementById('glossary-category-console');
  if (categoryConsole && categoryHeadingsForConsole.length) {
    categoryConsole.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'glossary-category-console-label';
    label.textContent = 'Categories';
    categoryConsole.appendChild(label);

    categoryHeadingsForConsole.forEach((heading) => {
      const title = (heading.textContent || '').trim();
      const target = categoryAnchors.get(title);
      if (!target) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'glossary-see-also-tag glossary-category-pill';
      button.textContent = title;
      button.addEventListener('click', () => scrollToHeading(target, false));
      categoryConsole.appendChild(button);
    });
  }

  const paragraphs = Array.from(article.querySelectorAll('p'));
  paragraphs.forEach((paragraph) => {
    const raw = (paragraph.textContent || '').trim();
    const normalized = raw.toLowerCase();

    if (/^\[[a-z]+\]\s*·/i.test(raw)) {
      paragraph.remove();
      return;
    }

    if (normalized.startsWith('in practice')) {
      const quoteText = raw.replace(/^in practice\s*[—-]\s*/i, '').trim();
      if (!quoteText) return;

      const quote = document.createElement('blockquote');
      quote.className = 'glossary-in-practice my-4';

      const lbl = document.createElement('p');
      lbl.className = 'glossary-in-practice-label m-0';
      lbl.textContent = 'In practice';

      const body = document.createElement('p');
      body.className = 'glossary-in-practice-body mt-1 mb-0';
      body.textContent = quoteText;

      quote.appendChild(lbl);
      quote.appendChild(body);
      paragraph.replaceWith(quote);
      return;
    }

    if (normalized.startsWith('see also')) {
      const terms = (raw.split('→')[1] || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (!terms.length) return;

      const wrap = document.createElement('div');
      wrap.className = 'glossary-see-also my-4 flex flex-wrap items-center gap-2';

      const lbl = document.createElement('span');
      lbl.className = 'glossary-see-also-label';
      lbl.textContent = 'See also';
      wrap.appendChild(lbl);

      terms.forEach((termName) => {
        const tag = document.createElement('button');
        tag.type = 'button';
        tag.className = 'glossary-see-also-tag';
        tag.textContent = termName;
        tag.addEventListener('click', () => scrollToTerm(termName));
        wrap.appendChild(tag);
      });

      paragraph.replaceWith(wrap);
    }
  });

  const indexHeading = Array.from(article.querySelectorAll('h2')).find(
    (h2) => (h2.textContent || '').trim().toLowerCase() === 'alphabetical index',
  );
  if (indexHeading) {
    let indexParagraph: HTMLElement | null = null;
    let cursor = indexHeading.nextElementSibling as HTMLElement | null;
    while (cursor) {
      if (cursor.tagName === 'H2') break;
      if (cursor.tagName === 'P') {
        indexParagraph = cursor;
        break;
      }
      cursor = cursor.nextElementSibling as HTMLElement | null;
    }

    if (indexParagraph) {
      const terms = (indexParagraph.textContent || '')
        .split('·')
        .map((item) => item.trim())
        .filter(Boolean);

      if (terms.length) {
        const wrap = document.createElement('div');
        wrap.className = 'glossary-index-pills my-4 flex flex-wrap items-center gap-2';

        terms.forEach((termName) => {
          const tag = document.createElement('button');
          tag.type = 'button';
          tag.className = 'glossary-see-also-tag glossary-index-pill';
          tag.textContent = termName;
          tag.addEventListener('click', () => scrollToTerm(termName));
          wrap.appendChild(tag);
        });

        indexParagraph.replaceWith(wrap);
      }
    }
  }
}

function initGlossaryPage() {
  glossaryScrollRetryHandles.forEach((h) => window.clearTimeout(h));
  glossaryScrollRetryHandles = [];
  formatInPracticeQuotes();
  const delays = [0, 50, 120, 250, 450, 750, 1200, 2000];
  delays.forEach((ms) => {
    glossaryScrollRetryHandles.push(
      window.setTimeout(() => {
        requestAnimationFrame(() => scrollGlossaryToHash());
      }, ms),
    );
  });
}

function isGlossaryUrl(): boolean {
  return /\/game-vibe-coding-glossary\/?$/.test(window.location.pathname);
}

/** Wait until glossary article exists (post–view-transition paint), then init. */
function scheduleGlossaryInit() {
  if (document.querySelector('[data-glossary-root]')) {
    initGlossaryPage();
    return;
  }
  if (!isGlossaryUrl()) return;

  let frames = 0;
  const maxFrames = 150;
  const tick = () => {
    if (document.querySelector('[data-glossary-root]')) {
      initGlossaryPage();
      return;
    }
    if (++frames >= maxFrames) return;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

document.addEventListener('astro:page-load', scheduleGlossaryInit);
document.addEventListener('astro:after-swap', scheduleGlossaryInit);
window.addEventListener('hashchange', () => {
  requestAnimationFrame(() => scrollGlossaryToHash());
});

scheduleGlossaryInit();
