# API Reference

Base URL (production): `https://translator-app.aysasiddikameem3141.workers.dev`

All endpoints are served under a versioned prefix **`/api/v1`** (the legacy
`/api` prefix is kept as an alias). Requests and responses are JSON unless
noted (`/speak` returns audio).

## Conventions

- **Content type:** `application/json` for request bodies.
- **Request ID:** every response includes an `X-Request-Id` header.
- **Rate limiting:** responses include `X-RateLimit-Limit` and
  `X-RateLimit-Remaining`. Exceeding the limit returns `429` with a
  `Retry-After` header.
- **Errors:** non-2xx responses use a consistent envelope:

```json
{ "error": { "code": "INVALID_INPUT", "message": "text must not be empty" } }
```

Common error codes: `INVALID_JSON`, `INVALID_INPUT`, `NOT_FOUND`,
`RATE_LIMITED`, `OPENAI_ERROR`, `OPENAI_TIMEOUT`, `INTERNAL_ERROR`.

---

## POST `/api/v1/translate`

Translate text.

| Field                | Type    | Required | Default    | Notes                                                                         |
| -------------------- | ------- | -------- | ---------- | ----------------------------------------------------------------------------- |
| `text`               | string  | yes      | —          | 1–5000 chars                                                                  |
| `targetLang`         | string  | yes      | —          | language code (e.g. `bangla`)                                                 |
| `sourceLang`         | string  | no       | `auto`     | `auto` or a language code                                                     |
| `mode`               | string  | no       | `standard` | tone: `standard`, `professional`, `friendly`, `academic`, `social`, `funny`   |
| `context`            | string  | no       | `general`  | `general`, `business`, `technical`, `legal`, `medical`, `travel`, `education` |
| `preserveFormatting` | boolean | no       | `true`     | keep markdown / line breaks                                                   |

```bash
curl -X POST .../api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Good morning","targetLang":"bangla","mode":"friendly"}'
```

```json
{
  "translation": "সুপ্রভাত!",
  "sourceLang": "auto",
  "targetLang": "bangla",
  "mode": "friendly",
  "context": "general",
  "model": "gpt-4o-mini-2024-07-18"
}
```

## POST `/api/v1/tools/run`

Run an AI tool on a translation.

| Field         | Type   | Required | Notes                                   |
| ------------- | ------ | -------- | --------------------------------------- |
| `action`      | string | yes      | one of the tool keys (see `GET /tools`) |
| `text`        | string | yes      | original text                           |
| `translation` | string | yes      | translated text                         |
| `targetLang`  | string | yes      | language code                           |
| `sourceLang`  | string | no       | default `auto`                          |

Response: `{ "action": "email", "result": "…", "model": "…" }`

## POST `/api/v1/explain`

Explain a translation for a learner.
Body: `{ text, translation, targetLang, sourceLang? }` → `{ explanation, model }`.

## POST `/api/v1/chat`

Ask follow-up questions about a translation.
Body: `{ text, translation, targetLang, sourceLang?, messages: [{role, content}] }`
→ `{ reply, model }`.

## POST `/api/v1/assistant`

Standalone assistant chatbot ("Lingo").
Body: `{ messages: [{role, content}] }` → `{ reply, model }`.

## POST `/api/v1/speak`

Text-to-speech. Body: `{ text, voice? }` → **`audio/mpeg`** (MP3 binary).
`voice` ∈ `alloy` (default), `echo`, `fable`, `onyx`, `nova`, `shimmer`.

## GET endpoints

| Endpoint            | Returns                                                |
| ------------------- | ------------------------------------------------------ |
| `/api/v1/languages` | `{ source: [{code,name}], target: [{code,name}] }`     |
| `/api/v1/modes`     | `{ modes: [{key,label,emoji}] }`                       |
| `/api/v1/contexts`  | `{ contexts: [{key,label,emoji}] }`                    |
| `/api/v1/tools`     | `{ tools: [{key,label,emoji,group}] }`                 |
| `/api/v1/models`    | `{ models: [...], count }` — active OpenAI models      |
| `/api/v1/health`    | `{ status, service, version, model, time, requestId }` |
