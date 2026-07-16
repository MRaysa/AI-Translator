// Generates PNG app icons from the SVG sources for reliable PWA installability.
// Run from the project root: node scripts/gen-icons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";

async function render(src, size, out) {
  await sharp(readFileSync(`public/${src}`), { density: 1200 })
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(`public/${out}`);
  console.log("wrote", out);
}

await render("favicon.svg", 192, "icon-192.png");
await render("favicon.svg", 512, "icon-512.png");
await render("icon-maskable.svg", 512, "icon-maskable-512.png");
console.log("done");
