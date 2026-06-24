"use client";

import { useState, useCallback } from "react";
import { getExpensesByMonth, exportMonthCSV } from "@/app/actions/expenses";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Settings as SettingsIcon } from "lucide-react";
import SpendingChart from "./spending-chart";
import CategoryPie from "./category-pie";
import CalendarGrid from "./calendar-grid";
import type { DailyTotal, Expense } from "@/app/actions/expenses";
import type { Settings } from "@/app/actions/settings";

export default function DashboardClient({
  initialYear,
  initialMonth,
  initialData,
  initialSettings,
  initialMonthly,
}: {
  initialYear: number;
  initialMonth: number;
  initialData: DailyTotal[];
  initialSettings: Settings;
  initialMonthly: Expense[];
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState(initialData);
  const [settings] = useState(initialSettings);
  const [monthlyExpenses] = useState(initialMonthly);

  const fetchMonth = useCallback(async (y: number, m: number) => {
    const result = await getExpensesByMonth(y, m);
    setData(result);
  }, []);

  const goPrev = () => {
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchMonth(newYear, newMonth);
  };

  const goNext = () => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchMonth(newYear, newMonth);
  };

  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalThisMonth = data.reduce((sum, d) => sum + d.total, 0);
  const savingsTarget =
    (settings.monthlySalary * settings.savingsPercentage) / 100;
  const remaining = settings.monthlySalary - totalMonthly - savingsTarget;

  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const currentDay = today.getMonth() + 1 === month && today.getFullYear() === year
    ? today.getDate()
    : daysInMonth;
  const daysLeft = daysInMonth - currentDay;
  const spentSoFar = data
    .filter((d) => d.day <= currentDay)
    .reduce((s, d) => s + d.total, 0);
  const remainingAfterSpent = remaining - spentSoFar;
  const dailyRemaining = daysLeft > 0 ? remainingAfterSpent / daysLeft : remainingAfterSpent;

  const categoryBudgetTotals = Object.fromEntries(
    Object.keys(settings.categoryBudgets).map((cat) => {
      const spent = data.reduce(
        (s, d) => s + d.expenses.filter((e) => e.name === cat).reduce((a, e) => a + e.amount, 0),
        0
      );
      return [cat, spent];
    })
  );

  const handleExport = async () => {
    const csv = await exportMonthCSV(year, month);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (settings.monthlySalary === 0 && totalMonthly === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 p-4 pt-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <SettingsIcon className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Welcome to Budget</h2>
        <p className="text-sm text-muted-foreground">
          Start by configuring your monthly salary and adding your fixed expenses in Settings.
        </p>
        <Link
          href="/settings"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Button variant="outline" size="xs" onClick={handleExport}>
          <Download className="mr-1 size-3.5" />
          CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Monthly Salary</CardDescription>
            <CardTitle className="text-2xl">
              €{settings.monthlySalary.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Fixed Expenses</CardDescription>
            <CardTitle className="text-2xl">
              €{totalMonthly.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Savings ({settings.savingsPercentage}%)</CardDescription>
            <CardTitle className="text-2xl">
              €{savingsTarget.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Remaining</CardDescription>
            <CardTitle
              className={`text-2xl ${remaining < 0 ? "text-destructive" : ""}`}
            >
              €{remaining.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingChart data={data} />
        </div>
        <CategoryPie data={data} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Month Summary</CardTitle>
              <CardDescription>
                {data.filter((d) => d.total > 0).length} days with expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total spent</span>
                <span className="font-semibold">€{totalThisMonth.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily average</span>
                <span className="font-semibold">
                  €
                  {(
                    totalThisMonth /
                    Math.max(data.filter((d) => d.total > 0).length, 1)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Biggest day</span>
                <span className="font-semibold">
                  €
                  {Math.max(...data.map((d) => d.total), 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Remaining Budget</CardTitle>
              <CardDescription>
                After fixed expenses & savings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Left this month</span>
                <span
                  className={`font-semibold ${remainingAfterSpent < 0 ? "text-destructive" : ""}`}
                >
                  €{remainingAfterSpent.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent so far</span>
                <span className="font-semibold">€{spentSoFar.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {daysLeft > 0 ? `Per day (${daysLeft}d left)` : "Per day"}
                </span>
                <span
                  className={`font-semibold ${dailyRemaining < 0 ? "text-destructive" : ""}`}
                >
                  €{dailyRemaining.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <CalendarGrid
            data={data}
            year={year}
            month={month}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      </div>

      {Object.keys(settings.categoryBudgets).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Budgets</CardTitle>
            <CardDescription>Progress toward monthly category limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.categoryBudgets).map(([cat, budget]) => {
              const spent = categoryBudgetTotals[cat] ?? 0;
              const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
              const over = spent > budget;
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{cat}</span>
                    <span className={over ? "font-semibold text-destructive" : "text-muted-foreground"}>
                      €{spent.toFixed(2)} / €{budget.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        over ? "bg-destructive" : pct > 80 ? "bg-orange-500" : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
