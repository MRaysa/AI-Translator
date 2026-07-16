/**
 * Domain contexts. These bias the translation toward the right terminology
 * (business, medical, legal, …). Exposed via GET /api/contexts and used by the
 * prompt builder. "general" adds no extra instruction.
 */
export const CONTEXTS = {
  general: { label: "General", emoji: "🌐", instruction: "" },
  business: {
    label: "Business",
    emoji: "💼",
    instruction: "Use business-appropriate terminology and a professional register.",
  },
  technical: {
    label: "Technical",
    emoji: "🛠️",
    instruction: "Preserve technical terms; use precise, domain-accurate technical vocabulary.",
  },
  legal: {
    label: "Legal",
    emoji: "⚖️",
    instruction: "Use precise legal terminology and formal legal phrasing.",
  },
  medical: {
    label: "Medical",
    emoji: "🩺",
    instruction: "Use accurate medical and clinical terminology.",
  },
  travel: {
    label: "Travel",
    emoji: "✈️",
    instruction: "Use natural, everyday travel and tourism phrasing.",
  },
  education: {
    label: "Education",
    emoji: "📚",
    instruction: "Use clear, instructional, learner-friendly language.",
  },
};

export const CONTEXT_KEYS = Object.keys(CONTEXTS);

export function isValidContext(key) {
  return Object.prototype.hasOwnProperty.call(CONTEXTS, key);
}

export function contextInstruction(key) {
  return (CONTEXTS[key] || CONTEXTS.general).instruction;
}
