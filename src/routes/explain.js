import { Hono } from "hono";
import { getConfig } from "../config.js";
import { OpenAIService } from "../services/openai.js";
import { explainRequestSchema } from "../schemas/translate.schema.js";
import { ApiError } from "../middleware/errorHandler.js";

const explain = new Hono();

/**
 * POST /api/explain — explains a translation for a learner.
 * Body: { text, translation, targetLang, sourceLang? }
 * 200:  { explanation, model }
 */
explain.post("/", async (c) => {
  const raw = await c.req.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  });

  const parsed = explainRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw new ApiError(400, "INVALID_INPUT", message);
  }

  const config = getConfig(c.env);
  const openai = new OpenAIService(config);
  const { explanation, model } = await openai.explain({
    ...parsed.data,
    model: config.defaultModel,
  });

  return c.json({ explanation, model });
});

export default explain;
