import { defineMiddleware } from 'astro:middleware';
import { isProductionDeploy } from '@/lib/preview-deploy';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  if (isProductionDeploy()) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
});
