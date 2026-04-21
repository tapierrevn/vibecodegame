/**
 * Blog OG images (1200×630 SVG). After changing titles or this template, run:
 *   node scripts/gen-blog-og-svgs.mjs
 * If previews still show old art, delete Astro’s asset cache and rebuild:
 *   rm -rf node_modules/.astro dist .astro
 *   npm run build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'src', 'assets', 'blog');
/** Bumps when SVG bytes change so Vite/Astro emit new hashed filenames (clears stale CDN/browser caches). */
const contentStamp = new Date().toISOString();

/** Slug → on-page title from MDX frontmatter */
const titlesBySlug = {
  'how-to-multiplayer-game-cursor-two-hours':
    'Build a Tiny Multiplayer Game with Cursor in One Evening',
  'vibe-coding-first-browser-game-beginners-guide':
    'Your First Browser Game: Vibe-Coding from Zero to Playable',
  'ship-game-jam-build-claude-github-actions':
    'Ship Every Jam Build with Claude and GitHub Actions',
  'prompt-to-playable-lovable-web-game-workflow':
    'From Prompt to Playable: A Lovable-First Web Game Workflow',
  'add-leaderboards-save-data-ai-built-web-game':
    'Leaderboards and Saves for AI-Built Web Games (Without Regret)',
  'test-debug-browser-games-built-with-ai':
    'Testing and Debugging Browser Games You Built with AI',
  'prepare-indie-game-for-community-hub-listing':
    'Prepare Your Indie Game for a Community Hub Listing',
  'local-co-op-prototype-cursor-phaser-afternoon':
    'Local Co-op in an Afternoon: Cursor + Phaser 3',
  'choose-ai-coding-stack-2d-web-games':
    'How to Choose an AI-Friendly Stack for 2D Web Games',
  'websockets-multiplayer-vibe-coding-primer':
    'WebSockets for Vibe-Coded Games: A Primer Before You Code',
  'game-idea-to-one-page-design-doc-for-ai-tools':
    'Turn a Game Idea into a One-Page Design Doc AI Tools Understand',
  'first-itch-io-page-vibe-coded-game':
    'Your First itch.io Page for a Vibe-Coded Game',
  'ai-game-dev-tools-landscape-2026':
    'The AI Game Dev Tool Landscape in 2026 (So Far)',
  'game-jams-vibe-coding-era':
    'Why Game Jams Hit Different in the Vibe-Coding Era',
  'discovering-ai-built-games-platforms-trends':
    'Discovering AI-Built Games: Platforms, Feeds, and 2026 Signals',
  'cursor-claude-copilot-game-prototypes-compared':
    'Cursor vs Claude Code vs Copilot for Game Prototypes',
  'ai-prototyping-indie-marketing-timelines':
    'How AI Prototyping Compresses Indie Marketing Timelines',
  'vibe-coded-games-ip-essentials':
    'IP Essentials for Vibe-Coded Games (High Level, Not Legal Advice)',
  'browser-first-indie-games-ai-builders':
    'The Rise of Browser-First Indie Games from AI Builders',
  'ygg-play-vibe-coded-games-community':
    'YGG Play and the Vibe-Coded Games Community',
  'web-first-indies-engine-tooling-updates':
    'Engine & Tooling Updates Web-First Indies Should Watch',
  'niche-game-news-backlinks-source-guide':
    'How Niche Game News Finds Sources—and How to Be One',
};

const slugs = Object.keys(titlesBySlug);

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Word-wrap for centered multi-line title (1200px wide artboard). */
function wrapTitleLines(text, maxChars = 40, maxLines = 5) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let wordIdx = 0;

  while (wordIdx < words.length && lines.length < maxLines) {
    let line = '';
    while (wordIdx < words.length) {
      const w = words[wordIdx];
      const candidate = line ? `${line} ${w}` : w;
      if (candidate.length <= maxChars) {
        line = candidate;
        wordIdx++;
      } else if (!line) {
        lines.push(w.length > maxChars ? `${w.slice(0, maxChars - 1)}…` : w);
        wordIdx++;
        break;
      } else {
        break;
      }
    }
    if (line) lines.push(line);
  }

  if (wordIdx < words.length && lines.length > 0) {
    const last = lines[lines.length - 1];
    const base = last.endsWith('…') ? last.slice(0, -1) : last;
    lines[lines.length - 1] =
      base.length + 1 <= maxChars ? `${base}…` : `${base.slice(0, maxChars - 1)}…`;
  }

  return lines;
}

for (let i = 0; i < slugs.length; i++) {
  const s = slugs[i];
  const title = titlesBySlug[s];
  if (!title) throw new Error(`Missing title for slug: ${s}`);

  const h = (210 + i * 7) % 360;
  const c1 = `hsl(${h}, 62%, 28%)`;
  const c2 = `hsl(${(h + 40) % 360}, 55%, 42%)`;

  const lines = wrapTitleLines(title);
  const lineHeight = 52;
  const titleFontSize = 36;
  const titleBlockTop = 280 - ((lines.length - 1) * lineHeight) / 2;
  const titleTspans = lines
    .map(
      (ln, j) =>
        `<tspan x="600" dy="${j === 0 ? '0' : String(lineHeight)}">${escapeXml(ln)}</tspan>`,
    )
    .join('\n    ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- vibecode OG ${contentStamp} -->
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img">
  <defs><linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g${i})"/>
  <text x="600" y="${titleBlockTop}" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-family="system-ui,-apple-system,sans-serif" font-size="${titleFontSize}" font-weight="700">${titleTspans}</text>
  <text x="600" y="580" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-family="system-ui,-apple-system,sans-serif" font-size="24" font-weight="600" letter-spacing="0.02em">vibecode.game</text>
</svg>
`;
  fs.writeFileSync(path.join(dir, `${s}-og.svg`), svg);
}
console.log('wrote', slugs.length, 'files');
