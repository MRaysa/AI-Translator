/**
 * Security headers for Worker-generated responses (API, error pages).
 * Static assets get the same headers via public/_headers.
 */
export const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
].join("; ");

export async function securityHeaders(c, next) {
  await next();
  c.header("Content-Security-Policy", CSP);
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  c.header("Permissions-Policy", "geolocation=(), microphone=(self), camera=()");
}
