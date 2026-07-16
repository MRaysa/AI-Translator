import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/**", ".wrangler/**", "dist/**", "coverage/**"] },

  js.configs.recommended,

  // Backend Worker code (Cloudflare Workers runtime globals).
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.worker },
    },
  },

  // Node scripts and config files.
  {
    files: ["scripts/**/*.{js,mjs}", "*.config.js", "vitest.config.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node, fetch: "readonly" },
    },
  },

  // Tests (Node + jsdom DOM globals).
  {
    files: ["test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser, fetch: "readonly" },
    },
  },

  // Frontend browser modules.
  {
    files: ["public/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser },
    },
  },

  // Service worker.
  {
    files: ["public/sw.js"],
    languageOptions: { globals: { ...globals.serviceworker } },
  },

  {
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
];
