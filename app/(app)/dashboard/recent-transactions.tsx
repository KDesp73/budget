"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Expense } from "@/app/actions/expenses";

export default function RecentTransactions({
  expenses,
}: {
  expenses: Expense[];
}) {
  if (expenses.length === 0) return null;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
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
      <CardFooter className="justify-end">
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
