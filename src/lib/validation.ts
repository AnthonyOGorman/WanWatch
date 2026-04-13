import { z } from "zod";

export const settingsInputSchema = z.object({
  pollIntervalMinutes: z.number().int().min(1).max(60),
  retentionDays: z.number().int().min(1).max(3650),
  enabled: z.boolean(),
  ipProvider: z.enum(["ipify", "ifconfig.me", "icanhazip", "checkip-aws"]),
  pollTimeoutSeconds: z.number().int().min(1).max(30),
  webhookUrl: z.string().url().optional().or(z.literal(""))
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
