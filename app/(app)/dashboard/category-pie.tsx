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
import type { DailyTotal } from "@/app/actions/expenses";

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
  categories,
}: {
  data: DailyTotal[];
  categories: string[];
}) {
  const categorySet = useMemo(() => new Set(categories), [categories]);

  const slices = useMemo(() => {
    const totals = new Map<string, number>();

    for (const day of data) {
      for (const e of day.expenses) {
        totals.set(e.name, (totals.get(e.name) ?? 0) + e.amount);
      }
    }

    const entries = Array.from(totals.entries()).filter(([, amount]) => amount > 0);

    const other = entries
      .filter(([name]) => !categorySet.has(name))
      .reduce((sum, [, amount]) => sum + amount, 0);

    const result = entries
      .filter(([name]) => categorySet.has(name))
      .map(([name, amount]) => ({ name, amount }));

    if (other > 0) result.push({ name: "Other", amount: other });

    return result.sort((a, b) => b.amount - a.amount);
  }, [data, categorySet]);

  if (slices.length === 0) return null;

  const total = slices.reduce((s, c) => s + c.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>By Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              strokeWidth={0}
            >
              {slices.map((entry, i) => (
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
          {slices.map((cat, i) => (
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
                {total > 0 ? ((cat.amount / total) * 100).toFixed(0) : "0"}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
