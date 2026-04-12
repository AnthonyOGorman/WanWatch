"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function SuccessErrorChart({ data }: { data: Array<{ bucketStart: string; ok: number; err: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
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
          <Bar dataKey="ok" stackId="a" fill="#35D07F" name="Success" />
          <Bar dataKey="err" stackId="a" fill="#FF5B6E" name="Error" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

