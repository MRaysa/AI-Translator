import { Hono } from "hono";
import { getConfig } from "../config.js";
import { OpenAIService } from "../services/openai.js";
import { chatRequestSchema } from "../schemas/translate.schema.js";
import { ApiError } from "../middleware/errorHandler.js";

const chat = new Hono();

/**
 * POST /api/chat — ask follow-up questions about a translation.
 * Body: { text, translation, targetLang, sourceLang?, messages: [{role,content}] }
 * 200:  { reply, model }
 */
chat.post("/", async (c) => {
  const raw = await c.req.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  });

  const parsed = chatRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw new ApiError(400, "INVALID_INPUT", message);
  }

  const config = getConfig(c.env);
  const openai = new OpenAIService(config);
  const { text, translation, targetLang, sourceLang, messages } = parsed.data;
  const { reply, model } = await openai.chat({
    text,
    translation,
    targetLang,
    sourceLang,
    history: messages,
    model: config.defaultModel,
  });

  return c.json({ reply, model });
});

export default chat;
