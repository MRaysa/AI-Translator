import { Hono } from "hono";
import { CONTEXTS } from "../lib/context.js";

const contexts = new Hono();

/** GET /api/contexts — list domain contexts for the UI. */
contexts.get("/", (c) => {
  const list = Object.entries(CONTEXTS).map(([key, ctx]) => ({
    key,
    label: ctx.label,
    emoji: ctx.emoji,
  }));
  return c.json({ contexts: list });
});

export default contexts;
