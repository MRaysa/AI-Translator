import { flagHtml } from "./flags.js";

/**
 * A searchable, keyboard-navigable dropdown (combobox).
 * `mount` is the container; `renderIcon(code)` returns the leading icon markup
 * (defaults to a country flag). Returns { getValue, getName, setValue }.
 */
export function createSearchableSelect(mount, { options, value, renderIcon = flagHtml }) {
  let current = value;
  let activeIndex = -1;
  let filtered = options;

  mount.innerHTML = `
    <button type="button" class="ss-trigger" aria-haspopup="listbox" aria-expanded="false">
      <span class="ss-value"><span class="ss-flag"></span><span class="ss-label"></span></span>
      <span class="ss-caret">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
      </span>
    </button>
    <div class="ss-panel" hidden>
      <input type="text" class="ss-search" placeholder="Search language…" autocomplete="off" />
      <ul class="ss-list" role="listbox"></ul>
    </div>`;

  const trigger = mount.querySelector(".ss-trigger");
  const flagEl = mount.querySelector(".ss-flag");
  const label = mount.querySelector(".ss-label");
  const panel = mount.querySelector(".ss-panel");
  const search = mount.querySelector(".ss-search");
  const list = mount.querySelector(".ss-list");

  const nameOf = (code) => options.find((o) => o.code === code)?.name || code;

  function renderLabel() {
    flagEl.innerHTML = renderIcon(current);
    label.textContent = nameOf(current);
  }

  function renderList() {
    if (filtered.length === 0) {
      list.innerHTML = `<li class="ss-empty">No matches</li>`;
      return;
    }
    list.innerHTML = filtered
      .map((o, i) => {
        const cls = [
          "ss-option",
          o.code === current ? "selected" : "",
          i === activeIndex ? "active" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<li class="${cls}" role="option" data-code="${o.code}">${renderIcon(o.code)}<span>${o.name}</span></li>`;
      })
      .join("");
  }

  const scrollActive = () =>
    list.querySelector(".ss-option.active")?.scrollIntoView({ block: "nearest" });

  function open() {
    mount.classList.add("open");
    mount.closest(".card")?.classList.add("elevated");
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    search.value = "";
    filtered = options;
    activeIndex = filtered.findIndex((o) => o.code === current);
    renderList();
    search.focus();
    scrollActive();
  }

  function close() {
    mount.classList.remove("open");
    mount.closest(".card")?.classList.remove("elevated");
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function select(code) {
    if (code) {
      current = code;
      renderLabel();
    }
    close();
    trigger.focus();
  }

  function filter(term) {
    const q = term.trim().toLowerCase();
    filtered = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;
    activeIndex = filtered.length ? 0 : -1;
    renderList();
  }

  trigger.addEventListener("click", () => (panel.hidden ? open() : close()));
  search.addEventListener("input", (e) => filter(e.target.value));
  search.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      renderList();
      scrollActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderList();
      scrollActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) select(filtered[activeIndex].code);
    } else if (e.key === "Escape") {
      close();
      trigger.focus();
    }
  });
  list.addEventListener("click", (e) => {
    const li = e.target.closest(".ss-option");
    if (li) select(li.dataset.code);
  });
  document.addEventListener("click", (e) => {
    if (!mount.contains(e.target)) close();
  });

  renderLabel();
  return {
    getValue: () => current,
    getName: () => nameOf(current),
    setValue: (code) => {
      current = code;
      renderLabel();
    },
  };
}
