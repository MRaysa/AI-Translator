/**
 * PWA support: registers the service worker and, when the browser reports the
 * app is installable, shows an install banner (bottom-left) plus a nav button.
 */
const DISMISS_KEY = "pwa-install-dismissed";

export function initPwa() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

  const navBtn = document.getElementById("installBtn");
  const card = document.getElementById("installCard");
  const cardBtn = document.getElementById("installCardBtn");
  const cardLater = document.getElementById("installCardLater");
  let deferred = null;

  const hideAll = () => {
    if (navBtn) navBtn.hidden = true;
    if (card) card.hidden = true;
  };

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    deferred = null;
    hideAll();
  }

  // Fires on Chromium browsers when the app meets installability criteria.
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    if (navBtn) navBtn.hidden = false; // always offer the subtle nav button
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    if (card && !dismissed) {
      setTimeout(() => {
        if (deferred) card.hidden = false;
      }, 1500); // let the page settle, then invite
    }
  });

  navBtn?.addEventListener("click", install);
  cardBtn?.addEventListener("click", install);
  cardLater?.addEventListener("click", () => {
    if (card) card.hidden = true;
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    hideAll();
  });
}
