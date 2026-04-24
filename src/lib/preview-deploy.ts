/**
 * True when this build is a host preview deploy (branch / PR), not production.
 * Used to set robots noindex so preview URLs are not indexed.
 *
 * - Vercel: https://vercel.com/docs/projects/environment-variables/system-environment-variables
 * - Netlify: https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
 */
export function isPreviewDeploy(): boolean {
  if (process.env.VERCEL_ENV === 'preview') return true;
  if (process.env.CONTEXT === 'deploy-preview') return true;
  return false;
}

/**
 * True when this build/runtime is the production deploy.
 */
export function isProductionDeploy(): boolean {
  if (process.env.VERCEL_ENV === 'production') return true;
  if (process.env.CONTEXT === 'production') return true;
  return false;
}
