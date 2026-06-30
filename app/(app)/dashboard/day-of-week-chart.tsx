"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DailyTotal } from "@/app/actions/expenses";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DayOfWeekChart({
  data,
}: {
  data: DailyTotal[];
}) {
  const chartData = useMemo(() => {
    const dayTotals = new Array(7).fill(0);
    const dayCounts = new Array(7).fill(0);

    for (const d of data) {
      const date = new Date(d.date);
      const dayOfWeek = date.getDay();
      const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      dayTotals[idx] += d.total;
      if (d.total > 0) dayCounts[idx]++;
    }

    return DAY_NAMES.map((name, i) => ({
      day: name,
      amount: dayTotals[i],
      avg: dayCounts[i] > 0 ? dayTotals[i] / dayCounts[i] : 0,
    }));
  }, [data]);

  if (chartData.every((d) => d.amount === 0)) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Day of Week</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
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
              labelFormatter={(day) => day}
            />
            <Bar
              dataKey="amount"
              fill="hsl(271, 76%, 53%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
