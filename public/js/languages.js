import { api } from "./api.js";
import { $, els } from "./dom.js";
import { state } from "./state.js";
import { MODE_ICONS, CONTEXT_ICONS } from "./icons.js";
import { createSearchableSelect } from "./searchableSelect.js";
import { translate } from "./translate.js";

/** Loads the tone modes into a compact dropdown (same control as Context). */
export async function loadModes() {
  const { modes } = await api.modes();
  state.modePicker = createSearchableSelect(els.modeBar, {
    options: modes.map((m) => ({ code: m.key, name: m.label })),
    value: state.selectedMode,
    searchable: false,
    renderIcon: (code) => `<span class="cs-ic">${MODE_ICONS[code] || ""}</span>`,
    onChange: (code) => {
      state.selectedMode = code;
      if (state.lastResult && els.input.value.trim()) translate();
    },
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
