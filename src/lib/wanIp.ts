import net from "node:net";

export type WanIpProvider = "ipify" | "ifconfig.me" | "icanhazip" | "checkip-aws";

export type WanIpResult =
  | { ok: true; ip: string; provider: WanIpProvider; responseMs: number }
  | { ok: false; ip: null; provider: WanIpProvider; responseMs: number | null; error: string };

// --- Response parsers ---

export function parseIpifyResponse(json: unknown): string {
  if (!json || typeof json !== "object") throw new Error("Invalid response");
  const ip = (json as { ip?: unknown }).ip;
  if (typeof ip !== "string") throw new Error("Invalid response");
  if (net.isIP(ip) !== 4) throw new Error("Invalid IPv4");
  return ip;
}

function parsePlainTextIp(text: string): string {
  const ip = text.trim();
  if (net.isIP(ip) !== 4) throw new Error("Invalid IPv4");
  return ip;
}

// --- Provider config ---

type ProviderConfig =
  | { url: string; format: "json" }
  | { url: string; format: "text" };

const PROVIDERS: Record<WanIpProvider, ProviderConfig> = {
  "ipify":       { url: "https://api.ipify.org?format=json", format: "json" },
  "ifconfig.me": { url: "https://ifconfig.me/ip",            format: "text" },
  "icanhazip":   { url: "https://icanhazip.com",              format: "text" },
  "checkip-aws": { url: "https://checkip.amazonaws.com",      format: "text" }
};

// --- Core fetch ---

export async function fetchWanIpv4(
  provider: WanIpProvider,
  opts?: { timeoutMs?: number }
): Promise<WanIpResult> {
  const timeoutMs = opts?.timeoutMs ?? 5000;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const config = PROVIDERS[provider];
  const start = Date.now();
  try {
    const res = await fetch(config.url, {
      signal: controller.signal,
      headers: { "user-agent": "WanLogger/0.1" }
    });
    const responseMs = Date.now() - start;
    if (!res.ok) {
      return { ok: false, ip: null, provider, responseMs, error: `HTTP ${res.status}` };
    }

    let ip: string;
    if (config.format === "json") {
      const json = (await res.json()) as unknown;
      ip = parseIpifyResponse(json);
    } else {
      const text = await res.text();
      ip = parsePlainTextIp(text);
    }

    return { ok: true, ip, provider, responseMs };
  } catch (e) {
    const responseMs = Date.now() - start;
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return {
      ok: false,
      ip: null,
      provider,
      responseMs: Number.isFinite(responseMs) ? responseMs : null,
      error: msg
    };
  } finally {
    clearTimeout(t);
  }
}

// --- Fallback fetch ---
// Tries the primary provider first; on failure tries remaining providers in order.
// Always returns the last result (even if all fail).

export async function fetchWanIpv4WithFallback(
  primary: WanIpProvider,
  opts?: { timeoutMs?: number }
): Promise<WanIpResult> {
  const fallbackOrder: WanIpProvider[] = ["ipify", "ifconfig.me", "icanhazip", "checkip-aws"];
  const order = [primary, ...fallbackOrder.filter((p) => p !== primary)];

  let last: WanIpResult | null = null;
  for (const provider of order) {
    const result = await fetchWanIpv4(provider, opts);
    last = result;
    if (result.ok) return result;
  }
  return last!;
}
