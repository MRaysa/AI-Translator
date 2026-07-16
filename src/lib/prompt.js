import { languageName } from "./languages.js";
import { modeInstruction } from "./modes.js";
import { contextInstruction } from "./context.js";
import { TOOLS } from "./tools.js";

/**
 * Builds the messages for a translation request.
 * The model is instructed to return ONLY the translation — no commentary,
 * no quotes, no explanations — so the output is usable as-is.
 * `mode` applies a style/tone, `context` biases terminology (see modes.js /
 * context.js), and `preserveFormatting` keeps markdown/lists intact.
 */
export function buildTranslationMessages({
  text,
  sourceLang,
  targetLang,
  mode,
  context,
  preserveFormatting = true,
}) {
  const target = languageName(targetLang);
  const source =
    sourceLang && sourceLang !== "auto"
      ? languageName(sourceLang)
      : "the detected source language";

  const lines = [
    "You are a professional translation engine.",
    `Translate the user's text from ${source} into ${target}.`,
    `Style: ${modeInstruction(mode)}`,
  ];
  const ctx = contextInstruction(context);
  if (ctx) lines.push(`Context: ${ctx}`);
  lines.push(
    "Rules:",
    "- Return ONLY the translated text.",
    "- Do NOT add quotes, notes, labels, or explanations.",
    "- Preserve meaning and placeholders (e.g. {name}, %s).",
    preserveFormatting
      ? "- Preserve ALL formatting exactly: markdown, lists, bullet points, headings, and line breaks."
      : "- Preserve line breaks.",
    "- If the text is already in the target language, return it unchanged."
  );

  return [
    { role: "system", content: lines.join("\n") },
    { role: "user", content: text },
  ];
}

/**
 * Builds messages for an AI Tool (Improve, Summarize, Email, Alternatives, …).
 * Rewrite tools return text in the target language; analyze tools return a
 * short explanation (usually English).
 */
export function buildToolMessages({ action, text, translation, sourceLang, targetLang }) {
  const tool = TOOLS[action];
  const target = languageName(targetLang);
  const source =
    sourceLang && sourceLang !== "auto" ? languageName(sourceLang) : "the source language";

  if (tool.group === "rewrite") {
    const system = [
      `You are an expert ${target} writer and editor.`,
      `Task: ${tool.instruction}`,
      `Return ONLY the resulting text in ${target}, with no preamble, labels, or quotes.`,
      "Preserve meaningful formatting and line breaks.",
    ].join("\n");
    return [
      { role: "system", content: system },
      { role: "user", content: translation },
    ];
  }

  // analyze
  const system = [
    "You are a concise, friendly language tutor.",
    `The user translated text from ${source} into ${target}.`,
    `Task: ${tool.instruction}`,
    "Keep it short and clearly formatted.",
  ].join("\n");
  const user = `Original (${source}): ${text}\nTranslation (${target}): ${translation}`;
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

/**
 * Builds messages for the AI Chat about a translation. The assistant knows the
 * original + translation and can answer follow-ups, rewrite, explain, etc.
 * `history` is the prior [{role,content}] turns.
 */
export function buildChatMessages({ text, translation, sourceLang, targetLang, history }) {
  const target = languageName(targetLang);
  const source =
    sourceLang && sourceLang !== "auto" ? languageName(sourceLang) : "the source language";

  const system = [
    "You are a helpful, friendly translation assistant.",
    `The user translated this text from ${source} into ${target}:`,
    `• Original: ${text}`,
    `• Translation: ${translation}`,
    "Answer the user's follow-up questions about this translation concisely.",
    "If they ask you to change or rewrite it (shorter, more formal, friendlier, fix grammar,",
    "a different emotion, etc.), reply with the updated version in the target language,",
    "then a brief one-line note if helpful. Keep answers short and practical.",
  ].join("\n");

  return [{ role: "system", content: system }, ...history];
}

/**
 * Builds messages for the standalone assistant chatbot ("Lingo").
 * A general translation/language helper, independent of the main translate flow.
 */
export function buildAssistantMessages(history) {
  const system = [
    "You are Lingo, the friendly AI assistant inside an AI Translator web app.",
    "You can: translate text between languages, detect a language, explain words,",
    "grammar and idioms, suggest natural phrasings, and guide users on the app's",
    "features (translation modes, domain contexts, AI tools, listen/TTS, reverse check).",
    "Keep replies concise and warm. Use short paragraphs or lists when helpful.",
    "When asked to translate, give the translation directly.",
  ].join("\n");
  return [{ role: "system", content: system }, ...history];
}

/**
 * Builds messages that ask the model to EXPLAIN a translation for a learner.
 * Returns a short, friendly explanation in English.
 */
export function buildExplainMessages({ text, translation, sourceLang, targetLang }) {
  const target = languageName(targetLang);
  const source =
    sourceLang && sourceLang !== "auto" ? languageName(sourceLang) : "the source language";

  const system = [
    "You are a friendly language tutor helping someone learn while they translate.",
    `The user translated text from ${source} into ${target}.`,
    "Explain the translation in English in 2–4 short sentences.",
    "Cover the key word choices, any nuance or tone, and one cultural or grammatical",
    "point a learner would find useful. Be concise, clear, and encouraging.",
    "Do not repeat the full translation back; focus on the insight.",
  ].join("\n");

  const user = `Original (${source}): ${text}\nTranslation (${target}): ${translation}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
