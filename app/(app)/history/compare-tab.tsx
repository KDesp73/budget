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
import type { DailyTotal, MonthSummary } from "@/app/actions/expenses";

const COLOR_A = "hsl(239, 84%, 67%)";
const COLOR_B = "hsl(271, 76%, 53%)";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--card-foreground)",
  fontSize: "12px",
  padding: "8px 10px",
};

function summarize(d: DailyTotal[] | null) {
  if (!d) return null;
  const withSpend = d.filter((x) => x.total > 0);
  const total = d.reduce((s, x) => s + x.total, 0);
  return {
    total,
    days: withSpend.length,
    avg: withSpend.length > 0 ? total / withSpend.length : 0,
    biggest: Math.max(...d.map((x) => x.total), 0),
  };
}

function Delta({ a, b }: { a: number; b: number }) {
  if (a === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const pct = ((b - a) / a) * 100;
  const up = b > a;
  return (
    <span
      className={`text-xs font-semibold tabular-nums ${
        up ? "text-destructive" : "text-emerald-500"
      }`}
    >
      {up ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

export default function CompareTab() {
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [keyA, setKeyA] = useState("");
  const [keyB, setKeyB] = useState("");
  const [dataA, setDataA] = useState<DailyTotal[] | null>(null);
  const [dataB, setDataB] = useState<DailyTotal[] | null>(null);

  useEffect(() => {
    getExpenseMonths().then((m) => {
      setMonths(m);
      if (m.length >= 2) {
        setKeyA(`${m[1].year}-${m[1].month}`);
        setKeyB(`${m[0].year}-${m[0].month}`);
      } else if (m.length === 1) {
        setKeyB(`${m[0].year}-${m[0].month}`);
      }
    });
  }, []);

  const monthA = months.find((m) => `${m.year}-${m.month}` === keyA) ?? null;
  const monthB = months.find((m) => `${m.year}-${m.month}` === keyB) ?? null;

  useEffect(() => {
    if (!keyA) return;
    let cancelled = false;
    const [y, m] = keyA.split("-").map(Number);
    getExpensesByMonth(y, m).then((d) => {
      if (!cancelled) setDataA(d);
    });
    return () => {
      cancelled = true;
    };
  }, [keyA]);

  useEffect(() => {
    if (!keyB) return;
    let cancelled = false;
    const [y, m] = keyB.split("-").map(Number);
    getExpensesByMonth(y, m).then((d) => {
      if (!cancelled) setDataB(d);
    });
    return () => {
      cancelled = true;
    };
  }, [keyB]);

  const sumA = useMemo(() => summarize(dataA), [dataA]);
  const sumB = useMemo(() => summarize(dataB), [dataB]);

  const categoryData = useMemo(() => {
    if (!dataA || !dataB) return [];
    const totalsA = new Map<string, number>();
    const totalsB = new Map<string, number>();
    for (const d of dataA) {
      for (const e of d.expenses) {
        totalsA.set(e.name, (totalsA.get(e.name) ?? 0) + e.amount);
      }
    }
    for (const d of dataB) {
      for (const e of d.expenses) {
        totalsB.set(e.name, (totalsB.get(e.name) ?? 0) + e.amount);
      }
    }
    const keys = new Set([...totalsA.keys(), ...totalsB.keys()]);
    return Array.from(keys)
      .map((name) => ({
        name,
        a: totalsA.get(name) ?? 0,
        b: totalsB.get(name) ?? 0,
      }))
      .sort((x, y) => y.b + y.a - (x.b + x.a));
  }, [dataA, dataB]);

  if (months.length === 0) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-9 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
        </div>
        <div className="h-44 rounded-xl border" />
      </div>
    );
  }

  const selectClass =
    "h-9 w-full rounded-lg border bg-card px-3 text-sm text-foreground";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Month A (baseline)
          </label>
          <select
            value={keyA}
            onChange={(e) => setKeyA(e.target.value)}
            className={selectClass}
          >
            {months.map((m) => (
              <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Month B (to compare)
          </label>
          <select
            value={keyB}
            onChange={(e) => setKeyB(e.target.value)}
            className={selectClass}
          >
            {months.map((m) => (
              <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {months.length < 2 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              Add expenses in at least two months to compare them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {sumA && sumB && (
            <Card>
              <CardHeader>
                <CardTitle>Month overview</CardTitle>
                <CardDescription>
                  {monthB?.label} vs {monthA?.label}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <MetricRow
                  label="Total spent"
                  a={sumA.total}
                  b={sumB.total}
                  daysDiff={null}
                />
                <MetricRow
                  label="Daily average"
                  a={sumA.avg}
                  b={sumB.avg}
                  daysDiff={null}
                />
                <MetricRow
                  label="Biggest day"
                  a={sumA.biggest}
                  b={sumB.biggest}
                  daysDiff={null}
                />
                <MetricRow
                  label="Days with expenses"
                  a={sumA.days}
                  b={sumB.days}
                  daysDiff={sumB.days - sumA.days}
                />
              </CardContent>
            </Card>
          )}

          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>By category</CardTitle>
                <CardDescription>
                  Comparing spending per category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      className="text-xs text-muted-foreground"
                      interval="preserveStartEnd"
                      tickFormatter={(name: string) =>
                        name.length > 8 ? name.slice(0, 7) + "…" : name
                      }
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
                      formatter={(value, name) => [
                        `€${Number(value).toFixed(2)}`,
                        name === "a" ? monthA?.label ?? "A" : monthB?.label ?? "B",
                      ]}
                    />
                    <Bar dataKey="a" name={monthA?.label ?? "A"} fill={COLOR_A} radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="b" name={monthB?.label ?? "B"} fill={COLOR_B} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_A }} />
                    {monthA?.label ?? "A"}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_B }} />
                    {monthB?.label ?? "B"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Category changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryData.map((c) => (
                  <div key={c.name}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-muted-foreground">{c.name}</span>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          €{c.a.toFixed(0)}
                        </span>
                        <span className="font-medium tabular-nums">€{c.b.toFixed(0)}</span>
                        <Delta a={c.a} b={c.b} />
                      </div>
                    </div>
                    <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-l-full"
                        style={{ width: `${catBarPct(c.a, categoryData)}%`, backgroundColor: COLOR_A }}
                      />
                      <div
                        className="h-full rounded-r-full"
                        style={{ width: `${catBarPct(c.b, categoryData)}%`, backgroundColor: COLOR_B }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function MetricRow({
  label,
  a,
  b,
  daysDiff,
}: {
  label: string;
  a: number;
  b: number;
  daysDiff: number | null;
}) {
  const fmt = (n: number) => (daysDiff !== null ? String(n) : `€${n.toFixed(2)}`);
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">A {fmt(a)}</span>
        <span className="text-sm font-semibold tabular-nums">B {fmt(b)}</span>
        {daysDiff !== null ? (
          <span
            className={`text-xs font-semibold tabular-nums ${
              daysDiff > 0 ? "text-destructive" : daysDiff < 0 ? "text-emerald-500" : "text-muted-foreground"
            }`}
          >
            {daysDiff > 0 ? `+${daysDiff}` : daysDiff}
          </span>
        ) : (
          <Delta a={a} b={b} />
        )}
      </div>
    </div>
  );
}

function catBarPct(value: number, data: { a: number; b: number }[]) {
  const max = Math.max(...data.flatMap((x) => [x.a, x.b]), 1);
  return Math.round((value / max) * 100);
}