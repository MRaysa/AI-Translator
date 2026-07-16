/**
 * A themed custom dropdown (no search) with SVG icons — used for the domain
 * context picker. Reuses the `.ss-*` styles so it matches the language pickers
 * and the app theme (borders, hover, dark/light). Returns { getValue, setValue }.
 *
 * options: [{ value, label }]   icons: { [value]: svgHtml }
 */
export function createCustomSelect(mount, { options, value, icons = {} }) {
  let current = value;
  mount.classList.add("ss");
  const iconOf = (v) => icons[v] || "";
  const labelOf = (v) => options.find((o) => o.value === v)?.label || v;

  mount.innerHTML = `
    <button type="button" class="ss-trigger" aria-haspopup="listbox" aria-expanded="false">
      <span class="ss-value"><span class="cs-ic"></span><span class="ss-label"></span></span>
      <span class="ss-caret">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
      </span>
    </button>
    <div class="ss-panel" hidden>
      <ul class="ss-list" role="listbox"></ul>
    </div>`;

  const trigger = mount.querySelector(".ss-trigger");
  const icEl = mount.querySelector(".cs-ic");
  const label = mount.querySelector(".ss-label");
  const panel = mount.querySelector(".ss-panel");
  const list = mount.querySelector(".ss-list");

  function renderTrigger() {
    icEl.innerHTML = iconOf(current);
    label.textContent = labelOf(current);
  }
  function renderList() {
    list.innerHTML = options
      .map(
        (o) =>
          `<li class="ss-option${o.value === current ? " selected" : ""}" role="option" data-value="${o.value}"><span class="cs-ic">${iconOf(o.value)}</span><span>${o.label}</span></li>`
      )
      .join("");
  }
  function open() {
    mount.classList.add("open");
    mount.closest(".card")?.classList.add("elevated");
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    renderList();
  }
  function close() {
    mount.classList.remove("open");
    mount.closest(".card")?.classList.remove("elevated");
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }
  function select(v) {
    if (v) {
      current = v;
      renderTrigger();
    }
    close();
    trigger.focus();
  }

  trigger.addEventListener("click", () => (panel.hidden ? open() : close()));
  list.addEventListener("click", (e) => {
    const li = e.target.closest(".ss-option");
    if (li) select(li.dataset.value);
  });
  document.addEventListener("click", (e) => {
    if (!mount.contains(e.target)) close();
  });

  renderTrigger();
  return {
    getValue: () => current,
    setValue: (v) => {
      current = v;
      renderTrigger();
    },
  };
}
