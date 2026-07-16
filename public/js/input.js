import { els } from "./dom.js";

const DRAFT_KEY = "ai-translator-draft";

/** Updates counter, word/reading stats, clear-button, and auto-saves a draft. */
export function updateInputUi() {
  const text = els.input.value;
  els.count.textContent = text.length;
  els.clear.hidden = text.length === 0;

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  els.stats.hidden = text.length === 0;
  els.statWords.textContent = words;
  els.statChars.textContent = text.length;
  const seconds = Math.max(1, Math.round((words / 200) * 60)); // ~200 wpm
  els.statRead.textContent = seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;

  try {
    if (text) localStorage.setItem(DRAFT_KEY, text);
    else localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

/** Restores the last unsent draft on load. */
export function restoreDraft() {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      els.input.value = draft;
      updateInputUi();
    }
  } catch {}
}
