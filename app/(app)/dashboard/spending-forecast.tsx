"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SpendingForecast({
  spentSoFar,
  currentDayOffset,
  daysInPeriod,
  remaining,
}: {
  spentSoFar: number;
  currentDayOffset: number;
  daysInPeriod: number;
  remaining: number;
}) {
  if (currentDayOffset === 0 || daysInPeriod === 0) return null;

  const dailyAvg = +(spentSoFar / currentDayOffset).toFixed(2);
  const projected = +(dailyAvg * daysInPeriod).toFixed(2);
  const diff = +(remaining - projected).toFixed(2);
  const isOver = diff < 0;

  const pctUsed = remaining > 0 ? +((spentSoFar / remaining) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Forecast</CardTitle>
        <CardDescription>Based on current pace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Daily average</span>
          <span className="font-semibold tabular-nums">€{dailyAvg.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Projected by period end</span>
          <span className="font-semibold tabular-nums">€{projected.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Budget remaining</span>
          <span className={`font-semibold tabular-nums ${remaining < 0 ? "text-destructive" : ""}`}>
            €{remaining.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-muted-foreground">Forecast</span>
          <span className={`font-semibold tabular-nums ${isOver ? "text-destructive" : "text-emerald-500"}`}>
            {isOver
              ? `€${Math.abs(diff).toFixed(2)} over`
              : `€${diff.toFixed(2)} left`}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${pctUsed > 100 ? "bg-destructive" : pctUsed > 80 ? "bg-orange-500" : "bg-primary"}`}
            style={{ width: `${Math.min(pctUsed, 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {pctUsed}% of remaining budget used so far
        </p>
      </CardContent>
    </Card>
  );
}
