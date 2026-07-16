import { Hono } from "hono";
import { getConfig } from "../config.js";
import { OpenAIService } from "../services/openai.js";
import { translateRequestSchema } from "../schemas/translate.schema.js";
import { ApiError } from "../middleware/errorHandler.js";
import { logger } from "../lib/logger.js";

const translate = new Hono();

/**
 * POST /api/translate
 * Body: { text, targetLang, sourceLang?, model? }
 * 200:  { translation, sourceLang, targetLang, model }
 */
translate.post("/", async (c) => {
  const raw = await c.req.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  });

  const parsed = translateRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw new ApiError(400, "INVALID_INPUT", message);
  }

  const config = getConfig(c.env);
  const { text, targetLang, sourceLang, mode, context, preserveFormatting } = parsed.data;
  const model = parsed.data.model || config.defaultModel;

  const openai = new OpenAIService(config);
  const { translation, model: usedModel } = await openai.translate({
    text,
    sourceLang,
    targetLang,
    model,
    mode,
    context,
    preserveFormatting,
  });

  logger.info("translation_ok", {
    targetLang,
    sourceLang,
    mode,
    context,
    model: usedModel,
    chars: text.length,
  });

  return c.json({ translation, sourceLang, targetLang, mode, context, model: usedModel });
});

export default translate;
