import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import app from "../src/index.js";

// Worker environment (bindings) — supplied explicitly instead of via the
// Workers test pool. A dummy key is enough because fetch is mocked.
const env = {
  OPENAI_API_KEY: "sk-test-key",
  DEFAULT_MODEL: "gpt-4o-mini",
  DEFAULT_TARGET_LANG: "en",
};

/** Helper to POST JSON to the app. */
function post(path, body) {
  return app.request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    env
  );
}

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await app.request("/api/health", {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", service: "translator-app" });
  });
});

describe("GET /api/languages", () => {
  it("returns source (with auto) and target lists", async () => {
    const res = await app.request("/api/languages", {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source[0]).toEqual({ code: "auto", name: "Auto-detect" });
    expect(body.target.find((l) => l.code === "spanish")).toBeTruthy();
    expect(body.target.some((l) => l.code === "auto")).toBe(false);
    expect(body.target.length).toBeGreaterThan(200);
  });
});

describe("POST /api/translate — validation", () => {
  it("rejects empty text", async () => {
    const res = await post("/api/translate", { text: "", targetLang: "spanish" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("INVALID_INPUT");
  });

  it("rejects an unsupported target language", async () => {
    const res = await post("/api/translate", { text: "hi", targetLang: "klingon" });
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_INPUT");
  });

  it("rejects invalid JSON body", async () => {
    const res = await app.request(
      "/api/translate",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" },
      env
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_JSON");
  });
});

describe("POST /api/translate — success (OpenAI mocked)", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [{ message: { content: "Hola" } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns a translation", async () => {
    const res = await post("/api/translate", {
      text: "Hello",
      targetLang: "spanish",
      sourceLang: "english",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.translation).toBe("Hola");
    expect(body.targetLang).toBe("spanish");
    expect(body.model).toBe("gpt-4o-mini");
  });
});

describe("GET /api/modes", () => {
  it("lists translation modes", async () => {
    const res = await app.request("/api/modes", {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.modes.some((m) => m.key === "professional")).toBe(true);
    expect(body.modes.some((m) => m.key === "funny")).toBe(true);
  });
});

describe("POST /api/translate — mode", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ model: "gpt-4o-mini", choices: [{ message: { content: "Bonjour" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("accepts a valid mode and echoes it back", async () => {
    const res = await post("/api/translate", {
      text: "Hello",
      targetLang: "french",
      mode: "professional",
    });
    expect(res.status).toBe(200);
    expect((await res.json()).mode).toBe("professional");
  });

  it("rejects an invalid mode", async () => {
    const res = await post("/api/translate", {
      text: "Hello",
      targetLang: "french",
      mode: "pirate",
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_INPUT");
  });
});

describe("POST /api/explain", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ model: "gpt-4o-mini", choices: [{ message: { content: "Because…" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns an explanation", async () => {
    const res = await post("/api/explain", {
      text: "Hello",
      translation: "Bonjour",
      targetLang: "french",
      sourceLang: "english",
    });
    expect(res.status).toBe(200);
    expect((await res.json()).explanation).toBe("Because…");
  });
});

describe("GET /api/tools & /api/contexts", () => {
  it("lists AI tools with groups", async () => {
    const res = await app.request("/api/tools", {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tools.some((t) => t.key === "email" && t.group === "rewrite")).toBe(true);
    expect(body.tools.some((t) => t.key === "idioms" && t.group === "analyze")).toBe(true);
  });
  it("lists contexts", async () => {
    const res = await app.request("/api/contexts", {}, env);
    expect(res.status).toBe(200);
    expect((await res.json()).contexts.some((c) => c.key === "legal")).toBe(true);
  });
});

describe("POST /api/tools/run", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ model: "gpt-4o-mini", choices: [{ message: { content: "Dear Sir…" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("runs a valid tool", async () => {
    const res = await post("/api/tools/run", {
      action: "email",
      text: "send file",
      translation: "send the file",
      targetLang: "english",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.action).toBe("email");
    expect(body.result).toBe("Dear Sir…");
  });

  it("rejects an unknown tool", async () => {
    const res = await post("/api/tools/run", {
      action: "hypnotize",
      text: "x",
      translation: "y",
      targetLang: "english",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ model: "gpt-4o-mini", choices: [{ message: { content: "Sure!" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns a reply", async () => {
    const res = await post("/api/chat", {
      text: "Hello",
      translation: "Bonjour",
      targetLang: "french",
      sourceLang: "english",
      messages: [{ role: "user", content: "Make it more formal." }],
    });
    expect(res.status).toBe(200);
    expect((await res.json()).reply).toBe("Sure!");
  });

  it("rejects empty messages", async () => {
    const res = await post("/api/chat", {
      text: "Hello",
      translation: "Bonjour",
      targetLang: "french",
      messages: [],
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/assistant", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ model: "gpt-4o-mini", choices: [{ message: { content: "Hi there!" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns an assistant reply", async () => {
    const res = await post("/api/assistant", {
      messages: [{ role: "user", content: "What can this app do?" }],
    });
    expect(res.status).toBe(200);
    expect((await res.json()).reply).toBe("Hi there!");
  });

  it("rejects empty messages", async () => {
    const res = await post("/api/assistant", { messages: [] });
    expect(res.status).toBe(400);
  });
});

describe("unknown API route", () => {
  it("returns 404 with NOT_FOUND", async () => {
    const res = await app.request("/api/nope", {}, env);
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("NOT_FOUND");
  });
});
