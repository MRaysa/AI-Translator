import { Hono } from "hono";
import { getConfig } from "../config.js";
import { OpenAIService } from "../services/openai.js";
import { assistantRequestSchema } from "../schemas/translate.schema.js";
import { ApiError } from "../middleware/errorHandler.js";

const assistant = new Hono();

/**
 * POST /api/assistant — standalone assistant chatbot ("Lingo").
 * Body: { messages: [{role,content}] }
 * 200:  { reply, model }
 */
assistant.post("/", async (c) => {
  const raw = await c.req.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  });

  const parsed = assistantRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw new ApiError(400, "INVALID_INPUT", message);
  }

  const config = getConfig(c.env);
  const openai = new OpenAIService(config);
  const { reply, model } = await openai.assistant({
    history: parsed.data.messages,
    model: config.defaultModel,
  });

  return c.json({ reply, model });
});

export default assistant;
