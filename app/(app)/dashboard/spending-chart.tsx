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
import { tooltipContentStyle, tooltipItemStyle, tooltipLabelStyle } from "./chart-tooltip";
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
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Daily Spending</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="h-full w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
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
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
            />
            <Bar
              dataKey="amount"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
