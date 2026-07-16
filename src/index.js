import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
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

const app = new Hono();

// Cross-cutting middleware
app.use("/api/*", corsMiddleware);

// API routes
app.route("/api/health", health);
app.route("/api/models", models);
app.route("/api/languages", languages);
app.route("/api/modes", modes);
app.route("/api/contexts", contexts);
app.route("/api/translate", translate);
app.route("/api/explain", explain);
app.route("/api/speak", speak);
app.route("/api/tools", tools);
app.route("/api/chat", chat);
app.route("/api/assistant", assistant);

// Unknown /api/* path
app.notFound((c) => {
  // Only claim 404 for API paths; static assets are handled by the
  // [assets] binding before requests reach the Worker.
  if (c.req.path.startsWith("/api/")) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "No such API route." } },
      404
    );
  }
  return c.text("Not found", 404);
});

// Central error handler
app.onError(errorHandler);

export default app;
