# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-16

### Added

- **Translation core** — 240+ languages with auto-detect, searchable pickers
  and round country flags; swap, copy, `Ctrl+Enter`.
- **AI features** — 6 tone modes, 7 domain contexts, a 12-tool AI suite
  (Improve, Summarize, Email, Social, Simplify, Kid-friendly, Fix Grammar,
  Explain, 3 Alternatives, Vocabulary, Cultural Note, Idioms & Slang,
  Detect Emotion), reverse-translation accuracy check.
- **Assistants** — per-translation AI chat and a floating "Lingo" chatbot.
- **Text-to-speech** — listen to translations (OpenAI TTS).
- **Voice input** — speak to fill the input via the Web Speech API (graceful
  fallback where unsupported).
- **Experience** — translation history + draft auto-save (localStorage),
  live word/character/reading-time stats, light/dark theme, responsive
  landing page.
- **PWA** — installable app (manifest + service worker + install banner),
  PNG/SVG app icons.
- **SEO** — meta tags, Open Graph and Twitter cards, OG image.
- **Custom error pages** — branded 404 and 500.
- **Engineering** — request IDs, `/api/v1` versioned API, per-IP rate
  limiting, security headers (CSP, HSTS, X-Frame-Options, …), Cache-Control,
  edge Brotli compression, structured logging, health/version endpoint.
- **Tooling** — GitHub Actions CI, ESLint, Prettier, Husky + lint-staged,
  commitlint (Conventional Commits), Dependabot, MIT license.
- **Tests** — Vitest suite (API validation, tools, chat, rate-limit, security
  headers, dropdown behaviour).

[1.0.0]: https://github.com/MRaysa/AI-Translator/releases/tag/v1.0.0
