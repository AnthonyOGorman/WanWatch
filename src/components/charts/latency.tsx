"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function LatencyChart({ data }: { data: Array<{ bucketStart: string; p50: number | null; p95: number | null }> }) {
  const filtered = data.filter((d) => d.p50 != null || d.p95 != null);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={filtered}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="bucketStart"
            tickFormatter={(v) => new Date(v).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
          />
          <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.12)" }}
            labelFormatter={(v) => new Date(String(v)).toLocaleString()}
          />
          <Legend />
          <Line type="monotone" dataKey="p50" stroke="#5B8CFF" dot={false} name="p50 (ms)" />
          <Line type="monotone" dataKey="p95" stroke="#FFB020" dot={false} name="p95 (ms)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

