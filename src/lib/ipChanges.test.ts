import { describe, expect, it } from "vitest";
import { detectIpChanges } from "@/lib/ipChanges";

describe("detectIpChanges", () => {
  it("detects changes newest-first", () => {
    const logs = [
      { ts: "2026-01-03T00:00:00.000Z", ok: true, ip: "2.2.2.2" },
      { ts: "2026-01-02T00:00:00.000Z", ok: true, ip: "2.2.2.2" },
      { ts: "2026-01-01T00:00:00.000Z", ok: true, ip: "1.1.1.1" }
    ];
    expect(detectIpChanges(logs, 10)).toEqual([
      { ts: "2026-01-01T00:00:00.000Z", fromIp: "1.1.1.1", toIp: "2.2.2.2" }
    ]);
  });

  it("skips failures and null ip", () => {
    const logs = [
      { ts: "2026-01-04T00:00:00.000Z", ok: false, ip: null },
      { ts: "2026-01-03T00:00:00.000Z", ok: true, ip: "2.2.2.2" },
      { ts: "2026-01-02T00:00:00.000Z", ok: false, ip: "9.9.9.9" },
      { ts: "2026-01-01T00:00:00.000Z", ok: true, ip: "1.1.1.1" }
    ];
    expect(detectIpChanges(logs, 10).length).toBe(1);
  });
});

