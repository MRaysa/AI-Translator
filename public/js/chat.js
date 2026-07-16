import { api } from "./api.js";
import { els } from "./dom.js";
import { state } from "./state.js";
import { bubble } from "./ui.js";

/** Resets the "Ask AI about this translation" panel. */
export function resetChat() {
  state.chatHistory = [];
  els.chatMessages.innerHTML = "";
  els.chatCard.hidden = true;
}

async function sendChat(message) {
  if (!state.lastResult || !message.trim()) return;
  const text = message.trim();
  bubble(els.chatMessages, "user", text);
  state.chatHistory.push({ role: "user", content: text });
  els.chatInput.value = "";
  els.chatSend.disabled = true;
  const typing = bubble(els.chatMessages, "ai", "Typing…", "typing");
  try {
    const data = await api.chat({
      text: state.lastResult.text,
      translation: state.lastResult.translation,
      sourceLang: state.lastResult.sourceLang,
      targetLang: state.lastResult.targetLang,
      messages: state.chatHistory,
    });
    typing.remove();
    bubble(els.chatMessages, "ai", data.reply, "", true);
    state.chatHistory.push({ role: "assistant", content: data.reply });
  } catch (err) {
    typing.textContent = err.message;
    typing.classList.remove("typing");
  } finally {
    els.chatSend.disabled = false;
    els.chatInput.focus();
  }
}

export function initChat() {
  els.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendChat(els.chatInput.value);
  });
  els.chatQuick.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-q]");
    if (btn) sendChat(btn.dataset.q);
  });
}
