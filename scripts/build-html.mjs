/*
 * Assembles public/index.html from the fragments in partials/.
 *
 * The page is a single static file for the browser, but the *source* is split
 * by section so each part is small and easy to edit. Edit files in partials/
 * (never public/index.html directly), then run `npm run build:html`.
 *
 * Each `<!-- include: name.html -->` line in index.template.html is replaced,
 * verbatim, by the contents of partials/name.html.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const partialsDir = join(root, "partials");
const outFile = join(root, "public", "index.html");

const INCLUDE = /^[ \t]*<!--\s*include:\s*([\w.-]+)\s*-->[ \t]*$/;

const template = readFileSync(join(partialsDir, "index.template.html"), "utf8");
const used = new Set();

const out = template
  .split("\n")
  .map((line) => {
    const match = line.match(INCLUDE);
    if (!match) return line;
    const name = match[1];
    used.add(name);
    // Insert verbatim (partials already carry their final indentation) and
    // drop the fragment's trailing newline so blank lines stay predictable.
    return readFileSync(join(partialsDir, name), "utf8").replace(/\n$/, "");
  })
  .join("\n");

writeFileSync(outFile, out);

// Warn about any partial that exists but is never included (likely a mistake).
const includable = readdirSync(partialsDir).filter(
  (f) => f.endsWith(".html") && f !== "index.template.html"
);
const orphans = includable.filter((f) => !used.has(f));
if (orphans.length) console.warn("Warning: unused partials:", orphans.join(", "));

console.log(`Built public/index.html from ${used.size} partials.`);
