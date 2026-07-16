/**
 * Central configuration. Reads values from the Worker environment (env)
 * with sensible fallbacks. Keep all "magic values" here.
 */
export function getConfig(env) {
  return {
    openaiApiKey: env.OPENAI_API_KEY,
    openaiBaseUrl: env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    defaultModel: env.DEFAULT_MODEL || "gpt-4o-mini",
    defaultTargetLang: env.DEFAULT_TARGET_LANG || "english",
    // Guard rails
    maxInputChars: 5000,
    requestTimeoutMs: 30000,
  };
}
