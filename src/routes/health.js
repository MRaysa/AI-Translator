import { Hono } from "hono";
import { getConfig } from "../config.js";

const health = new Hono();

/** GET health — liveness plus version/runtime info. */
health.get("/", (c) => {
  const config = getConfig(c.env);
  return c.json({
    status: "ok",
    service: "translator-app",
    version: config.version,
    model: config.defaultModel,
    time: new Date().toISOString(),
    requestId: c.get("requestId"),
  });
});

export default health;
