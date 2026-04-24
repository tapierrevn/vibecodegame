import type { APIRoute } from 'astro';
import { isProductionDeploy } from '@/lib/preview-deploy';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || 'https://example.com';

  if (isProductionDeploy()) {
    const robotsTxt = `
User-agent: *
Disallow: /
`.trim();

    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const robotsTxt = `
User-agent: *
Allow: /

# Block API routes
Disallow: /api/

# UI playground — prefix without trailing slash covers /components and subpaths.
Disallow: /components

# Dynamic Open Graph image endpoints
Disallow: /og/

# OpenAI (ChatGPT, training data)
User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /components
Disallow: /og/

# OpenAI browsing tool
User-agent: ChatGPT-User
Allow: /
Disallow: /api/
Disallow: /components
Disallow: /og/

# Anthropic (Claude)
User-agent: ClaudeBot
Allow: /
Disallow: /api/
Disallow: /components
Disallow: /og/

# Google Gemini
User-agent: Google-Extended
Allow: /
Disallow: /api/
Disallow: /components
Disallow: /og/

# Meta AI
User-agent: FacebookBot
Allow: /
Disallow: /api/
Disallow: /components
Disallow: /og/

# Perplexity
User-agent: PerplexityBot
Allow: /
Disallow: /api/
Disallow: /components
Disallow: /og/

# Common Crawl (used by many AI datasets)
User-agent: CCBot
Allow: /
Disallow: /api/
Disallow: /components
Disallow: /og/

Sitemap: ${siteUrl}sitemap-index.xml
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
