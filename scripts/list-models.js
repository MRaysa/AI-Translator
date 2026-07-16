#!/usr/bin/env node
/**
 * One-off helper: lists the OpenAI models active for your API key.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npm run list-models
 * or on Windows PowerShell:
 *   $env:OPENAI_API_KEY="sk-..."; npm run list-models
 *
 * It also reads .dev.vars if present, so you don't have to re-type the key.
 */
import { readFileSync } from "node:fs";

function loadKeyFromDevVars() {
  try {
    const contents = readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+)\s*$/);
      if (match) return match[1].trim();
    }
  } catch {
    /* no .dev.vars — fine */
  }
  return null;
}

const apiKey = process.env.OPENAI_API_KEY || loadKeyFromDevVars();
const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

if (!apiKey) {
  console.error("❌ No OPENAI_API_KEY found (env var or .dev.vars).");
  process.exit(1);
}

const res = await fetch(`${baseUrl}/models`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

if (!res.ok) {
  const body = await res.text();
  console.error(`❌ OpenAI returned ${res.status}: ${body}`);
  process.exit(1);
}

const { data } = await res.json();
const ids = [...new Set(data.map((m) => m.id))].sort();

console.log(`✅ ${ids.length} models active for this key:\n`);
for (const id of ids) console.log("  - " + id);

// Highlight models commonly used for translation.
const recommended = ids.filter((id) => /^gpt-4o|^gpt-4\.1|^o[0-9]/.test(id));
if (recommended.length) {
  console.log("\n💡 Good translation candidates:");
  for (const id of recommended) console.log("  * " + id);
}
