import { z } from "zod";

export const settingsInputSchema = z.object({
  pollIntervalMinutes: z.number().int().min(1).max(60),
  retentionDays: z.number().int().min(1).max(3650),
  enabled: z.boolean(),
  ipProvider: z.enum(["ipify"])
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

