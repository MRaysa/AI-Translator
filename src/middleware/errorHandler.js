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
export function errorHandler(err, c) {
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      logger.error("api_error", { code: err.code, message: err.message });
    }
    return c.json({ error: { code: err.code, message: err.message } }, err.status);
  }

  logger.error("unhandled_error", { message: err?.message, stack: err?.stack });
  return c.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
    500
  );
}
