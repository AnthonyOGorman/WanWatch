"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Settings = {
  pollIntervalMinutes: number;
  retentionDays: number;
  enabled: boolean;
  ipProvider: "ipify";
};

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [latestTs, setLatestTs] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPollEstimate = useMemo(() => {
    if (!settings?.enabled) return "Disabled";
    if (!latestTs) return `~${settings.pollIntervalMinutes} min`;
    const last = new Date(latestTs).getTime();
    const next = last + settings.pollIntervalMinutes * 60 * 1000;
    const diffMs = next - Date.now();
    const mins = Math.max(0, Math.round(diffMs / 60000));
    return `~${mins} min`;
  }, [latestTs, settings?.enabled, settings?.pollIntervalMinutes]);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load settings (${res.status})`);
    const s = (await res.json()) as Settings;
    setSettings(s);

    const logs = await fetch("/api/logs?limit=1", { cache: "no-store" });
    if (logs.ok) {
      const data = (await logs.json()) as { items: Array<{ ts: string }> };
      setLatestTs(data.items[0]?.ts ?? null);
    }
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Save failed (${res.status})`);
      }
      const next = (await res.json()) as Settings;
      setSettings(next);
      alert("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted">{error ? error : "Loading..."}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Polling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted">Enabled</div>
              <div className="mt-2">
                <Switch checked={settings.enabled} onChange={(v) => setSettings({ ...settings, enabled: v })} />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted">Next poll estimate</div>
              <div className="mt-2 text-sm text-text">{nextPollEstimate}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Poll interval (minutes)</div>
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.pollIntervalMinutes}
                onChange={(e) => setSettings({ ...settings, pollIntervalMinutes: Number(e.target.value) })}
              />
              <div className="mt-1 text-xs text-muted">1–60 minutes (default 5).</div>
            </div>
            <div>
              <div className="text-sm text-muted">Provider</div>
              <select
                className="mt-0 h-10 w-full rounded-md border border-border bg-black/20 px-3 text-sm text-text outline-none focus:ring-2 focus:ring-brand/60"
                value={settings.ipProvider}
                onChange={(e) => setSettings({ ...settings, ipProvider: e.target.value as Settings["ipProvider"] })}
              >
                <option value="ipify">ipify</option>
              </select>
              <div className="mt-1 text-xs text-muted">More providers can be added later.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted">Retention (days)</div>
              <Input
                type="number"
                min={1}
                max={3650}
                value={settings.retentionDays}
                onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
              />
              <div className="mt-1 text-xs text-muted">1–3650 days (default 90).</div>
            </div>
          </div>

          {error ? <div className="mt-3 text-sm text-bad">{error}</div> : null}
          <div className="mt-4 flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="secondary" onClick={() => refresh().catch((e) => setError(String(e)))} disabled={saving}>
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
