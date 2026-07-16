import { els } from "./dom.js";
import { renderMarkdown } from "./markdown.js";

/** Shared UI helpers used across features. */

let toastTimer;
export function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  // Longer messages stay up longer so they can be read.
  const ms = Math.min(6000, Math.max(1800, msg.length * 55));
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), ms);
}

export function setStatus(msg, isError = false) {
  els.status.textContent = msg;
  els.status.classList.toggle("error", isError);
}

export function setOutput(text) {
  const empty = !text;
  els.output.textContent = empty ? "Your translation will appear here…" : text;
  els.output.dataset.empty = String(empty);
}

export function setLoading(on) {
  els.translate.disabled = on;
  els.spinner.hidden = !on;
  els.ctaIcon.hidden = on;
  els.ctaLabel.textContent = on ? "Translating…" : "Translate";
}

export function showChip(name) {
  els.detected.querySelector("span").textContent = name;
  els.detected.hidden = false;
}

/** Appends a chat/message bubble to a container (plain or markdown). */
export function bubble(container, role, content, cls = "", rich = false) {
  const div = document.createElement("div");
  div.className = `msg ${role === "user" ? "user" : "ai"} ${cls}`.trim();
  if (rich) div.innerHTML = renderMarkdown(content);
  else div.textContent = content;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}
