import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
  server: {
    ADMIN_PASSWORD: z.string().min(1),
    COOKIE_SECRET: z.string().min(32),
    DATABASE_URL: z.string().min(1).default("file:/app/data/wanwatch.db"),
    TZ: z.string().optional(),
    API_KEY: z.string().min(16).optional()
  },
  client: {},
  runtimeEnv: {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    TZ: process.env.TZ,
    API_KEY: process.env.API_KEY
  }
});

let validated = false;

/**
 * Force validation of server-side environment variables on first runtime use.
 * This keeps build-time behavior intact while enforcing the schema in live code paths.
 */
export function getValidatedEnv() {
  if (!validated) {
    void env.ADMIN_PASSWORD;
    void env.COOKIE_SECRET;
    void env.DATABASE_URL;
    void env.API_KEY;
    validated = true;
  }
  return env;
}
