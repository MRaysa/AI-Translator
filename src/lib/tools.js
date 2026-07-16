/**
 * AI Tools — post-translation transformations and analyses, all driven by one
 * generic endpoint. Each tool is either:
 *   - "rewrite": returns new text in the target language (copyable)
 *   - "analyze": returns a short explanation/insight (usually in English)
 * Exposed via GET /api/tools; run via POST /api/tools/run.
 */
export const TOOLS = {
  improve: {
    label: "Improve",
    emoji: "✨",
    group: "rewrite",
    instruction:
      "Rewrite it to sound more natural, fluent, and polished, keeping the same meaning.",
  },
  summarize: {
    label: "Summarize",
    emoji: "📝",
    group: "rewrite",
    instruction: "Summarize it concisely while keeping the key points.",
  },
  email: {
    label: "Email",
    emoji: "📧",
    group: "rewrite",
    instruction:
      "Rewrite it as a clear, polite, well-structured email with a greeting and a sign-off.",
  },
  social: {
    label: "Social Post",
    emoji: "📱",
    group: "rewrite",
    instruction:
      "Rewrite it as an engaging social-media post with a natural tone, relevant emojis, and 2–3 hashtags.",
  },
  simplify: {
    label: "Simplify",
    emoji: "🎯",
    group: "rewrite",
    instruction: "Rewrite it using very simple, easy-to-read language suitable for beginners.",
  },
  child: {
    label: "Kid-friendly",
    emoji: "🧒",
    group: "rewrite",
    instruction: "Rewrite it so a young child (around 7 years old) can easily understand it.",
  },
  grammar: {
    label: "Fix Grammar",
    emoji: "🔤",
    group: "rewrite",
    instruction:
      "Correct any grammar, spelling, and punctuation mistakes without changing the meaning or tone.",
  },
  alternatives: {
    label: "3 Alternatives",
    emoji: "💡",
    group: "analyze",
    instruction:
      "Give exactly three alternative translations of the text, each on its own line, labeled 'Formal:', 'Friendly:', and 'Natural:'.",
  },
  vocabulary: {
    label: "Vocabulary",
    emoji: "🧠",
    group: "analyze",
    instruction:
      "List the 4–8 most useful words. For each, one line: word — meaning in English — a very short example.",
  },
  cultural: {
    label: "Cultural Note",
    emoji: "🌍",
    group: "analyze",
    instruction:
      "Give a brief, friendly cultural note (2–3 sentences, in English) about how this phrase is used in the target culture.",
  },
  idioms: {
    label: "Idioms & Slang",
    emoji: "⚠️",
    group: "analyze",
    instruction:
      "Identify any idioms, slang, or figurative expressions and briefly explain each in English. If there are none, reply exactly: 'No idioms or slang detected.'",
  },
  emotion: {
    label: "Detect Emotion",
    emoji: "😊",
    group: "analyze",
    instruction:
      "Identify the overall emotion/tone of the text (e.g. Happy, Neutral, Angry, Sad, Excited). Start your reply with the emotion name and a matching emoji, then briefly explain why in one sentence (in English).",
  },
};

export const TOOL_KEYS = Object.keys(TOOLS);

export function isValidTool(key) {
  return Object.prototype.hasOwnProperty.call(TOOLS, key);
}
