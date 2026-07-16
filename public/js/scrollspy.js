/** Highlights the nav link for the section currently in view. */
export function initScrollspy() {
  const links = [...document.querySelectorAll(".nav-links a")];
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const sections = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.remove("active"));
          map.get(entry.target.id)?.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => observer.observe(s));
}
