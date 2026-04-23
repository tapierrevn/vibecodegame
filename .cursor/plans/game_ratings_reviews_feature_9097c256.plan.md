---
name: Game ratings reviews feature
overview: Implement public game reviews with 5-star ratings and Google-authenticated review submission, including API routes, UI components, and Game Profile integration.
todos:
  - id: reviews-foundation
    content: Add review contracts, cursor helper, and Supabase client/server helpers
    status: pending
  - id: reviews-db
    content: Create game_reviews schema + indexes + RLS policies in Supabase
    status: pending
  - id: reviews-read-api
    content: Implement public GET list and summary review endpoints
    status: pending
  - id: reviews-write-api
    content: Implement authenticated POST upsert and DELETE own review endpoints
    status: pending
  - id: reviews-ui
    content: Add review UI components with login CTA and star input
    status: pending
  - id: reviews-layout-integration
    content: Integrate review section into GameLayout with slug prop plumbing
    status: pending
  - id: reviews-verification
    content: Run end-to-end validation for auth/write/read/pagination and project checks
    status: pending
isProject: false
---

# Implement Game Ratings & Reviews

## Platform Decision
- Use **Supabase** for both:
  - **Google OAuth authentication** (write access only)
  - **Postgres persistence + RLS** for ratings/reviews
- Keep reads public (no auth required), writes authenticated.

## Copy-Paste Starter

### 1) Shared contracts: [c:/Users/Admin/vibecodegame/src/lib/reviews/contracts.ts](c:/Users/Admin/vibecodegame/src/lib/reviews/contracts.ts)
```ts
import { z } from 'zod';

export const ratingSchema = z.number().int().min(1).max(5);

export const reviewUpsertInputSchema = z.object({
  rating: ratingSchema,
  reviewText: z
    .string()
    .max(1000)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
});

export const reviewsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
  cursor: z.string().optional(),
});

export const reviewItemSchema = z.object({
  id: z.string().uuid(),
  userName: z.string(),
  userImage: z.string().nullable().optional(),
  rating: ratingSchema,
  reviewText: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const reviewsListResponseSchema = z.object({
  items: z.array(reviewItemSchema),
  nextCursor: z.string().nullable(),
});

export const reviewsSummaryResponseSchema = z.object({
  average: z.number(),
  count: z.number().int(),
  distribution: z.object({
    '1': z.number().int(),
    '2': z.number().int(),
    '3': z.number().int(),
    '4': z.number().int(),
    '5': z.number().int(),
  }),
});
```

### 2) Cursor helper: [c:/Users/Admin/vibecodegame/src/lib/reviews/cursor.ts](c:/Users/Admin/vibecodegame/src/lib/reviews/cursor.ts)
```ts
import { z } from 'zod';

const cursorSchema = z.object({
  createdAt: z.string(),
  id: z.string().uuid(),
});

export function encodeCursor(input: { createdAt: string; id: string }): string {
  return Buffer.from(JSON.stringify(input), 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): { createdAt: string; id: string } {
  const raw = Buffer.from(cursor, 'base64url').toString('utf8');
  return cursorSchema.parse(JSON.parse(raw));
}
```

### 3) Reviews API: [c:/Users/Admin/vibecodegame/src/pages/api/reviews/[gameSlug].ts](c:/Users/Admin/vibecodegame/src/pages/api/reviews/[gameSlug].ts)
```ts
import type { APIRoute } from 'astro';
import { reviewUpsertInputSchema, reviewsQuerySchema } from '@/lib/reviews/contracts';
import { decodeCursor, encodeCursor } from '@/lib/reviews/cursor';

// TODO: wire Supabase server client + auth user extraction

export const GET: APIRoute = async ({ params, request }) => {
  const gameSlug = params.gameSlug;
  if (!gameSlug) return new Response(JSON.stringify({ error: 'Missing game slug' }), { status: 400 });

  const url = new URL(request.url);
  const query = reviewsQuerySchema.safeParse({
    limit: url.searchParams.get('limit') ?? undefined,
    cursor: url.searchParams.get('cursor') ?? undefined,
  });
  if (!query.success) return new Response(JSON.stringify({ error: 'Invalid query' }), { status: 400 });

  const { limit, cursor } = query.data;
  const keyset = cursor ? decodeCursor(cursor) : null;

  // TODO query DB ordered by created_at desc, id desc with keyset pagination
  const rows: Array<{
    id: string;
    user_name: string;
    user_image: string | null;
    rating: number;
    review_text: string | null;
    created_at: string;
  }> = [];

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];

  return new Response(
    JSON.stringify({
      items: page.map((r) => ({
        id: r.id,
        userName: r.user_name,
        userImage: r.user_image,
        rating: r.rating,
        reviewText: r.review_text,
        createdAt: r.created_at,
      })),
      nextCursor: hasMore && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
    }),
    { headers: { 'content-type': 'application/json' } },
  );
};

export const POST: APIRoute = async ({ params, request }) => {
  const gameSlug = params.gameSlug;
  if (!gameSlug) return new Response(JSON.stringify({ error: 'Missing game slug' }), { status: 400 });

  // TODO require Google-authenticated user session
  const user = null as null | { id: string; name: string; image?: string | null };
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = reviewUpsertInputSchema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });

  const { rating, reviewText } = parsed.data;

  // TODO upsert into game_reviews on (game_slug, user_id)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const gameSlug = params.gameSlug;
  if (!gameSlug) return new Response(JSON.stringify({ error: 'Missing game slug' }), { status: 400 });

  // TODO require session + delete own review
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};
```

### 4) Summary API: [c:/Users/Admin/vibecodegame/src/pages/api/reviews/[gameSlug]/summary.ts](c:/Users/Admin/vibecodegame/src/pages/api/reviews/[gameSlug]/summary.ts)
```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const gameSlug = params.gameSlug;
  if (!gameSlug) return new Response(JSON.stringify({ error: 'Missing game slug' }), { status: 400 });

  // TODO aggregate count/avg/distribution from game_reviews
  return new Response(
    JSON.stringify({
      average: 0,
      count: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    }),
    { headers: { 'content-type': 'application/json' } },
  );
};
```

### 5) Review form + login CTA: [c:/Users/Admin/vibecodegame/src/components/reviews/ReviewForm.tsx](c:/Users/Admin/vibecodegame/src/components/reviews/ReviewForm.tsx)
```tsx
import { useState } from 'react';
import StarRatingInput from './StarRatingInput';

type Props = {
  gameSlug: string;
  isAuthenticated: boolean;
  loginHref: string;
  initialRating?: number | null;
  initialReviewText?: string | null;
  onSaved?: () => void;
};

export default function ReviewForm({
  gameSlug,
  isAuthenticated,
  loginHref,
  initialRating = null,
  initialReviewText = null,
  onSaved,
}: Props) {
  const [rating, setRating] = useState<number>(initialRating ?? 1);
  const [reviewText, setReviewText] = useState<string>(initialReviewText ?? '');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <a href={loginHref} className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">
        Login to give a review
      </a>
    );
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(gameSlug)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rating, reviewText }),
      });
      if (!res.ok) throw new Error('Failed to save review');
      onSaved?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <StarRatingInput value={rating} onChange={setRating} />
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        maxLength={1000}
        placeholder="Write an optional review..."
        className="w-full rounded-md border border-border bg-background p-3 text-sm"
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Submit review'}
      </button>
    </div>
  );
}
```

### 6) Mount point in game page layout: [c:/Users/Admin/vibecodegame/src/layouts/GameLayout.astro](c:/Users/Admin/vibecodegame/src/layouts/GameLayout.astro)
- Insert a new `<section>` after the article content and before similar games.
- Pass current game slug from [c:/Users/Admin/vibecodegame/src/pages/vibe-coded-games/[slug].astro](c:/Users/Admin/vibecodegame/src/pages/vibe-coded-games/[slug].astro) into `GameLayout` as a new prop (`slug`) so review APIs can target `/api/reviews/[slug]`.

## Execution Plan

## Phase 1 — Foundation
- Add Supabase client/server helpers (`@supabase/supabase-js` + `@supabase/ssr`).
- Add review contracts and cursor utilities.
- Add required env vars and dependency wiring:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - optional server secret key if needed by future admin flows.

## Phase 2 — Database
- Create `game_reviews` table with:
  - `game_slug`, `user_id`, `user_name`, `user_image`, `rating`, `review_text`, timestamps
  - unique constraint on `(game_slug, user_id)`
  - indexes for `(game_slug, created_at desc, id desc)`
- Enable RLS:
  - public `select`
  - authenticated own `insert/update/delete`

## Phase 3 — Public Read APIs
- Implement:
  - `GET /api/reviews/[gameSlug]` with keyset pagination (default 5)
  - `GET /api/reviews/[gameSlug]/summary`
- Validate query and responses via zod schemas.

## Phase 4 — Authenticated Write APIs
- Implement:
  - `POST /api/reviews/[gameSlug]` (upsert)
  - `DELETE /api/reviews/[gameSlug]` (delete own)
- Require **Supabase Google-authenticated session** for writes only.

## Phase 5 — UI Components
- Build:
  - star input control
  - review form with "Login to give a review" fallback
  - review list with latest 5 + load more
  - summary block
- Keep review list publicly visible regardless of auth state.

## Phase 6 — Game Profile Integration
- Add review section into `GameLayout`.
- Add `slug` prop plumbing from `[slug].astro` route.
- Ensure section appears before similar-games accordions.

## Phase 7 — Verification
- Validate cases:
  - logged-out user can read reviews and sees login CTA for submit
  - logged-in user can submit/update/delete own review
  - rating constrained to 1..5
  - latest 5 shown with working pagination
- Run lint/check/build and smoke-test 1–2 game pages.
