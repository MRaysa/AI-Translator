import { api } from "./api.js";
import { els } from "./dom.js";
import { state } from "./state.js";
import { setStatus, setOutput, setLoading, showChip, toast } from "./ui.js";
import { addHistory } from "./history.js";
import { resetChat } from "./chat.js";
import { updateInputUi } from "./input.js";

export async function translate() {
  const text = els.input.value.trim();
  if (!text) {
    setStatus("Please enter some text to translate.", true);
    return;
  }

  setLoading(true);
  setOutput("");
  els.copy.hidden = els.listen.hidden = true;
  els.detected.hidden = els.toolPanel.hidden = true;
  resetChat();
  setStatus("");

  const sourceLang = state.sourcePicker.getValue();
  const targetLang = state.targetPicker.getValue();

  try {
    const data = await api.translate({
      text,
      sourceLang,
      targetLang,
      mode: state.selectedMode,
      context: state.contextPicker?.getValue() || "general",
      preserveFormatting: els.preserve.checked,
    });
    setOutput(data.translation);
    state.lastResult = { text, translation: data.translation, sourceLang, targetLang };
    els.copy.hidden = els.listen.hidden = false;
    els.chatCard.hidden = false;
    showChip(state.targetPicker.getName());
    setStatus(`Translated with ${data.model}`);
    addHistory(state.lastResult);
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    setLoading(false);
  }
}

function swap() {
  const src = state.sourcePicker.getValue();
  const from = src === "auto" ? "english" : src;
  state.sourcePicker.setValue(state.targetPicker.getValue());
  state.targetPicker.setValue(from);
  els.input.value = els.output.dataset.empty === "true" ? "" : els.output.textContent;
  setOutput("");
  els.copy.hidden = els.listen.hidden = true;
  els.detected.hidden = els.toolPanel.hidden = true;
  resetChat();
  state.lastResult = null;
  updateInputUi();
}

async function copyOutput() {
  await navigator.clipboard.writeText(els.output.textContent);
  toast("Copied to clipboard");
}

async function listen() {
  if (!state.lastResult) return;
  els.listen.disabled = true;
  try {
    const blob = await api.speak(state.lastResult.translation.slice(0, 2000));
    const url = URL.createObjectURL(blob);
    if (state.audioEl) state.audioEl.pause();
    state.audioEl = new Audio(url);
    state.audioEl.onended = () => URL.revokeObjectURL(url);
    await state.audioEl.play();
  } catch (err) {
    toast(err.message);
  } finally {
    els.listen.disabled = false;
  }
}

/** Wires the translate button, swap, copy, listen, input and clear. */
export function initTranslate() {
  els.translate.addEventListener("click", translate);
  els.swap.addEventListener("click", swap);
  els.copy.addEventListener("click", copyOutput);
  els.listen.addEventListener("click", listen);
  els.input.addEventListener("input", updateInputUi);
  els.input.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") translate();
  });
  els.clear.addEventListener("click", () => {
    els.input.value = "";
    updateInputUi();
    els.input.focus();
  });
}
