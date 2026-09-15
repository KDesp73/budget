"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getExpensesByMonth,
  getExpenseMonths,
} from "@/app/actions/expenses";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ExpenseList from "./expense-list";
import type { DailyTotal, Expense, MonthSummary } from "@/app/actions/expenses";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--card-foreground)",
  fontSize: "12px",
  padding: "8px 10px",
};

export default function MonthTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<DailyTotal[]>([]);
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getExpenseMonths().then(setMonths);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getExpensesByMonth(year, month);
      if (cancelled) return;
      setData(result);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const refresh = async () => {
    const result = await getExpensesByMonth(year, month);
    setData(result);
  };

  const latest = months[0] ?? {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
  const canNext = year < latest.year || (year === latest.year && month < latest.month);

  const goPrev = () => {
    const ny = month === 1 ? year - 1 : year;
    const nm = month === 1 ? 12 : month - 1;
    setLoaded(false);
    setYear(ny);
    setMonth(nm);
  };

  const goNext = () => {
    if (!canNext) return;
    const ny = month === 12 ? year + 1 : year;
    const nm = month === 12 ? 1 : month + 1;
    setLoaded(false);
    setYear(ny);
    setMonth(nm);
  };

  const monthLabel = useMemo(
    () =>
      new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [year, month]
  );

  const expenses = useMemo<Expense[]>(
    () => data.flatMap((d) => d.expenses),
    [data]
  );

  const daysWithExpenses = useMemo(
    () => data.filter((d) => d.total > 0).length,
    [data]
  );
  const total = useMemo(() => data.reduce((s, d) => s + d.total, 0), [data]);
  const dailyAvg = daysWithExpenses > 0 ? total / daysWithExpenses : 0;
  const biggestDay = useMemo(
    () => Math.max(...data.map((d) => d.total), 0),
    [data]
  );

  const categories = useMemo(() => {
    const totals = new Map<string, number>();
    for (const d of data) {
      for (const e of d.expenses) {
        totals.set(e.name, (totals.get(e.name) ?? 0) + e.amount);
      }
    }
    return Array.from(totals.entries())
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [data]);
  const maxCategory = categories[0]?.[1] ?? 0;

  const chartData = useMemo(
    () =>
      data
        .filter((d) => d.total > 0)
        .map((d) => ({ day: d.day, amount: d.total })),
    [data]
  );

  if (!loaded) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-6 rounded bg-muted" />
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="h-6 w-6 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="mb-2 h-3 w-16 rounded bg-muted" />
              <div className="h-6 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-4">
          <div className="mb-4 h-4 w-28 rounded bg-muted" />
          <div className="h-44 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={goPrev} aria-label="Previous month">
          <ChevronLeft className="size-5" />
        </Button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Next month"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total</CardDescription>
            <div className="text-2xl font-bold tabular-nums">€{total.toFixed(2)}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Daily average</CardDescription>
            <div className="text-2xl font-bold tabular-nums">€{dailyAvg.toFixed(2)}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Days with expenses</CardDescription>
            <div className="text-2xl font-bold tabular-nums">{daysWithExpenses}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Biggest day</CardDescription>
            <div className="text-2xl font-bold tabular-nums">€{biggestDay.toFixed(2)}</div>
          </CardHeader>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="monthBarGradient" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(n) => `€${Number(n).toFixed(0)}`}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs text-muted-foreground"
                  width={50}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "var(--muted-foreground)", fontWeight: 500 }}
                  itemStyle={{ color: "var(--card-foreground)" }}
                  formatter={(value) => [`€${Number(value).toFixed(2)}`, "Spent"]}
                  labelFormatter={(day) => `Day ${day}`}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#monthBarGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map(([name, amount]) => (
              <div key={name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-medium tabular-nums">
                    €{amount.toFixed(2)}
                    {total > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {((amount / total) * 100).toFixed(0)}%
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${maxCategory > 0 ? (amount / maxCategory) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          {expenses.length > 0 && (
            <CardDescription>
              €{total.toFixed(2)} total · {expenses.length} entries
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses this month.</p>
          ) : (
            <ExpenseList expenses={expenses} onChanged={refresh} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}