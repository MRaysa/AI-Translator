import { Hono } from "hono";
import { getConfig } from "../config.js";
import { OpenAIService } from "../services/openai.js";
import { TOOLS } from "../lib/tools.js";
import { toolRequestSchema } from "../schemas/translate.schema.js";
import { ApiError } from "../middleware/errorHandler.js";

const tools = new Hono();

/** GET /api/tools — list available AI tools for the UI. */
tools.get("/", (c) => {
  const list = Object.entries(TOOLS).map(([key, t]) => ({
    key,
    label: t.label,
    emoji: t.emoji,
    group: t.group,
  }));
  return c.json({ tools: list });
});

/**
 * POST /api/tools/run — run an AI tool on a translation.
 * Body: { action, text, translation, targetLang, sourceLang? }
 * 200:  { action, result, model }
 */
tools.post("/run", async (c) => {
  const raw = await c.req.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  });

  const parsed = toolRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw new ApiError(400, "INVALID_INPUT", message);
  }

  const config = getConfig(c.env);
  const openai = new OpenAIService(config);
  const { result, model } = await openai.runTool({
    ...parsed.data,
    model: config.defaultModel,
  });

  return c.json({ action: parsed.data.action, result, model });
});

export default tools;
