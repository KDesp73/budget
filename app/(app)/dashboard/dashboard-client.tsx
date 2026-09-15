"use client";

import { useState, useCallback, useMemo } from "react";
import { getExpensesByDateRange, getPreviousPeriodData, getMultiPeriodTotals, getRecentExpenses, exportDateRangeCSV } from "@/app/actions/expenses";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Settings as SettingsIcon, ChevronLeft, ChevronRight, CircleCheck, TriangleAlert, AlertTriangle, TrendingDown } from "lucide-react";
import SpendingChart from "./spending-chart";
import CategoryPie from "./category-pie";
import CalendarGrid from "./calendar-grid";
import PreviousComparison from "./previous-comparison";
import TrendChart from "./trend-chart";
import RecentTransactions from "./recent-transactions";
import DayOfWeekChart from "./day-of-week-chart";
import type { DailyTotal, Expense, PeriodSummary } from "@/app/actions/expenses";
import type { Settings } from "@/app/actions/settings";
import { getBudgetDateRange, getPeriodLabel, getDaysInBudgetPeriod } from "@/lib/budget";

export default function DashboardClient({
  initialYear,
  initialMonth,
  initialData,
  initialSettings,
  initialMonthly,
  initialPreviousData,
  initialTrendData,
  initialRecentExpenses,
  initialCategories,
}: {
  initialYear: number;
  initialMonth: number;
  initialData: DailyTotal[];
  initialSettings: Settings;
  initialMonthly: Expense[];
  initialPreviousData: DailyTotal[];
  initialTrendData: PeriodSummary[];
  initialRecentExpenses: Expense[];
  initialCategories: string[];
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState(initialData);
  const [previousData, setPreviousData] = useState(initialPreviousData);
  const [trendData, setTrendData] = useState(initialTrendData);
  const [recentExpenses, setRecentExpenses] = useState(initialRecentExpenses);
  const [settings] = useState(initialSettings);
  const [monthlyExpenses] = useState(initialMonthly);
  const [categories] = useState(initialCategories);
  const paydayDay = settings.paydayDay || 1;

  const fetchPeriod = useCallback(async (y: number, m: number) => {
    const { startDate, endDate } = getBudgetDateRange(paydayDay, y, m);
    const [result, prevData, trend, recent] = await Promise.all([
      getExpensesByDateRange(startDate, endDate),
      getPreviousPeriodData(paydayDay, y, m),
      getMultiPeriodTotals(paydayDay, y, m, 6),
      getRecentExpenses(10),
    ]);
    setData(result);
    setPreviousData(prevData);
    setTrendData(trend);
    setRecentExpenses(recent);
  }, [paydayDay]);

  const goPrev = () => {
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchPeriod(newYear, newMonth);
  };

  const goNext = () => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchPeriod(newYear, newMonth);
  };

  const { startDate, endDate } = useMemo(() => getBudgetDateRange(paydayDay, year, month), [paydayDay, year, month]);
  const periodLabel = useMemo(() => getPeriodLabel(paydayDay, year, month), [paydayDay, year, month]);
  const daysInPeriod = useMemo(() => getDaysInBudgetPeriod(paydayDay, year, month), [paydayDay, year, month]);

  const totalThisPeriod = data.reduce((sum, d) => sum + d.total, 0);
  const savingsTarget = (settings.monthlySalary * settings.savingsPercentage) / 100;
  const remaining = settings.monthlySalary - totalThisPeriod;

  const today = new Date();
  const periodStart = new Date(startDate);
  const periodEnd = new Date(endDate);
  const isCurrentPeriod = today >= periodStart && today <= periodEnd;
  const currentDayOffset = isCurrentPeriod
    ? Math.round((today.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : daysInPeriod;
  const daysLeft = daysInPeriod - currentDayOffset;

  const dailyAvg = currentDayOffset > 0 ? totalThisPeriod / currentDayOffset : 0;
  const projectedTotal = dailyAvg * daysInPeriod;

  const categoryBudgetTotals = Object.fromEntries(
    Object.keys(settings.categoryBudgets).map((cat) => {
      const spent = data.reduce(
        (s, d) => s + d.expenses.filter((e) => e.name === cat).reduce((a, e) => a + e.amount, 0),
        0
      );
      return [cat, spent];
    })
  );

  const isOverCategoryBudget = Object.entries(settings.categoryBudgets).some(
    ([cat, budget]) => (categoryBudgetTotals[cat] ?? 0) > budget
  );

  const spentPct = settings.monthlySalary > 0 ? Math.min((totalThisPeriod / settings.monthlySalary) * 100, 100) : 0;

  const handleExport = async () => {
    const csv = await exportDateRangeCSV(startDate, endDate);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (settings.monthlySalary === 0 && monthlyExpenses.length === 0) {
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-xs" onClick={goPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[140px] text-center">{periodLabel}</span>
          <Button variant="ghost" size="icon-xs" onClick={goNext}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="xs" onClick={handleExport}>
            <Download className="mr-1 size-3.5" />
            CSV
          </Button>
        </div>
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
            <CardDescription>Savings ({settings.savingsPercentage}%)</CardDescription>
            <CardTitle className="text-2xl">
              €{savingsTarget.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Spent</CardDescription>
            <CardTitle className="text-2xl">
              €{totalThisPeriod.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${spentPct > 100 ? "bg-destructive" : spentPct > 80 ? "bg-orange-500" : "bg-primary"}`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {spentPct.toFixed(0)}% of salary
            </p>
          </CardContent>
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

      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <BudgetStatusHealth
              projectedTotal={projectedTotal}
              remaining={settings.monthlySalary}
              isOverCategoryBudget={isOverCategoryBudget}
            />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily average</span>
                <span className="font-semibold tabular-nums">€{dailyAvg.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projected total</span>
                <span className={`font-semibold tabular-nums ${projectedTotal > settings.monthlySalary ? "text-destructive" : ""}`}>
                  €{projectedTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Per day ({daysLeft}d left)</span>
                <span className="font-semibold tabular-nums">
                  €{daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : remaining.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Days with expenses</span>
                <span className="font-semibold tabular-nums">
                  {data.filter((d) => d.total > 0).length} / {daysInPeriod}
                </span>
              </div>
            </div>
            <PreviousComparison
              currentData={data}
              previousData={previousData}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingChart data={data} />
        </div>
        <div>
          <CategoryPie data={data} categories={categories} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CalendarGrid
            data={data}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
        <div className="lg:col-span-5">
          <RecentTransactions expenses={recentExpenses} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TrendChart data={trendData} />
        </div>
        <div className="lg:col-span-5">
          <DayOfWeekChart data={data} />
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

function BudgetStatusHealth({
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
  );
}
