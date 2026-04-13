export type WebhookPayload = {
  event: "ip_change";
  ts: string;
  fromIp: string;
  toIp: string;
  isp?: string;
  country?: string;
};

// Private/internal IP ranges that must never be contacted via user-supplied URLs.
const BLOCKED_HOSTNAME_RE =
  /^(localhost|0\.0\.0\.0|::1)$|^127\.|^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\.|^169\.254\./;

function validateWebhookUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return "invalid URL";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return `disallowed protocol "${parsed.protocol}"`;
  }
  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAME_RE.test(host)) {
    return `blocked private/internal host "${host}"`;
  }
  return null; // valid
}

export async function fireWebhook(url: string, payload: WebhookPayload): Promise<void> {
  const reason = validateWebhookUrl(url);
  if (reason) {
    console.warn(`[webhook] blocked: ${reason}`);
    return;
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", "user-agent": "WanWatch/0.1" },
      body: JSON.stringify(payload)
    });
    clearTimeout(t);
  } catch (e) {
    console.error("[webhook] delivery failed:", e instanceof Error ? e.message : e);
  }
}
