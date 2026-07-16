import { api } from "./api.js";
import { els } from "./dom.js";
import { state } from "./state.js";
import { bubble } from "./ui.js";

const GREETING =
  "Hi! I'm **Lingo** 👋 I can translate text, explain words or grammar, and help you use this app. What would you like?";

function hideHint() {
  els.botHint.hidden = true;
}

function toggleBot(open) {
  const show = open ?? els.botPanel.hidden;
  els.botPanel.hidden = !show;
  els.botToggle.classList.toggle("open", show);
  if (show) {
    hideHint();
    if (!state.botGreeted) {
      state.botGreeted = true;
      bubble(els.botMessages, "ai", GREETING, "", true);
    }
    els.botInput.focus();
  }
}

async function sendBot(message) {
  const text = (message || "").trim();
  if (!text) return;
  bubble(els.botMessages, "user", text);
  state.botHistory.push({ role: "user", content: text });
  els.botInput.value = "";
  els.botSend.disabled = true;
  const typing = bubble(els.botMessages, "ai", "Typing…", "typing");
  try {
    const data = await api.assistant({ messages: state.botHistory.slice(-24) });
    typing.remove();
    bubble(els.botMessages, "ai", data.reply, "", true);
    state.botHistory.push({ role: "assistant", content: data.reply });
  } catch (err) {
    typing.textContent = err.message;
    typing.classList.remove("typing");
  } finally {
    els.botSend.disabled = false;
    els.botInput.focus();
  }
}

/** Wires the floating Lingo assistant and shows a one-time greeting bubble. */
export function initAssistant() {
  els.botToggle.addEventListener("click", () => toggleBot());
  els.botClose.addEventListener("click", () => toggleBot(false));
  els.botForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendBot(els.botInput.value);
  });
  els.botQuick.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-q]");
    if (btn) sendBot(btn.dataset.q);
  });
  els.botHintClose.addEventListener("click", hideHint);
  setTimeout(() => {
    if (els.botPanel.hidden) els.botHint.hidden = false;
  }, 3500);
}
