import { api } from "./api.js";
import { els } from "./dom.js";
import { state } from "./state.js";
import { renderMarkdown } from "./markdown.js";
import { toast } from "./ui.js";
import { TOOL_ICONS } from "./icons.js";

const REWRITE_TOOLS = new Set([
  "improve",
  "summarize",
  "email",
  "social",
  "simplify",
  "child",
  "grammar",
]);

function openToolPanel(title) {
  els.toolTitle.textContent = title;
  els.toolPanel.hidden = false;
  els.simBadge.hidden = true;
  els.toolCopy.hidden = true;
  els.toolText.textContent = "Thinking…";
  els.toolText.classList.add("loading");
}

function setToolResult(text, { copyable = false } = {}) {
  els.toolText.innerHTML = renderMarkdown(text);
  els.toolText.dataset.raw = text;
  els.toolText.classList.remove("loading");
  els.toolCopy.hidden = !copyable;
}

async function runTool(action, btn) {
  if (!state.lastResult) return;
  const label = btn.textContent.trim();
  btn.disabled = true;
  openToolPanel(label);
  try {
    const data = await api.runTool({ action, ...state.lastResult });
    setToolResult(data.result, { copyable: REWRITE_TOOLS.has(action) });
  } catch (err) {
    setToolResult(err.message);
  } finally {
    btn.disabled = false;
  }
}

async function explainTranslation() {
  if (!state.lastResult) return;
  openToolPanel("🎓 Insight — learn while you translate");
  try {
    const data = await api.explain(state.lastResult);
    setToolResult(data.explanation);
  } catch (err) {
    setToolResult(err.message);
  }
}

/** Character-level similarity (Levenshtein ratio) as a percentage. */
function similarity(a, b) {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();
  if (!a || !b) return 0;
  if (a === b) return 100;
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return Math.round((1 - dp[m][n] / Math.max(m, n)) * 100);
}

async function reverseCheck() {
  if (!state.lastResult) return;
  const reverseTarget =
    state.lastResult.sourceLang !== "auto" ? state.lastResult.sourceLang : "english";
  openToolPanel("🔄 Reverse check");
  try {
    const data = await api.translate({
      text: state.lastResult.translation,
      sourceLang: state.lastResult.targetLang,
      targetLang: reverseTarget,
      mode: "standard",
    });
    const sim = similarity(state.lastResult.text, data.translation);
    setToolResult(data.translation);
    els.simBadge.hidden = false;
    els.simBadge.textContent = `${sim}% match`;
    els.simBadge.className = "sim-badge" + (sim >= 80 ? "" : sim >= 55 ? " mid" : " low");
  } catch (err) {
    setToolResult(err.message);
  }
}

/** Loads the AI tool chips and wires the toolbar + copy button. */
export async function initTools() {
  els.toolCopy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(els.toolText.dataset.raw || els.toolText.textContent);
    toast("Copied to clipboard");
  });

  els.toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip-btn");
    if (!btn || btn.disabled) return;
    const special = btn.dataset.special;
    if (special === "explain") explainTranslation();
    else if (special === "reverse") reverseCheck();
    else runTool(btn.dataset.tool, btn);
  });

  const { tools } = await api.tools();
  const chip = (key, label, special) =>
    `<button type="button" class="chip-btn" data-tool="${key}"${special ? ` data-special="${special}"` : ""}>${TOOL_ICONS[key] || ""}<span>${label}</span></button>`;
  els.chipsRewrite.innerHTML = tools
    .filter((t) => t.group === "rewrite")
    .map((t) => chip(t.key, t.label))
    .join("");
  els.chipsAnalyze.innerHTML =
    chip("explain", "Explain", "explain") +
    tools
      .filter((t) => t.group === "analyze")
      .map((t) => chip(t.key, t.label))
      .join("") +
    chip("reverse", "Reverse", "reverse");
}
