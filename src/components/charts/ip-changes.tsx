"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "./use-chart-theme";

export function IpChangesChart({ data }: { data: Array<{ day: string; changes: number }> }) {
  const t = useChartTheme();
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: t.tick, fontSize: 12 }}
            axisLine={{ stroke: t.axis }}
          />
          <YAxis tick={{ fill: t.tick, fontSize: 12 }} axisLine={false} />
          <Tooltip
            contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, color: t.tooltipText }}
            labelStyle={{ color: t.tooltipText }}
          />
          <Bar dataKey="changes" fill="#5B8CFF" name="IP changes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
