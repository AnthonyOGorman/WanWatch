import net from "node:net";

export type WanIpProvider = "ipify";

export type WanIpResult =
  | { ok: true; ip: string; provider: WanIpProvider; responseMs: number }
  | { ok: false; ip: null; provider: WanIpProvider; responseMs: number | null; error: string };

export function parseIpifyResponse(json: unknown): string {
  if (!json || typeof json !== "object") throw new Error("Invalid response");
  const ip = (json as { ip?: unknown }).ip;
  if (typeof ip !== "string") throw new Error("Invalid response");
  if (net.isIP(ip) !== 4) throw new Error("Invalid IPv4");
  return ip;
}

export async function fetchWanIpv4(provider: WanIpProvider, opts?: { timeoutMs?: number }): Promise<WanIpResult> {
  const timeoutMs = opts?.timeoutMs ?? 5000;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const start = Date.now();
  try {
    const PROVIDER_URLS: Record<WanIpProvider, string> = {
      ipify: "https://api.ipify.org?format=json"
    };
    const url = PROVIDER_URLS[provider];
    const res = await fetch(url, { signal: controller.signal, headers: { "user-agent": "WanLogger/0.1" } });
    const responseMs = Date.now() - start;
    if (!res.ok) {
      return { ok: false, ip: null, provider, responseMs, error: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as unknown;
    const ip = parseIpifyResponse(json);
    return { ok: true, ip, provider, responseMs };
  } catch (e) {
    const responseMs = Date.now() - start;
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return { ok: false, ip: null, provider, responseMs: Number.isFinite(responseMs) ? responseMs : null, error: msg };
  } finally {
    clearTimeout(t);
  }
}

