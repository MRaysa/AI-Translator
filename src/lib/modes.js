/**
 * AI translation modes (tones/styles). Single source of truth — exposed to the
 * UI via GET /api/modes and used by the prompt builder on the backend.
 * Each mode adds a style instruction to the translation prompt.
 */
export const MODES = {
  standard: {
    label: "Standard",
    emoji: "📝",
    instruction: "Translate faithfully and naturally, matching the original tone.",
  },
  professional: {
    label: "Professional",
    emoji: "💼",
    instruction:
      "Render it in a formal, polished, business-appropriate register suitable for professional communication.",
  },
  friendly: {
    label: "Friendly",
    emoji: "😊",
    instruction: "Use a warm, casual, conversational tone, as if talking to a friend.",
  },
  academic: {
    label: "Academic",
    emoji: "🎓",
    instruction:
      "Use a precise, scholarly, formal academic register with careful word choice.",
  },
  social: {
    label: "Social",
    emoji: "📱",
    instruction:
      "Use a concise, catchy social-media style with natural, everyday expressions.",
  },
  funny: {
    label: "Funny",
    emoji: "🎭",
    instruction:
      "Add light humor and playfulness while preserving the original meaning.",
  },
};

export const MODE_KEYS = Object.keys(MODES);

export function isValidMode(key) {
  return Object.prototype.hasOwnProperty.call(MODES, key);
}

export function modeInstruction(key) {
  return (MODES[key] || MODES.standard).instruction;
}
