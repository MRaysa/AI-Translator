import { z } from "zod";
import { isValidSource, isValidTarget } from "../lib/languages.js";
import { isValidMode } from "../lib/modes.js";
import { isValidContext } from "../lib/context.js";
import { isValidTool } from "../lib/tools.js";

/**
 * Validation schema for POST /api/translate.
 * Language codes are validated against the language map with refine() rather
 * than a giant enum — clearer errors and cheaper with 240+ languages.
 */
export const translateRequestSchema = z.object({
  text: z
    .string({ required_error: "text is required" })
    .trim()
    .min(1, "text must not be empty")
    .max(5000, "text must be 5000 characters or fewer"),
  targetLang: z
    .string({ required_error: "targetLang is required" })
    .refine(isValidTarget, {
      message: "targetLang is not a supported language code",
    }),
  sourceLang: z
    .string()
    .refine(isValidSource, {
      message: "sourceLang is not a supported language code",
    })
    .optional()
    .default("auto"),
  mode: z
    .string()
    .refine(isValidMode, { message: "mode is not supported" })
    .optional()
    .default("standard"),
  context: z
    .string()
    .refine(isValidContext, { message: "context is not supported" })
    .optional()
    .default("general"),
  preserveFormatting: z.boolean().optional().default(true),
  model: z.string().trim().min(1).optional(),
});

/** Validation for POST /api/chat. */
export const chatRequestSchema = z.object({
  text: z.string().trim().min(1, "text is required").max(5000),
  translation: z.string().trim().min(1, "translation is required").max(5000),
  targetLang: z.string().refine(isValidTarget, {
    message: "targetLang is not a supported language code",
  }),
  sourceLang: z
    .string()
    .refine(isValidSource, { message: "sourceLang is not a supported language code" })
    .optional()
    .default("auto"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .min(1, "messages is required")
    .max(20),
});

/** Validation for POST /api/assistant (standalone chatbot). */
export const assistantRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .min(1, "messages is required")
    .max(24),
});

/** Validation for POST /api/tools/run. */
export const toolRequestSchema = z.object({
  action: z.string().refine(isValidTool, { message: "unknown tool" }),
  text: z.string().trim().min(1, "text is required").max(5000),
  translation: z.string().trim().min(1, "translation is required").max(5000),
  targetLang: z.string().refine(isValidTarget, {
    message: "targetLang is not a supported language code",
  }),
  sourceLang: z
    .string()
    .refine(isValidSource, { message: "sourceLang is not a supported language code" })
    .optional()
    .default("auto"),
});

/** Validation for POST /api/explain. */
export const explainRequestSchema = z.object({
  text: z.string().trim().min(1, "text is required").max(5000),
  translation: z.string().trim().min(1, "translation is required").max(5000),
  targetLang: z.string().refine(isValidTarget, {
    message: "targetLang is not a supported language code",
  }),
  sourceLang: z
    .string()
    .refine(isValidSource, { message: "sourceLang is not a supported language code" })
    .optional()
    .default("auto"),
});

/** Validation for POST /api/speak. */
export const speakRequestSchema = z.object({
  text: z.string().trim().min(1, "text is required").max(2000),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional().default("alloy"),
});
