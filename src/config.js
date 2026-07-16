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
    version: env.APP_VERSION || "1.0.0",
    // Rate limiting (per client IP, per window)
    rateLimit: Number(env.RATE_LIMIT) || 60,
    rateWindowSec: Number(env.RATE_WINDOW_SEC) || 60,
    // Guard rails
    maxInputChars: 5000,
    requestTimeoutMs: 30000,
  };
}
