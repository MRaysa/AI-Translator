import { cors } from "hono/cors";

/**
 * CORS policy. In production, the UI is served from the same Worker origin,
 * so CORS is not strictly needed — but this allows other clients (mobile,
 * separate frontends) to call the API. Tighten `origin` for production.
 */
export const corsMiddleware = cors({
  origin: "*",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type"],
  maxAge: 86400,
});
