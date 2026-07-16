import { Hono } from "hono";
import { getConfig } from "../config.js";
import { OpenAIService } from "../services/openai.js";

const models = new Hono();

/** GET /api/models — lists model ids active for the configured API key. */
models.get("/", async (c) => {
  const config = getConfig(c.env);
  const openai = new OpenAIService(config);
  const ids = await openai.listModels();
  return c.json({ models: ids, count: ids.length });
});

export default models;
