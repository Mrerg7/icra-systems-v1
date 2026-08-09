/**
 * Canonical host / path enforcement for static assets.
 * Runs before assets (run_worker_first) so www/http/index.html variants 301 to
 * https://icra.systems/ in a single hop — avoiding GSC "Page with redirect" chains
 * (e.g. www → apex/index.html → /).
 */
const CANONICAL_ORIGIN = 'https://icra.systems';
const CANONICAL_HOST = 'icra.systems';
const NOT_FOUND_PATHS = new Set(['/404', '/404/', '/404.html']);

function getCanonicalRedirect(request) {
  const url = new URL(request.url);
  // Collapse duplicate slashes before URL() — `new URL('//', origin)` is invalid
  // (protocol-relative) and throws, which surfaces as Cloudflare error 1101.
  const normalizedPath = (url.pathname.replace(/\/{2,}/g, '/') || '/');
  const canonical = new URL(normalizedPath + url.search, CANONICAL_ORIGIN);
  let needsRedirect = false;

  if (url.protocol === 'http:' || url.hostname.toLowerCase() === `www.${CANONICAL_HOST}`) {
    needsRedirect = true;
  }

  if (normalizedPath !== url.pathname) {
    needsRedirect = true;
  }

  if (canonical.pathname === '/index.html' || canonical.pathname === '/index.html/') {
    canonical.pathname = '/';
    needsRedirect = true;
  }

  if (canonical.pathname === '/icrasystems.html' || canonical.pathname === '/icrasystems.html/') {
    canonical.pathname = '/';
    needsRedirect = true;
  }

  if (
    !NOT_FOUND_PATHS.has(canonical.pathname) &&
    canonical.pathname !== '/' &&
    !canonical.pathname.endsWith('/') &&
    !/\.\w+$/.test(canonical.pathname)
  ) {
    canonical.pathname += '/';
    needsRedirect = true;
  }

  return needsRedirect ? canonical.toString() : null;
}

async function notFoundResponse(request, env) {
  const url = new URL(request.url);
  const assetResponse = await env.ASSETS.fetch(
    new Request(new URL('/404.html', url.origin), request),
  );
  return new Response(assetResponse.body, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (NOT_FOUND_PATHS.has(url.pathname)) {
      return notFoundResponse(request, env);
    }

    const redirectUrl = getCanonicalRedirect(request);
    if (redirectUrl) {
      return Response.redirect(redirectUrl, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
