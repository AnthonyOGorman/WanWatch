"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LogItem = {
  id: number;
  ts: string;
  ip: string | null;
  ok: boolean;
  responseMs: number | null;
  provider: string;
  error: string | null;
};

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Preset = "today" | "week" | "month";

function applyPreset(preset: Preset): { from: string; to: string } {
  const now = new Date();
  const to = toDatetimeLocalValue(now);
  if (preset === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { from: toDatetimeLocalValue(start), to };
  }
  if (preset === "week") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from: toDatetimeLocalValue(start), to };
  }
  // month
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: toDatetimeLocalValue(start), to };
}

export function LogsView() {
  const now = new Date();
  const [from, setFrom] = useState(() => toDatetimeLocalValue(new Date(now.getTime() - 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(() => toDatetimeLocalValue(now));
  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [okFilter, setOkFilter] = useState<"all" | "ok" | "err">("all");
  const [items, setItems] = useState<LogItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    let ok = 0, err = 0;
    for (const i of items) { if (i.ok) ok++; else err++; }
    return { ok, err };
  }, [items]);

  function selectPreset(preset: Preset) {
    const range = applyPreset(preset);
    setFrom(range.from);
    setTo(range.to);
    setActivePreset(preset);
  }

  function handleFromChange(v: string) { setFrom(v); setActivePreset(null); }
  function handleToChange(v: string)   { setTo(v);   setActivePreset(null); }

  async function loadPage(reset: boolean) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("from", new Date(from).toISOString());
      params.set("to", new Date(to).toISOString());
      params.set("limit", "100");
      if (okFilter === "ok") params.set("ok", "true");
      if (okFilter === "err") params.set("ok", "false");
      if (!reset && nextCursor) params.set("cursor", String(nextCursor));

      const res = await fetch(`/api/logs?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const data = (await res.json()) as { items: LogItem[]; nextCursor: number | null };
      setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      setNextCursor(data.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, okFilter]);

  const exportParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("from", new Date(from).toISOString());
    params.set("to", new Date(to).toISOString());
    if (okFilter === "ok") params.set("ok", "true");
    if (okFilter === "err") params.set("ok", "false");
    return params.toString();
  }, [from, to, okFilter]);

  const exportCsvUrl  = `/api/export.csv?${exportParams}`;
  const exportJsonUrl = `/api/export.json?${exportParams}`;

  const presets: { key: Preset; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week",  label: "7 days" },
    { key: "month", label: "30 days" }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick-range presets */}
          <div className="mb-3 flex gap-2">
            {presets.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => selectPreset(key)}
                className={[
                  "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                  activePreset === key
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-white/5 text-muted hover:bg-white/10 hover:text-text"
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <div className="text-sm text-muted">From</div>
              <Input type="datetime-local" value={from} onChange={(e) => handleFromChange(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-muted">To</div>
              <Input type="datetime-local" value={to} onChange={(e) => handleToChange(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-muted">Status</div>
              <select
                className="h-10 w-full rounded-md border border-border bg-black/20 px-3 text-sm text-text outline-none focus:ring-2 focus:ring-brand/60"
                value={okFilter}
                onChange={(e) => setOkFilter(e.target.value as typeof okFilter)}
              >
                <option value="all">All</option>
                <option value="ok">Success</option>
                <option value="err">Error</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={() => void loadPage(true)} disabled={loading} className="w-full">
                Refresh
              </Button>
              <a href={exportCsvUrl} className="w-full">
                <Button variant="ghost" className="w-full">CSV</Button>
              </a>
              <a href={exportJsonUrl} className="w-full">
                <Button variant="ghost" className="w-full">JSON</Button>
              </a>
            </div>
          </div>

          <div className="mt-3 text-sm text-muted">
            {items.length} rows • {summary.ok} ok • {summary.err} error
          </div>
          {error ? <div className="mt-2 text-sm text-bad">{error}</div> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-border">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2 pr-4">OK</th>
                  <th className="py-2 pr-4">ms</th>
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Error</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 whitespace-nowrap text-muted">{new Date(r.ts).toLocaleString()}</td>
                    <td className="py-2 pr-4 font-medium">{r.ip ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <span className={r.ok ? "text-good" : "text-bad"}>{r.ok ? "true" : "false"}</span>
                    </td>
                    <td className="py-2 pr-4 text-muted">{r.responseMs ?? "—"}</td>
                    <td className="py-2 pr-4 text-muted">{r.provider}</td>
                    <td className="py-2 pr-4 text-muted">{r.error ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              variant="secondary"
              onClick={() => void loadPage(false)}
              disabled={loading || !nextCursor}
              className="min-w-40"
            >
              {nextCursor ? (loading ? "Loading..." : "Load more") : "No more"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
