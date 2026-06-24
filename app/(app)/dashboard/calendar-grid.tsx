"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { deleteExpense } from "@/app/actions/expenses";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
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
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { confirm } = useConfirm();

  async function handleDelete(id: number) {
    if (!(await confirm({ title: "Delete expense", message: "Delete this expense?", destructive: true, confirmLabel: "Delete" }))) return;
    const fd = new FormData();
    fd.set("id", String(id));
    await deleteExpense(fd);
    toast.success("Expense deleted");
  }

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
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors ${heatColor(amount / maxTotal)}`}
                >
                  <span className="font-medium">{day}</span>
                  {amount > 0 && (
                    <span className="mt-0.5 text-[10px] leading-none">
                      €{amount.toFixed(0)}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                type="button"
                key={day}
                onClick={() => setSelectedDay(day)}
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
              </button>
            );
          })}
        </div>

        {selectedDay !== null && (() => {
          const info = dayMap.get(selectedDay);
          const dateStr = info?.date ?? `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
          const expenses = info?.expenses ?? [];

          return (
            <div className="relative mt-3">
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {new Date(dateStr).toLocaleDateString("default", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                {expenses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No expenses</p>
                ) : (
                  <ul className="space-y-1.5">
                    {expenses.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="truncate">{e.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="tabular-nums font-medium">
                            €{e.amount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(e.id)}
                            className="text-xs text-muted-foreground hover:text-destructive"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
