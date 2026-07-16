/**
 * Shared, mutable app state. Feature modules import this object and read/write
 * its fields — a single source of truth for what the app currently holds.
 */
export const state = {
  selectedMode: "standard",
  lastResult: null, // { text, translation, sourceLang, targetLang }
  sourcePicker: null,
  targetPicker: null,
  contextPicker: null,
  audioEl: null,
  chatHistory: [], // AI Chat (about a translation)
  botHistory: [], // Lingo assistant conversation
  botGreeted: false,
};
