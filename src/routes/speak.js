import { Hono } from "hono";
import { getConfig } from "../config.js";
import { OpenAIService } from "../services/openai.js";
import { speakRequestSchema } from "../schemas/translate.schema.js";
import { ApiError } from "../middleware/errorHandler.js";

const speak = new Hono();

/**
 * POST /api/speak — text-to-speech via OpenAI. Returns MP3 audio.
 * Body: { text, voice? }
 */
speak.post("/", async (c) => {
  const raw = await c.req.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  });

  const parsed = speakRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw new ApiError(400, "INVALID_INPUT", message);
  }

  const config = getConfig(c.env);
  const openai = new OpenAIService(config);
  const audio = await openai.speak(parsed.data);

  return c.body(audio, 200, {
    "Content-Type": "audio/mpeg",
    "Cache-Control": "no-store",
  });
});

export default speak;
