"use client";

import { useMemo } from "react";
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

  const delta = currentTotal - previousTotal;
  const pctChange = previousTotal > 0 ? (delta / previousTotal) * 100 : 0;

  if (previousTotal === 0 && currentTotal === 0) return null;

  const isUp = delta > 0;
  const isDown = delta < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const colorClass = isUp ? "text-destructive" : isDown ? "text-emerald-500" : "text-muted-foreground";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`size-5 ${colorClass}`} />
        <span className={`text-xl font-bold ${colorClass}`}>
          {isUp ? "+" : ""}{pctChange.toFixed(1)}%
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">This period</span>
        <span className="font-semibold tabular-nums">€{currentTotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Previous</span>
        <span className="font-semibold tabular-nums">€{previousTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
