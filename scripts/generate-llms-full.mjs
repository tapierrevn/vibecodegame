/**
 * Writes public/llms-full.txt — concatenated English content from site sources
 * for LLM / RAG ingestion (single file, no link following).
 *
 * Invoked from package.json `prebuild`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(REPO_ROOT, 'public', 'llms-full.txt');

const BASE_URL = (process.env.SITE_URL || 'https://www.vibecode.game').replace(/\/$/, '');

function collectFiles(dir, exts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) collectFiles(p, exts, acc);
    else if (exts.some((e) => ent.name.endsWith(e))) acc.push(p);
  }
  return acc;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { meta: {}, body: raw, hasFm: false };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: raw, hasFm: false };
  const fmBlock = raw.slice(3, end);
  const body = raw.slice(end + 4).trim();
  const meta = {};
  for (const line of fmBlock.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val === 'true') meta[key] = true;
    else if (val === 'false') meta[key] = false;
    else meta[key] = val;
  }
  return { meta, body, hasFm: true };
}

function isDraftTrue(meta) {
  return meta.draft === true || meta.draft === 'true';
}

function localeOk(meta) {
  const loc = meta.locale;
  if (loc === undefined || loc === '') return true;
  return loc === 'en';
}

function stripModuleSyntax(text) {
  return text
    .split('\n')
    .filter((line) => !/^\s*import\s+/.test(line) && !/^\s*export\s+/.test(line))
    .join('\n')
    .trim();
}

function relToUrl(kind, filePath) {
  const norm = filePath.split(path.sep).join('/');
  if (kind === 'blog') {
    const m = /content\/blog\/en\/(.+)\.mdx?$/i.exec(norm);
    if (m) return `${BASE_URL}/blog/${m[1]}`;
  }
  if (kind === 'games') {
    const m = /content\/games\/en\/(.+)\.mdx?$/i.exec(norm);
    if (m) return `${BASE_URL}/vibe-coded-games/${m[1]}`;
  }
  if (kind === 'developers') {
    const m = /content\/developers\/en\/(.+)\.mdx?$/i.exec(norm);
    if (m) return `${BASE_URL}/developers/${m[1]}`;
  }
  if (kind === 'aiTools') {
    const m = /content\/ai-tools\/en\/(.+)\.mdx?$/i.exec(norm);
    if (m) return `${BASE_URL}/ai-tools/${m[1]}`;
  }
  if (kind === 'gameJams') {
    const m = /content\/game-jams\/en\/(.+)\.mdx?$/i.exec(norm);
    if (m) return `${BASE_URL}/game-jams/${m[1]}`;
  }
  if (kind === 'faqs') {
    return `${BASE_URL}/faq`;
  }
  if (kind === 'glossary') {
    return `${BASE_URL}/game-vibe-coding-glossary`;
  }
  return BASE_URL;
}

function sectionHeader(title, url, sourcePath) {
  const rel = path.relative(REPO_ROOT, sourcePath).split(path.sep).join('/');
  return `\n${'='.repeat(80)}\n## ${title}\nURL: ${url}\nSource: ${rel}\n${'='.repeat(80)}\n\n`;
}

let output = `# Vibecode.game — llms-full.txt

> Auto-generated at build time. Do not edit by hand.
> Single-file corpus of primary English MD/MDX sources. MDX may contain JSX/HTML fragments.

Generated (UTC): ${new Date().toISOString()}
Canonical site: ${BASE_URL}
Index file: ${BASE_URL}/llms.txt

`;

const glossaryPath = path.join(REPO_ROOT, 'src', 'components', 'glossary', 'GlossaryContent.mdx');
if (fs.existsSync(glossaryPath)) {
  const raw = fs.readFileSync(glossaryPath, 'utf8');
  const body = stripModuleSyntax(raw);
  output += sectionHeader('Glossary (full)', relToUrl('glossary', glossaryPath), glossaryPath);
  output += `${body}\n`;
}

const faqDir = path.join(REPO_ROOT, 'src', 'content', 'faqs');
const faqFiles = collectFiles(faqDir, ['.md', '.mdx']).sort();
for (const file of faqFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body, hasFm } = parseFrontmatter(raw);
  if (hasFm && (isDraftTrue(meta) || !localeOk(meta))) continue;
  const q = meta.question || path.basename(file, path.extname(file));
  const url = relToUrl('faqs', file);
  output += sectionHeader(`FAQ: ${q}`, url, file);
  output += `${(hasFm ? body : stripModuleSyntax(raw)).trim()}\n`;
}

const blogDir = path.join(REPO_ROOT, 'src', 'content', 'blog', 'en');
const blogFiles = collectFiles(blogDir, ['.md', '.mdx']).sort();
for (const file of blogFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body, hasFm } = parseFrontmatter(raw);
  if (!hasFm) continue;
  if (isDraftTrue(meta)) continue;
  const title = meta.title || path.basename(file);
  const url = relToUrl('blog', file);
  output += sectionHeader(`Blog: ${title}`, url, file);
  if (meta.description) output += `Description: ${meta.description}\n\n`;
  output += `${stripModuleSyntax(body).trim()}\n`;
}

const gamesDir = path.join(REPO_ROOT, 'src', 'content', 'games', 'en');
const gameFiles = collectFiles(gamesDir, ['.md', '.mdx']).sort();
for (const file of gameFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body, hasFm } = parseFrontmatter(raw);
  if (!hasFm) continue;
  if (isDraftTrue(meta) || !localeOk(meta)) continue;
  const title = meta.title || path.basename(file);
  const url = relToUrl('games', file);
  output += sectionHeader(`Game: ${title}`, url, file);
  if (meta.description) output += `Description: ${meta.description}\n\n`;
  output += `${stripModuleSyntax(body).trim()}\n`;
}

const devDir = path.join(REPO_ROOT, 'src', 'content', 'developers', 'en');
const devFiles = collectFiles(devDir, ['.md', '.mdx']).sort();
for (const file of devFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body, hasFm } = parseFrontmatter(raw);
  if (!hasFm) continue;
  if (isDraftTrue(meta) || !localeOk(meta)) continue;
  const title = meta.name || path.basename(file);
  const url = relToUrl('developers', file);
  output += sectionHeader(`Developer profile: ${title}`, url, file);
  output += `${stripModuleSyntax(body).trim()}\n`;
}

const aiDir = path.join(REPO_ROOT, 'src', 'content', 'ai-tools', 'en');
const aiFiles = collectFiles(aiDir, ['.md', '.mdx']).sort();
for (const file of aiFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body, hasFm } = parseFrontmatter(raw);
  if (!hasFm) continue;
  if (isDraftTrue(meta) || !localeOk(meta)) continue;
  const title = meta.name || path.basename(file);
  const url = relToUrl('aiTools', file);
  output += sectionHeader(`AI tool: ${title}`, url, file);
  if (meta.description) output += `Description: ${meta.description}\n\n`;
  output += `${stripModuleSyntax(body).trim()}\n`;
}

const jamDir = path.join(REPO_ROOT, 'src', 'content', 'game-jams', 'en');
const jamFiles = collectFiles(jamDir, ['.md', '.mdx']).sort();
for (const file of jamFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body, hasFm } = parseFrontmatter(raw);
  if (!hasFm) continue;
  if (isDraftTrue(meta) || !localeOk(meta)) continue;
  const title = meta.name || path.basename(file);
  const url = relToUrl('gameJams', file);
  output += sectionHeader(`Game jam: ${title}`, url, file);
  if (meta.description) output += `Description: ${meta.description}\n\n`;
  output += `${stripModuleSyntax(body).trim()}\n`;
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, output, 'utf8');
console.log(`Wrote ${path.relative(REPO_ROOT, OUT_FILE)} (${output.length} chars)`);
