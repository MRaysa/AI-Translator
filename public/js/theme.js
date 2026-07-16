import { els } from "./dom.js";

const KEY = "ai-translator-theme";

/** Applies the saved/preferred theme and wires the toggle button. */
export function initTheme() {
  const saved = localStorage.getItem(KEY);
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  document.documentElement.setAttribute("data-theme", saved || (prefersLight ? "light" : "dark"));

  els.theme.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  });
}
