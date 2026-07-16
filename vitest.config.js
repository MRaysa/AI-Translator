import { defineConfig } from "vitest/config";

// The Hono app is portable: routes take an explicit `env` object and all
// outbound OpenAI calls go through fetch (mocked in tests), so a standard
// Node test environment is sufficient and avoids the Workers-pool module
// resolution issues on paths containing spaces.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.js"],
  },
});
