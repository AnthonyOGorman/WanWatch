export type WebhookPayload = {
  event: "ip_change";
  ts: string;
  fromIp: string;
  toIp: string;
  isp?: string;
  country?: string;
};

export async function fireWebhook(url: string, payload: WebhookPayload): Promise<void> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", "user-agent": "WanLogger/0.1" },
      body: JSON.stringify(payload)
    });
    clearTimeout(t);
  } catch (e) {
    console.error(`[webhook] failed to fire to ${url}:`, e instanceof Error ? e.message : e);
  }
}
