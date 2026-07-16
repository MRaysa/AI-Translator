import { Hono } from "hono";
import { LANGUAGES, SOURCE_LANGUAGES } from "../lib/languages.js";

const languages = new Hono();

/**
 * GET /api/languages
 * Returns the language lists the UI needs to build its dropdowns.
 * `source` includes "auto"; `target` does not.
 */
languages.get("/", (c) => {
  const toList = (map) => Object.entries(map).map(([code, name]) => ({ code, name }));

  return c.json({
    source: toList(SOURCE_LANGUAGES),
    target: toList(LANGUAGES),
  });
});

export default languages;
