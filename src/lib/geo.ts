type GeoResult = { isp: string; country: string };

const cache = new Map<string, GeoResult>();

export async function lookupGeo(ip: string): Promise<GeoResult | null> {
  const cached = cache.get(ip);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,isp`, {
      signal: controller.signal,
      headers: { "user-agent": "WanLogger/0.1" }
    });
    clearTimeout(t);

    if (!res.ok) return null;
    const data = (await res.json()) as { status?: string; country?: string; isp?: string };
    if (data.status !== "success" || !data.country || !data.isp) return null;

    const result: GeoResult = { isp: data.isp, country: data.country };
    cache.set(ip, result);
    return result;
  } catch {
    return null;
  }
}
