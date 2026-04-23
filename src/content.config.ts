import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { normalizeGamePublishedAtInput } from './lib/game-meta';

// Blog collection with Content Layer API
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(100),
      description: z.string().max(200),
      /** Optional SERP/social title; `<title>` and og:title use this when set (on-page H1 stays `title`). */
      seoTitle: z.string().max(100).optional(),
      /** Optional meta/og:description; falls back to `description` when omitted. */
      seoDescription: z.string().max(200).optional(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().default('Team'),
      image: image().optional(),
      imageAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      svgSlug: z.string().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      locale: z.enum(['en', 'es', 'fr']).default('en'),
    }),
});

// Pages collection for static pages
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedAt: z.coerce.date().optional(),
    locale: z.enum(['en', 'es', 'fr']).default('en'),
  }),
});

// Authors collection
const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      bio: z.string(),
      avatar: image().optional(),
      social: z
        .object({
          twitter: z.string().optional(),
          github: z.string().optional(),
          linkedin: z.string().optional(),
        })
        .optional(),
    }),
});

// FAQs collection (FAQ landing page + JSON-LD)
const faqs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/faqs' }),
  schema: z.object({
    question: z.string(),
    order: z.number().default(0),
    locale: z.enum(['en', 'es', 'fr']).default('en'),
    category: z.string().optional(),
    relatedTerms: z.array(z.string()).optional(),
  }),
});

// Projects collection — one MDX file per project
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.string().url().optional(),
      repo: z.string().url().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      order: z.number().default(99),
      year: z.number().optional(),
      client: z.string().optional(),
      role: z.string().optional(),
      services: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

// Stack collection — one MDX file per tool, editable like blog posts
const stack = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/stack' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    version: z.string(),
    url: z.string().url(),
    icon: z.string(), // icon name, e.g. 'brand-astro'
    colorOklch: z.string(), // OKLCH params, e.g. '62.5% 0.22 38'
    order: z.number().default(0),
  }),
});

const gamePlatformEnum = z.enum(['Web Browser', 'PC', 'Console']);
const gamePlayModeEnum = z.enum(['SinglePlayer', 'MultiPlayer', 'CoOp']);

// Games collection — vibe-coded games (detail pages + listing)
const games = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      developerName: z.string(),
      developerSlug: z.string(),
      studio: z.string().optional(),
      developerProfileUrl: z.string(),
      aiTools: z.array(z.string()).default([]),
      genre: z.array(z.string()).default([]),
      gameEngine: z.array(z.string()).default([]),
      playUrl: z.string(),
      communityScore: z.coerce.number().min(0).max(100),
      /** ISO 8601 calendar date in frontmatter (e.g. 2026-01-01). Legacy MM-YYYY strings are normalized to day 1. */
      publishedAt: z.preprocess(normalizeGamePublishedAtInput, z.coerce.date()).optional(),
      updatedAt: z.coerce.date().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      svgSlug: z.string().optional(),
      playMode: z.array(gamePlayModeEnum).default(['SinglePlayer']),
      /** 0 = Free, 1 = Pay (maps to schema.org `offers` in JSON-LD). */
      offersPrice: z.union([z.literal(0), z.literal(1)]).default(0),
      applicationCategory: z.string().default('Game'),
      operatingSystem: z.array(gamePlatformEnum).default(['Web Browser']),
      gamePlatform: z.array(gamePlatformEnum).default(['Web Browser']),
      trailerUrl: z.string().optional(),
      featured: z.boolean().default(false),
      best_week: z.boolean().default(false),
      most_played: z.boolean().default(false),
      new_release: z.boolean().default(false),
      draft: z.boolean().default(false),
      locale: z.enum(['en', 'es', 'fr']).default('en'),
    }),
});

// Developers collection — one MDX file per developer profile
const developers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/developers' }),
  schema: z.object({
    name: z.string(),
    studio: z.string().optional(),
    preferredGenres: z.array(z.string()).default([]),
    preferredAiTools: z.array(z.string()).default([]),
    picture: z.string(),
    role: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    social: z
      .object({
        twitter: z.string().optional(),
        github: z.string().optional(),
        linkedin: z.string().optional(),
      })
      .optional(),
    draft: z.boolean().default(false),
    locale: z.enum(['en', 'es', 'fr']).default('en'),
  }),
});

// Game Studios collection — one MDX file per studio profile
const gameStudios = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/game-studios' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    creationYear: z.string(),
    website: z.string().url(),
    logo: z.string().url(),
    headquarterAddress: z.string(),
    aiTools: z.array(z.string()).default([]),
    gamesGenre: z.array(z.string()).default([]),
    gameEngine: z.array(z.string()).default([]),
    developers: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    locale: z.enum(['en', 'es', 'fr']).default('en'),
  }),
});

// AI Tools collection — one MDX file per AI tool profile
const aiTools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/ai-tools' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    website: z.string().url(),
    featured: z.boolean().default(false),
    usability: z.enum(['Easy', 'Medium', 'Hard']),
    logo: z.string(),
    draft: z.boolean().default(false),
    locale: z.enum(['en', 'es', 'fr']).default('en'),
  }),
});

// Game Jams collection — one MDX file per event profile
const gameJams = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/game-jams' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      participationLink: z.string().url(),
      place: z.string(),
      country: z.string(),
      featured: z.boolean().default(false),
      organizers: z.array(z.string()).default([]),
      image: image(),
      imageAlt: z.string().optional(),
      draft: z.boolean().default(false),
      locale: z.enum(['en', 'es', 'fr']).default('en'),
    }),
});

export const collections = {
  blog,
  pages,
  authors,
  faqs,
  stack,
  projects,
  games,
  developers,
  gameStudios,
  aiTools,
  gameJams,
};
