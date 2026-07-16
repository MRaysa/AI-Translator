import { logger } from "../lib/logger.js";

/** Application error with an HTTP status and a stable machine code. */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Hono error handler. Turns any thrown error into a clean JSON envelope:
 *   { "error": { "code": "...", "message": "..." } }
 */
export async function errorHandler(err, c) {
  const isApi = c.req.path.startsWith("/api/");

  if (err instanceof ApiError) {
    if (err.status >= 500) logger.error("api_error", { code: err.code, message: err.message });
    if (isApi) return c.json({ error: { code: err.code, message: err.message } }, err.status);
  } else {
    logger.error("unhandled_error", { message: err?.message, stack: err?.stack });
  }

  if (isApi) {
    return c.json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong." } }, 500);
  }

  // Non-API page error → custom 500 page.
  try {
    const res = await c.env.ASSETS.fetch(new URL("/500.html", c.req.url));
    return c.html(await res.text(), 500);
  } catch {
    return c.text("Internal Server Error", 500);
  }
}
