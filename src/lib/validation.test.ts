import { describe, expect, it } from "vitest";
import { settingsInputSchema } from "@/lib/validation";

describe("settingsInputSchema", () => {
  it("accepts valid settings", () => {
    const parsed = settingsInputSchema.parse({
      pollIntervalMinutes: 5,
      retentionDays: 90,
      enabled: true,
      ipProvider: "ipify"
    });
    expect(parsed.pollIntervalMinutes).toBe(5);
  });

  it("rejects invalid bounds", () => {
    expect(() =>
      settingsInputSchema.parse({ pollIntervalMinutes: 0, retentionDays: 90, enabled: true, ipProvider: "ipify" })
    ).toThrow();
    expect(() =>
      settingsInputSchema.parse({ pollIntervalMinutes: 5, retentionDays: 0, enabled: true, ipProvider: "ipify" })
    ).toThrow();
  });
});

