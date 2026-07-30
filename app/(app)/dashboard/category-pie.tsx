"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DailyTotal, Expense } from "@/app/actions/expenses";

const THRESHOLD = 2;

const COLORS = [
  "hsl(239, 84%, 67%)",
  "hsl(271, 76%, 53%)",
  "hsl(330, 81%, 60%)",
  "hsl(0, 72%, 51%)",
  "hsl(24, 95%, 53%)",
  "hsl(45, 93%, 47%)",
  "hsl(142, 71%, 45%)",
  "hsl(187, 85%, 53%)",
];
const OTHER_COLOR = "hsl(0, 0%, 70%)";

export default function CategoryPie({
  data,
  monthlyExpenses = [],
}: {
  data: DailyTotal[];
  monthlyExpenses?: Expense[];
}) {
  const categories = useMemo(() => {
    const totals = new Map<string, number>();
    const counts = new Map<string, number>();

    const monthlyTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
    if (monthlyTotal > 0) {
      totals.set("Fixed", monthlyTotal);
      counts.set("Fixed", 1);
    }

    for (const day of data) {
      for (const e of day.expenses) {
        totals.set(e.name, (totals.get(e.name) ?? 0) + e.amount);
        counts.set(e.name, (counts.get(e.name) ?? 0) + 1);
      }
    }

    const entries = Array.from(totals.entries())
      .map(([name, amount]) => ({ name, amount, count: counts.get(name) ?? 0 }))
      .sort((a, b) => b.amount - a.amount);

    const main = entries.filter((e) => e.name === "Fixed" || e.count > THRESHOLD);
    const other = entries.filter((e) => e.name !== "Fixed" && e.count <= THRESHOLD);
    const otherTotal = other.reduce((s, e) => s + e.amount, 0);

    if (otherTotal > 0) {
      main.push({ name: "Other", amount: otherTotal, count: 0 });
    }

    return main;
  }, [data, monthlyExpenses]);

  if (categories.length === 0) return null;

  const total = categories.reduce((s, c) => s + c.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>By Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              strokeWidth={0}
            >
              {categories.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.name === "Other" ? OTHER_COLOR : COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `€${Number(value).toFixed(2)}`,
                "Spent",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-1.5">
          {categories.map((cat, i) => (
            <div
              key={cat.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      cat.name === "Other" ? OTHER_COLOR : COLORS[i % COLORS.length],
                  }}
                />
                <span className="text-muted-foreground">{cat.name}</span>
              </div>
              <span className="font-medium tabular-nums">
                {((cat.amount / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
