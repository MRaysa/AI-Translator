import { Hono } from "hono";
import { MODES } from "../lib/modes.js";

const modes = new Hono();

/** GET /api/modes — list available translation modes for the UI. */
modes.get("/", (c) => {
  const list = Object.entries(MODES).map(([key, m]) => ({
    key,
    label: m.label,
    emoji: m.emoji,
  }));
  return c.json({ modes: list });
});

export default modes;
