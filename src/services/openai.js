import {
  buildTranslationMessages,
  buildExplainMessages,
  buildToolMessages,
  buildChatMessages,
  buildAssistantMessages,
} from "../lib/prompt.js";
import { ApiError } from "../middleware/errorHandler.js";

/**
 * Thin wrapper around the OpenAI REST API using fetch (no SDK needed —
 * keeps the Worker bundle small and dependency-free).
 */
export class OpenAIService {
  constructor(config) {
    if (!config.openaiApiKey) {
      throw new ApiError(
        500,
        "CONFIG_ERROR",
        "OPENAI_API_KEY is not configured on the server."
      );
    }
    this.apiKey = config.openaiApiKey;
    this.baseUrl = config.openaiBaseUrl;
    this.timeoutMs = config.requestTimeoutMs;
  }

  async #request(path, init) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          body?.error?.message || `OpenAI request failed (${res.status})`;
        // Map upstream auth/quota errors to sensible client-facing codes.
        const code =
          res.status === 401
            ? "OPENAI_AUTH_ERROR"
            : res.status === 429
            ? "OPENAI_RATE_LIMIT"
            : "OPENAI_ERROR";
        throw new ApiError(res.status === 401 ? 500 : 502, code, message);
      }
      return body;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err.name === "AbortError") {
        throw new ApiError(504, "OPENAI_TIMEOUT", "OpenAI request timed out.");
      }
      throw new ApiError(502, "OPENAI_ERROR", err.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Returns a de-duplicated, sorted list of available model ids. */
  async listModels() {
    const body = await this.#request("/models", { method: "GET" });
    const ids = (body.data || []).map((m) => m.id);
    return [...new Set(ids)].sort();
  }

  /** Translates text and returns the translated string. */
  async translate({ text, sourceLang, targetLang, model, mode, context, preserveFormatting }) {
    const messages = buildTranslationMessages({
      text,
      sourceLang,
      targetLang,
      mode,
      context,
      preserveFormatting,
    });
    const body = await this.#request("/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model,
        messages,
        temperature: mode === "funny" ? 0.8 : 0.2,
      }),
    });

    const translation = body?.choices?.[0]?.message?.content?.trim();
    if (!translation) {
      throw new ApiError(
        502,
        "OPENAI_EMPTY_RESPONSE",
        "OpenAI returned an empty translation."
      );
    }
    return { translation, model: body.model || model };
  }

  /** Runs an AI Tool (improve/summarize/email/alternatives/…). */
  async runTool({ action, text, translation, sourceLang, targetLang, model }) {
    const messages = buildToolMessages({ action, text, translation, sourceLang, targetLang });
    const body = await this.#request("/chat/completions", {
      method: "POST",
      body: JSON.stringify({ model, messages, temperature: 0.5 }),
    });
    const result = body?.choices?.[0]?.message?.content?.trim();
    if (!result) {
      throw new ApiError(502, "OPENAI_EMPTY_RESPONSE", "OpenAI returned an empty result.");
    }
    return { result, model: body.model || model };
  }

  /** AI chat about a translation; returns the assistant's reply. */
  async chat({ text, translation, sourceLang, targetLang, history, model }) {
    const messages = buildChatMessages({ text, translation, sourceLang, targetLang, history });
    const body = await this.#request("/chat/completions", {
      method: "POST",
      body: JSON.stringify({ model, messages, temperature: 0.5 }),
    });
    const reply = body?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new ApiError(502, "OPENAI_EMPTY_RESPONSE", "OpenAI returned an empty reply.");
    }
    return { reply, model: body.model || model };
  }

  /** Standalone assistant chatbot ("Lingo"); returns the assistant's reply. */
  async assistant({ history, model }) {
    const messages = buildAssistantMessages(history);
    const body = await this.#request("/chat/completions", {
      method: "POST",
      body: JSON.stringify({ model, messages, temperature: 0.6 }),
    });
    const reply = body?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new ApiError(502, "OPENAI_EMPTY_RESPONSE", "OpenAI returned an empty reply.");
    }
    return { reply, model: body.model || model };
  }

  /** Explains a translation for a learner; returns a short English explanation. */
  async explain({ text, translation, sourceLang, targetLang, model }) {
    const messages = buildExplainMessages({ text, translation, sourceLang, targetLang });
    const body = await this.#request("/chat/completions", {
      method: "POST",
      body: JSON.stringify({ model, messages, temperature: 0.4 }),
    });
    const explanation = body?.choices?.[0]?.message?.content?.trim();
    if (!explanation) {
      throw new ApiError(502, "OPENAI_EMPTY_RESPONSE", "OpenAI returned an empty explanation.");
    }
    return { explanation, model: body.model || model };
  }

  /** Generates speech audio (MP3) from text. Returns an ArrayBuffer. */
  async speak({ text, voice }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/audio/speech`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "tts-1", voice, input: text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApiError(502, "OPENAI_TTS_ERROR", err?.error?.message || "TTS request failed.");
      }
      return await res.arrayBuffer();
    } catch (e) {
      if (e instanceof ApiError) throw e;
      if (e.name === "AbortError") throw new ApiError(504, "OPENAI_TIMEOUT", "TTS request timed out.");
      throw new ApiError(502, "OPENAI_TTS_ERROR", e.message);
    } finally {
      clearTimeout(timeout);
    }
  }
}
