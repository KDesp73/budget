"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Expense } from "@/app/actions/expenses";

export default function RecentTransactions({
  expenses,
}: {
  expenses: Expense[];
}) {
  if (expenses.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {expenses.map((e) => {
            const date = e.date
              ? new Date(e.date).toLocaleDateString("default", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "";
            return (
              <li
                key={e.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{e.name}</span>
                  <span className="text-[11px] text-muted-foreground">{date}</span>
                </div>
                <span className="shrink-0 font-semibold tabular-nums">
                  €{e.amount.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
