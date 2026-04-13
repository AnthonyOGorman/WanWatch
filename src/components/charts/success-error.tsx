"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "./use-chart-theme";

export function SuccessErrorChart({ data }: { data: Array<{ bucketStart: string; ok: number; err: number }> }) {
  const t = useChartTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-72 w-full" />;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
        <BarChart data={data}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis
            dataKey="bucketStart"
            tickFormatter={(v) => new Date(v).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}
            tick={{ fill: t.tick, fontSize: 12 }}
            axisLine={{ stroke: t.axis }}
          />
          <YAxis tick={{ fill: t.tick, fontSize: 12 }} axisLine={false} />
          <Tooltip
            contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, color: t.tooltipText }}
            labelStyle={{ color: t.tooltipText }}
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
