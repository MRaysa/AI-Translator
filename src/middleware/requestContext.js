import { logger } from "../lib/logger.js";

/**
 * Assigns a unique request ID (echoed as `X-Request-Id`), makes it available
 * to handlers via c.get("requestId"), and emits a structured access log with
 * method, path, status and duration.
 */
export async function requestContext(c, next) {
  const id =
    (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
    Math.random().toString(36).slice(2);
  c.set("requestId", id);
  c.header("X-Request-Id", id);

  const start = Date.now();
  try {
    await next();
  } finally {
    logger.info("request", {
      id,
      method: c.req.method,
      path: c.req.path,
      status: c.res?.status,
      ms: Date.now() - start,
    });
  }
}
