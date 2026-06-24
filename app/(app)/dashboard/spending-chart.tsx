"use client";

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

const formatCurrency = (n: number) => `€${n.toFixed(0)}`;

export default function SpendingChart({
  data,
}: {
  data: DailyTotal[];
}) {
  const chartData = data
    .filter((d) => d.total > 0)
    .map((d) => ({ day: d.day, amount: d.total }));

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(239, 84%, 67%)" />
                <stop offset="100%" stopColor="hsl(271, 76%, 53%)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
              label={{ value: "Day", position: "insideBottom", offset: -4 }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
              width={50}
            />
            <Tooltip
              formatter={(value) => [`€${Number(value).toFixed(2)}`, "Spent"]}
              labelFormatter={(day) => `Day ${day}`}
            />
            <Bar
              dataKey="amount"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
