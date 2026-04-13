import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
  server: {
    ADMIN_PASSWORD: z.string().min(1),
    COOKIE_SECRET: z.string().min(32),
    DATABASE_URL: z.string().min(1).default("file:/app/data/wanlogger.db"),
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
