/**
 * Thin client for the Worker API. Each method returns parsed JSON and throws
 * an Error with the server's message on failure — callers just try/catch.
 */
async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || "Request failed.");
  return data;
}

export const api = {
  languages: () => getJSON("/api/languages"),
  modes: () => getJSON("/api/modes"),
  contexts: () => getJSON("/api/contexts"),
  tools: () => getJSON("/api/tools"),

  translate: (payload) => postJSON("/api/translate", payload),
  runTool: (payload) => postJSON("/api/tools/run", payload),
  explain: (payload) => postJSON("/api/explain", payload),
  chat: (payload) => postJSON("/api/chat", payload),
  assistant: (payload) => postJSON("/api/assistant", payload),

  /** Text-to-speech — returns an audio Blob. */
  async speak(text) {
    const res = await fetch("/api/speak", {
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
