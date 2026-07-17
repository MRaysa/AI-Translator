import { els } from "./dom.js";

const KEY = "ai-translator-theme";

/** Defaults to light mode; remembers the user's choice once they toggle. */
export function initTheme() {
  const saved = localStorage.getItem(KEY);
  document.documentElement.setAttribute("data-theme", saved || "light");

  els.theme.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  });
}
