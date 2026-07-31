"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CircleCheck, TriangleAlert, AlertTriangle, TrendingDown } from "lucide-react";

export default function BudgetHealth({
  projectedTotal,
  remaining,
  isOverCategoryBudget,
}: {
  projectedTotal: number;
  remaining: number;
  isOverCategoryBudget: boolean;
}) {
  const ratio = remaining > 0 ? projectedTotal / remaining : Infinity;

  let status: { label: string; icon: typeof CircleCheck; color: string; bg: string };
  if (remaining < 0) {
    status = { label: "Budget Issue", icon: TrendingDown, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" };
  } else if (ratio > 1) {
    status = { label: "At Risk", icon: AlertTriangle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30" };
  } else if (ratio > 0.7) {
    status = { label: "Caution", icon: TriangleAlert, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30" };
  } else if (isOverCategoryBudget) {
    status = { label: "Caution", icon: TriangleAlert, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30" };
  } else {
    status = { label: "On Track", icon: CircleCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" };
  }

  const Icon = status.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Health</CardTitle>
        <CardDescription>At-a-glance status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`flex items-center gap-3 rounded-lg p-3 ${status.bg}`}>
          <Icon className={`size-8 shrink-0 ${status.color}`} />
          <div>
            <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
            <p className="text-xs text-muted-foreground">
              {remaining < 0
                ? "Spending exceeds income"
                : ratio === Infinity
                  ? "No remaining budget"
                  : ratio > 1
                    ? `Projected ${((ratio - 1) * 100).toFixed(0)}% over budget`
                    : `${((1 - ratio) * 100).toFixed(0)}% of budget remaining`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
