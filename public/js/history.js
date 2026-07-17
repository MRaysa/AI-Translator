import { els } from "./dom.js";
import { state } from "./state.js";
import { setOutput, showChip } from "./ui.js";
import { resetChat } from "./chat.js";
import { updateInputUi } from "./input.js";

const HISTORY_KEY = "ai-translator-history";
const HISTORY_MAX = 20;

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {}
}

/** Adds a translation to history (deduped) and re-renders the list. */
export function addHistory(item) {
  const list = readHistory().filter(
    (h) => !(h.text === item.text && h.targetLang === item.targetLang)
  );
  list.unshift({ ...item, at: Date.now() });
  writeHistory(list.slice(0, HISTORY_MAX));
  renderHistory();
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function esc(s) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]
  );
}

export function renderHistory() {
  const list = readHistory();
  els.historyCard.hidden = list.length === 0;
  els.historyCount.textContent = list.length ? `(${list.length})` : "";
  els.historyList.innerHTML = list
    .map((h, i) => {
      const from = h.text.length > 40 ? h.text.slice(0, 40) + "…" : h.text;
      const to = h.translation.length > 40 ? h.translation.slice(0, 40) + "…" : h.translation;
      return `<li class="history-item" data-i="${i}">
        <div class="history-main">
          <div class="history-text">${esc(from)}<span class="arrow">→</span><span class="tr">${esc(to)}</span></div>
          <div class="history-meta">${timeAgo(h.at)}</div>
        </div>
        <button class="history-del" data-del="${i}" title="Remove" aria-label="Remove">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
      </li>`;
    })
    .join("");
}

function restoreHistory(i) {
  const h = readHistory()[i];
  if (!h) return;
  els.input.value = h.text;
  state.sourcePicker.setValue(h.sourceLang);
  state.targetPicker.setValue(h.targetLang);
  setOutput(h.translation);
  state.lastResult = {
    text: h.text,
    translation: h.translation,
    sourceLang: h.sourceLang,
    targetLang: h.targetLang,
  };
  els.copy.hidden = els.listen.hidden = false;
  els.toolPanel.hidden = true;
  resetChat();
  els.chatCard.hidden = false;
  showChip(state.targetPicker.getName());
  updateInputUi();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function initHistory() {
  els.historyList.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      e.stopPropagation();
      const list = readHistory();
      list.splice(Number(del.dataset.del), 1);
      writeHistory(list);
      renderHistory();
      return;
    }
    const item = e.target.closest(".history-item");
    if (item) restoreHistory(Number(item.dataset.i));
  });
  els.clearHistory.addEventListener("click", () => {
    writeHistory([]);
    renderHistory();
  });
}
