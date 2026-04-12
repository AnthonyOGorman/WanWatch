"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function IpChangesChart({ data }: { data: Array<{ day: string; changes: number }> }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
          />
          <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} axisLine={false} />
          <Tooltip contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.12)" }} />
          <Bar dataKey="changes" fill="#5B8CFF" name="IP changes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

