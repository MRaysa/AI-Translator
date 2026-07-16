import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { createSearchableSelect } from "../public/js/searchableSelect.js";

/** Builds a fresh DOM and exposes it as the globals the component expects. */
function mkDom() {
  // Mirrors the real (fixed) structure: the picker sits in a plain <div>,
  // NOT a <label> — a wrapping label used to forward option clicks to the
  // trigger and re-open the panel.
  const dom = new JSDOM(
    `<!doctype html><body><div class="card"><div class="opt"><span>Context</span><div id="m"></div></div></div></body>`,
    { url: "http://localhost/" }
  );
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  dom.window.Element.prototype.scrollIntoView = function () {};
  return dom;
}

describe("searchable dropdown", () => {
  it("opens, closes on select, and updates the value", () => {
    const dom = mkDom();
    const picker = createSearchableSelect(document.getElementById("m"), {
      options: [
        { code: "general", name: "General" },
        { code: "medical", name: "Medical" },
      ],
      value: "general",
      searchable: false,
      renderIcon: () => "",
    });
    const mount = document.getElementById("m");
    const panel = mount.querySelector(".ss-panel");
    const click = (el) => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

    expect(panel.hidden).toBe(true);

    click(mount.querySelector(".ss-trigger"));
    expect(panel.hidden).toBe(false); // opens

    const medical = [...mount.querySelectorAll(".ss-option")].find(
      (li) => li.dataset.code === "medical"
    );
    click(medical);
    expect(panel.hidden).toBe(true); // closes on select
    expect(picker.getValue()).toBe("medical");
  });
});
