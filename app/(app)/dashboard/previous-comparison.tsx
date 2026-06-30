"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DailyTotal } from "@/app/actions/expenses";

export default function PreviousComparison({
  currentData,
  previousData,
}: {
  currentData: DailyTotal[];
  previousData: DailyTotal[];
}) {
  const currentTotal = useMemo(
    () => currentData.reduce((s, d) => s + d.total, 0),
    [currentData]
  );
  const previousTotal = useMemo(
    () => previousData.reduce((s, d) => s + d.total, 0),
    [previousData]
  );
  const prevDaysWithExpenses = previousData.filter((d) => d.total > 0).length;
  const curDaysWithExpenses = currentData.filter((d) => d.total > 0).length;

  const delta = currentTotal - previousTotal;
  const pctChange = previousTotal > 0 ? (delta / previousTotal) * 100 : 0;

  const prevDailyAvg = prevDaysWithExpenses > 0 ? previousTotal / prevDaysWithExpenses : 0;
  const curDailyAvg = curDaysWithExpenses > 0 ? currentTotal / curDaysWithExpenses : 0;

  if (previousTotal === 0 && currentTotal === 0) return null;

  const isUp = delta > 0;
  const isDown = delta < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const colorClass = isUp ? "text-destructive" : isDown ? "text-emerald-500" : "text-muted-foreground";

  return (
    <Card>
      <CardHeader>
        <CardTitle>vs. Previous Period</CardTitle>
        <CardDescription>Comparing total spending</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className={`size-5 ${colorClass}`} />
          <span className={`text-xl font-bold ${colorClass}`}>
            {isUp ? "+" : isDown ? "" : ""}{pctChange.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current period</span>
          <span className="font-semibold tabular-nums">€{currentTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Previous period</span>
          <span className="font-semibold tabular-nums">€{previousTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Daily avg (now / before)</span>
          <span className="font-semibold tabular-nums">
            €{curDailyAvg.toFixed(2)} / €{prevDailyAvg.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
