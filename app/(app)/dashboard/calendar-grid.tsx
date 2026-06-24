"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DailyTotal } from "@/app/actions/expenses";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function heatColor(ratio: number): string {
  if (ratio === 0) return "bg-muted text-muted-foreground";
  if (ratio < 0.25) return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200";
  if (ratio < 0.5) return "bg-lime-100 text-lime-900 dark:bg-lime-900/40 dark:text-lime-200";
  if (ratio < 0.75) return "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200";
  return "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200";
}

export default function CalendarGrid({
  data,
  year,
  month,
  onPrev,
  onNext,
}: {
  data: DailyTotal[];
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [mode, setMode] = useState<"separate" | "heatmap">("separate");

  const maxTotal = useMemo(
    () => Math.max(...data.map((d) => d.total), 1),
    [data]
  );

  const dayMap = useMemo(() => {
    const m = new Map<number, DailyTotal>();
    for (const d of data) m.set(d.day, d);
    return m;
  }, [data]);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Calendar</CardTitle>
          <div className="flex rounded-lg border text-xs">
            <button
              type="button"
              onClick={() => setMode("separate")}
              className={`rounded-l-lg px-2.5 py-1 transition-colors ${
                mode === "separate"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Separate
            </button>
            <button
              type="button"
              onClick={() => setMode("heatmap")}
              className={`rounded-r-lg px-2.5 py-1 transition-colors ${
                mode === "heatmap"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Heatmap
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={onPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[120px] text-center text-sm font-medium">
            {monthName}
          </span>
          <Button variant="ghost" size="xs" onClick={onNext}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;

            const info = dayMap.get(day);
            const amount = info?.total ?? 0;

            if (mode === "heatmap") {
              return (
                <div
                  key={day}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors ${heatColor(amount / maxTotal)}`}
                >
                  <span className="font-medium">{day}</span>
                  {amount > 0 && (
                    <span className="mt-0.5 text-[10px] leading-none">
                      €{amount.toFixed(0)}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div
                key={day}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border bg-background"
              >
                <span className="text-sm font-medium">{day}</span>
                {amount > 0 ? (
                  <span className="mt-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                    €{amount.toFixed(0)}
                  </span>
                ) : (
                  <span className="mt-0.5 text-[10px] text-muted-foreground/40">
                    -
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
