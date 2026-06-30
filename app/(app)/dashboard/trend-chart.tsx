"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { PeriodSummary } from "@/app/actions/expenses";

export default function TrendChart({
  data,
}: {
  data: PeriodSummary[];
}) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    label: d.label.length > 12 ? d.label.slice(0, 10) + "…" : d.label,
    amount: d.total,
    fullLabel: d.label,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(n) => `€${Number(n).toFixed(0)}`}
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
              width={50}
            />
            <Tooltip
              formatter={(value) => [`€${Number(value).toFixed(2)}`, "Spent"]}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="hsl(239, 84%, 67%)"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(239, 84%, 67%)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
