import { api } from "./api.js";
import { $, els } from "./dom.js";
import { state } from "./state.js";
import { MODE_ICONS, CONTEXT_ICONS } from "./icons.js";
import { createSearchableSelect } from "./searchableSelect.js";
import { translate } from "./translate.js";

/** Loads the tone modes and wires the mode pills. */
export async function loadModes() {
  const { modes } = await api.modes();
  els.modeBar.innerHTML = modes
    .map(
      (m) =>
        `<button type="button" class="mode-pill${m.key === state.selectedMode ? " active" : ""}" role="tab" data-mode="${m.key}">${MODE_ICONS[m.key] || ""}<span>${m.label}</span></button>`
    )
    .join("");
  els.modeBar.addEventListener("click", (e) => {
    const pill = e.target.closest(".mode-pill");
    if (!pill) return;
    state.selectedMode = pill.dataset.mode;
    [...els.modeBar.children].forEach((c) => c.classList.toggle("active", c === pill));
    if (state.lastResult && els.input.value.trim()) translate();
  });
}

/** Loads the domain contexts into a searchable dropdown (same as From/To). */
export async function loadContexts() {
  const { contexts } = await api.contexts();
  state.contextPicker = createSearchableSelect(els.context, {
    options: contexts.map((c) => ({ code: c.key, name: c.label })),
    value: "general",
    searchable: false,
    renderIcon: (code) => `<span class="cs-ic">${CONTEXT_ICONS[code] || ""}</span>`,
  });
}

/** Loads languages and builds the source/target searchable dropdowns. */
export async function loadLanguages() {
  const langs = await api.languages();
  state.sourcePicker = createSearchableSelect($("sourceLang"), {
    options: langs.source,
    value: "auto",
  });
  state.targetPicker = createSearchableSelect($("targetLang"), {
    options: langs.target,
    value: "bangla",
  });
}
