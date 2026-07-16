import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestContext } from "./middleware/requestContext.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import translate from "./routes/translate.js";
import models from "./routes/models.js";
import health from "./routes/health.js";
import languages from "./routes/languages.js";
import modes from "./routes/modes.js";
import explain from "./routes/explain.js";
import speak from "./routes/speak.js";
import tools from "./routes/tools.js";
import contexts from "./routes/contexts.js";
import chat from "./routes/chat.js";
import assistant from "./routes/assistant.js";

// -------- API sub-app (mounted under a versioned prefix) --------
const api = new Hono();

api.use("*", requestContext); // request ID + access logging
api.use("*", corsMiddleware);
api.use("*", securityHeaders);
// Rate limit everything except the health check (so monitors aren't throttled).
api.use("*", async (c, next) => (c.req.path.endsWith("/health") ? next() : rateLimit(c, next)));

api.route("/health", health);
api.route("/models", models);
api.route("/languages", languages);
api.route("/modes", modes);
api.route("/contexts", contexts);
api.route("/translate", translate);
api.route("/explain", explain);
api.route("/speak", speak);
api.route("/tools", tools);
api.route("/chat", chat);
api.route("/assistant", assistant);

// JSON 404 + error responses for the API surface.
api.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "No such API route." } }, 404));
api.onError(errorHandler);

const app = new Hono();

// Versioned API + unversioned alias (backward compatible).
app.route("/api/v1", api);
app.route("/api", api);

// Not found: JSON for API routes, custom 404 page otherwise.
app.notFound(async (c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: { code: "NOT_FOUND", message: "No such API route." } }, 404);
  }
  return serveAsset(c, "/404.html", 404, "Not found");
});

/** Serves a static HTML asset (e.g. error pages) with a status override. */
async function serveAsset(c, path, status, fallback) {
  try {
    const res = await c.env.ASSETS.fetch(new URL(path, c.req.url));
    const html = await res.text();
    return c.html(html, status);
  } catch {
    return c.text(fallback, status);
  }
}

app.onError(errorHandler);

export default app;
