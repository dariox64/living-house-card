// Builds dist/living-house-card.js from src/ (no dependencies).
// Usage: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const pkg = JSON.parse(read("package.json"));

// CSS is inlined as a template literal so `${...}` constants keep working.
const css = (p) => "`" + read(p).replace(/\\/g, "\\\\").replace(/`/g, "\\`").trim() + "\n`";

const banner = `/*! Living House Card v${pkg.version} | MIT License | https://github.com/krystianokris/living-house-card */\n`;
let out = [
  read("src/shared.js").replace("__VERSION__", pkg.version),
  read("src/presets.js"),
  read("src/house-card.js").replace("__HOUSE_CSS__", css("src/house.css")),
  read("src/house-editor.js"),
  read("src/rooms-card.js").replace("__ROOMS_CSS__", css("src/rooms.css")),
  read("src/cats-card.js").replace("__CATS_CSS__", css("src/cats.css")),
  `console.info("%c LIVING-HOUSE-CARD %c v${pkg.version} ", "background:#2563eb;color:#fff;border-radius:4px 0 0 4px", "background:#0f172a;color:#93c5fd;border-radius:0 4px 4px 0");`,
].join("\n\n");

out = `${banner}(() => {\n"use strict";\n${out}\n})();\n`;
mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist", "living-house-card.js"), out);
console.log(`dist/living-house-card.js  v${pkg.version}  ${(out.length / 1024).toFixed(1)} KB`);
