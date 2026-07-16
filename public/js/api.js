/**
 * Thin client for the Worker API. Each method returns parsed JSON and throws
 * an Error with the server's message on failure — callers just try/catch.
 */
const BASE = "/api/v1";

async function getJSON(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

async function postJSON(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || "Request failed.");
  return data;
}

export const api = {
  languages: () => getJSON("/languages"),
  modes: () => getJSON("/modes"),
  contexts: () => getJSON("/contexts"),
  tools: () => getJSON("/tools"),

  translate: (payload) => postJSON("/translate", payload),
  runTool: (payload) => postJSON("/tools/run", payload),
  explain: (payload) => postJSON("/explain", payload),
  chat: (payload) => postJSON("/chat", payload),
  assistant: (payload) => postJSON("/assistant", payload),

  /** Text-to-speech — returns an audio Blob. */
  async speak(text) {
    const res = await fetch(BASE + "/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d?.error?.message || "Could not generate audio.");
    }
    return res.blob();
  },
};
