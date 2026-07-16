// AI Translator — app bootstrap.
// Each concern lives in its own module under ./js/; this file just wires the
// features together and kicks off the initial data loads.

import { initTheme } from "./js/theme.js";
import { initScrollspy } from "./js/scrollspy.js";
import { initTranslate } from "./js/translate.js";
import { initChat } from "./js/chat.js";
import { initAssistant } from "./js/assistant.js";
import { initTools } from "./js/tools.js";
import { initHistory, renderHistory } from "./js/history.js";
import { loadModes, loadContexts, loadLanguages } from "./js/languages.js";
import { restoreDraft } from "./js/input.js";
import { setStatus } from "./js/ui.js";
import { initPwa } from "./js/pwa.js";
import { initVoice } from "./js/voice.js";

// Wire up UI + event handlers.
initPwa();
initTheme();
initScrollspy();
initTranslate();
initChat();
initAssistant();
initHistory();
initVoice();

// Load data (independent; failures are non-fatal except languages).
initTools().catch(() => {});
loadModes().catch(() => {});
loadContexts().catch(() => {});
loadLanguages()
  .then(() => {
    restoreDraft();
    renderHistory();
  })
  .catch((err) => setStatus(err.message, true));
