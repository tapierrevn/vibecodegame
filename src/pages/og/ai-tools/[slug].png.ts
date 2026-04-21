import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext, GetStaticPaths } from 'astro';
import sharp, { type OverlayOptions } from 'sharp';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

type ToolProps = {
  slug: string;
  tool: CollectionEntry<'aiTools'>;
};

const FALLBACK_ICON = 'sparkles';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function iconGlyph(logo: string): string {
  const normalized = logo.toLowerCase();
  if (normalized.includes('anthropic')) return 'A';
  if (normalized.includes('cursor')) return 'C';
  if (normalized.includes('stackblitz')) return 'B';
  if (normalized.includes('replit')) return 'R';
  if (normalized.includes('openai')) return 'O';
  if (normalized.includes('webflow')) return 'V';
  if (normalized === 'heart') return '♥';
  if (normalized === FALLBACK_ICON) return '✦';
  return logo.slice(0, 1).toUpperCase() || '✦';
}

function trimText(value: string, max = 120): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function wrapLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.…]+$/, '')}…`;
  }

  return lines;
}

function getBgByUsability(usability: ToolProps['tool']['data']['usability']): string {
  if (usability === 'Easy') return '#052e16';
  if (usability === 'Medium') return '#451a03';
  return '#450a0a';
}

function resolveToolLogoPath(slug: string): string | null {
  const dir = join(process.cwd(), 'src', 'assets', 'ai-tools', slug);
  if (!existsSync(dir)) return null;

  const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg']);
  const files = readdirSync(dir).filter((file) => {
    const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
    return allowed.has(ext);
  });
  if (!files.length) return null;

  return join(dir, files[0]);
}

export const getStaticPaths: GetStaticPaths = async () => {
  const aiTools = await getCollection('aiTools', ({ data }) => {
    const isEn = (data.locale ?? 'en') === 'en';
    return isEn && (import.meta.env.PROD ? data.draft !== true : true);
  });

  return aiTools.map((tool) => {
    const slug = tool.id.replace('en/', '');
    return {
      params: { slug },
      props: { slug, tool },
    };
  });
};

export async function GET({ props }: APIContext) {
  const typedProps = props as ToolProps | undefined;
  if (!typedProps) {
    return new Response('AI tool not found', { status: 404 });
  }

  const { tool } = typedProps;
  const icon = iconGlyph(tool.data.logo);
  const usabilityBg = getBgByUsability(tool.data.usability);
  const title = escapeXml(tool.data.name);
  const descriptionLines = wrapLines(trimText(tool.data.description, 180), 40, 2).map((line) =>
    escapeXml(line),
  );
  const website = escapeXml(tool.data.website.replace(/^https?:\/\//, ''));
  const logoPath = resolveToolLogoPath(typedProps.slug);
  const descriptionStartY = 324;
  const descriptionLineHeight = 40;
  const descriptionLastLineY =
    descriptionStartY + Math.max(descriptionLines.length - 1, 0) * descriptionLineHeight;
  const usabilityY = descriptionLastLineY + 62;
  const websiteY = usabilityY + 104;
  const descriptionSvg = descriptionLines
    .map(
      (line, idx) =>
        `<text x="360" y="${descriptionStartY + idx * descriptionLineHeight}" fill="#cbd5e1" font-family="Inter, Segoe UI, Arial" font-size="30">${line}</text>`,
    )
    .join('');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="48" y="48" width="1104" height="534" rx="24" fill="url(#card)" stroke="#334155" stroke-width="2"/>
  <rect x="96" y="142" width="220" height="220" rx="32" fill="#ffffff" stroke="#475569" stroke-width="2"/>
  ${logoPath ? '' : `<text x="206" y="286" text-anchor="middle" fill="#0f172a" font-family="Inter, Segoe UI, Arial" font-size="112" font-weight="700">${icon}</text>`}
  <text x="360" y="172" fill="#93c5fd" font-family="Inter, Segoe UI, Arial" font-size="34" font-weight="600">AI Tool Profile</text>
  <text x="360" y="258" fill="#f8fafc" font-family="Inter, Segoe UI, Arial" font-size="72" font-weight="800">${title}</text>
  ${descriptionSvg}
  <rect x="360" y="${usabilityY}" width="220" height="50" rx="25" fill="${usabilityBg}" stroke="#64748b" stroke-width="1"/>
  <text x="470" y="${usabilityY + 33}" text-anchor="middle" fill="#f8fafc" font-family="Inter, Segoe UI, Arial" font-size="26" font-weight="700">Usability: ${tool.data.usability}</text>
  <text x="360" y="${websiteY}" fill="#60a5fa" font-family="Inter, Segoe UI, Arial" font-size="28">${website}</text>
  <text x="96" y="560" fill="#94a3b8" font-family="Inter, Segoe UI, Arial" font-size="24">vibecode.game</text>
</svg>`.trim();

  const image = sharp(Buffer.from(svg));
  if (logoPath) {
    const logoBuffer = await sharp(logoPath).resize(150, 150, { fit: 'contain' }).png().toBuffer();
    const overlays: OverlayOptions[] = [
      {
        input: logoBuffer,
        left: 131,
        top: 177,
      },
    ];
    image.composite(overlays);
  }
  const png = await image.png({ quality: 90 }).toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
