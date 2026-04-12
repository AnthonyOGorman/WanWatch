import { describe, expect, it } from "vitest";
import { parseIpifyResponse } from "@/lib/wanIp";

describe("parseIpifyResponse", () => {
  it("parses valid ipv4", () => {
    expect(parseIpifyResponse({ ip: "1.2.3.4" })).toBe("1.2.3.4");
  });

  it("rejects invalid shapes", () => {
    expect(() => parseIpifyResponse(null)).toThrow();
    expect(() => parseIpifyResponse({})).toThrow();
    expect(() => parseIpifyResponse({ ip: 123 })).toThrow();
  });

  it("rejects non-ipv4", () => {
    expect(() => parseIpifyResponse({ ip: "not-an-ip" })).toThrow();
    expect(() => parseIpifyResponse({ ip: "2001:db8::1" })).toThrow();
  });
});

